"use strict";

const { json, methodNotAllowed, noContent } = require("./_lib/http");
const { awardCoachXpAction, buildCoachXpSourceRef } = require("./_lib/xp-coach");
const { getAuthenticatedProfile, getServiceSupabase, notifyRecipients } = require("./_lib/supabase");
const {
  parseEmail,
  parseEnum,
  parseIsoDateTime,
  parseOptionalText,
  parsePhone,
  parseRequiredText,
  validationError,
} = require("./_lib/validation");

function parseBody(event) {
  try {
    return JSON.parse(event.body || "{}");
  } catch (_) {
    return null;
  }
}

async function loadLeadById(supabase, leadId) {
  const { data, error } = await supabase
    .from("leads")
    .select("id, full_name, email, phone, source, status, owner_id, next_follow_up_at, notes, converted_client_id, created_at")
    .eq("id", leadId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data || null;
}

async function validateLeadOwner(supabase, ownerId) {
  if (!ownerId) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, role, status, display_name")
    .eq("id", ownerId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data?.id || !["coach", "super_admin"].includes(data.role)) {
    throw validationError("Lead owner must be an active coach or super admin.");
  }

  if (data.status && data.status !== "active") {
    throw validationError("Lead owner must be active before being assigned.");
  }

  return data;
}

async function requireLeadAccess(supabase, profile, leadId) {
  const lead = await loadLeadById(supabase, leadId);
  if (!lead) {
    throw validationError("Lead not found.", 404);
  }

  if (profile.role === "super_admin") {
    return lead;
  }

  if (profile.role !== "coach") {
    throw validationError("You do not have permission to manage leads.", 403);
  }

  if (lead.owner_id !== profile.id) {
    throw validationError("You can only update consult leads assigned to your account.", 403);
  }

  return lead;
}

async function handleCreateLead(supabase, actor, body) {
  if (actor.profile.role !== "super_admin") {
    throw validationError("Only super admin accounts can create leads.", 403);
  }

  const fullName = parseRequiredText(body.fullName, {
    label: "Lead name",
    minLength: 2,
    maxLength: 120,
  });
  const source = parseOptionalText(body.source, {
    label: "Lead source",
    maxLength: 120,
  });
  const email = parseEmail(body.email, {
    label: "Lead email",
    required: false,
  });
  const phone = parsePhone(body.phone, {
    label: "Lead phone",
    required: false,
  });
  const ownerId = parseOptionalText(body.ownerId, {
    label: "Lead owner",
    maxLength: 80,
  });
  const nextFollowUpAt = parseIsoDateTime(body.nextFollowUpAt, {
    label: "Next follow-up",
    required: false,
  });
  const notes = parseOptionalText(body.notes, {
    label: "Lead notes",
    maxLength: 2000,
  });

  const ownerProfile = await validateLeadOwner(supabase, ownerId || null);

  const { data: insertedLead, error: leadError } = await supabase
    .from("leads")
    .insert({
      full_name: fullName,
      source: source || null,
      email: email || null,
      phone: phone || null,
      owner_id: ownerProfile?.id || null,
      next_follow_up_at: nextFollowUpAt || null,
      notes: notes || null,
      status: "new",
    })
    .select("id, full_name, owner_id")
    .single();

  if (leadError || !insertedLead?.id) {
    throw leadError || new Error("Unable to create the lead.");
  }

  const activityNotes = [
    source ? `Source: ${source}` : "",
    email ? `Email: ${email}` : "",
    phone ? `Phone: ${phone}` : "",
    notes || "",
  ]
    .filter(Boolean)
    .join(" | ");

  const { error: activityError } = await supabase.from("lead_activities").insert({
    lead_id: insertedLead.id,
    actor_id: actor.user.id,
    activity_type: "lead_created",
    notes: activityNotes || "Lead created from the admin CRM dashboard.",
  });

  if (activityError) {
    throw activityError;
  }

  if (ownerProfile?.role === "coach" && ownerProfile.id !== actor.user.id) {
    await notifyRecipients(supabase, [
      {
        recipient_id: ownerProfile.id,
        category: "lead",
        title: "New lead assigned",
        body: `${fullName} was assigned to your lead pipeline.`,
        action_url: "./coach-clients.html",
      },
    ]).catch(() => null);
  }

  return json(200, {
    ok: true,
    leadId: insertedLead.id,
    fullName: insertedLead.full_name,
  });
}

async function handleFollowUp(supabase, actor, body) {
  const leadId = parseRequiredText(body.leadId, {
    label: "Lead",
    minLength: 8,
    maxLength: 80,
  });
  const activityType = parseEnum(body.activityType, ["call", "email", "whatsapp", "meeting", "note", "coach_follow_up"], {
    label: "Activity type",
    required: true,
  });
  const status = parseEnum(body.status || "contacted", ["new", "contacted", "qualified", "ghosted", "converted", "lost"], {
    label: "Lead status",
    required: true,
  });
  const ownerId = parseOptionalText(body.ownerId, {
    label: "Lead owner",
    maxLength: 80,
  });
  const nextFollowUpAt = parseIsoDateTime(body.nextFollowUpAt, {
    label: "Next follow-up",
    required: false,
  });
  const notes = parseRequiredText(body.notes, {
    label: "Follow-up notes",
    minLength: 2,
    maxLength: 2000,
  });

  const lead = await requireLeadAccess(supabase, actor.profile, leadId);

  if (status === "converted" && !lead.converted_client_id) {
    throw validationError(
      actor.profile.role === "super_admin"
        ? "Use the Convert Lead form to create the client account before marking a lead converted."
        : "This lead must be converted into a client account before it can be marked converted."
    );
  }

  let nextOwnerId = lead.owner_id || null;
  let ownerProfile = null;
  if (actor.profile.role === "super_admin") {
    ownerProfile = await validateLeadOwner(supabase, ownerId || null);
    nextOwnerId = ownerProfile?.id || null;
  } else {
    nextOwnerId = actor.profile.id;
  }

  const { error: leadError } = await supabase
    .from("leads")
    .update({
      status,
      owner_id: nextOwnerId,
      next_follow_up_at: nextFollowUpAt || null,
      notes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", leadId);

  if (leadError) {
    throw leadError;
  }

  const { data: activityEntry, error: activityError } = await supabase
    .from("lead_activities")
    .insert({
      lead_id: leadId,
      actor_id: actor.user.id,
      activity_type: activityType,
      notes,
    })
    .select("id")
    .single();

  if (activityError || !activityEntry?.id) {
    throw activityError;
  }

  if (actor.profile.role === "coach") {
    const coachActionId = ["call", "email", "whatsapp", "meeting", "coach_follow_up"].includes(activityType)
      ? "PRO-COMM"
      : "SYS-CRM";
    await awardCoachXpAction(supabase, {
      actionId: coachActionId,
      targetProfileId: actor.profile.id,
      actorProfileId: actor.profile.id,
      eventDate: new Date(),
      sourceRef: buildCoachXpSourceRef("lead-follow-up", activityEntry.id, coachActionId),
      evidence: leadId,
      notes: `${activityType} follow-up logged for ${lead.full_name || "lead"}.`,
    }).catch(() => null);
  }

  if (actor.profile.role === "super_admin" && ownerProfile?.role === "coach" && ownerProfile.id !== lead.owner_id) {
    await notifyRecipients(supabase, [
      {
        recipient_id: ownerProfile.id,
        category: "lead",
        title: "Lead follow-up assigned",
        body: `${lead.full_name || "A lead"} is now assigned to your follow-up queue.`,
        action_url: "./coach-clients.html",
      },
    ]).catch(() => null);
  }

  return json(200, {
    ok: true,
    leadId,
    fullName: lead.full_name || "Lead",
  });
}

async function handleLogMessage(supabase, actor, body) {
  if (actor.profile.role !== "super_admin") {
    throw validationError("Only super admin accounts can log lead messages from this workflow.", 403);
  }

  const leadId = parseRequiredText(body.leadId, {
    label: "Lead",
    minLength: 8,
    maxLength: 80,
  });
  const channel = parseEnum(body.channel, ["email", "note"], {
    label: "Channel",
    required: true,
  });
  const subject = parseOptionalText(body.subject, {
    label: "Subject",
    maxLength: 160,
  });
  const message = parseRequiredText(body.message, {
    label: "Message",
    minLength: 2,
    maxLength: 4000,
  });

  const lead = await requireLeadAccess(supabase, actor.profile, leadId);
  if (channel === "email" && !lead.email) {
    throw validationError("This lead does not have an email address.");
  }

  const activityNotes = [subject ? `Subject: ${subject}` : "", message].filter(Boolean).join("\n\n");
  const { error: activityError } = await supabase.from("lead_activities").insert({
    lead_id: leadId,
    actor_id: actor.user.id,
    activity_type: channel,
    notes: activityNotes,
  });

  if (activityError) {
    throw activityError;
  }

  return json(200, {
    ok: true,
    leadId,
    fullName: lead.full_name || "Lead",
  });
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return noContent();
  }

  if (event.httpMethod !== "POST") {
    return methodNotAllowed("POST, OPTIONS");
  }

  const body = parseBody(event);
  if (!body) {
    return json(400, { error: "Request body must be valid JSON." });
  }

  try {
    const action = parseEnum(body.action, ["create", "follow_up", "log_message"], {
      label: "Lead action",
      required: true,
    });
    const supabase = getServiceSupabase();
    const actor = await getAuthenticatedProfile(event, supabase);
    if (!actor?.profile) {
      return json(401, { error: "A valid session is required." });
    }

    if (action === "create") {
      return handleCreateLead(supabase, actor, body);
    }

    if (action === "follow_up") {
      return handleFollowUp(supabase, actor, body);
    }

    return handleLogMessage(supabase, actor, body);
  } catch (error) {
    return json(error?.statusCode || 500, {
      error: error?.message || "Unable to manage the lead right now.",
    });
  }
};
