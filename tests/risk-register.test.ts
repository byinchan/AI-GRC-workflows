import assert from "node:assert/strict";
import test from "node:test";
import { canAddToRegister, createRiskRegisterRecord, nextRiskId, suggestedTargetDate } from "../lib/grc/risk-register.ts";

const reviewed = { asset: "Payments service", businessOwner: "Finance", threat: "Unauthorized access", vulnerability: "Weak access reviews", businessImpact: "Payment data could be exposed", existingControls: "Quarterly reviews", likelihood: 2 as const, impact: 3 as const, rationale: "Analyst reviewed evidence." };

test("creates deterministic sequential risk IDs", () => {
  assert.equal(nextRiskId([]), "RISK-001");
  assert.equal(nextRiskId([{ id: "RISK-001" }]), "RISK-002");
});

test("uses deterministic rating treatment windows", () => {
  const date = new Date("2026-09-25T12:00:00Z");
  assert.equal(suggestedTargetDate("Critical", date), "2026-10-09");
  assert.equal(suggestedTargetDate("High", date), "2026-10-25");
  assert.equal(suggestedTargetDate("Medium", date), "2026-11-24");
  assert.equal(suggestedTargetDate("Low", date), "2026-12-24");
});

test("requires a treatment plan only for mitigation", () => {
  assert.equal(canAddToRegister("Mitigate", ""), false);
  assert.equal(canAddToRegister("Mitigate", "Review access controls"), true);
  assert.equal(canAddToRegister("Accept", ""), true);
});

test("carries analyst-reviewed values and deterministic result into a register record", () => {
  const record = createRiskRegisterRecord(reviewed, []);
  assert.equal(record.asset, "Payments service");
  assert.equal(record.threat, "Unauthorized access");
  assert.equal(record.likelihood, 2);
  assert.equal(record.impact, 3);
  assert.equal(record.riskScore, 6);
  assert.equal(record.riskRating, "High");
});
