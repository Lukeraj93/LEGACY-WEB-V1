const {
  getBaseUrl,
  getResendApiKey,
  getResendFromEmail,
  getResendReplyToEmail,
} = require("./env");
const {
  LEGACY_OFFICE_ADDRESS,
  LEGACY_SUPPORT_EMAIL,
  LEGACY_SUPPORT_WHATSAPP_DISPLAY,
  LEGACY_SUPPORT_WHATSAPP_URL,
  buildSupportTextLines,
} = require("./legacy-support");
const {
  buildDefaultEmailPreferences,
  buildEmailPreferencesUrl,
  isNonEssentialEmail,
  normalizeEmail,
  preferenceKeyForEmail,
} = require("./email-preferences");
const { getServiceSupabase, listAuthUsers } = require("./supabase");
const { getOrSetRuntimeCache, readRuntimeCache, writeRuntimeCache } = require("./runtime-cache");

const RESEND_API_URL = "https://api.resend.com/emails";
const RECIPIENT_PREFERENCES_CACHE_TTL_MS = 60 * 1000;
const INACTIVE_CLIENT_STATUS_CACHE_TTL_MS = 60 * 1000;
const recipientPreferencesCache = new Map();
const inactiveClientStatusCache = new Map();

function cleanText(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/gu, " ");
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/gu, "&amp;")
    .replace(/</gu, "&lt;")
    .replace(/>/gu, "&gt;")
    .replace(/"/gu, "&quot;")
    .replace(/'/gu, "&#39;");
}

function formatMetaRows(metaRows) {
  return (metaRows || [])
    .filter((row) => row?.label && row?.value)
    .map(
      (row) => `
        <tr>
          <td style="padding:10px 0;color:#b79c84;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;vertical-align:top;">${escapeHtml(row.label)}</td>
          <td style="padding:10px 0;color:#fff6e8;font-size:14px;line-height:1.55;text-align:right;">${escapeHtml(row.value)}</td>
        </tr>
      `
    )
    .join("");
}

function formatCurrency(amount, currency = "MYR") {
  const numericAmount = Number(amount || 0);
  const normalizedCurrency = String(currency || "MYR").trim().toUpperCase() || "MYR";

  try {
    return new Intl.NumberFormat("en-MY", {
      style: "currency",
      currency: normalizedCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericAmount);
  } catch (_) {
    return `${normalizedCurrency} ${numericAmount.toFixed(2)}`;
  }
}

function formatLineItemMarkup(lineItems, currency) {
  return (lineItems || [])
    .filter((item) => item?.label)
    .map((item) => {
      const quantity = Number(item.quantity || 0);
      const unitAmount = item.unitAmount === undefined || item.unitAmount === null ? "" : formatCurrency(item.unitAmount, currency);
      const totalAmount = item.totalAmount === undefined || item.totalAmount === null ? "" : formatCurrency(item.totalAmount, currency);
      const meta = cleanText(item.meta);
      return `
        <tr>
          <td style="padding:14px 0;border-bottom:1px solid rgba(218,133,55,0.14);">
            <div style="color:#fff6e8;font-size:14px;font-weight:700;">${escapeHtml(item.label)}</div>
            ${item.description ? `<div style="margin-top:4px;color:#b79c84;font-size:12px;line-height:1.6;">${escapeHtml(item.description)}</div>` : ""}
            ${meta ? `<div style="margin-top:4px;color:#8e7762;font-size:11px;line-height:1.5;">${escapeHtml(meta)}</div>` : ""}
          </td>
          <td style="padding:14px 0;border-bottom:1px solid rgba(218,133,55,0.14);color:#f7dfc7;font-size:13px;text-align:center;">${quantity || "-"}</td>
          <td style="padding:14px 0;border-bottom:1px solid rgba(218,133,55,0.14);color:#f7dfc7;font-size:13px;text-align:right;">${escapeHtml(unitAmount || "-")}</td>
          <td style="padding:14px 0;border-bottom:1px solid rgba(218,133,55,0.14);color:#fff6e8;font-size:13px;font-weight:700;text-align:right;">${escapeHtml(totalAmount || "-")}</td>
        </tr>
      `;
    })
    .join("");
}

function formatTotalRowsMarkup(totals) {
  return (totals || [])
    .filter((row) => row?.label && row?.value !== undefined && row?.value !== null && row?.value !== "")
    .map(
      (row) => `
        <tr>
          <td style="padding:8px 0;color:#b79c84;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;">${escapeHtml(cleanText(row.label))}</td>
          <td style="padding:8px 0;color:#fff6e8;font-size:14px;font-weight:700;text-align:right;">${escapeHtml(cleanText(row.value))}</td>
        </tr>
      `
    )
    .join("");
}

function buildComplianceFooterHtml(recipientEmail) {
  const preferencesUrl = buildEmailPreferencesUrl(recipientEmail);

  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:32px;border-collapse:collapse;">
      <tr>
        <td style="padding-top:24px;border-top:1px solid rgba(218,133,55,0.16);color:#9f856d;font-size:13px;line-height:1.7;">
          <div style="color:#ffb15d;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;font-weight:700;">Legacy Support</div>
          <div style="margin-top:14px;display:grid;gap:8px;">
            <div><span style="display:inline-block;min-width:74px;color:#b48d67;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;">Email</span><a href="mailto:${escapeHtml(LEGACY_SUPPORT_EMAIL)}" style="color:#d9b489;text-decoration:none;">${escapeHtml(LEGACY_SUPPORT_EMAIL)}</a></div>
            <div><span style="display:inline-block;min-width:74px;color:#b48d67;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;">WhatsApp</span><a href="${escapeHtml(LEGACY_SUPPORT_WHATSAPP_URL)}" style="color:#d9b489;text-decoration:none;">${escapeHtml(LEGACY_SUPPORT_WHATSAPP_DISPLAY)}</a></div>
            <div><span style="display:inline-block;min-width:74px;color:#b48d67;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;">Address</span>${escapeHtml(LEGACY_OFFICE_ADDRESS)}</div>
          </div>
          ${
            preferencesUrl
              ? `<div style="margin-top:18px;"><a href="${escapeHtml(preferencesUrl)}" style="color:#d9b489;text-decoration:underline;">Manage email preferences</a></div>`
              : ""
          }
        </td>
      </tr>
    </table>
  `;
}

function buildEmailDocument({ preheader, maxWidth = 640, bodyHtml }) {
  const safePreheader = cleanText(preheader) || "LEGACY+ email update";

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="x-ua-compatible" content="ie=edge" />
    <title>${escapeHtml(safePreheader)}</title>
  </head>
  <body style="margin:0;padding:0;background:#080604;font-family:Inter,Segoe UI,Helvetica,Arial,sans-serif;color:#f9ecda;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">${escapeHtml(safePreheader)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;border-collapse:collapse;background:#080604;">
      <tr>
        <td align="center" style="padding:24px 12px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:${maxWidth}px;width:100%;border-collapse:collapse;border:1px solid rgba(218,133,55,0.38);border-radius:24px;overflow:hidden;background:
            radial-gradient(circle at top right, rgba(244,150,60,0.18), transparent 34%),
            radial-gradient(circle at bottom left, rgba(182,62,15,0.22), transparent 32%),
            linear-gradient(180deg, #1a120d 0%, #100b08 100%);
            box-shadow:0 28px 80px rgba(0,0,0,0.45);">
            <tr>
              <td style="padding:0;">${bodyHtml}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function buildTextBody({ intro, metaRows, ctaUrl, footerNote, noteLabel, noteBody, preferencesUrl }) {
  const lines = [];

  if (intro) {
    lines.push(cleanText(intro), "");
  }

  (metaRows || [])
    .filter((row) => row?.label && row?.value)
    .forEach((row) => {
      lines.push(`${cleanText(row.label)}: ${cleanText(row.value)}`);
    });

  if (ctaUrl) {
    lines.push("", `Open: ${ctaUrl}`);
  }

  if (noteBody) {
    lines.push("", `${cleanText(noteLabel || "Note")}: ${cleanText(noteBody)}`);
  }

  if (footerNote) {
    lines.push("", cleanText(footerNote));
  }

  lines.push("", "LEGACY+ Support");
  buildSupportTextLines().forEach((line) => lines.push(line));
  lines.push(`WhatsApp Link: ${LEGACY_SUPPORT_WHATSAPP_URL}`);
  if (preferencesUrl) {
    lines.push(`Manage Email Preferences: ${preferencesUrl}`);
  }
  lines.push("", "LEGACY+");
  return lines.join("\n");
}

function buildBillingTextBody({
  intro,
  documentLabel,
  documentNumber,
  documentDate,
  summaryRows,
  lineItems,
  totals,
  ctaUrl,
  footerNote,
  currency,
  noteLabel,
  noteBody,
  preferencesUrl,
}) {
  const lines = [];

  if (intro) {
    lines.push(cleanText(intro), "");
  }

  if (documentLabel && documentNumber) {
    lines.push(`${cleanText(documentLabel)}: ${cleanText(documentNumber)}`);
  }

  if (documentDate) {
    lines.push(`Document Date: ${cleanText(documentDate)}`);
  }

  (summaryRows || [])
    .filter((row) => row?.label && row?.value)
    .forEach((row) => {
      lines.push(`${cleanText(row.label)}: ${cleanText(row.value)}`);
    });

  if ((lineItems || []).length) {
    lines.push("", "Items:");
    lineItems
      .filter((item) => item?.label)
      .forEach((item) => {
        const quantity = Number(item.quantity || 0) || 1;
        const totalAmount = item.totalAmount === undefined || item.totalAmount === null
          ? ""
          : formatCurrency(item.totalAmount, currency);
        const description = cleanText(item.description);
        lines.push(`- ${cleanText(item.label)} x${quantity}${totalAmount ? ` (${totalAmount})` : ""}${description ? ` | ${description}` : ""}`);
      });
  }

  (totals || [])
    .filter((row) => row?.label && row?.value)
    .forEach((row) => {
      lines.push(`${cleanText(row.label)}: ${cleanText(row.value)}`);
    });

  if (ctaUrl) {
    lines.push("", `Open: ${ctaUrl}`);
  }

  if (noteBody) {
    lines.push("", `${cleanText(noteLabel || "Note")}: ${cleanText(noteBody)}`);
  }

  if (footerNote) {
    lines.push("", cleanText(footerNote));
  }

  lines.push("", "LEGACY+ Support");
  buildSupportTextLines().forEach((line) => lines.push(line));
  lines.push(`WhatsApp Link: ${LEGACY_SUPPORT_WHATSAPP_URL}`);
  if (preferencesUrl) {
    lines.push(`Manage Email Preferences: ${preferencesUrl}`);
  }
  lines.push("", "LEGACY+");
  return lines.join("\n");
}

function normalizeRecipients(to) {
  return Array.from(
    new Set(
      (Array.isArray(to) ? to : [to])
        .map((value) => normalizeEmail(value))
        .filter(Boolean)
    )
  );
}

async function getRecipientPreferences(recipientEmail) {
  const normalizedEmail = normalizeEmail(recipientEmail);
  if (!normalizedEmail) {
    return buildDefaultEmailPreferences();
  }

  return getOrSetRuntimeCache(
    recipientPreferencesCache,
    normalizedEmail,
    RECIPIENT_PREFERENCES_CACHE_TTL_MS,
    async () => {
      try {
        const supabase = getServiceSupabase();
        const { data, error } = await supabase
          .from("app_settings")
          .select("value")
          .eq("key", preferenceKeyForEmail(normalizedEmail))
          .maybeSingle();

        if (error) {
          throw error;
        }

        return {
          ...buildDefaultEmailPreferences(),
          ...(data?.value || {}),
        };
      } catch (_) {
        return buildDefaultEmailPreferences();
      }
    }
  );
}

async function filterRecipientsByPreferences(recipients, tags) {
  if (!isNonEssentialEmail(tags)) {
    return recipients;
  }

  const decisions = await Promise.all(
    recipients.map(async (recipient) => ({
      recipient,
      preferences: await getRecipientPreferences(recipient),
    }))
  );

  return decisions
    .filter(({ preferences }) => preferences?.mode !== "essential_only" && preferences?.mode !== "pause_optional")
    .map(({ recipient }) => recipient);
}

async function filterInactiveClientRecipients(recipients) {
  if (!recipients.length) {
    return recipients;
  }

  try {
    const normalizedRecipients = recipients.map((recipient) => normalizeEmail(recipient)).filter(Boolean);
    const cachedDecisions = new Map();
    const unresolvedRecipients = [];

    normalizedRecipients.forEach((recipient) => {
      const cachedValue = readRuntimeCache(
        inactiveClientStatusCache,
        recipient,
        INACTIVE_CLIENT_STATUS_CACHE_TTL_MS
      );
      if (cachedValue !== null) {
        cachedDecisions.set(recipient, cachedValue);
      } else {
        unresolvedRecipients.push(recipient);
      }
    });

    if (unresolvedRecipients.length) {
      const supabase = getServiceSupabase();
      const authUsers = await listAuthUsers(supabase, { perPage: 200, maxPages: 20 });
      const authUserByEmail = new Map();

      authUsers.forEach((user) => {
        const email = normalizeEmail(user.email);
        if (email) {
          authUserByEmail.set(email, user.id);
        }
      });

      const matchedIds = unresolvedRecipients
        .map((recipient) => authUserByEmail.get(recipient))
        .filter(Boolean);

      let profileById = new Map();
      if (matchedIds.length) {
        const { data: profiles, error } = await supabase
          .from("profiles")
          .select("id, role, status")
          .in("id", matchedIds);

        if (error) {
          throw error;
        }

        profileById = new Map((profiles || []).map((profile) => [profile.id, profile]));
      }

      unresolvedRecipients.forEach((recipient) => {
        const userId = authUserByEmail.get(recipient);
        let allowed = true;

        if (userId) {
          const profile = profileById.get(userId);
          if (profile && profile.role === "client") {
            allowed = String(profile.status || "").trim().toLowerCase() === "active";
          }
        }

        writeRuntimeCache(inactiveClientStatusCache, recipient, allowed);
        cachedDecisions.set(recipient, allowed);
      });
    }

    return recipients.filter((recipient) => cachedDecisions.get(normalizeEmail(recipient)) !== false);
  } catch (_) {
    return recipients;
  }
}

function toAbsoluteUrl(pathOrUrl) {
  const raw = String(pathOrUrl || "").trim();
  if (!raw) {
    return "";
  }

  if (/^https?:\/\//iu.test(raw)) {
    return raw;
  }

  const normalizedBase = getBaseUrl();
  if (!normalizedBase) {
    return raw;
  }

  const normalizedPath = raw.replace(/^\.\//u, "/");
  return new URL(normalizedPath, `${normalizedBase}/`).toString();
}

function isEmailConfigured() {
  return Boolean(getResendApiKey() && getResendFromEmail());
}

async function sendEmail({ to, subject, html, text, replyTo, tags, attachments } = {}) {
  const recipients = Array.from(
    new Set(
      (Array.isArray(to) ? to : [to])
        .map((value) => String(value || "").trim())
        .filter(Boolean)
    )
  );

  if (!recipients.length) {
    return { ok: false, skipped: true, reason: "missing_recipients" };
  }

  if (!isEmailConfigured()) {
    return { ok: false, skipped: true, reason: "missing_resend_env" };
  }

  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getResendApiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: getResendFromEmail(),
      to: recipients,
      subject: cleanText(subject) || "LEGACY+ Notification",
      html,
      text,
      reply_to: replyTo || getResendReplyToEmail() || undefined,
      tags: Array.isArray(tags) ? tags.filter((tag) => tag?.name && tag?.value) : undefined,
      attachments: Array.isArray(attachments)
        ? attachments
            .filter((attachment) => attachment?.filename && attachment?.content)
            .map((attachment) => ({
              filename: cleanText(attachment.filename),
              content: attachment.content,
              content_type: attachment.content_type || undefined,
            }))
        : undefined,
    }),
  });

  const responseText = await response.text();
  let payload = {};
  try {
    payload = responseText ? JSON.parse(responseText) : {};
  } catch (_) {
    payload = { raw: responseText };
  }

  if (!response.ok) {
    const message = payload?.message || payload?.error || `Resend returned HTTP ${response.status}.`;
    const error = new Error(message);
    error.statusCode = response.status;
    error.payload = payload;
    throw error;
  }

  return {
    ok: true,
    id: payload?.id || "",
    recipients,
  };
}

async function sendNoticeEmail({
  to,
  subject,
  eyebrow,
  title,
  intro,
  metaRows,
  ctaLabel,
  ctaUrl,
  footerNote,
  replyTo,
  tags,
  attachments,
  noteLabel,
  noteBody,
} = {}) {
  const preferredRecipients = await filterRecipientsByPreferences(normalizeRecipients(to), tags);
  const recipients = await filterInactiveClientRecipients(preferredRecipients);
  if (!recipients.length) {
    return { ok: false, skipped: true, reason: "recipient_preferences_or_status" };
  }

  const resolvedCtaUrl = toAbsoluteUrl(ctaUrl);
  const safeTitle = cleanText(title) || "LEGACY+ Update";
  const safeEyebrow = cleanText(eyebrow) || "LEGACY+";
  const safeIntro = cleanText(intro);
  const safeFooter = cleanText(footerNote);
  const safeNoteLabel = cleanText(noteLabel) || "Note";
  const safeNoteBody = cleanText(noteBody);
  const detailsMarkup = formatMetaRows(metaRows);

  const deliveries = await Promise.all(
    recipients.map(async (recipient) => {
      const preferencesUrl = buildEmailPreferencesUrl(recipient);
      const html = buildEmailDocument({
        preheader: `${safeEyebrow} | ${safeTitle}`,
        maxWidth: 640,
        bodyHtml: `
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
            <tr>
              <td style="padding:32px 28px 24px;border-bottom:1px solid rgba(218,133,55,0.18);">
                <div style="color:#ffb15d;font-size:12px;letter-spacing:0.22em;text-transform:uppercase;font-weight:700;">${escapeHtml(safeEyebrow)}</div>
                <h1 style="margin:14px 0 0;font-size:32px;line-height:1.12;color:#fff7ea;">${escapeHtml(safeTitle)}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:32px 28px 28px;">
                ${safeIntro ? `<p style="margin:0 0 32px;font-size:16px;line-height:1.7;color:#f7dfc7;">${escapeHtml(safeIntro)}</p>` : ""}
                ${
                  detailsMarkup
                    ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin:0 0 32px;">
                         ${detailsMarkup}
                       </table>`
                    : ""
                }
                ${
                  resolvedCtaUrl && ctaLabel
                    ? `<table role="presentation" cellspacing="0" cellpadding="0" style="margin-top:0;border-collapse:collapse;">
                         <tr>
                           <td>
                             <a href="${escapeHtml(resolvedCtaUrl)}" style="display:inline-block;min-width:44px;min-height:44px;padding:14px 22px;border-radius:14px;background:linear-gradient(135deg,#ff9a49 0%,#ff6c1f 100%);color:#1d1108;font-size:14px;font-weight:800;letter-spacing:0.08em;line-height:1.2;text-transform:uppercase;text-decoration:none;box-sizing:border-box;">${escapeHtml(cleanText(ctaLabel))}</a>
                           </td>
                         </tr>
                       </table>`
                    : ""
                }
                ${
                  safeNoteBody
                    ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:32px;border-collapse:collapse;">
                         <tr>
                           <td style="padding:18px;border-radius:18px;background:rgba(255,177,93,0.06);border:1px solid rgba(255,177,93,0.16);">
                             <div style="color:#ffb15d;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;font-weight:700;">${escapeHtml(safeNoteLabel)}</div>
                             <p style="margin:12px 0 0;color:#f7dfc7;font-size:16px;line-height:1.7;">${escapeHtml(safeNoteBody)}</p>
                           </td>
                         </tr>
                       </table>`
                    : ""
                }
                ${
                  safeFooter
                    ? `<p style="margin:32px 0 0;font-size:14px;line-height:1.65;color:#b79c84;">${escapeHtml(safeFooter)}</p>`
                    : ""
                }
                ${buildComplianceFooterHtml(recipient)}
              </td>
            </tr>
          </table>
        `,
      });

      const text = buildTextBody({
        intro: safeIntro,
        metaRows,
        ctaUrl: resolvedCtaUrl,
        footerNote: safeFooter,
        noteLabel: safeNoteLabel,
        noteBody: safeNoteBody,
        preferencesUrl,
      });

      return sendEmail({
        to: recipient,
        subject,
        html,
        text,
        replyTo,
        tags,
        attachments,
      });
    })
  );

  return {
    ok: deliveries.every((delivery) => delivery?.ok),
    recipients,
    ids: deliveries.map((delivery) => delivery?.id || "").filter(Boolean),
    id: deliveries.find((delivery) => delivery?.id)?.id || "",
  };
}

async function sendBillingDocumentEmail({
  to,
  subject,
  eyebrow,
  title,
  intro,
  documentLabel,
  documentNumber,
  documentDate,
  summaryRows,
  lineItems,
  totals,
  currency,
  ctaLabel,
  ctaUrl,
  footerNote,
  replyTo,
  tags,
  attachments,
  noteLabel,
  noteBody,
} = {}) {
  const preferredRecipients = await filterRecipientsByPreferences(normalizeRecipients(to), tags);
  const recipients = await filterInactiveClientRecipients(preferredRecipients);
  if (!recipients.length) {
    return { ok: false, skipped: true, reason: "recipient_preferences_or_status" };
  }

  const resolvedCtaUrl = toAbsoluteUrl(ctaUrl);
  const safeTitle = cleanText(title) || "LEGACY+ Billing Update";
  const safeEyebrow = cleanText(eyebrow) || "Billing";
  const safeIntro = cleanText(intro);
  const safeFooter = cleanText(footerNote);
  const safeNoteLabel = cleanText(noteLabel) || "Note";
  const safeNoteBody = cleanText(noteBody);
  const safeCurrency = String(currency || "MYR").trim().toUpperCase() || "MYR";
  const summaryMarkup = formatMetaRows(summaryRows);
  const itemMarkup = formatLineItemMarkup(lineItems, safeCurrency);
  const totalMarkup = formatTotalRowsMarkup(totals);

  const deliveries = await Promise.all(
    recipients.map(async (recipient) => {
      const preferencesUrl = buildEmailPreferencesUrl(recipient);
      const html = buildEmailDocument({
        preheader: `${safeEyebrow} | ${safeTitle}`,
        maxWidth: 700,
        bodyHtml: `
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
            <tr>
              <td style="padding:32px 28px 24px;border-bottom:1px solid rgba(218,133,55,0.18);">
                <div style="color:#ffb15d;font-size:12px;letter-spacing:0.22em;text-transform:uppercase;font-weight:700;">${escapeHtml(safeEyebrow)}</div>
                <h1 style="margin:14px 0 0;font-size:32px;line-height:1.12;color:#fff7ea;">${escapeHtml(safeTitle)}</h1>
                ${
                  documentLabel && documentNumber
                    ? `<table role="presentation" cellspacing="0" cellpadding="0" style="margin-top:20px;border-collapse:separate;">
                         <tr>
                           <td style="min-width:228px;padding:12px 16px;border-radius:16px;background:rgba(255,255,255,0.04);border:1px solid rgba(218,133,55,0.18);color:#f7dfc7;font-size:13px;">
                             <span style="color:#b79c84;text-transform:uppercase;letter-spacing:0.12em;font-size:11px;">${escapeHtml(cleanText(documentLabel))}</span>
                             <div style="margin-top:8px;font-weight:700;line-height:1.45;">${escapeHtml(cleanText(documentNumber))}</div>
                           </td>
                         </tr>
                         ${
                           documentDate
                             ? `<tr>
                                  <td style="padding-top:16px;">
                                    <table role="presentation" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                                      <tr>
                                        <td style="min-width:196px;padding:12px 16px;border-radius:16px;background:rgba(255,255,255,0.04);border:1px solid rgba(218,133,55,0.18);color:#f7dfc7;font-size:13px;">
                                          <span style="color:#b79c84;text-transform:uppercase;letter-spacing:0.12em;font-size:11px;">Document Date</span>
                                          <div style="margin-top:8px;font-weight:700;line-height:1.45;">${escapeHtml(cleanText(documentDate))}</div>
                                        </td>
                                      </tr>
                                    </table>
                                  </td>
                                </tr>`
                             : ""
                         }
                       </table>`
                    : ""
                }
              </td>
            </tr>
            <tr>
              <td style="padding:32px 28px 28px;">
                ${safeIntro ? `<p style="margin:0 0 32px;font-size:16px;line-height:1.7;color:#f7dfc7;">${escapeHtml(safeIntro)}</p>` : ""}
                ${
                  summaryMarkup
                    ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin:0 0 32px;">
                         ${summaryMarkup}
                       </table>`
                    : ""
                }
                ${
                  itemMarkup
                    ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 32px;border-collapse:collapse;">
                         <tr>
                           <td style="padding:18px 18px 12px;border-radius:18px;background:rgba(255,255,255,0.03);border:1px solid rgba(218,133,55,0.14);">
                             <div style="margin-bottom:12px;color:#ffb15d;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;font-weight:700;">Line Items</div>
                             <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                               <thead>
                                 <tr>
                                   <th align="left" style="padding:0 0 10px;color:#b79c84;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;">Item</th>
                                   <th align="center" style="padding:0 0 10px;color:#b79c84;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;">Qty</th>
                                   <th align="right" style="padding:0 0 10px;color:#b79c84;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;">Unit</th>
                                   <th align="right" style="padding:0 0 10px;color:#b79c84;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;">Total</th>
                                 </tr>
                               </thead>
                               <tbody>${itemMarkup}</tbody>
                             </table>
                           </td>
                         </tr>
                       </table>`
                    : ""
                }
                ${
                  totalMarkup
                    ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 32px;border-collapse:collapse;">
                         <tr>
                           <td style="padding:18px;border-radius:18px;background:rgba(255,177,93,0.07);border:1px solid rgba(255,177,93,0.16);">
                             <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                               ${totalMarkup}
                             </table>
                           </td>
                         </tr>
                       </table>`
                    : ""
                }
                ${
                  resolvedCtaUrl && ctaLabel
                    ? `<table role="presentation" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                         <tr>
                           <td>
                             <a href="${escapeHtml(resolvedCtaUrl)}" style="display:inline-block;min-width:44px;min-height:44px;padding:14px 22px;border-radius:14px;background:linear-gradient(135deg,#ff9a49 0%,#ff6c1f 100%);color:#1d1108;font-size:14px;font-weight:800;letter-spacing:0.08em;line-height:1.2;text-transform:uppercase;text-decoration:none;box-sizing:border-box;">${escapeHtml(cleanText(ctaLabel))}</a>
                           </td>
                         </tr>
                       </table>`
                    : ""
                }
                ${
                  safeNoteBody
                    ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:32px;border-collapse:collapse;">
                         <tr>
                           <td style="padding:18px;border-radius:18px;background:rgba(255,177,93,0.06);border:1px solid rgba(255,177,93,0.16);">
                             <div style="color:#ffb15d;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;font-weight:700;">${escapeHtml(safeNoteLabel)}</div>
                             <p style="margin:12px 0 0;color:#f7dfc7;font-size:16px;line-height:1.7;">${escapeHtml(safeNoteBody)}</p>
                           </td>
                         </tr>
                       </table>`
                    : ""
                }
                ${
                  safeFooter
                    ? `<p style="margin:32px 0 0;font-size:14px;line-height:1.65;color:#b79c84;">${escapeHtml(safeFooter)}</p>`
                    : ""
                }
                ${buildComplianceFooterHtml(recipient)}
              </td>
            </tr>
          </table>
        `,
      });

      const text = buildBillingTextBody({
        intro: safeIntro,
        documentLabel,
        documentNumber,
        documentDate,
        summaryRows,
        lineItems,
        totals,
        ctaUrl: resolvedCtaUrl,
        footerNote: safeFooter,
        currency: safeCurrency,
        noteLabel: safeNoteLabel,
        noteBody: safeNoteBody,
        preferencesUrl,
      });

      return sendEmail({
        to: recipient,
        subject,
        html,
        text,
        replyTo,
        tags,
        attachments,
      });
    })
  );

  return {
    ok: deliveries.every((delivery) => delivery?.ok),
    recipients,
    ids: deliveries.map((delivery) => delivery?.id || "").filter(Boolean),
    id: deliveries.find((delivery) => delivery?.id)?.id || "",
  };
}

module.exports = {
  formatCurrency,
  isEmailConfigured,
  sendBillingDocumentEmail,
  sendEmail,
  sendNoticeEmail,
  toAbsoluteUrl,
};
