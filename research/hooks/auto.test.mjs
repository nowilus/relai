import { test } from 'node:test'
import assert from 'node:assert/strict'
import * as auto from './auto.mjs'

test('auto only compresses large main-chat WebSearch results after all gates pass', () => {
  assert.equal(typeof auto.shouldCompress, 'function')
  const context = { tool: 'WebSearch', agentId: null, text: 'a'.repeat(3201), consent: true, enabled: true, twin: false, secret: false }
  assert.equal(auto.shouldCompress(context), true)
  for (const change of [{ agentId: 'agent' }, { tool: 'Read' }, { text: 'a'.repeat(3200) }, { consent: false }, { enabled: false }, { twin: true }, { secret: true }]) {
    assert.equal(auto.shouldCompress({ ...context, ...change }), false)
  }
})
