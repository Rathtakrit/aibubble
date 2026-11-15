// The Explore page's behaviour. There is one state — the selected day and, optionally, the
// selected news item or company — and everything on the page follows it.

import { companies, deals, news, valueOn, values, valuePointOn } from "../lib/data.ts";
import type { Company, NewsItem } from "../lib/data.ts";
import { arrowsForDate, bubblesForDate, defaultDate, formatValue, totalForDate } from "../lib/layout.ts";
import { renderBubble } from "../lib/bubble.ts";
import { ZOOMS } from "../lib/camera.ts";
import {
  dateAt,
  dayIndex,
  dayLabel,
  inDateOrder,
  FIRST_DAY,
  latestOnOrBefore,
  neighbour,
  PILL_LABELS,
  pillKind,
  placeLabels,
  publisherName,
} from "../lib/timeline.ts";

// Explore walks money news only, from the ChatGPT launch on; the other news waits for its own tab.
const ordered = inDateOrder(news.filter((item) => item.kind === "money" && item.date >= FIRST_DAY));
const byId = new Map(ordered.map((item) => [item.id, item]));
const place = new Map(ordered.map((item, index) => [item.id, index + 1]));
const nameOf = new Map(companies.map((company) => [company.id, company.name]));
const companyById = new Map(companies.map((company) => [company.id, company]));
const lastDate = defaultDate();
const lastDay = dayIndex(lastDate);
const newest: NewsItem | undefined = ordered[ordered.length - 1];

// What the site says about each kind of value, in plain words, the first time it is shown.
const VALUE_NOTES: Record<Company["kind"], string> = {
  listed: "Market value: what all of the company's shares are worth.",
  private: "Value at its last funding round.",
  group: "Several smaller companies, added together.",
};

// The two things the page remembers: the day, and the news item or company chosen for it.
let day = newest ? newest.date : lastDate;
let itemId: string | null = newest ? newest.id : null;
let companyId: string | null = null;
// The reader's own zoom on top of the camera; index 1 = follow the players exactly.
let zoomIndex = 1;

function setText(name: string, text: string): void {
  for (const element of document.querySelectorAll<HTMLElement>(`[data-bind="${name}"]`)) {
    element.textContent = text;
  }
}

function namesOf(item: NewsItem): string {
  return item.players.map((id) => nameOf.get(id) ?? id).join(", ");
}

// The companies on the company's money lines that day: the ones the camera frames with it.
function partnersOf(id: string, date: string): string[] {
  const out: string[] = [];
  for (const arrow of arrowsForDate(date)) {
    const other = arrow.from === id ? arrow.to : arrow.to === id ? arrow.from : null;
    if (other === null || out.includes(other)) continue;
    out.push(other);
  }
  return out;
}

function isCompanyShown(id: string, date: string): boolean {
  return bubblesForDate(date).some((bubble) => bubble.id === id);
}

// The company's news rows, newest first, are rebuilt only when the company or the day changes,
// so dragging the slider keeps the list where the reader left it.
let rowsKey = "";

function renderCompany(company: Company): void {
  setText("company-name", company.name);
  const value = valueOn(values, company.id, day);
  setText("company-value", value === null ? "" : `${formatValue(value)} on ${dayLabel(day)}`);
  setText("company-note", VALUE_NOTES[company.kind]);

  // The sourced point the value shown is drawn from.
  const point = valuePointOn(values, company.id, day);
  for (const link of document.querySelectorAll<HTMLAnchorElement>('[data-bind="company-source"]')) {
    link.hidden = point === null;
    if (point === null) continue;
    const publisher = publisherName(point.source);
    link.href = point.source;
    link.textContent = `Last sourced value: ${formatValue(point.value_usd_bn)} · ${publisher} · ${dayLabel(point.date)} ↗`;
    link.setAttribute("aria-label", `Source: ${publisher}, opens in a new tab`);
  }

  const key = `${company.id}|${day}`;
  if (key === rowsKey) return;
  rowsKey = key;
  const own = ordered.filter((one) => one.date <= day && one.players.includes(company.id)).reverse();
  for (const list of document.querySelectorAll<HTMLUListElement>('[data-bind="company-news"]')) {
    list.textContent = "";
    for (const one of own) {
      const row = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button";
      button.className = "company-news-row";
      button.dataset.news = one.id;
      const date = document.createElement("span");
      date.className = "company-news-date";
      date.textContent = dayLabel(one.date);
      const title = document.createElement("span");
      title.className = "company-news-title";
      title.textContent = one.title;
      button.append(date, title);
      row.appendChild(button);
      list.appendChild(row);
    }
  }
  for (const empty of document.querySelectorAll<HTMLElement>('[data-bind="company-news-empty"]')) {
    empty.hidden = own.length > 0;
  }
}

function render(soon = false): void {
  // A company the chosen day does not show goes back to the quiet day.
  if (companyId !== null && !isCompanyShown(companyId, day)) companyId = null;
  const item = itemId === null ? null : (byId.get(itemId) ?? null);
  const company = companyId === null ? null : (companyById.get(companyId) ?? null);
  // In the quieter state the column follows the latest item on or before the chosen day.
  const anchor = item ?? latestOnOrBefore(ordered, day);
  const count = ordered.length;

  // Which of the states the card is in. A day before every item has no latest item to offer.
  const state = company !== null ? "company" : item !== null ? "item" : anchor !== null ? "quiet" : "none";
  for (const block of document.querySelectorAll<HTMLElement>("[data-block]")) {
    block.hidden = block.dataset.block !== state;
  }

  if (item) {
    setText("kicker-desktop", `Explore · news ${place.get(item.id)} of ${count}`);
    setText("kicker-phone", `News ${place.get(item.id)} of ${count} · ${dayLabel(item.date)}`);
    setText("title", item.title);
    setText("summary", item.summary);
    setText("names-desktop", namesOf(item));
    setText("names-phone", namesOf(item));
    for (const line of document.querySelectorAll<HTMLElement>("[data-players-line]")) {
      line.hidden = item.players.length === 0;
    }
    const kind = pillKind(item, deals);
    for (const pill of document.querySelectorAll<HTMLElement>('[data-bind="pill"]')) {
      pill.className = `pill pill-${kind}`;
    }
    setText("pill-label", PILL_LABELS[kind]);
    for (const link of document.querySelectorAll<HTMLAnchorElement>('[data-bind="source"]')) {
      const publisher = publisherName(item.source);
      link.href = item.source;
      link.textContent = `${publisher} · ${dayLabel(item.date)} ↗`;
      link.setAttribute("aria-label", `Source: ${publisher}, opens in a new tab`);
    }
  } else if (company) {
    setText("kicker-desktop", `Explore · ${dayLabel(day)}`);
    setText("kicker-phone", `Explore · ${dayLabel(day)}`);
    renderCompany(company);
  } else {
    setText("kicker-desktop", `Explore · ${dayLabel(day)}`);
    setText("kicker-phone", `Explore · ${dayLabel(day)}`);
    setText("latest-title", anchor ? anchor.title : "");
  }

  setText("date", dayLabel(day));
  setText(
    "companies",
    `All AI companies on ${dayLabel(day)} · total ${formatValue(totalForDate(day))}`,
  );

  for (const marker of document.querySelectorAll<HTMLElement>("[data-news]")) {
    marker.classList.toggle("is-current", item !== null && marker.dataset.news === item.id);
  }
  for (const slider of document.querySelectorAll<HTMLInputElement>("[data-slider]")) {
    slider.value = String(dayIndex(day));
  }

  // Earlier and Later walk every news item in date order and stop at the ends.
  const at = anchor ? ordered.findIndex((one) => one.id === anchor.id) : -1;
  for (const button of document.querySelectorAll<HTMLButtonElement>('[data-action="earlier"]')) {
    button.disabled = at <= 0;
  }
  for (const button of document.querySelectorAll<HTMLButtonElement>('[data-action="later"]')) {
    button.disabled = at < 0 || at >= count - 1;
  }

  // The zoom buttons step through the reader's own zoom, and stop at the ends.
  for (const button of document.querySelectorAll<HTMLButtonElement>('[data-zoom="in"]')) {
    button.disabled = zoomIndex >= ZOOMS.length - 1;
  }
  for (const button of document.querySelectorAll<HTMLButtonElement>('[data-zoom="out"]')) {
    button.disabled = zoomIndex <= 0;
  }

  // The bubble follows the day; a chosen item frames its players, a chosen company frames itself
  // and the companies it has money lines with, and a plain day shows the whole frame.
  const players = item ? item.players : company ? [company.id, ...partnersOf(company.id, day)] : [];
  for (const svg of document.querySelectorAll<SVGSVGElement>("[data-bubble]")) {
    renderBubble(svg, day, { players, focus: company?.id, manual: ZOOMS[zoomIndex] });
  }

  if (soon) writeAddressSoon();
  else writeAddress();
}

// The address keeps working for ?date=YYYY-MM-DD, ?news=<news id> and ?company=<company id>, so a
// view can be linked. While the slider is dragged it is written once the reader pauses, which keeps
// phone browsers happy.
let addressTimer: ReturnType<typeof setTimeout> | null = null;

function writeAddress(): void {
  if (addressTimer !== null) {
    clearTimeout(addressTimer);
    addressTimer = null;
  }
  const params = new URLSearchParams({ date: day });
  if (itemId !== null) params.set("news", itemId);
  else if (companyId !== null) params.set("company", companyId);
  history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
}

function writeAddressSoon(): void {
  if (addressTimer !== null) clearTimeout(addressTimer);
  addressTimer = setTimeout(writeAddress, 200);
}

function selectItem(id: string): void {
  const item = byId.get(id);
  if (!item) return;
  itemId = item.id;
  companyId = null;
  day = item.date;
  zoomIndex = 1;
  render();
}

// A bubble opens its company; the same company again, or Back, goes to the quiet day.
function chooseCompany(id: string): void {
  if (!companyById.has(id)) return;
  companyId = companyId === id ? null : id;
  itemId = null;
  zoomIndex = 1;
  render();
}

function clearCompany(): void {
  companyId = null;
  itemId = null;
  render();
}

function step(direction: -1 | 1): void {
  const anchor = (itemId === null ? undefined : byId.get(itemId)) ?? latestOnOrBefore(ordered, day);
  const target = anchor
    ? neighbour(ordered, anchor.id, direction)
    : (ordered[direction === 1 ? 0 : ordered.length - 1] ?? null);
  if (target) selectItem(target.id);
}

function moveTo(index: number): void {
  day = dateAt(Math.min(lastDay, Math.max(0, index)));
  itemId = null;
  zoomIndex = 1;
  render(true);
}

document.addEventListener("click", (event) => {
  const target = event.target instanceof Element ? event.target : null;
  const control = target?.closest<HTMLElement>("[data-news], [data-action], [data-zoom]");
  if (!control) return;

  if (control.dataset.news) {
    selectItem(control.dataset.news);
    return;
  }

  const action = control.dataset.action;
  if (action === "earlier") {
    step(-1);
  } else if (action === "later") {
    step(1);
  } else if (action === "latest") {
    const anchor = latestOnOrBefore(ordered, day);
    if (anchor) selectItem(anchor.id);
  } else if (action === "company-back") {
    clearCompany();
  }

  const zoom = control.dataset.zoom;
  if (zoom === "in") {
    zoomIndex = Math.min(ZOOMS.length - 1, zoomIndex + 1);
    render();
  } else if (zoom === "out") {
    zoomIndex = Math.max(0, zoomIndex - 1);
    render();
  } else if (zoom === "fit") {
    zoomIndex = 1;
    render();
  }
});

for (const slider of document.querySelectorAll<HTMLInputElement>("[data-slider]")) {
  slider.addEventListener("input", () => {
    moveTo(Number(slider.value));
  });
}

// A bubble is a button: a click or a tap on it, or Tab to it and Enter or Space, opens that
// company's panel in the text column.
for (const svg of document.querySelectorAll<SVGSVGElement>("[data-bubble]")) {
  const companyAt = (event: Event): string | null => {
    const target = event.target instanceof Element ? event.target : null;
    return target?.closest<SVGElement>("[data-company]")?.getAttribute("data-company") ?? null;
  };
  svg.addEventListener("click", (event) => {
    const id = companyAt(event);
    if (id) chooseCompany(id);
  });
  svg.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const id = companyAt(event);
    if (!id) return;
    event.preventDefault();
    chooseCompany(id);
  });
}

// Read the address once, then draw. Without a day, a company or an item the newest item shows.
function readAddress(): void {
  const params = new URLSearchParams(window.location.search);
  const wantedId = params.get("news");
  const wanted = wantedId ? byId.get(wantedId) : undefined;
  if (wanted) {
    itemId = wanted.id;
    day = wanted.date;
    return;
  }
  const wantedDate = params.get("date");
  // Kept inside the range of the slider, and written back as a real calendar day.
  const calendarDate =
    wantedDate && /^\d{4}-\d{2}-\d{2}$/.test(wantedDate) && !Number.isNaN(Date.parse(wantedDate))
      ? dateAt(Math.min(lastDay, Math.max(0, dayIndex(wantedDate))))
      : null;
  const wantedCompany = params.get("company");
  const company = wantedCompany ? companyById.get(wantedCompany) : undefined;
  if (company) {
    companyId = company.id;
    itemId = null;
    day = calendarDate ?? lastDate;
    return;
  }
  if (calendarDate) {
    itemId = null;
    day = calendarDate;
    return;
  }
  if (params.has("news") || params.has("company") || params.has("date")) {
    // A day, an item or a company was asked for but is not in the data: show the whole frame
    // for today.
    itemId = null;
    day = lastDate;
    return;
  }
  if (newest) {
    itemId = newest.id;
    day = newest.date;
  }
}

readAddress();
render();

// The titles above the timeline are placed from their real widths, on the first of the two heights
// that has room; one that fits on neither is hidden rather than drawn over another.
function placeTimelineLabels(): void {
  const inner = document.querySelector<HTMLElement>("[data-timeline]");
  if (!inner) return;
  const labels = Array.from(inner.querySelectorAll<HTMLElement>("[data-timeline-label]"));
  if (labels.length === 0) return;

  for (const label of labels) label.hidden = false;
  const placed = placeLabels(
    labels.map((label, index) => ({
      id: String(index),
      percent: Number.parseFloat(label.style.left) || 0,
      width: label.offsetWidth,
    })),
    inner.clientWidth,
    10,
  );

  labels.forEach((label, index) => {
    const spot = placed.get(String(index));
    label.hidden = spot === undefined;
    if (!spot) return;
    label.dataset.row = String(spot.row);
    label.dataset.align = spot.align;
  });
}

placeTimelineLabels();
window.addEventListener("resize", placeTimelineLabels);
document.fonts.ready.then(placeTimelineLabels, () => {});
