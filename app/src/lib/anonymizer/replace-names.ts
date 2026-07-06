function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function buildReplacementRegex(aliasMap: Map<string, string>): RegExp | undefined {
  if (aliasMap.size === 0) return undefined
  const names = Array.from(aliasMap.keys()).sort((a, b) => b.length - a.length)
  const pattern = names.map(escapeRegExp).join('|')
  // Unicode-aware boundaries: \b in JS only matches ASCII word chars.
  return new RegExp(`(?<![\\p{L}\\p{N}_])(?:${pattern})(?![\\p{L}\\p{N}_])`, 'gu')
}

export function replaceNames(text: string, aliasMap: Map<string, string>): string {
  const regex = buildReplacementRegex(aliasMap)
  if (!regex) return text
  return text.replace(regex, (match) => aliasMap.get(match) ?? match)
}

/** Replaces names in HTML text nodes only — attribute values (e.g. href) are left untouched. */
export function replaceNamesInHtml(html: string, aliasMap: Map<string, string>): string {
  if (aliasMap.size === 0) return html

  let result = ''
  let i = 0
  while (i < html.length) {
    if (html[i] === '<') {
      const close = html.indexOf('>', i)
      if (close === -1) {
        result += html.slice(i)
        break
      }
      result += html.slice(i, close + 1)
      i = close + 1
    } else {
      const nextTag = html.indexOf('<', i)
      const textEnd = nextTag === -1 ? html.length : nextTag
      result += replaceNames(html.slice(i, textEnd), aliasMap)
      i = textEnd
    }
  }
  return result
}
