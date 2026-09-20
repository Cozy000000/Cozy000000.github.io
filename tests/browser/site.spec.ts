import { test, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

test.beforeEach(async ({ page }) => {
  await page.route('https://viewer.diagrams.net/**', route => route.fulfill({ contentType: 'text/html', body: '<p>Diagram embed loaded.</p>' }));
  // Never record automated site checks as real visitors.
  await page.route('https://*.flagcounter.com/**', route => route.fulfill({ contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="291"><rect width="600" height="291" fill="#f0ece9"/><text x="20" y="145" fill="#202127">Visitor map — automated test fixture</text></svg>' }));
});

for (const width of [375, 768, 1440]) {
  for (const theme of ['light', 'dark'] as const) {
    test(`homepage at ${width}px in ${theme} theme`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.setViewportSize({ width, height: 1000 });
      await page.emulateMedia({ colorScheme: theme });
      await page.goto('/');
      await expect(page).toHaveTitle('Zhiyi Chen');
      await expect(page.locator('h1')).toContainText('Zhiyi Chen');
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      await expect(page.locator('.featured-paper')).toHaveCount(2);
      await expect(page.locator('.publication')).toHaveCount(2);
      await expect(page.locator('.award')).toHaveCount(9);
      for (const section of await page.locator('section').all()) await section.scrollIntoViewIfNeeded();
      for (const img of await page.locator('img').all()) {
        await img.scrollIntoViewIfNeeded();
        await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
      }
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.evaluate(() => document.fonts.ready);
      await mkdir('output/site-review', { recursive: true });
      await page.screenshot({ path: `output/site-review/home-${width}-${theme}.png`, fullPage: true });
      await page.screenshot({ path: `output/site-review/home-${width}-${theme}-first-screen.png` });
      if (width === 1440) await page.locator('#featured').screenshot({ path: `output/site-review/home-papers-${theme}.png` });
      expect(errors).toEqual([]);
    });
  }
}

test('footer automatically displays the configured visitor map and its statistics link', async ({ page }) => {
  let requests = 0;
  page.on('request', request => { if (new URL(request.url()).hostname.endsWith('.flagcounter.com')) requests++; });
  await page.goto('/');
  const map = page.locator('.site-footer .visitor-map');
  await expect(map).toHaveAttribute('data-state', 'ready');
  await map.scrollIntoViewIfNeeded();
  await expect(map.getByRole('heading', { name: 'Visitors around the world' })).toBeVisible();
  await expect(map.locator('img')).toHaveAttribute('src', /s01\.flagcounter\.com\/map\/YywQ\//);
  await expect(map.locator('a').filter({ has: page.locator('img') })).toHaveAttribute('href', 'https://info.flagcounter.com/YywQ');
  expect(requests).toBe(1);
});

test('theme preference persists and citation copies the actual BibTeX', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  await page.getByRole('button', { name: 'Switch to dark mode' }).click();
  await page.reload();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await expect(page.getByRole('button', { name: 'Switch to light mode' })).toBeVisible();
  const paper = page.locator('#ecotune');
  await paper.locator('summary').click();
  await paper.getByRole('button', { name: 'Copy citation' }).click();
  await expect(paper.getByRole('status')).toHaveText('Citation copied.');
  const citation = await paper.locator('pre code').textContent();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(citation);
});

test('citation remains selectable if clipboard permission is unavailable', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'clipboard', { value: undefined }));
  await page.goto('/');
  const paper = page.locator('#kale');
  await paper.locator('summary').click();
  await paper.getByRole('button', { name: 'Copy citation' }).click();
  await expect(paper.getByRole('status')).toContainText('copy the citation manually');
  expect(await page.evaluate(() => window.getSelection()?.toString())).toContain('@inproceedings{xu2025kale');
});

test('mobile chapter menu supports keyboard selection and closes after navigation', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await expect(page.locator('.desktop-toc')).toBeHidden();
  const disclosure = page.locator('.mobile-toc');
  await disclosure.locator('summary').focus();
  await page.keyboard.press('Enter');
  await expect(disclosure).toHaveAttribute('open', '');
  await disclosure.getByRole('link', { name: 'Featured', exact: true }).click();
  await expect(page).toHaveURL(/#featured$/);
  await expect(disclosure).not.toHaveAttribute('open', '');
  await expect(disclosure.locator('a[href="#featured"]')).toHaveAttribute('aria-current', 'location');
});

test('desktop navigation tracks scroll and keeps legacy anchors', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/#-publications');
  await expect(page.locator('#publications')).toBeInViewport();
  await expect(page.locator('.desktop-toc a[href="#publications"]')).toHaveAttribute('aria-current', 'location');
  await page.locator('.desktop-toc').getByRole('link', { name: 'Awards', exact: true }).click();
  await expect(page.locator('.desktop-toc a[href="#awards"]')).toHaveAttribute('aria-current', 'location');
  expect(await page.locator('.reading-progress').evaluate(el => getComputedStyle(el).transform)).not.toBe('matrix(0, 0, 0, 1, 0, 0)');
});

test('page addresses, directory index URLs, redirects and ordinary 404 work on static hosting', async ({ page }) => {
  for (const [url, heading] of [['/blog/', 'Blog'], ['/drawing/', 'Diagram'], ['/blog/index.html', 'Blog'], ['/drawing/index.html', 'Diagram']] as const) {
    const response = await page.goto(url);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(heading);
    await page.reload();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(heading);
  }
  await expect(page.locator('iframe')).toHaveAttribute('src', /viewer\.diagrams\.net/);
  await page.goto('/blog/');
  await expect(page.getByText('No posts published yet.')).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://cozy000000.github.io/blog/');
  for (const url of ['/about/#-news', '/about.html#about-me']) {
    await page.goto(url);
    await expect(page).toHaveURL(url.endsWith('-news') ? 'http://127.0.0.1:43173/#-news' : 'http://127.0.0.1:43173/#about-me');
    await expect(page.locator('h1')).toContainText('Zhiyi Chen');
  }
  const missing = await page.goto('/nonexistent-page/');
  expect(missing?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Page not found');
});
