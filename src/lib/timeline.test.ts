// Small made-up inputs, passed in as arguments, so these tests do not depend on the data files.
// @ts-expect-error node:test has no types in this repo
import test from "node:test";
// @ts-expect-error node:assert has no types in this repo
import assert from "node:assert";
import {
  dayIndex,
  dateAt,
  dayLabel,
  inDateOrder,
  latestOnOrBefore,
  monthYear,
  neighbour,
  pillKind,
  placeLabels,
  publisherName,
  siteName,
  snapToItemDateRange,
  stepDateLabel,
  timelineScale,
  timelineStrip,
  timelineWindow,
  windowPercent,
  windowPlace,
} from "./timeline.ts";

const source = "https://example.com/sample";
const last = "2026-11-12";

type Item = { id: string; date: string };

const items: Item[] = [
  { id: "c", date: "2023-06-01" },
  { id: "a", date: "2023-01-01" },
  { id: "d", date: "2024-01-01" },
  { id: "b", date: "2023-06-01" },
];

// Four red key dates in March 2025 and none in April, and two blue smaller events in June 2025 and
// none in July, so the months can be measured against each other.
const busyDots: Item[] = [
  { id: "m1", date: "2025-03-03" },
  { id: "m2", date: "2025-03-10" },
  { id: "m3", date: "2025-03-17" },
  { id: "m4", date: "2025-03-24" },
];

const smallDots: Item[] = [
  { id: "s1", date: "2025-06-03" },
  { id: "s2", date: "2025-06-10" },
];

const dots = { red: busyDots, blue: smallDots };

test("dayIndex counts days from 30 November 2022", () => {
  assert.equal(dayIndex("2022-11-30"), 0);
  assert.equal(dayIndex("2022-12-01"), 1);
  assert.equal(dayIndex("2023-11-30"), 365);
  assert.equal(dayIndex("2022-11-29"), -1);
});

test("dateAt turns a day count back into a date", () => {
  assert.equal(dateAt(0), "2022-11-30");
  assert.equal(dateAt(1), "2022-12-01");
  assert.equal(dateAt(366), "2023-12-01");
  for (const date of ["2022-11-30", "2024-02-29", "2026-11-12"]) {
    assert.equal(dateAt(dayIndex(date)), date);
  }
});

test("dates outside the news range snap to the first or last item", () => {
  const first = "2003-03-04";
  const last = "2009-06-30";
  assert.equal(snapToItemDateRange("2003-01-01", first, last), first);
  assert.equal(snapToItemDateRange("2009-12-31", first, last), last);
  for (const date of [first, "2003-03-05", last]) {
    assert.equal(snapToItemDateRange(date, first, last), date);
  }
});

test("the whole-range strip maps dates and a zoom bracket in calendar time", () => {
  const strip = timelineStrip("2017-06-12", "2017-06-22");
  assert.equal(strip.percentOf("2017-06-12"), 0);
  assert.equal(strip.percentOf("2017-06-17"), 50);
  assert.equal(strip.percentOf("2017-06-22"), 100);
  assert.equal(strip.dateOf(50), "2017-06-17");
  assert.deepEqual(strip.bracket("2017-06-14", "2017-06-20"), { left: 20, width: 60 });
  assert.deepEqual(strip.bracket("2017-06-01", "2017-07-01"), { left: 0, width: 100 });
  const window = timelineWindow(busyDots, "m2");
  const overview = timelineStrip("2017-06-12", last);
  assert.deepEqual(overview.bracket(window[0].date, window[window.length - 1].date),
    overview.bracket("2025-03-03", "2025-03-24"));
});

test("the first day of the scale sits at 0% and the last at 100%", () => {
  const scale = timelineScale(last, dots);
  assert.equal(scale.percentOf("2022-11-30"), 0);
  assert.equal(scale.percentOf(last), 100);
});

test("a day before the start or after the end stays inside 0..100", () => {
  const scale = timelineScale(last, dots);
  assert.equal(scale.percentOf("2016-01-01"), 0);
  assert.equal(scale.percentOf("2030-01-01"), 100);
});

test("the days of the scale always move forward", () => {
  const scale = timelineScale(last, dots);
  let before = -1;
  for (let index = 0; index <= dayIndex(last); index += 1) {
    const percent = scale.percentOf(dateAt(index));
    assert.ok(percent > before, `${dateAt(index)} sits at ${percent}%, after ${before}%`);
    before = percent;
  }
});

test("a busy month is far wider than a whole year with no dots, and two red dots already pass it", () => {
  // Four red dots in one month weigh 0.15 + 4 x 1.5 = 6.15; a year of empty months weighs
  // 12 x 0.15 = 1.8. Two red dots weigh 3.15, which already passes the empty year.
  const scale = timelineScale(last, { red: busyDots, blue: [] });
  const year = scale.percentOf("2025-01-01") - scale.percentOf("2024-01-01");
  const month = scale.percentOf("2025-04-01") - scale.percentOf("2025-03-01");
  assert.ok(year > 0 && month > 0);
  assert.ok(month > year, `the busy month is ${month}% wide, the empty year ${year}%`);

  const two = timelineScale(last, {
    red: [
      { id: "r1", date: "2025-03-03" },
      { id: "r2", date: "2025-03-10" },
    ],
    blue: [],
  });
  const twoRedMonth = two.percentOf("2025-04-01") - two.percentOf("2025-03-01");
  assert.ok(twoRedMonth > year, `two red dots give ${twoRedMonth}% of an ${year}% year`);
});

test("a year with no dots is narrower than one month with two red dots", () => {
  const scale = timelineScale(last, {
    red: [
      { id: "r1", date: "2025-03-03" },
      { id: "r2", date: "2025-03-10" },
    ],
    blue: [],
  });
  const year = scale.percentOf("2025-01-01") - scale.percentOf("2024-01-01");
  const twoRedMonth = scale.percentOf("2025-04-01") - scale.percentOf("2025-03-01");
  assert.ok(year > 0 && twoRedMonth > 0);
  assert.ok(
    year < twoRedMonth,
    `the empty year is ${year}% wide and the month with two red dots ${twoRedMonth}%`,
  );
});

test("a month with four red dots is 41 times as wide as a month with none", () => {
  const scale = timelineScale(last, dots);
  // A month's width on the line: the place of the next month's first day less this month's.
  const widthOf = (first: string, next: string) => scale.percentOf(next) - scale.percentOf(first);
  const busy = widthOf("2025-03-01", "2025-04-01");
  const empty = widthOf("2025-04-01", "2025-05-01");
  assert.ok(busy > 0 && empty > 0);
  assert.ok(Math.abs(busy / empty - 41) < 0.01, `busy is ${busy / empty} times the empty month`);
});

test("a blue dot earns half the room a red one does", () => {
  const scale = timelineScale(last, dots);
  const widthOf = (first: string, next: string) => scale.percentOf(next) - scale.percentOf(first);
  const blue = widthOf("2025-06-01", "2025-07-01");
  const empty = widthOf("2025-07-01", "2025-08-01");
  assert.ok(blue > 0 && empty > 0);
  assert.ok(Math.abs(blue / empty - 11) < 0.01, `the two-blue month is ${blue / empty} times an empty one`);
});

test("percent to date and back gives the same day for every day in the range", () => {
  const scale = timelineScale(last, dots);
  for (let index = 0; index <= dayIndex(last); index += 1) {
    const date = dateAt(index);
    assert.equal(scale.dateOf(scale.percentOf(date)), date);
  }
  // The ends too, and anything outside them.
  assert.equal(scale.dateOf(0), "2022-11-30");
  assert.equal(scale.dateOf(100), last);
  assert.equal(scale.dateOf(-5), "2022-11-30");
  assert.equal(scale.dateOf(120), last);
});

test("dates in words use the day, short month and year", () => {
  assert.equal(dayLabel("2025-01-27"), "27 Jan 2025");
  assert.equal(dayLabel("2022-11-30"), "30 Nov 2022");
});

test("the short date uses a two-digit month and year", () => {
  assert.equal(monthYear("2002-10-09"), "10/02");
  assert.equal(monthYear("2022-11-30"), "11/22");
  assert.equal(monthYear("2025-01-05"), "01/25");
});

test("the source line shows the site name without www", () => {
  assert.equal(siteName("https://arxiv.org/abs/1706.03762"), "arxiv.org");
  assert.equal(siteName("https://www.bbc.co.uk/news/articles/c8j13m74lklo"), "bbc.co.uk");
  assert.equal(siteName("not a web address"), "not a web address");
});

test("the source line shows the publisher's name, or the host when unknown", () => {
  assert.equal(publisherName("https://www.forbes.com/sites/someone/2026/11/11/story"), "Forbes");
  assert.equal(publisherName("https://www.bbc.co.uk/news/articles/c8j13m74lklo"), "BBC");
  assert.equal(publisherName("https://techcrunch.com/2026/10/01/story"), "TechCrunch");
  // A host with a www. is looked up without it.
  assert.equal(publisherName("https://www.reuters.com/technology/story"), "Reuters");
  // An unknown host falls back to the host itself.
  assert.equal(publisherName("https://example.com/story"), "example.com");
  assert.equal(publisherName("not a web address"), "not a web address");
});

test("items come out oldest first, same-day items by id", () => {
  assert.deepEqual(
    inDateOrder(items).map((item) => item.id),
    ["a", "b", "c", "d"],
  );
});

test("the latest item on or before a day is found", () => {
  assert.equal(latestOnOrBefore(items, "2022-12-31"), null);
  assert.equal(latestOnOrBefore(items, "2023-01-01")?.id, "a");
  assert.equal(latestOnOrBefore(items, "2023-05-31")?.id, "a");
  assert.equal(latestOnOrBefore(items, "2023-06-01")?.id, "c");
  assert.equal(latestOnOrBefore(items, "2023-12-31")?.id, "c");
  assert.equal(latestOnOrBefore(items, "2026-01-01")?.id, "d");
});

test("earlier and later walk the items in date order and stop at the ends", () => {
  assert.equal(neighbour(items, "a", 1)?.id, "b");
  assert.equal(neighbour(items, "b", 1)?.id, "c");
  assert.equal(neighbour(items, "c", 1)?.id, "d");
  assert.equal(neighbour(items, "d", 1), null);
  assert.equal(neighbour(items, "d", -1)?.id, "c");
  assert.equal(neighbour(items, "a", -1), null);
  assert.equal(neighbour(items, "not-there", 1), null);
});

test("science news shows Science, money news the kind of its deal", () => {
  const deals = [
    {
      id: "d1",
      date: "2023-09-25",
      from: "amazon",
      to: "anthropic",
      kind: "investment" as const,
      amount_usd_bn: 4,
      amount_type: "up to" as const,
      title: "one",
      source,
    },
    {
      id: "d2",
      date: "2025-09-10",
      from: "openai",
      to: "oracle",
      kind: "cloud" as const,
      amount_usd_bn: null,
      amount_type: "reported" as const,
      title: "two",
      source,
    },
  ];
  const science = { date: "2022-11-30", players: ["openai"], kind: "science" as const };
  const investment = { date: "2023-09-25", players: ["amazon", "anthropic"], kind: "money" as const };
  const cloud = { date: "2025-09-10", players: ["oracle", "openai"], kind: "money" as const };
  const plain = { date: "2026-10-13", players: ["nvidia"], kind: "money" as const };
  const otherDay = { date: "2023-09-26", players: ["amazon", "anthropic"], kind: "money" as const };

  assert.equal(pillKind(science, deals), "science");
  assert.equal(pillKind(investment, deals), "investment");
  assert.equal(pillKind(cloud, deals), "cloud");
  assert.equal(pillKind(plain, deals), "money");
  // Right players, wrong day: the deal is not on that day.
  assert.equal(pillKind(otherDay, deals), "money");
});

test("phone step dates distinguish events in the same month", () => {
  assert.equal(stepDateLabel("2009-03-10"), "10 Mar");
  assert.equal(stepDateLabel("2009-03-18"), "18 Mar");
  assert.equal(stepDateLabel("2009-03-01"), "1 Mar");
});

test("label boxes stay eight pixels apart and clear the reserved flag", () => {
  const boxes = Array.from({ length: 6 }, (_, index) => ({
    id: String(index), percent: 50, width: 100, height: 20,
  }));
  const flag = { left: 150, right: 250, top: 36, bottom: 56 };
  const bands = { above: [60, 28] as const, below: [90, 118] as const, height: 140, reserved: [flag] };
  const placed = placeLabels(boxes, 400, bands);
  assert.equal(placed.size, 3);
  assert.equal(placed.get("0")?.row, 1);
  const occupied = [flag];
  for (const box of boxes) {
    const spot = placed.get(box.id);
    if (!spot) continue;
    const edge = bands[spot.side][spot.row];
    const top = spot.side === "above" ? edge - box.height : edge;
    const left = 400 * box.percent / 100 - box.width / 2 + spot.shift;
    const rect = { left, right: left + box.width, top, bottom: top + box.height };
    for (const other of occupied) {
      assert.ok(rect.left >= other.right + 8 || rect.right <= other.left - 8 ||
        rect.top >= other.bottom + 8 || rect.bottom <= other.top - 8);
    }
    occupied.push(rect);
  }
});

test("labels alternate sides and use the second height before hiding", () => {
  const placed = placeLabels(
    [
      { id: "a", percent: 10, width: 80 },
      { id: "b", percent: 12, width: 80 },
      { id: "c", percent: 14, width: 80 },
      { id: "d", percent: 16, width: 80 },
      { id: "e", percent: 40, width: 80 },
      { id: "f", percent: 97, width: 80 },
    ],
    1000,
  );
  assert.equal(placed.get("a")?.side, "above");
  assert.equal(placed.get("b")?.side, "below");
  assert.equal(placed.get("a")?.row, 0);
  assert.equal(placed.get("b")?.row, 0);
  assert.equal(placed.get("c")?.row, 1);
  assert.equal(placed.get("d")?.row, 1);
  assert.equal(placed.size, 6);
  // Far enough apart: the height nearest the line again, centred on its date.
  assert.equal(placed.get("e")?.row, 0);
  assert.equal(placed.get("e")?.align, "center");
  // A label near the right end is pushed in so it stays on the line.
  assert.equal(placed.get("f")?.align, "end");
});

test("five close red dates alternate sides and none is hidden", () => {
  const placed = placeLabels(
    [
      { id: "one", percent: 20, width: 120 },
      { id: "two", percent: 25, width: 120 },
      { id: "three", percent: 30, width: 120 },
      { id: "four", percent: 35, width: 120 },
      { id: "five", percent: 40, width: 120 },
    ],
    800,
  );
  assert.equal(placed.size, 5);
  assert.deepEqual([...placed.values()].map((spot) => spot.side), ["above", "below", "above", "below", "above"]);
  assert.deepEqual([...placed.values()].map((spot) => spot.row), [0, 0, 1, 1, 0]);
});

test("only a third overlapping label on the same side is hidden, without changing alternation", () => {
  const placed = placeLabels(
    Array.from({ length: 6 }, (_, index) => ({ id: String(index), percent: 50, width: 120 })),
    800,
  );
  assert.equal(placed.size, 4);
  assert.equal(placed.has("4"), false);
  assert.equal(placed.has("5"), false);
  assert.deepEqual([...placed.values()].map((spot) => spot.side), ["above", "below", "above", "below"]);
});

test("labels are centred where possible and clamped exactly at both edges", () => {
  const placed = placeLabels([
    { id: "right", percent: 99, width: 120 },
    { id: "middle", percent: 50, width: 120 },
    { id: "left", percent: 1, width: 120 },
  ], 800);
  assert.equal(placed.get("left")?.shift, -8);
  assert.equal(placed.get("middle")?.shift, 0);
  assert.equal(placed.get("right")?.shift, 8);
  assert.deepEqual([...placed.keys()], ["left", "middle", "right"]);
  assert.equal(placeLabels([], 0).size, 0);
});

test("an end-aligned label at the right edge is measured from its own left edge", () => {
  const placed = placeLabels(
    [
      // A short label at 75% sits on 720..780px.
      { id: "before", percent: 75, width: 60 },
      // At 97% a 200px label must move inward to finish at the container edge.
      { id: "edge", percent: 97, width: 200 },
    ],
    1000,
  );
  assert.equal(placed.get("before")?.row, 0);
  assert.equal(placed.get("edge")?.align, "end");
  // Clamped to 800..1000, on the opposite side from the preceding label.
  assert.equal(placed.get("edge")?.shift, 30);
  assert.equal(placed.get("edge")?.side, "below");
  assert.equal(placed.get("edge")?.row, 0);
});

const clusteredEvents = [
  ...Array.from({ length: 6 }, (_, index) => ({ id: `c${index}`, date: `2025-03-0${index + 1}` })),
  { id: "c6", date: "2025-05-06" },
];

test("neighbouring zoom dots are at least 10 percentage points apart even across uneven dates", () => {
  const window = timelineWindow(clusteredEvents, "c3");
  const places = clusteredEvents.map(({ date }) => windowPercent(date, window));
  assert.equal(places[3], 50);
  for (let index = 1; index < places.length; index += 1) {
    const gap = places[index] - places[index - 1];
    assert.ok(gap >= 10, `dots ${index - 1} and ${index} are only ${gap}% apart`);
  }
});

test("zoom scrubbing follows calendar days between dot positions", () => {
  const window = timelineWindow(clusteredEvents, "c3");
  for (const [index, { date, percent }] of window.entries()) {
    assert.equal(percent, ((index + 0.5) / 7) * 100);
    assert.equal(windowPlace(percent, window), date);
  }
  const first = window[0];
  const end = window[6];
  const april6 = window[5].percent + (end.percent - window[5].percent) * (31 / 61);
  assert.ok(Math.abs(windowPercent("2025-04-06", window) - april6) < 1e-10);
  assert.equal(windowPlace(april6, window), "2025-04-06");
  for (let index = dayIndex(first.date); index <= dayIndex(end.date); index += 1) {
    const date = dateAt(index);
    assert.equal(windowPlace(windowPercent(date, window), window), date);
  }
  assert.equal(windowPercent("2025-02-28", window), 0);
  assert.equal(windowPercent("2025-05-07", window), 100);
  assert.equal(windowPlace(0, window), first.date);
  assert.equal(windowPlace(100, window), end.date);
});

test("timeline zoom fills a seven-item window from the other side at either end", () => {
  const events = inDateOrder(Array.from({ length: 10 }, (_, index) => ({
    id: `e${index}`, date: dateAt(index * 30),
  })));
  const first = timelineWindow(events, "e0");
  const middle = timelineWindow(events, "e5");
  const last = timelineWindow(events, "e9");
  assert.deepEqual(first.map(({ id }) => id), events.slice(0, 7).map(({ id }) => id));
  assert.deepEqual(middle.map(({ id }) => id), events.slice(2, 9).map(({ id }) => id));
  assert.deepEqual(last.map(({ id }) => id), events.slice(3).map(({ id }) => id));
  assert.equal(windowPercent(events[0].date, first), (0.5 / 7) * 100);
  assert.equal(windowPercent(events[5].date, middle), 50);
  assert.equal(windowPercent(events[9].date, last), (6.5 / 7) * 100);
});

test("timeline zoom steps and jumps by keeping the previous slot when possible", () => {
  const events = Array.from({ length: 14 }, (_, index) => ({
    id: `e${index}`, date: dateAt(index * 30),
  }));
  const first = timelineWindow(events, "e0");
  const later = timelineWindow(events, "e1", first.findIndex(({ id }) => id === "e0"));
  assert.deepEqual(later.map(({ id }) => id), events.slice(1, 8).map(({ id }) => id));
  const slot = later.findIndex(({ id }) => id === "e1");
  assert.deepEqual(timelineWindow(events, "e0", slot), first);
  const jumped = timelineWindow(events, "e4", slot);
  assert.deepEqual(jumped.map(({ id }) => id), events.slice(4, 11).map(({ id }) => id));
  assert.equal(later[3].id, jumped[0].id);
  assert.ok(later[3].percent > jumped[0].percent);
  assert.deepEqual(timelineWindow(events, "e13", slot), timelineWindow(events, "e13"));
});

test("timeline zoom handles coincident dates and short or empty lists", () => {
  const empty = timelineWindow([], "missing");
  assert.deepEqual(empty, []);
  assert.equal(windowPlace(50, empty), undefined);
  const single = timelineWindow(items, "missing");
  assert.deepEqual(single, []);
  const one = timelineWindow(items.slice(0, 1), "c");
  assert.equal(windowPercent("2023-06-01", one), 50);
  const sameDay = timelineWindow(items.filter((item) => item.date === "2023-06-01"), "b");
  assert.equal(windowPercent("2023-06-01", sameDay, "b"), 25);
  assert.equal(windowPercent("2023-06-01", sameDay, "c"), 75);
  for (const { percent, date } of sameDay) assert.equal(windowPlace(percent, sameDay), date);
});
