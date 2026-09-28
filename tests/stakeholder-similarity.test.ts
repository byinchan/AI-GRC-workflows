import assert from "node:assert/strict"; import test from "node:test"; import { findExactStakeholderMatch, parseStakeholderSimilarityResponse } from "../lib/stakeholder-similarity.ts";
const base = { assessmentSubject: "Vendor service", identifiedConcern: "Recovery controls are unclear", possibleOutcome: "Customer notices delayed" };
test("matches identical stakeholder submissions", () => assert.equal(findExactStakeholderMatch(base, [{ id: "one", source: base }])?.id, "one"));
test("normalizes capitalization and whitespace", () => assert.equal(findExactStakeholderMatch({ assessmentSubject: " VENDOR   SERVICE ", identifiedConcern: "recovery controls are unclear", possibleOutcome: "customer notices delayed" }, [{ id: "one", source: base }])?.id, "one"));
test("does not exact-match different risk content", () => assert.equal(findExactStakeholderMatch({ ...base, identifiedConcern: "Customer data disclosure" }, [{ id: "one", source: base }]), undefined));

const nonMatch = { potentiallySimilar: false, matchingSubmissionId: null, rationale: "The underlying risk scenario differs." };
const match = { potentiallySimilar: true, matchingSubmissionId: "submission-1", rationale: "The same vendor recovery concern is described." };
test("parses top-level stakeholder similarity output", () => assert.deepEqual(parseStakeholderSimilarityResponse({ output_text: JSON.stringify(nonMatch) }), nonMatch));
test("parses raw Responses API stakeholder similarity output", () => assert.deepEqual(parseStakeholderSimilarityResponse({ output: [{ content: [{ type: "output_text", text: JSON.stringify(match) }] }] }), match));
test("rejects malformed and missing stakeholder similarity output", () => { assert.equal(parseStakeholderSimilarityResponse({ output_text: "{" }), undefined); assert.equal(parseStakeholderSimilarityResponse({}), undefined); });
test("rejects structurally invalid stakeholder similarity output", () => { assert.equal(parseStakeholderSimilarityResponse({ output_text: JSON.stringify({ potentiallySimilar: true, rationale: "Missing ID" }) }), undefined); assert.equal(parseStakeholderSimilarityResponse({ output_text: JSON.stringify({ potentiallySimilar: "true", matchingSubmissionId: "submission-1", rationale: "Wrong type" }) }), undefined); });
