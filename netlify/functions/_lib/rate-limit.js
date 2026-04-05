const { createHttpError } = require("./http");

function getRequestIp(event) {
  const forwarded = String(
    event?.headers?.["x-forwarded-for"]
      || event?.headers?.["X-Forwarded-For"]
      || event?.headers?.["x-nf-client-connection-ip"]
      || event?.headers?.["X-Nf-Client-Connection-Ip"]
      || ""
  ).trim();

  if (!forwarded) {
    return "unknown";
  }

  return forwarded
    .split(",")
    .map((value) => value.trim())
    .find(Boolean) || "unknown";
}

function buildRateLimitKey(...parts) {
  return parts
    .map((value) => String(value || "").trim().toLowerCase())
    .filter(Boolean)
    .join("::");
}

function pruneEntries(timestamps, now, windowMs) {
  return timestamps.filter((value) => now - Number(value || 0) < windowMs);
}

function assertRateLimit({
  store,
  key,
  limit,
  windowMs,
  message = "Too many requests. Please slow down and try again shortly.",
}) {
  if (!store || !key || !Number.isFinite(limit) || !Number.isFinite(windowMs)) {
    return;
  }

  const now = Date.now();
  const history = pruneEntries(store.get(key) || [], now, windowMs);

  if (history.length >= limit) {
    const retryAfterMs = Math.max(1000, windowMs - (now - Number(history[0] || now)));
    throw createHttpError(429, message, {
      retryAfter: retryAfterMs / 1000,
    });
  }

  history.push(now);
  store.set(key, history);
}

module.exports = {
  assertRateLimit,
  buildRateLimitKey,
  getRequestIp,
};
