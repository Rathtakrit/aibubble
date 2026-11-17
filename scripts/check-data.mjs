// Rejects bad data files. Usage: node scripts/check-data.mjs [dir]  (dir defaults to data)
// Prints one line per problem as "file: item id or index: what is wrong" and exits 1,
// or prints the data ok line and exits 0.

import { readFileSync } from "node:fs";
import { join } from "node:path";

const FILES = ["companies", "values", "deals", "news"];
const STATUSES = ["sample", "draft", "approved"];
const META_FIELDS = ["title", "first_day", "last_day", "kinds", "burst"];
const FIRST_DAY = "2017-06-12";
const TODAY = new Date().toISOString().slice(0, 10);

const KIND = {
  companies: ["listed", "private", "group"],
  deals: ["investment", "cloud", "chip"],
  news: ["science", "money"],
};
const AMOUNT_TYPES = ["paid", "committed", "up to", "reported"];

const FIELDS = {
  companies: [
    { name: "id", type: "string" },
    { name: "name", type: "string" },
    { name: "kind", type: "string" },
    { name: "ticker", type: "string", optional: true },
    { name: "members", type: "strings", optional: true },
    { name: "first_mention", type: "string" },
    { name: "ended", type: "string", optional: true },
    { name: "source", type: "string" },
  ],
  values: [
    { name: "company", type: "string" },
    { name: "date", type: "string" },
    { name: "value_usd_bn", type: "number" },
    { name: "what", type: "string" },
    { name: "source", type: "string" },
  ],
  deals: [
    { name: "id", type: "string" },
    { name: "date", type: "string" },
    { name: "from", type: "string" },
    { name: "to", type: "string" },
    { name: "kind", type: "string" },
    { name: "amount_usd_bn", type: "numberOrNull" },
    { name: "amount_type", type: "string" },
    { name: "title", type: "string" },
    { name: "source", type: "string" },
  ],
  news: [
    { name: "id", type: "string" },
    { name: "date", type: "string" },
    { name: "title", type: "string" },
    { name: "summary", type: "string" },
    { name: "players", type: "strings" },
    { name: "kind", type: "string" },
    { name: "key_date", type: "boolean" },
    { name: "small_date", type: "boolean", optional: true },
    { name: "label", type: "string", optional: true },
    { name: "source", type: "string" },
  ],
};

const dir = process.argv[2] ?? "data";
const problems = [];

function problem(file, where, message) {
  problems.push(`${file}: ${where}: ${message}`);
}

function hasType(value, type) {
  if (type === "string") return typeof value === "string";
  if (type === "number") return typeof value === "number" && Number.isFinite(value);
  if (type === "numberOrNull") return value === null || (typeof value === "number" && Number.isFinite(value));
  if (type === "boolean") return typeof value === "boolean";
  if (type === "strings") return Array.isArray(value) && value.every((one) => typeof one === "string");
  return false;
}

function isRealDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day;
}

function checkDate(file, where, value, notBefore) {
  if (!isRealDate(value)) {
    problem(file, where, `date "${value}" is not a real calendar date in YYYY-MM-DD`);
    return false;
  }
  if (notBefore && value < firstDay) {
    problem(file, where, `date ${value} is before ${firstDay}`);
    return false;
  }
  if (value > lastDay) {
    problem(file, where, `date ${value} is after ${lastDay === TODAY ? `today (${TODAY})` : lastDay}`);
    return false;
  }
  return true;
}

function checkSource(file, where, value, status) {
  if (typeof value !== "string") return;
  if (!value.startsWith("https://")) {
    problem(file, where, `source "${value}" does not start with https://`);
    return;
  }
  if (status !== undefined && status !== "sample") {
    let host = "";
    try {
      host = new URL(value).hostname;
    } catch {
      problem(file, where, `source "${value}" is not a web address`);
      return;
    }
    if (host === "example.com" || host.endsWith(".example.com")) {
      problem(file, where, `source "${value}" is a placeholder, and status is "${status}"`);
    }
  }
}

function checkFields(file, where, item, fields) {
  const known = new Set(fields.map((field) => field.name));
  for (const field of fields) {
    if (!Object.hasOwn(item, field.name)) {
      if (!field.optional) problem(file, where, `missing field "${field.name}"`);
      continue;
    }
    if (!hasType(item[field.name], field.type)) {
      problem(file, where, `field "${field.name}" is not a ${field.type}`);
    }
  }
  for (const key of Object.keys(item)) {
    if (!known.has(key)) problem(file, where, `unknown field "${key}"`);
  }
}

// A news item's place on the timeline: a red key date or a blue smaller one, never both, and a
// short label of 1 to 28 characters when it has one.
function checkTimelineFields(file, where, item) {
  if (item.key_date === true && item.small_date === true) {
    problem(file, where, "key_date and small_date are both true");
  }
  if (typeof item.label !== "string") return;
  const length = [...item.label].length;
  if (length < 1 || length > 28) {
    problem(file, where, `label is ${length} characters long, not 1 to 28`);
  }
}

function checkIds(file, items) {
  const first = new Map();
  for (const [index, item] of items.entries()) {
    if (typeof item.id !== "string") continue;
    if (first.has(item.id)) {
      problem(file, item.id, `duplicate id (first used by item ${first.get(item.id)})`);
      continue;
    }
    first.set(item.id, index);
  }
}

// What a meta.json must hold: a title, two real days, and one to three deal kinds, each an id
// with a plain name.
function checkMeta(value) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    problem("meta.json", "file", "is not one JSON object");
    return false;
  }
  let ok = true;
  for (const key of Object.keys(value)) {
    if (!META_FIELDS.includes(key)) problem("meta.json", "file", `unknown field "${key}"`);
  }
  if (typeof value.title !== "string" || value.title.trim() === "") {
    problem("meta.json", "title", "is not a name");
    ok = false;
  }
  for (const key of ["first_day", "last_day"]) {
    if (!isRealDate(value[key])) {
      problem("meta.json", key, `"${value[key]}" is not a real calendar date in YYYY-MM-DD`);
      ok = false;
    }
  }
  if (isRealDate(value.first_day) && isRealDate(value.last_day) && value.first_day > value.last_day) {
    problem("meta.json", "last_day", `${value.last_day} is before first_day ${value.first_day}`);
    ok = false;
  }
  if (Object.hasOwn(value, "burst")) {
    const burst = value.burst;
    if (typeof burst !== "object" || burst === null || Array.isArray(burst)) {
      problem("meta.json", "burst", "is not one object");
      ok = false;
    } else {
      checkFields("meta.json", "burst", burst, [
        { name: "date", type: "string" },
        { name: "source", type: "string" },
      ]);
      if (!isRealDate(burst.date)) {
        problem("meta.json", "burst.date", `"${burst.date}" is not a real calendar date in YYYY-MM-DD`);
        ok = false;
      } else if (
        (isRealDate(value.first_day) && burst.date < value.first_day) ||
        (isRealDate(value.last_day) && burst.date > value.last_day)
      ) {
        problem("meta.json", "burst.date", `${burst.date} is outside the set's days`);
        ok = false;
      }
      try {
        const url = new URL(burst.source);
        if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error();
      } catch {
        problem("meta.json", "burst.source", "is not an http(s) web address");
        ok = false;
      }
    }
  }
  if (!Array.isArray(value.kinds) || value.kinds.length === 0 || value.kinds.length > 3) {
    problem("meta.json", "kinds", "is not a list of one to three deal kinds");
    ok = false;
  } else {
    const seen = new Set();
    for (const [index, kind] of value.kinds.entries()) {
      const where = `kinds[${index}]`;
      if (typeof kind !== "object" || kind === null || Array.isArray(kind)) {
        problem("meta.json", where, "is not one object");
        ok = false;
        continue;
      }
      for (const key of Object.keys(kind)) {
        if (key !== "id" && key !== "label") problem("meta.json", where, `unknown field "${key}"`);
      }
      if (typeof kind.id !== "string" || kind.id === "") {
        problem("meta.json", where, 'missing field "id"');
        ok = false;
      } else if (seen.has(kind.id)) {
        problem("meta.json", where, `duplicate kind "${kind.id}"`);
        ok = false;
      } else {
        seen.add(kind.id);
      }
      if (typeof kind.label !== "string" || kind.label.trim() === "") {
        problem("meta.json", where, 'missing field "label"');
        ok = false;
      }
    }
  }
  return ok;
}

// 0. A past set's meta.json: the first day it covers, the last allowed day, and the deal kinds
// it uses. The AI data has no meta.json, so its own first day, its three deal kinds and today as
// the last allowed day apply, exactly as before.
let meta = null;
try {
  meta = JSON.parse(readFileSync(join(dir, "meta.json"), "utf8"));
} catch (error) {
  if (error.code !== "ENOENT") problem("meta.json", "file", `cannot be read (${error.message})`);
}

// A meta.json that is there but wrong is reported, and whatever it does say is used where it
// can be, so the other problems it would cause are read against the set's own days.
if (meta !== null) checkMeta(meta);

const firstDay = meta !== null && isRealDate(meta.first_day) ? meta.first_day : FIRST_DAY;
const lastDay = meta !== null && isRealDate(meta.last_day) ? meta.last_day : TODAY;
const dealKinds =
  meta !== null && Array.isArray(meta.kinds)
    ? meta.kinds
        .filter((kind) => kind !== null && typeof kind === "object" && typeof kind.id === "string")
        .map((kind) => kind.id)
    : KIND.deals;

// 1. Read the four files.
const data = {};
for (const name of FILES) {
  const file = `${name}.json`;
  let text;
  try {
    text = readFileSync(join(dir, file), "utf8");
  } catch {
    problem(file, "file", `cannot be read in ${dir}`);
    continue;
  }
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (error) {
    problem(file, "file", `is not valid JSON (${error.message})`);
    continue;
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    problem(file, "file", "is not one JSON object with status and items");
    continue;
  }
  data[name] = parsed;
}

// 2. Top level: status and items.
const statusOf = {};
for (const name of FILES) {
  const file = `${name}.json`;
  const parsed = data[name];
  if (!parsed) continue;
  for (const key of Object.keys(parsed)) {
    if (key !== "status" && key !== "items") problem(file, "file", `unknown field "${key}"`);
  }
  if (!Object.hasOwn(parsed, "status")) {
    problem(file, "file", 'missing field "status"');
  } else if (typeof parsed.status !== "string" || !STATUSES.includes(parsed.status)) {
    problem(file, "status", `"${parsed.status}" is not one of ${STATUSES.join(", ")}`);
  } else {
    statusOf[name] = parsed.status;
  }
  if (!Object.hasOwn(parsed, "items")) {
    problem(file, "file", 'missing field "items"');
  } else if (!Array.isArray(parsed.items)) {
    problem(file, "items", "is not a list");
  }
}

const statuses = Object.values(statusOf);
if (statuses.length === FILES.length && new Set(statuses).size > 1) {
  const first = statuses[0];
  const firstName = FILES.find((name) => statusOf[name] === first) ?? "companies";
  for (const name of FILES) {
    if (statusOf[name] !== first) {
      problem(`${name}.json`, "status", `"${statusOf[name]}" does not match ${firstName}.json ("${first}")`);
    }
  }
}

// 3. Items: fields, enums, dates, sources, numbers.
for (const name of FILES) {
  const file = `${name}.json`;
  const parsed = data[name];
  if (!parsed || !Array.isArray(parsed.items)) continue;
  const status = statusOf[name];
  for (const [index, item] of parsed.items.entries()) {
    if (typeof item !== "object" || item === null || Array.isArray(item)) {
      problem(file, String(index), "is not one object");
      continue;
    }
    const where = typeof item.id === "string" ? item.id : String(index);
    checkFields(file, where, item, FIELDS[name]);
    if (name === "companies" && typeof item.kind === "string" && !KIND.companies.includes(item.kind)) {
      problem(file, where, `unknown kind "${item.kind}"`);
    }
    if (name === "deals" && typeof item.kind === "string" && !dealKinds.includes(item.kind)) {
      problem(file, where, `unknown kind "${item.kind}"`);
    }
    if (name === "news" && typeof item.kind === "string" && !KIND.news.includes(item.kind)) {
      problem(file, where, `unknown kind "${item.kind}"`);
    }
    if (name === "news") checkTimelineFields(file, where, item);
    if (name === "deals" && typeof item.amount_type === "string" && !AMOUNT_TYPES.includes(item.amount_type)) {
      problem(file, where, `unknown amount_type "${item.amount_type}"`);
    }
    if (name === "values" && typeof item.value_usd_bn === "number" && !(item.value_usd_bn > 0)) {
      problem(file, where, "value_usd_bn is not a number above 0");
    }
    if (name === "deals" && typeof item.amount_usd_bn === "number" && !(item.amount_usd_bn > 0)) {
      problem(file, where, "amount_usd_bn is not a number above 0");
    }
    if (name === "deals" && item.from === item.to && typeof item.from === "string") {
      problem(file, where, `from and to are both "${item.from}"`);
    }
    checkSource(file, where, item.source, status);
    if (name === "companies") {
      if (typeof item.id === "string" && !/^[a-z0-9-]+$/.test(item.id)) {
        problem(file, where, "id must use lowercase letters, digits and hyphens only");
      }
      checkDate(file, where, item.first_mention, false);
      if (Object.hasOwn(item, "ended")) {
        // A company is in the picture up to and including its ended day, never before its first.
        if (
          checkDate(file, where, item.ended, false) &&
          isRealDate(item.first_mention) &&
          item.ended < item.first_mention
        ) {
          problem(file, where, `ended ${item.ended} is before first_mention ${item.first_mention}`);
        }
      }
      if (item.kind === "group" && (!Array.isArray(item.members) || item.members.length === 0)) {
        problem(file, where, "a group company needs a non-empty members list");
      }
      if (item.kind !== "group" && Object.hasOwn(item, "members")) {
        problem(file, where, "members is only for a group company");
      }
      if (item.kind !== "listed" && Object.hasOwn(item, "ticker")) {
        problem(file, where, "ticker is only for a listed company");
      }
    }
    if (name === "values") checkDate(file, where, item.date, false);
    if (name === "deals") checkDate(file, where, item.date, true);
    if (name === "news") checkDate(file, where, item.date, true);
  }
}

// 4. Duplicate ids, and duplicate company + date in values.
for (const name of ["companies", "deals", "news"]) {
  const parsed = data[name];
  if (parsed && Array.isArray(parsed.items)) checkIds(`${name}.json`, parsed.items);
}
if (data.values && Array.isArray(data.values.items)) {
  const first = new Map();
  for (const [index, item] of data.values.items.entries()) {
    if (typeof item.company !== "string" || typeof item.date !== "string") continue;
    const key = `${item.company} ${item.date}`;
    if (first.has(key)) {
      problem("values.json", String(index), `duplicate point for ${item.company} on ${item.date} (item ${first.get(key)})`);
      continue;
    }
    first.set(key, index);
  }
}

// 5. Company references, company ids, value points, and first_mention.
const companies = data.companies && Array.isArray(data.companies.items) ? data.companies.items : [];
const byId = new Map();
for (const company of companies) {
  if (typeof company !== "object" || company === null) continue;
  if (typeof company.id !== "string") continue;
  byId.set(company.id, company);
}

const valueCount = new Map();
if (data.values && Array.isArray(data.values.items)) {
  for (const [index, item] of data.values.items.entries()) {
    if (typeof item !== "object" || item === null) continue;
    const where = String(index);
    if (typeof item.company === "string") {
      if (!byId.has(item.company)) {
        problem("values.json", where, `company "${item.company}" is not in companies.json`);
      } else {
        valueCount.set(item.company, (valueCount.get(item.company) ?? 0) + 1);
      }
    }
  }
}

for (const [id, company] of byId) {
  if (company.kind === "group") continue;
  if (!valueCount.get(id)) problem("companies.json", id, "has no value point in values.json");
}

// A company's ended day is its last: no value point may fall after it.
if (data.values && Array.isArray(data.values.items)) {
  for (const [index, point] of data.values.items.entries()) {
    if (typeof point !== "object" || point === null || typeof point.company !== "string") continue;
    const company = byId.get(point.company);
    if (!company || typeof company.ended !== "string" || !isRealDate(company.ended)) continue;
    if (typeof point.date === "string" && point.date > company.ended) {
      problem(
        "values.json",
        String(index),
        `${point.date} for ${point.company} is after its ended day ${company.ended}`,
      );
    }
  }
}

function checkFirstMention(file, where, date, playerIds) {
  if (!isRealDate(date)) return;
  for (const id of playerIds) {
    const company = byId.get(id);
    if (!company || !isRealDate(company.first_mention)) continue;
    if (date < company.first_mention) {
      problem(file, where, `dated ${date}, before the first_mention ${company.first_mention} of ${id}`);
    }
  }
}

for (const [name, pick] of [
  ["deals", (item) => [item.from, item.to]],
  ["news", (item) => (Array.isArray(item.players) ? item.players : [])],
]) {
  const parsed = data[name];
  if (!parsed || !Array.isArray(parsed.items)) continue;
  for (const [index, item] of parsed.items.entries()) {
    if (typeof item !== "object" || item === null) continue;
    const where = typeof item.id === "string" ? item.id : String(index);
    const refs = pick(item).filter((ref) => typeof ref === "string");
    for (const ref of refs) {
      if (!byId.has(ref)) problem(`${name}.json`, where, `company "${ref}" is not in companies.json`);
    }
    checkFirstMention(`${name}.json`, where, item.date, refs);
  }
}

// 6. Result.
if (problems.length > 0) {
  for (const line of problems) console.log(line);
  process.exit(1);
}

const count = (name) => (data[name] && Array.isArray(data[name].items) ? data[name].items.length : 0);
console.log(
  `data ok: ${count("companies")} companies, ${count("values")} values, ${count("deals")} deals, ${count("news")} news (status: ${statusOf.companies})`,
);
