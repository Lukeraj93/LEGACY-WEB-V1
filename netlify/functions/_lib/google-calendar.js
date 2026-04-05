const { randomBytes } = require("crypto");
const { getBaseUrl } = require("./env");

const GOOGLE_AUTH_BASE = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_REVOKE_URL = "https://oauth2.googleapis.com/revoke";
const GOOGLE_CALENDAR_API_BASE = "https://www.googleapis.com/calendar/v3";
const GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";
const DEFAULT_TIMEZONE = "Asia/Kuala_Lumpur";
const OAUTH_TTL_MS = 15 * 60 * 1000;
const CONNECTION_KEY_PREFIX = "google-calendar-connection:";
const STATE_KEY_PREFIX = "google-calendar-oauth-state:";
const GOOGLE_SCOPES = ["openid", "email", "https://www.googleapis.com/auth/calendar.events"];

function isGoogleCalendarConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && getGoogleCalendarRedirectUri());
}

function getGoogleCalendarRedirectUri() {
  const explicitRedirectUri = String(process.env.GOOGLE_CALENDAR_REDIRECT_URI || "").trim();
  if (explicitRedirectUri) {
    return explicitRedirectUri.replace(/\/+$/, "");
  }

  const baseUrl = getBaseUrl();
  if (!baseUrl) {
    throw new Error("APP_BASE_URL or GOOGLE_CALENDAR_REDIRECT_URI is required for Google Calendar OAuth.");
  }

  return new URL("/.netlify/functions/google-calendar-callback", `${baseUrl}/`).toString();
}

function getConnectionKey(coachId) {
  return `${CONNECTION_KEY_PREFIX}${coachId}`;
}

function getStateKey(state) {
  return `${STATE_KEY_PREFIX}${state}`;
}

function createOAuthStateToken() {
  return randomBytes(24).toString("hex");
}

async function saveAppSetting(supabase, key, value, updatedBy) {
  const { error } = await supabase.from("app_settings").upsert(
    {
      key,
      value,
      updated_by: updatedBy || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" }
  );

  if (error) {
    throw error;
  }
}

async function deleteAppSetting(supabase, key) {
  const { error } = await supabase.from("app_settings").delete().eq("key", key);
  if (error) {
    throw error;
  }
}

async function loadCalendarConnection(supabase, coachId) {
  const { data, error } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", getConnectionKey(coachId))
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data?.value || null;
}

async function saveCalendarConnection(supabase, coachId, connection, updatedBy) {
  await saveAppSetting(supabase, getConnectionKey(coachId), connection, updatedBy);
}

async function deleteCalendarConnection(supabase, coachId) {
  await deleteAppSetting(supabase, getConnectionKey(coachId));
}

async function createOAuthState(supabase, coachId, returnPath, updatedBy) {
  const state = createOAuthStateToken();
  await saveAppSetting(
    supabase,
    getStateKey(state),
    {
      coachId,
      returnPath: sanitizeReturnPath(returnPath),
      createdAt: new Date().toISOString(),
    },
    updatedBy
  );
  return state;
}

async function consumeOAuthState(supabase, state) {
  const key = getStateKey(state);
  const { data, error } = await supabase.from("app_settings").select("value").eq("key", key).maybeSingle();
  if (error) {
    throw error;
  }

  await deleteAppSetting(supabase, key);

  const payload = data?.value || null;
  if (!payload?.coachId || !payload?.createdAt) {
    throw new Error("Google Calendar OAuth state is invalid.");
  }

  const createdAt = new Date(payload.createdAt).getTime();
  if (Number.isNaN(createdAt) || Date.now() - createdAt > OAUTH_TTL_MS) {
    throw new Error("Google Calendar OAuth state expired. Start the connection again.");
  }

  return payload;
}

function sanitizeReturnPath(returnPath) {
  const normalized = String(returnPath || "").trim();
  if (!normalized.startsWith("/") || normalized.startsWith("//")) {
    return "/coach-schedule.html";
  }

  return normalized;
}

function buildGoogleCalendarAuthUrl(state) {
  const url = new URL(GOOGLE_AUTH_BASE);
  url.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID || "");
  url.searchParams.set("redirect_uri", getGoogleCalendarRedirectUri());
  url.searchParams.set("response_type", "code");
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");
  url.searchParams.set("include_granted_scopes", "true");
  url.searchParams.set("scope", GOOGLE_SCOPES.join(" "));
  url.searchParams.set("state", state);
  return url.toString();
}

async function postForm(url, params) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(params),
  });

  const rawBody = await response.text();
  const payload = rawBody
    ? (() => {
        try {
          return JSON.parse(rawBody);
        } catch (_) {
          return {};
        }
      })()
    : {};
  if (!response.ok) {
    throw new Error(payload?.error_description || payload?.error || "Google Calendar request failed.");
  }

  return payload;
}

async function exchangeCodeForTokens(code) {
  return postForm(GOOGLE_TOKEN_URL, {
    code,
    client_id: process.env.GOOGLE_CLIENT_ID || "",
    client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
    redirect_uri: getGoogleCalendarRedirectUri(),
    grant_type: "authorization_code",
  });
}

async function refreshGoogleTokens(refreshToken) {
  return postForm(GOOGLE_TOKEN_URL, {
    refresh_token: refreshToken,
    client_id: process.env.GOOGLE_CLIENT_ID || "",
    client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
    grant_type: "refresh_token",
  });
}

function getTokenExpiryDate(expiresInSeconds) {
  const ttl = Number(expiresInSeconds || 0);
  return Date.now() + ttl * 1000;
}

function isConnectionExpiring(connection) {
  const expiresAt = Number(connection?.tokens?.expiresAt || 0);
  return !expiresAt || expiresAt <= Date.now() + 60 * 1000;
}

async function ensureValidConnection(connection) {
  if (!connection?.tokens?.accessToken) {
    throw new Error("Google Calendar is not connected for this coach.");
  }

  if (!isConnectionExpiring(connection)) {
    return connection;
  }

  if (!connection?.tokens?.refreshToken) {
    return connection;
  }

  const refreshed = await refreshGoogleTokens(connection.tokens.refreshToken);
  return {
    ...connection,
    tokens: {
      accessToken: refreshed.access_token,
      refreshToken: connection.tokens.refreshToken,
      expiresAt: getTokenExpiryDate(refreshed.expires_in),
      tokenType: refreshed.token_type || "Bearer",
    },
    refreshedAt: new Date().toISOString(),
  };
}

async function googleApiFetch(connection, path, options = {}) {
  const ensured = await ensureValidConnection(connection);
  const url = new URL(path, `${GOOGLE_CALENDAR_API_BASE}/`);
  const query = options.query || {};
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  const response = await fetch(url, {
    method: options.method || "GET",
    headers: {
      Authorization: `Bearer ${ensured.tokens.accessToken}`,
      ...(options.body
        ? {
            "Content-Type": "application/json",
          }
        : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (response.status === 204) {
    return { connection: ensured, data: null };
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 404 && options.allowNotFound) {
      return { connection: ensured, data: null, notFound: true };
    }

    const message =
      payload?.error?.message ||
      payload?.error_description ||
      payload?.error ||
      "Google Calendar request failed.";
    throw new Error(message);
  }

  return { connection: ensured, data: payload };
}

async function fetchGoogleCalendarIdentity(connection) {
  const ensured = await ensureValidConnection(connection);
  const response = await fetch(GOOGLE_USERINFO_URL, {
    headers: {
      Authorization: `Bearer ${ensured.tokens.accessToken}`,
    },
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error_description || payload?.error || "Unable to load the Google account identity.");
  }

  return {
    connection: ensured,
    email: payload?.email || "",
  };
}

function buildSessionEventResource(sessionContext) {
  const descriptionLines = [
    `LEGACY+ coaching session`,
    `Client: ${sessionContext.clientName || "Client"}`,
    sessionContext.packageName ? `Package: ${sessionContext.packageName}` : "",
    sessionContext.coachName ? `Coach: ${sessionContext.coachName}` : "",
    `Session ID: ${sessionContext.sessionId}`,
  ].filter(Boolean);

  return {
    summary: `LEGACY+ Coaching | ${sessionContext.clientName || "Client"}`,
    description: descriptionLines.join("\n"),
    start: {
      dateTime: sessionContext.scheduledStart,
      timeZone: sessionContext.timezone || DEFAULT_TIMEZONE,
    },
    end: {
      dateTime: sessionContext.scheduledEnd,
      timeZone: sessionContext.timezone || DEFAULT_TIMEZONE,
    },
    reminders: {
      useDefault: true,
    },
    extendedProperties: {
      private: {
        legacySessionId: sessionContext.sessionId,
        legacyClientId: sessionContext.clientId,
      },
    },
  };
}

async function upsertGoogleCalendarEvent(connection, sessionContext) {
  const eventBody = buildSessionEventResource(sessionContext);
  const calendarId = connection?.calendarId || "primary";
  const hasExistingEvent = Boolean(sessionContext.googleEventId);
  const path = hasExistingEvent
    ? `calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(sessionContext.googleEventId)}`
    : `calendars/${encodeURIComponent(calendarId)}/events`;

  const { connection: ensured, data } = await googleApiFetch(connection, path, {
    method: hasExistingEvent ? "PUT" : "POST",
    query: { sendUpdates: "none" },
    body: eventBody,
  });

  return { connection: ensured, event: data };
}

async function deleteGoogleCalendarEvent(connection, eventId) {
  if (!eventId) {
    return { connection };
  }

  const calendarId = connection?.calendarId || "primary";
  return googleApiFetch(connection, `calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`, {
    method: "DELETE",
    query: { sendUpdates: "none" },
    allowNotFound: true,
  });
}

async function revokeGoogleToken(token) {
  if (!token) {
    return;
  }

  await postForm(GOOGLE_REVOKE_URL, { token }).catch(() => null);
}

module.exports = {
  buildGoogleCalendarAuthUrl,
  consumeOAuthState,
  createOAuthState,
  deleteCalendarConnection,
  deleteGoogleCalendarEvent,
  exchangeCodeForTokens,
  fetchGoogleCalendarIdentity,
  getTokenExpiryDate,
  isGoogleCalendarConfigured,
  loadCalendarConnection,
  revokeGoogleToken,
  saveCalendarConnection,
  sanitizeReturnPath,
  upsertGoogleCalendarEvent,
};
