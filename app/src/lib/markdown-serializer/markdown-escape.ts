const MARKDOWN_SPECIAL = /[\\`*_[\]]/g

export function escapeMarkdown(text: string): string {
  return text.replace(MARKDOWN_SPECIAL, (match) => `\\${match}`)
}
