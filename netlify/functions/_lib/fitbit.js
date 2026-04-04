const { randomBytes } = require("crypto");

const { getBaseUrl, requireEnv } = require("./env");
const { syncWearableMetrics, upsertWearableConnection } = require("./wearables");

const FITBIT_AUTH_URL = "https://www.fitbit.com/oauth2/authorize";
const FITBIT_TOKEN_URL = "https://api.fitbit.com/oauth2/token";
const FITBIT_REVOKE_URL = "https://api.fitbit.com/oauth2/revoke";
const FITBIT_API_BASE = "https://api.fitbit.com";
const OAUTH_TTL_MS = 15 * 60 * 1000;
const CONNECTION_KEY_PREFIX = "fitbit-connection:";
const STATE_KEY_PREFIX = "fitbit-oauth-state:";
const FITBIT_SCOPES = ["activity", "heartrate", "profile", "sleep"];

function isFitbitConfigured() {
  return Boolean(process.env.FITBIT_CLIENT_ID && process.env.FITBIT_CLIENT_SECRET && getBaseUrl());
}

function getFitbitClientId() {
  return requireEnv("FITBIT_CLIENT_ID");
}

function getFitbitClientSecret() {
  return requireEnv("FITBIT_CLIENT_SECRET");
}

function getFitbitRedirectUri() {
  const baseUrl = getBaseUrl();
  if (!baseUrl) {
    throw new Error("APP_BASE_URL is required for Fitbit OAuth.");
  }

  return new URL("/.netlify/functions/fitbit-callback", `${baseUrl}/`).toString();
}

function getConnectionKey(clientId) {
  return `${CONNECTION_KEY_PREFIX}${clientId}`;
}

function getStateKey(state) {
  return `${STATE_KEY_PREFIX}${state}`;
}

function createOAuthStateToken() {
  return randomBytes(24).toString("hex");
}

function sanitizeReturnPath(returnPath) {
  const normalized = String(returnPath || "").trim();
  if (!normalized.startsWith("/") || normalized.startsWith("//")) {
    return "/client-settings.html";
  }

  return normalized;
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

async function loadFitbitConnection(supabase, clientId) {
  const { data, error } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", getConnectionKey(clientId))
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data?.value || null;
}

async function saveFitbitConnection(supabase, clientId, connection, updatedBy) {
  await saveAppSetting(supabase, getConnectionKey(clientId), connection, updatedBy);
}

async function deleteFitbitConnection(supabase, clientId) {
  await deleteAppSetting(supabase, getConnectionKey(clientId));
}

async function createOAuthState(supabase, clientId, returnPath, updatedBy) {
  const state = createOAuthStateToken();
  await saveAppSetting(
    supabase,
    getStateKey(state),
    {
      clientId,
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
  if (!payload?.clientId || !payload?.createdAt) {
    throw new Error("Fitbit OAuth state is invalid.");
  }

  const createdAt = new Date(payload.createdAt).getTime();
  if (Number.isNaN(createdAt) || Date.now() - createdAt > OAUTH_TTL_MS) {
    throw new Error("Fitbit OAuth state expired. Start the connection again.");
  }

  return payload;
}

function buildFitbitAuthUrl(state) {
  const url = new URL(FITBIT_AUTH_URL);
  url.searchParams.set("client_id", getFitbitClientId());
  url.searchParams.set("redirect_uri", getFitbitRedirectUri());
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", FITBIT_SCOPES.join(" "));
  url.searchParams.set("expires_in", "2592000");
  url.searchParams.set("state", state);
  return url.toString();
}

function buildBasicAuthHeader() {
  return `Basic ${Buffer.from(`${getFitbitClientId()}:${getFitbitClientSecret()}`).toString("base64")}`;
}

async function postFitbitForm(url, params) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: buildBasicAuthHeader(),
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
    throw new Error(payload?.errors?.[0]?.message || payload?.error_description || payload?.error || "Fitbit request failed.");
  }

  return payload;
}

async function exchangeCodeForTokens(code) {
  return postFitbitForm(FITBIT_TOKEN_URL, {
    code,
    grant_type: "authorization_code",
    redirect_uri: getFitbitRedirectUri(),
  });
}

async function refreshFitbitTokens(refreshToken) {
  return postFitbitForm(FITBIT_TOKEN_URL, {
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  });
}

function getTokenExpiryDate(expiresInSeconds) {
  return Date.now() + Number(expiresInSeconds || 0) * 1000;
}

function isConnectionExpiring(connection) {
  const expiresAt = Number(connection?.tokens?.expiresAt || 0);
  return !expiresAt || expiresAt <= Date.now() + 60 * 1000;
}

function normalizeScopes(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  return String(value || "")
    .split(/\s+/u)
    .map((item) => item.trim())
    .filter(Boolean);
}

async function ensureValidConnection(connection) {
  if (!connection?.tokens?.accessToken) {
    throw new Error("Fitbit is not connected for this client.");
  }

  if (!isConnectionExpiring(connection)) {
    return connection;
  }

  if (!connection?.tokens?.refreshToken) {
    return connection;
  }

  const refreshed = await refreshFitbitTokens(connection.tokens.refreshToken);
  return {
    ...connection,
    scopes: normalizeScopes(refreshed.scope) || connection.scopes || FITBIT_SCOPES,
    tokens: {
      accessToken: refreshed.access_token,
      refreshToken: refreshed.refresh_token || connection.tokens.refreshToken,
      expiresAt: getTokenExpiryDate(refreshed.expires_in),
      tokenType: refreshed.token_type || "Bearer",
    },
    refreshedAt: new Date().toISOString(),
  };
}

async function fitbitApiFetch(connection, path, options = {}) {
  const ensured = await ensureValidConnection(connection);
  const url = new URL(path, `${FITBIT_API_BASE}/`);
  const response = await fetch(url, {
    method: options.method || "GET",
    headers: {
      Authorization: `${ensured.tokens.tokenType || "Bearer"} ${ensured.tokens.accessToken}`,
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

    throw new Error(payload?.errors?.[0]?.message || payload?.error?.message || payload?.message || "Fitbit API request failed.");
  }

  return {
    connection: ensured,
    data: payload,
  };
}

async function fetchFitbitProfile(connection) {
  return fitbitApiFetch(connection, "1/user/-/profile.json");
}

async function fetchFitbitActivitiesForDate(connection, metricDate) {
  return fitbitApiFetch(connection, `1/user/-/activities/date/${metricDate}.json`, { allowNotFound: true });
}

async function fetchFitbitSleepForDate(connection, metricDate) {
  return fitbitApiFetch(connection, `1.2/user/-/sleep/date/${metricDate}.json`, { allowNotFound: true });
}

async function revokeFitbitAccess(connection) {
  const ensured = await ensureValidConnection(connection);
  const response = await fetch(FITBIT_REVOKE_URL, {
    method: "POST",
    headers: {
      Authorization: buildBasicAuthHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      token: ensured.tokens.accessToken,
    }),
  });

  return response.ok;
}

function formatMetricDate(offset) {
  return new Date(Date.now() - offset * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

function buildMetricFromFitbit(metricDate, activities, sleep) {
  const activitySummary = activities?.summary || {};
  const sleepSummary = sleep?.summary || {};
  const totalMinutesAsleep = Number(sleepSummary.totalMinutesAsleep || 0);
  const steps = Number(String(activitySummary.steps || "0").replace(/,/gu, ""));
  const activeMinutes =
    Number(activitySummary.lightlyActiveMinutes || 0)
    + Number(activitySummary.fairlyActiveMinutes || 0)
    + Number(activitySummary.veryActiveMinutes || 0);

  return {
    metric_date: metricDate,
    steps: Number.isFinite(steps) ? steps : null,
    sleep_seconds: totalMinutesAsleep > 0 ? totalMinutesAsleep * 60 : null,
    active_minutes: Number.isFinite(activeMinutes) ? activeMinutes : null,
    resting_heart_rate: Number.isFinite(Number(activitySummary.restingHeartRate))
      ? Number(activitySummary.restingHeartRate)
      : null,
    hrv_rmssd: null,
    recovery_score: null,
    source_payload: {
      activities,
      sleep,
    },
  };
}

async function syncLatestFitbitData(supabase, clientId, connection, options = {}) {
  const dayLimit = Math.max(1, Math.min(Number(options.limit || 7), 30));
  let refreshedConnection = connection;
  const metrics = [];

  for (let index = 0; index < dayLimit; index += 1) {
    const metricDate = formatMetricDate(index);
    const [activitiesResult, sleepResult] = await Promise.all([
      fetchFitbitActivitiesForDate(refreshedConnection, metricDate),
      fetchFitbitSleepForDate(refreshedConnection, metricDate),
    ]);

    refreshedConnection = sleepResult.connection || activitiesResult.connection || refreshedConnection;
    metrics.push(buildMetricFromFitbit(metricDate, activitiesResult.data, sleepResult.data));
  }

  const persistedConnection = {
    ...refreshedConnection,
    refreshedAt: new Date().toISOString(),
  };

  await saveFitbitConnection(supabase, clientId, persistedConnection, clientId);

  const syncResult = await syncWearableMetrics(supabase, {
    clientId,
    provider: "fitbit",
    metrics,
    connectionStatus: "connected",
    rewardEnabled: true,
    externalUserId: persistedConnection.profile?.userId || connection.profile?.userId || "",
    scopes: persistedConnection.scopes || FITBIT_SCOPES,
    connectionMeta: {
      displayName: persistedConnection.profile?.displayName || connection.profile?.displayName || "",
      fullName: persistedConnection.profile?.fullName || connection.profile?.fullName || "",
      avatar: persistedConnection.profile?.avatar || connection.profile?.avatar || "",
      source: "fitbit",
    },
    syncCursor: null,
    runMeta: {
      source: "fitbit-sync",
      metricDays: metrics.length,
    },
  });

  return {
    ...syncResult,
    fitbitConnection: persistedConnection,
  };
}

async function connectFitbitClient(supabase, clientId, tokenPayload, existingConnection = null) {
  const baseConnection = {
    provider: "fitbit",
    connectedAt: new Date().toISOString(),
    scopes: normalizeScopes(tokenPayload.scope) || FITBIT_SCOPES.slice(),
    tokens: {
      accessToken: tokenPayload.access_token,
      refreshToken: tokenPayload.refresh_token || existingConnection?.tokens?.refreshToken || "",
      expiresAt: getTokenExpiryDate(tokenPayload.expires_in),
      tokenType: tokenPayload.token_type || "Bearer",
    },
  };

  const profileResult = await fetchFitbitProfile(baseConnection);
  const profile = profileResult.data?.user || {};
  const finalConnection = {
    ...profileResult.connection,
    profile: {
      userId: String(profile.encodedId || tokenPayload.user_id || "").trim(),
      displayName: String(profile.displayName || "").trim(),
      fullName: String(profile.fullName || "").trim(),
      avatar: String(profile.avatar150 || profile.avatar || "").trim(),
    },
  };

  await saveFitbitConnection(supabase, clientId, finalConnection, clientId);

  const connectionResult = await upsertWearableConnection(supabase, {
    clientId,
    provider: "fitbit",
    status: "connected",
    rewardEnabled: true,
    externalUserId: finalConnection.profile.userId,
    scopes: finalConnection.scopes,
    metadata: {
      displayName: finalConnection.profile.displayName,
      fullName: finalConnection.profile.fullName,
      avatar: finalConnection.profile.avatar,
      source: "fitbit",
    },
    lastSyncAt: null,
    lastSuccessfulSyncAt: null,
  });

  return {
    connection: finalConnection,
    wearableConnection: connectionResult.connection,
  };
}

module.exports = {
  FITBIT_SCOPES,
  buildFitbitAuthUrl,
  connectFitbitClient,
  consumeOAuthState,
  createOAuthState,
  deleteFitbitConnection,
  exchangeCodeForTokens,
  fetchFitbitProfile,
  getFitbitRedirectUri,
  isFitbitConfigured,
  loadFitbitConnection,
  revokeFitbitAccess,
  sanitizeReturnPath,
  saveFitbitConnection,
  syncLatestFitbitData,
};
