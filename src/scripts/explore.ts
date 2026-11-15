// The Explore page's behaviour. There is one state — the selected day and, optionally, the
// selected news item — and everything on the page follows it.

import { companies, deals, news } from "../lib/data.ts";
import type { NewsItem } from "../lib/data.ts";
import { defaultDate, formatValue, totalForDate } from "../lib/layout.ts";
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
const lastDate = defaultDate();
const lastDay = dayIndex(lastDate);
const newest: NewsItem | undefined = ordered[ordered.length - 1];

// The two things the page remembers: the day, and the news item when one is chosen.
let day = newest ? newest.date : lastDate;
let itemId: string | null = newest ? newest.id : null;
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

function render(soon = false): void {
  const item = itemId === null ? null : (byId.get(itemId) ?? null);
  // In the quieter state the column follows the latest item on or before the chosen day.
  const anchor = item ?? latestOnOrBefore(ordered, day);
  const count = ordered.length;

  // Which of the two states the card is in. A day before every item has no latest item to offer.
  for (const block of document.querySelectorAll<HTMLElement>("[data-block]")) {
    block.hidden =
      block.dataset.block === "item" ? item === null : item !== null || anchor === null;
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

  // The bubble follows the day; a chosen item frames its players, a plain day shows the whole frame.
  const players = item ? item.players : [];
  for (const svg of document.querySelectorAll<SVGSVGElement>("[data-bubble]")) {
    renderBubble(svg, day, { players, manual: ZOOMS[zoomIndex] });
  }

  if (soon) writeAddressSoon();
  else writeAddress();
}

// The address keeps working for ?date=YYYY-MM-DD and ?news=<news id>, so a view can be linked.
// While the slider is dragged it is written once the reader pauses, which keeps phone browsers happy.
let addressTimer: ReturnType<typeof setTimeout> | null = null;

function writeAddress(): void {
  if (addressTimer !== null) {
    clearTimeout(addressTimer);
    addressTimer = null;
  }
  const params = new URLSearchParams({ date: day });
  if (itemId !== null) params.set("news", itemId);
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
  day = item.date;
  zoomIndex = 1;
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

// Read the address once, then draw. Without a day or an item the newest item shows.
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
  if (wantedDate && /^\d{4}-\d{2}-\d{2}$/.test(wantedDate) && !Number.isNaN(Date.parse(wantedDate))) {
    // Kept inside the range of the slider, and written back as a real calendar day.
    itemId = null;
    day = dateAt(Math.min(lastDay, Math.max(0, dayIndex(wantedDate))));
    return;
  }
  if (params.has("news") || params.has("date")) {
    // A day or an item was asked for but is not in the data: show the whole frame for today.
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
