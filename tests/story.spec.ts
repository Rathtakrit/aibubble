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

test('AI opens the story with bubble tabs but no separate Story tab or Mode switch', async ({ page, isMobile }) => {
  await page.goto('/');
  await expectChapter(page, 1);
  await expect(page.locator('.site-nav').getByRole('link', { name: 'Story', exact: true, includeHidden: true })).toHaveCount(0);
  await expect(page.getByRole('group', { name: 'Mode', exact: true, includeHidden: true })).toHaveCount(0);
  const tabs = page.locator(isMobile ? '.map-top .mode-switch' : '.site-nav');
  await expect(tabs.getByRole('link', { name: 'AI', exact: true })).toHaveAttribute('aria-current', 'page');
  if (isMobile) {
    await expect(tabs.getByRole('link')).toHaveText(['AI', 'Dot-com', 'Housing', 'Compare']);
    await expect(page.locator('.sheet .mode-switch')).toHaveCount(0);
  }
});

for (const set of sets) {
  test(`${set.name} opens its story; its chapters, picture, and sources follow Next`, async ({ page, isMobile }) => {
    const errors = recordErrors(page);
    const list = set.chapters;
    expect(list.length).toBeGreaterThan(0);
    await page.goto(set.path);
    await expectChapter(page, 1, list);
    await expect(page.getByText(/Chapters written with AI/i)).toHaveCount(0);

    const card = story(page);
    const navigation = isMobile ? page.locator('.timeline-controls') : card;
    const next = navigation.getByRole('button', { name: /^Next chapter/ });
    const explore = navigation.getByRole('button', { name: 'Explore any day', exact: true });
    if (isMobile) {
      const earlier = navigation.getByRole('button', { name: 'Earlier chapter', exact: true });
      await expectIconButton(earlier, 'Earlier chapter');
      await expect(earlier).toBeDisabled();
      if (list.length > 1) {
        await expectIconButton(next, 'Next chapter');
        await next.tap();
        await expectChapter(page, 2, list);
        await earlier.tap();
        await expectChapter(page, 1, list);
      }
    }
    for (let number = 1; number <= list.length; number++) {
      const chapter = await expectChapter(page, number, list);
      await expect(card.locator('[data-story-look]')).toHaveCount(0);
      await expect(card.getByText('In the picture')).toHaveCount(0);
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
      if (number < list.length) {
        if (isMobile) await next.tap();
        else await next.click();
      }
    }
    await expect(explore).toBeVisible();
    if (isMobile) await expectIconButton(explore, 'Explore any day');
    // The worker must have drawn the bubble before checking for runtime errors.
    await expect(page.locator('[data-bubble] .bubble').filter({ visible: true }).first()).toBeVisible();
    if (isMobile) await explore.tap();
    else await explore.click();
    await expectExplore(page, list.at(-1)!.date);
    expect(errors).toEqual([]);
  });

  test(`${set.name}: Explore day by day opens the chapter's day, and ?date= opens Explore`, async ({ page }) => {
    const errors = recordErrors(page);
    const chapter = set.chapters[Math.min(2, set.chapters.length - 1)];
    await page.goto(`${set.path}?chapter=${chapter.number}`);
    await expectChapter(page, chapter.number, set.chapters);
    await page.locator('.timeline-controls [data-action="story-explore"]').click();
    await expect(page).toHaveURL(new RegExp(`\\?date=${chapter.date}$`));
    await expectExplore(page, chapter.date);

    await page.goto(`${set.path}?date=${set.exploreDate}`);
    await expectExplore(page, set.exploreDate);
    expect(errors).toEqual([]);
  });
}

for (const viewport of [{ width: 390, height: 844 }, { width: 360, height: 780 }]) {
  test(`AI Story timeline and controls fit at ${viewport.width}x${viewport.height}`, async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Measures the phone Story timeline');
    await page.setViewportSize(viewport);

    const timeline = page.locator('body[data-mode="story"] .timeline-inner');
    const next = page.locator('.timeline-controls [data-timeline-next]');
    for (const chapter of chapters) {
      await page.goto(`/?chapter=${chapter.number}`);
      await expectChapter(page, chapter.number);
      await page.evaluate(() => document.fonts.ready.then(() => null));

      await expect(timeline).toBeVisible();
      const rail = (await timeline.boundingBox())!;
      expect(rail.height, `chapter ${chapter.number} timeline height`).toBeLessThanOrEqual(72);

      // The phone's Next button becomes Explore on the last chapter.
      await expect(next).toHaveAccessibleName(chapter === chapters.at(-1) ? 'Explore any day' : 'Next chapter');
      await expect(next).toBeVisible();
      const button = (await next.boundingBox())!;
      const windowHeight = await page.evaluate(() => window.innerHeight);
      expect(button.y + button.height, `chapter ${chapter.number} control bottom`).toBeLessThanOrEqual(windowHeight);
    }
  });
}

const longestTitle = chapters.reduce((longest, chapter) => chapter.title.length > longest.title.length ? chapter : longest);
for (const viewport of [{ width: 1280, height: 800 }, { width: 1440, height: 900 }]) {
  test(`AI Story titles are centred and chapters fit at ${viewport.width}x${viewport.height}`, async ({ page, isMobile }) => {
    test.skip(isMobile, 'Measures the desktop Story layout');
    await page.setViewportSize(viewport);

    for (const chapter of chapters) {
      await page.goto(`/?chapter=${chapter.number}`);
      await expectChapter(page, chapter.number);
      await page.evaluate(() => document.fonts.ready.then(() => null));

      if (chapter.number === 1 || chapter === longestTitle) {
        const title = story(page).getByRole('heading', { name: chapter.title, exact: true });
        await expect(title).toHaveCSS('text-align', 'center');
        expect(await title.evaluate(el => parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(46);
        const titleBox = (await title.boundingBox())!;
        const columnBox = (await page.locator('.story-column:visible').boundingBox())!;
        expect(Math.abs(titleBox.x + titleBox.width / 2 - (columnBox.x + columnBox.width / 2))).toBeLessThanOrEqual(2);
      }

      await expect.poll(() => page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight), {
        message: `chapter ${chapter.number} (${chapter.title}) should fit without page scroll`,
      }).toBeLessThanOrEqual(0);
    }
  });
}

test('The final AI chapters have separate dots and the marker follows chapter 11', async ({ page, isMobile }) => {
  test.skip(isMobile, 'Measures the desktop timeline');
  await page.setViewportSize({ width: 1280, height: 800 });

  const timeline = page.locator('[data-timeline]');
  const dot = (number: number) => timeline.locator(`[data-chapter="${number}"]`);
  const marker = timeline.locator('[data-timeline-current]');
  const chapter10 = dot(10).locator('.dot');
  const chapter11 = dot(11).locator('.dot');
  const centerX = async (locator: Locator) => {
    const box = (await locator.boundingBox())!;
    return box.x + box.width / 2;
  };

  for (const number of [10, 11]) {
    await page.goto(`/?chapter=${number}`);
    const chapter = await expectChapter(page, number);
    await expect(dot(number)).toHaveClass(/\bis-current\b/);
    await expect(chapter10).toBeVisible();
    await expect(chapter11).toBeVisible();
    await expect.poll(async () => (await centerX(chapter11)) - (await centerX(chapter10))).toBeGreaterThan(4);
    if (number === 11) {
      await expect(marker).toContainText(`You are here · ${formatDay.format(new Date(chapter.date))}`);
      await expect.poll(async () => Math.abs((await centerX(marker)) - (await centerX(chapter11)))).toBeLessThanOrEqual(12);
      await expect(page.locator('[data-timeline-summary]')).toContainText(`→ ${formatDay.format(new Date(chapter.date))}`);
    }
  }
});

test('Chapter steps keep a steady zoom and the focus button toggles player zoom', async ({ page, isMobile }) => {
  await page.goto('/?chapter=1');
  await expectChapter(page, 1);

  const navigation = isMobile ? page.locator('.timeline-controls') : story(page);
  const next = navigation.getByRole('button', { name: /^Next chapter/ });
  const bubble = page.locator('svg[data-bubble]').filter({ visible: true });
  const scene = bubble.locator('g.scene');
  const scale = async () => {
    await page.waitForTimeout(1200);
    return scene.evaluate(g => new DOMMatrix(getComputedStyle(g).transform).a);
  };
  await expect(bubble.locator('.bubble').first()).toBeVisible();
  const firstScale = await scale();
  for (let number = 2; number <= 4; number++) {
    if (isMobile) await next.tap();
    else await next.click();
    await expectChapter(page, number);
    expect(Math.abs(await scale() - firstScale), `chapter ${number} scale`).toBeLessThanOrEqual(0.01);
  }
  const hasFadedBubble = await bubble.locator('.bubble').evaluateAll(groups => groups.some(group => {
    const opacity = Number(getComputedStyle(group).opacity);
    return opacity > 0 && opacity < 1;
  }));
  expect(hasFadedBubble, 'chapter 4 fades non-player bubbles without zooming').toBe(true);

  const focus = page.locator('[data-zoom="fit"]').filter({ visible: true });
  await expect(focus).toHaveAccessibleName('Focus on the players');
  if (isMobile) await focus.tap();
  else await focus.click();
  expect(await scale()).toBeGreaterThan(firstScale);

  await expect(focus).toHaveAccessibleName('Show the whole bubble');
  if (isMobile) await focus.tap();
  else await focus.click();
  expect(Math.abs(await scale() - firstScale)).toBeLessThanOrEqual(0.01);
});

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
  await page.locator('.timeline-controls [data-action="story-explore"]').click();
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

test('The compass and book take turns in the same timeline slot', async ({ page, isMobile }) => {
  if (!isMobile) await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const first = await expectChapter(page, 1);
  await page.evaluate(() => document.fonts.ready.then(() => null));

  const controls = page.locator('.timeline-controls');
  const compass = controls.locator('[data-action="story-explore"]');
  const book = controls.locator('[data-action="timeline-story"]');
  await expect(page.locator('[data-action="story-explore"]')).toHaveCount(1);
  await expectIconButton(compass, 'Explore day by day');
  await expect(book).toBeHidden();
  await compass.focus();
  await page.keyboard.press('Tab');
  await expect(compass).not.toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(compass).toBeFocused();

  // Reveal the full control row at the foot of the scrollable phone sheet.
  if (isMobile) await page.locator('.sheet').evaluate(sheet => { sheet.scrollTop = sheet.scrollHeight; });
  const storyBox = (await compass.boundingBox())!;
  await compass.click();
  await expectExplore(page, first.date);
  await expect(compass).toBeHidden();
  await expectIconButton(book, 'Back to the story');
  const exploreBox = (await book.boundingBox())!;
  expect(Math.abs(exploreBox.x - storyBox.x), 'timeline slot x').toBeLessThanOrEqual(2);
  expect(Math.abs(exploreBox.y - storyBox.y), 'timeline slot y').toBeLessThanOrEqual(2);

  await book.click();
  await expectChapter(page, 1);
  await expect(compass).toBeVisible();
  await expect(book).toBeHidden();
});

test('Back to the story returns to chapter 4 even after stepping Earlier in Explore', async ({ page, isMobile }) => {
  await page.goto('/?chapter=1');
  await expectChapter(page, 1);

  const controls = page.locator('.timeline-controls');
  const navigation = isMobile ? controls : story(page);
  const next = navigation.getByRole('button', { name: /^Next chapter/ });
  const explore = controls.locator('[data-action="story-explore"]');
  const back = controls.getByRole('button', { name: 'Back to the story', exact: true });
  const earlier = page.locator('[data-action="earlier"]').filter({ visible: true }).first();

  for (let number = 2; number <= 4; number++) {
    if (isMobile) await next.tap();
    else await next.click();
    await expectChapter(page, number);
  }

  if (isMobile) await explore.tap();
  else await explore.click();
  await expectExplore(page, chapters[3].date);
  if (isMobile) await back.tap();
  else await back.click();
  await expectChapter(page, 4);

  if (isMobile) await explore.tap();
  else await explore.click();
  await expectExplore(page, chapters[3].date);
  if (isMobile) await earlier.tap();
  else await earlier.click();
  await expect(page).toHaveURL(/[?&]news=/);
  if (isMobile) await back.tap();
  else await back.click();
  await expectChapter(page, 4);
});

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
  const explore = button('Explore day by day');
  await expectIconButton(explore, 'Explore day by day');
  await explore.click();
  await expectExplore(page, first.date);
});
