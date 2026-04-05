const { errorResponse, json, methodNotAllowed, noContent } = require("./_lib/http");
const { getPublicSupabase } = require("./_lib/supabase");
const { getOrSetRuntimeCache } = require("./_lib/runtime-cache");

const ACTIVE_COACH_CACHE_TTL_MS = 60 * 1000;
const activeCoachCache = new Map();

async function loadActiveCoaches(supabase) {
  let lastError = null;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const { data, error } = await supabase.rpc("list_active_coaches");

    if (!error) {
      return (data || []).map((coach) => ({
        id: coach.id,
        displayName: coach.display_name || "Coach",
      }));
    }

    lastError = error;
    await new Promise((resolve) => setTimeout(resolve, 150));
  }

  throw lastError || new Error("Unable to load the active coach roster.");
}

function buildHeaders(cacheState) {
  return {
    "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
    "X-Legacy-Cache": cacheState,
  };
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return noContent();
  }

  if (event.httpMethod !== "GET") {
    return methodNotAllowed("GET, OPTIONS");
  }

  try {
    const supabase = getPublicSupabase();
    const cachedCoaches = activeCoachCache.get("active-coaches");
    if (cachedCoaches && Date.now() - Number(cachedCoaches.createdAt || 0) <= ACTIVE_COACH_CACHE_TTL_MS) {
      return json(
        200,
        {
          ok: true,
          coaches: cachedCoaches.value,
        },
        buildHeaders("hit")
      );
    }

    const coaches = await getOrSetRuntimeCache(
      activeCoachCache,
      "active-coaches",
      ACTIVE_COACH_CACHE_TTL_MS,
      () => loadActiveCoaches(supabase)
    );

    return json(200, {
      ok: true,
      coaches,
    }, buildHeaders("miss"));
  } catch (error) {
    return errorResponse(error, "Unable to load the active coach roster.");
  }
};
