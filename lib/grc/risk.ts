export type RiskLevel = 1 | 2 | 3;
export type RiskRating = "Low" | "Medium" | "High" | "Critical";

export function calculateRisk(likelihood: RiskLevel, impact: RiskLevel) {
  const score = likelihood * impact;
  const rating: RiskRating = score <= 2 ? "Low" : score <= 4 ? "Medium" : score === 6 ? "High" : "Critical";
  return { score, rating };
}

export function toRiskLevel(value: string): RiskLevel {
  return Number(value.slice(0, 1)) as RiskLevel;
}
