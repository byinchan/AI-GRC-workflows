import assert from "node:assert/strict";
import test from "node:test";
import { calculateRisk } from "../lib/grc/risk.ts";

test("maps deterministic risk thresholds", () => {
  assert.deepEqual(calculateRisk(1, 1), { score: 1, rating: "Low" });
  assert.deepEqual(calculateRisk(1, 2), { score: 2, rating: "Low" });
  assert.deepEqual(calculateRisk(1, 3), { score: 3, rating: "Medium" });
  assert.deepEqual(calculateRisk(2, 2), { score: 4, rating: "Medium" });
  assert.deepEqual(calculateRisk(2, 3), { score: 6, rating: "High" });
  assert.deepEqual(calculateRisk(3, 3), { score: 9, rating: "Critical" });
});
