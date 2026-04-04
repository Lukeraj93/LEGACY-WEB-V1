const { json, methodNotAllowed, noContent } = require("./_lib/http");
const {
  createHttpError,
  normalizeDateOnly,
  normalizeNullableText,
  normalizeText,
  parseBody,
  requireAllowedRole,
  requireManagedClientAccess,
  throwOnError,
  notifyClientAndCoach,
} = require("./_lib/planner");
const { extractNutritionPhotoCandidates } = require("./_lib/nutrition-photo-ai");
const { getAuthenticatedProfile, getServiceSupabase, resolvePrimaryCoachForClient } = require("./_lib/supabase");
const ALLOWED_MEAL_TYPES = new Set([
  "breakfast",
  "lunch",
  "dinner",
  "snack",
  "pre_workout",
  "post_workout",
  "other",
]);

async function loadSubmissionContext(supabase, clientId, nutritionPlanId) {
  const [coachId, nutritionPlanResponse] = await Promise.all([
    resolvePrimaryCoachForClient(supabase, clientId),
    nutritionPlanId
      ? supabase.from("client_nutrition_plans").select("*").eq("id", nutritionPlanId).eq("client_id", clientId).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);
  throwOnError(nutritionPlanResponse);
  if (nutritionPlanId && !nutritionPlanResponse.data?.id) {
    throw createHttpError(404, "Nutrition plan not found for this client.");
  }
  return {
    coachId,
    nutritionPlan: nutritionPlanResponse.data || null,
  };
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return noContent({ "Cache-Control": "no-store" });
  }

  if (event.httpMethod !== "POST") {
    return methodNotAllowed("POST, OPTIONS");
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
    requireAllowedRole(auth.profile, ["client", "coach", "super_admin"]);

    const clientId =
      normalizeText(body.clientId || body.client_id)
      || (auth.profile.role === "client" ? auth.profile.id : "");
    if (!clientId) {
      throw createHttpError(400, "Client ID is required.");
    }

    await requireManagedClientAccess(supabase, auth.profile, clientId);

    const assets = Array.isArray(body.assets) ? body.assets : [];
    if (!assets.length) {
      throw createHttpError(400, "At least one meal photo asset is required.");
    }

    const normalizedAssets = assets
      .map((asset, index) => ({
        view_tag: normalizeText(asset.viewTag || asset.view_tag || "meal").toLowerCase(),
        storage_path: normalizeText(asset.storagePath || asset.storage_path),
        file_name: normalizeNullableText(asset.fileName || asset.file_name),
        content_type: normalizeNullableText(asset.contentType || asset.content_type),
        sort_order: Number(asset.sortOrder || asset.sort_order || index),
        metadata: {},
      }))
      .filter((asset) => asset.storage_path);

    if (!normalizedAssets.length) {
      throw createHttpError(400, "Valid uploaded meal photo assets are required.");
    }

    const logDate = normalizeDateOnly(body.logDate || body.log_date) || new Date().toISOString().slice(0, 10);
    const rawMealType = normalizeText(body.mealType || body.meal_type || "other").toLowerCase() || "other";
    const mealType = ALLOWED_MEAL_TYPES.has(rawMealType) ? rawMealType : "other";
    const mealTitle = normalizeNullableText(body.mealTitle || body.meal_title || body.title);
    const clientNote = normalizeNullableText(body.clientNote || body.client_note);
    const correctionNote = normalizeNullableText(body.correctionNote || body.correction_note);
    const nutritionPlanId = normalizeNullableText(body.nutritionPlanId || body.nutrition_plan_id);

    const context = await loadSubmissionContext(supabase, clientId, nutritionPlanId);
    const analysis = await extractNutritionPhotoCandidates(supabase, auth.profile, {
      bucket: body.bucket || "client-meal-photos",
      assets: normalizedAssets,
      mealTitle,
      clientNote,
      correctionNote,
      enableOpenAi: true,
    });

    const submissionInsertResponse = await supabase
      .from("nutrition_photo_submissions")
      .insert({
        client_id: clientId,
        coach_id: context.coachId,
        nutrition_plan_id: context.nutritionPlan?.id || null,
        log_date: logDate,
        meal_type: mealType,
        meal_title: mealTitle,
        client_note: clientNote,
        correction_note: correctionNote,
        detected_summary: analysis.summary,
        ai_provider: analysis.provider,
        extraction_status: analysis.candidates.length ? (analysis.lowConfidence ? "needs_review" : "processed") : "failed",
        review_status: "pending",
        candidate_status: correctionNote ? "client_adjusted" : "pending",
        confidence_score: Number(analysis.overallConfidence || 0),
        confidence_band: analysis.confidenceBand,
        low_confidence: Boolean(analysis.lowConfidence),
        metadata: {
          assetCount: normalizedAssets.length,
          detectionSummary: analysis.summary,
          providerMetadata: analysis.providerMetadata || {},
        },
      })
      .select("*")
      .single();
    throwOnError(submissionInsertResponse);
    const submission = submissionInsertResponse.data;

    const assetsInsertResponse = await supabase
      .from("nutrition_photo_assets")
      .insert(
        normalizedAssets.map((asset) => ({
          submission_id: submission.id,
          ...asset,
        }))
      )
      .select("*");
    throwOnError(assetsInsertResponse);

    const candidatesInsertResponse = analysis.candidates.length
      ? await supabase
          .from("nutrition_photo_candidates")
          .insert(
            analysis.candidates.map((candidate) => ({
              submission_id: submission.id,
              ...candidate,
            }))
          )
          .select("*")
      : { data: [], error: null };
    throwOnError(candidatesInsertResponse);

    if (auth.profile.role === "client") {
      await notifyClientAndCoach(supabase, {
        category: "planner",
        coachId: context.coachId,
        coachTitle: analysis.lowConfidence ? "Low-confidence meal photo needs review" : "New meal photo assist submitted",
        coachBody: `${mealTitle || "Meal photo"} is ready for planner review and candidate confirmation.`,
        coachActionUrl: "./coach-programming.html",
      }).catch(() => null);
    }

    return json(200, {
      ok: true,
      submission,
      assets: assetsInsertResponse.data || [],
      candidates: candidatesInsertResponse.data || [],
      message: "Meal photo submitted and analyzed.",
    });
  } catch (error) {
    return json(Number(error?.statusCode || 500), {
      error: error?.message || "Unable to submit the meal photo right now.",
    });
  }
};
