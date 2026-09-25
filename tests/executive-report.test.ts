import assert from "node:assert/strict";
import test from "node:test";
import { cleanExecutiveNarrative, executiveReportModel, orderForManagementAttention, reportDate } from "../lib/grc/executive-report.ts";
import type { RiskRegisterRecord } from "../lib/grc/risk-register.ts";

const risks: RiskRegisterRecord[] = [
  { id: "RISK-002", asset: "Medium service", businessOwner: "Ops", riskStatement: "Medium statement", threat: "Threat", vulnerability: "Vulnerability", businessImpact: "Impact", existingControls: "Controls", likelihood: 2, impact: 2, riskScore: 4, riskRating: "Medium", treatmentStrategy: "Mitigate", treatmentPlan: "Plan", riskOwner: "Ops", targetDate: "2026-10-01", status: "Open", rationale: "Rationale" },
  { id: "RISK-001", asset: "High service", businessOwner: "Ops", riskStatement: "High statement", threat: "Threat", vulnerability: "Vulnerability", businessImpact: "Impact", existingControls: "Controls", likelihood: 2, impact: 3, riskScore: 6, riskRating: "High", treatmentStrategy: "Mitigate", treatmentPlan: "Plan", riskOwner: "Ops", targetDate: "2026-09-30", status: "In Progress", rationale: "Rationale" },
];
test("orders management attention by deterministic severity, score, and ID", () => assert.deepEqual(orderForManagementAttention(risks).map((risk) => risk.id), ["RISK-001", "RISK-002"]));
test("builds a report only from registered risk values", () => { const model = executiveReportModel(risks, new Date("2026-09-25T12:00:00Z")); assert.equal(model.summary.Total, 2); assert.equal(model.reportDate, "2026-09-25"); assert.equal(model.narrativeRisks[0].riskStatement, "Medium statement"); assert.deepEqual(model.heatMap.cells.find((cell) => cell.likelihood === 2 && cell.impact === 3)?.risks, ["RISK-001"]); });
test("formats report dates and removes raw presentation markup", () => { assert.equal(reportDate(new Date("2026-01-02T12:00:00Z")), "2026-01-02"); assert.equal(cleanExecutiveNarrative("### Summary\n**Approved**\n---"), "Summary\nApproved"); });
