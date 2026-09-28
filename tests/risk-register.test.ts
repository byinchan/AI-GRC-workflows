import assert from "node:assert/strict";
import test from "node:test";
import { appendRiskRecord, canAddToRegister, cleanTreatmentPlan, createRiskRegisterRecord, createRiskStatement, findPotentialDuplicate, findRegistrationDuplicate, findStakeholderSourceDuplicate, nextRiskId, normalizeRiskText, suggestedTargetDate } from "../lib/grc/risk-register.ts";

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

const vendorSource = {
  assessmentSubject: "Third-party cloud outage notification platform",
  businessPurpose: "Sends customer outage notifications.",
  businessOwner: "Customer Operations",
  identifiedConcern: "Recent vendor outages delayed customer notifications.",
  possibleOutcome: "Customer notifications may be delayed.",
  affectedAreas: "Customer communications",
  existingSafeguards: "Vendor monitoring",
  additionalContext: "Limited disaster recovery visibility.",
};

test("flags an identical stakeholder source despite different AI-generated risk wording", () => {
  const original = createRiskRegisterRecord(reviewed, []);
  const records = [original];
  const submissions = [{ source: vendorSource, status: "Registered" as const, riskRecordId: original.id }];
  const differentlyWordedReview = {
    ...reviewed,
    threat: "A third-party service interruption prevents timely notifications",
    vulnerability: "Vendor resilience evidence has not been validated",
    businessImpact: "Customers could receive delayed operational communications",
  };
  assert.equal(findPotentialDuplicate(differentlyWordedReview, records), undefined);
  assert.equal(findRegistrationDuplicate(vendorSource, differentlyWordedReview, submissions, records)?.id, "RISK-001");
});

test("retains registered source traceability independently of treatment details", () => {
  const original = createRiskRegisterRecord(reviewed, []);
  original.treatmentStrategy = "Accept";
  original.treatmentPlan = "No immediate work planned";
  original.riskOwner = "Different owner";
  original.status = "Closed";
  const submissions = [{ source: vendorSource, status: "Registered" as const, riskRecordId: original.id }];
  assert.equal(findStakeholderSourceDuplicate(vendorSource, submissions, [original])?.id, "RISK-001");
  assert.equal(findStakeholderSourceDuplicate({ ...vendorSource, identifiedConcern: "A different concern" }, submissions, [original]), undefined);
});

test("selects a source duplicate before registration while preserving the deliberate override path", () => {
  const original = createRiskRegisterRecord(reviewed, []);
  const submissions = [{ source: vendorSource, status: "Registered" as const, riskRecordId: original.id }];
  assert.equal(findRegistrationDuplicate(vendorSource, reviewed, submissions, [original])?.id, "RISK-001");
  const deliberatelyAdded = appendRiskRecord([original], createRiskRegisterRecord(reviewed, [original]));
  assert.deepEqual(deliberatelyAdded.map((record) => record.id), ["RISK-001", "RISK-002"]);
});

function portfolioSummaryForTest(records: ReturnType<typeof createRiskRegisterRecord>[]) { return { Total: records.length }; }
