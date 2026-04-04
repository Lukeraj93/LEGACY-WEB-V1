const { json, methodNotAllowed, noContent } = require("./_lib/http");
const { sendNoticeEmail } = require("./_lib/email");
const { requireEnv } = require("./_lib/env");
const { ensureSystemProfile, getServiceSupabase, getSuperAdminEmailRecipients, notifySuperAdmins } = require("./_lib/supabase");

function parseBody(event) {
  try {
    return JSON.parse(event.body || "{}");
  } catch (_) {
    return null;
  }
}

function cleanText(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/gu, " ");
}

function normalizeEmail(value) {
  const email = cleanText(value).toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(email) ? email : "";
}

function normalizePhone(value) {
  const digits = String(value || "").replace(/[^\d+]/gu, "");
  return digits.replace(/(?!^)\+/gu, "");
}

function isTruthyFlag(value) {
  if (typeof value === "boolean") {
    return value;
  }

  const normalized = cleanText(value).toLowerCase();
  return ["1", "true", "yes", "y", "completed", "done", "ready", "qualified"].includes(normalized);
}

function validateRequest(event) {
  const authHeader = String(event.headers.authorization || event.headers.Authorization || "").trim();
  const tokenHeader = String(event.headers["x-manychat-token"] || event.headers["X-Manychat-Token"] || "").trim();
  const expectedToken = requireEnv("MANYCHAT_SYNC_TOKEN");

  if (authHeader === `Bearer ${expectedToken}` || tokenHeader === expectedToken) {
    return true;
  }

  return false;
}

function buildLeadNotes(payload) {
  const lines = [
    payload.channel ? `Channel: ${payload.channel}` : "",
    payload.manychatContactId ? `ManyChat Contact ID: ${payload.manychatContactId}` : "",
    payload.flowName ? `ManyChat Flow: ${payload.flowName}` : "",
    payload.chatUrl ? `ManyChat Chat URL: ${payload.chatUrl}` : "",
    payload.service ? `Service Interest: ${payload.service}` : "",
    payload.goal ? `Primary Goal: ${payload.goal}` : "",
    payload.preferredCoach ? `Preferred Coach: ${payload.preferredCoach}` : "",
    payload.schedule ? `Preferred Schedule: ${payload.schedule}` : "",
    payload.lastMessageText ? `Latest Message: ${payload.lastMessageText}` : "",
    payload.tags ? `Tags: ${payload.tags}` : "",
    payload.details ? `Details: ${payload.details}` : "",
  ].filter(Boolean);

  return lines.join("\n");
}

function buildNotificationBody(fullName, detail) {
  return [fullName || "A WhatsApp lead", detail].filter(Boolean).join(" ");
}

function nextFollowUpAt() {
  return new Date(Date.now() + (24 * 60 * 60 * 1000)).toISOString();
}

async function findExistingLead(supabase, email, phone) {
  if (email) {
    const emailQuery = await supabase
      .from("leads")
      .select("id, full_name, notes")
      .eq("email", email)
      .in("status", ["new", "contacted", "qualified"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (emailQuery.error) {
      throw emailQuery.error;
    }

    if (emailQuery.data?.id) {
      return emailQuery.data;
    }
  }

  if (phone) {
    const phoneQuery = await supabase
      .from("leads")
      .select("id, full_name, notes")
      .eq("phone", phone)
      .in("status", ["new", "contacted", "qualified"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (phoneQuery.error) {
      throw phoneQuery.error;
    }

    if (phoneQuery.data?.id) {
      return phoneQuery.data;
    }
  }

  return null;
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return noContent();
  }

  if (event.httpMethod !== "POST") {
    return methodNotAllowed("POST, OPTIONS");
  }

  if (!validateRequest(event)) {
    return json(401, { error: "Invalid ManyChat sync token." });
  }

  const body = parseBody(event);
  if (!body) {
    return json(400, { error: "Request body must be valid JSON." });
  }

  const formCompleted =
    isTruthyFlag(body.form_completed) ||
    isTruthyFlag(body.formCompleted) ||
    isTruthyFlag(body.enquiry_submitted) ||
    isTruthyFlag(body.enquirySubmitted) ||
    isTruthyFlag(body.sync_to_crm) ||
    isTruthyFlag(body.syncToCrm) ||
    cleanText(body.lead_stage || body.leadStage || body.capture_stage || body.captureStage).toLowerCase() ===
      "completed";

  if (!formCompleted) {
    return json(200, {
      ok: true,
      skipped: true,
      reason: "ManyChat lead sync ignored because the enquiry form is not complete yet.",
    });
  }

  const firstName = cleanText(body.first_name || body.firstName);
  const lastName = cleanText(body.last_name || body.lastName);
  const fullName =
    cleanText(body.fullName || body.name || body.full_name) ||
    cleanText([firstName, lastName].filter(Boolean).join(" "));
  const email = normalizeEmail(body.email || body.contact_email || body.user_email);
  const phone = normalizePhone(body.phone || body.phone_number || body.whatsapp_phone || body.contact_phone);

  if (!fullName) {
    return json(400, { error: "A lead name is required." });
  }

  if (!email && !phone) {
    return json(400, { error: "ManyChat must send at least an email or phone number." });
  }

  const source = cleanText(body.source) || "ManyChat WhatsApp";
  const channel = cleanText(body.channel) || "manychat_whatsapp";
  const manychatContactId = cleanText(body.manychat_contact_id || body.contact_id || body.subscriber_id);
  const flowName = cleanText(body.flow_name || body.current_flow || body.automation_name);
  const chatUrl = cleanText(body.chat_url || body.inbox_chat_url || body.conversation_url);
  const service = cleanText(body.service || body.service_interest || body.package_interest);
  const goal = cleanText(body.goal || body.primary_goal);
  const preferredCoach = cleanText(body.preferred_coach || body.coach);
  const schedule = cleanText(body.schedule || body.preferred_schedule);
  const tags = Array.isArray(body.tags) ? body.tags.map(cleanText).filter(Boolean).join(", ") : cleanText(body.tags);
  const lastMessageText = cleanText(body.last_message_text || body.message_text || body.last_input_text);
  const details = cleanText(body.details || body.notes);

  const supabase = getServiceSupabase();

  try {
    const systemActorId = await ensureSystemProfile(supabase);
    const noteBody = buildLeadNotes({
      channel,
      manychatContactId,
      flowName,
      chatUrl,
      service,
      goal,
      preferredCoach,
      schedule,
      lastMessageText,
      tags,
      details,
    });

    const existingLead = await findExistingLead(supabase, email, phone);
    if (existingLead?.id) {
      const nextNotes = [existingLead.notes || "", "", `[${new Date().toISOString()}] ${noteBody}`]
        .filter(Boolean)
        .join("\n");

      const { error: updateError } = await supabase
        .from("leads")
        .update({
          source,
          notes: nextNotes,
          next_follow_up_at: nextFollowUpAt(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingLead.id);

      if (updateError) {
        throw updateError;
      }

      const { error: activityError } = await supabase.from("lead_activities").insert({
        lead_id: existingLead.id,
        actor_id: systemActorId,
        activity_type: "whatsapp_inbound",
        notes: noteBody || "Inbound WhatsApp message received from ManyChat.",
      });

      if (activityError) {
        throw activityError;
      }

      await notifySuperAdmins(supabase, {
        category: "lead",
        title: "WhatsApp Lead Updated",
        body: buildNotificationBody(existingLead.full_name || fullName, "sent a new WhatsApp message."),
        action_url: "./admin-leads.html",
      });

      const adminEmails = await getSuperAdminEmailRecipients(supabase).catch(() => []);
      await sendNoticeEmail({
        to: adminEmails,
        subject: "WhatsApp lead updated",
        eyebrow: "Lead Alert",
        title: "A WhatsApp lead sent another message",
        intro: `${existingLead.full_name || fullName} sent a new WhatsApp update through ManyChat.`,
        metaRows: [
          { label: "Lead", value: existingLead.full_name || fullName },
          { label: "Source", value: source },
          { label: "Flow", value: flowName || "ManyChat" },
        ],
        ctaLabel: "Open Leads",
        ctaUrl: "./admin-leads.html",
        tags: [
          { name: "category", value: "lead" },
          { name: "event", value: "whatsapp_lead_updated" },
        ],
      }).catch(() => null);

      return json(200, {
        ok: true,
        leadId: existingLead.id,
        existing: true,
      });
    }

    const { data: insertedLead, error: leadError } = await supabase
      .from("leads")
      .insert({
        full_name: fullName,
        email: email || null,
        phone: phone || null,
        source,
        status: "new",
        owner_id: null,
        next_follow_up_at: nextFollowUpAt(),
        notes: noteBody || null,
      })
      .select("id, full_name")
      .single();

    if (leadError || !insertedLead?.id) {
      throw leadError || new Error("Unable to create the ManyChat lead.");
    }

    const { error: activityError } = await supabase.from("lead_activities").insert({
      lead_id: insertedLead.id,
      actor_id: systemActorId,
      activity_type: "whatsapp_inbound",
      notes: noteBody || "Inbound WhatsApp message received from ManyChat.",
    });

    if (activityError) {
      throw activityError;
    }

    await notifySuperAdmins(supabase, {
      category: "lead",
      title: "New WhatsApp Lead",
      body: buildNotificationBody(insertedLead.full_name, "started a WhatsApp conversation in ManyChat."),
      action_url: "./admin-leads.html",
    });

    const adminEmails = await getSuperAdminEmailRecipients(supabase).catch(() => []);
    await sendNoticeEmail({
      to: adminEmails,
      subject: "New WhatsApp lead",
      eyebrow: "Lead Alert",
      title: "A new WhatsApp lead is in the CRM",
      intro: `${insertedLead.full_name} started a ManyChat WhatsApp conversation.`,
      metaRows: [
        { label: "Lead", value: insertedLead.full_name },
        { label: "Source", value: source },
        { label: "Flow", value: flowName || "ManyChat" },
      ],
      ctaLabel: "Open Leads",
      ctaUrl: "./admin-leads.html",
      tags: [
        { name: "category", value: "lead" },
        { name: "event", value: "whatsapp_lead_created" },
      ],
    }).catch(() => null);

    return json(200, {
      ok: true,
      leadId: insertedLead.id,
      existing: false,
    });
  } catch (error) {
    return json(500, {
      error: error.message || "Unable to sync the ManyChat lead.",
    });
  }
};
