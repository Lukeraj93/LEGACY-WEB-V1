const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");
const { methodNotAllowed, noContent, json } = require("./_lib/http");
const { getAuthenticatedProfile, getServiceSupabase } = require("./_lib/supabase");
const { loadAccountRecord } = require("./load-account-records");

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const PAGE_MARGIN = 44;
const CONTENT_WIDTH = PAGE_WIDTH - PAGE_MARGIN * 2;

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function normalizeRole(value, allowAll = false) {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "client" || normalized === "coach") {
    return normalized;
  }
  return allowAll ? "all" : "";
}

function cleanText(value, fallback = "—") {
  const normalized = String(value ?? "")
    .trim()
    .replace(/\s+/gu, " ");
  return normalized || fallback;
}

function escapeFilenameSegment(value, fallback) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-+|-+$/gu, "");
  return normalized || fallback;
}

function wrapText(text, font, fontSize, maxWidth) {
  const raw = cleanText(text, "");
  if (!raw) {
    return [""];
  }

  const words = raw.split(" ");
  const lines = [];
  let current = "";

  words.forEach((word) => {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, fontSize) <= maxWidth) {
      current = candidate;
      return;
    }

    if (current) {
      lines.push(current);
      current = word;
      return;
    }

    let segment = "";
    for (const character of word) {
      const nextSegment = `${segment}${character}`;
      if (font.widthOfTextAtSize(nextSegment, fontSize) <= maxWidth || !segment) {
        segment = nextSegment;
      } else {
        lines.push(segment);
        segment = character;
      }
    }

    current = segment;
  });

  if (current) {
    lines.push(current);
  }

  return lines.length ? lines : [raw];
}

function drawWrappedText(page, text, options) {
  const {
    x,
    y,
    width,
    font,
    fontSize,
    color,
    lineGap = 4,
  } = options;

  const lines = wrapText(text, font, fontSize, width);
  let cursorY = y;
  lines.forEach((line) => {
    page.drawText(line, {
      x,
      y: cursorY,
      size: fontSize,
      font,
      color,
    });
    cursorY -= fontSize + lineGap;
  });

  return {
    lines,
    bottomY: cursorY,
    height: lines.length * fontSize + Math.max(lines.length - 1, 0) * lineGap,
  };
}

function normalizeFields(fields) {
  return Array.isArray(fields)
    ? fields.filter((field) => field?.label && field.value !== undefined && field.value !== null && String(field.value).trim() && field.value !== "—")
    : [];
}

function buildSections(record) {
  const sections = [];
  const pushSection = (title, fields) => {
    const normalized = normalizeFields(fields);
    if (normalized.length) {
      sections.push({ title, fields: normalized });
    }
  };

  pushSection("Account", record.sections?.account);
  pushSection("Registration", record.sections?.registration);
  pushSection("Payout", record.sections?.payout);
  pushSection("Waiver", record.sections?.waiver);
  pushSection("Audit", record.sections?.audit);
  return sections;
}

function buildFilename(record) {
  const rolePrefix = record.role === "coach" ? "coach" : "client";
  const stem = escapeFilenameSegment(record.displayName || record.id, rolePrefix);
  return `${stem}-registration-record.pdf`;
}

function parseDataUrl(dataUrl) {
  const match = String(dataUrl || "").match(/^data:(image\/png|image\/jpeg|image\/jpg);base64,(.+)$/u);
  if (!match) {
    return null;
  }
  return {
    mimeType: match[1],
    bytes: Buffer.from(match[2], "base64"),
  };
}

async function renderRecordPdf(record) {
  const pdfDoc = await PDFDocument.create();
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const ink = rgb(0.11, 0.08, 0.06);
  const muted = rgb(0.42, 0.34, 0.27);
  const accent = record.role === "coach"
    ? rgb(0.29, 0.47, 0.74)
    : rgb(0.79, 0.41, 0.12);
  const accentSoft = rgb(0.985, 0.972, 0.955);
  const border = rgb(0.87, 0.82, 0.76);

  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - PAGE_MARGIN;

  const startNewPage = () => {
    page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    y = PAGE_HEIGHT - PAGE_MARGIN;
  };

  const ensureSpace = (requiredHeight) => {
    if (y - requiredHeight >= PAGE_MARGIN) {
      return;
    }
    startNewPage();
  };

  page.drawRectangle({
    x: 0,
    y: PAGE_HEIGHT - 138,
    width: PAGE_WIDTH,
    height: 138,
    color: accentSoft,
  });
  page.drawRectangle({
    x: 0,
    y: PAGE_HEIGHT - 8,
    width: PAGE_WIDTH,
    height: 8,
    color: accent,
  });

  page.drawText("LEGACY+ REGISTRATION RECORD", {
    x: PAGE_MARGIN,
    y: PAGE_HEIGHT - 40,
    size: 12,
    font: boldFont,
    color: accent,
  });

  const titleBlock = drawWrappedText(page, cleanText(record.displayName || "Account Record"), {
    x: PAGE_MARGIN,
    y: PAGE_HEIGHT - 74,
    width: CONTENT_WIDTH - 180,
    font: boldFont,
    fontSize: 24,
    color: ink,
    lineGap: 3,
  });

  const roleLabel = record.role === "coach" ? "Coach account" : "Client account";
  drawWrappedText(page, `${roleLabel} • ${cleanText(record.status || "active")}`, {
    x: PAGE_MARGIN,
    y: titleBlock.bottomY - 4,
    width: CONTENT_WIDTH - 180,
    font: regularFont,
    fontSize: 11,
    color: muted,
    lineGap: 2,
  });

  const metaBoxX = PAGE_WIDTH - PAGE_MARGIN - 168;
  const metaBoxY = PAGE_HEIGHT - 106;
  page.drawRectangle({
    x: metaBoxX,
    y: metaBoxY,
    width: 168,
    height: 66,
    color: rgb(1, 1, 1),
    opacity: 0.18,
    borderColor: border,
    borderWidth: 1,
  });
  page.drawText("Exported", {
    x: metaBoxX + 14,
    y: metaBoxY + 42,
    size: 9,
    font: boldFont,
    color: muted,
  });
  page.drawText(new Intl.DateTimeFormat("en-MY", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kuala_Lumpur",
  }).format(new Date()), {
    x: metaBoxX + 14,
    y: metaBoxY + 24,
    size: 10,
    font: regularFont,
    color: ink,
  });

  y = PAGE_HEIGHT - 162;

  const sections = buildSections(record);
  sections.forEach((section) => {
    ensureSpace(70);
    page.drawText(section.title.toUpperCase(), {
      x: PAGE_MARGIN,
      y,
      size: 10,
      font: boldFont,
      color: accent,
    });
    y -= 18;

    section.fields.forEach((field) => {
      const labelText = cleanText(field.label, "");
      const valueText = cleanText(field.value, "");
      const valueLines = wrapText(valueText, regularFont, 10.5, CONTENT_WIDTH - 28);
      const blockHeight = 20 + Math.max(1, valueLines.length) * 14 + 14;
      ensureSpace(blockHeight + 10);

      page.drawRectangle({
        x: PAGE_MARGIN,
        y: y - blockHeight + 6,
        width: CONTENT_WIDTH,
        height: blockHeight,
        color: rgb(1, 1, 1),
        opacity: 0.08,
        borderColor: border,
        borderWidth: 1,
      });

      page.drawText(labelText.toUpperCase(), {
        x: PAGE_MARGIN + 14,
        y: y - 14,
        size: 8.5,
        font: boldFont,
        color: muted,
      });

      drawWrappedText(page, valueText, {
        x: PAGE_MARGIN + 14,
        y: y - 32,
        width: CONTENT_WIDTH - 28,
        font: regularFont,
        fontSize: 10.5,
        color: ink,
        lineGap: 3,
      });

      y -= blockHeight + 10;
    });

    y -= 6;
  });

  if (record.signatureDataUrl) {
    const imageAsset = parseDataUrl(record.signatureDataUrl);
    if (imageAsset) {
      const image = imageAsset.mimeType.includes("png")
        ? await pdfDoc.embedPng(imageAsset.bytes)
        : await pdfDoc.embedJpg(imageAsset.bytes);
      const scale = Math.min(280 / image.width, 120 / image.height, 1);
      const imageWidth = image.width * scale;
      const imageHeight = image.height * scale;

      ensureSpace(imageHeight + 70);
      page.drawText("SIGNATURE PREVIEW", {
        x: PAGE_MARGIN,
        y,
        size: 10,
        font: boldFont,
        color: accent,
      });
      y -= 18;

      page.drawRectangle({
        x: PAGE_MARGIN,
        y: y - imageHeight - 16,
        width: Math.max(imageWidth + 24, 220),
        height: imageHeight + 24,
        color: rgb(1, 1, 1),
        opacity: 0.08,
        borderColor: border,
        borderWidth: 1,
      });
      page.drawImage(image, {
        x: PAGE_MARGIN + 12,
        y: y - imageHeight - 4,
        width: imageWidth,
        height: imageHeight,
      });
      y -= imageHeight + 34;
    }
  }

  page.drawText("Generated from the LEGACY+ admin registration and waiver record viewer.", {
    x: PAGE_MARGIN,
    y: PAGE_MARGIN - 8,
    size: 8.5,
    font: regularFont,
    color: muted,
  });

  return pdfDoc.save();
}

async function handler(event) {
  if (event.httpMethod === "OPTIONS") {
    return noContent({ "Cache-Control": "no-store" });
  }

  if (event.httpMethod !== "GET") {
    return methodNotAllowed("GET, OPTIONS");
  }

  const supabase = getServiceSupabase();
  try {
    const auth = await getAuthenticatedProfile(event, supabase);
    if (!auth?.profile) {
      return json(401, { error: "A valid authenticated session is required." }, { "Cache-Control": "no-store" });
    }

    if (auth.profile.role !== "super_admin") {
      return json(403, { error: "Super admin access is required." }, { "Cache-Control": "no-store" });
    }

    const role = normalizeRole(event.queryStringParameters?.role, true);
    const accountId = String(event.queryStringParameters?.accountId || "").trim();
    if (!accountId) {
      throw createHttpError(400, "An account record must be selected before exporting a PDF.");
    }

    const record = await loadAccountRecord(supabase, role, accountId);
    const pdfBytes = await renderRecordPdf(record);
    const filename = buildFilename(record);

    return {
      statusCode: 200,
      isBase64Encoded: true,
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
      body: Buffer.from(pdfBytes).toString("base64"),
    };
  } catch (error) {
    return json(
      Number(error?.statusCode || 500),
      { error: error?.message || "Unable to generate the account record PDF right now." },
      { "Cache-Control": "no-store" }
    );
  }
}

module.exports = {
  handler,
};
