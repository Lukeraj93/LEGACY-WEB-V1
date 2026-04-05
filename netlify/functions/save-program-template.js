const { json, methodNotAllowed, noContent } = require("./_lib/http");
const {
  createHttpError,
  normalizeArray,
  normalizeBoolean,
  normalizeInteger,
  normalizeJson,
  normalizeNullableText,
  normalizeNumber,
  normalizeText,
  parseBody,
  requireAllowedRole,
  throwOnError,
} = require("./_lib/planner");
const { getAuthenticatedProfile, getServiceSupabase } = require("./_lib/supabase");

function sanitizeTemplate(input, coachId) {
  const template = input && typeof input === "object" ? input : {};

  return {
    coach_id: coachId,
    source_workout_id: normalizeNullableText(template.sourceWorkoutId || template.source_workout_id),
    title: normalizeText(template.title),
    description: normalizeNullableText(template.description),
    category: normalizeText(template.category || "strength"),
    difficulty: normalizeText(template.difficulty || "intermediate"),
    estimated_duration_minutes: normalizeInteger(template.estimatedDurationMinutes || template.estimated_duration_minutes),
    calories_burned_estimate: normalizeInteger(template.caloriesBurnedEstimate || template.calories_burned_estimate),
    goals: normalizeArray(template.goals),
    target_muscle_groups: normalizeArray(template.targetMuscleGroups || template.target_muscle_groups),
    equipment_required: normalizeArray(template.equipmentRequired || template.equipment_required),
    image_url: normalizeNullableText(template.imageUrl || template.image_url),
    warmup_instructions: normalizeNullableText(template.warmupInstructions || template.warmup_instructions),
    cooldown_instructions: normalizeNullableText(template.cooldownInstructions || template.cooldown_instructions),
    notes: normalizeNullableText(template.notes),
    workout_type: normalizeNullableText(template.workoutType || template.workout_type),
    rest_between_exercises_seconds: normalizeInteger(
      template.restBetweenExercisesSeconds || template.rest_between_exercises_seconds
    ),
    rest_between_rounds_seconds: normalizeInteger(template.restBetweenRoundsSeconds || template.rest_between_rounds_seconds),
    duration_weeks: normalizeInteger(template.durationWeeks || template.duration_weeks) || 1,
    objective: normalizeNullableText(template.objective),
    audience: normalizeNullableText(template.audience),
    status: normalizeText(template.status || "draft"),
    is_public: normalizeBoolean(template.isPublic || template.is_public),
    tags: normalizeArray(template.tags),
  };
}

function sanitizeExercise(input, index) {
  const exercise = input && typeof input === "object" ? input : {};
  const intensityMode = String(exercise.intensityMode || exercise.intensity_mode || "none")
    .trim()
    .toLowerCase();

  return {
    sort_order: normalizeInteger(exercise.sortOrder || exercise.sort_order) ?? index,
    exercise_id: normalizeNullableText(exercise.exerciseId || exercise.exercise_id),
    name_override: normalizeNullableText(exercise.nameOverride || exercise.name_override),
    block_label: normalizeNullableText(exercise.blockLabel || exercise.block_label),
    sets: normalizeInteger(exercise.sets),
    reps: normalizeInteger(exercise.reps),
    rep_range_min: normalizeInteger(exercise.repRangeMin || exercise.rep_range_min),
    rep_range_max: normalizeInteger(exercise.repRangeMax || exercise.rep_range_max),
    prescribed_weight_kg: normalizeNumber(exercise.prescribedWeightKg || exercise.prescribed_weight_kg),
    percentage_of_1rm: normalizeNumber(exercise.percentageOf1rm || exercise.percentage_of_1rm),
    one_rep_max_kg: normalizeNumber(exercise.oneRepMaxKg || exercise.one_rep_max_kg),
    duration_seconds: normalizeInteger(exercise.durationSeconds || exercise.duration_seconds),
    distance_meters: normalizeNumber(exercise.distanceMeters || exercise.distance_meters),
    rest_time_seconds: normalizeInteger(exercise.restTimeSeconds || exercise.rest_time_seconds),
    rest_range_min: normalizeInteger(exercise.restRangeMin || exercise.rest_range_min),
    rest_range_max: normalizeInteger(exercise.restRangeMax || exercise.rest_range_max),
    tempo: normalizeNullableText(exercise.tempo),
    intensity_mode: ["rpe", "rir"].includes(intensityMode) ? intensityMode : "none",
    intensity_value: normalizeNumber(exercise.intensityValue || exercise.intensity_value),
    set_type: normalizeNullableText(exercise.setType || exercise.set_type),
    is_amrap: normalizeBoolean(exercise.isAmrap || exercise.is_amrap),
    heart_rate_zone: normalizeInteger(exercise.heartRateZone || exercise.heart_rate_zone),
    progressive_overload_goal: normalizeNullableText(
      exercise.progressiveOverloadGoal || exercise.progressive_overload_goal
    ),
    form_cues: normalizeArray(exercise.formCues || exercise.form_cues),
    substitutions: normalizeArray(exercise.substitutions),
    contraindications: normalizeArray(exercise.contraindications),
    notes: normalizeNullableText(exercise.notes),
    metadata: normalizeJson(exercise.metadata, {}),
  };
}

async function insertRowsInChunks(supabaseQueryBuilderFactory, rows, chunkSize = 200) {
  if (!Array.isArray(rows) || !rows.length) {
    return;
  }
  for (let start = 0; start < rows.length; start += chunkSize) {
    const chunk = rows.slice(start, start + chunkSize);
    const response = await supabaseQueryBuilderFactory(chunk);
    throwOnError(response);
  }
}

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

    const targetCoachId =
      auth.profile.role === "super_admin"
        ? normalizeText(body.coachId || body.coach_id || auth.profile.id)
        : auth.profile.id;

    const templateInput = body.template || body;
    const templateId = normalizeText(templateInput.id);
    const templateRow = sanitizeTemplate(templateInput, targetCoachId);

    if (!templateRow.title) {
      throw createHttpError(400, "Template title is required.");
    }

    const weeks = Array.isArray(body.weeks) ? body.weeks : Array.isArray(templateInput.weeks) ? templateInput.weeks : [];

    let savedTemplate = null;
    if (templateId) {
      const existingResponse = await supabase.from("program_templates").select("*").eq("id", templateId).maybeSingle();
      throwOnError(existingResponse);
      const existing = existingResponse.data;
      if (!existing?.id) {
        throw createHttpError(404, "Program template not found.");
      }
      if (auth.profile.role === "coach" && existing.coach_id !== auth.profile.id) {
        throw createHttpError(403, "You can only edit your own templates.");
      }

      const updateResponse = await supabase
        .from("program_templates")
        .update(templateRow)
        .eq("id", templateId)
        .select("*")
        .single();
      throwOnError(updateResponse);
      savedTemplate = updateResponse.data;

      const deleteWeeksResponse = await supabase.from("program_template_weeks").delete().eq("template_id", templateId);
      throwOnError(deleteWeeksResponse);
    } else {
      const insertResponse = await supabase.from("program_templates").insert(templateRow).select("*").single();
      throwOnError(insertResponse);
      savedTemplate = insertResponse.data;
    }

    const normalizedWeeks = weeks.map((week, weekIndex) => {
      const sourceWeek = week && typeof week === "object" ? week : {};
      return {
        source: sourceWeek,
        weekNumber: normalizeInteger(sourceWeek.weekNumber || sourceWeek.week_number) || weekIndex + 1,
        title: normalizeNullableText(sourceWeek.title),
        summary: normalizeNullableText(sourceWeek.summary),
        notes: normalizeNullableText(sourceWeek.notes),
        days: Array.isArray(sourceWeek.days) ? sourceWeek.days : [],
      };
    });

    const weekRows = normalizedWeeks.map((week) => ({
      template_id: savedTemplate.id,
      week_number: week.weekNumber,
      title: week.title,
      summary: week.summary,
      notes: week.notes,
    }));

    let savedWeeks = [];
    if (weekRows.length) {
      const weekInsertResponse = await supabase
        .from("program_template_weeks")
        .insert(weekRows)
        .select("id, week_number");
      throwOnError(weekInsertResponse);
      savedWeeks = Array.isArray(weekInsertResponse.data) ? weekInsertResponse.data : [];
    }

    const weekIdByNumber = new Map(
      savedWeeks.map((weekRow) => [Number(weekRow.week_number || 0), weekRow.id]).filter(([weekNumber, id]) => weekNumber && id)
    );

    const dayRows = [];
    normalizedWeeks.forEach((week) => {
      const savedWeekId = weekIdByNumber.get(week.weekNumber);
      if (!savedWeekId) {
        return;
      }
      week.days.forEach((day, dayIndex) => {
        const sourceDay = day && typeof day === "object" ? day : {};
        const dayNumber = normalizeInteger(sourceDay.dayNumber || sourceDay.day_number) || dayIndex + 1;
        dayRows.push({
          template_week_id: savedWeekId,
          day_number: dayNumber,
          title: normalizeText(sourceDay.title || `Day ${dayNumber}`),
          focus: normalizeNullableText(sourceDay.focus),
          day_type: normalizeText(sourceDay.dayType || sourceDay.day_type || "workout"),
          estimated_duration_minutes: normalizeInteger(sourceDay.estimatedDurationMinutes || sourceDay.estimated_duration_minutes),
          notes: normalizeNullableText(sourceDay.notes),
        });
      });
    });

    let savedDays = [];
    if (dayRows.length) {
      const dayInsertResponse = await supabase
        .from("program_template_days")
        .insert(dayRows)
        .select("id, template_week_id, day_number");
      throwOnError(dayInsertResponse);
      savedDays = Array.isArray(dayInsertResponse.data) ? dayInsertResponse.data : [];
    }

    const dayIdByKey = new Map(
      savedDays.map((dayRow) => [`${dayRow.template_week_id}:${dayRow.day_number}`, dayRow.id]).filter(([, id]) => id)
    );

    const exerciseRows = [];
    normalizedWeeks.forEach((week) => {
      const savedWeekId = weekIdByNumber.get(week.weekNumber);
      if (!savedWeekId) {
        return;
      }
      week.days.forEach((day, dayIndex) => {
        const sourceDay = day && typeof day === "object" ? day : {};
        const dayNumber = normalizeInteger(sourceDay.dayNumber || sourceDay.day_number) || dayIndex + 1;
        const savedDayId = dayIdByKey.get(`${savedWeekId}:${dayNumber}`);
        if (!savedDayId) {
          return;
        }
        const exercises = Array.isArray(sourceDay.exercises) ? sourceDay.exercises : [];
        exercises.forEach((exercise, exerciseIndex) => {
          exerciseRows.push({
            template_day_id: savedDayId,
            ...sanitizeExercise(exercise, exerciseIndex),
          });
        });
      });
    });

    await insertRowsInChunks(
      (chunk) => supabase.from("program_template_exercises").insert(chunk),
      exerciseRows
    );

    const weekCount = weekRows.length;
    const dayCount = dayRows.length;
    const exerciseCount = exerciseRows.length;

    return json(200, {
      ok: true,
      template: savedTemplate,
      counts: {
        weeks: weekCount,
        days: dayCount,
        exercises: exerciseCount,
      },
      message: templateId ? "Program template updated." : "Program template created.",
    });
  } catch (error) {
    return json(Number(error?.statusCode || 500), {
      error: error?.message || "Unable to save the program template right now.",
    });
  }
};
