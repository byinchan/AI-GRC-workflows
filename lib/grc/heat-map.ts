import { calculateRisk } from "./risk.ts";
import type { RiskLevel, RiskRating } from "./risk.ts";
import type { RiskRegisterRecord } from "./risk-register.ts";

export const heatMapSeverityTone = { Low: "border-emerald-300 bg-emerald-50 text-emerald-950", Medium: "border-amber-300 bg-amber-50 text-amber-950", High: "border-orange-300 bg-orange-50 text-orange-950", Critical: "border-red-400 bg-red-50 text-red-950" } as const;

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
