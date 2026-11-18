// @ts-expect-error node:test has no types in this repo
import test from "node:test";
// @ts-expect-error node:assert has no types in this repo
import assert from "node:assert/strict";
import { datasets, formatTotal, moments, packedOn, top5, totalOn } from "./compare.ts";
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
  assert.deepEqual(moments(sample), { start: "2000-01-01", peak: "2000-01-02", latest: "2000-01-03" });
  assert.equal(moments({ ...sample, id: "ai" }).peak, "2000-01-03");
  assert.deepEqual(moments({ ...sample, values: [] }), { start: null, peak: null, latest: null });
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
