const {
  NEWSLETTER_DISPATCH_ENTITY_TYPE,
  verifyNewsletterTrackingToken,
} = require("./_lib/newsletter");
const { getServiceSupabase } = require("./_lib/supabase");

function queryValue(event, key) {
  return String(event?.queryStringParameters?.[key] || "").trim();
}

function normalizeRedirectTarget(value) {
  const raw = String(value || "").trim();
  if (!raw) {
    return "";
  }

  try {
    const parsed = new URL(raw);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return "";
    }
    return parsed.toString();
  } catch (_) {
    return "";
  }
}

exports.handler = async (event) => {
  if (!["GET", "HEAD"].includes(event.httpMethod)) {
    return {
      statusCode: 405,
      headers: {
        Allow: "GET, HEAD",
      },
      body: "",
    };
  }

  const dispatchId = queryValue(event, "dispatch");
  const recipientKey = queryValue(event, "recipient");
  const destination = normalizeRedirectTarget(queryValue(event, "target"));
  const token = queryValue(event, "token");

  if (
    !dispatchId
    || !recipientKey
    || !destination
    || !verifyNewsletterTrackingToken("click", dispatchId, recipientKey, destination, token)
  ) {
    return {
      statusCode: 400,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store, max-age=0",
      },
      body: "Invalid newsletter tracking link.",
    };
  }

  try {
    const supabase = getServiceSupabase();
    await supabase.from("audit_logs").insert({
      actor_id: null,
      entity_type: NEWSLETTER_DISPATCH_ENTITY_TYPE,
      entity_id: dispatchId,
      action: "click",
      details: {
        recipientKey,
        destination,
        userAgent: String(event?.headers?.["user-agent"] || event?.headers?.["User-Agent"] || "").slice(0, 300),
      },
    });
  } catch (_) {
    // Never block the redirect because analytics storage failed.
  }

  return {
    statusCode: 302,
    headers: {
      Location: destination,
      "Cache-Control": "no-store, max-age=0",
    },
    body: "",
  };
};
