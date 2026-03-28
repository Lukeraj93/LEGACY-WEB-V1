import crypto from "node:crypto";
import process from "node:process";
import { pathToFileURL } from "node:url";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const DEMO_PASSWORD = String(process.env.LEGACY_DEMO_ACCOUNT_PASSWORD || "").trim();
const PRIMARY_SUPER_ADMIN_EMAIL = String(process.env.LEGACY_SUPER_ADMIN_EMAIL || "luke_raj@hotmail.com").trim();
const PRIMARY_SUPER_ADMIN_PASSWORD = String(process.env.LEGACY_SUPER_ADMIN_PASSWORD || "").trim();
const PRIMARY_SUPER_ADMIN_AVATAR_URL = "./assets/CRM Pictures/male_titans/titan-01.png";
const now = new Date();

const PRIMARY_USERS = {
  admin: {
    email: PRIMARY_SUPER_ADMIN_EMAIL,
    password: PRIMARY_SUPER_ADMIN_PASSWORD,
    role: "super_admin",
    displayName: "Luke Lango",
  },
  coach: {
    email: "lucasraj93@gmail.com",
    role: "coach",
    displayName: "Caleb",
  },
  client: {
    email: "lukelango@legacycoaching.com.my",
    role: "client",
    displayName: "Sheng",
  },
};

const DEMO_COACHES = [
  {
    email: PRIMARY_USERS.coach.email,
    role: "coach",
    displayName: "Caleb",
    commissionTier: "standard",
    commissionRate: 0.1,
    positionCode: "partner_full_time",
    hoursMinimum: 80,
    hoursTarget: 120,
    notes: "Lead strength coach for the year-one demo workspace.",
  },
  {
    email: "coach.amelia.demo@legacycoaching.com.my",
    role: "coach",
    displayName: "Amelia Cross",
    commissionTier: "standard",
    commissionRate: 0.11,
    positionCode: "partner_full_time",
    hoursMinimum: 80,
    hoursTarget: 120,
    notes: "Demo coach focused on strength and conditioning.",
  },
  {
    email: "coach.hana.demo@legacycoaching.com.my",
    role: "coach",
    displayName: "Hana Idris",
    commissionTier: "standard",
    commissionRate: 0.105,
    positionCode: "partner_part_time",
    hoursMinimum: 50,
    hoursTarget: 80,
    notes: "Demo coach focused on women’s performance and mobility.",
  },
  {
    email: "coach.daniel.demo@legacycoaching.com.my",
    role: "coach",
    displayName: "Daniel Roy",
    commissionTier: "standard",
    commissionRate: 0.095,
    positionCode: "signature_full_time_basic",
    hoursMinimum: 90,
    hoursTarget: 140,
    notes: "Demo coach focused on body composition and general fitness.",
  },
];

const DEMO_CLIENTS = [
  {
    email: PRIMARY_USERS.client.email,
    role: "client",
    displayName: "Sheng",
    preferredName: "Sheng",
    memberId: "LC-DEMO-0001",
    primaryGoal: "Build lean muscle and maintain 4 sessions weekly.",
    xpPoints: 4820,
    gymCoins: 270,
    onboardingStatus: "active",
    coachEmail: PRIMARY_USERS.coach.email,
  },
  {
    email: "client.sarah.demo@legacycoaching.com.my",
    role: "client",
    displayName: "Sarah Lim",
    preferredName: "Sarah",
    memberId: "LC-DEMO-0002",
    primaryGoal: "Regain lifting confidence and improve lower body strength.",
    xpPoints: 3650,
    gymCoins: 184,
    onboardingStatus: "active",
    coachEmail: "coach.amelia.demo@legacycoaching.com.my",
  },
  {
    email: "client.alicia.demo@legacycoaching.com.my",
    role: "client",
    displayName: "Alicia Tan",
    preferredName: "Alicia",
    memberId: "LC-DEMO-0003",
    primaryGoal: "Progress fat loss while keeping energy stable for work.",
    xpPoints: 2980,
    gymCoins: 142,
    onboardingStatus: "active",
    coachEmail: "coach.hana.demo@legacycoaching.com.my",
  },
  {
    email: "client.rahman.demo@legacycoaching.com.my",
    role: "client",
    displayName: "Rahman Iskandar",
    preferredName: "Rahman",
    memberId: "LC-DEMO-0004",
    primaryGoal: "Return to training after travel and rebuild weekly consistency.",
    xpPoints: 2210,
    gymCoins: 118,
    onboardingStatus: "active",
    coachEmail: PRIMARY_USERS.coach.email,
  },
  {
    email: "client.jason.demo@legacycoaching.com.my",
    role: "client",
    displayName: "Jason Wong",
    preferredName: "Jason",
    memberId: "LC-DEMO-0005",
    primaryGoal: "Increase squat, deadlift, and confidence before competition.",
    xpPoints: 5570,
    gymCoins: 336,
    onboardingStatus: "active",
    coachEmail: "coach.daniel.demo@legacycoaching.com.my",
  },
  {
    email: "client.nadia.demo@legacycoaching.com.my",
    role: "client",
    displayName: "Nadia Lee",
    preferredName: "Nadia",
    memberId: "LC-DEMO-0006",
    primaryGoal: "Improve mobility, posture, and reduce recurring back pain.",
    xpPoints: 1860,
    gymCoins: 96,
    onboardingStatus: "active",
    coachEmail: "coach.hana.demo@legacycoaching.com.my",
  },
  {
    email: "client.marcus.demo@legacycoaching.com.my",
    role: "client",
    displayName: "Marcus Goh",
    preferredName: "Marcus",
    memberId: "LC-DEMO-0007",
    primaryGoal: "Maintain strength and body composition through a heavy work schedule.",
    xpPoints: 4090,
    gymCoins: 208,
    onboardingStatus: "active",
    coachEmail: "coach.amelia.demo@legacycoaching.com.my",
  },
  {
    email: "client.priya.demo@legacycoaching.com.my",
    role: "client",
    displayName: "Priya Nair",
    preferredName: "Priya",
    memberId: "LC-DEMO-0008",
    primaryGoal: "Build training confidence and re-establish routine after maternity.",
    xpPoints: 2540,
    gymCoins: 132,
    onboardingStatus: "active",
    coachEmail: "coach.hana.demo@legacycoaching.com.my",
  },
  {
    email: "client.faris.demo@legacycoaching.com.my",
    role: "client",
    displayName: "Faris Hakim",
    preferredName: "Faris",
    memberId: "LC-DEMO-0009",
    primaryGoal: "Move from rehabilitation into long-term performance work.",
    xpPoints: 3325,
    gymCoins: 154,
    onboardingStatus: "active",
    coachEmail: "coach.daniel.demo@legacycoaching.com.my",
  },
];

const DEMO_AVATAR_URLS = {
  [PRIMARY_SUPER_ADMIN_EMAIL]: PRIMARY_SUPER_ADMIN_AVATAR_URL,
  "lucasraj93@gmail.com": "./assets/CRM Pictures/male_titans/titan-02.png",
  "coach.daniel.demo@legacycoaching.com.my": "./assets/CRM Pictures/male_titans/titan-03.png",
  "coach.amelia.demo@legacycoaching.com.my": "./assets/CRM Pictures/female_legends/female-02.png",
  "coach.hana.demo@legacycoaching.com.my": "./assets/CRM Pictures/female_legends/female-03.png",
  "lukelango@legacycoaching.com.my": "./assets/CRM Pictures/v4/female/female-01.png",
  "client.sarah.demo@legacycoaching.com.my": "./assets/CRM Pictures/v4/female/female-02.png",
  "client.alicia.demo@legacycoaching.com.my": "./assets/CRM Pictures/v4/female/female-03.png",
  "client.rahman.demo@legacycoaching.com.my": "./assets/CRM Pictures/v3/male/male-01.png",
  "client.jason.demo@legacycoaching.com.my": "./assets/CRM Pictures/v3/male/male-02.png",
  "client.nadia.demo@legacycoaching.com.my": "./assets/CRM Pictures/v4/female/female-04.png",
  "client.marcus.demo@legacycoaching.com.my": "./assets/CRM Pictures/v3/male/male-03.png",
  "client.priya.demo@legacycoaching.com.my": "./assets/CRM Pictures/female_legends/female-01.png",
  "client.faris.demo@legacycoaching.com.my": "./assets/CRM Pictures/v3/male/male-04.png",
};

function log(message) {
  console.log(`[seed-demo-year-one] ${message}`);
}

function toIso(date) {
  return new Date(date).toISOString();
}

function daysAgo(days, hour = 10, minute = 0) {
  const date = new Date(now);
  date.setUTCDate(date.getUTCDate() - days);
  date.setUTCHours(hour, minute, 0, 0);
  return toIso(date);
}

function daysAhead(days, hour = 10, minute = 0) {
  const date = new Date(now);
  date.setUTCDate(date.getUTCDate() + days);
  date.setUTCHours(hour, minute, 0, 0);
  return toIso(date);
}

function addMinutes(isoValue, minutes) {
  const date = new Date(isoValue);
  date.setUTCMinutes(date.getUTCMinutes() + minutes);
  return toIso(date);
}

function isoDateOnly(isoValue) {
  return new Date(isoValue).toISOString().slice(0, 10);
}

function monthStart(monthOffset = 0) {
  const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + monthOffset, 1, 0, 0, 0));
  return date.toISOString().slice(0, 10);
}

function numeric(value) {
  return Math.round(Number(value || 0) * 100) / 100;
}

function assertNoError(label, response) {
  if (response?.error) {
    throw new Error(`${label}: ${response.error.message}`);
  }
  return response?.data;
}

async function listUsers() {
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 500 });
  if (error) {
    throw new Error(`Unable to list auth users: ${error.message}`);
  }
  return data.users || [];
}

async function ensureAuthUser(spec, existingByEmail) {
  const normalizedEmail = spec.email.trim().toLowerCase();
  const existing = existingByEmail.get(normalizedEmail);
  const password = String(
    spec.password || (spec.role === "super_admin" ? "" : DEMO_PASSWORD)
  ).trim();
  if (existing) {
    const updatePayload = {
      email_confirm: true,
      user_metadata: {
        display_name: spec.displayName,
        role: spec.role,
      },
      app_metadata: {
        role: spec.role,
      },
    };
    if (password) {
      updatePayload.password = password;
    }
    await supabase.auth.admin.updateUserById(existing.id, updatePayload);
    return { ...spec, id: existing.id };
  }

  if (!password) {
    throw new Error(`A password is required to create auth user for ${spec.email}.`);
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: spec.email,
    password,
    email_confirm: true,
    user_metadata: {
      display_name: spec.displayName,
      role: spec.role,
    },
    app_metadata: {
      role: spec.role,
    },
  });

  if (error || !data?.user?.id) {
    throw new Error(`Unable to create auth user for ${spec.email}: ${error?.message || "unknown error"}`);
  }

  return { ...spec, id: data.user.id };
}

async function deleteInChunks(table, column, values) {
  const normalized = Array.from(new Set((values || []).filter(Boolean)));
  if (!normalized.length) {
    return;
  }

  for (let index = 0; index < normalized.length; index += 50) {
    const chunk = normalized.slice(index, index + 50);
    const response = await supabase.from(table).delete().in(column, chunk);
    assertNoError(`delete ${table}`, response);
  }
}

async function cleanupDemoData(clientIds, coachIds, adminId) {
  const recipientIds = [adminId].concat(clientIds, coachIds).filter(Boolean);
  await deleteInChunks("notifications", "recipient_id", recipientIds);
  await deleteInChunks("points_ledger", "client_id", clientIds);
  await deleteInChunks("session_change_requests", "client_id", clientIds);
  await deleteInChunks("booking_requests", "client_id", clientIds);
  await deleteInChunks("sessions", "client_id", clientIds);
  await deleteInChunks("commission_records", "coach_id", coachIds);
  await deleteInChunks("coach_client_assignments", "client_id", clientIds);
  await deleteInChunks("coach_availability_windows", "coach_id", coachIds);
  await deleteInChunks("orders", "client_id", clientIds);

  const leadsResponse = await supabase.from("leads").select("id").like("source", "demo_%");
  const demoLeadIds = assertNoError("select demo leads", leadsResponse).map((lead) => lead.id);
  await deleteInChunks("lead_activities", "lead_id", demoLeadIds);
  await deleteInChunks("leads", "id", demoLeadIds);

  const operatingCostPayload = {
    key: "operating_cost_entries_v1",
    value: {
      entries: [],
      updatedAt: new Date().toISOString(),
    },
    updated_by: adminId,
    updated_at: new Date().toISOString(),
  };
  assertNoError(
    "reset operating costs",
    await supabase.from("app_settings").upsert(operatingCostPayload, { onConflict: "key" })
  );
}

async function fetchPackageCatalog() {
  const { data, error } = await supabase
    .from("package_catalog")
    .select("id, code, name, package_type, training_format, sessions_included, expiry_days, gross_amount_rm, price_rm, sst_amount_rm, metadata")
    .eq("is_active", true)
    .order("gross_amount_rm", { ascending: true });

  if (error) {
    throw new Error(`Unable to load package catalog: ${error.message}`);
  }

  const rows = (data || []).filter((item) => item.package_type === "coaching" && !item.metadata?.internalTest);
  if (!rows.length) {
    throw new Error("No active coaching packages were found in the catalog.");
  }

  return rows;
}

function pickCatalog(catalog, formatPreference, minimumSessions = 8) {
  const byFormat = catalog.filter((item) => item.training_format === formatPreference);
  const source = byFormat.length ? byFormat : catalog;
  return (
    source.find((item) => Number(item.sessions_included || 0) >= minimumSessions)
    || source[source.length - 1]
  );
}

function buildXpEntries(clientId, requestedBy, totalXp, totalCoins) {
  const xpParts = [0.3, 0.23, 0.18, 0.16, 0.13];
  const coinParts = [0.34, 0.28, 0.22, 0.16];
  const xpReasons = [
    "Coach-approved consistency streak",
    "Body composition check-in milestone",
    "Strength progression verified",
    "Attendance and punctuality bonus",
    "Lifestyle compliance approval",
  ];
  const coinReasons = [
    "Nutrition adherence reward",
    "Referral appreciation reward",
    "Challenge completion bonus",
    "Weekly habit streak reward",
  ];

  const entries = [];
  let xpAllocated = 0;
  xpParts.forEach((part, index) => {
    const value = index === xpParts.length - 1 ? totalXp - xpAllocated : Math.round(totalXp * part);
    xpAllocated += value;
    entries.push({
      id: crypto.randomUUID(),
      client_id: clientId,
      points_type: "xp",
      delta: value,
      reason: xpReasons[index],
      requested_by: requestedBy,
      approved_by: PRIMARY_USERS.admin.id,
      approval_status: "approved",
      created_at: daysAgo(210 - index * 32, 9),
      approved_at: daysAgo(209 - index * 32, 11),
    });
  });

  let coinsAllocated = 0;
  coinParts.forEach((part, index) => {
    const value = index === coinParts.length - 1 ? totalCoins - coinsAllocated : Math.round(totalCoins * part);
    coinsAllocated += value;
    entries.push({
      id: crypto.randomUUID(),
      client_id: clientId,
      points_type: "gym_coins",
      delta: value,
      reason: coinReasons[index],
      requested_by: requestedBy,
      approved_by: PRIMARY_USERS.admin.id,
      approval_status: "approved",
      created_at: daysAgo(150 - index * 21, 10),
      approved_at: daysAgo(149 - index * 21, 12),
    });
  });

  entries.push({
    id: crypto.randomUUID(),
    client_id: clientId,
    points_type: "xp",
    delta: 120,
    reason: "Pending coach recognition for this week",
    requested_by: requestedBy,
    approved_by: null,
    approval_status: "pending",
    created_at: daysAgo(2, 9),
    approved_at: null,
  });

  return entries;
}

export async function runDemoSeed() {
  if (!DEMO_PASSWORD) {
    throw new Error("Set LEGACY_DEMO_ACCOUNT_PASSWORD before running seed-demo-year-one.");
  }
  const users = await listUsers();
  const existingByEmail = new Map(users.map((user) => [String(user.email || "").toLowerCase(), user]));

  const ensuredAdmin = await ensureAuthUser(PRIMARY_USERS.admin, existingByEmail);
  PRIMARY_USERS.admin.id = ensuredAdmin.id;

  const ensuredCoaches = [];
  for (const coach of DEMO_COACHES) {
    ensuredCoaches.push(await ensureAuthUser(coach, existingByEmail));
  }

  const ensuredClients = [];
  for (const client of DEMO_CLIENTS) {
    ensuredClients.push(await ensureAuthUser(client, existingByEmail));
  }

  const coachIds = ensuredCoaches.map((item) => item.id);
  const clientIds = ensuredClients.map((item) => item.id);
  const coachIdByEmail = new Map(ensuredCoaches.map((item) => [item.email, item.id]));
  const clientIdByEmail = new Map(ensuredClients.map((item) => [item.email, item.id]));

  await cleanupDemoData(clientIds, coachIds, ensuredAdmin.id);

  assertNoError(
    "upsert profiles",
    await supabase.from("profiles").upsert(
      [
        {
          id: ensuredAdmin.id,
          role: "super_admin",
          display_name: ensuredAdmin.displayName,
          avatar_url: DEMO_AVATAR_URLS[ensuredAdmin.email] || null,
          phone: "+601100000001",
          status: "active",
          updated_at: new Date().toISOString(),
        },
        ...ensuredCoaches.map((coach, index) => ({
          id: coach.id,
          role: "coach",
          display_name: coach.displayName,
          avatar_url: DEMO_AVATAR_URLS[coach.email] || null,
          phone: `+60110000010${index + 1}`,
          status: "active",
          updated_at: new Date().toISOString(),
        })),
        ...ensuredClients.map((client, index) => ({
          id: client.id,
          role: "client",
          display_name: client.displayName,
          avatar_url: DEMO_AVATAR_URLS[client.email] || null,
          phone: `+60110000020${index + 1}`,
          status: "active",
          updated_at: new Date().toISOString(),
        })),
      ],
      { onConflict: "id" }
    )
  );

  assertNoError(
    "upsert coach profiles",
    await supabase.from("coach_profiles").upsert(
      ensuredCoaches.map((coach) => ({
        id: coach.id,
        commission_tier: coach.commissionTier,
        commission_rate: coach.commissionRate,
      })),
      { onConflict: "id" }
    )
  );

  assertNoError(
    "upsert client profiles",
    await supabase.from("client_profiles").upsert(
      ensuredClients.map((client) => ({
        id: client.id,
        xp_points: client.xpPoints,
        gym_coins: client.gymCoins,
      })),
      { onConflict: "id" }
    )
  );

  const assignments = ensuredClients.map((client, index) => ({
    id: crypto.randomUUID(),
    coach_id: coachIdByEmail.get(client.coachEmail),
    client_id: client.id,
    status: "active",
    assigned_at: daysAgo(280 - index * 9, 8),
    created_by: ensuredAdmin.id,
    notes: "Year-one demo coach assignment",
  }));
  assertNoError("insert coach assignments", await supabase.from("coach_client_assignments").insert(assignments));

  const availability = [];
  const baseWindows = [
    { day: 1, start: "08:00", end: "12:00" },
    { day: 2, start: "14:00", end: "20:00" },
    { day: 3, start: "08:00", end: "12:00" },
    { day: 4, start: "14:00", end: "20:00" },
    { day: 6, start: "09:00", end: "13:00" },
  ];
  ensuredCoaches.forEach((coach) => {
    baseWindows.forEach((slot) => {
      availability.push({
        id: crypto.randomUUID(),
        coach_id: coach.id,
        day_of_week: slot.day,
        start_time: slot.start,
        end_time: slot.end,
        timezone: "Asia/Kuala_Lumpur",
        is_active: true,
      });
    });
  });
  assertNoError("insert availability", await supabase.from("coach_availability_windows").insert(availability));

  const catalog = await fetchPackageCatalog();
  const oneToOneCore = pickCatalog(catalog, "one_to_one", 12);
  const oneToOneExtended = pickCatalog(catalog, "one_to_one", 20);
  const oneToTwo = pickCatalog(catalog, "one_to_two", 8);

  const orders = [];
  const orderItems = [];
  const payments = [];
  const clientPackages = [];
  const activePackageByClientId = new Map();

  const packageScenarios = ensuredClients.map((client, index) => ({
    client,
    currentPackage: index % 3 === 0 ? oneToOneExtended : index % 4 === 0 ? oneToTwo : oneToOneCore,
    currentPurchasedAt: daysAgo(55 - index * 3, 10),
    currentRemaining: Math.max(3, 9 - index),
    historicalPackage: index % 2 === 0 ? oneToOneCore : null,
    historicalPurchasedAt: daysAgo(250 - index * 9, 11),
  }));

  packageScenarios.forEach((scenario, index) => {
    const activeOrderId = crypto.randomUUID();
    const activeOrderCreatedAt = scenario.currentPurchasedAt;
    const activeReference = `DEMO-Y1-PKG-${index + 1}-ACTIVE`;
    const activePackage = {
      id: crypto.randomUUID(),
      client_id: scenario.client.id,
      order_id: activeOrderId,
      package_id: scenario.currentPackage.id,
      package_name: scenario.currentPackage.name,
      sessions_purchased: Number(scenario.currentPackage.sessions_included || 0),
      sessions_remaining: scenario.currentRemaining,
      activated_at: activeOrderCreatedAt,
      expires_at: daysAhead(90 - index * 2, 23),
      status: "active",
      created_at: activeOrderCreatedAt,
      updated_at: new Date().toISOString(),
    };
    activePackageByClientId.set(scenario.client.id, activePackage);

    orders.push({
      id: activeOrderId,
      client_id: scenario.client.id,
      status: "paid",
      order_type: "package",
      external_reference: activeReference,
      subtotal_amount_rm: numeric(scenario.currentPackage.price_rm),
      tax_amount_rm: numeric(scenario.currentPackage.sst_amount_rm),
      total_amount_rm: numeric(scenario.currentPackage.gross_amount_rm),
      currency: "MYR",
      paid_at: addMinutes(activeOrderCreatedAt, 18),
      created_at: activeOrderCreatedAt,
      updated_at: addMinutes(activeOrderCreatedAt, 18),
    });
    orderItems.push({
      id: crypto.randomUUID(),
      order_id: activeOrderId,
      package_id: scenario.currentPackage.id,
      package_code: scenario.currentPackage.code,
      name: scenario.currentPackage.name,
      quantity: 1,
      unit_amount_rm: numeric(scenario.currentPackage.gross_amount_rm),
      total_amount_rm: numeric(scenario.currentPackage.gross_amount_rm),
      metadata: {
        demoSeed: true,
      },
      created_at: activeOrderCreatedAt,
    });
    payments.push({
      id: crypto.randomUUID(),
      order_id: activeOrderId,
      provider: "hitpay",
      status: "succeeded",
      amount_rm: numeric(scenario.currentPackage.gross_amount_rm),
      currency: "MYR",
      provider_payment_request_id: `demo-pr-${index + 1}`,
      provider_payment_id: `demo-pay-${index + 1}`,
      payment_method: index % 2 === 0 ? "card" : "fpx",
      fees_rm: numeric(scenario.currentPackage.gross_amount_rm * 0.024),
      raw_payload: { demoSeed: true },
      processed_at: addMinutes(activeOrderCreatedAt, 18),
      created_at: activeOrderCreatedAt,
      updated_at: addMinutes(activeOrderCreatedAt, 18),
    });
    clientPackages.push(activePackage);

    if (scenario.historicalPackage) {
      const historyOrderId = crypto.randomUUID();
      const historyCreatedAt = scenario.historicalPurchasedAt;
      orders.push({
        id: historyOrderId,
        client_id: scenario.client.id,
        status: "paid",
        order_type: "package",
        external_reference: `DEMO-Y1-PKG-${index + 1}-HIST`,
        subtotal_amount_rm: numeric(scenario.historicalPackage.price_rm),
        tax_amount_rm: numeric(scenario.historicalPackage.sst_amount_rm),
        total_amount_rm: numeric(scenario.historicalPackage.gross_amount_rm),
        currency: "MYR",
        paid_at: addMinutes(historyCreatedAt, 15),
        created_at: historyCreatedAt,
        updated_at: addMinutes(historyCreatedAt, 15),
      });
      orderItems.push({
        id: crypto.randomUUID(),
        order_id: historyOrderId,
        package_id: scenario.historicalPackage.id,
        package_code: scenario.historicalPackage.code,
        name: scenario.historicalPackage.name,
        quantity: 1,
        unit_amount_rm: numeric(scenario.historicalPackage.gross_amount_rm),
        total_amount_rm: numeric(scenario.historicalPackage.gross_amount_rm),
        metadata: { demoSeed: true },
        created_at: historyCreatedAt,
      });
      payments.push({
        id: crypto.randomUUID(),
        order_id: historyOrderId,
        provider: "hitpay",
        status: "succeeded",
        amount_rm: numeric(scenario.historicalPackage.gross_amount_rm),
        currency: "MYR",
        provider_payment_request_id: `demo-pr-hist-${index + 1}`,
        provider_payment_id: `demo-pay-hist-${index + 1}`,
        payment_method: "duitnow",
        fees_rm: numeric(scenario.historicalPackage.gross_amount_rm * 0.018),
        raw_payload: { demoSeed: true },
        processed_at: addMinutes(historyCreatedAt, 15),
        created_at: historyCreatedAt,
        updated_at: addMinutes(historyCreatedAt, 15),
      });
      clientPackages.push({
        id: crypto.randomUUID(),
        client_id: scenario.client.id,
        order_id: historyOrderId,
        package_id: scenario.historicalPackage.id,
        package_name: scenario.historicalPackage.name,
        sessions_purchased: Number(scenario.historicalPackage.sessions_included || 0),
        sessions_remaining: 0,
        activated_at: historyCreatedAt,
        expires_at: daysAgo(80 - index * 3, 23),
        status: "completed",
        created_at: historyCreatedAt,
        updated_at: daysAgo(80 - index * 3, 23),
      });
    }
  });

  for (let index = 0; index < 3; index += 1) {
    const client = ensuredClients[index];
    const createdAt = daysAgo(3 + index, 13);
    const amount = 380 + index * 120;
    const orderId = crypto.randomUUID();
    orders.push({
      id: orderId,
      client_id: client.id,
      status: index === 2 ? "refunded" : "pending_payment",
      order_type: "merch",
      external_reference: `DEMO-Y1-MERCH-${index + 1}`,
      subtotal_amount_rm: amount,
      tax_amount_rm: 0,
      total_amount_rm: amount,
      currency: "MYR",
      paid_at: index === 2 ? addMinutes(createdAt, 22) : null,
      created_at: createdAt,
      updated_at: addMinutes(createdAt, 22),
    });
    orderItems.push({
      id: crypto.randomUUID(),
      order_id: orderId,
      package_id: null,
      package_code: null,
      name: index === 0 ? "LEGACY+ Performance Tee" : index === 1 ? "Recovery Kit" : "Athlete Hoodie",
      quantity: 1,
      unit_amount_rm: amount,
      total_amount_rm: amount,
      metadata: { demoSeed: true, merch: true },
      created_at: createdAt,
    });
    payments.push({
      id: crypto.randomUUID(),
      order_id: orderId,
      provider: "hitpay",
      status: index === 2 ? "refunded" : "pending",
      amount_rm: amount,
      currency: "MYR",
      provider_payment_request_id: `demo-pr-merch-${index + 1}`,
      provider_payment_id: `demo-pay-merch-${index + 1}`,
      payment_method: index === 0 ? "card" : "shopeepay",
      fees_rm: numeric(amount * 0.025),
      raw_payload: { demoSeed: true, merch: true },
      processed_at: addMinutes(createdAt, 22),
      created_at: createdAt,
      updated_at: addMinutes(createdAt, 22),
    });
  }

  assertNoError("insert orders", await supabase.from("orders").insert(orders));
  assertNoError("insert order items", await supabase.from("order_items").insert(orderItems));
  assertNoError("insert payments", await supabase.from("payments").insert(payments));
  assertNoError("insert client packages", await supabase.from("client_packages").insert(clientPackages));

  const sessions = [];
  const bookingRequests = [];
  const sessionChangeRequests = [];
  const commissionRecords = [];

  packageScenarios.forEach((scenario, index) => {
    const activePackage = activePackageByClientId.get(scenario.client.id);
    const coachId = coachIdByEmail.get(scenario.client.coachEmail);
    const coachProfile = ensuredCoaches.find((coach) => coach.id === coachId);
    const sessionValue = numeric(Number(activePackage.package_name && scenario.currentPackage.gross_amount_rm) / Math.max(Number(scenario.currentPackage.sessions_included || 1), 1));
    const completedCount = Math.max(4, 7 - Math.floor(index / 2));
    const scheduledCount = index === 0 ? 2 : 1;

    for (let sessionIndex = 0; sessionIndex < completedCount; sessionIndex += 1) {
      const scheduledStart = daysAgo(70 - index * 4 - sessionIndex * 7, 11 + (sessionIndex % 3));
      const sessionId = crypto.randomUUID();
      sessions.push({
        id: sessionId,
        client_id: scenario.client.id,
        coach_id: coachId,
        client_package_id: activePackage.id,
        booking_request_id: null,
        scheduled_start: scheduledStart,
        scheduled_end: addMinutes(scheduledStart, 60),
        status: "completed",
        session_value_rm: sessionValue,
        completed_at: addMinutes(scheduledStart, 60),
        created_at: scheduledStart,
        updated_at: addMinutes(scheduledStart, 60),
      });
      commissionRecords.push({
        id: crypto.randomUUID(),
        coach_id: coachId,
        session_id: sessionId,
        commission_rate: coachProfile?.commissionRate || 0.1,
        amount_rm: numeric(sessionValue * Number(coachProfile?.commissionRate || 0.1)),
        payout_month: monthStart(-Math.floor((70 - index * 4 - sessionIndex * 7) / 30)),
        payout_status: sessionIndex < 2 ? "paid" : sessionIndex < 4 ? "approved" : "pending",
        approved_by: sessionIndex < 4 ? ensuredAdmin.id : null,
        approved_at: sessionIndex < 4 ? addMinutes(scheduledStart, 120) : null,
        created_at: addMinutes(scheduledStart, 60),
        updated_at: addMinutes(scheduledStart, 120),
      });
    }

    const scheduledSessionIds = [];
    for (let futureIndex = 0; futureIndex < scheduledCount; futureIndex += 1) {
      const scheduledStart = daysAhead(3 + index * 2 + futureIndex * 5, 10 + futureIndex);
      const sessionId = crypto.randomUUID();
      scheduledSessionIds.push(sessionId);
      sessions.push({
        id: sessionId,
        client_id: scenario.client.id,
        coach_id: coachId,
        client_package_id: activePackage.id,
        booking_request_id: null,
        scheduled_start: scheduledStart,
        scheduled_end: addMinutes(scheduledStart, 60),
        status: "scheduled",
        session_value_rm: sessionValue,
        completed_at: null,
        created_at: daysAgo(1, 10),
        updated_at: daysAgo(1, 10),
      });
    }

    bookingRequests.push({
      id: crypto.randomUUID(),
      client_id: scenario.client.id,
      preferred_coach_id: coachId,
      client_package_id: activePackage.id,
      requested_date: isoDateOnly(daysAhead(9 + index, 0)),
      requested_time: index % 2 === 0 ? "18:00" : "08:30",
      notes: "Session type: Strength + accountability | Demo year-one pipeline",
      status: index < 3 ? "pending" : "approved",
      reviewed_by: index < 3 ? null : ensuredAdmin.id,
      reviewed_at: index < 3 ? null : daysAgo(2, 10),
      created_at: daysAgo(3 + index, 9),
      updated_at: daysAgo(2 + index, 10),
    });

    if (index === 0 && scheduledSessionIds.length) {
      const targetSession = sessions.find((session) => session.id === scheduledSessionIds[0]);
      sessionChangeRequests.push({
        id: crypto.randomUUID(),
        session_id: targetSession.id,
        client_id: scenario.client.id,
        coach_id: coachId,
        request_type: "reschedule",
        original_start: targetSession.scheduled_start,
        original_end: targetSession.scheduled_end,
        requested_start: daysAhead(12, 16),
        requested_end: daysAhead(12, 17),
        reason: "Client requested a move for a work trip.",
        status: "pending",
        reviewed_by: null,
        reviewed_at: null,
        created_at: daysAgo(1, 8),
        updated_at: daysAgo(1, 8),
      });
    }
  });

  assertNoError("insert sessions", await supabase.from("sessions").insert(sessions));
  assertNoError("insert booking requests", await supabase.from("booking_requests").insert(bookingRequests));
  assertNoError("insert session change requests", await supabase.from("session_change_requests").insert(sessionChangeRequests));
  assertNoError("upsert commission records", await supabase.from("commission_records").upsert(commissionRecords, { onConflict: "session_id" }));

  const finalizedPackages = clientPackages.map((pkg) => {
    if (pkg.status !== "active") {
      return pkg;
    }
    const scheduledForPackage = sessions.filter((session) => session.client_package_id === pkg.id && session.status === "scheduled").length;
    const targetRemaining = Math.max(pkg.sessions_remaining, scheduledForPackage + 2);
    return {
      id: pkg.id,
      sessions_remaining: targetRemaining,
      updated_at: new Date().toISOString(),
    };
  });
  for (const pkg of finalizedPackages) {
    assertNoError(
      "refresh package balances",
      await supabase
        .from("client_packages")
        .update({
          sessions_remaining: pkg.sessions_remaining,
          updated_at: pkg.updated_at,
        })
        .eq("id", pkg.id)
    );
  }

  const pointEntries = ensuredClients.flatMap((client) => {
    const requestedBy = coachIdByEmail.get(client.coachEmail);
    return buildXpEntries(client.id, requestedBy, client.xpPoints, client.gymCoins);
  });
  assertNoError("insert points ledger", await supabase.from("points_ledger").insert(pointEntries));

  const leads = [];
  const leadActivities = [];
  const leadSources = ["demo_meta_ads", "demo_instagram", "demo_referral", "demo_whatsapp_form"];
  const leadStatuses = ["new", "contacted", "qualified", "converted", "lost"];
  const ownerIds = [ensuredAdmin.id].concat(coachIds);
  const convertedClientIds = clientIds.slice(0, 5);

  for (let index = 0; index < 18; index += 1) {
    const leadId = crypto.randomUUID();
    const status = leadStatuses[index % leadStatuses.length];
    const source = leadSources[index % leadSources.length];
    const ownerId = ownerIds[index % ownerIds.length];
    const createdAt = daysAgo(330 - index * 11, 14);
    const convertedClientId = status === "converted" ? convertedClientIds[index % convertedClientIds.length] : null;
    leads.push({
      id: leadId,
      full_name: `Demo Lead ${index + 1}`,
      email: `lead${index + 1}.demo@legacycoaching.com.my`,
      phone: `+601180000${String(index + 1).padStart(2, "0")}`,
      source,
      status,
      owner_id: ownerId,
      next_follow_up_at: status === "converted" || status === "lost" ? null : daysAhead(2 + (index % 5), 11),
      notes: "Demo year-one CRM lead seeded for admin review.",
      converted_client_id: convertedClientId,
      created_at: createdAt,
      updated_at: createdAt,
    });
    leadActivities.push({
      id: crypto.randomUUID(),
      lead_id: leadId,
      actor_id: ownerId,
      activity_type: "lead_created",
      notes: `${source} created this lead in the demo pipeline.`,
      created_at: createdAt,
    });
    if (status !== "new") {
      leadActivities.push({
        id: crypto.randomUUID(),
        lead_id: leadId,
        actor_id: ownerId,
        activity_type: status === "converted" ? "consultation" : "follow_up",
        notes: status === "converted" ? "Lead completed consultation and converted." : `Lead moved to ${status}.`,
        created_at: addMinutes(createdAt, 420),
      });
    }
  }

  assertNoError("insert leads", await supabase.from("leads").insert(leads));
  assertNoError("insert lead activities", await supabase.from("lead_activities").insert(leadActivities));

  const notifications = [
    {
      id: crypto.randomUUID(),
      recipient_id: ensuredAdmin.id,
      category: "financial",
      title: "Monthly payout review ready",
      body: "Approved coach commissions are ready for payout review this week.",
      action_url: "./admin-financials.html",
      is_read: false,
      created_at: daysAgo(1, 9),
    },
    {
      id: crypto.randomUUID(),
      recipient_id: ensuredAdmin.id,
      category: "lead",
      title: "Qualified leads need assignment",
      body: "Three qualified leads are waiting for a coach owner in the CRM.",
      action_url: "./admin-leads.html",
      is_read: false,
      created_at: daysAgo(2, 8),
    },
    {
      id: crypto.randomUUID(),
      recipient_id: coachIdByEmail.get(PRIMARY_USERS.coach.email),
      category: "booking",
      title: "Booking request needs action",
      body: "A new client booking request is waiting for approval in your schedule.",
      action_url: "./coach-schedule.html",
      is_read: false,
      created_at: daysAgo(1, 8),
    },
    {
      id: crypto.randomUUID(),
      recipient_id: coachIdByEmail.get(PRIMARY_USERS.coach.email),
      category: "message",
      title: "Client progress update shared",
      body: "Sheng posted a progress update and wants guidance before the next session.",
      action_url: "./coach-clients.html",
      is_read: false,
      created_at: daysAgo(2, 18),
    },
    {
      id: crypto.randomUUID(),
      recipient_id: clientIdByEmail.get(PRIMARY_USERS.client.email),
      category: "session",
      title: "Next coaching session confirmed",
      body: "Your next session with Caleb is now on the calendar.",
      action_url: "./client-schedule.html",
      is_read: false,
      created_at: daysAgo(1, 10),
    },
    {
      id: crypto.randomUUID(),
      recipient_id: clientIdByEmail.get(PRIMARY_USERS.client.email),
      category: "reward",
      title: "XP reward approved",
      body: "Your latest XP approval has been added to the rewards bank.",
      action_url: "./client-rewards.html",
      is_read: false,
      created_at: daysAgo(3, 11),
    },
  ];
  assertNoError("insert notifications", await supabase.from("notifications").insert(notifications));

  const operatingCostEntries = [];
  const monthlyCostTemplates = [
    { group: "payroll", category: "Coach payroll", base: 11800 },
    { group: "facility", category: "Facility rent", base: 7200 },
    { group: "software", category: "Software stack", base: 880 },
    { group: "marketing", category: "Paid ads", base: 1650 },
    { group: "consumables", category: "Consumables", base: 540 },
    { group: "tax_legal", category: "Tax and compliance", base: 690 },
  ];

  for (let offset = -11; offset <= 0; offset += 1) {
    const month = monthStart(offset);
    monthlyCostTemplates.forEach((template, index) => {
      const multiplier = 1 + (offset + 11) * 0.018 + index * 0.012;
      operatingCostEntries.push({
        id: crypto.randomUUID(),
        periodMonth: month,
        costGroup: template.group,
        category: template.category,
        amountRm: numeric(template.base * multiplier),
        notes: "Demo year-one operating cost entry",
        createdBy: ensuredAdmin.id,
        updatedBy: ensuredAdmin.id,
        createdAt: `${month}T08:00:00.000Z`,
        updatedAt: `${month}T09:15:00.000Z`,
      });
    });
  }

  assertNoError(
    "store operating costs",
    await supabase.from("app_settings").upsert(
      {
        key: "operating_cost_entries_v1",
        value: {
          entries: operatingCostEntries,
          updatedAt: new Date().toISOString(),
        },
        updated_by: ensuredAdmin.id,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" }
    )
  );

  const summary = {
    coaches: ensuredCoaches.length,
    clients: ensuredClients.length,
    orders: orders.length,
    sessions: sessions.length,
    leads: leads.length,
  };

  log(`Seed complete: ${summary.coaches} coaches, ${summary.clients} clients, ${summary.orders} orders, ${summary.sessions} sessions, ${summary.leads} leads.`);
  return summary;
}

const invokedPath = process.argv[1] ? pathToFileURL(process.argv[1]).href : null;

if (invokedPath && import.meta.url === invokedPath) {
  runDemoSeed().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
