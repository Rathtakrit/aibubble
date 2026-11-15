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

// Four dots in March 2025 and none in April, so the two months can be measured against each other.
const busyDots: Item[] = [
  { id: "m1", date: "2025-03-03" },
  { id: "m2", date: "2025-03-10" },
  { id: "m3", date: "2025-03-17" },
  { id: "m4", date: "2025-03-24" },
];

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
  const scale = timelineScale(last, busyDots);
  assert.equal(scale.percentOf("2022-11-30"), 0);
  assert.equal(scale.percentOf(last), 100);
});

test("a day before the start or after the end stays inside 0..100", () => {
  const scale = timelineScale(last, busyDots);
  assert.equal(scale.percentOf("2016-01-01"), 0);
  assert.equal(scale.percentOf("2030-01-01"), 100);
});

test("the days of the scale always move forward", () => {
  const scale = timelineScale(last, busyDots);
  let before = -1;
  for (let index = 0; index <= dayIndex(last); index += 1) {
    const percent = scale.percentOf(dateAt(index));
    assert.ok(percent > before, `${dateAt(index)} sits at ${percent}%, after ${before}%`);
    before = percent;
  }
});

test("a month with four dots is seven times as wide as a month with none", () => {
  const scale = timelineScale(last, busyDots);
  // A month's width on the line: the place of the next month's first day less this month's.
  const widthOf = (first: string, next: string) => scale.percentOf(next) - scale.percentOf(first);
  const busy = widthOf("2025-03-01", "2025-04-01");
  const empty = widthOf("2025-04-01", "2025-05-01");
  assert.ok(busy > 0 && empty > 0);
  assert.ok(Math.abs(busy / empty - 7) < 0.01, `busy is ${busy / empty} times the empty month`);
});

test("percent to date and back gives the same day for every day in the range", () => {
  const scale = timelineScale(last, busyDots);
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

test("labels sit on three heights and the overlapping ones are left out", () => {
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
  // "a" takes the height nearest the line, "b" the one above it, "c" the one above that,
  // and "d" has no room on any of the three.
  assert.equal(placed.get("a")?.row, 0);
  assert.equal(placed.get("b")?.row, 1);
  assert.equal(placed.get("c")?.row, 2);
  assert.equal(placed.has("d"), false);
  // Far enough apart: the height nearest the line again, centred on its date.
  assert.equal(placed.get("e")?.row, 0);
  assert.equal(placed.get("e")?.align, "center");
  // A label near the right end is pushed in so it stays on the line.
  assert.equal(placed.get("f")?.align, "end");
});

test("four close dates: the fourth has nowhere to go and is left out", () => {
  const placed = placeLabels(
    [
      { id: "one", percent: 20, width: 120 },
      { id: "two", percent: 23, width: 120 },
      { id: "three", percent: 26, width: 120 },
      { id: "four", percent: 29, width: 120 },
    ],
    800,
  );
  assert.equal(placed.get("one")?.row, 0);
  assert.equal(placed.get("two")?.row, 1);
  assert.equal(placed.get("three")?.row, 2);
  assert.equal(placed.has("four"), false);
});

test("an end-aligned label at the right edge is measured from its own left edge", () => {
  const placed = placeLabels(
    [
      // A short label at 75% sits on 720..780px.
      { id: "before", percent: 75, width: 60 },
      // At 97% a 200px label is lined up with the end of the line, so it really starts at 770px.
      { id: "edge", percent: 97, width: 200 },
    ],
    1000,
  );
  assert.equal(placed.get("before")?.row, 0);
  assert.equal(placed.get("edge")?.align, "end");
  // Its box runs 770..970, which covers the one below it, so it takes the higher height.
  assert.equal(placed.get("edge")?.row, 1);
});
