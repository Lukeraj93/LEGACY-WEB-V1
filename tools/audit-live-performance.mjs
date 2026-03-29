import process from "node:process";
import { execSync } from "node:child_process";
import { performance } from "node:perf_hooks";
import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";

function readNetlifyEnv(name) {
  const commands = [
    `npx netlify env:get ${name} --context production`,
    `npx netlify env:get ${name}`,
  ];

  for (const command of commands) {
    try {
      const value = execSync(command, {
        cwd: process.cwd(),
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      }).trim();

      if (value && !/^No value set\b/iu.test(value)) {
        return value;
      }
    } catch (_) {
      // Try the next lookup path.
    }
  }

  return "";
}

const APP_BASE_URL = String(process.env.APP_BASE_URL || readNetlifyEnv("APP_BASE_URL") || "https://app.legacycoaching.com.my").replace(/\/+$/u, "");
const SUPABASE_URL = process.env.SUPABASE_URL || readNetlifyEnv("SUPABASE_URL");
const SUPABASE_PUBLISHABLE_KEY =
  process.env.SUPABASE_PUBLISHABLE_KEY
  || process.env.SUPABASE_ANON_KEY
  || readNetlifyEnv("SUPABASE_PUBLISHABLE_KEY")
  || readNetlifyEnv("SUPABASE_ANON_KEY");
const ADMIN_EMAIL =
  process.env.LEGACY_SUPER_ADMIN_EMAIL
  || process.env.ADMIN_EMAIL
  || readNetlifyEnv("LEGACY_SUPER_ADMIN_EMAIL")
  || readNetlifyEnv("ADMIN_EMAIL");
const ADMIN_PASSWORD =
  process.env.LEGACY_SUPER_ADMIN_PASSWORD
  || process.env.ADMIN_PASSWORD
  || readNetlifyEnv("LEGACY_SUPER_ADMIN_PASSWORD")
  || readNetlifyEnv("ADMIN_PASSWORD");

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error("Missing APP_BASE_URL, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, ADMIN_EMAIL, or ADMIN_PASSWORD.");
  process.exit(1);
}

const signatureDataUrl =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAEklEQVR42mP8/5+hHgAHggJ/Pk7l6wAAAABJRU5ErkJggg==";
const timestamp = Date.now();
const prefix = `qa.perf.${timestamp}`;
const clientEmail = `${prefix}.client@legacycoaching.com.my`;
const coachEmail = `${prefix}.coach@legacycoaching.com.my`;
const consultEmail = `${prefix}.consult@legacycoaching.com.my`;
const clientPassword = String(process.env.QA_CLIENT_PASSWORD || "").trim() || `QaClient-${crypto.randomBytes(9).toString("base64url")}`;
const coachPassword = String(process.env.QA_COACH_PASSWORD || "").trim() || `QaCoach-${crypto.randomBytes(9).toString("base64url")}`;

function escapeSql(value) {
  return String(value || "").replaceAll("'", "''");
}

function runDbQuery(query) {
  const encoded = query
    .replaceAll("\\", "\\\\")
    .replaceAll("\"", "\\\"")
    .replaceAll("\n", " ");

  return execSync(`npx supabase db query --linked --agent=no -o json "${encoded}"`, {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function cleanupQaArtifacts() {
  const emailPattern = `${prefix}%@legacycoaching.com.my`;
  const likePattern = `%${escapeSql(prefix)}%`;
  const statements = [
    `
      delete from public.coach_consult_intakes
      where lead_id in (
        select id from public.leads where lower(email) like lower('${escapeSql(emailPattern)}')
      );
    `,
    `
      delete from public.lead_activities
      where lead_id in (
        select id from public.leads where lower(email) like lower('${escapeSql(emailPattern)}')
      );
    `,
    `
      delete from public.notifications
      where lower(title) like lower('${likePattern}')
         or lower(body) like lower('${likePattern}');
    `,
    `
      delete from public.activation_codes
      where lower(recipient_email) like lower('${escapeSql(emailPattern)}');
    `,
    `
      delete from public.client_waiver_submissions
      where lower(email) like lower('${escapeSql(emailPattern)}');
    `,
    `
      delete from public.leads
      where lower(email) like lower('${escapeSql(emailPattern)}');
    `,
    `
      update public.profiles
      set status = 'inactive', updated_at = now()
      where id in (
        select id from auth.users where lower(email) like lower('${escapeSql(emailPattern)}')
      );
    `,
  ];

  statements.forEach((statement) => {
    try {
      runDbQuery(statement);
    } catch (_) {
      // Best-effort cleanup only.
    }
  });
}

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

async function timed(label, fn, report) {
  const startedAt = performance.now();
  const result = await fn();
  report.timings.push({
    label,
    ms: Math.round(performance.now() - startedAt),
    status: result?.status || 0,
    ok: Boolean(result?.ok),
  });
  return result;
}

async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data?.session?.access_token) {
    throw new Error(error?.message || `Unable to sign in as ${email}.`);
  }
  return data;
}

async function api(path, { token = "", method = "GET", body } = {}) {
  const response = await fetch(`${APP_BASE_URL}${path}`, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (_) {
    data = { raw: text };
  }

  return {
    status: response.status,
    ok: response.ok,
    data,
  };
}

async function fetchPage(path) {
  const response = await fetch(`${APP_BASE_URL}${path}`);
  return {
    status: response.status,
    ok: response.ok,
    bytes: Number(response.headers.get("content-length") || 0),
  };
}

async function main() {
  const report = {
    prefix,
    timings: [],
  };

  cleanupQaArtifacts();

  try {
    await timed("page:/account", () => fetchPage("/account"), report);
    await timed("page:/client-dashboard.html", () => fetchPage("/client-dashboard.html"), report);
    await timed("page:/coach-dashboard.html", () => fetchPage("/coach-dashboard.html"), report);
    await timed("page:/admin-dashboard.html", () => fetchPage("/admin-dashboard.html"), report);
    await timed("asset:/styles.css", () => fetchPage("/styles.css"), report);
    await timed("asset:/account-shell.js", () => fetchPage("/account-shell.js"), report);

    const publicCoaches = await timed("api:public-active-coaches", () => api("/.netlify/functions/public-active-coaches"), report);
    if (!publicCoaches.ok || !(publicCoaches.data?.coaches || []).length) {
      throw new Error(publicCoaches.data?.error || "No active coaches were returned.");
    }

    const assignedCoachId = publicCoaches.data.coaches[0].id;
    const adminSession = await signIn(ADMIN_EMAIL, ADMIN_PASSWORD);
    const adminToken = adminSession.session.access_token;

    const clientCode = await timed("api:generate-client-code", () => api("/.netlify/functions/manage-activation-codes", {
      token: adminToken,
      method: "POST",
      body: {
        action: "generate",
        role: "client",
        recipientEmail: clientEmail,
        recipientName: `QA Perf Client ${timestamp}`,
        assignedCoachId,
        notes: prefix,
      },
    }), report);
    if (!clientCode.ok) {
      throw new Error(clientCode.data?.error || "Client activation code generation failed.");
    }

    const waiver = await timed("api:submit-client-waiver", () => api("/.netlify/functions/submit-client-waiver", {
      method: "POST",
      body: {
        fullName: `QA Perf Client ${timestamp}`,
        finalDeclarationName: `QA Perf Client ${timestamp}`,
        email: clientEmail,
        phone: "+601122233301",
        icPassportNo: `QAP-${timestamp}`,
        dateOfBirth: "1994-03-11",
        age: 32,
        gender: "female",
        occupation: "Performance Analyst",
        activityStyle: "desk",
        homeAddress: "QA Performance Street, Kuala Lumpur",
        emergencyContactName: "QA Emergency Contact",
        emergencyContactRelationship: "Sibling",
        emergencyContactPhone: "+601122233302",
        pdpaConsent: true,
        mediaConsent: "yes_anonymised",
        parqAnswers: { q1: "no", q2: "no", q3: "no", q4: "no", q5: "no", q6: "no", q7: "no" },
        policyInitials: {
          cancellation: "QA",
          lateArrival: "QA",
          noShow: "QA",
          packageValidity: "QA",
          refundPolicy: "QA",
          facilityRules: "QA",
        },
        conditions: [],
        signatureDataUrl,
        witnessName: "QA Witness",
        witnessSignatureName: "QA Witness",
      },
    }), report);
    if (!waiver.ok) {
      throw new Error(waiver.data?.error || "Client waiver submission failed.");
    }

    const clientRegister = await timed("api:register-client", () => api("/.netlify/functions/register-account", {
      method: "POST",
      body: {
        role: "client",
        fullName: `QA Perf Client ${timestamp}`,
        email: clientEmail,
        phone: "+601122233301",
        password: clientPassword,
        confirmPassword: clientPassword,
        activationCode: clientCode.data?.code?.code,
        waiverSubmissionId: waiver.data?.waiverSubmissionId,
        preferredCoachId: assignedCoachId,
        gender: "female",
        dateOfBirth: "1994-03-11",
        icPassportNo: `QAP-${timestamp}`,
        homeAddress: "QA Performance Street, Kuala Lumpur",
        emergencyContactName: "QA Emergency Contact",
        emergencyContactPhone: "+601122233302",
        emergencyContactRelationship: "Sibling",
        primaryGoal: "Build consistency",
        activityStyle: "desk",
        preferredName: "QA Perf Client",
        occupation: "Performance Analyst",
        medicalNotes: "None",
      },
    }), report);
    if (!clientRegister.ok) {
      throw new Error(clientRegister.data?.error || "Client registration failed.");
    }

    const clientSession = await signIn(clientEmail, clientPassword);
    const clientToken = clientSession.session.access_token;
    await timed("api:client-home", () => api("/.netlify/functions/load-dashboard-data?scope=client&page=home", { token: clientToken }), report);
    await timed("api:client-packages", () => api("/.netlify/functions/load-dashboard-data?scope=client&page=packages", { token: clientToken }), report);
    await supabase.auth.signOut();

    const coachCode = await timed("api:generate-coach-code", () => api("/.netlify/functions/manage-activation-codes", {
      token: adminToken,
      method: "POST",
      body: {
        action: "generate",
        role: "coach",
        recipientEmail: coachEmail,
        recipientName: `QA Perf Coach ${timestamp}`,
        notes: prefix,
      },
    }), report);
    if (!coachCode.ok) {
      throw new Error(coachCode.data?.error || "Coach activation code generation failed.");
    }

    const coachRegister = await timed("api:register-coach", () => api("/.netlify/functions/register-account", {
      method: "POST",
      body: {
        role: "coach",
        fullName: `QA Perf Coach ${timestamp}`,
        email: coachEmail,
        phone: "+601122233303",
        password: coachPassword,
        confirmPassword: coachPassword,
        activationCode: coachCode.data?.code?.code,
        gender: "male",
        dateOfBirth: "1990-07-12",
        icPassportNo: `QAH-${timestamp}`,
        homeAddress: "QA Coach Street, Kuala Lumpur",
        emergencyContactName: "QA Coach Emergency",
        emergencyContactPhone: "+601122233304",
        emergencyContactRelationship: "Partner",
        specialty: "General population strength coaching",
        certifications: "NASM CPT",
        availabilityNotes: "Weekdays after 5pm",
        experienceNotes: prefix,
      },
    }), report);
    if (!coachRegister.ok) {
      throw new Error(coachRegister.data?.error || "Coach registration failed.");
    }

    runDbQuery(`
      update public.profiles
      set status = 'active', updated_at = now()
      where id in (
        select id from auth.users where lower(email) = lower('${escapeSql(coachEmail)}')
      );
    `);

    const coachSession = await signIn(coachEmail, coachPassword);
    const coachToken = coachSession.session.access_token;
    await timed("api:coach-home", () => api("/.netlify/functions/load-dashboard-data?scope=coach&page=home", { token: coachToken }), report);
    await timed("api:coach-clients", () => api("/.netlify/functions/load-dashboard-data?scope=coach&page=clients", { token: coachToken }), report);
    const consult = await timed("api:capture-coach-consult", () => api("/.netlify/functions/capture-coach-consult", {
      token: coachToken,
      method: "POST",
      body: {
        fullName: `QA Perf Consult ${timestamp}`,
        email: consultEmail,
        phone: "+601122233305",
        age: 31,
        cityArea: "KL",
        occupation: "Designer",
        workStyle: "mixed",
        heardAbout: "ig",
        preferredMessageWindow: "Evenings",
        offHours: "Weekends",
        goal: "Lose fat and improve stamina",
        timeline: "12_weeks",
        successDefinition: "Feel stronger and lighter",
        whyNow: "Ready to commit",
        importanceScore: 9,
        confidenceScore: 7,
        biggestBarrier: "Consistency",
        trainingExperience: "on_off",
        currentTraining: "Walking",
        nutritionStruggle: "Late-night snacking",
        sleepStress: "Moderate work stress",
        coachingStyle: "Direct but supportive",
        recommendedService: "pt",
        hotness: "warm",
        primaryLever: "accountability",
        riskFlags: ["time"],
        recommendedFrequency: "2x per week",
        recommendedTimeline: "12 weeks",
        nextStep: "Book intro session",
        summary: prefix,
      },
    }), report);
    if (consult.ok && consult.data?.leadId) {
      await timed("api:coach-lead-follow-up", () => api("/.netlify/functions/manage-leads", {
        token: coachToken,
        method: "POST",
        body: {
          action: "follow_up",
          leadId: consult.data.leadId,
          activityType: "coach_follow_up",
          status: "contacted",
          nextFollowUpAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          notes: `${prefix} follow-up`,
        },
      }), report);
    }
    await supabase.auth.signOut();

    await timed("api:admin-home", () => api("/.netlify/functions/load-dashboard-data?scope=admin&page=home", { token: adminToken }), report);
    await timed("api:admin-clients", () => api("/.netlify/functions/load-dashboard-data?scope=admin&page=clients", { token: adminToken }), report);
    await timed("api:admin-leads", () => api("/.netlify/functions/load-dashboard-data?scope=admin&page=leads", { token: adminToken }), report);
    await timed("api:admin-financials", () => api("/.netlify/functions/load-dashboard-data?scope=admin&page=financials", { token: adminToken }), report);
  } finally {
    cleanupQaArtifacts();
  }

  const over100ms = report.timings.filter((item) => item.ms > 100);
  console.log(JSON.stringify({
    prefix,
    timings: report.timings,
    over100ms,
  }, null, 2));
}

main().catch((error) => {
  console.error(error?.message || error);
  cleanupQaArtifacts();
  process.exit(1);
});
