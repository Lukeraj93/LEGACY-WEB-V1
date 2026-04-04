(function initAdminAccountRecords() {
  if (document.body?.dataset?.accountPage !== "clients") {
    return;
  }

  const roleSelect = document.getElementById("admin-account-record-role");
  const accountSelect = document.getElementById("admin-account-record-select");
  const loadButton = document.getElementById("admin-account-record-load");
  const copyButton = document.getElementById("admin-account-record-copy");
  const downloadButton = document.getElementById("admin-account-record-download");
  const feedbackNode = document.getElementById("admin-account-record-feedback");
  const rowsNode = document.getElementById("admin-account-record-rows");
  const summaryNode = document.getElementById("admin-account-record-summary");
  const accountGridNode = document.getElementById("admin-account-record-account-grid");
  const registrationGridNode = document.getElementById("admin-account-record-registration-grid");
  const waiverGridNode = document.getElementById("admin-account-record-waiver-grid");
  const signatureWrapNode = document.getElementById("admin-account-record-signature");
  const signatureImageNode = document.getElementById("admin-account-record-signature-image");
  const rawJsonNode = document.getElementById("admin-account-record-json");

  if (
    !roleSelect
    || !accountSelect
    || !loadButton
    || !copyButton
    || !downloadButton
    || !feedbackNode
    || !rowsNode
    || !summaryNode
    || !accountGridNode
    || !registrationGridNode
    || !waiverGridNode
    || !signatureWrapNode
    || !signatureImageNode
    || !rawJsonNode
  ) {
    return;
  }

  const state = {
    records: [],
    detail: null,
    loadingIndex: false,
    loadingDetail: false,
    selectedKey: "",
  };

  function escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function formatDateTime(value) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return String(value);
    }
    return new Intl.DateTimeFormat("en-MY", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kuala_Lumpur",
    }).format(date);
  }

  function setFeedback(message, isError = false) {
    feedbackNode.textContent = message || "";
    feedbackNode.classList.toggle("error", Boolean(isError));
    feedbackNode.classList.toggle("success", !isError && Boolean(message));
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

  function buildRecordKey(record) {
    return record?.id && record?.role ? `${record.role}:${record.id}` : "";
  }

  function parseRecordKey(value) {
    const [role, id] = String(value || "").split(":");
    if (!role || !id) {
      return null;
    }
    return { role, id };
  }

  async function getAccessToken() {
    const access = await window.legacyAuth?.requireRole?.("super_admin");
    if (!access?.ok) {
      throw new Error("A valid admin session is required.");
    }

    const token = await window.legacyAuth?.getAccessToken?.();
    if (!token) {
      throw new Error("A valid admin session is required.");
    }
    return token;
  }

  async function fetchJson(url) {
    const accessToken = await getAccessToken();
    const response = await window.fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload?.error || "Unable to load the requested account data right now.");
    }
    return payload;
  }

  async function fetchPdfBlob(url) {
    const accessToken = await getAccessToken();
    const response = await window.fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload?.error || "Unable to generate the PDF export right now.");
    }

    return {
      blob: await response.blob(),
      disposition: response.headers.get("content-disposition") || "",
    };
  }

  function parseFilenameFromDisposition(disposition) {
    const match = String(disposition || "").match(/filename="?([^"]+)"?/iu);
    return match?.[1] ? String(match[1]).trim() : "";
  }

  function renderFieldGrid(target, fields, emptyTitle, emptyBody) {
    const normalizedFields = Array.isArray(fields)
      ? fields.filter((field) => {
          if (!field?.label) {
            return false;
          }

          const value = field.value;
          if (value === null || value === undefined) {
            return false;
          }

          if (typeof value === "string" && !value.trim()) {
            return false;
          }

          return value !== "—";
        })
      : [];
    target.innerHTML = normalizedFields.length
      ? normalizedFields
          .map(
            (field) => `
              <article class="admin-account-record-field">
                <span>${escapeHtml(field.label)}</span>
                <strong>${escapeHtml(field.value)}</strong>
              </article>
            `
          )
          .join("")
      : `<p class="dashboard-note">${escapeHtml(emptyTitle)} ${emptyBody ? escapeHtml(emptyBody) : ""}</p>`;
  }

  function renderSummary() {
    if (!state.detail) {
      summaryNode.innerHTML = "<p>Select a client or coach to inspect the stored registration fields and any linked waiver submission.</p>";
      renderFieldGrid(accountGridNode, [], "Account identity, contact, and status details will appear here.");
      renderFieldGrid(registrationGridNode, [], "Registration fields captured during onboarding will appear here.");
      renderFieldGrid(waiverGridNode, [], "Linked waiver information and account audit details will appear here.");
      signatureWrapNode.hidden = true;
      signatureImageNode.removeAttribute("src");
      rawJsonNode.textContent = "Select a record to view the raw export.";
      copyButton.disabled = true;
      downloadButton.disabled = true;
      return;
    }

    const detail = state.detail;
    const roleLabel = detail.role === "coach" ? "Coach account" : "Client account";
    summaryNode.innerHTML = `
      <p><strong>${escapeHtml(detail.displayName || "Account")}</strong> • ${escapeHtml(roleLabel)} • ${escapeHtml(detail.status || "active")}</p>
      <small>${escapeHtml(detail.email || "No email available")} • ${escapeHtml(detail.phone || "No phone recorded")}</small>
    `;

    const registrationFields = []
      .concat(detail.sections?.registration || [])
      .concat(detail.sections?.payout || []);
    const waiverFields = []
      .concat(detail.sections?.waiver || [])
      .concat(detail.sections?.audit || []);

    renderFieldGrid(accountGridNode, detail.sections?.account || [], "Account identity, contact, and status details will appear here.");
    renderFieldGrid(registrationGridNode, registrationFields, "Registration fields captured during onboarding will appear here.");
    renderFieldGrid(waiverGridNode, waiverFields, "Linked waiver information and account audit details will appear here.");

    if (detail.signatureDataUrl) {
      signatureWrapNode.hidden = false;
      signatureImageNode.src = detail.signatureDataUrl;
    } else {
      signatureWrapNode.hidden = true;
      signatureImageNode.removeAttribute("src");
    }

    rawJsonNode.textContent = JSON.stringify(detail.raw || {}, null, 2);
    copyButton.disabled = false;
    downloadButton.disabled = false;
  }

  function renderIndex() {
    const records = state.records || [];
    accountSelect.innerHTML = [
      '<option value="">Select account</option>',
      ...records.map((record) => {
        const roleLabel = record.role === "coach" ? "Coach" : "Client";
        const optionLabel = `${record.displayName || "Account"} • ${roleLabel}`;
        const isSelected = buildRecordKey(record) === state.selectedKey;
        return `<option value="${escapeHtml(buildRecordKey(record))}"${isSelected ? " selected" : ""}>${escapeHtml(optionLabel)}</option>`;
      }),
    ].join("");
    accountSelect.disabled = !records.length;
    loadButton.disabled = !records.length;

    rowsNode.innerHTML = records.length
      ? records
          .map((record) => {
            const roleLabel = record.role === "coach" ? "Coach" : "Client";
            const waiverLabel = record.role === "coach"
              ? "Not required"
              : record.hasWaiver
                ? `Signed ${formatDateTime(record.waiverSignedAt)}`
                : "Missing waiver";

            return `
              <tr>
                <td>${escapeHtml(record.displayName || "Account")}</td>
                <td>${escapeHtml(roleLabel)}</td>
                <td>${escapeHtml(record.email || "No email")}</td>
                <td>${escapeHtml(record.status || "active")}</td>
                <td>${escapeHtml(waiverLabel)}</td>
                <td>
                  <button
                    class="btn btn-ghost"
                    type="button"
                    data-account-record-id="${escapeHtml(record.id)}"
                    data-account-record-role="${escapeHtml(record.role)}"
                  >
                    View Record
                  </button>
                </td>
              </tr>
            `;
          })
          .join("")
      : buildEmptyTableRow(
          6,
          "No account records found.",
          "No coach or client accounts match the current filter yet."
        );
  }

  async function loadDetail(role, id, silent = false) {
    if (!role || !id) {
      state.detail = null;
      renderSummary();
      return;
    }

    state.loadingDetail = true;
    state.selectedKey = `${role}:${id}`;
    renderIndex();
    if (!silent) {
      setFeedback("Loading the selected account record...", false);
    }

    try {
      const params = new URLSearchParams({
        role,
        accountId: id,
      });
      const payload = await fetchJson(`/.netlify/functions/load-account-records?${params.toString()}`);
      state.detail = payload.record || null;
      renderSummary();
      setFeedback("Account record loaded. You can copy or download the raw JSON now.", false);
    } catch (error) {
      state.detail = null;
      renderSummary();
      setFeedback(error?.message || "Unable to load the selected account record.", true);
    } finally {
      state.loadingDetail = false;
    }
  }

  async function loadIndex({ preserveSelection = true } = {}) {
    state.loadingIndex = true;
    setFeedback("Loading account records...", false);
    copyButton.disabled = true;
    downloadButton.disabled = true;

    try {
      const params = new URLSearchParams({
        role: roleSelect.value || "all",
      });
      const payload = await fetchJson(`/.netlify/functions/load-account-records?${params.toString()}`);
      state.records = Array.isArray(payload.records) ? payload.records : [];

      const hasCurrentSelection = preserveSelection
        && state.selectedKey
        && state.records.some((record) => buildRecordKey(record) === state.selectedKey);

      if (!hasCurrentSelection) {
        state.selectedKey = state.records.length ? buildRecordKey(state.records[0]) : "";
      }

      renderIndex();

      if (state.selectedKey) {
        const selected = parseRecordKey(state.selectedKey);
        await loadDetail(selected?.role, selected?.id, true);
      } else {
        state.detail = null;
        renderSummary();
        setFeedback("Account index loaded. Select a record to inspect the stored registration data.", false);
      }
    } catch (error) {
      state.records = [];
      state.detail = null;
      renderIndex();
      renderSummary();
      setFeedback(error?.message || "Unable to load account records right now.", true);
    } finally {
      state.loadingIndex = false;
    }
  }

  function downloadJson(filename, data) {
    const blob = new Blob([JSON.stringify(data || {}, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(blobUrl);
  }

  loadButton.addEventListener("click", () => {
    const selected = parseRecordKey(accountSelect.value);
    void loadDetail(selected?.role, selected?.id);
  });

  accountSelect.addEventListener("change", () => {
    state.selectedKey = accountSelect.value || "";
    const selected = parseRecordKey(state.selectedKey);
    void loadDetail(selected?.role, selected?.id, true);
  });

  roleSelect.addEventListener("change", () => {
    state.selectedKey = "";
    void loadIndex({ preserveSelection: false });
  });

  rowsNode.addEventListener("click", (event) => {
    const button = event.target.closest("[data-account-record-id]");
    if (!(button instanceof HTMLButtonElement)) {
      return;
    }

    const role = button.getAttribute("data-account-record-role");
    const id = button.getAttribute("data-account-record-id");
    if (!role || !id) {
      return;
    }

    state.selectedKey = `${role}:${id}`;
    accountSelect.value = state.selectedKey;
    void loadDetail(role, id);
  });

  copyButton.addEventListener("click", async () => {
    if (!state.detail?.raw) {
      return;
    }

    try {
      await navigator.clipboard.writeText(JSON.stringify(state.detail.raw, null, 2));
      setFeedback("Raw account export copied to clipboard.", false);
    } catch (_) {
      setFeedback("Clipboard copy was blocked. Use Download JSON instead.", true);
    }
  });

  downloadButton.addEventListener("click", () => {
    if (!state.detail?.id || !state.detail?.role) {
      return;
    }

    void (async () => {
      try {
        setFeedback("Generating PDF export...", false);
        const params = new URLSearchParams({
          role: state.detail.role,
          accountId: state.detail.id,
        });
        const { blob, disposition } = await fetchPdfBlob(`/.netlify/functions/download-account-record-pdf?${params.toString()}`);
        const safeName = String(state.detail.displayName || state.detail.id || "account-record")
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/gu, "-")
          .replace(/^-+|-+$/gu, "");
        const filename = parseFilenameFromDisposition(disposition) || `${safeName || "account-record"}-registration-record.pdf`;
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(blobUrl);
        setFeedback("PDF export downloaded.", false);
      } catch (error) {
        setFeedback(error?.message || "Unable to generate the PDF export right now.", true);
      }
    })();
  });

  void loadIndex({ preserveSelection: false });
})();
