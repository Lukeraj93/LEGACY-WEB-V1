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

  if (!["GET", "POST", "PATCH"].includes(event.httpMethod)) {
    return methodNotAllowed("GET, POST, PATCH, OPTIONS");
  }

  try {
    const supabase = getServiceSupabase();

    if (event.httpMethod === "GET") {
      const accessResult = await requireAuthenticatedAccess(event, supabase);
      if (!accessResult.ok) {
        return accessResult.response;
      }

      const { access } = accessResult;
      let membersQuery = xpSchema(supabase)
        .from("members")
        .select("*")
        .order("member_id", { ascending: true });

      if (access.profile.role === "client") {
        const ownMemberId = await fetchLinkedMemberIdForProfile(supabase, access.profile.id);
        if (!ownMemberId) {
          return json(200, { ok: true, members: [], profiles: [] });
        }
        membersQuery = membersQuery.eq("member_id", ownMemberId);
      }

      const { data: members, error } = await membersQuery;
      if (error) {
        throw error;
      }

      let profiles = [];
      if (access.profile.role === "super_admin" && String(event.queryStringParameters?.includeProfiles || "") === "1") {
        const profileResponse = await supabase
          .from("profiles")
          .select("id, display_name, role, status")
          .in("role", ["client"]);
        if (profileResponse.error) {
          throw profileResponse.error;
        }
        profiles = profileResponse.data || [];
      }

      return json(200, {
        ok: true,
        members: members || [],
        profiles,
      });
    }

    if (event.httpMethod === "POST") {
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
        name: String(body.name || "").trim(),
        mode: String(body.mode || "Quest").trim() || "Quest",
        status: String(body.status || "Active").trim() || "Active",
      };

      if (!payload.member_id || !payload.name) {
        return json(400, { error: "member_id and name are required." });
      }

      const { data, error } = await xpSchema(supabase)
        .from("members")
        .upsert(payload, { onConflict: "member_id" })
        .select("*")
        .single();
      if (error) {
        throw error;
      }

      return json(200, { ok: true, member: data });
    }

    const accessResult = await requireSuperAdminAccess(event, supabase);
    if (!accessResult.ok) {
      return accessResult.response;
    }

    const body = parseBody(event);
    if (!body) {
      return json(400, { error: "Invalid JSON body." });
    }

    const memberId = String(body.member_id || "").trim();
    const profileId = String(body.profile_id || "").trim() || null;
    if (!memberId) {
      return json(400, { error: "member_id is required." });
    }

    const { data, error } = await xpSchema(supabase)
      .from("members")
      .update({ profile_id: profileId })
      .eq("member_id", memberId)
      .select("*")
      .single();
    if (error) {
      throw error;
    }

    return json(200, { ok: true, member: data });
  } catch (error) {
    return json(500, {
      error: error?.message || "Unable to manage XP members.",
    });
  }
};
