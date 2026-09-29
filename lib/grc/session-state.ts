import { calculateRisk, type RiskLevel, type RiskRating } from "./risk.ts";
import {
  riskStatuses,
  treatmentStrategies,
  type RiskRegisterRecord,
} from "./risk-register.ts";

export const workflowSessionStorageKey = "ai-grc-workflows:session-state:v1";
const workflowSessionVersion = 1;

export type StoredStakeholderSubmission = {
  id: string;
  source: Record<string, string>;
  status: "Awaiting Review" | "Registered";
  riskRecordId?: string;
};

export type WorkflowSessionSnapshot = {
  version: typeof workflowSessionVersion;
  stakeholderSubmissions: StoredStakeholderSubmission[];
  records: RiskRegisterRecord[];
};

const riskRatings: RiskRating[] = ["Low", "Medium", "High", "Critical"];
const riskLevels: RiskLevel[] = [1, 2, 3];
const recordStringFields: Array<keyof RiskRegisterRecord> = [
  "id", "asset", "businessOwner", "riskStatement", "threat", "vulnerability",
  "businessImpact", "existingControls", "treatmentPlan", "riskOwner", "targetDate", "rationale",
];

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isStringRecord(value: unknown): value is Record<string, string> {
  return isObject(value) && Object.values(value).every((item) => typeof item === "string");
}

function isRiskRegisterRecord(value: unknown): value is RiskRegisterRecord {
  if (!isObject(value) || !recordStringFields.every((field) => typeof value[field] === "string")) return false;
  if (!riskLevels.includes(value.likelihood as RiskLevel) || !riskLevels.includes(value.impact as RiskLevel)) return false;
  if (!riskRatings.includes(value.riskRating as RiskRating)) return false;
  if (!treatmentStrategies.includes(value.treatmentStrategy as RiskRegisterRecord["treatmentStrategy"])) return false;
  if (!riskStatuses.includes(value.status as RiskRegisterRecord["status"])) return false;
  if (typeof value.riskScore !== "number") return false;
  const calculated = calculateRisk(value.likelihood as RiskLevel, value.impact as RiskLevel);
  return value.riskScore === calculated.score && value.riskRating === calculated.rating;
}

function isStakeholderSubmission(value: unknown): value is StoredStakeholderSubmission {
  if (!isObject(value) || typeof value.id !== "string" || !isStringRecord(value.source)) return false;
  if (value.status === "Awaiting Review") return value.riskRecordId === undefined;
  return value.status === "Registered" && typeof value.riskRecordId === "string" && value.riskRecordId.length > 0;
}

export function createWorkflowSessionSnapshot(
  stakeholderSubmissions: StoredStakeholderSubmission[],
  records: RiskRegisterRecord[],
): WorkflowSessionSnapshot {
  return {
    version: workflowSessionVersion,
    stakeholderSubmissions: stakeholderSubmissions.map((submission) => ({
      id: submission.id,
      source: { ...submission.source },
      status: submission.status,
      ...(submission.riskRecordId ? { riskRecordId: submission.riskRecordId } : {}),
    })),
    records: records.map((record) => ({ ...record })),
  };
}

export function parseWorkflowSessionSnapshot(raw: string): WorkflowSessionSnapshot | undefined {
  try {
    const value: unknown = JSON.parse(raw);
    if (!isObject(value) || value.version !== workflowSessionVersion || !Array.isArray(value.stakeholderSubmissions) || !Array.isArray(value.records)) return undefined;
    if (!value.stakeholderSubmissions.every(isStakeholderSubmission) || !value.records.every(isRiskRegisterRecord)) return undefined;

    const submissionIds = new Set(value.stakeholderSubmissions.map((submission) => submission.id));
    const recordIds = new Set(value.records.map((record) => record.id));
    if (submissionIds.size !== value.stakeholderSubmissions.length || recordIds.size !== value.records.length) return undefined;
    if (!value.stakeholderSubmissions.every((submission) => submission.status !== "Registered" || recordIds.has(submission.riskRecordId!))) return undefined;

    return createWorkflowSessionSnapshot(value.stakeholderSubmissions, value.records);
  } catch {
    return undefined;
  }
}
