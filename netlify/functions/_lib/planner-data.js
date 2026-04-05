const { throwOnError } = require("./planner");
const {
  buildServingsByFoodId,
  buildSourceMappingsByFoodId,
  normalizeFoodRecord,
  normalizeRecipeRecord,
  recipeIsVisibleToUser,
} = require("./nutrition-catalog");
const { listManagedClientIdsForCoach } = require("./supabase");
const athleteEngine = require("../../../planner-athlete-engine.js");

const PLANNER_PROGRESS_PHOTO_BUCKET = "client-progress-photos";
const PLANNER_NUTRITION_PHOTO_BUCKET = "client-meal-photos";
const PLANNER_PHOTO_SIGN_TTL_SECONDS = 60 * 30;

function buildAccess(auth) {
  return {
    user: {
      id: auth?.user?.id || "",
      email: auth?.user?.email || "",
    },
    role: auth?.profile?.role || "",
    status: auth?.profile?.status || "active",
  };
}

function uniqueValues(values) {
  return Array.from(new Set((values || []).filter(Boolean)));
}

function clonePlainObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? { ...value }
    : null;
}

async function addSignedStorageUrls(supabase, rows, bucket) {
  const assets = Array.isArray(rows) ? rows : [];
  if (!assets.length || !bucket) {
    return assets;
  }

  const signedByIndex = new Map();
  await Promise.all(
    assets.map(async (asset, index) => {
      const storagePath = String(asset?.storage_path || "").trim();
      if (!storagePath) {
        return;
      }

      try {
        const { data, error } = await supabase.storage
          .from(bucket)
          .createSignedUrl(storagePath, PLANNER_PHOTO_SIGN_TTL_SECONDS, { download: false });
        if (!error && data?.signedUrl) {
          signedByIndex.set(index, data.signedUrl);
        }
      } catch (_) {
        // Keep planner payload available even if one thumbnail cannot be signed.
      }
    })
  );

  return assets.map((asset, index) => ({
    ...asset,
    signed_url: signedByIndex.get(index) || "",
    signing_error: !signedByIndex.has(index) && String(asset?.storage_path || "").trim() ? "sign_failed" : null,
  }));
}

function enrichProgramExerciseMedia(rows) {
  return (rows || []).map((row) => {
    const resolvedDemo = athleteEngine?.resolveExerciseDemo?.(row) || null;
    const exerciseLibrary = clonePlainObject(row?.exercise_library);

    if (
      exerciseLibrary
      && resolvedDemo?.url
      && athleteEngine?.isPlaceholderVideoUrl?.(exerciseLibrary.video_url)
    ) {
      exerciseLibrary.video_url = resolvedDemo.url;
      exerciseLibrary.demo_source = resolvedDemo.source || "";
      exerciseLibrary.demo_note = resolvedDemo.note || "";
    }

    return {
      ...row,
      ...(exerciseLibrary ? { exercise_library: exerciseLibrary } : {}),
      ...(resolvedDemo ? { resolved_demo: resolvedDemo } : {}),
    };
  });
}

function buildClientFoodVisibilityContext(clientId, assignedCoachId) {
  return {
    role: "client",
    userId: clientId,
    ownerIds: new Set([clientId, assignedCoachId].filter(Boolean)),
  };
}

function buildCoachFoodVisibilityContext(coachId) {
  return {
    role: "coach",
    userId: coachId,
    ownerIds: new Set([coachId].filter(Boolean)),
  };
}

async function loadNormalizedCatalogFoods(supabase, foodIds, options = {}) {
  const ids = uniqueValues(foodIds);
  if (!ids.length) {
    return [];
  }

  const [foodsResponse, servingsResponse, sourceMappingsResponse] = await Promise.all([
    supabase.from("food_library").select("*").in("id", ids),
    supabase.from("food_servings").select("*").in("food_id", ids).order("sort_order", { ascending: true }),
    supabase.from("food_source_mappings").select("*").in("food_id", ids),
  ]);
  [foodsResponse, servingsResponse, sourceMappingsResponse].forEach(throwOnError);

  const servingsByFoodId = buildServingsByFoodId(servingsResponse.data || []);
  const sourceMappingsByFoodId = buildSourceMappingsByFoodId(sourceMappingsResponse.data || []);
  const favoriteFoodIds = new Set(options.favoriteFoodIds || []);
  const recentFoodIds = new Set(options.recentFoodIds || []);

  return (foodsResponse.data || []).map((food) =>
    normalizeFoodRecord(food, servingsByFoodId, sourceMappingsByFoodId, {
      favoriteFoodIds,
      recentFoodIds,
    })
  );
}

async function getClientPlannerPayload(supabase, auth) {
  const access = buildAccess(auth);
  const clientId = access.user.id;

  const assignedCoachResponse = await supabase
    .from("coach_client_assignments")
    .select("coach_id")
    .eq("client_id", clientId)
    .eq("status", "active")
    .order("assigned_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  throwOnError(assignedCoachResponse);
  const assignedCoachId = assignedCoachResponse.data?.coach_id || null;

  const [assignmentResponse, nutritionResponse, checkinsResponse, rewardEventsResponse, photosResponse, checkinTemplatesResponse] = await Promise.all([
    supabase
      .from("client_program_assignments")
      .select("*")
      .eq("client_id", clientId)
      .in("status", ["active", "paused"])
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("client_nutrition_plans")
      .select("*")
      .eq("client_id", clientId)
      .in("status", ["active", "paused"])
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("client_checkins")
      .select("*")
      .eq("client_id", clientId)
      .order("due_at", { ascending: false })
      .limit(12),
    supabase
      .from("planner_reward_events")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("progress_photo_entries")
      .select("*")
      .eq("client_id", clientId)
      .order("captured_at", { ascending: false })
      .limit(12),
    assignedCoachId
      ? supabase
          .from("checkin_templates")
          .select("*")
          .or(`coach_id.eq.${assignedCoachId},coach_id.is.null`)
          .eq("is_active", true)
          .order("updated_at", { ascending: false })
          .limit(12)
      : supabase
          .from("checkin_templates")
          .select("*")
          .is("coach_id", null)
          .eq("is_active", true)
          .order("updated_at", { ascending: false })
          .limit(12),
  ]);

  [
    assignmentResponse,
    nutritionResponse,
    checkinsResponse,
    rewardEventsResponse,
    photosResponse,
    checkinTemplatesResponse,
  ].forEach(throwOnError);

  const assignments = assignmentResponse.data || [];
  const activeAssignmentIds = assignments.map((item) => item.id);
  const nutritionPlans = nutritionResponse.data || [];
  const checkinTemplates = checkinTemplatesResponse.data || [];
  const photoEntries = photosResponse.data || [];

  const daysResponse = activeAssignmentIds.length
    ? await supabase
        .from("client_program_days")
        .select("*")
        .in("assignment_id", activeAssignmentIds)
        .order("scheduled_date", { ascending: true })
        .limit(60)
    : { data: [], error: null };
  throwOnError(daysResponse);

  const programDayIds = (daysResponse.data || []).map((item) => item.id);

  const [programExercisesResponse, workoutLogsResponse, nutritionLogsResponse, nutritionHabitsResponse, checkinQuestionsResponse, photoAssetsResponse] = await Promise.all([
    programDayIds.length
      ? supabase
          .from("client_program_day_exercises")
          .select("*, exercise_library(name, video_url, autoplay_video, custom_fields)")
          .in("client_program_day_id", programDayIds)
      : Promise.resolve({ data: [], error: null }),
    programDayIds.length
      ? supabase
          .from("client_workout_logs")
          .select("*")
          .in("client_program_day_id", programDayIds)
          .order("completed_at", { ascending: false })
          .limit(40)
      : Promise.resolve({ data: [], error: null }),
    nutritionPlans.length
      ? supabase
          .from("client_nutrition_logs")
          .select("*")
          .in(
            "nutrition_plan_id",
            nutritionPlans.map((item) => item.id)
          )
          .order("log_date", { ascending: false })
          .limit(20)
      : Promise.resolve({ data: [], error: null }),
    nutritionPlans.length
      ? supabase
          .from("client_nutrition_habits")
          .select("*")
          .in(
            "nutrition_plan_id",
            nutritionPlans.map((item) => item.id)
          )
          .order("sort_order", { ascending: true })
      : Promise.resolve({ data: [], error: null }),
    checkinTemplates.length
      ? supabase
          .from("checkin_template_questions")
          .select("*")
          .in(
            "template_id",
            checkinTemplates.map((item) => item.id)
          )
          .order("sort_order", { ascending: true })
      : Promise.resolve({ data: [], error: null }),
    photoEntries.length
      ? supabase
          .from("progress_photo_assets")
          .select("*")
          .in(
            "entry_id",
            photoEntries.map((item) => item.id)
          )
          .order("sort_order", { ascending: true })
      : Promise.resolve({ data: [], error: null }),
  ]);

  [programExercisesResponse, workoutLogsResponse, nutritionLogsResponse, nutritionHabitsResponse, checkinQuestionsResponse, photoAssetsResponse].forEach(throwOnError);
  const workoutLogs = workoutLogsResponse.data || [];

  const workoutExerciseLogsResponse = workoutLogs.length
    ? await supabase
        .from("client_workout_exercise_logs")
        .select("*")
        .in(
          "workout_log_id",
          workoutLogs.map((item) => item.id)
        )
        .order("sort_order", { ascending: true })
    : { data: [], error: null };
  throwOnError(workoutExerciseLogsResponse);

  const mealEntriesResponse = await supabase
    .from("client_meal_entries")
    .select("*")
    .eq("client_id", clientId)
    .order("log_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(24);
  throwOnError(mealEntriesResponse);

  const mealEntries = mealEntriesResponse.data || [];
  const mealItemsResponse = mealEntries.length
    ? await supabase
        .from("client_meal_items")
        .select("*")
        .in(
          "meal_entry_id",
          mealEntries.map((item) => item.id)
        )
        .order("sort_order", { ascending: true })
    : { data: [], error: null };
  throwOnError(mealItemsResponse);

  const nutritionPhotoSubmissionsResponse = await supabase
    .from("nutrition_photo_submissions")
    .select("*")
    .eq("client_id", clientId)
    .order("log_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(18);
  throwOnError(nutritionPhotoSubmissionsResponse);

  const nutritionPhotoSubmissions = nutritionPhotoSubmissionsResponse.data || [];
  const [nutritionPhotoAssetsResponse, nutritionPhotoCandidatesResponse] = await Promise.all([
    nutritionPhotoSubmissions.length
      ? supabase
          .from("nutrition_photo_assets")
          .select("*")
          .in(
            "submission_id",
            nutritionPhotoSubmissions.map((item) => item.id)
          )
          .order("sort_order", { ascending: true })
      : Promise.resolve({ data: [], error: null }),
    nutritionPhotoSubmissions.length
      ? supabase
          .from("nutrition_photo_candidates")
          .select("*")
          .in(
            "submission_id",
            nutritionPhotoSubmissions.map((item) => item.id)
          )
          .order("sort_order", { ascending: true })
      : Promise.resolve({ data: [], error: null }),
  ]);
  [nutritionPhotoAssetsResponse, nutritionPhotoCandidatesResponse].forEach(throwOnError);

  const [favoritesResponse, recentFoodsResponse, recipeCandidatesResponse] = await Promise.all([
    supabase
      .from("client_food_favorites")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })
      .limit(12),
    supabase
      .from("client_food_recent")
      .select("*")
      .eq("client_id", clientId)
      .order("last_used_at", { ascending: false })
      .limit(12),
    supabase
      .from("recipe_library")
      .select("*")
      .eq("is_active", true)
      .order("updated_at", { ascending: false })
      .limit(60),
  ]);
  [favoritesResponse, recentFoodsResponse, recipeCandidatesResponse].forEach(throwOnError);

  const favorites = favoritesResponse.data || [];
  const recentFoods = recentFoodsResponse.data || [];
  const recipeContext = buildClientFoodVisibilityContext(clientId, assignedCoachId);
  const recipes = (recipeCandidatesResponse.data || [])
    .filter((recipe) => recipeIsVisibleToUser(recipe, recipeContext))
    .slice(0, 18);

  const recipeIngredientsResponse = recipes.length
    ? await supabase
        .from("recipe_ingredients")
        .select("*")
        .in(
          "recipe_id",
          recipes.map((item) => item.id)
        )
        .order("sort_order", { ascending: true })
    : { data: [], error: null };
  throwOnError(recipeIngredientsResponse);

  const catalogFoods = await loadNormalizedCatalogFoods(
    supabase,
    [
      ...favorites.map((item) => item.food_id),
      ...recentFoods.map((item) => item.food_id),
      ...(recipeIngredientsResponse.data || []).map((item) => item.food_id),
      ...(nutritionPhotoCandidatesResponse.data || []).map((item) => item.food_id).filter(Boolean),
    ],
    {
      favoriteFoodIds: favorites.map((item) => item.food_id),
      recentFoodIds: recentFoods.map((item) => item.food_id),
    }
  );
  const catalogFoodById = new Map(catalogFoods.map((food) => [food.id, food]));
  const favoriteFoods = favorites
    .map((item) => catalogFoodById.get(item.food_id))
    .filter(Boolean);
  const recentFoodEntries = recentFoods
    .map((item) => ({
      ...item,
      food: catalogFoodById.get(item.food_id) || null,
    }))
    .filter((item) => item.food);

  const programExercises = enrichProgramExerciseMedia(programExercisesResponse.data || []);

  const progressPhotoAssets = await addSignedStorageUrls(
    supabase,
    photoAssetsResponse.data || [],
    PLANNER_PROGRESS_PHOTO_BUCKET
  );
  return {
    access,
    assignments,
    programDays: daysResponse.data || [],
    programExercises,
    workoutLogs,
    workoutExerciseLogs: workoutExerciseLogsResponse.data || [],
    nutritionPlans,
    nutritionHabits: nutritionHabitsResponse.data || [],
    nutritionLogs: nutritionLogsResponse.data || [],
    mealEntries,
    mealItems: mealItemsResponse.data || [],
    nutritionPhotoSubmissions,
    nutritionPhotoAssets: nutritionPhotoAssetsResponse.data || [],
    nutritionPhotoCandidates: nutritionPhotoCandidatesResponse.data || [],
    catalogFoods,
    favoriteFoods,
    recentFoods: recentFoodEntries,
    recipes: recipes.map((recipe) => normalizeRecipeRecord(recipe)),
    recipeIngredients: recipeIngredientsResponse.data || [],
    checkins: checkinsResponse.data || [],
    checkinTemplates,
    checkinQuestions: checkinQuestionsResponse.data || [],
    rewardEvents: rewardEventsResponse.data || [],
    progressPhotos: photoEntries,
    progressPhotoAssets,
  };
}

async function getClientPlannerBriefPayload(supabase, auth) {
  const access = buildAccess(auth);
  const clientId = access.user.id;

  const assignedCoachResponse = await supabase
    .from("coach_client_assignments")
    .select("coach_id")
    .eq("client_id", clientId)
    .eq("status", "active")
    .order("assigned_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  throwOnError(assignedCoachResponse);

  const assignedCoachId = assignedCoachResponse.data?.coach_id || null;
  const [assignmentResponse, nutritionResponse, checkinsResponse, checkinTemplatesResponse] = await Promise.all([
    supabase
      .from("client_program_assignments")
      .select("id, title, status, created_at, updated_at")
      .eq("client_id", clientId)
      .in("status", ["active", "paused"])
      .order("created_at", { ascending: false })
      .limit(2),
    supabase
      .from("client_nutrition_plans")
      .select("id, title, notes, status, calories_target, protein_target_g, strategy, created_at, updated_at")
      .eq("client_id", clientId)
      .in("status", ["active", "paused"])
      .order("created_at", { ascending: false })
      .limit(2),
    supabase
      .from("client_checkins")
      .select("id, submitted_at, due_at, review_status, coach_comment, created_at")
      .eq("client_id", clientId)
      .order("due_at", { ascending: false })
      .limit(6),
    assignedCoachId
      ? supabase
          .from("checkin_templates")
          .select("id, title, description, cadence, created_at, updated_at")
          .or(`coach_id.eq.${assignedCoachId},coach_id.is.null`)
          .eq("is_active", true)
          .order("updated_at", { ascending: false })
          .limit(6)
      : supabase
          .from("checkin_templates")
          .select("id, title, description, cadence, created_at, updated_at")
          .is("coach_id", null)
          .eq("is_active", true)
          .order("updated_at", { ascending: false })
          .limit(6),
  ]);

  [assignmentResponse, nutritionResponse, checkinsResponse, checkinTemplatesResponse].forEach(throwOnError);

  const assignments = assignmentResponse.data || [];
  const activeAssignmentIds = assignments.map((item) => item.id).filter(Boolean);
  const daysResponse = activeAssignmentIds.length
    ? await supabase
        .from("client_program_days")
        .select("id, assignment_id, title, focus, notes, day_number, week_number, day_type, scheduled_date, status")
        .in("assignment_id", activeAssignmentIds)
        .order("scheduled_date", { ascending: true })
        .limit(24)
    : { data: [], error: null };

  throwOnError(daysResponse);

  return {
    access,
    assignments,
    nutritionPlans: nutritionResponse.data || [],
    checkins: checkinsResponse.data || [],
    checkinTemplates: checkinTemplatesResponse.data || [],
    programDays: daysResponse.data || [],
  };
}

async function getCoachPlannerPayload(supabase, auth) {
  const access = buildAccess(auth);
  const coachId = access.user.id;

  const [managedClientIds, assignmentLinksResponse, templatesResponse, checkinTemplatesResponse] = await Promise.all([
    listManagedClientIdsForCoach(supabase, coachId),
    supabase
      .from("coach_client_assignments")
      .select("client_id, status, assigned_at")
      .eq("coach_id", coachId)
      .eq("status", "active"),
    supabase
      .from("program_templates")
      .select("*")
      .eq("coach_id", coachId)
      .order("updated_at", { ascending: false })
      .limit(30),
    supabase
      .from("checkin_templates")
      .select("*")
      .or(`coach_id.eq.${coachId},coach_id.is.null`)
      .eq("is_active", true)
      .order("updated_at", { ascending: false })
      .limit(20),
  ]);

  [assignmentLinksResponse, templatesResponse, checkinTemplatesResponse].forEach(throwOnError);

  const clientIds = uniqueValues(managedClientIds);

  const [
    clientProfilesResponse,
    clientDetailsResponse,
    programAssignmentsResponse,
    nutritionPlansResponse,
    workoutLogsResponse,
    nutritionLogsResponse,
    checkinsResponse,
    progressPhotosResponse,
    rewardEventsResponse,
    mealEntriesResponse,
    coachFoodCountResponse,
  ] = await Promise.all([
    clientIds.length
      ? supabase.from("profiles").select("id, display_name, avatar_url, status").in("id", clientIds)
      : Promise.resolve({ data: [], error: null }),
    clientIds.length
      ? supabase
          .from("client_profiles")
          .select("id, preferred_name, primary_goal, member_id, xp_points, gym_coins")
          .in("id", clientIds)
      : Promise.resolve({ data: [], error: null }),
    clientIds.length
      ? supabase
          .from("client_program_assignments")
          .select("*")
          .in("client_id", clientIds)
          .order("updated_at", { ascending: false })
          .limit(80)
      : Promise.resolve({ data: [], error: null }),
    clientIds.length
      ? supabase
          .from("client_nutrition_plans")
          .select("*")
          .in("client_id", clientIds)
          .order("updated_at", { ascending: false })
          .limit(80)
      : Promise.resolve({ data: [], error: null }),
    clientIds.length
      ? supabase
          .from("client_workout_logs")
          .select("*")
          .in("client_id", clientIds)
          .order("updated_at", { ascending: false })
          .limit(80)
      : Promise.resolve({ data: [], error: null }),
    clientIds.length
      ? supabase
          .from("client_nutrition_logs")
          .select("*")
          .in("client_id", clientIds)
          .order("updated_at", { ascending: false })
          .limit(80)
      : Promise.resolve({ data: [], error: null }),
    clientIds.length
      ? supabase
          .from("client_checkins")
          .select("*")
          .in("client_id", clientIds)
          .order("due_at", { ascending: false })
          .limit(80)
      : Promise.resolve({ data: [], error: null }),
    clientIds.length
      ? supabase
          .from("progress_photo_entries")
          .select("*")
          .in("client_id", clientIds)
          .order("captured_at", { ascending: false })
          .limit(80)
      : Promise.resolve({ data: [], error: null }),
    clientIds.length
      ? supabase
          .from("planner_reward_events")
          .select("*")
          .in("client_id", clientIds)
          .order("created_at", { ascending: false })
          .limit(100)
      : Promise.resolve({ data: [], error: null }),
    clientIds.length
      ? supabase
          .from("client_meal_entries")
          .select("*")
          .in("client_id", clientIds)
          .order("log_date", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(180)
      : Promise.resolve({ data: [], error: null }),
    supabase
      .from("food_library")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", coachId),
  ]);

  [
    clientProfilesResponse,
    clientDetailsResponse,
    programAssignmentsResponse,
    nutritionPlansResponse,
    workoutLogsResponse,
    nutritionLogsResponse,
    checkinsResponse,
    progressPhotosResponse,
    rewardEventsResponse,
    mealEntriesResponse,
    coachFoodCountResponse,
  ].forEach(throwOnError);

  const programAssignments = programAssignmentsResponse.data || [];
  const activeAssignmentIds = uniqueValues(programAssignments.map((item) => item.id).filter(Boolean));
  const programDaysResponse = activeAssignmentIds.length
    ? await supabase
        .from("client_program_days")
        .select("id, assignment_id, title, focus, notes, day_number, week_number, day_type, scheduled_date, status")
        .in("assignment_id", activeAssignmentIds)
        .order("scheduled_date", { ascending: true })
    : { data: [], error: null };
  throwOnError(programDaysResponse);
  const programDays = programDaysResponse.data || [];
  const programDayIds = programDays.map((item) => item.id).filter(Boolean);
  const workoutLogs = workoutLogsResponse.data || [];

  const [programExercisesResponse, workoutExerciseLogsResponse] = await Promise.all([
    programDayIds.length
      ? supabase
          .from("client_program_day_exercises")
          .select("*, exercise_library(name, video_url, autoplay_video, custom_fields)")
          .in("client_program_day_id", programDayIds)
      : Promise.resolve({ data: [], error: null }),
    workoutLogs.length
      ? supabase
          .from("client_workout_exercise_logs")
          .select("*")
          .in(
            "workout_log_id",
            workoutLogs.map((item) => item.id)
          )
          .order("sort_order", { ascending: true })
      : Promise.resolve({ data: [], error: null }),
  ]);
  [programExercisesResponse, workoutExerciseLogsResponse].forEach(throwOnError);

  const mealEntries = mealEntriesResponse.data || [];
  const mealItemsResponse = mealEntries.length
    ? await supabase
        .from("client_meal_items")
        .select("*")
        .in(
          "meal_entry_id",
          mealEntries.map((item) => item.id)
        )
        .order("sort_order", { ascending: true })
    : { data: [], error: null };
  throwOnError(mealItemsResponse);

  const nutritionPhotoSubmissionsResponse = await supabase
    .from("nutrition_photo_submissions")
    .select("*")
    .eq("coach_id", coachId)
    .order("created_at", { ascending: false })
    .limit(120);
  throwOnError(nutritionPhotoSubmissionsResponse);
  const nutritionPhotoSubmissions = nutritionPhotoSubmissionsResponse.data || [];

  const [nutritionPhotoAssetsResponse, nutritionPhotoCandidatesResponse] = await Promise.all([
    nutritionPhotoSubmissions.length
      ? supabase
          .from("nutrition_photo_assets")
          .select("*")
          .in(
            "submission_id",
            nutritionPhotoSubmissions.map((item) => item.id)
          )
          .order("sort_order", { ascending: true })
      : Promise.resolve({ data: [], error: null }),
    nutritionPhotoSubmissions.length
      ? supabase
          .from("nutrition_photo_candidates")
          .select("*")
          .in(
            "submission_id",
            nutritionPhotoSubmissions.map((item) => item.id)
          )
          .order("sort_order", { ascending: true })
      : Promise.resolve({ data: [], error: null }),
  ]);
  [nutritionPhotoAssetsResponse, nutritionPhotoCandidatesResponse].forEach(throwOnError);

  const nutritionPhotoAssets = await addSignedStorageUrls(
    supabase,
    nutritionPhotoAssetsResponse.data || [],
    PLANNER_NUTRITION_PHOTO_BUCKET
  );

  const recipeCandidatesResponse = await supabase
    .from("recipe_library")
    .select("*")
    .eq("is_active", true)
    .order("updated_at", { ascending: false })
    .limit(80);
  throwOnError(recipeCandidatesResponse);

  const recipeContext = buildCoachFoodVisibilityContext(coachId);
  const recipes = (recipeCandidatesResponse.data || [])
    .filter((recipe) => recipeIsVisibleToUser(recipe, recipeContext))
    .slice(0, 40);

  const recipeIngredientsResponse = recipes.length
    ? await supabase
        .from("recipe_ingredients")
        .select("*")
        .in(
          "recipe_id",
          recipes.map((item) => item.id)
        )
        .order("sort_order", { ascending: true })
    : { data: [], error: null };
  throwOnError(recipeIngredientsResponse);

  const catalogFoods = await loadNormalizedCatalogFoods(
    supabase,
    [
      ...(recipeIngredientsResponse.data || []).map((item) => item.food_id),
      ...(nutritionPhotoCandidatesResponse.data || []).map((item) => item.food_id).filter(Boolean),
    ]
  );

  return {
    access,
    templates: templatesResponse.data || [],
    checkinTemplates: checkinTemplatesResponse.data || [],
    rosterProfiles: clientProfilesResponse.data || [],
    rosterDetails: clientDetailsResponse.data || [],
    rosterAssignments: assignmentLinksResponse.data || [],
    programAssignments,
    programDays,
    programExercises: enrichProgramExerciseMedia(programExercisesResponse.data || []),
    nutritionPlans: nutritionPlansResponse.data || [],
    workoutLogs,
    workoutExerciseLogs: workoutExerciseLogsResponse.data || [],
    nutritionLogs: nutritionLogsResponse.data || [],
    catalogFoods,
    coachFoodCount: Number(coachFoodCountResponse.count || 0),
    recipes: recipes.map((recipe) => normalizeRecipeRecord(recipe)),
    recipeIngredients: recipeIngredientsResponse.data || [],
    mealEntries,
    mealItems: mealItemsResponse.data || [],
    nutritionPhotoSubmissions,
    nutritionPhotoAssets,
    nutritionPhotoCandidates: nutritionPhotoCandidatesResponse.data || [],
    checkins: checkinsResponse.data || [],
    progressPhotos: progressPhotosResponse.data || [],
    rewardEvents: rewardEventsResponse.data || [],
  };
}

async function getAdminPlannerPayload(supabase, auth) {
  const access = buildAccess(auth);

  const [
    templateCountResponse,
    assignmentCountResponse,
    checkinCountResponse,
    photoCountResponse,
    rewardCountResponse,
    pendingRewardCountResponse,
  ] = await Promise.all([
    supabase.from("program_templates").select("id", { count: "exact", head: true }),
    supabase.from("client_program_assignments").select("id", { count: "exact", head: true }),
    supabase.from("client_checkins").select("id", { count: "exact", head: true }),
    supabase.from("progress_photo_entries").select("id", { count: "exact", head: true }),
    supabase.from("planner_reward_events").select("id", { count: "exact", head: true }),
    supabase.from("planner_reward_events").select("id", { count: "exact", head: true }).eq("approval_status", "pending"),
  ]);

  [
    templateCountResponse,
    assignmentCountResponse,
    checkinCountResponse,
    photoCountResponse,
    rewardCountResponse,
    pendingRewardCountResponse,
  ].forEach(throwOnError);

  return {
    access,
    summary: {
      templates: Number(templateCountResponse.count || 0),
      assignments: Number(assignmentCountResponse.count || 0),
      checkins: Number(checkinCountResponse.count || 0),
      progressPhotos: Number(photoCountResponse.count || 0),
      rewardEvents: Number(rewardCountResponse.count || 0),
      pendingRewardEvents: Number(pendingRewardCountResponse.count || 0),
    },
  };
}

async function getPlannerPayload(supabase, auth, options = {}) {
  const role = auth?.profile?.role || "";
  const mode = String(options?.mode || "")
    .trim()
    .toLowerCase();

  if (role === "client") {
    if (mode === "brief") {
      return getClientPlannerBriefPayload(supabase, auth);
    }
    return getClientPlannerPayload(supabase, auth);
  }

  if (role === "coach") {
    return getCoachPlannerPayload(supabase, auth);
  }

  if (role === "super_admin") {
    return getAdminPlannerPayload(supabase, auth);
  }

  throw Object.assign(new Error("Unsupported planner role."), { statusCode: 403 });
}

module.exports = {
  getPlannerPayload,
};
