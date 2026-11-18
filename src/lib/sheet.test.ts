// Made-up heights, passed in as arguments: the snap only does arithmetic, so these tests do not
// depend on the page or the data files.
// @ts-expect-error node:test has no types in this repo
import test from "node:test";
// @ts-expect-error node:assert has no types in this repo
import assert from "node:assert/strict";
import { snapSheet } from "./sheet.ts";

const DOCKED = 130;
const OPEN = 280;
const HALFWAY = (DOCKED + OPEN) / 2;

test("a slow release settles on the nearer state", () => {
  assert.equal(snapSheet(DOCKED, DOCKED, OPEN, 0), "docked");
  assert.equal(snapSheet(HALFWAY - 1, DOCKED, OPEN, 0), "docked");
  assert.equal(snapSheet(HALFWAY, DOCKED, OPEN, 0), "open");
  assert.equal(snapSheet(HALFWAY + 1, DOCKED, OPEN, 0), "open");
  assert.equal(snapSheet(OPEN, DOCKED, OPEN, 0), "open");
});

test("a flick wins over the distance travelled", () => {
  // Thrown up from just above the docked height: it opens.
  assert.equal(snapSheet(DOCKED + 1, DOCKED, OPEN, 0.6), "open");
  // Thrown down from just below the open height: it docks.
  assert.equal(snapSheet(OPEN - 1, DOCKED, OPEN, -0.6), "docked");
});

test("a speed of exactly the flick limit is not a flick, and the sign decides the direction", () => {
  assert.equal(snapSheet(DOCKED + 1, DOCKED, OPEN, 0.5), "docked");
  assert.equal(snapSheet(OPEN - 1, DOCKED, OPEN, -0.5), "open");
  assert.equal(snapSheet(HALFWAY, DOCKED, OPEN, 2), "open");
  assert.equal(snapSheet(HALFWAY, DOCKED, OPEN, -2), "docked");
});

test("a sheet that cannot be measured still gets a state", () => {
  assert.equal(snapSheet(0, 0, 0, 0), "open");
});
