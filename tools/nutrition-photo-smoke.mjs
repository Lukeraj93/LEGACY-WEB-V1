import process from "node:process";
import { execSync } from "node:child_process";
import crypto from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

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
      // Best-effort only.
    }
  }

  return "";
}

const SUPABASE_URL = String(
  process.env.SUPABASE_URL || readNetlifyEnv("SUPABASE_URL") || "https://ejitroflboctigjubyvm.supabase.co"
).trim();
const SUPABASE_PUBLISHABLE_KEY = String(
  process.env.SUPABASE_PUBLISHABLE_KEY
    || readNetlifyEnv("SUPABASE_PUBLISHABLE_KEY")
    || "sb_publishable_jFgALGmbMm-M_IXWE89-2Q_quLxl0Fe"
).trim();
const APP_BASE_URL = String(process.env.APP_BASE_URL || readNetlifyEnv("APP_BASE_URL") || "https://app.legacycoaching.com.my").replace(/\/+$/u, "");
const ADMIN_EMAIL = String(
  process.env.LEGACY_SUPER_ADMIN_EMAIL
    || process.env.ADMIN_EMAIL
    || readNetlifyEnv("LEGACY_SUPER_ADMIN_EMAIL")
    || readNetlifyEnv("ADMIN_EMAIL")
    || ""
).trim();
const ADMIN_PASSWORD = String(
  process.env.LEGACY_SUPER_ADMIN_PASSWORD
    || process.env.ADMIN_PASSWORD
    || readNetlifyEnv("LEGACY_SUPER_ADMIN_PASSWORD")
    || readNetlifyEnv("ADMIN_PASSWORD")
    || ""
).trim();
const RUN_CLEANUP = process.env.RUN_CLEANUP === "1";
const EXISTING_COACH_EMAIL = String(process.env.EXISTING_COACH_EMAIL || "").trim().toLowerCase();
const EXISTING_COACH_PASSWORD = String(process.env.EXISTING_COACH_PASSWORD || "").trim();
const EXISTING_CLIENT_EMAIL = String(process.env.EXISTING_CLIENT_EMAIL || "").trim().toLowerCase();
const EXISTING_CLIENT_PASSWORD = String(process.env.EXISTING_CLIENT_PASSWORD || "").trim();
const SKIP_ACCOUNT_SETUP =
  process.env.SKIP_ACCOUNT_SETUP === "1"
  && EXISTING_COACH_EMAIL
  && EXISTING_COACH_PASSWORD
  && EXISTING_CLIENT_EMAIL
  && EXISTING_CLIENT_PASSWORD;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY || (!SKIP_ACCOUNT_SETUP && (!ADMIN_EMAIL || !ADMIN_PASSWORD))) {
  console.error("SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, ADMIN_EMAIL, and ADMIN_PASSWORD are required.");
  process.exit(1);
}

const signatureDataUrl =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAEklEQVR42mP8/5+hHgAHggJ/Pk7l6wAAAABJRU5ErkJggg==";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const mealPhotoFixtureBuffer = readFileSync(path.join(__dirname, "fixtures", "nasi-lemak-smoke.jpg"));

const timestamp = Date.now();
const prefix = `qa.nutrition.${timestamp}`;
const coachEmail = SKIP_ACCOUNT_SETUP ? EXISTING_COACH_EMAIL : `${prefix}.coach@legacycoaching.com.my`;
const clientEmail = SKIP_ACCOUNT_SETUP ? EXISTING_CLIENT_EMAIL : `${prefix}.client@legacycoaching.com.my`;
const coachPassword = SKIP_ACCOUNT_SETUP
  ? EXISTING_COACH_PASSWORD
  : String(process.env.QA_COACH_PASSWORD || "").trim() || `QaCoach-${crypto.randomBytes(9).toString("base64url")}`;
const clientPassword = SKIP_ACCOUNT_SETUP
  ? EXISTING_CLIENT_PASSWORD
  : String(process.env.QA_CLIENT_PASSWORD || "").trim() || `QaClient-${crypto.randomBytes(9).toString("base64url")}`;

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
      with target_profiles as (
        select p.id
        from public.profiles p
        join auth.users u on u.id = p.id
        where lower(u.email) like lower('${escapeSql(emailPattern)}')
      )
      delete from public.nutrition_photo_candidates
      where submission_id in (
        select id from public.nutrition_photo_submissions where client_id in (select id from target_profiles)
      );
    `,
    `
      with target_profiles as (
        select p.id
        from public.profiles p
        join auth.users u on u.id = p.id
        where lower(u.email) like lower('${escapeSql(emailPattern)}')
      )
      delete from public.nutrition_photo_assets
      where submission_id in (
        select id from public.nutrition_photo_submissions where client_id in (select id from target_profiles)
      );
    `,
    `
      with target_profiles as (
        select p.id
        from public.profiles p
        join auth.users u on u.id = p.id
        where lower(u.email) like lower('${escapeSql(emailPattern)}')
      )
      delete from public.client_meal_items
      where meal_entry_id in (
        select id from public.client_meal_entries where client_id in (select id from target_profiles)
      );
    `,
    `
      with target_profiles as (
        select p.id
        from public.profiles p
        join auth.users u on u.id = p.id
        where lower(u.email) like lower('${escapeSql(emailPattern)}')
      )
      delete from public.client_meal_entries
      where client_id in (select id from target_profiles);
    `,
    `
      with target_profiles as (
        select p.id
        from public.profiles p
        join auth.users u on u.id = p.id
        where lower(u.email) like lower('${escapeSql(emailPattern)}')
      )
      delete from public.nutrition_photo_submissions
      where client_id in (select id from target_profiles);
    `,
    `
      with target_profiles as (
        select p.id
        from public.profiles p
        join auth.users u on u.id = p.id
        where lower(u.email) like lower('${escapeSql(emailPattern)}')
      )
      delete from public.client_food_recent
      where client_id in (select id from target_profiles);
    `,
    `
      with target_profiles as (
        select p.id
        from public.profiles p
        join auth.users u on u.id = p.id
        where lower(u.email) like lower('${escapeSql(emailPattern)}')
      )
      delete from public.client_food_favorites
      where client_id in (select id from target_profiles);
    `,
    `
      with target_profiles as (
        select p.id
        from public.profiles p
        join auth.users u on u.id = p.id
        where lower(u.email) like lower('${escapeSql(emailPattern)}')
      )
      delete from public.notifications
      where user_id in (select id from target_profiles)
         or lower(title) like lower('${likePattern}')
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

async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data?.session?.access_token || !data?.user?.id) {
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
  const report = {
    prefix,
    accounts: {
      coachEmail,
      clientEmail,
    },
    steps: {},
  };

  if (RUN_CLEANUP) {
    cleanupQaArtifacts();
  }

  try {
    let coachRegistration = { data: { userId: null } };
    if (!SKIP_ACCOUNT_SETUP) {
      const adminSession = await signIn(ADMIN_EMAIL, ADMIN_PASSWORD);
      const adminToken = adminSession.session.access_token;

      const coachCode = await api("/.netlify/functions/manage-activation-codes", {
        token: adminToken,
        method: "POST",
        body: {
          action: "generate",
          role: "coach",
          recipientEmail: coachEmail,
          recipientName: `QA Nutrition Coach ${timestamp}`,
          notes: prefix,
        },
      });
      report.steps.coachActivationCode = { status: coachCode.status, ok: coachCode.ok };
      if (!coachCode.ok) {
        throw new Error(coachCode.data?.error || "Coach activation code generation failed.");
      }

      coachRegistration = await api("/.netlify/functions/register-account", {
        method: "POST",
        body: {
          role: "coach",
          fullName: `QA Nutrition Coach ${timestamp}`,
          email: coachEmail,
          phone: "+601122244401",
          password: coachPassword,
          confirmPassword: coachPassword,
          activationCode: coachCode.data?.code?.code,
          gender: "male",
          dateOfBirth: "1990-07-12",
          icPassportNo: `QANH-${timestamp}`,
          homeAddress: "QA Nutrition Street, Kuala Lumpur",
          emergencyContactName: "QA Emergency Coach",
          emergencyContactPhone: "+601122244402",
          emergencyContactRelationship: "Partner",
          specialty: "Nutrition coaching and adherence support",
          certifications: "Precision Nutrition L1, NASM CPT",
          availabilityNotes: "Weekdays",
          experienceNotes: prefix,
        },
      });
      report.steps.coachRegister = {
        status: coachRegistration.status,
        ok: coachRegistration.ok,
        userId: coachRegistration.data?.userId || null,
      };
      if (!coachRegistration.ok || !coachRegistration.data?.userId) {
        throw new Error(coachRegistration.data?.error || "Coach registration failed.");
      }

      runDbQuery(`
        update public.profiles
        set status = 'active', updated_at = now()
        where id = '${escapeSql(coachRegistration.data.userId)}';
      `);

      const waiver = await api("/.netlify/functions/submit-client-waiver", {
        method: "POST",
        body: {
          fullName: `QA Nutrition Client ${timestamp}`,
          finalDeclarationName: `QA Nutrition Client ${timestamp}`,
          email: clientEmail,
          phone: "+601122244403",
          icPassportNo: `QANC-${timestamp}`,
          dateOfBirth: "1994-03-11",
          age: 32,
          gender: "female",
          occupation: "QA Analyst",
          activityStyle: "desk",
          homeAddress: "QA Nutrition Street, Kuala Lumpur",
          emergencyContactName: "QA Emergency Contact",
          emergencyContactRelationship: "Sibling",
          emergencyContactPhone: "+601122244404",
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

      const clientCode = await api("/.netlify/functions/manage-activation-codes", {
        token: adminToken,
        method: "POST",
        body: {
          action: "generate",
          role: "client",
          recipientEmail: clientEmail,
          recipientName: `QA Nutrition Client ${timestamp}`,
          assignedCoachId: coachRegistration.data.userId,
          notes: prefix,
        },
      });
      report.steps.clientActivationCode = { status: clientCode.status, ok: clientCode.ok };
      if (!clientCode.ok) {
        throw new Error(clientCode.data?.error || "Client activation code generation failed.");
      }

      const clientRegistration = await api("/.netlify/functions/register-account", {
        method: "POST",
        body: {
          role: "client",
          fullName: `QA Nutrition Client ${timestamp}`,
          email: clientEmail,
          phone: "+601122244403",
          password: clientPassword,
          confirmPassword: clientPassword,
          activationCode: clientCode.data?.code?.code,
          waiverSubmissionId: waiver.data?.waiverSubmissionId,
          preferredCoachId: coachRegistration.data.userId,
          gender: "female",
          dateOfBirth: "1994-03-11",
          icPassportNo: `QANC-${timestamp}`,
          homeAddress: "QA Nutrition Street, Kuala Lumpur",
          emergencyContactName: "QA Emergency Contact",
          emergencyContactPhone: "+601122244404",
          emergencyContactRelationship: "Sibling",
          primaryGoal: "Build nutrition consistency",
          activityStyle: "desk",
          preferredName: "QA Nutrition Client",
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
    } else {
      report.steps.accountProvision = {
        ok: true,
        skipped: true,
      };
    }

    const clientSession = await signIn(clientEmail, clientPassword);
    const clientToken = clientSession.session.access_token;
    const clientSupabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${clientToken}`,
        },
      },
    });

    const prepareUpload = await api("/.netlify/functions/prepare-nutrition-photo-upload", {
      token: clientToken,
      method: "POST",
      body: {
        assets: [
          {
            viewTag: "meal",
            fileName: "nasi-lemak-test.jpg",
            contentType: "image/jpeg",
          },
        ],
      },
    });
    report.steps.prepareUpload = {
      status: prepareUpload.status,
      ok: prepareUpload.ok,
      assetCount: Array.isArray(prepareUpload.data?.assets) ? prepareUpload.data.assets.length : 0,
    };
    if (!prepareUpload.ok || !prepareUpload.data?.assets?.length) {
      throw new Error(prepareUpload.data?.error || "Nutrition photo upload preparation failed.");
    }

    const uploadAsset = prepareUpload.data.assets[0];
    const uploadResult = await clientSupabase.storage
      .from(prepareUpload.data.bucket || "client-meal-photos")
      .uploadToSignedUrl(uploadAsset.path || uploadAsset.storagePath, uploadAsset.token, new Blob([mealPhotoFixtureBuffer], { type: "image/jpeg" }), {
        contentType: "image/jpeg",
        upsert: false,
      });
    report.steps.photoUpload = {
      ok: !uploadResult.error,
      error: uploadResult.error?.message || null,
    };
    if (uploadResult.error) {
      throw uploadResult.error;
    }

    const submitPhoto = await api("/.netlify/functions/submit-nutrition-photo-log", {
      token: clientToken,
      method: "POST",
      body: {
        logDate: new Date().toISOString().slice(0, 10),
        mealType: "lunch",
        mealTitle: "Nasi lemak with fried chicken",
        clientNote: "Sambal on the side and olive oil used for the chicken instead of coconut oil.",
        correctionNote: "",
        bucket: prepareUpload.data.bucket || "client-meal-photos",
        assets: [
          {
            viewTag: uploadAsset.viewTag,
            storagePath: uploadAsset.storagePath || uploadAsset.path,
            fileName: uploadAsset.fileName,
            contentType: uploadAsset.contentType,
            sortOrder: 0,
          },
        ],
      },
    });
    report.steps.submitPhoto = {
      status: submitPhoto.status,
      ok: submitPhoto.ok,
      submissionId: submitPhoto.data?.submission?.id || null,
      candidateCount: Array.isArray(submitPhoto.data?.candidates) ? submitPhoto.data.candidates.length : 0,
      provider: submitPhoto.data?.submission?.ai_provider || null,
      confidenceBand: submitPhoto.data?.submission?.confidence_band || null,
      providerMetadata: submitPhoto.data?.submission?.metadata?.providerMetadata || null,
    };
    if (!submitPhoto.ok || !submitPhoto.data?.submission?.id) {
      throw new Error(submitPhoto.data?.error || "Nutrition photo submission failed.");
    }

    const rerunPhoto = await api("/.netlify/functions/save-nutrition-photo-corrections", {
      token: clientToken,
      method: "POST",
      body: {
        submissionId: submitPhoto.data.submission.id,
        correctionNote: "Half rice, extra cucumber, no peanuts.",
      },
    });
    report.steps.rerunPhoto = {
      status: rerunPhoto.status,
      ok: rerunPhoto.ok,
      candidateCount: Array.isArray(rerunPhoto.data?.candidates) ? rerunPhoto.data.candidates.length : 0,
      confidenceBand: rerunPhoto.data?.submission?.confidence_band || null,
      provider: rerunPhoto.data?.submission?.ai_provider || null,
      providerMetadata: rerunPhoto.data?.submission?.metadata?.providerMetadata || null,
    };
    if (!rerunPhoto.ok) {
      throw new Error(rerunPhoto.data?.error || "Nutrition photo correction rerun failed.");
    }

    const selectedCandidates = (rerunPhoto.data?.candidates || []).filter((candidate) => candidate.food_id).slice(0, 2);
    if (!selectedCandidates.length) {
      throw new Error("Nutrition photo candidates were generated, but none mapped to a food library item.");
    }

    const saveMeal = await api("/.netlify/functions/save-client-meal-entry", {
      token: clientToken,
      method: "POST",
      body: {
        logDate: new Date().toISOString().slice(0, 10),
        mealType: "lunch",
        title: "Nasi lemak lunch",
        note: "Built from nutrition photo smoke test.",
        sourceType: "nutrition_photo",
        nutritionPhotoSubmissionId: submitPhoto.data.submission.id,
        items: selectedCandidates.map((candidate, index) => ({
          foodId: candidate.food_id,
          servingId: candidate.serving_id,
          quantity: candidate.suggested_quantity || 1,
          grams: candidate.suggested_grams || 100,
          note: candidate.note || "",
          sortOrder: index,
        })),
      },
    });
    report.steps.saveMeal = {
      status: saveMeal.status,
      ok: saveMeal.ok,
      mealEntryId: saveMeal.data?.mealEntry?.id || null,
      mealItems: Array.isArray(saveMeal.data?.mealItems) ? saveMeal.data.mealItems.length : 0,
      syncedNutritionLogId: saveMeal.data?.nutritionLog?.id || null,
    };
    if (!saveMeal.ok || !saveMeal.data?.mealEntry?.id) {
      throw new Error(saveMeal.data?.error || "Saving meal entry from photo candidates failed.");
    }

    const clientPlanner = await api("/.netlify/functions/load-planner-data", {
      token: clientToken,
    });
    report.steps.clientPlanner = {
      status: clientPlanner.status,
      ok: clientPlanner.ok,
      hasSubmission: Boolean((clientPlanner.data?.data?.nutritionPhotoSubmissions || []).find((item) => item.id === submitPhoto.data.submission.id)),
      hasMealEntry: Boolean((clientPlanner.data?.data?.mealEntries || []).find((item) => item.id === saveMeal.data.mealEntry.id)),
    };
    if (!clientPlanner.ok) {
      throw new Error(clientPlanner.data?.error || "Client planner load failed.");
    }

    await supabase.auth.signOut().catch(() => null);

    const coachSession = await signIn(coachEmail, coachPassword);
    const coachToken = coachSession.session.access_token;

    const coachPlanner = await api("/.netlify/functions/load-planner-data", {
      token: coachToken,
    });
    const coachSubmission = (coachPlanner.data?.data?.nutritionPhotoSubmissions || []).find(
      (item) => item.id === submitPhoto.data.submission.id
    );
    report.steps.coachPlanner = {
      status: coachPlanner.status,
      ok: coachPlanner.ok,
      hasSubmission: Boolean(coachSubmission),
      reviewStatus: coachSubmission?.review_status || null,
    };
    if (!coachPlanner.ok || !coachSubmission) {
      throw new Error(coachPlanner.data?.error || "Coach planner did not surface the nutrition photo submission.");
    }

    const reviewSubmission = await api("/.netlify/functions/review-planner-submission", {
      token: coachToken,
      method: "POST",
      body: {
        type: "nutrition_photo",
        submissionId: submitPhoto.data.submission.id,
        decision: "approved",
        coachNote: "Looks good. Logged meal linked and approved.",
      },
    });
    report.steps.reviewSubmission = {
      status: reviewSubmission.status,
      ok: reviewSubmission.ok,
      reviewStatus: reviewSubmission.data?.submission?.review_status || null,
    };
    if (!reviewSubmission.ok) {
      throw new Error(reviewSubmission.data?.error || "Coach review of nutrition photo failed.");
    }

    const coachPlannerAfter = await api("/.netlify/functions/load-planner-data?refresh=1", {
      token: coachToken,
    });
    const refreshedClientSession = await signIn(clientEmail, clientPassword);
    const refreshedClientToken = refreshedClientSession.session.access_token;
    const clientPlannerAfter = await api("/.netlify/functions/load-planner-data?refresh=1", {
      token: refreshedClientToken,
    });
    const coachSubmissionAfter = (coachPlannerAfter.data?.data?.nutritionPhotoSubmissions || []).find(
      (item) => item.id === submitPhoto.data.submission.id
    );
    const clientSubmissionAfter = (clientPlannerAfter.data?.data?.nutritionPhotoSubmissions || []).find(
      (item) => item.id === submitPhoto.data.submission.id
    );
    report.steps.postReviewRefresh = {
      coachStatus: coachPlannerAfter.status,
      clientStatus: clientPlannerAfter.status,
      coachReviewStatus: coachSubmissionAfter?.review_status || null,
      clientReviewStatus: clientSubmissionAfter?.review_status || null,
    };

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
      } catch (_) {
        // Best-effort only.
      }
    }
    await supabase.auth.signOut().catch(() => null);
  }
}

main().catch((error) => {
  console.error(error?.message || error);
  process.exit(1);
});
