const { json, methodNotAllowed, noContent } = require("./_lib/http");
const { getServiceSupabase } = require("./_lib/supabase");
const { fetchModuleSnapshot, requireSuperAdminAccess } = require("./_lib/xp-coach");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return noContent();
  }

  if (event.httpMethod !== "GET") {
    return methodNotAllowed("GET, OPTIONS");
  }

  try {
    const supabase = getServiceSupabase();
    const accessResult = await requireSuperAdminAccess(event, supabase);
    if (!accessResult.ok) {
      return accessResult.response;
    }

    const snapshot = await fetchModuleSnapshot(supabase);
    return json(200, {
      ok: true,
      snapshot,
    });
  } catch (error) {
    return json(500, {
      error: error?.message || "Unable to load the Coach XP dashboard.",
    });
  }
};
