const { json, methodNotAllowed, noContent } = require("./_lib/http");
const {
  createHttpError,
  normalizeText,
  parseBody,
  requireAllowedRole,
} = require("./_lib/planner");
const { getAuthenticatedProfile, getServiceSupabase } = require("./_lib/supabase");
const { saveNutritionPlanRecord } = require("./save-nutrition-plan");

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

    const clientIds = Array.from(
      new Set(
        (Array.isArray(body.clientIds) ? body.clientIds : [])
          .map((value) => normalizeText(value))
          .filter(Boolean)
      )
    );

    if (!clientIds.length) {
      throw createHttpError(400, "Select at least one client before running the nutrition batch.");
    }

    const basePlan = body.plan && typeof body.plan === "object" ? body.plan : {};
    const habits = Array.isArray(body.habits) ? body.habits : [];

    const successes = [];
    const failures = [];

    for (const clientId of clientIds) {
      try {
        const result = await saveNutritionPlanRecord(supabase, auth.profile, {
          plan: {
            ...basePlan,
            clientId,
          },
          habits,
        });
        successes.push({
          clientId,
          planId: result.plan?.id || "",
          title: result.plan?.title || "",
        });
      } catch (error) {
        failures.push({
          clientId,
          message: error?.message || "Bulk nutrition assignment failed.",
        });
      }
    }

    return json(200, {
      ok: true,
      successes,
      failures,
      message: `Nutrition batch complete: ${successes.length} applied${failures.length ? `, ${failures.length} failed` : ""}.`,
    });
  } catch (error) {
    return json(Number(error?.statusCode || 500), {
      error: error?.message || "Unable to run the nutrition batch right now.",
    });
  }
};
