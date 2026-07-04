import type { ParsedTicket } from '../jira-parser'

export function collectNames(ticket: ParsedTicket): string[] {
  const names: string[] = []
  const seen = new Set<string>()

  function add(name: string | undefined): void {
    if (!name || seen.has(name)) return
    seen.add(name)
    names.push(name)
  }

  add(ticket.assignee)
  add(ticket.reporter)
  for (const comment of ticket.comments) {
    add(comment.author)
  }

  return names
}
