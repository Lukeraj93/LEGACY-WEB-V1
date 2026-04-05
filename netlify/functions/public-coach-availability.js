const { errorResponse, json, methodNotAllowed, noContent } = require("./_lib/http");
const { getPublicSupabase } = require("./_lib/supabase");
const { loadPublicCoachAvailabilitySnapshot } = require("./_lib/coach-availability");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return noContent();
  }

  if (event.httpMethod !== "GET") {
    return methodNotAllowed("GET, OPTIONS");
  }

  try {
    const supabase = getPublicSupabase();
    const coachId = String(event.queryStringParameters?.coachId || "").trim();
    const coachName = String(event.queryStringParameters?.coachName || "").trim();
    const coaches = await loadPublicCoachAvailabilitySnapshot(supabase, {
      coachId,
      coachName,
      lookaheadDays: 28,
      locale: "en-MY",
    });

    return json(200, { coaches });
  } catch (error) {
    return errorResponse(error, "Unable to load public coach availability right now.");
  }
};
