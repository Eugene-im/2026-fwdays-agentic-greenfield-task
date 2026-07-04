## Context

The unit layer (Vitest on `lib/`) proves the pure logic; it cannot prove that the packaged MV3 extension loads, that `chrome.scripting`/`chrome.downloads` wiring works, or that a real export produces the right files on disk. `docs/requirements.md` §3–§4 specify Playwright driving the unpacked build in a real Chrome against the public ticket ROVODEV-36. Chrome extensions load unreliably in headless mode, so the harness must run headed. This is also the intended source of the homework demo video.

## Goals / Non-Goals

**Goals:**
- A repeatable Playwright harness that loads `app/dist/` unpacked, drives the popup, and asserts the on-disk export (folder, `.md`, `media/NN-…`, anonymization) — covering FR-05…FR-08, FR-11…FR-18 at the integration level.
- Deterministic download location so assertions read from a known path rather than the OS Downloads folder.
- `video: 'on'` so a passing run yields a recording usable for the demo.
- Zero impact on the unit suite: `npm run test` (Vitest) stays green and fast (NFR-06); Playwright specs run only under `npm run test:e2e`.

**Non-Goals:**
- Running the harness in CI or headless (documented as headed-only; not wired into any CI here).
- Producing the final edited demo video or the PR text (homework wrap-up, human).
- Mocking Jira — the test hits the live public ticket by design (FR-02 fidelity); network flakiness is accepted and documented.
- Any change to product code or permissions.

## Decisions

### 1. `launchPersistentContext` with `--load-extension`, headed
MV3 extensions require a persistent context and the `--disable-extensions-except` + `--load-extension` flag pair pointed at `app/dist/`; `chromium.launchPersistentContext('', { headless: false, args: [...] })` is the standard Playwright recipe. Headed is mandatory (requirements §3). The extension's service worker / popup page is discovered via `context.serviceWorkers()` / waiting for the worker to get the extension id, then the popup is opened by navigating a page to `chrome-extension://<id>/src/popup/index.html`. Alternative considered: the `chromium` channel with `--headless=new` — rejected because extension loading there is unreliable, exactly the caveat requirements §3 records.

### 2. Controlled download directory
`launchPersistentContext` accepts `downloadsPath`, and we set Chrome prefs / use a temp dir so `chrome.downloads` writes under a path the test controls. The test then asserts the tree `‹tmp›/ROVODEV-36/ROVODEV-36-*.md` and `‹tmp›/ROVODEV-36/media/01-*`. Reading real files (not just popup DOM) is what makes this a true E2E of FR-15…FR-18. Alternative: assert only the popup success state — rejected as too shallow (wouldn't catch a broken `chrome.downloads` path).

### 3. Assertions map directly to requirements/scenarios
Each spec assertion is traceable: popup reaches `data-state="success"` (FR-07); a `.md` file exists with the `<KEY>-<title>` shape keeping Cyrillic (FR-16, FR-18); its body contains `User1`/`User2` and no known real names when anonymization is on (FR-19); a `media/` dir exists with `NN-` prefixed entries (FR-13). A negative/partial path (an attachment that fails) is asserted to still yield success-with-caveats, not an abort (FR-12) — where feasible against the live ticket, otherwise noted as manual.

### 4. Vitest scoping
Add `app/vitest.config.ts` with `test.include = ['src/**/*.test.ts']` so Vitest never tries to run the Playwright `e2e/*.spec.ts` (which use a different runner and would error). `tsc` already ignores `e2e/` because `tsconfig.json`'s `include` is `src`-scoped; the E2E specs are type-checked by Playwright's own tooling when installed.

## Risks / Trade-offs

- [Live ROVODEV-36 can change or its attachment links can expire, making disk assertions flaky] → Mitigation: assert structural invariants (folder exists, `.md` present, `media/NN-` prefix pattern) rather than exact byte content; treat attachment-fetch failures as the FR-12 success-with-caveats path, which is itself a valid assertion.
- [Extension id is dynamic per load] → Mitigation: resolve it at runtime from the service worker URL before opening the popup, never hardcode.
- [Cannot run here (no headed browser / browser binaries / network to live ticket)] → Mitigation: this change lands the scaffold and documents the exact run steps; execution + demo recording are the human step, mirrored after `popup-wiring`'s manual task 6.2.
- [Adding `@playwright/test` without installing could break `npm run test`/lint] → Mitigation: Vitest scoped to `src/`; `tsc` scoped to `src/`; ESLint (non-type-checked) parses the specs without resolving the import. Installing `@playwright/test` + `npx playwright install chromium` is a documented prerequisite for the run.
