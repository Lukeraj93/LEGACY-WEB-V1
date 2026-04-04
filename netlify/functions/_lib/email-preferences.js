"use strict";

const crypto = require("node:crypto");
const { getBaseUrl, requireEnv } = require("./env");

const EMAIL_PREFERENCE_KEY_PREFIX = "email-preferences:";
const EMAIL_PREFERENCE_MODES = new Set([
  "all",
  "essential_only",
  "pause_optional",
]);

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function preferenceKeyForEmail(email) {
  return `${EMAIL_PREFERENCE_KEY_PREFIX}${normalizeEmail(email)}`;
}

function getEmailPreferencesSecret() {
  return String(process.env.EMAIL_PREFERENCES_SECRET || requireEnv("SUPABASE_SERVICE_ROLE_KEY")).trim();
}

function signEmailPreferencesToken(email) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    return "";
  }

  return crypto
    .createHmac("sha256", getEmailPreferencesSecret())
    .update(`legacy-email-preferences:${normalizedEmail}`)
    .digest("hex");
}

function verifyEmailPreferencesToken(email, token) {
  const normalizedEmail = normalizeEmail(email);
  const normalizedToken = String(token || "").trim();

  if (!normalizedEmail || !normalizedToken) {
    return false;
  }

  const expected = signEmailPreferencesToken(normalizedEmail);
  if (!expected || expected.length !== normalizedToken.length) {
    return false;
  }

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, "utf8"),
      Buffer.from(normalizedToken, "utf8")
    );
  } catch (_) {
    return false;
  }
}

function buildEmailPreferencesUrl(email) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    return "";
  }

  const baseUrl = getBaseUrl() || "https://app.legacycoaching.com.my";
  const url = new URL("/email-preferences.html", `${baseUrl.replace(/\/+$/u, "")}/`);
  url.searchParams.set("email", normalizedEmail);
  url.searchParams.set("token", signEmailPreferencesToken(normalizedEmail));
  return url.toString();
}

function normalizeEmailPreferenceMode(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (!EMAIL_PREFERENCE_MODES.has(normalized)) {
    return "all";
  }
  return normalized;
}

function buildDefaultEmailPreferences() {
  return {
    mode: "all",
    updatedAt: null,
  };
}

function isNonEssentialEmail(tags = []) {
  const tagEntries = Array.isArray(tags) ? tags : [];
  const category = tagEntries.find((tag) => tag?.name === "category")?.value || "";
  const event = tagEntries.find((tag) => tag?.name === "event")?.value || "";
  const normalizedCategory = String(category).trim().toLowerCase();
  const normalizedEvent = String(event).trim().toLowerCase();

  if (normalizedCategory === "preview") {
    return false;
  }

  return normalizedCategory === "marketing"
    || normalizedCategory === "campaign"
    || normalizedEvent.includes("marketing")
    || normalizedEvent.includes("newsletter")
    || normalizedEvent.includes("campaign");
}

module.exports = {
  buildDefaultEmailPreferences,
  buildEmailPreferencesUrl,
  isNonEssentialEmail,
  normalizeEmail,
  normalizeEmailPreferenceMode,
  preferenceKeyForEmail,
  signEmailPreferencesToken,
  verifyEmailPreferencesToken,
};
