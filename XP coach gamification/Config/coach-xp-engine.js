const path = require("node:path");
const fs = require("node:fs");

const SETTINGS_DEFAULTS = Object.freeze({
  CoachingWeeklyCapXP: 120,
  EducationMonthlyCapXP: 150,
  OpsMonthlyCapXP: 120,
  MentorshipMonthlyCapXP: 150,
  ImpactQuarterlyCapXP: 300,
  CompetitionQuarterlyCapXP: 300,
  WeekStart: "MON",
  MaxXP: 20000,
});

const PERIOD_GROUPS = Object.freeze({
  coaching: {
    period: "weekly",
    settingKey: "CoachingWeeklyCapXP",
    buckets: ["Coaching"],
  },
  education: {
    period: "monthly",
    settingKey: "EducationMonthlyCapXP",
    buckets: ["Education"],
  },
  ops: {
    period: "monthly",
    settingKey: "OpsMonthlyCapXP",
    buckets: ["Ops", "Professional", "Systems", "Programming", "Experience"],
  },
  mentorship: {
    period: "monthly",
    settingKey: "MentorshipMonthlyCapXP",
    buckets: ["Mentorship", "Reputation"],
  },
  impact: {
    period: "quarterly",
    settingKey: "ImpactQuarterlyCapXP",
    buckets: ["Impact", "Competition"],
  },
  uncapped: {
    period: "none",
    settingKey: null,
    buckets: ["Admin", "Seeding"],
  },
});

function resolveExistingPath(candidates = []) {
  return candidates.find((candidate) => fs.existsSync(candidate)) || candidates[0];
}

function bundlePath() {
  return resolveExistingPath([
    path.resolve(process.cwd(), "XP coach gamification/Data/LEGACY+_CoachXP_Codex_Bundle_v1.json"),
    path.resolve(__dirname, "../Data/LEGACY+_CoachXP_Codex_Bundle_v1.json"),
    path.resolve(__dirname, "../../Data/LEGACY+_CoachXP_Codex_Bundle_v1.json"),
  ]);
}

function readCoachXpBundle() {
  const raw = fs.readFileSync(bundlePath(), "utf8");
  return JSON.parse(raw);
}

function extractRulesEngine(bundle) {
  if (!bundle || bundle.bundleType !== "LEGACY+_CoachXP_Codex_Bundle") {
    throw new Error("Invalid coach XP bundle: bundleType mismatch.");
  }

  const rulesEngine = bundle.contents?.rulesEngine;
  if (!rulesEngine?.settings || !Array.isArray(rulesEngine.actions) || !Array.isArray(rulesEngine.operationalRoles)) {
    throw new Error("Invalid coach XP bundle: missing rules engine payload.");
  }

  return rulesEngine;
}

function toUpperSlug(value) {
  return String(value || "")
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toUpperCase();
}

function normalizeWeekStart(value) {
  const normalized = String(value || "")
    .trim()
    .slice(0, 3)
    .toUpperCase();
  return normalized || SETTINGS_DEFAULTS.WeekStart;
}

function normalizeCapPeriod(value) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();

  if (!normalized || normalized === "none") {
    return "None";
  }
  if (normalized === "weekly") {
    return "Weekly";
  }
  if (normalized === "monthly") {
    return "Monthly";
  }
  if (normalized === "quarterly") {
    return "Quarterly";
  }
  if (normalized === "yearly") {
    return "Yearly";
  }
  if (normalized === "onetime" || normalized === "one-time" || normalized === "one time") {
    return "OneTime";
  }
  if (normalized === "adhoc" || normalized === "ad hoc") {
    return "None";
  }

  return "None";
}

function normalizeSettings(input = {}) {
  return {
    CoachingWeeklyCapXP: Number(input.CoachingWeeklyCapXP ?? input.coachingWeeklyCapXP ?? SETTINGS_DEFAULTS.CoachingWeeklyCapXP),
    EducationMonthlyCapXP: Number(
      input.EducationMonthlyCapXP ?? input.educationMonthlyCapXP ?? SETTINGS_DEFAULTS.EducationMonthlyCapXP
    ),
    OpsMonthlyCapXP: Number(input.OpsMonthlyCapXP ?? input.opsMonthlyCapXP ?? SETTINGS_DEFAULTS.OpsMonthlyCapXP),
    MentorshipMonthlyCapXP: Number(
      input.MentorshipMonthlyCapXP ?? input.mentorshipMonthlyCapXP ?? SETTINGS_DEFAULTS.MentorshipMonthlyCapXP
    ),
    ImpactQuarterlyCapXP: Number(
      input.ImpactQuarterlyCapXP ?? input.impactQuarterlyCapXP ?? SETTINGS_DEFAULTS.ImpactQuarterlyCapXP
    ),
    CompetitionQuarterlyCapXP: Number(
      input.CompetitionQuarterlyCapXP ?? input.competitionQuarterlyCapXP ?? input.impactQuarterlyCapXP ?? SETTINGS_DEFAULTS.CompetitionQuarterlyCapXP
    ),
    WeekStart: normalizeWeekStart(input.WeekStart ?? input.weekStartType ?? SETTINGS_DEFAULTS.WeekStart),
    MaxXP: Number(input.MaxXP ?? input.maxXP ?? SETTINGS_DEFAULTS.MaxXP),
  };
}

function buildSettingsRows(bundleSettings = {}) {
  const normalized = normalizeSettings(bundleSettings);
  return Object.entries(normalized).map(([key, value]) => ({
    key,
    value: String(value),
  }));
}

function buildActionRows(actions = []) {
  return actions.map((action) => ({
    action_id: String(action.actionId || action.action_id || "").trim(),
    action_name: String(action.displayName || action.action_name || "").trim(),
    bucket: String(action.bucket || "").trim(),
    xp_per: Number(action.xp ?? action.xp_per ?? 0),
    cap_period: normalizeCapPeriod(action.capPeriod || action.cap_period || "None"),
    cap_max_xp: action.capMaxXP == null ? null : Number(action.capMaxXP),
    cooldown_days: Number(action.cooldownDays ?? action.cooldown_days ?? 0),
    verification: String(action.verification || "").trim() || null,
    is_active: action.isActive !== false,
  }));
}

function buildXpBandRows(xpBands = []) {
  return xpBands.map((band) => ({
    tier: String(band.tier || "").trim(),
    min_xp: Number(band.minXP ?? band.min_xp ?? 0),
    max_xp: Number(band.maxXP ?? band.max_xp ?? 0),
    level_start: Number(band.levelStart ?? band.level_start ?? 0),
    level_end: Number(band.levelEnd ?? band.level_end ?? 0),
    level_count: Number(band.levelCount ?? band.level_count ?? 0),
    step_xp: Number(band.stepXP ?? band.step_xp ?? 0),
  }));
}

function buildRoleTitleRows(roles = [], xpBands = []) {
  const bandByTier = new Map(buildXpBandRows(xpBands).map((band) => [band.tier, band]));
  return roles.map((role) => {
    const roleId = String(role.operationalRole || role.roleId || role.role_id || "").trim();
    const band = bandByTier.get(roleId);
    return {
      role_id: roleId,
      min_xp: Number(role.minXPEligible ?? role.min_xp ?? band?.min_xp ?? 0),
      max_xp: Number(role.maxXP ?? role.max_xp ?? band?.max_xp ?? 0),
      operational_title: String(role.operationalTitle || role.operational_title || "").trim(),
      greek_title: String(role.greekTitle || role.greek_title || "").trim(),
      aesir_title: String(role.aesirTitle || role.aesir_title || "").trim(),
    };
  });
}

function normalizeBooleanLike(value) {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase();
  if (["yes", "y", "true", "1", "approved", "active", "pass"].includes(normalized)) {
    return true;
  }
  if (["no", "n", "false", "0", "inactive", "fail"].includes(normalized)) {
    return false;
  }
  return false;
}

function toIsoDateString(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  const normalized = String(value || "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    return normalized;
  }
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }
  return parsed.toISOString().slice(0, 10);
}

function startOfIsoWeek(date) {
  const copy = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = copy.getUTCDay() || 7;
  copy.setUTCDate(copy.getUTCDate() + 1 - day);
  return copy;
}

function getIsoWeekKey(dateInput) {
  const date = new Date(`${dateInput}T00:00:00Z`);
  const weekStart = startOfIsoWeek(date);
  const thursday = new Date(weekStart);
  thursday.setUTCDate(weekStart.getUTCDate() + 3);
  const year = thursday.getUTCFullYear();
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4WeekStart = startOfIsoWeek(jan4);
  const diffDays = Math.round((weekStart - jan4WeekStart) / 86400000);
  const week = Math.floor(diffDays / 7) + 1;
  return `${year}-W${String(week).padStart(2, "0")}`;
}

function getMonthKey(dateInput) {
  return String(dateInput || "").slice(0, 7);
}

function getQuarterKey(dateInput) {
  const date = new Date(`${dateInput}T00:00:00Z`);
  const quarter = Math.floor(date.getUTCMonth() / 3) + 1;
  return `${date.getUTCFullYear()}-Q${quarter}`;
}

function determineRole(totalXp, roleTitles = [], roleLockedTo = null) {
  const normalizedTitles = [...roleTitles].sort((left, right) => Number(left.min_xp || 0) - Number(right.min_xp || 0));
  const derived = normalizedTitles.reduce((current, role) => {
    if (Number(totalXp || 0) >= Number(role.min_xp || 0)) {
      return role;
    }
    return current;
  }, normalizedTitles[0] || null);

  if (roleLockedTo) {
    const locked = normalizedTitles.find((role) => role.role_id === roleLockedTo);
    if (locked) {
      return {
        derived_role_id: derived?.role_id || null,
        current_role_id: locked.role_id,
        operational_title: locked.operational_title,
        greek_title: locked.greek_title,
        aesir_title: locked.aesir_title,
      };
    }
  }

  return {
    derived_role_id: derived?.role_id || null,
    current_role_id: derived?.role_id || null,
    operational_title: derived?.operational_title || null,
    greek_title: derived?.greek_title || null,
    aesir_title: derived?.aesir_title || null,
  };
}

function computeTrialResult(trial = {}) {
  const skill = String(trial.skill_trial || "Pending").trim();
  const knowledge = String(trial.knowledge_trial || "Pending").trim();
  const portfolio = String(trial.portfolio || "Pending").trim();
  return skill === "Pass" && knowledge === "Pass" && portfolio === "Pass" ? "PROMOTE" : "NOT_YET";
}

function computeCoachLedger({ events = [], actions = [], settings = {}, roleTitles = [], coaches = [] }) {
  const normalizedSettings = normalizeSettings(settings);
  const actionMap = new Map(buildActionRows(actions).map((action) => [action.action_id, action]));
  const coachMap = new Map(
    (coaches || []).map((coach) => [
      String(coach.coach_id || coach.coachId || "").trim(),
      {
        coach_id: String(coach.coach_id || coach.coachId || "").trim(),
        coach_name: String(coach.coach_name || coach.coachName || "").trim(),
        role_locked_to: String(coach.role_locked_to || coach.roleLockedTo || "").trim() || null,
      },
    ])
  );

  const grouped = new Map();
  const uncappedTotals = new Map();

  const addGroupedXp = (coachId, groupKey, periodKey, amount) => {
    const storageKey = `${coachId}::${groupKey}::${periodKey}`;
    grouped.set(storageKey, Number(grouped.get(storageKey) || 0) + Number(amount || 0));
  };

  const addUncappedXp = (coachId, bucket, amount) => {
    const storageKey = `${coachId}::${bucket}`;
    uncappedTotals.set(storageKey, Number(uncappedTotals.get(storageKey) || 0) + Number(amount || 0));
  };

  for (const event of events) {
    const coachId = String(event.coach_id || event.coachId || "").trim();
    const actionId = String(event.action_id || event.actionId || "").trim();
    const action = actionMap.get(actionId);
    const eventDate = toIsoDateString(event.event_date || event.eventDate);
    if (!coachId || !action || !eventDate) {
      continue;
    }

    const verified = event.verified === false ? false : normalizeBooleanLike(event.verified ?? true);
    if (!verified) {
      continue;
    }

    const qty = Number(event.qty ?? 1);
    const xpOverride = event.xp_override == null ? null : Number(event.xp_override);
    const baseXp = xpOverride == null ? Number(action.xp_per || 0) * qty : xpOverride;
    const bucket = action.bucket;
    const groupKey = Object.entries(PERIOD_GROUPS).find(([, group]) => group.buckets.includes(bucket))?.[0] || "uncapped";

    if (groupKey === "uncapped") {
      addUncappedXp(coachId, bucket, baseXp);
      continue;
    }

    let periodKey = "";
    if (PERIOD_GROUPS[groupKey].period === "weekly") {
      periodKey = getIsoWeekKey(eventDate);
    } else if (PERIOD_GROUPS[groupKey].period === "monthly") {
      periodKey = getMonthKey(eventDate);
    } else if (PERIOD_GROUPS[groupKey].period === "quarterly") {
      periodKey = getQuarterKey(eventDate);
    }

    addGroupedXp(coachId, groupKey, periodKey, baseXp);
  }

  const coachIds = new Set([
    ...coachMap.keys(),
    ...Array.from(grouped.keys()).map((key) => key.split("::")[0]),
    ...Array.from(uncappedTotals.keys()).map((key) => key.split("::")[0]),
  ]);

  return Array.from(coachIds).map((coachId) => {
    const coachingWeeklyCountedXp = Array.from(grouped.entries())
      .filter(([key]) => key.startsWith(`${coachId}::coaching::`))
      .reduce((total, [, value]) => total + Math.min(value, normalizedSettings.CoachingWeeklyCapXP), 0);
    const educationMonthlyCountedXp = Array.from(grouped.entries())
      .filter(([key]) => key.startsWith(`${coachId}::education::`))
      .reduce((total, [, value]) => total + Math.min(value, normalizedSettings.EducationMonthlyCapXP), 0);
    const opsMonthlyCountedXp = Array.from(grouped.entries())
      .filter(([key]) => key.startsWith(`${coachId}::ops::`))
      .reduce((total, [, value]) => total + Math.min(value, normalizedSettings.OpsMonthlyCapXP), 0);
    const mentorshipMonthlyCountedXp = Array.from(grouped.entries())
      .filter(([key]) => key.startsWith(`${coachId}::mentorship::`))
      .reduce((total, [, value]) => total + Math.min(value, normalizedSettings.MentorshipMonthlyCapXP), 0);
    const impactQuarterlyCountedXp = Array.from(grouped.entries())
      .filter(([key]) => key.startsWith(`${coachId}::impact::`))
      .reduce((total, [, value]) => total + Math.min(value, normalizedSettings.ImpactQuarterlyCapXP), 0);
    const uncappedAdminXp = Number(uncappedTotals.get(`${coachId}::Admin`) || 0);
    const uncappedSeedingXp = Number(uncappedTotals.get(`${coachId}::Seeding`) || 0);
    const totalXpCounted =
      coachingWeeklyCountedXp
      + educationMonthlyCountedXp
      + opsMonthlyCountedXp
      + mentorshipMonthlyCountedXp
      + impactQuarterlyCountedXp
      + uncappedAdminXp
      + uncappedSeedingXp;

    const roleDetails = determineRole(totalXpCounted, roleTitles, coachMap.get(coachId)?.role_locked_to || null);

    return {
      coach_id: coachId,
      coach_name: coachMap.get(coachId)?.coach_name || coachId,
      coaching_weekly_counted_xp: coachingWeeklyCountedXp,
      education_monthly_counted_xp: educationMonthlyCountedXp,
      ops_monthly_counted_xp: opsMonthlyCountedXp,
      mentorship_monthly_counted_xp: mentorshipMonthlyCountedXp,
      impact_quarterly_counted_xp: impactQuarterlyCountedXp,
      uncapped_admin_xp: uncappedAdminXp,
      uncapped_seeding_xp: uncappedSeedingXp,
      total_xp_counted: totalXpCounted,
      global_level: Math.min(100, Math.floor((totalXpCounted / normalizedSettings.MaxXP) * 100)),
      ...roleDetails,
    };
  });
}

function buildImportPayload(bundle) {
  const rulesEngine = extractRulesEngine(bundle);
  const actions = buildActionRows(rulesEngine.actions).concat([
    {
      action_id: "SEED-INIT",
      action_name: "Initial Seed Placement",
      bucket: "Seeding",
      xp_per: 0,
      cap_period: "None",
      cap_max_xp: null,
      cooldown_days: 0,
      verification: "System-generated approved seed event",
      is_active: true,
    },
  ]);

  const uniqueActions = Array.from(
    actions.reduce((collection, action) => {
      collection.set(action.action_id, action);
      return collection;
    }, new Map()).values()
  );

  return {
    settings: buildSettingsRows(rulesEngine.settings),
    actions: uniqueActions,
    roleTitles: buildRoleTitleRows(rulesEngine.operationalRoles, rulesEngine.xpBands),
    xpBands: buildXpBandRows(rulesEngine.xpBands),
  };
}

module.exports = {
  SETTINGS_DEFAULTS,
  PERIOD_GROUPS,
  readCoachXpBundle,
  extractRulesEngine,
  normalizeSettings,
  normalizeCapPeriod,
  buildSettingsRows,
  buildActionRows,
  buildRoleTitleRows,
  buildXpBandRows,
  normalizeBooleanLike,
  toIsoDateString,
  getIsoWeekKey,
  getMonthKey,
  getQuarterKey,
  determineRole,
  computeTrialResult,
  computeCoachLedger,
  buildImportPayload,
  toUpperSlug,
};
