const { json, methodNotAllowed, noContent } = require("./_lib/http");
const {
  createHttpError,
  normalizeText,
  parseBody,
  requireAllowedRole,
  requireManagedClientAccess,
} = require("./_lib/planner");
const { getAuthenticatedProfile, getServiceSupabase, notifyRecipients } = require("./_lib/supabase");

const NUDGE_CONFIG = {
  nutrition: {
    title: "Coach nutrition follow-up",
    body: "Your coach wants a fresh nutrition update. Log your meals in the Nutrition tab so the next adjustment stays accurate.",
    actionUrl: "/client-planner.html?tab=nutrition",
  },
  checkin: {
    title: "Coach health check-in reminder",
    body: "Your health update is due. Submit your check-in so your coach can keep the plan moving without guesswork.",
    actionUrl: "/client-planner.html?tab=checkins",
  },
  training: {
    title: "Coach training rhythm prompt",
    body: "Your coach wants your training rhythm back on track. Open the planner and log your latest session.",
    actionUrl: "/client-planner.html?tab=training",
  },
  progress_photo: {
    title: "Coach progress photo request",
    body: "Your coach needs an updated progress photo set to review body-composition and planning accuracy.",
    actionUrl: "/client-planner.html?tab=progress",
  },
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return noContent({ "Cache-Control": "no-store" });
  }

  if (event.httpMethod !== "POST") {
    return methodNotAllowed("POST, OPTIONS");
  }

  const body = parseBody(event);
  if (!body) {
    return json(400, { error: "Provide a valid JSON body." });
  }

  const supabase = getServiceSupabase();
  const auth = await getAuthenticatedProfile(event, supabase);
  if (!auth?.profile) {
    return json(401, { error: "A valid authenticated session is required." });
  }

  try {
    requireAllowedRole(auth.profile, ["coach", "super_admin"]);

    const clientIds = Array.from(
      new Set(
        (Array.isArray(body.clientIds) ? body.clientIds : [])
          .map((value) => normalizeText(value))
          .filter(Boolean)
      )
    );

    if (!clientIds.length) {
      throw createHttpError(400, "Select at least one client before sending a roster nudge.");
    }

    const category = normalizeText(body.category).toLowerCase() || "nutrition";
    const config = NUDGE_CONFIG[category] || NUDGE_CONFIG.nutrition;
    const customMessage = normalizeText(body.message);

    for (const clientId of clientIds) {
      await requireManagedClientAccess(supabase, auth.profile, clientId);
    }

    const rows = clientIds.map((clientId) => ({
      recipient_id: clientId,
      category: "planner",
      title: config.title,
      body: customMessage || config.body,
      action_url: config.actionUrl,
    }));

    await notifyRecipients(supabase, rows);

    return json(200, {
      ok: true,
      count: rows.length,
      message: `Coach nudge sent to ${rows.length} client${rows.length === 1 ? "" : "s"}.`,
    });
  } catch (error) {
    return json(Number(error?.statusCode || 500), {
      error: error?.message || "Unable to send planner nudges right now.",
    });
  }
};
