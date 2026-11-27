// Story mode's chapters: the Markdown files in docs/story (AI), docs/story/dotcom and
// docs/story/housing, read once while the site is built.
// Pure helpers only, apart from chapterSources, which asks the build for the raw files.

export type Chapter = {
  // The number the address uses: 1 for the first file.
  number: number;
  // The file's name, for the build's error messages.
  file: string;
  title: string;
  // The day the bubble shows while the chapter is read, as YYYY-MM-DD.
  date: string;
  // The company ids the camera frames, from the set's companies.json.
  players: string[];
  // Deal ids whose arrows should be lit, from the set's deals.json.
  links: string[];
  look: string;
  sources: string[];
  // The chapter text, one paragraph per entry, word for word from the file.
  paragraphs: string[];
};

// The day the AI site starts: no AI chapter may show the bubble before it. A past set starts on
// its meta.json first_day instead.
export const FIRST_CHAPTER_DAY = "2022-11-30";

function unquote(value: string): string {
  value = value.trim();
  const quoted = /^"(.*)"$/.exec(value) ?? /^'(.*)'$/.exec(value);
  return (quoted ? quoted[1] : value).trim();
}

function readList(value: string): string[] {
  return unquote(value)
    .replace(/^\[|\]$/g, "")
    .split(",")
    .map(unquote)
    .filter(Boolean);
}

// One file: front matter, then the text as paragraphs separated by
// blank lines. The text is never shortened or reworded; only the wrapping whitespace inside a
// paragraph becomes a single space.
export function parseChapter(file: string, source: string): Chapter {
  const front = /^---\r?\n([\s\S]*?)\r?\n---[ \t]*\r?\n?/.exec(source);
  if (!front) throw new Error(`${file}: the chapter has no front matter between --- lines.`);

  const fields = new Map<string, string>();
  for (const line of front[1].split(/\r?\n/)) {
    const at = line.indexOf(":");
    if (at < 0) continue;
    fields.set(line.slice(0, at).trim(), line.slice(at + 1).trim());
  }

  const paragraphs = source
    .slice(front[0].length)
    .split(/\r?\n[ \t]*\r?\n/)
    .map((paragraph) => paragraph.replace(/\s*\r?\n\s*/g, " ").trim())
    .filter((paragraph) => paragraph !== "");

  return {
    number: 0,
    file,
    title: unquote(fields.get("title") ?? ""),
    date: unquote(fields.get("date") ?? ""),
    players: readList(fields.get("players") ?? ""),
    links: readList(fields.get("links") ?? ""),
    look: unquote(fields.get("look") ?? ""),
    sources: readList(fields.get("sources") ?? ""),
    paragraphs,
  };
}

// Every chapter in file-name order, numbered from 1.
export function orderChapterFiles(files: Record<string, string>): Chapter[] {
  return Object.keys(files)
    .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
    .map((path, index) => {
      const file = path.slice(path.lastIndexOf("/") + 1);
      return { ...parseChapter(file, files[path]), number: index + 1 };
    });
}

// What would stop a chapter from being shown, as one line each: a day that is not a day, or one
// before the set's first day. The page stops the build with these, and src/lib/story.test.ts
// checks the real files, so a bad chapter is fixed here rather than found on the site.
export function chapterProblems(chapters: readonly Chapter[], firstDay = FIRST_CHAPTER_DAY): string[] {
  const problems: string[] = [];
  for (const chapter of chapters) {
    const day = /^\d{4}-\d{2}-\d{2}$/.test(chapter.date) && !Number.isNaN(Date.parse(chapter.date));
    if (!day) {
      problems.push(`${chapter.file}: date "${chapter.date}" is not a day like 2022-11-30.`);
    } else if (chapter.date < firstDay) {
      problems.push(`${chapter.file}: date ${chapter.date} is before ${firstDay}.`);
    }
  }
  return problems;
}

// Player and link ids the set's data does not have yet, as one line each. They do not stop the
// build: the page frames and lights only the ids it has, and the unit test prints these as
// warnings. (us-government, for example, waits for the owner's design.)
export function chapterWarnings(
  chapters: readonly Chapter[],
  companyIds: readonly string[],
  dealIds: readonly string[],
): string[] {
  const companies = new Set(companyIds);
  const deals = new Set(dealIds);
  const warnings: string[] = [];
  for (const chapter of chapters) {
    for (const id of chapter.players) {
      if (!companies.has(id)) warnings.push(`${chapter.file}: player "${id}" is not in the set's companies.json.`);
    }
    for (const id of chapter.links) {
      if (!deals.has(id)) warnings.push(`${chapter.file}: link "${id}" is not in the set's deals.json.`);
    }
  }
  return warnings;
}

// The chapter files of one set as raw text. Astro reads them while the site is built, so the site
// never asks for them at run time, and a changed chapter shows up on the next build.
// import.meta.glob takes only literal patterns and options, so each set has its own call.
export function chapterSources(set: "ai" | "dotcom" | "housing"): Record<string, string> {
  if (set === "dotcom") {
    return import.meta.glob("../../docs/story/dotcom/[0-9][0-9]-*.md", { eager: true, query: "?raw", import: "default" }) as Record<string, string>;
  }
  if (set === "housing") {
    return import.meta.glob("../../docs/story/housing/[0-9][0-9]-*.md", { eager: true, query: "?raw", import: "default" }) as Record<string, string>;
  }
  return import.meta.glob("../../docs/story/[0-9][0-9]-*.md", { eager: true, query: "?raw", import: "default" }) as Record<string, string>;
}
