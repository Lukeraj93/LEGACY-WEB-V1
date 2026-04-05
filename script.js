const scriptSourceNode =
  document.currentScript ||
  Array.from(document.scripts).find((script) => script.src && /(?:^|\/)script\.js(?:\?|$)/u.test(script.src));
const siteRootUrl = scriptSourceNode?.src ? new URL(".", scriptSourceNode.src) : new URL(window.location.href);
const liveAppRootUrl = "https://app.legacycoaching.com.my/";
const livePublicSiteRootUrl = "https://www.legacycoaching.com.my/";
const localPreviewHosts = new Set(["localhost", "127.0.0.1"]);
const isLocalPreview =
  window.location.protocol === "file:" ||
  localPreviewHosts.has(window.location.hostname) ||
  localPreviewHosts.has(siteRootUrl.hostname);
const publicSiteRootUrl = isLocalPreview ? siteRootUrl : new URL(livePublicSiteRootUrl);

function buildSiteHref(path) {
  const normalizedPath = path.replace(/^\//u, "");
  return new URL(normalizedPath, publicSiteRootUrl).toString();
}

function buildAppHref(path) {
  const normalizedPath = path.replace(/^\//u, "");
  if (isLocalPreview) {
    const localPath = normalizedPath.endsWith(".html") ? normalizedPath : `${normalizedPath}.html`;
    return buildSiteHref(localPath);
  }
  const livePath = normalizedPath.replace(/\.html$/u, "");
  return new URL(livePath, liveAppRootUrl).toString();
}

function normalizeHrefPath(value) {
  try {
    const url = new URL(String(value || ""), window.location.origin);
    const pathname = url.pathname.replace(/\/+$/u, "");
    return pathname || "/index.html";
  } catch (_) {
    return "/index.html";
  }
}

const header = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const menu = document.querySelector(".menu");

function isDesktopDropdownMode() {
  return window.matchMedia("(min-width: 760px)").matches;
}

function isMobileNavMode() {
  return window.matchMedia("(max-width: 759px)").matches;
}

function buildNavigationMarkup() {
  return `
    <div class="site-nav-shortcuts" aria-label="Quick navigation">
      <a class="site-nav-shortcut site-nav-shortcut--home" href="${buildSiteHref("index.html")}">Home</a>
      <a
        class="site-nav-shortcut site-nav-shortcut--account"
        href="${buildAppHref("account")}"
        aria-label="My account"
        title="My account"
      >
        <span class="site-nav-account-icon" aria-hidden="true"></span>
      </a>
    </div>
    <a class="site-nav-desktop-home" href="${buildSiteHref("index.html")}">Home</a>
    <div class="nav-dropdown">
      <button class="nav-dropdown-toggle" type="button" aria-expanded="false" aria-haspopup="true">
        Programs
        <span class="nav-caret" aria-hidden="true"></span>
      </button>
      <div class="nav-submenu" role="menu" aria-label="Programs submenu">
        <a href="/coaching/1-1.html" role="menuitem">1-on-1 Coaching</a>
        <a href="/coaching/pre-postnatal.html" role="menuitem">Pre &amp; Postnatal</a>
        <a href="/coaching/longevity-seniors.html" role="menuitem">Longevity &amp; Older Adults</a>
        <a href="/coaching/rehab.html" role="menuitem">Rehab</a>
        <a href="/coaching/corporate.html" role="menuitem">Corporate Wellness</a>
      </div>
    </div>
    <a href="/packages.html">Pricing</a>
    <a href="/coaches.html">Meet the Team</a>
    <a href="/store.html">Store</a>
    <div class="nav-dropdown">
      <button class="nav-dropdown-toggle" type="button" aria-expanded="false" aria-haspopup="true">
        Others
        <span class="nav-caret" aria-hidden="true"></span>
      </button>
      <div class="nav-submenu" role="menu" aria-label="Others submenu">
        <a href="/about.html" role="menuitem">About</a>
        <a href="/facilities.html" role="menuitem">Facilities</a>
        <a href="/careers.html" role="menuitem">Careers</a>
        <a href="/contact.html" role="menuitem">Contact Us</a>
      </div>
    </div>
  `;
}

function installPrimaryNavigation() {
  if (!header) return;

  const brandLink = header.querySelector(".brand[href]");
  if (brandLink instanceof HTMLAnchorElement) {
    brandLink.href = buildSiteHref("index.html");
  }

  const nav = header.querySelector(".site-nav");
  if (nav) {
    nav.innerHTML = buildNavigationMarkup();
    if (!nav.id) {
      nav.id = "site-nav";
    }
    if (menuToggle && !menuToggle.getAttribute("aria-controls")) {
      menuToggle.setAttribute("aria-controls", nav.id);
    }
  }

  const ctaGroup = header.querySelector(".header-cta-group, .header-actions");
  if (ctaGroup) {
    ctaGroup.innerHTML = `<a class="btn btn-primary" href="${buildAppHref("account")}">MY ACCOUNT</a>`;
    ctaGroup.hidden = false;
  }
}

installPrimaryNavigation();
document.querySelectorAll(".account-gateway-trigger").forEach((link) => {
  if (link instanceof HTMLAnchorElement) {
    link.href = buildAppHref("account");
    link.textContent = "MY ACCOUNT";
  }
});
const navLinks = document.querySelectorAll(".site-nav a, .menu a");
const navDropdowns = document.querySelectorAll(".nav-dropdown");
let partnersMarqueeResizeTimer;

function setDropdownOpen(dropdown, isOpen) {
  dropdown.classList.toggle("open", isOpen);
  const toggle = dropdown.querySelector(".nav-dropdown-toggle");
  if (toggle) {
    toggle.setAttribute("aria-expanded", String(isOpen));
  }
}

function closeNavDropdowns() {
  navDropdowns.forEach((dropdown) => {
    setDropdownOpen(dropdown, false);
  });
}

if (menuToggle && menu) {
  menuToggle.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menu.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

if (menuToggle && header && !menu) {
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

  dropdown.addEventListener("mouseenter", () => {
    if (!isDesktopDropdownMode()) return;
    navDropdowns.forEach((other) => setDropdownOpen(other, other === dropdown));
  });

  dropdown.addEventListener("mouseleave", () => {
    if (!isDesktopDropdownMode()) return;
    window.setTimeout(() => {
      if (!dropdown.matches(":hover") && !toggle.matches(":focus-visible")) {
        setDropdownOpen(dropdown, false);
      }
    }, 120);
  });

  toggle.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    const shouldOpen = !dropdown.classList.contains("open");

    navDropdowns.forEach((other) => {
      setDropdownOpen(other, false);
    });

    setDropdownOpen(dropdown, shouldOpen);
  });
});

document.addEventListener("click", (event) => {
  navDropdowns.forEach((dropdown) => {
    if (dropdown.contains(event.target)) return;
    setDropdownOpen(dropdown, false);
  });
});

function createPartnersSequence(templateCards, isHidden) {
  const sequence = document.createElement("div");
  sequence.className = "partners-logos";

  if (isHidden) {
    sequence.setAttribute("aria-hidden", "true");
  }

  templateCards.forEach((card) => {
    const clone = card.cloneNode(true);

    if (isHidden) {
      clone.querySelectorAll("a").forEach((link) => {
        link.tabIndex = -1;
      });

      clone.querySelectorAll("img").forEach((image) => {
        image.alt = "";
      });
    }

    sequence.append(clone);
  });

  return sequence;
}

function setupPartnersMarquee() {
  const marquees = document.querySelectorAll(".partners-marquee");

  marquees.forEach((marquee) => {
    const track = marquee.querySelector(".partners-track");
    const baseGroup = track?.querySelector(".partners-logos");
    if (!track || !baseGroup) return;

    const isMobileStaticMode = window.matchMedia("(max-width: 759px)").matches;

    if (!track.dataset.partnersTemplate) {
      track.dataset.partnersTemplate = baseGroup.innerHTML;
    }

    const templateWrapper = document.createElement("div");
    templateWrapper.innerHTML = track.dataset.partnersTemplate;
    const templateCards = Array.from(templateWrapper.children).map((card) => card.cloneNode(true));
    if (!templateCards.length) return;

    track.innerHTML = "";

    const primarySequence = createPartnersSequence(templateCards, false);
    track.append(primarySequence);

    if (isMobileStaticMode) {
      marquee.classList.add("partners-marquee--mobile-static");
      track.style.removeProperty("--partners-loop-distance");
      return;
    }

    marquee.classList.remove("partners-marquee--mobile-static");

    const baseWidth = primarySequence.getBoundingClientRect().width;
    const marqueeWidth = marquee.getBoundingClientRect().width;
    const copiesPerSequence = Math.max(2, Math.ceil((marqueeWidth * 1.35) / Math.max(baseWidth, 1)));

    for (let copyIndex = 1; copyIndex < copiesPerSequence; copyIndex += 1) {
      templateCards.forEach((card) => {
        primarySequence.append(card.cloneNode(true));
      });
    }

    const loopDistance = primarySequence.getBoundingClientRect().width;
    const duplicateSequence = createPartnersSequence(Array.from(primarySequence.children), true);

    track.append(duplicateSequence);
    track.style.setProperty("--partners-loop-distance", `${loopDistance}px`);
  });
}

setupPartnersMarquee();

window.addEventListener("load", setupPartnersMarquee);
window.addEventListener("resize", () => {
  window.clearTimeout(partnersMarqueeResizeTimer);
  partnersMarqueeResizeTimer = window.setTimeout(setupPartnersMarquee, 140);
});

function renderEarnRankRows() {
  const earnRankRows = document.getElementById("earn-rank-rows");
  if (!earnRankRows) return;

  const minimumCardsPerLoop = 8;
  // Match the median pace of Dota's homepage hero grid, which animates
  // each duplicated row over 120s-180s with translateX(-50%).
  const pixelsPerSecond = 45;
  const badgeAssetVersion = "20260315a";
  const rankAssetVersion = "20260314y";
  const clientRankItems = [
    { src: `./assets/Clients Levels/Hatching (0-10).png?v=${rankAssetVersion}`, name: "Hatching (0-10)" },
    { src: `./assets/Clients Levels/Iron Seed (11-20).png?v=${rankAssetVersion}`, name: "Iron Seed (11-20)" },
    { src: `./assets/Clients Levels/Rune Sworn (21-30).png?v=${rankAssetVersion}`, name: "Rune Sworn (21-30)" },
    { src: `./assets/Clients Levels/Rune Warden (31-40).png?v=${rankAssetVersion}`, name: "Rune Warden (31-40)" },
    { src: `./assets/Clients Levels/Rune Lord (41-50).png?v=${rankAssetVersion}`, name: "Rune Lord (41-50)" },
    { src: `./assets/Clients Levels/Grand Warden (51-60).png?v=${rankAssetVersion}`, name: "Grand Warden (51-60)" },
    { src: `./assets/Clients Levels/Oat Marshal (61-75).png?v=${rankAssetVersion}`, name: "Oat Marshal (61-75)" },
    { src: `./assets/Clients Levels/High Castellan (76-89).png?v=${rankAssetVersion}`, name: "High Castellan (76-89)" },
    { src: `./assets/Clients Levels/Obsidian Regent.png?v=${rankAssetVersion}`, name: "Obsidian Regent" },
  ];

  function escapeHtml(value) {
    return value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function getCardKicker(value) {
    return value
      .replace(/\s*\(\d+\s*-\s*\d+\)\s*$/u, "")
      .replace(/\s+/gu, " ")
      .trim();
  }

  function syncEarnRankRowDurations() {
    const rows = earnRankRows.querySelectorAll(".earn-rank-row");

    rows.forEach((row) => {
      const loopWidth = row.scrollWidth / 2;
      if (!loopWidth) return;

      const durationSeconds = (loopWidth / pixelsPerSecond).toFixed(2);
      row.style.setProperty("--row-duration", `${durationSeconds}s`);
    });
  }

  function removeEarnRankBackgrounds(images, onComplete) {
    const processedCache = new Map();

    function isBackgroundPixel(pixels, pixelIndex) {
      const offset = pixelIndex * 4;
      const red = pixels[offset];
      const green = pixels[offset + 1];
      const blue = pixels[offset + 2];
      const alpha = pixels[offset + 3];

      if (!alpha) return true;

      const max = Math.max(red, green, blue);
      const min = Math.min(red, green, blue);
      const spread = max - min;
      const luminance = (0.2126 * red) + (0.7152 * green) + (0.0722 * blue);
      const saturation = max ? spread / max : 0;

      return luminance < 104 || (luminance < 138 && saturation < 0.58);
    }

    function processAssetImage(sourceImage) {
      const width = sourceImage.naturalWidth;
      const height = sourceImage.naturalHeight;
      if (!width || !height) return null;

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext("2d");
      if (!context) return null;

      context.drawImage(sourceImage, 0, 0, width, height);

      const imageData = context.getImageData(0, 0, width, height);
      const pixels = imageData.data;
      const totalPixels = width * height;
      const visited = new Uint8Array(totalPixels);
      const queue = new Uint32Array(totalPixels);
      let queueStart = 0;
      let queueEnd = 0;

      function enqueue(pixelIndex) {
        if (visited[pixelIndex]) return;
        if (!isBackgroundPixel(pixels, pixelIndex)) return;
        visited[pixelIndex] = 1;
        queue[queueEnd] = pixelIndex;
        queueEnd += 1;
      }

      for (let x = 0; x < width; x += 1) {
        enqueue(x);
        enqueue(((height - 1) * width) + x);
      }

      for (let y = 1; y < height - 1; y += 1) {
        enqueue(y * width);
        enqueue((y * width) + (width - 1));
      }

      while (queueStart < queueEnd) {
        const pixelIndex = queue[queueStart];
        queueStart += 1;

        const offset = pixelIndex * 4;
        pixels[offset + 3] = 0;

        const x = pixelIndex % width;
        const y = Math.floor(pixelIndex / width);

        if (x > 0) enqueue(pixelIndex - 1);
        if (x < width - 1) enqueue(pixelIndex + 1);
        if (y > 0) enqueue(pixelIndex - width);
        if (y < height - 1) enqueue(pixelIndex + width);
      }

      context.putImageData(imageData, 0, 0);
      return canvas.toDataURL("image/png");
    }

    function applyProcessedSource(assetSrc, processedSrc) {
      images.forEach((img) => {
        if (img.dataset.assetSrc !== assetSrc) return;
        if (img.dataset.bgProcessed === "true") return;
        img.dataset.bgProcessed = "true";
        img.src = processedSrc;
      });
      onComplete();
    }

    const uniqueAssetImages = new Map();
    images.forEach((img) => {
      const assetSrc = img.dataset.assetSrc;
      if (!assetSrc || uniqueAssetImages.has(assetSrc)) return;
      uniqueAssetImages.set(assetSrc, img);
    });

    uniqueAssetImages.forEach((img, assetSrc) => {
      function finalizeProcessing() {
        if (processedCache.has(assetSrc)) {
          applyProcessedSource(assetSrc, processedCache.get(assetSrc));
          return;
        }

        if (/\.svg(?:\?|$)/i.test(assetSrc)) {
          onComplete();
          return;
        }

        const processedSrc = processAssetImage(img);
        if (!processedSrc) {
          onComplete();
          return;
        }

        processedCache.set(assetSrc, processedSrc);
        applyProcessedSource(assetSrc, processedSrc);
      }

      if (img.complete && img.naturalWidth) {
        finalizeProcessing();
        return;
      }

      img.addEventListener("load", finalizeProcessing, { once: true });
      img.addEventListener("error", onComplete, { once: true });
    });
  }

  const rankRows = [
    {
      label: "Client Badges",
      slug: "client-badges",
      items: [
        { src: `./assets/Client Badges/1. Founding step.svg?v=${badgeAssetVersion}`, name: "Founding Step" },
        { src: `./assets/Client Badges/2. Account created.svg?v=${badgeAssetVersion}`, name: "Account Created" },
        { src: `./assets/Client Badges/3. Consultation complete.svg?v=${badgeAssetVersion}`, name: "Consult Complete" },
        { src: `./assets/Client Badges/4. Waiver signed.svg?v=${badgeAssetVersion}`, name: "Waiver Signed" },
        { src: `./assets/Client Badges/5. Wearable linked.svg?v=${badgeAssetVersion}`, name: "Wearable Linked" },
        { src: `./assets/Client Badges/6. Profile complete.svg?v=${badgeAssetVersion}`, name: "Profile Complete" },
        { src: `./assets/Client Badges/7. First session.svg?v=${badgeAssetVersion}`, name: "First Session" },
        { src: `./assets/Client Badges/8. Strength session.svg?v=${badgeAssetVersion}`, name: "Strength Session" },
        { src: `./assets/Client Badges/9. On-time attendance.svg?v=${badgeAssetVersion}`, name: "On-Time Attendance" },
        { src: `./assets/Client Badges/10. Video reviewed.svg?v=${badgeAssetVersion}`, name: "Video Reviewed" },
      ],
    },
    {
      label: "Client Ranks",
      slug: "client-ranks",
      items: clientRankItems,
    },
  ];

  function expandLoopItems(items) {
    const targetCount = Math.max(items.length, minimumCardsPerLoop);
    const expandedItems = [];

    while (expandedItems.length < targetCount) {
      expandedItems.push(...items);
    }

    return expandedItems.slice(0, targetCount);
  }

  earnRankRows.innerHTML = rankRows
    .map((row, rowIndex) => {
      const isMobileStaticMode = window.matchMedia("(max-width: 759px)").matches;
      const loopItems = isMobileStaticMode ? row.items : expandLoopItems(row.items);

      const cards = loopItems.map((item) => {
        const itemName = escapeHtml(item.name);
        const itemKicker = escapeHtml(getCardKicker(item.name));

        return `
          <figure class="earn-rank-card${row.cropRibbon ? " is-ribbon-cropped" : ""}">
            <div class="earn-rank-card-media" aria-hidden="true">
              <img class="earn-rank-card-bg" src="${item.src}" alt="" loading="lazy" />
              <img class="earn-rank-card-image" src="${item.src}" data-asset-src="${item.src}" alt="${itemName}" loading="lazy" />
            </div>
            <figcaption class="earn-rank-card-overlay">
              <span class="earn-rank-card-title">${itemKicker}</span>
            </figcaption>
          </figure>
        `;
      }).join("");

      return `
        <div class="earn-rank-row-viewport" data-row-group="${row.slug}">
          <div class="earn-rank-row${rowIndex % 2 === 1 ? " is-reversed" : ""}">
            ${cards}
            ${isMobileStaticMode ? "" : cards}
          </div>
        </div>
      `;
    })
    .join("");

  const rowImages = Array.from(earnRankRows.querySelectorAll(".earn-rank-card-image"));
  const scheduleSync = () => requestAnimationFrame(syncEarnRankRowDurations);

  rowImages.forEach((img) => {
    if (img.complete) return;
    img.addEventListener("load", scheduleSync, { once: true });
    img.addEventListener("error", scheduleSync, { once: true });
  });

  window.addEventListener("resize", scheduleSync, { passive: true });
  scheduleSync();
}

renderEarnRankRows();

function removePartnerLogoBackgrounds() {
  const partnerLogos = document.querySelectorAll("img[data-bg-removal]");
  if (!partnerLogos.length) return;

  partnerLogos.forEach((img) => {
    function processImage() {
      const canvas = document.createElement("canvas");
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      if (!width || !height) return;

      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext("2d");
      if (!context) return;

      context.drawImage(img, 0, 0, width, height);

      const imageData = context.getImageData(0, 0, width, height);
      const pixels = imageData.data;
      const mode = img.dataset.bgRemoval;

      for (let index = 0; index < pixels.length; index += 4) {
        const red = pixels[index];
        const green = pixels[index + 1];
        const blue = pixels[index + 2];
        const alpha = pixels[index + 3];

        if (!alpha) continue;

        const max = Math.max(red, green, blue);
        const min = Math.min(red, green, blue);
        const spread = max - min;

        if (mode === "light") {
          const isNearGray = spread < 20;
          const isLight = red > 205 && green > 205 && blue > 205;
          if (isNearGray && isLight) {
            pixels[index + 3] = 0;
          }
        }

        if (mode === "dark") {
          const isNearBlack = red < 24 && green < 24 && blue < 24;
          if (isNearBlack) {
            pixels[index + 3] = 0;
          }
        }
      }

      context.putImageData(imageData, 0, 0);
      img.src = canvas.toDataURL("image/png");
    }

    if (img.complete) {
      processImage();
    } else {
      img.addEventListener("load", processImage, { once: true });
    }
  });
}

removePartnerLogoBackgrounds();

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeNavDropdowns();
  }
});

navLinks.forEach((link) => {
  const currentPath = normalizeHrefPath(window.location.pathname);
  const href = String(link.getAttribute("href") || "");
  const linkPath = normalizeHrefPath(href);
  const matchesCurrentPage =
    currentPath === linkPath || (currentPath.endsWith("/store-product.html") && linkPath.endsWith("/store.html"));

  if (matchesCurrentPage) {
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

document.querySelectorAll(".nav-submenu a").forEach((link) => {
  if (!(link instanceof HTMLAnchorElement)) return;

  link.addEventListener("click", (event) => {
    const href = link.href;
    if (!href) return;

    event.preventDefault();

    if (header) {
      header.classList.remove("nav-open");
    }
    if (menuToggle) {
      menuToggle.setAttribute("aria-expanded", "false");
    }
    closeNavDropdowns();

    window.location.href = href;
  });
});

const siteNav = header?.querySelector(".site-nav");
if (siteNav instanceof HTMLElement) {
  const handleMobileSubmenuNavigate = (event) => {
    const link = event.target.closest(".nav-submenu a[href]");
    if (!(link instanceof HTMLAnchorElement) || !isMobileNavMode()) {
      return;
    }

    const href = link.href;
    if (!href) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    if (header) {
      header.classList.remove("nav-open");
    }
    if (menuToggle) {
      menuToggle.setAttribute("aria-expanded", "false");
    }
    closeNavDropdowns();

    window.location.assign(href);
  };

  siteNav.addEventListener("touchend", handleMobileSubmenuNavigate, { passive: false });
  siteNav.addEventListener("pointerup", handleMobileSubmenuNavigate);
  siteNav.addEventListener("click", (event) => {
    const submenuLink = event.target.closest(".nav-submenu a[href]");
    if (submenuLink instanceof HTMLAnchorElement && isMobileNavMode()) {
      event.preventDefault();
      event.stopPropagation();
      window.location.assign(submenuLink.href);
      return;
    }

    const link = event.target.closest("a[href]");
    if (!(link instanceof HTMLAnchorElement) || !isMobileNavMode()) {
      return;
    }

    if (header) {
      header.classList.remove("nav-open");
    }
    if (menuToggle) {
      menuToggle.setAttribute("aria-expanded", "false");
    }
    closeNavDropdowns();
  });
}

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
  const containers = Array.from(document.querySelectorAll(`[data-filter-target='${target}']`));
  const cards = containers.flatMap((container) => Array.from(container.querySelectorAll("[data-category]")));

  function applyFilter(filterValue, activeButton) {
    buttons.forEach((node) => node.classList.toggle("active", node === activeButton));

    cards.forEach((card) => {
      const categories = card.getAttribute("data-category") || "";
      const shouldShow = filterValue === "all" || categories.split(" ").includes(filterValue);
      card.classList.toggle("is-hidden-by-filter", !shouldShow);
    });

    containers.forEach((container) => {
      container.dispatchEvent(
        new CustomEvent("legacy:filterchange", {
          bubbles: true,
          detail: { filterValue },
        })
      );
    });
  }

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const filterValue = button.getAttribute("data-filter");
      applyFilter(filterValue, button);
    });
  });

  const initialButton = group.querySelector("[data-filter].active") || buttons[0];
  if (initialButton) {
    applyFilter(initialButton.getAttribute("data-filter") || "all", initialButton);
  }
});

function getPtPricingToolkit() {
  const pricingData = window.LEGACY_PT_PRICING;
  if (!pricingData || !pricingData.commitments) return null;

  const tiers = Array.isArray(pricingData.tiers) ? pricingData.tiers : [];

  function escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function formatCurrency(value) {
    return `RM ${Number(value || 0).toLocaleString("en-MY", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  }

  function buildCurrencyValueHtml(value) {
    const amount = Number(value || 0).toLocaleString("en-MY", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });

    return `
      <span class="pt-currency-prefix">RM</span>
      <span class="pt-currency-amount">${escapeHtml(amount)}</span>
    `;
  }

  function normalizeCommitment(value) {
    const normalized = String(value || "").trim().toLowerCase();
    if (normalized === "subscription") return "subscription";
    if (normalized === "long-term" || normalized === "longterm" || normalized === "long_term") return "longTerm";
    return "";
  }

  function normalizeTier(value) {
    const normalized = String(value || "").trim().toLowerCase();
    return tiers.some((tier) => tier.id === normalized) ? normalized : "";
  }

  function getCommitmentParam(commitmentKey) {
    return commitmentKey === "longTerm" ? "long-term" : "subscription";
  }

  function formatSessionLabel(count) {
    return `${count} ${Number(count) === 1 ? "session" : "sessions"}`;
  }

  function buildPackageCode(commitmentKey, trainingType, tierId, sessions) {
    const commitment = commitmentKey === "longTerm" ? "long-term" : "subscription";
    const training = trainingType === "oneToTwo" ? "1on2" : "1on1";
    return `${commitment}_${training}_${tierId}_${sessions}s`;
  }

  function buildPackageTileHtml(packageItem) {
    const totalLabel = "TOTAL";
    const primaryTotal = packageItem.total;
    const isFeatured = Number(packageItem.sessions) === 8;
    const lines = [];
    const featuredBadge = isFeatured ? '<span class="pt-package-flag">Popular</span>' : "";

    if (packageItem.expiry) {
      lines.push(`<span class="pt-package-line">${escapeHtml(`Expiry: ${packageItem.expiry}`)}</span>`);
    }

    if (packageItem.installmentAvailable) {
      lines.push('<span class="pt-package-line pt-package-line--installment">Installment Plan Available</span>');
    }

    const cardMarkup = `
      <article
        class="pt-package-tile${isFeatured ? " pt-package-tile--featured" : ""}"
        ${packageItem.packageCode ? `data-package-code="${escapeHtml(packageItem.packageCode)}"` : ""}
      >
        <div class="pt-package-head">
          <span class="pt-package-sessions">${escapeHtml(formatSessionLabel(packageItem.sessions))}</span>
          ${featuredBadge}
        </div>
        <strong class="pt-package-total">${buildCurrencyValueHtml(primaryTotal)}</strong>
        <span class="pt-package-subtotal">${escapeHtml(totalLabel)}</span>
        ${lines.length ? `<div class="pt-package-meta">${lines.join("")}</div>` : ""}
      </article>
    `;

    return cardMarkup;
  }

  function buildTierCardHtml(tier) {
    const packages = Array.isArray(tier.packages) ? tier.packages : [];
    const pricingTitle = tier.tierTitle ? `${tier.tierLabel} | ${tier.tierTitle}` : tier.tier;

    return `
      <article class="price-card pt-tier-card">
        <div class="pt-tier-top">
          <div>
            <span class="pt-tier-eyebrow">Selected Tier</span>
            <h3>${escapeHtml(pricingTitle)}</h3>
          </div>
        </div>
        <p class="pt-tier-note">${escapeHtml(tier.note || "")}</p>
        <div class="pt-package-grid">
          ${packages.map((packageItem) => buildPackageTileHtml(packageItem)).join("")}
        </div>
      </article>
    `;
  }

  function renderTierSet(container, selectedTiers) {
    if (!container) return;
    container.innerHTML = selectedTiers.map((tier) => buildTierCardHtml(tier)).join("");
  }

  function buildPageUrl(pathname, commitmentKey, extraParams = {}) {
    const params = new URLSearchParams(window.location.search);
    params.set("commitment", getCommitmentParam(commitmentKey));
    params.delete("tier");
    params.delete("tierA");
    params.delete("tierB");

    Object.entries(extraParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    const nextQuery = params.toString();
    return `${pathname}${nextQuery ? `?${nextQuery}` : ""}`;
  }

  function buildCompareUrl(commitmentKey, tierA = "", tierB = "") {
    return buildPageUrl("/packages-compare.html", commitmentKey, { tierA, tierB });
  }

  function buildTierDetailUrl(commitmentKey, tierId = "") {
    return buildPageUrl("/packages-tier.html", commitmentKey, { tier: tierId });
  }

  function syncCompareLinks(commitmentKey, tierA = "", tierB = "") {
    const compareUrl = buildCompareUrl(commitmentKey, tierA, tierB);
    document.querySelectorAll("[data-pt-compare-link]").forEach((node) => {
      node.href = compareUrl;
    });
    return compareUrl;
  }

  function updateQueryString(commitmentKey, tierId = "") {
    const params = new URLSearchParams(window.location.search);
    params.set("commitment", getCommitmentParam(commitmentKey));
    params.delete("tierA");
    params.delete("tierB");
    if (tierId) {
      params.set("tier", tierId);
    } else {
      params.delete("tier");
    }
    const nextQuery = params.toString();
    const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ""}${window.location.hash}`;
    try {
      window.history.replaceState({}, "", nextUrl);
    } catch (error) {
      // Local file previews can reject history mutations. Ignore and keep rendering.
    }
  }

  function getTierEntries(commitmentConfig, commitmentKey = "") {
    function decorateTierSet(tierSet, tier, trainingType) {
      if (!tierSet) return null;

      return {
        ...tierSet,
        tierLabel: tier.label,
        tierTitle: tier.title,
        commitmentKey,
        packages: Array.isArray(tierSet.packages)
          ? tierSet.packages.map((packageItem) => ({
              ...packageItem,
              packageCode: buildPackageCode(commitmentKey, trainingType, tier.id, packageItem.sessions),
              installmentAvailable: commitmentKey === "longTerm" && Number(packageItem.sessions) >= 36,
            }))
          : [],
      };
    }

    return tiers
      .map((tier, index) => ({
        ...tier,
        oneToOne: Array.isArray(commitmentConfig.oneToOne)
          ? decorateTierSet(commitmentConfig.oneToOne[index], tier, "oneToOne")
          : null,
        oneToTwo: Array.isArray(commitmentConfig.oneToTwo)
          ? decorateTierSet(commitmentConfig.oneToTwo[index], tier, "oneToTwo")
          : null,
      }))
      .filter((tier) => tier.oneToOne || tier.oneToTwo);
  }

  return {
    pricingData,
    tiers,
    escapeHtml,
    formatCurrency,
    buildCurrencyValueHtml,
    normalizeCommitment,
    normalizeTier,
    getCommitmentParam,
    renderTierSet,
    buildCompareUrl,
    buildTierDetailUrl,
    syncCompareLinks,
    updateQueryString,
    getTierEntries,
  };
}

function renderPtTierPage() {
  const page = document.querySelector("[data-pt-tier-page]");
  const toolkit = getPtPricingToolkit();
  if (!page || !toolkit) return;

  const {
    pricingData,
    escapeHtml,
    normalizeCommitment,
    getCommitmentParam,
    syncCompareLinks,
    updateQueryString,
    getTierEntries,
  } = toolkit;
  const kickerNode = page.querySelector("[data-commitment-kicker]");
  const titleNode = page.querySelector("[data-tier-page-title]");
  const summaryNode = page.querySelector("[data-tier-page-summary]");
  const tierGrid = page.querySelector("[data-tier-grid]");
  const params = new URLSearchParams(window.location.search);
  const commitmentKey = normalizeCommitment(params.get("commitment")) || "subscription";
  const commitmentConfig = pricingData.commitments[commitmentKey];
  if (!commitmentConfig) return;

  syncCompareLinks(commitmentKey);
  updateQueryString(commitmentKey);

  if (kickerNode) {
    kickerNode.textContent = `${commitmentConfig.label} Selected`;
  }

  if (titleNode) {
    titleNode.textContent = "Choose your tier";
  }

  if (summaryNode) {
    summaryNode.textContent = `You are viewing ${commitmentConfig.label.toLowerCase()} pricing. Pick the tier that matches your goals, coaching depth, and budget.`;
  }

  if (tierGrid) {
    tierGrid.innerHTML = getTierEntries(commitmentConfig, commitmentKey)
      .map(
        (tier) => `
          <a
            class="pt-tier-choice-card pt-tier-choice-card--${escapeHtml(tier.id)}"
            data-tier-code="${escapeHtml(tier.number || "")}"
            href="/packages-tier.html?commitment=${escapeHtml(
            getCommitmentParam(commitmentKey)
          )}&tier=${escapeHtml(tier.id)}"
          >
            <span class="pt-tier-choice-aura" aria-hidden="true"></span>
            <span class="pt-tier-choice-orbit" aria-hidden="true"></span>
            <span class="pt-tier-choice-trace" aria-hidden="true"></span>
            <span class="pt-tier-choice-index">${escapeHtml(tier.label)}</span>
            <strong class="pt-tier-choice-title">${escapeHtml(tier.title)}</strong>
            <span class="pt-tier-choice-strap">${escapeHtml(tier.strapline || "View tier details")}</span>
            <ul class="pt-tier-choice-points">
              ${(Array.isArray(tier.cardPoints) ? tier.cardPoints : [])
                .map((point) => `<li>${escapeHtml(point)}</li>`)
                .join("")}
            </ul>
          </a>
        `
      )
      .join("");

    installPtTierCardMotion(tierGrid);
  }
}

function installPtTierCardMotion(scope = document) {
  const cards = Array.from(scope.querySelectorAll(".pt-tier-choice-card, .pt-compare-tier-button"));
  if (!cards.length) return;

  const finePointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)");

  cards.forEach((card) => {
    if (card.dataset.tierMotionReady === "true") return;
    card.dataset.tierMotionReady = "true";

    function resetCardMotion() {
      card.classList.remove("is-tier-live");
      card.style.setProperty("--tier-tilt-x", "0deg");
      card.style.setProperty("--tier-tilt-y", "0deg");
      card.style.setProperty("--tier-spot-x", "50%");
      card.style.setProperty("--tier-spot-y", "18%");
    }

    function updateCardMotion(event) {
      if (!finePointerQuery.matches) return;
      if (event.pointerType && event.pointerType !== "mouse" && event.pointerType !== "pen") return;

      const bounds = card.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;

      const x = Math.min(Math.max((event.clientX - bounds.left) / bounds.width, 0), 1);
      const y = Math.min(Math.max((event.clientY - bounds.top) / bounds.height, 0), 1);
      const tiltX = (0.5 - y) * 10;
      const tiltY = (x - 0.5) * 10;

      card.style.setProperty("--tier-tilt-x", `${tiltX.toFixed(2)}deg`);
      card.style.setProperty("--tier-tilt-y", `${tiltY.toFixed(2)}deg`);
      card.style.setProperty("--tier-spot-x", `${(x * 100).toFixed(1)}%`);
      card.style.setProperty("--tier-spot-y", `${(y * 100).toFixed(1)}%`);
      card.classList.add("is-tier-live");
    }

    card.addEventListener("pointerenter", updateCardMotion);
    card.addEventListener("pointermove", updateCardMotion);
    card.addEventListener("pointerleave", resetCardMotion);
    card.addEventListener("focus", () => {
      card.classList.add("is-tier-live");
    });
    card.addEventListener("blur", resetCardMotion);
  });
}

function renderPtTierDetailPage() {
  const page = document.querySelector("[data-pt-tier-detail-page]");
  const toolkit = getPtPricingToolkit();
  if (!page || !toolkit) return;

  const {
    pricingData,
    escapeHtml,
    normalizeCommitment,
    normalizeTier,
    getCommitmentParam,
    renderTierSet,
    syncCompareLinks,
    updateQueryString,
    getTierEntries,
  } = toolkit;

  const kickerNode = page.querySelector("[data-tier-detail-kicker]");
  const titleNode = page.querySelector("[data-tier-detail-title]");
  const descriptionNode = page.querySelector("[data-tier-detail-description]");
  const pillsNode = page.querySelector("[data-tier-detail-pills]");
  const backLink = page.querySelector("[data-tier-back-link]");
  const audienceNode = page.querySelector("[data-tier-detail-audience]");
  const expectationsNode = page.querySelector("[data-tier-detail-expectations]");
  const specialistNotesNode = page.querySelector("[data-tier-specialist-notes]");
  const specialistListNode = page.querySelector("[data-tier-specialist-list]");
  const pricingTitleNode = page.querySelector("[data-tier-pricing-title]");
  const pricingSummaryNode = page.querySelector("[data-tier-pricing-summary]");
  const oneToOneContainer = page.querySelector("[data-training-type='oneToOne']");
  const oneToTwoContainer = page.querySelector("[data-training-type='oneToTwo']");
  const params = new URLSearchParams(window.location.search);
  const commitmentKey = normalizeCommitment(params.get("commitment")) || "subscription";
  const commitmentConfig = pricingData.commitments[commitmentKey];
  if (!commitmentConfig) return;

  const tierEntries = getTierEntries(commitmentConfig, commitmentKey);
  let tierId = normalizeTier(params.get("tier"));
  let selectedTier = tierEntries.find((tier) => tier.id === tierId) || tierEntries[0];
  if (!selectedTier) return;

  tierId = selectedTier.id;
  const detailThemeClasses = (pricingData.tiers || []).map((tier) => `pt-tier-detail-theme--${tier.id}`);
  const activeThemeClass = `pt-tier-detail-theme--${selectedTier.id}`;
  document.body.classList.remove(...detailThemeClasses);
  document.body.classList.add(activeThemeClass);
  page.classList.remove(...detailThemeClasses);
  page.classList.add(activeThemeClass);
  syncCompareLinks(commitmentKey, tierId);
  updateQueryString(commitmentKey, tierId);

  if (kickerNode) {
    kickerNode.textContent = `${commitmentConfig.label} | ${selectedTier.label}`;
  }

  if (titleNode) {
    titleNode.textContent = `${selectedTier.label} | ${selectedTier.title}`;
  }

  if (descriptionNode) {
    descriptionNode.textContent = selectedTier.description;
  }

  if (pillsNode) {
    pillsNode.innerHTML = (selectedTier.pills || [])
      .map((pill) => `<span class="pt-summary-pill">${escapeHtml(pill)}</span>`)
      .join("");
  }

  if (backLink) {
    backLink.href = `/packages-pricing.html?commitment=${getCommitmentParam(commitmentKey)}`;
  }

  if (audienceNode) {
    audienceNode.textContent = selectedTier.forWhoDetail || selectedTier.forWho;
  }

  if (expectationsNode) {
    expectationsNode.innerHTML = (selectedTier.whatToExpect || [])
      .map((item) => `<li>${escapeHtml(item)}</li>`)
      .join("");
  }

  if (specialistNotesNode && specialistListNode) {
    const shouldShowSpecialist = selectedTier.id === "tier4" && Array.isArray(pricingData.specialistFootnotes);
    specialistNotesNode.hidden = !shouldShowSpecialist;
    specialistListNode.innerHTML = shouldShowSpecialist
      ? pricingData.specialistFootnotes.map((item) => `<li>${escapeHtml(item)}</li>`).join("")
      : "";
  }

  if (pricingTitleNode) {
    pricingTitleNode.textContent = `${selectedTier.label} Pricing`;
  }

  if (pricingSummaryNode) {
    pricingSummaryNode.textContent = `Only ${selectedTier.label.toLowerCase()} plans are shown below for the ${commitmentConfig.label.toLowerCase()} commitment.`;
  }

  renderTierSet(oneToOneContainer, selectedTier.oneToOne ? [selectedTier.oneToOne] : []);
  renderTierSet(oneToTwoContainer, selectedTier.oneToTwo ? [selectedTier.oneToTwo] : []);
}

function renderPtTierComparePage() {
  const page = document.querySelector("[data-pt-tier-compare-page]");
  const toolkit = getPtPricingToolkit();
  if (!page || !toolkit) return;

  const {
    pricingData,
    escapeHtml,
    formatCurrency,
    buildCurrencyValueHtml,
    normalizeCommitment,
    normalizeTier,
    getCommitmentParam,
    buildCompareUrl,
    buildTierDetailUrl,
    getTierEntries,
  } = toolkit;

  const kickerNode = page.querySelector("[data-tier-compare-kicker]");
  const summaryNode = page.querySelector("[data-tier-compare-summary]");
  const backLink = page.querySelector("[data-tier-compare-back]");
  const modesNode = page.querySelector("[data-tier-compare-modes]");
  const statusNode = page.querySelector("[data-tier-compare-status]");
  const resultsSection = page.querySelector("[data-tier-compare-results]");
  const tableHost = page.querySelector("[data-tier-compare-table]");
  const noteNode = page.querySelector("[data-tier-compare-note]");
  const primaryButtonsHost = page.querySelector("[data-compare-buttons='primary']");
  const secondaryButtonsHost = page.querySelector("[data-compare-buttons='secondary']");
  const params = new URLSearchParams(window.location.search);
  const commitmentKey = normalizeCommitment(params.get("commitment")) || "subscription";
  const commitmentConfig = pricingData.commitments[commitmentKey];

  if (!commitmentConfig || !primaryButtonsHost || !secondaryButtonsHost || !resultsSection || !tableHost || !statusNode) return;

  const tierEntries = getTierEntries(commitmentConfig, commitmentKey);
  const state = {
    primaryId: normalizeTier(params.get("tierA")),
    secondaryId: normalizeTier(params.get("tierB")),
  };

  if (state.primaryId && state.primaryId === state.secondaryId) {
    state.secondaryId = "";
  }

  function getSelectedTier(tierId) {
    return tierEntries.find((tier) => tier.id === tierId) || null;
  }

  function formatSessionCountLabel(count) {
    return `${count} ${Number(count) === 1 ? "session" : "sessions"}`;
  }

  function getCompareModeDetails(modeKey) {
    if (modeKey === "longTerm") {
      return {
        badgeCode: "EXT-02",
        theme: "extended",
        copy: "Longer runway. Locked-in pricing. Better value across the full coaching track.",
        badges: ["Fixed rate", "Longer horizon", "Best value"],
      };
    }

    return {
      badgeCode: "SUB-01",
      theme: "subscription",
      copy: "Monthly recurring billing with the lowest barrier to start coaching now.",
      badges: ["Monthly billing", "Lower upfront", "Fastest start"],
    };
  }

  function buildCompareModeIcon(modeKey) {
    if (modeKey === "longTerm") {
      return `
        <svg viewBox="0 0 64 64" focusable="false">
          <defs>
            <linearGradient id="pt-compare-ext-frame" x1="16" y1="9" x2="50" y2="56" gradientUnits="userSpaceOnUse">
              <stop offset="0" stop-color="#fcf2d7"></stop>
              <stop offset="0.4" stop-color="#c9b06c"></stop>
              <stop offset="1" stop-color="#42553d"></stop>
            </linearGradient>
            <linearGradient id="pt-compare-ext-core" x1="22" y1="20" x2="43" y2="46" gradientUnits="userSpaceOnUse">
              <stop offset="0" stop-color="#b8efc4"></stop>
              <stop offset="1" stop-color="#467a5f"></stop>
            </linearGradient>
            <linearGradient id="pt-compare-ext-glyph" x1="23" y1="22" x2="42" y2="41" gradientUnits="userSpaceOnUse">
              <stop offset="0" stop-color="#fff8ec"></stop>
              <stop offset="1" stop-color="#f1d697"></stop>
            </linearGradient>
          </defs>
          <path
            d="M32 7.3 50.5 16v12.1c0 13.8-7.9 24.3-18.5 29.3-10.6-5-18.5-15.5-18.5-29.3V16L32 7.3Z"
            fill="url(#pt-compare-ext-frame)"
          ></path>
          <path
            d="M32 12.8 45 18.7v9.5c0 9.8-5.3 17.5-13 21.2-7.7-3.7-13-11.4-13-21.2v-9.5L32 12.8Z"
            fill="rgba(16, 18, 10, 0.42)"
          ></path>
          <path
            d="M21.5 31.7c0-5.9 4.7-10.8 10.5-10.8S42.5 25.8 42.5 31.7 37.8 42.4 32 42.4s-10.5-4.8-10.5-10.7Z"
            fill="url(#pt-compare-ext-core)"
          ></path>
          <path
            d="M32 22.1 35 27.1l5.8.8-4.2 4.1 1 5.8-5.6-2.4-5.6 2.4 1-5.8-4.2-4.1 5.8-.8 3-5Z"
            fill="url(#pt-compare-ext-glyph)"
          ></path>
          <path
            d="M19.5 18.9 16.8 16m27.8 30.9 3.2 3.2m0-33-3.2 3.2M18.1 47.8l-2.7 2.7"
            fill="none"
            stroke="rgba(255, 246, 226, 0.72)"
            stroke-width="2"
            stroke-linecap="round"
          ></path>
        </svg>
      `;
    }

    return `
      <svg viewBox="0 0 64 64" focusable="false">
        <defs>
          <linearGradient id="pt-compare-sub-frame" x1="15" y1="10" x2="49" y2="54" gradientUnits="userSpaceOnUse">
            <stop offset="0" stop-color="#fff4d6"></stop>
            <stop offset="0.42" stop-color="#d8a04a"></stop>
            <stop offset="1" stop-color="#6d3c12"></stop>
          </linearGradient>
          <linearGradient id="pt-compare-sub-core" x1="23" y1="20" x2="41" y2="45" gradientUnits="userSpaceOnUse">
            <stop offset="0" stop-color="#75c3ff"></stop>
            <stop offset="1" stop-color="#234a9a"></stop>
          </linearGradient>
          <linearGradient id="pt-compare-sub-arrow" x1="24" y1="25" x2="40" y2="39" gradientUnits="userSpaceOnUse">
            <stop offset="0" stop-color="#fdf7ea"></stop>
            <stop offset="1" stop-color="#ffcd84"></stop>
          </linearGradient>
        </defs>
        <path
          d="M32 7.5 49.8 15v13.8c0 12.9-7.5 24-17.8 28.7C21.7 52.8 14.2 41.7 14.2 28.8V15L32 7.5Z"
          fill="url(#pt-compare-sub-frame)"
        ></path>
        <path
          d="M32 12.8 45.1 18v10.7c0 9.9-5.4 18.3-13.1 22.5-7.7-4.2-13.1-12.6-13.1-22.5V18L32 12.8Z"
          fill="rgba(21, 13, 8, 0.42)"
        ></path>
        <circle cx="32" cy="31.7" r="10.9" fill="url(#pt-compare-sub-core)"></circle>
        <circle cx="32" cy="31.7" r="14.9" fill="none" stroke="rgba(255, 239, 209, 0.35)" stroke-width="1.2"></circle>
        <path
          d="M37.3 26.7c-1.4-1.6-3.3-2.5-5.4-2.5-3.8 0-6.9 3-7 6.8"
          fill="none"
          stroke="url(#pt-compare-sub-arrow)"
          stroke-width="2.8"
          stroke-linecap="round"
        ></path>
        <path
          d="m36.4 23.2 2 3.8-4.3.1"
          fill="none"
          stroke="url(#pt-compare-sub-arrow)"
          stroke-width="2.6"
          stroke-linecap="round"
          stroke-linejoin="round"
        ></path>
        <path
          d="M26.7 36.8c1.4 1.7 3.4 2.7 5.6 2.7 3.8 0 6.9-3 7-6.8"
          fill="none"
          stroke="url(#pt-compare-sub-arrow)"
          stroke-width="2.8"
          stroke-linecap="round"
        ></path>
        <path
          d="m27.6 40.5-2-3.8 4.3-.1"
          fill="none"
          stroke="url(#pt-compare-sub-arrow)"
          stroke-width="2.6"
          stroke-linecap="round"
          stroke-linejoin="round"
        ></path>
      </svg>
    `;
  }

  function getPackagePricing(packageItem) {
    if (!packageItem) return null;

    return {
      total: packageItem.total,
      hourly: packageItem.hourly,
      totalLabel: "TOTAL",
      expiry: packageItem.expiry || "",
      installmentAvailable: Boolean(packageItem.installmentAvailable),
    };
  }

  function buildValueList(items, emptyLabel = "Not specified") {
    const values = Array.isArray(items) ? items.filter(Boolean) : [];
    if (!values.length) {
      return `<span class="pt-compare-empty">${escapeHtml(emptyLabel)}</span>`;
    }

    return `
      <ul class="pt-compare-value-list">
        ${values.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
    `;
  }

  function buildValueText(value, emptyLabel = "Not specified") {
    if (!value) {
      return `<span class="pt-compare-empty">${escapeHtml(emptyLabel)}</span>`;
    }

    return `<div class="pt-compare-copy">${escapeHtml(value)}</div>`;
  }

  function buildPackageCell(packageItem) {
    const pricing = getPackagePricing(packageItem);
    if (!pricing) {
      return `<span class="pt-compare-empty">Not offered</span>`;
    }

    return `
      <div class="pt-compare-package-spec">
        <strong>${buildCurrencyValueHtml(pricing.total)}</strong>
        <span>${escapeHtml(pricing.totalLabel)}</span>
        ${typeof pricing.hourly === "number" ? `<span>${escapeHtml(formatCurrency(pricing.hourly))} / session</span>` : ""}
        ${pricing.expiry ? `<span>${escapeHtml(`Expiry: ${pricing.expiry}`)}</span>` : ""}
        ${pricing.installmentAvailable ? '<span class="pt-compare-installment-note">Installment Plan Available</span>' : ""}
      </div>
    `;
  }

  function buildPackageRows(sectionLabel, leftTierSet, rightTierSet) {
    const leftPackages = Array.isArray(leftTierSet?.packages) ? leftTierSet.packages : [];
    const rightPackages = Array.isArray(rightTierSet?.packages) ? rightTierSet.packages : [];
    const sessionCounts = Array.from(
      new Set([...leftPackages.map((item) => Number(item.sessions)), ...rightPackages.map((item) => Number(item.sessions))])
    ).sort((left, right) => left - right);

    if (!sessionCounts.length) return "";

    const leftPackageMap = new Map(leftPackages.map((item) => [Number(item.sessions), item]));
    const rightPackageMap = new Map(rightPackages.map((item) => [Number(item.sessions), item]));

    return `
      <tr class="comparison-section-row">
        <th colspan="3">${escapeHtml(sectionLabel)}</th>
      </tr>
      ${sessionCounts
        .map(
          (sessions) => `
            <tr>
              <th scope="row">${escapeHtml(formatSessionCountLabel(sessions))}</th>
              <td>${buildPackageCell(leftPackageMap.get(sessions))}</td>
              <td>${buildPackageCell(rightPackageMap.get(sessions))}</td>
            </tr>
          `
        )
        .join("")}
    `;
  }

  function buildCompareCard(tier) {
    const privateStart = getPackagePricing(Array.isArray(tier.oneToOne?.packages) ? tier.oneToOne.packages[0] : null);
    const sharedStart = getPackagePricing(Array.isArray(tier.oneToTwo?.packages) ? tier.oneToTwo.packages[0] : null);

    return `
      <div class="compare-plan-card pt-tier-compare-card pt-tier-compare-card--${escapeHtml(tier.id)}">
        <p class="compare-plan-eyebrow">${escapeHtml(tier.label)}</p>
        <h3>${escapeHtml(tier.title)}</h3>
        <p class="compare-plan-copy">${escapeHtml(tier.strapline || tier.description || "")}</p>
        ${
          privateStart
            ? `<p class="compare-plan-price">${escapeHtml(formatCurrency(privateStart.total))}<span> private starting total</span></p>`
            : ""
        }
        ${
          sharedStart
            ? `<p class="pt-tier-compare-starting-note">Shared starts at ${escapeHtml(formatCurrency(sharedStart.total))}</p>`
            : ""
        }
        <div class="pt-summary-pills">
          ${(tier.pills || []).map((pill) => `<span class="pt-summary-pill">${escapeHtml(pill)}</span>`).join("")}
        </div>
        <div class="compare-plan-actions">
          <a class="btn btn-secondary" href="${escapeHtml(buildTierDetailUrl(commitmentKey, tier.id))}">View ${escapeHtml(
            tier.label
          )}</a>
        </div>
      </div>
    `;
  }

  function buildComparisonTable(leftTier, rightTier) {
    const shouldShowSpecialist = leftTier.id === "tier4" || rightTier.id === "tier4";

    return `
      <table class="comparison-table pt-tier-compare-table">
        <thead>
          <tr>
            <th class="comparison-label-cell">Tier spec</th>
            <th>${buildCompareCard(leftTier)}</th>
            <th>${buildCompareCard(rightTier)}</th>
          </tr>
        </thead>
        <tbody>
          <tr class="comparison-section-row">
            <th colspan="3">Coaching Overview</th>
          </tr>
          <tr>
            <th scope="row">Tier identity</th>
            <td>${buildValueText(`${leftTier.label} | ${leftTier.title}`)}</td>
            <td>${buildValueText(`${rightTier.label} | ${rightTier.title}`)}</td>
          </tr>
          <tr>
            <th scope="row">Coaching angle</th>
            <td>${buildValueText(leftTier.strapline)}</td>
            <td>${buildValueText(rightTier.strapline)}</td>
          </tr>
          <tr>
            <th scope="row">Ideal client</th>
            <td>${buildValueText(leftTier.forWho)}</td>
            <td>${buildValueText(rightTier.forWho)}</td>
          </tr>
          <tr>
            <th scope="row">Tier summary</th>
            <td>${buildValueText(leftTier.description)}</td>
            <td>${buildValueText(rightTier.description)}</td>
          </tr>
          <tr>
            <th scope="row">Coach experience</th>
            <td>${buildValueText(leftTier.cardPoints?.[0])}</td>
            <td>${buildValueText(rightTier.cardPoints?.[0])}</td>
          </tr>
          <tr>
            <th scope="row">Programming depth</th>
            <td>${buildValueText(leftTier.cardPoints?.[1])}</td>
            <td>${buildValueText(rightTier.cardPoints?.[1])}</td>
          </tr>
          <tr>
            <th scope="row">Best for</th>
            <td>${buildValueText(leftTier.cardPoints?.[2])}</td>
            <td>${buildValueText(rightTier.cardPoints?.[2])}</td>
          </tr>
          <tr>
            <th scope="row">Key markers</th>
            <td>${buildValueList(leftTier.pills, "No markers listed")}</td>
            <td>${buildValueList(rightTier.pills, "No markers listed")}</td>
          </tr>
          <tr>
            <th scope="row">What to expect</th>
            <td>${buildValueList(leftTier.whatToExpect, "Expectations not listed")}</td>
            <td>${buildValueList(rightTier.whatToExpect, "Expectations not listed")}</td>
          </tr>
          ${
            shouldShowSpecialist
              ? `
                  <tr>
                    <th scope="row">Specialist ladder</th>
                    <td>${
                      leftTier.id === "tier4"
                        ? buildValueList(pricingData.specialistFootnotes, "Specialist details unavailable")
                        : `<span class="pt-compare-empty">Only listed on Tier 4</span>`
                    }</td>
                    <td>${
                      rightTier.id === "tier4"
                        ? buildValueList(pricingData.specialistFootnotes, "Specialist details unavailable")
                        : `<span class="pt-compare-empty">Only listed on Tier 4</span>`
                    }</td>
                  </tr>
                `
              : ""
          }
          ${buildPackageRows("1-to-1 Pricing", leftTier.oneToOne, rightTier.oneToOne)}
          ${buildPackageRows("1-to-2 Pricing", leftTier.oneToTwo, rightTier.oneToTwo)}
        </tbody>
      </table>
    `;
  }

  function renderButtonGrid(hostNode, slot, selectedId, otherSelectedId) {
    hostNode.innerHTML = tierEntries
      .map((tier) => {
        const isSelected = selectedId === tier.id;
        const isDisabled = Boolean(otherSelectedId && otherSelectedId === tier.id && !isSelected);

        return `
          <button
            class="pt-compare-tier-button pt-compare-tier-button--${escapeHtml(tier.id)} pt-tier-choice-card--${escapeHtml(
              tier.id
            )}${isSelected ? " is-active" : ""}"
            type="button"
            data-compare-slot="${escapeHtml(slot)}"
            data-tier-id="${escapeHtml(tier.id)}"
            aria-pressed="${isSelected ? "true" : "false"}"
            ${isDisabled ? "disabled" : ""}
          >
            <span class="pt-tier-choice-aura" aria-hidden="true"></span>
            <span class="pt-tier-choice-orbit" aria-hidden="true"></span>
            <span class="pt-tier-choice-trace" aria-hidden="true"></span>
            <span class="pt-compare-tier-button-body">
              <span class="pt-compare-tier-button-kicker">${escapeHtml(tier.label)}</span>
              <strong class="pt-compare-tier-button-title">${escapeHtml(tier.title)}</strong>
              <span class="pt-compare-tier-button-copy">${escapeHtml(tier.strapline || tier.description || "")}</span>
            </span>
          </button>
        `;
      })
      .join("");
  }

  function updateCompareQueryString() {
    const nextUrl = `${buildCompareUrl(commitmentKey, state.primaryId, state.secondaryId)}${window.location.hash}`;
    try {
      window.history.replaceState({}, "", nextUrl);
    } catch (error) {
      // Local file previews can reject history mutations. Ignore and keep rendering.
    }
  }

  function renderModeSwitch() {
    if (!modesNode) return;

    modesNode.innerHTML = ["subscription", "longTerm"]
      .map((key) => {
        const config = pricingData.commitments[key];
        const details = getCompareModeDetails(key);
        if (!config) return "";

        return `
          <a
            class="pt-compare-mode-link pt-mode-card pt-mode-card--${escapeHtml(details.theme)}${key === commitmentKey ? " is-active" : ""}"
            href="${escapeHtml(buildCompareUrl(key, state.primaryId, state.secondaryId))}"
            data-mode-code="${escapeHtml(details.badgeCode)}"
          >
            <span class="pt-mode-gridline" aria-hidden="true"></span>
            <span class="pt-mode-shine" aria-hidden="true"></span>
            <div class="pt-mode-card-top">
              <div class="pt-mode-card-head">
                <strong class="pt-mode-name">${escapeHtml(config.label)}</strong>
              </div>
              <span class="pt-mode-icon pt-mode-icon--${escapeHtml(details.theme)}" aria-hidden="true">
                ${buildCompareModeIcon(key)}
              </span>
            </div>
            <p class="pt-mode-copy">${escapeHtml(details.copy)}</p>
            <div class="pt-mode-badges" aria-hidden="true">
              ${details.badges.map((badge) => `<span class="pt-mode-badge">${escapeHtml(badge)}</span>`).join("")}
            </div>
          </a>
        `;
      })
      .join("");
  }

  function renderState() {
    const leftTier = getSelectedTier(state.primaryId);
    const rightTier = getSelectedTier(state.secondaryId);

    renderButtonGrid(primaryButtonsHost, "primary", state.primaryId, state.secondaryId);
    renderButtonGrid(secondaryButtonsHost, "secondary", state.secondaryId, state.primaryId);
    installPtTierCardMotion(page);
    renderModeSwitch();
    updateCompareQueryString();

    if (kickerNode) {
      kickerNode.textContent = `${commitmentConfig.label} Comparison`;
    }

    if (summaryNode) {
      summaryNode.textContent = `Tap any two tiers to compare their coaching specs and ${commitmentConfig.label.toLowerCase()} package pricing line by line.`;
    }

    if (backLink) {
      backLink.href = `/packages-pricing.html?commitment=${getCommitmentParam(commitmentKey)}`;
    }

    if (noteNode) {
      noteNode.textContent = `Showing ${commitmentConfig.label.toLowerCase()} rates for the selected tiers.`;
    }

    if (!leftTier || !rightTier) {
      statusNode.textContent = "Choose two different tiers to unlock the side-by-side tier specs below.";
      resultsSection.hidden = true;
      tableHost.innerHTML = "";
      return;
    }

    statusNode.textContent = `Comparing ${leftTier.label} against ${rightTier.label}.`;
    resultsSection.hidden = false;
    tableHost.innerHTML = buildComparisonTable(leftTier, rightTier);
  }

  function handleTierButtonClick(event) {
    const button = event.target.closest("[data-tier-id]");
    if (!button) return;

    const slot = button.getAttribute("data-compare-slot");
    const tierId = normalizeTier(button.getAttribute("data-tier-id"));
    if (!tierId) return;

    if (slot === "primary") {
      state.primaryId = state.primaryId === tierId ? "" : tierId;
      if (state.primaryId && state.primaryId === state.secondaryId) {
        state.secondaryId = "";
      }
    } else if (slot === "secondary") {
      state.secondaryId = state.secondaryId === tierId ? "" : tierId;
      if (state.secondaryId && state.secondaryId === state.primaryId) {
        state.primaryId = "";
      }
    }

    renderState();
  }

  primaryButtonsHost.addEventListener("click", handleTierButtonClick);
  secondaryButtonsHost.addEventListener("click", handleTierButtonClick);

  renderState();
}

renderPtTierPage();
renderPtTierDetailPage();
renderPtTierComparePage();

function installPricingSideCtaSizing() {
  const ctas = Array.from(document.querySelectorAll(".pt-side-cta-stack > a"));
  if (!ctas.length || !document.body) return;

  const measure = document.createElement("span");
  measure.style.position = "fixed";
  measure.style.top = "-9999px";
  measure.style.left = "-9999px";
  measure.style.visibility = "hidden";
  measure.style.pointerEvents = "none";
  measure.style.whiteSpace = "nowrap";
  document.body.appendChild(measure);

  function syncWidths() {
    ctas.forEach((cta) => {
      const label = cta.querySelector(".pt-side-cta-label");
      const icon = cta.querySelector(".pt-side-cta-icon");
      if (!label || !icon) return;

      const labelStyles = window.getComputedStyle(label);
      const ctaStyles = window.getComputedStyle(cta);
      const iconWidth = Math.ceil(icon.getBoundingClientRect().width || parseFloat(ctaStyles.width) || 58);
      const gap = parseFloat(ctaStyles.getPropertyValue("--pt-side-open-gap")) || 0;
      const padLeft = parseFloat(ctaStyles.getPropertyValue("--pt-side-label-pad-left")) || 0;
      const padRight = parseFloat(ctaStyles.getPropertyValue("--pt-side-label-pad-right")) || 0;
      const extra = parseFloat(ctaStyles.getPropertyValue("--pt-side-open-extra")) || 0;

      measure.style.fontFamily = labelStyles.fontFamily;
      measure.style.fontSize = labelStyles.fontSize;
      measure.style.fontWeight = labelStyles.fontWeight;
      measure.style.letterSpacing = labelStyles.letterSpacing;
      measure.style.textTransform = labelStyles.textTransform;
      measure.textContent = (label.textContent || "").trim();

      const labelWidth = Math.ceil(measure.getBoundingClientRect().width);
      const openWidth = iconWidth + gap + padLeft + padRight + labelWidth + extra;
      cta.style.setProperty("--pt-side-open-width", `${openWidth}px`);
    });
  }

  syncWidths();

  if (document.fonts && typeof document.fonts.ready?.then === "function") {
    document.fonts.ready.then(syncWidths);
  }

  window.addEventListener("resize", syncWidths);
}

installPricingSideCtaSizing();

function normalizeLeadContact(value) {
  const input = String(value || "").trim();
  const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(input) ? input.toLowerCase() : "";
  const phone = email ? "" : input;

  return {
    email,
    phone,
  };
}

function openWhatsAppDraft(url, popup) {
  try {
    if (popup && !popup.closed) {
      popup.location = url;
      return "popup";
    }
  } catch (_) {
    // Fall back to the current tab when the popup cannot be controlled.
  }

  try {
    window.location.assign(url);
    return "redirect";
  } catch (_) {
    return "manual";
  }
}

async function captureLead(payload) {
  const response = await fetch("/.netlify/functions/capture-lead", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.error || "Unable to capture lead.");
  }

  return result;
}

function readPublicFlowJson(key) {
  try {
    const raw = window.sessionStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

function writePublicFlowJson(key, value) {
  try {
    if (value) {
      window.sessionStorage.setItem(key, JSON.stringify(value));
    } else {
      window.sessionStorage.removeItem(key);
    }
  } catch (_) {
    // Ignore storage issues on public forms.
  }
}

function getPublicFormDraftKey(form) {
  const suffix = form.dataset.draftKey || `${window.location.pathname}:${form.id || "form"}`;
  return `legacy-public-form-draft:${suffix}`;
}

function serializePublicForm(form) {
  const snapshot = {};
  if (!(form instanceof HTMLFormElement)) {
    return snapshot;
  }

  Array.from(form.elements).forEach((field) => {
    if (
      !(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement)
      || !field.name
      || field.disabled
      || field.type === "submit"
      || field.type === "button"
      || field.type === "reset"
      || field.type === "file"
    ) {
      return;
    }

    if (field instanceof HTMLInputElement && field.type === "checkbox") {
      snapshot[field.name] = field.checked;
      return;
    }

    if (field instanceof HTMLInputElement && field.type === "radio") {
      if (field.checked) {
        snapshot[field.name] = field.value;
      }
      return;
    }

    snapshot[field.name] = field.value;
  });

  return snapshot;
}

function hydratePublicForm(form, values) {
  if (!(form instanceof HTMLFormElement) || !values || typeof values !== "object") {
    return;
  }

  Object.entries(values).forEach(([name, value]) => {
    const field = form.elements.namedItem(name);
    if (!field) {
      return;
    }

    if (field instanceof RadioNodeList) {
      Array.from(field).forEach((candidate) => {
        if (!(candidate instanceof HTMLInputElement)) return;
        if (candidate.type === "radio") {
          candidate.checked = candidate.value === String(value || "");
        } else if (candidate.type === "checkbox") {
          candidate.checked = Boolean(value);
        }
      });
      return;
    }

    if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement)) {
      return;
    }

    if (field instanceof HTMLInputElement && field.type === "checkbox") {
      field.checked = Boolean(value);
      return;
    }

    if (field instanceof HTMLInputElement && field.type === "radio") {
      field.checked = field.value === String(value || "");
      return;
    }

    field.value = String(value || "");
  });
}

function installPublicFormDraft(form) {
  if (!(form instanceof HTMLFormElement)) {
    return {
      persist() {},
      clear() {},
    };
  }

  const storageKey = getPublicFormDraftKey(form);
  const savedDraft = readPublicFlowJson(storageKey);
  if (savedDraft) {
    hydratePublicForm(form, savedDraft);
  }

  const persist = () => {
    writePublicFlowJson(storageKey, serializePublicForm(form));
  };

  form.addEventListener("input", persist);
  form.addEventListener("change", persist);

  return {
    persist,
    clear() {
      writePublicFlowJson(storageKey, null);
    },
  };
}

function setSubmitButtonBusy(button, busyLabel) {
  if (!(button instanceof HTMLButtonElement)) {
    return () => {};
  }

  const escapedBusyLabel = String(busyLabel || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
  const originalHtml = button.innerHTML;
  button.disabled = true;
  button.setAttribute("aria-busy", "true");
  button.innerHTML = busyLabel
    ? `<span class="btn-spinner" aria-hidden="true"></span><span>${escapedBusyLabel}</span>`
    : '<span class="btn-spinner" aria-hidden="true"></span><span>Working...</span>';

  return () => {
    button.disabled = false;
    button.removeAttribute("aria-busy");
    button.innerHTML = originalHtml;
  };
}

const whatsappForm = document.getElementById("whatsapp-form");
if (whatsappForm) {
  const serviceInput = whatsappForm.querySelector("[name='service']");
  const goalInput = whatsappForm.querySelector("[name='goal']");
  const coachInput = whatsappForm.querySelector("[name='coach']");
  const scheduleInput = whatsappForm.querySelector("[name='schedule']");
  const detailsInput = whatsappForm.querySelector("[name='details']");
  const statusNode = whatsappForm.querySelector("[data-form-status]");
  const submitButton = whatsappForm.querySelector("button[type='submit']");

  function normalizeQueryValue(value) {
    return String(value || "")
      .trim()
      .replace(/\s+/g, " ")
      .toLowerCase();
  }

  function prefillContactField(field, queryKey) {
    const value = new URLSearchParams(window.location.search).get(queryKey);
    if (!field || !value) return;

    if (field instanceof HTMLSelectElement) {
      const requestedValue = normalizeQueryValue(value);
      const matchingOption = Array.from(field.options).find((option) => {
        return (
          normalizeQueryValue(option.value) === requestedValue ||
          normalizeQueryValue(option.textContent || "") === requestedValue
        );
      });

      if (matchingOption) {
        field.value = matchingOption.value;
      }
      return;
    }

    if (field.value) return;
    field.value = value.trim();
  }

  if (serviceInput) {
    const requestedService = new URLSearchParams(window.location.search).get("service");
    if (requestedService) {
      const matchingOption = Array.from(serviceInput.options).find((option) => {
        return normalizeQueryValue(option.value) === normalizeQueryValue(requestedService);
      });
      serviceInput.value = matchingOption ? matchingOption.value : requestedService.trim();
    }
  }

  prefillContactField(goalInput, "goal");
  prefillContactField(coachInput, "coach");
  prefillContactField(scheduleInput, "schedule");
  prefillContactField(detailsInput, "details");
  const contactDraft = installPublicFormDraft(whatsappForm);

  whatsappForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!whatsappForm.reportValidity()) {
      return;
    }
    if (submitButton instanceof HTMLButtonElement && submitButton.disabled) {
      return;
    }

    const releaseSubmit = setSubmitButtonBusy(submitButton, "Preparing Inquiry...");

    try {
      const formData = new FormData(whatsappForm);
      const name = String(formData.get("name") || "").trim();
      const service = String(formData.get("service") || "").trim();
      const goal = String(formData.get("goal") || "").trim();
      const contact = String(formData.get("contact") || "").trim();
      const coach = String(formData.get("coach") || "").trim();
      const schedule = String(formData.get("schedule") || "").trim();
      const details = String(formData.get("details") || "").trim();
      const lines = [
        "Hi LEGACY+ Coaching, I want to start coaching.",
        `Name: ${name || "Not provided"}`,
        `Service: ${service || "Not provided"}`,
        `Goal: ${goal || "Not provided"}`,
        `Contact: ${contact || "Not provided"}`,
        `Preferred coach: ${coach || "No preference yet"}`,
        `Preferred times / team format: ${schedule || "Not provided"}`,
        `Details: ${details || "Not provided"}`,
      ];
      const phone = whatsappForm.dataset.whatsapp || "601139772862";
      const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(lines.join("\n"))}`;
      const popup = window.open("", "_blank", "noopener,noreferrer");
      const contactDetails = normalizeLeadContact(contact);
      const result = await captureLead({
        fullName: name,
        contact,
        email: contactDetails.email,
        phone: contactDetails.phone,
        source: "Website Inquiry Form",
        channel: "website_whatsapp_form",
        pageTitle: document.title,
        pagePath: window.location.pathname,
        service,
        goal,
        preferredCoach: coach,
        schedule,
        details,
      });
      const captureMessage = result.existing
        ? "Your existing lead record was updated in the CRM."
        : "Your inquiry was added to the CRM.";

      contactDraft.clear();

      if (popup) {
        popup.location = whatsappUrl;
      } else {
        window.location.href = whatsappUrl;
      }

      if (statusNode) {
        statusNode.textContent = popup
          ? `${captureMessage} Your WhatsApp draft opened in a new tab.`
          : `${captureMessage} If nothing appeared, allow pop-ups and submit again.`;
        statusNode.classList.remove("error");
        statusNode.classList.add("success");
      }
    } catch (error) {
      const formData = new FormData(whatsappForm);
      const lines = [
        "Hi LEGACY+ Coaching, I want to start coaching.",
        `Name: ${String(formData.get("name") || "").trim() || "Not provided"}`,
        `Service: ${String(formData.get("service") || "").trim() || "Not provided"}`,
        `Goal: ${String(formData.get("goal") || "").trim() || "Not provided"}`,
        `Contact: ${String(formData.get("contact") || "").trim() || "Not provided"}`,
        `Preferred coach: ${String(formData.get("coach") || "").trim() || "No preference yet"}`,
        `Preferred times / team format: ${String(formData.get("schedule") || "").trim() || "Not provided"}`,
        `Details: ${String(formData.get("details") || "").trim() || "Not provided"}`,
      ];
      const phone = whatsappForm.dataset.whatsapp || "601139772862";
      const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(lines.join("\n"))}`;
      const popup = window.open("", "_blank", "noopener,noreferrer");
      contactDraft.clear();

      if (popup) {
        popup.location = whatsappUrl;
      } else {
        window.location.href = whatsappUrl;
      }

      if (statusNode) {
        statusNode.textContent = popup
          ? `Your WhatsApp draft opened, but the CRM copy could not be saved automatically. ${error?.message || ""}`.trim()
          : `Your WhatsApp draft is ready, but the CRM copy could not be saved automatically. ${error?.message || ""}`.trim();
        statusNode.classList.remove("success");
        statusNode.classList.add("error");
      }
    } finally {
      releaseSubmit();
    }
  });
}

const bulkOrderForm = document.getElementById("bulk-order-form-element");
if (bulkOrderForm) {
  const statusNode = bulkOrderForm.querySelector("[data-form-status]");
  const orderTypeInput = bulkOrderForm.querySelector("[name='orderType']");
  const submitButton = bulkOrderForm.querySelector("button[type='submit']");

  function prefillBulkField(fieldName, queryKey = fieldName) {
    const field = bulkOrderForm.querySelector(`[name='${fieldName}']`);
    const value = new URLSearchParams(window.location.search).get(queryKey);
    if (!field || !value || field.value) return;
    field.value = value.trim();
  }

  if (orderTypeInput) {
    const requestedType = new URLSearchParams(window.location.search).get("type");
    if (requestedType) {
      const matchingOption = Array.from(orderTypeInput.options).find((option) => {
        return option.value.trim().toLowerCase() === requestedType.trim().toLowerCase();
      });
      orderTypeInput.value = matchingOption ? matchingOption.value : "";
    }
  }

  prefillBulkField("organization");
  prefillBulkField("quantity");
  prefillBulkField("timeline");
  prefillBulkField("items", "item");
  prefillBulkField("details");
  const bulkOrderDraft = installPublicFormDraft(bulkOrderForm);

  bulkOrderForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!bulkOrderForm.reportValidity()) {
      return;
    }
    if (submitButton instanceof HTMLButtonElement && submitButton.disabled) {
      return;
    }

    const releaseSubmit = setSubmitButtonBusy(submitButton, "Preparing Order...");

    try {
      const formData = new FormData(bulkOrderForm);
      const name = String(formData.get("name") || "").trim();
      const organization = String(formData.get("organization") || "").trim();
      const contact = String(formData.get("contact") || "").trim();
      const orderType = String(formData.get("orderType") || "").trim();
      const quantity = String(formData.get("quantity") || "").trim();
      const timeline = String(formData.get("timeline") || "").trim();
      const items = String(formData.get("items") || "").trim();
      const details = String(formData.get("details") || "").trim();
      const lines = [
        "Hi LEGACY+, I want to enquire about a bulk merch order.",
        "",
        `Name: ${name}`,
        organization ? `Company / Team / Event: ${organization}` : "",
        `Best contact: ${contact}`,
        `Order type: ${orderType}`,
        `Estimated quantity: ${quantity}`,
        timeline ? `Deadline / delivery window: ${timeline}` : "",
        `Products needed: ${items}`,
        details ? `Branding / custom notes: ${details}` : "",
      ].filter(Boolean);
      const whatsappNumber = bulkOrderForm.dataset.whatsapp || "601139772862";
      const whatsappUrl = `https://wa.me/${encodeURIComponent(whatsappNumber)}?text=${encodeURIComponent(lines.join("\n"))}`;
      const popup = window.open("", "_blank", "noopener,noreferrer");
      const contactDetails = normalizeLeadContact(contact);
      const result = await captureLead({
        fullName: name,
        contact,
        email: contactDetails.email,
        phone: contactDetails.phone,
        source: "Bulk Order Inquiry",
        channel: "website_bulk_order_form",
        pageTitle: document.title,
        pagePath: window.location.pathname,
        service: orderType,
        goal: items,
        details: [organization ? `Organization: ${organization}` : "", timeline ? `Timeline: ${timeline}` : "", details]
          .filter(Boolean)
          .join(" | "),
        quantity,
      });

      bulkOrderDraft.clear();

      if (popup) {
        popup.location = whatsappUrl;
      } else {
        window.location.href = whatsappUrl;
      }

      if (statusNode) {
        statusNode.textContent = result.existing
          ? "Your bulk-order lead was updated in the CRM and your WhatsApp draft is ready."
          : "Your bulk-order lead is saved in the CRM and your WhatsApp draft is ready.";
        statusNode.classList.remove("error");
        statusNode.classList.add("success");
      }
    } catch (error) {
      const formData = new FormData(bulkOrderForm);
      const lines = [
        "Hi LEGACY+, I want to enquire about a bulk merch order.",
        "",
        `Name: ${String(formData.get("name") || "").trim()}`,
        String(formData.get("organization") || "").trim()
          ? `Company / Team / Event: ${String(formData.get("organization") || "").trim()}`
          : "",
        `Best contact: ${String(formData.get("contact") || "").trim()}`,
        `Order type: ${String(formData.get("orderType") || "").trim()}`,
        `Estimated quantity: ${String(formData.get("quantity") || "").trim()}`,
        String(formData.get("timeline") || "").trim()
          ? `Deadline / delivery window: ${String(formData.get("timeline") || "").trim()}`
          : "",
        `Products needed: ${String(formData.get("items") || "").trim()}`,
        String(formData.get("details") || "").trim()
          ? `Branding / custom notes: ${String(formData.get("details") || "").trim()}`
          : "",
      ].filter(Boolean);
      const whatsappNumber = bulkOrderForm.dataset.whatsapp || "601139772862";
      const whatsappUrl = `https://wa.me/${encodeURIComponent(whatsappNumber)}?text=${encodeURIComponent(lines.join("\n"))}`;
      const popup = window.open("", "_blank", "noopener,noreferrer");
      bulkOrderDraft.clear();

      if (popup) {
        popup.location = whatsappUrl;
      } else {
        window.location.href = whatsappUrl;
      }

      if (statusNode) {
        statusNode.textContent = `Your WhatsApp draft is ready, but the CRM copy could not be saved automatically. ${error?.message || ""}`.trim();
        statusNode.classList.remove("success");
        statusNode.classList.add("error");
      }
    } finally {
      releaseSubmit();
    }
  });
}

function buildCoachBookingHref({ coach, day, time }) {
  const bookingUrl = new URL(buildSiteHref("coach-booking-inquiry.html"));

  if (coach) {
    bookingUrl.searchParams.set("coach", coach);
  }

  if (day) {
    bookingUrl.searchParams.set("day", day);
  }

  if (time) {
    bookingUrl.searchParams.set("time", time);
  }

  return bookingUrl.toString();
}

function buildLocalPreviewCoachCardMarkup() {
  return `
    <article
      class="team-card team-card--signal team-card--green team-card--local-preview"
      data-local-preview-card
      id="local-preview-coach"
    >
      <div class="team-card-shell">
        <span class="team-card-laser-frame" aria-hidden="true">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" focusable="false">
            <rect class="team-card-laser-track" x="1.4" y="1.4" width="97.2" height="97.2" rx="16" ry="16" pathLength="100"></rect>
            <rect class="team-card-laser-beam" x="1.4" y="1.4" width="97.2" height="97.2" rx="16" ry="16" pathLength="100"></rect>
          </svg>
        </span>
        <a class="team-card-media-link" href="./team/local-coach.html">
          <span class="visually-hidden">View Local Coach profile</span>
          <div class="team-card-media team-card-media--local-preview" aria-hidden="true">
            <div class="team-card-photo team-card-photo--local-preview">
              <span class="team-card-local-preview-mark">LC</span>
              <span class="team-card-local-preview-note">LOCAL QA COACH</span>
            </div>
            <span class="team-card-tier-badge team-card-tier-badge--green">LOCAL</span>
          </div>
        </a>
        <div class="team-card-body">
          <div class="team-card-meta-box">
            <h3><a class="team-card-title-link" href="./team/local-coach.html">Local Coach</a></h3>
            <p class="team-card-fact"><strong>Session quirk:</strong> Local preview coach for end-to-end booking and availability testing.</p>
            <div class="team-card-actions">
              <button
                class="btn btn-secondary team-card-schedule-link"
                type="button"
                data-coach-schedule-open
                data-coach-name="Local Coach"
                aria-haspopup="dialog"
              >
                View Availability
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  `;
}

function installLocalPreviewCoachCard() {
  if (!isLocalPreview) return;
  const path = window.location.pathname || "/";
  if (!/\/coaches(?:\.html)?$/u.test(path)) return;

  const teamGrid = document.querySelector(".team-grid");
  if (!(teamGrid instanceof HTMLElement)) return;
  if (teamGrid.querySelector("[data-local-preview-card]")) return;

  teamGrid.insertAdjacentHTML("beforeend", buildLocalPreviewCoachCardMarkup());
}

function installCoachAvailabilityModal() {
  const modal = document.getElementById("coach-schedule-modal");
  const dataNode = document.getElementById("coach-availability-data");
  const triggers = Array.from(document.querySelectorAll("[data-coach-schedule-open]"));
  if (!modal || !dataNode || !triggers.length) return;

  const coachNameAliases = {
    "Kylie Dennis": "Kylie Denis",
  };

  function normalizeCoachDisplayName(name) {
    return coachNameAliases[String(name || "").trim()] || String(name || "").trim();
  }

  let availabilityData = {};

  try {
    availabilityData = JSON.parse(dataNode.textContent || "{}");
  } catch (error) {
    console.error("Coach availability data could not be parsed.", error);
    return;
  }

  const staticCoachMeta = Object.fromEntries(
    Object.entries(availabilityData).map(([coachName, coach]) => [
      coachName,
      {
        profilePath: coach?.profilePath || "",
        summary: coach?.summary || "",
      },
    ])
  );

  const titleNode = modal.querySelector("[data-coach-schedule-title]");
  const copyNode = modal.querySelector("[data-coach-schedule-copy]");
  const gridNode = modal.querySelector("[data-coach-schedule-grid]");
  const noteNode = modal.querySelector("[data-coach-schedule-note]");
  const profileLink = modal.querySelector("[data-coach-schedule-profile]");
  const panelNode = modal.querySelector(".coach-schedule-panel");
  const closeNodes = Array.from(modal.querySelectorAll("[data-coach-schedule-close]"));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const availabilityCalendar = window.LEGACY_COACH_AVAILABILITY || null;
  let activeTrigger = null;

  function hydrateLiveCoachAvailability() {
    window
      .fetch("/.netlify/functions/public-coach-availability")
      .then((response) => response.json().catch(() => ({})).then((payload) => ({ ok: response.ok, payload })))
      .then(({ ok, payload }) => {
        if (!ok || !payload?.coaches) {
          return;
        }

        Object.entries(payload.coaches).forEach(([coachName, coach]) => {
          const displayCoachName = normalizeCoachDisplayName(coachName);
          const staticMeta = staticCoachMeta[displayCoachName] || staticCoachMeta[coachName] || {};
          availabilityData[displayCoachName] = {
            profilePath: staticMeta.profilePath || buildSiteHref("coaches.html"),
            summary:
              staticMeta.summary ||
              "Live availability is synced from the coach's published schedule in the private workspace.",
            coachId: coach?.coachId || "",
            slots: Array.isArray(coach?.slots) ? coach.slots : [],
            calendar: coach?.calendar || null,
          };
        });

        const activeCoachName = normalizeCoachDisplayName(activeTrigger?.getAttribute("data-coach-name") || "");
        if (modal.classList.contains("open") && activeCoachName && availabilityData[activeCoachName]) {
          openModalForCoach(activeCoachName);
        }
      })
      .catch((error) => {
        if (noteNode instanceof HTMLElement) {
          noteNode.hidden = false;
          noteNode.textContent = error?.message || "Live schedule sync is temporarily unavailable. Showing fallback coach availability.";
        }
      });
  }

  function setStyles(node, styles) {
    if (!(node instanceof HTMLElement)) return;
    Object.assign(node.style, styles);
  }

  function renderCoachScheduleCalendar(coachName, coach) {
    if (!gridNode || !availabilityCalendar) return;

    const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
    const compactCalendar =
      viewportWidth <= 400
        ? {
            daysPerView: 7,
            hourSize: 38,
            columnMinWidth: 42,
            timeRailWidth: 52,
            headerHeight: 52,
          }
        : viewportWidth <= 560
          ? {
              daysPerView: 7,
              hourSize: 40,
              columnMinWidth: 46,
              timeRailWidth: 54,
              headerHeight: 54,
            }
          : {
              daysPerView: 7,
              hourSize: 52,
              columnMinWidth: 120,
              timeRailWidth: 86,
              headerHeight: 72,
            };

    availabilityCalendar.renderCalendar(gridNode, {
      coachName,
      coach,
      lookaheadDays: 28,
      daysPerView: compactCalendar.daysPerView,
      hourSize: compactCalendar.hourSize,
      columnMinWidth: compactCalendar.columnMinWidth,
      timeRailWidth: compactCalendar.timeRailWidth,
      headerHeight: compactCalendar.headerHeight,
      interactive: true,
      onSelect: ({ day, block }) => {
        window.location.href = buildCoachBookingHref({
          coach: coachName,
          day: day.label,
          time: block.label,
        });
      },
    });
  }

  function lockScrollPosition() {
    document.documentElement.classList.add("coach-schedule-open");
    document.body.classList.add("coach-schedule-open");
  }

  function unlockScrollPosition() {
    document.documentElement.classList.remove("coach-schedule-open");
    document.body.classList.remove("coach-schedule-open");
  }

  function closeModal() {
    if (!modal.classList.contains("open")) return;

    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    modal.style.display = "";
    modal.style.visibility = "";
    modal.style.opacity = "";
    unlockScrollPosition();

    if (activeTrigger instanceof HTMLElement) {
      activeTrigger.focus({ preventScroll: true });
    }
  }

  function openModalForCoach(coachName) {
    if (!titleNode || !copyNode || !gridNode || !noteNode || !profileLink) return;

    const displayCoachName = normalizeCoachDisplayName(coachName);
    const coach = availabilityData[displayCoachName] || availabilityData[coachName];
    if (!coach) return;
    const accent = availabilityCalendar?.getAccent(displayCoachName) || { color: "#fea12a", rgb: "254, 161, 42", ink: "#120800" };
    const availableBlocks = availabilityCalendar?.getAvailableBlockCount(coach, { lookaheadDays: 28, locale: "en-MY" }) || 0;

    modal.style.setProperty("--coach-schedule-accent", accent.color);
    modal.style.setProperty("--coach-schedule-accent-rgb", accent.rgb);
    modal.style.setProperty("--coach-schedule-accent-ink", accent.ink);
    modal.style.setProperty("--coach-schedule-accent-alt", accent.alt || accent.color);
    modal.style.setProperty("--coach-schedule-accent-alt-rgb", accent.altRgb || accent.rgb);
    modal.style.setProperty("--coach-schedule-spectrum", accent.spectrum || accent.alt || accent.color);
    modal.style.setProperty(
      "--coach-schedule-spectrum-rgb",
      accent.spectrumRgb || accent.altRgb || accent.rgb
    );

    titleNode.textContent = `${displayCoachName} availability`;
    copyNode.textContent = availableBlocks
      ? "Browse up to four weeks ahead, move week by week, and select an available block to continue."
      : `Published booking times are not available yet. Book a consult with ${displayCoachName.split(/\s+/u)[0]} and our team will coordinate the next step.`;
    const consultUrl = new URL(buildSiteHref("contact.html"));
    consultUrl.searchParams.set("service", "Coach Profile Inquiry");
    consultUrl.searchParams.set("coach", displayCoachName);
    profileLink.href = consultUrl.toString();
    profileLink.textContent = `Book a consult with ${displayCoachName.split(/\s+/u)[0]}`;
    renderCoachScheduleCalendar(displayCoachName, coach);

    noteNode.textContent = "";
    noteNode.hidden = true;

    setStyles(modal, {
      display: "grid",
      position: "fixed",
      inset: "0",
      zIndex: "15000",
      placeItems: "center",
      padding: window.innerWidth <= 480 ? "0.5rem" : "clamp(0.8rem, 2vw, 1.4rem)",
      overflow: "auto",
      background: "rgba(0, 0, 0, 0.92)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      visibility: "visible",
      opacity: "1",
    });
    setStyles(panelNode, {
      position: "relative",
      zIndex: "1",
      width: window.innerWidth <= 480 ? "calc(100vw - 0.8rem)" : "calc(100vw - 1.6rem)",
      maxWidth: "1220px",
      maxHeight: "88vh",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      margin: "auto",
      border: `1px solid rgba(${accent.rgb}, 0.24)`,
      borderRadius: window.innerWidth <= 480 ? "24px" : "28px",
      background: `radial-gradient(circle at 88% -12%, rgba(${accent.altRgb || accent.rgb}, 0.2), transparent 32%), radial-gradient(circle at 14% 14%, rgba(${accent.spectrumRgb || accent.rgb}, 0.12), transparent 26%), linear-gradient(180deg, rgba(26, 26, 26, 0.98), rgba(6, 6, 6, 0.995))`,
      boxShadow: `0 34px 80px rgba(0, 0, 0, 0.62), 0 0 0 1px rgba(${accent.rgb}, 0.08), 0 0 34px rgba(${accent.altRgb || accent.rgb}, 0.12)`,
      padding: window.innerWidth <= 480 ? "0.82rem" : "1.15rem",
      placeSelf: "center",
    });
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    lockScrollPosition();

    modal.scrollTop = 0;
    if (panelNode instanceof HTMLElement) {
      panelNode.scrollTop = 0;
    }

    window.requestAnimationFrame(() => {
      const focusTarget = modal.querySelector(".coach-schedule-close, .coach-schedule-slot");
      if (focusTarget instanceof HTMLElement) {
        focusTarget.focus({ preventScroll: true });
      }
    });

    if (!reduceMotion) {
      modal.scrollTop = 0;
    }
  }

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      activeTrigger = trigger;
      const coachName = trigger.getAttribute("data-coach-name") || "";
      openModalForCoach(coachName);
    });
  });

  closeNodes.forEach((node) => {
    node.addEventListener("click", closeModal);
  });

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("open")) {
      closeModal();
    }
  });

  window.__legacyCoachScheduleOpen = function openCoachSchedule(coachName) {
    activeTrigger = null;
    openModalForCoach(coachName);
    return false;
  };

  const initialCoach = new URLSearchParams(window.location.search).get("openCoach");
  if (initialCoach) {
    openModalForCoach(initialCoach);
  }

  hydrateLiveCoachAvailability();
}

installLocalPreviewCoachCard();
installCoachAvailabilityModal();

function installCoachBookingInquiryPage() {
  const bookingPage = document.querySelector("[data-coach-booking-page]");
  const bookingForm = document.getElementById("coach-booking-form");
  if (!bookingPage || !bookingForm) return;

  const params = new URLSearchParams(window.location.search);
  const coach = String(params.get("coach") || "").trim();
  const day = String(params.get("day") || "").trim();
  const time = String(params.get("time") || "").trim();
  const phone = bookingForm.dataset.whatsapp || "601139772862";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const chipCoach = bookingPage.querySelector("[data-booking-chip-coach]");
  const chipDay = bookingPage.querySelector("[data-booking-chip-day]");
  const chipTime = bookingPage.querySelector("[data-booking-chip-time]");
  const summaryCoach = bookingPage.querySelector("[data-booking-summary-coach]");
  const summaryDay = bookingPage.querySelector("[data-booking-summary-day]");
  const summaryTime = bookingPage.querySelector("[data-booking-summary-time]");
  const summaryNote = bookingPage.querySelector("[data-booking-summary-note]");
  const flowSection = bookingPage.querySelector("[data-booking-flow]");
  const heroSection = bookingPage.querySelector(".coach-booking-hero");
  const thankYouSection = document.getElementById("coach-booking-thankyou");
  const backButton = bookingPage.querySelector("[data-booking-back]");
  const continueLink = bookingPage.querySelector("[data-booking-continue]");
  const statusNode = bookingForm.querySelector("[data-booking-status]");
  const submitButton = bookingForm.querySelector("[data-booking-submit]");
  const hiddenCoach = bookingForm.querySelector("[name='coach']");
  const hiddenDay = bookingForm.querySelector("[name='day']");
  const hiddenTime = bookingForm.querySelector("[name='time']");
  const bookingDraft = installPublicFormDraft(bookingForm);

  function setText(node, label, value) {
    if (!node) return;
    node.textContent = value ? `${label}${value}` : `${label}Not selected`;
  }

  setText(chipCoach, "Coach: ", coach);
  setText(chipDay, "Day: ", day);
  setText(chipTime, "Time: ", time);

  if (summaryCoach) summaryCoach.textContent = coach || "Not selected";
  if (summaryDay) summaryDay.textContent = day || "Not selected";
  if (summaryTime) summaryTime.textContent = time || "Not selected";

  if (hiddenCoach instanceof HTMLInputElement) hiddenCoach.value = coach;
  if (hiddenDay instanceof HTMLInputElement) hiddenDay.value = day;
  if (hiddenTime instanceof HTMLInputElement) hiddenTime.value = time;

  const hasValidSelection = Boolean(coach && day && time);
  if (!hasValidSelection) {
    if (summaryNote) {
      summaryNote.textContent = "This page needs a selected coach, day, and time. Please go back to Meet the Team and choose a slot first.";
    }
    if (submitButton instanceof HTMLButtonElement) {
      submitButton.disabled = true;
    }
    if (statusNode) {
      statusNode.textContent = "Go back to the Meet the Team page and select a coach slot before sending this inquiry.";
    }
  }

  if (backButton instanceof HTMLButtonElement) {
    backButton.addEventListener("click", () => {
      if (window.history.length > 1) {
        window.history.back();
        return;
      }

      window.location.href = buildSiteHref("coaches.html");
    });
  }

  bookingForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!hasValidSelection) return;
    if (!bookingForm.reportValidity()) {
      return;
    }
    if (submitButton instanceof HTMLButtonElement && submitButton.disabled) {
      return;
    }

    const releaseSubmit = setSubmitButtonBusy(submitButton, "Sending Inquiry...");

    try {
      const formData = new FormData(bookingForm);
      const name = String(formData.get("name") || "").trim();
      const clientPhone = String(formData.get("phone") || "").trim();
      const goal = String(formData.get("goal") || "").trim();
      const details = String(formData.get("details") || "").trim();
      const lines = [
        "Good day ! I've filled in your form from the website below are my details.",
        "",
        `Name: ${name || "Not provided"}`,
        `Phone Number: ${clientPhone || "Not provided"}`,
        `Preferred Coach: ${coach || "Not provided"}`,
        `Preferred Day: ${day || "Not provided"}`,
        `Preferred Timing: ${time || "Not provided"}`,
        `Primary Goal: ${goal || "Not provided"}`,
        `Additional Details: ${details || "Not provided"}`,
      ];
      const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(lines.join("\n"))}`;
      const popup = window.open("", "_blank", "noopener,noreferrer");
      const result = await captureLead({
        fullName: name,
        phone: clientPhone,
        source: "Coach Booking Inquiry",
        channel: "coach_booking_whatsapp_form",
        pageTitle: document.title,
        pagePath: window.location.pathname,
        service: "Coach Booking Inquiry",
        goal,
        preferredCoach: coach,
        preferredDay: day,
        preferredTime: time,
        details,
      });
      const captureMessage = result.existing
        ? "The lead record was updated in the CRM."
        : "The inquiry was added to the CRM.";
      const routingMessage = result.assignedCoachName
        ? ` It was routed to ${result.assignedCoachName}.`
        : "";
      bookingDraft.clear();

      const deliveryMode = openWhatsAppDraft(whatsappUrl, popup);

      if (continueLink instanceof HTMLAnchorElement) {
        continueLink.href = whatsappUrl;
      }

      if (statusNode) {
        statusNode.textContent = deliveryMode === "popup"
          ? `${captureMessage}${routingMessage} WhatsApp opened in a new tab.`
          : deliveryMode === "redirect"
            ? `${captureMessage}${routingMessage} Redirecting you to WhatsApp now.`
            : `${captureMessage}${routingMessage} If WhatsApp did not open automatically, use Open WhatsApp after the thank-you message.`;
        statusNode.classList.remove("error");
        statusNode.classList.add("success");
      }

      if (heroSection instanceof HTMLElement) {
        heroSection.hidden = true;
      }

      if (flowSection instanceof HTMLElement) {
        flowSection.hidden = true;
      }

      if (thankYouSection instanceof HTMLElement) {
        thankYouSection.hidden = false;
        thankYouSection.classList.add("in-view");
        thankYouSection.scrollIntoView({
          behavior: reduceMotion ? "auto" : "smooth",
          block: "start",
        });
      }
    } catch (error) {
      const formData = new FormData(bookingForm);
      const lines = [
        "Good day ! I've filled in your form from the website below are my details.",
        "",
        `Name: ${String(formData.get("name") || "").trim() || "Not provided"}`,
        `Phone Number: ${String(formData.get("phone") || "").trim() || "Not provided"}`,
        `Preferred Coach: ${coach || "Not provided"}`,
        `Preferred Day: ${day || "Not provided"}`,
        `Preferred Timing: ${time || "Not provided"}`,
        `Primary Goal: ${String(formData.get("goal") || "").trim() || "Not provided"}`,
        `Additional Details: ${String(formData.get("details") || "").trim() || "Not provided"}`,
      ];
      const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(lines.join("\n"))}`;
      const popup = window.open("", "_blank", "noopener,noreferrer");
      bookingDraft.clear();

      const deliveryMode = openWhatsAppDraft(whatsappUrl, popup);

      if (continueLink instanceof HTMLAnchorElement) {
        continueLink.href = whatsappUrl;
      }

      if (statusNode) {
        statusNode.textContent = deliveryMode === "popup"
          ? `WhatsApp opened in a new tab, but the CRM copy could not be saved automatically. ${error?.message || ""}`.trim()
          : deliveryMode === "redirect"
            ? `Redirecting you to WhatsApp now, but the CRM copy could not be saved automatically. ${error?.message || ""}`.trim()
            : `Use Open WhatsApp below. The CRM copy could not be saved automatically. ${error?.message || ""}`.trim();
        statusNode.classList.remove("success");
        statusNode.classList.add("error");
      }
    } finally {
      releaseSubmit();
    }
  });
}

installCoachBookingInquiryPage();

const yearNodes = document.querySelectorAll("[data-year]");
yearNodes.forEach((node) => {
  node.textContent = String(new Date().getFullYear());
});

function renderLegalFooterMarkup(hasContactAnchor) {
  const contactAnchorMarkup = hasContactAnchor ? '<div id="contact"></div>' : "";

  return `
    ${contactAnchorMarkup}
    <p class="site-footer-copy">&copy; 2026 Legacy Coaching Sdn Bhd (1537251-P). All rights reserved.</p>
    <nav class="footer-nav footer-nav--legal" aria-label="Legal navigation">
      <a href="${buildSiteHref("privacy-policy.html")}">Privacy Policy</a>
      <a href="${buildSiteHref("terms-and-conditions.html")}">Terms &amp; Conditions</a>
    </nav>
  `;
}

function installLegalFooter() {
  let footers = Array.from(document.querySelectorAll(".site-footer"));

  if (!footers.length && document.body) {
    const footer = document.createElement("footer");
    footer.className = "site-footer";
    document.body.append(footer);
    footers = [footer];
  }

  footers.forEach((footer) => {
    const hasContactAnchor = Boolean(footer.querySelector("#contact"));
    footer.innerHTML = renderLegalFooterMarkup(hasContactAnchor);
    footer.classList.add("site-footer--legal");
  });
}

installLegalFooter();

function installTestimonialSlider() {
  const slider = document.querySelector("[data-testimonial-slider]");
  if (!slider) return;

  const track = slider.querySelector("[data-testimonial-track]");
  const slides = Array.from(slider.querySelectorAll("[data-testimonial-slide]"));
  const dotsHost = slider.querySelector("[data-testimonial-dots]");
  const prevButton = slider.querySelector("[data-testimonial-prev]");
  const nextButton = slider.querySelector("[data-testimonial-next]");

  if (!track || !slides.length || !dotsHost || !prevButton || !nextButton) return;

  let activeIndex = 0;
  let autoAdvanceId = null;

  function render() {
    track.style.transform = `translateX(-${activeIndex * 100}%)`;

    slides.forEach((slide, index) => {
      const isActive = index === activeIndex;
      slide.classList.toggle("is-active", isActive);
      slide.setAttribute("aria-hidden", isActive ? "false" : "true");
    });

    dotsHost.querySelectorAll(".client-testimonial-dot").forEach((dot, index) => {
      const isActive = index === activeIndex;
      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-current", isActive ? "true" : "false");
    });
  }

  function goTo(index) {
    activeIndex = (index + slides.length) % slides.length;
    render();
  }

  function stopAutoAdvance() {
    if (!autoAdvanceId) return;
    window.clearInterval(autoAdvanceId);
    autoAdvanceId = null;
  }

  function startAutoAdvance() {
    stopAutoAdvance();
    autoAdvanceId = window.setInterval(() => {
      goTo(activeIndex + 1);
    }, 7000);
  }

  slides.forEach((slide, index) => {
    slide.setAttribute("aria-hidden", index === 0 ? "false" : "true");
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "client-testimonial-dot";
    dot.setAttribute("aria-label", `Show testimonial ${index + 1}`);
    dot.addEventListener("click", () => {
      goTo(index);
      startAutoAdvance();
    });
    dotsHost.append(dot);
  });

  prevButton.addEventListener("click", () => {
    goTo(activeIndex - 1);
    startAutoAdvance();
  });

  nextButton.addEventListener("click", () => {
    goTo(activeIndex + 1);
    startAutoAdvance();
  });

  slider.addEventListener("mouseenter", stopAutoAdvance);
  slider.addEventListener("mouseleave", startAutoAdvance);
  slider.addEventListener("focusin", stopAutoAdvance);
  slider.addEventListener("focusout", (event) => {
    if (slider.contains(event.relatedTarget)) return;
    startAutoAdvance();
  });

  render();
  startAutoAdvance();
}

installTestimonialSlider();

function installFaqMoreToggles() {
  const groups = Array.from(document.querySelectorAll(".faq-more-group"));
  if (!groups.length) return;

  groups.forEach((group) => {
    const toggle = group.querySelector(".faq-more-toggle");
    if (!toggle) return;

    const closedLabel = toggle.dataset.closedLabel || "See More..";
    const openLabel = toggle.dataset.openLabel || "See Less..";

    function renderLabel() {
      toggle.textContent = group.open ? openLabel : closedLabel;
      toggle.setAttribute("aria-expanded", String(group.open));
    }

    renderLabel();
    group.addEventListener("toggle", renderLabel);
  });
}

installFaqMoreToggles();

function installStoryGridToggles() {
  const grids = Array.from(document.querySelectorAll("[data-story-grid]"));
  if (!grids.length) return;

  grids.forEach((grid) => {
    const toggle = grid.parentElement?.querySelector("[data-story-grid-toggle]");
    if (!(toggle instanceof HTMLElement)) return;

    const collapsedCount = Number(grid.getAttribute("data-collapsed-count") || 9);
    const closedLabel = toggle.dataset.closedLabel || "See More..";
    const openLabel = toggle.dataset.openLabel || "See Less..";
    let expanded = false;

    function render() {
      const cards = Array.from(grid.querySelectorAll("[data-category]"));
      const visibleCards = cards.filter((card) => !card.classList.contains("is-hidden-by-filter"));

      cards.forEach((card) => card.classList.remove("is-hidden-by-limit"));

      if (!expanded) {
        visibleCards.slice(collapsedCount).forEach((card) => card.classList.add("is-hidden-by-limit"));
      }

      const shouldShowToggle = visibleCards.length > collapsedCount;
      toggle.classList.toggle("is-hidden", !shouldShowToggle);
      toggle.textContent = expanded ? openLabel : closedLabel;
      toggle.setAttribute("aria-expanded", String(expanded));
    }

    toggle.addEventListener("click", () => {
      expanded = !expanded;
      render();
    });

    grid.addEventListener("legacy:filterchange", () => {
      expanded = false;
      render();
    });

    render();
  });
}

installStoryGridToggles();

const coachGallerySets = {
  "coach-detail-page--luke": [
    ["../assets/team-optimized/luke-lango-960.jpg", "Luke Lango portrait at LEGACY+", "Luke in the room where most client progression work gets built."],
    ["../assets/website-photos/Luke.jpg", "Luke training on the LEGACY+ floor", "Luke working through a set inside the same coaching floor clients use."],
    ["../assets/website-photos/optimized/Gym.jpg", "Open training floor at LEGACY+", "A wider look at the LEGACY+ floor, benches, and coaching lanes."],
    ["../assets/website-photos/optimized/Legacy%20platform%202.jpg", "LEGACY+ platform detail", "The kind of clean strength setup Luke builds session flow around."],
  ],
  "coach-detail-page--caleb": [
    ["../assets/team-optimized/caleb-public.jpeg", "Caleb coach portrait", "Caleb's live coach profile now opens with his full portrait on the LEGACY+ team page."],
    ["../assets/team-optimized/gym-floor-960.jpg", "Open coaching floor at LEGACY+", "The kind of clean training space Caleb is stepping into on the LEGACY+ floor."],
    ["../assets/team-optimized/coach-support-960.jpg", "Coach support moment inside LEGACY+", "A support-focused training moment that fits Caleb's calmer coaching lens."],
    ["../assets/team-optimized/coach-client-960.jpg", "Client coaching support inside LEGACY+", "A client-facing coaching moment built around clarity, support, and repeatable progress."],
  ],
  "coach-detail-page--amree": [
    ["../assets/team-optimized/amree-ariff-960.jpg", "Amree Ariff portrait", "Amree's coaching page opens with his full LEGACY+ portrait."],
    ["../assets/website-photos/legacy-training-lane.jpg", "Branded training lane at LEGACY+", "The turf lane and movement runway Amree uses for cleaner session flow."],
    ["../assets/website-photos/optimized/Squat%20rack.jpg", "Strength setup inside LEGACY+", "Rack and plate detail from the strength side of the floor."],
    ["../assets/website-photos/legacy-machine-bay.jpg", "Machine and cable bay at LEGACY+", "A cleaner view of the machine side of the gym for guided work."],
  ],
  "coach-detail-page--jenita": [
    ["../assets/team-optimized/jenita-jeune-960.jpg", "Jenita Jeune portrait", "Jenita's profile portrait inside the LEGACY+ studio."],
    ["../assets/website-photos/legacy-machine-bay.jpg", "Machine and cable bay inside LEGACY+", "A quieter view of the guided strength stations Jenita can coach around."],
    ["../assets/website-photos/legacy-session-floor.jpg", "Coaching floor in active use at LEGACY+", "The open floor where sessions stay calm, simple, and repeatable."],
    ["../assets/website-photos/optimized/Legacy%20platform.jpg", "LEGACY+ strength platform", "The strength platform area used for progression work and foundations."],
  ],
  "coach-detail-page--kylie": [
    ["../assets/team-optimized/kylie-denis-960.jpg", "Kylie Denis portrait", "Kylie's coach portrait inside the studio."],
    ["../assets/website-photos/optimized/Turf%202.jpg", "Kylie training on the LEGACY+ floor", "A more personal training-floor moment with the LEGACY+ room behind her."],
    ["../assets/website-photos/optimized/Gym.jpg", "Open training floor at LEGACY+", "A wider floor view that matches Kylie's calmer coaching environment."],
    ["../assets/website-photos/legacy-machine-bay.jpg", "Machine and cable bay inside LEGACY+", "The guided strength side of the room for steady, approachable sessions."],
  ],
  "coach-detail-page--shobana": [
    ["../assets/team-optimized/shobana-960.jpg", "Shobana portrait", "Shobana's coach portrait inside the LEGACY+ gym."],
    ["../assets/website-photos/Shobana%201.jpg", "Shobana training on the LEGACY+ floor", "Shobana mid-session with the floor and cable setup around her."],
    ["../assets/website-photos/Shobana%202.jpg", "Shobana preparing for a set", "A closer look at Shobana getting ready to work."],
    ["../assets/website-photos/optimized/Legacy%20platform%202.jpg", "LEGACY+ platform detail", "Strength platform detail that fits the sharper edge of Shobana's page."],
  ],
};

function installCoachSliders() {
  const sliders = document.querySelectorAll("[data-coach-slider]");
  if (!sliders.length) return;

  const activeGallerySet =
    Object.entries(coachGallerySets).find(([className]) => document.body.classList.contains(className))?.[1] || null;

  sliders.forEach((slider) => {
    const track = slider.querySelector("[data-coach-track]");
    const viewport = slider.querySelector(".coach-gallery-viewport");
    const controls = slider.querySelector(".coach-gallery-controls");
    const dotsHost = slider.querySelector("[data-coach-dots]");
    let featuredHost = slider.querySelector("[data-coach-featured]");

    if (!track || !dotsHost || !viewport || !controls) return;

    if (!featuredHost) {
      featuredHost = document.createElement("div");
      featuredHost.className = "coach-gallery-featured";
      featuredHost.dataset.coachFeatured = "";
      slider.insertBefore(featuredHost, slider.querySelector(".coach-gallery-controls"));
    }

    let isInitialized = false;

    function getOrientation(slide) {
      const image = slide.querySelector(".coach-gallery-photo");
      const width = Number(image?.getAttribute("width")) || image?.naturalWidth || 0;
      const height = Number(image?.getAttribute("height")) || image?.naturalHeight || 0;

      if (!width || !height) return "landscape";
      if (height > width * 1.08) return "portrait";
      if (width > height * 1.08) return "landscape";
      return "square";
    }

    function syncLayout() {
      if (window.innerWidth < 980) {
        slider.style.removeProperty("--coach-gallery-feature-height");
        return;
      }

      const activeSlide = slider.querySelector(".coach-gallery-slide.is-active");
      if (activeSlide && getOrientation(activeSlide) === "portrait") {
        slider.style.removeProperty("--coach-gallery-feature-height");
        return;
      }

      const featuredHeight = Math.round(featuredHost.getBoundingClientRect().height);
      const controlsHeight = Math.round(controls.getBoundingClientRect().height);
      const sliderStyles = window.getComputedStyle(slider);
      const stackGap = parseFloat(sliderStyles.rowGap || sliderStyles.gap || "0") || 0;
      const frameHeight = Math.max(260, featuredHeight - controlsHeight - stackGap);

      slider.style.setProperty("--coach-gallery-feature-height", `${frameHeight}px`);
    }

    function initializeSelector() {
      if (isInitialized) return;
      isInitialized = true;

      const slides = Array.from(slider.querySelectorAll("[data-coach-slide]"));
      if (!slides.length) return;
      const isSingleGallery = slides.length <= 1;

      slider.classList.toggle("is-single", isSingleGallery);

      let activeIndex = 0;

      function render() {
        slides.forEach((slide, index) => {
          const isActive = index === activeIndex;
          slide.classList.toggle("is-active", isActive);
          slide.setAttribute("aria-hidden", isActive ? "false" : "true");
        });

        slider.classList.remove("is-portrait", "is-landscape", "is-square");
        slider.classList.add(`is-${getOrientation(slides[activeIndex])}`);

        dotsHost.querySelectorAll(".coach-gallery-dot").forEach((dot, index) => {
          const isActive = index === activeIndex;
          dot.classList.toggle("is-active", isActive);
          dot.setAttribute("aria-current", isActive ? "true" : "false");
        });

        featuredHost.querySelectorAll(".coach-gallery-featured-item").forEach((item) => {
          const isActive = Number(item.dataset.index) === activeIndex;
          item.classList.toggle("is-active", isActive);
          item.setAttribute("aria-current", isActive ? "true" : "false");
        });

        window.requestAnimationFrame(syncLayout);
      }

      function goTo(index) {
        activeIndex = (index + slides.length) % slides.length;
        render();
      }

      dotsHost.innerHTML = "";
      featuredHost.innerHTML = "";

      if (!isSingleGallery) {
        slides.forEach((slide, index) => {
          slide.setAttribute("aria-hidden", index === 0 ? "false" : "true");
          const previewImage = slide.querySelector(".coach-gallery-photo");
          const dot = document.createElement("button");
          dot.type = "button";
          dot.className = "coach-gallery-dot";
          dot.setAttribute(
            "aria-label",
            previewImage?.getAttribute("alt") || `Show coach gallery image ${index + 1}`,
          );
          if (previewImage) {
            const thumb = previewImage.cloneNode(false);
            thumb.alt = "";
            thumb.loading = "eager";
            thumb.decoding = "async";
            dot.append(thumb);
          }
          dot.addEventListener("click", () => {
            goTo(index);
          });
          dotsHost.append(dot);
        });

        slides.slice(0, 4).forEach((slide, index) => {
          const previewImage = slide.querySelector(".coach-gallery-photo");
          const item = document.createElement("button");
          item.type = "button";
          item.className = "coach-gallery-featured-item";
          item.dataset.index = String(index);
          item.setAttribute(
            "aria-label",
            previewImage?.getAttribute("alt") || `Show featured coach image ${index + 1}`,
          );
          if (previewImage) {
            const thumb = previewImage.cloneNode(false);
            thumb.alt = "";
            thumb.loading = "eager";
            thumb.decoding = "async";
            item.append(thumb);
          }
          item.addEventListener("click", () => {
            goTo(index);
          });
          featuredHost.append(item);
        });
      } else {
        for (let index = 0; index < 3; index += 1) {
          const item = document.createElement("div");
          item.className = "coach-gallery-featured-item coach-gallery-featured-item--placeholder";
          item.setAttribute("aria-hidden", "true");
          const placeholder = document.createElement("span");
          placeholder.textContent = "Photo slot";
          item.append(placeholder);
          featuredHost.append(item);
        }
      }

      render();

      const scheduleSync = () => {
        window.requestAnimationFrame(syncLayout);
      };

      window.addEventListener("resize", scheduleSync);
      window.addEventListener("load", scheduleSync, { once: true });
    }

    const existingSlides = track.querySelectorAll("[data-coach-slide]");

    if (activeGallerySet?.length && !existingSlides.length) {
      const firstPreview = new Image();
      const renderGeneratedGallery = () => {
        track.innerHTML = activeGallerySet
          .map(
            ([src, alt, caption], index) => `
              <figure class="coach-gallery-slide" data-coach-slide>
                <div class="coach-gallery-frame">
                  <img
                    class="coach-gallery-photo"
                    src="${src}"
                    alt="${alt}"
                    width="1024"
                    height="1536"
                    loading="${index === 0 ? "eager" : "lazy"}"
                    fetchpriority="${index === 0 ? "high" : "auto"}"
                    decoding="async"
                  />
                </div>
              </figure>
            `,
          )
          .join("");
        initializeSelector();
      };

      firstPreview.onload = renderGeneratedGallery;
      firstPreview.onerror = renderGeneratedGallery;
      firstPreview.src = activeGallerySet[0][0];
      return;
    }

    initializeSelector();
  });
}

installCoachSliders();

function installFacilityGalleries() {
  const galleries = document.querySelectorAll("[data-facility-gallery]");
  if (!galleries.length) return;

  galleries.forEach((gallery) => {
    const featuredImage = gallery.querySelector("[data-facility-feature-image]");
    const featuredTitle = gallery.querySelector("[data-facility-feature-title]");
    const featuredCaption = gallery.querySelector("[data-facility-feature-caption]");
    const thumbs = Array.from(gallery.querySelectorAll("[data-facility-thumb]"));

    if (!featuredImage || !featuredTitle || !featuredCaption || !thumbs.length) return;

    function setActive(index) {
      const nextThumb = thumbs[index];
      if (!nextThumb) return;

      thumbs.forEach((thumb, thumbIndex) => {
        const isActive = thumbIndex === index;
        thumb.classList.toggle("is-active", isActive);
        thumb.setAttribute("aria-pressed", isActive ? "true" : "false");
      });

      featuredImage.src = nextThumb.dataset.facilitySrc || featuredImage.src;
      featuredImage.alt = nextThumb.dataset.facilityAlt || featuredImage.alt;
      featuredTitle.textContent = nextThumb.dataset.facilityTitle || featuredTitle.textContent;
      featuredCaption.textContent = nextThumb.dataset.facilityCaption || featuredCaption.textContent;
    }

    thumbs.forEach((thumb, index) => {
      thumb.setAttribute("aria-pressed", thumb.classList.contains("is-active") ? "true" : "false");
      thumb.addEventListener("click", () => {
        setActive(index);
      });
    });

    const initialIndex = thumbs.findIndex((thumb) => thumb.classList.contains("is-active"));
    setActive(initialIndex >= 0 ? initialIndex : 0);
  });
}

installFacilityGalleries();

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function parseEmailList(rawList) {
  return String(rawList || "")
    .split(",")
    .map((email) => normalizeEmail(email))
    .filter(Boolean);
}

const liveDashboardMode = document.body?.dataset?.liveDashboard || "";

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
if (adminShell && liveDashboardMode !== "admin") {
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
if (clientBookingForm && liveDashboardMode !== "client") {
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
if (coachNoteForm && liveDashboardMode !== "coach") {
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

const REMEMBERED_LOGIN_KEY = "legacy-remembered-logins:v1";

function readRememberedLogins() {
  try {
    const raw = window.localStorage.getItem(REMEMBERED_LOGIN_KEY);
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (_) {
    return {};
  }
}

function writeRememberedLogins(value) {
  try {
    const payload = value && typeof value === "object" ? value : {};
    if (Object.keys(payload).length) {
      window.localStorage.setItem(REMEMBERED_LOGIN_KEY, JSON.stringify(payload));
    } else {
      window.localStorage.removeItem(REMEMBERED_LOGIN_KEY);
    }
  } catch (_) {
    // Ignore storage failures.
  }
}

function getRememberedLogin(role) {
  const store = readRememberedLogins();
  const remembered = store?.[role];
  const email = normalizeEmail(remembered?.email || "");
  return {
    email,
    checked: Boolean(email),
  };
}

function updateRememberedLogin(role, email, shouldRemember) {
  const store = readRememberedLogins();
  if (shouldRemember && email) {
    store[role] = {
      email,
      savedAt: Date.now(),
    };
    store.lastRole = role;
  } else {
    delete store[role];
    if (store.lastRole === role) {
      delete store.lastRole;
    }
  }

  writeRememberedLogins(store);
}

const clientLoginForm = document.getElementById("client-login-form");
if (clientLoginForm) {
  const feedback = document.getElementById("client-login-feedback");
  const emailField = clientLoginForm.elements.namedItem("clientEmail");
  const rememberField = clientLoginForm.elements.namedItem("clientRememberMe");
  const rememberedClient = getRememberedLogin("client");

  if (emailField instanceof HTMLInputElement && rememberedClient.email) {
    emailField.value = rememberedClient.email;
  }

  if (rememberField instanceof HTMLInputElement) {
    rememberField.checked = rememberedClient.checked;
  }

  clientLoginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(clientLoginForm);
    const email = normalizeEmail(formData.get("clientEmail"));
    const password = String(formData.get("clientPassword") || "").trim();
    const rememberMe = formData.get("clientRememberMe") === "on";

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

    const target = new URL(clientLoginForm.dataset.clientPath || "../client-dashboard.html", window.location.href);
    const currentParams = new URLSearchParams(window.location.search);

    ["intent", "package"].forEach((key) => {
      const value = currentParams.get(key);
      if (value) {
        target.searchParams.set(key, value);
      }
    });

    if (window.legacyAuth && window.legacyAuth.isConfigured && window.legacyAuth.isConfigured()) {
      const result = await window.legacyAuth.loginWithRole({
        expectedRole: "client",
        email,
        password,
      });

      if (!result.ok) {
        if (feedback) {
          feedback.textContent = result.error || "Login failed.";
          feedback.classList.remove("success");
          feedback.classList.add("error");
        }
        return;
      }

      target.pathname = new URL(result.portalPath, window.location.href).pathname;
    }

    updateRememberedLogin("client", email, rememberMe);
    window.location.href = target.toString();
  });
}

const coachLoginForm = document.getElementById("coach-login-form");
if (coachLoginForm) {
  const feedback = document.getElementById("coach-login-feedback");
  const emailField = coachLoginForm.elements.namedItem("coachEmail");
  const rememberField = coachLoginForm.elements.namedItem("coachRememberMe");
  const rememberedCoach = getRememberedLogin("coach");

  if (emailField instanceof HTMLInputElement && rememberedCoach.email) {
    emailField.value = rememberedCoach.email;
  }

  if (rememberField instanceof HTMLInputElement) {
    rememberField.checked = rememberedCoach.checked;
  }

  coachLoginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(coachLoginForm);
    const email = normalizeEmail(formData.get("coachEmail"));
    const password = String(formData.get("coachPassword") || "").trim();
    const rememberMe = formData.get("coachRememberMe") === "on";

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

    if (window.legacyAuth && window.legacyAuth.isConfigured && window.legacyAuth.isConfigured()) {
      const result = await window.legacyAuth.loginWithRole({
        expectedRole: "coach",
        email,
        password,
      });

      if (!result.ok) {
        if (feedback) {
          feedback.textContent = result.error || "Login failed.";
          feedback.classList.remove("success");
          feedback.classList.add("error");
        }
        return;
      }

      if (feedback) {
        feedback.textContent =
          result.role === "super_admin"
            ? "Super admin login successful. Opening admin dashboard..."
            : "Coach login successful. Opening coach dashboard...";
        feedback.classList.remove("error");
        feedback.classList.add("success");
      }

      updateRememberedLogin("coach", email, rememberMe);
      window.location.href = result.portalPath;
      return;
    }

    if (email === adminEmail) {
      if (feedback) {
        feedback.textContent = "Admin email detected. Opening admin dashboard...";
        feedback.classList.remove("error");
        feedback.classList.add("success");
      }
      updateRememberedLogin("coach", email, rememberMe);
      window.location.href = `${adminPath}?admin=${encodeURIComponent(email)}`;
      return;
    }

    if (feedback) {
      feedback.textContent = "Coach login successful. Opening coach dashboard...";
      feedback.classList.remove("error");
      feedback.classList.add("success");
    }
    updateRememberedLogin("coach", email, rememberMe);
    window.location.href = coachPath;
  });
}

const passwordResetForm = document.getElementById("account-password-reset-form");
if (passwordResetForm) {
  const resetFeedback = document.getElementById("account-password-reset-feedback");

  passwordResetForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(passwordResetForm);
    const email = String(formData.get("resetEmail") || "").trim();

    if (!email) {
      if (resetFeedback) {
        resetFeedback.textContent = "Enter the account email you want to reset.";
        resetFeedback.classList.remove("success");
        resetFeedback.classList.add("error");
      }
      return;
    }

    if (!window.legacyAuth || !window.legacyAuth.requestPasswordReset) {
      if (resetFeedback) {
        resetFeedback.textContent = "Password reset is not available right now.";
        resetFeedback.classList.remove("success");
        resetFeedback.classList.add("error");
      }
      return;
    }

    if (resetFeedback) {
      resetFeedback.textContent = "Sending password reset email...";
      resetFeedback.classList.remove("error");
      resetFeedback.classList.add("success");
    }

    const redirectTo = new URL("./reset-password.html", window.location.href).toString();
    const result = await window.legacyAuth.requestPasswordReset(email, { redirectTo });

    if (!result.ok) {
      if (resetFeedback) {
        resetFeedback.textContent = result.error || "Unable to send the password reset email.";
        resetFeedback.classList.remove("success");
        resetFeedback.classList.add("error");
      }
      return;
    }

    if (resetFeedback) {
      resetFeedback.textContent =
        result.message || "If that email exists, a password reset link has been sent.";
      resetFeedback.classList.remove("error");
      resetFeedback.classList.add("success");
    }

    passwordResetForm.reset();
  });
}

const passwordUpdateForm = document.getElementById("account-password-update-form");
if (passwordUpdateForm) {
  const updateFeedback = document.getElementById("account-password-update-feedback");

  passwordUpdateForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(passwordUpdateForm);
    const newPassword = String(formData.get("newPassword") || "").trim();
    const confirmPassword = String(formData.get("confirmPassword") || "").trim();

    if (!newPassword || !confirmPassword) {
      if (updateFeedback) {
        updateFeedback.textContent = "Enter and confirm your new password.";
        updateFeedback.classList.remove("success");
        updateFeedback.classList.add("error");
      }
      return;
    }

    if (newPassword !== confirmPassword) {
      if (updateFeedback) {
        updateFeedback.textContent = "The password confirmation does not match.";
        updateFeedback.classList.remove("success");
        updateFeedback.classList.add("error");
      }
      return;
    }

    if (!window.legacyAuth || !window.legacyAuth.updatePassword) {
      if (updateFeedback) {
        updateFeedback.textContent = "Password recovery is not available right now.";
        updateFeedback.classList.remove("success");
        updateFeedback.classList.add("error");
      }
      return;
    }

    if (updateFeedback) {
      updateFeedback.textContent = "Saving your new password...";
      updateFeedback.classList.remove("error");
      updateFeedback.classList.add("success");
    }

    const result = await window.legacyAuth.updatePassword(newPassword);
    if (!result.ok) {
      if (updateFeedback) {
        updateFeedback.textContent = result.error || "Unable to update the password.";
        updateFeedback.classList.remove("success");
        updateFeedback.classList.add("error");
      }
      return;
    }

    if (updateFeedback) {
      updateFeedback.textContent = "Password updated. You can now sign in with your new password.";
      updateFeedback.classList.remove("error");
      updateFeedback.classList.add("success");
    }

    passwordUpdateForm.reset();
  });
}

function installAccountPageFlow() {
  const accountPage = document.querySelector("[data-account-page]");
  const loginSection = document.getElementById("account-login-section");
  if (!accountPage || !loginSection) return;

  const params = new URLSearchParams(window.location.search);
  const mainNode = accountPage.closest("main");
  const roleButtons = Array.from(accountPage.querySelectorAll("[data-account-role]"));
  const rolePanes = Array.from(document.querySelectorAll("[data-role-panel]"));
  const registrationModal = document.getElementById("account-registration-modal");
  const accountEntryNoteCopy = accountPage.querySelector(".account-entry-note p");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const registrationHeadKicker = document.querySelector("[data-registration-kicker]");
  const registrationHeadTitle = document.querySelector("[data-registration-title]");
  const registrationHeadCopy = document.querySelector("[data-registration-copy]");
  const clientPreferredCoachSelect = document.getElementById("client-preferred-coach");
  const clientPreferredCoachStatus = document.querySelector("[data-coach-select-status]");
  const openWaiverButtons = Array.from(document.querySelectorAll("[data-open-client-waiver]"));
  const REGISTRATION_DRAFT_KEY = "legacy-account-registration-draft:v1";
  const WAIVER_STATE_KEY = "legacy-client-waiver-state:v1";

  const registrationContent = {
    client: {
      kicker: "New Client Registration",
      title: "Complete your client particulars",
      copy:
        "Fill in your client details, complete the signed waiver, and then enter the one-time activation code sent to your email.",
      success:
        "Client account created. Signing you into the client portal...",
    },
    coach: {
      kicker: "New Coach Registration",
      title: "Complete your coach particulars",
      copy:
        "Fill in your details, then enter the activation code sent to your email by a LEGACY+ admin to unlock coach registration.",
      success:
        "Coach registration submitted. Super admin review is still required before coach access becomes active.",
    },
  };

  function escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function normalizePhone(value) {
    return String(value || "").trim().replace(/[^\d+]/gu, "");
  }

  function readSessionJson(key) {
    try {
      const raw = window.sessionStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  }

  function writeSessionJson(key, value) {
    try {
      if (value) {
        window.sessionStorage.setItem(key, JSON.stringify(value));
      } else {
        window.sessionStorage.removeItem(key);
      }
    } catch (_) {
      // Ignore storage issues.
    }
  }

  function getRegistrationForm(role) {
    return registrationForms.find((form) => form.dataset.registrationForm === role) || null;
  }

  function serializeForm(form) {
    const snapshot = {};
    if (!(form instanceof HTMLFormElement)) {
      return snapshot;
    }

    const formData = new FormData(form);
    formData.forEach((value, key) => {
      snapshot[key] = String(value || "");
    });
    return snapshot;
  }

  function hydrateForm(form, values) {
    if (!(form instanceof HTMLFormElement) || !values || typeof values !== "object") {
      return;
    }

    Object.entries(values).forEach(([name, value]) => {
      const field = form.elements.namedItem(name);
      if (!field) {
        return;
      }

      if (field instanceof RadioNodeList) {
        const candidate = Array.from(field).find((item) => item instanceof HTMLInputElement && item.value === String(value));
        if (candidate instanceof HTMLInputElement) {
          candidate.checked = true;
        }
        return;
      }

      if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement) {
        if (field.type === "checkbox") {
          field.checked = Boolean(value);
        } else {
          field.value = String(value || "");
        }
      }
    });
  }

  async function populateActiveCoachOptions(selectedCoachId = "") {
    if (!(clientPreferredCoachSelect instanceof HTMLSelectElement)) {
      return;
    }

    clientPreferredCoachSelect.disabled = true;
    clientPreferredCoachSelect.innerHTML = '<option value="">Loading active coaches...</option>';
    if (clientPreferredCoachStatus instanceof HTMLElement) {
      clientPreferredCoachStatus.hidden = false;
      clientPreferredCoachStatus.textContent = "Loading active coaches...";
      clientPreferredCoachStatus.classList.remove("error");
    }

    try {
      const response = await window.fetch("/.netlify/functions/public-active-coaches");
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error || "Unable to load the active coach roster.");
      }

      const coaches = Array.isArray(payload.coaches) ? payload.coaches : [];
      clientPreferredCoachSelect.innerHTML = [
        '<option value="">Select coach</option>',
        ...coaches.map(
          (coach) =>
            `<option value="${escapeHtml(coach.id)}"${coach.id === selectedCoachId ? " selected" : ""}>${escapeHtml(coach.displayName || "Coach")}</option>`
        ),
      ].join("");
      clientPreferredCoachSelect.disabled = !coaches.length;
      if (clientPreferredCoachStatus instanceof HTMLElement) {
        clientPreferredCoachStatus.hidden = !coaches.length;
        clientPreferredCoachStatus.textContent = coaches.length ? "" : "No active coaches are available right now.";
        clientPreferredCoachStatus.classList.toggle("error", !coaches.length);
      }
    } catch (error) {
      clientPreferredCoachSelect.innerHTML = '<option value="">Unable to load coaches right now</option>';
      clientPreferredCoachSelect.disabled = true;
      if (clientPreferredCoachStatus instanceof HTMLElement) {
        clientPreferredCoachStatus.hidden = false;
        clientPreferredCoachStatus.textContent = error?.message || "Unable to load coaches right now. Please try again.";
        clientPreferredCoachStatus.classList.add("error");
      }
    }
  }

  function readWaiverState() {
    return readSessionJson(WAIVER_STATE_KEY);
  }

  function clearWaiverState() {
    writeSessionJson(WAIVER_STATE_KEY, null);
  }

  function readRegistrationDraft() {
    return readSessionJson(REGISTRATION_DRAFT_KEY);
  }

  function clearRegistrationDraft() {
    writeSessionJson(REGISTRATION_DRAFT_KEY, null);
  }

  function syncClientWaiverUi(form) {
    if (!(form instanceof HTMLFormElement)) {
      return;
    }

    const waiverCheckbox = form.querySelector("[data-waiver-checkbox]");
    const waiverFeedback = form.querySelector("[data-waiver-feedback]");
    const waiverSubmissionField = form.elements.namedItem("clientWaiverSubmissionId");
    const emailField = form.elements.namedItem("clientEmailAddress");
    const waiverState = readWaiverState();
    const emailMatches = waiverState
      && (!emailField || !String(emailField.value || "").trim() || normalizeEmail(emailField.value) === normalizeEmail(waiverState.email));

    if (waiverCheckbox instanceof HTMLInputElement) {
      waiverCheckbox.checked = Boolean(emailMatches && waiverState?.waiverSubmissionId);
    }

    if (waiverSubmissionField instanceof HTMLInputElement) {
      waiverSubmissionField.value = emailMatches && waiverState?.waiverSubmissionId ? waiverState.waiverSubmissionId : "";
    }

    if (waiverFeedback) {
      waiverFeedback.textContent = emailMatches && waiverState?.waiverSubmissionId
        ? `Waiver completed on ${new Date(waiverState.signedAt || Date.now()).toLocaleString("en-MY")}.`
        : "The waiver has not been completed yet.";
      waiverFeedback.classList.toggle("success", Boolean(emailMatches && waiverState?.waiverSubmissionId));
      waiverFeedback.classList.toggle("error", false);
    }
  }

  function saveClientDraftAndOpenWaiver() {
    const clientForm = getRegistrationForm("client");
    if (!(clientForm instanceof HTMLFormElement)) {
      window.location.href = "./client-waiver.html";
      return;
    }

    writeSessionJson(REGISTRATION_DRAFT_KEY, {
      role: "client",
      values: serializeForm(clientForm),
    });

    window.location.href = "./client-waiver.html";
  }

  function buildRegistrationPayload(form, role) {
    const formData = new FormData(form);

    if (role === "client") {
      return {
        role: "client",
        fullName: String(formData.get("clientFullName") || "").trim(),
        preferredName: String(formData.get("clientPreferredName") || "").trim(),
        email: normalizeEmail(formData.get("clientEmailAddress")),
        phone: normalizePhone(formData.get("clientPhone")),
        password: String(formData.get("clientPassword") || ""),
        confirmPassword: String(formData.get("clientPasswordConfirm") || ""),
        dateOfBirth: String(formData.get("clientBirthday") || "").trim(),
        gender: String(formData.get("clientGender") || "").trim(),
        icPassportNo: String(formData.get("clientIcPassportNo") || "").trim(),
        occupation: String(formData.get("clientOccupation") || "").trim(),
        homeAddress: String(formData.get("clientHomeAddress") || "").trim(),
        emergencyContactName: String(formData.get("clientEmergencyName") || "").trim(),
        emergencyContactPhone: normalizePhone(formData.get("clientEmergencyPhone")),
        emergencyContactRelationship: String(formData.get("clientEmergencyRelationship") || "").trim(),
        preferredCoachId: String(formData.get("clientPreferredCoachId") || "").trim(),
        primaryGoal: String(formData.get("clientGoals") || "").trim(),
        activityStyle: String(formData.get("clientActivityStyle") || "").trim(),
        medicalNotes: String(formData.get("clientMedicalNotes") || "").trim(),
        waiverSubmissionId: String(formData.get("clientWaiverSubmissionId") || "").trim(),
        activationCode: String(formData.get("clientActivationCode") || "").trim().toUpperCase(),
      };
    }

    return {
      role: "coach",
      fullName: String(formData.get("coachFullName") || "").trim(),
      email: normalizeEmail(formData.get("coachEmailAddress")),
      phone: normalizePhone(formData.get("coachPhone")),
      password: String(formData.get("coachPassword") || ""),
      confirmPassword: String(formData.get("coachPasswordConfirm") || ""),
      dateOfBirth: String(formData.get("coachBirthday") || "").trim(),
      gender: String(formData.get("coachGender") || "").trim(),
      icPassportNo: String(formData.get("coachIcPassportNo") || "").trim(),
      homeAddress: String(formData.get("coachHomeAddress") || "").trim(),
      emergencyContactName: String(formData.get("coachEmergencyName") || "").trim(),
      emergencyContactPhone: normalizePhone(formData.get("coachEmergencyPhone")),
      emergencyContactRelationship: String(formData.get("coachEmergencyRelationship") || "").trim(),
      specialty: String(formData.get("coachSpecialty") || "").trim(),
      certifications: String(formData.get("coachCertifications") || "").trim(),
      availabilityNotes: String(formData.get("coachAvailabilityNotes") || "").trim(),
      experienceNotes: String(formData.get("coachNotes") || "").trim(),
      activationCode: String(formData.get("coachActivationCode") || "").trim().toUpperCase(),
    };
  }

  function setSelectedRole(role, options = {}) {
    const { scroll = true, focus = true } = options;
    let activePane = null;

    roleButtons.forEach((button) => {
      const isActive = button.dataset.accountRole === role;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    rolePanes.forEach((pane) => {
      const isActive = pane.dataset.rolePanel === role;
      pane.hidden = !isActive;
      pane.classList.toggle("is-active", isActive);
      if (isActive) {
        activePane = pane;
      }
    });

    loginSection.hidden = false;
    loginSection.classList.add("in-view");

    if (mainNode) {
      mainNode.classList.add("has-selection");
    }

    if (scroll) {
      loginSection.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      });
    }

    if (focus && activePane) {
      const firstField = activePane.querySelector("input, select, textarea");
      if (firstField instanceof HTMLElement) {
        window.requestAnimationFrame(() => {
          firstField.focus();
        });
      }
    }
  }

  roleButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const role = button.dataset.accountRole || "client";
      setSelectedRole(role);
    });
  });

  const intent = String(params.get("intent") || "").trim();
  const requestedRole = String(params.get("role") || "").trim();
  const rememberedLastRole = (() => {
    const value = readRememberedLogins().lastRole;
    return value === "client" || value === "coach" ? value : "";
  })();

  if (intent === "buy-package") {
    if (accountEntryNoteCopy) {
      accountEntryNoteCopy.textContent =
        "Log in as a client to continue with your selected package. Package checkout will be attached to your client account.";
    }
    setSelectedRole("client", { scroll: false, focus: false });
  } else if (requestedRole === "client" || requestedRole === "coach") {
    setSelectedRole(requestedRole, { scroll: false, focus: false });
  } else if (rememberedLastRole) {
    setSelectedRole(rememberedLastRole, { scroll: false, focus: false });
  }

  if (!registrationModal) return;

  const passwordResetModal = document.getElementById("account-password-reset-modal");

  const registrationForms = Array.from(registrationModal.querySelectorAll("[data-registration-form]"));
  const registrationOpeners = Array.from(document.querySelectorAll("[data-registration-open]"));
  const registrationClosers = Array.from(registrationModal.querySelectorAll("[data-registration-close]"));
  const passwordResetOpeners = Array.from(document.querySelectorAll("[data-password-reset-open]"));
  const passwordResetClosers = passwordResetModal
    ? Array.from(passwordResetModal.querySelectorAll("[data-password-reset-close]"))
    : [];
  let lastRegistrationOpener = null;
  let lastPasswordResetOpener = null;

  function setRegistrationRole(role) {
    const content = registrationContent[role] || registrationContent.client;

    if (registrationHeadKicker) {
      registrationHeadKicker.textContent = content.kicker;
    }
    if (registrationHeadTitle) {
      registrationHeadTitle.textContent = content.title;
    }
    if (registrationHeadCopy) {
      registrationHeadCopy.textContent = content.copy;
    }

    registrationForms.forEach((form) => {
      const isActive = form.dataset.registrationForm === role;
      form.hidden = !isActive;

      const feedback = form.querySelector("[data-registration-feedback]");
      if (feedback) {
        feedback.textContent = "";
        feedback.classList.remove("error", "success");
      }

      if (role === "client" && isActive) {
        const draft = readRegistrationDraft();
        if (draft?.role === "client") {
          hydrateForm(form, draft.values);
        }
        syncClientWaiverUi(form);
      }
    });

    if (role === "client") {
      const draft = readRegistrationDraft();
      void populateActiveCoachOptions(draft?.values?.clientPreferredCoachId || readWaiverState()?.preferredCoachId || "");
    }
  }

  function setRegistrationOpen(isOpen) {
    registrationModal.classList.toggle("open", isOpen);
    registrationModal.setAttribute("aria-hidden", isOpen ? "false" : "true");
    document.body.classList.toggle("account-registration-open", isOpen);

    if (!isOpen) {
      if (lastRegistrationOpener instanceof HTMLElement) {
        lastRegistrationOpener.focus();
      }
      return;
    }

    const firstField = registrationModal.querySelector(
      "[data-registration-form]:not([hidden]) input, [data-registration-form]:not([hidden]) select, [data-registration-form]:not([hidden]) textarea"
    );
    if (firstField instanceof HTMLElement) {
      window.requestAnimationFrame(() => {
        firstField.focus();
      });
    }
  }

  registrationOpeners.forEach((opener) => {
    opener.addEventListener("click", () => {
      const role = opener.dataset.registrationOpen || "client";
      lastRegistrationOpener = opener;
      setSelectedRole(role, { scroll: false, focus: false });
      setRegistrationRole(role);
      setRegistrationOpen(true);
    });
  });

  registrationClosers.forEach((closer) => {
    closer.addEventListener("click", () => {
      setRegistrationOpen(false);
    });
  });

  openWaiverButtons.forEach((button) => {
    button.addEventListener("click", saveClientDraftAndOpenWaiver);
  });

  const clientRegistrationForm = getRegistrationForm("client");
  if (clientRegistrationForm instanceof HTMLFormElement) {
    const emailField = clientRegistrationForm.elements.namedItem("clientEmailAddress");
    const waiverCheckbox = clientRegistrationForm.querySelector("[data-waiver-checkbox]");

    if (emailField instanceof HTMLInputElement) {
      emailField.addEventListener("input", () => {
        syncClientWaiverUi(clientRegistrationForm);
      });
    }

    if (waiverCheckbox instanceof HTMLInputElement) {
      waiverCheckbox.addEventListener("click", (event) => {
        event.preventDefault();
      });
    }
  }

  function setPasswordResetOpen(isOpen, role = "client") {
    if (!passwordResetModal) return;

    passwordResetModal.classList.toggle("open", isOpen);
    passwordResetModal.setAttribute("aria-hidden", isOpen ? "false" : "true");
    document.body.classList.toggle("account-registration-open", isOpen);

    if (!isOpen) {
      if (lastPasswordResetOpener instanceof HTMLElement) {
        lastPasswordResetOpener.focus();
      }
      return;
    }

    setSelectedRole(role, { scroll: false, focus: false });

    const roleForm = role === "coach" ? coachLoginForm : clientLoginForm;
    const seededEmail =
      roleForm?.querySelector("input[type='email']") instanceof HTMLInputElement
        ? roleForm.querySelector("input[type='email']").value.trim()
        : "";
    const resetEmailField = passwordResetModal.querySelector("input[name='resetEmail']");
    if (resetEmailField instanceof HTMLInputElement && seededEmail) {
      resetEmailField.value = seededEmail;
    }

    const firstField = passwordResetModal.querySelector("input, textarea, select");
    if (firstField instanceof HTMLElement) {
      window.requestAnimationFrame(() => {
        firstField.focus();
      });
    }
  }

  passwordResetOpeners.forEach((opener) => {
    opener.addEventListener("click", () => {
      const role = opener.dataset.passwordResetOpen || "client";
      lastPasswordResetOpener = opener;
      setPasswordResetOpen(true, role);
    });
  });

  passwordResetClosers.forEach((closer) => {
    closer.addEventListener("click", () => {
      setPasswordResetOpen(false);
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && registrationModal.classList.contains("open")) {
      setRegistrationOpen(false);
    }
    if (event.key === "Escape" && passwordResetModal?.classList.contains("open")) {
      setPasswordResetOpen(false);
    }
  });

  registrationForms.forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (!(form instanceof HTMLFormElement) || !form.reportValidity()) {
        return;
      }

      const role = form.dataset.registrationForm || "client";
      const feedback = form.querySelector("[data-registration-feedback]");
      const content = registrationContent[role] || registrationContent.client;
      const payload = buildRegistrationPayload(form, role);

      if (role === "client" && !payload.waiverSubmissionId) {
        if (feedback) {
          feedback.textContent = "Complete the signed waiver before creating the client account.";
          feedback.classList.remove("success");
          feedback.classList.add("error");
        }
        return;
      }

      if (payload.password !== payload.confirmPassword) {
        if (feedback) {
          feedback.textContent = "Password confirmation does not match.";
          feedback.classList.remove("success");
          feedback.classList.add("error");
        }
        return;
      }

      if (feedback) {
        feedback.textContent = role === "client"
          ? "Creating your client account..."
          : "Submitting your coach registration...";
        feedback.classList.remove("error");
        feedback.classList.add("success");
      }

      try {
        const response = await window.fetch("/.netlify/functions/register-account", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(result?.error || "Unable to complete registration right now.");
        }

        if (feedback) {
          feedback.textContent = result?.message || content.success;
          feedback.classList.remove("error");
          feedback.classList.add("success");
        }

        clearRegistrationDraft();
        clearWaiverState();

        if (role === "client" && window.legacyAuth?.loginWithRole) {
          const loginResult = await window.legacyAuth.loginWithRole({
            expectedRole: "client",
            email: payload.email,
            password: payload.password,
          });

          if (loginResult.ok) {
            const target = new URL("./client-dashboard.html", window.location.href);
            const currentParams = new URLSearchParams(window.location.search);
            ["intent", "package"].forEach((key) => {
              const value = currentParams.get(key);
              if (value) {
                target.searchParams.set(key, value);
              }
            });
            target.pathname = new URL(loginResult.portalPath, window.location.href).pathname;
            window.location.href = target.toString();
            return;
          }
        }

        form.reset();
        if (role === "client") {
          syncClientWaiverUi(form);
          void populateActiveCoachOptions();
        }
      } catch (error) {
        if (feedback) {
          feedback.textContent = error?.message || "Unable to complete registration right now.";
          feedback.classList.remove("success");
          feedback.classList.add("error");
        }
      }
    });
  });

  const restoredDraft = readRegistrationDraft();
  const restoredWaiverState = readWaiverState();
  if (restoredDraft?.role === "client" || params.get("waiver") === "complete" || restoredWaiverState?.waiverSubmissionId) {
    setSelectedRole("client", { scroll: false, focus: false });
    setRegistrationRole("client");
    setRegistrationOpen(true);
  }
}

installAccountPageFlow();
