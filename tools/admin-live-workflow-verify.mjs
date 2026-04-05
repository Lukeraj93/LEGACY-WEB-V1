import process from "node:process";
import { execSync } from "node:child_process";

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
      // Try the next source.
    }
  }

  return "";
}

function readEnv(name, fallback = "") {
  return String(process.env[name] || fallback).trim();
}

const APP_BASE_URL = String(
  readEnv("APP_BASE_URL") || readNetlifyEnv("APP_BASE_URL") || "https://app.legacycoaching.com.my"
).replace(/\/+$/u, "");
const SUPABASE_URL = readEnv("SUPABASE_URL") || readNetlifyEnv("SUPABASE_URL");
const SUPABASE_PUBLISHABLE_KEY =
  readEnv("SUPABASE_PUBLISHABLE_KEY")
  || readEnv("SUPABASE_ANON_KEY")
  || readNetlifyEnv("SUPABASE_PUBLISHABLE_KEY")
  || readNetlifyEnv("SUPABASE_ANON_KEY")
  || "sb_publishable_jFgALGmbMm-M_IXWE89-2Q_quLxl0Fe";
const SUPABASE_SERVICE_ROLE_KEY =
  readEnv("SUPABASE_SERVICE_ROLE_KEY")
  || readNetlifyEnv("SUPABASE_SERVICE_ROLE_KEY");

const ADMIN_EMAIL =
  readEnv("LEGACY_SUPER_ADMIN_EMAIL")
  || readEnv("ADMIN_EMAIL")
  || readNetlifyEnv("LEGACY_SUPER_ADMIN_EMAIL")
  || readNetlifyEnv("ADMIN_EMAIL")
  || "lukelango@legacycoaching.com.my";
const ADMIN_PASSWORD =
  readEnv("LEGACY_SUPER_ADMIN_PASSWORD")
  || readEnv("ADMIN_PASSWORD")
  || readNetlifyEnv("LEGACY_SUPER_ADMIN_PASSWORD")
  || readNetlifyEnv("ADMIN_PASSWORD");

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, and SUPABASE_SERVICE_ROLE_KEY are required.");
  process.exit(1);
}

if (!ADMIN_PASSWORD) {
  console.error("LEGACY_SUPER_ADMIN_PASSWORD is required.");
  process.exit(1);
}

const publicSupabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const serviceSupabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function signIn(email, password) {
  const { data, error } = await publicSupabase.auth.signInWithPassword({ email, password });
  if (error || !data?.session?.access_token) {
    throw new Error(error?.message || `Unable to sign in as ${email}`);
  }
  return data.session.access_token;
}

async function fetchJson(path, token, options = {}) {
  try {
    const response = await fetch(`${APP_BASE_URL}${path}`, {
      method: options.method || "GET",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(options.headers || {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const text = await response.text();
    let payload = null;
    try {
      payload = text ? JSON.parse(text) : null;
    } catch (_) {
      payload = text;
    }

    return {
      ok: response.ok,
      status: response.status,
      payload,
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      payload: { error: error?.message || String(error) },
    };
  }
}

async function pageCheck(path, expected = []) {
  try {
    const response = await fetch(`${APP_BASE_URL}${path}`);
    const html = await response.text();
    return {
      ok: response.ok,
      status: response.status,
      matched: expected.every((snippet) => html.includes(snippet)),
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      matched: false,
      error: error?.message || String(error),
    };
  }
}

async function cleanupConvertedClient(clientId) {
  if (!clientId) {
    return;
  }

  await serviceSupabase.from("coach_client_assignments").delete().eq("client_id", clientId);
  await serviceSupabase.from("client_profiles").delete().eq("id", clientId);
  await serviceSupabase.from("profiles").delete().eq("id", clientId);
  await serviceSupabase.from("notifications").delete().eq("recipient_id", clientId);
  await serviceSupabase.auth.admin.deleteUser(clientId).catch(() => null);
}

async function cleanupLead(leadId) {
  if (!leadId) {
    return;
  }

  await serviceSupabase.from("lead_activities").delete().eq("lead_id", leadId);
  await serviceSupabase.from("leads").delete().eq("id", leadId);
}

async function cleanupActivationCodes(emails) {
  const recipientEmails = Array.from(new Set(emails.filter(Boolean)));
  if (!recipientEmails.length) {
    return;
  }

  await serviceSupabase.from("activation_codes").delete().in("recipient_email", recipientEmails);
}

async function main() {
  const token = await signIn(ADMIN_EMAIL, ADMIN_PASSWORD);
  const runId = `${Date.now()}`;
  const tempLeadEmail = `legacy-smoke-lead-${runId}@example.invalid`;
  const tempCoachCodeEmail = `legacy-smoke-coach-${runId}@example.invalid`;
  const tempClientCodeEmail = `legacy-smoke-client-${runId}@example.invalid`;
  const tempPassword = `LegacyTmp-${runId.slice(-8)}`;

  let createdLeadId = "";
  let createdClientId = "";
  const cleanupEmails = [tempCoachCodeEmail, tempClientCodeEmail];

  const report = {
    ok: false,
    pages: {},
    dashboardData: {},
    mutations: {},
    skipped: {},
    cleanup: {},
  };

  try {
    report.pages.home = await pageCheck("/admin-dashboard.html", ["Business Overview and Priority Queue", "LEGACY+ CRM"]);
    report.pages.clients = await pageCheck("/admin-clients.html", ["Team Operations and Client Assignment", "Generate Coach Authentication Code"]);
    report.pages.leads = await pageCheck("/admin-leads.html", ["Capture, Follow Up, Convert, and Message", "Convert Lead to Client"]);
    report.pages.financials = await pageCheck("/admin-financials.html", ["Payments Workspace", "Transactions", "Payouts &amp; Balances"]);
    report.pages.settings = await pageCheck("/admin-settings.html", ["Integration Status and CRM Operating Rules", "QA Account Manager"]);

    for (const page of ["home", "clients", "leads", "financials", "settings"]) {
      report.dashboardData[page] = await fetchJson(`/.netlify/functions/load-dashboard-data?scope=admin&page=${page}`, token);
    }

    report.mutations.qaStatus = await fetchJson("/.netlify/functions/manage-qa-accounts", token);
    const qaCoachId = report.mutations.qaStatus.payload?.status?.coach?.id || "";

    report.mutations.generateCoachCode = await fetchJson("/.netlify/functions/manage-activation-codes", token, {
      method: "POST",
      body: {
        action: "generate",
        role: "coach",
        recipientEmail: tempCoachCodeEmail,
        recipientName: "LEGACY Smoke Coach",
        notes: `Smoke verification ${runId}`,
      },
    });

    report.mutations.generateClientCode = await fetchJson("/.netlify/functions/manage-activation-codes", token, {
      method: "POST",
      body: {
        action: "generate",
        role: "client",
        recipientEmail: tempClientCodeEmail,
        recipientName: "LEGACY Smoke Client",
        assignedCoachId: qaCoachId || undefined,
        notes: `Smoke verification ${runId}`,
      },
    });

    report.mutations.createLead = await fetchJson("/.netlify/functions/manage-leads", token, {
      method: "POST",
      body: {
        action: "create",
        fullName: `LEGACY Smoke Lead ${runId}`,
        source: "Smoke Test",
        email: tempLeadEmail,
        phone: "+60112223344",
        notes: `Created by automated verification ${runId}.`,
      },
    });
    createdLeadId = String(report.mutations.createLead.payload?.leadId || "");

    report.mutations.followUp = await fetchJson("/.netlify/functions/manage-leads", token, {
      method: "POST",
      body: {
        action: "follow_up",
        leadId: createdLeadId,
        activityType: "note",
        status: "qualified",
        notes: `Qualified during automated verification ${runId}.`,
      },
    });

    report.mutations.logMessage = await fetchJson("/.netlify/functions/manage-leads", token, {
      method: "POST",
      body: {
        action: "log_message",
        leadId: createdLeadId,
        channel: "note",
        subject: `Smoke verification ${runId}`,
        message: "This is a disposable internal note created by the admin workflow verification pass.",
      },
    });

    report.mutations.convertLead = await fetchJson("/.netlify/functions/convert-lead-to-client", token, {
      method: "POST",
      body: {
        leadId: createdLeadId,
        coachId: qaCoachId || undefined,
        temporaryPassword: tempPassword,
      },
    });
    createdClientId = String(report.mutations.convertLead.payload?.clientId || "");

    report.mutations.refreshLeads = await fetchJson("/.netlify/functions/load-dashboard-data?scope=admin&page=leads", token);
    report.mutations.refreshClients = await fetchJson("/.netlify/functions/load-dashboard-data?scope=admin&page=clients", token);

    const financialOrders = Array.isArray(report.dashboardData.financials?.payload?.data?.orders)
      ? report.dashboardData.financials.payload.data.orders
      : [];
    const refundableCandidate = financialOrders.find(
      (order) => String(order?.order_type || "") === "package" && String(order?.status || "") === "paid"
    );

    if (refundableCandidate?.id) {
      report.skipped.financialMutation =
        "refundable paid package order exists, but refund mutation was intentionally skipped to avoid altering live revenue records.";
    } else {
      report.skipped.financialMutation =
        "no disposable paid package order exists in production, so refund mutation was not exercised.";
    }

    report.ok = Object.values(report.pages).every((entry) => entry.ok && entry.matched)
      && Object.values(report.dashboardData).every((entry) => entry.ok)
      && report.mutations.qaStatus.ok
      && report.mutations.generateCoachCode.ok
      && report.mutations.generateClientCode.ok
      && report.mutations.createLead.ok
      && report.mutations.followUp.ok
      && report.mutations.logMessage.ok
      && report.mutations.convertLead.ok
      && report.mutations.refreshLeads.ok
      && report.mutations.refreshClients.ok;
  } finally {
    try {
      await cleanupLead(createdLeadId);
      report.cleanup.lead = createdLeadId ? "deleted" : "skipped";
    } catch (error) {
      report.cleanup.lead = `failed: ${error.message}`;
    }

    try {
      await cleanupConvertedClient(createdClientId);
      report.cleanup.client = createdClientId ? "deleted" : "skipped";
    } catch (error) {
      report.cleanup.client = `failed: ${error.message}`;
    }

    try {
      await cleanupActivationCodes(cleanupEmails);
      report.cleanup.activationCodes = "deleted";
    } catch (error) {
      report.cleanup.activationCodes = `failed: ${error.message}`;
    }
  }

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
