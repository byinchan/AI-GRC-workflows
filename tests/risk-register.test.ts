import assert from "node:assert/strict";
import test from "node:test";
import { createRiskRegisterRecord, nextRiskId } from "../lib/grc/risk-register.ts";

const reviewed = { asset: "Payments service", businessOwner: "Finance", threat: "Unauthorized access", vulnerability: "Weak access reviews", businessImpact: "Payment data could be exposed", existingControls: "Quarterly reviews", likelihood: 2 as const, impact: 3 as const, rationale: "Analyst reviewed evidence." };

test("creates deterministic sequential risk IDs", () => {
  assert.equal(nextRiskId([]), "RISK-001");
  assert.equal(nextRiskId([{ id: "RISK-001" }]), "RISK-002");
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
