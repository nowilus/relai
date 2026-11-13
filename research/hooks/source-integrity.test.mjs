import { test } from 'node:test'
import assert from 'node:assert/strict'
import * as citations from './citations.mjs'

test('quick report cannot claim a source without a read page', () => {
  assert.equal(citations.validateQuickCitations('An unsupported claim.', []), false)
  assert.equal(citations.validateQuickCitations('A finding [1].', [{ url: 'https://example.org', read: true }]), true)
})

test('deep merge preserves source identity and labels unread sources', () => {
  assert.equal(typeof citations.mergeDeepSources, 'function', 'deep source merge must exist')
  const result = citations.mergeDeepSources([
    { text: 'First [1]', sources: [{ url: 'https://a.example', read: true }] },
    { text: 'Second [1]', sources: [{ url: 'https://b.example', read: false }] },
  ])
  assert.match(result.text, /Second \[2\]/)
  assert.equal(result.sources[1].read, false)
  assert.match(result.sources[1].label, /unverified/i)
})

test('deep merge rejects citations outside the originating part', () => {
  assert.throws(() => citations.mergeDeepSources([
    { text: 'First [1]', sources: [{ url: 'https://a.example', read: true }] },
    { text: 'Invalid [2]', sources: [{ url: 'https://b.example', read: false }] },
  ]), /citation/i)
})
