import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { pageList, projectRoot, readContent, routeOutputPath } from '../scripts/generate-content.mjs';

const dist = path.join(projectRoot, 'dist');
const content = await readContent();

test('every public route has its own HTML and page metadata, without SPA fallback', async () => {
  for (const page of pageList(content)) {
    const html = await readFile(path.join(dist, routeOutputPath(page.url)), 'utf8');
    assert.match(html, /<meta name="description"/);
    assert.match(html, /<link rel="canonical"/);
    assert.match(html, /property="og:title"/);
    assert.match(html, /<title>/);
    if (!page.redirect) {
      const scripts = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)];
      assert.ok(scripts.length > 0, `${page.url} has a JavaScript entry`);
      for (const [, src] of scripts) await access(path.join(dist, src));
    } else assert.match(html, /window.location.hash/);
  }
});

test('metadata assets, feed and sitemap exist in the standalone static build', async () => {
  for (const file of ['images/favicon-32x32.png', 'images/apple-touch-icon.png', 'images/site.webmanifest', 'feed.xml', 'sitemap.xml', 'robots.txt', '.nojekyll']) {
    await access(path.join(dist, file));
  }
  const sitemap = await readFile(path.join(dist, 'sitemap.xml'), 'utf8');
  assert.match(sitemap, /https:\/\/cozy000000.github.io\/blog\//);
  assert.doesNotMatch(sitemap, /\/about|\/404/);
  const feed = await readFile(path.join(dist, 'feed.xml'), 'utf8');
  assert.match(feed, /<feed xmlns="http:\/\/www.w3.org\/2005\/Atom">/);
  assert.equal((feed.match(/<entry>/g) ?? []).length, content.posts.length);
});

test('the production bundle contains no unpublished draft text or reference identity', async () => {
  const names = await readdir(path.join(dist, 'assets'));
  const js = (await Promise.all(names.filter((name) => name.endsWith('.js')).map((name) => readFile(path.join(dist, 'assets', name), 'utf8')))).join('\n');
  assert.doesNotMatch(js, /大模型对话格式全景|跨阶段 Token|Dominic789654|xiangliu-homepage/);
});
