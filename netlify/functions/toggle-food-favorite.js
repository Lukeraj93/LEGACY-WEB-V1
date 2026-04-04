const { json, methodNotAllowed, noContent } = require("./_lib/http");
const {
  createHttpError,
  normalizeBoolean,
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
    requireAllowedRole(auth.profile, ["client"]);

    const foodId = normalizeText(body.foodId || body.food_id);
    if (!foodId) {
      throw createHttpError(400, "Food ID is required.");
    }

    const active = normalizeBoolean(body.active, true);

    if (active) {
      const insertResponse = await supabase
        .from("client_food_favorites")
        .upsert(
          {
            client_id: auth.profile.id,
            food_id: foodId,
          },
          { onConflict: "client_id,food_id" }
        )
        .select("*")
        .single();
      throwOnError(insertResponse);

      return json(200, {
        ok: true,
        active: true,
        favorite: insertResponse.data,
        message: "Food saved to favorites.",
      });
    }

    const deleteResponse = await supabase
      .from("client_food_favorites")
      .delete()
      .eq("client_id", auth.profile.id)
      .eq("food_id", foodId);
    throwOnError(deleteResponse);

    return json(200, {
      ok: true,
      active: false,
      message: "Food removed from favorites.",
    });
  } catch (error) {
    return json(
      Number(error?.statusCode || 500),
      { error: error?.message || "Unable to update favorites right now." },
      { "Cache-Control": "no-store" }
    );
  }
};
