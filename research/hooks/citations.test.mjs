import { test } from 'node:test'
import assert from 'node:assert/strict'

import * as citations from './citations.mjs'

test('quick citations refer only to pages actually read', () => {
  assert.equal(typeof citations.validateQuickCitations, 'function', 'citation validation must exist')
  const sources = [
    { url: 'https://example.org/read', read: true },
    { url: 'https://example.org/unread', read: false },
  ]
  assert.equal(citations.validateQuickCitations('Fact [1]', sources), true)
  assert.equal(citations.validateQuickCitations('Fact [2]', sources), false)
  assert.equal(citations.validateQuickCitations('Fact [3]', sources), false)
})
