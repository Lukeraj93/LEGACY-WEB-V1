const { json, methodNotAllowed, noContent } = require("./_lib/http");
const { formatCurrency, sendBillingDocumentEmail } = require("./_lib/email");
const {
  buildBillingAttachment,
  buildBillingStoragePath,
  renderBillingDocumentPdf,
  uploadBillingDocument,
} = require("./_lib/billing-documents");
const { getAuthenticatedProfile, getServiceSupabase, getUserEmailById, notifyRecipients } = require("./_lib/supabase");

function parseBody(event) {
  try {
    return JSON.parse(event.body || "{}");
  } catch (_) {
    return null;
  }
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

function buildRefundReceiptNumber(order) {
  return order?.refund_receipt_number || `${order?.external_reference || order?.id || "LEGACY"}-RF1`;
}

async function rollbackOrderState(supabase, order, payment, clientPackage) {
  const now = new Date().toISOString();

  if (clientPackage?.id) {
    await supabase
      .from("client_packages")
      .update({
        status: clientPackage.status,
        sessions_remaining: clientPackage.sessions_remaining,
        expires_at: clientPackage.expires_at,
        updated_at: now,
      })
      .eq("id", clientPackage.id);
  }

  if (payment?.id) {
    await supabase
      .from("payments")
      .update({
        status: payment.status,
        processed_at: payment.processed_at,
        updated_at: now,
      })
      .eq("id", payment.id);
  }

  if (order?.id) {
    await supabase
      .from("orders")
      .update({
        status: order.status,
        updated_at: now,
      })
      .eq("id", order.id);
  }
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return noContent();
  }

  if (event.httpMethod !== "POST") {
    return methodNotAllowed("POST, OPTIONS");
  }

  const body = parseBody(event);
  if (!body) {
    return json(400, { error: "Request body must be valid JSON." });
  }

  const orderId = String(body.orderId || "").trim();
  const action = String(body.action || "").trim();
  if (!orderId || action !== "refund_package_order") {
    return json(400, { error: "orderId and a valid financial action are required." });
  }

  try {
    const supabase = getServiceSupabase();
    const access = await getAuthenticatedProfile(event, supabase);
    if (!access) {
      return json(401, { error: "A valid admin session is required." });
    }

    if (access.profile.role !== "super_admin") {
      return json(403, { error: "Only super admins can manage financial actions." });
    }

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, client_id, status, order_type, external_reference, subtotal_amount_rm, tax_amount_rm, total_amount_rm, currency, paid_at")
      .eq("id", orderId)
      .maybeSingle();

    if (orderError) {
      throw orderError;
    }

    if (!order) {
      return json(404, { error: "Order not found." });
    }

    if (order.order_type !== "package") {
      return json(400, { error: "Only package orders can be refunded from this admin tool." });
    }

    if (order.status !== "paid") {
      return json(409, { error: "Only paid package orders can be refunded." });
    }

    const [{ data: payment, error: paymentError }, { data: clientPackage, error: packageError }] = await Promise.all([
      supabase
        .from("payments")
        .select("id, status, processed_at, amount_rm, currency, payment_method, fees_rm")
        .eq("order_id", order.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("client_packages")
        .select("id, package_name, status, sessions_purchased, sessions_remaining, expires_at")
        .eq("order_id", order.id)
        .maybeSingle(),
    ]);

    if (paymentError) {
      throw paymentError;
    }

    if (packageError) {
      throw packageError;
    }

    if (!payment || payment.status !== "succeeded") {
      return json(409, { error: "The linked payment is not in a refundable succeeded state." });
    }

    if (!clientPackage) {
      return json(409, { error: "No client package is linked to this order." });
    }

    const [{ data: linkedSessions, error: sessionError }, { data: pendingRequests, error: requestError }] = await Promise.all([
      supabase
        .from("sessions")
        .select("id, status")
        .eq("client_package_id", clientPackage.id)
        .neq("status", "cancelled")
        .limit(10),
      supabase
        .from("booking_requests")
        .select("id")
        .eq("client_package_id", clientPackage.id)
        .eq("status", "pending")
        .limit(10),
    ]);

    if (sessionError) {
      throw sessionError;
    }

    if (requestError) {
      throw requestError;
    }

    if ((linkedSessions || []).length) {
      return json(409, {
        error: "This package already has scheduled, completed, or no-show sessions attached and cannot be auto-refunded.",
      });
    }

    if ((pendingRequests || []).length) {
      return json(409, {
        error: "This package has pending booking requests. Resolve them before refunding the order.",
      });
    }

    if (Number(clientPackage.sessions_remaining || 0) !== Number(clientPackage.sessions_purchased || 0)) {
      return json(409, {
        error: "Some sessions from this package have already been consumed, so the order cannot be auto-refunded.",
      });
    }

    const now = new Date().toISOString();

    const { error: orderUpdateError } = await supabase
      .from("orders")
      .update({
        status: "refunded",
        updated_at: now,
      })
      .eq("id", order.id);

    if (orderUpdateError) {
      throw orderUpdateError;
    }

    const { error: paymentUpdateError } = await supabase
      .from("payments")
      .update({
        status: "refunded",
        processed_at: now,
        updated_at: now,
      })
      .eq("id", payment.id);

    if (paymentUpdateError) {
      await rollbackOrderState(supabase, order, payment, clientPackage).catch(() => null);
      throw paymentUpdateError;
    }

    const { error: packageUpdateError } = await supabase
      .from("client_packages")
      .update({
        status: "cancelled",
        sessions_remaining: 0,
        expires_at: now,
        updated_at: now,
      })
      .eq("id", clientPackage.id);

    if (packageUpdateError) {
      await rollbackOrderState(supabase, order, payment, clientPackage).catch(() => null);
      throw packageUpdateError;
    }

    await notifyRecipients(supabase, [
      {
        recipient_id: order.client_id,
        category: "billing",
        title: "Package Refunded",
        body: `${clientPackage.package_name || "Your package"} has been refunded and removed from your active account balance.`,
        action_url: "./client-packages.html",
      },
    ]).catch(() => null);

    const [clientEmail, clientProfileResponse, clientMemberResponse] = await Promise.all([
      getUserEmailById(supabase, order.client_id).catch(() => ""),
      supabase.from("profiles").select("display_name").eq("id", order.client_id).maybeSingle(),
      supabase.from("client_profiles").select("member_id").eq("id", order.client_id).maybeSingle(),
    ]);
    const refundReceiptNumber = buildRefundReceiptNumber(order);
    let refundAttachment = null;
    try {
      const refundBytes = await renderBillingDocumentPdf({
        title: "Refund Receipt",
        subtitle: "LEGACY+ package refund confirmation.",
        documentLabel: "Refund Ref.",
        documentNumber: refundReceiptNumber,
        documentDate: formatDocumentDate(now),
        customerName: clientProfileResponse?.data?.display_name || "LEGACY+ Client",
        customerEmail: clientEmail,
        summaryRows: [
          { label: "Client", value: clientProfileResponse?.data?.display_name || "LEGACY+ Client" },
          { label: "Member ID", value: clientMemberResponse?.data?.member_id || "Pending member ID" },
          { label: "Package", value: clientPackage.package_name || "Package" },
          { label: "Package Ref.", value: order.external_reference || refundReceiptNumber },
          { label: "Refund Status", value: "Completed" },
          ...(payment?.payment_method ? [{ label: "Original Payment Method", value: payment.payment_method }] : []),
        ],
        lineItems: [
          {
            label: clientPackage.package_name || "Package",
            description: "Package refund",
            meta: `Original receipt ${order.external_reference || order.id}`,
            quantity: 1,
            unitAmountLabel: formatCurrency(order.total_amount_rm, order.currency || payment?.currency || "MYR"),
            totalAmountLabel: formatCurrency(order.total_amount_rm, order.currency || payment?.currency || "MYR"),
          },
        ],
        totals: [
          { label: "Original Total", value: formatCurrency(order.total_amount_rm, order.currency || payment?.currency || "MYR") },
          { label: "Refunded", value: formatCurrency(order.total_amount_rm, order.currency || payment?.currency || "MYR") },
        ],
        footerNote: "Keep this refund receipt for your records. Contact LEGACY+ support if the refunded amount differs from what you expected.",
      });

      const refundStoragePath = buildBillingStoragePath({
        clientId: order.client_id,
        orderId: order.id,
        documentType: "refund",
        documentNumber: refundReceiptNumber,
      });
      await uploadBillingDocument(supabase, refundStoragePath, refundBytes);
      await supabase
        .from("orders")
        .update({
          refund_receipt_number: refundReceiptNumber,
          refund_receipt_storage_path: refundStoragePath,
        })
        .eq("id", order.id);
      refundAttachment = buildBillingAttachment(refundBytes, refundReceiptNumber);
    } catch (_) {
      refundAttachment = null;
    }

    await sendBillingDocumentEmail({
      to: clientEmail,
      subject: `Refund receipt for ${clientPackage.package_name || "your package"}`,
      eyebrow: "Refund",
      title: "Your package was refunded",
      intro: `${clientPackage.package_name || "Your package"} has been refunded and removed from your active balance.`,
      documentLabel: "Refund Ref.",
      documentNumber: refundReceiptNumber,
      documentDate: formatDocumentDate(now),
      summaryRows: [
        { label: "Client", value: clientProfileResponse?.data?.display_name || "LEGACY+ Client" },
        { label: "Member ID", value: clientMemberResponse?.data?.member_id || "Pending member ID" },
        { label: "Package", value: clientPackage.package_name || "Package" },
        { label: "Package Ref.", value: order.external_reference || refundReceiptNumber },
        { label: "Refund Status", value: "Completed" },
        ...(payment?.payment_method ? [{ label: "Original Payment Method", value: payment.payment_method }] : []),
      ],
      lineItems: [
        {
          label: clientPackage.package_name || "Package",
          description: "Package refund",
          meta: `Original receipt ${order.external_reference || order.id}`,
          quantity: 1,
          unitAmount: Number(order.total_amount_rm || 0),
          totalAmount: Number(order.total_amount_rm || 0),
        },
      ],
      totals: [
        { label: "Original Total", value: formatCurrency(order.total_amount_rm, order.currency || payment?.currency || "MYR") },
        { label: "Refunded", value: formatCurrency(order.total_amount_rm, order.currency || payment?.currency || "MYR") },
      ],
      currency: order.currency || payment?.currency || "MYR",
      ctaLabel: "Open Packages",
      ctaUrl: "./client-packages.html",
      footerNote: "If you were expecting a different refund amount, contact LEGACY+ support.",
      attachments: refundAttachment ? [refundAttachment] : undefined,
      tags: [
        { name: "category", value: "billing" },
        { name: "event", value: "package_refunded" },
      ],
    }).catch(() => null);

    return json(200, {
      ok: true,
      orderId: order.id,
      message: "Package order refunded and cancelled successfully.",
    });
  } catch (error) {
    return json(500, {
      error: error?.message || "Unable to complete the financial action.",
    });
  }
};
