// Pure helpers for the Explore page's day slider and two-lane timeline.
// No DOM here; explore.ts and index.astro use the results.

import type { Deal, NewsItem } from "./data.ts";

// The day the site starts: "Attention Is All You Need" came out on 12 June 2017.
export const FIRST_DAY = "2017-06-12";
const DAY_MS = 86_400_000;

function midnight(date: string): number {
  return Date.parse(`${date}T00:00:00Z`);
}

function clamp(min: number, value: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

// Days since 12 June 2017, so a slider can step one day at a time: dayIndex("2017-06-12") is 0.
export function dayIndex(date: string): number {
  return Math.round((midnight(date) - midnight(FIRST_DAY)) / DAY_MS);
}

// The day that many days after 12 June 2017, as YYYY-MM-DD. The slider's value back to a date.
export function dateAt(index: number): string {
  return new Date(midnight(FIRST_DAY) + index * DAY_MS).toISOString().slice(0, 10);
}

// Where a day sits along the timeline: 0% on 12 June 2017, 100% on the last day of the data.
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
