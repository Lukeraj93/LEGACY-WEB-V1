const { json, methodNotAllowed, noContent } = require("./_lib/http");
const { buildGoogleCalendarAuthUrl, createOAuthState, isGoogleCalendarConfigured, sanitizeReturnPath } = require("./_lib/google-calendar");
const { getAuthenticatedProfile, getServiceSupabase } = require("./_lib/supabase");

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

  if (!isGoogleCalendarConfigured()) {
    return json(400, { error: "Google Calendar credentials are not configured yet." });
  }

  const body = parseBody(event);
  if (!body) {
    return json(400, { error: "Request body must be valid JSON." });
  }

  try {
    const supabase = getServiceSupabase();
    const access = await getAuthenticatedProfile(event, supabase);
    if (!access) {
      return json(401, { error: "A valid coach session is required." });
    }

    if (access.profile.role !== "coach" && access.profile.role !== "super_admin") {
      return json(403, { error: "Only coach accounts can connect Google Calendar." });
    }

    const returnPath = sanitizeReturnPath(body.returnPath || "/coach-schedule.html");
    const state = await createOAuthState(supabase, access.profile.id, returnPath, access.profile.id);

    return json(200, {
      authUrl: buildGoogleCalendarAuthUrl(state),
      returnPath,
    });
  } catch (error) {
    return json(500, { error: error?.message || "Unable to start Google Calendar authentication." });
  }
};
