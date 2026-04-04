const { randomUUID } = require("crypto");
const { createPaymentRequest } = require("./_lib/hitpay");
const { errorResponse, json, methodNotAllowed, noContent, parseJsonBody } = require("./_lib/http");
const { getBaseUrl, getInternalTestPackageEmails } = require("./_lib/env");
const { formatCurrency, sendBillingDocumentEmail } = require("./_lib/email");
const { parseOptionalText, parseRequiredText } = require("./_lib/validation");
const {
  buildBillingAttachment,
  buildBillingStoragePath,
  renderBillingDocumentPdf,
  uploadBillingDocument,
} = require("./_lib/billing-documents");
const { getAuthenticatedUser, getServiceSupabase } = require("./_lib/supabase");

async function loadClientProfile(supabase, userId) {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role, display_name, phone")
    .eq("id", userId)
    .single();

  if (profileError || !profile) {
    throw new Error("Unable to load the client profile.");
  }

  const { data: clientProfile } = await supabase
    .from("client_profiles")
    .select("preferred_name, member_id")
    .eq("id", userId)
    .maybeSingle();

  return {
    ...profile,
    clientProfile,
  };
}

async function loadPackage(supabase, packageCode) {
  const { data, error } = await supabase
    .from("package_catalog")
    .select(
      [
        "id",
        "code",
        "name",
        "package_type",
        "currency",
        "price_rm",
        "sst_amount_rm",
        "gross_amount_rm",
        "sessions_included",
        "expiry_days",
        "training_format",
        "metadata",
      ].join(", ")
    )
    .eq("code", packageCode)
    .eq("is_active", true)
    .single();

  if (error || !data) {
    throw new Error("Selected package was not found.");
  }

  return data;
}

async function loadSecondaryClientByMemberId(supabase, memberId, purchaserId) {
  const normalizedMemberId = String(memberId || "").trim().toUpperCase();
  if (!normalizedMemberId) {
    throw new Error("Second member ID is required for 1-to-2 packages.");
  }

  const { data: clientRecord, error: clientError } = await supabase
    .from("client_profiles")
    .select("id, member_id, preferred_name")
    .eq("member_id", normalizedMemberId)
    .maybeSingle();

  if (clientError) {
    throw clientError;
  }

  if (!clientRecord?.id) {
    throw new Error("The second member ID could not be found.");
  }

  if (clientRecord.id === purchaserId) {
    throw new Error("Use a different member ID for the second client.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role, status, display_name")
    .eq("id", clientRecord.id)
    .maybeSingle();

  if (profileError) {
    throw profileError;
  }

  if (!profile?.id || profile.role !== "client") {
    throw new Error("The second member ID is not linked to a client account.");
  }

  if (profile.status && profile.status !== "active") {
    throw new Error("The second client account is not active yet.");
  }

  return {
    id: clientRecord.id,
    memberId: clientRecord.member_id,
    displayName: clientRecord.preferred_name || profile.display_name || "Client",
  };
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
  return `LEGACY-${year}${month}${day}-${randomPart}`;
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

function buildClientDashboardReturnUrl(orderId, purchaseStatus) {
  const baseUrl = getBaseUrl();
  if (!baseUrl) {
    return `/client-packages.html?purchase=${encodeURIComponent(purchaseStatus)}&order=${encodeURIComponent(orderId)}`;
  }

  const url = new URL("/client-packages.html", `${baseUrl}/`);
  url.searchParams.set("purchase", purchaseStatus);
  url.searchParams.set("order", orderId);
  return url.toString();
}

function parseMetadata(packageRecord) {
  if (!packageRecord?.metadata) {
    return {};
  }

  if (typeof packageRecord.metadata === "string") {
    try {
      return JSON.parse(packageRecord.metadata);
    } catch (_) {
      return {};
    }
  }

  return packageRecord.metadata;
}

function getPackageChargeAmount(packageRecord) {
  return Number(packageRecord?.price_rm || 0);
}

function describeTrainingFormat(trainingFormat) {
  return trainingFormat === "one_to_two" ? "1-to-2 Coaching" : "1-to-1 Coaching";
}

function buildLineItem(packageRecord, packageChargeAmount, secondaryClient) {
  const metadataNotes = [];
  if (Number(packageRecord?.sessions_included || 0) > 0) {
    metadataNotes.push(`${Number(packageRecord.sessions_included)} sessions`);
  }

  if (secondaryClient?.memberId) {
    metadataNotes.push(`Second member: ${secondaryClient.memberId}`);
  }

  return [
    {
      label: packageRecord.name,
      description: describeTrainingFormat(packageRecord.training_format),
      meta: metadataNotes.join(" | "),
      quantity: 1,
      unitAmount: packageChargeAmount,
      totalAmount: packageChargeAmount,
    },
  ];
}

function buildTotals(packageChargeAmount, currency) {
  return [
    { label: "Subtotal", value: formatCurrency(packageChargeAmount, currency) },
    { label: "Tax", value: formatCurrency(0, currency) },
    { label: "Total", value: formatCurrency(packageChargeAmount, currency) },
  ];
}

async function sendCheckoutInvoicePreview({
  recipientEmail,
  clientName,
  memberId,
  packageRecord,
  packageChargeAmount,
  referenceNumber,
  checkoutUrl,
  secondaryClient,
  attachment,
}) {
  if (!recipientEmail) {
    return;
  }

  await sendBillingDocumentEmail({
    to: recipientEmail,
    subject: `Your LEGACY+ invoice is ready for ${packageRecord.name}`,
    eyebrow: "Invoice",
    title: "Your invoice and payment link are ready",
    intro: `We prepared your invoice for ${packageRecord.name}. Use the secure payment link below to complete checkout and activate the package on your account.`,
    documentLabel: "Invoice No.",
    documentNumber: referenceNumber,
    documentDate: formatDocumentDate(),
    summaryRows: [
      { label: "Client", value: clientName || "LEGACY+ Client" },
      { label: "Member ID", value: memberId || "Pending member ID" },
      { label: "Format", value: describeTrainingFormat(packageRecord.training_format) },
      ...(secondaryClient?.memberId
        ? [{ label: "Second Member", value: `${secondaryClient.displayName} (${secondaryClient.memberId})` }]
        : []),
    ],
    lineItems: buildLineItem(packageRecord, packageChargeAmount, secondaryClient),
    totals: buildTotals(packageChargeAmount, packageRecord.currency),
    currency: packageRecord.currency,
    ctaLabel: "Pay Invoice",
    ctaUrl: checkoutUrl,
    footerNote: "This payment link is unique to your package request. If you did not request it, contact LEGACY+ support.",
    attachments: attachment ? [attachment] : undefined,
    tags: [
      { name: "category", value: "billing" },
      { name: "event", value: "invoice_created" },
    ],
  }).catch(() => null);
}

function isInternalTester(user) {
  const email = String(user?.email || "").trim().toLowerCase();
  if (!email) {
    return false;
  }

  if (email.endsWith("@legacycoaching.com.my")) {
    return true;
  }

  return getInternalTestPackageEmails().includes(email);
}

function toIsoDateAfterDays(days) {
  if (!Number.isFinite(days) || days <= 0) {
    return null;
  }

  const next = new Date();
  next.setUTCDate(next.getUTCDate() + days);
  return next.toISOString();
}

async function activateClientPackageDirect(supabase, order, packageRecord, options = {}) {
  const { error } = await supabase.from("client_packages").insert({
    client_id: order.client_id,
    order_id: order.id,
    package_id: packageRecord.id,
    package_name: packageRecord.name,
    sessions_purchased: Number(packageRecord.sessions_included || 0),
    sessions_remaining: Number(packageRecord.sessions_included || 0),
    activated_at: new Date().toISOString(),
    expires_at: toIsoDateAfterDays(Number(packageRecord.expiry_days || 0)),
    status: "active",
  });

  if (error) {
    throw error;
  }
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
    const packageCode = parseRequiredText(body.packageCode, {
      label: "Package code",
      maxLength: 64,
    });
    const secondMemberId = parseOptionalText(body.secondMemberId, {
      label: "Second member ID",
      maxLength: 32,
    }).toUpperCase();
    const supabase = getServiceSupabase();
    const user = await getAuthenticatedUser(event, supabase);

    if (!user) {
      return json(401, { error: "A valid client session is required." });
    }

    const profile = await loadClientProfile(supabase, user.id);
    if (profile.role !== "client") {
      return json(403, { error: "Only client accounts can purchase packages." });
    }

    const packageRecord = await loadPackage(supabase, packageCode);
    if (packageRecord.package_type !== "coaching") {
      return json(400, { error: "Only coaching packages can be purchased from this endpoint." });
    }

    const requiresSecondMember = packageRecord.training_format === "one_to_two";
    let secondaryClient = null;
    if (requiresSecondMember) {
      try {
        secondaryClient = await loadSecondaryClientByMemberId(supabase, secondMemberId, user.id);
      } catch (error) {
        return errorResponse(
          { ...error, statusCode: Number(error?.statusCode || 400), expose: true },
          "A valid second member ID is required."
        );
      }
    }

    const packageMetadata = parseMetadata(packageRecord);
    const packageChargeAmount = getPackageChargeAmount(packageRecord);
    const isInternalTestPackage = Boolean(packageMetadata.internalTest);
    if (isInternalTestPackage && !isInternalTester(user)) {
      return json(403, { error: "This internal test package is not available for this account." });
    }

    const referenceNumber = buildReferenceNumber();
    const nowIso = new Date().toISOString();
    const orderPayload = {
      client_id: user.id,
      status: isInternalTestPackage ? "paid" : "pending_payment",
      order_type: "package",
      external_reference: referenceNumber,
      subtotal_amount_rm: packageChargeAmount,
      tax_amount_rm: 0,
      total_amount_rm: packageChargeAmount,
      currency: packageRecord.currency,
      paid_at: isInternalTestPackage ? nowIso : null,
    };

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert(orderPayload)
      .select("id")
      .single();

    if (orderError || !order) {
      throw new Error("Unable to create the order record.");
    }

    const orderItemPayload = {
      order_id: order.id,
      package_id: packageRecord.id,
      package_code: packageRecord.code,
      name: packageRecord.name,
      quantity: 1,
      unit_amount_rm: packageChargeAmount,
      total_amount_rm: packageChargeAmount,
      metadata: {
        sessionsIncluded: packageRecord.sessions_included,
        expiryDays: packageRecord.expiry_days,
        trainingFormat: packageRecord.training_format || "",
        secondaryClientId: secondaryClient?.id || null,
        secondaryMemberId: secondaryClient?.memberId || null,
        secondaryClientName: secondaryClient?.displayName || null,
      },
    };

    const { error: orderItemError } = await supabase.from("order_items").insert(orderItemPayload);
    if (orderItemError) {
      throw new Error("Unable to create the order item.");
    }

    if (isInternalTestPackage) {
      const { error: paymentError } = await supabase.from("payments").insert({
        order_id: order.id,
        provider: "internal_test",
        status: "succeeded",
        amount_rm: packageChargeAmount,
        currency: packageRecord.currency,
        payment_method: "internal_test",
        processed_at: nowIso,
        raw_payload: {
          mode: "internal_test",
          packageCode: packageRecord.code,
          packageName: packageRecord.name,
        },
      });

      if (paymentError) {
        throw new Error("Unable to create the internal test payment record.");
      }

      await activateClientPackageDirect(
        supabase,
        { id: order.id, client_id: user.id },
        packageRecord,
        { secondaryClientId: secondaryClient?.id || null }
      );

      return json(200, {
        checkoutUrl: buildClientDashboardReturnUrl(order.id, "test-activated"),
        orderId: order.id,
        packageCode: packageRecord.code,
        secondMemberId: secondaryClient?.memberId || null,
        internalTest: true,
      });
    }

    const checkout = await createPaymentRequest({
      amount: packageChargeAmount,
      currency: packageRecord.currency,
      email: user.email || "",
      name: profile.display_name || profile.clientProfile?.preferred_name || user.email || "LEGACY+ Client",
      phone: profile.phone || "",
      purpose: packageRecord.name,
      referenceNumber,
      orderId: order.id,
    });

    const checkoutUrl = checkout?.url || "";
    if (!checkout?.id || !checkoutUrl) {
      throw new Error("HitPay did not return a usable checkout URL.");
    }

    const { error: updateOrderError } = await supabase
      .from("orders")
      .update({
        hitpay_payment_request_id: checkout.id,
        hitpay_checkout_url: checkoutUrl,
      })
      .eq("id", order.id);

    if (updateOrderError) {
      throw new Error("Unable to save the HitPay payment request.");
    }

    const { error: paymentError } = await supabase.from("payments").insert({
      order_id: order.id,
      provider: "hitpay",
      status: "pending",
      amount_rm: packageChargeAmount,
      currency: packageRecord.currency,
      provider_payment_request_id: checkout.id,
      raw_payload: checkout,
    });

    if (paymentError) {
      throw new Error("Unable to create the payment record.");
    }

    let invoiceAttachment = null;
    try {
      const invoiceBytes = await renderBillingDocumentPdf({
        title: "Tax Invoice",
        subtitle: "LEGACY+ coaching package purchase request.",
        documentLabel: "Invoice No.",
        documentNumber: referenceNumber,
        documentDate: formatDocumentDate(nowIso),
        customerName: profile.display_name || profile.clientProfile?.preferred_name || user.email || "LEGACY+ Client",
        customerEmail: user.email || "",
        summaryRows: [
          { label: "Client", value: profile.display_name || profile.clientProfile?.preferred_name || "Client" },
          { label: "Member ID", value: profile.clientProfile?.member_id || "Pending member ID" },
          { label: "Package", value: packageRecord.name },
          { label: "Format", value: describeTrainingFormat(packageRecord.training_format) },
          ...(secondaryClient?.memberId
            ? [{ label: "Second Member", value: `${secondaryClient.displayName} (${secondaryClient.memberId})` }]
            : []),
        ],
        lineItems: buildLineItem(packageRecord, packageChargeAmount, secondaryClient).map((item) => ({
          ...item,
          unitAmount: undefined,
          totalAmount: undefined,
          unitAmountLabel: formatCurrency(packageChargeAmount, packageRecord.currency),
          totalAmountLabel: formatCurrency(packageChargeAmount, packageRecord.currency),
        })),
        totals: buildTotals(packageChargeAmount, packageRecord.currency),
        footerNote: "Payment is due immediately to activate your package. Keep this invoice for your records.",
      });

      const invoiceStoragePath = buildBillingStoragePath({
        clientId: user.id,
        orderId: order.id,
        documentType: "invoice",
        documentNumber: referenceNumber,
      });
      await uploadBillingDocument(supabase, invoiceStoragePath, invoiceBytes);
      await supabase
        .from("orders")
        .update({
          invoice_number: referenceNumber,
          invoice_storage_path: invoiceStoragePath,
        })
        .eq("id", order.id);

      invoiceAttachment = buildBillingAttachment(invoiceBytes, referenceNumber);
    } catch (_) {
      invoiceAttachment = null;
    }

    await sendCheckoutInvoicePreview({
      recipientEmail: user.email || "",
      clientName: profile.display_name || profile.clientProfile?.preferred_name || user.email || "LEGACY+ Client",
      memberId: profile.clientProfile?.member_id || "",
      packageRecord,
      packageChargeAmount,
      referenceNumber,
      checkoutUrl,
      secondaryClient,
      attachment: invoiceAttachment,
    });

    return json(200, {
      checkoutUrl,
      orderId: order.id,
      paymentRequestId: checkout.id,
      packageCode: packageRecord.code,
      secondMemberId: secondaryClient?.memberId || null,
    });
  } catch (error) {
    return errorResponse(error, "Unable to create the package checkout.");
  }
};
