const { randomUUID } = require("crypto");

const { errorResponse, json, methodNotAllowed, noContent, parseJsonBody } = require("./_lib/http");
const { createPaymentRequest } = require("./_lib/hitpay");
const { getBaseUrl } = require("./_lib/env");
const { ensureSystemProfile, getAuthenticatedUser, getProfileByUserId, getServiceSupabase } = require("./_lib/supabase");
const { getStoreProductById, upsertStoreProductCatalogRecord } = require("./_lib/store-catalog");
const { parseOptionalText, parseRequiredText } = require("./_lib/validation");

function normalizeText(value) {
  return String(value || "").trim();
}

function normalizeEmail(value) {
  return normalizeText(value).toLowerCase();
}

function normalizeQuantity(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return 1;
  }
  return Math.min(12, Math.max(1, Math.round(parsed)));
}

function buildReferenceNumber() {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kuala_Lumpur",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const year = parts.find((part) => part.type === "year")?.value || `${now.getUTCFullYear()}`;
  const month = parts.find((part) => part.type === "month")?.value || `${now.getUTCMonth() + 1}`.padStart(2, "0");
  const day = parts.find((part) => part.type === "day")?.value || `${now.getUTCDate()}`.padStart(2, "0");
  const randomPart = randomUUID().replace(/-/gu, "").slice(0, 6).toUpperCase();
  return `MERCH-${year}${month}${day}-${randomPart}`;
}

function resolvePublicBaseUrl(event) {
  const headerOrigin = normalizeText(event?.headers?.origin || event?.headers?.Origin);
  if (/^https?:\/\//iu.test(headerOrigin)) {
    return headerOrigin;
  }

  const referer = normalizeText(event?.headers?.referer || event?.headers?.Referer);
  if (/^https?:\/\//iu.test(referer)) {
    try {
      const url = new URL(referer);
      return `${url.protocol}//${url.host}`;
    } catch (_) {
      // Fall through.
    }
  }

  return getBaseUrl() || "https://app.legacycoaching.com.my";
}

function buildStoreReturnUrl(event, productId, orderId) {
  const url = new URL("/store-product.html", `${resolvePublicBaseUrl(event)}/`);
  url.searchParams.set("product", productId);
  url.searchParams.set("purchase", "return");
  url.searchParams.set("order", orderId);
  return url.toString();
}

async function loadOptionalProfile(supabase, userId) {
  if (!userId) {
    return null;
  }

  return getProfileByUserId(supabase, userId);
}

function buildCustomerContext(user, profile, body) {
  const bodyName = normalizeText(body.customerName || body.name);
  const bodyEmail = normalizeEmail(body.customerEmail || body.email);
  const bodyPhone = normalizeText(body.customerPhone || body.phone);

  const displayName = bodyName || profile?.display_name || normalizeText(user?.user_metadata?.display_name) || "";
  const email = bodyEmail || normalizeEmail(user?.email);
  const phone = bodyPhone || normalizeText(profile?.phone);

  return {
    name: displayName,
    email,
    phone,
    isGuest: !user?.id,
  };
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return noContent();
  }

  if (event.httpMethod !== "POST") {
    return methodNotAllowed("POST, OPTIONS");
  }

  try {
    const body = parseJsonBody(event, {
      maxBytes: 12 * 1024,
    });
    const productId = parseRequiredText(body.productId || body.product_id, {
      label: "Product ID",
      maxLength: 80,
    });
    const size = parseOptionalText(body.size, {
      label: "Size",
      maxLength: 40,
    });
    const design = parseOptionalText(body.design, {
      label: "Design",
      maxLength: 80,
    });
    const quantity = normalizeQuantity(body.quantity);
    const supabase = getServiceSupabase();
    const user = await getAuthenticatedUser(event, supabase);
    const profile = user?.id ? await loadOptionalProfile(supabase, user.id) : null;
    const product = getStoreProductById(productId);

    if (!product) {
      return json(404, { error: "Selected merch item was not found." });
    }

    if (product.sizes.length && size && !product.sizes.includes(size)) {
      return json(400, { error: "Selected size is not available for this merch item." });
    }

    if (product.designs.length && design && !product.designs.includes(design)) {
      return json(400, { error: "Selected design is not available for this merch item." });
    }

    const customer = buildCustomerContext(user, profile, body);
    if (!customer.name) {
      return json(400, { error: "Customer name is required for merch checkout." });
    }
    if (!customer.email) {
      return json(400, { error: "Customer email is required for merch checkout." });
    }

    const merchCatalogRecord = await upsertStoreProductCatalogRecord(supabase, product);
    const referenceNumber = buildReferenceNumber();
    const purchaserProfileId = user?.id || (await ensureSystemProfile(supabase));
    const totalAmount = Number((product.priceRm * quantity).toFixed(2));

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        client_id: purchaserProfileId,
        status: "pending_payment",
        order_type: "merch",
        external_reference: referenceNumber,
        subtotal_amount_rm: totalAmount,
        tax_amount_rm: 0,
        total_amount_rm: totalAmount,
        currency: "MYR",
      })
      .select("id")
      .single();

    if (orderError || !order?.id) {
      throw orderError || new Error("Unable to create the merch order.");
    }

    const { error: itemError } = await supabase.from("order_items").insert({
      order_id: order.id,
      package_id: merchCatalogRecord.id,
      package_code: merchCatalogRecord.code,
      name: product.name,
      quantity,
      unit_amount_rm: product.priceRm,
      total_amount_rm: totalAmount,
      metadata: {
        productId: product.id,
        productCategory: product.category,
        size: size || null,
        design: design || null,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone || null,
        customerProfileId: user?.id || null,
        checkoutMode: customer.isGuest ? "guest" : "authenticated",
        summary: product.summary || "",
      },
    });

    if (itemError) {
      throw itemError;
    }

    const checkout = await createPaymentRequest({
      amount: totalAmount,
      currency: "MYR",
      email: customer.email,
      name: customer.name,
      phone: customer.phone,
      purpose: `${product.name} | LEGACY+ Merch`,
      referenceNumber,
      orderId: order.id,
      redirectUrl: buildStoreReturnUrl(event, product.id, order.id),
    });

    const checkoutUrl = String(checkout?.url || "").trim();
    if (!checkout?.id || !checkoutUrl) {
      throw new Error("HitPay did not return a usable merch checkout URL.");
    }

    const { error: orderUpdateError } = await supabase
      .from("orders")
      .update({
        hitpay_payment_request_id: checkout.id,
        hitpay_checkout_url: checkoutUrl,
      })
      .eq("id", order.id);

    if (orderUpdateError) {
      throw orderUpdateError;
    }

    const { error: paymentError } = await supabase.from("payments").insert({
      order_id: order.id,
      provider: "hitpay",
      status: "pending",
      amount_rm: totalAmount,
      currency: "MYR",
      provider_payment_request_id: checkout.id,
      raw_payload: {
        ...checkout,
        checkoutMode: customer.isGuest ? "guest" : "authenticated",
      },
    });

    if (paymentError) {
      throw paymentError;
    }

    return json(200, {
      ok: true,
      orderId: order.id,
      checkoutUrl,
      referenceNumber,
      customerMode: customer.isGuest ? "guest" : "authenticated",
      message: "Merch checkout is ready.",
    });
  } catch (error) {
    return errorResponse(error, "Unable to create the merch checkout right now.");
  }
};
