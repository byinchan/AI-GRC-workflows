import assert from "node:assert/strict";
import test from "node:test";
import { createWorkflowSessionSnapshot, parseWorkflowSessionSnapshot } from "../lib/grc/session-state.ts";
import type { RiskRegisterRecord } from "../lib/grc/risk-register.ts";

const record: RiskRegisterRecord = {
  id: "RISK-001",
  asset: "Customer notifications",
  businessOwner: "Customer Operations",
  riskStatement: "A vendor outage could delay customer notifications.",
  threat: "Third-party outage",
  vulnerability: "Limited resilience visibility",
  businessImpact: "Customer communications may be delayed",
  existingControls: "Vendor monitoring",
  likelihood: 2,
  impact: 3,
  riskScore: 6,
  riskRating: "High",
  treatmentStrategy: "Mitigate",
  treatmentPlan: "Validate disaster recovery evidence.",
  riskOwner: "Customer Operations",
  targetDate: "2026-10-30",
  status: "Open",
  rationale: "Analyst-confirmed assessment.",
};

const submission = {
  id: "submission-1",
  source: { assessmentSubject: "Customer notifications", identifiedConcern: "Vendor outage" },
  status: "Registered" as const,
  riskRecordId: "RISK-001",
};

function parse(value: unknown) {
  return parseWorkflowSessionSnapshot(JSON.stringify(value));
}

test("accepts a valid versioned workflow snapshot", () => {
  const snapshot = createWorkflowSessionSnapshot([submission], [record]);
  assert.deepEqual(parse(JSON.parse(JSON.stringify(snapshot))), snapshot);
});

test("accepts a valid empty workflow snapshot", () => {
  assert.deepEqual(parse({ version: 1, stakeholderSubmissions: [], records: [] }), {
    version: 1,
    stakeholderSubmissions: [],
    records: [],
  });
});

test("rejects malformed JSON", () => {
  assert.equal(parseWorkflowSessionSnapshot("{"), undefined);
});

test("rejects an unsupported snapshot version and invalid top-level shape", () => {
  assert.equal(parse({ version: 2, stakeholderSubmissions: [], records: [] }), undefined);
  assert.equal(parse({ version: 1, stakeholderSubmissions: {} }), undefined);
});

test("rejects an invalid stakeholder submission", () => {
  assert.equal(parse({ version: 1, stakeholderSubmissions: [{ ...submission, source: { assessmentSubject: 12 } }], records: [record] }), undefined);
  assert.equal(parse({ version: 1, stakeholderSubmissions: [{ ...submission, status: "Awaiting Review" }], records: [record] }), undefined);
});

test("rejects an invalid registered risk", () => {
  assert.equal(parse({ version: 1, stakeholderSubmissions: [submission], records: [{ ...record, riskRating: "Severe" }] }), undefined);
  assert.equal(parse({ version: 1, stakeholderSubmissions: [submission], records: [{ ...record, riskScore: 9 }] }), undefined);
});

test("preserves registered submission-to-risk traceability", () => {
  const snapshot = parse({ version: 1, stakeholderSubmissions: [submission], records: [record] });
  assert.equal(snapshot?.stakeholderSubmissions[0].riskRecordId, "RISK-001");
  assert.equal(snapshot?.records[0].id, "RISK-001");
  assert.equal(parse({ version: 1, stakeholderSubmissions: [{ ...submission, riskRecordId: "RISK-999" }], records: [record] }), undefined);
});
