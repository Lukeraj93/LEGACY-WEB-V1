const { json, methodNotAllowed, noContent } = require("./_lib/http");
const { getAuthenticatedUser, getServiceSupabase } = require("./_lib/supabase");

function parseBody(event) {
  try {
    return JSON.parse(event.body || "{}");
  } catch (_) {
    return null;
  }
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

  const notificationIds = Array.from(
    new Set(
      (Array.isArray(body.ids) ? body.ids : [])
        .map((id) => String(id || "").trim())
        .filter(Boolean)
    )
  );

  if (!notificationIds.length) {
    return json(200, { ok: true, readIds: [] });
  }

  try {
    const supabase = getServiceSupabase();
    const user = await getAuthenticatedUser(event, supabase);
    if (!user) {
      return json(401, { error: "A valid signed-in session is required." });
    }

    const { data, error } = await supabase
      .from("notifications")
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq("recipient_id", user.id)
      .eq("is_read", false)
      .in("id", notificationIds)
      .select("id");

    if (error) {
      throw error;
    }

    return json(200, {
      ok: true,
      readIds: (data || []).map((row) => row.id),
    });
  } catch (error) {
    return json(500, {
      error: error?.message || "Unable to mark notifications as read.",
    });
  }
};
