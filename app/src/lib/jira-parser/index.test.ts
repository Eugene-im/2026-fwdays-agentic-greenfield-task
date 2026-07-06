// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { parseJiraTicket } from './index'
import { loadRovodev36Document, parseFragment } from './test-fixtures'

describe('parseJiraTicket — real ROVODEV-36 fixture', () => {
  const result = parseJiraTicket(loadRovodev36Document())

  it('parses key and title', () => {
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.ticket.key).toBe('ROVODEV-36')
    expect(result.ticket.title).toBe('Gitlab SaaS integration with Rovo Dev')
  })

  it('parses type and resolution', () => {
    if (!result.ok) throw new Error('expected successful parse')
    expect(result.ticket.type).toContain('Suggestion')
    expect(result.ticket.resolution?.trim()).toBe('Unresolved')
  })

  it('parses status via the legacy opsbar fallback selector (no #status-val in this template)', () => {
    if (!result.ok) throw new Error('expected successful parse')
    expect(result.ticket.status).toBe('Gathering Interest')
  })

  it('parses components', () => {
    if (!result.ok) throw new Error('expected successful parse')
    expect(result.ticket.components).toEqual(['Rovo Dev CLI'])
  })

  it('leaves priority and labels empty — this ticket type has neither field configured', () => {
    if (!result.ok) throw new Error('expected successful parse')
    expect(result.ticket.priority).toBeUndefined()
    expect(result.ticket.labels).toEqual([])
  })

  it('parses assignee and reporter', () => {
    if (!result.ok) throw new Error('expected successful parse')
    expect(result.ticket.assignee).toBe('Federico Ciner')
    expect(result.ticket.reporter).toBe('Seerat')
  })

  it('parses created/updated as ISO timestamps from the <time datetime> attribute', () => {
    if (!result.ok) throw new Error('expected successful parse')
    expect(result.ticket.created).toBe('2026-06-18T07:51:20+0000')
    expect(result.ticket.updated).toBe('2026-06-18T08:07:17+0000')
  })

  it('returns an empty comments array — this ticket has none', () => {
    if (!result.ok) throw new Error('expected successful parse')
    expect(result.ticket.comments).toEqual([])
  })

  it('returns an empty attachments array — this ticket has none', () => {
    if (!result.ok) throw new Error('expected successful parse')
    expect(result.ticket.attachments).toEqual([])
  })

  it('parses description as non-empty structured blocks', () => {
    if (!result.ok) throw new Error('expected successful parse')
    expect(result.ticket.description.length).toBeGreaterThan(0)
    expect(result.ticket.description[0]).toMatchObject({ kind: 'heading', level: 3 })
  })
})

describe('parseJiraTicket — failure path', () => {
  it('reports failure when key is missing', () => {
    const doc = parseFragment('<div id="summary-val"><h2>Title only</h2></div>')
    const result = parseJiraTicket(doc)
    expect(result.ok).toBe(false)
  })

  it('reports failure when title is missing', () => {
    const doc = parseFragment('<a id="key-val">PROJ-1</a>')
    const result = parseJiraTicket(doc)
    expect(result.ok).toBe(false)
  })

  it('reports failure on a completely unrelated page', () => {
    const doc = parseFragment('<html><body><h1>Not Jira</h1></body></html>')
    const result = parseJiraTicket(doc)
    expect(result.ok).toBe(false)
  })
})

describe('parseJiraTicket — hand-authored fixtures for fields absent from the real page', () => {
  it('parses priority and labels when present', () => {
    const doc = parseFragment(`
      <a id="key-val">PROJ-2</a>
      <div id="summary-val"><h2>Ticket with priority and labels</h2></div>
      <span id="priority-val">High</span>
      <span id="labels-val"><a>backend</a><a>urgent</a></span>
    `)
    const result = parseJiraTicket(doc)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.ticket.priority).toBe('High')
    expect(result.ticket.labels).toEqual(['backend', 'urgent'])
  })

  it('parses comments in DOM order when present', () => {
    const doc = parseFragment(`
      <a id="key-val">PROJ-3</a>
      <div id="summary-val"><h2>Ticket with comments</h2></div>
      <div id="issue_actions_container">
        <div id="comment-1">
          <div class="action-details"><a class="user-hover">Alice</a></div>
          <div class="action-body">First comment</div>
        </div>
        <div id="comment-2">
          <div class="action-details"><a class="user-hover">Bob</a></div>
          <div class="action-body">Second comment</div>
        </div>
      </div>
    `)
    const result = parseJiraTicket(doc)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.ticket.comments).toEqual([
      { author: 'Alice', body: 'First comment' },
      { author: 'Bob', body: 'Second comment' },
    ])
  })

  it('parses attachment metadata (name + URL, no fetch) when present', () => {
    const doc = parseFragment(`
      <a id="key-val">PROJ-4</a>
      <div id="summary-val"><h2>Ticket with attachments</h2></div>
      <div id="attachmentmodule">
        <a class="attachment-title" href="https://example.com/files/screenshot.png">screenshot.png</a>
        <a class="attachment-title" href="https://example.com/files/log.txt">log.txt</a>
      </div>
    `)
    const result = parseJiraTicket(doc)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.ticket.attachments).toEqual([
      { name: 'screenshot.png', url: 'https://example.com/files/screenshot.png' },
      { name: 'log.txt', url: 'https://example.com/files/log.txt' },
    ])
  })

  it('resolves relative attachment hrefs to absolute URLs', () => {
    const doc = parseFragment(`
      <a id="key-val">PROJ-5</a>
      <div id="summary-val"><h2>Relative attachment</h2></div>
      <div id="attachmentmodule">
        <a class="attachment-title" href="/secure/attachment/12345/screenshot.png">screenshot.png</a>
      </div>
    `)
    const result = parseJiraTicket(doc)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.ticket.attachments[0]?.url).toMatch(/\/secure\/attachment\/12345\/screenshot\.png$/)
  })
})
