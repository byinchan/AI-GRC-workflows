export const assetTypes = ["Application", "System", "Service", "Data", "Infrastructure", "Process", "Third Party / Vendor", "Other"] as const;
export const criticalityValues = ["Low", "Medium", "High"] as const;
export const ciaValues = ["1 Low", "2 Medium", "3 High"] as const;

export type GrcDraft = {
  asset: string; description: string; assetType: typeof assetTypes[number]; businessOwner: string;
  criticality: typeof criticalityValues[number]; confidentiality: typeof ciaValues[number]; integrity: typeof ciaValues[number]; availability: typeof ciaValues[number];
  threat: string; vulnerability: string; businessImpact: string; existingControls: string;
  suggestedLikelihood: typeof ciaValues[number]; suggestedImpact: typeof ciaValues[number]; suggestedRiskRationale: string;
  missingInformation: string[]; assumptions: string[]; uncertainties: string[];
};

const stringFields = ["asset", "description", "businessOwner", "threat", "vulnerability", "businessImpact", "existingControls", "suggestedRiskRationale"] as const;
const listFields = ["missingInformation", "assumptions", "uncertainties"] as const;
const valid = (value: unknown, options: readonly string[]) => typeof value === "string" && options.includes(value);

export function isGrcDraft(value: unknown): value is GrcDraft {
  if (!value || typeof value !== "object") return false;
  const draft = value as Record<string, unknown>;
  return stringFields.every((key) => typeof draft[key] === "string") && listFields.every((key) => Array.isArray(draft[key]) && draft[key].every((item) => typeof item === "string")) && valid(draft.assetType, assetTypes) && valid(draft.criticality, criticalityValues) && ["confidentiality", "integrity", "availability", "suggestedLikelihood", "suggestedImpact"].every((key) => valid(draft[key], ciaValues));
}

export const draftSchema = {
  type: "object", additionalProperties: false,
  properties: {
    asset: { type: "string" }, description: { type: "string" }, assetType: { type: "string", enum: assetTypes }, businessOwner: { type: "string" }, criticality: { type: "string", enum: criticalityValues },
    confidentiality: { type: "string", enum: ciaValues }, integrity: { type: "string", enum: ciaValues }, availability: { type: "string", enum: ciaValues }, threat: { type: "string" }, vulnerability: { type: "string" }, businessImpact: { type: "string" }, existingControls: { type: "string" },
    suggestedLikelihood: { type: "string", enum: ciaValues }, suggestedImpact: { type: "string", enum: ciaValues }, suggestedRiskRationale: { type: "string" },
    missingInformation: { type: "array", items: { type: "string" } }, assumptions: { type: "array", items: { type: "string" } }, uncertainties: { type: "array", items: { type: "string" } },
  },
  required: ["asset", "description", "assetType", "businessOwner", "criticality", "confidentiality", "integrity", "availability", "threat", "vulnerability", "businessImpact", "existingControls", "suggestedLikelihood", "suggestedImpact", "suggestedRiskRationale", "missingInformation", "assumptions", "uncertainties"],
} as const;
