const { json, methodNotAllowed, noContent, parseJsonBody, errorResponse } = require("./_lib/http");
const { sendNoticeEmail } = require("./_lib/email");
const {
  getServiceSupabase,
  getSuperAdminEmailRecipients,
  notifyRecipients,
  notifySuperAdmins,
} = require("./_lib/supabase");
const {
  asDateString,
  assertPasswordPair,
  cleanText,
  normalizeEmail,
  parseActivationCode,
  parseEmail,
  parseEnum,
  parseOptionalText,
  parsePhone,
  parseRequiredText,
  validationError,
} = require("./_lib/validation");

function formatCoachPublicId(value) {
  const normalized = String(value || "").replace(/[^a-z0-9]/giu, "").toUpperCase();
  return normalized ? `LGC-C${normalized.slice(0, 6)}` : "Pending coach ID";
}

async function validateActivationCode(supabase, role, code, email) {
  const { data, error } = await supabase
    .from("activation_codes")
    .select("id, role, code, recipient_email, assigned_coach_id, status, expires_at, metadata")
    .eq("code", code)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data?.id) {
    throw validationError("Activation code not found.");
  }

  if (data.role !== role) {
    throw validationError("This activation code does not match the selected registration type.");
  }

  if (data.status !== "active") {
    throw validationError("This activation code is no longer active.");
  }

  if (normalizeEmail(data.recipient_email) !== email) {
    throw validationError("This activation code is tied to a different email address.");
  }

  if (data.expires_at && new Date(data.expires_at).getTime() < Date.now()) {
    await supabase
      .from("activation_codes")
      .update({
        status: "expired",
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.id);
    throw validationError("This activation code has expired.");
  }

  return data;
}

async function validateClientWaiver(supabase, waiverSubmissionId, email) {
  const { data, error } = await supabase
    .from("client_waiver_submissions")
    .select("id, email, signature_signed_at")
    .eq("id", waiverSubmissionId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data?.id) {
    throw validationError("Waiver submission not found. Please complete the waiver before registering.");
  }

  if (normalizeEmail(data.email) !== email) {
    throw validationError("The waiver email does not match the registration email.");
  }

  if (!data.signature_signed_at) {
    throw validationError("The waiver was not signed properly. Please complete it again.");
  }

  return data;
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return noContent();
  }

  if (event.httpMethod !== "POST") {
    return methodNotAllowed("POST, OPTIONS");
  }

  let supabase = null;
  let createdUserId = "";
  let createdAssignmentId = "";

  try {
    const body = await parseJsonBody(event, { maxBytes: 64 * 1024 });
    const role = parseEnum(body.role, ["client", "coach"], {
      label: "Registration role",
      required: true,
    });
    const fullName = parseRequiredText(body.fullName, {
      label: "Full name",
      minLength: 2,
      maxLength: 120,
    });
    const email = parseEmail(body.email, {
      label: "Email address",
      required: true,
    });
    const phone = parsePhone(body.phone, {
      label: "Phone number",
      required: true,
    });
    const password = assertPasswordPair(body.password, body.confirmPassword);
    const activationCode = parseActivationCode(body.activationCode);
    supabase = getServiceSupabase();
    let codeRecord = null;
    let waiverRecord = null;
    let assignedCoachId = null;

    if (role === "client") {
      const waiverSubmissionId = parseRequiredText(body.waiverSubmissionId, {
        label: "Waiver submission",
        minLength: 8,
        maxLength: 80,
      });
      [codeRecord, waiverRecord] = await Promise.all([
        validateActivationCode(supabase, role, activationCode, email),
        validateClientWaiver(supabase, waiverSubmissionId, email),
      ]);
      const selectedCoachId = parseOptionalText(body.preferredCoachId, {
        label: "Assigned coach",
        maxLength: 80,
      });
      assignedCoachId = codeRecord.assigned_coach_id || selectedCoachId || null;

      if (!assignedCoachId) {
        throw validationError("Select an active coach before creating the client account.");
      }

      if (codeRecord.assigned_coach_id && selectedCoachId && selectedCoachId !== codeRecord.assigned_coach_id) {
        throw validationError("This activation code is already linked to a different coach.");
      }

      const { data: coachProfile, error: coachError } = await supabase
        .from("profiles")
        .select("id, role, status, display_name")
        .eq("id", assignedCoachId)
        .maybeSingle();

      if (coachError || !coachProfile || coachProfile.role !== "coach" || coachProfile.status !== "active") {
        throw validationError("Select an active coach before creating the client account.");
      }
    } else {
      codeRecord = await validateActivationCode(supabase, role, activationCode, email);
    }

    const profileStatus = role === "coach" ? "pending" : "active";
    const createUserResponse = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        role,
        display_name: fullName,
        full_name: fullName,
        phone,
        status: profileStatus,
        ...(codeRecord?.metadata?.qaAccount ? { qaAccount: true } : {}),
      },
      app_metadata: {
        role,
        status: profileStatus,
        ...(codeRecord?.metadata?.qaAccount ? { qaAccount: true } : {}),
      },
    });

    if (createUserResponse.error || !createUserResponse.data?.user?.id) {
      return json(400, {
        error: createUserResponse.error?.message || "Unable to create the account.",
      });
    }

    createdUserId = createUserResponse.data.user.id;
    const nowIso = new Date().toISOString();
    const profileUpdatePromise = supabase
      .from("profiles")
      .update({
        display_name: fullName,
        phone: phone || null,
        status: profileStatus,
        updated_at: nowIso,
      })
      .eq("id", createdUserId);
    const activationCodeUsePromise = supabase
      .from("activation_codes")
      .update({
        status: "used",
        used_at: nowIso,
        used_by: createdUserId,
        updated_at: nowIso,
      })
      .eq("id", codeRecord.id);
    let accountIdentity = formatCoachPublicId(createdUserId);

    if (role === "client") {
      const clientGender = parseEnum(body.gender, ["male", "female"], {
        label: "Gender",
        required: true,
      });
      const clientDateOfBirth = asDateString(body.dateOfBirth, {
        label: "Date of birth",
        required: true,
        mustBePastOrToday: true,
      });
      const clientIcPassportNo = parseRequiredText(body.icPassportNo, {
        label: "NRIC / Passport number",
        minLength: 4,
        maxLength: 40,
      });
      const clientHomeAddress = parseRequiredText(body.homeAddress, {
        label: "Home address",
        minLength: 8,
        maxLength: 300,
      });
      const clientEmergencyContactName = parseRequiredText(body.emergencyContactName, {
        label: "Emergency contact name",
        minLength: 2,
        maxLength: 120,
      });
      const clientEmergencyContactPhone = parsePhone(body.emergencyContactPhone, {
        label: "Emergency contact phone",
        required: true,
      });
      const clientEmergencyRelationship = parseRequiredText(body.emergencyContactRelationship, {
        label: "Emergency contact relationship",
        minLength: 2,
        maxLength: 80,
      });
      const clientPrimaryGoal = parseRequiredText(body.primaryGoal, {
        label: "Fitness goals",
        minLength: 3,
        maxLength: 180,
      });
      const clientActivityStyle = parseEnum(body.activityStyle, ["desk", "mixed", "physical"], {
        label: "Typical activity",
        required: false,
      });
      const clientPreferredName = parseOptionalText(body.preferredName, {
        label: "Preferred name",
        maxLength: 120,
      });
      const clientOccupation = parseOptionalText(body.occupation, {
        label: "Occupation",
        maxLength: 120,
      });
      const clientMedicalNotes = parseOptionalText(body.medicalNotes, {
        label: "Medical conditions or injuries",
        maxLength: 2000,
      });

      const [
        profileUpdateResponse,
        clientProfileResponse,
        assignmentInsert,
        waiverUpdateResponse,
        activationCodeUseResponse,
      ] = await Promise.all([
        profileUpdatePromise,
        supabase
          .from("client_profiles")
          .update({
            preferred_name: clientPreferredName || fullName,
            primary_goal: clientPrimaryGoal,
            gender: clientGender,
            date_of_birth: clientDateOfBirth,
            home_address: clientHomeAddress,
            emergency_contact_name: clientEmergencyContactName,
            emergency_contact_phone: clientEmergencyContactPhone,
            emergency_contact_relationship: clientEmergencyRelationship,
            medical_notes: clientMedicalNotes || null,
            preferred_coach_id: assignedCoachId,
            waiver_submission_id: waiverRecord?.id || null,
            waiver_signed_at: waiverRecord?.signature_signed_at || null,
            ic_passport_no: clientIcPassportNo,
            occupation: clientOccupation || null,
            activity_style: clientActivityStyle || null,
            updated_at: nowIso,
          })
          .eq("id", createdUserId)
          .select("member_id")
          .maybeSingle(),
        assignedCoachId
          ? supabase
              .from("coach_client_assignments")
              .insert({
                coach_id: assignedCoachId,
                client_id: createdUserId,
                status: "active",
                assigned_at: nowIso,
                created_by: createdUserId,
                notes: "Assigned during client registration.",
              })
              .select("id")
              .single()
          : Promise.resolve(null),
        waiverRecord?.id
          ? supabase
              .from("client_waiver_submissions")
              .update({
                client_id: createdUserId,
                updated_at: nowIso,
              })
              .eq("id", waiverRecord.id)
          : Promise.resolve(null),
        activationCodeUsePromise,
      ]);

      if (profileUpdateResponse.error) {
        throw profileUpdateResponse.error;
      }
      if (clientProfileResponse.error) {
        throw clientProfileResponse.error;
      }
      if (assignmentInsert && (assignmentInsert.error || !assignmentInsert.data?.id)) {
        throw assignmentInsert.error || new Error("Unable to assign the selected coach.");
      }
      if (waiverUpdateResponse?.error) {
        throw waiverUpdateResponse.error;
      }
      if (activationCodeUseResponse.error) {
        throw activationCodeUseResponse.error;
      }

      createdAssignmentId = assignmentInsert?.data?.id || "";
      accountIdentity = clientProfileResponse.data?.member_id || "Pending member ID";
    } else {
      const coachGender = parseEnum(body.gender, ["male", "female"], {
        label: "Gender",
        required: true,
      });
      const coachDateOfBirth = asDateString(body.dateOfBirth, {
        label: "Date of birth",
        required: true,
        mustBePastOrToday: true,
      });
      const coachIcPassportNo = parseRequiredText(body.icPassportNo, {
        label: "NRIC / Passport number",
        minLength: 4,
        maxLength: 40,
      });
      const coachHomeAddress = parseRequiredText(body.homeAddress, {
        label: "Home address",
        minLength: 8,
        maxLength: 300,
      });
      const coachEmergencyContactName = parseRequiredText(body.emergencyContactName, {
        label: "Emergency contact name",
        minLength: 2,
        maxLength: 120,
      });
      const coachEmergencyContactPhone = parsePhone(body.emergencyContactPhone, {
        label: "Emergency contact phone",
        required: true,
      });
      const coachEmergencyRelationship = parseRequiredText(body.emergencyContactRelationship, {
        label: "Emergency contact relationship",
        minLength: 2,
        maxLength: 80,
      });
      const coachSpecialty = parseRequiredText(body.specialty, {
        label: "Primary coaching specialty",
        minLength: 3,
        maxLength: 160,
      });
      const coachCertifications = parseRequiredText(body.certifications, {
        label: "Certifications",
        minLength: 3,
        maxLength: 500,
      });
      const coachAvailabilityNotes = parseOptionalText(body.availabilityNotes, {
        label: "Availability / work notes",
        maxLength: 240,
      });
      const coachExperienceNotes = parseOptionalText(body.experienceNotes, {
        label: "Experience and notes",
        maxLength: 2000,
      });

      const [profileUpdateResponse, coachProfileResponse, activationCodeUseResponse] = await Promise.all([
        profileUpdatePromise,
        supabase
          .from("coach_profiles")
          .update({
            gender: coachGender,
            date_of_birth: coachDateOfBirth,
            home_address: coachHomeAddress,
            emergency_contact_name: coachEmergencyContactName,
            emergency_contact_phone: coachEmergencyContactPhone,
            emergency_contact_relationship: coachEmergencyRelationship,
            specialty: coachSpecialty,
            certifications: coachCertifications,
            availability_notes: coachAvailabilityNotes || null,
            ic_passport_no: coachIcPassportNo,
            notes: coachExperienceNotes || null,
            updated_at: nowIso,
          })
          .eq("id", createdUserId),
        activationCodeUsePromise,
      ]);

      if (profileUpdateResponse.error) {
        throw profileUpdateResponse.error;
      }
      if (coachProfileResponse.error) {
        throw coachProfileResponse.error;
      }
      if (activationCodeUseResponse.error) {
        throw activationCodeUseResponse.error;
      }
    }

    const adminNotification = {
      category: "registration",
      title: role === "client" ? "New client registration" : "New coach registration",
      body: role === "client"
        ? `${fullName} completed client registration and is ready for portal access.`
        : `${fullName} completed coach registration and is waiting for admin approval.`,
      action_url: role === "client" ? "./admin-clients.html" : "./admin-clients.html",
    };

    const adminEmailsPromise = getSuperAdminEmailRecipients(supabase).catch(() => []);
    await Promise.allSettled([
      notifySuperAdmins(supabase, adminNotification),
      role === "client" && assignedCoachId
        ? notifyRecipients(supabase, [
            {
              recipient_id: assignedCoachId,
              category: "registration",
              title: "New client assigned to you",
              body: `${fullName} registered and is now linked to your client roster.`,
              action_url: "./coach-clients.html",
            },
          ])
        : Promise.resolve({ count: 0 }),
      adminEmailsPromise.then((adminEmails) => (
        adminEmails.length
          ? sendNoticeEmail({
              to: adminEmails,
              subject: role === "client" ? "New client registration completed" : "New coach registration completed",
              eyebrow: "Registration",
              title: role === "client" ? "A new client account is live" : "A coach registration is pending review",
              intro: role === "client"
                ? `${fullName} completed registration and can access the client portal.`
                : `${fullName} completed coach registration and is waiting for team approval.`,
              metaRows: [
                { label: "Role", value: role === "client" ? "Client" : "Coach" },
                { label: "Name", value: fullName },
                { label: "Email", value: email },
                { label: role === "client" ? "Member ID" : "Coach ID", value: accountIdentity },
              ],
              ctaLabel: "Open Team Workspace",
              ctaUrl: "./admin-clients.html",
              tags: [
                { name: "category", value: "registration" },
                { name: "role", value: role },
              ],
            })
          : Promise.resolve(null)
      )),
      sendNoticeEmail({
        to: email,
        subject: role === "client" ? "Your LEGACY+ client portal is ready" : "Your LEGACY+ coach registration was received",
        eyebrow: "LEGACY+",
        title: role === "client" ? "Your client account is active" : "Your coach registration is pending approval",
        intro: role === "client"
          ? "Your registration is complete. You can now sign in with the email and password you just created."
          : "Your registration has been received. A super admin will review and approve your coach access before you can sign in.",
        metaRows: [
          { label: "Email", value: email },
          { label: role === "client" ? "Member ID" : "Coach ID", value: accountIdentity },
          { label: "Status", value: role === "client" ? "Active" : "Pending approval" },
        ],
        ctaLabel: "Open Account",
        ctaUrl: "./account.html",
        tags: [
          { name: "category", value: "registration" },
          { name: "role", value: role },
        ],
      }),
    ]);

    return json(200, {
      ok: true,
      role,
      profileStatus,
      userId: createdUserId,
      email,
      assignedCoachId,
      message: role === "client"
        ? "Client account created successfully."
        : "Coach registration received. Waiting for admin approval.",
    });
  } catch (error) {
    if (createdAssignmentId) {
      await supabase.from("coach_client_assignments").delete().eq("id", createdAssignmentId).catch(() => null);
    }

    if (createdUserId) {
      await supabase.auth.admin.deleteUser(createdUserId).catch(() => null);
    }

    return errorResponse(error, "Unable to create the account right now.");
  }
};
