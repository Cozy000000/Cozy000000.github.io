import { test, expect } from '@playwright/test';
import { build } from 'esbuild';
import { mkdir, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

// Fixtures use the real component but never record visits or ship test artwork.
const fixturePath = '/__visitor-map-fixture__';
const providerRoute = 'https://s01.flagcounter.com/**';
const imageUrl = 'https://s01.flagcounter.com/map/TEST-FIXTURE/size_m/';
const statsUrl = 'https://info.flagcounter.com/TEST-FIXTURE/';
const mockMap = `<svg xmlns="http://www.w3.org/2000/svg" width="420" height="240" viewBox="0 0 420 240">
  <rect width="420" height="240" fill="#f0ece9"/>
  <rect x="20" y="20" width="380" height="200" rx="8" fill="#fff" stroke="#ded9d6"/>
  <path d="M76 83l42-20 33 21-13 34-25 14-17-27z M160 144l22 9-3 40-19-9-9-25z M221 78l49-13 62 23 5 31-45 4-17 29-22-35-30-9z M308 164l36-9 15 26-37 12z" fill="#ded9d6"/>
  <text x="210" y="48" text-anchor="middle" font-family="sans-serif" font-size="16" fill="#202127">Mock visitor map</text>
  <text x="210" y="214" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#6c6770">Browser test fixture — no real visitor data</text>
</svg>`;
let bundle = '';
let css = '';

test.beforeAll(async () => {
  const result = await build({
    stdin: {
      contents: `
        import React from 'react';
        import { createRoot } from 'react-dom/client';
        import { VisitorMap } from './src/components/VisitorMap';
        import { ThemeProvider } from './src/contexts/ThemeContext';
        import { useTheme } from './src/contexts/useTheme';
        import { ThemeToggle } from './src/components/Shared';
        function Harness() {
          const { theme } = useTheme();
          return <main data-fixture-theme={theme} style={{ padding: 24 }}>
            <ThemeToggle />
            <VisitorMap imageUrl=${JSON.stringify(imageUrl)} statsUrl=${JSON.stringify(statsUrl)} />
          </main>;
        }
        createRoot(document.getElementById('root')).render(
          <React.StrictMode><ThemeProvider><Harness /></ThemeProvider></React.StrictMode>
        );
      `,
      resolveDir: process.cwd(),
      loader: 'tsx',
    },
    bundle: true,
    write: false,
    format: 'iife',
    jsx: 'automatic',
    define: { 'process.env.NODE_ENV': '"development"' },
  });
  bundle = result.outputFiles[0].text;
  const assets = path.resolve('dist/assets');
  const stylesheets = (await readdir(assets)).filter(file => file.endsWith('.css'));
  css = (await Promise.all(stylesheets.map(file => readFile(path.join(assets, file), 'utf8')))).join('\n');
});

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  // Default deny for provider traffic; each test adds its local image response.
  await page.route(/https:\/\/[^/]*flagcounter\.com\//, route => route.abort());
  await page.route(`**${fixturePath}.js`, route => route.fulfill({ contentType: 'text/javascript', body: bundle }));
  await page.route(`**${fixturePath}.css`, route => route.fulfill({ contentType: 'text/css', body: css }));
  await page.route(/\/__visitor-map-fixture__$/, route => route.fulfill({
    contentType: 'text/html',
    body: `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="${fixturePath}.css"></head><body><div id="root"></div><script src="${fixturePath}.js"></script></body></html>`,
  }));
});

test('visitor image loads eagerly once under StrictMode and survives theme rerenders', async ({ page }) => {
  let requests = 0;
  await page.route(providerRoute, route => {
    requests++;
    return route.fulfill({ contentType: 'image/svg+xml', body: mockMap });
  });
  await page.goto(fixturePath);
  await expect(page.locator('.visitor-map')).toHaveAttribute('data-state', 'ready');
  const image = page.locator('.visitor-map img');
  await expect(image).toHaveCount(1);
  await expect(image).toHaveAttribute('loading', 'eager');
  await expect(image).toHaveAttribute('src', imageUrl);
  await expect(page.locator('.visitor-map a:has(img)')).toHaveAttribute('href', statsUrl);
  await expect(page.locator('.visitor-map script')).toHaveCount(0);
  expect(requests).toBe(1);
  await page.getByRole('button', { name: 'Switch to dark mode' }).click();
  await expect(page.locator('main')).toHaveAttribute('data-fixture-theme', 'dark');
  await page.getByRole('button', { name: 'Switch to light mode' }).click();
  await expect(page.locator('main')).toHaveAttribute('data-fixture-theme', 'light');
  await expect(page.locator('.visitor-map')).toHaveAttribute('data-state', 'ready');
  await expect(image).toHaveAttribute('src', imageUrl);
  expect(requests).toBe(1);
  await mkdir('output/site-review', { recursive: true });
  await page.locator('.visitor-map').screenshot({ path: 'output/site-review/visitor-map-fixture.png' });
});

test('an image network failure offers Retry and the second request recovers', async ({ page }) => {
  let attempts = 0;
  await page.route(providerRoute, route => {
    attempts++;
    return attempts === 1 ? route.abort('failed') : route.fulfill({ contentType: 'image/svg+xml', body: mockMap });
  });
  await page.goto(fixturePath);
  await expect(page.locator('.visitor-map')).toHaveAttribute('data-state', 'error');
  await expect(page.getByRole('status')).toHaveText('The visitor map is temporarily unavailable.');
  await page.getByRole('button', { name: 'Retry visitor map' }).click();
  await expect(page.locator('.visitor-map')).toHaveAttribute('data-state', 'ready');
  await expect(page.getByRole('button', { name: 'Retry visitor map' })).toHaveCount(0);
  await expect(page.locator('.visitor-map img')).toHaveCount(1);
  expect(attempts).toBe(2);
});

test('a pending image remains loading until it decodes and never times out after success', async ({ page }) => {
  let release!: () => void;
  const pending = new Promise<void>(resolve => { release = resolve; });
  let requested = false;
  await page.clock.install();
  await page.route(providerRoute, async route => {
    requested = true;
    await pending;
    await route.fulfill({ contentType: 'image/svg+xml', body: mockMap });
  });
  await page.goto(fixturePath, { waitUntil: 'domcontentloaded' });
  await expect.poll(() => requested).toBe(true);
  await expect(page.locator('.visitor-map')).toHaveAttribute('data-state', 'loading');
  await expect(page.getByRole('status')).toHaveText('Loading visitor map…');
  await expect(page.locator('.visitor-map-content')).toHaveAttribute('aria-busy', 'true');
  release();
  await expect(page.locator('.visitor-map')).toHaveAttribute('data-state', 'ready');
  await expect(page.getByRole('status')).toHaveText('Visitor map loaded.');
  await expect(page.locator('.visitor-map-content')).toHaveAttribute('aria-busy', 'false');
  await page.clock.fastForward(13_000);
  await expect(page.locator('.visitor-map')).toHaveAttribute('data-state', 'ready');
  await expect(page.getByRole('button', { name: 'Retry visitor map' })).toHaveCount(0);
});

test('a stalled image times out after 12 seconds and late completion restores the map', async ({ page }) => {
  let release!: () => void;
  const pending = new Promise<void>(resolve => { release = resolve; });
  let requests = 0;
  await page.clock.install();
  await page.route(providerRoute, async route => {
    requests++;
    await pending;
    await route.fulfill({ contentType: 'image/svg+xml', body: mockMap });
  });
  await page.goto(fixturePath, { waitUntil: 'domcontentloaded' });
  await expect.poll(() => requests).toBe(1);
  await expect(page.locator('.visitor-map')).toHaveAttribute('data-state', 'loading');
  await page.clock.fastForward(12_001);
  await expect(page.locator('.visitor-map')).toHaveAttribute('data-state', 'timeout');
  await expect(page.getByRole('status')).toHaveText('The visitor map is taking longer than expected to load.');
  await expect(page.getByRole('button', { name: 'Retry visitor map' })).toBeVisible();
  release();
  await expect(page.locator('.visitor-map')).toHaveAttribute('data-state', 'ready');
  await expect(page.getByRole('button', { name: 'Retry visitor map' })).toHaveCount(0);
  expect(requests).toBe(1);
});

test('Retry after a timeout starts a fresh image request and leaves only one map', async ({ page }) => {
  let attempts = 0;
  let release!: () => void;
  const pending = new Promise<void>(resolve => { release = resolve; });
  await page.clock.install();
  await page.route(providerRoute, async route => {
    attempts++;
    if (attempts === 1) await pending;
    await route.fulfill({ contentType: 'image/svg+xml', body: mockMap });
  });
  await page.goto(fixturePath, { waitUntil: 'domcontentloaded' });
  await expect.poll(() => attempts).toBe(1);
  await page.clock.fastForward(12_001);
  await expect(page.locator('.visitor-map')).toHaveAttribute('data-state', 'timeout');
  try {
    await page.getByRole('button', { name: 'Retry visitor map' }).click();
    await expect.poll(() => attempts).toBe(2);
    await expect(page.locator('.visitor-map')).toHaveAttribute('data-state', 'ready');
    await expect(page.locator('.visitor-map img')).toHaveCount(1);
  } finally {
    release();
  }
});

test('a 1-pixel provider response is treated as a failed map instead of a successful load', async ({ page }) => {
  await page.route(providerRoute, route => route.fulfill({
    contentType: 'image/svg+xml',
    body: '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"><rect width="1" height="1"/></svg>',
  }));
  await page.goto(fixturePath);
  await expect(page.locator('.visitor-map')).toHaveAttribute('data-state', 'error');
  await expect(page.getByRole('status')).toHaveText('The visitor map is temporarily unavailable.');
  await expect(page.getByRole('button', { name: 'Retry visitor map' })).toBeVisible();
});

test('the loaded map fits a 375-pixel mobile viewport without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.route(providerRoute, route => route.fulfill({ contentType: 'image/svg+xml', body: mockMap }));
  await page.goto(fixturePath);
  await expect(page.locator('.visitor-map')).toHaveAttribute('data-state', 'ready');
  const image = page.locator('.visitor-map img');
  await expect(image).toBeVisible();
  expect(await image.evaluate(img => img.getBoundingClientRect().width)).toBeLessThanOrEqual(327);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
  await mkdir('output/site-review', { recursive: true });
  await page.locator('.visitor-map').screenshot({ path: 'output/site-review/visitor-map-fixture-mobile.png' });
});
