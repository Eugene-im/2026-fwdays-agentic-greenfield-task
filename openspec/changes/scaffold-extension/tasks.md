## 1. Project setup

- [ ] 1.1 Scaffold `app/` with Vite + CRXJS, TypeScript strict mode (`tsconfig.json`)
- [ ] 1.2 Add `manifest.json` (MV3) requesting only `activeTab`, `scripting`, `downloads` (NFR-04)
- [ ] 1.3 Add `lib/` folder inside `app/` as the framework-free boundary for future parser/serializer/anonymizer work (no Chrome API imports allowed there)
- [ ] 1.4 Wire Pico CSS into the popup build (CSS variables only, no hardcoded colors)

## 2. Toolbar icon

- [ ] 2.1 Create placeholder "md" wordmark icon
- [ ] 2.2 Export icon at 16/32/48/128 px and reference all four sizes in `manifest.json`

## 3. Popup shell (static, 4 states)

- [ ] 3.1 Build idle state: title "Export ticket to MD", checked-by-default anonymization checkbox, Export button (FR-05)
- [ ] 3.2 Build in-progress state: loader, replacing idle controls (FR-06)
- [ ] 3.3 Build success state: export-succeeded confirmation message (FR-07)
- [ ] 3.4 Build error state: error message + details area (FR-08)
- [ ] 3.5 Confirm the anonymization checkbox never introduces a state beyond these four (FR-09)
- [ ] 3.6 Add a dev-only affordance to switch between the 4 states for manual/visual review (no `chrome.downloads` calls, no DOM parsing) — mark clearly as temporary, to be removed in `popup-wiring`

## 4. Verification

- [ ] 4.1 Load the built extension unpacked in Chrome (`chrome://extensions` → Load unpacked); confirm no console errors (NFR-06)
- [ ] 4.2 Visually confirm all 4 popup states match `docs/DESIGN.md`
- [ ] 4.3 Record the working build / lint / type-check commands in `AGENTS.md` § Commands (each must run under 60s per NFR-06)
- [ ] 4.4 Run `openspec validate scaffold-extension` (or equivalent) and confirm the change is apply-clean
