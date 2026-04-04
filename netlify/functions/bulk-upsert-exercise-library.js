const { json, methodNotAllowed, noContent } = require("./_lib/http");
const {
  createHttpError,
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

    const items = Array.isArray(body.items) ? body.items : [];
    if (!items.length) {
      throw createHttpError(400, "Provide at least one exercise library row to import.");
    }

    const results = [];
    for (const item of items) {
      const row = buildExerciseLibraryRow(item);
      if (!row.name || !row.video_url) {
        continue;
      }

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
          .select("id, name, video_url")
          .single();
        throwOnError(updateResponse);
        results.push({ ...updateResponse.data, status: "updated" });
      } else {
        const insertResponse = await supabase
          .from("exercise_library")
          .insert(row)
          .select("id, name, video_url")
          .single();
        throwOnError(insertResponse);
        results.push({ ...insertResponse.data, status: "created" });
      }
    }

    return json(
      200,
      {
        ok: true,
        importedCount: results.length,
        results,
        message: `${results.length} exercise demo link${results.length === 1 ? "" : "s"} imported.`,
      },
      { "Cache-Control": "no-store" }
    );
  } catch (error) {
    return json(
      Number(error?.statusCode || 500),
      { error: error?.message || "Unable to import the exercise library links right now." },
      { "Cache-Control": "no-store" }
    );
  }
};
