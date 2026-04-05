const { json, methodNotAllowed, noContent } = require("./_lib/http");
const { getDashboardPayload } = require("./_lib/dashboard-data");
const { getAuthenticatedProfile, getServiceSupabase, getUserSupabase } = require("./_lib/supabase");

const DASHBOARD_CACHE_TTL_MS = 45 * 1000;
const dashboardPayloadCache = new Map();

function normalizeScope(value) {
  const scope = String(value || "")
    .trim()
    .toLowerCase();
  return scope === "client" || scope === "coach" || scope === "admin" ? scope : "";
}

function normalizePage(value, fallback) {
  return String(value || fallback || "")
    .trim()
    .toLowerCase();
}

function normalizeVariant(value) {
  const variant = String(value || "")
    .trim()
    .toLowerCase();
  return variant === "primary" || variant === "secondary" ? variant : "full";
}

function buildDashboardCacheKey(auth, scope, page, variant) {
  return [
    auth?.user?.id || "",
    auth?.profile?.role || "",
    auth?.profile?.status || "",
    scope,
    page,
    variant || "full",
  ].join(":");
}

function readDashboardCache(key) {
  const entry = dashboardPayloadCache.get(key);
  if (!entry) {
    return null;
  }

  if (Date.now() - entry.createdAt > DASHBOARD_CACHE_TTL_MS) {
    dashboardPayloadCache.delete(key);
    return null;
  }

  return entry.data;
}

function writeDashboardCache(key, data) {
  dashboardPayloadCache.set(key, {
    data,
    createdAt: Date.now(),
  });
}

function buildResponseHeaders(durationMs, cacheState) {
  return {
    "Cache-Control": "no-store",
    "Server-Timing": `app;dur=${Math.max(1, Math.round(durationMs || 0))}`,
    "X-Legacy-Dashboard-Cache": cacheState,
  };
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return noContent({
      "Cache-Control": "no-store",
    });
  }

  if (event.httpMethod !== "GET") {
    return methodNotAllowed("GET, OPTIONS");
  }

  const scope = normalizeScope(event.queryStringParameters?.scope);
  const page = normalizePage(event.queryStringParameters?.page, "home");
  const variant = normalizeVariant(event.queryStringParameters?.variant);
  if (!scope) {
    return json(
      400,
      {
        error: "Dashboard scope must be client, coach, or admin.",
      },
      {
        "Cache-Control": "no-store",
      }
    );
  }

  const requestSupabase = scope === "client" ? getUserSupabase(event) : getServiceSupabase();
  if (!requestSupabase) {
    return json(
      401,
      {
        error: "A valid authenticated session is required.",
      },
      {
        "Cache-Control": "no-store",
      }
    );
  }
  let auth = null;
  try {
    auth = await getAuthenticatedProfile(event, requestSupabase);
  } catch (error) {
    return json(
      500,
      {
        error: error?.message || "Unable to validate the authenticated dashboard request.",
      },
      {
        "Cache-Control": "no-store",
      }
    );
  }
  if (!auth?.profile) {
    return json(
      401,
      {
        error: "A valid authenticated session is required.",
      },
      {
        "Cache-Control": "no-store",
      }
    );
  }

  try {
    const startedAt = Date.now();
    const cacheKey = buildDashboardCacheKey(auth, scope, page, variant);
    const allowCache = String(event.queryStringParameters?.fresh || "").trim() !== "1";
    if (allowCache) {
      const cachedPayload = readDashboardCache(cacheKey);
      if (cachedPayload) {
        return json(
          200,
          {
            ok: true,
            scope,
            page,
            variant,
            data: cachedPayload,
          },
          buildResponseHeaders(Date.now() - startedAt, "hit")
        );
      }
    }

    const data = await getDashboardPayload(requestSupabase, auth, scope, page, { variant });
    writeDashboardCache(cacheKey, data);
    return json(
      200,
      {
        ok: true,
        scope,
        page,
        variant,
        data,
      },
      buildResponseHeaders(Date.now() - startedAt, "miss")
    );
  } catch (error) {
    return json(
      Number(error?.statusCode || 500),
      {
        error: error?.message || "Unable to load the dashboard payload right now.",
      },
      {
        "Cache-Control": "no-store",
      }
    );
  }
};
