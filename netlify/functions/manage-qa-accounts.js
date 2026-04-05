const crypto = require("node:crypto");

const { json, methodNotAllowed, noContent } = require("./_lib/http");
const {
  createHttpError,
  parseBody,
  requireAllowedRole,
  throwOnError,
} = require("./_lib/planner");
const { getAuthenticatedProfile, getServiceSupabase } = require("./_lib/supabase");

const DEFAULT_QA_COACH_EMAIL = String(process.env.QA_COACH_EMAIL || "qa.coach@legacycoaching.com.my").trim().toLowerCase();
const DEFAULT_QA_CLIENT_EMAIL = String(process.env.QA_CLIENT_EMAIL || "qa.client@legacycoaching.com.my").trim().toLowerCase();

function randomPassword(prefix) {
  return `${prefix}-${crypto.randomBytes(10).toString("base64url")}`;
}

function normalizeEmail(value, fallback) {
  const email = String(value || fallback || "").trim().toLowerCase();
  if (!email || !email.includes("@")) {
    throw createHttpError(400, "Provide a valid QA account email address.");
  }
  return email;
}

function normalizePassword(value, prefix) {
  const raw = String(value || "").trim();
  return raw || randomPassword(prefix);
}

function buildQaClientMemberId(email, existingMemberId = "") {
  const current = String(existingMemberId || "").trim();
  if (current) {
    return current;
  }
  const hash = crypto.createHash("sha1").update(String(email || "").trim().toLowerCase()).digest("hex").slice(0, 8).toUpperCase();
  return `LC-QA-${hash}`;
}

function buildCoachMetadata() {
  return {
    role: "coach",
    status: "active",
    display_name: "LEGACY QA Coach",
    full_name: "LEGACY QA Coach",
    phone: "+601100000901",
  };
}

function buildClientMetadata() {
  return {
    role: "client",
    status: "active",
    display_name: "LEGACY QA Client",
    full_name: "LEGACY QA Client",
    phone: "+601100000902",
  };
}

async function listAuthUsersFresh(supabase) {
  const users = [];
  const perPage = 200;
  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage,
    });
    if (error) {
      throw error;
    }
    const chunk = Array.isArray(data?.users) ? data.users : [];
    users.push(...chunk);
    if (chunk.length < perPage) {
      break;
    }
  }
  return users;
}

async function findAuthUserByEmail(supabase, email) {
  const target = String(email || "").trim().toLowerCase();
  if (!target) {
    return null;
  }

  const users = await listAuthUsersFresh(supabase);
  return users.find((user) => String(user.email || "").trim().toLowerCase() === target) || null;
}

async function cleanupQaArtifactsForEmails(supabase, emails) {
  const normalizedEmails = Array.from(
    new Set((emails || []).map((value) => String(value || "").trim().toLowerCase()).filter(Boolean))
  );

  if (!normalizedEmails.length) {
    return;
  }

  const waiverCleanup = await supabase
    .from("client_waiver_submissions")
    .delete()
    .in("email", normalizedEmails);
  if (waiverCleanup.error) {
    throw waiverCleanup.error;
  }

  const activationCleanup = await supabase
    .from("activation_codes")
    .delete()
    .in("recipient_email", normalizedEmails);
  if (activationCleanup.error) {
    throw activationCleanup.error;
  }
}

async function ensureQaCoachAccount(supabase, actorId, coachEmail, coachPassword) {
  const existingCoach = await findAuthUserByEmail(supabase, coachEmail);
  const metadata = buildCoachMetadata();
  const authPayload = {
    email: coachEmail,
    password: coachPassword,
    email_confirm: true,
    user_metadata: metadata,
    app_metadata: {
      role: "coach",
      status: "active",
      qaAccount: true,
    },
  };

  const authResponse = existingCoach?.id
    ? await supabase.auth.admin.updateUserById(existingCoach.id, authPayload)
    : await supabase.auth.admin.createUser(authPayload);

  if (authResponse.error || !authResponse.data?.user?.id) {
    throw authResponse.error || new Error("Unable to provision the QA coach account.");
  }

  const coachId = authResponse.data.user.id;
  const nowIso = new Date().toISOString();

  const [profileUpsert, coachProfileUpsert, availabilityReset, availabilityInsert] = await Promise.all([
    supabase.from("profiles").upsert(
      {
        id: coachId,
        role: "coach",
        display_name: metadata.display_name,
        phone: metadata.phone,
        status: "active",
        updated_at: nowIso,
      },
      { onConflict: "id" }
    ),
    supabase.from("coach_profiles").upsert(
      {
        id: coachId,
        gender: "male",
        date_of_birth: "1991-07-12",
        home_address: "LEGACY QA Operations, Kuala Lumpur",
        emergency_contact_name: "QA Support",
        emergency_contact_phone: "+601100000911",
        emergency_contact_relationship: "Team",
        specialty: "App regression validation and workflow testing",
        certifications: "Internal QA profile",
        availability_notes: "Reserved for production-safe coach-side validation.",
        ic_passport_no: "LC-QA-COACH-001",
        notes: "Stable QA coach account for app walkthroughs, smoke tests, and regression checks.",
        commission_tier: "standard",
        commission_rate: 0.1,
        position_code: "partner_full_time",
        hours_minimum: 40,
        hours_target: 80,
        updated_at: nowIso,
      },
      { onConflict: "id" }
    ),
    supabase.from("coach_availability_windows").delete().eq("coach_id", coachId),
    Promise.resolve(null),
  ]);

  throwOnError(profileUpsert, "Unable to update the QA coach profile.");
  throwOnError(coachProfileUpsert, "Unable to update the QA coach details.");
  throwOnError(availabilityReset, "Unable to clear existing QA coach availability.");

  const availabilityCreate = await supabase.from("coach_availability_windows").upsert(
    [
      {
        coach_id: coachId,
        day_of_week: 1,
        start_time: "09:00",
        end_time: "18:00",
        timezone: "Asia/Kuala_Lumpur",
        is_active: true,
        updated_at: nowIso,
      },
      {
        coach_id: coachId,
        day_of_week: 3,
        start_time: "09:00",
        end_time: "18:00",
        timezone: "Asia/Kuala_Lumpur",
        is_active: true,
        updated_at: nowIso,
      },
      {
        coach_id: coachId,
        day_of_week: 5,
        start_time: "09:00",
        end_time: "18:00",
        timezone: "Asia/Kuala_Lumpur",
        is_active: true,
        updated_at: nowIso,
      },
    ],
    { onConflict: "coach_id,day_of_week,start_time,end_time" }
  );
  throwOnError(availabilityCreate, "Unable to save QA coach availability.");

  return {
    id: coachId,
    email: coachEmail,
    password: coachPassword,
    createdBy: actorId,
    existed: Boolean(existingCoach?.id),
  };
}

async function ensureQaClientAccount(supabase, actorId, clientEmail, clientPassword, coachId) {
  const existingClient = await findAuthUserByEmail(supabase, clientEmail);
  const metadata = buildClientMetadata();
  const authPayload = {
    email: clientEmail,
    password: clientPassword,
    email_confirm: true,
    user_metadata: metadata,
    app_metadata: {
      role: "client",
      status: "active",
      qaAccount: true,
    },
  };

  const authResponse = existingClient?.id
    ? await supabase.auth.admin.updateUserById(existingClient.id, authPayload)
    : await supabase.auth.admin.createUser(authPayload);

  if (authResponse.error || !authResponse.data?.user?.id) {
    throw authResponse.error || new Error("Unable to provision the QA client account.");
  }

  const clientId = authResponse.data.user.id;
  const nowIso = new Date().toISOString();

  const existingClientProfileResponse = await supabase
    .from("client_profiles")
    .select("member_id")
    .eq("id", clientId)
    .maybeSingle();
  throwOnError(existingClientProfileResponse, "Unable to inspect the QA client membership record.");

  const memberId = buildQaClientMemberId(clientEmail, existingClientProfileResponse.data?.member_id || "");

  const [profileUpsert, clientProfileUpsert, otherAssignmentsReset] = await Promise.all([
    supabase.from("profiles").upsert(
      {
        id: clientId,
        role: "client",
        display_name: metadata.display_name,
        phone: metadata.phone,
        status: "active",
        updated_at: nowIso,
      },
      { onConflict: "id" }
    ),
    supabase.from("client_profiles").upsert(
      {
        id: clientId,
        member_id: memberId,
        preferred_name: "QA Client",
        primary_goal: "Validate live client workflows safely without using production member accounts.",
        onboarding_status: "active",
        gender: "female",
        date_of_birth: "1994-03-11",
        home_address: "LEGACY QA Operations, Kuala Lumpur",
        emergency_contact_name: "QA Support",
        emergency_contact_phone: "+601100000912",
        emergency_contact_relationship: "Team",
        medical_notes: "None",
        preferred_coach_id: coachId,
        occupation: "QA Analyst",
        activity_style: "desk",
        ic_passport_no: "LC-QA-CLIENT-001",
        updated_at: nowIso,
      },
      { onConflict: "id" }
    ),
    supabase
      .from("coach_client_assignments")
      .update({
        status: "inactive",
        ended_at: nowIso,
        notes: "Superseded during QA account reprovision.",
      })
      .eq("client_id", clientId)
      .neq("coach_id", coachId)
      .eq("status", "active"),
  ]);

  throwOnError(profileUpsert, "Unable to update the QA client profile.");
  throwOnError(clientProfileUpsert, "Unable to update the QA client details.");
  throwOnError(otherAssignmentsReset, "Unable to reset previous QA coach links.");

  const existingActiveAssignmentResponse = await supabase
    .from("coach_client_assignments")
    .select("id")
    .eq("coach_id", coachId)
    .eq("client_id", clientId)
    .eq("status", "active")
    .limit(1);
  throwOnError(existingActiveAssignmentResponse, "Unable to inspect the QA coach-client assignment.");

  const existingActiveAssignment = Array.isArray(existingActiveAssignmentResponse.data)
    ? existingActiveAssignmentResponse.data[0] || null
    : null;

  const assignmentResult = existingActiveAssignment?.id
    ? await supabase
        .from("coach_client_assignments")
        .update({
          assigned_at: nowIso,
          ended_at: null,
          created_by: actorId,
          notes: "Assigned during QA account provisioning.",
        })
        .eq("id", existingActiveAssignment.id)
    : await supabase.from("coach_client_assignments").insert({
        coach_id: coachId,
        client_id: clientId,
        status: "active",
        assigned_at: nowIso,
        created_by: actorId,
        notes: "Assigned during QA account provisioning.",
      });

  throwOnError(assignmentResult, "Unable to link the QA client to the QA coach.");

  return {
    id: clientId,
    email: clientEmail,
    password: clientPassword,
    coachId,
    createdBy: actorId,
    existed: Boolean(existingClient?.id),
    memberId,
  };
}

async function getQaAccountStatus(supabase, coachEmail, clientEmail) {
  const [coachUser, clientUser] = await Promise.all([
    findAuthUserByEmail(supabase, coachEmail),
    findAuthUserByEmail(supabase, clientEmail),
  ]);

  const profileIds = [coachUser?.id, clientUser?.id].filter(Boolean);
  const [profilesResponse, coachProfileResponse, clientProfileResponse, assignmentResponse] = await Promise.all([
    profileIds.length
      ? supabase.from("profiles").select("id, role, display_name, status, created_at, updated_at").in("id", profileIds)
      : Promise.resolve({ data: [], error: null }),
    coachUser?.id
      ? supabase
          .from("coach_profiles")
          .select("id, specialty, commission_tier, coach_identifier, updated_at")
          .eq("id", coachUser.id)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    clientUser?.id
      ? supabase
          .from("client_profiles")
          .select("id, member_id, preferred_name, primary_goal, preferred_coach_id, updated_at")
          .eq("id", clientUser.id)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    coachUser?.id && clientUser?.id
      ? supabase
          .from("coach_client_assignments")
          .select("id, status, assigned_at, ended_at, notes")
          .eq("coach_id", coachUser.id)
          .eq("client_id", clientUser.id)
          .order("assigned_at", { ascending: false })
          .limit(1)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);

  throwOnError(profilesResponse, "Unable to load QA account profiles.");
  throwOnError(coachProfileResponse, "Unable to load QA coach details.");
  throwOnError(clientProfileResponse, "Unable to load QA client details.");
  throwOnError(assignmentResponse, "Unable to load QA assignment status.");

  const profilesById = new Map((profilesResponse.data || []).map((row) => [row.id, row]));
  const coachProfile = profilesById.get(coachUser?.id) || null;
  const clientProfile = profilesById.get(clientUser?.id) || null;
  const assignment = assignmentResponse.data || null;

  return {
    defaults: {
      coachEmail,
      clientEmail,
    },
    coach: {
      exists: Boolean(coachUser?.id),
      id: coachUser?.id || "",
      email: coachEmail,
      role: coachProfile?.role || "",
      profileStatus: coachProfile?.status || "",
      displayName: coachProfile?.display_name || "",
      createdAt: coachProfile?.created_at || coachUser?.created_at || "",
      updatedAt: coachProfile?.updated_at || coachProfileResponse.data?.updated_at || "",
      emailConfirmedAt: coachUser?.email_confirmed_at || "",
      specialty: coachProfileResponse.data?.specialty || "",
      commissionTier: coachProfileResponse.data?.commission_tier || "",
      coachIdentifier: coachProfileResponse.data?.coach_identifier || "",
    },
    client: {
      exists: Boolean(clientUser?.id),
      id: clientUser?.id || "",
      email: clientEmail,
      role: clientProfile?.role || "",
      profileStatus: clientProfile?.status || "",
      displayName: clientProfile?.display_name || "",
      createdAt: clientProfile?.created_at || clientUser?.created_at || "",
      updatedAt: clientProfile?.updated_at || clientProfileResponse.data?.updated_at || "",
      emailConfirmedAt: clientUser?.email_confirmed_at || "",
      preferredName: clientProfileResponse.data?.preferred_name || "",
      memberId: clientProfileResponse.data?.member_id || "",
      primaryGoal: clientProfileResponse.data?.primary_goal || "",
      preferredCoachId: clientProfileResponse.data?.preferred_coach_id || "",
    },
    assignment: {
      exists: Boolean(assignment?.id),
      id: assignment?.id || "",
      status: assignment?.status || "",
      assignedAt: assignment?.assigned_at || "",
      endedAt: assignment?.ended_at || "",
      notes: assignment?.notes || "",
      linked: Boolean(assignment?.id) && assignment?.status === "active",
    },
  };
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return noContent({ "Cache-Control": "no-store" });
  }

  if (!["GET", "POST"].includes(event.httpMethod)) {
    return methodNotAllowed("GET, POST, OPTIONS");
  }

  const supabase = getServiceSupabase();
  const access = await getAuthenticatedProfile(event, supabase);
  if (!access?.profile) {
    return json(401, { error: "A valid authenticated session is required." }, { "Cache-Control": "no-store" });
  }

  try {
    requireAllowedRole(access.profile, ["super_admin"]);

    const body = event.httpMethod === "POST" ? parseBody(event) : null;
    const query = event.queryStringParameters || {};
    if (event.httpMethod === "POST" && !body) {
      return json(400, { error: "Provide a valid JSON body." }, { "Cache-Control": "no-store" });
    }

    const coachEmail = normalizeEmail(query.coachEmail || body?.coachEmail, DEFAULT_QA_COACH_EMAIL);
    const clientEmail = normalizeEmail(query.clientEmail || body?.clientEmail, DEFAULT_QA_CLIENT_EMAIL);

    if (coachEmail === clientEmail) {
      throw createHttpError(400, "QA coach and QA client must use different email addresses.");
    }

    if (event.httpMethod === "GET") {
      const status = await getQaAccountStatus(supabase, coachEmail, clientEmail);
      return json(200, { ok: true, status }, { "Cache-Control": "no-store" });
    }

    const coachPassword = normalizePassword(body?.coachPassword, "QaCoach");
    const clientPassword = normalizePassword(body?.clientPassword, "QaClient");

    await cleanupQaArtifactsForEmails(supabase, [coachEmail, clientEmail]);

    const coachAccount = await ensureQaCoachAccount(supabase, access.profile.id, coachEmail, coachPassword);
    const clientAccount = await ensureQaClientAccount(supabase, access.profile.id, clientEmail, clientPassword, coachAccount.id);
    const status = await getQaAccountStatus(supabase, coachEmail, clientEmail);

    return json(
      200,
      {
        ok: true,
        message: "QA coach and client accounts are live and linked.",
        status,
        credentials: {
          coach: {
            email: coachAccount.email,
            password: coachAccount.password,
          },
          client: {
            email: clientAccount.email,
            password: clientAccount.password,
          },
        },
      },
      { "Cache-Control": "no-store" }
    );
  } catch (error) {
    return json(
      Number(error?.statusCode || 500),
      { error: error?.message || "Unable to manage QA accounts right now." },
      { "Cache-Control": "no-store" }
    );
  }
};
