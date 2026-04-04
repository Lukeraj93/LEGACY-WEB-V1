(function initProgressPhotoUpload(globalScope, factory) {
  const api = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }

  if (globalScope && typeof globalScope === "object") {
    globalScope.LegacyProgressPhotoUpload = api;
  }
})(typeof globalThis !== "undefined" ? globalThis : this, () => {
  const MAX_PROGRESS_PHOTO_FILE_SIZE_BYTES = 10 * 1024 * 1024;
  const ALLOWED_PROGRESS_PHOTO_TYPES = ["image/jpeg", "image/png"];
  const REQUIRED_PROGRESS_PHOTO_FIELDS = ["frontPhoto", "sidePhoto", "backPhoto"];
  const FIELD_LABELS = {
    frontPhoto: "Front photo",
    sidePhoto: "Side photo",
    backPhoto: "Back photo",
    detailPhoto: "Detail photo",
  };

  function formatBytes(bytes) {
    const value = Number(bytes || 0);
    if (!Number.isFinite(value) || value <= 0) {
      return "0 MB";
    }

    const megabytes = value / (1024 * 1024);
    const rounded = megabytes >= 10 ? Math.round(megabytes) : Math.round(megabytes * 10) / 10;
    return `${rounded} MB`;
  }

  function formatProgressPhotoFileSizeLimit() {
    return formatBytes(MAX_PROGRESS_PHOTO_FILE_SIZE_BYTES);
  }

  function getProgressPhotoFieldLabel(fieldName) {
    return FIELD_LABELS[String(fieldName || "").trim()] || "Photo";
  }

  function isAllowedProgressPhotoType(contentType) {
    return ALLOWED_PROGRESS_PHOTO_TYPES.includes(String(contentType || "").trim().toLowerCase());
  }

  function validateProgressPhotoFile(file, options = {}) {
    const fieldLabel = options.fieldLabel || getProgressPhotoFieldLabel(options.fieldName);

    if (!file) {
      return {
        ok: false,
        code: "missing_file",
        error: `${fieldLabel} is required.`,
      };
    }

    if (!isAllowedProgressPhotoType(file.type)) {
      return {
        ok: false,
        code: "invalid_type",
        error: `${fieldLabel} must be a JPEG or PNG image.`,
      };
    }

    if (Number(file.size || 0) > MAX_PROGRESS_PHOTO_FILE_SIZE_BYTES) {
      return {
        ok: false,
        code: "file_too_large",
        error: `${fieldLabel} must be ${formatProgressPhotoFileSizeLimit()} or smaller.`,
      };
    }

    return {
      ok: true,
      code: "ok",
      error: "",
    };
  }

  function validateProgressPhotoBatch(filesByField) {
    const source = filesByField && typeof filesByField === "object" ? filesByField : {};
    const errors = [];

    REQUIRED_PROGRESS_PHOTO_FIELDS.forEach((fieldName) => {
      if (!source[fieldName]) {
        errors.push(`${getProgressPhotoFieldLabel(fieldName)} is required.`);
      }
    });

    ["frontPhoto", "sidePhoto", "backPhoto", "detailPhoto"].forEach((fieldName) => {
      const file = source[fieldName];
      if (!file) {
        return;
      }
      const result = validateProgressPhotoFile(file, { fieldName });
      if (!result.ok) {
        errors.push(result.error);
      }
    });

    return {
      ok: errors.length === 0,
      errors,
    };
  }

  function clampPercent(value) {
    const numeric = Number(value || 0);
    if (!Number.isFinite(numeric)) {
      return 0;
    }
    return Math.min(100, Math.max(0, Math.round(numeric)));
  }

  function buildProgressPhotoUploadState(stage, detail = {}) {
    const total = Math.max(1, Number(detail.total) || 1);
    const current = Math.min(total, Math.max(0, Number(detail.current) || 0));

    switch (String(stage || "").trim().toLowerCase()) {
      case "prepare":
        return {
          stage: "prepare",
          percent: 12,
          message: "Preparing secure upload...",
          busy: true,
          error: false,
          success: false,
        };
      case "upload":
        return {
          stage: "upload",
          percent: clampPercent(12 + (current / total) * 70),
          message: `Uploading photo ${Math.max(1, current)} of ${total}...`,
          busy: true,
          error: false,
          success: false,
        };
      case "save":
        return {
          stage: "save",
          percent: 92,
          message: "Saving progress-photo batch...",
          busy: true,
          error: false,
          success: false,
        };
      case "complete":
        return {
          stage: "complete",
          percent: 100,
          message: String(detail.message || "Progress photos uploaded and sent to your coach."),
          busy: false,
          error: false,
          success: true,
        };
      case "error":
        return {
          stage: "error",
          percent: clampPercent(detail.percent),
          message: String(detail.message || "Unable to upload the progress photos right now."),
          busy: false,
          error: true,
          success: false,
        };
      default:
        return {
          stage: "idle",
          percent: 0,
          message: "",
          busy: false,
          error: false,
          success: false,
        };
    }
  }

  return {
    ALLOWED_PROGRESS_PHOTO_TYPES,
    MAX_PROGRESS_PHOTO_FILE_SIZE_BYTES,
    REQUIRED_PROGRESS_PHOTO_FIELDS,
    buildProgressPhotoUploadState,
    formatProgressPhotoFileSizeLimit,
    getProgressPhotoFieldLabel,
    isAllowedProgressPhotoType,
    validateProgressPhotoBatch,
    validateProgressPhotoFile,
  };
});
