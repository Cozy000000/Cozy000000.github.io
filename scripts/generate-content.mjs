import { existsSync } from 'node:fs';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { JSON_SCHEMA, load } from 'js-yaml';
import { Marked } from 'marked';
import sanitizeHtml from 'sanitize-html';
import hljs from 'highlight.js';
import katex from 'katex';

export const projectRoot = fileURLToPath(new URL('../', import.meta.url));
export const fixedRoutes = ['/', '/blog/', '/drawing/', '/about/', '/about.html', '/404.html'];

export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

export function normalizeRoute(value) {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//') || /[\\?#]/.test(value)) {
    throw new Error(`Permalink must be an absolute local path: ${value}`);
  }
  let decoded;
  try { decoded = decodeURIComponent(value); } catch { throw new Error(`Invalid URL encoding: ${value}`); }
  if (/[\\?#]/.test(decoded) || [...decoded].some((char) => char.charCodeAt(0) < 32) || decoded.split('/').some((part) => part === '.' || part === '..')) {
    throw new Error(`Unsafe permalink: ${value}`);
  }
  let route = decoded.replace(/\/{2,}/g, '/').replace(/\/index\.html$/, '/');
  if (route !== '/' && !route.endsWith('/') && !route.endsWith('.html')) route += '/';
  return encodeURI(route);
}

function slugify(value) {
  return String(value).trim().toLowerCase().replace(/[^\p{L}\p{N}_-]+/gu, '-').replace(/^-+|-+$/g, '');
}

export function postCategories(data) {
  const value = data.categories ?? data.category ?? [];
  const categories = Array.isArray(value) ? value : String(value).split(/\s+/);
  return categories.map(String).filter(Boolean);
}

export function derivePostUrl(fileName, data = {}) {
  if (data.permalink !== undefined) return normalizeRoute(data.permalink);
  const slug = slugify(fileName.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.(?:md|markdown)$/i, ''));
  if (!slug) throw new Error(`Post has an empty slug: ${fileName}`);
  return normalizeRoute(`/${[...postCategories(data).map(slugify).filter(Boolean), slug].join('/')}/`);
}

function postDate(fileName, rawDate) {
  if (rawDate instanceof Date) return rawDate;
  let value = rawDate === undefined ? fileName.match(/^\d{4}-\d{2}-\d{2}/)?.[0] : String(rawDate);
  if (!value) throw new Error(`Post needs a date or a YYYY-MM-DD filename: ${fileName}`);
  value = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) value += 'T00:00:00+08:00';
  else if (/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}/.test(value)) {
    value = value.replace(' ', 'T').replace(/\s+([+-]\d{2}):?(\d{2})$/, '$1:$2');
    if (!/(?:Z|[+-]\d{2}:?\d{2})$/.test(value)) value += '+08:00';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error(`Invalid date in ${fileName}: ${rawDate}`);
  return date;
}

export function renderMarkdown(source, math = false) {
  const parser = new Marked({ gfm: true });
  parser.use({ renderer: {
    code({ text, lang }) {
      const language = (lang || '').split(/\s/)[0];
      const code = language && hljs.getLanguage(language)
        ? hljs.highlight(text, { language, ignoreIllegals: true }).value
        : escapeHtml(text);
      return `<pre><code${language ? ` class="hljs language-${escapeHtml(language)}"` : ''}>${code}</code></pre>\n`;
    },
  } });
  const mathFragments = [];
  const mathPlaceholder = (text, displayMode) => {
    const id = mathFragments.push(katex.renderToString(text, { displayMode, throwOnError: false, trust: false, output: 'htmlAndMathml' })) - 1;
    return `<span data-site-math="${id}"></span>`;
  };
  if (math) parser.use({ extensions: [
    {
      name: 'displayMath', level: 'block', start: (src) => src.indexOf('$$'),
      tokenizer(src) {
        const match = /^\$\$\s*\n?([\s\S]+?)\n?\s*\$\$(?:\n|$)/.exec(src);
        if (match) return { type: 'displayMath', raw: match[0], text: match[1] };
      },
      renderer: (token) => `${mathPlaceholder(token.text, true)}\n`,
    },
    {
      name: 'inlineMath', level: 'inline', start: (src) => src.indexOf('$'),
      tokenizer(src) {
        const match = /^\$(?!\$)([^\n$]+?)\$(?!\$)/.exec(src);
        if (match) return { type: 'inlineMath', raw: match[0], text: match[1] };
      },
      renderer: (token) => mathPlaceholder(token.text, false),
    },
  ] });
  const sanitized = sanitizeHtml(parser.parse(source), {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, 'img', 'del', 'input'],
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      '*': ['class', 'id'],
      a: ['href', 'name', 'target', 'rel'],
      img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
      input: ['type', 'checked', 'disabled'],
      span: ['class', 'data-site-math'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: {
      a: (tagName, attribs) => ({ tagName, attribs: { ...attribs, ...(attribs.target === '_blank' ? { rel: 'noopener noreferrer' } : {}) } }),
      input: (tagName, attribs) => ({ tagName, attribs: { type: 'checkbox', disabled: '', ...(Object.hasOwn(attribs, 'checked') ? { checked: '' } : {}) } }),
    },
  });
  // Only KaTeX-generated, non-trusting markup is restored after user HTML is sanitized.
  return sanitized.replace(/<span data-site-math="(\d+)"><\/span>/g, (_, index) => mathFragments[Number(index)] ?? '');
}

export function collectPosts(files, now = new Date()) {
  const posts = [];
  const routes = new Set(fixedRoutes);
  for (const { name, source } of files) {
    const { data, content } = matter(source, { engines: { yaml: (text) => load(text, { schema: JSON_SCHEMA }) } });
    // Filter before rendering or serializing: draft text never enters browser data.
    if (data.published === false) continue;
    const date = postDate(name, data.date);
    if (date > now) continue;
    if (typeof data.title !== 'string' || !data.title.trim()) throw new Error(`Published post needs a title: ${name}`);
    const url = derivePostUrl(name, data);
    if (routes.has(url) || /^\/(?:assets|images|src)(?:\/|$)/.test(url) || /^\/(?:feed\.xml|sitemap\.xml|robots\.txt|site\.webmanifest|favicon[^/]*)\/?$/.test(url)) {
      throw new Error(`Duplicate or reserved post URL: ${url}`);
    }
    routes.add(url);
    const math = data.math === true || data.mathjax === true;
    const html = renderMarkdown(content, math);
    const plain = sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} }).replace(/\s+/g, ' ').trim();
    posts.push({
      title: data.title.trim(),
      description: String(data.description ?? data.excerpt ?? plain.slice(0, 180)),
      date: date.toISOString(),
      categories: postCategories(data),
      url,
      html,
      math,
    });
  }
  // Prevent file/directory collisions such as /essay.html and /essay.html/chapter/.
  const outputs = [...routes].map(routeOutputPath);
  for (const output of outputs) {
    if (outputs.some((other) => other !== output && other.startsWith(`${output}/`))) throw new Error(`Overlapping route output: ${output}`);
  }
  return posts.sort((a, b) => b.date.localeCompare(a.date) || a.url.localeCompare(b.url));
}

export async function readContent(root = projectRoot, now = new Date()) {
  const profile = load(await readFile(path.join(root, '_data/profile.yml'), 'utf8'), { schema: JSON_SCHEMA });
  const postsDir = path.join(root, '_posts');
  const names = existsSync(postsDir) ? (await readdir(postsDir)).filter((name) => /\.(?:md|markdown)$/i.test(name)).sort() : [];
  const files = await Promise.all(names.map(async (name) => ({ name, source: await readFile(path.join(postsDir, name), 'utf8') })));
  return { profile, posts: collectPosts(files, now) };
}

export async function generateContent(root = projectRoot) {
  const content = await readContent(root);
  const target = path.join(root, 'src/generated/content.json');
  await mkdir(path.dirname(target), { recursive: true });
  const json = `${JSON.stringify(content, null, 2)}\n`;
  if (!existsSync(target) || await readFile(target, 'utf8') !== json) await writeFile(target, json);
  return content;
}

export function routeOutputPath(route) {
  return route.endsWith('/') ? `${decodeURI(route).slice(1)}index.html` : decodeURI(route).slice(1);
}

export function pageList(content) {
  const title = content.profile.site?.title ?? 'Zhiyi Chen';
  const description = content.profile.site?.description ?? 'Personal academic website of Zhiyi Chen.';
  return [
    { url: '/', title, description },
    { url: '/blog/', title: `Blog · ${title}`, description: `Notes on research, language models, and learning by ${title}.` },
    { url: '/drawing/', title: `Diagram · ${title}`, description: 'A workspace for drawing diagrams with diagrams.net.' },
    { url: '/about/', title, description, redirect: '/' },
    { url: '/about.html', title, description, redirect: '/' },
    { url: '/404.html', title: `Page not found · ${title}`, description: 'The requested page could not be found.', noindex: true },
    ...content.posts.map((post) => ({ ...post, title: `${post.title} · ${title}`, article: true })),
  ];
}

export function pageHtml(template, page, profile) {
  const origin = (profile.site?.url ?? 'https://cozy000000.github.io').replace(/\/$/, '');
  const canonical = new URL(page.redirect ?? page.url, origin).href;
  const image = new URL(profile.site?.image ?? profile.author?.avatar ?? '/images/avatar.webp', origin).href;
  const tags = [
    `<title>${escapeHtml(page.title)}</title>`,
    `<meta name="description" content="${escapeHtml(page.description)}" />`,
    `<link rel="canonical" href="${escapeHtml(canonical)}" />`,
    '<link rel="icon" href="/images/favicon-32x32.png" sizes="32x32" />',
    '<link rel="apple-touch-icon" href="/images/apple-touch-icon.png" />',
    '<link rel="manifest" href="/images/site.webmanifest" />',
    `<meta property="og:type" content="${page.article ? 'article' : 'website'}" />`,
    `<meta property="og:title" content="${escapeHtml(page.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(page.description)}" />`,
    `<meta property="og:url" content="${escapeHtml(canonical)}" />`,
    `<meta property="og:image" content="${escapeHtml(image)}" />`,
    '<meta name="twitter:card" content="summary" />',
    `<meta name="twitter:title" content="${escapeHtml(page.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(page.description)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(image)}" />`,
    '<link rel="alternate" type="application/atom+xml" title="Blog" href="/feed.xml" />',
    ...(page.noindex || page.redirect ? ['<meta name="robots" content="noindex" />'] : []),
  ].join('\n    ');
  let html = template.replace(/<!-- site-metadata:start -->[\s\S]*?<!-- site-metadata:end -->/, () => `<!-- site-metadata:start -->\n    ${tags}\n    <!-- site-metadata:end -->`);
  if (page.redirect) {
    html = html.replace('<div id="root"></div>', '<p>This page has moved to <a href="/">the homepage</a>.</p><script>window.location.replace("/" + window.location.search + window.location.hash);</script><noscript><meta http-equiv="refresh" content="0;url=/" /></noscript>');
    html = html.replace(/<script type="module"[^>]*src="[^"]*"[^>]*><\/script>/g, '');
  }
  return html;
}

export async function writeStaticPages(outDir, content) {
  const template = await readFile(path.join(outDir, 'index.html'), 'utf8');
  const pages = pageList(content);
  for (const page of pages) {
    const target = path.join(outDir, routeOutputPath(page.url));
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, pageHtml(template, page, content.profile));
  }
  const origin = (content.profile.site?.url ?? 'https://cozy000000.github.io').replace(/\/$/, '');
  const title = content.profile.site?.title ?? 'Zhiyi Chen';
  const canonical = (url) => escapeHtml(new URL(url, origin).href);
  const sitemap = pages.filter((page) => !page.redirect && !page.noindex).map((page) => `<url><loc>${canonical(page.url)}</loc>${page.date ? `<lastmod>${page.date}</lastmod>` : ''}</url>`).join('\n');
  // Empty feeds use the build time because no publication date exists yet.
  const updated = content.posts[0]?.date ?? new Date().toISOString();
  const entries = content.posts.map((post) => `<entry><title>${escapeHtml(post.title)}</title><link href="${canonical(post.url)}"/><id>${canonical(post.url)}</id><updated>${post.date}</updated><summary>${escapeHtml(post.description)}</summary><content type="html">${escapeHtml(post.html)}</content></entry>`).join('\n');
  await Promise.all([
    writeFile(path.join(outDir, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemap}\n</urlset>\n`),
    writeFile(path.join(outDir, 'feed.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<feed xmlns="http://www.w3.org/2005/Atom"><title>${escapeHtml(title)} · Blog</title><link href="${canonical('/blog/')}"/><link href="${canonical('/feed.xml')}" rel="self"/><id>${canonical('/blog/')}</id><updated>${updated}</updated><author><name>${escapeHtml(title)}</name></author>\n${entries}\n</feed>\n`),
    writeFile(path.join(outDir, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`),
    writeFile(path.join(outDir, '.nojekyll'), ''),
  ]);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const content = await generateContent();
  console.log(`Generated profile and ${content.posts.length} published post(s).`);
}
