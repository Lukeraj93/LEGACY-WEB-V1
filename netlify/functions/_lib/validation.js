"use strict";

function cleanText(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/gu, " ");
}

function validationError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function hasValue(value) {
  return cleanText(value).length > 0;
}

function normalizeEmail(value) {
  return cleanText(value).toLowerCase();
}

function parseEmail(value, options = {}) {
  const { label = "Email address", required = false } = options;
  const email = normalizeEmail(value);
  if (!email) {
    if (required) {
      throw validationError(`${label} is required.`);
    }
    return "";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(email)) {
    throw validationError(`${label} must be a valid email address.`);
  }
  return email;
}

function normalizePhone(value) {
  return cleanText(value).replace(/[^\d+]/gu, "");
}

function parsePhone(value, options = {}) {
  const { label = "Phone number", required = false, minDigits = 8, maxDigits = 15 } = options;
  const phone = normalizePhone(value);
  const digitsOnly = phone.replace(/[^\d]/gu, "");
  if (!digitsOnly) {
    if (required) {
      throw validationError(`${label} is required.`);
    }
    return "";
  }
  if (digitsOnly.length < minDigits || digitsOnly.length > maxDigits) {
    throw validationError(`${label} must contain between ${minDigits} and ${maxDigits} digits.`);
  }
  return phone;
}

function toNullableText(value) {
  const normalized = cleanText(value);
  return normalized || null;
}

function parseRequiredText(value, options = {}) {
  const { label = "Field", minLength = 1, maxLength = 500 } = options;
  const normalized = cleanText(value);
  if (!normalized) {
    throw validationError(`${label} is required.`);
  }
  if (normalized.length < minLength) {
    throw validationError(`${label} must be at least ${minLength} characters.`);
  }
  if (normalized.length > maxLength) {
    throw validationError(`${label} must be ${maxLength} characters or fewer.`);
  }
  return normalized;
}

function parseOptionalText(value, options = {}) {
  const { label = "Field", maxLength = 500 } = options;
  const normalized = cleanText(value);
  if (!normalized) {
    return "";
  }
  if (normalized.length > maxLength) {
    throw validationError(`${label} must be ${maxLength} characters or fewer.`);
  }
  return normalized;
}

function parseEnum(value, allowedValues, options = {}) {
  const { label = "Field", required = false } = options;
  const normalized = cleanText(value).toLowerCase();
  if (!normalized) {
    if (required) {
      throw validationError(`${label} is required.`);
    }
    return "";
  }
  if (!allowedValues.includes(normalized)) {
    throw validationError(`${label} is invalid.`);
  }
  return normalized;
}

function asDateString(value, options = {}) {
  const { label = "Date", required = false, mustBePastOrToday = false } = options;
  const normalized = cleanText(value);
  if (!normalized) {
    if (required) {
      throw validationError(`${label} is required.`);
    }
    return null;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(normalized)) {
    throw validationError(`${label} must use YYYY-MM-DD format.`);
  }
  const parsed = new Date(`${normalized}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) {
    throw validationError(`${label} is invalid.`);
  }
  if (mustBePastOrToday) {
    const today = new Date();
    const todayUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
    if (parsed.getTime() > todayUtc) {
      throw validationError(`${label} cannot be in the future.`);
    }
  }
  return normalized;
}

function parseIsoDateTime(value, options = {}) {
  const { label = "Date and time", required = false } = options;
  const normalized = cleanText(value);
  if (!normalized) {
    if (required) {
      throw validationError(`${label} is required.`);
    }
    return "";
  }
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) {
    throw validationError(`${label} is invalid.`);
  }
  return parsed.toISOString();
}

function parsePositiveInteger(value, options = {}) {
  const { label = "Value", required = false, min = 0, max = Number.MAX_SAFE_INTEGER } = options;
  const normalized = cleanText(value);
  if (!normalized) {
    if (required) {
      throw validationError(`${label} is required.`);
    }
    return null;
  }
  if (!/^\d+$/u.test(normalized)) {
    throw validationError(`${label} must be a whole number.`);
  }
  const numeric = Number.parseInt(normalized, 10);
  if (numeric < min || numeric > max) {
    throw validationError(`${label} must be between ${min} and ${max}.`);
  }
  return numeric;
}

function parseActivationCode(value) {
  const code = cleanText(value).toUpperCase();
  if (!code) {
    throw validationError("Activation code is required.");
  }
  if (!/^[A-Z2-9]{4}-[A-Z2-9]{4}$/u.test(code)) {
    throw validationError("Activation code format is invalid.");
  }
  return code;
}

function assertPasswordPair(password, confirmPassword) {
  const left = String(password || "");
  const right = String(confirmPassword || "");
  if (!left || !right) {
    throw validationError("Password and password confirmation are required.");
  }
  if (left !== right) {
    throw validationError("Password confirmation does not match.");
  }
  if (left.length < 8) {
    throw validationError("Password must be at least 8 characters long.");
  }
  if (left.length > 72) {
    throw validationError("Password must be 72 characters or fewer.");
  }
  return left;
}

function parseTextArray(value, options = {}) {
  const { label = "Values", maxItems = 20, maxItemLength = 80 } = options;
  if (!Array.isArray(value)) {
    return [];
  }
  const normalized = value
    .map((item) => cleanText(item))
    .filter(Boolean);
  if (normalized.length > maxItems) {
    throw validationError(`${label} cannot contain more than ${maxItems} items.`);
  }
  normalized.forEach((item) => {
    if (item.length > maxItemLength) {
      throw validationError(`${label} entries must be ${maxItemLength} characters or fewer.`);
    }
  });
  return normalized;
}

module.exports = {
  asDateString,
  assertPasswordPair,
  cleanText,
  hasValue,
  normalizeEmail,
  normalizePhone,
  parseActivationCode,
  parseEmail,
  parseEnum,
  parseIsoDateTime,
  parseOptionalText,
  parsePhone,
  parsePositiveInteger,
  parseRequiredText,
  parseTextArray,
  toNullableText,
  validationError,
};
