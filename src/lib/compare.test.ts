// @ts-expect-error node:test has no types in this repo
import test from "node:test";
// @ts-expect-error node:assert has no types in this repo
import assert from "node:assert/strict";
import { datasets, comparisonLine, percentDifference, formatTotal, moments, momentOptions, packedOn, top5, totalOn } from "./compare.ts";
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
  assert.deepEqual(moments(sample), { start: "2000-01-01", lowest: "2000-01-03", peak: "2000-01-02", latest: "2000-01-03" });
  assert.equal(moments({ ...sample, id: "ai" }).peak, "2000-01-03");
  assert.deepEqual(moments({ ...sample, values: [] }), { start: null, lowest: null, peak: null, latest: null });
});

test("AI moment pills use Current for latest without a duplicate Peak", () => {
  assert.deepEqual(momentOptions("ai"), [
    { id: "start", label: "Start" },
    { id: "lowest", label: "Lowest" },
    { id: "latest", label: "Current" },
    { id: "date", label: "Date…" },
  ]);
  assert.equal(moments(datasets[0]).latest, moments(datasets[0]).peak);
  for (const id of ["dotcom", "housing"] as const) {
    assert.deepEqual(momentOptions(id).map((option) => option.label), ["Start", "Lowest", "Peak", "Latest", "Date…"]);
  }
});

test("lowest excludes Start, uses carried totals, and keeps the earliest tied record", () => {
  const tied = { ...sample, values: [...sample.values, { ...sample.values[0], date: "2000-01-04" }] };
  assert.equal(moments(tied).lowest, "2000-01-03");
  assert.equal(moments({ ...sample, values: sample.values.filter((p) => p.date === "2000-01-01") }).lowest, null);
  for (const dataset of datasets) {
    const dates = moments(dataset);
    assert.ok(dates.lowest! > dates.start!);
    const minimum = totalOn(dataset, dates.lowest!).total;
    for (const date of new Set(dataset.values.map((p) => p.date))) {
      if (date > dates.start!) assert.ok(totalOn(dataset, date).total >= minimum);
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
  assert.equal(comparisonLine(0, 100), "A is 100% smaller than B");
  assert.equal(comparisonLine(10, 0), "A has value; B has no recorded value selected");
});

test("top5 sorts by value and excludes groups and missing companies", () => {
  assert.deepEqual(top5(sample, "2000-01-02").map((entry) => entry.company.id), ["a", "f", "e", "d", "c"]);
  assert.equal(top5(sample, "2000-01-01").length, 1);
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
