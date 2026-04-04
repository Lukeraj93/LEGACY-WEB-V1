const { json, methodNotAllowed, noContent } = require("./_lib/http");
const { ensureSystemProfile, getServiceSupabase, notifySuperAdmins } = require("./_lib/supabase");
const {
  createLeadFromWhatsApp,
  logLeadWhatsAppActivity,
  resolveConversationOwner,
  summarizeMessagePreview,
  touchLeadFromWhatsApp,
  upsertWhatsappMessage,
  upsertWhatsappThread,
} = require("./_lib/whatsapp-store");
const {
  extractMessageBody,
  getWebhookVerifyToken,
  normalizePhone,
  toIsoTimestamp,
  verifyWebhookSignature,
} = require("./_lib/whatsapp");

function getRawBodyBuffer(event) {
  const rawBody = event.body || "";
  if (event.isBase64Encoded) {
    return Buffer.from(rawBody, "base64");
  }

  return Buffer.from(rawBody, "utf8");
}

function parseJsonBuffer(buffer) {
  try {
    return JSON.parse(buffer.toString("utf8") || "{}");
  } catch (_) {
    return null;
  }
}

function cleanText(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/gu, " ");
}

function buildInboundActivityNotes({ contactName, phone, body, messageType, sourceLabel }) {
  return [
    `WhatsApp inbound from ${contactName || "unknown contact"}`,
    phone ? `Phone: ${phone}` : "",
    sourceLabel ? `Source: ${sourceLabel}` : "",
    messageType ? `Type: ${messageType}` : "",
    body ? `Message: ${body}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function buildNotificationTitle(contactName, isExistingClient) {
  if (isExistingClient) {
    return `WhatsApp client message: ${contactName || "Client"}`;
  }

  return `New WhatsApp message: ${contactName || "Lead"}`;
}

function buildNotificationBody(contactName, preview, phone, isExistingClient) {
  const intro = isExistingClient
    ? `${contactName || "A client"} sent a WhatsApp message.`
    : `${contactName || "A WhatsApp contact"} needs follow-up.`;
  const parts = [intro];
  if (phone) {
    parts.push(`Phone: ${phone}.`);
  }
  if (preview) {
    parts.push(`Latest: ${preview}`);
  }
  return parts.join(" ");
}

async function handleInboundMessage({ supabase, systemActorId, value, message, contactName }) {
  const fromPhone = normalizePhone(message?.from);
  if (!fromPhone) {
    return;
  }

  const messageBody = extractMessageBody(message);
  const preview = summarizeMessagePreview(messageBody || message?.type || "WhatsApp message");
  let { lead, client } = await resolveConversationOwner(supabase, fromPhone);

  if (!lead && !client) {
    lead = await createLeadFromWhatsApp(supabase, {
      fullName: contactName || "",
      phone: fromPhone,
      details: buildInboundActivityNotes({
        contactName,
        phone: fromPhone,
        body: messageBody,
        messageType: message?.type,
        sourceLabel: "WhatsApp Cloud API",
      }),
    });
  } else if (lead?.id) {
    await touchLeadFromWhatsApp(supabase, lead.id, "WhatsApp Cloud API");
  }

  const thread = await upsertWhatsappThread(supabase, {
    phone: fromPhone,
    contactName,
    leadId: lead?.id || null,
    clientId: client?.id || null,
    latestPreview: preview,
    latestAt: toIsoTimestamp(message?.timestamp),
    direction: "inbound",
  });

  await upsertWhatsappMessage(supabase, {
    threadId: thread.id,
    leadId: lead?.id || null,
    clientId: client?.id || null,
    waMessageId: message?.id || null,
    direction: "inbound",
    messageType: message?.type || "unknown",
    status: "received",
    fromPhone,
    toPhone: normalizePhone(value?.metadata?.display_phone_number || ""),
    body: messageBody,
    payload: {
      contacts: value?.contacts || [],
      metadata: value?.metadata || {},
      message,
    },
    externalCreatedAt: toIsoTimestamp(message?.timestamp),
  });

  if (lead?.id) {
    await logLeadWhatsAppActivity(supabase, {
      leadId: lead.id,
      actorId: systemActorId,
      activityType: "whatsapp_inbound",
      notes: buildInboundActivityNotes({
        contactName,
        phone: fromPhone,
        body: messageBody,
        messageType: message?.type,
        sourceLabel: "WhatsApp Cloud API",
      }),
    });
  }

  await notifySuperAdmins(supabase, {
    category: "message",
    title: buildNotificationTitle(contactName || lead?.full_name || client?.display_name, Boolean(client?.id)),
    body: buildNotificationBody(contactName || lead?.full_name || client?.display_name, preview, fromPhone, Boolean(client?.id)),
    action_url: "./admin-leads.html",
  }).catch(() => null);
}

async function handleStatusUpdate({ supabase, value, status }) {
  const recipientPhone = normalizePhone(status?.recipient_id);
  if (!recipientPhone) {
    return;
  }

  const thread = await upsertWhatsappThread(supabase, {
    phone: recipientPhone,
    latestPreview: `Status: ${cleanText(status?.status) || "updated"}`,
    latestAt: toIsoTimestamp(status?.timestamp),
    direction: "outbound",
  });

  const normalizedStatus = cleanText(status?.status) || "sent";
  await upsertWhatsappMessage(supabase, {
    threadId: thread?.id,
    leadId: thread?.lead_id || null,
    clientId: thread?.client_id || null,
    waMessageId: status?.id || null,
    direction: "outbound",
    messageType: "status",
    status: normalizedStatus,
    toPhone: recipientPhone,
    payload: {
      metadata: value?.metadata || {},
      status,
    },
    externalCreatedAt: toIsoTimestamp(status?.timestamp),
    deliveredAt: normalizedStatus === "delivered" ? toIsoTimestamp(status?.timestamp) : null,
    readAt: normalizedStatus === "read" ? toIsoTimestamp(status?.timestamp) : null,
    failedAt: normalizedStatus === "failed" ? toIsoTimestamp(status?.timestamp) : null,
    errorMessage: Array.isArray(status?.errors)
      ? status.errors
          .map((item) => cleanText(item?.title || item?.message || item?.error_data?.details))
          .filter(Boolean)
          .join(" | ")
      : "",
  });
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return noContent();
  }

  if (event.httpMethod === "GET") {
    const query = event.queryStringParameters || {};
    const mode = cleanText(query["hub.mode"]);
    const token = cleanText(query["hub.verify_token"]);
    const challenge = String(query["hub.challenge"] || "");

    try {
      const verifyToken = getWebhookVerifyToken();
      if (mode === "subscribe" && token && token === verifyToken && challenge) {
        return {
          statusCode: 200,
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
          },
          body: challenge,
        };
      }
    } catch (_) {
      return json(500, { error: "WhatsApp webhook verification is not configured yet." });
    }

    return json(403, { error: "WhatsApp webhook verification failed." });
  }

  if (event.httpMethod !== "POST") {
    return methodNotAllowed("GET, POST, OPTIONS");
  }

  const rawBody = getRawBodyBuffer(event);
  const signatureHeader = event.headers["x-hub-signature-256"] || event.headers["X-Hub-Signature-256"] || "";

  if (!verifyWebhookSignature(rawBody, signatureHeader)) {
    return json(401, { error: "Invalid WhatsApp webhook signature." });
  }

  const payload = parseJsonBuffer(rawBody);
  if (!payload) {
    return json(400, { error: "WhatsApp webhook body must be valid JSON." });
  }

  const supabase = getServiceSupabase();

  try {
    const systemActorId = await ensureSystemProfile(supabase);
    const entries = Array.isArray(payload.entry) ? payload.entry : [];

    for (const entry of entries) {
      const changes = Array.isArray(entry?.changes) ? entry.changes : [];
      for (const change of changes) {
        const value = change?.value || {};
        const contacts = Array.isArray(value?.contacts) ? value.contacts : [];
        const messages = Array.isArray(value?.messages) ? value.messages : [];
        const statuses = Array.isArray(value?.statuses) ? value.statuses : [];

        for (const message of messages) {
          const waId = normalizePhone(message?.from);
          const matchingContact =
            contacts.find((contact) => normalizePhone(contact?.wa_id) === waId) ||
            contacts[0] ||
            null;
          const contactName = cleanText(matchingContact?.profile?.name);
          await handleInboundMessage({
            supabase,
            systemActorId,
            value,
            message,
            contactName,
          });
        }

        for (const status of statuses) {
          await handleStatusUpdate({
            supabase,
            value,
            status,
          });
        }
      }
    }

    return json(200, { ok: true });
  } catch (error) {
    return json(500, {
      error: error?.message || "Unable to process the WhatsApp webhook.",
    });
  }
};
