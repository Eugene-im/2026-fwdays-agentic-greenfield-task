import type { ParseResult } from '../lib/jira-parser'

export const PARSE_RESULT_MESSAGE = 'ticket2md:parse-result' as const

export interface TicketParseMessage {
  type: typeof PARSE_RESULT_MESSAGE
  result: ParseResult
}

export function isTicketParseMessage(value: unknown): value is TicketParseMessage {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as { type?: unknown }).type === PARSE_RESULT_MESSAGE
  )
}
