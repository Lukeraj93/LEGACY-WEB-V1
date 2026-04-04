const { json, methodNotAllowed, noContent } = require("./_lib/http");
const { getServiceSupabase } = require("./_lib/supabase");
const {
  parseBody,
  requireSuperAdminAccess,
  runCoachXpImport,
  workbookExists,
  writeXpCoachAuditLog,
} = require("./_lib/xp-coach");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return noContent();
  }

  if (!["GET", "POST"].includes(event.httpMethod)) {
    return methodNotAllowed("GET, POST, OPTIONS");
  }

  try {
    const supabase = getServiceSupabase();
    const accessResult = await requireSuperAdminAccess(event, supabase);
    if (!accessResult.ok) {
      return accessResult.response;
    }

    if (event.httpMethod === "GET") {
      return json(200, {
        ok: true,
        workbookAvailable: workbookExists(),
      });
    }

    const body = parseBody(event);
    if (!body) {
      return json(400, { error: "Invalid JSON body." });
    }

    const result = await runCoachXpImport(supabase, accessResult.access.profile.id, {
      includeWorkbook: body.includeWorkbook !== false,
    });

    await writeXpCoachAuditLog(supabase, accessResult.access.profile.id, "xp_coach_import", {
      entityId: "bundle-v1",
      ...result,
    });

    return json(200, {
      ok: true,
      ...result,
    });
  } catch (error) {
    return json(500, {
      error: error?.message || "Unable to import the Coach XP bundle.",
    });
  }
};
