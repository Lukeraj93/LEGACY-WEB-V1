const { json, methodNotAllowed, noContent } = require("./_lib/http");
const { getAuthenticatedUser, getServiceSupabase } = require("./_lib/supabase");
const {
  DEFAULT_COACH_AUTOMATION_RULES,
  DEFAULT_COACH_OPS_SEGMENTS,
  sanitizeCoachAutomationRules,
  sanitizeCoachOpsSegments,
} = require("./_lib/coach-ops");

function preferenceKeyForUser(userId) {
  return `user-preferences:${userId}`;
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return noContent();
  }

  if (event.httpMethod !== "GET") {
    return methodNotAllowed("GET, OPTIONS");
  }

  try {
    const supabase = getServiceSupabase();
    const user = await getAuthenticatedUser(event, supabase);

    if (!user) {
      return json(401, { error: "A valid signed-in session is required." });
    }

    const { data, error } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", preferenceKeyForUser(user.id))
      .maybeSingle();

    if (error) {
      throw error;
    }

    const rawPreferences = data?.value && typeof data.value === "object" ? data.value : {};
    const coachOpsSegments = Object.prototype.hasOwnProperty.call(rawPreferences, "coachOpsSegments")
      ? sanitizeCoachOpsSegments(rawPreferences.coachOpsSegments)
      : sanitizeCoachOpsSegments(DEFAULT_COACH_OPS_SEGMENTS);
    const coachAutomationRules = Object.prototype.hasOwnProperty.call(rawPreferences, "coachAutomationRules")
      ? sanitizeCoachAutomationRules(rawPreferences.coachAutomationRules, coachOpsSegments)
      : sanitizeCoachAutomationRules(DEFAULT_COACH_AUTOMATION_RULES, coachOpsSegments);
    const preferences = {
      ...rawPreferences,
      coachOpsSegments,
      coachAutomationRules,
      coachWeeklyBriefingEnabled: rawPreferences.coachWeeklyBriefingEnabled !== false,
    };

    return json(200, {
      email: user.email || "",
      preferences,
    });
  } catch (error) {
    return json(500, {
      error: error?.message || "Unable to load user preferences.",
    });
  }
};
