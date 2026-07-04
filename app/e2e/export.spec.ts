import { test as base, expect, chromium, type BrowserContext } from '@playwright/test'
import { fileURLToPath } from 'node:url'
import crypto from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const DIST_PATH = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist')
const TICKET_URL = 'https://jira.atlassian.com/browse/ROVODEV-36'
const TICKET_KEY = 'ROVODEV-36'

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
    if (!fs.existsSync(DIST_PATH)) {
      throw new Error(`Extension build not found at ${DIST_PATH}. Run "npm run build" first.`)
    }
    const context = await chromium.launchPersistentContext('', {
      headless: false,
      downloadsPath: downloadsDir,
      args: [`--disable-extensions-except=${DIST_PATH}`, `--load-extension=${DIST_PATH}`],
    })
    await use(context)
    await context.close()
  },

  // eslint-disable-next-line no-empty-pattern
  extensionId: async ({}, use) => {
    // The popup-only MV3 build has no background service worker, so the id is
    // derived deterministically from the public `key` in the built manifest
    // (see manifest.config.ts) — the same algorithm Chrome uses: first 16 bytes
    // of SHA-256(DER public key), each hex digit mapped 0-f → a-p.
    const manifest = JSON.parse(fs.readFileSync(path.join(DIST_PATH, 'manifest.json'), 'utf8')) as { key?: string }
    if (!manifest.key) {
      throw new Error('Built manifest has no `key`; cannot derive a deterministic extension id.')
    }
    const digest = crypto.createHash('sha256').update(Buffer.from(manifest.key, 'base64')).digest('hex').slice(0, 32)
    const id = [...digest].map((hex) => String.fromCharCode(97 + parseInt(hex, 16))).join('')
    await use(id)
  },
})

test.describe('Ticket2MD end-to-end export', () => {
  test('exports the live ticket to a Downloads folder with anonymized Markdown', async ({
    context,
    extensionId,
    downloadsDir,
  }) => {
    const ticketPage = await context.newPage()
    await ticketPage.goto(TICKET_URL, { waitUntil: 'domcontentloaded' })

    const popup = await context.newPage()
    await popup.goto(`chrome-extension://${extensionId}/src/popup/index.html`)

    // Idle → in-progress → success (FR-05…FR-07).
    await popup.locator('#export-btn').click()
    await expect(popup.locator('body')).toHaveAttribute('data-state', 'success', { timeout: 60_000 })

    // On-disk layout: Downloads/<KEY>/<KEY>-<title>.md + media/NN-… (FR-13, FR-15, FR-16, FR-18).
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
