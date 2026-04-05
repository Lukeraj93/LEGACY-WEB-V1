(function buildLegacyNutritionWorkbookEngine(globalScope) {
  const CATEGORY_LOGIC = {
    general_fitness: {
      label: "General Fitness",
      proteinTarget: 1.6,
      proteinCut: 2.0,
      proteinPerMeal: 0.3,
      fatMin: 0.6,
      fatTarget: 0.8,
      carbMin: { light: 2, moderate: 3, high: 4 },
      carbMax: { light: 3, moderate: 4, high: 5 },
      fiberPer1000: 14,
      hydrationMlKg: 35,
      sodiumLow: 460,
      sodiumHigh: 1000,
      calorieShift: { fat_loss: -0.14, recomp: 0, muscle_gain: 0.06, performance_peak: 0.02 },
    },
    elderly: {
      label: "Elderly",
      proteinTarget: 1.4,
      proteinCut: 1.6,
      proteinPerMeal: 0.4,
      fatMin: 0.6,
      fatTarget: 0.8,
      carbMin: { light: 3, moderate: 4, high: 5 },
      carbMax: { light: 4, moderate: 5, high: 6 },
      fiberPer1000: 14,
      hydrationMlKg: 30,
      sodiumLow: 460,
      sodiumHigh: 1000,
      calorieShift: { fat_loss: -0.1, recomp: 0, muscle_gain: 0.04, performance_peak: 0.01 },
    },
    hypertrophy: {
      label: "Hypertrophy",
      proteinTarget: 1.8,
      proteinCut: 2.4,
      proteinPerMeal: 0.3,
      fatMin: 0.5,
      fatTarget: 0.7,
      carbMin: { light: 3, moderate: 4, high: 5 },
      carbMax: { light: 5, moderate: 6, high: 7 },
      fiberPer1000: 14,
      hydrationMlKg: 35,
      sodiumLow: 460,
      sodiumHigh: 1000,
      calorieShift: { fat_loss: -0.12, recomp: 0, muscle_gain: 0.1, performance_peak: 0.03 },
    },
    strength: {
      label: "Strength",
      proteinTarget: 1.8,
      proteinCut: 2.3,
      proteinPerMeal: 0.3,
      fatMin: 0.6,
      fatTarget: 0.8,
      carbMin: { light: 3, moderate: 4, high: 5 },
      carbMax: { light: 5, moderate: 6, high: 7 },
      fiberPer1000: 14,
      hydrationMlKg: 35,
      sodiumLow: 460,
      sodiumHigh: 1000,
      calorieShift: { fat_loss: -0.12, recomp: 0, muscle_gain: 0.08, performance_peak: 0.02 },
    },
    combat: {
      label: "Combat",
      proteinTarget: 2.0,
      proteinCut: 2.4,
      proteinPerMeal: 0.35,
      fatMin: 0.6,
      fatTarget: 0.7,
      carbMin: { light: 3, moderate: 4, high: 5 },
      carbMax: { light: 5, moderate: 6, high: 7 },
      fiberPer1000: 14,
      hydrationMlKg: 35,
      sodiumLow: 460,
      sodiumHigh: 1150,
      calorieShift: { fat_loss: -0.16, recomp: 0, muscle_gain: 0.04, performance_peak: 0.02 },
    },
    endurance: {
      label: "Endurance",
      proteinTarget: 1.6,
      proteinCut: 2.0,
      proteinPerMeal: 0.3,
      fatMin: 0.6,
      fatTarget: 0.7,
      carbMin: { light: 4, moderate: 6, high: 8 },
      carbMax: { light: 6, moderate: 8, high: 10 },
      fiberPer1000: 12,
      hydrationMlKg: 40,
      sodiumLow: 460,
      sodiumHigh: 1150,
      calorieShift: { fat_loss: -0.08, recomp: 0, muscle_gain: 0.04, performance_peak: 0.06 },
    },
    hyrox: {
      label: "HYROX",
      proteinTarget: 1.8,
      proteinCut: 2.2,
      proteinPerMeal: 0.3,
      fatMin: 0.6,
      fatTarget: 0.7,
      carbMin: { light: 4, moderate: 5, high: 6 },
      carbMax: { light: 6, moderate: 7, high: 8 },
      fiberPer1000: 12,
      hydrationMlKg: 40,
      sodiumLow: 460,
      sodiumHigh: 1150,
      calorieShift: { fat_loss: -0.1, recomp: 0, muscle_gain: 0.05, performance_peak: 0.05 },
    },
  };

  const MENU_LIBRARY = {
    general_fitness: {
      training: {
        note: "Simple, high-adherence day.",
        meals: [
          "Greek yogurt + oats + berries",
          "Chicken, rice, vegetables",
          "Fruit + whey pre-workout",
          "Lean beef wrap + potatoes",
          "Cottage cheese + fruit",
        ],
      },
      rest: {
        note: "Lower-carb rest day.",
        meals: [
          "Eggs + toast + fruit",
          "Chicken salad + olive oil",
          "Greek yogurt + nuts",
          "Salmon + potatoes + veg",
          "Protein pudding",
        ],
      },
      special: {
        note: "Flexibility without chaos.",
        meals: [
          "Keep breakfast normal",
          "Save more carbs around the social meal",
          "Build the plate around protein + starch + veg",
          "Limit liquid calories",
          "Return to normal immediately after",
        ],
      },
    },
    elderly: {
      training: {
        note: "Prioritize protein distribution and easy chewing.",
        meals: [
          "Oatmeal + whey + milk",
          "Soft chicken rice bowl",
          "Greek yogurt + banana",
          "Salmon + potatoes + veg",
          "Casein / dairy snack",
        ],
      },
      rest: {
        note: "Digestible and protein-forward.",
        meals: [
          "Eggs + oats + berries",
          "Turkey sandwich + fruit",
          "Yogurt + nuts",
          "White fish + rice + cooked vegetables",
          "Protein milk drink",
        ],
      },
      special: {
        note: "Consistency beats perfection.",
        meals: [
          "Keep protein at each meal",
          "Use softer carb sources",
          "Avoid skipping meals",
          "Use liquids if appetite is low",
          "Hydrate early in the day",
        ],
      },
    },
    hypertrophy: {
      training: {
        note: "Around-training carbohydrate bias.",
        meals: [
          "Cream of rice + whey + fruit",
          "Chicken, rice, vegetables",
          "Intra carbs / EAA if useful",
          "Lean beef, potatoes, veg",
          "Greek yogurt + cereal",
        ],
      },
      rest: {
        note: "Slight carb drop on non-training days.",
        meals: [
          "Eggs + oats + berries",
          "Turkey rice bowl",
          "Fruit + yogurt",
          "Salmon + potatoes + veg",
          "Casein + nut butter",
        ],
      },
      special: {
        note: "Flexible, not sloppy.",
        meals: [
          "Front-load carbs on weak-point / high-output days",
          "Keep protein fixed",
          "Minimize binge-style meals",
          "Choose easy-to-track restaurant meals",
          "Return to baseline next day",
        ],
      },
    },
    strength: {
      training: {
        note: "Put more carbs before and after the main lift.",
        meals: [
          "Bagel + eggs + fruit",
          "Rice + chicken + veg",
          "Fruit + whey pre-lift",
          "Lean beef + potatoes",
          "Greek yogurt + granola",
        ],
      },
      rest: {
        note: "Keep protein and fat steady; trim carbs slightly.",
        meals: [
          "Eggs + oats",
          "Chicken salad + bread",
          "Fruit + yogurt",
          "Salmon + rice + veg",
          "Casein + nuts",
        ],
      },
      special: {
        note: "Priority is bar performance.",
        meals: [
          "Normal breakfast",
          "Extra carbs before the most important lift",
          "Keep fats lower pre-session",
          "Protein at every meal",
          "Hydrate aggressively",
        ],
      },
    },
    combat: {
      training: {
        note: "Camp day: protein high, carbs around sessions.",
        meals: [
          "Rice cereal + whey",
          "Chicken, rice, cooked vegetables",
          "Fruit + protein pre-training",
          "Lean beef + rice",
          "Greek yogurt + honey",
        ],
      },
      rest: {
        note: "Trim carbs away from hard training.",
        meals: [
          "Eggs + toast",
          "Turkey rice bowl",
          "Yogurt + berries",
          "White fish + potatoes",
          "Casein snack",
        ],
      },
      special: {
        note: "Make weight safely, then refuel aggressively.",
        meals: [
          "Low-residue breakfast",
          "White rice + lean protein",
          "Sports drink / easily digested carbs",
          "Post weigh-in: fluids + sodium + carbs",
          "Low-fiber foods until gut is calm",
        ],
      },
    },
    endurance: {
      training: {
        note: "Carbohydrate availability is a performance tool.",
        meals: [
          "Oats + milk + banana",
          "Rice + chicken + fruit",
          "During: 30–90 g CHO/h as needed",
          "Recovery meal with carbs + protein",
          "Low-fat evening meal",
        ],
      },
      rest: {
        note: "Keep glycogen topped up without overeating.",
        meals: [
          "Eggs + oats",
          "Sandwich + fruit",
          "Yogurt + cereal",
          "Salmon + rice + veg",
          "Casein / dairy",
        ],
      },
      special: {
        note: "Practice the race-day plan in training.",
        meals: [
          "Low-fiber race breakfast",
          "Start fueling early",
          "Use mixed carb sources at higher intakes",
          "Recover with carbs + protein",
          "Keep fats and fiber low pre-race",
        ],
      },
    },
    hyrox: {
      training: {
        note: "Fuel runs and stations. Do not under-carb.",
        meals: [
          "Bagel + whey + banana",
          "Chicken rice bowl",
          "During or after carbs on long sessions",
          "Lean beef + potatoes",
          "Greek yogurt + cereal",
        ],
      },
      rest: {
        note: "Lower-carb easy day.",
        meals: [
          "Eggs + toast + fruit",
          "Turkey wrap + potatoes",
          "Yogurt + nuts",
          "Salmon + rice + veg",
          "Casein / protein dessert",
        ],
      },
      special: {
        note: "Hybrid sport means carbohydrate-driven fatigue management.",
        meals: [
          "Low-fiber pre-race breakfast",
          "30–60 g/h if long simulation or comp",
          "Electrolytes matter",
          "Post-event carbs + protein",
          "Avoid gut-bombs pre-race",
        ],
      },
    },
  };

  const DAY_PRESETS = [
    { key: "monday", label: "Monday" },
    { key: "tuesday", label: "Tuesday" },
    { key: "wednesday", label: "Wednesday" },
    { key: "thursday", label: "Thursday" },
    { key: "friday", label: "Friday" },
    { key: "saturday", label: "Saturday" },
    { key: "sunday", label: "Sunday" },
  ];

  const MEAL_SLOT_ORDER = ["breakfast", "lunch", "pre_workout", "post_workout", "dinner", "snack"];

  function slug(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/gu, "_")
      .replace(/^_+|_+$/gu, "");
  }

  function toTitleCase(value) {
    return String(value || "")
      .replace(/[_-]+/gu, " ")
      .replace(/\s+/gu, " ")
      .trim()
      .toLowerCase()
      .replace(/(^|\s)\S/gu, (match) => match.toUpperCase());
  }

  function toNumber(value) {
    if (value === null || value === undefined || value === "") {
      return null;
    }
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  function round(value) {
    return Number.isFinite(value) ? Math.round(value) : null;
  }

  function clamp(value, min, max) {
    if (!Number.isFinite(value)) {
      return min;
    }
    return Math.min(max, Math.max(min, value));
  }

  function normalizeGoal(value) {
    const key = slug(value);
    if (["maintenance_recomp", "maintenance", "recomp"].includes(key)) {
      return "recomp";
    }
    if (["muscle_gain", "gain"].includes(key)) {
      return "muscle_gain";
    }
    if (["performance_peak", "performance", "peak"].includes(key)) {
      return "performance_peak";
    }
    return "fat_loss";
  }

  function normalizeCategory(value) {
    const key = slug(value);
    return CATEGORY_LOGIC[key] ? key : "general_fitness";
  }

  function normalizeSex(value) {
    const key = slug(value);
    return key === "female" ? "female" : "male";
  }

  function buildLoadBand(trainingSessionsPerWeek, averageSessionDurationMin) {
    const sessions = toNumber(trainingSessionsPerWeek) || 0;
    const duration = toNumber(averageSessionDurationMin) || 0;
    const weeklyMinutes = sessions * duration;
    if (weeklyMinutes >= 360 || sessions >= 6) {
      return "high";
    }
    if (weeklyMinutes >= 180 || sessions >= 4) {
      return "moderate";
    }
    return "light";
  }

  function estimateMaintenance(inputs) {
    const currentCalories = toNumber(inputs.currentCaloriesPerDay);
    const manualMaintenance = toNumber(inputs.manualMaintenanceKcal);
    if (currentCalories && currentCalories > 0) {
      return currentCalories;
    }
    if (manualMaintenance && manualMaintenance > 0) {
      return manualMaintenance;
    }

    const sex = normalizeSex(inputs.sex);
    const weight = toNumber(inputs.currentBodyWeightKg) || 0;
    const height = toNumber(inputs.heightCm) || 170;
    const age = toNumber(inputs.ageYears) || 30;
    const bmr = sex === "female"
      ? (10 * weight) + (6.25 * height) - (5 * age) - 161
      : (10 * weight) + (6.25 * height) - (5 * age) + 5;
    const sessions = toNumber(inputs.trainingSessionsPerWeek) || 0;
    const duration = toNumber(inputs.averageSessionDurationMin) || 0;
    const steps = toNumber(inputs.averageStepsPerDay) || 7000;
    const activityFactor = clamp(
      1.35 + (Math.min(14000, steps) / 14000) * 0.22 + ((sessions * duration) / 420) * 0.24,
      1.35,
      1.95
    );
    return round(bmr * activityFactor);
  }

  function getGoalShift(categoryLogic, goalKey) {
    return categoryLogic.calorieShift[goalKey] ?? 0;
  }

  function buildFuelingText(categoryKey, trainingStartTime, loadBand) {
    const startTime = String(trainingStartTime || "").trim();
    const timingLabel = startTime ? `Main session start: ${startTime}.` : "Use the main session timing to place carbs.";
    if (["endurance", "hyrox"].includes(categoryKey)) {
      return {
        pre: "1–4 g/kg carbohydrate in the 1–4 hours before key sessions plus 20–40 g protein as tolerated.",
        during: loadBand === "high" ? "Target 60–90 g carbohydrate per hour on long or race-specific sessions." : "Use 30–60 g carbohydrate per hour on longer sessions when needed.",
        post: "Get carbs and 20–40 g protein in quickly if another hard session is close.",
        note: `${timingLabel} Protect carbohydrate availability around the biggest sessions.`,
      };
    }
    if (categoryKey === "combat") {
      return {
        pre: "Keep pre-session foods easy to digest and low residue when camp or weigh-in stress is high.",
        during: "Water or electrolytes for short sessions. Add carbs on long sparring or conditioning blocks.",
        post: "Refuel aggressively after weigh-ins or heavy sessions: fluids, sodium, carbs, and protein.",
        note: `${timingLabel} Keep weight-making decisions separate from everyday fueling.`,
      };
    }
    return {
      pre: "Use 0.5–1.0 g/kg carbohydrate before the main session if it improves output, plus 20–40 g protein when convenient.",
      during: "Water is usually enough. Add 15–30 g carbohydrate on longer lifting or hybrid sessions if needed.",
      post: "20–40 g protein after training and enough carbs across the day to recover well.",
      note: `${timingLabel} Keep carbs closest to the sessions that matter most.`,
    };
  }

  function buildPeriodizationSummary(goalKey, weeksToEvent) {
    if (goalKey === "fat_loss") {
      if (weeksToEvent && weeksToEvent >= 8) {
        return "Run conservative deficit blocks and consider a diet-break week every 6 weeks if compliance, recovery, or hunger starts slipping.";
      }
      return "Keep the deficit conservative and predictable. Hold the plan steady before making adjustments.";
    }
    if (goalKey === "muscle_gain") {
      return "Build on a small surplus, then hold and consolidate before pushing again.";
    }
    if (goalKey === "performance_peak") {
      return "Bias fueling over body-mass change, then taper into the event with lower gut stress and cleaner carbs.";
    }
    return "Keep body mass stable, tighten meal rhythm, and let execution do the work.";
  }

  function buildReviewLogic(goalKey) {
    if (goalKey === "fat_loss") {
      return "If adherence is high and progress is too slow, trim calories by roughly 5%, mostly from carbs. If progress is too fast, add 5% back around training.";
    }
    if (goalKey === "muscle_gain") {
      return "If weight is not moving and recovery is good, add 3–5% calories around training. If gain is too fast, pull back slightly before protein.";
    }
    if (goalKey === "performance_peak") {
      return "Hold calories unless performance is slipping or the event block demands more race-specific fueling.";
    }
    return "Hold the plan unless adherence or recovery flags show a clear reason to change it.";
  }

  function pickTrainingDays(trainingSessionsPerWeek) {
    const sessions = Math.max(0, Math.min(7, round(trainingSessionsPerWeek || 0) || 0));
    if (sessions >= 6) return ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    if (sessions === 5) return ["monday", "tuesday", "thursday", "friday", "saturday"];
    if (sessions === 4) return ["monday", "tuesday", "thursday", "saturday"];
    if (sessions === 3) return ["monday", "wednesday", "friday"];
    if (sessions === 2) return ["tuesday", "thursday"];
    if (sessions === 1) return ["wednesday"];
    return [];
  }

  function buildDayTypeMap(goalKey, trainingSessionsPerWeek) {
    const trainingDays = new Set(pickTrainingDays(trainingSessionsPerWeek));
    const specialDay = goalKey === "performance_peak" ? "saturday" : goalKey === "fat_loss" ? "sunday" : "";
    return DAY_PRESETS.reduce((map, day) => {
      let type = trainingDays.has(day.key) ? "training" : "rest";
      if (!trainingDays.has(day.key) && specialDay && day.key === specialDay) {
        type = "special";
      }
      map[day.key] = type;
      return map;
    }, {});
  }

  function buildMacroTargets(inputs) {
    const categoryKey = normalizeCategory(inputs.athleteCategory);
    const goalKey = normalizeGoal(inputs.primaryGoal);
    const categoryLogic = CATEGORY_LOGIC[categoryKey];
    const weight = Math.max(40, toNumber(inputs.currentBodyWeightKg) || 70);
    const loadBand = buildLoadBand(inputs.trainingSessionsPerWeek, inputs.averageSessionDurationMin);
    const maintenance = estimateMaintenance(inputs);
    const calories = round(maintenance * (1 + getGoalShift(categoryLogic, goalKey)));
    const proteinPerKg = goalKey === "fat_loss" ? categoryLogic.proteinCut : categoryLogic.proteinTarget;
    const protein = round(weight * proteinPerKg);
    const fat = round(weight * categoryLogic.fatTarget);
    const carbFloor = round(weight * categoryLogic.carbMin[loadBand]);
    const carbCeiling = round(weight * categoryLogic.carbMax[loadBand]);
    const computedCarbs = Math.max(carbFloor, round((calories - (protein * 4) - (fat * 9)) / 4));
    const carbs = Math.max(carbFloor, Math.min(carbCeiling, computedCarbs));
    const hydrationLiters = Number(((weight * categoryLogic.hydrationMlKg) / 1000).toFixed(1));
    const fiberGrams = round((calories / 1000) * categoryLogic.fiberPer1000);
    const perMealProteinFloor = round(weight * categoryLogic.proteinPerMeal);
    const trainingDayCalories = round(calories + Math.min(calories * 0.1, ["endurance", "hyrox", "combat"].includes(categoryKey) ? 240 : 140));
    const restDayCalories = round(
      Math.max(
        calories - Math.min(calories * 0.08, 200),
        calories - 250
      )
    );
    const trainingDayCarbs = Math.max(round(weight * categoryLogic.carbMin.high), round(carbs * 1.12));
    const restDayCarbs = Math.max(round(weight * categoryLogic.carbMin.light), round(carbs * 0.82));
    const fueling = buildFuelingText(categoryKey, inputs.trainingStartTime, loadBand);
    return {
      categoryKey,
      categoryLabel: categoryLogic.label,
      goalKey,
      goalLabel: toTitleCase(goalKey.replace(/_/gu, " ")),
      loadBand,
      maintenance,
      calories,
      protein,
      carbs,
      fat,
      hydrationLiters,
      fiberGrams,
      perMealProteinFloor,
      sodiumRange: `${categoryLogic.sodiumLow}-${categoryLogic.sodiumHigh} mg/L`,
      trainingDayTargets: {
        label: "Training Day",
        calories: trainingDayCalories,
        protein,
        carbs: trainingDayCarbs,
        fat,
        hydrationLiters,
        fiberGrams,
        note: MENU_LIBRARY[categoryKey].training.note,
      },
      restDayTargets: {
        label: goalKey === "performance_peak" ? "Easy Day" : "Rest Day",
        calories: restDayCalories,
        protein,
        carbs: restDayCarbs,
        fat: round(fat + (goalKey === "fat_loss" ? 5 : 0)),
        hydrationLiters,
        fiberGrams,
        note: MENU_LIBRARY[categoryKey].rest.note,
      },
      specialDayTargets: {
        label: "Special Day",
        calories: round((trainingDayCalories + calories) / 2),
        protein,
        carbs: Math.max(round(weight * categoryLogic.carbMin.moderate), round(carbs * 1.05)),
        fat: Math.max(round(fat - 5), round(weight * categoryLogic.fatMin)),
        hydrationLiters,
        fiberGrams: round(Math.max(fiberGrams - 4, 10)),
        note: MENU_LIBRARY[categoryKey].special.note,
      },
      fueling,
      periodizationSummary: buildPeriodizationSummary(goalKey, inputs.weeksToEvent),
      reviewLogic: buildReviewLogic(goalKey),
    };
  }

  function buildDefaultHabits(inputs, macroPlan) {
    const mealsPerDay = Math.max(3, Math.min(6, round(inputs.mealsPerDayPreference || 4) || 4));
    const categoryKey = macroPlan.categoryKey;
    const habitRows = [
      {
        title: "Hit protein target",
        description: `Clear ${macroPlan.protein} g protein across the day. Keep each meal around ${macroPlan.perMealProteinFloor}+ g when possible.`,
        targetType: "grams",
        targetValue: macroPlan.protein,
        targetUnit: "g",
        cadence: "daily",
        isRequired: true,
      },
      {
        title: "Hydration target",
        description: `Aim for ${macroPlan.hydrationLiters} L baseline fluid plus more around hard sessions.`,
        targetType: "liters",
        targetValue: macroPlan.hydrationLiters,
        targetUnit: "L",
        cadence: "daily",
        isRequired: true,
      },
      {
        title: "Meal rhythm",
        description: `Keep ${mealsPerDay} consistent feedings so the plan stays boringly repeatable.`,
        targetType: "meals",
        targetValue: mealsPerDay,
        targetUnit: "meals",
        cadence: "daily",
        isRequired: true,
      },
      {
        title: ["endurance", "hyrox", "combat"].includes(categoryKey) ? "Around-training carbs" : "Balanced meals",
        description: ["endurance", "hyrox", "combat"].includes(categoryKey)
          ? "Put the biggest carbohydrate feedings closest to the longest or hardest sessions."
          : "Build meals around protein, a carb anchor, and produce.",
        targetType: "count",
        targetValue: ["endurance", "hyrox", "combat"].includes(categoryKey) ? 2 : 3,
        targetUnit: ["endurance", "hyrox", "combat"].includes(categoryKey) ? "sessions" : "meals",
        cadence: "daily",
        isRequired: true,
      },
    ];

    return habitRows.map((habit, index) => ({
      id: `generated-habit-${index + 1}`,
      ...habit,
    }));
  }

  function buildMealSlotsFromMenu(dayKey, dayType, categoryKey, mealsPerDay, macroPlan) {
    const menu = MENU_LIBRARY[categoryKey][dayType] || MENU_LIBRARY[categoryKey].rest;
    const meals = menu.meals.slice(0, Math.max(3, Math.min(5, mealsPerDay || 4)));
    return meals.map((meal, index) => ({
      id: `${dayKey}-slot-${index + 1}`,
      mealType: MEAL_SLOT_ORDER[index] || "other",
      title: meal,
      note:
        index === 0 && dayType === "training"
          ? macroPlan.fueling.pre
          : index === 2 && dayType === "training"
            ? macroPlan.fueling.during
            : index === meals.length - 1 && dayType !== "rest"
              ? macroPlan.fueling.post
              : "",
      recipeId: "",
    }));
  }

  function buildMealPlan(inputs, macroPlan) {
    const mealsPerDay = Math.max(3, Math.min(5, round(inputs.mealsPerDayPreference || 4) || 4));
    const dayTypeMap = buildDayTypeMap(macroPlan.goalKey, inputs.trainingSessionsPerWeek);
    return {
      version: 2,
      source: "nutrition_workbook",
      category: macroPlan.categoryLabel,
      goal: macroPlan.goalLabel,
      weekStart: "monday",
      days: DAY_PRESETS.map((day) => {
        const dayType = dayTypeMap[day.key] || "rest";
        const macroTargets =
          dayType === "training"
            ? macroPlan.trainingDayTargets
            : dayType === "special"
              ? macroPlan.specialDayTargets
              : macroPlan.restDayTargets;
        const menu = MENU_LIBRARY[macroPlan.categoryKey][dayType] || MENU_LIBRARY[macroPlan.categoryKey].rest;
        return {
          dayKey: day.key,
          label: day.label,
          dayType,
          note: menu.note,
          targets: {
            calories: macroTargets.calories,
            protein: macroTargets.protein,
            carbs: macroTargets.carbs,
            fat: macroTargets.fat,
            hydrationLiters: macroTargets.hydrationLiters,
            fiberGrams: macroTargets.fiberGrams,
          },
          slots: buildMealSlotsFromMenu(day.key, dayType, macroPlan.categoryKey, mealsPerDay, macroPlan),
        };
      }),
    };
  }

  function buildPlanSummary(inputs) {
    const macroPlan = buildMacroTargets(inputs);
    return {
      ...macroPlan,
      summaryCard: [
        `${macroPlan.categoryLabel} | ${macroPlan.goalLabel} | ${toTitleCase(macroPlan.loadBand)} training load`,
        `Average target: ${macroPlan.calories} kcal with ${macroPlan.protein} g protein, ${macroPlan.carbs} g carbs, and ${macroPlan.fat} g fat.`,
        `Hydration baseline: ${macroPlan.hydrationLiters} L/day with ${macroPlan.sodiumRange} sodium in training fluids when needed.`,
        macroPlan.periodizationSummary,
      ],
      previewPairs: [
        { label: "Category", value: macroPlan.categoryLabel },
        { label: "Goal", value: macroPlan.goalLabel },
        { label: "Maintenance", value: `${macroPlan.maintenance} kcal` },
        { label: "Average target", value: `${macroPlan.calories} kcal` },
        { label: "Protein", value: `${macroPlan.protein} g` },
        { label: "Carbs", value: `${macroPlan.carbs} g` },
        { label: "Fat", value: `${macroPlan.fat} g` },
        { label: "Hydration", value: `${macroPlan.hydrationLiters} L` },
      ],
    };
  }

  function build(inputs) {
    const startDate = inputs?.startDate ? new Date(inputs.startDate) : null;
    const eventDate = inputs?.eventDate ? new Date(inputs.eventDate) : null;
    const weeksToEvent =
      startDate instanceof Date
      && eventDate instanceof Date
      && Number.isFinite(startDate.getTime())
      && Number.isFinite(eventDate.getTime())
      && eventDate.getTime() > startDate.getTime()
        ? Math.max(1, Math.round((eventDate.getTime() - startDate.getTime()) / (7 * 86400000)))
        : null;

    const safeInputs = {
      athleteCategory: normalizeCategory(inputs?.athleteCategory),
      primaryGoal: normalizeGoal(inputs?.primaryGoal),
      sex: normalizeSex(inputs?.sex),
      ageYears: toNumber(inputs?.ageYears),
      heightCm: toNumber(inputs?.heightCm),
      currentBodyWeightKg: toNumber(inputs?.currentBodyWeightKg),
      targetBodyWeightKg: toNumber(inputs?.targetBodyWeightKg),
      startDate: inputs?.startDate || "",
      eventDate: inputs?.eventDate || "",
      trainingSessionsPerWeek: toNumber(inputs?.trainingSessionsPerWeek),
      averageSessionDurationMin: toNumber(inputs?.averageSessionDurationMin),
      averageStepsPerDay: toNumber(inputs?.averageStepsPerDay),
      mealsPerDayPreference: toNumber(inputs?.mealsPerDayPreference),
      dietStyle: inputs?.dietStyle || "",
      giSensitivity: inputs?.giSensitivity || "",
      appetite: inputs?.appetite || "",
      sweatRate: inputs?.sweatRate || "",
      trainingStartTime: inputs?.trainingStartTime || "",
      currentCaloriesPerDay: toNumber(inputs?.currentCaloriesPerDay),
      currentProteinG: toNumber(inputs?.currentProteinG),
      manualMaintenanceKcal: toNumber(inputs?.manualMaintenanceKcal),
      weeksToEvent,
    };

    const macroPlan = buildPlanSummary(safeInputs);
    const habits = buildDefaultHabits(safeInputs, macroPlan);
    const mealPlan = buildMealPlan(safeInputs, macroPlan);
    return {
      inputs: safeInputs,
      macroPlan,
      habits,
      mealPlan,
    };
  }

  globalScope.LegacyNutritionWorkbookEngine = {
    CATEGORY_LOGIC,
    DAY_PRESETS,
    build,
    buildMacroTargets: buildPlanSummary,
    buildDefaultHabits,
    buildMealPlan,
    normalizeCategory,
    normalizeGoal,
  };
})(typeof window !== "undefined" ? window : globalThis);
