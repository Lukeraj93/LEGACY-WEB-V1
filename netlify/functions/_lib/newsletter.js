"use strict";

const crypto = require("node:crypto");

const { getBaseUrl, requireEnv } = require("./env");
const { renderCampaignEmailPreview, sendCampaignEmail, sendEmail, toAbsoluteUrl } = require("./email");
const { normalizeEmail } = require("./email-preferences");
const { getEmailMapForUserIds } = require("./supabase");

const NEWSLETTER_SETTINGS_KEY = "weekly_newsletter_campaign_v1";
const NEWSLETTER_LOG_KEY = "weekly_newsletter_dispatch_log_v1";
const MALAYSIA_OFFSET_MS = 8 * 60 * 60 * 1000;
const DAY_KEYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
const DAY_LABELS = {
  sunday: "Sunday",
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
};
const NEWSLETTER_TYPES = {
  update_announcement: {
    label: "Update / Announcement",
  },
  educational_deep_dive: {
    label: "Educational / Deep-Dive",
  },
  community_member_spotlight: {
    label: "Community / Member Spotlight",
  },
  coach_development: {
    label: "Coach Development",
  },
};
const AUDIENCE_SEGMENTS = {
  active_members: {
    label: "Active Members",
    description: "All active client accounts.",
  },
  active_package_holders: {
    label: "Active Package Holders",
    description: "Clients with an active coaching package right now.",
  },
  lapsed_members: {
    label: "Lapsed Members",
    description: "Active client accounts without an active package.",
  },
  inactive_members: {
    label: "Inactive Members",
    description: "Inactive or pending client accounts.",
  },
  open_leads: {
    label: "Open Leads",
    description: "CRM leads with an email who have not been converted or marked lost.",
  },
  active_coaches: {
    label: "Active Coaches",
    description: "Active coach accounts for internal coach-development updates.",
  },
};
const DEFAULT_AUDIENCE_SEGMENT = "active_members";
const DEFAULT_NEWSLETTER_TYPE = "update_announcement";
const NEWSLETTER_DISPATCH_ENTITY_TYPE = "newsletter_dispatch";
const NEWSLETTER_PREVIEW_RECIPIENT = "preview@legacycoaching.com.my";

function cleanText(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/gu, " ");
}

function normalizeBoolean(value, fallback = false) {
  if (typeof value === "boolean") {
    return value;
  }

  const normalized = cleanText(value).toLowerCase();
  if (!normalized) {
    return fallback;
  }

  if (["true", "1", "yes", "y", "on"].includes(normalized)) {
    return true;
  }

  if (["false", "0", "no", "n", "off"].includes(normalized)) {
    return false;
  }

  return fallback;
}

function normalizeHour(value, fallback = 10) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return fallback;
  }
  return Math.min(23, Math.max(0, Math.round(numeric)));
}

function normalizeDay(value, fallback = "monday") {
  const normalized = cleanText(value).toLowerCase();
  return DAY_KEYS.includes(normalized) ? normalized : fallback;
}

function normalizeAudienceSegment(value, fallback = DEFAULT_AUDIENCE_SEGMENT) {
  const normalized = cleanText(value).toLowerCase();
  return Object.prototype.hasOwnProperty.call(AUDIENCE_SEGMENTS, normalized) ? normalized : fallback;
}

function normalizeNewsletterType(value, fallback = DEFAULT_NEWSLETTER_TYPE) {
  const normalized = cleanText(value).toLowerCase();
  return Object.prototype.hasOwnProperty.call(NEWSLETTER_TYPES, normalized) ? normalized : fallback;
}

function normalizeNewsletterCardItems(items) {
  return (Array.isArray(items) ? items : [])
    .map((item) => ({
      label: cleanText(item?.label).slice(0, 80),
      text: cleanText(item?.text).slice(0, 400),
    }))
    .filter((item) => item.label && item.text)
    .slice(0, 6);
}

function normalizeNewsletterSections(value) {
  return (Array.isArray(value) ? value : [])
    .map((section) => ({
      title: cleanText(section?.title).slice(0, 120),
      body: cleanText(section?.body).slice(0, 1200),
      imageUrl: String(section?.imageUrl || "").trim().slice(0, 400),
      items: normalizeNewsletterCardItems(section?.items),
    }))
    .filter((section) => section.title && (section.body || section.items.length))
    .slice(0, 6);
}

function getAudienceSegmentMeta(segment) {
  return AUDIENCE_SEGMENTS[normalizeAudienceSegment(segment)] || AUDIENCE_SEGMENTS[DEFAULT_AUDIENCE_SEGMENT];
}

function buildDefaultNewsletterCampaign() {
  return {
    enabled: false,
    subject: "This Week At LEGACY+: Coaching Updates, Schedule Notes, And Member Wins",
    previewText: "Your weekly coaching updates, important schedule notes, and one useful training reminder.",
    eyebrow: "Weekly Member Update",
    title: "Here’s What’s Happening At LEGACY+ This Week",
    intro: "Here is your quick weekly update with the key coaching notes, the schedule changes that matter, and one useful takeaway to carry into the week ahead.",
    ctaLabel: "Book Your Sessions",
    ctaUrl: "https://www.legacycoaching.com.my/",
    issueLabel: "",
    newsletterType: DEFAULT_NEWSLETTER_TYPE,
    audienceSegment: DEFAULT_AUDIENCE_SEGMENT,
    scheduleDay: "monday",
    scheduleHour: 10,
    featuredDealTitle: "",
    featuredDealBody: "",
    articleTitle: "",
    articleBody: "",
    keyTakeawayTitle: "",
    keyTakeawayBody: "",
    communityTitle: "",
    communityBody: "",
    closingNote: "",
    referenceOneLabel: "",
    referenceOneUrl: "",
    referenceTwoLabel: "",
    referenceTwoUrl: "",
    customSections: [],
    updatedAt: null,
  };
}

function normalizeNewsletterCampaign(input, existing = {}) {
  const source = input && typeof input === "object" ? input : {};
  const merged = {
    ...buildDefaultNewsletterCampaign(),
    ...(existing && typeof existing === "object" ? existing : {}),
  };

  return {
    enabled: normalizeBoolean(source.enabled, merged.enabled),
    subject: cleanText(source.subject || merged.subject).slice(0, 140),
    previewText: cleanText(source.previewText || merged.previewText).slice(0, 220),
    eyebrow: cleanText(source.eyebrow || merged.eyebrow).slice(0, 60),
    title: cleanText(source.title || merged.title).slice(0, 120),
    intro: cleanText(source.intro || merged.intro).slice(0, 800),
    ctaLabel: cleanText(source.ctaLabel || merged.ctaLabel).slice(0, 60),
    ctaUrl: cleanText(source.ctaUrl || merged.ctaUrl).slice(0, 400),
    issueLabel: cleanText(source.issueLabel || merged.issueLabel).slice(0, 60),
    newsletterType: normalizeNewsletterType(source.newsletterType, merged.newsletterType),
    audienceSegment: normalizeAudienceSegment(source.audienceSegment, merged.audienceSegment),
    scheduleDay: normalizeDay(source.scheduleDay, merged.scheduleDay),
    scheduleHour: normalizeHour(source.scheduleHour, merged.scheduleHour),
    featuredDealTitle: cleanText(source.featuredDealTitle || merged.featuredDealTitle).slice(0, 120),
    featuredDealBody: cleanText(source.featuredDealBody || merged.featuredDealBody).slice(0, 1200),
    articleTitle: cleanText(source.articleTitle || merged.articleTitle).slice(0, 120),
    articleBody: cleanText(source.articleBody || merged.articleBody).slice(0, 1200),
    keyTakeawayTitle: cleanText(source.keyTakeawayTitle || merged.keyTakeawayTitle).slice(0, 120),
    keyTakeawayBody: cleanText(source.keyTakeawayBody || merged.keyTakeawayBody).slice(0, 800),
    communityTitle: cleanText(source.communityTitle || merged.communityTitle).slice(0, 120),
    communityBody: cleanText(source.communityBody || merged.communityBody).slice(0, 1200),
    closingNote: cleanText(source.closingNote || merged.closingNote).slice(0, 600),
    referenceOneLabel: cleanText(source.referenceOneLabel || merged.referenceOneLabel).slice(0, 160),
    referenceOneUrl: String(source.referenceOneUrl || merged.referenceOneUrl || "").trim().slice(0, 400),
    referenceTwoLabel: cleanText(source.referenceTwoLabel || merged.referenceTwoLabel).slice(0, 160),
    referenceTwoUrl: String(source.referenceTwoUrl || merged.referenceTwoUrl || "").trim().slice(0, 400),
    customSections: normalizeNewsletterSections(source.customSections || merged.customSections),
    updatedAt: merged.updatedAt || null,
  };
}

function normalizeDispatchLog(input) {
  const source = input && typeof input === "object" ? input : {};
  return {
    lastSentAt: cleanText(source.lastSentAt),
    lastSentMode: cleanText(source.lastSentMode),
    lastWeekKey: cleanText(source.lastWeekKey),
    lastDeliveredCount: Number(source.lastDeliveredCount || 0),
    lastSkippedCount: Number(source.lastSkippedCount || 0),
    lastAudienceCount: Number(source.lastAudienceCount || 0),
    lastSubject: cleanText(source.lastSubject),
    lastDispatchId: cleanText(source.lastDispatchId),
    updatedAt: cleanText(source.updatedAt),
  };
}

function toMalaysiaShifted(dateValue) {
  const date = dateValue instanceof Date ? dateValue : new Date(dateValue || Date.now());
  return new Date(date.getTime() + MALAYSIA_OFFSET_MS);
}

function getMalaysiaParts(dateValue) {
  const shifted = toMalaysiaShifted(dateValue);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth(),
    dayOfMonth: shifted.getUTCDate(),
    dayOfWeek: shifted.getUTCDay(),
    hour: shifted.getUTCHours(),
  };
}

function makeMalaysiaDate(year, month, dayOfMonth, hour = 0) {
  return new Date(Date.UTC(year, month, dayOfMonth, hour - 8, 0, 0, 0));
}

function buildMalaysiaWeekKey(dateValue) {
  const parts = getMalaysiaParts(dateValue);
  const weekStart = makeMalaysiaDate(parts.year, parts.month, parts.dayOfMonth, 0);
  const normalizedDay = parts.dayOfWeek === 0 ? 7 : parts.dayOfWeek;
  weekStart.setUTCDate(weekStart.getUTCDate() - normalizedDay + 1);
  return weekStart.toISOString().slice(0, 10);
}

function formatDateTimeLabel(value) {
  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-MY", {
    timeZone: "Asia/Kuala_Lumpur",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(parsed);
}

function computeNextScheduledAt(campaign, now = new Date()) {
  const currentParts = getMalaysiaParts(now);
  const currentDayIndex = currentParts.dayOfWeek;
  const targetDayIndex = DAY_KEYS.indexOf(normalizeDay(campaign.scheduleDay));
  const todayAtTargetHour = makeMalaysiaDate(
    currentParts.year,
    currentParts.month,
    currentParts.dayOfMonth,
    normalizeHour(campaign.scheduleHour)
  );

  let dayDelta = targetDayIndex - currentDayIndex;
  if (dayDelta < 0 || (dayDelta === 0 && now.getTime() >= todayAtTargetHour.getTime())) {
    dayDelta += 7;
  }

  const next = makeMalaysiaDate(
    currentParts.year,
    currentParts.month,
    currentParts.dayOfMonth,
    normalizeHour(campaign.scheduleHour)
  );
  next.setUTCDate(next.getUTCDate() + dayDelta);
  return next.toISOString();
}

function shouldDispatchScheduledNewsletter(campaign, dispatchLog, now = new Date()) {
  if (!campaign?.enabled) {
    return false;
  }

  const parts = getMalaysiaParts(now);
  if (DAY_KEYS[parts.dayOfWeek] !== normalizeDay(campaign.scheduleDay)) {
    return false;
  }

  if (parts.hour !== normalizeHour(campaign.scheduleHour)) {
    return false;
  }

  return normalizeDispatchLog(dispatchLog).lastWeekKey !== buildMalaysiaWeekKey(now);
}

function resolveNewsletterSectionImage(newsletterType, title = "", body = "", index = 0) {
  const haystack = `${cleanText(title)} ${cleanText(body)}`.toLowerCase();
  if (/busy|professional|corporate|executive|office/iu.test(haystack)) {
    return "/assets/program-benefit-icons/corporate-energy-flow.png";
  }
  if (/pre|post|natal|pregnan|mother|mum|mom/iu.test(haystack)) {
    return "/assets/program-benefit-icons/prenatal-return-bridge.png";
  }
  if (/elder|senior|older|aging|balance|daily capacity/iu.test(haystack)) {
    return "/assets/program-benefit-icons/seniors-daily-capacity.png";
  }
  if (/coach|community|member|spotlight|support/iu.test(haystack)) {
    return index === 0 ? "/assets/team-optimized/coach-client-960.jpg" : "/assets/team-optimized/coach-support-960.jpg";
  }
  if (/cue|feedback|retention|session quality|client experience/iu.test(haystack)) {
    return index === 0 ? "/assets/why-coach-support.jpg" : "/assets/why-coach-client.jpg";
  }
  if (cleanText(newsletterType).toLowerCase() === "community_member_spotlight") {
    return index === 0 ? "/assets/team-optimized/coach-client-960.jpg" : "/assets/team-optimized/coach-support-960.jpg";
  }
  if (cleanText(newsletterType).toLowerCase() === "coach_development") {
    if (index === 0) {
      return "/assets/why-coach-support.jpg";
    }
    if (index === 1) {
      return "/assets/why-coach-client.jpg";
    }
    return "/assets/team-optimized/coach-support-960.jpg";
  }
  if (cleanText(newsletterType).toLowerCase() === "educational_deep_dive") {
    return "/assets/team-optimized/gym-floor-960.jpg";
  }
  return index === 0 ? "/assets/team-optimized/gym-floor-960.jpg" : "/assets/team-optimized/coach-support-960.jpg";
}

function buildNewsletterSections(campaign) {
  if (Array.isArray(campaign.customSections) && campaign.customSections.length) {
    return campaign.customSections.map((section, index) => ({
      ...section,
      imageUrl: section.imageUrl || resolveNewsletterSectionImage(campaign.newsletterType, section.title, section.body, index),
    }));
  }

  return [
    {
      title: campaign.featuredDealTitle || "This Week's Deal",
      body: campaign.featuredDealBody,
      imageUrl: resolveNewsletterSectionImage(campaign.newsletterType, campaign.featuredDealTitle, campaign.featuredDealBody, 0),
    },
    {
      title: campaign.articleTitle || "Article to Read",
      body: campaign.articleBody,
      imageUrl: resolveNewsletterSectionImage(campaign.newsletterType, campaign.articleTitle, campaign.articleBody, 1),
    },
    {
      title: campaign.communityTitle || "Member Update",
      body: campaign.communityBody,
      imageUrl: resolveNewsletterSectionImage(campaign.newsletterType, campaign.communityTitle, campaign.communityBody, 2),
    },
  ].filter((section) => section.title && section.body);
}

function buildNewsletterReferences(campaign) {
  return [
    {
      label: cleanText(campaign.referenceOneLabel),
      url: cleanText(campaign.referenceOneUrl),
    },
    {
      label: cleanText(campaign.referenceTwoLabel),
      url: cleanText(campaign.referenceTwoUrl),
    },
  ].filter((reference) => reference.label && reference.url);
}

function buildNewsletterRenderModel(campaign) {
  const normalizedCampaign = normalizeNewsletterCampaign(campaign);
  return {
    subject: normalizedCampaign.subject,
    previewText: normalizedCampaign.previewText,
    eyebrow: normalizedCampaign.eyebrow,
    title: normalizedCampaign.title,
    newsletterType: normalizedCampaign.newsletterType,
    intro: normalizedCampaign.issueLabel
      ? `${normalizedCampaign.intro} Week marker: ${normalizedCampaign.issueLabel}.`
      : normalizedCampaign.intro,
    sections: buildNewsletterSections(normalizedCampaign),
    ctaLabel: normalizedCampaign.ctaLabel,
    ctaUrl: normalizedCampaign.ctaUrl,
    footerNote: normalizedCampaign.closingNote,
    keyTakeawayTitle: normalizedCampaign.keyTakeawayTitle,
    keyTakeawayBody: normalizedCampaign.keyTakeawayBody,
    references: buildNewsletterReferences(normalizedCampaign),
  };
}

function buildTrackingSecret() {
  return String(process.env.NEWSLETTER_TRACKING_SECRET || requireEnv("SUPABASE_SERVICE_ROLE_KEY")).trim();
}

function buildTrackingBaseUrl() {
  const baseUrl = getBaseUrl() || "https://app.legacycoaching.com.my";
  return baseUrl.replace(/\/+$/u, "");
}

function buildNewsletterRecipientKey(dispatchId, email) {
  const normalizedDispatchId = cleanText(dispatchId);
  const normalizedRecipient = normalizeEmail(email);
  if (!normalizedDispatchId || !normalizedRecipient) {
    return "";
  }

  return crypto
    .createHash("sha256")
    .update(`newsletter:${normalizedDispatchId}:${normalizedRecipient}`)
    .digest("hex")
    .slice(0, 24);
}

function signNewsletterTrackingToken(kind, dispatchId, recipientKey, destination = "") {
  return crypto
    .createHmac("sha256", buildTrackingSecret())
    .update([cleanText(kind), cleanText(dispatchId), cleanText(recipientKey), cleanText(destination)].join("|"))
    .digest("hex");
}

function verifyNewsletterTrackingToken(kind, dispatchId, recipientKey, destination, token) {
  const normalizedToken = cleanText(token);
  if (!normalizedToken) {
    return false;
  }

  const expected = signNewsletterTrackingToken(kind, dispatchId, recipientKey, destination);
  if (!expected || expected.length !== normalizedToken.length) {
    return false;
  }

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, "utf8"),
      Buffer.from(normalizedToken, "utf8")
    );
  } catch (_) {
    return false;
  }
}

function buildNewsletterOpenTrackingUrl(dispatchId, recipientKey) {
  const url = new URL("/.netlify/functions/newsletter-track-open", `${buildTrackingBaseUrl()}/`);
  url.searchParams.set("dispatch", cleanText(dispatchId));
  url.searchParams.set("recipient", cleanText(recipientKey));
  url.searchParams.set("token", signNewsletterTrackingToken("open", dispatchId, recipientKey));
  return url.toString();
}

function buildNewsletterClickTrackingUrl(dispatchId, recipientKey, destination) {
  const resolvedDestination = toAbsoluteUrl(destination);
  if (!resolvedDestination) {
    return "";
  }

  const url = new URL("/.netlify/functions/newsletter-track-click", `${buildTrackingBaseUrl()}/`);
  url.searchParams.set("dispatch", cleanText(dispatchId));
  url.searchParams.set("recipient", cleanText(recipientKey));
  url.searchParams.set("target", resolvedDestination);
  url.searchParams.set("token", signNewsletterTrackingToken("click", dispatchId, recipientKey, resolvedDestination));
  return url.toString();
}

function dedupeAudienceRecipients(recipients) {
  const deduped = [];
  const seenEmails = new Set();

  (Array.isArray(recipients) ? recipients : []).forEach((recipient) => {
    const email = normalizeEmail(recipient?.email);
    if (!email || seenEmails.has(email)) {
      return;
    }

    seenEmails.add(email);
    deduped.push({
      key: cleanText(recipient?.key || recipient?.id || email),
      email,
      label: cleanText(recipient?.label),
      type: cleanText(recipient?.type || "client"),
    });
  });

  return deduped;
}

async function loadClientProfileAudience(supabase, statuses) {
  const normalizedStatuses = Array.from(
    new Set(
      (Array.isArray(statuses) ? statuses : [statuses])
        .map((status) => cleanText(status).toLowerCase())
        .filter(Boolean)
    )
  );

  if (!normalizedStatuses.length) {
    return [];
  }

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, display_name, status")
    .eq("role", "client")
    .in("status", normalizedStatuses);

  if (error) {
    throw error;
  }

  const profileIds = (profiles || []).map((profile) => profile.id).filter(Boolean);
  const emailMap = await getEmailMapForUserIds(supabase, profileIds);

  return dedupeAudienceRecipients(
    (profiles || []).map((profile) => ({
      key: profile.id,
      email: emailMap.get(profile.id) || "",
      label: profile.display_name || "",
      type: "client",
    }))
  );
}

async function loadActivePackageHolderAudience(supabase) {
  const [{ data: activeProfiles, error: profilesError }, { data: packageRows, error: packagesError }] = await Promise.all([
    supabase.from("profiles").select("id, display_name").eq("role", "client").eq("status", "active"),
    supabase
      .from("client_packages")
      .select("client_id, secondary_client_id")
      .eq("status", "active"),
  ]);

  if (profilesError) {
    throw profilesError;
  }

  if (packagesError) {
    throw packagesError;
  }

  const activeProfileMap = new Map((activeProfiles || []).map((profile) => [profile.id, profile]));
  const profileIds = Array.from(
    new Set(
      (packageRows || [])
        .flatMap((row) => [row.client_id, row.secondary_client_id])
        .filter((profileId) => activeProfileMap.has(profileId))
    )
  );
  const emailMap = await getEmailMapForUserIds(supabase, profileIds);

  return dedupeAudienceRecipients(
    profileIds.map((profileId) => ({
      key: profileId,
      email: emailMap.get(profileId) || "",
      label: activeProfileMap.get(profileId)?.display_name || "",
      type: "client",
    }))
  );
}

async function loadLapsedMemberAudience(supabase) {
  const [activeMembers, activePackageHolders] = await Promise.all([
    loadClientProfileAudience(supabase, "active"),
    loadActivePackageHolderAudience(supabase),
  ]);

  const activePackageHolderKeys = new Set(activePackageHolders.map((recipient) => recipient.key));
  return dedupeAudienceRecipients(
    activeMembers.filter((recipient) => !activePackageHolderKeys.has(recipient.key))
  );
}

async function loadOpenLeadAudience(supabase) {
  const { data: leads, error } = await supabase
    .from("leads")
    .select("id, full_name, email, status")
    .in("status", ["new", "contacted", "qualified", "ghosted"]);

  if (error) {
    throw error;
  }

  return dedupeAudienceRecipients(
    (leads || []).map((lead) => ({
      key: lead.id,
      email: lead.email || "",
      label: lead.full_name || "",
      type: "lead",
    }))
  );
}

async function loadCoachAudience(supabase, statuses) {
  const normalizedStatuses = Array.from(
    new Set(
      (Array.isArray(statuses) ? statuses : [statuses])
        .map((status) => cleanText(status).toLowerCase())
        .filter(Boolean)
    )
  );

  if (!normalizedStatuses.length) {
    return [];
  }

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, display_name, status")
    .eq("role", "coach")
    .in("status", normalizedStatuses);

  if (error) {
    throw error;
  }

  const profileIds = (profiles || []).map((profile) => profile.id).filter(Boolean);
  const emailMap = await getEmailMapForUserIds(supabase, profileIds);

  return dedupeAudienceRecipients(
    (profiles || []).map((profile) => ({
      key: profile.id,
      email: emailMap.get(profile.id) || "",
      label: profile.display_name || "",
      type: "coach",
    }))
  );
}

async function loadNewsletterAudience(supabase, segment) {
  const segmentKey = normalizeAudienceSegment(segment);
  const segmentMeta = getAudienceSegmentMeta(segmentKey);

  let recipients = [];
  if (segmentKey === "active_package_holders") {
    recipients = await loadActivePackageHolderAudience(supabase);
  } else if (segmentKey === "lapsed_members") {
    recipients = await loadLapsedMemberAudience(supabase);
  } else if (segmentKey === "inactive_members") {
    recipients = await loadClientProfileAudience(supabase, ["inactive", "pending"]);
  } else if (segmentKey === "open_leads") {
    recipients = await loadOpenLeadAudience(supabase);
  } else if (segmentKey === "active_coaches") {
    recipients = await loadCoachAudience(supabase, "active");
  } else {
    recipients = await loadClientProfileAudience(supabase, "active");
  }

  return {
    segmentKey,
    segmentLabel: segmentMeta.label,
    segmentDescription: segmentMeta.description,
    audienceCount: recipients.length,
    recipients,
    emails: recipients.map((recipient) => recipient.email),
  };
}

async function readNewsletterState(supabase) {
  const [campaignResponse, logResponse] = await Promise.all([
    supabase.from("app_settings").select("value").eq("key", NEWSLETTER_SETTINGS_KEY).maybeSingle(),
    supabase.from("app_settings").select("value").eq("key", NEWSLETTER_LOG_KEY).maybeSingle(),
  ]);

  if (campaignResponse.error) {
    throw campaignResponse.error;
  }

  if (logResponse.error) {
    throw logResponse.error;
  }

  const campaign = normalizeNewsletterCampaign(campaignResponse.data?.value || {}, buildDefaultNewsletterCampaign());
  const dispatchLog = normalizeDispatchLog(logResponse.data?.value || {});
  return { campaign, dispatchLog };
}

async function saveNewsletterCampaign(supabase, actorId, campaign) {
  const payload = {
    ...normalizeNewsletterCampaign(campaign),
    updatedAt: new Date().toISOString(),
  };

  const { error } = await supabase.from("app_settings").upsert(
    {
      key: NEWSLETTER_SETTINGS_KEY,
      value: payload,
      updated_by: actorId || null,
      updated_at: payload.updatedAt,
    },
    { onConflict: "key" }
  );

  if (error) {
    throw error;
  }

  return payload;
}

async function saveNewsletterDispatchLog(supabase, actorId, dispatchLog) {
  const payload = {
    ...normalizeDispatchLog(dispatchLog),
    updatedAt: new Date().toISOString(),
  };

  const { error } = await supabase.from("app_settings").upsert(
    {
      key: NEWSLETTER_LOG_KEY,
      value: payload,
      updated_by: actorId || null,
      updated_at: payload.updatedAt,
    },
    { onConflict: "key" }
  );

  if (error) {
    throw error;
  }

  return payload;
}

async function writeNewsletterAuditLog(supabase, actorId, action, details) {
  await supabase.from("audit_logs").insert({
    actor_id: actorId || null,
    entity_type: "newsletter_campaign",
    entity_id: NEWSLETTER_SETTINGS_KEY,
    action,
    details,
  });
}

async function insertAuditRows(supabase, rows) {
  const payload = (Array.isArray(rows) ? rows : []).filter(Boolean);
  if (!payload.length) {
    return;
  }

  const { error } = await supabase.from("audit_logs").insert(payload);
  if (error) {
    throw error;
  }
}

async function writeNewsletterDispatchAudit(supabase, actorId, action, dispatchId, details) {
  await insertAuditRows(supabase, [{
    actor_id: actorId || null,
    entity_type: NEWSLETTER_DISPATCH_ENTITY_TYPE,
    entity_id: dispatchId,
    action,
    details,
  }]);
}

function buildNewsletterDispatchDetails(normalizedCampaign, audience, delivery, options = {}) {
  return {
    subject: normalizedCampaign.subject,
    title: normalizedCampaign.title,
    issueLabel: normalizedCampaign.issueLabel,
    audienceSegment: audience.segmentKey,
    audienceSegmentLabel: audience.segmentLabel,
    audienceCount: audience.audienceCount,
    deliveredCount: delivery.deliveredCount,
    skippedCount: delivery.skippedCount,
    ctaUrl: normalizedCampaign.ctaUrl,
    mode: cleanText(options.mode || "manual") || "manual",
    eventName: cleanText(options.eventName || "weekly_newsletter"),
  };
}

function buildNewsletterStatus(campaign, dispatchLog, audienceCount, now = new Date()) {
  const normalizedCampaign = normalizeNewsletterCampaign(campaign);
  const normalizedLog = normalizeDispatchLog(dispatchLog);
  const audienceMeta = getAudienceSegmentMeta(normalizedCampaign.audienceSegment);

  return {
    enabled: normalizedCampaign.enabled,
    audienceCount: Number(audienceCount || 0),
    audienceSegment: normalizedCampaign.audienceSegment,
    audienceSegmentLabel: audienceMeta.label,
    audienceSegmentDescription: audienceMeta.description,
    scheduleDay: normalizedCampaign.scheduleDay,
    scheduleDayLabel: DAY_LABELS[normalizedCampaign.scheduleDay] || DAY_LABELS.monday,
    scheduleHour: normalizedCampaign.scheduleHour,
    nextScheduledAt: normalizedCampaign.enabled ? computeNextScheduledAt(normalizedCampaign, now) : "",
    nextScheduledAtLabel: normalizedCampaign.enabled ? formatDateTimeLabel(computeNextScheduledAt(normalizedCampaign, now)) : "",
    lastSentAt: normalizedLog.lastSentAt,
    lastSentAtLabel: normalizedLog.lastSentAt ? formatDateTimeLabel(normalizedLog.lastSentAt) : "",
    lastSentMode: normalizedLog.lastSentMode,
    lastDeliveredCount: normalizedLog.lastDeliveredCount,
    lastSkippedCount: normalizedLog.lastSkippedCount,
    lastAudienceCount: normalizedLog.lastAudienceCount,
    lastSubject: normalizedLog.lastSubject || normalizedCampaign.subject,
    lastDispatchId: normalizedLog.lastDispatchId,
  };
}

async function buildNewsletterPreview(supabase, campaign) {
  const normalizedCampaign = normalizeNewsletterCampaign(campaign);
  const audience = await loadNewsletterAudience(supabase, normalizedCampaign.audienceSegment);
  const renderModel = buildNewsletterRenderModel(normalizedCampaign);
  const preview = renderCampaignEmailPreview({
    ...renderModel,
    previewRecipientEmail: NEWSLETTER_PREVIEW_RECIPIENT,
    previewRecipientName: "Johnathan",
  });

  return {
    subject: preview.subject,
    html: preview.html,
    text: preview.text,
    audienceCount: audience.audienceCount,
    audienceSegment: audience.segmentKey,
    audienceSegmentLabel: audience.segmentLabel,
    audienceSegmentDescription: audience.segmentDescription,
  };
}

async function sendNewsletterTestEmail(campaign, recipientEmail, options = {}) {
  const normalizedCampaign = normalizeNewsletterCampaign(campaign);
  const normalizedRecipient = normalizeEmail(recipientEmail);
  const renderModel = buildNewsletterRenderModel(normalizedCampaign);
  if (!normalizedRecipient) {
    throw new Error("A valid recipient email is required before sending a test newsletter.");
  }
  if (!normalizedCampaign.subject || !normalizedCampaign.title || !normalizedCampaign.intro) {
    throw new Error("Subject, title, and intro are required before sending a test newsletter.");
  }
  if (!renderModel.sections.length) {
    throw new Error("Add at least one newsletter section before sending a test newsletter.");
  }

  const preview = renderCampaignEmailPreview({
    ...renderModel,
    subject: options.subjectPrefix
      ? `${cleanText(options.subjectPrefix)} ${renderModel.subject}`.trim()
      : renderModel.subject,
    previewRecipientEmail: normalizedRecipient,
    previewRecipientName: options.recipientName || "Johnathan",
  });
  const delivery = await sendEmail({
    to: normalizedRecipient,
    subject: preview.subject,
    html: preview.html,
    text: preview.text,
    tags: [
      { name: "category", value: "preview" },
      { name: "event", value: cleanText(options.eventName || "newsletter_test_send") || "newsletter_test_send" },
    ],
  });

  return {
    ok: Boolean(delivery?.ok),
    id: cleanText(delivery?.id),
    recipient: normalizedRecipient,
    subject: preview.subject,
  };
}

async function loadNewsletterAnalytics(supabase, options = {}) {
  const limit = Math.min(12, Math.max(1, Number(options.limit || 6)));
  const { data: dispatchRows, error: dispatchError } = await supabase
    .from("audit_logs")
    .select("entity_id, action, details, created_at")
    .eq("entity_type", NEWSLETTER_DISPATCH_ENTITY_TYPE)
    .in("action", ["dispatch_manual", "dispatch_scheduled"])
    .order("created_at", { ascending: false })
    .limit(limit);

  if (dispatchError) {
    throw dispatchError;
  }

  const dispatchIds = Array.from(new Set((dispatchRows || []).map((row) => cleanText(row.entity_id)).filter(Boolean)));
  if (!dispatchIds.length) {
    return {
      dispatches: [],
      totals: {
        totalDispatches: 0,
        totalDelivered: 0,
        totalOpens: 0,
        totalClicks: 0,
        averageOpenRate: 0,
        averageClickRate: 0,
      },
    };
  }

  const { data: eventRows, error: eventError } = await supabase
    .from("audit_logs")
    .select("entity_id, action, details, created_at")
    .eq("entity_type", NEWSLETTER_DISPATCH_ENTITY_TYPE)
    .in("entity_id", dispatchIds)
    .order("created_at", { ascending: false });

  if (eventError) {
    throw eventError;
  }

  const eventMap = new Map(dispatchIds.map((dispatchId) => [dispatchId, []]));
  (eventRows || []).forEach((row) => {
    const dispatchId = cleanText(row.entity_id);
    if (eventMap.has(dispatchId)) {
      eventMap.get(dispatchId).push(row);
    }
  });

  const dispatches = (dispatchRows || []).map((row) => {
    const details = row.details || {};
    const dispatchId = cleanText(row.entity_id);
    const relatedEvents = eventMap.get(dispatchId) || [];
    const uniqueOpenRecipients = new Set();
    const uniqueClickRecipients = new Set();
    const clickDestinationCounts = new Map();

    relatedEvents.forEach((eventRow) => {
      const recipientKey = cleanText(eventRow.details?.recipientKey);
      if (eventRow.action === "open" && recipientKey) {
        uniqueOpenRecipients.add(recipientKey);
      }
      if (eventRow.action === "click" && recipientKey) {
        uniqueClickRecipients.add(recipientKey);
      }
      if (eventRow.action === "click") {
        const destination = cleanText(eventRow.details?.destination);
        if (destination) {
          clickDestinationCounts.set(destination, (clickDestinationCounts.get(destination) || 0) + 1);
        }
      }
    });

    const deliveredCount = Number(details.deliveredCount || 0);
    const uniqueOpenCount = uniqueOpenRecipients.size;
    const uniqueClickCount = uniqueClickRecipients.size;

    return {
      dispatchId,
      action: row.action,
      sentAt: row.created_at,
      sentAtLabel: formatDateTimeLabel(row.created_at),
      mode: cleanText(details.mode || (row.action === "dispatch_scheduled" ? "scheduled" : "manual")),
      subject: cleanText(details.subject),
      issueLabel: cleanText(details.issueLabel),
      audienceSegment: cleanText(details.audienceSegment),
      audienceSegmentLabel: cleanText(details.audienceSegmentLabel) || getAudienceSegmentMeta(details.audienceSegment).label,
      audienceCount: Number(details.audienceCount || 0),
      deliveredCount,
      skippedCount: Number(details.skippedCount || 0),
      uniqueOpenCount,
      uniqueClickCount,
      openRate: deliveredCount ? uniqueOpenCount / deliveredCount : 0,
      clickRate: deliveredCount ? uniqueClickCount / deliveredCount : 0,
      topDestinations: Array.from(clickDestinationCounts.entries())
        .sort((left, right) => right[1] - left[1])
        .slice(0, 3)
        .map(([destination, count]) => ({
          destination,
          count,
        })),
    };
  });

  const totals = dispatches.reduce(
    (summary, dispatch) => {
      summary.totalDispatches += 1;
      summary.totalDelivered += dispatch.deliveredCount;
      summary.totalOpens += dispatch.uniqueOpenCount;
      summary.totalClicks += dispatch.uniqueClickCount;
      return summary;
    },
    {
      totalDispatches: 0,
      totalDelivered: 0,
      totalOpens: 0,
      totalClicks: 0,
      averageOpenRate: 0,
      averageClickRate: 0,
    }
  );

  if (totals.totalDispatches) {
    totals.averageOpenRate = dispatches.reduce((sum, dispatch) => sum + dispatch.openRate, 0) / totals.totalDispatches;
    totals.averageClickRate = dispatches.reduce((sum, dispatch) => sum + dispatch.clickRate, 0) / totals.totalDispatches;
  }

  return { dispatches, totals };
}

async function dispatchNewsletterCampaign(supabase, campaign, options = {}) {
  const normalizedCampaign = normalizeNewsletterCampaign(campaign);
  const renderModel = buildNewsletterRenderModel(normalizedCampaign);
  const dispatchId = cleanText(options.dispatchId) || crypto.randomUUID();
  const audience = await loadNewsletterAudience(supabase, normalizedCampaign.audienceSegment);

  if (!normalizedCampaign.subject || !normalizedCampaign.title || !normalizedCampaign.intro) {
    throw new Error("Subject, title, and intro are required before sending a newsletter.");
  }
  if (!renderModel.sections.length) {
    throw new Error("Add at least one newsletter section before sending.");
  }

  const recipientByEmail = new Map(audience.recipients.map((recipient) => [normalizeEmail(recipient.email), recipient]));
  const delivery = audience.emails.length
    ? await sendCampaignEmail({
        to: audience.emails,
        subject: renderModel.subject,
        eyebrow: renderModel.eyebrow,
        title: renderModel.title,
        intro: renderModel.intro,
        sections: renderModel.sections,
        ctaLabel: renderModel.ctaLabel,
        ctaUrl: renderModel.ctaUrl,
        footerNote: renderModel.footerNote,
        previewText: renderModel.previewText,
        newsletterType: renderModel.newsletterType,
        keyTakeawayTitle: renderModel.keyTakeawayTitle,
        keyTakeawayBody: renderModel.keyTakeawayBody,
        references: renderModel.references,
        tags: [
          { name: "category", value: "marketing" },
          { name: "event", value: options.eventName || "weekly_newsletter" },
          { name: "segment", value: audience.segmentKey },
        ],
        recipientResolver: (recipientEmail) => {
          const audienceRecipient = recipientByEmail.get(normalizeEmail(recipientEmail));
          return {
            recipientName: audienceRecipient?.label || "",
            recipientType: audienceRecipient?.type || "client",
          };
        },
        trackingResolver: (recipientEmail) => {
          const recipientKey = buildNewsletterRecipientKey(dispatchId, recipientEmail);
          return {
            openPixelUrl: buildNewsletterOpenTrackingUrl(dispatchId, recipientKey),
            ctaUrl: renderModel.ctaUrl
              ? buildNewsletterClickTrackingUrl(dispatchId, recipientKey, renderModel.ctaUrl)
              : "",
          };
        },
      })
    : {
        recipients: [],
        ids: [],
        deliveries: [],
        skippedRecipients: [],
      };

  const deliveredCount = Array.isArray(delivery.deliveries) ? delivery.deliveries.length : 0;
  const skippedCount = Math.max(0, audience.audienceCount - deliveredCount);
  const summary = {
    dispatchId,
    audienceCount: audience.audienceCount,
    audienceSegment: audience.segmentKey,
    audienceSegmentLabel: audience.segmentLabel,
    deliveredCount,
    skippedCount,
    ids: delivery.ids || [],
  };

  const actorId = options.actorId || null;
  const dispatchAction = options.mode === "scheduled" ? "dispatch_scheduled" : "dispatch_manual";
  const dispatchDetails = buildNewsletterDispatchDetails(normalizedCampaign, audience, summary, options);

  await writeNewsletterDispatchAudit(supabase, actorId, dispatchAction, dispatchId, dispatchDetails);

  const recipientAuditRows = []
    .concat(
      (delivery.deliveries || []).map((recipientDelivery) => {
        const recipientEmail = normalizeEmail(recipientDelivery.recipient);
        const audienceRecipient = recipientByEmail.get(recipientEmail);
        return {
          actor_id: actorId,
          entity_type: NEWSLETTER_DISPATCH_ENTITY_TYPE,
          entity_id: dispatchId,
          action: "recipient_delivered",
          details: {
            recipientKey: buildNewsletterRecipientKey(dispatchId, recipientEmail),
            recipientEmail,
            recipientLabel: audienceRecipient?.label || "",
            recipientType: audienceRecipient?.type || "client",
            resendId: cleanText(recipientDelivery.id),
          },
        };
      })
    )
    .concat(
      (delivery.skippedRecipients || []).map((skippedRecipient) => ({
        actor_id: actorId,
        entity_type: NEWSLETTER_DISPATCH_ENTITY_TYPE,
        entity_id: dispatchId,
        action: "recipient_skipped",
        details: {
          recipientKey: buildNewsletterRecipientKey(dispatchId, skippedRecipient.recipient),
          recipientEmail: normalizeEmail(skippedRecipient.recipient),
          reason: cleanText(skippedRecipient.reason || "unknown"),
        },
      }))
    );
  await insertAuditRows(supabase, recipientAuditRows);

  return summary;
}

module.exports = {
  AUDIENCE_SEGMENTS,
  DAY_KEYS,
  DAY_LABELS,
  NEWSLETTER_DISPATCH_ENTITY_TYPE,
  NEWSLETTER_LOG_KEY,
  NEWSLETTER_PREVIEW_RECIPIENT,
  NEWSLETTER_SETTINGS_KEY,
  buildDefaultNewsletterCampaign,
  buildMalaysiaWeekKey,
  buildNewsletterClickTrackingUrl,
  buildNewsletterOpenTrackingUrl,
  buildNewsletterPreview,
  buildNewsletterRecipientKey,
  buildNewsletterRenderModel,
  buildNewsletterSections,
  buildNewsletterStatus,
  computeNextScheduledAt,
  dispatchNewsletterCampaign,
  formatDateTimeLabel,
  loadNewsletterAnalytics,
  loadNewsletterAudience,
  normalizeAudienceSegment,
  normalizeDispatchLog,
  normalizeNewsletterCampaign,
  readNewsletterState,
  saveNewsletterCampaign,
  saveNewsletterDispatchLog,
  sendNewsletterTestEmail,
  shouldDispatchScheduledNewsletter,
  verifyNewsletterTrackingToken,
  writeNewsletterAuditLog,
};
