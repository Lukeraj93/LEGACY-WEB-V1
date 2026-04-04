const { errorResponse, json, methodNotAllowed, noContent, parseJsonBody } = require("./_lib/http");
const { assertRateLimit, buildRateLimitKey, getRequestIp } = require("./_lib/rate-limit");
const { awardCoachXpAction, buildCoachXpSourceRef } = require("./_lib/xp-coach");
const { getAuthenticatedProfile, getServiceSupabase, notifySuperAdmins } = require("./_lib/supabase");
const {
  cleanText,
  parseEmail,
  parseEnum,
  parseOptionalText,
  parsePhone,
  parsePositiveInteger,
  parseRequiredText,
  parseTextArray,
} = require("./_lib/validation");

const consultCaptureThrottle = new Map();

async function findExistingLead(supabase, coachId, email, phone) {
  if (email) {
    const emailQuery = await supabase
      .from("leads")
      .select("id, status, notes")
      .eq("email", email)
      .eq("owner_id", coachId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (emailQuery.error) {
      throw emailQuery.error;
    }

    if (emailQuery.data?.id) {
      return emailQuery.data;
    }
  }

  if (phone) {
    const phoneQuery = await supabase
      .from("leads")
      .select("id, status, notes")
      .eq("phone", phone)
      .eq("owner_id", coachId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (phoneQuery.error) {
      throw phoneQuery.error;
    }

    if (phoneQuery.data?.id) {
      return phoneQuery.data;
    }
  }

  return null;
}

function buildSummary(payload) {
  const goal = cleanText(payload.goal);
  const barrier = cleanText(payload.biggestBarrier);
  const nextStep = cleanText(payload.nextStep);
  return [goal ? `Goal: ${goal}` : "", barrier ? `Barrier: ${barrier}` : "", nextStep ? `Next: ${nextStep}` : ""]
    .filter(Boolean)
    .join(" | ");
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return noContent();
  }

  if (event.httpMethod !== "POST") {
    return methodNotAllowed("POST, OPTIONS");
  }

  try {
    const body = parseJsonBody(event, {
      maxBytes: 48 * 1024,
    });
    const supabase = getServiceSupabase();
    const auth = await getAuthenticatedProfile(event, supabase);
    if (!auth?.profile || (auth.profile.role !== "coach" && auth.profile.role !== "super_admin")) {
      return json(403, { error: "Only coach accounts can submit consult intakes." });
    }

    const coachId = auth.profile.id;
    const fullName = parseRequiredText(body.fullName, {
      label: "Full name",
      minLength: 2,
      maxLength: 120,
    });
    const phone = parsePhone(body.phone, {
      label: "Phone number",
      required: true,
    });
    const email = parseEmail(body.email, {
      label: "Email address",
      required: false,
    });
    const primaryGoal = parseRequiredText(body.goal, {
      label: "Main goal",
      minLength: 3,
      maxLength: 180,
    });
    const age = parsePositiveInteger(body.age, {
      label: "Age",
      required: false,
      min: 0,
      max: 120,
    });
    const cityArea = parseOptionalText(body.cityArea, {
      label: "City / area",
      maxLength: 120,
    });
    const occupation = parseOptionalText(body.occupation, {
      label: "Occupation",
      maxLength: 120,
    });
    const workStyle = parseEnum(body.workStyle, ["desk", "mixed", "physical"], {
      label: "Work style",
      required: false,
    });
    const heardAbout = parseEnum(body.heardAbout, ["ig", "referral", "google", "walk_in", "other"], {
      label: "Heard about us from",
      required: false,
    });
    const preferredMessageWindow = parseOptionalText(body.preferredMessageWindow, {
      label: "Preferred message time",
      maxLength: 80,
    });
    const offHours = parseOptionalText(body.offHours, {
      label: "Off-hours",
      maxLength: 80,
    });
    const timeline = parseEnum(body.timeline, ["6_8_weeks", "12_weeks", "3_6_months", "6_12_months", "not_sure"], {
      label: "Meaningful timeline",
      required: false,
    });
    const successDefinition = parseOptionalText(body.successDefinition, {
      label: "Success definition",
      maxLength: 1000,
    });
    const whyNow = parseOptionalText(body.whyNow, {
      label: "Why now",
      maxLength: 1000,
    });
    const importanceScore = parsePositiveInteger(body.importanceScore, {
      label: "Goal importance",
      required: false,
      min: 1,
      max: 10,
    });
    const confidenceScore = parsePositiveInteger(body.confidenceScore, {
      label: "Confidence score",
      required: false,
      min: 1,
      max: 10,
    });
    const biggestBarrier = parseOptionalText(body.biggestBarrier, {
      label: "Biggest barrier",
      maxLength: 240,
    });
    const trainingExperience = parseEnum(body.trainingExperience, ["new", "on_off", "consistent_6_12", "1_3_years", "3_plus_years"], {
      label: "Training experience",
      required: false,
    });
    const currentTraining = parseOptionalText(body.currentTraining, {
      label: "Current training",
      maxLength: 80,
    });
    const nutritionStruggle = parseOptionalText(body.nutritionStruggle, {
      label: "Main nutrition struggle",
      maxLength: 240,
    });
    const sleepStress = parseOptionalText(body.sleepStress, {
      label: "Sleep / stress note",
      maxLength: 240,
    });
    const coachingStyle = parseOptionalText(body.coachingStyle, {
      label: "Preferred coaching style",
      maxLength: 240,
    });
    const recommendedService = parseEnum(body.recommendedService, ["pt", "hybrid", "online", "not_sure"], {
      label: "Service fit",
      required: false,
    });
    const hotness = parseEnum(body.hotness, ["hot", "warm", "cold"], {
      label: "Lead heat",
      required: false,
    });
    const primaryLever = parseEnum(body.primaryLever, ["training", "nutrition", "sleep", "stress", "accountability"], {
      label: "Primary lever",
      required: false,
    });
    const riskFlags = parseTextArray(body.riskFlags, {
      label: "Risk flags",
      maxItems: 10,
      maxItemLength: 80,
    });
    const recommendedFrequency = parseOptionalText(body.recommendedFrequency, {
      label: "Recommended frequency",
      maxLength: 120,
    });
    const recommendedTimeline = parseOptionalText(body.recommendedTimeline, {
      label: "Recommended timeline",
      maxLength: 120,
    });
    const nextStep = parseOptionalText(body.nextStep, {
      label: "Next step",
      maxLength: 240,
    });
    const coachSummary = parseOptionalText(body.summary, {
      label: "Coach summary",
      maxLength: 2000,
    });
    const sanitizedPayload = {
      fullName,
      email: email || null,
      phone,
      age,
      cityArea: cityArea || null,
      occupation: occupation || null,
      workStyle: workStyle || null,
      heardAbout: heardAbout || null,
      preferredMessageWindow: preferredMessageWindow || null,
      offHours: offHours || null,
      goal: primaryGoal,
      timeline: timeline || null,
      successDefinition: successDefinition || null,
      whyNow: whyNow || null,
      importanceScore,
      confidenceScore,
      biggestBarrier: biggestBarrier || null,
      trainingExperience: trainingExperience || null,
      currentTraining: currentTraining || null,
      nutritionStruggle: nutritionStruggle || null,
      sleepStress: sleepStress || null,
      coachingStyle: coachingStyle || null,
      recommendedService: recommendedService || null,
      hotness: hotness || null,
      primaryLever: primaryLever || null,
      riskFlags,
      recommendedFrequency: recommendedFrequency || null,
      recommendedTimeline: recommendedTimeline || null,
      nextStep: nextStep || null,
      summary: coachSummary || null,
    };
    assertRateLimit({
      store: consultCaptureThrottle,
      key: buildRateLimitKey("coach-consult", coachId, getRequestIp(event), email || phone || fullName),
      limit: 8,
      windowMs: 5 * 60 * 1000,
      message: "Too many consult submissions were sent too quickly. Please wait a few minutes and try again.",
    });
    const existingLead = await findExistingLead(supabase, coachId, email, phone);
    const summary = coachSummary || buildSummary(sanitizedPayload);
    const nextFollowUpAt = new Date(Date.now() + (2 * 24 * 60 * 60 * 1000)).toISOString();
    let leadId = existingLead?.id || "";

    if (leadId) {
      const nextNotes = [existingLead.notes || "", "", `[Consult ${new Date().toISOString()}] ${summary}`]
        .filter(Boolean)
        .join("\n");

      const nextStatus = ["converted", "lost"].includes(existingLead.status) ? existingLead.status : "qualified";
      const { error: updateError } = await supabase
        .from("leads")
        .update({
          full_name: fullName,
          email: email || null,
          phone: phone || null,
          source: "1:1 Coaching Consult",
          status: nextStatus,
          owner_id: coachId,
          next_follow_up_at: nextFollowUpAt,
          notes: nextNotes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", leadId);

      if (updateError) {
        throw updateError;
      }
    } else {
      const { data: insertedLead, error: insertError } = await supabase
        .from("leads")
        .insert({
          full_name: fullName,
          email: email || null,
          phone: phone || null,
          source: "1:1 Coaching Consult",
          status: "qualified",
          owner_id: coachId,
          next_follow_up_at: nextFollowUpAt,
          notes: summary || null,
        })
        .select("id")
        .single();

      if (insertError || !insertedLead?.id) {
        throw insertError || new Error("Unable to create the consult lead.");
      }

      leadId = insertedLead.id;
    }

    const { error: activityError } = await supabase.from("lead_activities").insert({
      lead_id: leadId,
      actor_id: coachId,
      activity_type: "consult_intake",
      notes: summary || "Coach consult intake submitted.",
    });

    if (activityError) {
      throw activityError;
    }

    const { data: consultEntry, error: consultError } = await supabase
      .from("coach_consult_intakes")
      .insert({
        coach_id: coachId,
        lead_id: leadId,
        summary: summary || null,
        hotness: hotness || null,
        recommended_service: recommendedService || null,
        recommended_frequency: recommendedFrequency || null,
        recommended_timeline: recommendedTimeline || null,
        next_step: nextStep || null,
        primary_goal: primaryGoal,
        biggest_barrier: biggestBarrier || null,
        primary_lever: primaryLever || null,
        risk_flags: riskFlags,
        raw_payload: sanitizedPayload,
        updated_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (consultError || !consultEntry?.id) {
      throw consultError;
    }

    if (auth.profile.role === "coach") {
      await awardCoachXpAction(supabase, {
        actionId: "SYS-CRM",
        targetProfileId: coachId,
        actorProfileId: auth.profile.id,
        eventDate: new Date(),
        sourceRef: buildCoachXpSourceRef("consult-intake", consultEntry.id, "sys-crm"),
        evidence: leadId,
        notes: `Consult intake submitted for ${fullName}.`,
      }).catch(() => null);
    }

    await notifySuperAdmins(supabase, {
      category: "lead",
      title: "Coach consult lead added",
      body: `${fullName} was added to the CRM from a 1:1 consult intake.`,
      action_url: "./admin-leads.html",
    }).catch(() => null);

    return json(200, {
      ok: true,
      leadId,
      status: existingLead?.id ? "updated" : "created",
      nextFollowUpAt,
    });
  } catch (error) {
    return errorResponse(error, "Unable to submit the consult intake right now.");
  }
};
