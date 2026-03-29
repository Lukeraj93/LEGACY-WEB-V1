const { json, methodNotAllowed, noContent } = require("./_lib/http");
const {
  createHttpError,
  normalizeDateOnly,
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
const { upsertExternalFoodRecord } = require("./_lib/nutrition-catalog");
const { getAuthenticatedProfile, getServiceSupabase } = require("./_lib/supabase");

const ALLOWED_MEAL_TYPES = new Set([
  "breakfast",
  "lunch",
  "dinner",
  "snack",
  "pre_workout",
  "post_workout",
  "other",
]);
const ALLOWED_SOURCE_TYPES = new Set(["manual", "photo", "recipe", "coach_assigned"]);

function roundValue(value) {
  const numeric = Number(value || 0);
  return Number.isFinite(numeric) ? Math.round(numeric * 100) / 100 : 0;
}

function isBalancedMeal(entry) {
  const calories = Number(entry?.total_calories_kcal || 0);
  const protein = Number(entry?.total_protein_g || 0);
  return calories >= 250 && calories <= 1100 && protein >= 20;
}

async function resolveAssignedCoachId(supabase, clientId) {
  const assignmentResponse = await supabase
    .from("coach_client_assignments")
    .select("coach_id")
    .eq("client_id", clientId)
    .eq("status", "active")
    .order("assigned_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  throwOnError(assignmentResponse);
  return assignmentResponse.data?.coach_id || null;
}

async function resolveNutritionPlan(supabase, clientId, nutritionPlanId) {
  if (nutritionPlanId) {
    const planResponse = await supabase
      .from("client_nutrition_plans")
      .select("*")
      .eq("id", nutritionPlanId)
      .maybeSingle();
    throwOnError(planResponse);
    if (!planResponse.data?.id) {
      throw createHttpError(404, "Nutrition plan not found.");
    }
    return planResponse.data;
  }

  const planResponse = await supabase
    .from("client_nutrition_plans")
    .select("*")
    .eq("client_id", clientId)
    .in("status", ["active", "paused"])
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  throwOnError(planResponse);
  return planResponse.data || null;
}

async function upsertRecentFoods(supabase, clientId, mealType, normalizedItems) {
  const distinctFoodIds = Array.from(new Set((normalizedItems || []).map((item) => item.food_id).filter(Boolean)));
  const now = new Date().toISOString();

  for (const foodId of distinctFoodIds) {
    const existingResponse = await supabase
      .from("client_food_recent")
      .select("*")
      .eq("client_id", clientId)
      .eq("food_id", foodId)
      .maybeSingle();
    throwOnError(existingResponse);

    if (existingResponse.data?.id) {
      const updateResponse = await supabase
        .from("client_food_recent")
        .update({
          use_count: Number(existingResponse.data.use_count || 0) + 1,
          last_used_at: now,
          last_meal_type: mealType,
        })
        .eq("id", existingResponse.data.id);
      throwOnError(updateResponse);
      continue;
    }

    const insertResponse = await supabase
      .from("client_food_recent")
      .insert({
        client_id: clientId,
        food_id: foodId,
        use_count: 1,
        last_used_at: now,
        last_meal_type: mealType,
      });
    throwOnError(insertResponse);
  }
}

async function syncMealDiaryToNutritionLog(supabase, authProfile, options) {
  const nutritionPlan = options?.nutritionPlan;
  if (!nutritionPlan?.id) {
    return null;
  }

  const clientId = options.clientId;
  const logDate = options.logDate;
  const logResponse = await supabase
    .from("client_meal_entries")
    .select("*")
    .eq("client_id", clientId)
    .eq("log_date", logDate)
    .order("created_at", { ascending: false });
  throwOnError(logResponse);

  const mealEntries = logResponse.data || [];
  const itemResponse = mealEntries.length
    ? await supabase
        .from("client_meal_items")
        .select("*")
        .in(
          "meal_entry_id",
          mealEntries.map((entry) => entry.id)
        )
    : { data: [], error: null };
  throwOnError(itemResponse);

  const totals = mealEntries.reduce(
    (accumulator, entry) => ({
      calories: roundValue(accumulator.calories + Number(entry.total_calories_kcal || 0)),
      protein: roundValue(accumulator.protein + Number(entry.total_protein_g || 0)),
      carbs: roundValue(accumulator.carbs + Number(entry.total_carbs_g || 0)),
      fat: roundValue(accumulator.fat + Number(entry.total_fat_g || 0)),
      balancedMeals: accumulator.balancedMeals + (isBalancedMeal(entry) ? 1 : 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, balancedMeals: 0 }
  );

  const existingResponse = await supabase
    .from("client_nutrition_logs")
    .select("*")
    .eq("client_id", clientId)
    .eq("nutrition_plan_id", nutritionPlan.id)
    .eq("log_date", logDate)
    .maybeSingle();
  throwOnError(existingResponse);
  const existing = existingResponse.data || null;

  const reviewStatus =
    authProfile.role === "client"
      ? (String(existing?.review_status || "").toLowerCase() === "approved" ? "pending" : existing?.review_status || "pending")
      : "approved";
  const nextStatus =
    mealEntries.length >= 3
      ? "on_plan"
      : mealEntries.length >= 1
        ? "partial"
        : existing?.status || "off_plan";

  const upsertResponse = await supabase
    .from("client_nutrition_logs")
    .upsert(
      {
        client_id: clientId,
        coach_id: options.coachId || nutritionPlan.coach_id || null,
        nutrition_plan_id: nutritionPlan.id,
        log_date: logDate,
        status: nextStatus,
        balanced_meals_count: totals.balancedMeals,
        meal_prep_completed: Boolean(existing?.meal_prep_completed),
        hydration_target_hit: Boolean(existing?.hydration_target_hit),
        protein_target_hit:
          Boolean(existing?.protein_target_hit)
          || (Number(nutritionPlan.protein_target_g || 0) > 0 && totals.protein >= Number(nutritionPlan.protein_target_g || 0) * 0.95),
        calories_logged: Math.round(totals.calories),
        protein_logged_g: Math.round(totals.protein),
        carbs_logged_g: Math.round(totals.carbs),
        fat_logged_g: Math.round(totals.fat),
        note: existing?.note || null,
        evidence: Array.isArray(existing?.evidence) ? existing.evidence : [],
        review_status: reviewStatus,
        reviewed_by: reviewStatus === "approved" ? authProfile.id : existing?.reviewed_by || null,
        reviewed_at: reviewStatus === "approved" ? new Date().toISOString() : existing?.reviewed_at || null,
        metadata: {
          ...(existing?.metadata && typeof existing.metadata === "object" ? existing.metadata : {}),
          mealDiarySync: {
            syncedAt: new Date().toISOString(),
            mealCount: mealEntries.length,
            itemCount: (itemResponse.data || []).length,
            balancedMealHeuristic: "protein>=20g and calories between 250 and 1100",
          },
        },
      },
      {
        onConflict: "client_id,nutrition_plan_id,log_date",
      }
    )
    .select("*")
    .single();
  throwOnError(upsertResponse);
  return upsertResponse.data;
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

    const clientId =
      normalizeText(body.clientId || body.client_id)
      || (auth.profile.role === "client" ? auth.profile.id : "");
    if (!clientId) {
      throw createHttpError(400, "Client ID is required.");
    }

    await requireManagedClientAccess(supabase, auth.profile, clientId);

    const nutritionPlan = await resolveNutritionPlan(
      supabase,
      clientId,
      normalizeText(body.nutritionPlanId || body.nutrition_plan_id)
    );
    const coachId =
      (auth.profile.role === "coach" ? auth.profile.id : "")
      || normalizeText(body.coachId || body.coach_id)
      || nutritionPlan?.coach_id
      || (await resolveAssignedCoachId(supabase, clientId));

    const rawItems = Array.isArray(body.items) ? body.items : [];
    const items = [];
    for (const item of rawItems) {
      const foodId = normalizeText(item.foodId || item.food_id);
      const externalFood = item.externalFood || item.external_food;
      if (foodId.startsWith("external:") && externalFood && typeof externalFood === "object") {
        const imported = await upsertExternalFoodRecord(supabase, auth.profile, externalFood);
        items.push({
          ...item,
          foodId: imported?.food?.id || foodId,
          servingId: imported?.servings?.find((serving) => serving.is_default)?.id || imported?.servings?.[0]?.id || "",
        });
        continue;
      }
      items.push(item);
    }
    if (!items.length) {
      throw createHttpError(400, "Add at least one food item before saving the meal.");
    }

    const foodIds = Array.from(
      new Set(items.map((item) => normalizeText(item.foodId || item.food_id)).filter(Boolean))
    );
    if (!foodIds.length) {
      throw createHttpError(400, "Meal items must include valid food selections.");
    }

    const foodsResponse = await supabase.from("food_library").select("*").in("id", foodIds);
    throwOnError(foodsResponse);
    const foods = foodsResponse.data || [];
    const foodById = new Map(foods.map((food) => [food.id, food]));
    if (foodById.size !== foodIds.length) {
      throw createHttpError(400, "One or more selected foods are no longer available.");
    }

    const servingIds = Array.from(
      new Set(items.map((item) => normalizeText(item.servingId || item.serving_id)).filter(Boolean))
    );
    const servingsResponse = servingIds.length
      ? await supabase.from("food_servings").select("*").in("id", servingIds)
      : { data: [], error: null };
    throwOnError(servingsResponse);
    const servingsById = new Map((servingsResponse.data || []).map((serving) => [serving.id, serving]));

    const normalizedItems = items.map((item, index) => {
      const foodId = normalizeText(item.foodId || item.food_id);
      const food = foodById.get(foodId);
      if (!food) {
        throw createHttpError(400, "Selected food could not be loaded.");
      }

      const servingId = normalizeText(item.servingId || item.serving_id);
      const serving = servingId ? servingsById.get(servingId) : null;
      if (servingId && (!serving || serving.food_id !== foodId)) {
        throw createHttpError(400, "Serving selection does not match the chosen food.");
      }

      const quantity = normalizeNumber(item.quantity) || 1;
      const gramsOverride = normalizeNumber(item.grams);
      const baseServingGrams = serving ? Number(serving.grams || 0) : Number(food.serving_basis_g || 100);
      const grams = roundValue(gramsOverride || (baseServingGrams * quantity));
      if (!grams || grams <= 0) {
        throw createHttpError(400, "Each meal item needs a valid gram value.");
      }

      const basis = Number(food.serving_basis_g || 100) || 100;
      const factor = grams / basis;

      return {
        sort_order: index,
        client_id: clientId,
        coach_id: coachId,
        food_id: food.id,
        recipe_id: null,
        serving_id: serving?.id || null,
        item_name: normalizeText(item.itemName || item.item_name || food.name) || food.name,
        quantity,
        grams,
        calories_kcal: roundValue(Number(food.calories_kcal || 0) * factor),
        protein_g: roundValue(Number(food.protein_g || 0) * factor),
        carbs_g: roundValue(Number(food.carbs_g || 0) * factor),
        fat_g: roundValue(Number(food.fat_g || 0) * factor),
        fiber_g: roundValue(Number(food.fiber_g || 0) * factor),
        sugar_g: roundValue(Number(food.sugar_g || 0) * factor),
        sodium_mg: roundValue(Number(food.sodium_mg || 0) * factor),
        note: normalizeNullableText(item.note),
        metadata: normalizeJson(
          {
            servingLabel: serving?.label || null,
            dataSource: food.data_source || "manual",
          },
          {}
        ),
      };
    });

    const totals = normalizedItems.reduce(
      (accumulator, item) => ({
        totalCaloriesKcal: roundValue(accumulator.totalCaloriesKcal + Number(item.calories_kcal || 0)),
        totalProteinG: roundValue(accumulator.totalProteinG + Number(item.protein_g || 0)),
        totalCarbsG: roundValue(accumulator.totalCarbsG + Number(item.carbs_g || 0)),
        totalFatG: roundValue(accumulator.totalFatG + Number(item.fat_g || 0)),
        totalFiberG: roundValue(accumulator.totalFiberG + Number(item.fiber_g || 0)),
        totalSugarG: roundValue(accumulator.totalSugarG + Number(item.sugar_g || 0)),
        totalSodiumMg: roundValue(accumulator.totalSodiumMg + Number(item.sodium_mg || 0)),
      }),
      {
        totalCaloriesKcal: 0,
        totalProteinG: 0,
        totalCarbsG: 0,
        totalFatG: 0,
        totalFiberG: 0,
        totalSugarG: 0,
        totalSodiumMg: 0,
      }
    );

    const rawMealType = normalizeText(body.mealType || body.meal_type || "other").toLowerCase();
    const mealType = ALLOWED_MEAL_TYPES.has(rawMealType) ? rawMealType : "other";
    const rawSourceType = normalizeText(body.sourceType || body.source_type || "manual").toLowerCase();
    const sourceType = ALLOWED_SOURCE_TYPES.has(rawSourceType) ? rawSourceType : "manual";
    const nutritionPhotoSubmissionId = normalizeText(body.nutritionPhotoSubmissionId || body.nutrition_photo_submission_id);
    const reviewStatus = auth.profile.role === "client" ? "pending" : "approved";

    if (nutritionPhotoSubmissionId) {
      const photoSubmissionResponse = await supabase
        .from("nutrition_photo_submissions")
        .select("*")
        .eq("id", nutritionPhotoSubmissionId)
        .maybeSingle();
      throwOnError(photoSubmissionResponse);
      if (!photoSubmissionResponse.data?.id || photoSubmissionResponse.data.client_id !== clientId) {
        throw createHttpError(400, "Linked meal-photo submission is not available for this client.");
      }
    }

    const mealEntryResponse = await supabase
      .from("client_meal_entries")
      .insert({
        client_id: clientId,
        coach_id: coachId,
        nutrition_plan_id: nutritionPlan?.id || null,
        log_date: normalizeDateOnly(body.logDate || body.log_date) || new Date().toISOString().slice(0, 10),
        meal_type: mealType,
        title: normalizeNullableText(body.title) || null,
        note: normalizeNullableText(body.note),
        source_type: sourceType,
        review_status: reviewStatus,
        reviewed_by: reviewStatus === "approved" ? auth.profile.id : null,
        reviewed_at: reviewStatus === "approved" ? new Date().toISOString() : null,
        total_calories_kcal: totals.totalCaloriesKcal,
        total_protein_g: totals.totalProteinG,
        total_carbs_g: totals.totalCarbsG,
        total_fat_g: totals.totalFatG,
        total_fiber_g: totals.totalFiberG,
        total_sugar_g: totals.totalSugarG,
        total_sodium_mg: totals.totalSodiumMg,
        metadata: normalizeJson(
          {
            ...(body.metadata && typeof body.metadata === "object" ? body.metadata : {}),
            nutritionPhotoSubmissionId: nutritionPhotoSubmissionId || null,
          },
          {}
        ),
      })
      .select("*")
      .single();
    throwOnError(mealEntryResponse);
    const mealEntry = mealEntryResponse.data;

    const mealItemRows = normalizedItems.map((item) => ({
      ...item,
      meal_entry_id: mealEntry.id,
    }));
    const mealItemsResponse = await supabase.from("client_meal_items").insert(mealItemRows).select("*");
    throwOnError(mealItemsResponse);

    if (nutritionPhotoSubmissionId) {
      const photoLinkResponse = await supabase
        .from("nutrition_photo_submissions")
        .update({
          linked_meal_entry_id: mealEntry.id,
          candidate_status: "linked",
        })
        .eq("id", nutritionPhotoSubmissionId);
      throwOnError(photoLinkResponse);
    }

    await upsertRecentFoods(supabase, clientId, mealType, normalizedItems);
    const syncedNutritionLog = await syncMealDiaryToNutritionLog(supabase, auth.profile, {
      clientId,
      coachId,
      nutritionPlan,
      logDate: mealEntry.log_date,
    });

    if (auth.profile.role === "client") {
      await notifyClientAndCoach(supabase, {
        category: "planner",
        coachId,
        coachTitle: "Client meal entry submitted",
        coachBody: `${mealEntry.title || mealType.replace(/_/gu, " ")} was logged and is ready for review.`,
        coachActionUrl: "./coach-programming.html",
      }).catch(() => null);
    }

    return json(
      200,
      {
        ok: true,
        mealEntry,
        mealItems: mealItemsResponse.data || [],
        nutritionLog: syncedNutritionLog,
        message: "Meal entry saved.",
      },
      { "Cache-Control": "no-store" }
    );
  } catch (error) {
    return json(
      Number(error?.statusCode || 500),
      { error: error?.message || "Unable to save the meal entry right now." },
      { "Cache-Control": "no-store" }
    );
  }
};
