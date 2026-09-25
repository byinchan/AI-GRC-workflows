import assert from "node:assert/strict";
import test from "node:test";
import { parseGrcDraftResponse } from "../lib/grc-assessment.ts";

const draft = { asset: "Payments service", description: "Processes payments", assetType: "Service", businessOwner: "Finance", criticality: "High", confidentiality: "3 High", integrity: "3 High", availability: "2 Medium", threat: "Unauthorized access", vulnerability: "Weak reviews", businessImpact: "Payment data could be exposed", existingControls: "Quarterly reviews", suggestedLikelihood: "2 Medium", suggestedImpact: "3 High", suggestedRiskRationale: "Analyst review required", missingInformation: [], assumptions: [], uncertainties: [] };

test("parses structured output from the raw Responses API output array", () => {
  const result = parseGrcDraftResponse({ status: "completed", output: [{ type: "message", content: [{ type: "output_text", text: JSON.stringify(draft) }] }] });
  assert.deepEqual(result.draft, draft);
});

test("rejects invalid controlled values even when JSON parses", () => {
  const result = parseGrcDraftResponse({ status: "completed", output: [{ content: [{ type: "output_text", text: JSON.stringify({ ...draft, assetType: "Database" }) }] }] });
  assert.equal(result.issue, "parsed JSON failed GRC draft validation");
});
