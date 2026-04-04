const { json, methodNotAllowed, noContent } = require("./_lib/http");
const {
  createHttpError,
  ensurePlannerRewardEventsForSubmission,
  getPlannerRewardSourceModule,
  notifyClientAndCoach,
  normalizeNullableText,
  normalizeText,
  normalizeTimestamp,
  parseBody,
  requireAllowedRole,
  requireManagedClientAccess,
  syncPlannerRewardEventsForSource,
  throwOnError,
} = require("./_lib/planner");
const { awardCoachXpAction, buildCoachXpSourceRef } = require("./_lib/xp-coach");
const { getAuthenticatedProfile, getServiceSupabase } = require("./_lib/supabase");

function resolveSubmissionConfig(type) {
  const normalized = String(type || "").trim().toLowerCase();
  if (normalized === "workout_log") {
    return {
      table: "client_workout_logs",
      idField: "workoutLogId",
      sourceModule: "workout_log",
      reviewStatusField: "review_status",
      noteField: "coach_feedback",
      reviewedAtField: "reviewed_at",
      reviewedByField: "reviewed_by",
      clientIdField: "client_id",
      allowedDecisions: ["approved", "needs_revision", "rejected"],
    };
  }

  if (normalized === "nutrition_log") {
    return {
      table: "client_nutrition_logs",
      idField: "nutritionLogId",
      sourceModule: "nutrition_log",
      reviewStatusField: "review_status",
      reviewedAtField: "reviewed_at",
      reviewedByField: "reviewed_by",
      clientIdField: "client_id",
      allowedDecisions: ["approved", "needs_revision", "rejected"],
    };
  }

  if (normalized === "checkin") {
    return {
      table: "client_checkins",
      idField: "checkinId",
      sourceModule: "client_checkin",
      reviewStatusField: "review_status",
      noteField: "coach_comment",
      reviewedAtField: "reviewed_at",
      reviewedByField: "reviewed_by",
      clientIdField: "client_id",
      statusField: "status",
      approvedStatusValue: "reviewed",
      allowedDecisions: ["approved", "needs_follow_up"],
    };
  }

  if (normalized === "progress_photo") {
    return {
      table: "progress_photo_entries",
      idField: "entryId",
      sourceModule: "progress_photo",
      reviewStatusField: "review_status",
      noteField: "coach_note",
      reviewedAtField: "reviewed_at",
      reviewedByField: "reviewed_by",
      clientIdField: "client_id",
      allowedDecisions: ["reviewed", "archived", "pending"],
    };
  }

  if (normalized === "meal_entry") {
    return {
      table: "client_meal_entries",
      idField: "mealEntryId",
      sourceModule: "meal_entry",
      reviewStatusField: "review_status",
      noteField: "coach_comment",
      reviewedAtField: "reviewed_at",
      reviewedByField: "reviewed_by",
      clientIdField: "client_id",
      allowedDecisions: ["approved", "needs_revision", "rejected"],
    };
  }

  if (normalized === "nutrition_photo") {
    return {
      table: "nutrition_photo_submissions",
      idField: "submissionId",
      sourceModule: "nutrition_photo",
      reviewStatusField: "review_status",
      noteField: "coach_comment",
      reviewedAtField: "reviewed_at",
      reviewedByField: "reviewed_by",
      clientIdField: "client_id",
      allowedDecisions: ["approved", "needs_revision", "rejected"],
    };
  }

  throw createHttpError(400, "Unsupported planner submission type.");
}

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

    const type = normalizeText(body.type);
    const config = resolveSubmissionConfig(type);
    const recordId = normalizeText(body[config.idField] || body[config.idField.replace(/[A-Z]/gu, (match) => `_${match.toLowerCase()}`)] || body.id);
    const decision = normalizeText(body.decision || body.reviewStatus || body.review_status || "approved").toLowerCase();

    if (!recordId) {
      throw createHttpError(400, "A planner submission ID is required.");
    }
    if (!config.allowedDecisions.includes(decision)) {
      throw createHttpError(400, "Unsupported planner review decision.");
    }

    const recordResponse = await supabase.from(config.table).select("*").eq("id", recordId).maybeSingle();
    throwOnError(recordResponse);
    const record = recordResponse.data;
    if (!record?.id) {
      throw createHttpError(404, "Planner submission not found.");
    }

    await requireManagedClientAccess(supabase, auth.profile, record[config.clientIdField]);

    const updatePayload = {
      [config.reviewStatusField]: decision,
      [config.reviewedByField]: auth.profile.id,
      [config.reviewedAtField]: normalizeTimestamp(body.reviewedAt || body.reviewed_at || new Date().toISOString()),
    };

    if (config.noteField && Object.prototype.hasOwnProperty.call(body, "note")) {
      updatePayload[config.noteField] = normalizeNullableText(body.note);
    } else if (config.noteField && Object.prototype.hasOwnProperty.call(body, "coachNote")) {
      updatePayload[config.noteField] = normalizeNullableText(body.coachNote || body.coach_note);
    } else if (config.noteField && Object.prototype.hasOwnProperty.call(body, "coachFeedback")) {
      updatePayload[config.noteField] = normalizeNullableText(body.coachFeedback || body.coach_feedback);
    }

    if (config.statusField && config.approvedStatusValue && decision === "approved") {
      updatePayload[config.statusField] = config.approvedStatusValue;
    }

    const updateResponse = await supabase
      .from(config.table)
      .update(updatePayload)
      .eq("id", recordId)
      .select("*")
      .single();
    throwOnError(updateResponse);

    const updatedSubmission = updateResponse.data;
    if (decision === "approved") {
      await ensurePlannerRewardEventsForSubmission(supabase, {
        type,
        record: updatedSubmission,
        requestedBy: auth.profile.id,
      }).catch(() => null);

      if (
        type === "checkin"
        && auth.profile.role === "coach"
        && String(updatedSubmission?.cadence || "").toLowerCase() === "weekly"
        && String(updatedSubmission?.status || "").toLowerCase() === "reviewed"
        && updatedSubmission?.submitted_at
        && updatedSubmission?.due_at
        && new Date(updatedSubmission.submitted_at).getTime() <= new Date(updatedSubmission.due_at).getTime()
      ) {
        await awardCoachXpAction(supabase, {
          actionId: "COA-CHK",
          targetProfileId: auth.profile.id,
          actorProfileId: auth.profile.id,
          eventDate: updatedSubmission.reviewed_at || updatePayload[config.reviewedAtField],
          sourceRef: buildCoachXpSourceRef("planner-review", updatedSubmission.id, "coa-chk"),
          evidence: updatedSubmission.id,
          notes: "Weekly client check-in approved on time.",
        }).catch(() => null);
      }
    }

    await syncPlannerRewardEventsForSource(supabase, auth.profile, {
      sourceModule: config.sourceModule || getPlannerRewardSourceModule(type),
      sourceRecordId: updatedSubmission.id,
      decision,
      reason:
        normalizeNullableText(body.reason)
        || normalizeNullableText(body.note)
        || normalizeNullableText(body.coachNote || body.coach_note)
        || normalizeNullableText(body.coachFeedback || body.coach_feedback),
    }).catch(() => null);

    const titleByDecision = {
      approved: "Planner submission approved",
      needs_revision: "Planner submission needs revision",
      rejected: "Planner submission rejected",
      needs_follow_up: "Planner submission needs follow-up",
      reviewed: "Planner submission reviewed",
    };
    const bodyByDecision = {
      approved: "Your latest planner update was approved by your coach.",
      needs_revision: "Your latest planner update needs revision before it can count fully.",
      rejected: "Your latest planner update was rejected by your coach.",
      needs_follow_up: "Your latest planner update needs follow-up from your coach.",
      reviewed: "Your latest planner update was reviewed.",
    };

    await notifyClientAndCoach(supabase, {
      category: "planner",
      clientId: updatedSubmission[config.clientIdField],
      clientTitle: titleByDecision[decision] || "Planner submission reviewed",
      clientBody: bodyByDecision[decision] || "Your latest planner update was reviewed by your coach.",
      clientActionUrl: "./client-planner.html",
    }).catch(() => null);

    return json(200, {
      ok: true,
      submission: updatedSubmission,
      message: "Planner submission reviewed.",
    });
  } catch (error) {
    return json(Number(error?.statusCode || 500), {
      error: error?.message || "Unable to review the planner submission right now.",
    });
  }
};
