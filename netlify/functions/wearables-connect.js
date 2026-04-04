const { json, methodNotAllowed, noContent } = require("./_lib/http");
const { getAuthenticatedProfile, getServiceSupabase } = require("./_lib/supabase");
const {
  createHttpError,
  getSupportedWearableProviders,
  providerLabel,
  requireWearableClientAccess,
  syncWearableMetrics,
  upsertWearableConnection,
} = require("./_lib/wearables");

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

    const result = await upsertWearableConnection(supabase, {
      clientId,
      provider,
      status: body.status || "connected",
      rewardEnabled: body.reward_enabled ?? body.rewardEnabled,
      externalUserId: body.external_user_id ?? body.externalUserId,
      scopes: body.scopes,
      syncCursor: body.sync_cursor ?? body.syncCursor,
      metadata: body.metadata,
      lastSyncAt: body.last_sync_at ?? body.lastSyncAt,
      lastSuccessfulSyncAt: body.last_successful_sync_at ?? body.lastSuccessfulSyncAt,
    });

    const syncBootstrap = await syncWearableMetrics(supabase, {
      clientId,
      provider,
      connectionStatus: result.connection.status,
      rewardEnabled: result.connection.reward_enabled,
      externalUserId: result.connection.external_user_id,
      scopes: result.connection.scopes,
      connectionMeta: result.connection.metadata,
      syncCursor: result.connection.sync_cursor,
      metrics: [],
      runMeta: {
        source: "wearables-connect",
      },
    });

    return json(200, {
      ok: true,
      clientId,
      provider: syncBootstrap.connection.provider,
      providerLabel: providerLabel(syncBootstrap.connection.provider),
      supportedProviders: getSupportedWearableProviders(),
      connection: syncBootstrap.connection,
      rewardBootstrap: syncBootstrap.rewards,
      message: `${providerLabel(syncBootstrap.connection.provider)} connection is ready for wearable sync ingestion.`,
    });
  } catch (error) {
    return json(Number(error?.statusCode || 500), {
      error: error?.message || "Unable to connect wearable provider.",
    });
  }
};
