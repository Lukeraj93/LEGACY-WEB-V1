const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { readWorkbookFileSheets, sheetRowsToObjects } = require("../../../lib/excel-workbook.js");

const { json } = require("./http");
const { getAuthenticatedProfile } = require("./supabase");
const {
  buildActionRows,
  buildImportPayload,
  normalizeBooleanLike,
  readCoachXpBundle,
  toIsoDateString,
} = require("../../../XP coach gamification/Config/coach-xp-engine.js");

function resolveExistingPath(candidates = []) {
  return candidates.find((candidate) => fs.existsSync(candidate)) || candidates[0];
}

const MODULE_ROOT = resolveExistingPath([
  path.resolve(process.cwd(), "XP coach gamification"),
  path.resolve(__dirname, "../../../XP coach gamification"),
  path.resolve(__dirname, "../../XP coach gamification"),
  path.resolve(__dirname, "../XP coach gamification"),
  path.resolve(__dirname, "XP coach gamification"),
]);
const WORKBOOK_PATH = path.resolve(MODULE_ROOT, "Data/LEGACY+_CoachXP_System_v2_FIXED.xlsx");
const XP_COACH_SCHEMA = "xp_coach";
const COACH_SESSION_NOTE_WINDOW_MS = 24 * 60 * 60 * 1000;
const MALAYSIA_UTC_OFFSET_MS = 8 * 60 * 60 * 1000;
const COACH_SESSION_CHECKIN_OPEN_EARLY_MS = 30 * 60 * 1000;
const COACH_SESSION_ON_TIME_LATE_GRACE_MS = 10 * 60 * 1000;
const COACH_WEEKLY_AUDIT_LOOKBACK_WEEKS = 4;

function xpSchema(supabase) {
  return supabase.schema(XP_COACH_SCHEMA);
}

function toTimestampMs(value) {
  const timestamp = new Date(value || 0).getTime();
  return Number.isFinite(timestamp) && timestamp > 0 ? timestamp : Number.NaN;
}

function startOfMalaysiaDay(dateInput) {
  const timestamp = toTimestampMs(dateInput);
  if (!Number.isFinite(timestamp)) {
    return null;
  }

  const shifted = new Date(timestamp + MALAYSIA_UTC_OFFSET_MS);
  return new Date(Date.UTC(
    shifted.getUTCFullYear(),
    shifted.getUTCMonth(),
    shifted.getUTCDate(),
  ) - MALAYSIA_UTC_OFFSET_MS);
}

function addDays(dateInput, days) {
  const timestamp = toTimestampMs(dateInput);
  if (!Number.isFinite(timestamp)) {
    return null;
  }

  return new Date(timestamp + Number(days || 0) * 24 * 60 * 60 * 1000);
}

function toMalaysiaIsoDateString(dateInput) {
  const timestamp = toTimestampMs(dateInput);
  if (!Number.isFinite(timestamp)) {
    return "";
  }

  const shifted = new Date(timestamp + MALAYSIA_UTC_OFFSET_MS);
  const year = shifted.getUTCFullYear();
  const month = String(shifted.getUTCMonth() + 1).padStart(2, "0");
  const day = String(shifted.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function startOfMalaysiaIsoWeek(dateInput) {
  const startOfDay = startOfMalaysiaDay(dateInput);
  if (!startOfDay) {
    return null;
  }

  const shifted = new Date(startOfDay.getTime() + MALAYSIA_UTC_OFFSET_MS);
  const weekday = shifted.getUTCDay() || 7;
  return addDays(startOfDay, 1 - weekday);
}

function getMalaysiaWeekKey(dateInput) {
  const weekStart = startOfMalaysiaIsoWeek(dateInput);
  return weekStart ? toMalaysiaIsoDateString(weekStart) : "";
}

function getCoachSessionCheckInOpensAt(scheduledStart) {
  const scheduledStartMs = toTimestampMs(scheduledStart);
  if (!Number.isFinite(scheduledStartMs)) {
    return null;
  }

  return new Date(scheduledStartMs - COACH_SESSION_CHECKIN_OPEN_EARLY_MS);
}

function canCoachCheckInNow({ scheduledStart, now = new Date() } = {}) {
  const opensAt = getCoachSessionCheckInOpensAt(scheduledStart);
  const nowMs = toTimestampMs(now);
  return Boolean(opensAt && Number.isFinite(nowMs) && nowMs >= opensAt.getTime());
}

function deriveCoachAttendanceStatus({ scheduledStart, checkedInAt } = {}) {
  const scheduledStartMs = toTimestampMs(scheduledStart);
  const checkedInAtMs = toTimestampMs(checkedInAt);
  if (!Number.isFinite(scheduledStartMs) || !Number.isFinite(checkedInAtMs)) {
    return null;
  }

  return checkedInAtMs <= scheduledStartMs + COACH_SESSION_ON_TIME_LATE_GRACE_MS
    ? "on_time"
    : "late";
}

function normalizeCoachXpSourceRefPart(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-+|-+$/gu, "");
}

function buildCoachXpSourceRef(...parts) {
  return parts
    .map(normalizeCoachXpSourceRefPart)
    .filter(Boolean)
    .join(":");
}

async function loadCoachXpEventBySourceRef(supabase, sourceRef) {
  if (!sourceRef) {
    return null;
  }

  const response = await xpSchema(supabase)
    .from("events")
    .select("*")
    .eq("source_ref", sourceRef)
    .maybeSingle();

  if (response.error) {
    throw response.error;
  }

  return response.data || null;
}

async function loadCoachXpAction(supabase, actionId) {
  const normalizedActionId = String(actionId || "").trim().toUpperCase();
  if (!normalizedActionId) {
    return null;
  }

  const response = await xpSchema(supabase)
    .from("actions")
    .select("action_id, is_active")
    .eq("action_id", normalizedActionId)
    .maybeSingle();

  if (response.error) {
    throw response.error;
  }

  return response.data || null;
}

async function ensureCoachXpCoachRecord(supabase, targetProfileId) {
  const normalizedProfileId = String(targetProfileId || "").trim();
  if (!normalizedProfileId) {
    return null;
  }

  const linkedCoachResponse = await xpSchema(supabase)
    .from("coaches")
    .select("coach_id, coach_name, status, profile_id")
    .eq("profile_id", normalizedProfileId)
    .maybeSingle();
  if (linkedCoachResponse.error) {
    throw linkedCoachResponse.error;
  }
  if (linkedCoachResponse.data?.coach_id) {
    return linkedCoachResponse.data;
  }

  const profileResponse = await supabase
    .from("profiles")
    .select("id, role, status, display_name")
    .eq("id", normalizedProfileId)
    .maybeSingle();
  if (profileResponse.error) {
    throw profileResponse.error;
  }

  const profile = profileResponse.data || null;
  if (!profile?.id || profile.role !== "coach") {
    return null;
  }

  const displayName = String(profile.display_name || "").trim();
  if (displayName) {
    const nameMatchResponse = await xpSchema(supabase)
      .from("coaches")
      .select("coach_id, coach_name, status, profile_id")
      .eq("coach_name", displayName)
      .limit(2);
    if (nameMatchResponse.error) {
      throw nameMatchResponse.error;
    }

    const nameMatches = nameMatchResponse.data || [];
    if (nameMatches.length === 1 && !nameMatches[0]?.profile_id) {
      const linkResponse = await xpSchema(supabase)
        .from("coaches")
        .update({
          profile_id: profile.id,
          status: profile.status === "inactive" ? "Inactive" : "Active",
        })
        .eq("coach_id", nameMatches[0].coach_id)
        .select("coach_id, coach_name, status, profile_id")
        .single();
      if (linkResponse.error) {
        throw linkResponse.error;
      }
      return linkResponse.data;
    }
  }

  const generatedCoachId = `AUTO-${normalizedProfileId.replace(/-/gu, "").slice(0, 12).toUpperCase()}`;
  const upsertResponse = await xpSchema(supabase)
    .from("coaches")
    .upsert({
      coach_id: generatedCoachId,
      coach_name: displayName || `Coach ${normalizedProfileId.slice(0, 8)}`,
      status: profile.status === "inactive" ? "Inactive" : "Active",
      identity_path: "Neutral",
      profile_id: profile.id,
    }, {
      onConflict: "coach_id",
    })
    .select("coach_id, coach_name, status, profile_id")
    .single();

  if (upsertResponse.error) {
    throw upsertResponse.error;
  }

  return upsertResponse.data || null;
}

async function awardCoachXpAction(supabase, options = {}) {
  const actionId = String(options.actionId || "").trim().toUpperCase();
  const sourceRef = String(options.sourceRef || "").trim();
  const targetProfileId = String(options.targetProfileId || options.profileId || "").trim();
  const actorProfileId = String(options.actorProfileId || options.createdByProfileId || targetProfileId || "").trim() || null;

  if (!actionId || !sourceRef || !targetProfileId) {
    return {
      created: false,
      skipped: true,
      reason: "Missing action, source reference, or target profile.",
    };
  }

  const existingEvent = await loadCoachXpEventBySourceRef(supabase, sourceRef);
  if (existingEvent?.id) {
    return {
      created: false,
      skipped: false,
      event: existingEvent,
      coachId: existingEvent.coach_id,
    };
  }

  const action = await loadCoachXpAction(supabase, actionId);
  if (!action?.action_id || action.is_active === false) {
    return {
      created: false,
      skipped: true,
      reason: `Coach XP action ${actionId} is not active.`,
    };
  }

  const coach = await ensureCoachXpCoachRecord(supabase, targetProfileId);
  if (!coach?.coach_id) {
    return {
      created: false,
      skipped: true,
      reason: "The target coach is not linked to the Coach XP roster.",
    };
  }

  const insertResponse = await xpSchema(supabase)
    .from("events")
    .insert({
      event_date: toIsoDateString(options.eventDate || new Date()) || toIsoDateString(new Date()),
      coach_id: coach.coach_id,
      action_id: action.action_id,
      qty: Number(options.qty || 1) > 0 ? Number(options.qty || 1) : 1,
      verified: options.verified !== false,
      evidence: String(options.evidence || "").trim() || null,
      notes: String(options.notes || "").trim() || null,
      created_by_profile_id: actorProfileId,
      xp_override:
        options.xpOverride == null || options.xpOverride === ""
          ? null
          : Math.round(Number(options.xpOverride)),
      source_ref: sourceRef,
    })
    .select("*")
    .single();

  if (insertResponse.error) {
    if (String(insertResponse.error.code || "") === "23505") {
      const duplicateEvent = await loadCoachXpEventBySourceRef(supabase, sourceRef);
      return {
        created: false,
        skipped: false,
        event: duplicateEvent,
        coachId: duplicateEvent?.coach_id || coach.coach_id,
      };
    }
    throw insertResponse.error;
  }

  return {
    created: true,
    skipped: false,
    event: insertResponse.data,
    coachId: coach.coach_id,
  };
}

async function loadCoachSessionsForWeeklyAudit(supabase, coachProfileId, weekStart, weekEnd) {
  const response = await supabase
    .from("sessions")
    .select(
      "id, coach_id, status, scheduled_start, scheduled_end, completed_at, coach_check_in_at, coach_attendance_status, coach_note, coach_next_step, coach_note_recorded_at"
    )
    .eq("coach_id", coachProfileId)
    .gte("scheduled_start", weekStart.toISOString())
    .lt("scheduled_start", weekEnd.toISOString())
    .order("scheduled_start", { ascending: true });

  if (response.error) {
    throw response.error;
  }

  return response.data || [];
}

function normalizeCoachWeeklyAuditSessions(sessions = []) {
  const activeSessions = sessions.filter((session) => !["cancelled", "no_show"].includes(String(session?.status || "").trim().toLowerCase()));
  const allCompleted = activeSessions.length > 0 && activeSessions.every((session) => String(session?.status || "").trim().toLowerCase() === "completed");
  return {
    activeSessions,
    allCompleted,
  };
}

async function runCoachWeeklyComplianceAudits(supabase, options = {}) {
  const coachProfileId = String(options.coachProfileId || options.targetProfileId || "").trim();
  const actorProfileId = String(options.actorProfileId || coachProfileId || "").trim() || null;
  const referenceDate = options.referenceDate || new Date();
  const referenceWeekStart = startOfMalaysiaIsoWeek(referenceDate);
  const weeksBack = Math.max(1, Number(options.weeksBack || COACH_WEEKLY_AUDIT_LOOKBACK_WEEKS) || COACH_WEEKLY_AUDIT_LOOKBACK_WEEKS);
  const referenceTimestamp = toTimestampMs(referenceDate);

  if (!coachProfileId || !referenceWeekStart || !Number.isFinite(referenceTimestamp)) {
    return {
      executed: false,
      attendance: [],
      documentation: [],
    };
  }

  const results = {
    executed: true,
    attendance: [],
    documentation: [],
  };

  for (let weekOffset = 1; weekOffset <= weeksBack; weekOffset += 1) {
    const weekStart = addDays(referenceWeekStart, weekOffset * -7);
    const weekEnd = addDays(weekStart, 7);
    const weekKey = getMalaysiaWeekKey(weekStart);
    const auditEventDate = toMalaysiaIsoDateString(addDays(weekEnd, -1)) || weekKey;
    if (!weekStart || !weekEnd || !weekKey) {
      continue;
    }

    const sessions = await loadCoachSessionsForWeeklyAudit(supabase, coachProfileId, weekStart, weekEnd);
    const { activeSessions, allCompleted } = normalizeCoachWeeklyAuditSessions(sessions);

    if (!activeSessions.length || !allCompleted) {
      results.attendance.push({
        weekKey,
        awarded: false,
        reason: activeSessions.length
          ? "That week still has sessions without a final completion state."
          : "No completed sessions were available for that week.",
      });
      results.documentation.push({
        weekKey,
        awarded: false,
        reason: activeSessions.length
          ? "That week still has sessions without a final completion state."
          : "No completed sessions were available for that week.",
      });
      continue;
    }

    const attendanceQualified = activeSessions.every((session) => {
      const attendanceStatus = session.coach_attendance_status || deriveCoachAttendanceStatus({
        scheduledStart: session.scheduled_start,
        checkedInAt: session.coach_check_in_at || session.completed_at,
      });
      return attendanceStatus === "on_time";
    });

    if (attendanceQualified) {
      const attendanceResult = await awardCoachXpAction(supabase, {
        actionId: "PRO-ONTM",
        targetProfileId: coachProfileId,
        actorProfileId,
        eventDate: auditEventDate,
        sourceRef: buildCoachXpSourceRef("weekly-attendance", coachProfileId, weekKey, "pro-ontm"),
        evidence: weekKey,
        notes: "Every completed session in the audited week was checked in on time.",
      }).catch(() => ({
        created: false,
        skipped: true,
        reason: "Unable to record weekly punctuality XP.",
      }));

      results.attendance.push({
        weekKey,
        awarded: Boolean(attendanceResult?.created || attendanceResult?.event),
        result: attendanceResult,
      });
    } else {
      results.attendance.push({
        weekKey,
        awarded: false,
        reason: "One or more completed sessions were checked in late.",
      });
    }

    const documentationDeadline = activeSessions.reduce((latestDeadline, session) => {
      const baseTimestamp = toTimestampMs(session.completed_at || session.scheduled_end || session.scheduled_start);
      if (!Number.isFinite(baseTimestamp)) {
        return latestDeadline;
      }
      return Math.max(latestDeadline, baseTimestamp + COACH_SESSION_NOTE_WINDOW_MS);
    }, 0);

    if (!Number.isFinite(documentationDeadline) || documentationDeadline <= 0 || referenceTimestamp < documentationDeadline) {
      results.documentation.push({
        weekKey,
        awarded: false,
        reason: "The 24-hour documentation window is still open for at least one session in that week.",
      });
      continue;
    }

    const documentationQualified = activeSessions.every((session) => shouldAwardCoachSessionNote({
      completedAt: session.completed_at,
      scheduledEnd: session.scheduled_end,
      noteRecordedAt: session.coach_note_recorded_at,
      coachNote: session.coach_note,
      nextStep: session.coach_next_step,
    }));

    if (documentationQualified) {
      const documentationResult = await awardCoachXpAction(supabase, {
        actionId: "SYS-NOTE100",
        targetProfileId: coachProfileId,
        actorProfileId,
        eventDate: auditEventDate,
        sourceRef: buildCoachXpSourceRef("weekly-documentation", coachProfileId, weekKey, "sys-note100"),
        evidence: weekKey,
        notes: "Every completed session in the audited week had notes recorded inside the 24-hour window.",
      }).catch(() => ({
        created: false,
        skipped: true,
        reason: "Unable to record weekly documentation XP.",
      }));

      results.documentation.push({
        weekKey,
        awarded: Boolean(documentationResult?.created || documentationResult?.event),
        result: documentationResult,
      });
    } else {
      results.documentation.push({
        weekKey,
        awarded: false,
        reason: "At least one completed session missed the 24-hour note window.",
      });
    }
  }

  return results;
}

function shouldAwardCoachSessionNote({
  completedAt,
  scheduledEnd,
  noteRecordedAt,
  coachNote,
  nextStep,
} = {}) {
  const noteText = String(coachNote || "").trim();
  const nextStepText = String(nextStep || "").trim();
  if (!noteText || !nextStepText) {
    return false;
  }

  const baseTimestamp = new Date(completedAt || scheduledEnd || 0).getTime();
  const noteTimestamp = new Date(noteRecordedAt || 0).getTime();
  if (!Number.isFinite(baseTimestamp) || !Number.isFinite(noteTimestamp) || baseTimestamp <= 0 || noteTimestamp <= 0) {
    return false;
  }

  return noteTimestamp >= baseTimestamp && noteTimestamp - baseTimestamp <= COACH_SESSION_NOTE_WINDOW_MS;
}

async function requireSuperAdminAccess(event, supabase) {
  const access = await getAuthenticatedProfile(event, supabase);
  if (!access) {
    return {
      ok: false,
      response: json(401, { error: "A valid super admin session is required." }),
    };
  }

  if (access.profile.role !== "super_admin") {
    return {
      ok: false,
      response: json(403, { error: "Only super admins can access the Coach XP module." }),
    };
  }

  return {
    ok: true,
    access,
  };
}

function parseBody(event) {
  try {
    return JSON.parse(event.body || "{}");
  } catch (_) {
    return null;
  }
}

function workbookExists() {
  return fs.existsSync(WORKBOOK_PATH);
}

async function readWorkbookRows() {
  if (!workbookExists()) {
    return {};
  }

  const workbookSheets = await readWorkbookFileSheets(WORKBOOK_PATH, { defval: null });
  return Object.entries(workbookSheets).reduce((collection, [sheetName, rows]) => {
    collection[sheetName] = sheetRowsToObjects(rows, { defval: null });
    return collection;
  }, {});
}

function stableSourceRef(prefix, row) {
  const hash = crypto.createHash("sha256").update(JSON.stringify(row || {})).digest("hex").slice(0, 20);
  return `${prefix}:${hash}`;
}

function normalizeStatusFromWorkbook(value) {
  return normalizeBooleanLike(value) ? "Active" : "Inactive";
}

function normalizeCoachWorkbookRow(row) {
  const coachId = String(row?.CoachID || "").trim();
  if (!coachId) {
    return null;
  }

  return {
    coach_id: coachId,
    coach_name: String(row?.CoachName || "").trim() || coachId,
    identity_path: String(row?.IdentityPath || "Neutral").trim() || "Neutral",
    operational_role: String(row?.OperationalRole || "").trim() || null,
    status: normalizeStatusFromWorkbook(row?.Active ?? "Yes"),
  };
}

function normalizeActionWorkbookRow(row) {
  const actionId = String(row?.ActionID || "").trim();
  if (!actionId) {
    return null;
  }

  return {
    action_id: actionId,
    action_name: String(row?.ActionName || "").trim() || actionId,
    bucket: String(row?.Bucket || "").trim(),
    xp_per: Number(row?.XPper || 0),
    cap_period: String(row?.CapPeriod || "None").trim() || "None",
    cap_max_xp: null,
    cooldown_days: 0,
    verification: String(row?.Verification || "").trim() || null,
    is_active: true,
  };
}

function normalizeEventWorkbookRow(row, actorId) {
  const coachId = String(row?.CoachID || "").trim();
  const actionId = String(row?.ActionID || "").trim();
  const eventDate = toIsoDateString(row?.Date);
  if (!coachId || !actionId || !eventDate) {
    return null;
  }

  return {
    event_date: eventDate,
    coach_id: coachId,
    action_id: actionId,
    qty: Number(row?.Qty || 1),
    verified: normalizeBooleanLike(row?.Verified ?? "Yes"),
    evidence: String(row?.Evidence || "").trim() || null,
    notes: String(row?.Notes || "").trim() || null,
    created_by_profile_id: actorId || null,
    xp_override: row?.XPOverride == null || row?.XPOverride === "" ? null : Number(row.XPOverride),
    source_ref: stableSourceRef("xlsx-xplog", row),
  };
}

function normalizeTrialWorkbookRow(row, actorId) {
  const coachId = String(row?.CoachID || "").trim();
  if (!coachId) {
    return null;
  }

  return {
    coach_id: coachId,
    current_role: String(row?.CurrentRole || "").trim() || "T1",
    target_role: String(row?.TargetRole || "").trim() || "T1",
    trial_date: toIsoDateString(row?.TrialDate) || null,
    skill_trial: String(row?.SkillTrial || "Pending").trim() || "Pending",
    knowledge_trial: String(row?.KnowledgeTrial || "Pending").trim() || "Pending",
    portfolio: String(row?.Portfolio || "Pending").trim() || "Pending",
    notes: String(row?.Notes || "").trim() || null,
    created_by_profile_id: actorId || null,
    source_ref: stableSourceRef("xlsx-trial", row),
  };
}

function normalizeSeedWorkbookRow(row, actorId) {
  const coachId = String(row?.CoachID || "").trim();
  if (!coachId) {
    return null;
  }

  return {
    coach_id: coachId,
    seed_xp: Number(row?.SeedXP || 0),
    approved: normalizeBooleanLike(row?.Approved ?? "No"),
    notes: String(row?.Notes || "").trim() || null,
    created_by_profile_id: actorId || null,
  };
}

async function upsertReferenceDataFromBundle(supabase) {
  const bundle = readCoachXpBundle();
  const payload = buildImportPayload(bundle);

  const settingsResponse = await xpSchema(supabase).from("settings").upsert(payload.settings, {
    onConflict: "key",
  });
  if (settingsResponse.error) {
    throw settingsResponse.error;
  }

  const roleTitlesResponse = await xpSchema(supabase).from("role_titles").upsert(payload.roleTitles, {
    onConflict: "role_id",
  });
  if (roleTitlesResponse.error) {
    throw roleTitlesResponse.error;
  }

  const xpBandsResponse = await xpSchema(supabase).from("xp_bands").upsert(payload.xpBands, {
    onConflict: "tier",
  });
  if (xpBandsResponse.error) {
    throw xpBandsResponse.error;
  }

  const actionsResponse = await xpSchema(supabase).from("actions").upsert(payload.actions, {
    onConflict: "action_id",
  });
  if (actionsResponse.error) {
    throw actionsResponse.error;
  }

  return {
    settings: payload.settings.length,
    roleTitles: payload.roleTitles.length,
    xpBands: payload.xpBands.length,
    actions: payload.actions.length,
  };
}

async function importWorkbookData(supabase, actorId) {
  if (!workbookExists()) {
    return {
      workbookImported: false,
      counts: {
        coaches: 0,
        actions: 0,
        events: 0,
        trials: 0,
        seeding: 0,
      },
    };
  }

  const sheets = await readWorkbookRows();
  const coaches = (sheets.CoachRoster || []).map(normalizeCoachWorkbookRow).filter(Boolean);
  const actions = (sheets.XPMenu || []).map(normalizeActionWorkbookRow).filter(Boolean);
  const events = (sheets.XPLog || []).map((row) => normalizeEventWorkbookRow(row, actorId)).filter(Boolean);
  const trials = (sheets.Trials || []).map((row) => normalizeTrialWorkbookRow(row, actorId)).filter(Boolean);
  const seeding = (sheets.SeedPlacement || []).map((row) => normalizeSeedWorkbookRow(row, actorId)).filter(Boolean);

  if (coaches.length) {
    const response = await xpSchema(supabase).from("coaches").upsert(coaches, {
      onConflict: "coach_id",
    });
    if (response.error) {
      throw response.error;
    }
  }

  if (actions.length) {
    const actionRows = buildActionRows(actions);
    const response = await xpSchema(supabase).from("actions").upsert(actionRows, {
      onConflict: "action_id",
    });
    if (response.error) {
      throw response.error;
    }
  }

  if (events.length) {
    const response = await xpSchema(supabase).from("events").upsert(events, {
      onConflict: "source_ref",
    });
    if (response.error) {
      throw response.error;
    }
  }

  if (trials.length) {
    const response = await xpSchema(supabase).from("trials").upsert(trials, {
      onConflict: "source_ref",
    });
    if (response.error) {
      throw response.error;
    }
  }

  if (seeding.length) {
    const response = await xpSchema(supabase).from("seeding").upsert(seeding, {
      onConflict: "coach_id",
    });
    if (response.error) {
      throw response.error;
    }
  }

  return {
    workbookImported: true,
    counts: {
      coaches: coaches.length,
      actions: actions.length,
      events: events.length,
      trials: trials.length,
      seeding: seeding.length,
    },
  };
}

async function runCoachXpImport(supabase, actorId, options = {}) {
  const referenceCounts = await upsertReferenceDataFromBundle(supabase);
  const workbookCounts = options.includeWorkbook === false ? {
    workbookImported: false,
    counts: { coaches: 0, actions: 0, events: 0, trials: 0, seeding: 0 },
  } : await importWorkbookData(supabase, actorId);

  return {
    bundleImported: true,
    workbookImported: workbookCounts.workbookImported,
    counts: {
      ...referenceCounts,
      ...workbookCounts.counts,
    },
  };
}

async function fetchModuleSnapshot(supabase) {
  const [coaches, actions, events, eventTotals, verifiedEventTotals, trials, seeding, ledger, weekly, monthly, quarterly] = await Promise.all([
    xpSchema(supabase).from("coach_overview_view").select("*").order("total_xp_counted", { ascending: false }),
    xpSchema(supabase).from("actions").select("*").order("bucket", { ascending: true }).order("action_id", { ascending: true }),
    xpSchema(supabase).from("event_scored_view").select("*").order("event_date", { ascending: false }).order("created_at", { ascending: false }).limit(150),
    xpSchema(supabase).from("events").select("id", { count: "exact", head: true }),
    xpSchema(supabase).from("events").select("id", { count: "exact", head: true }).eq("verified", true),
    xpSchema(supabase).from("trials").select("*").order("trial_date", { ascending: false, nullsFirst: false }).order("created_at", { ascending: false }).limit(100),
    xpSchema(supabase).from("seeding").select("*").order("created_at", { ascending: false }),
    xpSchema(supabase).from("ledger_view").select("*").order("total_xp_counted", { ascending: false }),
    xpSchema(supabase).from("weekly_bucket_summary_view").select("*").order("week_key", { ascending: false }).limit(200),
    xpSchema(supabase).from("monthly_bucket_summary_view").select("*").order("month_key", { ascending: false }).limit(200),
    xpSchema(supabase).from("quarterly_bucket_summary_view").select("*").order("quarter_key", { ascending: false }).limit(200),
  ]);

  for (const response of [coaches, actions, events, eventTotals, verifiedEventTotals, trials, seeding, ledger, weekly, monthly, quarterly]) {
    if (response.error) {
      throw response.error;
    }
  }

  return {
    coaches: coaches.data || [],
    actions: actions.data || [],
    events: events.data || [],
    trials: trials.data || [],
    seeding: seeding.data || [],
    ledger: ledger.data || [],
    weekly: weekly.data || [],
    monthly: monthly.data || [],
    quarterly: quarterly.data || [],
    eventCounts: {
      total: Number(eventTotals.count || 0),
      verified: Number(verifiedEventTotals.count || 0),
    },
    workbookAvailable: workbookExists(),
  };
}

async function writeXpCoachAuditLog(supabase, actorId, action, details) {
  await supabase.from("audit_logs").insert({
    actor_id: actorId || null,
    entity_type: "xp_coach",
    entity_id: details?.entityId || null,
    action,
    details,
  });
}

module.exports = {
  MODULE_ROOT,
  WORKBOOK_PATH,
  XP_COACH_SCHEMA,
  COACH_SESSION_CHECKIN_OPEN_EARLY_MS,
  COACH_SESSION_ON_TIME_LATE_GRACE_MS,
  xpSchema,
  buildCoachXpSourceRef,
  awardCoachXpAction,
  canCoachCheckInNow,
  deriveCoachAttendanceStatus,
  getCoachSessionCheckInOpensAt,
  runCoachWeeklyComplianceAudits,
  shouldAwardCoachSessionNote,
  parseBody,
  workbookExists,
  readWorkbookRows,
  requireSuperAdminAccess,
  runCoachXpImport,
  fetchModuleSnapshot,
  writeXpCoachAuditLog,
};
