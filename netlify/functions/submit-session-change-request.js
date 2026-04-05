const {
  createHttpError,
  errorResponse,
  json,
  methodNotAllowed,
  noContent,
  parseJsonBody,
} = require("./_lib/http");
const { sendNoticeEmail } = require("./_lib/email");
const {
  DEFAULT_SESSION_DURATION_MINUTES,
  buildPolicyWindowLabel,
  formatSessionSlot,
  isWithinCoachAvailabilityWindow,
  normalizeTimeValue,
  toMalaysiaDateTime,
} = require("./_lib/schedule-utils");
const {
  getAuthenticatedProfile,
  getEmailMapForUserIds,
  getServiceSupabase,
  getSuperAdminEmailRecipients,
  notifyRecipients,
  notifySuperAdmins,
} = require("./_lib/supabase");
const { parseRequiredText } = require("./_lib/validation");
const { hasCoachSessionConflict } = require("./_lib/coach-availability");

async function loadSessionRecord(supabase, sessionId) {
  const { data, error } = await supabase
    .from("sessions")
    .select("id, client_id, coach_id, client_package_id, scheduled_start, scheduled_end, status")
    .eq("id", sessionId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data || null;
}

async function loadClientPackage(supabase, packageId) {
  if (!packageId) {
    return null;
  }

  const { data, error } = await supabase
    .from("client_packages")
    .select("id, package_name")
    .eq("id", packageId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data || null;
}

async function loadProfileNames(supabase, userIds) {
  const uniqueIds = Array.from(new Set((userIds || []).filter(Boolean)));
  if (!uniqueIds.length) {
    return new Map();
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name")
    .in("id", uniqueIds);

  if (error) {
    throw error;
  }

  return new Map((data || []).map((profile) => [profile.id, String(profile.display_name || "").trim()]));
}

async function ensureNoPendingChangeRequest(supabase, sessionId) {
  const { data, error } = await supabase
    .from("session_change_requests")
    .select("id")
    .eq("session_id", sessionId)
    .eq("status", "pending")
    .limit(1);

  if (error) {
    throw error;
  }

  if (data?.length) {
    throw createHttpError(409, "There is already a pending change request for this session.");
  }
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return noContent();
  }

  if (event.httpMethod !== "POST") {
    return methodNotAllowed("POST, OPTIONS");
  }

  try {
    const body = await parseJsonBody(event, { maxBytes: 32 * 1024 });
    const sessionId = String(body.sessionId || "").trim();
    const requestType = String(body.requestType || "reschedule").trim().toLowerCase() === "cancel"
      ? "cancel"
      : "reschedule";
    const requestedDate = String(body.requestedDate || "").trim();
    const requestedTime = normalizeTimeValue(body.requestedTime);
    const reason = parseRequiredText(body.reason, {
      label: requestType === "cancel" ? "Cancellation reason" : "Reschedule reason",
      maxLength: 400,
    });

    if (!sessionId) {
      throw createHttpError(400, "A scheduled session is required.");
    }

    const supabase = getServiceSupabase();
    const access = await getAuthenticatedProfile(event, supabase);
    if (!access?.profile) {
      return json(401, { error: "A valid authenticated session is required." });
    }

    if (access.profile.role !== "client") {
      return json(403, { error: "Only clients can submit session change requests." });
    }

    const sessionRecord = await loadSessionRecord(supabase, sessionId);
    if (!sessionRecord) {
      throw createHttpError(404, "That scheduled session could not be found.");
    }

    if (sessionRecord.client_id !== access.profile.id) {
      throw createHttpError(403, "You cannot modify another client's scheduled session.");
    }

    if (sessionRecord.status !== "scheduled") {
      throw createHttpError(400, "Only scheduled sessions can be rescheduled or cancelled.");
    }

    await ensureNoPendingChangeRequest(supabase, sessionRecord.id);

    const insertPayload = {
      session_id: sessionRecord.id,
      client_id: access.profile.id,
      coach_id: sessionRecord.coach_id,
      request_type: requestType,
      original_start: sessionRecord.scheduled_start,
      original_end: sessionRecord.scheduled_end,
      reason,
    };

    if (requestType === "reschedule") {
      if (!/^\d{4}-\d{2}-\d{2}$/u.test(requestedDate)) {
        throw createHttpError(400, "Requested date must use YYYY-MM-DD format.");
      }

      if (!requestedTime) {
        throw createHttpError(400, "Requested time must use HH:MM format.");
      }

      const requestedStart = toMalaysiaDateTime(requestedDate, requestedTime);
      if (Number.isNaN(requestedStart.getTime())) {
        throw createHttpError(400, "Requested date or time is invalid.");
      }

      if (requestedStart.getTime() <= Date.now()) {
        throw createHttpError(400, "Choose a future date and time for the reschedule request.");
      }

      const isWithinAvailability = await isWithinCoachAvailabilityWindow(
        supabase,
        sessionRecord.coach_id,
        requestedDate,
        requestedTime,
        DEFAULT_SESSION_DURATION_MINUTES
      );
      if (!isWithinAvailability) {
        throw createHttpError(
          400,
          "That new slot sits outside your coach's published availability windows. Choose a listed window or coordinate directly first."
        );
      }

      const durationMs = Math.max(
        DEFAULT_SESSION_DURATION_MINUTES * 60 * 1000,
        new Date(sessionRecord.scheduled_end).getTime() - new Date(sessionRecord.scheduled_start).getTime()
      );
      const requestedEnd = new Date(requestedStart.getTime() + durationMs);
      const hasConflict = await hasCoachSessionConflict(
        supabase,
        sessionRecord.coach_id,
        requestedStart.toISOString(),
        requestedEnd.toISOString(),
        { excludeSessionId: sessionRecord.id }
      );
      if (hasConflict) {
        throw createHttpError(409, "That requested slot has already been taken by another scheduled session.");
      }

      insertPayload.requested_start = requestedStart.toISOString();
      insertPayload.requested_end = requestedEnd.toISOString();
    }

    const { data: insertedRequest, error: insertError } = await supabase
      .from("session_change_requests")
      .insert(insertPayload)
      .select("id")
      .single();

    if (insertError || !insertedRequest) {
      throw insertError || new Error("Unable to submit the session change request right now.");
    }

    const [profileNames, linkedPackage, emailMap, adminEmails] = await Promise.all([
      loadProfileNames(supabase, [access.profile.id, sessionRecord.coach_id]),
      loadClientPackage(supabase, sessionRecord.client_package_id).catch(() => null),
      getEmailMapForUserIds(supabase, [access.profile.id, sessionRecord.coach_id].filter(Boolean)).catch(() => new Map()),
      getSuperAdminEmailRecipients(supabase).catch(() => []),
    ]);

    const clientName = profileNames.get(access.profile.id) || "Client";
    const coachName = profileNames.get(sessionRecord.coach_id) || "Coach";
    const packageName = String(linkedPackage?.package_name || "").trim() || "Active Package";
    const originalSlot = formatSessionSlot(sessionRecord.scheduled_start, sessionRecord.scheduled_end);
    const requestedSlot = requestType === "cancel"
      ? "Cancellation requested"
      : formatSessionSlot(insertPayload.requested_start, insertPayload.requested_end);
    const policyWindowLabel = buildPolicyWindowLabel(sessionRecord.scheduled_start);
    const clientIntro = requestType === "cancel"
      ? `We received your cancellation request for ${originalSlot}. It is now waiting for coach or admin review.`
      : `We received your reschedule request for ${originalSlot}. It is now waiting for coach or admin review.`;
    const staffIntro = requestType === "cancel"
      ? `${clientName} requested to cancel the session scheduled for ${originalSlot}.`
      : `${clientName} requested to move the session from ${originalSlot} to ${requestedSlot}.`;

    await notifyRecipients(supabase, [
      {
        recipient_id: access.profile.id,
        category: "schedule",
        title: requestType === "cancel" ? "Cancellation Request Submitted" : "Reschedule Request Submitted",
        body: clientIntro,
        action_url: "./client-schedule.html",
      },
    ]).catch(() => null);

    if (sessionRecord.coach_id) {
      await notifyRecipients(supabase, [
        {
          recipient_id: sessionRecord.coach_id,
          category: "schedule",
          title: requestType === "cancel" ? "Session Cancellation Requested" : "Session Reschedule Requested",
          body: `${staffIntro} ${policyWindowLabel}`.trim(),
          action_url: "./coach-schedule.html",
        },
      ]).catch(() => null);
    }

    await notifySuperAdmins(supabase, {
      category: "schedule",
      title: requestType === "cancel" ? "Session Cancellation Requested" : "Session Reschedule Requested",
      body: `${staffIntro} ${policyWindowLabel}`.trim(),
      action_url: "./admin-dashboard.html",
    }).catch(() => null);

    await sendNoticeEmail({
      to: emailMap.get(access.profile.id) || "",
      subject: requestType === "cancel" ? "Cancellation Request Received" : "Reschedule Request Received",
      eyebrow: "Schedule Change",
      title: requestType === "cancel" ? "Your cancellation request is in review" : "Your reschedule request is in review",
      intro: clientIntro,
      metaRows: [
        { label: "Package", value: packageName },
        { label: "Current Session", value: originalSlot },
        ...(requestType === "cancel" ? [] : [{ label: "Requested Slot", value: requestedSlot }]),
        { label: "Coach", value: coachName },
        { label: "Status", value: "Pending review" },
      ],
      ctaLabel: "Open Schedule",
      ctaUrl: "./client-schedule.html",
      noteLabel: "Policy Window",
      noteBody: policyWindowLabel,
      footerNote: `Reason submitted: ${reason}`,
      tags: [
        { name: "category", value: "schedule" },
        { name: "event", value: requestType === "cancel" ? "cancellation_request_submitted" : "reschedule_request_submitted" },
      ],
    }).catch(() => null);

    await sendNoticeEmail({
      to: emailMap.get(sessionRecord.coach_id) || "",
      subject: requestType === "cancel" ? `Cancellation request from ${clientName}` : `Reschedule request from ${clientName}`,
      eyebrow: "Coach Alert",
      title: requestType === "cancel" ? "A client requested to cancel a session" : "A client requested to reschedule a session",
      intro: staffIntro,
      metaRows: [
        { label: "Client", value: clientName },
        { label: "Coach", value: coachName },
        { label: "Current Session", value: originalSlot },
        ...(requestType === "cancel" ? [] : [{ label: "Requested Slot", value: requestedSlot }]),
        { label: "Package", value: packageName },
      ],
      ctaLabel: "Open Schedule",
      ctaUrl: "./coach-schedule.html",
      noteLabel: "Client Reason",
      noteBody: reason,
      footerNote: policyWindowLabel,
      tags: [
        { name: "category", value: "schedule" },
        { name: "event", value: requestType === "cancel" ? "coach_cancellation_request_alert" : "coach_reschedule_request_alert" },
      ],
    }).catch(() => null);

    await sendNoticeEmail({
      to: adminEmails,
      subject: requestType === "cancel" ? `Cancellation request pending: ${clientName}` : `Reschedule request pending: ${clientName}`,
      eyebrow: "Schedule Alert",
      title: requestType === "cancel" ? "A cancellation request needs review" : "A reschedule request needs review",
      intro: staffIntro,
      metaRows: [
        { label: "Client", value: clientName },
        { label: "Coach", value: coachName },
        { label: "Current Session", value: originalSlot },
        ...(requestType === "cancel" ? [] : [{ label: "Requested Slot", value: requestedSlot }]),
        { label: "Package", value: packageName },
      ],
      ctaLabel: "Open Dashboard",
      ctaUrl: "./admin-dashboard.html",
      noteLabel: "Client Reason",
      noteBody: reason,
      footerNote: policyWindowLabel,
      tags: [
        { name: "category", value: "schedule" },
        { name: "event", value: requestType === "cancel" ? "admin_cancellation_request_alert" : "admin_reschedule_request_alert" },
      ],
    }).catch(() => null);

    return json(200, {
      ok: true,
      requestId: insertedRequest.id,
      message: requestType === "cancel"
        ? "Cancellation request submitted. It will stay pending until your coach reviews it."
        : "Reschedule request submitted. It will stay pending until your coach reviews it.",
    });
  } catch (error) {
    return errorResponse(error, "Unable to submit the session change request right now.");
  }
};
