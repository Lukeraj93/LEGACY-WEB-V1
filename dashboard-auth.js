(function initDashboardAuth() {
  const requiredRole = document.body?.dataset?.requiredRole || "";

  if (!requiredRole || !window.legacyAuth || !window.legacyAuth.isConfigured || !window.legacyAuth.isConfigured()) {
    return;
  }

  function redirectTo(path) {
    window.location.href = path || "/account.html";
  }

  function wait(ms) {
    return new Promise((resolve) => {
      window.setTimeout(resolve, ms);
    });
  }

  async function resolveAccess() {
    let access = await window.legacyAuth.requireRole(requiredRole);
    if (access?.ok || access?.code === "wrong-role") {
      return access;
    }

    await wait(180);
    access = await window.legacyAuth.requireRole(requiredRole);
    return access;
  }

  async function run() {
    const access = await resolveAccess();

    if (!access.ok) {
      if (access.code === "wrong-role") {
        redirectTo(access.redirectPath || window.legacyAuth.rolePortalPath(access.role));
        return;
      }
      redirectTo("/account.html");
      return;
    }
  }

  run().catch(() => {
    redirectTo("/account.html");
  });
})();
