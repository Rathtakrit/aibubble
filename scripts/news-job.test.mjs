// Checks the pure pieces of scripts/news-job.mjs. Run with: node --test scripts/
// No network: the feeds, the model reply and the data are all made up here.

import test from "node:test";
import assert from "node:assert";
import {
  buildNewsItems,
  filterItems,
  missingGatewayVariable,
  parseFeed,
  pickDay,
  slugify,
} from "./news-job.mjs";

const DAY = "2026-11-14";

const RSS = `<?xml version="1.0"?>
<rss version="2.0"><channel>
  <item>
    <title>Round one closed</title>
    <link>https://example.test/one</link>
    <pubDate>Sat, 14 Nov 2026 10:00:00 GMT</pubDate>
    <description>&lt;b&gt;Big money&lt;/b&gt; at the lab &amp;amp; more.</description>
  </item>
  <item>
    <title>Plain address only</title>
    <link>http://insecure.test/two</link>
    <pubDate>Sat, 14 Nov 2026 11:00:00 GMT</pubDate>
    <description>Not an https link.</description>
  </item>
</channel></rss>`;

const ATOM = `<?xml version="1.0"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <entry>
    <title>Atom one</title>
    <link rel="alternate" href="https://example.test/atom-one"/>
    <updated>2026-11-14T12:00:00Z</updated>
    <summary>Short text.</summary>
  </entry>
  <entry>
    <title>Atom two</title>
    <link href="https://example.test/atom-two"/>
    <published>2026-11-13T09:00:00Z</published>
    <updated>2026-11-14T09:00:00Z</updated>
    <summary>Older item, updated the next day.</summary>
  </entry>
</feed>`;

// ---------- parsing ----------

test("parseFeed reads a small RSS feed", () => {
  const items = parseFeed(RSS, "Test RSS");
  assert.equal(items.length, 2);
  assert.deepEqual(items[0], {
    feed: "Test RSS",
    title: "Round one closed",
    link: "https://example.test/one",
    date: "2026-11-14",
    text: "Big money at the lab & more.",
  });
  assert.equal(items[1].link, "http://insecure.test/two");
});

test("parseFeed reads a small Atom feed and prefers published over updated", () => {
  const items = parseFeed(ATOM, "Test Atom");
  assert.equal(items.length, 2);
  assert.deepEqual(items[0], {
    feed: "Test Atom",
    title: "Atom one",
    link: "https://example.test/atom-one",
    date: "2026-11-14",
    text: "Short text.",
  });
  assert.equal(items[1].date, "2026-11-13");
});

test("parseFeed cuts long text to 300 characters", () => {
  const long = "x".repeat(400);
  const xml = `<?xml version="1.0"?><rss version="2.0"><channel><item>
    <title>Long</title><link>https://example.test/long</link>
    <pubDate>Sat, 14 Nov 2026 10:00:00 GMT</pubDate><description>${long}</description>
  </item></channel></rss>`;
  const [item] = parseFeed(xml, "Long feed");
  assert.equal(item.text.length, 300);
});

// ---------- the day ----------

test("pickDay takes a valid YYYY-MM-DD argument", () => {
  assert.equal(pickDay(["node", "news-job.mjs", "2026-01-02"]), "2026-01-02");
});

test("pickDay rejects a day that is not YYYY-MM-DD", () => {
  assert.throws(() => pickDay(["node", "news-job.mjs", "14 Nov 2026"]), /YYYY-MM-DD/);
});

test("pickDay falls back to the NEWS_DAY variable, then to yesterday in UTC", () => {
  assert.equal(pickDay(["node", "news-job.mjs"], { NEWS_DAY: "2026-03-04" }), "2026-03-04");
  assert.match(pickDay(["node", "news-job.mjs"], {}), /^\d{4}-\d{2}-\d{2}$/);
});

// ---------- the day filter ----------

function feedItem(overrides = {}) {
  return {
    feed: "Test feed",
    title: "A title",
    link: "https://example.test/item",
    date: DAY,
    text: "Some text.",
    ...overrides,
  };
}

test("filterItems keeps only items on the day with an https link", () => {
  const kept = filterItems(
    [
      feedItem({ link: "https://example.test/ok" }),
      feedItem({ link: "https://example.test/other-day", date: "2026-11-13" }),
      feedItem({ link: "http://insecure.test/no-tls" }),
      feedItem({ link: "", date: null }),
    ],
    DAY,
    new Set(),
  );
  assert.deepEqual(
    kept.map((item) => item.link),
    ["https://example.test/ok"],
  );
});

test("filterItems drops links that are already sources in data/news.json", () => {
  const kept = filterItems(
    [feedItem({ link: "https://example.test/known" }), feedItem({ link: "https://example.test/new" })],
    DAY,
    new Set(["https://example.test/known"]),
  );
  assert.deepEqual(
    kept.map((item) => item.link),
    ["https://example.test/new"],
  );
});

// ---------- building items from a model reply ----------

const COMPANIES = ["openai", "nvidia", "microsoft"];

const FEED_ITEMS = [
  feedItem({ link: "https://example.test/one", title: "Feed one" }),
  feedItem({ link: "https://example.test/two", title: "Feed two" }),
  feedItem({ link: "https://example.test/three", title: "Feed three" }),
];

function draft(overrides = {}) {
  return {
    n: 1,
    title: "OpenAI closes a round",
    summary: "OpenAI raised money from investors, money paid in for a share of the company.",
    players: ["openai"],
    kind: "money",
    key_date: false,
    ...overrides,
  };
}

function build(drafts, existingIds = [], feedItems = FEED_ITEMS, companies = COMPANIES) {
  return buildNewsItems({ items: drafts }, feedItems, existingIds, companies);
}

test("date and source come from the feed item, never from the reply", () => {
  const { added } = build([draft({ link: "https://wrong.test/link", date: "1999-01-01" })]);
  assert.equal(added.length, 1);
  assert.equal(added[0].date, DAY);
  assert.equal(added[0].source, "https://example.test/one");
});

test("a player id that is not in companies.json is removed", () => {
  const { added } = build([draft({ players: ["openai", "nvidia", "nope-labs"] })]);
  assert.deepEqual(added[0].players, ["openai", "nvidia"]);
});

test("a draft whose n is not a feed item is dropped", () => {
  const { added, dropped } = build([draft({ n: 99 })]);
  assert.equal(added.length, 0);
  assert.equal(dropped.length, 1);
  assert.match(dropped[0].reason, /n is not one of the feed items/);
});

test("a title over 60 characters is dropped", () => {
  const { added } = build([draft({ title: "x".repeat(61) })]);
  assert.equal(added.length, 0);
});

test("a summary containing buy or sell as a whole word is dropped", () => {
  const { added } = build([
    draft({ title: "Funding news", summary: "Analysts say now is the time to buy shares." }),
    draft({ title: "Chips deal", summary: "One company will sell chips to another." }),
    draft({ title: "Chips deal two", summary: "Buyers and sellers met, but no whole word stands alone." }),
  ]);
  assert.equal(added.length, 1);
  assert.equal(added[0].title, "Chips deal two");
});

test("a draft with an unknown kind is dropped", () => {
  const { added } = build([draft({ kind: "rumour" })]);
  assert.equal(added.length, 0);
});

test("an id clash gets a different id", () => {
  const { added } = build(
    [draft(), draft({ players: ["microsoft"] })],
    ["2026-11-14-openai-closes-a-round"],
  );
  assert.equal(added.length, 2);
  assert.notEqual(added[1].id, added[0].id);
  assert.equal(added[0].id, "2026-11-14-openai-closes-a-round-2");
  assert.equal(added[1].id, "2026-11-14-openai-closes-a-round-3");
});

test("at most 10 drafts are kept", () => {
  const many = Array.from({ length: 12 }, (_, index) =>
    draft({ n: index + 1, title: `Deal number ${index + 1}` }),
  );
  const feedItems = Array.from({ length: 12 }, (_, index) =>
    feedItem({ link: `https://example.test/${index + 1}` }),
  );
  const { added } = build(many, [], feedItems);
  assert.equal(added.length, 10);
});

test("key_date is true only when the reply says true", () => {
  const { added } = build([draft({ key_date: true }), draft({ key_date: "yes" })]);
  assert.equal(added[0].key_date, true);
  assert.equal(added[1].key_date, false);
});

test("slugify keeps lowercase letters, digits and hyphens", () => {
  assert.equal(slugify("OpenAI closes a $11bn round!"), "openai-closes-a-11bn-round");
});

// ---------- the added items pass the data checks ----------

// The rules scripts/check-data.mjs applies to news items (it exports nothing,
// so they are asserted here): exactly the known fields, real dates from
// 2017-06-12 on, an https source, the two kinds, unique ids.
const NEWS_FIELDS = ["id", "date", "title", "summary", "players", "kind", "key_date", "source"];

function assertPassesNewsChecks(item, usedIds) {
  assert.deepEqual(Object.keys(item).sort(), [...NEWS_FIELDS].sort());
  assert.equal(typeof item.id, "string");
  assert.equal(typeof item.title, "string");
  assert.equal(typeof item.summary, "string");
  assert.equal(typeof item.key_date, "boolean");
  assert.ok(Array.isArray(item.players));
  assert.ok(item.players.every((player) => typeof player === "string"));
  assert.ok(["money", "science"].includes(item.kind));
  assert.match(item.date, /^\d{4}-\d{2}-\d{2}$/);
  const [year, month, day] = item.date.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  assert.equal(parsed.getUTCFullYear(), year);
  assert.equal(parsed.getUTCMonth(), month - 1);
  assert.equal(parsed.getUTCDate(), day);
  assert.ok(item.date >= "2017-06-12");
  assert.ok(item.source.startsWith("https://"));
  assert.ok(!usedIds.has(item.id));
  usedIds.add(item.id);
}

test("the added items pass the rules check-data.mjs applies to news", () => {
  const drafts = [
    draft({ key_date: true }),
    draft({ n: 2, title: "New chip plant", kind: "money", players: ["nvidia"] }),
    draft({ n: 3, title: "A science result", kind: "science", players: [] }),
  ];
  const { added } = build(drafts);
  const usedIds = new Set();
  for (const item of added) assertPassesNewsChecks(item, usedIds);
  assert.equal(added.length, 3);
});

// ---------- the gateway variables ----------

test("missingGatewayVariable names GATEWAY_URL first, then GATEWAY_KEY", () => {
  assert.equal(missingGatewayVariable({}), "GATEWAY_URL");
  assert.equal(missingGatewayVariable({ GATEWAY_URL: "https://gateway.test" }), "GATEWAY_KEY");
  assert.equal(
    missingGatewayVariable({ GATEWAY_URL: "https://gateway.test", GATEWAY_KEY: "k" }),
    null,
  );
});
