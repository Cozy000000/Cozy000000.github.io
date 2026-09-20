import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

// Run only against the local, temporary reference copy. Never changes its files.
const browser = await chromium.launch({ channel: process.platform === 'darwin' ? 'chrome' : undefined });
await mkdir('output/site-review', { recursive: true });
try {
  for (const width of [375, 768, 1440]) {
    for (const theme of ['light', 'dark']) {
      const context = await browser.newContext({ viewport: { width, height: 1000 }, colorScheme: theme, reducedMotion: 'reduce' });
      // The reference map is automatic. Avoid counting QA visits or relying on it.
      await context.route('**/*clustrmaps.com/**', route => route.abort());
      await context.addInitScript(({ theme }) => { localStorage.setItem('theme', theme); }, { theme });
      const page = await context.newPage();
      await page.goto('http://127.0.0.1:4174/', { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(1800); // Reference's staggered hero animations.
      await page.screenshot({ path: `output/site-review/reference-${width}-${theme}.png` });
      await page.locator('#featured').scrollIntoViewIfNeeded();
      await page.waitForTimeout(1200);
      if (width === 1440) await page.locator('#featured').screenshot({ path: `output/site-review/reference-papers-${theme}.png` });
      await context.close();
      console.log(`Reference screenshot: ${width}px ${theme}`);
    }
  }
  await writeFile('output/site-review/README.md', `# Visual review\n\nHomepage screenshots use the same 375, 768 and 1440px viewport widths in both light and dark themes.\n\n- home-*.png: complete migrated homepage, with all sections visible.\n- reference-*.png: reference website first screen at matching width/theme.\n- reference-papers-*.png: reference featured-paper section.\n\nReference rendered from an unmodified temporary copy of Dominic789654.github.io using cozy-site. Third-party visitor tracking is blocked for these QA captures.\n`);
} finally {
  await browser.close();
}
