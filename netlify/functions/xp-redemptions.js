const { json, methodNotAllowed, noContent } = require("./_lib/http");
const { getServiceSupabase } = require("./_lib/supabase");
const {
  xpSchema,
  parseBody,
  requireAuthenticatedAccess,
  requireSuperAdminAccess,
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
          return json(200, { ok: true, redemptions: [] });
        }
      } else if (!["coach", "super_admin"].includes(access.profile.role)) {
        return json(403, { error: "This account cannot access XP redemptions." });
      }

      let query = xpSchema(supabase)
        .from("redemptions")
        .select("*")
        .order("redeemed_at", { ascending: false })
        .limit(100);

      if (scopedMemberId) {
        query = query.eq("member_id", scopedMemberId);
      }

      const { data, error } = await query;
      if (error) {
        throw error;
      }

      return json(200, { ok: true, redemptions: data || [] });
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
      member_id: String(body.member_id || "").trim(),
      coins: Number(body.coins || 0),
      reward_name: String(body.reward_name || "").trim(),
      notes: String(body.notes || "").trim() || null,
      created_by_profile_id: accessResult.access.profile.id,
    };

    if (!payload.member_id || !payload.coins || !payload.reward_name) {
      return json(400, { error: "member_id, coins, and reward_name are required." });
    }

    const { data, error } = await xpSchema(supabase)
      .from("redemptions")
      .insert(payload)
      .select("*")
      .single();
    if (error) {
      throw error;
    }

    return json(200, { ok: true, redemption: data });
  } catch (error) {
    return json(500, {
      error: error?.message || "Unable to load or create XP redemptions.",
    });
  }
};
