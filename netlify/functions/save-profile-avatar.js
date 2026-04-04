const { json, methodNotAllowed, noContent } = require("./_lib/http");
const { getAuthenticatedProfile, getServiceSupabase } = require("./_lib/supabase");

function normalizeAvatarUrl(value) {
  const normalized = String(value || "").trim();
  return normalized
    .replace(/\\/gu, "/")
    .replace(/CRM pictures/gu, "CRM Pictures")
    .replace(/deploy-placeholders/gu, "deploy-placeholders")
    .replace(/ /gu, "%20");
}

const LOCAL_AVATAR_PATH_PREFIXES = [
  "./assets/CRM%20Pictures/",
  "./assets/deploy-placeholders/crm-avatars/",
];
const ALLOWED_LOCAL_AVATAR_PATTERN = /^\.\/assets\/(?:CRM(?:%20| )Pictures|deploy-placeholders\/crm-avatars)\/.+\.(?:png|jpe?g|webp|svg)$/iu;

function isAllowedAvatarUrl(avatarUrl) {
  if (!avatarUrl) {
    return false;
  }

  if (!LOCAL_AVATAR_PATH_PREFIXES.some((prefix) => avatarUrl.startsWith(prefix)) || avatarUrl.includes("..")) {
    return false;
  }

  return ALLOWED_LOCAL_AVATAR_PATTERN.test(avatarUrl);
}

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

  const avatarUrl = normalizeAvatarUrl(body.avatarUrl);
  if (!isAllowedAvatarUrl(avatarUrl)) {
    return json(400, { error: "Selected portrait is not allowed." });
  }

  try {
    const supabase = getServiceSupabase();
    const auth = await getAuthenticatedProfile(event, supabase);
    if (!auth?.profile?.id) {
      return json(401, { error: "A valid signed-in session is required." });
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        avatar_url: avatarUrl,
      })
      .eq("id", auth.profile.id);

    if (error) {
      throw error;
    }

    return json(200, {
      ok: true,
      avatarUrl,
    });
  } catch (error) {
    return json(500, {
      error: error?.message || "Unable to save the selected portrait.",
    });
  }
};
