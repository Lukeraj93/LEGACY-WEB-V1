const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");
const {
  LEGACY_OFFICE_ADDRESS,
  LEGACY_SUPPORT_EMAIL,
  LEGACY_SUPPORT_WHATSAPP_DISPLAY,
} = require("./legacy-support");

const BILLING_DOCUMENT_BUCKET = "billing-documents";
const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const PAGE_MARGIN = 48;

function cleanText(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/gu, " ");
}

function escapeFilenameSegment(value, fallback) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-+|-+$/gu, "");
  return normalized || fallback;
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

function buildDocumentFilename(documentNumber, fallbackPrefix) {
  const stem = escapeFilenameSegment(documentNumber, fallbackPrefix);
  return `${stem}.pdf`;
}

function buildBillingStoragePath({ clientId, orderId, documentType, documentNumber }) {
  return [
    escapeFilenameSegment(clientId, "client"),
    escapeFilenameSegment(orderId, "order"),
    `${escapeFilenameSegment(documentType, "document")}-${escapeFilenameSegment(documentNumber, "legacy-document")}.pdf`,
  ].join("/");
}

function buildBillingAttachment(bytes, filename) {
  return {
    filename: buildDocumentFilename(filename, "legacy-document"),
    content: Buffer.from(bytes).toString("base64"),
  };
}

function wrapText(text, font, fontSize, maxWidth) {
  const raw = cleanText(text);
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

function drawTextBlock(page, text, options) {
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
    blockHeight: lines.length * fontSize + Math.max(lines.length - 1, 0) * lineGap,
  };
}

async function renderBillingDocumentPdf({
  title,
  subtitle,
  documentLabel,
  documentNumber,
  documentDate,
  customerName,
  customerEmail,
  summaryRows,
  lineItems,
  totals,
  footerNote,
} = {}) {
  const pdfDoc = await PDFDocument.create();
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const accent = rgb(0.79, 0.41, 0.12);
  const accentSoft = rgb(0.97, 0.93, 0.88);
  const ink = rgb(0.11, 0.08, 0.06);
  const muted = rgb(0.42, 0.34, 0.27);
  const border = rgb(0.88, 0.83, 0.77);

  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - PAGE_MARGIN;

  const ensureSpace = (requiredHeight = 24) => {
    if (y - requiredHeight >= PAGE_MARGIN) {
      return;
    }

    page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    y = PAGE_HEIGHT - PAGE_MARGIN;
  };

  const drawSectionLabel = (label) => {
    page.drawText(cleanText(label), {
      x: PAGE_MARGIN,
      y,
      size: 10,
      font: boldFont,
      color: accent,
    });
    y -= 18;
  };

  const headerHeight = 176;
  page.drawRectangle({
    x: 0,
    y: PAGE_HEIGHT - headerHeight,
    width: PAGE_WIDTH,
    height: headerHeight,
    color: rgb(0.985, 0.972, 0.955),
  });
  page.drawRectangle({
    x: 0,
    y: PAGE_HEIGHT - 8,
    width: PAGE_WIDTH,
    height: 8,
    color: accent,
  });

  const brandY = PAGE_HEIGHT - PAGE_MARGIN + 2;
  page.drawText("LEGACY+ COACHING", {
    x: PAGE_MARGIN,
    y: brandY - 22,
    size: 14,
    font: boldFont,
    color: accent,
  });

  const headerLeftWidth = 300;
  const headerTitleTopY = brandY - 48;
  const titleBlock = drawTextBlock(page, cleanText(title) || "Billing Document", {
    x: PAGE_MARGIN,
    y: headerTitleTopY,
    width: headerLeftWidth,
    font: boldFont,
    fontSize: 24,
    color: ink,
    lineGap: 4,
  });

  const subtitleBlock = subtitle
    ? drawTextBlock(page, subtitle, {
        x: PAGE_MARGIN,
        y: titleBlock.bottomY - 8,
        width: headerLeftWidth + 20,
        font: regularFont,
        fontSize: 11,
        color: muted,
        lineGap: 3,
      })
    : { bottomY: titleBlock.bottomY };

  const metaCardWidth = 176;
  const metaCardX = PAGE_WIDTH - PAGE_MARGIN - metaCardWidth;
  const drawMetaCard = (label, value, topY) => {
    const safeValue = cleanText(value) || "Pending";
    const valueLines = wrapText(safeValue, boldFont, 12, metaCardWidth - 28);
    const cardHeight = 22 + valueLines.length * 16 + 18;
    const cardY = topY - cardHeight;
    page.drawRectangle({
      x: metaCardX,
      y: cardY,
      width: metaCardWidth,
      height: cardHeight,
      color: rgb(1, 1, 1),
      opacity: 0.16,
      borderColor: border,
      borderWidth: 1,
    });

    page.drawText(cleanText(label).toUpperCase(), {
      x: metaCardX + 14,
      y: topY - 18,
      size: 9,
      font: boldFont,
      color: muted,
    });

    let valueY = topY - 36;
    valueLines.forEach((line) => {
      page.drawText(line, {
        x: metaCardX + 14,
        y: valueY,
        size: 12,
        font: boldFont,
        color: ink,
      });
      valueY -= 16;
    });

    return cardY;
  };

  const firstCardBottom = drawMetaCard(documentLabel || "Document", documentNumber || "Pending", PAGE_HEIGHT - PAGE_MARGIN - 6);
  const secondCardBottom = drawMetaCard("Date", documentDate || formatDocumentDate(), firstCardBottom - 12);

  y = Math.min(subtitleBlock.bottomY, secondCardBottom) - 24;

  ensureSpace(100);
  drawSectionLabel("BILL TO");
  const customerBlock = drawTextBlock(page, customerName || "Client", {
    x: PAGE_MARGIN,
    y,
    width: PAGE_WIDTH - PAGE_MARGIN * 2,
    font: boldFont,
    fontSize: 15,
    color: ink,
    lineGap: 3,
  });
  y = customerBlock.bottomY;
  if (customerEmail) {
    const emailBlock = drawTextBlock(page, customerEmail, {
      x: PAGE_MARGIN,
      y,
      width: PAGE_WIDTH - PAGE_MARGIN * 2,
      font: regularFont,
      fontSize: 11,
      color: muted,
      lineGap: 3,
    });
    y = emailBlock.bottomY;
  }
  y -= 8;

  const summary = (summaryRows || []).filter((row) => row?.label && row?.value);
  if (summary.length) {
    ensureSpace(summary.length * 26 + 20);
    drawSectionLabel("SUMMARY");
    summary.forEach((row) => {
      const labelText = cleanText(row.label);
      const valueText = cleanText(row.value);
      const valueLines = wrapText(valueText, regularFont, 11, PAGE_WIDTH - PAGE_MARGIN * 2 - 150);

      page.drawText(labelText, {
        x: PAGE_MARGIN,
        y,
        size: 11,
        font: boldFont,
        color: muted,
      });

      let valueY = y;
      valueLines.forEach((line) => {
        page.drawText(line, {
          x: PAGE_MARGIN + 150,
          y: valueY,
          size: 11,
          font: regularFont,
          color: ink,
        });
        valueY -= 15;
      });

      y -= Math.max(18, valueLines.length * 15);
    });
    y -= 4;
  }

  ensureSpace(150);
  drawSectionLabel("LINE ITEMS");

  const columns = {
    item: PAGE_MARGIN,
    qty: 340,
    unit: 396,
    total: 488,
  };

  page.drawText("Item", { x: columns.item, y, size: 10, font: boldFont, color: muted });
  page.drawText("Qty", { x: columns.qty, y, size: 10, font: boldFont, color: muted });
  page.drawText("Unit", { x: columns.unit, y, size: 10, font: boldFont, color: muted });
  page.drawText("Total", { x: columns.total, y, size: 10, font: boldFont, color: muted });
  y -= 12;
  page.drawLine({
    start: { x: PAGE_MARGIN, y },
    end: { x: PAGE_WIDTH - PAGE_MARGIN, y },
    thickness: 1,
    color: border,
  });
  y -= 14;

  (lineItems || []).forEach((item) => {
    const descriptionLines = wrapText(
      [item?.label, item?.description, item?.meta].filter(Boolean).join(" | "),
      regularFont,
      11,
      columns.qty - columns.item - 16
    );

    ensureSpace(descriptionLines.length * 16 + 24);
    const rowTopY = y;
    let descriptionY = y;
    descriptionLines.forEach((line) => {
      page.drawText(line, {
        x: columns.item,
        y: descriptionY,
        size: 11,
        font: regularFont,
        color: ink,
      });
      descriptionY -= 16;
    });

    page.drawText(String(Number(item?.quantity || 0) || 1), {
      x: columns.qty,
      y: rowTopY,
      size: 11,
      font: regularFont,
      color: ink,
    });
    page.drawText(cleanText(item?.unitAmountLabel || item?.unitAmount || ""), {
      x: columns.unit,
      y: rowTopY,
      size: 11,
      font: regularFont,
      color: ink,
    });
    page.drawText(cleanText(item?.totalAmountLabel || item?.totalAmount || ""), {
      x: columns.total,
      y: rowTopY,
      size: 11,
      font: boldFont,
      color: ink,
    });

    y = descriptionY - 2;
    page.drawLine({
      start: { x: PAGE_MARGIN, y },
      end: { x: PAGE_WIDTH - PAGE_MARGIN, y },
      thickness: 1,
      color: border,
    });
    y -= 14;
  });

  const totalRows = (totals || []).filter((row) => row?.label && row?.value);
  if (totalRows.length) {
    ensureSpace(totalRows.length * 18 + 44);
    const totalsWidth = 228;
    const totalsX = PAGE_WIDTH - PAGE_MARGIN - totalsWidth;
    const totalsHeight = totalRows.length * 18 + 26;
    page.drawRectangle({
      x: totalsX,
      y: y - totalsHeight + 12,
      width: totalsWidth,
      height: totalsHeight,
      color: accentSoft,
      borderColor: border,
      borderWidth: 1,
    });

    let totalsY = y;
    totalRows.forEach((row, index) => {
      page.drawText(cleanText(row.label).toUpperCase(), {
        x: totalsX + 18,
        y: totalsY - 4,
        size: 10,
        font: boldFont,
        color: muted,
      });
      page.drawText(cleanText(row.value), {
        x: totalsX + 116,
        y: totalsY - 4,
        size: 11,
        font: index === totalRows.length - 1 ? boldFont : regularFont,
        color: ink,
      });
      totalsY -= 18;
    });
    y = totalsY - 18;
  }

  if (footerNote) {
    ensureSpace(76);
    drawSectionLabel("NOTE");
    const noteBlock = drawTextBlock(page, footerNote, {
      x: PAGE_MARGIN,
      y,
      width: PAGE_WIDTH - PAGE_MARGIN * 2,
      font: regularFont,
      fontSize: 10,
      color: muted,
      lineGap: 3,
    });
    y = noteBlock.bottomY - 8;
  }

  ensureSpace(96);
  page.drawLine({
    start: { x: PAGE_MARGIN, y },
    end: { x: PAGE_WIDTH - PAGE_MARGIN, y },
    thickness: 1,
    color: border,
  });
  y -= 18;
  page.drawText("LEGACY SUPPORT", {
    x: PAGE_MARGIN,
    y,
    size: 10,
    font: boldFont,
    color: accent,
  });
  y -= 18;
  page.drawText(`Email: ${LEGACY_SUPPORT_EMAIL}`, {
    x: PAGE_MARGIN,
    y,
    size: 10,
    font: regularFont,
    color: ink,
  });
  y -= 15;
  page.drawText(`WhatsApp: ${LEGACY_SUPPORT_WHATSAPP_DISPLAY}`, {
    x: PAGE_MARGIN,
    y,
    size: 10,
    font: regularFont,
    color: ink,
  });
  y -= 15;
  drawTextBlock(page, `Address: ${LEGACY_OFFICE_ADDRESS}`, {
    x: PAGE_MARGIN,
    y,
    width: PAGE_WIDTH - PAGE_MARGIN * 2,
    font: regularFont,
    fontSize: 10,
    color: ink,
    lineGap: 3,
  });

  return pdfDoc.save();
}

async function uploadBillingDocument(supabase, storagePath, bytes) {
  const { error } = await supabase.storage.from(BILLING_DOCUMENT_BUCKET).upload(storagePath, Buffer.from(bytes), {
    contentType: "application/pdf",
    upsert: true,
    cacheControl: "31536000",
  });

  if (error) {
    throw error;
  }

  return storagePath;
}

async function createSignedBillingDocumentUrl(supabase, storagePath, filename, expiresIn = 3600) {
  if (!storagePath) {
    return "";
  }

  const { data, error } = await supabase.storage.from(BILLING_DOCUMENT_BUCKET).createSignedUrl(storagePath, expiresIn, {
    download: buildDocumentFilename(filename, "legacy-document"),
  });

  if (error) {
    throw error;
  }

  return data?.signedUrl || "";
}

module.exports = {
  BILLING_DOCUMENT_BUCKET,
  buildBillingAttachment,
  buildBillingStoragePath,
  buildDocumentFilename,
  createSignedBillingDocumentUrl,
  formatDocumentDate,
  renderBillingDocumentPdf,
  uploadBillingDocument,
};
