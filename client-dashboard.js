(function initClientDashboard() {
  const statusNode = document.getElementById("client-dashboard-status");
  const bookingForm = document.getElementById("client-booking-form");
  const bookingFeedbackNode = document.getElementById("client-booking-feedback");
  const packageStoreFeedbackNode = document.getElementById("client-package-store-feedback");
  const memberIdDisplayNode = document.getElementById("client-member-id-display");
  const avatarNode = document.getElementById("client-avatar");
  const displayNameNode = document.getElementById("client-display-name");
  const goalNode = document.getElementById("client-goal");
  const profileChipsNode = document.getElementById("client-profile-chips");
  const activePackageCardsNode = document.getElementById("client-active-package-cards");
  const packageCatalogNode = document.getElementById("client-package-catalog");
  const packageCommitmentSelect = document.getElementById("client-package-commitment");
  const packageFormatSelect = document.getElementById("client-package-format");
  const packageTierSelect = document.getElementById("client-package-tier");
  const packageOptionSelect = document.getElementById("client-package-option");
  const packageSecondMemberInput = document.getElementById("client-package-second-member-id");
  const packagePurchaseButton = document.getElementById("client-package-purchase-button");
  const packageSelectionSummaryNode = document.getElementById("client-package-selection-summary");
  const packageOptionRowsNode = document.getElementById("client-package-option-rows");
  const sharedPackageFieldsNode = document.getElementById("client-shared-package-fields");
  const bookingPackageSelect = document.getElementById("client-booking-package");
  const bookingDateInput = bookingForm?.querySelector("[name='sessionDate']") || null;
  const bookingTimeInput = document.getElementById("client-booking-time");
  const bookingCalendarNode = document.getElementById("client-booking-calendar");
  const bookingRequestToggleButton = document.getElementById("client-booking-request-toggle");
  const bookingRequestPanelNode = document.getElementById("client-booking-request-panel");
  const scheduleRowsNode = document.getElementById("client-schedule-rows");
  const coachAvailabilityCalendarNode = document.getElementById("client-coach-availability-calendar");
  const coachAvailabilityFallbackNode = document.getElementById("client-coach-availability-fallback");
  const coachAvailabilityRowsNode = document.getElementById("client-coach-availability-rows");
  const coachAvailabilityFeedbackNode = document.getElementById("client-coach-availability-feedback");
  const confirmedSessionRowsNode = document.getElementById("client-confirmed-session-rows");
  const sessionChangeForm = document.getElementById("client-session-change-form");
  const sessionChangeFeedbackNode = document.getElementById("client-session-change-feedback");
  const sessionChangeSessionSelect = document.getElementById("client-session-change-session");
  const sessionChangeTypeSelect = document.getElementById("client-session-change-type");
  const sessionChangeDateInput = document.getElementById("client-session-change-date");
  const sessionChangeTimeInput = document.getElementById("client-session-change-time");
  const sessionChangeReasonInput = document.getElementById("client-session-change-reason");
  const sessionChangeTimeFieldsNode = document.getElementById("client-session-change-time-fields");
  const openRequestRowsNode = document.getElementById("client-open-request-rows");
  const purchaseHistoryRowsNode = document.getElementById("client-purchase-history-rows");
  const pointsRowsNode = document.getElementById("client-points-rows");
  const rewardBadgeGridNode = document.getElementById("client-reward-badge-grid");
  const clientLeaderboardRowsNode = document.getElementById("client-leaderboard-rows");
  const homeFocusPanelNode = document.getElementById("client-home-focus-panel");
  const accountEmailNodes = Array.from(document.querySelectorAll("[data-account-email]"));
  const vaultXpNode = document.getElementById("client-vault-xp-bank");
  const vaultXpNoteNode = document.getElementById("client-vault-xp-bank-note");
  const vaultCoinNode = document.getElementById("client-vault-coin-wallet");
  const vaultCoinNoteNode = document.getElementById("client-vault-coin-wallet-note");
  const vaultMomentumNode = document.getElementById("client-vault-weekly-momentum");
  const vaultMomentumNoteNode = document.getElementById("client-vault-weekly-momentum-note");
  const vaultUnlockNode = document.getElementById("client-vault-next-unlock");
  const vaultUnlockNoteNode = document.getElementById("client-vault-next-unlock-note");
  const progressSummaryNode = document.getElementById("client-progress-summary");
  const progressLevelLabelNode = document.getElementById("client-progress-level-label");
  const progressLevelFillNode = document.getElementById("client-progress-level-fill");
  const progressWeekTitleNode = document.getElementById("client-progress-week-title");
  const progressWeekNoteNode = document.getElementById("client-progress-week-note");
  const progressCoinTitleNode = document.getElementById("client-progress-coin-title");
  const progressCoinNoteNode = document.getElementById("client-progress-coin-note");
  const performanceMixNode = document.getElementById("client-performance-mix-list");
  const overviewTrainingBriefNode = document.getElementById("client-overview-training-brief");
  const overviewNutritionBriefNode = document.getElementById("client-overview-nutrition-brief");
  const overviewHealthBriefNode = document.getElementById("client-overview-health-brief");
  const profilePassportNode = document.getElementById("client-profile-passport");
  const profilePassportNameNode = document.getElementById("client-profile-passport-name");
  const profilePassportNoteNode = document.getElementById("client-profile-passport-note");
  const profileNameMainNode = document.getElementById("client-profile-name-main");
  const profileRoleNode = document.getElementById("client-profile-role");
  const profileGoalMainNode = document.getElementById("client-profile-goal-main");
  const profileSummaryMetricsNode = document.getElementById("client-profile-summary-metrics");
  const profileSummaryBarsNode = document.getElementById("client-profile-summary-bars");
  const profilePortraitNode = document.getElementById("client-profile-portrait");
  const profilePortraitNameNode = document.getElementById("client-profile-portrait-name");
  const profilePortraitTaglineNode = document.getElementById("client-profile-portrait-tagline");
  const profilePortraitNoteNode = document.getElementById("client-profile-portrait-note");
  const profileCoinsNode = document.getElementById("client-profile-coins");
  const profileNextUnlockNode = document.getElementById("client-profile-next-unlock");
  const profilePackageBalanceNode = document.getElementById("client-profile-package-balance");
  const profileCoachNode = document.getElementById("client-profile-coach");
  const profileProgressBarsNode = document.getElementById("client-profile-progress-bars");
  const profileSessionRowsNode = document.getElementById("client-profile-session-rows");
  const profileRewardRowsNode = document.getElementById("client-profile-reward-rows");
  const profilePackageSummaryNode = document.getElementById("client-profile-package-summary");
  const profilePurchaseRowsNode = document.getElementById("client-profile-purchase-rows");
  const clientProfileHeroNode = document.querySelector(".profile-hero--client");
  const wearableFeedbackNode = document.getElementById("client-wearables-feedback");
  const wearableShellNode = document.querySelector(".wearable-sync-shell");
  const wearableProviderCardsNode = document.getElementById("client-wearable-provider-cards");
  const wearableSummaryGridNode = document.getElementById("client-wearable-summary-grid");
  const wearableMetricRowsNode = document.getElementById("client-wearable-metric-rows");
  const fitbitCardNode = document.querySelector('[data-provider="fitbit"]');
  const fitbitStatusChipsNode = document.getElementById("client-fitbit-status-chips");
  const fitbitStatusCopyNode = document.getElementById("client-fitbit-status-copy");
  const fitbitAccountNode = document.getElementById("client-fitbit-account");
  const fitbitLastSyncNode = document.getElementById("client-fitbit-last-sync");
  const fitbitLatestSleepNode = document.getElementById("client-fitbit-latest-sleep");
  const fitbitLatestStepsNode = document.getElementById("client-fitbit-latest-steps");
  const fitbitConnectButton = document.getElementById("client-fitbit-connect");
  const fitbitSyncButton = document.getElementById("client-fitbit-sync");
  const fitbitDisconnectButton = document.getElementById("client-fitbit-disconnect");
  const stravaCardNode = document.querySelector('[data-provider="strava"]');
  const stravaStatusChipsNode = document.getElementById("client-strava-status-chips");
  const stravaStatusCopyNode = document.getElementById("client-strava-status-copy");
  const stravaAccountNode = document.getElementById("client-strava-account");
  const stravaLastSyncNode = document.getElementById("client-strava-last-sync");
  const stravaLatestDistanceNode = document.getElementById("client-strava-latest-distance");
  const stravaLatestActiveNode = document.getElementById("client-strava-latest-active");
  const stravaConnectButton = document.getElementById("client-strava-connect");
  const stravaSyncButton = document.getElementById("client-strava-sync");
  const stravaDisconnectButton = document.getElementById("client-strava-disconnect");
  const DASHBOARD_PAGE_KEY = document.body?.dataset?.accountPage || "home";
  const settingsTabNodes = Array.from(document.querySelectorAll("[data-client-settings-tab]"));
  const settingsPanelNodes = Array.from(document.querySelectorAll("[data-client-settings-panel]"));
  const DASHBOARD_CACHE_KEY = "legacy-client-dashboard-cache:v4";
  const DASHBOARD_CACHE_TTL_MS = 90 * 1000;
  const DASHBOARD_REFRESH_DEBOUNCE_MS = 180;
  const CLIENT_HOME_SNAPSHOT_MAX_AGE_MS = 10 * 60 * 1000;
  const CLIENT_SETTINGS_PANEL_KEYS = new Set(["portrait", "wearables", "account", "security"]);
  const CLIENT_REALTIME_TABLES = [
    "profiles",
    "client_profiles",
    "coach_client_assignments",
    "client_packages",
    "orders",
    "order_items",
    "points_ledger",
    "package_catalog",
    "sessions",
    "booking_requests",
    "session_change_requests",
    "coach_availability_windows",
  ];
  const CLIENT_DEFERRED_SECONDARY_PAGES = new Set(["home"]);
  const CLIENT_DEFERRED_PLANNER_PAGES = new Set(["home"]);

  const dashboardState = {
    access: null,
    supabase: null,
    assignment: null,
    data: null,
    desiredPackageCode: getDesiredPackageCode(),
    purchaseStatus: getPurchaseStatusFromUrl(),
    purchaseInFlight: false,
    packageFilters: {
      commitment: "",
      trainingFormat: "",
      tierCode: "",
      packageCode: "",
    },
    loadInFlight: false,
    refreshTimer: 0,
    pendingRefreshReason: "",
    pendingRefreshSilent: true,
    liveBindingsReady: false,
    realtimeChannel: null,
    realtimeSubscriptionKey: "",
    liveCoachAvailability: null,
    liveCoachAvailabilityKey: "",
    wearables: null,
    loadCycleId: 0,
    pendingPlannerHydration: false,
    pendingLeaderboardHydration: false,
  };

  function normalizeClientSettingsPanelKey(value) {
    const normalized = String(value || "").trim().toLowerCase();
    return CLIENT_SETTINGS_PANEL_KEYS.has(normalized) ? normalized : "portrait";
  }

  function getInitialClientSettingsPanel() {
    if (DASHBOARD_PAGE_KEY !== "settings") {
      return "portrait";
    }

    const url = new URL(window.location.href);
    const panelFromQuery = String(url.searchParams.get("panel") || "").trim().toLowerCase();
    const panelFromHash = String(url.hash || "").replace(/^#/, "").trim().toLowerCase();
    if (CLIENT_SETTINGS_PANEL_KEYS.has(panelFromQuery)) {
      return panelFromQuery;
    }
    if (CLIENT_SETTINGS_PANEL_KEYS.has(panelFromHash)) {
      return panelFromHash;
    }
    if (String(url.searchParams.get("wearable") || "").trim()) {
      return "wearables";
    }

    return "portrait";
  }

  function setActiveClientSettingsPanel(panelKey) {
    const activeKey = normalizeClientSettingsPanelKey(panelKey);
    settingsTabNodes.forEach((tabNode) => {
      const isActive = tabNode.dataset.clientSettingsTab === activeKey;
      tabNode.classList.toggle("is-active", isActive);
      tabNode.setAttribute("aria-pressed", String(isActive));
    });
    settingsPanelNodes.forEach((panelNode) => {
      const isActive = panelNode.dataset.clientSettingsPanel === activeKey;
      panelNode.classList.toggle("is-active", isActive);
      panelNode.hidden = !isActive;
      panelNode.setAttribute("aria-hidden", String(!isActive));
    });
  }

  const CLIENT_PROFILE_COLLECTION_PALETTES = {
    legends: {
      glow: "rgba(255, 144, 68, 0.34)",
      glowTwo: "rgba(255, 205, 138, 0.28)",
      fillGradient: "linear-gradient(90deg, #ffe1b5 0%, #ff9b57 52%, #e85f31 100%)",
      fillShadow: "0 0 24px rgba(255, 141, 67, 0.26)",
      accentText: "#ffc791",
    },
    titans: {
      glow: "rgba(210, 168, 109, 0.32)",
      glowTwo: "rgba(241, 221, 183, 0.22)",
      fillGradient: "linear-gradient(90deg, #f1e1bf 0%, #d4a86b 52%, #8f6941 100%)",
      fillShadow: "0 0 24px rgba(210, 168, 109, 0.22)",
      accentText: "#e8cfaa",
    },
    v3: {
      glow: "rgba(214, 92, 70, 0.3)",
      glowTwo: "rgba(233, 194, 130, 0.24)",
      fillGradient: "linear-gradient(90deg, #f7ddbe 0%, #d9695d 46%, #8c2c3a 100%)",
      fillShadow: "0 0 24px rgba(214, 92, 70, 0.24)",
      accentText: "#f0c9ba",
    },
    v4: {
      glow: "rgba(98, 212, 221, 0.28)",
      glowTwo: "rgba(133, 171, 255, 0.24)",
      fillGradient: "linear-gradient(90deg, #defcff 0%, #7ed9e7 46%, #7a95ff 100%)",
      fillShadow: "0 0 24px rgba(110, 196, 236, 0.22)",
      accentText: "#baeefd",
    },
    chinese: {
      glow: "rgba(84, 208, 156, 0.3)",
      glowTwo: "rgba(218, 198, 118, 0.22)",
      fillGradient: "linear-gradient(90deg, #defbe8 0%, #63d8aa 46%, #c9a851 100%)",
      fillShadow: "0 0 24px rgba(99, 216, 170, 0.2)",
      accentText: "#bdeece",
    },
    western: {
      glow: "rgba(152, 133, 255, 0.28)",
      glowTwo: "rgba(120, 200, 255, 0.22)",
      fillGradient: "linear-gradient(90deg, #ece6ff 0%, #9b8bff 48%, #76c9ff 100%)",
      fillShadow: "0 0 24px rgba(152, 133, 255, 0.22)",
      accentText: "#d8d1ff",
    },
  };

  function setBusyButtonState(button, busyLabel) {
    if (!(button instanceof HTMLButtonElement)) {
      return () => {};
    }

    const originalHtml = button.innerHTML;
    button.disabled = true;
    if (busyLabel) {
      button.textContent = busyLabel;
    }

    return () => {
      button.disabled = false;
      button.innerHTML = originalHtml;
    };
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

  const bookingTimeOptionsFallbackMarkup = bookingTimeInput?.innerHTML || "";
  const sessionChangeTimeOptionsFallbackMarkup = sessionChangeTimeInput?.innerHTML || "";

  function buildEmptyDashboardData() {
    return {
      access: dashboardState.access || null,
      profile: null,
      clientProfile: null,
      assignment: null,
      packages: [],
      packageCatalog: [],
      orders: [],
      orderItems: [],
      homeSummary: null,
      clientLeaderboard: [],
      sessions: [],
      bookingRequests: [],
      sessionChangeRequests: [],
      pointsLedger: [],
      coachProfiles: [],
      coachAvailabilityWindows: [],
      plannerSnapshot: null,
    };
  }

  function mergeDashboardData(nextData, previousData) {
    return {
      ...buildEmptyDashboardData(),
      ...(previousData || {}),
      ...(nextData || {}),
    };
  }

  function getDesiredPackageCode() {
    const params = new URLSearchParams(window.location.search);
    const intent = String(params.get("intent") || "").trim();
    const packageCode = String(params.get("package") || "").trim();
    return intent === "buy-package" ? packageCode : "";
  }

  function getPurchaseStatusFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return String(params.get("purchase") || "").trim();
  }

  function setFeedbackState(node, message, tone) {
    if (!node) {
      return;
    }

    node.textContent = message || "";
    node.classList.remove("error", "success");

    if (tone === "error") {
      node.classList.add("error");
    } else if (tone === "success") {
      node.classList.add("success");
    }
  }

  function setStatus(message, isError) {
    setFeedbackState(statusNode, message, isError ? "error" : "");
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

  function buildSkeletonStat(valueWidth = "62%", noteWidths = ["100%", "72%"]) {
    return {
      value: buildSkeletonLine(valueWidth, "value"),
      note: buildSkeletonStack(noteWidths, "copy"),
    };
  }

  function buildSkeletonTableRows(labels, rowCount = 3) {
    return Array.from({ length: rowCount }, () => `
      <tr>
        ${labels.map((label, index) => `
          <td class="dashboard-table__skeleton-cell" data-label="${escapeHtml(label)}">
            ${buildSkeletonLine(index === labels.length - 1 ? "72%" : "100%", index === 0 ? "title" : "copy")}
          </td>
        `).join("")}
      </tr>
    `).join("");
  }

  function buildClientLeaderboardSkeleton(rowCount = 3) {
    return Array.from({ length: rowCount }, () => `
      <article class="leaderboard-row">
        <div class="leaderboard-row__rank">${buildSkeletonLine("26px", "metric")}</div>
        <div class="leaderboard-row__avatar" aria-hidden="true">
          <span class="dashboard-skeleton-avatar dashboard-skeleton-avatar--sm"></span>
        </div>
        <div class="leaderboard-row__body">
          <div class="leaderboard-row__head">
            <strong>${buildSkeletonLine("56%", "title")}</strong>
            <span>${buildSkeletonLine("38%", "label")}</span>
          </div>
          ${buildSkeletonStack(["96%", "72%"], "copy")}
        </div>
        <div class="leaderboard-row__metrics">
          <div>
            <span>${buildSkeletonLine("46px", "label")}</span>
            <strong>${buildSkeletonLine("54px", "metric")}</strong>
          </div>
          <div>
            <span>${buildSkeletonLine("58px", "label")}</span>
            <strong>${buildSkeletonLine("46px", "metric")}</strong>
          </div>
        </div>
      </article>
    `).join("");
  }

  function buildPlannerBriefSkeleton() {
    return `
      <div class="dashboard-skeleton-card dashboard-skeleton-card--brief">
        <div class="dashboard-skeleton-stack dashboard-skeleton-stack--compact">
          ${buildSkeletonLine("44%", "label")}
          ${buildSkeletonLine("62%", "title")}
          ${buildSkeletonStack(["100%", "84%"], "copy")}
        </div>
        <div class="dashboard-skeleton-grid dashboard-skeleton-grid--two">
          <div class="dashboard-skeleton-stack dashboard-skeleton-stack--compact">
            ${buildSkeletonLine("46%", "label")}
            ${buildSkeletonLine("72%", "metric")}
          </div>
          <div class="dashboard-skeleton-stack dashboard-skeleton-stack--compact">
            ${buildSkeletonLine("42%", "label")}
            ${buildSkeletonLine("64%", "metric")}
          </div>
          <div class="dashboard-skeleton-stack dashboard-skeleton-stack--compact">
            ${buildSkeletonLine("38%", "label")}
            ${buildSkeletonLine("70%", "metric")}
          </div>
          <div class="dashboard-skeleton-stack dashboard-skeleton-stack--compact">
            ${buildSkeletonLine("48%", "label")}
            ${buildSkeletonLine("58%", "metric")}
          </div>
        </div>
        ${buildSkeletonStack(["94%", "68%"], "copy")}
      </div>
    `;
  }

  function buildOwnedPackageSkeleton(count = 2) {
    return Array.from({ length: count }, () => `
      <article class="package-card package-card--owned dashboard-skeleton-card dashboard-skeleton-card--package" data-crm-tone="neutral">
        <div class="dashboard-skeleton-stack dashboard-skeleton-stack--compact">
          ${buildSkeletonLine("34%", "label")}
          ${buildSkeletonLine("78%", "title")}
        </div>
        <div class="dashboard-skeleton-inline-row">
          ${buildSkeletonLine("28%", "chip")}
          ${buildSkeletonLine("22%", "chip")}
          ${buildSkeletonLine("24%", "chip")}
        </div>
        <div class="dashboard-skeleton-grid dashboard-skeleton-grid--three">
          <div class="dashboard-skeleton-stack dashboard-skeleton-stack--compact">
            ${buildSkeletonLine("56%", "label")}
            ${buildSkeletonLine("68%", "metric")}
          </div>
          <div class="dashboard-skeleton-stack dashboard-skeleton-stack--compact">
            ${buildSkeletonLine("44%", "label")}
            ${buildSkeletonLine("58%", "metric")}
          </div>
          <div class="dashboard-skeleton-stack dashboard-skeleton-stack--compact">
            ${buildSkeletonLine("62%", "label")}
            ${buildSkeletonLine("52%", "metric")}
          </div>
        </div>
      </article>
    `).join("");
  }

  function buildPerformanceSkeletonRows(count = 3) {
    return Array.from({ length: count }, () => `
      <article class="client-performance-row client-performance-row--skeleton">
        <div class="client-performance-row__head">
          <span>${buildSkeletonLine("48%", "label")}</span>
          <strong>${buildSkeletonLine("56px", "metric")}</strong>
        </div>
        <div class="metric-bar-track metric-bar-track--skeleton">
          ${buildSkeletonLine("72%", "copy")}
        </div>
      </article>
    `).join("");
  }

  function renderInitialDashboardSkeleton() {
    if (DASHBOARD_PAGE_KEY !== "home") {
      return;
    }

    const sessionStat = buildSkeletonStat("52%", ["92%", "68%"]);
    const bookingStat = buildSkeletonStat("66%", ["100%", "74%"]);
    const pointsStat = buildSkeletonStat("64%", ["96%", "62%"]);
    const purchaseStat = buildSkeletonStat("54%", ["92%", "70%"]);

    const statSessionsNode = document.getElementById("client-stat-sessions");
    const statSessionsNoteNode = document.getElementById("client-stat-sessions-note");
    const statBookingsNode = document.getElementById("client-stat-bookings");
    const statBookingsNoteNode = document.getElementById("client-stat-bookings-note");
    const statPointsNode = document.getElementById("client-stat-points");
    const statPointsNoteNode = document.getElementById("client-stat-points-note");
    const statPurchasesNode = document.getElementById("client-stat-purchases");
    const statPurchasesNoteNode = document.getElementById("client-stat-purchases-note");

    if (statSessionsNode) statSessionsNode.innerHTML = sessionStat.value;
    if (statSessionsNoteNode) statSessionsNoteNode.innerHTML = sessionStat.note;
    if (statBookingsNode) statBookingsNode.innerHTML = bookingStat.value;
    if (statBookingsNoteNode) statBookingsNoteNode.innerHTML = bookingStat.note;
    if (statPointsNode) statPointsNode.innerHTML = pointsStat.value;
    if (statPointsNoteNode) statPointsNoteNode.innerHTML = pointsStat.note;
    if (statPurchasesNode) statPurchasesNode.innerHTML = purchaseStat.value;
    if (statPurchasesNoteNode) statPurchasesNoteNode.innerHTML = purchaseStat.note;

    if (overviewTrainingBriefNode) {
      overviewTrainingBriefNode.innerHTML = buildPlannerBriefSkeleton();
    }
    if (overviewNutritionBriefNode) {
      overviewNutritionBriefNode.innerHTML = buildPlannerBriefSkeleton();
    }
    if (overviewHealthBriefNode) {
      overviewHealthBriefNode.innerHTML = buildPlannerBriefSkeleton();
    }
    if (activePackageCardsNode) {
      activePackageCardsNode.innerHTML = buildOwnedPackageSkeleton(2);
    }
    if (scheduleRowsNode) {
      scheduleRowsNode.innerHTML = buildSkeletonTableRows(["Date", "Time", "Type", "Coach", "Status"], 3);
    }
    if (performanceMixNode) {
      performanceMixNode.innerHTML = buildPerformanceSkeletonRows(3);
    }
    if (clientLeaderboardRowsNode) {
      clientLeaderboardRowsNode.innerHTML = buildClientLeaderboardSkeleton(3);
    }
  }

  function setBookingFeedback(message, isError) {
    setFeedbackState(bookingFeedbackNode, message, isError ? "error" : "");
  }

  function setCoachAvailabilityFeedback(message, isError) {
    setFeedbackState(coachAvailabilityFeedbackNode, message, isError ? "error" : "");
  }

  function setBookingRequestPanelOpen(isOpen, options = {}) {
    if (!(bookingRequestPanelNode instanceof HTMLElement) || !(bookingRequestToggleButton instanceof HTMLButtonElement)) {
      return;
    }

    const open = Boolean(isOpen);
    bookingRequestPanelNode.hidden = !open;
    bookingRequestToggleButton.setAttribute("aria-expanded", open ? "true" : "false");
    bookingRequestToggleButton.textContent = open ? "Hide Specific Slot Request" : "Request A Specific Day And Time";

    if (open && options.scrollIntoView) {
      bookingRequestPanelNode.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function buildStackedStatMarkup(rows) {
    return `
      <span class="crm-stat__value-stack">
        ${(rows || [])
          .map(
            (row) => `
              <span class="crm-stat__value-line">
                <strong>${escapeHtml(row.value)}</strong>
                <small>${escapeHtml(row.label)}</small>
              </span>
            `
          )
          .join("")}
      </span>
    `;
  }

  function resolveClientAvatarUrl(data, displayName) {
    if (window.resolveLegacyAccountAvatar) {
      return window.resolveLegacyAccountAvatar({
        avatarUrl: data.profile?.avatar_url || "",
        email: data.access?.user?.email || "",
        displayName,
      });
    }

    return String(data.profile?.avatar_url || "").trim();
  }

  function resolveLeaderboardAvatarUrl(entry) {
    if (window.resolveLegacyAccountAvatar) {
      return window.resolveLegacyAccountAvatar({
        avatarUrl: entry?.avatarUrl || entry?.avatar_url || "",
        displayName: entry?.displayName || entry?.display_name || "",
        email: entry?.email || "",
      });
    }

    return String(entry?.avatarUrl || entry?.avatar_url || "").trim();
  }

  function normalizeAvatarPath(value) {
    return String(value || "")
      .trim()
      .replace(/\\/gu, "/")
      .replace(/CRM pictures/gu, "CRM Pictures");
  }

  function getClientAvatarPreset(avatarUrl) {
    const normalized = normalizeAvatarPath(avatarUrl);
    if (!normalized || !Array.isArray(window.legacyAccountAvatarCatalog)) {
      return null;
    }

    return (
      window.legacyAccountAvatarCatalog.find((preset) => normalizeAvatarPath(preset?.image) === normalized) || null
    );
  }

  function applyClientProfilePalette(node, avatarPreset) {
    if (!(node instanceof HTMLElement)) {
      return;
    }

    const palette = CLIENT_PROFILE_COLLECTION_PALETTES[avatarPreset?.collectionId] || null;
    const properties = [
      "--profile-card-glow",
      "--profile-card-glow-2",
      "--profile-fill-gradient",
      "--profile-fill-shadow",
      "--profile-accent-text",
    ];

    properties.forEach((property) => node.style.removeProperty(property));

    if (!palette) {
      delete node.dataset.avatarCollection;
      return;
    }

    node.style.setProperty("--profile-card-glow", palette.glow);
    node.style.setProperty("--profile-card-glow-2", palette.glowTwo);
    node.style.setProperty("--profile-fill-gradient", palette.fillGradient);
    node.style.setProperty("--profile-fill-shadow", palette.fillShadow);
    node.style.setProperty("--profile-accent-text", palette.accentText);
    node.dataset.avatarCollection = avatarPreset.collectionId || "";
  }

  function setSessionChangeFeedback(message, isError) {
    setFeedbackState(sessionChangeFeedbackNode, message, isError ? "error" : "");
  }

  function setPackageStoreFeedback(message, tone) {
    setFeedbackState(packageStoreFeedbackNode, message, tone);
  }

  function setWearableFeedback(message, tone) {
    setFeedbackState(wearableFeedbackNode, message, tone);
  }

  function readDashboardCache(userId) {
    if (!userId) {
      return null;
    }

    try {
      const raw = window.sessionStorage.getItem(DASHBOARD_CACHE_KEY);
      if (!raw) {
        return null;
      }

      const parsed = JSON.parse(raw);
      if (!parsed?.userId || parsed.userId !== userId || !parsed.data) {
        return null;
      }

      const cachedAt = Number(parsed.cachedAt || 0);
      if (!cachedAt || Date.now() - cachedAt > DASHBOARD_CACHE_TTL_MS) {
        window.sessionStorage.removeItem(DASHBOARD_CACHE_KEY);
        return null;
      }

      return parsed.data;
    } catch (_) {
      window.sessionStorage.removeItem(DASHBOARD_CACHE_KEY);
      return null;
    }
  }

  function writeDashboardCache(userId, data) {
    if (!userId || !data) {
      return;
    }

    try {
      window.sessionStorage.setItem(
        DASHBOARD_CACHE_KEY,
        JSON.stringify({
          userId,
          cachedAt: Date.now(),
          data,
        })
      );
    } catch (_) {
      // Ignore cache write failures.
    }
  }

  function shouldDeferSecondaryPayload() {
    return CLIENT_DEFERRED_SECONDARY_PAGES.has(DASHBOARD_PAGE_KEY);
  }

  function shouldHydratePlannerAfterPaint() {
    return CLIENT_DEFERRED_PLANNER_PAGES.has(DASHBOARD_PAGE_KEY);
  }

  function scheduleAfterInitialPaint(task) {
    const runner = () => {
      window.setTimeout(() => {
        Promise.resolve()
          .then(task)
          .catch(() => null);
      }, 0);
    };

    if (typeof window.requestAnimationFrame === "function") {
      window.requestAnimationFrame(() => runner());
      return;
    }

    runner();
  }

  function queueDeferredDashboardRefresh(reason, silent) {
    dashboardState.pendingRefreshReason = reason || dashboardState.pendingRefreshReason || "live-update";
    dashboardState.pendingRefreshSilent = dashboardState.pendingRefreshSilent && silent !== false;
  }

  function clearScheduledDashboardRefresh() {
    if (!dashboardState.refreshTimer) {
      return;
    }

    window.clearTimeout(dashboardState.refreshTimer);
    dashboardState.refreshTimer = 0;
  }

  function scheduleDashboardRefresh(reason, options) {
    const config = options || {};
    const silent = config.silent !== false;
    const delay = Number.isFinite(config.delay) ? Number(config.delay) : DASHBOARD_REFRESH_DEBOUNCE_MS;

    if (dashboardState.loadInFlight) {
      queueDeferredDashboardRefresh(reason, silent);
      return;
    }

    clearScheduledDashboardRefresh();
    dashboardState.refreshTimer = window.setTimeout(() => {
      dashboardState.refreshTimer = 0;
      void loadDashboard({
        silent,
        allowCacheFallback: !dashboardState.data,
        reason: reason || "live-update",
      });
    }, Math.max(0, delay));
  }

  function teardownRealtimeDashboardRefresh() {
    if (!dashboardState.realtimeChannel || !dashboardState.supabase?.removeChannel) {
      dashboardState.realtimeChannel = null;
      dashboardState.realtimeSubscriptionKey = "";
      return;
    }

    dashboardState.supabase.removeChannel(dashboardState.realtimeChannel).catch(() => null);
    dashboardState.realtimeChannel = null;
    dashboardState.realtimeSubscriptionKey = "";
  }

  async function setupRealtimeDashboardRefresh() {
    const { access, supabase } = await loadAccessAndClient();
    const subscriptionKey = `${access.user.id}:${DASHBOARD_PAGE_KEY}:${CLIENT_REALTIME_TABLES.join(",")}`;
    if (dashboardState.realtimeSubscriptionKey === subscriptionKey && dashboardState.realtimeChannel) {
      return;
    }

    teardownRealtimeDashboardRefresh();

    let channel = supabase.channel(`legacy-client-live:${DASHBOARD_PAGE_KEY}:${access.user.id}`);
    CLIENT_REALTIME_TABLES.forEach((table) => {
      channel = channel.on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table,
        },
        (payload) => {
          scheduleDashboardRefresh(`${table}:${payload?.eventType || "change"}`, {
            silent: true,
            delay: 120,
          });
        }
      );
    });

    channel.subscribe((status) => {
      if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        setStatus("Live sync disconnected. Retrying in the background...", true);
        dashboardState.realtimeChannel = null;
        dashboardState.realtimeSubscriptionKey = "";
        scheduleDashboardRefresh("realtime-reconnect", {
          silent: true,
          delay: 400,
        });
      }
    });

    dashboardState.realtimeChannel = channel;
    dashboardState.realtimeSubscriptionKey = subscriptionKey;
  }

  function bindLiveDashboardEvents() {
    if (dashboardState.liveBindingsReady) {
      return;
    }

    window.addEventListener("focus", () => {
      scheduleDashboardRefresh("window-focus", {
        silent: true,
        delay: 0,
      });
    });

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState !== "visible") {
        return;
      }

      scheduleDashboardRefresh("document-visible", {
        silent: true,
        delay: 0,
      });
    });

    window.addEventListener("pagehide", () => {
      clearScheduledDashboardRefresh();
      teardownRealtimeDashboardRefresh();
    });

    dashboardState.liveBindingsReady = true;
  }

  function setTone(node, tone) {
    const card = node?.closest("[data-crm-tone], .stat, .card, .account-quick-card, .dashboard-note, .package-card, .section");
    if (!card) {
      return;
    }

    if (tone) {
      card.setAttribute("data-crm-tone", tone);
    } else {
      card.removeAttribute("data-crm-tone");
    }
  }

  function formatCurrency(value) {
    const amount = Number(value || 0);
    const isWholeAmount = Number.isInteger(amount);
    return new Intl.NumberFormat("en-MY", {
      style: "currency",
      currency: "MYR",
      minimumFractionDigits: isWholeAmount ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  function formatDate(value) {
    if (!value) {
      return "Not set";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return new Intl.DateTimeFormat("en-MY", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  }

  function formatShortDate(value) {
    if (!value) {
      return "Not set";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return new Intl.DateTimeFormat("en-MY", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  }

  function formatDateTime(value) {
    if (!value) {
      return "Awaiting confirmation";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return new Intl.DateTimeFormat("en-MY", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  }

  function getLegacyCodexBundle() {
    const bundle = window.LEGACY_CODEX_BUNDLE;
    return bundle && typeof bundle === "object" ? bundle : null;
  }

  function getGamificationConfig() {
    const bundle = getLegacyCodexBundle();
    const rulesEngine = bundle?.contents?.rulesEngine;
    const actions = Array.isArray(rulesEngine?.actions) ? rulesEngine.actions : [];
    if (!rulesEngine || !actions.length) {
      return null;
    }

    return {
      bundleVersion: bundle.bundleVersion || "",
      metadata: rulesEngine.metadata || {},
      settings: rulesEngine.settings || {},
      xpCurve: rulesEngine.xpCurve || {},
      actions,
      actionsById: new Map(actions.map((action) => [action.actionId, action])),
    };
  }

  function getRewardActionLabel(action) {
    const rewards = [];
    if (Number(action?.xp || 0) > 0) {
      rewards.push(`${formatMetric(action.xp)} XP`);
    }
    if (Number(action?.coins || 0) > 0) {
      rewards.push(`${formatMetric(action.coins)} Coins`);
    }
    return rewards.length ? rewards.join(" + ") : "No rewards configured";
  }

  function extractActionIdFromRewardReason(reason) {
    const match = String(reason || "").match(/\[([A-Z0-9-]+)\]/u);
    return match ? match[1] : "";
  }

  function calculateBundleLevel(totalXp, xpCurve = {}) {
    const safeXp = Math.max(0, Number(totalXp || 0));
    const maxLevel = Math.max(1, Number(xpCurve.maxLevel || 100));
    const currentLevel = Math.min(maxLevel, Math.floor(Math.sqrt(safeXp)));
    const currentLevelXp = currentLevel * currentLevel;
    const nextLevel = currentLevel >= maxLevel ? maxLevel : currentLevel + 1;
    const nextLevelXp = nextLevel * nextLevel;
    const progressCurrent = currentLevel >= maxLevel ? nextLevelXp : Math.max(0, safeXp - currentLevelXp);
    const progressTarget = currentLevel >= maxLevel ? Math.max(nextLevelXp, 1) : Math.max(1, nextLevelXp - currentLevelXp);
    const progressPercent = currentLevel >= maxLevel ? 100 : Math.max(2, Math.min(100, (progressCurrent / progressTarget) * 100));
    const remainingXp = currentLevel >= maxLevel ? 0 : Math.max(0, nextLevelXp - safeXp);

    return {
      currentLevel,
      nextLevel,
      currentLevelXp,
      nextLevelXp,
      progressCurrent,
      progressTarget,
      progressPercent,
      remainingXp,
    };
  }

  function formatTime(value) {
    if (!value) {
      return "Not set";
    }

    const asDate = new Date(value);
    if (!Number.isNaN(asDate.getTime())) {
      return new Intl.DateTimeFormat("en-MY", {
        hour: "numeric",
        minute: "2-digit",
      }).format(asDate);
    }

    const match = String(value).match(/^(\d{2}):(\d{2})/u);
    if (!match) {
      return String(value);
    }

    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);

    return new Intl.DateTimeFormat("en-MY", {
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  }

  function getInitials(name) {
    const words = String(name || "")
      .trim()
      .split(/\s+/u)
      .filter(Boolean)
      .slice(0, 2);

    if (!words.length) {
      return "--";
    }

    return words.map((word) => word.charAt(0).toUpperCase()).join("");
  }

  function buildAvatarFallbackMarkup(displayName, options = {}) {
    const variant = options.variant === "compact" ? "compact" : "portrait";
    const rawMark = String(options.mark || getInitials(displayName) || "LG")
      .trim()
      .replace(/[^A-Z0-9+]/giu, "");
    const mark = rawMark || "LG";
    const note = String(options.note || (variant === "compact" ? "" : "Portrait pending")).trim();

    return `
      <div class="crm-avatar__fallback crm-avatar__fallback--${variant}" aria-hidden="true">
        <span class="crm-avatar__fallback-mark">${escapeHtml(mark)}</span>
        ${variant === "compact" ? "" : `<span class="crm-avatar__fallback-note">${escapeHtml(note)}</span>`}
      </div>
    `;
  }

  function normalizeStatusLabel(status) {
    return String(status || "pending")
      .replace(/_/gu, " ")
      .replace(/\b\w/gu, (char) => char.toUpperCase());
  }

  function normalizeRequestTypeLabel(value) {
    return value === "cancel" ? "Cancellation" : "Reschedule";
  }

  function compactRequestLabel(value) {
    const source = String(value || "").trim();
    if (!source) {
      return "Coaching";
    }

    return source
      .replace(/strength/giu, "STR")
      .replace(/accountability/giu, "ACC")
      .replace(/mobility/giu, "MOB")
      .replace(/progress review/giu, "Review")
      .replace(/coaching session/giu, "Coaching")
      .replace(/\s*\+\s*/gu, " + ")
      .replace(/\s+/gu, " ")
      .trim();
  }

  function buildStatusPillMarkup(label, tone) {
    return `<span class="crm-status-pill crm-status-pill--${escapeHtml(tone || "gray")}">${escapeHtml(label || "Unknown")}</span>`;
  }

  function dashboardStatusTone(status) {
    switch (String(status || "").toLowerCase()) {
      case "pending":
        return "orange";
      case "approved":
      case "completed":
      case "confirmed":
      case "paid":
      case "active":
        return "green";
      case "scheduled":
      case "rescheduled":
        return "blue";
      case "declined":
      case "cancelled":
      case "canceled":
      case "expired":
      case "failed":
        return "red";
      default:
        return "gray";
    }
  }

  function buildDashboardStatusMarkup(status) {
    return buildStatusPillMarkup(normalizeStatusLabel(status), dashboardStatusTone(status));
  }

  function hasBillingDocument(order, type) {
    if (type === "invoice") {
      return Boolean(order?.invoice_storage_path || order?.invoice_number);
    }
    if (type === "receipt") {
      return Boolean(order?.receipt_storage_path || order?.receipt_number);
    }
    return Boolean(order?.refund_receipt_storage_path || order?.refund_receipt_number);
  }

  function renderBillingDocumentActions(order) {
    const buttons = [];

    if (hasBillingDocument(order, "invoice")) {
      buttons.push(
        `<button class="btn btn-secondary billing-doc-button" type="button" data-order-document="invoice" data-order-id="${escapeHtml(order.id)}">Invoice PDF</button>`
      );
    }

    if (hasBillingDocument(order, "receipt")) {
      buttons.push(
        `<button class="btn btn-secondary billing-doc-button" type="button" data-order-document="receipt" data-order-id="${escapeHtml(order.id)}">Receipt PDF</button>`
      );
    }

    if (hasBillingDocument(order, "refund")) {
      buttons.push(
        `<button class="btn btn-secondary billing-doc-button" type="button" data-order-document="refund" data-order-id="${escapeHtml(order.id)}">Refund PDF</button>`
      );
    }

    if (!buttons.length) {
      return `<span class="billing-doc-empty">Pending</span>`;
    }

    return `<div class="billing-doc-actions">${buttons.join("")}</div>`;
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/gu, "&amp;")
      .replace(/</gu, "&lt;")
      .replace(/>/gu, "&gt;")
      .replace(/"/gu, "&quot;")
      .replace(/'/gu, "&#39;");
  }

  function asObject(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  }

  function getAssignmentSportProfile(assignment) {
    return asObject(asObject(assignment?.custom_targets).sportProfile);
  }

  function getAssignmentWorkbook(assignment) {
    return asObject(asObject(assignment?.custom_targets).workbook);
  }

  function formatDecimalHuman(value, suffix = "") {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) {
      return "";
    }
    return `${(numeric % 1 === 0 ? String(numeric) : numeric.toFixed(1).replace(/\.0$/u, ""))}${suffix}`;
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

  function sumBy(items, key) {
    return items.reduce((total, item) => total + Number(item?.[key] || 0), 0);
  }

  function countBy(items, predicate) {
    return items.reduce((total, item) => total + (predicate(item) ? 1 : 0), 0);
  }

  function parseMetadata(packageRecord) {
    if (!packageRecord?.metadata) {
      return {};
    }

    if (typeof packageRecord.metadata === "string") {
      try {
        return JSON.parse(packageRecord.metadata);
      } catch (_) {
        return {};
      }
    }

    return packageRecord.metadata;
  }

  function formatCommitmentLabel(value) {
    return value === "long_term" ? "Extended" : "Subscription";
  }

  function formatTrainingLabel(value) {
    return value === "one_to_two" ? "1-to-2" : "1-to-1";
  }

  function formatTrainingShortCode(value) {
    return value === "one_to_two" ? "1-2" : "1-1";
  }

  function isSharedPackage(packageRecord) {
    return Boolean(packageRecord?.secondary_client_id);
  }

  function formatCommitmentFilterLabel(value) {
    return formatCommitmentLabel(value);
  }

  function formatCommitmentShortCode(value) {
    return value === "long_term" ? "E.T" : "SUB";
  }

  function resolvePackageSourceName(packageRecord) {
    return String(packageRecord?.package_name || packageRecord?.name || "").trim();
  }

  function inferCommitmentKindFromName(name) {
    return /extended track/iu.test(name) ? "long_term" : "subscription";
  }

  function inferTrainingFormatFromName(name) {
    return /1(?:-|\s*to\s*)2/iu.test(name) ? "one_to_two" : "one_to_one";
  }

  function resolveCommitmentKind(packageRecord, metadata) {
    return String(packageRecord?.commitment_kind || metadata?.commitment_kind || inferCommitmentKindFromName(resolvePackageSourceName(packageRecord)));
  }

  function resolveTrainingFormat(packageRecord, metadata) {
    return String(packageRecord?.training_format || metadata?.training_format || inferTrainingFormatFromName(resolvePackageSourceName(packageRecord)));
  }

  function resolveTierCode(packageRecord, metadata) {
    const directMatch = String(metadata?.tierLabel || packageRecord?.tier_code || "").match(/(\d+)/u);
    if (directMatch) {
      return `T${directMatch[1]}`;
    }

    const tierHaystack = `${metadata?.tierTitle || ""} ${resolvePackageSourceName(packageRecord)}`.toLowerCase();
    if (tierHaystack.includes("apprentice")) {
      return "T1";
    }
    if (tierHaystack.includes("performance coach")) {
      return "T3";
    }
    if (tierHaystack.includes("specialist")) {
      return "T4";
    }
    if (/\bcoach\b/u.test(tierHaystack)) {
      return "T2";
    }

    return "T?";
  }

  function resolveTierThemeKey(packageRecord, metadata) {
    const tierCode = resolveTierCode(packageRecord, metadata);
    switch (tierCode) {
      case "T1":
        return "tier1";
      case "T2":
        return "tier2";
      case "T3":
        return "tier3";
      case "T4":
        return "tier4";
      default:
        return "default";
    }
  }

  function resolvePackageSessionCount(packageRecord) {
    const sessionCount = Number(packageRecord?.sessions_included || packageRecord?.sessions_purchased || 0);
    return Number.isFinite(sessionCount) && sessionCount > 0 ? sessionCount : 0;
  }

  function formatPackageDisplayName(packageRecord) {
    if (!packageRecord) {
      return "Package";
    }

    const metadata = parseMetadata(packageRecord);
    const shortCommitment = formatCommitmentShortCode(resolveCommitmentKind(packageRecord, metadata));
    const shortFormat = formatTrainingShortCode(resolveTrainingFormat(packageRecord, metadata));
    const tierCode = resolveTierCode(packageRecord, metadata);
    const sessionCount = resolvePackageSessionCount(packageRecord);

    return `${shortCommitment} ${shortFormat} (${tierCode})${sessionCount ? ` · ${sessionCount}S` : ""}`;
  }

  function tierSortValue(value) {
    return Number(String(value || "").replace(/[^\d]/gu, "") || 0);
  }

  function sortPackageOptions(items) {
    return items
      .slice()
      .sort((left, right) => {
        const leftTier = tierSortValue(left.tier_code);
        const rightTier = tierSortValue(right.tier_code);
        if (leftTier !== rightTier) {
          return leftTier - rightTier;
        }

        return Number(left.sessions_included || 0) - Number(right.sessions_included || 0);
      });
  }

  function optionMarkup(options, placeholder, currentValue) {
    return [
      `<option value="">${escapeHtml(placeholder)}</option>`,
      ...options.map((option) => {
        const selected = option.value === currentValue ? " selected" : "";
        return `<option value="${escapeHtml(option.value)}"${selected}>${escapeHtml(option.label)}</option>`;
      }),
    ].join("");
  }

  function getVisiblePackageCatalog(data) {
    return (data.packageCatalog || []).filter((item) => {
      const metadata = parseMetadata(item);
      if (!metadata.internalTest) {
        return true;
      }

      return canViewInternalTestPackages(data.access?.user?.email);
    });
  }

  function getSelectionStateFromCatalog(data) {
    const visiblePackages = sortPackageOptions(getVisiblePackageCatalog(data));
    const desiredPackage = visiblePackages.find((item) => item.code === dashboardState.desiredPackageCode) || null;
    const firstPackage = desiredPackage || visiblePackages[0] || null;
    if (!firstPackage) {
      return {
        visiblePackages,
        selectedPackage: null,
        commitmentOptions: [],
        formatOptions: [],
        tierOptions: [],
        packageOptions: [],
      };
    }

    const commitmentValue =
      dashboardState.packageFilters.commitment
      || desiredPackage?.commitment_kind
      || firstPackage.commitment_kind
      || "";

    const commitmentPackages = visiblePackages.filter((item) => item.commitment_kind === commitmentValue);
    const desiredCommitmentPackage = commitmentPackages.find((item) => item.code === desiredPackage?.code) || null;
    const selectedCommitmentFallback = desiredCommitmentPackage || commitmentPackages[0] || firstPackage;
    const trainingValue =
      dashboardState.packageFilters.trainingFormat
      || desiredCommitmentPackage?.training_format
      || selectedCommitmentFallback?.training_format
      || "";

    const trainingPackages = commitmentPackages.filter((item) => item.training_format === trainingValue);
    const desiredTrainingPackage = trainingPackages.find((item) => item.code === desiredPackage?.code) || null;
    const selectedTrainingFallback = desiredTrainingPackage || trainingPackages[0] || selectedCommitmentFallback;
    const tierValue =
      dashboardState.packageFilters.tierCode
      || desiredTrainingPackage?.tier_code
      || selectedTrainingFallback?.tier_code
      || "";

    const tierPackages = trainingPackages.filter((item) => item.tier_code === tierValue);
    const desiredTierPackage = tierPackages.find((item) => item.code === desiredPackage?.code) || null;
    const selectedPackage =
      tierPackages.find((item) => item.code === dashboardState.packageFilters.packageCode)
      || desiredTierPackage
      || tierPackages[0]
      || selectedTrainingFallback
      || firstPackage;

    return {
      visiblePackages,
      selectedPackage,
      commitmentOptions: Array.from(
        new Map(
          visiblePackages.map((item) => [
            item.commitment_kind,
            {
              value: item.commitment_kind,
              label: formatCommitmentFilterLabel(item.commitment_kind),
            },
          ])
        ).values()
      ),
      formatOptions: Array.from(
        new Map(
          commitmentPackages.map((item) => [
            item.training_format,
            {
              value: item.training_format,
              label: formatTrainingLabel(item.training_format),
            },
          ])
        ).values()
      ),
      tierOptions: Array.from(
        new Map(
          trainingPackages.map((item) => {
            const metadata = parseMetadata(item);
            return [
              item.tier_code,
              {
                value: item.tier_code,
                label: metadata.tierTitle || metadata.tierLabel || item.tier_code,
              },
            ];
          })
      ).values()
      ).sort((left, right) => tierSortValue(left.value) - tierSortValue(right.value)),
      packageOptions: tierPackages.map((item) => ({
        value: item.code,
        label: `${Number(item.sessions_included || 0)} sessions | ${formatCurrency(item.price_rm)} | ${item.expiry_days || 0} days`,
      })),
    };
  }

  function canViewInternalTestPackages(email) {
    return String(email || "").trim().toLowerCase().endsWith("@legacycoaching.com.my");
  }

  function toTimestamp(value) {
    if (!value) {
      return Number.NaN;
    }

    return new Date(value).getTime();
  }

  function formatDayOfWeek(dayOfWeek) {
    const labels = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return labels[Number(dayOfWeek)] || "Day";
  }

  function timeStringToMinutes(value) {
    const match = String(value || "").match(/^(\d{2}):(\d{2})/u);
    if (!match) {
      return Number.NaN;
    }

    return Number(match[1]) * 60 + Number(match[2]);
  }

  function requestTypeFromNotes(notes) {
    const firstPart = String(notes || "")
      .split("|")
      .map((part) => part.trim())
      .filter(Boolean)[0];

    if (!firstPart) {
      return "Booking Request";
    }

    return firstPart.replace(/^Session type:\s*/iu, "") || "Booking Request";
  }

  function isPackageExpired(packageRecord) {
    if (!packageRecord?.expires_at) {
      return false;
    }

    const expiresAt = toTimestamp(packageRecord.expires_at);
    return !Number.isNaN(expiresAt) && expiresAt < Date.now();
  }

  function buildReservationCountMap(data) {
    const counts = new Map();

    (data.sessions || []).forEach((session) => {
      if (session.status !== "scheduled" || !session.client_package_id) {
        return;
      }

      counts.set(session.client_package_id, (counts.get(session.client_package_id) || 0) + 1);
    });

    (data.bookingRequests || []).forEach((request) => {
      if (request.status !== "pending" || !request.client_package_id) {
        return;
      }

      counts.set(request.client_package_id, (counts.get(request.client_package_id) || 0) + 1);
    });

    return counts;
  }

  function getReservedCountForPackage(packageRecord, reservationCounts) {
    return Number(reservationCounts.get(packageRecord?.id) || 0);
  }

  function getBookableRemainingForPackage(packageRecord, reservationCounts) {
    const currentRemaining = Number(packageRecord?.sessions_remaining || 0);
    const reservedCount = getReservedCountForPackage(packageRecord, reservationCounts);
    return Math.max(currentRemaining - reservedCount, 0);
  }

  function getBookablePackages(data) {
    const reservationCounts = buildReservationCountMap(data);
    return (data.packages || [])
      .filter((packageRecord) => {
        if (packageRecord.status !== "active") {
          return false;
        }

        if (isPackageExpired(packageRecord)) {
          return false;
        }

        return getBookableRemainingForPackage(packageRecord, reservationCounts) > 0;
      })
      .sort((left, right) => {
        const leftExpiry = toTimestamp(left.expires_at);
        const rightExpiry = toTimestamp(right.expires_at);

        if (Number.isNaN(leftExpiry) && Number.isNaN(rightExpiry)) {
          return toTimestamp(left.created_at) - toTimestamp(right.created_at);
        }

        if (Number.isNaN(leftExpiry)) {
          return 1;
        }

        if (Number.isNaN(rightExpiry)) {
          return -1;
        }

        return leftExpiry - rightExpiry;
      });
  }

  function sortAvailabilityWindows(items) {
    return (items || []).slice().sort((left, right) => {
      const dayDelta = Number(left.day_of_week || 0) - Number(right.day_of_week || 0);
      if (dayDelta !== 0) {
        return dayDelta;
      }

      return timeStringToMinutes(left.start_time) - timeStringToMinutes(right.start_time);
    });
  }

  function availabilityDayKey(dayOfWeek) {
    const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return labels[Number(dayOfWeek)] || "";
  }

  function buildLocalCoachAvailability(data, coachId, coachName) {
    const windows = sortAvailabilityWindows(data?.coachAvailabilityWindows || []);
    if (!windows.length) {
      return null;
    }

    const seen = new Set();
    const slots = windows
      .map((windowRecord) => {
        const day = availabilityDayKey(windowRecord.day_of_week);
        const time = `${formatTime(windowRecord.start_time)} - ${formatTime(windowRecord.end_time)}`;
        const dedupeKey = `${day}|${time}`;
        if (!day || seen.has(dedupeKey)) {
          return null;
        }
        seen.add(dedupeKey);
        return { day, time };
      })
      .filter(Boolean);

    return slots.length
      ? {
          coachId,
          coachName: coachName || getAssignedCoachName(data) || "Coach",
          slots,
        }
      : null;
  }

  function getAssignedCoachName(data) {
    if (!data?.assignment?.coach_id) {
      return "";
    }

    const coachRecord = (data.coachProfiles || []).find((coach) => coach.id === data.assignment.coach_id);
    return String(coachRecord?.display_name || "").trim();
  }

  function getLiveCoachCalendar() {
    const availabilityHelper = window.LEGACY_COACH_AVAILABILITY;
    const liveAvailability = dashboardState.liveCoachAvailability;
    if (!liveAvailability) {
      return null;
    }

    if (liveAvailability.calendar) {
      return liveAvailability.calendar;
    }

    if (availabilityHelper?.normalizeCoachCalendar) {
      return availabilityHelper.normalizeCoachCalendar(liveAvailability, {
        lookaheadDays: 28,
        locale: "en-MY",
      });
    }

    return null;
  }

  function restoreTimeSelectMarkup(selectNode, markup, placeholder) {
    if (!(selectNode instanceof HTMLSelectElement)) {
      return;
    }

    const currentValue = String(selectNode.value || "").trim();
    if (markup) {
      selectNode.innerHTML = markup;
      if (currentValue) {
        selectNode.value = currentValue;
      }
      return;
    }

    selectNode.innerHTML = `<option value="">${escapeHtml(placeholder || "Select time slot")}</option>`;
  }

  function updateTimeSelectFromLiveCalendar(selectNode, dateIso, placeholder, fallbackMarkup, preferredTime) {
    if (!(selectNode instanceof HTMLSelectElement)) {
      return [];
    }

    const availabilityHelper = window.LEGACY_COACH_AVAILABILITY;
    const liveCalendar = getLiveCoachCalendar();
    if (!availabilityHelper || !liveCalendar || !dateIso) {
      restoreTimeSelectMarkup(selectNode, fallbackMarkup, placeholder);
      selectNode.disabled = false;
      if (preferredTime) {
        selectNode.value = preferredTime;
      }
      return [];
    }

    const blocks = availabilityHelper.listAvailableBlocks(liveCalendar, dateIso);
    availabilityHelper.populateTimeSelect(selectNode, blocks, placeholder);
    selectNode.disabled = blocks.length === 0;

    if (preferredTime && blocks.some((block) => String(block.startTime || "") === preferredTime)) {
      selectNode.value = preferredTime;
    }

    return blocks;
  }

  function syncAvailabilityDrivenInputs() {
    updateTimeSelectFromLiveCalendar(
      bookingTimeInput,
      bookingDateInput?.value || "",
      "Select a time slot",
      bookingTimeOptionsFallbackMarkup,
      bookingTimeInput?.value || ""
    );
    updateTimeSelectFromLiveCalendar(
      sessionChangeTimeInput,
      sessionChangeDateInput?.value || "",
      "Select a new time slot",
      sessionChangeTimeOptionsFallbackMarkup,
      sessionChangeTimeInput?.value || ""
    );
  }

  function applyLiveCoachAvailabilitySelection(block) {
    if (!block || !(bookingDateInput instanceof HTMLInputElement) || !(bookingTimeInput instanceof HTMLSelectElement)) {
      return;
    }

    setBookingRequestPanelOpen(true, { scrollIntoView: true });
    bookingDateInput.value = block.dateIso || "";
    updateTimeSelectFromLiveCalendar(
      bookingTimeInput,
      block.dateIso || "",
      "Select a time slot",
      bookingTimeOptionsFallbackMarkup,
      String(block.startTime || "")
    );
    bookingTimeInput.value = String(block.startTime || "");
    setBookingFeedback(`Selected ${formatDate(block.dateIso)} | ${block.label}. Review the request form below and submit when ready.`, false);
    bookingTimeInput.focus({ preventScroll: true });
  }

  async function syncLiveCoachAvailability(data) {
    const availabilityHelper = window.LEGACY_COACH_AVAILABILITY;
    const coachId = String(data?.assignment?.coach_id || "").trim();
    const coachName = getAssignedCoachName(data);
    const availabilityKey = coachId || coachName;
    const localAvailability = buildLocalCoachAvailability(data, coachId, coachName);

    if (!availabilityHelper || (!coachAvailabilityCalendarNode && !bookingCalendarNode)) {
      return;
    }

    if (!availabilityKey) {
      dashboardState.liveCoachAvailability = null;
      dashboardState.liveCoachAvailabilityKey = "";
      renderCoachAvailability(data);
      syncAvailabilityDrivenInputs();
      return;
    }

    try {
      const response = await window.fetch(
        `/.netlify/functions/public-coach-availability?coachId=${encodeURIComponent(coachId)}`
      );
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error || "Unable to load live coach availability.");
      }

      const coaches = payload?.coaches || {};
      const coachEntry = (coachName && coaches[coachName]) || Object.values(coaches)[0] || null;
      dashboardState.liveCoachAvailability = coachEntry
        ? {
            coachId: coachEntry.coachId || coachId,
            coachName: coachName || Object.keys(coaches)[0] || "Coach",
            ...coachEntry,
          }
        : localAvailability;
      dashboardState.liveCoachAvailabilityKey = availabilityKey;
    } catch (_) {
      dashboardState.liveCoachAvailability = localAvailability;
      dashboardState.liveCoachAvailabilityKey = availabilityKey;
    }

    renderCoachAvailability(dashboardState.data || data);
    syncAvailabilityDrivenInputs();
  }

  function sessionDurationMs(session) {
    const start = toTimestamp(session?.scheduled_start);
    const end = toTimestamp(session?.scheduled_end);
    if (Number.isNaN(start) || Number.isNaN(end) || end <= start) {
      return 60 * 60 * 1000;
    }

    return end - start;
  }

  function isWithinCoachAvailability(data, requestedDate, requestedTime) {
    const availabilityHelper = window.LEGACY_COACH_AVAILABILITY;
    const liveCalendar = getLiveCoachCalendar();
    if (availabilityHelper && liveCalendar) {
      return Boolean(availabilityHelper.findMatchingAvailableBlock(liveCalendar, requestedDate, requestedTime));
    }

    const windows = data?.coachAvailabilityWindows || [];
    if (!windows.length) {
      return true;
    }

    const requestDate = new Date(`${requestedDate}T${requestedTime}`);
    if (Number.isNaN(requestDate.getTime())) {
      return false;
    }

    const requestedMinutes = timeStringToMinutes(requestedTime);
    const requestedDay = requestDate.getDay();

    return windows.some((windowRecord) => {
      if (Number(windowRecord.day_of_week) !== requestedDay) {
        return false;
      }

      const startMinutes = timeStringToMinutes(windowRecord.start_time);
      const endMinutes = timeStringToMinutes(windowRecord.end_time);
      return requestedMinutes >= startMinutes && requestedMinutes < endMinutes;
    });
  }

  function sessionChangeStatusBySessionId(data) {
    return (data?.sessionChangeRequests || []).reduce((map, request) => {
      if (request.status === "pending") {
        map.set(request.session_id, request);
      }
      return map;
    }, new Map());
  }

  function syncSessionChangeFormVisibility() {
    if (!sessionChangeTypeSelect || !sessionChangeTimeFieldsNode || !sessionChangeDateInput || !sessionChangeTimeInput) {
      return;
    }

    const isReschedule = String(sessionChangeTypeSelect.value || "reschedule") === "reschedule";
    sessionChangeTimeFieldsNode.hidden = !isReschedule;
    sessionChangeDateInput.required = isReschedule;
    sessionChangeTimeInput.required = isReschedule;
  }

  function prefillSessionChangeForm(sessionId, requestType) {
    if (!sessionChangeSessionSelect || !sessionChangeTypeSelect) {
      return;
    }

    sessionChangeSessionSelect.value = sessionId || "";
    sessionChangeTypeSelect.value = requestType || "reschedule";
    syncSessionChangeFormVisibility();

    if (sessionChangeReasonInput) {
      sessionChangeReasonInput.focus();
    }
  }

  function sortPackageCatalog(items) {
    const commitmentOrder = {
      subscription: 0,
      long_term: 1,
    };
    const trainingOrder = {
      one_to_one: 0,
      one_to_two: 1,
    };

    return items
      .slice()
      .sort((left, right) => {
        if (left.code === dashboardState.desiredPackageCode) {
          return -1;
        }

        if (right.code === dashboardState.desiredPackageCode) {
          return 1;
        }

        const commitmentDelta =
          (commitmentOrder[left.commitment_kind] ?? 99) - (commitmentOrder[right.commitment_kind] ?? 99);
        if (commitmentDelta !== 0) {
          return commitmentDelta;
        }

        const trainingDelta = (trainingOrder[left.training_format] ?? 99) - (trainingOrder[right.training_format] ?? 99);
        if (trainingDelta !== 0) {
          return trainingDelta;
        }

        const leftTier = Number(String(left.tier_code || "").replace(/[^\d]/gu, "") || 0);
        const rightTier = Number(String(right.tier_code || "").replace(/[^\d]/gu, "") || 0);
        if (leftTier !== rightTier) {
          return leftTier - rightTier;
        }

        return Number(left.sessions_included || 0) - Number(right.sessions_included || 0);
      });
  }

  function clearPackageIntentFromUrl() {
    const url = new URL(window.location.href);
    url.searchParams.delete("intent");
    url.searchParams.delete("package");
    url.searchParams.delete("purchase");
    window.history.replaceState({}, "", url.toString());
    dashboardState.desiredPackageCode = "";
    dashboardState.purchaseStatus = "";
  }

  async function loadAccessAndClient() {
    if (!window.legacyAuth || !window.legacyAuth.getSupabaseClient) {
      throw new Error("Auth client is not available on this page.");
    }

    if (dashboardState.access && dashboardState.supabase) {
      return {
        access: dashboardState.access,
        supabase: dashboardState.supabase,
      };
    }

    const access = await window.legacyAuth.requireRole("client");
    if (!access.ok) {
      throw new Error("No client session is active.");
    }

    const supabase = window.legacyAuth.getSupabaseClient();
    if (!supabase) {
      throw new Error("Supabase client is not configured.");
    }

    dashboardState.access = access;
    dashboardState.supabase = supabase;
    return { access, supabase };
  }

  function syncDashboardStateFromData(data) {
    if (data && Object.prototype.hasOwnProperty.call(data, "assignment")) {
      dashboardState.assignment = data.assignment || null;
    }
  }

  function normalizeClientHomeSummaryPayload(summary, clientProfile) {
    const payload = summary && typeof summary === "object" ? summary : {};
    return {
      currentXp: Math.max(0, Number(payload.currentXp ?? clientProfile?.xp_points ?? 0)),
      currentCoins: Math.max(0, Number(payload.currentCoins ?? clientProfile?.gym_coins ?? 0)),
      paidOrdersCount: Math.max(0, Number(payload.paidOrdersCount || 0)),
      totalPurchasesRm: Number(payload.totalPurchasesRm || 0),
      approvedXpEntriesCount: Math.max(0, Number(payload.approvedXpEntriesCount || 0)),
      approvedCoinEntriesCount: Math.max(0, Number(payload.approvedCoinEntriesCount || 0)),
      approvedRewardEntriesCount: Math.max(0, Number(payload.approvedRewardEntriesCount || 0)),
      lifetimeApprovedXp: Math.max(0, Number(payload.lifetimeApprovedXp || 0)),
      lifetimeApprovedCoins: Math.max(0, Number(payload.lifetimeApprovedCoins || 0)),
      weeklyXp: Math.max(0, Number(payload.weeklyXp || 0)),
      weeklyCoins: Math.max(0, Number(payload.weeklyCoins || 0)),
      monthlyXp: Math.max(0, Number(payload.monthlyXp || 0)),
      monthlyCoins: Math.max(0, Number(payload.monthlyCoins || 0)),
      earnedActionIds: Array.isArray(payload.earnedActionIds) ? payload.earnedActionIds.filter(Boolean) : [],
    };
  }

  async function loadClientHomeSummaryDirect(supabase, userId, clientProfile) {
    const snapshotResponse = await supabase
      .from("client_home_snapshots")
      .select("summary, generated_at")
      .eq("client_id", userId)
      .maybeSingle();

    if (snapshotResponse.error) {
      throw snapshotResponse.error;
    }

    const existingRow = snapshotResponse.data || null;
    const existingSummary = normalizeClientHomeSummaryPayload(existingRow?.summary || {}, clientProfile);
    const generatedAt = new Date(existingRow?.generated_at || 0).getTime();
    const hasFreshSnapshot = Number.isFinite(generatedAt)
      && Date.now() - generatedAt <= CLIENT_HOME_SNAPSHOT_MAX_AGE_MS;

    if (existingRow?.summary && hasFreshSnapshot) {
      return existingSummary;
    }

    try {
      const refreshResponse = await supabase.rpc("refresh_client_home_snapshot", {
        p_client_id: userId,
      });

      if (refreshResponse.error) {
        throw refreshResponse.error;
      }

      return normalizeClientHomeSummaryPayload(refreshResponse.data || {}, clientProfile);
    } catch (error) {
      if (existingRow?.summary) {
        return existingSummary;
      }
      throw error;
    }
  }

  function getClientHomeSummary(data) {
    const summary = data?.homeSummary && typeof data.homeSummary === "object" ? data.homeSummary : null;
    if (summary) {
      return normalizeClientHomeSummaryPayload(summary, data?.clientProfile);
    }

    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const monthStart = new Date();
    monthStart.setHours(0, 0, 0, 0);
    monthStart.setDate(1);
    const monthStartTime = monthStart.getTime();
    const approvedEntries = (data?.pointsLedger || []).filter(
      (entry) => entry.approval_status === "approved" || entry.approval_status === "auto_approved"
    );
    const approvedXpEntries = approvedEntries.filter((entry) => entry.points_type === "xp");
    const approvedCoinEntries = approvedEntries.filter((entry) => entry.points_type === "gym_coins");

    return {
      currentXp: Math.max(0, Number(data?.clientProfile?.xp_points || 0)),
      currentCoins: Math.max(0, Number(data?.clientProfile?.gym_coins || 0)),
      paidOrdersCount: (data?.orders || []).filter((order) => order.status === "paid").length,
      totalPurchasesRm: (data?.orders || [])
        .filter((order) => order.status === "paid")
        .reduce((total, order) => total + Number(order.total_amount_rm || 0), 0),
      approvedXpEntriesCount: approvedXpEntries.length,
      approvedCoinEntriesCount: approvedCoinEntries.length,
      approvedRewardEntriesCount: approvedEntries.length,
      lifetimeApprovedXp: approvedXpEntries.reduce((total, entry) => total + Number(entry.delta || 0), 0),
      lifetimeApprovedCoins: approvedCoinEntries.reduce((total, entry) => total + Number(entry.delta || 0), 0),
      weeklyXp: approvedXpEntries.reduce((total, entry) => {
        const createdAt = new Date(entry.created_at || 0).getTime();
        return !Number.isNaN(createdAt) && createdAt >= oneWeekAgo ? total + Number(entry.delta || 0) : total;
      }, 0),
      weeklyCoins: approvedCoinEntries.reduce((total, entry) => {
        const createdAt = new Date(entry.created_at || 0).getTime();
        return !Number.isNaN(createdAt) && createdAt >= oneWeekAgo ? total + Number(entry.delta || 0) : total;
      }, 0),
      monthlyXp: approvedXpEntries.reduce((total, entry) => {
        const createdAt = new Date(entry.created_at || 0).getTime();
        return !Number.isNaN(createdAt) && createdAt >= monthStartTime ? total + Number(entry.delta || 0) : total;
      }, 0),
      monthlyCoins: approvedCoinEntries.reduce((total, entry) => {
        const createdAt = new Date(entry.created_at || 0).getTime();
        return !Number.isNaN(createdAt) && createdAt >= monthStartTime ? total + Number(entry.delta || 0) : total;
      }, 0),
      earnedActionIds: Array.from(
        new Set(
          approvedEntries
            .map((entry) => extractActionIdFromRewardReason(entry.reason))
            .filter(Boolean)
        )
      ),
    };
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

  async function fetchPlannerSnapshot(options = {}) {
    if (!window.legacyAuth?.getAccessToken) {
      return null;
    }

    const accessToken = await window.legacyAuth.getAccessToken();
    if (!accessToken) {
      return null;
    }

    const params = new URLSearchParams();
    if (options.mode) {
      params.set("mode", String(options.mode || "").trim().toLowerCase());
    }

    const requestUrl = params.toString()
      ? `/.netlify/functions/load-planner-data?${params.toString()}`
      : "/.netlify/functions/load-planner-data";

    const response = await window.fetch(requestUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload?.data) {
      throw new Error(payload?.error || "Unable to load the planner snapshot right now.");
    }

    return payload.data;
  }

  async function attachPlannerSnapshot(baseData) {
    const data = baseData && typeof baseData === "object" ? { ...baseData } : buildEmptyDashboardData();
    const shouldLoadPlanner = DASHBOARD_PAGE_KEY === "home" || DASHBOARD_PAGE_KEY === "profile";
    if (!shouldLoadPlanner) {
      data.plannerSnapshot = null;
      return data;
    }

    try {
      data.plannerSnapshot = await fetchPlannerSnapshot();
    } catch (error) {
      console.warn("[LEGACY] Unable to load planner snapshot for dashboard brief.", error);
      data.plannerSnapshot = null;
    }
    return data;
  }

  function derivePlannerOverview(snapshot) {
    const planner = snapshot && typeof snapshot === "object" ? snapshot : {};
    const assignments = Array.isArray(planner.assignments) ? planner.assignments.slice() : [];
    const programDays = Array.isArray(planner.programDays) ? planner.programDays.slice() : [];
    const nutritionPlans = Array.isArray(planner.nutritionPlans) ? planner.nutritionPlans.slice() : [];
    const checkins = Array.isArray(planner.checkins) ? planner.checkins.slice() : [];
    const checkinTemplates = Array.isArray(planner.checkinTemplates) ? planner.checkinTemplates.slice() : [];

    const activeAssignment = assignments.find((assignment) => String(assignment?.status || "").toLowerCase() === "active")
      || assignments[0]
      || null;
    const activeSportProfile = getAssignmentSportProfile(activeAssignment);
    const activeWorkbook = getAssignmentWorkbook(activeAssignment);
    const activeNutrition = nutritionPlans.find((plan) => String(plan?.status || "").toLowerCase() === "active")
      || nutritionPlans[0]
      || null;
    const latestCheckin = checkins
      .slice()
      .sort((left, right) => toTimestamp(right?.submitted_at || right?.due_at) - toTimestamp(left?.submitted_at || left?.due_at))[0]
      || null;
    const todayValue = getTodayDateOnly();
    const sortedDays = programDays
      .slice()
      .sort((left, right) => {
        const leftDate = String(left?.scheduled_date || "");
        const rightDate = String(right?.scheduled_date || "");
        if (leftDate && rightDate && leftDate !== rightDate) {
          return leftDate.localeCompare(rightDate);
        }
        return Number(left?.day_number || 0) - Number(right?.day_number || 0);
      });
    const activeDays = sortedDays.filter((day) => !["completed", "archived"].includes(String(day?.status || "").toLowerCase()));
    const todayDay = activeDays.find((day) => String(day?.scheduled_date || "") === todayValue) || null;
    const nextDay = todayDay
      || activeDays.find((day) => {
        const scheduledDate = String(day?.scheduled_date || "");
        return scheduledDate ? scheduledDate >= todayValue : false;
      })
      || activeDays.find((day) => !day?.scheduled_date)
      || activeDays[0]
      || null;
    const activeHealthTemplate = checkinTemplates
      .slice()
      .sort((left, right) => toTimestamp(right?.updated_at || right?.created_at) - toTimestamp(left?.updated_at || left?.created_at))[0]
      || null;

    return {
      activeAssignment,
      activeSportProfile,
      activeWorkbook,
      activeNutrition,
      activeHealthTemplate,
      latestCheckin,
      todayDay,
      nextDay,
    };
  }

  function buildDashboardWorkbookSummary(workbook) {
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

  function buildDashboardTrainingPairs(overview) {
    const workbook = overview.activeWorkbook;
    if (!workbook?.kind) {
      return [];
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

  function buildDashboardNutritionPairs(workbook, nutrition) {
    if (nutrition) {
      return [
        { label: "Calories", value: nutrition.calories_target ? `${nutrition.calories_target} kcal` : "Coach-set target" },
        { label: "Protein", value: nutrition.protein_target_g ? `${nutrition.protein_target_g} g` : "Coach-set target" },
        { label: "Strategy", value: normalizeStatusLabel(nutrition.strategy || "hybrid") },
      ];
    }

    if (!workbook?.kind) {
      return [];
    }

    if (workbook.kind === "runner") {
      return [
        { label: "CHO target", value: `${formatDecimalHuman(getWorkbookOutput(workbook, "runner_cho_target_min_g_per_kg"))}-${formatDecimalHuman(getWorkbookOutput(workbook, "runner_cho_target_max_g_per_kg"))} g/kg` },
        { label: "Protein target", value: `${formatDecimalHuman(getWorkbookOutput(workbook, "runner_protein_target_min_g_per_kg"))}-${formatDecimalHuman(getWorkbookOutput(workbook, "runner_protein_target_max_g_per_kg"))} g/kg` },
        { label: "Fuel range", value: `${formatDecimalHuman(getWorkbookOutput(workbook, "runner_long_run_fuel_min_g_per_h"))}-${formatDecimalHuman(getWorkbookOutput(workbook, "runner_long_run_fuel_max_g_per_h"))} g/h` },
      ].filter((item) => item.value && !item.value.includes("- g"));
    }

    if (workbook.kind === "hyrox") {
      return [
        { label: "CHO target", value: `${formatDecimalHuman(getWorkbookOutput(workbook, "hyrox_cho_target_min_g_per_kg"))}-${formatDecimalHuman(getWorkbookOutput(workbook, "hyrox_cho_target_max_g_per_kg"))} g/kg` },
        { label: "Protein target", value: `${formatDecimalHuman(getWorkbookOutput(workbook, "hyrox_protein_target_min_g_per_kg"))}-${formatDecimalHuman(getWorkbookOutput(workbook, "hyrox_protein_target_max_g_per_kg"))} g/kg` },
        { label: "Race fuel", value: `${formatDecimalHuman(getWorkbookOutput(workbook, "hyrox_race_fuel_min_g_per_h"))}-${formatDecimalHuman(getWorkbookOutput(workbook, "hyrox_race_fuel_max_g_per_h"))} g/h` },
      ].filter((item) => item.value && !item.value.includes("- g"));
    }

    return [
      { label: "CHO target", value: `${formatDecimalHuman(getWorkbookOutput(workbook, "endurance_cho_target_min_g_per_kg"))}-${formatDecimalHuman(getWorkbookOutput(workbook, "endurance_cho_target_max_g_per_kg"))} g/kg` },
      { label: "Protein target", value: `${formatDecimalHuman(getWorkbookOutput(workbook, "endurance_protein_target_min_g_per_kg"))}-${formatDecimalHuman(getWorkbookOutput(workbook, "endurance_protein_target_max_g_per_kg"))} g/kg` },
      { label: "Event fuel", value: `${formatDecimalHuman(getWorkbookOutput(workbook, "endurance_event_fuel_min_g_per_h"))}-${formatDecimalHuman(getWorkbookOutput(workbook, "endurance_event_fuel_max_g_per_h"))} g/h` },
    ].filter((item) => item.value && !item.value.includes("- g"));
  }

  function buildDashboardHealthPairs(overview) {
    const workbook = overview.activeWorkbook;
    const latestCheckin = overview.latestCheckin;
    const nextDay = overview.nextDay;
    const pairs = [
      { label: "Latest update", value: latestCheckin?.submitted_at ? formatDateTime(latestCheckin.submitted_at) : "Nothing submitted yet" },
      { label: "Review status", value: latestCheckin?.review_status ? normalizeStatusLabel(latestCheckin.review_status) : "No review yet" },
      { label: "Coaching rhythm", value: nextDay ? "Aligned to your live plan" : "Ready once your plan is active" },
    ];

    if (workbook?.readiness?.band) {
      pairs.unshift({ label: "Readiness", value: workbook.readiness.band });
    }
    if (workbook?.readiness?.primaryLimiter) {
      pairs.push({ label: "Primary limiter", value: workbook.readiness.primaryLimiter });
    }
    return pairs.filter((item) => item.value);
  }

  function renderPlannerBrief(data) {
    if (!overviewTrainingBriefNode && !overviewNutritionBriefNode && !overviewHealthBriefNode) {
      return;
    }

    if (dashboardState.pendingPlannerHydration && !data?.plannerSnapshot) {
      if (overviewTrainingBriefNode) {
        overviewTrainingBriefNode.innerHTML = buildPlannerBriefSkeleton();
      }
      if (overviewNutritionBriefNode) {
        overviewNutritionBriefNode.innerHTML = buildPlannerBriefSkeleton();
      }
      if (overviewHealthBriefNode) {
        overviewHealthBriefNode.innerHTML = buildPlannerBriefSkeleton();
      }
      return;
    }

    const overview = derivePlannerOverview(data.plannerSnapshot);
    const nextDay = overview.nextDay;
    const nutrition = overview.activeNutrition;
    const healthTemplate = overview.activeHealthTemplate;
    const latestCheckin = overview.latestCheckin;
    const sportProfile = overview.activeSportProfile;
    const workbook = overview.activeWorkbook;
    const daysToGoal = computeDaysToGoal(sportProfile.goalDate);
    const trainingDayType = nextDay?.day_type ? normalizeStatusLabel(nextDay.day_type) : "";
    const todayValue = getTodayDateOnly();
    const nextDayTiming = nextDay ? getPlannerDayTiming(nextDay, todayValue) : null;
    const isRecoveryDay = ["rest", "recovery", "mobility"].includes(String(nextDay?.day_type || "").toLowerCase());
    const trainingPairs = buildDashboardTrainingPairs(overview);
    const nutritionPairs = buildDashboardNutritionPairs(workbook, nutrition);
    const healthPairs = buildDashboardHealthPairs(overview);

    if (overviewTrainingBriefNode) {
      overviewTrainingBriefNode.innerHTML = nextDay
        ? `
            <div class="client-planner-summary-card">
              <div class="client-planner-card-head">
                <div>
                  <h3>${escapeHtml(resolvePlannerDayTitle(nextDay, todayValue) || "Training day")}</h3>
                  <p>${escapeHtml(nextDay.focus || (isRecoveryDay ? "Recovery and reset." : "Coach focus will appear here."))}</p>
                </div>
              </div>
              <dl class="client-planner-kv-grid">
                <div>
                  <dt>Timing</dt>
                  <dd>${escapeHtml(nextDayTiming?.longLabel || "Next up")}</dd>
                </div>
                <div>
                  <dt>Day type</dt>
                  <dd>${escapeHtml(trainingDayType || "Training")}</dd>
                </div>
                <div>
                  <dt>Date</dt>
                  <dd>${escapeHtml(formatDate(nextDay.scheduled_date))}</dd>
                </div>
                <div>
                  <dt>Week</dt>
                  <dd>${escapeHtml(`Week ${nextDay.week_number || 1}`)}</dd>
                </div>
                <div>
                  <dt>Block</dt>
                  <dd>${escapeHtml(overview.activeAssignment?.title || "No live block")}</dd>
                </div>
                ${trainingPairs.map((item) => `
                  <div>
                    <dt>${escapeHtml(item.label)}</dt>
                    <dd>${escapeHtml(item.value)}</dd>
                  </div>
                `).join("")}
                ${
                  !trainingPairs.length && (sportProfile.primarySport || sportProfile.athleteProfile)
                    ? `
                      <div>
                        <dt>Sport</dt>
                        <dd>${escapeHtml(sportProfile.primarySport || normalizeStatusLabel(sportProfile.athleteProfile))}</dd>
                      </div>
                    `
                    : ""
                }
                ${
                  !trainingPairs.length && (sportProfile.goalEvent || sportProfile.goalFocus)
                    ? `
                      <div>
                        <dt>Goal</dt>
                        <dd>${escapeHtml(sportProfile.goalEvent || sportProfile.goalFocus)}</dd>
                      </div>
                    `
                    : ""
                }
                ${
                  !trainingPairs.length && daysToGoal !== null
                    ? `
                      <div>
                        <dt>Days to goal</dt>
                        <dd>${escapeHtml(String(daysToGoal))}</dd>
                      </div>
                    `
                    : ""
                }
              </dl>
              ${buildDashboardWorkbookSummary(workbook)}
              ${nextDay.notes ? `<p class="client-planner-summary-note">${escapeHtml(nextDay.notes)}</p>` : ""}
            </div>
          `
        : `
            <article class="dashboard-note dashboard-note--placeholder">
              <strong>No live training day yet</strong>
              <p>Your coach has not assigned the next live day yet. Once a block is scheduled, this card will tell you exactly what to expect.</p>
            </article>
          `;
    }

    if (overviewNutritionBriefNode) {
      const nutritionMode = isRecoveryDay ? "Rest / recovery day" : "Training day";
      overviewNutritionBriefNode.innerHTML = nutrition
        ? `
            <div class="client-planner-summary-card">
              <div class="client-planner-card-head">
                <div>
                  <h3>${escapeHtml(nutrition.title || "Nutrition plan")}</h3>
                  <p>${escapeHtml(nutrition.notes || "Your coach’s nutrition intent will appear here.")}</p>
                </div>
              </div>
              <dl class="client-planner-kv-grid">
                <div>
                  <dt>Day type</dt>
                  <dd>${escapeHtml(nutritionMode)}</dd>
                </div>
                ${nutritionPairs.map((item) => `
                  <div>
                    <dt>${escapeHtml(item.label)}</dt>
                    <dd>${escapeHtml(item.value)}</dd>
                  </div>
                `).join("")}
              </dl>
              ${!nutrition && buildDashboardWorkbookSummary(workbook)}
            </div>
          `
        : workbook
          ? `
            <div class="client-planner-summary-card">
              <div class="client-planner-card-head">
                <div>
                  <h3>Nutrition targets</h3>
                  <p>These targets are being generated from your current athlete profile while the dedicated nutrition layer is still being built out.</p>
                </div>
              </div>
              <dl class="client-planner-kv-grid">
                <div>
                  <dt>Day type</dt>
                  <dd>${escapeHtml(nutritionMode)}</dd>
                </div>
                ${nutritionPairs.map((item) => `
                  <div>
                    <dt>${escapeHtml(item.label)}</dt>
                    <dd>${escapeHtml(item.value)}</dd>
                  </div>
                `).join("")}
              </dl>
              ${buildDashboardWorkbookSummary(workbook)}
            </div>
          `
          : `
              <article class="dashboard-note dashboard-note--placeholder">
                <strong>No live nutrition plan yet</strong>
                <p>Your coach has not attached a live nutrition plan yet. Once it is set, this card will show your daily target and food strategy.</p>
              </article>
            `;
    }

    if (overviewHealthBriefNode) {
      overviewHealthBriefNode.innerHTML = healthTemplate || workbook
        ? `
            <div class="client-planner-summary-card">
              <div class="client-planner-card-head">
                <div>
                  <h3>${escapeHtml(healthTemplate?.title || "Health rhythm")}</h3>
                  <p>${escapeHtml(healthTemplate?.description || "Recovery, readiness, sleep, soreness, digestion, and other coaching health signals live here.")}</p>
                </div>
              </div>
              <dl class="client-planner-kv-grid">
                ${
                  healthTemplate
                    ? `
                      <div>
                        <dt>Cadence</dt>
                        <dd>${escapeHtml(normalizeStatusLabel(healthTemplate.cadence || "weekly"))}</dd>
                      </div>
                    `
                    : ""
                }
                ${healthPairs.map((item) => `
                  <div>
                    <dt>${escapeHtml(item.label)}</dt>
                    <dd>${escapeHtml(item.value)}</dd>
                  </div>
                `).join("")}
              </dl>
              ${buildDashboardWorkbookSummary(workbook)}
              ${latestCheckin?.coach_comment ? `<p class="client-planner-summary-note">${escapeHtml(latestCheckin.coach_comment)}</p>` : ""}
            </div>
          `
        : `
            <article class="dashboard-note dashboard-note--placeholder">
              <strong>No live health rhythm yet</strong>
              <p>Your coach has not set the health and recovery cadence yet. Once it is active, this card will show the check-in rhythm and readiness focus.</p>
            </article>
          `;
  }
  }

  async function fetchDashboardDataFromServer(options = {}) {
    const accessToken = await window.legacyAuth?.getAccessToken?.();
    if (!accessToken) {
      throw new Error("Your session expired. Please log in again.");
    }

    const params = new URLSearchParams({
      scope: "client",
      page: DASHBOARD_PAGE_KEY,
    });
    if (options.variant) {
      params.set("variant", String(options.variant || "").trim().toLowerCase());
    }
    const response = await window.fetch(`/.netlify/functions/load-dashboard-data?${params.toString()}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload?.data) {
      throw new Error(payload?.error || "Unable to load your client dashboard data right now.");
    }

    syncDashboardStateFromData(payload.data);
    return payload.data;
  }

  async function openBillingDocument(orderId, documentType) {
    const accessToken = await window.legacyAuth?.getAccessToken?.();
    if (!accessToken) {
      throw new Error("Your session expired. Please log in again.");
    }

    const params = new URLSearchParams({
      orderId,
      document: documentType,
    });
    const response = await window.fetch(`/.netlify/functions/get-billing-document?${params.toString()}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload?.url) {
      throw new Error(payload?.error || "Unable to open the billing document right now.");
    }

    window.open(payload.url, "_blank", "noopener,noreferrer");
  }

  async function fetchAuthenticatedJson(url, options = {}) {
    const accessToken = await window.legacyAuth?.getAccessToken?.();
    if (!accessToken) {
      throw new Error("Your session expired. Please log in again.");
    }

    const response = await window.fetch(url, {
      method: options.method || "GET",
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(options.headers || {}),
        Authorization: `Bearer ${accessToken}`,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload?.error || "Request failed.");
    }

    return payload;
  }

  function consumeWearableIntentFromUrl() {
    const url = new URL(window.location.href);
    const wearableState = String(url.searchParams.get("wearable") || "").trim();
    const message = String(url.searchParams.get("message") || "").trim();
    const synced = String(url.searchParams.get("synced") || "").trim();

    ["wearable", "message", "synced"].forEach((key) => url.searchParams.delete(key));
    window.history.replaceState({}, "", url.toString());

    if (wearableState === "fitbit-connected") {
      return {
        message: synced
          ? `Fitbit connected. Synced ${synced} day${Number(synced) === 1 ? "" : "s"} of wearable data into your member profile.`
          : "Fitbit connected successfully.",
        tone: "success",
      };
    }

    if (wearableState === "fitbit-error") {
      return {
        message: message || "Fitbit could not be connected right now.",
        tone: "error",
      };
    }

    if (wearableState === "strava-connected") {
      return {
        message: synced
          ? `Strava connected. Synced ${synced} day${Number(synced) === 1 ? "" : "s"} of runner data into your member profile.`
          : "Strava connected successfully.",
        tone: "success",
      };
    }

    if (wearableState === "strava-error") {
      return {
        message: message || "Strava could not be connected right now.",
        tone: "error",
      };
    }

    return null;
  }

  function formatSleepHoursFromSeconds(value) {
    const seconds = Number(value || 0);
    if (!seconds) {
      return "--";
    }

    const hours = seconds / 3600;
    return `${hours.toFixed(hours >= 10 ? 0 : 1)}h`;
  }

  function formatDistanceKilometers(value) {
    const meters = Number(value || 0);
    if (!meters) {
      return "--";
    }

    const kilometers = meters / 1000;
    return `${kilometers.toFixed(kilometers >= 10 ? 0 : 1)} km`;
  }

  function formatMinutesLabel(value) {
    const minutes = Number(value || 0);
    if (!minutes) {
      return "--";
    }

    return `${Math.round(minutes)} min`;
  }

  function normalizeWearableModeLabel(provider) {
    if (provider?.id === "fitbit") {
      return "Cloud sync ready";
    }

    if (provider?.id === "strava") {
      return "Runner sync ready";
    }

    if (provider?.requiresNativeBridge) {
      return "Mobile bridge";
    }

    return "Cloud sync";
  }

  function renderWearableProviderCards(workspace) {
    if (!wearableProviderCardsNode) {
      return;
    }

    const providers = Array.isArray(workspace?.supportedProviders) ? workspace.supportedProviders : [];
    const connections = Array.isArray(workspace?.connections) ? workspace.connections : [];
    const connectionByProvider = new Map(connections.map((connection) => [connection.provider, connection]));
    const liveProviders = providers.filter((provider) => {
      const connection = connectionByProvider.get(provider.id);
      return Boolean(provider.configured || connection?.status === "connected");
    });
    const secondaryProviders = liveProviders.filter((provider) => provider.id !== "fitbit" && provider.id !== "strava");

    wearableProviderCardsNode.innerHTML = secondaryProviders.length
      ? secondaryProviders
          .map((provider) => {
            const connection = connectionByProvider.get(provider.id);
            const statusLabel = connection?.status
              ? normalizeStatusLabel(connection.status)
              : "Configured";

            return `
              <article class="wearable-provider-card" data-provider="${escapeHtml(provider.id)}">
                <div class="wearable-provider-card__head">
                  <div>
                    <span class="kicker kicker--accent">${escapeHtml(normalizeWearableModeLabel(provider))}</span>
                    <h3>${escapeHtml(provider.label)}</h3>
                  </div>
                  <div class="chips wearable-chip-row">
                    <span class="chip">${escapeHtml(statusLabel)}</span>
                    ${connection?.reward_enabled ? '<span class="chip chip--accent">Reward source</span>' : ""}
                  </div>
                </div>
                <p>${escapeHtml(provider.notes || "Wearable support is active for this provider.")}</p>
              </article>
            `;
          })
          .join("")
      : "";
  }

  function renderWearableSummary(workspace) {
    if (!wearableSummaryGridNode) {
      return;
    }

    const connections = Array.isArray(workspace?.connections) ? workspace.connections : [];
    const recentMetrics = Array.isArray(workspace?.recentMetrics) ? workspace.recentMetrics : [];
    const recentRewards = Array.isArray(workspace?.recentRewards) ? workspace.recentRewards : [];
    const rewardSource = connections.find((connection) => connection.reward_enabled) || null;
    const latestMetric = recentMetrics[0] || null;

    wearableSummaryGridNode.innerHTML = `
      <article class="wearable-summary-item">
        <span>Reward Source</span>
        <strong>${escapeHtml(rewardSource ? rewardSource.provider.replace(/_/gu, " ").toUpperCase() : "None selected")}</strong>
        <p>${escapeHtml(rewardSource ? "This provider is currently driving wearable XP." : "You can keep one provider as the active XP source.")}</p>
      </article>
      <article class="wearable-summary-item">
        <span>Latest Daily Sync</span>
        <strong>${escapeHtml(latestMetric?.metric_date ? formatDate(latestMetric.metric_date) : "Not yet")}</strong>
        <p>${escapeHtml(
          latestMetric
            ? latestMetric.sleep_seconds
              ? `${formatSleepHoursFromSeconds(latestMetric.sleep_seconds)} sleep synced`
              : latestMetric.distance_meters
                ? `${formatDistanceKilometers(latestMetric.distance_meters)} activity synced`
                : latestMetric.active_minutes
                  ? `${formatMinutesLabel(latestMetric.active_minutes)} activity synced`
                  : "A wearable sync landed for this date."
            : "Sleep, movement, and readiness data will appear after the first pull."
        )}</p>
      </article>
      <article class="wearable-summary-item">
        <span>Wearable Reward Events</span>
        <strong>${escapeHtml(String(recentRewards.length))} created</strong>
        <p>${escapeHtml(recentRewards.length ? "Wearable-triggered XP and coin events are now landing in your rewards history." : "No wearable reward events have been created yet.")}</p>
      </article>
    `;
  }

  function renderWearableMetricTable(workspace) {
    if (!wearableMetricRowsNode) {
      return;
    }

    const metrics = Array.isArray(workspace?.recentMetrics) ? workspace.recentMetrics : [];
    wearableMetricRowsNode.innerHTML = metrics.length
      ? metrics
          .slice(0, 8)
          .map(
            (metric) => `
              <tr>
                <td>${escapeHtml(formatDate(metric.metric_date))}</td>
                <td>${escapeHtml(normalizeStatusLabel(String(metric.provider || "").replace(/_/gu, " ")))}</td>
                <td>${escapeHtml(formatSleepHoursFromSeconds(metric.sleep_seconds))}</td>
                <td>${escapeHtml(
                  metric.steps != null
                    ? `${Number(metric.steps).toLocaleString("en-US")} steps`
                    : metric.recovery_score != null
                      ? `${metric.recovery_score}%`
                      : "--"
                )}</td>
                <td>${escapeHtml(
                  metric.resting_heart_rate != null || metric.hrv_rmssd != null
                    ? `${metric.resting_heart_rate != null ? `${metric.resting_heart_rate} bpm` : "--"} / ${metric.hrv_rmssd != null ? `${Number(metric.hrv_rmssd).toFixed(0)} ms` : "--"}`
                    : "--"
                )}</td>
              </tr>
            `
          )
          .join("")
      : `
          <tr>
            <td colspan="5">No wearable metrics synced yet.</td>
          </tr>
        `;
  }

  function renderFitbitCard(workspace) {
    const fitbit = workspace?.fitbit || {};
    const fitbitConnection = (workspace?.connections || []).find((connection) => connection.provider === "fitbit") || null;
    const latestFitbitMetric = (workspace?.recentMetrics || []).find((metric) => metric.provider === "fitbit") || null;
    const configured = Boolean(fitbit.configured);
    const connected = Boolean(fitbit.connected && fitbitConnection?.status === "connected");

    if (fitbitCardNode) {
      fitbitCardNode.hidden = !configured && !connected;
    }

    if (fitbitStatusChipsNode) {
      fitbitStatusChipsNode.innerHTML = [
        `<span class="chip ${configured ? "chip--accent" : ""}">${escapeHtml(configured ? "Configured" : "Needs env keys")}</span>`,
        `<span class="chip">${escapeHtml(connected ? "Connected" : "Not connected")}</span>`,
        fitbitConnection?.reward_enabled ? '<span class="chip chip--accent">Reward source</span>' : "",
      ].filter(Boolean).join("");
    }

    if (fitbitStatusCopyNode) {
      fitbitStatusCopyNode.textContent = configured
        ? connected
          ? "Fitbit is live on this account. Use Sync Now any time you want the latest sleep and movement data reflected in your profile."
          : "Fitbit cloud sync is ready. Connect once and we’ll start pulling sleep and step data into LEGACY+."
        : "Fitbit credentials are not configured in the environment yet, so the live OAuth flow is disabled for now.";
    }

    if (fitbitAccountNode) {
      fitbitAccountNode.textContent = fitbit.profile?.displayName || fitbit.profile?.fullName || fitbit.profile?.userId || "Not connected";
    }

    if (fitbitLastSyncNode) {
      fitbitLastSyncNode.textContent = fitbitConnection?.last_successful_sync_at
        ? formatDateTime(fitbitConnection.last_successful_sync_at)
        : "Not yet";
    }

    if (fitbitLatestSleepNode) {
      fitbitLatestSleepNode.textContent = formatSleepHoursFromSeconds(latestFitbitMetric?.sleep_seconds);
    }

    if (fitbitLatestStepsNode) {
      fitbitLatestStepsNode.textContent = latestFitbitMetric?.steps != null
        ? `${Number(latestFitbitMetric.steps).toLocaleString("en-US")} steps`
        : "--";
    }

    if (fitbitConnectButton) {
      fitbitConnectButton.disabled = !configured;
      fitbitConnectButton.textContent = connected ? "Reconnect Fitbit" : "Connect Fitbit";
    }

    if (fitbitSyncButton) {
      fitbitSyncButton.disabled = !configured || !connected;
    }

    if (fitbitDisconnectButton) {
      fitbitDisconnectButton.disabled = !connected;
    }
  }

  function renderStravaCard(workspace) {
    const strava = workspace?.strava || {};
    const stravaConnection = (workspace?.connections || []).find((connection) => connection.provider === "strava") || null;
    const latestStravaMetric = (workspace?.recentMetrics || []).find((metric) => metric.provider === "strava") || null;
    const configured = Boolean(strava.configured);
    const connected = Boolean(strava.connected && stravaConnection?.status === "connected");

    if (stravaCardNode) {
      stravaCardNode.hidden = !configured && !connected;
    }

    if (stravaStatusChipsNode) {
      stravaStatusChipsNode.innerHTML = [
        `<span class="chip ${configured ? "chip--accent" : ""}">${escapeHtml(configured ? "Configured" : "Needs env keys")}</span>`,
        `<span class="chip">${escapeHtml(connected ? "Connected" : "Not connected")}</span>`,
        stravaConnection?.reward_enabled ? '<span class="chip chip--accent">Reward source</span>' : "",
      ].filter(Boolean).join("");
    }

    if (stravaStatusCopyNode) {
      stravaStatusCopyNode.textContent = configured
        ? connected
          ? "Strava is live on this account. Use Sync Now any time you want the latest runner data reflected in your profile."
          : "Strava cloud sync is ready. Connect once and we’ll start pulling run and endurance activity data into LEGACY+."
        : "Strava credentials are not configured in the environment yet, so the live OAuth flow is disabled for now.";
    }

    if (stravaAccountNode) {
      stravaAccountNode.textContent = strava.profile?.username || strava.profile?.fullName || strava.profile?.userId || "Not connected";
    }

    if (stravaLastSyncNode) {
      stravaLastSyncNode.textContent = stravaConnection?.last_successful_sync_at
        ? formatDateTime(stravaConnection.last_successful_sync_at)
        : "Not yet";
    }

    if (stravaLatestDistanceNode) {
      stravaLatestDistanceNode.textContent = formatDistanceKilometers(latestStravaMetric?.distance_meters);
    }

    if (stravaLatestActiveNode) {
      stravaLatestActiveNode.textContent = formatMinutesLabel(latestStravaMetric?.active_minutes);
    }

    if (stravaConnectButton) {
      stravaConnectButton.disabled = !configured;
      stravaConnectButton.textContent = connected ? "Reconnect Strava" : "Connect Strava";
    }

    if (stravaSyncButton) {
      stravaSyncButton.disabled = !configured || !connected;
    }

    if (stravaDisconnectButton) {
      stravaDisconnectButton.disabled = !connected;
    }
  }

  function renderWearableWorkspace(workspace) {
    dashboardState.wearables = workspace;
    const hasLiveWearableProvider = Boolean(
      workspace?.fitbit?.configured
      || workspace?.strava?.configured
      || (workspace?.connections || []).some((connection) => connection.status === "connected")
    );

    if (wearableShellNode) {
      wearableShellNode.hidden = !hasLiveWearableProvider;
    }

    if (!hasLiveWearableProvider) {
      return;
    }

    renderFitbitCard(workspace);
    renderStravaCard(workspace);
    renderWearableProviderCards(workspace);
    renderWearableSummary(workspace);
    renderWearableMetricTable(workspace);
  }

  async function loadWearableWorkspace(options = {}) {
    if (
      !wearableProviderCardsNode
      && !wearableSummaryGridNode
      && !wearableMetricRowsNode
      && !fitbitStatusChipsNode
      && !stravaStatusChipsNode
    ) {
      return;
    }

    const [wearableStatus, fitbitStatus, stravaStatus] = await Promise.all([
      fetchAuthenticatedJson("/.netlify/functions/wearables-status"),
      fetchAuthenticatedJson("/.netlify/functions/fitbit-status"),
      fetchAuthenticatedJson("/.netlify/functions/strava-status"),
    ]);

    renderWearableWorkspace({
      ...wearableStatus,
      fitbit: fitbitStatus,
      strava: stravaStatus,
    });

    if (!options.preserveMessage) {
      setWearableFeedback("Wearable sync controls are ready.", "");
    }
  }

  async function startFitbitConnectFlow() {
    const release = setBusyButtonState(fitbitConnectButton, "Opening Fitbit...");
    try {
      const payload = await fetchAuthenticatedJson("/.netlify/functions/fitbit-auth-url", {
        method: "POST",
        body: {
          returnPath: "/client-settings.html",
        },
      });

      if (!payload?.authUrl) {
        throw new Error("Fitbit did not return an authorization URL.");
      }

      setWearableFeedback("Redirecting to Fitbit secure sign-in...", "success");
      window.location.assign(payload.authUrl);
    } catch (error) {
      setWearableFeedback(error?.message || "Unable to start Fitbit authentication right now.", "error");
      release();
    }
  }

  async function syncFitbitWorkspace() {
    const release = setBusyButtonState(fitbitSyncButton, "Syncing...");
    try {
      setWearableFeedback("Pulling the latest Fitbit sleep and movement data into your profile...", "");
      const payload = await fetchAuthenticatedJson("/.netlify/functions/fitbit-sync", {
        method: "POST",
        body: {
          limit: 7,
        },
      });

      await loadWearableWorkspace({ preserveMessage: true });
      setWearableFeedback(
        `Fitbit sync complete. ${payload.metricsUpserted || 0} day${Number(payload.metricsUpserted || 0) === 1 ? "" : "s"} refreshed and ${payload.rewardsCreated || 0} wearable reward event${Number(payload.rewardsCreated || 0) === 1 ? "" : "s"} created.`,
        "success"
      );
    } catch (error) {
      setWearableFeedback(error?.message || "Unable to sync Fitbit right now.", "error");
    } finally {
      release();
    }
  }

  async function disconnectFitbitWorkspace() {
    const release = setBusyButtonState(fitbitDisconnectButton, "Disconnecting...");
    try {
      await fetchAuthenticatedJson("/.netlify/functions/fitbit-disconnect", {
        method: "POST",
        body: {},
      });
      await loadWearableWorkspace({ preserveMessage: true });
      setWearableFeedback("Fitbit disconnected. Your existing wearable rewards stay in history, but no new data will sync until you reconnect.", "success");
    } catch (error) {
      setWearableFeedback(error?.message || "Unable to disconnect Fitbit right now.", "error");
    } finally {
      release();
    }
  }

  async function startStravaConnectFlow() {
    const release = setBusyButtonState(stravaConnectButton, "Opening Strava...");
    try {
      const payload = await fetchAuthenticatedJson("/.netlify/functions/strava-auth-url", {
        method: "POST",
        body: {
          returnPath: "/client-settings.html",
        },
      });

      if (!payload?.authUrl) {
        throw new Error("Strava did not return an authorization URL.");
      }

      setWearableFeedback("Redirecting to Strava secure sign-in...", "success");
      window.location.assign(payload.authUrl);
    } catch (error) {
      setWearableFeedback(error?.message || "Unable to start Strava authentication right now.", "error");
      release();
    }
  }

  async function syncStravaWorkspace() {
    const release = setBusyButtonState(stravaSyncButton, "Syncing...");
    try {
      setWearableFeedback("Pulling the latest Strava activity data into your profile...", "");
      const payload = await fetchAuthenticatedJson("/.netlify/functions/strava-sync", {
        method: "POST",
        body: {
          limit: 7,
        },
      });

      await loadWearableWorkspace({ preserveMessage: true });
      setWearableFeedback(
        `Strava sync complete. ${payload.metricsUpserted || 0} day${Number(payload.metricsUpserted || 0) === 1 ? "" : "s"} refreshed and ${payload.rewardsCreated || 0} wearable reward event${Number(payload.rewardsCreated || 0) === 1 ? "" : "s"} created.`,
        "success"
      );
    } catch (error) {
      setWearableFeedback(error?.message || "Unable to sync Strava right now.", "error");
    } finally {
      release();
    }
  }

  async function disconnectStravaWorkspace() {
    const release = setBusyButtonState(stravaDisconnectButton, "Disconnecting...");
    try {
      await fetchAuthenticatedJson("/.netlify/functions/strava-disconnect", {
        method: "POST",
        body: {},
      });
      await loadWearableWorkspace({ preserveMessage: true });
      setWearableFeedback("Strava disconnected. Your existing wearable rewards stay in history, but no new data will sync until you reconnect.", "success");
    } catch (error) {
      setWearableFeedback(error?.message || "Unable to disconnect Strava right now.", "error");
    } finally {
      release();
    }
  }

  async function fetchDashboardDataDirect(options = {}) {
    const { access, supabase } = await loadAccessAndClient();
    const userId = access.user.id;
    const nowIso = new Date().toISOString();
    const variant = String(options.variant || "")
      .trim()
      .toLowerCase();
    const isPrimaryVariant = variant === "primary";
    const isSecondaryVariant = variant === "secondary";
    const isHomePage = DASHBOARD_PAGE_KEY === "home";
    const includeProfile = DASHBOARD_PAGE_KEY === "profile";
    const includeOrderHistory = DASHBOARD_PAGE_KEY === "packages" || includeProfile;
    const includePurchaseSummary = includeOrderHistory;
    const includeCatalog = DASHBOARD_PAGE_KEY === "packages";
    const includeRewards = DASHBOARD_PAGE_KEY === "rewards" || includeProfile;
    const includeSchedule = DASHBOARD_PAGE_KEY === "home" || DASHBOARD_PAGE_KEY === "schedule" || includeProfile;
    const includeSessionHistory = includeSchedule || includeRewards;
    const includeLeaderboard = DASHBOARD_PAGE_KEY === "rewards" || includeProfile || (isHomePage && !isPrimaryVariant);
    const includeHomeSummary = isHomePage;
    const orderHistoryLimit = DASHBOARD_PAGE_KEY === "packages" ? 12 : includeProfile ? 8 : 6;
    const pointsLedgerLimit = DASHBOARD_PAGE_KEY === "rewards" ? 50 : isHomePage ? 14 : 20;
    const scheduleWindowLimit = DASHBOARD_PAGE_KEY === "schedule" ? 30 : isHomePage ? 8 : 12;
    const sessionChangeLimit = DASHBOARD_PAGE_KEY === "schedule" ? 30 : isHomePage ? 8 : 20;

    if (isHomePage && isSecondaryVariant) {
      return {
        access,
      };
    }

    const [
      profileResponse,
      clientProfileResponse,
      assignmentResponse,
      packagesResponse,
      ordersResponse,
      pointsLedgerResponse,
      packageCatalogResponse,
    ] = await Promise.all([
      supabase.from("profiles").select("id, display_name, avatar_url, status").eq("id", userId).single(),
      supabase
        .from("client_profiles")
        .select("preferred_name, avatar_slug, xp_points, gym_coins, primary_goal, member_id")
        .eq("id", userId)
        .maybeSingle(),
      supabase
        .from("coach_client_assignments")
        .select("coach_id, status")
        .eq("client_id", userId)
        .eq("status", "active")
        .order("assigned_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("client_packages")
        .select(
          "id, client_id, order_id, package_id, package_name, sessions_purchased, sessions_remaining, status, activated_at, expires_at, created_at"
        )
        .eq("client_id", userId)
        .order("created_at", { ascending: false }),
      includePurchaseSummary
        ? supabase
            .from("orders")
            .select(
              includeOrderHistory
                ? "id, created_at, total_amount_rm, status, external_reference, invoice_number, invoice_storage_path, receipt_number, receipt_storage_path, refund_receipt_number, refund_receipt_storage_path"
                : "id, created_at, total_amount_rm, status"
            )
            .eq("client_id", userId)
            .order("created_at", { ascending: false })
            .limit(orderHistoryLimit)
        : Promise.resolve({ data: [], error: null }),
      includeRewards
        ? supabase
            .from("points_ledger")
            .select("points_type, delta, approval_status, created_at")
            .eq("client_id", userId)
            .order("created_at", { ascending: false })
            .limit(pointsLedgerLimit)
        : Promise.resolve({ data: [], error: null }),
      includeCatalog
        ? supabase
            .from("package_catalog")
            .select(
              "id, code, name, package_type, commitment_kind, training_format, tier_code, sessions_included, expiry_days, price_rm, sst_amount_rm, gross_amount_rm, currency, is_active, metadata"
            )
            .eq("package_type", "coaching")
            .eq("is_active", true)
        : Promise.resolve({ data: [], error: null }),
    ]);

    const profile = profileResponse.data || null;
    const clientProfile = clientProfileResponse.data || null;
    const assignment = assignmentResponse.data || null;
    const packages = packagesResponse.data || [];
    const orders = ordersResponse.data || [];
    const pointsLedger = pointsLedgerResponse.data || [];
    const packageCatalog = packageCatalogResponse.data || [];
    const packageIds = packages.map((item) => item.id).filter(Boolean);

    const orderIds = orders.map((order) => order.id);
    const coachIds = Array.from(
      new Set(
        [assignment?.coach_id]
          .filter(Boolean)
      )
    );

    const [sessionsResponse, bookingRequestsResponse] = await Promise.all([
      includeSessionHistory
        ? packageIds.length
          ? supabase
              .from("sessions")
              .select("id, scheduled_start, scheduled_end, coach_id, client_package_id, status")
              .in("client_package_id", packageIds)
              .order("scheduled_start", { ascending: true })
              .limit(scheduleWindowLimit)
          : supabase
              .from("sessions")
              .select("id, scheduled_start, scheduled_end, coach_id, client_package_id, status")
              .eq("client_id", userId)
              .gte("scheduled_start", nowIso)
              .order("scheduled_start", { ascending: true })
              .limit(scheduleWindowLimit)
        : Promise.resolve({ data: [], error: null }),
      includeSchedule
        ? packageIds.length
          ? supabase
              .from("booking_requests")
              .select("id, requested_date, requested_time, preferred_coach_id, client_package_id, status, notes, created_at")
              .in("client_package_id", packageIds)
              .order("requested_date", { ascending: true })
              .order("requested_time", { ascending: true })
              .limit(scheduleWindowLimit)
          : supabase
              .from("booking_requests")
              .select("id, requested_date, requested_time, preferred_coach_id, client_package_id, status, notes, created_at")
              .eq("client_id", userId)
              .order("requested_date", { ascending: true })
              .order("requested_time", { ascending: true })
              .limit(scheduleWindowLimit)
        : Promise.resolve({ data: [], error: null }),
    ]);

    if (sessionsResponse.error) {
      throw sessionsResponse.error;
    }

    if (bookingRequestsResponse.error) {
      throw bookingRequestsResponse.error;
    }

    const sessions = sessionsResponse.data || [];
    const bookingRequests = bookingRequestsResponse.data || [];
    const sessionIds = sessions.map((session) => session.id).filter(Boolean);
    const sessionChangeRequestsResponse = includeSchedule
      ? sessionIds.length
        ? await supabase
            .from("session_change_requests")
            .select(
              "id, session_id, request_type, original_start, original_end, requested_start, requested_end, reason, status, created_at"
            )
            .in("session_id", sessionIds)
            .order("created_at", { ascending: false })
            .limit(sessionChangeLimit)
        : await supabase
            .from("session_change_requests")
            .select(
              "id, session_id, request_type, original_start, original_end, requested_start, requested_end, reason, status, created_at"
            )
            .eq("client_id", userId)
            .order("created_at", { ascending: false })
            .limit(sessionChangeLimit)
      : { data: [], error: null };

    if (sessionChangeRequestsResponse.error) {
      throw sessionChangeRequestsResponse.error;
    }

    const sessionChangeRequests = sessionChangeRequestsResponse.data || [];

    const resolvedCoachIds = Array.from(
      new Set(
        coachIds
          .concat(sessions.map((session) => session.coach_id))
          .concat(bookingRequests.map((request) => request.preferred_coach_id))
          .filter(Boolean)
      )
    );

    const [orderItemsResponse, coachProfilesResponse, coachAvailabilityResponse, homeSummaryResponse] = await Promise.all([
      includeOrderHistory && orderIds.length
        ? supabase.from("order_items").select("order_id, name").in("order_id", orderIds)
        : Promise.resolve({ data: [], error: null }),
      resolvedCoachIds.length
        ? supabase.from("profiles").select("id, display_name").in("id", resolvedCoachIds)
        : Promise.resolve({ data: [], error: null }),
      includeSchedule && assignment?.coach_id
        ? supabase
            .from("coach_availability_windows")
            .select("id, coach_id, day_of_week, start_time, end_time, timezone, is_active")
            .eq("coach_id", assignment.coach_id)
            .eq("is_active", true)
        : Promise.resolve({ data: [], error: null }),
      includeHomeSummary
        ? loadClientHomeSummaryDirect(supabase, userId, clientProfile)
        : Promise.resolve(null),
    ]);

    if (profileResponse.error) {
      throw profileResponse.error;
    }

    if (clientProfileResponse.error) {
      throw clientProfileResponse.error;
    }

    if (assignmentResponse.error) {
      throw assignmentResponse.error;
    }

    if (packagesResponse.error) {
      throw packagesResponse.error;
    }

    if (ordersResponse.error) {
      throw ordersResponse.error;
    }

    if (pointsLedgerResponse.error) {
      throw pointsLedgerResponse.error;
    }

    if (packageCatalogResponse.error) {
      throw packageCatalogResponse.error;
    }

    if (orderItemsResponse.error) {
      throw orderItemsResponse.error;
    }

    if (coachProfilesResponse.error) {
      throw coachProfilesResponse.error;
    }

    if (coachAvailabilityResponse.error) {
      throw coachAvailabilityResponse.error;
    }

    syncDashboardStateFromData({ assignment });

    return {
      access,
      profile,
      clientProfile,
      assignment,
      packages,
      ...(includeCatalog
        ? {
            packageCatalog,
          }
        : {}),
      ...(includePurchaseSummary
        ? {
            orders,
          }
        : {}),
      ...(includeOrderHistory
        ? {
            orderItems: orderItemsResponse.data || [],
          }
        : {}),
      ...(includeSessionHistory
        ? {
            sessions,
          }
        : {}),
      ...(includeSchedule
        ? {
            bookingRequests,
            sessionChangeRequests,
            coachAvailabilityWindows: coachAvailabilityResponse.data || [],
          }
        : {}),
      ...(includeRewards
        ? {
          pointsLedger,
        }
      : {}),
      ...(includeHomeSummary
        ? {
            homeSummary: homeSummaryResponse || null,
          }
        : {}),
      ...(includeLeaderboard
        ? {
            clientLeaderboard: dashboardState.data?.clientLeaderboard || [],
          }
        : {}),
      coachProfiles: coachProfilesResponse.data || [],
    };
  }

  async function fetchDashboardData(options = {}) {
    try {
      return await fetchDashboardDataFromServer(options);
    } catch (error) {
      console.warn("[LEGACY] Falling back to direct client dashboard queries.", error);
      return fetchDashboardDataDirect(options);
    }
  }

  function applyDeferredDashboardPatch(patch, userId) {
    if (!patch || typeof patch !== "object") {
      return;
    }

    const nextData = mergeDashboardData(patch, dashboardState.data);
    dashboardState.data = nextData;
    writeDashboardCache(userId, nextData);

    if (Object.prototype.hasOwnProperty.call(patch, "plannerSnapshot")) {
      dashboardState.pendingPlannerHydration = false;
      renderPlannerBrief(nextData);
    }

    if (Object.prototype.hasOwnProperty.call(patch, "clientLeaderboard")) {
      dashboardState.pendingLeaderboardHydration = false;
      renderClientLeaderboard(nextData);
    }
  }

  async function hydrateDeferredDashboardSections(loadCycleId, userId) {
    const jobs = [];
    const shouldHydrateLeaderboard = shouldDeferSecondaryPayload();
    const shouldHydratePlanner = shouldHydratePlannerAfterPaint();

    if (shouldHydrateLeaderboard) {
      jobs.push(
        fetchDashboardData({ variant: "secondary" })
          .then((payload) => {
            if (Array.isArray(payload?.clientLeaderboard)) {
              return { clientLeaderboard: payload.clientLeaderboard };
            }
            return null;
          })
          .catch(() => null)
      );
    }

    if (shouldHydratePlanner) {
      jobs.push(
        fetchPlannerSnapshot({ mode: "brief" })
          .then((plannerSnapshot) => ({ plannerSnapshot }))
          .catch((error) => {
            console.warn("[LEGACY] Planner hydration deferred and failed.", error);
            return null;
          })
      );
    }

    if (!jobs.length) {
      return;
    }

    const results = await Promise.allSettled(jobs);
    if (dashboardState.loadCycleId !== loadCycleId) {
      return;
    }

    const patch = {};
    let resolvedLeaderboard = !shouldHydrateLeaderboard;
    let resolvedPlanner = !shouldHydratePlanner;
    results.forEach((result) => {
      if (result.status !== "fulfilled" || !result.value) {
        return;
      }

      if (Object.prototype.hasOwnProperty.call(result.value, "clientLeaderboard")) {
        resolvedLeaderboard = true;
      }
      if (Object.prototype.hasOwnProperty.call(result.value, "plannerSnapshot")) {
        resolvedPlanner = true;
      }

      Object.assign(patch, result.value);
    });

    if (Object.keys(patch).length) {
      applyDeferredDashboardPatch(patch, userId);
    }

    if (!resolvedLeaderboard) {
      dashboardState.pendingLeaderboardHydration = false;
      renderClientLeaderboard(dashboardState.data || buildEmptyDashboardData());
    }

    if (!resolvedPlanner) {
      dashboardState.pendingPlannerHydration = false;
      renderPlannerBrief(dashboardState.data || buildEmptyDashboardData());
    }

    if (!Object.keys(patch).length && resolvedLeaderboard && resolvedPlanner) {
      return;
    }
  }

  function renderProfile(data) {
    const displayName =
      data.clientProfile?.preferred_name ||
      data.profile?.display_name ||
      data.access.user.email ||
      "Client";
    const coachLookup = new Map(data.coachProfiles.map((coach) => [coach.id, coach.display_name || "Coach"]));
    const coachName = data.assignment?.coach_id
      ? coachLookup.get(data.assignment.coach_id) || "Coach"
      : "Assignment pending";
    const activePackage = data.packages.find((pkg) => pkg.status === "active") || data.packages[0] || null;
    const avatarUrl = resolveClientAvatarUrl(data, displayName);

    renderAvatarSurface(avatarNode, displayName, avatarUrl, getInitials(displayName), {
      variant: "compact",
      note: "Member",
    });

    if (displayNameNode) {
      displayNameNode.textContent = displayName;
    }

    if (accountEmailNodes.length) {
      accountEmailNodes.forEach((node) => {
        node.textContent = data.access?.user?.email || "client";
      });
    }

    if (memberIdDisplayNode) {
      memberIdDisplayNode.textContent = data.clientProfile?.member_id
        ? `Your MEMBER ID: ${data.clientProfile.member_id}`
        : "Your MEMBER ID will appear here once your account record finishes syncing.";
    }

    if (goalNode) {
      goalNode.textContent = data.clientProfile?.primary_goal
        ? `Primary Goal: ${data.clientProfile.primary_goal}`
        : "Primary Goal: Add your training goal with your coach to personalize this dashboard.";
    }

    if (profileChipsNode) {
      const chips = [
        "Role: Client",
        `Coach: ${coachName}`,
        `Status: ${normalizeStatusLabel(data.profile?.status || "active")}`,
        data.clientProfile?.member_id ? `Member ID: ${data.clientProfile.member_id}` : "Member ID: pending",
        activePackage ? `Plan: ${formatPackageDisplayName(activePackage)}` : "Plan: No active package",
      ];

      profileChipsNode.innerHTML = chips
        .map((chip) => `<span class="chip chip--accent">${escapeHtml(chip)}</span>`)
        .join("");
    }
  }

  function renderAvatarSurface(node, displayName, avatarUrl, fallbackLabel, options = {}) {
    if (!node) {
      return;
    }

    if (avatarUrl) {
      node.innerHTML = `<img alt="${escapeHtml(displayName)}" src="${escapeHtml(avatarUrl)}" />`;
      return;
    }

    const variant = options.variant
      || (node.classList.contains("dashboard-avatar") || node.classList.contains("leaderboard-row__avatar") ? "compact" : "portrait");
    node.innerHTML = buildAvatarFallbackMarkup(displayName, {
      variant,
      mark: fallbackLabel || getInitials(displayName),
      note: options.note,
    });
  }

  function buildClientProfileOverview(data) {
    const displayName =
      data.clientProfile?.preferred_name ||
      data.profile?.display_name ||
      data.access?.user?.email ||
      "Client";
    const avatarUrl = resolveClientAvatarUrl(data, displayName);
    const avatarPreset = getClientAvatarPreset(avatarUrl);
    const coachLookup = new Map((data.coachProfiles || []).map((coach) => [coach.id, coach.display_name || "Coach"]));
    const coachName = data.assignment?.coach_id
      ? coachLookup.get(data.assignment.coach_id) || "Coach"
      : "Assignment pending";
    const activePackages = data.packages.filter((pkg) => pkg.status === "active" && !isPackageExpired(pkg));
    const activePackage = activePackages[0] || data.packages[0] || null;
    const completedSessions = (data.sessions || []).filter((session) => session.status === "completed");
    const scheduledSessions = (data.sessions || []).filter((session) => session.status === "scheduled");
    const reservationCounts = buildReservationCountMap(data);
    const totalSessionsPurchased = activePackages.length ? sumBy(activePackages, "sessions_purchased") : sumBy(data.packages, "sessions_purchased");
    const totalSessionsRemaining = activePackages.length ? sumBy(activePackages, "sessions_remaining") : sumBy(data.packages, "sessions_remaining");
    const bookableRemaining = activePackages.reduce(
      (total, packageRecord) => total + getBookableRemainingForPackage(packageRecord, reservationCounts),
      0
    );
    const totalPurchases = (data.orders || [])
      .filter((order) => order.status === "paid")
      .reduce((total, order) => total + Number(order.total_amount_rm || 0), 0);
    const approvedEntries = (data.pointsLedger || []).filter(
      (entry) => entry.approval_status === "approved" || entry.approval_status === "auto_approved"
    );
    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const monthAgo = now - 30 * 24 * 60 * 60 * 1000;
    const monthStart = new Date();
    monthStart.setHours(0, 0, 0, 0);
    monthStart.setDate(1);
    const monthStartTime = monthStart.getTime();
    const weeklyXp = approvedEntries.reduce((total, entry) => {
      const createdAt = new Date(entry.created_at || 0).getTime();
      return entry.points_type === "xp" && !Number.isNaN(createdAt) && createdAt >= weekAgo
        ? total + Number(entry.delta || 0)
        : total;
    }, 0);
    const monthlyCoins = approvedEntries.reduce((total, entry) => {
      const createdAt = new Date(entry.created_at || 0).getTime();
      return entry.points_type === "gym_coins" && !Number.isNaN(createdAt) && createdAt >= monthStartTime
        ? total + Number(entry.delta || 0)
        : total;
    }, 0);
    const recentCompletedSessions = completedSessions.filter((session) => {
      const completedAt = new Date(session.completed_at || session.scheduled_start || 0).getTime();
      return !Number.isNaN(completedAt) && completedAt >= monthAgo;
    }).length;
    const totalRequests = (data.bookingRequests || []).length + (data.sessionChangeRequests || []).length;
    const approvedOrScheduledRequests =
      (data.bookingRequests || []).filter((request) => request.status === "approved" || request.status === "scheduled").length +
      scheduledSessions.length +
      completedSessions.length;
    const gamificationConfig = getGamificationConfig();
    const levelSummary = gamificationConfig
      ? calculateBundleLevel(Number(data.clientProfile?.xp_points || 0), gamificationConfig.xpCurve)
      : {
          currentLevel: Math.floor(Number(data.clientProfile?.xp_points || 0) / 5000),
          nextLevel: Math.floor(Number(data.clientProfile?.xp_points || 0) / 5000) + 1,
          progressPercent: Math.max(2, Math.min(100, Math.round(((Number(data.clientProfile?.xp_points || 0) % 5000) / 5000) * 100))),
          remainingXp: Math.max(5000 - (Number(data.clientProfile?.xp_points || 0) % 5000), 0),
        };
    const weeklyXpTarget = Number(gamificationConfig?.settings?.routineWeeklyCapXP || 250);
    const monthlyCoinCap = Number(gamificationConfig?.settings?.monthlyCoinCap || 100);
    const cadenceTarget = activePackage ? Math.max(4, Math.min(12, Number(activePackage.sessions_purchased || 8))) : 8;
    const usedSessions = Math.max(0, totalSessionsPurchased - totalSessionsRemaining);
    const characterName = avatarPreset?.name || displayName;
    const characterCollectionLabel = avatarPreset?.collectionLabel || "";

    return {
      displayName,
      avatarUrl,
      avatarPreset,
      characterName,
      characterCollectionLabel,
      coachName,
      activePackage,
      totalPurchases,
      currentXp: Number(data.clientProfile?.xp_points || 0),
      currentCoins: Number(data.clientProfile?.gym_coins || 0),
      memberId: data.clientProfile?.member_id || "",
      primaryGoal: data.clientProfile?.primary_goal || "",
      completedSessions,
      scheduledSessions,
      bookableRemaining,
      totalSessionsPurchased,
      totalSessionsRemaining,
      weeklyXp,
      monthlyCoins,
      recentCompletedSessions,
      approvedEntries,
      levelSummary,
      metrics: [
        {
          label: "Package usage",
          valueLabel: `${usedSessions}/${totalSessionsPurchased || 0} used`,
          percent: totalSessionsPurchased ? Math.round((usedSessions / totalSessionsPurchased) * 100) : 0,
        },
        {
          label: "Booking stability",
          valueLabel: totalRequests ? `${Math.min(approvedOrScheduledRequests, totalRequests)}/${totalRequests} converted` : "No requests yet",
          percent: totalRequests ? Math.round((Math.min(approvedOrScheduledRequests, totalRequests) / totalRequests) * 100) : 0,
        },
        {
          label: "Weekly XP flow",
          valueLabel: `${formatMetric(weeklyXp)} / ${formatMetric(weeklyXpTarget)} target`,
          percent: Math.min(100, Math.round((weeklyXp / Math.max(weeklyXpTarget, 1)) * 100)),
        },
        {
          label: "Monthly cadence",
          valueLabel: `${recentCompletedSessions}/${cadenceTarget} completed`,
          percent: Math.min(100, Math.round((recentCompletedSessions / Math.max(cadenceTarget, 1)) * 100)),
        },
        {
          label: "Coin bank",
          valueLabel: `${formatMetric(monthlyCoins)} / ${formatMetric(monthlyCoinCap)} this month`,
          percent: Math.min(100, Math.round((monthlyCoins / Math.max(monthlyCoinCap, 1)) * 100)),
        },
        {
          label: "Level progress",
          valueLabel: levelSummary.remainingXp > 0
            ? `${formatMetric(levelSummary.remainingXp)} XP to Level ${levelSummary.nextLevel}`
            : `Level ${levelSummary.currentLevel} reached`,
          percent: Math.max(2, Math.min(100, Number(levelSummary.progressPercent || 0))),
        },
      ],
    };
  }

  function renderMetricBars(node, items) {
    if (!node) {
      return;
    }

    node.innerHTML = (items || [])
      .map(
        (item) => `
          <article class="profile-bar-row">
            <div class="profile-bar-row__head">
              <span>${escapeHtml(item.label)}</span>
              <strong>${escapeHtml(item.valueLabel)}</strong>
            </div>
            <div class="metric-bar-track">
              <span class="metric-bar-fill" style="width:${Math.max(3, Math.min(100, Number(item.percent || 0)))}%"></span>
            </div>
          </article>
        `
      )
      .join("");
  }

  function renderClientProfilePage(data) {
    if (
      !profilePassportNode &&
      !profilePortraitNode &&
      !profileSummaryMetricsNode &&
      !profileProgressBarsNode &&
      !profileSessionRowsNode &&
      !profileRewardRowsNode &&
      !profilePackageSummaryNode &&
      !profilePurchaseRowsNode
    ) {
      return;
    }

    const overview = buildClientProfileOverview(data);
    const activePackage = overview.activePackage;
    const hasPortrait = Boolean(overview.avatarUrl);
    const profileSubtitle = activePackage
      ? `${formatPackageDisplayName(activePackage)} • ${overview.bookableRemaining} bookable session${overview.bookableRemaining === 1 ? "" : "s"}`
      : "No active package yet";

    applyClientProfilePalette(clientProfileHeroNode, overview.avatarPreset);

    renderAvatarSurface(profilePassportNode, overview.displayName, overview.avatarUrl, getInitials(overview.displayName), {
      variant: "portrait",
      note: hasPortrait ? "" : "Member identity",
    });
    renderAvatarSurface(profilePortraitNode, overview.characterName, overview.avatarUrl, getInitials(overview.characterName), {
      variant: "portrait",
      note: hasPortrait ? "" : "Portrait pending",
    });

    if (profilePassportNameNode) {
      profilePassportNameNode.textContent = overview.displayName;
    }
    if (profilePassportNoteNode) {
      profilePassportNoteNode.textContent = overview.memberId ? `MEMBER ID ${overview.memberId}` : "Live CRM member identity";
    }
    if (profileNameMainNode) {
      profileNameMainNode.textContent = overview.displayName.toUpperCase();
    }
    if (profileRoleNode) {
      profileRoleNode.textContent = activePackage ? formatPackageDisplayName(activePackage) : "Active member";
    }
    if (profileGoalMainNode) {
      profileGoalMainNode.textContent = overview.primaryGoal || "Needs onboarding and a live primary goal from the coaching CRM.";
    }
    if (profilePortraitNameNode) {
      profilePortraitNameNode.textContent = (hasPortrait ? overview.characterName : overview.displayName).toUpperCase();
    }
    if (profilePortraitTaglineNode) {
      profilePortraitTaglineNode.textContent = hasPortrait
        ? (
            overview.primaryGoal ||
            (overview.characterCollectionLabel ? `${overview.characterCollectionLabel} character archive` : "Built for consistent progress, not guesswork.")
          )
        : "Portrait selection pending";
    }
    if (profilePortraitNoteNode) {
      profilePortraitNoteNode.textContent = hasPortrait
        ? `${overview.completedSessions.length} completed sessions, ${overview.currentXp} verified XP, and ${overview.currentCoins} gym coins now reinforce ${overview.characterName}.`
        : `Choose a portrait in Settings. Your coach assignment, package balance, and reward totals already stay synchronized here for ${overview.displayName}.`;
    }
    if (profileCoinsNode) {
      profileCoinsNode.textContent = formatMetric(overview.currentCoins);
    }
    if (profileNextUnlockNode) {
      profileNextUnlockNode.textContent = overview.levelSummary?.remainingXp > 0
        ? `Level ${overview.levelSummary.nextLevel}`
        : `Level ${overview.levelSummary.currentLevel}`;
    }
    if (profilePackageBalanceNode) {
      profilePackageBalanceNode.textContent = `${overview.bookableRemaining} session${overview.bookableRemaining === 1 ? "" : "s"}`;
    }
    if (profileCoachNode) {
      profileCoachNode.textContent = overview.coachName;
    }

    if (profileSummaryMetricsNode) {
      profileSummaryMetricsNode.innerHTML = [
        { label: "XP on account", value: formatMetric(overview.currentXp), note: `${overview.approvedEntries.filter((entry) => entry.points_type === "xp").length} approved XP entries` },
        { label: "Sessions completed", value: String(overview.completedSessions.length), note: `${overview.scheduledSessions.length} upcoming scheduled` },
        { label: "Purchase value", value: formatCurrency(overview.totalPurchases), note: activePackage ? profileSubtitle : "No paid package balance yet" },
        { label: "Assigned coach", value: overview.coachName, note: overview.memberId ? `MEMBER ID ${overview.memberId}` : "Member ID pending" },
      ]
        .map(
          (item) => `
            <article class="profile-metric-card">
              <span>${escapeHtml(item.label)}</span>
              <strong>${escapeHtml(item.value)}</strong>
              <p>${escapeHtml(item.note)}</p>
            </article>
          `
        )
        .join("");
    }

    renderMetricBars(profileSummaryBarsNode, overview.metrics.slice(0, 3));
    renderMetricBars(profileProgressBarsNode, overview.metrics.slice(3));

    if (profileSessionRowsNode) {
      const packageById = new Map((data.packages || []).map((pkg) => [pkg.id, pkg]));
      const coachLookup = new Map((data.coachProfiles || []).map((coach) => [coach.id, coach.display_name || "Coach"]));
      const rows = (data.sessions || [])
        .slice()
        .sort((left, right) => toTimestamp(right.scheduled_start) - toTimestamp(left.scheduled_start))
        .slice(0, 6);
      profileSessionRowsNode.innerHTML = rows.length
        ? rows
            .map(
              (session) => `
                <tr>
                  <td data-label="Date">${escapeHtml(formatDate(session.scheduled_start))}</td>
                  <td data-label="Coach">${escapeHtml(coachLookup.get(session.coach_id) || "Coach")}</td>
                  <td data-label="Package">${escapeHtml(formatPackageDisplayName(packageById.get(session.client_package_id)) || "Package")}</td>
                  <td class="dashboard-table__cell--status" data-label="Status">${buildDashboardStatusMarkup(session.status)}</td>
                </tr>
              `
            )
            .join("")
        : buildEmptyTableRow(
            4,
            "No verified sessions yet.",
            "Completed sessions will appear here after your first confirmed coaching block is logged."
          );
    }

    if (profileRewardRowsNode) {
      const rows = (data.pointsLedger || []).slice(0, 6);
      profileRewardRowsNode.innerHTML = rows.length
        ? rows
            .map(
              (entry) => `
                <tr>
                  <td data-label="Date">${escapeHtml(formatDate(entry.created_at))}</td>
                  <td data-label="Type">${escapeHtml(entry.points_type === "gym_coins" ? "Gym Coins" : "XP")}</td>
                  <td data-label="Delta">${escapeHtml(Number(entry.delta || 0) > 0 ? `+${formatMetric(entry.delta)}` : formatMetric(entry.delta))}</td>
                  <td data-label="Status">${escapeHtml(normalizeStatusLabel(entry.approval_status))}</td>
                </tr>
              `
            )
            .join("")
        : buildEmptyTableRow(
            4,
            "No reward history yet.",
            "Approved XP and gym coin movement will populate after coach actions and admin approval."
          );
    }

    if (profilePackageSummaryNode) {
      profilePackageSummaryNode.innerHTML = activePackage
        ? `
            <div class="profile-package-summary__grid">
              <article class="profile-metric-card">
                <span>Current package</span>
                <strong>${escapeHtml(activePackage.package_name)}</strong>
                <p>${escapeHtml(`${Number(activePackage.sessions_remaining || 0)} of ${Number(activePackage.sessions_purchased || 0)} sessions remain`)}</p>
              </article>
              <article class="profile-metric-card">
                <span>Bookable now</span>
                <strong>${escapeHtml(String(overview.bookableRemaining))}</strong>
                <p>${escapeHtml(activePackage.expires_at ? `Expires ${formatShortDate(activePackage.expires_at)}` : "No expiry set")}</p>
              </article>
              <article class="profile-metric-card">
                <span>Schedule pressure</span>
                <strong>${escapeHtml(String(overview.scheduledSessions.length))}</strong>
                <p>${escapeHtml(`${(data.bookingRequests || []).filter((item) => item.status === "pending").length} pending requests in the queue`)}</p>
              </article>
            </div>
          `
        : `
            <div class="profile-package-summary__grid">
              <article class="profile-metric-card">
                <span>Package status</span>
                <strong>Not assigned yet</strong>
                <p>Your first live package will appear here once your coach or admin activates it.</p>
              </article>
              <article class="profile-metric-card">
                <span>Next unlock</span>
                <strong>Profile syncing</strong>
                <p>Session balance, expiry timing, and booking pressure populate automatically after activation.</p>
              </article>
              <article class="profile-metric-card">
                <span>Coach handoff</span>
                <strong>${escapeHtml(overview.coachName)}</strong>
                <p>Your assigned coach stays linked here even before the first paid package is attached.</p>
              </article>
            </div>
          `;
    }

    if (profilePurchaseRowsNode) {
      const itemLookup = new Map();
      (data.orderItems || []).forEach((item) => {
        if (!itemLookup.has(item.order_id)) {
          itemLookup.set(item.order_id, item.name);
        }
      });
      profilePurchaseRowsNode.innerHTML = (data.orders || []).length
        ? data.orders
            .slice(0, 6)
            .map(
              (order) => `
                <tr>
                  <td data-label="Date">${escapeHtml(formatDate(order.created_at))}</td>
                  <td data-label="Item">${escapeHtml(itemLookup.get(order.id) || "Package Purchase")}</td>
                  <td data-label="Total">${escapeHtml(formatCurrency(order.total_amount_rm))}</td>
                  <td data-label="Status">${escapeHtml(normalizeStatusLabel(order.status))}</td>
                </tr>
              `
            )
            .join("")
        : buildEmptyTableRow(
            4,
            "No purchase history yet.",
            "Paid packages and future store orders will show here once they clear successfully."
          );
    }
  }

  function renderStats(data) {
    const activePackages = data.packages.filter((pkg) => pkg.status === "active" && !isPackageExpired(pkg));
    const totalSessionsRemaining = sumBy(activePackages, "sessions_remaining");
    const totalSessionsPurchased = sumBy(activePackages, "sessions_purchased");
    const usedSessions = Math.max(0, totalSessionsPurchased - totalSessionsRemaining);
    const homeSummary = getClientHomeSummary(data);
    const pendingRequests = data.bookingRequests.filter((request) => request.status === "pending").length;
    const upcomingSessions = data.sessions.filter((session) => session.status === "scheduled").length;
    const reservationCounts = buildReservationCountMap(data);
    const bookableRemaining = activePackages.reduce(
      (total, packageRecord) => total + getBookableRemainingForPackage(packageRecord, reservationCounts),
      0
    );

    const statSessionsNode = document.getElementById("client-stat-sessions");
    const statSessionsNoteNode = document.getElementById("client-stat-sessions-note");
    const statPointsNode = document.getElementById("client-stat-points");
    const statPointsNoteNode = document.getElementById("client-stat-points-note");
    const statBookingsNode = document.getElementById("client-stat-bookings");
    const statBookingsNoteNode = document.getElementById("client-stat-bookings-note");
    const statPurchasesNode = document.getElementById("client-stat-purchases");
    const statPurchasesNoteNode = document.getElementById("client-stat-purchases-note");

    if (statSessionsNode) {
      statSessionsNode.textContent = String(bookableRemaining);
    }

    if (statSessionsNoteNode) {
      statSessionsNoteNode.textContent = activePackages.length
        ? `${totalSessionsRemaining}/${totalSessionsPurchased} sessions remain, with ${bookableRemaining} still free after pending and scheduled bookings.`
        : "You do not have an active package yet.";
    }

    if (statPointsNode) {
      statPointsNode.innerHTML = buildStackedStatMarkup([
        { value: formatMetric(homeSummary.currentXp || 0), label: "XP" },
        { value: formatMetric(homeSummary.currentCoins || 0), label: "Coins" },
      ]);
    }

    if (statPointsNoteNode) {
      const gamificationConfig = getGamificationConfig();
      statPointsNoteNode.textContent = gamificationConfig
        ? `Rules-engine rewards update after admin approval. ${formatMetric(homeSummary.weeklyXp || 0)} XP and ${formatMetric(homeSummary.weeklyCoins || 0)} coins counted this week.`
        : `${formatMetric(homeSummary.approvedRewardEntriesCount || 0)} approved reward entries tracked on your account.`;
    }

    if (statBookingsNode) {
      statBookingsNode.innerHTML = buildStackedStatMarkup([
        { value: formatMetric(upcomingSessions), label: "Upcoming" },
        { value: formatMetric(pendingRequests), label: "Pending" },
      ]);
    }

    if (statBookingsNoteNode) {
      statBookingsNoteNode.textContent = pendingRequests
        ? "Your pending booking requests are waiting for coach/admin confirmation."
        : "No pending booking requests right now.";
    }

    if (statPurchasesNode) {
      statPurchasesNode.textContent = `${formatMetric(usedSessions)}/${formatMetric(totalSessionsPurchased)}`;
    }

    if (statPurchasesNoteNode) {
      statPurchasesNoteNode.textContent = totalSessionsPurchased
        ? `${formatMetric(usedSessions)} sessions have been completed or consumed from your current ${formatMetric(totalSessionsPurchased)}-session balance.`
        : "Your active package progress will appear here once a live session bundle is on your account.";
    }

    setTone(statSessionsNode, !activePackages.length || bookableRemaining <= 0 ? "alert" : bookableRemaining <= 2 ? "warning" : "success");
    setTone(statBookingsNode, pendingRequests ? "warning" : upcomingSessions ? "info" : "success");
    setTone(
      statPointsNode,
      Number(homeSummary.currentXp || 0) > 0 || Number(homeSummary.currentCoins || 0) > 0 ? "success" : "info"
    );
    setTone(statPurchasesNode, totalSessionsPurchased > 0 ? "info" : "warning");
  }

  function buildHomePrimaryAction(data, overview, metrics) {
    const activePackages = metrics.activePackages || [];
    const nextDay = overview?.nextDay || null;
    const progressPhotos = Array.isArray(data?.plannerSnapshot?.progressPhotos) ? data.plannerSnapshot.progressPhotos : [];
    const latestCheckin = overview?.latestCheckin || null;

    if (!activePackages.length) {
      return {
        eyebrow: "Access",
        title: "Choose your first coaching package",
        copy: "Unlock bookings, live planner workflows, and coach review by activating a package first.",
        primaryLabel: "Choose Package",
        primaryHref: "./client-packages.html",
        secondaryLabel: "View Schedule",
        secondaryHref: "./client-schedule.html",
      };
    }

    if (nextDay) {
      const todayValue = getTodayDateOnly();
      const timing = getPlannerDayTiming(nextDay, todayValue);
      const isRecoveryDay = ["rest", "recovery", "mobility"].includes(String(nextDay?.day_type || "").toLowerCase());
      const focusLine = nextDay.focus
        ? nextDay.focus
        : isRecoveryDay
          ? "Recovery, mobility, and readiness focus."
          : "Your coach’s session focus is ready in the planner.";
      return {
        eyebrow: timing.key === "today" ? "Today" : "Coming Up",
        title: resolvePlannerDayTitle(nextDay, todayValue) || "Your next training day is ready",
        copy: timing.key === "today"
          ? focusLine
          : `${timing.longLabel}${focusLine ? ` • ${focusLine}` : ""}`,
        primaryLabel: isRecoveryDay ? "Open Planner" : "Start Workout",
        primaryHref: "./client-planner.html?tab=training",
        secondaryLabel: "Track Progress",
        secondaryHref: "./client-planner.html?tab=progress",
      };
    }

    if (!progressPhotos.length) {
      return {
        eyebrow: "Baseline",
        title: "Capture your first progress check-in",
        copy: "Front, side, and back photos give your coach a clean baseline and make future changes easier to compare.",
        primaryLabel: "Track Progress",
        primaryHref: "./client-planner.html?tab=progress",
        secondaryLabel: "Open Planner",
        secondaryHref: "./client-planner.html?tab=progress",
      };
    }

    if (metrics.bookableRemaining > 0 && metrics.upcomingSessions === 0) {
      return {
        eyebrow: "Booking",
        title: "Book your next coaching session",
        copy: `${formatMetric(metrics.bookableRemaining)} session${metrics.bookableRemaining === 1 ? "" : "s"} are still free to reserve from your active package.`,
        primaryLabel: "Book Session",
        primaryHref: "./client-schedule.html",
        secondaryLabel: "Open Planner",
        secondaryHref: "./client-planner.html?tab=training",
      };
    }

    if (latestCheckin && !latestCheckin.submitted_at) {
      return {
        eyebrow: "Recovery",
        title: "Submit your health check-in",
        copy: "Your coach is waiting on your latest recovery update before the next planning review.",
        primaryLabel: "Submit Check-In",
        primaryHref: "./client-planner.html?tab=health",
        secondaryLabel: "View Schedule",
        secondaryHref: "./client-schedule.html",
      };
    }

    return {
      eyebrow: "Momentum",
      title: "Stay on top of your coaching week",
      copy: metrics.pendingRequests
        ? "You already have booking requests in flight. Check your schedule, then keep the planner updated."
        : "You are set up. Keep the momentum going with your planner, progress check-ins, and upcoming sessions.",
      primaryLabel: "View Schedule",
      primaryHref: "./client-schedule.html",
      secondaryLabel: "Open Planner",
      secondaryHref: "./client-planner.html?tab=training",
    };
  }

  function renderHomeFocus(data) {
    if (!homeFocusPanelNode) {
      return;
    }

    const activePackages = data.packages.filter((pkg) => pkg.status === "active" && !isPackageExpired(pkg));
    const reservationCounts = buildReservationCountMap(data);
    const bookableRemaining = activePackages.reduce(
      (total, packageRecord) => total + getBookableRemainingForPackage(packageRecord, reservationCounts),
      0
    );
    const upcomingSessions = data.sessions.filter((session) => session.status === "scheduled").length;
    const pendingRequests = data.bookingRequests.filter((request) => request.status === "pending").length;
    const overview = derivePlannerOverview(data.plannerSnapshot);
    const homeSummary = getClientHomeSummary(data);
    const currentXp = Number(homeSummary.currentXp || 0);
    const currentCoins = Number(homeSummary.currentCoins || 0);
    const gamificationConfig = getGamificationConfig();
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const completedSessions = (data.sessions || []).filter((session) => session.status === "completed");
    const weeklyCompletedSessions = countBy(completedSessions, (session) => {
      const completedAt = new Date(session.completed_at || session.updated_at || 0).getTime();
      return !Number.isNaN(completedAt) && completedAt >= weekAgo;
    });
    const levelSummary = gamificationConfig
      ? calculateBundleLevel(currentXp, gamificationConfig.xpCurve)
      : {
          currentLevel: Math.floor(currentXp / 5000),
          nextLevel: Math.floor(currentXp / 5000) + 1,
          progressCurrent: currentXp - Math.floor(currentXp / 5000) * 5000,
          progressTarget: 5000,
          progressPercent: Math.max(2, Math.min(100, ((currentXp - Math.floor(currentXp / 5000) * 5000) / 5000) * 100)),
          remainingXp: Math.max(0, Math.max(Math.floor(currentXp / 5000) * 5000 + 5000, 5000) - currentXp),
        };
    const action = buildHomePrimaryAction(data, overview, {
      activePackages,
      bookableRemaining,
      pendingRequests,
      upcomingSessions,
    });

    homeFocusPanelNode.innerHTML = `
      <div class="client-home-focus-grid">
        <article class="client-home-focus-card client-home-focus-card--primary" data-crm-tone="alert">
          <div class="client-home-focus-card__copy">
            <span class="chip chip--tone-alert">${escapeHtml(action.eyebrow)}</span>
            <h3>${escapeHtml(action.title)}</h3>
            <p>${escapeHtml(action.copy)}</p>
            <div class="section-actions section-actions--compact">
              <a class="btn btn-primary" href="${escapeHtml(action.primaryHref)}">${escapeHtml(action.primaryLabel)}</a>
              <a class="btn btn-ghost" href="${escapeHtml(action.secondaryHref)}">${escapeHtml(action.secondaryLabel)}</a>
            </div>
          </div>
          <div class="client-home-progress-ring" style="--progress:${Math.max(4, Math.min(100, Number(levelSummary.progressPercent || 0)))}%;">
            <div class="client-home-progress-ring__inner">
              <strong>Lv. ${escapeHtml(String(levelSummary.currentLevel || 0))}</strong>
              <span>${escapeHtml(`${formatMetric(levelSummary.progressCurrent || 0)} / ${formatMetric(levelSummary.progressTarget || 0)} XP`)}</span>
            </div>
          </div>
        </article>
        <article class="client-home-focus-card client-home-focus-card--support" data-crm-tone="neutral">
          <div class="client-home-focus-metrics">
            <article>
              <span>This week</span>
              <strong>${escapeHtml(`${formatMetric(weeklyCompletedSessions)} session${weeklyCompletedSessions === 1 ? "" : "s"}`)}</strong>
              <p>${escapeHtml(`${formatMetric(homeSummary.weeklyXp || 0)} XP and ${formatMetric(homeSummary.weeklyCoins || 0)} coins counted`)}</p>
            </article>
            <article>
              <span>Bookable now</span>
              <strong>${escapeHtml(formatMetric(bookableRemaining))}</strong>
              <p>${escapeHtml(upcomingSessions ? `${formatMetric(upcomingSessions)} upcoming on the calendar` : "No upcoming sessions booked yet")}</p>
            </article>
            <article>
              <span>Next unlock</span>
              <strong>${escapeHtml(levelSummary.remainingXp > 0 ? `${formatMetric(levelSummary.remainingXp)} XP` : `Level ${levelSummary.currentLevel}`)}</strong>
              <p>${escapeHtml(levelSummary.remainingXp > 0 ? `to Level ${levelSummary.nextLevel}` : `${formatMetric(currentCoins)} coins banked`)}</p>
            </article>
          </div>
        </article>
      </div>
    `;
  }

  function renderOwnedPackages(data) {
    if (!activePackageCardsNode) {
      return;
    }

    if (!data.packages.length) {
      activePackageCardsNode.innerHTML = `
        <article class="dashboard-note" data-crm-tone="alert">
          <p>You have not purchased a coaching package yet. Use the package store below to unlock bookings.</p>
        </article>
      `;
      return;
    }

    const reservationCounts = buildReservationCountMap(data);
    const catalogById = new Map((data.packageCatalog || []).map((item) => [item.id, item]));
    const sortedPackages = data.packages
      .slice()
      .sort((left, right) => {
        const leftRank = left.status === "active" ? 0 : 1;
        const rightRank = right.status === "active" ? 0 : 1;
        if (leftRank !== rightRank) {
          return leftRank - rightRank;
        }

        return toTimestamp(right.created_at) - toTimestamp(left.created_at);
      });

    activePackageCardsNode.innerHTML = sortedPackages
      .map((packageRecord) => {
        const metadata = parseMetadata(packageRecord);
        const catalogRecord = catalogById.get(packageRecord.package_id);
        const reservedCount = getReservedCountForPackage(packageRecord, reservationCounts);
        const bookableRemaining = getBookableRemainingForPackage(packageRecord, reservationCounts);
        const selectedClass = catalogRecord?.code === dashboardState.desiredPackageCode ? " package-card--selected" : "";
        const expiryLabel = packageRecord.expires_at ? formatShortDate(packageRecord.expires_at) : "Not set";
        const isShared = isSharedPackage(packageRecord);
        const sharedLabel = isShared
          ? packageRecord.client_id === data.access?.user?.id
            ? "Shared with a second client account"
            : "Shared package from a partner purchase"
          : "";
        const packageTone =
          packageRecord.status !== "active" || isPackageExpired(packageRecord)
            ? "alert"
            : bookableRemaining <= 0
              ? "warning"
              : isShared
                ? "info"
                : "success";
        const headerNote =
          packageRecord.status === "active" && !isPackageExpired(packageRecord)
            ? `${bookableRemaining} bookable now`
            : normalizeStatusLabel(packageRecord.status);

        return `
          <article class="package-card package-card--owned${selectedClass}" data-crm-tone="${packageTone}">
            <div class="package-card__top">
              <div>
                <span class="kicker kicker--accent">${escapeHtml(formatCommitmentLabel(resolveCommitmentKind(packageRecord, metadata)))}</span>
                <h3 class="package-card__title">${escapeHtml(formatPackageDisplayName(packageRecord))}</h3>
              </div>
              <strong class="package-card__price">${escapeHtml(headerNote)}</strong>
            </div>
            <div class="chips">
              <span class="chip chip--accent">${escapeHtml(normalizeStatusLabel(packageRecord.status))}</span>
              <span class="chip">${escapeHtml(`${Number(packageRecord.sessions_purchased || 0)} purchased`)}</span>
              <span class="chip">${escapeHtml(`Expires ${expiryLabel}`)}</span>
              ${isShared ? `<span class="chip">${escapeHtml(sharedLabel)}</span>` : ""}
            </div>
            <dl class="package-card__stats">
              <div>
                <dt>Sessions Left</dt>
                <dd>${escapeHtml(String(Number(packageRecord.sessions_remaining || 0)))}</dd>
              </div>
              <div>
                <dt>Reserved</dt>
                <dd>${escapeHtml(String(reservedCount))}</dd>
              </div>
              <div>
                <dt>Available To Book</dt>
                <dd>${escapeHtml(String(bookableRemaining))}</dd>
              </div>
            </dl>
          </article>
        `;
      })
      .join("");
  }

  function renderPackageCatalog(data) {
    if (
      !packageCommitmentSelect
      || !packageFormatSelect
      || !packageTierSelect
      || !packageOptionSelect
      || !packageSelectionSummaryNode
    ) {
      if (packageCatalogNode) {
        packageCatalogNode.innerHTML = "";
      }
      return;
    }

    const selectionState = getSelectionStateFromCatalog(data);
    const { visiblePackages, selectedPackage, commitmentOptions, formatOptions, tierOptions, packageOptions } = selectionState;
    const desiredPackage = visiblePackages.find((item) => item.code === dashboardState.desiredPackageCode) || null;

    if (dashboardState.desiredPackageCode && desiredPackage) {
      setPackageStoreFeedback(
        `Package selected from pricing: ${desiredPackage.name}. Review the bundle and continue to checkout below.`,
        ""
      );
    } else if (dashboardState.desiredPackageCode) {
      setPackageStoreFeedback("The package selected from pricing could not be found. Choose another option below.", "error");
    } else if (dashboardState.purchaseStatus === "test-activated") {
      setPackageStoreFeedback(
        "Internal test package activated successfully. You can now test booking and session usage without paying.",
        "success"
      );
    } else if (!dashboardState.purchaseInFlight) {
      setPackageStoreFeedback(
        "Choose your approach, format, coach tier, and session bundle before checkout.",
        ""
      );
    }

    if (!visiblePackages.length) {
      packageCommitmentSelect.innerHTML = optionMarkup([], "No packages available", "");
      packageFormatSelect.innerHTML = optionMarkup([], "No formats available", "");
      packageTierSelect.innerHTML = optionMarkup([], "No coach tiers available", "");
      packageOptionSelect.innerHTML = optionMarkup([], "No bundles available", "");
      packageCommitmentSelect.disabled = true;
      packageFormatSelect.disabled = true;
      packageTierSelect.disabled = true;
      packageOptionSelect.disabled = true;
      if (packagePurchaseButton) {
        packagePurchaseButton.disabled = true;
      }
      if (sharedPackageFieldsNode) {
        sharedPackageFieldsNode.hidden = true;
      }
      packageSelectionSummaryNode.removeAttribute("data-crm-tone");
      packageSelectionSummaryNode.removeAttribute("data-tier-theme");
      packageSelectionSummaryNode.innerHTML = "<p>No active coaching packages are available right now.</p>";
      if (packageOptionRowsNode) {
        packageOptionRowsNode.innerHTML = `
          <tr>
            <td colspan="4">No active coaching packages are available right now.</td>
          </tr>
        `;
      }
      return;
    }

    dashboardState.packageFilters.commitment = selectedPackage?.commitment_kind || commitmentOptions[0]?.value || "";
    dashboardState.packageFilters.trainingFormat = selectedPackage?.training_format || formatOptions[0]?.value || "";
    dashboardState.packageFilters.tierCode = selectedPackage?.tier_code || tierOptions[0]?.value || "";
    dashboardState.packageFilters.packageCode = selectedPackage?.code || packageOptions[0]?.value || "";

    packageCommitmentSelect.disabled = false;
    packageFormatSelect.disabled = false;
    packageTierSelect.disabled = false;
    packageOptionSelect.disabled = false;

    packageCommitmentSelect.innerHTML = optionMarkup(
      commitmentOptions,
      "Select approach",
      dashboardState.packageFilters.commitment
    );
    packageFormatSelect.innerHTML = optionMarkup(
      formatOptions,
      "Select format",
      dashboardState.packageFilters.trainingFormat
    );
    packageTierSelect.innerHTML = optionMarkup(
      tierOptions,
      "Select coach tier",
      dashboardState.packageFilters.tierCode
    );
    packageOptionSelect.innerHTML = optionMarkup(
      packageOptions,
      "Select session bundle",
      dashboardState.packageFilters.packageCode
    );

    const tierPackages = sortPackageOptions(
      visiblePackages.filter(
        (item) =>
          item.commitment_kind === dashboardState.packageFilters.commitment
          && item.training_format === dashboardState.packageFilters.trainingFormat
          && item.tier_code === dashboardState.packageFilters.tierCode
      )
    );

    if (packageOptionRowsNode) {
      packageOptionRowsNode.innerHTML = tierPackages.length
        ? tierPackages
            .map((packageRecord) => {
              const isSelected = packageRecord.code === selectedPackage?.code;
              const packageTotal = Number(packageRecord.price_rm || 0);
              const perSession = packageTotal / Math.max(Number(packageRecord.sessions_included || 1), 1);
              return `
                <tr${isSelected ? ' class="is-selected-row"' : ""}>
                  <td>${escapeHtml(`${Number(packageRecord.sessions_included || 0)} sessions`)}</td>
                  <td>${escapeHtml(formatCurrency(packageTotal))}</td>
                  <td>${escapeHtml(formatCurrency(perSession))}</td>
                  <td>${escapeHtml(`${packageRecord.expiry_days || 0} days`)}</td>
                </tr>
              `;
            })
            .join("")
        : `
          <tr>
            <td colspan="4">No bundles match the current filters.</td>
          </tr>
        `;
    }

    if (!selectedPackage) {
      packageSelectionSummaryNode.removeAttribute("data-crm-tone");
      packageSelectionSummaryNode.removeAttribute("data-tier-theme");
      packageSelectionSummaryNode.innerHTML = "<p>Select a valid package bundle to continue.</p>";
      if (packagePurchaseButton) {
        packagePurchaseButton.disabled = true;
      }
      return;
    }

    const metadata = parseMetadata(selectedPackage);
    const tierTheme = resolveTierThemeKey(selectedPackage, metadata);
    const isInternalTest = Boolean(metadata.internalTest);
    const requiresSecondMember = selectedPackage.training_format === "one_to_two";

    if (sharedPackageFieldsNode) {
      sharedPackageFieldsNode.hidden = !requiresSecondMember;
    }

    if (packageSecondMemberInput) {
      packageSecondMemberInput.required = requiresSecondMember;
      if (!requiresSecondMember) {
        packageSecondMemberInput.value = "";
      }
    }

    if (packagePurchaseButton) {
      packagePurchaseButton.disabled = dashboardState.purchaseInFlight;
      packagePurchaseButton.textContent = dashboardState.purchaseInFlight
        ? "Preparing Checkout..."
        : isInternalTest
          ? "Activate Test Package"
          : "Continue to Secure Checkout";
    }

    packageSelectionSummaryNode.dataset.crmTone = tierTheme === "tier3" ? "alert" : tierTheme === "tier2" ? "warning" : tierTheme === "tier4" ? "success" : "info";
    packageSelectionSummaryNode.dataset.tierTheme = tierTheme;

    packageSelectionSummaryNode.innerHTML = `
      <div class="crm-selector-summary__head">
        <div>
          <span class="kicker kicker--accent">${escapeHtml(`${formatCommitmentFilterLabel(selectedPackage.commitment_kind)} | ${formatTrainingLabel(selectedPackage.training_format)}`)}</span>
          <h3>${escapeHtml(formatPackageDisplayName(selectedPackage))}</h3>
        </div>
        <strong>${escapeHtml(formatCurrency(selectedPackage.price_rm))}</strong>
      </div>
      <p>${escapeHtml(metadata.note || "Coaching package available for secure checkout.")}</p>
      <div class="chips">
        <span class="chip chip--accent">${escapeHtml(metadata.tierTitle || metadata.tierLabel || selectedPackage.tier_code)}</span>
        <span class="chip">${escapeHtml(`${Number(selectedPackage.sessions_included || 0)} sessions`)}</span>
        <span class="chip">${escapeHtml(`${selectedPackage.expiry_days || 0} day validity`)}</span>
        ${requiresSecondMember ? '<span class="chip">Second MEMBER ID required</span>' : ""}
      </div>
      <dl class="package-card__stats">
        <div>
          <dt>Package Total</dt>
          <dd>${escapeHtml(formatCurrency(selectedPackage.price_rm))}</dd>
        </div>
        <div>
          <dt>Per Session</dt>
          <dd>${escapeHtml(
            formatCurrency(Number(selectedPackage.price_rm || 0) / Math.max(Number(selectedPackage.sessions_included || 1), 1))
          )}</dd>
        </div>
        <div>
          <dt>Validity</dt>
          <dd>${escapeHtml(`${selectedPackage.expiry_days || 0} days`)}</dd>
        </div>
      </dl>
    `;
  }

  function renderBookingForm(data) {
    if (!bookingForm || !bookingPackageSelect) {
      return;
    }

    const submitButton = bookingForm.querySelector('button[type="submit"]');
    const hasManualRequestToggle = bookingRequestToggleButton instanceof HTMLButtonElement;
    const reservationCounts = buildReservationCountMap(data);
    const bookablePackages = getBookablePackages(data);
    const catalogById = new Map((data.packageCatalog || []).map((item) => [item.id, item]));
    const currentValue = String(bookingPackageSelect.value || "").trim();

    if (!bookablePackages.length) {
      bookingPackageSelect.innerHTML = '<option value="">No active package balance available</option>';
      bookingPackageSelect.disabled = true;

      if (submitButton) {
        submitButton.disabled = true;
      }

      if (hasManualRequestToggle) {
        bookingRequestToggleButton.disabled = true;
        bookingRequestToggleButton.setAttribute("aria-disabled", "true");
        setBookingRequestPanelOpen(false);
      }

      setBookingFeedback(
        "You need an active package with unreserved session balance before you can request a session.",
        true
      );
      return;
    }

    const defaultPackageId =
      (dashboardState.desiredPackageCode
        ? bookablePackages.find((item) => catalogById.get(item.package_id)?.code === dashboardState.desiredPackageCode)?.id
        : "") ||
      (bookablePackages.some((item) => item.id === currentValue) ? currentValue : bookablePackages[0].id);

    bookingPackageSelect.disabled = false;
    bookingPackageSelect.innerHTML = [
      '<option value="">Select package balance</option>',
      ...bookablePackages.map((packageRecord) => {
        const reservedCount = getReservedCountForPackage(packageRecord, reservationCounts);
        const bookableRemaining = getBookableRemainingForPackage(packageRecord, reservationCounts);
        const expiryLabel = packageRecord.expires_at ? formatShortDate(packageRecord.expires_at) : "no expiry set";
        const selectedAttribute = packageRecord.id === defaultPackageId ? " selected" : "";

        return `<option value="${escapeHtml(packageRecord.id)}"${selectedAttribute}>${escapeHtml(
          `${formatPackageDisplayName(packageRecord)} | ${bookableRemaining} free to book | ${reservedCount} reserved | expires ${expiryLabel}`
        )}</option>`;
      }),
    ].join("");

    if (submitButton) {
      submitButton.disabled = false;
    }

    if (hasManualRequestToggle) {
      bookingRequestToggleButton.disabled = false;
      bookingRequestToggleButton.removeAttribute("aria-disabled");
    }

    const totalBookable = bookablePackages.reduce(
      (total, packageRecord) => total + getBookableRemainingForPackage(packageRecord, reservationCounts),
      0
    );
    setBookingFeedback(
      `${totalBookable} bookable session${totalBookable === 1 ? "" : "s"} available across your active package balance.`,
      false
    );
  }

  function renderCalendarPreviewFallback(targetNode, title, body) {
    if (!(targetNode instanceof HTMLElement)) {
      return;
    }

    targetNode.innerHTML = `
      <article class="dashboard-note" data-crm-tone="warning">
        <strong>${escapeHtml(title)}</strong>
        <p>${escapeHtml(body)}</p>
      </article>
    `;
  }

  function renderLiveCoachCalendar(targetNode, data, options = {}) {
    const availabilityHelper = window.LEGACY_COACH_AVAILABILITY;
    const liveAvailability = dashboardState.liveCoachAvailability;
    if (!(targetNode instanceof HTMLElement) || !availabilityHelper || !liveAvailability?.calendar) {
      return { rendered: false, availableBlocks: 0 };
    }

    targetNode.hidden = false;
    availabilityHelper.renderCalendar(targetNode, {
      coachName: liveAvailability.coachName || getAssignedCoachName(data),
      coach: liveAvailability,
      interactive: options.interactive !== false,
      onSelect: options.onSelect,
      emptyMessage: options.emptyMessage || "No published availability yet.",
      lookaheadDays: Number(options.lookaheadDays || 28),
      daysPerView: Number(options.daysPerView || 7),
      locale: "en-MY",
    });

    return {
      rendered: true,
      availableBlocks: availabilityHelper.getAvailableBlockCount(liveAvailability, {
        lookaheadDays: Number(options.lookaheadDays || 28),
        locale: "en-MY",
      }),
    };
  }

  function getClientCalendarDaysPerView() {
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
    if (viewportWidth <= 400) {
      return 3;
    }
    if (viewportWidth <= 560) {
      return 4;
    }
    if (viewportWidth <= 760) {
      return 5;
    }
    return 7;
  }

  function renderCoachAvailability(data) {
    const hasBookablePackages = getBookablePackages(data).length > 0;
    const daysPerView = getClientCalendarDaysPerView();
    const bookingCalendar = renderLiveCoachCalendar(bookingCalendarNode, data, {
      interactive: true,
      lookaheadDays: 28,
      daysPerView,
      emptyMessage: "Your coach has not published any bookable slots yet.",
      onSelect: ({ block }) => {
        applyLiveCoachAvailabilitySelection(block);
      },
    });
    const availabilityCalendar = renderLiveCoachCalendar(coachAvailabilityCalendarNode, data, {
      interactive: false,
      lookaheadDays: 28,
      daysPerView,
      emptyMessage: "Your coach has not published any availability windows yet.",
    });

    if (bookingCalendar.rendered && hasBookablePackages) {
      setBookingFeedback(
        bookingCalendar.availableBlocks
          ? "Tap any available block to prefill your booking request. If you need a different day or time, open the manual request panel below."
          : "Your coach is synced, but there are no published slots available right now. Use the manual request option below.",
        false
      );
    } else if (bookingCalendarNode && hasBookablePackages) {
      renderCalendarPreviewFallback(
        bookingCalendarNode,
        data.assignment?.coach_id ? "Calendar sync is still warming up" : "Coach assignment pending",
        data.assignment?.coach_id
          ? "You can still request a specific day and time while the live booking calendar finishes syncing."
          : "Booking opens once a coach is assigned to your account."
      );
      setBookingFeedback(
        data.assignment?.coach_id
          ? "Use the manual request button below if you already know the day and time you want."
          : "You need an assigned coach before live booking can open.",
        !data.assignment?.coach_id
      );
    }

    if (availabilityCalendar.rendered) {
      if (coachAvailabilityFallbackNode) {
        coachAvailabilityFallbackNode.hidden = true;
      }
      setCoachAvailabilityFeedback(
        availabilityCalendar.availableBlocks
          ? "This 4-week reference view mirrors your coach's published calendar so you can plan ahead before requesting or changing sessions."
          : "Your coach calendar is connected, but there are no published availability blocks in the next 4 weeks yet.",
        false
      );
      return;
    }

    if (!coachAvailabilityRowsNode) {
      return;
    }

    const windows = sortAvailabilityWindows(data.coachAvailabilityWindows || []);
    if (coachAvailabilityFallbackNode) {
      coachAvailabilityFallbackNode.hidden = false;
    }
    if (coachAvailabilityCalendarNode) {
      coachAvailabilityCalendarNode.innerHTML = "";
    }

    if (!windows.length) {
      coachAvailabilityRowsNode.innerHTML = buildEmptyTableRow(
        3,
        "No coach windows published yet.",
        "Your coach can still confirm a custom time manually. This table will fill once standing booking windows are published."
      );
      setCoachAvailabilityFeedback(
        data.assignment?.coach_id
          ? "Your coach can still confirm a custom time manually, but no standing windows are published yet."
          : "You do not have an assigned coach yet, so no availability windows are available.",
        !data.assignment?.coach_id
      );
      return;
    }

    coachAvailabilityRowsNode.innerHTML = windows
      .map(
        (windowRecord) => `
          <tr>
            <td>${escapeHtml(formatDayOfWeek(windowRecord.day_of_week))}</td>
            <td>${escapeHtml(`${formatTime(windowRecord.start_time)} - ${formatTime(windowRecord.end_time)}`)}</td>
            <td>${escapeHtml(windowRecord.timezone || "Asia/Kuala_Lumpur")}</td>
          </tr>
        `
      )
      .join("");
    setCoachAvailabilityFeedback(
      "Your coach has published recurring windows below. Use them as a reference if the live calendar is still syncing or if you need to request a manual slot.",
      false
    );
  }

  function renderConfirmedSessions(data) {
    if (!confirmedSessionRowsNode) {
      return;
    }

    const coachLookup = new Map(data.coachProfiles.map((coach) => [coach.id, coach.display_name || "Coach"]));
    const packageById = new Map((data.packages || []).map((pkg) => [pkg.id, pkg]));
    const pendingRequestBySessionId = sessionChangeStatusBySessionId(data);
    const scheduledSessions = (data.sessions || [])
      .filter((session) => session.status === "scheduled")
      .sort((left, right) => toTimestamp(left.scheduled_start) - toTimestamp(right.scheduled_start));

    if (!scheduledSessions.length) {
      confirmedSessionRowsNode.innerHTML = buildEmptyTableRow(
        6,
        "No confirmed sessions yet.",
        "Once a booking is approved, your upcoming session will appear here together with reschedule or cancellation controls."
      );
      return;
    }

    confirmedSessionRowsNode.innerHTML = scheduledSessions
      .map((session) => {
        const packageRecord = packageById.get(session.client_package_id);
        const pendingChange = pendingRequestBySessionId.get(session.id);
        const actionMarkup = pendingChange
          ? `<span class="dashboard-table__static-action">${escapeHtml(`${normalizeRequestTypeLabel(pendingChange.request_type)} Pending`)}</span>`
          : `
              <div class="dashboard-table-action-group">
                <button class="btn btn-ghost" type="button" data-session-change-intent="reschedule" data-session-id="${escapeHtml(session.id)}">Reschedule</button>
                <button class="btn btn-ghost" type="button" data-session-change-intent="cancel" data-session-id="${escapeHtml(session.id)}">Cancel</button>
              </div>
            `;

        return `
          <tr>
            <td>${escapeHtml(formatDate(session.scheduled_start))}</td>
            <td>${escapeHtml(`${formatTime(session.scheduled_start)} - ${formatTime(session.scheduled_end)}`)}</td>
            <td>${escapeHtml(coachLookup.get(session.coach_id) || "Coach")}</td>
            <td>${escapeHtml(formatPackageDisplayName(packageRecord) || "Package")}</td>
            <td class="dashboard-table__cell--status">${buildDashboardStatusMarkup(session.status)}</td>
            <td class="dashboard-table__cell--action">${actionMarkup}</td>
          </tr>
        `;
      })
      .join("");
  }

  function renderSessionChangeForm(data) {
    if (!sessionChangeSessionSelect) {
      return;
    }

    const scheduledSessions = (data.sessions || [])
      .filter((session) => session.status === "scheduled")
      .sort((left, right) => toTimestamp(left.scheduled_start) - toTimestamp(right.scheduled_start));
    const currentValue = String(sessionChangeSessionSelect.value || "").trim();

    if (!scheduledSessions.length) {
      sessionChangeSessionSelect.innerHTML = '<option value="">No confirmed sessions available</option>';
      sessionChangeSessionSelect.disabled = true;
      if (sessionChangeForm) {
        const submitButton = sessionChangeForm.querySelector('button[type="submit"]');
        if (submitButton) {
          submitButton.disabled = true;
        }
      }
      setSessionChangeFeedback("You need a confirmed session before you can request a reschedule or cancellation.", true);
      return;
    }

    sessionChangeSessionSelect.disabled = false;
    sessionChangeSessionSelect.innerHTML = [
      '<option value="">Select scheduled session</option>',
      ...scheduledSessions.map((session) => {
        const selectedAttribute = session.id === currentValue ? " selected" : "";
        return `<option value="${escapeHtml(session.id)}"${selectedAttribute}>${escapeHtml(
          `${formatDate(session.scheduled_start)} | ${formatTime(session.scheduled_start)}`
        )}</option>`;
      }),
    ].join("");

    if (sessionChangeForm) {
      const submitButton = sessionChangeForm.querySelector('button[type="submit"]');
      if (submitButton) {
        submitButton.disabled = false;
      }
    }

    syncSessionChangeFormVisibility();
    setSessionChangeFeedback(
      "Submit a request here if a confirmed session needs to move or be cancelled.",
      false
    );
  }

  function renderOpenRequests(data) {
    if (!openRequestRowsNode) {
      return;
    }

    const coachLookup = new Map(data.coachProfiles.map((coach) => [coach.id, coach.display_name || "Coach"]));
    const pendingBookingRows = (data.bookingRequests || [])
      .filter((request) => request.status === "pending")
      .map((request) => ({
      sortKey: toTimestamp(`${request.requested_date}T${request.requested_time}`) || Date.now(),
      typeLabel: "Booking Request",
      requestedFor: `${formatDate(request.requested_date)} | ${formatTime(request.requested_time)}`,
      detailLabel: `${requestTypeFromNotes(request.notes)} | ${request.preferred_coach_id ? coachLookup.get(request.preferred_coach_id) || "Coach" : "No coach preference"}`,
      statusLabel: normalizeStatusLabel(request.status),
    }));
    const changeRows = (data.sessionChangeRequests || [])
      .filter((request) => request.status === "pending")
      .map((request) => ({
      sortKey: toTimestamp(request.created_at),
      typeLabel: normalizeRequestTypeLabel(request.request_type),
      requestedFor: request.request_type === "cancel"
        ? formatDateTime(request.original_start)
        : `${formatDateTime(request.original_start)} -> ${formatDateTime(request.requested_start)}`,
      detailLabel: request.reason || "No reason submitted.",
      statusLabel: normalizeStatusLabel(request.status),
    }));

    const rows = pendingBookingRows.concat(changeRows).sort((left, right) => right.sortKey - left.sortKey);
    if (!rows.length) {
      openRequestRowsNode.innerHTML = `
        <tr>
          <td colspan="4">No open booking or session change requests.</td>
        </tr>
      `;
      return;
    }

    openRequestRowsNode.innerHTML = rows
      .map(
        (row) => `
          <tr>
            <td>${escapeHtml(row.typeLabel)}</td>
            <td>${escapeHtml(row.requestedFor)}</td>
            <td>${escapeHtml(row.detailLabel)}</td>
            <td>${escapeHtml(row.statusLabel)}</td>
          </tr>
        `
      )
      .join("");
  }

  function renderSchedule(data) {
    if (!scheduleRowsNode) {
      return;
    }

    const coachLookup = new Map(data.coachProfiles.map((coach) => [coach.id, coach.display_name || "Coach"]));
    const items = [];

    data.sessions.forEach((session) => {
      items.push({
        sortKey: new Date(session.scheduled_start).getTime(),
        dateLabel: formatDate(session.scheduled_start),
        timeLabel: `${formatTime(session.scheduled_start)} - ${formatTime(session.scheduled_end)}`,
        typeLabel: "Confirmed Session",
        coachLabel: coachLookup.get(session.coach_id) || "Coach",
        statusLabel: normalizeStatusLabel(session.status),
      });
    });

    data.bookingRequests.forEach((request) => {
      const requestDate = new Date(`${request.requested_date}T${request.requested_time}`);
      const noteParts = String(request.notes || "")
        .split("|")
        .map((part) => part.trim())
        .filter(Boolean);
      const typeLabel = noteParts[0] ? noteParts[0].replace(/^Session type:\s*/iu, "") : "Booking Request";

      items.push({
        sortKey: Number.isNaN(requestDate.getTime()) ? Date.now() : requestDate.getTime(),
        dateLabel: formatDate(request.requested_date),
        timeLabel: formatTime(request.requested_time),
        typeLabel,
        coachLabel: request.preferred_coach_id ? coachLookup.get(request.preferred_coach_id) || "Coach" : "No coach preference",
        statusLabel: normalizeStatusLabel(request.status),
      });
    });

    items.sort((left, right) => left.sortKey - right.sortKey);

    if (!items.length) {
      scheduleRowsNode.innerHTML = buildEmptyTableRow(
        5,
        "No booking activity yet.",
        "Your booking requests, approved sessions, and schedule changes will all appear here in one running timeline."
      );
      return;
    }

    scheduleRowsNode.innerHTML = items
      .slice(0, 8)
      .map(
        (item) => `
          <tr>
            <td>${escapeHtml(item.dateLabel)}</td>
            <td>${escapeHtml(item.timeLabel)}</td>
            <td>${escapeHtml(item.typeLabel)}</td>
            <td>${escapeHtml(item.coachLabel)}</td>
            <td>${escapeHtml(item.statusLabel)}</td>
          </tr>
        `
      )
      .join("");
  }

  function renderPurchaseHistory(data) {
    if (!purchaseHistoryRowsNode) {
      return;
    }

    if (!data.orders.length) {
      purchaseHistoryRowsNode.innerHTML = buildEmptyTableRow(
        6,
        "No purchases on this account yet.",
        "Package purchases, payment confirmation, and any refund history will appear here once checkout is completed."
      );
      return;
    }

    const itemLookup = new Map();
    const packageLookup = new Map();

    data.orderItems.forEach((item) => {
      if (!itemLookup.has(item.order_id)) {
        itemLookup.set(item.order_id, item.name);
      }
    });

    data.packages.forEach((packageRecord) => {
      packageLookup.set(packageRecord.order_id, packageRecord);
    });

    purchaseHistoryRowsNode.innerHTML = data.orders
      .map((order) => {
        const packageRecord = packageLookup.get(order.id);
        const packageName = packageRecord?.package_name || itemLookup.get(order.id) || "Package Purchase";
        const sessionsLabel = packageRecord
          ? `${Number(packageRecord.sessions_remaining || 0)}/${Number(packageRecord.sessions_purchased || 0)} remaining`
          : order.status === "paid"
            ? "Awaiting activation"
            : "Pending payment";

        return `
          <tr>
            <td>${escapeHtml(formatDate(order.created_at))}</td>
            <td>${escapeHtml(packageRecord ? formatPackageDisplayName(packageRecord) : packageName)}</td>
            <td>${escapeHtml(formatCurrency(order.total_amount_rm))}</td>
            <td>${escapeHtml(sessionsLabel)}</td>
            <td class="dashboard-table__cell--status">${buildDashboardStatusMarkup(order.status)}</td>
            <td>${renderBillingDocumentActions(order)}</td>
          </tr>
        `;
      })
      .join("");
  }

  function renderPoints(data) {
    if (!pointsRowsNode) {
      return;
    }

    const gamificationConfig = getGamificationConfig();
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const monthStart = new Date();
    monthStart.setHours(0, 0, 0, 0);
    monthStart.setDate(1);
    const monthStartTime = monthStart.getTime();
    const approvedEntries = (data.pointsLedger || []).filter(
      (entry) => entry.approval_status === "approved" || entry.approval_status === "auto_approved"
    );
    const monthlyCoins = approvedEntries.reduce((total, entry) => {
      const createdAt = new Date(entry.created_at || 0).getTime();
      return entry.points_type === "gym_coins" && !Number.isNaN(createdAt) && createdAt >= monthStartTime
        ? total + Number(entry.delta || 0)
        : total;
    }, 0);
    const levelSummary = gamificationConfig
      ? calculateBundleLevel(Number(data.clientProfile?.xp_points || 0), gamificationConfig.xpCurve)
      : null;
    const weeklyChanges = data.pointsLedger.reduce(
      (accumulator, entry) => {
        if (entry.approval_status !== "approved" && entry.approval_status !== "auto_approved") {
          return accumulator;
        }

        const createdAt = new Date(entry.created_at).getTime();
        if (Number.isNaN(createdAt) || createdAt < oneWeekAgo) {
          return accumulator;
        }

        const key = entry.points_type === "gym_coins" ? "gym_coins" : "xp";
        accumulator[key] += Number(entry.delta || 0);
        return accumulator;
      },
      { xp: 0, gym_coins: 0 }
    );

    const rows = [
      {
        label: "XP",
        current: Number(data.clientProfile?.xp_points || 0),
        weeklyChange: weeklyChanges.xp,
        progress: gamificationConfig
          ? levelSummary?.remainingXp
            ? `Level ${levelSummary.currentLevel} • ${formatMetric(levelSummary.remainingXp)} XP to Level ${levelSummary.nextLevel}`
            : `Level ${levelSummary?.currentLevel || 0} reached`
          : data.clientProfile?.xp_points
            ? "Progress is updating from approved coach rewards."
            : "No approved XP activity yet.",
      },
      {
        label: "Gym Coins",
        current: Number(data.clientProfile?.gym_coins || 0),
        weeklyChange: weeklyChanges.gym_coins,
        progress: gamificationConfig
          ? `${formatMetric(monthlyCoins)} / ${formatMetric(gamificationConfig.settings.monthlyCoinCap)} counted this month • ${formatCurrency(Number(data.clientProfile?.gym_coins || 0) * Number(gamificationConfig.settings.coinValueRM || 0))} value`
          : data.clientProfile?.gym_coins
            ? "Spendable rewards will build here as approvals come in."
            : "No approved gym coin activity yet.",
      },
    ];

    pointsRowsNode.innerHTML = rows
      .map(
        (row) => `
          <tr>
            <td>${escapeHtml(row.label)}</td>
            <td>${escapeHtml(String(row.current))}</td>
            <td>${escapeHtml(row.weeklyChange > 0 ? `+${row.weeklyChange}` : String(row.weeklyChange))}</td>
            <td>${escapeHtml(row.progress)}</td>
          </tr>
        `
      )
      .join("");
  }

  function renderRewardBank(data) {
    const homeSummary = getClientHomeSummary(data);
    const currentXp = Number(homeSummary.currentXp || 0);
    const currentCoins = Number(homeSummary.currentCoins || 0);
    const gamificationConfig = getGamificationConfig();
    const approvedXpEntriesCount = Number(homeSummary.approvedXpEntriesCount || 0);
    const approvedCoinEntriesCount = Number(homeSummary.approvedCoinEntriesCount || 0);
    const approvedRewardEntriesCount = Number(homeSummary.approvedRewardEntriesCount || 0);
    const weeklyXp = Number(homeSummary.weeklyXp || 0);
    const weeklyCoins = Number(homeSummary.weeklyCoins || 0);
    const monthXp = Number(homeSummary.monthlyXp || 0);
    const monthlyCoins = Number(homeSummary.monthlyCoins || 0);
    const completedSessions = (data.sessions || []).filter((session) => session.status === "completed");
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const weeklyCompletedSessions = countBy(completedSessions, (session) => {
      const completedAt = new Date(session.completed_at || session.updated_at || 0).getTime();
      return !Number.isNaN(completedAt) && completedAt >= weekAgo;
    });
    const levelSummary = gamificationConfig
      ? calculateBundleLevel(currentXp, gamificationConfig.xpCurve)
      : {
          currentLevel: Math.floor(currentXp / 5000),
          nextLevel: Math.floor(currentXp / 5000) + 1,
          progressCurrent: currentXp - Math.floor(currentXp / 5000) * 5000,
          progressTarget: 5000,
          progressPercent: Math.max(2, Math.min(100, ((currentXp - Math.floor(currentXp / 5000) * 5000) / 5000) * 100)),
          remainingXp: Math.max(0, Math.max(Math.floor(currentXp / 5000) * 5000 + 5000, 5000) - currentXp),
        };
    const coinValue = Number(gamificationConfig?.settings?.coinValueRM || 0);
    const vaultXpNode = document.getElementById("client-vault-xp-bank");
    const vaultXpNoteNode = document.getElementById("client-vault-xp-bank-note");
    const vaultCoinNode = document.getElementById("client-vault-coin-wallet");
    const vaultCoinNoteNode = document.getElementById("client-vault-coin-wallet-note");
    const vaultMomentumNode = document.getElementById("client-vault-weekly-momentum");
    const vaultMomentumNoteNode = document.getElementById("client-vault-weekly-momentum-note");
    const vaultUnlockNode = document.getElementById("client-vault-next-unlock");
    const vaultUnlockNoteNode = document.getElementById("client-vault-next-unlock-note");

    if (vaultXpNode) {
      vaultXpNode.textContent = formatMetric(currentXp);
    }
    if (vaultXpNoteNode) {
      vaultXpNoteNode.textContent = `${approvedXpEntriesCount} approved XP awards · ${formatMetric(monthXp)} earned this month`;
    }
    if (vaultCoinNode) {
      vaultCoinNode.textContent = formatMetric(currentCoins);
    }
    if (vaultCoinNoteNode) {
      vaultCoinNoteNode.textContent = gamificationConfig
        ? `${approvedCoinEntriesCount} approved coin drops · ${formatMetric(monthlyCoins)} / ${formatMetric(gamificationConfig.settings.monthlyCoinCap)} counted this month`
        : `${approvedCoinEntriesCount} approved coin drops · ready for redemptions and milestones`;
    }
    if (vaultMomentumNode) {
      vaultMomentumNode.textContent = `${weeklyXp + weeklyCoins}`;
    }
    if (vaultMomentumNoteNode) {
      vaultMomentumNoteNode.textContent = `${weeklyCompletedSessions} completed sessions · ${weeklyXp} XP · ${weeklyCoins} coins this week`;
    }
    if (vaultUnlockNode) {
      vaultUnlockNode.textContent = gamificationConfig ? `Level ${levelSummary.nextLevel}` : "Legacy Vanguard";
    }
    if (vaultUnlockNoteNode) {
      vaultUnlockNoteNode.textContent = levelSummary.remainingXp > 0
        ? `Advance in ${formatMetric(levelSummary.remainingXp)} XP`
        : "Current top level achieved";
    }

    if (progressSummaryNode) {
      progressSummaryNode.textContent = `${completedSessions.length} completed sessions, ${approvedRewardEntriesCount} approved reward entries, and ${currentXp} verified XP now place you at Level ${levelSummary.currentLevel}.`;
    }
    if (progressLevelLabelNode) {
      progressLevelLabelNode.textContent = `Level ${levelSummary.currentLevel} • ${formatMetric(levelSummary.progressCurrent)} / ${formatMetric(levelSummary.progressTarget)} XP`;
    }
    if (progressLevelFillNode) {
      progressLevelFillNode.style.width = `${levelSummary.progressPercent}%`;
    }
    if (progressWeekTitleNode) {
      progressWeekTitleNode.textContent = weeklyCompletedSessions ? `${weeklyCompletedSessions} sessions completed` : "Needs momentum";
    }
    if (progressWeekNoteNode) {
      progressWeekNoteNode.textContent = `${formatMetric(weeklyXp)} counted XP in the last 7 days`;
    }
    if (progressCoinTitleNode) {
      progressCoinTitleNode.textContent = gamificationConfig
        ? currentCoins
          ? `${formatMetric(currentCoins)} coins • ${formatCurrency(currentCoins * coinValue)}`
          : "Coin bank building"
        : currentCoins
          ? `${formatMetric(currentCoins)} coins banked`
          : "Coin bank building";
    }
    if (progressCoinNoteNode) {
      progressCoinNoteNode.textContent = gamificationConfig
        ? `${formatMetric(monthlyCoins)} / ${formatMetric(gamificationConfig.settings.monthlyCoinCap)} counted this month`
        : `${formatMetric(weeklyCoins)} counted coins this week`;
    }

    if (performanceMixNode) {
      const performanceItems = [
        {
          label: "Coach-approved XP",
          value: Number(homeSummary.lifetimeApprovedXp || 0),
          tone: "ember",
        },
        {
          label: "Completed sessions",
          value: completedSessions.length * 120,
          tone: "gold",
        },
        {
          label: "Gym coin momentum",
          value: Number(homeSummary.lifetimeApprovedCoins || 0) * 40,
          tone: "bronze",
        },
      ].filter((item) => item.value > 0);

      const rows = performanceItems.length
        ? performanceItems
        : [{ label: "Coach-approved XP", value: 0, tone: "ember" }];
      const maxValue = Math.max(...rows.map((item) => item.value), 1);

      performanceMixNode.innerHTML = rows
        .map(
          (item) => `
            <article class="client-performance-row client-performance-row--${escapeHtml(item.tone)}">
              <div class="client-performance-row__head">
                <span>${escapeHtml(item.label)}</span>
                <strong>${escapeHtml(formatMetric(item.value))}</strong>
              </div>
              <div class="metric-bar-track">
                <span class="metric-bar-fill" style="width:${Math.max(4, Math.min(100, (item.value / maxValue) * 100))}%"></span>
              </div>
            </article>
          `
        )
        .join("");
    }
  }

  function formatMetric(value) {
    const numeric = Number(value || 0);
    if (!Number.isFinite(numeric)) {
      return "0";
    }
    return new Intl.NumberFormat("en-MY", { maximumFractionDigits: 0 }).format(numeric);
  }

  function renderRewardBadgeTrack(data) {
    if (!rewardBadgeGridNode) {
      return;
    }

    const gamificationConfig = getGamificationConfig();
    if (!gamificationConfig) {
      rewardBadgeGridNode.innerHTML = `
        <article class="dashboard-badge">
          <strong>First Verified Session</strong>
          <p>Your reward trail begins once your first completed session is verified inside the CRM.</p>
        </article>
        <article class="dashboard-badge">
          <strong>Weekly Consistency</strong>
          <p>Check-ins, completed sessions, and approved activity will stack into your momentum line here.</p>
        </article>
        <article class="dashboard-badge">
          <strong>Next Unlock</strong>
          <p>XP, gym coins, and milestone badges appear here after live reward rules start firing.</p>
        </article>
      `;
      return;
    }

    const homeSummary = getClientHomeSummary(data);
    const approvedActionIds = Array.isArray(homeSummary.earnedActionIds) && homeSummary.earnedActionIds.length
      ? homeSummary.earnedActionIds
      : Array.from(
          new Set(
            (data.pointsLedger || [])
              .filter((entry) => entry.approval_status === "approved" || entry.approval_status === "auto_approved")
              .map((entry) => extractActionIdFromRewardReason(entry.reason))
              .filter(Boolean)
          )
        );

    const earnedActions = approvedActionIds
      .map((actionId) => gamificationConfig.actionsById.get(actionId))
      .filter(Boolean);

    const showcaseActions = (
      earnedActions.length
        ? earnedActions
        : gamificationConfig.actions
            .filter((action) => ["Achievement", "Boss", "Milestone"].includes(action.earnType) || ["Achievement", "Boss", "Milestone"].includes(action.category))
            .sort((left, right) => Number(right.xp || 0) - Number(left.xp || 0))
            .slice(0, 6)
    ).slice(0, 6);

    rewardBadgeGridNode.innerHTML = showcaseActions.length
      ? showcaseActions
          .map((action) => {
            const earned = approvedActionIds.includes(action.actionId);
            return `
              <article class="dashboard-badge">
                <strong>${escapeHtml(earned ? `${action.displayName} • Unlocked` : action.displayName)}</strong>
                <p>${escapeHtml(`${action.category || "General"} • ${action.earnType || "Routine"} • ${getRewardActionLabel(action)}`)}</p>
              </article>
            `;
          })
          .join("")
      : `
        <article class="dashboard-badge">
          <strong>First Verified Session</strong>
          <p>Your badge shelf activates as soon as approved reward actions start landing on your account.</p>
        </article>
        <article class="dashboard-badge">
          <strong>Weekly Momentum</strong>
          <p>Consistency-based unlocks will start showing once your coaching block begins generating approved entries.</p>
        </article>
        <article class="dashboard-badge">
          <strong>Milestone Shelf</strong>
          <p>Higher-tier achievements appear here once you stack enough verified XP and gym coins.</p>
        </article>
      `;
  }

  function renderClientLeaderboard(data) {
    if (!clientLeaderboardRowsNode) {
      return;
    }

    const rows = Array.isArray(data.clientLeaderboard) ? data.clientLeaderboard : [];
    if (dashboardState.pendingLeaderboardHydration && !rows.length) {
      clientLeaderboardRowsNode.innerHTML = buildClientLeaderboardSkeleton(3);
      return;
    }

    if (!rows.length) {
      clientLeaderboardRowsNode.innerHTML = `
        <article class="leaderboard-row leaderboard-row--empty">
          <strong>Leaderboard starts once approved reward activity lands.</strong>
          <p>Only approved XP and gym coin movement counts, so the standings stay fair and easy to trust.</p>
        </article>
      `;
      return;
    }

    clientLeaderboardRowsNode.innerHTML = rows
      .map((entry) => {
        const displayName = String(entry.displayName || "Client").trim() || "Client";
        const avatarUrl = resolveLeaderboardAvatarUrl(entry);
        const goalNote = String(entry.primaryGoal || "").trim() || "Goal still being defined with coach support.";
        const identityNote = String(entry.memberId || "").trim()
          ? `Member ID ${entry.memberId}`
          : "Live client account";

        return `
          <article class="leaderboard-row">
            <div class="leaderboard-row__rank">#${escapeHtml(String(entry.rank || ""))}</div>
            <div class="leaderboard-row__avatar" aria-hidden="true">
              ${avatarUrl
                ? `<img alt="${escapeHtml(displayName)}" src="${escapeHtml(avatarUrl)}" />`
                : buildAvatarFallbackMarkup(displayName, { variant: "compact" })}
            </div>
            <div class="leaderboard-row__body">
              <div class="leaderboard-row__head">
                <strong>${escapeHtml(displayName)}</strong>
                <span>${escapeHtml(identityNote)}</span>
              </div>
              <p>${escapeHtml(goalNote)}</p>
            </div>
            <div class="leaderboard-row__metrics">
              <div>
                <span>XP</span>
                <strong>${escapeHtml(formatMetric(entry.xpPoints || 0))}</strong>
              </div>
              <div>
                <span>Coins</span>
                <strong>${escapeHtml(formatMetric(entry.gymCoins || 0))}</strong>
              </div>
            </div>
          </article>
        `;
      })
      .join("");
  }

  function renderDashboard(data) {
    dashboardState.data = data;
    renderProfile(data);
    renderPlannerBrief(data);
    renderHomeFocus(data);
    renderClientProfilePage(data);
    renderStats(data);
    renderRewardBank(data);
    renderRewardBadgeTrack(data);
    renderOwnedPackages(data);
    renderPackageCatalog(data);
    renderBookingForm(data);
    renderCoachAvailability(data);
    renderConfirmedSessions(data);
    renderSessionChangeForm(data);
    renderOpenRequests(data);
    renderSchedule(data);
    renderPurchaseHistory(data);
    renderPoints(data);
    renderClientLeaderboard(data);
    setStatus("");
  }

  async function loadDashboard(options) {
    const config = options || {};
    let hasVisibleData = Boolean(dashboardState.data);
    const loadStartedAt = typeof window.performance?.now === "function" ? window.performance.now() : 0;
    const silent = Boolean(config.silent && hasVisibleData);
    const allowCacheFallback = config.allowCacheFallback !== false;
    const loadCycleId = dashboardState.loadCycleId + 1;
    let access = dashboardState.access;
    dashboardState.loadInFlight = true;
    dashboardState.loadCycleId = loadCycleId;

    try {
      ({ access } = await loadAccessAndClient());
      bindLiveDashboardEvents();

      if (!hasVisibleData && allowCacheFallback && access?.user?.id) {
        const cachedData = readDashboardCache(access.user.id);
        if (cachedData) {
          const hydratedCachedData = mergeDashboardData(cachedData, dashboardState.data);
          renderDashboard(hydratedCachedData);
          hasVisibleData = true;
          if (!silent) {
            setStatus("Loading fresh client data...");
          }
        }
      }

      if (!hasVisibleData && !silent) {
        renderInitialDashboardSkeleton();
        setStatus("Loading your live dashboard data...");
      }

      dashboardState.pendingLeaderboardHydration = shouldDeferSecondaryPayload()
        && !(hasVisibleData && Array.isArray(dashboardState.data?.clientLeaderboard) && dashboardState.data.clientLeaderboard.length);
      dashboardState.pendingPlannerHydration = shouldHydratePlannerAfterPaint()
        && !(hasVisibleData && dashboardState.data?.plannerSnapshot);

      const freshData = await fetchDashboardData(
        shouldDeferSecondaryPayload()
          ? { variant: "primary" }
          : {}
      );
      const data = mergeDashboardData(freshData, dashboardState.data);
      writeDashboardCache(access.user.id, data);
      renderDashboard(data);
      if (DASHBOARD_PAGE_KEY === "settings") {
        const wearableIntent = consumeWearableIntentFromUrl();
        await loadWearableWorkspace({ preserveMessage: true });
        if (wearableIntent) {
          setWearableFeedback(wearableIntent.message, wearableIntent.tone);
        } else {
          setWearableFeedback("Connect one wearable source to start syncing sleep and movement data into your member profile.", "");
        }
      }
      void syncLiveCoachAvailability(data);
      void setupRealtimeDashboardRefresh().catch(() => null);
      scheduleAfterInitialPaint(() => hydrateDeferredDashboardSections(loadCycleId, access.user.id));
      if (loadStartedAt) {
        console.info(`[LEGACY] Client dashboard rendered in ${Math.round(window.performance.now() - loadStartedAt)}ms`);
      }
    } catch (error) {
      if (hasVisibleData) {
        setStatus("Live sync stalled. Keeping the current dashboard visible while it retries.", true);
        return;
      }

      if (allowCacheFallback && access?.user?.id) {
        const cachedData = readDashboardCache(access.user.id);
        if (cachedData) {
          const hydratedCachedData = mergeDashboardData(cachedData, dashboardState.data);
          renderDashboard(hydratedCachedData);
          void syncLiveCoachAvailability(hydratedCachedData);
          setStatus("Showing recent saved data while the live refresh retries.", true);
          return;
        }
      }

      setStatus(error?.message || "Unable to load your live dashboard data right now.", true);
    } finally {
      dashboardState.loadInFlight = false;
      if (dashboardState.pendingRefreshReason) {
        const pendingReason = dashboardState.pendingRefreshReason;
        const pendingSilent = dashboardState.pendingRefreshSilent !== false;
        dashboardState.pendingRefreshReason = "";
        dashboardState.pendingRefreshSilent = true;
        scheduleDashboardRefresh(pendingReason, {
          silent: pendingSilent,
          delay: 0,
        });
      }
    }
  }

  async function startPackageCheckout(packageCode, secondMemberId) {
    if (!packageCode || dashboardState.purchaseInFlight) {
      return;
    }

    try {
      const { supabase } = await loadAccessAndClient();
      const packageRecord = (dashboardState.data?.packageCatalog || []).find((item) => item.code === packageCode);
      if (!packageRecord) {
        throw new Error("Selected package is no longer available.");
      }

      const accessToken = await window.legacyAuth?.getAccessToken?.();
      if (!accessToken) {
        throw new Error("Your session expired. Please log in again.");
      }

      const requiresSecondMember = packageRecord.training_format === "one_to_two";
      const normalizedSecondMemberId = String(secondMemberId || "").trim().toUpperCase();
      if (requiresSecondMember && !normalizedSecondMemberId) {
        throw new Error("Enter the second client MEMBER ID before continuing with a 1-to-2 package.");
      }

      dashboardState.purchaseInFlight = true;
      renderPackageCatalog(dashboardState.data || { packageCatalog: [] });
      setPackageStoreFeedback(`Preparing secure checkout for ${packageRecord.name}...`, "");

      const response = await window.fetch("/.netlify/functions/create-package-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          packageCode,
          secondMemberId: normalizedSecondMemberId,
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload?.checkoutUrl) {
        throw new Error(payload?.error || "Unable to create the package checkout right now.");
      }

      setPackageStoreFeedback("Checkout created. Redirecting to secure payment...", "success");
      clearPackageIntentFromUrl();
      window.location.assign(payload.checkoutUrl);
    } catch (error) {
      dashboardState.purchaseInFlight = false;
      renderPackageCatalog(dashboardState.data || { packageCatalog: [] });
      setPackageStoreFeedback(error?.message || "Unable to create the package checkout right now.", "error");
    }
  }

  async function submitBookingRequest(event) {
    event.preventDefault();
    if (!(bookingForm instanceof HTMLFormElement) || !bookingForm.reportValidity()) {
      return;
    }

    const submitButton = event.submitter instanceof HTMLButtonElement
      ? event.submitter
      : bookingForm.querySelector('button[type="submit"]');
    if (submitButton instanceof HTMLButtonElement && submitButton.disabled) {
      return;
    }

    const releaseSubmit = setBusyButtonState(submitButton, "Submitting...");

    try {
      await loadAccessAndClient();
      const data = dashboardState.data;
      if (!data) {
        throw new Error("Your dashboard data is still loading.");
      }

      const formData = new FormData(bookingForm);
      const clientPackageId = String(formData.get("clientPackageId") || "").trim();
      const sessionType = String(formData.get("service") || "").trim();
      const requestedDate = String(formData.get("sessionDate") || "").trim();
      const requestedTime = String(formData.get("sessionTime") || "").trim();
      const sessionNote = String(formData.get("sessionNote") || "").trim();

      if (!clientPackageId || !sessionType || !requestedDate || !requestedTime) {
        setBookingFeedback("Choose a package, session type, date, and time before submitting.", true);
        return;
      }

      const selectedPackage = (data.packages || []).find((item) => item.id === clientPackageId);
      if (!selectedPackage) {
        setBookingFeedback("The selected package could not be found. Refresh the page and try again.", true);
        return;
      }

      const reservationCounts = buildReservationCountMap(data);
      const bookableRemaining = getBookableRemainingForPackage(selectedPackage, reservationCounts);

      if (selectedPackage.status !== "active" || isPackageExpired(selectedPackage) || bookableRemaining <= 0) {
        setBookingFeedback(
          "That package no longer has bookable balance. Choose another active package or purchase a new one.",
          true
        );
        return;
      }

      const requestedDateTime = new Date(`${requestedDate}T${requestedTime}`);
      if (Number.isNaN(requestedDateTime.getTime()) || requestedDateTime.getTime() <= Date.now()) {
        setBookingFeedback("Choose a future date and time for your booking request.", true);
        return;
      }

      if (!isWithinCoachAvailability(data, requestedDate, requestedTime)) {
        setBookingFeedback(
          "That slot falls outside your coach's published availability windows. Choose a listed window or ask your coach directly first.",
          true
        );
        return;
      }

      setBookingFeedback("Submitting your booking request...", false);

      const payload = await fetchAuthenticatedJson("/.netlify/functions/submit-booking-request", {
        method: "POST",
        body: {
          clientPackageId,
          sessionType,
          requestedDate,
          requestedTime,
          sessionNote,
        },
      });

      bookingForm.reset();
      await loadDashboard({
        fresh: true,
      });
      setBookingFeedback(
        payload?.message
          || `Booking request submitted against ${formatPackageDisplayName(selectedPackage)}. It is now waiting for coach/admin confirmation.`,
        false
      );
    } catch (error) {
      setBookingFeedback(error?.message || "Unable to submit the booking request right now.", true);
    } finally {
      releaseSubmit();
    }
  }

  async function submitSessionChangeRequest(event) {
    event.preventDefault();
    if (!(sessionChangeForm instanceof HTMLFormElement) || !sessionChangeForm.reportValidity()) {
      return;
    }

    const submitButton = event.submitter instanceof HTMLButtonElement
      ? event.submitter
      : sessionChangeForm.querySelector('button[type="submit"]');
    if (submitButton instanceof HTMLButtonElement && submitButton.disabled) {
      return;
    }

    const releaseSubmit = setBusyButtonState(submitButton, "Submitting...");

    try {
      await loadAccessAndClient();
      const data = dashboardState.data;
      if (!data) {
        throw new Error("Your dashboard data is still loading.");
      }

      const formData = new FormData(sessionChangeForm);
      const sessionId = String(formData.get("sessionId") || "").trim();
      const requestType = String(formData.get("requestType") || "reschedule").trim();
      const requestedDate = String(formData.get("requestedDate") || "").trim();
      const requestedTime = String(formData.get("requestedTime") || "").trim();
      const reason = String(formData.get("reason") || "").trim();

      if (!sessionId || !reason) {
        setSessionChangeFeedback("Choose the scheduled session and explain the change you need.", true);
        return;
      }

      const sessionRecord = (data.sessions || []).find((session) => session.id === sessionId && session.status === "scheduled");
      if (!sessionRecord) {
        setSessionChangeFeedback("That scheduled session could not be found. Refresh the page and try again.", true);
        return;
      }

      const pendingChangeRequest = (data.sessionChangeRequests || []).find(
        (request) => request.session_id === sessionId && request.status === "pending"
      );
      if (pendingChangeRequest) {
        setSessionChangeFeedback("There is already a pending change request for this session.", true);
        return;
      }

      if (requestType !== "cancel") {
        if (!requestedDate || !requestedTime) {
          setSessionChangeFeedback("Choose the new preferred date and time for a reschedule request.", true);
          return;
        }

        if (!isWithinCoachAvailability(data, requestedDate, requestedTime)) {
          setSessionChangeFeedback(
            "That new slot sits outside your coach's published availability windows. Choose a listed window or coordinate directly first.",
            true
          );
          return;
        }

        const requestedStart = new Date(`${requestedDate}T${requestedTime}`);
        if (Number.isNaN(requestedStart.getTime()) || requestedStart.getTime() <= Date.now()) {
          setSessionChangeFeedback("Choose a future date and time for the reschedule request.", true);
          return;
        }
      }

      setSessionChangeFeedback(
        requestType === "cancel" ? "Submitting cancellation request..." : "Submitting reschedule request...",
        false
      );

      const payload = await fetchAuthenticatedJson("/.netlify/functions/submit-session-change-request", {
        method: "POST",
        body: {
          sessionId: sessionRecord.id,
          requestType,
          requestedDate: requestType === "cancel" ? "" : requestedDate,
          requestedTime: requestType === "cancel" ? "" : requestedTime,
          reason,
        },
      });

      sessionChangeForm.reset();
      syncSessionChangeFormVisibility();
      await loadDashboard({
        fresh: true,
      });
      setSessionChangeFeedback(
        payload?.message
          || (requestType === "cancel"
            ? "Cancellation request submitted. It will stay pending until your coach reviews it."
            : "Reschedule request submitted. It will stay pending until your coach reviews it."),
        false
      );
    } catch (error) {
      setSessionChangeFeedback(error?.message || "Unable to submit the session change request right now.", true);
    } finally {
      releaseSubmit();
    }
  }

  if (bookingForm) {
    bookingForm.addEventListener("submit", submitBookingRequest);
  }

  if (bookingRequestToggleButton) {
    bookingRequestToggleButton.addEventListener("click", () => {
      setBookingRequestPanelOpen(bookingRequestPanelNode?.hidden);
    });
  }

  if (sessionChangeForm) {
    sessionChangeForm.addEventListener("submit", submitSessionChangeRequest);
  }

  if (sessionChangeTypeSelect) {
    sessionChangeTypeSelect.addEventListener("change", syncSessionChangeFormVisibility);
    syncSessionChangeFormVisibility();
  }

  if (bookingDateInput) {
    bookingDateInput.addEventListener("change", () => {
      updateTimeSelectFromLiveCalendar(
        bookingTimeInput,
        bookingDateInput.value,
        "Select a time slot",
        bookingTimeOptionsFallbackMarkup,
        ""
      );
    });
  }

  if (sessionChangeDateInput) {
    sessionChangeDateInput.addEventListener("change", () => {
      updateTimeSelectFromLiveCalendar(
        sessionChangeTimeInput,
        sessionChangeDateInput.value,
        "Select a new time slot",
        sessionChangeTimeOptionsFallbackMarkup,
        ""
      );
    });
  }

  if (confirmedSessionRowsNode) {
    confirmedSessionRowsNode.addEventListener("click", (event) => {
      const button = event.target.closest("[data-session-change-intent]");
      if (!button) {
        return;
      }

      const sessionId = String(button.getAttribute("data-session-id") || "").trim();
      const requestType = String(button.getAttribute("data-session-change-intent") || "").trim();
      if (!sessionId || !requestType) {
        return;
      }

      prefillSessionChangeForm(sessionId, requestType);
      sessionChangeForm?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  if (packageCommitmentSelect) {
    packageCommitmentSelect.addEventListener("change", () => {
      dashboardState.packageFilters.commitment = String(packageCommitmentSelect.value || "").trim();
      dashboardState.packageFilters.trainingFormat = "";
      dashboardState.packageFilters.tierCode = "";
      dashboardState.packageFilters.packageCode = "";
      renderPackageCatalog(dashboardState.data || { packageCatalog: [] });
    });
  }

  if (packageFormatSelect) {
    packageFormatSelect.addEventListener("change", () => {
      dashboardState.packageFilters.trainingFormat = String(packageFormatSelect.value || "").trim();
      dashboardState.packageFilters.tierCode = "";
      dashboardState.packageFilters.packageCode = "";
      renderPackageCatalog(dashboardState.data || { packageCatalog: [] });
    });
  }

  if (packageTierSelect) {
    packageTierSelect.addEventListener("change", () => {
      dashboardState.packageFilters.tierCode = String(packageTierSelect.value || "").trim();
      dashboardState.packageFilters.packageCode = "";
      renderPackageCatalog(dashboardState.data || { packageCatalog: [] });
    });
  }

  if (packageOptionSelect) {
    packageOptionSelect.addEventListener("change", () => {
      dashboardState.packageFilters.packageCode = String(packageOptionSelect.value || "").trim();
      renderPackageCatalog(dashboardState.data || { packageCatalog: [] });
    });
  }

  if (packagePurchaseButton) {
    packagePurchaseButton.addEventListener("click", () => {
      const packageCode = String(packageOptionSelect?.value || dashboardState.packageFilters.packageCode || "").trim();
      if (!packageCode) {
        setPackageStoreFeedback("Select a session bundle before continuing to checkout.", "error");
        return;
      }

      startPackageCheckout(packageCode, packageSecondMemberInput?.value || "");
    });
  }

  if (fitbitConnectButton) {
    fitbitConnectButton.addEventListener("click", () => {
      startFitbitConnectFlow();
    });
  }

  if (fitbitSyncButton) {
    fitbitSyncButton.addEventListener("click", () => {
      syncFitbitWorkspace();
    });
  }

  if (fitbitDisconnectButton) {
    fitbitDisconnectButton.addEventListener("click", () => {
      disconnectFitbitWorkspace();
    });
  }

  if (stravaConnectButton) {
    stravaConnectButton.addEventListener("click", () => {
      startStravaConnectFlow();
    });
  }

  if (stravaSyncButton) {
    stravaSyncButton.addEventListener("click", () => {
      syncStravaWorkspace();
    });
  }

  if (stravaDisconnectButton) {
    stravaDisconnectButton.addEventListener("click", () => {
      disconnectStravaWorkspace();
    });
  }

  if (purchaseHistoryRowsNode) {
    purchaseHistoryRowsNode.addEventListener("click", (event) => {
      const button = event.target.closest("[data-order-document]");
      if (!button) {
        return;
      }

      const orderId = button.getAttribute("data-order-id");
      const documentType = button.getAttribute("data-order-document");
      if (!orderId || !documentType) {
        return;
      }

      openBillingDocument(orderId, documentType).catch((error) => {
        setPackageStoreFeedback(error?.message || "Unable to open the billing document right now.", "error");
      });
    });
  }

  document.addEventListener("legacy:identity-banner-rendered", () => {
    if (dashboardState.data) {
      renderRewardBank(dashboardState.data);
    }
  });

  if (DASHBOARD_PAGE_KEY === "settings" && settingsTabNodes.length && settingsPanelNodes.length) {
    setActiveClientSettingsPanel(getInitialClientSettingsPanel());
    settingsTabNodes.forEach((tabNode) => {
      tabNode.addEventListener("click", () => {
        setActiveClientSettingsPanel(tabNode.dataset.clientSettingsTab || "portrait");
      });
    });
  }

  loadDashboard();
})();
