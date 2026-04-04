const { buildServingsByFoodId, buildSourceMappingsByFoodId, foodIsVisibleToUser, normalizeFoodRecord, resolveFoodVisibilityContext } = require("./nutrition-catalog");
const { normalizeNullableText, normalizeText, throwOnError } = require("./planner");
const { searchFatsecretFoods, fatsecretConfigured } = require("./nutrition-provider-fatsecret");
const { analyzeMealPhotoWithLogMeal, logmealConfigured } = require("./nutrition-provider-logmeal");
const { getNutritionProviderStatus } = require("./nutrition-provider-registry");

const OPENAI_MODEL = "gpt-4.1-mini";
const ALLOWED_CANDIDATE_KINDS = new Set(["food", "dish", "ingredient", "unmatched"]);
const OPENAI_MEAL_CANDIDATE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    summary: {
      type: "string",
    },
    overall_confidence: {
      type: "number",
    },
    candidates: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          label: { type: "string" },
          kind: { type: "string" },
          estimated_grams: { type: "number" },
          confidence: { type: "number" },
          note: { type: "string" },
        },
        required: ["label", "kind", "estimated_grams", "confidence", "note"],
      },
    },
  },
  required: ["summary", "overall_confidence", "candidates"],
};

function roundNumber(value) {
  const numeric = Number(value || 0);
  return Number.isFinite(numeric) ? Math.round(numeric * 100) / 100 : 0;
}

function parseJsonBlock(text) {
  const raw = String(text || "").trim();
  if (!raw) {
    return null;
  }

  const withoutFence = raw.replace(/^```(?:json)?/u, "").replace(/```$/u, "").trim();
  try {
    return JSON.parse(withoutFence);
  } catch (_) {
    const start = withoutFence.indexOf("{");
    const end = withoutFence.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(withoutFence.slice(start, end + 1));
      } catch (_) {
        return null;
      }
    }
  }

  return null;
}

function extractResponseText(payload) {
  const directText = normalizeText(payload?.output_text || "");
  if (directText) {
    return directText;
  }

  const outputs = Array.isArray(payload?.output) ? payload.output : [];
  for (const output of outputs) {
    const content = Array.isArray(output?.content) ? output.content : [];
    for (const item of content) {
      const text = normalizeText(item?.text || "");
      if (text) {
        return text;
      }
    }
  }

  return "";
}

function tokenize(value) {
  return normalizeText(value)
    .toLowerCase()
    .split(/[^a-z0-9]+/u)
    .map((item) => item.trim())
    .filter((item) => item.length >= 3);
}

function dedupeByKey(items, keyBuilder) {
  const seen = new Set();
  return (items || []).filter((item) => {
    const key = keyBuilder(item);
    if (!key || seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function deriveConfidenceBand(score) {
  const numeric = Number(score || 0);
  if (numeric >= 0.82) {
    return "high";
  }
  if (numeric >= 0.6) {
    return "medium";
  }
  return "low";
}

function buildFoodMatchScore(food, label) {
  const normalizedLabel = normalizeText(label).toLowerCase();
  if (!normalizedLabel) {
    return 0;
  }

  const haystack = [
    food.name,
    food.brandName,
    food.foodGroup,
    food.countryCode,
    food.notes,
    ...(Array.isArray(food.searchTags) ? food.searchTags : []),
    ...(food.sourceMappings || []).map((mapping) => mapping.sourceLabel || mapping.sourceSystem || ""),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const name = String(food.name || "").toLowerCase();
  const tokens = tokenize(normalizedLabel);
  let score = 0;

  if (name === normalizedLabel) {
    score += 18;
  } else if (name.includes(normalizedLabel)) {
    score += 12;
  } else if (normalizedLabel.includes(name) && name.length >= 4) {
    score += 10;
  }

  if (haystack.includes(normalizedLabel)) {
    score += 6;
  }

  tokens.forEach((token) => {
    if (name.includes(token)) {
      score += 4;
      return;
    }
    if (haystack.includes(token)) {
      score += 2;
    }
  });

  if (food.countryCode === "MY" && /\b(nasi|roti|laksa|mee|teh|satay|rendang|char)\b/u.test(normalizedLabel)) {
    score += 2;
  }

  return score;
}

function findBestFoodMatch(catalogFoods, label) {
  const scored = (catalogFoods || [])
    .map((food) => ({
      food,
      score: buildFoodMatchScore(food, label),
    }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score);

  return scored[0] || null;
}

function buildCandidateFromMatch(parsedCandidate, match, sortOrder, sourceType, externalMatch = null) {
  const label = normalizeText(parsedCandidate.label || parsedCandidate.name || parsedCandidate.item || "Food");
  const confidence = Math.max(0, Math.min(1, Number(parsedCandidate.confidence || match?.score / 22 || 0)));
  const suggestedGrams = Math.max(
    1,
    Number(parsedCandidate.estimated_grams || parsedCandidate.grams || 0)
      || Number(match?.food?.servings?.find((entry) => entry.isDefault)?.grams || match?.food?.servingBasisG || externalMatch?.servings?.[0]?.grams || externalMatch?.servingBasisG || 120)
  );
  const suggestedQuantity = Math.max(0.25, Number(parsedCandidate.suggested_quantity || parsedCandidate.quantity || 1) || 1);
  const candidateKind = (() => {
    const normalized = normalizeText(parsedCandidate.kind || parsedCandidate.type || "food").toLowerCase();
    return ALLOWED_CANDIDATE_KINDS.has(normalized) ? normalized : "food";
  })();

  if (!match?.food) {
    const factor = suggestedGrams / (Number(externalMatch?.servingBasisG || 100) || 100);
    return {
      sort_order: sortOrder,
      food_id: null,
      serving_id: null,
      label,
      candidate_kind: "unmatched",
      source_type: sourceType,
      confidence_score: roundNumber(confidence),
      suggested_quantity: roundNumber(suggestedQuantity),
      suggested_grams: roundNumber(suggestedGrams),
      calories_kcal: roundNumber(Number(externalMatch?.caloriesKcal || 0) * factor),
      protein_g: roundNumber(Number(externalMatch?.proteinG || 0) * factor),
      carbs_g: roundNumber(Number(externalMatch?.carbsG || 0) * factor),
      fat_g: roundNumber(Number(externalMatch?.fatG || 0) * factor),
      note: normalizeNullableText(
        parsedCandidate.note
          || (externalMatch ? `Matched via ${externalMatch.provider}. Confirm before finalizing.` : "Needs a manual food match.")
      ),
      is_selected: false,
      is_confirmed: false,
      metadata: {
        matchScore: 0,
        externalProvider: externalMatch?.provider || "",
        externalFood: externalMatch || null,
      },
    };
  }

  const food = match.food;
  const serving = food.servings.find((entry) => entry.isDefault) || food.servings[0] || null;
  const factor = suggestedGrams / (Number(food.servingBasisG || 100) || 100);
  return {
    sort_order: sortOrder,
    food_id: food.id,
    serving_id: serving?.id || null,
    label,
    candidate_kind: candidateKind,
    source_type: sourceType,
    confidence_score: roundNumber(confidence),
    suggested_quantity: roundNumber(suggestedQuantity),
    suggested_grams: roundNumber(suggestedGrams),
    calories_kcal: roundNumber(Number(food.caloriesKcal || 0) * factor),
    protein_g: roundNumber(Number(food.proteinG || 0) * factor),
    carbs_g: roundNumber(Number(food.carbsG || 0) * factor),
    fat_g: roundNumber(Number(food.fatG || 0) * factor),
    note: normalizeNullableText(parsedCandidate.note),
    is_selected: confidence >= 0.45,
    is_confirmed: false,
    metadata: {
      matchScore: match.score,
      matchedFoodName: food.name,
      sourceMappings: food.sourceMappings || [],
    },
  };
}

async function loadVisibleCatalogFoods(supabase, profile) {
  const [visibilityContext, foodsResponse, servingsResponse, sourceMappingsResponse] = await Promise.all([
    resolveFoodVisibilityContext(supabase, profile),
    supabase.from("food_library").select("*").eq("is_active", true).limit(1200),
    supabase.from("food_servings").select("*").limit(2400),
    supabase.from("food_source_mappings").select("*").limit(1200),
  ]);

  [foodsResponse, servingsResponse, sourceMappingsResponse].forEach(throwOnError);

  const servingsByFoodId = buildServingsByFoodId(servingsResponse.data || []);
  const mappingsByFoodId = buildSourceMappingsByFoodId(sourceMappingsResponse.data || []);

  return (foodsResponse.data || [])
    .filter((food) => foodIsVisibleToUser(food, visibilityContext))
    .map((food) => normalizeFoodRecord(food, servingsByFoodId, mappingsByFoodId));
}

function buildHeuristicCandidates(input, catalogFoods, providerLabels = []) {
  const phrases = dedupeByKey(
    [
      input.mealTitle,
      ...providerLabels,
      ...(normalizeText(input.clientNote).split(/[,/]+/u)),
      ...(normalizeText(input.correctionNote).split(/[,/]+/u)),
    ]
      .map((item) => normalizeText(item))
      .filter(Boolean)
      .flatMap((item) => item.split(/\bwith\b|\band\b|\bplus\b/iu).map((segment) => normalizeText(segment)).filter(Boolean)),
    (item) => item.toLowerCase()
  ).slice(0, 8);

  const candidates = phrases
    .map((phrase, index) => {
      const match = findBestFoodMatch(catalogFoods, phrase);
      if (!match || match.score < 4) {
        return buildCandidateFromMatch({ label: phrase, confidence: 0.24, note: "Manual confirmation recommended." }, null, index, "heuristic");
      }

      const confidence = Math.min(0.82, 0.34 + match.score / 22);
      return buildCandidateFromMatch({ label: phrase, confidence }, match, index, "heuristic");
    });

  return {
    provider: "legacy-heuristic",
    summary: phrases.length
      ? `Suggested ${phrases.length} likely food match${phrases.length === 1 ? "" : "es"} from the meal title and notes.`
      : "No strong food signals were found from the text. Manual search is recommended.",
    overallConfidence:
      candidates.length
        ? roundNumber(candidates.reduce((sum, entry) => sum + Number(entry.confidence_score || 0), 0) / candidates.length)
        : 0.18,
    candidates,
  };
}

async function downloadAssetBuffer(supabase, bucket, asset) {
  const { data, error } = await supabase.storage.from(bucket).download(asset.storage_path);
  if (error || !data) {
    throw error || new Error("Unable to download the uploaded meal photo.");
  }
  return Buffer.from(await data.arrayBuffer());
}

async function downloadAssetAsDataUrl(supabase, bucket, asset) {
  const base64 = (await downloadAssetBuffer(supabase, bucket, asset)).toString("base64");
  return `data:${asset.content_type || "image/jpeg"};base64,${base64}`;
}

async function analyzeWithOpenAi(supabase, bucket, assets, input, providerHints = {}) {
  const apiKey = String(process.env.OPENAI_API_KEY || "").trim();
  if (!apiKey || !assets.length) {
    return null;
  }

  const imageInputs = [];
  for (const asset of assets.slice(0, 2)) {
    imageInputs.push({
      type: "input_image",
      image_url: await downloadAssetAsDataUrl(supabase, bucket, asset),
      detail: "low",
    });
  }

  const prompt = [
    "You are a nutrition meal-photo assistant.",
    "Analyze the meal photo and the user notes.",
    "Return strict JSON only with keys summary, overall_confidence, candidates.",
    "candidates must be an array of up to 6 objects with keys label, kind, estimated_grams, confidence, note.",
    "Use concise food or dish names a coach could map into a food library.",
    "Apply the correction note if one is provided.",
    "Use lower confidence when uncertain. Never invent perfect certainty.",
    providerHints.logmealLabels?.length ? `LogMeal detected labels: ${providerHints.logmealLabels.join(", ")}` : "",
    providerHints.fatsecretFoods?.length
      ? `FatSecret food hints: ${providerHints.fatsecretFoods.map((food) => `${food.name}${food.brandName ? ` (${food.brandName})` : ""}`).join(", ")}`
      : "",
    input.mealTitle ? `Meal title: ${input.mealTitle}` : "",
    input.clientNote ? `Client note: ${input.clientNote}` : "",
    input.correctionNote ? `Correction note: ${input.correctionNote}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: prompt },
            ...imageInputs,
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "meal_photo_candidates",
          strict: true,
          schema: OPENAI_MEAL_CANDIDATE_SCHEMA,
        },
      },
      max_output_tokens: 900,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI meal-photo analysis failed (${response.status}).`);
  }

  const payload = await response.json();
  const text = extractResponseText(payload);
  const parsed = parseJsonBlock(text);
  if (!parsed || !Array.isArray(parsed.candidates)) {
    throw new Error("OpenAI meal-photo analysis did not return a valid JSON candidate payload.");
  }

  return {
    provider: `openai:${OPENAI_MODEL}`,
    summary: normalizeText(parsed.summary || ""),
    overallConfidence: roundNumber(Number(parsed.overall_confidence || 0)),
    candidates: parsed.candidates,
  };
}

function findBestExternalFoodMatch(externalFoods, label) {
  const normalizedLabel = normalizeText(label).toLowerCase();
  if (!normalizedLabel) {
    return null;
  }

  const scored = (externalFoods || [])
    .map((food) => {
      const haystack = [food.name, food.brandName, food.foodGroup]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      let score = 0;
      if (String(food.name || "").toLowerCase() === normalizedLabel) {
        score += 18;
      } else if (String(food.name || "").toLowerCase().includes(normalizedLabel)) {
        score += 12;
      }
      if (haystack.includes(normalizedLabel)) {
        score += 6;
      }
      tokenize(normalizedLabel).forEach((token) => {
        if (haystack.includes(token)) {
          score += 2;
        }
      });
      return { food, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score);

  return scored[0]?.food || null;
}

async function collectFatsecretHintFoods(input, logmealLabels) {
  if (!fatsecretConfigured()) {
    return [];
  }

  const hintQueries = dedupeByKey(
    [input.mealTitle, ...logmealLabels]
      .map((item) => normalizeText(item))
      .filter(Boolean),
    (item) => item.toLowerCase()
  ).slice(0, 4);

  const providerFoods = [];
  for (const query of hintQueries) {
    const matches = await searchFatsecretFoods(query, { maxResults: 3 }).catch(() => []);
    providerFoods.push(...matches);
  }

  return dedupeByKey(providerFoods, (food) => `${food.provider}:${food.providerKey}`);
}

async function extractNutritionPhotoCandidates(supabase, profile, options) {
  const providerStatus = getNutritionProviderStatus();
  const catalogFoods = await loadVisibleCatalogFoods(supabase, profile);
  const providerErrors = {};
  const input = {
    mealTitle: normalizeText(options.mealTitle),
    clientNote: normalizeText(options.clientNote),
    correctionNote: normalizeText(options.correctionNote),
  };
  const enableOpenAi = options?.enableOpenAi !== false;

  let logmealResult = null;
  if (providerStatus.logmeal.configured && Array.isArray(options.assets) && options.assets.length) {
    try {
      const firstAsset = options.assets[0];
      logmealResult = await analyzeMealPhotoWithLogMeal({
        supabase,
        profile,
        imageBuffer: await downloadAssetBuffer(supabase, options.bucket, firstAsset),
        contentType: firstAsset.content_type || firstAsset.contentType || "image/jpeg",
        fileName: firstAsset.file_name || firstAsset.fileName || "meal-photo.jpg",
      });
    } catch (error) {
      providerErrors.logmeal = error?.message || "LogMeal request failed.";
      logmealResult = null;
    }
  }

  const logmealLabels = Array.isArray(logmealResult?.labels) ? logmealResult.labels : [];
  const fatsecretHints = await collectFatsecretHintFoods(input, logmealLabels);
  let rawResult = null;
  if (enableOpenAi) {
    try {
      rawResult = await analyzeWithOpenAi(supabase, options.bucket, options.assets || [], input, {
        logmealLabels,
        fatsecretFoods: fatsecretHints,
      });
    } catch (error) {
      providerErrors.openai = error?.message || "OpenAI meal-photo analysis failed.";
      rawResult = null;
    }
  }

  if (!rawResult) {
    rawResult = buildHeuristicCandidates(
      input,
      catalogFoods,
      [
        ...logmealLabels,
        ...fatsecretHints.map((food) => food.name),
      ]
    );
  }

  const normalizedCandidates = dedupeByKey(
    (Array.isArray(rawResult.candidates) ? rawResult.candidates : []).map((candidate) => {
      const label = normalizeText(candidate.label || candidate.name || candidate.item);
      const match = findBestFoodMatch(catalogFoods, label);
      const externalMatch = !match?.food ? findBestExternalFoodMatch(fatsecretHints, label) : null;
      return buildCandidateFromMatch(
        candidate,
        match,
        0,
        rawResult.provider.startsWith("openai:") ? "openai_vision" : (logmealLabels.length ? "provider_hybrid" : "heuristic"),
        externalMatch
      );
    }),
    (candidate) => `${candidate.food_id || "unmatched"}:${candidate.label.toLowerCase()}`
  )
    .map((candidate, index) => ({
      ...candidate,
      sort_order: index,
    }))
    .slice(0, 8);

  const unmatchedCount = normalizedCandidates.filter((candidate) => !candidate.food_id).length;
  const overallConfidence =
    Number(rawResult.overallConfidence || 0)
    || (normalizedCandidates.length
      ? normalizedCandidates.reduce((sum, candidate) => sum + Number(candidate.confidence_score || 0), 0) / normalizedCandidates.length
      : 0.2);

  return {
    provider: [
      providerStatus.logmeal.configured && logmealLabels.length ? "logmeal" : "",
      rawResult.provider,
      providerStatus.fatsecret.configured && fatsecretHints.length ? "fatsecret" : "",
    ]
      .filter(Boolean)
      .join("+"),
    summary:
      normalizeNullableText(rawResult.summary)
      || (normalizedCandidates.length
        ? `Detected ${normalizedCandidates.length} meal candidate${normalizedCandidates.length === 1 ? "" : "s"} from the uploaded photo.`
        : "No reliable meal candidates were detected from the uploaded photo."),
    overallConfidence: roundNumber(overallConfidence),
    confidenceBand: deriveConfidenceBand(overallConfidence),
    lowConfidence: overallConfidence < 0.72 || unmatchedCount > 0 || !normalizedCandidates.length,
    candidates: normalizedCandidates,
    providerMetadata: {
      logmealLabels,
      fatsecretHints: fatsecretHints.map((food) => ({
        providerKey: food.providerKey,
        name: food.name,
        brandName: food.brandName,
      })),
      reconciliationMode: enableOpenAi ? "full" : "fast_path",
      providerErrors,
      providerStatus,
    },
  };
}

module.exports = {
  deriveConfidenceBand,
  extractNutritionPhotoCandidates,
};
