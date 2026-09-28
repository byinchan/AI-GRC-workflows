import assert from "node:assert/strict"; import test from "node:test"; import { findExactStakeholderMatch } from "../lib/stakeholder-similarity.ts";
const base = { assessmentSubject: "Vendor service", identifiedConcern: "Recovery controls are unclear", possibleOutcome: "Customer notices delayed" };
test("matches identical stakeholder submissions", () => assert.equal(findExactStakeholderMatch(base, [{ id: "one", source: base }])?.id, "one"));
test("normalizes capitalization and whitespace", () => assert.equal(findExactStakeholderMatch({ assessmentSubject: " VENDOR   SERVICE ", identifiedConcern: "recovery controls are unclear", possibleOutcome: "customer notices delayed" }, [{ id: "one", source: base }])?.id, "one"));
test("does not exact-match different risk content", () => assert.equal(findExactStakeholderMatch({ ...base, identifiedConcern: "Customer data disclosure" }, [{ id: "one", source: base }]), undefined));
