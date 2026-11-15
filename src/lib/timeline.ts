// Pure helpers for the Explore page's day slider and one-line timeline.
// No DOM here; explore.ts and index.astro use the results.

import type { Deal, NewsItem } from "./data.ts";

// The day the site starts: ChatGPT opened to the public on 30 November 2022.
export const FIRST_DAY = "2022-11-30";
const DAY_MS = 86_400_000;

function midnight(date: string): number {
  return Date.parse(`${date}T00:00:00Z`);
}

function clamp(min: number, value: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

// Days since 30 November 2022, so a slider can step one day at a time: dayIndex("2022-11-30") is 0.
export function dayIndex(date: string): number {
  return Math.round((midnight(date) - midnight(FIRST_DAY)) / DAY_MS);
}

// The day that many days after 30 November 2022, as YYYY-MM-DD. The slider's value back to a date.
export function dateAt(index: number): string {
  return new Date(midnight(FIRST_DAY) + index * DAY_MS).toISOString().slice(0, 10);
}

// Where a day sits along the timeline: 0% on 30 November 2022, 100% on the last day of the data.
export function dayPercent(date: string, lastDate: string): number {
  const span = dayIndex(lastDate);
  if (span <= 0) return 0;
  return clamp(0, (dayIndex(date) / span) * 100, 100);
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

// Which pill a news item shows.
export type PillKind = "science" | "money" | "investment" | "cloud" | "chip";

export const PILL_LABELS: Record<PillKind, string> = {
  science: "Science",
  investment: "Investment",
  cloud: "Cloud deal",
  chip: "Chip deal",
  money: "Money",
};

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
  // 0 is the height nearer the line, 1 the one above it.
  row: 0 | 1;
  // Where the text sits against its date: centred on it, or pushed in at an end of the line.
  align: "start" | "center" | "end";
};

// Places each label beside the ones already placed. A label goes on the first height where its
// real box - aligned to the start, the middle or the end of its text against the date - clears
// the box already on that height, plus a little room; one that fits on neither is left out
// rather than drawn on top of another.
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
