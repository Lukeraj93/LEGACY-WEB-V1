const { json, methodNotAllowed, noContent } = require("./_lib/http");
const { getServiceSupabase } = require("./_lib/supabase");
const { parseBody, requireSuperAdminAccess, writeXpCoachAuditLog, xpSchema } = require("./_lib/xp-coach");
const { normalizeBooleanLike } = require("../../XP coach gamification/Config/coach-xp-engine.js");

const CAP_PERIODS = new Set(["None", "Weekly", "Monthly", "Quarterly", "Yearly", "OneTime"]);

function normalizeActionPayload(input) {
  const actionId = String(input?.action_id || input?.actionId || "").trim().toUpperCase();
  const actionName = String(input?.action_name || input?.actionName || "").trim();
  const bucket = String(input?.bucket || "").trim();
  const capPeriod = String(input?.cap_period || input?.capPeriod || "None").trim();
  const xpPer = Number(input?.xp_per ?? input?.xpPer ?? 0);
  const cooldownDays = Number(input?.cooldown_days ?? input?.cooldownDays ?? 0);
  const capMaxXp = input?.cap_max_xp == null && input?.capMaxXp == null ? null : Number(input?.cap_max_xp ?? input?.capMaxXp);
  const verification = String(input?.verification || "").trim() || null;
  const isActive = normalizeBooleanLike(input?.is_active ?? input?.isActive ?? true);

  if (!actionId) {
    throw new Error("Action ID is required.");
  }
  if (!actionName) {
    throw new Error("Action name is required.");
  }
  if (!bucket) {
    throw new Error("Bucket is required.");
  }
  if (!CAP_PERIODS.has(capPeriod)) {
    throw new Error("Cap period is invalid.");
  }
  if (!Number.isFinite(xpPer) || xpPer < 0) {
    throw new Error("XP per action must be zero or greater.");
  }
  if (!Number.isFinite(cooldownDays) || cooldownDays < 0) {
    throw new Error("Cooldown days must be zero or greater.");
  }

  return {
    action_id: actionId,
    action_name: actionName,
    bucket,
    xp_per: Math.round(xpPer),
    cap_period: capPeriod,
    cap_max_xp: capMaxXp == null || Number.isNaN(capMaxXp) ? null : Math.round(capMaxXp),
    cooldown_days: Math.round(cooldownDays),
    verification,
    is_active: isActive,
  };
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return noContent();
  }

  if (!["GET", "POST"].includes(event.httpMethod)) {
    return methodNotAllowed("GET, POST, OPTIONS");
  }

  try {
    const supabase = getServiceSupabase();
    const accessResult = await requireSuperAdminAccess(event, supabase);
    if (!accessResult.ok) {
      return accessResult.response;
    }

    if (event.httpMethod === "GET") {
      const response = await xpSchema(supabase).from("actions").select("*").order("bucket", { ascending: true }).order("action_id", { ascending: true });
      if (response.error) {
        throw response.error;
      }
      return json(200, {
        ok: true,
        actions: response.data || [],
      });
    }

    const body = parseBody(event);
    if (!body) {
      return json(400, { error: "Invalid JSON body." });
    }

    const action = normalizeActionPayload(body.action || body);
    const response = await xpSchema(supabase).from("actions").upsert(action, {
      onConflict: "action_id",
    }).select("*").single();

    if (response.error) {
      throw response.error;
    }

    await writeXpCoachAuditLog(supabase, accessResult.access.profile.id, "xp_coach_action_upsert", {
      entityId: action.action_id,
      action,
    });

    return json(200, {
      ok: true,
      action: response.data,
    });
  } catch (error) {
    return json(500, {
      error: error?.message || "Unable to manage Coach XP actions.",
    });
  }
};
