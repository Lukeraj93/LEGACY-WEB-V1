(function () {
  const catalog = Array.isArray(window.LEGACY_STORE_CATALOG) ? window.LEGACY_STORE_CATALOG : [];
  if (!catalog.length) return;

  const categoryOrder = ["Shirts", "Tank Tops", "Caps", "Socks", "Accessories"];
  const promoCategoryOrder = ["New", "Sale"];
  const audienceOrder = ["Men", "Women"];
  const categories = [
    "All",
    ...promoCategoryOrder.filter((category) =>
      catalog.some((product) => normalizeValue(product.promoType) === normalizeValue(category))
    ),
    ...categoryOrder.filter((category) => catalog.some((product) => product.category === category)),
  ];
  const audiences = [
    "All",
    ...audienceOrder.filter((audience) =>
      catalog.some((product) => matchesAudience(product, audience))
    ),
  ];
  const relatedProductMap = {};
  const productRoot = document.getElementById("store-product-root");
  const gridRoot = document.getElementById("store-grid");
  const categoryRoot = document.getElementById("store-category-nav");
  const audienceRoot = document.getElementById("store-audience-nav");
  const countRoot = document.getElementById("store-count");

  function escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function normalizeValue(value) {
    return String(value || "")
      .trim()
      .replace(/\s+/g, " ")
      .toLowerCase();
  }

  function getActiveCategory() {
    const requested = new URLSearchParams(window.location.search).get("category");
    const match = categories.find((category) => normalizeValue(category) === normalizeValue(requested));
    return match || "All";
  }

  function getActiveAudience() {
    const requested = new URLSearchParams(window.location.search).get("audience");
    const match = audiences.find((audience) => normalizeValue(audience) === normalizeValue(requested));
    return match || "All";
  }

  function getProductById(productId) {
    const requestedId = normalizeValue(productId);
    return catalog.find((product) => normalizeValue(product.id) === requestedId) || null;
  }

  function matchesCategory(product, category) {
    const normalizedCategory = normalizeValue(category);

    if (!category || normalizedCategory === "all") return true;
    if (normalizedCategory === "new" || normalizedCategory === "sale") {
      return normalizeValue(product.promoType) === normalizedCategory;
    }

    return normalizeValue(product.category) === normalizedCategory;
  }

  function matchesAudience(product, audience) {
    const normalizedAudience = normalizeValue(audience);
    const productAudiences =
      Array.isArray(product.audiences) && product.audiences.length ? product.audiences : audienceOrder;

    if (!audience || normalizedAudience === "all") return true;

    return productAudiences.some((entry) => normalizeValue(entry) === normalizedAudience);
  }

  function getToneClass(tone) {
    return `store-artwork--${escapeHtml(tone || "ember")}`;
  }

  function getArtworkPhotoClass(slide) {
    const rawSrc = String(slide?.imageSrc || "").trim();
    const src = normalizeValue(rawSrc);
    const decodedSrc = normalizeValue(decodeURIComponent(rawSrc));
    if (!src) return " store-artwork-photo--lifestyle";

    const isWornProductShot =
      /store-generated\/performance-cap/.test(decodedSrc) ||
      /store-generated\/grip-crew-socks/.test(decodedSrc) ||
      /member shirt sleeveless/.test(decodedSrc) ||
      /merch\/cap 2\/cap 2 (black|orange|beige)\.png/.test(decodedSrc);

    if (isWornProductShot) return " store-artwork-photo--worn";

    const isFloatingPackshot =
      /merch\/cap 3\//.test(decodedSrc) ||
      /merch\/cap 4\//.test(decodedSrc);

    if (isFloatingPackshot) return " store-artwork-photo--floating-packshot";

    const isProductShot =
      /front and back|(?:^|[^a-z])front(?:[^a-z]|$)|(?:^|[^a-z])back(?:[^a-z]|$)|sleeveless|singlet|cap|sock|bottle|bag|duffel|towel|shaker/.test(
        decodedSrc
      );

    return isProductShot ? " store-artwork-photo--product" : " store-artwork-photo--lifestyle";
  }

  function renderArtwork(product, slide, compact, frameMarkup = "", options = {}) {
    const hasImage = Boolean(slide && slide.imageSrc);
    const showOverlayCopy = options.showOverlayCopy !== false;
    const eyebrow = escapeHtml(slide?.eyebrow || (compact ? "Merch Look" : "Gallery"));
    const title = escapeHtml(slide?.title || product.name);
    const caption = escapeHtml(slide?.caption || product.summary || "");
    const imageAlt = escapeHtml(slide?.alt || `${product.name} merchandise image`);

    if (hasImage) {
      return `
        <div class="store-artwork has-photo${compact ? " is-compact" : ""}">
          ${frameMarkup}
          <img
            class="store-artwork-photo${getArtworkPhotoClass(slide)}"
            src="${escapeHtml(slide.imageSrc)}"
            alt="${imageAlt}"
            loading="${compact ? "eager" : "lazy"}"
            decoding="async"
          />
          ${
            showOverlayCopy
              ? `
          <div class="store-artwork-copy-layer${compact ? " is-compact" : ""}">
            <span class="store-artwork-eyebrow">${eyebrow}</span>
            ${compact ? "" : `<strong class="store-artwork-title">${escapeHtml(product.name)}</strong>`}
            <span class="store-artwork-tag">${title}</span>
            ${compact ? "" : `<p class="store-artwork-caption">${caption}</p>`}
          </div>`
              : ""
          }
        </div>
      `;
    }

    return `
      <div class="store-artwork ${getToneClass(slide.tone)}${compact ? " is-compact" : ""}">
        ${frameMarkup}
        ${showOverlayCopy ? `<span class="store-artwork-eyebrow">${eyebrow}</span>` : ""}
        <img
          class="store-artwork-mark"
          src="./assets/Logo%20-%20Legacy_Symbol%20(Orange%20flame,%20white%20plus).png"
          alt=""
          loading="${compact ? "eager" : "lazy"}"
        />
        <strong class="store-artwork-title">${escapeHtml(product.name)}</strong>
        ${showOverlayCopy ? `<span class="store-artwork-tag">${title}</span>` : ""}
        ${showOverlayCopy ? `<p class="store-artwork-caption">${caption}</p>` : ""}
      </div>
    `;
  }

  function renderPromoFrame(product) {
    if (normalizeValue(product.promoType) !== "new") return "";

    return `
      <div class="store-laser-frame" aria-hidden="true">
        <svg preserveAspectRatio="none" focusable="false" aria-hidden="true">
          <path class="store-laser-beam"></path>
        </svg>
      </div>
    `;
  }

  function renderPromoBadge(product, options = {}) {
    const normalizedPromoType = normalizeValue(product.promoType || "sale");
    const promoType = escapeHtml(product.promoType || "sale");
    if (!product.promoLabel) return "";
    if (options.suppressSaleBadge && normalizedPromoType === "sale") return "";

    return `
      <div class="store-product-promo-row">
        <span class="store-promo-badge store-promo-badge--${promoType}">${escapeHtml(product.promoLabel)}</span>
      </div>
    `;
  }

  function renderProductCard(product, extraClasses, options = {}) {
    const promoType = escapeHtml(product.promoType || "sale");
    const fitLine = escapeHtml(product.fit || product.tag || product.fabric || "LEGACY+ merch");
    const supportLine = escapeHtml(product.tag || product.fabric || product.category || "LEGACY+ merch");
    const promoFrameMarkup = renderPromoFrame(product);
    const leadSlide = product.slides[0];

    return `
      <article class="store-product-card card${product.promoLabel ? ` has-promo store-product-card--${promoType}` : ""}${extraClasses ? ` ${extraClasses}` : ""}">
        ${promoFrameMarkup}
        <a class="store-product-link" href="/store-product.html?product=${encodeURIComponent(product.id)}">
          ${renderPromoBadge(product, options)}
          <div class="store-product-visual">
            ${renderArtwork(product, leadSlide, true, "", { showOverlayCopy: false })}
          </div>
          <div class="store-product-copy store-product-info-box">
            <div class="store-product-meta">
              <span class="store-product-category">${escapeHtml(product.category)}</span>
              <span class="store-product-note">${supportLine}</span>
            </div>
            <h3>${escapeHtml(product.name)}</h3>
            <p class="store-product-fit">${fitLine}</p>
            <div class="store-product-footer">
              <span class="store-product-price">${escapeHtml(product.price)}</span>
            </div>
          </div>
        </a>
      </article>
    `;
  }

  function updateFilterQuery(category, audience) {
    const params = new URLSearchParams(window.location.search);

    if (!category || category === "All") {
      params.delete("category");
    } else {
      params.set("category", category);
    }

    if (!audience || audience === "All") {
      params.delete("audience");
    } else {
      params.set("audience", audience);
    }

    const nextUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}`;
    window.history.replaceState({}, "", nextUrl);
  }

  function getRelatedProducts(product) {
    const configuredIds = relatedProductMap[product.id] || [];
    const configuredProducts = configuredIds
      .map((productId) => getProductById(productId))
      .filter((candidate) => candidate && candidate.id !== product.id);
    const fallbackProducts = catalog
      .filter((candidate) => candidate.id !== product.id)
      .sort((left, right) => {
        const leftScore = normalizeValue(left.category) === normalizeValue(product.category) ? 0 : 1;
        const rightScore = normalizeValue(right.category) === normalizeValue(product.category) ? 0 : 1;

        if (leftScore !== rightScore) {
          return leftScore - rightScore;
        }

        return left.name.localeCompare(right.name);
      });
    const relatedProducts = [...configuredProducts];

    fallbackProducts.forEach((candidate) => {
      if (relatedProducts.some((item) => item.id === candidate.id)) return;
      relatedProducts.push(candidate);
    });

    return relatedProducts.slice(0, 6);
  }

  function renderStoreIndex() {
    if (!gridRoot || !categoryRoot) return;

    let activeCategory = getActiveCategory();
    let activeAudience = getActiveAudience();
    const categoryPriority = categories.slice(1).reduce((priorityMap, category, index) => {
      priorityMap[normalizeValue(category)] = index;
      return priorityMap;
    }, {});
    const promoPriority = {
      new: 0,
      sale: 1,
    };

    function getVisibleProducts() {
      const filteredProducts = catalog.filter(
        (product) => matchesCategory(product, activeCategory) && matchesAudience(product, activeAudience)
      );

      return [...filteredProducts].sort((left, right) => {
        if (activeCategory === "All") {
          const leftCategoryPriority = categoryPriority[normalizeValue(left.category)] ?? Number.MAX_SAFE_INTEGER;
          const rightCategoryPriority = categoryPriority[normalizeValue(right.category)] ?? Number.MAX_SAFE_INTEGER;

          if (leftCategoryPriority !== rightCategoryPriority) {
            return leftCategoryPriority - rightCategoryPriority;
          }
        }

        const leftPriority = promoPriority[normalizeValue(left.promoType)] ?? 2;
        const rightPriority = promoPriority[normalizeValue(right.promoType)] ?? 2;

        if (leftPriority !== rightPriority) {
          return leftPriority - rightPriority;
        }

        return left.name.localeCompare(right.name);
      });
    }

    function renderCategoryButtons() {
      categoryRoot.innerHTML = categories
        .map((category) => {
          const isActive = category === activeCategory;
          const categoryCount =
            category === "All"
              ? catalog.filter((product) => matchesAudience(product, activeAudience)).length
              : catalog.filter((product) => matchesAudience(product, activeAudience) && matchesCategory(product, category)).length;

          return `
            <button
              class="store-category-button${isActive ? " is-active" : ""}"
              type="button"
              data-store-category="${escapeHtml(category)}"
              aria-pressed="${isActive ? "true" : "false"}"
            >
              <span>${escapeHtml(category)}</span>
              <strong>${categoryCount}</strong>
            </button>
          `;
        })
        .join("");

      categoryRoot.querySelectorAll("[data-store-category]").forEach((button) => {
        button.addEventListener("click", () => {
          activeCategory = button.getAttribute("data-store-category") || "All";
          updateFilterQuery(activeCategory, activeAudience);
          renderCategoryButtons();
          renderAudienceButtons();
          renderProductCards();
        });
      });
    }

    function renderAudienceButtons() {
      if (!audienceRoot) return;

      audienceRoot.innerHTML = audiences
        .map((audience) => {
          const isActive = audience === activeAudience;
          const audienceCount =
            audience === "All"
              ? catalog.filter((product) => matchesCategory(product, activeCategory)).length
              : catalog.filter((product) => matchesCategory(product, activeCategory) && matchesAudience(product, audience)).length;

          return `
            <button
              class="store-audience-button${isActive ? " is-active" : ""}"
              type="button"
              data-store-audience="${escapeHtml(audience)}"
            >
              <span>${escapeHtml(audience)}</span>
              <strong>${audienceCount}</strong>
            </button>
          `;
        })
        .join("");

      audienceRoot.querySelectorAll("[data-store-audience]").forEach((button) => {
        button.addEventListener("click", () => {
          activeAudience = button.getAttribute("data-store-audience") || "All";
          updateFilterQuery(activeCategory, activeAudience);
          renderAudienceButtons();
          renderCategoryButtons();
          renderProductCards();
        });
      });
    }

    function renderProductCards() {
      const visibleProducts = getVisibleProducts();
      const normalizedCategory = normalizeValue(activeCategory);

      if (countRoot) {
        if (activeCategory === "All" && activeAudience === "All") {
          countRoot.textContent = `${visibleProducts.length} merch items live in the store.`;
        } else if (activeCategory === "All") {
          countRoot.textContent = `${visibleProducts.length} items in ${activeAudience}.`;
        } else if (activeAudience === "All") {
          countRoot.textContent = `${visibleProducts.length} items in ${activeCategory}.`;
        } else {
          countRoot.textContent = `${visibleProducts.length} ${activeAudience.toLowerCase()} items in ${activeCategory}.`;
        }
      }

      const showOnlyNewFeature = normalizedCategory === "all" || normalizedCategory === "new";
      const featuredProducts = showOnlyNewFeature
        ? visibleProducts.filter((product) => normalizeValue(product.promoType) === "new")
        : [];
      const standardProducts = showOnlyNewFeature
        ? visibleProducts.filter((product) => normalizeValue(product.promoType) !== "new")
        : visibleProducts;
      const suppressSaleBadge = normalizedCategory === "all";
      const featuredMarkup = featuredProducts.length
        ? `
          <div class="store-grid store-featured-grid">
            ${featuredProducts
              .map((product) =>
                renderProductCard(product, "store-product-card--featured", {
                  suppressSaleBadge,
                })
              )
              .join("")}
          </div>
        `
        : "";
      const dividerMarkup =
        featuredProducts.length && standardProducts.length ? `<div class="store-grid-divider" aria-hidden="true"></div>` : "";
      const standardMarkup = standardProducts.length
        ? `
          <div class="store-grid store-standard-grid">
            ${standardProducts
              .map((product) =>
                renderProductCard(product, "", {
                  suppressSaleBadge,
                })
              )
              .join("")}
          </div>
        `
        : "";

      gridRoot.innerHTML = featuredMarkup || standardMarkup ? `${featuredMarkup}${dividerMarkup}${standardMarkup}` : "";
      syncStoreLaserFrames();
    }

    renderCategoryButtons();
    renderAudienceButtons();
    renderProductCards();
  }

  let storeLaserResizeBound = false;

  function buildRoundedRectPath(width, height, radius, inset) {
    const left = inset;
    const top = inset;
    const right = Math.max(left, width - inset);
    const bottom = Math.max(top, height - inset);
    const safeRadius = Math.max(0, Math.min(radius, (right - left) / 2, (bottom - top) / 2));

    if (!safeRadius) {
      return `M ${left} ${top} H ${right} V ${bottom} H ${left} Z`;
    }

    return [
      `M ${left + safeRadius} ${top}`,
      `H ${right - safeRadius}`,
      `A ${safeRadius} ${safeRadius} 0 0 1 ${right} ${top + safeRadius}`,
      `V ${bottom - safeRadius}`,
      `A ${safeRadius} ${safeRadius} 0 0 1 ${right - safeRadius} ${bottom}`,
      `H ${left + safeRadius}`,
      `A ${safeRadius} ${safeRadius} 0 0 1 ${left} ${bottom - safeRadius}`,
      `V ${top + safeRadius}`,
      `A ${safeRadius} ${safeRadius} 0 0 1 ${left + safeRadius} ${top}`,
      "Z",
    ].join(" ");
  }

  function syncStoreLaserFrames() {
    const frames = Array.from(document.querySelectorAll(".store-product-card--new .store-laser-frame"));
    if (!frames.length) return;

    const updateFrame = (frame) => {
      const host = frame.closest(".store-product-card");
      const svg = frame.querySelector("svg");
      const beam = frame.querySelector(".store-laser-beam");
      if (!host || !svg || !beam) return;

      const width = Math.round(host.clientWidth);
      const height = Math.round(host.clientHeight);
      if (!width || !height) return;

      const styles = window.getComputedStyle(host);
      const radius = parseFloat(styles.borderTopLeftRadius || "0") || 0;
      const inset = 2;
      const strokeRadius = Math.max(radius - inset, 0);
      const pathData = buildRoundedRectPath(width, height, strokeRadius, inset);

      svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
      beam.setAttribute("d", pathData);
    };

    window.requestAnimationFrame(() => {
      frames.forEach(updateFrame);
    });

    if (!storeLaserResizeBound) {
      window.addEventListener("resize", syncStoreLaserFrames, { passive: true });
      storeLaserResizeBound = true;
    }
  }

  async function buildOptionalAuthHeaders() {
    if (!window.legacyAuth?.getAccessToken) {
      return {};
    }

    try {
      const accessToken = await window.legacyAuth.getAccessToken();
      return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
    } catch (_) {
      return {};
    }
  }

  function getMaterialHighlights(product) {
    const category = normalizeValue(product.category);
    const fabric = String(product.fabric || "Premium LEGACY+ material").trim();
    const lowerFabric = normalizeValue(fabric);
    const lowerName = normalizeValue(product.name);

    if (category === "caps") {
      return [
        `${fabric} build with a cleaner structured shape that keeps the crown sitting sharp.`,
        "Light daily-wear feel with enough hold to stay comfortable through longer days out.",
        "Finished for repeat wear with a smoother touch against the head and inner band.",
      ];
    }

    if (category === "socks") {
      return [
        `${fabric} with a softer cushioned feel through the foot for daily wear or training.`,
        "Stretch-led construction that stays snug without feeling too rigid through the calf.",
        "Breathable knit texture that keeps the pair easier to wear over longer sessions.",
      ];
    }

    if (category === "accessories" && lowerName.includes("bottle")) {
      return [
        `${fabric} construction that feels more premium and solid in hand than a standard plastic bottle.`,
        "Smooth easy-carry finish that works for gym bags, desks, or daily commute setups.",
        "Built to feel clean, durable, and straightforward for repeated everyday use.",
      ];
    }

    if (category === "accessories") {
      return [
        `${fabric} body with enough structure to hold shape without feeling bulky.`,
        "Hard-wearing everyday material chosen for repeated carry, transit, and gym use.",
        "Easy-clean surface and handles that make it practical for daily rotation.",
      ];
    }

    if (lowerFabric.includes("cotton")) {
      return [
        `${fabric} with a softer handfeel that sits easy for all-day wear.`,
        "Balanced weight that keeps the piece comfortable while still giving it a clean shape on body.",
        "Built to feel smoother on skin and hold up well through repeat washing and use.",
      ];
    }

    if (lowerFabric.includes("performance") || lowerFabric.includes("knit") || lowerFabric.includes("jersey")) {
      return [
        `${fabric} that feels lighter on body and easier to move in through training or long coaching days.`,
        "Breathable performance-led texture that helps the piece stay cooler through warmer sessions.",
        "Clean technical finish designed to keep its shape while still feeling smooth against skin.",
      ];
    }

    return [
      `${fabric} build with a clean premium handfeel suited to daily wear.`,
      "Balanced structure and comfort so the piece stays easy to wear without looking flat.",
      "Made to feel durable, smooth, and consistent through repeat use.",
    ];
  }

  function renderRelatedRail(product) {
    const relatedProducts = getRelatedProducts(product);
    if (!relatedProducts.length) return "";

    return `
      <section class="store-related-band" data-related-slider>
        <div class="store-related-head">
          <span class="kicker">Locker Pairings</span>
          <h2>Locker Pairings For ${escapeHtml(product.name)}</h2>
        </div>
        <div class="store-related-slider-shell">
          <button class="store-related-nav" type="button" data-related-prev aria-label="Previous related products">Prev</button>
          <div class="store-related-viewport" data-related-viewport>
            <div class="store-related-track">
              ${relatedProducts
                .map(
                  (relatedProduct) => `
                    <div class="store-related-slide">
                      ${renderProductCard(relatedProduct, "store-related-card")}
                    </div>
                  `
                )
                .join("")}
            </div>
          </div>
          <button class="store-related-nav" type="button" data-related-next aria-label="Next related products">Next</button>
        </div>
      </section>
    `;
  }

  function enhanceRelatedSlider(scope) {
    const slider = scope.querySelector("[data-related-slider]");
    if (!slider) return;

    const viewport = slider.querySelector("[data-related-viewport]");
    const prev = slider.querySelector("[data-related-prev]");
    const next = slider.querySelector("[data-related-next]");
    const firstSlide = slider.querySelector(".store-related-slide");
    if (!viewport || !prev || !next || !firstSlide) return;

    function getStepSize() {
      const slideWidth = firstSlide.getBoundingClientRect().width;
      const styles = window.getComputedStyle(viewport);
      const gap = Number.parseFloat(styles.columnGap || styles.gap || "14") || 14;
      return slideWidth + gap;
    }

    function syncNav() {
      const maxScrollLeft = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
      prev.disabled = viewport.scrollLeft <= 4;
      next.disabled = viewport.scrollLeft >= maxScrollLeft - 4;
    }

    prev.addEventListener("click", () => {
      viewport.scrollBy({ left: -getStepSize(), behavior: "smooth" });
    });

    next.addEventListener("click", () => {
      viewport.scrollBy({ left: getStepSize(), behavior: "smooth" });
    });

    viewport.addEventListener("scroll", syncNav, { passive: true });
    window.addEventListener("resize", syncNav);
    syncNav();
  }

  function renderStoreProduct() {
    if (!productRoot) return;

    const params = new URLSearchParams(window.location.search);
    const product = getProductById(params.get("product")) || catalog[0];
    if (!product) return;

    document.title = `${product.name} | LEGACY+ Store`;

    productRoot.innerHTML = `
      <div class="store-product-shell">
        <article class="store-gallery-card">
          <div class="store-gallery-head">
            <span class="kicker">Merch Detail</span>
            <h2>${escapeHtml(product.name)}</h2>
          </div>
          <div class="store-gallery-slider" data-store-slider>
            <div class="store-gallery-viewport">
              <div class="store-gallery-track" data-store-track>
                ${product.slides
                  .map(
                    (slide) => `
                      <div class="store-gallery-slide" data-store-slide>
                        ${renderArtwork(product, slide, false)}
                      </div>
                    `
                  )
                  .join("")}
              </div>
            </div>
            <div class="store-gallery-controls">
              <button class="store-gallery-nav" type="button" data-store-prev aria-label="Previous image">Prev</button>
              <div class="store-gallery-dots" data-store-dots></div>
              <button class="store-gallery-nav" type="button" data-store-next aria-label="Next image">Next</button>
            </div>
          </div>
        </article>

        <div class="store-product-stack">
          <article class="contact-card store-detail-card">
            <div class="store-product-meta">
              <span class="store-product-category">${escapeHtml(product.category)}</span>
            </div>
            <h3>${escapeHtml(product.summary)}</h3>
            <p>${escapeHtml(product.description)}</p>
            <div class="chips">
              <span class="chip chip--accent">${escapeHtml(product.fit)}</span>
              <span class="chip chip--accent">${escapeHtml(product.fabric)}</span>
              <span class="chip chip--accent">${escapeHtml(product.tag)}</span>
            </div>
            <h3 class="section-subhead">What you are getting</h3>
            <ul class="check-list">
              ${getMaterialHighlights(product).map((highlight) => `<li>${escapeHtml(highlight)}</li>`).join("")}
            </ul>
          </article>

          <article class="contact-card store-config-card">
            <span class="kicker">Configure Order</span>
            <p class="store-config-price">${escapeHtml(product.price)}</p>
            <h3>Choose your size, design, and quantity</h3>
            <form class="store-config-form" data-store-config-form>
              <div class="store-config-grid">
                <label>
                  Size
                  <select name="size">
                    ${product.sizes.map((size) => `<option value="${escapeHtml(size)}">${escapeHtml(size)}</option>`).join("")}
                  </select>
                </label>
                <label>
                  Design
                  <select name="design">
                    ${product.designs
                      .map((design) => `<option value="${escapeHtml(design)}">${escapeHtml(design)}</option>`)
                      .join("")}
                  </select>
                </label>
                <label>
                  Quantity
                  <input type="number" name="quantity" min="1" max="12" step="1" value="1" />
                </label>
              </div>
              <div class="store-customer-grid">
                <label>
                  Full name
                  <input type="text" name="customerName" placeholder="Your full name" required />
                </label>
                <label>
                  Email
                  <input type="email" name="customerEmail" placeholder="you@example.com" required />
                </label>
                <label>
                  Phone
                  <input type="tel" name="customerPhone" placeholder="+60..." />
                </label>
              </div>
              <p class="form-note" data-store-selection></p>
              <button
                class="btn btn-primary store-checkout-link"
                type="submit"
                data-store-checkout
              >
                Check Out
              </button>
              <p class="form-note" data-store-checkout-note></p>
              <p class="form-note">Guest checkout is available. If you are already signed in, we will also attach the order to your account automatically.</p>
            </form>
          </article>
        </div>
      </div>
      ${renderRelatedRail(product)}
    `;

    const slider = productRoot.querySelector("[data-store-slider]");
    if (slider) {
      const track = slider.querySelector("[data-store-track]");
      const slides = Array.from(slider.querySelectorAll("[data-store-slide]"));
      const dotsHost = slider.querySelector("[data-store-dots]");
      const prev = slider.querySelector("[data-store-prev]");
      const next = slider.querySelector("[data-store-next]");
      let activeIndex = 0;

      function renderDots() {
        if (!dotsHost) return;

        dotsHost.innerHTML = slides
          .map((slide, index) => {
            const artworkTitle = slide.querySelector(".store-artwork-tag");
            const label = artworkTitle ? artworkTitle.textContent : `Image ${index + 1}`;
            return `
              <button
                class="store-gallery-dot${index === activeIndex ? " is-active" : ""}"
                type="button"
                data-store-dot="${index}"
                aria-label="View ${escapeHtml(label)}"
                aria-pressed="${index === activeIndex ? "true" : "false"}"
              ></button>
            `;
          })
          .join("");

        dotsHost.querySelectorAll("[data-store-dot]").forEach((dot) => {
          dot.addEventListener("click", () => {
            activeIndex = Number(dot.getAttribute("data-store-dot") || "0");
            renderSlider();
          });
        });
      }

      function renderSlider() {
        if (!track) return;
        track.style.transform = `translateX(-${activeIndex * 100}%)`;
        slides.forEach((slide, index) => {
          slide.setAttribute("aria-hidden", index === activeIndex ? "false" : "true");
        });
        renderDots();
      }

      if (prev) {
        prev.addEventListener("click", () => {
          activeIndex = (activeIndex - 1 + slides.length) % slides.length;
          renderSlider();
        });
      }

      if (next) {
        next.addEventListener("click", () => {
          activeIndex = (activeIndex + 1) % slides.length;
          renderSlider();
        });
      }

      renderSlider();
    }

    const configForm = productRoot.querySelector("[data-store-config-form]");
    if (configForm) {
      const sizeField = configForm.querySelector("[name='size']");
      const designField = configForm.querySelector("[name='design']");
      const quantityField = configForm.querySelector("[name='quantity']");
      const customerNameField = configForm.querySelector("[name='customerName']");
      const customerEmailField = configForm.querySelector("[name='customerEmail']");
      const customerPhoneField = configForm.querySelector("[name='customerPhone']");
      const selectionNote = configForm.querySelector("[data-store-selection]");
      const checkoutLink = configForm.querySelector("[data-store-checkout]");
      const checkoutNote = configForm.querySelector("[data-store-checkout-note]");

      function syncCheckoutLink() {
        const size = String(sizeField ? sizeField.value : "").trim() || "Default";
        const design = String(designField ? designField.value : "").trim() || "Default";
        const quantityValue = Math.min(12, Math.max(1, Number(quantityField ? quantityField.value : 1) || 1));

        if (quantityField) {
          quantityField.value = String(quantityValue);
        }

        if (selectionNote) {
          selectionNote.textContent = `Selected: ${size} / ${design} / Qty ${quantityValue}`;
        }

        if (!checkoutLink) return;
        checkoutLink.disabled = false;
        checkoutLink.classList.remove("is-disabled");

        if (checkoutNote) {
          checkoutNote.textContent = "You will be sent to secure checkout after we create the live order.";
        }
      }

      [sizeField, designField, quantityField].forEach((field) => {
        if (!field) return;
        field.addEventListener("input", syncCheckoutLink);
        field.addEventListener("change", syncCheckoutLink);
      });

      configForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (!configForm.reportValidity()) {
          return;
        }

        const size = String(sizeField ? sizeField.value : "").trim() || "Default";
        const design = String(designField ? designField.value : "").trim() || "Default";
        const quantityValue = Math.min(12, Math.max(1, Number(quantityField ? quantityField.value : 1) || 1));
        const customerName = String(customerNameField ? customerNameField.value : "").trim();
        const customerEmail = String(customerEmailField ? customerEmailField.value : "").trim();
        const customerPhone = String(customerPhoneField ? customerPhoneField.value : "").trim();

        if (checkoutLink) {
          checkoutLink.disabled = true;
          checkoutLink.classList.add("is-disabled");
          checkoutLink.textContent = "Preparing Checkout...";
        }
        if (checkoutNote) {
          checkoutNote.textContent = "Preparing your live merch order...";
        }

        try {
          const headers = await buildOptionalAuthHeaders();
          const response = await window.fetch("/.netlify/functions/create-merch-checkout", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...headers,
            },
            body: JSON.stringify({
              productId: product.id,
              size,
              design,
              quantity: quantityValue,
              customerName,
              customerEmail,
              customerPhone,
            }),
          });

          const payload = await response.json().catch(() => ({}));
          if (!response.ok || !payload?.checkoutUrl) {
            throw new Error(payload?.error || "Unable to start merch checkout right now.");
          }

          if (checkoutNote) {
            checkoutNote.textContent = "Checkout is ready. Redirecting you to the secure HitPay page now...";
          }
          window.location.assign(payload.checkoutUrl);
        } catch (error) {
          if (checkoutNote) {
            checkoutNote.textContent = error?.message || "Unable to start merch checkout right now.";
          }
        } finally {
          if (checkoutLink) {
            checkoutLink.disabled = false;
            checkoutLink.classList.remove("is-disabled");
            checkoutLink.textContent = "Check Out";
          }
        }
      });

      syncCheckoutLink();
    }

    enhanceRelatedSlider(productRoot);
  }

  renderStoreIndex();
  renderStoreProduct();
})();
