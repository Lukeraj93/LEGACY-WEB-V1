(function initPlannerAthleteEngine(root, factory) {
  const api = factory();

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  root.LegacyAthleteEngine = api;
})(typeof globalThis !== "undefined" ? globalThis : window, function buildPlannerAthleteEngine() {
  const SPORT_KEYWORDS = {
    runner: ["runner", "running", "road running", "trail running", "5k", "10k", "half marathon", "marathon", "trail race"],
    hyrox: ["hyrox", "hybrid racing", "hybrid athlete", "sled", "wall ball"],
    endurance: ["endurance", "cycling", "triathlon", "row", "rowing", "swim", "bike", "ultra", "long course"],
  };

  const FALLBACK_DEMOS = [
    { keywords: ["tempo run", "threshold run", "threshold session"], query: "The Run Experience tempo run tutorial" },
    { keywords: ["interval run", "track repeat", "speed session", "vo2"], query: "The Run Experience interval run tutorial" },
    { keywords: ["long run"], query: "The Run Experience long run tips" },
    { keywords: ["easy run", "recovery run", "zone 2 run", "aerobic run"], query: "The Run Experience easy run form" },
    { keywords: ["strides"], query: "The Run Experience strides running drill" },
    { keywords: ["hill sprint", "hill repeat"], query: "hill sprint running drill tutorial" },
    { keywords: ["row", "rowing", "erg"], query: "Concept2 rowing technique tutorial" },
    { keywords: ["ski erg", "skierg"], query: "Concept2 SkiErg technique tutorial" },
    { keywords: ["air bike", "assault bike", "echo bike"], query: "assault bike technique conditioning tutorial" },
    { keywords: ["sled push"], query: "sled push exercise tutorial" },
    { keywords: ["sled pull"], query: "sled pull exercise tutorial" },
    { keywords: ["wall ball"], query: "wall ball exercise tutorial" },
    { keywords: ["farmer carry", "farmer's carry", "carry"], query: "farmer carry exercise tutorial" },
    { keywords: ["burpee broad jump"], query: "burpee broad jump hyrox tutorial" },
    { keywords: ["sandbag lunge", "walking lunge"], query: "sandbag lunge exercise tutorial" },
    { keywords: ["dead bug"], query: "dead bug exercise tutorial" },
    { keywords: ["glute bridge"], query: "glute bridge exercise tutorial" },
    { keywords: ["split squat", "bulgarian split squat"], query: "split squat technique tutorial" },
    { keywords: ["calf raise"], query: "calf raise technique tutorial" },
    { keywords: ["single leg rdl", "single-leg rdl"], query: "single leg rdl exercise tutorial" },
    { keywords: ["copenhagen plank"], query: "copenhagen plank tutorial" },
    { keywords: ["step up", "step-up"], query: "step up exercise tutorial" },
    { keywords: ["trap bar deadlift"], query: "trap bar deadlift tutorial" },
    { keywords: ["goblet squat"], query: "goblet squat tutorial" },
  ];

  const DYNAMIC_WORKBOOK_TYPES = new Set([
    "general_fitness",
    "elderly",
    "hypertrophy",
    "strength",
    "endurance",
    "hyrox",
    "combat",
  ]);

  const DYNAMIC_WORKBOOK_TYPE_LABELS = {
    general_fitness: "General Fitness",
    elderly: "Elderly",
    hypertrophy: "Hypertrophy",
    strength: "Strength",
    endurance: "Endurance",
    hyrox: "HYROX",
    combat: "Combat",
  };

  const DYNAMIC_CATEGORY_BY_TYPE = {
    general_fitness: "general",
    elderly: "general",
    hypertrophy: "hypertrophy",
    strength: "strength",
    endurance: "endurance",
    hyrox: "hyrox",
    combat: "combat",
  };

  const DEFAULT_EVENT_BY_TYPE = {
    general_fitness: "General Health",
    elderly: "Ageing Well",
    hypertrophy: "Bodybuilding / Physique",
    strength: "Powerlifting",
    endurance: "Half Marathon",
    hyrox: "HYROX Open",
    combat: "Fight Camp",
  };

  const RESISTANCE_DAY_PATTERNS = {
    1: ["Mon"],
    2: ["Mon", "Thu"],
    3: ["Mon", "Wed", "Fri"],
    4: ["Mon", "Tue", "Thu", "Fri"],
    5: ["Mon", "Tue", "Wed", "Fri", "Sat"],
    6: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  };

  const CONDITIONING_DAY_PATTERNS = {
    1: ["Wed"],
    2: ["Wed", "Sat"],
    3: ["Wed", "Fri", "Sun"],
    4: ["Tue", "Thu", "Sat", "Sun"],
    5: ["Mon", "Wed", "Thu", "Sat", "Sun"],
    6: ["Mon", "Tue", "Thu", "Fri", "Sat", "Sun"],
  };

  const RESISTANCE_SLOT_MAP = {
    "General Fitness": ["Full Body A", "Full Body B", "Full Body C", "Circuit Strength", "Full Body D", "Mobility Strength"],
    Elderly: ["Full Body A", "Full Body B", "Power / Balance", "Full Body C", "Circuit / Carry", "Mobility / Balance"],
    Hypertrophy: ["Upper 1", "Lower 1", "Upper 2", "Lower 2", "Arms / Delts", "Full Body Pump"],
    Strength: ["Squat Focus", "Bench Focus", "Deadlift Focus", "Upper Strength", "Lower Volume", "Bench / Accessories"],
    Endurance: ["Lower Strength", "Upper / Core", "Full Body Economy", "Mobility / Strength", "Power / Strides", "Optional Support"],
    HYROX: ["Lower Force", "Upper Pull-Push", "Hybrid Strength", "Posterior / Core", "Full Body Power", "Optional Support"],
    Combat: ["Full Body Strength", "Lower Power + Core", "Upper Strength / Neck", "Full Body Speed", "Posterior + Grip", "Optional Support"],
  };

  const CONDITIONING_SLOT_MAP = {
    "General Fitness": ["Zone 2 Cardio", "General Intervals", "Recreational Conditioning", "Long Walk / Hike", "Mobility Recovery", "Optional Mixed Modal"],
    Elderly: ["Brisk Walk", "Cycle / Erg Intervals", "Balance + Carry Walk", "Elderly Recovery Walk", "Optional Pool / Cardio", "Mobility"],
    Hypertrophy: ["Low-Intensity Cardio", "Steps / Incline Walk", "Optional Intervals", "Bodybuilding Recovery Walk", "Optional Bike", "Mobility"],
    Strength: ["GPP Aerobic", "Sled / Bike Intervals", "Strength Recovery Walk", "Tempo Circuit", "Optional GPP", "Mobility"],
    Endurance: ["Easy Run", "Run Intervals", "Tempo Run", "Long Run", "Recovery Run", "Strides / Hills"],
    HYROX: ["HYROX Easy Run", "HYROX Threshold Intervals", "HYROX Stations", "HYROX Long Aerobic Run", "Mixed Simulation", "Machine Intervals"],
    Combat: ["Aerobic Base Run", "Fight-Pace Intervals", "Skill-Rounds Conditioning", "Sprint / Alactic Power", "Recovery Aerobic", "Tempo Fartlek"],
  };

  const RESISTANCE_LIBRARY = {
    "Full Body A": { blockGoal: "General strength and movement", mainLift: "Goblet / Back Squat", secondaryLift: "DB Press", accessories: "Row + Hinge + Carry", sets: 3, repTarget: "6-10", baseRir: 3, progressionRule: "Progress load once all sets hit top reps", coachingNote: "Leave 2-3 reps in reserve early" },
    "Full Body B": { blockGoal: "General strength and trunk", mainLift: "RDL", secondaryLift: "Pull-Up / Pulldown", accessories: "Split Squat + Push-Up + Core", sets: 3, repTarget: "6-10", baseRir: 3, progressionRule: "Own positions before adding load", coachingNote: "Use controlled eccentrics" },
    "Full Body C": { blockGoal: "General hypertrophy", mainLift: "Leg Press", secondaryLift: "Incline DB Press", accessories: "Seated Row + Ham Curl + Calves", sets: 3, repTarget: "8-12", baseRir: 2, progressionRule: "Add reps before load", coachingNote: "Maintain consistent tempo" },
    "Circuit Strength": { blockGoal: "Work capacity + body comp", mainLift: "KB / DB Complex", secondaryLift: "Carry / Sled", accessories: "Rower/Bike finisher", sets: 3, repTarget: "30-45 s", baseRir: 3, progressionRule: "Quality over speed", coachingNote: "Stop well before form breaks" },
    "Full Body D": { blockGoal: "General balance", mainLift: "Hack Squat", secondaryLift: "Machine Press", accessories: "Pulldown + Leg Curl + Core", sets: 3, repTarget: "8-12", baseRir: 2, progressionRule: "Progress one exercise at a time", coachingNote: "Keep execution repeatable" },
    "Mobility Strength": { blockGoal: "Low fatigue support", mainLift: "Split Squat", secondaryLift: "Landmine Press", accessories: "Band Row + Core + Mobility", sets: 2, repTarget: "8-12", baseRir: 3, progressionRule: "Hold volume if stressed", coachingNote: "This is a support session" },
    "Power / Balance": { blockGoal: "Older-adult power and stability", mainLift: "Sit-to-Stand / Squat", secondaryLift: "Chest Press", accessories: "Row + Step-Up + Carry", sets: 2, repTarget: "5-8", baseRir: 3, progressionRule: "Intent fast on concentric", coachingNote: "Moderate loads, crisp reps" },
    "Circuit / Carry": { blockGoal: "Function and capacity", mainLift: "Farmer Carry", secondaryLift: "Sled / Prowler", accessories: "Step-Up + Med Ball + Bike", sets: 2, repTarget: "20-40 m", baseRir: 3, progressionRule: "Stay submaximal", coachingNote: "Keep posture tall" },
    "Mobility / Balance": { blockGoal: "Reduce fear and improve function", mainLift: "Box Squat", secondaryLift: "Cable Press", accessories: "Supported Row + Balance + Core", sets: 2, repTarget: "8-15", baseRir: 3, progressionRule: "Small consistent gains", coachingNote: "Pain-free ROM only" },
    "Upper 1": { blockGoal: "Upper torso hypertrophy", mainLift: "Bench / Machine Press", secondaryLift: "Chest-Supported Row", accessories: "Lat + Delt + Arms", sets: 4, repTarget: "6-12", baseRir: 2, progressionRule: "Double progression", coachingNote: "Prioritize SFR and stable setups" },
    "Lower 1": { blockGoal: "Lower hypertrophy", mainLift: "Hack / High-Bar Squat", secondaryLift: "RDL", accessories: "Leg Press + Curl + Calves", sets: 4, repTarget: "6-12", baseRir: 2, progressionRule: "Rep PRs before load jumps", coachingNote: "Keep braced compounds first" },
    "Upper 2": { blockGoal: "Upper torso hypertrophy", mainLift: "Incline Press", secondaryLift: "Pulldown", accessories: "Row + Delt + Arms", sets: 4, repTarget: "8-15", baseRir: 1, progressionRule: "Push close to failure on isolations", coachingNote: "Straight sets only" },
    "Lower 2": { blockGoal: "Lower hypertrophy", mainLift: "Leg Press", secondaryLift: "Leg Curl", accessories: "Squat pattern + calves + abs", sets: 4, repTarget: "8-15", baseRir: 1, progressionRule: "Hold quality across all sets", coachingNote: "Avoid novelty lifts in hard phases" },
    "Arms / Delts": { blockGoal: "Local hypertrophy", mainLift: "Lateral Raise", secondaryLift: "Curl / Extension", accessories: "Rear delt + preacher + rope work", sets: 3, repTarget: "10-20", baseRir: 1, progressionRule: "Chase tension not ego", coachingNote: "Minimal systemic fatigue" },
    "Full Body Pump": { blockGoal: "Recovery-friendly hypertrophy", mainLift: "Machine Squat", secondaryLift: "Machine Press", accessories: "Cable row + arms + core", sets: 3, repTarget: "10-15", baseRir: 2, progressionRule: "Pump-focused, low axial fatigue", coachingNote: "Useful before deloads" },
    "Squat Focus": { blockGoal: "Strength specificity", mainLift: "Competition Squat", secondaryLift: "Paused Squat", accessories: "Leg Press + Abs", sets: 4, repTarget: "3-6", baseRir: 3, progressionRule: "Top set + backoff style acceptable", coachingNote: "Technique quality > grind" },
    "Bench Focus": { blockGoal: "Strength specificity", mainLift: "Competition Bench", secondaryLift: "Close-Grip / Paused Bench", accessories: "Row + Triceps + Rear Delt", sets: 4, repTarget: "3-6", baseRir: 3, progressionRule: "Small jumps and stable bar path", coachingNote: "Frequent bench practice" },
    "Deadlift Focus": { blockGoal: "Strength specificity", mainLift: "Competition Deadlift", secondaryLift: "RDL / Pause Deadlift", accessories: "Row + Ham Curl + Core", sets: 4, repTarget: "3-5", baseRir: 3, progressionRule: "Low volume, high quality", coachingNote: "Protect recovery for pulls" },
    "Upper Strength": { blockGoal: "Strength support", mainLift: "Overhead / Bench Variation", secondaryLift: "Weighted Pull-Up / Row", accessories: "Arms + Upper Back", sets: 3, repTarget: "4-8", baseRir: 2, progressionRule: "Keep 1-2 reps in reserve", coachingNote: "Build with minimal fluff" },
    "Lower Volume": { blockGoal: "Strength support", mainLift: "Front / Safety Bar Squat", secondaryLift: "Ham Curl", accessories: "Split Squat + Calves", sets: 3, repTarget: "5-8", baseRir: 2, progressionRule: "Enough work to hold momentum", coachingNote: "Avoid junk volume" },
    "Bench / Accessories": { blockGoal: "Bench frequency support", mainLift: "Bench Variant", secondaryLift: "DB Row", accessories: "Chest / Triceps / Delts", sets: 3, repTarget: "5-8", baseRir: 2, progressionRule: "Technique and bar speed", coachingNote: "Accessory day, not max day" },
    "Lower Strength": { blockGoal: "Economy and injury resistance", mainLift: "Trap Bar / Split Squat", secondaryLift: "RDL", accessories: "Calf + Soleus + Core", sets: 3, repTarget: "4-8", baseRir: 3, progressionRule: "Small exposure, low soreness", coachingNote: "Support running economy" },
    "Upper / Core": { blockGoal: "Posture and trunk", mainLift: "Pull-Up / Pulldown", secondaryLift: "DB Press", accessories: "Row + Rotary / Anti-Rotation", sets: 3, repTarget: "6-10", baseRir: 3, progressionRule: "Keep one rep short of grind", coachingNote: "Purpose is support" },
    "Full Body Economy": { blockGoal: "Strength-endurance support", mainLift: "Leg Press", secondaryLift: "Cable Row", accessories: "DB Press + Core + Calves", sets: 2, repTarget: "6-10", baseRir: 3, progressionRule: "Low fatigue, high intent", coachingNote: "Do not steal from run quality" },
    "Mobility / Strength": { blockGoal: "Movement support", mainLift: "Split Squat", secondaryLift: "Landmine Press", accessories: "Ham Curl + Mobility + Core", sets: 2, repTarget: "8-12", baseRir: 3, progressionRule: "Hold steady in heavy run blocks", coachingNote: "Session should freshen not crush" },
    "Power / Strides": { blockGoal: "Neuromuscular support", mainLift: "Jump Squat / Trap Jump", secondaryLift: "MB Throw", accessories: "Short calf + ham work", sets: 2, repTarget: "3-5", baseRir: 3, progressionRule: "Intent and freshness", coachingNote: "Pair with strides day if useful" },
    "Lower Force": { blockGoal: "HYROX force production", mainLift: "Hack Squat / Front Squat", secondaryLift: "Sled Push", accessories: "Ham Curl + Calves + Core", sets: 3, repTarget: "4-8", baseRir: 3, progressionRule: "Build leg force without huge soreness", coachingNote: "Keep technical efficiency" },
    "Upper Pull-Push": { blockGoal: "HYROX support", mainLift: "Chest-Supported Row", secondaryLift: "Incline / Flat Press", accessories: "Pulldown + Farmers Grip + Triceps", sets: 3, repTarget: "6-10", baseRir: 2, progressionRule: "Support Ski/Row and wall-ball posture", coachingNote: "Moderate fatigue only" },
    "Hybrid Strength": { blockGoal: "HYROX transfer", mainLift: "Thruster / Wall Ball Strength", secondaryLift: "Walking Lunge", accessories: "Burpee mechanics + trunk", sets: 3, repTarget: "6-10", baseRir: 2, progressionRule: "Blend strength with event mechanics", coachingNote: "Technical consistency matters" },
    "Posterior / Core": { blockGoal: "HYROX durability", mainLift: "RDL", secondaryLift: "Back Extension", accessories: "Anti-flexion + carries", sets: 3, repTarget: "5-8", baseRir: 3, progressionRule: "Posterior chain durability", coachingNote: "Save freshness for quality run work" },
    "Full Body Power": { blockGoal: "HYROX pop and rate of force", mainLift: "Trap Jump", secondaryLift: "Push Press", accessories: "Carry + slam + row", sets: 2, repTarget: "3-6", baseRir: 3, progressionRule: "Explosive, low total reps", coachingNote: "Do not chase fatigue" },
    "Full Body Strength": { blockGoal: "Combat GPP strength", mainLift: "Front Squat", secondaryLift: "Bench / Press", accessories: "Row + Chins + Core", sets: 3, repTarget: "4-8", baseRir: 3, progressionRule: "Athlete fresh for skill work", coachingNote: "Submaximal quality" },
    "Lower Power + Core": { blockGoal: "Combat power support", mainLift: "Trap Jump / Box Jump", secondaryLift: "Split Squat", accessories: "Anti-rotation + neck", sets: 2, repTarget: "3-6", baseRir: 3, progressionRule: "Power before fatigue", coachingNote: "Fast clean reps" },
    "Upper Strength / Neck": { blockGoal: "Combat contact resilience", mainLift: "Bench / Push Press", secondaryLift: "Weighted Row", accessories: "Neck + Grip + Pulling", sets: 3, repTarget: "4-8", baseRir: 2, progressionRule: "Build posture and contact tolerance", coachingNote: "Never grind neck work" },
    "Full Body Speed": { blockGoal: "Combat speed-strength", mainLift: "MB Throw", secondaryLift: "Jump Squat", accessories: "Band punch / cable lift + core", sets: 2, repTarget: "3-5", baseRir: 3, progressionRule: "Very low fatigue", coachingNote: "Useful near fight week" },
    "Posterior + Grip": { blockGoal: "Combat clinch and trunk", mainLift: "RDL", secondaryLift: "Farmer Carry", accessories: "Ham Curl + rotational core", sets: 3, repTarget: "5-8", baseRir: 2, progressionRule: "Grip and trunk without beating legs", coachingNote: "Stay crisp" },
    "Optional Support": { blockGoal: "Extra low-fatigue support", mainLift: "Machine Press / Row", secondaryLift: "Single-leg pattern", accessories: "Calves + core + mobility", sets: 2, repTarget: "8-12", baseRir: 3, progressionRule: "Only if recovery is good", coachingNote: "First thing removed if stressed" },
  };

  const CONDITIONING_LIBRARY = {
    "Zone 2 Cardio": { objective: "Aerobic health and recovery", distancePct: 0, baseDurationMin: 30, paceMode: "RPE", mainSetTemplate: "30-45 min continuous on bike, incline walk, or rower", intensityCue: "RPE 4-5", specificityNote: "General health: consistent easy work beats random hard work" },
    "General Intervals": { objective: "Cardiometabolic and work capacity", distancePct: 0, baseDurationMin: 20, paceMode: "RPE", mainSetTemplate: "10 x 1 min hard / 1 min easy", intensityCue: "RPE 7-8 on work", specificityNote: "Use low-impact modality if lifting is priority" },
    "Recreational Conditioning": { objective: "Adherence and movement variety", distancePct: 0, baseDurationMin: 35, paceMode: "RPE", mainSetTemplate: "Choose sport, hike, bike, swim, or circuit", intensityCue: "RPE 4-6", specificityNote: "Keep it enjoyable and sustainable" },
    "Long Walk / Hike": { objective: "NEAT and low-stress volume", distancePct: 0, baseDurationMin: 45, paceMode: "Walk", mainSetTemplate: "45-90 min easy walk or hike", intensityCue: "Nasal-breathing easy", specificityNote: "Great for body comp with low fatigue" },
    "Mobility Recovery": { objective: "Restore range and readiness", distancePct: 0, baseDurationMin: 20, paceMode: "Easy", mainSetTemplate: "20-30 min walk + mobility flow", intensityCue: "Easy", specificityNote: "Counts as active recovery" },
    "Optional Mixed Modal": { objective: "Extra engine without monotony", distancePct: 0, baseDurationMin: 25, paceMode: "RPE", mainSetTemplate: "EMOM bike/row/sled/carries 20-25 min", intensityCue: "RPE 6", specificityNote: "First thing removed when recovery drops" },
    "Brisk Walk": { objective: "Aerobic maintenance and confidence", distancePct: 0, baseDurationMin: 25, paceMode: "Walk", mainSetTemplate: "25-40 min brisk walk", intensityCue: "RPE 4-5", specificityNote: "Older adults benefit from frequent low-risk movement" },
    "Cycle / Erg Intervals": { objective: "Power and cardiac support", distancePct: 0, baseDurationMin: 16, paceMode: "RPE", mainSetTemplate: "6-8 x 45-60 s hard / 90 s easy", intensityCue: "RPE 7", specificityNote: "Safer than impact-heavy running for many" },
    "Balance + Carry Walk": { objective: "Functional gait and trunk", distancePct: 0, baseDurationMin: 20, paceMode: "Easy", mainSetTemplate: "Farmer / suitcase carry alternated with easy walk", intensityCue: "RPE 4-5", specificityNote: "Blend conditioning with function" },
    "Recovery Walk": { objective: "Recovery and daily movement", distancePct: 0, baseDurationMin: 20, paceMode: "Walk", mainSetTemplate: "20-30 min easy walk", intensityCue: "Easy", specificityNote: "Use after harder resistance days" },
    "Optional Pool / Cardio": { objective: "Low-impact volume", distancePct: 0, baseDurationMin: 25, paceMode: "Easy", mainSetTemplate: "Water walking / swim / bike", intensityCue: "RPE 4-5", specificityNote: "Joint-friendly option" },
    Mobility: { objective: "Breathing and mobility", distancePct: 0, baseDurationMin: 15, paceMode: "Easy", mainSetTemplate: "Mobility + breathing + easy cycle", intensityCue: "Easy", specificityNote: "Should leave athlete better than they started" },
    "Low-Intensity Cardio": { objective: "Support body comp without interference", distancePct: 0, baseDurationMin: 25, paceMode: "Easy", mainSetTemplate: "20-30 min incline walk / bike post lift or separate", intensityCue: "RPE 4-5", specificityNote: "Keep lower-body eccentric cost low" },
    "Steps / Incline Walk": { objective: "NEAT and appetite / recovery support", distancePct: 0, baseDurationMin: 30, paceMode: "Walk", mainSetTemplate: "Add 20-45 min brisk walk or step target", intensityCue: "Easy", specificityNote: "Good for physique athletes managing fatigue" },
    "Optional Intervals": { objective: "Small high-intensity dose", distancePct: 0, baseDurationMin: 12, paceMode: "RPE", mainSetTemplate: "6-8 x 30-45 s hard / 75 s easy", intensityCue: "RPE 7-8", specificityNote: "Do not crowd lower-body hypertrophy days" },
    "GPP Aerobic": { objective: "Base fitness and recovery", distancePct: 0, baseDurationMin: 25, paceMode: "Easy", mainSetTemplate: "Bike/row/sled drag 25-35 min", intensityCue: "RPE 4-5", specificityNote: "Build work capacity without stealing barbell performance" },
    "Sled / Bike Intervals": { objective: "Anaerobic support", distancePct: 0, baseDurationMin: 15, paceMode: "RPE", mainSetTemplate: "8 x 30 s hard / 90 s easy", intensityCue: "RPE 7-8", specificityNote: "Keep total work small" },
    "Tempo Circuit": { objective: "Mixed GPP tempo", distancePct: 0, baseDurationMin: 18, paceMode: "RPE", mainSetTemplate: "3-4 rounds of 4 min work / 2 min easy", intensityCue: "RPE 6-7", specificityNote: "Useful for general conditioning blocks" },
    "Easy Run": { objective: "Aerobic base", distancePct: 0.25, baseDurationMin: 0, paceMode: "Easy Run", mainSetTemplate: "Continuous easy run", intensityCue: "Easy; conversational", specificityNote: "Most running development comes from repeatable easy volume" },
    "Tempo Run": { objective: "Threshold development", distancePct: 0.18, baseDurationMin: 0, paceMode: "Tempo", mainSetTemplate: "Examples: 20-30 min continuous or 2 x 10-15 min", intensityCue: "Threshold / Zone 3-4", specificityNote: "Teach sustainable discomfort" },
    "Long Run": { objective: "Durability and aerobic density", distancePct: 0.35, baseDurationMin: 0, paceMode: "Long", mainSetTemplate: "Steady long run", intensityCue: "Long-run pace / Zone 2", specificityNote: "Long run should not become race day" },
    "Recovery Run": { objective: "Extra low-stress frequency", distancePct: 0.1, baseDurationMin: 0, paceMode: "Recovery", mainSetTemplate: "20-40 min easy shuffle", intensityCue: "Very easy / Zone 1-2", specificityNote: "Only for athletes who tolerate volume" },
    "Strides / Hills": { objective: "Economy and mechanics", distancePct: 0.08, baseDurationMin: 0, paceMode: "Strides", mainSetTemplate: "6-10 x 10-20 s strides or hill sprints", intensityCue: "Fast but relaxed", specificityNote: "Neural stimulus, not a suffer-fest" },
    "HYROX Stations": { objective: "Station-specific conditioning", distancePct: 0, baseDurationMin: 24, paceMode: "HYROX", mainSetTemplate: "Broken stations with short runs: sled, burpee, row, carry, lunge, wall balls", intensityCue: "RPE 7-8", specificityNote: "Specificity matters: practice transitions and breathing" },
    "Mixed Simulation": { objective: "HYROX race simulation", distancePct: 0.18, baseDurationMin: 0, paceMode: "HYROX", mainSetTemplate: "1 km run + 1-2 stations repeated", intensityCue: "Race pace practice", specificityNote: "Use more often in pre-season / peak" },
    "Machine Intervals": { objective: "Low-impact VO2 / lactate tolerance", distancePct: 0, baseDurationMin: 18, paceMode: "RPE", mainSetTemplate: "Ski/row/bike intervals 30 s to 4 min", intensityCue: "RPE 7-9", specificityNote: "Good when run legs are smoked" },
    "Run Intervals": { objective: "VO2max / speed support", distancePct: 0.12, baseDurationMin: 0, paceMode: "Interval", mainSetTemplate: "Examples: 6 x 800 m or 10 x 400 m", intensityCue: "5K pace / Zone 4-5", specificityNote: "Shorter harder work; full warm-up and cool-down" },
    "HYROX Easy Run": { objective: "Aerobic base", distancePct: 0.2, baseDurationMin: 0, paceMode: "Easy Run", mainSetTemplate: "Continuous easy run", intensityCue: "Easy; conversational", specificityNote: "Most HYROX gains still ride on repeatable aerobic volume" },
    "HYROX Threshold Intervals": { objective: "HYROX run engine", distancePct: 0.15, baseDurationMin: 0, paceMode: "Tempo", mainSetTemplate: "4-6 x 1 km @ threshold with short float", intensityCue: "Threshold / just slower than 5K pace", specificityNote: "Threshold work supports the repeated 1 km demands" },
    "HYROX Long Aerobic Run": { objective: "Aerobic support for HYROX", distancePct: 0.2, baseDurationMin: 0, paceMode: "Long", mainSetTemplate: "Steady easy run", intensityCue: "Easy to steady", specificityNote: "Endurance volume is strongly associated with HYROX performance" },
    "Aerobic Base Run": { objective: "Combat aerobic base", distancePct: 0.2, baseDurationMin: 0, paceMode: "Easy Run", mainSetTemplate: "Continuous run or assault bike", intensityCue: "Easy / Zone 2", specificityNote: "Build the engine that lets skills stay sharp" },
    "Fight-Pace Intervals": { objective: "Repeated hard efforts", distancePct: 0, baseDurationMin: 20, paceMode: "Rounds", mainSetTemplate: "5 x 5 min or sport-specific round structure", intensityCue: "RPE 7-9", specificityNote: "Rounds format mirrors the sport better than random HIIT" },
    "Skill-Rounds Conditioning": { objective: "Specific energy-system support", distancePct: 0, baseDurationMin: 20, paceMode: "Rounds", mainSetTemplate: "Pads / bag / grappling circuits in round format", intensityCue: "Target planned fight pace", specificityNote: "Most specific conditioning lives here" },
    "Sprint / Alactic Power": { objective: "Repeat sprint power", distancePct: 0, baseDurationMin: 12, paceMode: "Sprint", mainSetTemplate: "8-12 x 8-12 s sprint / 60-90 s easy", intensityCue: "Explosive / full quality", specificityNote: "Stop before output drops" },
    "Recovery Aerobic": { objective: "Flush and recover", distancePct: 0, baseDurationMin: 15, paceMode: "Easy", mainSetTemplate: "Easy jog / bike / walk", intensityCue: "Easy", specificityNote: "Important between hard spar and intervals" },
    "Tempo Fartlek": { objective: "Blend of sustained and stochastic effort", distancePct: 0.15, baseDurationMin: 0, paceMode: "Tempo", mainSetTemplate: "8-10 x 2 min on / 1 min float", intensityCue: "RPE 6-7", specificityNote: "Useful bridge from base to specific rounds" },
    "Bodybuilding Recovery Walk": { objective: "Recovery and daily movement", distancePct: 0, baseDurationMin: 20, paceMode: "Walk", mainSetTemplate: "20-30 min easy walk", intensityCue: "Easy", specificityNote: "A bodybuilder does not need marathon cardio" },
    "Strength Recovery Walk": { objective: "Recovery and daily movement", distancePct: 0, baseDurationMin: 20, paceMode: "Walk", mainSetTemplate: "20-30 min easy walk", intensityCue: "Easy", specificityNote: "A small GPP dose that should not tax barbell work" },
    "Elderly Recovery Walk": { objective: "Recovery and daily movement", distancePct: 0, baseDurationMin: 20, paceMode: "Walk", mainSetTemplate: "20-30 min easy walk", intensityCue: "Easy", specificityNote: "Use after harder resistance days" },
    "Optional Bike": { objective: "Low-fatigue aerobic support", distancePct: 0, baseDurationMin: 20, paceMode: "Easy", mainSetTemplate: "20-30 min easy bike", intensityCue: "Easy", specificityNote: "Useful only if recovery is holding" },
    "Optional GPP": { objective: "Optional mixed work capacity", distancePct: 0, baseDurationMin: 20, paceMode: "RPE", mainSetTemplate: "20-25 min easy sled, carry, or row circuit", intensityCue: "RPE 5-6", specificityNote: "Pull this first if the week starts to drag" },
  };

  const PHASE_RIR = {
    "Off-Season Build": [3, 2, 2, 4, 2, 1, 1, 4],
    "Pre-Season Specific": [3, 2, 2, 4, 2, 1, 2, 4],
    "In-Season": [3, 2, 2, 4, 2, 2, 2, 4],
    "Peak / Taper": [3, 3, 2, 4, 3, 3, 3, 4],
  };

  const CONDITIONING_VOLUME_MULTIPLIERS = {
    "Off-Season Build": [1, 1.05, 1.1, 0.75, 1.08, 1.12, 1.15, 0.7],
    "Pre-Season Specific": [1, 1.05, 1.08, 0.8, 1.1, 1.05, 0.9, 0.6],
    "In-Season": [0.9, 0.95, 1, 0.75, 0.95, 1, 0.9, 0.7],
    "Peak / Taper": [0.85, 0.75, 0.7, 0.6, 0.55, 0.45, 0.35, 0.25],
  };

  const RESISTANCE_VOLUME_MULTIPLIERS = {
    "Off-Season Build": [1, 1.05, 1.1, 0.65, 1.05, 1.1, 1.15, 0.6],
    "Pre-Season Specific": [0.95, 1, 1.05, 0.7, 1, 1.05, 0.9, 0.55],
    "In-Season": [0.85, 0.9, 0.9, 0.65, 0.9, 0.9, 0.9, 0.65],
    "Peak / Taper": [0.8, 0.75, 0.7, 0.6, 0.55, 0.45, 0.35, 0.25],
  };

  const ATHLETE_BASE_KM = {
    "General Fitness": { defaultKm: 0, longPct: 0, tempoPct: 0, intervalPct: 0, easyPct: 0, recoveryPct: 0 },
    Elderly: { defaultKm: 0, longPct: 0, tempoPct: 0, intervalPct: 0, easyPct: 0, recoveryPct: 0 },
    Hypertrophy: { defaultKm: 0, longPct: 0, tempoPct: 0, intervalPct: 0, easyPct: 0, recoveryPct: 0 },
    Strength: { defaultKm: 0, longPct: 0, tempoPct: 0, intervalPct: 0, easyPct: 0, recoveryPct: 0 },
    Endurance: { defaultKm: 30, longPct: 0.35, tempoPct: 0.18, intervalPct: 0.12, easyPct: 0.25, recoveryPct: 0.1 },
    HYROX: { defaultKm: 20, longPct: 0.2, tempoPct: 0.15, intervalPct: 0.12, easyPct: 0.2, recoveryPct: 0.08 },
    Combat: { defaultKm: 12, longPct: 0.15, tempoPct: 0.15, intervalPct: 0, easyPct: 0.2, recoveryPct: 0 },
  };

  const EVENT_DEFAULTS = {
    "General Health": { longestKeyRunKm: 0, peakLongRunKm: 0, paceNote: "Use time, not pace" },
    "Ageing Well": { longestKeyRunKm: 0, peakLongRunKm: 0, paceNote: "Use walk talk-test" },
    "Bodybuilding / Physique": { longestKeyRunKm: 0, peakLongRunKm: 0, paceNote: "Keep cardio supportive" },
    Powerlifting: { longestKeyRunKm: 0, peakLongRunKm: 0, paceNote: "Keep GPP supportive" },
    "5K": { longestKeyRunKm: 8, peakLongRunKm: 14, paceNote: "Work around 5K pace and threshold" },
    "10K": { longestKeyRunKm: 10, peakLongRunKm: 18, paceNote: "Threshold and aerobic support" },
    "Half Marathon": { longestKeyRunKm: 14, peakLongRunKm: 24, paceNote: "Threshold, tempo, and long runs" },
    Marathon: { longestKeyRunKm: 18, peakLongRunKm: 32, paceNote: "Long-run durability matters" },
    "HYROX Open": { longestKeyRunKm: 10, peakLongRunKm: 18, paceNote: "1 km repeat pace + stations" },
    "HYROX Pro": { longestKeyRunKm: 12, peakLongRunKm: 20, paceNote: "1 km repeat pace + stations, heavier sleds" },
  };

  function normalizeText(value) {
    return String(value || "").trim();
  }

  function normalizeTextLower(value) {
    return normalizeText(value).toLowerCase();
  }

  function normalizeNumber(value) {
    const raw = String(value ?? "").trim().replace(/,/gu, "");
    if (!raw) {
      return null;
    }
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  }

  function normalizeInteger(value) {
    const parsed = normalizeNumber(value);
    return Number.isFinite(parsed) ? Math.round(parsed) : null;
  }

  function roundTo(value, decimals = 0) {
    if (!Number.isFinite(value)) {
      return null;
    }
    const factor = 10 ** decimals;
    return Math.round(value * factor) / factor;
  }

  function formatNumber(value, decimals = 1) {
    if (!Number.isFinite(value)) {
      return "";
    }
    const rounded = roundTo(value, decimals);
    if (!Number.isFinite(rounded)) {
      return "";
    }
    if (decimals === 0 || rounded % 1 === 0) {
      return String(Math.trunc(rounded));
    }
    return rounded.toFixed(decimals).replace(/\.0+$/u, "").replace(/(\.\d*[1-9])0+$/u, "$1");
  }

  function titleCase(value) {
    return normalizeText(value)
      .replace(/[_-]+/gu, " ")
      .replace(/\b\w/gu, (match) => match.toUpperCase());
  }

  function normalizeTrainingAge(value) {
    const raw = normalizeTextLower(value);
    if (!raw) {
      return "";
    }
    if (["novice", "beginner", "new"].includes(raw)) {
      return "Novice";
    }
    if (raw === "advanced") {
      return "Advanced";
    }
    return "Intermediate";
  }

  function normalizeYesNo(value, fallback = "") {
    const raw = normalizeTextLower(value);
    if (!raw) {
      return fallback;
    }
    if (["yes", "true", "1", "y"].includes(raw)) {
      return "Yes";
    }
    if (["no", "false", "0", "n"].includes(raw)) {
      return "No";
    }
    return fallback;
  }

  function normalizeDateOnly(value, fallback = "") {
    const raw = normalizeText(value);
    if (!raw) {
      return fallback;
    }
    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) {
      return fallback;
    }
    return parsed.toISOString().slice(0, 10);
  }

  function dayDifference(startDate, endDate) {
    const start = normalizeDateOnly(startDate);
    const end = normalizeDateOnly(endDate);
    if (!start || !end) {
      return null;
    }
    const startValue = new Date(`${start}T00:00:00.000Z`).getTime();
    const endValue = new Date(`${end}T00:00:00.000Z`).getTime();
    if (!Number.isFinite(startValue) || !Number.isFinite(endValue)) {
      return null;
    }
    return Math.round((endValue - startValue) / 86400000);
  }

  function phaseFromDays(daysToEvent) {
    if (!Number.isFinite(daysToEvent)) {
      return "";
    }
    if (daysToEvent > 56) {
      return "BASE";
    }
    if (daysToEvent > 28) {
      return "BUILD";
    }
    if (daysToEvent > 14) {
      return "SPECIFIC";
    }
    return "TAPER";
  }

  function scoreSleep(hours) {
    if (!Number.isFinite(hours)) {
      return 6;
    }
    if (hours >= 8) {
      return 15;
    }
    if (hours >= 7) {
      return 13;
    }
    if (hours >= 6) {
      return 10;
    }
    return 6;
  }

  function createCheck(key, label, status, actualValue, targetValue) {
    return {
      key,
      label,
      status: status || "",
      actualValue,
      targetValue,
    };
  }

  function countStatuses(checks, desiredStatus) {
    return checks.reduce((total, item) => total + (item.status === desiredStatus ? 1 : 0), 0);
  }

  function countActiveChecks(checks) {
    return checks.reduce((total, item) => total + (item.status ? 1 : 0), 0);
  }

  function buildReadiness(checks, sleepHours, injuryRiskFlag, primaryLimiter, coachAction) {
    const activeCount = countActiveChecks(checks);
    if (!activeCount) {
      return {
        score: null,
        band: "",
        flagCount: "",
        flagsActive: 0,
        primaryLimiter: "",
        coachAction: "",
      };
    }

    const onCourse = countStatuses(checks, "ON COURSE");
    const score = roundTo((onCourse / activeCount) * 70 + scoreSleep(sleepHours) + (injuryRiskFlag === "No" ? 15 : 3), 0);
    const band = score >= 85 ? "READY TO PROGRESS" : score >= 70 ? "PROGRESS CAUTIOUSLY" : "HOLD / FIX LIMITER";
    const flagsActive = countStatuses(checks, "OFF COURSE");

    return {
      score,
      band,
      flagCount: `${flagsActive} flag(s) active`,
      flagsActive,
      primaryLimiter,
      coachAction,
    };
  }

  function detectAthleteKind(profile) {
    const athleteType = normalizeV2AthleteType(profile?.athleteType || profile?.athleteProfile);
    if (athleteType && (profile?.trainingWorkbookVersion === "v2" || profile?.primaryPhase || profile?.resistanceDaysPerWeek || profile?.conditioningDaysPerWeek)) {
      return athleteType;
    }

    const athleteProfile = normalizeTextLower(profile?.athleteProfile);
    if (["runner", "hyrox", "endurance"].includes(athleteProfile)) {
      return athleteProfile;
    }

    const combined = [
      normalizeTextLower(profile?.primarySport),
      normalizeTextLower(profile?.goalEvent),
      normalizeTextLower(profile?.goalFocus),
    ].join(" ");

    if (SPORT_KEYWORDS.hyrox.some((keyword) => combined.includes(keyword))) {
      return "hyrox";
    }
    if (SPORT_KEYWORDS.runner.some((keyword) => combined.includes(keyword))) {
      return "runner";
    }
    if (SPORT_KEYWORDS.endurance.some((keyword) => combined.includes(keyword))) {
      return "endurance";
    }

    return "";
  }

  function normalizeV2AthleteType(value) {
    const raw = normalizeTextLower(value);
    if (!raw) {
      return "";
    }

    if (["general", "general fitness", "general_fitness", "gen pop", "general population"].includes(raw)) {
      return "general_fitness";
    }
    if (["elderly", "older adult", "older adults", "ageing well", "aging well"].includes(raw)) {
      return "elderly";
    }
    if (["hypertrophy", "bodybuilding", "physique"].includes(raw)) {
      return "hypertrophy";
    }
    if (["strength", "powerlifting"].includes(raw)) {
      return "strength";
    }
    if (["endurance", "endurance athlete"].includes(raw)) {
      return "endurance";
    }
    if (["hyrox", "hybrid", "hybrid athlete"].includes(raw)) {
      return "hyrox";
    }
    if (["combat", "fight", "fighter", "martial arts"].includes(raw)) {
      return "combat";
    }
    return "";
  }

  function athleteTypeLabel(value) {
    const normalized = normalizeV2AthleteType(value);
    return DYNAMIC_WORKBOOK_TYPE_LABELS[normalized] || titleCase(value);
  }

  function getWorkbookTableType(value) {
    const normalized = normalizeV2AthleteType(value);
    if (!normalized) {
      return "";
    }
    if (normalized === "general_fitness") {
      return "General Fitness";
    }
    if (normalized === "hyrox") {
      return "HYROX";
    }
    return athleteTypeLabel(normalized);
  }

  function normalizeWorkbookPhase(value) {
    const raw = normalizeTextLower(value);
    if (!raw) {
      return "Off-Season Build";
    }
    if (["off-season", "off season", "off-season build", "off season build", "base", "build"].includes(raw)) {
      return "Off-Season Build";
    }
    if (["pre-season", "pre season", "pre-season specific", "pre season specific", "specific"].includes(raw)) {
      return "Pre-Season Specific";
    }
    if (["in-season", "in season"].includes(raw)) {
      return "In-Season";
    }
    if (["peak", "peak / taper", "peak/taper", "taper"].includes(raw)) {
      return "Peak / Taper";
    }
    return titleCase(value);
  }

  function normalizeWorkbookEvent(athleteType, value) {
    const raw = normalizeText(value);
    if (raw) {
      return raw;
    }
    return DEFAULT_EVENT_BY_TYPE[normalizeV2AthleteType(athleteType)] || "General Health";
  }

  function normalizeWeighInType(value) {
    const raw = normalizeTextLower(value);
    if (!raw || raw === "n/a" || raw === "na" || raw === "none") {
      return "N/A";
    }
    if (raw.includes("same")) {
      return "Same Day / <6 h";
    }
    if (raw.includes("24")) {
      return "24 h+";
    }
    if (raw.includes("multi")) {
      return "Multi-Day Tournament";
    }
    return titleCase(value);
  }

  function normalizePriorityBias(value) {
    const raw = normalizeText(value);
    if (!raw) {
      return "";
    }
    return titleCase(raw);
  }

  function parseRepRangeBounds(value) {
    const raw = normalizeText(value);
    if (!raw) {
      return {
        min: null,
        max: null,
        unit: "",
      };
    }
    const distanceMatch = raw.match(/^(\d+)\s*-\s*(\d+)\s*m$/iu);
    if (distanceMatch) {
      return { min: Number(distanceMatch[1]), max: Number(distanceMatch[2]), unit: "m" };
    }
    const secondsMatch = raw.match(/^(\d+)\s*-\s*(\d+)\s*s$/iu);
    if (secondsMatch) {
      return { min: Number(secondsMatch[1]), max: Number(secondsMatch[2]), unit: "s" };
    }
    const rangeMatch = raw.match(/^(\d+)\s*-\s*(\d+)$/u);
    if (rangeMatch) {
      return { min: Number(rangeMatch[1]), max: Number(rangeMatch[2]), unit: "reps" };
    }
    const singleMatch = raw.match(/^(\d+)$/u);
    if (singleMatch) {
      return { min: Number(singleMatch[1]), max: Number(singleMatch[1]), unit: "reps" };
    }
    return {
      min: null,
      max: null,
      unit: "",
    };
  }

  function buildPaceSnapshot(recent5kTimeMin) {
    const pace5k = Number.isFinite(recent5kTimeMin) && recent5kTimeMin > 0 ? roundTo(recent5kTimeMin / 5, 2) : null;
    return {
      pace5k,
      easyLow: Number.isFinite(pace5k) ? roundTo(pace5k * 1.2, 2) : null,
      easyHigh: Number.isFinite(pace5k) ? roundTo(pace5k * 1.35, 2) : null,
      tempo: Number.isFinite(pace5k) ? roundTo(pace5k * 1.08, 2) : null,
      interval: Number.isFinite(pace5k) ? roundTo(pace5k * 0.98, 2) : null,
      longLow: Number.isFinite(pace5k) ? roundTo(pace5k * 1.22, 2) : null,
      longHigh: Number.isFinite(pace5k) ? roundTo(pace5k * 1.38, 2) : null,
      hyrox1k: Number.isFinite(pace5k) ? roundTo(pace5k * 1.08, 2) : null,
    };
  }

  function formatPaceWindow(low, high) {
    if (Number.isFinite(low) && Number.isFinite(high)) {
      return `${formatNumber(low, 2)}-${formatNumber(high, 2)} min/km`;
    }
    if (Number.isFinite(low)) {
      return `${formatNumber(low, 2)} min/km`;
    }
    return "";
  }

  function buildPaceTarget(paceMode, paceSnapshot, detail) {
    const mode = normalizeText(paceMode);
    if (!mode) {
      return normalizeText(detail?.intensityCue);
    }
    if (mode === "Easy Run") {
      return `Easy @ ${formatPaceWindow(paceSnapshot.easyLow, paceSnapshot.easyHigh)}`;
    }
    if (mode === "Tempo") {
      return Number.isFinite(paceSnapshot.tempo) ? `Tempo @ ${formatNumber(paceSnapshot.tempo, 2)} min/km` : normalizeText(detail?.intensityCue);
    }
    if (mode === "Interval") {
      return Number.isFinite(paceSnapshot.interval) ? `Intervals @ ${formatNumber(paceSnapshot.interval, 2)} min/km` : normalizeText(detail?.intensityCue);
    }
    if (mode === "Long") {
      return `Long @ ${formatPaceWindow(paceSnapshot.longLow, paceSnapshot.longHigh)}`;
    }
    if (mode === "HYROX") {
      return Number.isFinite(paceSnapshot.hyrox1k) ? `1 km reps @ ${formatNumber(paceSnapshot.hyrox1k, 2)} min/km` : normalizeText(detail?.intensityCue);
    }
    if (mode === "Walk") {
      return "Brisk / talk-test";
    }
    if (mode === "Rounds") {
      return "Round-by-round pace, not random red-lining";
    }
    if (mode === "Sprint") {
      return "Explosive reps with full quality";
    }
    return normalizeText(detail?.intensityCue);
  }

  function inferHeartRateZone(detail) {
    const mode = normalizeText(detail?.paceMode);
    if (mode === "Recovery") {
      return 1;
    }
    if (mode === "Easy" || mode === "Easy Run" || mode === "Walk" || mode === "Long") {
      return 2;
    }
    if (mode === "Tempo") {
      return 3;
    }
    if (mode === "Interval" || mode === "HYROX" || mode === "Rounds") {
      return 4;
    }
    if (mode === "Sprint") {
      return 5;
    }
    return "";
  }

  function mapStructuredSessionType(detail, label) {
    const mode = normalizeText(detail?.paceMode);
    const labelText = normalizeTextLower(label);
    if (mode === "Recovery" || labelText.includes("recovery") || labelText.includes("mobility")) {
      return "recovery";
    }
    if (mode === "Easy" || mode === "Easy Run" || mode === "Walk") {
      return "aerobic_base";
    }
    if (mode === "Tempo") {
      return "threshold";
    }
    if (mode === "Interval" || mode === "Sprint") {
      return "intervals";
    }
    if (mode === "Long") {
      return "long_session";
    }
    if (mode === "HYROX" || mode === "Rounds") {
      return "race_specific";
    }
    return "standard";
  }

  function mapDayTypeFromConditioning(label, detail) {
    const text = normalizeTextLower(label);
    if (text.includes("mobility")) {
      return "mobility";
    }
    if (text.includes("recovery") || normalizeTextLower(detail?.paceMode) === "recovery") {
      return "recovery";
    }
    if (text.includes("walk")) {
      return "recovery";
    }
    return "conditioning";
  }

  function inferLoadReference(exerciseName, inputs) {
    const label = normalizeTextLower(exerciseName);
    if (!label) {
      return null;
    }
    const squat1rm = normalizeNumber(inputs.currentSquat1rmKg);
    const bench1rm = normalizeNumber(inputs.currentBench1rmKg);
    const deadlift1rm = normalizeNumber(inputs.currentDeadlift1rmKg);

    if (label.includes("squat") || label.includes("leg press")) {
      return squat1rm;
    }
    if (label.includes("bench") || label.includes("press") || label.includes("incline")) {
      return bench1rm;
    }
    if (label.includes("deadlift") || label.includes("rdl") || label.includes("hinge") || label.includes("trap bar")) {
      return deadlift1rm;
    }
    return null;
  }

  function inferLoadPercent(repTarget, weekIndex) {
    const bounds = parseRepRangeBounds(repTarget);
    const average = Number.isFinite(bounds.min) && Number.isFinite(bounds.max)
      ? (bounds.min + bounds.max) / 2
      : Number.isFinite(bounds.max)
        ? bounds.max
        : null;
    const base =
      !Number.isFinite(average) ? 0.6
      : average <= 4 ? 0.82
      : average <= 6 ? 0.76
      : average <= 8 ? 0.72
      : average <= 10 ? 0.68
      : average <= 12 ? 0.64
      : 0.55;
    return Math.max(0.35, roundTo(base - (weekIndex >= 6 ? 0.04 : 0), 2));
  }

  function estimateStartingLoadKg(exerciseName, repTarget, inputs, weekIndex) {
    const oneRm = inferLoadReference(exerciseName, inputs);
    if (!Number.isFinite(oneRm) || oneRm <= 0) {
      return "";
    }
    return roundTo(oneRm * inferLoadPercent(repTarget, weekIndex), 1);
  }

  function estimateIncrementKg(repTarget) {
    const bounds = parseRepRangeBounds(repTarget);
    const average = Number.isFinite(bounds.min) && Number.isFinite(bounds.max) ? (bounds.min + bounds.max) / 2 : bounds.max;
    if (!Number.isFinite(average)) {
      return "";
    }
    if (average <= 6) {
      return 2.5;
    }
    if (average <= 10) {
      return 2;
    }
    return 1;
  }

  function buildResistanceExerciseRows(slotLabel, slot, inputs, phase, weekIndex) {
    const multiplier = (RESISTANCE_VOLUME_MULTIPLIERS[phase] || RESISTANCE_VOLUME_MULTIPLIERS["Off-Season Build"] || [1])[weekIndex] || 1;
    const rirValue = (PHASE_RIR[phase] || PHASE_RIR["Off-Season Build"] || [3])[weekIndex] || slot.baseRir || 3;
    const scaledSets = Math.max(1, Math.round(Number(slot.sets || 0) * multiplier));

    const rows = [
      {
        blockLabel: "A1",
        name: slot.mainLift,
        sets: scaledSets,
        repTarget: slot.repTarget,
        intensity: `RIR ${rirValue}`,
        rest: slot.repTarget.includes("s") || slot.repTarget.includes("m") ? "60 sec" : "120 sec",
        tempo: "",
        startingLoad: estimateStartingLoadKg(slot.mainLift, slot.repTarget, inputs, weekIndex),
        increment: estimateIncrementKg(slot.repTarget),
        progressionRule: slot.progressionRule,
        clientEntryMode: "log_weight_reps_rpe",
        notes: `${slot.blockGoal}. ${slot.coachingNote}`,
      },
      {
        blockLabel: "A2",
        name: slot.secondaryLift,
        sets: Math.max(1, scaledSets - (scaledSets >= 4 ? 1 : 0)),
        repTarget: slot.repTarget,
        intensity: `RIR ${Math.max(1, rirValue - 1)}`,
        rest: "90 sec",
        tempo: "",
        startingLoad: estimateStartingLoadKg(slot.secondaryLift, slot.repTarget, inputs, weekIndex),
        increment: estimateIncrementKg(slot.repTarget),
        progressionRule: `Repeat with control. ${slot.progressionRule}`,
        clientEntryMode: "log_weight_reps_rpe",
        notes: slot.coachingNote,
      },
      {
        blockLabel: "B1",
        name: slot.accessories,
        sets: Math.max(1, Math.min(3, scaledSets)),
        repTarget: slot.repTarget,
        intensity: `RIR ${Math.max(1, rirValue - 1)}`,
        rest: "60 sec",
        tempo: "",
        startingLoad: "",
        increment: "",
        progressionRule: "Own the pattern before you chase more.",
        clientEntryMode: "log_reps_rpe",
        notes: `Accessory support for ${slotLabel}. Keep the quality repeatable.`,
      },
    ];

    return rows.filter((row) => normalizeText(row.name));
  }

  function buildFuelCue(inputs, detail, targetMinutes) {
    const athleteType = normalizeV2AthleteType(inputs.athleteType);
    const minutes = Number.isFinite(targetMinutes) ? targetMinutes : 0;
    if (athleteType === "hyrox") {
      if (minutes >= 60) {
        return "30-60 g carbs/hr, sip fluid every 10-15 min";
      }
      return "Hydrate pre-session and rehearse quick between-station breathing";
    }
    if (athleteType === "combat") {
      return normalizeWeighInType(inputs.weighInType) === "N/A"
        ? "Hydrate and recover like a pro between hard rounds"
        : "Keep fueling simple and clean around weight-management demands";
    }
    if (Number.isFinite(targetMinutes) && minutes >= 75) {
      return "30-60 g carbs/hr and regular fluid sips";
    }
    if (Number.isFinite(targetMinutes) && minutes >= 45) {
      return "Hydrate before and keep the session smooth";
    }
    return normalizeText(detail?.specificityNote) ? "Keep it easy enough to repeat tomorrow" : "";
  }

  function buildConditioningCoachNote(inputs, slotLabel, detail) {
    const athleteType = normalizeV2AthleteType(inputs.athleteType);
    if (athleteType === "hyrox" && ["HYROX Stations", "Mixed Simulation", "Machine Intervals"].includes(slotLabel)) {
      return "Pair this with station quality, transitions, and race breathing.";
    }
    if (athleteType === "combat" && ["Fight-Pace Intervals", "Skill-Rounds Conditioning"].includes(slotLabel)) {
      return "Rounds should match bout demands, not random HIIT suffering.";
    }
    return normalizeText(detail?.specificityNote);
  }

  function buildConditioningDay(slotLabel, detail, inputs, weekIndex, weekTargetKm, paceSnapshot) {
    const multiplier = (CONDITIONING_VOLUME_MULTIPLIERS[inputs.primaryPhase] || CONDITIONING_VOLUME_MULTIPLIERS["Off-Season Build"] || [1])[weekIndex] || 1;
    const targetKm = Number(detail.distancePct) > 0 && Number.isFinite(weekTargetKm)
      ? roundTo(weekTargetKm * Number(detail.distancePct), 1)
      : "";
    const baseDuration = Number(detail.baseDurationMin || 0);
    const targetMinutes = baseDuration > 0 ? Math.max(10, Math.round(baseDuration * multiplier)) : "";
    const targetPace = buildPaceTarget(detail.paceMode, paceSnapshot, detail);
    const coachNote = buildConditioningCoachNote(inputs, slotLabel, detail);
    return {
      title: slotLabel,
      focus: detail.objective || "Conditioning support",
      dayType: mapDayTypeFromConditioning(slotLabel, detail),
      estimatedDurationMinutes: targetMinutes || inputs.avgSessionMinutes || "",
      notes: [detail.mainSetTemplate, detail.specificityNote, coachNote].filter(Boolean).join("\n"),
      exerciseRows: [],
      sessionType: mapStructuredSessionType(detail, slotLabel),
      sessionLabel: slotLabel,
      distanceKm: targetKm || "",
      heartRateZone: inferHeartRateZone(detail),
      intensityCue: detail.intensityCue || "",
      targetPace,
      fuelCue: buildFuelCue(inputs, detail, targetMinutes),
    };
  }

  function combineDayPlan(dayName, resistancePlan, conditioningPlan, inputs) {
    if (!resistancePlan && !conditioningPlan) {
      return {
        title: `${dayName} Reset`,
        focus: "Recovery and readiness",
        dayType: "rest",
        estimatedDurationMinutes: "",
        notes: "Recovery day. Use this to walk, restore range, and keep readiness high.",
        exerciseRows: [],
        sessionType: "standard",
        sessionLabel: "",
        distanceKm: "",
        heartRateZone: "",
        intensityCue: "",
        targetPace: "",
        fuelCue: "",
      };
    }

    if (resistancePlan && conditioningPlan) {
      return {
        title: resistancePlan.title,
        focus: `${resistancePlan.focus} + ${conditioningPlan.focus}`,
        dayType: conditioningPlan.dayType || "conditioning",
        estimatedDurationMinutes: Math.min(
          150,
          (Number(resistancePlan.estimatedDurationMinutes || 0) || 0) + (Number(conditioningPlan.estimatedDurationMinutes || 0) || 0)
        ),
        notes: [resistancePlan.notes, conditioningPlan.notes].filter(Boolean).join("\n\n"),
        exerciseRows: resistancePlan.exerciseRows,
        sessionType: conditioningPlan.sessionType,
        sessionLabel: conditioningPlan.sessionLabel,
        distanceKm: conditioningPlan.distanceKm,
        heartRateZone: conditioningPlan.heartRateZone,
        intensityCue: conditioningPlan.intensityCue,
        targetPace: conditioningPlan.targetPace,
        fuelCue: conditioningPlan.fuelCue,
      };
    }

    return resistancePlan || conditioningPlan;
  }

  function buildDynamicProgramSummary(inputs, weekTargetKm, paceSnapshot) {
    const athleteTypeLabelValue = athleteTypeLabel(inputs.athleteType);
    const eventDefaults = EVENT_DEFAULTS[inputs.primaryEvent] || EVENT_DEFAULTS[DEFAULT_EVENT_BY_TYPE[normalizeV2AthleteType(inputs.athleteType)]];
    const runBased = ["endurance", "hyrox", "combat"].includes(normalizeV2AthleteType(inputs.athleteType));
    const planArchitecture = runBased
      ? "Sport-specific conditioning is primary; resistance training supports durability, force, and economy."
      : "Resistance training is primary; conditioning supports health, body composition, or work capacity.";
    const weeklyRunBias = runBased
      ? inputs.experienceLevel === "Advanced"
        ? "Higher specificity with tighter pace control."
        : "Build repeatable volume first, then sharpen."
      : "Keep conditioning low-fatigue and non-interfering.";
    const suggestedTid = normalizeV2AthleteType(inputs.athleteType) === "endurance"
      ? inputs.experienceLevel === "Advanced"
        ? "Polarized emphasis"
        : "Pyramidal emphasis"
      : normalizeV2AthleteType(inputs.athleteType) === "hyrox"
        ? "Mostly easy volume plus threshold and race-specific work"
        : "Use conditioning only as a supportive dose";
    const resistanceGuardrail =
      normalizeV2AthleteType(inputs.athleteType) === "hypertrophy"
        ? "Bias stable exercises, enough weekly volume, and planned deloads."
        : normalizeV2AthleteType(inputs.athleteType) === "strength"
          ? "Practice comp-adjacent patterns, manage fatigue, and chase small load jumps."
          : normalizeV2AthleteType(inputs.athleteType) === "elderly"
            ? "2-3x weekly full-body work with power, balance, and carries."
            : "The best plan is the one the athlete can repeat consistently.";
    const runGuardrail = runBased
      ? "Most development comes from repeatable easy volume plus 1-2 quality sessions."
      : "If this is not a run-based athlete, conditioning should never sabotage the main plan.";
    const deloadRhythm = inputs.primaryPhase === "Peak / Taper"
      ? "Volume should trend downward most weeks."
      : "Weeks 4 and 8 are reduced-volume checkpoints unless the coach overrides.";
    const flags = {
      runSpecificityNeeded: runBased ? "YES" : "NO",
      hyroxRelevant: normalizeV2AthleteType(inputs.athleteType) === "hyrox" ? "YES" : "NO",
      combatRelevant: normalizeV2AthleteType(inputs.athleteType) === "combat" ? "YES" : "NO",
      taperActive: inputs.primaryPhase === "Peak / Taper" ? "YES" : "NO",
    };

    return {
      planArchitecture,
      weeklyRunBias,
      suggestedTid,
      resistanceGuardrail,
      runGuardrail,
      deloadRhythm,
      flags,
      paceSnapshot,
      previewPairs: [
        { label: "Athlete type", value: athleteTypeLabelValue },
        { label: "Primary phase", value: inputs.primaryPhase },
        { label: "Primary event", value: inputs.primaryEvent },
        { label: "Weeks to event", value: Number.isFinite(inputs.weeksToEvent) ? String(inputs.weeksToEvent) : "" },
        { label: "Resistance days", value: `${inputs.resistanceDaysPerWeek} / wk` },
        { label: "Conditioning days", value: `${inputs.conditioningDaysPerWeek} / wk` },
        { label: "Week 1 target", value: Number.isFinite(weekTargetKm?.[0]) ? `${formatNumber(weekTargetKm[0], 1)} km` : `${inputs.avgSessionMinutes || 0} min sessions` },
        { label: "Week 8 target", value: Number.isFinite(weekTargetKm?.[7]) ? `${formatNumber(weekTargetKm[7], 1)} km` : deloadRhythm },
      ].filter((item) => item.value),
      summaryCard: [
        `${athleteTypeLabelValue} | ${inputs.primaryPhase} | ${Number.isFinite(inputs.weeksToEvent) ? `${inputs.weeksToEvent} week(s) to event` : "Open-ended build"}`,
        `${planArchitecture}`,
        `Weekly split: ${inputs.resistanceDaysPerWeek} resistance day(s) + ${inputs.conditioningDaysPerWeek} conditioning day(s)`,
        Number.isFinite(weekTargetKm?.[0]) ? `Week 1 → Week 8 conditioning target: ${formatNumber(weekTargetKm[0], 1)} km → ${formatNumber(weekTargetKm[7], 1)} km` : `Session rhythm: ${inputs.avgSessionMinutes || 0} min average duration`,
        `Guardrails: ${resistanceGuardrail} ${runGuardrail}`,
        `Coaching bias: ${inputs.priorityBias || "Balanced development"} | TID: ${suggestedTid}`,
      ].filter(Boolean),
      eventDefaults,
    };
  }

  function buildDynamicChecks(inputs, weekTargetKm) {
    const runBased = ["endurance", "hyrox", "combat"].includes(normalizeV2AthleteType(inputs.athleteType));
    const fatigue = normalizeInteger(inputs.currentFatigue);
    const injuryFlag = normalizeText(inputs.injuryNotes) ? "Yes" : "No";
    const checks = [
      createCheck("resistance_days", "Resistance days", inputs.resistanceDaysPerWeek >= 1 && inputs.resistanceDaysPerWeek <= 6 ? "ON COURSE" : "OFF COURSE", inputs.resistanceDaysPerWeek, "1-6 / wk"),
      createCheck("conditioning_days", "Conditioning days", inputs.conditioningDaysPerWeek >= 0 && inputs.conditioningDaysPerWeek <= 6 ? "ON COURSE" : "OFF COURSE", inputs.conditioningDaysPerWeek, "0-6 / wk"),
      createCheck("session_minutes", "Avg session minutes", inputs.avgSessionMinutes >= 30 && inputs.avgSessionMinutes <= 120 ? "ON COURSE" : "OFF COURSE", inputs.avgSessionMinutes, "30-120 min"),
      createCheck("fatigue", "Current fatigue", !Number.isFinite(fatigue) || fatigue <= 3 ? "ON COURSE" : "OFF COURSE", fatigue, "1-3 preferred"),
      createCheck("baseline_strength", "Strength baseline", ["hypertrophy", "strength", "general_fitness", "hyrox", "combat"].includes(normalizeV2AthleteType(inputs.athleteType))
        ? (Number.isFinite(inputs.currentSquat1rmKg) || Number.isFinite(inputs.currentBench1rmKg) || Number.isFinite(inputs.currentDeadlift1rmKg) ? "ON COURSE" : "OFF COURSE")
        : "", Number.isFinite(inputs.currentSquat1rmKg) || Number.isFinite(inputs.currentBench1rmKg) || Number.isFinite(inputs.currentDeadlift1rmKg) ? "logged" : "", "At least one strength marker"),
      createCheck("running_baseline", "Running baseline", runBased
        ? (Number.isFinite(inputs.currentWeeklyRunningKm) || Number.isFinite(weekTargetKm?.[0]) ? "ON COURSE" : "OFF COURSE")
        : "", inputs.currentWeeklyRunningKm, runBased ? "Current weekly km or auto target" : ""),
    ];

    const primaryLimiter =
      injuryFlag === "Yes" ? "Injury / limitation notes"
      : checks.find((item) => item.status === "OFF COURSE")?.label || "No major limiter";
    const coachAction =
      injuryFlag === "Yes"
        ? "Protect movement quality first. Keep the plan controlled until limitations settle."
        : checks[3].status === "OFF COURSE"
          ? "Reduce total fatigue first, then rebuild the week with cleaner repeatability."
          : checks.find((item) => item.status === "OFF COURSE")
            ? "Tighten the inputs first, then progress one variable at a time."
            : "Hold the structure steady and progress only where execution is earned.";

    return {
      checks,
      injuryFlag,
      fatigue,
      primaryLimiter,
      coachAction,
    };
  }

  function buildDynamicWeekTargetKm(inputs, weekIndex) {
    const athleteType = getWorkbookTableType(inputs.athleteType);
    if (!["Endurance", "HYROX", "Combat"].includes(athleteType)) {
      return null;
    }
    const baseEntry = ATHLETE_BASE_KM[athleteType] || ATHLETE_BASE_KM.Endurance;
    const currentKm = normalizeNumber(inputs.currentWeeklyRunningKm);
    const startingPoint = Math.max(Number.isFinite(currentKm) ? currentKm : 0, Number(baseEntry.defaultKm || 0));
    const multipliers = CONDITIONING_VOLUME_MULTIPLIERS[inputs.primaryPhase] || CONDITIONING_VOLUME_MULTIPLIERS["Off-Season Build"];
    return roundTo(startingPoint * Number(multipliers?.[weekIndex] || 1), 1);
  }

  function buildDynamicInputs(profile, options) {
    const athleteType = normalizeV2AthleteType(profile.athleteType || profile.athleteProfile);
    const startDate = normalizeDateOnly(options.startDate || profile.planStartDate || options.assessmentDate || "");
    const competitionDate = normalizeDateOnly(profile.competitionDate || profile.goalDate || "");
    const weeksToEventRaw = competitionDate && startDate ? Math.round(dayDifference(startDate, competitionDate) / 7) : null;
    return {
      trainingWorkbookVersion: "v2",
      athleteType,
      athleteTypeLabel: athleteTypeLabel(athleteType),
      athleteName: normalizeText(options.athleteName || profile.athleteName || "Athlete"),
      startDate,
      competitionDate,
      primaryPhase: normalizeWorkbookPhase(profile.primaryPhase || profile.goalFocus),
      primaryEvent: normalizeWorkbookEvent(athleteType, profile.primaryEvent || profile.goalEvent),
      experienceLevel: titleCase(profile.experienceLevel || profile.trainingAgeLevel || "Intermediate"),
      priorityBias: normalizePriorityBias(profile.priorityBias),
      weeksToEvent: Number.isFinite(weeksToEventRaw) ? Math.max(0, weeksToEventRaw) : null,
      age: normalizeInteger(profile.age || profile.ageYears),
      bodyMassKg: normalizeNumber(profile.bodyMassKg),
      resistanceDaysPerWeek: Math.max(0, normalizeInteger(profile.resistanceDaysPerWeek ?? profile.plannedStrengthSessionsPerWeek) || 0),
      conditioningDaysPerWeek: Math.max(0, normalizeInteger(profile.conditioningDaysPerWeek ?? profile.plannedHardSessionsPerWeek) || 0),
      avgSessionMinutes: Math.max(0, normalizeInteger(profile.avgSessionMinutes ?? profile.estimatedDurationMinutes) || 0),
      currentWeeklyRunningKm: normalizeNumber(profile.currentWeeklyRunningKm ?? profile.runnerCurrentWeeklyKm ?? profile.hyroxCurrentRunKm),
      longestRunCompletedKm: normalizeNumber(profile.longestRunCompletedKm ?? profile.runnerCurrentLongRunKm),
      recent5kTimeMin: normalizeNumber(profile.recent5kTimeMin ?? profile.runnerLatestRaceTimeMin ?? profile.hyroxRecent5kTimeMin),
      currentSquat1rmKg: normalizeNumber(profile.currentSquat1rmKg),
      currentBench1rmKg: normalizeNumber(profile.currentBench1rmKg),
      currentDeadlift1rmKg: normalizeNumber(profile.currentDeadlift1rmKg),
      weighInType: normalizeWeighInType(profile.weighInType),
      currentFatigue: normalizeInteger(profile.currentFatigue),
      injuryNotes: normalizeText(profile.injuryNotes || profile.currentLimiter),
      sleepHours: normalizeNumber(profile.sleepHours),
    };
  }

  function buildResistancePlanForDay(dayName, inputs, weekIndex) {
    const pattern = RESISTANCE_DAY_PATTERNS[inputs.resistanceDaysPerWeek] || [];
    if (!pattern.includes(dayName)) {
      return null;
    }
    const slotIndex = pattern.indexOf(dayName);
    const slotLabel = (RESISTANCE_SLOT_MAP[getWorkbookTableType(inputs.athleteType)] || [])[slotIndex];
    const slot = RESISTANCE_LIBRARY[slotLabel];
    if (!slot) {
      return null;
    }

    return {
      title: slotLabel,
      focus: slot.blockGoal,
      dayType: "workout",
      estimatedDurationMinutes: inputs.avgSessionMinutes || 75,
      notes: `${slot.progressionRule}. ${slot.coachingNote}`,
      exerciseRows: buildResistanceExerciseRows(slotLabel, slot, inputs, inputs.primaryPhase, weekIndex),
      sessionType: "standard",
      sessionLabel: "",
      distanceKm: "",
      heartRateZone: "",
      intensityCue: "",
      targetPace: "",
      fuelCue: "",
    };
  }

  function buildConditioningPlanForDay(dayName, inputs, weekIndex, weekTargetKm, paceSnapshot) {
    const pattern = CONDITIONING_DAY_PATTERNS[inputs.conditioningDaysPerWeek] || [];
    if (!pattern.includes(dayName)) {
      return null;
    }
    const slotIndex = pattern.indexOf(dayName);
    const slotLabel = (CONDITIONING_SLOT_MAP[getWorkbookTableType(inputs.athleteType)] || [])[slotIndex];
    const detail = CONDITIONING_LIBRARY[slotLabel];
    if (!slotLabel || !detail) {
      return null;
    }
    return buildConditioningDay(slotLabel, detail, inputs, weekIndex, weekTargetKm, paceSnapshot);
  }

  function buildDynamicWeeks(inputs, summary, paceSnapshot) {
    const weeks = [];
    const weekTargetsKm = Array.from({ length: 8 }, (_, index) => buildDynamicWeekTargetKm(inputs, index));
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    for (let weekIndex = 0; weekIndex < 8; weekIndex += 1) {
      const weekNumber = weekIndex + 1;
      const days = dayNames.map((dayName, dayIndex) => {
        const resistancePlan = buildResistancePlanForDay(dayName, inputs, weekIndex);
        const conditioningPlan = buildConditioningPlanForDay(dayName, inputs, weekIndex, weekTargetsKm[weekIndex], paceSnapshot);
        return {
          dayNumber: dayIndex + 1,
          ...combineDayPlan(dayName, resistancePlan, conditioningPlan, inputs),
        };
      });

      weeks.push({
        weekNumber,
        title: `Week ${weekNumber}`,
        summary: Number.isFinite(weekTargetsKm[weekIndex])
          ? `${inputs.primaryPhase} | ${formatNumber(weekTargetsKm[weekIndex], 1)} km conditioning target`
          : `${inputs.primaryPhase} | ${inputs.resistanceDaysPerWeek} resistance + ${inputs.conditioningDaysPerWeek} conditioning`,
        days,
      });
    }
    return {
      weeks,
      weekTargetsKm,
    };
  }

  function buildDynamicTrainingPackage(profile, options = {}) {
    const inputs = buildDynamicInputs(profile, options);
    if (!inputs.athleteType) {
      return null;
    }

    const paceSnapshot = buildPaceSnapshot(inputs.recent5kTimeMin);
    const previewSummary = buildDynamicProgramSummary(inputs, Array.from({ length: 8 }, (_, index) => buildDynamicWeekTargetKm(inputs, index)), paceSnapshot);
    const weekBuild = buildDynamicWeeks(inputs, previewSummary, paceSnapshot);
    const dynamicChecks = buildDynamicChecks(inputs, weekBuild.weekTargetsKm);
    const readiness = buildReadiness(
      dynamicChecks.checks,
      inputs.sleepHours,
      dynamicChecks.injuryFlag,
      dynamicChecks.primaryLimiter,
      dynamicChecks.coachAction
    );

    const plannedResistanceSessions = weekBuild.weeks.reduce(
      (total, week) => total + week.days.filter((day) => Array.isArray(day.exerciseRows) && day.exerciseRows.some((row) => normalizeText(row.name))).length,
      0
    );
    const plannedConditioningSessions = weekBuild.weeks.reduce(
      (total, week) => total + week.days.filter((day) => normalizeText(day.sessionLabel)).length,
      0
    );

    return {
      kind: inputs.athleteType,
      model: "dynamic_training_v2",
      generatedAt: new Date().toISOString(),
      assessmentDate: inputs.startDate,
      eventDate: inputs.competitionDate,
      athleteType: inputs.athleteTypeLabel,
      coachInputs: inputs,
      outputs: {
        athlete_type: inputs.athleteTypeLabel,
        primary_phase: inputs.primaryPhase,
        primary_event: inputs.primaryEvent,
        weeks_to_event: inputs.weeksToEvent,
        resistance_days: inputs.resistanceDaysPerWeek,
        conditioning_days: inputs.conditioningDaysPerWeek,
        week_1_target_km: weekBuild.weekTargetsKm[0],
        week_8_target_km: weekBuild.weekTargetsKm[7],
      },
      checks: dynamicChecks.checks,
      readiness,
      previewPairs: [
        ...previewSummary.previewPairs,
        ...(readiness.band ? [{ label: "Readiness", value: readiness.band }] : []),
      ],
      summaryCard: [
        ...previewSummary.summaryCard,
        readiness.band ? `Readiness: ${readiness.band} | ${dynamicChecks.coachAction}` : "",
      ].filter(Boolean),
      programSummary: previewSummary,
      reviewFramework: {
        plannedResistanceSessions,
        plannedConditioningSessions,
        weekTargetsKm: weekBuild.weekTargetsKm,
      },
      templateDraft: {
        template: {
          title: `${inputs.athleteTypeLabel} Workbook Block`,
          description: previewSummary.planArchitecture,
          objective: previewSummary.weeklyRunBias,
          audience: `${inputs.athleteTypeLabel} athletes`,
          category: DYNAMIC_CATEGORY_BY_TYPE[inputs.athleteType] || "general",
          difficulty: normalizeTextLower(inputs.experienceLevel || "intermediate") || "intermediate",
          durationWeeks: weekBuild.weeks.length,
          estimatedDurationMinutes: inputs.avgSessionMinutes || "",
          goals: [inputs.primaryEvent, inputs.priorityBias].filter(Boolean),
          equipmentRequired: [],
          tags: [inputs.athleteTypeLabel, inputs.primaryPhase].filter(Boolean),
          notes: `${previewSummary.resistanceGuardrail} ${previewSummary.runGuardrail}`.trim(),
        },
        weeks: weekBuild.weeks,
        days: weekBuild.weeks[0]?.days || [],
      },
      weeks: weekBuild.weeks,
    };
  }

  function youtubeSearchUrl(query) {
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  }

  function isPlaceholderVideoUrl(url) {
    const raw = normalizeText(url);
    if (!raw) {
      return true;
    }

    try {
      const parsed = new URL(raw);
      const hostname = normalizeTextLower(parsed.hostname);
      if (hostname.includes("example.com")) {
        return true;
      }

      if (hostname.includes("youtube.com") && parsed.pathname === "/watch") {
        const videoId = parsed.searchParams.get("v");
        return !/^[A-Za-z0-9_-]{11}$/u.test(videoId || "");
      }

      if (hostname.includes("youtu.be")) {
        const videoId = parsed.pathname.replace(/^\/+/u, "");
        return !/^[A-Za-z0-9_-]{11}$/u.test(videoId || "");
      }
    } catch (_) {
      return true;
    }

    return false;
  }

  function buildFallbackDemo(value) {
    const rawValue = normalizeText(value);
    const haystack = normalizeTextLower(rawValue);
    if (!haystack) {
      return null;
    }

    const match = FALLBACK_DEMOS.find((entry) => entry.keywords.some((keyword) => haystack.includes(keyword)));
    if (!match) {
      return null;
    }

    return {
      url: youtubeSearchUrl(match.query),
      source: "youtube_search_fallback",
      sourceMode: "youtube_search_fallback",
      provider: "youtube",
      title: "Search YouTube for a matching demo",
      label: "Search YouTube",
      note: "We have not uploaded the official LEGACY demo for this movement yet, so this opens a YouTube search for the closest walkthrough.",
      isDirectVideo: false,
      isSearchResult: true,
    };
  }

  function buildGenericExerciseSearchDemo(value) {
    const rawValue = normalizeText(value);
    const haystack = normalizeTextLower(rawValue);
    if (!haystack || haystack.length < 4) {
      return null;
    }

    return {
      url: youtubeSearchUrl(`${rawValue} exercise demo`),
      source: "youtube_search_fallback",
      sourceMode: "youtube_search_fallback",
      provider: "youtube",
      title: `Search YouTube for ${rawValue}`,
      label: "Search YouTube",
      note: "No recent curated demo is linked yet, so this opens a YouTube search for the movement name.",
      isDirectVideo: false,
      isSearchResult: true,
    };
  }

  function resolveExerciseDemo(exercise) {
    const libraryUrl = normalizeText(exercise?.exercise_library?.video_url);
    const customFields = exercise?.exercise_library?.custom_fields || exercise?.exercise_library?.customFields || {};
    if (libraryUrl && !isPlaceholderVideoUrl(libraryUrl)) {
      const provider = normalizeTextLower(customFields.video_provider || "");
      const sourceMode = normalizeTextLower(customFields.demo_source_mode || "");
      const channel = normalizeText(customFields.demo_channel || customFields.resolved_demo_channel || "");
      const publishedAt = normalizeText(customFields.demo_published_at || customFields.resolved_demo_published_at || "");
      const title = normalizeText(customFields.resolved_demo_title || customFields.demo_title || exercise?.exercise_library?.name || "");
      const isYoutube = provider === "youtube" || /youtu(\.be|be\.com|be\.com\/watch)/iu.test(libraryUrl);
      return {
        url: libraryUrl,
        source: sourceMode === "legacy_library" ? "legacy_library" : "exercise_library",
        sourceMode,
        provider: provider || (isYoutube ? "youtube" : ""),
        title,
        channel,
        publishedAt,
        label: isYoutube ? "Watch demo" : "Open video",
        note: normalizeText(customFields.demo_note || ""),
        isDirectVideo: /\.(mp4|mov|webm|m4v)(\?.*)?$/iu.test(libraryUrl),
        isSearchResult: false,
        isYoutube,
      };
    }

    const searchPool = [
      exercise?.name_override,
      exercise?.exercise_library?.name,
      exercise?.metadata?.session_label,
      exercise?.metadata?.exercise_name,
      exercise?.metadata?.session_type,
      exercise?.notes,
    ];

    for (const candidate of searchPool) {
      const fallback = buildFallbackDemo(candidate);
      if (fallback) {
        return fallback;
      }
    }

    const genericCandidate = normalizeText(
      exercise?.name_override
      || exercise?.exercise_library?.name
      || exercise?.metadata?.exercise_name
      || ""
    );
    if (genericCandidate) {
      return buildGenericExerciseSearchDemo(genericCandidate);
    }

    return null;
  }

  function buildRunnerPackage(profile, options) {
    const athleteName = normalizeText(options.athleteName || profile.athleteName || "Runner");
    const assessmentDate = normalizeDateOnly(options.assessmentDate || profile.assessmentDate || options.startDate || "");
    const goalDate = normalizeDateOnly(profile.goalDate || profile.eventDate || "");
    const goalEvent = normalizeText(profile.goalEvent);
    const trainingAge = normalizeTrainingAge(profile.trainingAgeLevel);
    const daysAvailable = normalizeInteger(profile.daysAvailablePerWeek);
    const currentWeeklyKm = normalizeNumber(profile.runnerCurrentWeeklyKm);
    const currentLongRunKm = normalizeNumber(profile.runnerCurrentLongRunKm);
    const latestRaceDistanceKm = normalizeNumber(profile.runnerLatestRaceDistanceKm);
    const latestRaceTimeMin = normalizeNumber(profile.runnerLatestRaceTimeMin);
    const thresholdPace = normalizeNumber(profile.runnerThresholdPaceMinPerKm);
    const restingHr = normalizeInteger(profile.runnerRestingHrBpm);
    const maxHr = normalizeInteger(profile.runnerMaxHrBpm);
    const sleepHours = normalizeNumber(profile.sleepHours);
    const injuryRiskFlag = normalizeYesNo(profile.injuryRiskFlag, "No");
    const plannedWeeklyKm = normalizeNumber(profile.runnerPlannedWeeklyKm);
    const plannedLongRunKm = normalizeNumber(profile.runnerPlannedLongRunKm);
    const plannedHardSessions = normalizeInteger(profile.runnerPlannedHardSessionsPerWeek ?? profile.plannedHardSessionsPerWeek);
    const plannedStrengthSessions = normalizeInteger(profile.runnerPlannedStrengthSessionsPerWeek ?? profile.plannedStrengthSessionsPerWeek);
    const plannedCho = normalizeNumber(profile.runnerPlannedChoGPerKg);
    const plannedProtein = normalizeNumber(profile.runnerPlannedProteinGPerKg);
    const plannedLongRunFuel = normalizeNumber(profile.runnerPlannedLongRunFuelGPerH);
    const plannedFluid = normalizeNumber(profile.runnerPlannedFluidMlPerH);
    const plannedSodium = normalizeNumber(profile.runnerPlannedSodiumMgPerH);

    const daysToEvent = dayDifference(assessmentDate, goalDate);
    const phase = phaseFromDays(daysToEvent);
    const currentPace = latestRaceDistanceKm && latestRaceTimeMin ? roundTo(latestRaceTimeMin / latestRaceDistanceKm, 2) : null;
    const baseRamp =
      trainingAge === "Novice" ? 0.05
      : trainingAge === "Advanced" ? 0.08
      : trainingAge === "Intermediate" ? 0.07
      : null;
    const safeRampPct = Number.isFinite(baseRamp)
      ? roundTo(Math.max(0, baseRamp + (Number.isFinite(sleepHours) && sleepHours < 7 ? -0.02 : 0) + (injuryRiskFlag === "Yes" ? -0.02 : 0)), 2)
      : null;
    const suggestedNextWeekKm = Number.isFinite(currentWeeklyKm) && Number.isFinite(safeRampPct)
      ? roundTo(currentWeeklyKm * (1 + safeRampPct), 1)
      : null;

    const goalFactor =
      goalEvent === "5K" ? 0.22
      : goalEvent === "10K" ? 0.25
      : goalEvent === "Half Marathon" ? 0.3
      : goalEvent === "Marathon" ? 0.32
      : goalEvent ? 0.28
      : null;
    const recommendedLongRunKm = Number.isFinite(suggestedNextWeekKm) && Number.isFinite(goalFactor)
      ? roundTo(suggestedNextWeekKm * goalFactor, 1)
      : null;
    const recommendedHardSessions = Number.isFinite(daysAvailable) ? (daysAvailable <= 3 ? 1 : 2) : null;
    const recommendedStrengthSessions = Number.isFinite(daysAvailable) ? (daysAvailable <= 3 ? 1 : 2) : null;
    const easyHrLow = Number.isFinite(restingHr) && Number.isFinite(maxHr) ? roundTo(restingHr + 0.6 * (maxHr - restingHr), 0) : null;
    const easyHrHigh = Number.isFinite(restingHr) && Number.isFinite(maxHr) ? roundTo(restingHr + 0.75 * (maxHr - restingHr), 0) : null;
    const thresholdHr = Number.isFinite(restingHr) && Number.isFinite(maxHr) ? roundTo(restingHr + 0.85 * (maxHr - restingHr), 0) : null;
    const choMin =
      !Number.isFinite(currentWeeklyKm) ? null
      : currentWeeklyKm < 30 ? 4
      : currentWeeklyKm < 60 ? 5
      : currentWeeklyKm < 90 ? 6
      : 7;
    const choMax =
      !Number.isFinite(currentWeeklyKm) ? null
      : currentWeeklyKm < 30 ? 5
      : currentWeeklyKm < 60 ? 7
      : currentWeeklyKm < 90 ? 8
      : 10;
    const proteinMin = 1.4;
    const proteinMax = 2;
    const longRunDurationMin = Number.isFinite(plannedLongRunKm) && Number.isFinite(currentPace)
      ? roundTo(plannedLongRunKm * currentPace, 0)
      : null;
    const longRunFuelMin =
      !Number.isFinite(longRunDurationMin) ? null
      : longRunDurationMin < 60 ? 0
      : longRunDurationMin < 150 ? 30
      : 60;
    const longRunFuelMax =
      !Number.isFinite(longRunDurationMin) ? null
      : longRunDurationMin < 60 ? 0
      : longRunDurationMin < 150 ? 60
      : 90;
    const fluidRange = !Number.isFinite(longRunDurationMin) ? "" : longRunDurationMin < 60 ? "0-0" : "400-800";
    const sodiumRange =
      !Number.isFinite(longRunDurationMin) ? ""
      : longRunDurationMin < 60 ? "0-0"
      : longRunDurationMin < 150 ? "300-600"
      : "400-800";

    const checks = [
      createCheck(
        "runner_planned_weekly_km",
        "Planned weekly volume",
        Number.isFinite(plannedWeeklyKm)
          ? Number.isFinite(currentWeeklyKm) && Number.isFinite(suggestedNextWeekKm) && plannedWeeklyKm >= currentWeeklyKm * 0.95 && plannedWeeklyKm <= suggestedNextWeekKm
            ? "ON COURSE"
            : "OFF COURSE"
          : "",
        plannedWeeklyKm,
        Number.isFinite(currentWeeklyKm) && Number.isFinite(suggestedNextWeekKm) ? `${formatNumber(currentWeeklyKm * 0.95)}-${formatNumber(suggestedNextWeekKm)} km` : ""
      ),
      createCheck(
        "runner_planned_long_run_km",
        "Planned long run",
        Number.isFinite(plannedLongRunKm)
          ? Number.isFinite(plannedWeeklyKm) && plannedLongRunKm <= plannedWeeklyKm * 0.35 && plannedLongRunKm >= plannedWeeklyKm * 0.2
            ? "ON COURSE"
            : "OFF COURSE"
          : "",
        plannedLongRunKm,
        Number.isFinite(plannedWeeklyKm) ? `${formatNumber(plannedWeeklyKm * 0.2)}-${formatNumber(plannedWeeklyKm * 0.35)} km` : ""
      ),
      createCheck(
        "runner_planned_hard_sessions_wk",
        "Hard sessions",
        Number.isFinite(plannedHardSessions)
          ? Number.isFinite(recommendedHardSessions) && plannedHardSessions <= recommendedHardSessions
            ? "ON COURSE"
            : "OFF COURSE"
          : "",
        plannedHardSessions,
        Number.isFinite(recommendedHardSessions) ? `<= ${recommendedHardSessions}` : ""
      ),
      createCheck(
        "runner_planned_strength_sessions_wk",
        "Strength sessions",
        Number.isFinite(plannedStrengthSessions)
          ? Number.isFinite(recommendedStrengthSessions) && plannedStrengthSessions >= recommendedStrengthSessions
            ? "ON COURSE"
            : "OFF COURSE"
          : "",
        plannedStrengthSessions,
        Number.isFinite(recommendedStrengthSessions) ? `>= ${recommendedStrengthSessions}` : ""
      ),
      createCheck(
        "runner_planned_cho_g_per_kg",
        "Daily CHO",
        Number.isFinite(plannedCho)
          ? Number.isFinite(choMin) && Number.isFinite(choMax) && plannedCho >= choMin && plannedCho <= choMax
            ? "ON COURSE"
            : "OFF COURSE"
          : "",
        plannedCho,
        Number.isFinite(choMin) && Number.isFinite(choMax) ? `${formatNumber(choMin)}-${formatNumber(choMax)} g/kg` : ""
      ),
      createCheck(
        "runner_planned_protein_g_per_kg",
        "Daily protein",
        Number.isFinite(plannedProtein)
          ? plannedProtein >= proteinMin && plannedProtein <= proteinMax
            ? "ON COURSE"
            : "OFF COURSE"
          : "",
        plannedProtein,
        `${formatNumber(proteinMin)}-${formatNumber(proteinMax)} g/kg`
      ),
      createCheck(
        "runner_planned_long_run_fuel_g_per_h",
        "Long-run fuel",
        Number.isFinite(plannedLongRunFuel)
          ? Number.isFinite(longRunFuelMin) && Number.isFinite(longRunFuelMax) && plannedLongRunFuel >= longRunFuelMin && plannedLongRunFuel <= longRunFuelMax
            ? "ON COURSE"
            : "OFF COURSE"
          : "",
        plannedLongRunFuel,
        Number.isFinite(longRunFuelMin) && Number.isFinite(longRunFuelMax) ? `${formatNumber(longRunFuelMin, 0)}-${formatNumber(longRunFuelMax, 0)} g/h` : ""
      ),
      createCheck(
        "runner_planned_fluid_ml_per_h",
        "Fluid plan",
        Number.isFinite(plannedFluid)
          ? !Number.isFinite(longRunDurationMin) || longRunDurationMin < 60 || (plannedFluid >= 400 && plannedFluid <= 800)
            ? "ON COURSE"
            : "OFF COURSE"
          : "",
        plannedFluid,
        fluidRange ? `${fluidRange} mL/h` : ""
      ),
      createCheck(
        "runner_planned_sodium_mg_per_h",
        "Sodium plan",
        Number.isFinite(plannedSodium)
          ? !Number.isFinite(longRunDurationMin) || longRunDurationMin < 60 || (longRunDurationMin < 150 ? plannedSodium >= 300 && plannedSodium <= 600 : plannedSodium >= 400 && plannedSodium <= 800)
            ? "ON COURSE"
            : "OFF COURSE"
          : "",
        plannedSodium,
        sodiumRange ? `${sodiumRange} mg/h` : ""
      ),
    ];

    const primaryLimiter =
      injuryRiskFlag === "Yes" ? "Injury risk"
      : Number.isFinite(sleepHours) && sleepHours < 7 ? "Sleep / recovery"
      : checks[0].status === "OFF COURSE" ? "Volume ramp"
      : checks[1].status === "OFF COURSE" ? "Long-run size"
      : checks[2].status === "OFF COURSE" ? "Hard-session count"
      : checks[3].status === "OFF COURSE" ? "Strength support"
      : checks[4].status === "OFF COURSE" ? "Daily CHO"
      : checks[5].status === "OFF COURSE" ? "Daily protein"
      : checks[6].status === "OFF COURSE" ? "Long-run fuel"
      : checks[7].status === "OFF COURSE" ? "Fluid plan"
      : checks[8].status === "OFF COURSE" ? "Sodium plan"
      : "No major limiter";

    const coachNextStep =
      checks[0].status === "OFF COURSE" || checks[1].status === "OFF COURSE" || checks[4].status === "OFF COURSE" || checks[5].status === "OFF COURSE" || (Number.isFinite(sleepHours) && sleepHours < 7) || injuryRiskFlag === "Yes"
        ? "Hold or deload 5-10%; fix recovery/risk first"
        : checks[6].status === "OFF COURSE" || checks[7].status === "OFF COURSE" || checks[8].status === "OFF COURSE"
          ? "Fix fueling/hydration before adding load"
          : "Progress only to suggested km and keep quality at 1-2 days";

    const readiness = buildReadiness(checks, sleepHours, injuryRiskFlag, primaryLimiter, coachNextStep);
    const outputs = {
      runner_days_to_event: daysToEvent,
      runner_phase: phase,
      runner_current_pace_min_per_km: currentPace,
      runner_safe_volume_ramp_pct: safeRampPct,
      runner_suggested_next_week_km: suggestedNextWeekKm,
      runner_recommended_long_run_km: recommendedLongRunKm,
      runner_recommended_hard_sessions_wk: recommendedHardSessions,
      runner_recommended_strength_sessions_wk: recommendedStrengthSessions,
      runner_easy_hr_low_bpm: easyHrLow,
      runner_easy_hr_high_bpm: easyHrHigh,
      runner_threshold_hr_bpm: thresholdHr,
      runner_cho_target_min_g_per_kg: choMin,
      runner_cho_target_max_g_per_kg: choMax,
      runner_protein_target_min_g_per_kg: proteinMin,
      runner_protein_target_max_g_per_kg: proteinMax,
      runner_long_run_duration_est_min: longRunDurationMin,
      runner_long_run_fuel_min_g_per_h: longRunFuelMin,
      runner_long_run_fuel_max_g_per_h: longRunFuelMax,
      runner_fluid_range_ml_per_h: fluidRange,
      runner_sodium_range_mg_per_h: sodiumRange,
      runner_coach_next_step: coachNextStep,
    };

    return {
      kind: "runner",
      generatedAt: new Date().toISOString(),
      assessmentDate,
      eventDate: goalDate,
      outputs,
      checks,
      readiness,
      summaryCard: readiness.score === null
        ? []
        : [
            `${athleteName} | ${phase} phase | ${formatNumber(daysToEvent, 0)} days to goal`,
            `Next week target: ${formatNumber(suggestedNextWeekKm)} km | Long run: ${formatNumber(recommendedLongRunKm)} km`,
            `Structure: ${formatNumber(recommendedHardSessions, 0)} hard session(s) + ${formatNumber(recommendedStrengthSessions, 0)} strength session(s)`,
            `Nutrition: ${formatNumber(choMin)}-${formatNumber(choMax)} g/kg CHO | ${formatNumber(proteinMin)}-${formatNumber(proteinMax)} g/kg protein`,
            `Long run fuel: ${formatNumber(longRunFuelMin, 0)}-${formatNumber(longRunFuelMax, 0)} g/h | ${fluidRange} mL/h | ${sodiumRange} mg/h sodium`,
            `Coach cue: ${coachNextStep}`,
          ],
    };
  }

  function buildHyroxPackage(profile, options) {
    const athleteName = normalizeText(options.athleteName || profile.athleteName || "HYROX athlete");
    const assessmentDate = normalizeDateOnly(options.assessmentDate || profile.assessmentDate || options.startDate || "");
    const eventDate = normalizeDateOnly(profile.goalDate || profile.eventDate || "");
    const trainingAge = normalizeTrainingAge(profile.trainingAgeLevel);
    const daysAvailable = normalizeInteger(profile.daysAvailablePerWeek);
    const currentRunKm = normalizeNumber(profile.hyroxCurrentRunKm);
    const recent5kTimeMin = normalizeNumber(profile.hyroxRecent5kTimeMin);
    const predictedRaceDurationMin = normalizeNumber(profile.hyroxPredictedRaceDurationMin);
    const vo2max = normalizeNumber(profile.hyroxVo2maxMlPerKgMin);
    const weakestAreaRaw = normalizeText(profile.hyroxWeakestArea);
    const weakestArea = weakestAreaRaw || "Mixed";
    const wallBallReps = normalizeInteger(profile.hyroxWallBallUnbrokenReps);
    const sledTolerance = normalizeInteger(profile.hyroxSledToleranceScore);
    const sleepHours = normalizeNumber(profile.sleepHours);
    const injuryRiskFlag = normalizeYesNo(profile.injuryRiskFlag, "No");
    const plannedRunKm = normalizeNumber(profile.hyroxPlannedRunKm);
    const plannedHybridSessions = normalizeInteger(profile.hyroxPlannedHybridSessionsPerWeek ?? profile.plannedHardSessionsPerWeek);
    const plannedStrengthSessions = normalizeInteger(profile.hyroxPlannedStrengthSessionsPerWeek ?? profile.plannedStrengthSessionsPerWeek);
    const plannedCho = normalizeNumber(profile.hyroxPlannedChoGPerKg);
    const plannedProtein = normalizeNumber(profile.hyroxPlannedProteinGPerKg);
    const plannedRaceFuel = normalizeNumber(profile.hyroxPlannedRaceFuelGPerH);
    const plannedFluid = normalizeNumber(profile.hyroxPlannedFluidMlPerH);
    const plannedSodium = normalizeNumber(profile.hyroxPlannedSodiumMgPerH);

    const daysToEvent = dayDifference(assessmentDate, eventDate);
    const phase = phaseFromDays(daysToEvent);
    const pace5k = Number.isFinite(recent5kTimeMin) ? roundTo(recent5kTimeMin / 5, 2) : null;
    const baseRamp =
      trainingAge === "Novice" ? 0.05
      : trainingAge === "Advanced" ? 0.07
      : trainingAge === "Intermediate" ? 0.06
      : null;
    const safeRunRampPct = Number.isFinite(baseRamp)
      ? roundTo(Math.max(0, baseRamp + (Number.isFinite(sleepHours) && sleepHours < 7 ? -0.01 : 0) + (injuryRiskFlag === "Yes" ? -0.02 : 0)), 2)
      : null;
    const suggestedNextWeekRunKm = Number.isFinite(currentRunKm) && Number.isFinite(safeRunRampPct)
      ? roundTo(currentRunKm * (1 + safeRunRampPct), 1)
      : null;
    const recommendedHybridSessions = Number.isFinite(daysAvailable) ? (daysAvailable <= 4 ? 1 : 2) : null;
    const recommendedStrengthSessions = Number.isFinite(daysAvailable) ? (daysAvailable <= 4 ? 1 : 2) : null;
    const recommendedSimulationDose = Number.isFinite(daysAvailable) ? (daysAvailable < 4 ? 0 : 1) : null;
    const choMin =
      !Number.isFinite(currentRunKm) ? null
      : currentRunKm < 20 ? 4
      : currentRunKm < 35 ? 5
      : currentRunKm < 50 ? 5.5
      : 6;
    const choMax =
      !Number.isFinite(currentRunKm) ? null
      : currentRunKm < 20 ? 5
      : currentRunKm < 35 ? 6
      : currentRunKm < 50 ? 7
      : 8;
    const proteinMin = 1.4;
    const proteinMax = 2;
    const raceFuelMin =
      !Number.isFinite(predictedRaceDurationMin) ? null
      : predictedRaceDurationMin < 60 ? 0
      : predictedRaceDurationMin < 90 ? 30
      : predictedRaceDurationMin < 120 ? 45
      : 60;
    const raceFuelMax =
      !Number.isFinite(predictedRaceDurationMin) ? null
      : predictedRaceDurationMin < 60 ? 30
      : predictedRaceDurationMin < 90 ? 45
      : predictedRaceDurationMin < 120 ? 60
      : 75;
    const sequencingRule = "If combined same day: strength first or separate by >3 h";
    const normalizedWeakness = normalizeTextLower(weakestArea);
    const keyEmphasis =
      normalizedWeakness === "running" ? "Raise aerobic base + threshold + running economy"
      : normalizedWeakness === "sleds" ? "Bias max strength + force under fatigue"
      : normalizedWeakness === "wall balls" ? "Bias local muscular endurance + squat stamina"
      : normalizedWeakness === "carry/lunges" ? "Bias trunk stiffness + unilateral endurance"
      : "Use 1 simulation + 1 engine + 2 strength days";

    const checks = [
      createCheck(
        "hyrox_planned_run_km",
        "Planned run volume",
        Number.isFinite(plannedRunKm)
          ? Number.isFinite(currentRunKm) && Number.isFinite(suggestedNextWeekRunKm) && plannedRunKm >= currentRunKm * 0.95 && plannedRunKm <= suggestedNextWeekRunKm
            ? "ON COURSE"
            : "OFF COURSE"
          : "",
        plannedRunKm,
        Number.isFinite(currentRunKm) && Number.isFinite(suggestedNextWeekRunKm) ? `${formatNumber(currentRunKm * 0.95)}-${formatNumber(suggestedNextWeekRunKm)} km` : ""
      ),
      createCheck(
        "hyrox_planned_hybrid_sessions_wk",
        "Hybrid sessions",
        Number.isFinite(plannedHybridSessions)
          ? Number.isFinite(recommendedHybridSessions) && plannedHybridSessions <= recommendedHybridSessions
            ? "ON COURSE"
            : "OFF COURSE"
          : "",
        plannedHybridSessions,
        Number.isFinite(recommendedHybridSessions) ? `<= ${recommendedHybridSessions}` : ""
      ),
      createCheck(
        "hyrox_planned_strength_sessions_wk",
        "Strength sessions",
        Number.isFinite(plannedStrengthSessions)
          ? Number.isFinite(recommendedStrengthSessions) && plannedStrengthSessions >= recommendedStrengthSessions
            ? "ON COURSE"
            : "OFF COURSE"
          : "",
        plannedStrengthSessions,
        Number.isFinite(recommendedStrengthSessions) ? `>= ${recommendedStrengthSessions}` : ""
      ),
      createCheck(
        "hyrox_planned_cho_g_per_kg",
        "Daily CHO",
        Number.isFinite(plannedCho)
          ? Number.isFinite(choMin) && Number.isFinite(choMax) && plannedCho >= choMin && plannedCho <= choMax
            ? "ON COURSE"
            : "OFF COURSE"
          : "",
        plannedCho,
        Number.isFinite(choMin) && Number.isFinite(choMax) ? `${formatNumber(choMin)}-${formatNumber(choMax)} g/kg` : ""
      ),
      createCheck(
        "hyrox_planned_protein_g_per_kg",
        "Daily protein",
        Number.isFinite(plannedProtein)
          ? plannedProtein >= proteinMin && plannedProtein <= proteinMax
            ? "ON COURSE"
            : "OFF COURSE"
          : "",
        plannedProtein,
        `${formatNumber(proteinMin)}-${formatNumber(proteinMax)} g/kg`
      ),
      createCheck(
        "hyrox_planned_race_fuel_g_per_h",
        "Race fuel",
        Number.isFinite(plannedRaceFuel)
          ? Number.isFinite(raceFuelMin) && Number.isFinite(raceFuelMax) && plannedRaceFuel >= raceFuelMin && plannedRaceFuel <= raceFuelMax
            ? "ON COURSE"
            : "OFF COURSE"
          : "",
        plannedRaceFuel,
        Number.isFinite(raceFuelMin) && Number.isFinite(raceFuelMax) ? `${formatNumber(raceFuelMin, 0)}-${formatNumber(raceFuelMax, 0)} g/h` : ""
      ),
      createCheck(
        "hyrox_planned_fluid_ml_per_h",
        "Fluid plan",
        Number.isFinite(plannedFluid)
          ? plannedFluid >= 400 && plannedFluid <= 900
            ? "ON COURSE"
            : "OFF COURSE"
          : "",
        plannedFluid,
        "400-900 mL/h"
      ),
      createCheck(
        "hyrox_planned_sodium_mg_per_h",
        "Sodium plan",
        Number.isFinite(plannedSodium)
          ? plannedSodium >= 300 && plannedSodium <= 900
            ? "ON COURSE"
            : "OFF COURSE"
          : "",
        plannedSodium,
        "300-900 mg/h"
      ),
    ];

    const runVolumeOff = checks[0].status === "OFF COURSE";
    const hybridOff = checks[1].status === "OFF COURSE";
    const strengthOff = checks[2].status === "OFF COURSE";
    const choOff = checks[3].status === "OFF COURSE";
    const proteinOff = checks[4].status === "OFF COURSE";
    const raceFuelOff = checks[5].status === "OFF COURSE";
    const fluidOff = checks[6].status === "OFF COURSE";
    const sodiumOff = checks[7].status === "OFF COURSE";
    const coachNextStep =
      runVolumeOff || hybridOff || strengthOff || choOff || (Number.isFinite(sleepHours) && sleepHours < 7) || injuryRiskFlag === "Yes"
        ? "Hold run km, keep 1-2 quality pieces, and clean up recovery"
        : "Keep engine first, then specificity, then station density";

    const primaryLimiter =
      injuryRiskFlag === "Yes" ? "Injury risk"
      : Number.isFinite(sleepHours) && sleepHours < 7 ? "Sleep / recovery"
      : runVolumeOff ? "Run volume"
      : hybridOff ? "Hybrid-session count"
      : strengthOff ? "Strength support"
      : choOff ? "Daily CHO"
      : proteinOff ? "Daily protein"
      : raceFuelOff ? "Race fuel"
      : fluidOff ? "Fluid plan"
      : sodiumOff ? "Sodium plan"
      : "No major limiter";

    const readiness = buildReadiness(checks, sleepHours, injuryRiskFlag, primaryLimiter, coachNextStep);
    const outputs = {
      hyrox_days_to_event: daysToEvent,
      hyrox_phase: phase,
      hyrox_5k_pace_min_per_km: pace5k,
      hyrox_safe_run_ramp_pct: safeRunRampPct,
      hyrox_suggested_next_week_run_km: suggestedNextWeekRunKm,
      hyrox_recommended_hybrid_sessions_wk: recommendedHybridSessions,
      hyrox_recommended_strength_sessions_wk: recommendedStrengthSessions,
      hyrox_recommended_simulation_sessions: recommendedSimulationDose,
      hyrox_cho_target_min_g_per_kg: choMin,
      hyrox_cho_target_max_g_per_kg: choMax,
      hyrox_protein_target_min_g_per_kg: proteinMin,
      hyrox_protein_target_max_g_per_kg: proteinMax,
      hyrox_race_fuel_min_g_per_h: raceFuelMin,
      hyrox_race_fuel_max_g_per_h: raceFuelMax,
      hyrox_strength_day_sequencing: sequencingRule,
      hyrox_key_emphasis: keyEmphasis,
      hyrox_coach_next_step: coachNextStep,
    };

    return {
      kind: "hyrox",
      generatedAt: new Date().toISOString(),
      assessmentDate,
      eventDate,
      outputs,
      checks,
      readiness,
      summaryCard: readiness.score === null
        ? []
        : [
            `${athleteName} | ${phase} phase | ${formatNumber(daysToEvent, 0)} days to race`,
            `Next week run: ${formatNumber(suggestedNextWeekRunKm)} km | Hybrid: ${formatNumber(recommendedHybridSessions, 0)} | Strength: ${formatNumber(recommendedStrengthSessions, 0)}`,
            `Specificity: simulation dose ${formatNumber(recommendedSimulationDose, 0)} | Key emphasis: ${keyEmphasis}`,
            `Nutrition: ${formatNumber(choMin)}-${formatNumber(choMax)} g/kg CHO | ${formatNumber(proteinMin)}-${formatNumber(proteinMax)} g/kg protein`,
            `Race plan: ${formatNumber(raceFuelMin, 0)}-${formatNumber(raceFuelMax, 0)} g/h CHO | ${formatNumber(plannedFluid, 0) || "Not set"} mL/h | ${formatNumber(plannedSodium, 0) || "Not set"} mg/h sodium`,
            `Coach cue: ${coachNextStep}`,
          ],
      detailContext: {
        division: normalizeText(profile.goalEvent || profile.hyroxDivision),
        vo2max,
        weakestArea,
        wallBallReps,
        sledTolerance,
      },
    };
  }

  function buildEndurancePackage(profile, options) {
    const athleteName = normalizeText(options.athleteName || profile.athleteName || "Endurance athlete");
    const assessmentDate = normalizeDateOnly(options.assessmentDate || profile.assessmentDate || options.startDate || "");
    const eventDate = normalizeDateOnly(profile.goalDate || profile.eventDate || "");
    const primarySport = normalizeText(profile.primarySport);
    const eventDurationHours = normalizeNumber(profile.enduranceEventDurationHours);
    const trainingAge = normalizeTrainingAge(profile.trainingAgeLevel);
    const daysAvailable = normalizeInteger(profile.daysAvailablePerWeek);
    const currentWeeklyHours = normalizeNumber(profile.enduranceCurrentWeeklyHours ?? profile.currentWeeklyHours);
    const currentLongestSessionHours = normalizeNumber(profile.enduranceCurrentLongestSessionHours ?? profile.currentLongestSessionHours);
    const restingHr = normalizeInteger(profile.enduranceRestingHrBpm);
    const maxHr = normalizeInteger(profile.enduranceMaxHrBpm);
    const thresholdHr = normalizeInteger(profile.enduranceThresholdHrBpm);
    const sleepHours = normalizeNumber(profile.sleepHours);
    const hotConditionsFlag = normalizeYesNo(profile.enduranceHotConditionsFlag, "No");
    const injuryRiskFlag = normalizeYesNo(profile.injuryRiskFlag, "No");
    const plannedWeeklyHours = normalizeNumber(profile.endurancePlannedWeeklyHours ?? profile.plannedWeeklyHours);
    const plannedLongSessionHours = normalizeNumber(profile.endurancePlannedLongSessionHours ?? profile.plannedLongSessionHours);
    const plannedHardSessions = normalizeInteger(profile.endurancePlannedHardSessionsPerWeek ?? profile.plannedHardSessionsPerWeek);
    const plannedStrengthSessions = normalizeInteger(profile.endurancePlannedStrengthSessionsPerWeek ?? profile.plannedStrengthSessionsPerWeek);
    const plannedCho = normalizeNumber(profile.endurancePlannedChoGPerKg);
    const plannedProtein = normalizeNumber(profile.endurancePlannedProteinGPerKg);
    const plannedEventFuel = normalizeNumber(profile.endurancePlannedEventFuelGPerH);
    const plannedFluid = normalizeNumber(profile.endurancePlannedFluidMlPerH);
    const plannedSodium = normalizeNumber(profile.endurancePlannedSodiumMgPerH);

    const daysToEvent = dayDifference(assessmentDate, eventDate);
    const phase = phaseFromDays(daysToEvent);
    const baseRamp =
      trainingAge === "Novice" ? 0.05
      : trainingAge === "Advanced" ? 0.08
      : trainingAge === "Intermediate" ? 0.07
      : null;
    const safeRampPct = Number.isFinite(baseRamp)
      ? roundTo(Math.max(0, baseRamp + (Number.isFinite(sleepHours) && sleepHours < 7 ? -0.02 : 0) + (injuryRiskFlag === "Yes" ? -0.02 : 0)), 2)
      : null;
    const suggestedNextWeekHours = Number.isFinite(currentWeeklyHours) && Number.isFinite(safeRampPct)
      ? roundTo(currentWeeklyHours * (1 + safeRampPct), 1)
      : null;
    const longSessionFactor =
      !Number.isFinite(eventDurationHours) ? null
      : eventDurationHours < 3 ? 0.25
      : eventDurationHours < 6 ? 0.3
      : 0.35;
    const recommendedLongSessionHours = Number.isFinite(suggestedNextWeekHours) && Number.isFinite(longSessionFactor)
      ? roundTo(suggestedNextWeekHours * longSessionFactor, 1)
      : null;
    const tidModel = trainingAge === "Advanced" ? "POLARIZED" : trainingAge ? "PYRAMIDAL" : "";
    const litShare = !tidModel ? null : tidModel === "POLARIZED" ? 0.8 : 0.75;
    const mitShare = !tidModel ? null : tidModel === "POLARIZED" ? 0.05 : 0.15;
    const hitShare = !tidModel ? null : tidModel === "POLARIZED" ? 0.15 : 0.1;
    const recommendedHardSessions = Number.isFinite(daysAvailable) ? (daysAvailable <= 3 ? 1 : 2) : null;
    const recommendedStrengthSessions = phase ? (phase === "TAPER" ? 1 : 2) : null;
    const choMin =
      !Number.isFinite(currentWeeklyHours) ? null
      : currentWeeklyHours < 7 ? 4
      : currentWeeklyHours < 12 ? 5
      : currentWeeklyHours < 18 ? 6
      : 8;
    const choMax =
      !Number.isFinite(currentWeeklyHours) ? null
      : currentWeeklyHours < 7 ? 6
      : currentWeeklyHours < 12 ? 7
      : currentWeeklyHours < 18 ? 8
      : 10;
    const proteinMin = 1.4;
    const proteinMax = 2;
    const eventFuelMin =
      !Number.isFinite(eventDurationHours) ? null
      : eventDurationHours < 1 ? 0
      : eventDurationHours < 2.5 ? 30
      : 60;
    const eventFuelMax =
      !Number.isFinite(eventDurationHours) ? null
      : eventDurationHours < 1 ? 30
      : eventDurationHours < 2.5 ? 60
      : 90;
    const fluidRange = hotConditionsFlag === "Yes" ? "500-1000" : eventDurationHours !== null ? "400-800" : "";
    const sodiumRange = hotConditionsFlag === "Yes" || (Number.isFinite(eventDurationHours) && eventDurationHours >= 3) ? "500-1000" : eventDurationHours !== null ? "300-800" : "";
    const sequencingRule = "If combining: strength first or separate by >3 h";

    const checks = [
      createCheck(
        "endurance_planned_weekly_hours",
        "Planned weekly hours",
        Number.isFinite(plannedWeeklyHours)
          ? Number.isFinite(currentWeeklyHours) && Number.isFinite(suggestedNextWeekHours) && plannedWeeklyHours >= currentWeeklyHours * 0.95 && plannedWeeklyHours <= suggestedNextWeekHours
            ? "ON COURSE"
            : "OFF COURSE"
          : "",
        plannedWeeklyHours,
        Number.isFinite(currentWeeklyHours) && Number.isFinite(suggestedNextWeekHours) ? `${formatNumber(currentWeeklyHours * 0.95)}-${formatNumber(suggestedNextWeekHours)} h` : ""
      ),
      createCheck(
        "endurance_planned_long_session_h",
        "Planned long session",
        Number.isFinite(plannedLongSessionHours)
          ? Number.isFinite(plannedWeeklyHours) && plannedLongSessionHours <= plannedWeeklyHours * 0.4 && plannedLongSessionHours >= plannedWeeklyHours * 0.2
            ? "ON COURSE"
            : "OFF COURSE"
          : "",
        plannedLongSessionHours,
        Number.isFinite(plannedWeeklyHours) ? `${formatNumber(plannedWeeklyHours * 0.2)}-${formatNumber(plannedWeeklyHours * 0.4)} h` : ""
      ),
      createCheck(
        "endurance_planned_hard_sessions_wk",
        "Hard sessions",
        Number.isFinite(plannedHardSessions)
          ? Number.isFinite(recommendedHardSessions) && plannedHardSessions <= recommendedHardSessions
            ? "ON COURSE"
            : "OFF COURSE"
          : "",
        plannedHardSessions,
        Number.isFinite(recommendedHardSessions) ? `<= ${recommendedHardSessions}` : ""
      ),
      createCheck(
        "endurance_planned_strength_sessions_wk",
        "Strength sessions",
        Number.isFinite(plannedStrengthSessions)
          ? Number.isFinite(recommendedStrengthSessions) && plannedStrengthSessions >= recommendedStrengthSessions
            ? "ON COURSE"
            : "OFF COURSE"
          : "",
        plannedStrengthSessions,
        Number.isFinite(recommendedStrengthSessions) ? `>= ${recommendedStrengthSessions}` : ""
      ),
      createCheck(
        "endurance_planned_cho_g_per_kg",
        "Daily CHO",
        Number.isFinite(plannedCho)
          ? Number.isFinite(choMin) && Number.isFinite(choMax) && plannedCho >= choMin && plannedCho <= choMax
            ? "ON COURSE"
            : "OFF COURSE"
          : "",
        plannedCho,
        Number.isFinite(choMin) && Number.isFinite(choMax) ? `${formatNumber(choMin)}-${formatNumber(choMax)} g/kg` : ""
      ),
      createCheck(
        "endurance_planned_protein_g_per_kg",
        "Daily protein",
        Number.isFinite(plannedProtein)
          ? plannedProtein >= proteinMin && plannedProtein <= proteinMax
            ? "ON COURSE"
            : "OFF COURSE"
          : "",
        plannedProtein,
        `${formatNumber(proteinMin)}-${formatNumber(proteinMax)} g/kg`
      ),
      createCheck(
        "endurance_planned_event_fuel_g_per_h",
        "Event fuel",
        Number.isFinite(plannedEventFuel)
          ? Number.isFinite(eventFuelMin) && Number.isFinite(eventFuelMax) && plannedEventFuel >= eventFuelMin && plannedEventFuel <= eventFuelMax
            ? "ON COURSE"
            : "OFF COURSE"
          : "",
        plannedEventFuel,
        Number.isFinite(eventFuelMin) && Number.isFinite(eventFuelMax) ? `${formatNumber(eventFuelMin, 0)}-${formatNumber(eventFuelMax, 0)} g/h` : ""
      ),
      createCheck(
        "endurance_planned_fluid_ml_per_h",
        "Fluid plan",
        Number.isFinite(plannedFluid)
          ? (
              hotConditionsFlag === "Yes"
                ? plannedFluid >= 500 && plannedFluid <= 1000
                : plannedFluid >= 400 && plannedFluid <= 800
            )
            ? "ON COURSE"
            : "OFF COURSE"
          : "",
        plannedFluid,
        fluidRange ? `${fluidRange} mL/h` : ""
      ),
      createCheck(
        "endurance_planned_sodium_mg_per_h",
        "Sodium plan",
        Number.isFinite(plannedSodium)
          ? (
              hotConditionsFlag === "Yes" || (Number.isFinite(eventDurationHours) && eventDurationHours >= 3)
                ? plannedSodium >= 500 && plannedSodium <= 1000
                : plannedSodium >= 300 && plannedSodium <= 800
            )
            ? "ON COURSE"
            : "OFF COURSE"
          : "",
        plannedSodium,
        sodiumRange ? `${sodiumRange} mg/h` : ""
      ),
    ];

    const weeklyHoursOff = checks[0].status === "OFF COURSE";
    const longSessionOff = checks[1].status === "OFF COURSE";
    const hardOff = checks[2].status === "OFF COURSE";
    const strengthOff = checks[3].status === "OFF COURSE";
    const choOff = checks[4].status === "OFF COURSE";
    const proteinOff = checks[5].status === "OFF COURSE";
    const fuelOff = checks[6].status === "OFF COURSE";
    const fluidOff = checks[7].status === "OFF COURSE";
    const sodiumOff = checks[8].status === "OFF COURSE";

    const coachNextStep =
      weeklyHoursOff || longSessionOff || hardOff || strengthOff || (Number.isFinite(sleepHours) && sleepHours < 7) || injuryRiskFlag === "Yes"
        ? "Hold or trim hours; prioritize sleep, recovery, and tissue tolerance"
        : "Use the TID model shown; cap hard work at 1-2 sessions";

    const primaryLimiter =
      injuryRiskFlag === "Yes" ? "Injury risk"
      : Number.isFinite(sleepHours) && sleepHours < 7 ? "Sleep / recovery"
      : weeklyHoursOff ? "Weekly hours"
      : longSessionOff ? "Long-session size"
      : hardOff ? "Hard-session count"
      : strengthOff ? "Strength support"
      : choOff ? "Daily CHO"
      : proteinOff ? "Daily protein"
      : fuelOff ? "Event fuel"
      : fluidOff ? "Fluid plan"
      : sodiumOff ? "Sodium plan"
      : "No major limiter";

    const readiness = buildReadiness(checks, sleepHours, injuryRiskFlag, primaryLimiter, coachNextStep);
    const outputs = {
      endurance_days_to_event: daysToEvent,
      endurance_phase: phase,
      endurance_safe_volume_ramp_pct: safeRampPct,
      endurance_suggested_next_week_hours: suggestedNextWeekHours,
      endurance_recommended_long_session_h: recommendedLongSessionHours,
      endurance_tid_model: tidModel,
      endurance_lit_share_pct: litShare,
      endurance_mit_share_pct: mitShare,
      endurance_hit_share_pct: hitShare,
      endurance_recommended_hard_sessions_wk: recommendedHardSessions,
      endurance_recommended_strength_sessions_wk: recommendedStrengthSessions,
      endurance_cho_target_min_g_per_kg: choMin,
      endurance_cho_target_max_g_per_kg: choMax,
      endurance_protein_target_min_g_per_kg: proteinMin,
      endurance_protein_target_max_g_per_kg: proteinMax,
      endurance_event_fuel_min_g_per_h: eventFuelMin,
      endurance_event_fuel_max_g_per_h: eventFuelMax,
      endurance_fluid_target_range_ml_per_h: fluidRange,
      endurance_sodium_target_range_mg_per_h: sodiumRange,
      endurance_sequencing_rule: sequencingRule,
      endurance_coach_next_step: coachNextStep,
      endurance_easy_hr_low_bpm: Number.isFinite(restingHr) && Number.isFinite(maxHr) ? roundTo(restingHr + 0.6 * (maxHr - restingHr), 0) : null,
      endurance_easy_hr_high_bpm: Number.isFinite(restingHr) && Number.isFinite(maxHr) ? roundTo(restingHr + 0.75 * (maxHr - restingHr), 0) : null,
      endurance_threshold_hr_bpm: Number.isFinite(thresholdHr) ? thresholdHr : Number.isFinite(restingHr) && Number.isFinite(maxHr) ? roundTo(restingHr + 0.85 * (maxHr - restingHr), 0) : null,
    };

    return {
      kind: "endurance",
      generatedAt: new Date().toISOString(),
      assessmentDate,
      eventDate,
      outputs,
      checks,
      readiness,
      summaryCard: readiness.score === null
        ? []
        : [
            `${athleteName} | ${phase} phase | ${formatNumber(daysToEvent, 0)} days to event`,
            `Next week: ${formatNumber(suggestedNextWeekHours)} h | Long session: ${formatNumber(recommendedLongSessionHours)} h | TID: ${tidModel}`,
            `Distribution: ${formatNumber((litShare || 0) * 100, 0)}% LIT | ${formatNumber((mitShare || 0) * 100, 0)}% MIT | ${formatNumber((hitShare || 0) * 100, 0)}% HIT`,
            `Nutrition: ${formatNumber(choMin)}-${formatNumber(choMax)} g/kg CHO | ${formatNumber(proteinMin)}-${formatNumber(proteinMax)} g/kg protein`,
            `Event plan: ${formatNumber(eventFuelMin, 0)}-${formatNumber(eventFuelMax, 0)} g/h CHO | ${fluidRange} mL/h | ${sodiumRange} mg/h sodium`,
            `Coach cue: ${coachNextStep}`,
          ],
      detailContext: {
        primarySport,
        currentLongestSessionHours,
      },
    };
  }

  function buildWorkbookPackage(profile, options = {}) {
    const kind = detectAthleteKind(profile);
    if (!kind) {
      return null;
    }
    if (DYNAMIC_WORKBOOK_TYPES.has(kind)) {
      return buildDynamicTrainingPackage(profile, options);
    }
    if (kind === "runner") {
      return buildRunnerPackage(profile, options);
    }
    if (kind === "hyrox") {
      return buildHyroxPackage(profile, options);
    }
    return buildEndurancePackage(profile, options);
  }

  return {
    detectAthleteKind,
    buildWorkbookPackage,
    resolveExerciseDemo,
    isPlaceholderVideoUrl,
  };
});
