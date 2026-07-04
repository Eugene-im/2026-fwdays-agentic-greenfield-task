import { describe, expect, it } from 'vitest'
import { replaceNames } from './replace-names'
import { buildAliasMap } from './alias-map'

describe('replaceNames', () => {
  it('replaces a known name with its alias', () => {
    const aliasMap = buildAliasMap(['Federico Ciner'])
    expect(replaceNames('Assigned to Federico Ciner for review.', aliasMap)).toBe(
      'Assigned to User1 for review.',
    )
  })

  it('replaces the longer overlapping name, not the shorter one', () => {
    const aliasMap = buildAliasMap(['Ana', 'Ana Maria'])
    const text = replaceNames('Ana Maria approved this, Ana did not.', aliasMap)
    expect(text).toBe('User2 approved this, User1 did not.')
  })

  it('returns the text unchanged when the alias map is empty', () => {
    expect(replaceNames('Nothing to replace here.', new Map())).toBe('Nothing to replace here.')
  })

  it('does not replace a name that only partially matches (word boundary)', () => {
    const aliasMap = buildAliasMap(['Ana'])
    expect(replaceNames('Banana is a fruit.', aliasMap)).toBe('Banana is a fruit.')
  })
})
