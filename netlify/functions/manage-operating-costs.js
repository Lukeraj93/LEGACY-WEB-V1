const crypto = require("node:crypto");

const { json, methodNotAllowed, noContent } = require("./_lib/http");
const { getAuthenticatedProfile, getServiceSupabase } = require("./_lib/supabase");

const SETTINGS_KEY = "operating_cost_entries_v1";
const ALLOWED_GROUPS = new Set([
  "payroll",
  "variable_cost",
  "consumables",
  "facility",
  "marketing",
  "software",
  "admin",
  "tax_legal",
  "other",
]);

function parseBody(event) {
  try {
    return JSON.parse(event.body || "{}");
  } catch (_) {
    return null;
  }
}

function normalizeMonth(value) {
  const raw = String(value || "").trim();
  if (!raw) {
    return "";
  }

  if (/^\d{4}-\d{2}$/.test(raw)) {
    return `${raw}-01`;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return `${raw.slice(0, 7)}-01`;
  }

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}-01`;
}

function normalizeEntry(input, actorId) {
  const periodMonth = normalizeMonth(input?.periodMonth);
  const costGroup = String(input?.costGroup || "").trim().toLowerCase();
  const category = String(input?.category || "").trim();
  const notes = String(input?.notes || "").trim();
  const amountRm = Number(input?.amountRm || 0);

  if (!periodMonth) {
    throw new Error("A valid month is required.");
  }

  if (!ALLOWED_GROUPS.has(costGroup)) {
    throw new Error("Choose a valid cost group.");
  }

  if (!category) {
    throw new Error("A category label is required.");
  }

  if (!Number.isFinite(amountRm) || amountRm < 0) {
    throw new Error("Amount must be a valid positive number.");
  }

  const now = new Date().toISOString();
  return {
    id: String(input?.id || "").trim() || crypto.randomUUID(),
    periodMonth,
    costGroup,
    category,
    amountRm: Math.round(amountRm * 100) / 100,
    notes: notes || "",
    createdBy: String(input?.createdBy || actorId || "").trim() || null,
    updatedBy: actorId || null,
    createdAt: input?.createdAt || now,
    updatedAt: now,
  };
}

async function readSettingsRow(supabase) {
  const { data, error } = await supabase
    .from("app_settings")
    .select("key, value")
    .eq("key", SETTINGS_KEY)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data || null;
}

async function writeSettingsRow(supabase, actorId, entries) {
  const payload = {
    entries,
    updatedAt: new Date().toISOString(),
  };

  const { error } = await supabase.from("app_settings").upsert(
    {
      key: SETTINGS_KEY,
      value: payload,
      updated_by: actorId || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" }
  );

  if (error) {
    throw error;
  }
}

function getStoredEntries(row) {
  const rawEntries = row?.value?.entries;
  if (!Array.isArray(rawEntries)) {
    return [];
  }

  return rawEntries
    .map((entry) => ({
      id: String(entry?.id || "").trim(),
      periodMonth: normalizeMonth(entry?.periodMonth),
      costGroup: String(entry?.costGroup || "").trim().toLowerCase(),
      category: String(entry?.category || "").trim(),
      amountRm: Number(entry?.amountRm || 0),
      notes: String(entry?.notes || "").trim(),
      createdBy: entry?.createdBy || null,
      updatedBy: entry?.updatedBy || null,
      createdAt: entry?.createdAt || null,
      updatedAt: entry?.updatedAt || null,
    }))
    .filter((entry) => entry.id && entry.periodMonth && entry.category && ALLOWED_GROUPS.has(entry.costGroup));
}

function summarizeEntries(entries) {
  const now = new Date();
  const currentMonth = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-01`;
  const currentYear = now.getUTCFullYear();

  const currentMonthEntries = entries.filter((entry) => entry.periodMonth === currentMonth);
  const ytdEntries = entries.filter((entry) => Number(String(entry.periodMonth).slice(0, 4)) === currentYear);

  const groupTotalsMap = new Map();
  ytdEntries.forEach((entry) => {
    groupTotalsMap.set(entry.costGroup, Number(groupTotalsMap.get(entry.costGroup) || 0) + Number(entry.amountRm || 0));
  });

  const monthlyTotalsMap = new Map();
  entries.forEach((entry) => {
    monthlyTotalsMap.set(entry.periodMonth, Number(monthlyTotalsMap.get(entry.periodMonth) || 0) + Number(entry.amountRm || 0));
  });

  return {
    entryCount: entries.length,
    currentMonth,
    currentMonthTotal: currentMonthEntries.reduce((total, entry) => total + Number(entry.amountRm || 0), 0),
    ytdTotal: ytdEntries.reduce((total, entry) => total + Number(entry.amountRm || 0), 0),
    currentMonthCount: currentMonthEntries.length,
    groupTotals: Array.from(groupTotalsMap, ([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value),
    monthlyTotals: Array.from(monthlyTotalsMap, ([label, value]) => ({ label, value }))
      .sort((a, b) => a.label.localeCompare(b.label))
      .slice(-12),
    lastUpdatedAt: entries[0]?.updatedAt || null,
  };
}

async function writeAuditLog(supabase, actorId, action, details) {
  await supabase.from("audit_logs").insert({
    actor_id: actorId || null,
    entity_type: "operating_cost_entries",
    entity_id: SETTINGS_KEY,
    action,
    details,
  });
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return noContent();
  }

  if (!["GET", "POST"].includes(event.httpMethod)) {
    return methodNotAllowed("GET, POST, OPTIONS");
  }

  try {
    const supabase = getServiceSupabase();
    const access = await getAuthenticatedProfile(event, supabase);
    if (!access) {
      return json(401, { error: "A valid admin session is required." });
    }

    if (access.profile.role !== "super_admin") {
      return json(403, { error: "Only super admins can manage operating costs." });
    }

    const row = await readSettingsRow(supabase);
    let entries = getStoredEntries(row).sort((left, right) => {
      if (left.periodMonth === right.periodMonth) {
        return String(right.updatedAt || "").localeCompare(String(left.updatedAt || ""));
      }
      return right.periodMonth.localeCompare(left.periodMonth);
    });

    if (event.httpMethod === "GET") {
      return json(200, {
        ok: true,
        entries,
        summary: summarizeEntries(entries),
      });
    }

    const body = parseBody(event);
    if (!body) {
      return json(400, { error: "Request body must be valid JSON." });
    }

    const action = String(body.action || "").trim();

    if (action === "upsert_entry") {
      const normalizedEntry = normalizeEntry(body.entry || {}, access.profile.id);
      entries = entries.filter((entry) => entry.id !== normalizedEntry.id).concat(normalizedEntry);
      entries.sort((left, right) => {
        if (left.periodMonth === right.periodMonth) {
          return String(right.updatedAt || "").localeCompare(String(left.updatedAt || ""));
        }
        return right.periodMonth.localeCompare(left.periodMonth);
      });

      await writeSettingsRow(supabase, access.profile.id, entries);
      await writeAuditLog(supabase, access.profile.id, "upsert_entry", normalizedEntry).catch(() => null);

      return json(200, {
        ok: true,
        message: "Operating cost entry saved.",
        entries,
        summary: summarizeEntries(entries),
      });
    }

    if (action === "delete_entry") {
      const entryId = String(body.entryId || "").trim();
      if (!entryId) {
        return json(400, { error: "entryId is required." });
      }

      const nextEntries = entries.filter((entry) => entry.id !== entryId);
      if (nextEntries.length === entries.length) {
        return json(404, { error: "Operating cost entry not found." });
      }

      entries = nextEntries;
      await writeSettingsRow(supabase, access.profile.id, entries);
      await writeAuditLog(supabase, access.profile.id, "delete_entry", { entryId }).catch(() => null);

      return json(200, {
        ok: true,
        message: "Operating cost entry deleted.",
        entries,
        summary: summarizeEntries(entries),
      });
    }

    return json(400, { error: "Unsupported operating cost action." });
  } catch (error) {
    return json(500, {
      error: error?.message || "Unable to manage operating costs right now.",
    });
  }
};
