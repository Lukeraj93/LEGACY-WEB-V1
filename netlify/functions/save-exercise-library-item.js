const { json, methodNotAllowed, noContent } = require("./_lib/http");
const {
  createHttpError,
  normalizeText,
  parseBody,
  requireAllowedRole,
  throwOnError,
} = require("./_lib/planner");
const { buildExerciseLibraryRow } = require("./_lib/exercise-library");
const { getAuthenticatedProfile, getServiceSupabase } = require("./_lib/supabase");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return noContent({ "Cache-Control": "no-store" });
  }

  if (!["POST", "PUT"].includes(event.httpMethod)) {
    return methodNotAllowed("POST, PUT, OPTIONS");
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

    const input = body.exercise || body;
    const exerciseId = normalizeText(input.id);
    const row = buildExerciseLibraryRow(input);

    if (!row.name) {
      throw createHttpError(400, "Exercise name is required.");
    }

    let savedExercise = null;
    if (exerciseId) {
      const updateResponse = await supabase
        .from("exercise_library")
        .update(row)
        .eq("id", exerciseId)
        .select("*")
        .single();
      throwOnError(updateResponse);
      savedExercise = updateResponse.data;
    } else {
      const existingResponse = await supabase
        .from("exercise_library")
        .select("*")
        .ilike("name", row.name)
        .limit(1)
        .maybeSingle();
      throwOnError(existingResponse);

      if (existingResponse.data?.id) {
        const updateResponse = await supabase
          .from("exercise_library")
          .update(row)
          .eq("id", existingResponse.data.id)
          .select("*")
          .single();
        throwOnError(updateResponse);
        savedExercise = updateResponse.data;
      } else {
        const insertResponse = await supabase
          .from("exercise_library")
          .insert(row)
          .select("*")
          .single();
        throwOnError(insertResponse);
        savedExercise = insertResponse.data;
      }
    }

    return json(
      200,
      {
        ok: true,
        exercise: savedExercise,
        message: exerciseId ? "Exercise library item updated." : "Exercise library item saved.",
      },
      { "Cache-Control": "no-store" }
    );
  } catch (error) {
    return json(
      Number(error?.statusCode || 500),
      { error: error?.message || "Unable to save the exercise library item right now." },
      { "Cache-Control": "no-store" }
    );
  }
};
