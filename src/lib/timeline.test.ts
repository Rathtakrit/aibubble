// Small made-up inputs, passed in as arguments, so these tests do not depend on the data files.
// @ts-expect-error node:test has no types in this repo
import test from "node:test";
// @ts-expect-error node:assert has no types in this repo
import assert from "node:assert";
import {
  dayIndex,
  dateAt,
  dayLabel,
  dayPercent,
  inDateOrder,
  latestOnOrBefore,
  neighbour,
  pillKind,
  siteName,
} from "./timeline.ts";

const source = "https://example.com/sample";

type Item = { id: string; date: string };

const items: Item[] = [
  { id: "c", date: "2020-06-01" },
  { id: "a", date: "2020-01-01" },
  { id: "d", date: "2021-01-01" },
  { id: "b", date: "2020-06-01" },
];

test("dayIndex counts days from 12 June 2017", () => {
  assert.equal(dayIndex("2017-06-12"), 0);
  assert.equal(dayIndex("2017-06-13"), 1);
  assert.equal(dayIndex("2018-06-12"), 365);
  assert.equal(dayIndex("2017-06-11"), -1);
});

test("dateAt turns a day count back into a date", () => {
  assert.equal(dateAt(0), "2017-06-12");
  assert.equal(dateAt(1), "2017-06-13");
  assert.equal(dateAt(365), "2018-06-12");
  for (const date of ["2017-06-12", "2020-02-29", "2026-11-12"]) {
    assert.equal(dateAt(dayIndex(date)), date);
  }
});

test("the first day sits at 0% and the last day at 100%", () => {
  assert.equal(dayPercent("2017-06-12", "2026-11-12"), 0);
  assert.equal(dayPercent("2026-11-12", "2026-11-12"), 100);
  const half = dayPercent("2022-03-11", "2026-11-12");
  assert.ok(half > 45 && half < 55, `the middle of the span is ${half}%`);
});

test("a day before the start or after the end stays inside 0..100", () => {
  assert.equal(dayPercent("2016-01-01", "2026-11-12"), 0);
  assert.equal(dayPercent("2030-01-01", "2026-11-12"), 100);
});

test("dates in words use the day, short month and year", () => {
  assert.equal(dayLabel("2025-01-27"), "27 Jan 2025");
  assert.equal(dayLabel("2017-06-12"), "12 Jun 2017");
});

test("the source line shows the site name without www", () => {
  assert.equal(siteName("https://arxiv.org/abs/1706.03762"), "arxiv.org");
  assert.equal(siteName("https://www.bbc.co.uk/news/articles/c8j13m74lklo"), "bbc.co.uk");
  assert.equal(siteName("not a web address"), "not a web address");
});

test("items come out oldest first, same-day items by id", () => {
  assert.deepEqual(
    inDateOrder(items).map((item) => item.id),
    ["a", "b", "c", "d"],
  );
});

test("the latest item on or before a day is found", () => {
  assert.equal(latestOnOrBefore(items, "2019-12-31"), null);
  assert.equal(latestOnOrBefore(items, "2020-01-01")?.id, "a");
  assert.equal(latestOnOrBefore(items, "2020-05-31")?.id, "a");
  assert.equal(latestOnOrBefore(items, "2020-06-01")?.id, "c");
  assert.equal(latestOnOrBefore(items, "2020-12-31")?.id, "c");
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
  const science = { date: "2017-06-12", players: ["alphabet"], kind: "science" as const };
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
