const { json, methodNotAllowed, noContent } = require("./_lib/http");
const {
  normalizeText,
  parseBody,
  requireAllowedRole,
  throwOnError,
} = require("./_lib/planner");
const {
  buildSearchHaystack,
  buildServingsByFoodId,
  buildSourceMappingsByFoodId,
  foodIsVisibleToUser,
  normalizeFoodRecord,
  resolveFoodVisibilityContext,
} = require("./_lib/nutrition-catalog");
const { searchFatsecretFoods, probeFatsecretHealth } = require("./_lib/nutrition-provider-fatsecret");
const { getNutritionProviderStatus } = require("./_lib/nutrition-provider-registry");
const { getAuthenticatedProfile, getServiceSupabase } = require("./_lib/supabase");

function normalizeInteger(value, fallback = 12) {
  const parsed = Number.parseInt(String(value || ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function normalizeBoolean(value, fallback = true) {
  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized) {
    return fallback;
  }
  if (["1", "true", "yes", "y"].includes(normalized)) {
    return true;
  }
  if (["0", "false", "no", "n"].includes(normalized)) {
    return false;
  }
  return fallback;
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return noContent({ "Cache-Control": "no-store" });
  }

  if (!["GET", "POST"].includes(event.httpMethod)) {
    return methodNotAllowed("GET, POST, OPTIONS");
  }

  const supabase = getServiceSupabase();
  const auth = await getAuthenticatedProfile(event, supabase);
  if (!auth?.profile) {
    return json(401, { error: "A valid authenticated session is required." }, { "Cache-Control": "no-store" });
  }

  try {
    requireAllowedRole(auth.profile, ["client", "coach", "super_admin"]);

    const body = event.httpMethod === "POST" ? parseBody(event) || {} : {};
    const query = normalizeText(
      body.q
      || body.query
      || event.queryStringParameters?.q
      || event.queryStringParameters?.query
    ).toLowerCase();
    const limit = Math.min(30, normalizeInteger(body.limit || event.queryStringParameters?.limit, 12));
    const includeExternal = normalizeBoolean(
      body.includeExternal
      || body.include_external
      || event.queryStringParameters?.includeExternal
      || event.queryStringParameters?.include_external,
      true
    );
    const context = await resolveFoodVisibilityContext(supabase, auth.profile);
    const tokens = query ? query.split(/\s+/u).filter(Boolean) : [];
    const providerStatus = getNutritionProviderStatus();
    const fatsecretHealth = includeExternal && query && providerStatus.fatsecret.configured
      ? await probeFatsecretHealth().catch(() => null)
      : null;

    const candidateLimit = Math.max(limit * 6, 96);
    const [foodResponse, favoriteResponse] = await Promise.all([
      supabase
        .from("food_library")
        .select("*")
        .eq("is_active", true)
        .order("is_verified", { ascending: false })
        .order("updated_at", { ascending: false })
        .limit(candidateLimit),
      auth.profile.role === "client"
        ? supabase.from("client_food_favorites").select("food_id").eq("client_id", auth.profile.id)
        : Promise.resolve({ data: [], error: null }),
    ]);
    throwOnError(foodResponse);
    throwOnError(favoriteResponse);

    const favoriteFoodIds = new Set((favoriteResponse.data || []).map((entry) => entry.food_id).filter(Boolean));
    const visibleFoods = (foodResponse.data || [])
      .filter((food) => foodIsVisibleToUser(food, context))
      .filter((food) => {
        if (!tokens.length) {
          return true;
        }
        const haystack = buildSearchHaystack(food);
        return tokens.every((token) => haystack.includes(token));
      })
      .slice(0, limit);

    const [servingsResponse, sourceMappingsResponse] = await Promise.all([
      visibleFoods.length
        ? supabase
            .from("food_servings")
            .select("*")
            .in(
              "food_id",
              visibleFoods.map((food) => food.id)
            )
            .order("sort_order", { ascending: true })
        : Promise.resolve({ data: [], error: null }),
      visibleFoods.length
        ? supabase
            .from("food_source_mappings")
            .select("*")
            .in(
              "food_id",
              visibleFoods.map((food) => food.id)
            )
        : Promise.resolve({ data: [], error: null }),
    ]);
    throwOnError(servingsResponse);
    throwOnError(sourceMappingsResponse);

    const servingsByFoodId = buildServingsByFoodId(servingsResponse.data || []);
    const sourceMappingsByFoodId = buildSourceMappingsByFoodId(sourceMappingsResponse.data || []);
    const externalFoods = includeExternal && query && fatsecretHealth?.state !== "blocked"
      ? await searchFatsecretFoods(query, { maxResults: Math.min(8, limit) }).catch(() => [])
      : [];

    return json(
      200,
      {
        ok: true,
        foods: visibleFoods.map((food) => normalizeFoodRecord(food, servingsByFoodId, sourceMappingsByFoodId, { favoriteFoodIds })),
        externalFoods,
        providers: {
          localLibrary: providerStatus.localLibrary.configured,
          fatsecret: providerStatus.fatsecret.configured,
          fatsecretState: fatsecretHealth?.state || (providerStatus.fatsecret.configured ? "ready" : "unavailable"),
        },
      },
      { "Cache-Control": "no-store" }
    );
  } catch (error) {
    return json(
      Number(error?.statusCode || 500),
      { error: error?.message || "Unable to search the food library right now." },
      { "Cache-Control": "no-store" }
    );
  }
};
