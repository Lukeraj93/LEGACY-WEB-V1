const { json, methodNotAllowed, noContent } = require("./_lib/http");
const { estimateProgressPhotoBodyFat } = require("./_lib/progress-photo-ai");
const {
  createHttpError,
  normalizeArray,
  normalizeNullableText,
  normalizeNumber,
  normalizeText,
  normalizeTimestamp,
  notifyClientAndCoach,
  parseBody,
  requireAllowedRole,
  requireManagedClientAccess,
  throwOnError,
} = require("./_lib/planner");
const { getAuthenticatedProfile, getServiceSupabase, resolvePrimaryCoachForClient } = require("./_lib/supabase");

async function resolveClientAiContext(supabase, clientId) {
  const [profileResponse, clientProfileResponse] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name")
      .eq("id", clientId)
      .maybeSingle(),
    supabase
      .from("client_profiles")
      .select("preferred_name, primary_goal, gender, date_of_birth")
      .eq("id", clientId)
      .maybeSingle(),
  ]);

  throwOnError(profileResponse);
  throwOnError(clientProfileResponse);

  return {
    displayName: profileResponse.data?.display_name || "",
    preferredName: clientProfileResponse.data?.preferred_name || "",
    primaryGoal: clientProfileResponse.data?.primary_goal || "",
    gender: clientProfileResponse.data?.gender || "",
    dateOfBirth: clientProfileResponse.data?.date_of_birth || "",
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
      auth.profile.role === "client"
        ? auth.profile.id
        : normalizeText(body.clientId || body.client_id);

    if (!clientId) {
      throw createHttpError(400, "Client ID is required.");
    }

    await requireManagedClientAccess(supabase, auth.profile, clientId);

    const coachId =
      normalizeNullableText(body.coachId || body.coach_id)
      || (await resolvePrimaryCoachForClient(supabase, clientId))
      || null;
    const weightKg = normalizeNumber(body.weightKg || body.weight_kg);
    const manualBodyFatPercent = normalizeNumber(body.bodyFatPercent || body.body_fat_percent);
    const assets = Array.isArray(body.assets) ? body.assets : [];
    if (!assets.length) {
      throw createHttpError(400, "At least one progress photo asset is required.");
    }

    const normalizedAssets = assets
      .map((asset, index) => ({
        view_tag: normalizeText(asset.viewTag || asset.view_tag),
        storage_path: normalizeText(asset.storagePath || asset.storage_path),
        file_name: normalizeNullableText(asset.fileName || asset.file_name),
        content_type: normalizeNullableText(asset.contentType || asset.content_type),
        sort_order: Number(asset.sortOrder || asset.sort_order || index),
      }))
      .filter((asset) => asset.view_tag && asset.storage_path);

    const viewTags = new Set(normalizedAssets.map((asset) => asset.view_tag));
    const hasFront = viewTags.has("front");
    const hasBack = viewTags.has("back");
    const hasSide = viewTags.has("left") || viewTags.has("right");
    if (!hasFront || !hasBack || !hasSide) {
      throw createHttpError(400, "A valid progress photo batch must include front, side, and back views.");
    }

    let entry = null;
    let insertedAssets = [];
    try {
      const entryInsertResponse = await supabase
        .from("progress_photo_entries")
        .insert({
          client_id: clientId,
          coach_id: coachId,
          checkin_id: normalizeNullableText(body.checkinId || body.checkin_id),
          captured_at: normalizeTimestamp(body.capturedAt || body.captured_at || new Date().toISOString()),
          capture_period: normalizeNullableText(body.capturePeriod || body.capture_period),
          weight_kg: weightKg,
          body_fat_percent: manualBodyFatPercent,
          client_note: normalizeNullableText(body.clientNote || body.client_note),
          coach_note: normalizeNullableText(body.coachNote || body.coach_note),
          review_status: "pending",
          ai_body_fat_status: String(process.env.OPENAI_API_KEY || "").trim() ? "pending" : "unavailable",
        })
        .select("*")
        .single();
      throwOnError(entryInsertResponse);
      entry = entryInsertResponse.data;

      const assetInsertResponse = await supabase
        .from("progress_photo_assets")
        .insert(
          normalizedAssets.map((asset) => ({
            entry_id: entry.id,
            ...asset,
          }))
        )
        .select("id, view_tag, storage_path");
      throwOnError(assetInsertResponse);
      insertedAssets = assetInsertResponse.data || [];
    } catch (error) {
      if (entry?.id) {
        try {
          await supabase.from("progress_photo_entries").delete().eq("id", entry.id);
        } catch (_) {
          // Keep the original insert failure as the primary error.
        }
      }
      throw error;
    }

    let aiEstimate = null;
    const capturedAt = entry.captured_at || new Date().toISOString();
    try {
      const clientContext = await resolveClientAiContext(supabase, clientId);
      aiEstimate = await estimateProgressPhotoBodyFat(supabase, normalizedAssets, {
        clientName: clientContext.preferredName || clientContext.displayName || "",
        primaryGoal: clientContext.primaryGoal,
        gender: clientContext.gender,
        dateOfBirth: clientContext.dateOfBirth,
        weightKg,
        capturePeriod: entry.capture_period,
        clientNote: entry.client_note,
      });

      const aiUpdatePayload =
        aiEstimate?.status === "completed"
          ? {
              ai_body_fat_status: "completed",
              ai_body_fat_estimate: aiEstimate.estimatePercent,
              ai_body_fat_range_low: aiEstimate.rangeLow,
              ai_body_fat_range_high: aiEstimate.rangeHigh,
              ai_body_fat_confidence: aiEstimate.confidence,
              ai_body_fat_summary: aiEstimate.summary,
              ai_body_fat_visible_cues: aiEstimate.visibleCues,
              ai_body_fat_caveats: aiEstimate.caveats,
              ai_body_fat_provider: aiEstimate.provider,
              ai_body_fat_completed_at: capturedAt,
              ai_body_fat_error: null,
              ai_body_fat_raw: aiEstimate.rawResult || {},
            }
          : {
              ai_body_fat_status: aiEstimate?.status || "failed",
              ai_body_fat_provider: aiEstimate?.provider || "openai:gpt-4.1-mini",
              ai_body_fat_completed_at: capturedAt,
              ai_body_fat_error: normalizeNullableText(aiEstimate?.error || null),
            };

      const aiUpdateResponse = await supabase
        .from("progress_photo_entries")
        .update(aiUpdatePayload)
        .eq("id", entry.id)
        .select("*")
        .single();
      throwOnError(aiUpdateResponse);
      if (aiUpdateResponse.data) {
        entry.ai_body_fat_status = aiUpdateResponse.data.ai_body_fat_status;
        entry.ai_body_fat_estimate = aiUpdateResponse.data.ai_body_fat_estimate;
        entry.ai_body_fat_range_low = aiUpdateResponse.data.ai_body_fat_range_low;
        entry.ai_body_fat_range_high = aiUpdateResponse.data.ai_body_fat_range_high;
        entry.ai_body_fat_confidence = aiUpdateResponse.data.ai_body_fat_confidence;
        entry.ai_body_fat_summary = aiUpdateResponse.data.ai_body_fat_summary;
        entry.ai_body_fat_visible_cues = aiUpdateResponse.data.ai_body_fat_visible_cues;
        entry.ai_body_fat_caveats = aiUpdateResponse.data.ai_body_fat_caveats;
        entry.ai_body_fat_provider = aiUpdateResponse.data.ai_body_fat_provider;
        entry.ai_body_fat_completed_at = aiUpdateResponse.data.ai_body_fat_completed_at;
        entry.ai_body_fat_error = aiUpdateResponse.data.ai_body_fat_error;
      }
    } catch (error) {
      let aiFailureResponse = null;
      try {
        aiFailureResponse = await supabase
          .from("progress_photo_entries")
          .update({
            ai_body_fat_status: String(process.env.OPENAI_API_KEY || "").trim() ? "failed" : "unavailable",
            ai_body_fat_provider: "openai:gpt-4.1-mini",
            ai_body_fat_completed_at: capturedAt,
            ai_body_fat_error: normalizeNullableText(error?.message || "AI body-fat estimate failed."),
          })
          .eq("id", entry.id)
          .select("*")
          .single();
      } catch (_) {
        aiFailureResponse = null;
      }

      if (aiFailureResponse?.data) {
        entry.ai_body_fat_status = aiFailureResponse.data.ai_body_fat_status;
        entry.ai_body_fat_error = aiFailureResponse.data.ai_body_fat_error;
      } else {
        entry.ai_body_fat_status = String(process.env.OPENAI_API_KEY || "").trim() ? "failed" : "unavailable";
        entry.ai_body_fat_error = normalizeNullableText(error?.message || "AI body-fat estimate failed.");
      }
    }

    let notificationSent = true;
    if (auth.profile.role === "client") {
      notificationSent = await notifyClientAndCoach(supabase, {
        category: "planner",
        coachId,
        coachTitle: "New progress photos submitted",
        coachBody: "A client progress photo batch is ready for review.",
        coachActionUrl: "./coach-dashboard.html",
      }).then(() => true).catch(() => false);
    }

    return json(200, {
      ok: true,
      entry,
      assets: insertedAssets,
      aiEstimate,
      notificationSent,
      message: "Progress photo metadata saved.",
    });
  } catch (error) {
    return json(Number(error?.statusCode || 500), {
      error: error?.message || "Unable to save progress photo metadata right now.",
    });
  }
};
