import { describe, expect, mock, test } from 'claude-code/testing'
import type { On } from 'claude-code'
import { STAGE_LINES } from './stage-fixtures'

const CWD = 'C:/proj'
const HOME = 'C:/Users/T'
const SETTINGS = 'Wersja RelAI: 3.8.0\n| Data | Czego dotyczy | Decyzja |\n|---|---|---|\n| 2026-11-11 | Mody oszczędzania | zgoda |\n'
const KEY = ['s', 'k-ant-api03-', 'AbCdEfGhIjKlMnOpQrStUvWxYz0123456789'].join('')

function world(on: On, options: { twin?: boolean, consent?: boolean, home?: string, exitCode?: number, homeThrows?: boolean } = {}) {
  const w = { calls: 0, cards: 0, steps: [] as string[], answer: { isAnswered: true, text: '{"level":"low","why":"simple"}' } as { isAnswered: boolean, text: string, reason?: string }, disk: { [`${CWD}/docs/USTAWIENIA.md`]: options.consent === false ? SETTINGS.replace('zgoda', 'brak zgody') : SETTINGS, [`${HOME}/.claude/settings.json`]: JSON.stringify({ enabledPlugins: { 'effort-optimizer@token-saving-mods': !!options.twin } }) } as Record<string, string> }
  const key = (p: string) => p.replace(/\\/g, '/')
  const activity = { reads: [] as string[], writes: [] as string[], toasts: [] as string[], requests: [] as any[], duringJudge: null as null | (() => Promise<void>), duringCard: null as null | (() => Promise<void>) }
  mock.store(on, {})
  on('session.start', ($, e) => ({ cwd: e.cwd }))
  on('session.id', () => ({ value: 'test' }))
  on('fs.read', ($, e) => { activity.reads.push(key(e.path)); return key(e.path) in w.disk ? { value: w.disk[key(e.path)] } : { deny: 'ENOENT' } })
  on('fs.write', ($, e) => { activity.writes.push(key(e.path)); w.disk[key(e.path)] = e.text; return { value: undefined } })
  on('fs.exists', ($, e) => ({ value: key(e.path) in w.disk }))
  on('process.run', () => options.homeThrows ? { deny: 'home failed' } : { value: { exitCode: options.exitCode ?? 0, stdout: options.home ?? HOME, stderr: '' } } as never)
  on('command.register', () => ({ value: undefined }) as never)
  on('prompt.submit', ($, e) => ({ text: (e as any).text }) as never)
  on('model.complete', async ($, e) => { w.calls++; activity.requests.push(e); await activity.duringJudge?.(); return { value: w.answer } as never })
  on('tool.call', async ($, e) => { w.cards++; const questions = (e as any).questions; await activity.duringCard?.(); return { result: { questions, answers: { [questions[0].question]: 'Switch' } } } as never })
  on('ui.log', () => ({ value: undefined }) as never)
  on('ui.toast', ($, e) => { activity.toasts.push(JSON.stringify(e)); return { value: undefined } as never })
  on('command.run', ($, e) => ({ text: `ran ${e.command}` }) as never)
  on('turn.complete', ($, e) => ({ text: (e as any).answer || '' }) as never)
  on('turn.step', async function* ($, e) { w.steps.push(String((e as any).effort)); return { turnId: (e as any).turnId, index: (e as any).index, answer: '', toolUses: [], stopReason: 'end_turn' } as never })
  return Object.assign(w, { activity })
}

async function step($: any, agentId?: string, turnId = 't', effort = 'high') {
  const g = $.turn.step({ turnId, index: 0, model: 'opus', effort, messageCount: 1, ...(agentId ? { agentId } : {}) } as never)
  if (g && typeof g.next === 'function') { let v = await g.next(); while (!v.done) v = await g.next() } else await g
}

function expectFailure(w: ReturnType<typeof world>, reason: string) {
  const errorPath = `${HOME}/.claude/relai/oszczednosci/effort/ostatni-blad.txt`
  const ledgerPath = `${HOME}/.claude/relai/oszczednosci/rejestr/${new Date().toISOString().slice(0, 10)}-test.relai-effort.jsonl`
  const text = w.disk[errorPath]
  expect(typeof text).toBe('string')
  const at = text.split(' ')[0]
  expect(text).toBe(`${new Date(at).toISOString()} ${reason}\n`)
  expect([...new Set(w.activity.writes)].sort()).toEqual([errorPath, ledgerPath].sort())
  expect(w.disk[`${CWD}/docs/USTAWIENIA.md`]).toBe(SETTINGS)
  expect(w.disk[`${HOME}/.claude/settings.json`]).toBe(JSON.stringify({ enabledPlugins: { 'effort-optimizer@token-saving-mods': false } }))
}

describe('effort safety gates', () => {
  test('auto protects verbatim real stage lines before calling the judge', async ($, on) => {
    const w = world(on)
    await $.session.start({ cwd: CWD } as never)
    await $.command.run({ command: 'relai-effort', args: 'auto' } as never)
    for (const text of STAGE_LINES) {
      await $.prompt.submit({ text, origin: { kind: 'composer' } } as never)
      await step($)
    }
    expect(w.steps).toEqual(['high', 'high', 'high'])
    expect(w.calls).toBe(0)
  })
  test('every answered judge call records helper usage, including invalid verdicts', async ($, on) => {
    const w = world(on)
    w.disk[`${CWD}/.claude/relai/MODELE-claude-code.md`] = 'balanced: Sonnet | alias: sonnet | id: claude-sonnet-5-5'
    await $.session.start({ cwd: CWD } as never)
    for (const text of ['{"level":"low","why":"simple"}', 'bad json', '{"level":"ultra","why":"bad"}']) {
      w.answer = { isAnswered: true, text, usage: { input_tokens: 100, cache_read_input_tokens: 20, cache_creation_input_tokens: 5, output_tokens: 9 } } as any
      await $.prompt.submit({ text: 'Count files', origin: { kind: 'composer' } } as never)
    }
    const lines = Object.entries(w.disk).filter(([p]) => p.includes('/rejestr/')).flatMap(([, t]) => t.trim().split('\n').map(JSON.parse))
    expect(lines.length).toBe(3)
    for (const rec of lines) {
      expect(rec.helper).toEqual({ model: 'claude-sonnet-5-5', in: 125, out: 9 })
      expect(rec.measured).toBe(true)
      expect(rec.before).toBe(undefined); expect(rec.after).toBe(undefined)
    }
    expect(new Set(lines.map((rec) => rec.tool_use_id)).size).toBe(3)
  })
  for (const opts of [{ home: '' }, { home: HOME, exitCode: 1 }, { home: '%USERPROFILE%' }, { home: 'relative' }, { homeThrows: true }]) {
    test(`unknown home fails closed: ${JSON.stringify(opts)}`, async ($, on) => {
      const w = world(on, opts)
      await $.session.start({ cwd: CWD } as never)
      await $.prompt.submit({ text: 'Count files', origin: { kind: 'composer' } } as never)
      await step($)
      expect(w.calls).toBe(0); expect(w.cards).toBe(0); expect(w.steps).toEqual(['high'])
      expect(w.activity.writes).toEqual([])
      expect((await $.command.run({ command: 'relai-effort', args: 'stats' } as never)).text.includes('user home unavailable')).toBe(true)
      expect(w.activity.reads.some((p) => p.startsWith('/.claude'))).toBe(false)
    })
  }
  test('twin sleeps with current panel status and one notice per session', async ($, on) => {
    const w = world(on)
    await $.session.start({ cwd: CWD } as never)
    await $.prompt.submit({ text: 'Count files', origin: { kind: 'composer' } } as never)
    w.disk[`${HOME}/.claude/settings.json`] = JSON.stringify({ enabledPlugins: { 'effort-optimizer@token-saving-mods': true } })
    for (let i = 0; i < 2; i++) await $.prompt.submit({ text: 'Count folders', origin: { kind: 'composer' } } as never)
    expect(w.calls).toBe(1)
    expect(w.activity.toasts.filter((t) => t.includes('effort-optimizer@token-saving-mods')).length).toBe(1)
    expect((await $.command.run({ command: 'relai-effort', args: 'stats' } as never)).text.includes('sleeps: BenAI effort-optimizer@token-saving-mods is on')).toBe(true)
  })
  test('refusal stops all activation-only reads, on load and on submit', async ($, on) => {
    const w = world(on, { consent: false })
    await $.session.start({ cwd: CWD } as never)
    await $.prompt.submit({ text: 'Count files', origin: { kind: 'composer' } } as never)
    expect(w.activity.reads).toEqual([`${CWD}/docs/USTAWIENIA.md`, `${CWD}/docs/USTAWIENIA.md`])
    expect(w.activity.writes).toEqual([])
  })
  test('HIGH 1: off while the judge is pending invalidates its result', async ($, on) => {
    const w = world(on)
    await $.session.start({ cwd: CWD } as never)
    w.activity.duringJudge = async () => { await $.command.run({ command: 'relai-effort', args: 'off' } as never) }
    await $.prompt.submit({ text: 'Count files', origin: { kind: 'composer' } } as never)
    await step($)
    expect(w.steps).toEqual(['high'])
    expect(w.cards).toBe(0)
  })
  test('HIGH 1: pane off while the card is pending invalidates acceptance', async ($, on) => {
    const w = world(on)
    await $.session.start({ cwd: CWD } as never)
    const ui = await $.ui.mount({ plugin: 'relai-effort', component: 'Pane', requestId: 'relai-effort', props: { title: 'RelAI Effort', isFocused: false, bodyColumns: 80, placement: 'dock', scroll: { offset: 0, bodyRows: 40 }, view: {} }, surface: 'desktop', viewport: { columns: 80, rows: 40 } } as never)
    w.activity.duringCard = async () => { await ui.press({ key: 'on' }) }
    await $.prompt.submit({ text: 'Count files', origin: { kind: 'composer' } } as never)
    await step($)
    expect(w.steps).toEqual(['high'])
    await ui.unmount()
  })
  test('HIGH 2: completion clears the override before an unjudged command turn', async ($, on) => {
    const w = world(on)
    await $.session.start({ cwd: CWD } as never)
    await $.prompt.submit({ text: 'Count files', origin: { kind: 'composer' } } as never)
    await step($)
    await $.turn.complete({ turnId: 't', answer: 'Done' } as never)
    await step($, undefined, 'command-turn')
    expect(w.steps).toEqual(['low', 'high'])
  })
  test('HIGH 2: a human command clears even a pending override', async ($, on) => {
    const w = world(on)
    await $.session.start({ cwd: CWD } as never)
    await $.prompt.submit({ text: 'Count files', origin: { kind: 'composer' } } as never)
    await $.command.run({ command: 'relai-stage', args: '', origin: { kind: 'composer' } } as never)
    await step($)
    expect(w.steps).toEqual(['high'])
  })
  test('HIGH 2: one decision cannot bind to two turn IDs', async ($, on) => {
    const w = world(on)
    await $.session.start({ cwd: CWD } as never)
    await $.prompt.submit({ text: 'Count files', origin: { kind: 'composer' } } as never)
    await step($)
    await step($)
    await step($, undefined, 'another-turn')
    expect(w.steps).toEqual(['low', 'low', 'high'])
  })
  test('HIGH 3: low then keep retains applied effort and tells the judge', async ($, on) => {
    const w = world(on)
    await $.session.start({ cwd: CWD } as never)
    await $.prompt.submit({ text: 'Count files', origin: { kind: 'composer' } } as never)
    await step($)
    await $.turn.complete({ turnId: 't', answer: 'Done' } as never)
    w.answer = { isAnswered: true, text: '{"level":"keep","why":"continue"}' }
    await $.prompt.submit({ text: 'Continue', origin: { kind: 'composer' } } as never)
    await step($, undefined, 'next-turn')
    expect(w.steps).toEqual(['low', 'low'])
    expect(w.activity.requests[1].prompt.includes('Current effort: low')).toBe(true)
    expect(w.cards).toBe(1)
  })
  test('human prompt is judged and applied only to main chat', async ($, on) => {
    const w = world(on)
    await $.session.start({ cwd: CWD } as never)
    await $.prompt.submit({ text: 'Count files', origin: { kind: 'composer' } } as never)
    await step($, 'agent')
    await step($)
    expect(w.calls).toBe(1)
    expect(w.cards).toBe(1)
    expect(w.steps).toEqual(['high', 'low'])
    const ledger = Object.entries(w.disk).find(([path]) => path.includes('/oszczednosci/rejestr/'))
    expect(!!ledger).toBe(true)
    const record = JSON.parse(ledger![1].trim())
    expect(record.action).toBe('effort')
    expect(record.from).toBe('unknown')
    expect(record.to).toBe('low')
    expect(record.before).toBe(undefined)
    expect(record.after).toBe(undefined)
  })
  test('twin, no consent, sdk, notification and slash do not send to judge', async ($, on) => {
    const w = world(on, { twin: true })
    await $.session.start({ cwd: CWD } as never)
    for (const item of [ { text: 'hi', origin: { kind: 'composer' } }, { text: '/x', origin: { kind: 'composer' } }, { text: 'hi', origin: { kind: 'sdk' } }, { text: 'done', origin: { kind: 'task-notification' }, isMeta: true }, { text: KEY, origin: { kind: 'composer' } } ]) await $.prompt.submit(item as never)
    await step($)
    expect(w.calls).toBe(0)
    expect(w.cards).toBe(0)
    expect(w.steps).toEqual(['high'])
  })
  test('without consent: no card, no judge, unchanged effort', async ($, on) => {
    const w = world(on, { consent: false })
    await $.session.start({ cwd: CWD } as never)
    await $.prompt.submit({ text: 'Count files', origin: { kind: 'composer' } } as never)
    await step($)
    expect(w.calls).toBe(0); expect(w.cards).toBe(0); expect(w.steps).toEqual(['high'])
  })
  test('slash, notification, sdk, and secret do not trigger a judge or card', async ($, on) => {
    const w = world(on)
    await $.session.start({ cwd: CWD } as never)
    for (const item of [ { text: '/x', origin: { kind: 'composer' } }, { text: 'hi', origin: { kind: 'sdk' } }, { text: 'done', origin: { kind: 'task-notification' }, isMeta: true }, { text: 'meta', origin: { kind: 'composer' }, isMeta: true }, { text: 'subagent', origin: { kind: 'composer' }, agentId: 'agent' }, { text: KEY, origin: { kind: 'composer' } } ]) await $.prompt.submit(item as never)
    await step($)
    expect(w.calls).toBe(0); expect(w.cards).toBe(0); expect(w.steps).toEqual(['high'])
  })
  test('auto protects the actual stage prompt effort', async ($, on) => {
    const w = world(on)
    await $.session.start({ cwd: CWD } as never)
    await $.command.run({ command: 'relai-effort', args: 'auto', origin: { kind: 'composer' } } as never)
    await $.prompt.submit({ text: '> zatrzymaj się. Zalecany poziom `/effort`:\n> `high` — etap', origin: { kind: 'composer' } } as never)
    await step($)
    expect(w.steps).toEqual(['high']); expect(w.calls).toBe(0); expect(w.cards).toBe(0)
    await $.prompt.submit({ text: 'Count files', origin: { kind: 'composer' } } as never)
    await step($)
    expect(w.calls).toBe(1); expect(w.steps).toEqual(['high', 'low'])
  })
  test('bad judge answer leaves effort untouched and writes the reason', async ($, on) => {
    const w = world(on)
    w.answer = { isAnswered: true, text: '{"level":"ultra","why":"bad"}' }
    await $.session.start({ cwd: CWD } as never)
    await $.prompt.submit({ text: 'Count files', origin: { kind: 'composer' } } as never)
    await step($)
    expect(w.calls).toBe(1); expect(w.cards).toBe(0); expect(w.steps).toEqual(['high'])
    expectFailure(w, 'judge level outside the list')
  })
  test('no JSON and a timed-out judge leave the main effort untouched', async ($, on) => {
    const w = world(on)
    await $.session.start({ cwd: CWD } as never)
    w.answer = { isAnswered: true, text: 'no json' }
    await $.prompt.submit({ text: 'Count files', origin: { kind: 'composer' } } as never)
    await step($)
    expect(w.steps).toEqual(['high'])
    expectFailure(w, 'judge reply has no valid JSON object')
    w.answer = { isAnswered: false, text: '', reason: 'timeout' }
    await $.prompt.submit({ text: 'Count folders', origin: { kind: 'composer' } } as never)
    await step($)
    expect(w.steps).toEqual(['high', 'high'])
    expect(w.cards).toBe(0)
    expectFailure(w, 'Judge failed: timeout')
  })
  test('pane uses a column without zero width in narrow and wide viewports', async ($, on) => {
    world(on)
    await $.session.start({ cwd: CWD } as never)
    for (const columns of [40, 47, 48, 160]) {
      const ui = await $.ui.mount({ plugin: 'relai-effort', component: 'Pane', requestId: 'relai-effort', props: { title: 'RelAI Effort', isFocused: false, bodyColumns: columns, placement: 'dock', scroll: { offset: 0, bodyRows: 40 }, view: {} }, surface: 'desktop', viewport: { columns, rows: 40 } } as never)
      const layout: any = await ui.find({ key: 'layout' } as never)
      expect(layout?.props?.flexDirection).toBe('column')
      expect(layout?.props?.width).toBe(undefined)
      await ui.unmount()
    }
  })
  test('pane switch disables judging', async ($, on) => {
    const w = world(on)
    await $.session.start({ cwd: CWD } as never)
    const ui = await $.ui.mount({ plugin: 'relai-effort', component: 'Pane', requestId: 'relai-effort', props: { title: 'RelAI Effort', isFocused: false, bodyColumns: 80, placement: 'dock', scroll: { offset: 0, bodyRows: 40 }, view: {} }, surface: 'desktop', viewport: { columns: 80, rows: 40 } } as never)
    await ui.press({ key: 'on' })
    await ui.unmount()
    await $.prompt.submit({ text: 'Count files', origin: { kind: 'composer' } } as never)
    await step($)
    expect(w.calls).toBe(0)
    expect(w.steps).toEqual(['high'])
  })
})
