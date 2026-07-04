import { defineManifest } from '@crxjs/vite-plugin'
import pkg from './package.json'

export default defineManifest({
  manifest_version: 3,
  name: 'Ticket2MD',
  version: pkg.version,
  description: 'Export the open Jira ticket to a self-contained Markdown folder — locally, anonymized by default.',
  action: {
    default_popup: 'src/popup/index.html',
  },
  icons: {
    16: 'icons/icon-16.png',
    32: 'icons/icon-32.png',
    48: 'icons/icon-48.png',
    128: 'icons/icon-128.png',
  },
  permissions: ['activeTab', 'scripting', 'downloads'],
})
