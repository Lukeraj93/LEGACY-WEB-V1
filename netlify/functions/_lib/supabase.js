const { createClient } = require("@supabase/supabase-js");
const { requireEnv } = require("./env");
const { getOrSetRuntimeCache } = require("./runtime-cache");

const SYSTEM_EMAIL = "legacy-system@legacy.local";
const AUTH_PAGE_SIZE = 200;
const AUTH_USERS_CACHE_TTL_MS = 60 * 1000;
const SUPER_ADMIN_EMAIL_CACHE_TTL_MS = 60 * 1000;
const LOCAL_SUPABASE_URL = "http://127.0.0.1:54321";
const LOCAL_SUPABASE_ANON_KEY =
  "sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH";
const PRODUCTION_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_jFgALGmbMm-M_IXWE89-2Q_quLxl0Fe";
const authUsersCache = new Map();
const superAdminEmailCache = new Map();

function toError(error, fallbackMessage) {
  if (error instanceof Error) {
    return error;
  }

  const message = typeof error?.message === "string" && error.message.trim()
    ? error.message.trim()
    : typeof error === "string" && error.trim()
      ? error.trim()
      : fallbackMessage;

  const wrapped = new Error(message || fallbackMessage || "Unexpected Supabase error.");
  wrapped.cause = error;
  return wrapped;
}

function getServiceSupabase() {
  return createClient(requireEnv("SUPABASE_URL"), requireEnv("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function getPublicSupabase() {
  return createClient(requireEnv("SUPABASE_URL"), getPublicSupabaseKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function getPublicSupabaseKey() {
  const supabaseUrl = requireEnv("SUPABASE_URL");
  if (supabaseUrl === LOCAL_SUPABASE_URL) {
    return LOCAL_SUPABASE_ANON_KEY;
  }

  const configuredKey = String(
    process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || ""
  ).trim();
  if (configuredKey) {
    return configuredKey;
  }

  return PRODUCTION_SUPABASE_PUBLISHABLE_KEY;
}

function extractAccessToken(event) {
  const authHeader = event.headers.authorization || event.headers.Authorization || "";

  if (!authHeader.startsWith("Bearer ")) {
    return "";
  }

  const accessToken = authHeader.slice("Bearer ".length).trim();
  return accessToken;
}

function getUserSupabase(event) {
  const accessToken = extractAccessToken(event);
  if (!accessToken) {
    return null;
  }

  return createClient(requireEnv("SUPABASE_URL"), getPublicSupabaseKey(), {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

async function getAuthenticatedUser(event, supabase) {
  const accessToken = extractAccessToken(event);
  if (!accessToken) {
    return null;
  }

  const authUrl = `${requireEnv("SUPABASE_URL").replace(/\/+$/u, "")}/auth/v1/user`;
  const publicKey = getPublicSupabaseKey();

  try {
    const response = await fetch(authUrl, {
      headers: {
        apikey: publicKey,
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const payload = await response.json().catch(() => null);
    if (response.ok && payload?.id) {
      return payload;
    }
  } catch (_) {
    // Fall back to the SDK validation attempts below.
  }

  const validationAttempts = [];
  if (supabase) {
    validationAttempts.push(supabase);
  }

  for (const client of validationAttempts) {
    try {
      const { data, error } = await client.auth.getUser(accessToken);
      if (!error && data?.user) {
        return data.user;
      }
    } catch (_) {
      // Ignore and continue trying the remaining validation clients.
    }
  }

  return null;
}

async function lookupSystemProfileId(supabase) {
  const { data, error } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });

  if (error) {
    throw toError(error, "Unable to list auth users.");
  }

  const user = (data?.users || []).find((candidate) => String(candidate.email || "").toLowerCase() === SYSTEM_EMAIL);
  return user?.id || null;
}

async function getProfileByUserId(supabase, userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, role, display_name, status")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw toError(error, "Unable to load the requested profile.");
  }

  return data || null;
}

async function getAuthenticatedProfile(event, supabase) {
  const user = await getAuthenticatedUser(event, supabase);
  if (!user) {
    return null;
  }

  const profile = await getProfileByUserId(supabase, user.id);
  if (!profile) {
    return null;
  }

  return { user, profile };
}

async function resolvePrimaryCoachForClient(supabase, clientId) {
  if (!clientId) {
    return null;
  }

  const [assignmentResponse, clientProfileResponse] = await Promise.all([
    supabase
      .from("coach_client_assignments")
      .select("coach_id, assigned_at")
      .eq("client_id", clientId)
      .eq("status", "active")
      .order("assigned_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("client_profiles")
      .select("preferred_coach_id")
      .eq("id", clientId)
      .maybeSingle(),
  ]);

  if (assignmentResponse?.error) {
    throw toError(assignmentResponse.error, "Unable to load the active coach-client assignment.");
  }

  if (clientProfileResponse?.error) {
    throw toError(clientProfileResponse.error, "Unable to load the client coach preference.");
  }

  return (
    String(assignmentResponse.data?.coach_id || "").trim()
    || String(clientProfileResponse.data?.preferred_coach_id || "").trim()
    || null
  );
}

async function listManagedClientIdsForCoach(supabase, coachId) {
  if (!coachId) {
    return [];
  }

  const [assignmentsResponse, preferredClientsResponse] = await Promise.all([
    supabase
      .from("coach_client_assignments")
      .select("client_id")
      .eq("coach_id", coachId)
      .eq("status", "active"),
    supabase
      .from("client_profiles")
      .select("id")
      .eq("preferred_coach_id", coachId),
  ]);

  if (assignmentsResponse?.error) {
    throw toError(assignmentsResponse.error, "Unable to load the coach assignment roster.");
  }

  if (preferredClientsResponse?.error) {
    throw toError(preferredClientsResponse.error, "Unable to load the coach preference roster.");
  }

  return Array.from(
    new Set(
      []
        .concat((assignmentsResponse.data || []).map((item) => item.client_id))
        .concat((preferredClientsResponse.data || []).map((item) => item.id))
        .filter(Boolean)
    )
  );
}

async function canManageClientWithProfile(supabase, profile, clientId) {
  if (!profile?.id || !clientId) {
    return false;
  }

  if (profile.role === "super_admin") {
    return true;
  }

  if (profile.role !== "coach") {
    return false;
  }

  const managedClientIds = await listManagedClientIdsForCoach(supabase, profile.id);
  return managedClientIds.includes(clientId);
}

async function ensureSystemProfile(supabase) {
  let profileId = await lookupSystemProfileId(supabase);

  if (!profileId) {
    const created = await supabase.auth.admin.createUser({
      email: SYSTEM_EMAIL,
      password: `LegacySystem!${Date.now()}`,
      email_confirm: true,
      user_metadata: {
        role: "super_admin",
        display_name: "LEGACY System",
      },
      app_metadata: {
        role: "super_admin",
      },
    });

    if (created.error || !created.data?.user?.id) {
      throw created.error || new Error("Unable to create the LEGACY system user.");
    }

    profileId = created.data.user.id;
  }

  const { error } = await supabase.from("profiles").upsert(
    {
      id: profileId,
      role: "super_admin",
      display_name: "LEGACY System",
      status: "active",
    },
    { onConflict: "id" }
  );
  if (error) {
    throw error;
  }

  return profileId;
}

async function listAuthUsers(supabase, options = {}) {
  const perPage = Number(options.perPage || AUTH_PAGE_SIZE);
  const maxPages = Number(options.maxPages || 20);
  const cacheKey = `${perPage}:${maxPages}`;

  return getOrSetRuntimeCache(authUsersCache, cacheKey, AUTH_USERS_CACHE_TTL_MS, async () => {
    const users = [];

    for (let page = 1; page <= maxPages; page += 1) {
      const { data, error } = await supabase.auth.admin.listUsers({
        page,
        perPage,
      });

      if (error) {
        throw toError(error, "Unable to list auth users.");
      }

      const batch = data?.users || [];
      users.push(...batch);

      if (batch.length < perPage) {
        break;
      }
    }

    return users;
  });
}

async function getEmailMapForUserIds(supabase, userIds) {
  const targetIds = Array.from(new Set((userIds || []).filter(Boolean)));
  const emailMap = new Map();

  if (!targetIds.length) {
    return emailMap;
  }

  const targetSet = new Set(targetIds);
  const users = await listAuthUsers(supabase);

  users.forEach((user) => {
    if (targetSet.has(user.id) && user.email) {
      emailMap.set(user.id, String(user.email).trim().toLowerCase());
    }
  });

  return emailMap;
}

async function getUserEmailById(supabase, userId) {
  const emailMap = await getEmailMapForUserIds(supabase, [userId]);
  return emailMap.get(userId) || "";
}

async function getSuperAdminEmailRecipients(supabase) {
  return getOrSetRuntimeCache(superAdminEmailCache, "super-admin-emails", SUPER_ADMIN_EMAIL_CACHE_TTL_MS, async () => {
    const { data: admins, error } = await supabase.from("profiles").select("id").eq("role", "super_admin");
    if (error) {
      throw toError(error, "Unable to load super admin recipients.");
    }

    const emailMap = await getEmailMapForUserIds(
      supabase,
      (admins || []).map((admin) => admin.id)
    );

    return (admins || [])
      .map((admin) => emailMap.get(admin.id) || "")
      .filter(Boolean);
  });
}

async function notifyRecipients(supabase, rows) {
  const normalizedRows = (rows || [])
    .filter((row) => row?.recipient_id && row?.title && row?.body)
    .map((row) => ({
      recipient_id: row.recipient_id,
      category: row.category || "system",
      title: row.title,
      body: row.body,
      action_url: row.action_url || null,
    }));

  if (!normalizedRows.length) {
    return { count: 0 };
  }

  const { error } = await supabase.from("notifications").insert(normalizedRows);
  if (error) {
    throw toError(error, "Unable to create notifications.");
  }

  return { count: normalizedRows.length };
}

async function notifySuperAdmins(supabase, notification) {
  const systemProfileId = await lookupSystemProfileId(supabase).catch(() => null);
  const { data: admins, error: adminError } = await supabase.from("profiles").select("id").eq("role", "super_admin");
  if (adminError) {
    throw toError(adminError, "Unable to load super admin notifications.");
  }

  const recipients = (admins || []).map((admin) => admin.id).filter((id) => id && id !== systemProfileId);
  if (!recipients.length) {
    return { count: 0 };
  }

  const rows = recipients.map((recipientId) => ({
    recipient_id: recipientId,
    category: notification.category || "system",
    title: notification.title,
    body: notification.body,
    action_url: notification.action_url || null,
  }));

  const { error: insertError } = await supabase.from("notifications").insert(rows);
  if (insertError) {
    throw insertError;
  }

  return { count: rows.length };
}

module.exports = {
  canManageClientWithProfile,
  ensureSystemProfile,
  getEmailMapForUserIds,
  getAuthenticatedProfile,
  getAuthenticatedUser,
  listManagedClientIdsForCoach,
  getPublicSupabase,
  getProfileByUserId,
  resolvePrimaryCoachForClient,
  getServiceSupabase,
  getSuperAdminEmailRecipients,
  getUserSupabase,
  getUserEmailById,
  listAuthUsers,
  notifyRecipients,
  notifySuperAdmins,
};
