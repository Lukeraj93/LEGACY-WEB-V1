const { json, methodNotAllowed, noContent } = require("./_lib/http");
const { getAuthenticatedProfile, getServiceSupabase } = require("./_lib/supabase");
const { createHttpError, requireWearableClientAccess } = require("./_lib/wearables");
const { loadWhoopConnection, saveWhoopConnection, syncLatestWhoopData } = require("./_lib/whoop");

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

  const body = parseBody(event) || {};

  try {
    const supabase = getServiceSupabase();
    const access = await getAuthenticatedProfile(event, supabase);
    if (!access) {
      return json(401, { error: "A valid authenticated session is required." });
    }

    const clientId = await requireWearableClientAccess(supabase, access.profile, body.client_id || body.clientId);
    const connection = await loadWhoopConnection(supabase, clientId);
    if (!connection?.tokens?.accessToken) {
      throw createHttpError(400, "WHOOP is not connected for this account yet.");
    }

    const result = await syncLatestWhoopData(supabase, clientId, connection, {
      limit: Number(body.limit || 7),
    });

    await saveWhoopConnection(supabase, clientId, {
      ...(result.whoopConnection || connection),
      refreshedAt: new Date().toISOString(),
    }, access.profile.id);

    return json(200, {
      ok: true,
      clientId,
      provider: "whoop",
      connection: result.connection,
      syncRun: result.syncRun,
      metricsReceived: result.metricsReceived,
      metricsUpserted: result.metricsUpserted,
      rewardsCreated: result.rewardsCreated,
      rewards: result.rewards,
    });
  } catch (error) {
    return json(Number(error?.statusCode || 500), {
      error: error?.message || "Unable to sync WHOOP data.",
    });
  }
};
