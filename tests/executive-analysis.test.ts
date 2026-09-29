import assert from "node:assert/strict"; import test from "node:test"; import { executiveAnalysisInstructions, isExecutiveAnalysis, parseExecutiveAnalysisResponse } from "../lib/grc/executive-analysis.ts";
const valid = { overallRiskPosture: "posture", keyRiskThemes: [{ title: "theme", analysis: "analysis", relatedRiskIds: [] }], materialExposure: "exposure", interdependencies: "none", assessmentUncertainty: "none", managementPriorities: [{ title: "priority", rationale: "why", relatedRiskIds: [] }], decisionsAndEscalations: [], nextSteps: [{ action: "act", rationale: "why", relatedRiskIds: [] }] };
test("validates complete executive analysis", () => assert.equal(isExecutiveAnalysis(valid), true));
test("rejects missing strings and arrays", () => { assert.equal(isExecutiveAnalysis({ ...valid, overallRiskPosture: undefined }), false); assert.equal(isExecutiveAnalysis({ ...valid, keyRiskThemes: undefined }), false); });
test("rejects malformed nested items and accepts empty decisions", () => { assert.equal(isExecutiveAnalysis({ ...valid, keyRiskThemes: [{ title: "x" }] }), false); assert.equal(isExecutiveAnalysis({ ...valid, managementPriorities: [{ title: "x", rationale: 1, relatedRiskIds: [] }] }), false); assert.equal(isExecutiveAnalysis({ ...valid, nextSteps: [{ action: "x", rationale: "y" }] }), false); assert.equal(isExecutiveAnalysis({ ...valid, decisionsAndEscalations: [] }), true); });

test("parses top-level and raw Responses API output text", () => { assert.equal(parseExecutiveAnalysisResponse({ output_text: JSON.stringify(valid) })?.overallRiskPosture, "posture"); assert.equal(parseExecutiveAnalysisResponse({ output: [{ content: [{ type: "output_text", text: JSON.stringify(valid) }] }] })?.overallRiskPosture, "posture"); assert.equal(parseExecutiveAnalysisResponse({ output_text: "{" }), undefined); assert.equal(parseExecutiveAnalysisResponse({ output_text: JSON.stringify({}) }), undefined); });

test("grounds executive analysis in approved records without unsupported actions", () => {
  assert.match(executiveAnalysisInstructions, /Use only the supplied approved records/);
  assert.match(executiveAnalysisInstructions, /Do not introduce a new substantive management action/);
  assert.match(executiveAnalysisInstructions, /including training, automation, monitoring, technologies, tooling, teams, staffing, policies, programs/);
  assert.match(executiveAnalysisInstructions, /If evidence is insufficient, state the specific uncertainty/);
  assert.match(executiveAnalysisInstructions, /managementPriorities:[\s\S]*traceable to one or more approved treatment strategies\/actions/);
  assert.match(executiveAnalysisInstructions, /nextSteps:[\s\S]*traceable to approved treatment actions/);
});
