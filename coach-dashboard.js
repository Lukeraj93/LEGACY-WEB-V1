(function initCoachDashboard() {
  const statusNode = document.getElementById("coach-dashboard-status");
  const rosterNode = document.getElementById("coach-client-roster");
  const pointsForm = document.getElementById("coach-points-form");
  const pointsClientSelect = document.getElementById("coach-points-client");
  const pointsModeSelect = document.getElementById("coach-points-mode");
  const pointsActionSelect = document.getElementById("coach-points-action");
  const pointsBundleStatusNode = document.getElementById("coach-points-bundle-status");
  const pointsActionPreviewNode = document.getElementById("coach-points-action-preview");
  const pointsBundleFieldsNode = document.getElementById("coach-points-bundle-fields");
  const pointsManualFieldsNode = document.getElementById("coach-points-manual-fields");
  const pointsFeedbackNode = document.getElementById("coach-points-feedback");
  const packageRowsNode = document.getElementById("coach-package-rows");
  const sessionRowsNode = document.getElementById("coach-session-rows");
  const sessionNoteOverlayNode = document.getElementById("coach-session-note-overlay");
  const sessionNoteEyebrowNode = document.getElementById("coach-session-note-eyebrow");
  const sessionNoteTitleNode = document.getElementById("coach-session-note-title");
  const sessionNoteIntroNode = document.getElementById("coach-session-note-intro");
  const sessionNoteClientNode = document.getElementById("coach-session-note-client");
  const sessionNoteTypeNode = document.getElementById("coach-session-note-type");
  const sessionNoteWhenNode = document.getElementById("coach-session-note-when");
  const sessionNoteStatusNode = document.getElementById("coach-session-note-status");
  const sessionNoteRewardNode = document.getElementById("coach-session-note-reward");
  const sessionNoteExistingNode = document.getElementById("coach-session-note-existing");
  const sessionNoteForm = document.getElementById("coach-session-note-form");
  const sessionNoteField = document.getElementById("coach-session-note-field");
  const sessionNextStepField = document.getElementById("coach-session-next-step-field");
  const sessionNoteFeedbackNode = document.getElementById("coach-session-note-feedback");
  const sessionNoteEditButton = document.getElementById("coach-session-note-edit");
  const sessionNoteSubmitButton = document.getElementById("coach-session-note-submit");
  const pointsRowsNode = document.getElementById("coach-points-rows");
  const bookingRequestRowsNode = document.getElementById("coach-booking-request-rows");
  const commissionRowsNode = document.getElementById("coach-commission-rows");
  const commissionMonthGridNode = document.getElementById("coach-commission-month-grid");
  const commissionDetailPeriodNode = document.getElementById("coach-commission-detail-period");
  const availabilityForm = document.getElementById("coach-availability-form");
  const availabilityRowsNode = document.getElementById("coach-availability-rows");
  const availabilityFeedbackNode = document.getElementById("coach-availability-feedback");
  const liveAvailabilityCalendarNode = document.getElementById("coach-live-availability-calendar");
  const liveAvailabilityFeedbackNode = document.getElementById("coach-live-availability-feedback");
  const sessionChangeRequestRowsNode = document.getElementById("coach-session-change-request-rows");
  const calendarStatusNode = document.getElementById("coach-calendar-sync-status");
  const calendarEmailNode = document.getElementById("coach-calendar-email");
  const calendarFeedbackNode = document.getElementById("coach-calendar-feedback");
  const calendarConnectButton = document.getElementById("coach-calendar-connect");
  const calendarDisconnectButton = document.getElementById("coach-calendar-disconnect");
  const accountEmailNodes = Array.from(document.querySelectorAll("[data-account-email]"));
  const coachKpiPositionNode = document.getElementById("coach-kpi-position");
  const coachKpiTierNode = document.getElementById("coach-kpi-tier");
  const coachKpiHoursNode = document.getElementById("coach-kpi-hours");
  const coachKpiReviewDateNode = document.getElementById("coach-kpi-review-date");
  const coachKpiListNode = document.getElementById("coach-kpi-list");
  const coachCompPlanListNode = document.getElementById("coach-comp-plan-list");
  const coachKpiReviewNoteNode = document.getElementById("coach-kpi-review-note");
  const profilePassportNode = document.getElementById("coach-profile-passport");
  const profilePassportNameNode = document.getElementById("coach-profile-passport-name");
  const profilePassportNoteNode = document.getElementById("coach-profile-passport-note");
  const profileNameMainNode = document.getElementById("coach-profile-name-main");
  const profileRoleNode = document.getElementById("coach-profile-role");
  const profileNoteMainNode = document.getElementById("coach-profile-note-main");
  const profileSummaryMetricsNode = document.getElementById("coach-profile-summary-metrics");
  const profileSummaryBarsNode = document.getElementById("coach-profile-summary-bars");
  const profilePortraitNode = document.getElementById("coach-profile-portrait");
  const profilePortraitNameNode = document.getElementById("coach-profile-portrait-name");
  const profilePortraitTaglineNode = document.getElementById("coach-profile-portrait-tagline");
  const profilePortraitNoteNode = document.getElementById("coach-profile-portrait-note");
  const profileActiveClientsNode = document.getElementById("coach-profile-active-clients");
  const profileRateNode = document.getElementById("coach-profile-rate");
  const profileMonthlyCommissionNode = document.getElementById("coach-profile-monthly-commission");
  const profileReviewDueNode = document.getElementById("coach-profile-review-due");
  const profileProgressBarsNode = document.getElementById("coach-profile-progress-bars");
  const profilePerformanceStripNode = document.getElementById("coach-profile-performance-strip");
  const profileRosterRowsNode = document.getElementById("coach-profile-roster-rows");
  const profileSessionRowsNode = document.getElementById("coach-profile-session-rows");
  const profileCommissionRowsNode = document.getElementById("coach-profile-commission-rows");
  const profileOpsListNode = document.getElementById("coach-profile-ops-list");
  const coachLeaderboardRowsNode = document.getElementById("coach-leaderboard-rows");
  const coachClientsTabs = Array.from(document.querySelectorAll("[data-coach-clients-tab]"));
  const coachClientsPanels = Array.from(document.querySelectorAll("[data-coach-clients-panel]"));
  const consultStatNewNode = document.getElementById("coach-consult-stat-new");
  const consultStatContactedNode = document.getElementById("coach-consult-stat-contacted");
  const consultStatQualifiedNode = document.getElementById("coach-consult-stat-qualified");
  const consultStatConvertedNode = document.getElementById("coach-consult-stat-converted");
  const consultStatGhostedNode = document.getElementById("coach-consult-stat-ghosted");
  const consultStatOverdueNode = document.getElementById("coach-consult-stat-overdue");
  const consultForm = document.getElementById("coach-consult-form");
  const consultFeedbackNode = document.getElementById("coach-consult-feedback");
  const consultFollowUpForm = document.getElementById("coach-consult-follow-up-form");
  const consultLeadSelect = document.getElementById("coach-consult-lead");
  const consultFollowUpFeedbackNode = document.getElementById("coach-consult-follow-up-feedback");
  const consultRowsNode = document.getElementById("coach-consult-rows");
  const clientCodeForm = document.getElementById("coach-client-code-form");
  const clientCodeFeedbackNode = document.getElementById("coach-client-code-feedback");
  const clientCodeRowsNode = document.getElementById("coach-client-code-rows");
  const coachPayoutForm = document.getElementById("coach-payout-form");
  const coachPayoutFeedbackNode = document.getElementById("coach-payout-feedback");
  const coachOpsBriefCardNode = document.getElementById("coach-ops-brief-card");
  const coachOpsSummaryGridNode = document.getElementById("coach-ops-summary-grid");
  const coachOpsSegmentStackNode = document.getElementById("coach-ops-segment-stack");
  const coachOpsIntelligenceGridNode = document.getElementById("coach-ops-intelligence-grid");
  const coachOpsFocusStackNode = document.getElementById("coach-ops-focus-stack");
  const DASHBOARD_PAGE_KEY = document.body?.dataset?.accountPage || "home";
  const DASHBOARD_CACHE_KEY = "legacy-coach-dashboard-cache:v3";
  const DASHBOARD_CACHE_TTL_MS = 90 * 1000;
  const DASHBOARD_REFRESH_DEBOUNCE_MS = 180;
  const COACH_SESSION_CHECKIN_OPEN_EARLY_MS = 30 * 60 * 1000;
  const COACH_DEFERRED_SECONDARY_PAGES = new Set(["home", "clients"]);
  const COACH_REALTIME_TABLES = [
    "coach_profiles",
    "coach_client_assignments",
    "profiles",
    "client_profiles",
    "client_packages",
    "booking_requests",
    "points_ledger",
    "sessions",
    "coach_availability_windows",
    "session_change_requests",
    "commission_records",
    "leads",
    "lead_activities",
    "coach_consult_intakes",
    "activation_codes",
  ];

  const dashboardState = {
    access: null,
    supabase: null,
    assignments: [],
    clients: [],
    clientPackages: [],
    bookingRequests: [],
    sessions: [],
    availabilityWindows: [],
    sessionChangeRequests: [],
    lastData: null,
    loadInFlight: false,
    refreshTimer: 0,
    pendingRefreshReason: "",
    pendingRefreshSilent: true,
    liveBindingsReady: false,
    realtimeChannel: null,
    realtimeSubscriptionKey: "",
    liveCoachAvailability: null,
    liveCoachAvailabilityKey: "",
    leads: [],
    leadActivities: [],
    consultIntakes: [],
    activationCodes: [],
    coachOpsBrief: null,
    selectedCommissionMonth: "",
    loadCycleId: 0,
    deferredHydrationInFlight: false,
    sessionNoteOverlay: {
      isOpen: false,
      sessionId: "",
      mode: "",
      triggerButton: null,
    },
    clientWorkspacePanel:
      coachClientsTabs.find((button) => button.classList.contains("is-active"))?.dataset.coachClientsTab || "roster",
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

  function buildEmptyDashboardData() {
    return {
      access: dashboardState.access || null,
      profile: null,
      coachProfile: null,
      homeSummary: null,
      homeDetailsLoaded: true,
      clientWorkspaceDetailsLoaded: true,
      assignments: [],
      clientProfiles: [],
      clientProfileDetails: [],
      clientPackages: [],
      bookingRequests: [],
      pointsLedger: [],
      sessions: [],
      availabilityWindows: [],
      sessionChangeRequests: [],
      commissions: [],
      commissionSessions: [],
      leads: [],
      leadActivities: [],
      consultIntakes: [],
      activationCodes: [],
      coachLeaderboard: [],
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

  function buildSkeletonStack(widths, modifier = "copy", compact = false) {
    return `
      <div class="dashboard-skeleton-stack${compact ? " dashboard-skeleton-stack--compact" : ""}">
        ${widths.map((width) => buildSkeletonLine(width, modifier)).join("")}
      </div>
    `;
  }

  function buildSkeletonStat(valueWidth = "58%", noteWidths = ["94%", "72%"]) {
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
            ${buildSkeletonLine(index === labels.length - 1 ? "70%" : "100%", index === 0 ? "title" : "copy")}
          </td>
        `).join("")}
      </tr>
    `).join("");
  }

  function buildSkeletonListItems(count = 3) {
    return Array.from({ length: count }, () => `
      <li class="dashboard-skeleton-list-item">
        ${buildSkeletonStack(["54%", "88%", "64%"], "copy")}
      </li>
    `).join("");
  }

  function buildCoachLeaderboardSkeleton(rowCount = 3) {
    return Array.from({ length: rowCount }, () => `
      <article class="leaderboard-row">
        <div class="leaderboard-row__rank">${buildSkeletonLine("26px", "metric")}</div>
        <div class="leaderboard-row__avatar" aria-hidden="true">
          <span class="dashboard-skeleton-avatar dashboard-skeleton-avatar--sm"></span>
        </div>
        <div class="leaderboard-row__body">
          <div class="leaderboard-row__head">
            <strong>${buildSkeletonLine("52%", "title")}</strong>
            <span>${buildSkeletonLine("44%", "label")}</span>
          </div>
          ${buildSkeletonStack(["94%", "72%"], "copy")}
        </div>
        <div class="leaderboard-row__metrics leaderboard-row__metrics--coach">
          <div>
            <span>${buildSkeletonLine("46px", "label")}</span>
            <strong>${buildSkeletonLine("42px", "metric")}</strong>
          </div>
          <div>
            <span>${buildSkeletonLine("52px", "label")}</span>
            <strong>${buildSkeletonLine("48px", "metric")}</strong>
          </div>
          <div>
            <span>${buildSkeletonLine("68px", "label")}</span>
            <strong>${buildSkeletonLine("64px", "metric")}</strong>
          </div>
        </div>
      </article>
    `).join("");
  }

  function renderInitialDashboardSkeleton() {
    if (DASHBOARD_PAGE_KEY === "clients") {
      if (rosterNode) {
        rosterNode.innerHTML = buildSkeletonListItems(3);
      }
      if (packageRowsNode) {
        packageRowsNode.innerHTML = buildSkeletonTableRows(["Client", "Package", "Sessions", "Validity", "Usage Status"], 3);
      }
      if (pointsRowsNode) {
        pointsRowsNode.innerHTML = buildSkeletonTableRows(["Client", "Current Points", "Points This Week", "Milestone"], 3);
      }
      if (consultRowsNode) {
        consultRowsNode.innerHTML = buildSkeletonTableRows(["Lead", "Status", "Heat", "Goal", "Next Step", "Follow Up"], 4);
      }
      if (clientCodeRowsNode) {
        clientCodeRowsNode.innerHTML = buildSkeletonTableRows(["Client Email", "Code", "Status", "Expires", "Created"], 4);
      }
      return;
    }

    if (DASHBOARD_PAGE_KEY !== "home") {
      return;
    }

    const clientLoadStat = buildSkeletonStat("42%", ["88%", "64%"]);
    const sessionStat = buildSkeletonStat("48%", ["94%", "68%"]);
    const commissionStat = buildSkeletonStat("54%", ["92%", "62%"]);
    const rewardStat = buildSkeletonStat("40%", ["90%", "58%"]);

    const statClientsNode = document.getElementById("coach-stat-clients");
    const statClientsNoteNode = document.getElementById("coach-stat-clients-note");
    const statSessionsNode = document.getElementById("coach-stat-sessions");
    const statSessionsNoteNode = document.getElementById("coach-stat-sessions-note");
    const statCommissionNode = document.getElementById("coach-stat-commission");
    const statCommissionNoteNode = document.getElementById("coach-stat-commission-note");
    const statPointsNode = document.getElementById("coach-stat-points");
    const statPointsNoteNode = document.getElementById("coach-stat-points-note");

    if (statClientsNode) statClientsNode.innerHTML = clientLoadStat.value;
    if (statClientsNoteNode) statClientsNoteNode.innerHTML = clientLoadStat.note;
    if (statSessionsNode) statSessionsNode.innerHTML = sessionStat.value;
    if (statSessionsNoteNode) statSessionsNoteNode.innerHTML = sessionStat.note;
    if (statCommissionNode) statCommissionNode.innerHTML = commissionStat.value;
    if (statCommissionNoteNode) statCommissionNoteNode.innerHTML = commissionStat.note;
    if (statPointsNode) statPointsNode.innerHTML = rewardStat.value;
    if (statPointsNoteNode) statPointsNoteNode.innerHTML = rewardStat.note;

    if (bookingRequestRowsNode) {
      bookingRequestRowsNode.innerHTML = buildSkeletonTableRows(["Date", "Time", "Client", "Request", "Status", "Action"], 3);
    }
    if (rosterNode) {
      rosterNode.innerHTML = buildSkeletonListItems(3);
    }
    if (sessionRowsNode) {
      sessionRowsNode.innerHTML = buildSkeletonTableRows(["Date", "Time", "Session", "Client", "Status", "Action"], 3);
    }
    if (coachKpiPositionNode) coachKpiPositionNode.innerHTML = buildSkeletonLine("72%", "metric");
    if (coachKpiTierNode) coachKpiTierNode.innerHTML = buildSkeletonLine("58%", "metric");
    if (coachKpiHoursNode) coachKpiHoursNode.innerHTML = buildSkeletonLine("68%", "metric");
    if (coachKpiReviewDateNode) coachKpiReviewDateNode.innerHTML = buildSkeletonLine("66%", "metric");
    if (coachKpiListNode) {
      coachKpiListNode.innerHTML = buildSkeletonListItems(3);
    }
    if (coachCompPlanListNode) {
      coachCompPlanListNode.innerHTML = buildSkeletonListItems(3);
    }
    if (coachLeaderboardRowsNode) {
      coachLeaderboardRowsNode.innerHTML = buildCoachLeaderboardSkeleton(3);
    }
  }

  function setPointsFeedback(message, isError) {
    if (!pointsFeedbackNode) {
      return;
    }

    pointsFeedbackNode.textContent = message || "";
    pointsFeedbackNode.style.color = isError ? "#ffb3b3" : "";
  }

  function setAvailabilityFeedback(message, isError) {
    if (!availabilityFeedbackNode) {
      return;
    }

    availabilityFeedbackNode.textContent = message || "";
    availabilityFeedbackNode.style.color = isError ? "#ffb3b3" : "";
  }

  function setCalendarFeedback(message, isError) {
    if (!calendarFeedbackNode) {
      return;
    }

    calendarFeedbackNode.textContent = message || "";
    calendarFeedbackNode.style.color = isError ? "#ffb3b3" : "";
  }

  function setConsultFeedback(message, isError) {
    if (!consultFeedbackNode) {
      return;
    }

    consultFeedbackNode.textContent = message || "";
    consultFeedbackNode.style.color = isError ? "#ffb3b3" : "";
  }

  function setConsultFollowUpFeedback(message, isError) {
    if (!consultFollowUpFeedbackNode) {
      return;
    }

    consultFollowUpFeedbackNode.textContent = message || "";
    consultFollowUpFeedbackNode.style.color = isError ? "#ffb3b3" : "";
  }

  function setClientCodeFeedback(message, isError) {
    if (!clientCodeFeedbackNode) {
      return;
    }

    clientCodeFeedbackNode.textContent = message || "";
    clientCodeFeedbackNode.style.color = isError ? "#ffb3b3" : "";
  }

  function setPayoutFeedback(message, isError) {
    if (!coachPayoutFeedbackNode) {
      return;
    }

    coachPayoutFeedbackNode.textContent = message || "";
    coachPayoutFeedbackNode.style.color = isError ? "#ffb3b3" : "";
  }

  function setSessionNoteFeedback(message, isError) {
    if (!sessionNoteFeedbackNode) {
      return;
    }

    sessionNoteFeedbackNode.textContent = message || "";
    sessionNoteFeedbackNode.style.color = isError ? "#ffb3b3" : "";
  }

  function setTone(node, tone) {
    const card = node?.closest("[data-crm-tone], .stat, .card, .account-quick-card, .dashboard-note, .package-card, .section");
    if (!card) {
      return;
    }

    const normalizedTone =
      document.body?.dataset?.requiredRole === "coach" && document.body?.dataset?.accountPage ? "neutral" : tone;

    if (normalizedTone) {
      card.setAttribute("data-crm-tone", normalizedTone);
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

  function shouldDeferSecondaryPayload() {
    return COACH_DEFERRED_SECONDARY_PAGES.has(DASHBOARD_PAGE_KEY);
  }

  function isClientWorkspaceDetailsPending(data) {
    return DASHBOARD_PAGE_KEY === "clients" && data?.clientWorkspaceDetailsLoaded === false;
  }

  function findSessionById(sessionId) {
    return (dashboardState.sessions || []).find((item) => item.id === sessionId) || null;
  }

  function sessionHasCoachNotes(session) {
    return Boolean(String(session?.coach_note || "").trim() && String(session?.coach_next_step || "").trim());
  }

  function sessionHasCoachCheckedIn(session) {
    return Boolean(String(session?.coach_check_in_at || "").trim());
  }

  function getSessionCheckInOpensAt(session) {
    const scheduledStart = new Date(session?.scheduled_start || 0).getTime();
    if (Number.isNaN(scheduledStart) || scheduledStart <= 0) {
      return null;
    }

    return new Date(scheduledStart - COACH_SESSION_CHECKIN_OPEN_EARLY_MS);
  }

  function canCoachCheckInSession(session) {
    if (!session || session.status !== "scheduled" || sessionHasCoachCheckedIn(session)) {
      return false;
    }

    const opensAt = getSessionCheckInOpensAt(session);
    return Boolean(opensAt && Date.now() >= opensAt.getTime());
  }

  function canCoachCompleteScheduledSession(session) {
    if (!session || session.status !== "scheduled") {
      return false;
    }

    const scheduledStart = new Date(session.scheduled_start || 0).getTime();
    return !Number.isNaN(scheduledStart) && scheduledStart <= Date.now();
  }

  function buildSessionCheckInLabel(session) {
    if (sessionHasCoachCheckedIn(session)) {
      const recordedAt = session?.coach_check_in_at ? formatTime(session.coach_check_in_at) : "";
      const timingLabel = session?.coach_attendance_status === "late" ? "Late" : "On Time";
      return recordedAt ? `Checked In ${recordedAt} • ${timingLabel}` : `Checked In • ${timingLabel}`;
    }

    const opensAt = getSessionCheckInOpensAt(session);
    if (!opensAt) {
      return "Waiting for Session";
    }

    return `Opens ${formatTime(opensAt)}`;
  }

  function getSessionTypeLabel(session) {
    const request = (dashboardState.bookingRequests || []).find((item) => item.id === session?.booking_request_id);
    return request ? requestTypeFromNotes(request.notes) : "Coaching Session";
  }

  function normalizeSessionNoteMode(mode, session) {
    const normalizedMode = String(mode || "").trim().toLowerCase();
    if (!session?.id) {
      return "";
    }

    if (normalizedMode === "complete" && session.status === "scheduled") {
      return "complete";
    }

    if (normalizedMode === "view" && session.status === "completed" && sessionHasCoachNotes(session)) {
      return "view";
    }

    if ((normalizedMode === "add" || normalizedMode === "edit") && session.status === "completed") {
      return normalizedMode;
    }

    if (session.status === "scheduled") {
      return "complete";
    }

    if (session.status === "completed" && sessionHasCoachNotes(session)) {
      return "view";
    }

    if (session.status === "completed") {
      return "add";
    }

    return "";
  }

  function buildSessionNoteRewardMessage(session) {
    const deadlineBase = new Date(session?.completed_at || session?.scheduled_end || 0).getTime();
    const deadline = Number.isFinite(deadlineBase) && deadlineBase > 0
      ? new Date(deadlineBase + 24 * 60 * 60 * 1000)
      : null;

    if (session?.status === "scheduled") {
      return "Completing now will log the session and its commission. Add clear notes so the next step is immediately usable.";
    }

    if (sessionHasCoachNotes(session)) {
      const recordedLabel = session?.coach_note_recorded_at
        ? `Saved ${formatDateTime(session.coach_note_recorded_at)}.`
        : "Notes saved.";

      if (!deadline) {
        return recordedLabel;
      }

      const recordedAt = new Date(session.coach_note_recorded_at || 0).getTime();
      const qualified = Number.isFinite(recordedAt) && recordedAt <= deadline.getTime();
      return qualified
        ? `${recordedLabel} Recorded inside the 24-hour COA-NOTE window.`
        : `${recordedLabel} Recorded after the 24-hour COA-NOTE window.`;
    }

    if (!deadline) {
      return "Save the coaching takeaway and next step so the client handoff stays clear.";
    }

    return Date.now() <= deadline.getTime()
      ? `Save notes by ${formatDateTime(deadline)} to qualify for COA-NOTE.`
      : "The 24-hour COA-NOTE window has passed, but notes should still be recorded for continuity.";
  }

  function focusSessionNoteDrawer(mode) {
    if (mode === "view") {
      sessionNoteEditButton?.focus();
      return;
    }

    sessionNoteField?.focus();
  }

  function updateSessionNoteOverlay(options = {}) {
    if (!sessionNoteOverlayNode || !sessionNoteForm) {
      return;
    }

    const session = findSessionById(dashboardState.sessionNoteOverlay.sessionId);
    if (!session?.id) {
      closeSessionNoteOverlay({ restoreFocus: false });
      return;
    }

    const mode = normalizeSessionNoteMode(dashboardState.sessionNoteOverlay.mode, session);
    if (!mode) {
      closeSessionNoteOverlay({ restoreFocus: false });
      return;
    }

    const editable = mode !== "view";
    const hasNotes = sessionHasCoachNotes(session);
    const clientMap = buildClientMaps(dashboardState.lastData || buildEmptyDashboardData());
    const client = clientMap.get(session.client_id);
    const clientName = client?.displayName || "Client";
    const noteStatusLabel =
      session.status === "scheduled"
        ? "Awaiting completion"
        : hasNotes
          ? session.coach_note_recorded_at
            ? `Saved ${formatDateTime(session.coach_note_recorded_at)}`
            : "Notes saved"
          : "Notes still missing";

    dashboardState.sessionNoteOverlay.mode = mode;
    sessionNoteForm.dataset.mode = mode;
    sessionNoteForm.dataset.sessionId = session.id;
    sessionNoteForm.classList.toggle("is-readonly", !editable);

    if (sessionNoteEyebrowNode) {
      sessionNoteEyebrowNode.textContent = mode === "complete" ? "Session Completion" : "Session Notes";
    }
    if (sessionNoteTitleNode) {
      sessionNoteTitleNode.textContent =
        mode === "complete"
          ? "Complete session with notes"
          : mode === "edit"
            ? "Update coaching notes"
            : mode === "add"
              ? "Add coaching notes"
              : "Session notes";
    }
    if (sessionNoteIntroNode) {
      sessionNoteIntroNode.textContent =
        mode === "complete"
          ? "Close the session, capture the coaching takeaway, and define the next step in one submission."
          : mode === "view"
            ? "Review the saved coaching takeaway and the next action planned for the client."
            : "Document what happened in the session and what the client should do next.";
    }
    if (sessionNoteClientNode) {
      sessionNoteClientNode.textContent = clientName;
    }
    if (sessionNoteTypeNode) {
      sessionNoteTypeNode.textContent = getSessionTypeLabel(session);
    }
    if (sessionNoteWhenNode) {
      sessionNoteWhenNode.textContent = `${formatDate(session.scheduled_start)} • ${formatTime(session.scheduled_start)} - ${formatTime(session.scheduled_end)}`;
    }
    if (sessionNoteStatusNode) {
      sessionNoteStatusNode.textContent = noteStatusLabel;
    }
    if (sessionNoteRewardNode) {
      sessionNoteRewardNode.textContent = buildSessionNoteRewardMessage(session);
    }
    if (sessionNoteExistingNode) {
      sessionNoteExistingNode.textContent =
        session.status === "completed"
          ? `Completed ${formatDateTime(session.completed_at || session.scheduled_end)}`
          : `Scheduled to end ${formatDateTime(session.scheduled_end)}`;
    }
    const preserveDraft = options.preserveDraft === true && editable;
    if (sessionNoteField) {
      if (!preserveDraft) {
        sessionNoteField.value = String(session.coach_note || "");
      }
      sessionNoteField.readOnly = !editable;
      sessionNoteField.required = editable;
    }
    if (sessionNextStepField) {
      if (!preserveDraft) {
        sessionNextStepField.value = String(session.coach_next_step || "");
      }
      sessionNextStepField.readOnly = !editable;
      sessionNextStepField.required = editable;
    }
    if (sessionNoteEditButton) {
      sessionNoteEditButton.hidden = mode !== "view";
    }
    if (sessionNoteSubmitButton) {
      sessionNoteSubmitButton.hidden = mode === "view";
      sessionNoteSubmitButton.textContent =
        mode === "complete"
          ? "Complete Session"
          : mode === "edit"
            ? "Update Notes"
            : "Save Notes";
    }
  }

  function openSessionNoteOverlay(sessionId, mode, triggerButton = null) {
    if (!sessionNoteOverlayNode || !sessionNoteForm) {
      return;
    }

    dashboardState.sessionNoteOverlay = {
      isOpen: true,
      sessionId,
      mode,
      triggerButton: triggerButton instanceof HTMLElement ? triggerButton : null,
    };
    sessionNoteOverlayNode.hidden = false;
    sessionNoteOverlayNode.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-session-note-open");
    setSessionNoteFeedback("", false);
    updateSessionNoteOverlay();
    window.setTimeout(() => focusSessionNoteDrawer(dashboardState.sessionNoteOverlay.mode), 0);
  }

  function closeSessionNoteOverlay(options = {}) {
    if (!sessionNoteOverlayNode) {
      return;
    }

    const restoreFocus = options.restoreFocus !== false;
    const triggerButton = dashboardState.sessionNoteOverlay.triggerButton;
    dashboardState.sessionNoteOverlay = {
      isOpen: false,
      sessionId: "",
      mode: "",
      triggerButton: null,
    };
    sessionNoteOverlayNode.hidden = true;
    sessionNoteOverlayNode.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-session-note-open");
    setSessionNoteFeedback("", false);
    if (restoreFocus && triggerButton instanceof HTMLElement) {
      window.setTimeout(() => triggerButton.focus(), 0);
    }
  }

  function promoteSessionNoteOverlayToEdit() {
    const session = findSessionById(dashboardState.sessionNoteOverlay.sessionId);
    if (!session?.id || session.status !== "completed") {
      return;
    }

    dashboardState.sessionNoteOverlay.mode = "edit";
    updateSessionNoteOverlay();
    window.setTimeout(() => focusSessionNoteDrawer("edit"), 0);
  }

  function syncSessionNoteOverlay() {
    if (!dashboardState.sessionNoteOverlay.isOpen) {
      return;
    }

    updateSessionNoteOverlay({ preserveDraft: true });
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
    const subscriptionKey = `${access.user.id}:${DASHBOARD_PAGE_KEY}:${COACH_REALTIME_TABLES.join(",")}`;
    if (dashboardState.realtimeSubscriptionKey === subscriptionKey && dashboardState.realtimeChannel) {
      return;
    }

    teardownRealtimeDashboardRefresh();

    let channel = supabase.channel(`legacy-coach-live:${DASHBOARD_PAGE_KEY}:${access.user.id}`);
    COACH_REALTIME_TABLES.forEach((table) => {
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

  function compactPackageLabel(value) {
    const source = String(value || "").trim();
    if (!source) {
      return "Package";
    }

    const commitment = /extended track/iu.test(source) ? "EXT" : /subscription/iu.test(source) ? "SUB" : "";
    const format = /1(?:-|\s*to\s*)2/iu.test(source) ? "1:2" : /1(?:-|\s*to\s*)1/iu.test(source) ? "1:1" : "";
    const tier = /apprentice/iu.test(source)
      ? "T1"
      : /performance coach/iu.test(source)
        ? "T3"
        : /specialist/iu.test(source)
          ? "T4"
          : /\bcoach\b/iu.test(source)
            ? "T2"
            : "";
    const sessions = source.match(/(\d+)\s*sessions?/iu)?.[1] || "";
    const compactParts = [commitment, format, tier, sessions ? `${sessions}S` : ""].filter(Boolean);

    if (compactParts.length) {
      return compactParts.join(" • ");
    }

    return source
      .replace(/personal training/giu, "PT")
      .replace(/sessions?/giu, "S")
      .replace(/\s+/gu, " ")
      .trim();
  }

  function buildCompactRequestMarkup(requestLabel, packageLabel) {
    return `
      <div class="dashboard-request-cell">
        <strong>${escapeHtml(compactRequestLabel(requestLabel))}</strong>
        <small>${escapeHtml(compactPackageLabel(packageLabel))}</small>
      </div>
    `;
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

  function getInitials(value) {
    const parts = String(value || "")
      .trim()
      .split(/\s+/u)
      .filter(Boolean)
      .slice(0, 2);
    if (!parts.length) {
      return "--";
    }
    return parts.map((part) => part.charAt(0).toUpperCase()).join("");
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

  function resolveCoachAvatarUrl(data, displayName) {
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

  function renderCardList(node, items, options = {}) {
    if (!node) {
      return;
    }

    node.classList.add("dashboard-list--cards");
    node.innerHTML = items.length
      ? items
          .map((item) => `
            <li>
              <article class="dashboard-list-card${item.empty ? " dashboard-list-card--empty" : ""}">
                <div class="dashboard-list-card__head">
                  <strong>${escapeHtml(item.title)}</strong>
                  ${item.chip ? `<span class="dashboard-list-card__chip">${escapeHtml(item.chip)}</span>` : ""}
                </div>
                <p>${escapeHtml(item.body)}</p>
                ${Array.isArray(item.meta) && item.meta.length
                  ? `<div class="dashboard-list-card__meta">${item.meta.map((value) => `<span>${escapeHtml(value)}</span>`).join("")}</div>`
                  : ""}
              </article>
            </li>
          `)
          .join("")
      : `
          <li>
            <article class="dashboard-list-card dashboard-list-card--empty">
              <div class="dashboard-list-card__head">
                <strong>${escapeHtml(options.emptyTitle || "No live items yet")}</strong>
                ${options.emptyChip ? `<span class="dashboard-list-card__chip">${escapeHtml(options.emptyChip)}</span>` : ""}
              </div>
              <p>${escapeHtml(options.emptyBody || "This section will populate as live coaching data starts landing.")}</p>
            </article>
          </li>
        `;
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
      month: "short",
      day: "numeric",
    }).format(date);
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

    const date = new Date();
    date.setHours(Number(match[1]), Number(match[2]), 0, 0);
    return new Intl.DateTimeFormat("en-MY", {
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  }

  function formatMonthLabel(value) {
    if (!value) {
      return "Unscheduled";
    }

    const date = new Date(value);
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
      rewards.push(`${formatNumber(action.xp)} XP`);
    }
    if (Number(action?.coins || 0) > 0) {
      rewards.push(`${formatNumber(action.coins)} Coins`);
    }
    return rewards.length ? rewards.join(" + ") : "No rewards configured";
  }

  function buildRewardReason(action, coachNote) {
    const base = `${action.displayName || action.actionId} [${action.actionId}] • ${action.category || "General"} / ${action.earnType || "Routine"}`;
    return coachNote ? `${base} — ${coachNote}` : base;
  }

  function calculateBundleLevel(totalXp, xpCurve = {}) {
    const safeXp = Math.max(0, Number(totalXp || 0));
    const maxLevel = Math.max(1, Number(xpCurve.maxLevel || 100));
    const currentLevel = Math.min(maxLevel, Math.floor(Math.sqrt(safeXp)));
    const currentLevelXp = currentLevel * currentLevel;
    const nextLevel = currentLevel >= maxLevel ? maxLevel : currentLevel + 1;
    const nextLevelXp = nextLevel >= maxLevel ? nextLevel * nextLevel : nextLevel * nextLevel;
    const remainingXp = currentLevel >= maxLevel ? 0 : Math.max(0, nextLevelXp - safeXp);

    return {
      currentLevel,
      nextLevel,
      currentLevelXp,
      nextLevelXp,
      remainingXp,
    };
  }

  function renderPointsActionOptions() {
    if (!pointsActionSelect) {
      return;
    }

    const config = getGamificationConfig();
    const previousValue = pointsActionSelect.value;

    if (!config) {
      pointsActionSelect.innerHTML = '<option value="">Rules engine unavailable</option>';
      pointsActionSelect.disabled = true;
      return;
    }

    const groupedActions = config.actions.reduce((map, action) => {
      const key = action.category || "General";
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key).push(action);
      return map;
    }, new Map());

    const optionMarkup = Array.from(groupedActions.entries())
      .sort((left, right) => left[0].localeCompare(right[0]))
      .map(([category, actions]) => `
        <optgroup label="${escapeHtml(category)}">
          ${actions
            .slice()
            .sort((left, right) => String(left.displayName || left.actionId).localeCompare(String(right.displayName || right.actionId)))
            .map(
              (action) =>
                `<option value="${escapeHtml(action.actionId)}">${escapeHtml(`${action.displayName} • ${getRewardActionLabel(action)}`)}</option>`
            )
            .join("")}
        </optgroup>
      `)
      .join("");

    pointsActionSelect.innerHTML = `<option value="">Select reward action</option>${optionMarkup}`;
    pointsActionSelect.disabled = false;
    pointsActionSelect.value = config.actionsById.has(previousValue) ? previousValue : "";
  }

  function renderPointsActionPreview() {
    if (!pointsActionPreviewNode) {
      return;
    }

    const config = getGamificationConfig();
    const action = config?.actionsById.get(String(pointsActionSelect?.value || "").trim());

    if (!action) {
      pointsActionPreviewNode.innerHTML = `
        <article class="dashboard-badge">
          <strong>Action Preview</strong>
          <p>Select a rules-engine action to preview its XP, coins, and verification rules.</p>
        </article>
      `;
      return;
    }

    pointsActionPreviewNode.innerHTML = `
      <article class="dashboard-badge">
        <strong>Reward Output</strong>
        <p>${escapeHtml(getRewardActionLabel(action))}</p>
      </article>
      <article class="dashboard-badge">
        <strong>Track</strong>
        <p>${escapeHtml(`${action.category || "General"} • ${action.earnType || "Routine"}`)}</p>
      </article>
      <article class="dashboard-badge">
        <strong>Verification</strong>
        <p>${escapeHtml(action.verificationRequired ? "Required before admin approval" : "Not required")}</p>
      </article>
      <article class="dashboard-badge">
        <strong>Limits</strong>
        <p>${escapeHtml(action.cap ? `Cap ${action.cap}` : "No action cap")} • ${escapeHtml(action.cooldownDays ? `${action.cooldownDays} day cooldown` : "No cooldown")}</p>
      </article>
    `;
  }

  function syncPointsModeUi() {
    const config = getGamificationConfig();
    const bundleAvailable = Boolean(config?.actions.length);
    if (pointsModeSelect && (!bundleAvailable || pointsModeSelect.value !== "manual" && pointsModeSelect.value !== "bundle")) {
      pointsModeSelect.value = bundleAvailable ? "bundle" : "manual";
    }

    const manualMode = !bundleAvailable || String(pointsModeSelect?.value || "bundle") === "manual";
    if (pointsBundleFieldsNode) {
      pointsBundleFieldsNode.hidden = manualMode;
    }
    if (pointsManualFieldsNode) {
      pointsManualFieldsNode.hidden = !manualMode;
    }
    if (pointsActionSelect) {
      pointsActionSelect.required = !manualMode;
    }

    if (pointsBundleStatusNode) {
      pointsBundleStatusNode.textContent = bundleAvailable
        ? `Rules engine active • ${config.actions.length} verified actions • Routine weekly cap ${formatNumber(config.settings.routineWeeklyCapXP)} XP • Monthly coin cap ${formatNumber(config.settings.monthlyCoinCap)}`
        : "Rules engine bundle not found on this page. Manual adjustments remain available and still require super admin approval.";
      pointsBundleStatusNode.style.color = bundleAvailable ? "" : "#ffb3b3";
    }

    renderPointsActionPreview();
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
      return "Coaching Session";
    }

    return firstPart.replace(/^Session type:\s*/iu, "") || "Coaching Session";
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

  function startOfCurrentMonth() {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  }

  function startOfCurrentQuarter() {
    const now = new Date();
    const quarterMonth = Math.floor(now.getUTCMonth() / 3) * 3;
    return new Date(Date.UTC(now.getUTCFullYear(), quarterMonth, 1));
  }

  function getCoachOpsData() {
    return window.LEGACY_COACH_OPERATIONS || { positions: [], tiers: [] };
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

  function formatRatePercent(rate) {
    return `${(Number(rate || 0) * 100).toFixed(1)}%`;
  }

  function findPositionPreset(positionCode) {
    return getCoachOpsData().positions.find((item) => item.id === positionCode) || null;
  }

  function findTierPreset(tierCode) {
    return getCoachOpsData().tiers.find((item) => item.id === tierCode) || null;
  }

  function hydrateKpiSummary(tierCode, value) {
    const summary = parseJsonObject(value, {});
    const tierPreset = findTierPreset(tierCode);
    const existingItems = Array.isArray(summary.items) ? summary.items : [];
    const items = (tierPreset?.kpis || []).map((label, index) => {
      const match = existingItems.find((item) => item?.label === label);
      return {
        id: match?.id || `${tierCode || "tier"}-${index + 1}`,
        label,
        checked: Boolean(match?.checked),
      };
    });

    return {
      hoursCompleted: Number(summary.hoursCompleted || 0),
      assessmentComplete: Boolean(summary.assessmentComplete),
      items: items.length ? items : existingItems,
    };
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

  function buildLocalCoachAvailability(data, coachId, coachName) {
    const windows = sortAvailabilityWindows(data?.availabilityWindows || []);
    if (!windows.length) {
      return null;
    }

    const seen = new Set();
    const slots = windows
      .map((windowRecord) => {
        const day = String(formatDayOfWeek(windowRecord.day_of_week) || "").trim();
        const time = `${formatTime(windowRecord.start_time)} - ${formatTime(windowRecord.end_time)}`;
        const dedupeKey = `${day}|${time}`;
        if (!day || seen.has(dedupeKey)) {
          return null;
        }

        seen.add(dedupeKey);
        return { day, time };
      })
      .filter(Boolean);

    if (!slots.length) {
      return null;
    }

    return {
      coachId,
      coachName: coachName || data?.profile?.display_name || "Coach",
      timezone: windows[0]?.timezone || "Asia/Kuala_Lumpur",
      updatedAt: windows.reduce((latest, windowRecord) => {
        if (!latest) {
          return windowRecord?.updated_at || null;
        }

        return new Date(windowRecord?.updated_at || 0).getTime() > new Date(latest || 0).getTime()
          ? windowRecord.updated_at || latest
          : latest;
      }, null),
      slots,
    };
  }

  function setLiveAvailabilityFeedback(message, isError) {
    if (!liveAvailabilityFeedbackNode) {
      return;
    }

    liveAvailabilityFeedbackNode.textContent = message || "";
    liveAvailabilityFeedbackNode.style.color = isError ? "#ffb3b3" : "";
  }

  async function syncLiveCoachAvailability(data) {
    const availabilityHelper = window.LEGACY_COACH_AVAILABILITY;
    const coachId = String(data?.access?.user?.id || dashboardState.access?.user?.id || "").trim();
    const coachName = String(data?.profile?.display_name || "").trim();
    const availabilityKey = coachId || coachName;
    const localAvailability = buildLocalCoachAvailability(data, coachId, coachName);

    if (!availabilityHelper || !liveAvailabilityCalendarNode) {
      return;
    }

    if (!availabilityKey) {
      dashboardState.liveCoachAvailability = null;
      dashboardState.liveCoachAvailabilityKey = "";
      renderAvailability(data);
      return;
    }

    dashboardState.liveCoachAvailability = localAvailability;
    dashboardState.liveCoachAvailabilityKey = availabilityKey;
    renderAvailability(dashboardState.lastData || data);

    let timeoutId = 0;
    try {
      const controller = typeof AbortController === "function" ? new AbortController() : null;
      timeoutId = controller ? window.setTimeout(() => controller.abort(), 4500) : 0;
      const response = await window.fetch(
        `/.netlify/functions/public-coach-availability?coachId=${encodeURIComponent(coachId)}`,
        controller
          ? {
              signal: controller.signal,
            }
          : undefined
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
      if (dashboardState.liveCoachAvailabilityKey !== availabilityKey || !dashboardState.liveCoachAvailability) {
        dashboardState.liveCoachAvailability = localAvailability;
        dashboardState.liveCoachAvailabilityKey = availabilityKey;
      }
    } finally {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    }

    renderAvailability(dashboardState.lastData || data);
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

    const access = await window.legacyAuth.requireRole("coach");
    if (!access.ok) {
      throw new Error("No coach session is active.");
    }

    const supabase = window.legacyAuth.getSupabaseClient();
    if (!supabase) {
      throw new Error("Supabase client is not configured.");
    }

    dashboardState.access = access;
    dashboardState.supabase = supabase;
    return { access, supabase };
  }

  async function getAccessToken() {
    const accessToken = await window.legacyAuth?.getAccessToken?.();
    if (!accessToken) {
      throw new Error("Your session expired. Please log in again.");
    }

    return accessToken;
  }

  function syncDashboardStateFromData(data) {
    dashboardState.assignments = data?.assignments || [];
    dashboardState.clients = data?.clientProfiles || [];
    dashboardState.clientPackages = data?.clientPackages || [];
    dashboardState.bookingRequests = data?.bookingRequests || [];
    dashboardState.sessions = data?.sessions || [];
    dashboardState.availabilityWindows = data?.availabilityWindows || [];
    dashboardState.sessionChangeRequests = data?.sessionChangeRequests || [];
    dashboardState.leads = data?.leads || [];
    dashboardState.leadActivities = data?.leadActivities || [];
    dashboardState.consultIntakes = data?.consultIntakes || [];
    dashboardState.activationCodes = data?.activationCodes || [];
  }

  async function fetchCoachOpsBrief() {
    if (DASHBOARD_PAGE_KEY !== "home") {
      return null;
    }

    const accessToken = await getAccessToken();
    const response = await window.fetch("/.netlify/functions/load-coach-ops-brief", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload?.error || "Unable to load the coach operations brief right now.");
    }
    dashboardState.coachOpsBrief = payload;
    return payload;
  }

  function renderCoachOpsBrief() {
    if (DASHBOARD_PAGE_KEY !== "home") {
      return;
    }

    const payload = dashboardState.coachOpsBrief;

    if (coachOpsBriefCardNode) {
      if (!payload?.weeklyBrief) {
        coachOpsBriefCardNode.innerHTML = '<p class="coach-programming-empty">Weekly coach briefing will appear here once the planner ops layer loads.</p>';
      } else {
        const summary = payload.summary || {};
        coachOpsBriefCardNode.innerHTML = `
          <p class="coach-ops-brief-card__title">${escapeHtml(payload.weeklyBrief.title || "Weekly coaching brief")}</p>
          <p class="coach-ops-brief-card__body">${escapeHtml(payload.weeklyBrief.body || "No coach brief is available yet.")}</p>
          <div class="coach-programming-meta-chips">
            <span>${escapeHtml(`${Number(summary.atRiskClients || 0)} at risk`)}</span>
            <span>${escapeHtml(`${Number(summary.pendingReviews || 0)} pending reviews`)}</span>
            <span>${escapeHtml(`${Number(summary.quietClients || 0)} quiet clients`)}</span>
            <span>${escapeHtml(`${Number(summary.photoNudges || 0)} photo nudges`)}</span>
          </div>
          <div class="button-row">
            <a class="btn btn-secondary" href="./coach-programming.html">Open nutrition ops</a>
          </div>
        `;
      }
    }

    if (coachOpsSummaryGridNode) {
      if (!payload?.automation) {
        coachOpsSummaryGridNode.innerHTML = '<p class="coach-programming-empty">Automation health will appear here after the coach ops layer loads.</p>';
      } else {
        coachOpsSummaryGridNode.innerHTML = [
          {
            label: "Saved segments",
            value: Number(payload.segmentSummaries?.length || 0),
            detail: "Reusable roster filters for scale-ready follow-up.",
            tone: "info",
          },
          {
            label: "Live rules",
            value: Number(payload.automation.enabledRules || 0),
            detail: "Automation rules currently enabled.",
            tone: "warning",
          },
          {
            label: "Scheduled now",
            value: Number(payload.automation.scheduledNowCount || 0),
            detail: "Rules that would run on the current schedule window.",
            tone: "neutral",
          },
          {
            label: "Briefing",
            value: payload.automation.weeklyBriefingEnabled ? 1 : 0,
            detail: payload.automation.weeklyBriefingEnabled ? "Weekly briefing is active." : "Weekly briefing is paused.",
            tone: payload.automation.weeklyBriefingEnabled ? "success" : "neutral",
          },
        ].map((item) => `
          <article class="stat crm-stat coach-programming-review-stat" data-crm-tone="${escapeHtml(item.tone)}">
            <p class="crm-stat__label">${escapeHtml(item.label)}</p>
            <p class="crm-stat__value">${escapeHtml(String(item.value))}</p>
            <p class="crm-stat__detail">${escapeHtml(item.detail)}</p>
          </article>
        `).join("");
      }
    }

    if (coachOpsSegmentStackNode) {
      const segments = Array.isArray(payload?.segmentSummaries) ? payload.segmentSummaries : [];
      if (!segments.length) {
        coachOpsSegmentStackNode.innerHTML = '<p class="coach-programming-empty">No saved smart segments yet. Build them in Nutrition → Operations.</p>';
      } else {
        coachOpsSegmentStackNode.innerHTML = segments
          .slice(0, 4)
          .map((segment) => `
            <article class="coach-ops-segment-card-mini" data-crm-tone="${segment.matchCount ? "warning" : "neutral"}">
              <div class="coach-ops-segment-card-mini__head">
                <strong>${escapeHtml(segment.name)}</strong>
                <span class="crm-pill">${escapeHtml(`${segment.matchCount} match${segment.matchCount === 1 ? "" : "es"}`)}</span>
              </div>
              <p>${escapeHtml(segment.previewNames?.length ? `Watchlist: ${segment.previewNames.join(", ")}` : "No clients currently match this segment.")}</p>
            </article>
          `)
          .join("");
      }
    }

    if (coachOpsIntelligenceGridNode) {
      const intelligence = payload?.intelligence || {};
      const cards = [
        {
          label: "Roster Health",
          value: `${Number(intelligence.rosterHealthScore || 0)}%`,
          detail: `${Number(intelligence.stableClients || 0)} stable • ${Number(intelligence.slippingClients || 0)} slipping`,
          tone: Number(intelligence.rosterHealthScore || 0) >= 70 ? "success" : Number(intelligence.rosterHealthScore || 0) >= 50 ? "warning" : "alert",
        },
        {
          label: "Average Adherence",
          value: `${Number(intelligence.averageAdherenceScore || 0)}%`,
          detail: `${Number(intelligence.improvingClients || 0)} improving across training, nutrition, and check-ins`,
          tone: Number(intelligence.averageAdherenceScore || 0) >= 70 ? "success" : Number(intelligence.averageAdherenceScore || 0) >= 50 ? "warning" : "alert",
        },
        {
          label: "Review Pressure",
          value: `${Number(intelligence.reviewPressureScore || 0)}`,
          detail: `${Number(payload?.summary?.pendingReviews || 0)} pending reviews across the roster`,
          tone: Number(intelligence.reviewPressureScore || 0) >= 65 ? "alert" : Number(intelligence.reviewPressureScore || 0) >= 35 ? "warning" : "info",
        },
        {
          label: "Coverage",
          value: `${Number(intelligence.rosterCoveredPercent || 0)}%`,
          detail: `${Number(intelligence.programCoveragePercent || 0)}% training • ${Number(intelligence.nutritionCoveragePercent || 0)}% nutrition`,
          tone: Number(intelligence.rosterCoveredPercent || 0) >= 70 ? "success" : Number(intelligence.rosterCoveredPercent || 0) >= 45 ? "warning" : "neutral",
        },
      ];
      coachOpsIntelligenceGridNode.innerHTML = cards
        .map((item) => `
          <article class="stat crm-stat coach-programming-review-stat" data-crm-tone="${escapeHtml(item.tone)}">
            <p class="crm-stat__label">${escapeHtml(item.label)}</p>
            <p class="crm-stat__value">${escapeHtml(String(item.value))}</p>
            <p class="crm-stat__detail">${escapeHtml(item.detail)}</p>
          </article>
        `)
        .join("");
    }

    if (coachOpsFocusStackNode) {
      const intelligence = payload?.intelligence || {};
      const focusAreas = Array.isArray(intelligence.focusAreas) ? intelligence.focusAreas : [];
      const topDrivers = Array.isArray(intelligence.topDrivers) ? intelligence.topDrivers : [];
      if (!focusAreas.length && !topDrivers.length) {
        coachOpsFocusStackNode.innerHTML = '<p class="coach-programming-empty">No urgent coach action is standing out right now. The roster is steady.</p>';
      } else {
        coachOpsFocusStackNode.innerHTML = [
          ...focusAreas.map((item) => `
            <article class="coach-ops-focus-card" data-crm-tone="${escapeHtml(item.tone || "neutral")}">
              <div class="coach-ops-focus-card__head">
                <strong>${escapeHtml(item.title || "Focus item")}</strong>
                <span class="crm-pill">${escapeHtml(item.tone === "alert" ? "Do now" : item.tone === "warning" ? "Next up" : "Keep moving")}</span>
              </div>
              <p>${escapeHtml(item.detail || "Keep this roster area moving.")}</p>
              ${item.actionUrl ? `<div class="button-row"><a class="btn btn-secondary" href="${escapeHtml(item.actionUrl)}">Open</a></div>` : ""}
            </article>
          `),
          ...topDrivers.slice(0, 2).map((driver) => `
            <article class="coach-ops-focus-card coach-ops-focus-card--driver" data-crm-tone="${escapeHtml(driver.tone || "neutral")}">
              <div class="coach-ops-focus-card__head">
                <strong>${escapeHtml(driver.label || "Roster driver")}</strong>
                <span class="crm-pill">${escapeHtml(`${Number(driver.count || 0)} affected`)}</span>
              </div>
              <p>${escapeHtml(`This is one of the strongest current drivers of coach attention across the roster.`)}</p>
            </article>
          `),
        ].join("");
      }
    }
  }

  async function refreshCoachOpsBrief() {
    if (DASHBOARD_PAGE_KEY !== "home") {
      return;
    }

    try {
      await fetchCoachOpsBrief();
      renderCoachOpsBrief();
    } catch (error) {
      console.warn("[LEGACY] Coach ops brief refresh failed.", error);
    }
  }

  async function fetchDashboardDataFromServer(options = {}) {
    const accessToken = await getAccessToken();
    const params = new URLSearchParams({
      scope: "coach",
      page: DASHBOARD_PAGE_KEY,
    });
    if (options?.variant) {
      params.set("variant", String(options.variant));
    }
    if (options?.fresh) {
      params.set("fresh", "1");
    }
    const response = await window.fetch(`/.netlify/functions/load-dashboard-data?${params.toString()}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload?.data) {
      throw new Error(payload?.error || "Unable to load your coach dashboard data right now.");
    }

    syncDashboardStateFromData(payload.data);
    return payload.data;
  }

  async function fetchDashboardDataDirect() {
    const { access, supabase } = await loadAccessAndClient();
    const coachId = access.user.id;
    const sessionWindowStartIso = startOfCurrentQuarter().toISOString();
    const includeProfile = DASHBOARD_PAGE_KEY === "profile";
    const includeRoster = DASHBOARD_PAGE_KEY === "home" || DASHBOARD_PAGE_KEY === "clients" || includeProfile;
    const includeSchedule = DASHBOARD_PAGE_KEY === "home" || DASHBOARD_PAGE_KEY === "schedule" || includeProfile;
    const includeCommissions = DASHBOARD_PAGE_KEY === "home" || DASHBOARD_PAGE_KEY === "commissions" || includeProfile;
    const includeConsults = DASHBOARD_PAGE_KEY === "clients";

    const [
      profileResponse,
      coachProfileResponse,
      assignmentsResponse,
      sessionsResponse,
      commissionResponse,
      availabilityResponse,
      sessionChangeRequestsResponse,
      leadsResponse,
      consultIntakesResponse,
      activationCodesResponse,
    ] = await Promise.all([
      supabase.from("profiles").select("id, display_name, avatar_url, status").eq("id", coachId).maybeSingle(),
      supabase
        .from("coach_profiles")
        .select(
          "commission_tier, commission_rate, position_code, commission_cap, commission_bonus_notes, hours_minimum, hours_target, review_due_at, last_reviewed_at, promotion_ready, kpi_summary, notes, google_calendar_email, calendar_sync_enabled, payout_bank_name, payout_account_name, payout_account_number, payout_bank_code"
        )
        .eq("id", coachId)
        .maybeSingle(),
      includeRoster || includeSchedule || includeCommissions
        ? supabase
            .from("coach_client_assignments")
            .select("id, client_id, status, assigned_at")
            .eq("coach_id", coachId)
            .eq("status", "active")
            .order("assigned_at", { ascending: true })
        : Promise.resolve({ data: [], error: null }),
      includeSchedule || includeCommissions
        ? supabase
            .from("sessions")
            .select("id, client_id, client_package_id, booking_request_id, scheduled_start, scheduled_end, status, session_value_rm, completed_at, coach_check_in_at, coach_check_in_by, coach_attendance_status, coach_note, coach_next_step, coach_note_recorded_at, coach_note_recorded_by")
            .eq("coach_id", coachId)
            .gte("scheduled_start", sessionWindowStartIso)
            .order("scheduled_start", { ascending: true })
            .limit(30)
        : Promise.resolve({ data: [], error: null }),
      includeCommissions
        ? supabase
            .from("commission_records")
            .select("id, session_id, commission_rate, amount_rm, payout_month, payout_status, created_at")
            .eq("coach_id", coachId)
            .order("created_at", { ascending: false })
            .limit(20)
        : Promise.resolve({ data: [], error: null }),
      includeSchedule
        ? supabase
            .from("coach_availability_windows")
            .select("id, day_of_week, start_time, end_time, timezone, is_active, created_at")
            .eq("coach_id", coachId)
            .eq("is_active", true)
            .order("day_of_week", { ascending: true })
            .order("start_time", { ascending: true })
        : Promise.resolve({ data: [], error: null }),
      includeSchedule
        ? supabase
            .from("session_change_requests")
            .select(
              "id, session_id, client_id, coach_id, request_type, original_start, original_end, requested_start, requested_end, reason, status, created_at"
            )
            .eq("coach_id", coachId)
            .order("created_at", { ascending: false })
            .limit(30)
        : Promise.resolve({ data: [], error: null }),
      includeConsults
        ? supabase
            .from("leads")
            .select("id, full_name, email, phone, source, status, next_follow_up_at, owner_id, notes, converted_client_id, created_at")
            .eq("owner_id", coachId)
            .order("created_at", { ascending: false })
            .limit(120)
        : Promise.resolve({ data: [], error: null }),
      includeConsults
        ? supabase
            .from("coach_consult_intakes")
            .select(
              "id, coach_id, lead_id, summary, hotness, recommended_service, recommended_frequency, recommended_timeline, next_step, primary_goal, biggest_barrier, primary_lever, risk_flags, created_at"
            )
            .eq("coach_id", coachId)
            .order("created_at", { ascending: false })
            .limit(120)
        : Promise.resolve({ data: [], error: null }),
      includeConsults
        ? supabase
            .from("activation_codes")
            .select("id, role, code, recipient_email, recipient_name, assigned_coach_id, status, expires_at, used_at, created_at")
            .eq("role", "client")
            .order("created_at", { ascending: false })
            .limit(40)
        : Promise.resolve({ data: [], error: null }),
    ]);

    if (profileResponse.error) {
      throw profileResponse.error;
    }

    if (coachProfileResponse.error) {
      throw coachProfileResponse.error;
    }

    if (assignmentsResponse.error) {
      throw assignmentsResponse.error;
    }

    if (sessionsResponse.error) {
      throw sessionsResponse.error;
    }

    if (commissionResponse.error) {
      throw commissionResponse.error;
    }

    if (availabilityResponse.error) {
      throw availabilityResponse.error;
    }

    if (sessionChangeRequestsResponse.error) {
      throw sessionChangeRequestsResponse.error;
    }

    if (leadsResponse.error) {
      throw leadsResponse.error;
    }

    if (consultIntakesResponse.error) {
      throw consultIntakesResponse.error;
    }

    if (activationCodesResponse.error) {
      throw activationCodesResponse.error;
    }

    const assignments = assignmentsResponse.data || [];
    const sessions = sessionsResponse.data || [];
    const commissions = commissionResponse.data || [];
    const availabilityWindows = availabilityResponse.data || [];
    const sessionChangeRequests = sessionChangeRequestsResponse.data || [];
    const leads = leadsResponse.data || [];
    const consultIntakes = consultIntakesResponse.data || [];
    const activationCodes = activationCodesResponse.data || [];
    const clientIds = assignments.map((assignment) => assignment.client_id);
    const leadIds = leads.map((lead) => lead.id).filter(Boolean);

    let clientProfiles = [];
    let clientProfileDetails = [];
    let clientPackages = [];
    let bookingRequests = [];
    let pointsLedger = [];
    let leadActivities = [];

    if (clientIds.length && (includeRoster || includeSchedule || includeCommissions)) {
      const clientIdList = clientIds.join(",");
      const [
        clientProfilesResponse,
        clientProfileDetailsResponse,
        clientPackagesResponse,
        bookingRequestsResponse,
        pointsLedgerResponse,
      ] = await Promise.all([
        supabase.from("profiles").select("id, display_name, status").in("id", clientIds),
        supabase
          .from("client_profiles")
          .select("id, preferred_name, xp_points, gym_coins, primary_goal")
          .in("id", clientIds),
        includeRoster
          ? supabase
              .from("client_packages")
              .select("id, client_id, order_id, package_name, sessions_purchased, sessions_remaining, activated_at, expires_at, status")
              .in("client_id", clientIds)
              .order("created_at", { ascending: false })
          : Promise.resolve({ data: [], error: null }),
        includeRoster || includeSchedule
          ? supabase
              .from("booking_requests")
              .select("id, client_id, preferred_coach_id, client_package_id, requested_date, requested_time, notes, status, created_at")
              .in("client_id", clientIds)
              .order("created_at", { ascending: false })
              .limit(20)
          : Promise.resolve({ data: [], error: null }),
        includeRoster
          ? supabase
              .from("points_ledger")
              .select("id, client_id, points_type, delta, reason, requested_by, approval_status, created_at")
              .in("client_id", clientIds)
              .order("created_at", { ascending: false })
              .limit(100)
          : Promise.resolve({ data: [], error: null }),
      ]);

      if (clientProfilesResponse.error) {
        throw clientProfilesResponse.error;
      }

      if (clientProfileDetailsResponse.error) {
        throw clientProfileDetailsResponse.error;
      }

      if (clientPackagesResponse.error) {
        throw clientPackagesResponse.error;
      }

      if (bookingRequestsResponse.error) {
        throw bookingRequestsResponse.error;
      }

      if (pointsLedgerResponse.error) {
        throw pointsLedgerResponse.error;
      }

      clientProfiles = clientProfilesResponse.data || [];
      clientProfileDetails = clientProfileDetailsResponse.data || [];
      clientPackages = clientPackagesResponse.data || [];
      bookingRequests = bookingRequestsResponse.data || [];
      pointsLedger = pointsLedgerResponse.data || [];
    }

    if (includeConsults && leadIds.length) {
      const leadActivitiesResponse = await supabase
        .from("lead_activities")
        .select("id, lead_id, actor_id, activity_type, notes, created_at")
        .in("lead_id", leadIds)
        .order("created_at", { ascending: false })
        .limit(120);

      if (leadActivitiesResponse.error) {
        throw leadActivitiesResponse.error;
      }

      leadActivities = leadActivitiesResponse.data || [];
    }

    const commissionSessionIds = commissions.map((record) => record.session_id).filter(Boolean);
    const missingCommissionSessionIds = commissionSessionIds.filter(
      (sessionId) => !sessions.some((session) => session.id === sessionId)
    );
    let commissionSessions = sessions;

    if (includeCommissions && missingCommissionSessionIds.length) {
      const commissionSessionsResponse = await supabase
        .from("sessions")
        .select("id, client_id, client_package_id, booking_request_id, scheduled_start, scheduled_end, status, session_value_rm, completed_at, coach_check_in_at, coach_check_in_by, coach_attendance_status, coach_note, coach_next_step, coach_note_recorded_at, coach_note_recorded_by")
        .in("id", missingCommissionSessionIds);

      if (commissionSessionsResponse.error) {
        throw commissionSessionsResponse.error;
      }

      commissionSessions = sessions.concat(commissionSessionsResponse.data || []);
    }

    syncDashboardStateFromData({
      assignments,
      clientProfiles,
      clientPackages,
      bookingRequests,
      sessions,
      availabilityWindows,
      sessionChangeRequests,
      leads,
      leadActivities,
      consultIntakes,
      activationCodes,
    });

    return {
      access,
      profile: profileResponse.data || null,
      coachProfile: coachProfileResponse.data || null,
      ...(includeRoster || includeSchedule || includeCommissions
        ? {
            assignments,
            clientProfiles,
            clientProfileDetails,
          }
        : {}),
      ...(includeRoster
        ? {
            clientPackages,
            pointsLedger,
          }
        : {}),
      ...(includeRoster || includeSchedule
        ? {
            bookingRequests,
          }
        : {}),
      ...(includeSchedule
        ? {
            sessions,
            availabilityWindows,
            sessionChangeRequests,
          }
        : {}),
      ...(includeCommissions
        ? {
            commissions,
            commissionSessions,
            sessions,
          }
        : {}),
      ...(includeConsults
        ? {
            leads,
            leadActivities,
            consultIntakes,
            activationCodes,
          }
      : {}),
    };
  }

  async function fetchDashboardData(options = {}) {
    try {
      return await fetchDashboardDataFromServer(options);
    } catch (error) {
      console.warn("[LEGACY] Falling back to direct coach dashboard queries.", error);
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
        homeDetailsLoaded: true,
        clientWorkspaceDetailsLoaded: true,
      },
      dashboardState.lastData
    );
    dashboardState.lastData = nextData;
    writeDashboardCache(userId, nextData);
    renderDashboard(nextData);
  }

  async function hydrateDeferredDashboardSections(loadCycleId, userId) {
    if (!shouldDeferSecondaryPayload()) {
      return;
    }

    if (dashboardState.deferredHydrationInFlight) {
      return;
    }

    dashboardState.deferredHydrationInFlight = true;

    const payload = await fetchDashboardData({ variant: "secondary" }).catch((error) => {
      console.warn("[LEGACY] Coach deferred dashboard hydration failed.", error);
      return null;
    });

    dashboardState.deferredHydrationInFlight = false;

    if (!payload || dashboardState.loadCycleId !== loadCycleId) {
      return;
    }

    applyDeferredDashboardPatch(payload, userId);
  }

  function buildClientMaps(data) {
    const clientById = new Map();
    const clientDetailById = new Map((data.clientProfileDetails || []).map((item) => [item.id, item]));
    const packagesByClientId = new Map();
    (data.clientPackages || []).forEach((item) => {
      [item.client_id]
        .filter(Boolean)
        .forEach((ownerId) => {
          if (!packagesByClientId.has(ownerId)) {
            packagesByClientId.set(ownerId, []);
          }
          packagesByClientId.get(ownerId).push(item);
        });
    });
    const requestsByClientId = groupBy(data.bookingRequests || [], (item) => item.client_id);
    const pointsByClientId = groupBy(data.pointsLedger || [], (item) => item.client_id);

    (data.clientProfiles || []).forEach((client) => {
      const detail = clientDetailById.get(client.id) || null;
      clientById.set(client.id, {
        id: client.id,
        displayName: detail?.preferred_name || client.display_name || "Client",
        status: client.status || "active",
        primaryGoal: detail?.primary_goal || "",
        xpPoints: Number(detail?.xp_points || 0),
        gymCoins: Number(detail?.gym_coins || 0),
        packages: packagesByClientId.get(client.id) || [],
        requests: requestsByClientId.get(client.id) || [],
        pointsEntries: pointsByClientId.get(client.id) || [],
      });
    });

    return clientById;
  }

  function activePackageForClient(client) {
    return (client?.packages || []).find((item) => item.status === "active") || (client?.packages || [])[0] || null;
  }

  function consultStatusTone(status) {
    switch (String(status || "").toLowerCase()) {
      case "contacted":
        return "orange";
      case "qualified":
        return "blue";
      case "converted":
        return "green";
      case "ghosted":
        return "gray";
      case "lost":
        return "red";
      default:
        return "yellow";
    }
  }

  function consultHeatTone(hotness) {
    switch (String(hotness || "").toLowerCase()) {
      case "hot":
        return "purple";
      case "warm":
        return "orange";
      case "cold":
        return "blue";
      default:
        return "gray";
    }
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
        return "green";
      case "scheduled":
      case "rescheduled":
        return "blue";
      case "declined":
      case "cancelled":
      case "canceled":
      case "rejected":
      case "expired":
        return "red";
      default:
        return "gray";
    }
  }

  function buildDashboardStatusMarkup(status) {
    return buildStatusPillMarkup(normalizeStatusLabel(status), dashboardStatusTone(status));
  }

  function getConsultLeadCollection(data) {
    const consultLeadIds = new Set((data.consultIntakes || []).map((item) => item.lead_id).filter(Boolean));
    return (data.leads || []).filter(
      (lead) => consultLeadIds.has(lead.id) || String(lead.source || "").trim().toLowerCase() === "1:1 coaching consult"
    );
  }

  function buildConsultMaps(data) {
    const consultsByLeadId = groupBy((data.consultIntakes || []).filter((item) => item.lead_id), (item) => item.lead_id);
    const latestConsultByLeadId = new Map();

    consultsByLeadId.forEach((items, leadId) => {
      const latestConsult = items
        .slice()
        .sort((left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime())[0];
      latestConsultByLeadId.set(leadId, latestConsult || null);
    });

    return {
      consultsByLeadId,
      latestConsultByLeadId,
    };
  }

  function prefillConsultFollowUp(lead) {
    if (!consultFollowUpForm || !lead) {
      return;
    }

    if (consultLeadSelect) {
      consultLeadSelect.value = lead.id;
    }

    const statusField = consultFollowUpForm.elements.namedItem("status");
    if (statusField instanceof HTMLSelectElement || statusField instanceof HTMLInputElement) {
      statusField.value = lead.status || "new";
    }

    const nextFollowUpField = consultFollowUpForm.elements.namedItem("nextFollowUpAt");
    if (nextFollowUpField instanceof HTMLInputElement) {
      nextFollowUpField.value = lead.next_follow_up_at ? toInputDateTime(lead.next_follow_up_at) : "";
    }

    const notesField = consultFollowUpForm.elements.namedItem("notes");
    if (notesField instanceof HTMLTextAreaElement) {
      notesField.value = lead.notes || "";
    }
  }

  function renderCoachClientWorkspaceTabs() {
    if (!coachClientsTabs.length || !coachClientsPanels.length) {
      return;
    }

    const activePanel = dashboardState.clientWorkspacePanel || "roster";

    coachClientsTabs.forEach((button) => {
      const isActive = button.dataset.coachClientsTab === activePanel;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    coachClientsPanels.forEach((panel) => {
      const isActive = panel.dataset.coachClientsPanel === activePanel;
      panel.hidden = !isActive;
      panel.classList.toggle("is-active", isActive);
    });
  }

  function syncCoachDeferredUiState(data) {
    const workspacePending = isClientWorkspaceDetailsPending(data);
    const homePending = isHomeDetailsPending(data);

    document.body.classList.toggle("dashboard-hydrating-secondary", workspacePending || homePending);
    if (statusNode) {
      statusNode.classList.toggle("is-syncing", workspacePending || homePending);
      statusNode.setAttribute("aria-live", workspacePending || homePending ? "polite" : "off");
    }

    coachClientsPanels.forEach((panel) => {
      const isActive = panel.classList.contains("is-active");
      const isSyncing = isActive && workspacePending;
      panel.classList.toggle("is-syncing", isSyncing);
      panel.setAttribute("aria-busy", String(isSyncing));
    });
  }

  function renderConsultWorkspace(data) {
    const consultLeads = getConsultLeadCollection(data);
    const { latestConsultByLeadId } = buildConsultMaps(data);
    const detailsPending = isClientWorkspaceDetailsPending(data);

    if (detailsPending && !consultLeads.length && !(data.consultIntakes || []).length) {
      const skeletonValue = buildSkeletonLine("48%", "value");
      if (consultStatNewNode) consultStatNewNode.innerHTML = skeletonValue;
      if (consultStatContactedNode) consultStatContactedNode.innerHTML = buildSkeletonLine("44%", "value");
      if (consultStatQualifiedNode) consultStatQualifiedNode.innerHTML = buildSkeletonLine("46%", "value");
      if (consultStatConvertedNode) consultStatConvertedNode.innerHTML = buildSkeletonLine("42%", "value");
      if (consultStatGhostedNode) consultStatGhostedNode.innerHTML = buildSkeletonLine("38%", "value");
      if (consultStatOverdueNode) consultStatOverdueNode.innerHTML = buildSkeletonLine("40%", "value");
      if (consultLeadSelect) {
        consultLeadSelect.innerHTML = '<option value="">Loading consult leads...</option>';
        consultLeadSelect.disabled = true;
      }
      if (consultRowsNode) {
        consultRowsNode.innerHTML = buildSkeletonTableRows(["Lead", "Status", "Heat", "Goal", "Next Step", "Follow Up"], 4);
      }
      return;
    }

    const overdueCount = consultLeads.filter((lead) => {
      const followUpDate = lead.next_follow_up_at ? new Date(lead.next_follow_up_at).getTime() : 0;
      return followUpDate && followUpDate < Date.now() && !["converted", "lost", "ghosted"].includes(String(lead.status || ""));
    }).length;

    const summary = consultLeads.reduce(
      (counts, lead) => {
        const status = String(lead.status || "new").toLowerCase();
        counts[status] = Number(counts[status] || 0) + 1;
        return counts;
      },
      {
        new: 0,
        contacted: 0,
        qualified: 0,
        converted: 0,
        ghosted: 0,
      }
    );

    if (consultStatNewNode) consultStatNewNode.textContent = String(summary.new || 0);
    if (consultStatContactedNode) consultStatContactedNode.textContent = String(summary.contacted || 0);
    if (consultStatQualifiedNode) consultStatQualifiedNode.textContent = String(summary.qualified || 0);
    if (consultStatConvertedNode) consultStatConvertedNode.textContent = String(summary.converted || 0);
    if (consultStatGhostedNode) consultStatGhostedNode.textContent = String(summary.ghosted || 0);
    if (consultStatOverdueNode) consultStatOverdueNode.textContent = String(overdueCount);

    if (consultLeadSelect) {
      consultLeadSelect.innerHTML = [
        '<option value="">Select consult lead</option>',
        ...consultLeads.map(
          (lead) =>
            `<option value="${escapeHtml(lead.id)}">${escapeHtml(`${lead.full_name || "Lead"} (${normalizeStatusLabel(lead.status || "new")})`)}</option>`
        ),
      ].join("");
      consultLeadSelect.disabled = !consultLeads.length;
    }

    if (consultRowsNode) {
      consultRowsNode.innerHTML = consultLeads.length
        ? consultLeads
            .slice()
            .sort((left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime())
            .map((lead) => {
              const consult = latestConsultByLeadId.get(lead.id) || null;
              const followUpLabel = lead.next_follow_up_at ? formatDateTime(lead.next_follow_up_at) : "Not scheduled";
              const nextStep = consult?.next_step || consult?.summary || "Needs follow-up";
              const goal = consult?.primary_goal || "Consult goal not captured yet";
              const heatMarkup = consult?.hotness
                ? buildStatusPillMarkup(normalizeStatusLabel(consult.hotness), consultHeatTone(consult.hotness))
                : '<span class="crm-status-pill crm-status-pill--gray">Unrated</span>';

              return `
                <tr>
                  <td>
                    <strong>${escapeHtml(lead.full_name || "Lead")}</strong>
                    <small>${escapeHtml(lead.email || lead.phone || "No direct contact saved")}</small>
                  </td>
                  <td>${buildStatusPillMarkup(normalizeStatusLabel(lead.status || "new"), consultStatusTone(lead.status))}</td>
                  <td>${heatMarkup}</td>
                  <td>${escapeHtml(goal)}</td>
                  <td>${escapeHtml(nextStep)}</td>
                  <td>
                    <div class="crm-inline-stack">
                      <span>${escapeHtml(followUpLabel)}</span>
                      <button class="btn btn-ghost" type="button" data-coach-consult-load="${escapeHtml(lead.id)}">Load</button>
                    </div>
                  </td>
                </tr>
              `;
            })
            .join("")
        : buildEmptyTableRow(
            6,
            "No consult leads linked yet.",
            "New 1-to-1 consult submissions will appear here first with their follow-up stage and conversion status."
          );
    }
  }

  function renderClientAccessCodes(data) {
    if (!clientCodeRowsNode) {
      return;
    }

    if (isClientWorkspaceDetailsPending(data) && !(data.activationCodes || []).length) {
      clientCodeRowsNode.innerHTML = buildSkeletonTableRows(["Client Email", "Code", "Status", "Expires", "Created"], 4);
      return;
    }

    const rows = (data.activationCodes || []).slice(0, 24);
    clientCodeRowsNode.innerHTML = rows.length
      ? rows
          .map(
            (record) => `
              <tr>
                <td>${escapeHtml(record.recipient_email || "-")}</td>
                <td><code>${escapeHtml(record.code || "-")}</code></td>
                <td>${buildStatusPillMarkup(normalizeStatusLabel(record.status || "active"), consultStatusTone(record.status === "used" ? "converted" : record.status === "expired" ? "ghosted" : "new"))}</td>
                <td>${escapeHtml(record.expires_at ? formatDateTime(record.expires_at) : "No expiry")}</td>
                <td>${escapeHtml(formatDateTime(record.created_at))}</td>
              </tr>
            `
          )
          .join("")
      : buildEmptyTableRow(
          5,
          "No client access codes generated yet.",
          "Create a client code when you are ready to onboard someone into the portal and link them into your roster."
        );
  }

  function renderCoachSettings(data) {
    if (!(coachPayoutForm instanceof HTMLFormElement)) {
      return;
    }

    const bankNameField = coachPayoutForm.elements.namedItem("bankName");
    const accountNameField = coachPayoutForm.elements.namedItem("accountName");
    const accountNumberField = coachPayoutForm.elements.namedItem("accountNumber");
    const bankCodeField = coachPayoutForm.elements.namedItem("bankCode");
    const profile = data.coachProfile || {};

    if (bankNameField instanceof HTMLInputElement) {
      bankNameField.value = profile.payout_bank_name || "";
    }

    if (accountNameField instanceof HTMLInputElement) {
      accountNameField.value = profile.payout_account_name || "";
    }

    if (accountNumberField instanceof HTMLInputElement) {
      accountNumberField.value = profile.payout_account_number || "";
    }

    if (bankCodeField instanceof HTMLInputElement) {
      bankCodeField.value = profile.payout_bank_code || "";
    }
  }

  function renderStats(data, clientById) {
    if (accountEmailNodes.length) {
      accountEmailNodes.forEach((node) => {
        node.textContent = data.access?.user?.email || "coach";
      });
    }

    const currentMonthStart = startOfCurrentMonth();
    const homeSummary = data.homeSummary && typeof data.homeSummary === "object" ? data.homeSummary : null;
    const detailsPending = isHomeDetailsPending(data);
    const rosterCount = homeSummary ? Number(homeSummary.activeClients || 0) : data.assignments.length;
    const pendingRewardCount = homeSummary
      ? Number(homeSummary.pendingRewardCount || 0)
      : (data.pointsLedger || []).filter(
          (entry) => entry.requested_by === data.access.user.id && entry.approval_status === "pending"
        ).length;
    const upcomingSessionsCount = homeSummary
      ? Number(homeSummary.upcomingSessionsCount || 0)
      : (data.sessions || []).filter((session) => {
          const start = new Date(session.scheduled_start).getTime();
          return session.status === "scheduled" && !Number.isNaN(start) && start >= Date.now();
        }).length;
    const monthlyCommission = homeSummary
      ? Number(homeSummary.monthlyCommission || 0)
      : (data.commissions || []).reduce((total, record) => {
          const payoutDate = new Date(record.payout_month || record.created_at);
          if (Number.isNaN(payoutDate.getTime()) || payoutDate < currentMonthStart) {
            return total;
          }
          return total + Number(record.amount_rm || 0);
        }, 0);

    const statClientsNode = document.getElementById("coach-stat-clients");
    const statClientsNoteNode = document.getElementById("coach-stat-clients-note");
    const statSessionsNode = document.getElementById("coach-stat-sessions");
    const statSessionsNoteNode = document.getElementById("coach-stat-sessions-note");
    const statCommissionNode = document.getElementById("coach-stat-commission");
    const statCommissionNoteNode = document.getElementById("coach-stat-commission-note");
    const statPointsNode = document.getElementById("coach-stat-points");
    const statPointsNoteNode = document.getElementById("coach-stat-points-note");

    if (statClientsNode) {
      statClientsNode.textContent = String(rosterCount);
    }

    if (statClientsNoteNode) {
      statClientsNoteNode.textContent = rosterCount
        ? detailsPending
          ? `${rosterCount} active client${rosterCount === 1 ? "" : "s"} loaded. Detailed roster is syncing now.`
          : `${rosterCount} assigned client${rosterCount === 1 ? "" : "s"} under your roster.`
        : detailsPending
          ? "Client summary is loading..."
          : "No client assignments yet.";
    }

    if (statSessionsNode) {
      statSessionsNode.textContent = String(upcomingSessionsCount);
    }

    if (statSessionsNoteNode) {
      statSessionsNoteNode.textContent = upcomingSessionsCount
        ? detailsPending
          ? "Upcoming session count is ready. The full schedule is syncing now."
          : "Confirmed sessions across your next scheduled coaching slots."
        : detailsPending
          ? "Session queue is loading..."
          : "No confirmed sessions in your calendar yet.";
    }

    if (statCommissionNode) {
      statCommissionNode.textContent = formatCurrency(monthlyCommission);
    }

    if (statCommissionNoteNode) {
      statCommissionNoteNode.textContent = monthlyCommission > 0 || data.commissions.length
        ? `Current base rate ${formatRatePercent(data.coachProfile?.commission_rate || 0)}. Session payout rows appear after completion.`
        : detailsPending
          ? "Commission summary is ready. Detailed payout rows are syncing now."
          : "Commission will appear after session-based commission records are added.";
    }

    if (statPointsNode) {
      statPointsNode.textContent = String(pendingRewardCount);
    }

    if (statPointsNoteNode) {
      const config = getGamificationConfig();
      statPointsNoteNode.textContent = pendingRewardCount
        ? "Pending reward requests are waiting for super admin approval."
        : detailsPending
          ? "Reward queue summary is loading..."
          : config
          ? "Rules-engine rewards are ready to issue from the active action catalog."
          : "No pending reward requests right now.";
    }

    setTone(statClientsNode, rosterCount ? "info" : "warning");
    setTone(statSessionsNode, upcomingSessionsCount ? "warning" : "info");
    setTone(statCommissionNode, monthlyCommission > 0 ? "success" : "info");
    setTone(statPointsNode, pendingRewardCount ? "alert" : "success");
  }

  function isHomeDetailsPending(data) {
    return DASHBOARD_PAGE_KEY === "home" && Boolean(data?.homeSummary) && data?.homeDetailsLoaded === false;
  }

  function renderRoster(data, clientById) {
    if (!rosterNode || !pointsClientSelect) {
      return;
    }

    rosterNode.classList.remove("dashboard-list--cards");
    const clients = Array.from(clientById.values()).sort((left, right) => left.displayName.localeCompare(right.displayName));

    if (isHomeDetailsPending(data) && !clients.length) {
      rosterNode.innerHTML = buildSkeletonListItems(3);
      pointsClientSelect.innerHTML = '<option value="">Loading clients...</option>';
      pointsClientSelect.disabled = true;
      setTone(rosterNode, "info");
      return;
    }

    if (!clients.length) {
      rosterNode.classList.add("dashboard-list--cards");
      rosterNode.innerHTML = `
        <li class="dashboard-list-card dashboard-list-card--empty">
          <div class="dashboard-list-card__head">
            <strong>No assigned clients yet</strong>
          </div>
          <p>Your next linked client will appear here with goal, package, and request status once the roster is active.</p>
        </li>
      `;
      pointsClientSelect.innerHTML = '<option value="">No assigned clients</option>';
      pointsClientSelect.disabled = true;
      setTone(rosterNode, "warning");
      return;
    }

    rosterNode.classList.add("dashboard-list--cards");
    rosterNode.innerHTML = clients
      .map((client) => {
        const activePackage = activePackageForClient(client);
        const pendingRequests = client.requests.filter((request) => request.status === "pending").length;
        const goalLabel = client.primaryGoal ? `Goal: ${client.primaryGoal}` : "Goal: not set";
        const packageLabel = activePackage ? `Package: ${compactPackageLabel(activePackage.package_name)}` : "Package: none yet";
        const requestLabel = pendingRequests ? `${pendingRequests} pending request${pendingRequests === 1 ? "" : "s"}` : "No pending requests";
        const chipLabel = activePackage ? "Package live" : "Package pending";

        return `
          <li class="dashboard-list-card">
            <div class="dashboard-list-card__head">
              <strong>${escapeHtml(client.displayName)}</strong>
              <span class="dashboard-list-card__chip">${escapeHtml(chipLabel)}</span>
            </div>
            <p>${escapeHtml(goalLabel)}</p>
            <div class="dashboard-list-card__meta">
              <span>${escapeHtml(packageLabel)}</span>
              <span>${escapeHtml(requestLabel)}</span>
            </div>
          </li>
        `;
      })
      .join("");

    pointsClientSelect.disabled = false;
    pointsClientSelect.innerHTML = [
      '<option value="">Select client</option>',
      ...clients.map(
        (client) => `<option value="${escapeHtml(client.id)}">${escapeHtml(client.displayName)}</option>`
      ),
    ].join("");
    setTone(rosterNode, "info");
  }

  function renderPackages(data, clientById) {
    if (!packageRowsNode) {
      return;
    }

    const packageRows = Array.from(clientById.values())
      .flatMap((client) =>
        client.packages.map((pkg) => {
          const usedSessions = Math.max(0, Number(pkg.sessions_purchased || 0) - Number(pkg.sessions_remaining || 0));
          const validityLabel = pkg.activated_at || pkg.expires_at
            ? `${formatDate(pkg.activated_at)} - ${formatDate(pkg.expires_at)}`
            : "Not activated";

          return `
            <tr>
              <td>${escapeHtml(client.displayName)}</td>
              <td>${escapeHtml(compactPackageLabel(pkg.package_name))}</td>
              <td>${escapeHtml(`${usedSessions} / ${Number(pkg.sessions_purchased || 0)} used`)}</td>
              <td>${escapeHtml(validityLabel)}</td>
              <td>${escapeHtml(normalizeStatusLabel(pkg.status))}</td>
            </tr>
          `;
        })
      );

    if (isClientWorkspaceDetailsPending(data) && !packageRows.length) {
      packageRowsNode.innerHTML = buildSkeletonTableRows(["Client", "Package", "Sessions", "Validity", "Usage Status"], 3);
      return;
    }

    packageRowsNode.innerHTML = packageRows.length
      ? packageRows.join("")
      : `
        <tr>
          <td colspan="5">No client packages are linked to your roster yet.</td>
        </tr>
      `;
  }

  function renderSessions(data, clientById) {
    if (!sessionRowsNode) {
      return;
    }

    if (isHomeDetailsPending(data) && !data.sessions.length) {
      sessionRowsNode.innerHTML = buildSkeletonTableRows(["Date", "Time", "Session", "Client", "Status", "Action"], 3);
      setTone(sessionRowsNode, "info");
      return;
    }

    const requestById = new Map((data.bookingRequests || []).map((request) => [request.id, request]));
    sessionRowsNode.innerHTML = data.sessions.length
      ? data.sessions
          .map((session) => {
            const client = clientById.get(session.client_id);
            const request = requestById.get(session.booking_request_id);
            const sessionType = request ? compactRequestLabel(requestTypeFromNotes(request.notes)) : "Coaching";
            const hasNotes = sessionHasCoachNotes(session);
            let actionMarkup = `<span class="dashboard-table__static-action">${escapeHtml(session.status === "completed" ? "Commission Ready" : normalizeStatusLabel(session.status))}</span>`;

            if (session.status === "scheduled") {
              const actionParts = [];

              if (sessionHasCoachCheckedIn(session)) {
                actionParts.push(`<span class="dashboard-table__static-action">${escapeHtml(buildSessionCheckInLabel(session))}</span>`);
              } else if (canCoachCheckInSession(session)) {
                actionParts.push(`<button class="btn btn-ghost" type="button" data-session-action="check-in" data-session-id="${escapeHtml(session.id)}">Check In</button>`);
              } else {
                actionParts.push(`<span class="dashboard-table__static-action">${escapeHtml(buildSessionCheckInLabel(session))}</span>`);
              }

              if (canCoachCompleteScheduledSession(session)) {
                actionParts.push(`<button class="btn btn-secondary" type="button" data-session-action="complete-notes" data-session-id="${escapeHtml(session.id)}">Complete + Notes</button>`);
              }

              actionMarkup = `
                <div class="dashboard-table-action-group">
                  ${actionParts.join("")}
                </div>
              `;
            } else if (session.status === "completed" && hasNotes) {
              actionMarkup = `
                <div class="dashboard-table-action-group">
                  <button class="btn btn-ghost" type="button" data-session-action="view-notes" data-session-id="${escapeHtml(session.id)}">View Notes</button>
                </div>
              `;
            } else if (session.status === "completed") {
              actionMarkup = `
                <div class="dashboard-table-action-group">
                  <button class="btn btn-ghost" type="button" data-session-action="add-notes" data-session-id="${escapeHtml(session.id)}">Add Notes</button>
                </div>
              `;
            }

            return `
              <tr>
                <td>${escapeHtml(formatDate(session.scheduled_start))}</td>
                <td>${escapeHtml(`${formatTime(session.scheduled_start)} - ${formatTime(session.scheduled_end)}`)}</td>
                <td>${escapeHtml(sessionType)}</td>
                <td>${escapeHtml(client?.displayName || "Client")}</td>
                <td class="dashboard-table__cell--status">${buildDashboardStatusMarkup(session.status)}</td>
                <td class="dashboard-table__cell--action">${actionMarkup}</td>
              </tr>
            `;
          })
          .join("")
      : `
        <tr>
          <td colspan="6">No confirmed sessions yet.</td>
        </tr>
      `;
    setTone(sessionRowsNode, data.sessions.length ? "warning" : "info");
  }

  function renderPoints(data, clientById) {
    if (!pointsRowsNode) {
      return;
    }

    const config = getGamificationConfig();
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const rows = Array.from(clientById.values())
      .sort((left, right) => left.displayName.localeCompare(right.displayName))
      .map((client) => {
        const weeklyEntries = client.pointsEntries.filter((entry) => {
          const createdAt = new Date(entry.created_at).getTime();
          return !Number.isNaN(createdAt) && createdAt >= oneWeekAgo;
        });
        const weeklyDelta = weeklyEntries.reduce((summary, entry) => summary + Number(entry.delta || 0), 0);
        const pendingCount = client.pointsEntries.filter((entry) => entry.approval_status === "pending").length;
        const levelSummary = config
          ? calculateBundleLevel(client.xpPoints, config.xpCurve)
          : null;
        const levelLabel = levelSummary
          ? levelSummary.remainingXp > 0
            ? `Level ${levelSummary.currentLevel} • ${formatNumber(levelSummary.remainingXp)} XP to Level ${levelSummary.nextLevel}`
            : `Level ${levelSummary.currentLevel} reached`
          : "No gamification level configured";
        const milestoneLabel = pendingCount
          ? `${pendingCount} reward request${pendingCount === 1 ? "" : "s"} pending • ${levelLabel}`
          : levelLabel;

        return `
          <tr>
            <td>${escapeHtml(client.displayName)}</td>
            <td>${escapeHtml(`${client.xpPoints} XP | ${client.gymCoins} Coins`)}</td>
            <td>${escapeHtml(weeklyDelta > 0 ? `+${weeklyDelta}` : String(weeklyDelta))}</td>
            <td>${escapeHtml(milestoneLabel)}</td>
          </tr>
        `;
      });

    if (isClientWorkspaceDetailsPending(data) && !rows.length) {
      pointsRowsNode.innerHTML = buildSkeletonTableRows(["Client", "Current Points", "Points This Week", "Milestone"], 3);
      return;
    }

    pointsRowsNode.innerHTML = rows.length
      ? rows.join("")
      : `
        <tr>
          <td colspan="4">No client point data available yet.</td>
        </tr>
      `;
  }

  function renderBookingRequests(data, clientById) {
    if (!bookingRequestRowsNode) {
      return;
    }

    const packageById = new Map((data.clientPackages || []).map((pkg) => [pkg.id, pkg]));

    const sortedRequests = (data.bookingRequests || [])
      .slice()
      .sort((left, right) => {
        const leftPending = left.status === "pending" ? 0 : 1;
        const rightPending = right.status === "pending" ? 0 : 1;
        if (leftPending !== rightPending) {
          return leftPending - rightPending;
        }

        const leftTime = new Date(`${left.requested_date}T${left.requested_time}`).getTime();
        const rightTime = new Date(`${right.requested_date}T${right.requested_time}`).getTime();
        return leftTime - rightTime;
      });

    if (isHomeDetailsPending(data) && !sortedRequests.length) {
      bookingRequestRowsNode.innerHTML = buildSkeletonTableRows(["Date", "Time", "Client", "Request", "Status", "Action"], 3);
      setTone(bookingRequestRowsNode, "info");
      return;
    }

    bookingRequestRowsNode.innerHTML = sortedRequests.length
      ? sortedRequests.map((request) => {
          const client = clientById.get(request.client_id);
          const requestLabel = requestTypeFromNotes(request.notes);
          const packageLabel = request.client_package_id
            ? packageById.get(request.client_package_id)?.package_name || "Assigned package"
            : "No package linked";
          const isPending = request.status === "pending";
          const actionMarkup = isPending
            ? `
              <div class="dashboard-table-action-group">
                <button class="btn btn-secondary" type="button" data-booking-action="approve" data-request-id="${escapeHtml(request.id)}">Approve</button>
                <button class="btn btn-ghost" type="button" data-booking-action="decline" data-request-id="${escapeHtml(request.id)}">Decline</button>
              </div>
            `
            : `<span class="dashboard-table__static-action">${escapeHtml(normalizeStatusLabel(request.status))}</span>`;

          return `
            <tr>
              <td>${escapeHtml(formatDate(request.requested_date))}</td>
              <td>${escapeHtml(formatTime(request.requested_time))}</td>
              <td>${escapeHtml(client?.displayName || "Client")}</td>
              <td class="dashboard-table__cell--request">${buildCompactRequestMarkup(requestLabel, packageLabel)}</td>
              <td class="dashboard-table__cell--status">${buildDashboardStatusMarkup(request.status)}</td>
              <td class="dashboard-table__cell--action">${actionMarkup}</td>
            </tr>
          `;
        }).join("")
      : buildEmptyTableRow(
          6,
          "No booking requests waiting.",
          "New session requests will land here first so you can approve, decline, and keep the week moving."
        );
    setTone(
      bookingRequestRowsNode,
      sortedRequests.some((request) => request.status === "pending") ? "alert" : sortedRequests.length ? "warning" : "success"
    );
  }

  function renderAvailability(data) {
    if (!availabilityRowsNode) {
      return;
    }

    const windows = sortAvailabilityWindows(data.availabilityWindows || []);
    if (!windows.length) {
      availabilityRowsNode.innerHTML = buildEmptyTableRow(
        4,
        "No availability windows published yet.",
        "Add at least one standing weekly window so clients see where to request sessions before they message you."
      );
      setAvailabilityFeedback("Add at least one weekly window so clients know which slots to request first.", false);
    } else {
      availabilityRowsNode.innerHTML = windows
        .map(
          (windowRecord) => `
            <tr>
              <td>${escapeHtml(formatDayOfWeek(windowRecord.day_of_week))}</td>
              <td>${escapeHtml(`${formatTime(windowRecord.start_time)} - ${formatTime(windowRecord.end_time)}`)}</td>
              <td>${escapeHtml(windowRecord.timezone || "Asia/Kuala_Lumpur")}</td>
              <td><button class="btn btn-ghost" type="button" data-availability-delete="${escapeHtml(windowRecord.id)}">Remove</button></td>
            </tr>
          `
        )
        .join("");
      setAvailabilityFeedback("Clients can now see these windows before submitting new booking or reschedule requests.", false);
    }

    if (liveAvailabilityCalendarNode && window.LEGACY_COACH_AVAILABILITY) {
      const liveAvailability = dashboardState.liveCoachAvailability;
      if (liveAvailability) {
        window.LEGACY_COACH_AVAILABILITY.renderCalendar(liveAvailabilityCalendarNode, {
          coachName: liveAvailability.coachName || data.profile?.display_name || "Coach",
          coach: liveAvailability,
          lookaheadDays: 28,
          interactive: false,
          useWorkspaceTheme: true,
          emptyMessage: "No published booking windows yet.",
        });
        const availableBlocks = window.LEGACY_COACH_AVAILABILITY.getAvailableBlockCount(liveAvailability, {
          lookaheadDays: 7,
          locale: "en-MY",
        });
        const hasLiveCalendarSnapshot = Boolean(liveAvailability?.calendar?.days?.length);
        setLiveAvailabilityFeedback(
          hasLiveCalendarSnapshot
            ? availableBlocks
              ? "This preview mirrors the public website and the client booking view. Busy blocks only appear after approval creates a session."
              : "Your public booking calendar is synced, but there are no open windows yet."
            : availableBlocks
              ? "Showing your published windows now while the live public booking preview finishes syncing."
              : "Your published windows are ready. The live public booking preview is still syncing.",
          hasLiveCalendarSnapshot && !availableBlocks
        );
      } else {
        liveAvailabilityCalendarNode.innerHTML = '<p class="coach-schedule-empty">Syncing your public booking calendar…</p>';
        setLiveAvailabilityFeedback("Syncing your public booking calendar…", false);
      }
    }
  }

  function renderSessionChangeRequests(data, clientById) {
    if (!sessionChangeRequestRowsNode) {
      return;
    }

    const rows = (data.sessionChangeRequests || []).slice().sort((left, right) => {
      const leftPending = left.status === "pending" ? 0 : 1;
      const rightPending = right.status === "pending" ? 0 : 1;
      if (leftPending !== rightPending) {
        return leftPending - rightPending;
      }

      return new Date(right.created_at).getTime() - new Date(left.created_at).getTime();
    });

    if (!rows.length) {
      sessionChangeRequestRowsNode.innerHTML = buildEmptyTableRow(
        6,
        "No session change requests waiting.",
        "Reschedule and cancellation requests will appear here when a client needs to adjust an approved session."
      );
      return;
    }

    sessionChangeRequestRowsNode.innerHTML = rows
      .map((request) => {
        const client = clientById.get(request.client_id);
        const isPending = request.status === "pending";
        const requestedChangeLabel = request.request_type === "cancel"
          ? "Cancel this session"
          : `${formatDateTime(request.requested_start)} - ${formatTime(request.requested_end)}`;
        const actionMarkup = isPending
          ? `
              <div class="dashboard-table-action-group">
                <button class="btn btn-secondary" type="button" data-change-request-action="approve" data-change-request-id="${escapeHtml(request.id)}">Approve</button>
                <button class="btn btn-ghost" type="button" data-change-request-action="decline" data-change-request-id="${escapeHtml(request.id)}">Decline</button>
              </div>
            `
          : `<span class="dashboard-table__static-action">${escapeHtml(normalizeStatusLabel(request.status))}</span>`;

        return `
          <tr>
            <td>${escapeHtml(client?.displayName || "Client")}</td>
            <td>${escapeHtml(normalizeRequestTypeLabel(request.request_type))}</td>
            <td>${escapeHtml(`${formatDateTime(request.original_start)} - ${formatTime(request.original_end)}`)}</td>
            <td>${escapeHtml(requestedChangeLabel)}</td>
            <td class="dashboard-table__cell--status">${buildDashboardStatusMarkup(request.status)}</td>
            <td class="dashboard-table__cell--action">${actionMarkup}</td>
          </tr>
        `;
      })
      .join("");
  }

  function renderCommissions(data, clientById) {
    const weekNode = document.getElementById("coach-commission-week");
    const monthNode = document.getElementById("coach-commission-month");
    const quarterNode = document.getElementById("coach-commission-quarter");
    const rateNode = document.getElementById("coach-commission-rate");
    const commissionOverviewSummaryNode = document.getElementById("coach-commission-overview-summary");
    if (!commissionRowsNode) {
      return;
    }

    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const currentMonthStart = startOfCurrentMonth();
    const currentQuarterStart = startOfCurrentQuarter();
    const sessionById = new Map((data.commissionSessions || []).map((session) => [session.id, session]));
    const packageById = new Map((data.clientPackages || []).map((pkg) => [pkg.id, pkg]));
    const records = data.commissions || [];
    const monthKeyForRecord = (record) => {
      const anchor = String(record.payout_month || record.created_at || "").trim();
      const match = anchor.match(/^(\d{4})-(\d{2})/u);
      if (match) {
        return `${match[1]}-${match[2]}`;
      }
      const date = new Date(anchor);
      if (Number.isNaN(date.getTime())) {
        return "";
      }
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    };

    const totals = records.reduce(
      (summary, record) => {
        const anchor = new Date(record.created_at || record.payout_month).getTime();
        if (!Number.isNaN(anchor) && anchor >= weekAgo) {
          summary.week += Number(record.amount_rm || 0);
        }

        const monthDate = new Date(record.payout_month || record.created_at);
        if (!Number.isNaN(monthDate.getTime()) && monthDate >= currentMonthStart) {
          summary.month += Number(record.amount_rm || 0);
        }

        if (!Number.isNaN(monthDate.getTime()) && monthDate >= currentQuarterStart) {
          summary.quarter += Number(record.amount_rm || 0);
        }

        summary.rateTotal += Number(record.commission_rate || 0);
        summary.rateCount += 1;
        return summary;
      },
      { week: 0, month: 0, quarter: 0, rateTotal: 0, rateCount: 0 }
    );

    if (weekNode) {
      weekNode.textContent = formatCurrency(totals.week);
    }

    if (monthNode) {
      monthNode.textContent = formatCurrency(totals.month);
    }

    if (quarterNode) {
      quarterNode.textContent = formatCurrency(totals.quarter);
    }

    if (rateNode) {
      const averageRate = totals.rateCount
        ? `${(totals.rateTotal / totals.rateCount * 100).toFixed(1)}%`
        : `${(Number(data.coachProfile?.commission_rate || 0) * 100).toFixed(1)}%`;
      rateNode.textContent = averageRate;
    }

    if (commissionOverviewSummaryNode) {
      const hasRecords = records.length > 0;
      const currentRate = totals.rateCount
        ? `${(totals.rateTotal / totals.rateCount * 100).toFixed(1)}% average live rate`
        : `${(Number(data.coachProfile?.commission_rate || 0) * 100).toFixed(1)}% base rate in profile`;
      const reviewDue = data.coachProfile?.review_due_at ? formatDate(data.coachProfile.review_due_at) : "Not scheduled yet";

      commissionOverviewSummaryNode.innerHTML = `
        <article class="dashboard-note" data-crm-tone="${hasRecords ? "success" : "warning"}">
          <strong>${escapeHtml(hasRecords ? "Live payout activity is now being tracked." : "No live payout rows yet.")}</strong>
          <p>${escapeHtml(
            hasRecords
              ? `${records.length} commission row${records.length === 1 ? "" : "s"} are already feeding this ledger, with ${formatCurrency(totals.month)} counted this month.`
              : "Completed package-linked sessions will start generating commission rows here once they are processed into the payout ledger."
          )}</p>
        </article>
        <article class="dashboard-note" data-crm-tone="info">
          <strong>Current rate and review posture</strong>
          <p>${escapeHtml(`${currentRate}. Next formal review: ${reviewDue}.`)}</p>
        </article>
      `;
    }

    const monthGroups = records.reduce((map, record) => {
      const monthKey = monthKeyForRecord(record);
      if (!monthKey) {
        return map;
      }
      const existing = map.get(monthKey) || [];
      existing.push(record);
      map.set(monthKey, existing);
      return map;
    }, new Map());
    const sortedMonthKeys = Array.from(monthGroups.keys()).sort((left, right) => right.localeCompare(left));
    if (!sortedMonthKeys.includes(dashboardState.selectedCommissionMonth)) {
      dashboardState.selectedCommissionMonth = sortedMonthKeys[0] || "";
    }

    if (commissionMonthGridNode) {
      commissionMonthGridNode.innerHTML = sortedMonthKeys.length
        ? sortedMonthKeys.map((monthKey) => {
            const monthRecords = monthGroups.get(monthKey) || [];
            const monthTotal = monthRecords.reduce((sum, record) => sum + Number(record.amount_rm || 0), 0);
            const readyCount = monthRecords.filter((record) => ["approved", "paid"].includes(record.payout_status)).length;
            const monthLabel = formatMonthLabel(`${monthKey}-01`);
            return `
              <button
                class="coach-commission-month-card${dashboardState.selectedCommissionMonth === monthKey ? " is-active" : ""}"
                type="button"
                data-commission-month="${escapeHtml(monthKey)}"
              >
                <span>${escapeHtml(monthLabel)}</span>
                <strong>${escapeHtml(formatCurrency(monthTotal))}</strong>
                <p>${escapeHtml(`${monthRecords.length} row${monthRecords.length === 1 ? "" : "s"} • ${readyCount} ready or paid`)}</p>
              </button>
            `;
          }).join("")
        : `
          <article class="coach-commission-month-card">
            <span>No data yet</span>
            <strong>RM 0.00</strong>
            <p>Monthly commission summaries will appear here once sessions start generating records.</p>
          </article>
        `;

      if (commissionMonthGridNode.dataset.bound !== "true") {
        commissionMonthGridNode.addEventListener("click", (event) => {
          const button = event.target.closest("[data-commission-month]");
          if (!(button instanceof HTMLButtonElement)) {
            return;
          }
          const nextMonth = button.getAttribute("data-commission-month") || "";
          if (!nextMonth || nextMonth === dashboardState.selectedCommissionMonth) {
            return;
          }
          dashboardState.selectedCommissionMonth = nextMonth;
          const latestData = dashboardState.lastData || data;
          renderCommissions(latestData, buildClientMaps(latestData));
        });
        commissionMonthGridNode.dataset.bound = "true";
      }
    }

    const selectedMonthRecords = dashboardState.selectedCommissionMonth
      ? (monthGroups.get(dashboardState.selectedCommissionMonth) || []).slice()
      : [];
    selectedMonthRecords.sort((left, right) => {
      const leftSession = sessionById.get(left.session_id);
      const rightSession = sessionById.get(right.session_id);
      const leftTime = new Date(leftSession?.scheduled_start || left.created_at || left.payout_month || 0).getTime();
      const rightTime = new Date(rightSession?.scheduled_start || right.created_at || right.payout_month || 0).getTime();
      return rightTime - leftTime;
    });

    if (commissionDetailPeriodNode) {
      commissionDetailPeriodNode.textContent = dashboardState.selectedCommissionMonth
        ? `${formatMonthLabel(`${dashboardState.selectedCommissionMonth}-01`)} session detail.`
        : "Pick a month above to review the client, date, time, and commission breakdown.";
    }

    commissionRowsNode.innerHTML = selectedMonthRecords.length
      ? selectedMonthRecords.map((record) => {
          const session = sessionById.get(record.session_id);
          const client = session ? clientById.get(session.client_id) : null;
          const packageName = session?.client_package_id
            ? packageById.get(session.client_package_id)?.package_name || "Assigned package"
            : "Session without package";
          const sessionDate = session?.scheduled_start || record.created_at || `${dashboardState.selectedCommissionMonth}-01`;

          return `
            <tr>
              <td>${escapeHtml(formatDate(sessionDate))}</td>
              <td>${escapeHtml(session?.scheduled_start ? formatTime(session.scheduled_start) : "Not set")}</td>
              <td>${escapeHtml(client?.displayName || "Client")}</td>
              <td>${escapeHtml(compactPackageLabel(packageName))}</td>
              <td>${escapeHtml(formatCurrency(record.amount_rm))}</td>
              <td class="dashboard-table__cell--status">${buildDashboardStatusMarkup(record.payout_status)}</td>
            </tr>
          `;
        }).join("")
      : `
        <tr class="dashboard-table__empty-row">
          <td colspan="6">
            <div class="dashboard-table__empty">
              <strong>No commission records yet.</strong>
              <p>As completed sessions start generating payout rows, the session-level breakdown will appear here automatically.</p>
            </div>
          </td>
        </tr>
      `;
  }

  function renderCoachKpiSummary(data) {
    const coachProfile = data.coachProfile || null;
    const positionPreset = findPositionPreset(coachProfile?.position_code);
    const tierPreset = findTierPreset(coachProfile?.commission_tier);
    const kpiSummary = hydrateKpiSummary(coachProfile?.commission_tier, coachProfile?.kpi_summary);
    const summaryCompletedSessions = Number(data.homeSummary?.completedSessionsThisMonth || 0);
    const completedSessionsThisMonth = summaryCompletedSessions || (data.sessions || []).filter((session) => {
      const completedAt = new Date(session.completed_at || session.scheduled_start);
      return session.status === "completed" && completedAt >= startOfCurrentMonth();
    }).length;
    const completedHours = Number(kpiSummary.hoursCompleted || completedSessionsThisMonth || 0);
    const targetHours = Number(coachProfile?.hours_target ?? positionPreset?.monthlyHoursTarget ?? tierPreset?.hoursTarget ?? 0);
    const checkedItems = (kpiSummary.items || []).filter((item) => item.checked).length;

    if (coachKpiPositionNode) {
      coachKpiPositionNode.textContent = positionPreset?.label || "Not assigned";
    }

    if (coachKpiTierNode) {
      coachKpiTierNode.textContent = coachProfile?.commission_tier
        ? `${coachProfile.commission_tier}${tierPreset?.title ? ` | ${tierPreset.title}` : ""}`
        : "No tier set";
    }

    if (coachKpiHoursNode) {
      coachKpiHoursNode.textContent = `${completedHours} / ${targetHours || 0} hrs`;
    }

    if (coachKpiReviewDateNode) {
      coachKpiReviewDateNode.textContent = coachProfile?.review_due_at ? formatDate(coachProfile.review_due_at) : "No review date";
    }

    if (coachKpiReviewNoteNode) {
      coachKpiReviewNoteNode.textContent = coachProfile?.review_due_at
        ? `Next review is scheduled for ${formatDate(coachProfile.review_due_at)}.`
        : "No quarterly review date has been assigned yet.";
    }

    if (coachKpiListNode) {
      renderCardList(
        coachKpiListNode,
        (kpiSummary.items || []).map((item) => ({
          title: item.label,
          chip: item.checked ? "Done" : "Pending",
          body: item.checked
            ? "This KPI line is already in place for the current review cycle."
            : "This KPI line still needs attention before the next formal review.",
        })),
        {
          emptyTitle: "No KPI checklist assigned yet",
          emptyBody: "Your review checklist will appear here once a tier and assessment structure are attached.",
        }
      );
    }

    if (coachCompPlanListNode) {
      const items = [
        {
          title: "Base rate",
          chip: "Live",
          body: `Current base rate is ${formatRatePercent(coachProfile?.commission_rate || tierPreset?.defaultCommissionRate || 0)} for the active commission setup.`,
        },
        {
          title: "Cap",
          chip: "Guardrail",
          body: `Current ceiling is ${formatRatePercent(coachProfile?.commission_cap || tierPreset?.cap || positionPreset?.cap || 0)} before bonus rules or promotion adjustments apply.`,
        },
        (coachProfile?.commission_bonus_notes || tierPreset?.upliftLabel || positionPreset?.upliftLabel)
          ? {
              title: "Bonus rule",
              chip: "Upside",
              body: coachProfile?.commission_bonus_notes || tierPreset?.upliftLabel || positionPreset?.upliftLabel,
            }
          : null,
        (positionPreset?.promotionGate || tierPreset?.promotionCriteria)
          ? {
              title: "Pathway",
              chip: "Progression",
              body: positionPreset?.promotionGate || tierPreset?.promotionCriteria,
            }
          : null,
        {
          title: "KPI checks",
          chip: `${checkedItems}/${(kpiSummary.items || []).length || 0}`,
          body: kpiSummary.assessmentComplete
            ? "Checklist and assessment are both complete for the current cycle."
            : "Checklist progress and assessment completion are tracked together here.",
        },
      ].filter(Boolean);

      renderCardList(coachCompPlanListNode, items, {
        emptyTitle: "Commission plan still pending",
        emptyBody: "Your base rate, cap, bonus rules, and progression pathway will appear here once the coach plan is assigned.",
      });
    }

    const reviewTime = coachProfile?.review_due_at ? new Date(coachProfile.review_due_at).getTime() : Number.NaN;
    const reviewTone = !coachProfile?.review_due_at
      ? "alert"
      : !Number.isNaN(reviewTime) && reviewTime < Date.now()
        ? "alert"
        : "warning";
    setTone(coachKpiPositionNode, coachProfile?.position_code ? "info" : "alert");
    setTone(coachKpiTierNode, coachProfile?.commission_tier ? "info" : "alert");
    setTone(coachKpiHoursNode, targetHours > 0 && completedHours >= targetHours ? "success" : "warning");
    setTone(coachKpiReviewDateNode, reviewTone);
    setTone(coachKpiListNode, checkedItems === (kpiSummary.items || []).length && kpiSummary.assessmentComplete ? "success" : "warning");
    setTone(coachCompPlanListNode, "success");
  }

  function buildCoachProfileOverview(data, clientById) {
    const displayName = data.profile?.display_name || data.access?.user?.email || "Coach";
    const avatarUrl = resolveCoachAvatarUrl(data, displayName);
    const coachProfile = data.coachProfile || null;
    const positionPreset = findPositionPreset(coachProfile?.position_code);
    const tierPreset = findTierPreset(coachProfile?.commission_tier);
    const kpiSummary = hydrateKpiSummary(coachProfile?.commission_tier, coachProfile?.kpi_summary);
    const sessions = data.sessions || [];
    const completedSessions = sessions.filter((session) => session.status === "completed");
    const scheduledSessions = sessions.filter((session) => session.status === "scheduled");
    const trackedSessions = sessions.filter((session) => session.status !== "cancelled");
    const completionRate = trackedSessions.length ? Math.round((completedSessions.length / trackedSessions.length) * 100) : 0;
    const currentMonthStart = startOfCurrentMonth();
    const monthlyCommission = (data.commissions || []).reduce((total, record) => {
      const payoutDate = new Date(record.payout_month || record.created_at);
      if (Number.isNaN(payoutDate.getTime()) || payoutDate < currentMonthStart) {
        return total;
      }
      return total + Number(record.amount_rm || 0);
    }, 0);
    const kpiChecked = (kpiSummary.items || []).filter((item) => item.checked).length;
    const kpiCount = (kpiSummary.items || []).length;
    const completedHours = Number(kpiSummary.hoursCompleted || 0);
    const targetHours = Number(coachProfile?.hours_target ?? positionPreset?.monthlyHoursTarget ?? tierPreset?.hoursTarget ?? 0);
    const pendingQueue = (data.bookingRequests || []).filter((item) => item.status === "pending").length +
      (data.sessionChangeRequests || []).filter((item) => item.status === "pending").length;
    const activeClients = data.assignments.length;
    const clientsWithActivePackages = Array.from(clientById.values()).filter((client) =>
      client.packages.some((pkg) => pkg.status === "active")
    ).length;
    const availabilityCount = (data.availabilityWindows || []).length;
    const commissionReadyCount = (data.commissions || []).filter((item) => item.payout_status === "approved" || item.payout_status === "paid").length;
    const readinessPercent = Math.round(
      (
        (targetHours ? Math.min(100, (completedHours / Math.max(targetHours, 1)) * 100) : 0) +
        (kpiCount ? (kpiChecked / kpiCount) * 100 : 0) +
        completionRate
      ) / 3
    );

    return {
      displayName,
      avatarUrl,
      roleLabel: [
        positionPreset?.label,
        tierPreset?.title || coachProfile?.commission_tier,
      ].filter(Boolean).join(" • ") || "LEGACY+ Coach profile",
      note: coachProfile?.notes || "Live coach performance, client load, and payout movement are synchronized from the CRM.",
      activeClients,
      baseRate: formatRatePercent(coachProfile?.commission_rate || tierPreset?.defaultCommissionRate || 0),
      monthlyCommission,
      reviewDue: coachProfile?.review_due_at ? formatDate(coachProfile.review_due_at) : "Not set",
      summaryMetrics: [
        {
          label: "Position",
          value: positionPreset?.label || "Not assigned",
          note: tierPreset?.title || "Tier pending",
        },
        {
          label: "Completed sessions",
          value: String(completedSessions.length),
          note: `${scheduledSessions.length} upcoming scheduled`,
        },
        {
          label: "Pending queue",
          value: String(pendingQueue),
          note: `${(data.sessionChangeRequests || []).filter((item) => item.status === "pending").length} change request${(data.sessionChangeRequests || []).filter((item) => item.status === "pending").length === 1 ? "" : "s"}`,
        },
        {
          label: "Active package coverage",
          value: `${clientsWithActivePackages}/${activeClients || 0}`,
          note: activeClients ? "Clients on live package balance" : "No roster yet",
        },
      ],
      metrics: [
        {
          label: "Hours target",
          valueLabel: targetHours ? `${completedHours}/${targetHours} hrs` : `${completedHours} hrs tracked`,
          percent: targetHours ? Math.min(100, Math.round((completedHours / Math.max(targetHours, 1)) * 100)) : 0,
        },
        {
          label: "KPI checklist",
          valueLabel: kpiCount ? `${kpiChecked}/${kpiCount} complete` : "No KPI checklist",
          percent: kpiCount ? Math.round((kpiChecked / kpiCount) * 100) : 0,
        },
        {
          label: "Session completion",
          valueLabel: `${completionRate}% verified`,
          percent: completionRate,
        },
        {
          label: "Availability visibility",
          valueLabel: availabilityCount ? `${availabilityCount} live window${availabilityCount === 1 ? "" : "s"}` : "No published windows",
          percent: Math.min(100, Math.round((availabilityCount / 6) * 100)),
        },
        {
          label: "Commission pipeline",
          valueLabel: (data.commissions || []).length ? `${commissionReadyCount}/${data.commissions.length} ready or paid` : "No commission rows",
          percent: (data.commissions || []).length ? Math.round((commissionReadyCount / data.commissions.length) * 100) : 0,
        },
        {
          label: "Review readiness",
          valueLabel: `${readinessPercent}% ready`,
          percent: readinessPercent,
        },
      ],
    };
  }

  function renderProfileBars(node, items) {
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

  function renderCoachProfilePage(data, clientById) {
    if (
      !profilePassportNode &&
      !profilePortraitNode &&
      !profileSummaryMetricsNode &&
      !profileProgressBarsNode &&
      !profilePerformanceStripNode &&
      !profileRosterRowsNode &&
      !profileSessionRowsNode &&
      !profileCommissionRowsNode &&
      !profileOpsListNode
    ) {
      return;
    }

    const overview = buildCoachProfileOverview(data, clientById);
    renderAvatarSurface(profilePassportNode, overview.displayName, overview.avatarUrl, getInitials(overview.displayName), {
      variant: "portrait",
      note: overview.avatarUrl ? "" : "Coach identity",
    });
    renderAvatarSurface(profilePortraitNode, overview.displayName, overview.avatarUrl, getInitials(overview.displayName), {
      variant: "portrait",
      note: overview.avatarUrl ? "" : "Coach portrait pending",
    });

    if (profilePassportNameNode) {
      profilePassportNameNode.textContent = overview.displayName;
    }
    if (profilePassportNoteNode) {
      profilePassportNoteNode.textContent = overview.roleLabel;
    }
    if (profileNameMainNode) {
      profileNameMainNode.textContent = overview.displayName.toUpperCase();
    }
    if (profileRoleNode) {
      profileRoleNode.textContent = overview.roleLabel;
    }
    if (profileNoteMainNode) {
      profileNoteMainNode.textContent = overview.note;
    }
    if (profilePortraitNameNode) {
      profilePortraitNameNode.textContent = overview.displayName.toUpperCase();
    }
    if (profilePortraitTaglineNode) {
      profilePortraitTaglineNode.textContent = overview.roleLabel;
    }
    if (profilePortraitNoteNode) {
      profilePortraitNoteNode.textContent = `${overview.activeClients} active clients, ${formatCurrency(overview.monthlyCommission)} this month, and live KPI tracking are now tied to this coach profile.`;
    }
    if (profileActiveClientsNode) {
      profileActiveClientsNode.textContent = String(overview.activeClients);
    }
    if (profileRateNode) {
      profileRateNode.textContent = overview.baseRate;
    }
    if (profileMonthlyCommissionNode) {
      profileMonthlyCommissionNode.textContent = formatCurrency(overview.monthlyCommission);
    }
    if (profileReviewDueNode) {
      profileReviewDueNode.textContent = overview.reviewDue;
    }
    if (profileSummaryMetricsNode) {
      profileSummaryMetricsNode.innerHTML = overview.summaryMetrics
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

    renderProfileBars(profileSummaryBarsNode, []);
    renderProfileBars(profileProgressBarsNode, overview.metrics);

    if (profilePerformanceStripNode) {
      profilePerformanceStripNode.innerHTML = overview.metrics
        .map(
          (item) => `
            <article class="profile-performance-card">
              <span>${escapeHtml(item.label)}</span>
              <strong>${escapeHtml(item.valueLabel)}</strong>
              <p>${escapeHtml(`${Math.max(0, Math.min(100, Number(item.percent || 0)))}% current coverage`)}</p>
            </article>
          `
        )
        .join("");
    }

    if (profileRosterRowsNode) {
      const rows = Array.from(clientById.values())
        .sort((left, right) => left.displayName.localeCompare(right.displayName))
        .slice(0, 8);
      profileRosterRowsNode.innerHTML = rows.length
        ? rows
            .map((client) => {
              const activePackage = activePackageForClient(client);
              return `
                <tr>
                  <td>${escapeHtml(client.displayName)}</td>
                  <td>${escapeHtml(client.primaryGoal || "Goal not set")}</td>
                  <td>${escapeHtml(`${client.xpPoints} XP / ${client.gymCoins} Coins`)}</td>
                  <td>${escapeHtml(activePackage ? compactPackageLabel(activePackage.package_name) : "No active package")}</td>
                </tr>
              `;
            })
            .join("")
        : `
            <tr class="dashboard-table__empty-row">
              <td colspan="4">
                <div class="dashboard-table__empty">
                  <strong>No assigned roster yet.</strong>
                  <p>Once clients are linked to this coach, their goal, package, and XP balance will appear here.</p>
                </div>
              </td>
            </tr>
          `;
    }

    if (profileSessionRowsNode) {
      const requestById = new Map((data.bookingRequests || []).map((item) => [item.id, item]));
      const rows = (data.sessions || [])
        .slice()
        .sort((left, right) => new Date(right.scheduled_start).getTime() - new Date(left.scheduled_start).getTime())
        .slice(0, 8);
      profileSessionRowsNode.innerHTML = rows.length
        ? rows
            .map((session) => {
              const client = clientById.get(session.client_id);
              const request = requestById.get(session.booking_request_id);
              return `
                <tr>
                  <td>${escapeHtml(formatDate(session.scheduled_start))}</td>
                  <td>${escapeHtml(client?.displayName || "Client")}</td>
                  <td>${escapeHtml(request ? requestTypeFromNotes(request.notes) : "Coaching Session")}</td>
                  <td>${escapeHtml(normalizeStatusLabel(session.status))}</td>
                </tr>
              `;
            })
            .join("")
        : `
            <tr class="dashboard-table__empty-row">
              <td colspan="4">
                <div class="dashboard-table__empty">
                  <strong>No recent sessions yet.</strong>
                  <p>Completed or scheduled sessions will appear here once the coach calendar starts moving live.</p>
                </div>
              </td>
            </tr>
          `;
    }

    if (profileCommissionRowsNode) {
      const sessionById = new Map((data.commissionSessions || data.sessions || []).map((session) => [session.id, session]));
      const rows = (data.commissions || []).slice(0, 8);
      profileCommissionRowsNode.innerHTML = rows.length
        ? rows
            .map((record) => {
              const session = sessionById.get(record.session_id);
              const client = session ? clientById.get(session.client_id) : null;
              return `
                <tr>
                  <td>${escapeHtml(formatMonthLabel(record.payout_month || record.created_at))}</td>
                  <td>${escapeHtml(client?.displayName || "Client")}</td>
                  <td>${escapeHtml(formatCurrency(record.amount_rm))}</td>
                  <td>${escapeHtml(normalizeStatusLabel(record.payout_status))}</td>
                </tr>
              `;
            })
            .join("")
        : `
            <tr class="dashboard-table__empty-row">
              <td colspan="4">
                <div class="dashboard-table__empty">
                  <strong>No commission rows yet.</strong>
                  <p>As payout entries are created, the most recent commission movement will show up here automatically.</p>
                </div>
              </td>
            </tr>
          `;
    }

    if (profileOpsListNode) {
      const coachProfile = data.coachProfile || {};
      const opsItems = [
        coachProfile.google_calendar_email
          ? `Calendar connected: ${coachProfile.google_calendar_email}`
          : "Google Calendar not connected yet.",
        coachProfile.review_due_at
          ? `Review due: ${formatDate(coachProfile.review_due_at)}`
          : "Quarterly review date not assigned yet.",
        coachProfile.promotion_ready ? "Promotion-ready flag is active." : "Promotion-ready flag is not active yet.",
        coachProfile.commission_bonus_notes
          ? `Bonus rule: ${coachProfile.commission_bonus_notes}`
          : "No custom bonus note assigned.",
      ].filter(Boolean);

      renderCardList(
        profileOpsListNode,
        opsItems.map((item) => ({
          title: item.split(":")[0] || "Operational note",
          chip: "Live",
          body: item,
        })),
        {
          emptyTitle: "Operational notes pending",
          emptyBody: "Calendar links, review timing, and promotion-readiness notes will appear here as the coach account fills out.",
        }
      );
    }
  }

  function renderCoachLeaderboard(data) {
    if (!coachLeaderboardRowsNode) {
      return;
    }

    const rows = Array.isArray(data.coachLeaderboard) ? data.coachLeaderboard : [];
    if (isHomeDetailsPending(data) && !rows.length) {
      coachLeaderboardRowsNode.innerHTML = buildCoachLeaderboardSkeleton(3);
      return;
    }

    if (!rows.length) {
      coachLeaderboardRowsNode.innerHTML = `
        <article class="leaderboard-row leaderboard-row--empty">
          <strong>Coach XP momentum appears once live coaching activity starts landing.</strong>
          <p>Approved XP, impact, and weekly coaching consistency will rank the board automatically once enough live activity is present.</p>
        </article>
      `;
      return;
    }

    coachLeaderboardRowsNode.innerHTML = rows
      .map((entry) => {
        const displayName = String(entry.displayName || "Coach").trim() || "Coach";
        const avatarUrl = resolveLeaderboardAvatarUrl(entry);

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
              </div>
            </div>
            <div class="leaderboard-row__metrics leaderboard-row__metrics--coach">
              <div>
                <span>Level</span>
                <strong>${escapeHtml(`Lv. ${formatNumber(entry.globalLevel || 1)}`)}</strong>
              </div>
              <div>
                <span>Total XP</span>
                <strong>${escapeHtml(formatNumber(entry.totalXpCounted || 0))}</strong>
              </div>
              <div>
                <span>Impact XP</span>
                <strong>${escapeHtml(formatNumber(entry.impactQuarterXp || 0))}</strong>
              </div>
            </div>
          </article>
        `;
      })
      .join("");
  }

  function renderDashboard(data) {
    dashboardState.lastData = data;
    const clientById = buildClientMaps(data);
    renderCoachClientWorkspaceTabs();
    syncCoachDeferredUiState(data);
    renderPointsActionOptions();
    syncPointsModeUi();
    renderStats(data, clientById);
    renderCoachOpsBrief();
    renderCoachKpiSummary(data);
    renderRoster(data, clientById);
    renderPackages(data, clientById);
    renderSessions(data, clientById);
    renderPoints(data, clientById);
    renderBookingRequests(data, clientById);
    renderAvailability(data);
    renderSessionChangeRequests(data, clientById);
    renderCommissions(data, clientById);
    renderCoachProfilePage(data, clientById);
    renderCoachLeaderboard(data);
    renderConsultWorkspace(data);
    renderClientAccessCodes(data);
    renderCoachSettings(data);
    syncSessionNoteOverlay();
    setStatus("");
  }

  async function loadGoogleCalendarStatus() {
    if (!calendarStatusNode && !calendarEmailNode && !calendarFeedbackNode) {
      return;
    }

    try {
      const accessToken = await getAccessToken();
      const response = await window.fetch("/.netlify/functions/google-calendar-status", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload?.error || "Unable to load Google Calendar status.");
      }

      if (calendarStatusNode) {
        calendarStatusNode.textContent = payload.connected
          ? "Connected and ready to sync"
          : payload.configured
            ? "Not connected yet"
            : "Waiting for Google credentials";
      }

      if (calendarEmailNode) {
        calendarEmailNode.textContent = payload.calendarEmail || "Not connected";
      }

      if (calendarConnectButton) {
        calendarConnectButton.disabled = !payload.configured;
      }

      if (calendarDisconnectButton) {
        calendarDisconnectButton.disabled = !payload.connected;
      }

      const url = new URL(window.location.href);
      const calendarState = String(url.searchParams.get("calendar") || "").trim();
      const message = String(url.searchParams.get("message") || "").trim();
      if (calendarState === "connected") {
        setCalendarFeedback("Google Calendar connected successfully. New approved sessions will sync automatically.", false);
      } else if (calendarState === "error") {
        setCalendarFeedback(message || "Google Calendar could not be connected.", true);
      } else if (!payload.configured) {
        setCalendarFeedback("Add your Google Calendar client ID and secret in Netlify before connecting this integration.", true);
      } else if (payload.connected) {
        setCalendarFeedback("Approved sessions and approved reschedules will sync into your Google Calendar.", false);
      } else {
        setCalendarFeedback("Connect Google Calendar if you want approved sessions to appear there automatically.", false);
      }

      if (calendarState) {
        url.searchParams.delete("calendar");
        url.searchParams.delete("message");
        window.history.replaceState({}, "", url.toString());
      }
    } catch (error) {
      setCalendarFeedback(error?.message || "Unable to load Google Calendar status.", true);
      if (calendarConnectButton) {
        calendarConnectButton.disabled = true;
      }
      if (calendarDisconnectButton) {
        calendarDisconnectButton.disabled = true;
      }
    }
  }

  async function loadDashboard(options) {
    const config = options || {};
    let hasVisibleData = Boolean(dashboardState.lastData);
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
          const hydratedCachedData = mergeDashboardData(cachedData, dashboardState.lastData);
          renderDashboard(hydratedCachedData);
          hasVisibleData = true;
          if (!silent) {
            setStatus("Loading fresh coach data...");
          }
        }
      }

      if (!hasVisibleData && !silent) {
        renderInitialDashboardSkeleton();
        setStatus("Loading your live coach dashboard data...");
      }

      const freshData = await fetchDashboardData(
        shouldDeferSecondaryPayload()
          ? { variant: "primary", fresh: config.fresh }
          : { fresh: config.fresh }
      );
      const data = mergeDashboardData(freshData, dashboardState.lastData);
      writeDashboardCache(access.user.id, data);
      renderDashboard(data);
      void refreshCoachOpsBrief();
      void syncLiveCoachAvailability(data);
      void setupRealtimeDashboardRefresh().catch(() => null);
      scheduleAfterInitialPaint(() => hydrateDeferredDashboardSections(loadCycleId, access.user.id));
      if (DASHBOARD_PAGE_KEY === "clients" && data.clientWorkspaceDetailsLoaded === false) {
        setStatus("Roster is ready. Consults and client access history are syncing now...");
      } else if (DASHBOARD_PAGE_KEY === "home" && data.homeDetailsLoaded === false) {
        setStatus("Coach home is ready. Detailed queues and leaderboard are syncing now...");
      }
      if (calendarStatusNode || calendarEmailNode || calendarConnectButton || calendarDisconnectButton) {
        void loadGoogleCalendarStatus();
      }
      if (loadStartedAt) {
        console.info(`[LEGACY] Coach dashboard rendered in ${Math.round(window.performance.now() - loadStartedAt)}ms`);
      }
      setPointsFeedback(
        getGamificationConfig()
          ? "Rules-engine reward requests are submitted as pending for super admin approval."
          : "Reward requests are submitted as pending for super admin approval.",
        false
      );
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
          void syncLiveCoachAvailability(hydratedCachedData);
          setStatus("Showing recent saved data while the live refresh retries.", true);
          return;
        }
      }

      setStatus(error?.message || "Unable to load your live coach dashboard data right now.", true);
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

  async function submitPointsRequest(event) {
    event.preventDefault();
    if (!(pointsForm instanceof HTMLFormElement) || !pointsForm.reportValidity()) {
      return;
    }

    const submitButton = event.submitter instanceof HTMLButtonElement
      ? event.submitter
      : pointsForm.querySelector('button[type="submit"]');
    if (submitButton instanceof HTMLButtonElement && submitButton.disabled) {
      return;
    }

    const releaseSubmit = setBusyButtonState(submitButton, "Submitting...");

    try {
      const { access, supabase } = await loadAccessAndClient();
      const formData = new FormData(pointsForm);
      const clientId = String(formData.get("clientId") || "").trim();
      const rewardMode = String(formData.get("rewardMode") || "bundle").trim();
      const gamificationConfig = getGamificationConfig();
      const useBundle = rewardMode !== "manual" && Boolean(gamificationConfig);
      let payload = [];

      if (!clientId) {
        setPointsFeedback("Select a client before submitting a reward request.", true);
        return;
      }

      if (useBundle) {
        const actionId = String(formData.get("actionId") || "").trim();
        const coachNote = String(formData.get("coachNote") || "").trim();
        const action = gamificationConfig?.actionsById.get(actionId);

        if (!action) {
          setPointsFeedback("Select a rules-engine action before submitting the reward request.", true);
          return;
        }

        const reason = buildRewardReason(action, coachNote);
        if (Number(action.xp || 0) > 0) {
          payload.push({
            client_id: clientId,
            points_type: "xp",
            delta: Number(action.xp || 0),
            reason,
            requested_by: access.user.id,
            approval_status: "pending",
          });
        }
        if (Number(action.coins || 0) > 0) {
          payload.push({
            client_id: clientId,
            points_type: "gym_coins",
            delta: Number(action.coins || 0),
            reason,
            requested_by: access.user.id,
            approval_status: "pending",
          });
        }

        if (!payload.length) {
          setPointsFeedback("The selected action does not contain any XP or gym coin reward output.", true);
          return;
        }
      } else {
        const pointsType = String(formData.get("pointsType") || "").trim();
        const delta = Number(formData.get("delta") || 0);
        const reason = String(formData.get("reason") || "").trim();

        if (!pointsType || !delta || !reason) {
          setPointsFeedback("Select a manual reward type, amount, and reason.", true);
          return;
        }

        payload = [
          {
            client_id: clientId,
            points_type: pointsType,
            delta,
            reason,
            requested_by: access.user.id,
            approval_status: "pending",
          },
        ];
      }

      setPointsFeedback("Submitting reward request...", false);

      const { error } = await supabase.from("points_ledger").insert(payload);

      if (error) {
        throw error;
      }

      pointsForm.reset();
      if (pointsModeSelect) {
        pointsModeSelect.value = gamificationConfig ? "bundle" : "manual";
      }
      renderPointsActionOptions();
      syncPointsModeUi();
      const successMessage = useBundle
        ? `Submitted ${payload.length} pending reward entr${payload.length === 1 ? "y" : "ies"} from the rules engine for super admin approval.`
        : "Manual reward request submitted for super admin approval.";
      await loadDashboard();
      setPointsFeedback(
        successMessage,
        false
      );
    } catch (error) {
      setPointsFeedback(error?.message || "Unable to submit the reward request right now.", true);
    } finally {
      releaseSubmit();
    }
  }

  async function reviewBookingRequest(requestId, action, triggerButton = null) {
    const request = dashboardState.bookingRequests.find((item) => item.id === requestId);
    if (!request || request.status !== "pending") {
      return;
    }

    try {
      const coachNoteInput = window.prompt(
        action === "approve"
          ? "Add an optional coach note for the client before approving this booking."
          : "Add an optional coach note for the client before declining this booking.",
        ""
      );
      if (coachNoteInput === null) {
        return;
      }

      const releaseButton = setBusyButtonState(
        triggerButton,
        action === "approve" ? "Approving..." : "Declining..."
      );
      const accessToken = await getAccessToken();
      setStatus(
        action === "approve"
          ? "Approving booking request and creating session..."
          : "Declining booking request..."
      );

      const response = await window.fetch("/.netlify/functions/review-booking-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          requestId,
          action,
          coachNote: String(coachNoteInput || "").trim(),
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error || "Unable to review the booking request right now.");
      }

      await loadDashboard();
      if (payload?.warning) {
        setStatus(payload.warning, false);
      }
    } catch (error) {
      setStatus(error?.message || "Unable to update the booking request right now.", true);
    } finally {
      releaseButton();
    }
  }

  async function submitAvailabilityWindow(event) {
    event.preventDefault();
    if (!(availabilityForm instanceof HTMLFormElement) || !availabilityForm.reportValidity()) {
      return;
    }

    const submitButton = event.submitter instanceof HTMLButtonElement
      ? event.submitter
      : availabilityForm.querySelector('button[type="submit"]');
    if (submitButton instanceof HTMLButtonElement && submitButton.disabled) {
      return;
    }

    const releaseSubmit = setBusyButtonState(submitButton, "Saving...");

    try {
      const { access, supabase } = await loadAccessAndClient();
      const formData = new FormData(availabilityForm);
      const dayOfWeek = Number(formData.get("dayOfWeek"));
      const startTime = String(formData.get("startTime") || "").trim();
      const endTime = String(formData.get("endTime") || "").trim();

      if (!Number.isInteger(dayOfWeek) || !startTime || !endTime) {
        setAvailabilityFeedback("Choose a weekday, start time, and end time for the new availability window.", true);
        return;
      }

      if (timeStringToMinutes(endTime) <= timeStringToMinutes(startTime)) {
        setAvailabilityFeedback("The end time must be after the start time.", true);
        return;
      }

      setAvailabilityFeedback("Saving availability window...", false);

      const { error } = await supabase.from("coach_availability_windows").insert({
        coach_id: access.user.id,
        day_of_week: dayOfWeek,
        start_time: startTime,
        end_time: endTime,
        timezone: "Asia/Kuala_Lumpur",
        is_active: true,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        throw error;
      }

      availabilityForm.reset();
      await loadDashboard({
        fresh: true,
      });
      setAvailabilityFeedback("Availability window added.", false);
    } catch (error) {
      setAvailabilityFeedback(error?.message || "Unable to save the availability window right now.", true);
    } finally {
      releaseSubmit();
    }
  }

  async function deleteAvailabilityWindow(windowId, triggerButton = null) {
    if (!windowId) {
      return;
    }

    const releaseButton = setBusyButtonState(triggerButton, "Removing...");
    try {
      const { supabase } = await loadAccessAndClient();
      setAvailabilityFeedback("Removing availability window...", false);
      const { error } = await supabase.from("coach_availability_windows").delete().eq("id", windowId);
      if (error) {
        throw error;
      }

      await loadDashboard({
        fresh: true,
      });
      setAvailabilityFeedback("Availability window removed.", false);
    } catch (error) {
      setAvailabilityFeedback(error?.message || "Unable to remove the availability window right now.", true);
    } finally {
      releaseButton();
    }
  }

  async function reviewSessionChangeRequest(requestId, action, triggerButton = null) {
    const request = dashboardState.sessionChangeRequests.find((item) => item.id === requestId);
    if (!request || request.status !== "pending") {
      return;
    }

    const releaseButton = setBusyButtonState(
      triggerButton,
      action === "approve" ? "Approving..." : "Declining..."
    );
    try {
      const accessToken = await getAccessToken();
      setStatus(
        action === "approve"
          ? "Applying the session change request..."
          : "Declining the session change request..."
      );

      const response = await window.fetch("/.netlify/functions/review-session-change-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          requestId,
          action,
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error || "Unable to review the session change request right now.");
      }

      await loadDashboard();
      if (payload?.warning) {
        setStatus(payload.warning, false);
      }
    } catch (error) {
      setStatus(error?.message || "Unable to review the session change request right now.", true);
    } finally {
      releaseButton();
    }
  }

  async function connectGoogleCalendar() {
    try {
      const accessToken = await getAccessToken();
      setCalendarFeedback("Preparing Google Calendar connection...", false);

      const response = await window.fetch("/.netlify/functions/google-calendar-auth-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          returnPath: window.location.pathname || "/coach-schedule.html",
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload?.authUrl) {
        throw new Error(payload?.error || "Unable to start Google Calendar authentication.");
      }

      window.location.assign(payload.authUrl);
    } catch (error) {
      setCalendarFeedback(error?.message || "Unable to connect Google Calendar right now.", true);
    }
  }

  async function disconnectGoogleCalendar() {
    try {
      const accessToken = await getAccessToken();
      setCalendarFeedback("Disconnecting Google Calendar...", false);

      const response = await window.fetch("/.netlify/functions/google-calendar-disconnect", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error || "Unable to disconnect Google Calendar.");
      }

      await loadDashboard();
      setCalendarFeedback("Google Calendar disconnected.", false);
    } catch (error) {
      setCalendarFeedback(error?.message || "Unable to disconnect Google Calendar right now.", true);
    }
  }

  async function submitConsultIntake(event) {
    event.preventDefault();
    if (!(consultForm instanceof HTMLFormElement) || !consultForm.reportValidity()) {
      return;
    }

    const submitButton = event.submitter instanceof HTMLButtonElement
      ? event.submitter
      : consultForm.querySelector('button[type="submit"]');
    if (submitButton instanceof HTMLButtonElement && submitButton.disabled) {
      return;
    }

    const releaseSubmit = setBusyButtonState(submitButton, "Submitting...");

    try {
      const accessToken = await getAccessToken();
      const formData = new FormData(consultForm);
      const riskFlags = String(formData.get("riskFlagsText") || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      const payload = Object.fromEntries(formData.entries());
      payload.riskFlags = riskFlags;

      setConsultFeedback("Submitting consult intake and creating the lead...", false);

      const response = await window.fetch("/.netlify/functions/capture-coach-consult", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result?.error || "Unable to submit the consult intake.");
      }

      consultForm.reset();
      dashboardState.clientWorkspacePanel = "consults";
      setConsultFeedback(
        result?.status === "updated"
          ? "Existing lead updated from the consult intake."
          : "Consult lead created and added to your pipeline.",
        false
      );
      await loadDashboard({
        silent: true,
        reason: "consult-intake",
      });
    } catch (error) {
      setConsultFeedback(error?.message || "Unable to submit the consult intake right now.", true);
    } finally {
      releaseSubmit();
    }
  }

  async function submitConsultFollowUp(event) {
    event.preventDefault();
    if (!(consultFollowUpForm instanceof HTMLFormElement) || !consultFollowUpForm.reportValidity()) {
      return;
    }

    const submitButton = event.submitter instanceof HTMLButtonElement
      ? event.submitter
      : consultFollowUpForm.querySelector('button[type="submit"]');
    if (submitButton instanceof HTMLButtonElement && submitButton.disabled) {
      return;
    }

    const releaseSubmit = setBusyButtonState(submitButton, "Saving...");

    try {
      const accessToken = await getAccessToken();
      const formData = new FormData(consultFollowUpForm);
      const leadId = String(formData.get("leadId") || "").trim();
      const status = String(formData.get("status") || "contacted").trim();
      const nextFollowUpAt = String(formData.get("nextFollowUpAt") || "").trim();
      const notes = String(formData.get("notes") || "").trim();

      if (!leadId || !notes) {
        setConsultFollowUpFeedback("Select a lead and enter a follow-up note before saving.", true);
        return;
      }

      const lead = (dashboardState.leads || []).find((item) => item.id === leadId);
      if (!lead) {
        setConsultFollowUpFeedback("Select a valid consult lead before saving the update.", true);
        return;
      }

      if (status === "converted" && !lead.converted_client_id) {
        setConsultFollowUpFeedback("This lead must be converted into a client account before it can be marked converted.", true);
        return;
      }

      setConsultFollowUpFeedback("Saving lead update...", false);

      const response = await window.fetch("/.netlify/functions/manage-leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          action: "follow_up",
          leadId,
          activityType: "coach_follow_up",
          status,
          nextFollowUpAt,
          notes,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result?.error || "Unable to save the lead update right now.");
      }

      consultFollowUpForm.reset();
      setConsultFollowUpFeedback(`Lead update saved for ${lead.full_name || "the selected lead"}.`, false);
      await loadDashboard({
        silent: true,
        reason: "consult-follow-up",
      });
    } catch (error) {
      setConsultFollowUpFeedback(error?.message || "Unable to save the lead update right now.", true);
    } finally {
      releaseSubmit();
    }
  }

  async function submitClientAccessCode(event) {
    event.preventDefault();
    if (!(clientCodeForm instanceof HTMLFormElement) || !clientCodeForm.reportValidity()) {
      return;
    }

    const submitButton = event.submitter instanceof HTMLButtonElement
      ? event.submitter
      : clientCodeForm.querySelector('button[type="submit"]');
    if (submitButton instanceof HTMLButtonElement && submitButton.disabled) {
      return;
    }

    const releaseSubmit = setBusyButtonState(submitButton, "Generating...");

    try {
      const accessToken = await getAccessToken();
      const formData = new FormData(clientCodeForm);
      const recipientEmail = String(formData.get("recipientEmail") || "").trim();
      const recipientName = String(formData.get("recipientName") || "").trim();
      const notes = String(formData.get("notes") || "").trim();

      if (!recipientEmail) {
        setClientCodeFeedback("Client email is required before generating an access code.", true);
        return;
      }

      setClientCodeFeedback("Generating client access code...", false);

      const response = await window.fetch("/.netlify/functions/manage-activation-codes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          action: "generate",
          role: "client",
          recipientEmail,
          recipientName,
          notes,
        }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result?.error || "Unable to generate the client access code.");
      }

      clientCodeForm.reset();
      dashboardState.clientWorkspacePanel = "access";
      setClientCodeFeedback(`Client code generated: ${result?.code?.code || "Ready"}`, false);
      await loadDashboard({
        silent: true,
        reason: "client-auth-code",
      });
    } catch (error) {
      setClientCodeFeedback(error?.message || "Unable to generate the access code right now.", true);
    } finally {
      releaseSubmit();
    }
  }

  async function submitPayoutDetails(event) {
    event.preventDefault();
    if (!(coachPayoutForm instanceof HTMLFormElement) || !coachPayoutForm.reportValidity()) {
      return;
    }

    const submitButton = event.submitter instanceof HTMLButtonElement
      ? event.submitter
      : coachPayoutForm.querySelector('button[type="submit"]');
    if (submitButton instanceof HTMLButtonElement && submitButton.disabled) {
      return;
    }

    const releaseSubmit = setBusyButtonState(submitButton, "Saving...");

    try {
      const { supabase } = await loadAccessAndClient();
      const formData = new FormData(coachPayoutForm);
      const bankName = String(formData.get("bankName") || "").trim();
      const accountName = String(formData.get("accountName") || "").trim();
      const accountNumber = String(formData.get("accountNumber") || "").trim();
      const bankCode = String(formData.get("bankCode") || "").trim();

      if (!bankName || !accountName || !accountNumber) {
        setPayoutFeedback("Bank name, account holder name, and account number are required.", true);
        return;
      }

      setPayoutFeedback("Saving payout details...", false);

      const { error } = await supabase
        .from("coach_profiles")
        .update({
          payout_bank_name: bankName,
          payout_account_name: accountName,
          payout_account_number: accountNumber,
          payout_bank_code: bankCode || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", dashboardState.access?.user?.id || "");

      if (error) {
        throw error;
      }

      setPayoutFeedback("Payout details saved.", false);
      await loadDashboard({
        silent: true,
        reason: "payout-details",
      });
    } catch (error) {
      setPayoutFeedback(error?.message || "Unable to save payout details right now.", true);
    } finally {
      releaseSubmit();
    }
  }

  async function completeSession(sessionId, details = {}) {
    const session = dashboardState.sessions.find((item) => item.id === sessionId);
    if (!session || session.status !== "scheduled") {
      return;
    }

    try {
      const accessToken = await getAccessToken();
      setStatus("Completing session, saving notes, and generating commission...");

      const response = await window.fetch("/.netlify/functions/complete-coach-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          sessionId,
          coachNote: String(details.coachNote || "").trim(),
          nextStep: String(details.nextStep || "").trim(),
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error || "Unable to complete the session right now.");
      }

      return payload;
    } catch (error) {
      throw error;
    }
  }

  async function checkInSession(sessionId, triggerButton) {
    const session = dashboardState.sessions.find((item) => item.id === sessionId);
    if (!session || session.status !== "scheduled" || sessionHasCoachCheckedIn(session)) {
      return;
    }

    const releaseButton = setBusyButtonState(triggerButton, "Checking In...");

    try {
      const accessToken = await getAccessToken();
      setStatus("Checking into the session...");

      const response = await window.fetch("/.netlify/functions/check-in-coach-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          sessionId,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error || "Unable to check into the session right now.");
      }

      setStatus(payload?.message || "Session checked in.");
      await loadDashboard({
        fresh: true,
      });
    } finally {
      releaseButton();
    }
  }

  async function saveSessionNotes(sessionId, details = {}) {
    const session = dashboardState.sessions.find((item) => item.id === sessionId);
    if (!session || session.status !== "completed") {
      return;
    }

    try {
      const accessToken = await getAccessToken();
      setStatus("Saving session notes...");

      const response = await window.fetch("/.netlify/functions/save-coach-session-notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          sessionId,
          coachNote: String(details.coachNote || "").trim(),
          nextStep: String(details.nextStep || "").trim(),
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error || "Unable to save the session notes right now.");
      }

      return payload;
    } catch (error) {
      throw error;
    }
  }

  async function submitSessionNoteForm(event) {
    event.preventDefault();
    if (!(sessionNoteForm instanceof HTMLFormElement) || !sessionNoteForm.reportValidity()) {
      return;
    }

    const mode = String(sessionNoteForm.dataset.mode || "").trim();
    const sessionId = String(sessionNoteForm.dataset.sessionId || "").trim();
    if (!sessionId || mode === "view") {
      return;
    }

    const submitButton = event.submitter instanceof HTMLButtonElement
      ? event.submitter
      : sessionNoteSubmitButton;
    const releaseSubmit = setBusyButtonState(submitButton, mode === "complete" ? "Completing..." : "Saving...");
    const coachNote = String(sessionNoteField?.value || "").trim();
    const nextStep = String(sessionNextStepField?.value || "").trim();

    try {
      setSessionNoteFeedback(
        mode === "complete"
          ? "Completing the session and saving the coaching notes..."
          : "Saving the coaching notes...",
        false
      );

      if (mode === "complete") {
        await completeSession(sessionId, { coachNote, nextStep });
      } else {
        await saveSessionNotes(sessionId, { coachNote, nextStep });
      }

      closeSessionNoteOverlay({ restoreFocus: false });
      await loadDashboard({
        fresh: true,
      });
    } catch (error) {
      const message = error?.message || (mode === "complete"
        ? "Unable to complete the session right now."
        : "Unable to save the session notes right now.");
      setSessionNoteFeedback(message, true);
      setStatus(message, true);
    } finally {
      releaseSubmit();
    }
  }

  if (pointsForm) {
    pointsForm.addEventListener("submit", submitPointsRequest);
  }

  if (pointsModeSelect) {
    pointsModeSelect.addEventListener("change", syncPointsModeUi);
  }

  if (pointsActionSelect) {
    pointsActionSelect.addEventListener("change", renderPointsActionPreview);
  }

  if (availabilityForm) {
    availabilityForm.addEventListener("submit", submitAvailabilityWindow);
  }

  if (consultForm) {
    consultForm.addEventListener("submit", submitConsultIntake);
  }

  if (consultFollowUpForm) {
    consultFollowUpForm.addEventListener("submit", submitConsultFollowUp);
  }

  if (clientCodeForm) {
    clientCodeForm.addEventListener("submit", submitClientAccessCode);
  }

  if (coachPayoutForm) {
    coachPayoutForm.addEventListener("submit", submitPayoutDetails);
  }

  if (sessionNoteForm) {
    sessionNoteForm.addEventListener("submit", submitSessionNoteForm);
  }

  if (sessionNoteOverlayNode) {
    sessionNoteOverlayNode.addEventListener("click", (event) => {
      if (event.target.closest("[data-session-note-close]")) {
        closeSessionNoteOverlay();
        return;
      }

      if (event.target.closest("#coach-session-note-edit")) {
        promoteSessionNoteOverlayToEdit();
      }
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && dashboardState.sessionNoteOverlay.isOpen) {
      closeSessionNoteOverlay();
    }
  });

  if (coachClientsTabs.length) {
    coachClientsTabs.forEach((button) => {
      button.addEventListener("click", () => {
        dashboardState.clientWorkspacePanel = button.dataset.coachClientsTab || "roster";
        renderCoachClientWorkspaceTabs();
        if (
          shouldDeferSecondaryPayload()
          && dashboardState.lastData?.clientWorkspaceDetailsLoaded === false
          && dashboardState.access?.user?.id
          && !dashboardState.deferredHydrationInFlight
        ) {
          scheduleAfterInitialPaint(() => hydrateDeferredDashboardSections(dashboardState.loadCycleId, dashboardState.access.user.id));
        }
      });
    });
  }

  if (availabilityRowsNode) {
    availabilityRowsNode.addEventListener("click", (event) => {
      const button = event.target.closest("[data-availability-delete]");
      if (!button) {
        return;
      }

      const windowId = String(button.getAttribute("data-availability-delete") || "").trim();
      if (!windowId) {
        return;
      }

      deleteAvailabilityWindow(windowId, button);
    });
  }

  if (bookingRequestRowsNode) {
    bookingRequestRowsNode.addEventListener("click", (event) => {
      const button = event.target.closest("[data-booking-action]");
      if (!button) {
        return;
      }

      const requestId = button.getAttribute("data-request-id");
      const action = button.getAttribute("data-booking-action");
      if (!requestId || (action !== "approve" && action !== "decline")) {
        return;
      }

      reviewBookingRequest(requestId, action, button);
    });
  }

  if (consultRowsNode) {
    consultRowsNode.addEventListener("click", (event) => {
      const button = event.target.closest("[data-coach-consult-load]");
      if (!button) {
        return;
      }

      const leadId = String(button.getAttribute("data-coach-consult-load") || "").trim();
      const lead = (dashboardState.leads || []).find((item) => item.id === leadId);
      if (!lead) {
        return;
      }

      dashboardState.clientWorkspacePanel = "consults";
      renderCoachClientWorkspaceTabs();
      prefillConsultFollowUp(lead);
      consultFollowUpForm?.scrollIntoView({ behavior: "smooth", block: "start" });
      setConsultFollowUpFeedback(`Loaded ${lead.full_name || "the selected lead"} into the follow-up form.`, false);
    });
  }

  if (sessionChangeRequestRowsNode) {
    sessionChangeRequestRowsNode.addEventListener("click", (event) => {
      const button = event.target.closest("[data-change-request-action]");
      if (!button) {
        return;
      }

      const requestId = String(button.getAttribute("data-change-request-id") || "").trim();
      const action = String(button.getAttribute("data-change-request-action") || "").trim();
      if (!requestId || (action !== "approve" && action !== "decline")) {
        return;
      }

      reviewSessionChangeRequest(requestId, action, button);
    });
  }

  if (sessionRowsNode) {
    sessionRowsNode.addEventListener("click", (event) => {
      const button = event.target.closest("[data-session-action]");
      if (!button) {
        return;
      }

      const sessionId = button.getAttribute("data-session-id");
      const action = button.getAttribute("data-session-action");
      if (!sessionId) {
        return;
      }

      if (action === "check-in") {
        checkInSession(sessionId, button).catch((error) => {
          setStatus(error?.message || "Unable to check into the session right now.", true);
        });
        return;
      }

      if (action === "complete-notes") {
        openSessionNoteOverlay(sessionId, "complete", button);
        return;
      }

      if (action === "add-notes") {
        openSessionNoteOverlay(sessionId, "add", button);
        return;
      }

      if (action === "view-notes") {
        openSessionNoteOverlay(sessionId, "view", button);
      }
    });
  }

  if (calendarConnectButton) {
    calendarConnectButton.addEventListener("click", connectGoogleCalendar);
  }

  if (calendarDisconnectButton) {
    calendarDisconnectButton.addEventListener("click", disconnectGoogleCalendar);
  }

  renderPointsActionOptions();
  syncPointsModeUi();
  loadDashboard();
})();
