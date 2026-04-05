const { getBaseUrl } = require("./_lib/env");
const { getServiceSupabase } = require("./_lib/supabase");
const {
  connectWhoopClient,
  consumeOAuthState,
  exchangeCodeForTokens,
  isWhoopConfigured,
  loadWhoopConnection,
  syncLatestWhoopData,
} = require("./_lib/whoop");

function buildRedirect(pathname, params = {}) {
  const baseUrl = getBaseUrl();
  const fallbackBase = baseUrl || "http://localhost";
  const url = new URL(pathname, `${fallbackBase}/`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  if (!baseUrl) {
    return url.pathname + url.search;
  }

  return url.toString();
}

exports.handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      headers: { Allow: "GET" },
      body: "Method not allowed.",
    };
  }

  if (!isWhoopConfigured()) {
    return {
      statusCode: 302,
      headers: {
        Location: buildRedirect("/client-settings.html", {
          wearable: "whoop-error",
          message: "WHOOP credentials are not configured yet.",
        }),
      },
      body: "",
    };
  }

  const params = new URLSearchParams(event.queryStringParameters || {});
  const state = String(params.get("state") || "").trim();
  const code = String(params.get("code") || "").trim();
  const error = String(params.get("error") || "").trim();

  if (!state || error || !code) {
    return {
      statusCode: 302,
      headers: {
        Location: buildRedirect("/client-settings.html", {
          wearable: "whoop-error",
          message: error || "WHOOP authentication was cancelled.",
        }),
      },
      body: "",
    };
  }

  try {
    const supabase = getServiceSupabase();
    const oauthState = await consumeOAuthState(supabase, state);
    const existingConnection = await loadWhoopConnection(supabase, oauthState.clientId).catch(() => null);
    const tokenPayload = await exchangeCodeForTokens(code);
    const connected = await connectWhoopClient(supabase, oauthState.clientId, tokenPayload, existingConnection);
    const syncResult = await syncLatestWhoopData(supabase, oauthState.clientId, connected.connection, {
      limit: 7,
    });

    return {
      statusCode: 302,
      headers: {
        Location: buildRedirect(oauthState.returnPath || "/client-settings.html", {
          wearable: "whoop-connected",
          synced: syncResult.metricsUpserted,
        }),
      },
      body: "",
    };
  } catch (caughtError) {
    return {
      statusCode: 302,
      headers: {
        Location: buildRedirect("/client-settings.html", {
          wearable: "whoop-error",
          message: caughtError?.message || "Unable to finish WHOOP authentication.",
        }),
      },
      body: "",
    };
  }
};
