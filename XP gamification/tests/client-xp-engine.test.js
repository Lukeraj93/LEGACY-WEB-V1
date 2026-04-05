const test = require("node:test");
const assert = require("node:assert/strict");

const {
  readClientXpBundle,
  buildActionRows,
  buildBossActionIds,
  computeWeeklySummary,
  computeMonthlySummary,
  computeLedger,
  normalizeSettings,
} = require("../Config/client-xp-engine.js");

function getAction(actionId) {
  const action = buildActionRows(readClientXpBundle()).find((item) => item.action_id === actionId);
  assert.ok(action, `Expected action ${actionId} to exist in the bundle.`);
  return action;
}

test("verified TRN-SESS contributes XP and updates level", () => {
  const action = getAction("TRN-SESS");
  const ledger = computeLedger({
    members: [{ member_id: "LGC001", name: "Client One", mode: "Quest", status: "Active" }],
    actions: [action],
    events: [{
      event_date: "2026-03-23",
      member_id: "LGC001",
      action_id: "TRN-SESS",
      qty: 1,
      verified: true,
    }],
    redemptions: [],
  });

  assert.equal(ledger[0].total_xp, action.xp);
  assert.equal(ledger[0].level, Math.min(100, Math.floor(Math.sqrt(action.xp))));
});

test("routine weekly cap applies at 300 XP", () => {
  const settings = normalizeSettings(readClientXpBundle().contents.rulesEngine.settings);
  const action = getAction("TRN-SESS");
  const qtyNeeded = Math.max(2, Math.ceil((settings.routineWeeklyCapXP + action.xp) / Math.max(action.xp, 1)));
  const weekly = computeWeeklySummary([{
    event_date: "2026-03-23",
    member_id: "LGC001",
    action_id: "TRN-SESS",
    qty: qtyNeeded,
    verified: true,
  }], [action], settings);

  assert.equal(weekly[0].routine_xp_counted, settings.routineWeeklyCapXP);
  assert.ok(weekly[0].overcap_routine_xp > 0);
});

test("monthly coin cap applies at 70 coins", () => {
  const settings = normalizeSettings(readClientXpBundle().contents.rulesEngine.settings);
  const action = getAction("TRN-SESS");
  const qtyNeeded = Math.max(2, Math.ceil((settings.monthlyCoinCap + action.coins) / Math.max(action.coins, 1)));
  const monthly = computeMonthlySummary([{
    event_date: "2026-03-23",
    member_id: "LGC001",
    action_id: "TRN-SESS",
    qty: qtyNeeded,
    verified: true,
  }], [action], settings);

  assert.equal(monthly[0].coins_counted_month, settings.monthlyCoinCap);
  assert.ok(monthly[0].overcap_coins > 0);
});

test("boss actions are identifiable for duplicate-prevention use", () => {
  const bossActionIds = buildBossActionIds(readClientXpBundle());
  assert.ok(bossActionIds.includes("BOSS-CLR-10"));
  assert.ok(bossActionIds.includes("BOSS-CLR-100"));
});

test("unverified events contribute zero XP and zero coins", () => {
  const action = getAction("TRN-SESS");
  const ledger = computeLedger({
    members: [{ member_id: "LGC001", name: "Client One", mode: "Quest", status: "Active" }],
    actions: [action],
    events: [{
      event_date: "2026-03-23",
      member_id: "LGC001",
      action_id: "TRN-SESS",
      qty: 10,
      verified: false,
    }],
    redemptions: [],
  });

  assert.equal(ledger[0].total_xp, 0);
  assert.equal(ledger[0].coins_earned_counted, 0);
  assert.equal(ledger[0].coin_balance, 0);
});
