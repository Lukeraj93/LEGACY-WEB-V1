const { buildActionRows } = require("../../../XP gamification/Config/client-xp-engine.js");
const { isFitbitConfigured } = require("./fitbit");
const { canManageClientWithProfile, ensureSystemProfile } = require("./supabase");
const { isStravaConfigured } = require("./strava");

const PROVIDERS = Object.freeze([
  {
    id: "apple_health",
    label: "Apple Health",
    syncMode: "native_bridge",
    requiresNativeBridge: true,
    notes: "Best for iPhone users. Apple Watch data typically flows through Apple Health.",
  },
  {
    id: "health_connect",
    label: "Health Connect",
    syncMode: "native_bridge",
    requiresNativeBridge: true,
    notes: "Best for Android users. Wear OS and supported apps can write into Health Connect.",
  },
  {
    id: "fitbit",
    label: "Fitbit",
    syncMode: "cloud_api",
    requiresNativeBridge: false,
    notes: "Direct cloud integration for Fitbit account data.",
  },
  {
    id: "strava",
    label: "Strava",
    syncMode: "cloud_api",
    requiresNativeBridge: false,
    notes: "Direct cloud integration for runners and endurance athletes using Strava activity data.",
  },
  {
    id: "garmin",
    label: "Garmin",
    syncMode: "cloud_api",
    requiresNativeBridge: false,
    notes: "Cloud integration is possible, but Garmin Health API access requires developer-program approval.",
  },
]);

const PROVIDER_MAP = new Map(PROVIDERS.map((provider) => [provider.id, provider]));
const CONNECTION_STATUSES = new Set(["pending", "connected", "error", "disconnected"]);
const SYNC_RUN_STATUSES = new Set(["started", "completed", "completed_with_errors", "failed"]);
const APPROVAL_STATUS = "auto_approved";
const DAILY_SLEEP_MIN_SECONDS = 7 * 60 * 60;
const DAILY_SLEEP_MAX_SECONDS = 9 * 60 * 60;

let cachedActionMap = null;

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function normalizeText(value) {
  return String(value || "").trim();
}

function normalizeNullableText(value) {
  const normalized = normalizeText(value);
  return normalized || null;
}

function normalizeInteger(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = Number(String(value).trim().replace(/,/g, ""));
  if (!Number.isFinite(parsed)) {
    return null;
  }

  return Math.round(parsed);
}

function normalizeDecimal(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = Number(String(value).trim().replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeBoolean(value, fallback = false) {
  if (typeof value === "boolean") {
    return value;
  }

  const normalized = normalizeText(value).toLowerCase();
  if (!normalized) {
    return fallback;
  }

  if (["true", "1", "yes", "y"].includes(normalized)) {
    return true;
  }

  if (["false", "0", "no", "n"].includes(normalized)) {
    return false;
  }

  return fallback;
}

function normalizeDateOnly(value) {
  const normalized = normalizeText(value);
  if (!normalized) {
    return null;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    return normalized;
  }

  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString().slice(0, 10);
}

function normalizeTimestamp(value, fallback = null) {
  const normalized = normalizeText(value);
  if (!normalized) {
    return fallback;
  }

  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) {
    return fallback;
  }

  return parsed.toISOString();
}

function normalizeObject(value, fallback = {}) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed;
      }
    } catch (_) {
      return fallback;
    }
  }

  return fallback;
}

function normalizeStringArray(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => normalizeText(item))
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizeProvider(value) {
  const normalized = normalizeText(value).toLowerCase();
  if (!PROVIDER_MAP.has(normalized)) {
    throw createHttpError(400, "Unsupported wearable provider.");
  }

  return normalized;
}

function normalizeConnectionStatus(value) {
  const normalized = normalizeText(value).toLowerCase() || "pending";
  if (!CONNECTION_STATUSES.has(normalized)) {
    throw createHttpError(400, "Invalid wearable connection status.");
  }

  return normalized;
}

function normalizeSyncRunStatus(value) {
  const normalized = normalizeText(value).toLowerCase() || "started";
  if (!SYNC_RUN_STATUSES.has(normalized)) {
    throw createHttpError(400, "Invalid wearable sync run status.");
  }

  return normalized;
}

function getSupportedWearableProviders() {
  return PROVIDERS
    .map((provider) => ({
      ...provider,
      configured:
        provider.id === "fitbit"
          ? isFitbitConfigured()
          : provider.id === "strava"
            ? isStravaConfigured()
            : false,
    }))
    .filter((provider) => provider.configured);
}

function providerLabel(providerId) {
  return PROVIDER_MAP.get(providerId)?.label || providerId;
}

function loadActionMap() {
  if (cachedActionMap) {
    return cachedActionMap;
  }

  cachedActionMap = new Map(
    buildActionRows().map((action) => [
      String(action.action_id || "").trim(),
      {
        actionId: String(action.action_id || "").trim(),
        displayName: String(action.display_name || "").trim(),
        xp: Number(action.xp || 0),
        coins: Number(action.coins || 0),
      },
    ])
  );

  return cachedActionMap;
}

function getActionReward(actionId) {
  return loadActionMap().get(String(actionId || "").trim()) || null;
}

function buildLedgerReason(actionId, reason) {
  const normalizedActionId = normalizeText(actionId);
  const normalizedReason = normalizeText(reason);
  if (!normalizedActionId) {
    return normalizedReason || "Wearable reward";
  }

  const prefix = `[${normalizedActionId}]`;
  if (!normalizedReason) {
    return prefix;
  }

  if (normalizedReason.startsWith(prefix)) {
    return normalizedReason;
  }

  return `${prefix} ${normalizedReason}`;
}

async function requireWearableClientAccess(supabase, profile, requestedClientId) {
  if (!profile?.id || !profile?.role) {
    throw createHttpError(401, "A valid authenticated session is required.");
  }

  if (profile.role === "super_admin") {
    const targetClientId = normalizeText(requestedClientId);
    if (!targetClientId) {
      throw createHttpError(400, "A target client is required.");
    }
    return targetClientId;
  }

  if (profile.role === "client") {
    const requested = normalizeText(requestedClientId);
    if (requested && requested !== profile.id) {
      throw createHttpError(403, "Client accounts can only access their own wearable data.");
    }
    return profile.id;
  }

  if (profile.role === "coach") {
    const targetClientId = normalizeText(requestedClientId);
    if (!targetClientId) {
      throw createHttpError(400, "A target client is required.");
    }

    const canManage = await canManageClientWithProfile(supabase, profile, targetClientId);
    if (!canManage) {
      throw createHttpError(403, "You are not assigned to this client.");
    }

    return targetClientId;
  }

  throw createHttpError(403, "This account cannot access wearable sync data.");
}

async function loadRewardSourceConnection(supabase, clientId) {
  const { data, error } = await supabase
    .from("wearable_connections")
    .select("*")
    .eq("client_id", clientId)
    .eq("reward_enabled", true)
    .eq("status", "connected")
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data || null;
}

async function loadWearableConnection(supabase, clientId, provider) {
  const { data, error } = await supabase
    .from("wearable_connections")
    .select("*")
    .eq("client_id", clientId)
    .eq("provider", provider)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data || null;
}

async function listWearableConnections(supabase, clientId) {
  const { data, error } = await supabase
    .from("wearable_connections")
    .select("*")
    .eq("client_id", clientId)
    .order("reward_enabled", { ascending: false })
    .order("updated_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

async function listRecentWearableMetrics(supabase, clientId, limit = 21) {
  const { data, error } = await supabase
    .from("wearable_daily_metrics")
    .select("*")
    .eq("client_id", clientId)
    .order("metric_date", { ascending: false })
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return data || [];
}

async function listRecentWearableRewards(supabase, clientId, limit = 20) {
  const { data, error } = await supabase
    .from("wearable_reward_events")
    .select("*")
    .eq("client_id", clientId)
    .order("metric_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return data || [];
}

function normalizeMetricInput(metric) {
  const record = normalizeObject(metric, {});
  const metricDate = normalizeDateOnly(record.metric_date || record.metricDate || record.date);
  if (!metricDate) {
    throw createHttpError(400, "Each wearable metric row requires a valid metric_date.");
  }

  const steps = normalizeInteger(record.steps);
  const activeMinutes = normalizeInteger(record.active_minutes ?? record.activeMinutes);
  const sleepSeconds = normalizeInteger(
    record.sleep_seconds
      ?? (normalizeDecimal(record.sleep_hours ?? record.sleepHours) != null
        ? normalizeDecimal(record.sleep_hours ?? record.sleepHours) * 60 * 60
        : null)
  );

  return {
    metric_date: metricDate,
    steps,
    sleep_seconds: sleepSeconds,
    active_minutes: activeMinutes,
    resting_heart_rate: normalizeDecimal(record.resting_heart_rate ?? record.restingHeartRate),
    hrv_rmssd: normalizeDecimal(record.hrv_rmssd ?? record.hrvRmssd),
    vo2_max: normalizeDecimal(record.vo2_max ?? record.vo2Max),
    recovery_score: normalizeInteger(record.recovery_score ?? record.recoveryScore),
    readiness_score: normalizeInteger(record.readiness_score ?? record.readinessScore),
    calories_burned: normalizeInteger(record.calories_burned ?? record.caloriesBurned),
    distance_meters: normalizeInteger(record.distance_meters ?? record.distanceMeters),
    source_payload: normalizeObject(record.source_payload ?? record.sourcePayload, {}),
    synced_at: normalizeTimestamp(record.synced_at ?? record.syncedAt, new Date().toISOString()),
  };
}

function buildDailyRewardSpecs(metric, provider) {
  const specs = [];
  const dateLabel = metric.metric_date;

  if (Number(metric.steps || 0) >= 12000) {
    specs.push({
      actionId: "NEAT-12K",
      sourceRef: `wearable:metric:${provider}:${metric.metric_date}:neat-12k`,
      reason: `12,000 steps recorded via ${providerLabel(provider)} on ${dateLabel}.`,
      metadata: {
        metricDate: metric.metric_date,
        provider,
        steps: Number(metric.steps || 0),
      },
    });
  } else if (Number(metric.steps || 0) >= 8000) {
    specs.push({
      actionId: "NEAT-8K",
      sourceRef: `wearable:metric:${provider}:${metric.metric_date}:neat-8k`,
      reason: `8,000 steps recorded via ${providerLabel(provider)} on ${dateLabel}.`,
      metadata: {
        metricDate: metric.metric_date,
        provider,
        steps: Number(metric.steps || 0),
      },
    });
  }

  if (
    Number(metric.sleep_seconds || 0) >= DAILY_SLEEP_MIN_SECONDS
    && Number(metric.sleep_seconds || 0) <= DAILY_SLEEP_MAX_SECONDS
  ) {
    specs.push({
      actionId: "REC-SLEEP",
      sourceRef: `wearable:metric:${provider}:${metric.metric_date}:sleep-target`,
      reason: `Recovery sleep target hit via ${providerLabel(provider)} on ${dateLabel}.`,
      metadata: {
        metricDate: metric.metric_date,
        provider,
        sleepSeconds: Number(metric.sleep_seconds || 0),
      },
    });
  }

  return specs;
}

async function insertPointsLedgerEntry(supabase, payload) {
  const { data, error } = await supabase
    .from("points_ledger")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

async function loadWearableRewardEvent(supabase, sourceRef) {
  const { data, error } = await supabase
    .from("wearable_reward_events")
    .select("*")
    .eq("source_ref", sourceRef)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data || null;
}

async function insertWearableRewardEvent(supabase, payload) {
  const { data, error } = await supabase
    .from("wearable_reward_events")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    if (String(error.code || "") === "23505") {
      return loadWearableRewardEvent(supabase, payload.source_ref);
    }
    throw error;
  }

  return data;
}

async function finalizeWearableRewardEvent(supabase, rewardEventId, update) {
  const { data, error } = await supabase
    .from("wearable_reward_events")
    .update(update)
    .eq("id", rewardEventId)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

async function awardWearableAction(supabase, {
  clientId,
  connectionId,
  metricId = null,
  metricDate = null,
  provider,
  spec,
  systemProfileId,
}) {
  const action = getActionReward(spec.actionId);
  if (!action) {
    return {
      created: false,
      skipped: true,
      reason: `Unsupported action ${spec.actionId}.`,
    };
  }

  const existing = await loadWearableRewardEvent(supabase, spec.sourceRef);
  if (existing?.xp_ledger_entry_id || existing?.coin_ledger_entry_id) {
    return {
      created: false,
      skipped: false,
      event: existing,
    };
  }

  const baseEvent = existing?.id
    ? existing
    : await insertWearableRewardEvent(supabase, {
        client_id: clientId,
        connection_id: connectionId || null,
        metric_id: metricId,
        provider,
        metric_date: metricDate,
        action_id: action.actionId,
        reason: normalizeText(spec.reason) || action.displayName,
        source_ref: spec.sourceRef,
        xp_delta: Number(action.xp || 0),
        coin_delta: Number(action.coins || 0),
        approval_status: APPROVAL_STATUS,
        requested_by: systemProfileId,
        approved_by: systemProfileId,
        metadata: normalizeObject(spec.metadata, {}),
        approved_at: new Date().toISOString(),
      });

  if (!baseEvent?.id) {
    return {
      created: false,
      skipped: true,
      reason: "Unable to create wearable reward event.",
    };
  }

  let xpLedgerEntryId = baseEvent.xp_ledger_entry_id || null;
  let coinLedgerEntryId = baseEvent.coin_ledger_entry_id || null;

  if (!xpLedgerEntryId && Number(action.xp || 0) > 0) {
    const xpLedgerEntry = await insertPointsLedgerEntry(supabase, {
      client_id: clientId,
      points_type: "xp",
      delta: Number(action.xp || 0),
      reason: buildLedgerReason(action.actionId, baseEvent.reason),
      requested_by: systemProfileId,
      approved_by: systemProfileId,
      approval_status: APPROVAL_STATUS,
      approved_at: new Date().toISOString(),
    });
    xpLedgerEntryId = xpLedgerEntry.id;
  }

  if (!coinLedgerEntryId && Number(action.coins || 0) > 0) {
    const coinLedgerEntry = await insertPointsLedgerEntry(supabase, {
      client_id: clientId,
      points_type: "gym_coins",
      delta: Number(action.coins || 0),
      reason: buildLedgerReason(action.actionId, baseEvent.reason),
      requested_by: systemProfileId,
      approved_by: systemProfileId,
      approval_status: APPROVAL_STATUS,
      approved_at: new Date().toISOString(),
    });
    coinLedgerEntryId = coinLedgerEntry.id;
  }

  const finalized = await finalizeWearableRewardEvent(supabase, baseEvent.id, {
    xp_ledger_entry_id: xpLedgerEntryId,
    coin_ledger_entry_id: coinLedgerEntryId,
    approval_status: APPROVAL_STATUS,
    approved_by: systemProfileId,
    approved_at: new Date().toISOString(),
  });

  return {
    created: !existing,
    skipped: false,
    event: finalized,
  };
}

async function upsertWearableConnection(supabase, payload) {
  const clientId = normalizeText(payload.clientId);
  const provider = normalizeProvider(payload.provider);
  const status = normalizeConnectionStatus(payload.status || "connected");
  const requestedRewardEnabled = payload.rewardEnabled;
  const existing = await loadWearableConnection(supabase, clientId, provider);
  const currentRewardSource = await loadRewardSourceConnection(supabase, clientId);
  const nowIso = new Date().toISOString();

  let rewardEnabled = normalizeBoolean(requestedRewardEnabled, existing?.reward_enabled || false);
  if (status !== "connected") {
    rewardEnabled = false;
  } else if (requestedRewardEnabled === undefined && !currentRewardSource) {
    rewardEnabled = true;
  }

  if (rewardEnabled) {
    await supabase
      .from("wearable_connections")
      .update({
        reward_enabled: false,
        updated_at: nowIso,
      })
      .eq("client_id", clientId)
      .neq("provider", provider);
  }

  const row = {
    client_id: clientId,
    provider,
    status,
    reward_enabled: rewardEnabled,
    external_user_id: normalizeNullableText(payload.externalUserId),
    scopes: normalizeStringArray(payload.scopes),
    sync_cursor: normalizeNullableText(payload.syncCursor),
    last_sync_at: status === "connected" ? normalizeTimestamp(payload.lastSyncAt, existing?.last_sync_at || null) : existing?.last_sync_at || null,
    last_successful_sync_at: normalizeTimestamp(payload.lastSuccessfulSyncAt, existing?.last_successful_sync_at || null),
    connected_at: status === "connected" ? existing?.connected_at || nowIso : existing?.connected_at || null,
    disconnected_at: status === "disconnected" ? nowIso : null,
    metadata: normalizeObject(payload.metadata, existing?.metadata || {}),
    updated_at: nowIso,
  };

  const { data, error } = await supabase
    .from("wearable_connections")
    .upsert(row, { onConflict: "client_id,provider" })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return {
    connection: data,
    wasConnected: String(existing?.status || "").toLowerCase() === "connected",
    currentRewardSource,
  };
}

async function upsertWearableMetric(supabase, {
  clientId,
  connectionId,
  provider,
  metric,
}) {
  const normalizedMetric = normalizeMetricInput(metric);
  const existing = await supabase
    .from("wearable_daily_metrics")
    .select("*")
    .eq("client_id", clientId)
    .eq("provider", provider)
    .eq("metric_date", normalizedMetric.metric_date)
    .maybeSingle();

  if (existing.error) {
    throw existing.error;
  }

  const payload = {
    client_id: clientId,
    connection_id: connectionId || null,
    provider,
    metric_date: normalizedMetric.metric_date,
    steps: normalizedMetric.steps,
    sleep_seconds: normalizedMetric.sleep_seconds,
    active_minutes: normalizedMetric.active_minutes,
    resting_heart_rate: normalizedMetric.resting_heart_rate,
    hrv_rmssd: normalizedMetric.hrv_rmssd,
    vo2_max: normalizedMetric.vo2_max,
    recovery_score: normalizedMetric.recovery_score,
    readiness_score: normalizedMetric.readiness_score,
    calories_burned: normalizedMetric.calories_burned,
    distance_meters: normalizedMetric.distance_meters,
    source_payload: normalizedMetric.source_payload,
    synced_at: normalizedMetric.synced_at,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("wearable_daily_metrics")
    .upsert(payload, { onConflict: "client_id,provider,metric_date" })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return {
    metric: data,
    created: !existing.data?.id,
  };
}

async function createWearableSyncRun(supabase, payload) {
  const { data, error } = await supabase
    .from("wearable_sync_runs")
    .insert({
      client_id: payload.clientId,
      connection_id: payload.connectionId || null,
      provider: normalizeProvider(payload.provider),
      status: normalizeSyncRunStatus(payload.status || "started"),
      metrics_received: Number(payload.metricsReceived || 0),
      metrics_upserted: Number(payload.metricsUpserted || 0),
      rewards_created: Number(payload.rewardsCreated || 0),
      cursor_before: normalizeNullableText(payload.cursorBefore),
      cursor_after: normalizeNullableText(payload.cursorAfter),
      run_meta: normalizeObject(payload.runMeta, {}),
      error_message: normalizeNullableText(payload.errorMessage),
      started_at: normalizeTimestamp(payload.startedAt, new Date().toISOString()),
      completed_at: normalizeTimestamp(payload.completedAt, null),
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

async function updateWearableSyncRun(supabase, runId, payload) {
  const { data, error } = await supabase
    .from("wearable_sync_runs")
    .update({
      status: normalizeSyncRunStatus(payload.status || "completed"),
      metrics_received: Number(payload.metricsReceived || 0),
      metrics_upserted: Number(payload.metricsUpserted || 0),
      rewards_created: Number(payload.rewardsCreated || 0),
      cursor_after: normalizeNullableText(payload.cursorAfter),
      run_meta: normalizeObject(payload.runMeta, {}),
      error_message: normalizeNullableText(payload.errorMessage),
      completed_at: normalizeTimestamp(payload.completedAt, new Date().toISOString()),
    })
    .eq("id", runId)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

async function syncWearableMetrics(supabase, payload) {
  const clientId = normalizeText(payload.clientId);
  const provider = normalizeProvider(payload.provider);
  const metrics = Array.isArray(payload.metrics) ? payload.metrics : [];
  const connectionResult = await upsertWearableConnection(supabase, {
    clientId,
    provider,
    status: payload.connectionStatus || "connected",
    rewardEnabled: payload.rewardEnabled,
    externalUserId: payload.externalUserId,
    scopes: payload.scopes,
    syncCursor: payload.syncCursor,
    lastSyncAt: new Date().toISOString(),
    lastSuccessfulSyncAt: metrics.length ? new Date().toISOString() : null,
    metadata: payload.connectionMeta,
  });
  const connection = connectionResult.connection;
  const run = await createWearableSyncRun(supabase, {
    clientId,
    connectionId: connection.id,
    provider,
    status: "started",
    metricsReceived: metrics.length,
    cursorBefore: connection.sync_cursor || null,
    cursorAfter: payload.syncCursor || null,
    runMeta: normalizeObject(payload.runMeta, {}),
  });

  const systemProfileId = await ensureSystemProfile(supabase);
  const createdRewards = [];
  let metricsUpserted = 0;

  try {
    const connectionReward = await awardWearableAction(supabase, {
      clientId,
      connectionId: connection.id,
      provider,
      spec: {
        actionId: "ONB-WEAR",
        sourceRef: `wearable:connection:${clientId}:onb-wear`,
        reason: `Wearable sync enabled using ${providerLabel(provider)}.`,
        metadata: {
          provider,
          rewardSource: Boolean(connection.reward_enabled),
        },
      },
      systemProfileId,
    });

    if (connectionReward.event?.id && connectionReward.created) {
      createdRewards.push(connectionReward.event);
    }

    for (const metricInput of metrics) {
      const upserted = await upsertWearableMetric(supabase, {
        clientId,
        connectionId: connection.id,
        provider,
        metric: metricInput,
      });
      metricsUpserted += 1;

      if (!connection.reward_enabled) {
        continue;
      }

      const specs = buildDailyRewardSpecs(upserted.metric, provider);
      for (const spec of specs) {
        const rewardResult = await awardWearableAction(supabase, {
          clientId,
          connectionId: connection.id,
          metricId: upserted.metric.id,
          metricDate: upserted.metric.metric_date,
          provider,
          spec,
          systemProfileId,
        });

        if (rewardResult.event?.id && rewardResult.created) {
          createdRewards.push(rewardResult.event);
        }
      }
    }

    const finalizedRun = await updateWearableSyncRun(supabase, run.id, {
      status: "completed",
      metricsReceived: metrics.length,
      metricsUpserted,
      rewardsCreated: createdRewards.length,
      cursorAfter: payload.syncCursor || null,
      runMeta: normalizeObject(payload.runMeta, {}),
      completedAt: new Date().toISOString(),
    });

    await supabase
      .from("wearable_connections")
      .update({
        last_sync_at: new Date().toISOString(),
        last_successful_sync_at: new Date().toISOString(),
        sync_cursor: normalizeNullableText(payload.syncCursor),
        updated_at: new Date().toISOString(),
      })
      .eq("id", connection.id);

    return {
      connection,
      syncRun: finalizedRun,
      metricsReceived: metrics.length,
      metricsUpserted,
      rewardsCreated: createdRewards.length,
      rewards: createdRewards,
    };
  } catch (error) {
    await updateWearableSyncRun(supabase, run.id, {
      status: "failed",
      metricsReceived: metrics.length,
      metricsUpserted,
      rewardsCreated: createdRewards.length,
      cursorAfter: payload.syncCursor || null,
      runMeta: normalizeObject(payload.runMeta, {}),
      errorMessage: error?.message || "Wearable sync failed.",
      completedAt: new Date().toISOString(),
    }).catch(() => null);
    throw error;
  }
}

module.exports = {
  APPROVAL_STATUS,
  createHttpError,
  getActionReward,
  getSupportedWearableProviders,
  listRecentWearableMetrics,
  listRecentWearableRewards,
  listWearableConnections,
  normalizeMetricInput,
  normalizeProvider,
  providerLabel,
  requireWearableClientAccess,
  syncWearableMetrics,
  upsertWearableConnection,
};
