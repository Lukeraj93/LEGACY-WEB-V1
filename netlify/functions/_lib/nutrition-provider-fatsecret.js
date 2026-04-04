const { getOrSetRuntimeCache } = require("./runtime-cache");

const TOKEN_CACHE = new Map();
const HEALTH_CACHE = new Map();
const API_BASE_URL = "https://platform.fatsecret.com/rest/server.api";
const TOKEN_URL = "https://oauth.fatsecret.com/connect/token";

function normalizeText(value) {
  return String(value || "").trim();
}

function buildFatsecretError(payload) {
  const errorCode = String(payload?.error?.code || payload?.error_code || "").trim();
  const message = normalizeText(payload?.error?.message || payload?.error_message || "");
  const error = new Error(message || "FatSecret request failed.");
  error.fatsecretCode = errorCode;
  if (errorCode === "21" || /invalid ip address/iu.test(message)) {
    error.fatsecretState = "blocked";
  } else {
    error.fatsecretState = "degraded";
  }
  return error;
}

function fatsecretConfigured() {
  return Boolean(
    normalizeText(process.env.FATSECRET_CLIENT_ID)
    && normalizeText(process.env.FATSECRET_CLIENT_SECRET)
  );
}

async function getFatsecretToken() {
  const clientId = normalizeText(process.env.FATSECRET_CLIENT_ID);
  const clientSecret = normalizeText(process.env.FATSECRET_CLIENT_SECRET);
  const scope = normalizeText(process.env.FATSECRET_SCOPE || "basic");
  if (!clientId || !clientSecret) {
    return null;
  }

  const cacheKey = `${clientId}:${scope}`;
  return getOrSetRuntimeCache(TOKEN_CACHE, cacheKey, 50 * 60 * 1000, async () => {
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    const response = await fetch(TOKEN_URL, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        scope,
      }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`FatSecret token request failed (${response.status}): ${text || "Unknown error"}`);
    }

    const payload = await response.json();
    return {
      accessToken: payload.access_token,
      tokenType: payload.token_type || "Bearer",
    };
  });
}

async function fatsecretRequest(params) {
  const token = await getFatsecretToken();
  if (!token?.accessToken) {
    return null;
  }

  const body = new URLSearchParams({
    format: "json",
    ...params,
  });

  const response = await fetch(API_BASE_URL, {
    method: "POST",
    headers: {
      Authorization: `${token.tokenType} ${token.accessToken}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`FatSecret API request failed (${response.status}): ${text || "Unknown error"}`);
  }

  const payload = await response.json();
  if (payload?.error || payload?.error_message || payload?.error_code) {
    throw buildFatsecretError(payload);
  }

  return payload;
}

function asArray(value) {
  if (Array.isArray(value)) {
    return value;
  }
  if (!value) {
    return [];
  }
  return [value];
}

function normalizeFatsecretFood(entry) {
  if (!entry) {
    return null;
  }

  const servings = asArray(entry.servings?.serving).map((serving, index) => ({
    id: `fatsecret-serving:${entry.food_id || entry.foodId || "unknown"}:${index + 1}`,
    label: normalizeText(serving.serving_description || serving.measurement_description || serving.metric_serving_unit || "Serving"),
    grams: Number(serving.metric_serving_amount || serving.number_of_units || 100) || 100,
    unitCount: Number(serving.number_of_units || 1) || 1,
    isDefault: index === 0,
  }));

  const primaryServing = servings[0] || {
    grams: 100,
    unitCount: 1,
  };

  return {
    provider: "fatsecret",
    providerKey: String(entry.food_id || entry.foodId || ""),
    name: normalizeText(entry.food_name || entry.foodName || entry.name || "Food"),
    brandName: normalizeText(entry.brand_name || entry.brandName || ""),
    foodGroup: normalizeText(entry.food_type || entry.foodType || "external"),
    countryCode: "MY",
    dataSource: "fatsecret",
    servingBasisG: Number(primaryServing.grams || 100) || 100,
    caloriesKcal: Number(entry.calories || entry.calories_kcal || 0) || 0,
    proteinG: Number(entry.protein || entry.protein_g || 0) || 0,
    carbsG: Number(entry.carbohydrate || entry.carbs || entry.carbs_g || 0) || 0,
    fatG: Number(entry.fat || entry.fat_g || 0) || 0,
    fiberG: Number(entry.fiber || entry.fiber_g || 0) || 0,
    sugarG: Number(entry.sugar || entry.sugar_g || 0) || 0,
    sodiumMg: Number(entry.sodium || entry.sodium_mg || 0) || 0,
    servings,
    metadata: {
      url: entry.food_url || entry.foodUrl || "",
      source: "fatsecret",
      raw: entry,
    },
  };
}

async function searchFatsecretFoods(query, options = {}) {
  const normalizedQuery = normalizeText(query);
  if (!fatsecretConfigured() || !normalizedQuery) {
    return [];
  }

  const payload = await fatsecretRequest({
    method: "foods.search.v3",
    search_expression: normalizedQuery,
    max_results: String(Math.min(10, Number(options.maxResults || 6) || 6)),
    page_number: String(Math.max(0, Number(options.pageNumber || 0) || 0)),
  });

  const foods = asArray(payload?.foods_search?.results?.food || payload?.foods?.food || payload?.foods_search?.food);
  return foods
    .map((entry) => normalizeFatsecretFood(entry))
    .filter(Boolean);
}

async function lookupFatsecretBarcode(barcode) {
  const normalizedBarcode = normalizeText(barcode).replace(/\s+/gu, "");
  if (!fatsecretConfigured() || !normalizedBarcode) {
    return null;
  }

  const lookup = await fatsecretRequest({
    method: "food.find_id_for_barcode",
    barcode: normalizedBarcode,
  });

  const foodId = normalizeText(lookup?.food_id || lookup?.foodId);
  if (!foodId) {
    return null;
  }

  const detail = await fatsecretRequest({
    method: "food.get.v4",
    food_id: foodId,
  });

  return normalizeFatsecretFood(detail?.food || detail);
}

async function probeFatsecretHealth() {
  if (!fatsecretConfigured()) {
    return {
      configured: false,
      state: "unavailable",
      message: "FatSecret credentials are not configured.",
      checkedAt: new Date().toISOString(),
    };
  }

  return getOrSetRuntimeCache(HEALTH_CACHE, "fatsecret-health", 10 * 60 * 1000, async () => {
    const checkedAt = new Date().toISOString();
    try {
      const healthQueries = dedupeHealthQueries([
        normalizeText(process.env.FATSECRET_HEALTH_QUERY || ""),
        "banana",
        "rice",
        "milk",
      ]);
      let firstFood = null;

      for (const query of healthQueries) {
        const payload = await fatsecretRequest({
          method: "foods.search.v3",
          search_expression: query,
          max_results: "1",
          page_number: "0",
        });
        const foods = asArray(payload?.foods_search?.results?.food || payload?.foods?.food || payload?.foods_search?.food);
        firstFood = normalizeFatsecretFood(foods[0]);
        if (firstFood?.name) {
          break;
        }
      }

      if (firstFood?.name) {
        return {
          configured: true,
          state: "healthy",
          message: `Live external food search is available. Sample match: ${firstFood.name}.`,
          checkedAt,
        };
      }

      return {
        configured: true,
        state: "degraded",
        message: "FatSecret responded, but the sample search returned no usable food matches.",
        checkedAt,
      };
    } catch (error) {
      const message = String(error?.message || "FatSecret health check failed.");
      if (String(error?.fatsecretState || "").toLowerCase() === "blocked" || /invalid ip address/iu.test(message)) {
        return {
          configured: true,
          state: "blocked",
          message: "FatSecret credentials are valid, but this runtime IP is not currently accepted by the provider.",
          checkedAt,
        };
      }

      return {
        configured: true,
        state: "degraded",
        message,
        checkedAt,
      };
    }
  });
}

function dedupeHealthQueries(values) {
  return Array.from(new Set((values || []).map((value) => normalizeText(value)).filter(Boolean)));
}

module.exports = {
  fatsecretConfigured,
  lookupFatsecretBarcode,
  probeFatsecretHealth,
  searchFatsecretFoods,
};
