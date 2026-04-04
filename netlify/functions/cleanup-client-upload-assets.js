const { json, methodNotAllowed, noContent } = require("./_lib/http");
const {
  createHttpError,
  normalizeText,
  parseBody,
  requireAllowedRole,
  requireManagedClientAccess,
} = require("./_lib/planner");
const { getAuthenticatedProfile, getServiceSupabase } = require("./_lib/supabase");

const ALLOWED_BUCKETS = new Set(["client-progress-photos", "client-meal-photos"]);

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
    requireAllowedRole(auth.profile, ["client", "coach", "super_admin"]);

    const bucket = normalizeText(body.bucket);
    if (!ALLOWED_BUCKETS.has(bucket)) {
      throw createHttpError(400, "Unsupported upload bucket.");
    }

    const clientId =
      auth.profile.role === "client"
        ? auth.profile.id
        : normalizeText(body.clientId || body.client_id);

    if (!clientId) {
      throw createHttpError(400, "Client ID is required.");
    }

    await requireManagedClientAccess(supabase, auth.profile, clientId);

    const paths = Array.isArray(body.paths)
      ? body.paths
          .map((value) => String(value || "").trim())
          .filter((value) => value && value.startsWith(`${clientId}/`))
      : [];

    if (!paths.length) {
      return json(200, { ok: true, removedCount: 0 });
    }

    const uniquePaths = [...new Set(paths)];
    const { error } = await supabase.storage.from(bucket).remove(uniquePaths);
    if (error) {
      throw error;
    }

    return json(200, {
      ok: true,
      removedCount: uniquePaths.length,
    });
  } catch (error) {
    return json(Number(error?.statusCode || 500), {
      error: error?.message || "Unable to clean up the uploaded files right now.",
    });
  }
};
