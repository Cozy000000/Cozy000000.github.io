# Website image sources

The original personal photographs remain in `images/`. Current website assets live in `public/images/`; Vite serves them at `/images/`. Unused avatar variants are archived in local-only `local-backups/legacy-images-2026-09-21/`; duplicate icons and template placeholder images have been removed.

## Research figures

These are direct renders of figures from the author's papers. No labels or scientific content were redrawn. Each crop was visually checked against its source page; all diagram labels, arrows, borders, and legends are retained. The surrounding paper captions are excluded and the page links supply attribution.

| Asset | Source | Extracted region | Output |
| --- | --- | --- | --- |
| `papers/ecotune.webp` | [EcoTune PDF, ACL Anthology](https://aclanthology.org/2025.emnlp-main.394.pdf) | PDF page 1, Figure 1(b), system overview | 1128 × 714 px, lossless WebP, 52,228 bytes |
| `papers/kale.webp` | [KALE PDF, Zeyi Wen's website](https://zeyiwen.github.io/papers/cikm2025_kale.pdf) | PDF page 3, Figure 2, including the model / fusion-index legend | 1752 × 752 px, lossless WebP, 277,106 bytes |

For reproducibility, the PDF crop boxes use top-left PDF coordinates in points:

- EcoTune: `(324, 355, 512, 474)`, rendered at 6 pixels per point.
- KALE: `(88, 83, 526, 271)`, rendered at 4 pixels per point.

Source PDF SHA-256 hashes:

```text
EcoTune e1b1e57b2c0115a8365ed66c1cf9915c6a8e7a9bb40d0b89afac2def44089d3c
KALE    bdadb624fa76b8ec8ec8c5c99cb7997a5ddb4504642dcde9aed4899131a72d4a
```

The extraction uses PyMuPDF to render the crop and Pillow to save lossless WebP, with a white background. Display these images with `object-fit: contain` so future layout changes cannot trim scientific content. Temporary downloads and page previews were kept outside the repository in `/tmp/cozy-site-assets`.

Suggested accessible descriptions:

- EcoTune: “EcoTune system overview: a token-budget fidelity scheduler and hyperparameter optimization controller allocate inference resources to large language models.”
- KALE: “KALE overview: model fusion aggregates knowledge from a model pool, followed by representation alignment and few-shot adaptation.”

## Portrait

`profile-deer.png` is the author's uploaded photo with deer, provided on 2026-09-21 (800 × 533 px). It is copied without modifying the image. The square homepage frame uses `object-fit: cover` and `object-position: left center` to keep the author visible; social previews use the full original image.

The previous 768 × 768 `profile.webp` avatar and its original `images/IMG_0151.JPG` were backed up locally in `local-backups/avatar-2026-09-21/`, with restoration instructions. That directory is ignored by Git and excluded from the public assets. The original photo in `images/` remains unchanged.

## Icons and web manifest

The existing llama favicon, Apple touch icon, and Android icons are maintained in `public/images/`. They were originally copied unchanged from `images/`; the duplicate originals were removed after verifying identical SHA-256 hashes. The current manifest names Zhiyi Chen, points its icon URLs to `/images/`, sets the homepage as its start URL, and uses the warm page background. No icon or photograph from the reference website is used.
