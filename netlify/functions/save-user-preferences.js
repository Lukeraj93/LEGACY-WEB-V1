const { json, methodNotAllowed, noContent } = require("./_lib/http");
const { getAuthenticatedUser, getServiceSupabase } = require("./_lib/supabase");
const {
  sanitizeCoachAutomationRules,
  sanitizeCoachOpsSegments,
} = require("./_lib/coach-ops");

const ALLOWED_BACKGROUND_IDS = new Set([
  "forge-floor",
  "progress-wall",
  "coach-client",
  "coach-support",
  "gym-floor",
  "mascot-lounge",
]);

const ALLOWED_COACH_PALETTE_IDS = new Set([
  "ember-forge",
  "vault-gold",
  "sea-current",
  "neon-orchid",
  "solar-flare",
  "cobalt-strike",
  "crimson-iron",
  "jade-pulse",
  "lunar-ice",
  "rose-noir",
  // Legacy aliases kept for backward compatibility.
  "luke",
  "ariff",
  "kylie",
  "jenita",
  "shobana",
]);

function sanitizeCharacterName(value) {
  return String(value || "")
    .replace(/\s+/gu, " ")
    .trim()
    .slice(0, 64);
}

function sanitizeCharacterBackstory(value) {
  return String(value || "")
    .replace(/\r\n/gu, "\n")
    .replace(/\r/gu, "\n")
    .trim()
    .slice(0, 1400);
}

function parseBody(event) {
  try {
    return JSON.parse(event.body || "{}");
  } catch (_) {
    return null;
  }
}

function preferenceKeyForUser(userId) {
  return `user-preferences:${userId}`;
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

  const patch = {};
  if (Object.prototype.hasOwnProperty.call(body, "backgroundId")) {
    const backgroundId = String(body.backgroundId || "").trim();
    if (!ALLOWED_BACKGROUND_IDS.has(backgroundId)) {
      return json(400, { error: "Selected background is not allowed." });
    }
    patch.backgroundId = backgroundId;
  }

  if (Object.prototype.hasOwnProperty.call(body, "coachPaletteId")) {
    const coachPaletteId = String(body.coachPaletteId || "").trim().toLowerCase();
    if (coachPaletteId && !ALLOWED_COACH_PALETTE_IDS.has(coachPaletteId)) {
      return json(400, { error: "Selected coach palette is not allowed." });
    }
    patch.coachPaletteId = coachPaletteId;
  }

  if (Object.prototype.hasOwnProperty.call(body, "characterProfile")) {
    const rawProfile = body.characterProfile && typeof body.characterProfile === "object" ? body.characterProfile : {};
    const name = sanitizeCharacterName(rawProfile.name);
    const backstory = sanitizeCharacterBackstory(rawProfile.backstory);

    if (name || backstory) {
      patch.characterProfile = { name, backstory };
    } else {
      patch.characterProfile = {};
    }
  }

  if (Object.prototype.hasOwnProperty.call(body, "coachOpsSegments")) {
    patch.coachOpsSegments = sanitizeCoachOpsSegments(body.coachOpsSegments);
  }

  if (Object.prototype.hasOwnProperty.call(body, "coachAutomationRules")) {
    const baseSegments = Object.prototype.hasOwnProperty.call(patch, "coachOpsSegments")
      ? patch.coachOpsSegments
      : sanitizeCoachOpsSegments([]);
    patch.coachAutomationRules = sanitizeCoachAutomationRules(body.coachAutomationRules, baseSegments);
  }

  if (Object.prototype.hasOwnProperty.call(body, "coachWeeklyBriefingEnabled")) {
    patch.coachWeeklyBriefingEnabled = body.coachWeeklyBriefingEnabled !== false;
  }

  if (body.tutorialCompleted === true) {
    patch.tutorialCompleted = true;
    patch.tutorialCompletedAt = new Date().toISOString();
  }

  if (Object.prototype.hasOwnProperty.call(body, "tutorialVersion")) {
    const tutorialVersion = String(body.tutorialVersion || "").trim();
    if (tutorialVersion) {
      patch.tutorialVersion = tutorialVersion;
    }
  }

  if (!Object.keys(patch).length) {
    return json(400, { error: "No supported preference values were provided." });
  }

  try {
    const supabase = getServiceSupabase();
    const user = await getAuthenticatedUser(event, supabase);

    if (!user) {
      return json(401, { error: "A valid signed-in session is required." });
    }

    const { data: existingPreference, error: existingError } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", preferenceKeyForUser(user.id))
      .maybeSingle();

    if (existingError) {
      throw existingError;
    }

    const mergedValue = {
      ...(existingPreference?.value || {}),
      ...patch,
    };

    if (Object.prototype.hasOwnProperty.call(patch, "coachAutomationRules")) {
      mergedValue.coachAutomationRules = sanitizeCoachAutomationRules(
        patch.coachAutomationRules,
        mergedValue.coachOpsSegments || []
      );
    }

    const payload = {
      key: preferenceKeyForUser(user.id),
      value: mergedValue,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("app_settings").upsert(payload, {
      onConflict: "key",
    });

    if (error) {
      throw error;
    }

    return json(200, {
      ok: true,
      preferences: payload.value,
    });
  } catch (error) {
    return json(500, {
      error: error?.message || "Unable to save user preferences.",
    });
  }
};
