(function initCoachXpModule() {
  const page = document.body?.dataset?.xpCoachPage || "dashboard";
  const statusNode = document.getElementById("xp-coach-status");
  const MODULE_TABS = [
    { key: "dashboard", href: "./index.html", label: "Ledger Dashboard" },
    { key: "roster", href: "./coach-roster.html", label: "Coach Roster" },
    { key: "actions", href: "./xp-menu.html", label: "XP Menu" },
    { key: "events", href: "./xp-log.html", label: "XP Log" },
    { key: "trials", href: "./trials-manager.html", label: "Trials Manager" },
    { key: "seeding", href: "./seeding-tool.html", label: "Seeding Tool" },
  ];

  const state = {
    roster: [],
    profileOptions: [],
    actions: [],
    actionOptions: [],
    events: [],
    trials: [],
    seeding: [],
    settings: [],
    ledger: [],
    weekly: [],
    monthly: [],
    quarterly: [],
    coachLookup: new Map(),
    actionLookup: new Map(),
    actionsUi: {
      group: "all",
      page: 1,
      pageSize: 10,
    },
  };

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatNumber(value) {
    return new Intl.NumberFormat("en-MY").format(Number(value || 0));
  }

  function formatDate(value) {
    if (!value) return "—";
    const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);
    if (Number.isNaN(date.getTime())) return String(value);
    return new Intl.DateTimeFormat("en-MY", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  }

  function setStatus(message, tone = "") {
    if (!statusNode) {
      return;
    }
    statusNode.textContent = message || "";
    statusNode.dataset.state = tone || "";
  }

  function rootPath(pathname) {
    const clean = String(pathname || "").replace(/^\.\//, "");
    return `../${clean}`;
  }

  function buildAuthHeaders(token) {
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }

  async function apiFetch(endpoint, options = {}) {
    const token = await window.legacyAuth.getAccessToken();
    if (!token) {
      throw new Error("Missing session token.");
    }

    const response = await fetch(`/.netlify/functions/${endpoint}`, {
      method: options.method || "GET",
      headers: buildAuthHeaders(token),
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.error || "Request failed.");
    }
    return payload;
  }

  function renderModuleTabs() {
    const navNode = document.getElementById("xp-coach-page-tabs");
    if (!navNode) {
      return;
    }

    navNode.innerHTML = MODULE_TABS.map(
      (tab) => `
        <a class="xp-coach-tab${tab.key === page ? " is-active" : ""}" href="${tab.href}">
          <span>${escapeHtml(tab.label)}</span>
        </a>
      `
    ).join("");
  }

  async function ensureSuperAdmin() {
    const access = await window.legacyAuth.requireRole("super_admin");
    if (access.ok) {
      return access;
    }

    const redirectTarget = access.redirectPath ? rootPath(access.redirectPath) : rootPath("account.html");
    window.location.href = redirectTarget;
    throw new Error("Access denied.");
  }

  function optionMarkup(options, valueKey, labelBuilder, selectedValue = "") {
    return options
      .map((option) => {
        const value = String(option[valueKey] || "");
        const selected = value === String(selectedValue || "") ? " selected" : "";
        return `<option value="${escapeHtml(value)}"${selected}>${escapeHtml(labelBuilder(option))}</option>`;
      })
      .join("");
  }

  function bindFormReset(buttonId, formId) {
    const button = document.getElementById(buttonId);
    const form = document.getElementById(formId);
    if (!button || !form) {
      return;
    }
    button.addEventListener("click", () => form.reset());
  }

  function fillForm(formId, values) {
    const form = document.getElementById(formId);
    if (!form) {
      return;
    }

    Object.entries(values || {}).forEach(([key, value]) => {
      const field = form.elements.namedItem(key);
      if (!field) {
        return;
      }

      if (field instanceof HTMLInputElement && field.type === "checkbox") {
        field.checked = Boolean(value);
        return;
      }

      field.value = value == null ? "" : String(value);
    });
  }

  function buildCoachLookup(entries = []) {
    return new Map(
      entries
        .filter(Boolean)
        .map((coach) => [String(coach.coach_id || ""), coach])
        .filter(([coachId]) => coachId)
    );
  }

  function buildActionLookup(entries = []) {
    return new Map(
      entries
        .filter(Boolean)
        .map((action) => [String(action.action_id || ""), action])
        .filter(([actionId]) => actionId)
    );
  }

  function getCoachLabel(coachId) {
    const record = state.coachLookup.get(String(coachId || ""));
    return record?.coach_name || String(coachId || "—");
  }

  function getActionLabel(actionId) {
    const record = state.actionLookup.get(String(actionId || ""));
    return record?.action_name || String(actionId || "—");
  }

  function normalizeCoachXpBucket(bucket) {
    return String(bucket || "Other").trim() || "Other";
  }

  function getCoachXpActionGroup(action) {
    const bucket = normalizeCoachXpBucket(action?.bucket);
    const bucketKey = bucket.toLowerCase();
    const haystack = `${action?.action_id || ""} ${action?.action_name || ""} ${bucket}`.toLowerCase();

    if (/(nutrition|macro|meal|calorie|protein|water|diet|recipe|supplement|steps|food)/.test(haystack)) {
      return "Nutrition";
    }
    if (/(check[\s-]?in|progress|weigh|weight|measurement|photo|compliance|habit|questionnaire|review|reflection)/.test(haystack)) {
      return "Check-In";
    }
    if (/(training|workout|session|program|exercise|lift|cardio|pb|pr|attendance|coaching)/.test(haystack) || ["coaching", "programming"].includes(bucketKey)) {
      return "Training";
    }
    if (/(education|course|cert|lesson|seminar|webinar|study|mentorship|mentor)/.test(haystack) || ["education", "professional", "mentorship"].includes(bucketKey)) {
      return "Education";
    }
    if (/(ops|system|admin|workflow|crm|roster|ledger|seed|seeding)/.test(haystack) || ["ops", "systems", "admin", "seeding"].includes(bucketKey)) {
      return "Operations";
    }
    if (/(community|competition|impact|reputation|content|social|referral|challenge)/.test(haystack) || ["impact", "reputation", "competition", "experience"].includes(bucketKey)) {
      return "Community";
    }
    return bucket;
  }

  function getCoachXpActionMeta(action) {
    const meta = [];
    if (action?.verification) {
      meta.push(action.verification);
    }
    if (action?.cooldown_days && Number(action.cooldown_days) > 0) {
      meta.push(`${formatNumber(action.cooldown_days)}d cooldown`);
    }
    return meta.join(" | ");
  }

  function isCoachActionActive(action) {
    return action?.is_active === true || action?.is_active === "true";
  }

  function renderDashboard(snapshot) {
    const kpiNode = document.getElementById("xp-coach-dashboard-kpis");
    const leaderboardNode = document.getElementById("xp-coach-dashboard-leaderboard");
    const capNode = document.getElementById("xp-coach-dashboard-caps");
    const activityNode = document.getElementById("xp-coach-dashboard-activity");
    if (!kpiNode || !leaderboardNode || !capNode || !activityNode) {
      return;
    }

    const promoteReady = (snapshot.trials || []).filter((trial) => trial.result === "PROMOTE").length;
    const verifiedEvents = Number(snapshot.eventCounts?.verified || 0);

    kpiNode.innerHTML = [
      { label: "Coaches in roster", value: formatNumber(snapshot.coaches.length) },
      { label: "Active XP actions", value: formatNumber(snapshot.actions.filter((item) => item.is_active).length) },
      { label: "Verified events", value: formatNumber(verifiedEvents) },
      { label: "Promotion-ready trials", value: formatNumber(promoteReady) },
    ]
      .map(
        (card) => `
          <article class="crm-stat xp-coach-stat">
            <p class="crm-stat__label">${escapeHtml(card.label)}</p>
            <p class="crm-stat__value">${escapeHtml(card.value)}</p>
          </article>
        `
      )
      .join("");

    state.coachLookup = buildCoachLookup(snapshot.coaches || []);
    state.actionLookup = buildActionLookup(snapshot.actions || []);

    leaderboardNode.innerHTML = (snapshot.ledger || [])
      .slice(0, 10)
      .map(
        (row) => `
          <tr>
            <td>${escapeHtml(row.coach_name || getCoachLabel(row.coach_id))}</td>
            <td>${escapeHtml(row.current_role_id || "—")}</td>
            <td>${escapeHtml(row.current_operational_title || "—")}</td>
            <td>${escapeHtml(formatNumber(row.total_xp_counted))}</td>
            <td>${escapeHtml(formatNumber(row.global_level))}</td>
          </tr>
        `
      )
      .join("") || `<tr><td colspan="5">No coach ledger data yet.</td></tr>`;

    capNode.innerHTML = [
      {
        label: "Weekly coaching cap watch",
        rows: (snapshot.weekly || [])
          .filter((row) => Number(row.coaching_overcap_xp || 0) > 0)
          .slice(0, 6)
          .map((row) => `${getCoachLabel(row.coach_id)} over by ${formatNumber(row.coaching_overcap_xp)} XP in ${row.week_key}`),
      },
      {
        label: "Monthly cap watch",
        rows: (snapshot.monthly || [])
          .filter(
            (row) =>
              Number(row.education_overcap_xp || 0) > 0
              || Number(row.ops_group_overcap_xp || 0) > 0
              || Number(row.mentorship_group_overcap_xp || 0) > 0
          )
          .slice(0, 6)
          .map((row) => `${getCoachLabel(row.coach_id)} hit monthly caps in ${row.month_key}`),
      },
      {
        label: "Quarterly impact cap watch",
        rows: (snapshot.quarterly || [])
          .filter((row) => Number(row.impact_competition_overcap_xp || 0) > 0)
          .slice(0, 6)
          .map((row) => `${getCoachLabel(row.coach_id)} over by ${formatNumber(row.impact_competition_overcap_xp)} XP in ${row.quarter_key}`),
      },
    ]
      .map(
        (group) => `
          <article class="crm-card xp-coach-note-card">
            <h3>${escapeHtml(group.label)}</h3>
            <ul>
              ${
                group.rows.length
                  ? group.rows.map((item) => `<li>${escapeHtml(item)}</li>`).join("")
                  : "<li>No cap breaches in the current dataset.</li>"
              }
            </ul>
          </article>
        `
      )
      .join("");

    activityNode.innerHTML = (snapshot.events || [])
      .slice(0, 10)
      .map(
        (item) => `
          <tr>
            <td>${escapeHtml(formatDate(item.event_date))}</td>
            <td>${escapeHtml(getCoachLabel(item.coach_id))}</td>
            <td>${escapeHtml(item.action_name || getActionLabel(item.action_id))}</td>
            <td>${escapeHtml(formatNumber(item.xp_raw || item.xp_override || 0))}</td>
            <td>${item.verified ? "Verified" : "Pending"}</td>
          </tr>
        `
      )
      .join("") || `<tr><td colspan="5">No XP activity recorded yet.</td></tr>`;

    const importButton = document.getElementById("xp-coach-import-run");
    if (importButton && !importButton.dataset.bound) {
      importButton.dataset.bound = "true";
      importButton.addEventListener("click", async () => {
        importButton.disabled = true;
        setStatus("Importing Coach XP bundle and workbook…");
        try {
          const response = await apiFetch("xp-coach-import", {
            method: "POST",
            body: { includeWorkbook: true },
          });
          setStatus(`Coach XP import completed. ${response.counts.actions} actions and ${response.counts.coaches} coaches synced.`);
          await loadPage();
        } catch (error) {
          setStatus(error.message, "error");
        } finally {
          importButton.disabled = false;
        }
      });
    }
  }

  function renderRosterPage(payload) {
    state.roster = payload.coaches || [];
    state.profileOptions = payload.profileOptions || [];

    const profileSelect = document.getElementById("xp-coach-roster-profile-id");
    const rosterTable = document.getElementById("xp-coach-roster-table");
    if (profileSelect) {
      profileSelect.innerHTML = `<option value="">Not linked yet</option>${optionMarkup(
        state.profileOptions,
        "id",
        (profile) => `${profile.display_name || profile.id} (${profile.status || "active"})`
      )}`;
    }

    if (rosterTable) {
      rosterTable.innerHTML = state.roster
        .map(
          (coach) => `
            <tr>
              <td>${escapeHtml(coach.coach_id)}</td>
              <td>${escapeHtml(coach.coach_name)}</td>
              <td>${escapeHtml(coach.current_role_id || coach.operational_role || "—")}</td>
              <td>${escapeHtml(formatNumber(coach.total_xp_counted || 0))}</td>
              <td>${escapeHtml(coach.status)}</td>
              <td><button class="btn btn-ghost xp-coach-inline-edit" type="button" data-edit-coach="${escapeHtml(coach.coach_id)}">Edit</button></td>
            </tr>
          `
        )
        .join("") || `<tr><td colspan="6">No coach roster entries yet.</td></tr>`;
    }

    document.querySelectorAll("[data-edit-coach]").forEach((button) => {
      button.addEventListener("click", () => {
        const coach = state.roster.find((item) => item.coach_id === button.getAttribute("data-edit-coach"));
        if (!coach) {
          return;
        }

        fillForm("xp-coach-roster-form", {
          coach_id: coach.coach_id,
          coach_name: coach.coach_name,
          status: coach.status,
          identity_path: coach.identity_path,
          operational_role: coach.operational_role || coach.current_role_id || "",
          role_locked_to: coach.role_locked_to || "",
          profile_id: coach.profile_id || "",
        });
      });
    });

    const form = document.getElementById("xp-coach-roster-form");
    if (form && !form.dataset.bound) {
      form.dataset.bound = "true";
      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        const coach = Object.fromEntries(formData.entries());
        setStatus("Saving coach roster entry…");
        try {
          await apiFetch("xp-coach-roster", {
            method: "POST",
            body: { coach },
          });
          setStatus(`Roster updated for ${coach.coach_id}.`);
          form.reset();
          await loadPage();
        } catch (error) {
          setStatus(error.message, "error");
        }
      });
    }

    bindFormReset("xp-coach-roster-reset", "xp-coach-roster-form");
  }

  function renderActionsPage(actionsPayload, settingsPayload) {
    state.actions = actionsPayload.actions || [];
    state.actionOptions = actionsPayload.actions || [];
    state.settings = settingsPayload.settings || [];
    state.actionLookup = buildActionLookup(state.actions);

    const tableNode = document.getElementById("xp-coach-actions-table");
    const filtersNode = document.getElementById("xp-coach-actions-filters");
    const summaryNode = document.getElementById("xp-coach-actions-summary");
    const paginationNode = document.getElementById("xp-coach-actions-pagination");

    const groupedActions = state.actions
      .slice()
      .sort((left, right) => {
        const groupCompare = getCoachXpActionGroup(left).localeCompare(getCoachXpActionGroup(right));
        if (groupCompare !== 0) {
          return groupCompare;
        }
        return String(left.action_name || "").localeCompare(String(right.action_name || ""));
      });

    const filterGroups = groupedActions.reduce((map, action) => {
      const group = getCoachXpActionGroup(action);
      map.set(group, Number(map.get(group) || 0) + 1);
      return map;
    }, new Map());
    const availableGroups = ["all", ...Array.from(filterGroups.keys()).sort((left, right) => left.localeCompare(right))];
    if (!availableGroups.includes(state.actionsUi.group)) {
      state.actionsUi.group = "all";
    }

    const activeGroup = state.actionsUi.group;
    const visibleActions = groupedActions.filter((action) => activeGroup === "all" || getCoachXpActionGroup(action) === activeGroup);
    const totalPages = Math.max(1, Math.ceil(visibleActions.length / state.actionsUi.pageSize));
    state.actionsUi.page = Math.min(Math.max(1, state.actionsUi.page), totalPages);
    const pageStart = (state.actionsUi.page - 1) * state.actionsUi.pageSize;
    const pagedActions = visibleActions.slice(pageStart, pageStart + state.actionsUi.pageSize);

    if (filtersNode) {
      filtersNode.innerHTML = availableGroups
        .map((group) => {
          const count = group === "all" ? state.actions.length : Number(filterGroups.get(group) || 0);
          const label = group === "all" ? "All" : group;
          const isActive = group === activeGroup;
          return `
            <button
              class="xp-coach-filter-chip${isActive ? " is-active" : ""}"
              type="button"
              data-xp-action-group="${escapeHtml(group)}"
              aria-pressed="${isActive ? "true" : "false"}"
            >
              <span>${escapeHtml(label)}</span>
              <strong>${escapeHtml(formatNumber(count))}</strong>
            </button>
          `;
        })
        .join("");
    }

    if (summaryNode) {
      const pageEnd = visibleActions.length ? Math.min(pageStart + state.actionsUi.pageSize, visibleActions.length) : 0;
      const groupLabel = activeGroup === "all" ? "all action groups" : `${activeGroup.toLowerCase()} actions`;
      summaryNode.textContent = visibleActions.length
        ? `Showing ${pageStart + 1}-${pageEnd} of ${visibleActions.length} ${groupLabel}. Internal IDs stay in the editor, not the list.`
        : `No actions in the ${activeGroup === "all" ? "current menu" : activeGroup.toLowerCase()} group yet.`;
    }

    if (tableNode) {
      tableNode.innerHTML = pagedActions.length
        ? pagedActions
            .map(
              (action) => `
                <tr>
                  <td>
                    <div class="xp-coach-action-cell">
                      <strong>${escapeHtml(action.action_name)}</strong>
                      <span class="xp-coach-action-meta" title="${escapeHtml(`Internal key: ${action.action_id}${getCoachXpActionMeta(action) ? ` | ${getCoachXpActionMeta(action)}` : ""}`)}">${escapeHtml(getCoachXpActionMeta(action) || "Internal action key stays in the editor only.")}</span>
                    </div>
                  </td>
                  <td>${escapeHtml(getCoachXpActionGroup(action))}</td>
                  <td>${escapeHtml(`${formatNumber(action.xp_per)} XP`)}</td>
                  <td>${escapeHtml(action.cap_period && action.cap_period !== "None" ? action.cap_period : "No cap")}</td>
                  <td>${isCoachActionActive(action) ? "Active" : "Inactive"}</td>
                  <td><button class="btn btn-ghost" type="button" data-edit-action="${escapeHtml(action.action_id)}">Edit</button></td>
                </tr>
              `
            )
            .join("")
        : `<tr><td colspan="6">No XP menu actions imported yet.</td></tr>`;
    }

    if (paginationNode) {
      paginationNode.innerHTML = totalPages > 1
        ? [
            `<button class="xp-coach-pagination-button" type="button" data-xp-action-page="${state.actionsUi.page - 1}" ${state.actionsUi.page <= 1 ? "disabled" : ""}>Prev</button>`,
            ...Array.from({ length: totalPages }, (_, index) => {
              const pageNumber = index + 1;
              return `
                <button
                  class="xp-coach-pagination-button${pageNumber === state.actionsUi.page ? " is-active" : ""}"
                  type="button"
                  data-xp-action-page="${pageNumber}"
                  aria-current="${pageNumber === state.actionsUi.page ? "page" : "false"}"
                >
                  ${pageNumber}
                </button>
              `;
            }),
            `<button class="xp-coach-pagination-button" type="button" data-xp-action-page="${state.actionsUi.page + 1}" ${state.actionsUi.page >= totalPages ? "disabled" : ""}>Next</button>`,
          ].join("")
        : "";
    }

    if (filtersNode && !filtersNode.dataset.bound) {
      filtersNode.dataset.bound = "true";
      filtersNode.addEventListener("click", (event) => {
        const button = event.target.closest("[data-xp-action-group]");
        if (!(button instanceof HTMLButtonElement)) {
          return;
        }
        state.actionsUi.group = button.getAttribute("data-xp-action-group") || "all";
        state.actionsUi.page = 1;
        renderActionsPage({ actions: state.actions }, { settings: state.settings });
      });
    }

    if (paginationNode && !paginationNode.dataset.bound) {
      paginationNode.dataset.bound = "true";
      paginationNode.addEventListener("click", (event) => {
        const button = event.target.closest("[data-xp-action-page]");
        if (!(button instanceof HTMLButtonElement) || button.disabled) {
          return;
        }
        const nextPage = Number(button.getAttribute("data-xp-action-page") || 1);
        if (!Number.isFinite(nextPage)) {
          return;
        }
        state.actionsUi.page = nextPage;
        renderActionsPage({ actions: state.actions }, { settings: state.settings });
      });
    }

    if (tableNode && !tableNode.dataset.bound) {
      tableNode.dataset.bound = "true";
      tableNode.addEventListener("click", (event) => {
        const button = event.target.closest("[data-edit-action]");
        if (!(button instanceof HTMLButtonElement)) {
          return;
        }
        const action = state.actions.find((item) => item.action_id === button.getAttribute("data-edit-action"));
        if (!action) {
          return;
        }

        fillForm("xp-coach-action-form", {
          action_id: action.action_id,
          action_name: action.action_name,
          bucket: action.bucket,
          xp_per: action.xp_per,
          cap_period: action.cap_period,
          cooldown_days: action.cooldown_days,
          verification: action.verification || "",
          is_active: isCoachActionActive(action) ? "true" : "false",
        });
      });
    }

    const settingsMap = new Map(state.settings.map((item) => [item.key, item.value]));
    fillForm("xp-coach-settings-form", {
      CoachingWeeklyCapXP: settingsMap.get("CoachingWeeklyCapXP") || 120,
      EducationMonthlyCapXP: settingsMap.get("EducationMonthlyCapXP") || 150,
      OpsMonthlyCapXP: settingsMap.get("OpsMonthlyCapXP") || 120,
      MentorshipMonthlyCapXP: settingsMap.get("MentorshipMonthlyCapXP") || 150,
      ImpactQuarterlyCapXP: settingsMap.get("ImpactQuarterlyCapXP") || 300,
      CompetitionQuarterlyCapXP: settingsMap.get("CompetitionQuarterlyCapXP") || 300,
      WeekStart: settingsMap.get("WeekStart") || "MON",
      MaxXP: settingsMap.get("MaxXP") || 20000,
    });

    const actionForm = document.getElementById("xp-coach-action-form");
    if (actionForm && !actionForm.dataset.bound) {
      actionForm.dataset.bound = "true";
      actionForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const action = Object.fromEntries(new FormData(actionForm).entries());
        setStatus("Saving XP menu action…");
        try {
          await apiFetch("xp-coach-actions", {
            method: "POST",
            body: { action },
          });
          setStatus(`XP action ${action.action_id} saved.`);
          actionForm.reset();
          await loadPage();
        } catch (error) {
          setStatus(error.message, "error");
        }
      });
    }

    const settingsForm = document.getElementById("xp-coach-settings-form");
    if (settingsForm && !settingsForm.dataset.bound) {
      settingsForm.dataset.bound = "true";
      settingsForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const settings = Object.fromEntries(new FormData(settingsForm).entries());
        setStatus("Saving XP cap settings…");
        try {
          await apiFetch("xp-coach-settings", {
            method: "POST",
            body: { settings },
          });
          setStatus("Coach XP settings updated.");
          await loadPage();
        } catch (error) {
          setStatus(error.message, "error");
        }
      });
    }

    bindFormReset("xp-coach-action-reset", "xp-coach-action-form");
  }

  function renderEventsPage(payload) {
    state.events = payload.events || [];
    const coachOptions = payload.coachOptions || [];
    const actionOptions = payload.actionOptions || [];

    const coachSelect = document.getElementById("xp-coach-event-coach-id");
    const actionSelect = document.getElementById("xp-coach-event-action-id");
    const tableNode = document.getElementById("xp-coach-events-table");

    if (coachSelect) {
      coachSelect.innerHTML = `<option value="">Select coach</option>${optionMarkup(
        coachOptions,
        "coach_id",
        (coach) => `${coach.coach_name} (${coach.coach_id})`
      )}`;
    }
    if (actionSelect) {
      actionSelect.innerHTML = `<option value="">Select action</option>${optionMarkup(
        actionOptions,
        "action_id",
        (action) => `${action.action_name} [${action.bucket}]`
      )}`;
    }

    if (tableNode) {
      tableNode.innerHTML = state.events
        .map(
          (item) => `
            <tr>
              <td>${escapeHtml(formatDate(item.event_date))}</td>
              <td>${escapeHtml(item.coach_id)}</td>
              <td>${escapeHtml(item.action_name || item.action_id)}</td>
              <td>${escapeHtml(item.bucket || "—")}</td>
              <td>${escapeHtml(formatNumber(item.xp_raw || item.xp_override || 0))}</td>
              <td>${item.verified ? "Verified" : "Pending"}</td>
            </tr>
          `
        )
        .join("") || `<tr><td colspan="6">No XP events logged yet.</td></tr>`;
    }

    const form = document.getElementById("xp-coach-event-form");
    if (form && !form.dataset.bound) {
      form.dataset.bound = "true";
      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const xpEvent = Object.fromEntries(new FormData(form).entries());
        xpEvent.verified = xpEvent.verified === "true";
        setStatus("Logging coach XP event…");
        try {
          await apiFetch("xp-coach-events", {
            method: "POST",
            body: { event: xpEvent },
          });
          setStatus("Coach XP event logged.");
          form.reset();
          await loadPage();
        } catch (error) {
          setStatus(error.message, "error");
        }
      });
    }

    bindFormReset("xp-coach-event-reset", "xp-coach-event-form");
  }

  function renderTrialsPage(payload) {
    state.trials = payload.trials || [];
    const coachOptions = payload.coachOptions || [];
    const tableNode = document.getElementById("xp-coach-trials-table");
    const coachSelect = document.getElementById("xp-coach-trial-coach-id");
    if (coachSelect) {
      coachSelect.innerHTML = `<option value="">Select coach</option>${optionMarkup(
        coachOptions,
        "coach_id",
        (coach) => `${coach.coach_name} (${coach.coach_id})`
      )}`;
    }

    if (tableNode) {
      tableNode.innerHTML = state.trials
        .map(
          (trial) => `
            <tr>
              <td>${escapeHtml(trial.coach_id)}</td>
              <td>${escapeHtml(trial.current_role)}</td>
              <td>${escapeHtml(trial.target_role)}</td>
              <td>${escapeHtml(formatDate(trial.trial_date))}</td>
              <td>${escapeHtml(trial.result)}</td>
              <td><button class="btn btn-ghost" type="button" data-edit-trial="${escapeHtml(trial.id)}">Edit</button></td>
            </tr>
          `
        )
        .join("") || `<tr><td colspan="6">No trial rows yet.</td></tr>`;
    }

    document.querySelectorAll("[data-edit-trial]").forEach((button) => {
      button.addEventListener("click", () => {
        const trial = state.trials.find((item) => item.id === button.getAttribute("data-edit-trial"));
        if (!trial) {
          return;
        }

        fillForm("xp-coach-trial-form", {
          id: trial.id,
          coach_id: trial.coach_id,
          current_role: trial.current_role,
          target_role: trial.target_role,
          trial_date: trial.trial_date || "",
          skill_trial: trial.skill_trial,
          knowledge_trial: trial.knowledge_trial,
          portfolio: trial.portfolio,
          notes: trial.notes || "",
        });
      });
    });

    const form = document.getElementById("xp-coach-trial-form");
    if (form && !form.dataset.bound) {
      form.dataset.bound = "true";
      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const trial = Object.fromEntries(new FormData(form).entries());
        setStatus("Saving promotion trial…");
        try {
          await apiFetch("xp-coach-trials", {
            method: "POST",
            body: { trial },
          });
          setStatus("Promotion trial updated.");
          form.reset();
          await loadPage();
        } catch (error) {
          setStatus(error.message, "error");
        }
      });
    }

    bindFormReset("xp-coach-trial-reset", "xp-coach-trial-form");
  }

  function renderSeedingPage(payload) {
    state.seeding = payload.seeding || [];
    const coachOptions = payload.coachOptions || [];
    const tableNode = document.getElementById("xp-coach-seeding-table");
    const coachSelect = document.getElementById("xp-coach-seed-coach-id");

    if (coachSelect) {
      coachSelect.innerHTML = `<option value="">Select coach</option>${optionMarkup(
        coachOptions,
        "coach_id",
        (coach) => `${coach.coach_name} (${coach.coach_id})`
      )}`;
    }

    if (tableNode) {
      tableNode.innerHTML = state.seeding
        .map(
          (seed) => `
            <tr>
              <td>${escapeHtml(seed.coach_id)}</td>
              <td>${escapeHtml(formatNumber(seed.seed_xp))}</td>
              <td>${seed.approved ? "Approved" : "Pending"}</td>
              <td>${escapeHtml(seed.notes || "—")}</td>
              <td><button class="btn btn-ghost" type="button" data-edit-seed="${escapeHtml(seed.coach_id)}">Edit</button></td>
            </tr>
          `
        )
        .join("") || `<tr><td colspan="5">No seed entries yet.</td></tr>`;
    }

    document.querySelectorAll("[data-edit-seed]").forEach((button) => {
      button.addEventListener("click", () => {
        const seed = state.seeding.find((item) => item.coach_id === button.getAttribute("data-edit-seed"));
        if (!seed) {
          return;
        }

        fillForm("xp-coach-seed-form", {
          coach_id: seed.coach_id,
          seed_xp: seed.seed_xp,
          approved: seed.approved ? "true" : "false",
          notes: seed.notes || "",
        });
      });
    });

    const form = document.getElementById("xp-coach-seed-form");
    if (form && !form.dataset.bound) {
      form.dataset.bound = "true";
      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const seed = Object.fromEntries(new FormData(form).entries());
        seed.approved = seed.approved === "true";
        setStatus("Saving seed placement…");
        try {
          await apiFetch("xp-coach-seeding", {
            method: "POST",
            body: { seed },
          });
          setStatus("Seed placement updated.");
          form.reset();
          await loadPage();
        } catch (error) {
          setStatus(error.message, "error");
        }
      });
    }

    bindFormReset("xp-coach-seed-reset", "xp-coach-seed-form");
  }

  async function loadPage() {
    if (page === "dashboard") {
      const { snapshot } = await apiFetch("xp-coach-dashboard");
      renderDashboard(snapshot);
      return;
    }

    if (page === "roster") {
      const payload = await apiFetch("xp-coach-roster");
      renderRosterPage(payload);
      return;
    }

    if (page === "actions") {
      const [actionsPayload, settingsPayload] = await Promise.all([
        apiFetch("xp-coach-actions"),
        apiFetch("xp-coach-settings"),
      ]);
      renderActionsPage(actionsPayload, settingsPayload);
      return;
    }

    if (page === "events") {
      const payload = await apiFetch("xp-coach-events");
      renderEventsPage(payload);
      return;
    }

    if (page === "trials") {
      const payload = await apiFetch("xp-coach-trials");
      renderTrialsPage(payload);
      return;
    }

    if (page === "seeding") {
      const payload = await apiFetch("xp-coach-seeding");
      renderSeedingPage(payload);
    }
  }

  async function init() {
    if (!window.legacyAuth?.requireRole) {
      return;
    }

    await ensureSuperAdmin();
    renderModuleTabs();
    setStatus("Loading Coach XP module…");
    await loadPage();
    setStatus("Coach XP module ready.");
  }

  window.addEventListener("DOMContentLoaded", () => {
    init().catch((error) => {
      if (error?.message === "Access denied.") {
        return;
      }
      setStatus(error?.message || "Unable to load the Coach XP module.", "error");
    });
  });
})();
