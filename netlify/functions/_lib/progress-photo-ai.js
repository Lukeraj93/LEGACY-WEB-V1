const { normalizeNullableText, normalizeText } = require("./planner");

const OPENAI_MODEL = "gpt-4.1-mini";
const PROGRESS_PHOTO_BUCKET = "client-progress-photos";
const OPENAI_PROGRESS_PHOTO_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    estimate_percent: { type: "number" },
    range_low: { type: "number" },
    range_high: { type: "number" },
    confidence: { type: "number" },
    summary: { type: "string" },
    visible_cues: {
      type: "array",
      items: { type: "string" },
    },
    caveats: {
      type: "array",
      items: { type: "string" },
    },
  },
  required: [
    "estimate_percent",
    "range_low",
    "range_high",
    "confidence",
    "summary",
    "visible_cues",
    "caveats",
  ],
};

function roundNumber(value, decimals = 2) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return null;
  }
  const factor = 10 ** decimals;
  return Math.round(numeric * factor) / factor;
}

function clampNumber(value, minimum, maximum) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return minimum;
  }
  return Math.min(maximum, Math.max(minimum, numeric));
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

function deriveAgeYears(dateOfBirth) {
  const raw = normalizeText(dateOfBirth);
  if (!raw) {
    return null;
  }

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const now = new Date();
  let years = now.getUTCFullYear() - date.getUTCFullYear();
  const monthDelta = now.getUTCMonth() - date.getUTCMonth();
  if (monthDelta < 0 || (monthDelta === 0 && now.getUTCDate() < date.getUTCDate())) {
    years -= 1;
  }

  return years >= 0 ? years : null;
}

async function downloadAssetBuffer(supabase, bucket, asset) {
  const { data, error } = await supabase.storage.from(bucket).download(asset.storage_path);
  if (error || !data) {
    throw error || new Error("Unable to download the uploaded progress photo.");
  }
  return Buffer.from(await data.arrayBuffer());
}

async function downloadAssetAsDataUrl(supabase, bucket, asset) {
  const base64 = (await downloadAssetBuffer(supabase, bucket, asset)).toString("base64");
  return `data:${asset.content_type || "image/jpeg"};base64,${base64}`;
}

function normalizeList(items, fallback) {
  const normalized = (Array.isArray(items) ? items : [])
    .map((item) => normalizeText(item))
    .filter(Boolean)
    .slice(0, 5);
  return normalized.length ? normalized : fallback;
}

function normalizeEstimatePayload(parsed) {
  const estimatePercent = clampNumber(parsed?.estimate_percent, 3, 65);
  let rangeLow = clampNumber(parsed?.range_low, 3, 65);
  let rangeHigh = clampNumber(parsed?.range_high, 3, 65);

  if (rangeLow > rangeHigh) {
    const swap = rangeLow;
    rangeLow = rangeHigh;
    rangeHigh = swap;
  }

  if (estimatePercent < rangeLow) {
    rangeLow = estimatePercent;
  }
  if (estimatePercent > rangeHigh) {
    rangeHigh = estimatePercent;
  }

  const minSpan = 3;
  if (rangeHigh - rangeLow < minSpan) {
    rangeLow = Math.max(3, estimatePercent - minSpan / 2);
    rangeHigh = Math.min(65, estimatePercent + minSpan / 2);
  }

  return {
    estimatePercent: roundNumber(estimatePercent, 1),
    rangeLow: roundNumber(rangeLow, 1),
    rangeHigh: roundNumber(rangeHigh, 1),
    confidence: roundNumber(clampNumber(parsed?.confidence, 0, 1), 2),
    summary:
      normalizeNullableText(parsed?.summary)
      || "AI generated a rough body-fat estimate from the uploaded progress photos.",
    visibleCues: normalizeList(parsed?.visible_cues, ["General visual body-composition cues were used."]),
    caveats: normalizeList(parsed?.caveats, ["This is a rough estimate and should be treated as a trend signal only."]),
  };
}

function buildAnalysisPrompt(input) {
  return [
    "You are a careful fitness coaching assistant.",
    "Estimate a rough body-fat percentage range from standardized progress photos.",
    "This is not a medical reading. Be conservative and honest when uncertain.",
    "Use the front, side, and back images plus the client metadata below.",
    "Do not infer medical conditions, race, or anything unrelated to visual body-composition cues.",
    "Return strict JSON only.",
    "Use a wider range when the photos are uncertain, cropped, inconsistent, or limited.",
    "estimate_percent should be your best midpoint guess.",
    "range_low and range_high should surround estimate_percent and reflect uncertainty.",
    "confidence should be between 0 and 1.",
    input.gender ? `Sex/gender: ${input.gender}` : "Sex/gender: not provided",
    Number.isFinite(Number(input.ageYears)) ? `Age (years): ${input.ageYears}` : "Age (years): not provided",
    Number.isFinite(Number(input.weightKg)) ? `Weight (kg): ${roundNumber(Number(input.weightKg), 1)}` : "Weight (kg): not provided",
    input.capturePeriod ? `Capture period: ${input.capturePeriod}` : "",
    input.primaryGoal ? `Primary goal: ${input.primaryGoal}` : "",
    input.clientNote ? `Client note: ${input.clientNote}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function pickOrderedAssets(assets) {
  const list = Array.isArray(assets) ? assets : [];
  const front = list.find((asset) => asset.view_tag === "front");
  const side = list.find((asset) => asset.view_tag === "left") || list.find((asset) => asset.view_tag === "right");
  const back = list.find((asset) => asset.view_tag === "back");
  return [front, side, back].filter(Boolean);
}

async function estimateProgressPhotoBodyFat(supabase, assets, input = {}) {
  const apiKey = String(process.env.OPENAI_API_KEY || "").trim();
  if (!apiKey) {
    return {
      status: "unavailable",
      provider: `openai:${OPENAI_MODEL}`,
      error: "OPENAI_API_KEY is not configured.",
    };
  }

  const orderedAssets = pickOrderedAssets(assets);
  if (!orderedAssets.length) {
    return {
      status: "failed",
      provider: `openai:${OPENAI_MODEL}`,
      error: "No usable progress photo assets were provided for AI analysis.",
    };
  }

  const imageInputs = [];
  for (const asset of orderedAssets.slice(0, 3)) {
    imageInputs.push({
      type: "input_image",
      image_url: await downloadAssetAsDataUrl(supabase, PROGRESS_PHOTO_BUCKET, asset),
      detail: "low",
    });
  }

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
            { type: "input_text", text: buildAnalysisPrompt(input) },
            ...imageInputs,
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "progress_photo_body_fat_estimate",
          strict: true,
          schema: OPENAI_PROGRESS_PHOTO_SCHEMA,
        },
      },
      max_output_tokens: 900,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI progress-photo analysis failed (${response.status}).`);
  }

  const payload = await response.json();
  const text = extractResponseText(payload);
  const parsed = parseJsonBlock(text);
  if (!parsed) {
    throw new Error("OpenAI progress-photo analysis did not return a valid JSON estimate.");
  }

  return {
    status: "completed",
    provider: `openai:${OPENAI_MODEL}`,
    ...normalizeEstimatePayload(parsed),
    rawResult: parsed,
  };
}

module.exports = {
  estimateProgressPhotoBodyFat,
};
