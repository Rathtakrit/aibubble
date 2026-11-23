import { expect, test, type Locator, type Page } from '@playwright/test';
import aiNews from '../data/news.json' with { type: 'json' };
import dotcomNews from '../data/past/dotcom/news.json' with { type: 'json' };
import dotcomMeta from '../data/past/dotcom/meta.json' with { type: 'json' };

type Item = { id: string; date: string; title: string; kind: string; label?: string };
type Box = NonNullable<Awaited<ReturnType<Locator['boundingBox']>>>;

const timeline = (page: Page) => page.getByRole('region', { name: 'Timeline', exact: true });
const sheet = (page: Page) => page.getByRole('region', { name: 'News item', exact: true });
const daySlider = (page: Page) => page.getByRole('slider', { name: 'Day', exact: true });
const zoom = (page: Page) => timeline(page).getByRole('button', {
  name: /^(?:Whole timeline|Zoom(?: (?:the )?timeline)? (?:in|out)|Zoom (?:in|out)(?: (?:the )?timeline)?|Zoom timeline)$/i,
});
const dateFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
});
const shortFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric', month: 'short', timeZone: 'UTC',
});
const dateText = (date: string) => dateFormat.format(new Date(date));
const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const center = (box: Box) => box.x + box.width / 2;

async function dotX(button: Locator) {
  return button.evaluate(el => {
    // A crowded dot's tap box can be asymmetric around its painted mark.
    const mark = Array.from(el.querySelectorAll('*')).find(child => {
      const r = child.getBoundingClientRect();
      const style = getComputedStyle(child);
      return r.width > 0 && r.width <= 24 && Math.abs(r.width - r.height) < 1 &&
        (style.position === 'absolute' || parseFloat(style.borderRadius) > 0) && child.checkVisibility();
    });
    const r = (mark ?? el).getBoundingClientRect();
    return r.x + r.width / 2;
  });
}

function ordered(items: Item[], start: string) {
  return items.filter(item => item.kind === 'money' && item.date >= start)
    .sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
}

const ai = ordered(aiNews.items, '2022-11-30'); // Start of the AI money timeline.
const dotcom = ordered(dotcomNews.items, dotcomMeta.first_day);
const middle = ai[Math.floor(ai.length / 2)];

function dot(region: Locator, item: Item) {
  return region.getByRole('button', {
    name: new RegExp(`(?=.*${escape(dateText(item.date))})(?=.*${escape(item.title)})`),
  });
}

// On phone the painted dates are not controls. Locate the mark by its data-backed identity,
// then exercise the Day rail at the mark's screen position.
function paintedDate(region: Locator, item: Item) {
  return region.locator(`[data-news=${JSON.stringify(item.id)}]`);
}

async function step(page: Page, direction: 'Earlier' | 'Later', phone: boolean) {
  const arrowName = direction === 'Earlier' ? '\u2190 Earlier' : 'Later \u2192';
  const shortName = page.getByRole('button', { name: direction, exact: true });
  // The expanded phone sheet on some versions uses the long captions instead of the dock buttons.
  return phone && await shortName.isVisible() ? shortName : page.getByRole('button', { name: arrowName, exact: true });
}

async function open(page: Page, path = '/', item?: Item) {
  const response = await page.goto(item ? `${path}?news=${encodeURIComponent(item.id)}` : path);
  expect(response?.ok(), `${path} should load`).toBe(true);
}

async function shown(page: Page, item: Item) {
  const card = page.getByRole('main').or(sheet(page));
  const text = card.getByText(item.title, { exact: true }).filter({ visible: true });
  await expect(text.first(), `Selected news title: ${item.title}`).toBeVisible();
  const date = card.getByText(dateText(item.date), { exact: false }).filter({ visible: true });
  const sliderDate = daySlider(page).and(page.locator(`[aria-valuetext="${dateText(item.date)}"]`));
  await expect(date.or(sliderDate).first(), `Selected date: ${dateText(item.date)}`).toBeVisible();
}

async function box(locator: Locator, message: string): Promise<Box> {
  await expect(locator, message).toBeVisible();
  const rect = await locator.boundingBox();
  expect(rect, message).not.toBeNull();
  return rect!;
}

function inside(inner: Box, outer: Box) {
  return inner.x >= outer.x && inner.y >= outer.y &&
    inner.x + inner.width <= outer.x + outer.width && inner.y + inner.height <= outer.y + outer.height;
}

async function zoomState(page: Page) {
  await expect(timeline(page), 'A visible region named Timeline is required').toBeVisible();
  await expect(zoom(page), 'Timeline should have an accessible zoom control').toBeVisible();
  const pressed = await zoom(page).getAttribute('aria-pressed');
  if (pressed !== null) return pressed === 'true';
  const label = await zoom(page).evaluate(el => el.getAttribute('aria-label') ?? el.textContent ?? '');
  expect(label, 'Zoom control should expose its state by name or aria-pressed').toMatch(/whole|\bin\b|\bout\b/i);
  return /whole|\bout\b/i.test(label);
}

async function setZoom(page: Page, inward: boolean) {
  if (await zoomState(page) !== inward) await zoom(page).click();
  await expect.poll(() => zoomState(page), { message: `Zoom should be ${inward ? 'in' : 'out'}` }).toBe(inward);
}

async function selectedDate(slider: Locator) {
  const label = await slider.getAttribute('aria-valuetext');
  const date = Date.parse(label ?? '');
  expect(Number.isFinite(date), `Day slider should expose a calendar date (got ${label})`).toBe(true);
  return date;
}

async function frame(page: Page) {
  await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
}

async function bubbleDrawing(page: Page) {
  return page.locator('svg:has(circle)').filter({ visible: true }).evaluateAll(graphs => graphs.flatMap(graph =>
    Array.from(graph.querySelectorAll('circle'), circle => [circle.getAttribute('r'), circle.textContent].join(':')),
  ).sort().join('|'));
}

function dateLabelTexts(item: Item) {
  return [dateText(item.date), shortFormat.format(new Date(item.date)), item.date, item.label ?? item.title];
}

async function labelBoxes(region: Locator, items: Item[], other: RegExp = /(?!) /) {
  const texts = Array.from(new Set(items.flatMap(dateLabelTexts)));
  const pattern = new RegExp(`^(?:${texts.map(escape).join('|')})$|${other.source}`);
  return region.getByText(pattern).filter({ visible: true }).evaluateAll(elements => elements.flatMap(element => {
    const style = getComputedStyle(element);
    if (style.opacity === '0' || style.visibility !== 'visible') return [];
    const range = document.createRange();
    range.selectNodeContents(element);
    const rect = range.getBoundingClientRect();
    if (!rect.width || !rect.height || !element.checkVisibility({ opacityProperty: true, visibilityProperty: true })) return [];
    return [{ text: element.textContent!.trim(), x: rect.x, y: rect.y, width: rect.width, height: rect.height }];
  }));
}

async function pointerClick(page: Page, x: number, y: number, phone: boolean) {
  if (phone) await page.touchscreen.tap(x, y);
  else await page.mouse.click(x, y);
}

// Use the drawn date marker when provided; otherwise infer the thumb from the range value.
function readHandleX(node: Element, timing?: { button: Element; delay: number }) {
  const measure = () => {
    const input = node as HTMLInputElement;
    const rect = input.getBoundingClientRect();
    const siblings = [...(input.parentElement?.children ?? [])];
    const marker = siblings.find(el =>
      /^You are here\b/i.test(el.textContent?.trim() ?? '') && el.checkVisibility());
    if (marker) {
      const mark = marker.getBoundingClientRect();
      return mark.x + mark.width / 2;
    }
    // A range can extend past the rail to give its thumb room at either end.
    const rail = input.parentElement?.getBoundingClientRect() ?? rect;
    const left = Math.max(rect.left, rail.left);
    const right = Math.min(rect.right, rail.right);
    return left + (right - left) * ((input.valueAsNumber - Number(input.min || 0)) /
      (Number(input.max || 100) - Number(input.min || 0)));
  };
  if (timing) {
    const sample = new Promise<number>(resolve => timing.button.addEventListener('click', () => {
      setTimeout(() => resolve(measure()), timing.delay);
    }, { once: true }));
    Object.assign(window, { timelineMotionSample: sample });
  }
  return measure();
}

const handleX = (slider: Locator) => slider.evaluate<number, undefined>(readHandleX, undefined);

function recordErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(`${page.url()}: ${error.message}`));
  page.on('console', message => {
    if (message.type() === 'error') errors.push(`${message.location().url || page.url()}: ${message.text()}`);
  });
  return errors;
}

for (const { path, items } of [{ path: '/', items: ai }, { path: '/past/dotcom', items: dotcom }]) {
  test(`Drag: ${path}`, async ({ page, context, isMobile }) => {
    await open(page, path, items[0]);
    const slider = daySlider(page);
    // Phone versions can have a Day slider in the sheet but no phone zoom control.
    if (await zoom(page).isVisible()) await setZoom(page, false);
    await expect(slider, 'The Day slider should be available for scrubbing').toBeVisible();
    await slider.scrollIntoViewIfNeeded();
    await slider.press('Home');
    await frame(page);
    const rail = await box(slider, 'Day slider');
    const x0 = Math.max(rail.x + 1, await handleX(slider));
    const y = rail.y + rail.height / 2;
    const touch = isMobile ? await context.newCDPSession(page) : null;
    const titles = new Set<string>();
    const drawings = new Set<string>();
    const dates: number[] = [];
    const titlePattern = new RegExp(`^(?:${items.map(item => escape(item.title)).join('|')})$`);
    const news = page.getByRole('main').or(sheet(page)).getByText(titlePattern).filter({ visible: true });
    const sample = async () => {
      await frame(page);
      dates.push(await selectedDate(slider));
      (await news.allTextContents()).forEach(title => titles.add(title.trim()));
      const drawing = await bubbleDrawing(page);
      if (drawing) drawings.add(drawing);
    };
    await sample();
    if (touch) await touch.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x0, y }] });
    else {
      await page.mouse.move(x0, y);
      await page.mouse.down();
    }
    try {
      for (let i = 1; i <= 20; i++) {
        const x = x0 + (rail.x + rail.width - 1 - x0) * i / 20;
        if (touch) await touch.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y }] });
        else await page.mouse.move(x, y);
        await sample();
      }
    } finally {
      if (touch) await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      else await page.mouse.up();
    }
    for (let i = 1; i < dates.length; i++) {
      expect.soft(dates[i], `Day at drag step ${i}: ${new Date(dates[i - 1]).toISOString()} -> ${new Date(dates[i]).toISOString()}`).toBeGreaterThanOrEqual(dates[i - 1]);
    }
    expect.soft(dates.at(-1), 'Drag should advance the date').toBeGreaterThan(dates[0]);
    expect.soft(titles.size, 'Different news titles should appear during the drag').toBeGreaterThan(1);
    expect(drawings.size, 'Bubble sizes or composition should change during the drag').toBeGreaterThan(1);
  });
}

test('Before first / after last', async ({ page, isMobile }) => {
  await open(page, '/', middle);
  await setZoom(page, false);
  const region = timeline(page);
  const rail = await box(region.getByRole('slider', { name: 'Day', exact: true }), 'Timeline line (Day slider)');
  const first = await box(isMobile ? paintedDate(region, ai[0]) : dot(region, ai[0]), 'First dot in whole timeline');
  const last = await box(isMobile ? paintedDate(region, ai.at(-1)!) : dot(region, ai.at(-1)!), 'Last dot in whole timeline');
  const left = rail.x + 1;
  const right = rail.x + rail.width - 1;
  expect.soft(left, 'The line should extend to the left of the first dot').toBeLessThan(center(first));
  expect.soft(right, 'The line should extend to the right of the last dot').toBeGreaterThan(center(last));
  await pointerClick(page, left, rail.y + rail.height / 2, isMobile);
  await shown(page, ai[0]);
  // The selected title can change the height of the content above the rail.
  const afterFirst = await box(region.getByRole('slider', { name: 'Day', exact: true }), 'Timeline line after selecting the first item');
  await pointerClick(page, afterFirst.x + afterFirst.width - 1, afterFirst.y + afterFirst.height / 2, isMobile);
  await shown(page, ai.at(-1)!);
});

test('Click a dot', async ({ page, isMobile }) => {
  for (const item of [ai[0], middle, ai.at(-1)!]) {
    await test.step(item.title, async () => {
      // Start by the target in the zoom window, but not with it already selected.
      const index = ai.indexOf(item);
      await open(page, '/', ai[index === 0 ? 1 : index - 1]);
      const hasTimeline = await timeline(page).isVisible();
      if (hasTimeline) await setZoom(page, true);
      else await expect(daySlider(page), 'The phone sheet should expose the Day slider').toBeVisible();
      if (isMobile) {
        const slider = daySlider(page);
        await slider.scrollIntoViewIfNeeded();
        const mark = paintedDate(timeline(page), item);
        await expect(mark).toBeVisible();
        const rail = await box(slider, 'Day slider');
        await page.touchscreen.tap(await dotX(mark), rail.y + rail.height / 2);
        await shown(page, item);
        await expect.poll(async () => Math.abs(await handleX(slider) - await dotX(mark))).toBeLessThanOrEqual(6);
        return;
      }
      const control = dot(hasTimeline ? timeline(page) : sheet(page), item);
      await expect(control, `Dot for ${item.title}`).toBeVisible();
      await control.click();
      await shown(page, item);
      await expect.configure({ soft: true }).poll(async () => Math.abs(await handleX(daySlider(page)) - await dotX(control)), {
        message: `Distance from the slider handle to ${item.title}'s dot`,
      }).toBeLessThanOrEqual(6);
    });
  }
});

test('Zoom', async ({ page, isMobile }) => {
  await open(page, '/', middle);
  const region = timeline(page);
  await setZoom(page, true);
  const dateMark = isMobile ? paintedDate : dot;
  const visibleIn = await box(region, 'Zoomed-in timeline');
  expect(inside(await box(dateMark(region, middle), 'Selected dot when zoomed in'), visibleIn)).toBe(true);
  const index = ai.indexOf(middle);
  const neighbours = [ai[index - 1], ai[index + 1]];
  await expect.poll(async () => (await labelBoxes(region, neighbours)).some(label => inside(label, visibleIn)), {
    message: 'At least one adjacent item should have a readable label within the zoomed-in timeline',
  }).toBe(true);
  await setZoom(page, false);
  const visibleOut = await box(region, 'Zoomed-out timeline');
  for (const item of [ai[0], ai.at(-1)!]) {
    expect(inside(await box(dateMark(region, item), `Whole-timeline dot for ${item.title}`), visibleOut), item.title).toBe(true);
  }
});

test('Earlier / Later', async ({ page, isMobile }) => {
  await open(page, '/', middle);
  await shown(page, middle);
  for (const inward of [true, false]) {
    await test.step(inward ? 'Zoomed in' : 'Zoomed out', async () => {
      const hasZoom = await zoom(page).isVisible();
      if (hasZoom) await setZoom(page, inward);
      else if (!inward) await setZoom(page, inward);
      await (await step(page, 'Earlier', isMobile)).click();
      await shown(page, ai[ai.indexOf(middle) - 1]);
      if (hasZoom) expect(await zoomState(page), 'Earlier preserves zoom').toBe(inward);
      await (await step(page, 'Later', isMobile)).click();
      await shown(page, middle);
      if (hasZoom) expect(await zoomState(page), 'Later preserves zoom').toBe(inward);
    });
  }
});

test('Labels', async ({ page }) => {
  await open(page, '/', middle);
  const region = timeline(page);
  await page.evaluate(() => document.fonts.ready.then(() => null));
  for (const inward of [true, false]) {
    await setZoom(page, inward);
    let labels: Awaited<ReturnType<typeof labelBoxes>> = [];
    await expect.poll(async () => {
      const visible = await box(region, 'Visible Timeline box');
      labels = (await labelBoxes(region, ai, /^(?:\d{4}|\d{1,2} [A-Za-z]{3,4}(?: \d{4})?|[A-Za-z]{3,4} \d{4})$/))
        .filter(label => inside(label, visible));
      return labels.length;
    }, { message: 'At least two date labels to compare' }).toBeGreaterThanOrEqual(2);
    for (const [index, a] of labels.entries()) {
      for (const b of labels.slice(index + 1)) {
        const overlaps = a.x < b.x + b.width && b.x < a.x + a.width &&
          a.y < b.y + b.height && b.y < a.y + a.height;
        expect.soft(overlaps, `${inward ? 'Zoomed in' : 'Zoomed out'}: "${a.text}" overlaps "${b.text}"`).toBe(false);
      }
    }
  }
});

async function laterMotion(page: Page, phone: boolean, ms: number) {
  // At the end the zoom window cannot advance, so Later must change the handle's position.
  const last = ai.at(-1)!;
  await open(page, '/', ai.at(-2)!);
  await shown(page, ai.at(-2)!);
  const slider = daySlider(page);
  const later = await step(page, 'Later', phone);
  await expect(slider, 'Visible Day slider for motion sampling').toBeVisible();
  await later.scrollIntoViewIfNeeded();
  // Sample in the browser at the requested time, not after the click command returns.
  const button = await later.elementHandle();
  const start = await slider.evaluate<number, { button: typeof button; delay: number }>(readHandleX, { button, delay: ms });
  if (phone) await later.tap();
  else await later.click();
  const during = await page.evaluate(() => (window as typeof window & { timelineMotionSample?: Promise<number> }).timelineMotionSample!);
  await shown(page, last);
  await slider.evaluate(async input => {
    await Promise.allSettled((input.parentElement ?? input).getAnimations({ subtree: true }).map(a => a.finished));
  });
  const end = await handleX(slider);
  expect(Math.abs(end - start), 'Later should move the handle from its starting position').toBeGreaterThan(1);
  return { start, during, end };
}

test('Phone only: bottom sheet, tap boxes and smooth handle', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Phone layout only');
  await open(page, '/', ai[0]);
  const region = sheet(page).getByRole('region', { name: 'Timeline', exact: true });
  await expect.soft(region, 'The bottom sheet should contain a named Timeline region').toBeVisible();
  await expect(region.getByText('Whole story', { exact: true })).toBeHidden();
  const buttons = region.getByRole('button');
  await expect(buttons).toHaveCount(2);
  for (const button of [...await buttons.all(), await step(page, 'Earlier', true), await step(page, 'Later', true)]) {
    const rect = await box(button, 'Phone timeline tap target');
    const label = await button.getAttribute('aria-label') ?? await button.innerText();
    expect.soft(Math.min(rect.width, rect.height), `${label}: ${rect.width.toFixed(1)} x ${rect.height.toFixed(1)} px`).toBeGreaterThanOrEqual(44);
  }
  expect((await box(daySlider(page), 'Day slider tap area')).height).toBeGreaterThanOrEqual(44);
  const { start, during, end } = await laterMotion(page, true, 100);
  expect(during, `Handle at 100 ms (start ${start.toFixed(1)}, end ${end.toFixed(1)})`).toBeGreaterThan(Math.min(start, end) + 1);
  expect(during, 'Handle should still be moving at 100 ms').toBeLessThan(Math.max(start, end) - 1);
});

test('Reduced motion', async ({ page, isMobile }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const { during, end } = await laterMotion(page, isMobile, 50);
  expect(Math.abs(during - end), 'Handle should be at its final position after 50 ms').toBeLessThanOrEqual(1);
});

test('No console errors', async ({ page }) => {
  const errors = recordErrors(page);
  for (const path of ['/', '/past/dotcom', '/past/housing']) {
    await test.step(path, async () => {
      await open(page, path);
      await expect(daySlider(page), `Explore Day slider on ${path}`).toBeVisible();
      await page.waitForLoadState('networkidle');
    });
  }
  expect(errors).toEqual([]);
});

test('Compare guard', async ({ page }) => {
  const errors = recordErrors(page);
  await open(page, '/compare');
  await expect(page.getByRole('main')).toBeVisible();
  const play = page.getByRole('button', { name: /^(?:Play|Play comparison)$/i });
  const next = page.getByRole('button', { name: /^(?:Next(?: step| day| frame)?|Step(?: forward)?|Later)(?: \u2192)?$/i });
  if (await play.isVisible() || await next.isVisible()) {
    const main = page.getByRole('main');
    for (const control of [next, play]) {
      await expect(control, 'Compare playback control').toBeVisible();
      // Exclude the control captions themselves (e.g. Play becoming Pause).
      const display = () => main.evaluate(el => Array.from(el.querySelectorAll('p, output, svg text'))
        .filter(node => node.checkVisibility()).map(node => node.textContent).join('|'));
      const before = await display();
      await control.click();
      await expect.poll(display).not.toBe(before);
    }
  } else {
    // Today's Compare chooses snapshots rather than playing a timeline.
    const side = page.getByRole('region', { name: 'Side A', exact: true });
    const caption = side.getByText(/^(?:on )?\d{1,2} [A-Za-z]{3,4} \d{4} .* \d+ (?:companies|cos)$/);
    const before = await caption.innerText();
    await page.getByRole('button', { name: 'AI then vs AI now', exact: true }).click();
    await expect(caption).not.toHaveText(before);
    const snapshot = await caption.innerText();
    await page.getByRole('button', { name: /^Swap(?: A and B)?$/ }).click();
    await expect(caption).not.toHaveText(snapshot);
  }
  await page.waitForLoadState('networkidle');
  expect(errors).toEqual([]);
});
