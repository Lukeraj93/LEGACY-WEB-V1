const { json, methodNotAllowed, noContent } = require("./_lib/http");
const { getServiceSupabase } = require("./_lib/supabase");
const {
  asDateString,
  cleanText,
  parseEmail,
  parseEnum,
  parseOptionalText,
  parsePhone,
  parsePositiveInteger,
  parseRequiredText,
  parseTextArray,
  validationError,
} = require("./_lib/validation");

function parseBody(event) {
  try {
    return JSON.parse(event.body || "{}");
  } catch (_) {
    return null;
  }
}

function asObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return noContent();
  }

  if (event.httpMethod !== "POST") {
    return methodNotAllowed("POST, OPTIONS");
  }

  const body = parseBody(event);
  if (!body) {
    return json(400, { error: "Request body must be valid JSON." });
  }

  try {
    const fullName = parseRequiredText(body.fullName, {
      label: "Full name",
      minLength: 2,
      maxLength: 120,
    });
    const finalDeclarationName = parseRequiredText(body.finalDeclarationName || fullName, {
      label: "Final declaration full name",
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
    const icPassportNo = parseRequiredText(body.icPassportNo, {
      label: "NRIC / Passport number",
      minLength: 4,
      maxLength: 40,
    });
    const dateOfBirth = asDateString(body.dateOfBirth, {
      label: "Date of birth",
      required: true,
      mustBePastOrToday: true,
    });
    const age = parsePositiveInteger(body.age, {
      label: "Age",
      required: false,
      min: 0,
      max: 120,
    });
    const gender = parseEnum(body.gender, ["male", "female", "prefer_not_to_say"], {
      label: "Sex",
      required: true,
    });
    const occupation = parseOptionalText(body.occupation, {
      label: "Occupation",
      maxLength: 120,
    });
    const activityStyle = parseEnum(body.activityStyle, ["desk", "mixed", "physical"], {
      label: "Typical activity",
      required: false,
    });
    const homeAddress = parseRequiredText(body.homeAddress, {
      label: "Home address",
      minLength: 8,
      maxLength: 300,
    });
    const emergencyContactName = parseRequiredText(body.emergencyContactName, {
      label: "Emergency contact name",
      minLength: 2,
      maxLength: 120,
    });
    const emergencyContactRelationship = parseRequiredText(body.emergencyContactRelationship, {
      label: "Emergency contact relationship",
      minLength: 2,
      maxLength: 80,
    });
    const emergencyContactPhone = parsePhone(body.emergencyContactPhone, {
      label: "Emergency contact phone",
      required: true,
    });
    const signatureDataUrl = String(body.signatureDataUrl || "").trim();
    const pdpaConsent = Boolean(body.pdpaConsent);
    const parqAnswers = asObject(body.parqAnswers);
    const policyInitials = asObject(body.policyInitials);
    const mediaConsent = parseEnum(body.mediaConsent, ["yes_full", "yes_anonymised", "no"], {
      label: "Media consent",
      required: true,
    });
    const parqExplanation = parseOptionalText(body.parqExplanation, {
      label: "PAR-Q explanation",
      maxLength: 2000,
    });
    const conditions = parseTextArray(body.conditions, {
      label: "Medical conditions",
      maxItems: 20,
      maxItemLength: 80,
    });
    const injuryLocation = parseOptionalText(body.injuryLocation, {
      label: "Injury / pain location",
      maxLength: 240,
    });
    const injuryTriggers = parseOptionalText(body.injuryTriggers, {
      label: "Injury triggers",
      maxLength: 240,
    });
    const surgeriesDetails = parseOptionalText(body.surgeriesDetails, {
      label: "Surgery details",
      maxLength: 2000,
    });
    const currentMedications = parseOptionalText(body.currentMedications, {
      label: "Current medications",
      maxLength: 2000,
    });
    const supplements = parseOptionalText(body.supplements, {
      label: "Supplements",
      maxLength: 2000,
    });
    const allergies = parseOptionalText(body.allergies, {
      label: "Allergies",
      maxLength: 2000,
    });
    const pregnancyStatus = parseEnum(body.pregnancyStatus, ["not_applicable", "pregnant", "postpartum"], {
      label: "Pregnancy status",
      required: false,
    });
    const pregnancyRestrictions = parseOptionalText(body.pregnancyRestrictions, {
      label: "Pregnancy or doctor restrictions",
      maxLength: 2000,
    });
    const witnessName = parseOptionalText(body.witnessName, {
      label: "Coach / witness name",
      maxLength: 120,
    });
    const witnessSignatureName = parseOptionalText(body.witnessSignatureName, {
      label: "Witness signature name",
      maxLength: 120,
    });

    if (!signatureDataUrl.startsWith("data:image/")) {
      throw validationError("A digital signature is required before submitting the waiver.");
    }
    if (signatureDataUrl.length > 2500000) {
      throw validationError("Digital signature payload is too large. Please clear and sign again.");
    }
    if (!pdpaConsent) {
      throw validationError("PDPA consent is required before registration can continue.");
    }

    const requiredParqKeys = ["q1", "q2", "q3", "q4", "q5", "q6", "q7"];
    requiredParqKeys.forEach((key) => {
      const answer = parseEnum(parqAnswers[key], ["yes", "no"], {
        label: `PAR-Q ${key.toUpperCase()}`,
        required: true,
      });
      parqAnswers[key] = answer;
    });
    if (requiredParqKeys.some((key) => parqAnswers[key] === "yes") && !parqExplanation) {
      throw validationError("Explain any YES answers in the PAR-Q section before submitting the waiver.");
    }

    const requiredPolicyKeys = ["cancellation", "lateArrival", "noShow", "packageValidity", "refundPolicy", "facilityRules"];
    requiredPolicyKeys.forEach((key) => {
      const initials = parseRequiredText(policyInitials[key], {
        label: `Policy acknowledgement for ${key}`,
        minLength: 1,
        maxLength: 6,
      });
      policyInitials[key] = initials.toUpperCase();
    });

    const supabase = getServiceSupabase();
    const payload = {
      full_name: fullName,
      email,
      phone: phone || null,
      ic_passport_no: icPassportNo,
      date_of_birth: dateOfBirth,
      age,
      gender,
      home_address: homeAddress,
      occupation: occupation || null,
      activity_style: activityStyle || null,
      emergency_contact_name: emergencyContactName,
      emergency_contact_relationship: emergencyContactRelationship,
      emergency_contact_phone: emergencyContactPhone,
      parq_answers: parqAnswers,
      parq_explanation: parqExplanation || null,
      medical_history: {
        conditions,
        hasCurrentPain: Boolean(body.hasCurrentPain),
        injuryLocation: injuryLocation || null,
        injuryTriggers: injuryTriggers || null,
        surgeriesRecent: Boolean(body.surgeriesRecent),
        surgeriesDetails: surgeriesDetails || null,
        currentMedications: currentMedications || null,
        supplements: supplements || null,
        allergies: allergies || null,
        pregnancyStatus: pregnancyStatus || null,
        pregnancyRestrictions: pregnancyRestrictions || null,
      },
      injury_notes: injuryLocation || null,
      surgery_notes: surgeriesDetails || null,
      medication_notes: currentMedications || null,
      supplements: supplements || null,
      allergies: allergies || null,
      pregnancy_status: pregnancyStatus || null,
      pregnancy_restrictions: pregnancyRestrictions || null,
      pdpa_consent: true,
      media_consent: mediaConsent,
      policy_initials: policyInitials,
      final_declaration_name: finalDeclarationName,
      signature_data_url: signatureDataUrl,
      signature_signed_at: new Date().toISOString(),
      witness_name: witnessName || null,
      witness_signature_name: witnessSignatureName || null,
      form_payload: body,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("client_waiver_submissions")
      .insert(payload)
      .select("id, email, signature_signed_at")
      .single();

    if (error || !data?.id) {
      throw error || new Error("Unable to save the waiver submission.");
    }

    return json(200, {
      ok: true,
      waiverSubmissionId: data.id,
      email: data.email,
      signedAt: data.signature_signed_at,
    });
  } catch (error) {
    return json(error?.statusCode || 500, {
      error: error?.message || "Unable to submit the waiver right now.",
    });
  }
};
