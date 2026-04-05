const { json, methodNotAllowed, noContent, parseJsonBody, errorResponse } = require("./_lib/http");
const { awardCoachXpAction, buildCoachXpSourceRef } = require("./_lib/xp-coach");
const { sendNoticeEmail } = require("./_lib/email");
const { hasCoachSessionConflict } = require("./_lib/coach-availability");
const { cleanText, parseOptionalText } = require("./_lib/validation");
const {
  canManageClientWithProfile,
  getEmailMapForUserIds,
  getAuthenticatedProfile,
  getServiceSupabase,
  notifyRecipients,
} = require("./_lib/supabase");
const {
  deleteGoogleCalendarEvent,
  loadCalendarConnection,
  saveCalendarConnection,
  upsertGoogleCalendarEvent,
} = require("./_lib/google-calendar");

async function loadLinkedPackage(supabase, packageId) {
  if (!packageId) {
    return null;
  }

  const { data, error } = await supabase
    .from("client_packages")
    .select("id, client_id, package_name, sessions_remaining, sessions_purchased, status, expires_at")
    .eq("id", packageId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data || null;
}

async function canManageBookingRequest(supabase, profile, request, linkedPackage) {
  if (await canManageClientWithProfile(supabase, profile, request.client_id)) {
    return true;
  }

  if (profile?.role !== "coach" || !linkedPackage) {
    return false;
  }

  const participantIds = [linkedPackage.client_id].filter(Boolean);
  if (!participantIds.length) {
    return false;
  }

  const { data, error } = await supabase
    .from("coach_client_assignments")
    .select("id")
    .eq("coach_id", profile.id)
    .eq("status", "active")
    .in("client_id", participantIds)
    .limit(1);

  if (error) {
    throw error;
  }

  return Boolean(data?.length);
}

function buildParticipantRecipientIds(requestClientId, linkedPackage) {
  return Array.from(
    new Set(
      [requestClientId, linkedPackage?.client_id].filter(Boolean)
    )
  );
}

function requestTypeFromNotes(notes) {
  const firstPart = String(notes || "")
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean)[0];

  if (!firstPart) {
    return "Coaching Session";
  }

  return firstPart.replace(/^Session type:\s*/iu, "") || "Coaching Session";
}

function toMalaysiaDateTime(dateValue, timeValue) {
  const normalizedTime = String(timeValue || "").trim().match(/^\d{2}:\d{2}(?::\d{2})?/u)?.[0] || "";
  if (!normalizedTime) {
    return new Date(Number.NaN);
  }

  const timeWithSeconds = normalizedTime.length === 5 ? `${normalizedTime}:00` : normalizedTime;
  return new Date(`${dateValue}T${timeWithSeconds}+08:00`);
}

const PREPLANNED_MIN_LEAD_MS = 24 * 60 * 60 * 1000;

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return noContent();
  }

  if (event.httpMethod !== "POST") {
    return methodNotAllowed("POST, OPTIONS");
  }

  try {
    const body = await parseJsonBody(event, { maxBytes: 32 * 1024 });
    const requestId = String(body.requestId || "").trim();
    const action = String(body.action || "").trim().toLowerCase();
    if (!requestId || !["approve", "decline"].includes(action)) {
      return json(400, { error: "requestId and a valid action are required." });
    }
    const reviewerNote = parseOptionalText(body.coachNote, {
      label: "Coach note",
      maxLength: 400,
    });
    const supabase = getServiceSupabase();
    const access = await getAuthenticatedProfile(event, supabase);
    if (!access) {
      return json(401, { error: "A valid staff session is required." });
    }

    if (!["coach", "super_admin"].includes(access.profile.role)) {
      return json(403, { error: "Only coaches or super admins can review booking requests." });
    }

    const { data: request, error: requestError } = await supabase
      .from("booking_requests")
      .select("id, client_id, preferred_coach_id, client_package_id, requested_date, requested_time, notes, status")
      .eq("id", requestId)
      .maybeSingle();

    if (requestError) {
      throw requestError;
    }

    if (!request) {
      return json(404, { error: "Booking request not found." });
    }

    const linkedPackage = await loadLinkedPackage(supabase, request.client_package_id);
    const canManage = await canManageBookingRequest(supabase, access.profile, request, linkedPackage);
    if (!canManage) {
      return json(403, { error: "You cannot review booking requests for this client." });
    }

    if (request.status !== "pending") {
      return json(409, { error: "This booking request has already been reviewed." });
    }

    let assignedPackage = linkedPackage;
    let coachId = "";
    let createdSession = null;
    let resolvedCoachName = cleanText(access.profile.display_name) || "Coach";
    let warning = "";
    const finalStatus = action === "approve" ? "approved" : "declined";

    if (action === "approve") {
      if (!assignedPackage) {
        return json(400, { error: "This booking request is not linked to a client package." });
      }

      if (assignedPackage.client_id !== request.client_id) {
        return json(400, { error: "The linked package does not belong to this client." });
      }

      if (assignedPackage.status !== "active") {
        return json(400, { error: "The linked package is no longer active." });
      }

      if (assignedPackage.expires_at && new Date(assignedPackage.expires_at).getTime() < Date.now()) {
        return json(400, { error: "The linked package has expired and cannot be used for a new session." });
      }

      if (Number(assignedPackage.sessions_remaining || 0) <= 0) {
        return json(400, { error: "The linked package has no remaining sessions available." });
      }

      coachId =
        access.profile.role === "super_admin"
          ? request.preferred_coach_id
          : access.profile.id;

      if (!coachId) {
        return json(400, { error: "This request does not have a coach assigned yet." });
      }

      const sessionStart = toMalaysiaDateTime(request.requested_date, request.requested_time);
      if (Number.isNaN(sessionStart.getTime())) {
        return json(400, { error: "Requested date or time is invalid." });
      }

      const sessionEnd = new Date(sessionStart.getTime() + 60 * 60 * 1000);
      const hasConflict = await hasCoachSessionConflict(
        supabase,
        coachId,
        sessionStart.toISOString(),
        sessionEnd.toISOString()
      );
      if (hasConflict) {
        return json(409, {
          error: "That slot has already been taken by an approved session. Please decline it and ask the client to choose another time.",
        });
      }

      const { data: insertedSession, error: sessionError } = await supabase
        .from("sessions")
        .insert({
          client_id: request.client_id,
          coach_id: coachId,
          client_package_id: assignedPackage.id,
          booking_request_id: request.id,
          scheduled_start: sessionStart.toISOString(),
          scheduled_end: sessionEnd.toISOString(),
          status: "scheduled",
          session_value_rm: 0,
        })
        .select("id, client_id, coach_id, client_package_id, scheduled_start, scheduled_end, google_event_id")
        .single();

      if (sessionError || !insertedSession) {
        throw sessionError || new Error("Unable to create the scheduled session.");
      }

      createdSession = insertedSession;
    }

    if (coachId) {
      const { data: coachProfile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", coachId)
        .maybeSingle();
      resolvedCoachName = cleanText(coachProfile?.display_name) || resolvedCoachName;
    }

    const { error: requestUpdateError } = await supabase
      .from("booking_requests")
      .update({
        status: finalStatus,
        reviewed_by: access.profile.id,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", request.id);

    if (requestUpdateError) {
      if (createdSession?.id) {
        await supabase.from("sessions").delete().eq("id", createdSession.id);
      }
      throw requestUpdateError;
    }

    if (action === "approve" && createdSession) {
      if (coachId && new Date(createdSession.scheduled_start).getTime() - Date.now() >= PREPLANNED_MIN_LEAD_MS) {
        await awardCoachXpAction(supabase, {
          actionId: "PRO-PREP",
          targetProfileId: coachId,
          actorProfileId: access.profile.id,
          eventDate: new Date(),
          sourceRef: buildCoachXpSourceRef("booking-review", request.id, "pro-prep"),
          evidence: createdSession.id,
          notes: "Session booked at least 24 hours ahead.",
        }).catch(() => null);
      }

      try {
        const connection = await loadCalendarConnection(supabase, coachId);
        if (connection?.tokens?.accessToken) {
          const [{ data: clientProfile }, { data: coachProfile }] = await Promise.all([
            supabase.from("profiles").select("display_name").eq("id", request.client_id).maybeSingle(),
            supabase.from("profiles").select("display_name").eq("id", coachId).maybeSingle(),
          ]);

          const { connection: updatedConnection, event: calendarEvent } = await upsertGoogleCalendarEvent(connection, {
            sessionId: createdSession.id,
            clientId: createdSession.client_id,
            clientName: clientProfile?.display_name || "Client",
            coachName: coachProfile?.display_name || "Coach",
            packageName: assignedPackage?.package_name || "",
            scheduledStart: createdSession.scheduled_start,
            scheduledEnd: createdSession.scheduled_end,
            googleEventId: createdSession.google_event_id || "",
          });

          try {
            await saveCalendarConnection(supabase, coachId, updatedConnection, coachId);

            if (calendarEvent?.id) {
              const { error: googleEventUpdateError } = await supabase
                .from("sessions")
                .update({
                  google_event_id: calendarEvent.id,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", createdSession.id);

              if (googleEventUpdateError) {
                throw googleEventUpdateError;
              }
            }
          } catch (calendarPersistenceError) {
            if (calendarEvent?.id && !createdSession.google_event_id) {
              await deleteGoogleCalendarEvent(updatedConnection, calendarEvent.id).catch(() => null);
            }
            throw calendarPersistenceError;
          }
        }
      } catch (calendarError) {
        warning = calendarError?.message || "Session created, but Google Calendar could not be updated.";
      }
    }

    const notificationTitle = action === "approve" ? "Booking Approved" : "Booking Declined";
    const notificationBody =
      action === "approve"
        ? `${resolvedCoachName} approved your ${requestTypeFromNotes(request.notes)} request on ${request.requested_date} at ${request.requested_time}.`
        : `${resolvedCoachName} declined your ${requestTypeFromNotes(request.notes)} request on ${request.requested_date} at ${request.requested_time}. Please choose another slot.`;
    const notificationBodyWithNote = reviewerNote
      ? `${notificationBody} Coach note: ${reviewerNote}`
      : notificationBody;

    await notifyRecipients(
      supabase,
      buildParticipantRecipientIds(request.client_id, assignedPackage).map((recipientId) => ({
        recipient_id: recipientId,
        category: "schedule",
        title: notificationTitle,
        body: notificationBodyWithNote,
        action_url: "./client-schedule.html",
      }))
    ).catch(() => null);

    const recipientIds = buildParticipantRecipientIds(request.client_id, assignedPackage);
    const emailMap = await getEmailMapForUserIds(supabase, recipientIds).catch(() => new Map());
    const scheduleRecipients = recipientIds.map((recipientId) => emailMap.get(recipientId) || "").filter(Boolean);

    await sendNoticeEmail({
      to: scheduleRecipients,
      subject: notificationTitle,
      eyebrow: "Schedule Update",
      title: notificationTitle,
      intro: notificationBody,
      metaRows: [
        { label: "Session Type", value: requestTypeFromNotes(request.notes) },
        { label: "Date", value: request.requested_date },
        { label: "Time", value: request.requested_time },
        { label: "Coach", value: resolvedCoachName },
        { label: "Status", value: action === "approve" ? "Approved" : "Declined" },
      ],
      ctaLabel: "Open Schedule",
      ctaUrl: "./client-schedule.html",
      noteLabel: "Coach Note",
      noteBody: reviewerNote,
      tags: [
        { name: "category", value: "schedule" },
        { name: "event", value: "booking_reviewed" },
      ],
    }).catch(() => null);

    return json(200, {
      ok: true,
      status: action === "approve" ? "approved" : "declined",
      warning,
    });
  } catch (error) {
    return errorResponse(error, "Unable to review the booking request right now.");
  }
};
