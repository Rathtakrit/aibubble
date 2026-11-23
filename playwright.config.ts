import { defineConfig } from '@playwright/test';

const baseURL = 'http://127.0.0.1:4321';

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  outputDir: './test-results',
  workers: 1,
  use: { baseURL, browserName: 'chromium', screenshot: 'on' },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1280, height: 800 } } },
    { name: 'phone', use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
  webServer: {
    // Astro 7 can detach preview in agent sessions unless the lock is bypassed.
    command: './node_modules/.bin/astro preview --host 127.0.0.1 --port 4321 --ignore-lock',
    gracefulShutdown: { signal: 'SIGTERM', timeout: 5_000 },
    url: baseURL,
    reuseExistingServer: false,
    stdout: 'pipe',
  },
});
