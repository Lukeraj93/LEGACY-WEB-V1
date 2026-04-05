const { normalizeText, throwOnError } = require("./planner");
const { resolvePrimaryCoachForClient } = require("./supabase");

function buildSearchHaystack(food) {
  return [
    food.name,
    food.brand_name,
    food.food_group,
    food.country_code,
    food.notes,
    ...(Array.isArray(food.search_tags) ? food.search_tags : []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function foodIsVisibleToUser(food, context) {
  if (!food?.is_active) {
    return false;
  }

  if (context.role === "super_admin") {
    return true;
  }

  const scope = String(food.visibility_scope || "").toLowerCase();
  if (scope === "system" || scope === "public") {
    return true;
  }

  const ownerId = food.owner_id || food.created_by || "";
  if (!ownerId) {
    return false;
  }

  return context.ownerIds.has(ownerId);
}

function recipeIsVisibleToUser(recipe, context) {
  if (!recipe?.is_active) {
    return false;
  }

  if (context.role === "super_admin") {
    return true;
  }

  const scope = String(recipe.visibility_scope || "").toLowerCase();
  if (scope === "system" || scope === "public") {
    return true;
  }

  const ownerId = recipe.owner_id || recipe.created_by || "";
  if (!ownerId) {
    return false;
  }

  return context.ownerIds.has(ownerId);
}

async function resolveFoodVisibilityContext(supabase, profile) {
  const role = profile?.role || "";
  const userId = profile?.id || "";
  const ownerIds = new Set([userId]);

  if (role === "client" && userId) {
    const coachId = await resolvePrimaryCoachForClient(supabase, userId);
    if (coachId) {
      ownerIds.add(coachId);
    }
  }

  return { role, userId, ownerIds };
}

function buildServingsByFoodId(rows) {
  const map = new Map();
  (rows || []).forEach((serving) => {
    const list = map.get(serving.food_id) || [];
    list.push(serving);
    map.set(serving.food_id, list);
  });
  map.forEach((list) => {
    list.sort((left, right) => Number(left?.sort_order || 0) - Number(right?.sort_order || 0));
  });
  return map;
}

function buildSourceMappingsByFoodId(rows) {
  const map = new Map();
  (rows || []).forEach((mapping) => {
    const list = map.get(mapping.food_id) || [];
    list.push(mapping);
    map.set(mapping.food_id, list);
  });
  map.forEach((list) => {
    list.sort((left, right) => new Date(right?.updated_at || right?.created_at || 0).getTime() - new Date(left?.updated_at || left?.created_at || 0).getTime());
  });
  return map;
}

function normalizeFoodRecord(food, servingsByFoodId, mappingsByFoodId, options = {}) {
  const servings = (servingsByFoodId.get(food.id) || []).map((serving) => ({
    id: serving.id,
    label: serving.label,
    grams: Number(serving.grams || 0),
    unitCount: Number(serving.unit_count || 1),
    isDefault: Boolean(serving.is_default),
  }));
  const sourceMappings = (mappingsByFoodId.get(food.id) || []).map((mapping) => ({
    id: mapping.id,
    sourceSystem: mapping.source_system || "",
    sourceKey: mapping.source_key || "",
    sourceLabel: mapping.source_label || "",
    countryCode: mapping.country_code || "",
    confidenceScore: Number(mapping.confidence_score || 0),
    sourceUrl: mapping.source_url || "",
  }));

  return {
    id: food.id,
    name: food.name,
    brandName: food.brand_name || "",
    foodGroup: food.food_group || "",
    countryCode: food.country_code || "",
    dataSource: food.data_source || "manual",
    visibilityScope: food.visibility_scope || "system",
    servingBasisG: Number(food.serving_basis_g || 100),
    caloriesKcal: Number(food.calories_kcal || 0),
    proteinG: Number(food.protein_g || 0),
    carbsG: Number(food.carbs_g || 0),
    fatG: Number(food.fat_g || 0),
    fiberG: Number(food.fiber_g || 0),
    sugarG: Number(food.sugar_g || 0),
    sodiumMg: Number(food.sodium_mg || 0),
    isVerified: Boolean(food.is_verified),
    notes: food.notes || "",
    searchTags: Array.isArray(food.search_tags) ? food.search_tags : [],
    sourceMappings,
    servings,
    isFavorite: Boolean(options.favoriteFoodIds?.has(food.id)),
    isRecent: Boolean(options.recentFoodIds?.has(food.id)),
  };
}

function normalizeRecipeRecord(recipe) {
  const metadata = recipe?.metadata && typeof recipe.metadata === "object" ? recipe.metadata : {};
  const yieldServings = Number(recipe.yield_servings || 0) || 1;
  const totalCaloriesKcal = Number(recipe.total_calories_kcal || 0);
  const totalProteinG = Number(recipe.total_protein_g || 0);
  const totalCarbsG = Number(recipe.total_carbs_g || 0);
  const totalFatG = Number(recipe.total_fat_g || 0);
  return {
    id: recipe.id,
    title: recipe.title || "Recipe",
    description: recipe.description || "",
    visibilityScope: recipe.visibility_scope || "coach",
    yieldServings,
    defaultServingLabel: recipe.default_serving_label || "",
    totalWeightG: Number(recipe.total_weight_g || 0),
    totalCaloriesKcal,
    totalProteinG,
    totalCarbsG,
    totalFatG,
    perServingCaloriesKcal: totalCaloriesKcal / yieldServings,
    perServingProteinG: totalProteinG / yieldServings,
    perServingCarbsG: totalCarbsG / yieldServings,
    perServingFatG: totalFatG / yieldServings,
    countryCode: metadata.countryCode || "",
    searchTags: Array.isArray(metadata.searchTags) ? metadata.searchTags : [],
    isVerified: Boolean(metadata.isVerified),
    metadata,
  };
}

async function findFoodBySourceMapping(supabase, sourceSystem, sourceKey) {
  const normalizedSystem = normalizeText(sourceSystem).toLowerCase();
  const normalizedKey = normalizeText(sourceKey);
  if (!normalizedSystem || !normalizedKey) {
    return null;
  }

  const mappingResponse = await supabase
    .from("food_source_mappings")
    .select("food_id")
    .eq("source_system", normalizedSystem)
    .eq("source_key", normalizedKey)
    .maybeSingle();
  throwOnError(mappingResponse);
  if (!mappingResponse.data?.food_id) {
    return null;
  }

  const foodResponse = await supabase
    .from("food_library")
    .select("*")
    .eq("id", mappingResponse.data.food_id)
    .maybeSingle();
  throwOnError(foodResponse);
  return foodResponse.data || null;
}

function resolveImportedFoodVisibility(profile) {
  if (profile?.role === "super_admin") {
    return {
      ownerId: profile.id || null,
      visibilityScope: "system",
      isVerified: true,
    };
  }

  if (profile?.role === "coach") {
    return {
      ownerId: profile.id || null,
      visibilityScope: "coach",
      isVerified: false,
    };
  }

  return {
    ownerId: profile?.id || null,
    visibilityScope: "client",
    isVerified: false,
  };
}

async function upsertExternalFoodRecord(supabase, profile, providerFood) {
  const sourceSystem = normalizeText(providerFood?.provider || providerFood?.dataSource).toLowerCase();
  const sourceKey = normalizeText(providerFood?.providerKey || providerFood?.sourceKey);
  if (!sourceSystem || !sourceKey) {
    return null;
  }

  const existing = await findFoodBySourceMapping(supabase, sourceSystem, sourceKey);
  const visibility = resolveImportedFoodVisibility(profile);
  const baseRow = {
    data_source: ["fatsecret", "myfcd", "usda", "legacy"].includes(sourceSystem) ? sourceSystem : "manual",
    source_key: sourceKey,
    owner_id: visibility.ownerId,
    created_by: profile?.id || null,
    visibility_scope: visibility.visibilityScope,
    name: normalizeText(providerFood?.name || "Food"),
    brand_name: normalizeText(providerFood?.brandName),
    food_group: normalizeText(providerFood?.foodGroup || "external"),
    country_code: normalizeText(providerFood?.countryCode || "MY") || "MY",
    serving_basis_g: Number(providerFood?.servingBasisG || 100) || 100,
    calories_kcal: Number(providerFood?.caloriesKcal || 0) || 0,
    protein_g: Number(providerFood?.proteinG || 0) || 0,
    carbs_g: Number(providerFood?.carbsG || 0) || 0,
    fat_g: Number(providerFood?.fatG || 0) || 0,
    fiber_g: Number(providerFood?.fiberG || 0) || 0,
    sugar_g: Number(providerFood?.sugarG || 0) || 0,
    sodium_mg: Number(providerFood?.sodiumMg || 0) || 0,
    is_verified: visibility.isVerified,
    is_active: true,
    notes: normalizeText(providerFood?.notes),
    search_tags: Array.isArray(providerFood?.searchTags) ? providerFood.searchTags : [],
    metadata: providerFood?.metadata && typeof providerFood.metadata === "object" ? providerFood.metadata : {},
  };

  let savedFood = null;
  if (existing?.id) {
    const updateResponse = await supabase
      .from("food_library")
      .update(baseRow)
      .eq("id", existing.id)
      .select("*")
      .single();
    throwOnError(updateResponse);
    savedFood = updateResponse.data;

    const deleteServingsResponse = await supabase.from("food_servings").delete().eq("food_id", existing.id);
    throwOnError(deleteServingsResponse);
  } else {
    const insertResponse = await supabase.from("food_library").insert(baseRow).select("*").single();
    throwOnError(insertResponse);
    savedFood = insertResponse.data;
  }

  const servings = Array.isArray(providerFood?.servings) && providerFood.servings.length
    ? providerFood.servings
    : [
        {
          label: "100 g",
          grams: Number(providerFood?.servingBasisG || 100) || 100,
          unitCount: 1,
          isDefault: true,
        },
      ];

  const servingRows = servings.map((serving, index) => ({
    food_id: savedFood.id,
    sort_order: index,
    label: normalizeText(serving.label || "Serving"),
    grams: Number(serving.grams || savedFood.serving_basis_g || 100) || 100,
    unit_count: Number(serving.unitCount || 1) || 1,
    is_default: Boolean(index === 0 || serving.isDefault),
    metadata: serving.metadata && typeof serving.metadata === "object" ? serving.metadata : {},
  }));

  const servingsResponse = await supabase.from("food_servings").insert(servingRows).select("*");
  throwOnError(servingsResponse);

  const mappingRow = {
    food_id: savedFood.id,
    source_system: sourceSystem,
    source_key: sourceKey,
    source_label: normalizeText(providerFood?.name || savedFood.name),
    source_url: normalizeText(providerFood?.metadata?.url || providerFood?.sourceUrl),
    country_code: normalizeText(providerFood?.countryCode || savedFood.country_code || "MY") || "MY",
    confidence_score: Number(providerFood?.metadata?.confidenceScore || 0.9) || 0.9,
    metadata: providerFood?.metadata && typeof providerFood.metadata === "object" ? providerFood.metadata : {},
  };

  const mappingResponse = await supabase
    .from("food_source_mappings")
    .upsert(mappingRow, { onConflict: "food_id,source_system,source_key" })
    .select("*");
  throwOnError(mappingResponse);

  return {
    food: savedFood,
    servings: servingsResponse.data || [],
    mappings: mappingResponse.data || [],
  };
}

module.exports = {
  buildSearchHaystack,
  buildServingsByFoodId,
  buildSourceMappingsByFoodId,
  findFoodBySourceMapping,
  foodIsVisibleToUser,
  normalizeFoodRecord,
  normalizeRecipeRecord,
  recipeIsVisibleToUser,
  resolveFoodVisibilityContext,
  upsertExternalFoodRecord,
};
