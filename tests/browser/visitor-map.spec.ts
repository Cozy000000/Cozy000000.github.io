import { test, expect } from '@playwright/test';
import { build } from 'esbuild';
import { mkdir, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { mapScriptRoute, mapWidgetMock } from './mapmyvisitors-fixture';

const fixturePath = '/__visitor-map-fixture__';
const scriptUrl = 'https://mapmyvisitors.com/map.js?d=TEST-FIXTURE&cl=ffffff&w=a';
const statsUrl = 'https://mapmyvisitors.com/web/TESTFIXTURE';
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
            <VisitorMap scriptUrl=${JSON.stringify(scriptUrl)} statsUrl=${JSON.stringify(statsUrl)} />
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
  css = (await Promise.all((await readdir(assets)).filter(file => file.endsWith('.css')).map(file => readFile(path.join(assets, file), 'utf8')))).join('\n');
});

test.beforeEach(async ({ page, context }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await context.route('**://mapmyvisitors.com/**', route => route.abort());
  await context.route('**://*.flagcounter.com/**', route => route.abort());
  await context.route('**://code.jquery.com/**', route => route.abort());
  await page.route(`**${fixturePath}.js`, route => route.fulfill({ contentType: 'text/javascript', body: bundle }));
  await page.route(`**${fixturePath}.css`, route => route.fulfill({ contentType: 'text/css', body: css }));
  await page.route(/\/__visitor-map-fixture__$/, route => route.fulfill({
    contentType: 'text/html',
    body: `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="${fixturePath}.css"></head><body><div id="root"></div><script src="${fixturePath}.js"></script></body></html>`,
  }));
});

test('the official script mounts once under StrictMode and survives theme changes', async ({ page, context }) => {
  let requests = 0;
  await context.route(mapScriptRoute, route => { requests++; return route.fulfill({ contentType: 'text/javascript', body: mapWidgetMock() }); });
  await page.goto(fixturePath);
  await expect(page.locator('.visitor-map')).toHaveAttribute('data-state', 'ready');
  const frame = page.locator('.visitor-map iframe');
  await expect(frame).toHaveCount(1);
  await expect(frame).toHaveAttribute('loading', 'eager');
  await expect(frame).toHaveAttribute('sandbox', 'allow-scripts allow-popups allow-popups-to-escape-sandbox');
  const widget = page.frameLocator('.visitor-map iframe');
  await expect(widget.locator('#mapmyvisitors')).toHaveAttribute('src', scriptUrl);
  await expect(widget.locator('#mapmyvisitors-widget')).toHaveAttribute('href', statsUrl);
  await expect(widget.locator('#mapmyvisitors-widget')).toHaveAttribute('target', '_blank');
  await expect(page.locator('img')).toHaveCount(0);
  await page.getByRole('button', { name: 'Switch to dark mode' }).click();
  await expect(page.locator('main')).toHaveAttribute('data-fixture-theme', 'dark');
  await page.getByRole('button', { name: 'Switch to light mode' }).click();
  await expect(page.locator('.visitor-map')).toHaveAttribute('data-state', 'ready');
  expect(requests).toBe(1);
});

test('a script network failure offers Retry and the second request recovers', async ({ page, context }) => {
  let requests = 0;
  await context.route(mapScriptRoute, route => ++requests === 1 ? route.abort('failed') : route.fulfill({ contentType: 'text/javascript', body: mapWidgetMock() }));
  await page.goto(fixturePath);
  await expect(page.locator('.visitor-map')).toHaveAttribute('data-state', 'error');
  await expect(page.getByRole('status')).toHaveText('The visitor map is temporarily unavailable.');
  await page.getByRole('button', { name: 'Retry visitor map' }).click();
  await expect(page.locator('.visitor-map')).toHaveAttribute('data-state', 'ready');
  await expect(page.locator('.visitor-map iframe')).toHaveCount(1);
  await expect(page.getByRole('button', { name: 'Retry visitor map' })).toHaveCount(0);
  expect(requests).toBe(2);
});

test('script onload is not success until map data has rendered', async ({ page, context }) => {
  await page.clock.install();
  await context.route(mapScriptRoute, route => route.fulfill({ contentType: 'text/javascript', body: mapWidgetMock(5_000) }));
  await page.goto(fixturePath);
  await expect(page.frameLocator('.visitor-map iframe').locator('.mapmyvisitors-loading')).toBeVisible();
  await expect(page.locator('.visitor-map')).toHaveAttribute('data-state', 'loading');
  await expect(page.locator('.visitor-map-content')).toHaveAttribute('aria-busy', 'true');
  await page.clock.fastForward(5_001);
  await expect(page.locator('.visitor-map')).toHaveAttribute('data-state', 'ready');
  await expect(page.locator('.visitor-map-content')).toHaveAttribute('aria-busy', 'false');
  await page.clock.fastForward(13_000);
  await expect(page.locator('.visitor-map')).toHaveAttribute('data-state', 'ready');
});

test('a stalled data request times out and late rendering restores the map', async ({ page, context }) => {
  await page.clock.install();
  await context.route(mapScriptRoute, route => route.fulfill({ contentType: 'text/javascript', body: mapWidgetMock(15_000) }));
  await page.goto(fixturePath);
  await expect(page.frameLocator('.visitor-map iframe').locator('.mapmyvisitors-loading')).toBeVisible();
  await page.clock.fastForward(12_001);
  await expect(page.locator('.visitor-map')).toHaveAttribute('data-state', 'timeout');
  await expect(page.getByRole('button', { name: 'Retry visitor map' })).toBeVisible();
  await page.clock.fastForward(3_001);
  await expect(page.locator('.visitor-map')).toHaveAttribute('data-state', 'ready');
  await expect(page.getByRole('button', { name: 'Retry visitor map' })).toHaveCount(0);
});

test('retry replaces the old document and stale completion cannot change the new map', async ({ page, context }) => {
  let requests = 0;
  await page.clock.install();
  await context.route(mapScriptRoute, route => route.fulfill({ contentType: 'text/javascript', body: mapWidgetMock(++requests === 1 ? 20_000 : 0) }));
  await page.goto(fixturePath);
  await expect(page.frameLocator('.visitor-map iframe').locator('.mapmyvisitors-loading')).toBeVisible();
  await page.clock.fastForward(12_001);
  await expect(page.locator('.visitor-map')).toHaveAttribute('data-state', 'timeout');
  await page.getByRole('button', { name: 'Retry visitor map' }).click();
  await expect(page.locator('.visitor-map')).toHaveAttribute('data-state', 'ready');
  await page.clock.fastForward(10_000);
  await expect(page.locator('.visitor-map iframe')).toHaveCount(1);
  await expect(page.frameLocator('.visitor-map iframe').locator('#mapmyvisitors')).toHaveAttribute('src', /_retry=1/);
  expect(requests).toBe(2);
});

test('unrelated messages cannot claim that a stalled widget is ready', async ({ page, context }) => {
  await page.clock.install();
  await context.route(mapScriptRoute, route => route.fulfill({ contentType: 'text/javascript', body: '/* Data never arrives. */' }));
  await page.goto(fixturePath);
  await page.evaluate(() => window.postMessage({ widget: 'mapmyvisitors', status: 'ready', height: 99999 }, '*'));
  await expect(page.locator('.visitor-map')).toHaveAttribute('data-state', 'loading');
  await page.clock.fastForward(12_001);
  await expect(page.locator('.visitor-map')).toHaveAttribute('data-state', 'timeout');
});

test('the map resizes from desktop to mobile without reloading or overflowing', async ({ page, context }) => {
  let requests = 0;
  await page.setViewportSize({ width: 1440, height: 900 });
  await context.route(mapScriptRoute, route => { requests++; return route.fulfill({ contentType: 'text/javascript', body: mapWidgetMock() }); });
  await page.goto(fixturePath);
  await expect(page.locator('.visitor-map')).toHaveAttribute('data-state', 'ready');
  const originalHeight = await page.locator('.visitor-map iframe').getAttribute('height');
  await page.setViewportSize({ width: 375, height: 812 });
  const frame = page.locator('.visitor-map iframe');
  await expect.poll(() => frame.getAttribute('height')).not.toBe(originalHeight);
  await expect(page.frameLocator('.visitor-map iframe').locator('svg')).toBeVisible();
  expect(await frame.evaluate(el => el.getBoundingClientRect().width)).toBeLessThanOrEqual(327);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
  expect(requests).toBe(1);
  await mkdir('output/site-review', { recursive: true });
  await page.locator('.visitor-map').screenshot({ path: 'output/site-review/mapmyvisitors-fixture-mobile.png' });
});
