const { json, methodNotAllowed, noContent } = require("./_lib/http");
const { sendNoticeEmail } = require("./_lib/email");
const { getAuthenticatedUser, getServiceSupabase } = require("./_lib/supabase");

function parseBody(event) {
  try {
    return JSON.parse(event.body || "{}");
  } catch (_) {
    return null;
  }
}

async function requireSuperAdmin(supabase, event) {
  const user = await getAuthenticatedUser(event, supabase);
  if (!user) {
    return { error: json(401, { error: "A valid admin session is required." }) };
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, role, display_name")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !profile || profile.role !== "super_admin") {
    return { error: json(403, { error: "Only super admin accounts can convert leads." }) };
  }

  return { user, profile };
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

  const leadId = String(body.leadId || "").trim();
  const coachId = String(body.coachId || "").trim() || null;
  const temporaryPassword = String(body.temporaryPassword || "").trim();

  if (!leadId) {
    return json(400, { error: "leadId is required." });
  }

  if (!temporaryPassword || temporaryPassword.length < 6) {
    return json(400, { error: "A temporary password with at least 6 characters is required." });
  }

  const supabase = getServiceSupabase();
  const authResult = await requireSuperAdmin(supabase, event);
  if (authResult.error) {
    return authResult.error;
  }

  const { user: adminUser, profile: adminProfile } = authResult;

  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .select("id, full_name, email, phone, status, owner_id, converted_client_id")
    .eq("id", leadId)
    .maybeSingle();

  if (leadError) {
    return json(500, { error: "Unable to load the lead record." });
  }

  if (!lead) {
    return json(404, { error: "Lead not found." });
  }

  if (!lead.email) {
    return json(400, { error: "This lead does not have an email address, so a client account cannot be created yet." });
  }

  if (lead.converted_client_id) {
    return json(409, { error: "This lead has already been converted into a client." });
  }

  if (coachId) {
    const { data: coachProfile, error: coachError } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", coachId)
      .maybeSingle();

    if (coachError || !coachProfile || coachProfile.role !== "coach") {
      return json(400, { error: "coachId must reference a valid coach profile." });
    }
  }

  let createdClientId = null;
  let createdAssignmentId = null;

  try {
    const createUserResponse = await supabase.auth.admin.createUser({
      email: lead.email,
      password: temporaryPassword,
      email_confirm: true,
      user_metadata: {
        role: "client",
        display_name: lead.full_name,
        phone: lead.phone || "",
      },
      app_metadata: {
        role: "client",
      },
    });

    if (createUserResponse.error || !createUserResponse.data?.user?.id) {
      return json(400, {
        error: createUserResponse.error?.message || "Unable to create the client auth account.",
      });
    }

    createdClientId = createUserResponse.data.user.id;

    if (coachId) {
      const assignmentInsert = await supabase
        .from("coach_client_assignments")
        .insert({
          coach_id: coachId,
          client_id: createdClientId,
          status: "active",
          assigned_at: new Date().toISOString(),
          created_by: adminUser.id,
          notes: `Created automatically from lead conversion ${lead.id}`,
        })
        .select("id")
        .single();

      if (assignmentInsert.error || !assignmentInsert.data?.id) {
        throw assignmentInsert.error || new Error("Unable to assign a coach to the new client.");
      }

      createdAssignmentId = assignmentInsert.data.id;
    }

    if (coachId) {
      const clientProfileUpdate = await supabase
        .from("client_profiles")
        .update({
          preferred_coach_id: coachId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", createdClientId);

      if (clientProfileUpdate.error) {
        throw clientProfileUpdate.error;
      }
    }

    const leadUpdate = await supabase
      .from("leads")
      .update({
        status: "converted",
        converted_client_id: createdClientId,
        owner_id: coachId || lead.owner_id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", lead.id);

    if (leadUpdate.error) {
      throw leadUpdate.error;
    }

    const activityInsert = await supabase.from("lead_activities").insert({
      lead_id: lead.id,
      actor_id: adminUser.id,
      activity_type: "converted",
      notes: coachId
        ? `Converted to client account and assigned to coach ${coachId}.`
        : "Converted to client account.",
    });

    if (activityInsert.error) {
      throw activityInsert.error;
    }

    await sendNoticeEmail({
      to: lead.email,
      subject: "Your LEGACY+ client account is ready",
      eyebrow: "Account Ready",
      title: "Your client portal is now active",
      intro: "Your LEGACY+ client account has been created. Use the temporary password below to sign in, then change it after your first login.",
      metaRows: [
        { label: "Email", value: lead.email },
        { label: "Temporary Password", value: temporaryPassword },
        { label: "Assigned Coach", value: coachId ? "Assigned" : "Pending assignment" },
      ],
      ctaLabel: "Open Client Account",
      ctaUrl: "./account.html",
      footerNote: "For security, change this password after your first login.",
      tags: [
        { name: "category", value: "account" },
        { name: "event", value: "lead_converted" },
      ],
    }).catch(() => null);

    return json(200, {
      ok: true,
      leadId: lead.id,
      clientId: createdClientId,
      email: lead.email,
      temporaryPassword,
      assignedCoachId: coachId,
      adminDisplayName: adminProfile.display_name || adminUser.email || "super admin",
    });
  } catch (error) {
    if (createdAssignmentId) {
      await supabase.from("coach_client_assignments").delete().eq("id", createdAssignmentId);
    }

    if (createdClientId) {
      await supabase.auth.admin.deleteUser(createdClientId);
    }

    return json(500, {
      error: error.message || "Unable to convert the lead into a client.",
    });
  }
};
