(function initAdminDashboard() {
  const statusNode = document.getElementById("admin-dashboard-status");
  const emailDisplayNode = document.getElementById("admin-email-display");
  const signOutButton = document.getElementById("admin-sign-out");
  const assignmentForm = document.getElementById("admin-assignment-form");
  const assignmentCoachSelect = document.getElementById("admin-assignment-coach");
  const assignmentClientSelect = document.getElementById("admin-assignment-client");
  const assignmentFeedbackNode = document.getElementById("admin-assignment-feedback");
  const leadForm = document.getElementById("admin-lead-form");
  const leadOwnerSelect = document.getElementById("admin-lead-owner");
  const leadFeedbackNode = document.getElementById("admin-lead-feedback");
  const followUpForm = document.getElementById("admin-follow-up-form");
  const followUpLeadSelect = document.getElementById("admin-follow-up-lead");
  const followUpOwnerSelect = document.getElementById("admin-follow-up-owner");
  const followUpFeedbackNode = document.getElementById("admin-follow-up-feedback");
  const convertLeadForm = document.getElementById("admin-convert-lead-form");
  const convertLeadSelect = document.getElementById("admin-convert-lead");
  const convertCoachSelect = document.getElementById("admin-convert-coach");
  const convertFeedbackNode = document.getElementById("admin-convert-feedback");
  const coachSelectNode = document.getElementById("admin-coach-select");
  const coachManagementForm = document.getElementById("admin-coach-management-form");
  const coachManagementFeedbackNode = document.getElementById("admin-coach-management-feedback");
  const coachPositionSelect = document.getElementById("admin-coach-position");
  const coachTierSelect = document.getElementById("admin-coach-tier");
  const coachRateInput = document.getElementById("admin-coach-rate");
  const coachCapInput = document.getElementById("admin-coach-cap");
  const coachHoursMinInput = document.getElementById("admin-coach-hours-min");
  const coachHoursTargetInput = document.getElementById("admin-coach-hours-target");
  const coachHoursCompletedInput = document.getElementById("admin-coach-hours-completed");
  const coachReviewDueInput = document.getElementById("admin-coach-review-due");
  const coachBonusNotesInput = document.getElementById("admin-coach-bonus-notes");
  const coachAssessmentCompleteInput = document.getElementById("admin-coach-assessment-complete");
  const coachPromotionReadyInput = document.getElementById("admin-coach-promotion-ready");
  const coachNotesInput = document.getElementById("admin-coach-notes");
  const coachKpiListNode = document.getElementById("admin-coach-kpi-list");
  const coachSelectionSummaryNode = document.getElementById("admin-coach-selection-summary");
  const coachApplyPresetsButton = document.getElementById("admin-coach-apply-presets");
  const coachCompleteReviewButton = document.getElementById("admin-coach-complete-review");
  const toggleCompPlanReferenceButton = document.getElementById("admin-toggle-comp-plan-reference");
  const compPlanReferenceNode = document.getElementById("admin-comp-plan-reference");
  const positionSummaryGridNode = document.getElementById("admin-position-summary-grid");
  const tierPresetRowsNode = document.getElementById("admin-tier-preset-rows");
  const coachReviewRowsNode = document.getElementById("admin-coach-review-rows");
  const watchlistCardsNode = document.getElementById("admin-watchlist-cards");
  const homeCoverageGridNode = document.getElementById("admin-home-coverage-grid");
  const homeCoverageNoteNode = document.getElementById("admin-home-coverage-note");
  const coachRowsNode = document.getElementById("admin-coach-rows");
  const clientRowsNode = document.getElementById("admin-client-rows");
  const adminCoachCodeForm = document.getElementById("admin-coach-code-form");
  const adminCoachCodeFeedbackNode = document.getElementById("admin-coach-code-feedback");
  const adminClientCodeForm = document.getElementById("admin-client-code-form");
  const adminClientCodeCoachNode = document.getElementById("admin-client-code-coach");
  const adminClientCodeFeedbackNode = document.getElementById("admin-client-code-feedback");
  const adminAuthCodeRowsNode = document.getElementById("admin-auth-code-rows");
  const leadRowsNode = document.getElementById("admin-lead-rows");
  const leadActivityRowsNode = document.getElementById("admin-lead-activity-rows");
  const leadMessageForm = document.getElementById("admin-lead-message-form");
  const leadMessageLeadSelect = document.getElementById("admin-lead-message-lead");
  const leadMessageFeedbackNode = document.getElementById("admin-lead-message-feedback");
  const rewardRowsNode = document.getElementById("admin-reward-rows");
  const financialRowsNode = document.getElementById("admin-financial-rows");
  const financialFeedbackNode = document.getElementById("admin-financial-feedback");
  const operatingCostForm = document.getElementById("admin-operating-cost-form");
  const operatingCostResetButton = document.getElementById("admin-operating-cost-reset");
  const operatingCostFeedbackNode = document.getElementById("admin-operating-cost-feedback");
  const operatingCostRowsNode = document.getElementById("admin-operating-cost-rows");
  const operatingCostFilterMonthNode = document.getElementById("admin-operating-cost-filter-month");
  const operatingCostFilterGroupNode = document.getElementById("admin-operating-cost-filter-group");
  const operatingCostFilterQueryNode = document.getElementById("admin-operating-cost-filter-query");
  const operatingCostLedgerMetaNode = document.getElementById("admin-operating-cost-ledger-meta");
  const operatingCostPageInfoNode = document.getElementById("admin-operating-cost-page-info");
  const operatingCostPrevButton = document.getElementById("admin-operating-cost-prev");
  const operatingCostNextButton = document.getElementById("admin-operating-cost-next");
  const packagePurchaseRowsNode = document.getElementById("admin-package-purchase-rows");
  const commissionRowsNode = document.getElementById("admin-commission-rows");
  const notificationRowsNode = document.getElementById("admin-notification-rows");
  const codexBundleStatusNode = document.getElementById("admin-codex-bundle-status");
  const codexBundleMetricsNode = document.getElementById("admin-codex-bundle-metrics");
  const codexBundleMetaNode = document.getElementById("admin-codex-bundle-meta");
  const codexBundleCompatibilityNode = document.getElementById("admin-codex-bundle-compatibility");
  const codexBundleImportsNode = document.getElementById("admin-codex-bundle-imports");
  const codexBundleActionRowsNode = document.getElementById("admin-codex-bundle-action-rows");
  const gamificationImportFormNode = document.getElementById("admin-gamification-import-form");
  const gamificationImportBatchNode = document.getElementById("admin-gamification-import-batch");
  const gamificationImportRowsInputNode = document.getElementById("admin-gamification-import-rows-input");
  const gamificationImportPreviewButton = document.getElementById("admin-gamification-import-preview");
  const gamificationImportApplyButton = document.getElementById("admin-gamification-import-apply");
  const gamificationImportFeedbackNode = document.getElementById("admin-gamification-import-feedback");
  const gamificationImportSummaryNode = document.getElementById("admin-gamification-import-summary");
  const gamificationImportRowsNode = document.getElementById("admin-gamification-import-rows");
  const qaAccountsFormNode = document.getElementById("admin-qa-accounts-form");
  const qaCoachEmailNode = document.getElementById("admin-qa-coach-email");
  const qaClientEmailNode = document.getElementById("admin-qa-client-email");
  const qaCoachPasswordNode = document.getElementById("admin-qa-coach-password");
  const qaClientPasswordNode = document.getElementById("admin-qa-client-password");
  const qaAccountsRefreshButton = document.getElementById("admin-qa-accounts-refresh");
  const qaAccountsSubmitButton = document.getElementById("admin-qa-accounts-submit");
  const qaAccountsFeedbackNode = document.getElementById("admin-qa-accounts-feedback");
  const qaAccountsSummaryNode = document.getElementById("admin-qa-accounts-summary");
  const qaAccountsDetailsNode = document.getElementById("admin-qa-accounts-details");
  const qaAccountsCredentialsNode = document.getElementById("admin-qa-accounts-credentials");
  const exportOrdersButton = document.getElementById("admin-export-orders");
  const exportCommissionsButton = document.getElementById("admin-export-commissions");
  const leadSearchNode = document.getElementById("admin-lead-search");
  const leadStatusFilterNode = document.getElementById("admin-lead-filter-status");
  const leadSourceFilterNode = document.getElementById("admin-lead-filter-source");
  const leadBoardNode = document.getElementById("admin-lead-board");
  const overdueFollowUpRowsNode = document.getElementById("admin-overdue-follow-up-rows");
  const financeNavNode = document.getElementById("admin-finance-nav");
  const financeOverviewRangeNode = document.getElementById("admin-financial-overview-range");
  const financeTransactionFiltersNode = document.getElementById("admin-financial-transaction-filters");
  const financeCustomerRowsNode = document.getElementById("admin-finance-customer-rows");
  const financeRecentRowsNode = document.getElementById("admin-financial-recent-rows");
  const financeRecentPayoutRowsNode = document.getElementById("admin-financial-recent-payout-rows");
  const financeReportFromNode = document.getElementById("admin-report-from");
  const financeReportToNode = document.getElementById("admin-report-to");
  const financeReportCurrencyNode = document.getElementById("admin-report-currency");
  const financeReportOrderTypeNode = document.getElementById("admin-report-order-type");
  const financeReportViewTransactionsButton = document.getElementById("admin-report-view-transactions");
  const DASHBOARD_PAGE_KEY = document.body?.dataset?.accountPage || "home";
  const DASHBOARD_CACHE_KEY = `legacy-admin-dashboard-cache:v4:${DASHBOARD_PAGE_KEY}`;
  const DASHBOARD_CACHE_TTL_MS = 90 * 1000;
  const DASHBOARD_REFRESH_DEBOUNCE_MS = 180;
  const ADMIN_REALTIME_TABLES_BY_PAGE = {
    home: [
      "profiles",
      "coach_profiles",
      "leads",
      "lead_activities",
      "orders",
      "sessions",
      "commission_records",
      "booking_requests",
      "notifications",
      "payments",
      "order_items",
    ],
    clients: [
      "profiles",
      "coach_profiles",
      "client_profiles",
      "coach_client_assignments",
      "client_packages",
      "points_ledger",
      "activation_codes",
    ],
    leads: [
      "profiles",
      "leads",
      "lead_activities",
      "notifications",
    ],
    financials: [
      "profiles",
      "client_packages",
      "orders",
      "sessions",
      "commission_records",
      "booking_requests",
      "payments",
      "order_items",
    ],
    settings: [
      "notifications",
    ],
  };

  const dashboardState = {
    access: null,
    supabase: null,
    coaches: [],
    clients: [],
    assignments: [],
    rewards: [],
    plannerRewardEvents: [],
    leads: [],
    notifications: [],
    lastData: null,
    leadFilters: {
      query: "",
      status: "all",
      source: "all",
    },
    operatingCostFilters: {
      month: "all",
      group: "all",
      query: "",
    },
    operatingCostPage: 1,
    financePanel: "overview",
    financeOverviewRange: "30d",
    financeTransactionStatus: "all",
    selectedCoachId: "",
    loadSequence: 0,
    loadInFlight: false,
    deferredHydrationInFlight: false,
    operatingCostHydrationInFlight: false,
    refreshTimer: 0,
    pendingRefreshReason: "",
    pendingRefreshSilent: true,
    liveBindingsReady: false,
    realtimeChannel: null,
    realtimeSubscriptionKey: "",
    gamificationImportPreviewKey: "",
    gamificationImportReadyCount: 0,
    activationCodes: [],
    qaAccountStatus: null,
    qaAccountCredentials: null,
    qaAccountsLoaded: false,
    qaAccountsLoading: false,
  };

  function buildEmptyDashboardData() {
    return {
      access: dashboardState.access || null,
      homeSummary: null,
      coaches: [],
      coachProfiles: [],
      clients: [],
      clientProfiles: [],
      assignments: [],
      clientPackages: [],
      rewards: [],
      plannerRewardEvents: [],
      leads: [],
      leadActivities: [],
      notifications: [],
      leadWorkspaceDetailsLoaded: true,
      operatingCostEntries: [],
      operatingCostSummary: null,
      orders: [],
      sessions: [],
      payments: [],
      orderItems: [],
      commissions: [],
      bookingRequests: [],
      actorProfiles: [],
      activationCodes: [],
      financialWorkspaceDetailsLoaded: true,
      currentMonthStart: startOfCurrentMonth().toISOString().slice(0, 10),
    };
  }

  function mergeDashboardData(nextData, previousData) {
    return {
      ...buildEmptyDashboardData(),
      ...(previousData || {}),
      ...(nextData || {}),
    };
  }

  function setStatus(message, isError) {
    if (!statusNode) {
      return;
    }

    statusNode.textContent = message || "";
    statusNode.style.color = isError ? "#ffb3b3" : "";
  }

  function buildSkeletonLine(width = "100%", modifier = "copy") {
    return `<span class="dashboard-skeleton dashboard-skeleton--${modifier}" style="--skeleton-width:${width};"></span>`;
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

  function buildSkeletonStack(widths, modifier = "copy", compact = false) {
    return `
      <div class="dashboard-skeleton-stack${compact ? " dashboard-skeleton-stack--compact" : ""}">
        ${widths.map((width) => buildSkeletonLine(width, modifier)).join("")}
      </div>
    `;
  }

  function buildSkeletonTableRows(labels, rowCount = 3) {
    return Array.from({ length: rowCount }, () => `
      <tr>
        ${labels.map((label, index) => `
          <td class="dashboard-table__skeleton-cell" data-label="${escapeHtml(label)}">
            ${buildSkeletonLine(index === labels.length - 1 ? "70%" : "100%", index === 0 ? "title" : "copy")}
          </td>
        `).join("")}
      </tr>
    `).join("");
  }

  function buildWatchlistSkeleton(count = 3) {
    return Array.from({ length: count }, () => `
      <article class="metric-watch-card dashboard-skeleton-card dashboard-skeleton-card--watch" data-crm-tone="neutral">
        ${buildSkeletonStack(["38%", "58%"], "label", true)}
        ${buildSkeletonLine("48%", "value")}
        ${buildSkeletonStack(["96%", "82%"], "copy")}
      </article>
    `).join("");
  }

  function buildLeadBoardSkeleton() {
    const statuses = ["New", "Contacted", "Qualified", "Ghosted", "Converted", "Lost"];
    return statuses
      .map((label) => `
        <section class="lead-board__column is-syncing">
          <div class="lead-board__head">
            <h3>${escapeHtml(label)}</h3>
            <span class="lead-board__count">${buildSkeletonLine("28px", "metric")}</span>
          </div>
          <div class="lead-board__stack dashboard-list--skeleton">
            ${Array.from({ length: 2 }, () => `
              <article class="lead-chip-card lead-chip-card--skeleton">
                ${buildSkeletonStack(["62%", "88%", "54%"], "copy")}
              </article>
            `).join("")}
          </div>
        </section>
      `)
      .join("");
  }

  function renderLeadFunnelStatSkeleton() {
    [
      "admin-lead-stat-new",
      "admin-lead-stat-contacted",
      "admin-lead-stat-qualified",
      "admin-lead-stat-ghosted",
      "admin-lead-stat-converted",
      "admin-lead-stat-lost",
      "admin-lead-stat-follow-up",
    ].forEach((id, index) => {
      const node = document.getElementById(id);
      if (node) {
        node.innerHTML = buildSkeletonLine(index % 2 === 0 ? "72%" : "64%", "copy");
      }
    });
  }

  function renderInitialDashboardSkeleton() {
    if (isLeadsWorkspacePage()) {
      if (leadRowsNode) {
        leadRowsNode.innerHTML = buildSkeletonTableRows(["Name", "Source", "Status", "Owner", "Next Follow-Up", "Action"], 4);
      }
      if (overdueFollowUpRowsNode) {
        overdueFollowUpRowsNode.innerHTML = buildSkeletonTableRows(["Lead", "Status", "Owner", "Source", "Next Follow-Up"], 4);
      }
      if (leadActivityRowsNode) {
        leadActivityRowsNode.innerHTML = buildSkeletonTableRows(["When", "Lead", "Actor", "Type", "Notes"], 4);
      }
      if (notificationRowsNode) {
        notificationRowsNode.innerHTML = buildSkeletonTableRows(["Date", "Category", "Title", "Details", "Status"], 4);
      }
      if (leadBoardNode) {
        leadBoardNode.innerHTML = buildWatchlistSkeleton(3);
      }
      return;
    }

    if (isFinancialWorkspacePage()) {
      [
        "admin-financial-overview-month-sales",
        "admin-financial-overview-month-net",
        "admin-financial-overview-pipeline",
        "admin-financial-overview-payout",
      ].forEach((id, index) => {
        const node = document.getElementById(id);
        if (node) {
          node.innerHTML = buildSkeletonLine(index % 2 === 0 ? "58%" : "46%", "value");
        }
      });

      if (financeRecentRowsNode) {
        financeRecentRowsNode.innerHTML = buildSkeletonTableRows(["Date", "Client", "Method", "Amount", "Status"], 4);
      }
      if (financeRecentPayoutRowsNode) {
        financeRecentPayoutRowsNode.innerHTML = buildSkeletonTableRows(["Initiated", "Coach", "Amount", "Status"], 4);
      }
      if (financialRowsNode) {
        financialRowsNode.innerHTML = buildSkeletonTableRows(["Date", "Customer", "Charge ID", "Amount", "Fees", "Method", "Status", "Documents", "Action"], 4);
      }
      if (packagePurchaseRowsNode) {
        packagePurchaseRowsNode.innerHTML = buildSkeletonTableRows(["Date", "Customer", "Package", "Sessions", "Amount", "Payment", "Package Status"], 4);
      }
      if (commissionRowsNode) {
        commissionRowsNode.innerHTML = buildSkeletonTableRows(["Coach", "Payout Month", "Amount", "Status", "Action"], 4);
      }
      if (financeCustomerRowsNode) {
        financeCustomerRowsNode.innerHTML = buildSkeletonTableRows(["Customer", "Goal", "Status", "Current Package", "Sessions Left", "Lifetime Revenue"], 4);
      }
      return;
    }

    if (!isHomeWorkspacePage()) {
      return;
    }

    const metricIds = [
      "admin-stat-net-revenue",
      "admin-stat-payouts",
      "admin-stat-liability",
      "admin-stat-conversion",
      "admin-stat-active-clients",
      "admin-stat-alerts",
    ];
    metricIds.forEach((id, index) => {
      const node = document.getElementById(id);
      if (!node) {
        return;
      }
      node.innerHTML = buildSkeletonLine(index < 3 ? "56%" : "44%", "value");
    });

    if (watchlistCardsNode) {
      watchlistCardsNode.innerHTML = buildWatchlistSkeleton(3);
    }

    ["admin-review-overdue", "admin-review-due-soon", "admin-review-promotion-ready", "admin-review-green"].forEach((id) => {
      const node = document.getElementById(id);
      if (!node) {
        return;
      }
      node.innerHTML = buildSkeletonLine("54%", "metric");
    });

    if (coachReviewRowsNode) {
      coachReviewRowsNode.innerHTML = buildSkeletonTableRows(
        ["Coach", "Position", "Tier", "KPI Progress", "Next Review", "Status"],
        3
      );
    }
  }

  function setAssignmentFeedback(message, isError) {
    if (!assignmentFeedbackNode) {
      return;
    }

    assignmentFeedbackNode.textContent = message || "";
    assignmentFeedbackNode.style.color = isError ? "#ffb3b3" : "";
  }

  function setLeadFeedback(message, isError) {
    if (!leadFeedbackNode) {
      return;
    }

    leadFeedbackNode.textContent = message || "";
    leadFeedbackNode.style.color = isError ? "#ffb3b3" : "";
  }

  function setFollowUpFeedback(message, isError) {
    if (!followUpFeedbackNode) {
      return;
    }

    followUpFeedbackNode.textContent = message || "";
    followUpFeedbackNode.style.color = isError ? "#ffb3b3" : "";
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
        allowCacheFallback: !dashboardState.lastData,
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
    const watchedTables = ADMIN_REALTIME_TABLES_BY_PAGE[DASHBOARD_PAGE_KEY] || ADMIN_REALTIME_TABLES_BY_PAGE.home;
    const subscriptionKey = `${access.user.id}:${DASHBOARD_PAGE_KEY}:${watchedTables.join(",")}`;
    if (dashboardState.realtimeSubscriptionKey === subscriptionKey && dashboardState.realtimeChannel) {
      return;
    }

    teardownRealtimeDashboardRefresh();

    let channel = supabase.channel(`legacy-admin-live:${DASHBOARD_PAGE_KEY}:${access.user.id}`);
    watchedTables.forEach((table) => {
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

  function isFinancialWorkspacePage() {
    return document.body?.dataset?.accountPage === "financials";
  }

  function isHomeWorkspacePage() {
    return DASHBOARD_PAGE_KEY === "home";
  }

  function shouldUsePrimaryHomePayload() {
    return isHomeWorkspacePage();
  }

  function shouldUsePrimaryDashboardPayload() {
    return isHomeWorkspacePage() || isLeadsWorkspacePage() || isFinancialWorkspacePage();
  }

  function shouldDeferSecondaryPayload() {
    return isLeadsWorkspacePage() || isFinancialWorkspacePage();
  }

  function isClientsWorkspacePage() {
    return DASHBOARD_PAGE_KEY === "clients";
  }

  function isLeadsWorkspacePage() {
    return DASHBOARD_PAGE_KEY === "leads";
  }

  function isSettingsWorkspacePage() {
    return DASHBOARD_PAGE_KEY === "settings";
  }

  function isLeadWorkspaceDetailsPending(data) {
    return isLeadsWorkspacePage() && data?.leadWorkspaceDetailsLoaded === false;
  }

  function isFinancialWorkspaceDetailsPending(data) {
    return isFinancialWorkspacePage() && data?.financialWorkspaceDetailsLoaded === false;
  }

  function isOperatingCostHydrationPending(data) {
    return isFinancialWorkspacePage()
      && dashboardState.operatingCostHydrationInFlight
      && !(data?.operatingCostEntries || []).length;
  }

  function scheduleAfterInitialPaint(task) {
    if (typeof window.requestAnimationFrame === "function") {
      window.requestAnimationFrame(() => {
        window.setTimeout(() => {
          try {
            task();
          } catch (_) {
            // Ignore deferred render errors.
          }
        }, 0);
      });
      return;
    }

    window.setTimeout(() => {
      try {
        task();
      } catch (_) {
        // Ignore deferred render errors.
      }
    }, 16);
  }

  function activateFinancePanel(panelId) {
    if (!isFinancialWorkspacePage()) {
      return;
    }

    dashboardState.financePanel = panelId || "overview";
    document.querySelectorAll("[data-finance-panel-target]").forEach((button) => {
      const isActive = button.getAttribute("data-finance-panel-target") === dashboardState.financePanel;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    document.querySelectorAll("[data-finance-panel]").forEach((panel) => {
      panel.hidden = panel.getAttribute("data-finance-panel") !== dashboardState.financePanel;
    });

    const nextHash = `#${dashboardState.financePanel}`;
    if (window.location.hash !== nextHash) {
      window.history.replaceState(null, "", nextHash);
    }

    if (dashboardState.lastData) {
      rerenderFinanceWorkspace();
    }

    if (
      dashboardState.lastData?.financialWorkspaceDetailsLoaded === false
      && dashboardState.access?.user?.id
      && !dashboardState.deferredHydrationInFlight
    ) {
      scheduleAfterInitialPaint(() => hydrateDeferredDashboardSections(dashboardState.loadSequence, dashboardState.access.user.id));
    }
  }

  function syncAdminDeferredUiState(data) {
    const leadsPending = isLeadWorkspaceDetailsPending(data);
    const financialPending = isFinancialWorkspaceDetailsPending(data);
    const financePanelPending = financialPending || isOperatingCostHydrationPending(data);
    const anyPending = leadsPending || financePanelPending;

    document.body.classList.toggle("dashboard-hydrating-secondary", anyPending);
    if (statusNode) {
      statusNode.classList.toggle("is-syncing", anyPending);
      statusNode.setAttribute("aria-live", anyPending ? "polite" : "off");
    }

    document.querySelectorAll(".crm-page-panel, .hitpay-finance-panel").forEach((panel) => {
      const isFinancePanel = panel.hasAttribute("data-finance-panel");
      const isActive = isFinancePanel
        ? panel.hidden !== true
        : true;
      const isSyncing = isActive && (isLeadsWorkspacePage() ? leadsPending : isFinancialWorkspacePage() ? financePanelPending : false);
      panel.classList.toggle("is-syncing", isSyncing);
      panel.setAttribute("aria-busy", String(isSyncing));
    });

    if (leadBoardNode) {
      leadBoardNode.classList.toggle("is-syncing", leadsPending);
      leadBoardNode.setAttribute("aria-busy", String(leadsPending));
    }
  }

  function bindFinanceWorkspaceNavigation() {
    if (!financeNavNode || financeNavNode.dataset.bound === "true") {
      return;
    }

    financeNavNode.addEventListener("click", (event) => {
      const button = event.target.closest("[data-finance-panel-target]");
      if (!(button instanceof HTMLButtonElement)) {
        return;
      }

      activateFinancePanel(button.getAttribute("data-finance-panel-target") || "overview");
    });

    financeNavNode.dataset.bound = "true";
    const initialHashPanel = String(window.location.hash || "").replace(/^#/u, "").trim();
    const initialPanel = financeNavNode.querySelector(`[data-finance-panel-target="${initialHashPanel}"]`)
      ? initialHashPanel
      : dashboardState.financePanel || "overview";
    activateFinancePanel(initialPanel);
  }

  function ensureFinanceReportDefaults() {
    if (!isFinancialWorkspacePage()) {
      return;
    }

    if (financeReportFromNode && !financeReportFromNode.value) {
      financeReportFromNode.value = toInputDate(startOfCurrentMonth());
    }

    if (financeReportToNode && !financeReportToNode.value) {
      financeReportToNode.value = toInputDate(endOfToday());
    }

    if (financeReportCurrencyNode && !financeReportCurrencyNode.value) {
      financeReportCurrencyNode.value = "MYR";
    }

    if (financeReportOrderTypeNode && !financeReportOrderTypeNode.value) {
      financeReportOrderTypeNode.value = "all";
    }
  }

  function rerenderFinanceWorkspace() {
    if (!dashboardState.lastData || !isFinancialWorkspacePage()) {
      return;
    }

    const analytics = buildFinancialAnalytics(dashboardState.lastData);
    renderFinancials(dashboardState.lastData, analytics);
  }

  function setConvertFeedback(message, isError) {
    if (!convertFeedbackNode) {
      return;
    }

    convertFeedbackNode.textContent = message || "";
    convertFeedbackNode.style.color = isError ? "#ffb3b3" : "";
  }

  function setLeadMessageFeedback(message, isError) {
    if (!leadMessageFeedbackNode) {
      return;
    }

    leadMessageFeedbackNode.textContent = message || "";
    leadMessageFeedbackNode.style.color = isError ? "#ffb3b3" : "";
  }

  function setFinancialFeedback(message, isError) {
    if (!financialFeedbackNode) {
      return;
    }

    financialFeedbackNode.textContent = message || "";
    financialFeedbackNode.style.color = isError ? "#ffb3b3" : "";
  }

  function setOperatingCostFeedback(message, isError) {
    if (!operatingCostFeedbackNode) {
      return;
    }

    operatingCostFeedbackNode.textContent = message || "";
    operatingCostFeedbackNode.style.color = isError ? "#ffb3b3" : "";
  }

  function setCoachManagementFeedback(message, isError) {
    if (!coachManagementFeedbackNode) {
      return;
    }

    coachManagementFeedbackNode.textContent = message || "";
    coachManagementFeedbackNode.style.color = isError ? "#ffb3b3" : "";
  }

  function setAdminCoachCodeFeedback(message, isError) {
    if (!adminCoachCodeFeedbackNode) {
      return;
    }

    adminCoachCodeFeedbackNode.textContent = message || "";
    adminCoachCodeFeedbackNode.style.color = isError ? "#ffb3b3" : "";
  }

  function setAdminClientCodeFeedback(message, isError) {
    if (!adminClientCodeFeedbackNode) {
      return;
    }

    adminClientCodeFeedbackNode.textContent = message || "";
    adminClientCodeFeedbackNode.style.color = isError ? "#ffb3b3" : "";
  }

  function setQaAccountsFeedback(message, isError) {
    if (!qaAccountsFeedbackNode) {
      return;
    }

    qaAccountsFeedbackNode.textContent = message || "";
    qaAccountsFeedbackNode.style.color = isError ? "#ffb3b3" : "";
  }

  function setQaAccountsBusy(isBusy) {
    if (qaAccountsRefreshButton) {
      qaAccountsRefreshButton.disabled = Boolean(isBusy);
    }

    if (qaAccountsSubmitButton) {
      qaAccountsSubmitButton.disabled = Boolean(isBusy);
    }
  }

  function getQaAccountFormValues() {
    return {
      coachEmail: String(qaCoachEmailNode?.value || "").trim(),
      clientEmail: String(qaClientEmailNode?.value || "").trim(),
      coachPassword: String(qaCoachPasswordNode?.value || ""),
      clientPassword: String(qaClientPasswordNode?.value || ""),
    };
  }

  function buildQaAccountSummaryMarkup(status) {
    const coach = status?.coach || {};
    const client = status?.client || {};
    const assignment = status?.assignment || {};

    const coachSummary = coach.exists
      ? `${normalizeStatusLabel(coach.profileStatus || "active")} • ${normalizeStatusLabel(coach.role || "coach")}`
      : "Not provisioned";
    const clientSummary = client.exists
      ? `${normalizeStatusLabel(client.profileStatus || "active")} • ${normalizeStatusLabel(client.role || "client")}`
      : "Not provisioned";
    const assignmentSummary = assignment.linked
      ? `Active • ${formatDate(assignment.assignedAt)}`
      : coach.exists && client.exists
        ? "Accounts exist but are not linked"
        : "Waiting for both QA accounts";

    return `
      <article class="dashboard-badge">
        <strong>QA Coach</strong>
        <p>${escapeHtml(coachSummary)}</p>
      </article>
      <article class="dashboard-badge">
        <strong>QA Client</strong>
        <p>${escapeHtml(clientSummary)}</p>
      </article>
      <article class="dashboard-badge">
        <strong>Assignment</strong>
        <p>${escapeHtml(assignmentSummary)}</p>
      </article>
    `;
  }

  function buildQaAccountDetailsMarkup(status) {
    const coach = status?.coach || {};
    const client = status?.client || {};
    const assignment = status?.assignment || {};

    const coachMeta = coach.exists
      ? [
          coach.specialty ? `Specialty: ${coach.specialty}` : "",
          coach.commissionTier ? `Tier: ${normalizeStatusLabel(coach.commissionTier)}` : "",
          coach.emailConfirmedAt ? `Confirmed ${formatDateTime(coach.emailConfirmedAt)}` : "Email not confirmed yet",
          coach.createdAt ? `Created ${formatDateTime(coach.createdAt)}` : "",
        ].filter(Boolean).join(" • ")
      : "This QA coach account is not provisioned yet.";

    const clientMeta = client.exists
      ? [
          client.memberId ? `Member ID: ${client.memberId}` : "",
          client.primaryGoal ? client.primaryGoal : "",
          client.emailConfirmedAt ? `Confirmed ${formatDateTime(client.emailConfirmedAt)}` : "Email not confirmed yet",
          client.createdAt ? `Created ${formatDateTime(client.createdAt)}` : "",
        ].filter(Boolean).join(" • ")
      : "This QA client account is not provisioned yet.";

    const assignmentMeta = assignment.linked
      ? [
          `Linked ${formatDateTime(assignment.assignedAt)}`,
          assignment.notes || "",
        ].filter(Boolean).join(" • ")
      : "Provisioning will recreate the accounts and re-link the QA client to the QA coach.";

    return `
      <article class="dashboard-note">
        <p><strong>QA Coach</strong><br />${escapeHtml(coach.displayName || "LEGACY QA Coach")} • ${escapeHtml(coach.email || status?.defaults?.coachEmail || "")}</p>
        <small>${escapeHtml(coachMeta)}</small>
      </article>
      <article class="dashboard-note">
        <p><strong>QA Client</strong><br />${escapeHtml(client.displayName || "LEGACY QA Client")} • ${escapeHtml(client.email || status?.defaults?.clientEmail || "")}</p>
        <small>${escapeHtml(clientMeta)}</small>
      </article>
      <article class="dashboard-note">
        <p><strong>Assignment</strong><br />${escapeHtml(assignment.linked ? "QA client is linked to the QA coach." : "QA accounts are not fully linked yet.")}</p>
        <small>${escapeHtml(assignmentMeta)}</small>
      </article>
    `;
  }

  function renderQaAccountCredentials(credentials) {
    if (!qaAccountsCredentialsNode) {
      return;
    }

    if (!credentials?.coach?.email || !credentials?.client?.email) {
      qaAccountsCredentialsNode.hidden = true;
      qaAccountsCredentialsNode.innerHTML = "";
      return;
    }

    qaAccountsCredentialsNode.hidden = false;
    qaAccountsCredentialsNode.innerHTML = `
      <article class="dashboard-note">
        <p><strong>QA Coach Login</strong><br />${escapeHtml(credentials.coach.email)}<br /><code>${escapeHtml(credentials.coach.password || "")}</code></p>
        <small>Shown immediately after provisioning so the team can copy the current QA coach access.</small>
      </article>
      <article class="dashboard-note">
        <p><strong>QA Client Login</strong><br />${escapeHtml(credentials.client.email)}<br /><code>${escapeHtml(credentials.client.password || "")}</code></p>
        <small>Shown immediately after provisioning so the team can copy the current QA client access.</small>
      </article>
    `;
  }

  function renderQaAccountStatus() {
    const status = dashboardState.qaAccountStatus;
    if (!qaAccountsSummaryNode || !qaAccountsDetailsNode) {
      return;
    }

    if (!status) {
      qaAccountsSummaryNode.innerHTML = `
        <article class="dashboard-badge dashboard-badge--placeholder">
          <strong>QA coach status is syncing</strong>
          <p>The current QA coach account state will appear here after the status request completes.</p>
        </article>
        <article class="dashboard-badge dashboard-badge--placeholder">
          <strong>QA client status is syncing</strong>
          <p>The linked QA client state will appear here after the status request completes.</p>
        </article>
        <article class="dashboard-badge dashboard-badge--placeholder">
          <strong>Assignment link is syncing</strong>
          <p>The coach-to-client QA assignment check will appear here once the manager finishes loading.</p>
        </article>
      `;
      qaAccountsDetailsNode.innerHTML = `
        <article class="dashboard-note dashboard-note--placeholder">
          <strong>QA account details are syncing</strong>
          <p>The current QA coach and QA client details will appear here once the status request completes.</p>
        </article>
      `;
      renderQaAccountCredentials(null);
      return;
    }

    qaAccountsSummaryNode.innerHTML = buildQaAccountSummaryMarkup(status);
    qaAccountsDetailsNode.innerHTML = buildQaAccountDetailsMarkup(status);
    renderQaAccountCredentials(dashboardState.qaAccountCredentials);
  }

  async function requestQaAccountStatus(method, body) {
    const accessToken = await getAccessToken();
    const headers = {
      Authorization: `Bearer ${accessToken}`,
    };

    const requestUrl = new URL("/.netlify/functions/manage-qa-accounts", window.location.origin);
    if (method === "GET") {
      const values = getQaAccountFormValues();
      if (values.coachEmail) {
        requestUrl.searchParams.set("coachEmail", values.coachEmail);
      }
      if (values.clientEmail) {
        requestUrl.searchParams.set("clientEmail", values.clientEmail);
      }
    } else {
      headers["Content-Type"] = "application/json";
    }

    const response = await window.fetch(requestUrl.toString(), {
      method,
      headers,
      body: method === "GET" ? undefined : JSON.stringify(body || {}),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload?.error || "Unable to reach the QA account manager right now.");
    }

    return payload;
  }

  async function loadQaAccountStatus(options) {
    if (!qaAccountsSummaryNode || dashboardState.qaAccountsLoading) {
      return;
    }

    const config = options || {};
    const silent = Boolean(config.silent);
    if (dashboardState.qaAccountsLoaded && !config.force) {
      renderQaAccountStatus();
      return;
    }

    dashboardState.qaAccountsLoading = true;
    setQaAccountsBusy(true);
    if (!silent) {
      setQaAccountsFeedback("Loading the current QA coach and client status...", false);
    }

    try {
      const payload = await requestQaAccountStatus("GET");
      dashboardState.qaAccountStatus = payload?.status || null;
      dashboardState.qaAccountCredentials = null;
      dashboardState.qaAccountsLoaded = Boolean(payload?.status);
      renderQaAccountStatus();
      if (!silent) {
        setQaAccountsFeedback("QA account status loaded.", false);
      }
    } catch (error) {
      setQaAccountsFeedback(error?.message || "Unable to load QA account status right now.", true);
    } finally {
      dashboardState.qaAccountsLoading = false;
      setQaAccountsBusy(false);
    }
  }

  async function handleQaAccountProvision(event) {
    event.preventDefault();
    if (dashboardState.qaAccountsLoading) {
      return;
    }

    const values = getQaAccountFormValues();
    if (!values.coachEmail || !values.clientEmail) {
      setQaAccountsFeedback("Provide both QA email addresses before provisioning.", true);
      return;
    }

    dashboardState.qaAccountsLoading = true;
    setQaAccountsBusy(true);
    setQaAccountsFeedback("Provisioning the QA coach and QA client accounts...", false);

    try {
      const payload = await requestQaAccountStatus("POST", values);
      dashboardState.qaAccountStatus = payload?.status || null;
      dashboardState.qaAccountCredentials = payload?.credentials || null;
      dashboardState.qaAccountsLoaded = Boolean(payload?.status);

      if (payload?.credentials?.coach?.email && qaCoachEmailNode) {
        qaCoachEmailNode.value = payload.credentials.coach.email;
      }
      if (payload?.credentials?.client?.email && qaClientEmailNode) {
        qaClientEmailNode.value = payload.credentials.client.email;
      }
      if (payload?.credentials?.coach?.password && qaCoachPasswordNode) {
        qaCoachPasswordNode.value = payload.credentials.coach.password;
      }
      if (payload?.credentials?.client?.password && qaClientPasswordNode) {
        qaClientPasswordNode.value = payload.credentials.client.password;
      }

      renderQaAccountStatus();
      setQaAccountsFeedback(payload?.message || "QA accounts provisioned.", false);
    } catch (error) {
      setQaAccountsFeedback(error?.message || "Unable to provision the QA accounts right now.", true);
    } finally {
      dashboardState.qaAccountsLoading = false;
      setQaAccountsBusy(false);
    }
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/gu, "&amp;")
      .replace(/</gu, "&lt;")
      .replace(/>/gu, "&gt;")
      .replace(/"/gu, "&quot;")
      .replace(/'/gu, "&#39;");
  }

  function normalizeStatusLabel(status) {
    return String(status || "pending")
      .replace(/_/gu, " ")
      .replace(/\b\w/gu, (char) => char.toUpperCase());
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

  function renderAdminBillingDocumentButtons(order) {
    const buttons = [];

    if (hasBillingDocument(order, "invoice")) {
      buttons.push(
        `<button class="btn btn-secondary billing-doc-button" type="button" data-order-document="invoice" data-order-id="${escapeHtml(order.id)}">Invoice</button>`
      );
    }

    if (hasBillingDocument(order, "receipt")) {
      buttons.push(
        `<button class="btn btn-secondary billing-doc-button" type="button" data-order-document="receipt" data-order-id="${escapeHtml(order.id)}">Receipt</button>`
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

  function formatCurrency(value) {
    const amount = Number(value || 0);
    return new Intl.NumberFormat("en-MY", {
      style: "currency",
      currency: "MYR",
      minimumFractionDigits: 2,
    }).format(amount);
  }

  function formatNumber(value) {
    return new Intl.NumberFormat("en-MY").format(Number(value || 0));
  }

  function formatDate(value) {
    if (!value) {
      return "TBD";
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

  function formatMonthLabel(value) {
    if (!value) {
      return "No month";
    }

    const normalized = /^\d{4}-\d{2}$/.test(String(value)) ? `${value}-01` : String(value);
    const date = new Date(normalized);
    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return new Intl.DateTimeFormat("en-MY", {
      year: "numeric",
      month: "short",
    }).format(date);
  }

  function formatDateTime(value) {
    if (!value) {
      return "TBD";
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

  function truncateText(value, maxLength = 56) {
    const text = String(value || "").trim();
    if (!text || text.length <= maxLength) {
      return text;
    }
    return `${text.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
  }

  function getLegacyCodexBundle() {
    const bundle = window.LEGACY_CODEX_BUNDLE;
    if (!bundle || typeof bundle !== "object") {
      return null;
    }
    return bundle;
  }

  function buildCodexBundleSummary(bundle) {
    const contents = bundle?.contents && typeof bundle.contents === "object" ? bundle.contents : {};
    const rulesEngine = contents.rulesEngine && typeof contents.rulesEngine === "object" ? contents.rulesEngine : {};
    const metadata = rulesEngine.metadata && typeof rulesEngine.metadata === "object" ? rulesEngine.metadata : {};
    const settings = rulesEngine.settings && typeof rulesEngine.settings === "object" ? rulesEngine.settings : {};
    const xpCurve = rulesEngine.xpCurve && typeof rulesEngine.xpCurve === "object" ? rulesEngine.xpCurve : {};
    const actions = Array.isArray(rulesEngine.actions) ? rulesEngine.actions : [];
    const importContract = contents.importContract && typeof contents.importContract === "object" ? contents.importContract : {};
    const entities = importContract.entities && typeof importContract.entities === "object" ? importContract.entities : {};
    const derivedViews =
      importContract.derivedViews && typeof importContract.derivedViews === "object" ? importContract.derivedViews : {};
    const normalization =
      importContract.normalization && typeof importContract.normalization === "object" ? importContract.normalization : {};

    const categoryCounts = actions.reduce((counts, action) => {
      const key = action?.category || "Unknown";
      counts[key] = (counts[key] || 0) + 1;
      return counts;
    }, {});

    const earnTypeCounts = actions.reduce((counts, action) => {
      const key = action?.earnType || "Unknown";
      counts[key] = (counts[key] || 0) + 1;
      return counts;
    }, {});

    const topActions = [...actions]
      .sort((left, right) => {
        const xpDiff = Number(right?.xp || 0) - Number(left?.xp || 0);
        if (xpDiff !== 0) {
          return xpDiff;
        }
        return Number(right?.coins || 0) - Number(left?.coins || 0);
      })
      .slice(0, 8);

    const maxXp = actions.reduce((max, action) => Math.max(max, Number(action?.xp || 0)), 0);
    const maxCoins = actions.reduce((max, action) => Math.max(max, Number(action?.coins || 0)), 0);
    const verifiedActionCount = actions.filter((action) => Boolean(action?.verificationRequired)).length;
    const entityKeys = Object.keys(entities);
    const derivedViewKeys = Object.keys(derivedViews);
    const categoryPreview = Object.entries(categoryCounts)
      .sort((left, right) => right[1] - left[1])
      .slice(0, 5);

    return {
      bundleType: bundle.bundleType || "Rules bundle",
      bundleVersion: bundle.bundleVersion || "Unknown",
      generatedAt: bundle.generatedAt || "",
      metadata,
      settings,
      xpCurve,
      actions,
      topActions,
      categoryCounts,
      earnTypeCounts,
      categoryPreview,
      entityKeys,
      derivedViewKeys,
      normalization,
      maxXp,
      maxCoins,
      verifiedActionCount,
      importContract,
    };
  }

  function getCodexActionMap() {
    const actions = getLegacyCodexBundle()?.contents?.rulesEngine?.actions;
    return new Map((Array.isArray(actions) ? actions : []).map((action) => [action.actionId, action]));
  }

  function extractCodexActionIdFromRewardReason(reason) {
    const match = String(reason || "").match(/\[([A-Z0-9-]+)\]/u);
    return match ? match[1] : "";
  }

  function stripCodexActionIdFromRewardReason(reason) {
    return String(reason || "").replace(/^\s*\[[A-Z0-9-]+\]\s*/u, "").trim();
  }

  function formatPlannerSourceLabel(sourceModule) {
    const value = String(sourceModule || "").trim().toLowerCase();
    if (value === "workout_log") return "Training Log";
    if (value === "nutrition_log") return "Nutrition Log";
    if (value === "client_checkin") return "Health Update";
    if (value === "progress_photo") return "Progress Photos";
    return value ? normalizeStatusLabel(value) : "Planner";
  }

  function formatPlannerRewardMeta(plannerRewardEvent) {
    const metadata = plannerRewardEvent?.metadata && typeof plannerRewardEvent.metadata === "object"
      ? plannerRewardEvent.metadata
      : {};
    const bits = [];

    if (metadata.completedAt) {
      bits.push(formatDateTime(metadata.completedAt));
    }
    if (metadata.submittedAt) {
      bits.push(formatDateTime(metadata.submittedAt));
    }
    if (metadata.logDate) {
      bits.push(formatDate(metadata.logDate));
    }
    if (metadata.dueAt) {
      bits.push(`Due ${formatDateTime(metadata.dueAt)}`);
    }
    if (Number.isFinite(Number(metadata.adherenceScore))) {
      bits.push(`${Number(metadata.adherenceScore).toFixed(0)}% adherence`);
    }

    return bits.join(" • ");
  }

  function renderCodexBundleAddon() {
    if (
      !codexBundleStatusNode &&
      !codexBundleMetricsNode &&
      !codexBundleMetaNode &&
      !codexBundleCompatibilityNode &&
      !codexBundleImportsNode &&
      !codexBundleActionRowsNode
    ) {
      return;
    }

    const bundle = getLegacyCodexBundle();
    if (!bundle) {
      if (codexBundleStatusNode) {
        codexBundleStatusNode.textContent = "LEGACY+ Codex bundle not found. The CRM remains unchanged and fully operational.";
        codexBundleStatusNode.style.color = "#ffb3b3";
      }

      if (codexBundleMetricsNode) {
        codexBundleMetricsNode.innerHTML = `
          <div class="dashboard-badge">
            <strong>Bundle</strong>
            <p>Not loaded</p>
          </div>
        `;
      }

      if (codexBundleMetaNode) {
        codexBundleMetaNode.innerHTML = `
          <article class="dashboard-note">
            <p>No bundle asset is mounted on this page.</p>
            <small>Current CRM data and operating rules continue unchanged.</small>
          </article>
        `;
      }

      if (codexBundleCompatibilityNode) {
        codexBundleCompatibilityNode.innerHTML = `
          <li>No addon was mounted, so no compatibility surface was applied.</li>
          <li>The current CRM code and data stay untouched in this state.</li>
        `;
      }

      if (codexBundleImportsNode) {
        codexBundleImportsNode.innerHTML = `
          <article class="dashboard-note">
            <p>Import contract unavailable.</p>
            <small>No workbook entities or derived views were attached.</small>
          </article>
        `;
      }

      if (codexBundleActionRowsNode) {
        codexBundleActionRowsNode.innerHTML = `
          <tr>
            <td colspan="5">No bundle actions available because the addon asset is not mounted.</td>
          </tr>
        `;
      }
      return;
    }

    const summary = buildCodexBundleSummary(bundle);
    const metadata = summary.metadata;
    const settings = summary.settings;
    const xpCurve = summary.xpCurve;
    const normalization = summary.normalization;
    const workbookSource = summary.importContract?.workbook;
    const sourceWorkbook =
      metadata.sourceWorkbook ||
      (typeof workbookSource === "string" ? workbookSource : workbookSource?.filename) ||
      "Attached workbook";
    const categoryBreakdown = summary.categoryPreview
      .map(([category, count]) => `${category} (${formatNumber(count)})`)
      .join(" • ");
    const earnTypeBreakdown = Object.entries(summary.earnTypeCounts)
      .sort((left, right) => right[1] - left[1])
      .map(([earnType, count]) => `${earnType} (${formatNumber(count)})`)
      .join(" • ");

    if (codexBundleStatusNode) {
      codexBundleStatusNode.textContent = `Read-only addon loaded • ${metadata.systemName || "LEGACY+"} ${metadata.version || summary.bundleVersion || ""} • Generated ${formatDate(summary.generatedAt)} • No CRM data was modified.`;
      codexBundleStatusNode.style.color = "";
    }

    if (codexBundleMetricsNode) {
      codexBundleMetricsNode.innerHTML = `
        <div class="dashboard-badge">
          <strong>Actions</strong>
          <p>${formatNumber(summary.actions.length)} verified reward actions</p>
        </div>
        <div class="dashboard-badge">
          <strong>Categories</strong>
          <p>${formatNumber(Object.keys(summary.categoryCounts).length)} reward categories</p>
        </div>
        <div class="dashboard-badge">
          <strong>Earn Types</strong>
          <p>${formatNumber(Object.keys(summary.earnTypeCounts).length)} earning paths</p>
        </div>
        <div class="dashboard-badge">
          <strong>Routine Cap</strong>
          <p>${formatNumber(settings.routineWeeklyCapXP)} XP weekly</p>
        </div>
        <div class="dashboard-badge">
          <strong>Coin Cap</strong>
          <p>${formatNumber(settings.monthlyCoinCap)} coins monthly</p>
        </div>
        <div class="dashboard-badge">
          <strong>Peak Reward</strong>
          <p>${formatNumber(summary.maxXp)} XP / ${formatNumber(summary.maxCoins)} coins</p>
        </div>
      `;
    }

    if (codexBundleMetaNode) {
      codexBundleMetaNode.innerHTML = `
        <article class="dashboard-note">
          <p>${escapeHtml(metadata.systemName || "LEGACY+")} | ${escapeHtml(metadata.version || summary.bundleVersion || "Rules bundle")}</p>
          <small>Effective ${escapeHtml(formatDate(metadata.effectiveDate || summary.generatedAt))} • Source workbook: ${escapeHtml(sourceWorkbook)}</small>
        </article>
        <article class="dashboard-note">
          <p>${escapeHtml(metadata.region || "Malaysia")} | ${escapeHtml(metadata.timezone || "Asia/Kuala_Lumpur")}</p>
          <small>Bundle type: ${escapeHtml(summary.bundleType)} • Bundle version: ${escapeHtml(summary.bundleVersion)}</small>
        </article>
        <article class="dashboard-note">
          <p>XP curve: ${escapeHtml(String(xpCurve.formula || "level^2"))}</p>
          <small>Max level ${escapeHtml(formatNumber(xpCurve.maxLevel || 0))} • XP at max ${escapeHtml(formatNumber(xpCurve.xpAtMaxLevel || 0))}</small>
        </article>
        <article class="dashboard-note">
          <p>Verification-first ruleset</p>
          <small>${escapeHtml(formatNumber(summary.verifiedActionCount))} of ${escapeHtml(formatNumber(summary.actions.length))} actions require verification before counting.</small>
        </article>
      `;
    }

    if (codexBundleCompatibilityNode) {
      codexBundleCompatibilityNode.innerHTML = `
        <li>This bundle is mounted as a read-only frontend addon, so there are no database writes, migrations, or record overrides.</li>
        <li>The current CRM codebase already tracks XP points and gym coins on client profiles, so the reward model has a compatible destination.</li>
        <li>The current CRM already uses a points ledger approval flow, which aligns with the bundle rule that all reward actions require verification.</li>
        <li>Workbook entities (${escapeHtml(summary.entityKeys.join(", "))}) are attached for reference only. Import execution is intentionally disabled in this build.</li>
        <li>The seed-placement contract recommends audit event injection rather than direct ledger edits, and that behavior remains disabled until you explicitly want an importer.</li>
      `;
    }

    if (codexBundleImportsNode) {
      codexBundleImportsNode.innerHTML = `
        <article class="dashboard-note">
          <p>Import entities</p>
          <small>${escapeHtml(summary.entityKeys.join(", "))}</small>
        </article>
        <article class="dashboard-note">
          <p>Derived views</p>
          <small>${escapeHtml(summary.derivedViewKeys.join(", "))} • Summary sheets stay reference-only and are not imported as truth.</small>
        </article>
        <article class="dashboard-note">
          <p>Normalization rules</p>
          <small>Trim headers: ${escapeHtml(String(Boolean(normalization.trimHeaders)))} • Trim strings: ${escapeHtml(String(Boolean(normalization.trimStrings)))} • Empty to null: ${escapeHtml(String(Boolean(normalization.emptyToNull)))}</small>
        </article>
        <article class="dashboard-note">
          <p>Rules coverage snapshot</p>
          <small>${escapeHtml(categoryBreakdown || "No categories found")} • ${escapeHtml(earnTypeBreakdown || "No earn types found")}</small>
        </article>
      `;
    }

    if (codexBundleActionRowsNode) {
      codexBundleActionRowsNode.innerHTML = summary.topActions.length
        ? summary.topActions
            .map(
              (action) => `
                <tr>
                  <td>${escapeHtml(action.displayName || action.actionId || "Action")}</td>
                  <td>${escapeHtml(action.category || "Unknown")}</td>
                  <td>${escapeHtml(action.earnType || "Unknown")}</td>
                  <td>${escapeHtml(formatNumber(action.xp || 0))}</td>
                  <td>${escapeHtml(formatNumber(action.coins || 0))}</td>
                </tr>
              `
            )
            .join("")
        : `
          <tr>
            <td colspan="5">No reward actions found inside the mounted bundle.</td>
          </tr>
        `;
    }
  }

  function setGamificationImportFeedback(message, isError) {
    if (!gamificationImportFeedbackNode) {
      return;
    }

    gamificationImportFeedbackNode.textContent = message || "";
    gamificationImportFeedbackNode.classList.toggle("error", Boolean(isError));
    gamificationImportFeedbackNode.classList.toggle("success", Boolean(message) && !isError);
  }

  function buildSeedImportBatchLabel() {
    return `seed-placement-${new Date().toISOString().slice(0, 10)}`;
  }

  function buildGamificationImportPreviewKey() {
    return JSON.stringify({
      batch: String(gamificationImportBatchNode?.value || "").trim(),
      rowsText: String(gamificationImportRowsInputNode?.value || "").trim(),
    });
  }

  function syncGamificationImportApplyState() {
    if (!gamificationImportApplyButton) {
      return;
    }

    const hasMatchingPreview =
      dashboardState.gamificationImportPreviewKey
      && dashboardState.gamificationImportPreviewKey === buildGamificationImportPreviewKey()
      && dashboardState.gamificationImportReadyCount > 0;
    gamificationImportApplyButton.disabled = !hasMatchingPreview;
  }

  function renderGamificationImportResult(payload) {
    if (gamificationImportSummaryNode) {
      const summary = payload?.summary || {};
      gamificationImportSummaryNode.innerHTML = `
        <article class="dashboard-badge">
          <strong>Total Rows</strong>
          <p>${escapeHtml(formatNumber(summary.totalRows || 0))}</p>
        </article>
        <article class="dashboard-badge">
          <strong>Ready</strong>
          <p>${escapeHtml(formatNumber(summary.readyCount || 0))}</p>
        </article>
        <article class="dashboard-badge">
          <strong>Imported</strong>
          <p>${escapeHtml(formatNumber(summary.importedCount || 0))}</p>
        </article>
        <article class="dashboard-badge">
          <strong>Already Seeded</strong>
          <p>${escapeHtml(formatNumber(summary.alreadySeededCount || 0))}</p>
        </article>
        <article class="dashboard-badge">
          <strong>Unmatched</strong>
          <p>${escapeHtml(formatNumber(summary.unmatchedCount || 0))}</p>
        </article>
        <article class="dashboard-badge">
          <strong>Skipped / Invalid</strong>
          <p>${escapeHtml(formatNumber((summary.skippedCount || 0) + (summary.invalidCount || 0) + (summary.duplicateCount || 0)))}</p>
        </article>
      `;
    }

    if (gamificationImportRowsNode) {
      const rows = Array.isArray(payload?.rows) ? payload.rows : [];
      gamificationImportRowsNode.innerHTML = rows.length
        ? rows
            .slice(0, 60)
            .map(
              (row) => `
                <tr>
                  <td>${escapeHtml(formatNumber(row.rowNumber || 0))}</td>
                  <td>${escapeHtml(row.memberId || "-")}</td>
                  <td>${escapeHtml(row.clientName || "-")}</td>
                  <td>${escapeHtml(row.seedXpLocked ? formatNumber(row.seedXpLocked) : "-")}</td>
                  <td>${escapeHtml(normalizeStatusLabel(row.status || "unknown"))}</td>
                  <td>${escapeHtml(row.message || "-")}</td>
                </tr>
              `
            )
            .join("")
        : `
          <tr>
            <td colspan="6">No preview rows were returned for this batch.</td>
          </tr>
        `;
    }
  }

  function resetGamificationImportPreviewState() {
    dashboardState.gamificationImportPreviewKey = "";
    dashboardState.gamificationImportReadyCount = 0;
    syncGamificationImportApplyState();
  }

  async function requestGamificationSeedImport(action) {
    if (!gamificationImportRowsInputNode) {
      return;
    }

    const rowsText = String(gamificationImportRowsInputNode.value || "").trim();
    const batchLabel = String(gamificationImportBatchNode?.value || "").trim() || buildSeedImportBatchLabel();
    if (gamificationImportBatchNode && !gamificationImportBatchNode.value.trim()) {
      gamificationImportBatchNode.value = batchLabel;
    }

    if (!rowsText) {
      setGamificationImportFeedback("Paste SeedPlacement JSON or CSV rows before running the importer.", true);
      return;
    }

    const requestAction = action === "apply" ? "apply_seed_import" : "preview_seed_import";

    try {
      const accessToken = await getAccessToken();
      setGamificationImportFeedback(
        action === "apply" ? "Applying seed placement import..." : "Previewing seed placement import...",
        false
      );
      if (gamificationImportPreviewButton) gamificationImportPreviewButton.disabled = true;
      if (gamificationImportApplyButton) gamificationImportApplyButton.disabled = true;

      const response = await window.fetch("/.netlify/functions/manage-gamification-imports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          action: requestAction,
          batchLabel,
          rowsText,
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error || "Unable to process the gamification import.");
      }

      renderGamificationImportResult(payload);

      if (action === "preview") {
        dashboardState.gamificationImportPreviewKey = buildGamificationImportPreviewKey();
        dashboardState.gamificationImportReadyCount = Number(payload?.summary?.readyCount || 0);
        setGamificationImportFeedback(payload?.message || "Preview complete. Review the batch before applying it.", false);
      } else {
        dashboardState.gamificationImportPreviewKey = "";
        dashboardState.gamificationImportReadyCount = 0;
        setGamificationImportFeedback(payload?.message || "Seed placement import applied.", false);
      }
    } catch (error) {
      setGamificationImportFeedback(error?.message || "Unable to process the gamification import right now.", true);
    } finally {
      if (gamificationImportPreviewButton) gamificationImportPreviewButton.disabled = false;
      syncGamificationImportApplyState();
    }
  }

  function initializeGamificationImportUi() {
    if (!gamificationImportRowsInputNode) {
      return;
    }

    if (gamificationImportBatchNode && !gamificationImportBatchNode.value) {
      gamificationImportBatchNode.value = buildSeedImportBatchLabel();
    }

    resetGamificationImportPreviewState();
    renderGamificationImportResult({
      summary: {},
      rows: [],
    });
    setGamificationImportFeedback(
      "Paste SeedPlacement rows as JSON or CSV, preview the result, then apply only when the ready rows look correct.",
      false
    );
  }

  function formatPercent(value, digits = 1) {
    const normalized = Number(value || 0);
    return `${normalized.toFixed(digits)}%`;
  }

  function formatCompactNumber(value) {
    return new Intl.NumberFormat("en-MY", {
      maximumFractionDigits: 1,
      notation: "compact",
    }).format(Number(value || 0));
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  const METRIC_CHART_COLORS = [
    "#f15922",
    "#fea12a",
    "#ffd7a5",
    "#ff8b5c",
    "#905833",
    "#4d2b1b",
  ];

  function toInputDateTime(value) {
    if (!value) {
      return "";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "";
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  function toInputDate(value) {
    if (!value) {
      return "";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toISOString().slice(0, 10);
  }

  function getCoachOpsData() {
    return window.LEGACY_COACH_OPERATIONS || { positions: [], tiers: [] };
  }

  function getImportedOpexBudget() {
    const budget = window.LEGACY_IMPORTED_OPEX_BUDGET;
    if (!budget || !Array.isArray(budget.categories)) {
      return {
        categories: [],
        monthLabels: [],
        declaredAnnualTotal: 0,
        computedAnnualTotal: 0,
        notes: [],
      };
    }

    return budget;
  }

  function parseJsonObject(value, fallback = {}) {
    if (!value) {
      return fallback;
    }

    if (typeof value === "string") {
      try {
        return JSON.parse(value);
      } catch (_) {
        return fallback;
      }
    }

    return typeof value === "object" ? value : fallback;
  }

  function tierSortValue(value) {
    return Number(String(value || "").replace(/[^\d]/gu, "") || 0);
  }

  function findPositionPreset(positionCode) {
    return getCoachOpsData().positions.find((item) => item.id === positionCode) || null;
  }

  function findTierPreset(tierCode) {
    return getCoachOpsData().tiers.find((item) => item.id === tierCode) || null;
  }

  function buildDefaultKpiSummary(tierCode, hoursCompleted, assessmentComplete) {
    const tierPreset = findTierPreset(tierCode);
    const items = (tierPreset?.kpis || []).map((label, index) => ({
      id: `${tierCode || "tier"}-kpi-${index + 1}`,
      label,
      checked: false,
    }));

    return {
      hoursCompleted: Number(hoursCompleted || 0),
      assessmentComplete: Boolean(assessmentComplete),
      items,
    };
  }

  function hydrateKpiSummary(tierCode, existingSummary) {
    const summary = parseJsonObject(existingSummary, {});
    const tierPreset = findTierPreset(tierCode);
    const existingItems = Array.isArray(summary.items) ? summary.items : [];
    const defaultItems = (tierPreset?.kpis || []).map((label, index) => {
      const existingItem = existingItems.find((item) => item?.label === label);
      return {
        id: existingItem?.id || `${tierCode || "tier"}-kpi-${index + 1}`,
        label,
        checked: Boolean(existingItem?.checked),
      };
    });

    return {
      hoursCompleted: Number(summary.hoursCompleted || 0),
      assessmentComplete: Boolean(summary.assessmentComplete),
      items: defaultItems.length ? defaultItems : existingItems,
    };
  }

  function addMonths(dateValue, months) {
    const date = new Date(dateValue || Date.now());
    if (Number.isNaN(date.getTime())) {
      return "";
    }
    const next = new Date(date);
    next.setMonth(next.getMonth() + months);
    return next.toISOString().slice(0, 10);
  }

  function startOfCurrentMonth() {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  }

  function endOfToday() {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59));
  }

  function getFinanceReportFilters() {
    return {
      from: financeReportFromNode?.value || toInputDate(startOfCurrentMonth()),
      to: financeReportToNode?.value || toInputDate(endOfToday()),
      orderType: financeReportOrderTypeNode?.value || "all",
    };
  }

  function filterOrdersByDateRange(data, filters) {
    const fromMs = filters?.from ? new Date(`${filters.from}T00:00:00`).getTime() : Number.NEGATIVE_INFINITY;
    const toMs = filters?.to ? new Date(`${filters.to}T23:59:59`).getTime() : Number.POSITIVE_INFINITY;

    return (data.orders || []).filter((order) => {
      const createdAt = new Date(order.created_at || 0).getTime();
      if (Number.isNaN(createdAt) || createdAt < fromMs || createdAt > toMs) {
        return false;
      }

      if (filters?.orderType && filters.orderType !== "all" && order.order_type !== filters.orderType) {
        return false;
      }

      return true;
    });
  }

  function groupBy(array, keySelector) {
    return array.reduce((map, item) => {
      const key = keySelector(item);
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key).push(item);
      return map;
    }, new Map());
  }

  function normalizePhoneForWhatsApp(value) {
    return String(value || "").replace(/[^\d]/gu, "");
  }

  async function getAccessToken() {
    const accessToken = await window.legacyAuth?.getAccessToken?.();
    if (!accessToken) {
      throw new Error("Admin session token is unavailable.");
    }

    return accessToken;
  }

  async function fetchOperatingCostState(accessToken) {
    if (!accessToken) {
      return { entries: [], summary: null };
    }

    const response = await window.fetch("/.netlify/functions/manage-operating-costs", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload?.error || "Unable to load operating costs.");
    }

    return {
      entries: Array.isArray(payload.entries) ? payload.entries : [],
      summary: payload.summary || null,
    };
  }

  async function openBillingDocument(orderId, documentType) {
    const accessToken = await getAccessToken();
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

    const access = await window.legacyAuth.requireRole("super_admin");
    if (!access.ok) {
      throw new Error("No super admin session is active.");
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
    dashboardState.coaches = data?.coaches || [];
    dashboardState.clients = data?.clients || [];
    dashboardState.assignments = data?.assignments || [];
    dashboardState.rewards = data?.rewards || [];
    dashboardState.plannerRewardEvents = data?.plannerRewardEvents || [];
    dashboardState.leads = data?.leads || [];
    dashboardState.notifications = data?.notifications || [];
    dashboardState.activationCodes = data?.activationCodes || [];
  }

  async function loadPlannerRewardEventsForLedgerEntriesDirect(supabase, rewards) {
    const rewardIds = Array.from(new Set((rewards || []).map((reward) => reward.id).filter(Boolean)));
    if (!rewardIds.length) {
      return [];
    }

    const [xpLinkedResponse, coinLinkedResponse] = await Promise.all([
      supabase
        .from("planner_reward_events")
        .select(
          "id, client_id, coach_id, source_module, source_record_id, action_id, approval_status, requested_by, approved_by, approved_at, xp_ledger_entry_id, coin_ledger_entry_id, reason, metadata, created_at"
        )
        .in("xp_ledger_entry_id", rewardIds),
      supabase
        .from("planner_reward_events")
        .select(
          "id, client_id, coach_id, source_module, source_record_id, action_id, approval_status, requested_by, approved_by, approved_at, xp_ledger_entry_id, coin_ledger_entry_id, reason, metadata, created_at"
        )
        .in("coin_ledger_entry_id", rewardIds),
    ]);

    [xpLinkedResponse, coinLinkedResponse].forEach((response) => {
      if (response.error) {
        throw response.error;
      }
    });

    return Array.from(
      new Map(
        [...(xpLinkedResponse.data || []), ...(coinLinkedResponse.data || [])]
          .filter((item) => item?.id)
          .map((item) => [item.id, item])
      ).values()
    );
  }

  async function fetchDashboardDataFromServer(options = {}) {
    const accessToken = await getAccessToken();
    const params = new URLSearchParams({
      scope: "admin",
      page: DASHBOARD_PAGE_KEY,
    });
    if (options?.variant) {
      params.set("variant", String(options.variant));
    }
    const response = await window.fetch(`/.netlify/functions/load-dashboard-data?${params.toString()}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload?.data) {
      throw new Error(payload?.error || "Unable to load your admin dashboard data right now.");
    }

    syncDashboardStateFromData(payload.data);
    return payload.data;
  }

  async function fetchDashboardDataDirect() {
    const { access, supabase } = await loadAccessAndClient();
    const currentMonthStart = startOfCurrentMonth().toISOString().slice(0, 10);

    if (DASHBOARD_PAGE_KEY === "clients") {
      const [
        coachesResponse,
        coachProfilesResponse,
        clientsResponse,
        clientProfilesResponse,
        assignmentsResponse,
        packagesResponse,
        rewardsResponse,
        notificationsResponse,
        activationCodesResponse,
      ] = await Promise.all([
        supabase.from("profiles").select("id, display_name, status").eq("role", "coach").order("created_at", { ascending: true }),
        supabase
          .from("coach_profiles")
          .select(
            "id, commission_tier, commission_rate, position_code, commission_cap, commission_bonus_notes, hours_minimum, hours_target, review_due_at, last_reviewed_at, promotion_ready, kpi_summary, notes, google_calendar_email, calendar_sync_enabled"
          )
          .order("created_at", { ascending: true }),
        supabase.from("profiles").select("id, display_name, status").eq("role", "client").order("created_at", { ascending: true }),
        supabase.from("client_profiles").select("id, preferred_name, xp_points, gym_coins, primary_goal"),
        supabase
          .from("coach_client_assignments")
          .select("id, coach_id, client_id, status, assigned_at, ended_at")
          .order("assigned_at", { ascending: false }),
        supabase
          .from("client_packages")
          .select("id, client_id, package_name, sessions_purchased, sessions_remaining, status, order_id, created_at, activated_at")
          .order("created_at", { ascending: false }),
        supabase
          .from("points_ledger")
          .select("id, client_id, points_type, delta, reason, requested_by, approved_by, approval_status, created_at")
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("notifications")
          .select("id, category, title, body, action_url, is_read, created_at")
          .order("created_at", { ascending: false })
          .limit(40),
        supabase
          .from("activation_codes")
          .select("id, role, code, recipient_email, recipient_name, assigned_coach_id, status, expires_at, used_at, created_at")
          .order("created_at", { ascending: false })
          .limit(60),
      ]);

      const responses = [
        coachesResponse,
        coachProfilesResponse,
        clientsResponse,
        clientProfilesResponse,
        assignmentsResponse,
        packagesResponse,
        rewardsResponse,
        notificationsResponse,
        activationCodesResponse,
      ];

      for (const response of responses) {
        if (response.error) {
          throw response.error;
        }
      }

      const coaches = coachesResponse.data || [];
      const clients = clientsResponse.data || [];
      const rewards = rewardsResponse.data || [];
      const plannerRewardEvents = await loadPlannerRewardEventsForLedgerEntriesDirect(supabase, rewards);
      const actorProfiles = Array.from(
        new Map(
          coaches
            .concat(clients)
            .concat([{ id: access.user.id, display_name: "Super Admin", role: "super_admin" }])
            .filter((item) => item?.id)
            .map((item) => [item.id, { id: item.id, display_name: item.display_name || "Account", role: item.role || item.status || "" }])
        ).values()
      );

      syncDashboardStateFromData({
        coaches,
        clients,
        assignments: assignmentsResponse.data || [],
        rewards,
        plannerRewardEvents,
        notifications: notificationsResponse.data || [],
        activationCodes: activationCodesResponse.data || [],
      });

      return {
        access,
        coaches,
        coachProfiles: coachProfilesResponse.data || [],
        clients,
        clientProfiles: clientProfilesResponse.data || [],
        assignments: assignmentsResponse.data || [],
        clientPackages: packagesResponse.data || [],
        rewards,
        plannerRewardEvents,
        notifications: notificationsResponse.data || [],
        activationCodes: activationCodesResponse.data || [],
        actorProfiles,
        currentMonthStart,
      };
    }

    if (DASHBOARD_PAGE_KEY === "leads") {
      const [coachesResponse, leadsResponse, leadActivitiesResponse] = await Promise.all([
        supabase.from("profiles").select("id, display_name, status").eq("role", "coach").order("created_at", { ascending: true }),
        supabase
          .from("leads")
          .select("id, full_name, email, phone, source, status, next_follow_up_at, owner_id, notes, converted_client_id, created_at")
          .order("created_at", { ascending: false })
          .limit(120),
        supabase
          .from("lead_activities")
          .select("id, lead_id, actor_id, activity_type, notes, created_at")
          .order("created_at", { ascending: false })
          .limit(80),
      ]);

      const responses = [coachesResponse, leadsResponse, leadActivitiesResponse];
      for (const response of responses) {
        if (response.error) {
          throw response.error;
        }
      }

      const coaches = coachesResponse.data || [];
      const leads = leadsResponse.data || [];
      const leadActivities = leadActivitiesResponse.data || [];
      const actorIds = Array.from(
        new Set(
          leads
            .flatMap((lead) => [lead.owner_id, lead.converted_client_id])
            .concat(leadActivities.flatMap((activity) => [activity.actor_id]))
            .concat(access.user.id)
            .filter(Boolean)
        )
      );

      const actorProfilesResponse = actorIds.length
        ? await supabase.from("profiles").select("id, display_name, role").in("id", actorIds)
        : { data: [], error: null };

      if (actorProfilesResponse.error) {
        throw actorProfilesResponse.error;
      }

      syncDashboardStateFromData({
        coaches,
        leads,
      });

      return {
        access,
        coaches,
        leads,
        leadActivities,
        actorProfiles: actorProfilesResponse.data || [],
        currentMonthStart,
      };
    }

    if (DASHBOARD_PAGE_KEY === "financials") {
      const [
        coachesResponse,
        clientsResponse,
        packagesResponse,
        ordersResponse,
        sessionsResponse,
        commissionsResponse,
        bookingRequestsResponse,
      ] = await Promise.all([
        supabase.from("profiles").select("id, display_name, status").eq("role", "coach").order("created_at", { ascending: true }),
        supabase.from("profiles").select("id, display_name, status").eq("role", "client").order("created_at", { ascending: true }),
        supabase
          .from("client_packages")
          .select("id, client_id, package_name, sessions_purchased, sessions_remaining, status, order_id, created_at, activated_at")
          .order("created_at", { ascending: false }),
        supabase
          .from("orders")
          .select(
            "id, client_id, order_type, total_amount_rm, tax_amount_rm, status, created_at, external_reference, invoice_number, invoice_storage_path, receipt_number, receipt_storage_path, refund_receipt_number, refund_receipt_storage_path"
          )
          .order("created_at", { ascending: false })
          .limit(120),
        supabase
          .from("sessions")
          .select("id, client_package_id, coach_id, status, scheduled_start, scheduled_end, session_value_rm, completed_at")
          .order("created_at", { ascending: false })
          .limit(400),
        supabase
          .from("commission_records")
          .select("id, coach_id, session_id, amount_rm, payout_month, payout_status, created_at")
          .order("created_at", { ascending: false })
          .limit(120),
        supabase
          .from("booking_requests")
          .select("id, client_id, client_package_id, status")
          .order("created_at", { ascending: false })
          .limit(120),
      ]);

      const responses = [
        coachesResponse,
        clientsResponse,
        packagesResponse,
        ordersResponse,
        sessionsResponse,
        commissionsResponse,
        bookingRequestsResponse,
      ];
      for (const response of responses) {
        if (response.error) {
          throw response.error;
        }
      }

      const orders = ordersResponse.data || [];
      const orderIds = orders.map((order) => order.id);
      const [paymentsResponse, orderItemsResponse] = await Promise.all([
        orderIds.length
          ? supabase.from("payments").select("order_id, status, fees_rm, payment_method").in("order_id", orderIds)
          : Promise.resolve({ data: [], error: null }),
        orderIds.length
          ? supabase
              .from("order_items")
              .select("order_id, package_id, package_code, name, quantity, total_amount_rm, metadata")
              .in("order_id", orderIds)
          : Promise.resolve({ data: [], error: null }),
      ]);

      if (paymentsResponse.error) {
        throw paymentsResponse.error;
      }
      if (orderItemsResponse.error) {
        throw orderItemsResponse.error;
      }

      syncDashboardStateFromData({
        coaches: coachesResponse.data || [],
        clients: clientsResponse.data || [],
      });

      return {
        access,
        coaches: coachesResponse.data || [],
        clients: clientsResponse.data || [],
        clientPackages: packagesResponse.data || [],
        orders,
        sessions: sessionsResponse.data || [],
        payments: paymentsResponse.data || [],
        orderItems: orderItemsResponse.data || [],
        commissions: commissionsResponse.data || [],
        bookingRequests: bookingRequestsResponse.data || [],
        operatingCostEntries: dashboardState.lastData?.operatingCostEntries || [],
        operatingCostSummary: dashboardState.lastData?.operatingCostSummary || null,
        currentMonthStart,
      };
    }

    if (DASHBOARD_PAGE_KEY === "settings") {
      const notificationsResponse = await supabase
        .from("notifications")
        .select("id, category, title, body, action_url, is_read, created_at")
        .order("created_at", { ascending: false })
        .limit(40);

      if (notificationsResponse.error) {
        throw notificationsResponse.error;
      }

      syncDashboardStateFromData({
        notifications: notificationsResponse.data || [],
      });

      return {
        access,
        notifications: notificationsResponse.data || [],
        currentMonthStart,
      };
    }

    const [
      coachesResponse,
      coachProfilesResponse,
      clientsResponse,
      clientProfilesResponse,
      assignmentsResponse,
      packagesResponse,
      rewardsResponse,
      leadsResponse,
      leadActivitiesResponse,
      ordersResponse,
      sessionsResponse,
      commissionsResponse,
      bookingRequestsResponse,
      notificationsResponse,
    ] = await Promise.all([
      supabase.from("profiles").select("id, display_name, status").eq("role", "coach").order("created_at", { ascending: true }),
      supabase
        .from("coach_profiles")
        .select(
          "id, commission_tier, commission_rate, position_code, commission_cap, commission_bonus_notes, hours_minimum, hours_target, review_due_at, last_reviewed_at, promotion_ready, kpi_summary, notes, google_calendar_email, calendar_sync_enabled"
        )
        .order("created_at", { ascending: true }),
      supabase.from("profiles").select("id, display_name, status").eq("role", "client").order("created_at", { ascending: true }),
      supabase.from("client_profiles").select("id, preferred_name, xp_points, gym_coins, primary_goal"),
      supabase
        .from("coach_client_assignments")
        .select("id, coach_id, client_id, status, assigned_at, ended_at")
        .order("assigned_at", { ascending: false }),
      supabase
        .from("client_packages")
        .select("id, client_id, package_name, sessions_purchased, sessions_remaining, status, order_id, created_at, activated_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("points_ledger")
        .select("id, client_id, points_type, delta, reason, requested_by, approved_by, approval_status, created_at")
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("leads")
        .select("id, full_name, email, phone, source, status, next_follow_up_at, owner_id, notes, converted_client_id, created_at")
        .order("created_at", { ascending: false })
        .limit(120),
      supabase
        .from("lead_activities")
        .select("id, lead_id, actor_id, activity_type, notes, created_at")
        .order("created_at", { ascending: false })
        .limit(80),
      supabase
        .from("orders")
        .select(
          "id, client_id, order_type, total_amount_rm, tax_amount_rm, status, created_at, external_reference, invoice_number, invoice_storage_path, receipt_number, receipt_storage_path, refund_receipt_number, refund_receipt_storage_path"
        )
        .order("created_at", { ascending: false })
        .limit(120),
      supabase
        .from("sessions")
        .select("id, client_package_id, coach_id, status, scheduled_start, scheduled_end, session_value_rm, completed_at")
        .order("created_at", { ascending: false })
        .limit(400),
      supabase
        .from("commission_records")
        .select("id, coach_id, session_id, amount_rm, payout_month, payout_status, created_at")
        .order("created_at", { ascending: false })
        .limit(120),
      supabase
        .from("booking_requests")
        .select("id, client_id, client_package_id, status")
        .order("created_at", { ascending: false })
        .limit(120),
      supabase
        .from("notifications")
        .select("id, category, title, body, action_url, is_read, created_at")
        .order("created_at", { ascending: false })
        .limit(40),
    ]);

    const responses = [
      coachesResponse,
      coachProfilesResponse,
      clientsResponse,
      clientProfilesResponse,
      assignmentsResponse,
      packagesResponse,
      rewardsResponse,
      leadsResponse,
      leadActivitiesResponse,
      ordersResponse,
      sessionsResponse,
      commissionsResponse,
      bookingRequestsResponse,
      notificationsResponse,
    ];

    for (const response of responses) {
      if (response.error) {
        throw response.error;
      }
    }

    const orders = ordersResponse.data || [];
    const sessions = sessionsResponse.data || [];
    const orderIds = orders.map((order) => order.id);
    const actorIds = Array.from(
      new Set(
        (rewardsResponse.data || [])
          .flatMap((reward) => [reward.client_id, reward.requested_by])
          .concat((leadsResponse.data || []).flatMap((lead) => [lead.owner_id, lead.converted_client_id]))
          .concat((leadActivitiesResponse.data || []).flatMap((activity) => [activity.actor_id]))
          .concat(access.user.id)
          .filter(Boolean)
      )
    );

    const [paymentsResponse, orderItemsResponse, actorProfilesResponse] = await Promise.all([
      orderIds.length
        ? supabase.from("payments").select("order_id, status, fees_rm, payment_method").in("order_id", orderIds)
        : Promise.resolve({ data: [], error: null }),
      orderIds.length
        ? supabase
            .from("order_items")
            .select("order_id, package_id, package_code, name, quantity, total_amount_rm, metadata")
            .in("order_id", orderIds)
        : Promise.resolve({ data: [], error: null }),
      actorIds.length
        ? supabase.from("profiles").select("id, display_name, role").in("id", actorIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

    if (paymentsResponse.error) {
      throw paymentsResponse.error;
    }

    if (sessionsResponse.error) {
      throw sessionsResponse.error;
    }

    if (orderItemsResponse.error) {
      throw orderItemsResponse.error;
    }

    if (actorProfilesResponse.error) {
      throw actorProfilesResponse.error;
    }

    syncDashboardStateFromData({
      coaches: coachesResponse.data || [],
      clients: clientsResponse.data || [],
      assignments: assignmentsResponse.data || [],
      rewards: rewardsResponse.data || [],
      leads: leadsResponse.data || [],
      notifications: notificationsResponse.data || [],
    });

    return {
      access,
      coaches: coachesResponse.data || [],
      coachProfiles: coachProfilesResponse.data || [],
      clients: clientsResponse.data || [],
      clientProfiles: clientProfilesResponse.data || [],
      assignments: assignmentsResponse.data || [],
      clientPackages: packagesResponse.data || [],
      rewards: rewardsResponse.data || [],
      leads: leadsResponse.data || [],
      leadActivities: leadActivitiesResponse.data || [],
      notifications: notificationsResponse.data || [],
      operatingCostEntries: dashboardState.lastData?.operatingCostEntries || [],
      operatingCostSummary: dashboardState.lastData?.operatingCostSummary || null,
      orders,
      sessions,
      payments: paymentsResponse.data || [],
      orderItems: orderItemsResponse.data || [],
      commissions: commissionsResponse.data || [],
      bookingRequests: bookingRequestsResponse.data || [],
      actorProfiles: actorProfilesResponse.data || [],
      currentMonthStart,
    };
  }

  async function fetchDashboardData(options = {}) {
    try {
      return await fetchDashboardDataFromServer(options);
    } catch (error) {
      console.warn("[LEGACY] Falling back to direct admin dashboard queries.", error);
      return fetchDashboardDataDirect();
    }
  }

  function applyDeferredDashboardPatch(patch, userId) {
    if (!patch || typeof patch !== "object") {
      return;
    }

    const nextData = mergeDashboardData(
      {
        ...patch,
        leadWorkspaceDetailsLoaded: true,
        financialWorkspaceDetailsLoaded: true,
      },
      dashboardState.lastData
    );

    dashboardState.lastData = nextData;
    writeDashboardCache(userId, nextData);
    renderDashboard(nextData);
  }

  async function hydrateDeferredDashboardSections(loadSequence, userId) {
    if (!shouldDeferSecondaryPayload() || dashboardState.deferredHydrationInFlight) {
      return;
    }

    dashboardState.deferredHydrationInFlight = true;
    const payload = await fetchDashboardData({ variant: "secondary" }).catch((error) => {
      console.warn("[LEGACY] Admin deferred dashboard hydration failed.", error);
      return null;
    });
    dashboardState.deferredHydrationInFlight = false;

    if (!payload || dashboardState.loadSequence !== loadSequence) {
      return;
    }

    applyDeferredDashboardPatch(payload, userId);
  }

  function buildMaps(data) {
    const coachProfileById = new Map((data.coachProfiles || []).map((item) => [item.id, item]));
    const clientProfileById = new Map((data.clientProfiles || []).map((item) => [item.id, item]));
    const profileById = new Map((data.actorProfiles || []).map((item) => [item.id, item]));
    const clientById = new Map((data.clients || []).map((item) => [item.id, item]));
    const coachById = new Map((data.coaches || []).map((item) => [item.id, item]));
    const activeAssignmentByClientId = new Map();

    (data.assignments || [])
      .filter((assignment) => assignment.status === "active")
      .forEach((assignment) => {
        if (!activeAssignmentByClientId.has(assignment.client_id)) {
          activeAssignmentByClientId.set(assignment.client_id, assignment);
        }
      });

    const packagesByClientId = new Map();
    (data.clientPackages || []).forEach((item) => {
      const ownerIds = [item.client_id].filter(Boolean);
      ownerIds.forEach((ownerId) => {
        if (!packagesByClientId.has(ownerId)) {
          packagesByClientId.set(ownerId, []);
        }
        packagesByClientId.get(ownerId).push(item);
      });
    });
    const rewardsByClientId = groupBy(data.rewards || [], (item) => item.client_id);
    const paymentByOrderId = new Map((data.payments || []).map((item) => [item.order_id, item]));
    const orderItemsByOrderId = groupBy(data.orderItems || [], (item) => item.order_id);
    const clientPackageByOrderId = new Map((data.clientPackages || []).map((item) => [item.order_id, item]));
    const sessionsByPackageId = groupBy(
      (data.sessions || []).filter((item) => item.client_package_id),
      (item) => item.client_package_id
    );
    const pendingBookingRequestsByPackageId = groupBy(
      (data.bookingRequests || []).filter((item) => item.client_package_id && item.status === "pending"),
      (item) => item.client_package_id
    );
    const leadById = new Map((data.leads || []).map((item) => [item.id, item]));
    const plannerRewardByLedgerId = new Map();

    (data.plannerRewardEvents || []).forEach((item) => {
      if (item?.xp_ledger_entry_id) {
        plannerRewardByLedgerId.set(item.xp_ledger_entry_id, item);
      }
      if (item?.coin_ledger_entry_id) {
        plannerRewardByLedgerId.set(item.coin_ledger_entry_id, item);
      }
    });

    return {
      coachProfileById,
      clientById,
      clientProfileById,
      coachById,
      profileById,
      activeAssignmentByClientId,
      packagesByClientId,
      rewardsByClientId,
      paymentByOrderId,
      orderItemsByOrderId,
      clientPackageByOrderId,
      sessionsByPackageId,
      pendingBookingRequestsByPackageId,
      leadById,
      plannerRewardByLedgerId,
    };
  }

  function getPrimaryOrderItem(maps, orderId) {
    return (maps.orderItemsByOrderId.get(orderId) || [])[0] || null;
  }

  function getOrderCustomerLabel(order, data, maps) {
    const linkedClientName = maps.clientById.get(order.client_id)?.display_name;
    if (linkedClientName && linkedClientName !== "LEGACY System") {
      return linkedClientName;
    }

    const orderItem = getPrimaryOrderItem(maps, order.id);
    const guestName = String(orderItem?.metadata?.customerName || "").trim();
    const guestEmail = String(orderItem?.metadata?.customerEmail || "").trim();
    if (guestName) {
      return guestName;
    }
    if (guestEmail) {
      return guestEmail;
    }

    return linkedClientName || "Client";
  }

  function renderCompPlanReference() {
    const opsData = getCoachOpsData();

    if (positionSummaryGridNode) {
      positionSummaryGridNode.innerHTML = opsData.positions.length
        ? opsData.positions
            .map(
              (position) => `
                <article class="stat" data-crm-tone="${escapeHtml(position.id === "signature_full_time_basic" ? "success" : position.id === "partner_full_time" ? "warning" : "info")}">
                  <h3>${escapeHtml(position.shortLabel || position.label)}</h3>
                  <p>${escapeHtml(`${position.monthlyHoursTarget || 0} hrs target | ${position.baseCommissionLabel || formatPercent((position.baseCommissionRate || 0) * 100)}`)}</p>
                  <p>${escapeHtml(position.promotionGate || "")}</p>
                </article>
              `
            )
            .join("")
        : `
          <article class="dashboard-note" data-crm-tone="warning">
            <p>Coach position presets are not available yet.</p>
          </article>
        `;
    }

    if (tierPresetRowsNode) {
      tierPresetRowsNode.innerHTML = opsData.tiers.length
        ? opsData.tiers
            .slice()
            .sort((left, right) => tierSortValue(left.id) - tierSortValue(right.id))
            .map(
              (tier) => `
                <tr>
                  <td>${escapeHtml(`${tier.id} | ${tier.title}`)}</td>
                  <td>${escapeHtml(tier.baseCommissionLabel || formatPercent((tier.defaultCommissionRate || 0) * 100))}</td>
                  <td>${escapeHtml(formatPercent((tier.cap || 0) * 100))}</td>
                  <td>${escapeHtml(`${tier.hoursMinimum || 0} -> ${tier.hoursTarget || 0}`)}</td>
                  <td>${escapeHtml(tier.promotionCriteria || "")}</td>
                </tr>
              `
            )
            .join("")
        : `
          <tr>
            <td colspan="5">Coach tier presets are not available yet.</td>
          </tr>
        `;
    }

    if (coachPositionSelect) {
      coachPositionSelect.innerHTML = [
        '<option value="">Select position</option>',
        ...opsData.positions.map(
          (position) => `<option value="${escapeHtml(position.id)}">${escapeHtml(position.label)}</option>`
        ),
      ].join("");
    }

    if (coachTierSelect) {
      coachTierSelect.innerHTML = [
        '<option value="">Select tier</option>',
        ...opsData.tiers
          .slice()
          .sort((left, right) => tierSortValue(left.id) - tierSortValue(right.id))
          .map((tier) => `<option value="${escapeHtml(tier.id)}">${escapeHtml(`${tier.id} | ${tier.title}`)}</option>`),
      ].join("");
    }
  }

  function buildKpiChecklistMarkup(summary) {
    const items = Array.isArray(summary?.items) ? summary.items : [];
    if (!items.length) {
      return "<p>No KPI checklist is assigned to this coach yet.</p>";
    }

    return items
      .map(
        (item, index) => `
          <label class="crm-checkbox">
            <input type="checkbox" data-coach-kpi-index="${index}" ${item.checked ? "checked" : ""} />
            <span>${escapeHtml(item.label)}</span>
          </label>
        `
      )
      .join("");
  }

  function getSelectedCoachProfile(data) {
    const maps = buildMaps(data);
    const selectedCoachId =
      dashboardState.selectedCoachId
      || coachSelectNode?.value
      || data.coaches[0]?.id
      || "";

    return {
      coach: data.coaches.find((item) => item.id === selectedCoachId) || null,
      profile: maps.coachProfileById.get(selectedCoachId) || null,
    };
  }

  function populateCoachSelect(data) {
    if (!coachSelectNode) {
      return;
    }

    const options = data.coaches
      .slice()
      .sort((left, right) => (left.display_name || "").localeCompare(right.display_name || ""))
      .map((coach) => ({
        value: coach.id,
        label: coach.display_name || "Coach",
      }));

    populateSelect(coachSelectNode, options, "Select coach", !options.length);
    if (!dashboardState.selectedCoachId && options[0]?.value) {
      dashboardState.selectedCoachId = options[0].value;
    }
    coachSelectNode.value = dashboardState.selectedCoachId || "";
  }

  function renderCoachManagement(data) {
    if (!coachManagementForm || !coachSelectNode) {
      return;
    }

    populateCoachSelect(data);
    const { coach, profile } = getSelectedCoachProfile(data);
    if (!coach) {
      setCoachManagementFeedback("No coach accounts are available yet.", true);
      return;
    }

    const tierPreset = findTierPreset(profile?.commission_tier);
    const positionPreset = findPositionPreset(profile?.position_code);
    const kpiSummary = hydrateKpiSummary(profile?.commission_tier, profile?.kpi_summary);

    coachPositionSelect.value = profile?.position_code || "";
    coachTierSelect.value = profile?.commission_tier || "";
    coachRateInput.value = Number(profile?.commission_rate || tierPreset?.defaultCommissionRate || 0) * 100;
    coachCapInput.value = Number(profile?.commission_cap || tierPreset?.cap || positionPreset?.cap || 0) * 100;
    coachHoursMinInput.value = Number(profile?.hours_minimum ?? positionPreset?.monthlyHoursMinimum ?? tierPreset?.hoursMinimum ?? 0);
    coachHoursTargetInput.value = Number(profile?.hours_target ?? positionPreset?.monthlyHoursTarget ?? tierPreset?.hoursTarget ?? 0);
    coachHoursCompletedInput.value = Number(kpiSummary.hoursCompleted || 0);
    coachReviewDueInput.value = toInputDate(profile?.review_due_at);
    coachBonusNotesInput.value = profile?.commission_bonus_notes || tierPreset?.upliftLabel || positionPreset?.upliftLabel || "";
    coachAssessmentCompleteInput.checked = Boolean(kpiSummary.assessmentComplete);
    coachPromotionReadyInput.checked = Boolean(profile?.promotion_ready);
    coachNotesInput.value = profile?.notes || "";

    if (coachKpiListNode) {
      coachKpiListNode.innerHTML = buildKpiChecklistMarkup(kpiSummary);
    }

    if (coachSelectionSummaryNode) {
      const checkedCount = (kpiSummary.items || []).filter((item) => item.checked).length;
      coachSelectionSummaryNode.innerHTML = `
        <div class="crm-selector-summary__head">
          <div>
            <span class="kicker kicker--accent">${escapeHtml(coach.display_name || "Coach")}</span>
            <h3>${escapeHtml(positionPreset?.label || "Position not assigned")}</h3>
          </div>
          <strong>${escapeHtml(profile?.commission_tier || "No tier")}</strong>
        </div>
        <div class="chips">
          <span class="chip">${escapeHtml(normalizeStatusLabel(coach.status || "pending"))}</span>
          <span class="chip chip--accent">${escapeHtml(formatPercent((profile?.commission_rate || tierPreset?.defaultCommissionRate || 0) * 100))}</span>
          <span class="chip">${escapeHtml(`Cap ${formatPercent((profile?.commission_cap || tierPreset?.cap || positionPreset?.cap || 0) * 100)}`)}</span>
          <span class="chip">${escapeHtml(`${checkedCount}/${(kpiSummary.items || []).length} KPIs checked`)}</span>
          <span class="chip">${escapeHtml(profile?.review_due_at ? `Review ${formatDate(profile.review_due_at)}` : "No review date")}</span>
        </div>
        <p>${escapeHtml(tierPreset?.promotionCriteria || positionPreset?.promotionGate || "Apply a preset to load the promotion pathway.")}</p>
      `;
    }

    setCoachManagementFeedback(
      `Editing ${coach.display_name || "coach"}: adjust presets, KPI checks, review timing, or manual commission fields here.`,
      false
    );
  }

  function collectCoachKpiSummary() {
    const items = Array.from(coachKpiListNode?.querySelectorAll("[data-coach-kpi-index]") || []).map((input) => ({
      id: input.getAttribute("data-coach-kpi-index") || "",
      label: input.parentElement?.querySelector("span")?.textContent || "",
      checked: Boolean(input.checked),
    }));

    return {
      hoursCompleted: Number(coachHoursCompletedInput?.value || 0),
      assessmentComplete: Boolean(coachAssessmentCompleteInput?.checked),
      items,
    };
  }

  function coachReviewSummary(data) {
    const today = new Date();
    const inTwoWeeks = new Date(today);
    inTwoWeeks.setDate(inTwoWeeks.getDate() + 14);

    if ((!data.coachProfiles || !data.coachProfiles.length) && Array.isArray(data.homeSummary?.reviewRows)) {
      return data.homeSummary.reviewRows.map((row) => {
        const tierPreset = findTierPreset(row?.tierCode);
        const positionPreset = findPositionPreset(row?.positionCode);
        const checkedCount = Math.max(0, Number(row?.checkedCount || 0));
        const totalCount = Math.max(0, Number(row?.totalCount || 0));
        const reviewDate = row?.reviewDueAt ? new Date(row.reviewDueAt) : null;
        const isOverdue = reviewDate && !Number.isNaN(reviewDate.getTime()) && reviewDate < today;
        const isDueSoon =
          reviewDate
          && !Number.isNaN(reviewDate.getTime())
          && reviewDate >= today
          && reviewDate <= inTwoWeeks;
        return {
          coachId: row?.coachId || "",
          coachName: row?.coachName || "Coach",
          positionLabel: positionPreset?.shortLabel || positionPreset?.label || "Not assigned",
          tierLabel: row?.tierCode || "No tier",
          kpiLabel: `${checkedCount}/${totalCount || 0} checks`,
          reviewLabel: row?.reviewDueAt ? formatDate(row.reviewDueAt) : "Not scheduled",
          reviewKey: reviewDate?.getTime() || Number.MAX_SAFE_INTEGER,
          isOverdue,
          isDueSoon,
          promotionReady: Boolean(row?.promotionReady),
          allKpisChecked: totalCount > 0 && checkedCount === totalCount && Boolean(row?.assessmentComplete),
          tierPreset,
        };
      });
    }

    return (data.coachProfiles || []).map((profile) => {
      const coach = data.coaches.find((item) => item.id === profile.id) || null;
      const tierPreset = findTierPreset(profile.commission_tier);
      const positionPreset = findPositionPreset(profile.position_code);
      const kpiSummary = hydrateKpiSummary(profile.commission_tier, profile.kpi_summary);
      const checkedCount = (kpiSummary.items || []).filter((item) => item.checked).length;
      const totalCount = (kpiSummary.items || []).length;
      const reviewDate = profile.review_due_at ? new Date(profile.review_due_at) : null;
      const isOverdue = reviewDate && !Number.isNaN(reviewDate.getTime()) && reviewDate < today;
      const isDueSoon =
        reviewDate
        && !Number.isNaN(reviewDate.getTime())
        && reviewDate >= today
        && reviewDate <= inTwoWeeks;
      return {
        coachId: profile.id,
        coachName: coach?.display_name || "Coach",
        positionLabel: positionPreset?.shortLabel || positionPreset?.label || "Not assigned",
        tierLabel: profile.commission_tier || "No tier",
        kpiLabel: `${checkedCount}/${totalCount || 0} checks`,
        reviewLabel: profile.review_due_at ? formatDate(profile.review_due_at) : "Not scheduled",
        reviewKey: reviewDate?.getTime() || Number.MAX_SAFE_INTEGER,
        isOverdue,
        isDueSoon,
        promotionReady: Boolean(profile.promotion_ready),
        allKpisChecked: totalCount > 0 && checkedCount === totalCount && Boolean(kpiSummary.assessmentComplete),
        tierPreset,
      };
    });
  }

  function renderCoachReviewQueue(data) {
    if (!coachReviewRowsNode) {
      return;
    }

    const rows = coachReviewSummary(data).sort((left, right) => left.reviewKey - right.reviewKey);
    const overdueCount = rows.filter((row) => row.isOverdue).length;
    const dueSoonCount = rows.filter((row) => row.isDueSoon).length;
    const promotionReadyCount = rows.filter((row) => row.promotionReady).length;
    const greenCount = rows.filter((row) => row.allKpisChecked).length;

    const overdueNode = document.getElementById("admin-review-overdue");
    const dueSoonNode = document.getElementById("admin-review-due-soon");
    const promotionReadyNode = document.getElementById("admin-review-promotion-ready");
    const greenNode = document.getElementById("admin-review-green");

    if (overdueNode) overdueNode.textContent = String(overdueCount);
    if (dueSoonNode) dueSoonNode.textContent = String(dueSoonCount);
    if (promotionReadyNode) promotionReadyNode.textContent = String(promotionReadyCount);
    if (greenNode) greenNode.textContent = String(greenCount);

    setTone(overdueNode, overdueCount ? "alert" : "success");
    setTone(dueSoonNode, dueSoonCount ? "warning" : "success");
    setTone(promotionReadyNode, promotionReadyCount ? "info" : "success");
    setTone(greenNode, greenCount ? "success" : "info");

    coachReviewRowsNode.innerHTML = rows.length
      ? rows
          .map((row) => `
            <tr>
              <td>${escapeHtml(row.coachName)}</td>
              <td>${escapeHtml(row.positionLabel)}</td>
              <td>${escapeHtml(row.tierLabel)}</td>
              <td>${escapeHtml(row.kpiLabel)}</td>
              <td>${escapeHtml(row.reviewLabel)}</td>
              <td>${escapeHtml(row.isOverdue ? "Overdue" : row.isDueSoon ? "Due Soon" : row.promotionReady ? "Promotion Ready" : "On Track")}</td>
            </tr>
          `)
          .join("")
      : buildEmptyTableRow(
          6,
          "No coach review data configured yet.",
          "Quarterly review timing, KPI coverage, and promotion-ready status will appear here once coach review settings are assigned."
        );
  }

  async function ensureQuarterlyReviewNotifications(data) {
    if (!dashboardState.supabase || !dashboardState.access?.user?.id) {
      return;
    }

    const existingTitles = new Set((data.notifications || []).map((item) => item.title));
    const reminders = coachReviewSummary(data)
      .filter((row) => row.isOverdue || row.isDueSoon)
      .filter((row) => {
        const reviewLabel = row.reviewLabel || "Not scheduled";
        return !existingTitles.has(`Quarterly review due: ${row.coachName} (${reviewLabel})`);
      })
      .map((row) => ({
        recipient_id: dashboardState.access.user.id,
        category: "coach_review",
        title: `Quarterly review due: ${row.coachName} (${row.reviewLabel || "Not scheduled"})`,
        body: `${row.coachName} is ${row.isOverdue ? "overdue" : "coming due"} for review on ${row.reviewLabel || "an unscheduled date"}. Position: ${row.positionLabel}. Tier: ${row.tierLabel}.`,
        action_url: "./admin-clients.html",
      }));

    if (!reminders.length) {
      return;
    }

    await dashboardState.supabase.from("notifications").insert(reminders);
  }

  function buildCsvLine(values) {
    return values
      .map((value) => `"${String(value ?? "").replace(/"/gu, '""')}"`)
      .join(",");
  }

  function downloadCsv(filename, headers, rows) {
    const csv = [buildCsvLine(headers), ...rows.map((row) => buildCsvLine(row))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(blobUrl);
  }

  function buildFinancialAnalytics(data) {
    const maps = buildMaps(data);
    const orders = data.orders || [];
    const payments = data.payments || [];
    const commissions = data.commissions || [];
    const sessions = data.sessions || [];
    const importedOpex = getImportedOpexBudget();
    const homeSummary = data.homeSummary && typeof data.homeSummary === "object" ? data.homeSummary : null;
    const canUseHomeSummary = Boolean(homeSummary) && (
      (
        isHomeWorkspacePage()
        && !orders.length
        && !payments.length
        && !commissions.length
        && !sessions.length
        && !(data.leads || []).length
        && !(data.clientPackages || []).length
        && !(data.coachProfiles || []).length
      )
      || isFinancialWorkspacePage()
    );

    if (canUseHomeSummary) {
      const opexMonthLabels = importedOpex.monthLabels || [];
      const opexCategories = (importedOpex.categories || [])
        .map((category) => {
          const monthlyValues = Array.isArray(category.months) ? category.months.map((value) => Number(value || 0)) : [];
          return {
            label: category.name || "Expense",
            value: monthlyValues.reduce((total, value) => total + value, 0),
            monthlyValues,
          };
        })
        .filter((category) => category.value > 0);
      const opexByMonth = opexMonthLabels.map((label, index) => ({
        label,
        value: opexCategories.reduce((total, category) => total + Number(category.monthlyValues[index] || 0), 0),
      }));
      const computedAnnualOpexBudget = opexByMonth.reduce((total, month) => total + Number(month.value || 0), 0);
      const averageMonthlyOpexBudget = opexByMonth.length ? computedAnnualOpexBudget / opexByMonth.length : 0;
      const peakOpexMonth = opexByMonth.reduce(
        (best, month) => (Number(month.value || 0) > Number(best.value || 0) ? month : best),
        { label: "Month 1", value: 0 }
      );
      const leanestOpexMonth = opexByMonth.reduce(
        (best, month) => (Number(month.value || 0) < Number(best.value || 0) ? month : best),
        opexByMonth[0] || { label: "Month 1", value: 0 }
      );
      const topOpexCategories = opexCategories.slice().sort((left, right) => right.value - left.value);
      const largestOpexCategory = topOpexCategories[0] || null;
      const currentMonthContribution =
        Number(homeSummary.currentMonthNetRevenue || 0)
        - Number(homeSummary.currentMonthGatewayFees || 0)
        - Number(homeSummary.currentMonthCommissionExpense || 0);
      const currentMonthOperatingEstimate = currentMonthContribution - averageMonthlyOpexBudget;
      const opexCoveragePct = averageMonthlyOpexBudget ? (currentMonthContribution / averageMonthlyOpexBudget) * 100 : 0;
      const opexVariance = computedAnnualOpexBudget - Number(importedOpex.declaredAnnualTotal || 0);
      const actualOperatingSummary = data.operatingCostSummary || {
        entryCount: 0,
        currentMonthTotal: 0,
        ytdTotal: 0,
        groupTotals: [],
        monthlyTotals: [],
        lastUpdatedAt: null,
      };
      const actualCurrentMonthCost = Number(actualOperatingSummary.currentMonthTotal || 0);
      const actualCurrentMonthResult = currentMonthContribution - actualCurrentMonthCost;
      const actualBudgetVariance = actualCurrentMonthCost - averageMonthlyOpexBudget;
      const importedOpexSummary = {
        sourceFile: importedOpex.sourceFile || "",
        annualBudget: computedAnnualOpexBudget,
        monthlyAverage: averageMonthlyOpexBudget,
        declaredAnnualTotal: Number(importedOpex.declaredAnnualTotal || 0),
        variance: opexVariance,
        notes: importedOpex.notes || [],
        categories: topOpexCategories,
        monthlyPlan: opexByMonth,
        currentMonthContribution,
        currentMonthOperatingEstimate,
        currentMonthRevenue: Number(homeSummary.currentMonthNetRevenue || 0),
        currentMonthGatewayFees: Number(homeSummary.currentMonthGatewayFees || 0),
        currentMonthCommissionExpense: Number(homeSummary.currentMonthCommissionExpense || 0),
        coveragePct: opexCoveragePct,
        peakMonth: peakOpexMonth,
        leanestMonth: leanestOpexMonth,
        largestCategory: largestOpexCategory,
      };

      const alerts = [];
      if (averageMonthlyOpexBudget > 0) {
        if (currentMonthOperatingEstimate < 0) {
          alerts.push({
            tone: "alert",
            title: "OPEX coverage gap",
            value: formatCurrency(Math.abs(currentMonthOperatingEstimate)),
            body: `Current-month contribution is covering ${formatPercent(opexCoveragePct, 0)} of the imported monthly OPEX budget.`,
          });
        } else {
          alerts.push({
            tone: "good",
            title: "OPEX coverage",
            value: formatPercent(opexCoveragePct, 0),
            body: `Current-month contribution is ahead of the imported monthly OPEX budget by ${formatCurrency(currentMonthOperatingEstimate)}.`,
          });
        }
      }
      if (Number(homeSummary.coachPayoutsPayable || 0) > 0) {
        alerts.push({
          tone: "alert",
          title: "Coach payout liability",
          value: formatCurrency(homeSummary.coachPayoutsPayable),
          body: "Pending and approved commissions are still outstanding.",
        });
      }
      if (Number(homeSummary.overdueFollowUps || 0) > 0) {
        alerts.push({
          tone: "warning",
          title: "Overdue follow-ups",
          value: `${homeSummary.overdueFollowUps} leads`,
          body: "Leads are waiting past their scheduled follow-up date.",
        });
      }
      if (Number(homeSummary.pendingApprovals || 0) > 0) {
        alerts.push({
          tone: "warning",
          title: "Pending approvals",
          value: `${homeSummary.pendingApprovals} requests`,
          body: "Coach-issued rewards are waiting for super admin review.",
        });
      }
      if (Number(homeSummary.refundedRevenue || 0) > 0) {
        alerts.push({
          tone: "alert",
          title: "Refund exposure",
          value: formatCurrency(homeSummary.refundedRevenue),
          body: "Refunded order value is reducing realized revenue.",
        });
      }
      if (Number(homeSummary.unattributedRevenue || 0) > 0) {
        alerts.push({
          tone: "warning",
          title: "Revenue source gap",
          value: formatCurrency(homeSummary.unattributedRevenue),
          body: "Some paid revenue cannot yet be tied back to a lead source.",
        });
      }
      if (Number(homeSummary.unreadNotifications || 0) > 0) {
        alerts.push({
          tone: "info",
          title: "Unread admin alerts",
          value: `${homeSummary.unreadNotifications}`,
          body: "Notifications still need to be cleared from the workspace.",
        });
      }
      if (!alerts.length) {
        alerts.push({
          tone: "good",
          title: "No urgent finance flags",
          value: "Stable",
          body: "There are no immediate payout, refund, or follow-up risks in the current data.",
        });
      }

      return {
        maps,
        paidRevenue: Number(homeSummary.paidRevenue || 0),
        grossSales: Number(homeSummary.grossSales || 0),
        currentMonthGrossSales: Number(homeSummary.currentMonthGrossSales || 0),
        currentMonthNetRevenue: Number(homeSummary.currentMonthNetRevenue || 0),
        refundedRevenue: Number(homeSummary.refundedRevenue || 0),
        trackedTaxes: Number(homeSummary.trackedTaxes || 0),
        netRevenue: Number(homeSummary.netRevenue || 0),
        pendingRevenue: Number(homeSummary.pendingRevenue || 0),
        averagePaidOrder: Number(homeSummary.averagePaidOrder || 0),
        gatewayFees: Number(homeSummary.gatewayFees || 0),
        coachPayoutsPayable: Number(homeSummary.coachPayoutsPayable || 0),
        coachPayoutsPaid: Number(homeSummary.coachPayoutsPaid || 0),
        companyCommissionCaptured: Number(homeSummary.companyCommissionCaptured || 0),
        averageCompanyTakePct: Number(homeSummary.averageCompanyTakePct || 0),
        unusedLiability: Number(homeSummary.unusedLiability || 0),
        liabilityAging: homeSummary.liabilityAging || {},
        revenueByType: [],
        revenueBySource: [],
        paymentStatusMix: [],
        paymentMethodRevenue: [],
        salesTimeline: [],
        coachDeliveredRevenue: [],
        commissionPipeline: [],
        activeClientCount: Number(homeSummary.activeClientCount || 0),
        coachCount: Number(homeSummary.coachCount || 0),
        convertedLeadCount: Number(homeSummary.convertedLeadCount || 0),
        totalLeadCount: Number(homeSummary.totalLeadCount || 0),
        leadConversionRate: Number(homeSummary.leadConversionRate || 0),
        overdueFollowUps: Number(homeSummary.overdueFollowUps || 0),
        pendingApprovals: Number(homeSummary.pendingApprovals || 0),
        unreadNotifications: Number(homeSummary.unreadNotifications || 0),
        alerts,
        coverage: {
          ready: [
            "Gross sales and paid revenue",
            "Refund totals",
            "Average order value",
            "Gateway fee spend",
            "Coach payouts payable",
            "Commission payout pipeline",
            "Deferred client session liability",
            "Revenue by product type",
            importedOpexSummary.annualBudget > 0 ? "Imported fixed OPEX budget and monthly run-rate" : null,
            "Editable operating cost ledger",
          ].filter(Boolean),
          partial: [
            "Net revenue ex-tax estimation",
            "Revenue by lead source",
            "Delivered value by coach",
            "Deferred revenue aging",
            "Company take percentage",
            importedOpexSummary.annualBudget > 0 ? "Operating result estimate versus imported OPEX budget" : null,
            actualCurrentMonthCost > 0 ? "Current-month operating result against entered costs" : null,
          ].filter(Boolean),
          missing: [
            "Subscriptions / MRR / ARR",
            "Chargebacks and dunning recovery",
            "CAC, payback, and marketing spend",
            "Consult show / close funnel",
            "CSAT, NPS, adherence, audit, safety, education credits",
            "Coach levels and level-based KPI targets",
            "E-invoice acceptance and rejection health",
          ],
        },
        unattributedRevenue: Number(homeSummary.unattributedRevenue || 0),
        importedOpex: importedOpexSummary,
        actualOperatingCosts: {
          ...actualOperatingSummary,
          currentMonthResult: actualCurrentMonthResult,
          currentMonthBudgetVariance: actualBudgetVariance,
        },
      };
    }

    const paidOrders = orders.filter((order) => order.status === "paid");
    const refundedOrders = orders.filter((order) => order.status === "refunded");
    const capturedOrders = orders.filter((order) => ["paid", "refunded"].includes(order.status));
    const pendingOrders = orders.filter((order) => order.status === "pending_payment");
    const paidRevenue = paidOrders.reduce((total, order) => total + Number(order.total_amount_rm || 0), 0);
    const grossSales = capturedOrders.reduce((total, order) => total + Number(order.total_amount_rm || 0), 0);
    const refundedRevenue = refundedOrders.reduce((total, order) => total + Number(order.total_amount_rm || 0), 0);
    const trackedTaxes = capturedOrders.reduce((total, order) => total + Number(order.tax_amount_rm || 0), 0);
    const netRevenue = Math.max(grossSales - refundedRevenue - trackedTaxes, 0);
    const pendingRevenue = pendingOrders.reduce((total, order) => total + Number(order.total_amount_rm || 0), 0);
    const averagePaidOrder = paidOrders.length ? paidRevenue / paidOrders.length : 0;
    const gatewayFees = payments.reduce((total, payment) => total + Number(payment.fees_rm || 0), 0);

    const currentMonthStart = new Date(data.currentMonthStart || Date.now());
    const nextMonthStart = new Date(currentMonthStart);
    nextMonthStart.setMonth(nextMonthStart.getMonth() + 1);
    const currentMonthStartMs = currentMonthStart.getTime();
    const nextMonthStartMs = nextMonthStart.getTime();

    const currentMonthOrders = orders.filter((order) => {
      const createdAt = new Date(order.created_at || 0).getTime();
      return createdAt >= currentMonthStartMs && createdAt < nextMonthStartMs;
    });
    const currentMonthCapturedOrders = currentMonthOrders.filter((order) => ["paid", "refunded"].includes(order.status));
    const currentMonthRefundedOrders = currentMonthOrders.filter((order) => order.status === "refunded");
    const currentMonthGrossSales = currentMonthCapturedOrders.reduce(
      (total, order) => total + Number(order.total_amount_rm || 0),
      0
    );
    const currentMonthRefundedRevenue = currentMonthRefundedOrders.reduce(
      (total, order) => total + Number(order.total_amount_rm || 0),
      0
    );
    const currentMonthTrackedTaxes = currentMonthCapturedOrders.reduce(
      (total, order) => total + Number(order.tax_amount_rm || 0),
      0
    );
    const currentMonthNetRevenue = Math.max(
      currentMonthGrossSales - currentMonthRefundedRevenue - currentMonthTrackedTaxes,
      0
    );
    const currentMonthOrderIds = new Set(currentMonthOrders.map((order) => order.id));
    const currentMonthGatewayFees = payments.reduce((total, payment) => {
      return total + (currentMonthOrderIds.has(payment.order_id) ? Number(payment.fees_rm || 0) : 0);
    }, 0);
    const currentMonthCommissionExpense = commissions.reduce((total, record) => {
      const payoutMonth = new Date(record.payout_month || 0).getTime();
      return total + (payoutMonth >= currentMonthStartMs && payoutMonth < nextMonthStartMs ? Number(record.amount_rm || 0) : 0);
    }, 0);
    const currentMonthContribution = currentMonthNetRevenue - currentMonthGatewayFees - currentMonthCommissionExpense;

    const completedSessions = sessions.filter((session) => session.status === "completed");
    const coachRevenueMap = new Map();
    completedSessions.forEach((session) => {
      if (!session.coach_id) {
        return;
      }
      coachRevenueMap.set(
        session.coach_id,
        Number(coachRevenueMap.get(session.coach_id) || 0) + Number(session.session_value_rm || 0)
      );
    });

    const commissionByStatus = commissions.reduce(
      (summary, record) => {
        const status = record.payout_status || "pending";
        summary[status] = Number(summary[status] || 0) + Number(record.amount_rm || 0);
        return summary;
      },
      { pending: 0, approved: 0, paid: 0 }
    );

    const coachPayoutsPayable = Number(commissionByStatus.pending || 0) + Number(commissionByStatus.approved || 0);
    const coachPayoutsPaid = Number(commissionByStatus.paid || 0);

    const sessionById = new Map((sessions || []).map((session) => [session.id, session]));
    const commissionableRevenue = commissions.reduce((total, record) => {
      const session = sessionById.get(record.session_id);
      return total + Number(session?.session_value_rm || 0);
    }, 0);
    const companyCommissionCaptured = commissions.reduce((total, record) => {
      const session = sessionById.get(record.session_id);
      return total + Math.max(Number(session?.session_value_rm || 0) - Number(record.amount_rm || 0), 0);
    }, 0);
    const averageCompanyTakePct = commissionableRevenue
      ? (companyCommissionCaptured / commissionableRevenue) * 100
      : 0;

    const orderById = new Map(orders.map((order) => [order.id, order]));
    const now = Date.now();
    const liabilityAging = {
      "0-30d": 0,
      "31-60d": 0,
      "61-90d": 0,
      "90d+": 0,
    };

    const unusedLiability = (data.clientPackages || []).reduce((total, clientPackage) => {
      if (!["active", "completed"].includes(clientPackage.status)) {
        return total;
      }
      const order = orderById.get(clientPackage.order_id);
      if (!order || order.status !== "paid") {
        return total;
      }

      const sessionsPurchased = Number(clientPackage.sessions_purchased || 0);
      const sessionsRemaining = Number(clientPackage.sessions_remaining || 0);
      const perSessionValue = sessionsPurchased > 0 ? Number(order.total_amount_rm || 0) / sessionsPurchased : 0;
      const liability = perSessionValue * sessionsRemaining;

      const anchorDate = new Date(
        clientPackage.activated_at || clientPackage.created_at || order.created_at || Date.now()
      );
      const ageDays = Number.isNaN(anchorDate.getTime())
        ? 0
        : Math.max(0, Math.floor((now - anchorDate.getTime()) / 86400000));
      if (ageDays <= 30) {
        liabilityAging["0-30d"] += liability;
      } else if (ageDays <= 60) {
        liabilityAging["31-60d"] += liability;
      } else if (ageDays <= 90) {
        liabilityAging["61-90d"] += liability;
      } else {
        liabilityAging["90d+"] += liability;
      }

      return total + liability;
    }, 0);

    const revenueByTypeMap = new Map();
    paidOrders.forEach((order) => {
      const key = normalizeStatusLabel(order.order_type || "other");
      revenueByTypeMap.set(key, Number(revenueByTypeMap.get(key) || 0) + Number(order.total_amount_rm || 0));
    });

    const leadByClientId = new Map();
    (data.leads || []).forEach((lead) => {
      if (lead.converted_client_id && !leadByClientId.has(lead.converted_client_id)) {
        leadByClientId.set(lead.converted_client_id, lead);
      }
    });

    const revenueBySourceMap = new Map();
    paidOrders.forEach((order) => {
      const source = leadByClientId.get(order.client_id)?.source || "Unattributed";
      revenueBySourceMap.set(source, Number(revenueBySourceMap.get(source) || 0) + Number(order.total_amount_rm || 0));
    });
    const unattributedRevenue = Number(revenueBySourceMap.get("Unattributed") || 0);

    const paymentStatusMap = new Map();
    orders.forEach((order) => {
      const status = normalizeStatusLabel(maps.paymentByOrderId.get(order.id)?.status || order.status || "unknown");
      paymentStatusMap.set(status, Number(paymentStatusMap.get(status) || 0) + 1);
    });

    const paymentMethodRevenueMap = new Map();
    paidOrders.forEach((order) => {
      const paymentMethod = maps.paymentByOrderId.get(order.id)?.payment_method || "unknown";
      const label = normalizeStatusLabel(paymentMethod.replace(/_/gu, " "));
      paymentMethodRevenueMap.set(label, Number(paymentMethodRevenueMap.get(label) || 0) + Number(order.total_amount_rm || 0));
    });

    const salesTimelineMap = new Map();
    paidOrders.forEach((order) => {
      const createdAt = new Date(order.created_at || 0);
      if (Number.isNaN(createdAt.getTime())) {
        return;
      }
      const key = createdAt.toISOString().slice(0, 10);
      salesTimelineMap.set(key, Number(salesTimelineMap.get(key) || 0) + Number(order.total_amount_rm || 0));
    });
    const salesTimeline = Array.from(salesTimelineMap, ([label, value]) => ({
      label: formatDate(label),
      value,
      sortKey: label,
    }))
      .sort((left, right) => String(left.sortKey).localeCompare(String(right.sortKey)))
      .slice(-8)
      .map(({ label, value }) => ({ label, value }));

    const activeClientCount = Array.from(maps.activeAssignmentByClientId.keys()).length;
    const convertedLeadCount = (data.leads || []).filter((lead) => lead.converted_client_id).length;
    const leadConversionRate = data.leads.length ? (convertedLeadCount / data.leads.length) * 100 : 0;
    const pendingApprovals = (data.rewards || []).filter((reward) => reward.approval_status === "pending").length;
    const overdueFollowUps = (data.leads || []).filter((lead) => {
      if (!lead.next_follow_up_at || lead.status === "converted" || lead.status === "lost") {
        return false;
      }
      return new Date(lead.next_follow_up_at).getTime() < now;
    }).length;
    const unreadNotifications = (data.notifications || []).filter((item) => !item.is_read).length;

    const opexMonthLabels = importedOpex.monthLabels || [];
    const opexCategories = (importedOpex.categories || [])
      .map((category) => {
        const monthlyValues = Array.isArray(category.months) ? category.months.map((value) => Number(value || 0)) : [];
        return {
          label: category.name || "Expense",
          value: monthlyValues.reduce((total, value) => total + value, 0),
          monthlyValues,
        };
      })
      .filter((category) => category.value > 0);
    const opexByMonth = opexMonthLabels.map((label, index) => ({
      label,
      value: opexCategories.reduce((total, category) => total + Number(category.monthlyValues[index] || 0), 0),
    }));
    const computedAnnualOpexBudget = opexByMonth.reduce((total, month) => total + Number(month.value || 0), 0);
    const averageMonthlyOpexBudget = opexByMonth.length ? computedAnnualOpexBudget / opexByMonth.length : 0;
    const peakOpexMonth = opexByMonth.reduce(
      (best, month) => (Number(month.value || 0) > Number(best.value || 0) ? month : best),
      { label: "Month 1", value: 0 }
    );
    const leanestOpexMonth = opexByMonth.reduce(
      (best, month) => (Number(month.value || 0) < Number(best.value || 0) ? month : best),
      opexByMonth[0] || { label: "Month 1", value: 0 }
    );
    const topOpexCategories = opexCategories.slice().sort((left, right) => right.value - left.value);
    const largestOpexCategory = topOpexCategories[0] || null;
    const currentMonthOperatingEstimate = currentMonthContribution - averageMonthlyOpexBudget;
    const opexCoveragePct = averageMonthlyOpexBudget ? (currentMonthContribution / averageMonthlyOpexBudget) * 100 : 0;
    const opexVariance = computedAnnualOpexBudget - Number(importedOpex.declaredAnnualTotal || 0);
    const importedOpexSummary = {
      sourceFile: importedOpex.sourceFile || "",
      annualBudget: computedAnnualOpexBudget,
      monthlyAverage: averageMonthlyOpexBudget,
      declaredAnnualTotal: Number(importedOpex.declaredAnnualTotal || 0),
      variance: opexVariance,
      notes: importedOpex.notes || [],
      categories: topOpexCategories,
      monthlyPlan: opexByMonth,
      currentMonthContribution,
      currentMonthOperatingEstimate,
      currentMonthRevenue: currentMonthNetRevenue,
      currentMonthGatewayFees,
      currentMonthCommissionExpense,
      coveragePct: opexCoveragePct,
      peakMonth: peakOpexMonth,
      leanestMonth: leanestOpexMonth,
      largestCategory: largestOpexCategory,
    };
    const actualOperatingSummary = data.operatingCostSummary || {
      entryCount: 0,
      currentMonthTotal: 0,
      ytdTotal: 0,
      groupTotals: [],
      monthlyTotals: [],
      lastUpdatedAt: null,
    };
    const actualCurrentMonthCost = Number(actualOperatingSummary.currentMonthTotal || 0);
    const actualCurrentMonthResult = currentMonthContribution - actualCurrentMonthCost;
    const actualBudgetVariance = actualCurrentMonthCost - averageMonthlyOpexBudget;

    const alerts = [];
    if (actualCurrentMonthCost > 0) {
      if (actualCurrentMonthResult < 0) {
        alerts.push({
          tone: "alert",
          title: "Actual operating deficit",
          value: formatCurrency(Math.abs(actualCurrentMonthResult)),
          body: `Current-month contribution is behind the entered operating costs by ${formatCurrency(Math.abs(actualCurrentMonthResult))}.`,
        });
      } else {
        alerts.push({
          tone: "good",
          title: "Actual operating cover",
          value: formatCurrency(actualCurrentMonthResult),
          body: `Current-month contribution is currently ahead of the entered operating costs.`,
        });
      }
      if (averageMonthlyOpexBudget > 0 && actualBudgetVariance > 0) {
        alerts.push({
          tone: "warning",
          title: "Actual OPEX above budget",
          value: formatCurrency(actualBudgetVariance),
          body: "Entered current-month operating costs are above the imported average monthly OPEX budget.",
        });
      }
    } else if (importedOpexSummary.annualBudget > 0) {
      if (currentMonthOperatingEstimate < 0) {
        alerts.push({
          tone: "alert",
          title: "OPEX coverage gap",
          value: formatCurrency(Math.abs(currentMonthOperatingEstimate)),
          body: `Current-month contribution is covering ${formatPercent(opexCoveragePct, 0)} of the imported monthly OPEX budget.`,
        });
      } else {
        alerts.push({
          tone: "good",
          title: "OPEX coverage",
          value: formatPercent(opexCoveragePct, 0),
          body: `Current-month contribution is ahead of the imported monthly OPEX budget by ${formatCurrency(currentMonthOperatingEstimate)}.`,
        });
      }
    }
    if (coachPayoutsPayable > 0) {
      alerts.push({
        tone: "alert",
        title: "Coach payout liability",
        value: formatCurrency(coachPayoutsPayable),
        body: "Pending and approved commissions are still outstanding.",
      });
    }
    if (overdueFollowUps > 0) {
      alerts.push({
        tone: "warning",
        title: "Overdue follow-ups",
        value: `${overdueFollowUps} leads`,
        body: "Leads are waiting past their scheduled follow-up date.",
      });
    }
    if (pendingApprovals > 0) {
      alerts.push({
        tone: "warning",
        title: "Pending approvals",
        value: `${pendingApprovals} requests`,
        body: "Coach-issued rewards are waiting for super admin review.",
      });
    }
    if (refundedRevenue > 0) {
      alerts.push({
        tone: "alert",
        title: "Refund exposure",
        value: formatCurrency(refundedRevenue),
        body: "Refunded order value is reducing realized revenue.",
      });
    }
    if (unattributedRevenue > 0) {
      alerts.push({
        tone: "warning",
        title: "Revenue source gap",
        value: formatCurrency(unattributedRevenue),
        body: "Some paid revenue cannot yet be tied back to a lead source.",
      });
    }
    if (unreadNotifications > 0) {
      alerts.push({
        tone: "info",
        title: "Unread admin alerts",
        value: `${unreadNotifications}`,
        body: "Notifications still need to be cleared from the workspace.",
      });
    }
    if (!alerts.length) {
      alerts.push({
        tone: "good",
        title: "No urgent finance flags",
        value: "Stable",
        body: "There are no immediate payout, refund, or follow-up risks in the current data.",
      });
    }

    const coverage = {
      ready: [
        "Gross sales and paid revenue",
        "Refund totals",
        "Average order value",
        "Gateway fee spend",
        "Coach payouts payable",
        "Commission payout pipeline",
        "Deferred client session liability",
        "Revenue by product type",
        importedOpexSummary.annualBudget > 0 ? "Imported fixed OPEX budget and monthly run-rate" : null,
        "Editable operating cost ledger",
      ].filter(Boolean),
      partial: [
        "Net revenue ex-tax estimation",
        "Revenue by lead source",
        "Delivered value by coach",
        "Deferred revenue aging",
        "Company take percentage",
        importedOpexSummary.annualBudget > 0 ? "Operating result estimate versus imported OPEX budget" : null,
        actualCurrentMonthCost > 0 ? "Current-month operating result against entered costs" : null,
      ].filter(Boolean),
      missing: [
        "Subscriptions / MRR / ARR",
        "Chargebacks and dunning recovery",
        "CAC, payback, and marketing spend",
        "Consult show / close funnel",
        "CSAT, NPS, adherence, audit, safety, education credits",
        "Coach levels and level-based KPI targets",
        "E-invoice acceptance and rejection health",
      ],
    };

    return {
      maps,
      paidRevenue,
      grossSales,
      currentMonthGrossSales,
      currentMonthNetRevenue,
      refundedRevenue,
      trackedTaxes,
      netRevenue,
      pendingRevenue,
      averagePaidOrder,
      gatewayFees,
      coachPayoutsPayable,
      coachPayoutsPaid,
      companyCommissionCaptured,
      averageCompanyTakePct,
      unusedLiability,
      liabilityAging,
      revenueByType: Array.from(revenueByTypeMap, ([label, value]) => ({ label, value })),
      revenueBySource: Array.from(revenueBySourceMap, ([label, value]) => ({ label, value })),
      paymentStatusMix: Array.from(paymentStatusMap, ([label, value]) => ({ label, value })),
      paymentMethodRevenue: Array.from(paymentMethodRevenueMap, ([label, value]) => ({ label, value })),
      salesTimeline,
      coachDeliveredRevenue: Array.from(coachRevenueMap, ([coachId, value]) => ({
        label: maps.coachById.get(coachId)?.display_name || "Coach",
        value,
      })).sort((left, right) => right.value - left.value),
      commissionPipeline: [
        { label: "Pending", value: Number(commissionByStatus.pending || 0) },
        { label: "Approved", value: Number(commissionByStatus.approved || 0) },
        { label: "Paid", value: Number(commissionByStatus.paid || 0) },
      ],
      activeClientCount,
      coachCount: data.coaches.length,
      convertedLeadCount,
      totalLeadCount: data.leads.length,
      leadConversionRate,
      overdueFollowUps,
      pendingApprovals,
      unreadNotifications,
      alerts,
      coverage,
      unattributedRevenue,
      importedOpex: importedOpexSummary,
      actualOperatingCosts: {
        ...actualOperatingSummary,
        currentMonthResult: actualCurrentMonthResult,
        currentMonthBudgetVariance: actualBudgetVariance,
      },
    };
  }

  function buildDonutGradient(items) {
    const total = items.reduce((sum, item) => sum + Number(item.value || 0), 0);
    if (!total) {
      return "conic-gradient(#3a291f 0deg 360deg)";
    }

    let cursor = 0;
    const stops = items.map((item, index) => {
      const start = cursor;
      const span = (Number(item.value || 0) / total) * 360;
      cursor += span;
      return `${METRIC_CHART_COLORS[index % METRIC_CHART_COLORS.length]} ${start}deg ${cursor}deg`;
    });
    return `conic-gradient(${stops.join(", ")})`;
  }

  function renderDonutChart(node, options) {
    if (!node) {
      return;
    }

    const items = (options?.items || []).filter((item) => Number(item.value || 0) > 0);
    const total = items.reduce((sum, item) => sum + Number(item.value || 0), 0);

    if (!total) {
      node.innerHTML = '<div class="metric-viz-empty">Not enough live data yet for this visual.</div>';
      return;
    }

    const formatter = options?.formatter || ((value) => formatCurrency(value));
    node.innerHTML = `
      <div class="metric-donut-layout">
        <div class="metric-donut">
          <div class="metric-donut__ring" style="background:${buildDonutGradient(items)}"></div>
          <div class="metric-donut__center">
            <strong>${escapeHtml(options?.centerValue || formatter(total))}</strong>
            <span>${escapeHtml(options?.centerLabel || "Total")}</span>
          </div>
        </div>
        <div class="metric-legend">
          ${items
            .map(
              (item, index) => `
                <div class="metric-legend__item">
                  <span class="metric-legend__swatch" style="background:${METRIC_CHART_COLORS[index % METRIC_CHART_COLORS.length]}"></span>
                  <div>
                    <strong>${escapeHtml(item.label)}</strong>
                    <span>${escapeHtml(formatter(item.value))}</span>
                  </div>
                </div>
              `
            )
            .join("")}
        </div>
      </div>
    `;
  }

  function renderBarChart(node, options) {
    if (!node) {
      return;
    }

    const items = (options?.items || []).filter((item) => Number(item.value || 0) > 0);
    if (!items.length) {
      node.innerHTML = '<div class="metric-viz-empty">Not enough live data yet for this visual.</div>';
      return;
    }

    const maxValue = Math.max(...items.map((item) => Number(item.value || 0)), 1);
    const formatter = options?.formatter || ((value) => formatCurrency(value));
    node.innerHTML = `
      <div class="metric-bar-chart">
        ${items
          .map(
            (item, index) => `
              <div class="metric-bar-row">
                <div class="metric-bar-row__head">
                  <strong>${escapeHtml(item.label)}</strong>
                  <span>${escapeHtml(formatter(item.value))}</span>
                </div>
                <div class="metric-bar-track">
                  <span class="metric-bar-fill" style="width:${clamp((Number(item.value || 0) / maxValue) * 100, 6, 100)}%; background:${METRIC_CHART_COLORS[index % METRIC_CHART_COLORS.length]}"></span>
                </div>
              </div>
            `
          )
          .join("")}
      </div>
    `;
  }

  function renderCoverageCards(node, items, tone) {
    if (!node) {
      return;
    }

    node.innerHTML = (items || [])
      .map(
        (item) => `
          <article class="metric-coverage-card metric-coverage-card--${escapeHtml(tone)}">
            <strong>${escapeHtml(item)}</strong>
          </article>
        `
      )
      .join("");
  }

  function getRefundEligibility(order, data, maps) {
    if (!order || order.order_type !== "package") {
      return { allowed: false, label: "No action", reason: "Only package orders are managed here." };
    }

    if (order.status === "refunded") {
      return { allowed: false, label: "Refunded", reason: "This order has already been refunded." };
    }

    if (order.status !== "paid") {
      return { allowed: false, label: "No action", reason: "Only paid package orders can be refunded." };
    }

    const payment = maps.paymentByOrderId.get(order.id);
    if (payment?.status && payment.status !== "succeeded") {
      return { allowed: false, label: "No action", reason: "The linked payment is not in a succeeded state." };
    }

    const clientPackage = maps.clientPackageByOrderId.get(order.id);
    if (!clientPackage) {
      return { allowed: false, label: "No action", reason: "No activated client package is linked to this order." };
    }

    const linkedSessions = maps.sessionsByPackageId.get(clientPackage.id) || [];
    const blockingSessions = linkedSessions.filter((session) => session.status !== "cancelled");
    if (blockingSessions.length) {
      return {
        allowed: false,
        label: "Used package",
        reason: "This package already has scheduled, completed, or no-show sessions attached.",
      };
    }

    const pendingRequests = maps.pendingBookingRequestsByPackageId.get(clientPackage.id) || [];
    if (pendingRequests.length) {
      return {
        allowed: false,
        label: "Pending booking",
        reason: "Resolve pending booking requests before refunding this package.",
      };
    }

    if (Number(clientPackage.sessions_remaining || 0) !== Number(clientPackage.sessions_purchased || 0)) {
      return {
        allowed: false,
        label: "Usage mismatch",
        reason: "Sessions have already been consumed from this package.",
      };
    }

    if (clientPackage.status === "cancelled") {
      return { allowed: false, label: "Cancelled", reason: "This package has already been cancelled." };
    }

    return { allowed: true, label: "Refund", reason: "" };
  }

  function populateSelect(selectNode, options, placeholder, disabled) {
    if (!selectNode) {
      return;
    }

    selectNode.innerHTML = [
      `<option value="">${escapeHtml(placeholder || "Select an option")}</option>`,
      ...options.map(
        (option) =>
          `<option value="${escapeHtml(option.value)}"${option.selected ? " selected" : ""}>${escapeHtml(option.label)}</option>`
      ),
    ].join("");
    selectNode.disabled = Boolean(disabled);
  }

  function getLeadFilters() {
    return {
      query: String(dashboardState.leadFilters.query || "").trim().toLowerCase(),
      status: String(dashboardState.leadFilters.status || "all").trim().toLowerCase(),
      source: String(dashboardState.leadFilters.source || "all").trim().toLowerCase(),
    };
  }

  function getFilteredLeads(data) {
    const filters = getLeadFilters();
    return (data.leads || []).filter((lead) => {
      if (filters.status !== "all" && String(lead.status || "new").toLowerCase() !== filters.status) {
        return false;
      }

      const leadSource = String(lead.source || "").trim().toLowerCase();
      if (filters.source !== "all" && leadSource !== filters.source) {
        return false;
      }

      if (!filters.query) {
        return true;
      }

      const haystack = [
        lead.full_name,
        lead.email,
        lead.phone,
        lead.source,
        lead.notes,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(filters.query);
    });
  }

  function renderLeadFilters(data) {
    if (leadSearchNode) {
      leadSearchNode.value = dashboardState.leadFilters.query || "";
    }

    if (leadStatusFilterNode) {
      leadStatusFilterNode.value = dashboardState.leadFilters.status || "all";
    }

    if (!leadSourceFilterNode) {
      return;
    }

    const sources = Array.from(
      new Set(
        (data.leads || [])
          .map((lead) => String(lead.source || "").trim())
          .filter(Boolean)
      )
    ).sort((left, right) => left.localeCompare(right));

    leadSourceFilterNode.innerHTML = [
      '<option value="all">All sources</option>',
      ...sources.map((source) => {
        const selected = String(dashboardState.leadFilters.source || "all").toLowerCase() === source.toLowerCase();
        return `<option value="${escapeHtml(source)}"${selected ? " selected" : ""}>${escapeHtml(source)}</option>`;
      }),
    ].join("");
  }

  function renderLeadBoard(data) {
    if (!leadBoardNode) {
      return;
    }

    if (isLeadWorkspaceDetailsPending(data) && !(data.leads || []).length) {
      leadBoardNode.innerHTML = buildLeadBoardSkeleton();
      return;
    }

    const maps = buildMaps(data);
    const filteredLeads = getFilteredLeads(data);
    const statuses = [
      { key: "new", label: "New" },
      { key: "contacted", label: "Contacted" },
      { key: "qualified", label: "Qualified" },
      { key: "ghosted", label: "Ghosted" },
      { key: "converted", label: "Converted" },
      { key: "lost", label: "Lost" },
    ];

    leadBoardNode.innerHTML = statuses
      .map((status) => {
        const leads = filteredLeads.filter((lead) => (lead.status || "new") === status.key);
        const cards = leads.length
          ? leads
              .map((lead) => {
                const ownerName = lead.owner_id
                  ? maps.profileById.get(lead.owner_id)?.display_name || "Assigned"
                  : "Unassigned";
                const followUpLabel = lead.next_follow_up_at ? formatDateTime(lead.next_follow_up_at) : "Not scheduled";
                const directContact = [lead.email, lead.phone].filter(Boolean).join(" | ") || "No direct contact saved";
                return `
                  <article class="lead-chip-card">
                    <strong title="${escapeHtml(lead.full_name || "Lead")}">${escapeHtml(lead.full_name || "Lead")}</strong>
                    <div class="lead-chip-card__meta">
                      <span class="chip chip--accent" title="${escapeHtml(lead.source || "Unknown source")}">${escapeHtml(truncateText(lead.source || "Unknown source", 28))}</span>
                      <span class="chip" title="${escapeHtml(ownerName)}">${escapeHtml(truncateText(ownerName, 22))}</span>
                    </div>
                    <small class="lead-chip-card__contact" title="${escapeHtml(directContact)}">${escapeHtml(truncateText(directContact, 54))}</small>
                    <p class="lead-chip-card__follow-up">${escapeHtml(`Follow-up: ${followUpLabel}`)}</p>
                  </article>
                `;
              })
              .join("")
          : '<p class="lead-board__empty">No leads in this stage for the current filter.</p>';

        return `
          <section class="lead-board__column">
            <div class="lead-board__head">
              <h3>${escapeHtml(status.label)}</h3>
              <span class="lead-board__count">${escapeHtml(String(leads.length))}</span>
            </div>
            <div class="lead-board__stack">
              ${cards}
            </div>
          </section>
        `;
      })
      .join("");
  }

  function renderFollowUpQueue(data) {
    if (!overdueFollowUpRowsNode) {
      return;
    }

    if (isLeadWorkspaceDetailsPending(data) && !(data.leads || []).length) {
      overdueFollowUpRowsNode.innerHTML = buildSkeletonTableRows(["Lead", "Status", "Owner", "Source", "Next Follow-Up"], 4);
      return;
    }

    const maps = buildMaps(data);
    const queue = (data.leads || [])
      .filter((lead) => lead.next_follow_up_at && !["converted", "lost", "ghosted"].includes(String(lead.status || "")))
      .slice()
      .sort((left, right) => new Date(left.next_follow_up_at).getTime() - new Date(right.next_follow_up_at).getTime());

    overdueFollowUpRowsNode.innerHTML = queue.length
      ? queue
          .map((lead) => {
            const ownerName = lead.owner_id
              ? maps.profileById.get(lead.owner_id)?.display_name || "Assigned"
              : "Unassigned";
            return `
              <tr>
                <td>${escapeHtml(lead.full_name || "Lead")}</td>
                <td>${escapeHtml(normalizeStatusLabel(lead.status || "new"))}</td>
                <td>${escapeHtml(ownerName)}</td>
                <td>${escapeHtml(lead.source || "Unknown")}</td>
                <td>${escapeHtml(formatDateTime(lead.next_follow_up_at))}</td>
              </tr>
            `;
          })
          .join("")
      : buildEmptyTableRow(
          5,
          "No follow-ups are due right now.",
          "When a lead becomes overdue or an upcoming follow-up needs attention, it will surface here first."
        );
  }

  function buildLeadOwnerOptions(data, maps) {
    const adminProfile = maps.profileById.get(data.access.user.id);
    const options = [
      {
        value: data.access.user.id,
        label: `${adminProfile?.display_name || data.access.user.email || "Super Admin"} (Admin)`,
      },
      ...data.coaches
        .slice()
        .sort((left, right) => (left.display_name || "").localeCompare(right.display_name || ""))
        .map((coach) => ({
          value: coach.id,
          label: `${coach.display_name || "Coach"} (Coach)`,
        })),
    ];

    return options.filter(
      (option, index, list) => option.value && list.findIndex((candidate) => candidate.value === option.value) === index
    );
  }

  function prefillFollowUpForm(lead) {
    if (!followUpForm || !lead) {
      return;
    }

    if (followUpLeadSelect) {
      followUpLeadSelect.value = lead.id;
    }

    if (followUpOwnerSelect) {
      followUpOwnerSelect.value = lead.owner_id || "";
    }

    const statusField = followUpForm.elements.namedItem("status");
    if (statusField) {
      statusField.value = lead.status || "new";
    }

    const nextFollowUpField = followUpForm.elements.namedItem("nextFollowUpAt");
    if (nextFollowUpField) {
      nextFollowUpField.value = toInputDateTime(lead.next_follow_up_at);
    }

    const notesField = followUpForm.elements.namedItem("notes");
    if (notesField && !notesField.value) {
      notesField.value = lead.notes || "";
    }
  }

  function prefillConvertForm(lead) {
    if (!convertLeadForm || !lead) {
      return;
    }

    if (convertLeadSelect) {
      convertLeadSelect.value = lead.id;
    }

    if (convertCoachSelect) {
      convertCoachSelect.value = lead.owner_id || "";
    }
  }

  function prefillLeadMessageForm(lead) {
    if (!leadMessageForm || !lead) {
      return;
    }

    if (leadMessageLeadSelect) {
      leadMessageLeadSelect.value = lead.id;
    }

    const subjectField = leadMessageForm.elements.namedItem("subject");
    if (subjectField && !subjectField.value) {
      subjectField.value = `Following up on your LEGACY+ inquiry`;
    }
  }

  function renderHero(data, analytics = buildFinancialAnalytics(data)) {
    if (emailDisplayNode) {
      emailDisplayNode.textContent = data.access.user.email || "super admin";
    }

    const netRevenueNode = document.getElementById("admin-stat-net-revenue");
    const netRevenueNoteNode = document.getElementById("admin-stat-net-revenue-note");
    const payoutsNode = document.getElementById("admin-stat-payouts");
    const payoutsNoteNode = document.getElementById("admin-stat-payouts-note");
    const liabilityNode = document.getElementById("admin-stat-liability");
    const liabilityNoteNode = document.getElementById("admin-stat-liability-note");
    const conversionNode = document.getElementById("admin-stat-conversion");
    const conversionNoteNode = document.getElementById("admin-stat-conversion-note");
    const activeClientsNode = document.getElementById("admin-stat-active-clients");
    const activeClientsNoteNode = document.getElementById("admin-stat-active-clients-note");
    const alertsNode = document.getElementById("admin-stat-alerts");
    const alertsNoteNode = document.getElementById("admin-stat-alerts-note");

    const configuredCoachCount = Number(analytics.coachCount || data.coaches.length || 0);
    const convertedLeadCount = Number(analytics.convertedLeadCount || (data.leads || []).filter((lead) => lead.converted_client_id).length);
    const totalLeadCount = Number(analytics.totalLeadCount || data.leads.length || 0);

    if (netRevenueNode) {
      netRevenueNode.textContent = formatCurrency(analytics.netRevenue);
    }
    if (netRevenueNoteNode) {
      netRevenueNoteNode.textContent = `Gross ${formatCurrency(analytics.grossSales)} less refunds ${formatCurrency(analytics.refundedRevenue)} and tracked tax ${formatCurrency(analytics.trackedTaxes)}.`;
    }

    if (payoutsNode) {
      payoutsNode.textContent = formatCurrency(analytics.coachPayoutsPayable);
    }
    if (payoutsNoteNode) {
      payoutsNoteNode.textContent = `${formatCurrency(analytics.coachPayoutsPaid)} has already been marked paid.`;
    }

    if (liabilityNode) {
      liabilityNode.textContent = formatCurrency(analytics.unusedLiability);
    }
    if (liabilityNoteNode) {
      liabilityNoteNode.textContent = "This is the undelivered value still sitting in active and completed client packages.";
    }

    if (conversionNode) {
      conversionNode.textContent = formatPercent(analytics.leadConversionRate, 1);
    }
    if (conversionNoteNode) {
      conversionNoteNode.textContent = `${convertedLeadCount} of ${totalLeadCount} CRM leads have been converted into clients.`;
    }

    if (activeClientsNode) {
      activeClientsNode.textContent = String(analytics.activeClientCount);
    }
    if (activeClientsNoteNode) {
      activeClientsNoteNode.textContent = `${configuredCoachCount} coaches are currently configured in the system.`;
    }

    if (alertsNode) {
      alertsNode.textContent = String(analytics.alerts.filter((item) => item.tone !== "good").length);
    }
    if (alertsNoteNode) {
      alertsNoteNode.textContent = analytics.alerts[0]?.body || "No major issues are currently highlighted.";
    }

    setTone(netRevenueNode, analytics.netRevenue > 0 ? "info" : "warning");
    setTone(payoutsNode, analytics.coachPayoutsPayable > 0 ? "alert" : "success");
    setTone(liabilityNode, analytics.unusedLiability > 0 ? "warning" : "success");
    setTone(conversionNode, analytics.leadConversionRate > 0 ? "success" : "info");
    setTone(activeClientsNode, analytics.activeClientCount > 0 ? "success" : "info");
    setTone(alertsNode, analytics.alerts.some((item) => item.tone !== "good") ? "alert" : "success");
  }

  function renderExecutiveWatchlist(data, analytics = buildFinancialAnalytics(data)) {
    const node = document.getElementById("admin-watchlist-cards");
    if (!node) {
      return;
    }
    node.innerHTML = analytics.alerts
      .map(
        (alert) => `
          <article class="metric-watch-card metric-watch-card--${escapeHtml(alert.tone)}">
            <span class="metric-watch-card__eyebrow">${escapeHtml(alert.title)}</span>
            <strong>${escapeHtml(alert.value)}</strong>
            <p>${escapeHtml(alert.body)}</p>
          </article>
        `
      )
      .join("");
  }

  function renderMetricCoverageSummary(data, analytics = buildFinancialAnalytics(data)) {
    const homeCoverageNode = document.getElementById("admin-home-coverage-grid");
    const homeCoverageNoteNode = document.getElementById("admin-home-coverage-note");
    const financialCoverageNode = document.getElementById("admin-financial-coverage-grid");
    const financialMissingNode = document.getElementById("admin-financial-missing-grid");
    const financialMissingNoteNode = document.getElementById("admin-financial-missing-note");

    renderCoverageCards(homeCoverageNode, analytics.coverage.ready.slice(0, 4).concat(analytics.coverage.partial.slice(0, 2)), "partial");
    if (homeCoverageNoteNode) {
      homeCoverageNoteNode.textContent = `${analytics.coverage.missing.length} metric groups from the imported spec still need new source data before they can be trusted in reporting.`;
    }

    renderCoverageCards(financialCoverageNode, analytics.coverage.ready.concat(analytics.coverage.partial), "ready");
    renderCoverageCards(financialMissingNode, analytics.coverage.missing, "alert");
    if (financialMissingNoteNode) {
      const varianceNote = analytics.importedOpex.variance
        ? ` Imported OPEX workbook total differs from the month-by-month values by ${formatCurrency(analytics.importedOpex.variance)}; the app is using the recomputed values.`
        : "";
      financialMissingNoteNode.textContent =
        `Still missing from the current schema: subscriptions/MRR, chargebacks, CAC, consult funnel data, CSAT/NPS/adherence, coach levels/targets, and e-invoice health.${varianceNote}`;
    }
  }

  function renderCoachTable(data) {
    if (!coachRowsNode) {
      return;
    }

    const maps = buildMaps(data);
    renderCompPlanReference();
    renderCoachManagement(data);
    coachRowsNode.innerHTML = data.coaches.length
      ? data.coaches
          .map((coach) => {
            const coachProfile = maps.coachProfileById.get(coach.id);
            const tierPreset = findTierPreset(coachProfile?.commission_tier);
            const positionPreset = findPositionPreset(coachProfile?.position_code);
            const kpiSummary = hydrateKpiSummary(coachProfile?.commission_tier, coachProfile?.kpi_summary);
            const checkedCount = (kpiSummary.items || []).filter((item) => item.checked).length;
            const totalCount = (kpiSummary.items || []).length;
            const rowStatus = coach.status !== "active"
              ? normalizeStatusLabel(coach.status || "pending")
              : coachProfile?.promotion_ready
                ? "Promotion ready"
                : totalCount && checkedCount === totalCount && kpiSummary.assessmentComplete
                  ? "KPI green"
                  : coachProfile?.review_due_at
                    ? `Review ${formatDate(coachProfile.review_due_at)}`
                    : "Needs review date";
            return `
              <tr>
                <td>${escapeHtml(coach.display_name || "Coach")}</td>
                <td>${escapeHtml(positionPreset?.shortLabel || positionPreset?.label || "Not set")}</td>
                <td>${escapeHtml(coachProfile?.commission_tier || "Not set")}</td>
                <td>${escapeHtml(formatPercent((coachProfile?.commission_rate || tierPreset?.defaultCommissionRate || 0) * 100))}</td>
                <td>${escapeHtml(rowStatus)}</td>
                <td>${escapeHtml(coachProfile?.review_due_at ? formatDate(coachProfile.review_due_at) : "Not scheduled")}</td>
                <td>
                  <button class="btn btn-ghost" type="button" data-coach-manage-id="${escapeHtml(coach.id)}">Manage</button>
                </td>
              </tr>
            `;
          })
          .join("")
      : buildEmptyTableRow(
          7,
          "No coach records yet.",
          "Coach registrations and admin-created QA or onboarding accounts will appear here once the team roster starts growing."
        );
  }

  function renderClientManagement(data) {
    if (!clientRowsNode || !assignmentCoachSelect || !assignmentClientSelect) {
      return;
    }

    const maps = buildMaps(data);
    const clients = data.clients.slice().sort((left, right) => (left.display_name || "").localeCompare(right.display_name || ""));
    const coaches = data.coaches.slice().sort((left, right) => (left.display_name || "").localeCompare(right.display_name || ""));

    clientRowsNode.innerHTML = clients.length
      ? clients
          .map((client) => {
            const assignment = maps.activeAssignmentByClientId.get(client.id);
            const coachName = assignment
              ? data.coaches.find((coach) => coach.id === assignment.coach_id)?.display_name || "Assigned"
              : "Unassigned";
            const packages = maps.packagesByClientId.get(client.id) || [];
            const activePackages = packages.filter((pkg) => pkg.status === "active").length;
            const engagementStatus = activePackages
              ? "Active package"
              : packages.length
                ? "Past package only"
                : "No package yet";

            return `
              <tr>
                <td>${escapeHtml(client.display_name || "Client")}</td>
                <td>${escapeHtml(coachName)}</td>
                <td>${escapeHtml(`${activePackages} active / ${packages.length} total`)}</td>
                <td>${escapeHtml(engagementStatus)}</td>
              </tr>
            `;
          })
          .join("")
      : buildEmptyTableRow(
          4,
          "No client records yet.",
          "Client registrations, assignments, and package engagement will appear here once onboarding begins."
        );

    assignmentCoachSelect.innerHTML = [
      '<option value="">Select coach</option>',
      ...coaches.map((coach) => `<option value="${escapeHtml(coach.id)}">${escapeHtml(coach.display_name || "Coach")}</option>`),
    ].join("");
    assignmentCoachSelect.disabled = !coaches.length;

    assignmentClientSelect.innerHTML = [
      '<option value="">Select client</option>',
      ...clients.map((client) => `<option value="${escapeHtml(client.id)}">${escapeHtml(client.display_name || "Client")}</option>`),
    ].join("");
    assignmentClientSelect.disabled = !clients.length;
  }

  function renderActivationCodeControls(data) {
    const activeCoaches = (data.coaches || [])
      .filter((coach) => coach.status === "active")
      .slice()
      .sort((left, right) => (left.display_name || "").localeCompare(right.display_name || ""));

    if (adminClientCodeCoachNode) {
      adminClientCodeCoachNode.innerHTML = [
        '<option value="">No coach assigned yet</option>',
        ...activeCoaches.map(
          (coach) => `<option value="${escapeHtml(coach.id)}">${escapeHtml(coach.display_name || "Coach")}</option>`
        ),
      ].join("");
      adminClientCodeCoachNode.disabled = !activeCoaches.length;
    }

    if (!adminAuthCodeRowsNode) {
      return;
    }

    const coachById = new Map((data.coaches || []).map((coach) => [coach.id, coach.display_name || "Coach"]));
    const rows = (data.activationCodes || []).slice(0, 50);
    adminAuthCodeRowsNode.innerHTML = rows.length
      ? rows
          .map((record) => {
            const roleLabel = record.role === "coach" ? "Coach" : "Client";
            const assignedCoachName = record.assigned_coach_id ? coachById.get(record.assigned_coach_id) || "Coach" : "";
            const emailLabel = assignedCoachName
              ? `${record.recipient_email || "-"} • ${assignedCoachName}`
              : record.recipient_email || "-";
            return `
              <tr>
                <td>${escapeHtml(roleLabel)}</td>
                <td>${escapeHtml(emailLabel)}</td>
                <td><code>${escapeHtml(record.code || "-")}</code></td>
                <td>${escapeHtml(normalizeStatusLabel(record.status || "active"))}</td>
                <td>${escapeHtml(record.expires_at ? formatDateTime(record.expires_at) : "No expiry")}</td>
                <td>${escapeHtml(formatDateTime(record.created_at))}</td>
              </tr>
            `;
          })
          .join("")
      : buildEmptyTableRow(
          6,
          "No authentication codes generated yet.",
          "Coach and client access codes will appear here once onboarding invitations are created."
        );
  }

  function renderLeads(data) {
    const detailsPending = isLeadWorkspaceDetailsPending(data);
    const maps = buildMaps(data);
    const filteredLeads = getFilteredLeads(data);
    const leadCounts = (data.leads || []).reduce(
      (summary, lead) => {
        const key = lead.status || "new";
        summary[key] = (summary[key] || 0) + 1;
        if (
          lead.next_follow_up_at
          && new Date(lead.next_follow_up_at).getTime() < Date.now()
          && !["converted", "lost", "ghosted"].includes(String(lead.status || ""))
        ) {
          summary.overdue += 1;
        }
        return summary;
      },
      { new: 0, contacted: 0, qualified: 0, ghosted: 0, converted: 0, lost: 0, overdue: 0 }
    );

    const statNodes = {
      new: document.getElementById("admin-lead-stat-new"),
      contacted: document.getElementById("admin-lead-stat-contacted"),
      qualified: document.getElementById("admin-lead-stat-qualified"),
      ghosted: document.getElementById("admin-lead-stat-ghosted"),
      converted: document.getElementById("admin-lead-stat-converted"),
      lost: document.getElementById("admin-lead-stat-lost"),
      overdue: document.getElementById("admin-lead-stat-follow-up"),
    };

    if (detailsPending && !(data.leads || []).length) {
      renderLeadFunnelStatSkeleton();
    } else {
      if (statNodes.new) statNodes.new.textContent = `${leadCounts.new} leads currently marked as new`;
      if (statNodes.contacted) statNodes.contacted.textContent = `${leadCounts.contacted} leads currently marked as contacted`;
      if (statNodes.qualified) statNodes.qualified.textContent = `${leadCounts.qualified} leads currently marked as qualified`;
      if (statNodes.ghosted) statNodes.ghosted.textContent = `${leadCounts.ghosted} leads currently marked ghosted`;
      if (statNodes.converted) statNodes.converted.textContent = `${leadCounts.converted} leads converted to clients`;
      if (statNodes.lost) statNodes.lost.textContent = `${leadCounts.lost} leads marked lost`;
      if (statNodes.overdue) statNodes.overdue.textContent = `${leadCounts.overdue} overdue follow-ups`;
    }

    renderLeadFilters(data);

    const ownerOptions = buildLeadOwnerOptions(data, maps);
    populateSelect(leadOwnerSelect, ownerOptions, "Unassigned", false);
    populateSelect(followUpOwnerSelect, ownerOptions, "Unassigned", false);
    populateSelect(
      convertCoachSelect,
      data.coaches
        .slice()
        .sort((left, right) => (left.display_name || "").localeCompare(right.display_name || ""))
        .map((coach) => ({
          value: coach.id,
          label: coach.display_name || "Coach",
        })),
      "No coach yet",
      !data.coaches.length
    );
    if (detailsPending && !data.leads.length) {
      populateSelect(followUpLeadSelect, [], "Loading leads...", true);
      populateSelect(convertLeadSelect, [], "Loading leads...", true);
      populateSelect(leadMessageLeadSelect, [], "Loading leads...", true);
    } else {
      populateSelect(
        followUpLeadSelect,
        data.leads.map((lead) => ({
          value: lead.id,
          label: `${lead.full_name || "Lead"}${lead.status ? ` (${normalizeStatusLabel(lead.status)})` : ""}`,
        })),
        "Select lead",
        !data.leads.length
      );
      populateSelect(
        convertLeadSelect,
        data.leads
          .filter((lead) => !lead.converted_client_id)
          .map((lead) => ({
            value: lead.id,
            label: `${lead.full_name || "Lead"}${lead.email ? ` • ${lead.email}` : " • missing email"}`,
          })),
        "Select lead",
        !data.leads.some((lead) => !lead.converted_client_id)
      );
      populateSelect(
        leadMessageLeadSelect,
        data.leads.map((lead) => ({
          value: lead.id,
          label: `${lead.full_name || "Lead"}${lead.phone ? ` • ${lead.phone}` : lead.email ? ` • ${lead.email}` : ""}`,
        })),
        "Select lead",
        !data.leads.length
      );
    }

    if (!leadRowsNode) {
      return;
    }

    if (detailsPending && !filteredLeads.length) {
      leadRowsNode.innerHTML = buildSkeletonTableRows(["Name", "Source", "Status", "Owner", "Next Follow-Up", "Action"], 4);
      return;
    }

    leadRowsNode.innerHTML = filteredLeads.length
      ? filteredLeads
          .map((lead) => {
            const ownerName = lead.owner_id
              ? maps.profileById.get(lead.owner_id)?.display_name || "Assigned"
              : "Unassigned";
            const canConvert = !lead.converted_client_id && Boolean(lead.email);
            const hasInlineLeadActions = Boolean(followUpForm || convertLeadForm || leadMessageForm);
            const actionMarkup = !hasInlineLeadActions
              ? `<a class="btn btn-ghost" href="./admin-leads.html">Open CRM</a>`
              : lead.converted_client_id
                ? `<span>Converted</span>`
                : `
                  <div class="section-actions">
                    <button class="btn btn-ghost" type="button" data-lead-action="follow-up" data-lead-id="${escapeHtml(lead.id)}">Follow Up</button>
                    <button class="btn btn-secondary" type="button" data-lead-action="convert" data-lead-id="${escapeHtml(lead.id)}"${canConvert ? "" : " disabled"}>${canConvert ? "Convert" : "Needs Email"}</button>
                  </div>
                `;

            return `
              <tr>
                <td>${escapeHtml(lead.full_name)}</td>
                <td>${escapeHtml(lead.source || "Unknown")}</td>
                <td>${escapeHtml(normalizeStatusLabel(lead.status))}</td>
                <td>${escapeHtml(ownerName)}</td>
                <td>${escapeHtml(lead.next_follow_up_at ? formatDateTime(lead.next_follow_up_at) : "Not scheduled")}</td>
                <td>${actionMarkup}</td>
              </tr>
            `;
          })
          .join("")
      : `
        <tr>
          <td colspan="6">No leads match the current filter.</td>
        </tr>
      `;
  }

  function renderLeadActivities(data) {
    if (!leadActivityRowsNode) {
      return;
    }

    if (isLeadWorkspaceDetailsPending(data) && !(data.leadActivities || []).length) {
      leadActivityRowsNode.innerHTML = buildSkeletonTableRows(["When", "Lead", "Actor", "Type", "Notes"], 4);
      return;
    }

    const maps = buildMaps(data);
    leadActivityRowsNode.innerHTML = data.leadActivities.length
      ? data.leadActivities
          .map((activity) => {
            const leadName = maps.leadById.get(activity.lead_id)?.full_name || "Lead";
            const actorName = maps.profileById.get(activity.actor_id)?.display_name || "System";
            return `
              <tr>
                <td>${escapeHtml(formatDateTime(activity.created_at))}</td>
                <td>${escapeHtml(leadName)}</td>
                <td>${escapeHtml(actorName)}</td>
                <td>${escapeHtml(normalizeStatusLabel(activity.activity_type))}</td>
                <td>${escapeHtml(activity.notes || "No notes recorded.")}</td>
              </tr>
            `;
          })
          .join("")
      : buildEmptyTableRow(
          5,
          "No lead activity logged yet.",
          "Follow-ups, notes, outbound messages, and conversions will build a running activity history here."
        );
  }

  function renderRewardQueue(data) {
    if (!rewardRowsNode) {
      return;
    }

    const maps = buildMaps(data);
    const codexActionMap = getCodexActionMap();
    const pendingRewards = data.rewards.filter((reward) => reward.approval_status === "pending");

    rewardRowsNode.innerHTML = pendingRewards.length
      ? pendingRewards
          .map((reward) => {
            const clientName = maps.profileById.get(reward.client_id)?.display_name || "Client";
            const coachName = maps.profileById.get(reward.requested_by)?.display_name || "Coach";
            const plannerRewardEvent = maps.plannerRewardByLedgerId.get(reward.id);
            const actionId = plannerRewardEvent?.action_id || extractCodexActionIdFromRewardReason(reward.reason);
            const action = codexActionMap.get(actionId);
            const rewardLabel = action
              ? `${reward.delta} ${reward.points_type === "gym_coins" ? "Gym Coins" : "XP"} • ${action.displayName}`
              : `${reward.delta} ${reward.points_type === "gym_coins" ? "Gym Coins" : "XP"}`;
            const reasonLabel = stripCodexActionIdFromRewardReason(plannerRewardEvent?.reason || reward.reason);
            const sourceLabel = plannerRewardEvent
              ? formatPlannerSourceLabel(plannerRewardEvent.source_module)
              : action
                ? "Codex Reward"
                : "Manual Reward";
            const sourceTone = plannerRewardEvent ? "warning" : action ? "info" : "success";
            const metaLabel = plannerRewardEvent ? formatPlannerRewardMeta(plannerRewardEvent) : "";
            const rewardDetailMarkup = actionId
              ? `<span class="crm-status-pill crm-status-pill--gray">${escapeHtml(actionId)}</span>`
              : `<span>${escapeHtml(sourceLabel)}</span>`;
            const reasonDetailMarkup = metaLabel
              ? `<span>${escapeHtml(metaLabel)}</span>`
              : plannerRewardEvent?.source_record_id
                ? `<span>Record ${escapeHtml(plannerRewardEvent.source_record_id)}</span>`
                : `<span>${escapeHtml(sourceLabel)}</span>`;

            return `
              <tr>
                <td>${escapeHtml(clientName)}</td>
                <td>${escapeHtml(coachName)}</td>
                <td>
                  <div class="crm-inline-stack">
                    <span class="chip chip--tone-${escapeHtml(sourceTone)}">${plannerRewardEvent ? "Planner" : action ? "Codex" : "Coach"}</span>
                    <span>${escapeHtml(sourceLabel)}</span>
                  </div>
                </td>
                <td>
                  <div class="crm-inline-stack">
                    <span>${escapeHtml(rewardLabel)}</span>
                    ${rewardDetailMarkup}
                  </div>
                </td>
                <td>
                  <div class="crm-inline-stack">
                    <span>${escapeHtml(reasonLabel || "No reason provided.")}</span>
                    ${reasonDetailMarkup}
                  </div>
                </td>
                <td>${escapeHtml(normalizeStatusLabel(reward.approval_status))}</td>
                <td>
                  <div class="section-actions">
                    <button class="btn btn-secondary" type="button" data-reward-action="approve" data-reward-id="${escapeHtml(reward.id)}">Approve</button>
                    <button class="btn btn-ghost" type="button" data-reward-action="reject" data-reward-id="${escapeHtml(reward.id)}">Reject</button>
                  </div>
                </td>
              </tr>
            `;
          })
          .join("")
      : `
        <tr>
          <td colspan="7">No reward approvals pending.</td>
        </tr>
      `;
  }

  function renderFinancialVisuals(data, analytics = buildFinancialAnalytics(data)) {
    const overviewMonthSalesNode = document.getElementById("admin-financial-overview-month-sales");
    const overviewMonthNetNode = document.getElementById("admin-financial-overview-month-net");
    const overviewPipelineNode = document.getElementById("admin-financial-overview-pipeline");
    const overviewPayoutNode = document.getElementById("admin-financial-overview-payout");
    const overviewSalesLabelNode = document.getElementById("admin-financial-overview-sales-label");
    const overviewNetLabelNode = document.getElementById("admin-financial-overview-net-label");
    const overviewPipelineLabelNode = document.getElementById("admin-financial-overview-pipeline-label");
    const overviewPayoutLabelNode = document.getElementById("admin-financial-overview-payout-label");
    const overviewSalesHintNode = document.getElementById("admin-financial-sales-hint");
    const overviewSnapshot = buildFinancialOverviewSnapshot(data, analytics);

    if (overviewSalesLabelNode) overviewSalesLabelNode.textContent = overviewSnapshot.salesLabel;
    if (overviewNetLabelNode) overviewNetLabelNode.textContent = overviewSnapshot.netLabel;
    if (overviewPipelineLabelNode) overviewPipelineLabelNode.textContent = overviewSnapshot.pipelineLabel;
    if (overviewPayoutLabelNode) overviewPayoutLabelNode.textContent = overviewSnapshot.payoutLabel;
    if (overviewMonthSalesNode) overviewMonthSalesNode.textContent = formatCurrency(overviewSnapshot.salesValue);
    if (overviewMonthNetNode) overviewMonthNetNode.textContent = formatCurrency(overviewSnapshot.netValue);
    if (overviewPipelineNode) overviewPipelineNode.textContent = formatCurrency(overviewSnapshot.pipelineValue);
    if (overviewPayoutNode) overviewPayoutNode.textContent = formatCurrency(overviewSnapshot.payoutValue);
    if (overviewSalesHintNode) overviewSalesHintNode.textContent = overviewSnapshot.salesHint;

    if (financeOverviewRangeNode) {
      financeOverviewRangeNode.querySelectorAll("[data-finance-overview-range]").forEach((button) => {
        const isActive = button.getAttribute("data-finance-overview-range") === overviewSnapshot.range;
        button.classList.toggle("hitpay-panel-pill--active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
      });
    }

    renderBarChart(document.getElementById("admin-financial-chart-sales-overview"), {
      items: overviewSnapshot.salesTimeline,
      formatter: (value) => formatCurrency(value),
    });

    renderDonutChart(document.getElementById("admin-financial-chart-payment-method-overview"), {
      items: analytics.paymentMethodRevenue,
      centerValue: formatCurrency(analytics.paidRevenue),
      centerLabel: "Paid revenue",
      formatter: (value) => formatCurrency(value),
    });

    renderDonutChart(document.getElementById("admin-financial-chart-payment-status"), {
      items: analytics.paymentStatusMix,
      centerValue: String((data.orders || []).length),
      centerLabel: "Orders",
      formatter: (value) => `${value} orders`,
    });

    renderDonutChart(document.getElementById("admin-financial-chart-source"), {
      items: analytics.revenueBySource,
      centerValue: formatCurrency(analytics.paidRevenue),
      centerLabel: "Attributed sales",
      formatter: (value) => formatCurrency(value),
    });

    renderBarChart(document.getElementById("admin-financial-chart-coach-revenue"), {
      items: analytics.coachDeliveredRevenue.slice(0, 6),
      formatter: (value) => formatCurrency(value),
    });

    renderBarChart(document.getElementById("admin-financial-chart-liability-aging"), {
      items: Object.entries(analytics.liabilityAging).map(([label, value]) => ({ label, value })),
      formatter: (value) => formatCurrency(value),
    });

    renderDonutChart(document.getElementById("admin-financial-chart-opex-category"), {
      items: analytics.importedOpex.categories.slice(0, 6),
      centerValue: formatCurrency(analytics.importedOpex.annualBudget),
      centerLabel: "Annual OPEX budget",
      formatter: (value) => formatCurrency(value),
    });

    renderBarChart(document.getElementById("admin-financial-chart-opex-monthly"), {
      items: analytics.importedOpex.monthlyPlan,
      formatter: (value) => formatCurrency(value),
    });

    renderBarChart(document.getElementById("admin-operating-cost-chart-group"), {
      items: analytics.actualOperatingCosts.groupTotals,
      formatter: (value) => formatCurrency(value),
    });

    renderBarChart(document.getElementById("admin-operating-cost-chart-monthly"), {
      items: analytics.actualOperatingCosts.monthlyTotals.map((item) => ({
        label: formatMonthLabel(item.label),
        value: item.value,
      })),
      formatter: (value) => formatCurrency(value),
    });
  }

  function buildFinancialOverviewTimeline(orders, granularity = "day", limit = 8) {
    const timelineMap = new Map();
    orders.forEach((order) => {
      const createdAt = new Date(order.created_at || 0);
      if (Number.isNaN(createdAt.getTime())) {
        return;
      }
      const sortKey = granularity === "month"
        ? createdAt.toISOString().slice(0, 7)
        : createdAt.toISOString().slice(0, 10);
      timelineMap.set(sortKey, Number(timelineMap.get(sortKey) || 0) + Number(order.total_amount_rm || 0));
    });

    return Array.from(timelineMap, ([sortKey, value]) => ({
      sortKey,
      label: granularity === "month" ? formatMonthLabel(sortKey) : formatDate(sortKey),
      value,
    }))
      .sort((left, right) => String(left.sortKey).localeCompare(String(right.sortKey)))
      .slice(-limit)
      .map(({ label, value }) => ({ label, value }));
  }

  function buildFinancialOverviewSnapshot(data, analytics = buildFinancialAnalytics(data)) {
    const range = dashboardState.financeOverviewRange === "live" ? "live" : "30d";
    const nowMs = Date.now();
    const rollingWindowStartMs = nowMs - (30 * 24 * 60 * 60 * 1000);
    const paidStatuses = new Set(["paid", "refunded"]);
    const pendingStatuses = new Set(["pending", "processing", "authorized"]);
    const orders = data.orders || [];
    const payments = data.payments || [];
    const commissions = data.commissions || [];

    const rollingOrders = orders.filter((order) => {
      const createdAtMs = new Date(order.created_at || 0).getTime();
      return !Number.isNaN(createdAtMs) && createdAtMs >= rollingWindowStartMs && createdAtMs <= nowMs;
    });
    const rollingCapturedOrders = rollingOrders.filter((order) => paidStatuses.has(String(order.status || "").toLowerCase()));
    const rollingRefundedOrders = rollingOrders.filter((order) => String(order.status || "").toLowerCase() === "refunded");
    const rollingOrderIds = new Set(rollingOrders.map((order) => order.id));
    const rollingGrossSales = rollingCapturedOrders.reduce((total, order) => total + Number(order.total_amount_rm || 0), 0);
    const rollingRefundedRevenue = rollingRefundedOrders.reduce((total, order) => total + Number(order.total_amount_rm || 0), 0);
    const rollingTaxes = rollingCapturedOrders.reduce((total, order) => total + Number(order.tax_amount_rm || 0), 0);
    const rollingGatewayFees = payments.reduce((total, payment) => {
      return total + (rollingOrderIds.has(payment.order_id) ? Number(payment.fees_rm || 0) : 0);
    }, 0);
    const rollingNetCollected = Math.max(rollingGrossSales - rollingRefundedRevenue - rollingTaxes - rollingGatewayFees, 0);
    const rollingPendingRevenue = rollingOrders.reduce((total, order) => {
      const status = String(order.status || "").toLowerCase();
      return total + (pendingStatuses.has(status) ? Number(order.total_amount_rm || 0) : 0);
    }, 0);
    const rollingPayoutLiability = commissions.reduce((total, record) => {
      const payoutStatus = String(record.payout_status || "pending").toLowerCase();
      if (!["pending", "approved"].includes(payoutStatus)) {
        return total;
      }
      const anchorMs = new Date(record.payout_month || record.created_at || 0).getTime();
      if (Number.isNaN(anchorMs) || anchorMs < rollingWindowStartMs || anchorMs > nowMs) {
        return total;
      }
      return total + Number(record.amount_rm || 0);
    }, 0);

    if (range === "live") {
      return {
        range,
        salesLabel: "Gross sales to date",
        salesValue: analytics.grossSales,
        netLabel: "Net collected to date",
        netValue: Math.max(analytics.netRevenue - analytics.gatewayFees, 0),
        pipelineLabel: "Pending pipeline right now",
        pipelineValue: analytics.pendingRevenue,
        payoutLabel: "Coach payout liability",
        payoutValue: analytics.coachPayoutsPayable,
        salesHint: "Live book to date",
        salesTimeline: buildFinancialOverviewTimeline(
          orders.filter((order) => paidStatuses.has(String(order.status || "").toLowerCase())),
          "month",
          8
        ),
      };
    }

    return {
      range,
      salesLabel: "Sales last 30 days",
      salesValue: rollingGrossSales,
      netLabel: "Net collected last 30 days",
      netValue: rollingNetCollected,
      pipelineLabel: "Pending created last 30 days",
      pipelineValue: rollingPendingRevenue,
      payoutLabel: "Payouts raised last 30 days",
      payoutValue: rollingPayoutLiability,
      salesHint: "Rolling 30-day sales",
      salesTimeline: buildFinancialOverviewTimeline(rollingCapturedOrders, "day", 8),
    };
  }

  function buildPaymentReportSummary(data, analytics, filters = getFinanceReportFilters()) {
    const maps = analytics.maps;
    const filteredOrders = filterOrdersByDateRange(data, filters);
    const filteredOrderIds = new Set(filteredOrders.map((order) => order.id));
    const filteredPayments = (data.payments || []).filter((payment) => filteredOrderIds.has(payment.order_id));
    const filteredCapturedOrders = filteredOrders.filter((order) => ["paid", "refunded"].includes(order.status));
    const filteredRefundedOrders = filteredOrders.filter((order) => order.status === "refunded");
    const grossSales = filteredCapturedOrders.reduce((total, order) => total + Number(order.total_amount_rm || 0), 0);
    const refunds = filteredRefundedOrders.reduce((total, order) => total + Number(order.total_amount_rm || 0), 0);
    const taxes = filteredCapturedOrders.reduce((total, order) => total + Number(order.tax_amount_rm || 0), 0);
    const netSales = Math.max(grossSales - refunds, 0);
    const fees = filteredPayments.reduce((total, payment) => total + Number(payment.fees_rm || 0), 0);
    const netCollected = Math.max(netSales - fees - taxes, 0);

    const paymentStatusMap = new Map();
    filteredOrders.forEach((order) => {
      const status = normalizeStatusLabel(maps.paymentByOrderId.get(order.id)?.status || order.status || "unknown");
      paymentStatusMap.set(status, Number(paymentStatusMap.get(status) || 0) + 1);
    });

    const leadByClientId = new Map();
    (data.leads || []).forEach((lead) => {
      if (lead.converted_client_id && !leadByClientId.has(lead.converted_client_id)) {
        leadByClientId.set(lead.converted_client_id, lead);
      }
    });

    const revenueBySourceMap = new Map();
    filteredOrders
      .filter((order) => order.status === "paid")
      .forEach((order) => {
        const source = leadByClientId.get(order.client_id)?.source || "Unattributed";
        revenueBySourceMap.set(source, Number(revenueBySourceMap.get(source) || 0) + Number(order.total_amount_rm || 0));
      });

    const fromMs = filters?.from ? new Date(`${filters.from}T00:00:00`).getTime() : Number.NEGATIVE_INFINITY;
    const toMs = filters?.to ? new Date(`${filters.to}T23:59:59`).getTime() : Number.POSITIVE_INFINITY;
    const filteredCoachRevenue = new Map();
    (data.sessions || [])
      .filter((session) => session.status === "completed")
      .filter((session) => {
        const completedAt = new Date(session.completed_at || session.scheduled_end || 0).getTime();
        return !Number.isNaN(completedAt) && completedAt >= fromMs && completedAt <= toMs;
      })
      .forEach((session) => {
        if (!session.coach_id) {
          return;
        }
        filteredCoachRevenue.set(
          session.coach_id,
          Number(filteredCoachRevenue.get(session.coach_id) || 0) + Number(session.session_value_rm || 0)
        );
      });

    return {
      grossSales,
      refunds,
      netSales,
      fees,
      netCollected,
      paymentStatusMix: Array.from(paymentStatusMap, ([label, value]) => ({ label, value })),
      revenueBySource: Array.from(revenueBySourceMap, ([label, value]) => ({ label, value })),
      coachDeliveredRevenue: Array.from(filteredCoachRevenue, ([coachId, value]) => ({
        label: maps.coachById.get(coachId)?.display_name || "Coach",
        value,
      })).sort((left, right) => right.value - left.value),
    };
  }

  function renderRecentTransactions(data, analytics) {
    if (!financeRecentRowsNode) {
      return;
    }

    if (isFinancialWorkspaceDetailsPending(data) && !(data.orders || []).length) {
      financeRecentRowsNode.innerHTML = buildSkeletonTableRows(["Date", "Client", "Method", "Amount", "Status"], 4);
      return;
    }

    const maps = analytics.maps;
    financeRecentRowsNode.innerHTML = (data.orders || []).length
      ? data.orders
          .slice()
          .sort((left, right) => new Date(right.created_at || 0).getTime() - new Date(left.created_at || 0).getTime())
          .slice(0, 10)
          .map((order) => {
            const clientName = getOrderCustomerLabel(order, data, maps);
            const payment = maps.paymentByOrderId.get(order.id);
            const status = normalizeStatusLabel(payment?.status || order.status || "pending");
            const method = normalizeStatusLabel((payment?.payment_method || "Unknown").replace(/_/gu, " "));
            return `
              <tr>
                <td>${escapeHtml(formatDate(order.created_at))}</td>
                <td>${escapeHtml(clientName)}</td>
                <td>${escapeHtml(method)}</td>
                <td>${escapeHtml(formatCurrency(order.total_amount_rm))}</td>
                <td>${escapeHtml(status)}</td>
              </tr>
            `;
          })
          .join("")
      : buildEmptyTableRow(
          5,
          "No transactions yet.",
          "Paid orders and refunds will appear here as soon as a package or store purchase is processed."
        );
  }

  function renderRecentPayouts(data) {
    if (!financeRecentPayoutRowsNode) {
      return;
    }

    if (isFinancialWorkspaceDetailsPending(data) && !(data.commissions || []).length) {
      financeRecentPayoutRowsNode.innerHTML = buildSkeletonTableRows(["Initiated", "Coach", "Amount", "Status"], 4);
      return;
    }

    const coachById = new Map((data.coaches || []).map((coach) => [coach.id, coach.display_name || "Coach"]));
    financeRecentPayoutRowsNode.innerHTML = (data.commissions || []).length
      ? data.commissions
          .slice()
          .sort((left, right) => new Date(right.created_at || right.payout_month || 0).getTime() - new Date(left.created_at || left.payout_month || 0).getTime())
          .slice(0, 8)
          .map((record) => `
            <tr>
              <td>${escapeHtml(formatDate(record.payout_month || record.created_at))}</td>
              <td>${escapeHtml(coachById.get(record.coach_id) || "Coach")}</td>
              <td>${escapeHtml(formatCurrency(record.amount_rm))}</td>
              <td>${escapeHtml(normalizeStatusLabel(record.payout_status || "pending"))}</td>
            </tr>
          `)
          .join("")
      : buildEmptyTableRow(
          4,
          "No payouts recorded yet.",
          "Approved and paid coach commissions will appear here once the payout cycle starts moving."
        );
  }

  function renderFinanceCustomerDirectory(data, analytics) {
    if (!financeCustomerRowsNode) {
      return;
    }

    if (isFinancialWorkspaceDetailsPending(data) && !(data.clientPackages || []).length) {
      const totalClientsNode = document.getElementById("admin-financial-customers-total");
      const activeClientsNode = document.getElementById("admin-financial-customers-active");
      const convertedNode = document.getElementById("admin-financial-customers-converted");
      const revenueNode = document.getElementById("admin-financial-customers-revenue");

      if (totalClientsNode) totalClientsNode.innerHTML = buildSkeletonLine("48%", "metric");
      if (activeClientsNode) activeClientsNode.innerHTML = buildSkeletonLine("42%", "metric");
      if (convertedNode) convertedNode.innerHTML = buildSkeletonLine("46%", "metric");
      if (revenueNode) revenueNode.innerHTML = buildSkeletonLine("58%", "value");
      financeCustomerRowsNode.innerHTML = buildSkeletonTableRows(
        ["Customer", "Goal", "Status", "Current Package", "Sessions Left", "Lifetime Revenue"],
        4
      );
      return;
    }

    const maps = analytics.maps;
    const lifetimeRevenueByClientId = new Map();
    (data.orders || [])
      .filter((order) => order.status === "paid")
      .forEach((order) => {
        lifetimeRevenueByClientId.set(
          order.client_id,
          Number(lifetimeRevenueByClientId.get(order.client_id) || 0) + Number(order.total_amount_rm || 0)
        );
      });

    const totalClientsNode = document.getElementById("admin-financial-customers-total");
    const activeClientsNode = document.getElementById("admin-financial-customers-active");
    const convertedNode = document.getElementById("admin-financial-customers-converted");
    const revenueNode = document.getElementById("admin-financial-customers-revenue");

    if (totalClientsNode) totalClientsNode.textContent = String((data.clients || []).length);
    if (activeClientsNode) activeClientsNode.textContent = String(Array.from(maps.activeAssignmentByClientId.keys()).length);
    if (convertedNode) {
      convertedNode.textContent = String((data.leads || []).filter((lead) => lead.converted_client_id).length);
    }
    if (revenueNode) revenueNode.textContent = formatCurrency(analytics.paidRevenue);

    financeCustomerRowsNode.innerHTML = (data.clients || []).length
      ? data.clients
          .map((client) => {
            const clientProfile = maps.clientProfileById.get(client.id) || null;
            const packages = (maps.packagesByClientId.get(client.id) || []).slice();
            packages.sort((left, right) => new Date(right.activated_at || right.created_at || 0).getTime() - new Date(left.activated_at || left.created_at || 0).getTime());
            const activePackage =
              packages.find((item) => item.status === "active")
              || packages.find((item) => item.status === "completed")
              || packages[0]
              || null;

            return `
              <tr>
                <td>${escapeHtml(client.display_name || clientProfile?.preferred_name || "Client")}</td>
                <td>${escapeHtml(clientProfile?.primary_goal || "No goal set yet")}</td>
                <td>${escapeHtml(normalizeStatusLabel(client.status || "active"))}</td>
                <td>${escapeHtml(activePackage?.package_name || "No active package")}</td>
                <td>${escapeHtml(activePackage ? String(Number(activePackage.sessions_remaining || 0)) : "0")}</td>
                <td>${escapeHtml(formatCurrency(lifetimeRevenueByClientId.get(client.id) || 0))}</td>
              </tr>
            `;
          })
          .join("")
      : buildEmptyTableRow(
          6,
          "No customer finance data yet.",
          "Client revenue, package balance, and lifetime value will appear here once orders are linked to live members."
        );
  }

  function renderFinancialReports(data, analytics) {
    const filters = getFinanceReportFilters();
    const report = buildPaymentReportSummary(data, analytics, filters);

    const grossNode = document.getElementById("admin-report-gross-sales");
    const refundsNode = document.getElementById("admin-report-refunds");
    const netSalesNode = document.getElementById("admin-report-net-sales");
    const feesNode = document.getElementById("admin-report-fees");
    const netCollectedNode = document.getElementById("admin-report-net-collected");

    if (grossNode) grossNode.textContent = formatCurrency(report.grossSales);
    if (refundsNode) refundsNode.textContent = formatCurrency(report.refunds);
    if (netSalesNode) netSalesNode.textContent = formatCurrency(report.netSales);
    if (feesNode) feesNode.textContent = formatCurrency(report.fees);
    if (netCollectedNode) netCollectedNode.textContent = formatCurrency(report.netCollected);

    renderDonutChart(document.getElementById("admin-financial-chart-payment-status"), {
      items: report.paymentStatusMix,
      centerValue: String(report.paymentStatusMix.reduce((sum, item) => sum + Number(item.value || 0), 0)),
      centerLabel: "Orders",
      formatter: (value) => `${value} orders`,
    });

    renderDonutChart(document.getElementById("admin-financial-chart-source"), {
      items: report.revenueBySource,
      centerValue: formatCurrency(report.netSales),
      centerLabel: "Net sales",
      formatter: (value) => formatCurrency(value),
    });

    renderBarChart(document.getElementById("admin-financial-chart-coach-revenue"), {
      items: report.coachDeliveredRevenue.slice(0, 6),
      formatter: (value) => formatCurrency(value),
    });

    renderBarChart(document.getElementById("admin-financial-chart-liability-aging"), {
      items: Object.entries(analytics.liabilityAging).map(([label, value]) => ({ label, value })),
      formatter: (value) => formatCurrency(value),
    });
  }

  function renderFinancials(data, analytics = buildFinancialAnalytics(data)) {
    if (!(financialRowsNode || financeRecentRowsNode || financeCustomerRowsNode || commissionRowsNode)) {
      return;
    }

    const maps = analytics.maps;
    renderFinancialVisuals(data, analytics);
    renderRecentTransactions(data, analytics);
    renderRecentPayouts(data);
    renderFinanceCustomerDirectory(data, analytics);
    renderFinancialReports(data, analytics);

    const opexAnnualNode = document.getElementById("admin-financial-opex-annual");
    const opexMonthlyNode = document.getElementById("admin-financial-opex-monthly");
    const opexCoverageNode = document.getElementById("admin-financial-opex-coverage");
    const opexOperatingNode = document.getElementById("admin-financial-opex-operating");
    const opexLargestNode = document.getElementById("admin-financial-opex-largest");
    const opexPeakNode = document.getElementById("admin-financial-opex-peak");
    const opexNoteNode = document.getElementById("admin-financial-opex-note");

    if (opexAnnualNode) opexAnnualNode.textContent = formatCurrency(analytics.importedOpex.annualBudget);
    if (opexMonthlyNode) opexMonthlyNode.textContent = formatCurrency(analytics.importedOpex.monthlyAverage);
    if (opexCoverageNode) opexCoverageNode.textContent = formatPercent(analytics.importedOpex.coveragePct, 0);
    if (opexOperatingNode) opexOperatingNode.textContent = formatCurrency(analytics.importedOpex.currentMonthOperatingEstimate);
    if (opexLargestNode) {
      opexLargestNode.textContent = analytics.importedOpex.largestCategory
        ? `${analytics.importedOpex.largestCategory.label} | ${formatCurrency(analytics.importedOpex.largestCategory.value)}`
        : "No OPEX file loaded";
    }
    if (opexPeakNode) {
      opexPeakNode.textContent = analytics.importedOpex.peakMonth?.label
        ? `${analytics.importedOpex.peakMonth.label} | ${formatCurrency(analytics.importedOpex.peakMonth.value)}`
        : "No month profile";
    }
    if (opexNoteNode) {
      opexNoteNode.textContent = analytics.importedOpex.annualBudget
        ? `Imported from ${analytics.importedOpex.sourceFile}. Current-month contribution is ${formatCurrency(analytics.importedOpex.currentMonthContribution)} after gateway fees ${formatCurrency(analytics.importedOpex.currentMonthGatewayFees)} and commission accrual ${formatCurrency(analytics.importedOpex.currentMonthCommissionExpense)}.`
        : "No OPEX budget has been imported yet.";
    }

    const actualCurrentNode = document.getElementById("admin-operating-cost-current");
    const actualYtdNode = document.getElementById("admin-operating-cost-ytd");
    const actualResultNode = document.getElementById("admin-operating-cost-result");
    const actualBudgetVarianceNode = document.getElementById("admin-operating-cost-budget-variance");

    if (actualCurrentNode) actualCurrentNode.textContent = formatCurrency(analytics.actualOperatingCosts.currentMonthTotal);
    if (actualYtdNode) actualYtdNode.textContent = formatCurrency(analytics.actualOperatingCosts.ytdTotal);
    if (actualResultNode) actualResultNode.textContent = formatCurrency(analytics.actualOperatingCosts.currentMonthResult);
    if (actualBudgetVarianceNode) actualBudgetVarianceNode.textContent = formatCurrency(analytics.actualOperatingCosts.currentMonthBudgetVariance);

    const transactionOrders = (data.orders || []).filter((order) => {
      if (dashboardState.financeTransactionStatus === "all") {
        return true;
      }
      return order.status === dashboardState.financeTransactionStatus;
    });

    if (isFinancialWorkspaceDetailsPending(data) && !(data.orders || []).length) {
      financialRowsNode.innerHTML = buildSkeletonTableRows(["Date", "Customer", "Charge ID", "Amount", "Fees", "Method", "Status", "Documents", "Action"], 4);
    } else {
      financialRowsNode.innerHTML = transactionOrders.length
        ? transactionOrders
            .map((order) => {
              const clientName = getOrderCustomerLabel(order, data, maps);
              const payment = maps.paymentByOrderId.get(order.id);
              const paymentStatus = payment?.status || order.status;
              const refundState = getRefundEligibility(order, data, maps);
              const documentMarkup = renderAdminBillingDocumentButtons(order);
              const actionMarkup = refundState.allowed
                ? `<button class="btn btn-secondary" type="button" data-order-action="refund" data-order-id="${escapeHtml(order.id)}">Refund</button>`
                : `<span>${escapeHtml(refundState.label)}</span>`;

              return `
                <tr>
                  <td>${escapeHtml(formatDate(order.created_at))}</td>
                  <td>${escapeHtml(clientName)}</td>
                  <td><code>${escapeHtml(String(order.id || "").slice(0, 8))}</code></td>
                  <td>${escapeHtml(formatCurrency(order.total_amount_rm))}</td>
                  <td>${escapeHtml(formatCurrency(payment?.fees_rm || 0))}</td>
                  <td>${escapeHtml(normalizeStatusLabel((payment?.payment_method || "Unknown").replace(/_/gu, " ")))}</td>
                  <td>${escapeHtml(normalizeStatusLabel(paymentStatus))}</td>
                  <td>${documentMarkup}</td>
                  <td title="${escapeHtml(refundState.reason || "")}">${actionMarkup}</td>
                </tr>
              `;
            })
            .join("")
        : buildEmptyTableRow(
            9,
            "No orders or payments yet.",
            "Package sales, receipts, refunds, and billing documents will appear here once payment activity starts."
          );
    }

    if (financialFeedbackNode) {
      financialFeedbackNode.textContent = `Tracked gateway fees: ${formatCurrency(analytics.gatewayFees)}. Pending pipeline: ${formatCurrency(analytics.pendingRevenue)}. Refunded value: ${formatCurrency(analytics.refundedRevenue)}.${analytics.importedOpex.annualBudget ? ` Imported OPEX budget: ${formatCurrency(analytics.importedOpex.annualBudget)} per year.` : ""}${analytics.actualOperatingCosts.entryCount ? ` Entered operating costs this month: ${formatCurrency(analytics.actualOperatingCosts.currentMonthTotal)}.` : ""}`;
      financialFeedbackNode.classList.remove("error");
    }
  }

  function renderOperatingCostFilterOptions(entries) {
    if (operatingCostFilterMonthNode) {
      const months = Array.from(
        new Set(
          (entries || [])
            .map((entry) => String(entry.periodMonth || "").slice(0, 7))
            .filter(Boolean)
        )
      ).sort((left, right) => right.localeCompare(left));

      operatingCostFilterMonthNode.innerHTML = [
        '<option value="all">All months</option>',
        ...months.map((month) => {
          const selected = dashboardState.operatingCostFilters.month === month ? ' selected' : "";
          return `<option value="${escapeHtml(month)}"${selected}>${escapeHtml(formatMonthLabel(month))}</option>`;
        }),
      ].join("");
    }

    if (operatingCostFilterGroupNode) {
      const groups = Array.from(
        new Set(
          (entries || [])
            .map((entry) => String(entry.costGroup || "").trim())
            .filter(Boolean)
        )
      ).sort((left, right) => left.localeCompare(right));

      operatingCostFilterGroupNode.innerHTML = [
        '<option value="all">All groups</option>',
        ...groups.map((group) => {
          const selected = dashboardState.operatingCostFilters.group === group ? ' selected' : "";
          return `<option value="${escapeHtml(group)}"${selected}>${escapeHtml(normalizeStatusLabel(group))}</option>`;
        }),
      ].join("");
    }

    if (operatingCostFilterQueryNode && operatingCostFilterQueryNode.value !== dashboardState.operatingCostFilters.query) {
      operatingCostFilterQueryNode.value = dashboardState.operatingCostFilters.query || "";
    }
  }

  function getFilteredOperatingCostEntries(data) {
    const filters = dashboardState.operatingCostFilters || {};
    const query = String(filters.query || "").trim().toLowerCase();
    return (data.operatingCostEntries || [])
      .slice()
      .sort((left, right) => {
        const monthDelta = String(right.periodMonth || "").localeCompare(String(left.periodMonth || ""));
        if (monthDelta !== 0) {
          return monthDelta;
        }
        return String(left.category || "").localeCompare(String(right.category || ""));
      })
      .filter((entry) => {
        if (filters.month && filters.month !== "all" && String(entry.periodMonth || "").slice(0, 7) !== filters.month) {
          return false;
        }
        if (filters.group && filters.group !== "all" && String(entry.costGroup || "").trim() !== filters.group) {
          return false;
        }
        if (!query) {
          return true;
        }
        const haystack = [entry.category, entry.notes, entry.costGroup, entry.periodMonth]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(query);
      });
  }

  function renderOperatingCostLedger(data) {
    if (!operatingCostRowsNode) {
      return;
    }

    const entries = data.operatingCostEntries || [];
    if (isOperatingCostHydrationPending(data)) {
      operatingCostRowsNode.innerHTML = buildSkeletonTableRows(["Month", "Group", "Category", "Amount", "Notes", "Action"], 4);
      if (operatingCostLedgerMetaNode) {
        operatingCostLedgerMetaNode.textContent = "Syncing operating costs...";
      }
      if (operatingCostPageInfoNode) {
        operatingCostPageInfoNode.textContent = "Loading...";
      }
      if (operatingCostPrevButton) {
        operatingCostPrevButton.disabled = true;
      }
      if (operatingCostNextButton) {
        operatingCostNextButton.disabled = true;
      }
      return;
    }

    renderOperatingCostFilterOptions(entries);

    const filteredEntries = getFilteredOperatingCostEntries(data);
    const pageSize = 10;
    const totalPages = Math.max(1, Math.ceil(filteredEntries.length / pageSize));
    if (dashboardState.operatingCostPage > totalPages) {
      dashboardState.operatingCostPage = totalPages;
    }
    if (dashboardState.operatingCostPage < 1) {
      dashboardState.operatingCostPage = 1;
    }
    const pageStart = (dashboardState.operatingCostPage - 1) * pageSize;
    const visibleEntries = filteredEntries.slice(pageStart, pageStart + pageSize);

    operatingCostRowsNode.innerHTML = visibleEntries.length
      ? visibleEntries
          .map(
            (entry) => `
              <tr>
                <td>${escapeHtml(formatMonthLabel(entry.periodMonth))}</td>
                <td>${escapeHtml(normalizeStatusLabel(entry.costGroup))}</td>
                <td>${escapeHtml(entry.category)}</td>
                <td>${escapeHtml(formatCurrency(entry.amountRm))}</td>
                <td>${escapeHtml(entry.notes || "No notes")}</td>
                <td>
                  <div class="section-actions section-actions--compact">
                    <button class="btn btn-ghost" type="button" data-operating-cost-action="edit" data-operating-cost-id="${escapeHtml(entry.id)}">Edit</button>
                    <button class="btn btn-ghost" type="button" data-operating-cost-action="delete" data-operating-cost-id="${escapeHtml(entry.id)}">Delete</button>
                  </div>
                </td>
              </tr>
            `
          )
          .join("")
      : `
        <tr>
          <td colspan="6">${escapeHtml(filteredEntries.length ? "No entries on this page." : entries.length ? "No entries match the current filters." : "No operating cost entries yet.")}</td>
        </tr>
      `;

    if (operatingCostLedgerMetaNode) {
      if (!filteredEntries.length) {
        operatingCostLedgerMetaNode.textContent = "Showing 0 of 0 entries";
      } else {
        operatingCostLedgerMetaNode.textContent = `Showing ${pageStart + 1}-${Math.min(pageStart + visibleEntries.length, filteredEntries.length)} of ${filteredEntries.length} entries`;
      }
    }

    if (operatingCostPageInfoNode) {
      operatingCostPageInfoNode.textContent = `Page ${dashboardState.operatingCostPage} of ${totalPages}`;
    }

    if (operatingCostPrevButton) {
      operatingCostPrevButton.disabled = dashboardState.operatingCostPage <= 1;
    }

    if (operatingCostNextButton) {
      operatingCostNextButton.disabled = dashboardState.operatingCostPage >= totalPages;
    }
  }

  function renderPackagePurchases(data) {
    if (!packagePurchaseRowsNode) {
      return;
    }

    if (isFinancialWorkspaceDetailsPending(data) && !(data.clientPackages || []).length) {
      packagePurchaseRowsNode.innerHTML = buildSkeletonTableRows(
        ["Date", "Customer", "Package", "Sessions", "Amount", "Payment", "Package Status"],
        4
      );
      return;
    }

    const maps = buildMaps(data);
    const orderById = new Map((data.orders || []).map((order) => [order.id, order]));

    packagePurchaseRowsNode.innerHTML = data.clientPackages.length
      ? data.clientPackages
          .map((clientPackage) => {
            const order = orderById.get(clientPackage.order_id);
            const orderItem = (maps.orderItemsByOrderId.get(clientPackage.order_id) || [])[0];
            const clientName = maps.clientById.get(clientPackage.client_id)?.display_name || "Client";
            const sharedClientName = clientPackage.secondary_client_id
              ? maps.clientById.get(clientPackage.secondary_client_id)?.display_name || "Shared client"
              : "";
            const paymentStatus = maps.paymentByOrderId.get(clientPackage.order_id)?.status || order?.status || "pending";
            const purchaseTotal = orderItem?.total_amount_rm || order?.total_amount_rm || 0;

            return `
              <tr>
                <td>${escapeHtml(formatDate(order?.created_at || clientPackage.activated_at))}</td>
                <td>${escapeHtml(sharedClientName ? `${clientName} + ${sharedClientName}` : clientName)}</td>
                <td>${escapeHtml(clientPackage.package_name || orderItem?.name || "Package")}</td>
                <td>${escapeHtml(`${Number(clientPackage.sessions_purchased || 0)} purchased / ${Number(clientPackage.sessions_remaining || 0)} left`)}</td>
                <td>${escapeHtml(formatCurrency(purchaseTotal))}</td>
                <td>${escapeHtml(normalizeStatusLabel(paymentStatus))}</td>
                <td>${escapeHtml(normalizeStatusLabel(clientPackage.status || "pending"))}</td>
              </tr>
            `;
          })
          .join("")
      : buildEmptyTableRow(
          7,
          "No package purchases yet.",
          "Activated packages and their remaining-session balances will appear here once checkout is completed."
        );
  }

  function renderNotifications(data) {
    if (!notificationRowsNode) {
      return;
    }

    if (isLeadWorkspaceDetailsPending(data) && !(data.notifications || []).length) {
      notificationRowsNode.innerHTML = buildSkeletonTableRows(["Date", "Category", "Title", "Details", "Status"], 4);
      return;
    }

    const unreadNode = document.getElementById("admin-notification-unread");
    const totalNode = document.getElementById("admin-notification-total");
    const notifications = data.notifications || [];

    if (unreadNode) {
      unreadNode.textContent = String(notifications.filter((item) => !item.is_read).length);
    }

    if (totalNode) {
      totalNode.textContent = String(notifications.length);
    }

    notificationRowsNode.innerHTML = notifications.length
      ? notifications
          .map((notification) => `
            <tr>
              <td>${escapeHtml(formatDateTime(notification.created_at))}</td>
              <td>${escapeHtml(normalizeStatusLabel(notification.category || "system"))}</td>
              <td>${escapeHtml(notification.title)}</td>
              <td>${escapeHtml(notification.body)}</td>
              <td>${escapeHtml(notification.is_read ? "Read" : "New")}</td>
            </tr>
          `)
          .join("")
      : buildEmptyTableRow(
          5,
          "No notifications yet.",
          "Automatic alerts from leads, payments, and approvals will appear here as the CRM activity starts flowing."
        );
  }

  function renderCommissions(data) {
    if (!commissionRowsNode) {
      return;
    }

    if (isFinancialWorkspaceDetailsPending(data) && !(data.commissions || []).length) {
      commissionRowsNode.innerHTML = buildSkeletonTableRows(["Coach", "Payout Month", "Amount", "Status", "Action"], 4);
      return;
    }

    const coachById = new Map(data.coaches.map((coach) => [coach.id, coach.display_name || "Coach"]));
    const totals = data.commissions.reduce(
      (summary, record) => {
        const key = record.payout_status || "pending";
        summary[key] = (summary[key] || 0) + Number(record.amount_rm || 0);
        return summary;
      },
      { pending: 0, approved: 0, paid: 0 }
    );

    const pendingNode = document.getElementById("admin-commission-pending");
    const approvedNode = document.getElementById("admin-commission-approved");
    const paidNode = document.getElementById("admin-commission-paid");
    const bookingRequestNode = document.getElementById("admin-booking-requests");

    if (pendingNode) pendingNode.textContent = formatCurrency(totals.pending || 0);
    if (approvedNode) approvedNode.textContent = formatCurrency(totals.approved || 0);
    if (paidNode) paidNode.textContent = formatCurrency(totals.paid || 0);
    if (bookingRequestNode) {
      const openRequests = data.bookingRequests.filter((request) => request.status === "pending").length;
      bookingRequestNode.textContent = String(openRequests);
    }

    commissionRowsNode.innerHTML = data.commissions.length
      ? data.commissions
          .map((record) => {
            const actionMarkup =
              record.payout_status === "pending"
                ? `
                  <div class="section-actions">
                    <button class="btn btn-secondary" type="button" data-commission-action="approve" data-commission-id="${escapeHtml(record.id)}">Approve</button>
                    <button class="btn btn-ghost" type="button" data-commission-action="reject" data-commission-id="${escapeHtml(record.id)}">Reject</button>
                  </div>
                `
                : record.payout_status === "approved"
                  ? `<button class="btn btn-secondary" type="button" data-commission-action="paid" data-commission-id="${escapeHtml(record.id)}">Mark Paid</button>`
                  : `<span>${escapeHtml(normalizeStatusLabel(record.payout_status))}</span>`;

            return `
              <tr>
                <td>${escapeHtml(coachById.get(record.coach_id) || "Coach")}</td>
                <td>${escapeHtml(formatDate(record.payout_month || record.created_at))}</td>
                <td><code>${escapeHtml(String(record.session_id || record.id || "").slice(0, 8))}</code></td>
                <td>${escapeHtml(formatCurrency(record.amount_rm))}</td>
                <td>${escapeHtml(normalizeStatusLabel(record.payout_status))}</td>
                <td>${actionMarkup}</td>
              </tr>
            `;
          })
          .join("")
      : buildEmptyTableRow(
          6,
          "No commission records yet.",
          "Coach earnings will appear here once completed sessions are translated into payout records."
        );
  }

  function renderDashboard(data) {
    dashboardState.lastData = data;
    syncAdminDeferredUiState(data);
    const analytics = isHomeWorkspacePage() || isFinancialWorkspacePage()
      ? buildFinancialAnalytics(data)
      : null;

    if (isHomeWorkspacePage()) {
      const resolvedAnalytics = analytics || buildFinancialAnalytics(data);
      renderHero(data, resolvedAnalytics);
      renderExecutiveWatchlist(data, resolvedAnalytics);
      renderMetricCoverageSummary(data, resolvedAnalytics);
      renderCoachReviewQueue(data);
      setFinancialFeedback("", false);
      setStatus("");
      return;
    }

    if (isClientsWorkspacePage()) {
      renderCoachTable(data);
      renderClientManagement(data);
      renderActivationCodeControls(data);
      renderRewardQueue(data);
      setFinancialFeedback("", false);
      setStatus("");
      return;
    }

    if (isLeadsWorkspacePage()) {
      renderLeads(data);
      renderLeadBoard(data);
      renderFollowUpQueue(data);
      renderLeadActivities(data);
      renderNotifications(data);
      setFinancialFeedback("", false);
      setStatus("");
      return;
    }

    if (isFinancialWorkspacePage()) {
      const resolvedAnalytics = analytics || buildFinancialAnalytics(data);
      ensureFinanceReportDefaults();
      bindFinanceWorkspaceNavigation();
      renderFinancials(data, resolvedAnalytics);
      renderOperatingCostLedger(data);
      renderPackagePurchases(data);
      renderCommissions(data);
      setFinancialFeedback("", false);
      setStatus("");
      return;
    }

    if (isSettingsWorkspacePage()) {
      renderCodexBundleAddon();
      renderNotifications(data);
      if (qaAccountsSummaryNode) {
        renderQaAccountStatus();
        if (!dashboardState.qaAccountsLoaded && !dashboardState.qaAccountsLoading) {
          void loadQaAccountStatus({ silent: true });
        }
      }
      setFinancialFeedback("", false);
      setStatus("");
      return;
    }

    setFinancialFeedback("", false);
    setStatus("");
  }

  async function hydrateOperatingCostState(loadSequence) {
    dashboardState.operatingCostHydrationInFlight = true;
    if (loadSequence === dashboardState.loadSequence && dashboardState.lastData) {
      renderOperatingCostLedger(dashboardState.lastData);
      syncAdminDeferredUiState(dashboardState.lastData);
    }

    try {
      const accessToken = await getAccessToken().catch(() => "");
      const operatingCostState = await fetchOperatingCostState(accessToken).catch(() => ({ entries: [], summary: null }));
      if (loadSequence !== dashboardState.loadSequence || !dashboardState.lastData) {
        dashboardState.operatingCostHydrationInFlight = false;
        return;
      }

      dashboardState.operatingCostHydrationInFlight = false;
      renderDashboard({
        ...dashboardState.lastData,
        operatingCostEntries: operatingCostState.entries || [],
        operatingCostSummary: operatingCostState.summary || null,
      });
    } catch (_) {
      dashboardState.operatingCostHydrationInFlight = false;
      if (loadSequence === dashboardState.loadSequence && dashboardState.lastData) {
        syncAdminDeferredUiState(dashboardState.lastData);
      }
      // Operating costs are secondary; keep the rest of the dashboard usable.
    }
  }

  async function loadDashboard(options) {
    const config = options || {};
    let hasVisibleData = Boolean(dashboardState.lastData);
    const loadStartedAt = typeof window.performance?.now === "function" ? window.performance.now() : 0;
    const silent = Boolean(config.silent && hasVisibleData);
    const allowCacheFallback = config.allowCacheFallback !== false;
    let access = dashboardState.access;
    dashboardState.loadInFlight = true;

    try {
      ({ access } = await loadAccessAndClient());
      bindLiveDashboardEvents();

      if (!hasVisibleData && allowCacheFallback && access?.user?.id) {
        const cachedData = readDashboardCache(access.user.id);
        if (cachedData) {
          const hydratedCachedData = mergeDashboardData(cachedData, dashboardState.lastData);
          renderDashboard(hydratedCachedData);
          hasVisibleData = true;
          if (!silent) {
            setStatus("Loading fresh admin data...");
          }
        }
      }

      if (!hasVisibleData && !silent) {
        renderInitialDashboardSkeleton();
        setStatus("Loading your live admin dashboard data...");
      }

      const loadSequence = dashboardState.loadSequence + 1;
      dashboardState.loadSequence = loadSequence;
      const freshData = await fetchDashboardData(
        shouldUsePrimaryDashboardPayload()
          ? { variant: "primary" }
          : {}
      );
      const data = mergeDashboardData(freshData, dashboardState.lastData);
      writeDashboardCache(access.user.id, data);
      renderDashboard(data);
      void setupRealtimeDashboardRefresh().catch(() => null);
      if (shouldDeferSecondaryPayload()) {
        scheduleAfterInitialPaint(() => hydrateDeferredDashboardSections(loadSequence, access.user.id));
      }
      if (isLeadsWorkspacePage() && data.leadWorkspaceDetailsLoaded === false) {
        setStatus("Lead pipeline is ready. Activity history and notifications are syncing now...");
      } else if (isFinancialWorkspacePage() && data.financialWorkspaceDetailsLoaded === false) {
        setStatus("Finance overview is ready. Detailed reports, purchases, and OPEX are syncing now...");
      }
      if (loadStartedAt) {
        console.info(`[LEGACY] Admin dashboard rendered in ${Math.round(window.performance.now() - loadStartedAt)}ms`);
      }
      if (isFinancialWorkspacePage()) {
        void hydrateOperatingCostState(loadSequence);
      }
      if (isHomeWorkspacePage() || isClientsWorkspacePage()) {
        void ensureQuarterlyReviewNotifications(data).catch(() => null);
      }
      setAssignmentFeedback("Assignments control coach/client access across the app.", false);
    } catch (error) {
      if (hasVisibleData) {
        setStatus("Live sync stalled. Keeping the current dashboard visible while it retries.", true);
        return;
      }

      if (allowCacheFallback && access?.user?.id) {
        const cachedData = readDashboardCache(access.user.id);
        if (cachedData) {
          const hydratedCachedData = mergeDashboardData(cachedData, dashboardState.lastData);
          renderDashboard(hydratedCachedData);
          if (shouldDeferSecondaryPayload()) {
            scheduleAfterInitialPaint(() => hydrateDeferredDashboardSections(dashboardState.loadSequence, access.user.id));
          }
          setStatus("Showing recent saved data while the live refresh retries.", true);
          return;
        }
      }

      setStatus(error?.message || "Unable to load your live admin dashboard data right now.", true);
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

  function rerenderLeadViews() {
    if (!dashboardState.lastData) {
      return;
    }

    renderLeads(dashboardState.lastData);
    renderLeadBoard(dashboardState.lastData);
    renderFollowUpQueue(dashboardState.lastData);
  }

  function applyCoachPresetsToForm() {
    const positionPreset = findPositionPreset(coachPositionSelect?.value);
    const tierPreset = findTierPreset(coachTierSelect?.value);
    const hydratedSummary = hydrateKpiSummary(coachTierSelect?.value, buildDefaultKpiSummary(coachTierSelect?.value, 0, false));

    if (coachRateInput && tierPreset) {
      coachRateInput.value = Number(tierPreset.defaultCommissionRate || 0) * 100;
    }

    if (coachCapInput) {
      coachCapInput.value = Number(tierPreset?.cap || positionPreset?.cap || 0) * 100;
    }

    if (coachHoursMinInput) {
      coachHoursMinInput.value = Number(positionPreset?.monthlyHoursMinimum ?? tierPreset?.hoursMinimum ?? 0);
    }

    if (coachHoursTargetInput) {
      coachHoursTargetInput.value = Number(positionPreset?.monthlyHoursTarget ?? tierPreset?.hoursTarget ?? 0);
    }

    if (coachBonusNotesInput) {
      coachBonusNotesInput.value = tierPreset?.upliftLabel || positionPreset?.upliftLabel || "";
    }

    if (coachReviewDueInput && !coachReviewDueInput.value) {
      coachReviewDueInput.value = addMonths(new Date(), 3);
    }

    if (coachAssessmentCompleteInput) {
      coachAssessmentCompleteInput.checked = false;
    }

    if (coachPromotionReadyInput) {
      coachPromotionReadyInput.checked = false;
    }

    if (coachKpiListNode) {
      coachKpiListNode.innerHTML = buildKpiChecklistMarkup(hydratedSummary);
    }

    setCoachManagementFeedback("Preset values applied. Review the fields, tick the KPI checks, and save.", false);
  }

  async function handleCoachManagementSubmit(event) {
    event.preventDefault();

    try {
      const { supabase } = await loadAccessAndClient();
      const coachId = String(coachSelectNode?.value || dashboardState.selectedCoachId || "").trim();
      if (!coachId) {
        setCoachManagementFeedback("Select a coach before saving.", true);
        return;
      }

      const kpiSummary = collectCoachKpiSummary();
      const payload = {
        commission_tier: String(coachTierSelect?.value || "").trim() || null,
        commission_rate: Number(coachRateInput?.value || 0) / 100,
        position_code: String(coachPositionSelect?.value || "").trim() || null,
        commission_cap: Number(coachCapInput?.value || 0) / 100 || null,
        commission_bonus_notes: String(coachBonusNotesInput?.value || "").trim() || null,
        hours_minimum: Number(coachHoursMinInput?.value || 0) || null,
        hours_target: Number(coachHoursTargetInput?.value || 0) || null,
        review_due_at: String(coachReviewDueInput?.value || "").trim() || null,
        promotion_ready: Boolean(coachPromotionReadyInput?.checked),
        kpi_summary: kpiSummary,
        notes: String(coachNotesInput?.value || "").trim() || null,
        updated_at: new Date().toISOString(),
      };

      setCoachManagementFeedback("Saving coach compensation and KPI settings...", false);

      const { error } = await supabase.from("coach_profiles").update(payload).eq("id", coachId);
      if (error) {
        throw error;
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          status: "active",
          updated_at: new Date().toISOString(),
        })
        .eq("id", coachId);

      if (profileError) {
        throw profileError;
      }

      dashboardState.selectedCoachId = coachId;
      setCoachManagementFeedback("Coach settings updated and account access is now active.", false);
      await loadDashboard();
    } catch (error) {
      setCoachManagementFeedback(error?.message || "Unable to save coach settings right now.", true);
    }
  }

  async function completeCoachReview() {
    try {
      const { supabase } = await loadAccessAndClient();
      const coachId = String(coachSelectNode?.value || dashboardState.selectedCoachId || "").trim();
      if (!coachId) {
        setCoachManagementFeedback("Select a coach before completing a review.", true);
        return;
      }

      const nextReviewDate = addMonths(new Date(), 3);
      setCoachManagementFeedback("Closing the current review and scheduling the next quarter...", false);

      const { error } = await supabase
        .from("coach_profiles")
        .update({
          last_reviewed_at: new Date().toISOString(),
          review_due_at: nextReviewDate,
          updated_at: new Date().toISOString(),
        })
        .eq("id", coachId);

      if (error) {
        throw error;
      }

      dashboardState.selectedCoachId = coachId;
      setCoachManagementFeedback(`Review completed. Next review set for ${formatDate(nextReviewDate)}.`, false);
      await loadDashboard();
    } catch (error) {
      setCoachManagementFeedback(error?.message || "Unable to complete the review right now.", true);
    }
  }

  async function submitAdminAuthCode(event, role) {
    event.preventDefault();

    const isCoachCode = role === "coach";
    const form = isCoachCode ? adminCoachCodeForm : adminClientCodeForm;
    const setFeedback = isCoachCode ? setAdminCoachCodeFeedback : setAdminClientCodeFeedback;

    if (!(form instanceof HTMLFormElement)) {
      return;
    }

    try {
      const accessToken = await getAccessToken();
      const formData = new FormData(form);
      const recipientEmail = String(formData.get("recipientEmail") || "").trim();
      const recipientName = String(formData.get("recipientName") || "").trim();
      const notes = String(formData.get("notes") || "").trim();
      const assignedCoachId = isCoachCode ? "" : String(formData.get("assignedCoachId") || "").trim();

      if (!recipientEmail) {
        setFeedback("Recipient email is required before generating a code.", true);
        return;
      }

      setFeedback(`Generating ${isCoachCode ? "coach" : "client"} authentication code...`, false);

      const response = await window.fetch("/.netlify/functions/manage-activation-codes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          action: "generate",
          role,
          recipientEmail,
          recipientName,
          assignedCoachId: isCoachCode ? null : assignedCoachId || null,
          notes,
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error || "Unable to generate the authentication code.");
      }

      form.reset();
      setFeedback(`${isCoachCode ? "Coach" : "Client"} code generated: ${payload?.code?.code || "Ready"}`, false);
      await loadDashboard({
        silent: true,
        reason: `${role}-auth-code`,
      });
    } catch (error) {
      setFeedback(error?.message || "Unable to generate the authentication code right now.", true);
    }
  }

  async function handleAssignmentSubmit(event) {
    event.preventDefault();

    try {
      const { supabase } = await loadAccessAndClient();
      const formData = new FormData(assignmentForm);
      const coachId = String(formData.get("coachId") || "").trim();
      const clientId = String(formData.get("clientId") || "").trim();

      if (!coachId || !clientId) {
        setAssignmentFeedback("Select both a coach and a client.", true);
        return;
      }

      setAssignmentFeedback("Updating coach assignment...", false);

      const closeAssignments = await supabase
        .from("coach_client_assignments")
        .update({
          status: "ended",
          ended_at: new Date().toISOString(),
        })
        .eq("client_id", clientId)
        .eq("status", "active");

      if (closeAssignments.error) {
        throw closeAssignments.error;
      }

      const { error } = await supabase.from("coach_client_assignments").insert({
        coach_id: coachId,
        client_id: clientId,
        status: "active",
        assigned_at: new Date().toISOString(),
      });

      if (error) {
        throw error;
      }

      const clientProfileUpdate = await supabase
        .from("client_profiles")
        .update({
          preferred_coach_id: coachId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", clientId);

      if (clientProfileUpdate.error) {
        throw clientProfileUpdate.error;
      }

      assignmentForm.reset();
      setAssignmentFeedback("Coach assignment updated.", false);
      await loadDashboard();
    } catch (error) {
      setAssignmentFeedback(error?.message || "Unable to update the coach assignment right now.", true);
    }
  }

  async function handleLeadSubmit(event) {
    event.preventDefault();

    try {
      const accessToken = await getAccessToken();
      const formData = new FormData(leadForm);
      const fullName = String(formData.get("fullName") || "").trim();
      const source = String(formData.get("source") || "").trim();
      const email = String(formData.get("email") || "").trim();
      const phone = String(formData.get("phone") || "").trim();
      const ownerId = String(formData.get("ownerId") || "").trim();
      const nextFollowUpAt = String(formData.get("nextFollowUpAt") || "").trim();
      const notes = String(formData.get("notes") || "").trim();

      if (!fullName) {
        setLeadFeedback("Lead name is required.", true);
        return;
      }

      setLeadFeedback("Creating lead...", false);

      const response = await window.fetch("/.netlify/functions/manage-leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          action: "create",
          fullName,
          source,
          email,
          phone,
          ownerId,
          nextFollowUpAt,
          notes,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error || "Unable to create the lead.");
      }

      leadForm.reset();
      setLeadFeedback(`Lead created for ${payload.fullName || fullName}.`, false);
      await loadDashboard();
    } catch (error) {
      setLeadFeedback(error?.message || "Unable to create the lead right now.", true);
    }
  }

  async function handleFollowUpSubmit(event) {
    event.preventDefault();

    try {
      const accessToken = await getAccessToken();
      const formData = new FormData(followUpForm);
      const leadId = String(formData.get("leadId") || "").trim();
      const activityType = String(formData.get("activityType") || "").trim();
      const status = String(formData.get("status") || "").trim() || "contacted";
      const ownerId = String(formData.get("ownerId") || "").trim();
      const nextFollowUpAt = String(formData.get("nextFollowUpAt") || "").trim();
      const notes = String(formData.get("notes") || "").trim();

      if (!leadId || !activityType || !notes) {
        setFollowUpFeedback("Lead, activity type, and follow-up notes are required.", true);
        return;
      }

      const lead = dashboardState.leads.find((item) => item.id === leadId);
      if (!lead) {
        setFollowUpFeedback("Select a valid lead before saving a follow-up.", true);
        return;
      }

      if (status === "converted" && !lead.converted_client_id) {
        setFollowUpFeedback("Use the Convert Lead form to create the client account before marking a lead converted.", true);
        return;
      }

      setFollowUpFeedback("Saving follow-up...", false);

      const response = await window.fetch("/.netlify/functions/manage-leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          action: "follow_up",
          leadId,
          activityType,
          status,
          ownerId,
          nextFollowUpAt,
          notes,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error || "Unable to save the follow-up right now.");
      }

      followUpForm.reset();
      setFollowUpFeedback(`Follow-up saved for ${lead.full_name}.`, false);
      await loadDashboard();
    } catch (error) {
      setFollowUpFeedback(error?.message || "Unable to save the follow-up right now.", true);
    }
  }

  async function handleLeadConversion(event) {
    event.preventDefault();

    try {
      const formData = new FormData(convertLeadForm);
      const leadId = String(formData.get("leadId") || "").trim();
      const coachId = String(formData.get("coachId") || "").trim();
      const temporaryPassword = String(formData.get("temporaryPassword") || "").trim();

      if (!leadId || !temporaryPassword) {
        setConvertFeedback("Lead and temporary password are required.", true);
        return;
      }

      const selectedLead = dashboardState.leads.find((lead) => lead.id === leadId);
      if (!selectedLead) {
        setConvertFeedback("Select a valid lead before converting.", true);
        return;
      }

      if (!selectedLead.email) {
        setConvertFeedback("This lead is missing an email address, so an account cannot be created yet.", true);
        return;
      }

      setConvertFeedback("Converting lead into a client account...", false);

      const accessToken = await getAccessToken();
      const response = await fetch("/.netlify/functions/convert-lead-to-client", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          leadId,
          coachId: coachId || null,
          temporaryPassword,
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || "Unable to convert the lead right now.");
      }

      convertLeadForm.reset();
      setConvertFeedback(
        `Client account created for ${selectedLead.full_name}. Login email: ${payload.email}. Temporary password: ${payload.temporaryPassword}`,
        false
      );
      await loadDashboard();
    } catch (error) {
      setConvertFeedback(error?.message || "Unable to convert the lead right now.", true);
    }
  }

  async function handleLeadMessageSubmit(event) {
    event.preventDefault();

    try {
      const accessToken = await getAccessToken();
      const formData = new FormData(leadMessageForm);
      const leadId = String(formData.get("leadId") || "").trim();
      const channel = String(formData.get("channel") || "").trim();
      const subject = String(formData.get("subject") || "").trim();
      const message = String(formData.get("message") || "").trim();

      if (!leadId || !channel || !message) {
        setLeadMessageFeedback("Lead, channel, and message are required.", true);
        return;
      }

      const lead = dashboardState.leads.find((item) => item.id === leadId);
      if (!lead) {
        setLeadMessageFeedback("Select a valid lead before sending a message.", true);
        return;
      }

      let externalUrl = "";
      let handledRemotely = false;
      if (channel === "whatsapp") {
        const phone = normalizePhoneForWhatsApp(lead.phone);
        if (!phone) {
          setLeadMessageFeedback("This lead does not have a phone number for WhatsApp.", true);
          return;
        }
      } else if (channel === "email") {
        if (!lead.email) {
          setLeadMessageFeedback("This lead does not have an email address.", true);
          return;
        }

        externalUrl = `mailto:${encodeURIComponent(lead.email)}?subject=${encodeURIComponent(subject || "LEGACY+ Follow-Up")}&body=${encodeURIComponent(message)}`;
      }

      setLeadMessageFeedback("Logging lead message...", false);

      if (channel === "whatsapp") {
        handledRemotely = true;
        const accessToken = await getAccessToken();
        const response = await window.fetch("/.netlify/functions/send-whatsapp-message", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            leadId,
            subject,
            message,
          }),
        });

        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(payload?.error || "Unable to send the WhatsApp message right now.");
        }
      } else {
        const response = await window.fetch("/.netlify/functions/manage-leads", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            action: "log_message",
            leadId,
            channel,
            subject,
            message,
          }),
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(payload?.error || "Unable to log the lead message right now.");
        }
      }

      if (externalUrl) {
        window.open(externalUrl, "_blank", "noopener,noreferrer");
      }

      leadMessageForm.reset();
      setLeadMessageFeedback(
        channel === "note"
          ? `Internal note saved for ${lead.full_name}.`
          : handledRemotely
            ? `WhatsApp message sent and logged for ${lead.full_name}.`
            : `Message logged for ${lead.full_name}. The ${channel} draft opened in a new tab.`,
        false
      );
      await loadDashboard();
    } catch (error) {
      setLeadMessageFeedback(error?.message || "Unable to log the lead message right now.", true);
    }
  }

  async function reviewReward(rewardId, action) {
    try {
      const accessToken = await getAccessToken();
      setStatus(action === "approve" ? "Approving reward request..." : "Rejecting reward request...");

      const response = await window.fetch("/.netlify/functions/review-reward-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          rewardId,
          action,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error || "Unable to review the reward request right now.");
      }

      await loadDashboard();
    } catch (error) {
      setStatus(error?.message || "Unable to review the reward request right now.", true);
    }
  }

  async function updateCommissionPayout(recordId, nextStatus) {
    try {
      const { access, supabase } = await loadAccessAndClient();
      setStatus(
        nextStatus === "approved"
          ? "Approving commission for payout..."
          : nextStatus === "rejected"
            ? "Rejecting commission payout..."
          : "Marking commission as paid..."
      );

      const payload = {
        payout_status: nextStatus,
      };

      if (nextStatus === "approved") {
        payload.approved_by = access.user.id;
        payload.approved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("commission_records")
        .update(payload)
        .eq("id", recordId)
        .select("id, payout_status")
        .single();

      if (error) {
        throw error;
      }

      await loadDashboard();
    } catch (error) {
      setStatus(error?.message || "Unable to update commission payout status right now.", true);
    }
  }

  async function handleOrderAction(orderId, action) {
    if (action !== "refund") {
      return;
    }

    try {
      const accessToken = await getAccessToken();
      setFinancialFeedback("Refunding package order and closing the package balance...", false);

      const response = await window.fetch("/.netlify/functions/manage-order-financial", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          orderId,
          action: "refund_package_order",
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error || "Unable to update the order.");
      }

      setFinancialFeedback(payload?.message || "Order refunded successfully.", false);
      await loadDashboard();
    } catch (error) {
      setFinancialFeedback(error?.message || "Unable to refund that order right now.", true);
    }
  }

  function resetOperatingCostForm() {
    if (!operatingCostForm) {
      return;
    }

    operatingCostForm.reset();
    const idField = document.getElementById("admin-operating-cost-id");
    const monthField = document.getElementById("admin-operating-cost-month");
    if (idField) {
      idField.value = "";
    }
    if (monthField && !monthField.value) {
      monthField.value = new Date().toISOString().slice(0, 7);
    }
    setOperatingCostFeedback(
      "Add month-by-month actual cost entries here. These drive the operating cost ledger on this page.",
      false
    );
  }

  function prefillOperatingCostForm(entry) {
    if (!operatingCostForm || !entry) {
      return;
    }

    const idField = document.getElementById("admin-operating-cost-id");
    const monthField = document.getElementById("admin-operating-cost-month");
    const groupField = document.getElementById("admin-operating-cost-group");
    const categoryField = document.getElementById("admin-operating-cost-category");
    const amountField = document.getElementById("admin-operating-cost-amount");
    const notesField = document.getElementById("admin-operating-cost-notes");

    if (idField) idField.value = entry.id || "";
    if (monthField) monthField.value = String(entry.periodMonth || "").slice(0, 7);
    if (groupField) groupField.value = entry.costGroup || "";
    if (categoryField) categoryField.value = entry.category || "";
    if (amountField) amountField.value = Number(entry.amountRm || 0);
    if (notesField) notesField.value = entry.notes || "";

    setOperatingCostFeedback(`Editing ${entry.category} for ${formatMonthLabel(entry.periodMonth)}.`, false);
    operatingCostForm.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function handleOperatingCostSubmit(event) {
    event.preventDefault();

    try {
      const accessToken = await getAccessToken();
      const formData = new FormData(operatingCostForm);
      const entry = {
        id: String(formData.get("entry_id") || "").trim(),
        periodMonth: String(formData.get("period_month") || "").trim(),
        costGroup: String(formData.get("cost_group") || "").trim(),
        category: String(formData.get("category") || "").trim(),
        amountRm: Number(formData.get("amount_rm") || 0),
        notes: String(formData.get("notes") || "").trim(),
      };

      setOperatingCostFeedback("Saving operating cost entry...", false);

      const response = await window.fetch("/.netlify/functions/manage-operating-costs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          action: "upsert_entry",
          entry,
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error || "Unable to save the operating cost entry.");
      }

      resetOperatingCostForm();
      setOperatingCostFeedback(payload?.message || "Operating cost entry saved.", false);
      await loadDashboard();
    } catch (error) {
      setOperatingCostFeedback(error?.message || "Unable to save the operating cost entry right now.", true);
    }
  }

  async function deleteOperatingCostEntry(entryId) {
    if (!entryId) {
      return;
    }

    try {
      const accessToken = await getAccessToken();
      setOperatingCostFeedback("Deleting operating cost entry...", false);

      const response = await window.fetch("/.netlify/functions/manage-operating-costs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          action: "delete_entry",
          entryId,
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error || "Unable to delete the operating cost entry.");
      }

      resetOperatingCostForm();
      setOperatingCostFeedback(payload?.message || "Operating cost entry deleted.", false);
      await loadDashboard();
    } catch (error) {
      setOperatingCostFeedback(error?.message || "Unable to delete the operating cost entry right now.", true);
    }
  }

  function exportOrdersCsv() {
    if (!dashboardState.lastData) {
      setFinancialFeedback("Financial data is still loading.", true);
      return;
    }

    const data = dashboardState.lastData;
    const maps = buildMaps(data);
    const rows = (data.orders || []).map((order) => {
      const clientName = getOrderCustomerLabel(order, data, maps);
      const paymentStatus = maps.paymentByOrderId.get(order.id)?.status || order.status;
      return [
        formatDate(order.created_at),
        clientName,
        normalizeStatusLabel(order.order_type),
        Number(order.total_amount_rm || 0).toFixed(2),
        normalizeStatusLabel(order.status),
        normalizeStatusLabel(paymentStatus),
      ];
    });

    downloadCsv(
      `legacy-orders-${new Date().toISOString().slice(0, 10)}.csv`,
      ["Date", "Client", "Order Type", "Amount RM", "Order Status", "Payment Status"],
      rows
    );
    setFinancialFeedback("Orders CSV downloaded.", false);
  }

  function exportCommissionsCsv() {
    if (!dashboardState.lastData) {
      setStatus("Commission data is still loading.", true);
      return;
    }

    const data = dashboardState.lastData;
    const coachById = new Map((data.coaches || []).map((coach) => [coach.id, coach.display_name || "Coach"]));
    const rows = (data.commissions || [])
      .filter((record) => record.payout_status === "approved" || record.payout_status === "paid")
      .map((record) => [
        coachById.get(record.coach_id) || "Coach",
        formatDate(record.payout_month || record.created_at),
        Number(record.amount_rm || 0).toFixed(2),
        normalizeStatusLabel(record.payout_status),
      ]);

    downloadCsv(
      `legacy-commission-payouts-${new Date().toISOString().slice(0, 10)}.csv`,
      ["Coach", "Payout Month", "Amount RM", "Status"],
      rows
    );
    setStatus("Commission payout CSV downloaded.", false);
  }

  if (assignmentForm) {
    assignmentForm.addEventListener("submit", handleAssignmentSubmit);
  }

  if (adminCoachCodeForm) {
    adminCoachCodeForm.addEventListener("submit", (event) => {
      void submitAdminAuthCode(event, "coach");
    });
  }

  if (adminClientCodeForm) {
    adminClientCodeForm.addEventListener("submit", (event) => {
      void submitAdminAuthCode(event, "client");
    });
  }

  if (leadForm) {
    leadForm.addEventListener("submit", handleLeadSubmit);
  }

  if (followUpForm) {
    followUpForm.addEventListener("submit", handleFollowUpSubmit);
  }

  if (convertLeadForm) {
    convertLeadForm.addEventListener("submit", handleLeadConversion);
  }

  if (leadMessageForm) {
    leadMessageForm.addEventListener("submit", handleLeadMessageSubmit);
  }

  if (leadSearchNode) {
    leadSearchNode.addEventListener("input", () => {
      dashboardState.leadFilters.query = leadSearchNode.value || "";
      rerenderLeadViews();
    });
  }

  if (leadStatusFilterNode) {
    leadStatusFilterNode.addEventListener("change", () => {
      dashboardState.leadFilters.status = leadStatusFilterNode.value || "all";
      rerenderLeadViews();
    });
  }

  if (leadSourceFilterNode) {
    leadSourceFilterNode.addEventListener("change", () => {
      dashboardState.leadFilters.source = leadSourceFilterNode.value || "all";
      rerenderLeadViews();
    });
  }

  if (qaAccountsRefreshButton) {
    qaAccountsRefreshButton.addEventListener("click", () => {
      void loadQaAccountStatus({ force: true, silent: false });
    });
  }

  if (qaAccountsFormNode) {
    qaAccountsFormNode.addEventListener("submit", (event) => {
      void handleQaAccountProvision(event);
    });
  }

  if (leadRowsNode) {
    leadRowsNode.addEventListener("click", (event) => {
      const button = event.target.closest("[data-lead-action]");
      if (!button) {
        return;
      }

      const leadId = button.getAttribute("data-lead-id");
      const action = button.getAttribute("data-lead-action");
      const lead = dashboardState.leads.find((item) => item.id === leadId);
      if (!lead) {
        return;
      }

      if (action === "follow-up") {
        prefillFollowUpForm(lead);
        prefillLeadMessageForm(lead);
        setFollowUpFeedback(`Loaded ${lead.full_name} into the follow-up form.`, false);
        setLeadMessageFeedback(`Loaded ${lead.full_name} into the lead messaging form.`, false);
        return;
      }

      if (action === "convert") {
        prefillConvertForm(lead);
        setConvertFeedback(`Loaded ${lead.full_name} into the conversion form.`, false);
        prefillLeadMessageForm(lead);
        setLeadMessageFeedback(`Loaded ${lead.full_name} into the lead messaging form.`, false);
        return;
      }

    });
  }

  if (rewardRowsNode) {
    rewardRowsNode.addEventListener("click", (event) => {
      const button = event.target.closest("[data-reward-action]");
      if (!button) {
        return;
      }

      const rewardId = button.getAttribute("data-reward-id");
      const action = button.getAttribute("data-reward-action");
      if (!rewardId || (action !== "approve" && action !== "reject")) {
        return;
      }

      reviewReward(rewardId, action);
    });
  }

  if (commissionRowsNode) {
    commissionRowsNode.addEventListener("click", (event) => {
      const button = event.target.closest("[data-commission-action]");
      if (!button) {
        return;
      }

      const recordId = button.getAttribute("data-commission-id");
      const action = button.getAttribute("data-commission-action");
      if (!recordId || !["approve", "paid", "reject"].includes(action)) {
        return;
      }

      updateCommissionPayout(
        recordId,
        action === "approve" ? "approved" : action === "reject" ? "rejected" : "paid"
      );
    });
  }

  if (financialRowsNode) {
    financialRowsNode.addEventListener("click", (event) => {
      const documentButton = event.target.closest("[data-order-document]");
      if (documentButton) {
        const orderId = documentButton.getAttribute("data-order-id");
        const documentType = documentButton.getAttribute("data-order-document");
        if (!orderId || !documentType) {
          return;
        }

        openBillingDocument(orderId, documentType).catch((error) => {
          setFinancialFeedback(error?.message || "Unable to open the billing document right now.", true);
        });
        return;
      }

      const button = event.target.closest("[data-order-action]");
      if (!button) {
        return;
      }

      const orderId = button.getAttribute("data-order-id");
      const action = button.getAttribute("data-order-action");
      if (!orderId || action !== "refund") {
        return;
      }

      handleOrderAction(orderId, action);
    });
  }

  if (operatingCostForm) {
    operatingCostForm.addEventListener("submit", handleOperatingCostSubmit);
    resetOperatingCostForm();
  }

  if (operatingCostResetButton) {
    operatingCostResetButton.addEventListener("click", resetOperatingCostForm);
  }

  if (operatingCostFilterMonthNode) {
    operatingCostFilterMonthNode.addEventListener("change", () => {
      dashboardState.operatingCostFilters.month = operatingCostFilterMonthNode.value || "all";
      dashboardState.operatingCostPage = 1;
      if (dashboardState.lastData) {
        renderOperatingCostLedger(dashboardState.lastData);
      }
    });
  }

  if (operatingCostFilterGroupNode) {
    operatingCostFilterGroupNode.addEventListener("change", () => {
      dashboardState.operatingCostFilters.group = operatingCostFilterGroupNode.value || "all";
      dashboardState.operatingCostPage = 1;
      if (dashboardState.lastData) {
        renderOperatingCostLedger(dashboardState.lastData);
      }
    });
  }

  if (operatingCostFilterQueryNode) {
    operatingCostFilterQueryNode.addEventListener("input", () => {
      dashboardState.operatingCostFilters.query = operatingCostFilterQueryNode.value || "";
      dashboardState.operatingCostPage = 1;
      if (dashboardState.lastData) {
        renderOperatingCostLedger(dashboardState.lastData);
      }
    });
  }

  if (operatingCostPrevButton) {
    operatingCostPrevButton.addEventListener("click", () => {
      dashboardState.operatingCostPage = Math.max(1, Number(dashboardState.operatingCostPage || 1) - 1);
      if (dashboardState.lastData) {
        renderOperatingCostLedger(dashboardState.lastData);
      }
    });
  }

  if (operatingCostNextButton) {
    operatingCostNextButton.addEventListener("click", () => {
      dashboardState.operatingCostPage = Number(dashboardState.operatingCostPage || 1) + 1;
      if (dashboardState.lastData) {
        renderOperatingCostLedger(dashboardState.lastData);
      }
    });
  }

  if (operatingCostRowsNode) {
    operatingCostRowsNode.addEventListener("click", (event) => {
      const button = event.target.closest("[data-operating-cost-action]");
      if (!button || !dashboardState.lastData) {
        return;
      }

      const entryId = button.getAttribute("data-operating-cost-id");
      const action = button.getAttribute("data-operating-cost-action");
      const entry = (dashboardState.lastData.operatingCostEntries || []).find((item) => item.id === entryId);

      if (action === "edit" && entry) {
        prefillOperatingCostForm(entry);
        return;
      }

      if (action === "delete" && entryId) {
        deleteOperatingCostEntry(entryId);
      }
    });
  }

  if (coachManagementForm) {
    coachManagementForm.addEventListener("submit", handleCoachManagementSubmit);
  }

  if (coachRowsNode) {
    coachRowsNode.addEventListener("click", (event) => {
      const button = event.target.closest("[data-coach-manage-id]");
      if (!button) {
        return;
      }

      dashboardState.selectedCoachId = String(button.getAttribute("data-coach-manage-id") || "").trim();
      if (!dashboardState.selectedCoachId || !dashboardState.lastData) {
        return;
      }

      renderCoachManagement(dashboardState.lastData);
      coachManagementForm?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  if (coachSelectNode) {
    coachSelectNode.addEventListener("change", () => {
      dashboardState.selectedCoachId = String(coachSelectNode.value || "").trim();
      if (dashboardState.lastData) {
        renderCoachManagement(dashboardState.lastData);
      }
    });
  }

  if (coachApplyPresetsButton) {
    coachApplyPresetsButton.addEventListener("click", applyCoachPresetsToForm);
  }

  if (coachCompleteReviewButton) {
    coachCompleteReviewButton.addEventListener("click", completeCoachReview);
  }

  if (toggleCompPlanReferenceButton && compPlanReferenceNode) {
    toggleCompPlanReferenceButton.addEventListener("click", () => {
      const nextHidden = !compPlanReferenceNode.hidden;
      compPlanReferenceNode.hidden = nextHidden;
      toggleCompPlanReferenceButton.textContent = nextHidden ? "View Full Preset Data" : "Hide Full Preset Data";
    });
  }

  if (exportOrdersButton) {
    exportOrdersButton.addEventListener("click", exportOrdersCsv);
  }

  if (exportCommissionsButton) {
    exportCommissionsButton.addEventListener("click", exportCommissionsCsv);
  }

  if (gamificationImportRowsInputNode) {
    gamificationImportRowsInputNode.addEventListener("input", resetGamificationImportPreviewState);
  }

  if (gamificationImportBatchNode) {
    gamificationImportBatchNode.addEventListener("input", resetGamificationImportPreviewState);
  }

  if (gamificationImportPreviewButton) {
    gamificationImportPreviewButton.addEventListener("click", () => {
      requestGamificationSeedImport("preview");
    });
  }

  if (gamificationImportApplyButton) {
    gamificationImportApplyButton.addEventListener("click", () => {
      const hasFreshPreview =
        dashboardState.gamificationImportPreviewKey
        && dashboardState.gamificationImportPreviewKey === buildGamificationImportPreviewKey()
        && dashboardState.gamificationImportReadyCount > 0;
      if (!hasFreshPreview) {
        setGamificationImportFeedback("Preview the current batch first before applying the seed import.", true);
        syncGamificationImportApplyState();
        return;
      }
      requestGamificationSeedImport("apply");
    });
  }

  if (financeTransactionFiltersNode) {
    financeTransactionFiltersNode.addEventListener("click", (event) => {
      const button = event.target.closest("[data-finance-transaction-status]");
      if (!(button instanceof HTMLButtonElement)) {
        return;
      }

      dashboardState.financeTransactionStatus = button.getAttribute("data-finance-transaction-status") || "all";
      financeTransactionFiltersNode.querySelectorAll("[data-finance-transaction-status]").forEach((candidate) => {
        const isActive = candidate === button;
        candidate.classList.toggle("is-active", isActive);
        candidate.setAttribute("aria-pressed", String(isActive));
      });
      rerenderFinanceWorkspace();
    });
  }

  if (financeOverviewRangeNode) {
    financeOverviewRangeNode.addEventListener("click", (event) => {
      const button = event.target.closest("[data-finance-overview-range]");
      if (!(button instanceof HTMLButtonElement)) {
        return;
      }

      dashboardState.financeOverviewRange = button.getAttribute("data-finance-overview-range") === "live" ? "live" : "30d";
      rerenderFinanceWorkspace();
    });
  }

  if (financeReportFromNode) {
    financeReportFromNode.addEventListener("change", rerenderFinanceWorkspace);
  }

  if (financeReportToNode) {
    financeReportToNode.addEventListener("change", rerenderFinanceWorkspace);
  }

  if (financeReportCurrencyNode) {
    financeReportCurrencyNode.addEventListener("change", rerenderFinanceWorkspace);
  }

  if (financeReportOrderTypeNode) {
    financeReportOrderTypeNode.addEventListener("change", rerenderFinanceWorkspace);
  }

  if (financeReportViewTransactionsButton) {
    financeReportViewTransactionsButton.addEventListener("click", () => {
      activateFinancePanel("transactions");
    });
  }

  if (signOutButton) {
    signOutButton.addEventListener("click", async () => {
      if (window.legacyAuth) {
        await window.legacyAuth.signOut();
      }
      window.location.href = "https://www.legacycoaching.com.my/";
    });
  }

  ensureFinanceReportDefaults();
  bindFinanceWorkspaceNavigation();
  renderCompPlanReference();
  initializeGamificationImportUi();
  renderCodexBundleAddon();
  loadDashboard();
})();
