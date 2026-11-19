// Each tab keeps its place for the rest of the browser tab's visit: the address it was last on,
// and the things that have no address of their own (Explore's zoom, Compare's picks). Every page
// stores one entry per page in sessionStorage, and its tab links point back at those addresses.
// Storage can be blocked (a private window), so every read and write is guarded: with no storage
// the pages simply start as they do on a first visit.

export type VisitStorage = Pick<Storage, "getItem" | "setItem">;
export type VisitZoom = "whole" | "focused";

export type VisitCompare = {
  sides: { dataset: string; moment: string }[];
  measure: string;
};

export type Visit = {
  address: string;
  zoom?: VisitZoom;
  compare?: VisitCompare;
};

// A tab link as the browser holds it: the parts that decide whether it names its own view.
export type VisitLink = { pathname: string; search: string; hash: string; href: string };

const PREFIX = "aibubble.visit.";

// One entry per page: /past/housing and /past/housing/ are the same page, and the query belongs
// to the address inside the entry, not to the key.
export function pageOf(address: string): string {
  const path = address.split(/[?#]/)[0] ?? "";
  const trimmed = path.replace(/\/+$/, "");
  return trimmed === "" ? "/" : trimmed;
}

// A path on this site: never another host, and never a URL that would leave the site.
function sameSite(address: string): boolean {
  return address.startsWith("/") && !address.startsWith("//");
}

export function tabStorage(): VisitStorage | null {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isCompare(value: unknown): value is VisitCompare {
  if (!isRecord(value) || typeof value.measure !== "string" || !Array.isArray(value.sides)) return false;
  return value.sides.every((side) =>
    isRecord(side) && typeof side.dataset === "string" && typeof side.moment === "string");
}

function isVisit(value: unknown): value is Visit {
  if (!isRecord(value) || typeof value.address !== "string" || !sameSite(value.address)) return false;
  if (value.zoom !== undefined && value.zoom !== "whole" && value.zoom !== "focused") return false;
  if (value.compare !== undefined && !isCompare(value.compare)) return false;
  return true;
}

// The page's saved entry, or null when it has none, storage is blocked, or the entry is broken.
// An entry only answers for the page it was saved on.
export function readVisit(page: string, storage: VisitStorage | null): Visit | null {
  if (!storage) return null;
  try {
    const value: unknown = JSON.parse(storage.getItem(PREFIX + pageOf(page)) ?? "null");
    if (!isVisit(value) || pageOf(value.address) !== pageOf(page)) return null;
    return value;
  } catch {
    return null;
  }
}

export function writeVisit(visit: Visit, storage: VisitStorage | null): void {
  if (!storage || !sameSite(visit.address)) return;
  try {
    storage.setItem(PREFIX + pageOf(visit.address), JSON.stringify(visit));
  } catch {
    // Nothing to do: the place is simply not remembered.
  }
}

// A page's tab links lead back to where the reader left each one. Call it with the links that
// stand for a page itself (a link with a query of its own, like Story's ?chapter=1, says what it
// means and is not one); it can be called again whenever a page's saved place changes.
export function restoreTabLinks(links: Iterable<VisitLink>, storage: VisitStorage | null): void {
  if (!storage) return;
  for (const link of links) {
    const saved = readVisit(link.pathname, storage);
    if (saved) link.href = saved.address;
  }
}
