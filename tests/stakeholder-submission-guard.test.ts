import assert from "node:assert/strict";
import test from "node:test";
import { createStakeholderSubmissionGuard } from "../lib/stakeholder-submission-guard.ts";

test("blocks immediate re-entry while stakeholder submission processing is in progress", () => {
  const guard = createStakeholderSubmissionGuard();
  assert.equal(guard.begin(), true);
  assert.equal(guard.begin(), false);
});

test("releases the submission guard when similarity needs user input or processing fails", () => {
  const guard = createStakeholderSubmissionGuard();
  assert.equal(guard.begin(), true);
  guard.release();
  assert.equal(guard.begin(), true);
  guard.release();
  assert.equal(guard.begin(), true);
});

test("finalizes a stakeholder submission exactly once until the intake is reset", () => {
  const guard = createStakeholderSubmissionGuard();
  let submissions = 0;
  const finalize = () => { if (guard.finalize()) submissions += 1; };
  finalize();
  finalize();
  assert.equal(submissions, 1);
  assert.equal(guard.begin(), false);
  guard.reset();
  assert.equal(guard.begin(), true);
  guard.release();
  finalize();
  assert.equal(submissions, 2);
});
