import aiCompaniesJson from "../../data/companies.json" with { type: "json" };
import aiValuesJson from "../../data/values.json" with { type: "json" };
import aiDealsJson from "../../data/deals.json" with { type: "json" };
import aiNewsJson from "../../data/news.json" with { type: "json" };
import dotcomCompaniesJson from "../../data/past/dotcom/companies.json" with { type: "json" };
import dotcomValuesJson from "../../data/past/dotcom/values.json" with { type: "json" };
import dotcomDealsJson from "../../data/past/dotcom/deals.json" with { type: "json" };
import dotcomNewsJson from "../../data/past/dotcom/news.json" with { type: "json" };
import dotcomMetaJson from "../../data/past/dotcom/meta.json" with { type: "json" };
import housingCompaniesJson from "../../data/past/housing/companies.json" with { type: "json" };
import housingValuesJson from "../../data/past/housing/values.json" with { type: "json" };
import housingDealsJson from "../../data/past/housing/deals.json" with { type: "json" };
import housingNewsJson from "../../data/past/housing/news.json" with { type: "json" };
import housingMetaJson from "../../data/past/housing/meta.json" with { type: "json" };
import { setFirstDay } from "./timeline.ts";

export type DataStatus = "sample" | "draft" | "approved";

export type Company = {
  id: string;
  name: string;
  kind: "listed" | "private" | "group";
  ticker?: string;
  members?: string[];
  first_mention: string;
  // The last day the company is in the picture: the day it was bought, failed or was taken over.
  // It is gone from the next day. Absent when it is still there at the end of the set.
  ended?: string;
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
  // The id the data set lists in its meta.json kinds, or one of the AI set's investment, cloud
  // and chip.
  kind: string;
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
  // A smaller event: a blue dot on the timeline rather than a red one, never both.
  small_date?: boolean;
  // The short text the timeline shows for the item, in place of its title.
  label?: string;
  source: string;
};

// One kind of money line: the id the data uses and the plain name the page shows.
export type DealKind = { id: string; label: string };

export type DatasetId = "ai" | "dotcom" | "housing";

// The shape of a past folder's meta.json: what the folder holds and the days it covers.
type MetaFile = { title: string; first_day: string; last_day: string; kinds: DealKind[] };

// One data set: the four files, the words the page needs, and the days it covers.
type Dataset = {
  id: DatasetId;
  // What the page calls the set in its kicker: "Explore" for the AI bubble, which has always
  // said so, and the set's own title for a past one.
  title: string;
  status: DataStatus;
  companies: Company[];
  values: ValuePoint[];
  deals: Deal[];
  news: NewsItem[];
  kinds: DealKind[];
  firstDay: string;
  // Null when the set ends on the latest day in its files, as the AI bubble's always has.
  lastDay: string | null;
};

const DAY_MS = 86_400_000;

// The latest day any of the set's files mentions.
function latestDateOf(set: Pick<Dataset, "companies" | "values" | "deals" | "news" | "firstDay">): string {
  const dates = [
    ...set.values.map((point) => point.date),
    ...set.deals.map((deal) => deal.date),
    ...set.news.map((item) => item.date),
    ...set.companies.map((company) => company.first_mention),
  ];
  return dates.reduce((latest, date) => (date > latest ? date : latest), set.firstDay);
}

function companiesOf(file: { items: unknown[] }): Company[] {
  return file.items as unknown as Company[];
}

const DOTCOM_META = dotcomMetaJson as MetaFile;
const HOUSING_META = housingMetaJson as MetaFile;

const DATASETS: Record<DatasetId, Dataset> = {
  ai: {
    id: "ai",
    title: "Explore",
    status: aiCompaniesJson.status as DataStatus,
    companies: companiesOf(aiCompaniesJson),
    values: aiValuesJson.items as unknown as ValuePoint[],
    deals: aiDealsJson.items as unknown as Deal[],
    news: aiNewsJson.items as unknown as NewsItem[],
    // The three kinds the AI page has always drawn its money lines in.
    kinds: [
      { id: "investment", label: "Investment" },
      { id: "cloud", label: "Cloud deal" },
      { id: "chip", label: "Chip deal" },
    ],
    firstDay: "2022-11-30",
    lastDay: null,
  },
  dotcom: {
    id: "dotcom",
    title: DOTCOM_META.title,
    status: dotcomCompaniesJson.status as DataStatus,
    companies: companiesOf(dotcomCompaniesJson),
    values: dotcomValuesJson.items as unknown as ValuePoint[],
    deals: dotcomDealsJson.items as unknown as Deal[],
    news: dotcomNewsJson.items as unknown as NewsItem[],
    kinds: DOTCOM_META.kinds,
    firstDay: DOTCOM_META.first_day,
    lastDay: DOTCOM_META.last_day,
  },
  housing: {
    id: "housing",
    title: HOUSING_META.title,
    status: housingCompaniesJson.status as DataStatus,
    companies: companiesOf(housingCompaniesJson),
    values: housingValuesJson.items as unknown as ValuePoint[],
    deals: housingDealsJson.items as unknown as Deal[],
    news: housingNewsJson.items as unknown as NewsItem[],
    kinds: HOUSING_META.kinds,
    firstDay: HOUSING_META.first_day,
    lastDay: HOUSING_META.last_day,
  },
};

// The active data set's files. "ai" is active when the module loads.
export let datasetId: DatasetId = "ai";
export let datasetTitle: string = DATASETS.ai.title;
export let status: DataStatus = DATASETS.ai.status;
export let companies: Company[] = DATASETS.ai.companies;
export let values: ValuePoint[] = DATASETS.ai.values;
export let deals: Deal[] = DATASETS.ai.deals;
export let news: NewsItem[] = DATASETS.ai.news;
export let kinds: DealKind[] = DATASETS.ai.kinds;
// The last day of the set: its meta.json last_day for a past one, the latest date in the files
// for the AI bubble.
export let LAST_DAY: string = DATASETS.ai.lastDay ?? latestDateOf(DATASETS.ai);

// Makes one data set active for everything that follows. The day scale starts on its first day
// too (see FIRST_DAY in timeline.ts).
// shortcut: one data set is active at a time; pass the data set through when two must show on one page
export function useDataset(id: DatasetId): void {
  const set = DATASETS[id];
  datasetId = set.id;
  datasetTitle = set.title;
  status = set.status;
  companies = set.companies;
  values = set.values;
  deals = set.deals;
  news = set.news;
  kinds = set.kinds;
  LAST_DAY = set.lastDay ?? latestDateOf(set);
  setFirstDay(set.firstDay);
}

// The three money-line colours, in order: a set's first, second and third kind use them.
const KIND_COLOURS = ["investment", "cloud", "chip"] as const;

// The colour a deal kind is drawn in: its place in the active set's kind list picks one of the
// three. A kind the set does not list is drawn in the quiet ink colour.
export function kindColour(kind: string): string {
  const at = kinds.findIndex((one) => one.id === kind);
  return at >= 0 ? (KIND_COLOURS[at] ?? "ink-2") : "ink-2";
}

// The pill's colour class: Science and Money have their own, and a deal kind takes the colour
// of its money line.
export function pillClass(kind: string): string {
  if (kind === "science" || kind === "money") return kind;
  return kindColour(kind);
}

// What the pill says: "Science", "Money", or the active set's own name for its deal kind.
export function pillLabel(kind: string): string {
  if (kind === "science") return "Science";
  if (kind === "money") return "Money";
  return kinds.find((one) => one.id === kind)?.label ?? kind;
}

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

// A company is shown from its first_mention to its ended day, both included.
export function isShown(company: Company, date: string): boolean {
  if (date < company.first_mention) return false;
  return company.ended === undefined || date <= company.ended;
}
