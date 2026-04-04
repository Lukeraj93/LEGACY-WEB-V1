const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
};

function createHttpError(statusCode, message, options = {}) {
  const error = new Error(message || "Request failed.");
  error.statusCode = Number.isFinite(Number(statusCode)) ? Number(statusCode) : 500;
  error.expose = options.expose !== undefined ? Boolean(options.expose) : error.statusCode < 500;
  if (options.retryAfter) {
    error.retryAfter = Number(options.retryAfter);
  }
  if (options.details !== undefined) {
    error.details = options.details;
  }
  return error;
}

function buildHeaders(extraHeaders = {}) {
  return {
    ...JSON_HEADERS,
    ...extraHeaders,
  };
}

function json(statusCode, payload, extraHeaders = {}) {
  return {
    statusCode,
    headers: buildHeaders(extraHeaders),
    body: JSON.stringify(payload),
  };
}

function noContent(extraHeaders = {}) {
  return {
    statusCode: 204,
    headers: buildHeaders(extraHeaders),
    body: "",
  };
}

function methodNotAllowed(allowed) {
  return json(405, { error: "Method not allowed." }, { Allow: allowed });
}

function parseJsonBody(event, options = {}) {
  const {
    maxBytes = 64 * 1024,
    requireObject = true,
    emptyFallback = "{}",
  } = options;
  const rawBody = typeof event?.body === "string" ? event.body : emptyFallback;

  if (Buffer.byteLength(rawBody, "utf8") > maxBytes) {
    throw createHttpError(413, "Request body is too large.");
  }

  let parsed;
  try {
    parsed = JSON.parse(rawBody || emptyFallback);
  } catch (_) {
    throw createHttpError(400, "Request body must be valid JSON.");
  }

  if (requireObject && (!parsed || Array.isArray(parsed) || typeof parsed !== "object")) {
    throw createHttpError(400, "Request body must be a JSON object.");
  }

  return parsed;
}

function sanitizeErrorMessage(error, fallbackMessage) {
  const fallback = String(fallbackMessage || "Something went wrong.").trim() || "Something went wrong.";
  const candidate = typeof error?.message === "string" ? error.message.trim() : "";
  const statusCode = Number(error?.statusCode || 500);

  if (candidate && (error?.expose === true || (statusCode >= 400 && statusCode < 500))) {
    return candidate;
  }

  return fallback;
}

function errorResponse(error, fallbackMessage, extraHeaders = {}) {
  const statusCode = Number.isFinite(Number(error?.statusCode)) ? Number(error.statusCode) : 500;
  const headers = { ...extraHeaders };
  if (error?.retryAfter) {
    headers["Retry-After"] = String(Math.max(1, Math.ceil(Number(error.retryAfter))));
  }
  return json(statusCode, { error: sanitizeErrorMessage(error, fallbackMessage) }, headers);
}

module.exports = {
  createHttpError,
  errorResponse,
  json,
  parseJsonBody,
  noContent,
  methodNotAllowed,
  sanitizeErrorMessage,
};
