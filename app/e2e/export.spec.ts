import { test as base, expect, chromium, type BrowserContext } from '@playwright/test'
import { fileURLToPath } from 'node:url'
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

  extensionId: async ({ context }, use) => {
    // NOTE: resolving the id from a background service worker only works if the
    // MV3 build declares one. The current Ticket2MD build has no background
    // worker (popup-only), so this waits briefly and otherwise surfaces a clear
    // message — a documented prerequisite for the automated run (tasks 5.x).
    let [worker] = context.serviceWorkers()
    if (!worker) {
      worker = await context.waitForEvent('serviceworker', { timeout: 5_000 }).catch(() => undefined as never)
    }
    if (!worker) {
      throw new Error(
        'Could not resolve the extension id from a service worker. Add a background ' +
          'service worker to the build, or resolve the id via chrome://extensions before running.',
      )
    }
    await use(new URL(worker.url()).host)
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
