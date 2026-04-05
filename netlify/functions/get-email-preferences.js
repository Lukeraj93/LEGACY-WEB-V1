const { json, methodNotAllowed, noContent } = require("./_lib/http");
const { getServiceSupabase } = require("./_lib/supabase");
const {
  buildDefaultEmailPreferences,
  normalizeEmail,
  preferenceKeyForEmail,
  verifyEmailPreferencesToken,
} = require("./_lib/email-preferences");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return noContent();
  }

  if (event.httpMethod !== "GET") {
    return methodNotAllowed("GET, OPTIONS");
  }

  const query = event.queryStringParameters || {};
  const email = normalizeEmail(query.email);
  const token = String(query.token || "").trim();

  if (!email || !token) {
    return json(400, { error: "Email preferences link is incomplete." });
  }

  if (!verifyEmailPreferencesToken(email, token)) {
    return json(401, { error: "Email preferences link is invalid or has expired." });
  }

  try {
    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", preferenceKeyForEmail(email))
      .maybeSingle();

    if (error) {
      throw error;
    }

    return json(200, {
      ok: true,
      email,
      preferences: {
        ...buildDefaultEmailPreferences(),
        ...(data?.value || {}),
      },
      options: [
        {
          value: "all",
          label: "Receive all LEGACY+ emails",
          description: "Account updates, coaching information, finance emails, and optional announcements.",
        },
        {
          value: "essential_only",
          label: "Essential emails only",
          description: "Keep booking, billing, account, and service emails. Pause optional updates.",
        },
        {
          value: "pause_optional",
          label: "Pause non-essential emails",
          description: "Stop optional updates and keep only emails required to support your account and purchases.",
        },
      ],
    });
  } catch (error) {
    return json(500, {
      error: error?.message || "Unable to load email preferences right now.",
    });
  }
};
