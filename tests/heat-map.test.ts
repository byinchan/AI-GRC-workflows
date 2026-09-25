import assert from "node:assert/strict";
import test from "node:test";
import { heatMapExportModel, matrixCell, portfolioSummary, risksForCell } from "../lib/grc/heat-map.ts";
import type { RiskRegisterRecord } from "../lib/grc/risk-register.ts";

const records: RiskRegisterRecord[] = [
  { id: "RISK-001", asset: "A", businessOwner: "Owner", riskStatement: "Statement", threat: "Threat", vulnerability: "Vulnerability", businessImpact: "Impact", existingControls: "Controls", likelihood: 2, impact: 3, riskScore: 6, riskRating: "High", treatmentStrategy: "Mitigate", treatmentPlan: "Plan", riskOwner: "Owner", targetDate: "2026-10-01", status: "Open", rationale: "Rationale" },
  { id: "RISK-002", asset: "B", businessOwner: "Owner", riskStatement: "Statement", threat: "Threat", vulnerability: "Vulnerability", businessImpact: "Impact", existingControls: "Controls", likelihood: 2, impact: 3, riskScore: 6, riskRating: "High", treatmentStrategy: "Accept", treatmentPlan: "", riskOwner: "Owner", targetDate: "2026-10-01", status: "Accepted", rationale: "Rationale" },
  { id: "RISK-003", asset: "C", businessOwner: "Owner", riskStatement: "Statement", threat: "Threat", vulnerability: "Vulnerability", businessImpact: "Impact", existingControls: "Controls", likelihood: 1, impact: 1, riskScore: 1, riskRating: "Low", treatmentStrategy: "Mitigate", treatmentPlan: "Plan", riskOwner: "Owner", targetDate: "2026-10-01", status: "Open", rationale: "Rationale" },
];

test("uses the deterministic methodology for heat map cells", () => {
  assert.deepEqual(matrixCell(3, 3), { score: 9, rating: "Critical" });
  assert.deepEqual(matrixCell(1, 3), { score: 3, rating: "Medium" });
});

test("groups only matching final register values into a matrix cell", () => {
  assert.deepEqual(risksForCell(records, 2, 3).map((record) => record.id), ["RISK-001", "RISK-002"]);
  assert.deepEqual(risksForCell(records, 3, 3), []);
});

test("summarizes the session portfolio deterministically", () => {
  assert.deepEqual(portfolioSummary(records), { Total: 3, Critical: 0, High: 2, Medium: 0, Low: 1 });
});

test("prepares the same portfolio data for PNG export", () => {
  const model = heatMapExportModel(records);
  assert.deepEqual(model.summary, { Total: 3, Critical: 0, High: 2, Medium: 0, Low: 1 });
  assert.deepEqual(model.cells.find((cell) => cell.likelihood === 2 && cell.impact === 3)?.risks, ["RISK-001", "RISK-002"]);
});
