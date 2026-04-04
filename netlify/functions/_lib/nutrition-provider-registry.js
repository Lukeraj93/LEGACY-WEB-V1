function hasValue(value) {
  return Boolean(String(value || "").trim());
}

function getNutritionProviderStatus() {
  const openAiConfigured = hasValue(process.env.OPENAI_API_KEY);
  const fatsecretConfigured = hasValue(process.env.FATSECRET_CLIENT_ID) && hasValue(process.env.FATSECRET_CLIENT_SECRET);
  const logmealConfigured = hasValue(process.env.LOGMEAL_API_KEY) || hasValue(process.env.LOGMEAL_USER_API_KEY);

  return {
    localLibrary: {
      key: "local_library",
      configured: true,
      role: "canonical_food_store",
      capabilities: ["food_search", "coach_foods", "recipes", "meal_logging"],
    },
    myfcdReference: {
      key: "myfcd_reference",
      configured: true,
      role: "malaysian_reference_layer",
      capabilities: ["malaysian_food_aliases", "local_mapping", "hawker_reference"],
    },
    fatsecret: {
      key: "fatsecret",
      configured: fatsecretConfigured,
      role: "food_database_and_barcode",
      capabilities: ["food_search", "packaged_foods", "barcode_lookup", "brand_foods"],
    },
    logmeal: {
      key: "logmeal",
      configured: logmealConfigured,
      role: "meal_photo_recognition",
      capabilities: ["photo_segmentation", "dish_detection", "ingredient_guessing"],
    },
    openai: {
      key: "openai",
      configured: openAiConfigured,
      role: "note_aware_reconciliation",
      capabilities: ["photo_reasoning", "correction_notes", "candidate_harmonization"],
    },
  };
}

function listConfiguredNutritionProviders() {
  return Object.values(getNutritionProviderStatus()).filter((provider) => provider.configured);
}

function listActiveHybridRoles() {
  const status = getNutritionProviderStatus();
  return {
    canonical: ["local_library", "myfcd_reference"],
    search: [
      "local_library",
      ...(status.fatsecret.configured ? ["fatsecret"] : []),
    ],
    barcode: status.fatsecret.configured ? ["fatsecret"] : [],
    photo: [
      ...(status.logmeal.configured ? ["logmeal"] : []),
      ...(status.openai.configured ? ["openai"] : []),
      "local_library",
    ],
    reconciliation: [
      ...(status.openai.configured ? ["openai"] : []),
      ...(status.fatsecret.configured ? ["fatsecret"] : []),
      "local_library",
      "myfcd_reference",
    ],
  };
}

module.exports = {
  getNutritionProviderStatus,
  listConfiguredNutritionProviders,
  listActiveHybridRoles,
};
