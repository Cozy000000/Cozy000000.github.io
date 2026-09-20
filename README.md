# Zhiyi Chen · Personal website

A React academic homepage for Zhiyi Chen, built with TypeScript, Vite, Tailwind CSS, Framer Motion, and Lucide icons. The site presents research, publications, education, awards, and academic activities with an Asuka-inspired red, amber, and charcoal palette, responsive layouts, light/dark themes, and accessible section navigation.

## Run in the cozy-site Conda environment

For a new environment:

```bash
conda env create -f environment.yml
conda activate cozy-site
bash scripts/with-cozy-env.sh npm ci
bash run_server.sh
```

For the existing environment (previously used for Jekyll):

```bash
conda env update -n cozy-site -f environment.yml
conda activate cozy-site
bash scripts/with-cozy-env.sh npm ci
bash run_server.sh
```

The environment supplies Node.js 22 (at least 22.12) and npm. Updating it does not remove existing Ruby packages. `run_server.sh` automatically selects `cozy-site` when called outside the environment and checks that Node belongs to it. Open the URL printed by Vite, normally <http://127.0.0.1:5173/>. YAML and Markdown edits reload the development site.

The wrapper `bash scripts/with-cozy-env.sh <command>` selects the environment and prepends its `bin` directory, including in IDE shells whose PATH still prefers a system Node. Use it for installation and checks as well as the server.

## Edit content

| Source | What to edit |
| --- | --- |
| `_data/profile.yml` | Site metadata, identity, contacts, research, news, paper records, highlights, education, awards, activities, diagram, and visitor map |
| `_posts/` | Markdown blog articles with YAML front matter |
| `public/images/` | Optimized portrait, research figures, and existing icons |
| `src/components/` | React page components |
| `src/styles.css` | Layout, typography, colors, and responsive styling |
| `docs/asset-sources.md` | Research figure sources and image preparation details |

`src/generated/content.json` is generated from the content sources and is not edited or committed. Featured cards and publication highlights refer to a paper by its `id`, so each paper is maintained once. Authors are an array of names; the site highlights the name matching `author.name`.

### Blog posts

Name files `YYYY-MM-DD-article-slug.md` and supply front matter:

```yaml
---
title: A research note
date: 2026-09-01
categories: [research]
description: A short summary for the blog and sharing cards.
published: true
math: false
---
```

An explicit `permalink` takes precedence; otherwise the URL follows the previous `/:categories/:title/` pattern, using the filename slug. Set `published: false` for drafts. Unpublished and future-dated posts are excluded before any browser data or production pages are generated. The existing chat-template draft remains unchanged and unpublished; its commented metadata must be completed deliberately before publishing.

Published posts support Markdown tables, highlighted code, and opt-in math. Builds check required article metadata and URL collisions.

## Check and build

Run these inside `cozy-site`:

```bash
bash scripts/with-cozy-env.sh npm run typecheck
bash scripts/with-cozy-env.sh npm run lint
bash scripts/with-cozy-env.sh npm run build
bash scripts/with-cozy-env.sh npm test
bash scripts/with-cozy-env.sh npm run test:static
bash scripts/with-cozy-env.sh npm run preview
```

Vite outputs `dist/`. Real HTML files preserve `/`, `/blog/`, `/drawing/`, and article addresses on static hosting. `/about/` and `/about.html` redirect to the homepage while retaining the fragment. Unknown paths use a normal 404 page. Each page has its own metadata; the build also creates the sitemap and Atom feed. React renders the page body in the browser.

Browser verification (after a build):

```bash
bash scripts/with-cozy-env.sh npm run test:browser
```

On macOS this uses installed Google Chrome. On other systems, install Playwright Chromium first with `bash scripts/with-cozy-env.sh npx playwright install chromium`. The suite serves `dist/` on a dedicated local port, verifies direct URLs and interactions, and writes light/dark screenshots at 375, 768, and 1440px to ignored `output/site-review/`. It isolates external diagram and map services so tests do not generate visitor statistics. Reference captures are optional and require the temporary reference preview at port 4174.

## GitHub Pages

The workflow checks the project and publishes only `dist/` through GitHub Pages Actions. At rollout, set **Settings → Pages → Source → GitHub Actions**. Local development and checks do not push commits or change the live site.

The site URL remains `https://cozy000000.github.io`, with a root deployment base. Original photos remain in `images/`; only the optimized copies in `public/` are deployed. No draft Markdown, generated development files, Ruby dependencies, or PDF source downloads are deployed.

## Migration notes

- Homepage navigation now follows the reference layout; Blog and Diagram links live in the footer.
- Existing publication links, BibTeX, education, awards, activities, legacy anchors, and the diagram embed are preserved.
- No CV or citation metrics are displayed without corresponding personal data. The footer displays this site's Flag Counter world map automatically, with timeout handling and manual retry. See [visitor map details](docs/visitor-map.md).
- Jekyll templates and obsolete theme assets have been retired. The original source remains recoverable from Git history; original personal assets, the draft, and `LICENSE` are retained.

## Acknowledgments

- Visual direction inspired by [Xiang Liu's homepage](https://github.com/Dominic789654/Dominic789654.github.io). Components here use Zhiyi Chen's own content and research figures.
- The original site was based on [AcadHomepage](https://github.com/RayeRen/acad-homepage.github.io); its MIT license is preserved in `LICENSE`.
