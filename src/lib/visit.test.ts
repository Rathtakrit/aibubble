// A fake storage stands in for the browser tab's sessionStorage: the save and restore logic only
// reads and writes strings, so these tests need no page and no real storage.
// @ts-expect-error node:test has no types in this repo
import test from "node:test";
// @ts-expect-error node:assert has no types in this repo
import assert from "node:assert/strict";
import { pageOf, readVisit, restoreTabLinks, writeVisit } from "./visit.ts";
import type { VisitLink, VisitStorage } from "./visit.ts";

function fakeStorage(blocked = false): VisitStorage & { items: Map<string, string> } {
  const items = new Map<string, string>();
  return {
    items,
    getItem(key) {
      if (blocked) throw new Error("storage blocked");
      return items.get(key) ?? null;
    },
    setItem(key, value) {
      if (blocked) throw new Error("storage blocked");
      items.set(key, value);
    },
  };
}

function link(pathname: string): VisitLink {
  return { pathname, search: "", hash: "", href: pathname };
}

test("a page's address comes back with its query, and other pages stay untouched", () => {
  const storage = fakeStorage();
  writeVisit({ address: "/past/housing/?date=2024-02-03", zoom: "whole" }, storage);
  assert.equal(readVisit("/past/housing/", storage)?.address, "/past/housing/?date=2024-02-03");
  assert.equal(readVisit("/past/housing", storage)?.address, "/past/housing/?date=2024-02-03");
  assert.equal(readVisit("/", storage), null);
  assert.equal(readVisit("/past/dotcom/", storage), null);
});

test("the page's zoom and Compare's picks are saved with its address", () => {
  const storage = fakeStorage();
  writeVisit({ address: "/?date=2026-01-05&news=one", zoom: "focused" }, storage);
  writeVisit({
    address: "/compare/",
    compare: { sides: [{ dataset: "housing", moment: "peak" }, { dataset: "ai", moment: "latest" }], measure: "change" },
  }, storage);
  assert.equal(readVisit("/", storage)?.zoom, "focused");
  assert.deepEqual(readVisit("/compare/", storage)?.compare, {
    sides: [{ dataset: "housing", moment: "peak" }, { dataset: "ai", moment: "latest" }],
    measure: "change",
  });
  assert.equal(readVisit("/", storage)?.compare, undefined);
});

test("bubble tabs keep their plain story addresses even with saved Explore visits", () => {
  const storage = fakeStorage();
  const ai = link("/");
  const dotcom = link("/past/dotcom/");
  const housing = link("/past/housing/");
  const compare = link("/compare/");
  writeVisit({ address: "/?date=2024-02-03&news=one", zoom: "whole" }, storage);
  writeVisit({ address: "/past/dotcom/?date=2000-03-10", zoom: "whole" }, storage);
  writeVisit({ address: "/past/housing/?date=2006-03-10", zoom: "whole" }, storage);
  restoreTabLinks([ai, dotcom, housing, compare], storage);
  assert.equal(ai.href, "/");
  assert.equal(dotcom.href, "/past/dotcom/");
  assert.equal(housing.href, "/past/housing/");
  assert.equal(compare.href, "/compare/");
});

test("the Compare tab link follows its saved address when it changes", () => {
  const storage = fakeStorage();
  const compare = link("/compare/");
  writeVisit({ address: "/compare/?measure=size" }, storage);
  restoreTabLinks([compare], storage);
  assert.equal(compare.href, "/compare/?measure=size");
  writeVisit({ address: "/compare/?measure=change" }, storage);
  restoreTabLinks([compare], storage);
  assert.equal(compare.href, "/compare/?measure=change");
});

test("with storage blocked, reads return nothing, writes do not throw and links keep their paths", () => {
  const storage = fakeStorage(true);
  assert.doesNotThrow(() => writeVisit({ address: "/?date=2024-01-01", zoom: "whole" }, storage));
  assert.equal(readVisit("/", storage), null);
  const compare = link("/compare/");
  assert.doesNotThrow(() => restoreTabLinks([compare], storage));
  assert.equal(compare.href, "/compare/");
});

test("a broken, empty or foreign entry is ignored, never sent to another host", () => {
  const storage = fakeStorage();
  storage.items.set("aibubble.visit./", "{not json");
  assert.equal(readVisit("/", storage), null);
  storage.items.set("aibubble.visit./", JSON.stringify({ address: "https://example.com/?date=2024-01-01" }));
  assert.equal(readVisit("/", storage), null);
  storage.items.set("aibubble.visit./", JSON.stringify({ address: "//example.com/" }));
  assert.equal(readVisit("/", storage), null);
  storage.items.set("aibubble.visit./", JSON.stringify({ address: "/?date=2024-01-01", zoom: "close" }));
  assert.equal(readVisit("/", storage), null);
  // An entry saved for another page does not answer for this one.
  storage.items.set("aibubble.visit./", JSON.stringify({ address: "/past/housing/?date=2024-01-01" }));
  assert.equal(readVisit("/", storage), null);
  // A visit to another host is never written, even by mistake.
  writeVisit({ address: "https://example.com/" }, storage);
  assert.equal(storage.items.size, 1);
});

test("page names ignore the query, the hash and a trailing slash", () => {
  assert.equal(pageOf("/"), "/");
  assert.equal(pageOf("/?date=2024-01-01"), "/");
  assert.equal(pageOf("/past/housing/"), "/past/housing");
  assert.equal(pageOf("/past/housing?date=2024-01-01#top"), "/past/housing");
});
