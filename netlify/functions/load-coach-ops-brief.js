const { json, methodNotAllowed, noContent } = require("./_lib/http");
const { getPlannerPayload } = require("./_lib/planner-data");
const { getAuthenticatedProfile, getServiceSupabase, getUserSupabase } = require("./_lib/supabase");
const {
  buildCoachPlannerInsights,
  buildWeeklyCoachBrief,
  DEFAULT_COACH_AUTOMATION_RULES,
  DEFAULT_COACH_OPS_SEGMENTS,
  sanitizeCoachAutomationRules,
  sanitizeCoachOpsSegments,
  segmentMatchesClient,
  shouldRunAutomationSchedule,
} = require("./_lib/coach-ops");

function preferenceKeyForUser(userId) {
  return `user-preferences:${userId}`;
}

function automationLogKeyForUser(userId) {
  return `coach-ops-automation-log:${userId}`;
}

function buildSegmentSummaries(segments, insights) {
  return (segments || []).map((segment) => {
    const matches = (insights.roster || []).filter((client) => segmentMatchesClient(client, segment));
    return {
      id: segment.id,
      name: segment.name,
      matchCount: matches.length,
      previewNames: matches
        .slice()
        .sort((left, right) => right.riskScore - left.riskScore)
        .slice(0, 3)
        .map((client) => client.preferredName || client.displayName || "Client"),
      filters: segment.filters || {},
    };
  });
}

function buildAutomationCoverage(rules, segments, insights) {
  const enabledRules = (rules || []).filter((rule) => rule.enabled);
  const coverageIds = new Set();

  enabledRules.forEach((rule) => {
    const segment = (segments || []).find((candidate) => candidate.id === rule.segmentId);
    if (!segment) {
      return;
    }
    (insights.roster || [])
      .filter((client) => segmentMatchesClient(client, segment))
      .forEach((client) => coverageIds.add(client.id));
  });

  const rosterCount = Number(insights.summary?.roster || 0);
  return {
    rosterCoveredCount: coverageIds.size,
    rosterCoveredPercent: rosterCount ? Math.round((coverageIds.size / rosterCount) * 100) : 0,
  };
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return noContent({ "Cache-Control": "no-store" });
  }

  if (event.httpMethod !== "GET") {
    return methodNotAllowed("GET, OPTIONS");
  }

  const userSupabase = getUserSupabase(event);
  if (!userSupabase) {
    return json(401, { error: "A valid authenticated session is required." }, { "Cache-Control": "no-store" });
  }
  const supabase = getServiceSupabase();

  let auth = null;
  try {
    auth = await getAuthenticatedProfile(event, userSupabase);
  } catch (error) {
    return json(
      500,
      { error: error?.message || "Unable to validate the authenticated coach request." },
      { "Cache-Control": "no-store" }
    );
  }

  if (!auth?.profile || !["coach", "super_admin"].includes(String(auth.profile.role || "").toLowerCase())) {
    return json(403, { error: "Coach access is required." }, { "Cache-Control": "no-store" });
  }

  try {
    const [plannerPayload, preferencesResponse, automationLogResponse] = await Promise.all([
      getPlannerPayload(supabase, auth, { mode: "full" }),
      supabase
        .from("app_settings")
        .select("value")
        .eq("key", preferenceKeyForUser(auth.profile.id))
        .maybeSingle(),
      supabase
        .from("app_settings")
        .select("value")
        .eq("key", automationLogKeyForUser(auth.profile.id))
        .maybeSingle(),
    ]);

    if (preferencesResponse.error) {
      throw preferencesResponse.error;
    }
    if (automationLogResponse.error) {
      throw automationLogResponse.error;
    }

    const rawPreferences = preferencesResponse.data?.value && typeof preferencesResponse.data.value === "object"
      ? preferencesResponse.data.value
      : {};
    const coachOpsSegments = Object.prototype.hasOwnProperty.call(rawPreferences, "coachOpsSegments")
      ? sanitizeCoachOpsSegments(rawPreferences.coachOpsSegments)
      : sanitizeCoachOpsSegments(DEFAULT_COACH_OPS_SEGMENTS);
    const coachAutomationRules = Object.prototype.hasOwnProperty.call(rawPreferences, "coachAutomationRules")
      ? sanitizeCoachAutomationRules(rawPreferences.coachAutomationRules, coachOpsSegments)
      : sanitizeCoachAutomationRules(DEFAULT_COACH_AUTOMATION_RULES, coachOpsSegments);
    const coachWeeklyBriefingEnabled = rawPreferences.coachWeeklyBriefingEnabled !== false;
    const insights = buildCoachPlannerInsights(plannerPayload);
    const weeklyBrief = buildWeeklyCoachBrief(insights);
    const segmentSummaries = buildSegmentSummaries(coachOpsSegments, insights);
    const scheduledNowCount = coachAutomationRules.filter((rule) => shouldRunAutomationSchedule(rule.schedule)).length;
    const automationCoverage = buildAutomationCoverage(coachAutomationRules, coachOpsSegments, insights);
    const automationLog = automationLogResponse.data?.value && typeof automationLogResponse.data.value === "object"
      ? automationLogResponse.data.value
      : {};
    const lastRuleDispatches = Array.isArray(automationLog.lastRuleDispatches) ? automationLog.lastRuleDispatches : [];
    const lastDispatchVolume = lastRuleDispatches.reduce((sum, entry) => sum + Number(entry.sentCount || 0), 0);

    return json(
      200,
      {
        ok: true,
        summary: insights.summary,
        intelligence: {
          ...(insights.intelligence || {}),
          ...automationCoverage,
          lastDispatchVolume,
        },
        weekLabel: insights.weekLabel,
        weeklyBrief,
        segmentSummaries,
        automation: {
          weeklyBriefingEnabled: coachWeeklyBriefingEnabled,
          totalRules: coachAutomationRules.length,
          enabledRules: coachAutomationRules.filter((rule) => rule.enabled).length,
          scheduledNowCount,
          rules: coachAutomationRules,
          lastRunAt: automationLog.lastRunAt || "",
          lastRuleDispatches,
          lastBriefing: automationLog.lastBriefing || null,
        },
      },
      { "Cache-Control": "no-store" }
    );
  } catch (error) {
    return json(
      Number(error?.statusCode || 500),
      { error: error?.message || "Unable to load the coach ops brief right now." },
      { "Cache-Control": "no-store" }
    );
  }
};
