// This repo has no Node type definitions, so the two imports below report an error
// that does not apply here: Node runs this file directly. astro check passes because of it.
// @ts-expect-error node:test has no types in this repo
import test from "node:test";
// @ts-expect-error node:assert has no types in this repo
import assert from "node:assert";
import {
  companies,
  isShown,
  kindColour,
  kinds,
  LAST_DAY,
  pillLabel,
  status,
  useDataset,
  valueOn,
  valuePointOn,
} from "./data.ts";
import type { Company, ValuePoint } from "./data.ts";
import { FIRST_DAY } from "./timeline.ts";

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

test("isShown stops after a company's ended day", () => {
  const ended = { ...company, ended: "2020-06-30" };
  assert.equal(isShown(ended, "2019-07-21"), false);
  assert.equal(isShown(ended, "2019-07-22"), true);
  // The ended day itself still shows the company; the next day does not.
  assert.equal(isShown(ended, "2020-06-30"), true);
  assert.equal(isShown(ended, "2020-07-01"), false);
});

test("useDataset switches companies, first day, last day and kinds, and switching back restores ai", () => {
  const aiCompanies = companies.map((one) => one.id);
  const aiFirst = FIRST_DAY;
  const aiLast = LAST_DAY;
  const aiKinds = kinds.map((one) => one.id);
  const aiStatus = status;

  useDataset("dotcom");
  assert.ok(companies.some((one) => one.id === "aol"), "the dot-com set has no AOL");
  assert.ok(!companies.some((one) => one.id === "openai"), "an AI company is in the dot-com set");
  assert.equal(FIRST_DAY, "1995-01-01");
  assert.equal(LAST_DAY, "2002-12-31");
  assert.deepEqual(kinds.map((one) => one.id), ["investment", "takeover", "supplier"]);

  useDataset("housing");
  assert.ok(companies.some((one) => one.id === "lehman-brothers"));
  assert.equal(FIRST_DAY, "2003-01-01");
  assert.equal(LAST_DAY, "2009-12-31");
  assert.deepEqual(kinds.map((one) => one.id), ["investment", "takeover"]);
  assert.equal(status, "draft");

  useDataset("ai");
  assert.deepEqual(companies.map((one) => one.id), aiCompanies);
  assert.equal(FIRST_DAY, aiFirst);
  assert.equal(LAST_DAY, aiLast);
  assert.deepEqual(kinds.map((one) => one.id), aiKinds);
  assert.equal(status, aiStatus);
});

test("a set's ended companies are the ones that were bought or failed", () => {
  useDataset("dotcom");
  const ended = new Map(
    companies.filter((one) => one.ended !== undefined).map((one) => [one.id, one.ended]),
  );
  assert.deepEqual(
    [...ended.entries()].sort(),
    [
      ["enron", "2001-12-31"],
      ["time-warner", "2001-01-11"],
      ["us-west", "2000-06-30"],
    ],
  );
  // AOL Time Warner merely has no 2002 year-end point in the sources: it did not end.
  assert.equal(companies.find((one) => one.id === "aol")?.ended, undefined);

  useDataset("housing");
  assert.deepEqual(
    companies
      .filter((one) => one.ended !== undefined)
      .map((one) => one.id)
      .sort(),
    ["bear-stearns", "countrywide", "lehman-brothers", "merrill-lynch", "wachovia", "washington-mutual"],
  );

  useDataset("ai");
});

test("a set's first, second and third deal kind take the three money-line colours", () => {
  useDataset("ai");
  assert.equal(kindColour("investment"), "investment");
  assert.equal(kindColour("cloud"), "cloud");
  assert.equal(kindColour("chip"), "chip");
  assert.equal(pillLabel("cloud"), "Cloud deal");
  assert.equal(pillLabel("science"), "Science");
  assert.equal(pillLabel("money"), "Money");

  useDataset("dotcom");
  assert.equal(kindColour("investment"), "investment");
  assert.equal(pillLabel("investment"), "Investment deal");

  useDataset("housing");
  assert.equal(kindColour("investment"), "investment");
  assert.equal(kindColour("takeover"), "cloud");
  assert.equal(pillLabel("takeover"), "Takeover deal");
  // A kind the set does not list is drawn in the quiet ink colour.
  assert.equal(kindColour("chip"), "ink-2");

  useDataset("ai");
});
