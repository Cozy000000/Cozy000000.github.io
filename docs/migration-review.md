# React migration review

## Delivered behavior

The homepage now follows the reference site's typography, square portrait and icon links, headline highlights, image-led featured papers, section headings, two-column awards, and light/dark themes. Education retains its own meaning and uses a timeline. Blog and Diagram remain available from the footer. Only this site's existing personal content is presented; no CV, citation counts, or unsupported experience was added.

The figure and portrait provenance is documented in [asset-sources.md](asset-sources.md). Original photographs, the unpublished Markdown draft, and LICENSE are unchanged. Homepage content now lives in `_data/profile.yml`; featured papers and highlights use paper IDs instead of duplicate publication records.

## Asuka palette update

The requested Asuka-inspired palette replaces the original earth tones with red, amber, and charcoal. Red marks links, section rules, and portrait borders; amber accents the theme switch, portrait frame, and distinction badges. Light mode uses an off-white page with a pale red introduction, while dark mode uses charcoal surfaces and lighter red text. Theme metadata, the manifest, and the visitor-map color are synchronized. Paper figures retain their original colors and white backgrounds.

After this color update, the production build and ESLint passed in `cozy-site`, and all six existing homepage browser checks passed at 375, 768, and 1440px in both themes. Updated desktop light/dark and mobile screenshots were inspected. Main text, muted text, links, and badge colors were checked against their surface colors: the lowest tested contrast was 4.69:1 in light mode and 6.35:1 in dark mode.

## Verification performed

- cozy-site supplies Node.js 22.23.2; its exact executable path was verified. `scripts/with-cozy-env.sh` prevents an IDE PATH from choosing system Node.
- TypeScript, ESLint (no warnings), and production build pass.
- 8 content tests pass: publication filtering, route generation/collisions, Shanghai dates, Markdown/sanitization, math support, safe metadata, and non-mutating draft handling.
- 3 static-build tests pass: real HTML routes and metadata, feed/sitemap/assets, and absence of draft text/reference identity in the browser bundle.
- 12 browser tests pass against a plain static server: six viewport/theme combinations, persistent theme, successful clipboard copy and permission fallback, keyboard mobile navigation, desktop scroll/legacy anchors, direct navigation/reloads/redirects/404, and lazy-map failure isolation.
- An isolated development fixture verified YAML and Markdown auto-reload and newly added article addresses without changing actual site content.
- Light/dark screenshots at 375, 768 and 1440px were compared with a temporary reference preview. No horizontal overflow, clipped figure labels, missing images, or JavaScript page errors were observed.

Browser tests mock the third-party diagram response and map failure to avoid external availability or visitor tracking affecting the results. They retain and verify the actual configured URL. This is local validation, not verification of a deployed production website.

Screenshots are local generated artifacts in `output/site-review/` (ignored by Git). Full homepage files are `home-<width>-<theme>.png`; first-screen crops append `-first-screen`. Matching reference first-screen captures are `reference-<width>-<theme>.png`.

## Build and rollout

The visitor map was subsequently replaced with a site-specific Flag Counter image (`YywQ`) because the original ClustrMaps endpoint could not be reached and its identifier was rejected by MapMyVisitors. The footer now loads the map directly, with error/timeout handling and manual retry. See [visitor-map.md](visitor-map.md) for diagnostics, configuration, and service limitations. The earlier lazy-map migration check describes the previous implementation.

The GitHub Pages workflow builds and uploads only `dist/`. `/`, `/blog/`, `/drawing/` and published article URLs have physical HTML files; `/about/` and `/about.html` redirect to `/` while preserving query and fragment. Pages retain individual metadata, and the build emits sitemap and Atom feed. React renders body content in the browser.

Motion's two transitive packages are pinned alongside Framer Motion: newer otherwise-compatible ranges removed a required export. The lockfile captures the working combination.

No commit, push, Pages-settings change, or live deployment was performed. At rollout, review the local preview and select GitHub Actions as the repository's Pages source. Existing Jekyll source can be recovered from Git history; the old Ruby packages were left in the user's Conda environment.
