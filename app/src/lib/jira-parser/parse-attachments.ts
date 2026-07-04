import type { ParsedAttachment } from './types'

export function parseAttachments(root: ParentNode): ParsedAttachment[] {
  const container = root.querySelector('#attachmentmodule')
  if (!container) return []

  return Array.from(container.querySelectorAll('a.attachment-title'))
    .map((a) => {
      const name = a.textContent?.trim()
      const url = a.getAttribute('href')
      return name && url ? { name, url } : undefined
    })
    .filter((attachment): attachment is ParsedAttachment => Boolean(attachment))
}
