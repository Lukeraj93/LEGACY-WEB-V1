const { json, methodNotAllowed, noContent } = require("./_lib/http");
const { getServiceSupabase } = require("./_lib/supabase");
const { parseBody, requireSuperAdminAccess, writeXpCoachAuditLog, xpSchema } = require("./_lib/xp-coach");
const { computeTrialResult, toIsoDateString } = require("../../XP coach gamification/Config/coach-xp-engine.js");

const ROLE_OPTIONS = new Set(["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9"]);
const TRIAL_RESULTS = new Set(["Pending", "Pass", "Fail"]);

function normalizeTrialPayload(input, actorId) {
  const coachId = String(input?.coach_id || input?.coachId || "").trim().toUpperCase();
  const currentRole = String(input?.current_role || input?.currentRole || "").trim().toUpperCase();
  const targetRole = String(input?.target_role || input?.targetRole || "").trim().toUpperCase();
  const skillTrial = String(input?.skill_trial || input?.skillTrial || "Pending").trim();
  const knowledgeTrial = String(input?.knowledge_trial || input?.knowledgeTrial || "Pending").trim();
  const portfolio = String(input?.portfolio || "Pending").trim();
  const trialDate = toIsoDateString(input?.trial_date || input?.trialDate) || null;
  const notes = String(input?.notes || "").trim() || null;

  if (!coachId) {
    throw new Error("Coach is required.");
  }
  if (!ROLE_OPTIONS.has(currentRole) || !ROLE_OPTIONS.has(targetRole)) {
    throw new Error("Current and target roles must be between T1 and T9.");
  }
  if (!TRIAL_RESULTS.has(skillTrial) || !TRIAL_RESULTS.has(knowledgeTrial) || !TRIAL_RESULTS.has(portfolio)) {
    throw new Error("Trial fields must be Pending, Pass, or Fail.");
  }

  return {
    id: String(input?.id || "").trim() || undefined,
    coach_id: coachId,
    current_role: currentRole,
    target_role: targetRole,
    trial_date: trialDate,
    skill_trial: skillTrial,
    knowledge_trial: knowledgeTrial,
    portfolio,
    notes,
    created_by_profile_id: actorId || null,
    computed_result: computeTrialResult({
      skill_trial: skillTrial,
      knowledge_trial: knowledgeTrial,
      portfolio,
    }),
  };
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return noContent();
  }

  if (!["GET", "POST"].includes(event.httpMethod)) {
    return methodNotAllowed("GET, POST, OPTIONS");
  }

  try {
    const supabase = getServiceSupabase();
    const accessResult = await requireSuperAdminAccess(event, supabase);
    if (!accessResult.ok) {
      return accessResult.response;
    }

    if (event.httpMethod === "GET") {
      const [trials, coaches, roleTitles, ledger] = await Promise.all([
        xpSchema(supabase).from("trials").select("*").order("trial_date", { ascending: false, nullsFirst: false }).order("created_at", { ascending: false }).limit(200),
        xpSchema(supabase).from("coaches").select("coach_id, coach_name").order("coach_name", { ascending: true }),
        xpSchema(supabase).from("role_titles").select("*").order("min_xp", { ascending: true }),
        xpSchema(supabase).from("ledger_view").select("coach_id, total_xp_counted, current_role_id, current_operational_title").order("total_xp_counted", { ascending: false }),
      ]);

      if (trials.error) throw trials.error;
      if (coaches.error) throw coaches.error;
      if (roleTitles.error) throw roleTitles.error;
      if (ledger.error) throw ledger.error;

      return json(200, {
        ok: true,
        trials: trials.data || [],
        coachOptions: coaches.data || [],
        roleTitles: roleTitles.data || [],
        ledger: ledger.data || [],
      });
    }

    const body = parseBody(event);
    if (!body) {
      return json(400, { error: "Invalid JSON body." });
    }

    const trial = normalizeTrialPayload(body.trial || body, accessResult.access.profile.id);
    const payload = {
      coach_id: trial.coach_id,
      current_role: trial.current_role,
      target_role: trial.target_role,
      trial_date: trial.trial_date,
      skill_trial: trial.skill_trial,
      knowledge_trial: trial.knowledge_trial,
      portfolio: trial.portfolio,
      notes: trial.notes,
      created_by_profile_id: trial.created_by_profile_id,
    };

    let response;
    if (trial.id) {
      response = await xpSchema(supabase).from("trials").update(payload).eq("id", trial.id).select("*").single();
    } else {
      response = await xpSchema(supabase).from("trials").insert(payload).select("*").single();
    }

    if (response.error) {
      throw response.error;
    }

    await writeXpCoachAuditLog(supabase, accessResult.access.profile.id, "xp_coach_trial_upsert", {
      entityId: response.data.id,
      trial: payload,
      computedResult: trial.computed_result,
    });

    return json(200, {
      ok: true,
      trial: response.data,
    });
  } catch (error) {
    return json(500, {
      error: error?.message || "Unable to manage Coach XP trials.",
    });
  }
};
