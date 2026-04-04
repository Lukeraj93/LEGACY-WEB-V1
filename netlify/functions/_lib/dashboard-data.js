const { getOrSetRuntimeCache } = require("./runtime-cache");
const { listManagedClientIdsForCoach } = require("./supabase");

const CLIENT_LEADERBOARD_CACHE_TTL_MS = 60 * 1000;
const COACH_LEADERBOARD_CACHE_TTL_MS = 60 * 1000;
const CLIENT_HOME_SNAPSHOT_CACHE_TTL_MS = 60 * 1000;
const COACH_HOME_SNAPSHOT_CACHE_TTL_MS = 60 * 1000;
const ADMIN_HOME_SNAPSHOT_CACHE_TTL_MS = 60 * 1000;
const CLIENT_HOME_SNAPSHOT_MAX_AGE_MS = 10 * 60 * 1000;
const COACH_HOME_SNAPSHOT_MAX_AGE_MS = 10 * 60 * 1000;
const ADMIN_HOME_SNAPSHOT_MAX_AGE_MS = 5 * 60 * 1000;
const leaderboardCache = new Map();
const clientHomeSnapshotCache = new Map();
const coachHomeSnapshotCache = new Map();
const adminHomeSnapshotCache = new Map();
const XP_COACH_SCHEMA = "xp_coach";

function xpCoachSchema(supabase) {
  return supabase.schema(XP_COACH_SCHEMA);
}

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

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

function throwOnError(response) {
  if (response?.error) {
    throw response.error;
  }
}

function startOfCurrentMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function startOfCurrentQuarter() {
  const now = new Date();
  const quarterMonth = Math.floor(now.getMonth() / 3) * 3;
  return new Date(now.getFullYear(), quarterMonth, 1);
}

function formatLeaderboardName(value, fallback) {
  const normalized = String(value || "").trim();
  if (normalized) {
    return normalized;
  }
  return String(fallback || "").trim() || "Account";
}

function normalizeClientHomeSummary(summary, clientProfile) {
  const payload = summary && typeof summary === "object" ? summary : {};
  const earnedActionIds = Array.isArray(payload.earnedActionIds)
    ? payload.earnedActionIds.filter(Boolean)
    : [];

  return {
    currentXp: Math.max(0, Number(payload.currentXp ?? clientProfile?.xp_points ?? 0)),
    currentCoins: Math.max(0, Number(payload.currentCoins ?? clientProfile?.gym_coins ?? 0)),
    paidOrdersCount: Math.max(0, Number(payload.paidOrdersCount || 0)),
    totalPurchasesRm: Number(payload.totalPurchasesRm || 0),
    approvedXpEntriesCount: Math.max(0, Number(payload.approvedXpEntriesCount || 0)),
    approvedCoinEntriesCount: Math.max(0, Number(payload.approvedCoinEntriesCount || 0)),
    approvedRewardEntriesCount: Math.max(
      0,
      Number(payload.approvedRewardEntriesCount ?? 0)
    ),
    lifetimeApprovedXp: Math.max(0, Number(payload.lifetimeApprovedXp || 0)),
    lifetimeApprovedCoins: Math.max(0, Number(payload.lifetimeApprovedCoins || 0)),
    weeklyXp: Math.max(0, Number(payload.weeklyXp || 0)),
    weeklyCoins: Math.max(0, Number(payload.weeklyCoins || 0)),
    monthlyXp: Math.max(0, Number(payload.monthlyXp || 0)),
    monthlyCoins: Math.max(0, Number(payload.monthlyCoins || 0)),
    earnedActionIds,
  };
}

function normalizeCoachHomeSummary(summary) {
  const payload = summary && typeof summary === "object" ? summary : {};

  return {
    activeClients: Math.max(0, Number(payload.activeClients || 0)),
    pendingRewardCount: Math.max(0, Number(payload.pendingRewardCount || 0)),
    upcomingSessionsCount: Math.max(0, Number(payload.upcomingSessionsCount || 0)),
    completedSessionsThisMonth: Math.max(0, Number(payload.completedSessionsThisMonth || 0)),
    monthlyCommission: Number(payload.monthlyCommission || 0),
  };
}

function normalizeAdminHomeSummary(summary) {
  const payload = summary && typeof summary === "object" ? summary : {};
  const reviewRows = Array.isArray(payload.reviewRows) ? payload.reviewRows.filter(Boolean) : [];

  return {
    paidRevenue: Number(payload.paidRevenue || 0),
    grossSales: Number(payload.grossSales || 0),
    refundedRevenue: Number(payload.refundedRevenue || 0),
    trackedTaxes: Number(payload.trackedTaxes || 0),
    netRevenue: Number(payload.netRevenue || 0),
    pendingRevenue: Number(payload.pendingRevenue || 0),
    averagePaidOrder: Number(payload.averagePaidOrder || 0),
    gatewayFees: Number(payload.gatewayFees || 0),
    currentMonthGrossSales: Number(payload.currentMonthGrossSales || 0),
    currentMonthNetRevenue: Number(payload.currentMonthNetRevenue || 0),
    currentMonthGatewayFees: Number(payload.currentMonthGatewayFees || 0),
    currentMonthCommissionExpense: Number(payload.currentMonthCommissionExpense || 0),
    coachPayoutsPayable: Number(payload.coachPayoutsPayable || 0),
    coachPayoutsPaid: Number(payload.coachPayoutsPaid || 0),
    companyCommissionCaptured: Number(payload.companyCommissionCaptured || 0),
    averageCompanyTakePct: Number(payload.averageCompanyTakePct || 0),
    unusedLiability: Number(payload.unusedLiability || 0),
    liabilityAging: payload.liabilityAging && typeof payload.liabilityAging === "object" ? payload.liabilityAging : {},
    coachCount: Math.max(0, Number(payload.coachCount || 0)),
    activeClientCount: Math.max(0, Number(payload.activeClientCount || 0)),
    convertedLeadCount: Math.max(0, Number(payload.convertedLeadCount || 0)),
    totalLeadCount: Math.max(0, Number(payload.totalLeadCount || 0)),
    leadConversionRate: Number(payload.leadConversionRate || 0),
    pendingApprovals: Math.max(0, Number(payload.pendingApprovals || 0)),
    overdueFollowUps: Math.max(0, Number(payload.overdueFollowUps || 0)),
    unreadNotifications: Math.max(0, Number(payload.unreadNotifications || 0)),
    unattributedRevenue: Number(payload.unattributedRevenue || 0),
    reviewRows,
  };
}

async function getClientHomeSummary(supabase, userId, clientProfile) {
  return getOrSetRuntimeCache(
    clientHomeSnapshotCache,
    `client-home-summary:${userId}`,
    CLIENT_HOME_SNAPSHOT_CACHE_TTL_MS,
    async () => {
      const snapshotResponse = await supabase
        .from("client_home_snapshots")
        .select("summary, generated_at")
        .eq("client_id", userId)
        .maybeSingle();

      throwOnError(snapshotResponse);

      const existingRow = snapshotResponse.data || null;
      const existingSummary = normalizeClientHomeSummary(existingRow?.summary || {}, clientProfile);
      const generatedAt = new Date(existingRow?.generated_at || 0).getTime();
      const hasFreshSnapshot = Number.isFinite(generatedAt) && Date.now() - generatedAt <= CLIENT_HOME_SNAPSHOT_MAX_AGE_MS;

      if (existingRow?.summary && hasFreshSnapshot) {
        return existingSummary;
      }

      try {
        const refreshResponse = await supabase.rpc("refresh_client_home_snapshot", {
          p_client_id: userId,
        });
        throwOnError(refreshResponse);
        return normalizeClientHomeSummary(refreshResponse.data || {}, clientProfile);
      } catch (error) {
        if (existingRow?.summary) {
          return existingSummary;
        }
        throw error;
      }
    }
  );
}

async function getCoachHomeSummary(supabase, coachId) {
  return getOrSetRuntimeCache(
    coachHomeSnapshotCache,
    `coach-home-summary:${coachId}`,
    COACH_HOME_SNAPSHOT_CACHE_TTL_MS,
    async () => {
      const snapshotResponse = await supabase
        .from("coach_home_snapshots")
        .select("summary, generated_at")
        .eq("coach_id", coachId)
        .maybeSingle();

      throwOnError(snapshotResponse);

      const existingRow = snapshotResponse.data || null;
      const existingSummary = normalizeCoachHomeSummary(existingRow?.summary || {});
      const generatedAt = new Date(existingRow?.generated_at || 0).getTime();
      const hasFreshSnapshot = Number.isFinite(generatedAt) && Date.now() - generatedAt <= COACH_HOME_SNAPSHOT_MAX_AGE_MS;

      if (existingRow?.summary && hasFreshSnapshot) {
        return existingSummary;
      }

      try {
        const refreshResponse = await supabase.rpc("refresh_coach_home_snapshot", {
          p_coach_id: coachId,
        });
        throwOnError(refreshResponse);
        return normalizeCoachHomeSummary(refreshResponse.data || {});
      } catch (error) {
        if (existingRow?.summary) {
          return existingSummary;
        }
        throw error;
      }
    }
  );
}

async function getAdminHomeSummary(supabase, adminId) {
  return getOrSetRuntimeCache(
    adminHomeSnapshotCache,
    `admin-home-summary:${adminId}`,
    ADMIN_HOME_SNAPSHOT_CACHE_TTL_MS,
    async () => {
      const snapshotResponse = await supabase
        .from("admin_home_snapshots")
        .select("summary, generated_at")
        .eq("admin_id", adminId)
        .maybeSingle();

      throwOnError(snapshotResponse);

      const existingRow = snapshotResponse.data || null;
      const existingSummary = normalizeAdminHomeSummary(existingRow?.summary || {});
      const generatedAt = new Date(existingRow?.generated_at || 0).getTime();
      const hasFreshSnapshot = Number.isFinite(generatedAt) && Date.now() - generatedAt <= ADMIN_HOME_SNAPSHOT_MAX_AGE_MS;

      if (existingRow?.summary && hasFreshSnapshot) {
        return existingSummary;
      }

      try {
        const refreshResponse = await supabase.rpc("refresh_admin_home_snapshot", {
          p_admin_id: adminId,
        });
        throwOnError(refreshResponse);
        return normalizeAdminHomeSummary(refreshResponse.data || {});
      } catch (error) {
        if (existingRow?.summary) {
          return existingSummary;
        }
        throw error;
      }
    }
  );
}

async function loadClientLeaderboard(supabase, limit = 8) {
  return getOrSetRuntimeCache(
    leaderboardCache,
    `client:${limit}`,
    CLIENT_LEADERBOARD_CACHE_TTL_MS,
    async () => {
      const shortlistLimit = Math.max(limit * 3, 24);
      const clientProfilesResponse = await supabase
        .from("client_profiles")
        .select("id, preferred_name, xp_points, gym_coins, primary_goal, member_id")
        .order("xp_points", { ascending: false })
        .order("gym_coins", { ascending: false })
        .limit(shortlistLimit);

      throwOnError(clientProfilesResponse);

      const clientProfiles = clientProfilesResponse.data || [];
      const accountIds = uniqueValues(clientProfiles.map((item) => item.id));
      if (!accountIds.length) {
        return [];
      }

      const profilesResponse = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url, status")
        .eq("role", "client")
        .eq("status", "active")
        .in("id", accountIds);

      throwOnError(profilesResponse);

      const profileMap = new Map((profilesResponse.data || []).map((item) => [item.id, item]));
      return clientProfiles
        .filter((item) => profileMap.has(item.id))
        .map((detail) => {
          const profile = profileMap.get(detail.id) || null;
          return {
            id: detail.id,
            displayName: formatLeaderboardName(detail?.preferred_name, profile?.display_name),
            avatarUrl: profile?.avatar_url || "",
            xpPoints: Math.max(0, Number(detail?.xp_points || 0)),
            gymCoins: Math.max(0, Number(detail?.gym_coins || 0)),
            primaryGoal: String(detail?.primary_goal || "").trim(),
            memberId: String(detail?.member_id || "").trim(),
          };
        })
        .sort((left, right) =>
          Number(right.xpPoints || 0) - Number(left.xpPoints || 0)
          || Number(right.gymCoins || 0) - Number(left.gymCoins || 0)
          || left.displayName.localeCompare(right.displayName)
        )
        .slice(0, limit)
        .map((entry, index) => ({
          ...entry,
          rank: index + 1,
        }));
    }
  );
}

async function loadCoachLeaderboard(supabase, limit = 8) {
  return getOrSetRuntimeCache(
    leaderboardCache,
    `coach:${limit}`,
    COACH_LEADERBOARD_CACHE_TTL_MS,
    async () => {
      const quarterStartIso = startOfCurrentQuarter().toISOString();
      const [profilesResponse, coachProfilesResponse, assignmentsResponse, sessionsResponse, commissionsResponse, xpOverviewResponse] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, display_name, avatar_url, status")
          .eq("role", "coach")
          .eq("status", "active"),
        supabase
          .from("coach_profiles")
          .select("id, commission_tier, commission_rate, position_code"),
        supabase
          .from("coach_client_assignments")
          .select("coach_id, status")
          .eq("status", "active"),
        supabase
          .from("sessions")
          .select("coach_id, status, completed_at")
          .eq("status", "completed")
          .gte("completed_at", quarterStartIso),
        supabase
          .from("commission_records")
          .select("coach_id, amount_rm, created_at")
          .gte("created_at", quarterStartIso),
        xpCoachSchema(supabase)
          .from("coach_overview_view")
          .select(
            "profile_id, profile_display_name, total_xp_counted, global_level, current_operational_title, coaching_weekly_counted_xp, impact_quarterly_counted_xp"
          )
          .order("total_xp_counted", { ascending: false })
          .limit(Math.max(limit * 3, 24))
          .then((response) => (response?.error ? { data: [], error: null } : response))
          .catch(() => ({ data: [], error: null })),
      ]);

      [profilesResponse, coachProfilesResponse, assignmentsResponse, sessionsResponse, commissionsResponse].forEach(throwOnError);

      const coachProfileMap = new Map((coachProfilesResponse.data || []).map((item) => [item.id, item]));
      const xpOverviewMap = new Map(
        (xpOverviewResponse.data || [])
          .map((item) => [String(item?.profile_id || "").trim(), item])
          .filter(([profileId]) => Boolean(profileId))
      );
      const activeClientCounts = new Map();
      const completedSessionCounts = new Map();
      const commissionTotals = new Map();

      (assignmentsResponse.data || []).forEach((assignment) => {
        const coachId = String(assignment?.coach_id || "").trim();
        if (!coachId) {
          return;
        }
        activeClientCounts.set(coachId, Number(activeClientCounts.get(coachId) || 0) + 1);
      });

      (sessionsResponse.data || []).forEach((session) => {
        const coachId = String(session?.coach_id || "").trim();
        if (!coachId) {
          return;
        }
        completedSessionCounts.set(coachId, Number(completedSessionCounts.get(coachId) || 0) + 1);
      });

      (commissionsResponse.data || []).forEach((record) => {
        const coachId = String(record?.coach_id || "").trim();
        if (!coachId) {
          return;
        }
        commissionTotals.set(coachId, Number(commissionTotals.get(coachId) || 0) + Number(record?.amount_rm || 0));
      });

      return (profilesResponse.data || [])
        .map((profile) => {
          const coachProfile = coachProfileMap.get(profile.id) || null;
          const xpOverview = xpOverviewMap.get(profile.id) || null;
          return {
            id: profile.id,
            displayName: formatLeaderboardName(
              xpOverview?.profile_display_name || profile.display_name,
              "Coach"
            ),
            avatarUrl: profile.avatar_url || "",
            activeClients: Number(activeClientCounts.get(profile.id) || 0),
            completedSessions: Number(completedSessionCounts.get(profile.id) || 0),
            commissionTotal: Number(commissionTotals.get(profile.id) || 0),
            commissionTier: String(coachProfile?.commission_tier || "").trim(),
            positionCode: String(coachProfile?.position_code || "").trim(),
            commissionRate: Number(coachProfile?.commission_rate || 0),
            totalXpCounted: Number(xpOverview?.total_xp_counted || 0),
            globalLevel: Math.max(1, Number(xpOverview?.global_level || 1)),
            currentOperationalTitle: String(xpOverview?.current_operational_title || "").trim(),
            coachingWeeklyXp: Number(xpOverview?.coaching_weekly_counted_xp || 0),
            impactQuarterXp: Number(xpOverview?.impact_quarterly_counted_xp || 0),
          };
        })
        .sort((left, right) =>
          Number(right.totalXpCounted || 0) - Number(left.totalXpCounted || 0)
          || Number(right.impactQuarterXp || 0) - Number(left.impactQuarterXp || 0)
          || Number(right.coachingWeeklyXp || 0) - Number(left.coachingWeeklyXp || 0)
          || Number(right.activeClients || 0) - Number(left.activeClients || 0)
          || left.displayName.localeCompare(right.displayName)
        )
        .slice(0, limit)
        .map((entry, index) => ({
          ...entry,
          rank: index + 1,
        }));
    }
  );
}

async function loadPlannerRewardEventsForLedgerEntries(supabase, ledgerEntries) {
  const rewardIds = uniqueValues((ledgerEntries || []).map((entry) => entry.id));
  if (!rewardIds.length) {
    return [];
  }

  const [xpLinkedResponse, coinLinkedResponse] = await Promise.all([
    supabase
      .from("planner_reward_events")
      .select(
        "id, client_id, coach_id, source_module, source_record_id, action_id, approval_status, requested_by, approved_by, approved_at, xp_ledger_entry_id, coin_ledger_entry_id, reason, metadata, created_at"
      )
      .in("xp_ledger_entry_id", rewardIds),
    supabase
      .from("planner_reward_events")
      .select(
        "id, client_id, coach_id, source_module, source_record_id, action_id, approval_status, requested_by, approved_by, approved_at, xp_ledger_entry_id, coin_ledger_entry_id, reason, metadata, created_at"
      )
      .in("coin_ledger_entry_id", rewardIds),
  ]);

  [xpLinkedResponse, coinLinkedResponse].forEach(throwOnError);

  return Array.from(
    new Map(
      [...(xpLinkedResponse.data || []), ...(coinLinkedResponse.data || [])]
        .filter((item) => item?.id)
        .map((item) => [item.id, item])
    ).values()
  );
}

async function getClientDashboardPayload(supabase, auth, pageKey, options = {}) {
  const access = buildAccess(auth);
  const userId = access.user.id;
  const nowIso = new Date().toISOString();
  const variant = String(options?.variant || "")
    .trim()
    .toLowerCase();
  const isPrimaryVariant = variant === "primary";
  const isSecondaryVariant = variant === "secondary";
  const isHomePage = pageKey === "home";
  const includeProfile = pageKey === "profile";
  const includeOrderHistory = pageKey === "packages" || includeProfile;
  const includePurchaseSummary = includeOrderHistory;
  const includeCatalog = pageKey === "packages";
  const includeRewards = pageKey === "rewards" || includeProfile;
  const includeSchedule = pageKey === "home" || pageKey === "schedule" || includeProfile;
  const includeSessionHistory = includeSchedule || includeRewards;
  const includeLeaderboard = pageKey === "rewards" || includeProfile || (isHomePage && !isPrimaryVariant);
  const includeHomeSummary = isHomePage;
  const orderHistoryLimit = pageKey === "packages" ? 12 : includeProfile ? 8 : 6;
  const pointsLedgerLimit = pageKey === "rewards" ? 50 : isHomePage ? 14 : 20;
  const scheduleWindowLimit = pageKey === "schedule" ? 30 : isHomePage ? 8 : 12;
  const sessionChangeLimit = pageKey === "schedule" ? 30 : isHomePage ? 8 : 12;

  if (isHomePage && isSecondaryVariant) {
    return {
      access,
      clientLeaderboard: includeLeaderboard ? await loadClientLeaderboard(supabase, 8) : [],
    };
  }

  const [
    profileResponse,
    clientProfileResponse,
    assignmentResponse,
    packagesResponse,
    ordersResponse,
    pointsLedgerResponse,
    packageCatalogResponse,
  ] = await Promise.all([
    supabase.from("profiles").select("id, display_name, avatar_url, status").eq("id", userId).single(),
    supabase
      .from("client_profiles")
      .select("preferred_name, avatar_slug, xp_points, gym_coins, primary_goal, member_id")
      .eq("id", userId)
      .maybeSingle(),
    supabase
      .from("coach_client_assignments")
      .select("coach_id, status")
      .eq("client_id", userId)
      .eq("status", "active")
      .order("assigned_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("client_packages")
      .select(
        "id, client_id, order_id, package_id, package_name, sessions_purchased, sessions_remaining, status, activated_at, expires_at, created_at"
      )
      .eq("client_id", userId)
      .order("created_at", { ascending: false }),
    includePurchaseSummary
      ? supabase
          .from("orders")
          .select(
            includeOrderHistory
              ? "id, created_at, total_amount_rm, status, external_reference, invoice_number, invoice_storage_path, receipt_number, receipt_storage_path, refund_receipt_number, refund_receipt_storage_path"
              : "id, created_at, total_amount_rm, status"
          )
          .eq("client_id", userId)
          .order("created_at", { ascending: false })
          .limit(orderHistoryLimit)
      : Promise.resolve({ data: [], error: null }),
    includeRewards
      ? supabase
          .from("points_ledger")
          .select("points_type, delta, approval_status, created_at")
          .eq("client_id", userId)
          .order("created_at", { ascending: false })
          .limit(pointsLedgerLimit)
      : Promise.resolve({ data: [], error: null }),
    includeCatalog
      ? supabase
          .from("package_catalog")
          .select(
            "id, code, name, package_type, commitment_kind, training_format, tier_code, sessions_included, expiry_days, price_rm, sst_amount_rm, gross_amount_rm, currency, is_active, metadata"
          )
          .eq("package_type", "coaching")
          .eq("is_active", true)
      : Promise.resolve({ data: [], error: null }),
  ]);

  [
    profileResponse,
    clientProfileResponse,
    assignmentResponse,
    packagesResponse,
    ordersResponse,
    pointsLedgerResponse,
    packageCatalogResponse,
  ].forEach(throwOnError);

  const profile = profileResponse.data || null;
  const clientProfile = clientProfileResponse.data || null;
  const assignment = assignmentResponse.data || null;
  const packages = packagesResponse.data || [];
  const orders = ordersResponse.data || [];
  const pointsLedger = pointsLedgerResponse.data || [];
  const packageCatalog = packageCatalogResponse.data || [];
  const packageIds = packages.map((item) => item.id).filter(Boolean);
  const orderIds = orders.map((order) => order.id);
  const coachIds = uniqueValues([assignment?.coach_id]);

  const [sessionsResponse, bookingRequestsResponse] = await Promise.all([
    includeSessionHistory
      ? packageIds.length
        ? supabase
            .from("sessions")
            .select("id, scheduled_start, scheduled_end, coach_id, client_package_id, status")
            .in("client_package_id", packageIds)
            .order("scheduled_start", { ascending: true })
            .limit(scheduleWindowLimit)
        : supabase
            .from("sessions")
            .select("id, scheduled_start, scheduled_end, coach_id, client_package_id, status")
            .eq("client_id", userId)
            .gte("scheduled_start", nowIso)
            .order("scheduled_start", { ascending: true })
            .limit(scheduleWindowLimit)
      : Promise.resolve({ data: [], error: null }),
    includeSchedule
      ? packageIds.length
        ? supabase
            .from("booking_requests")
            .select("id, requested_date, requested_time, preferred_coach_id, client_package_id, status, notes, created_at")
            .in("client_package_id", packageIds)
            .order("requested_date", { ascending: true })
            .order("requested_time", { ascending: true })
            .limit(scheduleWindowLimit)
        : supabase
            .from("booking_requests")
            .select("id, requested_date, requested_time, preferred_coach_id, client_package_id, status, notes, created_at")
            .eq("client_id", userId)
            .order("requested_date", { ascending: true })
            .order("requested_time", { ascending: true })
            .limit(scheduleWindowLimit)
      : Promise.resolve({ data: [], error: null }),
  ]);

  [sessionsResponse, bookingRequestsResponse].forEach(throwOnError);

  const sessions = sessionsResponse.data || [];
  const bookingRequests = bookingRequestsResponse.data || [];
  const sessionIds = sessions.map((session) => session.id).filter(Boolean);
  const sessionChangeRequestsResponse = includeSchedule
    ? sessionIds.length
      ? await supabase
          .from("session_change_requests")
          .select(
            "id, session_id, request_type, original_start, original_end, requested_start, requested_end, reason, status, created_at"
          )
          .in("session_id", sessionIds)
          .order("created_at", { ascending: false })
          .limit(sessionChangeLimit)
      : await supabase
          .from("session_change_requests")
          .select(
            "id, session_id, request_type, original_start, original_end, requested_start, requested_end, reason, status, created_at"
          )
          .eq("client_id", userId)
          .order("created_at", { ascending: false })
          .limit(sessionChangeLimit)
    : { data: [], error: null };

  throwOnError(sessionChangeRequestsResponse);

  const sessionChangeRequests = sessionChangeRequestsResponse.data || [];
  const resolvedCoachIds = uniqueValues(
    coachIds
      .concat(sessions.map((session) => session.coach_id))
      .concat(bookingRequests.map((request) => request.preferred_coach_id))
  );

  const [orderItemsResponse, coachProfilesResponse, coachAvailabilityResponse, clientLeaderboardResponse, homeSummaryResponse] = await Promise.all([
    includeOrderHistory && orderIds.length
      ? supabase.from("order_items").select("order_id, name").in("order_id", orderIds)
      : Promise.resolve({ data: [], error: null }),
    resolvedCoachIds.length
      ? supabase.from("profiles").select("id, display_name").in("id", resolvedCoachIds)
      : Promise.resolve({ data: [], error: null }),
    includeSchedule && assignment?.coach_id
      ? supabase
          .from("coach_availability_windows")
          .select("id, coach_id, day_of_week, start_time, end_time, timezone, is_active")
          .eq("coach_id", assignment.coach_id)
          .eq("is_active", true)
      : Promise.resolve({ data: [], error: null }),
    includeLeaderboard ? loadClientLeaderboard(supabase, 8) : Promise.resolve([]),
    includeHomeSummary ? getClientHomeSummary(supabase, userId, clientProfile) : Promise.resolve(null),
  ]);

  [orderItemsResponse, coachProfilesResponse, coachAvailabilityResponse].forEach(throwOnError);

  return {
    access,
    profile,
    clientProfile,
    assignment,
    packages,
    ...(includeCatalog
      ? {
          packageCatalog,
        }
      : {}),
    ...(includePurchaseSummary
      ? {
          orders,
        }
      : {}),
    ...(includeOrderHistory
      ? {
          orderItems: orderItemsResponse.data || [],
        }
      : {}),
    ...(includeSessionHistory
      ? {
          sessions,
        }
      : {}),
    ...(includeSchedule
      ? {
          bookingRequests,
          sessionChangeRequests,
          coachAvailabilityWindows: coachAvailabilityResponse.data || [],
        }
      : {}),
    ...(includeRewards
      ? {
          pointsLedger,
        }
      : {}),
    ...(includeLeaderboard
      ? {
          clientLeaderboard: clientLeaderboardResponse || [],
        }
      : {}),
    ...(includeHomeSummary
      ? {
          homeSummary: homeSummaryResponse || null,
        }
      : {}),
    coachProfiles: coachProfilesResponse.data || [],
  };
}

async function getCoachDashboardPayload(supabase, auth, pageKey, options = {}) {
  const access = buildAccess(auth);
  const coachId = access.user.id;
  const sessionWindowStartIso = startOfCurrentQuarter().toISOString();
  const variant = String(options?.variant || "")
    .trim()
    .toLowerCase();
  const isHomePage = pageKey === "home";
  const isClientsPage = pageKey === "clients";
  const isPrimaryVariant = variant === "primary";
  const isSecondaryVariant = variant === "secondary";
  const isHomeSecondary = isHomePage && isSecondaryVariant;
  const isClientsPrimary = isClientsPage && isPrimaryVariant;
  const isClientsSecondary = isClientsPage && isSecondaryVariant;
  const includeProfile = pageKey === "profile";
  const includeRoster = pageKey === "home" || includeProfile || (isClientsPage && !isClientsSecondary);
  const includeSchedule = pageKey === "home" || pageKey === "schedule" || includeProfile;
  const includeCommissions = pageKey === "commissions" || includeProfile;
  const includeConsults = isClientsPage && !isClientsPrimary;
  const includeLeaderboard = includeProfile || (isHomePage && !isPrimaryVariant);
  const includePointsLedger = includeProfile || (isClientsPage && !isClientsSecondary);
  const includeAvailability = pageKey === "schedule" || includeProfile;
  const includeSessionChangeRequests = pageKey === "schedule" || includeProfile;
  const includeClientPackages =
    (pageKey === "schedule" || pageKey === "commissions" || includeProfile || (isClientsPage && !isClientsSecondary))
    && !isHomeSecondary;
  const coachSessionLimit = pageKey === "schedule" ? 30 : 16;
  const coachCommissionLimit = pageKey === "commissions" ? 20 : 12;
  const coachConsultLimit = 80;
  const coachActivationCodeLimit = 24;
  const coachPointsLedgerLimit = 60;
  const coachBookingLimit = 16;

  if (isHomePage && isPrimaryVariant) {
    const [profileResponse, coachProfileResponse, homeSummary] = await Promise.all([
      supabase.from("profiles").select("id, display_name, avatar_url, status").eq("id", coachId).maybeSingle(),
      supabase
        .from("coach_profiles")
        .select(
          "commission_tier, commission_rate, position_code, commission_cap, commission_bonus_notes, hours_minimum, hours_target, review_due_at, last_reviewed_at, promotion_ready, kpi_summary, notes, google_calendar_email, calendar_sync_enabled, payout_bank_name, payout_account_name, payout_account_number, payout_bank_code"
        )
        .eq("id", coachId)
        .maybeSingle(),
      getCoachHomeSummary(supabase, coachId),
    ]);

    [profileResponse, coachProfileResponse].forEach(throwOnError);

    return {
      access,
      profile: profileResponse.data || null,
      coachProfile: coachProfileResponse.data || null,
      homeSummary: homeSummary || null,
      homeDetailsLoaded: false,
      assignments: [],
      clientProfiles: [],
      clientProfileDetails: [],
      clientPackages: [],
      bookingRequests: [],
      pointsLedger: [],
      sessions: [],
      availabilityWindows: [],
      sessionChangeRequests: [],
      commissions: [],
      commissionSessions: [],
      coachLeaderboard: [],
    };
  }

  const [
    profileResponse,
    coachProfileResponse,
    assignmentsResponse,
    preferredClientLinksResponse,
    sessionsResponse,
    commissionResponse,
    availabilityResponse,
    sessionChangeRequestsResponse,
    leadsResponse,
    consultIntakesResponse,
    activationCodesResponse,
  ] = await Promise.all([
    supabase.from("profiles").select("id, display_name, avatar_url, status").eq("id", coachId).maybeSingle(),
    supabase
      .from("coach_profiles")
      .select(
        "commission_tier, commission_rate, position_code, commission_cap, commission_bonus_notes, hours_minimum, hours_target, review_due_at, last_reviewed_at, promotion_ready, kpi_summary, notes, google_calendar_email, calendar_sync_enabled, payout_bank_name, payout_account_name, payout_account_number, payout_bank_code"
      )
      .eq("id", coachId)
      .maybeSingle(),
    includeRoster || includeSchedule || includeCommissions
      ? supabase
          .from("coach_client_assignments")
          .select("id, client_id, status, assigned_at")
          .eq("coach_id", coachId)
          .eq("status", "active")
          .order("assigned_at", { ascending: true })
      : Promise.resolve({ data: [], error: null }),
    includeRoster || includeSchedule || includeCommissions
      ? supabase
          .from("client_profiles")
          .select("id")
          .eq("preferred_coach_id", coachId)
      : Promise.resolve({ data: [], error: null }),
    includeSchedule || includeCommissions
      ? supabase
          .from("sessions")
          .select("id, client_id, client_package_id, booking_request_id, scheduled_start, scheduled_end, status, session_value_rm, completed_at, coach_check_in_at, coach_check_in_by, coach_attendance_status, coach_note, coach_next_step, coach_note_recorded_at, coach_note_recorded_by")
          .eq("coach_id", coachId)
          .gte("scheduled_start", sessionWindowStartIso)
          .order("scheduled_start", { ascending: true })
          .limit(coachSessionLimit)
      : Promise.resolve({ data: [], error: null }),
    includeCommissions
      ? supabase
          .from("commission_records")
          .select("id, session_id, commission_rate, amount_rm, payout_month, payout_status, created_at")
          .eq("coach_id", coachId)
          .order("created_at", { ascending: false })
          .limit(coachCommissionLimit)
      : Promise.resolve({ data: [], error: null }),
    includeAvailability
      ? supabase
          .from("coach_availability_windows")
          .select("id, day_of_week, start_time, end_time, timezone, is_active, created_at")
          .eq("coach_id", coachId)
          .eq("is_active", true)
          .order("day_of_week", { ascending: true })
          .order("start_time", { ascending: true })
      : Promise.resolve({ data: [], error: null }),
    includeSessionChangeRequests
      ? supabase
          .from("session_change_requests")
          .select(
            "id, session_id, client_id, coach_id, request_type, original_start, original_end, requested_start, requested_end, reason, status, created_at"
          )
          .eq("coach_id", coachId)
          .order("created_at", { ascending: false })
          .limit(30)
      : Promise.resolve({ data: [], error: null }),
    includeConsults
      ? supabase
          .from("leads")
          .select("id, full_name, email, phone, source, status, next_follow_up_at, owner_id, notes, converted_client_id, created_at")
          .eq("owner_id", coachId)
          .order("created_at", { ascending: false })
          .limit(coachConsultLimit)
      : Promise.resolve({ data: [], error: null }),
    includeConsults
      ? supabase
          .from("coach_consult_intakes")
          .select(
            "id, coach_id, lead_id, summary, hotness, recommended_service, recommended_frequency, recommended_timeline, next_step, primary_goal, biggest_barrier, primary_lever, risk_flags, created_at"
          )
          .eq("coach_id", coachId)
          .order("created_at", { ascending: false })
          .limit(coachConsultLimit)
      : Promise.resolve({ data: [], error: null }),
    includeConsults
      ? supabase
          .from("activation_codes")
          .select("id, role, code, recipient_email, recipient_name, assigned_coach_id, status, expires_at, used_at, created_at")
          .eq("role", "client")
          .or(`generated_by.eq.${coachId},assigned_coach_id.eq.${coachId}`)
          .order("created_at", { ascending: false })
          .limit(coachActivationCodeLimit)
      : Promise.resolve({ data: [], error: null }),
  ]);

  [
    profileResponse,
    coachProfileResponse,
    assignmentsResponse,
    preferredClientLinksResponse,
    sessionsResponse,
    commissionResponse,
    availabilityResponse,
    sessionChangeRequestsResponse,
    leadsResponse,
    consultIntakesResponse,
    activationCodesResponse,
  ].forEach(throwOnError);

  const assignments = assignmentsResponse.data || [];
  const sessions = sessionsResponse.data || [];
  const commissions = commissionResponse.data || [];
  const availabilityWindows = availabilityResponse.data || [];
  const sessionChangeRequests = sessionChangeRequestsResponse.data || [];
  const leads = leadsResponse.data || [];
  const consultIntakes = consultIntakesResponse.data || [];
  const activationCodes = activationCodesResponse.data || [];
  const clientIds = uniqueValues([
    ...assignments.map((assignment) => assignment.client_id),
    ...((preferredClientLinksResponse.data || []).map((item) => item.id)),
  ]);
  const leadIds = leads.map((lead) => lead.id).filter(Boolean);

  let clientProfiles = [];
  let clientProfileDetails = [];
  let clientPackages = [];
  let bookingRequests = [];
  let pointsLedger = [];
  let leadActivities = [];

  if (clientIds.length && (includeRoster || includeSchedule || includeCommissions)) {
    const [
      clientProfilesResponse,
      clientProfileDetailsResponse,
      clientPackagesResponse,
      bookingRequestsResponse,
      pointsLedgerResponse,
    ] = await Promise.all([
      supabase.from("profiles").select("id, display_name, status").in("id", clientIds),
      supabase
        .from("client_profiles")
        .select("id, preferred_name, xp_points, gym_coins, primary_goal")
        .in("id", clientIds),
      includeClientPackages
        ? supabase
            .from("client_packages")
            .select("id, client_id, order_id, package_name, sessions_purchased, sessions_remaining, activated_at, expires_at, status")
            .in("client_id", clientIds)
            .order("created_at", { ascending: false })
        : Promise.resolve({ data: [], error: null }),
      includeRoster || includeSchedule
        ? supabase
            .from("booking_requests")
            .select("id, client_id, preferred_coach_id, client_package_id, requested_date, requested_time, notes, status, created_at")
            .in("client_id", clientIds)
            .order("created_at", { ascending: false })
            .limit(coachBookingLimit)
        : Promise.resolve({ data: [], error: null }),
      includePointsLedger
        ? supabase
            .from("points_ledger")
            .select("id, client_id, points_type, delta, reason, requested_by, approval_status, created_at")
            .in("client_id", clientIds)
            .order("created_at", { ascending: false })
            .limit(coachPointsLedgerLimit)
        : Promise.resolve({ data: [], error: null }),
    ]);

    [
      clientProfilesResponse,
      clientProfileDetailsResponse,
      clientPackagesResponse,
      bookingRequestsResponse,
      pointsLedgerResponse,
    ].forEach(throwOnError);

    clientProfiles = clientProfilesResponse.data || [];
    clientProfileDetails = clientProfileDetailsResponse.data || [];
    clientPackages = clientPackagesResponse.data || [];
    bookingRequests = bookingRequestsResponse.data || [];
    pointsLedger = pointsLedgerResponse.data || [];
  }

  if (includeConsults && leadIds.length) {
    const leadActivitiesResponse = await supabase
      .from("lead_activities")
      .select("id, lead_id, actor_id, activity_type, notes, created_at")
      .in("lead_id", leadIds)
      .order("created_at", { ascending: false })
      .limit(coachConsultLimit);

    throwOnError(leadActivitiesResponse);
    leadActivities = leadActivitiesResponse.data || [];
  }

  const commissionSessionIds = commissions.map((record) => record.session_id).filter(Boolean);
  const missingCommissionSessionIds = commissionSessionIds.filter(
    (sessionId) => !sessions.some((session) => session.id === sessionId)
  );
  let commissionSessions = sessions;

  if (includeCommissions && missingCommissionSessionIds.length) {
    const commissionSessionsResponse = await supabase
      .from("sessions")
      .select("id, client_id, client_package_id, booking_request_id, scheduled_start, scheduled_end, status, session_value_rm, completed_at, coach_check_in_at, coach_check_in_by, coach_attendance_status, coach_note, coach_next_step, coach_note_recorded_at, coach_note_recorded_by")
      .in("id", missingCommissionSessionIds);

    throwOnError(commissionSessionsResponse);
    commissionSessions = sessions.concat(commissionSessionsResponse.data || []);
  }

  const coachLeaderboard = includeLeaderboard ? await loadCoachLeaderboard(supabase, 8) : [];

  return {
    access,
    profile: profileResponse.data || null,
    coachProfile: coachProfileResponse.data || null,
    ...(isHomePage
      ? {
          homeDetailsLoaded: true,
        }
      : {}),
    ...(isClientsPage
      ? {
          clientWorkspaceDetailsLoaded: !isClientsPrimary,
        }
      : {}),
    ...(includeRoster || includeSchedule || includeCommissions
      ? {
          assignments,
          clientProfiles,
          clientProfileDetails,
        }
      : {}),
    ...(includePointsLedger
      ? {
          clientPackages,
          pointsLedger,
        }
      : {}),
    ...(includeRoster || includeSchedule
      ? {
          bookingRequests,
        }
      : {}),
    ...(includeSchedule
      ? {
          sessions,
          availabilityWindows,
          sessionChangeRequests,
        }
      : {}),
    ...(includeCommissions
      ? {
          commissions,
          commissionSessions,
          sessions,
        }
      : {}),
    ...(includeConsults
      ? {
          leads,
          leadActivities,
          consultIntakes,
          activationCodes,
        }
      : {}),
    ...(includeLeaderboard
      ? {
          coachLeaderboard,
        }
      : {}),
  };
}

function buildAdminActorProfiles(coaches, clients, adminId) {
  return Array.from(
    new Map(
      (coaches || [])
        .concat(clients || [])
        .concat([{ id: adminId, display_name: "Super Admin", role: "super_admin" }])
        .filter((item) => item?.id)
        .map((item) => [
          item.id,
          {
            id: item.id,
            display_name: item.display_name || "Account",
            role: item.role || item.status || "",
          },
        ])
    ).values()
  );
}

async function getAdminDashboardPayload(supabase, auth, pageKey, options = {}) {
  const access = buildAccess(auth);
  const currentMonthStart = startOfCurrentMonth().toISOString().slice(0, 10);
  const isAdminHome = pageKey === "home";
  const isLeadsPage = pageKey === "leads";
  const isFinancialsPage = pageKey === "financials";
  const variant = String(options?.variant || "")
    .trim()
    .toLowerCase();
  const isPrimaryVariant = variant === "primary";
  const isSecondaryVariant = variant === "secondary";
  const isHomePrimary = isAdminHome && isPrimaryVariant;
  const isLeadsPrimary = isLeadsPage && isPrimaryVariant;
  const isLeadsSecondary = isLeadsPage && isSecondaryVariant;
  const isFinancialsPrimary = isFinancialsPage && isPrimaryVariant;
  const isFinancialsSecondary = isFinancialsPage && isSecondaryVariant;

  if (isHomePrimary) {
    const [notificationsResponse, homeSummary] = await Promise.all([
      supabase
        .from("notifications")
        .select("id, category, title, body, action_url, is_read, created_at")
        .order("created_at", { ascending: false })
        .limit(40),
      getAdminHomeSummary(supabase, access.user.id),
    ]);

    throwOnError(notificationsResponse);

    return {
      access,
      homeSummary: homeSummary || null,
      notifications: notificationsResponse.data || [],
      coaches: [],
      coachProfiles: [],
      clients: [],
      clientProfiles: [],
      assignments: [],
      clientPackages: [],
      rewards: [],
      plannerRewardEvents: [],
      leads: [],
      leadActivities: [],
      orders: [],
      sessions: [],
      payments: [],
      orderItems: [],
      commissions: [],
      bookingRequests: [],
      actorProfiles: [],
      activationCodes: [],
      currentMonthStart,
    };
  }

  if (pageKey === "clients") {
    const [
      coachesResponse,
      coachProfilesResponse,
      clientsResponse,
      clientProfilesResponse,
      assignmentsResponse,
      packagesResponse,
      rewardsResponse,
      notificationsResponse,
      activationCodesResponse,
    ] = await Promise.all([
      supabase.from("profiles").select("id, display_name, role, status").eq("role", "coach").order("created_at", { ascending: true }),
      supabase
        .from("coach_profiles")
        .select(
          "id, commission_tier, commission_rate, position_code, commission_cap, commission_bonus_notes, hours_minimum, hours_target, review_due_at, last_reviewed_at, promotion_ready, kpi_summary, notes, google_calendar_email, calendar_sync_enabled"
        )
        .order("created_at", { ascending: true }),
      supabase.from("profiles").select("id, display_name, role, status").eq("role", "client").order("created_at", { ascending: true }),
      supabase.from("client_profiles").select("id, preferred_name, xp_points, gym_coins, primary_goal"),
      supabase
        .from("coach_client_assignments")
        .select("id, coach_id, client_id, status, assigned_at, ended_at")
        .order("assigned_at", { ascending: false }),
      supabase
        .from("client_packages")
        .select("id, client_id, package_name, sessions_purchased, sessions_remaining, status, order_id, created_at, activated_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("points_ledger")
        .select("id, client_id, points_type, delta, reason, requested_by, approved_by, approval_status, created_at")
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("notifications")
        .select("id, category, title, body, action_url, is_read, created_at")
        .order("created_at", { ascending: false })
        .limit(40),
      supabase
        .from("activation_codes")
        .select("id, role, code, recipient_email, recipient_name, assigned_coach_id, status, expires_at, used_at, created_at")
        .order("created_at", { ascending: false })
        .limit(60),
    ]);

    [
      coachesResponse,
      coachProfilesResponse,
      clientsResponse,
      clientProfilesResponse,
      assignmentsResponse,
      packagesResponse,
      rewardsResponse,
      notificationsResponse,
      activationCodesResponse,
    ].forEach(throwOnError);

    const coaches = coachesResponse.data || [];
    const clients = clientsResponse.data || [];
    const rewards = rewardsResponse.data || [];
    const plannerRewardEvents = await loadPlannerRewardEventsForLedgerEntries(supabase, rewards);

    return {
      access,
      coaches,
      coachProfiles: coachProfilesResponse.data || [],
      clients,
      clientProfiles: clientProfilesResponse.data || [],
      assignments: assignmentsResponse.data || [],
      clientPackages: packagesResponse.data || [],
      rewards,
      plannerRewardEvents,
      notifications: notificationsResponse.data || [],
      activationCodes: activationCodesResponse.data || [],
      actorProfiles: buildAdminActorProfiles(coaches, clients, access.user.id),
      currentMonthStart,
    };
  }

  if (pageKey === "leads") {
    if (isLeadsPrimary) {
      const [coachesResponse, leadsResponse] = await Promise.all([
        supabase.from("profiles").select("id, display_name, status").eq("role", "coach").order("created_at", { ascending: true }),
        supabase
          .from("leads")
          .select("id, full_name, email, phone, source, status, next_follow_up_at, owner_id, notes, converted_client_id, created_at")
          .order("created_at", { ascending: false })
          .limit(120),
      ]);

      [coachesResponse, leadsResponse].forEach(throwOnError);

      const coaches = coachesResponse.data || [];
      const leads = leadsResponse.data || [];
      const actorIds = uniqueValues(
        leads
          .flatMap((lead) => [lead.owner_id, lead.converted_client_id])
          .concat(access.user.id)
      );
      const actorProfilesResponse = actorIds.length
        ? await supabase.from("profiles").select("id, display_name, role").in("id", actorIds)
        : { data: [], error: null };

      throwOnError(actorProfilesResponse);

      return {
        access,
        coaches,
        leads,
        actorProfiles: actorProfilesResponse.data || [],
        leadActivities: [],
        notifications: [],
        leadWorkspaceDetailsLoaded: false,
        currentMonthStart,
      };
    }

    if (isLeadsSecondary) {
      const [leadActivitiesResponse, notificationsResponse] = await Promise.all([
        supabase
          .from("lead_activities")
          .select("id, lead_id, actor_id, activity_type, notes, created_at")
          .order("created_at", { ascending: false })
          .limit(80),
        supabase
          .from("notifications")
          .select("id, category, title, body, action_url, is_read, created_at")
          .order("created_at", { ascending: false })
          .limit(40),
      ]);

      [leadActivitiesResponse, notificationsResponse].forEach(throwOnError);

      const actorIds = uniqueValues(
        (leadActivitiesResponse.data || []).flatMap((activity) => [activity.actor_id]).concat(access.user.id)
      );
      const actorProfilesResponse = actorIds.length
        ? await supabase.from("profiles").select("id, display_name, role").in("id", actorIds)
        : { data: [], error: null };

      throwOnError(actorProfilesResponse);

      return {
        access,
        leadActivities: leadActivitiesResponse.data || [],
        notifications: notificationsResponse.data || [],
        actorProfiles: actorProfilesResponse.data || [],
        leadWorkspaceDetailsLoaded: true,
        currentMonthStart,
      };
    }

    const [coachesResponse, leadsResponse, leadActivitiesResponse] = await Promise.all([
      supabase.from("profiles").select("id, display_name, status").eq("role", "coach").order("created_at", { ascending: true }),
      supabase
        .from("leads")
        .select("id, full_name, email, phone, source, status, next_follow_up_at, owner_id, notes, converted_client_id, created_at")
        .order("created_at", { ascending: false })
        .limit(120),
      supabase
        .from("lead_activities")
        .select("id, lead_id, actor_id, activity_type, notes, created_at")
        .order("created_at", { ascending: false })
        .limit(80),
    ]);

    [coachesResponse, leadsResponse, leadActivitiesResponse].forEach(throwOnError);

    const coaches = coachesResponse.data || [];
    const leads = leadsResponse.data || [];
    const leadActivities = leadActivitiesResponse.data || [];
    const actorIds = uniqueValues(
      leads
        .flatMap((lead) => [lead.owner_id, lead.converted_client_id])
        .concat(leadActivities.flatMap((activity) => [activity.actor_id]))
        .concat(access.user.id)
    );
    const actorProfilesResponse = actorIds.length
      ? await supabase.from("profiles").select("id, display_name, role").in("id", actorIds)
      : { data: [], error: null };

    throwOnError(actorProfilesResponse);

    return {
      access,
      coaches,
      leads,
      leadActivities,
      actorProfiles: actorProfilesResponse.data || [],
      leadWorkspaceDetailsLoaded: true,
      currentMonthStart,
    };
  }

  if (pageKey === "financials") {
    if (isFinancialsPrimary) {
      const [homeSummary, coachesResponse, clientsResponse, ordersResponse, commissionsResponse] = await Promise.all([
        getAdminHomeSummary(supabase, access.user.id),
        supabase.from("profiles").select("id, display_name, status").eq("role", "coach").order("created_at", { ascending: true }),
        supabase.from("profiles").select("id, display_name, status").eq("role", "client").order("created_at", { ascending: true }),
        supabase
          .from("orders")
          .select(
            "id, client_id, order_type, total_amount_rm, tax_amount_rm, status, created_at, external_reference, invoice_number, invoice_storage_path, receipt_number, receipt_storage_path, refund_receipt_number, refund_receipt_storage_path"
          )
          .order("created_at", { ascending: false })
          .limit(60),
        supabase
          .from("commission_records")
          .select("id, coach_id, session_id, amount_rm, payout_month, payout_status, created_at")
          .order("created_at", { ascending: false })
          .limit(80),
      ]);

      [coachesResponse, clientsResponse, ordersResponse, commissionsResponse].forEach(throwOnError);

      const orderIds = (ordersResponse.data || []).map((order) => order.id).filter(Boolean);
      const paymentsResponse = orderIds.length
        ? await supabase.from("payments").select("order_id, status, fees_rm, payment_method").in("order_id", orderIds)
        : { data: [], error: null };

      throwOnError(paymentsResponse);

      return {
        access,
        homeSummary: homeSummary || null,
        coaches: coachesResponse.data || [],
        clients: clientsResponse.data || [],
        orders: ordersResponse.data || [],
        payments: paymentsResponse.data || [],
        commissions: commissionsResponse.data || [],
        clientPackages: [],
        sessions: [],
        orderItems: [],
        bookingRequests: [],
        leads: [],
        financialWorkspaceDetailsLoaded: false,
        currentMonthStart,
      };
    }

    if (isFinancialsSecondary) {
      const [
        clientsResponse,
        leadsResponse,
        packagesResponse,
        ordersResponse,
        sessionsResponse,
        bookingRequestsResponse,
      ] = await Promise.all([
        supabase.from("profiles").select("id, display_name, status").eq("role", "client").order("created_at", { ascending: true }),
        supabase
          .from("leads")
          .select("id, full_name, email, phone, source, status, next_follow_up_at, owner_id, notes, converted_client_id, created_at")
          .order("created_at", { ascending: false })
          .limit(120),
        supabase
          .from("client_packages")
          .select("id, client_id, package_name, sessions_purchased, sessions_remaining, status, order_id, created_at, activated_at")
          .order("created_at", { ascending: false }),
        supabase
          .from("orders")
          .select(
            "id, client_id, order_type, total_amount_rm, tax_amount_rm, status, created_at, external_reference, invoice_number, invoice_storage_path, receipt_number, receipt_storage_path, refund_receipt_number, refund_receipt_storage_path"
          )
          .order("created_at", { ascending: false })
          .limit(120),
        supabase
          .from("sessions")
          .select("id, client_package_id, coach_id, status, scheduled_start, scheduled_end, session_value_rm, completed_at")
          .order("created_at", { ascending: false })
          .limit(400),
        supabase
          .from("booking_requests")
          .select("id, client_id, client_package_id, status")
          .order("created_at", { ascending: false })
          .limit(120),
      ]);

      [
        clientsResponse,
        leadsResponse,
        packagesResponse,
        ordersResponse,
        sessionsResponse,
        bookingRequestsResponse,
      ].forEach(throwOnError);

      const orderIds = (ordersResponse.data || []).map((order) => order.id).filter(Boolean);
      const [paymentsResponse, orderItemsResponse] = await Promise.all([
        orderIds.length
          ? supabase.from("payments").select("order_id, status, fees_rm, payment_method").in("order_id", orderIds)
          : Promise.resolve({ data: [], error: null }),
        orderIds.length
          ? supabase
              .from("order_items")
              .select("order_id, package_id, package_code, name, quantity, total_amount_rm, metadata")
              .in("order_id", orderIds)
          : Promise.resolve({ data: [], error: null }),
      ]);

      [paymentsResponse, orderItemsResponse].forEach(throwOnError);

      return {
        access,
        clients: clientsResponse.data || [],
        leads: leadsResponse.data || [],
        clientPackages: packagesResponse.data || [],
        orders: ordersResponse.data || [],
        payments: paymentsResponse.data || [],
        orderItems: orderItemsResponse.data || [],
        sessions: sessionsResponse.data || [],
        bookingRequests: bookingRequestsResponse.data || [],
        financialWorkspaceDetailsLoaded: true,
        currentMonthStart,
      };
    }

    const [
      coachesResponse,
      clientsResponse,
      packagesResponse,
      ordersResponse,
      sessionsResponse,
      commissionsResponse,
      bookingRequestsResponse,
    ] = await Promise.all([
      supabase.from("profiles").select("id, display_name, status").eq("role", "coach").order("created_at", { ascending: true }),
      supabase.from("profiles").select("id, display_name, status").eq("role", "client").order("created_at", { ascending: true }),
      supabase
        .from("client_packages")
        .select("id, client_id, package_name, sessions_purchased, sessions_remaining, status, order_id, created_at, activated_at")
        .order("created_at", { ascending: false }),
        supabase
          .from("orders")
          .select(
            "id, client_id, order_type, total_amount_rm, tax_amount_rm, status, created_at, external_reference, invoice_number, invoice_storage_path, receipt_number, receipt_storage_path, refund_receipt_number, refund_receipt_storage_path"
          )
          .order("created_at", { ascending: false })
          .limit(120),
      supabase
        .from("sessions")
        .select("id, client_package_id, coach_id, status, scheduled_start, scheduled_end, session_value_rm, completed_at")
        .order("created_at", { ascending: false })
        .limit(400),
      supabase
        .from("commission_records")
        .select("id, coach_id, session_id, amount_rm, payout_month, payout_status, created_at")
        .order("created_at", { ascending: false })
        .limit(120),
      supabase
        .from("booking_requests")
        .select("id, client_id, client_package_id, status")
        .order("created_at", { ascending: false })
        .limit(120),
    ]);

    [
      coachesResponse,
      clientsResponse,
      packagesResponse,
      ordersResponse,
      sessionsResponse,
      commissionsResponse,
      bookingRequestsResponse,
    ].forEach(throwOnError);

    const orders = ordersResponse.data || [];
    const orderIds = orders.map((order) => order.id);
    const [paymentsResponse, orderItemsResponse] = await Promise.all([
      orderIds.length
        ? supabase.from("payments").select("order_id, status, fees_rm, payment_method").in("order_id", orderIds)
        : Promise.resolve({ data: [], error: null }),
      orderIds.length
        ? supabase
            .from("order_items")
            .select("order_id, package_id, package_code, name, quantity, total_amount_rm, metadata")
            .in("order_id", orderIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

    [paymentsResponse, orderItemsResponse].forEach(throwOnError);

    return {
      access,
      coaches: coachesResponse.data || [],
      clients: clientsResponse.data || [],
      clientPackages: packagesResponse.data || [],
      orders,
      sessions: sessionsResponse.data || [],
      payments: paymentsResponse.data || [],
      orderItems: orderItemsResponse.data || [],
      commissions: commissionsResponse.data || [],
      bookingRequests: bookingRequestsResponse.data || [],
      financialWorkspaceDetailsLoaded: true,
      currentMonthStart,
    };
  }

  if (pageKey === "settings") {
    const notificationsResponse = await supabase
      .from("notifications")
      .select("id, category, title, body, action_url, is_read, created_at")
      .order("created_at", { ascending: false })
      .limit(40);

    throwOnError(notificationsResponse);

    return {
      access,
      notifications: notificationsResponse.data || [],
      currentMonthStart,
    };
  }

  const [
    coachesResponse,
    coachProfilesResponse,
    clientsResponse,
    clientProfilesResponse,
    assignmentsResponse,
    packagesResponse,
    rewardsResponse,
    leadsResponse,
    leadActivitiesResponse,
    ordersResponse,
    sessionsResponse,
    commissionsResponse,
    bookingRequestsResponse,
    notificationsResponse,
  ] = await Promise.all([
    supabase.from("profiles").select("id, display_name, status").eq("role", "coach").order("created_at", { ascending: true }),
    supabase
      .from("coach_profiles")
      .select(
        "id, commission_tier, commission_rate, position_code, commission_cap, commission_bonus_notes, hours_minimum, hours_target, review_due_at, last_reviewed_at, promotion_ready, kpi_summary, notes, google_calendar_email, calendar_sync_enabled"
      )
      .order("created_at", { ascending: true }),
    isHomePrimary
      ? Promise.resolve({ data: [], error: null })
      : supabase.from("profiles").select("id, display_name, status").eq("role", "client").order("created_at", { ascending: true }),
    isHomePrimary
      ? Promise.resolve({ data: [], error: null })
      : supabase.from("client_profiles").select("id, preferred_name, xp_points, gym_coins, primary_goal"),
    supabase
      .from("coach_client_assignments")
      .select("id, coach_id, client_id, status, assigned_at, ended_at")
      .order("assigned_at", { ascending: false }),
    supabase
      .from("client_packages")
      .select("id, client_id, package_name, sessions_purchased, sessions_remaining, status, order_id, created_at, activated_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("points_ledger")
      .select("id, client_id, points_type, delta, reason, requested_by, approved_by, approval_status, created_at")
      .order("created_at", { ascending: false })
      .limit(isHomePrimary ? 24 : isAdminHome ? 40 : 50),
    supabase
      .from("leads")
      .select("id, full_name, email, phone, source, status, next_follow_up_at, owner_id, notes, converted_client_id, created_at")
      .order("created_at", { ascending: false })
      .limit(isHomePrimary ? 60 : isAdminHome ? 80 : 120),
    isHomePrimary
      ? Promise.resolve({ data: [], error: null })
      : supabase
          .from("lead_activities")
          .select("id, lead_id, actor_id, activity_type, notes, created_at")
          .order("created_at", { ascending: false })
          .limit(isAdminHome ? 60 : 80),
    supabase
      .from("orders")
      .select(
        "id, client_id, order_type, total_amount_rm, tax_amount_rm, status, created_at, external_reference, invoice_number, invoice_storage_path, receipt_number, receipt_storage_path, refund_receipt_number, refund_receipt_storage_path"
      )
      .order("created_at", { ascending: false })
      .limit(isHomePrimary ? 60 : isAdminHome ? 80 : 120),
    supabase
      .from("sessions")
      .select("id, client_package_id, coach_id, status, scheduled_start, scheduled_end, session_value_rm, completed_at")
      .order("created_at", { ascending: false })
      .limit(isHomePrimary ? 180 : isAdminHome ? 240 : 400),
    supabase
      .from("commission_records")
      .select("id, coach_id, session_id, amount_rm, payout_month, payout_status, created_at")
      .order("created_at", { ascending: false })
      .limit(isHomePrimary ? 60 : isAdminHome ? 80 : 120),
    supabase
      .from("booking_requests")
      .select("id, client_id, client_package_id, status")
      .order("created_at", { ascending: false })
      .limit(isHomePrimary ? 60 : isAdminHome ? 80 : 120),
    supabase
      .from("notifications")
      .select("id, category, title, body, action_url, is_read, created_at")
      .order("created_at", { ascending: false })
      .limit(40),
  ]);

  [
    coachesResponse,
    coachProfilesResponse,
    clientsResponse,
    clientProfilesResponse,
    assignmentsResponse,
    packagesResponse,
    rewardsResponse,
    leadsResponse,
    leadActivitiesResponse,
    ordersResponse,
    sessionsResponse,
    commissionsResponse,
    bookingRequestsResponse,
    notificationsResponse,
  ].forEach(throwOnError);

  const orders = ordersResponse.data || [];
  const sessions = sessionsResponse.data || [];
  const rewards = rewardsResponse.data || [];
  const plannerRewardEvents = isHomePrimary
    ? []
    : await loadPlannerRewardEventsForLedgerEntries(supabase, rewards);
  const orderIds = orders.map((order) => order.id);
  const actorIds = uniqueValues(
    rewards
      .flatMap((reward) => [reward.client_id, reward.requested_by])
      .concat((leadsResponse.data || []).flatMap((lead) => [lead.owner_id, lead.converted_client_id]))
      .concat((leadActivitiesResponse.data || []).flatMap((activity) => [activity.actor_id]))
      .concat(access.user.id)
  );

  const [paymentsResponse, orderItemsResponse, actorProfilesResponse] = await Promise.all([
    orderIds.length
      ? supabase.from("payments").select("order_id, status, fees_rm, payment_method").in("order_id", orderIds)
      : Promise.resolve({ data: [], error: null }),
    !isHomePrimary && orderIds.length
      ? supabase
          .from("order_items")
          .select("order_id, package_id, package_code, name, quantity, total_amount_rm, metadata")
          .in("order_id", orderIds)
      : Promise.resolve({ data: [], error: null }),
    !isHomePrimary && actorIds.length
      ? supabase.from("profiles").select("id, display_name, role").in("id", actorIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  [paymentsResponse, orderItemsResponse, actorProfilesResponse].forEach(throwOnError);

  return {
    access,
    coaches: coachesResponse.data || [],
    coachProfiles: coachProfilesResponse.data || [],
    clients: clientsResponse.data || [],
    clientProfiles: clientProfilesResponse.data || [],
    assignments: assignmentsResponse.data || [],
    clientPackages: packagesResponse.data || [],
    rewards,
    plannerRewardEvents,
    leads: leadsResponse.data || [],
    leadActivities: leadActivitiesResponse.data || [],
    notifications: notificationsResponse.data || [],
    orders,
    sessions,
    payments: paymentsResponse.data || [],
    orderItems: orderItemsResponse.data || [],
    commissions: commissionsResponse.data || [],
    bookingRequests: bookingRequestsResponse.data || [],
    actorProfiles: actorProfilesResponse.data || [],
    currentMonthStart,
  };
}

async function getDashboardPayload(supabase, auth, scope, pageKey, options = {}) {
  if (!auth?.profile?.id) {
    throw createHttpError(401, "A valid authenticated account is required.");
  }

  if (auth.profile.status !== "active") {
    throw createHttpError(403, "This account is not active.");
  }

  if (scope === "client") {
    if (auth.profile.role !== "client") {
      throw createHttpError(403, "Client access is required for this dashboard.");
    }
    return getClientDashboardPayload(supabase, auth, pageKey, options);
  }

  if (scope === "coach") {
    if (auth.profile.role !== "coach") {
      throw createHttpError(403, "Coach access is required for this dashboard.");
    }
    return getCoachDashboardPayload(supabase, auth, pageKey, options);
  }

  if (scope === "admin") {
    if (auth.profile.role !== "super_admin") {
      throw createHttpError(403, "Super admin access is required for this dashboard.");
    }
    return getAdminDashboardPayload(supabase, auth, pageKey, options);
  }

  throw createHttpError(400, "Dashboard scope must be client, coach, or admin.");
}

module.exports = {
  createHttpError,
  getDashboardPayload,
};
