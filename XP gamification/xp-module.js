(function () {
  const body = document.body;
  const statusNode = document.getElementById("xp-module-status");
  const accessEmailNode = document.querySelector("[data-xp-access-email]");
  const roleTextNode = document.querySelector("[data-xp-role-text]");
  const eventEmptyStateNode = document.getElementById("xp-event-empty-state");
  const ledgerEmptyStateNode = document.getElementById("xp-ledger-empty-state");

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function setStatus(message, isError = false) {
    if (!statusNode) {
      return;
    }
    statusNode.textContent = message || "";
    statusNode.classList.toggle("is-error", Boolean(message) && Boolean(isError));
  }

  async function apiRequest(functionName, options = {}) {
    const token = await window.legacyAuth?.getAccessToken?.();
    const query = options.query ? `?${new URLSearchParams(options.query).toString()}` : "";
    const response = await fetch(`/.netlify/functions/${functionName}${query}`, {
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload?.error || `Request failed for ${functionName}.`);
    }
    return payload;
  }

  function fillSelect(node, rows, mapOption, placeholder) {
    if (!node) {
      return;
    }
    const options = [];
    if (placeholder) {
      options.push(`<option value="">${escapeHtml(placeholder)}</option>`);
    }
    options.push(
      ...(rows || []).map((row) => {
        const option = mapOption(row);
        return `<option value="${escapeHtml(option.value)}">${escapeHtml(option.label)}</option>`;
      })
    );
    node.innerHTML = options.join("");
  }

  const ACTION_CATEGORY_LABELS = {
    achievement: "Achievement",
    boss: "Boss",
    community: "Community",
    compliance: "Compliance",
    conditioning: "Conditioning",
    education: "Education",
    health: "Health",
    milestone: "Milestone",
    mode: "Mode",
    neat: "NEAT",
    nutrition: "Nutrition",
    onboarding: "Onboarding",
    recovery: "Recovery",
    streaks: "Streaks",
    training: "Training",
  };

  const ACTION_CATEGORY_ORDER = [
    "training",
    "nutrition",
    "health",
    "recovery",
    "conditioning",
    "neat",
    "community",
    "compliance",
    "education",
    "onboarding",
    "achievement",
    "milestone",
    "mode",
    "streaks",
    "boss",
  ];

  function normalizeActionCategory(value) {
    const raw = String(value || "").trim();
    if (!raw) {
      return {
        key: "other",
        label: "Other",
      };
    }

    const key = raw.toLowerCase();
    return {
      key,
      label: ACTION_CATEGORY_LABELS[key] || raw,
    };
  }

  function sortActionCategoryKeys(keys, labelLookup) {
    return Array.from(keys).sort((left, right) => {
      const leftIndex = ACTION_CATEGORY_ORDER.indexOf(left);
      const rightIndex = ACTION_CATEGORY_ORDER.indexOf(right);
      const safeLeft = leftIndex === -1 ? Number.MAX_SAFE_INTEGER : leftIndex;
      const safeRight = rightIndex === -1 ? Number.MAX_SAFE_INTEGER : rightIndex;
      if (safeLeft !== safeRight) {
        return safeLeft - safeRight;
      }
      return String(labelLookup(left)).localeCompare(String(labelLookup(right)));
    });
  }

  function fillGroupedActionSelect(node, rows, placeholder) {
    if (!node) {
      return;
    }

    const grouped = new Map();
    (rows || []).forEach((row) => {
      const category = normalizeActionCategory(row?.category);
      if (!grouped.has(category.key)) {
        grouped.set(category.key, {
          label: category.label,
          rows: [],
        });
      }
      grouped.get(category.key).rows.push(row);
    });

    const orderedKeys = sortActionCategoryKeys(grouped.keys(), (key) => grouped.get(key)?.label || key);

    const options = [];
    if (placeholder) {
      options.push(`<option value="">${escapeHtml(placeholder)}</option>`);
    }

    orderedKeys.forEach((key) => {
      const group = grouped.get(key);
      const optionHtml = (group?.rows || [])
        .map((action) => {
          const label = `${String(action?.action_id || "").trim()} · ${String(action?.display_name || "").trim()}`;
          return `<option value="${escapeHtml(action?.action_id || "")}">${escapeHtml(label)}</option>`;
        })
        .join("");

      if (!optionHtml) {
        return;
      }

      options.push(`<optgroup label="${escapeHtml(group?.label || "Other")}">${optionHtml}</optgroup>`);
    });

    node.innerHTML = options.join("");
  }

  function buildActionCategoryChips(node, rows, activeKey, onSelect) {
    if (!node) {
      return;
    }

    const categories = new Map();
    (rows || []).forEach((row) => {
      const category = normalizeActionCategory(row?.category);
      if (!categories.has(category.key)) {
        categories.set(category.key, category.label);
      }
    });

    const orderedKeys = sortActionCategoryKeys(categories.keys(), (key) => categories.get(key) || key);
    const chips = [{ key: "", label: "All" }].concat(
      orderedKeys.map((key) => ({
        key,
        label: categories.get(key) || key,
      }))
    );

    node.innerHTML = chips
      .map((chip) => {
        const isActive = chip.key === String(activeKey || "");
        const classes = ["xp-module-action-chip"];
        if (isActive) {
          classes.push("is-active");
        }
        return `
          <button
            type="button"
            class="${classes.join(" ")}"
            data-action-category="${escapeHtml(chip.key)}"
            aria-pressed="${isActive ? "true" : "false"}"
            ${rows?.length ? "" : "disabled"}
          >${escapeHtml(chip.label)}</button>
        `;
      })
      .join("");

    node.querySelectorAll("[data-action-category]").forEach((button) => {
      button.addEventListener("click", () => {
        onSelect?.(String(button.getAttribute("data-action-category") || ""));
      });
    });
  }

  function filterActions(rows, query, categoryKey = "") {
    const normalizedQuery = String(query || "").trim().toLowerCase();
    return (rows || []).filter((action) => {
      const normalizedCategory = normalizeActionCategory(action?.category).key;
      const haystack = [
        action?.action_id,
        action?.display_name,
        action?.category,
        action?.earn_type,
      ]
        .map((value) => String(value || "").trim().toLowerCase())
        .join(" ");
      const matchesQuery = !normalizedQuery || haystack.includes(normalizedQuery);
      const matchesCategory = !categoryKey || normalizedCategory === categoryKey;
      return matchesQuery && matchesCategory;
    });
  }

  function countDistinctActionCategories(rows) {
    return new Set((rows || []).map((row) => normalizeActionCategory(row?.category).key)).size;
  }

  function renderTable(node, rows, emptyColspan, renderRow) {
    if (!node) {
      return;
    }
    if (!rows?.length) {
      node.innerHTML = `<tr><td colspan="${emptyColspan}" class="xp-module-empty">No data yet.</td></tr>`;
      return;
    }
    node.innerHTML = rows.map(renderRow).join("");
  }

  function setSelectAvailability(node, enabled, placeholder) {
    if (!node) {
      return;
    }
    node.disabled = !enabled;
    if (!enabled && placeholder) {
      node.innerHTML = `<option value="">${escapeHtml(placeholder)}</option>`;
    }
  }

  function formatNumber(value) {
    return new Intl.NumberFormat("en-MY").format(Number(value || 0));
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat("en-MY", {
      style: "currency",
      currency: "MYR",
      minimumFractionDigits: 2,
    }).format(Number(value || 0));
  }

  function formatDate(value) {
    if (!value) {
      return "—";
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return String(value);
    }
    return new Intl.DateTimeFormat("en-MY", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  }

  function applyRoleVisibility(access) {
    const role = access?.role || "";
    document.querySelectorAll("[data-role-visibility]").forEach((node) => {
      const allowedRoles = String(node.getAttribute("data-role-visibility") || "")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);

      const isAllowed = allowedRoles.includes(role);
      if (isAllowed) {
        node.removeAttribute("hidden");
      } else {
        node.setAttribute("hidden", "hidden");
      }
    });
  }

  function renderAdminKpis(data) {
    const node = document.getElementById("xp-admin-kpis");
    if (!node) {
      return;
    }
    const totalXp = (data.ledger || []).reduce((sum, item) => sum + Number(item.total_xp || 0), 0);
    const totalCoins = (data.ledger || []).reduce((sum, item) => sum + Number(item.coin_balance || 0), 0);
    node.innerHTML = [
      { label: "Members", value: formatNumber((data.members || []).length) },
      { label: "Actions", value: formatNumber((data.actions || []).length) },
      { label: "Ledger Rows", value: formatNumber((data.ledger || []).length) },
      { label: "Total Counted XP", value: formatNumber(totalXp) },
      { label: "Coin Balance", value: formatNumber(totalCoins) },
      { label: "Redemptions", value: formatNumber((data.redemptions || []).length) },
    ]
      .map(
        (item) => `
          <article class="xp-module-kpi">
            <span>${escapeHtml(item.label)}</span>
            <strong>${escapeHtml(item.value)}</strong>
          </article>
        `
      )
      .join("");
  }

  async function loadAdminData() {
    const [membersPayload, actionsPayload, ledgerPayload, redemptionsPayload, importPayload] = await Promise.all([
      apiRequest("xp-members", { query: { includeProfiles: "1" } }),
      apiRequest("xp-actions"),
      apiRequest("xp-ledger"),
      apiRequest("xp-redemptions"),
      apiRequest("xp-import"),
    ]);

    const data = {
      members: membersPayload.members || [],
      profiles: membersPayload.profiles || [],
      actions: actionsPayload.actions || [],
      ledger: ledgerPayload.ledger || [],
      redemptions: redemptionsPayload.redemptions || [],
      workbookAvailable: Boolean(importPayload.workbookAvailable),
    };

    renderAdminKpis(data);

    fillSelect(
      document.getElementById("xp-link-member-id"),
      data.members,
      (member) => ({ value: member.member_id, label: `${member.member_id} · ${member.name}` }),
      "Select member"
    );
    fillSelect(
      document.getElementById("xp-redeem-member-id"),
      data.members,
      (member) => ({ value: member.member_id, label: `${member.member_id} · ${member.name}` }),
      "Select member"
    );
    fillSelect(
      document.getElementById("xp-link-profile-id"),
      data.profiles,
      (profile) => ({ value: profile.id, label: `${profile.display_name || profile.id} · ${profile.status}` }),
      "Leave unlinked"
    );

    renderTable(document.getElementById("xp-members-table"), data.members, 5, (member) => `
      <tr>
        <td>${escapeHtml(member.member_id)}</td>
        <td>${escapeHtml(member.name)}</td>
        <td>${escapeHtml(member.mode)}</td>
        <td>${escapeHtml(member.status)}</td>
        <td>${escapeHtml(member.profile_id || "—")}</td>
      </tr>
    `);

    renderTable(document.getElementById("xp-actions-table"), data.actions, 4, (action) => `
      <tr>
        <td>${escapeHtml(action.display_name)}<br /><small>${escapeHtml(action.action_id)}</small></td>
        <td>${escapeHtml(action.earn_type)}</td>
        <td>${escapeHtml(formatNumber(action.xp))}</td>
        <td>${escapeHtml(formatNumber(action.coins))}</td>
      </tr>
    `);

    renderTable(document.getElementById("xp-ledger-table"), data.ledger, 5, (row) => `
      <tr>
        <td>${escapeHtml(row.name)}<br /><small>${escapeHtml(row.member_id)}</small></td>
        <td>${escapeHtml(String(row.level))}</td>
        <td>${escapeHtml(formatNumber(row.total_xp))}</td>
        <td>${escapeHtml(formatNumber(row.coins_earned_counted))}</td>
        <td>${escapeHtml(formatNumber(row.coin_balance))}</td>
      </tr>
    `);

    renderTable(document.getElementById("xp-redemptions-table"), data.redemptions, 4, (row) => `
      <tr>
        <td>${escapeHtml(row.member_id)}</td>
        <td>${escapeHtml(formatNumber(row.coins))}</td>
        <td>${escapeHtml(row.reward_name)}</td>
        <td>${escapeHtml(formatDate(row.redeemed_at))}</td>
      </tr>
    `);

    const importForm = document.getElementById("xp-import-form");
    if (importForm && !importForm.dataset.bound) {
      importForm.dataset.bound = "true";
      importForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const formData = new FormData(importForm);
        setStatus("Running client XP import…");
        try {
          const payload = await apiRequest("xp-import", {
            method: "POST",
            body: {
              includeWorkbook: formData.get("includeWorkbook") === "true",
            },
          });
          setStatus(
            `Import complete. ${payload.counts.actions} actions, ${payload.counts.members} members, ${payload.counts.events} events.`,
            false
          );
          await loadAdminData();
        } catch (error) {
          setStatus(error.message, true);
        }
      });
    }

    const memberForm = document.getElementById("xp-member-form");
    if (memberForm && !memberForm.dataset.bound) {
      memberForm.dataset.bound = "true";
      memberForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const formData = new FormData(memberForm);
        try {
          const payload = await apiRequest("xp-members", {
            method: "POST",
            body: {
              member_id: formData.get("member_id"),
              name: formData.get("name"),
              mode: formData.get("mode"),
              status: formData.get("status"),
            },
          });
          setStatus(`Saved member ${payload.member.member_id}.`);
          memberForm.reset();
          await loadAdminData();
        } catch (error) {
          setStatus(error.message, true);
        }
      });
    }

    const linkForm = document.getElementById("xp-link-form");
    if (linkForm && !linkForm.dataset.bound) {
      linkForm.dataset.bound = "true";
      linkForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const formData = new FormData(linkForm);
        try {
          const payload = await apiRequest("xp-members", {
            method: "PATCH",
            body: {
              member_id: formData.get("member_id"),
              profile_id: formData.get("profile_id"),
            },
          });
          setStatus(`Linked member ${payload.member.member_id}.`);
          await loadAdminData();
        } catch (error) {
          setStatus(error.message, true);
        }
      });
    }

    const actionForm = document.getElementById("xp-action-form");
    if (actionForm && !actionForm.dataset.bound) {
      actionForm.dataset.bound = "true";
      actionForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const formData = new FormData(actionForm);
        try {
          const payload = await apiRequest("xp-actions", {
            method: "POST",
            body: {
              action_id: formData.get("action_id"),
              display_name: formData.get("display_name"),
              category: formData.get("category"),
              earn_type: formData.get("earn_type"),
              xp: Number(formData.get("xp") || 0),
              coins: Number(formData.get("coins") || 0),
              is_active: formData.get("is_active") === "true",
            },
          });
          setStatus(`Saved action ${payload.action.action_id}.`);
          actionForm.reset();
          await loadAdminData();
        } catch (error) {
          setStatus(error.message, true);
        }
      });
    }

    const redemptionForm = document.getElementById("xp-redemption-form");
    if (redemptionForm && !redemptionForm.dataset.bound) {
      redemptionForm.dataset.bound = "true";
      redemptionForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const formData = new FormData(redemptionForm);
        try {
          const payload = await apiRequest("xp-redemptions", {
            method: "POST",
            body: {
              member_id: formData.get("member_id"),
              coins: Number(formData.get("coins") || 0),
              reward_name: formData.get("reward_name"),
              notes: formData.get("notes"),
            },
          });
          setStatus(`Redeemed ${payload.redemption.coins} coins for ${payload.redemption.member_id}.`);
          redemptionForm.reset();
          await loadAdminData();
        } catch (error) {
          setStatus(error.message, true);
        }
      });
    }

    const workbookNote = data.workbookAvailable ? "Workbook detected for one-time import." : "Workbook not found. Rules-only import available.";
    setStatus(workbookNote);
  }

  async function loadStaffData() {
    const staffPayload = await apiRequest("load-xp-staff-tools");
    const members = staffPayload.members || [];
    const actions = staffPayload.actions || [];
    const ledger = staffPayload.ledger || [];
    const weekly = staffPayload.weekly || [];
    const events = staffPayload.events || [];

    const memberSelectNode = document.getElementById("xp-event-member-id");
    const actionSelectNode = document.getElementById("xp-event-action-id");
    const actionSearchNode = document.getElementById("xp-event-action-search");
    const actionHelpNode = document.getElementById("xp-event-action-help");
    const actionChipsNode = document.getElementById("xp-event-action-chips");
    const eventForm = document.getElementById("xp-event-form");
    const submitButton = eventForm?.querySelector('button[type="submit"]');
    const actionFilterState = {
      categoryKey: "",
    };
    const hasMembers = members.length > 0;
    const hasActions = actions.length > 0;
    const canLogEvents = hasMembers && hasActions;

    fillSelect(
      memberSelectNode,
      members,
      (member) => ({ value: member.member_id, label: `${member.member_id} · ${member.name}` }),
      "Select member"
    );

    setSelectAvailability(memberSelectNode, members.length > 0, "No XP members linked yet");

    const renderFilteredActionOptions = () => {
      const selectedValue = String(actionSelectNode?.value || "").trim();
      const filteredActions = filterActions(actions, actionSearchNode?.value || "", actionFilterState.categoryKey);
      const categoryCount = countDistinctActionCategories(filteredActions);
      const hasMatches = filteredActions.length > 0;
      const placeholderLabel = !actions.length ? "No XP actions available" : hasMatches ? "Select action" : "No matching action";

      buildActionCategoryChips(actionChipsNode, actions, actionFilterState.categoryKey, (nextKey) => {
        actionFilterState.categoryKey = nextKey === actionFilterState.categoryKey ? "" : nextKey;
        renderFilteredActionOptions();
      });

      if (actionSelectNode) {
        fillGroupedActionSelect(actionSelectNode, filteredActions, placeholderLabel);
        actionSelectNode.disabled = !hasMatches;
        if (selectedValue && filteredActions.some((action) => action.action_id === selectedValue)) {
          actionSelectNode.value = selectedValue;
        }
      }

      if (actionHelpNode) {
        if (!actions.length) {
          actionHelpNode.textContent = "No XP actions are available yet.";
        } else if (!hasMatches) {
          actionHelpNode.textContent = "No actions match this search. Try an action ID, category, or action name.";
        } else if (actionSearchNode?.value) {
          actionHelpNode.textContent = `Showing ${formatNumber(filteredActions.length)} matching action${filteredActions.length === 1 ? "" : "s"} across ${formatNumber(categoryCount)} categor${categoryCount === 1 ? "y" : "ies"}.`;
        } else if (actionFilterState.categoryKey) {
          const categoryLabel = normalizeActionCategory(actionFilterState.categoryKey).label;
          actionHelpNode.textContent = `Showing ${formatNumber(filteredActions.length)} ${categoryLabel} action${filteredActions.length === 1 ? "" : "s"}.`;
        } else {
          actionHelpNode.textContent = `Showing ${formatNumber(actions.length)} actions grouped across ${formatNumber(categoryCount)} categories.`;
        }
      }

      if (submitButton) {
        submitButton.disabled = !(members.length && hasMatches);
      }
    };

    if (actionSearchNode) {
      actionSearchNode.disabled = !actions.length;
      if (!actionSearchNode.dataset.bound) {
        actionSearchNode.dataset.bound = "true";
        actionSearchNode.addEventListener("input", () => {
          actionSearchNode._renderFilteredActions?.();
        });
      }
      actionSearchNode._renderFilteredActions = renderFilteredActionOptions;
    }

    renderFilteredActionOptions();

    if (eventForm) {
      eventForm.hidden = !canLogEvents;
    }

    if (actionChipsNode) {
      actionChipsNode.hidden = !hasActions;
    }

    if (eventEmptyStateNode) {
      eventEmptyStateNode.hidden = canLogEvents;
      if (!canLogEvents) {
        eventEmptyStateNode.innerHTML = !hasMembers
          ? "<strong>Client XP is not linked yet.</strong><p>Link a real client into the XP system first, then event logging will unlock here automatically.</p>"
          : "<strong>No client XP actions are ready.</strong><p>Add the action library first, then coaches can log training, nutrition, and health XP here.</p>";
      }
    }

    if (ledgerEmptyStateNode) {
      ledgerEmptyStateNode.hidden = ledger.length > 0;
      if (!ledger.length) {
        ledgerEmptyStateNode.innerHTML = hasMembers
          ? "<strong>No client XP data yet.</strong><p>Once events are logged, levels, total XP, and coin balance will appear here.</p>"
          : "<strong>No client XP data yet.</strong><p>Link a client member first, then their ledger will appear here automatically.</p>";
      }
    }

    renderTable(document.getElementById("xp-ledger-table"), ledger, 4, (row) => `
      <tr>
        <td>${escapeHtml(row.name)}<br /><small>${escapeHtml(row.member_id)}</small></td>
        <td>${escapeHtml(String(row.level))}</td>
        <td>${escapeHtml(formatNumber(row.total_xp))}</td>
        <td>${escapeHtml(formatNumber(row.coin_balance))}</td>
      </tr>
    `);

    renderTable(document.getElementById("xp-weekly-table"), weekly, 5, (row) => `
      <tr>
        <td>${escapeHtml(row.name)}<br /><small>${escapeHtml(row.member_id)}</small></td>
        <td>${escapeHtml(row.week_key)}</td>
        <td>${escapeHtml(formatNumber(row.routine_xp_counted))}</td>
        <td>${escapeHtml(formatNumber(row.uncapped_xp))}</td>
        <td>${escapeHtml(formatNumber(row.weekly_xp_counted))}</td>
      </tr>
    `);

    renderTable(document.getElementById("xp-events-table"), events, 5, (row) => `
      <tr>
        <td>${escapeHtml(formatDate(row.event_date))}</td>
        <td>${escapeHtml(row.member_id)}</td>
        <td>${escapeHtml(row.action_id)}</td>
        <td>${escapeHtml(formatNumber(row.qty))}</td>
        <td>${escapeHtml(row.verified ? "True" : "False")}</td>
      </tr>
    `);

    if (eventForm && !eventForm.dataset.bound) {
      eventForm.dataset.bound = "true";
      eventForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const formData = new FormData(eventForm);
        try {
          const payload = await apiRequest("xp-events", {
            method: "POST",
            body: {
              member_id: formData.get("member_id"),
              action_id: formData.get("action_id"),
              event_date: formData.get("event_date"),
              qty: Number(formData.get("qty") || 1),
              verified: formData.get("verified") === "true",
              notes: formData.get("notes"),
            },
          });
          setStatus(`Logged event ${payload.event.action_id} for ${payload.event.member_id}.`);
          eventForm.reset();
          await loadStaffData();
        } catch (error) {
          setStatus(error.message, true);
        }
      });
    }

    if (!hasMembers) {
      setStatus("Client XP tools are ready, but no client members have been linked yet.");
      return;
    }

    if (!hasActions) {
      setStatus("Client XP members are linked, but the action library has not been loaded yet.");
      return;
    }

    setStatus(`Client XP tools are ready. ${members.length} member${members.length === 1 ? "" : "s"} loaded.`);
  }

  async function loadClientData() {
    const ledgerPayload = await apiRequest("xp-ledger");
    const ledger = ledgerPayload.ledger || [];
    const weekly = ledgerPayload.weekly || [];
    const monthly = ledgerPayload.monthly || [];
    const row = ledger[0] || null;

    const nameNode = document.getElementById("xp-client-member-name");
    const noteNode = document.getElementById("xp-client-member-note");
    const kpiNode = document.getElementById("xp-client-kpis");

    if (nameNode) {
      nameNode.textContent = row ? row.name : "No linked XP member";
    }
    if (noteNode) {
      noteNode.textContent = row
        ? `${row.member_id} · Level ${row.level} · ${formatNumber(row.total_xp)} counted XP.`
        : "Ask super admin to link your public client profile to an XP member record.";
    }
    if (kpiNode) {
      const cards = row
        ? [
            { label: "Level", value: row.level },
            { label: "Total XP", value: formatNumber(row.total_xp) },
            { label: "XP To Next", value: formatNumber(row.xp_to_next) },
            { label: "Coin Balance", value: formatNumber(row.coin_balance) },
          ]
        : [];
      kpiNode.innerHTML = cards.length
        ? cards
            .map(
              (item) => `
                <article class="xp-module-kpi">
                  <span>${escapeHtml(item.label)}</span>
                  <strong>${escapeHtml(String(item.value))}</strong>
                </article>
              `
            )
            .join("")
        : `<article class="xp-module-kpi"><span>Status</span><strong>Awaiting Link</strong></article>`;
    }

    renderTable(document.getElementById("xp-weekly-table"), weekly, 5, (summary) => `
      <tr>
        <td>${escapeHtml(summary.week_key)}</td>
        <td>${escapeHtml(formatNumber(summary.routine_xp_raw))}</td>
        <td>${escapeHtml(formatNumber(summary.routine_xp_counted))}</td>
        <td>${escapeHtml(formatNumber(summary.uncapped_xp))}</td>
        <td>${escapeHtml(formatNumber(summary.weekly_xp_counted))}</td>
      </tr>
    `);

    renderTable(document.getElementById("xp-monthly-table"), monthly, 4, (summary) => `
      <tr>
        <td>${escapeHtml(summary.month_key)}</td>
        <td>${escapeHtml(formatNumber(summary.coins_raw_month))}</td>
        <td>${escapeHtml(formatNumber(summary.coins_counted_month))}</td>
        <td>${escapeHtml(formatCurrency(summary.worth_rm))}</td>
      </tr>
    `);

    if (!row) {
      setStatus("Your XP view is ready, but your account is not linked to an XP member record yet.");
      return;
    }

    setStatus(`XP progress loaded for ${row.name}.`);
  }

  async function initMenu(access) {
    if (roleTextNode) {
      roleTextNode.textContent = access?.ok ? `Detected role: ${access.role}` : "Sign in to access the module pages.";
    }
  }

  async function init() {
    if (!window.legacyAuth) {
      setStatus("Auth client not available.", true);
      return;
    }

    const requiredRole = body.dataset.requiredRole || "";
    const access = await window.legacyAuth.requireRole(requiredRole || undefined);

    if (accessEmailNode) {
      accessEmailNode.textContent = access?.ok ? access.user?.email || access.role : "No active session";
    }

    if (!access?.ok) {
      if (roleTextNode) {
        roleTextNode.textContent = access.error || "No active session.";
      }
      setStatus(access.error || "No active session.", true);
      if (requiredRole) {
        return;
      }
    } else if (roleTextNode) {
      roleTextNode.textContent = `Role: ${access.role}`;
    }

    applyRoleVisibility(access);

    const page = body.dataset.xpModulePage || "menu";
    try {
      if (page === "admin") {
        await loadAdminData();
      } else if (page === "staff") {
        await loadStaffData();
      } else if (page === "client") {
        await loadClientData();
      } else {
        await initMenu(access);
      }
    } catch (error) {
      setStatus(error.message || "Unable to load the XP module.", true);
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
