const { excelSerialToDate, readWorkbookBufferSheets } = require("../../../lib/excel-workbook.js");
const athleteEngine = require("../../../planner-athlete-engine.js");

const SHEET_CONFIG = {
  Runner_Coach: {
    kind: "runner",
    category: "runner",
    audience: "5K to marathon or trail athletes",
    titlePrefix: "Runner",
    inputMap: {
      "Athlete name": { key: "athleteName", type: "text" },
      "Sex": { key: "sex", type: "text" },
      "Age": { key: "ageYears", type: "number" },
      "Body mass (kg)": { key: "bodyMassKg", type: "number" },
      "Assessment date": { key: "assessmentDate", type: "date" },
      "Goal date": { key: "goalDate", type: "date" },
      "Goal event": { key: "goalEvent", type: "text" },
      "Training age": { key: "trainingAgeLevel", type: "text" },
      "Days available / wk": { key: "daysAvailablePerWeek", type: "number" },
      "Current weekly volume (km)": { key: "runnerCurrentWeeklyKm", type: "number" },
      "Current long run (km)": { key: "runnerCurrentLongRunKm", type: "number" },
      "Latest race distance (km)": { key: "runnerLatestRaceDistanceKm", type: "number" },
      "Latest race time (min)": { key: "runnerLatestRaceTimeMin", type: "number" },
      "Threshold pace (min/km, optional)": { key: "runnerThresholdPaceMinPerKm", type: "number" },
      "Resting HR": { key: "runnerRestingHrBpm", type: "number" },
      "Max HR": { key: "runnerMaxHrBpm", type: "number" },
      "Sleep (h/night)": { key: "sleepHours", type: "number" },
      "Injury risk right now?": { key: "injuryRiskFlag", type: "text" },
      "Planned weekly volume (km)": { key: "runnerPlannedWeeklyKm", type: "number" },
      "Planned long run (km)": { key: "runnerPlannedLongRunKm", type: "number" },
      "Planned hard sessions / wk": { key: "plannedHardSessionsPerWeek", type: "number" },
      "Planned strength sessions / wk": { key: "plannedStrengthSessionsPerWeek", type: "number" },
      "Planned CHO (g/kg/day)": { key: "runnerPlannedChoGPerKg", type: "number" },
      "Planned protein (g/kg/day)": { key: "runnerPlannedProteinGPerKg", type: "number" },
      "Planned long-run fuel (g/h)": { key: "runnerPlannedLongRunFuelGPerH", type: "number" },
      "Planned fluid (mL/h)": { key: "runnerPlannedFluidMlPerH", type: "number" },
      "Planned sodium (mg/h)": { key: "runnerPlannedSodiumMgPerH", type: "number" },
    },
  },
  HYROX_Coach: {
    kind: "hyrox",
    category: "hyrox",
    audience: "HYROX or hybrid fitness racing",
    titlePrefix: "HYROX",
    inputMap: {
      "Athlete name": { key: "athleteName", type: "text" },
      "Sex": { key: "sex", type: "text" },
      "Age": { key: "ageYears", type: "number" },
      "Body mass (kg)": { key: "bodyMassKg", type: "number" },
      "Assessment date": { key: "assessmentDate", type: "date" },
      "Event date": { key: "goalDate", type: "date" },
      "Division": { key: "goalEvent", type: "text" },
      "Training age": { key: "trainingAgeLevel", type: "text" },
      "Days available / wk": { key: "daysAvailablePerWeek", type: "number" },
      "Current run volume (km/wk)": { key: "hyroxCurrentRunKm", type: "number" },
      "Recent 5K time (min)": { key: "hyroxRecent5kTimeMin", type: "number" },
      "Predicted race duration (min)": { key: "hyroxPredictedRaceDurationMin", type: "number" },
      "VO2max (optional)": { key: "hyroxVo2maxMlPerKgMin", type: "number" },
      "Weakest area": { key: "hyroxWeakestArea", type: "text" },
      "Wall-ball unbroken reps": { key: "hyroxWallBallUnbrokenReps", type: "number" },
      "Sled tolerance (1-5)": { key: "hyroxSledToleranceScore", type: "number" },
      "Sleep (h/night)": { key: "sleepHours", type: "number" },
      "Injury risk right now?": { key: "injuryRiskFlag", type: "text" },
      "Planned run volume (km/wk)": { key: "hyroxPlannedRunKm", type: "number" },
      "Planned hybrid sessions / wk": { key: "plannedHardSessionsPerWeek", type: "number" },
      "Planned strength sessions / wk": { key: "plannedStrengthSessionsPerWeek", type: "number" },
      "Planned CHO (g/kg/day)": { key: "hyroxPlannedChoGPerKg", type: "number" },
      "Planned protein (g/kg/day)": { key: "hyroxPlannedProteinGPerKg", type: "number" },
      "Planned race fuel (g/h)": { key: "hyroxPlannedRaceFuelGPerH", type: "number" },
      "Planned fluid (mL/h)": { key: "hyroxPlannedFluidMlPerH", type: "number" },
      "Planned sodium (mg/h)": { key: "hyroxPlannedSodiumMgPerH", type: "number" },
    },
  },
  Endurance_Coach: {
    kind: "endurance",
    category: "endurance",
    audience: "Cycling, triathlon, rowing, and long-duration endurance athletes",
    titlePrefix: "Endurance",
    inputMap: {
      "Athlete name": { key: "athleteName", type: "text" },
      "Primary sport": { key: "primarySport", type: "text" },
      "Sex": { key: "sex", type: "text" },
      "Age": { key: "ageYears", type: "number" },
      "Body mass (kg)": { key: "bodyMassKg", type: "number" },
      "Assessment date": { key: "assessmentDate", type: "date" },
      "Event date": { key: "goalDate", type: "date" },
      "Event duration target (h)": { key: "enduranceEventDurationHours", type: "number" },
      "Training age": { key: "trainingAgeLevel", type: "text" },
      "Days available / wk": { key: "daysAvailablePerWeek", type: "number" },
      "Current weekly hours": { key: "currentWeeklyHours", type: "number" },
      "Current longest session (h)": { key: "currentLongestSessionHours", type: "number" },
      "Resting HR": { key: "enduranceRestingHrBpm", type: "number" },
      "Max HR": { key: "enduranceMaxHrBpm", type: "number" },
      "Threshold HR (optional)": { key: "enduranceThresholdHrBpm", type: "number" },
      "Sleep (h/night)": { key: "sleepHours", type: "number" },
      "Hot conditions expected?": { key: "enduranceHotConditionsFlag", type: "text" },
      "Injury risk right now?": { key: "injuryRiskFlag", type: "text" },
      "Planned weekly hours": { key: "plannedWeeklyHours", type: "number" },
      "Planned long session (h)": { key: "plannedLongSessionHours", type: "number" },
      "Planned hard sessions / wk": { key: "plannedHardSessionsPerWeek", type: "number" },
      "Planned strength sessions / wk": { key: "plannedStrengthSessionsPerWeek", type: "number" },
      "Planned CHO (g/kg/day)": { key: "endurancePlannedChoGPerKg", type: "number" },
      "Planned protein (g/kg/day)": { key: "endurancePlannedProteinGPerKg", type: "number" },
      "Planned event fuel (g/h)": { key: "endurancePlannedEventFuelGPerH", type: "number" },
      "Planned fluid (mL/h)": { key: "endurancePlannedFluidMlPerH", type: "number" },
      "Planned sodium (mg/h)": { key: "endurancePlannedSodiumMgPerH", type: "number" },
    },
  },
};

function normalizeText(value) {
  return String(value || "").trim();
}

function normalizeNumber(value) {
  const raw = String(value ?? "").trim().replace(/,/gu, "");
  if (!raw) {
    return null;
  }
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

function excelDateToIso(value) {
  if (value === null || value === undefined || value === "") {
    return "";
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    const parsed = excelSerialToDate(value);
    if (!parsed || Number.isNaN(parsed.getTime())) {
      return "";
    }
    return parsed.toISOString().slice(0, 10);
  }
  const raw = normalizeText(value);
  if (!raw) {
    return "";
  }
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    return raw;
  }
  return parsed.toISOString().slice(0, 10);
}

function parseCellValue(value, type) {
  if (type === "number") {
    return normalizeNumber(value);
  }
  if (type === "date") {
    return excelDateToIso(value);
  }
  return normalizeText(value);
}

function inferSessionType(kind, sessionLabel) {
  const text = normalizeText(sessionLabel).toLowerCase();
  if (!text) {
    return "standard";
  }
  if (text.includes("rest") || text.includes("off")) {
    return "recovery";
  }
  if (text.includes("long")) {
    return "long_session";
  }
  if (text.includes("interval")) {
    return "intervals";
  }
  if (text.includes("threshold") || text.includes("tempo")) {
    return "threshold";
  }
  if (text.includes("simulation") || text.includes("race")) {
    return "race_specific";
  }
  if (kind === "hyrox" && (text.includes("hybrid") || text.includes("sled") || text.includes("wall ball"))) {
    return "hybrid";
  }
  if (text.includes("easy") || text.includes("aerobic") || text.includes("endurance")) {
    return "aerobic_base";
  }
  return "standard";
}

function inferDayType(sessionLabel) {
  const text = normalizeText(sessionLabel).toLowerCase();
  if (!text) {
    return "workout";
  }
  if (text.includes("rest") || text.includes("off")) {
    return "rest";
  }
  if (text.includes("recovery") || text.includes("easy")) {
    return "recovery";
  }
  return "workout";
}

function inferHeartRateZone(intensityCue) {
  const raw = normalizeText(intensityCue);
  const match = raw.match(/z(\d)/iu);
  return match ? Number(match[1]) : null;
}

function findRowIndex(rows, label) {
  return rows.findIndex((row) => normalizeText(row?.[0]) === label);
}

function buildRowsMap(rows, startIndex, endIndex) {
  const map = new Map();
  for (let index = startIndex; index <= endIndex; index += 1) {
    const row = rows[index] || [];
    const label = normalizeText(row[0]);
    if (!label) {
      continue;
    }
    map.set(label, row[1]);
  }
  return map;
}

function extractAudienceLine(rows) {
  const line = normalizeText(rows[2]?.[0]);
  const match = line.match(/^Best fit:\s*(.+?)\./iu);
  return match ? match[1].trim() : line;
}

function buildTemplateTitle(config, profile, workbook) {
  const phase =
    config.kind === "runner"
      ? workbook.outputs?.runner_phase
      : config.kind === "hyrox"
        ? workbook.outputs?.hyrox_phase
        : workbook.outputs?.endurance_phase;
  const anchor =
    normalizeText(profile.goalEvent)
    || normalizeText(profile.primarySport)
    || config.titlePrefix;
  return `${anchor}${phase ? ` ${phase}` : ""} Block`.trim();
}

function buildFuelCue(workbook, kind) {
  if (kind === "runner") {
    const min = workbook.outputs?.runner_long_run_fuel_min_g_per_h;
    const max = workbook.outputs?.runner_long_run_fuel_max_g_per_h;
    const fluid = workbook.outputs?.runner_fluid_range_ml_per_h;
    const sodium = workbook.outputs?.runner_sodium_range_mg_per_h;
    if (min === null || min === undefined) {
      return "";
    }
    return `${min}-${max} g/h carbs • ${fluid} mL/h • ${sodium} mg/h sodium`;
  }
  if (kind === "hyrox") {
    const min = workbook.outputs?.hyrox_race_fuel_min_g_per_h;
    const max = workbook.outputs?.hyrox_race_fuel_max_g_per_h;
    const fluid = profileNumber(workbook.outputs?.hyrox_planned_fluid_ml_per_h);
    const sodium = profileNumber(workbook.outputs?.hyrox_planned_sodium_mg_per_h);
    return min === null || min === undefined ? "" : `${min}-${max} g/h carbs • race hydration plan`;
  }
  const min = workbook.outputs?.endurance_event_fuel_min_g_per_h;
  const max = workbook.outputs?.endurance_event_fuel_max_g_per_h;
  const fluid = workbook.outputs?.endurance_fluid_target_range_ml_per_h;
  const sodium = workbook.outputs?.endurance_sodium_target_range_mg_per_h;
  return min === null || min === undefined ? "" : `${min}-${max} g/h carbs • ${fluid} mL/h • ${sodium} mg/h sodium`;
}

function profileNumber(value) {
  return Number.isFinite(Number(value)) ? Number(value) : null;
}

function buildTemplateDays(rows, workbook, kind) {
  const structureIndex = findRowIndex(rows, "Suggested weekly structure (copy this logic into your app)");
  if (structureIndex < 0) {
    return [];
  }

  const dayHeader = rows[structureIndex + 1] || [];
  const sessionRow = rows[structureIndex + 2] || [];
  const supportRow = rows[structureIndex + 3] || [];
  const noteRow = rows[structureIndex + 4] || [];
  const supportLabel = normalizeText(supportRow[0] || "Intensity cue");
  const supportAsIntensity = supportLabel.toLowerCase().includes("intensity");
  const longDistanceKm = kind === "runner" ? profileNumber(workbook.outputs?.runner_recommended_long_run_km) : null;
  const longDurationHours = kind === "endurance" ? profileNumber(workbook.outputs?.endurance_recommended_long_session_h) : null;
  const fuelCue = buildFuelCue(workbook, kind);

  const days = [];
  for (let columnIndex = 1; columnIndex < dayHeader.length; columnIndex += 1) {
    const weekday = normalizeText(dayHeader[columnIndex]);
    const sessionLabel = normalizeText(sessionRow[columnIndex]);
    if (!weekday || !sessionLabel) {
      continue;
    }

    const supportValue = normalizeText(supportRow[columnIndex]);
    const coachNote = normalizeText(noteRow[columnIndex]);
    const noteLines = [];
    if (supportValue && !supportAsIntensity) {
      noteLines.push(`${supportLabel}: ${supportValue}`);
    }
    if (coachNote) {
      noteLines.push(coachNote);
    }

    const sessionType = inferSessionType(kind, sessionLabel);
    const isLongSession = sessionType === "long_session";
    const estimatedDurationMinutes = longDurationHours ? Math.round(longDurationHours * 60) : "";
    days.push({
      title: weekday,
      focus: sessionLabel,
      dayType: inferDayType(sessionLabel),
      estimatedDurationMinutes: isLongSession && estimatedDurationMinutes ? estimatedDurationMinutes : "",
      notes: noteLines.join("\n"),
      exercisesText: "",
      sessionType,
      sessionLabel,
      distanceKm: isLongSession && longDistanceKm ? longDistanceKm : "",
      heartRateZone: supportAsIntensity ? (inferHeartRateZone(supportValue) || "") : "",
      intensityCue: supportAsIntensity ? supportValue : "",
      targetPace: "",
      fuelCue: isLongSession ? fuelCue : "",
    });
  }

  return days;
}

async function buildWorkbookDraft({ workbookBuffer, sheetName, filename = "Workbook.xlsx" }) {
  const workbookSheets = await readWorkbookBufferSheets(workbookBuffer, { defval: "" });
  const effectiveSheetName = normalizeText(sheetName) || Object.keys(workbookSheets).find((name) => SHEET_CONFIG[name]) || "";
  const config = SHEET_CONFIG[effectiveSheetName];
  if (!config) {
    throw new Error("Unsupported workbook sheet. Choose Runner_Coach, HYROX_Coach, or Endurance_Coach.");
  }

  const rows = workbookSheets[effectiveSheetName];
  if (!rows?.length) {
    throw new Error(`Sheet ${effectiveSheetName} was not found in the uploaded workbook.`);
  }
  const inputRows = buildRowsMap(rows, 6, 32);
  const athleteProfile = { athleteProfile: config.kind };

  for (const [label, rule] of Object.entries(config.inputMap)) {
    athleteProfile[rule.key] = parseCellValue(inputRows.get(label), rule.type);
  }

  const assessmentDate = athleteProfile.assessmentDate || athleteProfile.goalDate || "";
  const workbook = athleteEngine.buildWorkbookPackage(athleteProfile, {
    athleteName: athleteProfile.athleteName || config.titlePrefix,
    assessmentDate,
    startDate: assessmentDate,
  });

  const template = {
    title: buildTemplateTitle(config, athleteProfile, workbook),
    objective: workbook.readiness?.coachAction || "Imported from workbook",
    audience: extractAudienceLine(rows) || config.audience,
    category: config.category,
    difficulty: normalizeText(athleteProfile.trainingAgeLevel).toLowerCase() || "intermediate",
    durationWeeks: 4,
    notes: [
      `Imported from ${filename} (${effectiveSheetName}).`,
      ...(Array.isArray(workbook.summaryCard) ? workbook.summaryCard : []),
    ]
      .filter(Boolean)
      .join("\n"),
  };

  return {
    ok: true,
    sheetName: effectiveSheetName,
    template,
    days: buildTemplateDays(rows, workbook, config.kind),
    athleteProfile,
    workbook,
  };
}

module.exports = {
  buildWorkbookDraft,
  SHEET_CONFIG,
};
