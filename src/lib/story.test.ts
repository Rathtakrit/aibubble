// Made-up chapter files, passed in as arguments, so these tests do not depend on docs/story.
// @ts-expect-error node:test has no types in this repo
import test from "node:test";
// @ts-expect-error node:assert has no types in this repo
import assert from "node:assert";
// @ts-expect-error node:fs has no types in this repo
import { readdirSync, readFileSync } from "node:fs";
import { chapterProblems, chapterWarnings, orderChapterFiles, parseChapter } from "./story.ts";

const chapter = `---
title: "A sample chapter"
date: 2023-05-30
players: [nvidia, openai]
links: [deal-one, 'deal-two']
look: "Two bubbles: one line, with an arrow."
sources: [https://www.example.com/news, "https://example.org/report"]
---
First paragraph, with a comma, a "quote" and an apostrophe's mark.

Second paragraph
wrapped over two lines.
`;

test("a chapter reads its front matter and paragraphs", () => {
  const parsed = parseChapter("01-a-sample.md", chapter);
  assert.equal(parsed.title, "A sample chapter");
  assert.equal(parsed.date, "2023-05-30");
  assert.deepEqual(parsed.players, ["nvidia", "openai"]);
  assert.deepEqual(parsed.links, ["deal-one", "deal-two"]);
  assert.equal(parsed.look, "Two bubbles: one line, with an arrow.");
  assert.deepEqual(parsed.sources, ["https://www.example.com/news", "https://example.org/report"]);
  assert.deepEqual(parsed.paragraphs, [
    'First paragraph, with a comma, a "quote" and an apostrophe\'s mark.',
    "Second paragraph wrapped over two lines.",
  ]);
});

test("optional picture fields can be absent or empty", () => {
  const omitted = chapter.replace(/^(?:links|look|sources):.*\n/gm, "");
  for (const source of [omitted, omitted.replace("---\nFirst", 'links: []\nlook: ""\nsources: []\n---\nFirst')]) {
    const { links, look, sources } = parseChapter("01-a-sample.md", source);
    assert.deepEqual({ links, look, sources }, { links: [], look: "", sources: [] });
  }
});

test("a file without front matter is refused", () => {
  assert.throws(() => parseChapter("03-bare.md", "No front matter here."), /no front matter/);
});

test("chapters come in file-name order, numbered from one", () => {
  const chapters = orderChapterFiles({
    "/docs/story/02-second.md": chapter.replace("A sample chapter", "Second"),
    "/docs/story/01-first.md": chapter.replace("A sample chapter", "First"),
    "/docs/story/10-tenth.md": chapter.replace("A sample chapter", "Tenth"),
  });
  assert.deepEqual(
    chapters.map((one) => [one.number, one.file, one.title]),
    [
      [1, "01-first.md", "First"],
      [2, "02-second.md", "Second"],
      [3, "10-tenth.md", "Tenth"],
    ],
  );
});

test("a good chapter has no problems", () => {
  const chapters = orderChapterFiles({ "/docs/story/01-a-sample.md": chapter });
  assert.deepEqual(chapterProblems(chapters), []);
  assert.deepEqual(chapterWarnings(chapters, ["nvidia", "openai"], ["deal-one", "deal-two"]), []);
});

test("a day before the start of the site is a problem", () => {
  const chapters = orderChapterFiles({
    "/docs/story/01-early.md": chapter.replace("2023-05-30", "2022-11-29"),
  });
  assert.deepEqual(chapterProblems(chapters), [
    "01-early.md: date 2022-11-29 is before 2022-11-30.",
  ]);
});

test("a past set checks days against its own first day", () => {
  const chapters = orderChapterFiles({
    "/docs/story/dotcom/01-early.md": chapter.replace("2023-05-30", "1994-12-31"),
    "/docs/story/dotcom/02-on-time.md": chapter.replace("2023-05-30", "1995-01-01"),
  });
  assert.deepEqual(chapterProblems(chapters, "1995-01-01"), [
    "01-early.md: date 1994-12-31 is before 1995-01-01.",
  ]);
});

test("a day that is not a calendar day is a problem", () => {
  const chapters = orderChapterFiles({
    "/docs/story/01-bad-day.md": chapter.replace("2023-05-30", "30 May 2023"),
  });
  assert.deepEqual(chapterProblems(chapters), [
    '01-bad-day.md: date "30 May 2023" is not a day like 2022-11-30.',
  ]);
});

// An id the data does not have yet (us-government waits for the owner's design) is skipped on the
// page, so it is a warning, never a build-stopping problem.
test("a player or link the data does not have is a warning, not a problem", () => {
  const chapters = orderChapterFiles({
    "/docs/story/01-unknown.md": chapter
      .replace("[nvidia, openai]", "[nvidia, someone]")
      .replace("[deal-one, 'deal-two']", "[deal-one, missing-deal]"),
  });
  assert.deepEqual(chapterProblems(chapters), []);
  assert.deepEqual(chapterWarnings(chapters, ["nvidia", "openai"], ["deal-one", "deal-two"]), [
    '01-unknown.md: player "someone" is not in the set\'s companies.json.',
    '01-unknown.md: link "missing-deal" is not in the set\'s deals.json.',
  ]);
});

// The real files in docs/story (AI), docs/story/dotcom and docs/story/housing. chapterSources()
// uses import.meta.glob, which only works inside the Astro build, so the files are read from disk
// here instead. Each set's days are checked against its own first day; ids its data does not have
// yet are printed as warnings.
const sets = [
  { id: "ai", dir: "docs/story", data: "data", firstDay: "2022-11-30" },
  { id: "dotcom", dir: "docs/story/dotcom", data: "data/past/dotcom", firstDay: "" },
  { id: "housing", dir: "docs/story/housing", data: "data/past/housing", firstDay: "" },
];
const readJson = (path: string) => JSON.parse(readFileSync(path, "utf8"));

for (const set of sets) {
  test(`the real ${set.id} chapter files have no problems`, (t: { diagnostic(message: string): void }) => {
    const files = readdirSync(set.dir).filter((file: string) => /^[0-9][0-9]-.*\.md$/.test(file));
    assert.equal(files.length, 9, `${set.dir} should hold nine chapter files.`);
    const sources: Record<string, string> = {};
    for (const file of files) sources[`${set.dir}/${file}`] = readFileSync(`${set.dir}/${file}`, "utf8");
    const chapters = orderChapterFiles(sources);
    const firstDay = set.firstDay || readJson(`${set.data}/meta.json`).first_day;
    assert.deepEqual(chapterProblems(chapters, firstDay), []);
    const ids = (file: string) => (readJson(`${set.data}/${file}`).items as { id: string }[]).map((row) => row.id);
    for (const warning of chapterWarnings(chapters, ids("companies.json"), ids("deals.json"))) {
      t.diagnostic(`warning: ${set.dir}/${warning}`);
      console.warn(`warning: ${set.dir}/${warning}`);
    }
  });
}
