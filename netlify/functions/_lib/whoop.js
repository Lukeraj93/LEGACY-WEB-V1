const { randomBytes } = require("crypto");

const { getBaseUrl, requireEnv } = require("./env");
const { syncWearableMetrics, upsertWearableConnection } = require("./wearables");

const WHOOP_AUTH_URL = "https://api.prod.whoop.com/oauth/oauth2/auth";
const WHOOP_TOKEN_URL = "https://api.prod.whoop.com/oauth/oauth2/token";
const WHOOP_API_BASE = "https://api.prod.whoop.com/developer/v2";
const OAUTH_TTL_MS = 15 * 60 * 1000;
const CONNECTION_KEY_PREFIX = "whoop-connection:";
const STATE_KEY_PREFIX = "whoop-oauth-state:";
const WHOOP_SCOPES = ["read:profile", "read:sleep", "read:recovery", "read:cycles"];

function isWhoopConfigured() {
  return Boolean(process.env.WHOOP_CLIENT_ID && process.env.WHOOP_CLIENT_SECRET && getBaseUrl());
}

function getWhoopClientId() {
  return requireEnv("WHOOP_CLIENT_ID");
}

function getWhoopClientSecret() {
  return requireEnv("WHOOP_CLIENT_SECRET");
}

function getWhoopRedirectUri() {
  const baseUrl = getBaseUrl();
  if (!baseUrl) {
    throw new Error("APP_BASE_URL is required for WHOOP OAuth.");
  }

  return new URL("/.netlify/functions/whoop-callback", `${baseUrl}/`).toString();
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

async function loadWhoopConnection(supabase, clientId) {
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

async function saveWhoopConnection(supabase, clientId, connection, updatedBy) {
  await saveAppSetting(supabase, getConnectionKey(clientId), connection, updatedBy);
}

async function deleteWhoopConnection(supabase, clientId) {
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
    throw new Error("WHOOP OAuth state is invalid.");
  }

  const createdAt = new Date(payload.createdAt).getTime();
  if (Number.isNaN(createdAt) || Date.now() - createdAt > OAUTH_TTL_MS) {
    throw new Error("WHOOP OAuth state expired. Start the connection again.");
  }

  return payload;
}

function buildWhoopAuthUrl(state) {
  const url = new URL(WHOOP_AUTH_URL);
  url.searchParams.set("client_id", getWhoopClientId());
  url.searchParams.set("redirect_uri", getWhoopRedirectUri());
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", WHOOP_SCOPES.join(" "));
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
    throw new Error(payload?.error_description || payload?.error || "WHOOP request failed.");
  }

  return payload;
}

async function exchangeCodeForTokens(code) {
  return postForm(WHOOP_TOKEN_URL, {
    code,
    client_id: getWhoopClientId(),
    client_secret: getWhoopClientSecret(),
    redirect_uri: getWhoopRedirectUri(),
    grant_type: "authorization_code",
  });
}

async function refreshWhoopTokens(refreshToken) {
  return postForm(WHOOP_TOKEN_URL, {
    refresh_token: refreshToken,
    client_id: getWhoopClientId(),
    client_secret: getWhoopClientSecret(),
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

async function ensureValidConnection(connection) {
  if (!connection?.tokens?.accessToken) {
    throw new Error("WHOOP is not connected for this client.");
  }

  if (!isConnectionExpiring(connection)) {
    return connection;
  }

  if (!connection?.tokens?.refreshToken) {
    return connection;
  }

  const refreshed = await refreshWhoopTokens(connection.tokens.refreshToken);
  return {
    ...connection,
    tokens: {
      accessToken: refreshed.access_token,
      refreshToken: refreshed.refresh_token || connection.tokens.refreshToken,
      expiresAt: getTokenExpiryDate(refreshed.expires_in),
      tokenType: refreshed.token_type || "Bearer",
    },
    refreshedAt: new Date().toISOString(),
  };
}

async function whoopApiFetch(connection, path, options = {}) {
  const ensured = await ensureValidConnection(connection);
  const url = new URL(path, `${WHOOP_API_BASE}/`);
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

    throw new Error(payload?.error_description || payload?.error || payload?.message || "WHOOP API request failed.");
  }

  return {
    connection: ensured,
    data: payload,
  };
}

async function fetchWhoopProfile(connection) {
  return whoopApiFetch(connection, "user/profile/basic");
}

async function fetchWhoopCycles(connection, options = {}) {
  return whoopApiFetch(connection, "cycle", {
    query: {
      limit: Number(options.limit || 7),
      start: options.start || undefined,
      end: options.end || undefined,
      nextToken: options.nextToken || undefined,
    },
  });
}

async function fetchWhoopSleepForCycle(connection, cycleId) {
  return whoopApiFetch(connection, `cycle/${cycleId}/sleep`, { allowNotFound: true });
}

async function fetchWhoopRecoveryForCycle(connection, cycleId) {
  return whoopApiFetch(connection, `cycle/${cycleId}/recovery`, { allowNotFound: true });
}

async function revokeWhoopAccess(connection) {
  const ensured = await ensureValidConnection(connection);
  const response = await fetch(`${WHOOP_API_BASE}/user/access`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${ensured.tokens.accessToken}`,
    },
  });

  if (response.status === 204 || response.ok) {
    return true;
  }

  return false;
}

function formatIsoDateWithOffset(timestamp, timezoneOffset) {
  const source = String(timestamp || "").trim();
  if (!source) {
    return null;
  }

  const offset = String(timezoneOffset || "").trim();
  if (offset && /^[+-]\d{2}:\d{2}$/.test(offset)) {
    const normalized = source.endsWith("Z") ? source.slice(0, -1) + offset : source;
    const parsed = new Date(normalized);
    if (!Number.isNaN(parsed.getTime())) {
      return normalized.slice(0, 10);
    }
  }

  const parsed = new Date(source);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString().slice(0, 10);
}

function buildMetricFromWhoopCycle(cycle, sleep, recovery) {
  const sleepScore = sleep?.score || {};
  const stageSummary = sleepScore.stage_summary || {};
  const recoveryScore = recovery?.score || {};
  const sleepMillis =
    Number(stageSummary.total_light_sleep_time_milli || 0)
    + Number(stageSummary.total_slow_wave_sleep_time_milli || 0)
    + Number(stageSummary.total_rem_sleep_time_milli || 0);

  return {
    metric_date:
      formatIsoDateWithOffset(sleep?.end || cycle?.end || cycle?.start, sleep?.timezone_offset || cycle?.timezone_offset)
      || formatIsoDateWithOffset(cycle?.end || cycle?.start, cycle?.timezone_offset),
    sleep_seconds: sleepMillis > 0 ? Math.round(sleepMillis / 1000) : null,
    active_minutes: null,
    recovery_score: Number.isFinite(Number(recoveryScore.recovery_score))
      ? Math.round(Number(recoveryScore.recovery_score))
      : null,
    resting_heart_rate: Number.isFinite(Number(recoveryScore.resting_heart_rate))
      ? Number(recoveryScore.resting_heart_rate)
      : null,
    hrv_rmssd: Number.isFinite(Number(recoveryScore.hrv_rmssd_milli))
      ? Number(recoveryScore.hrv_rmssd_milli)
      : null,
    source_payload: {
      cycle,
      sleep,
      recovery,
    },
  };
}

async function syncLatestWhoopData(supabase, clientId, connection, options = {}) {
  const start = options.start || new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString();
  const cycleResult = await fetchWhoopCycles(connection, {
    limit: options.limit || 7,
    start,
  });
  let refreshedConnection = cycleResult.connection;
  const cycles = Array.isArray(cycleResult.data?.records) ? cycleResult.data.records : [];
  const metrics = [];

  for (const cycle of cycles) {
    const [sleepResult, recoveryResult] = await Promise.all([
      fetchWhoopSleepForCycle(refreshedConnection, cycle.id),
      fetchWhoopRecoveryForCycle(refreshedConnection, cycle.id),
    ]);

    refreshedConnection = recoveryResult.connection || sleepResult.connection || refreshedConnection;
    const metric = buildMetricFromWhoopCycle(cycle, sleepResult.data, recoveryResult.data);
    if (metric.metric_date) {
      metrics.push(metric);
    }
  }

  const persistedConnection = {
    ...refreshedConnection,
    refreshedAt: new Date().toISOString(),
  };

  await saveWhoopConnection(supabase, clientId, persistedConnection, clientId);

  const syncResult = await syncWearableMetrics(supabase, {
    clientId,
    provider: "whoop",
    metrics,
    connectionStatus: "connected",
    rewardEnabled: true,
    externalUserId: persistedConnection.profile?.userId || connection.profile?.userId || "",
    scopes: persistedConnection.scopes || WHOOP_SCOPES,
    connectionMeta: {
      email: persistedConnection.profile?.email || connection.profile?.email || "",
      fullName: persistedConnection.profile?.fullName || connection.profile?.fullName || "",
      source: "whoop",
    },
    syncCursor: cycleResult.data?.next_token || null,
    runMeta: {
      source: "whoop-sync",
      cycleCount: cycles.length,
    },
  });

  return {
    ...syncResult,
    whoopConnection: persistedConnection,
  };
}

async function connectWhoopClient(supabase, clientId, tokenPayload, existingConnection = null) {
  const baseConnection = {
    provider: "whoop",
    connectedAt: new Date().toISOString(),
    scopes: WHOOP_SCOPES.slice(),
    tokens: {
      accessToken: tokenPayload.access_token,
      refreshToken: tokenPayload.refresh_token || existingConnection?.tokens?.refreshToken || "",
      expiresAt: getTokenExpiryDate(tokenPayload.expires_in),
      tokenType: tokenPayload.token_type || "Bearer",
    },
  };

  const profileResult = await fetchWhoopProfile(baseConnection);
  const finalConnection = {
    ...profileResult.connection,
    profile: {
      userId: String(profileResult.data?.user_id || "").trim(),
      email: String(profileResult.data?.email || "").trim(),
      fullName: [profileResult.data?.first_name, profileResult.data?.last_name].filter(Boolean).join(" ").trim(),
    },
  };

  await saveWhoopConnection(supabase, clientId, finalConnection, clientId);

  const connectionResult = await upsertWearableConnection(supabase, {
    clientId,
    provider: "whoop",
    status: "connected",
    rewardEnabled: true,
    externalUserId: finalConnection.profile.userId,
    scopes: WHOOP_SCOPES,
    metadata: {
      email: finalConnection.profile.email,
      fullName: finalConnection.profile.fullName,
      source: "whoop",
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
  WHOOP_SCOPES,
  buildWhoopAuthUrl,
  connectWhoopClient,
  consumeOAuthState,
  createOAuthState,
  deleteWhoopConnection,
  exchangeCodeForTokens,
  fetchWhoopProfile,
  getWhoopRedirectUri,
  isWhoopConfigured,
  loadWhoopConnection,
  revokeWhoopAccess,
  sanitizeReturnPath,
  saveWhoopConnection,
  syncLatestWhoopData,
};
