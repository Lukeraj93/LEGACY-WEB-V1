const { json, methodNotAllowed, noContent } = require("./_lib/http");
const {
  createHttpError,
  normalizeNullableText,
  normalizeText,
  parseBody,
  requireAllowedRole,
  requireManagedClientAccess,
  throwOnError,
} = require("./_lib/planner");
const { extractNutritionPhotoCandidates } = require("./_lib/nutrition-photo-ai");
const { getAuthenticatedProfile, getServiceSupabase } = require("./_lib/supabase");

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

    const submissionId = normalizeText(body.submissionId || body.submission_id || body.id);
    if (!submissionId) {
      throw createHttpError(400, "Submission ID is required.");
    }

    const submissionResponse = await supabase
      .from("nutrition_photo_submissions")
      .select("*")
      .eq("id", submissionId)
      .maybeSingle();
    throwOnError(submissionResponse);
    const submission = submissionResponse.data;
    if (!submission?.id) {
      throw createHttpError(404, "Meal photo submission not found.");
    }

    await requireManagedClientAccess(supabase, auth.profile, submission.client_id);

    const assetsResponse = await supabase
      .from("nutrition_photo_assets")
      .select("*")
      .eq("submission_id", submission.id)
      .order("sort_order", { ascending: true });
    throwOnError(assetsResponse);

    const correctionNote = normalizeNullableText(body.correctionNote || body.correction_note);
    const analysis = await extractNutritionPhotoCandidates(supabase, auth.profile, {
      bucket: body.bucket || "client-meal-photos",
      assets: assetsResponse.data || [],
      mealTitle: submission.meal_title,
      clientNote: submission.client_note,
      correctionNote,
      enableOpenAi: true,
    });

    const updateResponse = await supabase
      .from("nutrition_photo_submissions")
      .update({
        correction_note: correctionNote,
        detected_summary: analysis.summary,
        ai_provider: analysis.provider,
        extraction_status: analysis.candidates.length ? (analysis.lowConfidence ? "needs_review" : "processed") : "failed",
        candidate_status: correctionNote ? "client_adjusted" : "pending",
        confidence_score: Number(analysis.overallConfidence || 0),
        confidence_band: analysis.confidenceBand,
        low_confidence: Boolean(analysis.lowConfidence),
        metadata: {
          ...(submission.metadata && typeof submission.metadata === "object" ? submission.metadata : {}),
          rerunAt: new Date().toISOString(),
          providerMetadata: analysis.providerMetadata || {},
        },
      })
      .eq("id", submission.id)
      .select("*")
      .single();
    throwOnError(updateResponse);

    const deleteResponse = await supabase
      .from("nutrition_photo_candidates")
      .delete()
      .eq("submission_id", submission.id);
    throwOnError(deleteResponse);

    const insertResponse = analysis.candidates.length
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
    throwOnError(insertResponse);

    return json(200, {
      ok: true,
      submission: updateResponse.data,
      candidates: insertResponse.data || [],
      message: "Meal photo suggestions refreshed.",
    });
  } catch (error) {
    return json(Number(error?.statusCode || 500), {
      error: error?.message || "Unable to refresh the meal photo suggestions right now.",
    });
  }
};
