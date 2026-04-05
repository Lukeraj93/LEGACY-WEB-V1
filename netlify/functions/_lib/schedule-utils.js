"use strict";

const { parseTimeValueToMinutes } = require("./coach-availability");

const MALAYSIA_LOCALE = "en-MY";
const MALAYSIA_TIMEZONE = "Asia/Kuala_Lumpur";
const DEFAULT_SESSION_DURATION_MINUTES = 60;
const POLICY_WINDOW_HOURS = 24;
const POLICY_WINDOW_MS = POLICY_WINDOW_HOURS * 60 * 60 * 1000;

function normalizeTimeValue(value) {
  const match = String(value || "").trim().match(/^(\d{2}):(\d{2})(?::(\d{2}))?$/u);
  if (!match) {
    return "";
  }

  return `${match[1]}:${match[2]}:${match[3] || "00"}`;
}

function toMalaysiaDateTime(dateValue, timeValue) {
  const normalizedDate = String(dateValue || "").trim();
  const normalizedTime = normalizeTimeValue(timeValue);
  if (!normalizedDate || !normalizedTime) {
    return new Date(Number.NaN);
  }

  return new Date(`${normalizedDate}T${normalizedTime}+08:00`);
}

function malaysiaDayOfWeekFromDateString(dateValue) {
  const normalizedDate = String(dateValue || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(normalizedDate)) {
    return Number.NaN;
  }

  return new Date(`${normalizedDate}T12:00:00Z`).getUTCDay();
}

async function isWithinCoachAvailabilityWindow(
  supabase,
  coachId,
  dateValue,
  startTimeValue,
  durationMinutes = DEFAULT_SESSION_DURATION_MINUTES
) {
  if (!supabase || !coachId) {
    return false;
  }

  const dayOfWeek = malaysiaDayOfWeekFromDateString(dateValue);
  const startMinutes = parseTimeValueToMinutes(startTimeValue);
  const endMinutes = startMinutes + Number(durationMinutes || DEFAULT_SESSION_DURATION_MINUTES);
  if (!Number.isFinite(dayOfWeek) || !Number.isFinite(startMinutes) || !Number.isFinite(endMinutes)) {
    return false;
  }

  const { data, error } = await supabase
    .from("coach_availability_windows")
    .select("start_time, end_time")
    .eq("coach_id", coachId)
    .eq("is_active", true)
    .eq("day_of_week", dayOfWeek);

  if (error) {
    throw error;
  }

  return (data || []).some((windowRecord) => {
    const windowStart = parseTimeValueToMinutes(windowRecord.start_time);
    const windowEnd = parseTimeValueToMinutes(windowRecord.end_time);
    return Number.isFinite(windowStart)
      && Number.isFinite(windowEnd)
      && startMinutes >= windowStart
      && endMinutes <= windowEnd;
  });
}

function formatDateLabel(value) {
  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return String(value || "").trim();
  }

  return new Intl.DateTimeFormat(MALAYSIA_LOCALE, {
    timeZone: MALAYSIA_TIMEZONE,
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

function formatTimeLabel(value) {
  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return String(value || "").trim();
  }

  return new Intl.DateTimeFormat(MALAYSIA_LOCALE, {
    timeZone: MALAYSIA_TIMEZONE,
    hour: "numeric",
    minute: "2-digit",
  }).format(parsed);
}

function formatDateTimeLabel(value) {
  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return String(value || "").trim();
  }

  return new Intl.DateTimeFormat(MALAYSIA_LOCALE, {
    timeZone: MALAYSIA_TIMEZONE,
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(parsed);
}

function formatBookingSlot(dateValue, timeValue, durationMinutes = DEFAULT_SESSION_DURATION_MINUTES) {
  const start = toMalaysiaDateTime(dateValue, timeValue);
  if (Number.isNaN(start.getTime())) {
    return [String(dateValue || "").trim(), String(timeValue || "").trim()].filter(Boolean).join(" ");
  }

  const end = new Date(start.getTime() + Number(durationMinutes || DEFAULT_SESSION_DURATION_MINUTES) * 60 * 1000);
  return `${formatDateLabel(start)} · ${formatTimeLabel(start)} - ${formatTimeLabel(end)}`;
}

function formatSessionSlot(startValue, endValue) {
  const start = startValue instanceof Date ? startValue : new Date(startValue);
  const end = endValue instanceof Date ? endValue : new Date(endValue);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return [String(startValue || "").trim(), String(endValue || "").trim()].filter(Boolean).join(" ");
  }

  return `${formatDateLabel(start)} · ${formatTimeLabel(start)} - ${formatTimeLabel(end)}`;
}

function isInsidePolicyWindow(targetValue, now = new Date()) {
  const target = targetValue instanceof Date ? targetValue : new Date(targetValue);
  if (Number.isNaN(target.getTime())) {
    return false;
  }

  return target.getTime() - now.getTime() < POLICY_WINDOW_MS;
}

function buildPolicyWindowLabel(targetValue, now = new Date()) {
  const target = targetValue instanceof Date ? targetValue : new Date(targetValue);
  if (Number.isNaN(target.getTime())) {
    return "";
  }

  if (target.getTime() <= now.getTime()) {
    return "This request was submitted after the scheduled session start time.";
  }

  if (isInsidePolicyWindow(target, now)) {
    return "This request was submitted inside the 24-hour cancellation and reschedule window.";
  }

  return "This request was submitted outside the 24-hour cancellation and reschedule window.";
}

module.exports = {
  DEFAULT_SESSION_DURATION_MINUTES,
  MALAYSIA_LOCALE,
  MALAYSIA_TIMEZONE,
  POLICY_WINDOW_HOURS,
  POLICY_WINDOW_MS,
  buildPolicyWindowLabel,
  formatBookingSlot,
  formatDateLabel,
  formatDateTimeLabel,
  formatSessionSlot,
  formatTimeLabel,
  isInsidePolicyWindow,
  isWithinCoachAvailabilityWindow,
  malaysiaDayOfWeekFromDateString,
  normalizeTimeValue,
  toMalaysiaDateTime,
};
