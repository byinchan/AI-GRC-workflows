import { calculateRisk } from "./risk.ts";
import type { RiskLevel, RiskRating } from "./risk.ts";

export const treatmentStrategies = ["Mitigate", "Accept", "Avoid", "Transfer"] as const;
export const riskStatuses = ["Open", "Treatment Planned", "In Progress", "Accepted", "Closed"] as const;
export type RiskRegisterRecord = { id: string; asset: string; businessOwner: string; riskStatement: string; threat: string; vulnerability: string; businessImpact: string; existingControls: string; likelihood: RiskLevel; impact: RiskLevel; riskScore: number; riskRating: RiskRating; treatmentStrategy: typeof treatmentStrategies[number]; treatmentPlan: string; riskOwner: string; targetDate: string; status: typeof riskStatuses[number]; rationale: string; sourceSubmissionId?: string; missingInformation?: string[]; assumptions?: string[]; uncertainties?: string[] };
export type ReviewedAssessment = Omit<RiskRegisterRecord, "id" | "riskScore" | "riskRating" | "treatmentStrategy" | "treatmentPlan" | "riskOwner" | "targetDate" | "status" | "riskStatement">;

const treatmentDays: Record<RiskRating, number> = { Critical: 14, High: 30, Medium: 60, Low: 90 };

export function nextRiskId(records: Pick<RiskRegisterRecord, "id">[]) { return `RISK-${String(records.length + 1).padStart(3, "0")}`; }
export function appendRiskRecord(records: RiskRegisterRecord[], record: RiskRegisterRecord) { return records.some(({ id }) => id === record.id) ? records : [...records, record]; }
export function normalizeRiskText(value: string) { return value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim(); }
function stronglyMatchesRiskContext(left: string, right: string) { const a = normalizeRiskText(left), b = normalizeRiskText(right); if (a === b) return true; const aWords = new Set(a.split(" ").filter((word) => word.length > 2)), bWords = new Set(b.split(" ").filter((word) => word.length > 2)); const overlap = [...aWords].filter((word) => bWords.has(word)).length; return overlap >= 2 && overlap / Math.min(aWords.size || 1, bWords.size || 1) >= 0.6; }
export function findPotentialDuplicate(assessment: Pick<ReviewedAssessment, "asset" | "businessOwner" | "threat" | "vulnerability" | "businessImpact">, records: RiskRegisterRecord[]) {
  const fields = ["asset", "businessOwner", "threat", "vulnerability", "businessImpact"] as const;
  return records.find((record) => normalizeRiskText(record.asset) === normalizeRiskText(assessment.asset) && fields.slice(1).filter((field) => stronglyMatchesRiskContext(record[field], assessment[field])).length >= 2);
}
function sentenceFragment(value: string) {
  const trimmed = value.trim().replace(/[.,;:!?\s]+$/, "");
  return trimmed ? trimmed.charAt(0).toLowerCase() + trimmed.slice(1) : "";
}

export function createRiskStatement(threat: string, vulnerability: string, consequence: string) {
  if (![threat, vulnerability, consequence].every((value) => value.trim())) return "Complete the threat, vulnerability, and business consequence to form a risk statement.";
  return `If ${sentenceFragment(threat)} occurs because of ${sentenceFragment(vulnerability)}, ${sentenceFragment(consequence)}.`;
}

export function cleanTreatmentPlan(value: string) {
  return value
    .replace(/#{1,6}/g, "")
    .replace(/\*\*/g, "")
    .replace(/---+/g, "")
    .replace(/^\s*[-*]\s+/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
export function suggestedTargetDate(rating: RiskRating, completedOn = new Date()) { const date = new Date(completedOn); date.setDate(date.getDate() + treatmentDays[rating]); return date.toISOString().slice(0, 10); }
export function canAddToRegister(strategy: RiskRegisterRecord["treatmentStrategy"], plan: string) { return strategy !== "Mitigate" || Boolean(plan.trim()); }
export function createRiskRegisterRecord(assessment: ReviewedAssessment, existing: Pick<RiskRegisterRecord, "id">[]): RiskRegisterRecord { const { score: riskScore, rating: riskRating } = calculateRisk(assessment.likelihood, assessment.impact); return { ...assessment, id: nextRiskId(existing), riskScore, riskRating, riskStatement: createRiskStatement(assessment.threat, assessment.vulnerability, assessment.businessImpact), treatmentStrategy: "Mitigate", treatmentPlan: "", riskOwner: assessment.businessOwner, targetDate: suggestedTargetDate(riskRating), status: "Open" }; }
