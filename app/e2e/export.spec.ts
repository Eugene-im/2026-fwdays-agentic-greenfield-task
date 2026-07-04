import { test as base, expect, chromium, type BrowserContext } from '@playwright/test'
import { fileURLToPath } from 'node:url'
import crypto from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const DIST_PATH = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist')
const TICKET_URL = 'https://jira.atlassian.com/browse/ROVODEV-36'
const TICKET_KEY = 'ROVODEV-36'

interface DistManifest {
  key?: string
  host_permissions?: string[]
}

function readDistManifest(): DistManifest {
  if (!fs.existsSync(DIST_PATH)) {
    throw new Error(`Extension build not found at ${DIST_PATH}. Run "npm run build:e2e" first.`)
  }
  return JSON.parse(fs.readFileSync(path.join(DIST_PATH, 'manifest.json'), 'utf8')) as DistManifest
}

interface Fixtures {
  context: BrowserContext
  extensionId: string
  downloadsDir: string
}

const test = base.extend<Fixtures>({
  // eslint-disable-next-line no-empty-pattern
  downloadsDir: async ({}, use) => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ticket2md-e2e-'))
    await use(dir)
    fs.rmSync(dir, { recursive: true, force: true })
  },

  context: async ({ downloadsDir }, use) => {
    const manifest = readDistManifest()
    // activeTab (the production grant) only comes from a real toolbar click,
    // which automation can't produce — the E2E build substitutes a host
    // permission for the reference Jira host (see manifest.config.ts).
    if (!manifest.host_permissions?.some((p) => p.includes('jira.atlassian.com'))) {
      throw new Error('dist/ is a production build without the E2E host permission. Run "npm run build:e2e" first.')
    }
    const context = await chromium.launchPersistentContext('', {
      headless: false,
      args: [`--disable-extensions-except=${DIST_PATH}`, `--load-extension=${DIST_PATH}`],
    })

    // Playwright's default download interception saves files under GUID names
    // (and deletes them on context close), discarding the relative `filename`
    // paths chrome.downloads.download() provides — which would erase the
    // Downloads/<KEY>/media/ layout under test (FR-15…FR-17). Playwright sets
    // its behavior on a browser-level CDP session, so overriding it from a
    // page-level session doesn't stick: the override must go through a
    // browser-level session too, issued after Playwright's own, and stay
    // attached for the whole test (CDP reverts download behavior on detach).
    const browser = context.browser()
    if (!browser) {
      throw new Error('Persistent context did not expose a Browser to attach a CDP session to.')
    }
    const cdp = await browser.newBrowserCDPSession()
    await cdp.send('Browser.setDownloadBehavior', {
      behavior: 'allow',
      downloadPath: downloadsDir,
      eventsEnabled: false,
    })

    await use(context)
    await context.close()
  },

  // eslint-disable-next-line no-empty-pattern
  extensionId: async ({}, use) => {
    // Derived deterministically from the public `key` pinned in the manifest —
    // the same algorithm Chrome uses: first 16 bytes of SHA-256(DER public
    // key), each hex digit mapped 0-f → a-p.
    const manifest = readDistManifest()
    if (!manifest.key) {
      throw new Error('Built manifest has no `key`; cannot derive a deterministic extension id.')
    }
    const digest = crypto.createHash('sha256').update(Buffer.from(manifest.key, 'base64')).digest('hex').slice(0, 32)
    await use([...digest].map((hex) => String.fromCharCode(97 + parseInt(hex, 16))).join(''))
  },
})

test.describe('Ticket2MD end-to-end export', () => {
  test('popup opens, sees the ticket tab, and exports it to disk', async ({ context, extensionId, downloadsDir }) => {
    const popupUrl = `chrome-extension://${extensionId}/src/popup/index.html`
    let popup!: Awaited<ReturnType<BrowserContext['newPage']>>

    await test.step('1. The extension popup page opens and renders the idle UI', async () => {
      popup = await context.newPage()
      await popup.goto(popupUrl)
      await expect(popup.locator('h1')).toHaveText('Export ticket to MD')
      await expect(popup.locator('#anonymize')).toBeChecked()
      await expect(popup.locator('#export-btn')).toBeVisible()
    })

    await test.step('2. With a ticket tab open, the popup detects it and enables Export (FR-04, FR-05)', async () => {
      const ticketPage = await context.newPage()
      await ticketPage.goto(TICKET_URL, { waitUntil: 'domcontentloaded' })
      // The popup checks the active tab on load; make the ticket the active
      // tab (as it is under a real toolbar click) and re-run the check.
      await ticketPage.bringToFront()
      await popup.reload()
      await expect(popup.locator('#export-btn')).toBeEnabled({ timeout: 10_000 })
    })

    await test.step('3. Export produces the folder, Markdown, media prefixes, and anonymized names', async () => {
      await popup.locator('#export-btn').click()
      await expect(popup.locator('body')).toHaveAttribute('data-state', 'success', { timeout: 60_000 })

      // Downloads/<KEY>/<KEY>-<title>.md + media/NN-… (FR-13, FR-15, FR-16, FR-18).
      const ticketDir = path.join(downloadsDir, TICKET_KEY)
      await expect.poll(() => fs.existsSync(ticketDir), { timeout: 30_000 }).toBe(true)

      const files = fs.readdirSync(ticketDir)
      const mdFile = files.find((f) => f.startsWith(`${TICKET_KEY}-`) && f.endsWith('.md'))
      expect(mdFile, 'a <KEY>-<title>.md file should exist').toBeTruthy()

      const mediaDir = path.join(ticketDir, 'media')
      if (fs.existsSync(mediaDir)) {
        for (const entry of fs.readdirSync(mediaDir)) {
          expect(entry, 'media files carry an NN- prefix').toMatch(/^\d{2}-/)
        }
      }

      // Anonymization on by default: UserN aliases present (FR-19).
      const markdown = fs.readFileSync(path.join(ticketDir, mdFile as string), 'utf8')
      expect(markdown).toMatch(/User\d+/)
    })
  })
})
