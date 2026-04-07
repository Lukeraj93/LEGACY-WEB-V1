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
    body: JSON.stringify({ email, password }),
  });
  const payload = await parseJson(response);
  if (!response.ok || !payload?.access_token) {
    throw new Error(payload?.error_description || payload?.msg || payload?.error || `Unable to sign in as ${email}.`);
  }
  return payload.access_token;
}

async function authJson(path, token, options = {}) {
  const response = await fetch(`${APP_BASE_URL}${path}`, {
    method: options.method || "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
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

function authUrlLooksValid(value, expectedHost) {
  try {
    const url = new URL(String(value || ""));
    return url.hostname.includes(expectedHost);
  } catch (_) {
    return false;
  }
}

async function main() {
  const clientToken = await signIn(CLIENT_EMAIL, CLIENT_PASSWORD);
  const coachToken = await signIn(COACH_EMAIL, COACH_PASSWORD);

  const report = {
    ok: false,
    pages: {},
    coach: {},
    client: {},
  };

  report.pages.coachSchedule = await pageCheck("/coach-schedule.html", ["Bookings, Confirmed Sessions, and Completion Queue", "Google Calendar sync"]);
  report.pages.coachHealth = await pageCheck("/coach-health.html", ["Health Desk"]);
  report.pages.clientSettings = await pageCheck("/client-settings.html", ["Wearables", "Fitbit"]);

  report.coach.calendarStatus = await authJson("/.netlify/functions/google-calendar-status", coachToken);
  report.coach.calendarAuth = await authJson("/.netlify/functions/google-calendar-auth-url", coachToken, {
    method: "POST",
    body: {
      returnPath: "/coach-schedule.html",
    },
  });

  report.client.wearablesStatus = await authJson("/.netlify/functions/wearables-status", clientToken);
  report.client.fitbitStatus = await authJson("/.netlify/functions/fitbit-status", clientToken);
  report.client.stravaStatus = await authJson("/.netlify/functions/strava-status", clientToken);
  report.client.fitbitAuth = await authJson("/.netlify/functions/fitbit-auth-url", clientToken, {
    method: "POST",
    body: {
      returnPath: "/client-settings.html",
    },
  });
  report.client.stravaAuth = await authJson("/.netlify/functions/strava-auth-url", clientToken, {
    method: "POST",
    body: {
      returnPath: "/client-settings.html",
    },
  });
  report.client.fitbitSync = await authJson("/.netlify/functions/fitbit-sync", clientToken, {
    method: "POST",
    body: {},
  });
  report.client.stravaSync = await authJson("/.netlify/functions/strava-sync", clientToken, {
    method: "POST",
    body: {},
  });

  const fitbitSyncAcceptable = report.client.fitbitSync.ok || report.client.fitbitSync.status === 400;
  const stravaSyncAcceptable = report.client.stravaSync.ok || report.client.stravaSync.status === 400;
  const stravaConfigured = Boolean(report.client.stravaStatus.payload?.configured);
  const stravaAuthAcceptable = stravaConfigured
    ? report.client.stravaAuth.ok && authUrlLooksValid(report.client.stravaAuth.payload?.authUrl, "strava.com")
    : report.client.stravaAuth.status === 400
      && /not configured/iu.test(String(report.client.stravaAuth.payload?.error || ""));

  report.ok = Object.values(report.pages).every((entry) => entry.ok && entry.matched)
    && report.coach.calendarStatus.ok
    && report.coach.calendarAuth.ok
    && authUrlLooksValid(report.coach.calendarAuth.payload?.authUrl, "accounts.google.")
    && report.client.wearablesStatus.ok
    && report.client.fitbitStatus.ok
    && report.client.stravaStatus.ok
    && report.client.fitbitAuth.ok
    && authUrlLooksValid(report.client.fitbitAuth.payload?.authUrl, "fitbit.com")
    && stravaAuthAcceptable
    && fitbitSyncAcceptable
    && stravaSyncAcceptable;

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
