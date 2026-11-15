// Small made-up inputs, passed in as arguments, so these tests do not depend on the data files.
// @ts-expect-error node:test has no types in this repo
import test from "node:test";
// @ts-expect-error node:assert has no types in this repo
import assert from "node:assert";
import { arrowsOn, bubblesOn, positions, totalOn } from "./layout.ts";
import type { Company, Deal, ValuePoint } from "./data.ts";

const source = "https://example.com/sample";

const companies: Company[] = [
  { id: "a", name: "A", kind: "listed", first_mention: "2020-01-01", source },
  { id: "b", name: "B", kind: "private", first_mention: "2020-06-01", source },
  { id: "c", name: "C", kind: "group", members: ["X"], first_mention: "2021-01-01", source },
  { id: "d", name: "D", kind: "listed", first_mention: "2019-01-01", source },
];

const values: ValuePoint[] = [
  { company: "a", date: "2020-01-01", value_usd_bn: 100, what: "start", source },
  { company: "a", date: "2021-01-01", value_usd_bn: 400, what: "end", source },
  { company: "b", date: "2020-06-01", value_usd_bn: 25, what: "round", source },
  { company: "c", date: "2021-01-01", value_usd_bn: 9, what: "round", source },
];

const deals: Deal[] = [
  {
    id: "d1",
    date: "2020-03-01",
    from: "a",
    to: "b",
    kind: "investment",
    amount_usd_bn: 1,
    amount_type: "paid",
    title: "one",
    source,
  },
  {
    id: "d2",
    date: "2020-03-01",
    from: "a",
    to: "b",
    kind: "cloud",
    amount_usd_bn: null,
    amount_type: "reported",
    title: "two",
    source,
  },
  {
    id: "d3",
    date: "2020-09-01",
    from: "b",
    to: "a",
    kind: "investment",
    amount_usd_bn: 2,
    amount_type: "paid",
    title: "three",
    source,
  },
  {
    id: "d4",
    date: "2020-02-01",
    from: "a",
    to: "c",
    kind: "chip",
    amount_usd_bn: 3,
    amount_type: "paid",
    title: "four",
    source,
  },
  {
    id: "d5",
    date: "2020-04-01",
    from: "a",
    to: "b",
    kind: "investment",
    amount_usd_bn: 0.5,
    amount_type: "paid",
    title: "five",
    source,
  },
];

test("positions are the same for the same input twice", () => {
  const one = positions(companies, values);
  const two = positions(companies, values);
  assert.deepEqual([...one.entries()], [...two.entries()]);
});

test("positions leave out companies with no value points", () => {
  const layout = positions(companies, values);
  assert.equal(layout.has("a"), true);
  assert.equal(layout.has("d"), false);
});

test("no two circles overlap at rMax", () => {
  const layout = positions(companies, values);
  const list = [...layout.values()];
  for (let i = 0; i < list.length; i += 1) {
    for (let j = i + 1; j < list.length; j += 1) {
      const distance = Math.hypot(list[i].x - list[j].x, list[i].y - list[j].y);
      assert.ok(
        distance >= list[i].rMax + list[j].rMax - 1e-6,
        `circles ${i} and ${j} overlap: ${distance} < ${list[i].rMax + list[j].rMax}`,
      );
    }
  }
});

test("every circle lies inside the frame", () => {
  const layout = positions(companies, values);
  for (const position of layout.values()) {
    assert.ok(position.x - position.rMax >= 2 - 1e-6, "left edge outside the frame");
    assert.ok(position.x + position.rMax <= 98 + 1e-6, "right edge outside the frame");
    assert.ok(position.y - position.rMax >= 2 - 1e-6, "top edge outside the frame");
    assert.ok(position.y + position.rMax <= 98 + 1e-6, "bottom edge outside the frame");
    assert.ok(position.rMax <= 46 + 1e-6, "radius passes the fit radius");
  }
});

test("a company before its first mention is absent", () => {
  const bubbles = bubblesOn("2020-05-31", companies, values);
  const ids = bubbles.map((bubble) => bubble.id);
  assert.deepEqual(ids, ["a"]);
  assert.equal(bubblesOn("2021-01-01", companies, values).map((bubble) => bubble.id).join(","), "a,b,c");
});

test("r follows the square-root rule", () => {
  const layout = positions(companies, values);
  const a = layout.get("a")!;
  assert.equal(a.maxValue, 400);

  const start = bubblesOn("2020-01-01", companies, values, layout).find((bubble) => bubble.id === "a")!;
  assert.equal(start.value, 100);
  assert.ok(Math.abs(start.r - a.rMax * Math.sqrt(100 / 400)) < 1e-9);

  const end = bubblesOn("2021-01-01", companies, values, layout).find((bubble) => bubble.id === "a")!;
  assert.equal(end.value, 400);
  assert.ok(Math.abs(end.r - a.rMax) < 1e-9);
});

test("an arrow is absent when one end is not shown", () => {
  const before = arrowsOn("2020-05-31", companies, values, deals);
  assert.equal(before.length, 0);

  const after = arrowsOn("2020-06-01", companies, values, deals);
  assert.equal(after.some((arrow) => arrow.from === "a" && arrow.to === "b"), true);
  assert.equal(after.some((arrow) => arrow.from === "a" && arrow.to === "c"), false);
});

test("two kinds between one pair give two arrows with different coordinates", () => {
  const arrows = arrowsOn("2020-06-01", companies, values, deals);
  const pair = arrows.filter((arrow) => arrow.from === "a" && arrow.to === "b");
  assert.equal(pair.length, 2);
  assert.deepEqual(
    pair.map((arrow) => arrow.kind).sort(),
    ["cloud", "investment"],
  );
  assert.ok(
    pair[0].x1 !== pair[1].x1 || pair[0].y1 !== pair[1].y1 || pair[0].x2 !== pair[1].x2,
    "the two arrows sit on top of each other",
  );
});

test("deals of one kind merge, and a null amount counts as zero", () => {
  const arrows = arrowsOn("2020-06-01", companies, values, deals);
  const investment = arrows.find((arrow) => arrow.from === "a" && arrow.to === "b" && arrow.kind === "investment")!;
  assert.equal(investment.count, 2);
  assert.equal(investment.amount_usd_bn, 1.5);
  assert.equal(investment.amountKnown, true);

  const cloud = arrows.find((arrow) => arrow.from === "a" && arrow.to === "b" && arrow.kind === "cloud")!;
  assert.equal(cloud.count, 1);
  assert.equal(cloud.amount_usd_bn, 0);
  assert.equal(cloud.amountKnown, false);
});

test("totalOn sums the values shown on the day", () => {
  assert.equal(totalOn("2020-01-01", companies, values), 100);
  assert.equal(totalOn("2021-01-01", companies, values), 434);
});
