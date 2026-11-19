// Story mode's chapters: the Markdown files in docs/story, read once while the site is built.
// Pure helpers only, apart from chapterSources, which asks the build for the raw files.

export type Chapter = {
  // The number the address uses: 1 for the first file.
  number: number;
  // The file's name, for the build's error messages.
  file: string;
  title: string;
  // The day the bubble shows while the chapter is read, as YYYY-MM-DD.
  date: string;
  // The company ids the camera frames, from data/companies.json.
  players: string[];
  // The chapter text, one paragraph per entry, word for word from the file.
  paragraphs: string[];
};

// The day the site starts: no chapter may show the bubble before it.
export const FIRST_CHAPTER_DAY = "2022-11-30";

function unquote(value: string): string {
  const quoted = /^"(.*)"$/.exec(value) ?? /^'(.*)'$/.exec(value);
  return (quoted ? quoted[1] : value).trim();
}

// One file: front matter with title, date and players, then the text as paragraphs separated by
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

  const players = unquote(fields.get("players") ?? "")
    .replace(/^\[|\]$/g, "")
    .split(",")
    .map((id) => unquote(id))
    .filter((id) => id !== "");

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
    players,
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

// What would stop a chapter from being shown, as one line each. The page stops the build with
// these while Story is on, and src/lib/story.test.ts checks the real files, so a bad chapter is
// fixed here rather than found on the site.
export function chapterProblems(
  chapters: readonly Chapter[],
  companyIds: readonly string[],
): string[] {
  const known = new Set(companyIds);
  const problems: string[] = [];
  for (const chapter of chapters) {
    const day = /^\d{4}-\d{2}-\d{2}$/.test(chapter.date) && !Number.isNaN(Date.parse(chapter.date));
    if (!day) {
      problems.push(`${chapter.file}: date "${chapter.date}" is not a day like 2022-11-30.`);
    } else if (chapter.date < FIRST_CHAPTER_DAY) {
      problems.push(`${chapter.file}: date ${chapter.date} is before ${FIRST_CHAPTER_DAY}.`);
    }
    for (const id of chapter.players) {
      if (!known.has(id)) {
        problems.push(`${chapter.file}: player "${id}" is not a company id in data/companies.json.`);
      }
    }
  }
  return problems;
}

// The chapter files as raw text. Astro reads them while the site is built, so the site never
// asks for them at run time, and a changed chapter shows up on the next build.
export function chapterSources(): Record<string, string> {
  return import.meta.glob("../../docs/story/[0-9][0-9]-*.md", {
    eager: true,
    query: "?raw",
    import: "default",
  }) as Record<string, string>;
}
