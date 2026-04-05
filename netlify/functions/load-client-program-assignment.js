const { json, methodNotAllowed, noContent } = require("./_lib/http");
const {
  createHttpError,
  normalizeJson,
  normalizeText,
  requireAllowedRole,
  requireManagedClientAccess,
  throwOnError,
} = require("./_lib/planner");
const { getAuthenticatedProfile, getServiceSupabase } = require("./_lib/supabase");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return noContent({ "Cache-Control": "no-store" });
  }

  if (event.httpMethod !== "GET") {
    return methodNotAllowed("GET, OPTIONS");
  }

  const supabase = getServiceSupabase();
  const auth = await getAuthenticatedProfile(event, supabase);
  if (!auth?.profile) {
    return json(401, { error: "A valid authenticated session is required." }, { "Cache-Control": "no-store" });
  }

  try {
    requireAllowedRole(auth.profile, ["coach", "super_admin"]);

    const assignmentId = normalizeText(
      event.queryStringParameters?.assignmentId || event.queryStringParameters?.id
    );
    if (!assignmentId) {
      throw createHttpError(400, "Choose a live client block before opening it.");
    }

    const assignmentResponse = await supabase
      .from("client_program_assignments")
      .select("*")
      .eq("id", assignmentId)
      .maybeSingle();
    throwOnError(assignmentResponse);

    const assignment = assignmentResponse.data || null;
    if (!assignment?.id) {
      throw createHttpError(404, "Client program assignment not found.");
    }

    await requireManagedClientAccess(supabase, auth.profile, assignment.client_id);

    const daysResponse = await supabase
      .from("client_program_days")
      .select("*")
      .eq("assignment_id", assignment.id)
      .order("week_number", { ascending: true })
      .order("day_number", { ascending: true });
    throwOnError(daysResponse);

    const days = daysResponse.data || [];
    const dayIds = days.map((day) => day.id).filter(Boolean);

    const [templateResponse, exercisesResponse, profileResponse, clientProfileResponse] = await Promise.all([
      assignment.template_id
        ? supabase.from("program_templates").select("*").eq("id", assignment.template_id).maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      dayIds.length
        ? supabase
            .from("client_program_day_exercises")
            .select("*")
            .in("client_program_day_id", dayIds)
            .order("sort_order", { ascending: true })
        : Promise.resolve({ data: [], error: null }),
      supabase
        .from("profiles")
        .select("id, display_name, avatar_url")
        .eq("id", assignment.client_id)
        .maybeSingle(),
      supabase
        .from("client_profiles")
        .select("id, preferred_name, primary_goal, member_id")
        .eq("id", assignment.client_id)
        .maybeSingle(),
    ]);

    [templateResponse, exercisesResponse, profileResponse, clientProfileResponse].forEach((response) => {
      if (response?.error) {
        throwOnError(response);
      }
    });

    const customTargets = normalizeJson(assignment.custom_targets, {});

    return json(
      200,
      {
        ok: true,
        assignment,
        template: templateResponse.data || null,
        days,
        exercises: exercisesResponse.data || [],
        workbook: customTargets?.workbook && typeof customTargets.workbook === "object" ? customTargets.workbook : null,
        sportProfile: customTargets?.sportProfile && typeof customTargets.sportProfile === "object" ? customTargets.sportProfile : null,
        client: {
          ...(profileResponse.data || {}),
          ...(clientProfileResponse.data || {}),
        },
        message: "Live client block loaded.",
      },
      { "Cache-Control": "no-store" }
    );
  } catch (error) {
    return json(
      Number(error?.statusCode || 500),
      { error: error?.message || "Unable to load the client block right now." },
      { "Cache-Control": "no-store" }
    );
  }
};
