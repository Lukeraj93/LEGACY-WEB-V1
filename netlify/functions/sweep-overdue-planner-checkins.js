const { json, noContent } = require("./_lib/http");
const { notifyClientAndCoach, throwOnError } = require("./_lib/planner");
const { getServiceSupabase } = require("./_lib/supabase");

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function formatDateTimeLabel(value) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "the scheduled time";
  }

  return new Intl.DateTimeFormat("en-MY", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(parsed);
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return noContent({ "Cache-Control": "no-store" });
  }

  if (event.httpMethod && !["GET", "POST"].includes(event.httpMethod)) {
    return json(405, { error: "Method not allowed." }, { Allow: "GET, POST, OPTIONS", "Cache-Control": "no-store" });
  }

  const supabase = getServiceSupabase();
  const now = new Date();
  const nowIso = now.toISOString();

  try {
    const dueResponse = await supabase
      .from("client_checkins")
      .select("id, client_id, coach_id, cadence, due_at, submitted_at, status, template_id")
      .is("submitted_at", null)
      .in("status", ["due", "late"])
      .lt("due_at", nowIso)
      .order("due_at", { ascending: true })
      .limit(300);
    throwOnError(dueResponse);

    const dueCheckins = dueResponse.data || [];
    const transitioned = [];

    for (const checkin of dueCheckins) {
      const dueAt = new Date(checkin.due_at);
      if (Number.isNaN(dueAt.getTime())) {
        continue;
      }

      const ageMs = now.getTime() - dueAt.getTime();
      const nextStatus = ageMs >= ONE_WEEK_MS ? "missed" : "late";
      if (String(checkin.status || "").toLowerCase() === nextStatus) {
        continue;
      }

      const updateResponse = await supabase
        .from("client_checkins")
        .update({
          status: nextStatus,
        })
        .eq("id", checkin.id)
        .select("*")
        .single();
      throwOnError(updateResponse);

      transitioned.push(updateResponse.data);

      if (nextStatus === "late") {
        await notifyClientAndCoach(supabase, {
          category: "planner",
          clientId: checkin.client_id,
          clientTitle: "Your health update is overdue",
          clientBody: `Your ${checkin.cadence || "planner"} health update due on ${formatDateTimeLabel(checkin.due_at)} is now overdue.`,
          clientActionUrl: "./client-planner.html",
          coachId: checkin.coach_id,
          coachTitle: "Client health update is overdue",
          coachBody: `A client health update due on ${formatDateTimeLabel(checkin.due_at)} has not been submitted yet.`,
          coachActionUrl: "./coach-programming.html",
        }).catch(() => null);
      } else if (nextStatus === "missed") {
        await notifyClientAndCoach(supabase, {
          category: "planner",
          clientId: checkin.client_id,
          clientTitle: "Your health update is now marked missed",
          clientBody: `Your ${checkin.cadence || "planner"} health update has been overdue for more than 7 days and is now marked missed.`,
          clientActionUrl: "./client-planner.html",
          coachId: checkin.coach_id,
          coachTitle: "Client missed weekly health update",
          coachBody: `A client health update has been overdue for more than 7 days and is now marked missed.`,
          coachActionUrl: "./coach-programming.html",
        }).catch(() => null);
      }
    }

    return json(
      200,
      {
        ok: true,
        scanned: dueCheckins.length,
        transitioned: transitioned.length,
        late: transitioned.filter((item) => item.status === "late").length,
        missed: transitioned.filter((item) => item.status === "missed").length,
      },
      { "Cache-Control": "no-store" }
    );
  } catch (error) {
    return json(
      Number(error?.statusCode || 500),
      {
        error: error?.message || "Unable to sweep overdue planner health updates right now.",
      },
      { "Cache-Control": "no-store" }
    );
  }
};
