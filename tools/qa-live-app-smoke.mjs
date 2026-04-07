import process from "node:process";

const SUPABASE_URL = String(process.env.SUPABASE_URL || "https://ejitroflboctigjubyvm.supabase.co").trim();
const SUPABASE_PUBLISHABLE_KEY = String(
  process.env.SUPABASE_PUBLISHABLE_KEY
    || process.env.SUPABASE_ANON_KEY
    || "sb_publishable_jFgALGmbMm-M_IXWE89-2Q_quLxl0Fe"
).trim();
const APP_BASE_URL = String(process.env.APP_BASE_URL || "https://app.legacycoaching.com.my").replace(/\/+$/u, "");

const CLIENT_EMAIL = String(process.env.QA_CLIENT_EMAIL || "qa.client@legacycoaching.com.my").trim().toLowerCase();
const CLIENT_PASSWORD = String(process.env.QA_CLIENT_PASSWORD || "").trim();
const COACH_EMAIL = String(process.env.QA_COACH_EMAIL || "qa.coach@legacycoaching.com.my").trim().toLowerCase();
const COACH_PASSWORD = String(process.env.QA_COACH_PASSWORD || "").trim();

if (!CLIENT_PASSWORD || !COACH_PASSWORD) {
  console.error("QA_CLIENT_PASSWORD and QA_COACH_PASSWORD are required.");
  process.exit(1);
}

async function parseJson(response) {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch (_) {
    return { raw: text };
  }
}

async function signIn(email, password) {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });
  const payload = await parseJson(response);
  if (!response.ok || !payload?.access_token || !payload?.user?.id) {
    throw new Error(payload?.error_description || payload?.msg || payload?.error || `Unable to sign in as ${email}.`);
  }
  return payload;
}

async function authJson(path, token) {
  const response = await fetch(`${APP_BASE_URL}${path}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const payload = await parseJson(response);
  return {
    status: response.status,
    ok: response.ok,
    payload,
  };
}

async function pageCheck(path, expected = []) {
  const response = await fetch(`${APP_BASE_URL}${path}`);
  const html = await response.text();
  return {
    status: response.status,
    ok: response.ok,
    matched: expected.every((snippet) => html.includes(snippet)),
  };
}

async function main() {
  const report = {
    ok: false,
    pages: {},
    client: {},
    coach: {},
  };

  const signInResults = await Promise.allSettled([
    signIn(CLIENT_EMAIL, CLIENT_PASSWORD),
    signIn(COACH_EMAIL, COACH_PASSWORD),
  ]);
  const [clientSignIn, coachSignIn] = signInResults;

  if (clientSignIn.status !== "fulfilled" || coachSignIn.status !== "fulfilled") {
    console.log(
      JSON.stringify(
        {
          ok: false,
          error: "QA account sign-in failed.",
          clientSignIn: clientSignIn.status === "fulfilled"
            ? { ok: true, email: CLIENT_EMAIL }
            : { ok: false, email: CLIENT_EMAIL, error: String(clientSignIn.reason?.message || clientSignIn.reason || "Unknown error") },
          coachSignIn: coachSignIn.status === "fulfilled"
            ? { ok: true, email: COACH_EMAIL }
            : { ok: false, email: COACH_EMAIL, error: String(coachSignIn.reason?.message || coachSignIn.reason || "Unknown error") },
        },
        null,
        2
      )
    );
    process.exit(1);
  }

  const clientSession = clientSignIn.value;
  const coachSession = coachSignIn.value;

  report.pages.clientPlanner = await pageCheck("/client-planner.html", ["Training", "Nutrition", "Health", "Progress"]);
  report.pages.clientDashboard = await pageCheck("/client-dashboard.html", ["Your Coaching Progress Hub"]);
  report.pages.coachTraining = await pageCheck("/coach-training.html", [
    "Prescribe The Program In One Clean Workbook Flow",
    "Training Builder",
    "Coach Inputs",
    "Coach Session Entry",
  ]);
  report.pages.coachProgramming = await pageCheck("/coach-programming.html", [
    "Prescribe Client Nutrition In One Clear Flow",
    "Nutrition Builder",
    "Planner Review Queue",
  ]);
  report.pages.coachDashboard = await pageCheck("/coach-dashboard.html", ["Coach Home", "Weekly Coach Brief", "Coach Intelligence"]);

  const clientPlanner = await authJson("/.netlify/functions/load-planner-data?refresh=1", clientSession.access_token);
  const clientDashboard = await authJson("/.netlify/functions/load-dashboard-data?scope=client&page=home", clientSession.access_token);
  const nutritionProvider = await authJson("/.netlify/functions/nutrition-provider-status", clientSession.access_token);
  report.client = {
    plannerStatus: clientPlanner.status,
    plannerOk: clientPlanner.ok,
    plannedDays: Array.isArray(clientPlanner.payload?.data?.programDays) ? clientPlanner.payload.data.programDays.length : 0,
    checkinTemplates: Array.isArray(clientPlanner.payload?.data?.checkinTemplates) ? clientPlanner.payload.data.checkinTemplates.length : 0,
    dashboardStatus: clientDashboard.status,
    dashboardOk: clientDashboard.ok,
    dashboardHasAssignments: Boolean(clientDashboard.payload?.data?.assignment)
      || (Array.isArray(clientDashboard.payload?.data?.assignments)
        ? clientDashboard.payload.data.assignments.length > 0
        : false),
    nutritionProviderStatus: nutritionProvider.status,
    nutritionProviderOk: nutritionProvider.ok,
  };

  const coachPlanner = await authJson("/.netlify/functions/load-planner-data?refresh=1", coachSession.access_token);
  const coachDashboard = await authJson("/.netlify/functions/load-dashboard-data?scope=coach&page=home", coachSession.access_token);
  const coachOpsBrief = await authJson("/.netlify/functions/load-coach-ops-brief", coachSession.access_token);
  const exerciseSearch = await authJson("/.netlify/functions/search-exercise-library?query=bench", coachSession.access_token);
  const foodSearch = await authJson("/.netlify/functions/search-food-library?query=rice", coachSession.access_token);
  const coachOpsAutomation = await fetch(`${APP_BASE_URL}/.netlify/functions/run-coach-ops-automation`, {
    method: "GET",
  }).then(async (response) => ({
    status: response.status,
    ok: response.ok,
    payload: await parseJson(response),
  }));
  report.coach = {
    plannerStatus: coachPlanner.status,
    plannerOk: coachPlanner.ok,
    templates: Array.isArray(coachPlanner.payload?.data?.templates) ? coachPlanner.payload.data.templates.length : 0,
    rosterProfiles: Array.isArray(coachPlanner.payload?.data?.rosterProfiles) ? coachPlanner.payload.data.rosterProfiles.length : 0,
    dashboardStatus: coachDashboard.status,
    dashboardOk: coachDashboard.ok,
    dashboardClients: Array.isArray(coachDashboard.payload?.data?.clientProfiles)
      ? coachDashboard.payload.data.clientProfiles.length
      : 0,
    coachOpsBriefStatus: coachOpsBrief.status,
    coachOpsBriefOk: coachOpsBrief.ok,
    coachOpsSegments: Array.isArray(coachOpsBrief.payload?.segmentSummaries) ? coachOpsBrief.payload.segmentSummaries.length : 0,
    coachOpsAutomationStatus: coachOpsAutomation.status,
    coachOpsAutomationOk: coachOpsAutomation.ok,
    exerciseSearchStatus: exerciseSearch.status,
    exerciseSearchOk: exerciseSearch.ok,
    exerciseMatches: Array.isArray(exerciseSearch.payload?.exercises)
      ? exerciseSearch.payload.exercises.length
      : Array.isArray(exerciseSearch.payload?.items)
        ? exerciseSearch.payload.items.length
        : Array.isArray(exerciseSearch.payload?.results)
          ? exerciseSearch.payload.results.length
          : 0,
    foodSearchStatus: foodSearch.status,
    foodSearchOk: foodSearch.ok,
    foodMatches: Array.isArray(foodSearch.payload?.foods)
      ? foodSearch.payload.foods.length
      : Array.isArray(foodSearch.payload?.items)
        ? foodSearch.payload.items.length
        : Array.isArray(foodSearch.payload?.results)
          ? foodSearch.payload.results.length
          : 0,
  };

  report.ok = Object.values(report.pages).every((entry) => entry.ok && entry.matched)
    && report.client.plannerOk
    && report.client.dashboardOk
    && report.client.nutritionProviderOk
    && report.coach.plannerOk
    && report.coach.dashboardOk
    && report.coach.coachOpsBriefOk
    && report.coach.coachOpsAutomationOk
    && report.coach.exerciseSearchOk
    && report.coach.foodSearchOk;

  console.log(JSON.stringify(report, null, 2));

  if (!report.ok) {
    process.exit(1);
  }
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
