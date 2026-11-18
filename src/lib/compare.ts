import aiCompanies from "../../data/companies.json" with { type: "json" };
import aiValues from "../../data/values.json" with { type: "json" };
import dotcomCompanies from "../../data/past/dotcom/companies.json" with { type: "json" };
import dotcomValues from "../../data/past/dotcom/values.json" with { type: "json" };
import housingCompanies from "../../data/past/housing/companies.json" with { type: "json" };
import housingValues from "../../data/past/housing/values.json" with { type: "json" };
import type { Company, DatasetId, ValuePoint } from "./data.ts";
import { dayLayouts, formatValue } from "./layout.ts";
import { FIRST_DAY } from "./timeline.ts";

export type CompareDataset = { id: DatasetId; companies: Company[]; values: ValuePoint[] };
export type Moment = "peak" | "start" | "lowest" | "latest";
export const datasets: CompareDataset[] = [
  { id: "ai", companies: aiCompanies.items as Company[], values: aiValues.items as ValuePoint[] },
  { id: "dotcom", companies: dotcomCompanies.items as Company[], values: dotcomValues.items as ValuePoint[] },
  { id: "housing", companies: housingCompanies.items as Company[], values: housingValues.items as ValuePoint[] },
];

export function momentOptions(id: DatasetId): { id: Moment | "date"; label: string }[] {
  return [
    { id: "start", label: "Start" },
    { id: "lowest", label: "Lowest" },
    ...(id === "ai"
      ? [{ id: "latest" as const, label: "Current" }]
      : [{ id: "peak" as const, label: "Peak" }, { id: "latest" as const, label: "Latest" }]),
    { id: "date", label: "Date…" },
  ];
}

export function totalOn(dataset: CompareDataset, date: string) {
  const latest = new Map<string, ValuePoint>();
  for (const point of dataset.values) {
    if (point.date > date) continue;
    const previous = latest.get(point.company);
    if (!previous || previous.date <= point.date) latest.set(point.company, point);
  }
  const values = dataset.companies.flatMap((company) => {
    const point = latest.get(company.id);
    return point ? [{ company, value: point.value_usd_bn, point }] : [];
  });
  return { values, total: values.reduce((sum, entry) => sum + entry.value, 0) };
}

export function moments(dataset: CompareDataset): Record<Moment, string | null> {
  const ids = new Set(dataset.companies.map((company) => company.id));
  const dates = [...new Set(dataset.values.filter((point) => ids.has(point.company)).map((point) => point.date))].sort();
  const start = dates[0] ?? null;
  const latest = dates.at(-1) ?? null;
  let peak = start;
  let highest = -Infinity;
  for (const date of dates) {
    const total = totalOn(dataset, date).total;
    if (total > highest) { highest = total; peak = date; }
  }
  let lowest: string | null = null;
  let smallest = Infinity;
  for (const date of dates.slice(1)) {
    const total = totalOn(dataset, date).total;
    if (total < smallest) { smallest = total; lowest = date; }
  }
  return { start, lowest, peak: dataset.id === "ai" ? latest : peak, latest };
}

// A zero baseline has no finite percentage change.
export function percentDifference(a: number, b: number): number | null {
  return b === 0 ? (a === 0 ? 0 : null) : (a - b) / b * 100;
}

export function comparisonLine(a: number, b: number): string {
  const percent = percentDifference(a, b);
  if (percent === null) return "A has value; B has no recorded value selected";
  if (Math.abs(percent) <= 1) return "A and B are about the same size";
  return `A is ${Math.round(Math.abs(percent))}% ${percent > 0 ? "bigger" : "smaller"} than B`;
}

export function top5(dataset: CompareDataset, date: string) {
  return totalOn(dataset, date).values
    .filter((entry) => entry.company.kind !== "group")
    .sort((a, b) => b.value - a.value || a.company.id.localeCompare(b.company.id))
    .slice(0, 5);
}

export function formatTotal(value: number): string {
  return formatValue(value >= 1000 ? value : Math.round(value));
}

// Pack a single carried-record snapshot, not the interpolated timeline. The artificial
// day and lifetimes are local copies, so Compare never changes the site's active dataset.
export function packedOn(dataset: CompareDataset, date: string) {
  const snapshot = totalOn(dataset, date).values.filter((entry) => entry.value > 0);
  const companies = snapshot.map(({ company }) => ({ ...company, first_mention: FIRST_DAY, ended: undefined }));
  const values = snapshot.map(({ point }) => ({ ...point, date: FIRST_DAY }));
  const layout = dayLayouts(companies, values, [], FIRST_DAY);
  const placed = layout.days.get(FIRST_DAY)!;
  return snapshot.map((entry) => ({ ...entry, ...placed.get(entry.company.id)! }));
}
