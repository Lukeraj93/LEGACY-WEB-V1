const { json, methodNotAllowed, noContent } = require("./_lib/http");
const {
  createHttpError,
  ensurePlannerRewardEventsForSubmission,
  normalizeBoolean,
  normalizeDateOnly,
  normalizeInteger,
  normalizeNullableText,
  normalizeNumber,
  normalizeText,
  normalizeTimestamp,
  notifyClientAndCoach,
  parseBody,
  requireAllowedRole,
  requireManagedClientAccess,
  syncPlannerRewardEventsForSource,
  throwOnError,
} = require("./_lib/planner");
const { getAuthenticatedProfile, getServiceSupabase } = require("./_lib/supabase");

async function saveWorkoutLog(supabase, auth, body) {
  const clientProgramDayId = normalizeText(body.clientProgramDayId || body.client_program_day_id);
  if (!clientProgramDayId) {
    throw createHttpError(400, "Client program day ID is required for workout logging.");
  }

  const dayResponse = await supabase
    .from("client_program_days")
    .select("id, assignment_id, title, status, client_program_assignments(client_id, coach_id)")
    .eq("id", clientProgramDayId)
    .maybeSingle();
  throwOnError(dayResponse);

  const day = dayResponse.data;
  const clientId = day?.client_program_assignments?.client_id;
  const coachId = day?.client_program_assignments?.coach_id;
  if (!day?.id || !clientId || !coachId) {
    throw createHttpError(404, "Client program day not found.");
  }

  await requireManagedClientAccess(supabase, auth.profile, clientId);

  const logStatus = normalizeText(body.logStatus || body.log_status || "completed");
  const logPayload = {
    client_program_day_id: day.id,
    client_id: clientId,
    coach_id: coachId,
    log_status: logStatus,
    started_at: normalizeTimestamp(body.startedAt || body.started_at),
    completed_at: normalizeTimestamp(body.completedAt || body.completed_at || new Date().toISOString()),
    adherence_score: normalizeNumber(body.adherenceScore || body.adherence_score),
    client_feedback: normalizeNullableText(body.clientFeedback || body.client_feedback),
    coach_feedback: normalizeNullableText(body.coachFeedback || body.coach_feedback),
    review_status: auth.profile.role === "client" ? "pending" : normalizeText(body.reviewStatus || body.review_status || "approved"),
    reviewed_by: auth.profile.role === "client" ? null : auth.profile.id,
    reviewed_at: auth.profile.role === "client" ? null : new Date().toISOString(),
  };

  const upsertResponse = await supabase
    .from("client_workout_logs")
    .upsert(logPayload, { onConflict: "client_program_day_id" })
    .select("*")
    .single();
  throwOnError(upsertResponse);
  const workoutLog = upsertResponse.data;

  const nextDayStatus =
    logStatus === "completed"
      ? "completed"
      : logStatus === "missed"
        ? "missed"
        : logStatus === "partial"
          ? "available"
          : day.status;

  if (nextDayStatus && nextDayStatus !== day.status) {
    const updateDayResponse = await supabase.from("client_program_days").update({ status: nextDayStatus }).eq("id", day.id);
    throwOnError(updateDayResponse);
  }

  const exerciseLogs = Array.isArray(body.exerciseLogs) ? body.exerciseLogs : [];
  const deleteExerciseLogsResponse = await supabase
    .from("client_workout_exercise_logs")
    .delete()
    .eq("workout_log_id", workoutLog.id);
  throwOnError(deleteExerciseLogsResponse);

  if (exerciseLogs.length) {
    const exerciseRows = exerciseLogs.map((entry, index) => ({
      workout_log_id: workoutLog.id,
      client_program_day_exercise_id: normalizeNullableText(entry.clientProgramDayExerciseId || entry.client_program_day_exercise_id),
      sort_order: normalizeInteger(entry.sortOrder || entry.sort_order) ?? index,
      completed_sets: normalizeInteger(entry.completedSets || entry.completed_sets),
      completed_reps: normalizeInteger(entry.completedReps || entry.completed_reps),
      logged_weight_kg: normalizeNumber(entry.loggedWeightKg || entry.logged_weight_kg),
      logged_duration_seconds: normalizeInteger(entry.loggedDurationSeconds || entry.logged_duration_seconds),
      logged_distance_meters: normalizeNumber(entry.loggedDistanceMeters || entry.logged_distance_meters),
      logged_rpe: normalizeNumber(entry.loggedRpe || entry.logged_rpe),
      logged_rir: normalizeNumber(entry.loggedRir || entry.logged_rir),
      set_logs: Array.isArray(entry.setLogs) ? entry.setLogs : [],
      pain_score: normalizeInteger(entry.painScore || entry.pain_score),
      exercise_note: normalizeNullableText(entry.exerciseNote || entry.exercise_note),
    }));

    const insertExerciseLogsResponse = await supabase.from("client_workout_exercise_logs").insert(exerciseRows);
    throwOnError(insertExerciseLogsResponse);
  }

  if (auth.profile.role === "client" && ["completed", "partial", "missed"].includes(logStatus)) {
    await notifyClientAndCoach(supabase, {
      category: "planner",
      coachId,
      coachTitle: "Client workout log updated",
      coachBody: `${day.title} was marked ${logStatus} and is ready for review.`,
      coachActionUrl: "./coach-dashboard.html",
    }).catch(() => null);
  }

  if (auth.profile.role !== "client" && logStatus === "completed" && workoutLog.review_status === "approved") {
    await ensurePlannerRewardEventsForSubmission(supabase, {
      type: "workout_log",
      record: workoutLog,
      requestedBy: auth.profile.id,
    }).catch(() => null);

    await syncPlannerRewardEventsForSource(supabase, auth.profile, {
      type: "workout_log",
      sourceRecordId: workoutLog.id,
      decision: "approved",
    }).catch(() => null);
  }

  return {
    type: "workout_log",
    workoutLog,
  };
}

async function saveNutritionLog(supabase, auth, body) {
  const nutritionPlanId = normalizeText(body.nutritionPlanId || body.nutrition_plan_id);
  const logDate = normalizeDateOnly(body.logDate || body.log_date) || new Date().toISOString().slice(0, 10);
  if (!nutritionPlanId) {
    throw createHttpError(400, "Nutrition plan ID is required for nutrition logging.");
  }

  const planResponse = await supabase.from("client_nutrition_plans").select("*").eq("id", nutritionPlanId).maybeSingle();
  throwOnError(planResponse);
  const plan = planResponse.data;
  if (!plan?.id) {
    throw createHttpError(404, "Nutrition plan not found.");
  }

  await requireManagedClientAccess(supabase, auth.profile, plan.client_id);

  const status = normalizeText(body.status || "partial");
  const upsertResponse = await supabase
    .from("client_nutrition_logs")
    .upsert(
      {
        client_id: plan.client_id,
        coach_id: plan.coach_id,
        nutrition_plan_id: plan.id,
        log_date: logDate,
        status,
        balanced_meals_count: normalizeInteger(body.balancedMealsCount || body.balanced_meals_count),
        meal_prep_completed: normalizeBoolean(body.mealPrepCompleted ?? body.meal_prep_completed, false),
        hydration_target_hit: normalizeBoolean(body.hydrationTargetHit ?? body.hydration_target_hit, false),
        protein_target_hit: normalizeBoolean(body.proteinTargetHit ?? body.protein_target_hit, false),
        calories_logged: normalizeInteger(body.caloriesLogged || body.calories_logged),
        protein_logged_g: normalizeInteger(body.proteinLoggedG || body.protein_logged_g),
        carbs_logged_g: normalizeInteger(body.carbsLoggedG || body.carbs_logged_g),
        fat_logged_g: normalizeInteger(body.fatLoggedG || body.fat_logged_g),
        note: normalizeNullableText(body.note),
        evidence: Array.isArray(body.evidence) ? body.evidence : [],
        review_status: auth.profile.role === "client" ? "pending" : normalizeText(body.reviewStatus || "approved"),
        reviewed_by: auth.profile.role === "client" ? null : auth.profile.id,
        reviewed_at: auth.profile.role === "client" ? null : new Date().toISOString(),
      },
      {
        onConflict: "client_id,nutrition_plan_id,log_date",
      }
    )
    .select("*")
    .single();

  throwOnError(upsertResponse);
  const nutritionLog = upsertResponse.data;

  if (auth.profile.role === "client") {
    await notifyClientAndCoach(supabase, {
      category: "planner",
      coachId: plan.coach_id,
      coachTitle: "Client nutrition log updated",
      coachBody: `Nutrition adherence for ${logDate} was submitted and is ready for review.`,
      coachActionUrl: "./coach-dashboard.html",
    }).catch(() => null);
  }

  if (auth.profile.role !== "client" && nutritionLog.review_status === "approved") {
    await ensurePlannerRewardEventsForSubmission(supabase, {
      type: "nutrition_log",
      record: nutritionLog,
      requestedBy: auth.profile.id,
    }).catch(() => null);

    await syncPlannerRewardEventsForSource(supabase, auth.profile, {
      type: "nutrition_log",
      sourceRecordId: nutritionLog.id,
      decision: "approved",
    }).catch(() => null);
  }

  return {
    type: "nutrition_log",
    nutritionLog,
  };
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
    requireAllowedRole(auth.profile, ["client", "coach", "super_admin"]);

    const type = normalizeText(body.type || "workout_log");
    let result = null;
    if (type === "nutrition_log") {
      result = await saveNutritionLog(supabase, auth, body);
    } else if (type === "workout_log") {
      result = await saveWorkoutLog(supabase, auth, body);
    } else {
      throw createHttpError(400, "Unsupported planner completion type.");
    }

    return json(200, {
      ok: true,
      ...result,
      message: "Planner completion saved.",
    });
  } catch (error) {
    return json(Number(error?.statusCode || 500), {
      error: error?.message || "Unable to save planner completion right now.",
    });
  }
};
