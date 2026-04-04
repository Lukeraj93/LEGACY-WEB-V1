const { json, methodNotAllowed, noContent } = require("./_lib/http");
const {
  approvePlannerRewardEvent,
  createHttpError,
  normalizeNullableText,
  normalizeText,
  parseBody,
  rejectPlannerRewardEvent,
  requireAllowedRole,
  requireManagedClientAccess,
  throwOnError,
} = require("./_lib/planner");
const { getAuthenticatedProfile, getServiceSupabase } = require("./_lib/supabase");

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
    requireAllowedRole(auth.profile, ["coach", "super_admin"]);

    const eventId = normalizeText(body.eventId || body.event_id);
    const decision = normalizeText(body.decision || "approve").toLowerCase();
    if (!eventId) {
      throw createHttpError(400, "Planner reward event ID is required.");
    }

    const eventResponse = await supabase.from("planner_reward_events").select("*").eq("id", eventId).maybeSingle();
    throwOnError(eventResponse);
    const rewardEvent = eventResponse.data;
    if (!rewardEvent?.id) {
      throw createHttpError(404, "Planner reward event not found.");
    }

    await requireManagedClientAccess(supabase, auth.profile, rewardEvent.client_id);

    if (decision === "reject") {
      const rejectResult = await rejectPlannerRewardEvent(
        supabase,
        auth.profile,
        rewardEvent,
        normalizeNullableText(body.reason) || rewardEvent.reason
      );

      return json(200, {
        ok: true,
        event: rejectResult?.event || rewardEvent,
        message: rejectResult?.blocked
          ? "Planner reward event could not be rejected because it was already awarded."
          : "Planner reward event rejected.",
      });
    }

    if (decision !== "approve") {
      throw createHttpError(400, "Unsupported planner review decision.");
    }

    const approveResult = await approvePlannerRewardEvent(
      supabase,
      auth.profile,
      rewardEvent,
      normalizeNullableText(body.reason) || rewardEvent.reason
    );

    return json(200, {
      ok: true,
      event: approveResult.event,
      ledger: approveResult.ledger,
      message:
        auth.profile.role === "super_admin"
          ? "Planner reward approved and auto-awarded."
          : "Planner reward approved and submitted to the points ledger.",
    });
  } catch (error) {
    return json(Number(error?.statusCode || 500), {
      error: error?.message || "Unable to review the planner reward event right now.",
    });
  }
};
