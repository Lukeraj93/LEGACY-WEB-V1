const { json, methodNotAllowed, noContent } = require("./_lib/http");
const { getAuthenticatedProfile, getServiceSupabase } = require("./_lib/supabase");
const {
  getSupportedWearableProviders,
  listRecentWearableMetrics,
  listRecentWearableRewards,
  listWearableConnections,
  requireWearableClientAccess,
} = require("./_lib/wearables");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return noContent();
  }

  if (event.httpMethod !== "GET") {
    return methodNotAllowed("GET, OPTIONS");
  }

  try {
    const supabase = getServiceSupabase();
    const access = await getAuthenticatedProfile(event, supabase);
    if (!access) {
      return json(401, { error: "A valid authenticated session is required." });
    }

    const clientId = await requireWearableClientAccess(
      supabase,
      access.profile,
      event.queryStringParameters?.client_id
    );

    const [connections, metrics, rewards] = await Promise.all([
      listWearableConnections(supabase, clientId),
      listRecentWearableMetrics(supabase, clientId, 30),
      listRecentWearableRewards(supabase, clientId, 20),
    ]);

    return json(200, {
      ok: true,
      clientId,
      supportedProviders: getSupportedWearableProviders(),
      connections,
      recentMetrics: metrics,
      recentRewards: rewards,
    });
  } catch (error) {
    return json(Number(error?.statusCode || 500), {
      error: error?.message || "Unable to load wearable sync status.",
    });
  }
};
