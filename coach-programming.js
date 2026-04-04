(function initCoachProgramming() {
  function resolveStatusNode() {
    const existingNode = document.getElementById("coach-programming-status");
    if (existingNode) {
      return existingNode;
    }

    const headerNode = document.querySelector(".crm-page-head");
    if (!headerNode) {
      return null;
    }

    const titleBlock = headerNode.querySelector(".crm-page-title-block") || headerNode.firstElementChild || headerNode;
    const fallbackNode = document.createElement("p");
    fallbackNode.id = "coach-programming-status";
    fallbackNode.className = "dashboard-feedback";
    titleBlock.appendChild(fallbackNode);
    return fallbackNode;
  }

  const statusNode = resolveStatusNode();
  if (!statusNode) {
    return;
  }

  const workspaceKind = String(document.body?.dataset.programWorkspace || "programming").trim().toLowerCase();
  const initialTabKey = (() => {
    try {
      return String(new URL(window.location.href).searchParams.get("tab") || "").trim().toLowerCase();
    } catch (_) {
      return "";
    }
  })();
  const tabNodes = Array.from(document.querySelectorAll("[data-coach-programming-tab]"));
  const panelNodes = Array.from(document.querySelectorAll("[data-coach-programming-panel]"));
  const panelAnchorNodes = Array.from(document.querySelectorAll("[data-coach-programming-anchor]"));
  const deliverySubtabNodes = Array.from(document.querySelectorAll("[data-coach-programming-subtab]"));
  const deliverySubpanelNodes = Array.from(document.querySelectorAll("[data-coach-programming-subpanel]"));
  const availablePanelKeys = new Set(
    tabNodes
      .map((node) => String(node.dataset.coachProgrammingTab || "").trim())
      .filter(Boolean)
  );

  const rosterMetricNode = document.getElementById("coach-program-stat-roster");
  const templateMetricNode = document.getElementById("coach-program-stat-templates");
  const assignmentMetricNode = document.getElementById("coach-program-stat-assignments");
  const reviewMetricNode = document.getElementById("coach-program-stat-reviews");
  const riskMetricNode = document.getElementById("coach-program-stat-risk");
  const staleMetricNode = document.getElementById("coach-program-stat-stale");

  const rosterGridNode = document.getElementById("coach-program-roster-grid");
  const signalsNode = document.getElementById("coach-program-signals");
  const assignmentRowsNode = document.getElementById("coach-program-assignment-rows");
  const riskGridNode = document.getElementById("coach-program-risk-grid");
  const staleGridNode = document.getElementById("coach-program-stale-grid");

  const templateForm = document.getElementById("coach-program-template-form");
  const templateIdField = templateForm?.elements?.namedItem("id") || null;
  const activeAssignmentField = templateForm?.elements?.namedItem("activeAssignmentId") || null;
  const templateDaysNode = document.getElementById("coach-program-template-days");
  const templateAddDayButton = document.getElementById("coach-program-add-day");
  const templateResetButton = document.getElementById("coach-program-template-reset");
  const templateSubmitButton = document.getElementById("coach-program-template-submit");
  const templateFeedbackNode = document.getElementById("coach-program-template-feedback");
  const templateLibraryNode = document.getElementById("coach-program-template-library");
  const trainingStepTabNodes = Array.from(document.querySelectorAll("[data-coach-training-step]"));
  const trainingStepPanelNodes = Array.from(document.querySelectorAll("[data-coach-training-step-panel]"));
  const trainingStepNavNodes = Array.from(document.querySelectorAll("[data-coach-training-nav]"));
  const trainingGenerateButton = document.getElementById("coach-training-generate-program");
  const trainingGenerateFeedbackNode = document.getElementById("coach-training-generate-feedback");
  const trainingExerciseMirrorNode = document.getElementById("coach-training-exercise-days");
  const trainingEditNoteNode = document.getElementById("coach-training-edit-note");
  const trainingWeekSwitchNode = document.getElementById("coach-training-week-switch");
  const trainingExerciseWeekSwitchNode = document.getElementById("coach-training-exercise-week-switch");
  const trainingWeekTabsSplitNode = document.getElementById("coach-training-week-tabs-split");
  const trainingWeekTabsExercisesNode = document.getElementById("coach-training-week-tabs-exercises");
  const trainingWeekSummaryNode = document.getElementById("coach-training-week-summary");
  const workbookImportForm = document.getElementById("coach-program-workbook-import-form");
  const workbookFileNode = document.getElementById("coach-program-workbook-file");
  const workbookSheetNode = document.getElementById("coach-program-workbook-sheet");
  const workbookImportFeedbackNode = document.getElementById("coach-program-workbook-import-feedback");
  const exerciseSearchNode = document.getElementById("coach-program-exercise-search");
  const exerciseSearchButton = document.getElementById("coach-program-exercise-search-button");
  const exerciseLibraryNode = document.getElementById("coach-program-exercise-library");
  const exerciseForm = document.getElementById("coach-program-exercise-form");
  const exerciseBulkForm = document.getElementById("coach-program-exercise-bulk-form");
  const exerciseFeedbackNode = document.getElementById("coach-program-exercise-feedback");

  const assignForm = document.getElementById("coach-program-assign-form") || (workspaceKind === "training" ? templateForm : null);
  const assignFeedbackNode = document.getElementById("coach-program-assign-feedback");
  const assignClientNode = document.getElementById("coach-program-client");
  const assignTemplateNode = document.getElementById("coach-program-template-select");
  const assignStartDateNode = document.getElementById("coach-program-start-date");
  const assignAthleteProfileNode = assignForm?.querySelector("[name='athleteProfile']") || null;
  const athleteCalculatorGroupNodes = Array.from(document.querySelectorAll("[data-athlete-calculator-group]"));
  const assignmentWorkbookPreviewNode = document.getElementById("coach-programming-workbook-preview");
  const assignmentWorkbookPreviewGridNode = document.getElementById("coach-programming-workbook-preview-grid");
  const assignmentWorkbookPreviewSummaryNode = document.getElementById("coach-programming-workbook-preview-summary");
  const assignmentWorkbookPreviewNoteNode = document.getElementById("coach-programming-workbook-preview-note");
  const bulkAssignForm = document.getElementById("coach-program-bulk-form");
  const bulkAssignTemplateNode = document.getElementById("coach-program-bulk-template");
  const bulkAssignStartDateNode = document.getElementById("coach-program-bulk-start-date");
  const bulkAssignFeedbackNode = document.getElementById("coach-program-bulk-feedback");
  const bulkAssignListNode = document.getElementById("coach-program-bulk-list");
  const bulkAssignSelectAllButton = document.getElementById("coach-program-bulk-select-all");
  const bulkAssignSelectRiskButton = document.getElementById("coach-program-bulk-select-risk");
  const bulkAssignClearButton = document.getElementById("coach-program-bulk-clear");
  const focusNode = document.getElementById("coach-program-client-focus");
  const deliveryNode = document.getElementById("coach-program-delivery-list");
  const nutritionForm = document.getElementById("coach-program-nutrition-form");
  const nutritionClientNode = document.getElementById("coach-program-nutrition-client");
  const nutritionAssignmentNode = document.getElementById("coach-program-nutrition-assignment");
  const nutritionStartDateNode = document.getElementById("coach-program-nutrition-start-date");
  const nutritionFeedbackNode = document.getElementById("coach-program-nutrition-feedback");
  const nutritionStepTabNodes = Array.from(document.querySelectorAll("[data-coach-nutrition-step]"));
  const nutritionStepPanelNodes = Array.from(document.querySelectorAll("[data-coach-nutrition-step-panel]"));
  const nutritionStepNavNodes = Array.from(document.querySelectorAll("[data-coach-nutrition-nav]"));
  const nutritionPreviewGridNode = document.getElementById("coach-program-nutrition-preview-grid");
  const nutritionPreviewNoteNode = document.getElementById("coach-program-nutrition-preview-note");
  const nutritionTargetGridNode = document.getElementById("coach-program-nutrition-target-grid");
  const nutritionHabitsNode = document.getElementById("coach-program-nutrition-habits");
  const nutritionAddHabitButton = document.getElementById("coach-program-add-habit");
  const nutritionRegenerateHabitsButton = document.getElementById("coach-program-regenerate-habits");
  const mealPlanDaysNode = document.getElementById("coach-program-meal-plan-days");
  const mealPlanResetButton = document.getElementById("coach-program-meal-plan-reset");
  const nutritionRegenerateTargetsButton = document.getElementById("coach-program-nutrition-regenerate-targets");
  const nutritionWorkbookPreviewNode = document.getElementById("coach-program-nutrition-workbook-preview");
  const nutritionWorkbookGridNode = document.getElementById("coach-program-nutrition-workbook-grid");
  const nutritionWorkbookSummaryNode = document.getElementById("coach-program-nutrition-workbook-summary");
  const nutritionWorkbookNoteNode = document.getElementById("coach-program-nutrition-workbook-note");
  const bulkNutritionForm = document.getElementById("coach-program-bulk-nutrition-form");
  const bulkNutritionListNode = document.getElementById("coach-program-bulk-nutrition-list");
  const bulkNutritionFeedbackNode = document.getElementById("coach-program-bulk-nutrition-feedback");
  const bulkNutritionSelectEmptyButton = document.getElementById("coach-program-bulk-nutrition-select-empty");
  const bulkNutritionSelectRiskButton = document.getElementById("coach-program-bulk-nutrition-select-risk");
  const bulkNutritionClearButton = document.getElementById("coach-program-bulk-nutrition-clear");
  const checkinTemplateForm = document.getElementById("coach-program-checkin-template-form");
  const checkinCadenceNode = document.getElementById("coach-program-checkin-cadence");
  const checkinFormTypeNode = document.getElementById("coach-program-checkin-form-type");
  const checkinQuestionsNode = document.getElementById("coach-program-checkin-questions");
  const checkinAddQuestionButton = document.getElementById("coach-program-add-question");
  const checkinTemplateFeedbackNode = document.getElementById("coach-program-checkin-template-feedback");
  const scheduleCheckinForm = document.getElementById("coach-program-schedule-checkin-form");
  const scheduleCheckinClientNode = document.getElementById("coach-program-checkin-client");
  const scheduleCheckinTemplateNode = document.getElementById("coach-program-checkin-template-select");
  const scheduleCheckinAssignmentNode = document.getElementById("coach-program-checkin-assignment");
  const scheduleCheckinDueNode = document.getElementById("coach-program-checkin-due-at");
  const scheduleCheckinFeedbackNode = document.getElementById("coach-program-schedule-checkin-feedback");
  const deliveryLibraryNode = document.getElementById("coach-program-delivery-library");
  const foodForm = document.getElementById("coach-program-food-form");
  const foodFeedbackNode = document.getElementById("coach-program-food-feedback");
  const foodServingsNode = document.getElementById("coach-program-food-servings");
  const addFoodServingButton = document.getElementById("coach-program-add-food-serving");
  const foodSearchNode = document.getElementById("coach-program-food-search");
  const foodSearchButton = document.getElementById("coach-program-food-search-button");
  const foodLibraryNode = document.getElementById("coach-program-food-library");
  const recipeForm = document.getElementById("coach-program-recipe-form");
  const recipeFeedbackNode = document.getElementById("coach-program-recipe-feedback");
  const recipeIngredientsNode = document.getElementById("coach-program-recipe-ingredients");
  const recipeLibraryNode = document.getElementById("coach-program-recipe-library");
  const resetRecipeButton = document.getElementById("coach-program-reset-recipe");
  const reviewSummaryGridNode = document.getElementById("coach-program-review-summary-grid");
  const reviewEmptyStateNode = document.getElementById("coach-program-review-empty-state");
  const reviewToolbarCardNode = document.querySelector(".coach-programming-review-toolbar-card");
  const reviewFocusNode = document.getElementById("coach-program-review-focus");
  const reviewClientNode = document.getElementById("coach-program-review-client");
  const reviewSortNode = document.getElementById("coach-program-review-sort");
  const reviewGridNode = document.getElementById("coach-program-review-grid");
  const deliveryEmptyStateNode = document.getElementById("coach-program-delivery-empty-state");
  const deliveryPlanCardNode = document.getElementById("coach-program-delivery-plan-card");
  const trainingAssignmentsEmptyStateNode = document.getElementById("coach-program-training-assignments-empty-state");
  const trainingAssignmentsWorkflowSectionNode = document.getElementById("coach-program-training-assignments-workflow-section");
  const trainingAssignmentsBulkSectionNode = document.getElementById("coach-program-training-bulk-section");
  const trainingCalendarEmptyStateNode = document.getElementById("coach-program-training-calendar-empty-state");
  const trainingCalendarSummarySectionNode = document.getElementById("coach-program-training-calendar-summary-section");
  const trainingCalendarWorkflowSectionNode = document.getElementById("coach-program-training-calendar-workflow-section");
  const operationsSummaryGridNode = document.getElementById("coach-program-ops-summary-grid");
  const operationsEmptyStateNode = document.getElementById("coach-program-operations-empty-state");
  const operationsWorkflowSectionNode = document.getElementById("coach-program-ops-workflow-section");
  const operationsAdvancedSectionNode = document.getElementById("coach-program-ops-advanced-section");
  const operationsNudgeForm = document.getElementById("coach-program-ops-nudge-form");
  const operationsNudgeCategoryNode = document.getElementById("coach-program-ops-nudge-category");
  const operationsNudgeMessageNode = document.getElementById("coach-program-ops-nudge-message");
  const operationsNudgeListNode = document.getElementById("coach-program-ops-nudge-list");
  const operationsNudgeFeedbackNode = document.getElementById("coach-program-ops-nudge-feedback");
  const operationsSelectNutritionButton = document.getElementById("coach-program-ops-select-nutrition");
  const operationsSelectCheckinButton = document.getElementById("coach-program-ops-select-checkin");
  const operationsSelectQuietButton = document.getElementById("coach-program-ops-select-quiet");
  const operationsClearButton = document.getElementById("coach-program-ops-clear");
  const operationsBoardNode = document.getElementById("coach-program-ops-board");
  const segmentForm = document.getElementById("coach-program-segment-form");
  const segmentNameNode = document.getElementById("coach-program-segment-name");
  const segmentRiskNode = document.getElementById("coach-program-segment-risk");
  const segmentReviewsNode = document.getElementById("coach-program-segment-reviews");
  const segmentNutritionNode = document.getElementById("coach-program-segment-nutrition");
  const segmentCheckinNode = document.getElementById("coach-program-segment-checkin");
  const segmentTrainingNode = document.getElementById("coach-program-segment-training");
  const segmentPhotoNode = document.getElementById("coach-program-segment-photo");
  const segmentQuietNode = document.getElementById("coach-program-segment-quiet");
  const segmentNoNutritionNode = document.getElementById("coach-program-segment-no-nutrition");
  const segmentNoProgramNode = document.getElementById("coach-program-segment-no-program");
  const segmentFeedbackNode = document.getElementById("coach-program-segment-feedback");
  const segmentLibraryNode = document.getElementById("coach-program-segment-library");
  const automationForm = document.getElementById("coach-program-automation-form");
  const automationNameNode = document.getElementById("coach-program-automation-name");
  const automationSegmentNode = document.getElementById("coach-program-automation-segment");
  const automationCategoryNode = document.getElementById("coach-program-automation-category");
  const automationScheduleNode = document.getElementById("coach-program-automation-schedule");
  const automationCooldownNode = document.getElementById("coach-program-automation-cooldown");
  const automationMessageNode = document.getElementById("coach-program-automation-message");
  const weeklyBriefingEnabledNode = document.getElementById("coach-program-weekly-briefing-enabled");
  const automationEnabledNode = document.getElementById("coach-program-automation-enabled");
  const automationFeedbackNode = document.getElementById("coach-program-automation-feedback");
  const automationLibraryNode = document.getElementById("coach-program-automation-library");
  const calendarSummaryGridNode = document.getElementById("coach-program-calendar-summary-grid");
  const calendarWeekLabelNode = document.getElementById("coach-program-calendar-week-label");
  const calendarPrevButton = document.getElementById("coach-program-calendar-prev");
  const calendarTodayButton = document.getElementById("coach-program-calendar-today");
  const calendarNextButton = document.getElementById("coach-program-calendar-next");
  const calendarClientNode = document.getElementById("coach-program-calendar-client");
  const calendarGridNode = document.getElementById("coach-program-calendar-grid");
  const calendarAttentionNode = document.getElementById("coach-program-calendar-attention");

  const EMPTY_DATA = {
    templates: [],
    checkinTemplates: [],
    rosterProfiles: [],
    rosterDetails: [],
    rosterAssignments: [],
    programAssignments: [],
    programDays: [],
    nutritionPlans: [],
    workoutLogs: [],
    nutritionLogs: [],
    mealEntries: [],
    mealItems: [],
    nutritionPhotoSubmissions: [],
    nutritionPhotoAssets: [],
    nutritionPhotoCandidates: [],
    catalogFoods: [],
    coachFoodCount: 0,
    recipes: [],
    recipeIngredients: [],
    checkins: [],
    progressPhotos: [],
    rewardEvents: [],
  };

  const MEAL_PLAN_DAY_PRESETS = [
    { key: "monday", label: "Monday" },
    { key: "tuesday", label: "Tuesday" },
    { key: "wednesday", label: "Wednesday" },
    { key: "thursday", label: "Thursday" },
    { key: "friday", label: "Friday" },
    { key: "saturday", label: "Saturday" },
    { key: "sunday", label: "Sunday" },
  ];

  const MEAL_SLOT_TYPE_OPTIONS = [
    "breakfast",
    "lunch",
    "dinner",
    "snack",
    "pre_workout",
    "post_workout",
    "other",
  ];

  const TRAINING_WORKBOOK_INPUT_FIELDS = new Set([
    "clientId",
    "startDate",
    "athleteProfile",
    "primaryPhase",
    "primaryEvent",
    "experienceLevel",
    "priorityBias",
    "competitionDate",
    "resistanceDaysPerWeek",
    "conditioningDaysPerWeek",
    "avgSessionMinutes",
    "currentFatigue",
    "sex",
    "ageYears",
    "bodyMassKg",
    "sleepHours",
    "currentWeeklyRunningKm",
    "longestRunCompletedKm",
    "recent5kTimeMin",
    "weighInType",
    "currentSquat1rmKg",
    "currentBench1rmKg",
    "currentDeadlift1rmKg",
    "injuryNotes",
    "goalFocus",
  ]);

  const NUTRITION_WORKBOOK_INPUT_FIELDS = new Set([
    "strategy",
    "athleteCategory",
    "primaryGoal",
    "sex",
    "ageYears",
    "heightCm",
    "currentBodyWeightKg",
    "targetBodyWeightKg",
    "startDate",
    "eventDate",
    "trainingSessionsPerWeek",
    "averageSessionDurationMin",
    "averageStepsPerDay",
    "mealsPerDayPreference",
    "dietStyle",
    "giSensitivity",
    "appetite",
    "sweatRate",
    "trainingStartTime",
    "currentCaloriesPerDay",
    "currentProteinG",
    "manualMaintenanceKcal",
  ]);

  const NUTRITION_OVERRIDE_TARGET_FIELDS = new Set([
    "caloriesTarget",
    "proteinTargetG",
    "carbsTargetG",
    "fatTargetG",
  ]);

  const state = {
    access: null,
    supabase: null,
    data: { ...EMPTY_DATA },
    builderDays: [],
    nutritionHabits: [],
    mealPlanDays: [],
    checkinQuestions: [],
    foodServings: [],
    recipeIngredients: [],
    foodSearchResults: [],
    exerciseSearchResults: [],
    activePanel: workspaceKind === "nutrition" ? "delivery" : "",
    deliverySubpanel: workspaceKind === "nutrition" || workspaceKind === "health" ? "plans" : "plans",
    refreshTimer: 0,
    realtimeChannel: null,
    reviewFilters: {
      focus: "all",
      clientId: "",
      sort: "priority",
    },
    calendar: {
      weekOffset: 0,
      clientId: "",
    },
    coachOps: {
      segments: [],
      automationRules: [],
      weeklyBriefingEnabled: true,
    },
    trainingWizard: {
      activeStep: "inputs",
    },
    editingAssignment: null,
    trainingWorkbook: {
      athleteType: "",
      summaryCard: [],
      previewPairs: [],
      weeks: [],
      activeWeek: 1,
      dirty: true,
    },
    nutritionWizard: {
      activeStep: "inputs",
      manualTargetFields: new Set(),
      habitsDirty: false,
      mealPlanDirty: false,
      workbookSnapshot: null,
      activeMealDayId: "",
    },
  };

  const WORKSPACE_COPY = {
    training: {
      loading: "Loading your live training desk...",
      liveSummary(derived) {
        return `Training desk live: ${formatCount(derived.metrics.activePrograms)} active programs across ${formatCount(
          derived.metrics.roster
        )} assigned clients.`;
      },
    },
    nutrition: {
      loading: "Loading your live nutrition desk...",
      liveSummary(derived) {
        const liveNutritionPlans = derived.nutritionPlans.filter((item) => isActiveStatus(item.status)).length;
        return `Nutrition desk live: ${formatCount(liveNutritionPlans)} live plans and ${formatCount(
          derived.metrics.pendingReviews
        )} pending reviews across ${formatCount(derived.metrics.roster)} assigned clients.`;
      },
    },
    health: {
      loading: "Loading your live health desk...",
      liveSummary(derived) {
        const liveHealthTemplates = derived.checkinTemplates.filter((item) => item.is_active !== false).length;
        const healthReviewCount = getWorkspacePendingReviewItems(derived).length;
        return `Health desk live: ${formatCount(liveHealthTemplates)} live forms and ${formatCount(
          healthReviewCount
        )} pending reviews across ${formatCount(derived.metrics.roster)} assigned clients.`;
      },
    },
    programming: {
      loading: "Loading your live coach workspace...",
      liveSummary(derived) {
        return `Coach workspace live: ${formatCount(derived.metrics.activePrograms)} active programs across ${formatCount(
          derived.metrics.roster
        )} assigned clients.`;
      },
    },
  };

  function resolveWorkspaceCopy() {
    return WORKSPACE_COPY[workspaceKind] || WORKSPACE_COPY.programming;
  }

  function isTrainingWorkspace() {
    return workspaceKind === "training";
  }

  function isNutritionWorkspace() {
    return workspaceKind === "nutrition";
  }

  function isHealthWorkspace() {
    return workspaceKind === "health";
  }

  function buildEmptyTableRow(colspan, title, body) {
    return `
      <tr class="dashboard-table__empty-row">
        <td colspan="${Number(colspan) || 1}">
          <div class="dashboard-table__empty">
            <strong>${escapeHtml(title || "Nothing to show yet.")}</strong>
            ${body ? `<p>${escapeHtml(body)}</p>` : ""}
          </div>
        </td>
      </tr>
    `;
  }

  function buildWorkspaceEmptyCard(title, body, tone = "neutral") {
    return `
      <article class="dashboard-note dashboard-note--placeholder" data-crm-tone="${escapeHtml(tone)}">
        <strong>${escapeHtml(title || "Nothing to show yet.")}</strong>
        <p>${escapeHtml(body || "This section will populate once live coaching data starts landing.")}</p>
      </article>
    `;
  }

  const STRUCTURED_SESSION_CATEGORIES = new Set(["conditioning", "runner", "hyrox", "endurance", "combat"]);

  function getSelectedTemplateCategory() {
    const categoryField = templateForm?.elements?.namedItem("category");
    if (categoryField && typeof categoryField.value === "string") {
      return compactText(categoryField.value).toLowerCase() || "strength";
    }
    return "strength";
  }

  function isStructuredSessionCategory(category = getSelectedTemplateCategory()) {
    if (STRUCTURED_SESSION_CATEGORIES.has(compactText(category).toLowerCase())) {
      return true;
    }
    return Array.isArray(state.trainingWorkbook?.weeks)
      && state.trainingWorkbook.weeks.some((week) =>
        Array.isArray(week?.days)
        && week.days.some((day) => compactText(day?.sessionLabel || day?.session_label))
      );
  }

  function syncTemplateBuilderMode() {
    if (!templateFeedbackNode) {
      return;
    }

    if (isStructuredSessionCategory()) {
      templateFeedbackNode.innerHTML = `
        Session-level endurance fields are enabled for conditioning, runner, HYROX, and endurance templates. Use the
        exercise cards below for strength support, accessories, and technique blocks.
      `;
      return;
    }

    templateFeedbackNode.innerHTML = `
      Use exercise cards for each lift, accessory, or circuit line. Structured endurance fields stay hidden for strength,
      hypertrophy, rehab, and general templates so the builder stays focused.
    `;
  }

  function setTemplateEditorState(template) {
    const editingTemplate = template && typeof template === "object" ? template : null;
    if (templateIdField) {
      templateIdField.value = compactText(editingTemplate?.id);
    }
    if (templateSubmitButton) {
      templateSubmitButton.textContent = editingTemplate?.id ? "Update Training Template" : "Save Training Template";
    }
    if (templateResetButton) {
      templateResetButton.disabled = false;
    }
  }

  function getWorkspacePendingReviewItems(derived) {
    const items = Array.isArray(derived?.pendingReviewItems) ? derived.pendingReviewItems : [];
    if (isNutritionWorkspace()) {
      return items.filter((item) => item.domain === "nutrition");
    }
    if (isHealthWorkspace()) {
      return items.filter((item) => item.domain === "health");
    }
    if (isTrainingWorkspace()) {
      return items.filter((item) => item.domain === "training" || item.domain === "rewards");
    }
    return items;
  }

  function getWorkspacePendingReviewCountsByClient(derived) {
    return getWorkspacePendingReviewItems(derived).reduce((counts, item) => {
      const clientId = String(item.clientId || "").trim();
      if (!clientId) {
        return counts;
      }
      counts.set(clientId, (counts.get(clientId) || 0) + 1);
      return counts;
    }, new Map());
  }

  function getWorkspaceOperationsSummary(derived) {
    const cards = Array.isArray(derived?.operationsSummary) ? derived.operationsSummary : [];
    if (isNutritionWorkspace()) {
      return cards.filter((card) => ["Nutrition Nudges", "Quiet Roster"].includes(card.label));
    }
    if (isHealthWorkspace()) {
      return cards.filter((card) => ["Health Follow-Up", "Photo Refresh", "Quiet Roster"].includes(card.label));
    }
    return cards;
  }

  function getWorkspaceOperationsCandidates(derived) {
    const candidates = Array.isArray(derived?.operationsCandidates) ? derived.operationsCandidates : [];
    if (isNutritionWorkspace()) {
      return candidates.filter((client) => client.needsNutritionNudge || (client.quietThisWeek && client.daysSinceActivity > 3));
    }
    if (isHealthWorkspace()) {
      return candidates.filter(
        (client) => client.needsCheckinNudge || client.needsPhotoNudge || (client.quietThisWeek && client.daysSinceActivity > 3)
      );
    }
    return candidates;
  }

  function resolvePanelKey(panelKey) {
    const requestedKey = String(panelKey || "").trim();
    if (requestedKey && availablePanelKeys.has(requestedKey)) {
      return requestedKey;
    }

    if (!requestedKey && initialTabKey && availablePanelKeys.has(initialTabKey)) {
      return initialTabKey;
    }

    const activeTabKey = String(
      tabNodes.find((node) => node.classList.contains("is-active"))?.dataset.coachProgrammingTab || ""
    ).trim();
    if (activeTabKey && availablePanelKeys.has(activeTabKey)) {
      return activeTabKey;
    }

    const firstAvailableKey = String(tabNodes[0]?.dataset.coachProgrammingTab || "").trim();
    if (firstAvailableKey) {
      return firstAvailableKey;
    }

    return requestedKey || String(panelNodes[0]?.dataset.coachProgrammingPanel || "overview").trim() || "overview";
  }

  function setStatus(message, isError) {
    statusNode.textContent = message;
    statusNode.classList.toggle("error", Boolean(isError));
    statusNode.classList.toggle("success", Boolean(message) && !isError);
  }

  function setInlineFeedback(node, message, isError) {
    if (!node) {
      return;
    }
    node.textContent = message;
    node.classList.toggle("error", Boolean(isError));
    node.classList.toggle("success", Boolean(message) && !isError);
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/gu, "&amp;")
      .replace(/</gu, "&lt;")
      .replace(/>/gu, "&gt;")
      .replace(/"/gu, "&quot;")
      .replace(/'/gu, "&#39;");
  }

  function toTitleCase(value) {
    return String(value || "")
      .replace(/[_-]+/gu, " ")
      .trim()
      .replace(/\b\w/gu, (match) => match.toUpperCase());
  }

  function formatHealthFormType(value) {
    const normalized = String(value || "").trim().toLowerCase();
    if (normalized === "weekly_checkin") {
      return "Weekly health review";
    }
    if (normalized === "daily_adherence") {
      return "Daily recovery pulse";
    }
    return toTitleCase(normalized || "health form");
  }

  function hasAssignedRoster(derived) {
    if (Array.isArray(derived?.roster)) {
      return derived.roster.length > 0;
    }
    if (Array.isArray(derived?.rosterProfiles)) {
      return derived.rosterProfiles.length > 0;
    }
    return Number(derived?.metrics?.roster || 0) > 0;
  }

  function toggleOperationsSections(hasRoster) {
    if (operationsWorkflowSectionNode) {
      operationsWorkflowSectionNode.hidden = !hasRoster;
    }
    if (operationsAdvancedSectionNode) {
      operationsAdvancedSectionNode.hidden = !hasRoster;
    }
  }

  function toggleTrainingSections(hasRoster) {
    if (trainingAssignmentsEmptyStateNode) {
      trainingAssignmentsEmptyStateNode.hidden = hasRoster;
    }
    if (trainingAssignmentsWorkflowSectionNode) {
      trainingAssignmentsWorkflowSectionNode.hidden = !hasRoster;
    }
    if (trainingAssignmentsBulkSectionNode) {
      trainingAssignmentsBulkSectionNode.hidden = !hasRoster;
    }
    if (trainingCalendarEmptyStateNode) {
      trainingCalendarEmptyStateNode.hidden = hasRoster;
    }
    if (trainingCalendarSummarySectionNode) {
      trainingCalendarSummarySectionNode.hidden = !hasRoster;
    }
    if (trainingCalendarWorkflowSectionNode) {
      trainingCalendarWorkflowSectionNode.hidden = !hasRoster;
    }
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

  function formatPercent(value) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) {
      return "";
    }
    return `${numeric.toLocaleString("en-MY", {
      minimumFractionDigits: numeric % 1 ? 1 : 0,
      maximumFractionDigits: 1,
    })}%`;
  }

  function formatProgressPhotoAiEstimate(entry) {
    if (!entry) {
      return "";
    }

    const estimate = formatPercent(entry.ai_body_fat_estimate);
    const low = formatPercent(entry.ai_body_fat_range_low);
    const high = formatPercent(entry.ai_body_fat_range_high);
    if (estimate && low && high) {
      return `${estimate} (${low}-${high})`;
    }
    if (low && high) {
      return `${low}-${high}`;
    }
    return estimate;
  }

  function formatDateTimeLocalInput(value) {
    const date = value ? new Date(value) : new Date();
    if (Number.isNaN(date.getTime())) {
      return "";
    }

    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
  }

  function daysBetween(value) {
    if (!value) {
      return Number.POSITIVE_INFINITY;
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return Number.POSITIVE_INFINITY;
    }

    return Math.floor((Date.now() - date.getTime()) / 86400000);
  }

  function isActiveStatus(value) {
    return ["active", "paused"].includes(String(value || "").toLowerCase());
  }

  function isEditableAssignmentStatus(value) {
    return ["draft", "active", "paused"].includes(String(value || "").toLowerCase());
  }

  function getLatestTimestamp(...values) {
    const timestamps = values
      .map((value) => new Date(value || 0).getTime())
      .filter((value) => Number.isFinite(value) && value > 0);
    if (!timestamps.length) {
      return "";
    }
    return new Date(Math.max(...timestamps)).toISOString();
  }

  function getTodayDateOnly() {
    return new Date().toISOString().slice(0, 10);
  }

  function getStartOfWeek(value = new Date()) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return new Date();
    }
    const day = date.getDay() || 7;
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - day + 1);
    return date;
  }

  function getEndOfWeek(value = new Date()) {
    const start = getStartOfWeek(value);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return end;
  }

  function isTimestampWithinRange(value, start, end) {
    if (!value) {
      return false;
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return false;
    }
    return date.getTime() >= start.getTime() && date.getTime() <= end.getTime();
  }

  function formatWeekRange(start, end) {
    const startLabel = formatDate(start);
    const endLabel = formatDate(end);
    return `${startLabel} - ${endLabel}`;
  }

  function getCalendarWeekRange(weekOffset = 0) {
    const start = getStartOfWeek();
    start.setDate(start.getDate() + (Number(weekOffset || 0) * 7));
    const end = getEndOfWeek(start);
    return { start, end };
  }

  function toDateOnlyKey(value) {
    const date = value ? new Date(value) : null;
    if (!date || Number.isNaN(date.getTime())) {
      return "";
    }
    return date.toISOString().slice(0, 10);
  }

  function getWeekdayKeyFromDate(value) {
    const date = value ? new Date(value) : null;
    if (!date || Number.isNaN(date.getTime())) {
      return "";
    }
    return MEAL_PLAN_DAY_PRESETS[date.getDay() === 0 ? 6 : date.getDay() - 1]?.key || "";
  }

  function formatShortDayLabel(value) {
    const date = value ? new Date(value) : null;
    if (!date || Number.isNaN(date.getTime())) {
      return "Day";
    }
    return new Intl.DateTimeFormat("en-MY", {
      weekday: "short",
      day: "numeric",
      month: "short",
    }).format(date);
  }

  function parseInteger(value) {
    const numeric = Number.parseInt(String(value || "").trim(), 10);
    return Number.isFinite(numeric) ? numeric : null;
  }

  function parseDecimal(value) {
    const numeric = Number.parseFloat(String(value || "").trim());
    return Number.isFinite(numeric) ? numeric : null;
  }

  function compactText(value) {
    return String(value || "").trim();
  }

  function parseTagList(value) {
    return String(value || "")
      .split(/[;,]/u)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function parseDelimitedLine(line, delimiter) {
    const fields = [];
    let current = "";
    let inQuotes = false;

    for (let index = 0; index < line.length; index += 1) {
      const character = line[index];
      if (character === "\"") {
        if (inQuotes && line[index + 1] === "\"") {
          current += "\"";
          index += 1;
        } else {
          inQuotes = !inQuotes;
        }
        continue;
      }

      if (character === delimiter && !inQuotes) {
        fields.push(current.trim());
        current = "";
        continue;
      }

      current += character;
    }

    fields.push(current.trim());
    return fields;
  }

  function normalizeBulkHeaderKey(value) {
    return compactText(value)
      .toLowerCase()
      .replace(/[^a-z0-9]+/gu, "_")
      .replace(/^_+|_+$/gu, "");
  }

  function detectBulkDelimiter(line) {
    return line.includes("|") ? "|" : ",";
  }

  async function readFileAsBase64(file) {
    if (!file) {
      return "";
    }

    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = "";
    const chunkSize = 0x8000;
    for (let index = 0; index < bytes.length; index += chunkSize) {
      const chunk = bytes.subarray(index, index + chunkSize);
      binary += String.fromCharCode(...chunk);
    }
    return window.btoa(binary);
  }

  function resolveAthleteEngine() {
    return window.LegacyAthleteEngine && typeof window.LegacyAthleteEngine.buildWorkbookPackage === "function"
      ? window.LegacyAthleteEngine
      : null;
  }

  function resolveNutritionEngine() {
    return window.LegacyNutritionWorkbookEngine && typeof window.LegacyNutritionWorkbookEngine.build === "function"
      ? window.LegacyNutritionWorkbookEngine
      : null;
  }

  function toggleAthleteCalculatorGroups() {
    const engine = resolveAthleteEngine();
    const profileValue = compactText(assignAthleteProfileNode?.value);
    const calculatorKind = engine?.detectAthleteKind({ athleteProfile: profileValue }) || "";

    athleteCalculatorGroupNodes.forEach((node) => {
      const shouldShow = node.dataset.athleteCalculatorGroup === calculatorKind;
      node.hidden = !shouldShow;
    });
  }

  function buildDayId() {
    if (window.crypto?.randomUUID) {
      return window.crypto.randomUUID();
    }
    return `day-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  function buildLocalId(prefix) {
    if (window.crypto?.randomUUID) {
      return `${prefix}-${window.crypto.randomUUID()}`;
    }
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  function createEmptyExerciseRow(index, defaults = {}) {
    return {
      id: defaults.id || buildLocalId(`exercise-${index}`),
      blockLabel: compactText(defaults.blockLabel),
      name: compactText(defaults.name),
      sets: defaults.sets ?? "",
      repTarget: compactText(defaults.repTarget),
      intensity: compactText(defaults.intensity),
      rest: compactText(defaults.rest),
      tempo: compactText(defaults.tempo),
      startingLoad: defaults.startingLoad ?? "",
      increment: defaults.increment ?? "",
      progressionRule: compactText(defaults.progressionRule),
      clientEntryMode: compactText(defaults.clientEntryMode || "log_weight_reps_rpe") || "log_weight_reps_rpe",
      notes: compactText(defaults.notes),
    };
  }

  function createEmptyDay(index) {
    return {
      id: buildDayId(),
      title: `Day ${index}`,
      focus: "",
      dayType: "workout",
      estimatedDurationMinutes: "",
      notes: "",
      exercisesText: "",
      exerciseRows: [createEmptyExerciseRow(1)],
      sessionType: "standard",
      sessionLabel: "",
      distanceKm: "",
      heartRateZone: "",
      intensityCue: "",
      targetPace: "",
      fuelCue: "",
    };
  }

  function createEmptyHabit(index) {
    return {
      id: buildLocalId("habit"),
      title: `Habit ${index}`,
      description: "",
      targetType: "boolean",
      targetValue: "",
      targetUnit: "",
      cadence: "daily",
      isRequired: true,
    };
  }

  function createEmptyMealPlanSlot(dayKey, slotIndex, defaults = {}) {
    const mealType = defaults.mealType || (slotIndex === 1 ? "breakfast" : slotIndex === 2 ? "lunch" : slotIndex === 3 ? "dinner" : "snack");
    return {
      id: buildLocalId(`meal-slot-${dayKey}`),
      mealType,
      recipeId: defaults.recipeId || "",
      title: defaults.title || "",
      note: defaults.note || "",
    };
  }

  function createMealPlanDay(dayPreset) {
    return {
      id: buildLocalId(`meal-day-${dayPreset.key}`),
      dayKey: dayPreset.key,
      label: dayPreset.label,
      dayType: "rest",
      note: "",
      targets: {},
      slots: [
        createEmptyMealPlanSlot(dayPreset.key, 1, { mealType: "breakfast" }),
        createEmptyMealPlanSlot(dayPreset.key, 2, { mealType: "lunch" }),
        createEmptyMealPlanSlot(dayPreset.key, 3, { mealType: "dinner" }),
      ],
    };
  }

  function createDefaultMealPlanDays() {
    return MEAL_PLAN_DAY_PRESETS.map((dayPreset) => createMealPlanDay(dayPreset));
  }

  function createEmptyFoodServing(index) {
    return {
      id: buildLocalId("serving"),
      label: index === 1 ? "100 g" : `Serving ${index}`,
      grams: index === 1 ? "100" : "",
      unitCount: "1",
      isDefault: index === 1,
    };
  }

  function createEmptyRecipeIngredient(food, index) {
    const servings = Array.isArray(food?.servings) ? food.servings : [];
    const defaultServing = servings.find((entry) => entry.isDefault) || servings[0] || null;
    const grams = Number(defaultServing?.grams || food?.servingBasisG || 100);
    return {
      id: buildLocalId("recipe-ingredient"),
      foodId: food?.id || "",
      name: food?.name || `Ingredient ${index}`,
      servingId: defaultServing?.id || "",
      servings,
      quantity: "1",
      grams: grams ? String(grams) : "",
      note: "",
      food: food || null,
    };
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

  function formatDecimalHuman(value, suffix = "") {
    if (value === null || value === undefined || value === "") {
      return "";
    }
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) {
      return String(value);
    }
    return formatMacroValue(numeric, suffix);
  }

  function formatPercentHuman(value) {
    if (value === null || value === undefined || value === "") {
      return "";
    }
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) {
      return "";
    }
    return `${formatMacroValue(numeric * 100)}%`;
  }

  function resolvePhotoCandidateLabel(candidate, catalogFoodById) {
    const rawLabel = String(candidate?.label || candidate?.item_name || "").trim();
    const matchedFoodName = candidate?.food_id
      ? (catalogFoodById?.get(candidate.food_id)?.name || candidate?.metadata?.matchedFoodName || "")
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

  function getReviewItemConfig(type) {
    const normalized = String(type || "").trim().toLowerCase();
    if (normalized === "nutrition_photo") {
      return {
        typeLabel: "Photo Assist",
        groupKey: "nutrition_photos",
        groupLabel: "Photo Assist Needing Coach Eyes",
        groupDescription: "Low-confidence photo matches, weak ingredient detections, and meal-photo assists that still need coach judgment.",
        tone: "alert",
        priorityBase: 72,
        domain: "nutrition",
      };
    }

    if (normalized === "meal_entry") {
      return {
        typeLabel: "Meal Diary",
        groupKey: "meal_diary",
        groupLabel: "Meal Diary And Macro Reviews",
        groupDescription: "Meals that were logged, built, or photo-assisted and still need coach sign-off or correction.",
        tone: "warning",
        priorityBase: 58,
        domain: "nutrition",
      };
    }

    if (normalized === "nutrition_log") {
      return {
        typeLabel: "Nutrition Log",
        groupKey: "meal_diary",
        groupLabel: "Meal Diary And Macro Reviews",
        groupDescription: "Nutrition adherence logs and macro summaries that still need coach review.",
        tone: "warning",
        priorityBase: 52,
        domain: "nutrition",
      };
    }

    if (normalized === "checkin") {
      return {
        typeLabel: "Health Update",
        groupKey: "health_followup",
        groupLabel: "Health Forms And Progress Checkpoints",
        groupDescription: "Weekly and daily form submissions that can affect programming, recovery, and follow-up cadence.",
        tone: "warning",
        priorityBase: 48,
        domain: "health",
      };
    }

    if (normalized === "progress_photo") {
      return {
        typeLabel: "Progress Photo",
        groupKey: "health_followup",
        groupLabel: "Health Forms And Progress Checkpoints",
        groupDescription: "Body-composition and progress-photo updates that still need coach eyes before the next adjustment.",
        tone: "info",
        priorityBase: 38,
        domain: "health",
      };
    }

    if (normalized === "workout_log") {
      return {
        typeLabel: "Training Log",
        groupKey: "training_rewards",
        groupLabel: "Training And Reward Sync",
        groupDescription: "Training completions and downstream reward approvals that still need to be closed out.",
        tone: "info",
        priorityBase: 34,
        domain: "training",
      };
    }

    if (normalized === "reward_event") {
      return {
        typeLabel: "Reward Event",
        groupKey: "training_rewards",
        groupLabel: "Training And Reward Sync",
        groupDescription: "Planner-linked rewards waiting to be approved or rejected so the gamification system stays clean.",
        tone: "neutral",
        priorityBase: 26,
        domain: "rewards",
      };
    }

    return {
      typeLabel: toTitleCase(normalized.replace(/_/gu, " ")),
      groupKey: "training_rewards",
      groupLabel: "Training And Reward Sync",
      groupDescription: "Planner reviews still waiting on coach action.",
      tone: "warning",
      priorityBase: 24,
      domain: "general",
    };
  }

  function getReviewActionConfig(type) {
    const normalized = String(type || "").trim().toLowerCase();
    if (normalized === "reward_event") {
      return {
        primaryDecision: "approve",
        primaryLabel: "Approve Reward",
        secondaryDecision: "reject",
        secondaryLabel: "Reject",
      };
    }

    if (normalized === "checkin") {
      return {
        primaryDecision: "approved",
        primaryLabel: "Approve",
        secondaryDecision: "needs_follow_up",
        secondaryLabel: "Needs Follow-Up",
      };
    }

    if (normalized === "progress_photo") {
      return {
        primaryDecision: "reviewed",
        primaryLabel: "Mark Reviewed",
        secondaryDecision: "pending",
        secondaryLabel: "Keep Pending",
      };
    }

    return {
      primaryDecision: "approved",
      primaryLabel: "Approve",
      secondaryDecision: "needs_revision",
      secondaryLabel: "Needs Revision",
    };
  }

  function createEmptyQuestion(index, cadence = "weekly") {
    return {
      id: buildLocalId("question"),
      fieldKey: cadence === "daily" ? `daily_field_${index}` : `weekly_field_${index}`,
      label: cadence === "daily" ? `Daily question ${index}` : `Weekly question ${index}`,
      questionType: index === 1 ? "rating" : "textarea",
      isRequired: true,
      helpText: "",
      optionsText: "",
    };
  }

  function createDefaultQuestionSet(cadence = "weekly") {
    if (cadence === "daily") {
      return [
        {
          id: buildLocalId("question"),
          fieldKey: "training_completion",
          label: "Did you complete your planned training today?",
          questionType: "single_select",
          isRequired: true,
          helpText: "Choose the option that best reflects your day.",
          optionsText: "Completed,Partial,Missed,Rest day",
        },
        {
          id: buildLocalId("question"),
          fieldKey: "sleep_quality",
          label: "How was your sleep quality last night?",
          questionType: "rating",
          isRequired: true,
          helpText: "Use 1-3 for poor sleep, 4-6 for mixed sleep, 7-8 for solid sleep, and 9-10 for excellent sleep quality.",
          optionsText: "",
        },
        {
          id: buildLocalId("question"),
          fieldKey: "stress_load",
          label: "How high was your stress load today?",
          questionType: "rating",
          isRequired: true,
          helpText: "Use 1-3 for calm/manageable, 4-6 for moderate, 7-8 for heavy, and 9-10 for overwhelming stress.",
          optionsText: "",
        },
        {
          id: buildLocalId("question"),
          fieldKey: "soreness_or_pain",
          label: "Any soreness, pain, or movement restriction to flag?",
          questionType: "textarea",
          isRequired: false,
          helpText: "Keep this specific so your coach can adjust training early.",
          optionsText: "",
        },
        {
          id: buildLocalId("question"),
          fieldKey: "digestion",
          label: "How did digestion and appetite feel today?",
          questionType: "single_select",
          isRequired: false,
          helpText: "This helps your coach see how nutrition and stress are landing.",
          optionsText: "Good,Okay,Off today",
        },
        {
          id: buildLocalId("question"),
          fieldKey: "recovery_note",
          label: "Anything else your coach should know before tomorrow?",
          questionType: "textarea",
          isRequired: false,
          helpText: "Use this for context that does not fit the other prompts.",
          optionsText: "",
        },
      ];
    }

    return [
      {
        id: buildLocalId("question"),
        fieldKey: "wins",
        label: "What were your biggest wins this week?",
        questionType: "textarea",
        isRequired: true,
        helpText: "Focus on what moved forward in training, nutrition, recovery, or lifestyle.",
        optionsText: "",
      },
      {
        id: buildLocalId("question"),
        fieldKey: "barriers",
        label: "What got in the way this week?",
        questionType: "textarea",
        isRequired: true,
        helpText: "Call out schedule issues, pain, low motivation, travel, or adherence friction.",
        optionsText: "",
      },
      {
        id: buildLocalId("question"),
        fieldKey: "sleep_quality",
        label: "How was your sleep quality this week?",
        questionType: "rating",
        isRequired: true,
        helpText: "Use 1-3 for poor sleep, 4-6 for mixed sleep, 7-8 for solid sleep, and 9-10 for excellent sleep quality.",
        optionsText: "",
      },
      {
        id: buildLocalId("question"),
        fieldKey: "stress_load",
        label: "How manageable was your stress load this week?",
        questionType: "rating",
        isRequired: true,
        helpText: "Use 1-3 for calm/manageable, 4-6 for moderate, 7-8 for heavy, and 9-10 for overwhelming stress pressure.",
        optionsText: "",
      },
      {
        id: buildLocalId("question"),
        fieldKey: "bodyweight",
        label: "What is your current bodyweight?",
        questionType: "number",
        isRequired: false,
        helpText: "Use the same weighing conditions each week if tracked.",
        optionsText: "",
      },
      {
        id: buildLocalId("question"),
        fieldKey: "digestion",
        label: "How were appetite and digestion this week?",
        questionType: "textarea",
        isRequired: false,
        helpText: "Mention anything that could affect recovery, training, or food quality.",
        optionsText: "",
      },
      {
        id: buildLocalId("question"),
        fieldKey: "soreness_or_pain",
        label: "Any soreness, pain, or movement issues to flag?",
        questionType: "textarea",
        isRequired: false,
        helpText: "This helps the coach adjust the coming week before something escalates.",
        optionsText: "",
      },
      {
        id: buildLocalId("question"),
        fieldKey: "next_week_focus",
        label: "What needs to improve next week?",
        questionType: "textarea",
        isRequired: true,
        helpText: "This gives the coach a clear adjustment target.",
        optionsText: "",
      },
    ];
  }

  function queueRefresh() {
    window.clearTimeout(state.refreshTimer);
    state.refreshTimer = window.setTimeout(() => {
      fetchPlannerData(true).catch(() => null);
    }, 350);
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

    const access = await window.legacyAuth.requireRole("coach");
    if (!access.ok) {
      throw new Error("No coach session is active.");
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

  function normalizeOpsInteger(value, fallback = 0, min = 0, max = 100) {
    const numeric = parseInteger(value);
    if (!Number.isFinite(numeric)) {
      return fallback;
    }
    return Math.max(min, Math.min(max, numeric));
  }

  function coachOpsSegmentMatchesClient(client, segment) {
    const filters = segment?.filters || {};
    if (Number(filters.riskMin || 0) > 0 && Number(client.riskScore || 0) < Number(filters.riskMin || 0)) {
      return false;
    }
    if (Number(filters.pendingReviewsMin || 0) > 0 && Number(client.pendingReviews || 0) < Number(filters.pendingReviewsMin || 0)) {
      return false;
    }
    if (filters.needsNutritionNudge && !client.needsNutritionNudge) {
      return false;
    }
    if (filters.needsCheckinNudge && !client.needsCheckinNudge) {
      return false;
    }
    if (filters.needsTrainingNudge && !client.needsTrainingNudge) {
      return false;
    }
    if (filters.needsPhotoNudge && !client.needsPhotoNudge) {
      return false;
    }
    if (filters.quietThisWeek && !client.quietThisWeek) {
      return false;
    }
    if (filters.hasNoNutrition && client.activeNutrition) {
      return false;
    }
    if (filters.hasNoProgram && client.activeProgram) {
      return false;
    }
    return true;
  }

  function buildSegmentDraftFromForm() {
    return {
      id: buildLocalId("ops-segment"),
      name: compactText(segmentNameNode?.value).slice(0, 72),
      filters: {
        riskMin: normalizeOpsInteger(segmentRiskNode?.value, 0, 0, 100),
        pendingReviewsMin: normalizeOpsInteger(segmentReviewsNode?.value, 0, 0, 20),
        needsNutritionNudge: Boolean(segmentNutritionNode?.checked),
        needsCheckinNudge: Boolean(segmentCheckinNode?.checked),
        needsTrainingNudge: Boolean(segmentTrainingNode?.checked),
        needsPhotoNudge: Boolean(segmentPhotoNode?.checked),
        quietThisWeek: Boolean(segmentQuietNode?.checked),
        hasNoNutrition: Boolean(segmentNoNutritionNode?.checked),
        hasNoProgram: Boolean(segmentNoProgramNode?.checked),
      },
    };
  }

  function buildAutomationRuleDraftFromForm() {
    return {
      id: buildLocalId("ops-rule"),
      name: compactText(automationNameNode?.value).slice(0, 72),
      segmentId: compactText(automationSegmentNode?.value),
      category: compactText(automationCategoryNode?.value).toLowerCase() || "nutrition",
      schedule: compactText(automationScheduleNode?.value).toLowerCase() || "daily_morning",
      cooldownHours: normalizeOpsInteger(automationCooldownNode?.value, 24, 1, 168),
      message: compactText(automationMessageNode?.value).slice(0, 320),
      enabled: Boolean(automationEnabledNode?.checked),
    };
  }

  function getCoachOpsSegmentMatches(derived, segmentId) {
    const segment = state.coachOps.segments.find((item) => item.id === segmentId);
    if (!segment) {
      return [];
    }
    return (derived.roster || []).filter((client) => coachOpsSegmentMatchesClient(client, segment));
  }

  async function fetchCoachOpsPreferences() {
    let preferences = window.legacyAccountPreferences;
    if (!preferences || typeof preferences !== "object" || !Object.keys(preferences).length) {
      const sharedRequest = window.legacyAccountPreferencesPromise;
      if (sharedRequest && typeof sharedRequest.then === "function") {
        preferences = await sharedRequest.catch(() => null);
      }
    }
    if (!preferences || typeof preferences !== "object") {
      const payload = await plannerRequest("/.netlify/functions/get-user-preferences");
      preferences = payload?.preferences && typeof payload.preferences === "object" ? payload.preferences : {};
    }
    state.coachOps.segments = Array.isArray(preferences.coachOpsSegments) ? preferences.coachOpsSegments : [];
    state.coachOps.automationRules = Array.isArray(preferences.coachAutomationRules) ? preferences.coachAutomationRules : [];
    state.coachOps.weeklyBriefingEnabled = preferences.coachWeeklyBriefingEnabled !== false;
    if (weeklyBriefingEnabledNode) {
      weeklyBriefingEnabledNode.checked = state.coachOps.weeklyBriefingEnabled;
    }
  }

  async function saveCoachOpsPreferences(patch, successMessage) {
    const payload = await plannerRequest("/.netlify/functions/save-user-preferences", {
      method: "POST",
      body: patch,
    });
    const preferences = payload?.preferences && typeof payload.preferences === "object" ? payload.preferences : {};
    state.coachOps.segments = Array.isArray(preferences.coachOpsSegments) ? preferences.coachOpsSegments : state.coachOps.segments;
    state.coachOps.automationRules = Array.isArray(preferences.coachAutomationRules) ? preferences.coachAutomationRules : state.coachOps.automationRules;
    state.coachOps.weeklyBriefingEnabled = preferences.coachWeeklyBriefingEnabled !== false;
    if (weeklyBriefingEnabledNode) {
      weeklyBriefingEnabledNode.checked = state.coachOps.weeklyBriefingEnabled;
    }
    renderOperationsSegments(deriveWorkspace());
    renderAutomationSegmentOptions();
    renderAutomationRules(deriveWorkspace());
    if (successMessage) {
      setStatus(successMessage, false);
    }
    return preferences;
  }

  async function fetchPlannerData(isSilent) {
    if (!isSilent) {
      setStatus(resolveWorkspaceCopy().loading, false);
    }

    try {
      const payload = await plannerRequest("/.netlify/functions/load-planner-data?refresh=1");
      state.data = {
        ...EMPTY_DATA,
        ...(payload?.data || {}),
      };
      renderAll();
      const derived = deriveWorkspace();
      setStatus(resolveWorkspaceCopy().liveSummary(derived), false);
    } catch (error) {
      const message = String(error?.message || "");
      if (/does not exist/iu.test(message) || /relation/iu.test(message)) {
        setStatus(
          "Planner UI is scaffolded, but the new planner tables have not been applied to the running database yet.",
          true
        );
      } else {
        setStatus(message || "Unable to load the planner workspace right now.", true);
      }
      renderAll();
      throw error;
    }
  }

  function getClientDirectory() {
    const map = new Map();

    (state.data.rosterProfiles || []).forEach((profile) => {
      map.set(profile.id, {
        id: profile.id,
        displayName: profile.display_name || "Client",
        avatarUrl: profile.avatar_url || "",
        profileStatus: profile.status || "active",
        preferredName: "",
        primaryGoal: "",
        memberId: "",
        xpPoints: 0,
        gymCoins: 0,
      });
    });

    (state.data.rosterDetails || []).forEach((detail) => {
      const existing = map.get(detail.id) || {
        id: detail.id,
        displayName: detail.preferred_name || "Client",
        avatarUrl: "",
        profileStatus: "active",
      };
      map.set(detail.id, {
        ...existing,
        preferredName: detail.preferred_name || existing.preferredName || "",
        primaryGoal: detail.primary_goal || existing.primaryGoal || "",
        memberId: detail.member_id || existing.memberId || "",
        xpPoints: Number(detail.xp_points || existing.xpPoints || 0),
        gymCoins: Number(detail.gym_coins || existing.gymCoins || 0),
      });
    });

    return map;
  }

  function sortByDateDescending(items, key) {
    return (items || []).slice().sort((left, right) => {
      const leftTime = new Date(left?.[key] || 0).getTime();
      const rightTime = new Date(right?.[key] || 0).getTime();
      return rightTime - leftTime;
    });
  }

  function deriveWorkspace() {
    const clientDirectory = getClientDirectory();
    const templates = sortByDateDescending(state.data.templates, "updated_at");
    const checkinTemplates = sortByDateDescending(state.data.checkinTemplates, "updated_at");
    const programAssignments = sortByDateDescending(state.data.programAssignments, "updated_at")
      .filter((assignment) => isEditableAssignmentStatus(assignment?.status));
    const liveAssignmentIds = new Set(programAssignments.map((assignment) => assignment.id).filter(Boolean));
    const programDays = (state.data.programDays || [])
      .filter((day) => liveAssignmentIds.has(day.assignment_id))
      .slice()
      .sort((left, right) => {
      return new Date(left?.scheduled_date || 0).getTime() - new Date(right?.scheduled_date || 0).getTime();
      });
    const nutritionPlans = sortByDateDescending(state.data.nutritionPlans, "updated_at");
    const workoutLogs = sortByDateDescending(state.data.workoutLogs, "updated_at");
    const nutritionLogs = sortByDateDescending(state.data.nutritionLogs, "updated_at");
    const mealEntries = sortByDateDescending(state.data.mealEntries, "updated_at");
    const mealItemsByEntry = new Map();
    (state.data.mealItems || [])
      .slice()
      .sort((left, right) => Number(left?.sort_order || 0) - Number(right?.sort_order || 0))
      .forEach((item) => {
        const list = mealItemsByEntry.get(item.meal_entry_id) || [];
        list.push(item);
        mealItemsByEntry.set(item.meal_entry_id, list);
      });
    const nutritionPhotoSubmissions = sortByDateDescending(state.data.nutritionPhotoSubmissions, "updated_at");
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
    const checkins = sortByDateDescending(state.data.checkins, "due_at");
    const progressPhotos = sortByDateDescending(state.data.progressPhotos, "captured_at");
    const rewardEvents = sortByDateDescending(state.data.rewardEvents, "created_at");
    const weekStart = getStartOfWeek();
    const weekEnd = getEndOfWeek(weekStart);

    const roster = Array.from(clientDirectory.values())
      .map((client) => {
        const clientAssignments = programAssignments.filter((item) => item.client_id === client.id);
        const clientProgramDays = programDays.filter((item) => {
          const assignment = clientAssignments.find((candidate) => candidate.id === item.assignment_id);
          return Boolean(assignment);
        });
        const activeProgram =
          clientAssignments.find((item) => String(item.status || "").toLowerCase() === "active")
          || clientAssignments.find((item) => String(item.status || "").toLowerCase() === "paused")
          || null;
        const latestProgram = clientAssignments[0] || null;
        const activeNutrition =
          nutritionPlans.find((item) => item.client_id === client.id && isActiveStatus(item.status))
          || null;
        const clientWorkoutLogs = workoutLogs.filter((item) => item.client_id === client.id);
        const clientNutritionLogs = nutritionLogs.filter((item) => item.client_id === client.id);
        const clientMealEntries = mealEntries.filter((item) => item.client_id === client.id);
        const clientNutritionPhotoSubmissions = nutritionPhotoSubmissions.filter((item) => item.client_id === client.id);
        const clientCheckins = checkins.filter((item) => item.client_id === client.id);
        const clientPhotos = progressPhotos.filter((item) => item.client_id === client.id);
        const clientRewards = rewardEvents.filter((item) => item.client_id === client.id);
        const weeklyProgramDays = clientProgramDays.filter((item) =>
          isTimestampWithinRange(item.scheduled_date, weekStart, weekEnd)
        );
        const weeklyWorkoutLogs = clientWorkoutLogs.filter((item) =>
          isTimestampWithinRange(item.completed_at || item.updated_at || item.created_at, weekStart, weekEnd)
        );
        const weeklyNutritionLogs = clientNutritionLogs.filter((item) =>
          isTimestampWithinRange(item.log_date || item.updated_at || item.created_at, weekStart, weekEnd)
        );
        const weeklyMealEntries = clientMealEntries.filter((item) =>
          isTimestampWithinRange(item.log_date || item.updated_at || item.created_at, weekStart, weekEnd)
        );
        const weeklyNutritionPhotos = clientNutritionPhotoSubmissions.filter((item) =>
          isTimestampWithinRange(item.log_date || item.updated_at || item.created_at, weekStart, weekEnd)
        );
        const weeklyCheckins = clientCheckins.filter((item) =>
          isTimestampWithinRange(item.submitted_at || item.due_at || item.created_at, weekStart, weekEnd)
        );
        const mealPlanDays = Array.isArray(activeNutrition?.meal_plan?.days)
          ? activeNutrition.meal_plan.days.filter((day) => day && Array.isArray(day.slots) && day.slots.length)
          : [];
        const mealPlanDayCount = mealPlanDays.length;
        const mealPlanSlotCount = mealPlanDays.reduce((sum, day) => sum + (Array.isArray(day.slots) ? day.slots.length : 0), 0);

        const latestWorkoutLog = clientWorkoutLogs[0] || null;
        const latestNutritionLog = clientNutritionLogs[0] || null;
        const latestMealEntry = clientMealEntries[0] || null;
        const latestNutritionPhotoSubmission = clientNutritionPhotoSubmissions[0] || null;
        const latestCheckin = clientCheckins[0] || null;
        const latestPhoto = clientPhotos[0] || null;
        const lastWorkoutAt = latestWorkoutLog?.completed_at || latestWorkoutLog?.updated_at || latestWorkoutLog?.created_at || "";
        const lastNutritionAt = latestNutritionLog?.updated_at || latestNutritionLog?.created_at || latestNutritionLog?.log_date || "";
        const lastMealAt = latestMealEntry?.updated_at || latestMealEntry?.created_at || latestMealEntry?.log_date || "";
        const lastMealPhotoAt = latestNutritionPhotoSubmission?.updated_at || latestNutritionPhotoSubmission?.created_at || latestNutritionPhotoSubmission?.log_date || "";
        const lastCheckinAt = latestCheckin?.submitted_at || latestCheckin?.updated_at || latestCheckin?.created_at || "";
        const lastPhotoAt = latestPhoto?.captured_at || latestPhoto?.created_at || "";
        const lastActivityAt = getLatestTimestamp(lastWorkoutAt, lastNutritionAt, lastMealAt, lastMealPhotoAt, lastCheckinAt, lastPhotoAt);
        const daysSinceWorkout = daysBetween(lastWorkoutAt);
        const daysSinceNutrition = daysBetween(lastNutritionAt);
        const daysSinceMeal = daysBetween(lastMealAt);
        const daysSinceCheckin = daysBetween(lastCheckinAt);
        const daysSincePhoto = daysBetween(lastPhotoAt);
        const daysSinceActivity = daysBetween(lastActivityAt);

        const pendingReviews =
          clientWorkoutLogs.filter((item) => String(item.review_status || "").toLowerCase() === "pending").length
          + clientNutritionLogs.filter((item) => String(item.review_status || "").toLowerCase() === "pending").length
          + clientMealEntries.filter((item) => String(item.review_status || "").toLowerCase() === "pending").length
          + clientNutritionPhotoSubmissions.filter((item) => String(item.review_status || "").toLowerCase() === "pending").length
          + clientCheckins.filter((item) => String(item.review_status || "").toLowerCase() === "pending").length
          + clientPhotos.filter((item) => String(item.review_status || "").toLowerCase() === "pending").length
          + clientRewards.filter((item) => String(item.approval_status || "").toLowerCase() === "pending").length;

        const overdueCheckins = clientCheckins.filter((item) => {
          const status = String(item.status || "").toLowerCase();
          const isOpenStatus = ["due", "late", "missed"].includes(status);
          return isOpenStatus && new Date(item.due_at || 0).getTime() < Date.now();
        }).length;
        const openCheckins = clientCheckins
          .filter((item) => ["due", "late", "missed"].includes(String(item.status || "").toLowerCase()))
          .slice()
          .sort((left, right) => new Date(left.due_at || 0).getTime() - new Date(right.due_at || 0).getTime());
        const nextOpenCheckin = openCheckins[0] || null;

        const riskFlags = [];
        let riskScore = 0;

        if (!activeProgram) {
          riskScore += 34;
          riskFlags.push("No active program assigned");
        }

        if (!activeNutrition) {
          riskScore += 14;
          riskFlags.push("No active nutrition layer");
        }

        if (overdueCheckins > 0) {
          riskScore += Math.min(34, 18 + (overdueCheckins * 8));
          riskFlags.push(`${overdueCheckins} overdue health update${overdueCheckins === 1 ? "" : "s"}`);
        }

        const latestCheckinStatus = String(latestCheckin?.status || "").toLowerCase();
        if (["late", "missed"].includes(latestCheckinStatus)) {
          riskScore += 14;
          riskFlags.push(`Latest health update is ${latestCheckinStatus}`);
        }

        if (daysSinceActivity > 21) {
          riskScore += 34;
          riskFlags.push("No planner activity for 21+ days");
        } else if (daysSinceActivity > 14) {
          riskScore += 26;
          riskFlags.push("No planner activity for 14+ days");
        } else if (daysSinceActivity > 7) {
          riskScore += 12;
          riskFlags.push("No planner activity in the last week");
        }

        if (daysSinceWorkout > 10) {
          riskScore += 16;
          riskFlags.push("No recent training log");
        }

        if (daysSinceNutrition > 7) {
          riskScore += 10;
          riskFlags.push("No recent nutrition log");
        }

        if (daysSinceMeal > 7) {
          riskScore += 8;
          riskFlags.push("No recent meal diary update");
        }

        if (daysSincePhoto > 28) {
          riskScore += 8;
          riskFlags.push("Progress photos are stale");
        }

        if (pendingReviews > 2) {
          riskScore += 6;
          riskFlags.push("Coach review backlog is building");
        }

        const normalizedRiskScore = Math.min(100, riskScore);
        const riskTone = normalizedRiskScore >= 70 ? "alert" : normalizedRiskScore >= 40 ? "warning" : "success";
        const riskLabel = normalizedRiskScore >= 70
          ? "High risk"
          : normalizedRiskScore >= 40
            ? "Needs attention"
            : "Stable";
        const isStale = daysSinceActivity > 14 || (
          !lastActivityAt
          && (activeProgram || activeNutrition || latestCheckin || latestPhoto)
        );
        const staleReason = isStale
          ? (lastActivityAt
              ? `Last planner activity ${formatDate(lastActivityAt)}`
              : "No submitted planner activity yet")
          : "";
        const nextPriority =
          !activeProgram
            ? "Assign a new training block"
            : overdueCheckins > 0
              ? "Follow up on the missed health update"
              : !activeNutrition
                ? "Attach the nutrition layer"
                : daysSincePhoto > 28
                ? "Request a new progress photo"
                : "Keep weekly cadence steady";

        const needsNutritionNudge = Boolean(activeNutrition) && weeklyMealEntries.length === 0 && daysSinceMeal > 1;
        const needsTrainingNudge = Boolean(activeProgram) && weeklyWorkoutLogs.length === 0 && daysSinceWorkout > 3;
        const needsCheckinNudge = overdueCheckins > 0;
        const needsPhotoNudge = Boolean(activeProgram || activeNutrition) && daysSincePhoto > 21;
        const quietThisWeek =
          weeklyWorkoutLogs.length === 0
          && weeklyNutritionLogs.length === 0
          && weeklyMealEntries.length === 0
          && weeklyNutritionPhotos.length === 0
          && weeklyCheckins.length === 0;

        const operationsFlags = [];
        if (needsNutritionNudge) {
          operationsFlags.push("Needs nutrition logging nudge");
        }
        if (needsCheckinNudge) {
          operationsFlags.push("Needs health check-in follow-up");
        }
        if (needsTrainingNudge) {
          operationsFlags.push("Needs training rhythm prompt");
        }
        if (needsPhotoNudge) {
          operationsFlags.push("Needs progress photo refresh");
        }
        if (quietThisWeek && daysSinceActivity > 3) {
          operationsFlags.push("Quiet across the planner this week");
        }

        const recommendedNudgeCategory = needsCheckinNudge
          ? "checkin"
          : needsNutritionNudge
            ? "nutrition"
            : needsTrainingNudge
              ? "training"
              : needsPhotoNudge
                ? "progress_photo"
                : "";

        const operationsPriority =
          normalizedRiskScore
          + (needsCheckinNudge ? 24 : 0)
          + (needsNutritionNudge ? 18 : 0)
          + (needsTrainingNudge ? 14 : 0)
          + (needsPhotoNudge ? 10 : 0)
          + (quietThisWeek && daysSinceActivity > 3 ? 12 : 0);

        return {
          ...client,
          activeProgram,
          latestProgram,
          programDays: clientProgramDays,
          activeNutrition,
          latestWorkoutLog,
          latestNutritionLog,
          latestMealEntry,
          latestNutritionPhotoSubmission,
          latestCheckin,
          latestPhoto,
          pendingReviews,
          overdueCheckins,
          nextOpenCheckin,
          lastWorkoutAt,
          lastNutritionAt,
          lastCheckinAt,
          lastPhotoAt,
          lastActivityAt,
          daysSinceWorkout,
          daysSinceNutrition,
          daysSinceMeal,
          daysSinceCheckin,
          daysSincePhoto,
          daysSinceActivity,
          weeklyWorkoutCount: weeklyWorkoutLogs.length,
          weeklyProgramDayCount: weeklyProgramDays.length,
          weeklyNutritionCount: weeklyNutritionLogs.length,
          weeklyMealCount: weeklyMealEntries.length,
          weeklyNutritionPhotoCount: weeklyNutritionPhotos.length,
          weeklyCheckinCount: weeklyCheckins.length,
          mealPlanDayCount,
          mealPlanSlotCount,
          riskScore: normalizedRiskScore,
          riskTone,
          riskLabel,
          riskFlags: riskFlags.slice(0, 4),
          isStale,
          staleReason,
          nextPriority,
          needsNutritionNudge,
          needsTrainingNudge,
          needsCheckinNudge,
          needsPhotoNudge,
          quietThisWeek,
          operationsFlags: operationsFlags.slice(0, 4),
          recommendedNudgeCategory,
          operationsPriority,
        };
      })
      .sort((left, right) => String(left.displayName || left.preferredName).localeCompare(String(right.displayName || right.preferredName)));

    const signals = [
      {
        tone: "warning",
        title: "Overdue Health Forms",
        value: roster.filter((client) => client.overdueCheckins > 0).length,
        detail: "Clients with health forms already past due or marked late.",
      },
      {
        tone: "neutral",
        title: "No Active Nutrition",
        value: roster.filter((client) => !client.activeNutrition).length,
        detail: "Assigned clients who still need a live nutrition layer attached.",
      },
      {
        tone: "neutral",
        title: "No Recent Photo",
        value: roster.filter((client) => daysBetween(client.latestPhoto?.captured_at) > 21).length,
        detail: "Clients missing a progress photo in the last 21 days.",
      },
      {
        tone: "alert",
        title: "At-Risk Clients",
        value: roster.filter((client) => client.riskScore >= 40).length,
        detail: "Clients slipping on cadence, review, or adherence signals.",
      },
      {
        tone: "info",
        title: "Pending Reviews",
        value: roster.reduce((sum, client) => sum + client.pendingReviews, 0),
        detail: "Training, nutrition, health, photo, and reward items waiting for review.",
      },
    ];

    const checkinTemplateById = new Map(checkinTemplates.map((template) => [template.id, template]));
    const rosterById = new Map(roster.map((client) => [client.id, client]));
    const pendingReviewItems = [
      ...workoutLogs
        .filter((item) => String(item.review_status || "").toLowerCase() === "pending")
        .map((item) => ({
          id: item.id,
          type: "workout_log",
          title: "Training log",
          submittedAt: item.completed_at || item.updated_at || item.created_at,
          clientId: item.client_id,
          coachId: item.coach_id,
          status: item.log_status || "pending",
          reviewStatus: item.review_status || "pending",
          summary: item.client_feedback || "Training log submitted and waiting for coach review.",
          detailChips: [
            item.completed_at ? `Completed ${formatDate(item.completed_at)}` : "",
            item.duration_minutes ? `${formatCount(item.duration_minutes)} min` : "",
            item.session_rpe ? `Session RPE ${formatCount(item.session_rpe)}` : "",
          ].filter(Boolean),
        })),
      ...nutritionLogs
        .filter((item) => String(item.review_status || "").toLowerCase() === "pending")
        .map((item) => ({
          id: item.id,
          type: "nutrition_log",
          title: "Nutrition log",
          submittedAt: item.updated_at || item.created_at || item.log_date,
          clientId: item.client_id,
          coachId: item.coach_id,
          status: item.status || "partial",
          reviewStatus: item.review_status || "pending",
          summary:
            item.note
            || `${Number(item.balanced_meals_count || 0)} balanced meals • ${item.meal_prep_completed ? "Meal prep hit" : "Meal prep not logged"}`,
          detailChips: [
            item.log_date ? `Log ${formatDate(item.log_date)}` : "",
            Number.isFinite(Number(item.calories_logged)) && Number(item.calories_logged) > 0 ? `${formatCount(item.calories_logged)} kcal` : "",
            Number.isFinite(Number(item.protein_logged_g)) && Number(item.protein_logged_g) > 0 ? `${formatCount(item.protein_logged_g)}g protein` : "",
            item.status ? toTitleCase(String(item.status).replace(/_/gu, " ")) : "",
          ].filter(Boolean),
        })),
      ...mealEntries
        .filter((item) => String(item.review_status || "").toLowerCase() === "pending")
        .map((item) => {
          const mealItems = mealItemsByEntry.get(item.id) || [];
          const linkedPhoto = item.nutrition_photo_submission_id
            ? nutritionPhotoSubmissions.find((submission) => submission.id === item.nutrition_photo_submission_id)
            : null;
          return {
            id: item.id,
            type: "meal_entry",
            title: item.title || toTitleCase(String(item.meal_type || "meal").replace(/_/gu, " ")),
            submittedAt: item.updated_at || item.created_at || item.log_date,
            clientId: item.client_id,
            coachId: item.coach_id,
            status: item.review_status || "pending",
            reviewStatus: item.review_status || "pending",
            summary: `${formatMacroValue(item.total_calories_kcal, " kcal")} • ${formatMacroValue(item.total_protein_g, "g protein")}`,
            note: item.note || item.coach_comment || "",
            detailChips: [
              item.log_date ? `Log ${formatDate(item.log_date)}` : "",
              mealItems.length ? `${mealItems.length} food item${mealItems.length === 1 ? "" : "s"}` : "",
              item.source_type ? toTitleCase(String(item.source_type).replace(/_/gu, " ")) : "",
              linkedPhoto?.id ? "Photo-linked meal" : "",
            ].filter(Boolean),
          };
        }),
      ...nutritionPhotoSubmissions
        .filter((item) => String(item.review_status || "").toLowerCase() === "pending" && (item.low_confidence || String(item.extraction_status || "").toLowerCase() !== "processed"))
        .map((item) => {
          const candidates = nutritionPhotoCandidatesBySubmission.get(item.id) || [];
          const matchedCount = candidates.filter((candidate) => candidate.food_id).length;
          const unmatchedCount = Math.max(0, candidates.length - matchedCount);
          const candidatePreview = candidates
            .slice(0, 3)
            .map((candidate) => resolvePhotoCandidateLabel(candidate, catalogFoodById))
            .filter(Boolean)
            .join(" • ");
          return {
            id: item.id,
            type: "nutrition_photo",
            title: item.meal_title || toTitleCase(String(item.meal_type || "meal photo").replace(/_/gu, " ")),
            submittedAt: item.updated_at || item.created_at || item.log_date,
            clientId: item.client_id,
            coachId: item.coach_id,
            status: item.confidence_band || "low",
            reviewStatus: item.review_status || "pending",
            confidenceScore: Number(item.confidence_score || 0) || 0,
            lowConfidence: Boolean(item.low_confidence),
            extractionStatus: item.extraction_status || "pending",
            summary: `${Math.round(Number(item.confidence_score || 0) * 100)}% confidence • ${matchedCount} matched candidate${matchedCount === 1 ? "" : "s"}`,
            note: item.correction_note || item.coach_comment || item.metadata?.aiProvider || "",
            detailChips: [
              item.confidence_band ? `${toTitleCase(item.confidence_band)} confidence` : "",
              matchedCount ? `${matchedCount} matched` : "0 matched",
              unmatchedCount ? `${unmatchedCount} manual match${unmatchedCount === 1 ? "" : "es"}` : "",
              item.extraction_status ? toTitleCase(String(item.extraction_status).replace(/_/gu, " ")) : "",
              candidatePreview || "",
            ].filter(Boolean),
          };
        }),
      ...checkins
        .filter((item) => String(item.review_status || "").toLowerCase() === "pending" && item.submitted_at)
        .map((item) => ({
          id: item.id,
          type: "checkin",
          title: checkinTemplateById.get(item.template_id)?.title || "Health update",
          submittedAt: item.submitted_at || item.due_at || item.created_at,
          clientId: item.client_id,
          coachId: item.coach_id,
          status: item.status || "submitted",
          reviewStatus: item.review_status || "pending",
          summary: item.coach_comment || `Adherence score ${item.overall_adherence_score ?? "not logged"}`,
          detailChips: [
            item.submitted_at ? `Submitted ${formatDate(item.submitted_at)}` : "",
            item.due_at ? `Due ${formatDate(item.due_at)}` : "",
            item.status ? toTitleCase(String(item.status).replace(/_/gu, " ")) : "",
          ].filter(Boolean),
        })),
      ...progressPhotos
        .filter((item) => String(item.review_status || "").toLowerCase() === "pending")
        .map((item) => ({
          id: item.id,
          type: "progress_photo",
          title: "Progress photo batch",
          submittedAt: item.captured_at || item.created_at,
          clientId: item.client_id,
          coachId: item.coach_id,
          status: item.capture_period || "captured",
          reviewStatus: item.review_status || "pending",
          summary: item.client_note || "Front, side, and back progress photos submitted for review.",
          detailChips: [
            item.capture_period ? toTitleCase(String(item.capture_period).replace(/_/gu, " ")) : "",
            item.captured_at ? formatDate(item.captured_at) : "",
            formatProgressPhotoAiEstimate(item) ? `AI ${formatProgressPhotoAiEstimate(item)}` : "",
          ].filter(Boolean),
        })),
      ...rewardEvents
        .filter((item) => String(item.approval_status || "").toLowerCase() === "pending")
        .map((item) => ({
          id: item.id,
          type: "reward_event",
          title: item.action_id || "Reward event",
          submittedAt: item.created_at,
          clientId: item.client_id,
          coachId: item.coach_id,
          status: item.approval_status || "pending",
          reviewStatus: item.approval_status || "pending",
          summary: `XP ${Number(item.proposed_xp || 0)} • Coins ${Number(item.proposed_coins || 0)}`,
          detailChips: [
            item.action_id || "",
            item.source_module ? toTitleCase(String(item.source_module).replace(/_/gu, " ")) : "",
          ].filter(Boolean),
        })),
    ]
      .map((item) => {
        const config = getReviewItemConfig(item.type);
        const client = rosterById.get(item.clientId) || null;
        const submittedTime = new Date(item.submittedAt || 0).getTime();
        const ageDays = Number.isFinite(submittedTime) && submittedTime > 0
          ? Math.max(0, Math.floor((Date.now() - submittedTime) / 86400000))
          : 0;
        const riskScore = Number(client?.riskScore || 0);
        const priorityScore =
          config.priorityBase
          + riskScore
          + ageDays
          + (item.type === "nutrition_photo" && item.lowConfidence ? 18 : 0)
          + (String(item.status || "").toLowerCase() === "late" ? 10 : 0)
          + (String(item.status || "").toLowerCase() === "missed" ? 16 : 0);

        return {
          ...item,
          ...config,
          clientName: client?.preferredName || client?.displayName || "Client",
          clientRiskLabel: client?.riskLabel || "Stable",
          clientRiskTone: client?.riskTone || "success",
          clientRiskScore: riskScore,
          clientPendingReviews: Number(client?.pendingReviews || 0),
          priorityScore,
          ageDays,
          detailChips: [
            `Client risk ${client?.riskLabel || "Stable"}`,
            client?.pendingReviews ? `${client.pendingReviews} pending` : "",
            ...((item.detailChips || []).slice(0, 4)),
          ].filter(Boolean),
        };
      })
      .sort((left, right) => {
        if (right.priorityScore !== left.priorityScore) {
          return right.priorityScore - left.priorityScore;
        }
        return new Date(right.submittedAt || 0).getTime() - new Date(left.submittedAt || 0).getTime();
      });

    const reviewSummary = {
      lowConfidencePhotos: pendingReviewItems.filter((item) => item.type === "nutrition_photo").length,
      mealDiaryPending: pendingReviewItems.filter((item) => ["meal_entry", "nutrition_log"].includes(item.type)).length,
      healthPending: pendingReviewItems.filter((item) => ["checkin", "progress_photo"].includes(item.type)).length,
      trainingPending: pendingReviewItems.filter((item) => ["workout_log", "reward_event"].includes(item.type)).length,
      nutritionBacklogClients: new Set(
        pendingReviewItems
          .filter((item) => item.domain === "nutrition")
          .map((item) => item.clientId)
          .filter(Boolean)
      ).size,
      recipesLive: recipes.length,
      coachFoodCount: Number(state.data.coachFoodCount || 0),
    };

    const operationsSummary = [
      {
        tone: "warning",
        label: "Nutrition Nudges",
        value: roster.filter((client) => client.needsNutritionNudge).length,
        detail: "Clients with active nutrition plans but no meal diary movement this week.",
      },
      {
        tone: "alert",
        label: "Health Follow-Up",
        value: roster.filter((client) => client.needsCheckinNudge).length,
        detail: "Clients with overdue or late health check-ins waiting on action.",
      },
      {
        tone: "info",
        label: "Quiet Roster",
        value: roster.filter((client) => client.quietThisWeek && client.daysSinceActivity > 3).length,
        detail: "Clients who have gone quiet across training, nutrition, and health this week.",
      },
      {
        tone: "neutral",
        label: "Photo Refresh",
        value: roster.filter((client) => client.needsPhotoNudge).length,
        detail: "Clients who likely need a new progress photo this cycle.",
      },
    ];

    const operationsCandidates = roster
      .filter((client) =>
        client.needsNutritionNudge
        || client.needsCheckinNudge
        || client.needsTrainingNudge
        || client.needsPhotoNudge
        || (client.quietThisWeek && client.daysSinceActivity > 3)
      )
      .sort((left, right) => {
        if (right.operationsPriority !== left.operationsPriority) {
          return right.operationsPriority - left.operationsPriority;
        }
        return String(left.preferredName || left.displayName).localeCompare(String(right.preferredName || right.displayName));
      });

    const assignmentById = new Map(programAssignments.map((item) => [item.id, item]));
    const calendarRange = getCalendarWeekRange(state.calendar.weekOffset);
    const calendarClientId = String(state.calendar.clientId || "").trim();
    const calendarRoster = calendarClientId
      ? roster.filter((client) => client.id === calendarClientId)
      : roster;
    const calendarClientIds = new Set(calendarRoster.map((client) => client.id));
    const calendarDays = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(calendarRange.start);
      date.setDate(date.getDate() + index);
      return {
        key: toDateOnlyKey(date),
        date,
        weekdayKey: getWeekdayKeyFromDate(date),
        label: formatShortDayLabel(date),
        events: [],
      };
    });
    const calendarDayByKey = new Map(calendarDays.map((day) => [day.key, day]));
    const calendarWorkoutLogs = workoutLogs.filter((item) =>
      calendarClientIds.has(item.client_id)
      && isTimestampWithinRange(item.completed_at || item.updated_at || item.created_at, calendarRange.start, calendarRange.end)
    );

    programDays.forEach((day) => {
      const assignment = assignmentById.get(day.assignment_id);
      if (!assignment || !calendarClientIds.has(assignment.client_id)) {
        return;
      }
      const dayKey = toDateOnlyKey(day.scheduled_date);
      const column = calendarDayByKey.get(dayKey);
      if (!column) {
        return;
      }
      const client = rosterById.get(assignment.client_id);
      column.events.push({
        id: `training-${day.id}`,
        type: "training",
        tone: String(day.status || "").toLowerCase() === "completed" ? "success" : "info",
        assignmentId: assignment.id || "",
        clientId: assignment.client_id,
        clientName: client?.preferredName || client?.displayName || "Client",
        title: day.title || "Training day",
        summary: day.focus || assignment.title || "Scheduled training block",
        templateId: assignment.template_id || "",
        chips: [
          assignment.title ? `Block: ${assignment.title}` : "",
          day.day_type ? toTitleCase(String(day.day_type).replace(/_/gu, " ")) : "",
          day.status ? toTitleCase(String(day.status).replace(/_/gu, " ")) : "",
        ].filter(Boolean),
        actionPanel: "assignments",
      });
    });

    if (!isTrainingWorkspace()) {
      calendarRoster.forEach((client) => {
      const mealDays = Array.isArray(client.activeNutrition?.meal_plan?.days)
        ? client.activeNutrition.meal_plan.days.filter((day) => day && Array.isArray(day.slots) && day.slots.length)
        : [];
      if (!mealDays.length) {
        return;
      }
      const mealDayByKey = new Map(mealDays.map((day) => [String(day.key || "").toLowerCase(), day]));
      calendarDays.forEach((day) => {
        const mealDay = mealDayByKey.get(day.weekdayKey);
        if (!mealDay) {
          return;
        }
        day.events.push({
          id: `nutrition-${client.id}-${day.key}`,
          type: "nutrition",
          tone: "warning",
          clientId: client.id,
          clientName: client.preferredName || client.displayName || "Client",
          title: client.activeNutrition?.title || "Nutrition rhythm",
          summary: `${mealDay.slots.length} planned meal slot${mealDay.slots.length === 1 ? "" : "s"}`,
          chips: mealDay.slots.slice(0, 3).map((slot) => toTitleCase(String(slot.slotType || slot.title || "Meal").replace(/_/gu, " "))),
          actionPanel: "delivery",
        });
      });
      });
    }

    if (!isTrainingWorkspace()) {
      checkins.forEach((checkin) => {
        if (!calendarClientIds.has(checkin.client_id)) {
          return;
        }
        const dayKey = toDateOnlyKey(checkin.due_at || checkin.submitted_at);
        const column = calendarDayByKey.get(dayKey);
        if (!column) {
          return;
        }
        const client = rosterById.get(checkin.client_id);
        const template = checkinTemplateById.get(checkin.template_id);
        const status = String(checkin.status || "").toLowerCase();
        column.events.push({
          id: `checkin-${checkin.id}`,
          type: "checkin",
          tone: ["late", "missed"].includes(status) ? "alert" : checkin.submitted_at ? "success" : "warning",
          clientId: checkin.client_id,
          clientName: client?.preferredName || client?.displayName || "Client",
          title: template?.title || "Health check-in",
          summary: checkin.submitted_at ? "Submitted and ready for review" : "Due for completion",
          chips: [
            status ? toTitleCase(status.replace(/_/gu, " ")) : "",
            checkin.submitted_at ? `Submitted ${formatDate(checkin.submitted_at)}` : "",
          ].filter(Boolean),
          actionPanel: checkin.submitted_at ? "reviews" : "delivery",
        });
      });
    }

    if (!isTrainingWorkspace()) {
      progressPhotos.forEach((entry) => {
        if (!calendarClientIds.has(entry.client_id)) {
          return;
        }
        const dayKey = toDateOnlyKey(entry.captured_at || entry.created_at);
        const column = calendarDayByKey.get(dayKey);
        if (!column) {
          return;
        }
        const client = rosterById.get(entry.client_id);
        column.events.push({
          id: `progress-${entry.id}`,
          type: "progress",
          tone: String(entry.review_status || "").toLowerCase() === "pending" ? "warning" : "neutral",
          clientId: entry.client_id,
          clientName: client?.preferredName || client?.displayName || "Client",
          title: "Progress photo set",
          summary: entry.client_note || "Photo update captured for review.",
          chips: [
            entry.capture_period ? toTitleCase(String(entry.capture_period).replace(/_/gu, " ")) : "",
            entry.review_status ? toTitleCase(String(entry.review_status).replace(/_/gu, " ")) : "",
          ].filter(Boolean),
          actionPanel: "reviews",
        });
      });
    }

    calendarDays.forEach((day) => {
      day.events.sort((left, right) => {
        const order = { checkin: 0, training: 1, nutrition: 2, progress: 3 };
        return (order[left.type] ?? 99) - (order[right.type] ?? 99);
      });
    });

    const calendarAttention = calendarRoster
      .filter((client) => client.operationsFlags.length || client.pendingReviews || client.overdueCheckins)
      .sort((left, right) => {
        if (right.operationsPriority !== left.operationsPriority) {
          return right.operationsPriority - left.operationsPriority;
        }
        return right.pendingReviews - left.pendingReviews;
      })
      .slice(0, 8);

    const trainingEventCount = calendarDays.reduce((sum, day) => sum + day.events.filter((event) => event.type === "training").length, 0);
    const calendarSummary = isTrainingWorkspace()
      ? [
          {
            tone: "info",
            label: "Training Days",
            value: trainingEventCount,
            detail: "Scheduled training sessions inside the selected week.",
          },
          {
            tone: "success",
            label: "Workout Logs",
            value: calendarWorkoutLogs.length,
            detail: "Completed workout logs recorded inside the selected week.",
          },
          {
            tone: "neutral",
            label: "Athletes In View",
            value: calendarRoster.length,
            detail: "Coached athletes currently included in this calendar view.",
          },
          {
            tone: "warning",
            label: "Needs Coach Move",
            value: calendarAttention.length,
            detail: "Athletes who need a programming or follow-up move this week.",
          },
        ]
      : [
          {
            tone: "info",
            label: "Training Days",
            value: trainingEventCount,
            detail: "Scheduled training sessions inside the selected week.",
          },
          {
            tone: "warning",
            label: "Meal Rhythm Slots",
            value: calendarDays.reduce((sum, day) => sum + day.events.filter((event) => event.type === "nutrition").length, 0),
            detail: "Nutrition rhythm touchpoints loaded from live client meal plans.",
          },
          {
            tone: "alert",
            label: "Check-In Dates",
            value: calendarDays.reduce((sum, day) => sum + day.events.filter((event) => event.type === "checkin").length, 0),
            detail: "Health updates due or submitted during the selected week.",
          },
          {
            tone: "neutral",
            label: "Photo Touchpoints",
            value: calendarDays.reduce((sum, day) => sum + day.events.filter((event) => event.type === "progress").length, 0),
            detail: "Progress-photo activity captured across the roster this week.",
          },
        ];

    return {
      templates,
      checkinTemplates,
      roster,
      atRiskRoster: roster.filter((client) => client.riskScore >= 40).sort((left, right) => right.riskScore - left.riskScore),
      staleRoster: roster.filter((client) => client.isStale).sort((left, right) => right.daysSinceActivity - left.daysSinceActivity),
      bulkCandidates: roster.filter((client) => !client.activeProgram).sort((left, right) => {
        if (right.riskScore !== left.riskScore) {
          return right.riskScore - left.riskScore;
        }
        return String(left.preferredName || left.displayName).localeCompare(String(right.preferredName || right.displayName));
      }),
      bulkNutritionCandidates: roster.slice().sort((left, right) => {
        const leftHasNutrition = Boolean(left.activeNutrition);
        const rightHasNutrition = Boolean(right.activeNutrition);
        if (leftHasNutrition !== rightHasNutrition) {
          return leftHasNutrition ? 1 : -1;
        }
        if (right.riskScore !== left.riskScore) {
          return right.riskScore - left.riskScore;
        }
        return String(left.preferredName || left.displayName).localeCompare(String(right.preferredName || right.displayName));
      }),
      programAssignments,
      nutritionPlans,
      catalogFoods,
      catalogFoodById,
      recipes,
      recipeIngredientsByRecipe,
      mealEntries,
      mealItemsByEntry,
      nutritionPhotoSubmissions,
      nutritionPhotoCandidatesBySubmission,
      checkins,
      rewardEvents,
      pendingReviewItems,
      reviewSummary,
      operationsSummary,
      operationsCandidates,
      weekRangeLabel: formatWeekRange(weekStart, weekEnd),
      calendarSummary,
      calendarDays,
      calendarAttention,
      calendarRangeLabel: formatWeekRange(calendarRange.start, calendarRange.end),
      signals,
      programDays,
      metrics: {
        roster: roster.length,
        templates: templates.length,
        activePrograms: programAssignments.filter((item) => String(item.status || "").toLowerCase() === "active").length,
        pendingReviews: roster.reduce((sum, client) => sum + client.pendingReviews, 0),
        atRiskClients: roster.filter((client) => client.riskScore >= 40).length,
        staleClients: roster.filter((client) => client.isStale).length,
      },
    };
  }

  function renderMetrics(derived) {
    if (rosterMetricNode) {
      rosterMetricNode.textContent = formatCount(derived.metrics.roster);
    }
    if (templateMetricNode) {
      templateMetricNode.textContent = formatCount(derived.metrics.templates);
    }
    if (assignmentMetricNode) {
      assignmentMetricNode.textContent = formatCount(derived.metrics.activePrograms);
    }
    if (reviewMetricNode) {
      reviewMetricNode.textContent = formatCount(derived.metrics.pendingReviews);
    }
    if (riskMetricNode) {
      riskMetricNode.textContent = formatCount(derived.metrics.atRiskClients);
    }
    if (staleMetricNode) {
      staleMetricNode.textContent = formatCount(derived.metrics.staleClients);
    }
  }

  function renderRosterGrid(derived) {
    if (!rosterGridNode) {
      return;
    }

    if (!derived.roster.length) {
      rosterGridNode.innerHTML = buildWorkspaceEmptyCard(
        "No active coach-client assignments yet",
        "Assign your first roster client and their live programming context will appear here with program, nutrition, and health visibility."
      );
      return;
    }

    rosterGridNode.innerHTML = derived.roster
      .map((client) => {
        const primaryName = client.preferredName || client.displayName || "Client";
        const goal = client.primaryGoal || "Goal not set yet";
        const programTitle = client.activeProgram?.title || "No active program";
        const nutritionTitle = client.activeNutrition?.title || "No nutrition plan";
        const checkinLabel = client.latestCheckin
          ? `${toTitleCase(client.latestCheckin.status)} · ${formatDateTime(client.latestCheckin.submitted_at || client.latestCheckin.due_at)}`
          : "No health updates yet";
        const photoLabel = client.latestPhoto ? formatDate(client.latestPhoto.captured_at) : "No photo submitted";

        return `
          <article class="coach-programming-roster-card">
            <div class="coach-programming-roster-card__head">
              <div>
                <h3>${escapeHtml(primaryName)}</h3>
                <p>${escapeHtml(goal)}</p>
              </div>
              <span class="chip ${client.overdueCheckins ? "chip--tone-alert" : "chip--tone-success"}">
                ${client.overdueCheckins ? `${client.overdueCheckins} overdue` : "On track"}
              </span>
            </div>
            <dl class="coach-programming-roster-meta">
              <div>
                <dt>Program</dt>
                <dd>${escapeHtml(programTitle)}</dd>
              </div>
              <div>
                <dt>Nutrition</dt>
                <dd>${escapeHtml(nutritionTitle)}</dd>
              </div>
              <div>
                <dt>Latest health update</dt>
                <dd>${escapeHtml(checkinLabel)}</dd>
              </div>
              <div>
                <dt>Latest photo</dt>
                <dd>${escapeHtml(photoLabel)}</dd>
              </div>
            </dl>
            <div class="section-actions section-actions--compact">
              <button class="btn btn-secondary" type="button" data-fill-client="${escapeHtml(client.id)}">Assign Program</button>
            </div>
          </article>
        `;
      })
      .join("");
  }

  function renderSignals(derived) {
    if (!signalsNode) {
      return;
    }

    if (!derived.signals.length) {
      signalsNode.innerHTML = buildWorkspaceEmptyCard(
        "No delivery gaps showing right now",
        "Once the roster starts generating nutrition, health, and training activity, the next intervention signals will surface here."
      );
      return;
    }

    signalsNode.innerHTML = derived.signals
      .map(
        (signal) => `
          <article class="coach-programming-signal-card" data-tone="${escapeHtml(signal.tone)}">
            <span class="kicker kicker--accent">${escapeHtml(signal.title)}</span>
            <strong>${formatCount(signal.value)}</strong>
            <p>${escapeHtml(signal.detail)}</p>
          </article>
        `
      )
      .join("");
  }

  function renderRiskGrid(derived) {
    if (!riskGridNode) {
      return;
    }

    if (!derived.atRiskRoster.length) {
      riskGridNode.innerHTML = buildWorkspaceEmptyCard(
        "No at-risk clients right now",
        "This board will light up when missed logging, missed health updates, or stalled engagement pushes a client into intervention territory.",
        "success"
      );
      return;
    }

    riskGridNode.innerHTML = derived.atRiskRoster
      .slice(0, 8)
      .map((client) => `
        <article class="coach-programming-roster-card">
          <div class="coach-programming-roster-card__head">
            <div>
              <h3>${escapeHtml(client.preferredName || client.displayName || "Client")}</h3>
              <p>${escapeHtml(client.primaryGoal || "Goal not set yet")}</p>
            </div>
            <span class="chip chip--tone-${escapeHtml(client.riskTone)}">${escapeHtml(client.riskLabel)} · ${escapeHtml(String(client.riskScore))}</span>
          </div>
          <div class="coach-programming-meta-chips">
            ${(client.riskFlags.length ? client.riskFlags : [client.nextPriority]).map((flag) => `<span>${escapeHtml(flag)}</span>`).join("")}
          </div>
          <dl class="coach-programming-roster-meta">
            <div>
              <dt>Next move</dt>
              <dd>${escapeHtml(client.nextPriority)}</dd>
            </div>
            <div>
              <dt>Last activity</dt>
              <dd>${escapeHtml(client.lastActivityAt ? formatDate(client.lastActivityAt) : "No planner activity yet")}</dd>
            </div>
          </dl>
          <div class="section-actions section-actions--compact">
            <button class="btn btn-secondary" type="button" data-fill-client="${escapeHtml(client.id)}">Open Client Context</button>
          </div>
        </article>
      `)
      .join("");
  }

  function renderStaleGrid(derived) {
    if (!staleGridNode) {
      return;
    }

    if (!derived.staleRoster.length) {
      staleGridNode.innerHTML = buildWorkspaceEmptyCard(
        "No stale clients right now",
        "As soon as a roster client goes quiet for long enough to matter, they will appear here with the next best action to take.",
        "success"
      );
      return;
    }

    staleGridNode.innerHTML = derived.staleRoster
      .slice(0, 8)
      .map((client) => `
        <article class="coach-programming-template-card">
          <div class="coach-programming-template-card__head">
            <div>
              <span class="kicker kicker--accent">Stale Client</span>
              <h3>${escapeHtml(client.preferredName || client.displayName || "Client")}</h3>
            </div>
            <span class="chip chip--tone-warning">${escapeHtml(`${formatCount(client.daysSinceActivity)} days quiet`)}</span>
          </div>
          <p>${escapeHtml(client.staleReason || "No recent planner activity detected.")}</p>
          <div class="coach-programming-meta-chips">
            <span>${escapeHtml(client.activeProgram?.title || "No active program")}</span>
            <span>${escapeHtml(client.activeNutrition?.title || "No nutrition plan")}</span>
          </div>
          <div class="section-actions section-actions--compact">
            <button class="btn btn-secondary" type="button" data-fill-client="${escapeHtml(client.id)}">Review Client</button>
          </div>
        </article>
      `)
      .join("");
  }

  function renderAssignmentRows(derived) {
    if (!assignmentRowsNode) {
      return;
    }

    if (!derived.programAssignments.length) {
      assignmentRowsNode.innerHTML = buildEmptyTableRow(
        7,
        "No program assignments yet.",
        "Once you link your roster and assign the first block, the live training assignments table will appear here."
      );
      return;
    }

    const clientDirectory = getClientDirectory();
    assignmentRowsNode.innerHTML = derived.programAssignments
      .slice(0, 24)
      .map((assignment) => {
        const client = clientDirectory.get(assignment.client_id) || {};
        const nutritionPlan = derived.nutritionPlans.find(
          (plan) => plan.client_id === assignment.client_id && isActiveStatus(plan.status)
        );
        const checkin = derived.checkins.find((item) => item.client_id === assignment.client_id);
        return `
          <tr>
            <td>${escapeHtml(client.preferredName || client.displayName || "Client")}</td>
            <td>${escapeHtml(assignment.title || "Program")}</td>
            <td>${escapeHtml(formatDate(assignment.start_date))}</td>
            <td>${escapeHtml(toTitleCase(assignment.status || "active"))}</td>
            <td>${escapeHtml(nutritionPlan?.title || "Not attached")}</td>
            <td>${escapeHtml(checkin ? formatDateTime(checkin.submitted_at || checkin.due_at) : "No health update yet")}</td>
            <td>
              <div class="section-actions section-actions--compact">
                <button class="btn btn-ghost" type="button" data-open-assignment-builder="${escapeHtml(assignment.id)}">Open Live Block</button>
                <button class="btn btn-secondary" type="button" data-fill-client="${escapeHtml(assignment.client_id)}">Reassign</button>
              </div>
            </td>
          </tr>
        `;
      })
      .join("");
  }

  function renderTemplateLibrary(derived) {
    if (!templateLibraryNode) {
      return;
    }

    if (!derived.templates.length) {
      templateLibraryNode.innerHTML = buildWorkspaceEmptyCard(
        "No templates saved yet.",
        "Build your first weekly structure on the left and it will appear here as a reusable block.",
        "neutral"
      );
      return;
    }

    templateLibraryNode.innerHTML = derived.templates
      .map((template) => {
        const goalList = Array.isArray(template.goals) ? template.goals.filter(Boolean) : [];
        const emphasisList = Array.isArray(template.target_muscle_groups) ? template.target_muscle_groups.filter(Boolean) : [];
        const equipmentList = Array.isArray(template.equipment_required) ? template.equipment_required.filter(Boolean) : [];
        const summaryLines = [
          template.objective || template.description || "",
          goalList.length ? `Goals: ${goalList.slice(0, 3).join(", ")}` : "",
          emphasisList.length ? `Focus: ${emphasisList.slice(0, 3).join(", ")}` : "",
          equipmentList.length ? `Equipment: ${equipmentList.slice(0, 3).join(", ")}` : "",
        ].filter(Boolean);

        return `
          <article class="coach-programming-template-card">
            <div class="coach-programming-template-card__head">
              <div>
                <span class="kicker kicker--accent">${escapeHtml(template.category || "program")}</span>
                <h3>${escapeHtml(template.title || "Untitled template")}</h3>
              </div>
              <span class="chip chip--tone-info">${escapeHtml(toTitleCase(template.status || "draft"))}</span>
            </div>
            <p>${escapeHtml(summaryLines[0] || "No objective added yet.")}</p>
            <div class="coach-programming-meta-chips">
              <span>${escapeHtml(toTitleCase(template.difficulty || "intermediate"))}</span>
              <span>${formatCount(template.duration_weeks || 1)} week${Number(template.duration_weeks || 1) === 1 ? "" : "s"}</span>
              <span>${escapeHtml(template.estimated_duration_minutes ? `${template.estimated_duration_minutes} min sessions` : "Coach paced")}</span>
              <span>${escapeHtml(template.audience || "General roster")}</span>
            </div>
            ${
              summaryLines.length > 1
                ? `
                  <div class="coach-programming-template-card__notes">
                    ${summaryLines
                      .slice(1)
                      .map((line) => `<p>${escapeHtml(line)}</p>`)
                      .join("")}
                  </div>
                `
                : ""
            }
            <div class="section-actions section-actions--compact">
              <button class="btn btn-ghost" type="button" data-open-template-builder="${escapeHtml(template.id)}">Open In Builder</button>
              <button class="btn btn-secondary" type="button" data-use-template="${escapeHtml(template.id)}">Choose For Assignment</button>
            </div>
          </article>
        `;
      })
      .join("");
  }

  function renderDeliveryList(derived) {
    if (!deliveryNode) {
      return;
    }

    if (!derived.roster.length) {
      deliveryNode.innerHTML = buildWorkspaceEmptyCard(
        "No client delivery coverage yet.",
        "As soon as clients are assigned training, nutrition, and health layers, their delivery coverage will appear here.",
        "info"
      );
      return;
    }

    const reviewCountsByClient = getWorkspacePendingReviewCountsByClient(derived);
    deliveryNode.innerHTML = derived.roster
      .map((client) => {
        const primaryName = client.preferredName || client.displayName || "Client";
        if (isTrainingWorkspace()) {
          const latestWorkoutLabel = client.latestWorkoutLog
            ? formatDate(client.latestWorkoutLog.completed_at || client.latestWorkoutLog.updated_at || client.latestWorkoutLog.created_at)
            : "No training log";
          const trainingQueueCount = reviewCountsByClient.get(client.id) || 0;
          return `
            <article class="coach-programming-template-card">
              <div class="coach-programming-template-card__head">
                <div>
                  <span class="kicker kicker--accent">Client Coverage</span>
                  <h3>${escapeHtml(primaryName)}</h3>
                </div>
                <span class="chip ${client.activeProgram ? "chip--tone-success" : "chip--tone-alert"}">
                  ${client.activeProgram ? "Program live" : "Needs program"}
                </span>
              </div>
              <p>${escapeHtml(client.activeProgram?.title || "No active training assignment yet.")}</p>
              <div class="coach-programming-meta-chips">
                <span>${escapeHtml(`${client.weeklyProgramDayCount} planned day${client.weeklyProgramDayCount === 1 ? "" : "s"}`)}</span>
                <span>${escapeHtml(`${client.weeklyWorkoutCount} training log${client.weeklyWorkoutCount === 1 ? "" : "s"} this week`)}</span>
                <span>${escapeHtml(trainingQueueCount ? `${trainingQueueCount} training reviews` : "Training queue clear")}</span>
                <span>${escapeHtml(`Last workout ${latestWorkoutLabel}`)}</span>
              </div>
              <div class="section-actions section-actions--compact">
                ${
                  client.activeProgram?.id
                    ? `<button class="btn btn-ghost" type="button" data-open-assignment-builder="${escapeHtml(client.activeProgram.id)}">Open Live Block</button>`
                    : ""
                }
                <button class="btn btn-secondary" type="button" data-fill-client="${escapeHtml(client.id)}">Assign Or Update</button>
              </div>
            </article>
          `;
        }

        return `
          <article class="coach-programming-template-card">
            <div class="coach-programming-template-card__head">
              <div>
                <span class="kicker kicker--accent">Client Coverage</span>
                <h3>${escapeHtml(primaryName)}</h3>
              </div>
              <span class="chip ${client.activeProgram ? "chip--tone-success" : "chip--tone-alert"}">
                ${client.activeProgram ? "Program live" : "Needs program"}
              </span>
            </div>
            <p>${escapeHtml(client.activeProgram?.title || "No active training assignment yet.")}</p>
            <div class="coach-programming-meta-chips">
              <span>${escapeHtml(client.activeNutrition?.title || "No nutrition plan")}</span>
              <span>${escapeHtml(client.latestCheckin ? toTitleCase(client.latestCheckin.status) : "No health update")}</span>
              <span>${escapeHtml(client.latestPhoto ? `Photo ${formatDate(client.latestPhoto.captured_at)}` : "No photo")}</span>
            </div>
            <div class="section-actions section-actions--compact">
              <button class="btn btn-secondary" type="button" data-fill-client="${escapeHtml(client.id)}">Assign Or Update</button>
            </div>
          </article>
        `;
      })
      .join("");
  }

  function renderClientOptions(derived) {
    if (!assignClientNode && !nutritionClientNode && !scheduleCheckinClientNode) {
      return;
    }

    const optionMarkup = [
      '<option value="">Select client</option>',
      ...derived.roster.map((client) => {
        const label = client.preferredName || client.displayName || "Client";
        const suffix = client.primaryGoal ? ` · ${client.primaryGoal}` : "";
        return `<option value="${escapeHtml(client.id)}">${escapeHtml(label + suffix)}</option>`;
      }),
    ].join("");

    [
      assignClientNode,
      nutritionClientNode,
      scheduleCheckinClientNode,
    ].forEach((node) => {
      if (!node) {
        return;
      }
      const currentValue = node.value;
      node.innerHTML = optionMarkup;
      if (currentValue) {
        node.value = currentValue;
      }
    });
  }

  function renderTemplateOptions(derived) {
    if (!assignTemplateNode && !bulkAssignTemplateNode) {
      return;
    }

    const optionMarkup = [
      '<option value="">Select template</option>',
      ...derived.templates.map(
        (template) =>
          `<option value="${escapeHtml(template.id)}">${escapeHtml(template.title)} · ${escapeHtml(
            toTitleCase(template.difficulty || "intermediate")
          )}</option>`
      ),
    ].join("");

    [assignTemplateNode, bulkAssignTemplateNode].forEach((node) => {
      if (!node) {
        return;
      }
      const currentValue = node.value;
      node.innerHTML = optionMarkup;
      if (currentValue) {
        node.value = currentValue;
      }
    });
  }

  function renderClientFocus(derived) {
    if (!focusNode) {
      return;
    }

    const clientId = assignClientNode?.value || "";
    const client = derived.roster.find((item) => item.id === clientId);
    if (!client) {
      focusNode.innerHTML =
        isTrainingWorkspace()
          ? '<p class="coach-programming-empty">Choose a client to review their current program, live training rhythm, and weekly load.</p>'
          : '<p class="coach-programming-empty">Choose a client to review their current program, nutrition plan, health rhythm, and photo cadence.</p>';
      return;
    }

    const primaryName = client.preferredName || client.displayName || "Client";
    const workspaceReviewCount = getWorkspacePendingReviewCountsByClient(derived).get(client.id) || 0;
    if (isTrainingWorkspace()) {
      const latestWorkoutAt = client.latestWorkoutLog?.completed_at || client.latestWorkoutLog?.updated_at || client.latestWorkoutLog?.created_at || "";
      focusNode.innerHTML = `
        <div class="coach-programming-focus-card__head">
          <div>
            <h3>${escapeHtml(primaryName)}</h3>
            <p>${escapeHtml(client.primaryGoal || "Goal not set yet")}</p>
          </div>
          <span class="chip ${workspaceReviewCount ? "chip--tone-warning" : "chip--tone-success"}">
            ${workspaceReviewCount ? `${workspaceReviewCount} training review${workspaceReviewCount === 1 ? "" : "s"}` : "Training queue clear"}
          </span>
        </div>
        <dl class="coach-programming-roster-meta">
          <div>
            <dt>Active program</dt>
            <dd>${escapeHtml(client.activeProgram?.title || "No program assigned")}</dd>
          </div>
          <div>
            <dt>Program objective</dt>
            <dd>${escapeHtml(client.activeProgram?.objective || client.activeProgram?.description || "No objective added yet")}</dd>
          </div>
          <div>
            <dt>Planned training days</dt>
            <dd>${escapeHtml(`${client.programDays.length} day${client.programDays.length === 1 ? "" : "s"} in the live block`)}</dd>
          </div>
          <div>
            <dt>This week</dt>
            <dd>${escapeHtml(`${client.weeklyWorkoutCount} training log${client.weeklyWorkoutCount === 1 ? "" : "s"} across ${client.weeklyProgramDayCount} planned day${client.weeklyProgramDayCount === 1 ? "" : "s"}`)}</dd>
          </div>
          <div>
            <dt>Latest workout log</dt>
            <dd>${escapeHtml(latestWorkoutAt ? formatDateTime(latestWorkoutAt) : "No workout log yet")}</dd>
          </div>
        </dl>
        <div class="section-actions section-actions--compact">
          ${
            client.activeProgram?.id
              ? `<button class="btn btn-ghost" type="button" data-open-assignment-builder="${escapeHtml(client.activeProgram.id)}">Open Live Block</button>`
              : ""
          }
          <button class="btn btn-secondary" type="button" data-fill-client="${escapeHtml(client.id)}">Update Client Block</button>
        </div>
      `;
      return;
    }

    const sportProfile = client.activeProgram?.custom_targets?.sportProfile && typeof client.activeProgram.custom_targets.sportProfile === "object"
      ? client.activeProgram.custom_targets.sportProfile
      : null;
    const workbook = client.activeProgram?.custom_targets?.workbook && typeof client.activeProgram.custom_targets.workbook === "object"
      ? client.activeProgram.custom_targets.workbook
      : null;
    focusNode.innerHTML = `
      <div class="coach-programming-focus-card__head">
        <div>
          <h3>${escapeHtml(primaryName)}</h3>
          <p>${escapeHtml(client.primaryGoal || "Goal not set yet")}</p>
        </div>
        <span class="chip ${workspaceReviewCount ? "chip--tone-warning" : "chip--tone-success"}">
          ${workspaceReviewCount ? `${workspaceReviewCount} pending review` : "Clean queue"}
        </span>
      </div>
      <dl class="coach-programming-roster-meta">
        <div>
          <dt>Active program</dt>
          <dd>${escapeHtml(client.activeProgram?.title || "No program assigned")}</dd>
        </div>
        <div>
          <dt>Nutrition layer</dt>
          <dd>${escapeHtml(client.activeNutrition?.title || "No nutrition plan")}</dd>
        </div>
        <div>
          <dt>Latest health update</dt>
          <dd>${escapeHtml(client.latestCheckin ? formatDateTime(client.latestCheckin.submitted_at || client.latestCheckin.due_at) : "No health update yet")}</dd>
        </div>
        <div>
          <dt>Latest progress photo</dt>
          <dd>${escapeHtml(client.latestPhoto ? formatDate(client.latestPhoto.captured_at) : "No photo submitted")}</dd>
        </div>
        <div>
          <dt>AI photo estimate</dt>
          <dd>${escapeHtml(
            client.latestPhoto
              ? (
                formatProgressPhotoAiEstimate(client.latestPhoto)
                ? `${formatProgressPhotoAiEstimate(client.latestPhoto)} rough estimate`
                : String(client.latestPhoto.ai_body_fat_status || "").toLowerCase() === "pending"
                  ? "Estimate processing"
                  : "No estimate yet"
              )
              : "No photo submitted"
          )}</dd>
        </div>
        ${
          sportProfile
            ? `
              <div>
                <dt>Sport profile</dt>
                <dd>${escapeHtml(
                  [sportProfile.primarySport, sportProfile.goalFocus].filter(Boolean).join(" • ")
                  || sportProfile.athleteProfile
                  || "Configured"
                )}</dd>
              </div>
              <div>
                <dt>Load target</dt>
                <dd>${escapeHtml(
                  sportProfile.plannedWeeklyHours
                    ? `${sportProfile.plannedWeeklyHours} hrs / wk`
                    : sportProfile.daysAvailablePerWeek
                      ? `${sportProfile.daysAvailablePerWeek} days / wk`
                      : "Awaiting coach input"
                )}</dd>
              </div>
            `
            : ""
        }
        ${
          workbook?.kind
            ? `
              <div>
                <dt>Workbook phase</dt>
                <dd>${escapeHtml(
                  workbook.outputs?.primary_phase
                    || workbook.outputs?.runner_phase
                    || workbook.outputs?.hyrox_phase
                    || workbook.outputs?.endurance_phase
                    || "Not generated"
                )}</dd>
              </div>
              <div>
                <dt>Coach cue</dt>
                <dd>${escapeHtml(workbook.readiness?.coachAction || "Ready once the profile is complete")}</dd>
              </div>
            `
            : ""
        }
      </dl>
    `;
  }

  function renderBuilderDays() {
    if (!templateDaysNode) {
      return;
    }

    const structuredMode = isStructuredSessionCategory();
    syncTemplateBuilderMode();
    renderTrainingWorkbookWeekControls();

    templateDaysNode.innerHTML = state.builderDays
      .map((day, index) => {
        const supportsExercises = day.dayType !== "rest";
        const exerciseRows = Array.isArray(day.exerciseRows) && day.exerciseRows.length ? day.exerciseRows : [createEmptyExerciseRow(1)];
        return `
          <article class="coach-training-day-card${supportsExercises ? "" : " coach-training-day-card--rest"}" data-day-id="${escapeHtml(day.id)}">
            <div class="coach-training-day-card__head">
              <div>
                <span class="kicker kicker--accent">Training Day ${index + 1}</span>
                <h3>${escapeHtml(day.title || `Day ${index + 1}`)}</h3>
              </div>
              <button class="btn btn-ghost" type="button" data-remove-day="${escapeHtml(day.id)}"${
                state.builderDays.length === 1 ? " disabled" : ""
              }>Remove Day</button>
            </div>

            <div class="coach-training-day-grid">
              <label>
                Day title
                <input type="text" data-day-field="title" value="${escapeHtml(day.title)}" placeholder="Lower A" />
              </label>
              <label>
                Focus
                <input type="text" data-day-field="focus" value="${escapeHtml(day.focus)}" placeholder="Lower body hypertrophy" />
              </label>
              <label>
                Day type
                <select data-day-field="dayType">
                  ${["workout", "conditioning", "mobility", "recovery", "rest"]
                    .map(
                      (option) =>
                        `<option value="${option}"${option === day.dayType ? " selected" : ""}>${escapeHtml(
                          toTitleCase(option)
                        )}</option>`
                    )
                    .join("")}
                </select>
              </label>
              <label>
                Session mins
                <input type="number" min="0" data-day-field="estimatedDurationMinutes" value="${escapeHtml(day.estimatedDurationMinutes)}" placeholder="75" />
              </label>
            </div>

            ${
              structuredMode
                ? `
                  <details class="coach-training-day-advanced">
                    <summary>Structured session metrics</summary>
                    <div class="coach-training-day-grid coach-training-day-grid--advanced">
                      <label>
                        Session type
                        <select data-day-field="sessionType">
                          ${[
                            ["standard", "Standard"],
                            ["aerobic_base", "Aerobic base"],
                            ["threshold", "Threshold"],
                            ["intervals", "Intervals"],
                            ["long_session", "Long session"],
                            ["race_specific", "Race specific"],
                            ["hybrid", "Hybrid"],
                            ["recovery", "Recovery"],
                          ]
                            .map(
                              ([value, label]) =>
                                `<option value="${value}"${value === day.sessionType ? " selected" : ""}>${escapeHtml(label)}</option>`
                            )
                            .join("")}
                        </select>
                      </label>
                      <label>
                        Session label
                        <input type="text" data-day-field="sessionLabel" value="${escapeHtml(day.sessionLabel)}" placeholder="Tempo run or station circuit" />
                      </label>
                      <label>
                        Distance (km)
                        <input type="number" min="0" step="0.1" data-day-field="distanceKm" value="${escapeHtml(day.distanceKm)}" placeholder="8.0" />
                      </label>
                      <label>
                        HR zone
                        <input type="number" min="1" max="5" step="1" data-day-field="heartRateZone" value="${escapeHtml(day.heartRateZone)}" placeholder="2" />
                      </label>
                      <label>
                        Intensity cue
                        <input type="text" data-day-field="intensityCue" value="${escapeHtml(day.intensityCue)}" placeholder="Zone 2 conversational" />
                      </label>
                      <label>
                        Pace / speed
                        <input type="text" data-day-field="targetPace" value="${escapeHtml(day.targetPace)}" placeholder="5:10 /km" />
                      </label>
                      <label>
                        Fuel cue
                        <input type="text" data-day-field="fuelCue" value="${escapeHtml(day.fuelCue)}" placeholder="30-60 g carbs/hr" />
                      </label>
                    </div>
                  </details>
                `
                : ""
            }

            <label>
              Day notes
              <textarea data-day-field="notes" placeholder="Session intent, recovery rules, or weekly coaching reminders.">${escapeHtml(
                day.notes
              )}</textarea>
            </label>

            ${
              supportsExercises
                ? `
                  <section class="coach-training-exercise-sheet">
                    <div class="coach-training-exercise-sheet__head">
                      <div>
                        <span class="kicker kicker--accent">Exercise Setup</span>
                        <h4>Coach Rows For This Day</h4>
                      </div>
                      <button class="btn btn-ghost" type="button" data-add-exercise="${escapeHtml(day.id)}">Add Exercise</button>
                    </div>
                    <div class="coach-training-exercise-sheet__legend">
                      <span>Coach sets the prescription here. Client only logs execution later.</span>
                    </div>
                    <div class="coach-training-exercise-list">
                      ${exerciseRows
                        .map(
                          (row, exerciseIndex) => `
                            <article class="coach-training-exercise-row" data-exercise-id="${escapeHtml(row.id)}">
                              <div class="coach-training-exercise-row__head">
                                <div>
                                  <span class="kicker kicker--accent">Row ${exerciseIndex + 1}</span>
                                  <h4>${escapeHtml(row.name || "New exercise")}</h4>
                                </div>
                                <div class="coach-training-exercise-row__actions">
                                  <button class="btn btn-ghost" type="button" data-move-exercise="${escapeHtml(row.id)}" data-move-direction="-1"${exerciseIndex === 0 ? " disabled" : ""}>Up</button>
                                  <button class="btn btn-ghost" type="button" data-move-exercise="${escapeHtml(row.id)}" data-move-direction="1"${exerciseIndex === exerciseRows.length - 1 ? " disabled" : ""}>Down</button>
                                  <button class="btn btn-ghost" type="button" data-remove-exercise="${escapeHtml(row.id)}"${exerciseRows.length === 1 ? " disabled" : ""}>Remove</button>
                                </div>
                              </div>
                              <div class="coach-training-exercise-row__main">
                                <label>
                                  Block
                                  <input type="text" data-exercise-field="blockLabel" value="${escapeHtml(row.blockLabel)}" placeholder="A1" />
                                </label>
                                <label>
                                  Exercise
                                  <input type="text" data-exercise-field="name" value="${escapeHtml(row.name)}" placeholder="Back squat" />
                                </label>
                                <label>
                                  Sets
                                  <input type="number" min="0" data-exercise-field="sets" value="${escapeHtml(row.sets)}" placeholder="4" />
                                </label>
                                <label>
                                  Reps / target
                                  <input type="text" data-exercise-field="repTarget" value="${escapeHtml(row.repTarget)}" placeholder="8-10" />
                                </label>
                                <label>
                                  Effort
                                  <input type="text" data-exercise-field="intensity" value="${escapeHtml(row.intensity)}" placeholder="RPE 7-8" />
                                </label>
                                <label>
                                  Week 1 load (kg)
                                  <input type="number" min="0" step="0.5" data-exercise-field="startingLoad" value="${escapeHtml(row.startingLoad)}" placeholder="60" />
                                </label>
                                <label>
                                  Increment (kg)
                                  <input type="number" min="0" step="0.5" data-exercise-field="increment" value="${escapeHtml(row.increment)}" placeholder="2.5" />
                                </label>
                              </div>
                              <div class="coach-training-exercise-row__meta">
                                <label>
                                  Rest
                                  <input type="text" data-exercise-field="rest" value="${escapeHtml(row.rest)}" placeholder="90 sec" />
                                </label>
                                <label>
                                  Tempo
                                  <input type="text" data-exercise-field="tempo" value="${escapeHtml(row.tempo)}" placeholder="31X1" />
                                </label>
                                <label>
                                  Client logs
                                  <select data-exercise-field="clientEntryMode">
                                    ${[
                                      ["log_weight_reps_rpe", "Weight, reps, RPE"],
                                      ["log_reps_rpe", "Reps and RPE"],
                                      ["log_time_distance", "Time or distance"],
                                      ["completion_only", "Completion only"],
                                    ]
                                      .map(
                                        ([value, label]) =>
                                          `<option value="${value}"${value === row.clientEntryMode ? " selected" : ""}>${escapeHtml(label)}</option>`
                                      )
                                      .join("")}
                                  </select>
                                </label>
                                <label class="coach-training-exercise-row__wide">
                                  Progression rule
                                  <input type="text" data-exercise-field="progressionRule" value="${escapeHtml(row.progressionRule)}" placeholder="Add 2.5 kg if all reps are hit cleanly." />
                                </label>
                              </div>
                              <label>
                                Coach note
                                <textarea data-exercise-field="notes" placeholder="Execution cue, substitution, or coaching reminder.">${escapeHtml(
                                  row.notes
                                )}</textarea>
                              </label>
                            </article>
                          `
                        )
                        .join("")}
                    </div>
                  </section>
                `
                : `
                  <div class="coach-programming-day-card__rest-note">
                    <strong>Rest day</strong>
                    <p>No exercise rows are needed here. Use the notes field above for recovery, walking, mobility, or readiness cues.</p>
                  </div>
                `
            }
          </article>
        `;
      })
      .join("");

    if (trainingExerciseMirrorNode) {
      trainingExerciseMirrorNode.innerHTML = templateDaysNode.innerHTML;
    }
  }

  function resolveTrainingWizardStep(stepKey) {
    const allowed = new Set(["inputs", "split", "exercises", "generate"]);
    return allowed.has(String(stepKey || "").trim()) ? String(stepKey).trim() : "inputs";
  }

  function setActiveTrainingWizardStep(stepKey) {
    if (!trainingStepTabNodes.length || !trainingStepPanelNodes.length) {
      return;
    }

    const resolvedStep = resolveTrainingWizardStep(stepKey);
    state.trainingWizard.activeStep = resolvedStep;
    document.body.dataset.trainingBuilderMode =
      resolvedStep === "split"
        ? "split"
        : resolvedStep === "exercises"
          ? "exercises"
          : "all";

    trainingStepTabNodes.forEach((node) => {
      const isActive = node.dataset.coachTrainingStep === resolvedStep;
      node.classList.toggle("is-active", isActive);
      node.setAttribute("aria-pressed", String(isActive));
    });

    trainingStepPanelNodes.forEach((node) => {
      const isActive = node.dataset.coachTrainingStepPanel === resolvedStep;
      node.classList.toggle("is-active", isActive);
      node.hidden = !isActive;
    });

    trainingStepNavNodes.forEach((node) => {
      const direction = node.dataset.coachTrainingNav;
      node.hidden =
        (direction === "back" && resolvedStep === "inputs")
        || (direction === "next" && resolvedStep === "generate");
    });
  }

  function resolveNutritionWizardStep(stepKey) {
    const allowed = new Set(["inputs", "targets", "habits", "week", "generate"]);
    return allowed.has(String(stepKey || "").trim()) ? String(stepKey).trim() : "inputs";
  }

  function setActiveNutritionWizardStep(stepKey) {
    if (!nutritionStepTabNodes.length || !nutritionStepPanelNodes.length) {
      return;
    }

    const resolvedStep = resolveNutritionWizardStep(stepKey);
    state.nutritionWizard.activeStep = resolvedStep;

    nutritionStepTabNodes.forEach((node) => {
      const isActive = node.dataset.coachNutritionStep === resolvedStep;
      node.classList.toggle("is-active", isActive);
      node.setAttribute("aria-pressed", String(isActive));
    });

    nutritionStepPanelNodes.forEach((node) => {
      const isActive = node.dataset.coachNutritionStepPanel === resolvedStep;
      node.classList.toggle("is-active", isActive);
      node.hidden = !isActive;
    });

    nutritionStepNavNodes.forEach((node) => {
      const direction = node.dataset.coachNutritionNav;
      node.hidden =
        (direction === "back" && resolvedStep === "inputs")
        || (direction === "next" && resolvedStep === "generate");
    });
  }

  function moveNutritionWizardStep(direction) {
    const steps = ["inputs", "targets", "habits", "week", "generate"];
    const currentIndex = steps.indexOf(resolveNutritionWizardStep(state.nutritionWizard.activeStep));
    const nextIndex = Math.min(steps.length - 1, Math.max(0, currentIndex + Number(direction || 0)));
    setActiveNutritionWizardStep(steps[nextIndex]);
  }

  function prepareTrainingWizardStep(stepKey) {
    const resolvedStep = resolveTrainingWizardStep(stepKey);
    if (resolvedStep === "inputs") {
      return true;
    }
    ensureTrainingWorkbookState({
      preserveWeek: true,
      clearOnMissing: true,
    });
    return true;
  }

  function moveTrainingWizardStep(direction) {
    const steps = ["inputs", "split", "exercises", "generate"];
    const currentIndex = steps.indexOf(resolveTrainingWizardStep(state.trainingWizard.activeStep));
    const nextIndex = Math.min(steps.length - 1, Math.max(0, currentIndex + Number(direction || 0)));
    const nextStep = steps[nextIndex];
    if (!prepareTrainingWizardStep(nextStep)) {
      return;
    }
    setActiveTrainingWizardStep(nextStep);
  }

  function buildNutritionWorkbookInputs() {
    if (!nutritionForm) {
      return {};
    }

    const formData = new FormData(nutritionForm);
    const values = {};
    formData.forEach((value, key) => {
      values[key] = typeof value === "string" ? value.trim() : value;
    });

    if (!values.eventDate && values.startDate) {
      values.eventDate = values.startDate;
    }

    return values;
  }

  function cloneGeneratedHabit(habit, index) {
    return {
      id: buildLocalId(`habit-${index + 1}`),
      title: compactText(habit?.title) || `Habit ${index + 1}`,
      description: compactText(habit?.description),
      targetType: compactText(habit?.targetType || habit?.target_type || "boolean") || "boolean",
      targetValue: habit?.targetValue ?? habit?.target_value ?? "",
      targetUnit: compactText(habit?.targetUnit || habit?.target_unit),
      cadence: compactText(habit?.cadence || "daily") || "daily",
      isRequired: habit?.isRequired !== false && habit?.is_required !== false,
    };
  }

  function resolveNutritionDayTargetsForType(draft, dayType) {
    const normalizedDayType = compactText(dayType || "rest") || "rest";
    if (normalizedDayType === "training") {
      return draft?.macroPlan?.trainingDayTargets || {};
    }
    if (normalizedDayType === "special") {
      return draft?.macroPlan?.specialDayTargets || draft?.macroPlan?.trainingDayTargets || {};
    }
    return draft?.macroPlan?.restDayTargets || {};
  }

  function createDefaultMealPlanDayTargets(dayType, draft) {
    const source = resolveNutritionDayTargetsForType(draft, dayType);
    return {
      calories: parseInteger(source?.calories),
      protein: parseInteger(source?.protein),
      carbs: parseInteger(source?.carbs),
      fat: parseInteger(source?.fat),
      hydrationLiters: source?.hydrationLiters ?? "",
      fiberGrams: parseInteger(source?.fiberGrams),
    };
  }

  function normalizeGeneratedMealPlanDay(day, index, draft) {
    const preset = MEAL_PLAN_DAY_PRESETS[index] || {
      key: compactText(day?.dayKey) || `day_${index + 1}`,
      label: compactText(day?.label) || `Day ${index + 1}`,
    };
    const dayType = compactText(day?.dayType || day?.day_type || "rest") || "rest";
    const sourceTargets = day?.targets && typeof day.targets === "object" && !Array.isArray(day.targets)
      ? day.targets
      : {};
    const slots = Array.isArray(day?.slots) && day.slots.length
      ? day.slots.map((slot, slotIndex) =>
          createEmptyMealPlanSlot(preset.key, slotIndex + 1, {
            mealType: compactText(slot?.mealType || slot?.meal_type) || undefined,
            recipeId: compactText(slot?.recipeId || slot?.recipe_id),
            title: compactText(slot?.title),
            note: compactText(slot?.note),
          })
        )
      : [
          createEmptyMealPlanSlot(preset.key, 1, { mealType: "breakfast" }),
          createEmptyMealPlanSlot(preset.key, 2, { mealType: "lunch" }),
          createEmptyMealPlanSlot(preset.key, 3, { mealType: "dinner" }),
        ];

    return {
      id: buildLocalId(`meal-day-${preset.key}`),
      dayKey: preset.key,
      label: compactText(day?.label) || preset.label,
      dayType,
      note: compactText(day?.note),
      targets: {
        ...createDefaultMealPlanDayTargets(dayType, draft),
        ...sourceTargets,
      },
      slots,
    };
  }

  function getNutritionWorkbookDraft() {
    const engine = resolveNutritionEngine();
    if (!engine) {
      state.nutritionWizard.workbookSnapshot = null;
      return null;
    }

    const draft = engine.build(buildNutritionWorkbookInputs());
    state.nutritionWizard.workbookSnapshot = draft;
    return draft;
  }

  function syncNutritionTargetsFromWorkbook(options = {}) {
    if (!nutritionForm) {
      return null;
    }

    const draft = options.draft || getNutritionWorkbookDraft();
    if (!draft?.macroPlan) {
      return null;
    }

    const fieldMap = [
      ["caloriesTarget", draft.macroPlan.calories],
      ["proteinTargetG", draft.macroPlan.protein],
      ["carbsTargetG", draft.macroPlan.carbs],
      ["fatTargetG", draft.macroPlan.fat],
    ];

    fieldMap.forEach(([fieldName, nextValue]) => {
      const field = nutritionForm.elements.namedItem(fieldName);
      if (!field) {
        return;
      }
      const currentValue = String(field.value || "").trim();
      const shouldApply =
        options.force
        || !state.nutritionWizard.manualTargetFields.has(fieldName)
        || !currentValue;
      if (shouldApply && nextValue !== null && nextValue !== undefined && nextValue !== "") {
        field.value = String(nextValue);
      }
    });

    return draft;
  }

  function syncNutritionHabitsFromWorkbook(options = {}) {
    const draft = options.draft || getNutritionWorkbookDraft();
    if (!draft?.habits?.length) {
      return null;
    }

    if (!options.force && state.nutritionWizard.habitsDirty) {
      return draft;
    }

    state.nutritionHabits = draft.habits.map((habit, index) => cloneGeneratedHabit(habit, index));
    state.nutritionWizard.habitsDirty = false;
    renderHabitBuilder();
    return draft;
  }

  function syncMealPlanFromWorkbook(options = {}) {
    const draft = options.draft || getNutritionWorkbookDraft();
    if (!draft?.mealPlan?.days?.length) {
      return null;
    }

    if (!options.force && state.nutritionWizard.mealPlanDirty) {
      return draft;
    }

    state.mealPlanDays = draft.mealPlan.days.map((day, index) => normalizeGeneratedMealPlanDay(day, index, draft));
    state.nutritionWizard.mealPlanDirty = false;
    if (!state.mealPlanDays.some((day) => day.id === state.nutritionWizard.activeMealDayId)) {
      state.nutritionWizard.activeMealDayId = state.mealPlanDays[0]?.id || "";
    }
    renderMealPlanBuilder();
    return draft;
  }

  function ensureNutritionWorkbookState(options = {}) {
    const draft = getNutritionWorkbookDraft();
    if (!draft) {
      if (nutritionWorkbookGridNode) {
        nutritionWorkbookGridNode.innerHTML = "";
      }
      if (nutritionWorkbookSummaryNode) {
        nutritionWorkbookSummaryNode.innerHTML = "";
      }
      if (nutritionTargetGridNode) {
        nutritionTargetGridNode.innerHTML = "";
      }
      return null;
    }

    const titleField = nutritionForm?.elements?.namedItem?.("title");
    if (titleField && !String(titleField.value || "").trim()) {
      titleField.value = `${draft.macroPlan.categoryLabel} ${draft.macroPlan.goalLabel} Plan`;
    }

    syncNutritionTargetsFromWorkbook({ draft, force: options.forceTargets });
    syncNutritionHabitsFromWorkbook({ draft, force: options.forceHabits });
    syncMealPlanFromWorkbook({ draft, force: options.forceMealPlan });
    return draft;
  }

  function formatNutritionWorkbookMetric(value, suffix = "") {
    if (value === null || value === undefined || value === "") {
      return "Not set";
    }
    return `${value}${suffix}`;
  }

  function formatNutritionTargetLine(targets) {
    if (!targets) {
      return "Targets not set yet";
    }

    const pieces = [
      Number.isFinite(Number(targets.calories)) ? `${parseInteger(targets.calories)} kcal` : "",
      Number.isFinite(Number(targets.protein)) ? `${parseInteger(targets.protein)}P` : "",
      Number.isFinite(Number(targets.carbs)) ? `${parseInteger(targets.carbs)}C` : "",
      Number.isFinite(Number(targets.fat)) ? `${parseInteger(targets.fat)}F` : "",
    ].filter(Boolean);

    return pieces.join(" • ") || "Targets not set yet";
  }

  function renderNutritionTargetGrid(draft = state.nutritionWizard.workbookSnapshot) {
    if (!nutritionTargetGridNode) {
      return;
    }

    const macroPlan = draft?.macroPlan;
    if (!macroPlan) {
      nutritionTargetGridNode.innerHTML = "";
      return;
    }

    const cards = [
      { label: "Average Target", value: formatNutritionTargetLine(macroPlan) },
      { label: macroPlan.trainingDayTargets?.label || "Training Day", value: formatNutritionTargetLine(macroPlan.trainingDayTargets) },
      { label: macroPlan.restDayTargets?.label || "Rest Day", value: formatNutritionTargetLine(macroPlan.restDayTargets) },
      { label: "Protein Floor / Meal", value: formatNutritionWorkbookMetric(macroPlan.perMealProteinFloor, " g") },
      { label: "Hydration Baseline", value: formatNutritionWorkbookMetric(macroPlan.hydrationLiters, " L") },
      { label: "Fiber + Sodium", value: `${formatNutritionWorkbookMetric(macroPlan.fiberGrams, " g")} • ${macroPlan.sodiumRange || "As needed"}` },
    ];

    nutritionTargetGridNode.innerHTML = cards
      .map(
        (card) => `
          <div>
            <dt>${escapeHtml(card.label)}</dt>
            <dd>${escapeHtml(card.value)}</dd>
          </div>
        `
      )
      .join("");
  }

  function renderNutritionWorkbookPreview(draft = state.nutritionWizard.workbookSnapshot) {
    if (!nutritionWorkbookGridNode || !nutritionWorkbookSummaryNode) {
      return;
    }

    const macroPlan = draft?.macroPlan;
    if (!macroPlan) {
      nutritionWorkbookGridNode.innerHTML = "";
      nutritionWorkbookSummaryNode.innerHTML = `<p>Fill the athlete inputs first and the workbook logic will build the plan underneath.</p>`;
      if (nutritionWorkbookNoteNode) {
        nutritionWorkbookNoteNode.textContent = "Start with the athlete setup. The workbook will calculate calories, macros, hydration, and the weekly rhythm before the client sees anything.";
      }
      return;
    }

    const previewPairs = Array.isArray(macroPlan.previewPairs) ? macroPlan.previewPairs : [];
    nutritionWorkbookGridNode.innerHTML = previewPairs
      .map(
        (item) => `
          <div>
            <dt>${escapeHtml(item.label || "")}</dt>
            <dd>${escapeHtml(item.value || "Not set")}</dd>
          </div>
        `
      )
      .join("");

    const summaryLines = Array.isArray(macroPlan.summaryCard) ? macroPlan.summaryCard : [];
    nutritionWorkbookSummaryNode.innerHTML = summaryLines.map((line) => `<p>${escapeHtml(line)}</p>`).join("");

    if (nutritionWorkbookNoteNode) {
      nutritionWorkbookNoteNode.textContent = compactText(macroPlan.reviewLogic)
        || "Coach inputs are now driving the hidden workbook logic for this client.";
    }
  }

  function renderHabitBuilder() {
    if (!nutritionHabitsNode) {
      return;
    }

    nutritionHabitsNode.innerHTML = state.nutritionHabits
      .map(
        (habit, index) => `
          <article class="coach-programming-day-card coach-nutrition-habit-card" data-habit-id="${escapeHtml(habit.id)}">
            <div class="coach-programming-day-card__head">
              <div>
                <span class="kicker kicker--accent">Habit ${index + 1}</span>
                <h3>${escapeHtml(habit.title || `Habit ${index + 1}`)}</h3>
              </div>
              <button class="btn btn-ghost" type="button" data-remove-habit="${escapeHtml(habit.id)}"${
                state.nutritionHabits.length === 1 ? " disabled" : ""
              }>Remove</button>
            </div>
            <div class="coach-programming-day-grid coach-nutrition-habit-grid">
              <label>
                Title
                <input type="text" data-habit-field="title" value="${escapeHtml(habit.title)}" placeholder="Hit protein target" />
              </label>
              <label>
                Target type
                <select data-habit-field="targetType">
                  ${["boolean", "count", "grams", "liters", "minutes", "meals"]
                    .map(
                      (option) =>
                        `<option value="${option}"${option === habit.targetType ? " selected" : ""}>${escapeHtml(toTitleCase(option))}</option>`
                    )
                    .join("")}
                </select>
              </label>
              <label>
                Target value
                <input type="number" data-habit-field="targetValue" value="${escapeHtml(habit.targetValue)}" placeholder="3" />
              </label>
              <label>
                Unit
                <input type="text" data-habit-field="targetUnit" value="${escapeHtml(habit.targetUnit)}" placeholder="meals / g / liters" />
              </label>
            </div>
            <div class="coach-programming-day-grid coach-nutrition-habit-grid-secondary">
              <label>
                Cadence
                <select data-habit-field="cadence">
                  ${["daily", "weekly"]
                    .map(
                      (option) =>
                        `<option value="${option}"${option === habit.cadence ? " selected" : ""}>${escapeHtml(toTitleCase(option))}</option>`
                    )
                    .join("")}
                </select>
              </label>
              <label class="client-planner-check-toggle">
                <input type="checkbox" data-habit-field="isRequired"${habit.isRequired ? " checked" : ""} />
                <span>Required target</span>
              </label>
            </div>
            <label>
              Description
              <textarea data-habit-field="description" placeholder="Explain what success looks like for this target.">${escapeHtml(
                habit.description
              )}</textarea>
            </label>
          </article>
        `
      )
      .join("");
  }

  function getActiveMealPlanDay() {
    const activeDay = state.mealPlanDays.find((day) => day.id === state.nutritionWizard.activeMealDayId);
    if (activeDay) {
      return activeDay;
    }
    const firstDay = state.mealPlanDays[0] || null;
    state.nutritionWizard.activeMealDayId = firstDay?.id || "";
    return firstDay;
  }

  function setActiveMealPlanDay(dayId) {
    if (!state.mealPlanDays.some((day) => day.id === dayId)) {
      return;
    }
    state.nutritionWizard.activeMealDayId = dayId;
    renderMealPlanBuilder();
  }

  function renderMealPlanBuilder() {
    if (!mealPlanDaysNode) {
      return;
    }

    const derived = deriveWorkspace();
    const activeDay = getActiveMealPlanDay();
    if (!activeDay) {
      mealPlanDaysNode.innerHTML = `<p class="coach-programming-empty">Build the workbook inputs first and the weekly rhythm will appear here.</p>`;
      return;
    }

    mealPlanDaysNode.innerHTML = `
      <div class="coach-nutrition-meal-layout">
        <div class="coach-nutrition-meal-day-selector" role="tablist" aria-label="Weekly meal days">
          ${state.mealPlanDays
            .map((day, index) => {
              const isActive = day.id === activeDay.id;
              return `
                <button
                  class="coach-nutrition-meal-day-pill${isActive ? " is-active" : ""}"
                  type="button"
                  data-select-meal-day="${escapeHtml(day.id)}"
                  aria-pressed="${isActive ? "true" : "false"}"
                >
                  <span class="coach-nutrition-meal-day-pill__eyebrow">Day ${index + 1}</span>
                  <strong>${escapeHtml(day.label)}</strong>
                  <small>${escapeHtml(toTitleCase(day.dayType || "rest"))} • ${escapeHtml(`${day.slots.length} slot${day.slots.length === 1 ? "" : "s"}`)}</small>
                </button>
              `;
            })
            .join("")}
        </div>

        <article class="coach-programming-day-card coach-programming-meal-day-card coach-programming-meal-day-card--active" data-meal-plan-day-id="${escapeHtml(activeDay.id)}">
          <div class="coach-programming-day-card__head">
            <div>
              <span class="kicker kicker--accent">Active Day</span>
              <h3>${escapeHtml(activeDay.label)}</h3>
            </div>
            <div class="coach-programming-meta-chips">
              <span class="chip chip--tone-info">${escapeHtml(toTitleCase(activeDay.dayType || "rest"))}</span>
              <span class="chip chip--tone-info">${escapeHtml(`${activeDay.slots.length} slot${activeDay.slots.length === 1 ? "" : "s"}`)}</span>
            </div>
          </div>
          <div class="client-planner-kv-grid coach-nutrition-preview-grid coach-nutrition-preview-grid--day">
            <div>
              <dt>Day Type</dt>
              <dd>
                <select data-meal-day-field="dayType">
                  ${["training", "rest", "special"]
                    .map(
                      (option) =>
                        `<option value="${option}"${option === activeDay.dayType ? " selected" : ""}>${escapeHtml(toTitleCase(option))}</option>`
                    )
                    .join("")}
                </select>
              </dd>
            </div>
            <div>
              <dt>Targets</dt>
              <dd>${escapeHtml(formatNutritionTargetLine(activeDay.targets))}</dd>
            </div>
            <div>
              <dt>Hydration</dt>
              <dd>${escapeHtml(formatNutritionWorkbookMetric(activeDay.targets?.hydrationLiters, " L"))}</dd>
            </div>
          </div>
          <label>
            Day guidance
            <textarea data-meal-day-field="note" placeholder="Training day fueling, recovery focus, restaurant guidance, or substitutions.">${escapeHtml(activeDay.note || "")}</textarea>
          </label>
          <div class="coach-programming-day-stack coach-programming-day-stack--meal-slots">
            ${activeDay.slots
              .map(
                (slot, slotIndex) => `
                  <article class="coach-programming-meal-slot-card" data-meal-plan-slot-id="${escapeHtml(slot.id)}">
                    <div class="coach-programming-meal-slot-card__head">
                      <div>
                        <span class="kicker kicker--accent">Meal Slot ${slotIndex + 1}</span>
                        <h4>${escapeHtml(slot.title || toTitleCase(String(slot.mealType || "meal").replace(/_/gu, " ")))}</h4>
                      </div>
                      <button class="btn btn-ghost" type="button" data-remove-meal-slot="${escapeHtml(slot.id)}"${activeDay.slots.length === 1 ? " disabled" : ""}>Remove</button>
                    </div>
                    <div class="coach-programming-day-grid coach-programming-day-grid--session coach-nutrition-slot-grid">
                      <label>
                        Meal type
                        <select data-meal-slot-field="mealType">
                          ${MEAL_SLOT_TYPE_OPTIONS.map(
                            (option) =>
                              `<option value="${option}"${option === slot.mealType ? " selected" : ""}>${escapeHtml(toTitleCase(option.replace(/_/gu, " ")))}</option>`
                          ).join("")}
                        </select>
                      </label>
                      <label>
                        Recipe
                        <select data-meal-slot-field="recipeId">
                          <option value=""${slot.recipeId ? "" : " selected"}>Coach guidance only</option>
                          ${derived.recipes
                            .map(
                              (recipe) =>
                                `<option value="${escapeHtml(recipe.id)}"${recipe.id === slot.recipeId ? " selected" : ""}>${escapeHtml(recipe.title)}</option>`
                            )
                            .join("")}
                        </select>
                      </label>
                      <label>
                        Slot title
                        <input type="text" data-meal-slot-field="title" value="${escapeHtml(slot.title || "")}" placeholder="Post-training recovery lunch" />
                      </label>
                    </div>
                    <label>
                      Coach note
                      <textarea data-meal-slot-field="note" placeholder="Portion cue, restaurant fallback, prep note, or substitutions.">${escapeHtml(slot.note || "")}</textarea>
                    </label>
                  </article>
                `
              )
              .join("")}
          </div>
          <div class="section-actions section-actions--compact">
            <button class="btn btn-ghost" type="button" data-add-meal-slot="${escapeHtml(activeDay.id)}">Add Meal Slot</button>
          </div>
        </article>
      </div>
    `;
  }

  function renderNutritionWizardPreview() {
    if (!nutritionPreviewGridNode || !nutritionForm) {
      return;
    }

    const workbookDraft = state.nutritionWizard.workbookSnapshot || getNutritionWorkbookDraft();
    renderNutritionWorkbookPreview(workbookDraft);
    renderNutritionTargetGrid(workbookDraft);

    const derived = deriveWorkspace();
    const formData = new FormData(nutritionForm);
    const clientId = String(formData.get("clientId") || "").trim();
    const clientName = clientId ? resolveClientDisplayName(clientId) : "Select a client";
    const strategy = String(formData.get("strategy") || "hybrid").trim();
    const calories = parseInteger(formData.get("caloriesTarget"));
    const protein = parseInteger(formData.get("proteinTargetG"));
    const carbs = parseInteger(formData.get("carbsTargetG"));
    const fats = parseInteger(formData.get("fatTargetG"));
    const linkedAssignmentId = String(formData.get("assignmentId") || "").trim();
    const linkedAssignment = (derived.programAssignments || []).find((assignment) => assignment.id === linkedAssignmentId) || null;
    const mealDays = state.mealPlanDays.filter((day) => Array.isArray(day.slots) && day.slots.some((slot) => compactText(slot.title) || compactText(slot.recipeId) || compactText(slot.note)));
    const slotCount = mealDays.reduce((sum, day) => sum + day.slots.filter((slot) => compactText(slot.title) || compactText(slot.recipeId) || compactText(slot.note)).length, 0);
    const focusedDay = mealDays[0] || null;

    nutritionPreviewGridNode.innerHTML = [
      `<div><dt>Client</dt><dd>${escapeHtml(clientName)}</dd></div>`,
      `<div><dt>Strategy</dt><dd>${escapeHtml(toTitleCase(strategy))}</dd></div>`,
      `<div><dt>Linked block</dt><dd>${escapeHtml(linkedAssignment?.title || "No linked training block")}</dd></div>`,
      `<div><dt>Macro target</dt><dd>${escapeHtml([
        Number.isFinite(calories) ? `${calories} kcal` : "",
        Number.isFinite(protein) ? `${protein}P` : "",
        Number.isFinite(carbs) ? `${carbs}C` : "",
        Number.isFinite(fats) ? `${fats}F` : "",
      ].filter(Boolean).join(" • ") || "Targets not set yet")}</dd></div>`,
      `<div><dt>Habit targets</dt><dd>${escapeHtml(String(state.nutritionHabits.length))}</dd></div>`,
      `<div><dt>Meal days</dt><dd>${escapeHtml(String(mealDays.length))}</dd></div>`,
      `<div><dt>Meal slots</dt><dd>${escapeHtml(String(slotCount))}</dd></div>`,
      `<div><dt>First day focus</dt><dd>${escapeHtml(focusedDay ? `${focusedDay.label} • ${toTitleCase(focusedDay.dayType || "rest")}` : "Weekly rhythm not built yet")}</dd></div>`,
      `<div><dt>Plan status</dt><dd>${escapeHtml(clientId ? "Ready to generate when inputs look right" : "Select a client first")}</dd></div>`,
    ].join("");

    if (nutritionPreviewNoteNode) {
      const workbookSummary = Array.isArray(workbookDraft?.macroPlan?.summaryCard) ? workbookDraft.macroPlan.summaryCard : [];
      nutritionPreviewNoteNode.textContent = clientId
        ? workbookSummary[1] || "This preview is generated from the coach inputs above. The client will only see the finished day structure and the logging surfaces."
        : "Choose a client first, then the preview will show the live nutrition build you are about to generate.";
    }
  }

  function renderQuestionBuilder() {
    if (!checkinQuestionsNode) {
      return;
    }

    checkinQuestionsNode.innerHTML = state.checkinQuestions
      .map(
        (question, index) => `
          <article class="coach-programming-day-card" data-question-id="${escapeHtml(question.id)}">
            <div class="coach-programming-day-card__head">
              <div>
                <span class="kicker kicker--accent">Question ${index + 1}</span>
                <h3>${escapeHtml(question.label || `Question ${index + 1}`)}</h3>
              </div>
              <button class="btn btn-ghost" type="button" data-remove-question="${escapeHtml(question.id)}"${
                state.checkinQuestions.length === 1 ? " disabled" : ""
              }>Remove</button>
            </div>
            <div class="coach-programming-day-grid">
              <label>
                Field key
                <input type="text" data-question-field="fieldKey" value="${escapeHtml(question.fieldKey)}" placeholder="energy_score" />
              </label>
              <label>
                Type
                <select data-question-field="questionType">
                  ${["text", "textarea", "number", "boolean", "single_select", "multi_select", "date", "rating"]
                    .map(
                      (option) =>
                        `<option value="${option}"${option === question.questionType ? " selected" : ""}>${escapeHtml(toTitleCase(option))}</option>`
                    )
                    .join("")}
                </select>
              </label>
              <label class="client-planner-check-toggle">
                <input type="checkbox" data-question-field="isRequired"${question.isRequired ? " checked" : ""} />
                <span>Required question</span>
              </label>
            </div>
            <label>
              Question label
              <input type="text" data-question-field="label" value="${escapeHtml(question.label)}" placeholder="How was your energy this week?" />
            </label>
            <label>
              Help text
              <textarea data-question-field="helpText" placeholder="Tell the client how to answer this well.">${escapeHtml(
                question.helpText
              )}</textarea>
            </label>
            <label>
              Options
              <input type="text" data-question-field="optionsText" value="${escapeHtml(
                question.optionsText
              )}" placeholder="Completed,Partial,Missed,Rest day" />
            </label>
          </article>
        `
      )
      .join("");
  }

  function renderNutritionAssignmentOptions(derived) {
    const targetClientId = nutritionClientNode?.value || "";
    const assignmentOptions = targetClientId
      ? derived.programAssignments.filter((assignment) => assignment.client_id === targetClientId && isActiveStatus(assignment.status))
      : [];

    if (nutritionAssignmentNode) {
      const currentValue = nutritionAssignmentNode.value;
      nutritionAssignmentNode.innerHTML = [
        '<option value="">No linked program</option>',
        ...assignmentOptions.map(
          (assignment) => `<option value="${escapeHtml(assignment.id)}">${escapeHtml(assignment.title)} · ${escapeHtml(formatDate(assignment.start_date))}</option>`
        ),
      ].join("");
      if (assignmentOptions.some((assignment) => assignment.id === currentValue)) {
        nutritionAssignmentNode.value = currentValue;
      } else if (assignmentOptions.length === 1) {
        nutritionAssignmentNode.value = assignmentOptions[0].id;
      }
    }

    if (scheduleCheckinAssignmentNode) {
      const currentValue = scheduleCheckinAssignmentNode.value;
      const clientId = scheduleCheckinClientNode?.value || "";
      const clientAssignments = clientId
        ? derived.programAssignments.filter((assignment) => assignment.client_id === clientId && isActiveStatus(assignment.status))
        : [];
      scheduleCheckinAssignmentNode.innerHTML = [
        '<option value="">No linked program</option>',
        ...clientAssignments.map(
          (assignment) => `<option value="${escapeHtml(assignment.id)}">${escapeHtml(assignment.title)} · ${escapeHtml(formatDate(assignment.start_date))}</option>`
        ),
      ].join("");
      if (clientAssignments.some((assignment) => assignment.id === currentValue)) {
        scheduleCheckinAssignmentNode.value = currentValue;
      } else if (clientAssignments.length === 1) {
        scheduleCheckinAssignmentNode.value = clientAssignments[0].id;
      }
    }
  }

  function renderDeliveryLibrary(derived) {
    if (!deliveryLibraryNode) {
      return;
    }

    const nutritionCards = derived.nutritionPlans.slice(0, 4).map((plan) => {
      const client = derived.roster.find((item) => item.id === plan.client_id);
      const mealDayCount = Array.isArray(plan.meal_plan?.days)
        ? plan.meal_plan.days.filter((day) => Array.isArray(day?.slots) && day.slots.length).length
        : 0;
      return `
        <article class="coach-programming-template-card">
          <div class="coach-programming-template-card__head">
            <div>
              <span class="kicker kicker--accent">Nutrition</span>
              <h3>${escapeHtml(plan.title || "Nutrition Plan")}</h3>
            </div>
            <span class="chip chip--tone-info">${escapeHtml(toTitleCase(plan.status || "active"))}</span>
          </div>
          <p>${escapeHtml(client?.preferredName || client?.displayName || "Client")} · ${escapeHtml(toTitleCase(plan.strategy || "hybrid"))}</p>
          <div class="coach-programming-meta-chips">
            <span>${escapeHtml(formatCount(plan.calories_target || 0))} kcal</span>
            <span>${escapeHtml(formatCount(plan.protein_target_g || 0))}g protein</span>
            ${mealDayCount ? `<span>${escapeHtml(`${mealDayCount} meal day${mealDayCount === 1 ? "" : "s"}`)}</span>` : ""}
          </div>
        </article>
      `;
    });

    const checkinCards = derived.checkinTemplates.slice(0, 4).map((template) => `
      <article class="coach-programming-template-card">
        <div class="coach-programming-template-card__head">
          <div>
            <span class="kicker kicker--accent">Health</span>
            <h3>${escapeHtml(template.title || "Health Template")}</h3>
          </div>
          <span class="chip chip--tone-warning">${escapeHtml(toTitleCase(template.cadence || "weekly"))}</span>
        </div>
        <p>${escapeHtml(template.description || "No description added yet.")}</p>
        <div class="coach-programming-meta-chips">
          <span>${escapeHtml(formatHealthFormType(template.form_type || "weekly_checkin"))}</span>
          <span>${template.is_active ? "Active" : "Archived"}</span>
        </div>
      </article>
    `);

    const recipeCards = derived.recipes.slice(0, 4).map((recipe) => `
      <article class="coach-programming-template-card">
        <div class="coach-programming-template-card__head">
          <div>
            <span class="kicker kicker--accent">Recipe</span>
            <h3>${escapeHtml(recipe.title || "Coach Recipe")}</h3>
          </div>
          <span class="chip chip--tone-success">${escapeHtml(recipe.defaultServingLabel || `${formatMacroValue(recipe.yieldServings, " servings")}`)}</span>
        </div>
        <p>${escapeHtml(recipe.description || "Reusable coach-built recipe ready for meal diary logging.")}</p>
        <div class="coach-programming-meta-chips">
          <span>${escapeHtml(formatMacroValue(recipe.perServingCaloriesKcal, " kcal"))}</span>
          <span>${escapeHtml(formatMacroValue(recipe.perServingProteinG, "g protein"))}</span>
        </div>
      </article>
    `);

    const cards = isHealthWorkspace()
      ? [...checkinCards]
      : isNutritionWorkspace()
        ? [...nutritionCards, ...recipeCards]
        : [];
    deliveryLibraryNode.innerHTML = cards.length
      ? cards.join("")
      : isHealthWorkspace()
        ? buildWorkspaceEmptyCard(
            "No health templates saved yet.",
            "Save your first health form to build a reusable delivery library for recovery and readiness.",
            "info"
          )
        : isNutritionWorkspace()
          ? buildWorkspaceEmptyCard(
              "No nutrition plans or recipes saved yet.",
              "Save your first nutrition plan, recipe, or delivery asset and it will appear here for reuse.",
              "success"
            )
          : buildWorkspaceEmptyCard(
              "No delivery assets saved yet.",
              "Save your first training-support asset and it will appear here for quick reuse across the roster.",
              "neutral"
            );
  }

  function renderFoodServingBuilder() {
    if (!foodServingsNode) {
      return;
    }

    if (!state.foodServings.length) {
      foodServingsNode.innerHTML = '<p class="coach-programming-empty">Add at least one serving so clients can log this food accurately.</p>';
      return;
    }

    foodServingsNode.innerHTML = state.foodServings
      .map((serving) => `
        <article class="coach-programming-day-card" data-food-serving-id="${escapeHtml(serving.id)}">
          <div class="coach-programming-day-card__head">
            <div>
              <span class="kicker kicker--accent">Serving</span>
              <h3>${escapeHtml(serving.label || "Serving")}</h3>
            </div>
            <button class="btn btn-ghost" type="button" data-remove-food-serving="${escapeHtml(serving.id)}">Remove</button>
          </div>
          <div class="coach-programming-day-grid coach-programming-day-grid--session">
            <label>
              Label
              <input type="text" data-food-serving-field="label" value="${escapeHtml(serving.label)}" placeholder="1 bowl" />
            </label>
            <label>
              Grams
              <input type="number" data-food-serving-field="grams" min="1" step="0.1" value="${escapeHtml(serving.grams)}" />
            </label>
            <label>
              Unit count
              <input type="number" data-food-serving-field="unitCount" min="0.1" step="0.1" value="${escapeHtml(serving.unitCount)}" />
            </label>
            <label class="client-planner-check-toggle">
              <input type="checkbox" data-food-serving-field="isDefault"${serving.isDefault ? " checked" : ""} />
              <span>Default serving</span>
            </label>
          </div>
        </article>
      `)
      .join("");
  }

  function renderFoodLibraryResults() {
    if (!foodLibraryNode) {
      return;
    }

    if (!state.foodSearchResults.length) {
      foodLibraryNode.innerHTML = '<p class="coach-programming-empty">Food search results will appear here.</p>';
      return;
    }

    foodLibraryNode.innerHTML = state.foodSearchResults
      .map((food) => `
        <article class="coach-programming-template-card">
          <div class="coach-programming-template-card__head">
            <div>
              <span class="kicker kicker--accent">Food</span>
              <h3>${escapeHtml(food.name)}</h3>
            </div>
            <span class="chip chip--tone-${food.isVerified ? "success" : "warning"}">${escapeHtml(food.isVerified ? "Verified" : "Manual")}</span>
          </div>
          <p>${escapeHtml(food.brandName || `${toTitleCase(food.foodGroup || "food")} · ${food.dataSource || "manual"}`)}</p>
          <div class="coach-programming-meta-chips">
            <span>${escapeHtml(formatMacroValue(food.caloriesKcal, " kcal"))}</span>
            <span>${escapeHtml(formatMacroValue(food.proteinG, "g protein"))}</span>
            <span>${escapeHtml(formatMacroValue(food.carbsG, "g carbs"))}</span>
            <span>${escapeHtml(formatMacroValue(food.fatG, "g fat"))}</span>
          </div>
          <div class="coach-programming-meta-chips">
            ${
              (food.servings || [])
                .slice(0, 3)
                .map((serving) => `<span>${escapeHtml(serving.label)} · ${escapeHtml(formatMacroValue(serving.grams, " g"))}</span>`)
                .join("")
            }
          </div>
          <div class="coach-programming-meta-chips">
            ${sourceMappingLabel(food) ? `<span>${escapeHtml(sourceMappingLabel(food))}</span>` : ""}
            <span>${escapeHtml(toTitleCase(food.dataSource || "manual"))}</span>
          </div>
          <div class="section-actions section-actions--compact">
            <button class="btn btn-ghost" type="button" data-add-recipe-ingredient="${escapeHtml(food.id)}">Add Ingredient</button>
          </div>
        </article>
      `)
      .join("");
  }

  function renderRecipeIngredientBuilder() {
    if (!recipeIngredientsNode) {
      return;
    }

    if (!state.recipeIngredients.length) {
      recipeIngredientsNode.innerHTML = '<p class="coach-programming-empty">Use the food library and add items as recipe ingredients.</p>';
      return;
    }

    recipeIngredientsNode.innerHTML = state.recipeIngredients
      .map((ingredient) => `
        <article class="coach-programming-day-card" data-recipe-ingredient-id="${escapeHtml(ingredient.id)}">
          <div class="coach-programming-day-card__head">
            <div>
              <span class="kicker kicker--accent">Ingredient</span>
              <h3>${escapeHtml(ingredient.name)}</h3>
            </div>
            <button class="btn btn-ghost" type="button" data-remove-recipe-ingredient="${escapeHtml(ingredient.id)}">Remove</button>
          </div>
          <div class="coach-programming-day-grid coach-programming-day-grid--session">
            <label>
              Serving
              <select data-recipe-ingredient-field="servingId">
                ${
                  (ingredient.servings || [])
                    .map(
                      (serving) => `<option value="${escapeHtml(serving.id)}"${serving.id === ingredient.servingId ? " selected" : ""}>${escapeHtml(serving.label)} · ${escapeHtml(formatMacroValue(serving.grams, " g"))}</option>`
                    )
                    .join("")
                }
              </select>
            </label>
            <label>
              Quantity
              <input type="number" min="0.25" step="0.25" data-recipe-ingredient-field="quantity" value="${escapeHtml(String(ingredient.quantity || 1))}" />
            </label>
            <label>
              Grams
              <input type="number" min="1" step="0.1" data-recipe-ingredient-field="grams" value="${escapeHtml(String(ingredient.grams || 0))}" />
            </label>
          </div>
          <label>
            Note
            <input type="text" data-recipe-ingredient-field="note" value="${escapeHtml(ingredient.note || "")}" placeholder="Optional prep or substitution note" />
          </label>
        </article>
      `)
      .join("");
  }

  function renderRecipeLibrary(derived) {
    if (!recipeLibraryNode) {
      return;
    }

    if (!derived.recipes.length) {
      recipeLibraryNode.innerHTML = '<p class="coach-programming-empty">Saved recipes will appear here after the first one is built.</p>';
      return;
    }

    recipeLibraryNode.innerHTML = derived.recipes
      .slice(0, 16)
      .map((recipe) => {
        const ingredients = derived.recipeIngredientsByRecipe.get(recipe.id) || [];
        return `
          <article class="coach-programming-template-card">
            <div class="coach-programming-template-card__head">
              <div>
                <span class="kicker kicker--accent">Recipe</span>
                <h3>${escapeHtml(recipe.title)}</h3>
              </div>
              <span class="chip chip--tone-info">${escapeHtml(recipe.defaultServingLabel || `${formatMacroValue(recipe.yieldServings, " servings")}`)}</span>
            </div>
            <p>${escapeHtml(recipe.description || "No recipe description added yet.")}</p>
            <div class="coach-programming-meta-chips">
              <span>${escapeHtml(formatMacroValue(recipe.perServingCaloriesKcal, " kcal"))}</span>
              <span>${escapeHtml(formatMacroValue(recipe.perServingProteinG, "g protein"))}</span>
              <span>${escapeHtml(formatMacroValue(recipe.perServingCarbsG, "g carbs"))}</span>
              <span>${escapeHtml(formatMacroValue(recipe.perServingFatG, "g fat"))}</span>
            </div>
            <div class="coach-programming-meta-chips">
              ${ingredients.slice(0, 4).map((ingredient) => `<span>${escapeHtml(ingredient.item_name || "Ingredient")}</span>`).join("")}
            </div>
          </article>
        `;
      })
      .join("");
  }

  function renderExerciseLibraryResults() {
    if (!exerciseLibraryNode) {
      return;
    }

    if (!state.exerciseSearchResults.length) {
      const hasSearchQuery = compactText(exerciseSearchNode?.value);
      exerciseLibraryNode.innerHTML = hasSearchQuery
        ? '<p class="coach-programming-empty">No exercise demos matched that search yet.</p>'
        : '<p class="coach-programming-empty">Search for an exercise name to reveal matching demos.</p>';
      return;
    }

    exerciseLibraryNode.innerHTML = state.exerciseSearchResults
      .map((exercise) => {
        const provider = compactText(exercise.customFields?.video_provider || exercise.videoProvider || "");
        const sourceMode = compactText(exercise.customFields?.demo_source_mode || "");
        const note = compactText(exercise.customFields?.demo_note || exercise.notes || "");
        const channel = compactText(exercise.customFields?.demo_channel || "");
        const publishedAt = compactText(exercise.customFields?.demo_published_at || "");
        return `
          <article class="coach-programming-template-card">
            <div class="coach-programming-template-card__head">
              <div>
                <span class="kicker kicker--accent">Exercise Demo</span>
                <h3>${escapeHtml(exercise.name || "Exercise")}</h3>
              </div>
              <span class="chip chip--tone-${provider === "youtube" ? "warning" : "success"}">${escapeHtml(provider || "manual")}</span>
            </div>
            <p class="coach-programming-library-url">${escapeHtml(exercise.videoUrl || "No demo URL saved yet.")}</p>
            <div class="coach-programming-meta-chips">
              ${exercise.bodyPart ? `<span>${escapeHtml(toTitleCase(exercise.bodyPart))}</span>` : ""}
              ${exercise.exerciseType ? `<span>${escapeHtml(toTitleCase(exercise.exerciseType))}</span>` : ""}
              ${sourceMode ? `<span>${escapeHtml(toTitleCase(sourceMode.replace(/_/gu, " ")))}</span>` : ""}
              ${publishedAt ? `<span>${escapeHtml(publishedAt)}</span>` : ""}
              ${channel ? `<span>${escapeHtml(channel)}</span>` : ""}
            </div>
            ${note ? `<p>${escapeHtml(note)}</p>` : ""}
            <div class="section-actions section-actions--compact">
              <button class="btn btn-secondary" type="button" data-exercise-library-id="${escapeHtml(exercise.id)}">Prefill Form</button>
            </div>
          </article>
        `;
      })
      .join("");
  }

  function fillExerciseFormFromResult(exercise) {
    if (!exerciseForm || !exercise) {
      return;
    }

    const setField = (name, value) => {
      const field = exerciseForm.elements.namedItem(name);
      if (field) {
        field.value = value || "";
      }
    };

    setField("id", exercise.id || "");
    setField("name", exercise.name || "");
    setField("videoUrl", exercise.videoUrl || "");
    setField("bodyPart", exercise.bodyPart || "");
    setField("exerciseType", exercise.exerciseType || "standard");
    setField("tags", Array.isArray(exercise.tags) ? exercise.tags.join(", ") : "");
    setField("demoNote", exercise.customFields?.demo_note || "");
    setField("notes", exercise.notes || "");
  }

  function extractStructuredSessionFromExercises(exercises) {
    const rows = Array.isArray(exercises) ? exercises : [];
    const structuredIndex = rows.findIndex((exercise) => {
      const metadata = exercise?.metadata && typeof exercise.metadata === "object" ? exercise.metadata : {};
      return Boolean(
        compactText(metadata.session_type)
        || compactText(metadata.session_label)
        || compactText(metadata.intensity_cue)
        || compactText(metadata.target_pace)
        || compactText(metadata.fuel_cue)
        || parseDecimal(exercise?.distance_meters || exercise?.distanceMeters)
        || parseInteger(exercise?.heart_rate_zone || exercise?.heartRateZone)
      );
    });

    if (structuredIndex < 0) {
      return {
        session: null,
        remainingExercises: rows,
      };
    }

    const structuredExercise = rows[structuredIndex];
    const metadata = structuredExercise?.metadata && typeof structuredExercise.metadata === "object" ? structuredExercise.metadata : {};

    return {
      session: {
        sessionType: compactText(metadata.session_type || "standard") || "standard",
        sessionLabel: compactText(metadata.session_label || structuredExercise?.name_override || structuredExercise?.nameOverride),
        distanceKm: (() => {
          const distanceMeters = parseDecimal(structuredExercise?.distance_meters || structuredExercise?.distanceMeters);
          return distanceMeters ? String(Math.round((distanceMeters / 1000) * 10) / 10) : "";
        })(),
        heartRateZone: structuredExercise?.heart_rate_zone ?? structuredExercise?.heartRateZone ?? "",
        intensityCue: compactText(metadata.intensity_cue),
        targetPace: compactText(metadata.target_pace),
        fuelCue: compactText(metadata.fuel_cue),
      },
      remainingExercises: rows.filter((_, index) => index !== structuredIndex),
    };
  }

  function splitStructuredDayNotes(notes) {
    const lines = String(notes || "")
      .split(/\r?\n/gu)
      .map((line) => line.trim())
      .filter(Boolean);

    const stateful = {
      plainNotes: [],
      intensityCue: "",
      targetPace: "",
      fuelCue: "",
    };

    lines.forEach((line) => {
      if (!stateful.intensityCue && /^intensity cue:/iu.test(line)) {
        stateful.intensityCue = line.replace(/^intensity cue:\s*/iu, "").trim();
        return;
      }
      if (!stateful.targetPace && /^target pace\s*\/\s*speed:/iu.test(line)) {
        stateful.targetPace = line.replace(/^target pace\s*\/\s*speed:\s*/iu, "").trim();
        return;
      }
      if (!stateful.fuelCue && /^fuel cue:/iu.test(line)) {
        stateful.fuelCue = line.replace(/^fuel cue:\s*/iu, "").trim();
        return;
      }
      stateful.plainNotes.push(line);
    });

    return {
      notes: stateful.plainNotes.join("\n"),
      intensityCue: stateful.intensityCue,
      targetPace: stateful.targetPace,
      fuelCue: stateful.fuelCue,
    };
  }

  function buildTemplateDraftFromGraph(graph) {
    const template = graph?.template && typeof graph.template === "object" ? graph.template : null;
    if (!template?.id) {
      return null;
    }

    const weeks = Array.isArray(graph?.weeks) ? graph.weeks : [];
    const days = Array.isArray(graph?.days) ? graph.days : [];
    const exercises = Array.isArray(graph?.exercises) ? graph.exercises : [];
    const exercisesByDayId = exercises.reduce((map, exercise) => {
      const key = String(exercise.template_day_id || "");
      if (!key) {
        return map;
      }
      const list = map.get(key) || [];
      list.push(exercise);
      map.set(key, list);
      return map;
    }, new Map());

    return {
      template: {
        id: template.id,
        title: template.title || "",
        description: template.description || "",
        objective: template.objective || "",
        audience: template.audience || "",
        category: template.category || "strength",
        difficulty: template.difficulty || "intermediate",
        durationWeeks: template.duration_weeks || 1,
        estimatedDurationMinutes: template.estimated_duration_minutes || "",
        goals: Array.isArray(template.goals) ? template.goals : [],
        targetMuscleGroups: Array.isArray(template.target_muscle_groups) ? template.target_muscle_groups : [],
        equipmentRequired: Array.isArray(template.equipment_required) ? template.equipment_required : [],
        warmupInstructions: template.warmup_instructions || "",
        cooldownInstructions: template.cooldown_instructions || "",
        tags: Array.isArray(template.tags) ? template.tags : [],
        notes: template.notes || "",
      },
      weeks: weeks
        .slice()
        .sort((left, right) => Number(left.week_number || 0) - Number(right.week_number || 0))
        .map((week) => {
          const weekDays = days
            .filter((day) => day.template_week_id === week.id)
            .slice()
            .sort((left, right) => Number(left.day_number || 0) - Number(right.day_number || 0));

          return {
            weekNumber: Number(week.week_number || 1),
            title: week.title || "",
            summary: week.summary || "",
            notes: week.notes || "",
            days: weekDays.map((day) => {
              const dayExercises = (exercisesByDayId.get(day.id) || [])
                .slice()
                .sort((left, right) => Number(left.sort_order || 0) - Number(right.sort_order || 0));
              const structured = extractStructuredSessionFromExercises(dayExercises);
              const splitNotes = splitStructuredDayNotes(day.notes || "");

              return {
                title: day.title || "",
                focus: day.focus || "",
                dayType: day.day_type || "workout",
                estimatedDurationMinutes:
                  day.estimated_duration_minutes
                  ?? (
                    structured.session
                    && structured.session.sessionType !== "standard"
                    && dayExercises[0]?.duration_seconds
                      ? Math.round(Number(dayExercises[0].duration_seconds) / 60)
                      : ""
                  ),
                notes: splitNotes.notes,
                exerciseRows: structured.remainingExercises.map((exercise, index) => normalizeExerciseRow(exercise, index)),
                sessionType: structured.session?.sessionType || "standard",
                sessionLabel: structured.session?.sessionLabel || "",
                distanceKm: structured.session?.distanceKm || "",
                heartRateZone: structured.session?.heartRateZone || "",
                intensityCue: structured.session?.intensityCue || splitNotes.intensityCue,
                targetPace: structured.session?.targetPace || splitNotes.targetPace,
                fuelCue: structured.session?.fuelCue || splitNotes.fuelCue,
              };
            }),
          };
        }),
      days: (() => {
        const primaryWeek = weeks.length
          ? weeks.slice().sort((left, right) => Number(left.week_number || 0) - Number(right.week_number || 0))[0]
          : null;
        const primaryWeekId = primaryWeek?.id || "";
        const weekDays = days
          .filter((day) => !primaryWeekId || day.template_week_id === primaryWeekId)
          .slice()
          .sort((left, right) => Number(left.day_number || 0) - Number(right.day_number || 0));

        return weekDays.map((day) => {
          const dayExercises = (exercisesByDayId.get(day.id) || [])
            .slice()
            .sort((left, right) => Number(left.sort_order || 0) - Number(right.sort_order || 0));
          const structured = extractStructuredSessionFromExercises(dayExercises);
          const splitNotes = splitStructuredDayNotes(day.notes || "");

          return {
            title: day.title || "",
            focus: day.focus || "",
            dayType: day.day_type || "workout",
            estimatedDurationMinutes:
              day.estimated_duration_minutes
              ?? (
                structured.session
                && structured.session.sessionType !== "standard"
                && dayExercises[0]?.duration_seconds
                  ? Math.round(Number(dayExercises[0].duration_seconds) / 60)
                  : ""
              ),
            notes: splitNotes.notes,
            exerciseRows: structured.remainingExercises.map((exercise, index) => normalizeExerciseRow(exercise, index)),
            sessionType: structured.session?.sessionType || "standard",
            sessionLabel: structured.session?.sessionLabel || "",
            distanceKm: structured.session?.distanceKm || "",
            heartRateZone: structured.session?.heartRateZone || "",
            intensityCue: structured.session?.intensityCue || splitNotes.intensityCue,
            targetPace: structured.session?.targetPace || splitNotes.targetPace,
            fuelCue: structured.session?.fuelCue || splitNotes.fuelCue,
          };
        });
      })(),
    };
  }

  function buildTemplateDraftFromAssignmentPayload(payload) {
    const assignment = payload?.assignment && typeof payload.assignment === "object" ? payload.assignment : null;
    if (!assignment?.id) {
      return null;
    }

    const template = payload?.template && typeof payload.template === "object" ? payload.template : null;
    const workbook = payload?.workbook && typeof payload.workbook === "object" ? payload.workbook : null;
    const days = Array.isArray(payload?.days) ? payload.days : [];
    const exercises = Array.isArray(payload?.exercises) ? payload.exercises : [];
    const exercisesByDayId = exercises.reduce((map, exercise) => {
      const key = String(exercise.client_program_day_id || "");
      if (!key) {
        return map;
      }
      const list = map.get(key) || [];
      list.push(exercise);
      map.set(key, list);
      return map;
    }, new Map());
    const weekNumbers = Array.from(
      new Set(
        [
          ...days.map((day) => Number(day.week_number || 1)),
          ...(Array.isArray(workbook?.weeks) ? workbook.weeks.map((week) => Number(week?.weekNumber || week?.week_number || 0)) : []),
        ].filter((value) => Number.isFinite(value) && value > 0)
      )
    ).sort((left, right) => left - right);
    const workbookWeekByNumber = new Map(
      (Array.isArray(workbook?.weeks) ? workbook.weeks : [])
        .map((week) => [Number(week?.weekNumber || 0), week])
        .filter(([weekNumber]) => Number.isFinite(weekNumber) && weekNumber > 0)
    );

    const weeks = weekNumbers.map((weekNumber) => {
      const workbookWeek = workbookWeekByNumber.get(weekNumber) || null;
      const weekDays = days
        .filter((day) => Number(day.week_number || 1) === weekNumber)
        .slice()
        .sort((left, right) => Number(left.day_number || 0) - Number(right.day_number || 0));

      if (!weekDays.length && Array.isArray(workbookWeek?.days) && workbookWeek.days.length) {
        return {
          weekNumber,
          title: workbookWeek?.title || `Week ${weekNumber}`,
          summary: workbookWeek?.summary || "",
          days: workbookWeek.days.map((day, index) => normalizeBuilderDay(day, index)),
        };
      }

      return {
        weekNumber,
        title: workbookWeek?.title || `Week ${weekNumber}`,
        summary: workbookWeek?.summary || "",
        days: weekDays.map((day) => {
          const dayExercises = (exercisesByDayId.get(day.id) || [])
            .slice()
            .sort((left, right) => Number(left.sort_order || 0) - Number(right.sort_order || 0));
          const structured = extractStructuredSessionFromExercises(dayExercises);
          const splitNotes = splitStructuredDayNotes(day.notes || "");

          return {
            title: day.title || "",
            focus: day.focus || "",
            dayType: day.day_type || "workout",
            estimatedDurationMinutes:
              day.estimated_duration_minutes
              ?? (
                structured.session
                && structured.session.sessionType !== "standard"
                && dayExercises[0]?.duration_seconds
                  ? Math.round(Number(dayExercises[0].duration_seconds) / 60)
                  : ""
              ),
            notes: splitNotes.notes,
            exerciseRows: structured.remainingExercises.map((exercise, index) => normalizeExerciseRow(exercise, index)),
            sessionType: structured.session?.sessionType || "standard",
            sessionLabel: structured.session?.sessionLabel || "",
            distanceKm: structured.session?.distanceKm || "",
            heartRateZone: structured.session?.heartRateZone || "",
            intensityCue: structured.session?.intensityCue || splitNotes.intensityCue,
            targetPace: structured.session?.targetPace || splitNotes.targetPace,
            fuelCue: structured.session?.fuelCue || splitNotes.fuelCue,
          };
        }),
      };
    });

    return {
      assignment,
      template: {
        id: "",
        title: assignment.title || template?.title || "",
        description: template?.description || "",
        objective: assignment.objective || template?.objective || "",
        audience: template?.audience || "",
        category: template?.category || workbook?.templateDraft?.template?.category || "general",
        difficulty: template?.difficulty || workbook?.templateDraft?.template?.difficulty || "intermediate",
        durationWeeks: weeks.length || template?.duration_weeks || 1,
        estimatedDurationMinutes: template?.estimated_duration_minutes || workbook?.templateDraft?.template?.estimatedDurationMinutes || "",
        goals: Array.isArray(template?.goals) ? template.goals : (Array.isArray(workbook?.templateDraft?.template?.goals) ? workbook.templateDraft.template.goals : []),
        targetMuscleGroups: Array.isArray(template?.target_muscle_groups) ? template.target_muscle_groups : [],
        equipmentRequired: Array.isArray(template?.equipment_required) ? template.equipment_required : [],
        warmupInstructions: template?.warmup_instructions || "",
        cooldownInstructions: template?.cooldown_instructions || "",
        tags: Array.isArray(template?.tags) ? template.tags : (Array.isArray(workbook?.templateDraft?.template?.tags) ? workbook.templateDraft.template.tags : []),
        notes: template?.notes || "",
      },
      weeks,
      days: weeks[0]?.days || [],
      workbook,
      sportProfile: payload?.sportProfile && typeof payload.sportProfile === "object" ? payload.sportProfile : null,
      client: payload?.client && typeof payload.client === "object" ? payload.client : null,
    };
  }

  function hydrateTemplateBuilderDraft(draft, options = {}) {
    if (!templateForm || !draft?.template) {
      return;
    }

    const setField = (name, value) => {
      const field = templateForm.elements.namedItem(name);
      if (field) {
        field.value = value || "";
      }
    };

    setField("title", draft.template.title || "");
    setField("description", draft.template.description || "");
    setField("objective", draft.template.objective || "");
    setField("audience", draft.template.audience || "");
    setField("category", draft.template.category || "strength");
    setField("difficulty", draft.template.difficulty || "intermediate");
    setField("durationWeeks", draft.template.durationWeeks || 4);
    setField("estimatedDurationMinutes", draft.template.estimatedDurationMinutes || "");
    setField("goals", Array.isArray(draft.template.goals) ? draft.template.goals.join(", ") : "");
    setField("targetMuscleGroups", Array.isArray(draft.template.targetMuscleGroups) ? draft.template.targetMuscleGroups.join(", ") : "");
    setField("equipmentRequired", Array.isArray(draft.template.equipmentRequired) ? draft.template.equipmentRequired.join(", ") : "");
    setField("warmupInstructions", draft.template.warmupInstructions || "");
    setField("cooldownInstructions", draft.template.cooldownInstructions || "");
    setField("tags", Array.isArray(draft.template.tags) ? draft.template.tags.join(", ") : "");
    setField("notes", draft.template.notes || "");
    setField("id", options.includeTemplateId ? draft.template.id || "" : "");

    const importedWeeks = Array.isArray(draft.weeks) ? draft.weeks : [];
    if (importedWeeks.length) {
      const workbookDraft = draft.workbook && typeof draft.workbook === "object" ? draft.workbook : null;
      state.trainingWorkbook = {
        athleteType: compactText(workbookDraft?.athleteType || workbookDraft?.kind),
        summaryCard: Array.isArray(workbookDraft?.summaryCard) ? workbookDraft.summaryCard.filter(Boolean) : [],
        previewPairs: Array.isArray(workbookDraft?.previewPairs)
          ? workbookDraft.previewPairs.filter((item) => item?.label && item?.value)
          : [],
        weeks: importedWeeks.map((week, index) => normalizeWorkbookWeek(week, index)),
        activeWeek: parseInteger(importedWeeks[0]?.weekNumber || importedWeeks[0]?.week_number) || 1,
        dirty: false,
      };
      const activeWeek = getActiveTrainingWorkbookWeek();
      state.builderDays = (activeWeek?.days || [createEmptyDay(1)]).map((day, index) => normalizeBuilderDay(day, index));
    } else {
      resetTrainingWorkbookState({ dirty: false });
      const importedDays = Array.isArray(draft.days) ? draft.days : [];
      state.builderDays = (importedDays.length ? importedDays : [createEmptyDay(1)]).map((day, index) =>
        normalizeBuilderDay(day, index)
      );
    }
    setTemplateEditorState(options.includeTemplateId ? draft.template : null);
    renderBuilderDays();
    setActivePanel("templates");
  }

  function hydrateTemplateBuilderFromWorkbookDraft(draft) {
    hydrateTemplateBuilderDraft(draft, { includeTemplateId: false });
  }

  function hydrateTemplateBuilderFromSavedTemplate(draft) {
    hydrateTemplateBuilderDraft(draft, { includeTemplateId: true });
  }

  function parseExerciseBulkRows(rawValue) {
    const lines = String(rawValue || "")
      .split(/\r?\n/gu)
      .map((line) => line.trim())
      .filter(Boolean);

    if (!lines.length) {
      return [];
    }

    const delimiter = detectBulkDelimiter(lines[0]);
    const headerKeys = parseDelimitedLine(lines[0], delimiter).map(normalizeBulkHeaderKey);
    const hasStructuredHeader = (
      headerKeys.includes("exercise_name")
      || headerKeys.includes("name")
      || headerKeys.includes("youtube_url")
      || headerKeys.includes("video_url")
      || headerKeys.includes("url")
    );

    if (hasStructuredHeader) {
      const findHeader = (...candidates) => headerKeys.find((key) => candidates.includes(key)) || "";
      const nameKey = findHeader("exercise_name", "name", "exercise", "movement_name");
      const urlKey = findHeader("youtube_url", "video_url", "url", "youtube_link", "demo_url");
      const publishedKey = findHeader("published_at", "publish_date", "video_published_at");
      const channelKey = findHeader("channel_name", "channel", "demo_channel");
      const noteKey = findHeader("demo_note", "note");
      const tagsKey = findHeader("tags", "tag_list");
      const sourceModeKey = findHeader("demo_source_mode", "source_mode");
      const statusKey = findHeader("library_status", "status");
      const titleKey = findHeader("demo_title", "title");

      return lines
        .slice(1)
        .map((line) => {
          const values = parseDelimitedLine(line, delimiter);
          const row = Object.fromEntries(headerKeys.map((key, index) => [key, values[index] || ""]));
          const name = compactText(row[nameKey]);
          const videoUrl = compactText(row[urlKey]);
          if (!name || !videoUrl) {
            return null;
          }

          return {
            name,
            videoUrl,
            publishedAt: compactText(row[publishedKey]),
            channelName: compactText(row[channelKey]),
            demoTitle: compactText(row[titleKey]),
            libraryStatus: compactText(row[statusKey]) || "active",
            tags: parseTagList(row[tagsKey]),
            demoSourceMode: compactText(row[sourceModeKey]) || "legacy_library",
            demoNote: compactText(row[noteKey]) || "Official LEGACY YouTube demo library link.",
          };
        })
        .filter(Boolean);
    }

    return lines
      .map((line) => {
        const segments = parseDelimitedLine(line, detectBulkDelimiter(line));
        if (segments.length < 2) {
          return null;
        }
        const [name, videoUrl, ...rest] = segments;
        if (!name || !videoUrl) {
          return null;
        }
        return {
          name,
          videoUrl,
          tags: parseTagList(rest.join(",")),
          demoSourceMode: "temporary_external",
          demoNote: "Temporary external demo until the LEGACY exercise library is ready.",
        };
      })
      .filter(Boolean);
  }

  function renderCheckinTemplateOptions(derived) {
    if (!scheduleCheckinTemplateNode) {
      return;
    }

    const currentValue = scheduleCheckinTemplateNode.value;
    scheduleCheckinTemplateNode.innerHTML = [
      '<option value="">Select health template</option>',
      ...derived.checkinTemplates.map(
        (template) =>
          `<option value="${escapeHtml(template.id)}">${escapeHtml(template.title)} · ${escapeHtml(toTitleCase(template.cadence || "weekly"))}</option>`
      ),
    ].join("");
    if (currentValue) {
      scheduleCheckinTemplateNode.value = currentValue;
    }
  }

  function renderReviewSummary(derived) {
    if (!reviewSummaryGridNode) {
      return;
    }

    if (!hasAssignedRoster(derived)) {
      reviewSummaryGridNode.innerHTML = "";
      return;
    }

    const workspaceItems = getWorkspacePendingReviewItems(derived);
    const cards = isHealthWorkspace()
      ? [
          {
            tone: "warning",
            label: "Health Forms Waiting",
            value: workspaceItems.filter((item) => item.type === "checkin").length,
            detail: "Submitted check-ins that still need a coach decision or follow-up.",
          },
          {
            tone: "info",
            label: "Progress Photos Waiting",
            value: workspaceItems.filter((item) => item.type === "progress_photo").length,
            detail: "Progress-photo batches waiting for review before the next adjustment.",
          },
          {
            tone: "alert",
            label: "Overdue Health Forms",
            value: derived.roster.filter((client) => client.overdueCheckins > 0).length,
            detail: "Assigned clients with health updates already due or marked late.",
          },
          {
            tone: "neutral",
            label: "Photo Refresh Due",
            value: derived.roster.filter((client) => client.needsPhotoNudge).length,
            detail: "Clients who are due for another progress-photo checkpoint.",
          },
        ]
      : isNutritionWorkspace()
        ? [
            {
              tone: "alert",
              label: "Low-Confidence Photos",
              value: derived.reviewSummary.lowConfidencePhotos,
              detail: "Meal-photo assists that still need a coach eye before they become reliable food logs.",
            },
            {
              tone: "warning",
              label: "Meal Diary Waiting",
              value: derived.reviewSummary.mealDiaryPending,
              detail: "Meal diary and macro review items that are still sitting in the nutrition backlog.",
            },
            {
              tone: "warning",
              label: "Nutrition Backlog Clients",
              value: derived.reviewSummary.nutritionBacklogClients,
              detail: "Assigned clients who currently have unresolved nutrition work in the queue.",
            },
            {
              tone: "neutral",
              label: "House Foods",
              value: derived.reviewSummary.coachFoodCount,
              detail: "Coach-owned foods available for faster nutrition logging and cleaner roster reuse.",
            },
            {
              tone: "neutral",
              label: "Recipes Live",
              value: derived.reviewSummary.recipesLive,
              detail: "Reusable coach recipes available to push into client nutrition workflows.",
            },
          ]
        : [
            {
              tone: "info",
              label: "Training Reviews",
              value: workspaceItems.filter((item) => item.type === "workout_log").length,
              detail: "Workout completions waiting for coach review.",
            },
            {
              tone: "neutral",
              label: "Reward Sync",
              value: workspaceItems.filter((item) => item.type === "reward_event").length,
              detail: "Planner reward events waiting to be approved or rejected.",
            },
          ];

    reviewSummaryGridNode.innerHTML = cards
      .map(
        (card) => `
          <article class="stat crm-stat coach-programming-review-stat" data-crm-tone="${escapeHtml(card.tone)}">
            <p class="crm-stat__label">${escapeHtml(card.label)}</p>
            <p class="crm-stat__value">${formatCount(card.value)}</p>
            <p class="crm-stat__detail">${escapeHtml(card.detail)}</p>
          </article>
        `
      )
      .join("");
  }

  function renderReviewClientOptions(derived) {
    if (!reviewClientNode) {
      return;
    }

    const currentValue = state.reviewFilters.clientId || reviewClientNode.value || "";
    const reviewCountsByClient = getWorkspacePendingReviewCountsByClient(derived);
    const clients = derived.roster.filter((client) => Number(reviewCountsByClient.get(client.id) || 0) > 0);
    reviewClientNode.innerHTML = [
      '<option value="">All assigned clients</option>',
      ...clients.map(
        (client) =>
          `<option value="${escapeHtml(client.id)}">${escapeHtml(
            `${client.preferredName || client.displayName || "Client"} · ${reviewCountsByClient.get(client.id) || 0} pending`
          )}</option>`
      ),
    ].join("");

    if (currentValue && clients.some((client) => client.id === currentValue)) {
      reviewClientNode.value = currentValue;
      state.reviewFilters.clientId = currentValue;
    } else {
      reviewClientNode.value = "";
      state.reviewFilters.clientId = "";
    }
  }

  function getFilteredReviewItems(derived) {
    const focus = String(state.reviewFilters.focus || "all").trim().toLowerCase();
    const clientId = String(state.reviewFilters.clientId || "").trim();
    const sortMode = String(state.reviewFilters.sort || "priority").trim().toLowerCase();

    const focusMatchers = {
      all: () => true,
      nutrition_backlog: (item) => item.domain === "nutrition",
      photo_triage: (item) => item.type === "nutrition_photo",
      meal_diary: (item) => ["meal_entry", "nutrition_log"].includes(item.type),
      health_followup: (item) => ["checkin", "progress_photo"].includes(item.type),
      training_rewards: (item) => ["workout_log", "reward_event"].includes(item.type),
      high_risk: (item) => Number(item.clientRiskScore || 0) >= 40,
    };

    const matcher = focusMatchers[focus] || focusMatchers.all;
    const filtered = getWorkspacePendingReviewItems(derived)
      .filter((item) => (clientId ? item.clientId === clientId : true))
      .filter((item) => matcher(item));

    const sorters = {
      priority: (left, right) => {
        if (right.priorityScore !== left.priorityScore) {
          return right.priorityScore - left.priorityScore;
        }
        return new Date(right.submittedAt || 0).getTime() - new Date(left.submittedAt || 0).getTime();
      },
      newest: (left, right) => new Date(right.submittedAt || 0).getTime() - new Date(left.submittedAt || 0).getTime(),
      oldest: (left, right) => new Date(left.submittedAt || 0).getTime() - new Date(right.submittedAt || 0).getTime(),
      client: (left, right) => {
        const nameCompare = String(left.clientName || "").localeCompare(String(right.clientName || ""));
        if (nameCompare !== 0) {
          return nameCompare;
        }
        return new Date(right.submittedAt || 0).getTime() - new Date(left.submittedAt || 0).getTime();
      },
    };

    return filtered.slice().sort(sorters[sortMode] || sorters.priority);
  }

  function renderReviewGrid(derived) {
    renderReviewSummary(derived);
    renderReviewClientOptions(derived);
    if (reviewEmptyStateNode) {
      reviewEmptyStateNode.hidden = hasAssignedRoster(derived);
    }
    if (reviewToolbarCardNode) {
      reviewToolbarCardNode.hidden = !hasAssignedRoster(derived);
    }
    if (reviewFocusNode) {
      reviewFocusNode.value = state.reviewFilters.focus || "all";
    }
    if (reviewSortNode) {
      reviewSortNode.value = state.reviewFilters.sort || "priority";
    }

    if (!reviewGridNode) {
      return;
    }

    if (!hasAssignedRoster(derived)) {
      reviewGridNode.innerHTML = `
        <article class="card coach-programming-review-empty-card" data-crm-tone="neutral">
          <strong>No coach review queue yet</strong>
          <p>${
            isHealthWorkspace()
              ? "Assign your first client in Clients. Once they start submitting health forms or progress photos, this queue becomes your fastest working view."
              : isNutritionWorkspace()
                ? "Assign your first client in Clients. Once they start logging meals or sending photo assists, this queue becomes your fastest working view."
                : "Assign your first client in Clients. Once they start submitting training logs, this queue becomes your fastest working view."
          }</p>
        </article>
      `;
      return;
    }

    const filteredItems = getFilteredReviewItems(derived);
    if (!filteredItems.length) {
      reviewGridNode.innerHTML = `
        <article class="card coach-programming-review-empty-card" data-crm-tone="success">
          <strong>Review queue is clear</strong>
          <p>No planner items match the current filters right now. Try a broader focus or switch back to all clients.</p>
        </article>
      `;
      return;
    }

    const groupedItems = filteredItems.reduce((accumulator, item) => {
      const list = accumulator.get(item.groupKey) || [];
      list.push(item);
      accumulator.set(item.groupKey, list);
      return accumulator;
    }, new Map());

    const groupOrder = isHealthWorkspace()
      ? ["health_followup"]
      : isNutritionWorkspace()
        ? ["nutrition_photos", "meal_diary"]
        : ["training_rewards"];

    reviewGridNode.innerHTML = groupOrder
      .filter((groupKey) => groupedItems.has(groupKey))
      .map((groupKey) => {
        const items = groupedItems.get(groupKey) || [];
        const groupMeta = items[0];
        const cardsMarkup = items
          .map((item) => {
            const reviewActions = getReviewActionConfig(item.type);
            return `
              <article class="coach-programming-review-card" data-tone="${escapeHtml(item.tone)}">
                <div class="coach-programming-review-card__head">
                  <div class="coach-programming-review-card__identity">
                    <span class="kicker kicker--accent">${escapeHtml(item.typeLabel)}</span>
                    <h3>${escapeHtml(item.clientName)}</h3>
                    <p>${escapeHtml(item.title)}</p>
                  </div>
                  <div class="coach-programming-review-card__status">
                    <span class="chip chip--tone-${escapeHtml(item.tone)}">${escapeHtml(toTitleCase(item.status || "pending"))}</span>
                    <span class="chip chip--tone-${escapeHtml(item.clientRiskTone)}">${escapeHtml(item.clientRiskLabel)}</span>
                  </div>
                </div>
                <p class="coach-programming-review-card__summary">${escapeHtml(item.summary || "Pending review item.")}</p>
                ${item.note ? `<p class="coach-programming-review-card__note">${escapeHtml(item.note)}</p>` : ""}
                <div class="coach-programming-meta-chips">
                  <span>${escapeHtml(formatDateTime(item.submittedAt))}</span>
                  <span>${escapeHtml(toTitleCase(item.reviewStatus || "pending"))}</span>
                  ${item.detailChips.map((chip) => `<span>${escapeHtml(chip)}</span>`).join("")}
                </div>
                <div class="section-actions section-actions--compact">
                  <button class="btn btn-primary" type="button" data-review-type="${escapeHtml(item.type)}" data-review-id="${escapeHtml(item.id)}" data-review-decision="${escapeHtml(reviewActions.primaryDecision)}">${escapeHtml(reviewActions.primaryLabel)}</button>
                  <button class="btn btn-secondary" type="button" data-review-type="${escapeHtml(item.type)}" data-review-id="${escapeHtml(item.id)}" data-review-decision="${escapeHtml(reviewActions.secondaryDecision)}">${escapeHtml(reviewActions.secondaryLabel)}</button>
                </div>
                <p class="dashboard-feedback" data-review-feedback="${escapeHtml(item.type)}:${escapeHtml(item.id)}">
                  Reviewing this item updates the planner queue immediately.
                </p>
              </article>
            `;
          })
          .join("");

        return `
          <section class="coach-programming-review-section">
            <header class="coach-programming-review-section__head">
              <div>
                <span class="kicker kicker--accent">${escapeHtml(groupMeta.groupLabel)}</span>
                <h3>${escapeHtml(`${formatCount(items.length)} item${items.length === 1 ? "" : "s"} waiting`)}</h3>
              </div>
              <p>${escapeHtml(groupMeta.groupDescription)}</p>
            </header>
            <div class="coach-programming-review-grid coach-programming-review-grid--section">
              ${cardsMarkup}
            </div>
          </section>
        `;
      })
      .join("");
  }

  function renderOperationsSummary(derived) {
    const hasRoster = hasAssignedRoster(derived);
    toggleOperationsSections(hasRoster);
    if (operationsEmptyStateNode) {
      operationsEmptyStateNode.hidden = hasRoster;
    }

    if (!operationsSummaryGridNode) {
      return;
    }

    if (!hasRoster) {
      operationsSummaryGridNode.innerHTML = "";
      return;
    }

    operationsSummaryGridNode.innerHTML = getWorkspaceOperationsSummary(derived)
      .map(
        (card) => `
          <article class="stat crm-stat coach-programming-review-stat" data-crm-tone="${escapeHtml(card.tone)}">
            <p class="crm-stat__label">${escapeHtml(card.label)}</p>
            <p class="crm-stat__value">${formatCount(card.value)}</p>
            <p class="crm-stat__detail">${escapeHtml(card.detail)}</p>
          </article>
        `
      )
      .join("");
  }

  function renderOperationsNudgeList(derived) {
    if (!operationsNudgeListNode) {
      return;
    }

    if (!hasAssignedRoster(derived)) {
      operationsNudgeListNode.innerHTML = '<p class="coach-programming-empty">Assign clients first. The nudge queue appears once a live roster exists.</p>';
      return;
    }

    const candidates = getWorkspaceOperationsCandidates(derived);

    if (!candidates.length) {
      operationsNudgeListNode.innerHTML = `<p class="coach-programming-empty">No roster nudges are needed right now for ${escapeHtml(derived.weekRangeLabel)}.</p>`;
      return;
    }

    operationsNudgeListNode.innerHTML = candidates
      .map((client) => `
        <label class="coach-programming-bulk-item coach-programming-bulk-item--nutrition coach-programming-bulk-item--ops">
          <input type="checkbox" value="${escapeHtml(client.id)}" data-ops-client-id="${escapeHtml(client.id)}" />
          <span class="coach-programming-bulk-item__body">
            <strong>${escapeHtml(client.preferredName || client.displayName || "Client")}</strong>
            <small>${escapeHtml(client.operationsFlags[0] || client.nextPriority || "Needs a coach follow-up.")}</small>
            <span class="coach-programming-meta-chips">
              <span>${escapeHtml(client.riskLabel)}</span>
              ${
                isHealthWorkspace()
                  ? `<span>${escapeHtml(client.nextOpenCheckin?.due_at ? `Health due ${formatDate(client.nextOpenCheckin.due_at)}` : `${client.weeklyCheckinCount} health update${client.weeklyCheckinCount === 1 ? "" : "s"} this week`)}</span>
                     <span>${escapeHtml(Number.isFinite(client.daysSincePhoto) ? `${client.daysSincePhoto} days since photo` : "No progress photo yet")}</span>`
                  : isNutritionWorkspace()
                    ? `<span>${escapeHtml(`${client.weeklyMealCount} meals this week`)}</span>
                       <span>${escapeHtml(`${client.weeklyNutritionCount} nutrition logs`)}</span>`
                    : `<span>${escapeHtml(`${client.weeklyWorkoutCount} training logs`)}</span>
                       <span>${escapeHtml(`${client.weeklyProgramDayCount} planned days`)}</span>`
              }
            </span>
          </span>
        </label>
      `)
      .join("");
  }

  function renderOperationsBoard(derived) {
    if (!operationsBoardNode) {
      return;
    }

    if (!hasAssignedRoster(derived)) {
      operationsBoardNode.innerHTML = '<p class="coach-programming-empty">Link your first clients before using the weekly operations board.</p>';
      return;
    }

    const candidates = getWorkspaceOperationsCandidates(derived);

    if (!candidates.length) {
      operationsBoardNode.innerHTML = '<p class="coach-programming-empty">Your roster is steady right now. No weekly operations follow-up is needed.</p>';
      return;
    }

    operationsBoardNode.innerHTML = candidates
      .map((client) => {
        const photoStatus = Number.isFinite(client.daysSincePhoto)
          ? `${client.daysSincePhoto} day${client.daysSincePhoto === 1 ? "" : "s"} since last progress photo`
          : "No progress photo on file yet";
        const healthStatus = client.nextOpenCheckin?.due_at
          ? `${client.needsCheckinNudge ? "Overdue" : "Due"} ${formatDate(client.nextOpenCheckin.due_at)}`
          : client.weeklyCheckinCount
            ? `${client.weeklyCheckinCount} health update${client.weeklyCheckinCount === 1 ? "" : "s"} this week`
            : "No open health form";
        const nutritionStatus = client.activeNutrition
          ? `${client.weeklyMealCount} meals logged this week • ${client.mealPlanDayCount || 0} meal day${client.mealPlanDayCount === 1 ? "" : "s"} planned`
          : "No active nutrition layer";
        const trainingStatus = client.activeProgram
          ? `${client.weeklyWorkoutCount} training log${client.weeklyWorkoutCount === 1 ? "" : "s"} this week`
          : "No active training block";

        const workspaceMeta = isHealthWorkspace()
          ? `
              <div>
                <dt>Health</dt>
                <dd>${escapeHtml(healthStatus)}</dd>
              </div>
              <div>
                <dt>Photos</dt>
                <dd>${escapeHtml(photoStatus)}</dd>
              </div>
              <div>
                <dt>Last activity</dt>
                <dd>${escapeHtml(client.lastActivityAt ? formatDate(client.lastActivityAt) : "No planner activity yet")}</dd>
              </div>
            `
          : isNutritionWorkspace()
            ? `
                <div>
                  <dt>Nutrition</dt>
                  <dd>${escapeHtml(nutritionStatus)}</dd>
                </div>
                <div>
                  <dt>Last meal log</dt>
                  <dd>${escapeHtml(client.lastNutritionAt ? formatDate(client.lastNutritionAt) : "No nutrition log yet")}</dd>
                </div>
                <div>
                  <dt>Last activity</dt>
                  <dd>${escapeHtml(client.lastActivityAt ? formatDate(client.lastActivityAt) : "No planner activity yet")}</dd>
                </div>
              `
            : `
                <div>
                  <dt>Training</dt>
                  <dd>${escapeHtml(trainingStatus)}</dd>
                </div>
                <div>
                  <dt>Last workout</dt>
                  <dd>${escapeHtml(client.lastWorkoutAt ? formatDate(client.lastWorkoutAt) : "No training log yet")}</dd>
                </div>
                <div>
                  <dt>Last activity</dt>
                  <dd>${escapeHtml(client.lastActivityAt ? formatDate(client.lastActivityAt) : "No planner activity yet")}</dd>
                </div>
              `;

        return `
          <article class="coach-programming-template-card coach-programming-ops-card" data-crm-tone="${escapeHtml(client.riskTone)}">
            <div class="coach-programming-template-card__head">
              <div>
                <p>${escapeHtml(client.memberId || "Client roster")}</p>
                <h3>${escapeHtml(client.preferredName || client.displayName || "Client")}</h3>
              </div>
              <span class="crm-pill">${escapeHtml(client.riskLabel)}</span>
            </div>
            <p class="coach-programming-note">${escapeHtml(client.operationsFlags[0] || client.nextPriority || "Keep this client moving through the weekly plan.")}</p>
            <div class="coach-programming-meta-chips">
              <span>${escapeHtml(`Week ${derived.weekRangeLabel}`)}</span>
              <span>${escapeHtml(`${client.pendingReviews} pending reviews`)}</span>
              ${client.recommendedNudgeCategory ? `<span>${escapeHtml(`Recommended ${toTitleCase(client.recommendedNudgeCategory)}`)}</span>` : ""}
            </div>
            <dl class="coach-programming-roster-meta coach-programming-roster-meta--ops">
              ${workspaceMeta}
            </dl>
            <div class="button-row">
              ${client.recommendedNudgeCategory ? `<button class="btn btn-secondary" type="button" data-ops-queue-client="${escapeHtml(client.id)}" data-ops-queue-category="${escapeHtml(client.recommendedNudgeCategory)}">Queue nudge</button>` : ""}
              <button class="btn btn-secondary" type="button" data-fill-client="${escapeHtml(client.id)}">Open client</button>
            </div>
          </article>
        `;
      })
      .join("");
  }

  function renderOperationsSegments(derived) {
    if (!segmentLibraryNode) {
      return;
    }

    if (!hasAssignedRoster(derived)) {
      segmentLibraryNode.innerHTML = "";
      return;
    }

    if (operationsEmptyStateNode) {
      operationsEmptyStateNode.hidden = hasAssignedRoster(derived);
    }

    const visibleSegments = state.coachOps.segments.filter((segment) => {
      const matches = getCoachOpsSegmentMatches(derived, segment.id);
      const isDefaultSegment = /^segment-/u.test(String(segment.id || ""));
      return matches.length > 0 || !isDefaultSegment;
    });

    if (!visibleSegments.length) {
      segmentLibraryNode.innerHTML = '<p class="coach-programming-empty">No saved segments yet. Build one above to speed up weekly coaching ops.</p>';
      return;
    }

    segmentLibraryNode.innerHTML = visibleSegments
      .map((segment) => {
        const matches = getCoachOpsSegmentMatches(derived, segment.id);
        const preview = matches
          .slice()
          .sort((left, right) => right.riskScore - left.riskScore)
          .slice(0, 3)
          .map((client) => client.preferredName || client.displayName || "Client");
        const filterChips = [];
        if (segment.filters?.riskMin) {
          filterChips.push(`Risk ${segment.filters.riskMin}+`);
        }
        if (segment.filters?.pendingReviewsMin) {
          filterChips.push(`${segment.filters.pendingReviewsMin}+ reviews`);
        }
        if (segment.filters?.needsNutritionNudge) filterChips.push("Nutrition");
        if (segment.filters?.needsCheckinNudge) filterChips.push("Health");
        if (segment.filters?.needsTrainingNudge) filterChips.push("Training");
        if (segment.filters?.needsPhotoNudge) filterChips.push("Photos");
        if (segment.filters?.quietThisWeek) filterChips.push("Quiet");
        if (segment.filters?.hasNoNutrition) filterChips.push("No nutrition");
        if (segment.filters?.hasNoProgram) filterChips.push("No program");

        return `
          <article class="coach-programming-template-card coach-ops-segment-card" data-crm-tone="${matches.length ? "info" : "neutral"}">
            <div class="coach-programming-template-card__head">
              <div>
                <p>Smart segment</p>
                <h3>${escapeHtml(segment.name)}</h3>
              </div>
              <span class="crm-pill">${escapeHtml(`${matches.length} match${matches.length === 1 ? "" : "es"}`)}</span>
            </div>
            <p class="coach-programming-note">
              ${escapeHtml(preview.length ? `Top watchlist: ${preview.join(", ")}.` : "No clients currently match this segment.")}
            </p>
            <div class="coach-programming-meta-chips">
              ${(filterChips.length ? filterChips : ["Reusable roster filter"]).map((chip) => `<span>${escapeHtml(chip)}</span>`).join("")}
            </div>
            <div class="button-row">
              <button class="btn btn-secondary" type="button" data-ops-select-segment="${escapeHtml(segment.id)}">Select clients</button>
              <button class="btn btn-secondary" type="button" data-ops-use-segment-rule="${escapeHtml(segment.id)}">Use in rule</button>
              <button class="btn btn-secondary" type="button" data-ops-delete-segment="${escapeHtml(segment.id)}">Delete</button>
            </div>
          </article>
        `;
      })
      .join("");
  }

  function renderAutomationSegmentOptions() {
    if (!automationSegmentNode) {
      return;
    }

    const currentValue = automationSegmentNode.value || "";
    automationSegmentNode.innerHTML = [
      '<option value="">Choose saved segment</option>',
      ...state.coachOps.segments.map(
        (segment) => `<option value="${escapeHtml(segment.id)}">${escapeHtml(segment.name)}</option>`
      ),
    ].join("");
    if (currentValue && state.coachOps.segments.some((segment) => segment.id === currentValue)) {
      automationSegmentNode.value = currentValue;
    }
  }

  function renderAutomationRules(derived) {
    if (!automationLibraryNode) {
      return;
    }

    if (!hasAssignedRoster(derived)) {
      automationLibraryNode.innerHTML = "";
      return;
    }

    const visibleRules = state.coachOps.automationRules.filter((rule) => {
      const matches = getCoachOpsSegmentMatches(derived, rule.segmentId);
      const isDefaultRule = /^rule-/u.test(String(rule.id || ""));
      return matches.length > 0 || !isDefaultRule;
    });

    if (!visibleRules.length) {
      automationLibraryNode.innerHTML = '<p class="coach-programming-empty">No automation rules saved yet. Add one to let the app carry repetitive follow-up for you.</p>';
      return;
    }

    automationLibraryNode.innerHTML = visibleRules
      .map((rule) => {
        const matches = getCoachOpsSegmentMatches(derived, rule.segmentId);
        return `
          <article class="coach-programming-template-card coach-ops-rule-card" data-crm-tone="${rule.enabled ? "warning" : "neutral"}">
            <div class="coach-programming-template-card__head">
              <div>
                <p>${escapeHtml(toTitleCase(rule.category))} automation</p>
                <h3>${escapeHtml(rule.name)}</h3>
              </div>
              <span class="crm-pill">${escapeHtml(rule.enabled ? "Live" : "Paused")}</span>
            </div>
            <p class="coach-programming-note">
              ${escapeHtml(`${matches.length} client${matches.length === 1 ? "" : "s"} in segment • ${toTitleCase(rule.schedule.replace(/_/gu, " "))} • ${rule.cooldownHours}h cooldown`)}
            </p>
            <div class="coach-programming-meta-chips">
              <span>${escapeHtml(state.coachOps.segments.find((segment) => segment.id === rule.segmentId)?.name || "Missing segment")}</span>
              <span>${escapeHtml(`${matches.length} current matches`)}</span>
              ${rule.message ? `<span>${escapeHtml("Custom copy")}</span>` : ""}
            </div>
            <div class="button-row">
              <button class="btn btn-secondary" type="button" data-ops-run-rule="${escapeHtml(rule.id)}">Select matching clients</button>
              <button class="btn btn-secondary" type="button" data-ops-toggle-rule="${escapeHtml(rule.id)}">${escapeHtml(rule.enabled ? "Pause rule" : "Enable rule")}</button>
              <button class="btn btn-secondary" type="button" data-ops-delete-rule="${escapeHtml(rule.id)}">Delete</button>
            </div>
          </article>
        `;
      })
      .join("");
  }

  function renderCalendarClientOptions(derived) {
    if (!calendarClientNode) {
      return;
    }

    const currentValue = state.calendar.clientId || "";
    calendarClientNode.innerHTML = [
      '<option value="">Entire roster</option>',
      ...derived.roster.map(
        (client) =>
          `<option value="${escapeHtml(client.id)}">${escapeHtml(client.preferredName || client.displayName || "Client")}</option>`
      ),
    ].join("");
    if (currentValue && derived.roster.some((client) => client.id === currentValue)) {
      calendarClientNode.value = currentValue;
    } else {
      calendarClientNode.value = "";
      state.calendar.clientId = "";
    }
  }

  function renderCalendarSummary(derived) {
    if (!calendarSummaryGridNode) {
      return;
    }

    calendarSummaryGridNode.innerHTML = (derived.calendarSummary || [])
      .map(
        (card) => `
          <article class="stat crm-stat coach-programming-review-stat" data-crm-tone="${escapeHtml(card.tone)}">
            <p class="crm-stat__label">${escapeHtml(card.label)}</p>
            <p class="crm-stat__value">${formatCount(card.value)}</p>
            <p class="crm-stat__detail">${escapeHtml(card.detail)}</p>
          </article>
        `
      )
      .join("");

    if (calendarWeekLabelNode) {
      calendarWeekLabelNode.textContent = derived.calendarRangeLabel || "This Week";
    }
  }

  function renderCalendarGrid(derived) {
    if (!calendarGridNode) {
      return;
    }

    if (!derived.calendarDays?.length) {
      calendarGridNode.innerHTML = buildWorkspaceEmptyCard(
        "No weekly calendar data is available yet.",
        "Once your roster has live assignments, nutrition cadence, or health due dates, the weekly command view will appear here.",
        "info"
      );
      return;
    }

    calendarGridNode.innerHTML = derived.calendarDays
      .map((day) => `
        <article class="coach-programming-calendar-day">
          <header class="coach-programming-calendar-day__head">
            <h3>${escapeHtml(day.label)}</h3>
            <span>${escapeHtml(`${day.events.length} event${day.events.length === 1 ? "" : "s"}`)}</span>
          </header>
          <div class="coach-programming-calendar-day__events">
            ${
              day.events.length
                ? day.events
                    .map(
                      (event) => `
                        <article class="coach-programming-calendar-event" data-tone="${escapeHtml(event.tone)}">
                          <div class="coach-programming-calendar-event__head">
                            <div>
                              <p>${escapeHtml(event.clientName)}</p>
                              <h4>${escapeHtml(event.title)}</h4>
                            </div>
                            <span class="crm-pill">${escapeHtml(toTitleCase(event.type))}</span>
                          </div>
                          <p>${escapeHtml(event.summary)}</p>
                          <div class="coach-programming-meta-chips">
                            ${(event.chips || []).map((chip) => `<span>${escapeHtml(chip)}</span>`).join("")}
                          </div>
                          <div class="button-row">
                            <button class="btn btn-secondary" type="button" data-calendar-focus-client="${escapeHtml(event.clientId)}" data-calendar-focus-panel="${escapeHtml(event.actionPanel)}">Open client</button>
                            ${
                              isTrainingWorkspace() && event.type === "training" && event.assignmentId
                                ? `<button class="btn btn-ghost" type="button" data-open-assignment-builder="${escapeHtml(event.assignmentId)}">Open block</button>`
                                : ""
                            }
                          </div>
                        </article>
                      `
                    )
                    .join("")
                : '<p class="coach-programming-empty">Nothing scheduled.</p>'
            }
          </div>
        </article>
      `)
      .join("");
  }

  function renderCalendarAttention(derived) {
    if (!calendarAttentionNode) {
      return;
    }

    if (!derived.calendarAttention?.length) {
      calendarAttentionNode.innerHTML = buildWorkspaceEmptyCard(
        "No clients need extra intervention right now.",
        "This board stays focused on clients who actually need a coach move in the selected calendar window.",
        "success"
      );
      return;
    }

    calendarAttentionNode.innerHTML = derived.calendarAttention
      .map((client) => `
        <article class="coach-programming-review-card" data-tone="${escapeHtml(client.riskTone)}">
          <div class="coach-programming-review-card__head">
            <div class="coach-programming-review-card__identity">
              <p>${escapeHtml(client.memberId || "Client roster")}</p>
              <h3>${escapeHtml(client.preferredName || client.displayName || "Client")}</h3>
            </div>
            <div class="coach-programming-review-card__status">
              <span class="crm-pill">${escapeHtml(client.riskLabel)}</span>
            </div>
          </div>
          <p class="coach-programming-review-card__summary">${escapeHtml(client.operationsFlags[0] || client.nextPriority || "Needs follow-up this week.")}</p>
          <div class="coach-programming-meta-chips">
            ${
              isTrainingWorkspace()
                ? `
                  <span>${escapeHtml(`${client.weeklyProgramDayCount} scheduled training day${client.weeklyProgramDayCount === 1 ? "" : "s"}`)}</span>
                  <span>${escapeHtml(`${client.weeklyWorkoutCount} workout log${client.weeklyWorkoutCount === 1 ? "" : "s"} this week`)}</span>
                  <span>${escapeHtml(client.activeProgram?.title || "No active block")}</span>
                `
                : `
                  <span>${escapeHtml(`${client.weeklyProgramDayCount} scheduled training day${client.weeklyProgramDayCount === 1 ? "" : "s"}`)}</span>
                  <span>${escapeHtml(`${client.weeklyMealCount} meals logged`)}</span>
                  <span>${escapeHtml(`${client.pendingReviews} pending reviews`)}</span>
                `
            }
          </div>
          <div class="button-row">
            ${
              !isTrainingWorkspace() && client.recommendedNudgeCategory
                ? `<button class="btn btn-secondary" type="button" data-ops-queue-client="${escapeHtml(client.id)}" data-ops-queue-category="${escapeHtml(client.recommendedNudgeCategory)}">Queue nudge</button>`
                : ""
            }
            <button class="btn btn-secondary" type="button" data-calendar-focus-client="${escapeHtml(client.id)}" data-calendar-focus-panel="${escapeHtml(isTrainingWorkspace() ? "assignments" : "operations")}">Open client</button>
            ${
              isTrainingWorkspace() && client.activeProgram?.id
                ? `<button class="btn btn-ghost" type="button" data-open-assignment-builder="${escapeHtml(client.activeProgram.id)}">Open block</button>`
                : ""
            }
          </div>
        </article>
      `)
      .join("");
  }

  function renderBulkAssignmentList(derived) {
    if (!bulkAssignListNode) {
      return;
    }

    if (!derived.bulkCandidates.length) {
      bulkAssignListNode.innerHTML = '<p class="coach-programming-empty">No safe bulk-assignment candidates right now. Everyone already has a live program.</p>';
      return;
    }

    bulkAssignListNode.innerHTML = derived.bulkCandidates
      .map((client) => `
        <label class="coach-programming-bulk-item">
          <input type="checkbox" name="clientIds" value="${escapeHtml(client.id)}" data-bulk-client-id="${escapeHtml(client.id)}" />
          <span class="coach-programming-bulk-item__body">
            <strong>${escapeHtml(client.preferredName || client.displayName || "Client")}</strong>
            <small>${escapeHtml(client.primaryGoal || "Goal not set yet")}</small>
            <span class="coach-programming-meta-chips">
              <span>${escapeHtml(client.riskLabel)}</span>
              <span>${escapeHtml(client.nextPriority)}</span>
            </span>
          </span>
        </label>
      `)
      .join("");
  }

  function renderBulkNutritionList(derived) {
    if (!bulkNutritionListNode) {
      return;
    }

    if (!derived.bulkNutritionCandidates.length) {
      bulkNutritionListNode.innerHTML = buildWorkspaceEmptyCard(
        "No batch-delivery clients yet.",
        "Once your roster has assigned clients with nutrition access, the safe batch-delivery list will appear here.",
        "info"
      );
      return;
    }

    bulkNutritionListNode.innerHTML = derived.bulkNutritionCandidates
      .map((client) => `
        <label class="coach-programming-bulk-item coach-programming-bulk-item--nutrition">
          <input type="checkbox" name="clientIds" value="${escapeHtml(client.id)}" data-bulk-nutrition-client-id="${escapeHtml(client.id)}" />
          <span class="coach-programming-bulk-item__body">
            <strong>${escapeHtml(client.preferredName || client.displayName || "Client")}</strong>
            <small>${escapeHtml(client.primaryGoal || "Goal not set yet")}</small>
            <span class="coach-programming-meta-chips">
              <span>${escapeHtml(client.activeNutrition?.title || "No active nutrition")}</span>
              <span>${escapeHtml(client.riskLabel)}</span>
              <span>${escapeHtml(client.nextPriority)}</span>
            </span>
          </span>
        </label>
      `)
      .join("");
  }

  function updateBuilderDay(dayId, field, value) {
    state.builderDays = state.builderDays.map((day) => (day.id === dayId ? { ...day, [field]: value } : day));
  }

  function updateBuilderExercise(dayId, exerciseId, field, value) {
    state.builderDays = state.builderDays.map((day) => {
      if (day.id !== dayId) {
        return day;
      }
      return {
        ...day,
        exerciseRows: day.exerciseRows.map((row) => (row.id === exerciseId ? { ...row, [field]: value } : row)),
      };
    });
  }

  function addBuilderDay() {
    state.builderDays = [...state.builderDays, createEmptyDay(state.builderDays.length + 1)];
    renderBuilderDays();
  }

  function removeBuilderDay(dayId) {
    if (state.builderDays.length === 1) {
      return;
    }
    state.builderDays = state.builderDays.filter((day) => day.id !== dayId);
    if (!state.builderDays.length) {
      state.builderDays = [createEmptyDay(1)];
    }
    renderBuilderDays();
  }

  function addBuilderExercise(dayId) {
    state.builderDays = state.builderDays.map((day) => {
      if (day.id !== dayId) {
        return day;
      }
      const nextIndex = Array.isArray(day.exerciseRows) ? day.exerciseRows.length + 1 : 1;
      return {
        ...day,
        exerciseRows: [...(day.exerciseRows || []), createEmptyExerciseRow(nextIndex)],
      };
    });
    renderBuilderDays();
  }

  function removeBuilderExercise(dayId, exerciseId) {
    state.builderDays = state.builderDays.map((day) => {
      if (day.id !== dayId) {
        return day;
      }
      const remainingRows = (day.exerciseRows || []).filter((row) => row.id !== exerciseId);
      return {
        ...day,
        exerciseRows: remainingRows.length ? remainingRows : [createEmptyExerciseRow(1)],
      };
    });
    renderBuilderDays();
  }

  function moveBuilderExercise(dayId, exerciseId, direction) {
    const step = Number(direction || 0);
    if (!step) {
      return;
    }

    state.builderDays = state.builderDays.map((day) => {
      if (day.id !== dayId) {
        return day;
      }
      const rows = Array.isArray(day.exerciseRows) ? [...day.exerciseRows] : [];
      const currentIndex = rows.findIndex((row) => row.id === exerciseId);
      const nextIndex = currentIndex + step;
      if (currentIndex < 0 || nextIndex < 0 || nextIndex >= rows.length) {
        return day;
      }
      const [row] = rows.splice(currentIndex, 1);
      rows.splice(nextIndex, 0, row);
      return {
        ...day,
        exerciseRows: rows,
      };
    });
    renderBuilderDays();
  }

  function updateNutritionHabit(habitId, field, value) {
    state.nutritionHabits = state.nutritionHabits.map((habit) => (habit.id === habitId ? { ...habit, [field]: value } : habit));
    state.nutritionWizard.habitsDirty = true;
  }

  function addNutritionHabit() {
    state.nutritionHabits = [...state.nutritionHabits, createEmptyHabit(state.nutritionHabits.length + 1)];
    state.nutritionWizard.habitsDirty = true;
    renderHabitBuilder();
    renderNutritionWizardPreview();
  }

  function removeNutritionHabit(habitId) {
    if (state.nutritionHabits.length === 1) {
      return;
    }
    state.nutritionHabits = state.nutritionHabits.filter((habit) => habit.id !== habitId);
    if (!state.nutritionHabits.length) {
      state.nutritionHabits = [createEmptyHabit(1)];
    }
    state.nutritionWizard.habitsDirty = true;
    renderHabitBuilder();
    renderNutritionWizardPreview();
  }

  function updateMealPlanDay(dayId, field, value) {
    const draft = state.nutritionWizard.workbookSnapshot || getNutritionWorkbookDraft();
    state.mealPlanDays = state.mealPlanDays.map((day) => {
      if (day.id !== dayId) {
        return day;
      }
      if (field === "dayType") {
        return {
          ...day,
          dayType: value,
          targets: createDefaultMealPlanDayTargets(value, draft),
        };
      }
      return { ...day, [field]: value };
    });
    state.nutritionWizard.mealPlanDirty = true;
  }

  function updateMealPlanSlot(slotId, field, value) {
    state.mealPlanDays = state.mealPlanDays.map((day) => ({
      ...day,
      slots: day.slots.map((slot) => (slot.id === slotId ? { ...slot, [field]: value } : slot)),
    }));
    state.nutritionWizard.mealPlanDirty = true;
  }

  function addMealPlanSlot(dayId) {
    state.mealPlanDays = state.mealPlanDays.map((day) => {
      if (day.id !== dayId) {
        return day;
      }
      return {
        ...day,
        slots: [...day.slots, createEmptyMealPlanSlot(day.dayKey, day.slots.length + 1)],
      };
    });
    state.nutritionWizard.mealPlanDirty = true;
    renderMealPlanBuilder();
    renderNutritionWizardPreview();
  }

  function removeMealPlanSlot(slotId) {
    state.mealPlanDays = state.mealPlanDays.map((day) => {
      const remainingSlots = day.slots.filter((slot) => slot.id !== slotId);
      if (remainingSlots.length === day.slots.length) {
        return day;
      }
      return {
        ...day,
        slots: remainingSlots.length ? remainingSlots : [createEmptyMealPlanSlot(day.dayKey, 1)],
      };
    });
    state.nutritionWizard.mealPlanDirty = true;
    renderMealPlanBuilder();
    renderNutritionWizardPreview();
  }

  function normalizeFoodServingDefaults() {
    if (!state.foodServings.length) {
      state.foodServings = [createEmptyFoodServing(1)];
      return;
    }
    if (!state.foodServings.some((serving) => serving.isDefault)) {
      state.foodServings = state.foodServings.map((serving, index) => ({
        ...serving,
        isDefault: index === 0,
      }));
    }
  }

  function updateFoodServing(servingId, field, value) {
    state.foodServings = state.foodServings.map((serving) => {
      if (serving.id !== servingId) {
        return field === "isDefault" && value ? { ...serving, isDefault: false } : serving;
      }
      return {
        ...serving,
        [field]: field === "isDefault" ? Boolean(value) : value,
      };
    });
    normalizeFoodServingDefaults();
    renderFoodServingBuilder();
  }

  function addFoodServing() {
    state.foodServings = [...state.foodServings, createEmptyFoodServing(state.foodServings.length + 1)];
    normalizeFoodServingDefaults();
    renderFoodServingBuilder();
  }

  function removeFoodServing(servingId) {
    if (state.foodServings.length === 1) {
      return;
    }
    state.foodServings = state.foodServings.filter((serving) => serving.id !== servingId);
    normalizeFoodServingDefaults();
    renderFoodServingBuilder();
  }

  function updateRecipeIngredient(ingredientId, field, value) {
    state.recipeIngredients = state.recipeIngredients.map((ingredient) => {
      if (ingredient.id !== ingredientId) {
        return ingredient;
      }

      if (field === "servingId") {
        const nextServing = (ingredient.servings || []).find((entry) => entry.id === value) || null;
        return {
          ...ingredient,
          servingId: value,
          grams: nextServing?.grams ? String(nextServing.grams) : ingredient.grams,
        };
      }

      return {
        ...ingredient,
        [field]: value,
      };
    });
    renderRecipeIngredientBuilder();
  }

  function addRecipeIngredient(foodId) {
    const derived = deriveWorkspace();
    const food =
      state.foodSearchResults.find((entry) => entry.id === foodId)
      || derived.catalogFoodById.get(foodId)
      || null;
    if (!food) {
      return;
    }

    state.recipeIngredients = [...state.recipeIngredients, createEmptyRecipeIngredient(food, state.recipeIngredients.length + 1)];
    renderRecipeIngredientBuilder();
    setInlineFeedback(recipeFeedbackNode, `${food.name} added to the recipe builder.`, false);
  }

  function removeRecipeIngredient(ingredientId) {
    state.recipeIngredients = state.recipeIngredients.filter((ingredient) => ingredient.id !== ingredientId);
    renderRecipeIngredientBuilder();
  }

  function updateCheckinQuestion(questionId, field, value) {
    state.checkinQuestions = state.checkinQuestions.map((question) => (question.id === questionId ? { ...question, [field]: value } : question));
  }

  function addCheckinQuestion() {
    const cadence = checkinCadenceNode?.value || "weekly";
    state.checkinQuestions = [...state.checkinQuestions, createEmptyQuestion(state.checkinQuestions.length + 1, cadence)];
    renderQuestionBuilder();
  }

  function removeCheckinQuestion(questionId) {
    if (state.checkinQuestions.length === 1) {
      return;
    }
    state.checkinQuestions = state.checkinQuestions.filter((question) => question.id !== questionId);
    if (!state.checkinQuestions.length) {
      state.checkinQuestions = createDefaultQuestionSet(checkinCadenceNode?.value || "weekly");
    }
    renderQuestionBuilder();
  }

  function slugifyFieldKey(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/gu, "_")
      .replace(/^_+|_+$/gu, "")
      .slice(0, 48);
  }

  function parseRepField(value) {
    const text = String(value || "").trim();
    if (!text) {
      return {
        reps: null,
        repRangeMin: null,
        repRangeMax: null,
      };
    }

    const rangeMatch = text.match(/^(\d+)\s*-\s*(\d+)$/u);
    if (rangeMatch) {
      return {
        reps: null,
        repRangeMin: Number(rangeMatch[1]),
        repRangeMax: Number(rangeMatch[2]),
      };
    }

    const reps = parseInteger(text);
    return {
      reps,
      repRangeMin: null,
      repRangeMax: null,
    };
  }

  function parseIntensityField(value) {
    const text = String(value || "").trim();
    if (!text) {
      return {
        intensityMode: "none",
        intensityValue: null,
      };
    }

    const match = text.match(/^(rpe|rir)\s*[:\-]?\s*(\d+(?:\.\d+)?)$/iu);
    if (!match) {
      return {
        intensityMode: "none",
        intensityValue: null,
      };
    }

    return {
      intensityMode: String(match[1]).toLowerCase(),
      intensityValue: Number(match[2]),
    };
  }

  function parseRestField(value) {
    const text = String(value || "").trim();
    if (!text) {
      return null;
    }

    const clockMatch = text.match(/^(\d+):(\d{2})$/u);
    if (clockMatch) {
      return (Number(clockMatch[1]) * 60) + Number(clockMatch[2]);
    }

    const secondsMatch = text.match(/^(\d+(?:\.\d+)?)\s*(s|sec|secs|second|seconds)?$/iu);
    if (secondsMatch) {
      return Math.round(Number(secondsMatch[1]));
    }

    const minutesMatch = text.match(/^(\d+(?:\.\d+)?)\s*(m|min|mins|minute|minutes)$/iu);
    if (minutesMatch) {
      return Math.round(Number(minutesMatch[1]) * 60);
    }

    return parseInteger(text);
  }

  function parseExerciseLines(rawValue) {
    return String(rawValue || "")
      .split(/\r?\n/gu)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line, index) => {
        const segments = line.split("|").map((part) => part.trim());
        const name = segments[0] || "";
        if (!name) {
          return null;
        }

        const repData = parseRepField(segments[2] || "");
        const intensityData = parseIntensityField(segments[3] || "");
        const notes = segments.slice(5).join(" | ") || segments[5] || "";

        return {
          sortOrder: index,
          nameOverride: name,
          sets: parseInteger(segments[1] || ""),
          reps: repData.reps,
          repRangeMin: repData.repRangeMin,
          repRangeMax: repData.repRangeMax,
          intensityMode: intensityData.intensityMode,
          intensityValue: intensityData.intensityValue,
          restTimeSeconds: parseRestField(segments[4] || ""),
          notes: notes || "",
        };
      })
      .filter(Boolean);
  }

  function formatExerciseRepTarget(exercise) {
    const reps = parseInteger(exercise.reps);
    const repRangeMin = parseInteger(exercise.repRangeMin || exercise.rep_range_min);
    const repRangeMax = parseInteger(exercise.repRangeMax || exercise.rep_range_max);
    const durationSeconds = parseInteger(exercise.durationSeconds || exercise.duration_seconds);
    if (repRangeMin && repRangeMax) {
      return `${repRangeMin}-${repRangeMax}`;
    }
    if (reps) {
      return String(reps);
    }
    if (durationSeconds) {
      return `${durationSeconds} sec`;
    }
    return "";
  }

  function formatExerciseIntensityTarget(exercise) {
    const mode = compactText(exercise.intensity || exercise.intensityMode || exercise.intensity_mode).toLowerCase();
    const value = parseDecimal(exercise.intensityValue || exercise.intensity_value);
    if ((mode === "rpe" || mode === "rir") && value !== null) {
      return `${mode.toUpperCase()} ${value}`;
    }
    return "";
  }

  function formatExerciseRestTarget(exercise) {
    const seconds = parseInteger(exercise.rest) ?? parseInteger(exercise.restTimeSeconds || exercise.rest_time_seconds);
    if (!seconds) {
      return "";
    }
    return `${seconds} sec`;
  }

  function normalizeExerciseRow(input, index) {
    const row = input && typeof input === "object" ? input : {};
    const metadata = row.metadata && typeof row.metadata === "object" ? row.metadata : {};
    return createEmptyExerciseRow(index + 1, {
      id: compactText(row.id) || buildLocalId(`exercise-${index + 1}`),
      blockLabel: row.blockLabel || row.block_label || "",
      name:
        row.name
        || row.nameOverride
        || row.name_override
        || row.exerciseName
        || row.exercise_name
        || "",
      sets: row.sets ?? "",
      repTarget: row.repTarget || row.rep_target || formatExerciseRepTarget(row),
      intensity: row.intensity || formatExerciseIntensityTarget(row),
      rest: row.rest || formatExerciseRestTarget(row),
      tempo: row.tempo || "",
      startingLoad: row.startingLoad ?? row.starting_load ?? row.prescribedWeightKg ?? row.prescribed_weight_kg ?? "",
      increment: metadata.increment_kg ?? row.incrementKg ?? row.increment_kg ?? "",
      progressionRule: row.progressionRule || row.progressiveOverloadGoal || row.progressive_overload_goal || metadata.progression_rule || "",
      clientEntryMode: metadata.client_entry_mode || metadata.client_input_mode || row.clientEntryMode || row.client_entry_mode || "log_weight_reps_rpe",
      notes: row.notes || "",
    });
  }

  function normalizeExerciseRows(rows, fallbackText = "") {
    const sourceRows = Array.isArray(rows) ? rows : [];
    if (sourceRows.length) {
      return sourceRows.map((row, index) => normalizeExerciseRow(row, index));
    }

    const parsedRows = parseExerciseLines(fallbackText).map((row, index) =>
      normalizeExerciseRow(
        {
          nameOverride: row.nameOverride,
          sets: row.sets,
          repTarget: formatExerciseRepTarget(row),
          intensity: formatExerciseIntensityTarget(row),
          rest: formatExerciseRestTarget(row),
          notes: row.notes,
        },
        index
      )
    );

    return parsedRows.length ? parsedRows : [createEmptyExerciseRow(1)];
  }

  function normalizeBuilderDay(day, index) {
    return {
      ...createEmptyDay(index + 1),
      ...(day && typeof day === "object" ? day : {}),
      id: buildDayId(),
      title: compactText(day?.title) || `Day ${index + 1}`,
      focus: compactText(day?.focus),
      dayType: compactText(day?.dayType || day?.day_type || "workout").toLowerCase() || "workout",
      estimatedDurationMinutes: day?.estimatedDurationMinutes ?? day?.estimated_duration_minutes ?? "",
      notes: compactText(day?.notes),
      exercisesText: compactText(day?.exercisesText),
      exerciseRows: normalizeExerciseRows(day?.exerciseRows || day?.exercise_rows || day?.exercises, day?.exercisesText),
      sessionType: compactText(day?.sessionType || day?.session_type || "standard") || "standard",
      sessionLabel: compactText(day?.sessionLabel || day?.session_label),
      distanceKm: day?.distanceKm ?? day?.distance_km ?? "",
      heartRateZone: day?.heartRateZone ?? day?.heart_rate_zone ?? "",
      intensityCue: compactText(day?.intensityCue || day?.intensity_cue),
      targetPace: compactText(day?.targetPace || day?.target_pace),
      fuelCue: compactText(day?.fuelCue || day?.fuel_cue),
    };
  }

  function createEmptyTrainingWorkbookState() {
    return {
      athleteType: "",
      summaryCard: [],
      previewPairs: [],
      weeks: [],
      activeWeek: 1,
      dirty: false,
    };
  }

  function hasTrainingWorkbookWeeks() {
    return Array.isArray(state.trainingWorkbook?.weeks) && state.trainingWorkbook.weeks.length > 0;
  }

  function normalizeWorkbookWeek(week, index) {
    const source = week && typeof week === "object" ? week : {};
    const weekNumber = parseInteger(source.weekNumber || source.week_number) || index + 1;
    const sourceDays = Array.isArray(source.days) ? source.days : [];
    return {
      weekNumber,
      title: compactText(source.title) || `Week ${weekNumber}`,
      summary: compactText(source.summary),
      notes: compactText(source.notes),
      days: (sourceDays.length ? sourceDays : [createEmptyDay(1)]).map((day, dayIndex) => normalizeBuilderDay(day, dayIndex)),
    };
  }

  function getActiveTrainingWorkbookWeek() {
    if (!hasTrainingWorkbookWeeks()) {
      return null;
    }
    return (
      state.trainingWorkbook.weeks.find((week) => week.weekNumber === state.trainingWorkbook.activeWeek)
      || state.trainingWorkbook.weeks[0]
      || null
    );
  }

  function persistActiveTrainingWorkbookWeek() {
    if (!hasTrainingWorkbookWeeks()) {
      return;
    }
    const targetIndex = state.trainingWorkbook.weeks.findIndex((week) => week.weekNumber === state.trainingWorkbook.activeWeek);
    if (targetIndex < 0) {
      return;
    }
    state.trainingWorkbook.weeks[targetIndex] = {
      ...state.trainingWorkbook.weeks[targetIndex],
      days: state.builderDays.map((day, dayIndex) => normalizeBuilderDay(day, dayIndex)),
    };
  }

  function renderTrainingWorkbookWeekControls() {
    const weekNodes = [trainingWeekTabsSplitNode, trainingWeekTabsExercisesNode].filter(Boolean);
    const switchNodes = [trainingWeekSwitchNode, trainingExerciseWeekSwitchNode].filter(Boolean);
    const hasWeeks = hasTrainingWorkbookWeeks();

    switchNodes.forEach((node) => {
      node.hidden = !hasWeeks;
    });

    if (!weekNodes.length) {
      if (trainingWeekSummaryNode) {
        trainingWeekSummaryNode.textContent = hasWeeks ? "Workbook weeks ready." : "Week 1 is ready for coach review.";
      }
      return;
    }

    if (!hasWeeks) {
      weekNodes.forEach((node) => {
        node.innerHTML = "";
      });
      if (trainingWeekSummaryNode) {
        trainingWeekSummaryNode.textContent = "Week 1 is ready for coach review.";
      }
      return;
    }

    const activeWeek = getActiveTrainingWorkbookWeek();
    const buttonMarkup = state.trainingWorkbook.weeks
      .map((week) => `
        <button
          class="coach-training-week-tab${week.weekNumber === activeWeek?.weekNumber ? " is-active" : ""}"
          type="button"
          data-training-workbook-week="${escapeHtml(String(week.weekNumber))}"
        >
          ${escapeHtml(week.title || `Week ${week.weekNumber}`)}
        </button>
      `)
      .join("");

    weekNodes.forEach((node) => {
      node.innerHTML = buttonMarkup;
    });

    if (trainingWeekSummaryNode) {
      const summary = activeWeek?.summary || `${activeWeek?.days?.length || 0} training day${activeWeek?.days?.length === 1 ? "" : "s"} generated for this week.`;
      trainingWeekSummaryNode.textContent = summary;
    }
  }

  function setActiveTrainingWorkbookWeek(weekNumber) {
    if (!hasTrainingWorkbookWeeks()) {
      return;
    }

    persistActiveTrainingWorkbookWeek();
    const targetWeek = state.trainingWorkbook.weeks.find((week) => week.weekNumber === Number(weekNumber));
    if (!targetWeek) {
      return;
    }

    state.trainingWorkbook.activeWeek = targetWeek.weekNumber;
    state.builderDays = targetWeek.days.map((day, index) => normalizeBuilderDay(day, index));
    renderBuilderDays();
  }

  function setTemplateFieldValue(name, value, options = {}) {
    const field = templateForm?.elements?.namedItem(name);
    if (!field) {
      return;
    }
    const nextValue = value ?? "";
    if (options.onlyIfBlank && String(field.value || "").trim()) {
      return;
    }
    field.value = nextValue;
  }

  function setEditingAssignmentContext(assignment) {
    const normalizedAssignment = assignment && typeof assignment === "object" ? assignment : null;
    state.editingAssignment = normalizedAssignment;
    if (activeAssignmentField) {
      activeAssignmentField.value = normalizedAssignment?.id || "";
    }
    if (trainingEditNoteNode) {
      trainingEditNoteNode.hidden = !normalizedAssignment;
      if (normalizedAssignment) {
        const title = normalizedAssignment.title || "Live client block";
        trainingEditNoteNode.innerHTML = `
          <strong>${escapeHtml(`Editing ${title}`)}</strong>
          <p>${escapeHtml("Review the workbook inputs, update the weeks, then generate to publish a refreshed live version while preserving prior logged history.")}</p>
        `;
      } else {
        trainingEditNoteNode.innerHTML = `
          <strong>Editing a live client block</strong>
          <p>Review the workbook inputs, update the weeks, then generate to publish a refreshed live version while preserving prior logged history.</p>
        `;
      }
    }
  }

  function populateAssignmentSportProfileFields(profile = {}) {
    const source = profile && typeof profile === "object" ? profile : {};
    const mapping = {
      athleteProfile: source.athleteProfile || source.athleteType || "",
      primaryPhase: source.primaryPhase || "",
      primaryEvent: source.primaryEvent || "",
      experienceLevel: source.experienceLevel || source.trainingAgeLevel || "Intermediate",
      priorityBias: source.priorityBias || "",
      competitionDate: source.competitionDate || source.goalDate || "",
      resistanceDaysPerWeek: source.resistanceDaysPerWeek ?? source.plannedStrengthSessionsPerWeek ?? "",
      conditioningDaysPerWeek: source.conditioningDaysPerWeek ?? source.plannedHardSessionsPerWeek ?? "",
      avgSessionMinutes: source.avgSessionMinutes ?? source.estimatedDurationMinutes ?? "",
      currentFatigue: source.currentFatigue ?? "",
      primarySport: source.primarySport || "",
      goalFocus: source.goalFocus || "",
      goalEvent: source.goalEvent || source.primaryEvent || "",
      goalDate: source.goalDate || source.competitionDate || "",
      sex: source.sex || "",
      ageYears: source.ageYears ?? source.age ?? "",
      bodyMassKg: source.bodyMassKg ?? "",
      trainingAgeLevel: source.trainingAgeLevel || source.experienceLevel || "",
      daysAvailablePerWeek: source.daysAvailablePerWeek ?? "",
      sleepHours: source.sleepHours ?? "",
      injuryRiskFlag: source.injuryRiskFlag || "",
      currentWeeklyHours: source.currentWeeklyHours ?? source.enduranceCurrentWeeklyHours ?? "",
      plannedWeeklyHours: source.plannedWeeklyHours ?? source.endurancePlannedWeeklyHours ?? "",
      currentLongestSessionHours: source.currentLongestSessionHours ?? source.enduranceCurrentLongestSessionHours ?? "",
      plannedHardSessionsPerWeek: source.plannedHardSessionsPerWeek ?? source.endurancePlannedHardSessionsPerWeek ?? "",
      plannedStrengthSessionsPerWeek: source.plannedStrengthSessionsPerWeek ?? source.endurancePlannedStrengthSessionsPerWeek ?? "",
      currentLimiter: source.currentLimiter || source.hyroxWeakestArea || "",
      healthFocus: source.healthFocus || "",
      currentWeeklyRunningKm: source.currentWeeklyRunningKm ?? source.runnerCurrentWeeklyKm ?? source.hyroxCurrentRunKm ?? "",
      longestRunCompletedKm: source.longestRunCompletedKm ?? source.runnerCurrentLongRunKm ?? "",
      recent5kTimeMin: source.recent5kTimeMin ?? source.runnerLatestRaceTimeMin ?? source.hyroxRecent5kTimeMin ?? "",
      weighInType: source.weighInType || "N/A",
      currentSquat1rmKg: source.currentSquat1rmKg ?? "",
      currentBench1rmKg: source.currentBench1rmKg ?? "",
      currentDeadlift1rmKg: source.currentDeadlift1rmKg ?? "",
      injuryNotes: source.injuryNotes || "",
      runnerCurrentWeeklyKm: source.runnerCurrentWeeklyKm ?? source.currentWeeklyRunningKm ?? "",
      runnerCurrentLongRunKm: source.runnerCurrentLongRunKm ?? source.longestRunCompletedKm ?? "",
      runnerLatestRaceDistanceKm: source.runnerLatestRaceDistanceKm ?? "",
      runnerLatestRaceTimeMin: source.runnerLatestRaceTimeMin ?? source.recent5kTimeMin ?? "",
      runnerThresholdPaceMinPerKm: source.runnerThresholdPaceMinPerKm ?? "",
      runnerRestingHrBpm: source.runnerRestingHrBpm ?? "",
      runnerMaxHrBpm: source.runnerMaxHrBpm ?? "",
      runnerPlannedWeeklyKm: source.runnerPlannedWeeklyKm ?? "",
      runnerPlannedLongRunKm: source.runnerPlannedLongRunKm ?? "",
      runnerPlannedChoGPerKg: source.runnerPlannedChoGPerKg ?? "",
      runnerPlannedProteinGPerKg: source.runnerPlannedProteinGPerKg ?? "",
      runnerPlannedLongRunFuelGPerH: source.runnerPlannedLongRunFuelGPerH ?? "",
      runnerPlannedFluidMlPerH: source.runnerPlannedFluidMlPerH ?? "",
      runnerPlannedSodiumMgPerH: source.runnerPlannedSodiumMgPerH ?? "",
      hyroxCurrentRunKm: source.hyroxCurrentRunKm ?? source.currentWeeklyRunningKm ?? "",
      hyroxRecent5kTimeMin: source.hyroxRecent5kTimeMin ?? source.recent5kTimeMin ?? "",
      hyroxPredictedRaceDurationMin: source.hyroxPredictedRaceDurationMin ?? "",
      hyroxVo2maxMlPerKgMin: source.hyroxVo2maxMlPerKgMin ?? "",
      hyroxWeakestArea: source.hyroxWeakestArea || source.currentLimiter || "",
      hyroxWallBallUnbrokenReps: source.hyroxWallBallUnbrokenReps ?? "",
      hyroxSledToleranceScore: source.hyroxSledToleranceScore ?? "",
      hyroxPlannedRunKm: source.hyroxPlannedRunKm ?? "",
      hyroxPlannedHybridSessionsPerWeek: source.hyroxPlannedHybridSessionsPerWeek ?? source.plannedHardSessionsPerWeek ?? "",
      hyroxPlannedStrengthSessionsPerWeek: source.hyroxPlannedStrengthSessionsPerWeek ?? source.plannedStrengthSessionsPerWeek ?? "",
      hyroxPlannedChoGPerKg: source.hyroxPlannedChoGPerKg ?? "",
      hyroxPlannedProteinGPerKg: source.hyroxPlannedProteinGPerKg ?? "",
      hyroxPlannedRaceFuelGPerH: source.hyroxPlannedRaceFuelGPerH ?? "",
      hyroxPlannedFluidMlPerH: source.hyroxPlannedFluidMlPerH ?? "",
      hyroxPlannedSodiumMgPerH: source.hyroxPlannedSodiumMgPerH ?? "",
      enduranceEventDurationHours: source.enduranceEventDurationHours ?? "",
      enduranceCurrentWeeklyHours: source.enduranceCurrentWeeklyHours ?? source.currentWeeklyHours ?? "",
      enduranceCurrentLongestSessionHours: source.enduranceCurrentLongestSessionHours ?? source.currentLongestSessionHours ?? "",
      enduranceRestingHrBpm: source.enduranceRestingHrBpm ?? "",
      enduranceMaxHrBpm: source.enduranceMaxHrBpm ?? "",
      enduranceThresholdHrBpm: source.enduranceThresholdHrBpm ?? "",
      enduranceHotConditionsFlag: source.enduranceHotConditionsFlag || "",
      endurancePlannedWeeklyHours: source.endurancePlannedWeeklyHours ?? source.plannedWeeklyHours ?? "",
      endurancePlannedLongSessionHours: source.endurancePlannedLongSessionHours ?? "",
      endurancePlannedHardSessionsPerWeek: source.endurancePlannedHardSessionsPerWeek ?? source.plannedHardSessionsPerWeek ?? "",
      endurancePlannedStrengthSessionsPerWeek: source.endurancePlannedStrengthSessionsPerWeek ?? source.plannedStrengthSessionsPerWeek ?? "",
      endurancePlannedChoGPerKg: source.endurancePlannedChoGPerKg ?? "",
      endurancePlannedProteinGPerKg: source.endurancePlannedProteinGPerKg ?? "",
      endurancePlannedEventFuelGPerH: source.endurancePlannedEventFuelGPerH ?? "",
      endurancePlannedFluidMlPerH: source.endurancePlannedFluidMlPerH ?? "",
      endurancePlannedSodiumMgPerH: source.endurancePlannedSodiumMgPerH ?? "",
    };

    Object.entries(mapping).forEach(([fieldName, value]) => {
      setTemplateFieldValue(fieldName, value);
    });
  }

  function syncWorkbookTemplateFields(workbook) {
    const template = workbook?.templateDraft?.template;
    if (!template) {
      return;
    }

    setTemplateFieldValue("category", template.category || "general");
    setTemplateFieldValue("difficulty", template.difficulty || "intermediate");
    setTemplateFieldValue("durationWeeks", template.durationWeeks || (Array.isArray(workbook?.weeks) ? workbook.weeks.length : ""));
    setTemplateFieldValue("estimatedDurationMinutes", template.estimatedDurationMinutes || "", { onlyIfBlank: true });
    setTemplateFieldValue("description", template.description || "", { onlyIfBlank: true });
    setTemplateFieldValue("objective", template.objective || "", { onlyIfBlank: true });
    setTemplateFieldValue("audience", template.audience || "", { onlyIfBlank: true });
    setTemplateFieldValue("goals", Array.isArray(template.goals) ? template.goals.join(", ") : "", { onlyIfBlank: true });
    setTemplateFieldValue("tags", Array.isArray(template.tags) ? template.tags.join(", ") : "", { onlyIfBlank: true });
  }

  function buildTrainingWorkbookFromForm() {
    if (!assignForm) {
      return null;
    }

    const athleteEngine = resolveAthleteEngine();
    if (!athleteEngine) {
      return null;
    }

    const formData = new FormData(assignForm);
    const athleteProfile = buildAssignmentSportProfile(formData);
    if (!athleteProfile) {
      return null;
    }

    const clientId = String(formData.get("clientId") || "").trim();
    const startDate = String(formData.get("startDate") || "").trim() || getTodayDateOnly();
    return athleteEngine.buildWorkbookPackage(athleteProfile, {
      athleteName: resolveClientDisplayName(clientId),
      assessmentDate: startDate,
      startDate,
    });
  }

  function resetTrainingWorkbookState(options = {}) {
    state.trainingWorkbook = {
      ...createEmptyTrainingWorkbookState(),
      dirty: Boolean(options.dirty),
    };
    renderTrainingWorkbookWeekControls();
  }

  function hydrateTrainingWorkbookState(workbook, options = {}) {
    if (!workbook?.kind || !Array.isArray(workbook.weeks) || !workbook.weeks.length) {
      resetTrainingWorkbookState({ dirty: false });
      return null;
    }

    const normalizedWeeks = workbook.weeks.map((week, index) => normalizeWorkbookWeek(week, index));
    const preferredWeek = options.preserveWeek ? Number(state.trainingWorkbook.activeWeek || 1) : 1;
    const resolvedActiveWeek = normalizedWeeks.some((week) => week.weekNumber === preferredWeek)
      ? preferredWeek
      : normalizedWeeks[0].weekNumber;

    syncWorkbookTemplateFields(workbook);
    state.trainingWorkbook = {
      athleteType: compactText(workbook.athleteType || workbook.kind),
      summaryCard: Array.isArray(workbook.summaryCard) ? workbook.summaryCard.filter(Boolean) : [],
      previewPairs: Array.isArray(workbook.previewPairs) ? workbook.previewPairs.filter((item) => item?.label && item?.value) : [],
      weeks: normalizedWeeks,
      activeWeek: resolvedActiveWeek,
      dirty: false,
    };

    const activeWeek = getActiveTrainingWorkbookWeek();
    state.builderDays = (activeWeek?.days || [createEmptyDay(1)]).map((day, index) => normalizeBuilderDay(day, index));
    renderBuilderDays();
    return state.trainingWorkbook;
  }

  function ensureTrainingWorkbookState(options = {}) {
    if (!(isTrainingWorkspace() && assignForm === templateForm)) {
      return null;
    }
    if (!options.force && !state.trainingWorkbook.dirty && hasTrainingWorkbookWeeks()) {
      persistActiveTrainingWorkbookWeek();
      renderTrainingWorkbookWeekControls();
      return state.trainingWorkbook;
    }

    const workbook = buildTrainingWorkbookFromForm();
    if (!workbook?.kind) {
      if (options.clearOnMissing) {
        resetTrainingWorkbookState({ dirty: false });
      }
      return null;
    }

    return hydrateTrainingWorkbookState(workbook, { preserveWeek: options.preserveWeek !== false });
  }

  function buildExerciseRowPayloads(day, sortOffset = 0) {
    const rows = Array.isArray(day?.exerciseRows) ? day.exerciseRows : [];
    return rows
      .map((row, index) => {
        const name = compactText(row?.name);
        if (!name) {
          return null;
        }

        const repData = parseRepField(row?.repTarget || "");
        const intensityData = parseIntensityField(row?.intensity || "");
        const startingLoad = parseDecimal(row?.startingLoad);
        const incrementKg = parseDecimal(row?.increment);
        const progressionRule = compactText(row?.progressionRule);
        const clientEntryMode = compactText(row?.clientEntryMode || "log_weight_reps_rpe") || "log_weight_reps_rpe";
        const durationSeconds =
          repData.reps === null && repData.repRangeMin === null && repData.repRangeMax === null
            ? parseRestField(row?.repTarget || "")
            : null;

        return {
          sortOrder: sortOffset + index,
          blockLabel: compactText(row?.blockLabel),
          nameOverride: name,
          sets: parseInteger(row?.sets),
          reps: repData.reps,
          repRangeMin: repData.repRangeMin,
          repRangeMax: repData.repRangeMax,
          prescribedWeightKg: startingLoad,
          durationSeconds,
          intensityMode: intensityData.intensityMode,
          intensityValue: intensityData.intensityValue,
          restTimeSeconds: parseRestField(row?.rest || ""),
          tempo: compactText(row?.tempo),
          progressiveOverloadGoal: progressionRule,
          metadata: {
            exercise_name: name,
            client_entry_mode: clientEntryMode,
            ...(incrementKg !== null ? { increment_kg: incrementKg } : {}),
            ...(progressionRule ? { progression_rule: progressionRule } : {}),
          },
          notes: compactText(row?.notes),
        };
      })
      .filter(Boolean);
  }

  function buildStructuredSessionExercise(day, sortOrder = 0) {
    if (!isStructuredSessionCategory()) {
      return null;
    }

    const sessionLabel = compactText(day.sessionLabel);
    const sessionType = compactText(day.sessionType || "standard");
    const distanceKm = parseDecimal(day.distanceKm);
    const heartRateZone = parseInteger(day.heartRateZone);
    const intensityCue = compactText(day.intensityCue);
    const targetPace = compactText(day.targetPace);
    const fuelCue = compactText(day.fuelCue);
    const durationMinutes = parseInteger(day.estimatedDurationMinutes);
    const intensityData = parseIntensityField(intensityCue);

    const hasStructuredSession = [
      sessionLabel,
      distanceKm,
      heartRateZone,
      intensityCue,
      targetPace,
      fuelCue,
      sessionType !== "standard" ? sessionType : "",
    ].some(Boolean);

    if (!hasStructuredSession) {
      return null;
    }

    const noteParts = [
      targetPace ? `Pace / speed: ${targetPace}` : "",
      intensityCue ? `Intensity cue: ${intensityCue}` : "",
      fuelCue ? `Fuel cue: ${fuelCue}` : "",
    ].filter(Boolean);

    return {
      sortOrder,
      nameOverride: sessionLabel || compactText(day.focus) || compactText(day.title) || "Primary session",
      durationSeconds: durationMinutes ? durationMinutes * 60 : null,
      distanceMeters: distanceKm ? Math.round(distanceKm * 1000) : null,
      heartRateZone,
      intensityMode: intensityData.intensityMode,
      intensityValue: intensityData.intensityValue,
      notes: noteParts.join(" • "),
      metadata: {
        session_type: sessionType,
        session_label: sessionLabel || compactText(day.focus) || compactText(day.title) || "Primary session",
        intensity_cue: intensityCue,
        target_pace: targetPace,
        fuel_cue: fuelCue,
        exercise_name: sessionLabel || compactText(day.focus) || compactText(day.title) || "Primary session",
      },
    };
  }

  function buildStructuredDayNotes(day) {
    const notes = compactText(day.notes);
    if (!isStructuredSessionCategory()) {
      return notes;
    }

    const cueParts = [
      compactText(day.intensityCue) ? `Intensity cue: ${compactText(day.intensityCue)}` : "",
      compactText(day.targetPace) ? `Target pace / speed: ${compactText(day.targetPace)}` : "",
      compactText(day.fuelCue) ? `Fuel cue: ${compactText(day.fuelCue)}` : "",
    ].filter(Boolean);

    return [notes, cueParts.join(" • ")].filter(Boolean).join(notes && cueParts.length ? "\n" : "");
  }

  function buildAssignmentSportProfile(formData) {
    const profile = {
      trainingWorkbookVersion: "v2",
      athleteProfile: compactText(formData.get("athleteProfile")),
      planStartDate: compactText(formData.get("startDate")),
      primaryPhase: compactText(formData.get("primaryPhase")),
      primaryEvent: compactText(formData.get("primaryEvent")),
      experienceLevel: compactText(formData.get("experienceLevel")),
      priorityBias: compactText(formData.get("priorityBias")),
      competitionDate: compactText(formData.get("competitionDate")),
      resistanceDaysPerWeek: parseInteger(formData.get("resistanceDaysPerWeek")),
      conditioningDaysPerWeek: parseInteger(formData.get("conditioningDaysPerWeek")),
      avgSessionMinutes: parseInteger(formData.get("avgSessionMinutes")),
      currentFatigue: parseInteger(formData.get("currentFatigue")),
      currentWeeklyRunningKm: parseDecimal(formData.get("currentWeeklyRunningKm")),
      longestRunCompletedKm: parseDecimal(formData.get("longestRunCompletedKm")),
      recent5kTimeMin: parseDecimal(formData.get("recent5kTimeMin")),
      currentSquat1rmKg: parseDecimal(formData.get("currentSquat1rmKg")),
      currentBench1rmKg: parseDecimal(formData.get("currentBench1rmKg")),
      currentDeadlift1rmKg: parseDecimal(formData.get("currentDeadlift1rmKg")),
      weighInType: compactText(formData.get("weighInType")),
      injuryNotes: compactText(formData.get("injuryNotes")),
      primarySport: compactText(formData.get("primarySport")),
      goalFocus: compactText(formData.get("goalFocus")),
      goalEvent: compactText(formData.get("goalEvent")),
      goalDate: compactText(formData.get("goalDate")),
      sex: compactText(formData.get("sex")),
      ageYears: parseInteger(formData.get("ageYears")),
      bodyMassKg: parseDecimal(formData.get("bodyMassKg")),
      trainingAgeLevel: compactText(formData.get("trainingAgeLevel")),
      daysAvailablePerWeek: parseInteger(formData.get("daysAvailablePerWeek")),
      sleepHours: parseDecimal(formData.get("sleepHours")),
      injuryRiskFlag: compactText(formData.get("injuryRiskFlag")),
      currentWeeklyHours: parseDecimal(formData.get("currentWeeklyHours")),
      plannedWeeklyHours: parseDecimal(formData.get("plannedWeeklyHours")),
      currentLongestSessionHours: parseDecimal(formData.get("currentLongestSessionHours")),
      plannedHardSessionsPerWeek: parseInteger(formData.get("plannedHardSessionsPerWeek")),
      plannedStrengthSessionsPerWeek: parseInteger(formData.get("plannedStrengthSessionsPerWeek")),
      currentLimiter: compactText(formData.get("currentLimiter")),
      healthFocus: compactText(formData.get("healthFocus")),
      runnerCurrentWeeklyKm: parseDecimal(formData.get("runnerCurrentWeeklyKm")),
      runnerCurrentLongRunKm: parseDecimal(formData.get("runnerCurrentLongRunKm")),
      runnerLatestRaceDistanceKm: parseDecimal(formData.get("runnerLatestRaceDistanceKm")),
      runnerLatestRaceTimeMin: parseDecimal(formData.get("runnerLatestRaceTimeMin")),
      runnerThresholdPaceMinPerKm: parseDecimal(formData.get("runnerThresholdPaceMinPerKm")),
      runnerRestingHrBpm: parseInteger(formData.get("runnerRestingHrBpm")),
      runnerMaxHrBpm: parseInteger(formData.get("runnerMaxHrBpm")),
      runnerPlannedWeeklyKm: parseDecimal(formData.get("runnerPlannedWeeklyKm")),
      runnerPlannedLongRunKm: parseDecimal(formData.get("runnerPlannedLongRunKm")),
      runnerPlannedChoGPerKg: parseDecimal(formData.get("runnerPlannedChoGPerKg")),
      runnerPlannedProteinGPerKg: parseDecimal(formData.get("runnerPlannedProteinGPerKg")),
      runnerPlannedLongRunFuelGPerH: parseDecimal(formData.get("runnerPlannedLongRunFuelGPerH")),
      runnerPlannedFluidMlPerH: parseDecimal(formData.get("runnerPlannedFluidMlPerH")),
      runnerPlannedSodiumMgPerH: parseDecimal(formData.get("runnerPlannedSodiumMgPerH")),
      hyroxCurrentRunKm: parseDecimal(formData.get("hyroxCurrentRunKm")),
      hyroxRecent5kTimeMin: parseDecimal(formData.get("hyroxRecent5kTimeMin")),
      hyroxPredictedRaceDurationMin: parseDecimal(formData.get("hyroxPredictedRaceDurationMin")),
      hyroxVo2maxMlPerKgMin: parseDecimal(formData.get("hyroxVo2maxMlPerKgMin")),
      hyroxWeakestArea: compactText(formData.get("hyroxWeakestArea")),
      hyroxWallBallUnbrokenReps: parseInteger(formData.get("hyroxWallBallUnbrokenReps")),
      hyroxSledToleranceScore: parseInteger(formData.get("hyroxSledToleranceScore")),
      hyroxPlannedRunKm: parseDecimal(formData.get("hyroxPlannedRunKm")),
      hyroxPlannedChoGPerKg: parseDecimal(formData.get("hyroxPlannedChoGPerKg")),
      hyroxPlannedProteinGPerKg: parseDecimal(formData.get("hyroxPlannedProteinGPerKg")),
      hyroxPlannedRaceFuelGPerH: parseDecimal(formData.get("hyroxPlannedRaceFuelGPerH")),
      hyroxPlannedFluidMlPerH: parseDecimal(formData.get("hyroxPlannedFluidMlPerH")),
      hyroxPlannedSodiumMgPerH: parseDecimal(formData.get("hyroxPlannedSodiumMgPerH")),
      enduranceEventDurationHours: parseDecimal(formData.get("enduranceEventDurationHours")),
      enduranceRestingHrBpm: parseInteger(formData.get("enduranceRestingHrBpm")),
      enduranceMaxHrBpm: parseInteger(formData.get("enduranceMaxHrBpm")),
      enduranceThresholdHrBpm: parseInteger(formData.get("enduranceThresholdHrBpm")),
      enduranceHotConditionsFlag: compactText(formData.get("enduranceHotConditionsFlag")),
      endurancePlannedChoGPerKg: parseDecimal(formData.get("endurancePlannedChoGPerKg")),
      endurancePlannedProteinGPerKg: parseDecimal(formData.get("endurancePlannedProteinGPerKg")),
      endurancePlannedEventFuelGPerH: parseDecimal(formData.get("endurancePlannedEventFuelGPerH")),
      endurancePlannedFluidMlPerH: parseDecimal(formData.get("endurancePlannedFluidMlPerH")),
      endurancePlannedSodiumMgPerH: parseDecimal(formData.get("endurancePlannedSodiumMgPerH")),
    };

    const hasAnyValue = Object.values(profile).some((value) => {
      if (value === null || value === undefined) {
        return false;
      }
      if (typeof value === "string") {
        return Boolean(value.trim());
      }
      return true;
    });

    return hasAnyValue ? profile : null;
  }

  function getWorkbookOutput(workbook, key) {
    return workbook && workbook.outputs && typeof workbook.outputs === "object"
      ? workbook.outputs[key]
      : null;
  }

  function buildAssignmentWorkbookPairs(workbook) {
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

  function renderAssignmentWorkbookPreview() {
    if (!assignForm || !assignmentWorkbookPreviewNode || !assignmentWorkbookPreviewGridNode || !assignmentWorkbookPreviewSummaryNode) {
      return;
    }

    const athleteEngine = resolveAthleteEngine();
    if (!athleteEngine) {
      assignmentWorkbookPreviewNode.hidden = true;
      return;
    }

    const formData = new FormData(assignForm);
    const athleteProfile = buildAssignmentSportProfile(formData);
    if (!athleteProfile) {
      assignmentWorkbookPreviewNode.hidden = true;
      assignmentWorkbookPreviewGridNode.innerHTML = "";
      assignmentWorkbookPreviewSummaryNode.innerHTML = "";
      if (assignmentWorkbookPreviewNoteNode) {
        assignmentWorkbookPreviewNoteNode.textContent = "Add the athlete inputs above to generate phase, safe ramp, long-session targets, and client-facing summary guidance.";
      }
      return;
    }

    const clientId = String(formData.get("clientId") || "").trim();
    const startDate = String(formData.get("startDate") || "").trim() || getTodayDateOnly();
    const workbook = athleteEngine.buildWorkbookPackage(athleteProfile, {
      athleteName: resolveClientDisplayName(clientId),
      assessmentDate: startDate,
      startDate,
    });
    syncWorkbookTemplateFields(workbook);

    const pairs = buildAssignmentWorkbookPairs(workbook);
    const summaryLines = Array.isArray(workbook?.summaryCard) ? workbook.summaryCard.filter(Boolean) : [];

    if (!workbook?.kind || (!pairs.length && !summaryLines.length)) {
      assignmentWorkbookPreviewNode.hidden = true;
      assignmentWorkbookPreviewGridNode.innerHTML = "";
      assignmentWorkbookPreviewSummaryNode.innerHTML = "";
      return;
    }

    assignmentWorkbookPreviewNode.hidden = false;
    assignmentWorkbookPreviewGridNode.innerHTML = pairs
      .map(
        (item) => `
          <div>
            <dt>${escapeHtml(item.label)}</dt>
            <dd>${escapeHtml(item.value)}</dd>
          </div>
        `
      )
      .join("");
    assignmentWorkbookPreviewSummaryNode.innerHTML = summaryLines.map((line) => `<p>${escapeHtml(line)}</p>`).join("");

    if (assignmentWorkbookPreviewNoteNode) {
      const descriptor = `${toTitleCase(compactText(workbook.athleteType || workbook.kind || "Workbook").replace(/_/gu, " "))} block preview`;
      assignmentWorkbookPreviewNoteNode.textContent = `${descriptor}. This is what the client-side summary will inherit once the assignment is saved.`;
    }
  }

  function resolveClientDisplayName(clientId) {
    const derived = deriveWorkspace();
    const client = derived.roster.find((item) => item.id === clientId);
    if (client) {
      return client.preferredName || client.displayName || client.email || "Athlete";
    }

    const selectedLabel = assignClientNode?.selectedOptions?.[0]?.textContent || "";
    return compactText(selectedLabel) || "Athlete";
  }

  function buildTemplateWeekPayloadFromDays(days, weekIndex, weekMeta = {}) {
    const normalizedDays = Array.isArray(days) ? days : [];
    const weekDays = normalizedDays.map((day, index) => {
      const structuredSession = day.dayType === "rest" ? null : buildStructuredSessionExercise(day, 0);
      const exerciseRows = day.dayType === "rest"
        ? []
        : buildExerciseRowPayloads(day, structuredSession ? 1 : 0);

      return {
        dayNumber: index + 1,
        title: String(day.title || "").trim() || `Day ${index + 1}`,
        focus: String(day.focus || "").trim(),
        dayType: String(day.dayType || "workout").trim().toLowerCase() || "workout",
        estimatedDurationMinutes: parseInteger(day.estimatedDurationMinutes),
        notes: buildStructuredDayNotes(day),
        exercises: [structuredSession, ...exerciseRows].filter(Boolean),
      };
    });

    return {
      weekNumber: parseInteger(weekMeta.weekNumber || weekMeta.week_number) || weekIndex + 1,
      title: compactText(weekMeta.title) || `Week ${weekIndex + 1}`,
      summary: compactText(weekMeta.summary) || (weekIndex === 0 ? "Primary working structure" : "Generated progression block"),
      days: weekDays,
    };
  }

  function buildTemplatePayload() {
    const formData = new FormData(templateForm);
    const title = String(formData.get("title") || "").trim();
    if (!title) {
      throw new Error("Template title is required.");
    }

    const requestedDurationWeeks = Math.max(1, parseInteger(formData.get("durationWeeks")) || 1);
    const workbookDriven = hasTrainingWorkbookWeeks();
    if (workbookDriven) {
      persistActiveTrainingWorkbookWeek();
    }
    const templateWeeks = workbookDriven
      ? state.trainingWorkbook.weeks.map((week, weekIndex) => buildTemplateWeekPayloadFromDays(week.days, weekIndex, week))
      : [buildTemplateWeekPayloadFromDays(state.builderDays, 0, { weekNumber: 1, title: "Week 1", summary: "Primary working structure" })];
    const durationWeeks = workbookDriven ? templateWeeks.length : requestedDurationWeeks;

    if (!templateWeeks.some((week) => Array.isArray(week.days) && week.days.some((day) => day.exercises.length || day.dayType === "rest"))) {
      throw new Error("Add at least one exercise card or mark a day as rest before saving the template.");
    }

    return {
      template: {
        id: String(formData.get("id") || "").trim(),
        title,
        description: String(formData.get("description") || "").trim(),
        objective: String(formData.get("objective") || "").trim(),
        audience: String(formData.get("audience") || "").trim(),
        category: String(formData.get("category") || "strength").trim().toLowerCase(),
        difficulty: String(formData.get("difficulty") || "intermediate").trim().toLowerCase(),
        durationWeeks,
        estimatedDurationMinutes: parseInteger(formData.get("estimatedDurationMinutes")),
        goals: parseTagList(formData.get("goals")),
        targetMuscleGroups: parseTagList(formData.get("targetMuscleGroups")),
        equipmentRequired: parseTagList(formData.get("equipmentRequired")),
        warmupInstructions: String(formData.get("warmupInstructions") || "").trim(),
        cooldownInstructions: String(formData.get("cooldownInstructions") || "").trim(),
        tags: parseTagList(formData.get("tags")),
        notes: String(formData.get("notes") || "").trim(),
        status: "draft",
      },
      weeks: workbookDriven
        ? templateWeeks
        : Array.from({ length: durationWeeks }, (_, weekIndex) => ({
            weekNumber: weekIndex + 1,
            title: `Week ${weekIndex + 1}`,
            summary: weekIndex === 0 ? "Primary working structure" : "Repeated weekly structure",
            days: templateWeeks[0].days,
          })),
    };
  }

  function resetTemplateBuilder() {
    templateForm.reset();
    if (templateIdField) {
      templateIdField.value = "";
    }
    setEditingAssignmentContext(null);
    resetTrainingWorkbookState({ dirty: true });
    state.builderDays = [createEmptyDay(1)];
    setTemplateEditorState(null);
    renderBuilderDays();
    syncTemplateBuilderMode();
  }

  function buildMealPlanPayload() {
    return {
      version: 2,
      source: "nutrition_workbook_ui",
      weekStart: "monday",
      days: state.mealPlanDays.map((day) => ({
        dayKey: day.dayKey,
        label: day.label,
        dayType: compactText(day.dayType || "rest") || "rest",
        note: compactText(day.note),
        targets:
          day.targets && typeof day.targets === "object" && !Array.isArray(day.targets)
            ? {
                calories: parseInteger(day.targets.calories),
                protein: parseInteger(day.targets.protein),
                carbs: parseInteger(day.targets.carbs),
                fat: parseInteger(day.targets.fat),
                hydrationLiters: day.targets.hydrationLiters === "" ? null : Number(day.targets.hydrationLiters),
                fiberGrams: parseInteger(day.targets.fiberGrams),
              }
            : {},
        slots: day.slots
          .map((slot, index) => ({
            sortOrder: index,
            mealType: compactText(slot.mealType || "other") || "other",
            recipeId: compactText(slot.recipeId),
            title: compactText(slot.title),
            note: compactText(slot.note),
          }))
          .filter((slot) => slot.mealType || slot.recipeId || slot.title || slot.note),
      })),
      generatedAt: new Date().toISOString(),
    };
  }

  function buildNutritionDraft(options = {}) {
    const formData = new FormData(nutritionForm);
    const clientId = String(options.clientId || formData.get("clientId") || "").trim();
    const title = String(formData.get("title") || "").trim();

    if (!title) {
      throw new Error("Give the nutrition plan a title before saving or batching it.");
    }
    if (options.requireClientId !== false && !clientId) {
      throw new Error("Choose a client and give the nutrition plan a title.");
    }

    return {
      plan: {
        clientId,
        assignmentId: String(formData.get("assignmentId") || "").trim(),
        title,
        strategy: String(formData.get("strategy") || "hybrid").trim(),
        caloriesTarget: parseInteger(formData.get("caloriesTarget")),
        proteinTargetG: parseInteger(formData.get("proteinTargetG")),
        carbsTargetG: parseInteger(formData.get("carbsTargetG")),
        fatTargetG: parseInteger(formData.get("fatTargetG")),
        trainingDayTargets: state.nutritionWizard.workbookSnapshot?.macroPlan?.trainingDayTargets || {},
        restDayTargets: state.nutritionWizard.workbookSnapshot?.macroPlan?.restDayTargets || {},
        startDate: String(formData.get("startDate") || "").trim() || getTodayDateOnly(),
        endDate: String(formData.get("endDate") || "").trim(),
        notes: String(formData.get("notes") || "").trim(),
        mealPlan: buildMealPlanPayload(),
        status: "active",
      },
      habits: state.nutritionHabits.map((habit, index) => ({
        sortOrder: index,
        title: String(habit.title || "").trim() || `Habit ${index + 1}`,
        description: String(habit.description || "").trim(),
        targetType: String(habit.targetType || "boolean").trim(),
        targetValue: habit.targetValue === "" ? null : Number(habit.targetValue),
        targetUnit: String(habit.targetUnit || "").trim(),
        cadence: String(habit.cadence || "daily").trim(),
        isRequired: Boolean(habit.isRequired),
        isActive: true,
      })),
    };
  }

  function buildNutritionPayload() {
    return buildNutritionDraft({ requireClientId: true });
  }

  function resetNutritionBuilder() {
    nutritionForm?.reset();
    if (nutritionStartDateNode) {
      nutritionStartDateNode.value = getTodayDateOnly();
    }
    state.nutritionWizard.manualTargetFields.clear();
    state.nutritionWizard.habitsDirty = false;
    state.nutritionWizard.mealPlanDirty = false;
    state.nutritionWizard.workbookSnapshot = null;
    state.nutritionWizard.activeMealDayId = "";
    state.nutritionHabits = [createEmptyHabit(1)];
    state.mealPlanDays = createDefaultMealPlanDays();
    ensureNutritionWorkbookState({
      forceTargets: true,
      forceHabits: true,
      forceMealPlan: true,
    });
    renderNutritionWizardPreview();
  }

  function buildRecipePayload() {
    if (!recipeForm) {
      throw new Error("Recipe form is not available.");
    }

    const formData = new FormData(recipeForm);
    const title = String(formData.get("title") || "").trim();
    if (!title) {
      throw new Error("Recipe title is required.");
    }

    if (!state.recipeIngredients.length) {
      throw new Error("Add at least one recipe ingredient before saving.");
    }

    return {
      recipe: {
        title,
        description: String(formData.get("description") || "").trim(),
        yieldServings: parseInteger(formData.get("yieldServings")) || 1,
        defaultServingLabel: String(formData.get("defaultServingLabel") || "").trim(),
        countryCode: String(formData.get("countryCode") || "MY").trim(),
        searchTags: String(formData.get("searchTags") || "")
          .split(",")
          .map((entry) => entry.trim())
          .filter(Boolean),
      },
      ingredients: state.recipeIngredients.map((ingredient) => ({
        foodId: ingredient.foodId,
        servingId: ingredient.servingId || null,
        quantity: Number(ingredient.quantity || 1),
        grams: Number(ingredient.grams || 0),
        itemName: ingredient.name,
        note: ingredient.note || "",
      })),
    };
  }

  function resetRecipeBuilder() {
    recipeForm?.reset();
    state.recipeIngredients = [];
    renderRecipeIngredientBuilder();
  }

  function buildCheckinTemplatePayload() {
    const formData = new FormData(checkinTemplateForm);
    const cadence = String(formData.get("cadence") || "weekly").trim();
    const title = String(formData.get("title") || "").trim();
    if (!title) {
      throw new Error("Health template title is required.");
    }

    return {
      template: {
        title,
        cadence,
        formType: String(formData.get("formType") || "weekly_checkin").trim(),
        description: String(formData.get("description") || "").trim(),
        isActive: String(formData.get("isActive") || "true") === "true",
      },
      questions: state.checkinQuestions.map((question, index) => ({
        sortOrder: index,
        fieldKey: slugifyFieldKey(question.fieldKey || question.label || `field_${index + 1}`),
        label: String(question.label || "").trim() || `Question ${index + 1}`,
        questionType: String(question.questionType || "text").trim(),
        isRequired: Boolean(question.isRequired),
        helpText: String(question.helpText || "").trim(),
        options: String(question.optionsText || "")
          .split(",")
          .map((option) => option.trim())
          .filter(Boolean),
      })),
    };
  }

  function resetCheckinTemplateBuilder(cadence = "weekly") {
    checkinTemplateForm?.reset();
    if (checkinCadenceNode) {
      checkinCadenceNode.value = cadence;
    }
    if (checkinFormTypeNode) {
      checkinFormTypeNode.value = cadence === "daily" ? "daily_adherence" : "weekly_checkin";
    }
    state.checkinQuestions = createDefaultQuestionSet(cadence);
    renderQuestionBuilder();
  }

  function setActivePanel(panelKey) {
    const resolvedPanelKey = resolvePanelKey(panelKey);
    state.activePanel = resolvedPanelKey;
    tabNodes.forEach((tabNode) => {
      const isActive = tabNode.dataset.coachProgrammingTab === resolvedPanelKey;
      tabNode.classList.toggle("is-active", isActive);
      tabNode.setAttribute("aria-pressed", String(isActive));
    });
    panelNodes.forEach((panelNode) => {
      const isActive = panelNode.dataset.coachProgrammingPanel === resolvedPanelKey;
      panelNode.classList.toggle("is-active", isActive);
      panelNode.hidden = !isActive;
    });

    if (!tabNodes.length && !panelNodes.length) {
      const anchorNode = panelAnchorNodes.find((node) => node.dataset.coachProgrammingAnchor === resolvedPanelKey);
      if (anchorNode) {
        anchorNode.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }

    if (resolvedPanelKey === "delivery") {
      const derived = deriveWorkspace();
      const hasRoster = hasAssignedRoster(derived);
      const defaultSubpanel = hasRoster ? "plans" : "library";
      setActiveDeliverySubpanel(hasRoster ? (state.deliverySubpanel || defaultSubpanel) : "library");
    }
  }

  function setActiveDeliverySubpanel(subpanelKey) {
    state.deliverySubpanel = subpanelKey;
    deliverySubtabNodes.forEach((tabNode) => {
      const isActive = tabNode.dataset.coachProgrammingSubtab === subpanelKey;
      tabNode.classList.toggle("is-active", isActive);
      tabNode.setAttribute("aria-pressed", String(isActive));
    });
    deliverySubpanelNodes.forEach((panelNode) => {
      const isActive = panelNode.dataset.coachProgrammingSubpanel === subpanelKey;
      panelNode.hidden = !isActive;
    });
  }

  function selectClient(clientId) {
    if (assignClientNode) {
      assignClientNode.value = clientId || "";
    }
    if (nutritionClientNode) {
      nutritionClientNode.value = clientId || "";
    }
    if (scheduleCheckinClientNode) {
      scheduleCheckinClientNode.value = clientId || "";
    }
    const derived = deriveWorkspace();
    renderClientFocus(derived);
    renderNutritionAssignmentOptions(derived);
  }

  function selectTemplate(templateId) {
    if (assignTemplateNode) {
      assignTemplateNode.value = templateId || "";
    }
  }

  async function loadTemplateIntoBuilder(templateId, options = {}) {
    const normalizedTemplateId = compactText(templateId);
    if (!normalizedTemplateId) {
      throw new Error("Choose a template before opening it in the builder.");
    }

    setInlineFeedback(templateFeedbackNode, "Loading template into the session builder...", false);
    const params = new URLSearchParams();
    params.set("templateId", normalizedTemplateId);
    const response = await plannerRequest(`/.netlify/functions/load-program-template?${params.toString()}`);
    const draft = response?.draft || buildTemplateDraftFromGraph(response?.graph || null);
    if (!draft?.template) {
      throw new Error("That template could not be loaded into the builder.");
    }

    resetTemplateBuilder();
    hydrateTemplateBuilderFromSavedTemplate(draft);
    selectTemplate(normalizedTemplateId);
    if (options.clientId) {
      selectClient(options.clientId);
    }
    setInlineFeedback(
      templateFeedbackNode,
      response?.message || "Template loaded into the builder. Adjust it and save when you are ready.",
      false
    );
    setStatus(`Builder ready: ${draft.template.title || "Training template"} loaded for editing.`, false);
  }

  async function openAssignedProgramInBuilder(assignmentId) {
    const normalizedAssignmentId = compactText(assignmentId);
    if (!normalizedAssignmentId) {
      throw new Error("Choose a live client block before opening it.");
    }

    setInlineFeedback(templateFeedbackNode, "Loading the live client block into the builder...", false);
    const params = new URLSearchParams();
    params.set("assignmentId", normalizedAssignmentId);
    const response = await plannerRequest(`/.netlify/functions/load-client-program-assignment?${params.toString()}`);
    const draft = buildTemplateDraftFromAssignmentPayload(response);
    if (!draft?.assignment?.id) {
      throw new Error("That live client block could not be loaded into the builder.");
    }

    resetTemplateBuilder();
    hydrateTemplateBuilderDraft(draft, { includeTemplateId: false });
    setEditingAssignmentContext(draft.assignment);
    setTemplateFieldValue("clientId", draft.assignment.client_id || "");
    setTemplateFieldValue("startDate", draft.assignment.start_date || getTodayDateOnly());
    setTemplateFieldValue("assignmentTitle", draft.assignment.title || "");
    setTemplateFieldValue("assignmentObjective", draft.assignment.objective || "");
    setTemplateFieldValue("assignmentNotes", draft.assignment.notes || "");
    populateAssignmentSportProfileFields(draft.sportProfile || {});
    toggleAthleteCalculatorGroups();
    renderAssignmentWorkbookPreview();
    selectClient(draft.assignment.client_id || "");
    setActiveTrainingWizardStep("inputs");
    setActivePanel("templates");
    setInlineFeedback(
      templateFeedbackNode,
      response?.message || "Live client block loaded. Update the workbook inputs or weekly split, then generate to publish the refreshed version.",
      false
    );
    setStatus(`Builder ready: ${draft.assignment.title || "Live client block"} loaded for editing.`, false);
  }

  function getSelectedOperationsClientIds() {
    return Array.from(
      operationsNudgeListNode?.querySelectorAll('input[type="checkbox"][data-ops-client-id]:checked') || []
    )
      .map((input) => String(input.value || "").trim())
      .filter(Boolean);
  }

  function queueOperationsClient(clientId, category) {
    if (!operationsNudgeListNode) {
      return;
    }
    const input = Array.from(
      operationsNudgeListNode.querySelectorAll('input[type="checkbox"][data-ops-client-id]')
    ).find((node) => node.value === String(clientId || ""));
    if (!input) {
      return;
    }
    input.checked = true;
    if (operationsNudgeCategoryNode && category) {
      operationsNudgeCategoryNode.value = category;
    }
    setActivePanel("operations");
  }

  async function handleOperationsNudgeSubmit(event) {
    event.preventDefault();
    setInlineFeedback(operationsNudgeFeedbackNode, "Sending coach nudges...", false);

    try {
      const clientIds = getSelectedOperationsClientIds();
      if (!clientIds.length) {
        throw new Error("Select at least one client before sending a roster nudge.");
      }

      const category = String(operationsNudgeCategoryNode?.value || "nutrition").trim();
      const message = String(operationsNudgeMessageNode?.value || "").trim();

      const response = await plannerRequest("/.netlify/functions/bulk-nudge-planner-clients", {
        method: "POST",
        body: {
          clientIds,
          category,
          message,
        },
      });

      setInlineFeedback(
        operationsNudgeFeedbackNode,
        response?.message || "Roster nudge sent.",
        false
      );
      operationsNudgeListNode?.querySelectorAll('input[type="checkbox"][data-ops-client-id]').forEach((input) => {
        input.checked = false;
      });
      if (operationsNudgeMessageNode) {
        operationsNudgeMessageNode.value = "";
      }
      await fetchPlannerData(true);
      setActivePanel("operations");
    } catch (error) {
      setInlineFeedback(
        operationsNudgeFeedbackNode,
        error?.message || "Unable to send the roster nudge right now.",
        true
      );
    }
  }

  async function handleSegmentSubmit(event) {
    event.preventDefault();
    setInlineFeedback(segmentFeedbackNode, "Saving smart segment...", false);

    try {
      const draft = buildSegmentDraftFromForm();
      if (!draft.name) {
        throw new Error("Give this smart segment a clear name before saving it.");
      }

      const nextSegments = [...state.coachOps.segments, draft].slice(-10);
      await saveCoachOpsPreferences(
        {
          coachOpsSegments: nextSegments,
          coachAutomationRules: state.coachOps.automationRules,
          coachWeeklyBriefingEnabled: state.coachOps.weeklyBriefingEnabled,
        },
        "Smart segment saved."
      );
      segmentForm?.reset();
      if (segmentRiskNode) segmentRiskNode.value = "0";
      if (segmentReviewsNode) segmentReviewsNode.value = "0";
      setInlineFeedback(segmentFeedbackNode, "Smart segment saved.", false);
    } catch (error) {
      setInlineFeedback(segmentFeedbackNode, error?.message || "Unable to save the smart segment right now.", true);
    }
  }

  async function handleAutomationSubmit(event) {
    event.preventDefault();
    setInlineFeedback(automationFeedbackNode, "Saving automation rule...", false);

    try {
      const draft = buildAutomationRuleDraftFromForm();
      if (!draft.name) {
        throw new Error("Name the automation rule before saving it.");
      }
      if (!draft.segmentId) {
        throw new Error("Choose a saved segment for this automation rule.");
      }

      const nextRules = [...state.coachOps.automationRules, draft].slice(-12);
      await saveCoachOpsPreferences(
        {
          coachOpsSegments: state.coachOps.segments,
          coachAutomationRules: nextRules,
          coachWeeklyBriefingEnabled: Boolean(weeklyBriefingEnabledNode?.checked),
        },
        "Automation rule saved."
      );
      automationForm?.reset();
      if (automationCooldownNode) automationCooldownNode.value = "24";
      if (automationEnabledNode) automationEnabledNode.checked = true;
      if (weeklyBriefingEnabledNode) {
        weeklyBriefingEnabledNode.checked = state.coachOps.weeklyBriefingEnabled;
      }
      renderAutomationSegmentOptions();
      setInlineFeedback(automationFeedbackNode, "Automation rule saved.", false);
    } catch (error) {
      setInlineFeedback(automationFeedbackNode, error?.message || "Unable to save the automation rule right now.", true);
    }
  }

  async function handleTemplateSubmit(event) {
    event.preventDefault();
    const isUpdatingTemplate = Boolean(compactText(templateIdField?.value));
    setInlineFeedback(templateFeedbackNode, isUpdatingTemplate ? "Updating training template..." : "Saving training template...", false);

    try {
      ensureTrainingWorkbookState({
        preserveWeek: true,
        clearOnMissing: false,
      });
      const payload = buildTemplatePayload();
      const response = await plannerRequest("/.netlify/functions/save-program-template", {
        method: "POST",
        body: payload,
      });
      setInlineFeedback(
        templateFeedbackNode,
        response?.message || (payload.template.id ? "Training template updated." : "Training template saved."),
        false
      );
      resetTemplateBuilder();
      await fetchPlannerData(true);
      setActivePanel("templates");
    } catch (error) {
      setInlineFeedback(
        templateFeedbackNode,
        error?.message || "Unable to save the training template right now.",
        true
      );
    }
  }

  async function handleAssignmentSubmit(event) {
    event.preventDefault();
    setInlineFeedback(assignFeedbackNode, "Assigning program...", false);

    try {
      const formData = new FormData(assignForm);
      const clientId = String(formData.get("clientId") || "").trim();
      const templateId = String(formData.get("templateId") || "").trim();
      const athleteProfile = buildAssignmentSportProfile(formData);
      const startDate = String(formData.get("startDate") || "").trim() || getTodayDateOnly();
      const athleteEngine = resolveAthleteEngine();
      const workbook = athleteProfile && athleteEngine
        ? athleteEngine.buildWorkbookPackage(athleteProfile, {
            athleteName: resolveClientDisplayName(clientId),
            assessmentDate: startDate,
            startDate,
          })
        : null;
      if (!clientId || !templateId) {
        throw new Error("Choose both a client and a template before assigning.");
      }

      const response = await plannerRequest("/.netlify/functions/assign-client-program", {
        method: "POST",
        body: {
          clientId,
          templateId,
          startDate,
          title: String(formData.get("title") || "").trim(),
          objective: String(formData.get("objective") || "").trim(),
          notes: String(formData.get("notes") || "").trim(),
          customTargets: athleteProfile
            ? {
                sportProfile: athleteProfile,
                workbook,
              }
            : {},
        },
      });
      setInlineFeedback(
        assignFeedbackNode,
        response?.message || "Program assigned successfully.",
        false
      );
      assignForm.reset();
      if (assignStartDateNode) {
        assignStartDateNode.value = getTodayDateOnly();
      }
      toggleAthleteCalculatorGroups();
      renderAssignmentWorkbookPreview();
      await fetchPlannerData(true);
      renderClientFocus(deriveWorkspace());
      setActivePanel("assignments");
    } catch (error) {
      setInlineFeedback(
        assignFeedbackNode,
        error?.message || "Unable to assign the program right now.",
        true
      );
    }
  }

  async function handleTrainingGenerateProgram() {
    if (!templateForm) {
      return;
    }

    setInlineFeedback(trainingGenerateFeedbackNode, "Generating the client program...", false);

    try {
      ensureTrainingWorkbookState({
        force: true,
        preserveWeek: true,
        clearOnMissing: false,
      });
      const formData = new FormData(templateForm);
      const clientId = String(formData.get("clientId") || "").trim();
      const startDate = String(formData.get("startDate") || "").trim() || getTodayDateOnly();
      const assignmentTitle = String(formData.get("assignmentTitle") || "").trim();
      const assignmentObjective = String(formData.get("assignmentObjective") || "").trim();
      const assignmentNotes = String(formData.get("assignmentNotes") || "").trim();
      const replaceAssignmentId = String(formData.get("activeAssignmentId") || "").trim();
      const athleteProfile = buildAssignmentSportProfile(formData);
      const athleteEngine = resolveAthleteEngine();
      const workbook = athleteProfile && athleteEngine
        ? athleteEngine.buildWorkbookPackage(athleteProfile, {
            athleteName: resolveClientDisplayName(clientId),
            assessmentDate: startDate,
            startDate,
          })
        : null;

      if (!clientId) {
        throw new Error("Choose the client before generating the program.");
      }

      const templatePayload = buildTemplatePayload();
      const templateResponse = await plannerRequest("/.netlify/functions/save-program-template", {
        method: "POST",
        body: templatePayload,
      });

      const savedTemplateId = String(templateResponse?.template?.id || "").trim();
      if (!savedTemplateId) {
        throw new Error("The training template was saved without a usable template ID.");
      }

      const assignmentResponse = await plannerRequest("/.netlify/functions/assign-client-program", {
        method: "POST",
        body: {
          clientId,
          templateId: savedTemplateId,
          startDate,
          title: assignmentTitle,
          objective: assignmentObjective,
          notes: assignmentNotes,
          replaceAssignmentId,
          customTargets: athleteProfile
            ? {
                sportProfile: athleteProfile,
                workbook,
              }
            : {},
        },
      });

      if (assignmentResponse?.assignment?.id && replaceAssignmentId) {
        setEditingAssignmentContext(assignmentResponse.assignment);
      } else {
        setEditingAssignmentContext(null);
      }

      setInlineFeedback(
        trainingGenerateFeedbackNode,
        replaceAssignmentId
          ? "Live block refreshed, saved, and reassigned without wiping the previous logged history."
          : "Program generated, saved, and assigned to the selected client.",
        false
      );
      setStatus("Training block generated and assigned successfully.", false);
      await fetchPlannerData(true);
      renderAssignmentWorkbookPreview();
      renderClientFocus(deriveWorkspace());
    } catch (error) {
      setInlineFeedback(
        trainingGenerateFeedbackNode,
        error?.message || "Unable to generate the training program right now.",
        true
      );
    }
  }

  async function handleBulkAssignmentSubmit(event) {
    event.preventDefault();
    setInlineFeedback(bulkAssignFeedbackNode, "Assigning template across selected clients...", false);

    try {
      const derived = deriveWorkspace();
      const safeCandidates = new Set(derived.bulkCandidates.map((client) => client.id));
      const formData = new FormData(bulkAssignForm);
      const templateId = String(formData.get("templateId") || "").trim();
      const startDate = String(formData.get("startDate") || "").trim() || getTodayDateOnly();
      const objective = String(formData.get("objective") || "").trim();
      const notes = String(formData.get("notes") || "").trim();
      const clientIds = Array.from(new Set(formData.getAll("clientIds").map((value) => String(value || "").trim()).filter(Boolean)));

      if (!templateId) {
        throw new Error("Choose a template before running a bulk assignment.");
      }
      if (!clientIds.length) {
        throw new Error("Select at least one safe client before running a bulk assignment.");
      }

      const selectedSafeClientIds = clientIds.filter((clientId) => safeCandidates.has(clientId));
      if (!selectedSafeClientIds.length) {
        throw new Error("The selected clients are no longer safe bulk candidates.");
      }

      const successes = [];
      const failures = [];
      for (const clientId of selectedSafeClientIds) {
        try {
          await plannerRequest("/.netlify/functions/assign-client-program", {
            method: "POST",
            body: {
              clientId,
              templateId,
              startDate,
              objective,
              notes,
            },
          });
          successes.push(clientId);
        } catch (error) {
          failures.push({
            clientId,
            message: error?.message || "Assignment failed.",
          });
        }
      }

      await fetchPlannerData(true);
      bulkAssignForm.reset();
      if (bulkAssignStartDateNode) {
        bulkAssignStartDateNode.value = getTodayDateOnly();
      }
      setActivePanel("assignments");

      const derivedAfter = deriveWorkspace();
      renderBulkAssignmentList(derivedAfter);

      const successText = `${successes.length} assigned`;
      const failureText = failures.length ? `, ${failures.length} failed` : "";
      const failureDetail = failures.length ? ` First issue: ${failures[0].message}` : "";
      setInlineFeedback(
        bulkAssignFeedbackNode,
        `Bulk programming complete: ${successText}${failureText}.${failureDetail}`,
        failures.length > 0
      );
    } catch (error) {
      setInlineFeedback(
        bulkAssignFeedbackNode,
        error?.message || "Unable to run the bulk assignment right now.",
        true
      );
    }
  }

  async function handleNutritionSubmit(event) {
    event.preventDefault();
    setInlineFeedback(nutritionFeedbackNode, "Saving nutrition plan...", false);

    try {
      const payload = buildNutritionPayload();
      const response = await plannerRequest("/.netlify/functions/save-nutrition-plan", {
        method: "POST",
        body: payload,
      });
      setInlineFeedback(
        nutritionFeedbackNode,
        response?.message || "Nutrition plan saved.",
        false
      );
      resetNutritionBuilder();
      await fetchPlannerData(true);
      setActivePanel("delivery");
    } catch (error) {
      setInlineFeedback(
        nutritionFeedbackNode,
        error?.message || "Unable to save the nutrition plan right now.",
        true
      );
    }
  }

  async function handleBulkNutritionSubmit(event) {
    event.preventDefault();
    setInlineFeedback(bulkNutritionFeedbackNode, "Applying the current nutrition build across selected clients...", false);

    try {
      const derived = deriveWorkspace();
      const formData = new FormData(bulkNutritionForm);
      const clientIds = Array.from(
        new Set(
          formData
            .getAll("clientIds")
            .map((value) => String(value || "").trim())
            .filter(Boolean)
        )
      );

      if (!clientIds.length) {
        throw new Error("Select at least one client before running the nutrition batch.");
      }

      const allowedClientIds = new Set(derived.bulkNutritionCandidates.map((client) => client.id));
      const selectedClientIds = clientIds.filter((clientId) => allowedClientIds.has(clientId));
      if (!selectedClientIds.length) {
        throw new Error("The selected clients are no longer available for nutrition batch delivery.");
      }

      const payload = buildNutritionDraft({ requireClientId: false });
      const response = await plannerRequest("/.netlify/functions/bulk-save-nutrition-plans", {
        method: "POST",
        body: {
          clientIds: selectedClientIds,
          ...payload,
        },
      });

      await fetchPlannerData(true);
      setActivePanel("delivery");
      renderBulkNutritionList(deriveWorkspace());

      const successCount = Array.isArray(response?.successes) ? response.successes.length : 0;
      const failureCount = Array.isArray(response?.failures) ? response.failures.length : 0;
      const firstFailure = failureCount ? response.failures[0]?.message || "One client failed." : "";
      setInlineFeedback(
        bulkNutritionFeedbackNode,
        `Nutrition batch complete: ${successCount} applied${failureCount ? `, ${failureCount} failed` : ""}.${firstFailure ? ` First issue: ${firstFailure}` : ""}`,
        failureCount > 0
      );
    } catch (error) {
      setInlineFeedback(
        bulkNutritionFeedbackNode,
        error?.message || "Unable to run the nutrition batch right now.",
        true
      );
    }
  }

  async function handleRecipeSubmit(event) {
    event.preventDefault();
    setInlineFeedback(recipeFeedbackNode, "Saving coach recipe...", false);

    try {
      const payload = buildRecipePayload();
      const response = await plannerRequest("/.netlify/functions/save-recipe-library-item", {
        method: "POST",
        body: payload,
      });
      setInlineFeedback(
        recipeFeedbackNode,
        response?.message || "Recipe saved.",
        false
      );
      resetRecipeBuilder();
      await fetchPlannerData(true);
      setActivePanel("delivery");
    } catch (error) {
      setInlineFeedback(
        recipeFeedbackNode,
        error?.message || "Unable to save the recipe right now.",
        true
      );
    }
  }

  async function handleCheckinTemplateSubmit(event) {
    event.preventDefault();
    setInlineFeedback(checkinTemplateFeedbackNode, "Saving health template...", false);

    try {
      const payload = buildCheckinTemplatePayload();
      const response = await plannerRequest("/.netlify/functions/save-checkin-template", {
        method: "POST",
        body: payload,
      });
      setInlineFeedback(
        checkinTemplateFeedbackNode,
        response?.message || "Health template saved.",
        false
      );
      resetCheckinTemplateBuilder(checkinCadenceNode?.value || "weekly");
      await fetchPlannerData(true);
      setActivePanel("delivery");
    } catch (error) {
      setInlineFeedback(
        checkinTemplateFeedbackNode,
        error?.message || "Unable to save the health template right now.",
        true
      );
    }
  }

  async function handleScheduleCheckinSubmit(event) {
    event.preventDefault();
    setInlineFeedback(scheduleCheckinFeedbackNode, "Scheduling health form...", false);

    try {
      const formData = new FormData(scheduleCheckinForm);
      const clientId = String(formData.get("clientId") || "").trim();
      const templateId = String(formData.get("templateId") || "").trim();
      const dueAtRaw = String(formData.get("dueAt") || "").trim();
      if (!clientId || !templateId || !dueAtRaw) {
        throw new Error("Choose the client, health template, and due date/time before scheduling.");
      }

      const dueAt = new Date(dueAtRaw);
      if (Number.isNaN(dueAt.getTime())) {
        throw new Error("Provide a valid due date/time.");
      }

      const response = await plannerRequest("/.netlify/functions/schedule-client-checkin", {
        method: "POST",
        body: {
          clientId,
          templateId,
          assignmentId: String(formData.get("assignmentId") || "").trim(),
          dueAt: dueAt.toISOString(),
        },
      });
      setInlineFeedback(
        scheduleCheckinFeedbackNode,
        response?.message || "Health form scheduled.",
        false
      );
      scheduleCheckinForm.reset();
      scheduleCheckinDueNode.value = formatDateTimeLocalInput(new Date(Date.now() + 2 * 86400000));
      await fetchPlannerData(true);
      setActivePanel("delivery");
    } catch (error) {
      setInlineFeedback(
        scheduleCheckinFeedbackNode,
        error?.message || "Unable to schedule the health form right now.",
        true
      );
    }
  }

  async function searchFoodLibrary(query) {
    const searchText = String(query || "").trim();
    if (foodSearchNode) {
      foodSearchNode.value = searchText;
    }

    setInlineFeedback(foodFeedbackNode, searchText ? "Searching the food library..." : "Loading starter foods...", false);
    try {
      const params = new URLSearchParams();
      if (searchText) {
        params.set("q", searchText);
      }
      params.set("limit", "16");
      const response = await plannerRequest(`/.netlify/functions/search-food-library?${params.toString()}`);
      state.foodSearchResults = Array.isArray(response?.foods) ? response.foods : [];
      renderFoodLibraryResults();
      setInlineFeedback(
        foodFeedbackNode,
        state.foodSearchResults.length
          ? `${formatCount(state.foodSearchResults.length)} food option${state.foodSearchResults.length === 1 ? "" : "s"} ready to use.`
          : "No foods matched that search yet.",
        !state.foodSearchResults.length
      );
    } catch (error) {
      state.foodSearchResults = [];
      renderFoodLibraryResults();
      setInlineFeedback(foodFeedbackNode, error?.message || "Unable to search the food library right now.", true);
    }
  }

  async function searchExerciseLibrary(query) {
    const searchText = String(query || "").trim();
    if (exerciseSearchNode) {
      exerciseSearchNode.value = searchText;
    }

    if (!searchText) {
      state.exerciseSearchResults = [];
      renderExerciseLibraryResults();
      setInlineFeedback(exerciseFeedbackNode, "Search for an exercise name to reveal matching demos.", false);
      return;
    }

    setInlineFeedback(exerciseFeedbackNode, "Searching the exercise demo library...", false);

    try {
      const params = new URLSearchParams();
      params.set("q", searchText);
      params.set("limit", "16");
      const response = await plannerRequest(`/.netlify/functions/search-exercise-library?${params.toString()}`);
      state.exerciseSearchResults = Array.isArray(response?.exercises) ? response.exercises : [];
      renderExerciseLibraryResults();
      setInlineFeedback(
        exerciseFeedbackNode,
        state.exerciseSearchResults.length
          ? `${formatCount(state.exerciseSearchResults.length)} exercise demo${state.exerciseSearchResults.length === 1 ? "" : "s"} ready to use.`
          : "No exercise demos matched that search yet.",
        !state.exerciseSearchResults.length
      );
    } catch (error) {
      state.exerciseSearchResults = [];
      renderExerciseLibraryResults();
      setInlineFeedback(exerciseFeedbackNode, error?.message || "Unable to search the exercise library right now.", true);
    }
  }

  async function handleWorkbookImportSubmit(event) {
    event.preventDefault();
    const file = workbookFileNode?.files?.[0];
    if (!file) {
      setInlineFeedback(workbookImportFeedbackNode, "Choose a workbook file before importing.", true);
      return;
    }

    setInlineFeedback(workbookImportFeedbackNode, "Importing workbook into the template builder...", false);

    try {
      const workbookBase64 = await readFileAsBase64(file);
      const response = await plannerRequest("/.netlify/functions/import-program-workbook", {
        method: "POST",
        body: {
          workbookBase64,
          sheetName: workbookSheetNode?.value || "",
          filename: file.name,
        },
      });
      hydrateTemplateBuilderFromWorkbookDraft(response?.draft || null);
      setInlineFeedback(
        workbookImportFeedbackNode,
        response?.message || "Workbook imported into the template builder. Review the structure and save when ready.",
        false
      );
      setInlineFeedback(
        templateFeedbackNode,
        "Workbook draft loaded into the template builder. Review the imported days and save when you are happy with the structure.",
        false
      );
    } catch (error) {
      setInlineFeedback(workbookImportFeedbackNode, error?.message || "Unable to import the workbook right now.", true);
    }
  }

  function resetExerciseBuilder() {
    exerciseForm?.reset();
    if (exerciseForm) {
      const idField = exerciseForm.elements.namedItem("id");
      if (idField) {
        idField.value = "";
      }
      const exerciseTypeField = exerciseForm.elements.namedItem("exerciseType");
      if (exerciseTypeField && !exerciseTypeField.value) {
        exerciseTypeField.value = "standard";
      }
      const demoNoteField = exerciseForm.elements.namedItem("demoNote");
      if (demoNoteField && !demoNoteField.value) {
        demoNoteField.value = "";
      }
    }
  }

  async function handleExerciseLibrarySubmit(event) {
    event.preventDefault();
    if (!exerciseForm) {
      return;
    }

    const formData = new FormData(exerciseForm);
    const name = compactText(formData.get("name"));
    const videoUrl = compactText(formData.get("videoUrl"));
    if (!name || !videoUrl) {
      setInlineFeedback(exerciseFeedbackNode, "Add both an exercise name and a demo URL before saving.", true);
      return;
    }

    setInlineFeedback(exerciseFeedbackNode, "Saving exercise demo link...", false);

    try {
      const response = await plannerRequest("/.netlify/functions/save-exercise-library-item", {
        method: "POST",
        body: {
          id: compactText(formData.get("id")),
          name,
          videoUrl,
          bodyPart: compactText(formData.get("bodyPart")) || "full_body",
          exerciseType: compactText(formData.get("exerciseType")) || "standard",
          tags: parseTagList(formData.get("tags")),
          notes: compactText(formData.get("notes")),
          demoNote: compactText(formData.get("demoNote")) || "Temporary external demo until the LEGACY exercise library is ready.",
          demoSourceMode: "temporary_external",
        },
      });
      setInlineFeedback(exerciseFeedbackNode, response?.message || "Exercise demo saved.", false);
      resetExerciseBuilder();
      await searchExerciseLibrary(exerciseSearchNode?.value || name);
    } catch (error) {
      setInlineFeedback(exerciseFeedbackNode, error?.message || "Unable to save the exercise demo right now.", true);
    }
  }

  async function handleExerciseBulkImportSubmit(event) {
    event.preventDefault();
    if (!exerciseBulkForm) {
      return;
    }

    const formData = new FormData(exerciseBulkForm);
    const items = parseExerciseBulkRows(formData.get("bulkRows"));
    if (!items.length) {
      setInlineFeedback(
        exerciseFeedbackNode,
        "Add at least one valid row using either 'Exercise Name | URL' or the LEGACY import template columns.",
        true
      );
      return;
    }

    setInlineFeedback(exerciseFeedbackNode, "Importing exercise demo links...", false);

    try {
      const response = await plannerRequest("/.netlify/functions/bulk-upsert-exercise-library", {
        method: "POST",
        body: { items },
      });
      setInlineFeedback(
        exerciseFeedbackNode,
        response?.message || "Exercise demo links imported.",
        false
      );
      exerciseBulkForm.reset();
      await searchExerciseLibrary(exerciseSearchNode?.value || "");
    } catch (error) {
      setInlineFeedback(exerciseFeedbackNode, error?.message || "Unable to bulk import exercise demo links right now.", true);
    }
  }

  function resetFoodBuilder() {
    foodForm?.reset();
    state.foodServings = [createEmptyFoodServing(1)];
    renderFoodServingBuilder();
  }

  async function handleFoodSubmit(event) {
    event.preventDefault();
    if (!foodForm) {
      return;
    }

    const formData = new FormData(foodForm);
    const servings = state.foodServings
      .map((serving, index) => ({
        sortOrder: index,
        label: compactText(serving.label),
        grams: parseDecimal(serving.grams),
        unitCount: parseDecimal(serving.unitCount) || 1,
        isDefault: Boolean(serving.isDefault),
      }))
      .filter((serving) => serving.label && serving.grams);

    setInlineFeedback(foodFeedbackNode, "Saving food item...", false);

    try {
      const response = await plannerRequest("/.netlify/functions/save-food-library-item", {
        method: "POST",
        body: {
          name: formData.get("name"),
          brandName: formData.get("brandName"),
          foodGroup: formData.get("foodGroup"),
          countryCode: formData.get("countryCode"),
          defaultServingLabel: formData.get("defaultServingLabel"),
          defaultServingGrams: formData.get("defaultServingGrams"),
          caloriesKcal: formData.get("caloriesKcal"),
          proteinG: formData.get("proteinG"),
          carbsG: formData.get("carbsG"),
          fatG: formData.get("fatG"),
          fiberG: formData.get("fiberG"),
          sugarG: formData.get("sugarG"),
          sodiumMg: formData.get("sodiumMg"),
          searchTags: String(formData.get("searchTags") || "")
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
          notes: formData.get("notes"),
          servings,
        },
      });
      setInlineFeedback(foodFeedbackNode, response?.message || "Food item saved.", false);
      resetFoodBuilder();
      await searchFoodLibrary(foodSearchNode?.value || "");
    } catch (error) {
      setInlineFeedback(foodFeedbackNode, error?.message || "Unable to save the food item right now.", true);
    }
  }

  async function handleReviewAction(button) {
    const type = button.dataset.reviewType || "";
    const recordId = button.dataset.reviewId || "";
    const decision = button.dataset.reviewDecision || "";
    const feedbackNode = document.querySelector(`[data-review-feedback="${type}:${recordId}"]`);
    if (!type || !recordId || !decision) {
      return;
    }

    button.disabled = true;
    setInlineFeedback(feedbackNode, "Updating review status...", false);

    try {
      if (type === "reward_event") {
        await plannerRequest("/.netlify/functions/review-planner-event", {
          method: "POST",
          body: {
            eventId: recordId,
            decision,
          },
        });
      } else {
        const body = {
          type,
          decision,
        };
        if (type === "workout_log") {
          body.workoutLogId = recordId;
        } else if (type === "nutrition_log") {
          body.nutritionLogId = recordId;
        } else if (type === "meal_entry") {
          body.mealEntryId = recordId;
        } else if (type === "checkin") {
          body.checkinId = recordId;
        } else if (type === "progress_photo") {
          body.entryId = recordId;
        } else if (type === "nutrition_photo") {
          body.submissionId = recordId;
        }

        await plannerRequest("/.netlify/functions/review-planner-submission", {
          method: "POST",
          body,
        });
      }
      setInlineFeedback(feedbackNode, "Review updated.", false);
      await fetchPlannerData(true);
      setActivePanel("reviews");
    } catch (error) {
      setInlineFeedback(
        feedbackNode,
        error?.message || "Unable to update the review status right now.",
        true
      );
    } finally {
      button.disabled = false;
    }
  }

  function renderAll() {
    const derived = deriveWorkspace();
    const hasRoster = hasAssignedRoster(derived);
    if (state.activePanel === "delivery" && !hasAssignedRoster(derived) && state.deliverySubpanel !== "library") {
      setActiveDeliverySubpanel("library");
    }
    if (deliveryPlanCardNode) {
      deliveryPlanCardNode.hidden = state.activePanel === "delivery" && !hasRoster && state.deliverySubpanel === "library";
    }
    if (workspaceKind === "training") {
      toggleTrainingSections(hasRoster);
      renderMetrics(derived);
      renderTemplateLibrary(derived);
      renderClientOptions(derived);
      renderTemplateOptions(derived);
      renderBulkAssignmentList(derived);
      renderClientFocus(derived);
      renderDeliveryList(derived);
      renderCalendarClientOptions(derived);
      renderCalendarSummary(derived);
      renderCalendarGrid(derived);
      renderCalendarAttention(derived);
      renderExerciseLibraryResults();
      renderAssignmentWorkbookPreview();
      return;
    }
    renderMetrics(derived);
    renderRosterGrid(derived);
    renderSignals(derived);
    renderRiskGrid(derived);
    renderStaleGrid(derived);
    renderAssignmentRows(derived);
    renderTemplateLibrary(derived);
    renderClientOptions(derived);
    renderTemplateOptions(derived);
    renderBulkAssignmentList(derived);
    renderClientFocus(derived);
    renderDeliveryList(derived);
    renderNutritionAssignmentOptions(derived);
    ensureNutritionWorkbookState();
    renderMealPlanBuilder();
    renderNutritionWizardPreview();
    renderBulkNutritionList(derived);
    renderDeliveryLibrary(derived);
    renderFoodServingBuilder();
    renderFoodLibraryResults();
    renderRecipeIngredientBuilder();
    renderRecipeLibrary(derived);
    renderExerciseLibraryResults();
    renderCheckinTemplateOptions(derived);
    renderReviewGrid(derived);
    renderOperationsSummary(derived);
    renderOperationsNudgeList(derived);
    renderOperationsBoard(derived);
    renderOperationsSegments(derived);
    renderAutomationSegmentOptions();
    renderAutomationRules(derived);
    renderCalendarClientOptions(derived);
    renderCalendarSummary(derived);
    renderCalendarGrid(derived);
    renderCalendarAttention(derived);
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

    const coachId = access.user.id;
    const channel = supabase.channel(`coach-programming:${coachId}`);
    const tableFilters = [
      { table: "coach_client_assignments", filter: `coach_id=eq.${coachId}` },
      { table: "program_templates", filter: `coach_id=eq.${coachId}` },
      { table: "client_program_assignments", filter: `coach_id=eq.${coachId}` },
      { table: "client_program_days" },
      { table: "client_workout_logs", filter: `coach_id=eq.${coachId}` },
      { table: "client_nutrition_plans", filter: `coach_id=eq.${coachId}` },
      { table: "client_nutrition_logs", filter: `coach_id=eq.${coachId}` },
      { table: "client_meal_entries", filter: `coach_id=eq.${coachId}` },
      { table: "nutrition_photo_submissions", filter: `coach_id=eq.${coachId}` },
      { table: "nutrition_photo_assets" },
      { table: "nutrition_photo_candidates" },
      { table: "food_library", filter: `owner_id=eq.${coachId}` },
      { table: "food_servings" },
      { table: "recipe_library" },
      { table: "recipe_ingredients" },
      { table: "client_checkins", filter: `coach_id=eq.${coachId}` },
      { table: "progress_photo_entries", filter: `coach_id=eq.${coachId}` },
      { table: "planner_reward_events", filter: `coach_id=eq.${coachId}` },
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
        setActivePanel(tabNode.dataset.coachProgrammingTab || "overview");
      });
    });

    trainingStepTabNodes.forEach((tabNode) => {
      tabNode.addEventListener("click", () => {
        const nextStep = tabNode.dataset.coachTrainingStep || "inputs";
        if (!prepareTrainingWizardStep(nextStep)) {
          return;
        }
        setActiveTrainingWizardStep(nextStep);
      });
    });

    trainingStepNavNodes.forEach((buttonNode) => {
      buttonNode.addEventListener("click", () => {
        const direction = buttonNode.dataset.coachTrainingNav === "back" ? -1 : 1;
        moveTrainingWizardStep(direction);
      });
    });

    nutritionStepTabNodes.forEach((tabNode) => {
      tabNode.addEventListener("click", () => {
        setActiveNutritionWizardStep(tabNode.dataset.coachNutritionStep || "inputs");
      });
    });

    nutritionStepNavNodes.forEach((buttonNode) => {
      buttonNode.addEventListener("click", () => {
        const direction = buttonNode.dataset.coachNutritionNav === "back" ? -1 : 1;
        moveNutritionWizardStep(direction);
      });
    });

    trainingGenerateButton?.addEventListener("click", () => {
      handleTrainingGenerateProgram().catch(() => null);
    });

    deliverySubtabNodes.forEach((tabNode) => {
      tabNode.addEventListener("click", () => {
        setActiveDeliverySubpanel(tabNode.dataset.coachProgrammingSubtab || "plans");
      });
    });

    reviewFocusNode?.addEventListener("change", () => {
      state.reviewFilters.focus = reviewFocusNode.value || "all";
      renderReviewGrid(deriveWorkspace());
    });

    reviewClientNode?.addEventListener("change", () => {
      state.reviewFilters.clientId = reviewClientNode.value || "";
      renderReviewGrid(deriveWorkspace());
    });

    reviewSortNode?.addEventListener("change", () => {
      state.reviewFilters.sort = reviewSortNode.value || "priority";
      renderReviewGrid(deriveWorkspace());
    });

    templateAddDayButton?.addEventListener("click", () => {
      addBuilderDay();
    });
    templateResetButton?.addEventListener("click", () => {
      resetTemplateBuilder();
      setInlineFeedback(templateFeedbackNode, "Starting a fresh training template.", false);
    });
    nutritionAddHabitButton?.addEventListener("click", () => {
      addNutritionHabit();
    });
    nutritionRegenerateHabitsButton?.addEventListener("click", () => {
      ensureNutritionWorkbookState({ forceHabits: true });
      renderNutritionWizardPreview();
    });
    mealPlanResetButton?.addEventListener("click", () => {
      state.nutritionWizard.mealPlanDirty = false;
      ensureNutritionWorkbookState({ forceMealPlan: true });
      renderNutritionWizardPreview();
    });
    nutritionRegenerateTargetsButton?.addEventListener("click", () => {
      state.nutritionWizard.manualTargetFields.clear();
      ensureNutritionWorkbookState({ forceTargets: true });
      renderNutritionWizardPreview();
    });
    checkinAddQuestionButton?.addEventListener("click", () => {
      addCheckinQuestion();
    });

    templateForm?.addEventListener("submit", handleTemplateSubmit);
    templateForm?.elements?.namedItem("category")?.addEventListener("change", () => {
      renderBuilderDays();
    });
    workbookImportForm?.addEventListener("submit", handleWorkbookImportSubmit);
    if (!(isTrainingWorkspace() && assignForm === templateForm)) {
      assignForm?.addEventListener("submit", handleAssignmentSubmit);
    }
    bulkAssignForm?.addEventListener("submit", handleBulkAssignmentSubmit);
    nutritionForm?.addEventListener("submit", handleNutritionSubmit);
    nutritionForm?.addEventListener("input", (event) => {
      const targetName = String(event?.target?.name || "").trim();
      if (NUTRITION_WORKBOOK_INPUT_FIELDS.has(targetName)) {
        ensureNutritionWorkbookState();
      } else if (NUTRITION_OVERRIDE_TARGET_FIELDS.has(targetName)) {
        state.nutritionWizard.manualTargetFields.add(targetName);
      }
      renderNutritionWizardPreview();
    });
    nutritionForm?.addEventListener("change", (event) => {
      const targetName = String(event?.target?.name || "").trim();
      if (NUTRITION_WORKBOOK_INPUT_FIELDS.has(targetName)) {
        ensureNutritionWorkbookState();
      } else if (NUTRITION_OVERRIDE_TARGET_FIELDS.has(targetName)) {
        state.nutritionWizard.manualTargetFields.add(targetName);
      }
      renderNutritionWizardPreview();
    });
    bulkNutritionForm?.addEventListener("submit", handleBulkNutritionSubmit);
    operationsNudgeForm?.addEventListener("submit", handleOperationsNudgeSubmit);
    segmentForm?.addEventListener("submit", handleSegmentSubmit);
    automationForm?.addEventListener("submit", handleAutomationSubmit);
    checkinTemplateForm?.addEventListener("submit", handleCheckinTemplateSubmit);
    scheduleCheckinForm?.addEventListener("submit", handleScheduleCheckinSubmit);
    foodForm?.addEventListener("submit", handleFoodSubmit);
    recipeForm?.addEventListener("submit", handleRecipeSubmit);
    exerciseForm?.addEventListener("submit", handleExerciseLibrarySubmit);
    exerciseBulkForm?.addEventListener("submit", handleExerciseBulkImportSubmit);
    addFoodServingButton?.addEventListener("click", () => {
      addFoodServing();
    });
    resetRecipeButton?.addEventListener("click", () => {
      resetRecipeBuilder();
    });

    [templateDaysNode, trainingExerciseMirrorNode].filter(Boolean).forEach((builderNode) => {
      builderNode.addEventListener("input", (event) => {
        const target = event.target;
        const dayCard = target.closest("[data-day-id]");
        const field = target.dataset.dayField;
        const exerciseCard = target.closest("[data-exercise-id]");
        const exerciseField = target.dataset.exerciseField;
        if (dayCard && exerciseCard && exerciseField) {
          updateBuilderExercise(
            dayCard.dataset.dayId || "",
            exerciseCard.dataset.exerciseId || "",
            exerciseField,
            target.value
          );
          return;
        }
        if (!dayCard || !field) {
          return;
        }
        updateBuilderDay(dayCard.dataset.dayId || "", field, target.value);
      });

      builderNode.addEventListener("change", (event) => {
        const target = event.target;
        const dayCard = target.closest("[data-day-id]");
        const field = target.dataset.dayField;
        const exerciseCard = target.closest("[data-exercise-id]");
        const exerciseField = target.dataset.exerciseField;
        if (dayCard && exerciseCard && exerciseField) {
          updateBuilderExercise(
            dayCard.dataset.dayId || "",
            exerciseCard.dataset.exerciseId || "",
            exerciseField,
            target.value
          );
          if (exerciseField === "name") {
            renderBuilderDays();
          }
          return;
        }
        if (!dayCard || !field) {
          return;
        }
        updateBuilderDay(dayCard.dataset.dayId || "", field, target.value);
        if (field === "title" || field === "dayType") {
          renderBuilderDays();
        }
      });

      builderNode.addEventListener("click", (event) => {
        const addExerciseButton = event.target.closest("[data-add-exercise]");
        if (addExerciseButton) {
          addBuilderExercise(addExerciseButton.dataset.addExercise || "");
          return;
        }

        const removeExerciseButton = event.target.closest("[data-remove-exercise]");
        if (removeExerciseButton) {
          const dayCard = removeExerciseButton.closest("[data-day-id]");
          removeBuilderExercise(dayCard?.dataset.dayId || "", removeExerciseButton.dataset.removeExercise || "");
          return;
        }

        const moveExerciseButton = event.target.closest("[data-move-exercise]");
        if (moveExerciseButton) {
          const dayCard = moveExerciseButton.closest("[data-day-id]");
          moveBuilderExercise(
            dayCard?.dataset.dayId || "",
            moveExerciseButton.dataset.moveExercise || "",
            moveExerciseButton.dataset.moveDirection || "0"
          );
          return;
        }

        const removeButton = event.target.closest("[data-remove-day]");
        if (!removeButton) {
          return;
        }
        removeBuilderDay(removeButton.dataset.removeDay || "");
      });
    });

    [trainingWeekTabsSplitNode, trainingWeekTabsExercisesNode].filter(Boolean).forEach((node) => {
      node.addEventListener("click", (event) => {
        const weekButton = event.target.closest("[data-training-workbook-week]");
        if (!weekButton) {
          return;
        }
        setActiveTrainingWorkbookWeek(weekButton.dataset.trainingWorkbookWeek || "");
      });
    });

    nutritionHabitsNode?.addEventListener("input", (event) => {
      const target = event.target;
      const habitCard = target.closest("[data-habit-id]");
      const field = target.dataset.habitField;
      if (!habitCard || !field) {
        return;
      }
      updateNutritionHabit(habitCard.dataset.habitId || "", field, target.type === "checkbox" ? target.checked : target.value);
    });

    nutritionHabitsNode?.addEventListener("change", (event) => {
      const target = event.target;
      const habitCard = target.closest("[data-habit-id]");
      const field = target.dataset.habitField;
      if (!habitCard || !field) {
        return;
      }
      updateNutritionHabit(habitCard.dataset.habitId || "", field, target.type === "checkbox" ? target.checked : target.value);
      if (field === "title") {
        renderHabitBuilder();
      }
    });

    nutritionHabitsNode?.addEventListener("click", (event) => {
      const removeButton = event.target.closest("[data-remove-habit]");
      if (!removeButton) {
        return;
      }
      removeNutritionHabit(removeButton.dataset.removeHabit || "");
    });

    mealPlanDaysNode?.addEventListener("input", (event) => {
      const target = event.target;
      const dayCard = target.closest("[data-meal-plan-day-id]");
      const slotCard = target.closest("[data-meal-plan-slot-id]");
      const dayField = target.dataset.mealDayField;
      const slotField = target.dataset.mealSlotField;
      if (dayCard && dayField) {
        updateMealPlanDay(dayCard.dataset.mealPlanDayId || "", dayField, target.value);
      }
      if (slotCard && slotField) {
        updateMealPlanSlot(slotCard.dataset.mealPlanSlotId || "", slotField, target.value);
      }
    });

    mealPlanDaysNode?.addEventListener("change", (event) => {
      const target = event.target;
      const dayCard = target.closest("[data-meal-plan-day-id]");
      const dayField = target.dataset.mealDayField;
      const slotCard = target.closest("[data-meal-plan-slot-id]");
      const slotField = target.dataset.mealSlotField;
      if (dayCard && dayField) {
        updateMealPlanDay(dayCard.dataset.mealPlanDayId || "", dayField, target.value);
        renderMealPlanBuilder();
        renderNutritionWizardPreview();
        return;
      }
      if (slotCard && slotField) {
        updateMealPlanSlot(slotCard.dataset.mealPlanSlotId || "", slotField, target.value);
        renderMealPlanBuilder();
        renderNutritionWizardPreview();
      }
    });

    mealPlanDaysNode?.addEventListener("click", (event) => {
      const selectDayButton = event.target.closest("[data-select-meal-day]");
      if (selectDayButton) {
        setActiveMealPlanDay(selectDayButton.dataset.selectMealDay || "");
        return;
      }

      const addSlotButton = event.target.closest("[data-add-meal-slot]");
      if (addSlotButton) {
        addMealPlanSlot(addSlotButton.dataset.addMealSlot || "");
        return;
      }

      const removeSlotButton = event.target.closest("[data-remove-meal-slot]");
      if (removeSlotButton) {
        removeMealPlanSlot(removeSlotButton.dataset.removeMealSlot || "");
      }
    });

    foodServingsNode?.addEventListener("input", (event) => {
      const target = event.target;
      const servingCard = target.closest("[data-food-serving-id]");
      const field = target.dataset.foodServingField;
      if (!servingCard || !field) {
        return;
      }
      updateFoodServing(servingCard.dataset.foodServingId || "", field, target.type === "checkbox" ? target.checked : target.value);
    });

    foodServingsNode?.addEventListener("change", (event) => {
      const target = event.target;
      const servingCard = target.closest("[data-food-serving-id]");
      const field = target.dataset.foodServingField;
      if (!servingCard || !field) {
        return;
      }
      updateFoodServing(servingCard.dataset.foodServingId || "", field, target.type === "checkbox" ? target.checked : target.value);
    });

    foodServingsNode?.addEventListener("click", (event) => {
      const removeButton = event.target.closest("[data-remove-food-serving]");
      if (!removeButton) {
        return;
      }
      removeFoodServing(removeButton.dataset.removeFoodServing || "");
    });

    recipeIngredientsNode?.addEventListener("input", (event) => {
      const target = event.target;
      const ingredientCard = target.closest("[data-recipe-ingredient-id]");
      const field = target.dataset.recipeIngredientField;
      if (!ingredientCard || !field) {
        return;
      }
      updateRecipeIngredient(ingredientCard.dataset.recipeIngredientId || "", field, target.value);
    });

    recipeIngredientsNode?.addEventListener("change", (event) => {
      const target = event.target;
      const ingredientCard = target.closest("[data-recipe-ingredient-id]");
      const field = target.dataset.recipeIngredientField;
      if (!ingredientCard || !field) {
        return;
      }
      updateRecipeIngredient(ingredientCard.dataset.recipeIngredientId || "", field, target.value);
    });

    recipeIngredientsNode?.addEventListener("click", (event) => {
      const removeButton = event.target.closest("[data-remove-recipe-ingredient]");
      if (!removeButton) {
        return;
      }
      removeRecipeIngredient(removeButton.dataset.removeRecipeIngredient || "");
    });

    checkinQuestionsNode?.addEventListener("input", (event) => {
      const target = event.target;
      const questionCard = target.closest("[data-question-id]");
      const field = target.dataset.questionField;
      if (!questionCard || !field) {
        return;
      }
      updateCheckinQuestion(questionCard.dataset.questionId || "", field, target.type === "checkbox" ? target.checked : target.value);
    });

    checkinQuestionsNode?.addEventListener("change", (event) => {
      const target = event.target;
      const questionCard = target.closest("[data-question-id]");
      const field = target.dataset.questionField;
      if (!questionCard || !field) {
        return;
      }
      updateCheckinQuestion(questionCard.dataset.questionId || "", field, target.type === "checkbox" ? target.checked : target.value);
      if (field === "label") {
        renderQuestionBuilder();
      }
    });

    checkinQuestionsNode?.addEventListener("click", (event) => {
      const removeButton = event.target.closest("[data-remove-question]");
      if (!removeButton) {
        return;
      }
      removeCheckinQuestion(removeButton.dataset.removeQuestion || "");
    });

    document.addEventListener("click", (event) => {
      const openPanelButton = event.target.closest("[data-open-coach-panel]");
      if (openPanelButton) {
        setActivePanel(openPanelButton.dataset.openCoachPanel || "overview");
        return;
      }

      const openTemplateBuilderButton = event.target.closest("[data-open-template-builder]");
      if (openTemplateBuilderButton) {
        loadTemplateIntoBuilder(openTemplateBuilderButton.dataset.openTemplateBuilder || "", {
          clientId: openTemplateBuilderButton.dataset.openTemplateClient || "",
        }).catch((error) => {
          setInlineFeedback(
            templateFeedbackNode,
            error?.message || "Unable to load that training template into the builder right now.",
            true
          );
        });
        return;
      }

      const openAssignmentBuilderButton = event.target.closest("[data-open-assignment-builder]");
      if (openAssignmentBuilderButton) {
        openAssignedProgramInBuilder(openAssignmentBuilderButton.dataset.openAssignmentBuilder || "").catch((error) => {
          setInlineFeedback(
            templateFeedbackNode,
            error?.message || "Unable to load that live client block into the builder right now.",
            true
          );
        });
        return;
      }

      const useTemplateButton = event.target.closest("[data-use-template]");
      if (useTemplateButton) {
        selectTemplate(useTemplateButton.dataset.useTemplate || "");
        setActivePanel("assignments");
        return;
      }

      const fillClientButton = event.target.closest("[data-fill-client]");
      if (fillClientButton) {
        selectClient(fillClientButton.dataset.fillClient || "");
        setActivePanel("assignments");
        return;
      }

      const exerciseLibraryButton = event.target.closest("[data-exercise-library-id]");
      if (exerciseLibraryButton) {
        const exercise = state.exerciseSearchResults.find((item) => item.id === exerciseLibraryButton.dataset.exerciseLibraryId);
        if (exercise) {
          fillExerciseFormFromResult(exercise);
        }
        return;
      }

      const reviewButton = event.target.closest("[data-review-id]");
      if (reviewButton) {
        handleReviewAction(reviewButton).catch(() => null);
        return;
      }

      const calendarFocusButton = event.target.closest("[data-calendar-focus-client]");
      if (calendarFocusButton) {
        const clientId = calendarFocusButton.dataset.calendarFocusClient || "";
        const panel = calendarFocusButton.dataset.calendarFocusPanel || "assignments";
        selectClient(clientId);
        setActivePanel(panel);
        return;
      }

      const operationsQueueButton = event.target.closest("[data-ops-queue-client]");
      if (operationsQueueButton) {
        queueOperationsClient(
          operationsQueueButton.dataset.opsQueueClient || "",
          operationsQueueButton.dataset.opsQueueCategory || "nutrition"
        );
        return;
      }

      const selectSegmentButton = event.target.closest("[data-ops-select-segment]");
      if (selectSegmentButton) {
        const derived = deriveWorkspace();
        const ids = new Set(
          getCoachOpsSegmentMatches(derived, selectSegmentButton.dataset.opsSelectSegment || "").map((client) => client.id)
        );
        operationsNudgeListNode?.querySelectorAll('input[type="checkbox"][data-ops-client-id]').forEach((input) => {
          input.checked = ids.has(input.value);
        });
        setActivePanel("operations");
        return;
      }

      const useSegmentRuleButton = event.target.closest("[data-ops-use-segment-rule]");
      if (useSegmentRuleButton) {
        if (automationSegmentNode) {
          automationSegmentNode.value = useSegmentRuleButton.dataset.opsUseSegmentRule || "";
        }
        setActivePanel("operations");
        automationNameNode?.focus();
        return;
      }

      const deleteSegmentButton = event.target.closest("[data-ops-delete-segment]");
      if (deleteSegmentButton) {
        const segmentId = deleteSegmentButton.dataset.opsDeleteSegment || "";
        const nextSegments = state.coachOps.segments.filter((segment) => segment.id !== segmentId);
        const nextRules = state.coachOps.automationRules.filter((rule) => rule.segmentId !== segmentId);
        saveCoachOpsPreferences(
          {
            coachOpsSegments: nextSegments,
            coachAutomationRules: nextRules,
            coachWeeklyBriefingEnabled: Boolean(weeklyBriefingEnabledNode?.checked),
          },
          "Smart segment removed."
        ).then(() => {
          setInlineFeedback(segmentFeedbackNode, "Smart segment removed.", false);
        }).catch((error) => {
          setInlineFeedback(segmentFeedbackNode, error?.message || "Unable to remove the smart segment right now.", true);
        });
        return;
      }

      const runRuleButton = event.target.closest("[data-ops-run-rule]");
      if (runRuleButton) {
        const rule = state.coachOps.automationRules.find((item) => item.id === (runRuleButton.dataset.opsRunRule || ""));
        if (!rule) {
          return;
        }
        const derived = deriveWorkspace();
        const ids = new Set(getCoachOpsSegmentMatches(derived, rule.segmentId).map((client) => client.id));
        if (operationsNudgeCategoryNode) {
          operationsNudgeCategoryNode.value = rule.category || "nutrition";
        }
        operationsNudgeListNode?.querySelectorAll('input[type="checkbox"][data-ops-client-id]').forEach((input) => {
          input.checked = ids.has(input.value);
        });
        setActivePanel("operations");
        return;
      }

      const toggleRuleButton = event.target.closest("[data-ops-toggle-rule]");
      if (toggleRuleButton) {
        const ruleId = toggleRuleButton.dataset.opsToggleRule || "";
        const nextRules = state.coachOps.automationRules.map((rule) =>
          rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
        );
        saveCoachOpsPreferences(
          {
            coachOpsSegments: state.coachOps.segments,
            coachAutomationRules: nextRules,
            coachWeeklyBriefingEnabled: Boolean(weeklyBriefingEnabledNode?.checked),
          },
          "Automation rule updated."
        ).then(() => {
          setInlineFeedback(automationFeedbackNode, "Automation rule updated.", false);
        }).catch((error) => {
          setInlineFeedback(automationFeedbackNode, error?.message || "Unable to update the automation rule right now.", true);
        });
        return;
      }

      const deleteRuleButton = event.target.closest("[data-ops-delete-rule]");
      if (deleteRuleButton) {
        const ruleId = deleteRuleButton.dataset.opsDeleteRule || "";
        const nextRules = state.coachOps.automationRules.filter((rule) => rule.id !== ruleId);
        saveCoachOpsPreferences(
          {
            coachOpsSegments: state.coachOps.segments,
            coachAutomationRules: nextRules,
            coachWeeklyBriefingEnabled: Boolean(weeklyBriefingEnabledNode?.checked),
          },
          "Automation rule removed."
        ).then(() => {
          setInlineFeedback(automationFeedbackNode, "Automation rule removed.", false);
        }).catch((error) => {
          setInlineFeedback(automationFeedbackNode, error?.message || "Unable to remove the automation rule right now.", true);
        });
        return;
      }

      const addIngredientButton = event.target.closest("[data-add-recipe-ingredient]");
      if (addIngredientButton) {
        addRecipeIngredient(addIngredientButton.dataset.addRecipeIngredient || "");
      }
    });

    bulkAssignSelectAllButton?.addEventListener("click", () => {
      bulkAssignListNode?.querySelectorAll('input[type="checkbox"][data-bulk-client-id]').forEach((input) => {
        input.checked = true;
      });
    });

    bulkAssignSelectRiskButton?.addEventListener("click", () => {
      const derived = deriveWorkspace();
      const atRiskIds = new Set(derived.bulkCandidates.filter((client) => client.riskScore >= 40).map((client) => client.id));
      bulkAssignListNode?.querySelectorAll('input[type="checkbox"][data-bulk-client-id]').forEach((input) => {
        input.checked = atRiskIds.has(input.value);
      });
    });

    bulkAssignClearButton?.addEventListener("click", () => {
      bulkAssignListNode?.querySelectorAll('input[type="checkbox"][data-bulk-client-id]').forEach((input) => {
        input.checked = false;
      });
    });

    bulkNutritionSelectEmptyButton?.addEventListener("click", () => {
      const derived = deriveWorkspace();
      const ids = new Set(derived.bulkNutritionCandidates.filter((client) => !client.activeNutrition).map((client) => client.id));
      bulkNutritionListNode?.querySelectorAll('input[type="checkbox"][data-bulk-nutrition-client-id]').forEach((input) => {
        input.checked = ids.has(input.value);
      });
    });

    bulkNutritionSelectRiskButton?.addEventListener("click", () => {
      const derived = deriveWorkspace();
      const ids = new Set(derived.bulkNutritionCandidates.filter((client) => client.riskScore >= 40).map((client) => client.id));
      bulkNutritionListNode?.querySelectorAll('input[type="checkbox"][data-bulk-nutrition-client-id]').forEach((input) => {
        input.checked = ids.has(input.value);
      });
    });

    bulkNutritionClearButton?.addEventListener("click", () => {
      bulkNutritionListNode?.querySelectorAll('input[type="checkbox"][data-bulk-nutrition-client-id]').forEach((input) => {
        input.checked = false;
      });
    });

    operationsSelectNutritionButton?.addEventListener("click", () => {
      const derived = deriveWorkspace();
      const ids = new Set(derived.operationsCandidates.filter((client) => client.needsNutritionNudge).map((client) => client.id));
      if (operationsNudgeCategoryNode) {
        operationsNudgeCategoryNode.value = "nutrition";
      }
      operationsNudgeListNode?.querySelectorAll('input[type="checkbox"][data-ops-client-id]').forEach((input) => {
        input.checked = ids.has(input.value);
      });
    });

    operationsSelectCheckinButton?.addEventListener("click", () => {
      const derived = deriveWorkspace();
      const ids = new Set(derived.operationsCandidates.filter((client) => client.needsCheckinNudge).map((client) => client.id));
      if (operationsNudgeCategoryNode) {
        operationsNudgeCategoryNode.value = "checkin";
      }
      operationsNudgeListNode?.querySelectorAll('input[type="checkbox"][data-ops-client-id]').forEach((input) => {
        input.checked = ids.has(input.value);
      });
    });

    operationsSelectQuietButton?.addEventListener("click", () => {
      const derived = deriveWorkspace();
      const ids = new Set(
        derived.operationsCandidates
          .filter((client) => (client.quietThisWeek && client.daysSinceActivity > 3) || client.needsTrainingNudge)
          .map((client) => client.id)
      );
      if (operationsNudgeCategoryNode) {
        operationsNudgeCategoryNode.value = "training";
      }
      operationsNudgeListNode?.querySelectorAll('input[type="checkbox"][data-ops-client-id]').forEach((input) => {
        input.checked = ids.has(input.value);
      });
    });

    operationsClearButton?.addEventListener("click", () => {
      operationsNudgeListNode?.querySelectorAll('input[type="checkbox"][data-ops-client-id]').forEach((input) => {
        input.checked = false;
      });
    });

    weeklyBriefingEnabledNode?.addEventListener("change", () => {
      saveCoachOpsPreferences(
        {
          coachOpsSegments: state.coachOps.segments,
          coachAutomationRules: state.coachOps.automationRules,
          coachWeeklyBriefingEnabled: Boolean(weeklyBriefingEnabledNode.checked),
        },
        "Weekly briefing preference updated."
      ).then(() => {
        setInlineFeedback(automationFeedbackNode, "Weekly briefing preference updated.", false);
      }).catch((error) => {
        weeklyBriefingEnabledNode.checked = state.coachOps.weeklyBriefingEnabled;
        setInlineFeedback(automationFeedbackNode, error?.message || "Unable to update the weekly briefing preference right now.", true);
      });
    });

    calendarPrevButton?.addEventListener("click", () => {
      state.calendar.weekOffset -= 1;
      const derived = deriveWorkspace();
      renderCalendarSummary(derived);
      renderCalendarGrid(derived);
      renderCalendarAttention(derived);
    });

    calendarTodayButton?.addEventListener("click", () => {
      state.calendar.weekOffset = 0;
      const derived = deriveWorkspace();
      renderCalendarSummary(derived);
      renderCalendarGrid(derived);
      renderCalendarAttention(derived);
    });

    calendarNextButton?.addEventListener("click", () => {
      state.calendar.weekOffset += 1;
      const derived = deriveWorkspace();
      renderCalendarSummary(derived);
      renderCalendarGrid(derived);
      renderCalendarAttention(derived);
    });

    calendarClientNode?.addEventListener("change", () => {
      state.calendar.clientId = calendarClientNode.value || "";
      const derived = deriveWorkspace();
      renderCalendarSummary(derived);
      renderCalendarGrid(derived);
      renderCalendarAttention(derived);
    });

    assignClientNode?.addEventListener("change", () => {
      selectClient(assignClientNode.value || "");
      renderAssignmentWorkbookPreview();
    });

    assignAthleteProfileNode?.addEventListener("change", () => {
      toggleAthleteCalculatorGroups();
      renderAssignmentWorkbookPreview();
    });

    assignForm?.addEventListener("input", (event) => {
      const targetName = String(event?.target?.name || "").trim();
      if (TRAINING_WORKBOOK_INPUT_FIELDS.has(targetName)) {
        state.trainingWorkbook.dirty = true;
      }
      renderAssignmentWorkbookPreview();
    });

    assignForm?.addEventListener("change", (event) => {
      const targetName = String(event?.target?.name || "").trim();
      if (TRAINING_WORKBOOK_INPUT_FIELDS.has(targetName)) {
        state.trainingWorkbook.dirty = true;
      }
      renderAssignmentWorkbookPreview();
    });

    nutritionClientNode?.addEventListener("change", () => {
      state.nutritionWizard.manualTargetFields.clear();
      state.nutritionWizard.habitsDirty = false;
      state.nutritionWizard.mealPlanDirty = false;
      state.nutritionWizard.activeMealDayId = "";
      renderNutritionAssignmentOptions(deriveWorkspace());
      ensureNutritionWorkbookState({
        forceTargets: true,
        forceHabits: true,
        forceMealPlan: true,
      });
      renderNutritionWizardPreview();
    });

    scheduleCheckinClientNode?.addEventListener("change", () => {
      renderNutritionAssignmentOptions(deriveWorkspace());
    });

    foodSearchButton?.addEventListener("click", () => {
      searchFoodLibrary(foodSearchNode?.value || "").catch(() => null);
    });

    foodSearchNode?.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        searchFoodLibrary(foodSearchNode.value || "").catch(() => null);
      }
    });

    exerciseSearchButton?.addEventListener("click", () => {
      searchExerciseLibrary(exerciseSearchNode?.value || "").catch(() => null);
    });

    exerciseSearchNode?.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        searchExerciseLibrary(exerciseSearchNode.value || "").catch(() => null);
      }
    });

    exerciseForm?.addEventListener("reset", () => {
      window.setTimeout(() => {
        resetExerciseBuilder();
      }, 0);
    });

    checkinCadenceNode?.addEventListener("change", () => {
      const cadence = checkinCadenceNode.value || "weekly";
      if (checkinFormTypeNode) {
        checkinFormTypeNode.value = cadence === "daily" ? "daily_adherence" : "weekly_checkin";
      }
      state.checkinQuestions = createDefaultQuestionSet(cadence);
      renderQuestionBuilder();
    });

    window.addEventListener("focus", () => {
      queueRefresh();
    });

    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) {
        queueRefresh();
      }
    });
  }

  async function init() {
    state.builderDays = [createEmptyDay(1)];
    state.nutritionHabits = [createEmptyHabit(1)];
    state.mealPlanDays = createDefaultMealPlanDays();
    state.checkinQuestions = createDefaultQuestionSet("weekly");
    state.foodServings = [createEmptyFoodServing(1)];
    state.recipeIngredients = [];
    renderBuilderDays();
    renderHabitBuilder();
    renderMealPlanBuilder();
    renderQuestionBuilder();
    renderFoodServingBuilder();
    renderRecipeIngredientBuilder();
    renderFoodLibraryResults();
    renderRecipeLibrary(deriveWorkspace());
    renderExerciseLibraryResults();
    syncTemplateBuilderMode();
    toggleAthleteCalculatorGroups();
    bindEvents();
    setActiveTrainingWizardStep(state.trainingWizard.activeStep);
    setActiveNutritionWizardStep(state.nutritionWizard.activeStep);
    setActivePanel(resolvePanelKey(state.activePanel));
    if (assignStartDateNode) {
      assignStartDateNode.value = getTodayDateOnly();
    }
    if (bulkAssignStartDateNode) {
      bulkAssignStartDateNode.value = getTodayDateOnly();
    }
    if (nutritionStartDateNode) {
      nutritionStartDateNode.value = getTodayDateOnly();
    }
    if (scheduleCheckinDueNode) {
      scheduleCheckinDueNode.value = formatDateTimeLocalInput(new Date(Date.now() + 2 * 86400000));
    }
    renderAssignmentWorkbookPreview();
    ensureNutritionWorkbookState({
      forceTargets: true,
      forceHabits: true,
      forceMealPlan: true,
    });
    renderNutritionWizardPreview();

    try {
      await loadAccessAndClient();
      await fetchCoachOpsPreferences().catch(() => null);
      await fetchPlannerData(false);
      await searchFoodLibrary("");
      await initRealtime();
    } catch (_) {
      // Status already set by the underlying helpers.
    }
  }

  init();
})();
