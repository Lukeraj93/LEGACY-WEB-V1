const { json, methodNotAllowed, noContent } = require("./_lib/http");
const { deleteCalendarConnection, loadCalendarConnection, revokeGoogleToken } = require("./_lib/google-calendar");
const { getAuthenticatedProfile, getServiceSupabase } = require("./_lib/supabase");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return noContent();
  }

  if (event.httpMethod !== "POST") {
    return methodNotAllowed("POST, OPTIONS");
  }

  try {
    const supabase = getServiceSupabase();
    const access = await getAuthenticatedProfile(event, supabase);
    if (!access) {
      return json(401, { error: "A valid coach session is required." });
    }

    if (access.profile.role !== "coach" && access.profile.role !== "super_admin") {
      return json(403, { error: "Only coach accounts can disconnect Google Calendar." });
    }

    const connection = await loadCalendarConnection(supabase, access.profile.id).catch(() => null);
    const revokeToken = connection?.tokens?.refreshToken || connection?.tokens?.accessToken || "";

    await deleteCalendarConnection(supabase, access.profile.id);

    const { error: coachProfileError } = await supabase
      .from("coach_profiles")
      .update({
        google_calendar_email: null,
        calendar_sync_enabled: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", access.profile.id);

    if (coachProfileError) {
      throw coachProfileError;
    }

    await revokeGoogleToken(revokeToken);

    return json(200, { ok: true });
  } catch (error) {
    return json(500, { error: error?.message || "Unable to disconnect Google Calendar." });
  }
};
