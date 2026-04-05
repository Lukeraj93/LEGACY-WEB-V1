function normalizeText(value) {
  return String(value || "").trim();
}

const API_BASE_URL = normalizeText(process.env.LOGMEAL_API_BASE || "https://api.logmeal.es").replace(/\/+$/u, "");
const PROVIDER_KEY = "logmeal";
const providerTokenCache = new Map();

function getLogmealUserToken() {
  return normalizeText(process.env.LOGMEAL_USER_API_KEY || "");
}

function getLogmealCompanyToken() {
  return normalizeText(process.env.LOGMEAL_API_KEY || "");
}

function getLogmealFallbackToken() {
  return getLogmealUserToken() || getLogmealCompanyToken();
}

function logmealConfigured() {
  return Boolean(getLogmealFallbackToken());
}

function buildApiUserUsername(profile) {
  const profileId = normalizeText(profile?.id).replace(/[^a-z0-9]/giu, "").slice(0, 24);
  return profileId ? `legacy-${profileId}`.toLowerCase() : "";
}

async function createApiUserWithCompanyToken(profile) {
  const companyToken = getLogmealCompanyToken();
  const baseUsername = buildApiUserUsername(profile);
  const attemptedUsernames = [baseUsername, `${baseUsername}-${Date.now().toString(36)}`].filter(Boolean);
  if (!companyToken || !baseUsername) {
    return null;
  }

  let lastError = null;
  for (const username of attemptedUsernames) {
    const response = await fetch(`${API_BASE_URL}/v2/users/signUp`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${companyToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        language: "eng",
        country: "MY",
      }),
    });

    const text = await response.text().catch(() => "");
    let payload = {};
    try {
      payload = text ? JSON.parse(text) : {};
    } catch (_) {
      payload = { raw: text };
    }

    if (response.ok && normalizeText(payload?.token)) {
      return {
        externalAccountId: normalizeText(payload?.id),
        accessToken: normalizeText(payload?.token),
        metadata: {
          ...payload,
          username,
        },
      };
    }

    lastError = `LogMeal APIUser provisioning failed (${response.status}): ${normalizeText(payload?.message || payload?.raw || "Unknown error")}`;
    if (String(payload?.code || "") !== "808") {
      break;
    }
  }

  throw new Error(lastError || "LogMeal APIUser provisioning failed.");
}

async function ensureLogmealToken(options = {}) {
  const { supabase, profile } = options;
  if (!supabase || !profile?.id) {
    return getLogmealFallbackToken() || null;
  }

  const cacheKey = `${PROVIDER_KEY}:${profile.id}`;
  const cached = providerTokenCache.get(cacheKey);
  if (cached?.accessToken) {
    return cached.accessToken;
  }

  const existingResponse = await supabase
    .from("nutrition_provider_accounts")
    .select("*")
    .eq("profile_id", profile.id)
    .eq("provider", PROVIDER_KEY)
    .eq("status", "active")
    .maybeSingle();

  if (!existingResponse.error && existingResponse.data?.access_token) {
    providerTokenCache.set(cacheKey, {
      accessToken: existingResponse.data.access_token,
    });
    return existingResponse.data.access_token;
  }

  const provisioned = await createApiUserWithCompanyToken(profile).catch(() => null);
  if (provisioned?.accessToken) {
    const upsertResponse = await supabase
      .from("nutrition_provider_accounts")
      .upsert(
        {
          profile_id: profile.id,
          provider: PROVIDER_KEY,
          external_account_id: provisioned.externalAccountId || null,
          access_token: provisioned.accessToken,
          status: "active",
          metadata: {
            username: buildApiUserUsername(profile),
            source: "logmeal_company_provision",
          },
          updated_at: new Date().toISOString(),
        },
        { onConflict: "profile_id,provider" }
      )
      .select("access_token")
      .maybeSingle();

    if (!upsertResponse.error && upsertResponse.data?.access_token) {
      providerTokenCache.set(cacheKey, {
        accessToken: upsertResponse.data.access_token,
      });
      return upsertResponse.data.access_token;
    }

    providerTokenCache.set(cacheKey, {
      accessToken: provisioned.accessToken,
    });
    return provisioned.accessToken;
  }

  const fallbackToken = getLogmealUserToken();
  if (fallbackToken) {
    providerTokenCache.set(cacheKey, {
      accessToken: fallbackToken,
    });
    return fallbackToken;
  }

  return null;
}

function collectCandidateLabels(value, bag = new Set()) {
  if (!value || bag.size >= 12) {
    return bag;
  }

  if (Array.isArray(value)) {
    value.forEach((entry) => collectCandidateLabels(entry, bag));
    return bag;
  }

  if (typeof value === "object") {
    Object.entries(value).forEach(([key, entry]) => {
      if (/(^label$|food|dish|name|class)/iu.test(key)) {
        const text = typeof entry === "string" || typeof entry === "number" ? normalizeText(entry) : "";
        if (
          text
          && text.length <= 80
          && text !== "[object Object]"
          && !/^\d+$/u.test(text)
          && !/^v\d+(?:\.\d+)*$/iu.test(text)
        ) {
          bag.add(text);
        }
      }
      collectCandidateLabels(entry, bag);
    });
  }

  return bag;
}

async function analyzeMealPhotoWithLogMeal(options) {
  if (!logmealConfigured() || !options?.imageBuffer) {
    return null;
  }

  const accessToken = await ensureLogmealToken(options);
  if (!accessToken) {
    return null;
  }

  const endpoint = `${API_BASE_URL}/v2/image/segmentation/complete`;
  const formData = new FormData();
  formData.append(
    "image",
    new Blob([options.imageBuffer], { type: options.contentType || "image/jpeg" }),
    options.fileName || "meal-photo.jpg"
  );

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`LogMeal meal-photo request failed (${response.status}): ${text || "Unknown error"}`);
  }

  const payload = await response.json();
  const labels = [...collectCandidateLabels(payload)].slice(0, 8);
  return {
    provider: "logmeal",
    labels,
    raw: payload,
  };
}

module.exports = {
  analyzeMealPhotoWithLogMeal,
  ensureLogmealToken,
  logmealConfigured,
};
