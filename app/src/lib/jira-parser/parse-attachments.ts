import type { ParsedAttachment } from './types'

function resolveAttachmentUrl(href: string, root: ParentNode): string | undefined {
  try {
    const base =
      root instanceof Document && root.baseURI
        ? root.baseURI
        : root.ownerDocument?.baseURI ?? 'https://jira.example.com/'
    return new URL(href, base).href
  } catch {
    return undefined
  }
}

export function parseAttachments(root: ParentNode): ParsedAttachment[] {
  const container = root.querySelector('#attachmentmodule')
  if (!container) return []

  return Array.from(container.querySelectorAll('a.attachment-title'))
    .map((a) => {
      const name = a.textContent?.trim()
      const href = a.getAttribute('href')
      if (!name || !href) return undefined
      const url = resolveAttachmentUrl(href, root)
      return url ? { name, url } : undefined
    })
    .filter((attachment): attachment is ParsedAttachment => Boolean(attachment))
}
