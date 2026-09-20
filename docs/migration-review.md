# React migration review

## Delivered behavior

The homepage now follows the reference site's typography, square portrait and icon links, headline highlights, image-led featured papers, section headings, two-column awards, and light/dark themes. Education retains its own meaning and uses a timeline. Blog and Diagram remain available from the footer. Only this site's existing personal content is presented; no CV, citation counts, or unsupported experience was added.

The figure and portrait provenance is documented in [asset-sources.md](asset-sources.md). Original photographs, the unpublished Markdown draft, and LICENSE are unchanged. Homepage content now lives in `_data/profile.yml`; featured papers and highlights use paper IDs instead of duplicate publication records.

## Palette updates

The first palette update replaced the original earth tones with Asuka-inspired red, amber, and charcoal. Red marked links, section rules, and portrait borders; amber accented the theme switch, portrait frame, and distinction badges.

After that initial color update, the production build and ESLint passed in `cozy-site`, and all six existing homepage browser checks passed at 375, 768, and 1440px in both themes. Updated desktop light/dark and mobile screenshots were inspected. Main text, muted text, links, and badge colors were checked against their surface colors: the lowest tested contrast was 4.69:1 in light mode and 6.35:1 in dark mode.

The current palette replaces charcoal decoration with pale pink (`#f3bfd0`), retaining red and amber. Light mode uses pink-white page and footer backgrounds; dark mode uses deep rose surfaces with the same pale pink accents. The top stripe, reading-progress bar, and third highlight card use all three theme colors. Text uses dark rose in light mode and light rose in dark mode. Browser theme metadata, the manifest, and visitor-map text/border colors match the updated palette; photographs and scientific figures keep their original colors.

The pale-pink update passes TypeScript, production build, and ESLint checks. Contrast calculations across 23 text/background combinations per theme give minima of 5.35:1 in light mode and 5.34:1 in dark mode.

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

The migration was subsequently committed and pushed as `4dd28df`. The Pages source was switched from legacy branch builds to GitHub Actions to prevent the old Jekyll deployment from overwriting the React build. The Actions build and deployment succeeded, and the deployed HTML, JavaScript, and CSS were checked.

## Local cleanup

On 2026-09-21, obsolete Jekyll directories, project-local Ruby dependencies and caches, the old `_site/` output, the unused Scholar crawler, template screenshot and placeholder, duplicate icons, and the one-off reference-capture script were removed. The original personal photographs, unpublished draft, license, current React tooling, and browser tests remain. Unused avatar/image variants were copied byte-for-byte into ignored `local-backups/legacy-images-2026-09-21/` before removal from the source tree. This cleanup does not modify the Conda environment; earlier Jekyll source is recoverable from Git history.
