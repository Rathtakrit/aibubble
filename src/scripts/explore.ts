// The page's behaviour, Explore and Story (the AI bubble only; a past bubble has no Story):
// there is one state — the selected day with, optionally, the selected news item or company, or
// the chapter being read — and everything on the page follows it.

import {
  companies,
  burst,
  datasetId,
  datasetTitle,
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
import { renderBubble } from "../lib/bubble.ts";
import { ZOOMS } from "../lib/camera.ts";
import type { Chapter } from "../lib/story.ts";
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
  timelineScale,
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
const place = new Map(ordered.map((item, index) => [item.id, index + 1]));
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
// The reader's own zoom on top of the camera; index 1 = follow the players exactly.
let zoomIndex = 1;
let fitPlayers = false;
// The mode whose titles over the timeline were placed last: Explore's news titles or Story's
// chapter titles, one set at a time.
let labelsPlacedFor: string | null = null;
let timelineZoomed = true;
const fullTimeline: TimelineWindow = { start: 0, middle: 50, end: 100, ids: [] };
let visibleTimeline = fullTimeline;
let timelineTarget = fullTimeline;
let timelineFrame: number | null = null;
const timelineMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const timelineEvents = ordered;

function drawTimeline(): void {
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
    slider.value = String(Math.round(Math.max(0, Math.min(100, windowPercent(scale.percentOf(day), visibleTimeline))) * 100));
  }
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
    button.setAttribute("aria-label", timelineZoomed ? "Zoom timeline out" : "Zoom timeline in");
    button.querySelector("path")?.setAttribute("d", timelineZoomed ? "M5 12h14" : "M5 12h14M12 5v14");
  }
  if (JSON.stringify(target) === JSON.stringify(timelineTarget)) {
    placeTimelineLabels();
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
  if (timelineFrame !== null) cancelAnimationFrame(timelineFrame);
  timelineFrame = null;
  visibleTimeline = timelineTarget;
  drawTimeline();
});

function setText(name: string, text: string): void {
  for (const element of document.querySelectorAll<HTMLElement>(`[data-bind="${name}"]`)) {
    element.textContent = text;
  }
}

function namesOf(ids: readonly string[]): string {
  return ids.map((id) => nameOf.get(id) ?? id).join(", ");
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
  // Each mode has its own titles over the timeline, so they are placed when the mode changes.
  if (labelsPlacedFor !== mode) placeTimelineLabels();
  for (const sheet of document.querySelectorAll<HTMLElement>("[data-sheet]")) {
    sheet.setAttribute("aria-label", storyChapter !== null ? "Chapter" : "News item");
  }

  if (storyChapter && storyAt !== null) {
    const number = storyAt + 1;
    setText("story-kicker", `Chapter ${number} of ${chapters.length}`);
    setText("story-title", storyChapter.title);
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
    setText("kicker-desktop", `${datasetTitle} · news ${place.get(item.id)} of ${count}`);
    setText("kicker-phone", `News ${place.get(item.id)} of ${count} · ${dayLabel(item.date)}`);
    setText("title", item.title);
    setText("summary", item.summary);
    setText("names-desktop", namesOf(item.players));
    setText("names-phone", namesOf(item.players));
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
    setText("kicker-desktop", `${datasetTitle} · ${dayLabel(day)}`);
    setText("kicker-phone", `${datasetTitle} · ${dayLabel(day)}`);
    renderCompany(company);
  } else {
    setText("kicker-desktop", `${datasetTitle} · ${dayLabel(day)}`);
    setText("kicker-phone", `${datasetTitle} · ${dayLabel(day)}`);
    setText("latest-title", anchor ? anchor.title : "");
  }

  setText("date", dayLabel(day));
  setText(
    "companies",
    `${isPast ? "All companies shown" : "All AI companies"} on ${dayLabel(day)} · total ${formatValue(
      totalForDate(day),
    )}`,
  );

  for (const marker of document.querySelectorAll<HTMLElement>("[data-news]")) {
    marker.classList.toggle("is-current", item !== null && marker.dataset.news === item.id);
  }
  for (const slider of document.querySelectorAll<HTMLInputElement>("[data-slider]")) {
    slider.value = String(Math.round(Math.max(0, Math.min(100, windowPercent(scale.percentOf(day), visibleTimeline))) * 100));
    slider.setAttribute("aria-valuetext", dayLabel(day));
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

  for (const button of document.querySelectorAll<HTMLButtonElement>('[data-zoom="fit"]')) {
    button.setAttribute("aria-pressed", String(fitPlayers));
    button.setAttribute("aria-label", fitPlayers ? "Show the whole bubble" : "Zoom in to the players");
    button.querySelector("path")?.setAttribute("d", fitPlayers
      ? "M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"
      : "M4 9h5V4M20 9h-5V4M4 15h5v5M20 15h-5v5");
  }

  // The zoom buttons step through the reader's own zoom, and stop at the ends.
  for (const button of document.querySelectorAll<HTMLButtonElement>('[data-zoom="in"]')) {
    button.disabled = zoomIndex >= ZOOMS.length - 1;
  }
  for (const button of document.querySelectorAll<HTMLButtonElement>('[data-zoom="out"]')) {
    button.disabled = zoomIndex <= 0;
  }

  // The bubble follows the day; a chapter frames its players as a news item does, a chosen item
  // frames its players, a chosen company frames itself and the companies it has money lines
  // with, and a plain day shows the whole frame. In the whole state none of them frames: the
  // button's state and the view stay the same.
  if (layoutsReady) {
    const players = storyChapter
      ? (fitPlayers ? storyChapter.players : [])
      : item && fitPlayers
        ? item.players
        : company && fitPlayers
          ? [company.id, ...partnersOf(company.id, day)]
          : [];
    for (const svg of document.querySelectorAll<SVGSVGElement>("[data-bubble]")) {
      renderBubble(svg, day, { players, focus: company?.id, manual: ZOOMS[zoomIndex], burstDate: burst?.date });
    }
  }

  if (soon) writeAddressSoon();
  else writeAddress();
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
  fitPlayers = true;
  storyListOpen = false;
  itemId = null;
  companyId = null;
  day = chapter.date;
  zoomIndex = 1;
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
  fitPlayers = false;
  zoomIndex = 1;
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
  fitPlayers = true;
  itemId = item.id;
  companyId = null;
  day = item.date;
  zoomIndex = 1;
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
  fitPlayers = companyId !== null;
  zoomIndex = 1;
  render();
}

function clearCompany(): void {
  companyId = null;
  itemId = null;
  fitPlayers = false;
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
  fitPlayers = false;
  itemId = null;
  zoomIndex = 1;
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
        fitPlayers = false;
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

  const zoom = control.dataset.zoom;
  if (zoom === "in") {
    zoomIndex = Math.min(ZOOMS.length - 1, zoomIndex + 1);
    render();
  } else if (zoom === "out") {
    zoomIndex = Math.max(0, zoomIndex - 1);
    render();
  } else if (zoom === "fit") {
    fitPlayers = !fitPlayers;
    zoomIndex = 1;
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

for (const slider of document.querySelectorAll<HTMLInputElement>("[data-slider]")) {
  slider.addEventListener("input", () => {
    sliderTo(scale.dateOf(windowPlace(Number(slider.value) / 100, visibleTimeline)));
  });
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
    fitPlayers = true;
    return;
  }
  const wantedId = params.get("news");
  const wanted = wantedId ? byId.get(wantedId) : undefined;
  if (wanted) {
    itemId = wanted.id;
    day = wanted.date;
    fitPlayers = true;
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
    fitPlayers = true;
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

// Measure wrapped titles, alternate sides and try two heights per side. Oversized or crowded
// titles retain the dot's native hover title. Blue dots keep their hover/focus-only labels.
function placeTimelineLabels(): void {
  const inner = document.querySelector<HTMLElement>("[data-timeline]");
  if (!inner) return;
  const story = document.body.dataset.mode === "story";
  labelsPlacedFor = story ? "story" : "explore";
  const zoomed = timelineZoomed && !story;
  const selected = itemId ?? latestOnOrBefore(ordered, day)?.id;
  for (const label of inner.querySelectorAll<HTMLElement>("[data-timeline-id]")) {
    label.classList.toggle("is-current", label.dataset.timelineId === selected);
  }
  const labels = Array.from(
    inner.querySelectorAll<HTMLElement>(story
      ? "[data-story-label]"
      : zoomed
        ? '[data-timeline-id]:not([data-outside="true"])'
        : '[data-timeline-label]:not([data-outside="true"])'),
  );

  for (const label of labels) label.hidden = false;
  const boxes = labels.map((label, index) => ({
    id: String(index),
    percent: Number.parseFloat(label.style.left) || 0,
    width: label.offsetWidth,
  }));
  const placed = placeLabels(boxes, inner.clientWidth);

  labels.forEach((label, index) => {
    const spot = placed.get(String(index));
    label.hidden = spot === undefined || label.offsetHeight > 28;
    if (!spot) return;
    label.dataset.side = spot.side;
    label.dataset.row = String(spot.row);
    label.dataset.align = spot.align;
    label.style.marginLeft = `${spot.shift}px`;
  });

  if (zoomed) return;
  for (const label of inner.querySelectorAll<HTMLElement>("[data-timeline-hover]")) {
    // Restore blue labels' hover-only placement after leaving the zoomed view.
    label.hidden = false;
    label.dataset.row = "0";
    delete label.dataset.side;
    label.style.marginLeft = "0px";
    const middle = ((Number.parseFloat(label.style.left) || 0) / 100) * inner.clientWidth;
    const half = label.offsetWidth / 2;
    label.dataset.align =
      middle - half < 0 ? "start" : middle + half > inner.clientWidth ? "end" : "center";
  }
}

window.addEventListener("resize", placeTimelineLabels);
document.fonts.ready.then(placeTimelineLabels, () => {});

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
