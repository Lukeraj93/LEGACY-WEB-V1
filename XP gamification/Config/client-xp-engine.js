const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { readWorkbookFileSheets, sheetRowsToObjects } = require("../../lib/excel-workbook.js");

const EMBEDDED_BUNDLE = require("./LEGACY+_Codex_Bundle_v2.json");
const EMBEDDED_SCHEMA = require("./LEGACY+_Client_RulesEngine_SCHEMA_v1.json");
const EMBEDDED_IMPORT_CONTRACT = require("./LEGACY+_Codex_ImportContract_v2.json");
const EMBEDDED_WORKBOOK_SNAPSHOT = require("../Data/LEGACY+_XP_System_v2_FIXED.snapshot.json");

function resolveModuleRoot() {
  const candidates = [
    path.resolve(__dirname, ".."),
    path.resolve(process.cwd(), "XP gamification"),
    path.resolve(process.cwd(), "..", "XP gamification"),
    path.resolve(__dirname, "..", "..", "XP gamification"),
    path.resolve(__dirname, "..", "..", "..", "XP gamification"),
    path.resolve(__dirname, "..", "..", "..", "..", "XP gamification"),
  ];

  for (const candidate of candidates) {
    const configDir = path.resolve(candidate, "Config");
    const dataDir = path.resolve(candidate, "Data");
    if (fs.existsSync(configDir) && fs.existsSync(dataDir)) {
      return candidate;
    }
  }

  return null;
}

const MODULE_ROOT = resolveModuleRoot();
const CONFIG_ROOT = MODULE_ROOT ? path.resolve(MODULE_ROOT, "Config") : null;
const DATA_ROOT = MODULE_ROOT ? path.resolve(MODULE_ROOT, "Data") : null;

const DEFAULT_SETTINGS = Object.freeze({
  routineWeeklyCapXP: 300,
  monthlyCoinCap: 70,
  coinValueRM: 0.5,
  weekStart: "MON",
  countOnlyVerified: true,
});

function detectFileByPrefix(directoryPath, targetFilename) {
  if (!directoryPath || !fs.existsSync(directoryPath)) {
    throw new Error(`Unable to locate ${targetFilename} in ${directoryPath || "<unresolved-directory>"}.`);
  }
  const exactPath = path.resolve(directoryPath, targetFilename);
  if (fs.existsSync(exactPath)) {
    return exactPath;
  }

  const extension = path.extname(targetFilename);
  const basename = path.basename(targetFilename, extension);
  const candidates = fs.readdirSync(directoryPath)
    .filter((entry) => entry.startsWith(basename) && path.extname(entry) === extension)
    .sort((left, right) => left.localeCompare(right));

  if (!candidates.length) {
    throw new Error(`Unable to locate ${targetFilename} in ${directoryPath}.`);
  }

  return path.resolve(directoryPath, candidates[0]);
}

function resolveModuleFiles() {
  return {
    bundlePath: CONFIG_ROOT ? detectFileByPrefix(CONFIG_ROOT, "LEGACY+_Codex_Bundle_v2.json") : null,
    schemaPath: CONFIG_ROOT ? detectFileByPrefix(CONFIG_ROOT, "LEGACY+_Client_RulesEngine_SCHEMA_v1.json") : null,
    importContractPath: CONFIG_ROOT ? detectFileByPrefix(CONFIG_ROOT, "LEGACY+_Codex_ImportContract_v2.json") : null,
    workbookPath: DATA_ROOT ? detectFileByPrefix(DATA_ROOT, "LEGACY+_XP_System_v2_FIXED.xlsx") : null,
  };
}

function readJsonFile(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function readClientXpBundle() {
  const filePath = resolveModuleFiles().bundlePath;
  return filePath ? readJsonFile(filePath) : structuredClone(EMBEDDED_BUNDLE);
}

function readClientXpSchema() {
  const filePath = resolveModuleFiles().schemaPath;
  return filePath ? readJsonFile(filePath) : structuredClone(EMBEDDED_SCHEMA);
}

function readClientXpImportContract() {
  const filePath = resolveModuleFiles().importContractPath;
  return filePath ? readJsonFile(filePath) : structuredClone(EMBEDDED_IMPORT_CONTRACT);
}

function extractRulesEngine(bundle) {
  if (!bundle || bundle.bundleType !== "LEGACY+_Codex_Bundle") {
    throw new Error("Invalid client XP bundle: bundleType mismatch.");
  }

  const rulesEngine = bundle.contents?.rulesEngine;
  if (!rulesEngine?.settings || !Array.isArray(rulesEngine.actions)) {
    throw new Error("Invalid client XP bundle: missing rules engine settings or actions.");
  }

  return rulesEngine;
}

function getImportContract(bundle) {
  return bundle?.contents?.importContract || readClientXpImportContract();
}

function validateClientXpBundle(bundle, schema = readClientXpSchema()) {
  const rulesEngine = extractRulesEngine(bundle);
  const contract = getImportContract(bundle);
  const settings = rulesEngine.settings || {};
  const actions = rulesEngine.actions || [];
  const requiredSettings = schema?.properties?.settings?.required || [
    "routineWeeklyCapXP",
    "monthlyCoinCap",
    "coinValueRM",
    "weekStart",
  ];
  const allowedEarnTypes = contract?.entities?.actions?.validation?.earnTypeEnum || [
    "Routine",
    "Milestone",
    "Achievement",
    "Boss",
  ];

  requiredSettings.forEach((key) => {
    if (settings[key] == null) {
      throw new Error(`Client XP bundle missing required setting: ${key}`);
    }
  });

  if (!Array.isArray(actions) || !actions.length) {
    throw new Error("Client XP bundle does not contain any actions.");
  }

  actions.forEach((action, index) => {
    const actionId = String(action?.actionId || "").trim();
    if (!actionId) {
      throw new Error(`Client XP action at index ${index} is missing actionId.`);
    }
    if (!String(action?.displayName || "").trim()) {
      throw new Error(`Client XP action ${actionId} is missing displayName.`);
    }
    if (!allowedEarnTypes.includes(String(action?.earnType || "").trim())) {
      throw new Error(`Client XP action ${actionId} has invalid earnType ${action?.earnType}.`);
    }
    if (Number(action?.xp) < 0 || Number(action?.coins) < 0) {
      throw new Error(`Client XP action ${actionId} contains negative XP or coin values.`);
    }
  });

  return {
    ok: true,
    settings,
    actionsCount: actions.length,
  };
}

function normalizeSettings(input = {}) {
  return {
    routineWeeklyCapXP: Number(input.routineWeeklyCapXP ?? DEFAULT_SETTINGS.routineWeeklyCapXP),
    monthlyCoinCap: Number(input.monthlyCoinCap ?? DEFAULT_SETTINGS.monthlyCoinCap),
    coinValueRM: Number(input.coinValueRM ?? DEFAULT_SETTINGS.coinValueRM),
    weekStart: String(input.weekStart || DEFAULT_SETTINGS.weekStart).trim().toUpperCase() || "MON",
    countOnlyVerified: input.countOnlyVerified !== false,
  };
}

function buildActionRows(bundle = readClientXpBundle()) {
  const rulesEngine = extractRulesEngine(bundle);
  return rulesEngine.actions.map((action) => ({
    action_id: String(action.actionId || "").trim(),
    display_name: String(action.displayName || "").trim(),
    category: String(action.category || "").trim(),
    earn_type: String(action.earnType || "").trim(),
    xp: Number(action.xp || 0),
    coins: Number(action.coins || 0),
    is_active: action.isActive !== false,
  }));
}

function buildBossActionIds(bundle = readClientXpBundle()) {
  return buildActionRows(bundle)
    .filter((action) => action.earn_type === "Boss")
    .map((action) => action.action_id);
}

function normalizeBooleanLike(value) {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase();
  if (["yes", "y", "true", "1", "approved", "active"].includes(normalized)) {
    return true;
  }
  if (["no", "n", "false", "0", "inactive"].includes(normalized)) {
    return false;
  }
  return false;
}

function toIsoDateString(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  const normalized = String(value || "").trim();
  if (!normalized) {
    return "";
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    return normalized;
  }
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }
  return parsed.toISOString().slice(0, 10);
}

function stableSourceRef(prefix, value) {
  const hash = crypto.createHash("sha256").update(JSON.stringify(value || {})).digest("hex").slice(0, 20);
  return `${prefix}:${hash}`;
}

function normalizeMode(value) {
  const normalized = String(value || "").trim().toLowerCase();
  return normalized === "classic" ? "Classic" : "Quest";
}

function normalizeStatus(value) {
  const normalized = String(value || "").trim().toLowerCase();
  return normalized === "inactive" ? "Inactive" : "Active";
}

function workbookExists() {
  try {
    const workbookPath = resolveModuleFiles().workbookPath;
    return Boolean((workbookPath && fs.existsSync(workbookPath)) || EMBEDDED_WORKBOOK_SNAPSHOT);
  } catch (_) {
    return Boolean(EMBEDDED_WORKBOOK_SNAPSHOT);
  }
}

async function readWorkbookRows() {
  try {
    const workbookPath = resolveModuleFiles().workbookPath;
    if (workbookPath && fs.existsSync(workbookPath)) {
      const workbookSheets = await readWorkbookFileSheets(workbookPath, { defval: null });
      return Object.entries(workbookSheets).reduce((collection, [sheetName, rows]) => {
        collection[sheetName] = sheetRowsToObjects(rows, { defval: null });
        return collection;
      }, {});
    }
  } catch (_) {
    // Fall back to the embedded workbook snapshot below.
  }

  return structuredClone(EMBEDDED_WORKBOOK_SNAPSHOT || {});
}

function buildMemberRowsFromWorkbook(rows = [], contract = readClientXpImportContract()) {
  const columns = contract.entities?.members?.columns || {};
  return rows
    .map((row) => ({
      member_id: String(row?.[columns.member_id] || "").trim(),
      name: String(row?.[columns.member_name] || "").trim(),
      mode: normalizeMode(row?.[columns.mode]),
      status: normalizeStatus(row?.[columns.status]),
    }))
    .filter((row) => row.member_id && row.name);
}

function buildEventRowsFromWorkbook(rows = [], actorId = null, contract = readClientXpImportContract()) {
  const columns = contract.entities?.events?.inputColumns || {};
  return rows
    .map((row) => {
      const eventDate = toIsoDateString(row?.[columns.date]);
      const memberId = String(row?.[columns.member_id] || "").trim();
      const actionId = String(row?.[columns.action_id] || "").trim();
      const qty = Number(row?.[columns.qty] || 1);
      if (!eventDate || !memberId || !actionId) {
        return null;
      }
      return {
        event_date: eventDate,
        member_id: memberId,
        action_id: actionId,
        qty: qty > 0 ? qty : 1,
        verified: normalizeBooleanLike(row?.[columns.verified]),
        coach_profile_id: actorId,
        notes: String(row?.[columns.notes] || "").trim() || null,
        source_ref: stableSourceRef("xlsx-quicklog", {
          event_date: eventDate,
          member_id: memberId,
          action_id: actionId,
          qty: qty > 0 ? qty : 1,
          verified: normalizeBooleanLike(row?.[columns.verified]),
          notes: String(row?.[columns.notes] || "").trim() || null,
        }),
      };
    })
    .filter(Boolean);
}

function startOfIsoWeek(dateInput) {
  const date = dateInput instanceof Date ? new Date(dateInput) : new Date(`${dateInput}T00:00:00Z`);
  const utcDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = utcDate.getUTCDay() || 7;
  utcDate.setUTCDate(utcDate.getUTCDate() + 1 - day);
  return utcDate;
}

function getIsoWeekKey(dateInput) {
  const weekStart = startOfIsoWeek(dateInput);
  const thursday = new Date(weekStart);
  thursday.setUTCDate(thursday.getUTCDate() + 3);
  const year = thursday.getUTCFullYear();
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4WeekStart = startOfIsoWeek(jan4);
  const diffDays = Math.round((weekStart - jan4WeekStart) / 86400000);
  const week = Math.floor(diffDays / 7) + 1;
  return `${year}-W${String(week).padStart(2, "0")}`;
}

function getMonthKey(dateInput) {
  return String(dateInput || "").slice(0, 7);
}

function buildActionMap(actions = []) {
  return new Map(actions.map((action) => [String(action.action_id || action.actionId || "").trim(), {
    action_id: String(action.action_id || action.actionId || "").trim(),
    display_name: String(action.display_name || action.displayName || "").trim(),
    category: String(action.category || "").trim(),
    earn_type: String(action.earn_type || action.earnType || "").trim(),
    xp: Number(action.xp || 0),
    coins: Number(action.coins || 0),
    is_active: action.is_active !== false,
  }]));
}

function computeWeeklySummary(events = [], actions = [], settings = DEFAULT_SETTINGS) {
  const actionMap = buildActionMap(actions);
  const resolvedSettings = normalizeSettings(settings);
  const groups = new Map();

  events.forEach((event) => {
    const eventDate = toIsoDateString(event.event_date || event.eventDate);
    const memberId = String(event.member_id || event.memberId || "").trim();
    const actionId = String(event.action_id || event.actionId || "").trim();
    const action = actionMap.get(actionId);
    if (!eventDate || !memberId || !action || (resolvedSettings.countOnlyVerified && !event.verified)) {
      return;
    }

    const key = `${memberId}::${getIsoWeekKey(eventDate)}`;
    const bucket = groups.get(key) || {
      member_id: memberId,
      week_key: getIsoWeekKey(eventDate),
      routine_xp_raw: 0,
      uncapped_xp: 0,
      weekly_xp_counted: 0,
      coins_raw_week: 0,
    };
    const qty = Number(event.qty ?? 1);
    const xpRaw = Number(action.xp || 0) * qty;
    const coinsRaw = Number(action.coins || 0) * qty;

    if (action.earn_type === "Routine") {
      bucket.routine_xp_raw += xpRaw;
    } else {
      bucket.uncapped_xp += xpRaw;
    }
    bucket.coins_raw_week += coinsRaw;
    groups.set(key, bucket);
  });

  return Array.from(groups.values()).map((row) => {
    const routine_xp_counted = Math.min(row.routine_xp_raw, resolvedSettings.routineWeeklyCapXP);
    const overcap_routine_xp = Math.max(0, row.routine_xp_raw - resolvedSettings.routineWeeklyCapXP);
    const weekly_xp_counted = routine_xp_counted + row.uncapped_xp;
    return {
      ...row,
      routine_xp_counted,
      overcap_routine_xp,
      weekly_xp_counted,
    };
  });
}

function computeMonthlySummary(events = [], actions = [], settings = DEFAULT_SETTINGS) {
  const actionMap = buildActionMap(actions);
  const resolvedSettings = normalizeSettings(settings);
  const groups = new Map();

  events.forEach((event) => {
    const eventDate = toIsoDateString(event.event_date || event.eventDate);
    const memberId = String(event.member_id || event.memberId || "").trim();
    const actionId = String(event.action_id || event.actionId || "").trim();
    const action = actionMap.get(actionId);
    if (!eventDate || !memberId || !action || (resolvedSettings.countOnlyVerified && !event.verified)) {
      return;
    }

    const key = `${memberId}::${getMonthKey(eventDate)}`;
    const bucket = groups.get(key) || {
      member_id: memberId,
      month_key: getMonthKey(eventDate),
      coins_raw_month: 0,
    };
    const qty = Number(event.qty ?? 1);
    bucket.coins_raw_month += Number(action.coins || 0) * qty;
    groups.set(key, bucket);
  });

  return Array.from(groups.values()).map((row) => {
    const coins_counted_month = Math.min(row.coins_raw_month, resolvedSettings.monthlyCoinCap);
    const overcap_coins = Math.max(0, row.coins_raw_month - resolvedSettings.monthlyCoinCap);
    const worth_rm = coins_counted_month * resolvedSettings.coinValueRM;
    return {
      ...row,
      coins_counted_month,
      overcap_coins,
      worth_rm,
    };
  });
}

function computeLedger({ members = [], events = [], actions = [], redemptions = [], settings = DEFAULT_SETTINGS }) {
  const weekly = computeWeeklySummary(events, actions, settings);
  const monthly = computeMonthlySummary(events, actions, settings);
  const weeklyByMember = new Map();
  const monthlyByMember = new Map();
  const redeemedByMember = new Map();

  weekly.forEach((row) => {
    weeklyByMember.set(row.member_id, Number(weeklyByMember.get(row.member_id) || 0) + Number(row.weekly_xp_counted || 0));
  });
  monthly.forEach((row) => {
    monthlyByMember.set(row.member_id, Number(monthlyByMember.get(row.member_id) || 0) + Number(row.coins_counted_month || 0));
  });
  redemptions.forEach((row) => {
    const memberId = String(row.member_id || row.memberId || "").trim();
    redeemedByMember.set(memberId, Number(redeemedByMember.get(memberId) || 0) + Number(row.coins || 0));
  });

  return members.map((member) => {
    const memberId = String(member.member_id || member.memberId || "").trim();
    const totalXp = Number(weeklyByMember.get(memberId) || 0);
    const level = Math.min(100, Math.floor(Math.sqrt(totalXp)));
    const nextLevelXP = level >= 100 ? 10000 : (level + 1) ** 2;
    const xpToNext = level >= 100 ? 0 : Math.max(nextLevelXP - totalXp, 0);
    const coinsEarnedCounted = Number(monthlyByMember.get(memberId) || 0);
    const coinsRedeemed = Number(redeemedByMember.get(memberId) || 0);
    return {
      member_id: memberId,
      name: member.name || member.member_name || memberId,
      mode: member.mode || "Quest",
      status: member.status || "Active",
      total_xp: totalXp,
      level,
      next_level_xp: nextLevelXP,
      xp_to_next: xpToNext,
      coins_earned_counted: coinsEarnedCounted,
      coins_redeemed: coinsRedeemed,
      coin_balance: coinsEarnedCounted - coinsRedeemed,
    };
  });
}

module.exports = {
  MODULE_ROOT,
  resolveModuleFiles,
  readClientXpBundle,
  readClientXpSchema,
  readClientXpImportContract,
  extractRulesEngine,
  getImportContract,
  validateClientXpBundle,
  normalizeSettings,
  buildActionRows,
  buildBossActionIds,
  normalizeBooleanLike,
  normalizeMode,
  normalizeStatus,
  toIsoDateString,
  stableSourceRef,
  workbookExists,
  readWorkbookRows,
  buildMemberRowsFromWorkbook,
  buildEventRowsFromWorkbook,
  getIsoWeekKey,
  getMonthKey,
  computeWeeklySummary,
  computeMonthlySummary,
  computeLedger,
};
