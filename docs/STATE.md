# Project State

Last updated: 2026-07-04 (anonymizer change implemented, archived, and committed)

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
- [ ] Popup wiring: connect real extraction/anonymization/downloads to the popup shell (OpenSpec change `popup-wiring`) — next in line
- [ ] Downloads flow: folder structure + media `01-` prefixes (FR-13…FR-17)
- [ ] Playwright E2E harness (OpenSpec change `playwright-e2e`) against live ROVODEV-36; can double as the demo-video source (`video: 'on'`)
- [ ] Homework wrap-up: 1–2 min demo video, PR with template + practices description

## Next step
Run `/opsx:propose popup-wiring` — connect `jira-parser` + `markdown-serializer` + `anonymizer` to the real popup: `chrome.scripting` to run the parser in the active tab, checkbox-driven anonymization, `chrome.downloads` for the `.md` + `media/` folder, and the FR-12 partial-success error contract.

## Notes
- Resolve `proposed` items in requirements.md as they get confirmed (FR-04, FR-14, FR-20, NFR-04, product name).
- Media URLs may expire (bucket links) — failure path is a first-class scenario, not an edge case.
- Node 20.19+ required (`app/.nvmrc` pins 20.19.5); repo's system Node was 20.18.1 and failed native-binding install for Vite/Rolldown until upgraded via nvm.
- `examples/` is now tracked in git (was gitignored, contradicting docs' claim it already shipped); the 24MB `_files/` sidecar per fixture stays gitignored — only the `.html` fixture itself is committed.
- A `PostToolUse`/`Bash` git hook (`.claude/hooks/git-commit-on-archive.sh`) auto-commits `openspec/` after an OpenSpec archive operation, scoped strictly to that pathspec.
