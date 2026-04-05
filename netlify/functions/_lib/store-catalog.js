const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const STORE_CATALOG_PATH = path.resolve(__dirname, "../../../assets/store-catalog.js");
const MERCH_CODE_PREFIX = "MERCH-";

let cachedCatalog = null;

function normalizeText(value) {
  return String(value || "").trim();
}

function normalizeSlug(value) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-+|-+$/gu, "");
}

function parsePrice(value) {
  const numeric = Number(String(value || "").replace(/[^0-9.]+/gu, ""));
  if (!Number.isFinite(numeric) || numeric <= 0) {
    throw new Error(`Unable to parse merch price from "${value}".`);
  }
  return Number(numeric.toFixed(2));
}

function executeCatalogScript(source) {
  const sandbox = {
    window: {
      LEGACY_STORE_IMAGE_MANIFEST: {},
    },
  };

  vm.createContext(sandbox);
  vm.runInContext(source, sandbox, {
    filename: "assets/store-catalog.js",
  });

  return Array.isArray(sandbox.window.LEGACY_STORE_CATALOG)
    ? sandbox.window.LEGACY_STORE_CATALOG
    : [];
}

function loadStoreCatalog() {
  if (cachedCatalog) {
    return cachedCatalog;
  }

  const source = fs.readFileSync(STORE_CATALOG_PATH, "utf8");
  const rawCatalog = executeCatalogScript(source);
  cachedCatalog = rawCatalog.map((product) => {
    const id = normalizeSlug(product.id || product.name);
    const sizes = Array.isArray(product.sizes) ? product.sizes.map((item) => normalizeText(item)).filter(Boolean) : [];
    const designs = Array.isArray(product.designs) ? product.designs.map((item) => normalizeText(item)).filter(Boolean) : [];

    return {
      ...product,
      id,
      priceRm: parsePrice(product.price),
      code: `${MERCH_CODE_PREFIX}${id.toUpperCase().replace(/-/gu, "_")}`,
      sizes,
      designs,
    };
  });

  return cachedCatalog;
}

function getStoreProductById(productId) {
  const normalizedId = normalizeSlug(productId);
  return loadStoreCatalog().find((product) => product.id === normalizedId) || null;
}

async function upsertStoreProductCatalogRecord(supabase, product) {
  if (!product?.id) {
    throw new Error("A valid store product is required.");
  }

  const metadata = {
    category: product.category || "",
    tag: product.tag || "",
    summary: product.summary || "",
    description: product.description || "",
    fit: product.fit || "",
    fabric: product.fabric || "",
    designs: product.designs || [],
    sizes: product.sizes || [],
    highlights: product.highlights || [],
    audiences: product.audiences || [],
    source: "legacy_store_catalog",
  };

  const payload = {
    code: product.code,
    name: product.name,
    package_type: "merch",
    commitment_kind: null,
    training_format: "merch",
    tier_code: null,
    sessions_included: null,
    expiry_days: null,
    currency: "MYR",
    price_rm: product.priceRm,
    sst_amount_rm: 0,
    gross_amount_rm: product.priceRm,
    hitpay_sku: product.id,
    is_active: true,
    metadata,
  };

  const { data, error } = await supabase
    .from("package_catalog")
    .upsert(payload, { onConflict: "code" })
    .select("id, code, name, price_rm, gross_amount_rm, currency, metadata")
    .single();

  if (error || !data) {
    throw error || new Error("Unable to upsert the merch catalog item.");
  }

  return data;
}

module.exports = {
  getStoreProductById,
  loadStoreCatalog,
  normalizeSlug,
  parsePrice,
  upsertStoreProductCatalogRecord,
};
