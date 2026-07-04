# Project State

Last updated: 2026-07-04 (popup-wiring archived; playwright-e2e proposed + scaffolded, run pending)

## Plan
- [x] Product docs — `docs/product-brief.md`, `docs/requirements.md` (FR-01…FR-21, NFR-01…NFR-07), `docs/DESIGN.md`
- [x] Agent rules — `AGENTS.md`, imported by `CLAUDE.md`
- [x] E2E test cases — `docs/e2e-test-cases.md` (TC-01…TC-17, traced to FR/NFR)
- [x] OpenSpec adopted — `openspec/` (schema spec-driven), `.claude/commands/opsx/*`
- [x] Scaffold extension in `app/` — Vite + CRXJS, MV3, TS strict, Pico CSS (OpenSpec change `scaffold-extension`, archived, 16/16 tasks done, manually verified: unpacked load, console clean, all 4 popup states match DESIGN.md)
- [x] Toolbar icon "md" (SVG → 16/32/48/128, graphite + azure arrow per DESIGN.md)
- [x] Popup UI shell: 4 states per DESIGN.md (FR-05…FR-09) — **static only**, no real logic yet; dev-only state switcher in `npm run dev`, stripped from prod build
- [x] Fill Commands section in `AGENTS.md` (build/lint/typecheck/test, all <60s combined)
- [x] Jira DOM parser — `app/src/lib/jira-parser/` (OpenSpec change `jira-parser`, archived, 17/17 tasks done): parses key/title/type/status/resolution/priority/components/labels/description/people/dates/comments/attachments; 21 Vitest tests (real ROVODEV-36 fixture + hand-authored fixtures for fields the real page lacks) — implements FR-01, FR-02, parsing portion of FR-10
- [x] Markdown serializer — `app/src/lib/markdown-serializer/` (OpenSpec change `markdown-serializer`, archived, 15/15 tasks done): `serializeTicketToMarkdown` + `planAttachmentNames`, uses `turndown` for inline HTML→Markdown; 39 Vitest tests — implements FR-10, FR-13, FR-14
- [x] Anonymizer — `app/src/lib/anonymizer/` (OpenSpec change `anonymizer`, archived, 14/14 tasks done): `anonymizeTicket` builds alias map from structured name fields (assignee/reporter/comment authors), replaces consistently across text + attachment names; 51 Vitest tests — implements FR-19, FR-21 (FR-20 remains `proposed`)
- [x] Popup wiring + downloads flow — `app/src/popup/`, `app/src/content-scripts/`, `app/src/lib/export-naming/`, `app/src/lib/ticket-url/` (OpenSpec change `popup-wiring`, archived, 20/21 tasks done): Export click → `chrome.scripting` injects `extract-ticket` to run `parseJiraTicket` in the active tab (FR-02) → optional `anonymizeTicket` per checkbox (FR-09, FR-19) → `serializeTicketToMarkdown` + `planAttachmentNames` → `chrome.downloads` writes `Downloads/<KEY>/<KEY>-<title>.md` + `media/NN-…` separately (FR-10…FR-18); per-attachment failures tracked independently → success-with-caveats, never aborting (FR-12); FR-04 ticket detection on open; dev-only switcher removed. New capability spec `export-flow`; `popup-shell` spec modified. 12 new Vitest tests (`buildExportPaths`, `looksLikeJiraTicketUrl`); build/typecheck/lint/test all green (~3.8s). **Remaining task 6.2 = manual in-browser verification against live ROVODEV-36 (human step, not runnable here).**
- [~] Playwright E2E harness (OpenSpec change `playwright-e2e`, **active/not archived**): proposal + design + specs (`e2e-verification`) + tasks written; harness scaffolded — `app/playwright.config.ts` (headed, `video: 'on'`), `app/e2e/export.spec.ts` (load `dist/` unpacked, drive popup on live ROVODEV-36, assert success + on-disk folder/`media/NN-`/`UserN`), `app/vitest.config.ts` scopes Vitest to `src/` so E2E specs are excluded, `@playwright/test` devDep + `test:e2e` script. Unit toolchain green (63 tests). **Remaining (tasks 5.x, human): `npm install` + `npx playwright install chromium`, then `npm run build && npm run test:e2e` on a machine with a display + network; the run also records the demo video. Archive `playwright-e2e` once the run passes.**
- [ ] Homework wrap-up: 1–2 min demo video (from the E2E run), PR with template + practices description

## Next step
Two human-gated steps remain, both needing a real Chrome + network to the live ticket: (1) manually verify `popup-wiring` task 6.2 (`cd app && npm run build`, load `app/dist/` unpacked via `chrome://extensions`, Export ROVODEV-36, confirm `Downloads/ROVODEV-36/` folder + `.md` + `media/NN-…` + anonymized names + success-with-caveats on a failed attachment); (2) run the `playwright-e2e` harness (tasks 5.x) to auto-verify the same flow and record the demo, then archive `playwright-e2e`. Extension-id resolution is solved: `manifest.config.ts` pins a public `key` (deterministic id `jkkdkcmamdondchhjdnhdkocfchdlcjg`) and `e2e/export.spec.ts` recomputes it from the built manifest — no background worker needed.

## Notes
- Resolve `proposed` items in requirements.md as they get confirmed (FR-04, FR-14, FR-20, NFR-04, product name).
- Media URLs may expire (bucket links) — failure path is a first-class scenario, not an edge case.
- Node 20.19+ required (`app/.nvmrc` pins 20.19.5); repo's system Node was 20.18.1 and failed native-binding install for Vite/Rolldown until upgraded via nvm.
- `examples/` is now tracked in git (was gitignored, contradicting docs' claim it already shipped); the 24MB `_files/` sidecar per fixture stays gitignored — only the `.html` fixture itself is committed.
- A `PostToolUse`/`Bash` git hook (`.claude/hooks/git-commit-on-archive.sh`) auto-commits `openspec/` after an OpenSpec archive operation, scoped strictly to that pathspec.
