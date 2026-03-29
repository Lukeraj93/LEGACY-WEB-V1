import { execSync } from "node:child_process";

const SUPABASE_URL = String(process.env.SUPABASE_URL || "https://ejitroflboctigjubyvm.supabase.co").trim();
const SUPABASE_PUBLISHABLE_KEY = String(
  process.env.SUPABASE_PUBLISHABLE_KEY
    || process.env.SUPABASE_ANON_KEY
    || "sb_publishable_jFgALGmbMm-M_IXWE89-2Q_quLxl0Fe"
).trim();
const APP_BASE_URL = String(process.env.APP_BASE_URL || "https://app.legacycoaching.com.my").replace(/\/+$/u, "");

const QA_COACH_EMAIL = String(process.env.QA_COACH_EMAIL || "qa.coach@legacycoaching.com.my").trim().toLowerCase();
const QA_CLIENT_EMAIL = String(process.env.QA_CLIENT_EMAIL || "qa.client@legacycoaching.com.my").trim().toLowerCase();
const QA_COACH_PASSWORD = String(process.env.QA_COACH_PASSWORD || "").trim();

if (!QA_COACH_PASSWORD) {
  console.error("QA_COACH_PASSWORD is required.");
  process.exit(1);
}

function escapeSql(value) {
  return String(value || "").replaceAll("\\", "\\\\").replaceAll("'", "''");
}

function runDbQuery(query) {
  const encoded = query.replaceAll("\\", "\\\\").replaceAll("\"", "\\\"").replaceAll("\n", " ");
  return execSync(`npx supabase db query --linked --agent=no -o json "${encoded}"`, {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function runSql(query) {
  const raw = runDbQuery(query).trim();
  return raw ? JSON.parse(raw) : [];
}

async function signIn(email, password) {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ email, password }),
  });

  const text = await response.text();
  let payload = {};
  try {
    payload = text ? JSON.parse(text) : {};
  } catch (_) {
    payload = { raw: text };
  }

  if (!response.ok || !payload?.access_token || !payload?.user?.id) {
    throw new Error(payload?.error_description || payload?.msg || payload?.error || `Unable to sign in as ${email}.`);
  }

  return payload;
}

async function authJson(path, token, body) {
  const response = await fetch(`${APP_BASE_URL}${path}`, {
    method: body ? "POST" : "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  let payload = {};
  try {
    payload = text ? JSON.parse(text) : {};
  } catch (_) {
    payload = { raw: text };
  }

  if (!response.ok) {
    throw new Error(payload?.error || payload?.raw || `Request failed for ${path}.`);
  }

  return payload;
}

function buildProgramTemplatePayload() {
  const notesPrefix = "QA seed";
  return {
    template: {
      title: "QA Seed | Foundation Strength + Conditioning",
      objective: "Build a visible training week for QA validation across dashboard, planner, and coaching flows.",
      audience: "General population client testing",
      category: "strength",
      difficulty: "intermediate",
      durationWeeks: 4,
      notes: `${notesPrefix} template for end-to-end planner checks.`,
      status: "draft",
    },
    weeks: Array.from({ length: 4 }, (_, weekIndex) => ({
      weekNumber: weekIndex + 1,
      title: `Week ${weekIndex + 1}`,
      summary: weekIndex === 0 ? "Primary working structure" : "Repeated weekly structure",
      days: [
        {
          dayNumber: 1,
          title: "Lower Strength",
          focus: "Lower body strength",
          dayType: "workout",
          estimatedDurationMinutes: 60,
          notes: "Priority on crisp tempo and leaving one rep in reserve on compound work.",
          exercises: [
            { sortOrder: 0, nameOverride: "Goblet Squat", sets: 4, reps: 8, intensity_mode: "rpe", intensity_value: 7, notes: "Controlled descent." },
            { sortOrder: 1, nameOverride: "Romanian Deadlift", sets: 4, reps: 8, intensity_mode: "rpe", intensity_value: 7, notes: "Feel hamstrings load." },
            { sortOrder: 2, nameOverride: "Walking Lunge", sets: 3, reps: 10, notes: "10 each side." },
          ],
        },
        {
          dayNumber: 3,
          title: "Upper Push + Pull",
          focus: "Upper body strength",
          dayType: "workout",
          estimatedDurationMinutes: 55,
          notes: "Steady effort with clean reps and full control.",
          exercises: [
            { sortOrder: 0, nameOverride: "Push-Up", sets: 4, reps: 10, notes: "Elevate hands if needed to keep quality high." },
            { sortOrder: 1, nameOverride: "One-Arm Dumbbell Row", sets: 4, reps: 10, notes: "10 each side." },
            { sortOrder: 2, nameOverride: "Dumbbell Shoulder Press", sets: 3, reps: 10, intensity_mode: "rpe", intensity_value: 7 },
          ],
        },
        {
          dayNumber: 5,
          title: "Conditioning + Core",
          focus: "Aerobic conditioning",
          dayType: "workout",
          estimatedDurationMinutes: 45,
          notes: "Smooth aerobic effort with enough breathing control to speak in short sentences.",
          exercises: [
            { sortOrder: 0, nameOverride: "Bike Erg", duration_seconds: 900, notes: "15 minutes zone 2 effort." },
            { sortOrder: 1, nameOverride: "Dead Bug", sets: 3, reps: 10, notes: "10 each side." },
            { sortOrder: 2, nameOverride: "Farmer Carry", sets: 4, distance_meters: 30, notes: "30 m each round." },
          ],
        },
      ],
    })),
  };
}

function buildNutritionPayload(clientId, assignmentId) {
  return {
    plan: {
      clientId,
      assignmentId,
      title: "QA Seed | Balanced Fuel Plan",
      strategy: "hybrid",
      caloriesTarget: 2200,
      proteinTargetG: 160,
      carbsTargetG: 240,
      fatTargetG: 70,
      startDate: new Date().toISOString().slice(0, 10),
      notes: "Simple balanced target structure for QA validation.",
      mealPlan: {
        version: 1,
        weekStart: "monday",
        days: [
          {
            dayKey: "monday",
            label: "Monday",
            note: "Front-load protein and hydrate early.",
            slots: [
              { sortOrder: 0, mealType: "breakfast", title: "Protein oats", note: "Add fruit plus Greek yogurt." },
              { sortOrder: 1, mealType: "lunch", title: "Rice bowl", note: "Lean protein, rice, mixed vegetables." },
              { sortOrder: 2, mealType: "dinner", title: "Salmon + potatoes", note: "Vegetables on the side." },
            ],
          },
          {
            dayKey: "wednesday",
            label: "Wednesday",
            note: "Post-workout carbs matter more today.",
            slots: [
              { sortOrder: 0, mealType: "breakfast", title: "Egg wrap", note: "Fruit on the side." },
              { sortOrder: 1, mealType: "post_workout", title: "Recovery meal", note: "Carbs plus 30-40 g protein." },
            ],
          },
        ],
      },
      status: "active",
    },
    habits: [
      {
        sortOrder: 0,
        title: "Protein anchor",
        description: "Hit 30 to 40 g protein in at least 3 meals each day.",
        targetType: "boolean",
        targetValue: 1,
        targetUnit: "complete",
        cadence: "daily",
        isRequired: true,
        isActive: true,
      },
      {
        sortOrder: 1,
        title: "Hydration floor",
        description: "Finish at least 2.5 liters of water by evening.",
        targetType: "number",
        targetValue: 2.5,
        targetUnit: "liters",
        cadence: "daily",
        isRequired: true,
        isActive: true,
      },
    ],
  };
}

function buildHealthTemplatePayload() {
  return {
    template: {
      title: "QA Seed | Weekly Recovery Check-In",
      cadence: "weekly",
      formType: "weekly_checkin",
      description: "Short weekly pulse check for recovery, stress, and adherence.",
      isActive: true,
    },
    questions: [
      {
        sortOrder: 0,
        fieldKey: "weekly_wins",
        label: "What went well this week?",
        questionType: "textarea",
        isRequired: true,
        helpText: "Training, nutrition, recovery, or consistency wins all count.",
        options: [],
      },
      {
        sortOrder: 1,
        fieldKey: "sleep_quality",
        label: "How would you rate your sleep this week?",
        questionType: "single_select",
        isRequired: true,
        helpText: "Choose the closest overall feel.",
        options: ["Poor", "Okay", "Good", "Excellent"],
      },
      {
        sortOrder: 2,
        fieldKey: "stress_load",
        label: "How heavy did stress feel this week?",
        questionType: "single_select",
        isRequired: true,
        helpText: "This helps your coach scale recovery and volume.",
        options: ["Low", "Moderate", "High"],
      },
      {
        sortOrder: 3,
        fieldKey: "coach_support",
        label: "What support would help most next week?",
        questionType: "textarea",
        isRequired: false,
        helpText: "Ask for clarity, adjustments, or accountability support.",
        options: [],
      },
    ],
  };
}

async function main() {
  const [{ coachId, clientId }] = runSql(`
    with coach as (
      select id from auth.users where lower(email) = lower('${escapeSql(QA_COACH_EMAIL)}') limit 1
    ),
    client as (
      select id from auth.users where lower(email) = lower('${escapeSql(QA_CLIENT_EMAIL)}') limit 1
    )
    select
      (select id from coach) as "coachId",
      (select id from client) as "clientId";
  `);

  if (!coachId || !clientId) {
    throw new Error("Canonical QA accounts must exist before seeding content.");
  }

  runSql(`
    delete from public.client_workout_exercise_logs
    where client_program_day_exercise_id in (
      select id from public.client_program_day_exercises
      where client_program_day_id in (
        select id from public.client_program_days
        where assignment_id in (
          select id from public.client_program_assignments where client_id = '${escapeSql(clientId)}'
        )
      )
    );

    delete from public.client_workout_logs
    where client_program_day_id in (
      select id from public.client_program_days
      where assignment_id in (
        select id from public.client_program_assignments where client_id = '${escapeSql(clientId)}'
      )
    );

    delete from public.client_program_day_exercises
    where client_program_day_id in (
      select id from public.client_program_days
      where assignment_id in (
        select id from public.client_program_assignments where client_id = '${escapeSql(clientId)}'
      )
    );

    delete from public.client_program_days
    where assignment_id in (
      select id from public.client_program_assignments where client_id = '${escapeSql(clientId)}'
    );

    delete from public.client_program_assignments
    where client_id = '${escapeSql(clientId)}';

    delete from public.client_nutrition_habits
    where nutrition_plan_id in (
      select id from public.client_nutrition_plans where client_id = '${escapeSql(clientId)}'
    );

    delete from public.client_nutrition_logs
    where client_id = '${escapeSql(clientId)}';

    delete from public.client_nutrition_plans
    where client_id = '${escapeSql(clientId)}';

    delete from public.client_checkin_answers
    where checkin_id in (
      select id from public.client_checkins where client_id = '${escapeSql(clientId)}'
    );

    delete from public.client_checkins
    where client_id = '${escapeSql(clientId)}';

    delete from public.checkin_template_questions
    where template_id in (
      select id from public.checkin_templates
      where coach_id = '${escapeSql(coachId)}'
        and title like 'QA Seed |%'
    );

    delete from public.checkin_templates
    where coach_id = '${escapeSql(coachId)}'
      and title like 'QA Seed |%';

    delete from public.program_template_exercises
    where template_day_id in (
      select d.id
      from public.program_template_days d
      join public.program_template_weeks w on w.id = d.template_week_id
      join public.program_templates t on t.id = w.template_id
      where t.coach_id = '${escapeSql(coachId)}'
        and t.title like 'QA Seed |%'
    );

    delete from public.program_template_days
    where template_week_id in (
      select w.id
      from public.program_template_weeks w
      join public.program_templates t on t.id = w.template_id
      where t.coach_id = '${escapeSql(coachId)}'
        and t.title like 'QA Seed |%'
    );

    delete from public.program_template_weeks
    where template_id in (
      select id from public.program_templates
      where coach_id = '${escapeSql(coachId)}'
        and title like 'QA Seed |%'
    );

    delete from public.program_templates
    where coach_id = '${escapeSql(coachId)}'
      and title like 'QA Seed |%';
  `);

  const coachSession = await signIn(QA_COACH_EMAIL, QA_COACH_PASSWORD);
  const token = coachSession.access_token;

  const templatePayload = buildProgramTemplatePayload();
  const templateResponse = await authJson("/.netlify/functions/save-program-template", token, templatePayload);
  const templateId = templateResponse?.template?.id;
  if (!templateId) {
    throw new Error("Program template creation returned no template id.");
  }

  const assignmentResponse = await authJson("/.netlify/functions/assign-client-program", token, {
    clientId,
    templateId,
    startDate: new Date().toISOString().slice(0, 10),
    title: "QA Seed | Foundation Strength + Conditioning",
    objective: "Populate the client planner with a real assignment for QA review.",
    notes: "Seeded automatically for QA validation.",
  });
  const assignmentId = assignmentResponse?.assignment?.id;
  if (!assignmentId) {
    throw new Error("Program assignment returned no assignment id.");
  }

  const nutritionResponse = await authJson(
    "/.netlify/functions/save-nutrition-plan",
    token,
    buildNutritionPayload(clientId, assignmentId)
  );
  const nutritionPlanId = nutritionResponse?.plan?.id;
  if (!nutritionPlanId) {
    throw new Error("Nutrition plan creation returned no plan id.");
  }

  const healthTemplateResponse = await authJson(
    "/.netlify/functions/save-checkin-template",
    token,
    buildHealthTemplatePayload()
  );
  const healthTemplateId = healthTemplateResponse?.template?.id;
  if (!healthTemplateId) {
    throw new Error("Health template creation returned no template id.");
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);

  const scheduledCheckinResponse = await authJson(
    "/.netlify/functions/schedule-client-checkin",
    token,
    {
      clientId,
      templateId: healthTemplateId,
      assignmentId,
      dueAt: tomorrow.toISOString(),
      cadence: "weekly",
      coachComment: "Quick weekly recovery pulse check for QA validation.",
    }
  );

  const coachPlanner = await authJson("/.netlify/functions/load-planner-data?refresh=1", token);
  const clientSession = await signIn(QA_CLIENT_EMAIL, process.env.QA_CLIENT_PASSWORD || "");
  const clientPlanner = await authJson("/.netlify/functions/load-planner-data?refresh=1", clientSession.access_token);
  const clientDashboard = await authJson("/.netlify/functions/load-dashboard-data?scope=client&page=home", clientSession.access_token);

  console.log(
    JSON.stringify(
      {
        ok: true,
        templateId,
        assignmentId,
        nutritionPlanId,
        healthTemplateId,
        checkinId: scheduledCheckinResponse?.checkin?.id || null,
        coachPlanner: {
          templates: Array.isArray(coachPlanner?.data?.templates) ? coachPlanner.data.templates.length : 0,
          assignments: Array.isArray(coachPlanner?.data?.programAssignments) ? coachPlanner.data.programAssignments.length : 0,
          nutritionPlans: Array.isArray(coachPlanner?.data?.nutritionPlans) ? coachPlanner.data.nutritionPlans.length : 0,
          checkins: Array.isArray(coachPlanner?.data?.checkins) ? coachPlanner.data.checkins.length : 0,
        },
        clientPlanner: {
          plannedDays: Array.isArray(clientPlanner?.data?.programDays) ? clientPlanner.data.programDays.length : 0,
          mealEntries: Array.isArray(clientPlanner?.data?.mealEntries) ? clientPlanner.data.mealEntries.length : 0,
          nutritionPlans: Array.isArray(clientPlanner?.data?.nutritionPlans) ? clientPlanner.data.nutritionPlans.length : 0,
          checkins: Array.isArray(clientPlanner?.data?.checkins) ? clientPlanner.data.checkins.length : 0,
        },
        clientDashboard: {
          assignments: Array.isArray(clientDashboard?.data?.assignments) ? clientDashboard.data.assignments.length : 0,
        },
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(
    JSON.stringify(
      {
        ok: false,
        error: error?.message || String(error),
      },
      null,
      2
    )
  );
  process.exit(1);
});
