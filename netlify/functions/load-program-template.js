const { json, methodNotAllowed, noContent } = require("./_lib/http");
const {
  createHttpError,
  loadProgramTemplateGraph,
  normalizeText,
  requireAllowedRole,
} = require("./_lib/planner");
const { getAuthenticatedProfile, getServiceSupabase } = require("./_lib/supabase");

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

    const templateId = normalizeText(
      event.queryStringParameters?.templateId || event.queryStringParameters?.id
    );
    if (!templateId) {
      throw createHttpError(400, "Choose a program template before opening it.");
    }

    const graph = await loadProgramTemplateGraph(supabase, templateId);
    if (!graph.template?.id) {
      throw createHttpError(404, "Program template not found.");
    }

    if (
      String(auth.profile.role || "").toLowerCase() === "coach"
      && String(graph.template.coach_id || "") !== String(auth.profile.id || "")
    ) {
      throw createHttpError(403, "You can only load your own program templates.");
    }

    return json(
      200,
      {
        ok: true,
        graph,
        message: "Training template loaded.",
      },
      { "Cache-Control": "no-store" }
    );
  } catch (error) {
    return json(
      Number(error?.statusCode || 500),
      { error: error?.message || "Unable to load the program template right now." },
      { "Cache-Control": "no-store" }
    );
  }
};
