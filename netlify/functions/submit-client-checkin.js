const { json, methodNotAllowed, noContent } = require("./_lib/http");
const {
  createHttpError,
  ensurePlannerRewardEventsForSubmission,
  normalizeDateOnly,
  normalizeNullableText,
  normalizeNumber,
  normalizeText,
  normalizeTimestamp,
  notifyClientAndCoach,
  parseBody,
  requireAllowedRole,
  requireManagedClientAccess,
  syncPlannerRewardEventsForSource,
  throwOnError,
} = require("./_lib/planner");
const { getAuthenticatedProfile, getServiceSupabase, resolvePrimaryCoachForClient } = require("./_lib/supabase");

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
    requireAllowedRole(auth.profile, ["client", "coach", "super_admin"]);

    const existingCheckinId = normalizeText(body.checkinId || body.checkin_id);
    const templateId = normalizeText(body.templateId || body.template_id);

    const clientId =
      auth.profile.role === "client"
        ? auth.profile.id
        : normalizeText(body.clientId || body.client_id);

    if (!clientId) {
      throw createHttpError(400, "Client ID is required.");
    }

    await requireManagedClientAccess(supabase, auth.profile, clientId);

    let scheduledCheckin = null;
    if (existingCheckinId) {
      const existingCheckinResponse = await supabase
        .from("client_checkins")
        .select("*")
        .eq("id", existingCheckinId)
        .maybeSingle();
      throwOnError(existingCheckinResponse);
      scheduledCheckin = existingCheckinResponse.data;
      if (!scheduledCheckin?.id) {
        throw createHttpError(404, "Scheduled health form not found.");
      }
      if (scheduledCheckin.client_id !== clientId) {
        throw createHttpError(403, "This scheduled health form does not belong to the selected client.");
      }
    }

    const resolvedTemplateId = templateId || scheduledCheckin?.template_id;
    if (!resolvedTemplateId) {
      throw createHttpError(400, "Health template ID is required.");
    }

    const templateResponse = await supabase.from("checkin_templates").select("*").eq("id", resolvedTemplateId).maybeSingle();
    throwOnError(templateResponse);
    const template = templateResponse.data;
    if (!template?.id) {
      throw createHttpError(404, "Health template not found.");
    }

    const coachId =
      normalizeText(body.coachId || body.coach_id)
      || normalizeText(scheduledCheckin?.coach_id)
      || normalizeText(template.coach_id)
      || (await resolvePrimaryCoachForClient(supabase, clientId))
      || null;

    const dueAt =
      normalizeTimestamp(body.dueAt || body.due_at || scheduledCheckin?.due_at)
      || new Date().toISOString();
    const submittedAt =
      normalizeTimestamp(body.submittedAt || body.submitted_at)
      || new Date().toISOString();

    const isLate = new Date(submittedAt).getTime() > new Date(dueAt).getTime();
    let checkin = null;
    if (scheduledCheckin?.id) {
      const checkinUpdateResponse = await supabase
        .from("client_checkins")
        .update({
          coach_id: coachId,
          template_id: template.id,
          assignment_id:
            normalizeNullableText(body.assignmentId || body.assignment_id)
            || scheduledCheckin.assignment_id
            || null,
          cadence: normalizeText(body.cadence || scheduledCheckin.cadence || template.cadence || "weekly"),
          due_at: dueAt,
          submitted_at: submittedAt,
          status: isLate ? "late" : "submitted",
          overall_adherence_score: normalizeNumber(body.overallAdherenceScore || body.overall_adherence_score),
          coach_comment: scheduledCheckin.coach_comment || normalizeNullableText(body.coachComment || body.coach_comment),
          review_status: "pending",
          reviewed_by: null,
          reviewed_at: null,
        })
        .eq("id", scheduledCheckin.id)
        .select("*")
        .single();
      throwOnError(checkinUpdateResponse);
      checkin = checkinUpdateResponse.data;

      const deleteAnswersResponse = await supabase.from("client_checkin_answers").delete().eq("checkin_id", scheduledCheckin.id);
      throwOnError(deleteAnswersResponse);

      const deleteMetricsResponse = await supabase.from("client_body_metric_entries").delete().eq("checkin_id", scheduledCheckin.id);
      throwOnError(deleteMetricsResponse);
    } else {
      const checkinInsertResponse = await supabase
        .from("client_checkins")
        .insert({
          client_id: clientId,
          coach_id: coachId,
          template_id: template.id,
          assignment_id: normalizeNullableText(body.assignmentId || body.assignment_id),
          cadence: normalizeText(body.cadence || template.cadence || "weekly"),
          due_at: dueAt,
          submitted_at: submittedAt,
          status: isLate ? "late" : "submitted",
          overall_adherence_score: normalizeNumber(body.overallAdherenceScore || body.overall_adherence_score),
          coach_comment: normalizeNullableText(body.coachComment || body.coach_comment),
          review_status: "pending",
        })
        .select("*")
        .single();
      throwOnError(checkinInsertResponse);
      checkin = checkinInsertResponse.data;
    }

    const answers = Array.isArray(body.answers) ? body.answers : [];
    if (answers.length) {
      const answerRows = answers.map((answer, index) => ({
        checkin_id: checkin.id,
        question_id: normalizeNullableText(answer.questionId || answer.question_id),
        field_key: normalizeText(answer.fieldKey || answer.field_key || `field_${index + 1}`),
        value_text: normalizeNullableText(answer.valueText || answer.value_text),
        value_number: normalizeNumber(answer.valueNumber || answer.value_number),
        value_boolean:
          typeof answer.valueBoolean === "boolean"
            ? answer.valueBoolean
            : typeof answer.value_boolean === "boolean"
              ? answer.value_boolean
              : null,
        value_date: normalizeDateOnly(answer.valueDate || answer.value_date),
        value_json: answer.valueJson && typeof answer.valueJson === "object" ? answer.valueJson : {},
      }));

      const answersInsertResponse = await supabase.from("client_checkin_answers").insert(answerRows);
      throwOnError(answersInsertResponse);
    }

    const metrics = Array.isArray(body.metrics) ? body.metrics : [];
    if (metrics.length) {
      const metricRows = metrics
        .map((metric) => ({
          client_id: clientId,
          coach_id: coachId,
          checkin_id: checkin.id,
          metric_type: normalizeText(metric.metricType || metric.metric_type),
          metric_value: normalizeNumber(metric.metricValue || metric.metric_value),
          metric_unit: normalizeText(metric.metricUnit || metric.metric_unit),
          captured_at: submittedAt,
          note: normalizeNullableText(metric.note),
        }))
        .filter((metric) => metric.metric_type && Number.isFinite(metric.metric_value));

      if (metricRows.length) {
        const metricsInsertResponse = await supabase.from("client_body_metric_entries").insert(metricRows);
        throwOnError(metricsInsertResponse);
      }
    }

    await notifyClientAndCoach(supabase, {
      category: "planner",
      coachId,
      coachTitle: "Client health update submitted",
      coachBody: `A ${checkin.cadence} health update is ready for review.`,
      coachActionUrl: "./coach-dashboard.html",
    }).catch(() => null);

    if (auth.profile.role !== "client" && checkin.review_status === "approved") {
      await ensurePlannerRewardEventsForSubmission(supabase, {
        type: "checkin",
        record: checkin,
        requestedBy: auth.profile.id,
      }).catch(() => null);

      await syncPlannerRewardEventsForSource(supabase, auth.profile, {
        type: "checkin",
        sourceRecordId: checkin.id,
        decision: "approved",
      }).catch(() => null);
    }

    return json(200, {
      ok: true,
      checkin,
      message: "Health update submitted.",
    });
  } catch (error) {
    return json(Number(error?.statusCode || 500), {
      error: error?.message || "Unable to submit the health update right now.",
    });
  }
};
