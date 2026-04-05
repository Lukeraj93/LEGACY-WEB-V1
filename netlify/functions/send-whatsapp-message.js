const { errorResponse, json, methodNotAllowed, noContent, parseJsonBody } = require("./_lib/http");
const { assertRateLimit, buildRateLimitKey, getRequestIp } = require("./_lib/rate-limit");
const { getAuthenticatedProfile, getServiceSupabase } = require("./_lib/supabase");
const {
  findClientById,
  findLeadById,
  logLeadWhatsAppActivity,
  summarizeMessagePreview,
  upsertWhatsappMessage,
  upsertWhatsappThread,
} = require("./_lib/whatsapp-store");
const { normalizePhone, sendTextMessage } = require("./_lib/whatsapp");
const { cleanText, parseOptionalText, parseRequiredText } = require("./_lib/validation");

const whatsappSendThrottle = new Map();

function buildOutboundBody(subject, message) {
  const title = cleanText(subject);
  const body = cleanText(message);
  if (!title) {
    return body;
  }

  return [title, "", body].join("\n");
}

function buildLeadActivityNotes(subject, message) {
  return [cleanText(subject) ? `Subject: ${cleanText(subject)}` : "", cleanText(message)]
    .filter(Boolean)
    .join("\n\n");
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return noContent();
  }

  if (event.httpMethod !== "POST") {
    return methodNotAllowed("POST, OPTIONS");
  }

  try {
    const body = parseJsonBody(event, {
      maxBytes: 16 * 1024,
    });
    const supabase = getServiceSupabase();
    const authenticated = await getAuthenticatedProfile(event, supabase);
    if (!authenticated?.user || !authenticated?.profile) {
      return json(401, { error: "A signed-in user is required." });
    }

    if (authenticated.profile.role !== "super_admin") {
      return json(403, { error: "Only super admins can send WhatsApp messages from this workspace." });
    }

    const leadId = parseOptionalText(body.leadId, {
      label: "Lead ID",
      maxLength: 80,
    });
    const clientId = parseOptionalText(body.clientId, {
      label: "Client ID",
      maxLength: 80,
    });
    const subject = parseOptionalText(body.subject, {
      label: "Subject",
      maxLength: 160,
    });
    const message = parseRequiredText(body.message, {
      label: "WhatsApp message",
      minLength: 1,
      maxLength: 2000,
    });
    const directPhone = normalizePhone(body.phone);

    const [lead, client] = await Promise.all([
      leadId ? findLeadById(supabase, leadId) : null,
      clientId ? findClientById(supabase, clientId) : null,
    ]);

    const recipientPhone = normalizePhone(directPhone || lead?.phone || client?.phone || "");
    if (!recipientPhone) {
      return json(400, { error: "The selected record does not have a valid WhatsApp phone number." });
    }

    assertRateLimit({
      store: whatsappSendThrottle,
      key: buildRateLimitKey("send-whatsapp", authenticated.profile.id, getRequestIp(event), recipientPhone),
      limit: 5,
      windowMs: 60 * 1000,
      message: "Too many WhatsApp sends were attempted too quickly. Please wait a moment and try again.",
    });

    const outboundBody = buildOutboundBody(subject, message);
    const responsePayload = await sendTextMessage({
      to: recipientPhone,
      body: outboundBody,
    });

    const waMessageId = responsePayload?.messages?.[0]?.id || null;
    const thread = await upsertWhatsappThread(supabase, {
      phone: recipientPhone,
      contactName: lead?.full_name || client?.display_name || "",
      leadId: lead?.id || null,
      clientId: client?.id || null,
      assignedAdminId: authenticated.user.id,
      latestPreview: summarizeMessagePreview(outboundBody),
      latestAt: new Date().toISOString(),
      direction: "outbound",
    });

    await upsertWhatsappMessage(supabase, {
      threadId: thread.id,
      leadId: lead?.id || null,
      clientId: client?.id || null,
      waMessageId,
      direction: "outbound",
      messageType: "text",
      status: "accepted",
      toPhone: recipientPhone,
      body: outboundBody,
      payload: responsePayload,
      sentBy: authenticated.user.id,
      externalCreatedAt: new Date().toISOString(),
    });

    if (lead?.id) {
      await logLeadWhatsAppActivity(supabase, {
        leadId: lead.id,
        actorId: authenticated.user.id,
        activityType: "whatsapp_outbound",
        notes: buildLeadActivityNotes(subject, message),
      });
    }

    return json(200, {
      ok: true,
      messageId: waMessageId,
      threadId: thread.id,
      phone: recipientPhone,
    });
  } catch (error) {
    return errorResponse(error, "Unable to send the WhatsApp message right now.");
  }
};
