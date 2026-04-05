const { json, methodNotAllowed, noContent } = require("./_lib/http");
const { getAuthenticatedProfile, getServiceSupabase } = require("./_lib/supabase");
const { createHttpError, requireWearableClientAccess } = require("./_lib/wearables");
const { buildStravaAuthUrl, createOAuthState, isStravaConfigured, sanitizeReturnPath } = require("./_lib/strava");

function parseBody(event) {
  try {
    return JSON.parse(event.body || "{}");
  } catch (_) {
    return null;
  }
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return noContent();
  }

  if (event.httpMethod !== "POST") {
    return methodNotAllowed("POST, OPTIONS");
  }

  if (!isStravaConfigured()) {
    return json(400, { error: "Strava credentials are not configured yet." });
  }

  const body = parseBody(event);
  if (!body) {
    return json(400, { error: "Request body must be valid JSON." });
  }

  try {
    const supabase = getServiceSupabase();
    const access = await getAuthenticatedProfile(event, supabase);
    if (!access) {
      return json(401, { error: "A valid authenticated session is required." });
    }

    const clientId = await requireWearableClientAccess(supabase, access.profile, body.client_id || body.clientId);
    if (!clientId) {
      throw createHttpError(400, "client_id is required.");
    }

    const returnPath = sanitizeReturnPath(body.returnPath || "/client-settings.html");
    const state = await createOAuthState(supabase, clientId, returnPath, access.profile.id);

    return json(200, {
      ok: true,
      authUrl: buildStravaAuthUrl(state),
      returnPath,
      clientId,
    });
  } catch (error) {
    return json(Number(error?.statusCode || 500), {
      error: error?.message || "Unable to start Strava authentication.",
    });
  }
};
