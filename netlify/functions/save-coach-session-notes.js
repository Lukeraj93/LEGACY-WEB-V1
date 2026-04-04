const { json, methodNotAllowed, noContent } = require("./_lib/http");
const {
  buildCoachXpSourceRef,
  awardCoachXpAction,
  runCoachWeeklyComplianceAudits,
  shouldAwardCoachSessionNote,
} = require("./_lib/xp-coach");
const { canManageClientWithProfile, getAuthenticatedProfile, getServiceSupabase } = require("./_lib/supabase");

function parseBody(event) {
  try {
    return JSON.parse(event.body || "{}");
  } catch (_) {
    return null;
  }
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return noContent({ "Cache-Control": "no-store" });
  }

  if (event.httpMethod !== "POST") {
    return methodNotAllowed("POST, OPTIONS");
  }

  const body = parseBody(event);
  if (!body) {
    return json(400, { error: "Request body must be valid JSON." }, { "Cache-Control": "no-store" });
  }

  const sessionId = String(body.sessionId || body.session_id || "").trim();
  const coachNote = String(body.coachNote || body.coach_note || "").trim();
  const nextStep = String(body.nextStep || body.next_step || "").trim();
  if (!sessionId) {
    return json(400, { error: "A session ID is required." }, { "Cache-Control": "no-store" });
  }
  if (!coachNote || !nextStep) {
    return json(400, { error: "Session notes and the next step are required." }, { "Cache-Control": "no-store" });
  }

  try {
    const supabase = getServiceSupabase();
    const access = await getAuthenticatedProfile(event, supabase);
    if (!access?.profile) {
      return json(401, { error: "A valid staff session is required." }, { "Cache-Control": "no-store" });
    }

    if (!["coach", "super_admin"].includes(access.profile.role)) {
      return json(403, { error: "Only coaches or super admins can save session notes." }, { "Cache-Control": "no-store" });
    }

    const sessionResponse = await supabase
      .from("sessions")
      .select("id, client_id, coach_id, status, scheduled_start, scheduled_end, completed_at, coach_check_in_at, coach_check_in_by, coach_attendance_status, coach_note, coach_next_step, coach_note_recorded_at, coach_note_recorded_by")
      .eq("id", sessionId)
      .maybeSingle();

    if (sessionResponse.error) {
      throw sessionResponse.error;
    }

    const session = sessionResponse.data || null;
    if (!session?.id) {
      return json(404, { error: "Session not found." }, { "Cache-Control": "no-store" });
    }

    const canManage =
      access.profile.role === "super_admin"
      || session.coach_id === access.profile.id
      || (await canManageClientWithProfile(supabase, access.profile, session.client_id));

    if (!canManage) {
      return json(403, { error: "You cannot save notes for this session." }, { "Cache-Control": "no-store" });
    }

    if (session.status !== "completed") {
      return json(409, { error: "Session notes can only be saved after the session is completed." }, { "Cache-Control": "no-store" });
    }

    const noteRecordedAt = new Date().toISOString();
    const updateResponse = await supabase
      .from("sessions")
      .update({
        coach_note: coachNote,
        coach_next_step: nextStep,
        coach_note_recorded_at: noteRecordedAt,
        coach_note_recorded_by: access.profile.id,
        updated_at: noteRecordedAt,
      })
      .eq("id", session.id)
      .select("id, client_id, coach_id, client_package_id, status, scheduled_start, scheduled_end, completed_at, session_value_rm, coach_check_in_at, coach_check_in_by, coach_attendance_status, coach_note, coach_next_step, coach_note_recorded_at, coach_note_recorded_by")
      .single();

    if (updateResponse.error) {
      throw updateResponse.error;
    }

    const updatedSession = updateResponse.data;
    const noteXpResult = shouldAwardCoachSessionNote({
      completedAt: updatedSession.completed_at,
      scheduledEnd: updatedSession.scheduled_end,
      noteRecordedAt: updatedSession.coach_note_recorded_at || noteRecordedAt,
      coachNote: updatedSession.coach_note,
      nextStep: updatedSession.coach_next_step,
    })
      ? await awardCoachXpAction(supabase, {
          actionId: "COA-NOTE",
          targetProfileId: updatedSession.coach_id,
          actorProfileId: access.profile.id,
          eventDate: updatedSession.coach_note_recorded_at || noteRecordedAt,
          sourceRef: buildCoachXpSourceRef("session-note", updatedSession.id, "coa-note"),
          evidence: updatedSession.id,
          notes: "Session notes and next step recorded within 24 hours.",
        }).catch(() => ({ created: false, skipped: true, reason: "Coach note XP award failed." }))
      : { created: false, skipped: true, reason: "Session note reward window not met." };

    const weeklyAuditResult = await runCoachWeeklyComplianceAudits(supabase, {
      coachProfileId: updatedSession.coach_id,
      actorProfileId: access.profile.id,
      referenceDate: noteRecordedAt,
    }).catch(() => ({
      executed: false,
      attendance: [],
      documentation: [],
    }));

    return json(200, {
      ok: true,
      session: updatedSession,
      coachNoteXp: noteXpResult,
      weeklyAudits: weeklyAuditResult,
      message: "Session notes saved.",
    }, { "Cache-Control": "no-store" });
  } catch (error) {
    return json(Number(error?.statusCode || 500), {
      error: error?.message || "Unable to save the session notes right now.",
    }, { "Cache-Control": "no-store" });
  }
};
