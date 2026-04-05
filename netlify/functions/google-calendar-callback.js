const { getBaseUrl } = require("./_lib/env");
const {
  consumeOAuthState,
  exchangeCodeForTokens,
  fetchGoogleCalendarIdentity,
  getTokenExpiryDate,
  isGoogleCalendarConfigured,
  loadCalendarConnection,
  saveCalendarConnection,
} = require("./_lib/google-calendar");
const { getServiceSupabase } = require("./_lib/supabase");

function buildRedirect(pathname, params = {}) {
  const baseUrl = getBaseUrl();
  const fallbackBase = baseUrl || "http://localhost";
  const url = new URL(pathname, `${fallbackBase}/`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  if (!baseUrl) {
    return url.pathname + url.search;
  }

  return url.toString();
}

exports.handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      headers: { Allow: "GET" },
      body: "Method not allowed.",
    };
  }

  if (!isGoogleCalendarConfigured()) {
    return {
      statusCode: 302,
      headers: {
        Location: buildRedirect("/coach-schedule.html", {
          calendar: "error",
          message: "Google Calendar credentials are not configured yet.",
        }),
      },
      body: "",
    };
  }

  const params = new URLSearchParams(event.queryStringParameters || {});
  const state = String(params.get("state") || "").trim();
  const code = String(params.get("code") || "").trim();
  const error = String(params.get("error") || "").trim();

  if (!state || error || !code) {
    return {
      statusCode: 302,
      headers: {
        Location: buildRedirect("/coach-schedule.html", {
          calendar: "error",
          message: error || "Google Calendar authentication was cancelled.",
        }),
      },
      body: "",
    };
  }

  try {
    const supabase = getServiceSupabase();
    const oauthState = await consumeOAuthState(supabase, state);
    const existingConnection = await loadCalendarConnection(supabase, oauthState.coachId).catch(() => null);
    const tokenPayload = await exchangeCodeForTokens(code);
    const baseConnection = {
      provider: "google",
      calendarId: "primary",
      connectedAt: new Date().toISOString(),
      tokens: {
        accessToken: tokenPayload.access_token,
        refreshToken: tokenPayload.refresh_token || existingConnection?.tokens?.refreshToken || "",
        expiresAt: getTokenExpiryDate(tokenPayload.expires_in),
        tokenType: tokenPayload.token_type || "Bearer",
      },
    };
    const identity = await fetchGoogleCalendarIdentity(baseConnection);
    const finalConnection = {
      ...baseConnection,
      email: identity.email || existingConnection?.email || "",
    };

    await saveCalendarConnection(supabase, oauthState.coachId, finalConnection, oauthState.coachId);

    const { error: coachProfileError } = await supabase
      .from("coach_profiles")
      .update({
        google_calendar_email: finalConnection.email || null,
        calendar_sync_enabled: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", oauthState.coachId);

    if (coachProfileError) {
      throw coachProfileError;
    }

    return {
      statusCode: 302,
      headers: {
        Location: buildRedirect(oauthState.returnPath || "/coach-schedule.html", {
          calendar: "connected",
        }),
      },
      body: "",
    };
  } catch (caughtError) {
    return {
      statusCode: 302,
      headers: {
        Location: buildRedirect("/coach-schedule.html", {
          calendar: "error",
          message: caughtError?.message || "Unable to finish Google Calendar authentication.",
        }),
      },
      body: "",
    };
  }
};
