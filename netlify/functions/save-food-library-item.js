const { json, methodNotAllowed, noContent } = require("./_lib/http");
const {
  createHttpError,
  normalizeArray,
  normalizeBoolean,
  normalizeJson,
  normalizeNullableText,
  normalizeNumber,
  normalizeText,
  parseBody,
  requireAllowedRole,
  throwOnError,
} = require("./_lib/planner");
const { getAuthenticatedProfile, getServiceSupabase } = require("./_lib/supabase");

function normalizeServingRows(value, defaultServingLabel, defaultServingGrams) {
  const rows = Array.isArray(value) ? value : [];
  const normalized = rows
    .map((entry, index) => ({
      sortOrder: Number.isFinite(Number(entry.sortOrder)) ? Number(entry.sortOrder) : index + 1,
      label: normalizeText(entry.label),
      grams: normalizeNumber(entry.grams),
      unitCount: normalizeNumber(entry.unitCount) || 1,
      isDefault: normalizeBoolean(entry.isDefault, false),
    }))
    .filter((entry) => entry.label && entry.grams && entry.grams > 0);

  const fallbackLabel = normalizeText(defaultServingLabel || "100 g");
  const fallbackGrams = normalizeNumber(defaultServingGrams) || 100;
  if (!normalized.length) {
    return [
      {
        sortOrder: 0,
        label: fallbackLabel,
        grams: fallbackGrams,
        unitCount: 1,
        isDefault: true,
      },
    ];
  }

  if (!normalized.some((entry) => entry.isDefault)) {
    normalized[0].isDefault = true;
  }

  return normalized.map((entry, index) => ({
    ...entry,
    sortOrder: index,
  }));
}

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
    requireAllowedRole(auth.profile, ["coach", "super_admin"]);

    const input = body.food || body;
    const foodId = normalizeText(input.id);
    const servingBasisG = normalizeNumber(input.servingBasisG || input.serving_basis_g) || 100;
    const row = {
      data_source: normalizeText(input.dataSource || input.data_source || "manual") || "manual",
      source_key: normalizeNullableText(input.sourceKey || input.source_key),
      owner_id: auth.profile.role === "coach" ? auth.profile.id : normalizeNullableText(input.ownerId || input.owner_id || auth.profile.id),
      created_by: auth.profile.id,
      visibility_scope:
        auth.profile.role === "coach"
          ? "coach"
          : normalizeText(input.visibilityScope || input.visibility_scope || "system") || "system",
      name: normalizeText(input.name),
      brand_name: normalizeNullableText(input.brandName || input.brand_name),
      food_group: normalizeNullableText(input.foodGroup || input.food_group),
      country_code: normalizeNullableText(input.countryCode || input.country_code || "MY"),
      serving_basis_g: servingBasisG,
      calories_kcal: normalizeNumber(input.caloriesKcal || input.calories_kcal),
      protein_g: normalizeNumber(input.proteinG || input.protein_g),
      carbs_g: normalizeNumber(input.carbsG || input.carbs_g),
      fat_g: normalizeNumber(input.fatG || input.fat_g),
      fiber_g: normalizeNumber(input.fiberG || input.fiber_g),
      sugar_g: normalizeNumber(input.sugarG || input.sugar_g),
      sodium_mg: normalizeNumber(input.sodiumMg || input.sodium_mg),
      is_verified: auth.profile.role === "super_admin" ? normalizeBoolean(input.isVerified ?? input.is_verified, false) : false,
      is_active: normalizeBoolean(input.isActive ?? input.is_active, true),
      notes: normalizeNullableText(input.notes),
      search_tags: normalizeArray(input.searchTags || input.search_tags || input.tags),
      metadata: normalizeJson(input.metadata, {}),
    };

    if (!row.name) {
      throw createHttpError(400, "Food name is required.");
    }

    if (!row.calories_kcal && row.calories_kcal !== 0) {
      throw createHttpError(400, "Calories per base serving are required.");
    }

    const servings = normalizeServingRows(
      body.servings || input.servings,
      input.defaultServingLabel || input.default_serving_label,
      input.defaultServingGrams || input.default_serving_grams || servingBasisG
    );

    let savedFood = null;
    if (foodId) {
      const existingResponse = await supabase.from("food_library").select("*").eq("id", foodId).maybeSingle();
      throwOnError(existingResponse);
      if (!existingResponse.data?.id) {
        throw createHttpError(404, "Food entry not found.");
      }
      if (
        auth.profile.role !== "super_admin"
        && existingResponse.data.owner_id !== auth.profile.id
        && existingResponse.data.created_by !== auth.profile.id
      ) {
        throw createHttpError(403, "You do not have permission to edit this food entry.");
      }

      const updateResponse = await supabase
        .from("food_library")
        .update({
          ...row,
          created_by: existingResponse.data.created_by || row.created_by,
        })
        .eq("id", foodId)
        .select("*")
        .single();
      throwOnError(updateResponse);
      savedFood = updateResponse.data;

      const deleteServingsResponse = await supabase.from("food_servings").delete().eq("food_id", foodId);
      throwOnError(deleteServingsResponse);
    } else {
      const insertResponse = await supabase.from("food_library").insert(row).select("*").single();
      throwOnError(insertResponse);
      savedFood = insertResponse.data;
    }

    const servingRows = servings.map((serving, index) => ({
      food_id: savedFood.id,
      sort_order: index,
      label: serving.label,
      grams: serving.grams,
      unit_count: serving.unitCount || 1,
      is_default: Boolean(serving.isDefault),
      metadata: {},
    }));

    const servingsResponse = await supabase.from("food_servings").insert(servingRows).select("*");
    throwOnError(servingsResponse);

    return json(
      200,
      {
        ok: true,
        food: savedFood,
        servings: servingsResponse.data || [],
        message: foodId ? "Food library item updated." : "Food library item saved.",
      },
      { "Cache-Control": "no-store" }
    );
  } catch (error) {
    return json(
      Number(error?.statusCode || 500),
      { error: error?.message || "Unable to save the food-library item right now." },
      { "Cache-Control": "no-store" }
    );
  }
};
