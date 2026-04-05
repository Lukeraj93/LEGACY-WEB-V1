const { json, noContent } = require("./_lib/http");
const {
  buildMalaysiaWeekKey,
  buildNewsletterStatus,
  dispatchNewsletterCampaign,
  loadNewsletterAudience,
  readNewsletterState,
  saveNewsletterDispatchLog,
  shouldDispatchScheduledNewsletter,
  writeNewsletterAuditLog,
} = require("./_lib/newsletter");
const { getServiceSupabase } = require("./_lib/supabase");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return noContent({ "Cache-Control": "no-store" });
  }

  if (event.httpMethod && !["GET", "POST"].includes(event.httpMethod)) {
    return json(405, { error: "Method not allowed." }, { Allow: "GET, POST, OPTIONS", "Cache-Control": "no-store" });
  }

  const supabase = getServiceSupabase();
  const now = new Date();
  try {
    const { campaign, dispatchLog } = await readNewsletterState(supabase);
    const audience = await loadNewsletterAudience(supabase, campaign?.audienceSegment);

    if (!shouldDispatchScheduledNewsletter(campaign, dispatchLog, now)) {
      return json(200, {
        ok: true,
        dispatched: false,
        status: buildNewsletterStatus(campaign, dispatchLog, audience.audienceCount, now),
      }, { "Cache-Control": "no-store" });
    }

    const delivery = await dispatchNewsletterCampaign(supabase, campaign, {
      eventName: "weekly_newsletter_scheduled",
      mode: "scheduled",
    });
    const nowIso = now.toISOString();
    const nextLog = await saveNewsletterDispatchLog(supabase, null, {
      ...dispatchLog,
      lastSentAt: nowIso,
      lastSentMode: "scheduled",
      lastWeekKey: buildMalaysiaWeekKey(nowIso),
      lastDeliveredCount: delivery.deliveredCount,
      lastSkippedCount: delivery.skippedCount,
      lastAudienceCount: delivery.audienceCount,
      lastSubject: campaign.subject,
      lastDispatchId: delivery.dispatchId,
    });
    await writeNewsletterAuditLog(supabase, null, "scheduled_dispatch", {
      subject: campaign.subject,
      deliveredCount: delivery.deliveredCount,
      skippedCount: delivery.skippedCount,
      audienceCount: delivery.audienceCount,
    }).catch(() => null);

    return json(200, {
      ok: true,
      dispatched: true,
      deliveredCount: delivery.deliveredCount,
      skippedCount: delivery.skippedCount,
      status: buildNewsletterStatus(campaign, nextLog, delivery.audienceCount, now),
    }, { "Cache-Control": "no-store" });
  } catch (error) {
    return json(
      Number(error?.statusCode || 500),
      { error: error?.message || "Unable to run the weekly newsletter right now." },
      { "Cache-Control": "no-store" }
    );
  }
};
