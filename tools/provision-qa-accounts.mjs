import process from "node:process";
import crypto from "node:crypto";
import { execSync } from "node:child_process";

import { createClient } from "@supabase/supabase-js";

const APP_BASE_URL = String(process.env.APP_BASE_URL || "https://app.legacycoaching.com.my").replace(/\/+$/u, "");
const SUPABASE_URL = "https://ejitroflboctigjubyvm.supabase.co";
const SUPABASE_PUBLIC_KEY =
  String(process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || "sb_publishable_jFgALGmbMm-M_IXWE89-2Q_quLxl0Fe").trim();
const SIGNATURE_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAEklEQVR42mP8/5+hHgAHggJ/Pk7l6wAAAABJRU5ErkJggg==";

function readArg(name, fallback = "") {
  const prefix = `--${name}=`;
  const exactIndex = process.argv.findIndex((token) => token === `--${name}`);
  if (exactIndex >= 0 && process.argv[exactIndex + 1]) {
    return String(process.argv[exactIndex + 1]).trim();
  }
  const inline = process.argv.find((token) => token.startsWith(prefix));
  if (inline) {
    return String(inline.slice(prefix.length)).trim();
  }
  return fallback;
}

function randomPassword(prefix) {
  return `${prefix}-${crypto.randomBytes(10).toString("base64url")}`;
}

function randomCode(prefix) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const chars = Array.from(crypto.randomBytes(8), (value) => alphabet[value % alphabet.length]).join("");
  return `${chars.slice(0, 4)}-${chars.slice(4)}`;
}

function escapeSql(value) {
  return String(value || "").replaceAll("\\", "\\\\").replaceAll("'", "''");
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

function runSql(query) {
  const raw = runDbQuery(query).trim();
  if (!raw) {
    return [];
  }
  return JSON.parse(raw);
}

async function postJson(path, body) {
  const response = await fetch(`${APP_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error || `Request failed for ${path}.`);
  }
  return payload;
}

async function verifyLogin(email, password) {
  const client = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error || !data?.session?.access_token) {
    return false;
  }
  await client.auth.signOut().catch(() => null);
  return true;
}

async function main() {
  const coachEmail = readArg("coach-email", String(process.env.QA_COACH_EMAIL || "").trim() || "qa.coach@legacycoaching.com.my").toLowerCase();
  const clientEmail = readArg("client-email", String(process.env.QA_CLIENT_EMAIL || "").trim() || "qa.client@legacycoaching.com.my").toLowerCase();
  const coachPassword = readArg("coach-password", String(process.env.QA_COACH_PASSWORD || "").trim() || randomPassword("QaCoach"));
  const clientPassword = readArg("client-password", String(process.env.QA_CLIENT_PASSWORD || "").trim() || randomPassword("QaClient"));

  runSql(`
    delete from public.coach_availability_windows
    where coach_id in (
      select id from auth.users where lower(email) in (lower('${escapeSql(coachEmail)}'), lower('${escapeSql(clientEmail)}'))
    );

    delete from public.coach_client_assignments
    where coach_id in (
      select id from auth.users where lower(email) in (lower('${escapeSql(coachEmail)}'), lower('${escapeSql(clientEmail)}'))
    )
    or client_id in (
      select id from auth.users where lower(email) in (lower('${escapeSql(coachEmail)}'), lower('${escapeSql(clientEmail)}'))
    );

    delete from public.client_waiver_submissions
    where lower(email) in (lower('${escapeSql(clientEmail)}'), lower('${escapeSql(coachEmail)}'));

    delete from public.activation_codes
    where lower(recipient_email) in (lower('${escapeSql(coachEmail)}'), lower('${escapeSql(clientEmail)}'));

    delete from auth.users
    where lower(email) in (lower('${escapeSql(coachEmail)}'), lower('${escapeSql(clientEmail)}'));
  `);

  const coachCode = randomCode("QACOACH");
  runSql(`
    insert into public.activation_codes (
      role,
      code,
      recipient_email,
      recipient_name,
      status,
      expires_at,
      notes,
      metadata
    )
    values (
      'coach',
      '${escapeSql(coachCode)}',
      '${escapeSql(coachEmail)}',
      'LEGACY QA Coach',
      'active',
      now() + interval '30 days',
      'Stable QA coach account',
      jsonb_build_object('qaAccount', true)
    );
  `);

  const coachRegistration = await postJson("/.netlify/functions/register-account", {
    role: "coach",
    fullName: "LEGACY QA Coach",
    email: coachEmail,
    phone: "+601100000901",
    password: coachPassword,
    confirmPassword: coachPassword,
    activationCode: coachCode,
    gender: "male",
    dateOfBirth: "1991-07-12",
    icPassportNo: "LC-QA-COACH-001",
    homeAddress: "LEGACY QA Operations, Kuala Lumpur",
    emergencyContactName: "QA Support",
    emergencyContactPhone: "+601100000911",
    emergencyContactRelationship: "Team",
    specialty: "App regression validation and workflow testing",
    certifications: "Internal QA profile",
    availabilityNotes: "Reserved for production-safe coach-side validation.",
    experienceNotes: "Stable QA coach account for app walkthroughs, smoke tests, and regression checks.",
  });

  const coachId = String(coachRegistration?.userId || "").trim();
  if (!coachId) {
    throw new Error("Coach registration returned no user id.");
  }

  runSql(`
    update public.profiles
    set status = 'active',
        updated_at = now()
    where id = '${escapeSql(coachId)}';

    update auth.users
    set raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object(
          'display_name', 'LEGACY QA Coach',
          'full_name', 'LEGACY QA Coach',
          'status', 'active',
          'role', 'coach'
        ),
        raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object(
          'status', 'active',
          'role', 'coach'
        )
    where id = '${escapeSql(coachId)}';

    update public.coach_profiles
    set commission_tier = 'standard',
        commission_rate = 0.1000,
        position_code = 'partner_full_time',
        hours_minimum = 40,
        hours_target = 80,
        notes = 'Stable QA coach account for app walkthroughs, smoke tests, and regression checks.',
        updated_at = now()
    where id = '${escapeSql(coachId)}';

    insert into public.coach_availability_windows (
      coach_id,
      day_of_week,
      start_time,
      end_time,
      timezone,
      is_active,
      updated_at
    )
    values
      ('${escapeSql(coachId)}', 1, '09:00', '18:00', 'Asia/Kuala_Lumpur', true, now()),
      ('${escapeSql(coachId)}', 3, '09:00', '18:00', 'Asia/Kuala_Lumpur', true, now()),
      ('${escapeSql(coachId)}', 5, '09:00', '18:00', 'Asia/Kuala_Lumpur', true, now())
    on conflict (coach_id, day_of_week, start_time, end_time)
    do update set
      timezone = excluded.timezone,
      is_active = excluded.is_active,
      updated_at = excluded.updated_at;
  `);

  const clientCode = randomCode("QACLIENT");
  runSql(`
    insert into public.activation_codes (
      role,
      code,
      recipient_email,
      recipient_name,
      assigned_coach_id,
      status,
      expires_at,
      notes,
      metadata
    )
    values (
      'client',
      '${escapeSql(clientCode)}',
      '${escapeSql(clientEmail)}',
      'LEGACY QA Client',
      '${escapeSql(coachId)}',
      'active',
      now() + interval '30 days',
      'Stable QA client account',
      jsonb_build_object('qaAccount', true)
    );
  `);

  const waiver = await postJson("/.netlify/functions/submit-client-waiver", {
    fullName: "LEGACY QA Client",
    finalDeclarationName: "LEGACY QA Client",
    email: clientEmail,
    phone: "+601100000902",
    icPassportNo: "LC-QA-CLIENT-001",
    dateOfBirth: "1994-03-11",
    age: 32,
    gender: "female",
    occupation: "QA Analyst",
    activityStyle: "desk",
    homeAddress: "LEGACY QA Operations, Kuala Lumpur",
    emergencyContactName: "QA Support",
    emergencyContactRelationship: "Team",
    emergencyContactPhone: "+601100000912",
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
    signatureDataUrl: SIGNATURE_DATA_URL,
    witnessName: "QA Support",
    witnessSignatureName: "QA Support",
  });

  const clientRegistration = await postJson("/.netlify/functions/register-account", {
    role: "client",
    fullName: "LEGACY QA Client",
    email: clientEmail,
    phone: "+601100000902",
    password: clientPassword,
    confirmPassword: clientPassword,
    activationCode: clientCode,
    waiverSubmissionId: waiver.waiverSubmissionId,
    preferredCoachId: coachId,
    gender: "female",
    dateOfBirth: "1994-03-11",
    icPassportNo: "LC-QA-CLIENT-001",
    homeAddress: "LEGACY QA Operations, Kuala Lumpur",
    emergencyContactName: "QA Support",
    emergencyContactPhone: "+601100000912",
    emergencyContactRelationship: "Team",
    primaryGoal: "Validate live client workflows safely without using production member accounts.",
    activityStyle: "desk",
    preferredName: "QA Client",
    occupation: "QA Analyst",
    medicalNotes: "None",
  });

  const clientId = String(clientRegistration?.userId || "").trim();
  if (!clientId) {
    throw new Error("Client registration returned no user id.");
  }

  runSql(`
    update public.client_profiles
    set member_id = 'LC-QA-0001',
        preferred_name = 'QA Client',
        primary_goal = 'Validate live client workflows safely without using production member accounts.',
        onboarding_status = 'active',
        updated_at = now()
    where id = '${escapeSql(clientId)}';

    update auth.users
    set raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object(
          'display_name', 'LEGACY QA Client',
          'full_name', 'LEGACY QA Client',
          'status', 'active',
          'role', 'client'
        ),
        raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object(
          'status', 'active',
          'role', 'client'
        )
    where id = '${escapeSql(clientId)}';
  `);

  const [coachLoginVerified, clientLoginVerified] = await Promise.all([
    verifyLogin(coachEmail, coachPassword),
    verifyLogin(clientEmail, clientPassword),
  ]);

  console.log(
    JSON.stringify(
      {
        ok: true,
        coach: {
          email: coachEmail,
          password: coachPassword,
          userId: coachId,
          loginVerified: coachLoginVerified,
        },
        client: {
          email: clientEmail,
          password: clientPassword,
          userId: clientId,
          loginVerified: clientLoginVerified,
        },
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error?.message || "Unable to provision QA accounts.");
  process.exit(1);
});
