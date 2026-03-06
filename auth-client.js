(function initLegacyAuth() {
  let client = null;

  function getConfig() {
    return window.LEGACY_AUTH_CONFIG || {};
  }

  function isConfigured() {
    const cfg = getConfig();
    return Boolean(cfg.supabaseUrl && cfg.supabaseAnonKey);
  }

  function normalizeRole(value) {
    if (typeof value !== "string") {
      return null;
    }

    const lowered = value.trim().toLowerCase();
    if (lowered === "coach" || lowered === "client") {
      return lowered;
    }

    return null;
  }

  function getClient() {
    if (client) {
      return client;
    }

    if (!window.supabase || !window.supabase.createClient || !isConfigured()) {
      return null;
    }

    const cfg = getConfig();
    client = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
    return client;
  }

  async function getProfileRole(supabaseClient, userId) {
    try {
      const { data, error } = await supabaseClient
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .maybeSingle();

      if (error || !data) {
        return null;
      }

      return normalizeRole(data.role);
    } catch (_) {
      return null;
    }
  }

  async function resolveRole(supabaseClient, user) {
    const metadataRole = normalizeRole(user?.user_metadata?.role)
      || normalizeRole(user?.app_metadata?.role);

    if (metadataRole) {
      return metadataRole;
    }

    if (!supabaseClient || !user?.id) {
      return null;
    }

    return getProfileRole(supabaseClient, user.id);
  }

  function rolePortalPath(role) {
    return role === "coach" ? "./coach-portal.html" : "./client-portal.html";
  }

  async function loginWithRole(payload) {
    const supabaseClient = getClient();
    if (!supabaseClient) {
      return {
        ok: false,
        error: "Auth config missing. Update auth-config.js with your Supabase URL and anon key.",
      };
    }

    const expectedRole = normalizeRole(payload?.expectedRole) || "client";
    const email = payload?.email;
    const password = payload?.password;
    const coachCode = payload?.coachCode || "";

    if (expectedRole === "coach") {
      const cfgCode = (getConfig().coachAccessCode || "").trim();
      if (cfgCode && coachCode.trim() !== cfgCode) {
        return {
          ok: false,
          error: "Invalid coach access code.",
        };
      }
    }

    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data?.user) {
      return {
        ok: false,
        error: error?.message || "Login failed.",
      };
    }

    const actualRole = (await resolveRole(supabaseClient, data.user)) || expectedRole;

    if (actualRole !== expectedRole) {
      await supabaseClient.auth.signOut();
      return {
        ok: false,
        error: `This account is registered as ${actualRole}. Please use ${actualRole} login.`,
      };
    }

    window.localStorage.setItem("legacy-role", actualRole);

    return {
      ok: true,
      role: actualRole,
      user: data.user,
      portalPath: rolePortalPath(actualRole),
    };
  }

  async function requireRole(requiredRole) {
    const supabaseClient = getClient();
    if (!supabaseClient) {
      return {
        ok: false,
        code: "missing-config",
        error: "Auth config missing.",
      };
    }

    const { data, error } = await supabaseClient.auth.getSession();
    if (error || !data?.session?.user) {
      return {
        ok: false,
        code: "no-session",
        error: "No active session.",
      };
    }

    const user = data.session.user;
    const roleFromStorage = normalizeRole(window.localStorage.getItem("legacy-role"));
    const resolvedRole = (await resolveRole(supabaseClient, user)) || roleFromStorage || "client";

    window.localStorage.setItem("legacy-role", resolvedRole);

    const normalizedRequiredRole = normalizeRole(requiredRole);
    if (normalizedRequiredRole && resolvedRole !== normalizedRequiredRole) {
      return {
        ok: false,
        code: "wrong-role",
        role: resolvedRole,
        user,
        redirectPath: rolePortalPath(resolvedRole),
      };
    }

    return {
      ok: true,
      user,
      role: resolvedRole,
    };
  }

  async function signOut() {
    const supabaseClient = getClient();
    window.localStorage.removeItem("legacy-role");

    if (!supabaseClient) {
      return;
    }

    await supabaseClient.auth.signOut();
  }

  window.legacyAuth = {
    isConfigured,
    loginWithRole,
    requireRole,
    signOut,
    rolePortalPath,
  };
})();
