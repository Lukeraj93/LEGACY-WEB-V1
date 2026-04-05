const { json, methodNotAllowed, noContent } = require("./_lib/http");
const { getServiceSupabase } = require("./_lib/supabase");
const {
  xpSchema,
  parseBody,
  requireAuthenticatedAccess,
  requireCoachOrSuperAdminAccess,
  fetchLinkedMemberIdForProfile,
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
      const accessResult = await requireAuthenticatedAccess(event, supabase);
      if (!accessResult.ok) {
        return accessResult.response;
      }

      const { access } = accessResult;
      const requestedMemberId = String(event.queryStringParameters?.member_id || "").trim();
      let scopedMemberId = requestedMemberId;

      if (access.profile.role === "client") {
        scopedMemberId = await fetchLinkedMemberIdForProfile(supabase, access.profile.id);
        if (!scopedMemberId) {
          return json(200, { ok: true, events: [] });
        }
      } else if (!["coach", "super_admin"].includes(access.profile.role)) {
        return json(403, { error: "This account cannot access XP events." });
      }

      let query = xpSchema(supabase)
        .from("events")
        .select("*")
        .order("event_date", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(200);

      if (scopedMemberId) {
        query = query.eq("member_id", scopedMemberId);
      }

      const { data, error } = await query;
      if (error) {
        throw error;
      }

      return json(200, { ok: true, events: data || [] });
    }

    const accessResult = await requireCoachOrSuperAdminAccess(event, supabase);
    if (!accessResult.ok) {
      return accessResult.response;
    }

    const body = parseBody(event);
    if (!body) {
      return json(400, { error: "Invalid JSON body." });
    }

    const payload = {
      event_date: String(body.event_date || "").trim(),
      member_id: String(body.member_id || "").trim(),
      action_id: String(body.action_id || "").trim(),
      qty: Number(body.qty || 1),
      verified: body.verified === true,
      coach_profile_id: accessResult.access.profile.id,
      notes: String(body.notes || "").trim() || null,
    };

    if (!payload.event_date || !payload.member_id || !payload.action_id) {
      return json(400, { error: "event_date, member_id, and action_id are required." });
    }

    const { data, error } = await xpSchema(supabase)
      .from("events")
      .insert(payload)
      .select("*")
      .single();
    if (error) {
      throw error;
    }

    return json(200, { ok: true, event: data });
  } catch (error) {
    return json(500, {
      error: error?.message || "Unable to load or create XP events.",
    });
  }
};
