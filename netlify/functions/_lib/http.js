const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
};

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

module.exports = {
  json,
  noContent,
  methodNotAllowed,
};
