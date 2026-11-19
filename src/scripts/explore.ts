// The page's behaviour, Explore and Story (the AI bubble only; a past bubble has no Story):
// there is one state — the selected day with, optionally, the selected news item or company, or
// the chapter being read — and everything on the page follows it.

import {
  companies,
  burst,
  datasetId,
  deals,
  news,
  LAST_DAY,
  pillClass,
  pillLabel,
  useDataset,
  valueOn,
  values,
  valuePointOn,
} from "../lib/data.ts";
import type { Company, NewsItem } from "../lib/data.ts";
import { arrowsForDate, bubblesForDate, defaultDate, formatValue, installLayouts, totalForDate } from "../lib/layout.ts";
import type { DayLayouts } from "../lib/layout.ts";
import workerUrl from "./layout.worker.ts?worker&url";
import { layoutCacheKey, layoutStore, loadLayouts } from "./layout-cache.ts";
import { bubbleAtPoint, renderBubble } from "../lib/bubble.ts";
import { clampPan, dayView, panView, peakDay, zoomBy } from "../lib/camera.ts";
import type { CameraView } from "../lib/camera.ts";
import type { Chapter } from "../lib/story.ts";
import { SHEET_TAP_PX, snapSheet } from "../lib/sheet.ts";
import type { SheetState } from "../lib/sheet.ts";
import {
  dateAt,
  dayIndex,
  dayLabel,
  inDateOrder,
  FIRST_DAY,
  latestOnOrBefore,
  neighbour,
  pillKind,
  placeLabels,
  publisherName,
  stepDateLabel,
  type LabelRect,
  timelineScale,
  timelineStrip,
  timelineWindow,
  windowPercent,
  windowPlace,
  type TimelineWindow,
} from "../lib/timeline.ts";

// The page says which data set it shows; it is chosen before anything is read from the data.
const requested = document.body.dataset.dataset;
useDataset(requested === "dotcom" || requested === "housing" ? requested : "ai");
// A past page has no Story mode: no chapters, and ?chapter= is ignored.
const isPast = datasetId !== "ai";
const peak = burst ? peakDay(FIRST_DAY, burst.date, totalForDate) : undefined;
let layoutsReady = false;
function computeLayouts(): Promise<DayLayouts> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(workerUrl, { type: "module" });
    worker.onmessage = (event: MessageEvent<DayLayouts>) => {
      worker.terminate();
      resolve(event.data);
    };
    worker.onerror = () => {
      worker.terminate();
      reject(new Error("Bubble layouts could not load. Reload the page to try again."));
    };
    worker.postMessage(datasetId);
  });
}

async function prepareLayouts(): Promise<void> {
  const install = (layouts: DayLayouts) => {
    installLayouts(datasetId, layouts);
    layoutsReady = true;
    render();
  };
  let key: string;
  try {
    key = await layoutCacheKey(datasetId, workerUrl, { companies, values, deals, news, last: LAST_DAY });
  } catch {
    // A browser without a working digest can still use the worker, without caching.
    install(await computeLayouts());
    return;
  }
  await loadLayouts(layoutStore, datasetId, key, computeLayouts, install);
}
const STORY_ENABLED = document.body.dataset.storyEnabled === "true";

// Explore walks money news only, from the set's first day on; the other news waits for its own tab.
const ordered = inDateOrder(news.filter((item) => item.kind === "money" && item.date >= FIRST_DAY));
const byId = new Map(ordered.map((item) => [item.id, item]));
const nameOf = new Map(companies.map((company) => [company.id, company.name]));
const companyById = new Map(companies.map((company) => [company.id, company]));
const lastDate = defaultDate();
const lastDay = dayIndex(lastDate);
const newest: NewsItem | undefined = ordered[ordered.length - 1];
// The timeline's day scale, built once from the days that carry a dot: busy months are wider.
const scale = timelineScale(lastDate, {
  red: ordered.filter((item) => item.key_date),
  blue: ordered.filter((item) => item.small_date),
});
// Story mode's chapters, written into the page while it was built so the browser never reads
// docs/story itself.
const chaptersData = document.querySelector<HTMLScriptElement>("[data-story-chapters]");
const chapters: Chapter[] = chaptersData?.textContent
  ? (JSON.parse(chaptersData.textContent) as Chapter[])
  : [];

// What the site says about each kind of value, in plain words, the first time it is shown.
const VALUE_NOTES: Record<Company["kind"], string> = {
  listed: "Market value: what all of the company's shares are worth.",
  private: "Value at its last funding round.",
  group: "Several smaller companies, added together.",
};

// The three things the page remembers: the day, the news item or company chosen for it, and the
// chapter being read. A chapter is a mode: while one is open the page is Story, not Explore.
let day = newest ? newest.date : lastDate;
let itemId: string | null = newest ? newest.id : null;
let companyId: string | null = null;
let chapterIndex: number | null = null;
// Whether "Read the story" has the list of chapters open.
let storyListOpen = false;
let fitPlayers = false;
let manual = 1;
let changeFromPeak: string | undefined;
// The picture's pan, in the bubble's own units (the 0–100 viewBox).
let pan = { dx: 0, dy: 0 };
let timelineZoomed = true;
const fullTimeline: TimelineWindow = { start: 0, middle: 50, end: 100, ids: [] };
let visibleTimeline = fullTimeline;
let timelineTarget = fullTimeline;
let timelineFrame: number | null = null;
const timelineMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const stepRow = document.querySelector<HTMLElement>("[data-steps] > .step-row");
let lastStep = -1;
let stopStepGlide: (() => void) | undefined;
const timelineEvents = ordered;
const stripFirst = isPast ? FIRST_DAY : "2017-06-12";
const stripLast = LAST_DAY;
const strip = timelineStrip(stripFirst, stripLast);
const stripDots = document.querySelector<HTMLElement>("[data-strip-dots]");
for (const item of timelineEvents) {
  const dot = document.createElement("span");
  dot.style.left = `${strip.percentOf(item.date)}%`;
  stripDots?.append(dot);
}
const stripYears = document.querySelector<HTMLElement>("[data-strip-years]");
const yearTicks = [{ date: stripFirst, label: new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${stripFirst}T00:00:00Z`)) }];
for (let year = Number(stripFirst.slice(0, 4)) + 2; year < Number(stripLast.slice(0, 4)); year += 2) {
  yearTicks.push({ date: `${year}-01-01`, label: String(year) });
}
yearTicks.push({ date: stripLast, label: dayLabel(stripLast) });
for (const tick of yearTicks) {
  const label = document.createElement("span");
  label.style.left = `${strip.percentOf(tick.date)}%`;
  label.textContent = tick.label;
  stripYears?.append(label);
}

function drawTimeline(): void {
  const current = Math.max(0, Math.min(100, windowPercent(scale.percentOf(day), visibleTimeline)));
  const inner = document.querySelector<HTMLElement>("[data-timeline]");
  inner?.style.setProperty("--timeline-current", `${current}%`);
  const marker = document.querySelector<HTMLElement>("[data-timeline-current]");
  if (marker) {
    marker.style.left = `${current}%`;
    const flag = marker.querySelector<HTMLElement>("[data-current-flag]");
    if (flag && inner) {
      flag.textContent = `You are here · ${dayLabel(day)}`;
      const x = inner.clientWidth * current / 100;
      flag.style.left = `${Math.max(-x, Math.min(-flag.offsetWidth / 2, inner.clientWidth - x - flag.offsetWidth))}px`;
    }
  }
  const firstShown = scale.dateOf(visibleTimeline.start);
  const lastShown = scale.dateOf(visibleTimeline.end);
  const summary = document.querySelector<HTMLElement>("[data-timeline-summary]");
  if (summary) summary.textContent = `${dayLabel(firstShown)} → ${dayLabel(lastShown)}`;
  const bracket = timelineZoomed ? strip.bracket(firstShown, lastShown) : { left: 0, width: 100 };
  const bracketElement = document.querySelector<HTMLElement>("[data-strip-bracket]");
  if (bracketElement) {
    bracketElement.style.left = `${bracket.left}%`;
    bracketElement.style.width = `${bracket.width}%`;
  }
  const stripCurrent = document.querySelector<HTMLElement>("[data-strip-current]");
  if (stripCurrent) stripCurrent.style.left = `${strip.percentOf(day)}%`;
  const stripSlider = document.querySelector<HTMLInputElement>("[data-strip-slider]");
  if (stripSlider) {
    stripSlider.value = String(Math.round(strip.percentOf(day) * 100));
    stripSlider.setAttribute("aria-valuetext", dayLabel(day));
  }
  const ids = new Set(timelineTarget.ids);
  for (const ends of document.querySelectorAll<HTMLElement>(".timeline-ends")) {
    for (const [index, end] of Array.from(ends.children).entries()) {
      const label = end as HTMLElement;
      label.dataset.fullEnd ??= label.textContent ?? "";
      label.textContent = timelineZoomed
        ? dayLabel(scale.dateOf(index === 0 ? visibleTimeline.start : visibleTimeline.end))
        : label.dataset.fullEnd;
    }
  }
  for (const element of document.querySelectorAll<HTMLElement>("[data-timeline-date]")) {
    const percent = windowPercent(scale.percentOf(element.dataset.timelineDate!), visibleTimeline);
    const id = element.dataset.timelineId ?? element.dataset.news;
    const outside = percent < 0 || percent > 100 || (timelineZoomed && !!id && !ids.has(id));
    element.dataset.outside = String(outside);
    element.style.left = `${percent}%`;
  }
  for (const slider of document.querySelectorAll<HTMLInputElement>("[data-slider]")) {
    slider.value = String(Math.round(current * 100));
    slider.setAttribute("aria-valuetext", dayLabel(day));
  }
  placeTimelineDots();
  placeTimelineLabels();
}

function updateTimeline(): void {
  document.body.dataset.timelineZoomed = String(timelineZoomed);
  const anchor = (itemId === null ? null : byId.get(itemId)) ?? latestOnOrBefore(ordered, day);
  const target = timelineZoomed
    ? timelineWindow(timelineEvents, anchor?.id ?? timelineEvents[0]?.id ?? "", scale)
    : fullTimeline;
  for (const button of document.querySelectorAll<HTMLButtonElement>('[data-action="timeline-zoom"]')) {
    button.setAttribute("aria-pressed", String(timelineZoomed));
    const label = button.querySelector<HTMLElement>("[data-timeline-zoom-label]");
    if (label) {
      label.textContent = timelineZoomed ? "Whole timeline" : "Zoom in";
      button.setAttribute("aria-label", label.textContent);
      button.querySelector("path")?.setAttribute("d", timelineZoomed
        ? "M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"
        : "M4 9h5V4M20 9h-5V4M4 15h5v5M20 15h-5v5");
    } else {
      button.setAttribute("aria-label", timelineZoomed ? "Zoom timeline out" : "Zoom timeline in");
      button.querySelector("path")?.setAttribute("d", timelineZoomed ? "M5 12h14" : "M5 12h14M12 5v14");
    }
  }
  if (JSON.stringify(target) === JSON.stringify(timelineTarget)) {
    drawTimeline();
    return;
  }
  timelineTarget = target;
  if (timelineFrame !== null) cancelAnimationFrame(timelineFrame);
  if (timelineMotion.matches) {
    timelineFrame = null;
    visibleTimeline = target;
    drawTimeline();
    return;
  }
  const from = visibleTimeline;
  const start = performance.now();
  function glide(now: number): void {
    const t = Math.min(1, (now - start) / 900);
    const eased = t * t * (3 - 2 * t);
    visibleTimeline = {
      start: from.start + (target.start - from.start) * eased,
      middle: from.middle + (target.middle - from.middle) * eased,
      end: from.end + (target.end - from.end) * eased,
      ids: target.ids,
    };
    drawTimeline();
    timelineFrame = t < 1 ? requestAnimationFrame(glide) : null;
  }
  timelineFrame = requestAnimationFrame(glide);
}

timelineMotion.addEventListener("change", () => {
  if (!timelineMotion.matches) return;
  stopStepGlide?.();
  if (timelineFrame !== null) cancelAnimationFrame(timelineFrame);
  timelineFrame = null;
  visibleTimeline = timelineTarget;
  drawTimeline();
});

function renderSteps(anchor: NewsItem | null, at: number): void {
  if (!stepRow) return;
  const direction = Math.sign(at - lastStep);
  let outgoing: HTMLElement | undefined;
  if (direction || at < 0) stopStepGlide?.();
  if (direction && at >= 0 && lastStep >= 0 && !timelineMotion.matches && stepRow.offsetWidth) {
    outgoing = stepRow.cloneNode(true) as HTMLElement;
    outgoing.classList.add("step-row-outgoing");
    outgoing.inert = true;
    stepRow.before(outgoing);
  }
  lastStep = at;

  const slots = [anchor && neighbour(ordered, anchor.id, -1), anchor, anchor && neighbour(ordered, anchor.id, 1)];
  stepRow.querySelectorAll<HTMLButtonElement>("[data-step]").forEach((button, index) => {
    const target = slots[index];
    button.hidden = !target;
    if (!target) {
      delete button.dataset.news;
      return;
    }
    button.dataset.news = target.id;
    button.setAttribute("aria-label", ariaFor(target.title, target.date));
    const date = button.querySelector<HTMLElement>(".step-date");
    if (date) date.textContent = stepDateLabel(target.date);
  });

  if (!outgoing) return;
  const previous = outgoing;
  // With x1 = 1/3 and x2 = 2/3, this is the desktop glide's smoothstep curve.
  const timing = { duration: 300, easing: "cubic-bezier(0.333333, 0, 0.666667, 1)" };
  const exit = previous.animate([{ transform: "none" }, { transform: `translateX(${-direction * 100}%)` }], timing);
  const enter = stepRow.animate([{ transform: `translateX(${direction * 100}%)` }, { transform: "none" }], timing);
  const cleanup = () => {
    previous.remove();
    exit.cancel();
    enter.cancel();
    stopStepGlide = undefined;
  };
  stopStepGlide = cleanup;
  enter.onfinish = cleanup;
}

function setText(name: string, text: string): void {
  for (const element of document.querySelectorAll<HTMLElement>(`[data-bind="${name}"]`)) {
    element.textContent = text;
  }
}

function namesOf(ids: readonly string[]): string {
  return ids.map((id) => nameOf.get(id) ?? id).join(", ");
}

// The label for a news item shows its day and title.
function ariaFor(itemTitle: string, date: string): string {
  return `${dayLabel(date)}, ${itemTitle}`;
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
  if (!layoutsReady) {
    const company = companyById.get(id);
    return !!company && company.first_mention <= date && (!company.ended || date <= company.ended)
      && valueOn(values, id, date) !== null;
  }
  return bubblesForDate(date).some((bubble) => bubble.id === id);
}

// The companies that the focus button can frame on this day.
function playersNow(): string[] {
  const chapter = chapterIndex === null ? null : (chapters[chapterIndex] ?? null);
  if (chapter !== null) return chapter.players;
  const item = itemId === null ? null : (byId.get(itemId) ?? null);
  if (item !== null) return item.players;
  return companyId !== null ? [companyId, ...partnersOf(companyId, day)] : [];
}

function hasPlayers(): boolean {
  return playersNow().some((id) => isCompanyShown(id, day));
}

function resetZoom(focus = false): void {
  fitPlayers = focus && hasPlayers();
  manual = 1;
  pan = { dx: 0, dy: 0 };
}

function cameraView(scale: number, players = fitPlayers ? playersNow() : []): CameraView {
  return dayView(bubblesForDate(day), players, scale, day, burst?.date,
    peak ? bubblesForDate(peak.date) : undefined);
}

// The company's news rows, newest first, are rebuilt only when the company or the day changes,
// so dragging the slider keeps the list where the reader left it.
let rowsKey = "";

function renderCompany(company: Company): void {
  setText("company-name", company.name);
  const value = valueOn(values, company.id, day);
  setText("company-value", value === null ? "" : formatValue(value));
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
      button.setAttribute("aria-label", ariaFor(one.title, one.date));
      const title = document.createElement("span");
      title.className = "company-news-title";
      title.textContent = one.title;
      button.append(title);
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
  if (companyId !== null && !isCompanyShown(companyId, day)) {
    companyId = null;
    resetZoom();
  }
  const storyAt = chapterIndex;
  const storyChapter = storyAt === null ? null : (chapters[storyAt] ?? null);
  if (storyAt !== null && storyChapter === null) chapterIndex = null;
  const item = itemId === null ? null : (byId.get(itemId) ?? null);
  const company = companyId === null ? null : (companyById.get(companyId) ?? null);
  // In the quieter state the column follows the latest item on or before the chosen day.
  const anchor = item ?? latestOnOrBefore(ordered, day);
  const count = ordered.length;

  // Which of the states the card is in. A day before every item has no latest item to offer.
  const state =
    storyChapter !== null
      ? storyListOpen
        ? "story-list"
        : "story"
      : company !== null
        ? "company"
        : item !== null
          ? "item"
          : anchor !== null
            ? "quiet"
            : "none";
  for (const block of document.querySelectorAll<HTMLElement>("[data-block]")) {
    block.hidden = block.dataset.block !== state;
  }

  // The stylesheet follows the mode: Story shows the chapter's dots and hides Explore's masthead.
  const mode = storyChapter !== null ? "story" : "explore";
  document.body.dataset.mode = mode;
  // The header tab and the phone's switch mark the mode they lead to. The body carries
  // data-mode itself, so it is left out; with it, everything inside it would take the tab's
  // underline.
  for (const control of document.querySelectorAll<HTMLElement>("[data-mode]:not(body)")) {
    const active = (control.dataset.mode === "story") === (storyChapter !== null);
    control.classList.toggle("nav-current", active);
    if (active) control.setAttribute("aria-current", "page");
    else control.removeAttribute("aria-current");
  }
  for (const sheet of document.querySelectorAll<HTMLElement>("[data-sheet]")) {
    sheet.setAttribute("aria-label", storyChapter !== null ? "Chapter" : "News item");
  }

  if (storyChapter && storyAt !== null) {
    const number = storyAt + 1;
    setText("story-kicker", `Chapter ${number} of ${chapters.length}`);
    setText("story-title", storyChapter.title);
    // The docked sheet's one line: the chapter being read.
    setText("dock-title", storyChapter.title);
    setText("story-names", namesOf(storyChapter.players));
    for (const line of document.querySelectorAll<HTMLElement>('[data-players-line="story"]')) {
      line.hidden = storyChapter.players.length === 0;
    }
    // Every paragraph, word for word, in a plain text block rather than markup.
    for (const text of document.querySelectorAll<HTMLElement>('[data-bind="story-text"]')) {
      text.textContent = "";
      for (const paragraph of storyChapter.paragraphs) {
        const element = document.createElement("p");
        element.textContent = paragraph;
        text.appendChild(element);
      }
    }
    for (const button of document.querySelectorAll<HTMLButtonElement>('[data-action="chapter-earlier"]')) {
      button.disabled = storyAt === 0;
    }
    const atLastChapter = storyAt === chapters.length - 1;
    for (const button of document.querySelectorAll<HTMLButtonElement>('[data-action="chapter-next"]')) {
      button.textContent = atLastChapter ? "Explore any day" : "Next chapter →";
    }
    for (const button of document.querySelectorAll<HTMLElement>('[data-action="story-open"]')) {
      button.setAttribute("aria-expanded", String(storyListOpen));
    }
    // The chapter's dot on the timeline and its row in the list are the current ones.
    for (const marker of document.querySelectorAll<HTMLElement>("[data-chapter]")) {
      const current = Number(marker.dataset.chapter) === number;
      if (marker.classList.contains("chapter-row")) {
        if (current) marker.setAttribute("aria-current", "true");
        else marker.removeAttribute("aria-current");
      } else {
        marker.classList.toggle("is-current", current);
      }
    }
  } else if (item) {
    setText("title", item.title);
    // The docked sheet's one line: the news title, ellipsed to the width it has.
    setText("dock-title", item.title);
    setText("summary", item.summary);
    setText("names-desktop", namesOf(item.players));
    for (const line of document.querySelectorAll<HTMLElement>("[data-players-line]")) {
      line.hidden = item.players.length === 0;
    }
    const kind = pillKind(item, deals);
    for (const pill of document.querySelectorAll<HTMLElement>('[data-bind="pill"]')) {
      pill.className = `pill pill-${pillClass(kind)}`;
    }
    setText("pill-label", pillLabel(kind));
    for (const link of document.querySelectorAll<HTMLAnchorElement>('[data-bind="source"]')) {
      const publisher = publisherName(item.source);
      link.href = item.source;
      link.textContent = `${publisher} · ${dayLabel(item.date)} ↗`;
      link.setAttribute("aria-label", `Source: ${publisher}, opens in a new tab`);
    }
  } else if (company) {
    renderCompany(company);
    setText("dock-title", company.name);
  } else {
    setText("latest-title", anchor ? anchor.title : "");
    setText("dock-title", anchor ? anchor.title : "");
  }

  const total = totalForDate(day);
  const lossPercent = peak && peak.total > 0 ? Math.round((1 - total / peak.total) * 100) : 0;
  changeFromPeak = peak && burst && day >= burst.date
    ? `${lossPercent >= 0 ? "−" : "+"}${Math.abs(lossPercent)}%`
    : undefined;
  setText(
    "companies",
    peak && changeFromPeak !== undefined
      ? `Peak ${formatValue(peak.total)} · now ${formatValue(total)} (${changeFromPeak})`
      : `Combined value of the companies shown: ${formatValue(total)}`,
  );

  for (const marker of document.querySelectorAll<HTMLElement>("[data-news]")) {
    marker.classList.toggle("is-current", item !== null && marker.dataset.news === item.id);
  }
  updateTimeline();

  // Earlier and Later walk every news item in date order and stop at the ends.
  const at = anchor ? ordered.findIndex((one) => one.id === anchor.id) : -1;
  for (const button of document.querySelectorAll<HTMLButtonElement>('[data-action="earlier"]')) {
    button.disabled = at <= 0;
  }
  for (const button of document.querySelectorAll<HTMLButtonElement>('[data-action="later"]')) {
    button.disabled = at < 0 || at >= count - 1;
  }
  for (const button of document.querySelectorAll<HTMLButtonElement>('[data-action="timeline-start"]')) {
    button.disabled = at === 0;
  }

  renderSteps(anchor, at);

  drawBubble(false);
  if (soon) writeAddressSoon();
  else writeAddress();
}

// Gesture frames update only the camera, not the news panel, timeline or address.
function drawBubble(immediate: boolean): void {
  const zoomActive = fitPlayers || manual !== 1;
  const zoomLabel = zoomActive ? "Show the whole bubble" : hasPlayers() ? "Focus on the players" : "Zoom in";
  for (const button of document.querySelectorAll<HTMLButtonElement>('[data-zoom="fit"]')) {
    button.setAttribute("aria-pressed", String(zoomActive));
    button.setAttribute("aria-label", zoomLabel);
    button.querySelector("path")?.setAttribute("d", zoomActive
      ? "M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"
      : "M4 9h5V4M20 9h-5V4M4 15h5v5M20 15h-5v5");
  }

  if (!layoutsReady) return;
  const players = fitPlayers ? playersNow() : [];
  const zoomedIn = zoomActive && cameraView(manual, players).z > 1;
  for (const svg of document.querySelectorAll<SVGSVGElement>("[data-bubble]")) {
    svg.dataset.zoomed = String(zoomedIn);
    renderBubble(svg, day, {
      players,
      focus: companyId ?? undefined,
      manual,
      burstDate: burst?.date,
      peak,
      changeFromPeak,
      immediate,
      pan: zoomedIn ? pan : { dx: 0, dy: 0 },
    });
    const label = svg.getAttribute("aria-label") ?? "";
    svg.setAttribute("aria-label", `${label} Use + and − to zoom.${zoomedIn ? " Use the arrow keys to move the view." : ""}`);
  }
}

// The address keeps working for ?chapter=<number>, ?date=YYYY-MM-DD, ?news=<news id> and
// ?company=<company id>, so a view can be linked. While the slider is dragged it is written once
// the reader pauses, which keeps phone browsers happy.
let addressTimer: ReturnType<typeof setTimeout> | null = null;

function writeAddress(): void {
  if (addressTimer !== null) {
    clearTimeout(addressTimer);
    addressTimer = null;
  }
  if (chapterIndex !== null) {
    history.replaceState(null, "", `${window.location.pathname}?chapter=${chapterIndex + 1}`);
    return;
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

// A chapter the reader can see: focus it, skipping the copy the other layout keeps hidden.
function focusVisible(selector: string): void {
  for (const element of document.querySelectorAll<HTMLElement>(selector)) {
    if (element.offsetParent === null) continue;
    element.focus();
    return;
  }
}

function goToChapter(index: number): void {
  if (!STORY_ENABLED) return;
  const chapter = chapters[index];
  if (!chapter) return;
  chapterIndex = index;
  storyListOpen = false;
  itemId = null;
  companyId = null;
  day = chapter.date;
  resetZoom(true);
  render();
  // A chapter opens at its first line, never where the last one was left.
  for (const text of document.querySelectorAll<HTMLElement>('[data-bind="story-text"]')) {
    text.scrollTop = 0;
  }
}

// Dragging the slider to a day that is not a chapter's leaves Story for Explore on that day.
function leaveStory(date: string): void {
  chapterIndex = null;
  storyListOpen = false;
  itemId = null;
  resetZoom();
  day = date;
  render(true);
}

function openStoryList(open: boolean): void {
  storyListOpen = open;
  render();
  focusVisible(open ? '[data-action="story-close"]' : '[data-action="story-open"]');
}

function selectItem(id: string): void {
  const item = byId.get(id);
  if (!item) return;
  itemId = item.id;
  companyId = null;
  day = item.date;
  resetZoom(true);
  render();
}

// A bubble opens its company; the same company again, or Back, goes to the quiet day. In Story it
// also leaves the chapter, as Explore's own company panel does.
function chooseCompany(id: string): void {
  if (!companyById.has(id)) return;
  chapterIndex = null;
  storyListOpen = false;
  companyId = companyId === id ? null : id;
  itemId = null;
  // The button's state follows the view: a company open frames it, the quiet day shows the whole
  // frame.
  resetZoom(companyId !== null);
  render();
}

function clearCompany(): void {
  companyId = null;
  itemId = null;
  resetZoom();
  render();
}

function step(direction: -1 | 1): void {
  const anchor = (itemId === null ? undefined : byId.get(itemId)) ?? latestOnOrBefore(ordered, day);
  const target = anchor
    ? neighbour(ordered, anchor.id, direction)
    : (ordered[direction === 1 ? 0 : ordered.length - 1] ?? null);
  if (target) selectItem(target.id);
}

function moveTo(date: string): void {
  day = date;
  // Dragging the slider frames nothing, so the view is the whole frame and the button keeps
  // the whole state until an item or a company is picked.
  resetZoom();
  itemId = null;
  render(true);
}

document.addEventListener("click", (event) => {
  const target = event.target instanceof Element ? event.target : null;
  const control = target?.closest<HTMLElement>("[data-news], [data-chapter], [data-action], [data-zoom]");
  if (!control) return;

  if (control.dataset.news) {
    selectItem(control.dataset.news);
    return;
  }
  if (control.dataset.chapter) {
    // A chapter chosen from the list closes the list; focus goes to the chapter it opened.
    const fromList = storyListOpen;
    goToChapter(Number(control.dataset.chapter) - 1);
    if (fromList) focusVisible('[data-bind="story-title"]');
    return;
  }

  const action = control.dataset.action;
  if (action === "timeline-zoom") {
    timelineZoomed = !timelineZoomed;
    updateTimeline();
    return;
  } else if (action === "timeline-start") {
    const first = timelineEvents[0];
    if (first) selectItem(first.id);
  } else if (action === "earlier") {
    step(-1);
  } else if (action === "later") {
    step(1);
  } else if (action === "latest") {
    const anchor = latestOnOrBefore(ordered, day);
    if (anchor) selectItem(anchor.id);
  } else if (action === "company-back") {
    clearCompany();
  } else if (action === "chapter-earlier") {
    if (chapterIndex !== null) goToChapter(chapterIndex - 1);
  } else if (action === "chapter-next") {
    if (chapterIndex !== null) {
      if (chapterIndex === chapters.length - 1) {
        // The last chapter's "Explore any day" shows Explore on that chapter's day.
        chapterIndex = null;
        storyListOpen = false;
        itemId = null;
        resetZoom();
        render();
      } else {
        goToChapter(chapterIndex + 1);
      }
    }
  } else if (action === "story-open") {
    openStoryList(true);
  } else if (action === "story-close") {
    openStoryList(false);
  }

  if (control.dataset.zoom === "fit") {
    const toWhole = fitPlayers || manual !== 1;
    resetZoom(!toWhole);
    if (!toWhole && !fitPlayers) manual = 2;
    render();
  }
});

// Escape closes the chapter list, as a dialog would.
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape" || !storyListOpen) return;
  openStoryList(false);
});

// The slider's value is a place on the line from 0 to 10000, so a drag lands on the nearest day.
// In Story a chapter's day jumps to that chapter, and any other day leaves Story for Explore.
// One step of the value is not one day, so Left and Right (and Up and Down) move a day and Home
// and End jump to the first and last day, handled here rather than by the browser.
function sliderTo(date: string): void {
  const chapterAt = chapters.findIndex((chapter) => chapter.date === date);
  if (chapterIndex !== null && chapterAt >= 0) {
    goToChapter(chapterAt);
    return;
  }
  if (chapterIndex !== null) {
    leaveStory(date);
    return;
  }
  moveTo(date);
}

for (const slider of document.querySelectorAll<HTMLInputElement>("[data-strip-slider]")) {
  const jump = (percent: number) => {
    const date = strip.dateOf(percent);
    const nearest = timelineEvents.reduce<NewsItem | null>((best, item) =>
      !best || Math.abs(Date.parse(item.date) - Date.parse(date)) < Math.abs(Date.parse(best.date) - Date.parse(date)) ? item : best, null);
    if (!nearest) return;
    timelineZoomed = true;
    if (chapterIndex !== null) {
      sliderTo(nearest.date);
    } else {
      selectItem(nearest.id);
    }
  };
  slider.addEventListener("input", () => jump(Number(slider.value) / 100));
  slider.addEventListener("keydown", (event) => {
    const anchor = (itemId === null ? null : byId.get(itemId)) ?? latestOnOrBefore(ordered, day);
    const at = anchor ? timelineEvents.indexOf(anchor) : 0;
    let index: number;
    if (event.key === "Home") index = 0;
    else if (event.key === "End") index = timelineEvents.length - 1;
    else if (event.key === "ArrowLeft" || event.key === "ArrowDown") index = at - 1;
    else if (event.key === "ArrowRight" || event.key === "ArrowUp") index = at + 1;
    else return;
    event.preventDefault();
    const item = timelineEvents[Math.max(0, Math.min(timelineEvents.length - 1, index))];
    if (item) jump(strip.percentOf(item.date));
  });
}

for (const slider of document.querySelectorAll<HTMLInputElement>("[data-slider]")) {
  const scrubTo = (percent: number) => sliderTo(scale.dateOf(windowPlace(percent, visibleTimeline)));
  slider.addEventListener("input", () => scrubTo(Number(slider.value) / 100));
  slider.addEventListener("keydown", (event) => {
    const at = dayIndex(day);
    let to: number;
    if (event.key === "ArrowLeft" || event.key === "ArrowDown") to = at - 1;
    else if (event.key === "ArrowRight" || event.key === "ArrowUp") to = at + 1;
    else if (event.key === "Home") to = 0;
    else if (event.key === "End") to = lastDay;
    else return;
    event.preventDefault();
    sliderTo(dateAt(Math.min(lastDay, Math.max(0, to))));
  });

  const line = slider.closest<HTMLElement>("[data-timeline]");
  if (!line) continue;
  let press: { id: number; x: number; y: number; dragging: boolean } | null = null;
  line.addEventListener("pointerdown", (event) => {
    if (press || !event.isPrimary || event.button !== 0 || !(event.target instanceof Element)) return;
    const dot = event.target.closest<HTMLButtonElement>(".timeline-dot");
    if (!dot) return;
    // Keep a small movement across a shared midpoint from changing which dot gets the click.
    press = { id: event.pointerId, x: event.clientX, y: event.clientY, dragging: false };
    dot.setPointerCapture(event.pointerId);
  });
  line.addEventListener("pointermove", (event) => {
    if (!press || event.pointerId !== press.id) return;
    if (!press.dragging) {
      if (Math.hypot(event.clientX - press.x, event.clientY - press.y) <= 6) return;
      press.dragging = true;
      // A synthetic pointerdown cannot start a native range drag. Transfer capture so the
      // release is not a dot click, and use the same date mapping as the range's input event.
      slider.setPointerCapture(event.pointerId);
    }
    const { left, width } = line.getBoundingClientRect();
    if (width > 0) scrubTo(Math.max(0, Math.min(100, 100 * (event.clientX - left) / width)));
  });
  const endPress = (event: PointerEvent) => {
    if (event.pointerId === press?.id) press = null;
  };
  line.addEventListener("pointerup", endPress);
  line.addEventListener("pointercancel", endPress);
  line.addEventListener("lostpointercapture", (event) => {
    // Losing the dot's capture is expected when the slider takes over.
    if (!slider.hasPointerCapture(event.pointerId)) endPress(event);
  });
}

// A bubble is a button: a click or a tap on it, or Tab to it and Enter or Space, opens that
// company's panel in the text column. While the view is zoomed in, the picture can also be
// dragged around: the pan is kept in the bubble's own units, so screen pixels are turned into
// units with the SVG's on-screen size and the current zoom. A move under PAN_TAP_PX is a tap,
// so tapping a company still opens it.
const PAN_TAP_PX = 6;
const PAN_STEP = 5; // the arrow keys move the view this many units

for (const svg of document.querySelectorAll<SVGSVGElement>("[data-bubble]")) {
  const panningView = (): CameraView | null => {
    if (!layoutsReady || (!fitPlayers && manual === 1)) return null;
    const view = cameraView(manual);
    return view.z > 1 ? view : null;
  };
  const centre = { x: 50, y: 50 };
  const framePoint = (x: number, y: number) => {
    const box = svg.getBoundingClientRect();
    return { x: 100 * (x - box.left) / box.width, y: 100 * (y - box.top) / box.height };
  };
  const zoom = (factor: number, from = centre, to = from): void => {
    if (!layoutsReady) return;
    const view = cameraView(manual);
    const whole = cameraView(1, []);
    const shown = panView(view, clampPan(view, pan));
    const next = zoomBy(shown, factor, from, to, whole.z);
    if (next.z === whole.z) {
      resetZoom();
    } else {
      // The manual factor multiplies the current automatic fit, not the previous zoom.
      manual = next.z / cameraView(1).z;
      const base = cameraView(manual);
      pan = clampPan(base, { dx: next.cx - base.cx, dy: next.cy - base.cy });
    }
    drawBubble(true);
  };

  svg.setAttribute("tabindex", "0");
  let suppressTap = false;
  svg.addEventListener("click", (event) => {
    const id = event.detail === 0
      ? (event.target as Element).closest("[data-company]")?.getAttribute("data-company")
      : !suppressTap && bubbleAtPoint(svg, event.clientX, event.clientY);
    if (id) chooseCompany(id);
  });
  svg.addEventListener("wheel", (event) => {
    event.preventDefault();
    const pixels = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? svg.clientHeight : 1);
    if (pixels !== 0) zoom(Math.exp(-pixels * 0.002), framePoint(event.clientX, event.clientY));
  }, { passive: false });
  svg.addEventListener("keydown", (event) => {
    if (event.target !== svg) {
      if (event.key !== "Enter" && event.key !== " ") return;
      const id = (event.target as Element).closest("[data-company]")?.getAttribute("data-company");
      if (!id) return;
      event.preventDefault();
      chooseCompany(id);
      return;
    }
    if (event.key === "+" || event.key === "-") {
      event.preventDefault();
      zoom(event.key === "+" ? 1.25 : 1 / 1.25);
      return;
    }
    let dx = 0;
    let dy = 0;
    if (event.key === "ArrowLeft") dx = -PAN_STEP;
    else if (event.key === "ArrowRight") dx = PAN_STEP;
    else if (event.key === "ArrowUp") dy = -PAN_STEP;
    else if (event.key === "ArrowDown") dy = PAN_STEP;
    else return;
    const view = panningView();
    if (view === null) return;
    event.preventDefault();
    pan = clampPan(view, { dx: pan.dx + dx, dy: pan.dy + dy });
    drawBubble(false);
  });

  type Point = { x: number; y: number };
  const touches = new Map<number, Point>();
  const pinch = () => {
    const [a, b] = touches.values();
    return {
      distance: Math.hypot(a.x - b.x, a.y - b.y),
      midpoint: framePoint((a.x + b.x) / 2, (a.y + b.y) / 2),
    };
  };
  let drag: { id: number; x: number; y: number; moved: number; captured: boolean } | null = null;

  svg.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (event.pointerType === "touch") {
      touches.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (touches.size > 1) {
        suppressTap = true;
        drag = null;
        svg.classList.remove("is-panning");
        for (const id of touches.keys()) svg.setPointerCapture(id);
        return;
      }
    }
    if (drag !== null) return;
    suppressTap = false;
    const canPan = panningView() !== null;
    if (!canPan && event.pointerType !== "touch") return;
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY, moved: 0, captured: false };
    if (canPan) event.preventDefault();
  });

  svg.addEventListener("pointermove", (event) => {
    if (touches.has(event.pointerId)) {
      const before = touches.size >= 2 ? pinch() : null;
      touches.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (before !== null) {
        const after = pinch();
        if (before.distance > 0 && after.distance > 0) {
          zoom(after.distance / before.distance, before.midpoint, after.midpoint);
        }
        return;
      }
    }
    if (drag === null || drag.id !== event.pointerId) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    drag.moved += Math.hypot(dx, dy);
    drag.x = event.clientX;
    drag.y = event.clientY;
    if (drag.moved < PAN_TAP_PX) return;
    suppressTap = true;
    const view = panningView();
    if (view === null) return;
    if (!drag.captured) {
      drag.captured = true;
      svg.setPointerCapture(event.pointerId);
      svg.classList.add("is-panning");
    }
    const size = svg.getBoundingClientRect().width;
    const units = size > 0 ? 100 / (size * view.z) : 0;
    pan = clampPan(view, { dx: pan.dx - dx * units, dy: pan.dy - dy * units });
    drawBubble(true);
  });

  const endPointer = (event: PointerEvent): void => {
    touches.delete(event.pointerId);
    if (drag?.id !== event.pointerId) return;
    drag = null;
    svg.classList.remove("is-panning");
  };
  svg.addEventListener("pointerup", endPointer);
  svg.addEventListener("pointercancel", endPointer);
  svg.addEventListener("pointerleave", (event) => {
    if (!svg.hasPointerCapture(event.pointerId) && !drag?.captured) endPointer(event);
  });
}

// Read the address once, then draw. A chapter opens Story on its day; without one, ?news=,
// ?company= or ?date= picks the view, and a plain page shows the newest item. A past page has
// no Story mode, so it ignores ?chapter=.
function readAddress(): void {
  const params = new URLSearchParams(window.location.search);
  // ?chapter=3 opens chapter 3; a number that is not a chapter opens the first.
  if (STORY_ENABLED && !isPast && params.has("chapter") && chapters.length > 0) {
    const wanted = Number(params.get("chapter"));
    const at = Number.isInteger(wanted) && wanted >= 1 && wanted <= chapters.length ? wanted - 1 : 0;
    chapterIndex = at;
    storyListOpen = false;
    itemId = null;
    companyId = null;
    day = chapters[at].date;
    resetZoom(true);
    return;
  }
  const wantedId = params.get("news");
  const wanted = wantedId ? byId.get(wantedId) : undefined;
  if (wanted) {
    itemId = wanted.id;
    day = wanted.date;
    resetZoom(true);
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
    resetZoom(true);
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
void prepareLayouts().catch((error: unknown) => console.error(error));

// Keep isolated targets 44px wide and split crowded targets at their midpoint.
function placeTimelineDots(): void {
  const inner = document.querySelector<HTMLElement>("[data-timeline]");
  if (!inner?.clientWidth) return;
  const dots = Array.from(inner.querySelectorAll<HTMLButtonElement>(".timeline-dot"))
    .filter((dot) => dot.offsetHeight > 0)
    .map((dot) => ({ dot, x: Number.parseFloat(dot.style.left) * inner.clientWidth / 100 }))
    .sort((a, b) => a.x - b.x);
  // Fan out coincident or nearly coincident dots so each has its own reachable centre.
  const spacing = 10;
  dots.forEach((entry, index) => {
    const previous = dots[index - 1];
    if (previous) entry.x = Math.max(entry.x, previous.x + spacing);
  });
  for (let index = dots.length - 1; index >= 0; index--) {
    const next = dots[index + 1];
    dots[index].x = Math.min(dots[index].x, next ? next.x - spacing : inner.clientWidth);
  }
  dots.forEach(({ dot, x }, index) => {
    const previous = dots[index - 1];
    const next = dots[index + 1];
    const left = Math.max(x - 22, previous ? (previous.x + x) / 2 : -22);
    const right = Math.min(x + 22, next ? (x + next.x) / 2 : inner.clientWidth + 22);
    const dateX = Number.parseFloat(dot.style.left) * inner.clientWidth / 100;
    dot.style.setProperty("--dot-left", `${left - dateX}px`);
    dot.style.setProperty("--dot-width", `${right - left}px`);
    dot.style.setProperty("--dot-center", `${x - left}px`);
  });
}

// Measure wrapped titles and reserve the flag before trying either row.
function placeTimelineLabels(): void {
  const inner = document.querySelector<HTMLElement>("[data-timeline]");
  if (!inner?.clientWidth) return;
  const story = document.body.dataset.mode === "story";
  const selected = itemId ?? latestOnOrBefore(ordered, day)?.id;
  const currentChapter = chapterIndex === null ? null : chapters[chapterIndex];
  const labels = Array.from(inner.querySelectorAll<HTMLElement>(story
    ? "[data-story-label]"
    : '[data-timeline-id]:not([data-outside="true"])'));
  for (const label of labels) {
    label.hidden = story
      ? !!currentChapter && label.textContent?.trim() === currentChapter.title
      : label.dataset.timelineId === selected;
  }

  const boxes = labels.flatMap((label, index) => {
    const { width, height } = label.getBoundingClientRect();
    return width > 0 && height > 0 && height <= 28 ? [{
      id: String(index), percent: Number.parseFloat(label.style.left), width, height,
    }] : [];
  });
  const bounds = inner.getBoundingClientRect();
  const reserved: LabelRect[] = [];
  for (const element of inner.querySelectorAll("[data-current-flag], [data-timeline-current]")) {
    const { left, right, top, bottom } = element.getBoundingClientRect();
    reserved.push({ left: left - bounds.left, right: right - bounds.left, top: top - bounds.top, bottom: bottom - bounds.top });
  }
  const style = getComputedStyle(inner);
  const row = (name: string) => Number.parseFloat(style.getPropertyValue(`--label-${name}`));
  const placed = placeLabels(boxes, bounds.width, {
    above: [row("near-above"), row("far-above")],
    below: [row("near-below"), row("far-below")],
    height: bounds.height,
    reserved,
  });
  labels.forEach((label, index) => {
    const spot = placed.get(String(index));
    label.hidden = !spot;
    if (!spot) return;
    label.dataset.side = spot.side;
    label.dataset.row = String(spot.row);
    label.dataset.align = spot.align;
    label.style.marginLeft = `${spot.shift}px`;
  });
}

window.addEventListener("resize", drawTimeline);
document.fonts.ready.then(drawTimeline, () => {});

// The phone's map is sized from the visible area: the room above the bottom sheet, minus 12px on
// each side, never wider than the window, and 560px at most; it is centred in that space. The
// sheet grows and shrinks with its content, so the map is measured again whenever the sheet or
// the window changes, never from a fixed pixel guess. Desktop is untouched: its map is hidden.
function sizeMapBubble(): void {
  const map = document.querySelector<HTMLElement>(".layout-phone");
  const bubble = document.querySelector<HTMLElement>(".map-bubble");
  const sheet = document.querySelector<HTMLElement>("[data-sheet]");
  if (!map || !bubble || !sheet) return;
  const mapBox = map.getBoundingClientRect();
  const mapWidth = mapBox.width;
  const sheetTop = sheet.getBoundingClientRect().top - mapBox.top;
  const size = Math.max(0, Math.min(560, mapWidth - 24, sheetTop - 24));
  bubble.style.width = `${size}px`;
  bubble.style.left = `${(mapWidth - size) / 2}px`;
  bubble.style.top = `${(sheetTop - size) / 2}px`;
}

sizeMapBubble();
const mapSheet = document.querySelector<HTMLElement>("[data-sheet]");
if (mapSheet) new ResizeObserver(sizeMapBubble).observe(mapSheet);
window.addEventListener("resize", sizeMapBubble);

// The phone's bottom sheet rests in one of two states: open, today's panel at most 40% of the
// screen, or docked, a small panel with the handle, the tab pill and one title line with Earlier
// and Later. The handle's row drags between them and a tap on it switches; the choice is kept on
// this device. The map above the sheet is measured again by the observer above, so docking gives
// the bubble the room the panel gives up.
const SHEET_KEY = "aibubble.sheet";
const SHEET_SNAP_MS = 200;
const sheetMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function readSheetState(): SheetState {
  try {
    return localStorage.getItem(SHEET_KEY) === "docked" ? "docked" : "open";
  } catch {
    // Storage can be blocked (a private window); the sheet then starts open, as on a first visit.
    return "open";
  }
}

function writeSheetState(state: SheetState): void {
  try {
    localStorage.setItem(SHEET_KEY, state);
  } catch {
    // Nothing to do: the choice is simply not remembered.
  }
}

// The sheet's own height in one of the two states, from the stylesheet's layout. A height set by
// a drag or a snap is put aside for the measurement and put back afterwards, so a second drag can
// start while the first is still settling.
function sheetHeight(sheet: HTMLElement, state: SheetState): number {
  const before = sheet.dataset.sheetState;
  const height = sheet.style.height;
  const maxHeight = sheet.style.maxHeight;
  sheet.style.removeProperty("height");
  sheet.style.removeProperty("max-height");
  sheet.dataset.sheetState = state;
  const measured = sheet.getBoundingClientRect().height;
  if (before === undefined) delete sheet.dataset.sheetState;
  else sheet.dataset.sheetState = before;
  if (height !== "") sheet.style.height = height;
  if (maxHeight !== "") sheet.style.maxHeight = maxHeight;
  return measured;
}

function clearSheetHeight(sheet: HTMLElement): void {
  sheet.style.removeProperty("height");
  sheet.style.removeProperty("max-height");
  sheet.classList.remove("is-dragging", "is-snapping");
}

// What the page shows: the sheet in its state, and the handle saying what a press would do.
function showSheetState(sheet: HTMLElement, state: SheetState): void {
  sheet.dataset.sheetState = state;
  const handle = sheet.querySelector<HTMLButtonElement>("[data-sheet-handle]");
  handle?.setAttribute("aria-expanded", String(state === "open"));
  handle?.setAttribute("aria-label", state === "open" ? "Show less" : "Show more");
}

for (const sheet of document.querySelectorAll<HTMLElement>("[data-sheet]")) {
  const handle = sheet.querySelector<HTMLButtonElement>("[data-sheet-handle]");
  if (!handle) continue;
  showSheetState(sheet, readSheetState());

  let snapTimer: ReturnType<typeof setTimeout> | null = null;
  let drag: {
    id: number;
    startState: SheetState;
    startX: number;
    startY: number;
    startHeight: number;
    height: number;
    time: number;
    velocity: number;
    moved: number;
    docked: number;
    open: number;
  } | null = null;

  const stopSnap = (): void => {
    if (snapTimer === null) return;
    clearTimeout(snapTimer);
    snapTimer = null;
  };

  // From the height the pointer left the sheet at to the state's own height: about 200ms, or at
  // once when the device asks for reduced motion. Opening puts the panel's content in place first,
  // so it is uncovered as the sheet grows; closing leaves it in place until the sheet arrives, so
  // the panel never slides down empty.
  const settle = (state: SheetState, from: number, to: number): void => {
    stopSnap();
    sheet.classList.remove("is-dragging");
    writeSheetState(state);
    if (sheetMotion.matches || Math.abs(to - from) < 1) {
      showSheetState(sheet, state);
      clearSheetHeight(sheet);
      return;
    }
    if (state === "open") showSheetState(sheet, state);
    sheet.style.maxHeight = "none";
    sheet.style.height = `${from}px`;
    // The browser has to take in the starting height before the transition can move it.
    void sheet.offsetHeight;
    sheet.classList.add("is-snapping");
    sheet.style.height = `${to}px`;
    snapTimer = setTimeout(() => {
      snapTimer = null;
      showSheetState(sheet, state);
      clearSheetHeight(sheet);
    }, SHEET_SNAP_MS + 50);
  };

  const toggle = (): void => {
    const docked = sheetHeight(sheet, "docked");
    const open = sheetHeight(sheet, "open");
    const state: SheetState = sheet.dataset.sheetState === "docked" ? "open" : "docked";
    settle(state, sheet.getBoundingClientRect().height, state === "open" ? open : docked);
  };

  // A press with a pointer is handled below, so only a click with no pointer behind it (Enter,
  // Space, a screen reader) toggles here.
  handle.addEventListener("click", (event) => {
    if (event.detail !== 0) return;
    toggle();
  });

  handle.addEventListener("pointerdown", (event) => {
    if (drag !== null) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const docked = sheetHeight(sheet, "docked");
    const open = sheetHeight(sheet, "open");
    // A layout that is not showing (desktop) has no height to drag.
    if (open <= 1) return;
    stopSnap();
    // A sheet caught mid-snap keeps the height it had reached and follows the pointer from there.
    sheet.classList.remove("is-snapping");
    const startState: SheetState = sheet.dataset.sheetState === "docked" ? "docked" : "open";
    const startHeight = sheet.getBoundingClientRect().height;
    // Dragging a docked sheet shows what it is uncovering from the first pixel.
    if (startState === "docked") showSheetState(sheet, "open");
    sheet.style.maxHeight = "none";
    sheet.style.height = `${startHeight}px`;
    sheet.classList.add("is-dragging");
    drag = {
      id: event.pointerId,
      startState,
      startX: event.clientX,
      startY: event.clientY,
      startHeight,
      height: startHeight,
      time: event.timeStamp,
      velocity: 0,
      moved: 0,
      docked,
      open,
    };
    handle.setPointerCapture(event.pointerId);
  });

  handle.addEventListener("pointermove", (event) => {
    if (drag === null || drag.id !== event.pointerId) return;
    // The panel's edge follows the finger between the two heights, never past them.
    const travel = drag.startY - event.clientY;
    const height = Math.min(drag.open, Math.max(drag.docked, drag.startHeight + travel));
    const elapsed = Math.max(1, event.timeStamp - drag.time);
    drag.velocity = (height - drag.height) / elapsed;
    drag.time = event.timeStamp;
    drag.height = height;
    drag.moved = Math.max(drag.moved, Math.hypot(event.clientX - drag.startX, travel));
    sheet.style.height = `${height}px`;
  });

  const endDrag = (event: PointerEvent): void => {
    if (drag === null || drag.id !== event.pointerId) return;
    const { startState, height, docked, open, velocity, moved } = drag;
    drag = null;
    if (handle.hasPointerCapture(event.pointerId)) handle.releasePointerCapture(event.pointerId);
    // A press that barely moved is a tap: the handle switches the sheet.
    const state: SheetState =
      moved < SHEET_TAP_PX
        ? startState === "docked"
          ? "open"
          : "docked"
        : snapSheet(height, docked, open, velocity);
    settle(state, height, state === "open" ? open : docked);
  };
  handle.addEventListener("pointerup", endDrag);
  handle.addEventListener("pointercancel", endDrag);
}
