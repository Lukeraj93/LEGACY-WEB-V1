const header = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelectorAll(".site-nav a");
const navDropdowns = document.querySelectorAll(".nav-dropdown");

function closeNavDropdowns() {
  navDropdowns.forEach((dropdown) => {
    dropdown.classList.remove("open");
    const toggle = dropdown.querySelector(".nav-dropdown-toggle");
    if (toggle) {
      toggle.setAttribute("aria-expanded", "false");
    }
  });
}

if (menuToggle && header) {
  menuToggle.addEventListener("click", () => {
    const isOpen = header.classList.toggle("nav-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    if (!isOpen) {
      closeNavDropdowns();
    }
  });
}

navDropdowns.forEach((dropdown) => {
  const toggle = dropdown.querySelector(".nav-dropdown-toggle");
  if (!toggle) return;

  toggle.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    const isOpen = dropdown.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));

    navDropdowns.forEach((other) => {
      if (other === dropdown) return;
      other.classList.remove("open");
      const otherToggle = other.querySelector(".nav-dropdown-toggle");
      if (otherToggle) {
        otherToggle.setAttribute("aria-expanded", "false");
      }
    });
  });
});

document.addEventListener("click", (event) => {
  navDropdowns.forEach((dropdown) => {
    if (dropdown.contains(event.target)) return;
    dropdown.classList.remove("open");
    const toggle = dropdown.querySelector(".nav-dropdown-toggle");
    if (toggle) {
      toggle.setAttribute("aria-expanded", "false");
    }
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeNavDropdowns();
  }
});

navLinks.forEach((link) => {
  const currentPath = window.location.pathname.split("/").pop() || "index.html";
  const linkPath = link.getAttribute("href").split("/").pop();
  if (currentPath === linkPath) {
    link.classList.add("active");
  }

  link.addEventListener("click", () => {
    if (header) {
      header.classList.remove("nav-open");
    }
    if (menuToggle) {
      menuToggle.setAttribute("aria-expanded", "false");
    }
    closeNavDropdowns();
  });
});

const revealNodes = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window && revealNodes.length) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  revealNodes.forEach((node) => revealObserver.observe(node));
} else {
  revealNodes.forEach((node) => node.classList.add("in-view"));
}

const filterGroups = document.querySelectorAll("[data-filter-group]");
filterGroups.forEach((group) => {
  const buttons = group.querySelectorAll("[data-filter]");
  const target = group.getAttribute("data-filter-group");
  const cards = document.querySelectorAll(`[data-filter-target='${target}'] [data-category]`);

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const filterValue = button.getAttribute("data-filter");

      buttons.forEach((node) => node.classList.remove("active"));
      button.classList.add("active");

      cards.forEach((card) => {
        const categories = card.getAttribute("data-category") || "";
        const shouldShow = filterValue === "all" || categories.split(" ").includes(filterValue);
        card.classList.toggle("is-hidden", !shouldShow);
      });
    });
  });
});

const whatsappForm = document.getElementById("whatsapp-form");
if (whatsappForm) {
  whatsappForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(whatsappForm);
    const name = String(formData.get("name") || "").trim();
    const service = String(formData.get("service") || "").trim();
    const goal = String(formData.get("goal") || "").trim();
    const contact = String(formData.get("contact") || "").trim();
    const details = String(formData.get("details") || "").trim();

    const lines = [
      "Hi LEGACY+ Coaching, I want to start coaching.",
      `Name: ${name || "Not provided"}`,
      `Service: ${service || "Not provided"}`,
      `Goal: ${goal || "Not provided"}`,
      `Contact: ${contact || "Not provided"}`,
      `Details: ${details || "Not provided"}`,
    ];

    const message = encodeURIComponent(lines.join("\n"));
    const phone = whatsappForm.dataset.whatsapp || "60123456789";
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank", "noopener");
  });
}

const yearNodes = document.querySelectorAll("[data-year]");
yearNodes.forEach((node) => {
  node.textContent = String(new Date().getFullYear());
});

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function parseEmailList(rawList) {
  return String(rawList || "")
    .split(",")
    .map((email) => normalizeEmail(email))
    .filter(Boolean);
}

const adminGateForm = document.getElementById("admin-gate-form");
if (adminGateForm) {
  const feedbackNode = document.getElementById("admin-gate-feedback");
  const emailInput = adminGateForm.querySelector("input[name='adminEmail']");
  const allowedEmails = parseEmailList(adminGateForm.dataset.adminEmails || "admin@legacycoaching.com.my");

  adminGateForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const submittedEmail = normalizeEmail(emailInput ? emailInput.value : "");

    if (!submittedEmail) {
      if (feedbackNode) {
        feedbackNode.textContent = "Enter an admin email to continue.";
        feedbackNode.classList.remove("success");
        feedbackNode.classList.add("error");
      }
      return;
    }

    if (!allowedEmails.includes(submittedEmail)) {
      if (feedbackNode) {
        feedbackNode.textContent = "Access denied. This email is not listed as an admin account.";
        feedbackNode.classList.remove("success");
        feedbackNode.classList.add("error");
      }
      return;
    }

    window.sessionStorage.setItem("legacy-admin-email", submittedEmail);
    window.location.href = `./admin-dashboard.html?admin=${encodeURIComponent(submittedEmail)}`;
  });
}

const adminShell = document.getElementById("admin-shell");
if (adminShell) {
  const bodyAllowedEmails = parseEmailList(document.body.dataset.adminEmails || "admin@legacycoaching.com.my");
  const adminLock = document.getElementById("admin-lock");
  const adminEmailDisplay = document.getElementById("admin-email-display");
  const adminSignOut = document.getElementById("admin-sign-out");
  const queryEmail = normalizeEmail(new URLSearchParams(window.location.search).get("admin"));
  const storedEmail = normalizeEmail(window.sessionStorage.getItem("legacy-admin-email"));
  const activeEmail = queryEmail || storedEmail;
  const isAuthorized = bodyAllowedEmails.includes(activeEmail);

  if (isAuthorized) {
    adminShell.classList.remove("is-hidden");
    if (adminLock) {
      adminLock.classList.add("is-hidden");
    }
    if (adminEmailDisplay) {
      adminEmailDisplay.textContent = activeEmail;
    }
    window.sessionStorage.setItem("legacy-admin-email", activeEmail);
  } else {
    adminShell.classList.add("is-hidden");
    if (adminLock) {
      adminLock.classList.remove("is-hidden");
    }
  }

  if (adminSignOut) {
    adminSignOut.addEventListener("click", () => {
      window.sessionStorage.removeItem("legacy-admin-email");
      window.location.href = "./coach-dashboard.html";
    });
  }
}

const clientBookingForm = document.getElementById("client-booking-form");
if (clientBookingForm) {
  const bookingFeedback = document.getElementById("client-booking-feedback");
  clientBookingForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(clientBookingForm);
    const service = String(formData.get("service") || "").trim();
    const date = String(formData.get("sessionDate") || "").trim();
    const time = String(formData.get("sessionTime") || "").trim();

    if (!service || !date || !time) {
      if (bookingFeedback) {
        bookingFeedback.textContent = "Please complete service, date, and time.";
        bookingFeedback.classList.remove("success");
        bookingFeedback.classList.add("error");
      }
      return;
    }

    if (bookingFeedback) {
      bookingFeedback.textContent = `Session request sent: ${service} on ${date} at ${time}.`;
      bookingFeedback.classList.remove("error");
      bookingFeedback.classList.add("success");
    }

    clientBookingForm.reset();
  });
}

const coachNoteForm = document.getElementById("coach-note-form");
if (coachNoteForm) {
  const noteLog = document.getElementById("coach-note-log");
  const noteFeedback = document.getElementById("coach-note-feedback");

  coachNoteForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(coachNoteForm);
    const client = String(formData.get("client") || "").trim();
    const note = String(formData.get("note") || "").trim();

    if (!client || !note || !noteLog) {
      if (noteFeedback) {
        noteFeedback.textContent = "Select a client and enter a note.";
        noteFeedback.classList.remove("success");
        noteFeedback.classList.add("error");
      }
      return;
    }

    const noteItem = document.createElement("article");
    noteItem.className = "dashboard-note";
    const timeStamp = new Date().toLocaleString();
    noteItem.innerHTML = `<p><strong>${client}</strong>: ${note}</p><small>Saved ${timeStamp}</small>`;
    noteLog.prepend(noteItem);

    if (noteFeedback) {
      noteFeedback.textContent = `Note saved for ${client}.`;
      noteFeedback.classList.remove("error");
      noteFeedback.classList.add("success");
    }

    coachNoteForm.reset();
  });
}

const clientLoginForm = document.getElementById("client-login-form");
if (clientLoginForm) {
  const feedback = document.getElementById("client-login-feedback");
  clientLoginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(clientLoginForm);
    const email = String(formData.get("clientEmail") || "").trim();
    const password = String(formData.get("clientPassword") || "").trim();

    if (!email || !password) {
      if (feedback) {
        feedback.textContent = "Enter both email and password.";
        feedback.classList.remove("success");
        feedback.classList.add("error");
      }
      return;
    }

    if (feedback) {
      feedback.textContent = "Signing in. Redirecting to your dashboard...";
      feedback.classList.remove("error");
      feedback.classList.add("success");
    }

    const target = clientLoginForm.dataset.clientPath || "../client-dashboard.html";
    window.location.href = target;
  });
}

const coachLoginForm = document.getElementById("coach-login-form");
if (coachLoginForm) {
  const feedback = document.getElementById("coach-login-feedback");
  coachLoginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(coachLoginForm);
    const email = normalizeEmail(formData.get("coachEmail"));
    const password = String(formData.get("coachPassword") || "").trim();

    if (!email || !password) {
      if (feedback) {
        feedback.textContent = "Enter both email and password.";
        feedback.classList.remove("success");
        feedback.classList.add("error");
      }
      return;
    }

    const adminEmail = normalizeEmail(coachLoginForm.dataset.adminEmail || "admin@legacycoaching.com.my");
    const adminPath = coachLoginForm.dataset.adminPath || "../admin-dashboard.html";
    const coachPath = coachLoginForm.dataset.coachPath || "../coach-dashboard.html";

    if (email === adminEmail) {
      if (feedback) {
        feedback.textContent = "Admin email detected. Opening admin dashboard...";
        feedback.classList.remove("error");
        feedback.classList.add("success");
      }
      window.location.href = `${adminPath}?admin=${encodeURIComponent(email)}`;
      return;
    }

    if (feedback) {
      feedback.textContent = "Coach login successful. Opening coach dashboard...";
      feedback.classList.remove("error");
      feedback.classList.add("success");
    }
    window.location.href = coachPath;
  });
}
