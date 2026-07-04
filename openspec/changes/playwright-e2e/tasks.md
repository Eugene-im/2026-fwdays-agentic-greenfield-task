## 1. Tooling & scoping

- [x] 1.1 Add `@playwright/test` to `app/package.json` devDependencies and a `test:e2e` (+ `test:e2e:report`) script
- [x] 1.2 Add `app/vitest.config.ts` scoping unit runs to `src/**/*.test.ts` so `npm run test` never collects the Playwright `e2e/*.spec.ts`
- [x] 1.3 Gitignore Playwright artifacts: `test-results/`, `playwright-report/`

## 2. Harness config

- [x] 2.1 Add `app/playwright.config.ts`: headed Chromium, `testDir: './e2e'`, `video: 'on'`, output to `test-results/`
- [x] 2.2 In config or a fixture, launch via `launchPersistentContext` with `--disable-extensions-except`/`--load-extension` pointed at `app/dist/`, a controlled `downloadsPath`, and a deterministic extension id derived from the manifest `key` (popup-only build has no service worker) — `manifest.config.ts` pins the public `key`; the fixture recomputes the id from it

## 3. Export spec

- [x] 3.1 Add `app/e2e/export.spec.ts`: fail fast if `app/dist/` is missing (prompt to build)
- [x] 3.2 Open the popup, navigate to live ROVODEV-36, click Export, assert `data-state="success"` (FR-05…FR-07)
- [x] 3.3 Assert the on-disk tree: `ROVODEV-36/ROVODEV-36-<title>.md` (Cyrillic preserved, forbidden chars stripped) and `ROVODEV-36/media/` with `NN-` prefixes (FR-13, FR-15, FR-16, FR-18)
- [x] 3.4 Assert the `.md` body contains `UserN` aliases and none of the known real names (FR-19)
- [ ] 3.5 Assert a failed attachment yields success-with-caveats, not an abort (FR-12) — deferred to the live run (needs a reproducible failing attachment); media assertion is currently tolerant of missing attachments

## 4. Verification (scaffold)

- [x] 4.1 `npm run typecheck && npm run lint && npm run test && npm run build` still pass and stay green with the harness present (unit layer unaffected, NFR-06) — verified ~4s combined
- [x] 4.2 Confirm `npm run test` (Vitest) does not attempt to run any `e2e/*.spec.ts` — verified: 63 tests / 10 files, e2e excluded

## 5. Run (human step)

- [ ] 5.1 `cd app && npm install` (pulls `@playwright/test`) then `npx playwright install chromium`
- [ ] 5.2 `npm run build && npm run test:e2e` on a machine with a display + network to the live ticket; confirm the suite passes and a video is recorded
- [ ] 5.3 Use the recorded run (trim to 1–2 min) as the homework demo video
- [ ] 5.4 Run `openspec validate playwright-e2e --strict`, then archive the change once the run passes
