import companiesJson from "../../data/companies.json" with { type: "json" };
import valuesJson from "../../data/values.json" with { type: "json" };
import dealsJson from "../../data/deals.json" with { type: "json" };
import newsJson from "../../data/news.json" with { type: "json" };

export type DataStatus = "sample" | "draft" | "approved";

export type Company = {
  id: string;
  name: string;
  kind: "listed" | "private" | "group";
  ticker?: string;
  members?: string[];
  first_mention: string;
  source: string;
};

export type ValuePoint = {
  company: string;
  date: string;
  value_usd_bn: number;
  what: string;
  source: string;
};

export type Deal = {
  id: string;
  date: string;
  from: string;
  to: string;
  kind: "investment" | "cloud" | "chip";
  amount_usd_bn: number | null;
  amount_type: "paid" | "committed" | "up to" | "reported";
  title: string;
  source: string;
};

export type NewsItem = {
  id: string;
  date: string;
  title: string;
  summary: string;
  players: string[];
  kind: "science" | "money";
  key_date: boolean;
  source: string;
};

export const status = companiesJson.status as DataStatus;
export const companies = companiesJson.items as unknown as Company[];
export const values = valuesJson.items as unknown as ValuePoint[];
export const deals = dealsJson.items as unknown as Deal[];
export const news = newsJson.items as unknown as NewsItem[];

const DAY_MS = 86_400_000;

function daysBetween(from: string, to: string): number {
  return (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / DAY_MS;
}

// The company's value on that day: a straight line between its neighbouring points,
// flat before the first point and after the last. Null if it has no points.
export function valueOn(points: ValuePoint[], companyId: string, date: string): number | null {
  const own = points
    .filter((point) => point.company === companyId)
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  if (own.length === 0) return null;
  if (date <= own[0].date) return own[0].value_usd_bn;

  const last = own[own.length - 1];
  if (date >= last.date) return last.value_usd_bn;

  for (let index = 1; index < own.length; index += 1) {
    const before = own[index - 1];
    const after = own[index];
    if (date > after.date) continue;
    const span = daysBetween(before.date, after.date);
    if (span === 0) return after.value_usd_bn;
    const walked = daysBetween(before.date, date);
    return before.value_usd_bn + ((after.value_usd_bn - before.value_usd_bn) * walked) / span;
  }

  return last.value_usd_bn;
}

// The sourced point behind the value shown on that day: the company's latest point on or
// before the day, or its first point when the day is earlier than all of them. Null with no
// points.
export function valuePointOn(points: ValuePoint[], companyId: string, date: string): ValuePoint | null {
  let first: ValuePoint | null = null;
  let latest: ValuePoint | null = null;
  for (const point of points) {
    if (point.company !== companyId) continue;
    if (first === null || point.date < first.date) first = point;
    if (point.date > date) continue;
    if (latest === null || point.date > latest.date) latest = point;
  }
  return latest ?? first;
}

// A company is shown only from its first_mention on.
export function isShown(company: Company, date: string): boolean {
  return date >= company.first_mention;
}
