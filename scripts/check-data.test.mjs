// Checks that scripts/check-data.mjs rejects broken data. Run with: node --test scripts/
// The tests copy scripts/fixtures/sample and break the copy, so they do not depend on data/.

import test from "node:test";
import assert from "node:assert";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const here = dirname(fileURLToPath(import.meta.url));
const checker = join(here, "check-data.mjs");
const dataDir = join(here, "..", "data");
const fixtureDir = join(here, "fixtures", "sample");

function copyData() {
  const dir = mkdtempSync(join(tmpdir(), "aibubble-check-"));
  cpSync(fixtureDir, dir, { recursive: true });
  return dir;
}

function read(dir, file) {
  return JSON.parse(readFileSync(join(dir, file), "utf8"));
}

function write(dir, file, content) {
  writeFileSync(join(dir, file), typeof content === "string" ? content : JSON.stringify(content, null, 2));
}

function run(dir) {
  return spawnSync(process.execPath, [checker, dir], { encoding: "utf8" });
}

function expectOk(dir) {
  const result = run(dir);
  assert.equal(result.status, 0, `expected exit 0, got ${result.status}:\n${result.stdout}${result.stderr}`);
  assert.match(result.stdout, /^data ok: /);
  rmSync(dir, { recursive: true, force: true });
}

function expectFail(dir, file) {
  const result = run(dir);
  assert.equal(result.status, 1, `expected exit 1, got ${result.status}:\n${result.stdout}${result.stderr}`);
  const output = result.stdout + result.stderr;
  assert.ok(output.includes(file), `expected the output to name ${file}:\n${output}`);
  rmSync(dir, { recursive: true, force: true });
}

test("the real data passes", () => {
  const result = run(dataDir);
  assert.equal(result.status, 0, `expected exit 0, got ${result.status}:\n${result.stdout}${result.stderr}`);
  assert.match(result.stdout, /^data ok: /);
});

test("rejects a missing file", () => {
  const dir = copyData();
  rmSync(join(dir, "companies.json"));
  expectFail(dir, "companies.json");
});

test("rejects a file that is not valid JSON", () => {
  const dir = copyData();
  write(dir, "deals.json", "{ \"status\": ");
  expectFail(dir, "deals.json");
});

test("rejects a status outside the three allowed", () => {
  const dir = copyData();
  const news = read(dir, "news.json");
  news.status = "published";
  write(dir, "news.json", news);
  expectFail(dir, "news.json");
});

test("rejects files whose statuses differ", () => {
  const dir = copyData();
  const news = read(dir, "news.json");
  news.status = "draft";
  write(dir, "news.json", news);
  expectFail(dir, "news.json");
});

test("rejects a missing field", () => {
  const dir = copyData();
  const companies = read(dir, "companies.json");
  delete companies.items[0].name;
  write(dir, "companies.json", companies);
  expectFail(dir, "companies.json");
});

test("rejects a field of the wrong type", () => {
  const dir = copyData();
  const news = read(dir, "news.json");
  news.items[1].key_date = "yes";
  write(dir, "news.json", news);
  expectFail(dir, "news.json");
});

test("rejects an unknown extra field", () => {
  const dir = copyData();
  const deals = read(dir, "deals.json");
  deals.items[0].colour = "blue";
  write(dir, "deals.json", deals);
  expectFail(dir, "deals.json");
});

test("a small date with a short label passes, and items without either still do", () => {
  // The fixture has one item with both new fields and the rest with neither.
  const dir = copyData();
  expectOk(dir);
});

test("rejects a small_date of the wrong type", () => {
  const dir = copyData();
  const news = read(dir, "news.json");
  news.items[2].small_date = "yes";
  write(dir, "news.json", news);
  expectFail(dir, "news.json");
});

test("rejects a label longer than 28 characters", () => {
  const dir = copyData();
  const news = read(dir, "news.json");
  news.items[2].label = "x".repeat(29);
  write(dir, "news.json", news);
  expectFail(dir, "news.json");
});

test("rejects an empty label", () => {
  const dir = copyData();
  const news = read(dir, "news.json");
  news.items[2].label = "";
  write(dir, "news.json", news);
  expectFail(dir, "news.json");
});

test("rejects an item that is both a key date and a small date", () => {
  const dir = copyData();
  const news = read(dir, "news.json");
  news.items[2].key_date = true;
  write(dir, "news.json", news);
  expectFail(dir, "news.json");
});

test("rejects a date that is not a real calendar date", () => {
  const dir = copyData();
  const values = read(dir, "values.json");
  values.items[0].date = "2024-02-30";
  write(dir, "values.json", values);
  expectFail(dir, "values.json");
});

test("rejects a deal dated before 2017-06-12", () => {
  const dir = copyData();
  const deals = read(dir, "deals.json");
  deals.items[0].date = "2016-01-04";
  write(dir, "deals.json", deals);
  expectFail(dir, "deals.json");
});

test("rejects a news date after today", () => {
  const dir = copyData();
  const news = read(dir, "news.json");
  news.items[0].date = "2999-01-01";
  write(dir, "news.json", news);
  expectFail(dir, "news.json");
});

test("rejects a source that does not start with https://", () => {
  const dir = copyData();
  const deals = read(dir, "deals.json");
  deals.items[0].source = "http://example.com/sample";
  write(dir, "deals.json", deals);
  expectFail(dir, "deals.json");
});

test("rejects a duplicate deal id", () => {
  const dir = copyData();
  const deals = read(dir, "deals.json");
  deals.items[1].id = deals.items[0].id;
  write(dir, "deals.json", deals);
  expectFail(dir, "deals.json");
});

test("rejects a duplicate company and date in values", () => {
  const dir = copyData();
  const values = read(dir, "values.json");
  values.items[1].company = values.items[0].company;
  values.items[1].date = values.items[0].date;
  write(dir, "values.json", values);
  expectFail(dir, "values.json");
});

test("rejects a company that is not in companies.json", () => {
  const dir = copyData();
  const values = read(dir, "values.json");
  values.items[0].company = "nope";
  write(dir, "values.json", values);
  expectFail(dir, "values.json");
});

test("rejects a deal that pays itself", () => {
  const dir = copyData();
  const deals = read(dir, "deals.json");
  deals.items[0].to = deals.items[0].from;
  write(dir, "deals.json", deals);
  expectFail(dir, "deals.json");
});

test("rejects a value of zero", () => {
  const dir = copyData();
  const values = read(dir, "values.json");
  values.items[0].value_usd_bn = 0;
  write(dir, "values.json", values);
  expectFail(dir, "values.json");
});

test("rejects an unknown deal kind", () => {
  const dir = copyData();
  const deals = read(dir, "deals.json");
  deals.items[0].kind = "gift";
  write(dir, "deals.json", deals);
  expectFail(dir, "deals.json");
});

test("rejects an unknown amount_type", () => {
  const dir = copyData();
  const deals = read(dir, "deals.json");
  deals.items[0].amount_type = "maybe";
  write(dir, "deals.json", deals);
  expectFail(dir, "deals.json");
});

test("rejects a company with no value point", () => {
  const dir = copyData();
  const values = read(dir, "values.json");
  values.items = values.items.filter((item) => item.company !== "samplenet");
  write(dir, "values.json", values);
  expectFail(dir, "companies.json");
});

test("rejects a group with an empty members list", () => {
  const dir = copyData();
  const companies = read(dir, "companies.json");
  companies.items[5].members = [];
  write(dir, "companies.json", companies);
  expectFail(dir, "companies.json");
});

test("rejects a deal dated before a company's first_mention", () => {
  const dir = copyData();
  const deals = read(dir, "deals.json");
  deals.items[0].date = "2018-01-01";
  write(dir, "deals.json", deals);
  expectFail(dir, "deals.json");
});

test("rejects an ended of the wrong type", () => {
  const dir = copyData();
  const companies = read(dir, "companies.json");
  companies.items[0].ended = 2021;
  write(dir, "companies.json", companies);
  expectFail(dir, "companies.json");
});

test("rejects an ended that is not a real calendar date", () => {
  const dir = copyData();
  const companies = read(dir, "companies.json");
  companies.items[0].ended = "2021-02-30";
  write(dir, "companies.json", companies);
  expectFail(dir, "companies.json");
});

test("rejects an ended before the company's first_mention", () => {
  const dir = copyData();
  const companies = read(dir, "companies.json");
  companies.items[0].ended = "2018-12-31";
  write(dir, "companies.json", companies);
  expectFail(dir, "companies.json");
});

test("rejects a value point after the company's ended day", () => {
  const dir = copyData();
  const companies = read(dir, "companies.json");
  companies.items[0].ended = "2019-06-01";
  write(dir, "companies.json", companies);
  // samplenet still has points on 2020-01-01 and 2021-01-01.
  expectFail(dir, "values.json");
});

test("an ended on the last value point passes, and so does a company with no ended", () => {
  const dir = copyData();
  const companies = read(dir, "companies.json");
  companies.items[0].ended = "2021-01-01";
  write(dir, "companies.json", companies);
  expectOk(dir);
});

test("rejects example.com sources when the status is not sample", () => {
  const dir = copyData();
  for (const file of ["companies.json", "values.json", "deals.json", "news.json"]) {
    const content = read(dir, file);
    content.status = "draft";
    write(dir, file, content);
  }
  expectFail(dir, "companies.json");
});

// A past folder holds a meta.json: its first day, its last day and its deal kinds replace the
// AI set's own. The fixture's data starts in 2020, so a company first mentioned in 2016 and a
// takeover deal in 2016 only pass when the meta.json allows them.
function olderFixture() {
  const dir = copyData();
  const companies = read(dir, "companies.json");
  for (const company of companies.items) company.first_mention = "2016-01-01";
  write(dir, "companies.json", companies);
  const deals = read(dir, "deals.json");
  deals.items[0].date = "2016-01-05";
  deals.items[0].kind = "takeover";
  write(dir, "deals.json", deals);
  return dir;
}

const meta = (overrides = {}) => ({
  title: "A made-up past boom",
  first_day: "2016-01-01",
  last_day: "2021-12-31",
  kinds: [
    { id: "takeover", label: "Takeover deal" },
    { id: "cloud", label: "Cloud deal" },
    { id: "chip", label: "Chip deal" },
  ],
  ...overrides,
});

test("a folder with a meta.json takes its first day, last day and deal kinds from it", () => {
  const dir = olderFixture();
  write(dir, "meta.json", meta());
  expectOk(dir);
});

test("a meta.json takes up to eight deal kinds, not none and not nine", () => {
  const kinds = (count) =>
    [{ id: "takeover", label: "Takeover deal" }, { id: "cloud", label: "Cloud deal" }, { id: "chip", label: "Chip deal" }]
      .concat(Array.from({ length: 6 }, (_, at) => ({ id: `extra-${at}`, label: `Extra deal ${at}` })))
      .slice(0, count);
  const eight = olderFixture();
  write(eight, "meta.json", meta({ kinds: kinds(8) }));
  expectOk(eight);
  for (const count of [0, 9]) {
    const dir = olderFixture();
    write(dir, "meta.json", meta({ kinds: kinds(count) }));
    expectFail(dir, "meta.json");
  }
});

test("burst accepts real dates within the set and http(s) sources", () => {
  for (const date of ["2016-01-01", "2020-03-10", "2021-12-31"]) {
    for (const source of ["http://example.com/event", "https://example.com/event"]) {
      const dir = olderFixture();
      write(dir, "meta.json", meta({ burst: { date, source } }));
      expectOk(dir);
    }
  }
});

test("rejects burst dates outside the set or not real calendar dates", () => {
  for (const date of ["2015-12-31", "2022-01-01", "2020-02-30", "not-a-date"]) {
    const dir = olderFixture();
    write(dir, "meta.json", meta({ burst: { date, source: "https://example.com/event" } }));
    const result = run(dir);
    assert.equal(result.status, 1, result.stdout + result.stderr);
    assert.match(result.stdout, /meta.json: burst.date:/);
    rmSync(dir, { recursive: true, force: true });
  }
});

test("rejects malformed burst objects and sources", () => {
  for (const burst of [null, [], "2000-03-10", {}, { date: "2020-03-10", source: "ftp://example.com" },
    { date: "2020-03-10", source: "https://" }]) {
    const dir = olderFixture();
    write(dir, "meta.json", meta({ burst }));
    expectFail(dir, "meta.json");
  }
});

test("without a meta.json the AI first day and deal kinds still apply", () => {
  // The same folder the test above passes: 2016 is before the AI set's first day, and
  // "takeover" is not one of the AI set's three deal kinds.
  const dir = olderFixture();
  expectFail(dir, "deals.json");
});

test("rejects a deal dated after the meta.json last day", () => {
  const dir = copyData();
  write(
    dir,
    "meta.json",
    meta({
      kinds: [
        { id: "investment", label: "Investment deal" },
        { id: "cloud", label: "Cloud deal" },
        { id: "chip", label: "Chip deal" },
      ],
    }),
  );
  const deals = read(dir, "deals.json");
  deals.items[3].date = "2022-01-01";
  write(dir, "deals.json", deals);
  expectFail(dir, "deals.json");
});

test("rejects a meta.json with a duplicate deal kind", () => {
  const dir = copyData();
  write(
    dir,
    "meta.json",
    meta({
      kinds: [
        { id: "investment", label: "Investment deal" },
        { id: "cloud", label: "Cloud deal" },
        { id: "cloud", label: "Cloud deal again" },
      ],
    }),
  );
  expectFail(dir, "meta.json");
});
