// @ts-expect-error node:test has no types in this repo
import test from "node:test";
// @ts-expect-error node:assert has no types in this repo
import assert from "node:assert/strict";
import { datasets, changeLine, comparisonLine, percentDifference, formatTotal, labelsOverlap, moments, momentOptions, packedOn, totalOn } from "./compare.ts";
import type { CompareDataset } from "./compare.ts";

const source = "https://example.com/sample";
const sample: CompareDataset = {
  id: "dotcom",
  companies: ["a", "b", "c", "d", "e", "f", "group", "missing"].map((id) => ({
    id, name: id, kind: id === "group" ? "group" : "listed", first_mention: "2000-01-01", source,
  })),
  values: [
    { company: "a", date: "2000-01-03", value_usd_bn: 5 },
    { company: "a", date: "2000-01-01", value_usd_bn: 100 },
    ...["b", "c", "d", "e", "f", "group"].map((company, index) => ({
      company, date: "2000-01-02", value_usd_bn: (index + 1) * 10,
    })),
  ].map((point) => ({ ...point, what: "sample", source })),
};

test("totalOn carries records forward without borrowing future records", () => {
  assert.equal(totalOn(sample, "1999-12-31").total, 0);
  assert.equal(totalOn(sample, "2000-01-01").total, 100);
  assert.equal(totalOn(sample, "2000-01-02").total, 310);
  const later = totalOn(sample, "2001-01-01");
  assert.equal(later.total, 215);
  assert.equal(later.values.find((entry) => entry.company.id === "a")?.value, 5);
  assert.equal(later.values.some((entry) => entry.company.id === "missing"), false);
});

test("moments finds the highest carried total, and AI uses latest for peak", () => {
  assert.deepEqual(moments(sample), { start: "2000-01-01", lowest: "2000-01-01", peak: "2000-01-02", latest: "2000-01-03" });
  assert.equal(moments({ ...sample, id: "ai" }).peak, "2000-01-03");
  assert.deepEqual(moments({ ...sample, values: [] }), { start: null, lowest: null, peak: null, latest: null });
});

test("a company with a value counts before its first mention but not after its end", () => {
  const windowed: CompareDataset = {
    id: "dotcom",
    companies: [
      { id: "a", name: "a", kind: "listed", first_mention: "2000-01-02", ended: "2000-01-02", source },
      { id: "b", name: "b", kind: "listed", first_mention: "2000-01-01", source },
    ],
    values: [
      { company: "a", date: "2000-01-01", value_usd_bn: 100 },
      { company: "a", date: "2000-01-03", value_usd_bn: 90 },
      { company: "b", date: "2000-01-01", value_usd_bn: 10 },
    ].map((point) => ({ ...point, what: "sample", source })),
  };
  assert.equal(totalOn(windowed, "1999-12-31").total, 0);
  assert.equal(totalOn(windowed, "2000-01-01").total, 110);
  assert.equal(totalOn(windowed, "2000-01-02").total, 110);
  // "a" ended on 2 January and is gone from the next day, even though it has a later record.
  assert.equal(totalOn(windowed, "2000-01-03").total, 10);
  assert.equal(totalOn(windowed, "2000-01-03").values.some((entry) => entry.company.id === "a"), false);
  assert.equal(packedOn(windowed, "2000-01-03").some((circle) => circle.company.id === "a"), false);
});

test("label collisions include padding but allow separated and touching padded boxes", () => {
  const box = { x: 10, y: 20, width: 40, height: 12 };
  assert.equal(labelsOverlap(box, box), true);
  assert.equal(labelsOverlap(box, { ...box, x: 52 }), true);
  assert.equal(labelsOverlap(box, { ...box, x: 54 }), false);
  assert.equal(labelsOverlap(box, { ...box, y: 36 }), false);
  assert.equal(labelsOverlap(box, { ...box, y: 34 }), true);
  assert.equal(labelsOverlap(box, { ...box, x: 50 }, 0), false);
});

test("AI moment pills use Current for latest without a duplicate Peak", () => {
  assert.deepEqual(momentOptions("ai"), [
    { id: "start", label: "Start" },
    { id: "lowest", label: "Lowest" },
    { id: "latest", label: "Current" },
  ]);
  assert.equal(moments(datasets[0]).latest, moments(datasets[0]).peak);
  for (const id of ["dotcom", "housing"] as const) {
    assert.deepEqual(momentOptions(id).map((option) => option.label), ["Start", "Lowest", "Peak", "Latest"]);
  }
});

test("lowest includes the first recorded date and keeps the earliest tied record", () => {
  assert.equal(moments(sample).lowest, "2000-01-01");
  const tied = { ...sample, values: [
    { company: "a", date: "2000-01-01", value_usd_bn: 10 },
    { company: "a", date: "2000-01-03", value_usd_bn: 10 },
  ].map((point) => ({ ...point, what: "sample", source })) };
  assert.equal(moments(tied).lowest, "2000-01-01");
  const lower = { ...sample, values: [
    { company: "a", date: "2000-01-01", value_usd_bn: 100 },
    { company: "a", date: "2000-01-03", value_usd_bn: 5 },
  ].map((point) => ({ ...point, what: "sample", source })) };
  assert.equal(moments(lower).lowest, "2000-01-03");
  for (const dataset of datasets) {
    const dates = moments(dataset);
    assert.ok(dates.lowest! >= dates.start!);
    const minimum = totalOn(dataset, dates.lowest!).total;
    for (const date of new Set(dataset.values.map((point) => point.date))) {
      assert.ok(totalOn(dataset, date).total >= minimum);
    }
  }
});

test("percentage differences use B as baseline and handle falls and zero", () => {
  assert.equal(percentDifference(150, 100), 50);
  assert.equal(percentDifference(50, 100), -50);
  assert.equal(percentDifference(0, 100), -100);
  assert.equal(percentDifference(0, 0), 0);
  assert.equal(percentDifference(10, 0), null);
  assert.equal(comparisonLine(150.6, 100), "A is 51% bigger than B");
  assert.equal(comparisonLine(49.4, 100), "A is 51% smaller than B");
  for (const value of [99, 100, 101]) assert.equal(comparisonLine(value, 100), "A and B are about the same size");
});

test("change mode compares each side with its own start", () => {
  assert.equal(
    changeLine({ total: 220, change: 120 }, { total: 65, change: -35 }),
    "A grew 120% from its start; B fell 35% from its start",
  );
  assert.equal(
    changeLine({ total: 65, change: -35 }, { total: 220, change: 120 }),
    "A fell 35% from its start; B grew 120% from its start",
  );
  assert.equal(
    changeLine({ total: 100, change: 0.4 }, { total: 100, change: -0.4 }),
    "A is about the same as its start; B is about the same as its start",
  );
  assert.equal(
    changeLine({ total: 50, change: null }, { total: 60, change: 25 }),
    "A's change cannot be worked out because its Start total is zero or missing; B grew 25% from its start",
  );
  assert.equal(changeLine({ total: 0, change: 0 }, { total: 50, change: 10 }), "Pick at least one company for A");
  assert.equal(changeLine({ total: 50, change: 10 }, { total: 0, change: 0 }), "Pick at least one company for B");
});

test("empty sides prompt for players instead of a percentage", () => {
  assert.equal(comparisonLine(0, 100), "Pick at least one company for A");
  assert.equal(comparisonLine(10, 0), "Pick at least one company for B");
  assert.equal(comparisonLine(0, 0), "Pick at least one company for A");
  assert.equal(formatTotal(0), "$0");
});

test("totals use one decimal for trillions and whole billions", () => {
  assert.equal(formatTotal(26428.48), "$26.4T");
  assert.equal(formatTotal(4431.28), "$4.4T");
  assert.equal(formatTotal(811.7), "$812B");
});

test("real snapshots have three sourced, contained frames at every moment", () => {
  for (const dataset of datasets) {
    for (const date of Object.values(moments(dataset))) {
      assert.ok(date);
      const packed = packedOn(dataset, date!);
      assert.ok(packed.length > 0);
      for (const circle of packed) {
        assert.ok(circle.point.source.startsWith("https://"));
        assert.ok(Math.hypot(circle.x - 50, circle.y - 50) + circle.r <= 46.001);
      }
    }
  }
});
