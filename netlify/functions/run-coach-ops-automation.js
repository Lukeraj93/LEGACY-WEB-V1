const { json, noContent } = require("./_lib/http");
const { getPlannerPayload } = require("./_lib/planner-data");
const { getServiceSupabase, notifyRecipients } = require("./_lib/supabase");
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

const AUTOMATION_COPY = {
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

function preferenceKeyForUser(userId) {
  return `user-preferences:${userId}`;
}

function automationLogKeyForUser(userId) {
  return `coach-ops-automation-log:${userId}`;
}

function categoryMatchesClient(client, category) {
  switch (category) {
    case "nutrition":
      return Boolean(client.needsNutritionNudge || !client.activeNutrition);
    case "checkin":
      return Boolean(client.needsCheckinNudge);
    case "training":
      return Boolean(client.needsTrainingNudge || (client.quietThisWeek && client.daysSinceActivity > 3));
    case "progress_photo":
      return Boolean(client.needsPhotoNudge);
    default:
      return false;
  }
}

function dispatchKey(ruleId, clientId) {
  return `${ruleId}:${clientId}`;
}

function wasSentRecently(dispatchMap, ruleId, clientId, cooldownHours, nowMs) {
  const sentAt = dispatchMap[dispatchKey(ruleId, clientId)];
  if (!sentAt) {
    return false;
  }
  const sentMs = new Date(sentAt).getTime();
  if (!Number.isFinite(sentMs)) {
    return false;
  }
  return nowMs - sentMs < cooldownHours * 3600000;
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return noContent({ "Cache-Control": "no-store" });
  }

  if (event.httpMethod && !["GET", "POST"].includes(event.httpMethod)) {
    return json(405, { error: "Method not allowed." }, { Allow: "GET, POST, OPTIONS", "Cache-Control": "no-store" });
  }

  const supabase = getServiceSupabase();
  const now = new Date();
  const nowIso = now.toISOString();
  const nowMs = now.getTime();

  try {
    const preferencesResponse = await supabase
      .from("app_settings")
      .select("key, value")
      .like("key", "user-preferences:%")
      .limit(500);

    if (preferencesResponse.error) {
      throw preferencesResponse.error;
    }

    const preferenceRows = preferencesResponse.data || [];
    const coachIds = preferenceRows
      .map((row) => String(row.key || "").replace(/^user-preferences:/u, ""))
      .filter(Boolean);

    if (!coachIds.length) {
      return json(200, { ok: true, scanned: 0, dispatched: 0, briefings: 0 }, { "Cache-Control": "no-store" });
    }

    const profilesResponse = await supabase
      .from("profiles")
      .select("id, role, status")
      .in("id", coachIds);
    if (profilesResponse.error) {
      throw profilesResponse.error;
    }

    const activeCoachIds = new Set(
      (profilesResponse.data || [])
        .filter((profile) => String(profile.role || "").toLowerCase() === "coach" && String(profile.status || "active").toLowerCase() !== "inactive")
        .map((profile) => profile.id)
    );

    let scanned = 0;
    let dispatched = 0;
    let briefings = 0;
    const coachSummaries = [];

    for (const preferenceRow of preferenceRows) {
      const coachId = String(preferenceRow.key || "").replace(/^user-preferences:/u, "");
      if (!activeCoachIds.has(coachId)) {
        continue;
      }

      scanned += 1;
      const rawPreferences = preferenceRow.value && typeof preferenceRow.value === "object" ? preferenceRow.value : {};
      const segments = Object.prototype.hasOwnProperty.call(rawPreferences, "coachOpsSegments")
        ? sanitizeCoachOpsSegments(rawPreferences.coachOpsSegments)
        : sanitizeCoachOpsSegments(DEFAULT_COACH_OPS_SEGMENTS);
      const rules = (
        Object.prototype.hasOwnProperty.call(rawPreferences, "coachAutomationRules")
          ? sanitizeCoachAutomationRules(rawPreferences.coachAutomationRules, segments)
          : sanitizeCoachAutomationRules(DEFAULT_COACH_AUTOMATION_RULES, segments)
      ).filter((rule) => rule.enabled);
      const weeklyBriefingEnabled = rawPreferences.coachWeeklyBriefingEnabled !== false;

      if (!rules.length && !weeklyBriefingEnabled) {
        continue;
      }

      const plannerPayload = await getPlannerPayload(
        supabase,
        {
          user: { id: coachId, email: "" },
          profile: { id: coachId, role: "coach", status: "active" },
        },
        { mode: "full" }
      );
      const insights = buildCoachPlannerInsights(plannerPayload);

      const automationLogResponse = await supabase
        .from("app_settings")
        .select("value")
        .eq("key", automationLogKeyForUser(coachId))
        .maybeSingle();
      if (automationLogResponse.error) {
        throw automationLogResponse.error;
      }

      const logValue = automationLogResponse.data?.value && typeof automationLogResponse.data.value === "object"
        ? automationLogResponse.data.value
        : {};
      const dispatchMap = Object.fromEntries(
        Object.entries(logValue.dispatchMap && typeof logValue.dispatchMap === "object" ? logValue.dispatchMap : {})
          .filter(([, sentAt]) => {
            const sentMs = new Date(sentAt || 0).getTime();
            return Number.isFinite(sentMs) && nowMs - sentMs < 30 * 24 * 3600000;
          })
      );
      const lastRuleDispatches = [];

      for (const rule of rules) {
        if (!shouldRunAutomationSchedule(rule.schedule, now)) {
          continue;
        }

        const segment = segments.find((candidate) => candidate.id === rule.segmentId);
        if (!segment) {
          continue;
        }

        const matchedClients = (insights.roster || [])
          .filter((client) => segmentMatchesClient(client, segment))
          .filter((client) => categoryMatchesClient(client, rule.category));

        const rows = [];
        let skippedCount = 0;

        matchedClients.forEach((client) => {
          if (wasSentRecently(dispatchMap, rule.id, client.id, rule.cooldownHours, nowMs)) {
            skippedCount += 1;
            return;
          }
          const copy = AUTOMATION_COPY[rule.category] || AUTOMATION_COPY.nutrition;
          rows.push({
            recipient_id: client.id,
            category: "planner",
            title: copy.title,
            body: rule.message || copy.body,
            action_url: copy.actionUrl,
          });
          dispatchMap[dispatchKey(rule.id, client.id)] = nowIso;
        });

        if (rows.length) {
          await notifyRecipients(supabase, rows);
          dispatched += rows.length;
          await notifyRecipients(supabase, [
            {
              recipient_id: coachId,
              category: "planner",
              title: "Coach automation completed",
              body: `${rule.name} nudged ${rows.length} client${rows.length === 1 ? "" : "s"} from the ${segment.name} segment.`,
              action_url: "/coach-programming.html",
            },
          ]).catch(() => null);
        }

        lastRuleDispatches.push({
          ruleId: rule.id,
          ruleName: rule.name,
          sentCount: rows.length,
          skippedCount,
          sentAt: nowIso,
        });
      }

      let lastBriefing = logValue.lastBriefing || null;
      if (weeklyBriefingEnabled && shouldRunAutomationSchedule("weekly_monday", now)) {
        const alreadyBriefedThisWeek = lastBriefing?.weekLabel === insights.weekLabel;
        if (!alreadyBriefedThisWeek) {
          const weeklyBrief = buildWeeklyCoachBrief(insights);
          await notifyRecipients(supabase, [
            {
              recipient_id: coachId,
              category: "planner",
              title: weeklyBrief.title,
              body: weeklyBrief.body,
              action_url: "/coach-dashboard.html",
            },
          ]);
          briefings += 1;
          lastBriefing = {
            weekLabel: insights.weekLabel,
            sentAt: nowIso,
            title: weeklyBrief.title,
            body: weeklyBrief.body,
          };
        }
      }

      const nextLogValue = {
        dispatchMap,
        lastRunAt: nowIso,
        lastRuleDispatches: lastRuleDispatches.slice(-12),
        lastBriefing,
      };

      const upsertLogResponse = await supabase.from("app_settings").upsert(
        {
          key: automationLogKeyForUser(coachId),
          value: nextLogValue,
          updated_by: coachId,
          updated_at: nowIso,
        },
        { onConflict: "key" }
      );
      if (upsertLogResponse.error) {
        throw upsertLogResponse.error;
      }

      coachSummaries.push({
        coachId,
        enabledRules: rules.length,
        dispatchedNow: lastRuleDispatches.reduce((sum, item) => sum + Number(item.sentCount || 0), 0),
      });
    }

    return json(
      200,
      {
        ok: true,
        scanned,
        dispatched,
        briefings,
        coachSummaries,
      },
      { "Cache-Control": "no-store" }
    );
  } catch (error) {
    return json(
      Number(error?.statusCode || 500),
      { error: error?.message || "Unable to run the coach ops automation right now." },
      { "Cache-Control": "no-store" }
    );
  }
};
