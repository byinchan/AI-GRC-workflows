import { heatMapExportModel, portfolioSummary } from "./heat-map.ts";
import type { RiskRegisterRecord } from "./risk-register.ts";

const severity = { Critical: 4, High: 3, Medium: 2, Low: 1 } as const;

export function reportDate(date = new Date()) { return date.toISOString().slice(0, 10); }
export function orderForManagementAttention(records: RiskRegisterRecord[]) { return [...records].sort((a, b) => severity[b.riskRating] - severity[a.riskRating] || b.riskScore - a.riskScore || a.id.localeCompare(b.id)); }
export function executiveReportModel(records: RiskRegisterRecord[], date = new Date()) { return { reportDate: reportDate(date), summary: portfolioSummary(records), heatMap: heatMapExportModel(records), attention: orderForManagementAttention(records), narrativeRisks: records.map(({ id, asset, riskRating, riskScore, riskStatement, businessImpact, riskOwner, treatmentStrategy, status, targetDate }) => ({ id, asset, riskRating, riskScore, riskStatement, businessImpact, riskOwner, treatmentStrategy, status, targetDate })) }; }
export function cleanExecutiveNarrative(value: string) { return value.replace(/#{1,6}/g, "").replace(/\*\*/g, "").replace(/---+/g, "").replace(/\n{3,}/g, "\n\n").trim(); }
