// Pure bubble layout: one fixed position per company, and what is shown on a day.
// No DOM here; bubble.ts draws the result into an SVG.

import { packEnclose, packSiblings } from "d3-hierarchy";
import { companies, deals, isShown, news, valueOn, values } from "./data.ts";
import type { Company, Deal, ValuePoint } from "./data.ts";

// The bubble lives in a 100 x 100 square. The frame is the circle with this centre and radius.
export const FRAME = { cx: 50, cy: 50, radius: 48, fitRadius: 46 } as const;

export type Position = {
  x: number;
  y: number;
  rMax: number;
  maxValue: number;
};

export type Bubble = {
  id: string;
  name: string;
  kind: Company["kind"];
  x: number;
  y: number;
  r: number;
  value: number;
};

export type Arrow = {
  from: string;
  to: string;
  kind: Deal["kind"];
  count: number;
  amount_usd_bn: number;
  amountKnown: boolean;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

// The largest value each company ever reaches; its radius is proportional to the square root of this.
function largestValues(values: ValuePoint[]): Map<string, number> {
  const largest = new Map<string, number>();
  for (const point of values) {
    const seen = largest.get(point.company);
    if (seen === undefined || point.value_usd_bn > seen) {
      largest.set(point.company, point.value_usd_bn);
    }
  }
  return largest;
}

// One fixed position per company, for every day. Companies with no value points are left out.
// The order is largest first, ties by id, so the packing is the same on every build.
export function positions(companies: Company[], values: ValuePoint[]): Map<string, Position> {
  const largest = largestValues(values);
  const nodes = companies
    .filter((company) => largest.has(company.id))
    .map((company) => ({ id: company.id, r: Math.sqrt(largest.get(company.id)!) }))
    .sort((a, b) => b.r - a.r || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  if (nodes.length === 0) return new Map();

  const packed = packSiblings(nodes);
  const enclosure = packEnclose(packed);
  const scale = FRAME.fitRadius / enclosure.r;

  const out = new Map<string, Position>();
  for (const node of packed) {
    const maxValue = largest.get(node.id)!;
    out.set(node.id, {
      x: FRAME.cx + (node.x - enclosure.x) * scale,
      y: FRAME.cy + (node.y - enclosure.y) * scale,
      rMax: node.r * scale,
      maxValue,
    });
  }
  return out;
}

// The companies shown on that day, with the radius their value gives them. Because r never passes
// rMax, circles never overlap and never move; they only grow and shrink.
export function bubblesOn(
  date: string,
  companies: Company[],
  values: ValuePoint[],
  layout: Map<string, Position> = positions(companies, values),
): Bubble[] {
  const out: Bubble[] = [];
  for (const company of companies) {
    const position = layout.get(company.id);
    if (!position) continue;
    if (!isShown(company, date)) continue;
    const value = valueOn(values, company.id, date);
    if (value === null) continue;
    out.push({
      id: company.id,
      name: company.name,
      kind: company.kind,
      x: position.x,
      y: position.y,
      r: position.rMax * Math.sqrt(value / position.maxValue),
      value,
    });
  }
  return out;
}

// Deals on or before that day, merged per (from, to, kind), drawn from edge to edge.
export function arrowsOn(
  date: string,
  companies: Company[],
  values: ValuePoint[],
  deals: Deal[],
  layout: Map<string, Position> = positions(companies, values),
): Arrow[] {
  const bubbles = bubblesOn(date, companies, values, layout);
  const byId = new Map(bubbles.map((bubble) => [bubble.id, bubble]));

  const groups = new Map<
    string,
    { from: string; to: string; kind: Deal["kind"]; count: number; amount: number; known: boolean }
  >();
  for (const deal of deals) {
    if (deal.date > date) continue;
    if (!byId.has(deal.from) || !byId.has(deal.to)) continue;
    const key = `${deal.from}|${deal.to}|${deal.kind}`;
    const group = groups.get(key);
    if (group) {
      group.count += 1;
      group.amount += deal.amount_usd_bn ?? 0;
      group.known = group.known || deal.amount_usd_bn !== null;
    } else {
      groups.set(key, {
        from: deal.from,
        to: deal.to,
        kind: deal.kind,
        count: 1,
        amount: deal.amount_usd_bn ?? 0,
        known: deal.amount_usd_bn !== null,
      });
    }
  }

  // Arrows between the same two companies (any kind, either direction) are spread sideways.
  const byPair = new Map<string, Arrow[]>();
  for (const group of groups.values()) {
    const from = byId.get(group.from)!;
    const to = byId.get(group.to)!;
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const distance = Math.hypot(dx, dy);
    const ux = distance > 0 ? dx / distance : 1;
    const uy = distance > 0 ? dy / distance : 0;
    const arrow: Arrow = {
      from: group.from,
      to: group.to,
      kind: group.kind,
      count: group.count,
      amount_usd_bn: group.amount,
      amountKnown: group.known,
      x1: from.x + ux * (from.r + 0.5),
      y1: from.y + uy * (from.r + 0.5),
      x2: to.x - ux * (to.r + 0.8),
      y2: to.y - uy * (to.r + 0.8),
    };
    const pairKey = group.from < group.to ? `${group.from}|${group.to}` : `${group.to}|${group.from}`;
    const pair = byPair.get(pairKey) ?? [];
    pair.push(arrow);
    byPair.set(pairKey, pair);
  }

  const out: Arrow[] = [];
  for (const pair of byPair.values()) {
    pair.sort((a, b) => {
      const left = `${a.from}|${a.to}|${a.kind}`;
      const right = `${b.from}|${b.to}|${b.kind}`;
      return left < right ? -1 : left > right ? 1 : 0;
    });
    pair.forEach((arrow, index) => {
      if (pair.length === 1) {
        out.push(arrow);
        return;
      }
      const from = byId.get(arrow.from)!;
      const to = byId.get(arrow.to)!;
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const distance = Math.hypot(dx, dy) || 1;
      const px = -dy / distance;
      const py = dx / distance;
      const offset = (index - (pair.length - 1) / 2) * 1.2;
      arrow.x1 += px * offset;
      arrow.y1 += py * offset;
      arrow.x2 += px * offset;
      arrow.y2 += py * offset;
      out.push(arrow);
    });
  }
  return out;
}

// The sum of the values shown on that day.
export function totalOn(
  date: string,
  companies: Company[],
  values: ValuePoint[],
  layout: Map<string, Position> = positions(companies, values),
): number {
  return bubblesOn(date, companies, values, layout).reduce((sum, bubble) => sum + bubble.value, 0);
}

// "$1.2T", "$340B", "$8B".
export function formatValue(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  if (rounded >= 1000) return `$${(rounded / 1000).toFixed(1)}T`;
  const text = rounded % 1 === 0 ? String(rounded) : rounded.toFixed(1);
  return `$${text}B`;
}

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

// "14 March 2024".
export function formatDate(date: string): string {
  return dateFormatter.format(new Date(`${date}T00:00:00Z`));
}

// The latest date in the data files, not the clock.
export function defaultDate(): string {
  const dates = [
    ...values.map((point) => point.date),
    ...deals.map((deal) => deal.date),
    ...news.map((item) => item.date),
    ...companies.map((company) => company.first_mention),
  ];
  return dates.reduce((latest, date) => (date > latest ? date : latest), "2017-06-12");
}

// Thin wrappers over the real data, for the page and the renderer.
const layout = positions(companies, values);

export function bubblesForDate(date: string): Bubble[] {
  return bubblesOn(date, companies, values, layout);
}

export function arrowsForDate(date: string): Arrow[] {
  return arrowsOn(date, companies, values, deals, layout);
}

export function totalForDate(date: string): number {
  return totalOn(date, companies, values, layout);
}
