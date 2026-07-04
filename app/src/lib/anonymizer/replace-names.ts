function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function buildReplacementRegex(aliasMap: Map<string, string>): RegExp | undefined {
  if (aliasMap.size === 0) return undefined
  const names = Array.from(aliasMap.keys()).sort((a, b) => b.length - a.length)
  const pattern = names.map(escapeRegExp).join('|')
  return new RegExp(`\\b(?:${pattern})\\b`, 'g')
}

export function replaceNames(text: string, aliasMap: Map<string, string>): string {
  const regex = buildReplacementRegex(aliasMap)
  if (!regex) return text
  return text.replace(regex, (match) => aliasMap.get(match) ?? match)
}
