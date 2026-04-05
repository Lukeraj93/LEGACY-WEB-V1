const { json, methodNotAllowed, noContent } = require("./_lib/http");
const { getServiceSupabase } = require("./_lib/supabase");
const {
  buildDefaultEmailPreferences,
  normalizeEmail,
  normalizeEmailPreferenceMode,
  preferenceKeyForEmail,
  verifyEmailPreferencesToken,
} = require("./_lib/email-preferences");

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

  const email = normalizeEmail(body.email);
  const token = String(body.token || "").trim();
  const mode = normalizeEmailPreferenceMode(body.mode);

  if (!email || !token) {
    return json(400, { error: "Email preferences link is incomplete." });
  }

  if (!verifyEmailPreferencesToken(email, token)) {
    return json(401, { error: "Email preferences link is invalid or has expired." });
  }

  try {
    const supabase = getServiceSupabase();
    const payload = {
      ...buildDefaultEmailPreferences(),
      mode,
      updatedAt: new Date().toISOString(),
    };

    const { error } = await supabase.from("app_settings").upsert(
      {
        key: preferenceKeyForEmail(email),
        value: payload,
        updated_at: payload.updatedAt,
      },
      { onConflict: "key" }
    );

    if (error) {
      throw error;
    }

    return json(200, {
      ok: true,
      email,
      preferences: payload,
      message: mode === "all"
        ? "All LEGACY+ emails are enabled."
        : "Your email preferences were updated.",
    });
  } catch (error) {
    return json(500, {
      error: error?.message || "Unable to save email preferences right now.",
    });
  }
};
