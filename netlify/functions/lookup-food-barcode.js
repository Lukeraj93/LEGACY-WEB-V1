const { json, methodNotAllowed, noContent } = require("./_lib/http");
const { createHttpError, normalizeText, requireAllowedRole } = require("./_lib/planner");
const { lookupFatsecretBarcode, probeFatsecretHealth } = require("./_lib/nutrition-provider-fatsecret");
const { getNutritionProviderStatus } = require("./_lib/nutrition-provider-registry");
const { upsertExternalFoodRecord } = require("./_lib/nutrition-catalog");
const { getAuthenticatedProfile, getServiceSupabase } = require("./_lib/supabase");

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
    const body = event.httpMethod === "POST" ? JSON.parse(event.body || "{}") : {};
    const barcode = normalizeText(body.barcode || event.queryStringParameters?.barcode).replace(/\s+/gu, "");
    if (!barcode) {
      throw createHttpError(400, "Barcode is required.");
    }

    const providerStatus = getNutritionProviderStatus();
    if (!providerStatus.fatsecret.configured) {
      return json(
        200,
        {
          ok: true,
          barcode,
          configured: false,
          providerState: "unavailable",
          food: null,
          importedFood: null,
          message: "FatSecret barcode lookup is not configured yet.",
        },
        { "Cache-Control": "no-store" }
      );
    }

    const health = await probeFatsecretHealth();
    if (health.state === "blocked") {
      return json(
        200,
        {
          ok: true,
          barcode,
          configured: true,
          providerState: health.state,
          food: null,
          importedFood: null,
          message: health.message,
        },
        { "Cache-Control": "no-store" }
      );
    }

    let externalFood = null;
    try {
      externalFood = await lookupFatsecretBarcode(barcode);
    } catch (error) {
      const message = String(error?.message || "");
      if (String(error?.fatsecretState || "").toLowerCase() === "blocked" || /invalid ip address/iu.test(message)) {
        return json(
          200,
          {
            ok: true,
            barcode,
            configured: true,
            providerState: "blocked",
            food: null,
            importedFood: null,
            message: "FatSecret barcode lookup is configured, but the provider is blocking this runtime IP right now.",
          },
          { "Cache-Control": "no-store" }
        );
      }
      throw error;
    }

    if (!externalFood) {
      return json(
        200,
        {
          ok: true,
          barcode,
          configured: true,
          providerState: health.state || "ready",
          food: null,
          importedFood: null,
          message: "No food match was returned for this barcode.",
        },
        { "Cache-Control": "no-store" }
      );
    }

    const imported = await upsertExternalFoodRecord(supabase, auth.profile, {
      ...externalFood,
      metadata: {
        ...(externalFood.metadata || {}),
        barcode,
        confidenceScore: 0.98,
      },
    });

    return json(
      200,
      {
        ok: true,
        barcode,
        configured: true,
        providerState: health.state || "healthy",
        food: externalFood,
        importedFood: imported?.food || null,
        servings: imported?.servings || [],
        message: "Barcode lookup completed.",
      },
      { "Cache-Control": "no-store" }
    );
  } catch (error) {
    return json(
      Number(error?.statusCode || 500),
      { error: error?.message || "Unable to look up the food barcode right now." },
      { "Cache-Control": "no-store" }
    );
  }
};
