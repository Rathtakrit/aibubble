// This repo has no Node type definitions, so the two imports below report an error
// that does not apply here: Node runs this file directly. astro check passes because of it.
// @ts-expect-error node:test has no types in this repo
import test from "node:test";
// @ts-expect-error node:assert has no types in this repo
import assert from "node:assert";
import { isShown, valueOn, valuePointOn } from "./data.ts";
import type { Company, ValuePoint } from "./data.ts";

const source = "https://example.com/sample";

const points: ValuePoint[] = [
  { company: "a", date: "2020-01-01", value_usd_bn: 100, what: "start", source },
  { company: "a", date: "2020-01-11", value_usd_bn: 200, what: "end", source },
  { company: "b", date: "2020-01-05", value_usd_bn: 50, what: "only point", source },
];

const company: Company = { id: "a", name: "A", kind: "private", first_mention: "2019-07-22", source };

test("valueOn returns the exact value on a point's day", () => {
  assert.equal(valueOn(points, "a", "2020-01-01"), 100);
  assert.equal(valueOn(points, "a", "2020-01-11"), 200);
});

test("valueOn draws a straight line between two points", () => {
  assert.equal(valueOn(points, "a", "2020-01-06"), 150);
  assert.equal(valueOn(points, "a", "2020-01-03"), 120);
});

test("valueOn gives the first value before the first point", () => {
  assert.equal(valueOn(points, "a", "1999-01-01"), 100);
});

test("valueOn gives the last value after the last point", () => {
  assert.equal(valueOn(points, "a", "2030-01-01"), 200);
});

test("valueOn is null for a company with no points", () => {
  assert.equal(valueOn(points, "zzz", "2020-01-06"), null);
  assert.equal(valueOn([], "a", "2020-01-06"), null);
});

test("valuePointOn gives the sourced point behind the value shown that day", () => {
  // Between two points, the value is an estimate drawn from the earlier one.
  assert.equal(valuePointOn(points, "a", "2020-01-06")?.date, "2020-01-01");
  assert.equal(valuePointOn(points, "a", "2020-01-06")?.value_usd_bn, 100);
  // On a point's own day, that point.
  assert.equal(valuePointOn(points, "a", "2020-01-11")?.value_usd_bn, 200);
  // Before the first point, the first point is the one behind the value.
  assert.equal(valuePointOn(points, "a", "1999-01-01")?.date, "2020-01-01");
  // After the last point, the last.
  assert.equal(valuePointOn(points, "a", "2030-01-01")?.date, "2020-01-11");
  // Only the company's own points are looked at.
  assert.equal(valuePointOn(points, "b", "2020-01-06")?.date, "2020-01-05");
  assert.equal(valuePointOn(points, "zzz", "2020-01-06"), null);
  assert.equal(valuePointOn([], "a", "2020-01-06"), null);
});

test("isShown is true from first_mention on", () => {
  assert.equal(isShown(company, "2019-07-21"), false);
  assert.equal(isShown(company, "2019-07-22"), true);
  assert.equal(isShown(company, "2024-01-01"), true);
});
