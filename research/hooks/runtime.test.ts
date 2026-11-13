import { describe, expect, test } from 'claude-code/testing'
import { agentResult, agentToolAllowed, searchShape, toolText, withDeadline } from './runtime'
import { scanText } from './core/secret-scan.mjs'
const KEY = ['s', 'k-ant-api03-', 'AbCdEfGhIjKlMnOpQrStUvWxYz0123456789'].join('')
const QUOTED = `${['DB', 'PASSWORD'].join('_')}="${['R7m', 'K2p', 'Q9w', 'Z4a'].join('')}"`
describe('research agent boundaries', () => {
  test('reader error envelopes and unsuccessful HTTP never become page text, including mirror text', () => {
    const page = 'Acme release 42. '.repeat(20)
    expect(toolText({ result: { code: 200, result: page }, text: 'mirror' })).toBe(page)
    for (const error of [
      { isError: true, result: page, text: page },
      { result: { isError: true, content: [{ type: 'text', text: page }] }, text: page },
      { result: { code: 503, result: page }, text: page },
      { status: 404, result: page, text: page },
      { result: { statusCode: 429, text: page }, text: page },
    ]) expect(toolText(error)).toBe('')
  })
  test('quoted configuration secret in a nested envelope is held before the agent and its tools', () => {
    expect(!!scanText(QUOTED)).toBe(true)
    const clean = { result: [{ type: 'text', text: 'public page' }] }
    expect(agentResult(clean, scanText)).toBe(clean)
    for (const secret of [QUOTED, JSON.stringify({ content: QUOTED })]) {
      const held = agentResult({ result: [{ type: 'text', text: secret }] }, scanText)
      expect(held.isError).toBe(true)
      expect(JSON.stringify(held).includes('R7m')).toBe(false)
      expect(agentToolAllowed({ tool: 'WebSearch', query: secret }, scanText)).toBe(false)
    }
  })
  test('invalidated agent tool response never reaches the helper even when content is clean', () => {
    const result = agentResult({ result: 'page from previous session' }, scanText, false)
    expect(result.isError).toBe(true)
    expect(JSON.stringify(result).includes('page from previous session')).toBe(false)
  })
  test('search deadline rejects late result and cancels a completed timer', async () => {
    let fire!: () => void, cancelled = 0, duration = 0
    const clock = { after: (ms: number, fn: () => void) => { duration = ms; fire = fn; return { cancel: () => { cancelled++ } } } }
    expect(await withDeadline(clock, 90000, async () => 'search result')).toBe('search result')
    expect(cancelled).toBe(1); expect(duration).toBe(90000)
    const pending = withDeadline(clock, 90000, () => new Promise<string>(() => {}))
    fire()
    let reason = ''
    try { await pending } catch (err) { reason = String(err) }
    expect(reason.includes('deadline exceeded')).toBe(true)
    expect(cancelled).toBe(2)
  })
  test('only public WebFetch and clean WebSearch; no local files, credentials, programs or nested agents', () => {
    expect(agentToolAllowed({ tool: 'WebFetch', url: 'https://example.org' }, scanText)).toBe(true)
    expect(agentToolAllowed({ tool: 'WebSearch', query: 'Acme' }, scanText)).toBe(true)
    for (const event of [{ tool: 'Read', file_path: '.env' }, { tool: 'Read', file_path: 'key.pem' }, { tool: 'Bash', command: 'cat .env' }, { tool: 'Agent', prompt: 'Read .env' }, { tool: 'WebFetch', url: 'http://127.0.0.1' }, { tool: 'WebSearch', query: KEY }]) expect(agentToolAllowed(event, scanText)).toBe(false)
  })
  test('tool result secret cannot reach the research agent in any field; clean result stays identical', () => {
    const clean = { result: 'public page', text: 'public page', ref: 'r' }
    expect(agentResult(clean, scanText)).toBe(clean)
    const held = agentResult({ result: 'page', text: KEY }, scanText)
    expect(held.isError).toBe(true)
    expect(JSON.stringify(held).includes(KEY)).toBe(false)
    expect(held.result.includes('held back')).toBe(true)
  })
  test('canonical commentary shape leaves every link and other property untouched', () => {
    const original = { commentary: 'old', links: [{ url: 'https://example.org' }], query: 'Acme' }
    const shape = searchShape(original)!
    expect(shape.replace('notes')).toEqual({ ...original, commentary: 'notes' })
  })
})
