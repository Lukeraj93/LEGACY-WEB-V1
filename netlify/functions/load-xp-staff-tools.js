const { json, methodNotAllowed, noContent } = require("./_lib/http");
const { getServiceSupabase } = require("./_lib/supabase");
const { getOrSetRuntimeCache } = require("./_lib/runtime-cache");
const {
  xpSchema,
  requireCoachOrSuperAdminAccess,
} = require("./_lib/xp-client");

const STAFF_TOOLS_CACHE_TTL_MS = 30 * 1000;
const ACTIONS_CACHE_TTL_MS = 5 * 60 * 1000;
const staffToolsCache = new Map();
const actionsCache = new Map();

function buildCacheKey(access) {
  return ["xp-staff-tools", access?.profile?.role || "unknown"].join(":");
}

function buildResponseHeaders(durationMs, cacheState) {
  return {
    "Cache-Control": "no-store",
    "Server-Timing": `app;dur=${Math.max(1, Math.round(durationMs || 0))}`,
    "X-Legacy-Xp-Cache": cacheState,
  };
}

async function loadActions(supabase) {
  return getOrSetRuntimeCache(actionsCache, "xp-actions:staff:v2", ACTIONS_CACHE_TTL_MS, async () => {
    const { data, error } = await xpSchema(supabase)
      .from("actions")
      .select("action_id, display_name, category, earn_type")
      .order("category", { ascending: true })
      .order("display_name", { ascending: true });
    if (error) {
      throw error;
    }
    return data || [];
  });
}

async function buildStaffToolsPayload(supabase) {
  const [members, actions] = await Promise.all([
    (async () => {
      const { data, error } = await xpSchema(supabase)
        .from("members")
        .select("member_id, name, mode, status, profile_id")
        .order("member_id", { ascending: true });
      if (error) {
        throw error;
      }
      return data || [];
    })(),
    loadActions(supabase),
  ]);

  if (!members.length) {
    return {
      members,
      actions,
      ledger: [],
      weekly: [],
      events: [],
    };
  }

  const [ledgerResult, weeklyResult, eventsResult] = await Promise.all([
    xpSchema(supabase)
      .from("ledger_view")
      .select("name, member_id, level, total_xp, coin_balance")
      .order("total_xp", { ascending: false }),
    xpSchema(supabase)
      .from("weekly_summary_view")
      .select("name, member_id, week_key, routine_xp_counted, uncapped_xp, weekly_xp_counted, week_start_date")
      .order("week_start_date", { ascending: false })
      .limit(120),
    xpSchema(supabase)
      .from("events")
      .select("event_date, member_id, action_id, qty, verified, created_at")
      .order("event_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(150),
  ]);

  if (ledgerResult.error) {
    throw ledgerResult.error;
  }
  if (weeklyResult.error) {
    throw weeklyResult.error;
  }
  if (eventsResult.error) {
    throw eventsResult.error;
  }

  return {
    members,
    actions,
    ledger: ledgerResult.data || [],
    weekly: weeklyResult.data || [],
    events: eventsResult.data || [],
  };
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return noContent({ "Cache-Control": "no-store" });
  }

  if (event.httpMethod !== "GET") {
    return methodNotAllowed("GET, OPTIONS");
  }

  try {
    const startedAt = Date.now();
    const supabase = getServiceSupabase();
    const accessResult = await requireCoachOrSuperAdminAccess(event, supabase);
    if (!accessResult.ok) {
      return accessResult.response;
    }

    const cacheKey = buildCacheKey(accessResult.access);
    const allowCache = String(event.queryStringParameters?.fresh || "").trim() !== "1";
    if (allowCache) {
      const cached = staffToolsCache.get(cacheKey);
      if (cached && Date.now() - cached.createdAt <= STAFF_TOOLS_CACHE_TTL_MS) {
        return json(
          200,
          {
            ok: true,
            ...cached.payload,
          },
          buildResponseHeaders(Date.now() - startedAt, "hit")
        );
      }
    }

    const payload = await buildStaffToolsPayload(supabase);
    staffToolsCache.set(cacheKey, {
      createdAt: Date.now(),
      payload,
    });

    return json(
      200,
      {
        ok: true,
        ...payload,
      },
      buildResponseHeaders(Date.now() - startedAt, "miss")
    );
  } catch (error) {
    return json(
      500,
      {
        error: error?.message || "Unable to load the coach XP tools right now.",
      },
      { "Cache-Control": "no-store" }
    );
  }
};
