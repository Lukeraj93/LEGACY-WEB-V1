const { json, methodNotAllowed, noContent } = require("./_lib/http");
const {
  createHttpError,
  normalizeArray,
  normalizeBoolean,
  normalizeJson,
  normalizeNullableText,
  normalizeText,
  parseBody,
  requireAllowedRole,
  throwOnError,
} = require("./_lib/planner");
const { getAuthenticatedProfile, getServiceSupabase } = require("./_lib/supabase");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return noContent({ "Cache-Control": "no-store" });
  }

  if (!["POST", "PUT"].includes(event.httpMethod)) {
    return methodNotAllowed("POST, PUT, OPTIONS");
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

    const templateInput = body.template || body;
    const templateId = normalizeText(templateInput.id);
    const coachId =
      auth.profile.role === "super_admin"
        ? normalizeNullableText(templateInput.coachId || templateInput.coach_id || auth.profile.id)
        : auth.profile.id;

    const templateRow = {
      coach_id: coachId,
      title: normalizeText(templateInput.title),
      description: normalizeNullableText(templateInput.description),
      cadence: normalizeText(templateInput.cadence || "weekly"),
      form_type: normalizeText(templateInput.formType || templateInput.form_type || "weekly_checkin"),
      is_active: normalizeBoolean(templateInput.isActive ?? templateInput.is_active, true),
      settings: normalizeJson(templateInput.settings, {}),
    };

    if (!templateRow.title) {
      throw createHttpError(400, "Health template title is required.");
    }

    let savedTemplate = null;
    if (templateId) {
      const existingResponse = await supabase.from("checkin_templates").select("*").eq("id", templateId).maybeSingle();
      throwOnError(existingResponse);
      if (!existingResponse.data?.id) {
        throw createHttpError(404, "Health template not found.");
      }
      if (auth.profile.role === "coach" && existingResponse.data.coach_id !== auth.profile.id) {
        throw createHttpError(403, "You can only edit your own health templates.");
      }

      const updateResponse = await supabase
        .from("checkin_templates")
        .update(templateRow)
        .eq("id", templateId)
        .select("*")
        .single();
      throwOnError(updateResponse);
      savedTemplate = updateResponse.data;

      const deleteQuestionsResponse = await supabase
        .from("checkin_template_questions")
        .delete()
        .eq("template_id", templateId);
      throwOnError(deleteQuestionsResponse);
    } else {
      const insertResponse = await supabase.from("checkin_templates").insert(templateRow).select("*").single();
      throwOnError(insertResponse);
      savedTemplate = insertResponse.data;
    }

    const questions = Array.isArray(body.questions)
      ? body.questions
      : Array.isArray(templateInput.questions)
        ? templateInput.questions
        : [];

    let questionCount = 0;
    if (questions.length) {
      const questionRows = questions.map((question, index) => ({
        template_id: savedTemplate.id,
        sort_order: Number(question.sortOrder || question.sort_order || index),
        field_key: normalizeText(question.fieldKey || question.field_key || `field_${index + 1}`),
        label: normalizeText(question.label || question.question || `Question ${index + 1}`),
        question_type: normalizeText(question.questionType || question.question_type || "text"),
        is_required: normalizeBoolean(question.isRequired ?? question.is_required),
        is_conditional: normalizeBoolean(question.isConditional ?? question.is_conditional),
        condition_rules: normalizeJson(question.conditionRules || question.condition_rules, {}),
        options: normalizeArray(question.options),
        validation_rules: normalizeJson(question.validationRules || question.validation_rules, {}),
        help_text: normalizeNullableText(question.helpText || question.help_text),
      }));

      const insertQuestionsResponse = await supabase
        .from("checkin_template_questions")
        .insert(questionRows)
        .select("id");
      throwOnError(insertQuestionsResponse);
      questionCount = (insertQuestionsResponse.data || []).length;
    }

    return json(200, {
      ok: true,
      template: savedTemplate,
      questionCount,
      message: templateId ? "Health template updated." : "Health template created.",
    });
  } catch (error) {
    return json(Number(error?.statusCode || 500), {
      error: error?.message || "Unable to save the health template right now.",
    });
  }
};
