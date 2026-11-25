import { expect, test, type Locator, type Page } from '@playwright/test';
// @ts-expect-error node:fs has no types in this repo
import { readdirSync, readFileSync } from 'node:fs';
import aiNews from '../data/news.json' with { type: 'json' };
import aiDeals from '../data/deals.json' with { type: 'json' };
import dotcomNews from '../data/past/dotcom/news.json' with { type: 'json' };
import dotcomMeta from '../data/past/dotcom/meta.json' with { type: 'json' };
import housingNews from '../data/past/housing/news.json' with { type: 'json' };
import housingMeta from '../data/past/housing/meta.json' with { type: 'json' };
import { FIRST_CHAPTER_DAY, orderChapterFiles } from '../src/lib/story.ts';

type NewsRow = { date: string; kind: string };

function readChapters(storyDir: string) {
  return orderChapterFiles(Object.fromEntries(
    readdirSync(storyDir)
      .filter((file: string) => /^[0-9][0-9]-.*\.md$/.test(file))
      .map((file: string) => [file, readFileSync(`${storyDir}/${file}`, 'utf8')]),
  ));
}

// A money item from the middle of a set's Explore timeline, which starts on the set's first day.
function middleMoneyDate(items: NewsRow[], firstDay: string) {
  const money = items.filter(item => item.kind === 'money' && item.date >= firstDay)
    .sort((a, b) => a.date.localeCompare(b.date));
  return money[Math.floor(money.length / 2)].date;
}

// Each bubble's page opens on its own story, read from its own folder.
const sets = [
  { name: 'AI', path: '/', chapters: readChapters('docs/story'), exploreDate: middleMoneyDate(aiNews.items, FIRST_CHAPTER_DAY) },
  {
    name: 'Dot-com', path: '/past/dotcom/', chapters: readChapters('docs/story/dotcom'),
    exploreDate: middleMoneyDate(dotcomNews.items, dotcomMeta.first_day),
  },
  {
    name: 'Housing', path: '/past/housing/', chapters: readChapters('docs/story/housing'),
    exploreDate: middleMoneyDate(housingNews.items, housingMeta.first_day),
  },
];
const chapters = sets[0].chapters;
const exploreDate = sets[0].exploreDate;
const formatDay = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
});
const slider = (page: Page) => page.getByRole('slider', { name: 'Day', exact: true });
const story = (page: Page) => page.locator('[data-block="story"]').filter({ visible: true });

function recordErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text());
  });
  return errors;
}

async function expectChapter(page: Page, number: number, list = chapters) {
  const chapter = list[number - 1];
  await expect(page.locator('body')).toHaveAttribute('data-mode', 'story');
  await expect(page.getByText(`Chapter ${number} of ${list.length}`, { exact: true }).filter({ visible: true })).toBeVisible();
  await expect(story(page).getByRole('heading', { name: chapter.title, exact: true })).toBeVisible();
  await expect(slider(page)).toHaveAttribute('aria-valuetext', formatDay.format(new Date(chapter.date)));
  return chapter;
}

async function expectExplore(page: Page, day: string) {
  await expect(page.locator('body')).toHaveAttribute('data-mode', 'explore');
  await expect(story(page)).toHaveCount(0);
  await expect(slider(page)).toHaveAttribute('aria-valuetext', formatDay.format(new Date(day)));
}

test('AI opens the story, with no separate Story tab or Mode switch', async ({ page }) => {
  await page.goto('/');
  await expectChapter(page, 1);
  await expect(page.locator('.site-nav').getByRole('link', { name: 'Story', exact: true, includeHidden: true })).toHaveCount(0);
  await expect(page.getByRole('group', { name: 'Mode', exact: true, includeHidden: true })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'AI', exact: true })).toHaveAttribute('aria-current', 'page');
});

for (const set of sets) {
  test(`${set.name} opens its story; its chapters, picture, and sources follow Next`, async ({ page }) => {
    const errors = recordErrors(page);
    const list = set.chapters;
    expect(list.length).toBeGreaterThan(0);
    await page.goto(set.path);
    await expectChapter(page, 1, list);
    await expect(page.getByText(/Chapters written with AI/i)).toHaveCount(0);

    const card = story(page);
    for (let number = 1; number <= list.length; number++) {
      const chapter = await expectChapter(page, number, list);
      const look = card.locator('[data-story-look]');
      if (chapter.look) await expect(look).toHaveText(`In the picture: ${chapter.look}`);
      else await expect(look).toBeHidden();
      const sources = card.locator('[data-story-sources]');
      await expect(sources).toBeVisible();
      expect(chapter.sources.length).toBeGreaterThan(0);
      const hosts = chapter.sources.map(url => new URL(url).hostname.replace(/^www\./, ''));
      await expect(sources).toHaveText(`Sources: ${hosts.join(' · ')}`);
      await expect(sources.getByRole('link')).toHaveCount(hosts.length);
      for (const [index, host] of hosts.entries()) {
        const link = sources.getByRole('link').nth(index);
        await expect(link).toHaveAccessibleName(`Source: ${host}, opens in a new tab`);
        await expect(link).toHaveAttribute('href', new URL(chapter.sources[index]).href);
        await expect(link).toHaveAttribute('target', '_blank');
        await expect(link).toHaveAttribute('rel', 'noopener');
      }
      for (const button of await card.getByRole('button').all()) {
        await expect(button).toBeVisible();
        const box = (await button.boundingBox())!;
        expect(Math.min(box.width, box.height), await button.innerText()).toBeGreaterThanOrEqual(44);
      }
      if (number < list.length) await card.getByRole('button', { name: /^Next chapter/ }).click();
    }
    await expect(card.getByRole('button', { name: 'Explore any day', exact: true })).toBeVisible();
    // The worker must have drawn the bubble before checking for runtime errors.
    await expect(page.locator('[data-bubble] .bubble').filter({ visible: true }).first()).toBeVisible();
    await card.getByRole('button', { name: 'Explore any day', exact: true }).click();
    await expectExplore(page, list.at(-1)!.date);
    expect(errors).toEqual([]);
  });

  test(`${set.name}: Explore day by day opens the chapter's day, and ?date= opens Explore`, async ({ page }) => {
    const errors = recordErrors(page);
    const chapter = set.chapters[Math.min(2, set.chapters.length - 1)];
    await page.goto(`${set.path}?chapter=${chapter.number}`);
    await expectChapter(page, chapter.number, set.chapters);
    await story(page).getByRole('button', { name: 'Explore day by day', exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`\\?date=${chapter.date}$`));
    await expectExplore(page, chapter.date);

    await page.goto(`${set.path}?date=${set.exploreDate}`);
    await expectExplore(page, set.exploreDate);
    expect(errors).toEqual([]);
  });
}

test('Wrapped chapter sources keep 44px tap targets without adding desktop scroll', async ({ page, isMobile }) => {
  const chapter = chapters.find(entry => entry.file.endsWith('-the-first-pop.md'))!;
  if (!isMobile) await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`/?chapter=${chapter.number}`);
  await expectChapter(page, chapter.number);
  await page.evaluate(() => document.fonts.ready.then(() => null));

  const links = story(page).locator('[data-story-sources]').getByRole('link');
  await expect(links).toHaveCount(chapter.sources.length);
  const metrics = await links.evaluateAll(anchors => anchors.map(anchor => {
    const text = document.createRange();
    text.selectNodeContents(anchor);
    return { height: anchor.getBoundingClientRect().height, top: text.getBoundingClientRect().top };
  }));
  for (const { height } of metrics) expect(height).toBeGreaterThanOrEqual(44);
  const rows = [...new Set(metrics.map(({ top }) => Math.round(top)))].sort((a, b) => a - b);
  expect(rows.length).toBeGreaterThan(1);
  for (let i = 1; i < rows.length; i++) expect(rows[i] - rows[i - 1]).toBeLessThanOrEqual(24);
  if (!isMobile) {
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight)).toBe(0);
  }
});

test('linked chapter lights its eligible money lines only', async ({ page }) => {
  // This chapter also has unlisted money lines between its players.
  const chapter = chapters.find(entry => entry.file.endsWith('-the-circle.md'))!;
  const keys = new Set(aiDeals.items
    .filter(deal => chapter.links.includes(deal.id) && deal.date <= chapter.date)
    .map(deal => `${deal.from}|${deal.to}|${deal.kind}`));
  expect(keys.size).toBeGreaterThan(0);
  await page.goto(`/?chapter=${chapter.number}`);
  await expectChapter(page, chapter.number);
  const arrows = page.locator('[data-bubble]:visible .bubble-arrow');
  await expect.poll(() => arrows.evaluateAll(groups => groups.filter(group =>
    (group as SVGElement).style.opacity === '1' &&
    getComputedStyle(group.querySelector('.bubble-arrow-head')!).display !== 'none',
  ).length)).toBe(keys.size);
  expect(await arrows.count()).toBeGreaterThan(keys.size);
});

test('Explore opens on the chapter day or on an explicit date, and bubble tabs reopen chapter 1', async ({ page }) => {
  const errors = recordErrors(page);
  const chapter = chapters[Math.min(2, chapters.length - 1)];
  await page.goto(`/?chapter=${chapter.number}`);
  await expectChapter(page, chapter.number);
  await story(page).getByRole('button', { name: 'Explore day by day', exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`\\?date=${chapter.date}$`));
  await expectExplore(page, chapter.date);

  await page.goto(`/?date=${exploreDate}`);
  await expectExplore(page, exploreDate);
  await page.getByRole('link', { name: 'Dot-com', exact: true }).click();
  await expectChapter(page, 1, sets[1].chapters);
  await page.getByRole('link', { name: 'AI', exact: true }).click();
  await expectChapter(page, 1);

  for (const set of sets.slice(1)) {
    // Leave each past bubble with a saved Explore address, then use tabs to revisit it.
    await page.goto(`${set.path}?date=${set.exploreDate}`);
    await expectExplore(page, set.exploreDate);
    await page.getByRole('link', { name: 'AI', exact: true }).click();
    await expectChapter(page, 1);
    await page.getByRole('link', { name: set.name, exact: true }).click();
    await expectChapter(page, 1, set.chapters);
  }

  await page.goto('/');
  await expectChapter(page, 1);
  await expect(page.locator('[data-bubble] .bubble').filter({ visible: true }).first()).toBeVisible();
  expect(errors).toEqual([]);
});

async function expectIconButton(button: Locator, label: string) {
  await expect(button).toBeVisible();
  await expect(button).toHaveText('', { useInnerText: true });
  await expect(button).toHaveAttribute('aria-label', label);
  await expect(button).toHaveAttribute('title', label);
  await expect(button.locator('svg')).toBeVisible();
  const rect = (await button.boundingBox())!;
  expect(rect.width, `${label} width`).toBeGreaterThanOrEqual(44);
  expect(rect.height, `${label} height`).toBeGreaterThanOrEqual(44);
}

test('Explore and Story switch modes with labelled icon buttons', async ({ page }) => {
  await page.goto(`/?date=${exploreDate}`);
  await expectExplore(page, exploreDate);
  const controls = page.locator('.timeline-controls');
  const button = (name: string) => controls.getByRole('button', { name, exact: true });
  const back = button('Back to the story');
  await expectIconButton(back, 'Back to the story');
  await expectIconButton(button('First day'), 'First day');
  const whole = button('Whole timeline');
  await expectIconButton(whole, 'Whole timeline');
  await whole.click();
  await expectIconButton(button('Zoom in'), 'Zoom in');

  await back.click();
  await expect(page).toHaveURL(/\?chapter=1$/);
  const first = await expectChapter(page, 1);
  const explore = story(page).getByRole('button', { name: 'Explore day by day', exact: true });
  await expectIconButton(explore, 'Explore day by day');
  await explore.click();
  await expectExplore(page, first.date);
});
