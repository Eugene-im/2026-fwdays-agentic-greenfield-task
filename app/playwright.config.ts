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
    // Full artifact capture so a run can be handed off for analysis:
    // - video: the demo recording + a visual replay of the whole run
    // - trace: open with `npx playwright show-trace` (DOM snapshots, network, console)
    // - screenshot on failure: a PNG an agent can read directly from test-results/
    video: 'on',
    trace: 'on',
    screenshot: 'only-on-failure',
  },
})
