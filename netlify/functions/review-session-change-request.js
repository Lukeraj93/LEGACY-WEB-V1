const { json, methodNotAllowed, noContent } = require("./_lib/http");
const { awardCoachXpAction, buildCoachXpSourceRef } = require("./_lib/xp-coach");
const { sendNoticeEmail } = require("./_lib/email");
const { hasCoachSessionConflict } = require("./_lib/coach-availability");
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

function parseBody(event) {
  try {
    return JSON.parse(event.body || "{}");
  } catch (_) {
    return null;
  }
}

async function loadLinkedPackage(supabase, packageId) {
  if (!packageId) {
    return null;
  }

  const { data, error } = await supabase
    .from("client_packages")
    .select("id, client_id, package_name")
    .eq("id", packageId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data || null;
}

async function canManageSessionChange(supabase, profile, changeRequest, linkedPackage) {
  if (await canManageClientWithProfile(supabase, profile, changeRequest.client_id)) {
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

function buildParticipantRecipientIds(clientId, linkedPackage) {
  return Array.from(
    new Set(
      [clientId, linkedPackage?.client_id].filter(Boolean)
    )
  );
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

  const requestId = String(body.requestId || "").trim();
  const action = String(body.action || "").trim().toLowerCase();
  if (!requestId || !["approve", "decline"].includes(action)) {
    return json(400, { error: "requestId and a valid action are required." });
  }

  try {
    const supabase = getServiceSupabase();
    const access = await getAuthenticatedProfile(event, supabase);
    if (!access) {
      return json(401, { error: "A valid staff session is required." });
    }

    if (!["coach", "super_admin"].includes(access.profile.role)) {
      return json(403, { error: "Only coaches or super admins can review session change requests." });
    }

    const { data: changeRequest, error: changeRequestError } = await supabase
      .from("session_change_requests")
      .select(
        "id, session_id, client_id, coach_id, request_type, requested_start, requested_end, reason, status, original_start, original_end"
      )
      .eq("id", requestId)
      .maybeSingle();

    if (changeRequestError) {
      throw changeRequestError;
    }

    if (!changeRequest) {
      return json(404, { error: "Session change request not found." });
    }

    const { data: sessionRecord, error: sessionError } = await supabase
      .from("sessions")
      .select("id, client_id, coach_id, client_package_id, scheduled_start, scheduled_end, status, google_event_id")
      .eq("id", changeRequest.session_id)
      .maybeSingle();

    if (sessionError) {
      throw sessionError;
    }

    if (!sessionRecord) {
      return json(404, { error: "The linked session no longer exists." });
    }

    const linkedPackage = await loadLinkedPackage(supabase, sessionRecord.client_package_id);
    const canManage = await canManageSessionChange(supabase, access.profile, changeRequest, linkedPackage);
    if (!canManage) {
      return json(403, { error: "You cannot review change requests for this client." });
    }

    if (changeRequest.status !== "pending") {
      return json(409, { error: "This session change request has already been reviewed." });
    }

    if (sessionRecord.status !== "scheduled") {
      return json(400, { error: "Only scheduled sessions can be rescheduled or cancelled." });
    }

    const finalStatus = action === "approve" ? "approved" : "declined";
    let warning = "";

    if (action === "approve" && changeRequest.request_type === "reschedule") {
      const hasConflict = await hasCoachSessionConflict(
        supabase,
        sessionRecord.coach_id,
        changeRequest.requested_start,
        changeRequest.requested_end,
        { excludeSessionId: sessionRecord.id }
      );
      if (hasConflict) {
        return json(409, {
          error: "That requested slot has already been taken by another approved session.",
        });
      }

      const { error: sessionUpdateError } = await supabase
        .from("sessions")
        .update({
          scheduled_start: changeRequest.requested_start,
          scheduled_end: changeRequest.requested_end,
          updated_at: new Date().toISOString(),
        })
        .eq("id", sessionRecord.id);

      if (sessionUpdateError) {
        throw sessionUpdateError;
      }
    }

    if (action === "approve" && changeRequest.request_type === "cancel") {
      const { error: sessionCancelError } = await supabase
        .from("sessions")
        .update({
          status: "cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("id", sessionRecord.id);

      if (sessionCancelError) {
        throw sessionCancelError;
      }
    }

    const { error: requestUpdateError } = await supabase
      .from("session_change_requests")
      .update({
        status: finalStatus,
        reviewed_by: access.profile.id,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", changeRequest.id);

    if (requestUpdateError) {
      if (action === "approve" && changeRequest.request_type === "reschedule") {
        await supabase
          .from("sessions")
          .update({
            scheduled_start: sessionRecord.scheduled_start,
            scheduled_end: sessionRecord.scheduled_end,
            updated_at: new Date().toISOString(),
          })
          .eq("id", sessionRecord.id);
      }

      if (action === "approve" && changeRequest.request_type === "cancel") {
        await supabase
          .from("sessions")
          .update({
            status: sessionRecord.status,
            updated_at: new Date().toISOString(),
          })
          .eq("id", sessionRecord.id);
      }

      throw requestUpdateError;
    }

    if (action === "approve" && changeRequest.request_type === "reschedule") {
      await awardCoachXpAction(supabase, {
        actionId: "COA-ADJ",
        targetProfileId: sessionRecord.coach_id,
        actorProfileId: access.profile.id,
        eventDate: new Date(),
        sourceRef: buildCoachXpSourceRef("session-change", changeRequest.id, "coa-adj"),
        evidence: sessionRecord.id,
        notes: "Approved a session reschedule adjustment.",
      }).catch(() => null);

      try {
        const connection = await loadCalendarConnection(supabase, sessionRecord.coach_id);
        if (connection?.tokens?.accessToken) {
          const [{ data: clientProfile }, { data: coachProfile }] = await Promise.all([
            supabase.from("profiles").select("display_name").eq("id", sessionRecord.client_id).maybeSingle(),
            supabase.from("profiles").select("display_name").eq("id", sessionRecord.coach_id).maybeSingle(),
          ]);

          const { connection: updatedConnection, event: calendarEvent } = await upsertGoogleCalendarEvent(connection, {
            sessionId: sessionRecord.id,
            clientId: sessionRecord.client_id,
            clientName: clientProfile?.display_name || "Client",
            coachName: coachProfile?.display_name || "Coach",
            packageName: linkedPackage?.package_name || "",
            scheduledStart: changeRequest.requested_start,
            scheduledEnd: changeRequest.requested_end,
            googleEventId: sessionRecord.google_event_id || "",
          });

          try {
            await saveCalendarConnection(supabase, sessionRecord.coach_id, updatedConnection, access.profile.id);

            if (calendarEvent?.id && calendarEvent.id !== sessionRecord.google_event_id) {
              const { error: googleEventUpdateError } = await supabase
                .from("sessions")
                .update({
                  google_event_id: calendarEvent.id,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", sessionRecord.id);

              if (googleEventUpdateError) {
                throw googleEventUpdateError;
              }
            }
          } catch (calendarPersistenceError) {
            if (calendarEvent?.id && !sessionRecord.google_event_id) {
              await deleteGoogleCalendarEvent(updatedConnection, calendarEvent.id).catch(() => null);
            }
            throw calendarPersistenceError;
          }
        }
      } catch (calendarError) {
        warning = calendarError?.message || "Session rescheduled, but Google Calendar could not be updated.";
      }
    }

    if (action === "approve" && changeRequest.request_type === "cancel") {
      try {
        const connection = await loadCalendarConnection(supabase, sessionRecord.coach_id);
        if (sessionRecord.google_event_id) {
          if (!connection?.tokens?.accessToken) {
            throw new Error("Calendar access is unavailable, so the scheduled Google event could not be removed.");
          }

          const { connection: updatedConnection } = await deleteGoogleCalendarEvent(connection, sessionRecord.google_event_id);
          await saveCalendarConnection(supabase, sessionRecord.coach_id, updatedConnection, access.profile.id);

          const { error: clearGoogleEventError } = await supabase
            .from("sessions")
            .update({
              google_event_id: null,
              updated_at: new Date().toISOString(),
            })
            .eq("id", sessionRecord.id);

          if (clearGoogleEventError) {
            throw clearGoogleEventError;
          }
        }
      } catch (calendarError) {
        warning = calendarError?.message || "Session cancelled, but Google Calendar could not be updated.";
      }
    }

    const notificationTitle = finalStatus === "approved" ? "Session Change Approved" : "Session Change Declined";
    const notificationBody =
      finalStatus === "approved"
        ? changeRequest.request_type === "cancel"
          ? "Your session cancellation request has been approved."
          : "Your session reschedule request has been approved."
        : changeRequest.request_type === "cancel"
          ? "Your session cancellation request was declined."
          : "Your session reschedule request was declined.";

    await notifyRecipients(
      supabase,
      buildParticipantRecipientIds(changeRequest.client_id, linkedPackage).map((recipientId) => ({
        recipient_id: recipientId,
        category: "schedule",
        title: notificationTitle,
        body: notificationBody,
        action_url: "./client-schedule.html",
      }))
    ).catch(() => null);

    const recipientIds = buildParticipantRecipientIds(changeRequest.client_id, linkedPackage);
    const emailMap = await getEmailMapForUserIds(supabase, recipientIds).catch(() => new Map());
    const scheduleRecipients = recipientIds.map((recipientId) => emailMap.get(recipientId) || "").filter(Boolean);

    await sendNoticeEmail({
      to: scheduleRecipients,
      subject: notificationTitle,
      eyebrow: "Schedule Change",
      title: notificationTitle,
      intro: notificationBody,
      metaRows: [
        { label: "Request Type", value: changeRequest.request_type === "cancel" ? "Cancellation" : "Reschedule" },
        {
          label: "Requested Slot",
          value:
            changeRequest.request_type === "cancel"
              ? `${changeRequest.original_start || "Current session"}`
              : `${changeRequest.requested_start || ""}`,
        },
        { label: "Status", value: finalStatus === "approved" ? "Approved" : "Declined" },
      ],
      ctaLabel: "Open Schedule",
      ctaUrl: "./client-schedule.html",
      tags: [
        { name: "category", value: "schedule" },
        { name: "event", value: "session_change_reviewed" },
      ],
    }).catch(() => null);

    return json(200, {
      ok: true,
      status: finalStatus,
      warning,
    });
  } catch (error) {
    return json(500, { error: error?.message || "Unable to review the session change request." });
  }
};
