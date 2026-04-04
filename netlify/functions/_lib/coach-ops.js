function normalizeText(value) {
  return String(value || "").trim();
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

function normalizeInteger(value, fallback = null) {
  const parsed = Number.parseInt(String(value ?? "").trim(), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function daysBetween(value) {
  if (!value) {
    return Number.POSITIVE_INFINITY;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return Number.POSITIVE_INFINITY;
  }
  return Math.floor((Date.now() - date.getTime()) / 86400000);
}

function getLatestTimestamp(...values) {
  const timestamps = values
    .map((value) => new Date(value || 0).getTime())
    .filter((value) => Number.isFinite(value) && value > 0);
  if (!timestamps.length) {
    return "";
  }
  return new Date(Math.max(...timestamps)).toISOString();
}

function getStartOfWeek(value = new Date()) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return new Date();
  }
  const day = date.getDay() || 7;
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - day + 1);
  return date;
}

function getEndOfWeek(value = new Date()) {
  const start = getStartOfWeek(value);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

function isTimestampWithinRange(value, start, end) {
  if (!value) {
    return false;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return false;
  }
  return date.getTime() >= start.getTime() && date.getTime() <= end.getTime();
}

function isActiveStatus(value) {
  return ["active", "paused"].includes(String(value || "").toLowerCase());
}

function uniqueValues(values) {
  return Array.from(new Set((values || []).filter(Boolean)));
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function safePercent(numerator, denominator, fallback = 0) {
  if (!Number.isFinite(denominator) || denominator <= 0) {
    return fallback;
  }
  return Math.round((Number(numerator || 0) / denominator) * 100);
}

const ALLOWED_AUTOMATION_CATEGORIES = new Set(["nutrition", "checkin", "training", "progress_photo"]);
const ALLOWED_AUTOMATION_SCHEDULES = new Set([
  "hourly",
  "daily_morning",
  "daily_evening",
  "weekday_midday",
  "weekly_monday",
]);

const DEFAULT_COACH_OPS_SEGMENTS = [
  {
    id: "segment-high-risk",
    name: "High Risk Watchlist",
    filters: {
      riskMin: 55,
      pendingReviewsMin: 0,
      needsNutritionNudge: false,
      needsCheckinNudge: false,
      needsTrainingNudge: false,
      needsPhotoNudge: false,
      quietThisWeek: false,
      hasNoNutrition: false,
      hasNoProgram: false,
    },
  },
  {
    id: "segment-overdue-health",
    name: "Overdue Health Follow-Up",
    filters: {
      riskMin: 0,
      pendingReviewsMin: 0,
      needsNutritionNudge: false,
      needsCheckinNudge: true,
      needsTrainingNudge: false,
      needsPhotoNudge: false,
      quietThisWeek: false,
      hasNoNutrition: false,
      hasNoProgram: false,
    },
  },
  {
    id: "segment-nutrition-dropoff",
    name: "Nutrition Drop-Off",
    filters: {
      riskMin: 0,
      pendingReviewsMin: 0,
      needsNutritionNudge: true,
      needsCheckinNudge: false,
      needsTrainingNudge: false,
      needsPhotoNudge: false,
      quietThisWeek: false,
      hasNoNutrition: false,
      hasNoProgram: false,
    },
  },
  {
    id: "segment-training-drift",
    name: "Training Drift",
    filters: {
      riskMin: 0,
      pendingReviewsMin: 0,
      needsNutritionNudge: false,
      needsCheckinNudge: false,
      needsTrainingNudge: true,
      needsPhotoNudge: false,
      quietThisWeek: false,
      hasNoNutrition: false,
      hasNoProgram: false,
    },
  },
  {
    id: "segment-photo-refresh",
    name: "Photo Refresh Needed",
    filters: {
      riskMin: 0,
      pendingReviewsMin: 0,
      needsNutritionNudge: false,
      needsCheckinNudge: false,
      needsTrainingNudge: false,
      needsPhotoNudge: true,
      quietThisWeek: false,
      hasNoNutrition: false,
      hasNoProgram: false,
    },
  },
];

const DEFAULT_COACH_AUTOMATION_RULES = [
  {
    id: "rule-health-midday",
    name: "Weekday Health Follow-Up",
    segmentId: "segment-overdue-health",
    category: "checkin",
    schedule: "weekday_midday",
    cooldownHours: 24,
    message: "",
    enabled: true,
  },
  {
    id: "rule-nutrition-evening",
    name: "Evening Nutrition Recovery",
    segmentId: "segment-nutrition-dropoff",
    category: "nutrition",
    schedule: "daily_evening",
    cooldownHours: 24,
    message: "",
    enabled: true,
  },
  {
    id: "rule-training-evening",
    name: "Training Rhythm Recovery",
    segmentId: "segment-training-drift",
    category: "training",
    schedule: "daily_evening",
    cooldownHours: 24,
    message: "",
    enabled: true,
  },
  {
    id: "rule-photo-monday",
    name: "Weekly Photo Refresh",
    segmentId: "segment-photo-refresh",
    category: "progress_photo",
    schedule: "weekly_monday",
    cooldownHours: 120,
    message: "",
    enabled: true,
  },
];

function sanitizeSegmentFilters(filters) {
  const source = filters && typeof filters === "object" ? filters : {};
  return {
    riskMin: Math.max(0, Math.min(100, normalizeInteger(source.riskMin, 0))),
    pendingReviewsMin: Math.max(0, Math.min(20, normalizeInteger(source.pendingReviewsMin, 0))),
    needsNutritionNudge: normalizeBoolean(source.needsNutritionNudge, false),
    needsCheckinNudge: normalizeBoolean(source.needsCheckinNudge, false),
    needsTrainingNudge: normalizeBoolean(source.needsTrainingNudge, false),
    needsPhotoNudge: normalizeBoolean(source.needsPhotoNudge, false),
    quietThisWeek: normalizeBoolean(source.quietThisWeek, false),
    hasNoNutrition: normalizeBoolean(source.hasNoNutrition, false),
    hasNoProgram: normalizeBoolean(source.hasNoProgram, false),
  };
}

function sanitizeCoachOpsSegments(value) {
  return (Array.isArray(value) ? value : [])
    .slice(0, 10)
    .map((segment, index) => {
      const id = normalizeText(segment?.id) || `segment-${index + 1}`;
      const name = normalizeText(segment?.name).slice(0, 72);
      const filters = sanitizeSegmentFilters(segment?.filters);
      if (!name) {
        return null;
      }
      return {
        id,
        name,
        filters,
      };
    })
    .filter(Boolean);
}

function sanitizeCoachAutomationRules(value, segments = []) {
  const segmentIds = new Set((segments || []).map((segment) => segment.id));
  return (Array.isArray(value) ? value : [])
    .slice(0, 12)
    .map((rule, index) => {
      const id = normalizeText(rule?.id) || `rule-${index + 1}`;
      const name = normalizeText(rule?.name).slice(0, 72);
      const segmentId = normalizeText(rule?.segmentId);
      const category = normalizeText(rule?.category).toLowerCase();
      const schedule = normalizeText(rule?.schedule).toLowerCase();
      const cooldownHours = Math.max(1, Math.min(168, normalizeInteger(rule?.cooldownHours, 24)));
      const message = normalizeText(rule?.message).slice(0, 320);
      const enabled = normalizeBoolean(rule?.enabled, true);
      if (!name || !segmentIds.has(segmentId) || !ALLOWED_AUTOMATION_CATEGORIES.has(category) || !ALLOWED_AUTOMATION_SCHEDULES.has(schedule)) {
        return null;
      }
      return {
        id,
        name,
        segmentId,
        category,
        schedule,
        cooldownHours,
        message,
        enabled,
      };
    })
    .filter(Boolean);
}

function segmentMatchesClient(client, segment) {
  const filters = segment?.filters || {};
  if (Number(filters.riskMin || 0) > 0 && Number(client.riskScore || 0) < Number(filters.riskMin || 0)) {
    return false;
  }
  if (Number(filters.pendingReviewsMin || 0) > 0 && Number(client.pendingReviews || 0) < Number(filters.pendingReviewsMin || 0)) {
    return false;
  }
  if (filters.needsNutritionNudge && !client.needsNutritionNudge) {
    return false;
  }
  if (filters.needsCheckinNudge && !client.needsCheckinNudge) {
    return false;
  }
  if (filters.needsTrainingNudge && !client.needsTrainingNudge) {
    return false;
  }
  if (filters.needsPhotoNudge && !client.needsPhotoNudge) {
    return false;
  }
  if (filters.quietThisWeek && !client.quietThisWeek) {
    return false;
  }
  if (filters.hasNoNutrition && client.activeNutrition) {
    return false;
  }
  if (filters.hasNoProgram && client.activeProgram) {
    return false;
  }
  return true;
}

function buildCoachPlannerInsights(payload) {
  const rosterProfiles = payload?.rosterProfiles || [];
  const rosterDetails = payload?.rosterDetails || [];
  const programAssignments = payload?.programAssignments || [];
  const programDays = payload?.programDays || [];
  const nutritionPlans = payload?.nutritionPlans || [];
  const workoutLogs = payload?.workoutLogs || [];
  const nutritionLogs = payload?.nutritionLogs || [];
  const mealEntries = payload?.mealEntries || [];
  const nutritionPhotoSubmissions = payload?.nutritionPhotoSubmissions || [];
  const checkins = payload?.checkins || [];
  const progressPhotos = payload?.progressPhotos || [];
  const rewardEvents = payload?.rewardEvents || [];

  const clientDirectory = new Map();
  rosterProfiles.forEach((profile) => {
    clientDirectory.set(profile.id, {
      id: profile.id,
      displayName: profile.display_name || "Client",
      preferredName: "",
      primaryGoal: "",
      memberId: "",
      xpPoints: 0,
      gymCoins: 0,
    });
  });
  rosterDetails.forEach((detail) => {
    const existing = clientDirectory.get(detail.id) || {
      id: detail.id,
      displayName: detail.preferred_name || "Client",
      preferredName: "",
      primaryGoal: "",
      memberId: "",
      xpPoints: 0,
      gymCoins: 0,
    };
    clientDirectory.set(detail.id, {
      ...existing,
      preferredName: detail.preferred_name || existing.preferredName || "",
      primaryGoal: detail.primary_goal || existing.primaryGoal || "",
      memberId: detail.member_id || existing.memberId || "",
      xpPoints: Number(detail.xp_points || existing.xpPoints || 0),
      gymCoins: Number(detail.gym_coins || existing.gymCoins || 0),
    });
  });

  const weekStart = getStartOfWeek();
  const weekEnd = getEndOfWeek(weekStart);

  const roster = Array.from(clientDirectory.values()).map((client) => {
    const clientAssignments = programAssignments.filter((item) => item.client_id === client.id);
    const clientProgramDays = programDays.filter((item) => clientAssignments.some((assignment) => assignment.id === item.assignment_id));
    const activeProgram =
      clientAssignments.find((item) => String(item.status || "").toLowerCase() === "active")
      || clientAssignments.find((item) => String(item.status || "").toLowerCase() === "paused")
      || null;
    const activeNutrition =
      nutritionPlans.find((item) => item.client_id === client.id && isActiveStatus(item.status))
      || null;
    const clientWorkoutLogs = workoutLogs.filter((item) => item.client_id === client.id);
    const clientNutritionLogs = nutritionLogs.filter((item) => item.client_id === client.id);
    const clientMealEntries = mealEntries.filter((item) => item.client_id === client.id);
    const clientNutritionPhotos = nutritionPhotoSubmissions.filter((item) => item.client_id === client.id);
    const clientCheckins = checkins.filter((item) => item.client_id === client.id);
    const clientProgressPhotos = progressPhotos.filter((item) => item.client_id === client.id);
    const clientRewardEvents = rewardEvents.filter((item) => item.client_id === client.id);

    const weeklyProgramDays = clientProgramDays.filter((item) => isTimestampWithinRange(item.scheduled_date, weekStart, weekEnd));
    const weeklyWorkoutLogs = clientWorkoutLogs.filter((item) =>
      isTimestampWithinRange(item.completed_at || item.updated_at || item.created_at, weekStart, weekEnd)
    );
    const weeklyNutritionLogs = clientNutritionLogs.filter((item) =>
      isTimestampWithinRange(item.log_date || item.updated_at || item.created_at, weekStart, weekEnd)
    );
    const weeklyMealEntries = clientMealEntries.filter((item) =>
      isTimestampWithinRange(item.log_date || item.updated_at || item.created_at, weekStart, weekEnd)
    );
    const weeklyNutritionPhotos = clientNutritionPhotos.filter((item) =>
      isTimestampWithinRange(item.log_date || item.updated_at || item.created_at, weekStart, weekEnd)
    );
    const weeklyCheckins = clientCheckins.filter((item) =>
      isTimestampWithinRange(item.submitted_at || item.due_at || item.created_at, weekStart, weekEnd)
    );
    const weeklyProgressPhotos = clientProgressPhotos.filter((item) =>
      isTimestampWithinRange(item.captured_at || item.updated_at || item.created_at, weekStart, weekEnd)
    );
    const mealPlanDays = Array.isArray(activeNutrition?.meal_plan?.days)
      ? activeNutrition.meal_plan.days.filter((day) => day && Array.isArray(day.slots) && day.slots.length)
      : [];
    const mealPlanDayCount = mealPlanDays.length;

    const latestWorkoutLog = clientWorkoutLogs[0] || null;
    const latestNutritionLog = clientNutritionLogs[0] || null;
    const latestMealEntry = clientMealEntries[0] || null;
    const latestNutritionPhoto = clientNutritionPhotos[0] || null;
    const latestCheckin = clientCheckins[0] || null;
    const latestProgressPhoto = clientProgressPhotos[0] || null;
    const lastWorkoutAt = latestWorkoutLog?.completed_at || latestWorkoutLog?.updated_at || latestWorkoutLog?.created_at || "";
    const lastNutritionAt = latestNutritionLog?.updated_at || latestNutritionLog?.created_at || latestNutritionLog?.log_date || "";
    const lastMealAt = latestMealEntry?.updated_at || latestMealEntry?.created_at || latestMealEntry?.log_date || "";
    const lastNutritionPhotoAt = latestNutritionPhoto?.updated_at || latestNutritionPhoto?.created_at || latestNutritionPhoto?.log_date || "";
    const lastCheckinAt = latestCheckin?.submitted_at || latestCheckin?.updated_at || latestCheckin?.created_at || "";
    const lastPhotoAt = latestProgressPhoto?.captured_at || latestProgressPhoto?.created_at || "";
    const lastActivityAt = getLatestTimestamp(lastWorkoutAt, lastNutritionAt, lastMealAt, lastNutritionPhotoAt, lastCheckinAt, lastPhotoAt);
    const daysSinceWorkout = daysBetween(lastWorkoutAt);
    const daysSinceNutrition = daysBetween(lastNutritionAt);
    const daysSinceMeal = daysBetween(lastMealAt);
    const daysSincePhoto = daysBetween(lastPhotoAt);
    const daysSinceActivity = daysBetween(lastActivityAt);
    const pendingReviews =
      clientWorkoutLogs.filter((item) => String(item.review_status || "").toLowerCase() === "pending").length
      + clientNutritionLogs.filter((item) => String(item.review_status || "").toLowerCase() === "pending").length
      + clientMealEntries.filter((item) => String(item.review_status || "").toLowerCase() === "pending").length
      + clientNutritionPhotos.filter((item) => String(item.review_status || "").toLowerCase() === "pending").length
      + clientCheckins.filter((item) => String(item.review_status || "").toLowerCase() === "pending").length
      + clientProgressPhotos.filter((item) => String(item.review_status || "").toLowerCase() === "pending").length
      + clientRewardEvents.filter((item) => String(item.approval_status || "").toLowerCase() === "pending").length;
    const overdueCheckins = clientCheckins.filter((item) => {
      const status = String(item.status || "").toLowerCase();
      return ["due", "late", "missed"].includes(status) && new Date(item.due_at || 0).getTime() < Date.now();
    }).length;

    const riskFlags = [];
    let riskScore = 0;
    if (!activeProgram) {
      riskScore += 34;
      riskFlags.push("No active program assigned");
    }
    if (!activeNutrition) {
      riskScore += 14;
      riskFlags.push("No active nutrition layer");
    }
    if (overdueCheckins > 0) {
      riskScore += Math.min(34, 18 + overdueCheckins * 8);
      riskFlags.push(`${overdueCheckins} overdue health update${overdueCheckins === 1 ? "" : "s"}`);
    }
    const latestCheckinStatus = String(latestCheckin?.status || "").toLowerCase();
    if (["late", "missed"].includes(latestCheckinStatus)) {
      riskScore += 14;
      riskFlags.push(`Latest health update is ${latestCheckinStatus}`);
    }
    if (daysSinceActivity > 21) {
      riskScore += 34;
      riskFlags.push("No planner activity for 21+ days");
    } else if (daysSinceActivity > 14) {
      riskScore += 26;
      riskFlags.push("No planner activity for 14+ days");
    } else if (daysSinceActivity > 7) {
      riskScore += 12;
      riskFlags.push("No planner activity in the last week");
    }
    if (daysSinceWorkout > 10) {
      riskScore += 16;
      riskFlags.push("No recent training log");
    }
    if (daysSinceNutrition > 7) {
      riskScore += 10;
      riskFlags.push("No recent nutrition log");
    }
    if (daysSinceMeal > 7) {
      riskScore += 8;
      riskFlags.push("No recent meal diary update");
    }
    if (daysSincePhoto > 28) {
      riskScore += 8;
      riskFlags.push("Progress photos are stale");
    }
    if (pendingReviews > 2) {
      riskScore += 6;
      riskFlags.push("Coach review backlog is building");
    }

    const normalizedRiskScore = Math.min(100, riskScore);
    const riskTone = normalizedRiskScore >= 70 ? "alert" : normalizedRiskScore >= 40 ? "warning" : "success";
    const riskLabel = normalizedRiskScore >= 70 ? "High risk" : normalizedRiskScore >= 40 ? "Needs attention" : "Stable";
    const needsNutritionNudge = Boolean(activeNutrition) && weeklyMealEntries.length === 0 && daysSinceMeal > 1;
    const needsTrainingNudge = Boolean(activeProgram) && weeklyWorkoutLogs.length === 0 && daysSinceWorkout > 3;
    const needsCheckinNudge = overdueCheckins > 0;
    const needsPhotoNudge = Boolean(activeProgram || activeNutrition) && daysSincePhoto > 21;
    const quietThisWeek =
      weeklyWorkoutLogs.length === 0
      && weeklyNutritionLogs.length === 0
      && weeklyMealEntries.length === 0
      && weeklyNutritionPhotos.length === 0
      && weeklyCheckins.length === 0;

    const operationsFlags = [];
    if (needsNutritionNudge) operationsFlags.push("Needs nutrition logging nudge");
    if (needsCheckinNudge) operationsFlags.push("Needs health check-in follow-up");
    if (needsTrainingNudge) operationsFlags.push("Needs training rhythm prompt");
    if (needsPhotoNudge) operationsFlags.push("Needs progress photo refresh");
    if (quietThisWeek && daysSinceActivity > 3) operationsFlags.push("Quiet across the planner this week");

    const recommendedNudgeCategory = needsCheckinNudge
      ? "checkin"
      : needsNutritionNudge
        ? "nutrition"
        : needsTrainingNudge
          ? "training"
          : needsPhotoNudge
            ? "progress_photo"
            : "";

    const adherenceComponents = [];
    if (activeProgram) {
      adherenceComponents.push(
        weeklyProgramDays.length > 0
          ? Math.min(1, weeklyWorkoutLogs.length / weeklyProgramDays.length)
          : weeklyWorkoutLogs.length > 0
            ? 1
            : 0
      );
    }
    if (activeNutrition) {
      adherenceComponents.push(
        mealPlanDayCount > 0
          ? Math.min(1, weeklyMealEntries.length / mealPlanDayCount)
          : (weeklyMealEntries.length > 0 || weeklyNutritionLogs.length > 0)
            ? 1
            : 0
      );
    }
    adherenceComponents.push(
      overdueCheckins > 0
        ? 0
        : weeklyCheckins.length > 0
          ? 1
          : clientCheckins.length > 0
            ? 0.72
            : 0.55
    );
    if (activeProgram || activeNutrition) {
      adherenceComponents.push(
        daysSincePhoto <= 14
          ? 1
          : daysSincePhoto <= 28
            ? 0.68
            : daysSincePhoto <= 42
              ? 0.38
              : 0.16
      );
    }
    const adherenceScore = adherenceComponents.length
      ? Math.round(
          (adherenceComponents.reduce((sum, value) => sum + value, 0) / adherenceComponents.length) * 100
        )
      : 0;
    const slipping = normalizedRiskScore >= 40 || quietThisWeek || overdueCheckins > 0;
    const improving =
      !slipping
      && adherenceScore >= 72
      && (weeklyWorkoutLogs.length + weeklyMealEntries.length + weeklyCheckins.length + weeklyProgressPhotos.length) >= 2;

    return {
      ...client,
      activeProgram,
      activeNutrition,
      pendingReviews,
      overdueCheckins,
      riskScore: normalizedRiskScore,
      riskTone,
      riskLabel,
      riskFlags: riskFlags.slice(0, 4),
      daysSinceActivity,
      daysSincePhoto,
      daysSinceMeal,
      weeklyProgramDayCount: weeklyProgramDays.length,
      weeklyWorkoutCount: weeklyWorkoutLogs.length,
      weeklyNutritionCount: weeklyNutritionLogs.length,
      weeklyMealCount: weeklyMealEntries.length,
      weeklyCheckinCount: weeklyCheckins.length,
      mealPlanDayCount,
      weeklyPhotoCount: weeklyNutritionPhotos.length + weeklyProgressPhotos.length,
      needsNutritionNudge,
      needsTrainingNudge,
      needsCheckinNudge,
      needsPhotoNudge,
      quietThisWeek,
      adherenceScore,
      improving,
      slipping,
      operationsFlags: operationsFlags.slice(0, 4),
      recommendedNudgeCategory,
    };
  }).sort((left, right) => String(left.preferredName || left.displayName).localeCompare(String(right.preferredName || right.displayName)));

  const averageRiskScore = roster.length
    ? Math.round(roster.reduce((sum, client) => sum + Number(client.riskScore || 0), 0) / roster.length)
    : 0;
  const averageAdherenceScore = roster.length
    ? Math.round(roster.reduce((sum, client) => sum + Number(client.adherenceScore || 0), 0) / roster.length)
    : 0;
  const rosterHealthScore = clamp(Math.round(100 - averageRiskScore), 0, 100);
  const stableClients = roster.filter((client) => client.riskScore < 40).length;
  const slippingClients = roster.filter((client) => client.slipping).length;
  const improvingClients = roster.filter((client) => client.improving).length;
  const noProgramClients = roster.filter((client) => !client.activeProgram).length;
  const noNutritionClients = roster.filter((client) => !client.activeNutrition).length;
  const programCoveragePercent = safePercent(roster.length - noProgramClients, roster.length, 0);
  const nutritionCoveragePercent = safePercent(roster.length - noNutritionClients, roster.length, 0);
  const quietClients = roster.filter((client) => client.quietThisWeek && client.daysSinceActivity > 3).length;
  const pendingReviews = roster.reduce((sum, client) => sum + client.pendingReviews, 0);
  const reviewPressureScore = clamp(
    Math.round(
      roster.length
        ? ((pendingReviews * 7) + (roster.filter((client) => client.riskScore >= 40).length * 10) + (quietClients * 6))
          / roster.length
        : 0
    ),
    0,
    100
  );

  const topDrivers = [
    { key: "checkin", label: "Overdue health follow-up", count: roster.filter((client) => client.needsCheckinNudge).length, tone: "alert" },
    { key: "nutrition", label: "Nutrition drop-off", count: roster.filter((client) => client.needsNutritionNudge).length, tone: "warning" },
    { key: "training", label: "Training drift", count: roster.filter((client) => client.needsTrainingNudge).length, tone: "warning" },
    { key: "program", label: "Missing active program", count: noProgramClients, tone: "info" },
    { key: "photo", label: "Photo refresh needed", count: roster.filter((client) => client.needsPhotoNudge).length, tone: "neutral" },
    { key: "quiet", label: "Quiet this week", count: quietClients, tone: "alert" },
  ]
    .filter((driver) => driver.count > 0)
    .sort((left, right) => right.count - left.count)
    .slice(0, 4);

  const focusAreas = [
    pendingReviews > 0
      ? {
          id: "reviews",
          title: "Clear planner reviews",
          detail: `${pendingReviews} pending item${pendingReviews === 1 ? "" : "s"} are slowing down coaching response time.`,
          tone: pendingReviews >= 8 ? "alert" : "warning",
          actionUrl: "/coach-programming.html?tab=reviews",
        }
      : null,
    roster.filter((client) => client.needsCheckinNudge).length > 0
      ? {
          id: "checkins",
          title: "Recover overdue health updates",
          detail: `${roster.filter((client) => client.needsCheckinNudge).length} client${roster.filter((client) => client.needsCheckinNudge).length === 1 ? "" : "s"} need a health follow-up right now.`,
          tone: "alert",
          actionUrl: "/coach-programming.html?tab=operations",
        }
      : null,
    noProgramClients > 0
      ? {
          id: "programs",
          title: "Close program coverage gaps",
          detail: `${noProgramClients} client${noProgramClients === 1 ? "" : "s"} still do not have an active training block.`,
          tone: "info",
          actionUrl: "/coach-training.html?tab=assignments",
        }
      : null,
    noNutritionClients > 0
      ? {
          id: "nutrition",
          title: "Attach nutrition layers",
          detail: `${noNutritionClients} client${noNutritionClients === 1 ? "" : "s"} still do not have an active nutrition layer.`,
          tone: "warning",
          actionUrl: "/coach-programming.html?tab=delivery",
        }
      : null,
    quietClients > 0
      ? {
          id: "quiet",
          title: "Wake up quiet clients",
          detail: `${quietClients} client${quietClients === 1 ? "" : "s"} have gone quiet across training, nutrition, and health this week.`,
          tone: "warning",
          actionUrl: "/coach-programming.html?tab=operations",
        }
      : null,
  ].filter(Boolean).slice(0, 4);

  const summary = {
    roster: roster.length,
    atRiskClients: roster.filter((client) => client.riskScore >= 40).length,
    nutritionNudges: roster.filter((client) => client.needsNutritionNudge).length,
    checkinNudges: roster.filter((client) => client.needsCheckinNudge).length,
    quietClients,
    photoNudges: roster.filter((client) => client.needsPhotoNudge).length,
    pendingReviews,
  };

  return {
    roster,
    summary,
    intelligence: {
      rosterHealthScore,
      averageRiskScore,
      averageAdherenceScore,
      reviewPressureScore,
      stableClients,
      slippingClients,
      improvingClients,
      noProgramClients,
      noNutritionClients,
      programCoveragePercent,
      nutritionCoveragePercent,
      topDrivers,
      focusAreas,
    },
    weekLabel: `${getStartOfWeek().toISOString().slice(0, 10)}:${getEndOfWeek().toISOString().slice(0, 10)}`,
  };
}

function shouldRunAutomationSchedule(schedule, now = new Date()) {
  const localHour = now.getHours();
  const localDay = now.getDay();
  switch (schedule) {
    case "hourly":
      return true;
    case "daily_morning":
      return localHour === 8;
    case "daily_evening":
      return localHour === 19;
    case "weekday_midday":
      return localDay >= 1 && localDay <= 5 && localHour === 12;
    case "weekly_monday":
      return localDay === 1 && localHour === 8;
    default:
      return false;
  }
}

function buildWeeklyCoachBrief(insights) {
  const highestRisk = (insights.roster || [])
    .filter((client) => client.riskScore >= 40)
    .slice()
    .sort((left, right) => right.riskScore - left.riskScore)
    .slice(0, 3);

  return {
    title: "Weekly coaching brief",
    body: highestRisk.length
      ? `${insights.summary.atRiskClients} at-risk clients, ${insights.summary.pendingReviews} pending reviews, and ${insights.summary.quietClients} quiet clients. Top watchlist: ${highestRisk.map((client) => client.preferredName || client.displayName).join(", ")}.`
      : `${insights.summary.pendingReviews} pending reviews across the roster. No clients are currently tripping the high-risk threshold.`,
  };
}

module.exports = {
  ALLOWED_AUTOMATION_CATEGORIES,
  ALLOWED_AUTOMATION_SCHEDULES,
  DEFAULT_COACH_AUTOMATION_RULES,
  DEFAULT_COACH_OPS_SEGMENTS,
  buildCoachPlannerInsights,
  buildWeeklyCoachBrief,
  sanitizeCoachAutomationRules,
  sanitizeCoachOpsSegments,
  segmentMatchesClient,
  shouldRunAutomationSchedule,
};
