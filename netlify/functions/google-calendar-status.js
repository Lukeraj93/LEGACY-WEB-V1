const { json, methodNotAllowed, noContent } = require("./_lib/http");
const { isGoogleCalendarConfigured, loadCalendarConnection } = require("./_lib/google-calendar");
const { getAuthenticatedProfile, getServiceSupabase } = require("./_lib/supabase");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return noContent();
  }

  if (event.httpMethod !== "GET") {
    return methodNotAllowed("GET, OPTIONS");
  }

  try {
    const supabase = getServiceSupabase();
    const access = await getAuthenticatedProfile(event, supabase);
    if (!access) {
      return json(401, { error: "A valid coach session is required." });
    }

    if (access.profile.role !== "coach" && access.profile.role !== "super_admin") {
      return json(403, { error: "Only coach accounts can view Google Calendar sync status." });
    }

    const { data: coachProfile } = await supabase
      .from("coach_profiles")
      .select("google_calendar_email, calendar_sync_enabled")
      .eq("id", access.profile.id)
      .maybeSingle();
    const connection = await loadCalendarConnection(supabase, access.profile.id);

    return json(200, {
      configured: isGoogleCalendarConfigured(),
      connected: Boolean(connection?.tokens?.accessToken || coachProfile?.calendar_sync_enabled),
      calendarEmail: connection?.email || coachProfile?.google_calendar_email || null,
      calendarId: connection?.calendarId || null,
      connectedAt: connection?.connectedAt || null,
      lastSyncedAt: connection?.refreshedAt || null,
    });
  } catch (error) {
    return json(500, { error: error?.message || "Unable to load Google Calendar status." });
  }
};
