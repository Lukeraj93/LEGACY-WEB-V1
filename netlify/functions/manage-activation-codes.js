const crypto = require("crypto");

const { sendNoticeEmail } = require("./_lib/email");
const { json, methodNotAllowed, noContent, parseJsonBody, errorResponse } = require("./_lib/http");
const { getAuthenticatedProfile, getServiceSupabase } = require("./_lib/supabase");
const {
  parseEmail,
  parseEnum,
  parseOptionalText,
} = require("./_lib/validation");

function buildCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let output = "";
  for (let index = 0; index < 8; index += 1) {
    const cursor = crypto.randomInt(0, alphabet.length);
    output += alphabet[cursor];
    if (index === 3) {
      output += "-";
    }
  }
  return output;
}

function canGenerate(profile, requestedRole) {
  if (profile?.role === "super_admin") {
    return requestedRole === "client" || requestedRole === "coach";
  }

  return profile?.role === "coach" && requestedRole === "client";
}

async function insertActivationCodeWithRetry(supabase, payload) {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const code = buildCode();
    const { data, error } = await supabase
      .from("activation_codes")
      .insert({
        ...payload,
        code,
      })
      .select("id, role, code, recipient_email, recipient_name, assigned_coach_id, status, expires_at, created_at")
      .single();

    if (!error && data?.id) {
      return data;
    }

    const errorCode = String(error?.code || "").trim();
    const errorMessage = String(error?.message || "").toLowerCase();
    const isDuplicate = errorCode === "23505" || errorMessage.includes("duplicate key") || errorMessage.includes("unique");
    if (!isDuplicate) {
      throw error || new Error("Unable to save the activation code.");
    }
  }

  throw new Error("Unable to generate a unique activation code. Please try again.");
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return noContent();
  }

  if (!["GET", "POST"].includes(event.httpMethod)) {
    return methodNotAllowed("GET, POST, OPTIONS");
  }

  try {
    const supabase = getServiceSupabase();
    const auth = await getAuthenticatedProfile(event, supabase);
    if (!auth?.profile) {
      return json(401, { error: "A valid session is required." });
    }

    const isList = event.httpMethod === "GET";
    const body = isList ? {} : await parseJsonBody(event, { maxBytes: 32 * 1024 });

    const action = isList
      ? "list"
      : parseEnum(body.action || "generate", ["generate", "list"], {
        label: "Activation code action",
        required: true,
      });
    if (action === "list") {
      let query = supabase
        .from("activation_codes")
        .select("id, role, code, recipient_email, recipient_name, assigned_coach_id, status, expires_at, used_at, created_at")
        .order("created_at", { ascending: false })
        .limit(40);

      if (auth.profile.role !== "super_admin") {
        query = query
          .eq("role", "client")
          .or(`generated_by.eq.${auth.profile.id},assigned_coach_id.eq.${auth.profile.id}`);
      }

      const { data, error } = await query;
      if (error) {
        throw error;
      }

      return json(200, {
        ok: true,
        codes: data || [],
      });
    }

    if (action !== "generate") {
      return json(400, { error: "Unsupported activation code action." });
    }

    const requestedRole = parseEnum(body.role, ["client", "coach"], {
      label: "Activation code role",
      required: true,
    });
    if (!canGenerate(auth.profile, requestedRole)) {
      return json(403, { error: "You do not have permission to generate that type of activation code." });
    }

    const recipientEmail = parseEmail(body.recipientEmail, {
      label: "Recipient email",
      required: true,
    });

    let assignedCoachId = parseOptionalText(body.assignedCoachId, {
      label: "Assigned coach",
      maxLength: 80,
    }) || null;
    if (auth.profile.role === "coach") {
      assignedCoachId = auth.profile.id;
    }

    if (requestedRole === "coach") {
      assignedCoachId = null;
    }

    if (assignedCoachId) {
      const { data: coachProfile, error: coachError } = await supabase
        .from("profiles")
        .select("id, role, status")
        .eq("id", assignedCoachId)
        .maybeSingle();

      if (coachError || !coachProfile || coachProfile.role !== "coach" || coachProfile.status !== "active") {
        return json(400, { error: "Assigned coach must be an active coach account." });
      }
    }

    const expiresAt = new Date(Date.now() + (14 * 24 * 60 * 60 * 1000)).toISOString();
    const recipientName = parseOptionalText(body.recipientName, {
      label: "Recipient name",
      maxLength: 120,
    });
    const notes = parseOptionalText(body.notes, {
      label: "Notes",
      maxLength: 500,
    });
    const payload = {
      role: requestedRole,
      recipient_email: recipientEmail,
      recipient_name: recipientName || null,
      assigned_coach_id: assignedCoachId,
      generated_by: auth.profile.id,
      expires_at: expiresAt,
      notes: notes || null,
      metadata: {
        generatedByRole: auth.profile.role,
      },
      updated_at: new Date().toISOString(),
    };

    const data = await insertActivationCodeWithRetry(supabase, payload);
    const code = data.code;

    const accountLabel = requestedRole === "coach" ? "coach" : "client";
    const registrationUrl = "https://app.legacycoaching.com.my/account.html";
    const instructions =
      requestedRole === "coach"
        ? "Use this code on the coach registration form to complete your LEGACY+ onboarding."
        : "Use this code on the client registration form after completing your waiver.";

    await sendNoticeEmail({
      to: recipientEmail,
      subject: `Your LEGACY+ ${accountLabel} activation code`,
      eyebrow: "Activation Code",
      title: "Your registration code is ready",
      intro: instructions,
      metaRows: [
        { label: "Role", value: accountLabel === "coach" ? "Coach account" : "Client account" },
        { label: "Activation Code", value: code },
        { label: "Expires", value: expiresAt },
      ],
      ctaLabel: "Open Registration",
      ctaUrl: registrationUrl,
      footerNote: "If you did not request this registration code, contact LEGACY+ support.",
      tags: [
        { name: "category", value: "activation" },
        { name: "role", value: requestedRole },
      ],
    }).catch(() => null);

    return json(200, {
      ok: true,
      code: data,
    });
  } catch (error) {
    return errorResponse(error, "Unable to manage activation codes right now.");
  }
};
