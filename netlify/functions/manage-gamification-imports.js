const crypto = require("node:crypto");

const { json, methodNotAllowed, noContent } = require("./_lib/http");
const { getAuthenticatedProfile, getServiceSupabase } = require("./_lib/supabase");

const SEED_ACTION_ID = "SEED-INIT";

function parseBody(event) {
  try {
    return JSON.parse(event.body || "{}");
  } catch (_) {
    return null;
  }
}

function normalizeHeaderKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function mapHeaderToField(header) {
  const key = normalizeHeaderKey(header);
  const aliases = {
    memberid: "member_id",
    membername: "member_name",
    approved: "approved",
    approvedyesno: "approved",
    seedxplocked: "seed_xp_locked",
    seedxpcalc: "seed_xp_calc",
    seedlevelcalculated: "seed_level_calc",
    monthscoached: "months_coached",
    avgsessionsperweek: "avg_sessions_per_week",
    adherencescore15: "adherence_score",
    movementcompetency15: "movement_competency",
    strengthlevel15: "strength_level",
    lifestylehabits15: "lifestyle_habits",
    trackingconsistency15: "tracking_consistency",
    selfmastery15: "self_mastery",
    knowledgelevel15: "knowledge_level",
    notes: "notes",
  };

  return aliases[key] || key;
}

function parseDelimitedRows(text, delimiter) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const nextChar = text[index + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          cell += '"';
          index += 1;
        } else {
          inQuotes = false;
        }
      } else {
        cell += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      continue;
    }

    if (char === delimiter) {
      row.push(cell);
      cell = "";
      continue;
    }

    if (char === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    if (char === "\r") {
      continue;
    }

    cell += char;
  }

  row.push(cell);
  rows.push(row);

  return rows.filter((candidate) => candidate.some((value) => String(value || "").trim()));
}

function parseRowsInput(input) {
  if (Array.isArray(input)) {
    return input;
  }

  if (input && typeof input === "object") {
    if (Array.isArray(input.rows)) {
      return input.rows;
    }
    if (Array.isArray(input.seedPlacement)) {
      return input.seedPlacement;
    }
    if (Array.isArray(input.seed_placement)) {
      return input.seed_placement;
    }
  }

  const text = String(input || "").trim();
  if (!text) {
    return [];
  }

  try {
    return parseRowsInput(JSON.parse(text));
  } catch (_) {
    const firstLine = text.split(/\r?\n/u)[0] || "";
    const delimiter = firstLine.includes("\t") ? "\t" : ",";
    const rawRows = parseDelimitedRows(text, delimiter);
    if (!rawRows.length) {
      return [];
    }

    const headers = rawRows[0].map((header) => mapHeaderToField(header));
    return rawRows.slice(1).map((cells) => {
      const row = {};
      headers.forEach((header, index) => {
        row[header] = cells[index] ?? "";
      });
      return row;
    });
  }
}

function normalizeBoolean(value) {
  const raw = String(value ?? "").trim().toLowerCase();
  if (!raw) {
    return false;
  }
  if (["yes", "y", "true", "1", "approved"].includes(raw)) {
    return true;
  }
  if (["no", "n", "false", "0"].includes(raw)) {
    return false;
  }
  return false;
}

function normalizeNumber(value) {
  const raw = String(value ?? "")
    .trim()
    .replace(/,/g, "");
  if (!raw) {
    return Number.NaN;
  }
  return Number(raw);
}

function normalizeSeedRow(input, index) {
  const row = input && typeof input === "object" ? input : {};
  const memberId = String(row.member_id || row.memberId || row.MemberID || "").trim();
  const notes = String(row.notes || row.Notes || "").trim();
  const seedXpLocked = normalizeNumber(row.seed_xp_locked ?? row.seedXpLocked ?? row.SeedXP_Locked);

  return {
    rowNumber: index + 1,
    memberId,
    approved: normalizeBoolean(row.approved ?? row.Approved),
    seedXpLocked,
    notes,
    raw: row,
  };
}

function summarizePreview(rows, importedCount = 0) {
  return rows.reduce(
    (summary, row) => {
      summary.totalRows += 1;
      if (row.status === "ready") summary.readyCount += 1;
      if (row.status === "already_seeded") summary.alreadySeededCount += 1;
      if (row.status === "unmatched_member_id") summary.unmatchedCount += 1;
      if (row.status === "skipped_not_approved") summary.skippedCount += 1;
      if (row.status === "duplicate_in_batch") summary.duplicateCount += 1;
      if (row.status === "invalid_missing_member_id" || row.status === "invalid_seed_xp") summary.invalidCount += 1;
      return summary;
    },
    {
      totalRows: 0,
      readyCount: 0,
      importedCount,
      alreadySeededCount: 0,
      unmatchedCount: 0,
      skippedCount: 0,
      duplicateCount: 0,
      invalidCount: 0,
    }
  );
}

async function buildSeedImportPreview(supabase, rowsInput) {
  const parsedRows = parseRowsInput(rowsInput);
  if (!parsedRows.length) {
    throw new Error("Provide at least one SeedPlacement row as JSON or CSV.");
  }

  const normalizedRows = parsedRows.map((row, index) => normalizeSeedRow(row, index));
  const memberIds = Array.from(new Set(normalizedRows.map((row) => row.memberId).filter(Boolean)));

  const clientProfiles = memberIds.length
    ? await supabase
        .from("client_profiles")
        .select("id, member_id, preferred_name, xp_points")
        .in("member_id", memberIds)
    : { data: [], error: null };

  if (clientProfiles.error) {
    throw clientProfiles.error;
  }

  const clientByMemberId = new Map((clientProfiles.data || []).map((profile) => [profile.member_id, profile]));
  const clientIds = (clientProfiles.data || []).map((profile) => profile.id);

  const pointsLedger = clientIds.length
    ? await supabase
        .from("points_ledger")
        .select("client_id, reason, approval_status, delta, created_at")
        .in("client_id", clientIds)
        .order("created_at", { ascending: false })
        .limit(2000)
    : { data: [], error: null };

  if (pointsLedger.error) {
    throw pointsLedger.error;
  }

  const existingSeedByClientId = new Map();
  (pointsLedger.data || []).forEach((entry) => {
    if (!entry?.client_id || !String(entry.reason || "").includes(`[${SEED_ACTION_ID}]`)) {
      return;
    }
    if (!existingSeedByClientId.has(entry.client_id)) {
      existingSeedByClientId.set(entry.client_id, entry);
    }
  });

  const seenReadyClientIds = new Set();
  const previewRows = normalizedRows.map((row) => {
    if (!row.memberId) {
      return {
        ...row,
        status: "invalid_missing_member_id",
        message: "Missing member_id / MemberID.",
      };
    }

    if (!row.approved) {
      return {
        ...row,
        status: "skipped_not_approved",
        message: "Skipped because Approved is not yes.",
      };
    }

    if (!Number.isFinite(row.seedXpLocked) || row.seedXpLocked <= 0) {
      return {
        ...row,
        status: "invalid_seed_xp",
        message: "SeedXP_Locked is missing or invalid.",
      };
    }

    const client = clientByMemberId.get(row.memberId);
    if (!client) {
      return {
        ...row,
        status: "unmatched_member_id",
        message: "No CRM client matched this member_id.",
      };
    }

    if (existingSeedByClientId.has(client.id)) {
      return {
        ...row,
        clientId: client.id,
        clientName: client.preferred_name || client.member_id,
        status: "already_seeded",
        message: "This client already has a seed import entry.",
      };
    }

    if (seenReadyClientIds.has(client.id)) {
      return {
        ...row,
        clientId: client.id,
        clientName: client.preferred_name || client.member_id,
        status: "duplicate_in_batch",
        message: "Duplicate member_id inside this import batch.",
      };
    }

    seenReadyClientIds.add(client.id);
    return {
      ...row,
      clientId: client.id,
      clientName: client.preferred_name || client.member_id,
      status: "ready",
      message: `Ready to seed ${row.seedXpLocked} XP. Current profile XP: ${client.xp_points || 0}.`,
    };
  });

  return {
    rows: previewRows,
    summary: summarizePreview(previewRows),
  };
}

async function writeAuditLog(supabase, actorId, batchId, action, details) {
  await supabase.from("audit_logs").insert({
    actor_id: actorId || null,
    entity_type: "gamification_seed_import",
    entity_id: batchId,
    action,
    details,
  });
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return noContent();
  }

  if (event.httpMethod !== "POST") {
    return methodNotAllowed("POST, OPTIONS");
  }

  const body = parseBody(event);
  if (!body) {
    return json(400, { error: "Request body must be valid JSON." });
  }

  const action = String(body.action || "").trim();
  if (!["preview_seed_import", "apply_seed_import"].includes(action)) {
    return json(400, { error: "Unsupported gamification import action." });
  }

  try {
    const supabase = getServiceSupabase();
    const access = await getAuthenticatedProfile(event, supabase);
    if (!access) {
      return json(401, { error: "A valid admin session is required." });
    }

    if (access.profile.role !== "super_admin") {
      return json(403, { error: "Only super admins can run gamification imports." });
    }

    const batchLabel = String(body.batchLabel || "").trim() || `seed-placement-${new Date().toISOString().slice(0, 10)}`;
    const preview = await buildSeedImportPreview(supabase, body.rowsText);

    if (action === "preview_seed_import") {
      return json(200, {
        ok: true,
        action,
        batchLabel,
        message: `Preview complete. ${preview.summary.readyCount} row(s) are ready to import.`,
        summary: preview.summary,
        rows: preview.rows,
      });
    }

    const readyRows = preview.rows.filter((row) => row.status === "ready");
    if (!readyRows.length) {
      return json(200, {
        ok: true,
        action,
        batchLabel,
        message: "No eligible seed rows were found, so nothing was imported.",
        summary: summarizePreview(preview.rows, 0),
        rows: preview.rows,
      });
    }

    const importedAt = new Date().toISOString();
    const batchId = `${batchLabel}-${crypto.randomUUID().slice(0, 8)}`;
    const insertRows = readyRows.map((row) => ({
      client_id: row.clientId,
      points_type: "xp",
      delta: Number(row.seedXpLocked || 0),
      reason: `Seed Placement Import [${SEED_ACTION_ID}] | Batch ${batchLabel} | Member ${row.memberId}${row.notes ? ` | ${row.notes}` : ""}`,
      requested_by: access.profile.id,
      approved_by: access.profile.id,
      approval_status: "auto_approved",
      approved_at: importedAt,
    }));

    const { error: insertError } = await supabase.from("points_ledger").insert(insertRows);
    if (insertError) {
      throw insertError;
    }

    const importedClientIds = new Set(insertRows.map((row) => row.client_id));
    const rows = preview.rows.map((row) =>
      row.status === "ready" && importedClientIds.has(row.clientId)
        ? {
            ...row,
            status: "imported",
            message: `Imported ${row.seedXpLocked} XP as an auto-approved ${SEED_ACTION_ID} ledger entry.`,
          }
        : row
    );

    const summary = summarizePreview(rows, insertRows.length);
    await writeAuditLog(supabase, access.profile.id, batchId, "apply_seed_import", {
      batchLabel,
      summary,
      readyMemberIds: readyRows.map((row) => row.memberId),
    }).catch(() => null);

    return json(200, {
      ok: true,
      action,
      batchId,
      batchLabel,
      message: `Seed placement import applied. ${insertRows.length} seed entr${insertRows.length === 1 ? "y" : "ies"} inserted.`,
      summary,
      rows,
    });
  } catch (error) {
    return json(500, {
      error: error?.message || "Unable to process the gamification import right now.",
    });
  }
};
