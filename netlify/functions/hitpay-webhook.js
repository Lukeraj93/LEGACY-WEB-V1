const crypto = require("crypto");
const { json, methodNotAllowed } = require("./_lib/http");
const { requireEnv } = require("./_lib/env");
const { formatCurrency, sendBillingDocumentEmail, sendNoticeEmail } = require("./_lib/email");
const {
  buildBillingAttachment,
  buildBillingStoragePath,
  renderBillingDocumentPdf,
  uploadBillingDocument,
} = require("./_lib/billing-documents");
const {
  getServiceSupabase,
  getSuperAdminEmailRecipients,
  getUserEmailById,
  notifySuperAdmins,
} = require("./_lib/supabase");

function validateSignature(payload, signature) {
  const salt = requireEnv("HITPAY_WEBHOOK_SALT");
  const digest = crypto.createHmac("sha256", salt).update(payload).digest("hex");
  const digestBuffer = Buffer.from(digest);
  const signatureBuffer = Buffer.from(signature || "");

  if (digestBuffer.length !== signatureBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(digestBuffer, signatureBuffer);
}

function toIsoDateAfterDays(days) {
  if (!Number.isFinite(days) || days <= 0) {
    return null;
  }

  const next = new Date();
  next.setUTCDate(next.getUTCDate() + days);
  return next.toISOString();
}

function formatDocumentDate(value) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-MY", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
}

function describeOrderItem(orderItem) {
  if (orderItem?.metadata?.productCategory === "Caps" || orderItem?.metadata?.productCategory === "Socks") {
    return [orderItem.metadata?.size, orderItem.metadata?.design].filter(Boolean).join(" | ");
  }

  if (orderItem?.metadata?.productCategory) {
    return [orderItem.metadata?.productCategory, orderItem.metadata?.size, orderItem.metadata?.design].filter(Boolean).join(" | ");
  }

  if (!orderItem?.metadata?.trainingFormat) {
    return "";
  }

  return orderItem.metadata.trainingFormat === "one_to_two" ? "1-to-2 Coaching" : "1-to-1 Coaching";
}

function buildReceiptNumber(order) {
  return order?.receipt_number || `${order?.external_reference || order?.id || "LEGACY"}-R1`;
}

async function markOrderFailed(supabase, orderId, paymentPayload) {
  await supabase.from("orders").update({ status: "failed" }).eq("id", orderId);
  await supabase
    .from("payments")
    .update({
      status: "failed",
      raw_payload: paymentPayload,
      processed_at: new Date().toISOString(),
    })
    .eq("order_id", orderId)
    .eq("provider", "hitpay");
}

async function activateClientPackage(supabase, order, orderItem) {
  if (order.order_type !== "package" || !orderItem?.package_id) {
    return;
  }

  const { data: existingPackage } = await supabase
    .from("client_packages")
    .select("id")
    .eq("order_id", order.id)
    .maybeSingle();

  if (existingPackage?.id) {
    return;
  }

  const expiryDays = Number(orderItem.metadata?.expiryDays || 0);
  await supabase.from("client_packages").insert({
    client_id: order.client_id,
    order_id: order.id,
    package_id: orderItem.package_id,
    package_name: orderItem.name,
    sessions_purchased: Number(orderItem.metadata?.sessionsIncluded || 0),
    sessions_remaining: Number(orderItem.metadata?.sessionsIncluded || 0),
    activated_at: new Date().toISOString(),
    expires_at: toIsoDateAfterDays(expiryDays),
    status: "active",
  });
}

async function resolveOrderCustomerContext(supabase, order, orderItem) {
  const metadata = orderItem?.metadata || {};
  const fallbackName = metadata.customerName || "LEGACY+ Customer";
  const fallbackEmail = metadata.customerEmail || "";
  const fallbackMemberId = metadata.customerProfileId ? "Linked profile" : "Guest checkout";

  if (order.order_type === "merch" && (!metadata.customerProfileId || metadata.checkoutMode === "guest")) {
    return {
      customerName: fallbackName,
      customerEmail: fallbackEmail,
      memberId: fallbackMemberId,
    };
  }

  const [profileResponse, clientProfileResponse, clientEmail] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name")
      .eq("id", order.client_id)
      .maybeSingle(),
    supabase
      .from("client_profiles")
      .select("member_id")
      .eq("id", order.client_id)
      .maybeSingle(),
    getUserEmailById(supabase, order.client_id).catch(() => ""),
  ]);

  return {
    customerName: profileResponse?.data?.display_name || fallbackName,
    customerEmail: clientEmail || fallbackEmail,
    memberId: clientProfileResponse?.data?.member_id || fallbackMemberId,
  };
}

async function notifyPaidOrder(supabase, order, orderItem, paymentPayload, processedAt, receiptAttachment) {
  const [customerContext, adminEmails] = await Promise.all([
    resolveOrderCustomerContext(supabase, order, orderItem),
    getSuperAdminEmailRecipients(supabase).catch(() => []),
  ]);

  const clientName = customerContext.customerName || "LEGACY+ Customer";
  const memberId = customerContext.memberId || "Pending member ID";
  const clientEmail = customerContext.customerEmail || "";
  const purchaseLabel = orderItem?.name || (order.order_type === "merch" ? "merch order" : "package purchase");
  const orderLabel = order.order_type === "merch" ? "Order" : "Package";
  const paidTitle = order.order_type === "merch" ? "Merch Order Paid" : "Package Purchase Paid";
  const clientIntro =
    order.order_type === "merch"
      ? `We received your payment and locked in your order for ${purchaseLabel}.`
      : `We received your payment and activated ${purchaseLabel} on your account.`;
  const clientCtaLabel = order.order_type === "merch" ? "Open Store" : "Open Packages";
  const clientCtaUrl = order.order_type === "merch" ? "./store.html" : "./client-packages.html";
  const paymentMethod = String(paymentPayload?.payment_type || paymentPayload?.payment_method || "Online payment")
    .replace(/_/gu, " ")
    .replace(/\b\w/gu, (char) => char.toUpperCase());
  const receiptNumber = buildReceiptNumber(order);
  const lineItemMeta = [];
  if (Number(orderItem?.metadata?.sessionsIncluded || 0) > 0) {
    lineItemMeta.push(`${Number(orderItem.metadata.sessionsIncluded)} sessions`);
  }
  if (orderItem?.metadata?.secondaryMemberId) {
    lineItemMeta.push(`Second member: ${orderItem.metadata.secondaryMemberId}`);
  }
  if (orderItem?.metadata?.size) {
    lineItemMeta.push(`Size: ${orderItem.metadata.size}`);
  }
  if (orderItem?.metadata?.design) {
    lineItemMeta.push(`Design: ${orderItem.metadata.design}`);
  }

  try {
    await notifySuperAdmins(supabase, {
      category: "payment",
      title: paidTitle,
      body: `${clientName} paid for ${purchaseLabel}.`,
      action_url: "./admin-financials.html",
    });
  } catch (_) {
    // Notification failures should not break payment fulfillment.
  }

  await sendBillingDocumentEmail({
    to: clientEmail,
    subject: `Receipt for ${purchaseLabel}`,
    eyebrow: "Receipt",
    title: "Your payment was received",
    intro: clientIntro,
    documentLabel: "Receipt No.",
    documentNumber: receiptNumber,
    documentDate: formatDocumentDate(processedAt),
    summaryRows: [
      { label: "Client", value: clientName },
      { label: "Member ID", value: memberId },
      { label: orderLabel, value: purchaseLabel },
      { label: `${orderLabel} Ref.`, value: order.external_reference || receiptNumber },
      { label: "Payment Method", value: paymentMethod },
    ],
    lineItems: [
      {
        label: purchaseLabel,
        description: describeOrderItem(orderItem),
        meta: lineItemMeta.join(" | "),
        quantity: Number(orderItem?.quantity || 1),
        unitAmount: Number(orderItem?.unit_amount_rm || order.total_amount_rm || 0),
        totalAmount: Number(orderItem?.total_amount_rm || order.total_amount_rm || 0),
      },
    ],
    totals: [
      { label: "Subtotal", value: formatCurrency(order.subtotal_amount_rm, order.currency) },
      { label: "Tax", value: formatCurrency(order.tax_amount_rm, order.currency) },
      { label: "Total Paid", value: formatCurrency(order.total_amount_rm, order.currency) },
    ],
    currency: order.currency,
    ctaLabel: clientCtaLabel,
    ctaUrl: clientCtaUrl,
    footerNote: "If you did not authorize this payment, contact LEGACY+ support immediately.",
    attachments: receiptAttachment ? [receiptAttachment] : undefined,
    tags: [
      { name: "category", value: "payment" },
      { name: "event", value: "order_paid" },
    ],
  }).catch(() => null);

  await sendNoticeEmail({
    to: adminEmails,
    subject: `${order.order_type === "merch" ? "Merch order" : "Package purchase"} paid: ${purchaseLabel} (${order.external_reference || receiptNumber})`,
    eyebrow: "Finance Alert",
    title: `A ${order.order_type === "merch" ? "merch" : "package"} payment was completed`,
    intro: `${clientName} paid for ${purchaseLabel}.`,
    metaRows: [
      { label: "Client", value: clientName },
      { label: "Member ID", value: memberId },
      { label: orderLabel, value: purchaseLabel },
      { label: `${orderLabel} Ref.`, value: order.external_reference || receiptNumber },
      { label: "Amount", value: formatCurrency(order.total_amount_rm, order.currency) },
      { label: "Status", value: "Paid" },
    ],
    ctaLabel: "Open Financials",
    ctaUrl: "./admin-financials.html",
    tags: [
      { name: "category", value: "payment" },
      { name: "event", value: "admin_payment_alert" },
    ],
  }).catch(() => null);
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return methodNotAllowed("POST");
  }

  const signature = event.headers["hitpay-signature"] || event.headers["Hitpay-Signature"] || "";
  const rawPayload = event.body || "";

  if (!signature || !validateSignature(rawPayload, signature)) {
    return json(401, { error: "Invalid webhook signature." });
  }

  let payload = null;

  try {
    payload = JSON.parse(rawPayload);
  } catch (_) {
    return json(400, { error: "Webhook payload must be valid JSON." });
  }

  const paymentRequestId = String(payload?.id || "").trim();
  if (!paymentRequestId) {
    return json(400, { error: "Webhook payload is missing a payment request id." });
  }

  const supabase = getServiceSupabase();
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id, client_id, order_type, status, external_reference, subtotal_amount_rm, tax_amount_rm, total_amount_rm, currency, receipt_number, receipt_storage_path")
    .eq("hitpay_payment_request_id", paymentRequestId)
    .maybeSingle();

  if (orderError) {
    return json(500, { error: "Unable to load the related order." });
  }

  if (!order?.id) {
    return json(202, { ok: true, ignored: true });
  }

  const payment = Array.isArray(payload.payments) ? payload.payments[0] : null;
  const paymentStatus = String(payment?.status || payload.status || "").toLowerCase();

  if (paymentStatus !== "succeeded" && paymentStatus !== "completed") {
    await markOrderFailed(supabase, order.id, payload);
    return json(200, { ok: true, orderId: order.id, status: "failed" });
  }

  if (order.status === "paid" && order.receipt_storage_path) {
    return json(200, { ok: true, orderId: order.id, status: "already_paid" });
  }

  const { data: orderItem, error: itemError } = await supabase
    .from("order_items")
    .select("package_id, package_code, name, quantity, unit_amount_rm, total_amount_rm, metadata")
    .eq("order_id", order.id)
    .limit(1)
    .maybeSingle();

  if (itemError) {
    return json(500, { error: "Unable to load the order item." });
  }

  const now = new Date().toISOString();
  const { error: orderUpdateError } = await supabase
    .from("orders")
    .update({
      status: "paid",
      paid_at: now,
    })
    .eq("id", order.id);

  if (orderUpdateError) {
    return json(500, { error: "Unable to mark the order as paid." });
  }

  const { error: paymentUpdateError } = await supabase
    .from("payments")
    .update({
      status: "succeeded",
      provider_payment_id: payment?.id || null,
      payment_method: payment?.payment_type || null,
      fees_rm: payment?.fees || null,
      raw_payload: payload,
      processed_at: now,
    })
    .eq("order_id", order.id)
    .eq("provider", "hitpay");

  if (paymentUpdateError) {
    return json(500, { error: "Unable to update the payment record." });
  }

  await activateClientPackage(supabase, order, orderItem);

  const receiptCustomer = await resolveOrderCustomerContext(supabase, order, orderItem);

  let receiptAttachment = null;
  try {
    const receiptNumber = buildReceiptNumber(order);
    const receiptBytes = await renderBillingDocumentPdf({
      title: "Payment Receipt",
      subtitle: order.order_type === "merch" ? "LEGACY+ merch order payment confirmation." : "LEGACY+ payment confirmation for your coaching package.",
      documentLabel: "Receipt No.",
      documentNumber: receiptNumber,
      documentDate: formatDocumentDate(now),
      customerName: receiptCustomer.customerName || "LEGACY+ Customer",
      customerEmail: receiptCustomer.customerEmail || "",
      summaryRows: [
        { label: "Client", value: receiptCustomer.customerName || "LEGACY+ Customer" },
        { label: "Member ID", value: receiptCustomer.memberId || "Guest checkout" },
        { label: order.order_type === "merch" ? "Order" : "Package", value: orderItem?.name || (order.order_type === "merch" ? "Merch Order" : "Package Purchase") },
        { label: `${order.order_type === "merch" ? "Order" : "Package"} Ref.`, value: order.external_reference || receiptNumber },
        { label: "Payment Method", value: String(payment?.payment_type || payment?.payment_method || "Online payment").replace(/_/gu, " ") },
        { label: "Status", value: "Paid" },
      ],
      lineItems: [
        {
          label: orderItem?.name || (order.order_type === "merch" ? "Merch Order" : "Package Purchase"),
          description: describeOrderItem(orderItem),
          meta: orderItem?.metadata?.secondaryMemberId ? `Second member: ${orderItem.metadata.secondaryMemberId}` : "",
          quantity: Number(orderItem?.quantity || 1),
          unitAmountLabel: formatCurrency(orderItem?.unit_amount_rm || order.total_amount_rm || 0, order.currency),
          totalAmountLabel: formatCurrency(orderItem?.total_amount_rm || order.total_amount_rm || 0, order.currency),
        },
      ],
      totals: [
        { label: "Subtotal", value: formatCurrency(order.subtotal_amount_rm, order.currency) },
        { label: "Tax", value: formatCurrency(order.tax_amount_rm, order.currency) },
        { label: "Total Paid", value: formatCurrency(order.total_amount_rm, order.currency) },
      ],
      footerNote: "Keep this receipt for your records. Contact LEGACY+ support if anything looks incorrect.",
    });

    const receiptStoragePath = buildBillingStoragePath({
      clientId: order.client_id,
      orderId: order.id,
      documentType: "receipt",
      documentNumber: receiptNumber,
    });
    await uploadBillingDocument(supabase, receiptStoragePath, receiptBytes);
    await supabase
      .from("orders")
      .update({
        receipt_number: receiptNumber,
        receipt_storage_path: receiptStoragePath,
      })
      .eq("id", order.id);
    receiptAttachment = buildBillingAttachment(receiptBytes, receiptNumber);
  } catch (_) {
    receiptAttachment = null;
  }

  await notifyPaidOrder(supabase, order, orderItem, payment, now, receiptAttachment);

  return json(200, {
    ok: true,
    orderId: order.id,
    paymentRequestId,
  });
};
