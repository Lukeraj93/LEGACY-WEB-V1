const { errorResponse, json, methodNotAllowed, noContent, parseJsonBody } = require("./_lib/http");
const { sendNoticeEmail } = require("./_lib/email");
const { ensureSystemProfile, getServiceSupabase, getSuperAdminEmailRecipients, notifyRecipients, notifySuperAdmins } = require("./_lib/supabase");
const { assertRateLimit, buildRateLimitKey, getRequestIp } = require("./_lib/rate-limit");
const { cleanText, parseEmail, parseOptionalText, parsePhone, parseRequiredText } = require("./_lib/validation");

const leadCaptureThrottle = new Map();

function buildLeadNotes(payload) {
  const lines = [
    payload.channel ? `Channel: ${payload.channel}` : "",
    payload.pageTitle ? `Page: ${payload.pageTitle}` : "",
    payload.pagePath ? `Page Path: ${payload.pagePath}` : "",
    payload.service ? `Service Interest: ${payload.service}` : "",
    payload.goal ? `Primary Goal: ${payload.goal}` : "",
    payload.preferredCoach ? `Preferred Coach: ${payload.preferredCoach}` : "",
    payload.schedule ? `Preferred Schedule: ${payload.schedule}` : "",
    payload.preferredDay ? `Preferred Day: ${payload.preferredDay}` : "",
    payload.preferredTime ? `Preferred Time: ${payload.preferredTime}` : "",
    payload.details ? `Details: ${payload.details}` : "",
  ].filter(Boolean);

  return lines.join("\n");
}

function buildNotificationBody(fullName, source, detail) {
  const parts = [fullName || "A new lead", source ? `via ${source}` : "", detail || ""].filter(Boolean);
  return parts.join(" ");
}

function nextFollowUpAt() {
  return new Date(Date.now() + (24 * 60 * 60 * 1000)).toISOString();
}

function normalizeCoachName(name) {
  const normalized = String(name || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/gu, " ");

  if (!normalized) {
    return "";
  }

  if (normalized === "kylie denis") {
    return "kylie dennis";
  }

  return normalized;
}

async function resolvePreferredCoachOwner(supabase, preferredCoach) {
  const normalizedRequestedCoach = normalizeCoachName(preferredCoach);
  if (!normalizedRequestedCoach) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, role, status")
    .eq("role", "coach")
    .eq("status", "active");

  if (error) {
    throw error;
  }

  return (data || []).find((profile) => {
    const displayName = String(profile.display_name || "").trim();
    if (!displayName || /^legacy\s+qa/iu.test(displayName)) {
      return false;
    }

    return normalizeCoachName(displayName) === normalizedRequestedCoach;
  }) || null;
}

async function notifyAssignedCoach(supabase, coachId, fullName, source, detail) {
  if (!coachId) {
    return;
  }

  await notifyRecipients(supabase, [
    {
      recipient_id: coachId,
      category: "lead",
      title: "New lead assigned",
      body: buildNotificationBody(fullName, source, detail),
      action_url: "./coach-clients.html",
    },
  ]).catch(() => null);
}

async function findExistingLead(supabase, email, phone) {
  if (email) {
    const emailQuery = await supabase
      .from("leads")
      .select("id, full_name, notes, source, status, owner_id")
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
      .select("id, full_name, notes, source, status, owner_id")
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

  try {
    const body = parseJsonBody(event, {
      maxBytes: 24 * 1024,
    });
    const fullName = parseRequiredText(body.fullName || body.name, {
      label: "Full name",
      minLength: 2,
      maxLength: 120,
    });
    const source = parseOptionalText(body.source, {
      label: "Source",
      maxLength: 120,
    }) || "Website Inquiry";
    const channel = parseOptionalText(body.channel, {
      label: "Channel",
      maxLength: 80,
    }) || "website_form";
    const pageTitle = parseOptionalText(body.pageTitle, {
      label: "Page title",
      maxLength: 160,
    });
    const pagePath = parseOptionalText(body.pagePath, {
      label: "Page path",
      maxLength: 160,
    });
    const service = parseOptionalText(body.service, {
      label: "Service interest",
      maxLength: 160,
    });
    const goal = parseOptionalText(body.goal, {
      label: "Primary goal",
      maxLength: 240,
    });
    const preferredCoach = parseOptionalText(body.preferredCoach || body.coach, {
      label: "Preferred coach",
      maxLength: 120,
    });
    const schedule = parseOptionalText(body.schedule, {
      label: "Preferred schedule",
      maxLength: 160,
    });
    const preferredDay = parseOptionalText(body.preferredDay || body.day, {
      label: "Preferred day",
      maxLength: 80,
    });
    const preferredTime = parseOptionalText(body.preferredTime || body.time, {
      label: "Preferred time",
      maxLength: 80,
    });
    const details = parseOptionalText(body.details, {
      label: "Details",
      maxLength: 1000,
    });

    const directEmail = parseEmail(body.email, {
      label: "Email address",
      required: false,
    });
    const directPhone = parsePhone(body.phone, {
      label: "Phone number",
      required: false,
    });
    const contactValue = cleanText(body.contact);
    const email = directEmail || (contactValue.includes("@")
      ? parseEmail(contactValue, {
        label: "Contact email",
        required: false,
      })
      : "");
    const phone = directPhone || (!email && contactValue
      ? parsePhone(contactValue, {
        label: "Contact phone number",
        required: false,
      })
      : "");

    if (!email && !phone) {
      return json(400, { error: "An email or phone number is required." });
    }

    assertRateLimit({
      store: leadCaptureThrottle,
      key: buildRateLimitKey("capture-lead", getRequestIp(event), email || phone || fullName),
      limit: 5,
      windowMs: 5 * 60 * 1000,
      message: "Too many lead submissions were received. Please wait a few minutes and try again.",
    });

    const supabase = getServiceSupabase();
    const systemActorId = await ensureSystemProfile(supabase);
    const assignedCoach = await resolvePreferredCoachOwner(supabase, preferredCoach);
    const noteBody = buildLeadNotes({
      channel,
      pageTitle,
      pagePath,
      service,
      goal,
      preferredCoach,
      schedule,
      preferredDay,
      preferredTime,
      details,
    });

    const existingLead = await findExistingLead(supabase, email, phone);
    if (existingLead?.id) {
      const nextNotes = [existingLead.notes || "", "", `[${new Date().toISOString()}] ${noteBody}`]
        .filter(Boolean)
        .join("\n");

      const updatePayload = {
        source,
        notes: nextNotes,
        next_follow_up_at: nextFollowUpAt(),
        updated_at: new Date().toISOString(),
      };

      if (assignedCoach?.id) {
        updatePayload.owner_id = assignedCoach.id;
      }

      const { error: updateError } = await supabase
        .from("leads")
        .update(updatePayload)
        .eq("id", existingLead.id);

      if (updateError) {
        throw updateError;
      }

      const { error: activityError } = await supabase.from("lead_activities").insert({
        lead_id: existingLead.id,
        actor_id: systemActorId,
        activity_type: "website_inquiry",
        notes: noteBody,
      });

      if (activityError) {
        throw activityError;
      }

      await notifySuperAdmins(supabase, {
        category: "lead",
        title: "Lead Updated",
        body: buildNotificationBody(
          existingLead.full_name || fullName,
          source,
          assignedCoach?.id
            ? `submitted another inquiry and was routed to ${assignedCoach.display_name || "the selected coach"}.`
            : "submitted another inquiry."
        ),
        action_url: "./admin-leads.html",
      });

      await notifyAssignedCoach(
        supabase,
        assignedCoach?.id || existingLead.owner_id || null,
        existingLead.full_name || fullName,
        source,
        assignedCoach?.id ? "submitted a new inquiry from the public coach booking flow." : "submitted another inquiry."
      );

      const adminEmails = await getSuperAdminEmailRecipients(supabase).catch(() => []);
      await sendNoticeEmail({
        to: adminEmails,
        subject: "Lead updated in the CRM",
        eyebrow: "Lead Alert",
        title: "An existing lead submitted another inquiry",
        intro: `${existingLead.full_name || fullName} sent another enquiry via ${source}.`,
        metaRows: [
          { label: "Lead", value: existingLead.full_name || fullName },
          { label: "Source", value: source },
          { label: "Channel", value: channel },
        ],
        ctaLabel: "Open Leads",
        ctaUrl: "./admin-leads.html",
        tags: [
          { name: "category", value: "lead" },
          { name: "event", value: "lead_updated" },
        ],
      }).catch(() => null);

      return json(200, {
        ok: true,
        leadId: existingLead.id,
        existing: true,
        assignedCoachId: assignedCoach?.id || existingLead.owner_id || null,
        assignedCoachName: assignedCoach?.display_name || preferredCoach || null,
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
        owner_id: assignedCoach?.id || null,
        next_follow_up_at: nextFollowUpAt(),
        notes: noteBody || null,
      })
      .select("id, full_name")
      .single();

    if (leadError || !insertedLead?.id) {
      throw leadError || new Error("Unable to create the lead.");
    }

    const { error: activityError } = await supabase.from("lead_activities").insert({
      lead_id: insertedLead.id,
      actor_id: systemActorId,
      activity_type: "website_inquiry",
      notes: noteBody || "Website inquiry captured automatically.",
    });

    if (activityError) {
      throw activityError;
    }

    await notifySuperAdmins(supabase, {
      category: "lead",
      title: "New Lead Captured",
      body: buildNotificationBody(
        insertedLead.full_name,
        source,
        assignedCoach?.id ? `was routed to ${assignedCoach.display_name || "the selected coach"}.` : "is waiting in the CRM."
      ),
      action_url: "./admin-leads.html",
    });

    await notifyAssignedCoach(
      supabase,
      assignedCoach?.id || null,
      insertedLead.full_name,
      source,
      "came in from the public coach booking flow."
    );

    const adminEmails = await getSuperAdminEmailRecipients(supabase).catch(() => []);
    await sendNoticeEmail({
      to: adminEmails,
      subject: "New lead captured",
      eyebrow: "Lead Alert",
      title: "A new lead is waiting in the CRM",
      intro: `${insertedLead.full_name} came in via ${source}.`,
      metaRows: [
        { label: "Lead", value: insertedLead.full_name },
        { label: "Source", value: source },
        { label: "Channel", value: channel },
      ],
      ctaLabel: "Open Leads",
      ctaUrl: "./admin-leads.html",
      tags: [
        { name: "category", value: "lead" },
        { name: "event", value: "lead_created" },
      ],
    }).catch(() => null);

    return json(200, {
      ok: true,
      leadId: insertedLead.id,
      existing: false,
      assignedCoachId: assignedCoach?.id || null,
      assignedCoachName: assignedCoach?.display_name || preferredCoach || null,
    });
  } catch (error) {
    return errorResponse(error, "Unable to capture the lead.");
  }
};
