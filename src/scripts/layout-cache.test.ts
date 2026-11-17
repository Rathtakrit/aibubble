// @ts-expect-error node:test has no types in this repo
import test from "node:test";
// @ts-expect-error node:assert has no types in this repo
import assert from "node:assert/strict";
import { layoutCacheKey, loadLayouts } from "./layout-cache.ts";
import type { LayoutEntry, LayoutStore } from "./layout-cache.ts";
import type { DayLayouts } from "../lib/layout.ts";

function sample(): DayLayouts {
  return {
    first: "2026-01-01", last: "2026-01-01", edgeGap: 0.2, dealGap: 0.4,
    days: new Map([["2026-01-01", new Map([["a", { x: 50, y: 50, r: 10 }]])]]),
  };
}

function memoryStore(entry?: LayoutEntry): LayoutStore & { entry?: LayoutEntry; removed: boolean } {
  return {
    entry, removed: false,
    async read() { return this.entry; },
    async remove() { this.removed = true; this.entry = undefined; },
    async write(_dataset, next) { this.entry = next; },
  };
}

test("cache key is stable, and changes with data, data set or worker bundle", async () => {
  const data = { values: [{ value: 10 }] };
  const key = await layoutCacheKey("ai", "/layout.A.js", data);
  assert.equal(await layoutCacheKey("ai", "/layout.A.js", structuredClone(data)), key);
  assert.notEqual(await layoutCacheKey("ai", "/layout.A.js", { values: [{ value: 11 }] }), key);
  assert.notEqual(await layoutCacheKey("dotcom", "/layout.A.js", data), key);
  assert.notEqual(await layoutCacheKey("ai", "/layout.B.js", data), key);
});

test("first load computes and saves; repeat load installs cloned Maps without computing", async () => {
  const store = memoryStore();
  let computations = 0;
  const compute = async () => { computations++; return sample(); };
  let installed: DayLayouts | undefined;
  await loadLayouts(store, "ai", "key", compute, (layouts) => { installed = layouts; });
  assert.equal(computations, 1);
  assert.equal(store.entry?.layouts, installed);
  store.entry = structuredClone(store.entry);
  await loadLayouts(store, "ai", "key", compute, (layouts) => { installed = layouts; });
  assert.equal(computations, 1);
  assert.equal(installed?.days.get("2026-01-01")?.get("a")?.r, 10);
});

test("changed data removes the old entry and computes a replacement", async () => {
  const oldKey = await layoutCacheKey("ai", "worker.js", { value: 10 });
  const newKey = await layoutCacheKey("ai", "worker.js", { value: 20 });
  const old = sample();
  const next = sample();
  const store = memoryStore({ key: oldKey, layouts: old });
  await loadLayouts(store, "ai", newKey, async () => {
    assert.equal(store.removed, true);
    return next;
  }, (layouts) => assert.equal(layouts, next));
  assert.equal(store.entry?.key, newKey);
});

test("throwing reads and writes still compute and install without rejecting", async () => {
  let computed = false;
  let installed = false;
  const store: LayoutStore = {
    async read() { throw new Error("blocked"); },
    async remove() { throw new Error("blocked"); },
    async write() { throw new Error("quota"); },
  };
  await loadLayouts(store, "ai", "key", async () => { computed = true; return sample(); }, () => {
    installed = true;
  });
  assert.equal(computed, true);
  assert.equal(installed, true);
});

test("a broken entry or failed deletion falls back to the worker", async () => {
  for (const layouts of [{ ...sample(), days: {} }, {
    ...sample(), days: new Map([["2026-01-01", new Map([["a", { x: NaN, y: 50, r: 10 }]])]]),
  }]) {
    const store = memoryStore({ key: "key", layouts: layouts as DayLayouts });
    store.remove = async () => { throw new Error("blocked deletion"); };
    let computed = false;
    await loadLayouts(store, "ai", "key", async () => { computed = true; return sample(); }, () => {});
    assert.equal(computed, true);
  }
});
