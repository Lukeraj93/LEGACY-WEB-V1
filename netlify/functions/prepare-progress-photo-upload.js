const path = require("node:path");

const { json, methodNotAllowed, noContent } = require("./_lib/http");
const {
  createHttpError,
  normalizeText,
  parseBody,
  requireAllowedRole,
  requireManagedClientAccess,
} = require("./_lib/planner");
const { getAuthenticatedProfile, getServiceSupabase } = require("./_lib/supabase");

const BUCKET = "client-progress-photos";
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_CONTENT_TYPES = new Set(["image/jpeg", "image/png"]);
const ALLOWED_VIEW_TAGS = new Set(["front", "left", "right", "back", "detail"]);

function sanitizeFileStem(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-+|-+$/gu, "")
    .slice(0, 48) || "photo";
}

function resolveExtension(fileName, contentType) {
  const explicit = path.extname(String(fileName || "")).replace(/[^a-z0-9]/giu, "").toLowerCase();
  if (explicit && ["jpg", "jpeg", "png", "webp"].includes(explicit)) {
    return explicit === "jpeg" ? "jpg" : explicit;
  }

  if (contentType === "image/png") {
    return "png";
  }
  if (contentType === "image/webp") {
    return "webp";
  }
  return "jpg";
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

    const assets = Array.isArray(body.assets) ? body.assets : [];
    if (!assets.length) {
      throw createHttpError(400, "At least one photo asset must be prepared for upload.");
    }

    const entryId = auth.user?.id ? `${auth.user.id}-${Date.now()}` : `${Date.now()}`;
    const now = new Date();
    const year = String(now.getUTCFullYear());
    const month = String(now.getUTCMonth() + 1).padStart(2, "0");

    const signedAssets = [];
    for (let index = 0; index < assets.length; index += 1) {
      const asset = assets[index] || {};
      const viewTag = normalizeText(asset.viewTag || asset.view_tag).toLowerCase();
      const contentType = normalizeText(asset.contentType || asset.content_type);
      const fileName = normalizeText(asset.fileName || asset.file_name);
      const fileSize = Number(asset.fileSize || asset.file_size || 0);

      if (!ALLOWED_VIEW_TAGS.has(viewTag)) {
        throw createHttpError(400, `Unsupported progress photo view tag: ${viewTag || "unknown"}.`);
      }
      if (!ALLOWED_CONTENT_TYPES.has(contentType)) {
        throw createHttpError(400, `Unsupported progress photo content type: ${contentType || "unknown"}.`);
      }
      if (!Number.isFinite(fileSize) || fileSize <= 0) {
        throw createHttpError(400, "Each progress photo must include a valid file size.");
      }
      if (fileSize > MAX_FILE_SIZE_BYTES) {
        throw createHttpError(400, "Each progress photo must be 10 MB or smaller.");
      }

      const extension = resolveExtension(fileName, contentType);
      const safeStem = sanitizeFileStem(fileName.replace(/\.[^.]+$/u, ""));
      const storagePath = `${clientId}/${year}/${month}/${entryId}/${String(index + 1).padStart(2, "0")}-${viewTag}-${safeStem}.${extension}`;

      const { data, error } = await supabase.storage.from(BUCKET).createSignedUploadUrl(storagePath);
      if (error || !data?.token) {
        throw error || createHttpError(500, "Unable to prepare the progress photo upload right now.");
      }

      signedAssets.push({
        viewTag,
        storagePath,
        fileName: fileName || `${viewTag}.${extension}`,
        contentType,
        token: data.token,
        path: data.path || storagePath,
        signedUrl: data.signedUrl || "",
      });
    }

    return json(200, {
      ok: true,
      bucket: BUCKET,
      assets: signedAssets,
      message: "Progress photo uploads prepared.",
    });
  } catch (error) {
    return json(Number(error?.statusCode || 500), {
      error: error?.message || "Unable to prepare the progress photo upload right now.",
    });
  }
};
