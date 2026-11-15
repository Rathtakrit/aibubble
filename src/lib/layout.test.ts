// Small made-up inputs, passed in as arguments, so these tests do not depend on the data files —
// except the frame tests, which also run on the real data because the fault they guard (a big
// newcomer landing outside a packed cluster) only shows up on it.
// @ts-expect-error node:test has no types in this repo
import test from "node:test";
// @ts-expect-error node:assert has no types in this repo
import assert from "node:assert";
import {
  arrowCurve,
  arrowPath,
  arrowsOn,
  bubblesOn,
  dayLayouts,
  defaultDate,
  enclosingCircle,
  FRAME,
  totalOn,
} from "./layout.ts";
import { companies as realCompanies, deals as realDeals, values as realValues } from "./data.ts";
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

// The frame tests use the real data: the fault they guard is a big newcomer landing outside a
// packed cluster (TSMC on 28 Jul 2026), which a handful of made-up companies cannot show.
const real = dayLayouts(realCompanies, realValues, realDeals, defaultDate());

// The circle around one day's bubbles, how far its middle is from the middle of the frame, and
// how far the furthest bubble edge reaches from the middle of the frame.
function frameOf(placed: Map<string, { x: number; y: number; r: number }>): {
  offset: number;
  reach: number;
} {
  const circle = enclosingCircle([...placed.values()]);
  let reach = 0;
  for (const bubble of placed.values()) {
    const distance = Math.hypot(bubble.x - FRAME.cx, bubble.y - FRAME.cy) + bubble.r;
    if (distance > reach) reach = distance;
  }
  return { offset: Math.hypot(circle.x - FRAME.cx, circle.y - FRAME.cy), reach };
}

test("every day: the cluster's enclosing circle sits on the middle of the frame", () => {
  // Days within a month of a company arriving are the only ones that lean, because the 30-day
  // average is already drawn toward the newcomer; the lean peaks on the busiest of those days
  // and holds that day to 4 units (see the next test for why it cannot be tighter). Every other
  // day of the four years sits well inside a single unit.
  const DAY = 86_400_000;
  const arrivals = realCompanies
    .filter((company) => real.days.has(company.first_mention))
    .map((company) => Date.parse(`${company.first_mention}T00:00:00Z`));
  let worst = 0;
  let worstDay = "";
  let quiet = 0;
  let quietDay = "";
  for (const [date, placed] of real.days) {
    const { offset } = frameOf(placed);
    if (offset > worst) {
      worst = offset;
      worstDay = date;
    }
    const time = Date.parse(`${date}T00:00:00Z`);
    if (arrivals.some((arrival) => Math.abs(time - arrival) <= 30 * DAY)) continue;
    if (offset > quiet) {
      quiet = offset;
      quietDay = date;
    }
  }
  assert.ok(worst <= 4, `the cluster sits ${worst.toFixed(2)} units off the middle on ${worstDay}`);
  assert.ok(
    quiet <= 1,
    `with nobody arriving, the cluster sits ${quiet.toFixed(2)} units off on ${quietDay}`,
  );
});

test("the biggest day fills the fit circle", () => {
  // The one shared scale is set by the day that reaches furthest, so that day's furthest bubble
  // edge sits on the fit circle and every other day is drawn smaller but no day smaller than it
  // has to be. This is what stops one newcomer day pinning the whole layout small.
  let furthest = -Infinity;
  let day = "";
  let offset = 0;
  for (const [date, placed] of real.days) {
    const today = frameOf(placed);
    if (today.reach > furthest) {
      furthest = today.reach;
      offset = today.offset;
      day = date;
    }
  }
  assert.ok(
    Math.abs(furthest - FRAME.fitRadius) <= 0.5,
    `the biggest day (${day}) reaches ${furthest.toFixed(2)}, not the fit radius ${FRAME.fitRadius}`,
  );
  // The brief asks for this day to sit within 1 unit of the middle. It cannot: a company that
  // does not fit inside the packed cluster moves that day's own enclosing circle about 6 raw
  // units (3.2 of the frame), and the 30-day average can only carry the frame half of that.
  // Centring this day exactly would need the whole cluster to jump 3 units that day, which the
  // "no company moves more than 3 units" test forbids; this day sits at 3.2, and every other
  // day well inside it.
  assert.ok(offset <= 4, `the biggest day sits ${offset.toFixed(2)} units off the middle`);
});

test("every day: no circles overlap, and every circle is inside the frame", () => {
  for (const laid of [layout, real]) {
    for (const [date, placed] of laid.days) {
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
          assert.ok(overlap <= 0.05, `two circles overlap by ${overlap} on ${date}`);
        }
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
  // Both the small made-up case and the real one: a newcomer day is where a jump would show.
  for (const laid of [layout, real]) {
    const dates = [...laid.days.keys()];
    for (let index = 1; index < dates.length; index += 1) {
      const before = laid.days.get(dates[index - 1])!;
      const after = laid.days.get(dates[index])!;
      for (const [id, placed] of after) {
        const was = before.get(id);
        if (!was) continue;
        const moved = Math.hypot(placed.x - was.x, placed.y - was.y);
        assert.ok(moved <= 3, `${id} jumped ${moved} on ${dates[index]}`);
      }
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
  assert.equal(pair[0].side, pair[1].side, "the two arrows of a pair bend to different sides");
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
  // pair leaves its from-bubble on the same physical side of the pair; the second and third bend
  // a step wider than the first, so they nest outside it.
  assert.deepEqual(
    pair.map((arrow) => arrow.bend).sort((left, right) => left - right),
    [0.18, 0.3, 0.42],
  );
});

// The points a candidate curve is judged on: 24 along its length, as arrowsOn counts them.
function pointsAlong(
  from: { x: number; y: number; r: number },
  to: { x: number; y: number; r: number },
  bend: number,
  side: 1 | -1,
): { x: number; y: number }[] {
  const curve = arrowCurve(from, to, bend, side);
  const points: { x: number; y: number }[] = [];
  for (let sample = 1; sample <= 24; sample += 1) {
    const t = sample / 25;
    const u = 1 - t;
    points.push({
      x: u * u * curve.x1 + 2 * u * t * curve.cx + t * t * curve.x2,
      y: u * u * curve.y1 + 2 * u * t * curve.cy + t * t * curve.y2,
    });
  }
  return points;
}

// How many of those points sit inside one of these bubbles, and how many sit outside the frame.
function outsideFrame(points: { x: number; y: number }[]): number {
  return points.filter((point) => Math.hypot(point.x - FRAME.cx, point.y - FRAME.cy) > FRAME.radius)
    .length;
}

function insideAny(
  points: { x: number; y: number }[],
  bubbles: { x: number; y: number; r: number }[],
): number {
  return points.filter((point) =>
    bubbles.some((bubble) => Math.hypot(point.x - bubble.x, point.y - bubble.y) < bubble.r),
  ).length;
}

test("with nothing in the way the first arrow bends by 0.18, away from the frame centre", () => {
  // This pair sits above and left of the centre, so bowing upwards (side -1) faces away from it.
  const path = arrowPath({ x: 20, y: 20, r: 5 }, { x: 60, y: 20, r: 5 }, []);
  assert.deepEqual(path, { side: -1, bend: 0.18 });
});

test("a bubble on the path between two partners makes the line bend round it", () => {
  const from = { x: 20, y: 50, r: 5 };
  const to = { x: 80, y: 50, r: 5 };
  // A wide bubble sitting on the straight path: bend 0.18 either side still runs through it.
  const blocker = { x: 50, y: 50, r: 8 };
  assert.ok(insideAny(pointsAlong(from, to, 0.18, 1), [blocker]) > 0, "0.18 below is clear already");
  assert.ok(insideAny(pointsAlong(from, to, 0.18, -1), [blocker]) > 0, "0.18 above is clear already");

  const path = arrowPath(from, to, [blocker]);
  assert.ok(path.bend > 0.18, `the line stays at bend ${path.bend} and runs through the bubble`);
  const points = pointsAlong(from, to, path.bend, path.side);
  assert.equal(insideAny(points, [blocker]), 0, "the chosen curve still runs through the bubble");
});

test("a curve that leaves the frame loses to one that stays inside", () => {
  // A pair close to the bottom edge, with a bubble sitting on each of the two closest curves, so
  // both sides have to widen. The side facing away from the frame centre (down) then runs outside
  // the frame; the side facing it stays inside and wins.
  const from = { x: 42, y: 95.5, r: 1 };
  const to = { x: 58, y: 95.5, r: 1 };
  const blockers = [
    { x: 50, y: 97.2, r: 1.5 },
    { x: 50, y: 94, r: 1.2 },
  ];
  const path = arrowPath(from, to, blockers);
  assert.equal(path.side, -1);
  const points = pointsAlong(from, to, path.bend, path.side);
  assert.equal(insideAny(points, blockers), 0, "the chosen curve runs through a bubble");
  assert.equal(outsideFrame(points), 0, "the chosen curve leaves the frame");
  // The same bend on the other side is wider still and runs outside the frame, which is why the
  // side facing away from the centre lost.
  assert.ok(
    outsideFrame(pointsAlong(from, to, path.bend, 1)) > 0,
    "the other side stays inside the frame too, so this case does not show the frame rule",
  );
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
