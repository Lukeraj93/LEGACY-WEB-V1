const DAY_MS = 24 * 60 * 60 * 1000;
const MALAYSIA_OFFSET_MS = 8 * 60 * 60 * 1000;
const DEFAULT_LOOKAHEAD_DAYS = 7;
const DEFAULT_START_HOUR = 6;
const DEFAULT_END_HOUR = 23;
const DAY_KEYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function toMalaysiaShifted(dateValue) {
  const date = dateValue instanceof Date ? dateValue : new Date(dateValue || Date.now());
  return new Date(date.getTime() + MALAYSIA_OFFSET_MS);
}

function getMalaysiaDateParts(dateValue) {
  const shifted = toMalaysiaShifted(dateValue);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth(),
    dayOfMonth: shifted.getUTCDate(),
    dayOfWeek: shifted.getUTCDay(),
  };
}

function makeMalaysiaDate(year, month, dayOfMonth, hour = 0, minute = 0) {
  return new Date(Date.UTC(year, month, dayOfMonth, hour - 8, minute, 0, 0));
}

function getMalaysiaStartOfDay(dateValue) {
  const parts = getMalaysiaDateParts(dateValue);
  return makeMalaysiaDate(parts.year, parts.month, parts.dayOfMonth, 0, 0);
}

function normalizeCoachNameAlias(name) {
  const normalized = String(name || "").trim().toLowerCase();
  if (normalized === "kylie denis") {
    return "kylie dennis";
  }
  return normalized;
}

function addMalaysiaDays(startDate, days) {
  return new Date(startDate.getTime() + days * DAY_MS);
}

function toDateIso(dateValue) {
  const parts = getMalaysiaDateParts(dateValue);
  return `${parts.year}-${String(parts.month + 1).padStart(2, "0")}-${String(parts.dayOfMonth).padStart(2, "0")}`;
}

function dayKeyFromIndex(dayOfWeek) {
  return DAY_KEYS[Number(dayOfWeek)] || "Day";
}

function dayLabelFromIndex(dayOfWeek) {
  return DAY_LABELS[Number(dayOfWeek)] || "Day";
}

function parseTimeValueToMinutes(value) {
  const match = String(value || "").match(/^(\d{2}):(\d{2})/u);
  if (!match) {
    return Number.NaN;
  }

  return Number(match[1]) * 60 + Number(match[2]);
}

function toTimeValue(totalMinutes) {
  const hours24 = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours24).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function formatClockLabel(totalMinutes, locale = "en-MY") {
  const normalizedMinutes = ((Number(totalMinutes) % 1440) + 1440) % 1440;
  const date = new Date();
  date.setHours(Math.floor(normalizedMinutes / 60), normalizedMinutes % 60, 0, 0);
  return new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatDateLabel(dateValue, locale = "en-MY") {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
  }).format(dateValue);
}

function overlapsRange(startA, endA, startB, endB) {
  return startA < endB && endA > startB;
}

function expandWindowIntoBlocks(windowRecord) {
  const startMinutes = parseTimeValueToMinutes(windowRecord?.start_time);
  const endMinutes = parseTimeValueToMinutes(windowRecord?.end_time);
  if (!Number.isFinite(startMinutes) || !Number.isFinite(endMinutes) || endMinutes <= startMinutes) {
    return [];
  }

  const blocks = [];
  let cursor = startMinutes;
  while (cursor < endMinutes) {
    const nextCursor = Math.min(cursor + 60, endMinutes);
    blocks.push({
      startMinutes: cursor,
      endMinutes: nextCursor,
    });
    cursor = nextCursor;
  }

  return blocks;
}

function sortWindows(windows) {
  return (windows || []).slice().sort((left, right) => {
    const dayDelta = Number(left.day_of_week || 0) - Number(right.day_of_week || 0);
    if (dayDelta !== 0) {
      return dayDelta;
    }

    return parseTimeValueToMinutes(left.start_time) - parseTimeValueToMinutes(right.start_time);
  });
}

function buildCoachCalendar(windows, sessions, options = {}) {
  const now = options.now instanceof Date ? options.now : new Date();
  const lookaheadDays = Math.max(1, Number(options.lookaheadDays || DEFAULT_LOOKAHEAD_DAYS));
  const startHour = Number(options.startHour || DEFAULT_START_HOUR);
  const endHour = Number(options.endHour || DEFAULT_END_HOUR);
  const locale = options.locale || "en-MY";
  const todayStart = getMalaysiaStartOfDay(now);
  const sortedWindows = sortWindows(windows);
  const activeSessions = (sessions || [])
    .filter((session) => session && String(session.status || "scheduled").toLowerCase() === "scheduled")
    .map((session) => ({
      ...session,
      start: new Date(session.scheduled_start),
      end: new Date(session.scheduled_end),
    }))
    .filter((session) => !Number.isNaN(session.start.getTime()) && !Number.isNaN(session.end.getTime()) && session.end > now)
    .sort((left, right) => left.start.getTime() - right.start.getTime());

  const days = [];
  for (let dayOffset = 0; dayOffset < lookaheadDays; dayOffset += 1) {
    const dayStart = addMalaysiaDays(todayStart, dayOffset);
    const dateIso = toDateIso(dayStart);
    const parts = getMalaysiaDateParts(dayStart);
    const windowsForDay = sortedWindows.filter((windowRecord) => Number(windowRecord.day_of_week) === parts.dayOfWeek);
    const blocks = [];

    windowsForDay.forEach((windowRecord) => {
      expandWindowIntoBlocks(windowRecord).forEach((block) => {
        const startDate = new Date(dayStart.getTime() + block.startMinutes * 60 * 1000);
        const endDate = new Date(dayStart.getTime() + block.endMinutes * 60 * 1000);
        if (endDate <= now) {
          return;
        }

        const matchingSession = activeSessions.find((session) =>
          overlapsRange(startDate.getTime(), endDate.getTime(), session.start.getTime(), session.end.getTime())
        );

        blocks.push({
          dateIso,
          startIso: startDate.toISOString(),
          endIso: endDate.toISOString(),
          startTime: toTimeValue(block.startMinutes),
          endTime: toTimeValue(block.endMinutes),
          startMinutes: block.startMinutes,
          endMinutes: block.endMinutes,
          label: `${formatClockLabel(block.startMinutes, locale)} - ${formatClockLabel(block.endMinutes, locale)}`,
          state: matchingSession ? "busy" : "available",
          statusLabel: matchingSession ? "Booked" : "Available",
          sessionId: matchingSession?.id || "",
        });
      });
    });

    blocks.sort((left, right) => left.startMinutes - right.startMinutes);
    days.push({
      key: dayKeyFromIndex(parts.dayOfWeek),
      label: dayLabelFromIndex(parts.dayOfWeek),
      shortLabel: dayKeyFromIndex(parts.dayOfWeek),
      dateIso,
      dateLabel: formatDateLabel(dayStart, locale),
      dayOfWeek: parts.dayOfWeek,
      blocks,
    });
  }

  return {
    timezone: options.timezone || "Asia/Kuala_Lumpur",
    startHour,
    endHour,
    generatedAt: now.toISOString(),
    rangeStartDate: toDateIso(todayStart),
    rangeEndDate: toDateIso(addMalaysiaDays(todayStart, lookaheadDays - 1)),
    days,
  };
}

function buildLegacySlots(windows, locale = "en-MY") {
  return sortWindows(windows).map((windowRecord) => ({
    day: dayKeyFromIndex(windowRecord.day_of_week),
    time: `${formatClockLabel(parseTimeValueToMinutes(windowRecord.start_time), locale)} - ${formatClockLabel(parseTimeValueToMinutes(windowRecord.end_time), locale)}`,
  }));
}

async function loadCoachAvailabilitySnapshot(supabase, options = {}) {
  const lookaheadDays = Math.max(1, Number(options.lookaheadDays || DEFAULT_LOOKAHEAD_DAYS));
  const locale = options.locale || "en-MY";
  const now = options.now instanceof Date ? options.now : new Date();
  const requestedCoachId = String(options.coachId || "").trim();
  const requestedCoachName = normalizeCoachNameAlias(options.coachName);

  let windowsQuery = supabase
    .from("coach_availability_windows")
    .select("id, coach_id, day_of_week, start_time, end_time, timezone, updated_at")
    .eq("is_active", true)
    .order("day_of_week", { ascending: true })
    .order("start_time", { ascending: true });

  if (requestedCoachId) {
    windowsQuery = windowsQuery.eq("coach_id", requestedCoachId);
  }

  const { data: windows, error: windowError } = await windowsQuery;
  if (windowError) {
    throw windowError;
  }

  const coachIds = Array.from(new Set((windows || []).map((item) => item.coach_id).filter(Boolean)));
  if (requestedCoachId && !coachIds.includes(requestedCoachId)) {
    coachIds.push(requestedCoachId);
  }
  if (!coachIds.length && !requestedCoachName) {
    return {};
  }

  let profilesQuery = supabase
    .from("profiles")
    .select("id, display_name, role, status")
    .eq("role", "coach")
    .eq("status", "active");

  if (coachIds.length) {
    profilesQuery = profilesQuery.in("id", coachIds);
  }

  const { data: profiles, error: profileError } = await profilesQuery;
  if (profileError) {
    throw profileError;
  }

  const filteredProfiles = (profiles || []).filter((profile) => {
    if (!requestedCoachName) {
      return true;
    }
    return String(profile.display_name || "").trim().toLowerCase() === requestedCoachName;
  });

  const activeCoachIds = filteredProfiles.map((profile) => profile.id);
  if (!activeCoachIds.length) {
    return {};
  }

  const rangeStart = getMalaysiaStartOfDay(now);
  const rangeEndExclusive = addMalaysiaDays(rangeStart, lookaheadDays + 1);

  const { data: sessions, error: sessionError } = await supabase
    .from("sessions")
    .select("id, coach_id, scheduled_start, scheduled_end, status")
    .in("coach_id", activeCoachIds)
    .eq("status", "scheduled")
    .lt("scheduled_start", rangeEndExclusive.toISOString())
    .gt("scheduled_end", rangeStart.toISOString())
    .order("scheduled_start", { ascending: true });

  if (sessionError) {
    throw sessionError;
  }

  const windowsByCoachId = new Map();
  (windows || []).forEach((windowRecord) => {
    if (!activeCoachIds.includes(windowRecord.coach_id)) {
      return;
    }
    if (!windowsByCoachId.has(windowRecord.coach_id)) {
      windowsByCoachId.set(windowRecord.coach_id, []);
    }
    windowsByCoachId.get(windowRecord.coach_id).push(windowRecord);
  });

  const sessionsByCoachId = new Map();
  (sessions || []).forEach((session) => {
    if (!sessionsByCoachId.has(session.coach_id)) {
      sessionsByCoachId.set(session.coach_id, []);
    }
    sessionsByCoachId.get(session.coach_id).push(session);
  });

  return filteredProfiles.reduce((accumulator, profile) => {
    const coachWindows = windowsByCoachId.get(profile.id) || [];
    const coachSessions = sessionsByCoachId.get(profile.id) || [];
    const timezone = coachWindows[0]?.timezone || "Asia/Kuala_Lumpur";
    const updatedAt = coachWindows.reduce((latest, windowRecord) => {
      if (!latest) return windowRecord.updated_at || null;
      return new Date(windowRecord.updated_at || 0).getTime() > new Date(latest || 0).getTime()
        ? windowRecord.updated_at || latest
        : latest;
    }, null);

    accumulator[profile.display_name] = {
      coachId: profile.id,
      timezone,
      updatedAt,
      slots: buildLegacySlots(coachWindows, locale),
      calendar: buildCoachCalendar(coachWindows, coachSessions, {
        lookaheadDays,
        timezone,
        locale,
        now,
      }),
    };
    return accumulator;
  }, {});
}

async function loadPublicCoachAvailabilitySnapshot(supabase, options = {}) {
  const lookaheadDays = Math.max(1, Number(options.lookaheadDays || DEFAULT_LOOKAHEAD_DAYS));
  const locale = options.locale || "en-MY";
  const now = options.now instanceof Date ? options.now : new Date();
  const requestedCoachId = String(options.coachId || "").trim() || null;
  const rawRequestedCoachName = String(options.coachName || "").trim();
  const requestedCoachName = rawRequestedCoachName
    ? (normalizeCoachNameAlias(rawRequestedCoachName) === "kylie dennis" ? "Kylie Dennis" : rawRequestedCoachName)
    : null;
  const rangeStart = getMalaysiaStartOfDay(now);
  const rangeEndExclusive = addMalaysiaDays(rangeStart, lookaheadDays + 1);

  const { data: windows, error: windowError } = await supabase.rpc("list_public_coach_windows", {
    p_coach_id: requestedCoachId,
    p_coach_name: requestedCoachName,
  });
  if (windowError) {
    throw windowError;
  }

  const coachMetaById = new Map();
  (windows || []).forEach((windowRecord) => {
    if (!windowRecord?.coach_id) {
      return;
    }
    coachMetaById.set(windowRecord.coach_id, {
      id: windowRecord.coach_id,
      display_name: windowRecord.display_name || "Coach",
      status: "active",
    });
  });

  const activeCoachIds = Array.from(coachMetaById.keys());
  if (!activeCoachIds.length) {
    return {};
  }

  const { data: sessions, error: sessionError } = await supabase.rpc("list_public_scheduled_sessions", {
    p_coach_id: requestedCoachId,
    p_coach_name: requestedCoachName,
    p_range_start: rangeStart.toISOString(),
    p_range_end: rangeEndExclusive.toISOString(),
  });
  if (sessionError) {
    throw sessionError;
  }

  const windowsByCoachId = new Map();
  (windows || []).forEach((windowRecord) => {
    if (!activeCoachIds.includes(windowRecord.coach_id)) {
      return;
    }
    if (!windowsByCoachId.has(windowRecord.coach_id)) {
      windowsByCoachId.set(windowRecord.coach_id, []);
    }
    windowsByCoachId.get(windowRecord.coach_id).push(windowRecord);
  });

  const sessionsByCoachId = new Map();
  (sessions || []).forEach((session) => {
    if (!sessionsByCoachId.has(session.coach_id)) {
      sessionsByCoachId.set(session.coach_id, []);
    }
    sessionsByCoachId.get(session.coach_id).push({
      id: session.session_id,
      coach_id: session.coach_id,
      scheduled_start: session.scheduled_start,
      scheduled_end: session.scheduled_end,
      status: session.status,
    });
  });

  return activeCoachIds.reduce((accumulator, coachId) => {
    const profile = coachMetaById.get(coachId);
    const coachWindows = windowsByCoachId.get(coachId) || [];
    const coachSessions = sessionsByCoachId.get(coachId) || [];
    const timezone = coachWindows[0]?.timezone || "Asia/Kuala_Lumpur";
    const updatedAt = coachWindows.reduce((latest, windowRecord) => {
      if (!latest) return windowRecord.updated_at || null;
      return new Date(windowRecord.updated_at || 0).getTime() > new Date(latest || 0).getTime()
        ? windowRecord.updated_at || latest
        : latest;
    }, null);

    accumulator[profile.display_name] = {
      coachId: profile.id,
      timezone,
      updatedAt,
      slots: buildLegacySlots(coachWindows, locale),
      calendar: buildCoachCalendar(coachWindows, coachSessions, {
        lookaheadDays,
        timezone,
        locale,
        now,
      }),
    };
    return accumulator;
  }, {});
}

async function hasCoachSessionConflict(supabase, coachId, startIso, endIso, options = {}) {
  if (!coachId || !startIso || !endIso) {
    return false;
  }

  let query = supabase
    .from("sessions")
    .select("id, scheduled_start, scheduled_end")
    .eq("coach_id", coachId)
    .eq("status", "scheduled")
    .lt("scheduled_start", endIso)
    .gt("scheduled_end", startIso)
    .limit(1);

  if (options.excludeSessionId) {
    query = query.neq("id", options.excludeSessionId);
  }

  const { data, error } = await query;
  if (error) {
    throw error;
  }

  return Boolean(data?.length);
}

module.exports = {
  DEFAULT_END_HOUR,
  DEFAULT_LOOKAHEAD_DAYS,
  DEFAULT_START_HOUR,
  DAY_KEYS,
  DAY_LABELS,
  buildCoachCalendar,
  buildLegacySlots,
  dayKeyFromIndex,
  dayLabelFromIndex,
  formatClockLabel,
  getMalaysiaStartOfDay,
  hasCoachSessionConflict,
  loadCoachAvailabilitySnapshot,
  loadPublicCoachAvailabilitySnapshot,
  parseTimeValueToMinutes,
  toDateIso,
  toTimeValue,
};
