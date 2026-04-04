const { json, methodNotAllowed, noContent } = require("./_lib/http");
const { getPlannerPayload } = require("./_lib/planner-data");
const { getAuthenticatedProfile, getServiceSupabase, getUserSupabase } = require("./_lib/supabase");
const { getOrSetRuntimeCache, writeRuntimeCache } = require("./_lib/runtime-cache");

const PLANNER_CACHE_TTL_MS = 45 * 1000;
const plannerPayloadCache = new Map();

function normalizeMode(value) {
  const mode = String(value || "")
    .trim()
    .toLowerCase();
  return mode === "brief" ? "brief" : "full";
}

function normalizeRefresh(value) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();
  return ["1", "true", "yes", "y", "refresh", "force"].includes(normalized);
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return noContent({ "Cache-Control": "no-store" });
  }

  if (event.httpMethod !== "GET") {
    return methodNotAllowed("GET, OPTIONS");
  }

  const userSupabase = getUserSupabase(event);
  if (!userSupabase) {
    return json(
      401,
      { error: "A valid authenticated session is required." },
      { "Cache-Control": "no-store" }
    );
  }
  const supabase = getServiceSupabase();
  let auth = null;
  try {
    auth = await getAuthenticatedProfile(event, userSupabase);
  } catch (error) {
    return json(
      500,
      { error: error?.message || "Unable to validate the authenticated planner request." },
      { "Cache-Control": "no-store" }
    );
  }
  const mode = normalizeMode(event.queryStringParameters?.mode);
  const refresh = normalizeRefresh(event.queryStringParameters?.refresh || event.queryStringParameters?.force);
  if (!auth?.profile) {
    return json(
      401,
      { error: "A valid authenticated session is required." },
      { "Cache-Control": "no-store" }
    );
  }

  try {
    const cacheKey = `${auth.profile.id}:${auth.profile.role}:${mode}`;
    const data = refresh
      ? writeRuntimeCache(plannerPayloadCache, cacheKey, await getPlannerPayload(supabase, auth, { mode }))
      : await getOrSetRuntimeCache(plannerPayloadCache, cacheKey, PLANNER_CACHE_TTL_MS, async () =>
          getPlannerPayload(supabase, auth, { mode })
        );
    return json(
      200,
      {
        ok: true,
        role: auth.profile.role,
        mode,
        refresh,
        data,
      },
      { "Cache-Control": "no-store" }
    );
  } catch (error) {
    return json(
      Number(error?.statusCode || 500),
      { error: error?.message || "Unable to load planner data right now." },
      { "Cache-Control": "no-store" }
    );
  }
};
