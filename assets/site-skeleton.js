(function () {
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  const burgerBtn = document.getElementById("burgerBtn");
  const mobileMenu = document.getElementById("mobileMenu");
  if (burgerBtn && mobileMenu) {
    burgerBtn.addEventListener("click", () => {
      const isOpen = mobileMenu.classList.toggle("open");
      burgerBtn.setAttribute("aria-expanded", String(isOpen));
    });
  }

  const coachingToggle = document.getElementById("mobileCoachingToggle");
  const coachingSub = document.getElementById("mobileCoachingSub");
  if (coachingToggle && coachingSub) {
    coachingToggle.addEventListener("click", () => {
      const isOpen = coachingSub.classList.toggle("open");
      coachingToggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  const coachingBtn = document.getElementById("coachingBtn");
  const dropdown = coachingBtn ? coachingBtn.closest(".dropdown") : null;
  if (coachingBtn && dropdown) {
    dropdown.addEventListener("mouseenter", () => coachingBtn.setAttribute("aria-expanded", "true"));
    dropdown.addEventListener("mouseleave", () => coachingBtn.setAttribute("aria-expanded", "false"));
    coachingBtn.addEventListener("focus", () => coachingBtn.setAttribute("aria-expanded", "true"));
    coachingBtn.addEventListener("blur", () => coachingBtn.setAttribute("aria-expanded", "false"));
    coachingBtn.addEventListener("click", () => {
      const panel = dropdown.querySelector(".panel");
      if (!panel) return;
      const open = panel.style.display === "block";
      panel.style.display = open ? "none" : "block";
      coachingBtn.setAttribute("aria-expanded", String(!open));
    });
  }

  const coachForm = document.getElementById("coachLoginForm");
  if (coachForm) {
    coachForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = String(document.getElementById("coachEmail")?.value || "").trim().toLowerCase();
      const adminEmail = "admin@legacycoaching.com.my";
      if (!email) return;
      if (email === adminEmail) {
        window.location.href = "../admin-dashboard.html";
      } else {
        window.location.href = "../coach-dashboard.html";
      }
    });
  }
})();
