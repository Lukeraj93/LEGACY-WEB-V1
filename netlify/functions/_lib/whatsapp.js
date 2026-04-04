const crypto = require("crypto");
const { requireEnv } = require("./env");

function cleanText(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/gu, " ");
}

function trimMessageBody(value) {
  return String(value || "").trim();
}

function normalizePhone(value) {
  const raw = cleanText(value);
  if (!raw) {
    return "";
  }

  const digits = raw.replace(/[^\d+]/gu, "").replace(/(?!^)\+/gu, "");
  if (!digits) {
    return "";
  }

  return digits.startsWith("+") ? digits : `+${digits}`;
}

function buildPhoneCandidates(value) {
  const normalized = normalizePhone(value);
  if (!normalized) {
    return [];
  }

  return Array.from(
    new Set([
      normalized,
      normalized.replace(/^\+/u, ""),
    ].filter(Boolean))
  );
}

function toRecipientPhone(value) {
  return String(normalizePhone(value)).replace(/[^\d]/gu, "");
}

function getGraphApiVersion() {
  return cleanText(process.env.WHATSAPP_GRAPH_API_VERSION || process.env.GRAPH_API_VERSION) || "v23.0";
}

function getWebhookVerifyToken() {
  return requireEnv("WHATSAPP_VERIFY_TOKEN");
}

function getWhatsAppPhoneNumberId() {
  return requireEnv("WHATSAPP_PHONE_NUMBER_ID");
}

function getWhatsAppAccessToken() {
  return requireEnv("WHATSAPP_ACCESS_TOKEN");
}

function getWhatsAppConfig() {
  return {
    graphApiVersion: getGraphApiVersion(),
    phoneNumberId: getWhatsAppPhoneNumberId(),
    accessToken: getWhatsAppAccessToken(),
    verifyToken: getWebhookVerifyToken(),
    appSecret: cleanText(process.env.WHATSAPP_APP_SECRET),
    wabaId: cleanText(process.env.WHATSAPP_WABA_ID),
  };
}

function verifyWebhookSignature(rawBody, signatureHeader) {
  const appSecret = cleanText(process.env.WHATSAPP_APP_SECRET);
  if (!appSecret) {
    return true;
  }

  const provided = cleanText(signatureHeader);
  if (!provided.startsWith("sha256=")) {
    return false;
  }

  const bodyBuffer = Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(String(rawBody || ""), "utf8");
  const expected = `sha256=${crypto.createHmac("sha256", appSecret).update(bodyBuffer).digest("hex")}`;
  const expectedBuffer = Buffer.from(expected, "utf8");
  const providedBuffer = Buffer.from(provided, "utf8");

  if (expectedBuffer.length !== providedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, providedBuffer);
}

async function graphApiRequest(path, payload) {
  const { graphApiVersion, accessToken } = getWhatsAppConfig();
  const normalizedPath = String(path || "").replace(/^\/+/u, "");
  const response = await fetch(`https://graph.facebook.com/${graphApiVersion}/${normalizedPath}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload || {}),
  });

  const responseText = await response.text();
  let parsed = {};
  try {
    parsed = responseText ? JSON.parse(responseText) : {};
  } catch (_) {
    parsed = { raw: responseText };
  }

  if (!response.ok) {
    const message =
      parsed?.error?.message ||
      parsed?.message ||
      `WhatsApp Cloud API returned HTTP ${response.status}.`;
    const error = new Error(message);
    error.statusCode = response.status;
    error.payload = parsed;
    throw error;
  }

  return parsed;
}

async function sendTextMessage({ to, body, previewUrl = false } = {}) {
  const recipient = toRecipientPhone(to);
  const messageBody = trimMessageBody(body);
  if (!recipient) {
    throw new Error("A valid WhatsApp recipient phone number is required.");
  }

  if (!messageBody) {
    throw new Error("A WhatsApp message body is required.");
  }

  const { phoneNumberId } = getWhatsAppConfig();
  return graphApiRequest(`${phoneNumberId}/messages`, {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: recipient,
    type: "text",
    text: {
      preview_url: Boolean(previewUrl),
      body: messageBody,
    },
  });
}

function extractMessageBody(message) {
  if (!message || typeof message !== "object") {
    return "";
  }

  if (typeof message.text?.body === "string") {
    return cleanText(message.text.body);
  }

  if (typeof message.button?.text === "string") {
    return cleanText(message.button.text);
  }

  if (typeof message.interactive?.button_reply?.title === "string") {
    return cleanText(message.interactive.button_reply.title);
  }

  if (typeof message.interactive?.list_reply?.title === "string") {
    return cleanText(message.interactive.list_reply.title);
  }

  if (typeof message.image?.caption === "string") {
    return cleanText(message.image.caption);
  }

  if (typeof message.document?.caption === "string") {
    return cleanText(message.document.caption);
  }

  if (typeof message.reaction?.emoji === "string") {
    return cleanText(`Reaction: ${message.reaction.emoji}`);
  }

  return cleanText(message.type || "whatsapp message");
}

function toIsoTimestamp(unixSeconds) {
  const numeric = Number(unixSeconds || 0);
  if (!numeric) {
    return new Date().toISOString();
  }

  return new Date(numeric * 1000).toISOString();
}

module.exports = {
  buildPhoneCandidates,
  extractMessageBody,
  getGraphApiVersion,
  getWhatsAppConfig,
  getWebhookVerifyToken,
  normalizePhone,
  sendTextMessage,
  toIsoTimestamp,
  trimMessageBody,
  verifyWebhookSignature,
};
