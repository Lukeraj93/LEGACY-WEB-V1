const { getOrSetRuntimeCache } = require("./runtime-cache");
const { listManagedClientIdsForCoach } = require("./supabase");

const CLIENT_LEADERBOARD_CACHE_TTL_MS = 60 * 1000;
const COACH_LEADERBOARD_CACHE_TTL_MS = 60 * 1000;
const CLIENT_HOME_SNAPSHOT_CACHE_TTL_MS = 60 * 1000;
const COACH_HOME_SNAPSHOT_CACHE_TTL_MS = 60 * 1000;
const ADMIN_HOME_SNAPSHOT_CACHE_TTL_MS = 60 * 1000;
const CLIENT_HOME_SNAPSHOT_MAX_AGE_MS = 10 * 60 * 1000;
const COACH_HOME_SNAPSHOT_MAX_AGE_MS = 10 * 60 * 1000;
const ADMIN_HOME_SNAPSHOT_MAX_AGE_MS = 5 * 60 * 1000;
const leaderboardCache = new Map();
const clientHomeSnapshotCache = new Map();
const coachHomeSnapshotCache = new Map();
const adminHomeSnapshotCache = new Map();
const XP_COACH_SCHEMA = "xp_coach";
const NON_OPERATIONAL_NAME_PATTERN = /\blegacy\s+(?:qa|smoke|test)\b/iu;
const NON_OPERATIONAL_EMAIL_PATTERN = /(?:^qa\.(?:coach|client)@legacycoaching\.com\.my$|@example\.invalid$|@legacy\.local$)/iu;

function xpCoachSchema(supabase) {
  return supabase.schema(XP_COACH_SCHEMA);
}

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function buildAccess(auth) {
  return {
    user: {
      id: auth?.user?.id || "",
      email: auth?.user?.email || "",
    },
    role: auth?.profile?.role || "",
    status: auth?.profile?.status || "active",
  };
}

function uniqueValues(values) {
  return Array.from(new Set((values || []).filter(Boolean)));
}

function matchesNonOperationalName(value) {
  return NON_OPERATIONAL_NAME_PATTERN.test(String(value || "").trim());
}

function matchesNonOperationalEmail(value) {
  return NON_OPERATIONAL_EMAIL_PATTERN.test(String(value || "").trim().toLowerCase());
}

function isOperationalProfileRecord(record) {
  return !matchesNonOperationalName(record?.display_name);
}

function isOperationalLeadRecord(record) {
  return !matchesNonOperationalName(record?.full_name) && !matchesNonOperationalEmail(record?.email);
}

function isOperationalActivationCodeRecord(record) {
  return !matchesNonOperationalName(record?.recipient_name) && !matchesNonOperationalEmail(record?.recipient_email);
}

function filterOperationalProfiles(records) {
  return (records || []).filter(isOperationalProfileRecord);
}

function filterOperationalLeads(records) {
  return (records || []).filter(isOperationalLeadRecord);
}

function filterOperationalActivationCodes(records) {
  return (records || []).filter(isOperationalActivationCodeRecord);
}

function filterOperationalLeadActivities(records, allowedLeadIds, allowedActorIds = null) {
  const leadIdSet = new Set((allowedLeadIds || []).filter(Boolean));
  const actorIdSet = allowedActorIds ? new Set((allowedActorIds || []).filter(Boolean)) : null;
  return (records || []).filter((record) => {
    if (!leadIdSet.has(record?.lead_id)) {
      return false;
    }
    if (actorIdSet && record?.actor_id && !actorIdSet.has(record.actor_id)) {
      return false;
    }
    return true;
  });
}

function filterOperationalNotifications(records) {
  return (records || []).filter((record) => {
    const title = String(record?.title || "");
    const body = String(record?.body || "");
    return !matchesNonOperationalName(title)
      && !matchesNonOperationalEmail(title)
      && !matchesNonOperationalName(body)
      && !matchesNonOperationalEmail(body);
  });
}

function filterRowsByAllowedIds(records, key, allowedIds) {
  const allowedIdSet = new Set((allowedIds || []).filter(Boolean));
  return (records || []).filter((record) => allowedIdSet.has(record?.[key]));
}

function chunkValues(values, chunkSize = 200) {
  const items = Array.isArray(values) ? values.filter(Boolean) : [];
  const size = Math.max(1, Number(chunkSize || 200));
  const chunks = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

async function collectBatchedRows(values, fetchChunk, sortFn = null) {
  const ids = uniqueValues(values);
  if (!ids.length) {
    return [];
  }

  const rows = [];
  for (const chunk of chunkValues(ids)) {
    // Sequential batching keeps the query surface predictable on Netlify.
    const response = await fetchChunk(chunk);
    throwOnError(response);
    rows.push(...(response.data || []));
  }

  return typeof sortFn === "function" ? rows.sort(sortFn) : rows;
}

function throwOnError(response) {
  if (response?.error) {
    throw response.error;
  }
}

function asObject(value) {
  if (!value) {
    return {};
  }
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    } catch (_) {
      return {};
    }
  }
  return typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeDisplayLabel(value, fallback = "Not assigned") {
  const normalized = String(value || "").trim();
  if (!normalized) {
    return fallback;
  }
  return normalized
    .replace(/_/gu, " ")
    .replace(/\b\w/gu, (character) => character.toUpperCase());
}

function clampPositiveInt(value, fallback, max = 100) {
  const numeric = Number.parseInt(String(value || "").trim(), 10);
  if (!Number.isFinite(numeric) || numeric < 1) {
    return fallback;
  }
  return Math.min(max, numeric);
}

function buildPaginationMeta(totalCount, page, pageSize) {
  const safePageSize = clampPositiveInt(pageSize, 10, 100);
  const totalPages = Math.max(1, Math.ceil(Math.max(0, Number(totalCount || 0)) / safePageSize));
  const currentPage = Math.min(clampPositiveInt(page, 1, totalPages), totalPages);
  return {
    page: currentPage,
    pageSize: safePageSize,
    totalCount: Math.max(0, Number(totalCount || 0)),
    totalPages,
    hasPreviousPage: currentPage > 1,
    hasNextPage: currentPage < totalPages,
  };
}

function paginateCollection(items, page, pageSize) {
  const rows = Array.isArray(items) ? items : [];
  const pagination = buildPaginationMeta(rows.length, page, pageSize);
  const startIndex = (pagination.page - 1) * pagination.pageSize;
  return {
    rows: rows.slice(startIndex, startIndex + pagination.pageSize),
    pagination,
  };
}

function startOfCurrentMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function startOfCurrentQuarter() {
  const now = new Date();
  const quarterMonth = Math.floor(now.getMonth() / 3) * 3;
  return new Date(now.getFullYear(), quarterMonth, 1);
}

function formatLeaderboardName(value, fallback) {
  const normalized = String(value || "").trim();
  if (normalized) {
    return normalized;
  }
  return String(fallback || "").trim() || "Account";
}

function asArray(value) {
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      return [];
    }
  }
  return [];
}

function toFiniteNumber(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function toFiniteInteger(value) {
  const numeric = Number.parseInt(String(value ?? "").trim(), 10);
  return Number.isFinite(numeric) ? numeric : null;
}

function roundMetric(value, decimals = 1) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return 0;
  }
  const factor = 10 ** decimals;
  return Math.round(numeric * factor) / factor;
}

function normalizeExerciseLabel(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}

function resolveLeaderboardExerciseLabel(programExercise, exerciseLibraryName = "") {
  const metadata = asObject(programExercise?.metadata);
  return normalizeExerciseLabel(
    programExercise?.name_override
      || metadata.exercise_name
      || exerciseLibraryName
      || programExercise?.notes
  );
}

function classifyLeaderboardExercise(label) {
  const normalized = normalizeExerciseLabel(label);
  if (!normalized) {
    return "";
  }

  if (
    /\bdeadlift\b/iu.test(normalized)
    || /\brdl\b/iu.test(normalized)
    || /\bromanian deadlift\b/iu.test(normalized)
    || /\btrap bar deadlift\b/iu.test(normalized)
  ) {
    return "deadlift";
  }

  if (
    /\bbench press\b/iu.test(normalized)
    || /\bflat bench\b/iu.test(normalized)
    || /\bincline bench\b/iu.test(normalized)
  ) {
    return "bench";
  }

  if (
    /\bsquat\b/iu.test(normalized)
    && !/\bsplit squat\b/iu.test(normalized)
    && !/\bbulgarian\b/iu.test(normalized)
    && !/\bhack squat\b/iu.test(normalized)
    && !/\bgoblet squat\b/iu.test(normalized)
    && !/\bjump squat\b/iu.test(normalized)
  ) {
    return "squat";
  }

  if (
    /\b5k\b/iu.test(normalized)
    || /\b5 km\b/iu.test(normalized)
    || /\b5000 m\b/iu.test(normalized)
    || /\brun\b/iu.test(normalized)
    || /\bjog\b/iu.test(normalized)
    || /\btreadmill\b/iu.test(normalized)
  ) {
    return "run";
  }

  return "";
}

function buildExerciseAttempts(exerciseLog) {
  const setRows = asArray(exerciseLog?.set_logs);
  const rows = setRows
    .map((row) => ({
      loadKg: toFiniteNumber(row?.loadKg ?? row?.load_kg ?? row?.loggedWeightKg),
      reps: toFiniteInteger(row?.reps ?? row?.completedReps),
      durationSeconds: toFiniteInteger(row?.durationSeconds ?? row?.duration_seconds ?? row?.loggedDurationSeconds),
      distanceMeters: toFiniteNumber(row?.distanceMeters ?? row?.distance_meters ?? row?.loggedDistanceMeters),
    }))
    .filter((row) =>
      row.loadKg !== null
      || row.reps !== null
      || row.durationSeconds !== null
      || row.distanceMeters !== null
    );

  if (rows.length) {
    return rows;
  }

  const fallbackLoad = toFiniteNumber(exerciseLog?.logged_weight_kg);
  const fallbackReps = toFiniteInteger(exerciseLog?.completed_reps);
  const fallbackSets = Math.max(1, toFiniteInteger(exerciseLog?.completed_sets) || 1);
  const fallbackDuration = toFiniteInteger(exerciseLog?.logged_duration_seconds);
  const fallbackDistance = toFiniteNumber(exerciseLog?.logged_distance_meters);

  if (
    fallbackLoad === null
    && fallbackReps === null
    && fallbackDuration === null
    && fallbackDistance === null
  ) {
    return [];
  }

  if (fallbackLoad !== null && fallbackReps !== null) {
    return Array.from({ length: fallbackSets }, () => ({
      loadKg: fallbackLoad,
      reps: fallbackReps,
      durationSeconds: null,
      distanceMeters: null,
    }));
  }

  return [{
    loadKg: fallbackLoad,
    reps: fallbackReps,
    durationSeconds: fallbackDuration,
    distanceMeters: fallbackDistance,
  }];
}

function calculateExerciseTonnage(exerciseLog) {
  const attempts = buildExerciseAttempts(exerciseLog);
  const tonnage = attempts.reduce((sum, row) => {
    if (row.loadKg === null || row.reps === null || row.reps <= 0) {
      return sum;
    }
    return sum + (row.loadKg * row.reps);
  }, 0);

  return tonnage > 0 ? tonnage : 0;
}

function summarizeEnduranceAttempt(exerciseLog) {
  const attempts = buildExerciseAttempts(exerciseLog);
  const totals = attempts.reduce((accumulator, row) => {
    if (row.durationSeconds !== null) {
      accumulator.durationSeconds += row.durationSeconds;
    }
    if (row.distanceMeters !== null) {
      accumulator.distanceMeters += row.distanceMeters;
    }
    return accumulator;
  }, { durationSeconds: 0, distanceMeters: 0 });

  const summaryDuration = toFiniteInteger(exerciseLog?.logged_duration_seconds);
  const summaryDistance = toFiniteNumber(exerciseLog?.logged_distance_meters);

  return {
    durationSeconds: summaryDuration ?? (totals.durationSeconds || null),
    distanceMeters: summaryDistance ?? (totals.distanceMeters || null),
  };
}

function isRelevantPrRepRange(targetReps, actualReps) {
  const reps = Number(actualReps || 0);
  if (!Number.isFinite(reps) || reps <= 0) {
    return false;
  }

  if (targetReps === 3) {
    return reps >= 1 && reps <= 5;
  }
  if (targetReps === 5) {
    return reps >= 3 && reps <= 7;
  }
  if (targetReps === 10) {
    return reps >= 6 && reps <= 15;
  }

  return false;
}

function estimateRepMax(loadKg, reps, targetReps) {
  const load = Number(loadKg || 0);
  const repCount = Number(reps || 0);
  if (!Number.isFinite(load) || !Number.isFinite(repCount) || load <= 0 || repCount <= 0) {
    return null;
  }

  const estimatedOneRm = load * (1 + (repCount / 30));
  const targetRm = estimatedOneRm / (1 + (targetReps / 30));
  return targetRm > 0 ? roundMetric(targetRm, 1) : null;
}

function createEmptyLiftProfile() {
  return {
    rm3Kg: null,
    rm5Kg: null,
    rm10Kg: null,
  };
}

function averageScores(values) {
  const valid = (values || []).filter((value) => Number.isFinite(value));
  if (!valid.length) {
    return 0;
  }
  return valid.reduce((sum, value) => sum + value, 0) / valid.length;
}

function normalizeHigherBetter(value, values) {
  const valid = (values || []).filter((candidate) => Number.isFinite(candidate) && candidate > 0);
  if (!Number.isFinite(value) || value <= 0 || !valid.length) {
    return 0;
  }

  const min = Math.min(...valid);
  const max = Math.max(...valid);
  if (max === min) {
    return 1;
  }
  return Math.max(0, Math.min(1, (value - min) / (max - min)));
}

function normalizeLowerBetter(value, values) {
  const valid = (values || []).filter((candidate) => Number.isFinite(candidate) && candidate > 0);
  if (!Number.isFinite(value) || value <= 0 || !valid.length) {
    return 0;
  }

  const min = Math.min(...valid);
  const max = Math.max(...valid);
  if (max === min) {
    return 1;
  }
  return Math.max(0, Math.min(1, 1 - ((value - min) / (max - min))));
}

function normalizeClientHomeSummary(summary, clientProfile) {
  const payload = summary && typeof summary === "object" ? summary : {};
  const earnedActionIds = Array.isArray(payload.earnedActionIds)
    ? payload.earnedActionIds.filter(Boolean)
    : [];

  return {
    currentXp: Math.max(0, Number(payload.currentXp ?? clientProfile?.xp_points ?? 0)),
    currentCoins: Math.max(0, Number(payload.currentCoins ?? clientProfile?.gym_coins ?? 0)),
    paidOrdersCount: Math.max(0, Number(payload.paidOrdersCount || 0)),
    totalPurchasesRm: Number(payload.totalPurchasesRm || 0),
    approvedXpEntriesCount: Math.max(0, Number(payload.approvedXpEntriesCount || 0)),
    approvedCoinEntriesCount: Math.max(0, Number(payload.approvedCoinEntriesCount || 0)),
    approvedRewardEntriesCount: Math.max(
      0,
      Number(payload.approvedRewardEntriesCount ?? 0)
    ),
    lifetimeApprovedXp: Math.max(0, Number(payload.lifetimeApprovedXp || 0)),
    lifetimeApprovedCoins: Math.max(0, Number(payload.lifetimeApprovedCoins || 0)),
    weeklyXp: Math.max(0, Number(payload.weeklyXp || 0)),
    weeklyCoins: Math.max(0, Number(payload.weeklyCoins || 0)),
    monthlyXp: Math.max(0, Number(payload.monthlyXp || 0)),
    monthlyCoins: Math.max(0, Number(payload.monthlyCoins || 0)),
    earnedActionIds,
  };
}

function normalizeCoachHomeSummary(summary) {
  const payload = summary && typeof summary === "object" ? summary : {};

  return {
    activeClients: Math.max(0, Number(payload.activeClients || 0)),
    pendingRewardCount: Math.max(0, Number(payload.pendingRewardCount || 0)),
    upcomingSessionsCount: Math.max(0, Number(payload.upcomingSessionsCount || 0)),
    completedSessionsThisMonth: Math.max(0, Number(payload.completedSessionsThisMonth || 0)),
    monthlyCommission: Number(payload.monthlyCommission || 0),
  };
}

function normalizeAdminHomeSummary(summary) {
  const payload = summary && typeof summary === "object" ? summary : {};
  const reviewRows = Array.isArray(payload.reviewRows) ? payload.reviewRows.filter(Boolean) : [];

  return {
    paidRevenue: Number(payload.paidRevenue || 0),
    grossSales: Number(payload.grossSales || 0),
    refundedRevenue: Number(payload.refundedRevenue || 0),
    trackedTaxes: Number(payload.trackedTaxes || 0),
    netRevenue: Number(payload.netRevenue || 0),
    pendingRevenue: Number(payload.pendingRevenue || 0),
    averagePaidOrder: Number(payload.averagePaidOrder || 0),
    gatewayFees: Number(payload.gatewayFees || 0),
    currentMonthGrossSales: Number(payload.currentMonthGrossSales || 0),
    currentMonthNetRevenue: Number(payload.currentMonthNetRevenue || 0),
    currentMonthGatewayFees: Number(payload.currentMonthGatewayFees || 0),
    currentMonthCommissionExpense: Number(payload.currentMonthCommissionExpense || 0),
    coachPayoutsPayable: Number(payload.coachPayoutsPayable || 0),
    coachPayoutsPaid: Number(payload.coachPayoutsPaid || 0),
    companyCommissionCaptured: Number(payload.companyCommissionCaptured || 0),
    averageCompanyTakePct: Number(payload.averageCompanyTakePct || 0),
    unusedLiability: Number(payload.unusedLiability || 0),
    liabilityAging: payload.liabilityAging && typeof payload.liabilityAging === "object" ? payload.liabilityAging : {},
    coachCount: Math.max(0, Number(payload.coachCount || 0)),
    activeClientCount: Math.max(0, Number(payload.activeClientCount || 0)),
    convertedLeadCount: Math.max(0, Number(payload.convertedLeadCount || 0)),
    totalLeadCount: Math.max(0, Number(payload.totalLeadCount || 0)),
    leadConversionRate: Number(payload.leadConversionRate || 0),
    pendingApprovals: Math.max(0, Number(payload.pendingApprovals || 0)),
    overdueFollowUps: Math.max(0, Number(payload.overdueFollowUps || 0)),
    unreadNotifications: Math.max(0, Number(payload.unreadNotifications || 0)),
    unattributedRevenue: Number(payload.unattributedRevenue || 0),
    reviewRows,
  };
}

async function getClientHomeSummary(supabase, userId, clientProfile) {
  return getOrSetRuntimeCache(
    clientHomeSnapshotCache,
    `client-home-summary:${userId}`,
    CLIENT_HOME_SNAPSHOT_CACHE_TTL_MS,
    async () => {
      const snapshotResponse = await supabase
        .from("client_home_snapshots")
        .select("summary, generated_at")
        .eq("client_id", userId)
        .maybeSingle();

      throwOnError(snapshotResponse);

      const existingRow = snapshotResponse.data || null;
      const existingSummary = normalizeClientHomeSummary(existingRow?.summary || {}, clientProfile);
      const generatedAt = new Date(existingRow?.generated_at || 0).getTime();
      const hasFreshSnapshot = Number.isFinite(generatedAt) && Date.now() - generatedAt <= CLIENT_HOME_SNAPSHOT_MAX_AGE_MS;

      if (existingRow?.summary && hasFreshSnapshot) {
        return existingSummary;
      }

      try {
        const refreshResponse = await supabase.rpc("refresh_client_home_snapshot", {
          p_client_id: userId,
        });
        throwOnError(refreshResponse);
        return normalizeClientHomeSummary(refreshResponse.data || {}, clientProfile);
      } catch (error) {
        if (existingRow?.summary) {
          return existingSummary;
        }
        throw error;
      }
    }
  );
}

async function getCoachHomeSummary(supabase, coachId) {
  return getOrSetRuntimeCache(
    coachHomeSnapshotCache,
    `coach-home-summary:${coachId}`,
    COACH_HOME_SNAPSHOT_CACHE_TTL_MS,
    async () => {
      const snapshotResponse = await supabase
        .from("coach_home_snapshots")
        .select("summary, generated_at")
        .eq("coach_id", coachId)
        .maybeSingle();

      throwOnError(snapshotResponse);

      const existingRow = snapshotResponse.data || null;
      const existingSummary = normalizeCoachHomeSummary(existingRow?.summary || {});
      const generatedAt = new Date(existingRow?.generated_at || 0).getTime();
      const hasFreshSnapshot = Number.isFinite(generatedAt) && Date.now() - generatedAt <= COACH_HOME_SNAPSHOT_MAX_AGE_MS;

      if (existingRow?.summary && hasFreshSnapshot) {
        return existingSummary;
      }

      try {
        const refreshResponse = await supabase.rpc("refresh_coach_home_snapshot", {
          p_coach_id: coachId,
        });
        throwOnError(refreshResponse);
        return normalizeCoachHomeSummary(refreshResponse.data || {});
      } catch (error) {
        if (existingRow?.summary) {
          return existingSummary;
        }
        throw error;
      }
    }
  );
}

async function getAdminHomeSummary(supabase, adminId) {
  return getOrSetRuntimeCache(
    adminHomeSnapshotCache,
    `admin-home-summary:${adminId}`,
    ADMIN_HOME_SNAPSHOT_CACHE_TTL_MS,
    async () => {
      const snapshotResponse = await supabase
        .from("admin_home_snapshots")
        .select("summary, generated_at")
        .eq("admin_id", adminId)
        .maybeSingle();

      throwOnError(snapshotResponse);

      const existingRow = snapshotResponse.data || null;
      const existingSummary = normalizeAdminHomeSummary(existingRow?.summary || {});
      const generatedAt = new Date(existingRow?.generated_at || 0).getTime();
      const hasFreshSnapshot = Number.isFinite(generatedAt) && Date.now() - generatedAt <= ADMIN_HOME_SNAPSHOT_MAX_AGE_MS;

      if (existingRow?.summary && hasFreshSnapshot) {
        return existingSummary;
      }

      try {
        const refreshResponse = await supabase.rpc("refresh_admin_home_snapshot", {
          p_admin_id: adminId,
        });
        throwOnError(refreshResponse);
        return normalizeAdminHomeSummary(refreshResponse.data || {});
      } catch (error) {
        if (existingRow?.summary) {
          return existingSummary;
        }
        throw error;
      }
    }
  );
}

async function loadClientLeaderboard(supabase, limit = 8) {
  return getOrSetRuntimeCache(
    leaderboardCache,
    `client:${limit}`,
    CLIENT_LEADERBOARD_CACHE_TTL_MS,
    async () => {
      const clientProfilesResponse = await supabase
        .from("client_profiles")
        .select("id, preferred_name, xp_points, gym_coins, primary_goal, member_id");

      throwOnError(clientProfilesResponse);

      const clientProfiles = clientProfilesResponse.data || [];
      const accountIds = uniqueValues(clientProfiles.map((item) => item.id));
      if (!accountIds.length) {
        return [];
      }

      const profilesResponse = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url, status")
        .eq("role", "client")
        .eq("status", "active")
        .in("id", accountIds);

      throwOnError(profilesResponse);

      const activeProfiles = profilesResponse.data || [];
      const profileMap = new Map(activeProfiles.map((item) => [item.id, item]));
      const activeClientIds = uniqueValues(activeProfiles.map((item) => item.id));

      const workoutLogs = await collectBatchedRows(
        activeClientIds,
        (chunk) =>
          supabase
            .from("client_workout_logs")
            .select("id, client_id, log_status, review_status, completed_at")
            .in("client_id", chunk)
            .eq("log_status", "completed")
            .eq("review_status", "approved")
      );

      const workoutLogMap = new Map((workoutLogs || []).map((row) => [row.id, row]));
      const workoutLogIds = uniqueValues((workoutLogs || []).map((row) => row.id));

      const workoutExerciseLogs = await collectBatchedRows(
        workoutLogIds,
        (chunk) =>
          supabase
            .from("client_workout_exercise_logs")
            .select("workout_log_id, client_program_day_exercise_id, completed_sets, completed_reps, logged_weight_kg, logged_duration_seconds, logged_distance_meters, set_logs")
            .in("workout_log_id", chunk),
        (left, right) => String(left?.workout_log_id || "").localeCompare(String(right?.workout_log_id || ""))
      );

      const programExerciseIds = uniqueValues((workoutExerciseLogs || []).map((row) => row.client_program_day_exercise_id));
      const programExercises = await collectBatchedRows(
        programExerciseIds,
        (chunk) =>
          supabase
            .from("client_program_day_exercises")
            .select("id, exercise_id, name_override, notes, metadata, exercise_library(name)")
            .in("id", chunk)
      );

      const programExerciseMap = new Map((programExercises || []).map((row) => [row.id, row]));
      const metricsByClientId = new Map();

      const ensureClientMetrics = (clientId) => {
        if (!metricsByClientId.has(clientId)) {
          metricsByClientId.set(clientId, {
            sessionsLogged: 0,
            totalWeightLiftedKg: 0,
            fiveKmSeconds: null,
            squat: createEmptyLiftProfile(),
            bench: createEmptyLiftProfile(),
            deadlift: createEmptyLiftProfile(),
          });
        }
        return metricsByClientId.get(clientId);
      };

      (workoutLogs || []).forEach((log) => {
        const clientId = String(log?.client_id || "").trim();
        if (!clientId) {
          return;
        }
        ensureClientMetrics(clientId).sessionsLogged += 1;
      });

      (workoutExerciseLogs || []).forEach((exerciseLog) => {
        const workoutLog = workoutLogMap.get(exerciseLog.workout_log_id) || null;
        const clientId = String(workoutLog?.client_id || "").trim();
        if (!clientId) {
          return;
        }

        const clientMetrics = ensureClientMetrics(clientId);
        const programExercise = programExerciseMap.get(exerciseLog.client_program_day_exercise_id) || null;
        const exerciseLabel = resolveLeaderboardExerciseLabel(
          programExercise,
          programExercise?.exercise_library?.name || ""
        );
        const discipline = classifyLeaderboardExercise(exerciseLabel);

        clientMetrics.totalWeightLiftedKg += calculateExerciseTonnage(exerciseLog);

        if (discipline === "run") {
          const runSummary = summarizeEnduranceAttempt(exerciseLog);
          if (
            Number(runSummary.distanceMeters || 0) >= 4500
            && Number(runSummary.distanceMeters || 0) <= 5500
            && Number(runSummary.durationSeconds || 0) > 0
          ) {
            const equivalentFiveKm = roundMetric(
              (Number(runSummary.durationSeconds) * 5000) / Number(runSummary.distanceMeters),
              1
            );
            if (!clientMetrics.fiveKmSeconds || equivalentFiveKm < clientMetrics.fiveKmSeconds) {
              clientMetrics.fiveKmSeconds = equivalentFiveKm;
            }
          }
        }

        if (!["squat", "bench", "deadlift"].includes(discipline)) {
          return;
        }

        const attempts = buildExerciseAttempts(exerciseLog);
        attempts.forEach((attempt) => {
          if (attempt.loadKg === null || attempt.reps === null) {
            return;
          }

          [
            { target: 3, key: "rm3Kg" },
            { target: 5, key: "rm5Kg" },
            { target: 10, key: "rm10Kg" },
          ].forEach(({ target, key }) => {
            if (!isRelevantPrRepRange(target, attempt.reps)) {
              return;
            }
            const estimate = estimateRepMax(attempt.loadKg, attempt.reps, target);
            if (!estimate) {
              return;
            }
            const current = clientMetrics[discipline][key];
            if (!current || estimate > current) {
              clientMetrics[discipline][key] = estimate;
            }
          });
        });
      });

      const entries = clientProfiles
        .filter((item) => profileMap.has(item.id))
        .map((detail) => {
          const profile = profileMap.get(detail.id) || null;
          const metrics = metricsByClientId.get(detail.id) || {
            sessionsLogged: 0,
            totalWeightLiftedKg: 0,
            fiveKmSeconds: null,
            squat: createEmptyLiftProfile(),
            bench: createEmptyLiftProfile(),
            deadlift: createEmptyLiftProfile(),
          };

          return {
            id: detail.id,
            displayName: formatLeaderboardName(detail?.preferred_name, profile?.display_name),
            avatarUrl: profile?.avatar_url || "",
            xpPoints: Math.max(0, Number(detail?.xp_points || 0)),
            gymCoins: Math.max(0, Number(detail?.gym_coins || 0)),
            primaryGoal: String(detail?.primary_goal || "").trim(),
            memberId: String(detail?.member_id || "").trim(),
            sessionsLogged: Math.max(0, Number(metrics.sessionsLogged || 0)),
            totalWeightLiftedKg: roundMetric(metrics.totalWeightLiftedKg || 0, 0),
            fiveKmSeconds: metrics.fiveKmSeconds ? roundMetric(metrics.fiveKmSeconds, 1) : null,
            squat3RmKg: metrics.squat.rm3Kg,
            squat5RmKg: metrics.squat.rm5Kg,
            squat10RmKg: metrics.squat.rm10Kg,
            bench3RmKg: metrics.bench.rm3Kg,
            bench5RmKg: metrics.bench.rm5Kg,
            bench10RmKg: metrics.bench.rm10Kg,
            deadlift3RmKg: metrics.deadlift.rm3Kg,
            deadlift5RmKg: metrics.deadlift.rm5Kg,
            deadlift10RmKg: metrics.deadlift.rm10Kg,
          };
        });

      const xpValues = entries.map((entry) => entry.xpPoints);
      const coinValues = entries.map((entry) => entry.gymCoins);
      const sessionsValues = entries.map((entry) => entry.sessionsLogged);
      const tonnageValues = entries.map((entry) => entry.totalWeightLiftedKg);
      const fiveKmValues = entries.map((entry) => entry.fiveKmSeconds).filter((value) => Number.isFinite(value));
      const strengthMetricKeys = [
        "squat3RmKg", "squat5RmKg", "squat10RmKg",
        "bench3RmKg", "bench5RmKg", "bench10RmKg",
        "deadlift3RmKg", "deadlift5RmKg", "deadlift10RmKg",
      ];
      const strengthValueMap = new Map(
        strengthMetricKeys.map((key) => [key, entries.map((entry) => Number(entry[key] || 0))])
      );

      return entries
        .map((entry) => {
          const rewardsScore = averageScores([
            normalizeHigherBetter(entry.xpPoints, xpValues),
            normalizeHigherBetter(entry.gymCoins, coinValues),
          ]);
          const activityScore = averageScores([
            normalizeHigherBetter(entry.sessionsLogged, sessionsValues),
            normalizeHigherBetter(entry.totalWeightLiftedKg, tonnageValues),
          ]);
          const strengthScore = averageScores(
            strengthMetricKeys.map((key) => normalizeHigherBetter(Number(entry[key] || 0), strengthValueMap.get(key) || []))
          );
          const conditioningScore = normalizeLowerBetter(entry.fiveKmSeconds, fiveKmValues);
          const compositeScore = roundMetric(
            (strengthScore * 0.35)
            + (activityScore * 0.25)
            + (rewardsScore * 0.25)
            + (conditioningScore * 0.15),
            4
          );

          return {
            ...entry,
            leaderboardScore: compositeScore,
          };
        })
        .sort((left, right) =>
          Number(right.leaderboardScore || 0) - Number(left.leaderboardScore || 0)
          || Number(right.xpPoints || 0) - Number(left.xpPoints || 0)
          || Number(right.gymCoins || 0) - Number(left.gymCoins || 0)
          || Number(right.sessionsLogged || 0) - Number(left.sessionsLogged || 0)
          || left.displayName.localeCompare(right.displayName)
        )
        .slice(0, limit)
        .map((entry, index) => ({
          ...entry,
          rank: index + 1,
        }));
    }
  );
}

async function loadCoachLeaderboard(supabase, limit = 8) {
  return getOrSetRuntimeCache(
    leaderboardCache,
    `coach:${limit}`,
    COACH_LEADERBOARD_CACHE_TTL_MS,
    async () => {
      const quarterStartIso = startOfCurrentQuarter().toISOString();
      const [profilesResponse, coachProfilesResponse, assignmentsResponse, sessionsResponse, commissionsResponse, xpOverviewResponse] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, display_name, avatar_url, status")
          .eq("role", "coach")
          .eq("status", "active"),
        supabase
          .from("coach_profiles")
          .select("id, commission_tier, commission_rate, position_code"),
        supabase
          .from("coach_client_assignments")
          .select("coach_id, status")
          .eq("status", "active"),
        supabase
          .from("sessions")
          .select("coach_id, status, completed_at")
          .eq("status", "completed")
          .gte("completed_at", quarterStartIso),
        supabase
          .from("commission_records")
          .select("coach_id, amount_rm, created_at")
          .gte("created_at", quarterStartIso),
        xpCoachSchema(supabase)
          .from("coach_overview_view")
          .select(
            "profile_id, profile_display_name, total_xp_counted, global_level, current_operational_title, coaching_weekly_counted_xp, impact_quarterly_counted_xp"
          )
          .order("total_xp_counted", { ascending: false })
          .limit(Math.max(limit * 3, 24))
          .then((response) => (response?.error ? { data: [], error: null } : response))
          .catch(() => ({ data: [], error: null })),
      ]);

      [profilesResponse, coachProfilesResponse, assignmentsResponse, sessionsResponse, commissionsResponse].forEach(throwOnError);

      const activeOperationalProfiles = filterOperationalProfiles(profilesResponse.data || []);
      const coachProfileMap = new Map((coachProfilesResponse.data || []).map((item) => [item.id, item]));
      const xpOverviewMap = new Map(
        (xpOverviewResponse.data || [])
          .map((item) => [String(item?.profile_id || "").trim(), item])
          .filter(([profileId]) => Boolean(profileId))
      );
      const activeClientCounts = new Map();
      const completedSessionCounts = new Map();
      const commissionTotals = new Map();

      (assignmentsResponse.data || []).forEach((assignment) => {
        const coachId = String(assignment?.coach_id || "").trim();
        if (!coachId) {
          return;
        }
        activeClientCounts.set(coachId, Number(activeClientCounts.get(coachId) || 0) + 1);
      });

      (sessionsResponse.data || []).forEach((session) => {
        const coachId = String(session?.coach_id || "").trim();
        if (!coachId) {
          return;
        }
        completedSessionCounts.set(coachId, Number(completedSessionCounts.get(coachId) || 0) + 1);
      });

      (commissionsResponse.data || []).forEach((record) => {
        const coachId = String(record?.coach_id || "").trim();
        if (!coachId) {
          return;
        }
        commissionTotals.set(coachId, Number(commissionTotals.get(coachId) || 0) + Number(record?.amount_rm || 0));
      });

      return activeOperationalProfiles
        .map((profile) => {
          const coachProfile = coachProfileMap.get(profile.id) || null;
          const xpOverview = xpOverviewMap.get(profile.id) || null;
          return {
            id: profile.id,
            displayName: formatLeaderboardName(
              xpOverview?.profile_display_name || profile.display_name,
              "Coach"
            ),
            avatarUrl: profile.avatar_url || "",
            activeClients: Number(activeClientCounts.get(profile.id) || 0),
            completedSessions: Number(completedSessionCounts.get(profile.id) || 0),
            commissionTotal: Number(commissionTotals.get(profile.id) || 0),
            commissionTier: String(coachProfile?.commission_tier || "").trim(),
            positionCode: String(coachProfile?.position_code || "").trim(),
            commissionRate: Number(coachProfile?.commission_rate || 0),
            totalXpCounted: Number(xpOverview?.total_xp_counted || 0),
            globalLevel: Math.max(1, Number(xpOverview?.global_level || 1)),
            currentOperationalTitle: String(xpOverview?.current_operational_title || "").trim(),
            coachingWeeklyXp: Number(xpOverview?.coaching_weekly_counted_xp || 0),
            impactQuarterXp: Number(xpOverview?.impact_quarterly_counted_xp || 0),
          };
        })
        .sort((left, right) =>
          Number(right.totalXpCounted || 0) - Number(left.totalXpCounted || 0)
          || Number(right.impactQuarterXp || 0) - Number(left.impactQuarterXp || 0)
          || Number(right.coachingWeeklyXp || 0) - Number(left.coachingWeeklyXp || 0)
          || Number(right.activeClients || 0) - Number(left.activeClients || 0)
          || left.displayName.localeCompare(right.displayName)
        )
        .slice(0, limit)
        .map((entry, index) => ({
          ...entry,
          rank: index + 1,
        }));
    }
  );
}

async function loadPlannerRewardEventsForLedgerEntries(supabase, ledgerEntries) {
  const rewardIds = uniqueValues((ledgerEntries || []).map((entry) => entry.id));
  if (!rewardIds.length) {
    return [];
  }

  const [xpLinkedResponse, coinLinkedResponse] = await Promise.all([
    supabase
      .from("planner_reward_events")
      .select(
        "id, client_id, coach_id, source_module, source_record_id, action_id, approval_status, requested_by, approved_by, approved_at, xp_ledger_entry_id, coin_ledger_entry_id, reason, metadata, created_at"
      )
      .in("xp_ledger_entry_id", rewardIds),
    supabase
      .from("planner_reward_events")
      .select(
        "id, client_id, coach_id, source_module, source_record_id, action_id, approval_status, requested_by, approved_by, approved_at, xp_ledger_entry_id, coin_ledger_entry_id, reason, metadata, created_at"
      )
      .in("coin_ledger_entry_id", rewardIds),
  ]);

  [xpLinkedResponse, coinLinkedResponse].forEach(throwOnError);

  return Array.from(
    new Map(
      [...(xpLinkedResponse.data || []), ...(coinLinkedResponse.data || [])]
        .filter((item) => item?.id)
        .map((item) => [item.id, item])
    ).values()
  );
}

async function getClientDashboardPayload(supabase, auth, pageKey, options = {}) {
  const access = buildAccess(auth);
  const userId = access.user.id;
  const nowIso = new Date().toISOString();
  const variant = String(options?.variant || "")
    .trim()
    .toLowerCase();
  const isPrimaryVariant = variant === "primary";
  const isSecondaryVariant = variant === "secondary";
  const isHomePage = pageKey === "home";
  const includeProfile = pageKey === "profile";
  const includeOrderHistory = pageKey === "packages" || includeProfile;
  const includePurchaseSummary = includeOrderHistory;
  const includeCatalog = pageKey === "packages";
  const includeRewards = pageKey === "rewards" || includeProfile;
  const includeSchedule = pageKey === "home" || pageKey === "schedule" || includeProfile;
  const includeSessionHistory = includeSchedule || includeRewards;
  const includeLeaderboard = pageKey === "rewards" || includeProfile || (isHomePage && !isPrimaryVariant);
  const includeHomeSummary = isHomePage;
  const orderHistoryLimit = pageKey === "packages" ? 12 : includeProfile ? 8 : 6;
  const pointsLedgerLimit = pageKey === "rewards" ? 50 : isHomePage ? 14 : 20;
  const scheduleWindowLimit = pageKey === "schedule" ? 30 : isHomePage ? 8 : 12;
  const sessionChangeLimit = pageKey === "schedule" ? 30 : isHomePage ? 8 : 12;

  if (isHomePage && isSecondaryVariant) {
    return {
      access,
      clientLeaderboard: includeLeaderboard ? await loadClientLeaderboard(supabase, 8) : [],
    };
  }

  const [
    profileResponse,
    clientProfileResponse,
    assignmentResponse,
    packagesResponse,
    ordersResponse,
    pointsLedgerResponse,
    packageCatalogResponse,
  ] = await Promise.all([
    supabase.from("profiles").select("id, display_name, avatar_url, status").eq("id", userId).single(),
    supabase
      .from("client_profiles")
      .select("preferred_name, avatar_slug, xp_points, gym_coins, primary_goal, member_id")
      .eq("id", userId)
      .maybeSingle(),
    supabase
      .from("coach_client_assignments")
      .select("coach_id, status")
      .eq("client_id", userId)
      .eq("status", "active")
      .order("assigned_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("client_packages")
      .select(
        "id, client_id, order_id, package_id, package_name, sessions_purchased, sessions_remaining, status, activated_at, expires_at, created_at"
      )
      .eq("client_id", userId)
      .order("created_at", { ascending: false }),
    includePurchaseSummary
      ? supabase
          .from("orders")
          .select(
            includeOrderHistory
              ? "id, created_at, total_amount_rm, status, external_reference, invoice_number, invoice_storage_path, receipt_number, receipt_storage_path, refund_receipt_number, refund_receipt_storage_path"
              : "id, created_at, total_amount_rm, status"
          )
          .eq("client_id", userId)
          .order("created_at", { ascending: false })
          .limit(orderHistoryLimit)
      : Promise.resolve({ data: [], error: null }),
    includeRewards
      ? supabase
          .from("points_ledger")
          .select("points_type, delta, approval_status, created_at")
          .eq("client_id", userId)
          .order("created_at", { ascending: false })
          .limit(pointsLedgerLimit)
      : Promise.resolve({ data: [], error: null }),
    includeCatalog
      ? supabase
          .from("package_catalog")
          .select(
            "id, code, name, package_type, commitment_kind, training_format, tier_code, sessions_included, expiry_days, price_rm, sst_amount_rm, gross_amount_rm, currency, is_active, metadata"
          )
          .eq("package_type", "coaching")
          .eq("is_active", true)
      : Promise.resolve({ data: [], error: null }),
  ]);

  [
    profileResponse,
    clientProfileResponse,
    assignmentResponse,
    packagesResponse,
    ordersResponse,
    pointsLedgerResponse,
    packageCatalogResponse,
  ].forEach(throwOnError);

  const profile = profileResponse.data || null;
  const clientProfile = clientProfileResponse.data || null;
  const assignment = assignmentResponse.data || null;
  const packages = packagesResponse.data || [];
  const orders = ordersResponse.data || [];
  const pointsLedger = pointsLedgerResponse.data || [];
  const packageCatalog = packageCatalogResponse.data || [];
  const packageIds = packages.map((item) => item.id).filter(Boolean);
  const orderIds = orders.map((order) => order.id);
  const coachIds = uniqueValues([assignment?.coach_id]);

  const [sessionsResponse, bookingRequestsResponse] = await Promise.all([
    includeSessionHistory
      ? packageIds.length
        ? supabase
            .from("sessions")
            .select("id, scheduled_start, scheduled_end, coach_id, client_package_id, status")
            .in("client_package_id", packageIds)
            .order("scheduled_start", { ascending: true })
            .limit(scheduleWindowLimit)
        : supabase
            .from("sessions")
            .select("id, scheduled_start, scheduled_end, coach_id, client_package_id, status")
            .eq("client_id", userId)
            .gte("scheduled_start", nowIso)
            .order("scheduled_start", { ascending: true })
            .limit(scheduleWindowLimit)
      : Promise.resolve({ data: [], error: null }),
    includeSchedule
      ? packageIds.length
        ? supabase
            .from("booking_requests")
            .select("id, requested_date, requested_time, preferred_coach_id, client_package_id, status, notes, created_at")
            .in("client_package_id", packageIds)
            .order("requested_date", { ascending: true })
            .order("requested_time", { ascending: true })
            .limit(scheduleWindowLimit)
        : supabase
            .from("booking_requests")
            .select("id, requested_date, requested_time, preferred_coach_id, client_package_id, status, notes, created_at")
            .eq("client_id", userId)
            .order("requested_date", { ascending: true })
            .order("requested_time", { ascending: true })
            .limit(scheduleWindowLimit)
      : Promise.resolve({ data: [], error: null }),
  ]);

  [sessionsResponse, bookingRequestsResponse].forEach(throwOnError);

  const sessions = sessionsResponse.data || [];
  const bookingRequests = bookingRequestsResponse.data || [];
  const sessionIds = sessions.map((session) => session.id).filter(Boolean);
  const sessionChangeRequestsResponse = includeSchedule
    ? sessionIds.length
      ? await supabase
          .from("session_change_requests")
          .select(
            "id, session_id, request_type, original_start, original_end, requested_start, requested_end, reason, status, created_at"
          )
          .in("session_id", sessionIds)
          .order("created_at", { ascending: false })
          .limit(sessionChangeLimit)
      : await supabase
          .from("session_change_requests")
          .select(
            "id, session_id, request_type, original_start, original_end, requested_start, requested_end, reason, status, created_at"
          )
          .eq("client_id", userId)
          .order("created_at", { ascending: false })
          .limit(sessionChangeLimit)
    : { data: [], error: null };

  throwOnError(sessionChangeRequestsResponse);

  const sessionChangeRequests = sessionChangeRequestsResponse.data || [];
  const resolvedCoachIds = uniqueValues(
    coachIds
      .concat(sessions.map((session) => session.coach_id))
      .concat(bookingRequests.map((request) => request.preferred_coach_id))
  );

  const [orderItemsResponse, coachProfilesResponse, coachAvailabilityResponse, clientLeaderboardResponse, homeSummaryResponse] = await Promise.all([
    includeOrderHistory && orderIds.length
      ? supabase.from("order_items").select("order_id, name").in("order_id", orderIds)
      : Promise.resolve({ data: [], error: null }),
    resolvedCoachIds.length
      ? supabase.from("profiles").select("id, display_name").in("id", resolvedCoachIds)
      : Promise.resolve({ data: [], error: null }),
    includeSchedule && assignment?.coach_id
      ? supabase
          .from("coach_availability_windows")
          .select("id, coach_id, day_of_week, start_time, end_time, timezone, is_active")
          .eq("coach_id", assignment.coach_id)
          .eq("is_active", true)
      : Promise.resolve({ data: [], error: null }),
    includeLeaderboard ? loadClientLeaderboard(supabase, 8) : Promise.resolve([]),
    includeHomeSummary ? getClientHomeSummary(supabase, userId, clientProfile) : Promise.resolve(null),
  ]);

  [orderItemsResponse, coachProfilesResponse, coachAvailabilityResponse].forEach(throwOnError);

  return {
    access,
    profile,
    clientProfile,
    assignment,
    packages,
    ...(includeCatalog
      ? {
          packageCatalog,
        }
      : {}),
    ...(includePurchaseSummary
      ? {
          orders,
        }
      : {}),
    ...(includeOrderHistory
      ? {
          orderItems: orderItemsResponse.data || [],
        }
      : {}),
    ...(includeSessionHistory
      ? {
          sessions,
        }
      : {}),
    ...(includeSchedule
      ? {
          bookingRequests,
          sessionChangeRequests,
          coachAvailabilityWindows: coachAvailabilityResponse.data || [],
        }
      : {}),
    ...(includeRewards
      ? {
          pointsLedger,
        }
      : {}),
    ...(includeLeaderboard
      ? {
          clientLeaderboard: clientLeaderboardResponse || [],
        }
      : {}),
    ...(includeHomeSummary
      ? {
          homeSummary: homeSummaryResponse || null,
        }
      : {}),
    coachProfiles: coachProfilesResponse.data || [],
  };
}

async function getCoachDashboardPayload(supabase, auth, pageKey, options = {}) {
  const access = buildAccess(auth);
  const coachId = access.user.id;
  const sessionWindowStartIso = startOfCurrentQuarter().toISOString();
  const variant = String(options?.variant || "")
    .trim()
    .toLowerCase();
  const isHomePage = pageKey === "home";
  const isClientsPage = pageKey === "clients";
  const isPrimaryVariant = variant === "primary";
  const isSecondaryVariant = variant === "secondary";
  const isHomeSecondary = isHomePage && isSecondaryVariant;
  const isClientsPrimary = isClientsPage && isPrimaryVariant;
  const isClientsSecondary = isClientsPage && isSecondaryVariant;
  const includeProfile = pageKey === "profile";
  const includeRoster = pageKey === "home" || includeProfile || (isClientsPage && !isClientsSecondary);
  const includeSchedule = pageKey === "home" || pageKey === "schedule" || includeProfile;
  const includeCommissions = pageKey === "commissions" || includeProfile;
  const includeConsults = isClientsPage && !isClientsPrimary;
  const includeLeaderboard = includeProfile || (isHomePage && !isPrimaryVariant);
  const includePointsLedger = includeProfile || (isClientsPage && !isClientsSecondary);
  const includeAvailability = pageKey === "schedule" || includeProfile;
  const includeSessionChangeRequests = pageKey === "schedule" || includeProfile;
  const includeClientPackages =
    (pageKey === "schedule" || pageKey === "commissions" || includeProfile || (isClientsPage && !isClientsSecondary))
    && !isHomeSecondary;
  const coachSessionLimit = pageKey === "schedule" ? 30 : 16;
  const coachCommissionLimit = pageKey === "commissions" ? 20 : 12;
  const coachConsultLimit = 80;
  const coachActivationCodeLimit = 24;
  const coachPointsLedgerLimit = 60;
  const coachBookingLimit = 16;

  if (isHomePage && isPrimaryVariant) {
    const [profileResponse, coachProfileResponse, homeSummary] = await Promise.all([
      supabase.from("profiles").select("id, display_name, avatar_url, status").eq("id", coachId).maybeSingle(),
      supabase
        .from("coach_profiles")
        .select(
          "commission_tier, commission_rate, position_code, commission_cap, commission_bonus_notes, hours_minimum, hours_target, review_due_at, last_reviewed_at, promotion_ready, kpi_summary, notes, google_calendar_email, calendar_sync_enabled, payout_bank_name, payout_account_name, payout_account_number, payout_bank_code"
        )
        .eq("id", coachId)
        .maybeSingle(),
      getCoachHomeSummary(supabase, coachId),
    ]);

    [profileResponse, coachProfileResponse].forEach(throwOnError);

    return {
      access,
      profile: profileResponse.data || null,
      coachProfile: coachProfileResponse.data || null,
      homeSummary: homeSummary || null,
      homeDetailsLoaded: false,
      assignments: [],
      clientProfiles: [],
      clientProfileDetails: [],
      clientPackages: [],
      bookingRequests: [],
      pointsLedger: [],
      sessions: [],
      availabilityWindows: [],
      sessionChangeRequests: [],
      commissions: [],
      commissionSessions: [],
      coachLeaderboard: [],
    };
  }

  const [
    profileResponse,
    coachProfileResponse,
    assignmentsResponse,
    preferredClientLinksResponse,
    sessionsResponse,
    commissionResponse,
    availabilityResponse,
    sessionChangeRequestsResponse,
    leadsResponse,
    consultIntakesResponse,
    activationCodesResponse,
  ] = await Promise.all([
    supabase.from("profiles").select("id, display_name, avatar_url, status").eq("id", coachId).maybeSingle(),
    supabase
      .from("coach_profiles")
      .select(
        "commission_tier, commission_rate, position_code, commission_cap, commission_bonus_notes, hours_minimum, hours_target, review_due_at, last_reviewed_at, promotion_ready, kpi_summary, notes, google_calendar_email, calendar_sync_enabled, payout_bank_name, payout_account_name, payout_account_number, payout_bank_code"
      )
      .eq("id", coachId)
      .maybeSingle(),
    includeRoster || includeSchedule || includeCommissions
      ? supabase
          .from("coach_client_assignments")
          .select("id, client_id, status, assigned_at")
          .eq("coach_id", coachId)
          .eq("status", "active")
          .order("assigned_at", { ascending: true })
      : Promise.resolve({ data: [], error: null }),
    includeRoster || includeSchedule || includeCommissions
      ? supabase
          .from("client_profiles")
          .select("id")
          .eq("preferred_coach_id", coachId)
      : Promise.resolve({ data: [], error: null }),
    includeSchedule || includeCommissions
      ? supabase
          .from("sessions")
          .select("id, client_id, client_package_id, booking_request_id, scheduled_start, scheduled_end, status, session_value_rm, completed_at, coach_check_in_at, coach_check_in_by, coach_attendance_status, coach_note, coach_next_step, coach_note_recorded_at, coach_note_recorded_by")
          .eq("coach_id", coachId)
          .gte("scheduled_start", sessionWindowStartIso)
          .order("scheduled_start", { ascending: true })
          .limit(coachSessionLimit)
      : Promise.resolve({ data: [], error: null }),
    includeCommissions
      ? supabase
          .from("commission_records")
          .select("id, session_id, commission_rate, amount_rm, payout_month, payout_status, created_at")
          .eq("coach_id", coachId)
          .order("created_at", { ascending: false })
          .limit(coachCommissionLimit)
      : Promise.resolve({ data: [], error: null }),
    includeAvailability
      ? supabase
          .from("coach_availability_windows")
          .select("id, day_of_week, start_time, end_time, timezone, is_active, created_at")
          .eq("coach_id", coachId)
          .eq("is_active", true)
          .order("day_of_week", { ascending: true })
          .order("start_time", { ascending: true })
      : Promise.resolve({ data: [], error: null }),
    includeSessionChangeRequests
      ? supabase
          .from("session_change_requests")
          .select(
            "id, session_id, client_id, coach_id, request_type, original_start, original_end, requested_start, requested_end, reason, status, created_at"
          )
          .eq("coach_id", coachId)
          .order("created_at", { ascending: false })
          .limit(30)
      : Promise.resolve({ data: [], error: null }),
    includeConsults
      ? supabase
          .from("leads")
          .select("id, full_name, email, phone, source, status, next_follow_up_at, owner_id, notes, converted_client_id, created_at")
          .eq("owner_id", coachId)
          .order("created_at", { ascending: false })
          .limit(coachConsultLimit)
      : Promise.resolve({ data: [], error: null }),
    includeConsults
      ? supabase
          .from("coach_consult_intakes")
          .select(
            "id, coach_id, lead_id, summary, hotness, recommended_service, recommended_frequency, recommended_timeline, next_step, primary_goal, biggest_barrier, primary_lever, risk_flags, created_at"
          )
          .eq("coach_id", coachId)
          .order("created_at", { ascending: false })
          .limit(coachConsultLimit)
      : Promise.resolve({ data: [], error: null }),
    includeConsults
      ? supabase
          .from("activation_codes")
          .select("id, role, code, recipient_email, recipient_name, assigned_coach_id, status, expires_at, used_at, created_at")
          .eq("role", "client")
          .or(`generated_by.eq.${coachId},assigned_coach_id.eq.${coachId}`)
          .order("created_at", { ascending: false })
          .limit(coachActivationCodeLimit)
      : Promise.resolve({ data: [], error: null }),
  ]);

  [
    profileResponse,
    coachProfileResponse,
    assignmentsResponse,
    preferredClientLinksResponse,
    sessionsResponse,
    commissionResponse,
    availabilityResponse,
    sessionChangeRequestsResponse,
    leadsResponse,
    consultIntakesResponse,
    activationCodesResponse,
  ].forEach(throwOnError);

  const assignments = assignmentsResponse.data || [];
  const sessions = sessionsResponse.data || [];
  const commissions = commissionResponse.data || [];
  const availabilityWindows = availabilityResponse.data || [];
  const sessionChangeRequests = sessionChangeRequestsResponse.data || [];
  const leads = leadsResponse.data || [];
  const consultIntakes = consultIntakesResponse.data || [];
  const activationCodes = activationCodesResponse.data || [];
  const clientIds = uniqueValues([
    ...assignments.map((assignment) => assignment.client_id),
    ...((preferredClientLinksResponse.data || []).map((item) => item.id)),
  ]);
  const leadIds = leads.map((lead) => lead.id).filter(Boolean);

  let clientProfiles = [];
  let clientProfileDetails = [];
  let clientPackages = [];
  let bookingRequests = [];
  let pointsLedger = [];
  let leadActivities = [];

  if (clientIds.length && (includeRoster || includeSchedule || includeCommissions)) {
    const [
      clientProfilesResponse,
      clientProfileDetailsResponse,
      clientPackagesResponse,
      bookingRequestsResponse,
      pointsLedgerResponse,
    ] = await Promise.all([
      supabase.from("profiles").select("id, display_name, status").in("id", clientIds),
      supabase
        .from("client_profiles")
        .select("id, preferred_name, xp_points, gym_coins, primary_goal")
        .in("id", clientIds),
      includeClientPackages
        ? supabase
            .from("client_packages")
            .select("id, client_id, order_id, package_name, sessions_purchased, sessions_remaining, activated_at, expires_at, status")
            .in("client_id", clientIds)
            .order("created_at", { ascending: false })
        : Promise.resolve({ data: [], error: null }),
      includeRoster || includeSchedule
        ? supabase
            .from("booking_requests")
            .select("id, client_id, preferred_coach_id, client_package_id, requested_date, requested_time, notes, status, created_at")
            .in("client_id", clientIds)
            .order("created_at", { ascending: false })
            .limit(coachBookingLimit)
        : Promise.resolve({ data: [], error: null }),
      includePointsLedger
        ? supabase
            .from("points_ledger")
            .select("id, client_id, points_type, delta, reason, requested_by, approval_status, created_at")
            .in("client_id", clientIds)
            .order("created_at", { ascending: false })
            .limit(coachPointsLedgerLimit)
        : Promise.resolve({ data: [], error: null }),
    ]);

    [
      clientProfilesResponse,
      clientProfileDetailsResponse,
      clientPackagesResponse,
      bookingRequestsResponse,
      pointsLedgerResponse,
    ].forEach(throwOnError);

    clientProfiles = clientProfilesResponse.data || [];
    clientProfileDetails = clientProfileDetailsResponse.data || [];
    clientPackages = clientPackagesResponse.data || [];
    bookingRequests = bookingRequestsResponse.data || [];
    pointsLedger = pointsLedgerResponse.data || [];
  }

  if (includeConsults && leadIds.length) {
    const leadActivitiesResponse = await supabase
      .from("lead_activities")
      .select("id, lead_id, actor_id, activity_type, notes, created_at")
      .in("lead_id", leadIds)
      .order("created_at", { ascending: false })
      .limit(coachConsultLimit);

    throwOnError(leadActivitiesResponse);
    leadActivities = leadActivitiesResponse.data || [];
  }

  const commissionSessionIds = commissions.map((record) => record.session_id).filter(Boolean);
  const missingCommissionSessionIds = commissionSessionIds.filter(
    (sessionId) => !sessions.some((session) => session.id === sessionId)
  );
  let commissionSessions = sessions;

  if (includeCommissions && missingCommissionSessionIds.length) {
    const commissionSessionsResponse = await supabase
      .from("sessions")
      .select("id, client_id, client_package_id, booking_request_id, scheduled_start, scheduled_end, status, session_value_rm, completed_at, coach_check_in_at, coach_check_in_by, coach_attendance_status, coach_note, coach_next_step, coach_note_recorded_at, coach_note_recorded_by")
      .in("id", missingCommissionSessionIds);

    throwOnError(commissionSessionsResponse);
    commissionSessions = sessions.concat(commissionSessionsResponse.data || []);
  }

  const coachLeaderboard = includeLeaderboard ? await loadCoachLeaderboard(supabase, 8) : [];

  return {
    access,
    profile: profileResponse.data || null,
    coachProfile: coachProfileResponse.data || null,
    ...(isHomePage
      ? {
          homeDetailsLoaded: true,
        }
      : {}),
    ...(isClientsPage
      ? {
          clientWorkspaceDetailsLoaded: !isClientsPrimary,
        }
      : {}),
    ...(includeRoster || includeSchedule || includeCommissions
      ? {
          assignments,
          clientProfiles,
          clientProfileDetails,
        }
      : {}),
    ...(includePointsLedger
      ? {
          clientPackages,
          pointsLedger,
        }
      : {}),
    ...(includeRoster || includeSchedule
      ? {
          bookingRequests,
        }
      : {}),
    ...(includeSchedule
      ? {
          sessions,
          availabilityWindows,
          sessionChangeRequests,
        }
      : {}),
    ...(includeCommissions
      ? {
          commissions,
          commissionSessions,
          sessions,
        }
      : {}),
    ...(includeConsults
      ? {
          leads,
          leadActivities,
          consultIntakes,
          activationCodes,
        }
      : {}),
    ...(includeLeaderboard
      ? {
          coachLeaderboard,
        }
      : {}),
  };
}

function buildAdminActorProfiles(coaches, clients, adminId) {
  return Array.from(
    new Map(
      filterOperationalProfiles(coaches || [])
        .concat(filterOperationalProfiles(clients || []))
        .concat([{ id: adminId, display_name: "Super Admin", role: "super_admin" }])
        .filter((item) => item?.id)
        .map((item) => [
          item.id,
          {
            id: item.id,
            display_name: item.display_name || "Account",
            role: item.role || item.status || "",
          },
        ])
    ).values()
  );
}

async function getAdminDashboardPayload(supabase, auth, pageKey, options = {}) {
  const access = buildAccess(auth);
  const currentMonthStart = startOfCurrentMonth().toISOString().slice(0, 10);
  const isAdminHome = pageKey === "home";
  const isLeadsPage = pageKey === "leads";
  const isFinancialsPage = pageKey === "financials";
  const variant = String(options?.variant || "")
    .trim()
    .toLowerCase();
  const isPrimaryVariant = variant === "primary";
  const isSecondaryVariant = variant === "secondary";
  const isHomePrimary = isAdminHome && isPrimaryVariant;
  const isLeadsPrimary = isLeadsPage && isPrimaryVariant;
  const isLeadsSecondary = isLeadsPage && isSecondaryVariant;
  const isFinancialsPrimary = isFinancialsPage && isPrimaryVariant;
  const isFinancialsSecondary = isFinancialsPage && isSecondaryVariant;

  if (isHomePrimary) {
    const [notificationsResponse, homeSummary] = await Promise.all([
      supabase
        .from("notifications")
        .select("id, category, title, body, action_url, is_read, created_at")
        .order("created_at", { ascending: false })
        .limit(40),
      getAdminHomeSummary(supabase, access.user.id),
    ]);

    throwOnError(notificationsResponse);

    return {
      access,
      homeSummary: homeSummary || null,
      notifications: filterOperationalNotifications(notificationsResponse.data || []),
      coaches: [],
      coachProfiles: [],
      clients: [],
      clientProfiles: [],
      assignments: [],
      clientPackages: [],
      rewards: [],
      plannerRewardEvents: [],
      leads: [],
      leadActivities: [],
      orders: [],
      sessions: [],
      payments: [],
      orderItems: [],
      commissions: [],
      bookingRequests: [],
      actorProfiles: [],
      activationCodes: [],
      currentMonthStart,
    };
  }

  if (pageKey === "clients") {
    const [
      coachesResponse,
      coachProfilesResponse,
      clientsResponse,
      clientProfilesResponse,
      assignmentsResponse,
      packagesResponse,
      rewardsResponse,
      notificationsResponse,
      activationCodesResponse,
    ] = await Promise.all([
      supabase.from("profiles").select("id, display_name, role, status").eq("role", "coach").order("created_at", { ascending: true }),
      supabase
        .from("coach_profiles")
        .select(
          "id, commission_tier, commission_rate, position_code, commission_cap, commission_bonus_notes, hours_minimum, hours_target, review_due_at, last_reviewed_at, promotion_ready, kpi_summary, notes, google_calendar_email, calendar_sync_enabled"
        )
        .order("created_at", { ascending: true }),
      supabase.from("profiles").select("id, display_name, role, status").eq("role", "client").order("created_at", { ascending: true }),
      supabase.from("client_profiles").select("id, preferred_name, xp_points, gym_coins, primary_goal"),
      supabase
        .from("coach_client_assignments")
        .select("id, coach_id, client_id, status, assigned_at, ended_at")
        .order("assigned_at", { ascending: false }),
      supabase
        .from("client_packages")
        .select("id, client_id, package_name, sessions_purchased, sessions_remaining, status, order_id, created_at, activated_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("points_ledger")
        .select("id, client_id, points_type, delta, reason, requested_by, approved_by, approval_status, created_at")
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("notifications")
        .select("id, category, title, body, action_url, is_read, created_at")
        .order("created_at", { ascending: false })
        .limit(40),
      supabase
        .from("activation_codes")
        .select("id, role, code, recipient_email, recipient_name, assigned_coach_id, status, expires_at, used_at, created_at")
        .order("created_at", { ascending: false })
        .limit(60),
    ]);

    [
      coachesResponse,
      coachProfilesResponse,
      clientsResponse,
      clientProfilesResponse,
      assignmentsResponse,
      packagesResponse,
      rewardsResponse,
      notificationsResponse,
      activationCodesResponse,
    ].forEach(throwOnError);

    const coaches = filterOperationalProfiles(coachesResponse.data || []);
    const clients = filterOperationalProfiles(clientsResponse.data || []);
    const coachIds = uniqueValues(coaches.map((item) => item.id));
    const clientIds = uniqueValues(clients.map((item) => item.id));
    const rewards = filterRowsByAllowedIds(rewardsResponse.data || [], "client_id", clientIds);
    const plannerRewardEvents = await loadPlannerRewardEventsForLedgerEntries(supabase, rewards);
    const assignments = (assignmentsResponse.data || []).filter(
      (assignment) => coachIds.includes(assignment?.coach_id) && clientIds.includes(assignment?.client_id)
    );
    const clientPackages = filterRowsByAllowedIds(packagesResponse.data || [], "client_id", clientIds);
    const activationCodes = filterOperationalActivationCodes(activationCodesResponse.data || []);
    const coachProfiles = filterRowsByAllowedIds(coachProfilesResponse.data || [], "id", coachIds);
    const clientProfiles = filterRowsByAllowedIds(clientProfilesResponse.data || [], "id", clientIds);
    const notifications = filterOperationalNotifications(notificationsResponse.data || []);

    return {
      access,
      coaches,
      coachProfiles,
      clients,
      clientProfiles,
      assignments,
      clientPackages,
      rewards,
      plannerRewardEvents,
      notifications,
      activationCodes,
      actorProfiles: buildAdminActorProfiles(coaches, clients, access.user.id),
      currentMonthStart,
    };
  }

  if (pageKey === "leads") {
    if (isLeadsPrimary) {
      const [coachesResponse, leadsResponse] = await Promise.all([
        supabase.from("profiles").select("id, display_name, status").eq("role", "coach").order("created_at", { ascending: true }),
        supabase
          .from("leads")
          .select("id, full_name, email, phone, source, status, next_follow_up_at, owner_id, notes, converted_client_id, created_at")
          .order("created_at", { ascending: false })
          .limit(120),
      ]);

      [coachesResponse, leadsResponse].forEach(throwOnError);

      const coaches = filterOperationalProfiles(coachesResponse.data || []);
      const leads = filterOperationalLeads(leadsResponse.data || []);
      const actorIds = uniqueValues(
        leads
          .flatMap((lead) => [lead.owner_id, lead.converted_client_id])
          .concat(access.user.id)
      );
      const actorProfilesResponse = actorIds.length
        ? await supabase.from("profiles").select("id, display_name, role").in("id", actorIds)
        : { data: [], error: null };

      throwOnError(actorProfilesResponse);

      return {
        access,
        coaches,
        leads,
        actorProfiles: filterOperationalProfiles(actorProfilesResponse.data || []),
        leadActivities: [],
        notifications: [],
        leadWorkspaceDetailsLoaded: false,
        currentMonthStart,
      };
    }

    if (isLeadsSecondary) {
      const [leadActivitiesResponse, notificationsResponse] = await Promise.all([
        supabase
          .from("lead_activities")
          .select("id, lead_id, actor_id, activity_type, notes, created_at")
          .order("created_at", { ascending: false })
          .limit(80),
        supabase
          .from("notifications")
          .select("id, category, title, body, action_url, is_read, created_at")
          .order("created_at", { ascending: false })
          .limit(40),
      ]);

      [leadActivitiesResponse, notificationsResponse].forEach(throwOnError);

      const leadActivities = (leadActivitiesResponse.data || []).filter(
        (activity) => !matchesNonOperationalName(activity?.notes) && !matchesNonOperationalEmail(activity?.notes)
      );
      const actorIds = uniqueValues(leadActivities.flatMap((activity) => [activity.actor_id]).concat(access.user.id));
      const actorProfilesResponse = actorIds.length
        ? await supabase.from("profiles").select("id, display_name, role").in("id", actorIds)
        : { data: [], error: null };

      throwOnError(actorProfilesResponse);

      return {
        access,
        leadActivities,
        notifications: filterOperationalNotifications(notificationsResponse.data || []),
        actorProfiles: filterOperationalProfiles(actorProfilesResponse.data || []),
        leadWorkspaceDetailsLoaded: true,
        currentMonthStart,
      };
    }

    const [coachesResponse, leadsResponse, leadActivitiesResponse] = await Promise.all([
      supabase.from("profiles").select("id, display_name, status").eq("role", "coach").order("created_at", { ascending: true }),
      supabase
        .from("leads")
        .select("id, full_name, email, phone, source, status, next_follow_up_at, owner_id, notes, converted_client_id, created_at")
        .order("created_at", { ascending: false })
        .limit(120),
      supabase
        .from("lead_activities")
        .select("id, lead_id, actor_id, activity_type, notes, created_at")
        .order("created_at", { ascending: false })
        .limit(80),
    ]);

    [coachesResponse, leadsResponse, leadActivitiesResponse].forEach(throwOnError);

    const coaches = filterOperationalProfiles(coachesResponse.data || []);
    const leads = filterOperationalLeads(leadsResponse.data || []);
    const allowedLeadIds = uniqueValues(leads.map((lead) => lead.id));
    const leadActivities = filterOperationalLeadActivities(leadActivitiesResponse.data || [], allowedLeadIds);
    const actorIds = uniqueValues(
      leads
        .flatMap((lead) => [lead.owner_id, lead.converted_client_id])
        .concat(leadActivities.flatMap((activity) => [activity.actor_id]))
        .concat(access.user.id)
    );
    const actorProfilesResponse = actorIds.length
      ? await supabase.from("profiles").select("id, display_name, role").in("id", actorIds)
      : { data: [], error: null };

    throwOnError(actorProfilesResponse);

    return {
      access,
      coaches,
      leads,
      leadActivities,
      actorProfiles: filterOperationalProfiles(actorProfilesResponse.data || []),
      leadWorkspaceDetailsLoaded: true,
      currentMonthStart,
    };
  }

  if (pageKey === "financials") {
    if (isFinancialsPrimary) {
      const [homeSummary, coachesResponse, clientsResponse, ordersResponse, commissionsResponse] = await Promise.all([
        getAdminHomeSummary(supabase, access.user.id),
        supabase.from("profiles").select("id, display_name, status").eq("role", "coach").order("created_at", { ascending: true }),
        supabase.from("profiles").select("id, display_name, status").eq("role", "client").order("created_at", { ascending: true }),
        supabase
          .from("orders")
          .select(
            "id, client_id, order_type, total_amount_rm, tax_amount_rm, status, created_at, external_reference, invoice_number, invoice_storage_path, receipt_number, receipt_storage_path, refund_receipt_number, refund_receipt_storage_path"
          )
          .order("created_at", { ascending: false })
          .limit(60),
        supabase
          .from("commission_records")
          .select("id, coach_id, session_id, amount_rm, payout_month, payout_status, created_at")
          .order("created_at", { ascending: false })
          .limit(80),
      ]);

      [coachesResponse, clientsResponse, ordersResponse, commissionsResponse].forEach(throwOnError);

      const coaches = filterOperationalProfiles(coachesResponse.data || []);
      const coachIds = uniqueValues(coaches.map((item) => item.id));
      const clients = filterOperationalProfiles(clientsResponse.data || []);
      const clientIds = uniqueValues(clients.map((item) => item.id));
      const orders = filterRowsByAllowedIds(ordersResponse.data || [], "client_id", clientIds);
      const commissions = filterRowsByAllowedIds(commissionsResponse.data || [], "coach_id", coachIds);
      const orderIds = orders.map((order) => order.id).filter(Boolean);
      const paymentsResponse = orderIds.length
        ? await supabase.from("payments").select("order_id, status, fees_rm, payment_method").in("order_id", orderIds)
        : { data: [], error: null };

      throwOnError(paymentsResponse);

      return {
        access,
        homeSummary: homeSummary || null,
        coaches,
        clients,
        orders,
        payments: paymentsResponse.data || [],
        commissions,
        clientPackages: [],
        sessions: [],
        orderItems: [],
        bookingRequests: [],
        leads: [],
        financialWorkspaceDetailsLoaded: false,
        currentMonthStart,
      };
    }

    if (isFinancialsSecondary) {
      const [
        clientsResponse,
        leadsResponse,
        packagesResponse,
        ordersResponse,
        sessionsResponse,
        bookingRequestsResponse,
      ] = await Promise.all([
        supabase.from("profiles").select("id, display_name, status").eq("role", "client").order("created_at", { ascending: true }),
        supabase
          .from("leads")
          .select("id, full_name, email, phone, source, status, next_follow_up_at, owner_id, notes, converted_client_id, created_at")
          .order("created_at", { ascending: false })
          .limit(120),
        supabase
          .from("client_packages")
          .select("id, client_id, package_name, sessions_purchased, sessions_remaining, status, order_id, created_at, activated_at")
          .order("created_at", { ascending: false }),
        supabase
          .from("orders")
          .select(
            "id, client_id, order_type, total_amount_rm, tax_amount_rm, status, created_at, external_reference, invoice_number, invoice_storage_path, receipt_number, receipt_storage_path, refund_receipt_number, refund_receipt_storage_path"
          )
          .order("created_at", { ascending: false })
          .limit(120),
        supabase
          .from("sessions")
          .select("id, client_package_id, coach_id, status, scheduled_start, scheduled_end, session_value_rm, completed_at")
          .order("created_at", { ascending: false })
          .limit(400),
        supabase
          .from("booking_requests")
          .select("id, client_id, client_package_id, status")
          .order("created_at", { ascending: false })
          .limit(120),
      ]);

      [
        clientsResponse,
        leadsResponse,
        packagesResponse,
        ordersResponse,
        sessionsResponse,
        bookingRequestsResponse,
      ].forEach(throwOnError);

      const clients = filterOperationalProfiles(clientsResponse.data || []);
      const clientIds = uniqueValues(clients.map((item) => item.id));
      const leads = filterOperationalLeads(leadsResponse.data || []);
      const clientPackages = filterRowsByAllowedIds(packagesResponse.data || [], "client_id", clientIds);
      const packageIds = uniqueValues(clientPackages.map((item) => item.id));
      const orders = filterRowsByAllowedIds(ordersResponse.data || [], "client_id", clientIds);
      const sessions = filterRowsByAllowedIds(sessionsResponse.data || [], "client_package_id", packageIds);
      const bookingRequests = filterRowsByAllowedIds(bookingRequestsResponse.data || [], "client_id", clientIds);
      const orderIds = orders.map((order) => order.id).filter(Boolean);
      const [paymentsResponse, orderItemsResponse] = await Promise.all([
        orderIds.length
          ? supabase.from("payments").select("order_id, status, fees_rm, payment_method").in("order_id", orderIds)
          : Promise.resolve({ data: [], error: null }),
        orderIds.length
          ? supabase
              .from("order_items")
              .select("order_id, package_id, package_code, name, quantity, total_amount_rm, metadata")
              .in("order_id", orderIds)
          : Promise.resolve({ data: [], error: null }),
      ]);

      [paymentsResponse, orderItemsResponse].forEach(throwOnError);

      return {
        access,
        clients,
        leads,
        clientPackages,
        orders,
        payments: paymentsResponse.data || [],
        orderItems: orderItemsResponse.data || [],
        sessions,
        bookingRequests,
        financialWorkspaceDetailsLoaded: true,
        currentMonthStart,
      };
    }

    const [
      coachesResponse,
      clientsResponse,
      packagesResponse,
      ordersResponse,
      sessionsResponse,
      commissionsResponse,
      bookingRequestsResponse,
    ] = await Promise.all([
      supabase.from("profiles").select("id, display_name, status").eq("role", "coach").order("created_at", { ascending: true }),
      supabase.from("profiles").select("id, display_name, status").eq("role", "client").order("created_at", { ascending: true }),
      supabase
        .from("client_packages")
        .select("id, client_id, package_name, sessions_purchased, sessions_remaining, status, order_id, created_at, activated_at")
        .order("created_at", { ascending: false }),
        supabase
          .from("orders")
          .select(
            "id, client_id, order_type, total_amount_rm, tax_amount_rm, status, created_at, external_reference, invoice_number, invoice_storage_path, receipt_number, receipt_storage_path, refund_receipt_number, refund_receipt_storage_path"
          )
          .order("created_at", { ascending: false })
          .limit(120),
      supabase
        .from("sessions")
        .select("id, client_package_id, coach_id, status, scheduled_start, scheduled_end, session_value_rm, completed_at")
        .order("created_at", { ascending: false })
        .limit(400),
      supabase
        .from("commission_records")
        .select("id, coach_id, session_id, amount_rm, payout_month, payout_status, created_at")
        .order("created_at", { ascending: false })
        .limit(120),
      supabase
        .from("booking_requests")
        .select("id, client_id, client_package_id, status")
        .order("created_at", { ascending: false })
        .limit(120),
    ]);

    [
      coachesResponse,
      clientsResponse,
      packagesResponse,
      ordersResponse,
      sessionsResponse,
      commissionsResponse,
      bookingRequestsResponse,
    ].forEach(throwOnError);

    const coaches = filterOperationalProfiles(coachesResponse.data || []);
    const coachIds = uniqueValues(coaches.map((item) => item.id));
    const clients = filterOperationalProfiles(clientsResponse.data || []);
    const clientIds = uniqueValues(clients.map((item) => item.id));
    const clientPackages = filterRowsByAllowedIds(packagesResponse.data || [], "client_id", clientIds);
    const packageIds = uniqueValues(clientPackages.map((item) => item.id));
    const orders = filterRowsByAllowedIds(ordersResponse.data || [], "client_id", clientIds);
    const orderIds = orders.map((order) => order.id);
    const sessions = filterRowsByAllowedIds(sessionsResponse.data || [], "client_package_id", packageIds);
    const commissions = filterRowsByAllowedIds(commissionsResponse.data || [], "coach_id", coachIds);
    const bookingRequests = filterRowsByAllowedIds(bookingRequestsResponse.data || [], "client_id", clientIds);
    const [paymentsResponse, orderItemsResponse] = await Promise.all([
      orderIds.length
        ? supabase.from("payments").select("order_id, status, fees_rm, payment_method").in("order_id", orderIds)
        : Promise.resolve({ data: [], error: null }),
      orderIds.length
        ? supabase
            .from("order_items")
            .select("order_id, package_id, package_code, name, quantity, total_amount_rm, metadata")
            .in("order_id", orderIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

    [paymentsResponse, orderItemsResponse].forEach(throwOnError);

    return {
      access,
      coaches,
      clients,
      clientPackages,
      orders,
      sessions,
      payments: paymentsResponse.data || [],
      orderItems: orderItemsResponse.data || [],
      commissions,
      bookingRequests,
      financialWorkspaceDetailsLoaded: true,
      currentMonthStart,
    };
  }

  if (pageKey === "settings") {
    const notificationsResponse = await supabase
      .from("notifications")
      .select("id, category, title, body, action_url, is_read, created_at")
      .order("created_at", { ascending: false })
      .limit(40);

    throwOnError(notificationsResponse);

    return {
      access,
      notifications: notificationsResponse.data || [],
      currentMonthStart,
    };
  }

  if (pageKey === "newsletter") {
    return {
      access,
      currentMonthStart,
    };
  }

  const [
    coachesResponse,
    coachProfilesResponse,
    clientsResponse,
    clientProfilesResponse,
    assignmentsResponse,
    packagesResponse,
    rewardsResponse,
    leadsResponse,
    leadActivitiesResponse,
    ordersResponse,
    sessionsResponse,
    commissionsResponse,
    bookingRequestsResponse,
    notificationsResponse,
  ] = await Promise.all([
    supabase.from("profiles").select("id, display_name, status").eq("role", "coach").order("created_at", { ascending: true }),
    supabase
      .from("coach_profiles")
      .select(
        "id, commission_tier, commission_rate, position_code, commission_cap, commission_bonus_notes, hours_minimum, hours_target, review_due_at, last_reviewed_at, promotion_ready, kpi_summary, notes, google_calendar_email, calendar_sync_enabled"
      )
      .order("created_at", { ascending: true }),
    isHomePrimary
      ? Promise.resolve({ data: [], error: null })
      : supabase.from("profiles").select("id, display_name, status").eq("role", "client").order("created_at", { ascending: true }),
    isHomePrimary
      ? Promise.resolve({ data: [], error: null })
      : supabase.from("client_profiles").select("id, preferred_name, xp_points, gym_coins, primary_goal"),
    supabase
      .from("coach_client_assignments")
      .select("id, coach_id, client_id, status, assigned_at, ended_at")
      .order("assigned_at", { ascending: false }),
    supabase
      .from("client_packages")
      .select("id, client_id, package_name, sessions_purchased, sessions_remaining, status, order_id, created_at, activated_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("points_ledger")
      .select("id, client_id, points_type, delta, reason, requested_by, approved_by, approval_status, created_at")
      .order("created_at", { ascending: false })
      .limit(isHomePrimary ? 24 : isAdminHome ? 40 : 50),
    supabase
      .from("leads")
      .select("id, full_name, email, phone, source, status, next_follow_up_at, owner_id, notes, converted_client_id, created_at")
      .order("created_at", { ascending: false })
      .limit(isHomePrimary ? 60 : isAdminHome ? 80 : 120),
    isHomePrimary
      ? Promise.resolve({ data: [], error: null })
      : supabase
          .from("lead_activities")
          .select("id, lead_id, actor_id, activity_type, notes, created_at")
          .order("created_at", { ascending: false })
          .limit(isAdminHome ? 60 : 80),
    supabase
      .from("orders")
      .select(
        "id, client_id, order_type, total_amount_rm, tax_amount_rm, status, created_at, external_reference, invoice_number, invoice_storage_path, receipt_number, receipt_storage_path, refund_receipt_number, refund_receipt_storage_path"
      )
      .order("created_at", { ascending: false })
      .limit(isHomePrimary ? 60 : isAdminHome ? 80 : 120),
    supabase
      .from("sessions")
      .select("id, client_package_id, coach_id, status, scheduled_start, scheduled_end, session_value_rm, completed_at")
      .order("created_at", { ascending: false })
      .limit(isHomePrimary ? 180 : isAdminHome ? 240 : 400),
    supabase
      .from("commission_records")
      .select("id, coach_id, session_id, amount_rm, payout_month, payout_status, created_at")
      .order("created_at", { ascending: false })
      .limit(isHomePrimary ? 60 : isAdminHome ? 80 : 120),
    supabase
      .from("booking_requests")
      .select("id, client_id, client_package_id, status")
      .order("created_at", { ascending: false })
      .limit(isHomePrimary ? 60 : isAdminHome ? 80 : 120),
    supabase
      .from("notifications")
      .select("id, category, title, body, action_url, is_read, created_at")
      .order("created_at", { ascending: false })
      .limit(40),
  ]);

  [
    coachesResponse,
    coachProfilesResponse,
    clientsResponse,
    clientProfilesResponse,
    assignmentsResponse,
    packagesResponse,
    rewardsResponse,
    leadsResponse,
    leadActivitiesResponse,
    ordersResponse,
    sessionsResponse,
    commissionsResponse,
    bookingRequestsResponse,
    notificationsResponse,
  ].forEach(throwOnError);

  const coaches = filterOperationalProfiles(coachesResponse.data || []);
  const clients = filterOperationalProfiles(clientsResponse.data || []);
  const clientIds = uniqueValues(clients.map((item) => item.id));
  const packageIds = uniqueValues(
    filterRowsByAllowedIds(packagesResponse.data || [], "client_id", clientIds).map((item) => item.id)
  );
  const leads = filterOperationalLeads(leadsResponse.data || []);
  const allowedLeadIds = uniqueValues(leads.map((lead) => lead.id));
  const leadActivities = isHomePrimary
    ? []
    : filterOperationalLeadActivities(leadActivitiesResponse.data || [], allowedLeadIds);
  const orders = filterRowsByAllowedIds(ordersResponse.data || [], "client_id", clientIds);
  const sessions = filterRowsByAllowedIds(sessionsResponse.data || [], "client_package_id", packageIds);
  const rewards = filterRowsByAllowedIds(rewardsResponse.data || [], "client_id", clientIds);
  const plannerRewardEvents = isHomePrimary
    ? []
    : await loadPlannerRewardEventsForLedgerEntries(supabase, rewards);
  const orderIds = orders.map((order) => order.id);
  const actorIds = uniqueValues(
    rewards
      .flatMap((reward) => [reward.client_id, reward.requested_by])
      .concat(leads.flatMap((lead) => [lead.owner_id, lead.converted_client_id]))
      .concat(leadActivities.flatMap((activity) => [activity.actor_id]))
      .concat(access.user.id)
  );

  const [paymentsResponse, orderItemsResponse, actorProfilesResponse] = await Promise.all([
    orderIds.length
      ? supabase.from("payments").select("order_id, status, fees_rm, payment_method").in("order_id", orderIds)
      : Promise.resolve({ data: [], error: null }),
    !isHomePrimary && orderIds.length
      ? supabase
          .from("order_items")
          .select("order_id, package_id, package_code, name, quantity, total_amount_rm, metadata")
          .in("order_id", orderIds)
      : Promise.resolve({ data: [], error: null }),
    !isHomePrimary && actorIds.length
      ? supabase.from("profiles").select("id, display_name, role").in("id", actorIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  [paymentsResponse, orderItemsResponse, actorProfilesResponse].forEach(throwOnError);

  const coachIds = uniqueValues(coaches.map((item) => item.id));
  const allowedActorIds = uniqueValues(coachIds.concat(clientIds, access.user.id));

  return {
    access,
    coaches,
    coachProfiles: filterRowsByAllowedIds(coachProfilesResponse.data || [], "id", coachIds),
    clients,
    clientProfiles: filterRowsByAllowedIds(clientProfilesResponse.data || [], "id", clientIds),
    assignments: (assignmentsResponse.data || []).filter(
      (assignment) => coachIds.includes(assignment?.coach_id) && clientIds.includes(assignment?.client_id)
    ),
    clientPackages: filterRowsByAllowedIds(packagesResponse.data || [], "client_id", clientIds),
    rewards,
    plannerRewardEvents,
    leads,
    leadActivities,
    notifications: filterOperationalNotifications(notificationsResponse.data || []),
    orders,
    sessions,
    payments: paymentsResponse.data || [],
    orderItems: orderItemsResponse.data || [],
    commissions: filterRowsByAllowedIds(commissionsResponse.data || [], "coach_id", coachIds),
    bookingRequests: filterRowsByAllowedIds(bookingRequestsResponse.data || [], "client_id", clientIds),
    actorProfiles: filterRowsByAllowedIds(actorProfilesResponse.data || [], "id", allowedActorIds),
    currentMonthStart,
  };
}

async function getAdminCoachReviewQueueResource(supabase, auth, options = {}) {
  const access = buildAccess(auth);
  const homeSummary = await getAdminHomeSummary(supabase, access.user.id);
  let rows = Array.isArray(homeSummary?.reviewRows)
    ? homeSummary.reviewRows
        .filter(Boolean)
        .map((row) => {
          const reviewTimestamp = row?.reviewDueAt ? new Date(row.reviewDueAt).getTime() : Number.NaN;
          return {
            coachId: String(row?.coachId || "").trim(),
            coachName: String(row?.coachName || "").trim() || "Coach",
            positionLabel: normalizeDisplayLabel(row?.positionCode, "Not assigned"),
            tierLabel: String(row?.tierCode || "").trim() || "No tier",
            kpiLabel: `${Math.max(0, Number(row?.checkedCount || 0))}/${Math.max(0, Number(row?.totalCount || 0))} checks`,
            reviewLabel: row?.reviewDueAt ? new Date(row.reviewDueAt).toISOString() : "",
            status: row?.promotionReady
              ? "promotion_ready"
              : row?.assessmentComplete && Number(row?.checkedCount || 0) === Number(row?.totalCount || 0)
                ? "on_track"
                : Number.isFinite(reviewTimestamp) && reviewTimestamp < Date.now()
                  ? "overdue"
                  : "due_soon",
            sortKey: Number.isFinite(reviewTimestamp) ? reviewTimestamp : Number.MAX_SAFE_INTEGER,
          };
        })
    : [];

  if (!rows.length) {
    const [profilesResponse, coachProfilesResponse] = await Promise.all([
      supabase.from("profiles").select("id, display_name").eq("role", "coach").order("created_at", { ascending: true }),
      supabase
        .from("coach_profiles")
        .select("id, commission_tier, position_code, review_due_at, promotion_ready, kpi_summary")
        .order("created_at", { ascending: true }),
    ]);

    [profilesResponse, coachProfilesResponse].forEach(throwOnError);

    const coachNameById = new Map((profilesResponse.data || []).map((item) => [item.id, item.display_name || "Coach"]));
    rows = (coachProfilesResponse.data || []).map((profile) => {
      const kpiSummary = asObject(profile?.kpi_summary);
      const items = Array.isArray(kpiSummary.items) ? kpiSummary.items : [];
      const checkedCount = items.filter((item) => item?.checked).length;
      const totalCount = items.length;
      const reviewTimestamp = profile?.review_due_at ? new Date(profile.review_due_at).getTime() : Number.NaN;
      return {
        coachId: String(profile?.id || "").trim(),
        coachName: coachNameById.get(profile?.id) || "Coach",
        positionLabel: normalizeDisplayLabel(profile?.position_code, "Not assigned"),
        tierLabel: String(profile?.commission_tier || "").trim() || "No tier",
        kpiLabel: `${checkedCount}/${totalCount} checks`,
        reviewLabel: profile?.review_due_at ? new Date(profile.review_due_at).toISOString() : "",
        status: profile?.promotion_ready
          ? "promotion_ready"
          : totalCount > 0 && checkedCount === totalCount && Boolean(kpiSummary.assessmentComplete)
            ? "on_track"
            : Number.isFinite(reviewTimestamp) && reviewTimestamp < Date.now()
              ? "overdue"
              : "due_soon",
        sortKey: Number.isFinite(reviewTimestamp) ? reviewTimestamp : Number.MAX_SAFE_INTEGER,
      };
    });
  }

  rows.sort((left, right) => left.sortKey - right.sortKey || left.coachName.localeCompare(right.coachName));
  const paginated = paginateCollection(rows, options?.page, options?.pageSize);
  return {
    resource: "coach_review_queue",
    rows: paginated.rows,
    pagination: paginated.pagination,
  };
}

async function getCoachSessionQueueResource(supabase, auth, options = {}) {
  const coachId = buildAccess(auth).user.id;
  const requestedPage = clampPositiveInt(options?.page, 1, 500);
  const pageSize = clampPositiveInt(options?.pageSize, 10, 50);
  const startIndex = (requestedPage - 1) * pageSize;
  const quarterStartIso = startOfCurrentQuarter().toISOString();

  const selectFields = [
    "id",
    "client_id",
    "booking_request_id",
    "scheduled_start",
    "scheduled_end",
    "status",
    "coach_check_in_at",
    "coach_check_in_by",
    "coach_attendance_status",
    "coach_note",
    "coach_next_step",
    "coach_note_recorded_at",
    "coach_note_recorded_by",
  ].join(", ");

  const fetchSessionPage = async (pageNumber) =>
    supabase
      .from("sessions")
      .select(selectFields, { count: "exact" })
      .eq("coach_id", coachId)
      .gte("scheduled_start", quarterStartIso)
      .order("scheduled_start", { ascending: true })
      .range((pageNumber - 1) * pageSize, (pageNumber - 1) * pageSize + pageSize - 1);

  let sessionsResponse = await fetchSessionPage(requestedPage);
  throwOnError(sessionsResponse);

  let pagination = buildPaginationMeta(sessionsResponse.count || 0, requestedPage, pageSize);
  if (pagination.page !== requestedPage) {
    sessionsResponse = await fetchSessionPage(pagination.page);
    throwOnError(sessionsResponse);
  }

  const sessions = sessionsResponse.data || [];
  const clientIds = uniqueValues(sessions.map((session) => session.client_id));
  const bookingRequestIds = uniqueValues(sessions.map((session) => session.booking_request_id));
  const [clientProfilesResponse, bookingRequestsResponse] = await Promise.all([
    clientIds.length
      ? supabase.from("profiles").select("id, display_name").in("id", clientIds)
      : Promise.resolve({ data: [], error: null }),
    bookingRequestIds.length
      ? supabase.from("booking_requests").select("id, notes").in("id", bookingRequestIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  [clientProfilesResponse, bookingRequestsResponse].forEach(throwOnError);

  const clientNameById = new Map((clientProfilesResponse.data || []).map((item) => [item.id, item.display_name || "Client"]));
  const bookingRequestById = new Map((bookingRequestsResponse.data || []).map((item) => [item.id, item]));
  const rows = sessions.map((session) => {
    const request = bookingRequestById.get(session.booking_request_id) || null;
    const noteParts = String(request?.notes || "")
      .split("|")
      .map((part) => part.trim())
      .filter(Boolean);
    return {
      id: session.id,
      scheduled_start: session.scheduled_start,
      scheduled_end: session.scheduled_end,
      status: session.status,
      clientName: clientNameById.get(session.client_id) || "Client",
      sessionType: noteParts[0] ? noteParts[0].replace(/^Session type:\s*/iu, "") : "Coaching",
      coach_check_in_at: session.coach_check_in_at || null,
      coach_check_in_by: session.coach_check_in_by || null,
      coach_attendance_status: session.coach_attendance_status || "",
      coach_note: session.coach_note || "",
      coach_next_step: session.coach_next_step || "",
      coach_note_recorded_at: session.coach_note_recorded_at || null,
      coach_note_recorded_by: session.coach_note_recorded_by || null,
    };
  });

  pagination = buildPaginationMeta(sessionsResponse.count || rows.length, pagination.page, pageSize);
  return {
    resource: "session_queue",
    rows,
    pagination,
  };
}

async function getCoachBookingQueueResource(supabase, auth, options = {}) {
  const coachId = buildAccess(auth).user.id;
  const [assignmentsResponse, preferredClientLinksResponse] = await Promise.all([
    supabase
      .from("coach_client_assignments")
      .select("client_id")
      .eq("coach_id", coachId)
      .eq("status", "active"),
    supabase
      .from("client_profiles")
      .select("id")
      .eq("preferred_coach_id", coachId),
  ]);

  [assignmentsResponse, preferredClientLinksResponse].forEach(throwOnError);

  const clientIds = uniqueValues(
    (assignmentsResponse.data || []).map((item) => item.client_id).concat((preferredClientLinksResponse.data || []).map((item) => item.id))
  );
  if (!clientIds.length) {
    return {
      resource: "booking_queue",
      rows: [],
      pagination: buildPaginationMeta(0, options?.page, options?.pageSize),
    };
  }

  const [clientProfilesResponse, packageResponse, requestsResponse] = await Promise.all([
    supabase.from("profiles").select("id, display_name").in("id", clientIds),
    supabase
      .from("client_packages")
      .select("id, package_name")
      .in("client_id", clientIds),
    supabase
      .from("booking_requests")
      .select("id, client_id, client_package_id, requested_date, requested_time, status, notes, created_at")
      .in("client_id", clientIds)
      .order("created_at", { ascending: false })
      .limit(250),
  ]);

  [clientProfilesResponse, packageResponse, requestsResponse].forEach(throwOnError);

  const clientNameById = new Map((clientProfilesResponse.data || []).map((item) => [item.id, item.display_name || "Client"]));
  const packageNameById = new Map((packageResponse.data || []).map((item) => [item.id, item.package_name || "Assigned package"]));
  const sortedRequests = (requestsResponse.data || [])
    .slice()
    .sort((left, right) => {
      const leftPending = String(left?.status || "").toLowerCase() === "pending" ? 0 : 1;
      const rightPending = String(right?.status || "").toLowerCase() === "pending" ? 0 : 1;
      if (leftPending !== rightPending) {
        return leftPending - rightPending;
      }
      const leftTime = new Date(`${left.requested_date}T${left.requested_time}`).getTime();
      const rightTime = new Date(`${right.requested_date}T${right.requested_time}`).getTime();
      return leftTime - rightTime;
    });

  const rows = sortedRequests.map((request) => {
    const requestLabel = String(request?.notes || "")
      .split("|")
      .map((part) => part.trim())
      .filter(Boolean)[0]
      ?.replace(/^Session type:\s*/iu, "") || "Booking Request";
    return {
      id: request.id,
      requested_date: request.requested_date,
      requested_time: request.requested_time,
      status: request.status,
      clientName: clientNameById.get(request.client_id) || "Client",
      requestLabel,
      packageLabel: request.client_package_id
        ? packageNameById.get(request.client_package_id) || "Assigned package"
        : "No package linked",
    };
  });

  const paginated = paginateCollection(rows, options?.page, options?.pageSize);
  return {
    resource: "booking_queue",
    rows: paginated.rows,
    pagination: paginated.pagination,
  };
}

async function getClientScheduleTimelineResource(supabase, auth, options = {}) {
  const clientId = buildAccess(auth).user.id;
  const [sessionsResponse, bookingRequestsResponse] = await Promise.all([
    supabase
      .from("sessions")
      .select("id, coach_id, scheduled_start, scheduled_end, status")
      .eq("client_id", clientId)
      .order("scheduled_start", { ascending: true })
      .limit(200),
    supabase
      .from("booking_requests")
      .select("id, preferred_coach_id, requested_date, requested_time, status, notes, created_at")
      .eq("client_id", clientId)
      .order("requested_date", { ascending: true })
      .order("requested_time", { ascending: true })
      .limit(200),
  ]);

  [sessionsResponse, bookingRequestsResponse].forEach(throwOnError);

  const coachIds = uniqueValues(
    (sessionsResponse.data || []).map((session) => session.coach_id).concat((bookingRequestsResponse.data || []).map((request) => request.preferred_coach_id))
  );
  const coachProfilesResponse = coachIds.length
    ? await supabase.from("profiles").select("id, display_name").in("id", coachIds)
    : { data: [], error: null };

  throwOnError(coachProfilesResponse);

  const coachNameById = new Map((coachProfilesResponse.data || []).map((item) => [item.id, item.display_name || "Coach"]));
  const timelineItems = [];

  (sessionsResponse.data || []).forEach((session) => {
    timelineItems.push({
      id: session.id,
      sortKey: new Date(session.scheduled_start).getTime(),
      dateLabel: session.scheduled_start,
      timeLabel: `${session.scheduled_start}|${session.scheduled_end}`,
      typeLabel: "Confirmed Session",
      coachLabel: coachNameById.get(session.coach_id) || "Coach",
      status: session.status,
    });
  });

  (bookingRequestsResponse.data || []).forEach((request) => {
    const requestDate = new Date(`${request.requested_date}T${request.requested_time}`);
    const typeLabel = String(request.notes || "")
      .split("|")
      .map((part) => part.trim())
      .filter(Boolean)[0]
      ?.replace(/^Session type:\s*/iu, "") || "Booking Request";

    timelineItems.push({
      id: request.id,
      sortKey: Number.isNaN(requestDate.getTime()) ? Date.now() : requestDate.getTime(),
      dateLabel: request.requested_date,
      timeLabel: request.requested_time,
      typeLabel,
      coachLabel: request.preferred_coach_id ? coachNameById.get(request.preferred_coach_id) || "Coach" : "No coach preference",
      status: request.status,
    });
  });

  timelineItems.sort((left, right) => left.sortKey - right.sortKey);
  const paginated = paginateCollection(timelineItems, options?.page, options?.pageSize);
  return {
    resource: "schedule_timeline",
    rows: paginated.rows,
    pagination: paginated.pagination,
  };
}

async function getDashboardPaginatedResource(supabase, auth, scope, pageKey, resource, options = {}) {
  if (!auth?.profile?.id) {
    throw createHttpError(401, "A valid authenticated account is required.");
  }

  if (auth.profile.status !== "active") {
    throw createHttpError(403, "This account is not active.");
  }

  const normalizedResource = String(resource || "").trim().toLowerCase();
  const normalizedPageKey = String(pageKey || "").trim().toLowerCase();

  if (scope === "admin") {
    if (auth.profile.role !== "super_admin") {
      throw createHttpError(403, "Super admin access is required for this dashboard.");
    }
    if (normalizedPageKey === "home" && normalizedResource === "coach_review_queue") {
      return getAdminCoachReviewQueueResource(supabase, auth, options);
    }
  }

  if (scope === "coach") {
    if (auth.profile.role !== "coach") {
      throw createHttpError(403, "Coach access is required for this dashboard.");
    }
    if (normalizedPageKey === "home" && normalizedResource === "session_queue") {
      return getCoachSessionQueueResource(supabase, auth, options);
    }
    if (normalizedPageKey === "home" && normalizedResource === "booking_queue") {
      return getCoachBookingQueueResource(supabase, auth, options);
    }
  }

  if (scope === "client") {
    if (auth.profile.role !== "client") {
      throw createHttpError(403, "Client access is required for this dashboard.");
    }
    if (normalizedPageKey === "home" && normalizedResource === "schedule_timeline") {
      return getClientScheduleTimelineResource(supabase, auth, options);
    }
  }

  throw createHttpError(400, "The requested paginated dashboard resource is not available.");
}

async function getDashboardPayload(supabase, auth, scope, pageKey, options = {}) {
  if (!auth?.profile?.id) {
    throw createHttpError(401, "A valid authenticated account is required.");
  }

  if (auth.profile.status !== "active") {
    throw createHttpError(403, "This account is not active.");
  }

  if (scope === "client") {
    if (auth.profile.role !== "client") {
      throw createHttpError(403, "Client access is required for this dashboard.");
    }
    return getClientDashboardPayload(supabase, auth, pageKey, options);
  }

  if (scope === "coach") {
    if (auth.profile.role !== "coach") {
      throw createHttpError(403, "Coach access is required for this dashboard.");
    }
    return getCoachDashboardPayload(supabase, auth, pageKey, options);
  }

  if (scope === "admin") {
    if (auth.profile.role !== "super_admin") {
      throw createHttpError(403, "Super admin access is required for this dashboard.");
    }
    return getAdminDashboardPayload(supabase, auth, pageKey, options);
  }

  throw createHttpError(400, "Dashboard scope must be client, coach, or admin.");
}

module.exports = {
  createHttpError,
  getDashboardPayload,
  getDashboardPaginatedResource,
};
