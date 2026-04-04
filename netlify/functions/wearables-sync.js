const { json, methodNotAllowed, noContent } = require("./_lib/http");
const { getAuthenticatedProfile, getServiceSupabase } = require("./_lib/supabase");
const { createHttpError, requireWearableClientAccess, syncWearableMetrics } = require("./_lib/wearables");

function parseBody(event) {
  try {
    return JSON.parse(event.body || "{}");
  } catch (_) {
    return null;
  }
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return noContent();
  }

  if (event.httpMethod !== "POST") {
    return methodNotAllowed("POST, OPTIONS");
  }

  const body = parseBody(event);
  if (!body) {
    return json(400, { error: "Request body must be valid JSON." });
  }

  try {
    const supabase = getServiceSupabase();
    const access = await getAuthenticatedProfile(event, supabase);
    if (!access) {
      return json(401, { error: "A valid authenticated session is required." });
    }

    const clientId = await requireWearableClientAccess(supabase, access.profile, body.client_id || body.clientId);
    const provider = String(body.provider || "").trim();
    if (!provider) {
      throw createHttpError(400, "provider is required.");
    }

    const metrics = Array.isArray(body.metrics) ? body.metrics : [];
    const result = await syncWearableMetrics(supabase, {
      clientId,
      provider,
      metrics,
      connectionStatus: body.connection_status ?? body.connectionStatus ?? "connected",
      rewardEnabled: body.reward_enabled ?? body.rewardEnabled,
      externalUserId: body.external_user_id ?? body.externalUserId,
      scopes: body.scopes,
      connectionMeta: body.connection_meta ?? body.connectionMeta,
      syncCursor: body.sync_cursor ?? body.syncCursor,
      runMeta: body.run_meta ?? body.runMeta,
    });

    return json(200, {
      ok: true,
      clientId,
      provider,
      connection: result.connection,
      syncRun: result.syncRun,
      metricsReceived: result.metricsReceived,
      metricsUpserted: result.metricsUpserted,
      rewardsCreated: result.rewardsCreated,
      rewards: result.rewards,
    });
  } catch (error) {
    return json(Number(error?.statusCode || 500), {
      error: error?.message || "Unable to sync wearable metrics.",
    });
  }
};
