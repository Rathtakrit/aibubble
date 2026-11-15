// Checks that scripts/check-data.mjs rejects broken data. Run with: node --test scripts/

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

function copyData() {
  const dir = mkdtempSync(join(tmpdir(), "aibubble-check-"));
  cpSync(dataDir, dir, { recursive: true });
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
  expectOk(copyData());
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
  values.items = values.items.filter((item) => item.company !== "nvidia");
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

test("rejects example.com sources when the status is not sample", () => {
  const dir = copyData();
  for (const file of ["companies.json", "values.json", "deals.json", "news.json"]) {
    const content = read(dir, file);
    content.status = "draft";
    write(dir, file, content);
  }
  expectFail(dir, "companies.json");
});
