const { json, methodNotAllowed, noContent } = require("./_lib/http");
const {
  createHttpError,
  normalizeDateOnly,
  normalizeNullableText,
  normalizeText,
  normalizeTimestamp,
  notifyClientAndCoach,
  parseBody,
  requireAllowedRole,
  requireManagedClientAccess,
  throwOnError,
} = require("./_lib/planner");
const { getAuthenticatedProfile, getServiceSupabase } = require("./_lib/supabase");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return noContent({ "Cache-Control": "no-store" });
  }

  if (event.httpMethod !== "POST") {
    return methodNotAllowed("POST, OPTIONS");
  }

  const body = parseBody(event);
  if (!body) {
    return json(400, { error: "Provide a valid JSON body." });
  }

  const supabase = getServiceSupabase();
  const auth = await getAuthenticatedProfile(event, supabase);
  if (!auth?.profile) {
    return json(401, { error: "A valid authenticated session is required." });
  }

  try {
    requireAllowedRole(auth.profile, ["coach", "super_admin"]);

    const clientId = normalizeText(body.clientId || body.client_id);
    const templateId = normalizeText(body.templateId || body.template_id);
    const dueAt =
      normalizeTimestamp(body.dueAt || body.due_at)
      || (normalizeDateOnly(body.dueDate || body.due_date) ? `${normalizeDateOnly(body.dueDate || body.due_date)}T08:00:00.000Z` : null);

    if (!clientId || !templateId || !dueAt) {
      throw createHttpError(400, "Client ID, template ID, and due date/time are required.");
    }

    await requireManagedClientAccess(supabase, auth.profile, clientId);

    const templateResponse = await supabase.from("checkin_templates").select("*").eq("id", templateId).maybeSingle();
    throwOnError(templateResponse);
    const template = templateResponse.data;
    if (!template?.id) {
      throw createHttpError(404, "Health template not found.");
    }

    const coachId =
      auth.profile.role === "super_admin"
        ? normalizeText(body.coachId || body.coach_id || template.coach_id || auth.profile.id)
        : auth.profile.id;

    const existingResponse = await supabase
      .from("client_checkins")
      .select("*")
      .eq("client_id", clientId)
      .eq("template_id", template.id)
      .eq("due_at", dueAt)
      .is("submitted_at", null)
      .maybeSingle();
    throwOnError(existingResponse);

    if (existingResponse.data?.id) {
      return json(200, {
        ok: true,
        checkin: existingResponse.data,
        message: "That health form is already scheduled.",
      });
    }

    const insertResponse = await supabase
      .from("client_checkins")
      .insert({
        client_id: clientId,
        coach_id: coachId,
        template_id: template.id,
        assignment_id: normalizeNullableText(body.assignmentId || body.assignment_id),
        cadence: normalizeText(body.cadence || template.cadence || "weekly"),
        due_at: dueAt,
        submitted_at: null,
        status: "due",
        overall_adherence_score: null,
        coach_comment: normalizeNullableText(body.coachComment || body.coach_comment),
        review_status: "pending",
      })
      .select("*")
      .single();
    throwOnError(insertResponse);

    await notifyClientAndCoach(supabase, {
      category: "planner",
      clientId,
      clientTitle: "A health form has been scheduled",
      clientBody: `${template.title} is now due on ${new Intl.DateTimeFormat("en-MY", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date(dueAt))}.`,
      clientActionUrl: "./client-planner.html",
    }).catch(() => null);

    return json(200, {
      ok: true,
      checkin: insertResponse.data,
      message: "Health form scheduled.",
    });
  } catch (error) {
    return json(Number(error?.statusCode || 500), {
      error: error?.message || "Unable to schedule the health form right now.",
    });
  }
};
