const {
  NEWSLETTER_DISPATCH_ENTITY_TYPE,
  verifyNewsletterTrackingToken,
} = require("./_lib/newsletter");
const { getServiceSupabase } = require("./_lib/supabase");

const TRANSPARENT_GIF = Buffer.from(
  "R0lGODlhAQABAPAAAAAAAAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==",
  "base64"
);

function queryValue(event, key) {
  return String(event?.queryStringParameters?.[key] || "").trim();
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
  const token = queryValue(event, "token");

  if (
    dispatchId
    && recipientKey
    && verifyNewsletterTrackingToken("open", dispatchId, recipientKey, "", token)
  ) {
    try {
      const supabase = getServiceSupabase();
      await supabase.from("audit_logs").insert({
        actor_id: null,
        entity_type: NEWSLETTER_DISPATCH_ENTITY_TYPE,
        entity_id: dispatchId,
        action: "open",
        details: {
          recipientKey,
          userAgent: String(event?.headers?.["user-agent"] || event?.headers?.["User-Agent"] || "").slice(0, 300),
        },
      });
    } catch (_) {
      // Tracking should never break the email render path.
    }
  }

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store, max-age=0",
      "Content-Length": String(TRANSPARENT_GIF.length),
    },
    body: TRANSPARENT_GIF.toString("base64"),
    isBase64Encoded: true,
  };
};
