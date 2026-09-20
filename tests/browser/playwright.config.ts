import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: '**/*.spec.ts',
  outputDir: '../../test-results',
  timeout: 30_000,
  expect: { timeout: 8_000 },
  workers: 2,
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:43173',
    channel: process.platform === 'darwin' ? 'chrome' : undefined,
    reducedMotion: 'reduce',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'node tests/browser/static-server.mjs',
    cwd: process.cwd(),
    // Test the local socket directly; developer HTTP proxies may return their
    // own success page even when no local server is listening.
    port: 43173,
    reuseExistingServer: false,
    timeout: 15_000,
  },
});
