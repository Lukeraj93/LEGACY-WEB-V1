const test = require("node:test");
const assert = require("node:assert/strict");

const {
  computeCoachLedger,
  computeTrialResult,
  determineRole,
} = require("../Config/coach-xp-engine.js");

const roleTitles = [
  { role_id: "T1", min_xp: 0, max_xp: 499, operational_title: "Apprentice Coach", greek_title: "Apprentice", aesir_title: "First Breath" },
  { role_id: "T2", min_xp: 500, max_xp: 1499, operational_title: "Coach", greek_title: "Pathfinder", aesir_title: "Steady" },
  { role_id: "T3", min_xp: 1500, max_xp: 2999, operational_title: "Performance Coach", greek_title: "Champion", aesir_title: "Shieldmaiden" },
];

test("coaching weekly cap stops counted XP at the weekly maximum", () => {
  const ledger = computeCoachLedger({
    coaches: [{ coach_id: "COA001", coach_name: "Coach One" }],
    roleTitles,
    actions: [{ action_id: "COA-SESS", action_name: "Session", bucket: "Coaching", xp_per: 50, cap_period: "Weekly" }],
    events: [
      { coach_id: "COA001", action_id: "COA-SESS", event_date: "2026-03-02", qty: 1, verified: true },
      { coach_id: "COA001", action_id: "COA-SESS", event_date: "2026-03-03", qty: 1, verified: true },
      { coach_id: "COA001", action_id: "COA-SESS", event_date: "2026-03-04", qty: 1, verified: true },
    ],
  });

  assert.equal(ledger[0].coaching_weekly_counted_xp, 120);
  assert.equal(ledger[0].total_xp_counted, 120);
});

test("monthly education cap stops counted XP at the monthly maximum", () => {
  const ledger = computeCoachLedger({
    coaches: [{ coach_id: "COA002", coach_name: "Coach Two" }],
    roleTitles,
    actions: [{ action_id: "EDU-MOD", action_name: "Module", bucket: "Education", xp_per: 80, cap_period: "Monthly" }],
    events: [
      { coach_id: "COA002", action_id: "EDU-MOD", event_date: "2026-03-01", qty: 1, verified: true },
      { coach_id: "COA002", action_id: "EDU-MOD", event_date: "2026-03-10", qty: 1, verified: true },
    ],
  });

  assert.equal(ledger[0].education_monthly_counted_xp, 150);
  assert.equal(ledger[0].total_xp_counted, 150);
});

test("quarterly impact cap applies across impact and competition bucket group", () => {
  const ledger = computeCoachLedger({
    coaches: [{ coach_id: "COA003", coach_name: "Coach Three" }],
    roleTitles,
    actions: [
      { action_id: "IMP-RETQ", action_name: "Impact", bucket: "Impact", xp_per: 180, cap_period: "Quarterly" },
      { action_id: "COMP-GOLD", action_name: "Competition", bucket: "Competition", xp_per: 180, cap_period: "Quarterly" },
    ],
    events: [
      { coach_id: "COA003", action_id: "IMP-RETQ", event_date: "2026-01-15", qty: 1, verified: true },
      { coach_id: "COA003", action_id: "COMP-GOLD", event_date: "2026-02-15", qty: 1, verified: true },
    ],
  });

  assert.equal(ledger[0].impact_quarterly_counted_xp, 300);
  assert.equal(ledger[0].total_xp_counted, 300);
});

test("approved seeding uses xp_override as uncapped counted XP", () => {
  const ledger = computeCoachLedger({
    coaches: [{ coach_id: "COA004", coach_name: "Coach Four" }],
    roleTitles,
    actions: [{ action_id: "SEED-INIT", action_name: "Seed", bucket: "Seeding", xp_per: 0, cap_period: "None" }],
    events: [{ coach_id: "COA004", action_id: "SEED-INIT", event_date: "2026-03-01", qty: 1, verified: true, xp_override: 1700 }],
  });

  assert.equal(ledger[0].uncapped_seeding_xp, 1700);
  assert.equal(ledger[0].total_xp_counted, 1700);
  assert.equal(ledger[0].current_role_id, "T3");
});

test("role lock keeps a coach on the locked title even when derived XP is higher", () => {
  const role = determineRole(1700, roleTitles, "T2");
  assert.equal(role.derived_role_id, "T3");
  assert.equal(role.current_role_id, "T2");
});

test("trial promote requires all three gates to pass", () => {
  assert.equal(
    computeTrialResult({
      skill_trial: "Pass",
      knowledge_trial: "Pass",
      portfolio: "Pass",
    }),
    "PROMOTE"
  );

  assert.equal(
    computeTrialResult({
      skill_trial: "Pass",
      knowledge_trial: "Pending",
      portfolio: "Pass",
    }),
    "NOT_YET"
  );
});
