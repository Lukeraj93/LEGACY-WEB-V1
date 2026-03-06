const signOutButton = document.getElementById("sign-out");
const errorPanel = document.getElementById("portal-error");
const portalShell = document.getElementById("portal-shell");
const userEmailNode = document.getElementById("user-email");
const userRoleNode = document.getElementById("user-role");
const portalRole = document.body.dataset.portalRole || "client";

function showError(message) {
  if (errorPanel) {
    errorPanel.classList.remove("hidden");
    errorPanel.textContent = message;
  }
}

function hideShell() {
  if (portalShell) {
    portalShell.classList.add("hidden");
  }
}

function normalizeRole(role) {
  return role === "coach" ? "Coach" : "Client";
}

async function initPortal() {
  if (!window.legacyAuth) {
    hideShell();
    showError("Auth client was not loaded. Ensure auth-client.js is included.");
    return;
  }

  const access = await window.legacyAuth.requireRole(portalRole);

  if (!access.ok) {
    hideShell();

    if (access.code === "missing-config") {
      showError("Auth config missing. Update auth-config.js before using portal pages.");
      return;
    }

    if (access.code === "wrong-role" && access.redirectPath) {
      showError("Redirecting to your portal...");
      window.setTimeout(() => {
        window.location.href = access.redirectPath;
      }, 700);
      return;
    }

    showError("No active session found. Redirecting to login...");
    window.setTimeout(() => {
      window.location.href = "./index.html";
    }, 700);
    return;
  }

  if (userEmailNode) {
    userEmailNode.textContent = access.user.email || "Authenticated account";
  }

  if (userRoleNode) {
    userRoleNode.textContent = normalizeRole(access.role);
  }
}

if (signOutButton) {
  signOutButton.addEventListener("click", async () => {
    if (window.legacyAuth) {
      await window.legacyAuth.signOut();
    }
    window.location.href = "./index.html";
  });
}

initPortal();
