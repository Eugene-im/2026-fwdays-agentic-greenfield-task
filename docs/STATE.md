# Project State

Last updated: 2026-07-04 (scope narrowed to Jira only — Azure DevOps moved to out of scope for MVP; docs and agent rules created; no code yet)

## Plan
- [x] Product docs — `docs/product-brief.md`, `docs/requirements.md` (FR-01…FR-21, NFR-01…NFR-07), `docs/DESIGN.md`
- [x] Agent rules — `AGENTS.md`, imported by `CLAUDE.md`
- [x] E2E test cases — `docs/e2e-test-cases.md` (TC-01…TC-17, traced to FR/NFR)
- [ ] Scaffold extension in `app/` — Vite + CRXJS, MV3, TS strict, Pico CSS
- [ ] `lib/` core: Jira DOM parser (fixture exists in `examples/`), Markdown serializer, anonymizer
- [ ] Popup UI: 4 states per DESIGN.md (FR-05…FR-08)
- [ ] Downloads flow: folder structure + media `01-` prefixes (FR-13…FR-17)
- [ ] Toolbar icon "md" (SVG → 16/32/48/128)
- [ ] Vitest suite incl. failure path (FR-12); fill Commands section in AGENTS.md
- [ ] Manual E2E: load unpacked, export a real ticket
- [ ] Homework wrap-up: 1–2 min demo video, PR with template + practices description

## Next step
Scaffold `app/` with Vite + CRXJS and commit the docs.

## Notes
- Resolve `proposed` items in requirements.md as they get confirmed (FR-04, FR-14, FR-20, NFR-04, product name).
- Media URLs may expire (bucket links) — failure path is a first-class scenario, not an edge case.
