const { buildPhoneCandidates, normalizePhone } = require("./whatsapp");

function cleanText(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/gu, " ");
}

function trimMessageBody(value) {
  return String(value || "").trim();
}

function nextFollowUpAt() {
  return new Date(Date.now() + (24 * 60 * 60 * 1000)).toISOString();
}

async function findLeadByPhone(supabase, phone) {
  const candidates = buildPhoneCandidates(phone);
  if (!candidates.length) {
    return null;
  }

  const { data, error } = await supabase
    .from("leads")
    .select("id, full_name, phone, status, source, converted_client_id, notes, updated_at")
    .in("phone", candidates)
    .order("updated_at", { ascending: false })
    .limit(1);

  if (error) {
    throw error;
  }

  return data?.[0] || null;
}

async function findClientByPhone(supabase, phone) {
  const candidates = buildPhoneCandidates(phone);
  if (!candidates.length) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, role, display_name, phone, status")
    .eq("role", "client")
    .in("phone", candidates)
    .order("updated_at", { ascending: false })
    .limit(1);

  if (error) {
    throw error;
  }

  return data?.[0] || null;
}

async function findClientById(supabase, clientId) {
  if (!clientId) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, role, display_name, phone, status")
    .eq("id", clientId)
    .eq("role", "client")
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data || null;
}

async function findLeadById(supabase, leadId) {
  if (!leadId) {
    return null;
  }

  const { data, error } = await supabase
    .from("leads")
    .select("id, full_name, phone, status, source, converted_client_id, notes, updated_at")
    .eq("id", leadId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data || null;
}

async function resolveConversationOwner(supabase, phone) {
  const [lead, directClient] = await Promise.all([
    findLeadByPhone(supabase, phone),
    findClientByPhone(supabase, phone),
  ]);

  if (directClient?.id) {
    return {
      lead,
      client: directClient,
    };
  }

  if (lead?.converted_client_id) {
    const convertedClient = await findClientById(supabase, lead.converted_client_id);
    return {
      lead,
      client: convertedClient,
    };
  }

  return {
    lead,
    client: null,
  };
}

async function createLeadFromWhatsApp(supabase, { fullName, phone, details } = {}) {
  const normalizedPhone = normalizePhone(phone);
  if (!normalizedPhone) {
    throw new Error("A valid WhatsApp phone number is required to create a lead.");
  }

  const { data, error } = await supabase
    .from("leads")
    .insert({
      full_name: cleanText(fullName) || `WhatsApp ${normalizedPhone.replace(/^\+/u, "")}`,
      phone: normalizedPhone,
      source: "WhatsApp Cloud API",
      status: "new",
      owner_id: null,
      next_follow_up_at: nextFollowUpAt(),
      notes: cleanText(details) || null,
    })
    .select("id, full_name, phone, status, source, converted_client_id, notes, updated_at")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

async function touchLeadFromWhatsApp(supabase, leadId, source) {
  if (!leadId) {
    return;
  }

  const { error } = await supabase
    .from("leads")
    .update({
      source: cleanText(source) || "WhatsApp Cloud API",
      next_follow_up_at: nextFollowUpAt(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", leadId);

  if (error) {
    throw error;
  }
}

async function logLeadWhatsAppActivity(supabase, { leadId, actorId, activityType, notes } = {}) {
  if (!leadId || !actorId || !activityType) {
    return null;
  }

  const { data, error } = await supabase
    .from("lead_activities")
    .insert({
      lead_id: leadId,
      actor_id: actorId,
      activity_type: activityType,
      notes: cleanText(notes) || null,
    })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

async function upsertWhatsappThread(
  supabase,
  { phone, contactName, leadId, clientId, assignedAdminId, latestPreview, latestAt, direction, status = "open" } = {}
) {
  const phoneE164 = normalizePhone(phone);
  if (!phoneE164) {
    throw new Error("A valid WhatsApp phone number is required for a thread.");
  }

  const nowIso = new Date().toISOString();
  const latestTimestamp = latestAt || nowIso;
  const { data: existing, error: existingError } = await supabase
    .from("whatsapp_threads")
    .select("id, contact_name, lead_id, client_id, assigned_admin_id, source, status, last_inbound_at, last_outbound_at")
    .eq("phone_e164", phoneE164)
    .maybeSingle();

  if (existingError) {
    throw existingError;
  }

  const payload = {
    phone_e164: phoneE164,
    contact_name: cleanText(contactName) || existing?.contact_name || null,
    lead_id: leadId || existing?.lead_id || null,
    client_id: clientId || existing?.client_id || null,
    assigned_admin_id: assignedAdminId || existing?.assigned_admin_id || null,
    source: existing?.source || "whatsapp_cloud",
    status: existing?.status || status,
    latest_message_preview: cleanText(latestPreview) || null,
    latest_message_at: latestTimestamp,
    last_inbound_at: direction === "inbound" ? latestTimestamp : existing?.last_inbound_at || null,
    last_outbound_at: direction === "outbound" ? latestTimestamp : existing?.last_outbound_at || null,
    updated_at: nowIso,
  };

  if (existing?.id) {
    const { data, error } = await supabase
      .from("whatsapp_threads")
      .update(payload)
      .eq("id", existing.id)
      .select("id, phone_e164, lead_id, client_id, status")
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  const { data, error } = await supabase
    .from("whatsapp_threads")
    .insert({
      ...payload,
      created_at: nowIso,
    })
    .select("id, phone_e164, lead_id, client_id, status")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

async function upsertWhatsappMessage(
  supabase,
  {
    threadId,
    leadId,
    clientId,
    waMessageId,
    direction,
    messageType,
    status,
    fromPhone,
    toPhone,
    body,
    payload,
    sentBy,
    externalCreatedAt,
    deliveredAt,
    readAt,
    failedAt,
    errorMessage,
  } = {}
) {
  if (!threadId) {
    throw new Error("A WhatsApp thread is required before storing a message.");
  }

  const normalizedDirection = cleanText(direction) || "inbound";
  const nowIso = new Date().toISOString();
  const row = {
    thread_id: threadId,
    lead_id: leadId || null,
    client_id: clientId || null,
    wa_message_id: cleanText(waMessageId) || null,
    direction: normalizedDirection,
    message_type: cleanText(messageType) || "text",
    status: cleanText(status) || null,
    from_phone: normalizePhone(fromPhone) || null,
    to_phone: normalizePhone(toPhone) || null,
    body: trimMessageBody(body) || null,
    payload: payload && typeof payload === "object" ? payload : {},
    sent_by: sentBy || null,
    external_created_at: externalCreatedAt || null,
    delivered_at: deliveredAt || null,
    read_at: readAt || null,
    failed_at: failedAt || null,
    error_message: cleanText(errorMessage) || null,
    updated_at: nowIso,
  };

  if (row.wa_message_id) {
    const { data, error } = await supabase
      .from("whatsapp_messages")
      .upsert(row, { onConflict: "wa_message_id" })
      .select("id, thread_id, wa_message_id, direction, status")
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  const { data, error } = await supabase
    .from("whatsapp_messages")
    .insert({
      ...row,
      created_at: nowIso,
    })
    .select("id, thread_id, wa_message_id, direction, status")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

function summarizeMessagePreview(value, maxLength = 140) {
  const cleaned = cleanText(value);
  if (!cleaned) {
    return "";
  }

  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  return `${cleaned.slice(0, Math.max(1, maxLength - 1)).trimEnd()}…`;
}

module.exports = {
  createLeadFromWhatsApp,
  findClientById,
  findLeadById,
  logLeadWhatsAppActivity,
  resolveConversationOwner,
  summarizeMessagePreview,
  touchLeadFromWhatsApp,
  upsertWhatsappMessage,
  upsertWhatsappThread,
};
