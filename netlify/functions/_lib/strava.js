const { randomBytes } = require("crypto");

const { getBaseUrl, requireEnv } = require("./env");
const { syncWearableMetrics, upsertWearableConnection } = require("./wearables");

const STRAVA_AUTH_URL = "https://www.strava.com/oauth/authorize";
const STRAVA_TOKEN_URL = "https://www.strava.com/oauth/token";
const STRAVA_DEAUTHORIZE_URL = "https://www.strava.com/oauth/deauthorize";
const STRAVA_API_BASE = "https://www.strava.com/api/v3";
const OAUTH_TTL_MS = 15 * 60 * 1000;
const CONNECTION_KEY_PREFIX = "strava-connection:";
const STATE_KEY_PREFIX = "strava-oauth-state:";
const STRAVA_SCOPES = ["read", "activity:read_all", "profile:read_all"];
const STEP_ESTIMATE_SPORTS = new Set(["Run", "TrailRun", "Walk", "Hike", "VirtualRun"]);
const STEP_LENGTH_METERS = 0.78;

function isStravaConfigured() {
  return Boolean(process.env.STRAVA_CLIENT_ID && process.env.STRAVA_CLIENT_SECRET && getBaseUrl());
}

function getStravaClientId() {
  return requireEnv("STRAVA_CLIENT_ID");
}

function getStravaClientSecret() {
  return requireEnv("STRAVA_CLIENT_SECRET");
}

function getStravaRedirectUri() {
  const baseUrl = getBaseUrl();
  if (!baseUrl) {
    throw new Error("APP_BASE_URL is required for Strava OAuth.");
  }

  return new URL("/.netlify/functions/strava-callback", `${baseUrl}/`).toString();
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

async function loadStravaConnection(supabase, clientId) {
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

async function saveStravaConnection(supabase, clientId, connection, updatedBy) {
  await saveAppSetting(supabase, getConnectionKey(clientId), connection, updatedBy);
}

async function deleteStravaConnection(supabase, clientId) {
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
    throw new Error("Strava OAuth state is invalid.");
  }

  const createdAt = new Date(payload.createdAt).getTime();
  if (Number.isNaN(createdAt) || Date.now() - createdAt > OAUTH_TTL_MS) {
    throw new Error("Strava OAuth state expired. Start the connection again.");
  }

  return payload;
}

function buildStravaAuthUrl(state) {
  const url = new URL(STRAVA_AUTH_URL);
  url.searchParams.set("client_id", getStravaClientId());
  url.searchParams.set("redirect_uri", getStravaRedirectUri());
  url.searchParams.set("response_type", "code");
  url.searchParams.set("approval_prompt", "auto");
  url.searchParams.set("scope", STRAVA_SCOPES.join(","));
  url.searchParams.set("state", state);
  return url.toString();
}

async function postStravaForm(url, params) {
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
    throw new Error(payload?.message || payload?.errors?.[0]?.message || "Strava request failed.");
  }

  return payload;
}

async function exchangeCodeForTokens(code) {
  return postStravaForm(STRAVA_TOKEN_URL, {
    client_id: getStravaClientId(),
    client_secret: getStravaClientSecret(),
    code,
    grant_type: "authorization_code",
  });
}

async function refreshStravaTokens(refreshToken) {
  return postStravaForm(STRAVA_TOKEN_URL, {
    client_id: getStravaClientId(),
    client_secret: getStravaClientSecret(),
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });
}

function isConnectionExpiring(connection) {
  const expiresAt = Number(connection?.tokens?.expiresAt || 0) * 1000;
  return !expiresAt || expiresAt <= Date.now() + 60 * 1000;
}

async function ensureValidConnection(connection) {
  if (!connection?.tokens?.accessToken) {
    throw new Error("Strava is not connected for this client.");
  }

  if (!isConnectionExpiring(connection)) {
    return connection;
  }

  if (!connection?.tokens?.refreshToken) {
    return connection;
  }

  const refreshed = await refreshStravaTokens(connection.tokens.refreshToken);
  return {
    ...connection,
    scopes: Array.isArray(refreshed.scope) ? refreshed.scope : String(refreshed.scope || "").split(",").map((item) => item.trim()).filter(Boolean),
    tokens: {
      accessToken: refreshed.access_token,
      refreshToken: refreshed.refresh_token || connection.tokens.refreshToken,
      expiresAt: Number(refreshed.expires_at || 0),
      tokenType: "Bearer",
    },
    refreshedAt: new Date().toISOString(),
    profile: {
      userId: String(refreshed.athlete?.id || connection.profile?.userId || "").trim(),
      username: String(refreshed.athlete?.username || connection.profile?.username || "").trim(),
      fullName: [refreshed.athlete?.firstname, refreshed.athlete?.lastname].filter(Boolean).join(" ").trim() || connection.profile?.fullName || "",
      avatar: String(refreshed.athlete?.profile_medium || refreshed.athlete?.profile || connection.profile?.avatar || "").trim(),
    },
  };
}

async function stravaApiFetch(connection, path, options = {}) {
  const ensured = await ensureValidConnection(connection);
  const url = new URL(path, `${STRAVA_API_BASE}/`);
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
    throw new Error(payload?.message || payload?.errors?.[0]?.message || "Strava API request failed.");
  }

  return {
    connection: ensured,
    data: payload,
  };
}

async function fetchStravaAthlete(connection) {
  return stravaApiFetch(connection, "athlete");
}

async function fetchStravaActivities(connection, options = {}) {
  return stravaApiFetch(connection, "athlete/activities", {
    query: {
      after: options.after || undefined,
      before: options.before || undefined,
      page: options.page || 1,
      per_page: Math.max(1, Math.min(Number(options.perPage || 50), 100)),
    },
  });
}

async function revokeStravaAccess(connection) {
  const ensured = await ensureValidConnection(connection);
  const response = await fetch(STRAVA_DEAUTHORIZE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ensured.tokens.accessToken}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ access_token: ensured.tokens.accessToken }),
  });

  return response.ok;
}

function estimateStepsFromDistance(distanceMeters, sportType) {
  if (!STEP_ESTIMATE_SPORTS.has(String(sportType || "").trim())) {
    return null;
  }

  const distance = Number(distanceMeters || 0);
  if (!Number.isFinite(distance) || distance <= 0) {
    return null;
  }

  return Math.round(distance / STEP_LENGTH_METERS);
}

function aggregateActivitiesToMetrics(activities) {
  const daily = new Map();

  for (const activity of activities) {
    const metricDate = String(activity?.start_date_local || activity?.start_date || "").slice(0, 10);
    if (!metricDate) {
      continue;
    }

    const sportType = String(activity?.sport_type || activity?.type || "").trim();
    const movingTimeSeconds = Number(activity?.moving_time || 0);
    const distanceMeters = Number(activity?.distance || 0);
    const estimatedSteps = estimateStepsFromDistance(distanceMeters, sportType);
    const summary = daily.get(metricDate) || {
      metric_date: metricDate,
      steps: 0,
      active_minutes: 0,
      sleep_seconds: null,
      recovery_score: null,
      resting_heart_rate: null,
      hrv_rmssd: null,
      distance_meters: 0,
      source_payload: {
        source: "strava",
        inferred_step_source: "distance_estimate_for_run_walk_hike",
        activities: [],
      },
    };

    summary.steps += Number(estimatedSteps || 0);
    summary.active_minutes += Math.round(movingTimeSeconds / 60);
    summary.distance_meters += Number.isFinite(distanceMeters) ? Math.round(distanceMeters) : 0;
    summary.source_payload.activities.push({
      id: activity?.id || null,
      name: String(activity?.name || "").trim(),
      sport_type: sportType,
      distance_meters: Number.isFinite(distanceMeters) ? Math.round(distanceMeters) : 0,
      moving_time_seconds: Number.isFinite(movingTimeSeconds) ? Math.round(movingTimeSeconds) : 0,
      commute: Boolean(activity?.commute),
      average_heartrate: Number.isFinite(Number(activity?.average_heartrate)) ? Number(activity.average_heartrate) : null,
      start_date_local: activity?.start_date_local || null,
    });

    daily.set(metricDate, summary);
  }

  return Array.from(daily.values())
    .sort((left, right) => String(right.metric_date).localeCompare(String(left.metric_date)))
    .map((metric) => ({
      ...metric,
      steps: metric.steps > 0 ? metric.steps : null,
      active_minutes: metric.active_minutes > 0 ? metric.active_minutes : null,
      distance_meters: metric.distance_meters > 0 ? metric.distance_meters : null,
    }));
}

async function syncLatestStravaData(supabase, clientId, connection, options = {}) {
  const afterEpoch = Math.floor((Date.now() - Math.max(1, Math.min(Number(options.limit || 7), 30)) * 24 * 60 * 60 * 1000) / 1000);
  const activityResult = await fetchStravaActivities(connection, {
    after: afterEpoch,
    perPage: Math.max(10, Math.min(Number(options.perPage || 50), 100)),
  });

  const refreshedConnection = activityResult.connection;
  const activities = Array.isArray(activityResult.data) ? activityResult.data : [];
  const metrics = aggregateActivitiesToMetrics(activities);
  const persistedConnection = {
    ...refreshedConnection,
    refreshedAt: new Date().toISOString(),
  };

  await saveStravaConnection(supabase, clientId, persistedConnection, clientId);

  const syncResult = await syncWearableMetrics(supabase, {
    clientId,
    provider: "strava",
    metrics,
    connectionStatus: "connected",
    rewardEnabled: true,
    externalUserId: persistedConnection.profile?.userId || connection.profile?.userId || "",
    scopes: persistedConnection.scopes || STRAVA_SCOPES,
    connectionMeta: {
      username: persistedConnection.profile?.username || connection.profile?.username || "",
      fullName: persistedConnection.profile?.fullName || connection.profile?.fullName || "",
      avatar: persistedConnection.profile?.avatar || connection.profile?.avatar || "",
      source: "strava",
    },
    syncCursor: null,
    runMeta: {
      source: "strava-sync",
      activityCount: activities.length,
    },
  });

  return {
    ...syncResult,
    stravaConnection: persistedConnection,
  };
}

async function connectStravaClient(supabase, clientId, tokenPayload, existingConnection = null) {
  const athlete = tokenPayload.athlete || {};
  const baseConnection = {
    provider: "strava",
    connectedAt: new Date().toISOString(),
    scopes: Array.isArray(tokenPayload.scope) ? tokenPayload.scope : String(tokenPayload.scope || "").split(",").map((item) => item.trim()).filter(Boolean),
    tokens: {
      accessToken: tokenPayload.access_token,
      refreshToken: tokenPayload.refresh_token || existingConnection?.tokens?.refreshToken || "",
      expiresAt: Number(tokenPayload.expires_at || 0),
      tokenType: "Bearer",
    },
    profile: {
      userId: String(athlete.id || "").trim(),
      username: String(athlete.username || "").trim(),
      fullName: [athlete.firstname, athlete.lastname].filter(Boolean).join(" ").trim(),
      avatar: String(athlete.profile_medium || athlete.profile || "").trim(),
    },
  };

  const athleteResult = await fetchStravaAthlete(baseConnection);
  const athleteProfile = athleteResult.data || {};
  const finalConnection = {
    ...athleteResult.connection,
    profile: {
      userId: String(athleteProfile.id || baseConnection.profile.userId || "").trim(),
      username: String(athleteProfile.username || baseConnection.profile.username || "").trim(),
      fullName: [athleteProfile.firstname, athleteProfile.lastname].filter(Boolean).join(" ").trim() || baseConnection.profile.fullName,
      avatar: String(athleteProfile.profile_medium || athleteProfile.profile || baseConnection.profile.avatar || "").trim(),
    },
  };

  await saveStravaConnection(supabase, clientId, finalConnection, clientId);

  const connectionResult = await upsertWearableConnection(supabase, {
    clientId,
    provider: "strava",
    status: "connected",
    rewardEnabled: true,
    externalUserId: finalConnection.profile.userId,
    scopes: finalConnection.scopes,
    metadata: {
      username: finalConnection.profile.username,
      fullName: finalConnection.profile.fullName,
      avatar: finalConnection.profile.avatar,
      source: "strava",
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
  STRAVA_SCOPES,
  buildStravaAuthUrl,
  connectStravaClient,
  consumeOAuthState,
  createOAuthState,
  deleteStravaConnection,
  exchangeCodeForTokens,
  fetchStravaAthlete,
  getStravaRedirectUri,
  isStravaConfigured,
  loadStravaConnection,
  revokeStravaAccess,
  sanitizeReturnPath,
  saveStravaConnection,
  syncLatestStravaData,
};
