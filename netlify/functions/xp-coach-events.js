const { json, methodNotAllowed, noContent } = require("./_lib/http");
const { getServiceSupabase } = require("./_lib/supabase");
const { parseBody, requireSuperAdminAccess, writeXpCoachAuditLog, xpSchema } = require("./_lib/xp-coach");
const { toIsoDateString, normalizeBooleanLike } = require("../../XP coach gamification/Config/coach-xp-engine.js");

function normalizeEventPayload(input, actorId) {
  const eventDate = toIsoDateString(input?.event_date || input?.eventDate);
  const coachId = String(input?.coach_id || input?.coachId || "").trim().toUpperCase();
  const actionId = String(input?.action_id || input?.actionId || "").trim().toUpperCase();
  const qty = Number(input?.qty ?? 1);
  const xpOverride = input?.xp_override == null && input?.xpOverride == null ? null : Number(input?.xp_override ?? input?.xpOverride);
  const evidence = String(input?.evidence || "").trim() || null;
  const notes = String(input?.notes || "").trim() || null;

  if (!eventDate) {
    throw new Error("Event date is required.");
  }
  if (!coachId) {
    throw new Error("Coach is required.");
  }
  if (!actionId) {
    throw new Error("Action is required.");
  }
  if (!Number.isFinite(qty) || qty <= 0) {
    throw new Error("Quantity must be greater than zero.");
  }

  return {
    event_date: eventDate,
    coach_id: coachId,
    action_id: actionId,
    qty,
    verified: normalizeBooleanLike(input?.verified ?? true),
    evidence,
    notes,
    created_by_profile_id: actorId || null,
    xp_override: xpOverride == null || Number.isNaN(xpOverride) ? null : Math.round(xpOverride),
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
      const [events, coaches, actions] = await Promise.all([
        xpSchema(supabase).from("event_scored_view").select("*").order("event_date", { ascending: false }).order("created_at", { ascending: false }).limit(200),
        xpSchema(supabase).from("coaches").select("coach_id, coach_name, status").order("coach_name", { ascending: true }),
        xpSchema(supabase).from("actions").select("action_id, action_name, bucket, is_active").order("bucket", { ascending: true }).order("action_name", { ascending: true }),
      ]);

      if (events.error) throw events.error;
      if (coaches.error) throw coaches.error;
      if (actions.error) throw actions.error;

      return json(200, {
        ok: true,
        events: events.data || [],
        coachOptions: coaches.data || [],
        actionOptions: actions.data || [],
      });
    }

    const body = parseBody(event);
    if (!body) {
      return json(400, { error: "Invalid JSON body." });
    }

    const xpEvent = normalizeEventPayload(body.event || body, accessResult.access.profile.id);
    const response = await xpSchema(supabase).from("events").insert(xpEvent).select("*").single();
    if (response.error) {
      throw response.error;
    }

    await writeXpCoachAuditLog(supabase, accessResult.access.profile.id, "xp_coach_event_insert", {
      entityId: response.data.id,
      event: xpEvent,
    });

    return json(200, {
      ok: true,
      event: response.data,
    });
  } catch (error) {
    return json(500, {
      error: error?.message || "Unable to manage Coach XP events.",
    });
  }
};
