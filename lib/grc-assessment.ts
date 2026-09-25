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

export function validateGrcDraft(value: unknown): { valid: true } | { valid: false; issue: string } {
  if (!value || typeof value !== "object") return { valid: false, issue: "draft was not an object" };
  const draft = value as Record<string, unknown>;
  for (const key of stringFields) if (typeof draft[key] !== "string") return { valid: false, issue: `${key} was not a string` };
  for (const key of listFields) if (!Array.isArray(draft[key]) || !draft[key].every((item) => typeof item === "string")) return { valid: false, issue: `${key} was not a string array` };
  if (!valid(draft.assetType, assetTypes)) return { valid: false, issue: "assetType was outside the controlled values" };
  if (!valid(draft.criticality, criticalityValues)) return { valid: false, issue: "criticality was outside the controlled values" };
  for (const key of ["confidentiality", "integrity", "availability", "suggestedLikelihood", "suggestedImpact"]) if (!valid(draft[key], ciaValues)) return { valid: false, issue: `${key} was outside the controlled values` };
  return { valid: true };
}

export function isGrcDraft(value: unknown): value is GrcDraft {
  return validateGrcDraft(value).valid;
}

type ResponseContent = { type?: string; text?: string; refusal?: string };
type ResponsesPayload = { status?: string; output_text?: string; output?: Array<{ type?: string; content?: ResponseContent[] }> };

export function parseGrcDraftResponse(payload: unknown): { draft?: GrcDraft; issue?: string } {
  if (!payload || typeof payload !== "object") return { issue: "response was not an object" };
  const response = payload as ResponsesPayload;
  if (response.status && response.status !== "completed") return { issue: `response status was ${response.status}` };
  const content = response.output?.flatMap((item) => item.content ?? []) ?? [];
  if (content.some((item) => item.refusal)) return { issue: "model returned a refusal" };
  const text = response.output_text ?? content.filter((item) => item.type === "output_text").map((item) => item.text ?? "").join("");
  if (!text) return { issue: "response contained no output text" };
  try {
    const draft = JSON.parse(text);
    const validation = validateGrcDraft(draft);
    return validation.valid ? { draft: draft as GrcDraft } : { issue: validation.issue };
  } catch {
    return { issue: "output text was not valid JSON" };
  }
}

export function summarizeResponseShape(payload: unknown) {
  if (!payload || typeof payload !== "object") return { payloadType: typeof payload };
  const response = payload as ResponsesPayload;
  return { status: response.status ?? "missing", hasOutputText: typeof response.output_text === "string", outputTypes: response.output?.map((item) => item.type ?? "missing") ?? [], contentTypes: response.output?.flatMap((item) => item.content?.map((content) => content.type ?? "missing") ?? []) ?? [] };
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
