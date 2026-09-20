import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { collectPosts, derivePostUrl, generateContent, normalizeRoute, pageHtml, renderMarkdown, writeStaticPages } from '../scripts/generate-content.mjs';

const now = new Date('2026-09-21T00:00:00Z');
const post = (name, frontmatter = '', body = 'A published paragraph.') => ({
  name,
  source: `---\ntitle: A useful note\n${frontmatter}\n---\n${body}`,
});

test('unpublished and future posts are omitted before rendering or serialization', () => {
  const files = [
    post('2025-01-01-private.md', 'published: false', 'NEVER_PUBLISH_THIS_DRAFT'),
    post('2030-01-01-future.md', '', 'NEVER_PUBLISH_THIS_FUTURE'),
    post('2025-01-01-public.md', 'categories: tech', 'Public content'),
  ];
  const result = collectPosts(files, now);
  assert.equal(result.length, 1);
  assert.equal(result[0].url, '/tech/public/');
  assert.doesNotMatch(JSON.stringify(result), /NEVER_PUBLISH|source|fileName/);
});

test('post URLs preserve explicit permalinks and category/filename defaults', () => {
  assert.equal(derivePostUrl('2025-08-22-chat-template.md', { categories: 'tech models' }), '/tech/models/chat-template/');
  assert.equal(derivePostUrl('2025-08-22-chat-template.md', { permalink: '/notes/custom.html' }), '/notes/custom.html');
  assert.equal(derivePostUrl('2025-08-22-chat-template.md', { permalink: '/notes/custom' }), '/notes/custom/');
  assert.equal(normalizeRoute('/notes/index.html'), '/notes/');
  assert.equal(derivePostUrl('2025-08-22-中文.md'), '/%E4%B8%AD%E6%96%87/');
  for (const permalink of ['https://example.com', '//example.com', '/../secret/', '/a/%2e%2e/', '/x?query=1', '/x%3fquery', '/x#hash', '/x\\y']) {
    assert.throws(() => normalizeRoute(permalink));
  }
});

test('duplicate, fixed-page, asset and file/directory collisions fail the build', () => {
  assert.throws(() => collectPosts([post('2025-01-01-one.md', 'permalink: /same/'), post('2025-01-02-two.md', 'permalink: /same/index.html')], now), /Duplicate/);
  for (const permalink of ['/blog/', '/about.html', '/images/custom/', '/feed.xml', '/sitemap.xml']) {
    assert.throws(() => collectPosts([post('2025-01-01-one.md', `permalink: ${permalink}`)], now), /reserved/);
  }
  assert.throws(() => collectPosts([post('2025-01-01-one.md', 'permalink: /note.html'), post('2025-01-02-two.md', 'permalink: /note.html/sub/')], now), /Overlapping/);
});

test('post dates honor Shanghai defaults, explicit offsets, and publication ordering', () => {
  const posts = collectPosts([
    post('2025-01-01-one.md'),
    post('2025-01-02-two.md', 'date: 2025-01-03 11:00:00 +0800'),
    post('2025-01-03-three.md', 'date: 2025-01-03T12:00:00Z'),
  ], now);
  assert.equal(posts[0].url, '/three/');
  assert.equal(posts[1].date, '2025-01-03T03:00:00.000Z');
  assert.equal(posts[2].date, '2024-12-31T16:00:00.000Z');
  assert.throws(() => collectPosts([post('2025-01-01-one.md', 'date: nonsense')], now), /Invalid date/);
});

test('Markdown supports highlighted code and tables while removing unsafe HTML', () => {
  const html = renderMarkdown('```js\nconst answer = 42;\n```\n\n| A | B |\n| - | - |\n| 1 | 2 |\n\n<script>alert(1)</script><img src="/image.webp" onerror="alert(1)"><a href="javascript:alert(1)">bad</a>');
  assert.match(html, /hljs-keyword/);
  assert.match(html, /<table>/);
  assert.match(html, /src="\/image.webp"/);
  assert.doesNotMatch(html, /script|onerror|javascript:/);
});

test('math rendering is opt-in, supports the legacy mathjax flag and leaves code literal', () => {
  const source = '$x^2$\n\n$$\nx+y\n$$\n\n```text\n$x^2$\n```';
  assert.doesNotMatch(renderMarkdown(source), /class="katex/);
  const rendered = renderMarkdown(source, true);
  assert.match(rendered, /class="katex/);
  assert.match(rendered, /katex-display/);
  assert.match(rendered, /<code[^>]*>\$x\^2\$/);
  assert.equal(collectPosts([post('2025-01-01-math.md', 'mathjax: true', '$x$')], now)[0].math, true);
});

test('metadata escapes authored values and preserves literal replacement sequences', () => {
  const template = '<html><head><!-- site-metadata:start -->old<!-- site-metadata:end --></head><body><div id="root"></div><script type="module" src="/assets/app.js"></script></body></html>';
  const profile = { site: { title: 'Site', url: 'https://example.com' }, author: { avatar: '/portrait.webp' } };
  const html = pageHtml(template, { title: '$& <test>', description: '"Quoted" & safe', url: '/blog/' }, profile);
  assert.match(html, /<title>\$&amp; &lt;test&gt;<\/title>/);
  assert.match(html, /&quot;Quoted&quot; &amp; safe/);
  assert.match(html, /https:\/\/example.com\/blog\//);
  assert.match(html, /\/images\/site.webmanifest/);
  const redirect = pageHtml(template, { title: 'Site', description: '', url: '/about/', redirect: '/' }, profile);
  assert.match(redirect, /window.location.search \+ window.location.hash/);
  assert.doesNotMatch(redirect, /type="module"/);
});

test('content generation never changes drafts and emits physical published routes', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'cozy-content-test-'));
  try {
    await Promise.all(['_data', '_posts', 'dist'].map((dir) => mkdir(path.join(root, dir), { recursive: true })));
    await writeFile(path.join(root, '_data/profile.yml'), 'site:\n  title: Test Site\n  description: Description\n  url: https://example.com\n');
    const draft = post('2025-01-01-draft.md', 'published: false', 'SECRET_DRAFT_TEXT').source;
    await writeFile(path.join(root, '_posts/2025-01-01-draft.md'), draft);
    await writeFile(path.join(root, '_posts/2025-01-02-note.md'), post('2025-01-02-note.md', 'categories: research').source);
    const content = await generateContent(root);
    assert.equal(await readFile(path.join(root, '_posts/2025-01-01-draft.md'), 'utf8'), draft);
    assert.doesNotMatch(await readFile(path.join(root, 'src/generated/content.json'), 'utf8'), /SECRET_DRAFT_TEXT/);
    await writeFile(path.join(root, 'dist/index.html'), '<!-- site-metadata:start --><!-- site-metadata:end --><div id="root"></div>');
    await writeStaticPages(path.join(root, 'dist'), content);
    assert.match(await readFile(path.join(root, 'dist/research/note/index.html'), 'utf8'), /A useful note/);
    assert.match(await readFile(path.join(root, 'dist/feed.xml'), 'utf8'), /https:\/\/example.com\/research\/note\//);
    assert.doesNotMatch(await readFile(path.join(root, 'dist/sitemap.xml'), 'utf8'), /about|404|draft/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
