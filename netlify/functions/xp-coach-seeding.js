const { json, methodNotAllowed, noContent } = require("./_lib/http");
const { getServiceSupabase } = require("./_lib/supabase");
const { parseBody, requireSuperAdminAccess, writeXpCoachAuditLog, xpSchema } = require("./_lib/xp-coach");

function normalizeSeedingPayload(input, actorId) {
  const coachId = String(input?.coach_id || input?.coachId || "").trim().toUpperCase();
  const seedXp = Number(input?.seed_xp ?? input?.seedXp ?? 0);
  const approved = input?.approved === true || input?.approved === "true" || input?.approved === "Yes";
  const notes = String(input?.notes || "").trim() || null;

  if (!coachId) {
    throw new Error("Coach is required.");
  }
  if (!Number.isFinite(seedXp) || seedXp < 0) {
    throw new Error("Seed XP must be zero or greater.");
  }

  return {
    coach_id: coachId,
    seed_xp: Math.round(seedXp),
    approved,
    notes,
    created_by_profile_id: actorId || null,
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
      const [seeding, coaches, events] = await Promise.all([
        xpSchema(supabase).from("seeding").select("*").order("created_at", { ascending: false }),
        xpSchema(supabase).from("coaches").select("coach_id, coach_name").order("coach_name", { ascending: true }),
        xpSchema(supabase).from("events").select("id, coach_id, action_id, xp_override, verified, evidence, created_at").eq("action_id", "SEED-INIT").order("created_at", { ascending: false }),
      ]);

      if (seeding.error) throw seeding.error;
      if (coaches.error) throw coaches.error;
      if (events.error) throw events.error;

      return json(200, {
        ok: true,
        seeding: seeding.data || [],
        coachOptions: coaches.data || [],
        seedEvents: events.data || [],
      });
    }

    const body = parseBody(event);
    if (!body) {
      return json(400, { error: "Invalid JSON body." });
    }

    const seed = normalizeSeedingPayload(body.seed || body, accessResult.access.profile.id);
    const response = await xpSchema(supabase).from("seeding").upsert(seed, {
      onConflict: "coach_id",
    }).select("*").single();

    if (response.error) {
      throw response.error;
    }

    await writeXpCoachAuditLog(supabase, accessResult.access.profile.id, "xp_coach_seed_upsert", {
      entityId: response.data.id,
      seed,
    });

    return json(200, {
      ok: true,
      seed: response.data,
    });
  } catch (error) {
    return json(500, {
      error: error?.message || "Unable to manage Coach XP seeding.",
    });
  }
};
