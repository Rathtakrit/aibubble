import type { DayLayouts } from "../lib/layout.ts";

export type LayoutEntry = { key: string; layouts: DayLayouts };
export type LayoutStore = {
  read: (dataset: string) => Promise<LayoutEntry | undefined>;
  remove: (dataset: string) => Promise<void>;
  write: (dataset: string, entry: LayoutEntry) => Promise<void>;
};

// The bundle URL versions the algorithm and its dependencies; the digest also makes
// data invalidation explicit, including when running the unbundled dev server.
export async function layoutCacheKey(dataset: string, workerUrl: string, data: unknown): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(JSON.stringify(data)));
  const hash = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${dataset}|${workerUrl}|${hash}`;
}

function validLayouts(value: unknown): value is DayLayouts {
  if (!value || typeof value !== "object") return false;
  const layout = value as DayLayouts;
  if (typeof layout.first !== "string" || typeof layout.last !== "string"
    || !Number.isFinite(layout.edgeGap) || !Number.isFinite(layout.dealGap)
    || !(layout.days instanceof Map) || !layout.days.has(layout.first) || !layout.days.has(layout.last)) return false;
  const first = Date.parse(layout.first);
  const last = Date.parse(layout.last);
  if (!Number.isFinite(first) || !Number.isFinite(last) || first > last) return false;
  for (let time = first; time <= last; time += 86_400_000) {
    const circles = layout.days.get(new Date(time).toISOString().slice(0, 10));
    if (!(circles instanceof Map)) return false;
    for (const [id, circle] of circles) {
      if (typeof id !== "string" || !circle || !Number.isFinite(circle.x)
        || !Number.isFinite(circle.y) || !Number.isFinite(circle.r) || circle.r < 0) return false;
    }
  }
  return true;
}

export async function loadLayouts(
  store: LayoutStore,
  dataset: string,
  key: string,
  compute: () => Promise<DayLayouts>,
  install: (layouts: DayLayouts) => void,
): Promise<void> {
  let cached: DayLayouts | undefined;
  try {
    const entry = await store.read(dataset);
    if (entry?.key === key && validLayouts(entry.layouts)) cached = entry.layouts;
    else if (entry) await store.remove(dataset);
  } catch {
    // Storage is optional, including in private windows and with broken entries.
  }
  if (cached) {
    install(cached);
    return;
  }
  const layouts = await compute();
  install(layouts);
  try {
    // One record per data set replaces any older version, without losing other pages.
    await store.write(dataset, { key, layouts });
  } catch {
    // The worker result is already on screen; a failed save must not affect it.
  }
}

function transaction<T>(mode: IDBTransactionMode, operation: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    let db: IDBDatabase | undefined;
    // Some browsers leave an open request pending rather than reporting blocked storage.
    const timer = setTimeout(() => {
      db?.close();
      reject(new Error("Layout cache timed out"));
    }, 1000);
    const fail = () => {
      clearTimeout(timer);
      db?.close();
      reject(new Error("Layout cache unavailable"));
    };
    try {
      const open = indexedDB.open("aibubble-layouts", 1);
      open.onupgradeneeded = () => open.result.createObjectStore("layouts");
      open.onerror = fail;
      open.onblocked = fail;
      open.onsuccess = () => {
        db = open.result;
        try {
          const tx = db.transaction("layouts", mode);
          const request = operation(tx.objectStore("layouts"));
          tx.oncomplete = () => {
            clearTimeout(timer);
            db?.close();
            resolve(request.result);
          };
          tx.onerror = fail;
          tx.onabort = fail;
        } catch {
          fail();
        }
      };
    } catch {
      fail();
    }
  });
}

export const layoutStore: LayoutStore = {
  read: (dataset) => transaction("readonly", (store) => store.get(dataset)),
  remove: async (dataset) => { await transaction("readwrite", (store) => store.delete(dataset)); },
  write: async (dataset, entry) => { await transaction("readwrite", (store) => store.put(entry, dataset)); },
};
