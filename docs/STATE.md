# Project State

Last updated: 2026-07-04 (scaffold-extension change implemented and manually verified; OpenSpec adopted for change management)

## Plan
- [x] Product docs — `docs/product-brief.md`, `docs/requirements.md` (FR-01…FR-21, NFR-01…NFR-07), `docs/DESIGN.md`
- [x] Agent rules — `AGENTS.md`, imported by `CLAUDE.md`
- [x] E2E test cases — `docs/e2e-test-cases.md` (TC-01…TC-17, traced to FR/NFR)
- [x] OpenSpec adopted — `openspec/` (schema spec-driven), `.claude/commands/opsx/*`
- [x] Scaffold extension in `app/` — Vite + CRXJS, MV3, TS strict, Pico CSS (OpenSpec change `scaffold-extension`, 16/16 tasks done, manually verified: unpacked load, console clean, all 4 popup states match DESIGN.md)
- [x] Toolbar icon "md" (SVG → 16/32/48/128, graphite + azure arrow per DESIGN.md)
- [x] Popup UI shell: 4 states per DESIGN.md (FR-05…FR-09) — **static only**, no real logic yet; dev-only state switcher in `npm run dev`, stripped from prod build
- [x] Fill Commands section in `AGENTS.md` (build/lint/typecheck/test, all <60s combined)
- [ ] `lib/` core: Jira DOM parser (fixture exists in `examples/`), Markdown serializer, anonymizer — next OpenSpec changes: `jira-parser` → `markdown-serializer` → `anonymizer`
- [ ] Popup wiring: connect real extraction/anonymization/downloads to the popup shell (OpenSpec change `popup-wiring`)
- [ ] Downloads flow: folder structure + media `01-` prefixes (FR-13…FR-17)
- [ ] Vitest suite incl. failure path (FR-12) — currently `npm run test` passes with zero tests (`--passWithNoTests`)
- [ ] Playwright E2E harness (OpenSpec change `playwright-e2e`) against live ROVODEV-36; can double as the demo-video source (`video: 'on'`)
- [ ] Homework wrap-up: 1–2 min demo video, PR with template + practices description

## Next step
Run `/opsx:archive scaffold-extension`, then `/opsx:propose` the `jira-parser` change (DOM parser against the ROVODEV-36 fixture in `examples/`).

## Notes
- Resolve `proposed` items in requirements.md as they get confirmed (FR-04, FR-14, FR-20, NFR-04, product name).
- Media URLs may expire (bucket links) — failure path is a first-class scenario, not an edge case.
- Node 20.19+ required (`app/.nvmrc` pins 20.19.5); repo's system Node was 20.18.1 and failed native-binding install for Vite/Rolldown until upgraded via nvm.
