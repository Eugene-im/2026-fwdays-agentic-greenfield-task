import { defineConfig } from '@playwright/test'

// Headed only: Chrome extensions load unreliably headless (see
// docs/requirements.md §3). `video: 'on'` so a passing run doubles as the
// homework demo source. Extension loading itself happens per-test via
// launchPersistentContext in e2e/export.spec.ts.
export default defineConfig({
  testDir: './e2e',
  outputDir: 'test-results',
  timeout: 120_000,
  fullyParallel: false,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    video: 'on',
    trace: 'on-first-retry',
  },
})
