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
  formatBookingSlot,
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
  resolvePrimaryCoachForClient,
} = require("./_lib/supabase");
const { cleanText, parseOptionalText, parseRequiredText } = require("./_lib/validation");
const { hasCoachSessionConflict } = require("./_lib/coach-availability");

async function loadClientPackage(supabase, packageId) {
  const { data, error } = await supabase
    .from("client_packages")
    .select("id, client_id, secondary_client_id, package_name, sessions_remaining, status, expires_at")
    .eq("id", packageId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data || null;
}

async function loadCoachProfile(supabase, coachId) {
  if (!coachId) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name")
    .eq("id", coachId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data || null;
}

async function ensureNoPendingDuplicate(supabase, clientId, packageId, requestedDate, requestedTime) {
  const { data, error } = await supabase
    .from("booking_requests")
    .select("id")
    .eq("client_id", clientId)
    .eq("client_package_id", packageId)
    .eq("requested_date", requestedDate)
    .eq("requested_time", requestedTime)
    .eq("status", "pending")
    .limit(1);

  if (error) {
    throw error;
  }

  if (data?.length) {
    throw createHttpError(409, "You already have a pending booking request for that slot.");
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
    const clientPackageId = String(body.clientPackageId || "").trim();
    const sessionType = parseRequiredText(body.sessionType, {
      label: "Session type",
      maxLength: 80,
    });
    const requestedDate = parseRequiredText(body.requestedDate, {
      label: "Requested date",
      maxLength: 10,
    });
    const requestedTime = normalizeTimeValue(body.requestedTime);
    const sessionNote = parseOptionalText(body.sessionNote, {
      label: "Session note",
      maxLength: 400,
    });

    if (!clientPackageId) {
      throw createHttpError(400, "A client package is required.");
    }

    if (!/^\d{4}-\d{2}-\d{2}$/u.test(requestedDate)) {
      throw createHttpError(400, "Requested date must use YYYY-MM-DD format.");
    }

    if (!requestedTime) {
      throw createHttpError(400, "Requested time must use HH:MM format.");
    }

    const supabase = getServiceSupabase();
    const access = await getAuthenticatedProfile(event, supabase);
    if (!access?.profile) {
      return json(401, { error: "A valid authenticated session is required." });
    }

    if (access.profile.role !== "client") {
      return json(403, { error: "Only clients can submit booking requests." });
    }

    const linkedPackage = await loadClientPackage(supabase, clientPackageId);
    if (!linkedPackage) {
      throw createHttpError(404, "The selected package could not be found.");
    }

    const canUsePackage = [linkedPackage.client_id, linkedPackage.secondary_client_id]
      .filter(Boolean)
      .includes(access.profile.id);
    if (!canUsePackage) {
      throw createHttpError(403, "That package is not assigned to your account.");
    }

    if (linkedPackage.status !== "active") {
      throw createHttpError(400, "That package is no longer active.");
    }

    if (linkedPackage.expires_at && new Date(linkedPackage.expires_at).getTime() < Date.now()) {
      throw createHttpError(400, "That package has expired and can no longer be used for new bookings.");
    }

    if (Number(linkedPackage.sessions_remaining || 0) <= 0) {
      throw createHttpError(400, "That package has no remaining sessions available.");
    }

    const requestedStart = toMalaysiaDateTime(requestedDate, requestedTime);
    if (Number.isNaN(requestedStart.getTime())) {
      throw createHttpError(400, "Requested date or time is invalid.");
    }

    if (requestedStart.getTime() <= Date.now()) {
      throw createHttpError(400, "Choose a future date and time for your booking request.");
    }

    const coachId = await resolvePrimaryCoachForClient(supabase, access.profile.id);
    if (coachId) {
      const isWithinAvailability = await isWithinCoachAvailabilityWindow(
        supabase,
        coachId,
        requestedDate,
        requestedTime,
        DEFAULT_SESSION_DURATION_MINUTES
      );
      if (!isWithinAvailability) {
        throw createHttpError(
          400,
          "That slot falls outside your coach's published availability windows. Choose a listed window or check with your coach first."
        );
      }

      const requestedEnd = new Date(requestedStart.getTime() + DEFAULT_SESSION_DURATION_MINUTES * 60 * 1000);
      const hasConflict = await hasCoachSessionConflict(
        supabase,
        coachId,
        requestedStart.toISOString(),
        requestedEnd.toISOString()
      );
      if (hasConflict) {
        throw createHttpError(409, "That slot has already been taken. Choose another available window.");
      }
    }

    await ensureNoPendingDuplicate(supabase, access.profile.id, linkedPackage.id, requestedDate, requestedTime);

    const noteParts = [
      `Session type: ${sessionType}`,
      `Package: ${cleanText(linkedPackage.package_name) || "Active Package"}`,
    ];
    if (sessionNote) {
      noteParts.push(sessionNote);
    }

    const { data: insertedRequest, error: insertError } = await supabase
      .from("booking_requests")
      .insert({
        client_id: access.profile.id,
        preferred_coach_id: coachId || null,
        client_package_id: linkedPackage.id,
        requested_date: requestedDate,
        requested_time: requestedTime,
        notes: noteParts.join(" | "),
      })
      .select("id")
      .single();

    if (insertError || !insertedRequest) {
      throw insertError || new Error("Unable to submit the booking request right now.");
    }

    const coachProfile = await loadCoachProfile(supabase, coachId).catch(() => null);
    const clientName = cleanText(access.profile.display_name) || "Client";
    const coachName = cleanText(coachProfile?.display_name) || "Assigned Coach";
    const packageName = cleanText(linkedPackage.package_name) || "Active Package";
    const slotLabel = formatBookingSlot(requestedDate, requestedTime);
    const clientNotificationBody = `We received your ${sessionType} request for ${slotLabel}. It is now waiting for coach or admin confirmation.`;
    const staffNotificationBody = `${clientName} requested ${sessionType} for ${slotLabel}${coachId ? ` with ${coachName}` : ""}.`;

    await notifyRecipients(supabase, [
      {
        recipient_id: access.profile.id,
        category: "schedule",
        title: "Booking Request Submitted",
        body: clientNotificationBody,
        action_url: "./client-schedule.html",
      },
    ]).catch(() => null);

    if (coachId) {
      await notifyRecipients(supabase, [
        {
          recipient_id: coachId,
          category: "schedule",
          title: "New Booking Request",
          body: staffNotificationBody,
          action_url: "./coach-schedule.html",
        },
      ]).catch(() => null);
    }

    await notifySuperAdmins(supabase, {
      category: "schedule",
      title: "New Booking Request",
      body: staffNotificationBody,
      action_url: "./admin-dashboard.html",
    }).catch(() => null);

    const [clientEmailMap, adminEmails] = await Promise.all([
      getEmailMapForUserIds(supabase, [access.profile.id, coachId].filter(Boolean)).catch(() => new Map()),
      getSuperAdminEmailRecipients(supabase).catch(() => []),
    ]);

    const clientEmail = clientEmailMap.get(access.profile.id) || "";
    const coachEmail = coachId ? clientEmailMap.get(coachId) || "" : "";

    await sendNoticeEmail({
      to: clientEmail,
      subject: "Booking Request Received",
      eyebrow: "Schedule Update",
      title: "Your booking request is in review",
      intro: clientNotificationBody,
      metaRows: [
        { label: "Session Type", value: sessionType },
        { label: "Requested Slot", value: slotLabel },
        { label: "Package", value: packageName },
        { label: "Coach", value: coachId ? coachName : "To be assigned" },
        { label: "Status", value: "Pending review" },
      ],
      ctaLabel: "Open Schedule",
      ctaUrl: "./client-schedule.html",
      noteLabel: "Session Note",
      noteBody: sessionNote,
      tags: [
        { name: "category", value: "schedule" },
        { name: "event", value: "booking_request_submitted" },
      ],
    }).catch(() => null);

    await sendNoticeEmail({
      to: coachEmail,
      subject: `New booking request from ${clientName}`,
      eyebrow: "Coach Alert",
      title: "A client requested a new session",
      intro: staffNotificationBody,
      metaRows: [
        { label: "Client", value: clientName },
        { label: "Session Type", value: sessionType },
        { label: "Requested Slot", value: slotLabel },
        { label: "Package", value: packageName },
        { label: "Status", value: "Pending review" },
      ],
      ctaLabel: "Open Schedule",
      ctaUrl: "./coach-schedule.html",
      noteLabel: "Client Note",
      noteBody: sessionNote,
      tags: [
        { name: "category", value: "schedule" },
        { name: "event", value: "coach_booking_request_alert" },
      ],
    }).catch(() => null);

    await sendNoticeEmail({
      to: adminEmails,
      subject: `Booking request pending: ${clientName}`,
      eyebrow: "Schedule Alert",
      title: "A booking request needs review",
      intro: staffNotificationBody,
      metaRows: [
        { label: "Client", value: clientName },
        { label: "Session Type", value: sessionType },
        { label: "Requested Slot", value: slotLabel },
        { label: "Coach", value: coachId ? coachName : "Unassigned" },
        { label: "Package", value: packageName },
      ],
      ctaLabel: "Open Dashboard",
      ctaUrl: "./admin-dashboard.html",
      noteLabel: "Client Note",
      noteBody: sessionNote,
      tags: [
        { name: "category", value: "schedule" },
        { name: "event", value: "admin_booking_request_alert" },
      ],
    }).catch(() => null);

    return json(200, {
      ok: true,
      requestId: insertedRequest.id,
      message: `Booking request submitted against ${packageName}. It is now waiting for coach or admin confirmation.`,
    });
  } catch (error) {
    return errorResponse(error, "Unable to submit the booking request right now.");
  }
};
