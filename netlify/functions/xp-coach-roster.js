const { json, methodNotAllowed, noContent } = require("./_lib/http");
const { getServiceSupabase } = require("./_lib/supabase");
const { parseBody, requireSuperAdminAccess, writeXpCoachAuditLog, xpSchema } = require("./_lib/xp-coach");

const ROLE_OPTIONS = new Set(["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9"]);
const IDENTITY_OPTIONS = new Set(["Greek", "Aesir", "Neutral"]);
const STATUS_OPTIONS = new Set(["Active", "Inactive"]);

function normalizeCoachPayload(input) {
  const coachId = String(input?.coach_id || input?.coachId || "").trim().toUpperCase();
  const coachName = String(input?.coach_name || input?.coachName || "").trim();
  const status = String(input?.status || "Active").trim();
  const identityPath = String(input?.identity_path || input?.identityPath || "Neutral").trim();
  const operationalRole = String(input?.operational_role || input?.operationalRole || "").trim() || null;
  const roleLockedTo = String(input?.role_locked_to || input?.roleLockedTo || "").trim() || null;
  const profileId = String(input?.profile_id || input?.profileId || "").trim() || null;

  if (!coachId) {
    throw new Error("Coach ID is required.");
  }

  if (!coachName) {
    throw new Error("Coach name is required.");
  }

  if (!STATUS_OPTIONS.has(status)) {
    throw new Error("Status must be Active or Inactive.");
  }

  if (!IDENTITY_OPTIONS.has(identityPath)) {
    throw new Error("Identity path must be Greek, Aesir, or Neutral.");
  }

  if (operationalRole && !ROLE_OPTIONS.has(operationalRole)) {
    throw new Error("Operational role must be between T1 and T9.");
  }

  if (roleLockedTo && !ROLE_OPTIONS.has(roleLockedTo)) {
    throw new Error("Role lock must be between T1 and T9.");
  }

  return {
    coach_id: coachId,
    coach_name: coachName,
    status,
    identity_path: identityPath,
    operational_role: operationalRole,
    role_locked_to: roleLockedTo,
    profile_id: profileId,
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
      const [coaches, profiles] = await Promise.all([
        xpSchema(supabase).from("coach_overview_view").select("*").order("total_xp_counted", { ascending: false }),
        supabase.from("profiles").select("id, display_name, role, status").eq("role", "coach").order("display_name", { ascending: true }),
      ]);

      if (coaches.error) {
        throw coaches.error;
      }
      if (profiles.error) {
        throw profiles.error;
      }

      return json(200, {
        ok: true,
        coaches: coaches.data || [],
        profileOptions: profiles.data || [],
      });
    }

    const body = parseBody(event);
    if (!body) {
      return json(400, { error: "Invalid JSON body." });
    }

    const coach = normalizeCoachPayload(body.coach || body);
    const response = await xpSchema(supabase).from("coaches").upsert(coach, {
      onConflict: "coach_id",
    }).select("*").single();

    if (response.error) {
      throw response.error;
    }

    await writeXpCoachAuditLog(supabase, accessResult.access.profile.id, "xp_coach_roster_upsert", {
      entityId: coach.coach_id,
      coach,
    });

    return json(200, {
      ok: true,
      coach: response.data,
    });
  } catch (error) {
    return json(500, {
      error: error?.message || "Unable to manage the coach roster.",
    });
  }
};
