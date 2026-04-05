const { json, methodNotAllowed, noContent } = require("./_lib/http");
const { createHttpError, parseBody, requireAllowedRole } = require("./_lib/planner");
const { buildWorkbookDraft } = require("./_lib/planner-workbook-import");
const { getAuthenticatedProfile, getServiceSupabase } = require("./_lib/supabase");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return noContent({ "Cache-Control": "no-store" });
  }

  if (event.httpMethod !== "POST") {
    return methodNotAllowed("POST, OPTIONS");
  }

  const body = parseBody(event);
  if (!body) {
    return json(400, { error: "Provide a valid JSON body." });
  }

  const supabase = getServiceSupabase();
  const auth = await getAuthenticatedProfile(event, supabase);
  if (!auth?.profile) {
    return json(401, { error: "A valid authenticated session is required." });
  }

  try {
    requireAllowedRole(auth.profile, ["coach", "super_admin"]);

    const workbookBase64 = String(body.workbookBase64 || "").trim();
    const sheetName = String(body.sheetName || "").trim();
    const filename = String(body.filename || "Workbook.xlsx").trim();

    if (!workbookBase64) {
      throw createHttpError(400, "Upload a workbook file before importing.");
    }

    const workbookBuffer = Buffer.from(workbookBase64, "base64");
    const draft = await buildWorkbookDraft({ workbookBuffer, sheetName, filename });

    return json(
      200,
      {
        ok: true,
        draft,
        message: `${draft.sheetName} imported into the template builder draft.`,
      },
      { "Cache-Control": "no-store" }
    );
  } catch (error) {
    return json(
      Number(error?.statusCode || 500),
      { error: error?.message || "Unable to import the workbook right now." },
      { "Cache-Control": "no-store" }
    );
  }
};
