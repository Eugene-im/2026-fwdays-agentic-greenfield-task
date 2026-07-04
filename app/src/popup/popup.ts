type PopupState = 'idle' | 'progress' | 'success' | 'error'

function setState(state: PopupState): void {
  document.body.dataset['state'] = state
}

// --- Dev-only state preview -------------------------------------------------
// Lets the 4 popup states (docs/DESIGN.md) be reviewed visually before any
// real export logic exists. Only mounted in dev builds (`npm run dev`) via
// `import.meta.env.DEV` — never present in `npm run build` output. Remove
// this block entirely once `popup-wiring` drives state from real export
// progress/results instead of manual clicks.
if (import.meta.env.DEV) {
  const states: PopupState[] = ['idle', 'progress', 'success', 'error']
  const devToggle = document.createElement('div')
  devToggle.id = 'dev-toggle'
  devToggle.innerHTML =
    '<small>Dev preview (not shipped in build):</small><div></div>'
  const buttonRow = devToggle.querySelector('div')!
  for (const state of states) {
    const button = document.createElement('button')
    button.type = 'button'
    button.textContent = state
    button.addEventListener('click', () => setState(state))
    buttonRow.appendChild(button)
  }
  document.querySelector('main')!.appendChild(devToggle)
}
