const { json, methodNotAllowed, noContent } = require("./_lib/http");
const { createHttpError, normalizeText, parseBody, requireAllowedRole, throwOnError } = require("./_lib/planner");
const { getAuthenticatedProfile, getServiceSupabase } = require("./_lib/supabase");

function isLedgerApproved(status) {
  return ["approved", "auto_approved"].includes(String(status || "").trim().toLowerCase());
}

function isLedgerRejected(status) {
  return String(status || "").trim().toLowerCase() === "rejected";
}

async function loadLinkedPlannerEvents(supabase, rewardId) {
  const [xpResponse, coinResponse] = await Promise.all([
    supabase
      .from("planner_reward_events")
      .select("*")
      .eq("xp_ledger_entry_id", rewardId),
    supabase
      .from("planner_reward_events")
      .select("*")
      .eq("coin_ledger_entry_id", rewardId),
  ]);

  [xpResponse, coinResponse].forEach(throwOnError);

  return Array.from(
    new Map(
      [...(xpResponse.data || []), ...(coinResponse.data || [])]
        .filter((item) => item?.id)
        .map((item) => [item.id, item])
    ).values()
  );
}

async function syncPlannerEventAwardState(supabase, reviewerProfile, rewardEvent, timestamp) {
  const linkedLedgerIds = [rewardEvent?.xp_ledger_entry_id, rewardEvent?.coin_ledger_entry_id].filter(Boolean);
  if (!rewardEvent?.id || !linkedLedgerIds.length) {
    return rewardEvent;
  }

  const ledgerResponse = await supabase
    .from("points_ledger")
    .select("id, approval_status")
    .in("id", linkedLedgerIds);
  throwOnError(ledgerResponse);

  const ledgerById = new Map((ledgerResponse.data || []).map((row) => [row.id, row]));
  const statuses = linkedLedgerIds
    .map((ledgerId) => ledgerById.get(ledgerId)?.approval_status)
    .filter(Boolean);

  let nextStatus = rewardEvent.approval_status;
  if (statuses.some((status) => isLedgerRejected(status))) {
    nextStatus = "rejected";
  } else if (statuses.length && statuses.every((status) => isLedgerApproved(status))) {
    nextStatus = "awarded";
  } else if (statuses.some((status) => isLedgerApproved(status)) || rewardEvent.approval_status === "approved") {
    nextStatus = "approved";
  }

  const updatePayload = {
    approval_status: nextStatus,
    approved_by: reviewerProfile.id,
    approved_at: timestamp,
  };

  const updateResponse = await supabase
    .from("planner_reward_events")
    .update(updatePayload)
    .eq("id", rewardEvent.id)
    .select("*")
    .single();
  throwOnError(updateResponse);

  return updateResponse.data;
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return noContent({ "Cache-Control": "no-store" });
  }

  if (event.httpMethod !== "POST") {
    return methodNotAllowed("POST, OPTIONS");
  }

  const body = parseBody(event);
  if (!body) {
    return json(400, { error: "Provide a valid JSON body." });
  }

  const supabase = getServiceSupabase();
  const auth = await getAuthenticatedProfile(event, supabase);
  if (!auth?.profile) {
    return json(401, { error: "A valid authenticated session is required." });
  }

  try {
    requireAllowedRole(auth.profile, ["super_admin"]);

    const rewardId = normalizeText(body.rewardId || body.reward_id || body.id);
    const action = normalizeText(body.action || body.decision).toLowerCase();
    if (!rewardId) {
      throw createHttpError(400, "A reward ID is required.");
    }
    if (!["approve", "reject"].includes(action)) {
      throw createHttpError(400, "Unsupported reward review action.");
    }

    const approvedAt = new Date().toISOString();
    const rewardResponse = await supabase
      .from("points_ledger")
      .update({
        approval_status: action === "approve" ? "approved" : "rejected",
        approved_by: auth.profile.id,
        approved_at: approvedAt,
      })
      .eq("id", rewardId)
      .select("*")
      .single();
    throwOnError(rewardResponse);

    const linkedPlannerEvents = await loadLinkedPlannerEvents(supabase, rewardId);
    const syncedPlannerEvents = [];
    for (const plannerEvent of linkedPlannerEvents) {
      syncedPlannerEvents.push(await syncPlannerEventAwardState(supabase, auth.profile, plannerEvent, approvedAt));
    }

    return json(200, {
      ok: true,
      reward: rewardResponse.data,
      plannerRewardEvents: syncedPlannerEvents,
      message: action === "approve" ? "Reward request approved." : "Reward request rejected.",
    });
  } catch (error) {
    return json(Number(error?.statusCode || 500), {
      error: error?.message || "Unable to review the reward request right now.",
    });
  }
};
