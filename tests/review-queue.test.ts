import assert from "node:assert/strict";
import test from "node:test";
import { createSubmission, markSubmissionRegistered } from "../lib/grc/review-queue.ts";
import { portfolioSummary } from "../lib/grc/heat-map.ts";

test("keeps stakeholder submissions separate from registered risks", () => { const first = createSubmission({ assessmentSubject: "Risk A" }, []); const second = createSubmission({ assessmentSubject: "Risk B" }, [first]); const third = createSubmission({ assessmentSubject: "Risk C" }, [first, second]); assert.deepEqual([first.id, second.id, third.id], ["SUB-001", "SUB-002", "SUB-003"]); assert.equal(portfolioSummary([]).Total, 0); const updated = markSubmissionRegistered([first, second, third], first.id, "RISK-001"); assert.equal(updated[0].riskId, "RISK-001"); assert.equal(updated[1].status, "Awaiting Review"); });
