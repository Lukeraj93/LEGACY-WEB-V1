const { json, methodNotAllowed, noContent } = require("./_lib/http");
const { getServiceSupabase } = require("./_lib/supabase");
const {
  xpSchema,
  requireAuthenticatedAccess,
  fetchLinkedMemberIdForProfile,
} = require("./_lib/xp-client");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return noContent();
  }

  if (event.httpMethod !== "GET") {
    return methodNotAllowed("GET, OPTIONS");
  }

  try {
    const supabase = getServiceSupabase();
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
        return json(200, { ok: true, ledger: [], weekly: [], monthly: [] });
      }
    } else if (!["coach", "super_admin"].includes(access.profile.role)) {
      return json(403, { error: "This account cannot access the XP ledger." });
    }

    let ledgerQuery = xpSchema(supabase)
      .from("ledger_view")
      .select("*")
      .order("total_xp", { ascending: false });
    let weeklyQuery = xpSchema(supabase)
      .from("weekly_summary_view")
      .select("*")
      .order("week_start_date", { ascending: false })
      .limit(200);
    let monthlyQuery = xpSchema(supabase)
      .from("monthly_summary_view")
      .select("*")
      .order("month_start_date", { ascending: false })
      .limit(200);

    if (scopedMemberId) {
      ledgerQuery = ledgerQuery.eq("member_id", scopedMemberId);
      weeklyQuery = weeklyQuery.eq("member_id", scopedMemberId);
      monthlyQuery = monthlyQuery.eq("member_id", scopedMemberId);
    }

    const [ledgerResult, weeklyResult, monthlyResult] = await Promise.all([
      ledgerQuery,
      weeklyQuery,
      monthlyQuery,
    ]);

    if (ledgerResult.error) throw ledgerResult.error;
    if (weeklyResult.error) throw weeklyResult.error;
    if (monthlyResult.error) throw monthlyResult.error;

    return json(200, {
      ok: true,
      ledger: ledgerResult.data || [],
      weekly: weeklyResult.data || [],
      monthly: monthlyResult.data || [],
    });
  } catch (error) {
    return json(500, {
      error: error?.message || "Unable to load the XP ledger.",
    });
  }
};
