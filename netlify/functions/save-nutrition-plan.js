const { json, methodNotAllowed, noContent } = require("./_lib/http");
const {
  createHttpError,
  normalizeArray,
  normalizeBoolean,
  normalizeDateOnly,
  normalizeInteger,
  normalizeJson,
  normalizeNullableText,
  normalizeNumber,
  normalizeText,
  notifyClientAndCoach,
  parseBody,
  requireAllowedRole,
  requireManagedClientAccess,
  throwOnError,
} = require("./_lib/planner");
const { getAuthenticatedProfile, getServiceSupabase } = require("./_lib/supabase");

async function saveNutritionPlanRecord(supabase, authProfile, payload) {
  requireAllowedRole(authProfile, ["coach", "super_admin"]);

  const planInput = payload.plan || payload;
  const planId = normalizeText(planInput.id);
  const clientId = normalizeText(planInput.clientId || planInput.client_id);
  if (!clientId) {
    throw createHttpError(400, "Client ID is required.");
  }

  await requireManagedClientAccess(supabase, authProfile, clientId);

  const coachId =
    authProfile.role === "super_admin"
      ? normalizeText(planInput.coachId || planInput.coach_id || authProfile.id)
      : authProfile.id;

  const planRow = {
    client_id: clientId,
    coach_id: coachId,
    assignment_id: normalizeNullableText(planInput.assignmentId || planInput.assignment_id),
    title: normalizeText(planInput.title || "Nutrition Plan"),
    strategy: normalizeText(planInput.strategy || "hybrid"),
    calories_target: normalizeInteger(planInput.caloriesTarget || planInput.calories_target),
    protein_target_g: normalizeInteger(planInput.proteinTargetG || planInput.protein_target_g),
    carbs_target_g: normalizeInteger(planInput.carbsTargetG || planInput.carbs_target_g),
    fat_target_g: normalizeInteger(planInput.fatTargetG || planInput.fat_target_g),
    training_day_targets: normalizeJson(planInput.trainingDayTargets || planInput.training_day_targets, {}),
    rest_day_targets: normalizeJson(planInput.restDayTargets || planInput.rest_day_targets, {}),
    meal_plan: normalizeJson(planInput.mealPlan || planInput.meal_plan, {}),
    notes: normalizeNullableText(planInput.notes),
    start_date: normalizeDateOnly(planInput.startDate || planInput.start_date) || new Date().toISOString().slice(0, 10),
    end_date: normalizeDateOnly(planInput.endDate || planInput.end_date),
    status: normalizeText(planInput.status || "active"),
  };

  if (!planRow.title) {
    throw createHttpError(400, "Nutrition plan title is required.");
  }

  let savedPlan = null;
  if (planId) {
    const existingResponse = await supabase.from("client_nutrition_plans").select("*").eq("id", planId).maybeSingle();
    throwOnError(existingResponse);
    if (!existingResponse.data?.id) {
      throw createHttpError(404, "Nutrition plan not found.");
    }

    const updateResponse = await supabase
      .from("client_nutrition_plans")
      .update(planRow)
      .eq("id", planId)
      .select("*")
      .single();
    throwOnError(updateResponse);
    savedPlan = updateResponse.data;

    const deleteHabitsResponse = await supabase.from("client_nutrition_habits").delete().eq("nutrition_plan_id", planId);
    throwOnError(deleteHabitsResponse);
  } else {
    const insertResponse = await supabase.from("client_nutrition_plans").insert(planRow).select("*").single();
    throwOnError(insertResponse);
    savedPlan = insertResponse.data;
  }

  const habits = Array.isArray(payload.habits) ? payload.habits : Array.isArray(planInput.habits) ? planInput.habits : [];
  let habitCount = 0;
  if (habits.length) {
    const habitRows = habits.map((habit, index) => ({
      nutrition_plan_id: savedPlan.id,
      sort_order: normalizeInteger(habit.sortOrder || habit.sort_order) ?? index,
      title: normalizeText(habit.title || `Habit ${index + 1}`),
      description: normalizeNullableText(habit.description),
      target_type: normalizeText(habit.targetType || habit.target_type || "boolean"),
      target_value: normalizeNumber(habit.targetValue || habit.target_value),
      target_unit: normalizeNullableText(habit.targetUnit || habit.target_unit),
      cadence: normalizeText(habit.cadence || "daily"),
      is_required: normalizeBoolean(habit.isRequired ?? habit.is_required, true),
      is_active: normalizeBoolean(habit.isActive ?? habit.is_active, true),
      metadata: normalizeJson(habit.metadata, {}),
    }));

    const habitInsertResponse = await supabase.from("client_nutrition_habits").insert(habitRows).select("id");
    throwOnError(habitInsertResponse);
    habitCount = (habitInsertResponse.data || []).length;
  }

  await notifyClientAndCoach(supabase, {
    category: "planner",
    clientId,
    clientTitle: "Your nutrition plan has been updated",
    clientBody: `${savedPlan.title} is now available in your account.`,
    clientActionUrl: "./client-dashboard.html",
  }).catch(() => null);

  return {
    plan: savedPlan,
    habitsCreated: habitCount,
    message: planId ? "Nutrition plan updated." : "Nutrition plan created.",
  };
}

exports.saveNutritionPlanRecord = saveNutritionPlanRecord;

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return noContent({ "Cache-Control": "no-store" });
  }

  if (!["POST", "PUT"].includes(event.httpMethod)) {
    return methodNotAllowed("POST, PUT, OPTIONS");
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
    const result = await saveNutritionPlanRecord(supabase, auth.profile, body);
    return json(200, {
      ok: true,
      ...result,
    });
  } catch (error) {
    return json(Number(error?.statusCode || 500), {
      error: error?.message || "Unable to save the nutrition plan right now.",
    });
  }
};
