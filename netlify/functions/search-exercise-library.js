const { json, methodNotAllowed, noContent } = require("./_lib/http");
const { requireAllowedRole, throwOnError } = require("./_lib/planner");
const { getAuthenticatedProfile, getServiceSupabase } = require("./_lib/supabase");

function normalizeText(value) {
  return String(value || "").trim();
}

function normalizeInteger(value, fallback = 12) {
  const parsed = Number.parseInt(String(value || ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function buildSearchHaystack(exercise) {
  return [
    exercise.name,
    exercise.body_part,
    exercise.exercise_type,
    exercise.notes,
    exercise.description,
    exercise.instructions,
    ...(Array.isArray(exercise.tags) ? exercise.tags : []),
    ...(Array.isArray(exercise.equipment_needed) ? exercise.equipment_needed : []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return noContent({ "Cache-Control": "no-store" });
  }

  if (event.httpMethod !== "GET") {
    return methodNotAllowed("GET, OPTIONS");
  }

  const supabase = getServiceSupabase();
  const auth = await getAuthenticatedProfile(event, supabase);
  if (!auth?.profile) {
    return json(401, { error: "A valid authenticated session is required." }, { "Cache-Control": "no-store" });
  }

  try {
    requireAllowedRole(auth.profile, ["coach", "super_admin"]);

    const query = normalizeText(
      event.queryStringParameters?.q
      || event.queryStringParameters?.query
    ).toLowerCase();
    const limit = Math.min(40, normalizeInteger(event.queryStringParameters?.limit, 16));

    const response = await supabase
      .from("exercise_library")
      .select("*")
      .eq("is_active", true)
      .order("updated_at", { ascending: false })
      .limit(Math.max(limit * 6, 120));
    throwOnError(response);

    const tokens = query ? query.split(/\s+/u).filter(Boolean) : [];
    const exercises = (response.data || [])
      .filter((exercise) => {
        if (!tokens.length) {
          return true;
        }
        const haystack = buildSearchHaystack(exercise);
        return tokens.every((token) => haystack.includes(token));
      })
      .slice(0, limit)
      .map((exercise) => ({
        id: exercise.id,
        sourceExerciseId: exercise.source_exercise_id || "",
        name: exercise.name,
        bodyPart: exercise.body_part || "",
        exerciseType: exercise.exercise_type || "",
        difficulty: exercise.difficulty || "",
        videoUrl: exercise.video_url || "",
        autoplayVideo: Boolean(exercise.autoplay_video),
        tags: Array.isArray(exercise.tags) ? exercise.tags : [],
        equipmentNeeded: Array.isArray(exercise.equipment_needed) ? exercise.equipment_needed : [],
        targetMuscles: Array.isArray(exercise.target_muscles) ? exercise.target_muscles : [],
        notes: exercise.notes || "",
        description: exercise.description || "",
        instructions: exercise.instructions || "",
        customFields: exercise.custom_fields && typeof exercise.custom_fields === "object" ? exercise.custom_fields : {},
      }));

    return json(
      200,
      { ok: true, exercises },
      { "Cache-Control": "no-store" }
    );
  } catch (error) {
    return json(
      Number(error?.statusCode || 500),
      { error: error?.message || "Unable to search the exercise library right now." },
      { "Cache-Control": "no-store" }
    );
  }
};
