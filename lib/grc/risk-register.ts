import { calculateRisk } from "./risk.ts";
import type { RiskLevel, RiskRating } from "./risk.ts";

export const treatmentStrategies = ["Mitigate", "Accept", "Avoid", "Transfer"] as const;
export const riskStatuses = ["Open", "Treatment Planned", "In Progress", "Accepted", "Closed"] as const;
export type RiskRegisterRecord = { id: string; asset: string; businessOwner: string; riskStatement: string; threat: string; vulnerability: string; businessImpact: string; existingControls: string; likelihood: RiskLevel; impact: RiskLevel; riskScore: number; riskRating: RiskRating; treatmentStrategy: typeof treatmentStrategies[number]; treatmentPlan: string; riskOwner: string; targetDate: string; status: typeof riskStatuses[number]; rationale: string };
export type ReviewedAssessment = Omit<RiskRegisterRecord, "id" | "riskScore" | "riskRating" | "treatmentStrategy" | "treatmentPlan" | "riskOwner" | "targetDate" | "status" | "riskStatement">;

export function nextRiskId(records: Pick<RiskRegisterRecord, "id">[]) { return `RISK-${String(records.length + 1).padStart(3, "0")}`; }
export function createRiskStatement(threat: string, vulnerability: string, consequence: string) { return [threat, vulnerability, consequence].every((value) => value.trim()) ? `If ${threat.trim()}, due to ${vulnerability.trim()}, then ${consequence.trim()}.` : "Complete the threat, vulnerability, and business consequence to form a risk statement."; }
export function createRiskRegisterRecord(assessment: ReviewedAssessment, existing: Pick<RiskRegisterRecord, "id">[]): RiskRegisterRecord { const { score: riskScore, rating: riskRating } = calculateRisk(assessment.likelihood, assessment.impact); return { ...assessment, id: nextRiskId(existing), riskScore, riskRating, riskStatement: createRiskStatement(assessment.threat, assessment.vulnerability, assessment.businessImpact), treatmentStrategy: "Mitigate", treatmentPlan: "", riskOwner: assessment.businessOwner, targetDate: "", status: "Open" }; }
