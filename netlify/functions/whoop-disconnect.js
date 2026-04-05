const { json, methodNotAllowed, noContent } = require("./_lib/http");
const { getAuthenticatedProfile, getServiceSupabase } = require("./_lib/supabase");
const { requireWearableClientAccess, upsertWearableConnection } = require("./_lib/wearables");
const { deleteWhoopConnection, loadWhoopConnection, revokeWhoopAccess } = require("./_lib/whoop");

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
    const connection = await loadWhoopConnection(supabase, clientId).catch(() => null);

    if (connection?.tokens?.accessToken) {
      await revokeWhoopAccess(connection).catch(() => null);
    }

    await deleteWhoopConnection(supabase, clientId);
    await upsertWearableConnection(supabase, {
      clientId,
      provider: "whoop",
      status: "disconnected",
      rewardEnabled: false,
      externalUserId: "",
      scopes: [],
      syncCursor: null,
      metadata: {
        source: "whoop",
      },
    });

    return json(200, { ok: true });
  } catch (error) {
    return json(Number(error?.statusCode || 500), {
      error: error?.message || "Unable to disconnect WHOOP.",
    });
  }
};
