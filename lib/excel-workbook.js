const ExcelJS = require("exceljs");

function excelSerialToDate(value) {
  const serial = Number(value);
  if (!Number.isFinite(serial)) {
    return null;
  }

  const epochMs = Date.UTC(1899, 11, 30);
  return new Date(epochMs + Math.round(serial * 86400000));
}

function normalizeCellValue(value) {
  if (value === undefined || value === null) {
    return null;
  }

  if (value instanceof Date) {
    return value;
  }

  if (Array.isArray(value?.richText)) {
    return value.richText.map((part) => String(part?.text || "")).join("");
  }

  if (value?.formula !== undefined) {
    return normalizeCellValue(value.result);
  }

  if (value?.sharedFormula !== undefined) {
    return normalizeCellValue(value.result);
  }

  if (value?.hyperlink) {
    return String(value.text || value.hyperlink || "").trim();
  }

  if (value?.text !== undefined) {
    return String(value.text).trim();
  }

  if (value?.error) {
    return null;
  }

  return value;
}

function worksheetToMatrix(worksheet, { defval = null } = {}) {
  const rows = [];
  const columnCount = Math.max(worksheet.columnCount || 0, 1);

  for (let rowNumber = 1; rowNumber <= worksheet.rowCount; rowNumber += 1) {
    const row = worksheet.getRow(rowNumber);
    const effectiveColumnCount = Math.max(columnCount, row.cellCount || 0, row.actualCellCount || 0, 1);
    const values = [];

    for (let columnNumber = 1; columnNumber <= effectiveColumnCount; columnNumber += 1) {
      const cellValue = normalizeCellValue(row.getCell(columnNumber).value);
      values.push(cellValue === undefined || cellValue === "" ? defval : (cellValue ?? defval));
    }

    rows.push(values);
  }

  return rows;
}

async function loadWorkbookFromFile(filePath) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  return workbook;
}

async function loadWorkbookFromBuffer(buffer) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  return workbook;
}

function workbookToSheetMatrices(workbook, options = {}) {
  const sheets = {};
  workbook.eachSheet((worksheet) => {
    sheets[worksheet.name] = worksheetToMatrix(worksheet, options);
  });
  return sheets;
}

async function readWorkbookFileSheets(filePath, options = {}) {
  const workbook = await loadWorkbookFromFile(filePath);
  return workbookToSheetMatrices(workbook, options);
}

async function readWorkbookBufferSheets(buffer, options = {}) {
  const workbook = await loadWorkbookFromBuffer(buffer);
  return workbookToSheetMatrices(workbook, options);
}

function sheetRowsToObjects(rows = [], { defval = null } = {}) {
  if (!Array.isArray(rows) || !rows.length) {
    return [];
  }

  const headers = (rows[0] || []).map((header) => String(header || "").trim());
  return rows
    .slice(1)
    .filter((row) => Array.isArray(row) && row.some((cell) => String(cell ?? "").trim()))
    .map((row) => {
      const entry = {};
      headers.forEach((header, index) => {
        if (!header) {
          return;
        }
        const value = row[index];
        entry[header] = value === undefined || value === "" ? defval : (value ?? defval);
      });
      return entry;
    });
}

module.exports = {
  excelSerialToDate,
  readWorkbookBufferSheets,
  readWorkbookFileSheets,
  sheetRowsToObjects,
};
