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

function roundValue(value) {
  const numeric = Number(value || 0);
  return Number.isFinite(numeric) ? Math.round(numeric * 100) / 100 : 0;
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

    const input = body.recipe || body;
    const recipeId = normalizeText(input.id);
    const title = normalizeText(input.title);
    if (!title) {
      throw createHttpError(400, "Recipe title is required.");
    }

    const ingredientRows = Array.isArray(body.ingredients || input.ingredients) ? (body.ingredients || input.ingredients) : [];
    if (!ingredientRows.length) {
      throw createHttpError(400, "Add at least one ingredient before saving the recipe.");
    }

    const foodIds = Array.from(new Set(ingredientRows.map((entry) => normalizeText(entry.foodId || entry.food_id)).filter(Boolean)));
    if (!foodIds.length) {
      throw createHttpError(400, "Each ingredient must point to a valid food.");
    }

    const servingIds = Array.from(new Set(ingredientRows.map((entry) => normalizeText(entry.servingId || entry.serving_id)).filter(Boolean)));
    const [foodsResponse, servingsResponse] = await Promise.all([
      supabase.from("food_library").select("*").in("id", foodIds),
      servingIds.length
        ? supabase.from("food_servings").select("*").in("id", servingIds)
        : Promise.resolve({ data: [], error: null }),
    ]);
    throwOnError(foodsResponse);
    throwOnError(servingsResponse);

    const foodById = new Map((foodsResponse.data || []).map((food) => [food.id, food]));
    const servingById = new Map((servingsResponse.data || []).map((serving) => [serving.id, serving]));
    if (foodById.size !== foodIds.length) {
      throw createHttpError(400, "One or more ingredient foods are no longer available.");
    }

    const normalizedIngredients = ingredientRows.map((entry, index) => {
      const foodId = normalizeText(entry.foodId || entry.food_id);
      const food = foodById.get(foodId);
      if (!food) {
        throw createHttpError(400, "An ingredient food could not be loaded.");
      }

      const servingId = normalizeText(entry.servingId || entry.serving_id);
      const serving = servingId ? servingById.get(servingId) : null;
      if (servingId && (!serving || serving.food_id !== foodId)) {
        throw createHttpError(400, "Ingredient serving does not match its food.");
      }

      const quantity = normalizeNumber(entry.quantity) || 1;
      const gramsOverride = normalizeNumber(entry.grams);
      const grams = roundValue(
        gramsOverride
        || (Number(serving?.grams || 0) * quantity)
        || (Number(food.serving_basis_g || 100) * quantity)
      );
      if (!grams || grams <= 0) {
        throw createHttpError(400, "Every recipe ingredient needs a valid gram value.");
      }

      const basis = Number(food.serving_basis_g || 100) || 100;
      const factor = grams / basis;

      return {
        sort_order: index,
        food_id: food.id,
        serving_id: serving?.id || null,
        item_name: normalizeText(entry.itemName || entry.item_name || food.name) || food.name,
        quantity,
        grams,
        note: normalizeNullableText(entry.note),
        calories_kcal: roundValue(Number(food.calories_kcal || 0) * factor),
        protein_g: roundValue(Number(food.protein_g || 0) * factor),
        carbs_g: roundValue(Number(food.carbs_g || 0) * factor),
        fat_g: roundValue(Number(food.fat_g || 0) * factor),
        metadata: normalizeJson(
          {
            foodGroup: food.food_group || "",
            servingLabel: serving?.label || "",
            dataSource: food.data_source || "manual",
          },
          {}
        ),
      };
    });

    const totals = normalizedIngredients.reduce(
      (accumulator, ingredient) => ({
        totalWeightG: roundValue(accumulator.totalWeightG + Number(ingredient.grams || 0)),
        totalCaloriesKcal: roundValue(accumulator.totalCaloriesKcal + Number(ingredient.calories_kcal || 0)),
        totalProteinG: roundValue(accumulator.totalProteinG + Number(ingredient.protein_g || 0)),
        totalCarbsG: roundValue(accumulator.totalCarbsG + Number(ingredient.carbs_g || 0)),
        totalFatG: roundValue(accumulator.totalFatG + Number(ingredient.fat_g || 0)),
      }),
      {
        totalWeightG: 0,
        totalCaloriesKcal: 0,
        totalProteinG: 0,
        totalCarbsG: 0,
        totalFatG: 0,
      }
    );

    const recipeRow = {
      owner_id: auth.profile.role === "coach" ? auth.profile.id : normalizeNullableText(input.ownerId || input.owner_id || auth.profile.id),
      created_by: auth.profile.id,
      visibility_scope:
        auth.profile.role === "coach"
          ? "coach"
          : normalizeText(input.visibilityScope || input.visibility_scope || "system") || "system",
      title,
      description: normalizeNullableText(input.description),
      yield_servings: normalizeNumber(input.yieldServings || input.yield_servings) || 1,
      default_serving_label: normalizeNullableText(input.defaultServingLabel || input.default_serving_label || "1 serving"),
      total_weight_g: totals.totalWeightG,
      total_calories_kcal: totals.totalCaloriesKcal,
      total_protein_g: totals.totalProteinG,
      total_carbs_g: totals.totalCarbsG,
      total_fat_g: totals.totalFatG,
      is_active: normalizeBoolean(input.isActive ?? input.is_active, true),
      metadata: normalizeJson(
        {
          countryCode: normalizeNullableText(input.countryCode || input.country_code || "MY"),
          searchTags: normalizeArray(input.searchTags || input.search_tags),
          isVerified: auth.profile.role === "super_admin" ? normalizeBoolean(input.isVerified ?? input.is_verified, false) : false,
          notes: normalizeNullableText(input.notes),
        },
        {}
      ),
    };

    let savedRecipe = null;
    if (recipeId) {
      const existingResponse = await supabase.from("recipe_library").select("*").eq("id", recipeId).maybeSingle();
      throwOnError(existingResponse);
      if (!existingResponse.data?.id) {
        throw createHttpError(404, "Recipe entry not found.");
      }
      if (
        auth.profile.role !== "super_admin"
        && existingResponse.data.owner_id !== auth.profile.id
        && existingResponse.data.created_by !== auth.profile.id
      ) {
        throw createHttpError(403, "You do not have permission to edit this recipe.");
      }

      const updateResponse = await supabase
        .from("recipe_library")
        .update({
          ...recipeRow,
          created_by: existingResponse.data.created_by || recipeRow.created_by,
        })
        .eq("id", recipeId)
        .select("*")
        .single();
      throwOnError(updateResponse);
      savedRecipe = updateResponse.data;

      const deleteIngredientsResponse = await supabase.from("recipe_ingredients").delete().eq("recipe_id", recipeId);
      throwOnError(deleteIngredientsResponse);
    } else {
      const insertResponse = await supabase.from("recipe_library").insert(recipeRow).select("*").single();
      throwOnError(insertResponse);
      savedRecipe = insertResponse.data;
    }

    const ingredientInsertResponse = await supabase
      .from("recipe_ingredients")
      .insert(
        normalizedIngredients.map((ingredient) => ({
          recipe_id: savedRecipe.id,
          ...ingredient,
        }))
      )
      .select("*");
    throwOnError(ingredientInsertResponse);

    return json(
      200,
      {
        ok: true,
        recipe: savedRecipe,
        ingredients: ingredientInsertResponse.data || [],
        message: recipeId ? "Recipe updated." : "Recipe saved.",
      },
      { "Cache-Control": "no-store" }
    );
  } catch (error) {
    return json(
      Number(error?.statusCode || 500),
      { error: error?.message || "Unable to save the recipe right now." },
      { "Cache-Control": "no-store" }
    );
  }
};
