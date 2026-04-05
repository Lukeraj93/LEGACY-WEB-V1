function requireEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function getBaseUrl() {
  return (process.env.APP_BASE_URL || "").replace(/\/+$/, "");
}

function getHitPayApiUrl() {
  return (process.env.HITPAY_API_URL || "https://api.hit-pay.com").replace(/\/+$/, "");
}

function getHitPayPaymentMethods() {
  return String(process.env.HITPAY_PAYMENT_METHODS || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function getInternalTestPackageEmails() {
  return String(process.env.INTERNAL_TEST_PACKAGE_EMAILS || "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

function getResendApiKey() {
  return String(process.env.RESEND_API_KEY || "").trim();
}

function getResendFromEmail() {
  return String(process.env.RESEND_FROM_EMAIL || "").trim();
}

function getResendReplyToEmail() {
  return String(process.env.RESEND_REPLY_TO_EMAIL || "").trim();
}

function getResendAdminAlertEmails() {
  return String(process.env.RESEND_ADMIN_ALERT_EMAILS || "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

module.exports = {
  getBaseUrl,
  getHitPayApiUrl,
  getHitPayPaymentMethods,
  getInternalTestPackageEmails,
  getResendAdminAlertEmails,
  getResendApiKey,
  getResendFromEmail,
  getResendReplyToEmail,
  requireEnv,
};
