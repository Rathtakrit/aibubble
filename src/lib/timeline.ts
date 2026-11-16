// Pure helpers for the Explore page's day slider and one-line timeline.
// No DOM here; ExplorePage.astro and explore.ts use the results.

import type { Deal, NewsItem } from "./data.ts";

// The day the active data set starts: ChatGPT opened to the public on 30 November 2022, and the
// past sets start on the first day in their meta.json. `useDataset` in data.ts sets it.
export let FIRST_DAY = "2022-11-30";

// Sets the first day of the active data set. Called by useDataset, not by the page.
export function setFirstDay(date: string): void {
  FIRST_DAY = date;
}

const DAY_MS = 86_400_000;

function midnight(date: string): number {
  return Date.parse(`${date}T00:00:00Z`);
}

function clamp(min: number, value: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

// Days since the set's first day: dayIndex(FIRST_DAY) is 0.
export function dayIndex(date: string): number {
  return Math.round((midnight(date) - midnight(FIRST_DAY)) / DAY_MS);
}

// The day that many days after the set's first day, as YYYY-MM-DD.
export function dateAt(index: number): string {
  return new Date(midnight(FIRST_DAY) + index * DAY_MS).toISOString().slice(0, 10);
}

// --- the day scale: busy months get more room, empty ones less ---

// Every dot on the line, split by the colour it is drawn in: a red key date earns its month more
// room than a blue smaller event.
type ScaleDots = { red: readonly Dated[]; blue: readonly Dated[] };

// A month of the line in days since FIRST_DAY, and the share of the line it has earned. `start` is
// the weight of every month before it, so a weight can be turned into a place on the line.
type MonthSpan = { first: number; days: number; start: number; weight: number };

// A month with no dots still takes a little room (0.3), a red dot adds 1.5 and a blue one 0.75,
// and no month passes 7. An empty year is then only a little wider than a month with two red dots.
const EMPTY_MONTH_WEIGHT = 0.3;
const RED_DOT_WEIGHT = 1.5;
const BLUE_DOT_WEIGHT = 0.75;
const MAX_MONTH_WEIGHT = 7;

// One span per calendar month from the first day to the last: the weights above, capped at 7.
// Every day of the month gets an equal share of its month's weight.
function monthSpans(lastDate: string, dots: ScaleDots): MonthSpan[] {
  function monthCounts(list: readonly Dated[]): Map<string, number> {
    const counts = new Map<string, number>();
    for (const dot of list) {
      const month = dot.date.slice(0, 7);
      counts.set(month, (counts.get(month) ?? 0) + 1);
    }
    return counts;
  }
  const redInMonth = monthCounts(dots.red);
  const blueInMonth = monthCounts(dots.blue);

  const lastDay = dayIndex(lastDate);
  const spans: MonthSpan[] = [];
  let start = 0;
  let year = Number(FIRST_DAY.slice(0, 4));
  let month = Number(FIRST_DAY.slice(5, 7));
  const lastYear = Number(lastDate.slice(0, 4));
  const lastMonth = Number(lastDate.slice(5, 7));

  while (year < lastYear || (year === lastYear && month <= lastMonth)) {
    const key = `${year}-${String(month).padStart(2, "0")}`;
    // Day 0 of the next month is the last day of this one.
    const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
    const first = Math.max(0, dayIndex(`${key}-01`));
    const last = Math.min(lastDay, dayIndex(`${key}-${String(daysInMonth).padStart(2, "0")}`));
    const weight = Math.min(
      MAX_MONTH_WEIGHT,
      EMPTY_MONTH_WEIGHT +
        RED_DOT_WEIGHT * (redInMonth.get(key) ?? 0) +
        BLUE_DOT_WEIGHT * (blueInMonth.get(key) ?? 0),
    );
    spans.push({ first, days: last - first + 1, start, weight });
    start += weight;
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }
  return spans;
}

export type TimelineScale = {
  // 0% on the set's first day, 100% on the last day of the data, with busy months given more room.
  percentOf(date: string): number;
  // The day nearest that place on the line, as YYYY-MM-DD.
  dateOf(percent: number): string;
};

// The timeline's day scale, built once from the days that carry a dot. Days move evenly inside
// their month, the order of days never changes, and the first day is at 0 and the last at 100.
export function timelineScale(lastDate: string, dots: ScaleDots): TimelineScale {
  const spans = monthSpans(lastDate, dots);
  const lastDay = dayIndex(lastDate);
  const lastSpan = spans[spans.length - 1];
  // The weight between the first day and the last, the ends of the line.
  const end = lastSpan.start + (lastSpan.weight * (lastSpan.days - 1)) / lastSpan.days;

  function percentOf(date: string): number {
    const day = clamp(0, dayIndex(date), lastDay);
    const span = spans.find((one) => day < one.first + one.days) ?? lastSpan;
    const inside = (day - span.first) / span.days;
    return clamp(0, ((span.start + span.weight * inside) / end) * 100, 100);
  }

  function dateOf(percent: number): string {
    const place = (clamp(0, percent, 100) / 100) * end;
    // A place on the line is the nearest day, so the end of one month stays its own last day.
    const span = spans.find((one) => place < one.start + one.weight) ?? lastSpan;
    const inside = clamp(0, (place - span.start) / span.weight, 1);
    return dateAt(clamp(0, span.first + Math.round(inside * span.days), lastDay));
  }

  return { percentOf, dateOf };
}

const shortDateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

// "27 Jan 2025".
export function dayLabel(date: string): string {
  return shortDateFormat.format(new Date(`${date}T00:00:00Z`));
}

// "arxiv.org" from "https://arxiv.org/abs/1706.03762", for the source line.
export function siteName(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

// The publisher's own name for each host the news and deals cite, without www.
const PUBLISHERS: Record<string, string> = {
  "techcrunch.com": "TechCrunch",
  "anthropic.com": "Anthropic",
  "nvidianews.nvidia.com": "Nvidia",
  "cnbc.com": "CNBC",
  "en.wikipedia.org": "Wikipedia",
  "theguardian.com": "The Guardian",
  "blogs.microsoft.com": "Microsoft",
  "aboutamazon.com": "Amazon",
  "press.aboutamazon.com": "Amazon",
  "ai.meta.com": "Meta",
  "coreweave.com": "CoreWeave",
  "group.softbank": "SoftBank",
  "blog.google": "Google",
  "mistral.ai": "Mistral AI",
  "bis.gov": "US Bureau of Industry and Security",
  "openai.com": "OpenAI",
  "bloomberg.com": "Bloomberg",
  "finance.yahoo.com": "Yahoo Finance",
  "x.ai": "xAI",
  "bbc.com": "BBC",
  "bbc.co.uk": "BBC",
  "businessinsider.com": "Business Insider",
  "sec.gov": "US SEC",
  "ir.amd.com": "AMD",
  "reuters.com": "Reuters",
  "forbes.com": "Forbes",
  "fortune.com": "Fortune",
  "cnn.com": "CNN",
  "arstechnica.com": "Ars Technica",
  "companiesmarketcap.com": "CompaniesMarketCap",
  "geekwire.com": "GeekWire",
  "engadget.com": "Engadget",
  "euronews.com": "Euronews",
  "pbs.org": "PBS",
  "cbsnews.com": "CBS News",
};

// "Forbes" from "https://www.forbes.com/...", and the host itself when the name is not known.
export function publisherName(url: string): string {
  try {
    return PUBLISHERS[new URL(url).hostname.replace(/^www\./, "")] ?? siteName(url);
  } catch {
    return siteName(url);
  }
}

export type Dated = { id: string; date: string };

// Oldest first. Two items on the same day keep a steady order by id, so Earlier and Later
// always walk the same way.
export function inDateOrder<T extends Dated>(items: readonly T[]): T[] {
  return [...items].sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? -1 : 1;
    if (a.id !== b.id) return a.id < b.id ? -1 : 1;
    return 0;
  });
}

// The latest item on or before that day, or null when every item is later.
export function latestOnOrBefore<T extends Dated>(items: readonly T[], date: string): T | null {
  let found: T | null = null;
  for (const item of items) {
    if (item.date > date) continue;
    if (found === null || item.date > found.date || (item.date === found.date && item.id > found.id)) {
      found = item;
    }
  }
  return found;
}

// The item one place earlier (-1) or later (1) in date order, or null at the ends.
export function neighbour<T extends Dated>(items: readonly T[], id: string, step: -1 | 1): T | null {
  const ordered = inDateOrder(items);
  const at = ordered.findIndex((item) => item.id === id);
  if (at < 0) return null;
  return ordered[at + step] ?? null;
}

// Which pill a news item shows: "science", "money", or the id of the deal kind it belongs to.
export type PillKind = "science" | "money" | Deal["kind"];

// The names a pill can carry live in data.ts: Science and Money are fixed, and a deal kind takes
// the active set's own name (see pillLabel there).

// Science news is "Science". Money news shows the kind of its deal when the item's players are
// the two ends of a deal announced that day; otherwise it is plain "Money".
export function pillKind(item: Pick<NewsItem, "date" | "players" | "kind">, deals: readonly Deal[]): PillKind {
  if (item.kind === "science") return "science";
  const players = new Set(item.players);
  for (const deal of deals) {
    if (deal.date !== item.date) continue;
    if (players.has(deal.from) && players.has(deal.to)) return deal.kind;
  }
  return "money";
}

// --- timeline labels: two heights over the line, and never two on top of each other ---

export type LabelBox = { id: string; percent: number; width: number };

export type LabelPlacement = {
  // 0 is the height nearest the line, 1 the one above it.
  row: 0 | 1;
  // Where the text sits against its date: centred on it, or pushed in at an end of the line.
  align: "start" | "center" | "end";
};

// Places each label beside the ones already placed. A label goes on the first height where its
// real box - aligned to the start, the middle or the end of its text against the date - clears
// the box already on that height, plus a little room; one that fits on neither height is left
// out rather than drawn on top of another.
export function placeLabels(
  boxes: readonly LabelBox[],
  containerWidth: number,
  gap = 8,
): Map<string, LabelPlacement> {
  const out = new Map<string, LabelPlacement>();
  if (containerWidth <= 0) return out;
  // The box already taken on each of the two heights: [left, right] in pixels.
  const taken: [number, number][] = [
    [-Infinity, -Infinity],
    [-Infinity, -Infinity],
  ];

  for (const box of [...boxes].sort((a, b) => a.percent - b.percent)) {
    const width = Math.min(box.width, containerWidth);
    const middle = (box.percent / 100) * containerWidth;
    // A label that would run off an end of the line is lined up with that end instead.
    const align: LabelPlacement["align"] =
      middle - width / 2 < 0 ? "start" : middle + width / 2 > containerWidth ? "end" : "center";
    const alignedLeft = align === "start" ? middle : align === "end" ? middle - width : middle - width / 2;
    const left = clamp(0, alignedLeft, containerWidth - width);
    const right = left + width;

    for (const row of [0, 1] as const) {
      const [takenLeft, takenRight] = taken[row];
      // Two boxes clash when each reaches into the other, with the extra room between them.
      if (left < takenRight + gap && right > takenLeft - gap) continue;
      taken[row] = [left, right];
      out.set(box.id, { row, align });
      break;
    }
  }
  return out;
}
