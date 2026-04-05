const fs = require("node:fs");
const path = require("node:path");

const { canManageClientWithProfile, notifyRecipients } = require("./supabase");

const PROJECT_ROOT = path.resolve(__dirname, "..", "..", "..");
const GAMIFICATION_BUNDLE_CANDIDATES = [
  path.join(PROJECT_ROOT, "XP gamification", "Config", "LEGACY+_Codex_Bundle_v2.json"),
  path.join(PROJECT_ROOT, "XP gamification", "Config", "LEGACY+_Codex_Bundle_v2 (1).json"),
];

let cachedGamificationBundle = null;

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function throwOnError(response, fallbackMessage = "Unexpected database error.") {
  if (response?.error) {
    const error = new Error(response.error.message || fallbackMessage);
    error.statusCode = Number(response.error.code === "PGRST116" ? 404 : 500);
    throw error;
  }
}

function parseBody(event) {
  try {
    return JSON.parse(event.body || "{}");
  } catch (_) {
    return null;
  }
}

function normalizeText(value) {
  return String(value || "").trim();
}

function normalizeNullableText(value) {
  const text = normalizeText(value);
  return text || null;
}

function normalizeNumber(value) {
  const raw = String(value ?? "")
    .trim()
    .replace(/,/g, "");
  if (!raw) {
    return null;
  }
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeInteger(value) {
  const parsed = normalizeNumber(value);
  if (!Number.isFinite(parsed)) {
    return null;
  }
  return Math.round(parsed);
}

function normalizeBoolean(value, fallback = false) {
  if (typeof value === "boolean") {
    return value;
  }

  const raw = normalizeText(value).toLowerCase();
  if (!raw) {
    return fallback;
  }

  if (["true", "1", "yes", "y"].includes(raw)) {
    return true;
  }

  if (["false", "0", "no", "n"].includes(raw)) {
    return false;
  }

  return fallback;
}

function normalizeArray(value) {
  if (Array.isArray(value)) {
    return value.filter((item) => item !== undefined && item !== null && String(item).trim() !== "");
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizeJson(value, fallback) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === "object") {
        return parsed;
      }
    } catch (_) {
      return fallback;
    }
  }

  return fallback;
}

function normalizeDateOnly(value, fallback = null) {
  const raw = normalizeText(value);
  if (!raw) {
    return fallback;
  }

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    return fallback;
  }

  return parsed.toISOString().slice(0, 10);
}

function normalizeTimestamp(value, fallback = null) {
  const raw = normalizeText(value);
  if (!raw) {
    return fallback;
  }

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    return fallback;
  }

  return parsed.toISOString();
}

function addDays(dateString, days) {
  const base = new Date(`${dateString}T00:00:00.000Z`);
  if (Number.isNaN(base.getTime())) {
    return null;
  }

  base.setUTCDate(base.getUTCDate() + Number(days || 0));
  return base.toISOString().slice(0, 10);
}

function startOfIsoWeek(dateString) {
  const normalized = normalizeDateOnly(dateString);
  if (!normalized) {
    return null;
  }

  const base = new Date(`${normalized}T00:00:00.000Z`);
  const day = base.getUTCDay() || 7;
  base.setUTCDate(base.getUTCDate() - day + 1);
  return base.toISOString().slice(0, 10);
}

function endOfIsoWeek(dateString) {
  const weekStart = startOfIsoWeek(dateString);
  return weekStart ? addDays(weekStart, 6) : null;
}

function requireAllowedRole(profile, allowedRoles) {
  if (!profile?.role || !allowedRoles.includes(profile.role)) {
    throw createHttpError(403, "You do not have permission to access this planner action.");
  }
}

async function requireManagedClientAccess(supabase, profile, clientId) {
  if (!clientId) {
    throw createHttpError(400, "A target client is required.");
  }

  if (profile.role === "super_admin") {
    return;
  }

  if (profile.role === "client" && profile.id === clientId) {
    return;
  }

  if (profile.role !== "coach") {
    throw createHttpError(403, "You do not have permission to access this client.");
  }

  const canManage = await canManageClientWithProfile(supabase, profile, clientId);
  if (!canManage) {
    throw createHttpError(403, "You are not assigned to this client.");
  }
}

function loadGamificationBundle() {
  if (cachedGamificationBundle) {
    return cachedGamificationBundle;
  }

  const bundlePath = GAMIFICATION_BUNDLE_CANDIDATES.find((candidatePath) => fs.existsSync(candidatePath));
  if (!bundlePath) {
    throw new Error("Planner gamification bundle is missing from the XP gamification config directory.");
  }

  const raw = fs.readFileSync(bundlePath, "utf8");
  const parsed = JSON.parse(raw);
  const rulesEngine = parsed?.contents?.rulesEngine || parsed?.rulesEngine || {};
  const actions = Array.isArray(rulesEngine.actions) ? rulesEngine.actions : [];
  const actionsById = new Map(actions.map((action) => [String(action.actionId || action.id || ""), action]));

  cachedGamificationBundle = {
    metadata: rulesEngine.metadata || {},
    settings: rulesEngine.settings || {},
    actions,
    actionsById,
  };

  return cachedGamificationBundle;
}

function getGamificationAction(actionId) {
  if (!actionId) {
    return null;
  }

  return loadGamificationBundle().actionsById.get(String(actionId).trim()) || null;
}

function buildPlannerLedgerReasonText(rewardEvent, reasonOverride) {
  const actionId = normalizeText(rewardEvent?.action_id);
  const reasonText = normalizeText(reasonOverride || rewardEvent?.reason);
  if (!actionId) {
    return normalizeNullableText(reasonText) || "Planner reward";
  }

  const taggedPrefix = `[${actionId}]`;
  if (reasonText.startsWith(taggedPrefix)) {
    return reasonText;
  }

  if (reasonText) {
    return `${taggedPrefix} ${reasonText}`;
  }

  return taggedPrefix;
}

async function insertPlannerRewardEvent(supabase, payload) {
  const normalizedPayload = {
    client_id: payload.clientId,
    coach_id: payload.coachId || null,
    source_module: payload.sourceModule,
    source_record_id: payload.sourceRecordId || null,
    action_id: payload.actionId,
    proposed_xp: Number(payload.proposedXp || 0),
    proposed_coins: Number(payload.proposedCoins || 0),
    verification_required: Boolean(payload.verificationRequired),
    approval_status: payload.approvalStatus || "pending",
    requested_by: payload.requestedBy || null,
    reason: payload.reason || "",
    metadata: payload.metadata || {},
  };

  const existingResponse = await supabase
    .from("planner_reward_events")
    .select("id, approval_status, xp_ledger_entry_id, coin_ledger_entry_id")
    .eq("client_id", normalizedPayload.client_id)
    .eq("source_module", normalizedPayload.source_module)
    .eq("source_record_id", normalizedPayload.source_record_id)
    .eq("action_id", normalizedPayload.action_id)
    .limit(1)
    .maybeSingle();

  throwOnError(existingResponse);

  if (existingResponse.data?.id) {
    return existingResponse.data;
  }

  const insertResponse = await supabase
    .from("planner_reward_events")
    .insert(normalizedPayload)
    .select("*")
    .single();

  throwOnError(insertResponse);
  return insertResponse.data;
}

async function maybeCreatePlannerRewardEvent(supabase, options) {
  const action = getGamificationAction(options.actionId);
  if (!action) {
    return null;
  }

  return insertPlannerRewardEvent(supabase, {
    clientId: options.clientId,
    coachId: options.coachId,
    sourceModule: options.sourceModule,
    sourceRecordId: options.sourceRecordId,
    actionId: String(action.actionId),
    proposedXp: Number(action.xp || 0),
    proposedCoins: Number(action.coins || 0),
    verificationRequired: Boolean(action.verificationRequired),
    approvalStatus: "pending",
    requestedBy: options.requestedBy,
    reason: options.reason || action.displayName || action.actionId,
    metadata: {
      actionDisplayName: action.displayName || "",
      actionCategory: action.category || "",
      ...normalizeJson(options.metadata, {}),
    },
  });
}

async function hasExistingPlannerRewardAction(supabase, options) {
  const clientId = normalizeText(options?.clientId);
  const actionId = normalizeText(options?.actionId);
  if (!clientId || !actionId) {
    return false;
  }

  let query = supabase
    .from("planner_reward_events")
    .select("id", { count: "exact", head: true })
    .eq("client_id", clientId)
    .eq("action_id", actionId)
    .neq("approval_status", "rejected");

  if (options?.metadataContains && typeof options.metadataContains === "object") {
    query = query.contains("metadata", options.metadataContains);
  }

  const response = await query.limit(1);
  throwOnError(response);
  return Number(response.count || 0) > 0;
}

async function loadClientWorkoutWeekOutcomes(supabase, clientId, fromDate, toDate) {
  const normalizedClientId = normalizeText(clientId);
  const startDate = normalizeDateOnly(fromDate);
  const endDate = normalizeDateOnly(toDate);
  if (!normalizedClientId || !startDate || !endDate) {
    return new Map();
  }

  const assignmentsResponse = await supabase
    .from("client_program_assignments")
    .select("id")
    .eq("client_id", normalizedClientId)
    .in("status", ["draft", "active", "paused", "completed"]);
  throwOnError(assignmentsResponse);

  const assignmentIds = (assignmentsResponse.data || []).map((row) => row.id).filter(Boolean);
  if (!assignmentIds.length) {
    return new Map();
  }

  const daysResponse = await supabase
    .from("client_program_days")
    .select("id, assignment_id, scheduled_date, day_type, status")
    .in("assignment_id", assignmentIds)
    .gte("scheduled_date", startDate)
    .lte("scheduled_date", endDate)
    .order("scheduled_date", { ascending: true });
  throwOnError(daysResponse);

  const effectiveWorkoutDays = (daysResponse.data || []).filter((day) => {
    const dayType = normalizeText(day.day_type).toLowerCase();
    const dayStatus = normalizeText(day.status).toLowerCase();
    return dayType === "workout" && Boolean(day.scheduled_date) && !["archived", "skipped"].includes(dayStatus);
  });

  const dayIds = effectiveWorkoutDays.map((day) => day.id).filter(Boolean);
  const logsResponse = dayIds.length
    ? await supabase
        .from("client_workout_logs")
        .select("id, client_program_day_id, log_status, review_status")
        .in("client_program_day_id", dayIds)
    : { data: [], error: null };
  throwOnError(logsResponse);

  const logByDayId = new Map((logsResponse.data || []).map((row) => [row.client_program_day_id, row]));
  const weekMap = new Map();

  effectiveWorkoutDays.forEach((day) => {
    const weekStart = startOfIsoWeek(day.scheduled_date);
    if (!weekStart) {
      return;
    }

    const existing = weekMap.get(weekStart) || {
      weekStart,
      weekEnd: addDays(weekStart, 6),
      workoutDays: [],
      totalScheduled: 0,
      completedApproved: 0,
      qualified: false,
    };

    const log = logByDayId.get(day.id) || null;
    const isApprovedCompletion =
      normalizeText(log?.log_status).toLowerCase() === "completed"
      && normalizeText(log?.review_status).toLowerCase() === "approved";

    existing.workoutDays.push({
      id: day.id,
      scheduledDate: day.scheduled_date,
      status: day.status,
      logStatus: log?.log_status || "",
      reviewStatus: log?.review_status || "",
      isApprovedCompletion,
    });
    existing.totalScheduled += 1;
    if (isApprovedCompletion) {
      existing.completedApproved += 1;
    }
    existing.qualified = existing.totalScheduled > 0 && existing.completedApproved === existing.totalScheduled;
    weekMap.set(weekStart, existing);
  });

  return weekMap;
}

function countConsecutiveQualifiedWorkoutWeeks(weekMap, currentWeekStart) {
  let streak = 0;
  let probeWeek = currentWeekStart;

  while (probeWeek) {
    const week = weekMap.get(probeWeek);
    if (!week || !week.totalScheduled || !week.qualified) {
      break;
    }

    streak += 1;
    probeWeek = addDays(probeWeek, -7);
  }

  return streak;
}

async function buildWorkoutMilestoneRewardSpecs(supabase, record) {
  if (!record?.client_id || !record?.client_program_day_id) {
    return [];
  }

  const dayResponse = await supabase
    .from("client_program_days")
    .select("id, assignment_id, scheduled_date, day_type, status")
    .eq("id", record.client_program_day_id)
    .maybeSingle();
  throwOnError(dayResponse);

  const workoutDay = dayResponse.data;
  if (!workoutDay?.id || !workoutDay?.scheduled_date || normalizeText(workoutDay.day_type).toLowerCase() !== "workout") {
    return [];
  }

  const currentWeekStart = startOfIsoWeek(workoutDay.scheduled_date);
  const currentWeekEnd = endOfIsoWeek(workoutDay.scheduled_date);
  if (!currentWeekStart || !currentWeekEnd) {
    return [];
  }

  const lookbackStart = addDays(currentWeekStart, -(7 * 55));
  const weekMap = await loadClientWorkoutWeekOutcomes(supabase, record.client_id, lookbackStart, currentWeekEnd);
  const currentWeek = weekMap.get(currentWeekStart);
  if (!currentWeek?.totalScheduled || !currentWeek.qualified) {
    return [];
  }

  const specs = [];
  const weeklyAttendanceAlreadyAwarded = await hasExistingPlannerRewardAction(supabase, {
    clientId: record.client_id,
    actionId: "CMP-ATT-100W",
    metadataContains: { weekStart: currentWeekStart },
  });

  if (!weeklyAttendanceAlreadyAwarded) {
    specs.push({
      actionId: "CMP-ATT-100W",
      reason: "100% workout attendance achieved for the week.",
      metadata: {
        weekStart: currentWeekStart,
        weekEnd: currentWeek.weekEnd,
        scheduledWorkoutCount: currentWeek.totalScheduled,
      },
    });
  }

  const streakWeeks = countConsecutiveQualifiedWorkoutWeeks(weekMap, currentWeekStart);
  const streakThresholds = [
    { weeks: 4, actionId: "TRN-NOMISS-4" },
    { weeks: 8, actionId: "TRN-NOMISS-8" },
    { weeks: 12, actionId: "TRN-NOMISS-12" },
    { weeks: 24, actionId: "TRN-NOMISS-24" },
    { weeks: 52, actionId: "TRN-NOMISS-52" },
  ];

  for (const threshold of streakThresholds) {
    if (streakWeeks < threshold.weeks) {
      continue;
    }

    const alreadyAwarded = await hasExistingPlannerRewardAction(supabase, {
      clientId: record.client_id,
      actionId: threshold.actionId,
    });
    if (alreadyAwarded) {
      continue;
    }

    specs.push({
      actionId: threshold.actionId,
      reason: `No missed workout sessions for ${threshold.weeks} consecutive weeks.`,
      metadata: {
        weekStart: currentWeekStart,
        weekEnd: currentWeek.weekEnd,
        streakWeeks,
      },
    });
  }

  return specs;
}

function getPlannerRewardSourceModule(type) {
  const normalized = normalizeText(type).toLowerCase();
  if (normalized === "workout_log") {
    return "workout_log";
  }
  if (normalized === "nutrition_log") {
    return "nutrition_log";
  }
  if (normalized === "checkin") {
    return "client_checkin";
  }
  if (normalized === "progress_photo") {
    return "progress_photo";
  }
  if (normalized === "meal_entry") {
    return "meal_entry";
  }
  return "";
}

async function insertPointsLedgerEntry(supabase, payload) {
  const insertResponse = await supabase
    .from("points_ledger")
    .insert(payload)
    .select("*")
    .single();
  throwOnError(insertResponse);
  return insertResponse.data;
}

async function loadPointsLedgerEntry(supabase, entryId) {
  if (!entryId) {
    return null;
  }

  const entryResponse = await supabase.from("points_ledger").select("*").eq("id", entryId).maybeSingle();
  throwOnError(entryResponse);
  return entryResponse.data || null;
}

async function rejectPendingLedgerEntry(supabase, entryId, reviewerProfile) {
  const existingEntry = await loadPointsLedgerEntry(supabase, entryId);
  if (!existingEntry?.id) {
    return { entry: null, blocked: false };
  }

  if (["approved", "auto_approved"].includes(String(existingEntry.approval_status || "").toLowerCase())) {
    return { entry: existingEntry, blocked: true };
  }

  if (String(existingEntry.approval_status || "").toLowerCase() === "rejected") {
    return { entry: existingEntry, blocked: false };
  }

  const updateResponse = await supabase
    .from("points_ledger")
    .update({
      approval_status: "rejected",
      approved_by: reviewerProfile?.id || null,
      approved_at: new Date().toISOString(),
    })
    .eq("id", existingEntry.id)
    .select("*")
    .single();
  throwOnError(updateResponse);
  return { entry: updateResponse.data, blocked: false };
}

async function approvePlannerRewardEvent(supabase, reviewerProfile, rewardEvent, reasonOverride) {
  if (!rewardEvent?.id) {
    return null;
  }

  const approvedAt = new Date().toISOString();
  const reviewerRole = normalizeText(reviewerProfile?.role).toLowerCase();
  const ledgerStatus = reviewerRole === "super_admin" ? "auto_approved" : "pending";
  let xpLedgerEntryId = rewardEvent.xp_ledger_entry_id || null;
  let coinLedgerEntryId = rewardEvent.coin_ledger_entry_id || null;
  const ledgerReason = buildPlannerLedgerReasonText(rewardEvent, reasonOverride);

  if (!xpLedgerEntryId && Number(rewardEvent.proposed_xp || 0) > 0) {
    const xpEntry = await insertPointsLedgerEntry(supabase, {
      client_id: rewardEvent.client_id,
      points_type: "xp",
      delta: Number(rewardEvent.proposed_xp || 0),
      reason: ledgerReason,
      requested_by: rewardEvent.requested_by || reviewerProfile?.id,
      approved_by: reviewerRole === "super_admin" ? reviewerProfile?.id || null : null,
      approval_status: ledgerStatus,
      approved_at: reviewerRole === "super_admin" ? approvedAt : null,
    });
    xpLedgerEntryId = xpEntry.id;
  }

  if (!coinLedgerEntryId && Number(rewardEvent.proposed_coins || 0) > 0) {
    const coinEntry = await insertPointsLedgerEntry(supabase, {
      client_id: rewardEvent.client_id,
      points_type: "gym_coins",
      delta: Number(rewardEvent.proposed_coins || 0),
      reason: ledgerReason,
      requested_by: rewardEvent.requested_by || reviewerProfile?.id,
      approved_by: reviewerRole === "super_admin" ? reviewerProfile?.id || null : null,
      approval_status: ledgerStatus,
      approved_at: reviewerRole === "super_admin" ? approvedAt : null,
    });
    coinLedgerEntryId = coinEntry.id;
  }

  const updateResponse = await supabase
    .from("planner_reward_events")
    .update({
      approval_status: reviewerRole === "super_admin" ? "awarded" : "approved",
      approved_by: reviewerProfile?.id || null,
      approved_at: approvedAt,
      xp_ledger_entry_id: xpLedgerEntryId,
      coin_ledger_entry_id: coinLedgerEntryId,
      reason: normalizeNullableText(reasonOverride) || rewardEvent.reason,
    })
    .eq("id", rewardEvent.id)
    .select("*")
    .single();
  throwOnError(updateResponse);

  return {
    event: updateResponse.data,
    ledger: {
      xpLedgerEntryId,
      coinLedgerEntryId,
      status: ledgerStatus,
    },
  };
}

async function rejectPlannerRewardEvent(supabase, reviewerProfile, rewardEvent, reasonOverride) {
  if (!rewardEvent?.id) {
    return null;
  }

  const xpResult = rewardEvent.xp_ledger_entry_id
    ? await rejectPendingLedgerEntry(supabase, rewardEvent.xp_ledger_entry_id, reviewerProfile)
    : { blocked: false };
  const coinResult = rewardEvent.coin_ledger_entry_id
    ? await rejectPendingLedgerEntry(supabase, rewardEvent.coin_ledger_entry_id, reviewerProfile)
    : { blocked: false };

  if (xpResult.blocked || coinResult.blocked) {
    return {
      event: rewardEvent,
      blocked: true,
      ledger: {
        xpLedgerEntryId: rewardEvent.xp_ledger_entry_id || null,
        coinLedgerEntryId: rewardEvent.coin_ledger_entry_id || null,
        status: "unchanged",
      },
    };
  }

  const updateResponse = await supabase
    .from("planner_reward_events")
    .update({
      approval_status: "rejected",
      approved_by: reviewerProfile?.id || null,
      approved_at: new Date().toISOString(),
      reason: normalizeNullableText(reasonOverride) || rewardEvent.reason,
    })
    .eq("id", rewardEvent.id)
    .select("*")
    .single();
  throwOnError(updateResponse);

  return {
    event: updateResponse.data,
    blocked: false,
    ledger: {
      xpLedgerEntryId: rewardEvent.xp_ledger_entry_id || null,
      coinLedgerEntryId: rewardEvent.coin_ledger_entry_id || null,
      status: "rejected",
    },
  };
}

async function buildPlannerRewardSpecsForSubmission(supabase, submission) {
  const type = normalizeText(submission?.type).toLowerCase();
  const record = submission?.record || {};
  const specs = [];

  if (type === "workout_log") {
    if (String(record.log_status || "").toLowerCase() !== "completed") {
      return specs;
    }

    specs.push({
      actionId: "TRN-SESS",
      reason: "Coach-assigned workout completed.",
      metadata: {
        completedAt: record.completed_at || null,
        adherenceScore: Number(record.adherence_score || 0),
      },
    });

    const priorCompletedResponse = await supabase
      .from("client_workout_logs")
      .select("id", { count: "exact", head: true })
      .eq("client_id", record.client_id)
      .eq("log_status", "completed")
      .eq("review_status", "approved")
      .neq("id", record.id);
    throwOnError(priorCompletedResponse);

    if (Number(priorCompletedResponse.count || 0) === 0) {
      specs.push({
        actionId: "TRN-FIRST",
        reason: "First approved coach-assigned workout completed.",
        metadata: {
          completedAt: record.completed_at || null,
        },
      });
    }

    const workoutMilestones = await buildWorkoutMilestoneRewardSpecs(supabase, record);
    if (workoutMilestones.length) {
      specs.push(...workoutMilestones);
    }

    return specs;
  }

  if (type === "nutrition_log") {
    const logDate = normalizeDateOnly(record.log_date) || null;
    if (Number(record.balanced_meals_count || 0) >= 3) {
      specs.push({
        actionId: "NUT-BAL3",
        reason: "3+ balanced meals logged for the day.",
        metadata: {
          logDate,
          balancedMealsCount: Number(record.balanced_meals_count || 0),
        },
      });
    }
    if (record.meal_prep_completed) {
      specs.push({
        actionId: "NUT-MEAL",
        reason: "Meal prep completed.",
        metadata: { logDate },
      });
    }
    if (record.hydration_target_hit) {
      specs.push({
        actionId: "NUT-H2O",
        reason: "Daily hydration target hit.",
        metadata: { logDate },
      });
    }
    if (record.protein_target_hit) {
      specs.push({
        actionId: "NUT-PROT",
        reason: "Protein target hit.",
        metadata: { logDate },
      });
    }
    return specs;
  }

  if (type === "checkin") {
    const cadence = String(record.cadence || "").toLowerCase();
    const status = String(record.status || "").toLowerCase();
    const submittedAt = record.submitted_at ? new Date(record.submitted_at).getTime() : 0;
    const dueAt = record.due_at ? new Date(record.due_at).getTime() : 0;
    if (
      cadence === "weekly"
      && ["submitted", "reviewed"].includes(status)
      && submittedAt
      && dueAt
      && submittedAt <= dueAt
    ) {
      specs.push({
        actionId: "TRN-WKCI",
        reason: "Weekly check-in submitted on time.",
        metadata: {
          dueAt: record.due_at || null,
          submittedAt: record.submitted_at || null,
          status,
        },
      });
    }
    return specs;
  }

  return specs;
}

async function ensurePlannerRewardEventsForSubmission(supabase, submission) {
  const type = normalizeText(submission?.type).toLowerCase();
  const record = submission?.record || {};
  const sourceModule = getPlannerRewardSourceModule(type);
  if (!sourceModule || !record?.id || !record?.client_id) {
    return [];
  }

  const specs = await buildPlannerRewardSpecsForSubmission(supabase, submission);
  const events = [];
  for (const spec of specs) {
    const event = await maybeCreatePlannerRewardEvent(supabase, {
      clientId: record.client_id,
      coachId: record.coach_id || null,
      sourceModule,
      sourceRecordId: record.id,
      actionId: spec.actionId,
      requestedBy: submission?.requestedBy || null,
      reason: spec.reason,
      metadata: normalizeJson(spec.metadata, {}),
    });
    if (event?.id) {
      events.push(event);
    }
  }
  return events;
}

async function syncPlannerRewardEventsForSource(supabase, reviewerProfile, options) {
  const sourceModule = normalizeText(options?.sourceModule || getPlannerRewardSourceModule(options?.type));
  const sourceRecordId = normalizeText(options?.sourceRecordId || options?.source_record_id);
  const decision = normalizeText(options?.decision || "approve").toLowerCase();
  if (!sourceModule || !sourceRecordId) {
    return [];
  }

  const eventResponse = await supabase
    .from("planner_reward_events")
    .select("*")
    .eq("source_module", sourceModule)
    .eq("source_record_id", sourceRecordId);
  throwOnError(eventResponse);

  const events = eventResponse.data || [];
  const results = [];
  for (const rewardEvent of events) {
    if (decision === "approve" || decision === "approved" || decision === "reviewed") {
      results.push(await approvePlannerRewardEvent(supabase, reviewerProfile, rewardEvent, options?.reason));
      continue;
    }

    if (["reject", "rejected", "needs_revision", "needs_follow_up", "pending"].includes(decision)) {
      results.push(await rejectPlannerRewardEvent(supabase, reviewerProfile, rewardEvent, options?.reason));
    }
  }
  return results;
}

async function notifyClientAndCoach(supabase, payload) {
  const rows = [];

  if (payload.clientId && payload.clientTitle && payload.clientBody) {
    rows.push({
      recipient_id: payload.clientId,
      category: payload.category || "planner",
      title: payload.clientTitle,
      body: payload.clientBody,
      action_url: payload.clientActionUrl || null,
    });
  }

  if (payload.coachId && payload.coachTitle && payload.coachBody) {
    rows.push({
      recipient_id: payload.coachId,
      category: payload.category || "planner",
      title: payload.coachTitle,
      body: payload.coachBody,
      action_url: payload.coachActionUrl || null,
    });
  }

  if (!rows.length) {
    return { count: 0 };
  }

  return notifyRecipients(supabase, rows);
}

async function loadProgramTemplateGraph(supabase, templateId) {
  const [templateResponse, weeksResponse] = await Promise.all([
    supabase.from("program_templates").select("*").eq("id", templateId).maybeSingle(),
    supabase.from("program_template_weeks").select("*").eq("template_id", templateId).order("week_number", { ascending: true }),
  ]);

  throwOnError(templateResponse);
  throwOnError(weeksResponse);

  const weekIds = (weeksResponse.data || []).map((item) => item.id);
  const daysResponse = weekIds.length
    ? await supabase.from("program_template_days").select("*").in("template_week_id", weekIds)
    : { data: [], error: null };
  throwOnError(daysResponse);

  const dayIds = (daysResponse.data || []).map((item) => item.id);
  const exercisesResponse = dayIds.length
    ? await supabase.from("program_template_exercises").select("*").in("template_day_id", dayIds)
    : { data: [], error: null };
  throwOnError(exercisesResponse);

  return {
    template: templateResponse.data || null,
    weeks: weeksResponse.data || [],
    days: daysResponse.data || [],
    exercises: exercisesResponse.data || [],
  };
}

async function materializeProgramAssignment(supabase, assignment, graph) {
  const weekById = new Map((graph.weeks || []).map((week) => [week.id, week]));
  const templateDays = (graph.days || [])
    .map((day) => ({
      ...day,
      weekNumber: Number(weekById.get(day.template_week_id)?.week_number || 1),
    }))
    .sort((left, right) => {
      if (left.weekNumber !== right.weekNumber) {
        return left.weekNumber - right.weekNumber;
      }
      return Number(left.day_number || 0) - Number(right.day_number || 0);
    });

  if (!templateDays.length) {
    return { days: [], exercises: [] };
  }

  const dayRows = templateDays.map((day) => ({
    assignment_id: assignment.id,
    template_day_id: day.id,
    week_number: day.weekNumber,
    day_number: Number(day.day_number || 1),
    scheduled_date: addDays(assignment.start_date, ((day.weekNumber - 1) * 7) + (Number(day.day_number || 1) - 1)),
    title: day.title,
    focus: day.focus || null,
    day_type: day.day_type || "workout",
    status: "scheduled",
    notes: day.notes || null,
  }));

  const insertedDaysResponse = await supabase
    .from("client_program_days")
    .insert(dayRows)
    .select("id, template_day_id, week_number, day_number, scheduled_date");

  throwOnError(insertedDaysResponse);

  const insertedDays = insertedDaysResponse.data || [];
  const dayIdByTemplateDayId = new Map(insertedDays.map((day) => [day.template_day_id, day.id]));

  const exerciseRows = (graph.exercises || [])
    .map((exercise) => {
      const clientProgramDayId = dayIdByTemplateDayId.get(exercise.template_day_id);
      if (!clientProgramDayId) {
        return null;
      }

      return {
        client_program_day_id: clientProgramDayId,
        template_exercise_id: exercise.id,
        exercise_id: exercise.exercise_id || null,
        sort_order: Number(exercise.sort_order || 0),
        name_override: normalizeNullableText(exercise.name_override),
        sets: normalizeInteger(exercise.sets),
        reps: normalizeInteger(exercise.reps),
        rep_range_min: normalizeInteger(exercise.rep_range_min),
        rep_range_max: normalizeInteger(exercise.rep_range_max),
        prescribed_weight_kg: normalizeNumber(exercise.prescribed_weight_kg),
        percentage_of_1rm: normalizeNumber(exercise.percentage_of_1rm),
        duration_seconds: normalizeInteger(exercise.duration_seconds),
        distance_meters: normalizeNumber(exercise.distance_meters),
        rest_time_seconds: normalizeInteger(exercise.rest_time_seconds),
        tempo: normalizeNullableText(exercise.tempo),
        intensity_mode: ["rpe", "rir"].includes(String(exercise.intensity_mode || "").toLowerCase())
          ? String(exercise.intensity_mode).toLowerCase()
          : "none",
        intensity_value: normalizeNumber(exercise.intensity_value),
        set_type: normalizeNullableText(exercise.set_type),
        is_amrap: normalizeBoolean(exercise.is_amrap),
        heart_rate_zone: normalizeInteger(exercise.heart_rate_zone),
        form_cues: Array.isArray(exercise.form_cues) ? exercise.form_cues : normalizeArray(exercise.form_cues),
        substitutions: Array.isArray(exercise.substitutions) ? exercise.substitutions : normalizeArray(exercise.substitutions),
        notes: normalizeNullableText(exercise.notes),
        metadata: normalizeJson(exercise.metadata, {}),
      };
    })
    .filter(Boolean);

  if (!exerciseRows.length) {
    return {
      days: insertedDays,
      exercises: [],
    };
  }

  const insertedExercisesResponse = await supabase
    .from("client_program_day_exercises")
    .insert(exerciseRows)
    .select("id, client_program_day_id");

  throwOnError(insertedExercisesResponse);

  return {
    days: insertedDays,
    exercises: insertedExercisesResponse.data || [],
  };
}

module.exports = {
  addDays,
  approvePlannerRewardEvent,
  createHttpError,
  ensurePlannerRewardEventsForSubmission,
  getGamificationAction,
  getPlannerRewardSourceModule,
  insertPlannerRewardEvent,
  loadGamificationBundle,
  loadProgramTemplateGraph,
  materializeProgramAssignment,
  maybeCreatePlannerRewardEvent,
  normalizeArray,
  normalizeBoolean,
  normalizeDateOnly,
  normalizeInteger,
  normalizeJson,
  normalizeNullableText,
  normalizeNumber,
  normalizeText,
  normalizeTimestamp,
  notifyClientAndCoach,
  parseBody,
  rejectPlannerRewardEvent,
  requireAllowedRole,
  requireManagedClientAccess,
  syncPlannerRewardEventsForSource,
  throwOnError,
};
