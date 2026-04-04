const { json, methodNotAllowed, noContent } = require("./_lib/http");
const {
  addDays,
  createHttpError,
  loadProgramTemplateGraph,
  materializeProgramAssignment,
  normalizeDateOnly,
  normalizeNullableText,
  normalizeText,
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
    const replaceAssignmentId = normalizeText(body.replaceAssignmentId || body.replace_assignment_id);
    const startDate = normalizeDateOnly(body.startDate || body.start_date) || new Date().toISOString().slice(0, 10);

    if (!clientId || !templateId) {
      throw createHttpError(400, "Both client ID and template ID are required.");
    }

    await requireManagedClientAccess(supabase, auth.profile, clientId);

    const graph = await loadProgramTemplateGraph(supabase, templateId);
    if (!graph.template?.id) {
      throw createHttpError(404, "Program template not found.");
    }

    let replacedAssignment = null;
    if (replaceAssignmentId) {
      const replacedAssignmentResponse = await supabase
        .from("client_program_assignments")
        .select("*")
        .eq("id", replaceAssignmentId)
        .maybeSingle();
      throwOnError(replacedAssignmentResponse);
      replacedAssignment = replacedAssignmentResponse.data || null;

      if (!replacedAssignment?.id) {
        throw createHttpError(404, "The live client block you are replacing could not be found.");
      }
      if (String(replacedAssignment.client_id || "") !== clientId) {
        throw createHttpError(400, "The replacement block does not belong to the selected client.");
      }
    }

    const coachId =
      auth.profile.role === "super_admin"
        ? normalizeText(body.coachId || body.coach_id || graph.template.coach_id || auth.profile.id)
        : auth.profile.id;

    const assignmentInsertResponse = await supabase
      .from("client_program_assignments")
      .insert({
        client_id: clientId,
        coach_id: coachId,
        template_id: graph.template.id,
        title: normalizeText(body.title || graph.template.title),
        objective: normalizeNullableText(body.objective || graph.template.objective),
        start_date: startDate,
        end_date: normalizeDateOnly(body.endDate || body.end_date),
        current_week: 1,
        status: normalizeText(body.status || "active"),
        custom_targets: body.customTargets && typeof body.customTargets === "object" ? body.customTargets : [],
        notes: normalizeNullableText(body.notes),
      })
      .select("*")
      .single();

    throwOnError(assignmentInsertResponse);
    const assignment = assignmentInsertResponse.data;

    const materialized = await materializeProgramAssignment(supabase, assignment, graph);

    if (replacedAssignment?.id) {
      const supersededNotes = [
        normalizeText(replacedAssignment.notes),
        `Superseded by ${assignment.title || "a refreshed live block"} on ${startDate}.`,
      ]
        .filter(Boolean)
        .join("\n");

      const replacementUpdateResponse = await supabase
        .from("client_program_assignments")
        .update({
          status: "completed",
          end_date: normalizeDateOnly(replacedAssignment.end_date) || addDays(startDate, -1) || startDate,
          notes: normalizeNullableText(supersededNotes),
        })
        .eq("id", replacedAssignment.id)
        .select("id")
        .maybeSingle();

      if (replacementUpdateResponse?.error) {
        await supabase
          .from("client_program_assignments")
          .update({
            status: "cancelled",
            end_date: startDate,
            notes: normalizeNullableText(
              [
                normalizeText(assignment.notes),
                "Auto-cancelled because the previous live block could not be superseded cleanly.",
              ]
                .filter(Boolean)
                .join("\n")
            ),
          })
          .eq("id", assignment.id);

        throw createHttpError(
          500,
          "The refreshed block was created but the previous live block could not be closed. Nothing new was left live. Please try again."
        );
      }
    }

    await notifyClientAndCoach(supabase, {
      category: "planner",
      clientId,
      clientTitle: "A new program has been assigned",
      clientBody: `${assignment.title} is now active in your coaching plan.`,
      clientActionUrl: "./client-dashboard.html",
    }).catch(() => null);

    return json(200, {
      ok: true,
      assignment,
      materializedCounts: {
        days: (materialized.days || []).length,
        exercises: (materialized.exercises || []).length,
      },
      replacedAssignmentId: replacedAssignment?.id || null,
      message: "Program assigned successfully.",
    });
  } catch (error) {
    return json(Number(error?.statusCode || 500), {
      error: error?.message || "Unable to assign the program right now.",
    });
  }
};
