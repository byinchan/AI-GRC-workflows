import assert from "node:assert/strict";
import test from "node:test";
import { appendRiskRecord, canAddToRegister, cleanTreatmentPlan, createRiskRegisterRecord, createRiskStatement, findPotentialDuplicate, nextRiskId, normalizeRiskText, suggestedTargetDate } from "../lib/grc/risk-register.ts";

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

test("creates a readable risk statement without duplicate punctuation", () => {
  assert.equal(
    createRiskStatement("Vendor outage.", "Limited disaster recovery visibility,", "Customer notifications may be delayed."),
    "If vendor outage occurs because of limited disaster recovery visibility, customer notifications may be delayed.",
  );
});

test("removes markdown presentation characters from treatment plans", () => {
  assert.equal(cleanTreatmentPlan("### Plan\n**1.** Review controls\n---\n- Confirm evidence"), "Plan\n1. Review controls\nConfirm evidence");
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

test("appends independent sequential risk records without removing the portfolio", () => {
  const first = createRiskRegisterRecord(reviewed, []);
  const second = createRiskRegisterRecord({ ...reviewed, asset: "Network service", likelihood: 3, impact: 3 }, [first]);
  const third = createRiskRegisterRecord({ ...reviewed, asset: "AI service", likelihood: 1, impact: 3 }, [first, second]);
  const portfolio = appendRiskRecord(appendRiskRecord(appendRiskRecord([], first), second), third);
  assert.deepEqual(portfolio.map((record) => record.id), ["RISK-001", "RISK-002", "RISK-003"]);
  assert.deepEqual(portfolio.map((record) => record.asset), ["Payments service", "Network service", "AI service"]);
  assert.equal(appendRiskRecord(portfolio, second).length, 3);
});

test("flags an obvious normalized potential duplicate before it is registered", () => {
  const original = createRiskRegisterRecord(reviewed, []);
  const duplicate = { ...reviewed, asset: "  PAYMENTS service! ", threat: "unauthorized   access.", vulnerability: "Weak access reviews", businessImpact: "Payment data could be exposed" };
  assert.equal(normalizeRiskText(duplicate.asset), "payments service");
  assert.equal(findPotentialDuplicate(duplicate, [original])?.id, "RISK-001");
  assert.equal(findPotentialDuplicate({ ...duplicate, asset: "Network service", threat: "Network outage" }, [original]), undefined);
  assert.equal(portfolioSummaryForTest([original]).Total, 1);
});

test("does not let treatment or risk statement wording suppress a material duplicate", () => {
  const original = createRiskRegisterRecord(reviewed, []);
  const changed = { ...reviewed, threat: "Unauthorized access to payment information", businessImpact: "Payment information could be exposed to unauthorized parties" };
  assert.equal(findPotentialDuplicate(changed, [{ ...original, treatmentStrategy: "Accept", riskStatement: "Different wording" }])?.id, "RISK-001");
});

function portfolioSummaryForTest(records: ReturnType<typeof createRiskRegisterRecord>[]) { return { Total: records.length }; }
