const { json, methodNotAllowed, noContent } = require("./_lib/http");
const { getAuthenticatedProfile, getEmailMapForUserIds, getServiceSupabase } = require("./_lib/supabase");

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function normalizeRole(value, allowAll = false) {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "client" || normalized === "coach") {
    return normalized;
  }
  return allowAll ? "all" : "";
}

function text(value, fallback = "—") {
  const normalized = String(value ?? "").trim();
  return normalized || fallback;
}

function numberText(value, fallback = "—") {
  return Number.isFinite(Number(value)) ? String(value) : fallback;
}

function yesNo(value, fallback = "—") {
  if (value === true) return "Yes";
  if (value === false) return "No";
  return fallback;
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return text(value);
  }
  return new Intl.DateTimeFormat("en-MY", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return text(value);
  }
  return new Intl.DateTimeFormat("en-MY", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kuala_Lumpur",
  }).format(date);
}

function buildField(label, value) {
  return {
    label,
    value: text(value),
  };
}

function buildWaiverLookup(waivers) {
  const byId = new Map();
  const byClientId = new Map();

  (waivers || []).forEach((waiver) => {
    if (waiver?.id) {
      byId.set(waiver.id, waiver);
    }
    if (waiver?.client_id) {
      if (!byClientId.has(waiver.client_id)) {
        byClientId.set(waiver.client_id, []);
      }
      byClientId.get(waiver.client_id).push(waiver);
    }
  });

  byClientId.forEach((rows, key) => {
    rows.sort((left, right) => new Date(right.created_at || 0).getTime() - new Date(left.created_at || 0).getTime());
    byClientId.set(key, rows);
  });

  return { byId, byClientId };
}

function buildAssignmentLookup(assignments) {
  const activeByClientId = new Map();
  const activeByCoachId = new Map();

  (assignments || [])
    .filter((assignment) => assignment?.status === "active")
    .forEach((assignment) => {
      if (assignment.client_id && !activeByClientId.has(assignment.client_id)) {
        activeByClientId.set(assignment.client_id, assignment);
      }
      if (assignment.coach_id) {
        if (!activeByCoachId.has(assignment.coach_id)) {
          activeByCoachId.set(assignment.coach_id, []);
        }
        activeByCoachId.get(assignment.coach_id).push(assignment);
      }
    });

  return { activeByClientId, activeByCoachId };
}

function buildSummaryRecord({ profile, emailMap, clientProfile, coachProfile, waiver, assignment, coachById }) {
  const email = emailMap.get(profile.id) || "";
  const preferredCoachName = assignment?.coach_id ? coachById.get(assignment.coach_id)?.display_name || "" : "";
  const name = clientProfile?.preferred_name || profile.display_name || email || "Account";

  if (profile.role === "client") {
    return {
      id: profile.id,
      role: "client",
      displayName: name,
      email,
      phone: profile.phone || "",
      status: profile.status || "active",
      createdAt: profile.created_at || clientProfile?.created_at || "",
      updatedAt: profile.updated_at || clientProfile?.updated_at || "",
      memberId: clientProfile?.member_id || "",
      primaryGoal: clientProfile?.primary_goal || "",
      preferredCoachName: preferredCoachName || "",
      waiverSubmissionId: clientProfile?.waiver_submission_id || waiver?.id || "",
      waiverSignedAt: clientProfile?.waiver_signed_at || waiver?.signature_signed_at || "",
      hasWaiver: Boolean(clientProfile?.waiver_submission_id || waiver?.id),
    };
  }

  return {
    id: profile.id,
    role: "coach",
    displayName: profile.display_name || email || "Coach",
    email,
    phone: profile.phone || "",
    status: profile.status || "active",
    createdAt: profile.created_at || coachProfile?.created_at || "",
    updatedAt: profile.updated_at || coachProfile?.updated_at || "",
    positionCode: coachProfile?.position_code || "",
    commissionTier: coachProfile?.commission_tier || "",
    specialty: coachProfile?.specialty || "",
    certifications: coachProfile?.certifications || "",
    hasWaiver: false,
  };
}

async function loadAccountIndex(supabase, roleFilter) {
  const [
    profilesResponse,
    clientProfilesResponse,
    coachProfilesResponse,
    waiversResponse,
    assignmentsResponse,
  ] = await Promise.all([
    roleFilter === "all"
      ? supabase
          .from("profiles")
          .select("id, role, display_name, phone, status, created_at, updated_at")
          .in("role", ["client", "coach"])
          .order("created_at", { ascending: true })
      : supabase
          .from("profiles")
          .select("id, role, display_name, phone, status, created_at, updated_at")
          .eq("role", roleFilter)
          .order("created_at", { ascending: true }),
    supabase
      .from("client_profiles")
      .select("id, member_id, preferred_name, primary_goal, preferred_coach_id, waiver_submission_id, waiver_signed_at, created_at, updated_at"),
    supabase
      .from("coach_profiles")
      .select("id, position_code, commission_tier, specialty, certifications, created_at, updated_at"),
    supabase
      .from("client_waiver_submissions")
      .select("id, client_id, email, signature_signed_at, created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("coach_client_assignments")
      .select("id, coach_id, client_id, status, assigned_at")
      .eq("status", "active")
      .order("assigned_at", { ascending: false }),
  ]);

  [profilesResponse, clientProfilesResponse, coachProfilesResponse, waiversResponse, assignmentsResponse].forEach((response) => {
    if (response?.error) {
      throw response.error;
    }
  });

  const profiles = profilesResponse.data || [];
  const clientProfiles = new Map((clientProfilesResponse.data || []).map((row) => [row.id, row]));
  const coachProfiles = new Map((coachProfilesResponse.data || []).map((row) => [row.id, row]));
  const coachById = new Map(
    profiles
      .filter((profile) => profile.role === "coach")
      .map((profile) => [profile.id, profile])
  );
  const waiverLookup = buildWaiverLookup(waiversResponse.data || []);
  const assignmentLookup = buildAssignmentLookup(assignmentsResponse.data || []);
  const emailMap = await getEmailMapForUserIds(supabase, profiles.map((profile) => profile.id));

  const records = profiles
    .map((profile) =>
      buildSummaryRecord({
        profile,
        emailMap,
        clientProfile: clientProfiles.get(profile.id) || null,
        coachProfile: coachProfiles.get(profile.id) || null,
        waiver:
          waiverLookup.byId.get(clientProfiles.get(profile.id)?.waiver_submission_id || "")
          || (waiverLookup.byClientId.get(profile.id) || [])[0]
          || null,
        assignment: assignmentLookup.activeByClientId.get(profile.id) || null,
        coachById,
      })
    )
    .sort((left, right) => {
      if (left.role !== right.role) {
        return left.role.localeCompare(right.role);
      }
      return String(left.displayName || "").localeCompare(String(right.displayName || ""));
    });

  return records;
}

async function loadClientRecordDetail(supabase, accountId, profile, email) {
  const [
    clientProfileResponse,
    assignmentsResponse,
    activationCodesResponse,
  ] = await Promise.all([
    supabase
      .from("client_profiles")
      .select("*")
      .eq("id", accountId)
      .maybeSingle(),
    supabase
      .from("coach_client_assignments")
      .select("id, coach_id, client_id, status, assigned_at, ended_at, created_by, notes")
      .eq("client_id", accountId)
      .order("assigned_at", { ascending: false }),
    supabase
      .from("activation_codes")
      .select("id, role, code, recipient_email, recipient_name, assigned_coach_id, status, expires_at, used_at, created_at")
      .eq("used_by", accountId)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  [clientProfileResponse, assignmentsResponse, activationCodesResponse].forEach((response) => {
    if (response?.error) {
      throw response.error;
    }
  });

  const clientProfile = clientProfileResponse.data || null;
  const assignments = assignmentsResponse.data || [];

  const coachIds = Array.from(new Set(assignments.map((assignment) => assignment.coach_id).filter(Boolean)));
  const coachesResponse = coachIds.length
    ? await supabase.from("profiles").select("id, display_name").in("id", coachIds)
    : { data: [], error: null };
  if (coachesResponse.error) {
    throw coachesResponse.error;
  }
  const coachById = new Map((coachesResponse.data || []).map((coach) => [coach.id, coach]));

  let waiver = null;
  if (clientProfile?.waiver_submission_id) {
    const linkedWaiverResponse = await supabase
      .from("client_waiver_submissions")
      .select("*")
      .eq("id", clientProfile.waiver_submission_id)
      .maybeSingle();
    if (linkedWaiverResponse.error) {
      throw linkedWaiverResponse.error;
    }
    waiver = linkedWaiverResponse.data || null;
  }

  if (!waiver) {
    const fallbackWaiverResponse = await supabase
      .from("client_waiver_submissions")
      .select("*")
      .eq("client_id", accountId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (fallbackWaiverResponse.error) {
      throw fallbackWaiverResponse.error;
    }
    waiver = fallbackWaiverResponse.data || null;
  }

  if (!waiver && email) {
    const emailWaiverResponse = await supabase
      .from("client_waiver_submissions")
      .select("*")
      .ilike("email", email)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (emailWaiverResponse.error) {
      throw emailWaiverResponse.error;
    }
    waiver = emailWaiverResponse.data || null;
  }

  const activeAssignment = assignments.find((assignment) => assignment.status === "active") || null;
  const assignedCoachName = activeAssignment?.coach_id ? coachById.get(activeAssignment.coach_id)?.display_name || "" : "";
  const latestActivationCode = (activationCodesResponse.data || [])[0] || null;

  return {
    id: accountId,
    role: "client",
    displayName: clientProfile?.preferred_name || profile.display_name || email || "Client",
    email,
    phone: profile.phone || "",
    status: profile.status || "active",
    signatureDataUrl: waiver?.signature_data_url || "",
    sections: {
      account: [
        buildField("Full name", profile.display_name || waiver?.full_name || ""),
        buildField("Preferred name", clientProfile?.preferred_name || ""),
        buildField("Email", email || waiver?.email || ""),
        buildField("Phone", profile.phone || waiver?.phone || ""),
        buildField("Role", "Client"),
        buildField("Status", profile.status || "active"),
        buildField("Member ID", clientProfile?.member_id || ""),
        buildField("Created", formatDateTime(profile.created_at || clientProfile?.created_at)),
        buildField("Updated", formatDateTime(profile.updated_at || clientProfile?.updated_at)),
      ],
      registration: [
        buildField("Primary goal", clientProfile?.primary_goal || ""),
        buildField("Gender", clientProfile?.gender || waiver?.gender || ""),
        buildField("Date of birth", formatDate(clientProfile?.date_of_birth || waiver?.date_of_birth)),
        buildField("NRIC / Passport", clientProfile?.ic_passport_no || waiver?.ic_passport_no || ""),
        buildField("Home address", clientProfile?.home_address || waiver?.home_address || ""),
        buildField("Occupation", clientProfile?.occupation || waiver?.occupation || ""),
        buildField("Typical activity", clientProfile?.activity_style || waiver?.activity_style || ""),
        buildField("Emergency contact", clientProfile?.emergency_contact_name || waiver?.emergency_contact_name || ""),
        buildField("Emergency relationship", clientProfile?.emergency_contact_relationship || waiver?.emergency_contact_relationship || ""),
        buildField("Emergency phone", clientProfile?.emergency_contact_phone || waiver?.emergency_contact_phone || ""),
        buildField("Medical notes", clientProfile?.medical_notes || ""),
        buildField("Preferred coach", assignedCoachName || ""),
      ],
      waiver: waiver
        ? [
            buildField("Waiver ID", waiver.id),
            buildField("Signed at", formatDateTime(waiver.signature_signed_at)),
            buildField("Declaration name", waiver.final_declaration_name),
            buildField("Witness", waiver.witness_name || waiver.witness_signature_name || ""),
            buildField("PDPA consent", yesNo(waiver.pdpa_consent)),
            buildField("Media consent", waiver.media_consent || ""),
            buildField("PAR-Q explanation", waiver.parq_explanation || ""),
            buildField("Injury notes", waiver.injury_notes || ""),
            buildField("Surgery notes", waiver.surgery_notes || ""),
            buildField("Medication notes", waiver.medication_notes || ""),
            buildField("Supplements", waiver.supplements || ""),
            buildField("Allergies", waiver.allergies || ""),
            buildField("Pregnancy status", waiver.pregnancy_status || ""),
          ]
        : [],
      audit: [
        buildField("Activation code used", latestActivationCode?.code || ""),
        buildField("Activation code created", formatDateTime(latestActivationCode?.created_at)),
        buildField("Activation code used at", formatDateTime(latestActivationCode?.used_at)),
        buildField("Current assignment", activeAssignment ? `${assignedCoachName || "Coach"} • ${formatDateTime(activeAssignment.assigned_at)}` : "Unassigned"),
        buildField("Assignment notes", activeAssignment?.notes || ""),
      ],
    },
    raw: {
      profile,
      clientProfile,
      waiver,
      assignments,
      activationCodes: activationCodesResponse.data || [],
      coaches: coachesResponse.data || [],
    },
  };
}

async function loadCoachRecordDetail(supabase, accountId, profile, email) {
  const [
    coachProfileResponse,
    assignmentsResponse,
    activationCodesResponse,
  ] = await Promise.all([
    supabase
      .from("coach_profiles")
      .select("*")
      .eq("id", accountId)
      .maybeSingle(),
    supabase
      .from("coach_client_assignments")
      .select("id, coach_id, client_id, status, assigned_at, ended_at, notes")
      .eq("coach_id", accountId)
      .order("assigned_at", { ascending: false }),
    supabase
      .from("activation_codes")
      .select("id, role, code, recipient_email, recipient_name, assigned_coach_id, status, expires_at, used_at, created_at")
      .eq("used_by", accountId)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  [coachProfileResponse, assignmentsResponse, activationCodesResponse].forEach((response) => {
    if (response?.error) {
      throw response.error;
    }
  });

  const coachProfile = coachProfileResponse.data || null;
  const assignments = assignmentsResponse.data || [];
  const clientIds = Array.from(new Set(assignments.map((assignment) => assignment.client_id).filter(Boolean)));
  const clientsResponse = clientIds.length
    ? await supabase.from("profiles").select("id, display_name").in("id", clientIds)
    : { data: [], error: null };
  if (clientsResponse.error) {
    throw clientsResponse.error;
  }
  const clientNames = (clientsResponse.data || []).map((client) => client.display_name || "Client").filter(Boolean);
  const latestActivationCode = (activationCodesResponse.data || [])[0] || null;

  return {
    id: accountId,
    role: "coach",
    displayName: profile.display_name || email || "Coach",
    email,
    phone: profile.phone || "",
    status: profile.status || "active",
    signatureDataUrl: "",
    sections: {
      account: [
        buildField("Full name", profile.display_name || ""),
        buildField("Email", email || ""),
        buildField("Phone", profile.phone || ""),
        buildField("Role", "Coach"),
        buildField("Status", profile.status || "active"),
        buildField("Created", formatDateTime(profile.created_at || coachProfile?.created_at)),
        buildField("Updated", formatDateTime(profile.updated_at || coachProfile?.updated_at)),
      ],
      registration: [
        buildField("Gender", coachProfile?.gender || ""),
        buildField("Date of birth", formatDate(coachProfile?.date_of_birth)),
        buildField("NRIC / Passport", coachProfile?.ic_passport_no || ""),
        buildField("Home address", coachProfile?.home_address || ""),
        buildField("Emergency contact", coachProfile?.emergency_contact_name || ""),
        buildField("Emergency relationship", coachProfile?.emergency_contact_relationship || ""),
        buildField("Emergency phone", coachProfile?.emergency_contact_phone || ""),
        buildField("Specialty", coachProfile?.specialty || ""),
        buildField("Certifications", coachProfile?.certifications || ""),
        buildField("Availability notes", coachProfile?.availability_notes || ""),
        buildField("Google Calendar email", coachProfile?.google_calendar_email || ""),
        buildField("Calendar sync enabled", yesNo(coachProfile?.calendar_sync_enabled)),
      ],
      payout: [
        buildField("Position code", coachProfile?.position_code || ""),
        buildField("Commission tier", coachProfile?.commission_tier || ""),
        buildField("Commission rate", coachProfile?.commission_rate != null ? `${Number(coachProfile.commission_rate) * 100}%` : ""),
        buildField("Bank", coachProfile?.payout_bank_name || ""),
        buildField("Account name", coachProfile?.payout_account_name || ""),
        buildField("Account number", coachProfile?.payout_account_number || ""),
        buildField("Bank code", coachProfile?.payout_bank_code || ""),
      ],
      audit: [
        buildField("Activation code used", latestActivationCode?.code || ""),
        buildField("Activation code created", formatDateTime(latestActivationCode?.created_at)),
        buildField("Activation code used at", formatDateTime(latestActivationCode?.used_at)),
        buildField("Active client count", numberText(assignments.filter((assignment) => assignment.status === "active").length, "0")),
        buildField("Assigned clients", clientNames.join(", ")),
      ],
    },
    raw: {
      profile,
      coachProfile,
      assignments,
      activationCodes: activationCodesResponse.data || [],
      clients: clientsResponse.data || [],
    },
  };
}

async function loadAccountRecord(supabase, role, accountId) {
  const profileResponse = await supabase
    .from("profiles")
    .select("id, role, display_name, phone, avatar_url, status, created_at, updated_at")
    .eq("id", accountId)
    .maybeSingle();
  if (profileResponse.error) {
    throw profileResponse.error;
  }
  const profile = profileResponse.data || null;
  if (!profile?.id) {
    throw createHttpError(404, "Account record not found.");
  }
  if (role !== "all" && role && profile.role !== role) {
    throw createHttpError(400, "Account role does not match the requested record.");
  }

  const emailMap = await getEmailMapForUserIds(supabase, [accountId]);
  const email = emailMap.get(accountId) || "";
  if (profile.role === "client") {
    return loadClientRecordDetail(supabase, accountId, profile, email);
  }
  if (profile.role === "coach") {
    return loadCoachRecordDetail(supabase, accountId, profile, email);
  }

  throw createHttpError(400, "Only client and coach account records are supported in this viewer.");
}

async function handler(event) {
  if (event.httpMethod === "OPTIONS") {
    return noContent({ "Cache-Control": "no-store" });
  }

  if (event.httpMethod !== "GET") {
    return methodNotAllowed("GET, OPTIONS");
  }

  const supabase = getServiceSupabase();
  try {
    const auth = await getAuthenticatedProfile(event, supabase);
    if (!auth?.profile) {
      return json(401, { error: "A valid authenticated session is required." }, { "Cache-Control": "no-store" });
    }

    if (auth.profile.role !== "super_admin") {
      return json(403, { error: "Super admin access is required." }, { "Cache-Control": "no-store" });
    }

    const role = normalizeRole(event.queryStringParameters?.role, true);
    const accountId = String(event.queryStringParameters?.accountId || "").trim();

    if (!accountId) {
      const records = await loadAccountIndex(supabase, role || "all");
      return json(200, { ok: true, records }, { "Cache-Control": "no-store" });
    }

    const record = await loadAccountRecord(supabase, role, accountId);
    return json(200, { ok: true, record }, { "Cache-Control": "no-store" });
  } catch (error) {
    return json(
      Number(error?.statusCode || 500),
      { error: error?.message || "Unable to load the requested account records right now." },
      { "Cache-Control": "no-store" }
    );
  }
}

module.exports = {
  handler,
  loadAccountRecord,
};
