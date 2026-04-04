const { json, methodNotAllowed, noContent } = require("./_lib/http");
const { getServiceSupabase } = require("./_lib/supabase");
const { parseBody, requireSuperAdminAccess, writeXpCoachAuditLog, xpSchema } = require("./_lib/xp-coach");
const { normalizeSettings } = require("../../XP coach gamification/Config/coach-xp-engine.js");

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
      const response = await xpSchema(supabase).from("settings").select("*").order("key", { ascending: true });
      if (response.error) {
        throw response.error;
      }
      return json(200, {
        ok: true,
        settings: response.data || [],
      });
    }

    const body = parseBody(event);
    if (!body) {
      return json(400, { error: "Invalid JSON body." });
    }

    const normalized = normalizeSettings(body.settings || body);
    const rows = Object.entries(normalized).map(([key, value]) => ({
      key,
      value: String(value),
    }));

    const response = await xpSchema(supabase).from("settings").upsert(rows, {
      onConflict: "key",
    }).select("*");
    if (response.error) {
      throw response.error;
    }

    await writeXpCoachAuditLog(supabase, accessResult.access.profile.id, "xp_coach_settings_upsert", {
      entityId: "settings",
      settings: normalized,
    });

    return json(200, {
      ok: true,
      settings: response.data || [],
    });
  } catch (error) {
    return json(500, {
      error: error?.message || "Unable to manage Coach XP settings.",
    });
  }
};
