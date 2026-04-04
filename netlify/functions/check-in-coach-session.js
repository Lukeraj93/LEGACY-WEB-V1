const { json, methodNotAllowed, noContent } = require("./_lib/http");
const {
  canCoachCheckInNow,
  deriveCoachAttendanceStatus,
  getCoachSessionCheckInOpensAt,
  runCoachWeeklyComplianceAudits,
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
  if (!sessionId) {
    return json(400, { error: "A session ID is required." }, { "Cache-Control": "no-store" });
  }

  try {
    const supabase = getServiceSupabase();
    const access = await getAuthenticatedProfile(event, supabase);
    if (!access?.profile) {
      return json(401, { error: "A valid staff session is required." }, { "Cache-Control": "no-store" });
    }

    if (!["coach", "super_admin"].includes(access.profile.role)) {
      return json(403, { error: "Only coaches or super admins can check into sessions." }, { "Cache-Control": "no-store" });
    }

    const sessionResponse = await supabase
      .from("sessions")
      .select("id, client_id, coach_id, status, scheduled_start, scheduled_end, completed_at, coach_check_in_at, coach_check_in_by, coach_attendance_status")
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
      return json(403, { error: "You cannot check into this session." }, { "Cache-Control": "no-store" });
    }

    if (session.status !== "scheduled") {
      return json(409, { error: "Only scheduled sessions can be checked in." }, { "Cache-Control": "no-store" });
    }

    if (session.coach_check_in_at) {
      return json(200, {
        ok: true,
        session,
        message: "Session already checked in.",
      }, { "Cache-Control": "no-store" });
    }

    const now = new Date();
    if (!canCoachCheckInNow({ scheduledStart: session.scheduled_start, now })) {
      const opensAt = getCoachSessionCheckInOpensAt(session.scheduled_start);
      return json(409, {
        error: opensAt
          ? `Check-in opens at ${opensAt.toISOString()}.`
          : "Check-in is not available for this session yet.",
      }, { "Cache-Control": "no-store" });
    }

    const checkedInAt = now.toISOString();
    const attendanceStatus = deriveCoachAttendanceStatus({
      scheduledStart: session.scheduled_start,
      checkedInAt,
    });

    const updateResponse = await supabase
      .from("sessions")
      .update({
        coach_check_in_at: checkedInAt,
        coach_check_in_by: access.profile.id,
        coach_attendance_status: attendanceStatus,
        updated_at: checkedInAt,
      })
      .eq("id", session.id)
      .select("id, client_id, coach_id, client_package_id, booking_request_id, status, scheduled_start, scheduled_end, completed_at, session_value_rm, coach_check_in_at, coach_check_in_by, coach_attendance_status, coach_note, coach_next_step, coach_note_recorded_at, coach_note_recorded_by")
      .single();

    if (updateResponse.error) {
      throw updateResponse.error;
    }

    const updatedSession = updateResponse.data || session;
    const weeklyAuditResult = await runCoachWeeklyComplianceAudits(supabase, {
      coachProfileId: updatedSession.coach_id,
      actorProfileId: access.profile.id,
      referenceDate: checkedInAt,
    }).catch(() => ({
      executed: false,
      attendance: [],
      documentation: [],
    }));

    return json(200, {
      ok: true,
      session: updatedSession,
      weeklyAudits: weeklyAuditResult,
      message: attendanceStatus === "on_time" ? "Checked in on time." : "Checked in late.",
    }, { "Cache-Control": "no-store" });
  } catch (error) {
    return json(Number(error?.statusCode || 500), {
      error: error?.message || "Unable to check into the session right now.",
    }, { "Cache-Control": "no-store" });
  }
};
