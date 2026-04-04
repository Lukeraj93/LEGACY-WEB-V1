(function initClientPlanner() {
  function resolveStatusNode() {
    const existingNode = document.getElementById("client-planner-status");
    if (existingNode) {
      return existingNode;
    }

    const headerNode = document.querySelector(".crm-page-head");
    if (!headerNode) {
      return null;
    }

    const targetNode =
      headerNode.querySelector(".crm-topbar__title")
      || headerNode.querySelector(".crm-page-head__title")
      || headerNode.firstElementChild
      || headerNode;

    const node = document.createElement("p");
    node.id = "client-planner-status";
    node.className = "dashboard-feedback";
    targetNode.appendChild(node);
    return node;
  }

  const statusNode = resolveStatusNode();
  if (!statusNode) {
    return;
  }

  const tabNodes = Array.from(document.querySelectorAll("[data-client-planner-tab]"));
  const panelNodes = Array.from(document.querySelectorAll("[data-client-planner-panel]"));

  const metricProgramNode = document.getElementById("client-planner-stat-program");
  const metricProgramNoteNode = document.getElementById("client-planner-stat-program-note");
  const metricDaysNode = document.getElementById("client-planner-stat-days");
  const metricDaysNoteNode = document.getElementById("client-planner-stat-days-note");
  const metricCompletedNode = document.getElementById("client-planner-stat-completed");
  const metricCompletedNoteNode = document.getElementById("client-planner-stat-completed-note");
  const metricReviewNode = document.getElementById("client-planner-stat-review");
  const metricReviewNoteNode = document.getElementById("client-planner-stat-review-note");

  const assignmentSummaryNode = document.getElementById("client-planner-assignment-summary");
  const dayFocusNode = document.getElementById("client-planner-day-focus");
  const trainingCalendarNode = document.getElementById("client-planner-training-calendar");
  const trainingDetailNode = document.getElementById("client-planner-training-detail");
  const workoutListNode = trainingDetailNode;

  const nutritionSummaryNode = document.getElementById("client-planner-nutrition-summary");
  const nutritionPlanNode = document.getElementById("client-planner-nutrition-plan");
  const nutritionCalendarNode = document.getElementById("client-planner-nutrition-calendar");
  const nutritionDayDetailNode = document.getElementById("client-planner-nutrition-day-detail");
  const nutritionWorkspaceTabNodes = Array.from(document.querySelectorAll("[data-client-nutrition-workspace]"));
  const nutritionWorkspacePanelNodes = Array.from(document.querySelectorAll("[data-client-nutrition-workspace-panel]"));
  const nutritionDateNode = document.getElementById("client-planner-nutrition-date");
  const nutritionForm = document.getElementById("client-planner-nutrition-form");
  const nutritionFeedbackNode = document.getElementById("client-planner-nutrition-feedback");
  const habitListNode = document.getElementById("client-planner-habit-list");
  const nutritionFeedNode = document.getElementById("client-planner-nutrition-feed");
  const mealForm = document.getElementById("client-planner-meal-form");
  const mealDateNode = document.getElementById("client-planner-meal-date");
  const mealFeedbackNode = document.getElementById("client-planner-meal-feedback");
  const mealEntryToggleButton = document.getElementById("client-planner-meal-entry-toggle");
  const mealEntryActionsNode = document.getElementById("client-planner-meal-entry-actions");
  const mealEntryModeButtonNodes = Array.from(document.querySelectorAll("[data-meal-entry-mode]"));
  const mealEntryModePanelNodes = Array.from(document.querySelectorAll("[data-meal-entry-panel]"));
  const foodSearchNode = document.getElementById("client-planner-food-search");
  const foodSearchButton = document.getElementById("client-planner-food-search-button");
  const foodSearchResultsNode = document.getElementById("client-planner-food-search-results");
  const favoriteFoodsNode = document.getElementById("client-planner-favorite-foods");
  const recentFoodsNode = document.getElementById("client-planner-recent-foods");
  const recipePicksNode = document.getElementById("client-planner-recipe-picks");
  const barcodeNode = document.getElementById("client-planner-food-barcode");
  const barcodeButton = document.getElementById("client-planner-food-barcode-button");
  const barcodeCameraButton = document.getElementById("client-planner-barcode-camera-button");
  const barcodeStopButton = document.getElementById("client-planner-barcode-stop-button");
  const barcodePhotoButton = document.getElementById("client-planner-barcode-photo-button");
  const barcodePhotoInput = document.getElementById("client-planner-barcode-photo-input");
  const barcodePhotoSelectionNode = document.getElementById("client-planner-barcode-photo-selection");
  const barcodeScannerNode = document.getElementById("client-planner-barcode-scanner");
  const barcodeVideoNode = document.getElementById("client-planner-barcode-video");
  const barcodeFeedbackNode = document.getElementById("client-planner-barcode-feedback");
  const barcodeResultNode = document.getElementById("client-planner-barcode-result");
  const mealBuilderNode = document.getElementById("client-planner-meal-builder");
  const mealTotalsNode = document.getElementById("client-planner-meal-totals");
  const mealFeedNode = document.getElementById("client-planner-meal-feed");
  const photoForm = document.getElementById("client-planner-photo-form");
  const photoDateNode = document.getElementById("client-planner-photo-date");
  const photoSelectionNode = document.getElementById("client-planner-photo-selection");
  const photoFeedbackNode = document.getElementById("client-planner-photo-feedback");
  const photoFeedNode = document.getElementById("client-planner-photo-feed");

  const checkinForm = document.getElementById("client-planner-checkin-form");
  const checkinTemplateNode = document.getElementById("client-planner-checkin-template");
  const checkinDueNode = document.getElementById("client-planner-checkin-due");
  const checkinQuestionStackNode = document.getElementById("client-planner-question-stack");
  const checkinFeedbackNode = document.getElementById("client-planner-checkin-feedback");
  const checkinFeedNode = document.getElementById("client-planner-checkin-feed");
  const healthSummaryNode = document.getElementById("client-planner-health-summary");

  const progressForm = document.getElementById("client-planner-progress-form");
  const progressCapturedAtNode = document.getElementById("client-planner-progress-captured-at");
  const progressSelectionNode = document.getElementById("client-planner-progress-selection");
  const progressFeedbackNode = document.getElementById("client-planner-progress-feedback");
  const progressMeterNode = document.getElementById("client-planner-progress-meter");
  const progressMeterLabelNode = document.getElementById("client-planner-progress-meter-label");
  const progressMeterPercentNode = document.getElementById("client-planner-progress-meter-percent");
  const progressMeterFillNode = document.getElementById("client-planner-progress-meter-fill");
  const progressFeedNode = document.getElementById("client-planner-progress-feed");
  const progressPeriodNode = document.getElementById("client-planner-progress-period");
  const progressWeightNode = document.getElementById("client-planner-progress-weight");
  const progressAiNode = document.getElementById("client-planner-progress-ai");
  const progressReviewNode = document.getElementById("client-planner-progress-review");
  const plannerGuideToggleNodes = Array.from(document.querySelectorAll("[data-planner-guide-toggle]"));
  const plannerGuidePanelNodes = Array.from(document.querySelectorAll("[data-planner-guide-panel]"));
  const localPreviewUrlsByNode = new Map();
  const progressPhotoUpload = window.LegacyProgressPhotoUpload || {};

  const EMPTY_DATA = {
    assignments: [],
    programDays: [],
    programExercises: [],
    workoutLogs: [],
    workoutExerciseLogs: [],
    nutritionPlans: [],
    nutritionHabits: [],
    nutritionLogs: [],
    mealEntries: [],
    mealItems: [],
    nutritionPhotoSubmissions: [],
    nutritionPhotoAssets: [],
    nutritionPhotoCandidates: [],
    catalogFoods: [],
    favoriteFoods: [],
    recentFoods: [],
    recipes: [],
    recipeIngredients: [],
    checkins: [],
    checkinTemplates: [],
    checkinQuestions: [],
    rewardEvents: [],
    progressPhotos: [],
    progressPhotoAssets: [],
  };

  const state = {
    access: null,
    supabase: null,
    data: { ...EMPTY_DATA },
    activePanel: "training",
    selectedTrainingDayId: "",
    selectedNutritionDayKey: "",
    activeNutritionWorkspace: "adherence",
    mealEntryDisclosureOpen: false,
    activeMealEntryMode: "",
    loading: false,
    hasLoadedOnce: false,
    selectedCheckinTemplateId: "",
    foodSearchResults: [],
    externalFoodSearchResults: [],
    mealBuilderItems: [],
    activeNutritionPhotoSubmissionId: "",
    barcodeLookup: null,
    barcodeScanner: {
      stream: null,
      rafId: 0,
      detector: null,
      active: false,
      supported: typeof window !== "undefined" && "BarcodeDetector" in window,
      lastDetectedValue: "",
      lastDetectedAt: 0,
    },
    refreshTimer: 0,
    realtimeChannel: null,
  };

  function setStatus(message, isError) {
    statusNode.textContent = message;
    statusNode.classList.toggle("error", Boolean(isError));
    statusNode.classList.toggle("success", Boolean(message) && !isError);
  }

  function setInlineFeedback(node, message, isError, isBusy = false) {
    if (!node) {
      return;
    }
    node.textContent = message;
    node.classList.toggle("error", Boolean(isError));
    node.classList.toggle("success", Boolean(message) && !isError);
    node.classList.toggle("is-syncing", Boolean(isBusy));
    node.setAttribute("aria-live", Boolean(message) ? "polite" : "off");
  }

  function buildProgressUploadState(stage, detail) {
    if (typeof progressPhotoUpload.buildProgressPhotoUploadState === "function") {
      return progressPhotoUpload.buildProgressPhotoUploadState(stage, detail);
    }

    return {
      stage: stage || "idle",
      percent: 0,
      message: detail?.message || "",
      busy: false,
      error: String(stage || "") === "error",
      success: String(stage || "") === "complete",
    };
  }

  function setProgressUploadState(stage, detail) {
    const nextState = typeof stage === "object" && stage ? stage : buildProgressUploadState(stage, detail);
    if (!progressMeterNode || !progressMeterLabelNode || !progressMeterPercentNode || !progressMeterFillNode) {
      return nextState;
    }

    const isVisible = nextState.stage && nextState.stage !== "idle";
    const percent = Math.max(0, Math.min(100, Number(nextState.percent || 0)));

    progressMeterNode.hidden = !isVisible;
    progressMeterNode.classList.toggle("is-complete", Boolean(nextState.success));
    progressMeterNode.classList.toggle("is-error", Boolean(nextState.error));
    progressMeterLabelNode.textContent = nextState.message || "";
    progressMeterPercentNode.textContent = `${Math.round(percent)}%`;
    progressMeterFillNode.style.width = `${percent}%`;
    progressMeterFillNode.parentElement?.setAttribute("aria-valuenow", String(Math.round(percent)));
    return nextState;
  }

  function setProgressFormBusy(isBusy) {
    if (!progressForm) {
      return;
    }

    Array.from(progressForm.elements || []).forEach((element) => {
      if (!(element instanceof HTMLElement)) {
        return;
      }
      if (element.type === "hidden") {
        return;
      }
      element.disabled = Boolean(isBusy);
    });

    const submitButton = progressForm.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.textContent = isBusy ? "Uploading Progress..." : "Track Progress Photos";
    }
  }

  function setFormSubmitBusy(formNode, busyLabel) {
    const submitButton = formNode?.querySelector?.('button[type="submit"]');
    if (!(submitButton instanceof HTMLButtonElement)) {
      return () => {};
    }

    const originalHtml = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.setAttribute("aria-busy", "true");
    submitButton.innerHTML = `<span class="btn-spinner" aria-hidden="true"></span><span>${escapeHtml(busyLabel || "Working...")}</span>`;

    return () => {
      submitButton.disabled = false;
      submitButton.removeAttribute("aria-busy");
      submitButton.innerHTML = originalHtml;
    };
  }

  function validateProgressFormFiles(filesByField) {
    if (typeof progressPhotoUpload.validateProgressPhotoBatch === "function") {
      return progressPhotoUpload.validateProgressPhotoBatch(filesByField);
    }

    return { ok: true, errors: [] };
  }

  async function cleanupClientUploadAssets(paths, bucket = "client-progress-photos") {
    const storagePaths = Array.isArray(paths)
      ? paths.map((path) => String(path || "").trim()).filter(Boolean)
      : [];

    if (!storagePaths.length) {
      return;
    }

    try {
      await plannerRequest("/.netlify/functions/cleanup-client-upload-assets", {
        method: "POST",
        body: {
          bucket,
          paths: storagePaths,
        },
      });
    } catch (_) {
      // Cleanup is best-effort; surface the original failure to the user.
    }
  }

  function collectUploadedAnswerAssetPaths(answers) {
    if (!Array.isArray(answers)) {
      return [];
    }

    return answers.flatMap((answer) => {
      const assets = Array.isArray(answer?.valueJson?.assets) ? answer.valueJson.assets : [];
      return assets
        .map((asset) => String(asset?.storagePath || asset?.storage_path || "").trim())
        .filter(Boolean);
    });
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/gu, "&amp;")
      .replace(/</gu, "&lt;")
      .replace(/>/gu, "&gt;")
      .replace(/"/gu, "&quot;")
      .replace(/'/gu, "&#39;");
  }

  function formatCount(value) {
    return Number(value || 0).toLocaleString("en-MY");
  }

  function formatDate(value) {
    if (!value) {
      return "Not set";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "Not set";
    }

    return new Intl.DateTimeFormat("en-MY", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  }

  function formatDateTime(value) {
    if (!value) {
      return "Not submitted";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "Not submitted";
    }

    return new Intl.DateTimeFormat("en-MY", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  }

  function formatDateOnlyInput(value) {
    const date = value ? new Date(value) : new Date();
    if (Number.isNaN(date.getTime())) {
      return new Date().toISOString().slice(0, 10);
    }
    return date.toISOString().slice(0, 10);
  }

  function formatDateTimeLocalInput(value) {
    const date = value ? new Date(value) : new Date();
    if (Number.isNaN(date.getTime())) {
      return "";
    }

    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
  }

  function toIsoFromLocalInput(value) {
    if (!value) {
      return "";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "";
    }
    return date.toISOString();
  }

  function toTitleCase(value) {
    return String(value || "")
      .replace(/[_-]+/gu, " ")
      .trim()
      .replace(/\b\w/gu, (character) => character.toUpperCase());
  }

  function asObject(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  }

  function buildSkeletonLine(width = "100%", modifier = "copy") {
    return `<span class="dashboard-skeleton dashboard-skeleton--${modifier}" style="--skeleton-width:${width};"></span>`;
  }

  function buildSkeletonStack(widths, modifier = "copy", compact = false) {
    return `
      <div class="dashboard-skeleton-stack${compact ? " dashboard-skeleton-stack--compact" : ""}">
        ${widths.map((width) => buildSkeletonLine(width, modifier)).join("")}
      </div>
    `;
  }

  function buildPlannerSummarySkeleton() {
    return `
      <article class="client-planner-summary-card dashboard-skeleton-card dashboard-skeleton-card--brief">
        ${buildSkeletonStack(["38%", "62%"], "label", true)}
        ${buildSkeletonStack(["96%", "88%", "74%"], "copy")}
        <div class="dashboard-skeleton-grid dashboard-skeleton-grid--two">
          <div>${buildSkeletonStack(["56%", "76%"], "copy", true)}</div>
          <div>${buildSkeletonStack(["52%", "72%"], "copy", true)}</div>
          <div>${buildSkeletonStack(["48%", "68%"], "copy", true)}</div>
          <div>${buildSkeletonStack(["54%", "74%"], "copy", true)}</div>
        </div>
      </article>
    `;
  }

  function buildPlannerFeedSkeleton(count = 3) {
    return Array.from({ length: count }, () => `
      <article class="client-planner-feed-card dashboard-skeleton-card">
        ${buildSkeletonStack(["44%", "72%"], "label", true)}
        ${buildSkeletonStack(["94%", "86%", "68%"], "copy")}
      </article>
    `).join("");
  }

  function setPlannerSyncState(isSyncing) {
    document.body.classList.toggle("dashboard-hydrating-secondary", Boolean(isSyncing));
    statusNode.classList.toggle("is-syncing", Boolean(isSyncing));
    statusNode.setAttribute("aria-live", isSyncing ? "polite" : "off");

    panelNodes.forEach((panelNode) => {
      const isActive = panelNode.classList.contains("is-active");
      const applySync = Boolean(isSyncing) && isActive;
      panelNode.classList.toggle("is-syncing", applySync);
      panelNode.setAttribute("aria-busy", String(applySync));
    });
  }

  function renderInitialPlannerSkeleton() {
    if (metricProgramNode) metricProgramNode.innerHTML = buildSkeletonLine("54%", "value");
    if (metricProgramNoteNode) metricProgramNoteNode.innerHTML = buildSkeletonLine("82%", "copy");
    if (metricDaysNode) metricDaysNode.innerHTML = buildSkeletonLine("42%", "value");
    if (metricDaysNoteNode) metricDaysNoteNode.innerHTML = buildSkeletonLine("76%", "copy");
    if (metricCompletedNode) metricCompletedNode.innerHTML = buildSkeletonLine("38%", "value");
    if (metricCompletedNoteNode) metricCompletedNoteNode.innerHTML = buildSkeletonLine("74%", "copy");
    if (metricReviewNode) metricReviewNode.innerHTML = buildSkeletonLine("36%", "value");
    if (metricReviewNoteNode) metricReviewNoteNode.innerHTML = buildSkeletonLine("70%", "copy");

    if (state.activePanel === "training") {
      if (assignmentSummaryNode) assignmentSummaryNode.innerHTML = buildPlannerSummarySkeleton();
      if (dayFocusNode) dayFocusNode.innerHTML = buildPlannerSummarySkeleton();
      if (trainingCalendarNode) trainingCalendarNode.innerHTML = buildPlannerFeedSkeleton(6);
      if (trainingDetailNode) trainingDetailNode.innerHTML = buildPlannerFeedSkeleton(1);
      return;
    }

    if (state.activePanel === "nutrition") {
      if (nutritionSummaryNode) nutritionSummaryNode.innerHTML = buildPlannerSummarySkeleton();
      if (habitListNode) habitListNode.innerHTML = buildPlannerFeedSkeleton(3);
      if (nutritionFeedNode) nutritionFeedNode.innerHTML = buildPlannerFeedSkeleton(3);
      if (foodSearchResultsNode) foodSearchResultsNode.innerHTML = buildPlannerFeedSkeleton(2);
      if (mealFeedNode) mealFeedNode.innerHTML = buildPlannerFeedSkeleton(2);
      if (photoFeedNode) photoFeedNode.innerHTML = buildPlannerFeedSkeleton(2);
      return;
    }

    if (state.activePanel === "health") {
      if (healthSummaryNode) healthSummaryNode.innerHTML = buildPlannerSummarySkeleton();
      if (checkinQuestionStackNode) checkinQuestionStackNode.innerHTML = buildPlannerFeedSkeleton(2);
      if (checkinFeedNode) checkinFeedNode.innerHTML = buildPlannerFeedSkeleton(2);
      return;
    }

    if (state.activePanel === "progress") {
      if (progressSelectionNode) progressSelectionNode.innerHTML = buildPlannerFeedSkeleton(2);
      if (progressFeedNode) progressFeedNode.innerHTML = buildPlannerFeedSkeleton(2);
      if (progressPeriodNode) progressPeriodNode.innerHTML = buildSkeletonLine("64%", "copy");
      if (progressWeightNode) progressWeightNode.innerHTML = buildSkeletonLine("56%", "copy");
      if (progressReviewNode) progressReviewNode.innerHTML = buildSkeletonLine("68%", "copy");
    }
  }

  function roundNumber(value) {
    const numeric = Number(value || 0);
    return Number.isFinite(numeric) ? Math.round(numeric * 100) / 100 : 0;
  }

  function formatMacroValue(value, suffix = "") {
    const numeric = Number(value || 0);
    if (!Number.isFinite(numeric)) {
      return `0${suffix}`;
    }
    const output = numeric % 1 === 0 ? String(numeric) : numeric.toFixed(1).replace(/\.0$/u, "");
    return `${output}${suffix}`;
  }

  function mealTypeLabel(value) {
    return toTitleCase(String(value || "other").replace(/_/gu, " "));
  }

  function revokeLocalPreviewUrls(node) {
    if (!(node instanceof HTMLElement)) {
      return;
    }

    const urls = localPreviewUrlsByNode.get(node) || [];
    urls.forEach((url) => {
      try {
        URL.revokeObjectURL(url);
      } catch (_) {
        // Ignore stale object URL cleanup failures.
      }
    });
    localPreviewUrlsByNode.delete(node);
  }

  function revokeAllLocalPreviewUrls() {
    Array.from(localPreviewUrlsByNode.keys()).forEach((node) => {
      revokeLocalPreviewUrls(node);
    });
  }

  function createLocalPreviewUrl(node, file) {
    if (!(node instanceof HTMLElement) || !(file instanceof File)) {
      return "";
    }

    const objectUrl = URL.createObjectURL(file);
    const urls = localPreviewUrlsByNode.get(node) || [];
    urls.push(objectUrl);
    localPreviewUrlsByNode.set(node, urls);
    return objectUrl;
  }

  function buildUploadPreviewCardMarkup(node, entry, options = {}) {
    const label = String(entry?.label || "Photo");
    const emptyText = String(entry?.emptyText || "No file selected yet.");
    const file = entry?.file instanceof File ? entry.file : null;
    const frameClass = options.variant === "portrait" ? "is-portrait" : "is-square";

    if (!file) {
      return `
        <article class="client-planner-upload-preview client-planner-upload-preview--empty">
          <div class="client-planner-upload-preview__frame ${frameClass}">
            <span>${escapeHtml(label)}</span>
          </div>
          <div class="client-planner-upload-preview__copy">
            <strong>${escapeHtml(label)}</strong>
            <p>${escapeHtml(emptyText)}</p>
          </div>
        </article>
      `;
    }

    const previewUrl = createLocalPreviewUrl(node, file);
    return `
      <article class="client-planner-upload-preview">
        <div class="client-planner-upload-preview__frame ${frameClass}">
          <img src="${escapeHtml(previewUrl)}" alt="${escapeHtml(label)} preview" loading="lazy" />
        </div>
        <div class="client-planner-upload-preview__copy">
          <strong>${escapeHtml(label)}</strong>
          <p>${escapeHtml(file.name)}</p>
          <small>${escapeHtml(file.type || "unknown")} • ${escapeHtml((file.size / 1024 / 1024).toFixed(2))} MB</small>
        </div>
      </article>
    `;
  }

  function resolvePlannerAssetLabel(asset) {
    return toTitleCase(asset?.view_tag || asset?.viewTag || "photo");
  }

  function resolvePlannerAssetName(asset) {
    return String(asset?.file_name || asset?.fileName || asset?.storage_path?.split("/").pop() || "Stored image");
  }

  function buildStoredAssetPreviewMarkup(asset, options = {}) {
    const frameClass = options.variant === "portrait" ? "is-portrait" : "is-square";
    const label = resolvePlannerAssetLabel(asset);
    const fileName = resolvePlannerAssetName(asset);
    const signedUrl = String(asset?.signed_url || asset?.signedUrl || "").trim();

    return `
      <article class="client-planner-stored-asset">
        <div class="client-planner-stored-asset__frame ${frameClass}">
          ${
            signedUrl
              ? `<img src="${escapeHtml(signedUrl)}" alt="${escapeHtml(label)} photo" loading="lazy" />`
              : `<span>${escapeHtml(label)}</span>`
          }
        </div>
        <div class="client-planner-stored-asset__copy">
          <strong>${escapeHtml(label)}</strong>
          <small>${escapeHtml(fileName)}</small>
        </div>
      </article>
    `;
  }

  function buildStoredAssetGalleryMarkup(assets, options = {}) {
    const rows = Array.isArray(assets) ? assets : [];
    if (!rows.length) {
      return "";
    }

    return `
      <div class="client-planner-stored-gallery">
        ${rows.map((asset) => buildStoredAssetPreviewMarkup(asset, options)).join("")}
      </div>
    `;
  }

  function renderBarcodePhotoSelection(file = null) {
    if (!(barcodePhotoSelectionNode instanceof HTMLElement)) {
      return;
    }

    revokeLocalPreviewUrls(barcodePhotoSelectionNode);
    barcodePhotoSelectionNode.innerHTML = buildUploadPreviewCardMarkup(
      barcodePhotoSelectionNode,
      {
        label: "Barcode photo",
        emptyText: "Choose a barcode image to preview it before scanning.",
        file,
      },
      { variant: "square" }
    );
  }

  function setPlannerGuidePanelState(guideKey, isOpen) {
    plannerGuidePanelNodes.forEach((panelNode) => {
      const matches = panelNode.dataset.plannerGuidePanel === guideKey;
      if (matches) {
        panelNode.hidden = !isOpen;
      } else if (isOpen) {
        panelNode.hidden = true;
      }
    });

    plannerGuideToggleNodes.forEach((buttonNode) => {
      const matches = buttonNode.dataset.plannerGuideToggle === guideKey;
      const nextOpen = matches ? isOpen : false;
      buttonNode.setAttribute("aria-expanded", String(nextOpen));
      buttonNode.classList.toggle("is-active", nextOpen);
      const openLabel = buttonNode.dataset.guideOpenLabel || "View Guide";
      const closeLabel = buttonNode.dataset.guideCloseLabel || "Hide Guide";
      buttonNode.textContent = nextOpen ? closeLabel : openLabel;
    });
  }

  function sourceMappingLabel(food) {
    const mapping = Array.isArray(food?.sourceMappings) ? food.sourceMappings[0] : null;
    if (mapping?.sourceLabel) {
      return mapping.sourceLabel;
    }
    if (mapping?.sourceSystem) {
      return toTitleCase(mapping.sourceSystem);
    }
    return "";
  }

  function getAssignmentSportProfile(assignment) {
    return asObject(asObject(assignment?.custom_targets).sportProfile);
  }

  function getAssignmentWorkbook(assignment) {
    return asObject(asObject(assignment?.custom_targets).workbook);
  }

  function resolveAthleteEngine() {
    return window.LegacyAthleteEngine && typeof window.LegacyAthleteEngine.resolveExerciseDemo === "function"
      ? window.LegacyAthleteEngine
      : null;
  }

  function formatDurationHuman(totalSeconds) {
    const seconds = Number(totalSeconds || 0);
    if (!Number.isFinite(seconds) || seconds <= 0) {
      return "";
    }
    if (seconds % 3600 === 0) {
      return `${seconds / 3600} hr`;
    }
    if (seconds >= 3600) {
      return `${(seconds / 3600).toFixed(1).replace(/\.0$/u, "")} hr`;
    }
    if (seconds % 60 === 0) {
      return `${seconds / 60} min`;
    }
    return `${seconds}s`;
  }

  function formatDistanceHuman(distanceMeters) {
    const meters = Number(distanceMeters || 0);
    if (!Number.isFinite(meters) || meters <= 0) {
      return "";
    }
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(meters % 1000 === 0 ? 0 : 1)} km`;
    }
    return `${meters} m`;
  }

  function formatDecimalHuman(value, suffix = "") {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) {
      return "";
    }
    const output = numeric % 1 === 0 ? String(numeric) : numeric.toFixed(1).replace(/\.0$/u, "");
    return `${output}${suffix}`;
  }

  function formatPercentHuman(value) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) {
      return "";
    }
    return `${Math.round(numeric * 100)}%`;
  }

  function getWorkbookOutput(workbook, key) {
    return asObject(workbook?.outputs)[key];
  }

  function buildWorkbookPairs(workbook) {
    if (!workbook?.kind) {
      return [];
    }

    if (Array.isArray(workbook.previewPairs) && workbook.previewPairs.length) {
      return workbook.previewPairs
        .filter((item) => item?.label && item?.value)
        .map((item) => ({
          label: String(item.label || "").trim(),
          value: String(item.value || "").trim(),
        }));
    }

    if (workbook.kind === "runner") {
      return [
        { label: "Phase", value: getWorkbookOutput(workbook, "runner_phase") },
        { label: "Days to goal", value: formatDecimalHuman(getWorkbookOutput(workbook, "runner_days_to_event")) },
        { label: "Safe ramp", value: formatPercentHuman(getWorkbookOutput(workbook, "runner_safe_volume_ramp_pct")) },
        { label: "Next-week target", value: formatDecimalHuman(getWorkbookOutput(workbook, "runner_suggested_next_week_km"), " km") },
        { label: "Long-run target", value: formatDecimalHuman(getWorkbookOutput(workbook, "runner_recommended_long_run_km"), " km") },
        { label: "Readiness", value: workbook.readiness?.band || "" },
      ].filter((item) => item.value);
    }

    if (workbook.kind === "hyrox") {
      return [
        { label: "Phase", value: getWorkbookOutput(workbook, "hyrox_phase") },
        { label: "Days to race", value: formatDecimalHuman(getWorkbookOutput(workbook, "hyrox_days_to_event")) },
        { label: "Safe run ramp", value: formatPercentHuman(getWorkbookOutput(workbook, "hyrox_safe_run_ramp_pct")) },
        { label: "Next-week run", value: formatDecimalHuman(getWorkbookOutput(workbook, "hyrox_suggested_next_week_run_km"), " km") },
        { label: "Hybrid sessions", value: formatDecimalHuman(getWorkbookOutput(workbook, "hyrox_recommended_hybrid_sessions_wk")) },
        { label: "Readiness", value: workbook.readiness?.band || "" },
      ].filter((item) => item.value);
    }

    return [
      { label: "Phase", value: getWorkbookOutput(workbook, "endurance_phase") },
      { label: "Days to event", value: formatDecimalHuman(getWorkbookOutput(workbook, "endurance_days_to_event")) },
      { label: "Safe ramp", value: formatPercentHuman(getWorkbookOutput(workbook, "endurance_safe_volume_ramp_pct")) },
      { label: "Next-week target", value: formatDecimalHuman(getWorkbookOutput(workbook, "endurance_suggested_next_week_hours"), " h") },
      { label: "Long session", value: formatDecimalHuman(getWorkbookOutput(workbook, "endurance_recommended_long_session_h"), " h") },
      { label: "Readiness", value: workbook.readiness?.band || "" },
    ].filter((item) => item.value);
  }

  function buildWorkbookSummaryMarkup(workbook) {
    const lines = Array.isArray(workbook?.summaryCard) ? workbook.summaryCard.filter(Boolean) : [];
    if (!lines.length) {
      return "";
    }
    return `
      <div class="client-planner-summary-copy">
        ${lines.map((line) => `<p>${escapeHtml(line)}</p>`).join("")}
      </div>
    `;
  }

  function computeDaysToGoal(goalDate) {
    if (!goalDate) {
      return null;
    }
    const target = new Date(goalDate);
    if (Number.isNaN(target.getTime())) {
      return null;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);
    return Math.round((target.getTime() - today.getTime()) / 86400000);
  }

  function getTodayDateOnly() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function getPlannerDayTiming(day, todayValue = getTodayDateOnly()) {
    if (!day?.scheduled_date) {
      return {
        key: "undated",
        label: "Current block",
        longLabel: "Current block",
      };
    }

    const scheduledDate = String(day.scheduled_date);
    if (scheduledDate === todayValue) {
      return {
        key: "today",
        label: "Today",
        longLabel: "Today",
      };
    }

    const today = new Date(`${todayValue}T00:00:00`);
    const target = new Date(`${scheduledDate}T00:00:00`);
    const diffDays = Math.round((target.getTime() - today.getTime()) / 86400000);
    if (diffDays === 1) {
      return {
        key: "tomorrow",
        label: "Tomorrow",
        longLabel: "Tomorrow",
      };
    }

    return {
      key: diffDays > 1 ? "upcoming" : "other",
      label: formatDate(scheduledDate),
      longLabel: formatDate(scheduledDate),
    };
  }

  function resolvePlannerDayTitle(day, todayValue = getTodayDateOnly()) {
    if (!day) {
      return "";
    }
    const timing = getPlannerDayTiming(day, todayValue);
    const baseTitle = day.title || (String(day.day_type || "").toLowerCase() === "rest" ? "Rest day" : "Training day");
    return timing.key === "today" || timing.key === "tomorrow"
      ? `${timing.label} | ${baseTitle}`
      : baseTitle;
  }

  function buildSportProfilePairs(profile) {
    const resolved = asObject(profile);
    const daysToGoal = computeDaysToGoal(resolved.goalDate);
    return [
      {
        label: "Athlete type",
        value: toTitleCase(resolved.athleteProfile || resolved.primarySport || ""),
      },
      {
        label: "Goal",
        value: resolved.goalEvent || resolved.goalFocus || "",
      },
      {
        label: "Days to goal",
        value: daysToGoal !== null ? `${daysToGoal} days` : "",
      },
      {
        label: "Days available",
        value: resolved.daysAvailablePerWeek ? `${resolved.daysAvailablePerWeek} / wk` : "",
      },
      {
        label: "Weekly load",
        value: resolved.plannedWeeklyHours
          ? `${formatDecimalHuman(resolved.plannedWeeklyHours, " hrs / wk")}`
          : resolved.currentWeeklyHours
            ? `${formatDecimalHuman(resolved.currentWeeklyHours, " hrs / wk")}`
            : "",
      },
      {
        label: "Longest session",
        value: resolved.currentLongestSessionHours ? `${formatDecimalHuman(resolved.currentLongestSessionHours, " hrs")}` : "",
      },
      {
        label: "Hard sessions",
        value: resolved.plannedHardSessionsPerWeek ? `${resolved.plannedHardSessionsPerWeek} / wk` : "",
      },
      {
        label: "Strength support",
        value: resolved.plannedStrengthSessionsPerWeek ? `${resolved.plannedStrengthSessionsPerWeek} / wk` : "",
      },
      {
        label: "Limiter",
        value: resolved.currentLimiter || "",
      },
      {
        label: "Health focus",
        value: resolved.healthFocus || "",
      },
    ].filter((item) => item.value);
  }

  function statusPillClass(status) {
    const normalized = String(status || "").toLowerCase();
    if (["completed", "approved", "on_plan", "reviewed", "processed", "high", "healthy"].includes(normalized)) {
      return "crm-status-pill--green";
    }
    if (["pending", "partial", "submitted", "due", "scheduled", "available", "medium", "degraded"].includes(normalized)) {
      return "crm-status-pill--orange";
    }
    if (["late", "missed", "off_plan", "rejected", "needs_revision", "needs_follow_up", "failed", "low", "blocked", "error"].includes(normalized)) {
      return "crm-status-pill--red";
    }
    if (["paused", "rest_day", "rest", "ready"].includes(normalized)) {
      return "crm-status-pill--blue";
    }
    return "crm-status-pill--gray";
  }

  function buildStatusPill(status, label) {
    return `<span class="crm-status-pill ${statusPillClass(status)}">${escapeHtml(label || toTitleCase(status || "Unknown"))}</span>`;
  }

  function formatRelativeTime(value) {
    if (!value) {
      return "";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "";
    }

    const diffMs = date.getTime() - Date.now();
    const diffMinutes = Math.round(diffMs / 60000);
    const formatter = new Intl.RelativeTimeFormat("en-MY", { numeric: "auto" });

    if (Math.abs(diffMinutes) < 60) {
      return formatter.format(diffMinutes, "minute");
    }

    const diffHours = Math.round(diffMinutes / 60);
    if (Math.abs(diffHours) < 24) {
      return formatter.format(diffHours, "hour");
    }

    const diffDays = Math.round(diffHours / 24);
    return formatter.format(diffDays, "day");
  }

  function normalizeProviderFoodForBuilder(food) {
    if (!food || typeof food !== "object") {
      return null;
    }

    const servings = Array.isArray(food.servings)
      ? food.servings.map((serving, index) => ({
          id: serving.id || `external-serving:${food.provider || food.dataSource || "external"}:${food.providerKey || food.sourceKey || food.name || "food"}:${index + 1}`,
          label: serving.label || "Serving",
          grams: Number(serving.grams || 0) || 100,
          unitCount: Number(serving.unitCount || serving.unit_count || 1) || 1,
          isDefault: Boolean(serving.isDefault || serving.is_default || index === 0),
        }))
      : [];

    return {
      id: food.id || `external:${food.provider || food.dataSource || "external"}:${food.providerKey || food.sourceKey || food.name || "food"}`,
      name: food.name || "Food",
      brandName: food.brandName || "",
      foodGroup: food.foodGroup || "external",
      countryCode: food.countryCode || "MY",
      dataSource: food.dataSource || food.provider || "external",
      visibilityScope: food.visibilityScope || "client",
      servingBasisG: Number(food.servingBasisG || 100) || 100,
      caloriesKcal: Number(food.caloriesKcal || 0) || 0,
      proteinG: Number(food.proteinG || 0) || 0,
      carbsG: Number(food.carbsG || 0) || 0,
      fatG: Number(food.fatG || 0) || 0,
      fiberG: Number(food.fiberG || 0) || 0,
      sugarG: Number(food.sugarG || 0) || 0,
      sodiumMg: Number(food.sodiumMg || 0) || 0,
      servings,
      sourceMappings: Array.isArray(food.sourceMappings) ? food.sourceMappings : [],
      isFavorite: Boolean(food.isFavorite),
      isRecent: Boolean(food.isRecent),
      externalFood: {
        provider: food.provider || food.dataSource || "external",
        providerKey: food.providerKey || food.sourceKey || "",
        name: food.name || "Food",
        brandName: food.brandName || "",
        foodGroup: food.foodGroup || "external",
        countryCode: food.countryCode || "MY",
        dataSource: food.dataSource || food.provider || "external",
        servingBasisG: Number(food.servingBasisG || 100) || 100,
        caloriesKcal: Number(food.caloriesKcal || 0) || 0,
        proteinG: Number(food.proteinG || 0) || 0,
        carbsG: Number(food.carbsG || 0) || 0,
        fatG: Number(food.fatG || 0) || 0,
        fiberG: Number(food.fiberG || 0) || 0,
        sugarG: Number(food.sugarG || 0) || 0,
        sodiumMg: Number(food.sodiumMg || 0) || 0,
        servings,
        metadata: food.metadata || {},
      },
    };
  }

  function resolvePhotoCandidateLabel(candidate, derived) {
    const rawLabel = String(candidate?.label || candidate?.item_name || "").trim();
    const matchedFoodName = candidate?.food_id
      ? (derived?.catalogFoodById?.get(candidate.food_id)?.name || candidate?.metadata?.matchedFoodName || "")
      : "";

    if (matchedFoodName) {
      return matchedFoodName;
    }

    const normalized = rawLabel.toLowerCase();
    if (
      !rawLabel
      || normalized === "[object object]"
      || normalized === "food"
      || normalized === "meat"
      || /^\d+$/u.test(rawLabel)
      || /^v\d+(?:\.\d+)*$/iu.test(rawLabel)
    ) {
      return "Manual food match needed";
    }

    return rawLabel;
  }

  function formatMetricValue(value, suffix = "") {
    if (value === null || value === undefined || value === "") {
      return "Not logged";
    }
    return `${Number(value).toLocaleString("en-MY")}${suffix}`;
  }

  function formatPercentValue(value) {
    if (value === null || value === undefined || value === "") {
      return "";
    }
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) {
      return "";
    }
    return `${numeric.toLocaleString("en-MY", {
      minimumFractionDigits: numeric % 1 ? 1 : 0,
      maximumFractionDigits: 1,
    })}%`;
  }

  function formatAiEstimateLabel(entry) {
    if (!entry) {
      return "";
    }

    const estimate = formatPercentValue(entry.ai_body_fat_estimate ?? entry.estimatePercent);
    const low = formatPercentValue(entry.ai_body_fat_range_low ?? entry.rangeLow);
    const high = formatPercentValue(entry.ai_body_fat_range_high ?? entry.rangeHigh);
    if (estimate && low && high) {
      return `AI estimate ${estimate} (${low}-${high})`;
    }
    if (low && high) {
      return `AI estimate ${low}-${high}`;
    }
    if (estimate) {
      return `AI estimate ${estimate}`;
    }
    return "";
  }

  function formatAiEstimateSummary(entry) {
    if (!entry) {
      return "AI estimate will appear here after your upload is processed.";
    }

    if (String(entry.ai_body_fat_status || "").toLowerCase() === "completed") {
      const label = formatAiEstimateLabel(entry);
      return label
        ? `${label}. Rough trend only, not a medical reading.`
        : "AI estimate ready. Rough trend only, not a medical reading.";
    }

    if (String(entry.ai_body_fat_status || "").toLowerCase() === "failed") {
      return "AI estimate could not be generated from this batch. Your coach can still review the photos manually.";
    }

    if (String(entry.ai_body_fat_status || "").toLowerCase() === "unavailable") {
      return "AI estimate is unavailable right now. Your coach can still review the photos manually.";
    }

    return "AI estimate is processing for this photo batch.";
  }

  function formatDateTimeLabel(date) {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
      return "Not set";
    }
    return new Intl.DateTimeFormat("en-MY", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  }

  function queueRefresh() {
    window.clearTimeout(state.refreshTimer);
    state.refreshTimer = window.setTimeout(() => {
      fetchPlannerData(true).catch(() => null);
    }, 350);
  }

  function compareByDateAscending(left, right, key) {
    const leftTime = left?.[key] ? new Date(left[key]).getTime() : Number.POSITIVE_INFINITY;
    const rightTime = right?.[key] ? new Date(right[key]).getTime() : Number.POSITIVE_INFINITY;
    if (leftTime !== rightTime) {
      return leftTime - rightTime;
    }
    return Number(left?.day_number || 0) - Number(right?.day_number || 0);
  }

  async function loadAccessAndClient() {
    if (state.access && state.supabase) {
      return {
        access: state.access,
        supabase: state.supabase,
      };
    }

    if (!window.legacyAuth || !window.legacyAuth.getSupabaseClient) {
      throw new Error("Auth client is not available on this page.");
    }

    const access = await window.legacyAuth.requireRole("client");
    if (!access.ok) {
      throw new Error("No client session is active.");
    }

    const supabase = window.legacyAuth.getSupabaseClient();
    if (!supabase) {
      throw new Error("Supabase client is not configured.");
    }

    state.access = access;
    state.supabase = supabase;
    return { access, supabase };
  }

  async function getAccessToken() {
    const accessToken = await window.legacyAuth?.getAccessToken?.();
    if (!accessToken) {
      throw new Error("Your session expired. Please log in again.");
    }
    return accessToken;
  }

  async function plannerRequest(path, options = {}) {
    const accessToken = await getAccessToken();
    const response = await window.fetch(path, {
      method: options.method || "GET",
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        Authorization: `Bearer ${accessToken}`,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload?.error || "Unable to complete the planner request right now.");
    }
    return payload;
  }

  async function uploadPlannerAssets(uploadFiles, feedbackNode, messages = {}) {
    const supabase = window.legacyAuth?.getSupabaseClient?.();
    if (!supabase?.storage) {
      throw new Error("Supabase storage client is not available on this page.");
    }

    const files = Array.isArray(uploadFiles) ? uploadFiles.filter((entry) => entry?.file) : [];
    if (!files.length) {
      return [];
    }

    setInlineFeedback(feedbackNode, messages.prepare || "Preparing secure upload...", false);

    const prepared = await plannerRequest("/.netlify/functions/prepare-progress-photo-upload", {
      method: "POST",
      body: {
        assets: files.map((entry) => ({
          viewTag: entry.viewTag || "detail",
          fileName: entry.file.name,
          contentType: entry.file.type,
          fileSize: entry.file.size,
        })),
      },
    });

    const preparedAssets = Array.isArray(prepared?.assets) ? prepared.assets : [];
    if (preparedAssets.length !== files.length) {
      throw new Error("The upload session did not return the expected number of signed upload slots.");
    }

    setInlineFeedback(feedbackNode, messages.upload || "Uploading files securely...", false);

    const bucket = prepared.bucket || "client-progress-photos";
    const uploadedPaths = [];

    try {
      for (let index = 0; index < files.length; index += 1) {
        const entry = files[index];
        const preparedAsset = preparedAssets[index];
        const storagePath = preparedAsset.path || preparedAsset.storagePath;
        const { error } = await supabase.storage
          .from(bucket)
          .uploadToSignedUrl(storagePath, preparedAsset.token, entry.file, {
            contentType: entry.file.type,
            upsert: false,
          });
        if (error) {
          throw error;
        }
        uploadedPaths.push(storagePath);
      }
    } catch (error) {
      await cleanupClientUploadAssets(uploadedPaths, bucket);
      throw error;
    }

    return preparedAssets.map((asset, index) => ({
      viewTag: asset.viewTag || files[index].viewTag || "detail",
      storagePath: asset.storagePath || asset.path,
      fileName: asset.fileName || files[index].file.name,
      contentType: asset.contentType || files[index].file.type,
      sortOrder: index,
    }));
  }

  function resolveSelectedTemplateId(templates) {
    if (templates.some((template) => template.id === state.selectedCheckinTemplateId)) {
      return state.selectedCheckinTemplateId;
    }
    return templates[0]?.id || "";
  }

  async function fetchPlannerData(isSilent) {
    const initialLoad = !state.hasLoadedOnce;
    state.loading = true;
    setPlannerSyncState(true);

    if (!isSilent) {
      setStatus("Loading your live planner workspace...", false);
    }

    if (initialLoad) {
      renderInitialPlannerSkeleton();
    }

    try {
      const payload = await plannerRequest("/.netlify/functions/load-planner-data?refresh=1");
      state.data = {
        ...EMPTY_DATA,
        ...(payload?.data || {}),
      };
      state.loading = false;
      state.hasLoadedOnce = true;
      state.selectedCheckinTemplateId = resolveSelectedTemplateId(state.data.checkinTemplates || []);
      renderAll();
      setPlannerSyncState(false);
      const derived = deriveWorkspace();
      setStatus(
        `Planner live: ${formatCount(derived.metrics.plannedDays)} planned day${derived.metrics.plannedDays === 1 ? "" : "s"} and ${formatCount(
          derived.metrics.pendingReviews
        )} item${derived.metrics.pendingReviews === 1 ? "" : "s"} waiting on review.`,
        false
      );
    } catch (error) {
      state.loading = false;
      const message = String(error?.message || "");
      setPlannerSyncState(false);
      if (/does not exist/iu.test(message) || /relation/iu.test(message)) {
        setStatus(
          "Planner UI is ready, but the planner tables are not available on the running database yet.",
          true
        );
      } else {
        setStatus(message || "Unable to load the planner workspace right now.", true);
      }
      renderAll();
      throw error;
    }
  }

  function deriveWorkspace() {
    const assignments = (state.data.assignments || []).slice().sort((left, right) => {
      const leftActive = ["active", "paused"].includes(String(left?.status || "").toLowerCase()) ? 0 : 1;
      const rightActive = ["active", "paused"].includes(String(right?.status || "").toLowerCase()) ? 0 : 1;
      if (leftActive !== rightActive) {
        return leftActive - rightActive;
      }
      return new Date(right?.start_date || 0).getTime() - new Date(left?.start_date || 0).getTime();
    });
    const activeAssignment = assignments[0] || null;
    const activeSportProfile = getAssignmentSportProfile(activeAssignment);
    const activeWorkbook = getAssignmentWorkbook(activeAssignment);

    const programDays = (state.data.programDays || []).slice().sort((left, right) => compareByDateAscending(left, right, "scheduled_date"));
    const exercisesByDay = new Map();
    (state.data.programExercises || [])
      .slice()
      .sort((left, right) => Number(left?.sort_order || 0) - Number(right?.sort_order || 0))
      .forEach((exercise) => {
        const key = exercise.client_program_day_id;
        const list = exercisesByDay.get(key) || [];
        list.push(exercise);
        exercisesByDay.set(key, list);
      });

    const workoutLogs = (state.data.workoutLogs || []).slice().sort((left, right) => {
      return new Date(right?.completed_at || right?.updated_at || 0).getTime() - new Date(left?.completed_at || left?.updated_at || 0).getTime();
    });
    const workoutLogByDay = new Map(workoutLogs.map((log) => [log.client_program_day_id, log]));
    const workoutExerciseLogs = (state.data.workoutExerciseLogs || []).slice().sort((left, right) => {
      return Number(left?.sort_order || 0) - Number(right?.sort_order || 0);
    });
    const workoutExerciseLogsByWorkoutLog = new Map();
    workoutExerciseLogs.forEach((entry) => {
      const key = entry.workout_log_id;
      const list = workoutExerciseLogsByWorkoutLog.get(key) || [];
      list.push(entry);
      workoutExerciseLogsByWorkoutLog.set(key, list);
    });
    const latestExerciseLogByExerciseId = new Map();
    workoutLogs.forEach((log) => {
      const exerciseEntries = workoutExerciseLogsByWorkoutLog.get(log.id) || [];
      exerciseEntries.forEach((entry) => {
        const exerciseId = String(entry.client_program_day_exercise_id || "").trim();
        if (exerciseId && !latestExerciseLogByExerciseId.has(exerciseId)) {
          latestExerciseLogByExerciseId.set(exerciseId, entry);
        }
      });
    });

    const nutritionPlans = (state.data.nutritionPlans || []).slice().sort((left, right) => {
      const leftActive = ["active", "paused"].includes(String(left?.status || "").toLowerCase()) ? 0 : 1;
      const rightActive = ["active", "paused"].includes(String(right?.status || "").toLowerCase()) ? 0 : 1;
      if (leftActive !== rightActive) {
        return leftActive - rightActive;
      }
      return new Date(right?.start_date || 0).getTime() - new Date(left?.start_date || 0).getTime();
    });
    const activeNutritionPlan = nutritionPlans[0] || null;
    const habitsByPlan = new Map();
    (state.data.nutritionHabits || []).forEach((habit) => {
      const key = habit.nutrition_plan_id;
      const list = habitsByPlan.get(key) || [];
      list.push(habit);
      habitsByPlan.set(key, list);
    });

    const nutritionLogs = (state.data.nutritionLogs || []).slice().sort((left, right) => {
      return new Date(right?.log_date || 0).getTime() - new Date(left?.log_date || 0).getTime();
    });

    const mealEntries = (state.data.mealEntries || []).slice().sort((left, right) => {
      const rightTime = new Date(right?.log_date || right?.created_at || 0).getTime();
      const leftTime = new Date(left?.log_date || left?.created_at || 0).getTime();
      if (rightTime !== leftTime) {
        return rightTime - leftTime;
      }
      return new Date(right?.created_at || 0).getTime() - new Date(left?.created_at || 0).getTime();
    });
    const mealItemsByEntry = new Map();
    (state.data.mealItems || [])
      .slice()
      .sort((left, right) => Number(left?.sort_order || 0) - Number(right?.sort_order || 0))
      .forEach((item) => {
        const key = item.meal_entry_id;
        const list = mealItemsByEntry.get(key) || [];
        list.push(item);
        mealItemsByEntry.set(key, list);
      });

    const nutritionPhotoSubmissions = (state.data.nutritionPhotoSubmissions || []).slice().sort((left, right) => {
      const rightTime = new Date(right?.log_date || right?.created_at || 0).getTime();
      const leftTime = new Date(left?.log_date || left?.created_at || 0).getTime();
      if (rightTime !== leftTime) {
        return rightTime - leftTime;
      }
      return new Date(right?.created_at || 0).getTime() - new Date(left?.created_at || 0).getTime();
    });
    const nutritionPhotoAssetsBySubmission = new Map();
    (state.data.nutritionPhotoAssets || [])
      .slice()
      .sort((left, right) => Number(left?.sort_order || 0) - Number(right?.sort_order || 0))
      .forEach((asset) => {
        const list = nutritionPhotoAssetsBySubmission.get(asset.submission_id) || [];
        list.push(asset);
        nutritionPhotoAssetsBySubmission.set(asset.submission_id, list);
      });
    const nutritionPhotoCandidatesBySubmission = new Map();
    (state.data.nutritionPhotoCandidates || [])
      .slice()
      .sort((left, right) => Number(left?.sort_order || 0) - Number(right?.sort_order || 0))
      .forEach((candidate) => {
        const list = nutritionPhotoCandidatesBySubmission.get(candidate.submission_id) || [];
        list.push(candidate);
        nutritionPhotoCandidatesBySubmission.set(candidate.submission_id, list);
      });

    const catalogFoods = (state.data.catalogFoods || []).slice();
    const catalogFoodById = new Map(catalogFoods.map((food) => [food.id, food]));
    const favoriteFoods = (state.data.favoriteFoods || []).slice();
    const recentFoods = (state.data.recentFoods || []).slice();
    const recipes = (state.data.recipes || []).slice().sort((left, right) => {
      return String(left.title || "").localeCompare(String(right.title || ""));
    });
    const recipeIngredientsByRecipe = new Map();
    (state.data.recipeIngredients || [])
      .slice()
      .sort((left, right) => Number(left?.sort_order || 0) - Number(right?.sort_order || 0))
      .forEach((ingredient) => {
        const list = recipeIngredientsByRecipe.get(ingredient.recipe_id) || [];
        list.push(ingredient);
        recipeIngredientsByRecipe.set(ingredient.recipe_id, list);
      });

    const checkinTemplates = (state.data.checkinTemplates || []).slice().sort((left, right) => {
      return new Date(right?.updated_at || 0).getTime() - new Date(left?.updated_at || 0).getTime();
    });
    const selectedCheckinTemplate = checkinTemplates.find((template) => template.id === state.selectedCheckinTemplateId) || checkinTemplates[0] || null;
    const questionsByTemplate = new Map();
    (state.data.checkinQuestions || [])
      .slice()
      .sort((left, right) => Number(left?.sort_order || 0) - Number(right?.sort_order || 0))
      .forEach((question) => {
        const key = question.template_id;
        const list = questionsByTemplate.get(key) || [];
        list.push(question);
        questionsByTemplate.set(key, list);
      });

    const checkins = (state.data.checkins || []).slice().sort((left, right) => {
      return new Date(right?.submitted_at || right?.due_at || 0).getTime() - new Date(left?.submitted_at || left?.due_at || 0).getTime();
    });
    const openCheckins = checkins.filter((checkin) => {
      const status = String(checkin?.status || "").toLowerCase();
      return !checkin?.submitted_at && ["due", "late", "missed"].includes(status);
    });
    const openCheckinByTemplateId = new Map();
    openCheckins.forEach((checkin) => {
      if (!openCheckinByTemplateId.has(checkin.template_id)) {
        openCheckinByTemplateId.set(checkin.template_id, checkin);
      }
    });

    const progressPhotos = (state.data.progressPhotos || []).slice().sort((left, right) => {
      return new Date(right?.captured_at || 0).getTime() - new Date(left?.captured_at || 0).getTime();
    });
    const progressAssetsByEntry = new Map();
    (state.data.progressPhotoAssets || []).forEach((asset) => {
      const key = asset.entry_id;
      const list = progressAssetsByEntry.get(key) || [];
      list.push(asset);
      progressAssetsByEntry.set(key, list);
    });
    progressAssetsByEntry.forEach((value) => {
      value.sort((left, right) => Number(left?.sort_order || 0) - Number(right?.sort_order || 0));
    });

    const today = getTodayDateOnly();
    const activeDays = programDays
      .filter((day) => !["completed", "archived"].includes(String(day?.status || "").toLowerCase()))
      .sort((left, right) => {
        const leftDate = String(left?.scheduled_date || "");
        const rightDate = String(right?.scheduled_date || "");
        if (leftDate && rightDate && leftDate !== rightDate) {
          return leftDate.localeCompare(rightDate);
        }
        return Number(left?.day_number || 0) - Number(right?.day_number || 0);
      });
    const nextDay =
      activeDays.find((day) => String(day?.scheduled_date || "") === today)
      || activeDays.find((day) => {
        const scheduledDate = String(day?.scheduled_date || "");
        return scheduledDate ? scheduledDate >= today : false;
      })
      || activeDays.find((day) => !day?.scheduled_date)
      || activeDays[0]
      || null;
    const selectedTrainingDay =
      programDays.find((day) => day.id === state.selectedTrainingDayId)
      || nextDay
      || programDays[0]
      || null;

    const sevenDaysAgo = Date.now() - (7 * 86400000);
    const completedThisWeek = workoutLogs.filter((log) => {
      if (String(log?.log_status || "").toLowerCase() !== "completed") {
        return false;
      }
      const completedAt = new Date(log?.completed_at || log?.updated_at || 0).getTime();
      return Number.isFinite(completedAt) && completedAt >= sevenDaysAgo;
    }).length;

    const pendingReviews =
      workoutLogs.filter((log) => String(log?.review_status || "").toLowerCase() === "pending").length
      + nutritionLogs.filter((log) => String(log?.review_status || "").toLowerCase() === "pending").length
      + nutritionPhotoSubmissions.filter((entry) => String(entry?.review_status || "").toLowerCase() === "pending").length
      + checkins.filter((checkin) => String(checkin?.review_status || "").toLowerCase() === "pending").length
      + progressPhotos.filter((entry) => String(entry?.review_status || "").toLowerCase() === "pending").length;

    const selectedNutritionDay = resolveSelectedNutritionDay({
      nutritionPlans,
      activeNutritionPlan,
    });

    return {
      assignments,
      activeAssignment,
      activeSportProfile,
      activeWorkbook,
      programDays,
      exercisesByDay,
      workoutLogs,
      workoutLogByDay,
      workoutExerciseLogs,
      workoutExerciseLogsByWorkoutLog,
      latestExerciseLogByExerciseId,
      nutritionPlans,
      activeNutritionPlan,
      selectedNutritionDay,
      habitsByPlan,
      nutritionLogs,
      mealEntries,
      mealItemsByEntry,
      nutritionPhotoSubmissions,
      nutritionPhotoAssetsBySubmission,
      nutritionPhotoCandidatesBySubmission,
      catalogFoods,
      catalogFoodById,
      favoriteFoods,
      recentFoods,
      recipes,
      recipeIngredientsByRecipe,
      checkinTemplates,
      selectedCheckinTemplate,
      questionsByTemplate,
      checkins,
      openCheckinByTemplateId,
      progressPhotos,
      progressAssetsByEntry,
      nextDay,
      selectedTrainingDay,
      metrics: {
        plannedDays: programDays.length,
        completedThisWeek,
        pendingReviews,
      },
    };
  }

  function setActivePanel(panelKey) {
    if (panelKey !== "nutrition" && state.barcodeScanner.active) {
      stopBarcodeScanner();
    }

    state.activePanel = panelKey;
    tabNodes.forEach((tabNode) => {
      const isActive = tabNode.dataset.clientPlannerTab === panelKey;
      tabNode.classList.toggle("is-active", isActive);
      tabNode.setAttribute("aria-selected", String(isActive));
    });

    panelNodes.forEach((panelNode) => {
      const isActive = panelNode.dataset.clientPlannerPanel === panelKey;
      panelNode.classList.toggle("is-active", isActive);
      panelNode.hidden = !isActive;
    });

    setPlannerSyncState(state.loading);
    if (state.loading && !state.hasLoadedOnce) {
      renderInitialPlannerSkeleton();
    }
  }

  function setActiveNutritionWorkspace(workspaceKey) {
    const allowed = new Set(["adherence", "meals", "photo"]);
    const nextWorkspace = allowed.has(workspaceKey) ? workspaceKey : "adherence";
    if (nextWorkspace !== "meals" && state.barcodeScanner.active) {
      stopBarcodeScanner();
    }

    state.activeNutritionWorkspace = nextWorkspace;
    nutritionWorkspaceTabNodes.forEach((tabNode) => {
      const isActive = tabNode.dataset.clientNutritionWorkspace === nextWorkspace;
      tabNode.classList.toggle("is-active", isActive);
      tabNode.setAttribute("aria-selected", String(isActive));
    });
    nutritionWorkspacePanelNodes.forEach((panelNode) => {
      const isActive = panelNode.dataset.clientNutritionWorkspacePanel === nextWorkspace;
      panelNode.classList.toggle("is-active", isActive);
      panelNode.hidden = !isActive;
    });

    if (nextWorkspace !== "meals") {
      setMealEntryDisclosure(false);
      return;
    }

    if (state.mealEntryDisclosureOpen) {
      setMealEntryDisclosure(true);
      if (state.activeMealEntryMode) {
        setActiveMealEntryMode(state.activeMealEntryMode);
      }
    }
  }

  function setMealEntryDisclosure(isOpen) {
    if (!mealEntryActionsNode || !mealEntryToggleButton) {
      return;
    }

    const nextValue = Boolean(isOpen);
    state.mealEntryDisclosureOpen = nextValue;
    mealEntryActionsNode.hidden = !nextValue;
    mealEntryToggleButton.setAttribute("aria-expanded", String(nextValue));
    mealEntryToggleButton.classList.toggle("is-active", nextValue);

    if (!nextValue) {
      state.activeMealEntryMode = "";
      mealEntryModeButtonNodes.forEach((buttonNode) => {
        buttonNode.classList.remove("is-active");
        buttonNode.setAttribute("aria-pressed", "false");
      });
      mealEntryModePanelNodes.forEach((panelNode) => {
        panelNode.classList.remove("is-active");
        panelNode.hidden = true;
      });
      if (state.barcodeScanner.active) {
        stopBarcodeScanner();
      }
    }
  }

  function setActiveMealEntryMode(mode) {
    const nextMode = String(mode || "").trim().toLowerCase();

    if (nextMode === "photo") {
      setActiveNutritionWorkspace("photo");
      return;
    }

    const allowed = new Set(["search", "barcode"]);
    const resolvedMode = allowed.has(nextMode) ? nextMode : "search";

    setMealEntryDisclosure(true);
    state.activeMealEntryMode = resolvedMode;

    mealEntryModeButtonNodes.forEach((buttonNode) => {
      const isActive = buttonNode.dataset.mealEntryMode === resolvedMode;
      buttonNode.classList.toggle("is-active", isActive);
      buttonNode.setAttribute("aria-pressed", String(isActive));
    });

    mealEntryModePanelNodes.forEach((panelNode) => {
      const isActive = panelNode.dataset.mealEntryPanel === resolvedMode;
      panelNode.classList.toggle("is-active", isActive);
      panelNode.hidden = !isActive;
    });

    if (resolvedMode !== "barcode" && state.barcodeScanner.active) {
      stopBarcodeScanner();
    }

    if (resolvedMode === "search") {
      foodSearchNode?.focus();
      return;
    }

    barcodeNode?.focus();
  }

  function getRequestedInitialPanel() {
    const params = new URLSearchParams(window.location.search || "");
    const requested = String(params.get("tab") || "").trim().toLowerCase();
    const allowed = new Set(["training", "nutrition", "health", "progress"]);
    return allowed.has(requested) ? requested : state.activePanel;
  }

  function renderMetrics(derived) {
    metricProgramNode.textContent = derived.activeAssignment?.title || "None";
    metricProgramNoteNode.textContent = derived.activeAssignment?.objective || "Your next assigned block will appear here.";
    metricDaysNode.textContent = formatCount(derived.metrics.plannedDays);
    metricDaysNoteNode.textContent = derived.activeAssignment
      ? `${formatCount(derived.programDays.filter((day) => day.assignment_id === derived.activeAssignment.id).length)} days loaded from your live assignment.`
      : "Scheduled training and recovery days in the live plan.";
    metricCompletedNode.textContent = formatCount(derived.metrics.completedThisWeek);
    metricCompletedNoteNode.textContent = derived.metrics.completedThisWeek
      ? `${formatCount(derived.metrics.completedThisWeek)} completed training log${derived.metrics.completedThisWeek === 1 ? "" : "s"} in the last 7 days.`
      : "Coach-reviewable completions from the last 7 days.";
    metricReviewNode.textContent = formatCount(derived.metrics.pendingReviews);
    metricReviewNoteNode.textContent = derived.metrics.pendingReviews
      ? "These training, nutrition, health, or progress items are still waiting on review."
      : "Nothing is currently waiting on coach review.";
  }

  function getSelectedNutritionPlanId(derived) {
    const availablePlans = Array.isArray(derived?.nutritionPlans) ? derived.nutritionPlans : [];
    const selectedValue = String(nutritionPlanNode?.value || "").trim();
    if (selectedValue && availablePlans.some((plan) => plan.id === selectedValue)) {
      return selectedValue;
    }
    return derived?.activeNutritionPlan?.id || availablePlans[0]?.id || "";
  }

  function resolveSelectedNutritionPlan(derived) {
    const planId = getSelectedNutritionPlanId(derived);
    return derived?.nutritionPlans?.find((plan) => plan.id === planId) || derived?.activeNutritionPlan || null;
  }

  function normalizeNutritionDayKey(dayKey) {
    return String(dayKey || "").trim().toLowerCase();
  }

  function getNutritionDayOrderIndex(dayKey) {
    const order = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
    const normalized = normalizeNutritionDayKey(dayKey);
    const index = order.indexOf(normalized);
    return index < 0 ? 0 : index;
  }

  function resolveSelectedNutritionDay(derived) {
    const plan = resolveSelectedNutritionPlan(derived);
    const days = Array.isArray(plan?.meal_plan?.days)
      ? plan.meal_plan.days.filter((day) => day && (((Array.isArray(day.slots) ? day.slots.length : 0) > 0) || compactText(day.note)))
      : [];
    const normalizedSelectedDayKey = normalizeNutritionDayKey(state.selectedNutritionDayKey);
    return days.find((day) => normalizeNutritionDayKey(day.dayKey) === normalizedSelectedDayKey) || days[0] || null;
  }

  function resolveNutritionTargetsForDay(plan, day) {
    if (!plan || !day) {
      return {};
    }

    const explicitTargets =
      day.targets && typeof day.targets === "object" && !Array.isArray(day.targets)
        ? day.targets
        : null;
    if (explicitTargets && Object.keys(explicitTargets).length) {
      return explicitTargets;
    }

    const dayType = String(day.dayType || day.day_type || "").trim().toLowerCase();
    if (dayType === "training") {
      return plan.training_day_targets || {};
    }
    if (dayType === "special") {
      return plan.special_day_targets || plan.training_day_targets || {};
    }
    return plan.rest_day_targets || {};
  }

  function formatNutritionTargetLine(targets) {
    if (!targets || typeof targets !== "object") {
      return "Targets not set yet";
    }

    const pieces = [
      Number.isFinite(Number(targets.calories)) ? `${Math.round(Number(targets.calories))} kcal` : "",
      Number.isFinite(Number(targets.protein)) ? `${Math.round(Number(targets.protein))}P` : "",
      Number.isFinite(Number(targets.carbs)) ? `${Math.round(Number(targets.carbs))}C` : "",
      Number.isFinite(Number(targets.fat)) ? `${Math.round(Number(targets.fat))}F` : "",
    ].filter(Boolean);

    return pieces.join(" • ") || "Targets not set yet";
  }

  function resolveNutritionDayDate(day) {
    const index = getNutritionDayOrderIndex(day?.dayKey);
    const today = new Date();
    const currentDayIndex = (today.getDay() + 6) % 7;
    const monday = new Date(today);
    monday.setHours(0, 0, 0, 0);
    monday.setDate(today.getDate() - currentDayIndex);
    const target = new Date(monday);
    target.setDate(monday.getDate() + index);
    const year = target.getFullYear();
    const month = String(target.getMonth() + 1).padStart(2, "0");
    const date = String(target.getDate()).padStart(2, "0");
    return `${year}-${month}-${date}`;
  }

  function syncNutritionDates(day, force = false) {
    if (!day) {
      return;
    }

    const resolvedDate = resolveNutritionDayDate(day);
    [nutritionDateNode, mealDateNode, photoDateNode].forEach((node) => {
      if (!node) {
        return;
      }
      if (force || !String(node.value || "").trim()) {
        node.value = resolvedDate;
      }
    });
  }

  function renderAssignmentSummary(derived) {
    if (!assignmentSummaryNode) {
      return;
    }

    const assignment = derived.activeAssignment;
    if (!assignment) {
      assignmentSummaryNode.innerHTML = `
        <article class="dashboard-note dashboard-note--placeholder">
          <strong>No active program yet</strong>
          <p>Your coach can assign a live block from the training workspace. Once that happens, this panel will show your cycle, goal context, and plan structure.</p>
        </article>
      `;
      return;
    }

    const planDays = derived.programDays.filter((day) => day.assignment_id === assignment.id);
    const workbookPairs = buildWorkbookPairs(derived.activeWorkbook);
    const sportProfilePairs = workbookPairs.length
      ? workbookPairs
      : buildSportProfilePairs(derived.activeSportProfile).slice(0, 6);
    assignmentSummaryNode.innerHTML = `
      <div class="client-planner-summary-card">
        <div class="client-planner-card-head">
          <div>
            <h3>${escapeHtml(assignment.title || "Assigned Block")}</h3>
            <p>${escapeHtml(assignment.objective || "Coach objective will appear here once assigned.")}</p>
          </div>
          ${buildStatusPill(assignment.status, assignment.status)}
        </div>
        <dl class="client-planner-kv-grid">
          <div>
            <dt>Start</dt>
            <dd>${escapeHtml(formatDate(assignment.start_date))}</dd>
          </div>
          <div>
            <dt>End</dt>
            <dd>${escapeHtml(formatDate(assignment.end_date))}</dd>
          </div>
          <div>
            <dt>Current week</dt>
            <dd>Week ${escapeHtml(String(assignment.current_week || 1))}</dd>
          </div>
          <div>
            <dt>Planned days</dt>
            <dd>${escapeHtml(String(planDays.length))}</dd>
          </div>
          ${
            sportProfilePairs
              .map(
                (item) => `
                  <div>
                    <dt>${escapeHtml(item.label)}</dt>
                    <dd>${escapeHtml(item.value)}</dd>
                  </div>
                `
              )
              .join("")
          }
        </dl>
        ${buildWorkbookSummaryMarkup(derived.activeWorkbook)}
        ${assignment.notes ? `<p class="client-planner-summary-note">${escapeHtml(assignment.notes)}</p>` : ""}
      </div>
    `;
  }

  function renderDayFocus(derived) {
    if (!dayFocusNode) {
      return;
    }

    const day = derived.selectedTrainingDay;
    if (!day) {
      dayFocusNode.innerHTML = `
        <article class="dashboard-note dashboard-note--placeholder">
          <strong>No training day loaded yet</strong>
          <p>When your coach assigns a block, the selected live day will show here with the session focus, timing, and training cues.</p>
        </article>
      `;
      return;
    }

    const todayValue = getTodayDateOnly();
    const timing = getPlannerDayTiming(day, todayValue);
    const exercises = derived.exercisesByDay.get(day.id) || [];
    const log = derived.workoutLogByDay.get(day.id) || null;
    const primaryExercise = exercises[0] || null;
    const primaryMeta = asObject(primaryExercise?.metadata);
    const sessionPairs = [
      {
        label: "Session cue",
        value: primaryMeta.intensity_cue || "",
      },
      {
        label: "Pace / speed",
        value: primaryMeta.target_pace || "",
      },
      {
        label: "Fuel cue",
        value: primaryMeta.fuel_cue || "",
      },
      {
        label: "Duration",
        value: formatDurationHuman(primaryExercise?.duration_seconds),
      },
      {
        label: "Distance",
        value: formatDistanceHuman(primaryExercise?.distance_meters),
      },
      {
        label: "HR zone",
        value: primaryExercise?.heart_rate_zone ? `Zone ${primaryExercise.heart_rate_zone}` : "",
      },
    ].filter((item) => item.value);
    dayFocusNode.innerHTML = `
      <div class="client-planner-summary-card">
        <div class="client-planner-card-head">
          <div>
            <h3>${escapeHtml(resolvePlannerDayTitle(day, todayValue) || `Day ${day.day_number || ""}`)}</h3>
            <p>${escapeHtml(day.focus || `${toTitleCase(day.day_type)} day`)}</p>
          </div>
          ${buildStatusPill(day.status, day.status)}
        </div>
        <dl class="client-planner-kv-grid">
          <div>
            <dt>Timing</dt>
            <dd>${escapeHtml(timing.longLabel)}</dd>
          </div>
          <div>
            <dt>Date</dt>
            <dd>${escapeHtml(formatDate(day.scheduled_date))}</dd>
          </div>
          <div>
            <dt>Week</dt>
            <dd>Week ${escapeHtml(String(day.week_number || 1))}</dd>
          </div>
          <div>
            <dt>Day type</dt>
            <dd>${escapeHtml(toTitleCase(day.day_type))}</dd>
          </div>
          <div>
            <dt>Exercise count</dt>
            <dd>${escapeHtml(String(exercises.length))}</dd>
          </div>
          ${
            log
              ? `
                <div>
                  <dt>Latest review</dt>
                  <dd>${escapeHtml(toTitleCase(log.review_status || "pending"))}</dd>
                </div>
              `
              : ""
          }
          ${
            sessionPairs
              .map(
                (item) => `
                  <div>
                    <dt>${escapeHtml(item.label)}</dt>
                    <dd>${escapeHtml(item.value)}</dd>
                  </div>
                `
              )
              .join("")
          }
        </dl>
        ${day.notes ? `<p class="client-planner-summary-note">${escapeHtml(day.notes)}</p>` : ""}
      </div>
    `;
  }

  function buildDefaultCompletedSets(exercise, exerciseLog) {
    if (exerciseLog?.completed_sets !== null && exerciseLog?.completed_sets !== undefined) {
      return String(exerciseLog.completed_sets);
    }
    if (exercise?.sets !== null && exercise?.sets !== undefined && exercise?.sets !== "") {
      return String(exercise.sets);
    }
    return "";
  }

  function buildDefaultCompletedReps(exercise, exerciseLog) {
    if (exerciseLog?.completed_reps !== null && exerciseLog?.completed_reps !== undefined) {
      return String(exerciseLog.completed_reps);
    }
    if (exercise?.reps !== null && exercise?.reps !== undefined && exercise?.reps !== "") {
      return String(exercise.reps);
    }
    if (exercise?.rep_range_max !== null && exercise?.rep_range_max !== undefined && exercise?.rep_range_max !== "") {
      return String(exercise.rep_range_max);
    }
    return "";
  }

  function buildDefaultLoggedRpe(exercise, exerciseLog) {
    if (exerciseLog?.logged_rpe !== null && exerciseLog?.logged_rpe !== undefined && exerciseLog?.logged_rpe !== "") {
      return String(exerciseLog.logged_rpe);
    }
    if (exercise?.intensity_mode === "rpe" && exercise?.intensity_value !== null && exercise?.intensity_value !== undefined) {
      return String(exercise.intensity_value);
    }
    return "";
  }

  function buildClientTrainingCalendar(derived) {
    if (!trainingCalendarNode) {
      return;
    }

    if (!derived.programDays.length) {
      trainingCalendarNode.innerHTML = `
        <article class="dashboard-note dashboard-note--placeholder">
          <strong>No training days available yet</strong>
          <p>Your coach-assigned days will appear here in a calendar-style picker once the live block is ready.</p>
        </article>
      `;
      return;
    }

    const todayValue = getTodayDateOnly();
    trainingCalendarNode.innerHTML = derived.programDays
      .map((day) => {
        const timing = getPlannerDayTiming(day, todayValue);
        const isSelected = derived.selectedTrainingDay?.id === day.id;
        const exerciseCount = (derived.exercisesByDay.get(day.id) || []).length;
        const log = derived.workoutLogByDay.get(day.id) || null;
        return `
          <button
            class="client-planner-calendar-card${isSelected ? " is-active" : ""}"
            type="button"
            data-training-day-select="${escapeHtml(day.id)}"
          >
            <span class="client-planner-calendar-card__date">${escapeHtml(formatDate(day.scheduled_date))}</span>
            <strong>${escapeHtml(resolvePlannerDayTitle(day, todayValue) || `Day ${day.day_number || ""}`)}</strong>
            <small>${escapeHtml(day.focus || `${toTitleCase(day.day_type)} day`)}</small>
            <div class="client-planner-card-subhead">
              <span>${escapeHtml(timing.shortLabel)}</span>
              <span>${escapeHtml(`${exerciseCount} row${exerciseCount === 1 ? "" : "s"}`)}</span>
              ${log ? `<span>${escapeHtml(`Review ${toTitleCase(log.review_status || "pending")}`)}</span>` : ""}
            </div>
          </button>
        `;
      })
      .join("");
  }

  function renderTrainingDetail(derived) {
    if (!trainingDetailNode) {
      return;
    }

    const day = derived.selectedTrainingDay;
    if (!day) {
      trainingDetailNode.innerHTML = `
        <article class="dashboard-note dashboard-note--placeholder">
          <strong>Select a day to open the sheet</strong>
          <p>Your program sheet will appear here with coach targets on the left and only your editable columns on the right.</p>
        </article>
      `;
      return;
    }

    const exercises = derived.exercisesByDay.get(day.id) || [];
    const log = derived.workoutLogByDay.get(day.id) || null;
    const feedbackText = log
      ? `Latest log: ${toTitleCase(log.log_status || "pending")} • Review ${toTitleCase(log.review_status || "pending")}`
      : "Save the sheet once you finish the session. Your coach will review it from the training desk.";

    trainingDetailNode.innerHTML = `
      <article class="client-planner-training-sheet">
        <div class="client-planner-card-head">
          <div>
            <span class="kicker kicker--accent">Program Sheet</span>
            <h3>${escapeHtml(day.title || `Day ${day.day_number || ""}`)}</h3>
            <p>${escapeHtml(day.focus || `${toTitleCase(day.day_type)} day`)}</p>
          </div>
          ${buildStatusPill(day.status, day.status)}
        </div>
        ${day.notes ? `<p class="client-planner-summary-note">${escapeHtml(day.notes)}</p>` : ""}
        <form class="client-planner-training-form" data-training-day-form="${escapeHtml(day.id)}">
          <div class="client-planner-training-sheet__toolbar">
            <label>
              Session status
              <select name="logStatus">
                <option value="completed"${String(log?.log_status || "").toLowerCase() === "completed" ? " selected" : ""}>Completed</option>
                <option value="partial"${String(log?.log_status || "").toLowerCase() === "partial" ? " selected" : ""}>Partial</option>
                <option value="missed"${String(log?.log_status || "").toLowerCase() === "missed" ? " selected" : ""}>Missed</option>
              </select>
            </label>
            <label class="client-planner-training-form__wide">
              Session note
              <input type="text" name="clientFeedback" value="${escapeHtml(log?.client_feedback || "")}" placeholder="How did the full session feel?" />
            </label>
          </div>
          <div class="client-planner-training-table-shell">
            <table class="client-planner-training-table">
              <thead>
                <tr>
                  <th>Block</th>
                  <th>Exercise</th>
                  <th>Coach Target</th>
                  <th>Sets</th>
                  <th>Reps</th>
                  <th>RPE</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                ${
                  exercises.length
                    ? exercises
                        .map((exercise, index) => {
                          const exerciseLog = derived.latestExerciseLogByExerciseId.get(exercise.id) || null;
                          return `
                            <tr>
                              <td>${escapeHtml(exercise.block_label || `A${index + 1}`)}</td>
                              <td>
                                <strong>${escapeHtml(buildExerciseLabel(exercise))}</strong>
                                ${exercise.notes ? `<small>${escapeHtml(exercise.notes)}</small>` : ""}
                              </td>
                              <td>${escapeHtml(buildPrescriptionText(exercise))}</td>
                              <td>
                                <input type="hidden" name="exerciseId" value="${escapeHtml(exercise.id)}" />
                                <input type="number" name="completedSets" min="0" step="1" value="${escapeHtml(buildDefaultCompletedSets(exercise, exerciseLog))}" />
                              </td>
                              <td><input type="number" name="completedReps" min="0" step="1" value="${escapeHtml(buildDefaultCompletedReps(exercise, exerciseLog))}" /></td>
                              <td><input type="number" name="loggedRpe" min="0" max="10" step="0.5" value="${escapeHtml(buildDefaultLoggedRpe(exercise, exerciseLog))}" /></td>
                              <td><input type="text" name="exerciseNote" value="${escapeHtml(exerciseLog?.exercise_note || "")}" placeholder="Notes for coach" /></td>
                            </tr>
                          `;
                        })
                        .join("")
                    : `
                      <tr>
                        <td colspan="7">
                          <div class="dashboard-note dashboard-note--placeholder">
                            <strong>No exercise rows attached yet</strong>
                            <p>Your coach still needs to add the day rows for this session.</p>
                          </div>
                        </td>
                      </tr>
                    `
                }
              </tbody>
            </table>
          </div>
          <div class="section-actions section-actions--compact">
            <button class="btn btn-primary" type="button" data-training-day-save="${escapeHtml(day.id)}">Save Training Sheet</button>
          </div>
          <p class="dashboard-feedback client-planner-inline-feedback" data-training-day-feedback="${escapeHtml(day.id)}">
            ${escapeHtml(feedbackText)}
          </p>
        </form>
      </article>
    `;
  }

  function buildExerciseLabel(exercise) {
    return (
      exercise?.name_override
      || exercise?.exercise_library?.name
      || exercise?.metadata?.exercise_name
      || "Exercise"
    );
  }

  function buildPrescriptionText(exercise) {
    const pieces = [];
    if (exercise?.sets) {
      pieces.push(`${exercise.sets} sets`);
    }
    if (exercise?.reps) {
      pieces.push(`${exercise.reps} reps`);
    } else if (exercise?.rep_range_min || exercise?.rep_range_max) {
      pieces.push(`${exercise.rep_range_min || "?"}-${exercise.rep_range_max || "?"} reps`);
    }
    if (exercise?.duration_seconds) {
      pieces.push(formatDurationHuman(exercise.duration_seconds));
    }
    if (exercise?.distance_meters) {
      pieces.push(formatDistanceHuman(exercise.distance_meters));
    }
    if (exercise?.heart_rate_zone) {
      pieces.push(`Zone ${exercise.heart_rate_zone}`);
    }
    if (exercise?.intensity_mode && exercise.intensity_mode !== "none" && exercise?.intensity_value !== null && exercise?.intensity_value !== undefined) {
      pieces.push(`${String(exercise.intensity_mode).toUpperCase()} ${exercise.intensity_value}`);
    }
    if (exercise?.prescribed_weight_kg !== null && exercise?.prescribed_weight_kg !== undefined && exercise?.prescribed_weight_kg !== "") {
      pieces.push(`Target load ${formatMetricValue(exercise.prescribed_weight_kg, " kg")}`);
    }
    if (exercise?.metadata?.intensity_cue) {
      pieces.push(exercise.metadata.intensity_cue);
    }
    if (exercise?.metadata?.target_pace) {
      pieces.push(exercise.metadata.target_pace);
    }
    if (exercise?.rest_time_seconds) {
      pieces.push(`${formatDurationHuman(exercise.rest_time_seconds)} rest`);
    }
    return pieces.join(" • ") || "Details will be set by your coach.";
  }

  function buildExerciseExecutionNote(exercise) {
    const metadata = asObject(exercise?.metadata);
    const pieces = [];
    const clientEntryMode = String(metadata.client_entry_mode || metadata.client_input_mode || "").trim().toLowerCase();
    const incrementKg = metadata.increment_kg;
    const progressionRule = String(metadata.progression_rule || exercise?.progressive_overload_goal || "").trim();

    if (clientEntryMode === "log_reps_rpe") {
      pieces.push("You log reps and RPE after the session.");
    } else if (clientEntryMode === "log_time_distance") {
      pieces.push("You log time, distance, and feel after the session.");
    } else if (clientEntryMode === "completion_only") {
      pieces.push("You only need to confirm completion for this line.");
    } else {
      pieces.push("You log weight, reps, and session feel after the session.");
    }

    if (incrementKg !== null && incrementKg !== undefined && incrementKg !== "") {
      pieces.push(`Coach increment ${formatMetricValue(incrementKg, " kg")}`);
    }
    if (progressionRule) {
      pieces.push(progressionRule);
    }

    return pieces.length
      ? `<small class="client-planner-execution-note">${escapeHtml(pieces.join(" • "))}</small>`
      : "";
  }

  function buildExerciseMedia(exercise) {
    const athleteEngine = resolveAthleteEngine();
    const media = (exercise?.resolved_demo && typeof exercise.resolved_demo === "object"
      ? exercise.resolved_demo
      : athleteEngine?.resolveExerciseDemo(exercise)) || null;
    if (!media?.url) {
      return "";
    }

    const autoPlay = Boolean(exercise?.exercise_library?.autoplay_video) && media.isDirectVideo;
    const sourceMode = String(media.sourceMode || "").toLowerCase();
    const isLegacyDemo = sourceMode === "legacy_library";
    const isTemporaryDemo = sourceMode === "temporary_external" || media.source === "youtube_search_fallback";
    const sourceChipLabel = isLegacyDemo
      ? "LEGACY demo"
      : isTemporaryDemo
        ? "Quick demo reference"
        : "Exercise demo";
    const headline = media.title
      || (isLegacyDemo
        ? "Watch the official movement demo"
        : isTemporaryDemo
          ? "Watch the current YouTube reference"
          : "Watch the movement demo");
    const supportingMeta = [];
    if (media.provider === "youtube") {
      supportingMeta.push("YouTube");
    }
    if (media.channel) {
      supportingMeta.push(media.channel);
    }
    if (media.publishedAt) {
      supportingMeta.push(`Published ${formatDate(media.publishedAt)}`);
    }
    const note = media.note
      || (isTemporaryDemo
        ? "This is a temporary external demo while the official LEGACY exercise library is being built."
        : "");
    return `
      <div class="client-planner-exercise-media">
        <div class="client-planner-exercise-media__card">
          <div class="client-planner-exercise-media__copy">
            <div class="client-planner-exercise-media__head">
              <span class="client-planner-asset-chip">${escapeHtml(sourceChipLabel)}</span>
            </div>
            <strong class="client-planner-exercise-media__title">${escapeHtml(headline)}</strong>
            ${supportingMeta.length ? `<p class="client-planner-exercise-media__meta">${escapeHtml(supportingMeta.join(" • "))}</p>` : ""}
            ${note ? `<p class="client-planner-exercise-media__note">${escapeHtml(note)}</p>` : ""}
          </div>
          <a class="btn btn-secondary client-planner-watch-demo" href="${escapeHtml(media.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(media.label || "Watch demo")}</a>
        </div>
        ${
          media.isDirectVideo
            ? `
              <video
                class="client-planner-exercise-video"
                src="${escapeHtml(media.url)}"
                playsinline
                preload="metadata"
                ${autoPlay ? "autoplay muted loop" : "controls"}
              ></video>
            `
            : ""
        }
      </div>
    `;
  }

  function renderWorkoutList(derived) {
    if (!workoutListNode) {
      return;
    }

    if (!derived.programDays.length) {
      workoutListNode.innerHTML = `
        <article class="dashboard-note dashboard-note--placeholder">
          <strong>No training days available yet</strong>
          <p>Your workout library will appear here once your coach assigns a block and its scheduled days to the planner.</p>
        </article>
      `;
      return;
    }

    workoutListNode.innerHTML = derived.programDays
      .map((day) => {
        const exercises = derived.exercisesByDay.get(day.id) || [];
        const log = derived.workoutLogByDay.get(day.id) || null;
        const interactionEnabled = !["rest", "recovery"].includes(String(day.day_type || "").toLowerCase());
        return `
          <article class="client-planner-day-card" data-planner-day-id="${escapeHtml(day.id)}">
            <div class="client-planner-card-head">
              <div>
                <h3>${escapeHtml(day.title || `Day ${day.day_number || ""}`)}</h3>
                <p>${escapeHtml(day.focus || `${toTitleCase(day.day_type)} day`)}</p>
              </div>
              ${buildStatusPill(day.status, day.status)}
            </div>
            <div class="client-planner-card-subhead">
              <span>${escapeHtml(formatDate(day.scheduled_date))}</span>
              <span>Week ${escapeHtml(String(day.week_number || 1))}</span>
              <span>${escapeHtml(toTitleCase(day.day_type))}</span>
              ${log ? `<span>Review: ${escapeHtml(toTitleCase(log.review_status || "pending"))}</span>` : ""}
            </div>
            ${day.notes ? `<p class="client-planner-summary-note">${escapeHtml(day.notes)}</p>` : ""}
            <div class="client-planner-exercise-list">
              ${
                exercises.length
                  ? exercises
                      .map(
                        (exercise) => `
                          <article class="client-planner-exercise-item">
                            <strong>${escapeHtml(buildExerciseLabel(exercise))}</strong>
                            <p>${escapeHtml(buildPrescriptionText(exercise))}</p>
                            ${buildExerciseExecutionNote(exercise)}
                            ${exercise?.notes ? `<small>${escapeHtml(exercise.notes)}</small>` : ""}
                            ${buildExerciseMedia(exercise)}
                          </article>
                        `
                      )
                      .join("")
                  : `<p class="dashboard-note">Coach exercise detail has not been attached to this day yet.</p>`
              }
            </div>
            ${
              interactionEnabled
                ? `
                  <form class="client-planner-workout-form" data-workout-form="${escapeHtml(day.id)}">
                    <div class="input-row account-input-row">
                      <label>
                        Adherence score
                        <input type="number" name="adherenceScore" min="0" max="100" step="1" placeholder="Optional" />
                        <small class="score-guidance score-guidance--compact">
                          <span><strong>0-39</strong><em>Mostly off-plan</em></span>
                          <span><strong>40-69</strong><em>Partial completion</em></span>
                          <span><strong>70-89</strong><em>Mostly completed</em></span>
                          <span><strong>90-100</strong><em>Fully completed as prescribed</em></span>
                        </small>
                      </label>
                      <label>
                        Feedback for coach
                        <input type="text" name="clientFeedback" placeholder="How did the session feel?" />
                      </label>
                    </div>
                    <div class="client-planner-action-row">
                      <button class="btn btn-primary" type="button" data-workout-log-status="completed">Mark Complete</button>
                      <button class="btn btn-secondary" type="button" data-workout-log-status="partial">Mark Partial</button>
                      <button class="btn btn-ghost" type="button" data-workout-log-status="missed">Mark Missed</button>
                    </div>
                    <p class="dashboard-feedback client-planner-inline-feedback" data-workout-feedback="${escapeHtml(day.id)}">
                      ${
                        log
                          ? `Latest log: ${escapeHtml(toTitleCase(log.log_status || "pending"))} • Review ${escapeHtml(toTitleCase(log.review_status || "pending"))}`
                          : "Submitting here will notify your coach and place the log into review."
                      }
                    </p>
                  </form>
                `
                : `
                  <p class="dashboard-feedback client-planner-inline-feedback">
                    This day is a ${escapeHtml(toTitleCase(day.day_type))} day. Use it to recover exactly as prescribed.
                  </p>
                `
            }
          </article>
        `;
      })
      .join("");
  }

  function renderNutritionSummary(derived) {
    if (!nutritionSummaryNode) {
      return;
    }

    const plan = resolveSelectedNutritionPlan(derived);
    if (!plan) {
      nutritionSummaryNode.innerHTML = `<p class="dashboard-note">Your live nutrition plan will appear here once your coach sets it up.</p>`;
      return;
    }

    const habits = derived.habitsByPlan.get(plan.id) || [];
    const selectedDay = derived.selectedNutritionDay;
    const selectedTargets = resolveNutritionTargetsForDay(plan, selectedDay);
    const mealDays = Array.isArray(plan?.meal_plan?.days) ? plan.meal_plan.days : [];
    nutritionSummaryNode.innerHTML = `
      <div class="client-planner-summary-card">
        <div class="client-planner-card-head">
          <div>
            <h3>${escapeHtml(plan.title || "Nutrition Plan")}</h3>
            <p>${escapeHtml(plan.notes || "Coach notes and nutrition intent will appear here.")}</p>
          </div>
          ${buildStatusPill(plan.status, plan.status)}
        </div>
        <dl class="client-planner-kv-grid">
          <div>
            <dt>Strategy</dt>
            <dd>${escapeHtml(toTitleCase(plan.strategy))}</dd>
          </div>
          <div>
            <dt>Calories</dt>
            <dd>${escapeHtml(formatMetricValue(plan.calories_target, " kcal"))}</dd>
          </div>
          <div>
            <dt>Protein</dt>
            <dd>${escapeHtml(formatMetricValue(plan.protein_target_g, " g"))}</dd>
          </div>
          <div>
            <dt>Carbs / Fat</dt>
            <dd>${escapeHtml(`${formatMetricValue(plan.carbs_target_g, " g")} • ${formatMetricValue(plan.fat_target_g, " g")}`)}</dd>
          </div>
          <div>
            <dt>Habit targets</dt>
            <dd>${escapeHtml(String(habits.length))}</dd>
          </div>
          <div>
            <dt>Planned days</dt>
            <dd>${escapeHtml(String(mealDays.length || 0))}</dd>
          </div>
          <div>
            <dt>Day in focus</dt>
            <dd>${escapeHtml(selectedDay?.label || toTitleCase(selectedDay?.dayKey || "Pick a day"))}</dd>
          </div>
          <div>
            <dt>Day target</dt>
            <dd>${escapeHtml(formatNutritionTargetLine(selectedTargets))}</dd>
          </div>
        </dl>
        <p class="client-planner-summary-note">
          ${escapeHtml(selectedDay?.note || "Choose one day from the nutrition calendar below to see only that day's structure and logging flow.")}
        </p>
      </div>
    `;
  }

  function renderNutritionPlanOptions(derived) {
    if (!nutritionPlanNode) {
      return;
    }

    const selectedValue = getSelectedNutritionPlanId(derived);
    nutritionPlanNode.innerHTML = [
      `<option value="">Select plan</option>`,
      ...derived.nutritionPlans.map(
        (plan) => `<option value="${escapeHtml(plan.id)}"${plan.id === selectedValue ? " selected" : ""}>${escapeHtml(plan.title)}</option>`
      ),
    ].join("");
    nutritionPlanNode.value = selectedValue;
  }

  function buildNutritionCalendar(derived) {
    if (!nutritionCalendarNode) {
      return;
    }

    const plan = resolveSelectedNutritionPlan(derived);
    const days = Array.isArray(plan?.meal_plan?.days)
      ? plan.meal_plan.days.filter((day) => day && (((Array.isArray(day.slots) ? day.slots.length : 0) > 0) || compactText(day.note)))
      : [];
    const selectedDay = derived.selectedNutritionDay;

    if (!days.length) {
      nutritionCalendarNode.innerHTML = `
        <article class="dashboard-note dashboard-note--placeholder">
          <strong>No nutrition days available yet</strong>
          <p>Your coach-planned meal rhythm will appear here once the live plan is ready.</p>
        </article>
      `;
      return;
    }

    nutritionCalendarNode.innerHTML = days
      .slice()
      .sort((left, right) => getNutritionDayOrderIndex(left.dayKey) - getNutritionDayOrderIndex(right.dayKey))
      .map((day) => {
        const isActive = normalizeNutritionDayKey(day.dayKey) === normalizeNutritionDayKey(selectedDay?.dayKey);
        const slotCount = Array.isArray(day.slots) ? day.slots.length : 0;
        const dayTargets = resolveNutritionTargetsForDay(plan, day);
        const dayType = String(day.dayType || day.day_type || "rest").trim().toLowerCase();
        return `
          <button
            class="client-planner-calendar-card${isActive ? " is-active" : ""}"
            type="button"
            data-nutrition-day-select="${escapeHtml(day.dayKey || "")}"
            aria-pressed="${isActive ? "true" : "false"}"
          >
            <span class="client-planner-calendar-card__eyebrow">${escapeHtml(day.label || toTitleCase(day.dayKey || "day"))}</span>
            <strong>${escapeHtml(toTitleCase(dayType))}</strong>
            <small>${escapeHtml(slotCount ? `${slotCount} meal slot${slotCount === 1 ? "" : "s"}` : "Coach note only")}</small>
            <p>${escapeHtml(formatNutritionTargetLine(dayTargets))}</p>
          </button>
        `;
      })
      .join("");
  }

  function renderNutritionDayDetail(derived) {
    if (!nutritionDayDetailNode) {
      return;
    }

    const plan = resolveSelectedNutritionPlan(derived);
    const selectedDay = derived.selectedNutritionDay;
    const recipeById = new Map((derived.recipes || []).map((recipe) => [recipe.id, recipe]));
    const dayTargets = resolveNutritionTargetsForDay(plan, selectedDay);
    const dayType = String(selectedDay?.dayType || selectedDay?.day_type || "rest").trim().toLowerCase();

    if (!plan || !selectedDay) {
      nutritionDayDetailNode.innerHTML = `
        <article class="dashboard-note dashboard-note--placeholder">
          <strong>Select a day to open the plan</strong>
          <p>Your selected day will show the meal structure, coach guidance, and the correct logging flow for that day.</p>
        </article>
      `;
      return;
    }

    const slotMarkup = Array.isArray(selectedDay.slots) && selectedDay.slots.length
      ? selectedDay.slots
          .map((slot) => {
            const resolvedTitle = slot.title || recipeById.get(slot.recipeId)?.title || "Coach-guided meal";
            return `
              <article class="client-planner-feed-card client-planner-feed-card--meal-day">
                <div class="client-planner-card-head">
                  <div>
                    <h3>${escapeHtml(toTitleCase(String(slot.mealType || "meal").replace(/_/gu, " ")))}</h3>
                    <p>${escapeHtml(resolvedTitle)}</p>
                  </div>
                </div>
                <p>${escapeHtml(slot.note || "Use your meal diary or photo assist below if you need to log this meal in detail.")}</p>
              </article>
            `;
          })
          .join("")
      : `<article class="dashboard-note"><strong>No meal slots set</strong><p>Your coach has not attached explicit meals to this day yet. Follow the note and use the log below as needed.</p></article>`;

    nutritionDayDetailNode.innerHTML = `
      <article class="client-planner-summary-card client-planner-summary-card--nutrition-day">
        <div class="client-planner-card-head">
          <div>
            <h3>${escapeHtml(selectedDay.label || toTitleCase(selectedDay.dayKey || "Day"))}</h3>
            <p>${escapeHtml(selectedDay.note || "Follow the structure below and log only what you actually do.")}</p>
          </div>
          ${buildStatusPill(state.activeNutritionWorkspace, toTitleCase(state.activeNutritionWorkspace.replace(/_/gu, " ")))}
        </div>
        <div class="client-planner-kv-grid">
          <div>
            <dt>Plan</dt>
            <dd>${escapeHtml(plan.title || "Nutrition Plan")}</dd>
          </div>
          <div>
            <dt>Log date</dt>
            <dd>${escapeHtml(resolveNutritionDayDate(selectedDay))}</dd>
          </div>
          <div>
            <dt>Day type</dt>
            <dd>${escapeHtml(toTitleCase(dayType || "rest"))}</dd>
          </div>
          <div>
            <dt>Target</dt>
            <dd>${escapeHtml(formatNutritionTargetLine(dayTargets))}</dd>
          </div>
          <div>
            <dt>Hydration</dt>
            <dd>${escapeHtml(dayTargets?.hydrationLiters ? `${dayTargets.hydrationLiters} L` : "Coach-led")}</dd>
          </div>
          <div>
            <dt>Logging mode</dt>
            <dd>${escapeHtml(toTitleCase(state.activeNutritionWorkspace.replace(/_/gu, " ")))}</dd>
          </div>
        </div>
        <div class="client-planner-action-row">
          <button class="btn btn-ghost" type="button" data-open-nutrition-workspace="adherence">Open Daily Log</button>
          <button class="btn btn-secondary" type="button" data-open-nutrition-workspace="meals">Open Meal Diary</button>
          <button class="btn btn-primary" type="button" data-open-nutrition-workspace="photo">Open Photo Assist</button>
        </div>
        <div class="client-planner-standard-grid client-planner-standard-grid--meal-calendar">
          ${slotMarkup}
        </div>
      </article>
    `;
  }

  function renderHealthSummary(derived) {
    if (!healthSummaryNode) {
      return;
    }

    const template = derived.selectedCheckinTemplate;
    const openCheckin = template?.id ? derived.openCheckinByTemplateId.get(template.id) || null : null;
    const latestCheckin = derived.checkins[0] || null;

    if (!template) {
      healthSummaryNode.innerHTML = `<p class="dashboard-note">Your current health rhythm will appear here once your coach schedules it.</p>`;
      return;
    }

    healthSummaryNode.innerHTML = `
      <div class="client-planner-summary-card">
        <div class="client-planner-card-head">
          <div>
            <h3>${escapeHtml(template.title || "Health rhythm")}</h3>
            <p>${escapeHtml(template.description || "Your coach will use this to monitor recovery, readiness, and any health friction that could affect training.")}</p>
          </div>
          ${buildStatusPill(openCheckin?.status || "active", openCheckin?.status || "active")}
        </div>
        <dl class="client-planner-kv-grid">
          <div>
            <dt>Cadence</dt>
            <dd>${escapeHtml(toTitleCase(template.cadence || "weekly"))}</dd>
          </div>
          <div>
            <dt>Form style</dt>
            <dd>${escapeHtml(toTitleCase(String(template.form_type || "weekly_checkin").replace(/_/gu, " ")))}</dd>
          </div>
          <div>
            <dt>Next due</dt>
            <dd>${escapeHtml(openCheckin?.due_at ? formatDateTime(openCheckin.due_at) : "Not scheduled yet")}</dd>
          </div>
          <div>
            <dt>Latest review</dt>
            <dd>${escapeHtml(latestCheckin?.review_status ? toTitleCase(latestCheckin.review_status) : "Nothing submitted yet")}</dd>
          </div>
        </dl>
        ${
          latestCheckin?.coach_comment
            ? `<p class="client-planner-summary-note">${escapeHtml(latestCheckin.coach_comment)}</p>`
            : ""
        }
      </div>
    `;
  }

  function renderHabitList(derived) {
    if (!habitListNode) {
      return;
    }

    const planId = getSelectedNutritionPlanId(derived);
    const habits = planId ? derived.habitsByPlan.get(planId) || [] : [];
    if (!habits.length) {
      habitListNode.innerHTML = `<p class="dashboard-note">No nutrition habits are attached to your active plan yet.</p>`;
      return;
    }

    habitListNode.innerHTML = habits
      .map(
        (habit) => `
          <article class="client-planner-feed-card">
            <div class="client-planner-card-head">
              <div>
                <h3>${escapeHtml(habit.title)}</h3>
                <p>${escapeHtml(habit.description || "Habit description will appear here.")}</p>
              </div>
              ${buildStatusPill(habit.is_required ? "required" : "optional", habit.is_required ? "Required" : "Optional")}
            </div>
            <div class="client-planner-card-subhead">
              <span>${escapeHtml(toTitleCase(habit.cadence || "daily"))}</span>
              <span>${escapeHtml(toTitleCase(habit.target_type || "target"))}</span>
              ${
                habit.target_value || habit.target_unit
                  ? `<span>${escapeHtml(String(habit.target_value || ""))} ${escapeHtml(String(habit.target_unit || ""))}</span>`
                  : ""
              }
            </div>
          </article>
        `
      )
      .join("");
  }

  function renderNutritionFeed(derived) {
    if (!nutritionFeedNode) {
      return;
    }

    const selectedPlanId = getSelectedNutritionPlanId(derived);
    const visibleLogs = selectedPlanId
      ? derived.nutritionLogs.filter((log) => String(log.nutrition_plan_id || "") === selectedPlanId)
      : derived.nutritionLogs;

    if (!visibleLogs.length) {
      nutritionFeedNode.innerHTML = `<p class="dashboard-note">No nutrition logs submitted yet.</p>`;
      return;
    }

    nutritionFeedNode.innerHTML = visibleLogs
      .slice(0, 6)
      .map(
        (log) => `
          <article class="client-planner-feed-card">
            <div class="client-planner-card-head">
              <div>
                <h3>${escapeHtml(formatDate(log.log_date))}</h3>
                <p>${escapeHtml(log.note || "No extra notes submitted.")}</p>
              </div>
              ${buildStatusPill(log.status, log.status)}
            </div>
            <div class="client-planner-card-subhead">
              <span>${escapeHtml(String(log.review_status || "").toLowerCase() === "none" ? "Diary synced" : `Review ${toTitleCase(log.review_status || "pending")}`)}</span>
              <span>${escapeHtml(String(log.balanced_meals_count || 0))} balanced meals</span>
              <span>${log.meal_prep_completed ? "Meal prep hit" : "Meal prep not logged"}</span>
            </div>
          </article>
        `
      )
      .join("");
  }

  function buildMealBuilderItemFromFood(food) {
    const servings = Array.isArray(food?.servings) ? food.servings : [];
    const defaultServing = servings.find((serving) => serving.isDefault) || servings[0] || null;
    const baseGrams = Number(defaultServing?.grams || food?.servingBasisG || 100);
    const quantity = 1;
    const item = {
      localId: window.crypto?.randomUUID ? window.crypto.randomUUID() : `meal-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      foodId: food.id,
      name: food.name,
      brandName: food.brandName || "",
      servingBasisG: Number(food.servingBasisG || 100),
      servingId: defaultServing?.id || "",
      servingLabel: defaultServing?.label || `${formatMacroValue(baseGrams, " g")}`,
      servings,
      quantity,
      grams: roundNumber(baseGrams * quantity),
      note: "",
      caloriesKcal: 0,
      proteinG: 0,
      carbsG: 0,
      fatG: 0,
      fiberG: 0,
      sugarG: 0,
      sodiumMg: 0,
      externalFood: food.externalFood || null,
      food,
    };
    return recalculateMealBuilderItem(item);
  }

  function recalculateMealBuilderItem(item) {
    const servings = Array.isArray(item?.servings) ? item.servings : [];
    const selectedServing = servings.find((serving) => serving.id === item.servingId) || servings.find((serving) => serving.isDefault) || servings[0] || null;
    const quantity = roundNumber(Number(item.quantity || 1)) || 1;
    const grams = roundNumber(
      Number(item.grams || 0)
      || (Number(selectedServing?.grams || 0) * quantity)
      || (Number(item.servingBasisG || 100) * quantity)
    );
    const basis = Number(item.servingBasisG || 100) || 100;
    const factor = grams / basis;

    return {
      ...item,
      quantity,
      grams,
      servingId: selectedServing?.id || item.servingId || "",
      servingLabel: selectedServing?.label || item.servingLabel || "Custom",
      caloriesKcal: roundNumber(Number(item.food?.caloriesKcal || 0) * factor),
      proteinG: roundNumber(Number(item.food?.proteinG || 0) * factor),
      carbsG: roundNumber(Number(item.food?.carbsG || 0) * factor),
      fatG: roundNumber(Number(item.food?.fatG || 0) * factor),
      fiberG: roundNumber(Number(item.food?.fiberG || 0) * factor),
      sugarG: roundNumber(Number(item.food?.sugarG || 0) * factor),
      sodiumMg: roundNumber(Number(item.food?.sodiumMg || 0) * factor),
    };
  }

  function buildMealBuilderTotals() {
    return state.mealBuilderItems.reduce(
      (totals, item) => ({
        caloriesKcal: roundNumber(totals.caloriesKcal + Number(item.caloriesKcal || 0)),
        proteinG: roundNumber(totals.proteinG + Number(item.proteinG || 0)),
        carbsG: roundNumber(totals.carbsG + Number(item.carbsG || 0)),
        fatG: roundNumber(totals.fatG + Number(item.fatG || 0)),
        fiberG: roundNumber(totals.fiberG + Number(item.fiberG || 0)),
        sugarG: roundNumber(totals.sugarG + Number(item.sugarG || 0)),
        sodiumMg: roundNumber(totals.sodiumMg + Number(item.sodiumMg || 0)),
      }),
      {
        caloriesKcal: 0,
        proteinG: 0,
        carbsG: 0,
        fatG: 0,
        fiberG: 0,
        sugarG: 0,
        sodiumMg: 0,
      }
    );
  }

  function renderFoodSearchResults() {
    if (!foodSearchResultsNode) {
      return;
    }

    const localResults = Array.isArray(state.foodSearchResults) ? state.foodSearchResults : [];
    const externalResults = Array.isArray(state.externalFoodSearchResults) ? state.externalFoodSearchResults : [];

    if (!localResults.length && !externalResults.length) {
      foodSearchResultsNode.innerHTML = `<p class="dashboard-note">Search the library to add foods into this meal.</p>`;
      return;
    }

    const localMarkup = localResults
      .map((food) => `
        <article class="client-planner-feed-card">
          <div class="client-planner-card-head">
            <div>
              <h3>${escapeHtml(food.name)}</h3>
              <p>${escapeHtml(food.brandName || `${toTitleCase(food.foodGroup || "food")} · ${food.dataSource || "manual"}`)}</p>
            </div>
            ${buildStatusPill(food.isVerified ? "approved" : "pending", food.isVerified ? "Verified" : "Coach / Manual")}
          </div>
          <div class="client-planner-card-subhead">
            <span>${escapeHtml(formatMacroValue(food.caloriesKcal, " kcal"))}</span>
            <span>${escapeHtml(formatMacroValue(food.proteinG, "p"))}</span>
            <span>${escapeHtml(formatMacroValue(food.carbsG, "c"))}</span>
            <span>${escapeHtml(formatMacroValue(food.fatG, "f"))}</span>
            <span>per ${escapeHtml(formatMacroValue(food.servingBasisG, " g"))}</span>
            ${sourceMappingLabel(food) ? `<span>${escapeHtml(sourceMappingLabel(food))}</span>` : ""}
          </div>
          <div class="section-actions section-actions--compact">
            <button class="btn btn-ghost" type="button" data-meal-add-food="${escapeHtml(food.id)}">Add Food</button>
            <button class="btn btn-ghost" type="button" data-toggle-favorite="${escapeHtml(food.id)}" data-favorite-active="${food.isFavorite ? "true" : "false"}">${food.isFavorite ? "Unfavorite" : "Favorite"}</button>
          </div>
        </article>
      `)
      .join("");

    const externalMarkup = externalResults
      .map((food) => `
        <article class="client-planner-feed-card client-planner-feed-card--external">
          <div class="client-planner-card-head">
            <div>
              <h3>${escapeHtml(food.name)}</h3>
              <p>${escapeHtml(food.brandName || "FatSecret external match")}</p>
            </div>
            ${buildStatusPill("ready", "External")}
          </div>
          <div class="client-planner-card-subhead">
            <span>${escapeHtml(formatMacroValue(food.caloriesKcal, " kcal"))}</span>
            <span>${escapeHtml(formatMacroValue(food.proteinG, "p"))}</span>
            <span>${escapeHtml(formatMacroValue(food.carbsG, "c"))}</span>
            <span>${escapeHtml(formatMacroValue(food.fatG, "f"))}</span>
            <span>per ${escapeHtml(formatMacroValue(food.servingBasisG, " g"))}</span>
          </div>
          <p class="client-planner-provider-note">This result comes from FatSecret and will be imported into your private meal diary only when you save it.</p>
          <div class="section-actions section-actions--compact">
            <button class="btn btn-ghost" type="button" data-meal-add-food="${escapeHtml(food.id)}">Add Food</button>
          </div>
        </article>
      `)
      .join("");

    foodSearchResultsNode.innerHTML = [
      localMarkup,
      externalMarkup ? `<article class="client-planner-feed-card client-planner-feed-card--provider-hint"><div class="client-planner-card-head"><div><h3>External Matches</h3><p>These packaged-food results are coming from the connected FatSecret layer.</p></div></div></article>${externalMarkup}` : "",
    ]
      .filter(Boolean)
      .join("");
  }

  function renderQuickPickRows(derived) {
    if (favoriteFoodsNode) {
      const favoriteFoods = derived.favoriteFoods || [];
      favoriteFoodsNode.innerHTML = favoriteFoods.length
        ? favoriteFoods
            .slice(0, 8)
            .map((food) => `<button class="client-planner-asset-chip client-planner-asset-chip--button" type="button" data-meal-add-food="${escapeHtml(food.id)}">${escapeHtml(food.name)}</button>`)
            .join("")
        : `<span class="client-planner-asset-chip">Save foods as favorites from search results.</span>`;
    }

    if (recentFoodsNode) {
      const recentFoods = derived.recentFoods || [];
      recentFoodsNode.innerHTML = recentFoods.length
        ? recentFoods
            .slice(0, 8)
            .map((entry) => `<button class="client-planner-asset-chip client-planner-asset-chip--button" type="button" data-add-recent-food="${escapeHtml(entry.food.id)}">${escapeHtml(entry.food.name)}${entry.last_meal_type ? ` · ${escapeHtml(mealTypeLabel(entry.last_meal_type))}` : ""}</button>`)
            .join("")
        : `<span class="client-planner-asset-chip">Recent foods will populate after you save meals.</span>`;
    }

    if (recipePicksNode) {
      const recipes = derived.recipes || [];
      recipePicksNode.innerHTML = recipes.length
        ? recipes
            .slice(0, 8)
            .map((recipe) => `<button class="client-planner-asset-chip client-planner-asset-chip--button" type="button" data-add-recipe="${escapeHtml(recipe.id)}">${escapeHtml(recipe.title)} · ${escapeHtml(formatMacroValue(recipe.perServingCaloriesKcal, " kcal"))}</button>`)
            .join("")
        : `<span class="client-planner-asset-chip">Coach recipes will appear here once they are published.</span>`;
    }
  }

  function renderBarcodeScannerSupport() {
    const supported = state.barcodeScanner.supported;
    if (barcodeCameraButton) {
      barcodeCameraButton.disabled = !supported;
      if (!supported) {
        barcodeCameraButton.title = "This browser does not support live barcode detection.";
      } else {
        barcodeCameraButton.removeAttribute("title");
      }
    }
    if (barcodePhotoButton) {
      if (!supported) {
        barcodePhotoButton.textContent = "Photo Scan Unavailable";
        barcodePhotoButton.disabled = true;
      }
    }
    if (!supported) {
      setBarcodeFeedback("Live barcode scanning is only available in supported browsers. Manual barcode entry still works.", true);
    }
  }

  function setBarcodeFeedback(message, isError) {
    setInlineFeedback(barcodeFeedbackNode, message, isError);
  }

  async function createBarcodeDetector() {
    if (!state.barcodeScanner.supported || typeof window.BarcodeDetector !== "function") {
      return null;
    }

    if (state.barcodeScanner.detector) {
      return state.barcodeScanner.detector;
    }

    let formats = ["ean_13", "ean_8", "upc_a", "upc_e", "code_128"];
    if (typeof window.BarcodeDetector.getSupportedFormats === "function") {
      try {
        const supportedFormats = await window.BarcodeDetector.getSupportedFormats();
        formats = formats.filter((format) => supportedFormats.includes(format));
      } catch (_) {
        // Keep the default format list if the browser throws here.
      }
    }

    if (!formats.length) {
      return null;
    }

    state.barcodeScanner.detector = new window.BarcodeDetector({ formats });
    return state.barcodeScanner.detector;
  }

  function setBarcodeScannerVisible(isVisible) {
    if (barcodeScannerNode) {
      barcodeScannerNode.hidden = !isVisible;
    }
    if (barcodeStopButton) {
      barcodeStopButton.hidden = !isVisible;
    }
    if (barcodeCameraButton) {
      barcodeCameraButton.disabled = isVisible;
    }
  }

  function stopBarcodeScanner() {
    const scanner = state.barcodeScanner;
    scanner.active = false;
    scanner.lastDetectedValue = "";
    scanner.lastDetectedAt = 0;
    if (scanner.rafId) {
      window.cancelAnimationFrame(scanner.rafId);
      scanner.rafId = 0;
    }
    if (scanner.stream) {
      scanner.stream.getTracks().forEach((track) => track.stop());
      scanner.stream = null;
    }
    if (barcodeVideoNode) {
      barcodeVideoNode.pause();
      barcodeVideoNode.srcObject = null;
    }
    setBarcodeScannerVisible(false);
  }

  async function commitDetectedBarcode(rawValue) {
    const barcode = String(rawValue || "").trim();
    if (!barcode) {
      return;
    }

    const now = Date.now();
    if (
      state.barcodeScanner.lastDetectedValue === barcode
      && now - Number(state.barcodeScanner.lastDetectedAt || 0) < 2500
    ) {
      return;
    }

    state.barcodeScanner.lastDetectedValue = barcode;
    state.barcodeScanner.lastDetectedAt = now;
    if (barcodeNode) {
      barcodeNode.value = barcode;
    }
    setBarcodeFeedback(`Barcode detected: ${barcode}. Looking up the product now...`, false);
    stopBarcodeScanner();
    await handleBarcodeLookup();
  }

  async function scanBarcodeFrame() {
    if (!state.barcodeScanner.active || !barcodeVideoNode) {
      return;
    }

    try {
      const detector = await createBarcodeDetector();
      if (!detector) {
        setBarcodeFeedback("This browser does not expose a supported barcode detector. Use manual entry or scan from a photo instead.", true);
        stopBarcodeScanner();
        return;
      }

      if (barcodeVideoNode.readyState >= 2) {
        const barcodes = await detector.detect(barcodeVideoNode);
        const detected = Array.isArray(barcodes) ? barcodes.find((entry) => String(entry.rawValue || "").trim()) : null;
        if (detected?.rawValue) {
          await commitDetectedBarcode(detected.rawValue);
          return;
        }
      }
    } catch (error) {
      setBarcodeFeedback(error?.message || "Unable to scan the live camera feed right now.", true);
      stopBarcodeScanner();
      return;
    }

    state.barcodeScanner.rafId = window.requestAnimationFrame(() => {
      scanBarcodeFrame().catch(() => null);
    });
  }

  async function startBarcodeCameraScanner() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setBarcodeFeedback("This browser cannot open the camera. You can still enter the barcode manually.", true);
      return;
    }

    const detector = await createBarcodeDetector();
    if (!detector) {
      setBarcodeFeedback("Live barcode scanning is not supported in this browser. Use scan from photo or manual entry instead.", true);
      return;
    }

    stopBarcodeScanner();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      state.barcodeScanner.stream = stream;
      state.barcodeScanner.active = true;
      if (barcodeVideoNode) {
        barcodeVideoNode.srcObject = stream;
        await barcodeVideoNode.play();
      }
      setBarcodeScannerVisible(true);
      setBarcodeFeedback("Point the camera at the barcode. The planner will fill it in automatically once it locks on.", false);
      scanBarcodeFrame().catch(() => null);
    } catch (error) {
      setBarcodeFeedback(error?.message || "Unable to start the barcode camera right now.", true);
      stopBarcodeScanner();
    }
  }

  async function scanBarcodeFromFile(file) {
    if (!(file instanceof File)) {
      setBarcodeFeedback("Choose a clear barcode photo first.", true);
      return;
    }

    const detector = await createBarcodeDetector();
    if (!detector || typeof window.createImageBitmap !== "function") {
      setBarcodeFeedback("Image barcode scanning is not supported in this browser. You can still type the barcode manually.", true);
      return;
    }

    setBarcodeFeedback("Scanning the uploaded barcode image...", false);
    try {
      const bitmap = await window.createImageBitmap(file);
      try {
        const barcodes = await detector.detect(bitmap);
        const detected = Array.isArray(barcodes) ? barcodes.find((entry) => String(entry.rawValue || "").trim()) : null;
        if (!detected?.rawValue) {
          setBarcodeFeedback("No barcode was detected in that image. Try a clearer crop or use manual entry.", true);
          return;
        }
        if (barcodeNode) {
          barcodeNode.value = detected.rawValue;
        }
        setBarcodeFeedback(`Barcode detected from image: ${detected.rawValue}. Looking up the product now...`, false);
        await handleBarcodeLookup();
      } finally {
        bitmap.close?.();
      }
    } catch (error) {
      setBarcodeFeedback(error?.message || "Unable to scan that barcode image right now.", true);
    } finally {
      if (barcodePhotoInput) {
        barcodePhotoInput.value = "";
      }
    }
  }

  function renderBarcodeResult() {
    if (!barcodeResultNode) {
      return;
    }

    const lookup = state.barcodeLookup;
    if (!lookup) {
      barcodeResultNode.innerHTML = `<p class="dashboard-note">Packaged foods will appear here once barcode lookup is available.</p>`;
      return;
    }

    const food = lookup.foodRecord || null;
    if (!food) {
      barcodeResultNode.innerHTML = `
        <article class="client-planner-feed-card">
          <div class="client-planner-card-head">
            <div>
              <h3>${escapeHtml(lookup.barcode || "Barcode lookup")}</h3>
              <p>${escapeHtml(lookup.message || "No packaged-food match was returned.")}</p>
            </div>
            ${buildStatusPill(lookup.providerState || "unavailable", lookup.providerState || "Unavailable")}
          </div>
        </article>
      `;
      return;
    }

    barcodeResultNode.innerHTML = `
      <article class="client-planner-feed-card client-planner-feed-card--barcode">
        <div class="client-planner-card-head">
          <div>
            <h3>${escapeHtml(food.name)}</h3>
            <p>${escapeHtml(food.brandName || `Barcode ${lookup.barcode || ""}`)}</p>
          </div>
          ${buildStatusPill(lookup.providerState || "healthy", lookup.providerState || "Ready")}
        </div>
        <div class="client-planner-card-subhead">
          <span>${escapeHtml(formatMacroValue(food.caloriesKcal, " kcal"))}</span>
          <span>${escapeHtml(formatMacroValue(food.proteinG, "p"))}</span>
          <span>${escapeHtml(formatMacroValue(food.carbsG, "c"))}</span>
          <span>${escapeHtml(formatMacroValue(food.fatG, "f"))}</span>
          <span>per ${escapeHtml(formatMacroValue(food.servingBasisG, " g"))}</span>
        </div>
        <p>${escapeHtml(lookup.message || "Packaged food imported and ready to use in the meal builder.")}</p>
        <div class="section-actions section-actions--compact">
          <button class="btn btn-ghost" type="button" data-barcode-add-food="${escapeHtml(food.id)}">Add Food</button>
        </div>
      </article>
    `;
  }

  function buildRecipeMealItems(derived, recipeId) {
    const recipe = (derived.recipes || []).find((entry) => entry.id === recipeId);
    if (!recipe) {
      return [];
    }

    const ingredients = derived.recipeIngredientsByRecipe.get(recipeId) || [];
    return ingredients
      .map((ingredient) => {
        const food = derived.catalogFoodById.get(ingredient.food_id);
        if (!food) {
          return null;
        }
        const baseItem = buildMealBuilderItemFromFood(food);
        return recalculateMealBuilderItem({
          ...baseItem,
          servingId: ingredient.serving_id || baseItem.servingId,
          quantity: Number(ingredient.quantity || 1),
          grams: Number(ingredient.grams || baseItem.grams || 0),
          note: ingredient.note || "",
        });
      })
      .filter(Boolean);
  }

  function renderMealBuilder() {
    if (mealBuilderNode) {
      if (!state.mealBuilderItems.length) {
        mealBuilderNode.innerHTML = `<p class="dashboard-note">Added foods will appear here with serving, quantity, and gram controls.</p>`;
      } else {
        mealBuilderNode.innerHTML = state.mealBuilderItems
          .map((item) => `
            <article class="client-planner-feed-card client-planner-meal-item-card" data-meal-item-id="${escapeHtml(item.localId)}">
              <div class="client-planner-card-head">
                <div>
                  <h3>${escapeHtml(item.name)}</h3>
                  <p>${escapeHtml(item.brandName || item.servingLabel || "Food item")}</p>
                </div>
                <button class="btn btn-ghost" type="button" data-remove-meal-item="${escapeHtml(item.localId)}">Remove</button>
              </div>
              <div class="client-planner-meal-item-grid">
                <label>
                  Serving
                  <select data-meal-item-field="servingId">
                    ${
                      item.servings
                        .map(
                          (serving) => `<option value="${escapeHtml(serving.id)}"${serving.id === item.servingId ? " selected" : ""}>${escapeHtml(serving.label)} · ${escapeHtml(formatMacroValue(serving.grams, " g"))}</option>`
                        )
                        .join("")
                    }
                  </select>
                </label>
                <label>
                  Quantity
                  <input data-meal-item-field="quantity" type="number" min="0.25" step="0.25" value="${escapeHtml(String(item.quantity || 1))}" />
                </label>
                <label>
                  Grams
                  <input data-meal-item-field="grams" type="number" min="1" step="0.1" value="${escapeHtml(String(item.grams || 0))}" />
                </label>
              </div>
              <label>
                Note
                <input data-meal-item-field="note" type="text" value="${escapeHtml(item.note || "")}" placeholder="Optional prep or ingredient note" />
              </label>
              <div class="client-planner-card-subhead">
                <span>${escapeHtml(formatMacroValue(item.caloriesKcal, " kcal"))}</span>
                <span>${escapeHtml(formatMacroValue(item.proteinG, "g protein"))}</span>
                <span>${escapeHtml(formatMacroValue(item.carbsG, "g carbs"))}</span>
                <span>${escapeHtml(formatMacroValue(item.fatG, "g fat"))}</span>
              </div>
            </article>
          `)
          .join("");
      }
    }

    if (mealTotalsNode) {
      const totals = buildMealBuilderTotals();
      mealTotalsNode.innerHTML = `
        <div class="client-planner-card-head">
          <div>
            <h3>Meal totals</h3>
            <p>${
              state.activeNutritionPhotoSubmissionId
                ? "This meal builder is currently linked to a photo-assist submission. Save the meal to keep that connection."
                : state.mealBuilderItems.length
                  ? "Calories, protein, carbs, and fats update as you build the meal."
                  : "Add foods to see the meal totals."
            }</p>
          </div>
        </div>
        <div class="client-planner-card-subhead">
          <span>${escapeHtml(formatMacroValue(totals.caloriesKcal, " kcal"))}</span>
          <span>${escapeHtml(formatMacroValue(totals.proteinG, "g protein"))}</span>
          <span>${escapeHtml(formatMacroValue(totals.carbsG, "g carbs"))}</span>
          <span>${escapeHtml(formatMacroValue(totals.fatG, "g fat"))}</span>
          <span>${escapeHtml(formatMacroValue(totals.fiberG, "g fiber"))}</span>
        </div>
      `;
    }
  }

  function renderMealFeed(derived) {
    if (!mealFeedNode) {
      return;
    }

    const selectedPlanId = getSelectedNutritionPlanId(derived);
    const visibleMeals = selectedPlanId
      ? derived.mealEntries.filter((entry) => String(entry.nutrition_plan_id || "") === selectedPlanId)
      : derived.mealEntries;

    if (!visibleMeals.length) {
      mealFeedNode.innerHTML = `<p class="dashboard-note">Meals built from the food library will appear here after your first save.</p>`;
      return;
    }

    mealFeedNode.innerHTML = visibleMeals
      .slice(0, 8)
      .map((entry) => {
        const items = derived.mealItemsByEntry.get(entry.id) || [];
        const itemPreview = items.slice(0, 3).map((item) => item.item_name).filter(Boolean).join(", ");
        return `
          <article class="client-planner-feed-card">
            <div class="client-planner-card-head">
              <div>
                <h3>${escapeHtml(entry.title || mealTypeLabel(entry.meal_type))}</h3>
                <p>${escapeHtml(entry.note || itemPreview || "Meal built from the nutrition library.")}</p>
              </div>
              ${buildStatusPill(entry.review_status || "pending", entry.review_status || "pending")}
            </div>
            <div class="client-planner-card-subhead">
              <span>${escapeHtml(formatDate(entry.log_date))}</span>
              <span>${escapeHtml(mealTypeLabel(entry.meal_type))}</span>
              ${String(entry.source_type || "").toLowerCase() === "photo" ? `<span>Photo assist</span>` : ""}
              <span>${escapeHtml(formatMacroValue(entry.total_calories_kcal, " kcal"))}</span>
              <span>${escapeHtml(formatMacroValue(entry.total_protein_g, "g protein"))}</span>
            </div>
            ${
              items.length
                ? `<div class="client-planner-asset-list">${items
                    .slice(0, 5)
                    .map((item) => `<span class="client-planner-asset-chip">${escapeHtml(item.item_name)} · ${escapeHtml(formatMacroValue(item.grams, " g"))}</span>`)
                    .join("")}</div>`
                : ""
            }
            ${entry.coach_comment ? `<p class="client-planner-summary-note">${escapeHtml(entry.coach_comment)}</p>` : ""}
          </article>
        `;
      })
      .join("");
  }

  function renderMealPhotoSelection() {
    if (!photoSelectionNode || !photoForm) {
      return;
    }

    revokeLocalPreviewUrls(photoSelectionNode);

    const inputMap = [
      { name: "mealPhoto", label: "Meal", emptyText: "Required photo not selected yet." },
      { name: "secondaryPhoto", label: "Second angle", emptyText: "Optional second angle not selected." },
      { name: "detailPhoto", label: "Detail / packaging", emptyText: "Optional close-up not selected." },
    ];

    photoSelectionNode.innerHTML = inputMap
      .map((entry) => {
        const input = photoForm.querySelector(`[name="${entry.name}"]`);
        const file = input?.files?.[0] || null;
        return buildUploadPreviewCardMarkup(photoSelectionNode, { ...entry, file }, { variant: "square" });
      })
      .join("");
  }

  function renderNutritionPhotoFeed(derived) {
    if (!photoFeedNode) {
      return;
    }

    const selectedPlanId = getSelectedNutritionPlanId(derived);
    const visibleSubmissions = selectedPlanId
      ? derived.nutritionPhotoSubmissions.filter((submission) => String(submission.nutrition_plan_id || "") === selectedPlanId)
      : derived.nutritionPhotoSubmissions;

    if (!visibleSubmissions.length) {
      photoFeedNode.innerHTML = `<p class="dashboard-note">Meal-photo submissions and suggested foods will appear here after your first upload.</p>`;
      return;
    }

    photoFeedNode.innerHTML = visibleSubmissions
      .slice(0, 6)
      .map((submission) => {
        const assets = derived.nutritionPhotoAssetsBySubmission.get(submission.id) || [];
        const candidates = derived.nutritionPhotoCandidatesBySubmission.get(submission.id) || [];
        const confidenceText = `${Math.round(Number(submission.confidence_score || 0) * 100)}% confidence`;
        return `
          <article class="client-planner-feed-card client-planner-photo-card" data-photo-submission-id="${escapeHtml(submission.id)}">
            <div class="client-planner-card-head">
              <div>
                <h3>${escapeHtml(submission.meal_title || mealTypeLabel(submission.meal_type))}</h3>
                <p>${escapeHtml(submission.detected_summary || submission.client_note || "Meal-photo assist submission")}</p>
              </div>
              ${buildStatusPill(submission.confidence_band || "low", confidenceText)}
            </div>
            <div class="client-planner-card-subhead">
              <span>${escapeHtml(formatDate(submission.log_date))}</span>
              <span>${escapeHtml(mealTypeLabel(submission.meal_type))}</span>
              <span>${escapeHtml(toTitleCase(submission.extraction_status || "pending"))}</span>
              <span>${escapeHtml(toTitleCase(submission.review_status || "pending"))}</span>
            </div>
            ${
              assets.length
                ? buildStoredAssetGalleryMarkup(assets, { variant: "square" })
                : ""
            }
            ${
              candidates.length
                ? `<div class="client-planner-photo-candidate-list">${candidates
                    .map((candidate) => `
                      <article class="client-planner-photo-candidate" data-photo-candidate-id="${escapeHtml(candidate.id)}">
                        <span class="client-planner-photo-candidate__toggle">
                          ${candidate.food_id ? `<input type="checkbox" data-photo-candidate-select${candidate.is_selected ? " checked" : ""} />` : `<span class="client-planner-photo-candidate__badge">Needs match</span>`}
                          <strong>${escapeHtml(resolvePhotoCandidateLabel(candidate, derived))}</strong>
                        </span>
                        <span class="client-planner-photo-candidate__meta">
                          <span>${escapeHtml(candidate.food_id ? "Matched" : "Needs match")}</span>
                          <span>${escapeHtml(Math.round(Number(candidate.confidence_score || 0) * 100).toString())}%</span>
                        </span>
                        <label class="client-planner-photo-candidate__grams">
                          Grams
                          <input type="number" min="1" step="1" data-photo-candidate-grams value="${escapeHtml(String(Math.round(Number(candidate.suggested_grams || 0)) || 0))}"${candidate.food_id ? "" : " disabled"} />
                        </label>
                        ${candidate.food_id ? "" : `<button class="btn btn-ghost" type="button" data-photo-candidate-search="${escapeHtml(candidate.label || resolvePhotoCandidateLabel(candidate, derived))}">Find In Food Library</button>`}
                        ${candidate.note ? `<small>${escapeHtml(candidate.note)}</small>` : ""}
                      </article>
                    `)
                    .join("")}</div>`
                : `<p class="dashboard-note">No reliable candidates detected yet. Add a clearer correction note and rerun the assist, or use the food search above.</p>`
            }
            <label class="client-planner-photo-note-field">
              Correction note
              <textarea class="client-planner-photo-note-input" data-photo-correction-note placeholder="Example: less rice, olive oil, extra egg, shared meal, no sauce.">${escapeHtml(submission.correction_note || "")}</textarea>
            </label>
            <div class="section-actions section-actions--compact">
              <button class="btn btn-ghost" type="button" data-rerun-photo-assist="${escapeHtml(submission.id)}">Refresh Suggestions</button>
              <button class="btn btn-secondary" type="button" data-build-photo-meal="${escapeHtml(submission.id)}">Build Selected In Meal Diary</button>
            </div>
            <p class="dashboard-feedback" data-photo-feedback="${escapeHtml(submission.id)}">
              ${submission.low_confidence ? "This entry is already flagged for coach review because confidence is low." : "You can rerun the assist with clearer notes before building the meal."}
            </p>
          </article>
        `;
      })
      .join("");
  }

  function buildMealBuilderItemsFromPhotoSubmission(derived, submissionId, containerNode) {
    const candidates = (derived.nutritionPhotoCandidatesBySubmission.get(submissionId) || [])
      .filter((candidate) => candidate.food_id);

    return candidates
      .filter((candidate) => {
        const candidateNode = containerNode?.querySelector(`[data-photo-candidate-id="${candidate.id}"]`);
        const checkbox = candidateNode?.querySelector("[data-photo-candidate-select]");
        return Boolean(checkbox?.checked);
      })
      .map((candidate) => {
        const food = derived.catalogFoodById.get(candidate.food_id);
        if (!food) {
          return null;
        }
        const baseItem = buildMealBuilderItemFromFood(food);
        const candidateNode = containerNode?.querySelector(`[data-photo-candidate-id="${candidate.id}"]`);
        const gramsValue = Number(candidateNode?.querySelector("[data-photo-candidate-grams]")?.value || candidate.suggested_grams || baseItem.grams || 0);
        return recalculateMealBuilderItem({
          ...baseItem,
          grams: gramsValue,
          quantity: Number(candidate.suggested_quantity || 1) || 1,
          note: candidate.note || "",
        });
      })
      .filter(Boolean);
  }

  function renderCheckinTemplateOptions(derived) {
    if (!checkinTemplateNode) {
      return;
    }

    const selectedValue = derived.selectedCheckinTemplate?.id || "";
    checkinTemplateNode.innerHTML = [
      `<option value="">Select health template</option>`,
      ...derived.checkinTemplates.map(
        (template) => `<option value="${escapeHtml(template.id)}"${template.id === selectedValue ? " selected" : ""}>${escapeHtml(template.title)}</option>`
      ),
    ].join("");
    checkinTemplateNode.value = selectedValue;

    const openCheckin = selectedValue ? derived.openCheckinByTemplateId.get(selectedValue) : null;
    if (checkinDueNode && openCheckin?.due_at) {
      checkinDueNode.value = formatDateTimeLocalInput(openCheckin.due_at);
    }
  }

  function buildScoreGuideMarkup(bands) {
    if (!Array.isArray(bands) || !bands.length) {
      return "";
    }
    return `
      <small class="score-guidance score-guidance--compact">
        ${bands
          .map(
            (band) => `
              <span>
                <strong>${escapeHtml(band.range)}</strong>
                <em>${escapeHtml(band.meaning)}</em>
              </span>
            `
          )
          .join("")}
      </small>
    `;
  }

  function getScoreGuideBands({ fieldKey = "", label = "", questionType = "" }) {
    const normalizedKey = String(fieldKey || "").toLowerCase();
    const normalizedLabel = String(label || "").toLowerCase();
    const normalizedType = String(questionType || "").toLowerCase();
    const isScoreField = normalizedType === "rating"
      || normalizedKey.includes("score")
      || normalizedKey.includes("recovery")
      || normalizedKey.includes("stress")
      || normalizedKey.includes("sleep")
      || normalizedKey.includes("pain")
      || normalizedLabel.includes("score")
      || normalizedLabel.includes("recovery")
      || normalizedLabel.includes("stress")
      || normalizedLabel.includes("sleep")
      || normalizedLabel.includes("pain");

    if (!isScoreField) {
      return [];
    }

    if (normalizedKey.includes("stress") || normalizedLabel.includes("stress")) {
      return [
        { range: "1-3", meaning: "Calm and manageable" },
        { range: "4-6", meaning: "Moderate and noticeable" },
        { range: "7-8", meaning: "Heavy and draining" },
        { range: "9-10", meaning: "Overwhelming and unsustainable" },
      ];
    }

    if (normalizedKey.includes("adherence")) {
      return [
        { range: "0-39", meaning: "Mostly off-plan" },
        { range: "40-69", meaning: "Partially completed" },
        { range: "70-89", meaning: "Mostly completed" },
        { range: "90-100", meaning: "Fully completed as prescribed" },
      ];
    }

    if (normalizedKey.includes("pain") || normalizedLabel.includes("pain")) {
      return [
        { range: "0-2", meaning: "Minimal or no pain" },
        { range: "3-5", meaning: "Noticeable but manageable" },
        { range: "6-8", meaning: "Limiting and concerning" },
        { range: "9-10", meaning: "Severe and needs attention now" },
      ];
    }

    return [
      { range: "1-3", meaning: "Poor or depleted" },
      { range: "4-6", meaning: "Mixed or average" },
      { range: "7-8", meaning: "Solid and on track" },
      { range: "9-10", meaning: "Excellent and fully ready" },
    ];
  }

  function buildQuestionControl(question, index) {
    const questionId = escapeHtml(question.id);
    const fieldKey = escapeHtml(question.field_key || `field_${index + 1}`);
    const label = escapeHtml(question.label || `Question ${index + 1}`);
    const helpText = question.help_text ? `<small>${escapeHtml(question.help_text)}</small>` : "";
    const scoreGuide = buildScoreGuideMarkup(
      getScoreGuideBands({
        fieldKey: question.field_key,
        label: question.label,
        questionType: question.question_type,
      })
    );
    const required = question.is_required ? " required" : "";
    const type = String(question.question_type || "text").toLowerCase();
    const inputId = `planner-question-${fieldKey}`;
    const options = Array.isArray(question.options) ? question.options : [];
    let control = "";

    if (type === "photo") {
      control = `
        <div class="client-planner-question-photo-stack">
          <input id="${inputId}" type="file" accept="image/jpeg,image/png,image/webp" multiple data-question-input data-question-type="photo"${required} />
          <p class="dashboard-note">Attach up to 4 progress or check-in images. They upload securely with this health update.</p>
          <div class="client-planner-asset-list" data-question-photo-list></div>
          <textarea data-question-photo-note placeholder="Optional note for your coach about these photos"></textarea>
        </div>
      `;
    } else if (type === "textarea") {
      control = `<textarea id="${inputId}" data-question-input data-question-type="${escapeHtml(type)}" placeholder="Enter your answer"${required}></textarea>`;
    } else if (type === "number" || type === "rating") {
      control = `<input id="${inputId}" type="number" data-question-input data-question-type="${escapeHtml(type)}" placeholder="Enter a number"${required} />`;
    } else if (type === "boolean") {
      control = `
        <label class="client-planner-check-toggle">
          <input id="${inputId}" type="checkbox" data-question-input data-question-type="boolean"${required} />
          <span>${label}</span>
        </label>
      `;
    } else if (type === "single_select") {
      control = `
        <select id="${inputId}" data-question-input data-question-type="single_select"${required}>
          <option value="">Select an option</option>
          ${options
            .map((option) => {
              const normalized = typeof option === "string" ? option : option?.label || option?.value || "";
              return `<option value="${escapeHtml(normalized)}">${escapeHtml(normalized)}</option>`;
            })
            .join("")}
        </select>
      `;
    } else if (type === "multi_select") {
      control = `
        <select id="${inputId}" multiple data-question-input data-question-type="multi_select"${required}>
          ${options
            .map((option) => {
              const normalized = typeof option === "string" ? option : option?.label || option?.value || "";
              return `<option value="${escapeHtml(normalized)}">${escapeHtml(normalized)}</option>`;
            })
            .join("")}
        </select>
      `;
    } else if (type === "date") {
      control = `<input id="${inputId}" type="date" data-question-input data-question-type="date"${required} />`;
    } else {
      control = `<input id="${inputId}" type="text" data-question-input data-question-type="text" placeholder="Enter your answer"${required} />`;
    }

    return `
      <label class="client-planner-question-card" data-question-card data-question-id="${questionId}" data-field-key="${fieldKey}" data-question-type="${escapeHtml(type)}">
        ${type === "boolean" ? "" : `<span>${label}${question.is_required ? " *" : ""}</span>`}
        ${control}
        ${helpText}
        ${scoreGuide}
      </label>
    `;
  }

  function renderQuestionStack(derived) {
    if (!checkinQuestionStackNode) {
      return;
    }

    Array.from(checkinQuestionStackNode.querySelectorAll("[data-question-photo-list]")).forEach((node) => {
      revokeLocalPreviewUrls(node);
    });

    const template = derived.selectedCheckinTemplate;
    if (!template) {
      checkinQuestionStackNode.innerHTML = `<p class="dashboard-note">Choose a health template to load the form fields.</p>`;
      return;
    }

    const questions = derived.questionsByTemplate.get(template.id) || [];
    if (!questions.length) {
      checkinQuestionStackNode.innerHTML = `
        <div class="client-planner-empty-callout">
          <strong>${escapeHtml(template.title)}</strong>
          <p>${escapeHtml(template.description || "This template has no question set attached yet.")}</p>
        </div>
      `;
      return;
    }

    checkinQuestionStackNode.innerHTML = `
        <div class="client-planner-empty-callout">
          <strong>${escapeHtml(template.title)}</strong>
          <p>${escapeHtml(template.description || "Answer every required field before submitting the health update.")}</p>
        </div>
        ${questions.map((question, index) => buildQuestionControl(question, index)).join("")}
      `;

    Array.from(checkinQuestionStackNode.querySelectorAll('[data-question-type="photo"]')).forEach((input) => {
      const card = input.closest("[data-question-card]");
      const listNode = card?.querySelector("[data-question-photo-list]");
      const syncPreview = () => {
        if (!listNode) {
          return;
        }

        revokeLocalPreviewUrls(listNode);

        const files = Array.from(input.files || []);
        listNode.innerHTML = files.length
          ? files
              .slice(0, 4)
              .map((file, index) =>
                buildUploadPreviewCardMarkup(
                  listNode,
                  {
                    label: `Health photo ${index + 1}`,
                    file,
                    emptyText: "No photo selected yet.",
                  },
                  { variant: "square" }
                )
              )
              .join("")
          : `<article class="client-planner-upload-preview client-planner-upload-preview--empty"><div class="client-planner-upload-preview__frame is-square"><span>No photo</span></div><div class="client-planner-upload-preview__copy"><strong>Health photos</strong><p>No images selected yet.</p></div></article>`;
      };

      input.addEventListener("change", syncPreview);
      syncPreview();
    });
  }

  function renderCheckinFeed(derived) {
    if (!checkinFeedNode) {
      return;
    }

    if (!derived.checkins.length) {
      checkinFeedNode.innerHTML = `<p class="dashboard-note">No health updates submitted yet.</p>`;
      return;
    }

    checkinFeedNode.innerHTML = derived.checkins
      .slice(0, 6)
      .map(
        (checkin) => `
          <article class="client-planner-feed-card">
            <div class="client-planner-card-head">
              <div>
                <h3>${escapeHtml(formatDateTime(checkin.submitted_at || checkin.due_at))}</h3>
                <p>Recovery score: ${escapeHtml(formatMetricValue(checkin.overall_adherence_score, ""))}</p>
              </div>
              ${buildStatusPill(checkin.status, checkin.status)}
            </div>
            <div class="client-planner-card-subhead">
              <span>${escapeHtml(toTitleCase(checkin.cadence || "health"))}</span>
              <span>Review ${escapeHtml(toTitleCase(checkin.review_status || "pending"))}</span>
              <span>Due ${escapeHtml(formatDateTime(checkin.due_at))}</span>
              ${!checkin.submitted_at ? `<span>Awaiting client submission</span>` : ""}
            </div>
            ${checkin.coach_comment ? `<p class="client-planner-summary-note">${escapeHtml(checkin.coach_comment)}</p>` : ""}
          </article>
        `
      )
      .join("");
  }

  function renderProgressFeed(derived) {
    if (!progressFeedNode) {
      return;
    }

    if (!derived.progressPhotos.length) {
      progressFeedNode.innerHTML = `
        <div class="client-planner-empty-callout">
          <strong>No progress-photo entries yet</strong>
          <p>Start with a front, side, and back photo in even light. Use the guide above to match stance, framing, and clothing every time.</p>
        </div>
      `;
      return;
    }

    progressFeedNode.innerHTML = derived.progressPhotos
      .slice(0, 6)
      .map((entry) => {
        const assets = derived.progressAssetsByEntry.get(entry.id) || [];
        return `
          <article class="client-planner-feed-card">
            <div class="client-planner-card-head">
              <div>
                <h3>${escapeHtml(formatDateTime(entry.captured_at))}</h3>
                <p>${escapeHtml(entry.client_note || "No client note submitted with this batch.")}</p>
              </div>
              ${buildStatusPill(entry.review_status, entry.review_status)}
            </div>
            <div class="client-planner-card-subhead">
              <span>${escapeHtml(entry.capture_period || "No period set")}</span>
              <span>${escapeHtml(formatMetricValue(entry.weight_kg, " kg"))}</span>
              <span>${escapeHtml(formatMetricValue(entry.body_fat_percent, "%"))}</span>
              ${
                formatAiEstimateLabel(entry)
                  ? `<span>${escapeHtml(formatAiEstimateLabel(entry))}</span>`
                  : String(entry.ai_body_fat_status || "").toLowerCase() === "pending"
                    ? `<span>AI estimate processing</span>`
                    : ""
              }
            </div>
            ${entry.ai_body_fat_summary ? `<p class="client-planner-summary-note">${escapeHtml(entry.ai_body_fat_summary)}</p>` : ""}
            ${
              assets.length
                ? buildStoredAssetGalleryMarkup(assets, { variant: "portrait" })
                : `<div class="client-planner-asset-list"><span class="client-planner-asset-chip">Assets recorded in storage</span></div>`
            }
          </article>
        `;
      })
      .join("");
  }

  function renderProgressSummary(derived) {
    const latest = derived.progressPhotos[0] || null;
    progressPeriodNode.textContent = latest?.capture_period
      ? `${toTitleCase(latest.capture_period)} captured ${formatDate(latest.captured_at)}.`
      : "No progress-photo period captured yet.";
    progressWeightNode.textContent = latest?.weight_kg
      ? `Latest entry logged at ${Number(latest.weight_kg).toLocaleString("en-MY")} kg.`
      : "Weight snapshots tied to progress-photo entries will appear here.";
    if (progressAiNode) {
      progressAiNode.textContent = formatAiEstimateSummary(latest);
    }
    progressReviewNode.textContent = latest?.review_status
      ? `Latest batch is ${toTitleCase(latest.review_status)}.`
      : "Coach review status will update here when photo batches are reviewed.";
  }

  function renderProgressSelection() {
    if (!progressSelectionNode || !progressForm) {
      return;
    }

    revokeLocalPreviewUrls(progressSelectionNode);

    const inputMap = [
      { name: "frontPhoto", label: "Front", emptyText: "Required front photo not selected yet." },
      { name: "sidePhoto", label: "Side", emptyText: "Required side photo not selected yet." },
      { name: "backPhoto", label: "Back", emptyText: "Required back photo not selected yet." },
      { name: "detailPhoto", label: "Detail", emptyText: "Optional detail photo not selected." },
    ];

    const items = inputMap
      .map((entry) => {
        const input = progressForm.querySelector(`[name="${entry.name}"]`);
        const file = input?.files?.[0] || null;
        return buildUploadPreviewCardMarkup(progressSelectionNode, { ...entry, file }, { variant: "portrait" });
      })
      .join("");

    progressSelectionNode.innerHTML = items || `<p class="dashboard-note">Selected file names will appear here before upload.</p>`;
  }

  async function handleProgressSubmit(event) {
    event.preventDefault();
    if (!progressForm) {
      return;
    }

    const supabase = window.legacyAuth?.getSupabaseClient?.();
    if (!supabase?.storage) {
      setInlineFeedback(progressFeedbackNode, "Supabase storage client is not available on this page.", true);
      return;
    }

    const formData = new FormData(progressForm);
    const frontFile = progressForm.querySelector('[name="frontPhoto"]')?.files?.[0] || null;
    const sideFile = progressForm.querySelector('[name="sidePhoto"]')?.files?.[0] || null;
    const backFile = progressForm.querySelector('[name="backPhoto"]')?.files?.[0] || null;
    const detailFile = progressForm.querySelector('[name="detailPhoto"]')?.files?.[0] || null;

    const validation = validateProgressFormFiles({
      frontPhoto: frontFile,
      sidePhoto: sideFile,
      backPhoto: backFile,
      detailPhoto: detailFile,
    });

    if (!validation.ok) {
      setProgressUploadState("error", { message: validation.errors[0] || "Check your photo selection and try again." });
      setInlineFeedback(progressFeedbackNode, validation.errors[0] || "Front, side, and back photos are all required.", true);
      return;
    }

    const uploadFiles = [
      { viewTag: "front", file: frontFile },
      { viewTag: "left", file: sideFile },
      { viewTag: "back", file: backFile },
      ...(detailFile ? [{ viewTag: "detail", file: detailFile }] : []),
    ];

    setProgressFormBusy(true);
    const preparingState = setProgressUploadState("prepare");
    setInlineFeedback(progressFeedbackNode, preparingState.message, false, true);

    let uploadBucket = "client-progress-photos";
    let uploadedPaths = [];
    let metadataSaved = false;

    try {
      const prepared = await plannerRequest("/.netlify/functions/prepare-progress-photo-upload", {
        method: "POST",
        body: {
          assets: uploadFiles.map((entry) => ({
            viewTag: entry.viewTag,
            fileName: entry.file.name,
            contentType: entry.file.type,
            fileSize: entry.file.size,
          })),
        },
      });

      const preparedAssets = Array.isArray(prepared?.assets) ? prepared.assets : [];
      uploadBucket = prepared.bucket || uploadBucket;
      if (preparedAssets.length !== uploadFiles.length) {
        throw new Error("The upload session did not return the expected number of signed upload slots.");
      }

      for (let index = 0; index < uploadFiles.length; index += 1) {
        const entry = uploadFiles[index];
        const preparedAsset = preparedAssets[index];
        const uploadState = setProgressUploadState("upload", {
          current: index + 1,
          total: uploadFiles.length,
        });
        setInlineFeedback(progressFeedbackNode, uploadState.message, false, true);
        const storagePath = preparedAsset.path || preparedAsset.storagePath;
        const { error } = await supabase.storage
          .from(uploadBucket)
          .uploadToSignedUrl(storagePath, preparedAsset.token, entry.file, {
            contentType: entry.file.type,
            upsert: false,
          });
        if (error) {
          throw error;
        }
        uploadedPaths.push(storagePath);
      }

      const savingState = setProgressUploadState("save");
      setInlineFeedback(progressFeedbackNode, savingState.message, false, true);

      const metadataResponse = await plannerRequest("/.netlify/functions/upload-progress-photo-metadata", {
        method: "POST",
        body: {
          capturedAt: toIsoFromLocalInput(String(formData.get("capturedAt") || "")),
          capturePeriod: formData.get("capturePeriod"),
          weightKg: formData.get("weightKg") ? Number(formData.get("weightKg")) : null,
          bodyFatPercent: formData.get("bodyFatPercent") ? Number(formData.get("bodyFatPercent")) : null,
          clientNote: formData.get("clientNote"),
          assets: preparedAssets.map((asset, index) => ({
            viewTag: asset.viewTag,
            storagePath: asset.storagePath || asset.path,
            fileName: asset.fileName || uploadFiles[index].file.name,
            contentType: asset.contentType || uploadFiles[index].file.type,
            sortOrder: index,
          })),
        },
      });
      metadataSaved = true;

      const aiLabel = formatAiEstimateLabel(metadataResponse?.entry || metadataResponse?.aiEstimate || null);
      const aiStatus = String(metadataResponse?.entry?.ai_body_fat_status || metadataResponse?.aiEstimate?.status || "").toLowerCase();
      const notificationSent = metadataResponse?.notificationSent !== false;
      const successMessage =
        aiStatus === "completed" && aiLabel
          ? `Progress photos uploaded, ${notificationSent ? "coach notified" : "coach notification pending"}, and ${aiLabel.toLowerCase()} is ready.`
          : aiStatus === "pending"
            ? `Progress photos uploaded, ${notificationSent ? "coach notified" : "coach notification pending"}, and AI estimate is processing.`
            : `Progress photos uploaded and ${notificationSent ? "coach notification sent." : "coach notification is pending retry."}`;

      const completeState = setProgressUploadState("complete", { message: successMessage });
      setInlineFeedback(progressFeedbackNode, completeState.message, false);
      progressForm.reset();
      if (progressCapturedAtNode) {
        progressCapturedAtNode.value = formatDateTimeLocalInput(new Date());
      }
      renderProgressSelection();
      try {
        await fetchPlannerData(true);
      } catch (refreshError) {
        setInlineFeedback(
          progressFeedbackNode,
          `${completeState.message} The feed could not refresh automatically, but your upload is already saved.`,
          false
        );
      }
    } catch (error) {
      if (uploadedPaths.length && !metadataSaved) {
        await cleanupClientUploadAssets(uploadedPaths, uploadBucket);
      }
      const failureState = setProgressUploadState("error", {
        message: error?.message || "Unable to upload the progress photos right now.",
      });
      setInlineFeedback(progressFeedbackNode, failureState.message, true);
    } finally {
      setProgressFormBusy(false);
    }
  }

  function renderAll() {
    const derived = deriveWorkspace();
    if (derived.selectedTrainingDay?.id) {
      state.selectedTrainingDayId = derived.selectedTrainingDay.id;
    }
    if (derived.selectedNutritionDay?.dayKey) {
      state.selectedNutritionDayKey = derived.selectedNutritionDay.dayKey;
    }
    renderMetrics(derived);
    renderAssignmentSummary(derived);
    renderDayFocus(derived);
    buildClientTrainingCalendar(derived);
    renderTrainingDetail(derived);
    renderNutritionSummary(derived);
    renderNutritionPlanOptions(derived);
    buildNutritionCalendar(derived);
    renderNutritionDayDetail(derived);
    syncNutritionDates(derived.selectedNutritionDay, false);
    renderHabitList(derived);
    renderNutritionFeed(derived);
    renderQuickPickRows(derived);
    renderFoodSearchResults();
    renderBarcodeResult();
    renderMealBuilder();
    renderMealFeed(derived);
    renderMealPhotoSelection();
    renderNutritionPhotoFeed(derived);
    renderHealthSummary(derived);
    renderCheckinTemplateOptions(derived);
    renderQuestionStack(derived);
    renderCheckinFeed(derived);
    renderProgressFeed(derived);
    renderProgressSummary(derived);
    setActiveNutritionWorkspace(state.activeNutritionWorkspace);
  }

  async function handleWorkoutAction(button) {
    const form = button.closest("[data-workout-form]");
    const dayId = form?.dataset.workoutForm;
    const feedbackNode = dayId ? document.querySelector(`[data-workout-feedback="${dayId}"]`) : null;
    const logStatus = button.dataset.workoutLogStatus;
    if (!form || !dayId || !logStatus) {
      return;
    }

    button.disabled = true;
    setInlineFeedback(feedbackNode, "Submitting training update...", false);

    try {
      const adherenceScore = form.querySelector('[name="adherenceScore"]')?.value || "";
      const clientFeedback = form.querySelector('[name="clientFeedback"]')?.value || "";
      await plannerRequest("/.netlify/functions/log-planner-completion", {
        method: "POST",
        body: {
          type: "workout_log",
          clientProgramDayId: dayId,
          logStatus,
          adherenceScore: adherenceScore ? Number(adherenceScore) : null,
          clientFeedback,
        },
      });
      setInlineFeedback(feedbackNode, `Training day marked ${toTitleCase(logStatus)}. Your coach was notified.`, false);
      await fetchPlannerData(true);
    } catch (error) {
      setInlineFeedback(feedbackNode, error?.message || "Unable to submit the training log right now.", true);
    } finally {
      button.disabled = false;
    }
  }

  function collectTrainingDayExerciseLogs(form) {
    if (!form) {
      return [];
    }

    return Array.from(form.querySelectorAll("tbody tr"))
      .map((row, index) => {
        const clientProgramDayExerciseId = row.querySelector('[name="exerciseId"]')?.value || "";
        if (!clientProgramDayExerciseId) {
          return null;
        }

        const completedSets = row.querySelector('[name="completedSets"]')?.value || "";
        const completedReps = row.querySelector('[name="completedReps"]')?.value || "";
        const loggedRpe = row.querySelector('[name="loggedRpe"]')?.value || "";
        const exerciseNote = row.querySelector('[name="exerciseNote"]')?.value || "";

        return {
          clientProgramDayExerciseId,
          sortOrder: index,
          completedSets: completedSets ? Number(completedSets) : null,
          completedReps: completedReps ? Number(completedReps) : null,
          loggedRpe: loggedRpe ? Number(loggedRpe) : null,
          exerciseNote,
        };
      })
      .filter(Boolean);
  }

  async function handleTrainingDaySave(button) {
    const form = button.closest("[data-training-day-form]");
    const dayId = form?.dataset.trainingDayForm;
    const feedbackNode = dayId ? document.querySelector(`[data-training-day-feedback="${dayId}"]`) : null;
    if (!form || !dayId) {
      return;
    }

    button.disabled = true;
    setInlineFeedback(feedbackNode, "Saving the training sheet...", false);

    try {
      const formData = new FormData(form);
      await plannerRequest("/.netlify/functions/log-planner-completion", {
        method: "POST",
        body: {
          type: "workout_log",
          clientProgramDayId: dayId,
          logStatus: String(formData.get("logStatus") || "completed"),
          clientFeedback: String(formData.get("clientFeedback") || "").trim(),
          exerciseLogs: collectTrainingDayExerciseLogs(form),
        },
      });
      setInlineFeedback(feedbackNode, "Training sheet saved and sent to your coach for review.", false);
      await fetchPlannerData(true);
    } catch (error) {
      setInlineFeedback(feedbackNode, error?.message || "Unable to save the training sheet right now.", true);
    } finally {
      button.disabled = false;
    }
  }

  async function handleNutritionSubmit(event) {
    event.preventDefault();
    if (!nutritionForm) {
      return;
    }

    const formData = new FormData(nutritionForm);
    const nutritionPlanId = String(nutritionPlanNode?.value || "").trim();
    if (!nutritionPlanId) {
      setInlineFeedback(nutritionFeedbackNode, "Choose the nutrition plan you are logging against.", true);
      return;
    }

    const releaseSubmit = setFormSubmitBusy(nutritionForm, "Submitting Nutrition...");
    setInlineFeedback(nutritionFeedbackNode, "Submitting nutrition log...", false);

    try {
      await plannerRequest("/.netlify/functions/log-planner-completion", {
        method: "POST",
        body: {
          type: "nutrition_log",
          nutritionPlanId,
          logDate: formData.get("logDate"),
          status: formData.get("status"),
          balancedMealsCount: Number(formData.get("balancedMealsCount") || 0),
          hydrationTargetHit: formData.get("hydrationTargetHit") === "on",
          proteinTargetHit: formData.get("proteinTargetHit") === "on",
          mealPrepCompleted: formData.get("mealPrepCompleted") === "on",
          caloriesLogged: formData.get("caloriesLogged") ? Number(formData.get("caloriesLogged")) : null,
          proteinLoggedG: formData.get("proteinLoggedG") ? Number(formData.get("proteinLoggedG")) : null,
          note: formData.get("note"),
        },
      });
      setInlineFeedback(nutritionFeedbackNode, "Nutrition log submitted and coach notification sent.", false);
      nutritionForm.reset();
      nutritionDateNode.value = formatDateOnlyInput();
      renderNutritionPlanOptions(deriveWorkspace());
      try {
        await fetchPlannerData(true);
      } catch (_) {
        setInlineFeedback(
          nutritionFeedbackNode,
          "Nutrition log submitted and coach notification sent. The page could not refresh automatically, but your log is saved.",
          false
        );
      }
    } catch (error) {
      setInlineFeedback(nutritionFeedbackNode, error?.message || "Unable to submit the nutrition log right now.", true);
    } finally {
      releaseSubmit();
    }
  }

  async function searchFoodLibrary(query) {
    const searchText = String(query || "").trim();
    if (foodSearchNode) {
      foodSearchNode.value = searchText;
    }

    setInlineFeedback(mealFeedbackNode, searchText ? "Searching the food library..." : "Loading starter foods...", false);
    try {
      const params = new URLSearchParams();
      if (searchText) {
        params.set("q", searchText);
      }
      params.set("limit", "12");
      const response = await plannerRequest(`/.netlify/functions/search-food-library?${params.toString()}`);
      state.foodSearchResults = Array.isArray(response?.foods) ? response.foods : [];
      state.externalFoodSearchResults = Array.isArray(response?.externalFoods)
        ? response.externalFoods.map((food) => normalizeProviderFoodForBuilder(food)).filter(Boolean)
        : [];
      const fatsecretState = String(response?.providers?.fatsecretState || "").toLowerCase();
      renderFoodSearchResults();
      setInlineFeedback(
        mealFeedbackNode,
        fatsecretState === "blocked"
          ? `${formatCount(state.foodSearchResults.length)} library result${state.foodSearchResults.length === 1 ? "" : "s"} ready. External packaged-food lookup is currently blocked by the provider, so the planner is using the internal library only.`
          : state.foodSearchResults.length || state.externalFoodSearchResults.length
          ? `${formatCount(state.foodSearchResults.length)} library result${state.foodSearchResults.length === 1 ? "" : "s"} ready${state.externalFoodSearchResults.length ? `, plus ${formatCount(state.externalFoodSearchResults.length)} external match${state.externalFoodSearchResults.length === 1 ? "" : "es"}` : ""}.`
          : fatsecretState === "degraded"
            ? "The LEGACY library is available, but external packaged-food search is degraded right now."
            : "No foods matched that search yet.",
        !(state.foodSearchResults.length || state.externalFoodSearchResults.length) && fatsecretState !== "blocked"
      );
    } catch (error) {
      state.foodSearchResults = [];
      state.externalFoodSearchResults = [];
      renderFoodSearchResults();
      setInlineFeedback(mealFeedbackNode, error?.message || "Unable to search the food library right now.", true);
    }
  }

  function updateMealBuilderItem(localId, field, value) {
    state.mealBuilderItems = state.mealBuilderItems.map((item) => {
      if (item.localId !== localId) {
        return item;
      }

      const nextItem = {
        ...item,
        [field]:
          field === "quantity" || field === "grams"
            ? Number(value || 0)
            : value,
      };
      return recalculateMealBuilderItem(nextItem);
    });
    renderMealBuilder();
  }

  function addFoodToMealBuilder(foodId) {
    const derived = deriveWorkspace();
    const food =
      state.foodSearchResults.find((entry) => entry.id === foodId)
      || state.externalFoodSearchResults.find((entry) => entry.id === foodId)
      || (derived.favoriteFoods || []).find((entry) => entry.id === foodId)
      || (derived.recentFoods || []).map((entry) => entry.food).find((entry) => entry?.id === foodId)
      || (state.barcodeLookup?.foodRecord?.id === foodId ? state.barcodeLookup.foodRecord : null)
      || derived.catalogFoodById.get(foodId)
      || null;
    if (!food) {
      return;
    }
    state.mealBuilderItems = [...state.mealBuilderItems, buildMealBuilderItemFromFood(food)];
    renderMealBuilder();
    setInlineFeedback(mealFeedbackNode, `${food.name} added to the meal builder.`, false);
  }

  function addRecipeToMealBuilder(recipeId) {
    const derived = deriveWorkspace();
    const recipe = (derived.recipes || []).find((entry) => entry.id === recipeId);
    if (!recipe) {
      return;
    }

    const recipeItems = buildRecipeMealItems(derived, recipeId);
    if (!recipeItems.length) {
      setInlineFeedback(mealFeedbackNode, "This recipe is missing ingredient mappings right now.", true);
      return;
    }

    state.mealBuilderItems = [...state.mealBuilderItems, ...recipeItems];
    renderMealBuilder();
    setInlineFeedback(mealFeedbackNode, `${recipe.title} expanded into your meal builder.`, false);
  }

  function removeMealBuilderItem(localId) {
    state.mealBuilderItems = state.mealBuilderItems.filter((item) => item.localId !== localId);
    renderMealBuilder();
  }

  function loadMealPhotoImage(sourceUrl) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Unable to read the selected meal photo."));
      image.src = sourceUrl;
    });
  }

  async function normalizeMealPhotoUpload(file) {
    if (!(file instanceof File)) {
      throw new Error("A valid meal photo file is required.");
    }

    if (file.type === "image/jpeg") {
      return file;
    }

    const objectUrl = URL.createObjectURL(file);
    try {
      const image = await loadMealPhotoImage(objectUrl);
      const sourceWidth = image.naturalWidth || image.width || 1;
      const sourceHeight = image.naturalHeight || image.height || 1;
      const longestEdge = Math.max(sourceWidth, sourceHeight);
      const scale = longestEdge > 1920 ? 1920 / longestEdge : 1;
      const targetWidth = Math.max(1, Math.round(sourceWidth * scale));
      const targetHeight = Math.max(1, Math.round(sourceHeight * scale));

      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const context = canvas.getContext("2d", { alpha: false });
      if (!context) {
        throw new Error("Canvas conversion is not available in this browser.");
      }

      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, targetWidth, targetHeight);
      context.drawImage(image, 0, 0, targetWidth, targetHeight);

      const jpegBlob = await new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
            return;
          }
          reject(new Error("Unable to convert the selected meal photo."));
        }, "image/jpeg", 0.92);
      });

      const baseName = String(file.name || "meal-photo").replace(/\.[^.]+$/u, "") || "meal-photo";
      return new File([jpegBlob], `${baseName}.jpg`, {
        type: "image/jpeg",
        lastModified: Date.now(),
      });
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }

  async function toggleFavoriteFood(foodId, active) {
    try {
      await plannerRequest("/.netlify/functions/toggle-food-favorite", {
        method: "POST",
        body: {
          foodId,
          active,
        },
      });
      await fetchPlannerData(true);
      searchFoodLibrary(foodSearchNode?.value || "").catch(() => null);
    } catch (error) {
      setInlineFeedback(mealFeedbackNode, error?.message || "Unable to update favorites right now.", true);
    }
  }

  async function handleBarcodeLookup() {
    const barcode = String(barcodeNode?.value || "").replace(/\s+/gu, "");
    if (!barcode) {
      state.barcodeLookup = {
        barcode: "",
        providerState: "unavailable",
        message: "Enter a barcode first.",
        foodRecord: null,
      };
      renderBarcodeResult();
      return;
    }

    state.barcodeLookup = {
      barcode,
      providerState: "ready",
      message: "Checking the packaged-food provider...",
      foodRecord: null,
    };
    renderBarcodeResult();

    try {
      const response = await plannerRequest("/.netlify/functions/lookup-food-barcode", {
        method: "POST",
        body: { barcode },
      });

      const importedFoodRecord = response?.importedFood
        ? normalizeProviderFoodForBuilder({
            id: response.importedFood.id,
            name: response.importedFood.name,
            brandName: response.importedFood.brand_name,
            foodGroup: response.importedFood.food_group,
            countryCode: response.importedFood.country_code,
            dataSource: response.importedFood.data_source,
            servingBasisG: response.importedFood.serving_basis_g,
            caloriesKcal: response.importedFood.calories_kcal,
            proteinG: response.importedFood.protein_g,
            carbsG: response.importedFood.carbs_g,
            fatG: response.importedFood.fat_g,
            fiberG: response.importedFood.fiber_g,
            sugarG: response.importedFood.sugar_g,
            sodiumMg: response.importedFood.sodium_mg,
            servings: response.servings || [],
          })
        : response?.food
          ? normalizeProviderFoodForBuilder(response.food)
          : null;

      state.barcodeLookup = {
        barcode: response?.barcode || barcode,
        providerState: response?.providerState || (response?.food ? "healthy" : "ready"),
        message: response?.message || "Barcode lookup completed.",
        foodRecord: importedFoodRecord,
      };

      if (response?.importedFood?.id) {
        await fetchPlannerData(true);
      }

      renderBarcodeResult();
      setInlineFeedback(
        mealFeedbackNode,
        importedFoodRecord
          ? `${importedFoodRecord.name} is ready to add into the meal diary.`
          : (response?.message || "No food match was returned for this barcode."),
        !importedFoodRecord
      );
    } catch (error) {
      state.barcodeLookup = {
        barcode,
        providerState: "error",
        message: error?.message || "Unable to look up that barcode right now.",
        foodRecord: null,
      };
      renderBarcodeResult();
      setInlineFeedback(mealFeedbackNode, error?.message || "Unable to look up that barcode right now.", true);
    }
  }

  async function handleMealSubmit(event) {
    event.preventDefault();
    if (!mealForm) {
      return;
    }

    if (!state.mealBuilderItems.length) {
      setInlineFeedback(mealFeedbackNode, "Add at least one food before saving the meal.", true);
      return;
    }

    const formData = new FormData(mealForm);
    const releaseSubmit = setFormSubmitBusy(mealForm, "Saving Meal...");
    setInlineFeedback(mealFeedbackNode, "Saving meal entry...", false);

    try {
      await plannerRequest("/.netlify/functions/save-client-meal-entry", {
        method: "POST",
        body: {
          logDate: formData.get("logDate"),
          mealType: formData.get("mealType"),
          nutritionPlanId: nutritionPlanNode?.value || "",
          title: formData.get("title"),
          note: formData.get("note"),
          sourceType: state.activeNutritionPhotoSubmissionId ? "photo" : "manual",
          nutritionPhotoSubmissionId: state.activeNutritionPhotoSubmissionId || null,
          items: state.mealBuilderItems.map((item) => ({
            foodId: item.foodId,
            servingId: item.servingId || null,
            quantity: item.quantity,
            grams: item.grams,
            itemName: item.name,
            note: item.note || "",
            externalFood: item.externalFood || null,
          })),
        },
      });

      setInlineFeedback(mealFeedbackNode, "Meal entry saved and coach review notified.", false);
      mealForm.reset();
      state.mealBuilderItems = [];
      state.activeNutritionPhotoSubmissionId = "";
      renderMealBuilder();
      mealDateNode.value = formatDateOnlyInput();
      renderNutritionPlanOptions(deriveWorkspace());
      try {
        await fetchPlannerData(true);
      } catch (_) {
        setInlineFeedback(
          mealFeedbackNode,
          "Meal entry saved and coach review notified. The page could not refresh automatically, but your meal is saved.",
          false
        );
      }
      searchFoodLibrary("").catch(() => null);
    } catch (error) {
      setInlineFeedback(mealFeedbackNode, error?.message || "Unable to save the meal entry right now.", true);
    } finally {
      releaseSubmit();
    }
  }

  async function handleMealPhotoSubmit(event) {
    event.preventDefault();
    if (!photoForm) {
      return;
    }

    const supabase = window.legacyAuth?.getSupabaseClient?.();
    if (!supabase?.storage) {
      setInlineFeedback(photoFeedbackNode, "Supabase storage client is not available on this page.", true);
      return;
    }

    const mainPhoto = photoForm.querySelector('[name="mealPhoto"]')?.files?.[0] || null;
    const secondaryPhoto = photoForm.querySelector('[name="secondaryPhoto"]')?.files?.[0] || null;
    const detailPhoto = photoForm.querySelector('[name="detailPhoto"]')?.files?.[0] || null;
    if (!mainPhoto) {
      setInlineFeedback(photoFeedbackNode, "At least one meal photo is required.", true);
      return;
    }

    const formData = new FormData(photoForm);
    const releaseSubmit = setFormSubmitBusy(photoForm, "Uploading Meal Photo...");
    setInlineFeedback(photoFeedbackNode, "Preparing secure meal-photo upload...", false);

    try {
      const uploadFiles = await Promise.all([
        { viewTag: "meal", file: mainPhoto },
        ...(secondaryPhoto ? [{ viewTag: "secondary", file: secondaryPhoto }] : []),
        ...(detailPhoto ? [{ viewTag: "detail", file: detailPhoto }] : []),
      ].map(async (entry) => ({
        viewTag: entry.viewTag,
        originalFile: entry.file,
        file: await normalizeMealPhotoUpload(entry.file),
      })));

      const prepared = await plannerRequest("/.netlify/functions/prepare-nutrition-photo-upload", {
        method: "POST",
        body: {
          assets: uploadFiles.map((entry) => ({
            viewTag: entry.viewTag,
            fileName: entry.file.name,
            contentType: entry.file.type,
            fileSize: entry.file.size,
          })),
        },
      });

      const preparedAssets = Array.isArray(prepared?.assets) ? prepared.assets : [];
      if (preparedAssets.length !== uploadFiles.length) {
        throw new Error("The upload session did not return the expected number of meal-photo upload slots.");
      }

      setInlineFeedback(photoFeedbackNode, "Uploading meal photos to the private nutrition bucket...", false);

      const uploadBucket = prepared.bucket || "client-meal-photos";
      const uploadedPaths = [];

      try {
        for (let index = 0; index < uploadFiles.length; index += 1) {
          const entry = uploadFiles[index];
          const preparedAsset = preparedAssets[index];
          const storagePath = preparedAsset.path || preparedAsset.storagePath;
          const { error } = await supabase.storage
            .from(uploadBucket)
            .uploadToSignedUrl(storagePath, preparedAsset.token, entry.file, {
              contentType: entry.file.type,
              upsert: false,
            });
          if (error) {
            throw error;
          }
          uploadedPaths.push(storagePath);
        }

        setInlineFeedback(photoFeedbackNode, "Analyzing the meal photo and generating candidate foods...", false);

        await plannerRequest("/.netlify/functions/submit-nutrition-photo-log", {
          method: "POST",
          body: {
            logDate: formData.get("logDate"),
            mealType: formData.get("mealType"),
            nutritionPlanId: nutritionPlanNode?.value || "",
            mealTitle: formData.get("mealTitle"),
            clientNote: formData.get("clientNote"),
            correctionNote: formData.get("correctionNote"),
            bucket: uploadBucket,
            assets: preparedAssets.map((asset, index) => ({
              viewTag: asset.viewTag,
              storagePath: asset.storagePath || asset.path,
              fileName: asset.fileName || uploadFiles[index].file.name || uploadFiles[index].originalFile?.name || "",
              contentType: asset.contentType || uploadFiles[index].file.type || uploadFiles[index].originalFile?.type || "",
              sortOrder: index,
            })),
          },
        });
      } catch (error) {
        if (uploadedPaths.length) {
          await cleanupClientUploadAssets(uploadedPaths, uploadBucket);
        }
        throw error;
      }

      setInlineFeedback(photoFeedbackNode, "Meal photo analyzed. Review the suggestions and push the selected foods into the meal diary when ready.", false);
      photoForm.reset();
      if (photoDateNode) {
        photoDateNode.value = formatDateOnlyInput();
      }
      renderMealPhotoSelection();
      try {
        await fetchPlannerData(true);
      } catch (_) {
        setInlineFeedback(
          photoFeedbackNode,
          "Meal photo analyzed. The page could not refresh automatically, but the submission is saved.",
          false
        );
      }
    } catch (error) {
      setInlineFeedback(photoFeedbackNode, error?.message || "Unable to analyze the meal photo right now.", true);
    } finally {
      releaseSubmit();
    }
  }

  async function rerunMealPhotoAssist(submissionId, feedbackNode, correctionNote) {
    setInlineFeedback(feedbackNode, "Refreshing meal-photo suggestions...", false);
    try {
      await plannerRequest("/.netlify/functions/save-nutrition-photo-corrections", {
        method: "POST",
        body: {
          submissionId,
          correctionNote,
        },
      });
      setInlineFeedback(feedbackNode, "Meal-photo suggestions refreshed. Review the new candidates before building the meal.", false);
      await fetchPlannerData(true);
    } catch (error) {
      setInlineFeedback(feedbackNode, error?.message || "Unable to refresh the meal-photo suggestions right now.", true);
    }
  }

  function buildMealFromPhotoSubmission(submissionId, cardNode) {
    const derived = deriveWorkspace();
    const submission = (derived.nutritionPhotoSubmissions || []).find((entry) => entry.id === submissionId);
    if (!submission) {
      return;
    }

    const feedbackNode = cardNode?.querySelector(`[data-photo-feedback="${submissionId}"]`) || null;
    const nextItems = buildMealBuilderItemsFromPhotoSubmission(derived, submissionId, cardNode);
    if (!nextItems.length) {
      setInlineFeedback(feedbackNode, "Select at least one matched candidate before building the meal.", true);
      return;
    }

    state.mealBuilderItems = [...state.mealBuilderItems, ...nextItems];
    state.activeNutritionPhotoSubmissionId = submissionId;
    renderMealBuilder();
    setActiveNutritionWorkspace("meals");

    if (mealDateNode) {
      mealDateNode.value = submission.log_date || formatDateOnlyInput();
    }
    if (nutritionPlanNode && submission.nutrition_plan_id) {
      nutritionPlanNode.value = submission.nutrition_plan_id;
      renderNutritionSummary(derived);
      renderHabitList(derived);
      renderNutritionFeed(derived);
      renderMealFeed(derived);
      renderNutritionPhotoFeed(derived);
    }
    if (mealForm) {
      const mealTypeField = mealForm.querySelector('[name="mealType"]');
      const titleField = mealForm.querySelector('[name="title"]');
      const noteField = mealForm.querySelector('[name="note"]');
      if (mealTypeField && submission.meal_type) {
        mealTypeField.value = submission.meal_type;
      }
      if (titleField && submission.meal_title) {
        titleField.value = submission.meal_title;
      }
      if (noteField && (submission.client_note || submission.correction_note)) {
        noteField.value = [submission.client_note, submission.correction_note].filter(Boolean).join(" | ");
      }
    }

    setInlineFeedback(
      feedbackNode,
      `${nextItems.length} suggested item${nextItems.length === 1 ? "" : "s"} moved into the meal diary builder. Save the meal entry when it looks right.`,
      false
    );
    setInlineFeedback(
      mealFeedbackNode,
      `${submission.meal_title || "Photo meal"} is now linked to the meal diary builder. Saving the meal will keep the photo submission attached.`,
      false
    );
  }

  async function collectCheckinAnswers() {
    const answers = [];

    for (const node of Array.from(document.querySelectorAll("[data-question-card]"))) {
      const input = node.querySelector("[data-question-input]");
      if (!input) {
        continue;
      }

      const questionId = node.dataset.questionId || "";
      const fieldKey = node.dataset.fieldKey || "";
      const questionType = node.dataset.questionType || "text";
      const answer = {
        questionId,
        fieldKey,
      };

      if (questionType === "boolean") {
        answer.valueBoolean = Boolean(input.checked);
      } else if (questionType === "number" || questionType === "rating") {
        if (input.value !== "") {
          answer.valueNumber = Number(input.value);
        }
      } else if (questionType === "date") {
        if (input.value) {
          answer.valueDate = input.value;
        }
      } else if (questionType === "multi_select") {
        const values = Array.from(input.selectedOptions || []).map((option) => option.value).filter(Boolean);
        if (values.length) {
          answer.valueJson = values;
          answer.valueText = values.join(", ");
        }
      } else if (questionType === "photo") {
        const noteValue = String(node.querySelector("[data-question-photo-note]")?.value || "").trim();
        const files = Array.from(input.files || []).slice(0, 4);
        if (files.length) {
          const uploadedAssets = await uploadPlannerAssets(
            files.map((file) => ({ viewTag: "detail", file })),
            checkinFeedbackNode,
            {
              prepare: "Preparing secure upload for your health-update photos...",
              upload: "Uploading your health-update photos...",
            }
          );
          answer.valueText = noteValue || `${uploadedAssets.length} photo${uploadedAssets.length === 1 ? "" : "s"} uploaded`;
          answer.valueJson = {
            note: noteValue,
            assets: uploadedAssets,
          };
        } else if (noteValue) {
          answer.valueText = noteValue;
          answer.valueJson = {
            note: noteValue,
            assets: [],
          };
        }
      } else {
        if (input.value) {
          answer.valueText = input.value;
        }
      }

      answers.push(answer);
    }

    return answers;
  }

  async function handleCheckinSubmit(event) {
    event.preventDefault();
    if (!checkinForm) {
      return;
    }

    const formData = new FormData(checkinForm);
    const templateId = String(formData.get("templateId") || "").trim();
    if (!templateId) {
      setInlineFeedback(checkinFeedbackNode, "Choose the health template you are submitting.", true);
      return;
    }

    const releaseSubmit = setFormSubmitBusy(checkinForm, "Submitting Check-In...");
    let answers = [];
    setInlineFeedback(checkinFeedbackNode, "Submitting health update...", false);

    try {
      answers = await collectCheckinAnswers();
      await plannerRequest("/.netlify/functions/submit-client-checkin", {
        method: "POST",
        body: {
          checkinId: state.selectedCheckinTemplateId ? deriveWorkspace().openCheckinByTemplateId.get(state.selectedCheckinTemplateId)?.id || null : null,
          templateId,
          dueAt: toIsoFromLocalInput(String(formData.get("dueAt") || "")),
          overallAdherenceScore: formData.get("overallAdherenceScore")
            ? Number(formData.get("overallAdherenceScore"))
            : null,
          answers,
        },
      });
      setInlineFeedback(checkinFeedbackNode, "Health update submitted and coach notification sent.", false);
      checkinForm.reset();
      checkinDueNode.value = formatDateTimeLocalInput(new Date(Date.now() + 3600000));
      state.selectedCheckinTemplateId = resolveSelectedTemplateId(state.data.checkinTemplates || []);
      try {
        await fetchPlannerData(true);
      } catch (_) {
        setInlineFeedback(
          checkinFeedbackNode,
          "Health update submitted and coach notification sent. The page could not refresh automatically, but your update is saved.",
          false
        );
      }
    } catch (error) {
      const uploadedPaths = collectUploadedAnswerAssetPaths(answers);
      if (uploadedPaths.length) {
        await cleanupClientUploadAssets(uploadedPaths, "client-progress-photos");
      }
      setInlineFeedback(checkinFeedbackNode, error?.message || "Unable to submit the health update right now.", true);
    } finally {
      releaseSubmit();
    }
  }

  async function initRealtime() {
    const { access, supabase } = await loadAccessAndClient();
    if (!supabase?.channel) {
      return;
    }

    if (state.realtimeChannel) {
      supabase.removeChannel(state.realtimeChannel);
      state.realtimeChannel = null;
    }

    const clientId = access.user.id;
    const channel = supabase.channel(`client-planner:${clientId}`);
    const tableFilters = [
      { table: "client_program_assignments", filter: `client_id=eq.${clientId}` },
      { table: "client_workout_logs", filter: `client_id=eq.${clientId}` },
      { table: "client_workout_exercise_logs" },
      { table: "client_nutrition_plans", filter: `client_id=eq.${clientId}` },
      { table: "client_nutrition_logs", filter: `client_id=eq.${clientId}` },
      { table: "client_meal_entries", filter: `client_id=eq.${clientId}` },
      { table: "client_meal_items", filter: `client_id=eq.${clientId}` },
      { table: "nutrition_photo_submissions", filter: `client_id=eq.${clientId}` },
      { table: "nutrition_photo_assets" },
      { table: "nutrition_photo_candidates" },
      { table: "client_food_favorites", filter: `client_id=eq.${clientId}` },
      { table: "client_food_recent", filter: `client_id=eq.${clientId}` },
      { table: "client_checkins", filter: `client_id=eq.${clientId}` },
      { table: "progress_photo_entries", filter: `client_id=eq.${clientId}` },
      { table: "recipe_library" },
      { table: "recipe_ingredients" },
      { table: "planner_reward_events", filter: `client_id=eq.${clientId}` },
    ];

    tableFilters.forEach((entry) => {
      channel.on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: entry.table,
          ...(entry.filter ? { filter: entry.filter } : {}),
        },
        () => {
          queueRefresh();
        }
      );
    });

    channel.subscribe();
    state.realtimeChannel = channel;
  }

  function bindEvents() {
    tabNodes.forEach((tabNode) => {
      tabNode.addEventListener("click", () => {
        setActivePanel(tabNode.dataset.clientPlannerTab || "training");
      });
    });

    plannerGuideToggleNodes.forEach((buttonNode) => {
      buttonNode.addEventListener("click", () => {
        const guideKey = buttonNode.dataset.plannerGuideToggle || "";
        if (!guideKey) {
          return;
        }
        const isOpen = buttonNode.getAttribute("aria-expanded") === "true";
        setPlannerGuidePanelState(guideKey, !isOpen);
      });
    });

    trainingCalendarNode?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-training-day-select]");
      if (!button) {
        return;
      }
      state.selectedTrainingDayId = button.dataset.trainingDaySelect || "";
      const derived = deriveWorkspace();
      renderDayFocus(derived);
      buildClientTrainingCalendar(derived);
      renderTrainingDetail(derived);
    });

    trainingDetailNode?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-training-day-save]");
      if (!button) {
        return;
      }
      handleTrainingDaySave(button).catch(() => null);
    });

    nutritionForm?.addEventListener("submit", handleNutritionSubmit);
    nutritionPlanNode?.addEventListener("change", () => {
      state.selectedNutritionDayKey = "";
      const derived = deriveWorkspace();
      syncNutritionDates(derived.selectedNutritionDay, true);
      renderNutritionSummary(derived);
      buildNutritionCalendar(derived);
      renderNutritionDayDetail(derived);
      renderHabitList(derived);
      renderNutritionFeed(derived);
      renderMealFeed(derived);
      renderNutritionPhotoFeed(derived);
      setInlineFeedback(mealFeedbackNode, "", false);
      setInlineFeedback(photoFeedbackNode, "", false);
    });
    nutritionCalendarNode?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-nutrition-day-select]");
      if (!button) {
        return;
      }
      state.selectedNutritionDayKey = button.dataset.nutritionDaySelect || "";
      const derived = deriveWorkspace();
      syncNutritionDates(derived.selectedNutritionDay, true);
      renderNutritionSummary(derived);
      buildNutritionCalendar(derived);
      renderNutritionDayDetail(derived);
    });
    nutritionDayDetailNode?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-open-nutrition-workspace]");
      if (!button) {
        return;
      }
      setActiveNutritionWorkspace(button.dataset.openNutritionWorkspace || "adherence");
    });
    nutritionWorkspaceTabNodes.forEach((tabNode) => {
      tabNode.addEventListener("click", () => {
        setActiveNutritionWorkspace(tabNode.dataset.clientNutritionWorkspace || "adherence");
      });
    });
    mealEntryToggleButton?.addEventListener("click", () => {
      const isOpen = mealEntryToggleButton.getAttribute("aria-expanded") === "true";
      if (isOpen) {
        setMealEntryDisclosure(false);
        return;
      }
      setMealEntryDisclosure(true);
    });
    mealEntryModeButtonNodes.forEach((buttonNode) => {
      buttonNode.addEventListener("click", () => {
        setActiveMealEntryMode(buttonNode.dataset.mealEntryMode || "search");
      });
    });
    mealForm?.addEventListener("submit", handleMealSubmit);
    photoForm?.addEventListener("submit", handleMealPhotoSubmit);
    photoForm?.addEventListener("change", (event) => {
      if (event.target.matches('input[type="file"]')) {
        renderMealPhotoSelection();
      }
    });
    foodSearchButton?.addEventListener("click", () => {
      setActiveNutritionWorkspace("meals");
      setActiveMealEntryMode("search");
      searchFoodLibrary(foodSearchNode?.value || "").catch(() => null);
    });
    foodSearchNode?.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        setActiveNutritionWorkspace("meals");
        setActiveMealEntryMode("search");
        searchFoodLibrary(foodSearchNode.value || "").catch(() => null);
      }
    });
    barcodeButton?.addEventListener("click", () => {
      setActiveNutritionWorkspace("meals");
      setActiveMealEntryMode("barcode");
      handleBarcodeLookup().catch(() => null);
    });
    barcodeCameraButton?.addEventListener("click", () => {
      setActiveNutritionWorkspace("meals");
      setActiveMealEntryMode("barcode");
      startBarcodeCameraScanner().catch(() => null);
    });
    barcodeStopButton?.addEventListener("click", () => {
      stopBarcodeScanner();
      setBarcodeFeedback("Camera scanner stopped. You can still type the barcode or scan from a photo.", false);
    });
    barcodePhotoButton?.addEventListener("click", () => {
      setActiveNutritionWorkspace("meals");
      setActiveMealEntryMode("barcode");
      barcodePhotoInput?.click();
    });
    barcodePhotoInput?.addEventListener("change", () => {
      const file = barcodePhotoInput.files?.[0] || null;
      renderBarcodePhotoSelection(file);
      if (!file) {
        return;
      }
      scanBarcodeFromFile(file).catch(() => null);
    });
    barcodeNode?.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        setActiveNutritionWorkspace("meals");
        setActiveMealEntryMode("barcode");
        handleBarcodeLookup().catch(() => null);
      }
    });
    foodSearchResultsNode?.addEventListener("click", (event) => {
      const addFoodButton = event.target.closest("[data-meal-add-food]");
      if (addFoodButton) {
        addFoodToMealBuilder(addFoodButton.dataset.mealAddFood || "");
        return;
      }

      const favoriteButton = event.target.closest("[data-toggle-favorite]");
      if (!favoriteButton) {
        return;
      }
      toggleFavoriteFood(
        favoriteButton.dataset.toggleFavorite || "",
        favoriteButton.dataset.favoriteActive !== "true"
      ).catch(() => null);
    });
    barcodeResultNode?.addEventListener("click", (event) => {
      const addButton = event.target.closest("[data-barcode-add-food]");
      if (!addButton) {
        return;
      }
      addFoodToMealBuilder(addButton.dataset.barcodeAddFood || "");
    });
    favoriteFoodsNode?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-meal-add-food]");
      if (!button) {
        return;
      }
      addFoodToMealBuilder(button.dataset.mealAddFood || "");
    });
    recentFoodsNode?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-add-recent-food]");
      if (!button) {
        return;
      }
      addFoodToMealBuilder(button.dataset.addRecentFood || "");
    });
    recipePicksNode?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-add-recipe]");
      if (!button) {
        return;
      }
      addRecipeToMealBuilder(button.dataset.addRecipe || "");
    });
    mealBuilderNode?.addEventListener("input", (event) => {
      const target = event.target;
      const card = target.closest("[data-meal-item-id]");
      const field = target.dataset.mealItemField;
      if (!card || !field) {
        return;
      }
      updateMealBuilderItem(card.dataset.mealItemId || "", field, target.value);
    });
    mealBuilderNode?.addEventListener("change", (event) => {
      const target = event.target;
      const card = target.closest("[data-meal-item-id]");
      const field = target.dataset.mealItemField;
      if (!card || !field) {
        return;
      }
      updateMealBuilderItem(card.dataset.mealItemId || "", field, target.value);
    });
    mealBuilderNode?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-remove-meal-item]");
      if (!button) {
        return;
      }
      removeMealBuilderItem(button.dataset.removeMealItem || "");
    });
    photoFeedNode?.addEventListener("click", (event) => {
      const searchButton = event.target.closest("[data-photo-candidate-search]");
      if (searchButton) {
        const query = searchButton.dataset.photoCandidateSearch || "";
        setActiveNutritionWorkspace("meals");
        setActiveMealEntryMode("search");
        if (foodSearchNode) {
          foodSearchNode.focus();
        }
        searchFoodLibrary(query).catch(() => null);
        return;
      }

      const rerunButton = event.target.closest("[data-rerun-photo-assist]");
      if (rerunButton) {
        const submissionId = rerunButton.dataset.rerunPhotoAssist || "";
        const cardNode = rerunButton.closest("[data-photo-submission-id]");
        const correctionNote = cardNode?.querySelector("[data-photo-correction-note]")?.value || "";
        const feedbackNode = cardNode?.querySelector(`[data-photo-feedback="${submissionId}"]`) || photoFeedbackNode;
        rerunMealPhotoAssist(submissionId, feedbackNode, correctionNote).catch(() => null);
        return;
      }

      const buildButton = event.target.closest("[data-build-photo-meal]");
      if (!buildButton) {
        return;
      }
      const submissionId = buildButton.dataset.buildPhotoMeal || "";
      const cardNode = buildButton.closest("[data-photo-submission-id]");
      buildMealFromPhotoSubmission(submissionId, cardNode);
    });

    checkinTemplateNode?.addEventListener("change", () => {
      state.selectedCheckinTemplateId = checkinTemplateNode.value || "";
      const derived = deriveWorkspace();
      renderQuestionStack(derived);
      const openCheckin = state.selectedCheckinTemplateId ? derived.openCheckinByTemplateId.get(state.selectedCheckinTemplateId) : null;
      if (checkinDueNode) {
        checkinDueNode.value = openCheckin?.due_at
          ? formatDateTimeLocalInput(openCheckin.due_at)
          : formatDateTimeLocalInput(new Date(Date.now() + 3600000));
      }
    });
    checkinForm?.addEventListener("submit", handleCheckinSubmit);
    progressForm?.addEventListener("submit", handleProgressSubmit);
    progressForm?.addEventListener("change", (event) => {
      if (event.target.matches('input[type="file"]')) {
        setProgressUploadState("idle");
        renderProgressSelection();
      }
    });

    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) {
        queueRefresh();
      }
    });

    window.addEventListener("focus", () => {
      queueRefresh();
    });
    window.addEventListener("beforeunload", () => {
      stopBarcodeScanner();
      revokeAllLocalPreviewUrls();
    });
  }

  async function init() {
    try {
      await loadAccessAndClient();
      nutritionDateNode.value = formatDateOnlyInput();
      if (mealDateNode) {
        mealDateNode.value = formatDateOnlyInput();
      }
      if (photoDateNode) {
        photoDateNode.value = formatDateOnlyInput();
      }
      checkinDueNode.value = formatDateTimeLocalInput(new Date(Date.now() + 3600000));
      if (progressCapturedAtNode) {
        progressCapturedAtNode.value = formatDateTimeLocalInput(new Date());
      }
      bindEvents();
      setActivePanel(getRequestedInitialPanel());
      setActiveNutritionWorkspace(state.activeNutritionWorkspace);
      renderProgressSelection();
      renderMealPhotoSelection();
      renderBarcodePhotoSelection();
      renderMealBuilder();
      renderBarcodeScannerSupport();
      renderBarcodeResult();
      await fetchPlannerData(false);
      await searchFoodLibrary("");
      await initRealtime();
    } catch (error) {
      setStatus(error?.message || "Unable to load the planner workspace right now.", true);
    }
  }

  init();
})();
