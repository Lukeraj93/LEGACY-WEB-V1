const { json, methodNotAllowed, noContent } = require("./_lib/http");
const { getServiceSupabase } = require("./_lib/supabase");
const {
  xpSchema,
  parseBody,
  requireCoachOrSuperAdminAccess,
  requireSuperAdminAccess,
} = require("./_lib/xp-client");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return noContent();
  }

  if (!["GET", "POST"].includes(event.httpMethod)) {
    return methodNotAllowed("GET, POST, OPTIONS");
  }

  try {
    const supabase = getServiceSupabase();

    if (event.httpMethod === "GET") {
      const accessResult = await requireCoachOrSuperAdminAccess(event, supabase);
      if (!accessResult.ok) {
        return accessResult.response;
      }

      const { data, error } = await xpSchema(supabase)
        .from("actions")
        .select("*")
        .order("category", { ascending: true })
        .order("display_name", { ascending: true });
      if (error) {
        throw error;
      }

      return json(200, { ok: true, actions: data || [] });
    }

    const accessResult = await requireSuperAdminAccess(event, supabase);
    if (!accessResult.ok) {
      return accessResult.response;
    }

    const body = parseBody(event);
    if (!body) {
      return json(400, { error: "Invalid JSON body." });
    }

    const payload = {
      action_id: String(body.action_id || "").trim(),
      display_name: String(body.display_name || "").trim(),
      category: String(body.category || "").trim(),
      earn_type: String(body.earn_type || "").trim(),
      xp: Number(body.xp || 0),
      coins: Number(body.coins || 0),
      is_active: body.is_active !== false,
    };

    if (!payload.action_id || !payload.display_name || !payload.category || !payload.earn_type) {
      return json(400, { error: "action_id, display_name, category, and earn_type are required." });
    }

    const { data, error } = await xpSchema(supabase)
      .from("actions")
      .upsert(payload, { onConflict: "action_id" })
      .select("*")
      .single();
    if (error) {
      throw error;
    }

    return json(200, { ok: true, action: data });
  } catch (error) {
    return json(500, {
      error: error?.message || "Unable to load or update XP actions.",
    });
  }
};
