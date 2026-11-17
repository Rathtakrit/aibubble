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
  neighbour,
  pillKind,
  placeLabels,
  publisherName,
  siteName,
  timelineScale,
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

test("timeline zoom centres unequal neighbours and excludes other events", () => {
  const events = inDateOrder([...busyDots, ...smallDots]);
  const scale = timelineScale(last, dots);
  const window = timelineWindow(events, "m4", scale);
  assert.deepEqual(window.ids, ["m3", "m4", "s1"]);
  assert.equal(windowPercent(scale.percentOf("2025-03-24"), window), 50);
  for (const id of window.ids) {
    const event = events.find((item) => item.id === id)!;
    const percent = scale.percentOf(event.date);
    const position = windowPercent(percent, window);
    assert.ok(position > 0 && position < 100);
    assert.ok(Math.abs(windowPlace(position, window) - percent) < 1e-10);
  }
});

test("timeline zoom keeps the nearest three at both ends", () => {
  const events = inDateOrder([...busyDots, ...smallDots]);
  const scale = timelineScale(last, dots);
  for (const id of ["m1", "s2"]) {
    const window = timelineWindow(events, id, scale);
    assert.equal(window.ids.length, 3);
    assert.ok(window.ids.includes(id));
    const selected = events.find((item) => item.id === id)!;
    assert.ok(windowPercent(scale.percentOf(selected.date), window) > 0);
    assert.ok(windowPercent(scale.percentOf(selected.date), window) < 100);
  }
});

test("timeline zoom handles coincident dates and short or empty lists", () => {
  const scale = timelineScale(last, dots);
  for (const events of [[], items.slice(0, 1), items.filter((item) => item.date === "2023-06-01")]) {
    const window = timelineWindow(events, events[0]?.id ?? "missing", scale);
    assert.ok(window.start < window.middle && window.middle < window.end);
    for (const event of events) assert.ok(Number.isFinite(windowPercent(scale.percentOf(event.date), window)));
  }
});
