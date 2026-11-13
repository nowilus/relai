import { describe, expect, mock, test } from 'claude-code/testing'
import type { On } from 'claude-code'

const CWD = 'C:/proj', HOME = 'C:/Users/T', URL = 'https://example.org/release'
const PAGE = 'Acme ship 42, USD 17, 2026-11-13. '.repeat(12)
const ORIGINAL = { query: 'Acme', results: [{ tool_use_id: 'web', content: [{ title: 'Acme', url: URL }] }, PAGE.repeat(15) + URL], durationSeconds: 2 }
const SETTINGS = 'Wersja RelAI: 3.8.0\n| Data | Czego dotyczy | Decyzja |\n|---|---|---|\n| 2026-11-13 | Mody oszczędzania | zgoda |\n'
const KEY = ['s', 'k-ant-api03-', 'AbCdEfGhIjKlMnOpQrStUvWxYz0123456789'].join('')
function world(on: On, opts: { consent?: string, twin?: boolean, home?: string } = {}) {
    const w = {
    disk: { [`${CWD}/docs/USTAWIENIA.md`]: opts.consent === 'missing' ? SETTINGS.split('| 2026-11-13')[0] : opts.consent === 'no' ? SETTINGS.replace('zgoda', 'brak zgody') : SETTINGS,
      [`${HOME}/.claude/settings.json`]: JSON.stringify({ enabledPlugins: { 'research-router@token-saving-mods': !!opts.twin } }) } as Record<string, string>,
    reads: [] as string[], writes: [] as string[], toasts: [] as string[], requests: [] as any[], tools: [] as any[], timers: [] as (() => Promise<void>)[],
    submitted: [] as string[], spawns: [] as any[], originals: [] as any[], process: [] as any[],
    toolResult: ORIGINAL as any, failWrite: false, failHelper: false, duringHelper: null as null | (() => Promise<void>),
    helperText: null as string | null, consentAnswer: 'Yes, in this project', calls: 0, now: 0,
  }
  const norm = (p: string) => p.replace(/\\/g, '/')
  const clock = mock.clock(on, { now: 1000000 })
  mock.store(on, {})
  on('session.start', ($, e) => ({ cwd: e.cwd }))
  on('session.id', () => ({ value: 'test' }))
  on('fs.read', ($, e) => { const p = norm(e.path); w.reads.push(p); return p in w.disk ? { value: w.disk[p] } : { deny: 'ENOENT' } })
  on('fs.write', ($, e) => { const p = norm(e.path); if (w.failWrite) return { deny: 'disk full' }; w.writes.push(p); w.disk[p] = e.text; return { value: undefined } })
  on('process.run', ($, e) => { w.process.push(e); return { value: { exitCode: 0, stdout: opts.home ?? HOME, stderr: '' } } as never })
  on('command.register', () => ({ value: undefined }) as never)
  on('prompt.submit', ($, e) => { if (String((e as any).text).startsWith('[relai-research:')) w.submitted.push((e as any).text); return { text: (e as any).text } as never })
  on('model.complete', async ($, e) => {
    w.requests.push(e); await w.duringHelper?.()
    if (w.failHelper) return { value: { isAnswered: false, reason: 'aborted' } } as never
    const system = String((e as any).system)
    const text = w.helperText ?? (system.includes('Does the page') ? '{"relevant":true}' : system.includes('Return only JSON') ? '{"mode":"quick","queries":["Acme"],"urls":[],"parts":["Release","Cost"],"window":null}' : system.includes('numbered pages') ? '<brief>Acme ship 42 [1]</brief><notes>USD 17, 2026-11-13 [1]</notes>' : system.includes('keeping the existing') ? '<brief>Acme [1]</brief>' : `Acme ship 42, USD 17, 2026-11-13 ${URL}`)
    return { value: { isAnswered: true, text, usage: { input_tokens: 11, output_tokens: 5, cache_read_input_tokens: 2 } } } as never
  })
  on('tool.call', ($, e) => {
    const x: any = e; w.tools.push(x)
    if (e.tool === 'AskUserQuestion') { w.calls++; return { result: { questions: x.questions, answers: { [x.questions[0].question]: w.consentAnswer } } } as never }
    if (e.tool === 'WebFetch') return { result: PAGE } as never
    w.originals.push(w.toolResult)
    return { result: w.toolResult, text: JSON.stringify(w.toolResult), ref: 'original-ref' } as never
  })
  on('tool.list', () => ({ value: [] }) as never)
  on('ui.log', () => ({ value: undefined }) as never)
  on('ui.toast', ($, e) => { w.toasts.push(JSON.stringify(e)); return { value: undefined } as never })
  on('command.run', () => ({ text: 'base command' }) as never)
  on('turn.complete', () => ({ text: '' }) as never)
  on('turn.step', async function* () { return { usage: { input_tokens: 10, output_tokens: 3 }, answer: '', toolUses: [], stopReason: 'end_turn' } as never })
  on('agent.spawn', ($, e) => { w.spawns.push(e); return { model: 'claude-sonnet-5-5', agentId: `agent-${w.spawns.length}` } as never })
  return Object.assign(w, { advance: (ms: number) => clock.advance(ms) })
}
const search = ($: any, fields: any = {}) => $.tool.call({ tool: 'WebSearch', query: 'Acme', tool_use_id: 'web-main', ...fields })
// clock.advance fires owned callbacks; it does not await their asynchronous work.
const drain = async ($: any) => { for (let i = 0; i < 20; i++) await $.command.run({ command: 'relai-research', args: 'stats' }) }
const records = (w: ReturnType<typeof world>) => Object.entries(w.disk).filter(([p]) => p.endsWith('.jsonl')).flatMap(([, t]) => t.trim().split('\n').map(JSON.parse))

describe('research runtime: WebSearch and gates', () => {
  test('quoted configuration secret anywhere in the search envelope sends no helper and saves no copy', async ($, on) => {
    const w = world(on)
    await $.session.start({ cwd: CWD } as never)
    const secret = `${['DB', 'PASSWORD'].join('_')}="${['R7m', 'K2p', 'Q9w', 'Z4a'].join('')}"`
    // Keep commentary clean: the final envelope gate must also inspect link fields.
    w.toolResult = { commentary: PAGE.repeat(15), links: [{ url: URL, title: secret }] }
    const result: any = await search($)
    expect(result.result).toEqual(w.toolResult)
    expect(w.requests.length).toBe(0)
    expect(w.writes).toEqual([])
  })
  test('small search before consent does not ask or send anything', async ($, on) => {
    const w = world(on, { consent: 'missing' })
    await $.session.start({ cwd: CWD } as never)
    await $.prompt.submit({ text: 'Acme', origin: { kind: 'composer' } } as never)
    w.toolResult = { commentary: 'short result', links: [{ url: URL }] }
    expect((await search($) as any).result).toEqual(w.toolResult)
    expect(w.calls).toBe(0); expect(w.requests.length).toBe(0); expect(w.writes).toEqual([])
  })
  test('quick command returns before work, then delivers a checked report and a readable saved copy', async ($, on) => {
    const w = world(on)
    await $.session.start({ cwd: CWD } as never)
    const r = await $.command.run({ command: 'relai-research', args: 'Acme release', origin: { kind: 'composer' } } as never)
    expect(r.text.includes('do not research independently')).toBe(true)
    expect(w.requests.length).toBe(0)
    await w.advance(1)
    await drain($)
    expect(w.requests.length > 0).toBe(true)
    expect(w.tools.some(t => t.tool === 'WebFetch' && t.url === URL)).toBe(true)
    expect(w.submitted.length).toBe(1)
    const reportPath = Object.keys(w.disk).find(p => p.endsWith('.md') && p.includes('/research/') && p.includes('-research-'))!
    expect(!!reportPath).toBe(true)
    expect(w.disk[reportPath].includes('Acme ship 42 [1]')).toBe(true)
    expect(w.disk[reportPath].includes(`${URL} (verified: page read)`)).toBe(true)
    expect(w.submitted[0].includes(w.disk[reportPath])).toBe(true)
    // One planner, one relevance check, one report; own WebSearch is not compressed again.
    expect(w.requests.length).toBe(3)
    expect(records(w).length).toBe(3)
  })
  test('off before deferred job sends no helper, report or task', async ($, on) => {
    const w = world(on)
    await $.session.start({ cwd: CWD } as never)
    await $.command.run({ command: 'relai-research', args: 'Acme' } as never)
    await $.command.run({ command: 'relai-research', args: 'off' } as never)
    await w.advance(1)
    await drain($)
    expect(w.requests.length).toBe(0); expect(w.spawns.length).toBe(0); expect(w.submitted.length).toBe(0)
  })
  test('deep command requests parallel general-purpose agents with no explicit model; refusal is not a fabricated report', async ($, on) => {
    const w = world(on)
    await $.session.start({ cwd: CWD } as never)
    await $.command.run({ command: 'relai-research', args: 'deep Acme' } as never)
    await w.advance(1)
    await drain($)
    expect(w.spawns.length).toBe(2)
    for (const s of w.spawns) { expect(s.model).toBe(undefined); expect(s.subagent_type).toBe('general-purpose') }
    // Core owns agentId (P-064): this harness cannot run agents. Pure workflow tests prove
    // report merging; here a refused spawn must never acquire a fake verified source.
    expect(w.submitted.length).toBe(1)
    expect(w.submitted[0].includes('No deep part completed')).toBe(true)
    expect(w.submitted[0].includes('verified: page read')).toBe(false)
  })
  test('auto saves exact envelope and keeps links, numbers, names, dates and mirror text', async ($, on) => {
    const w = world(on)
    await $.session.start({ cwd: `${CWD}/src` } as never)
    await $.prompt.submit({ text: 'Acme release', origin: { kind: 'composer' } } as never)
    const r: any = await search($)
    expect(r.result.results[0]).toEqual(ORIGINAL.results[0])
    expect(r.result.results[1].includes('Acme ship 42, USD 17, 2026-11-13')).toBe(true)
    expect(r.result.results[1].includes(URL)).toBe(true)
    expect(r.ref).toBe('original-ref')
    expect(r.text).toBe(JSON.stringify(r.result))
    const files = Object.keys(w.disk).filter(p => p.endsWith('.json'))
    const path = files.find(p => p.includes('/research/') && p.includes('-auto-'))!
    expect(!!path).toBe(true)
    expect(JSON.parse(w.disk[path])).toEqual({ result: ORIGINAL, text: JSON.stringify(ORIGINAL), ref: 'original-ref' })
    expect(r.result.results[1].includes(path)).toBe(true)
    const rows = records(w)
    expect(rows.length).toBe(2)
    expect(rows[0].helper).toEqual({ model: 'claude-haiku-5-5', in: 13, out: 5 })
    expect(rows[1].before > rows[1].after).toBe(true)
    expect(rows[1].measured).toBe(false)
    expect(rows[0].part !== rows[1].part).toBe(true)
  })
  for (const mode of ['agent', 'small', 'consent', 'twin', 'secret', 'question-secret', 'off', 'manual', 'unknown-home', 'own-search']) {
    test(`passes original unchanged and sends nothing: ${mode}`, async ($, on) => {
      const w = world(on, { consent: mode === 'consent' ? 'no' : undefined, twin: mode === 'twin', home: mode === 'unknown-home' ? '' : undefined })
      await $.session.start({ cwd: CWD } as never)
      if (mode === 'small') w.toolResult = { commentary: 'a'.repeat(3200), links: [{ url: URL }] }
      if (mode === 'secret') w.toolResult = { commentary: PAGE.repeat(15) + KEY, links: [] }
      if (mode === 'question-secret') await $.prompt.submit({ text: KEY, origin: { kind: 'composer' } } as never)
      if (mode === 'off' || mode === 'manual') await $.command.run({ command: 'relai-research', args: mode } as never)
      const r: any = await search($, mode === 'agent' ? { agentId: 'a' } : mode === 'own-search' ? { origin: { plugin: 'relai-research' } } : {})
      expect(r.result).toEqual(w.toolResult)
      expect(w.requests.length).toBe(0); expect(w.calls).toBe(0)
      expect(w.writes).toEqual([])
    })
  }
  test('unknown consent in sdk stays passive; one human card persists consent once', async ($, on) => {
    const w = world(on, { consent: 'missing' })
    await $.session.start({ cwd: CWD } as never)
    await $.prompt.submit({ text: 'Acme', origin: { kind: 'sdk' } } as never)
    expect((await search($) as any).result).toEqual(ORIGINAL)
    expect(w.calls).toBe(0); expect(w.requests.length).toBe(0)
    await $.prompt.submit({ text: 'Acme', origin: { kind: 'composer' } } as never)
    await search($); await search($)
    expect(w.calls).toBe(1)
    expect(w.disk[`${CWD}/docs/USTAWIENIA.md`].includes('| Mody oszczędzania | zgoda')).toBe(true)
    expect(w.requests.length).toBe(2)
  })
  test('refusal persists and stops helpers; twin reports one notice', async ($, on) => {
    const w = world(on, { consent: 'missing' }); w.consentAnswer = 'No'
    await $.session.start({ cwd: CWD } as never)
    await $.prompt.submit({ text: 'Acme', origin: { kind: 'composer' } } as never)
    await search($); await search($)
    expect(w.calls).toBe(1); expect(w.requests.length).toBe(0)
    expect(w.disk[`${CWD}/docs/USTAWIENIA.md`].includes('brak zgody')).toBe(true)
  })
  test('twin activated during session updates status and notifies only once', async ($, on) => {
    const w = world(on)
    await $.session.start({ cwd: CWD } as never)
    w.disk[`${HOME}/.claude/settings.json`] = JSON.stringify({ enabledPlugins: { 'research-router@token-saving-mods': true } })
    await search($); await search($)
    expect(w.toasts.length).toBe(1); expect(w.requests.length).toBe(0)
    expect((await $.command.run({ command: 'relai-research', args: 'stats' } as never)).text.includes('Sleeps: BenAI')).toBe(true)
  })
  for (const mode of ['write-failure', 'helper-failure', 'invalidated', 'bad-helper', 'secret-helper']) test(`auto fallback retains original: ${mode}`, async ($, on) => {
    const w = world(on)
    await $.session.start({ cwd: CWD } as never)
    w.failWrite = mode === 'write-failure'; w.failHelper = mode === 'helper-failure'
    if (mode === 'invalidated') w.duringHelper = async () => { await $.command.run({ command: 'relai-research', args: 'off' } as never) }
    if (mode === 'bad-helper') w.helperText = PAGE.repeat(100)
    if (mode === 'secret-helper') w.helperText = KEY
    const r: any = await search($)
    expect(r.result).toEqual(ORIGINAL)
    if (mode === 'write-failure') expect(w.requests.length).toBe(0)
    expect(Object.values(w.disk).some(t => t.includes(KEY))).toBe(false)
  })
  test('helper model setting is used and accounted with cache usage', async ($, on) => {
    const w = world(on)
    await $.session.start({ cwd: CWD } as never)
    await $.command.run({ command: 'relai-research', args: 'model claude-sonnet-5-5' } as never)
    await search($)
    expect(w.requests[0].model).toBe('claude-sonnet-5-5')
    expect(records(w)[0].helper.model).toBe('claude-sonnet-5-5')
  })
  test('manual then auto while helper is pending cannot revive an old result', async ($, on) => {
    const w = world(on)
    await $.session.start({ cwd: CWD } as never)
    w.duringHelper = async () => {
      await $.command.run({ command: 'relai-research', args: 'manual' } as never)
      await $.command.run({ command: 'relai-research', args: 'auto' } as never)
    }
    expect((await search($) as any).result).toEqual(ORIGINAL)
    expect(w.requests.length).toBe(1)
  })
  test('panel uses columns without zero-width boxes at every breakpoint; both switches affect results', async ($, on) => {
    const w = world(on)
    await $.session.start({ cwd: CWD } as never)
    for (const columns of [40, 47, 48, 143, 144, 160]) {
      const ui = await $.ui.mount({ plugin: 'relai-research', component: 'Pane', requestId: 'relai-research', props: { title: 'RelAI Research', isFocused: false, bodyColumns: columns, placement: 'dock', scroll: { offset: 0, bodyRows: 40 }, view: {} }, surface: 'desktop', viewport: { columns, rows: 40 } } as never)
      const layout: any = await ui.find({ key: 'layout' } as never)
      expect(layout?.props?.flexDirection).toBe('column'); expect(layout?.props?.width).toBe(undefined)
      if (columns === 40) await ui.press({ key: 'on' })
      if (columns === 47) await ui.press({ key: 'auto' })
      await ui.unmount()
    }
    expect((await search($) as any).result).toEqual(ORIGINAL)
    expect(w.requests.length).toBe(0)
    const s = (await $.command.run({ command: 'relai-research', args: 'stats' } as never)).text
    expect(s.includes('off; manual')).toBe(true)
  })
})
