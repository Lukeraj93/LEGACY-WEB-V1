const { json } = require("./http");
const { getAuthenticatedProfile } = require("./supabase");

const XP_SCHEMA = "xp";
let cachedClientXpEngine = null;

function getClientXpEngine() {
  if (!cachedClientXpEngine) {
    cachedClientXpEngine = require("../../../XP gamification/Config/client-xp-engine.js");
  }
  return cachedClientXpEngine;
}

function xpSchema(supabase) {
  return supabase.schema(XP_SCHEMA);
}

function parseBody(event) {
  try {
    return JSON.parse(event.body || "{}");
  } catch (_) {
    return null;
  }
}

async function requireAuthenticatedAccess(event, supabase) {
  const access = await getAuthenticatedProfile(event, supabase);
  if (!access) {
    return {
      ok: false,
      response: json(401, { error: "A valid authenticated session is required." }),
    };
  }

  return { ok: true, access };
}

async function requireSuperAdminAccess(event, supabase) {
  const baseAccess = await requireAuthenticatedAccess(event, supabase);
  if (!baseAccess.ok) {
    return baseAccess;
  }

  if (baseAccess.access.profile.role !== "super_admin") {
    return {
      ok: false,
      response: json(403, { error: "Only super admins can access this endpoint." }),
    };
  }

  return baseAccess;
}

async function requireCoachOrSuperAdminAccess(event, supabase) {
  const baseAccess = await requireAuthenticatedAccess(event, supabase);
  if (!baseAccess.ok) {
    return baseAccess;
  }

  if (!["coach", "super_admin"].includes(baseAccess.access.profile.role)) {
    return {
      ok: false,
      response: json(403, { error: "Only coaches or super admins can access this endpoint." }),
    };
  }

  return baseAccess;
}

async function fetchLinkedMemberIdForProfile(supabase, profileId) {
  if (!profileId) {
    return "";
  }

  const { data, error } = await xpSchema(supabase)
    .from("members")
    .select("member_id")
    .eq("profile_id", profileId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return String(data?.member_id || "").trim();
}

function workbookExists() {
  return getClientXpEngine().workbookExists();
}

async function upsertActionsFromBundle(supabase) {
  const {
    readClientXpBundle,
    readClientXpSchema,
    readClientXpImportContract,
    validateClientXpBundle,
    buildActionRows,
  } = getClientXpEngine();
  const bundle = readClientXpBundle();
  const schema = readClientXpSchema();
  const importContract = readClientXpImportContract();
  const validation = validateClientXpBundle(bundle, schema, importContract);
  const actionRows = buildActionRows(bundle);

  const { error } = await xpSchema(supabase)
    .from("actions")
    .upsert(actionRows, { onConflict: "action_id" });

  if (error) {
    throw error;
  }

  return {
    validation,
    actionRows,
    bundle,
  };
}

async function importWorkbookData(supabase, actorId) {
  const {
    readClientXpImportContract,
    readWorkbookRows,
    buildMemberRowsFromWorkbook,
    buildEventRowsFromWorkbook,
  } = getClientXpEngine();
  if (!workbookExists()) {
    return {
      workbookImported: false,
      counts: {
        members: 0,
        events: 0,
      },
    };
  }

  const workbookRows = await readWorkbookRows();
  const importContract = readClientXpImportContract();
  const memberRows = buildMemberRowsFromWorkbook(
    workbookRows[importContract.entities?.members?.sourceSheet] || [],
    importContract
  );
  const eventRows = buildEventRowsFromWorkbook(
    workbookRows[importContract.entities?.events?.sourceSheet] || [],
    actorId,
    importContract
  );

  if (memberRows.length) {
    const { error } = await xpSchema(supabase)
      .from("members")
      .upsert(memberRows, { onConflict: "member_id" });
    if (error) {
      throw error;
    }
  }

  if (eventRows.length) {
    const { error } = await xpSchema(supabase)
      .from("events")
      .upsert(eventRows, { onConflict: "source_ref" });
    if (error) {
      throw error;
    }
  }

  return {
    workbookImported: true,
    counts: {
      members: memberRows.length,
      events: eventRows.length,
    },
  };
}

async function runClientXpImport(supabase, actorId, options = {}) {
  const bundleImport = await upsertActionsFromBundle(supabase);
  const workbookImport = options.includeWorkbook === false
    ? {
        workbookImported: false,
        counts: {
          members: 0,
          events: 0,
        },
      }
    : await importWorkbookData(supabase, actorId);

  return {
    bundleImported: true,
    workbookImported: workbookImport.workbookImported,
    bundleValidation: bundleImport.validation,
    counts: {
      actions: bundleImport.actionRows.length,
      members: workbookImport.counts.members,
      events: workbookImport.counts.events,
    },
    settings: bundleImport.bundle.contents?.rulesEngine?.settings || {},
  };
}

module.exports = {
  XP_SCHEMA,
  xpSchema,
  parseBody,
  workbookExists,
  requireAuthenticatedAccess,
  requireSuperAdminAccess,
  requireCoachOrSuperAdminAccess,
  fetchLinkedMemberIdForProfile,
  runClientXpImport,
};
