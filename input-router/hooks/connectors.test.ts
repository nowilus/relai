import { describe, expect, test } from 'claude-code/testing'
import { CONNECTOR_CHUNK_CHARS, CONNECTOR_MAX_CHUNKS, CONNECTOR_MIN_CHARS, CONNECTOR_PROMPT_CHARS, TRIMMED_MAX_CHARS, UNTOUCHED, asBlocks, connectorChunks, connectorRoute, cutValues, dropEmpty, isUntouched, localResult, serverOf, textOfBlocks } from './connectors'
import { ARGS_CHARS, ASK_CHARS, notesPrompt } from './notes'

// The pure part of relai-input-router for MCP connectors (plan MODY_OSZCZEDZANIA, E4; spec,
// section 1). Result shapes as the probe E4 saw them (POMIAR_E4.md): one text block.

const blocks = (text: string) => [{ type: 'text', text }]
const plain = (n: number) => Array.from({ length: Math.ceil(n / 50) + 1 }, (_, i) => `line ${i} `.padEnd(49, 'x')).join('\n').slice(0, n)

describe('connectors: untouched list (rule 3: negative proof)', () => {
  test('the list is exactly the spec list — a change to it reddens here', () => {
    expect([...UNTOUCHED]).toEqual(['ccd', 'claude_browser', 'playwright', 'computer_use', 'terminal', 'visualize', 'scheduled_tasks', 'mcp_registry', 'mods'])
  })
  test('every spec connector and every RelAI connector is untouched, whatever the size', () => {
    const big = blocks(plain(40_000))
    for (const tool of [
      'mcp__ccd_session__start_session', 'mcp__ccd_view__show_pane', 'mcp__ccd_session_mgmt__list_sessions',
      'mcp__Claude_Browser__get_page_text', 'mcp__Claude_Browser__read_page', 'mcp__playwright__browser_snapshot',
      'mcp__plugin_playwright_playwright__browser_navigate', 'mcp__computer-use__screenshot', 'mcp__terminal__read_terminal',
      'mcp__visualize__show_widget', 'mcp__scheduled-tasks__list_scheduled_tasks', 'mcp__mcp-registry__search_mcp_registry',
      'mcp__mods__call', 'mcp__relai_panel__state', 'mcp__relai-panel__docs',
    ]) {
      expect(isUntouched(tool)).toBe(true)
      expect(connectorRoute(tool, big)).toEqual({ kind: 'pass', why: 'untouched connector' })
    }
  })
  test('an ordinary connector is not untouched; a lookalike name is not a segment match', () => {
    for (const tool of ['mcp__claude_ai_Gmail__search', 'mcp__1a59c906-04da-521d-bda7-7f71b9f9e01c__guide', 'mcp__github__list_issues', 'mcp__terminals_pro__x', 'mcp__accdb__query']) {
      expect(isUntouched(tool)).toBe(false)
    }
  })
  test('"mods" read as the tools of mods and plugins: plugin_* servers and enabled plugin names are untouched', () => {
    const big = blocks(plain(40_000))
    expect(isUntouched('mcp__plugin-authoring__scan_secrets')).toBe(true)
    expect(isUntouched('mcp__plugin_context7_context7__query-docs')).toBe(true)
    expect(isUntouched('mcp__token-saving__x', ['token-saving', 'caveman'])).toBe(true)
    expect(isUntouched('mcp__token-saving__x')).toBe(false)
    expect(connectorRoute('mcp__caveman__x', big, false, ['caveman']).kind).toBe('pass')
  })
  test('server of a tool name; not an MCP tool → untouched', () => {
    expect(serverOf('mcp__Claude_Browser__computer')).toBe('claude_browser')
    expect(serverOf('mcp__scheduled-tasks__list')).toBe('scheduled_tasks')
    expect(serverOf('Read')).toBe('')
    expect(isUntouched('Read')).toBe(true)
  })
})

describe('connectors: the road', () => {
  const T = 'mcp__github__list_issues'
  test('under 16 000 characters → whole; at 16 000 → handled', () => {
    expect(connectorRoute(T, blocks(plain(CONNECTOR_MIN_CHARS - 1))).kind).toBe('pass')
    expect(connectorRoute(T, blocks(plain(CONNECTOR_MIN_CHARS))).kind).toBe('notes')
  })
  test('not only text, an error, or no blocks → whole', () => {
    expect(connectorRoute(T, [...blocks(plain(40_000)), { type: 'image', data: 'x' }]).kind).toBe('pass')
    expect(connectorRoute(T, blocks(plain(40_000)), true).kind).toBe('pass')
    expect(connectorRoute(T, []).kind).toBe('pass')
    expect(connectorRoute(T, { content: blocks(plain(40_000)) }).kind).toBe('pass')
  })
  test('JSON with empty fields → trimmed under 8000, no helper', () => {
    const rows = Array.from({ length: 150 }, (_, i) => ({ id: i, title: `t${i}`, body: '', labels: [], meta: {}, closed: null, assignee: null, milestone: null, notes: '', extra: { a: null } }))
    const text = JSON.stringify(rows, null, 2)
    expect(text.length).toBeGreaterThan(CONNECTOR_MIN_CHARS)
    const r = connectorRoute(T, blocks(text))
    expect(r.kind).toBe('local')
    if (r.kind !== 'local') return
    expect(r.action).toBe('trim')
    expect(r.text.length).toBeLessThanOrEqual(TRIMMED_MAX_CHARS)
    expect(JSON.parse(r.text)[7]).toEqual({ id: 7, title: 't7' })
  })
  test('long text values cut to 1200 when the cut takes ≤ 20% and the result then fits', () => {
    const rows = Array.from({ length: 5 }, (_, i) => ({ id: i, body: 'b'.repeat(1400) })).concat([{ id: 9, body: 'c'.repeat(1100) }])
    const text = JSON.stringify(rows) + ' '.repeat(10_000)
    const r = connectorRoute(T, blocks(text))
    expect(r.kind).toBe('local')
    if (r.kind === 'local') expect(r.action).toBe('cut')
  })
  test('a cut that would take over 20% → helper, not the cut', () => {
    const rows = Array.from({ length: 12 }, (_, i) => ({ id: i, body: 'b'.repeat(3000) }))
    const r = connectorRoute(T, blocks(JSON.stringify(rows)))
    expect(r.kind).toBe('notes')
  })
  test('an integer past 2^53 is never re-serialised: the text goes to the helper as it is', () => {
    const rows = Array.from({ length: 400 }, (_, i) => ({ id: 9007199254740993 + i, body: '', tags: [] }))
    const text = JSON.stringify(rows).replace(/"id":(\d+)/g, (_, d) => `"id":${d}1234`)
    expect(text.length).toBeGreaterThan(CONNECTOR_MIN_CHARS)
    const r = connectorRoute(T, blocks(text))
    expect(r).toEqual({ kind: 'notes', why: `text over ${CONNECTOR_MIN_CHARS} characters`, text })
  })
  test('the helper reads the trimmed view, not the cut one (its copy holds what it saw)', () => {
    const rows = Array.from({ length: 40 }, (_, i) => ({ id: i, body: 'b'.repeat(1300), note: '' }))
    const r = connectorRoute(T, blocks(JSON.stringify(rows)))
    expect(r.kind).toBe('notes')
    if (r.kind === 'notes') expect(r.text.includes('b'.repeat(1300))).toBe(true)
  })
  test('plain text over the threshold → helper with the text itself', () => {
    const t = plain(20_000)
    expect(connectorRoute(T, blocks(t))).toEqual({ kind: 'notes', why: `text over ${CONNECTOR_MIN_CHARS} characters`, text: t })
  })
})

describe('connectors: pieces', () => {
  test('dropEmpty is deep and keeps 0 and false', () => {
    expect(dropEmpty({ a: 0, b: false, c: '', d: { e: null, f: [] }, g: [1, {}] })).toEqual({ a: 0, b: false, g: [1, {}] })
    expect(Object.keys(dropEmpty(JSON.parse('{"__proto__":{"x":1},"y":2}')) as object)).toEqual(['__proto__', 'y'])
  })
  test('cutValues counts what it cuts', () => {
    const c = cutValues({ a: 'x'.repeat(1300), b: ['y'.repeat(10)] })
    expect(c.lost).toBe(100)
    expect((c.value as any).a.length).toBe(1201)
  })
  test('textOfBlocks joins text blocks, refuses anything else', () => {
    expect(textOfBlocks([{ type: 'text', text: 'a' }, { type: 'text', text: 'b' }])).toBe('a\nb')
    expect(textOfBlocks([{ type: 'resource', uri: 'x' }])).toBe(null)
    expect(textOfBlocks('x')).toBe(null)
  })
  test('chunks: 128 000 each, at most 6, a gap line over that; the prompt fits 150 000', () => {
    const line = 'z'.repeat(3000)
    const text = Array.from({ length: 400 }, () => line).join('\n')
    const chunks = connectorChunks(text)
    expect(chunks.length).toBe(CONNECTOR_MAX_CHUNKS)
    for (const c of chunks) expect(c.text.length).toBeLessThanOrEqual(CONNECTOR_CHUNK_CHARS)
    expect(chunks[0].firstLine).toBe(1)
    expect(chunks[5].lastLine).toBe(400)
    expect(chunks[3].text.startsWith('[lines ')).toBe(true)
    expect(chunks[0].text.includes('[line cut]')).toBe(false)
    const prompt = notesPrompt({ what: 'x', ask: 'a'.repeat(ASK_CHARS + 5000), args: 'b'.repeat(ARGS_CHARS + 500), chunk: chunks[0], index: 0, count: chunks.length })
    expect(prompt.length).toBeLessThanOrEqual(CONNECTOR_PROMPT_CHARS)
  })
  test('one line longer than a chunk is split, its pieces keep its number; a small text is one chunk', () => {
    const chunks = connectorChunks(`a\n${'q'.repeat(300_000)}\nb`)
    expect(chunks.length).toBe(4)
    for (const c of chunks) expect(c.text.length).toBeLessThanOrEqual(CONNECTOR_CHUNK_CHARS)
    expect(chunks.map((c) => c.text.length).reduce((n, x) => n + x, 0)).toBeGreaterThan(300_000)
    expect(chunks[1].firstLine).toBe(2)
    expect(chunks[3].lastLine).toBe(3)
    expect(connectorChunks('x\ny')).toEqual([{ text: '1\tx\n2\ty', firstLine: 1, lastLine: 2 }])
  })
  test('the local result names the copy and goes back as one text block', () => {
    const t = localResult({ tool: 'mcp__github__list_issues', action: 'trim', text: '[1]', before: 5000, copyPath: 'C:/c.txt' })
    expect(t.startsWith('[RelAI input-router] mcp__github__list_issues: empty fields dropped')).toBe(true)
    expect(t.includes('Full result: C:/c.txt')).toBe(true)
    expect(asBlocks(t)).toEqual([{ type: 'text', text: t }])
  })
})
