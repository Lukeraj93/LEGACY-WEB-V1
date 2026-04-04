const { json, methodNotAllowed, noContent } = require("./_lib/http");
const { getAuthenticatedProfile, getServiceSupabase } = require("./_lib/supabase");
const { requireWearableClientAccess } = require("./_lib/wearables");
const { isWhoopConfigured, loadWhoopConnection } = require("./_lib/whoop");

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

    const clientId = await requireWearableClientAccess(supabase, access.profile, event.queryStringParameters?.client_id);
    const connection = await loadWhoopConnection(supabase, clientId);

    return json(200, {
      ok: true,
      configured: isWhoopConfigured(),
      connected: Boolean(connection?.tokens?.accessToken),
      clientId,
      profile: connection?.profile || null,
      connectedAt: connection?.connectedAt || null,
      lastSyncedAt: connection?.refreshedAt || null,
      scopes: connection?.scopes || [],
    });
  } catch (error) {
    return json(Number(error?.statusCode || 500), {
      error: error?.message || "Unable to load WHOOP status.",
    });
  }
};
