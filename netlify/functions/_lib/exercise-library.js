const {
  normalizeArray,
  normalizeBoolean,
  normalizeJson,
  normalizeNullableText,
  normalizeText,
} = require("./planner");

function slugifyExerciseId(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, "_")
    .replace(/^_+|_+$/gu, "");
}

function extractYoutubeVideoId(url) {
  const raw = String(url || "").trim();
  if (!raw) {
    return "";
  }

  try {
    const parsed = new URL(raw);
    const hostname = String(parsed.hostname || "").toLowerCase();
    if (hostname.includes("youtube.com")) {
      const videoId = parsed.searchParams.get("v") || "";
      return /^[A-Za-z0-9_-]{11}$/u.test(videoId) ? videoId : "";
    }
    if (hostname.includes("youtu.be")) {
      const videoId = parsed.pathname.replace(/^\/+/u, "");
      return /^[A-Za-z0-9_-]{11}$/u.test(videoId) ? videoId : "";
    }
  } catch (_) {
    return "";
  }

  return "";
}

function inferVideoProvider(url) {
  const raw = String(url || "").trim();
  if (!raw) {
    return "";
  }

  try {
    const parsed = new URL(raw);
    const hostname = String(parsed.hostname || "").toLowerCase();
    if (hostname.includes("youtube.com") || hostname.includes("youtu.be")) {
      return "youtube";
    }
    return hostname || "external";
  } catch (_) {
    return "";
  }
}

function buildExerciseLibraryRow(input = {}) {
  const name = normalizeText(input.name);
  const videoUrl = normalizeNullableText(input.videoUrl || input.video_url);
  const customFields = normalizeJson(input.customFields || input.custom_fields, {});
  const demoSourceMode = normalizeText(input.demoSourceMode || input.demo_source_mode || "manual");
  const youtubeVideoId = extractYoutubeVideoId(videoUrl || "");
  const videoProvider = inferVideoProvider(videoUrl || "");
  const demoPublishedAt = normalizeNullableText(
    input.publishedAt
    || input.published_at
    || customFields.demo_published_at
  );
  const demoChannel = normalizeNullableText(
    input.channelName
    || input.channel_name
    || input.demoChannel
    || input.demo_channel
    || customFields.demo_channel
  );
  const demoTitle = normalizeNullableText(
    input.demoTitle
    || input.demo_title
    || input.resolved_demo_title
    || customFields.resolved_demo_title
  );
  const libraryStatus = normalizeNullableText(
    input.libraryStatus
    || input.library_status
    || customFields.library_status
  );

  return {
    source_exercise_id: normalizeNullableText(input.sourceExerciseId || input.source_exercise_id || slugifyExerciseId(name)),
    name,
    description: normalizeNullableText(input.description),
    instructions: normalizeNullableText(input.instructions),
    image_urls: Array.isArray(input.imageUrls || input.image_urls) ? (input.imageUrls || input.image_urls) : [],
    video_url: videoUrl,
    autoplay_video: normalizeBoolean(input.autoplayVideo ?? input.autoplay_video, false),
    body_part: normalizeText(input.bodyPart || input.body_part || "full_body") || "full_body",
    target_muscles: normalizeArray(input.targetMuscles || input.target_muscles),
    secondary_muscles: normalizeArray(input.secondaryMuscles || input.secondary_muscles),
    equipment_needed: normalizeArray(input.equipmentNeeded || input.equipment_needed),
    difficulty: normalizeNullableText(input.difficulty),
    exercise_type: normalizeText(input.exerciseType || input.exercise_type || "standard") || "standard",
    notes: normalizeNullableText(input.notes),
    tags: normalizeArray(input.tags),
    is_active: normalizeBoolean(input.isActive ?? input.is_active, true),
    custom_fields: {
      ...customFields,
      demo_source_mode: demoSourceMode || customFields.demo_source_mode || "manual",
      video_provider: videoProvider || customFields.video_provider || "",
      youtube_video_id: youtubeVideoId || customFields.youtube_video_id || "",
      demo_note: normalizeText(input.demoNote || input.demo_note || customFields.demo_note || ""),
      demo_channel: demoChannel || "",
      demo_published_at: demoPublishedAt || "",
      resolved_demo_title: demoTitle || customFields.resolved_demo_title || "",
      library_status: libraryStatus || customFields.library_status || "",
    },
  };
}

module.exports = {
  buildExerciseLibraryRow,
  extractYoutubeVideoId,
  inferVideoProvider,
  slugifyExerciseId,
};
