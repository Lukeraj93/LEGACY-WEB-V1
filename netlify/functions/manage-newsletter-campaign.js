const { json, methodNotAllowed, noContent, parseJsonBody, errorResponse } = require("./_lib/http");
const {
  buildNewsletterPreview,
  buildDefaultNewsletterCampaign,
  buildMalaysiaWeekKey,
  buildNewsletterStatus,
  dispatchNewsletterCampaign,
  loadNewsletterAnalytics,
  loadNewsletterAudience,
  normalizeNewsletterCampaign,
  readNewsletterState,
  saveNewsletterCampaign,
  saveNewsletterDispatchLog,
  sendNewsletterTestEmail,
  writeNewsletterAuditLog,
} = require("./_lib/newsletter");
const { getAuthenticatedProfile, getServiceSupabase } = require("./_lib/supabase");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return noContent();
  }

  if (!["GET", "POST"].includes(event.httpMethod)) {
    return methodNotAllowed("GET, POST, OPTIONS");
  }

  try {
    const supabase = getServiceSupabase();
    const access = await getAuthenticatedProfile(event, supabase);
    if (!access?.profile) {
      return json(401, { error: "A valid admin session is required." });
    }

    if (access.profile.role !== "super_admin") {
      return json(403, { error: "Only super admins can manage newsletters." });
    }

    if (event.httpMethod === "GET") {
      const currentState = await readNewsletterState(supabase);
      const { campaign, dispatchLog } = currentState;
      const [audience, preview, analytics] = await Promise.all([
        loadNewsletterAudience(supabase, campaign?.audienceSegment),
        buildNewsletterPreview(supabase, campaign),
        loadNewsletterAnalytics(supabase, { limit: 6 }),
      ]);

      return json(200, {
        ok: true,
        campaign,
        status: buildNewsletterStatus(campaign, dispatchLog, audience.audienceCount),
        preview,
        analytics,
      });
    }

    const body = await parseJsonBody(event, { maxBytes: 48 * 1024 });
    const action = String(body.action || "").trim().toLowerCase();
    const currentState = await readNewsletterState(supabase);
    const normalizedCampaign = normalizeNewsletterCampaign(body.campaign || {}, currentState.campaign || buildDefaultNewsletterCampaign());

    if (action === "save_config") {
      const savedCampaign = await saveNewsletterCampaign(supabase, access.profile.id, normalizedCampaign);
      await writeNewsletterAuditLog(supabase, access.profile.id, "save_config", {
        subject: savedCampaign.subject,
        enabled: savedCampaign.enabled,
        scheduleDay: savedCampaign.scheduleDay,
        scheduleHour: savedCampaign.scheduleHour,
      }).catch(() => null);

      const [audience, preview, analytics] = await Promise.all([
        loadNewsletterAudience(supabase, savedCampaign.audienceSegment),
        buildNewsletterPreview(supabase, savedCampaign),
        loadNewsletterAnalytics(supabase, { limit: 6 }),
      ]);
      return json(200, {
        ok: true,
        message: "Weekly newsletter settings saved.",
        campaign: savedCampaign,
        status: buildNewsletterStatus(savedCampaign, currentState.dispatchLog, audience.audienceCount),
        preview,
        analytics,
      });
    }

    if (action === "preview") {
      const [audience, preview, analytics] = await Promise.all([
        loadNewsletterAudience(supabase, normalizedCampaign.audienceSegment),
        buildNewsletterPreview(supabase, normalizedCampaign),
        loadNewsletterAnalytics(supabase, { limit: 6 }),
      ]);

      return json(200, {
        ok: true,
        message: "Newsletter preview refreshed.",
        campaign: normalizedCampaign,
        status: buildNewsletterStatus(normalizedCampaign, currentState.dispatchLog, audience.audienceCount),
        preview,
        analytics,
      });
    }

    if (action === "send_now") {
      const savedCampaign = await saveNewsletterCampaign(supabase, access.profile.id, normalizedCampaign);
      const delivery = await dispatchNewsletterCampaign(supabase, savedCampaign, {
        actorId: access.profile.id,
        eventName: "weekly_newsletter_manual",
        mode: "manual",
      });
      const nowIso = new Date().toISOString();
      const dispatchLog = await saveNewsletterDispatchLog(supabase, access.profile.id, {
        ...currentState.dispatchLog,
        lastSentAt: nowIso,
        lastSentMode: "manual",
        lastWeekKey: buildMalaysiaWeekKey(nowIso),
        lastDeliveredCount: delivery.deliveredCount,
        lastSkippedCount: delivery.skippedCount,
        lastAudienceCount: delivery.audienceCount,
        lastSubject: savedCampaign.subject,
        lastDispatchId: delivery.dispatchId,
      });
      await writeNewsletterAuditLog(supabase, access.profile.id, "send_now", {
        subject: savedCampaign.subject,
        deliveredCount: delivery.deliveredCount,
        skippedCount: delivery.skippedCount,
        audienceCount: delivery.audienceCount,
      }).catch(() => null);

      const [preview, analytics] = await Promise.all([
        buildNewsletterPreview(supabase, savedCampaign),
        loadNewsletterAnalytics(supabase, { limit: 6 }),
      ]);
      return json(200, {
        ok: true,
        message: delivery.deliveredCount
          ? `Newsletter sent to ${delivery.deliveredCount} contact${delivery.deliveredCount === 1 ? "" : "s"} now.`
          : "No eligible contacts received the newsletter. Check the audience segment, client status, or email preferences.",
        campaign: savedCampaign,
        status: buildNewsletterStatus(savedCampaign, dispatchLog, delivery.audienceCount),
        preview,
        analytics,
      });
    }

    if (action === "send_test") {
      const recipientEmail = String(body.recipientEmail || "").trim().toLowerCase();
      const audience = await loadNewsletterAudience(supabase, normalizedCampaign.audienceSegment);
      const audienceRecipient = (audience.recipients || []).find((recipient) => String(recipient.email || "").trim().toLowerCase() === recipientEmail);
      const delivery = await sendNewsletterTestEmail(normalizedCampaign, recipientEmail, {
        eventName: "weekly_newsletter_test",
        subjectPrefix: "[Newsletter Test]",
        recipientName: audienceRecipient?.label || "Johnathan",
      });
      await writeNewsletterAuditLog(supabase, access.profile.id, "send_test", {
        subject: delivery.subject,
        recipientEmail: delivery.recipient,
        deliveryId: delivery.id,
      }).catch(() => null);

      const [preview, analytics] = await Promise.all([
        buildNewsletterPreview(supabase, normalizedCampaign),
        loadNewsletterAnalytics(supabase, { limit: 6 }),
      ]);

      return json(200, {
        ok: true,
        message: `Test newsletter sent to ${delivery.recipient}.`,
        campaign: normalizedCampaign,
        status: buildNewsletterStatus(normalizedCampaign, currentState.dispatchLog, audience.audienceCount),
        preview,
        analytics,
      });
    }

    return json(400, { error: "Unsupported newsletter action." });
  } catch (error) {
    return errorResponse(error, "Unable to manage the weekly newsletter right now.");
  }
};
