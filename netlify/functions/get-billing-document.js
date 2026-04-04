const { createSignedBillingDocumentUrl } = require("./_lib/billing-documents");
const { json, methodNotAllowed, noContent } = require("./_lib/http");
const { getAuthenticatedProfile, getServiceSupabase } = require("./_lib/supabase");

function normalizeDocumentType(value) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();

  if (normalized === "invoice" || normalized === "receipt" || normalized === "refund") {
    return normalized;
  }

  return "";
}

function getDocumentFields(documentType) {
  if (documentType === "invoice") {
    return {
      numberKey: "invoice_number",
      pathKey: "invoice_storage_path",
      fallbackName: "invoice",
    };
  }

  if (documentType === "receipt") {
    return {
      numberKey: "receipt_number",
      pathKey: "receipt_storage_path",
      fallbackName: "receipt",
    };
  }

  return {
    numberKey: "refund_receipt_number",
    pathKey: "refund_receipt_storage_path",
    fallbackName: "refund-receipt",
  };
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return noContent();
  }

  if (event.httpMethod !== "GET") {
    return methodNotAllowed("GET, OPTIONS");
  }

  const orderId = String(event.queryStringParameters?.orderId || "").trim();
  const documentType = normalizeDocumentType(event.queryStringParameters?.document);

  if (!orderId || !documentType) {
    return json(400, {
      error: "orderId and a valid document type are required.",
    });
  }

  try {
    const supabase = getServiceSupabase();
    const auth = await getAuthenticatedProfile(event, supabase);
    if (!auth?.profile) {
      return json(401, { error: "A valid authenticated session is required." });
    }

    if (!["client", "super_admin"].includes(auth.profile.role)) {
      return json(403, { error: "Only clients and super admins can access billing documents." });
    }

    const { data: order, error } = await supabase
      .from("orders")
      .select(
        "id, client_id, invoice_number, invoice_storage_path, receipt_number, receipt_storage_path, refund_receipt_number, refund_receipt_storage_path"
      )
      .eq("id", orderId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!order) {
      return json(404, { error: "Order not found." });
    }

    if (auth.profile.role === "client" && order.client_id !== auth.profile.id) {
      return json(403, { error: "You do not have access to this billing document." });
    }

    const fields = getDocumentFields(documentType);
    const storagePath = order[fields.pathKey];
    const documentNumber = order[fields.numberKey] || order.id;
    if (!storagePath) {
      return json(404, { error: "This billing document is not available yet." });
    }

    const signedUrl = await createSignedBillingDocumentUrl(supabase, storagePath, documentNumber);
    return json(200, {
      ok: true,
      orderId: order.id,
      documentType,
      documentNumber,
      url: signedUrl,
    });
  } catch (error) {
    return json(500, {
      error: error?.message || "Unable to open the billing document right now.",
    });
  }
};
