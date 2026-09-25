import { calculateRisk } from "./risk.ts";
import type { RiskLevel, RiskRating } from "./risk.ts";
import type { RiskRegisterRecord } from "./risk-register.ts";

export const riskLevels: Array<{ value: RiskLevel; label: string }> = [
  { value: 1, label: "1 Low" },
  { value: 2, label: "2 Medium" },
  { value: 3, label: "3 High" },
];

export function risksForCell(records: RiskRegisterRecord[], likelihood: RiskLevel, impact: RiskLevel) {
  return records.filter((record) => record.likelihood === likelihood && record.impact === impact);
}

export function portfolioSummary(records: RiskRegisterRecord[]) {
  const summary: Record<RiskRating | "Total", number> = { Total: records.length, Critical: 0, High: 0, Medium: 0, Low: 0 };
  for (const record of records) summary[record.riskRating] += 1;
  return summary;
}

export function matrixCell(likelihood: RiskLevel, impact: RiskLevel) {
  return calculateRisk(likelihood, impact);
}

export function heatMapExportModel(records: RiskRegisterRecord[]) {
  return {
    summary: portfolioSummary(records),
    cells: ([3, 2, 1] as RiskLevel[]).flatMap((likelihood) => ([1, 2, 3] as RiskLevel[]).map((impact) => ({ likelihood, impact, ...matrixCell(likelihood, impact), risks: risksForCell(records, likelihood, impact).map((record) => record.id) }))),
  };
}
