const { json, methodNotAllowed, noContent } = require("./_lib/http");
const { requireAllowedRole } = require("./_lib/planner");
const { getNutritionProviderStatus, listActiveHybridRoles } = require("./_lib/nutrition-provider-registry");
const { probeFatsecretHealth } = require("./_lib/nutrition-provider-fatsecret");
const { getOrSetRuntimeCache } = require("./_lib/runtime-cache");
const { getAuthenticatedProfile, getServiceSupabase } = require("./_lib/supabase");

const STATUS_CACHE = new Map();
const HEALTH_TTL_MS = 5 * 60 * 1000;

function hasRecentProvider(activityRows, needle) {
  const normalizedNeedle = String(needle || "").toLowerCase();
  return (activityRows || []).find((row) => String(row?.ai_provider || "").toLowerCase().includes(normalizedNeedle)) || null;
}

function findRecentProviderError(activityRows, providerKey) {
  return (activityRows || []).find((row) => {
    const errors = row?.metadata?.providerMetadata?.providerErrors;
    return errors && typeof errors === "object" && String(errors[providerKey] || "").trim();
  }) || null;
}

function createStaticProviderHealth(provider, state, message, extras = {}) {
  return {
    ...provider,
    health: state,
    message,
    ...extras,
  };
}

async function buildProviderHealthSnapshot(supabase) {
  const providers = getNutritionProviderStatus();
  const recentActivityResponse = await supabase
    .from("nutrition_photo_submissions")
    .select("created_at, ai_provider, extraction_status, metadata")
    .order("created_at", { ascending: false })
    .limit(40);

  const recentFoodResponse = await supabase
    .from("food_library")
    .select("id", { count: "exact", head: true })
    .eq("is_active", true);

  if (recentActivityResponse.error) {
    throw recentActivityResponse.error;
  }
  if (recentFoodResponse.error) {
    throw recentFoodResponse.error;
  }

  const recentActivity = recentActivityResponse.data || [];
  const recentFoodCount = Number(recentFoodResponse.count || 0);

  const lastLogmealSuccess = hasRecentProvider(recentActivity, "logmeal");
  const lastOpenAiSuccess = hasRecentProvider(recentActivity, "openai:");
  const recentLogmealError = findRecentProviderError(recentActivity, "logmeal");
  const recentOpenAiError = findRecentProviderError(recentActivity, "openai");
  const fatsecretProbe = await probeFatsecretHealth();

  return {
    checkedAt: new Date().toISOString(),
    recentSignals: {
      nutritionPhotoSamples: recentActivity.length,
      activeFoodLibraryItems: recentFoodCount,
    },
    providers: {
      localLibrary: createStaticProviderHealth(
        providers.localLibrary,
        "healthy",
        `${recentFoodCount.toLocaleString("en-MY")} active foods are available in the canonical LEGACY library.`
      ),
      myfcdReference: createStaticProviderHealth(
        providers.myfcdReference,
        "healthy",
        "Malaysian food aliases and reference mappings are active in the local nutrition layer."
      ),
      fatsecret: {
        ...providers.fatsecret,
        health: fatsecretProbe.state,
        message: fatsecretProbe.message,
        checkedAt: fatsecretProbe.checkedAt,
      },
      logmeal: providers.logmeal.configured
        ? {
            ...providers.logmeal,
            health: lastLogmealSuccess ? "healthy" : recentLogmealError ? "degraded" : "ready",
            message: lastLogmealSuccess
              ? `Meal-photo recognition has recent live traffic. Last detected ${lastLogmealSuccess.created_at}.`
              : recentLogmealError
                ? String(recentLogmealError.metadata?.providerMetadata?.providerErrors?.logmeal || "Recent LogMeal analysis degraded.")
                : "Configured and ready. Waiting for the next live meal-photo submission.",
            lastSuccessAt: lastLogmealSuccess?.created_at || null,
          }
        : createStaticProviderHealth(providers.logmeal, "unavailable", "LogMeal is not configured."),
      openai: providers.openai.configured
        ? {
            ...providers.openai,
            health: lastOpenAiSuccess ? "healthy" : recentOpenAiError ? "degraded" : "ready",
            message: lastOpenAiSuccess
              ? `OpenAI reconciliation has recent live traffic. Last used ${lastOpenAiSuccess.created_at}.`
              : recentOpenAiError
                ? String(recentOpenAiError.metadata?.providerMetadata?.providerErrors?.openai || "Recent OpenAI reconciliation degraded.")
                : "Configured and ready. Reruns with correction notes will activate OpenAI reconciliation.",
            lastSuccessAt: lastOpenAiSuccess?.created_at || null,
          }
        : createStaticProviderHealth(providers.openai, "unavailable", "OpenAI is not configured."),
    },
    hybridRoles: listActiveHybridRoles(),
  };
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return noContent({ "Cache-Control": "no-store" });
  }

  if (event.httpMethod !== "GET") {
    return methodNotAllowed("GET, OPTIONS");
  }

  const supabase = getServiceSupabase();
  const auth = await getAuthenticatedProfile(event, supabase);
  if (!auth?.profile) {
    return json(401, { error: "A valid authenticated session is required." }, { "Cache-Control": "no-store" });
  }

  try {
    requireAllowedRole(auth.profile, ["client", "coach", "super_admin"]);
    const refreshRequested = ["1", "true", "yes"].includes(String(event.queryStringParameters?.refresh || "").toLowerCase());
    const payload = refreshRequested
      ? await buildProviderHealthSnapshot(supabase)
      : await getOrSetRuntimeCache(STATUS_CACHE, "nutrition-provider-status", HEALTH_TTL_MS, () => buildProviderHealthSnapshot(supabase));

    return json(
      200,
      {
        ok: true,
        ...payload,
      },
      { "Cache-Control": "no-store" }
    );
  } catch (error) {
    return json(
      Number(error?.statusCode || 500),
      { error: error?.message || "Unable to load nutrition provider status right now." },
      { "Cache-Control": "no-store" }
    );
  }
};
