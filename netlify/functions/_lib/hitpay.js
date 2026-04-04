const { getBaseUrl, getHitPayApiUrl, getHitPayPaymentMethods, requireEnv } = require("./env");

function encodePaymentRequestBody(payload) {
  const params = new URLSearchParams();

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((entry) => {
        params.append(`${key}[]`, String(entry));
      });
      return;
    }

    params.append(key, String(value));
  });

  return params.toString();
}

function buildRedirectUrl(orderId, overrideUrl) {
  if (overrideUrl) {
    return String(overrideUrl);
  }

  const baseUrl = getBaseUrl();
  if (!baseUrl) {
    return "";
  }

  const redirect = new URL("/account.html", `${baseUrl}/`);
  redirect.searchParams.set("payment", "return");
  redirect.searchParams.set("order", orderId);
  return redirect.toString();
}

async function createPaymentRequest({ amount, currency, email, name, phone, purpose, referenceNumber, orderId, redirectUrl }) {
  const apiKey = requireEnv("HITPAY_API_KEY");
  const endpoint = `${getHitPayApiUrl()}/v1/payment-requests`;
  const paymentMethods = getHitPayPaymentMethods();
  const body = encodePaymentRequestBody({
    amount: Number(amount).toFixed(2),
    currency,
    email,
    name,
    phone,
    purpose,
    reference_number: referenceNumber,
    redirect_url: buildRedirectUrl(orderId, redirectUrl),
    payment_methods: paymentMethods,
  });

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-BUSINESS-API-KEY": apiKey,
      "X-Requested-With": "XMLHttpRequest",
    },
    body,
  });

  let payload = null;

  try {
    payload = await response.json();
  } catch (_) {
    payload = null;
  }

  if (!response.ok) {
    const errorMessage = payload?.error || payload?.message || `HitPay returned HTTP ${response.status}.`;
    throw new Error(errorMessage);
  }

  return payload;
}

module.exports = {
  createPaymentRequest,
};
