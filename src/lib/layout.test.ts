// Small made-up inputs, passed in as arguments, so these tests do not depend on the data files.
// @ts-expect-error node:test has no types in this repo
import test from "node:test";
// @ts-expect-error node:assert has no types in this repo
import assert from "node:assert";
import { arrowSide, arrowsOn, bubblesOn, dayLayouts, FRAME, totalOn } from "./layout.ts";
import type { Company, Deal, ValuePoint } from "./data.ts";
import { FIRST_DAY } from "./timeline.ts";

const source = "https://example.com/sample";
const DAY_MS = 86_400_000;

// A day that many days after the first day of the site.
function day(count: number): string {
  return new Date(Date.parse(`${FIRST_DAY}T00:00:00Z`) + count * DAY_MS).toISOString().slice(0, 10);
}

// Just over two months of days, enough for a company to join and others to grow.
const LAST = day(72);

const companies: Company[] = [
  { id: "a", name: "A", kind: "listed", first_mention: day(0), source },
  { id: "b", name: "B", kind: "private", first_mention: day(10), source },
  { id: "c", name: "C", kind: "group", members: ["X"], first_mention: day(36), source },
  // Never has a value, so it is never drawn.
  { id: "d", name: "D", kind: "listed", first_mention: day(20), source },
];

const values: ValuePoint[] = [
  { company: "a", date: day(0), value_usd_bn: 100, what: "start", source },
  { company: "a", date: day(63), value_usd_bn: 400, what: "end", source },
  // The same value as "a" on day one, on another day: it must draw the same radius.
  { company: "b", date: day(10), value_usd_bn: 100, what: "round", source },
  { company: "b", date: day(63), value_usd_bn: 225, what: "round", source },
  { company: "c", date: day(36), value_usd_bn: 9, what: "round", source },
];

const deals: Deal[] = [
  {
    id: "d1",
    date: day(10),
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
    date: day(12),
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
    date: day(40),
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
    date: day(36),
    from: "a",
    to: "c",
    kind: "chip",
    amount_usd_bn: 3,
    amount_type: "paid",
    title: "four",
    source,
  },
];

const layout = dayLayouts(companies, values, deals, LAST);

test("the same input gives the same layout twice", () => {
  const again = dayLayouts(companies, values, deals, LAST);
  const dump = (one: typeof layout) =>
    [...one.days.entries()].map(([date, placed]) => [date, [...placed.entries()]]);
  assert.deepEqual(dump(again), dump(layout));
});

test("every day: no circles overlap, and every circle is inside the frame", () => {
  for (const [date, placed] of layout.days) {
    const list = [...placed.values()];
    for (let i = 0; i < list.length; i += 1) {
      const reach = Math.hypot(list[i].x - FRAME.cx, list[i].y - FRAME.cy) + list[i].r;
      assert.ok(
        reach <= FRAME.fitRadius + 1e-6,
        `a circle passes the fit circle on ${date}: ${reach} > ${FRAME.fitRadius}`,
      );
      for (let j = i + 1; j < list.length; j += 1) {
        const distance = Math.hypot(list[i].x - list[j].x, list[i].y - list[j].y);
        const overlap = list[i].r + list[j].r - distance;
        assert.ok(overlap <= 0.5, `two circles overlap by ${overlap} on ${date}`);
      }
    }
  }
});

test("the same value is the same radius on any day", () => {
  const first = bubblesOn(day(0), companies, values, deals, layout).find((bubble) => bubble.id === "a")!;
  const joined = bubblesOn(day(10), companies, values, deals, layout).find((bubble) => bubble.id === "b")!;
  assert.equal(first.value, 100);
  assert.equal(joined.value, 100);
  assert.ok(Math.abs(first.r - joined.r) < 1e-9, `radius ${first.r} is not ${joined.r}`);

  const later = bubblesOn(LAST, companies, values, deals, layout).find((bubble) => bubble.id === "a")!;
  assert.ok(later.r > first.r, "a company that is worth more is not drawn bigger");
});

test("no company moves more than 3 units from one day to the next", () => {
  const dates = [...layout.days.keys()];
  for (let index = 1; index < dates.length; index += 1) {
    const before = layout.days.get(dates[index - 1])!;
    const after = layout.days.get(dates[index])!;
    for (const [id, placed] of after) {
      const was = before.get(id);
      if (!was) continue;
      const moved = Math.hypot(placed.x - was.x, placed.y - was.y);
      assert.ok(moved <= 3, `${id} jumped ${moved} on ${dates[index]}`);
    }
  }
});

test("a company that enters with a deal partner starts beside that partner", () => {
  const today = bubblesOn(day(10), companies, values, deals, layout).filter((bubble) => bubble.id !== "d");
  const a = today.find((bubble) => bubble.id === "a")!;
  const b = today.find((bubble) => bubble.id === "b")!;
  const distance = Math.hypot(a.x - b.x, a.y - b.y);
  assert.ok(
    distance <= a.r + b.r + 3,
    `B starts ${distance} from A, more than their two radii plus 3`,
  );
});

test("a company before its first mention is absent", () => {
  assert.deepEqual(bubblesOn(day(9), companies, values, deals, layout).map((bubble) => bubble.id), ["a"]);
  assert.deepEqual(bubblesOn(day(10), companies, values, deals, layout).map((bubble) => bubble.id), [
    "a",
    "b",
  ]);
});

test("an arrow is absent when one end is not shown", () => {
  assert.equal(arrowsOn(day(9), companies, values, deals, layout).length, 0);
  const after = arrowsOn(day(12), companies, values, deals, layout);
  assert.equal(after.some((arrow) => arrow.from === "a" && arrow.to === "b"), true);
  assert.equal(after.some((arrow) => arrow.from === "a" && arrow.to === "c"), false);
});

test("two kinds between one pair give two arrows, and only one is pairFirst", () => {
  const arrows = arrowsOn(day(12), companies, values, deals, layout);
  const pair = arrows.filter((arrow) => arrow.from === "a" && arrow.to === "b");
  assert.equal(pair.length, 2);
  assert.deepEqual(pair.map((arrow) => arrow.kind).sort(), ["cloud", "investment"]);
  assert.ok(
    pair[0].cx !== pair[1].cx || pair[0].cy !== pair[1].cy,
    "the two arrows share a control point, so they sit on top of each other",
  );
  assert.equal(pair.filter((arrow) => arrow.pairFirst).length, 1);
});

test("both directions and three kinds still bend to one side with one pairFirst", () => {
  const arrows = arrowsOn(day(45), companies, values, deals, layout);
  const pair = arrows.filter(
    (arrow) =>
      (arrow.from === "a" && arrow.to === "b") || (arrow.from === "b" && arrow.to === "a"),
  );
  assert.equal(pair.length, 3);
  assert.equal(pair.filter((arrow) => arrow.pairFirst).length, 1);
  // The arrow going the other way uses the other side of its own line, so every arrow of the
  // pair leaves its from-bubble on the same physical side of the pair.
  assert.deepEqual(
    pair.map((arrow) => arrow.bend).sort((left, right) => left - right),
    [0.18, 0.3, 0.42],
  );
});

test("the curve takes the free side when a bubble sits on the other one", () => {
  const from = { x: 20, y: 50, r: 5 };
  const to = { x: 80, y: 50, r: 5 };
  const distance = 60;
  // Side 1 of a left-to-right arrow bends below the line; this bubble sits where that
  // curve would run, so the line has to go over it.
  const below = { x: 50, y: 50 + 0.5 * 0.18 * distance, r: 6 };
  assert.equal(arrowSide(from, to, [below]), -1);

  // With nothing in the way, an even choice bends away from the middle of the frame: this
  // pair sits above and left of the centre, so the line bows upwards for them.
  assert.equal(arrowSide({ x: 20, y: 20, r: 5 }, { x: 60, y: 20, r: 5 }, []), -1);
});

test("deals of one kind merge, and a null amount counts as zero", () => {
  const arrows = arrowsOn(day(45), companies, values, deals, layout);
  const investment = arrows.find(
    (arrow) => arrow.from === "a" && arrow.to === "b" && arrow.kind === "investment",
  )!;
  assert.equal(investment.count, 1);
  assert.equal(investment.amount_usd_bn, 1);
  assert.equal(investment.amountKnown, true);
});

test("totalOn sums the values shown on the day", () => {
  assert.equal(totalOn(day(0), companies, values, deals, layout), 100);
  assert.equal(totalOn(LAST, companies, values, deals, layout), 400 + 225 + 9);
  // "a" grew from 100 to 400 over 63 days, so on day 10 it is part of the way there.
  const partway = 100 + (300 * 10) / 63;
  assert.ok(Math.abs(totalOn(day(10), companies, values, deals, layout) - (partway + 100)) < 1e-9);
});

test("four years and twenty companies lay out well under half a second", () => {
  const many: Company[] = [];
  const points: ValuePoint[] = [];
  const links: Deal[] = [];
  for (let index = 0; index < 20; index += 1) {
    const id = `company-${index}`;
    many.push({ id, name: id, kind: "listed", first_mention: day(index * 20), source });
    for (let year = 0; year <= 4; year += 1) {
      points.push({
        company: id,
        date: day(Math.min(index * 20, 1460) + year * 91),
        value_usd_bn: 100 * (index + 1) * (1 + year * 0.25),
        what: "round",
        source,
      });
    }
    if (index > 0) {
      links.push({
        id: `deal-${index}`,
        date: day(index * 20),
        from: `company-${index - 1}`,
        to: id,
        kind: "investment",
        amount_usd_bn: 1,
        amount_type: "paid",
        title: "one",
        source,
      });
    }
  }

  const started = performance.now();
  const big = dayLayouts(many, points, links, day(1460));
  const elapsed = performance.now() - started;
  assert.equal(big.days.size, 1461);
  console.log(`    four years, 20 companies: ${elapsed.toFixed(0)}ms`);
  assert.ok(elapsed < 500, `the layout took ${elapsed.toFixed(0)}ms, not well under 500ms`);
});
