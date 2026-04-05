const { json, noContent } = require("./_lib/http");
const { sendNoticeEmail } = require("./_lib/email");
const { formatSessionSlot } = require("./_lib/schedule-utils");
const {
  getEmailMapForUserIds,
  getServiceSupabase,
  notifyRecipients,
} = require("./_lib/supabase");

const REMINDER_LOG_KEY = "schedule-reminders:24h";
const REMINDER_WINDOW_START_HOURS = 23;
const REMINDER_WINDOW_END_HOURS = 25;
const REMINDER_LOG_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;

function reminderDispatchKey(session) {
  return `24h:${session.id}:${session.scheduled_start}`;
}

function normalizeDispatchMap(value, nowMs) {
  const source = value && typeof value === "object" ? value : {};
  return Object.fromEntries(
    Object.entries(source).filter(([, sentAt]) => {
      const sentMs = new Date(sentAt || 0).getTime();
      return Number.isFinite(sentMs) && nowMs - sentMs < REMINDER_LOG_RETENTION_MS;
    })
  );
}

async function loadReminderLog(supabase) {
  const { data, error } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", REMINDER_LOG_KEY)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data?.value || {};
}

async function saveReminderLog(supabase, dispatchMap, nowIso) {
  const { error } = await supabase
    .from("app_settings")
    .upsert(
      {
        key: REMINDER_LOG_KEY,
        value: {
          dispatchMap,
          updatedAt: nowIso,
        },
        updated_at: nowIso,
      },
      { onConflict: "key" }
    );

  if (error) {
    throw error;
  }
}

async function loadProfileNames(supabase, userIds) {
  const uniqueIds = Array.from(new Set((userIds || []).filter(Boolean)));
  if (!uniqueIds.length) {
    return new Map();
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name")
    .in("id", uniqueIds);

  if (error) {
    throw error;
  }

  return new Map((data || []).map((profile) => [profile.id, String(profile.display_name || "").trim()]));
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
  const startIso = new Date(now.getTime() + REMINDER_WINDOW_START_HOURS * 60 * 60 * 1000).toISOString();
  const endIso = new Date(now.getTime() + REMINDER_WINDOW_END_HOURS * 60 * 60 * 1000).toISOString();

  try {
    const [sessionsResponse, reminderLogValue] = await Promise.all([
      supabase
        .from("sessions")
        .select("id, client_id, coach_id, scheduled_start, scheduled_end, status")
        .eq("status", "scheduled")
        .gte("scheduled_start", startIso)
        .lt("scheduled_start", endIso)
        .order("scheduled_start", { ascending: true })
        .limit(300),
      loadReminderLog(supabase),
    ]);

    if (sessionsResponse.error) {
      throw sessionsResponse.error;
    }

    const sessions = sessionsResponse.data || [];
    const dispatchMap = normalizeDispatchMap(reminderLogValue.dispatchMap, now.getTime());
    const pendingSessions = sessions.filter((session) => !dispatchMap[reminderDispatchKey(session)]);
    if (!pendingSessions.length) {
      return json(200, { ok: true, scanned: sessions.length, reminded: 0 }, { "Cache-Control": "no-store" });
    }

    const userIds = pendingSessions.flatMap((session) => [session.client_id, session.coach_id]).filter(Boolean);
    const [emailMap, profileNames] = await Promise.all([
      getEmailMapForUserIds(supabase, userIds).catch(() => new Map()),
      loadProfileNames(supabase, userIds).catch(() => new Map()),
    ]);

    let reminded = 0;
    for (const session of pendingSessions) {
      const dispatchKey = reminderDispatchKey(session);
      const clientEmail = emailMap.get(session.client_id) || "";
      const clientName = profileNames.get(session.client_id) || "Client";
      const coachName = profileNames.get(session.coach_id) || "Coach";
      const slotLabel = formatSessionSlot(session.scheduled_start, session.scheduled_end);

      await notifyRecipients(supabase, [
        {
          recipient_id: session.client_id,
          category: "schedule",
          title: "Session Reminder: 24 Hours",
          body: `You have a coaching session with ${coachName} in about 24 hours on ${slotLabel}.`,
          action_url: "./client-schedule.html",
        },
      ]).catch(() => null);

      await sendNoticeEmail({
        to: clientEmail,
        subject: "Session Reminder: Tomorrow",
        eyebrow: "Schedule Reminder",
        title: "You have a coaching session tomorrow",
        intro: `This is your 24-hour reminder for your upcoming session with ${coachName}.`,
        metaRows: [
          { label: "Member", value: clientName },
          { label: "Coach", value: coachName },
          { label: "Session Time", value: slotLabel },
          { label: "Status", value: "Scheduled" },
        ],
        ctaLabel: "Open Schedule",
        ctaUrl: "./client-schedule.html",
        footerNote: "If you need to request a change, open your schedule now so the team has time to review it against the 24-hour policy.",
        tags: [
          { name: "category", value: "schedule" },
          { name: "event", value: "session_reminder_24h" },
        ],
      }).catch(() => null);

      dispatchMap[dispatchKey] = nowIso;
      reminded += 1;
    }

    await saveReminderLog(supabase, dispatchMap, nowIso);

    return json(
      200,
      {
        ok: true,
        scanned: sessions.length,
        reminded,
      },
      { "Cache-Control": "no-store" }
    );
  } catch (error) {
    return json(
      Number(error?.statusCode || 500),
      {
        error: error?.message || "Unable to send session reminders right now.",
      },
      { "Cache-Control": "no-store" }
    );
  }
};
