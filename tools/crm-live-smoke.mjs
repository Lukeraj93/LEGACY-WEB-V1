import process from "node:process";
import { execSync } from "node:child_process";
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
      // Fall through to the next lookup.
    }
  }

  return "";
}

function buildEphemeralPassword(prefix) {
  return `${prefix}-${crypto.randomBytes(9).toString("base64url")}`;
}

const SUPABASE_URL = process.env.SUPABASE_URL || readNetlifyEnv("SUPABASE_URL");
const SUPABASE_PUBLISHABLE_KEY =
  process.env.SUPABASE_PUBLISHABLE_KEY
  || process.env.SUPABASE_ANON_KEY
  || readNetlifyEnv("SUPABASE_PUBLISHABLE_KEY")
  || readNetlifyEnv("SUPABASE_ANON_KEY");
const APP_BASE_URL = String(process.env.APP_BASE_URL || "https://app.legacycoaching.com.my").replace(/\/+$/u, "");
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
const RUN_CLEANUP = process.env.RUN_CLEANUP === "1";

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error("SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, ADMIN_EMAIL, and ADMIN_PASSWORD are required.");
  process.exit(1);
}

const signatureDataUrl =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAEklEQVR42mP8/5+hHgAHggJ/Pk7l6wAAAABJRU5ErkJggg==";
const timestamp = Date.now();
const prefix = `qa.smoke.${timestamp}`;
const clientEmail = `${prefix}.client@legacycoaching.com.my`;
const coachEmail = `${prefix}.coach@legacycoaching.com.my`;
const consultEmail = `${prefix}.consult@legacycoaching.com.my`;
const adminLeadEmail = `${prefix}.adminlead@legacycoaching.com.my`;
const clientPassword = String(process.env.QA_CLIENT_PASSWORD || "").trim() || buildEphemeralPassword("QaClient");
const coachPassword = String(process.env.QA_COACH_PASSWORD || "").trim() || buildEphemeralPassword("QaCoach");

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
  const prefixLike = `%${escapeSql(prefix)}%`;
  const statements = [
    `
      with deleted as (
        delete from public.coach_consult_intakes
        where lead_id in (
          select id from public.leads where lower(email) like lower('${escapeSql(emailPattern)}')
        )
        returning 1
      )
      select count(*)::int as deleted from deleted;
    `,
    `
      with deleted as (
        delete from public.lead_activities
        where lead_id in (
          select id from public.leads where lower(email) like lower('${escapeSql(emailPattern)}')
        )
        returning 1
      )
      select count(*)::int as deleted from deleted;
    `,
    `
      with deleted as (
        delete from public.notifications
        where lower(title) like lower('${prefixLike}')
           or lower(body) like lower('${prefixLike}')
        returning 1
      )
      select count(*)::int as deleted from deleted;
    `,
    `
      with deleted as (
        delete from public.activation_codes
        where lower(recipient_email) like lower('${escapeSql(emailPattern)}')
        returning 1
      )
      select count(*)::int as deleted from deleted;
    `,
    `
      with deleted as (
        delete from public.client_waiver_submissions
        where lower(email) like lower('${escapeSql(emailPattern)}')
        returning 1
      )
      select count(*)::int as deleted from deleted;
    `,
    `
      with deleted as (
        delete from public.leads
        where lower(email) like lower('${escapeSql(emailPattern)}')
        returning 1
      )
      select count(*)::int as deleted from deleted;
    `,
    `
      with updated as (
        update public.profiles
        set status = 'inactive', updated_at = now()
        where id in (
          select id from auth.users where lower(email) like lower('${escapeSql(emailPattern)}')
        )
        returning 1
      )
      select count(*)::int as deleted from updated;
    `,
  ];

  statements.forEach((statement) => {
    runDbQuery(statement);
  });
}

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

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

async function main() {
  if (RUN_CLEANUP) {
    cleanupQaArtifacts();
  }

  const report = {
    prefix,
    steps: {},
  };

  try {
    const publicCoaches = await api("/.netlify/functions/public-active-coaches");
    report.steps.publicActiveCoaches = {
      status: publicCoaches.status,
      ok: publicCoaches.ok,
      count: publicCoaches.data?.coaches?.length || 0,
    };
    if (!publicCoaches.ok || !(publicCoaches.data?.coaches || []).length) {
      throw new Error(publicCoaches.data?.error || "No active coaches were returned.");
    }

    const assignedCoachId = publicCoaches.data.coaches[0].id;
    const adminSession = await signIn(ADMIN_EMAIL, ADMIN_PASSWORD);
    const adminToken = adminSession.session.access_token;

    const clientCode = await api("/.netlify/functions/manage-activation-codes", {
      token: adminToken,
      method: "POST",
      body: {
        action: "generate",
        role: "client",
        recipientEmail: clientEmail,
        recipientName: `QA Smoke Client ${timestamp}`,
        assignedCoachId,
        notes: `QA smoke ${prefix}`,
      },
    });
    report.steps.clientActivationCode = { status: clientCode.status, ok: clientCode.ok };
    if (!clientCode.ok) {
      throw new Error(clientCode.data?.error || "Client activation code generation failed.");
    }

    const waiver = await api("/.netlify/functions/submit-client-waiver", {
      method: "POST",
      body: {
        fullName: `QA Smoke Client ${timestamp}`,
        finalDeclarationName: `QA Smoke Client ${timestamp}`,
        email: clientEmail,
        phone: "+601122233301",
        icPassportNo: `QAC-${timestamp}`,
        dateOfBirth: "1994-03-11",
        age: 32,
        gender: "female",
        occupation: "QA Analyst",
        activityStyle: "desk",
        homeAddress: "QA Smoke Street, Kuala Lumpur",
        emergencyContactName: "QA Emergency Contact",
        emergencyContactRelationship: "Sibling",
        emergencyContactPhone: "+601122233302",
        pdpaConsent: true,
        mediaConsent: "yes_anonymised",
        parqAnswers: {
          q1: "no",
          q2: "no",
          q3: "no",
          q4: "no",
          q5: "no",
          q6: "no",
          q7: "no",
        },
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
    });
    report.steps.clientWaiver = {
      status: waiver.status,
      ok: waiver.ok,
      waiverSubmissionId: waiver.data?.waiverSubmissionId || null,
    };
    if (!waiver.ok) {
      throw new Error(waiver.data?.error || "Client waiver submission failed.");
    }

    const clientRegistration = await api("/.netlify/functions/register-account", {
      method: "POST",
      body: {
        role: "client",
        fullName: `QA Smoke Client ${timestamp}`,
        email: clientEmail,
        phone: "+601122233301",
        password: clientPassword,
        confirmPassword: clientPassword,
        activationCode: clientCode.data?.code?.code,
        waiverSubmissionId: waiver.data?.waiverSubmissionId,
        preferredCoachId: assignedCoachId,
        gender: "female",
        dateOfBirth: "1994-03-11",
        icPassportNo: `QAC-${timestamp}`,
        homeAddress: "QA Smoke Street, Kuala Lumpur",
        emergencyContactName: "QA Emergency Contact",
        emergencyContactPhone: "+601122233302",
        emergencyContactRelationship: "Sibling",
        primaryGoal: "Build consistency and strength",
        activityStyle: "desk",
        preferredName: "QA Client",
        occupation: "QA Analyst",
        medicalNotes: "None",
      },
    });
    report.steps.clientRegister = {
      status: clientRegistration.status,
      ok: clientRegistration.ok,
      userId: clientRegistration.data?.userId || null,
    };
    if (!clientRegistration.ok) {
      throw new Error(clientRegistration.data?.error || "Client registration failed.");
    }

    const clientSession = await signIn(clientEmail, clientPassword);
    const clientToken = clientSession.session.access_token;
    const clientHome = await api("/.netlify/functions/load-dashboard-data?scope=client&page=home", {
      token: clientToken,
    });
    const clientPackages = await api("/.netlify/functions/load-dashboard-data?scope=client&page=packages", {
      token: clientToken,
    });
    report.steps.clientDashboard = {
      home: clientHome.status,
      packages: clientPackages.status,
      homeOk: clientHome.ok,
      packagesOk: clientPackages.ok,
    };
    if (!clientHome.ok || !clientPackages.ok) {
      throw new Error(clientHome.data?.error || clientPackages.data?.error || "Client dashboard load failed.");
    }
    await supabase.auth.signOut();

    const coachCode = await api("/.netlify/functions/manage-activation-codes", {
      token: adminToken,
      method: "POST",
      body: {
        action: "generate",
        role: "coach",
        recipientEmail: coachEmail,
        recipientName: `QA Smoke Coach ${timestamp}`,
        notes: `QA smoke ${prefix}`,
      },
    });
    report.steps.coachActivationCode = { status: coachCode.status, ok: coachCode.ok };
    if (!coachCode.ok) {
      throw new Error(coachCode.data?.error || "Coach activation code generation failed.");
    }

    const coachRegistration = await api("/.netlify/functions/register-account", {
      method: "POST",
      body: {
        role: "coach",
        fullName: `QA Smoke Coach ${timestamp}`,
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
        experienceNotes: `QA smoke ${prefix}`,
      },
    });
    report.steps.coachRegister = {
      status: coachRegistration.status,
      ok: coachRegistration.ok,
      userId: coachRegistration.data?.userId || null,
    };
    if (!coachRegistration.ok) {
      throw new Error(coachRegistration.data?.error || "Coach registration failed.");
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
    const coachHome = await api("/.netlify/functions/load-dashboard-data?scope=coach&page=home", {
      token: coachToken,
    });
    const coachClients = await api("/.netlify/functions/load-dashboard-data?scope=coach&page=clients", {
      token: coachToken,
    });
    report.steps.coachDashboard = {
      home: coachHome.status,
      clients: coachClients.status,
      homeOk: coachHome.ok,
      clientsOk: coachClients.ok,
    };
    if (!coachHome.ok || !coachClients.ok) {
      throw new Error(coachHome.data?.error || coachClients.data?.error || "Coach dashboard load failed.");
    }

    const consult = await api("/.netlify/functions/capture-coach-consult", {
      token: coachToken,
      method: "POST",
      body: {
        fullName: `QA Smoke Consult ${timestamp}`,
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
        summary: `QA smoke ${prefix} consult`,
      },
    });
    report.steps.coachConsult = {
      status: consult.status,
      ok: consult.ok,
      leadId: consult.data?.leadId || null,
    };
    if (!consult.ok) {
      throw new Error(consult.data?.error || "Coach consult capture failed.");
    }

    const coachFollowUp = await api("/.netlify/functions/manage-leads", {
      token: coachToken,
      method: "POST",
      body: {
        action: "follow_up",
        leadId: consult.data?.leadId,
        activityType: "coach_follow_up",
        status: "contacted",
        nextFollowUpAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        notes: `QA smoke ${prefix} coach follow-up`,
      },
    });
    report.steps.coachLeadFollowUp = {
      status: coachFollowUp.status,
      ok: coachFollowUp.ok,
    };
    if (!coachFollowUp.ok) {
      throw new Error(coachFollowUp.data?.error || "Coach lead follow-up failed.");
    }
    await supabase.auth.signOut();

    const adminHome = await api("/.netlify/functions/load-dashboard-data?scope=admin&page=home", {
      token: adminToken,
    });
    const adminClients = await api("/.netlify/functions/load-dashboard-data?scope=admin&page=clients", {
      token: adminToken,
    });
    const adminLeads = await api("/.netlify/functions/load-dashboard-data?scope=admin&page=leads", {
      token: adminToken,
    });
    const adminFinancials = await api("/.netlify/functions/load-dashboard-data?scope=admin&page=financials", {
      token: adminToken,
    });
    report.steps.adminDashboard = {
      home: adminHome.status,
      clients: adminClients.status,
      leads: adminLeads.status,
      financials: adminFinancials.status,
      ok: adminHome.ok && adminClients.ok && adminLeads.ok && adminFinancials.ok,
    };
    if (!report.steps.adminDashboard.ok) {
      throw new Error(
        adminHome.data?.error
          || adminClients.data?.error
          || adminLeads.data?.error
          || adminFinancials.data?.error
          || "Admin dashboard load failed."
      );
    }

    const adminLead = await api("/.netlify/functions/manage-leads", {
      token: adminToken,
      method: "POST",
      body: {
        action: "create",
        fullName: `QA Smoke Admin Lead ${timestamp}`,
        source: "QA Smoke",
        email: adminLeadEmail,
        phone: "+601122233306",
        ownerId: coachRegistration.data?.userId,
        nextFollowUpAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        notes: `QA smoke ${prefix} admin lead`,
      },
    });
    report.steps.adminCreateLead = {
      status: adminLead.status,
      ok: adminLead.ok,
      leadId: adminLead.data?.leadId || null,
    };
    if (!adminLead.ok) {
      throw new Error(adminLead.data?.error || "Admin lead creation failed.");
    }

    const adminFollowUp = await api("/.netlify/functions/manage-leads", {
      token: adminToken,
      method: "POST",
      body: {
        action: "follow_up",
        leadId: adminLead.data?.leadId,
        activityType: "email",
        status: "qualified",
        ownerId: coachRegistration.data?.userId,
        nextFollowUpAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        notes: `QA smoke ${prefix} admin follow-up`,
      },
    });
    report.steps.adminFollowUp = {
      status: adminFollowUp.status,
      ok: adminFollowUp.ok,
    };
    if (!adminFollowUp.ok) {
      throw new Error(adminFollowUp.data?.error || "Admin lead follow-up failed.");
    }

    console.log(JSON.stringify({ ok: true, report }, null, 2));
  } catch (error) {
    console.log(
      JSON.stringify(
        {
          ok: false,
          report,
          error: error?.message || String(error),
        },
        null,
        2
      )
    );
    process.exitCode = 1;
  } finally {
    if (RUN_CLEANUP) {
      try {
        cleanupQaArtifacts();
      } catch (error) {
        console.error(`Cleanup failed: ${error?.message || error}`);
      }
    }
    await supabase.auth.signOut().catch(() => null);
  }
}

main().catch((error) => {
  console.error(error?.message || error);
  process.exit(1);
});
