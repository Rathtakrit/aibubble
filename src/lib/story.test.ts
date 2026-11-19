// Made-up chapter files, passed in as arguments, so these tests do not depend on docs/story.
// @ts-expect-error node:test has no types in this repo
import test from "node:test";
// @ts-expect-error node:assert has no types in this repo
import assert from "node:assert";
// @ts-expect-error node:fs has no types in this repo
import { readdirSync, readFileSync } from "node:fs";
import { chapterProblems, orderChapterFiles, parseChapter } from "./story.ts";

const chapter = `---
title: "A sample chapter"
date: 2023-05-30
players: [nvidia, openai]
---
First paragraph, with a comma, a "quote" and an apostrophe's mark.

Second paragraph
wrapped over two lines.
`;

test("a chapter reads its title, date, players and paragraphs", () => {
  const parsed = parseChapter("01-a-sample.md", chapter);
  assert.equal(parsed.title, "A sample chapter");
  assert.equal(parsed.date, "2023-05-30");
  assert.deepEqual(parsed.players, ["nvidia", "openai"]);
  assert.deepEqual(parsed.paragraphs, [
    'First paragraph, with a comma, a "quote" and an apostrophe\'s mark.',
    "Second paragraph wrapped over two lines.",
  ]);
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
  assert.deepEqual(chapterProblems(chapters, ["nvidia", "openai"]), []);
});

test("a day before the start of the site is a problem", () => {
  const chapters = orderChapterFiles({
    "/docs/story/01-early.md": chapter.replace("2023-05-30", "2022-11-29"),
  });
  assert.deepEqual(chapterProblems(chapters, ["nvidia", "openai"]), [
    "01-early.md: date 2022-11-29 is before 2022-11-30.",
  ]);
});

test("a day that is not a calendar day is a problem", () => {
  const chapters = orderChapterFiles({
    "/docs/story/01-bad-day.md": chapter.replace("2023-05-30", "30 May 2023"),
  });
  assert.deepEqual(chapterProblems(chapters, ["nvidia", "openai"]), [
    '01-bad-day.md: date "30 May 2023" is not a day like 2022-11-30.',
  ]);
});

test("a player that is not a company is a problem", () => {
  const chapters = orderChapterFiles({
    "/docs/story/01-unknown.md": chapter.replace("[nvidia, openai]", "[nvidia, someone]"),
  });
  assert.deepEqual(chapterProblems(chapters, ["nvidia", "openai"]), [
    '01-unknown.md: player "someone" is not a company id in data/companies.json.',
  ]);
});

// The real files in docs/story. chapterSources() uses import.meta.glob, which only works inside
// the Astro build, so the files are read from disk here instead. The site no longer stops when
// Story is off, so this keeps the chapter check runnable.
test("the real chapter files have no problems", () => {
  const dir = "docs/story";
  const files = readdirSync(dir).filter((file: string) => /^[0-9][0-9]-.*\.md$/.test(file));
  assert.ok(files.length > 0, "docs/story has no chapter files.");
  const sources: Record<string, string> = {};
  for (const file of files) sources[`${dir}/${file}`] = readFileSync(`${dir}/${file}`, "utf8");
  const chapters = orderChapterFiles(sources);
  const companies = JSON.parse(readFileSync("data/companies.json", "utf8")).items as {
    id: string;
  }[];
  assert.deepEqual(
    chapterProblems(
      chapters,
      companies.map((company) => company.id),
    ),
    [],
  );
});
