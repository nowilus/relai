import { describe, expect, mock, test, type TestBody } from 'claude-code/testing'
import type { On } from 'claude-code'
import { CARD_OPTIONS } from './judge'
import { CREW_ACCEPT, CREW_MINE, CREW_START } from './crew'

// relai-model-router in the engine's test harness (plan MODY_OSZCZEDZANIA, E5). Negative proof
// (rule 3): forks, resumes, the main chat and a task with a key mean 0 judge calls and the model
// as it was; a model the caller named never changes without the card while a person sits at the
// session. Whether the engine takes the rewritten model is measured live (POMIAR_E5.md, L-0321).

type Engine = Parameters<TestBody>[0]

const CWD = 'C:/proj'
const HOME = 'C:/Users/T'
const SETTINGS = '# USTAWIENIA\n\nWersja RelAI: 3.8.0\n\n| Data | Czego dotyczy | Decyzja |\n|---|---|---|\n| 2026-11-11 | Mody oszczędzania | zgoda — test |\n'
const LIST = 'strong: Opus 5.5 | alias: opus | id: claude-opus-5-5 | source: x\nbalanced: Sonnet 5.5 | alias: sonnet | id: claude-sonnet-5-5 | source: x\ncheap: Haiku 5.5 | alias: haiku | id: claude-haiku-5-5 | source: x\n'
// A key assembled from pieces: the repository's own scanner refuses it written whole
const KEY = ['s', 'k-ant-api03-', 'AbCdEfGhIjKlMnOpQrStUvWxYz0123456789'].join('')
const FAST = '{"tier":"fast","confidence":0.9,"effort":1,"effort_confidence":0.8,"risky":0.1}'
const USAGE = { input_tokens: 400, output_tokens: 45, cache_read_input_tokens: 0, cache_creation_input_tokens: 0 }

type World = { judge: { model: string, prompt: string }[], spawned: (string | undefined)[], asked: string[], disk: Record<string, string>, answer: (prompt: string) => unknown, card: ($: any) => string | Promise<string> }

function world(on: On, opts: { consent?: boolean, twin?: boolean, subagentModel?: string } = {}): World {
  const userSettings = {
    ...(opts.twin ? { enabledPlugins: { 'model-router@token-saving-mods': true } } : {}),
    ...(opts.subagentModel ? { env: { CLAUDE_CODE_SUBAGENT_MODEL: opts.subagentModel } } : {}),
  }
  const w: World = {
    judge: [], spawned: [], asked: [],
    answer: () => ({ isAnswered: true, text: FAST, usage: USAGE }),
    card: () => CARD_OPTIONS[1],
    disk: {
      [`${CWD}/docs/USTAWIENIA.md`]: opts.consent === false ? SETTINGS.replace(/\| 2026-11-11 \| Mody.*\n/, '') : SETTINGS,
      [`${CWD}/.claude/relai/MODELE-claude-code.md`]: LIST,
      ...(Object.keys(userSettings).length ? { [`${HOME}/.claude/settings.json`]: JSON.stringify(userSettings) } : {}),
    },
  }
  const key = (p: string) => p.replace(/\\/g, '/')
  mock.clock(on, { now: Date.UTC(2026, 10, 12, 12, 0) })
  mock.store(on, {})
  on('session.start', ($, e) => ({ cwd: e.cwd }))
  on('session.id', () => ({ value: 'sesja-mr' }))
  on('fs.exists', ($, e) => ({ value: key(e.path) in w.disk }))
  on('fs.read', ($, e) => (key(e.path) in w.disk ? { value: w.disk[key(e.path)] ?? '' } : { deny: 'ENOENT ' + e.path }))
  on('fs.write', ($, e) => { w.disk[key(e.path)] = e.text; return { value: undefined } })
  on('fs.list', () => ({ value: [] }))
  on('process.run', ($, e) => {
    const argv = (e as unknown as { argv: string[] }).argv
    if (argv[0] === 'cmd.exe') return { value: { exitCode: 0, stdout: HOME, stderr: '' } } as never
    return { deny: 'ENOENT ' + argv[0] } as never
  })
  on('command.register', () => ({ value: undefined }) as never)
  on('prompt.submit', ($, e) => ({ text: (e as unknown as { text: string }).text }) as never)
  on('model.complete', ($, e) => { w.judge.push({ model: e.model, prompt: String(e.prompt) }); return { value: w.answer(String(e.prompt)) } as never })
  on('tool.register', ($, e) => ({ value: { tool: `mcp__relai-model-router__${(e as unknown as { name: string }).name}` } }) as never)
  on('session.model', () => ({ value: 'claude-opus-5-5' }) as never)
  // $.ui.ask is a tool call of AskUserQuestion (as in relai-cache-keeper's tests)
  on('tool.call', async ($, e) => {
    const questions = (e as unknown as { questions: { question: string, header: string, options: { label: string }[] }[] }).questions
    const q = questions[0]
    w.asked.push(`${q?.question ?? ''} | ${(q?.options ?? []).map((o) => o.label).join(' | ')}`)
    const answer = await w.card($)
    return { result: { questions, answers: { [q?.question ?? '']: answer } } } as never
  })
  on('ui.open', () => ({ value: { isPlaced: true } }) as never)
  on('ui.invalidate', () => ({ value: undefined }) as never)
  on('ui.log', () => ({ value: undefined }) as never)
  on('ui.toast', () => ({ value: undefined }) as never)
  on('agent.spawn', ($, e) => { w.spawned.push((e as unknown as { model?: string }).model); return { model: (e as unknown as { model?: string }).model ?? 'claude-opus-5-5', agentId: `ag${w.spawned.length}` } as never })
  return w
}

async function start($: Engine, human = true) {
  await $.session.start({ cwd: CWD, surface: 'desktop', isInteractive: false })
  if (human) await $.prompt.submit({ text: 'Refactor the parser.', origin: { kind: 'composer' } } as never)
}

const spawn = async ($: Engine, more: Record<string, unknown> = {}) =>
  await $.agent.spawn({ prompt: 'List the files under src/ and count them.', description: 'count files', parentModel: 'claude-opus-5-5', fork: false, tool_use_id: 'toolu_1', ...more } as never) as unknown as { model: string, agentId?: string }
const PANE = { plugin: 'relai-model-router', component: 'Pane', requestId: 'relai-model-router', props: { title: 'RelAI Model Router', isFocused: false, bodyColumns: 160, placement: 'dock', scroll: { offset: 0, bodyRows: 40 }, view: {} } } as const
const ledger = (w: World) => Object.entries(w.disk).filter(([p]) => p.includes('/oszczednosci/rejestr/')).map(([, t]) => t).join('')

describe('model-router: what is never judged (rule 3)', () => {
  test('a fork: 0 judge calls, the model as given', async ($, on) => {
    const w = world(on)
    await start($)
    await spawn($, { fork: true, subagentType: 'fork' })
    expect(w.judge.length).toBe(0)
    expect(w.spawned).toEqual([undefined])
    expect(ledger(w)).toBe('')
  })

  test('a resume: 0 judge calls, its resolved model untouched', async ($, on) => {
    const w = world(on)
    await start($)
    await spawn($, { resume: { agentId: 'ag0' }, model: 'claude-haiku-5-5' })
    expect(w.judge.length).toBe(0)
    expect(w.spawned).toEqual(['claude-haiku-5-5'])
  })

  test('the main chat: prompts and its own steps never reach the judge', async ($, on) => {
    const w = world(on)
    await start($)
    await $.prompt.submit({ text: 'Another message.', origin: { kind: 'composer' } } as never)
    expect(w.judge.length).toBe(0)
    expect(w.spawned.length).toBe(0)
  })

  test('the BenAI twin on: sleeps, 0 calls, the model as given', async ($, on) => {
    const w = world(on, { twin: true })
    await start($)
    await spawn($)
    expect(w.judge.length).toBe(0)
    expect(w.spawned).toEqual([undefined])
  })

  test('no consent and no person: passive, 0 calls', async ($, on) => {
    const w = world(on, { consent: false })
    await start($, false)
    await spawn($)
    expect(w.judge.length).toBe(0)
    expect(w.spawned).toEqual([undefined])
  })
})

describe('model-router: the secret scanner', () => {
  test('a task with a key: 0 judge calls, the model as given', async ($, on) => {
    const w = world(on)
    await start($)
    await spawn($, { prompt: `Deploy with ${KEY} and check the logs.` })
    expect(w.judge.length).toBe(0)
    expect(w.spawned).toEqual([undefined])
  })

  test('the same task without the key: exactly 1 call', async ($, on) => {
    const w = world(on)
    await start($)
    await spawn($, { prompt: 'Deploy with the usual key and check the logs.' })
    expect(w.judge.length).toBe(1)
  })
})

describe('model-router: a subagent with no model named', () => {
  test('a simple task on an Opus parent: 1 judge call, haiku, a measured record with the judge as helper', async ($, on) => {
    const w = world(on)
    await start($)
    const out = await spawn($)
    expect(w.judge.length).toBe(1)
    expect(w.judge[0].model).toBe('haiku')
    expect(w.judge[0].prompt).toContain('List the files under src/')
    expect(w.spawned).toEqual(['haiku'])
    expect(out.model).toBe('haiku')
    expect(w.asked.length).toBe(0)
    const rec = JSON.parse(ledger(w).trim().split('\n')[0])
    expect(rec.mod).toBe('relai-model-router')
    expect(rec.action).toBe('route-changed')
    expect(rec.helper).toEqual({ model: 'claude-haiku-5-5', in: 400, out: 45 })
    expect(rec.before).toBe(undefined)
  })

  test('a risky task on a Sonnet parent goes deep (opus), whatever the tier said', async ($, on) => {
    const w = world(on)
    w.answer = () => ({ isAnswered: true, text: '{"tier":"fast","confidence":0.9,"effort":1,"effort_confidence":0.8,"risky":0.85}', usage: USAGE })
    await start($)
    await spawn($, { parentModel: 'claude-sonnet-5-5', prompt: 'Run the production migration on the orders table.' })
    expect(w.spawned).toEqual(['opus'])
  })

  test('an unsure judge never lowers: confidence 0.5 pins the base tier (the parent\'s, opus)', async ($, on) => {
    const w = world(on)
    w.answer = () => ({ isAnswered: true, text: '{"tier":"fast","confidence":0.5,"effort":1,"effort_confidence":0.8,"risky":0.1}', usage: USAGE })
    await start($)
    await spawn($)
    expect(w.spawned).toEqual(['opus'])
  })

  test('live E5, run B: the subagent default (sonnet) is the base, not the Opus parent; no person → a risky task is pinned to opus', async ($, on) => {
    const w = world(on, { subagentModel: 'claude-sonnet-5-5' })
    w.answer = () => ({ isAnswered: true, text: '{"tier":"fast","confidence":0.9,"effort":3,"effort_confidence":0.8,"risky":0.85}', usage: USAGE })
    await start($, false)
    await spawn($, { parentModel: 'claude-opus-5-5', prompt: 'Drop a column from the live payments table.' })
    expect(w.spawned).toEqual(['opus'])
    const rec = JSON.parse(ledger(w).trim().split('\n')[0])
    expect(rec.from).toBe('claude-sonnet-5-5')
    expect(rec.action).toBe('route-changed')
  })

  test('the judge agrees with the subagent default: silent, the default runs', async ($, on) => {
    const w = world(on, { subagentModel: 'claude-sonnet-5-5' })
    w.answer = () => ({ isAnswered: true, text: '{"tier":"balanced","confidence":0.9,"effort":2,"effort_confidence":0.8,"risky":0.1}', usage: USAGE })
    await start($)
    await spawn($)
    expect(w.asked.length).toBe(0)
    expect(w.spawned).toEqual([undefined])
  })
})

describe('model-router: the subagent default from the settings (Annex B)', () => {
  const pick = (w: World, prefix: string) => { w.card = () => (w.asked[w.asked.length - 1] ?? '').split(' | ').find((x) => x.startsWith(prefix)) ?? '' }

  test('a different suggestion with a person: the card names the suggestion, the default and the session\'s model', async ($, on) => {
    const w = world(on, { subagentModel: 'claude-sonnet-5-5' })
    pick(w, 'Subagent default')
    await start($)
    await spawn($)
    expect(w.asked.length).toBe(1)
    for (const o of ['Suggestion (haiku)', 'Subagent default (sonnet)', 'Session model (opus)', 'Always suggestion (this session)']) expect(w.asked[0]).toContain(o)
    expect(w.spawned).toEqual([undefined]) // the default stays
  })

  test('"Session model" runs the subagent on the parent\'s model', async ($, on) => {
    const w = world(on, { subagentModel: 'claude-sonnet-5-5' })
    pick(w, 'Session model')
    await start($)
    await spawn($)
    expect(w.spawned).toEqual(['opus'])
  })

  test('"Suggestion" applies once; "Always suggestion" ends the cards for the session', async ($, on) => {
    const w = world(on, { subagentModel: 'claude-sonnet-5-5' })
    pick(w, 'Suggestion')
    await start($)
    await spawn($)
    expect(w.spawned).toEqual(['haiku'])
    pick(w, 'Always suggestion')
    await spawn($)
    await spawn($)
    expect(w.asked.length).toBe(2)
    expect(w.spawned).toEqual(['haiku', 'haiku', 'haiku'])
  })

  test('a risky task with a person: the card, not a silent change; the session option drops when it repeats the suggestion', async ($, on) => {
    const w = world(on, { subagentModel: 'claude-sonnet-5-5' })
    w.answer = () => ({ isAnswered: true, text: '{"tier":"fast","confidence":0.9,"effort":3,"effort_confidence":0.8,"risky":0.85}', usage: USAGE })
    pick(w, 'Subagent default')
    await start($)
    await spawn($)
    expect(w.asked.length).toBe(1)
    expect(w.asked[0]).toContain('Suggestion (opus)')
    expect(w.asked[0].includes('Session model')).toBe(false)
    expect(w.spawned).toEqual([undefined])
  })

  test('free text keeps the default; "Always session model" from the command answers without a card', async ($, on) => {
    const w = world(on, { subagentModel: 'claude-sonnet-5-5' })
    w.card = () => 'whatever'
    await start($)
    await spawn($)
    expect(w.spawned).toEqual([undefined])
    await $.command.run({ command: 'relai-model-router', args: 'session', origin: { kind: 'composer' } } as never)
    await spawn($)
    expect(w.asked.length).toBe(1)
    expect(w.spawned).toEqual([undefined, 'opus'])
  })

  test('the subagent\'s own usage joins its record when it finishes (the later record counts)', async ($, on) => {
    const w = world(on)
    on('turn.step', async function* () { return { turnId: 't', index: 0, answer: '', toolUses: [], stopReason: 'end_turn', usage: { input_tokens: 100, output_tokens: 20 } } as never })
    on('turn.complete', () => ({ text: '' }) as never)
    await start($)
    const out = await spawn($)
    const step: any = $.turn.step({ turnId: 't', index: 0, model: 'claude-haiku-5-5', messageCount: 1, agentId: out.agentId } as never)
    if (step && typeof step.next === 'function') { let s = await step.next(); while (!s.done) s = await step.next() } else await step
    await $.turn.complete({ agentId: out.agentId, answer: 'done' } as never)
    const lines = ledger(w).trim().split('\n').map((l) => JSON.parse(l))
    expect(lines.length).toBe(2)
    expect(lines[1].subagent).toEqual({ model: 'claude-haiku-5-5', in: 100, out: 20 })
    expect(lines[1].helper).toEqual({ model: 'claude-haiku-5-5', in: 400, out: 45 })
  })
})

describe('model-router: a model the caller named (hardest point)', () => {
  test('the judge agrees: silent, no card', async ($, on) => {
    const w = world(on)
    await start($)
    await spawn($, { model: 'haiku' })
    expect(w.asked.length).toBe(0)
    expect(w.spawned).toEqual(['haiku'])
  })

  test('a different suggestion with a person: the card; "Mine" keeps the named model', async ($, on) => {
    const w = world(on)
    await start($)
    await spawn($, { model: 'sonnet' })
    expect(w.asked.length).toBe(1)
    expect(w.asked[0]).toContain('your choice sonnet, suggestion haiku')
    for (const o of CARD_OPTIONS) expect(w.asked[0]).toContain(o)
    expect(w.spawned).toEqual(['sonnet'])
  })

  test('"Suggestion" applies it once; the next named model asks again', async ($, on) => {
    const w = world(on)
    w.card = () => CARD_OPTIONS[0]
    await start($)
    await spawn($, { model: 'sonnet' })
    await spawn($, { model: 'sonnet' })
    expect(w.spawned).toEqual(['haiku', 'haiku'])
    expect(w.asked.length).toBe(2)
  })

  test('"Always mine (this session)": no card again, the named model stays', async ($, on) => {
    const w = world(on)
    w.card = () => CARD_OPTIONS[3]
    await start($)
    await spawn($, { model: 'opus' })
    await spawn($, { model: 'opus' })
    expect(w.asked.length).toBe(1)
    expect(w.spawned).toEqual(['opus', 'opus'])
  })

  test('two spawns at once: one card at a time; "Always mine" on the first answers the second', async ($, on) => {
    const w = world(on)
    w.card = () => CARD_OPTIONS[3]
    await start($)
    await Promise.all([spawn($, { model: 'opus', tool_use_id: 'toolu_a' }), spawn($, { model: 'opus', tool_use_id: 'toolu_b' })])
    expect(w.asked.length).toBe(1)
    expect(w.spawned).toEqual(['opus', 'opus'])
  })

  test('"Always suggestion (this session)": no card again, the suggestion applies', async ($, on) => {
    const w = world(on)
    w.card = () => CARD_OPTIONS[2]
    await start($)
    await spawn($, { model: 'opus' })
    await spawn($, { model: 'opus' })
    expect(w.asked.length).toBe(1)
    expect(w.spawned).toEqual(['haiku', 'haiku'])
  })

  test('free text or a card that fails: the named model stays', async ($, on) => {
    const w = world(on)
    w.card = () => 'use opus please'
    await start($)
    await spawn($, { model: 'sonnet' })
    expect(w.spawned).toEqual(['sonnet'])
  })

  test('no person in the session: the suggestion applies without a card', async ($, on) => {
    const w = world(on)
    await start($, false)
    await spawn($, { model: 'sonnet' })
    expect(w.asked.length).toBe(0)
    expect(w.spawned).toEqual(['haiku'])
  })
})

describe('model-router: the judge fails — the model stays and the reason is in a file', () => {
  const FAIL = `${HOME}/.claude/relai/oszczednosci/model-router/ostatni-blad.txt`
  const cases: [string, () => unknown, string][] = [
    ['an API error', () => ({ isAnswered: false, reason: 'api-error', status: 529, usage: USAGE }), 'api-error'],
    ['the 8000 ms limit', () => ({ isAnswered: false, reason: 'aborted', usage: null }), 'aborted'],
    ['a reply that is not JSON', () => ({ isAnswered: true, text: 'fast, I think', usage: USAGE }), 'no JSON'],
    ['a tier outside the list', () => ({ isAnswered: true, text: '{"tier":"ultra","confidence":0.9,"risky":0}', usage: USAGE }), 'tier outside'],
  ]
  for (const [name, answer, why] of cases) {
    test(name, async ($, on) => {
      const w = world(on)
      w.answer = answer
      await start($)
      await spawn($, { model: 'sonnet' })
      expect(w.spawned).toEqual(['sonnet'])
      expect(w.asked.length).toBe(0)
      expect(w.disk[FAIL] ?? '').toContain(why)
    })
  }

  test('the engine call itself fails: the model stays, the reason in the file', async ($, on) => {
    const w = world(on)
    w.answer = () => { throw new Error('boom') } // the harness skips the throwing stand-in: the mod gets the engine's error
    await start($)
    await spawn($)
    expect(w.spawned).toEqual([undefined])
    expect(w.disk[FAIL] ?? '').toContain('count files')
    expect(w.disk[FAIL] ?? '').toContain('model unchanged')
  })
})

describe('model-router: the command and the pane', () => {
  test('off: subagents run as given, 0 calls; on again: judged', async ($, on) => {
    const w = world(on)
    await start($)
    await $.command.run({ command: 'relai-model-router', args: 'off', origin: { kind: 'composer' } } as never)
    await spawn($)
    expect(w.judge.length).toBe(0)
    await $.command.run({ command: 'relai-model-router', args: 'on', origin: { kind: 'composer' } } as never)
    await spawn($)
    expect(w.judge.length).toBe(1)
  })

  test('stats name the tiers and the session choice', async ($, on) => {
    world(on)
    await start($)
    const r: any = await $.command.run({ command: 'relai-model-router', args: 'mine', origin: { kind: 'composer' } } as never)
    expect(String(r.text)).toContain('always yours')
    const s: any = await $.command.run({ command: 'relai-model-router', args: '', origin: { kind: 'composer' } } as never)
    expect(String(s.text)).toContain('fast haiku, balanced sonnet, deep opus')
    expect(String(s.text)).toContain('always yours')
  })

  test('the pane draws a judged choice; its buttons set the session choice and the switch', async ($, on) => {
    const w = world(on)
    await start($)
    await spawn($)
    for (const columns of [160, 60]) {
      const ui = await $.ui.mount({ ...PANE, surface: 'desktop', viewport: { columns, rows: 40 } } as never)
      expect((await ui.find({ type: 'Text', text: /model changed · opus → haiku/ }))).toBeTruthy()
      expect((await ui.find({ type: 'Text', text: /count files/ }))).toBeTruthy()
      expect((await ui.find({ type: 'Text', text: /judge 400 in \/ 45 out/ }))).toBeTruthy()
      await ui.unmount()
    }
    const ui = await $.ui.mount({ ...PANE, surface: 'desktop', viewport: { columns: 160, rows: 40 } } as never)
    await ui.press({ key: 'pref-mine' })
    await ui.press({ key: 'sw-on' })
    await ui.unmount()
    const s: any = await $.command.run({ command: 'relai-model-router', args: '', origin: { kind: 'composer' } } as never)
    expect(String(s.text)).toContain('always yours')
    expect(String(s.text)).toContain('off (pane switch')
    await spawn($, { model: 'sonnet' })
    expect(w.judge.length).toBe(1) // off: the second spawn was not judged
  })

  test('the pane command opens the pane; nothing judged yet says so', async ($, on) => {
    world(on)
    await start($)
    const r: any = await $.command.run({ command: 'relai-model-router', args: 'pane', origin: { kind: 'composer' } } as never)
    expect(String(r.text)).toContain('pane opened')
    const ui = await $.ui.mount({ ...PANE, surface: 'terminal' } as never)
    expect((await ui.find({ type: 'Text', text: /No subagents judged yet/ }))).toBeTruthy()
    await ui.unmount()
  })
})

// ---- The crew card (E6): one card before the crew starts, no second card for a decided member ----

const CREW = 'mcp__relai-model-router__crew_models'
const BALANCED = '{"tier":"balanced","confidence":0.9,"effort":1,"effort_confidence":0.8,"risky":0.1}'
/** a: opus chosen, judge says fast (differs); b: sonnet chosen, judge agrees; c: haiku chosen, a key in the task. */
const TASKS = [
  { id: 'a', title: 'Count files', task: 'List the files under src/ and count them.', model: 'opus' },
  { id: 'b', title: 'Write a test', task: 'Write a unit test for the parser. (balanced)', model: 'sonnet' },
  { id: 'c', title: 'Call the API', task: `Use ${KEY} to call the billing API.`, model: 'haiku' },
]
const CREW_PANE = { plugin: 'relai-model-router', component: 'Pane', requestId: 'relai-crew-models', props: { title: 'RelAI crew models', isFocused: false, bodyColumns: 160, placement: 'dock', scroll: { offset: 0, bodyRows: 40 }, view: {} } } as const

function crewWorld(on: On, opts: Parameters<typeof world>[1] = {}): World {
  const w = world(on, opts)
  w.answer = (prompt) => ({ isAnswered: true, text: prompt.includes('(balanced)') ? BALANCED : FAST, usage: USAGE })
  return w
}

type Reply = { router: string, how?: string, asleep?: string, error?: string, tasks?: { id: string, model: string | null, changed: boolean, mark: string, why: string }[] }
async function crewCall($: Engine, tasks: unknown = TASKS): Promise<Reply> {
  const r: any = await $.tool.call({ tool: CREW, tasks } as never)
  return JSON.parse(String(r?.result?.[0]?.text ?? r?.text ?? '{}'))
}
/** A member's spawn as /relai-crew sends it: the mark first, the model from the reply. */
const member = async ($: Engine, reply: Reply, id: string, n: number) => {
  const t = reply.tasks!.find((x) => x.id === id)!
  const task = TASKS.find((x) => x.id === id)!
  return await spawn($, { prompt: `${t.mark}\n${task.task}`, description: `crew ${id}`, model: t.model ?? undefined, tool_use_id: `toolu_m${n}` })
}

describe('model-router: the crew card (E6)', () => {
  test('one card for the whole crew; the key never reaches the judge; accept all gives each task its model and mark', async ($, on) => {
    const w = crewWorld(on)
    w.card = () => CREW_ACCEPT
    await start($)
    const reply = await crewCall($)
    expect(w.asked.length).toBe(1)
    expect(w.asked[0]).toContain('1 of 3')
    expect(w.asked[0]).toContain(`${CREW_START} | ${CREW_ACCEPT} | ${CREW_MINE}`)
    expect(w.judge.length).toBe(2) // c held back by the secret scanner
    expect(w.judge.some((j) => j.prompt.includes('k-ant-api03'))).toBe(false)
    expect(reply.tasks!.map((t) => [t.id, t.model, t.changed])).toEqual([['a', 'haiku', true], ['b', 'sonnet', false], ['c', 'haiku', false]])
    expect(reply.tasks![2].why).toContain('secret scanner')
    expect(reply.tasks![0].mark).toMatch(/^\[relai-crew [A-Za-z0-9]{1,10}\/a\]$/)
    expect(ledger(w)).toContain('"part":"crew-a"')
    expect(ledger(w)).not.toContain('"part":"crew-c"') // no judge, no cost
  })

  test('members decided on the card: 0 more cards, 0 more judge calls, the card\'s model (hardest point)', async ($, on) => {
    const w = crewWorld(on)
    w.card = () => CREW_ACCEPT
    await start($)
    const reply = await crewCall($)
    await member($, reply, 'a', 1)
    await member($, reply, 'b', 2)
    await member($, reply, 'c', 3)
    expect(w.asked.length).toBe(1)
    expect(w.judge.length).toBe(2)
    expect(w.spawned).toEqual(['haiku', 'sonnet', 'haiku'])
    // the orchestrator passes the interview's model anyway: the card's model wins, still no card
    const t = reply.tasks![0]
    await spawn($, { prompt: `${t.mark}\n${TASKS[0].task}`, model: 'opus', tool_use_id: 'toolu_m4' })
    expect(w.spawned[3]).toBe('haiku')
    expect(w.asked.length).toBe(1)
  })

  test('mine for all: a decided member keeps its model with no second card, though alone it would get one', async ($, on) => {
    const w = crewWorld(on)
    w.card = () => CREW_MINE
    await start($)
    const reply = await crewCall($)
    expect(reply.tasks![0]).toMatchObject({ model: 'opus', changed: false })
    await member($, reply, 'a', 1)
    expect(w.spawned).toEqual(['opus'])
    expect(w.asked.length).toBe(1)
    // the same task with no mark: the E5 card, as before E6
    w.card = () => CARD_OPTIONS[1]
    await spawn($, { prompt: TASKS[0].task, model: 'opus', tool_use_id: 'toolu_x' })
    expect(w.asked.length).toBe(2)
    expect(w.judge.length).toBe(3)
  })

  test('a member the card does not know (another run, a forged mark) gets the E5 path', async ($, on) => {
    const w = crewWorld(on)
    w.card = () => CREW_ACCEPT
    await start($)
    await crewCall($)
    w.card = () => CARD_OPTIONS[1]
    await spawn($, { prompt: '[relai-crew zzzz/a]\nList the files under src/ and count them.', model: 'opus', tool_use_id: 'toolu_y' })
    expect(w.asked.length).toBe(2)
    expect(w.spawned).toEqual(['opus'])
  })

  test('the pane picks per row; start keeps those picks', async ($, on) => {
    const w = crewWorld(on)
    // the card waits while the person picks in the pane (the test body acts as the person)
    let answerCard: (label: string) => void = () => undefined
    w.card = () => new Promise<string>((res) => { answerCard = res })
    await start($)
    const pending = crewCall($)
    for (let i = 0; i < 500 && w.asked.length === 0; i++) await Promise.resolve()
    expect(w.asked.length).toBe(1)
    const ui = await $.ui.mount({ ...CREW_PANE, surface: 'desktop', viewport: { columns: 160, rows: 40 } } as never)
    expect(await ui.find({ type: 'Text', text: /○ yours opus \(suggestion haiku\)/ })).toBeTruthy()
    await ui.press({ key: 'crew-a~p' })
    // the same mount redraws: the pick shows at once
    expect(await ui.find({ type: 'Text', text: /✓ suggestion haiku \(yours opus\)/ })).toBeTruthy()
    await ui.unmount()
    answerCard(CREW_START)
    const reply = await pending
    expect(reply.how).toBe('crew card: picks per row')
    expect(reply.tasks![0]).toMatchObject({ model: 'haiku', changed: true })
  })

  test('no person in the session: no card, the suggestions apply (Annex B)', async ($, on) => {
    const w = crewWorld(on)
    await start($, false)
    const reply = await crewCall($)
    expect(w.asked.length).toBe(0)
    expect(reply.how).toBe('no person in the session: suggestions applied')
    expect(reply.tasks![0].model).toBe('haiku')
  })

  test('the session answer "always mine" keeps every chosen model with no card', async ($, on) => {
    const w = crewWorld(on)
    await start($)
    await $.command.run({ command: 'relai-model-router', args: 'mine', origin: { kind: 'composer' } } as never)
    const reply = await crewCall($)
    expect(w.asked.length).toBe(0)
    expect(reply.tasks![0]).toMatchObject({ model: 'opus', changed: false })
  })

  test('a task with no interview model takes the subagent default as yours (Annex B)', async ($, on) => {
    const w = crewWorld(on, { subagentModel: 'claude-sonnet-5-5' })
    w.card = () => CREW_MINE
    await start($)
    const reply = await crewCall($, [{ id: 'a', title: 'Count files', task: 'List the files.' }])
    expect(w.asked.length).toBe(1)
    // unchanged: no model passed, so the member runs on the subagent default itself
    expect(reply.tasks![0]).toMatchObject({ model: null, changed: false })
    await spawn($, { prompt: `${reply.tasks![0].mark}\nList the files.`, tool_use_id: 'toolu_m1' })
    expect(w.spawned).toEqual([undefined])
    expect(w.asked.length).toBe(1)
  })

  test('a marked spawn asking for another model, or a mark not on the first line, is no decided member: the E5 path', async ($, on) => {
    const w = crewWorld(on)
    w.card = () => CREW_ACCEPT
    await start($)
    const reply = await crewCall($)
    w.card = () => CARD_OPTIONS[1]
    const a = reply.tasks![0]
    await spawn($, { prompt: `${a.mark}\n${TASKS[0].task}`, model: 'sonnet', tool_use_id: 'toolu_f1' })
    expect(w.spawned).toEqual(['sonnet'])
    expect(w.asked.length).toBe(2) // judged and asked as any spawn
    await spawn($, { prompt: `Review what the member did:\n${a.mark}\n${TASKS[0].task}`, model: 'opus', tool_use_id: 'toolu_f2' })
    expect(w.asked.length).toBe(3)
    expect(w.judge.length).toBe(4)
  })

  test('two crew cards with the same task ids keep apart: each member runs on its own card\'s model', async ($, on) => {
    const w = crewWorld(on)
    w.card = () => CREW_ACCEPT
    await start($)
    const one = await crewCall($)
    w.card = () => CREW_MINE
    const two = await crewCall($)
    expect(one.tasks![0].mark).not.toBe(two.tasks![0].mark)
    await member($, one, 'a', 1)
    await member($, two, 'a', 2)
    expect(w.spawned).toEqual(['haiku', 'opus'])
    expect(w.asked.length).toBe(2) // the two crew cards, no card at a member
  })

  test('a reload after accept all: the decided member still runs on the card\'s model, no card', async ($, on) => {
    const w = crewWorld(on)
    w.card = () => CREW_ACCEPT
    await start($)
    const reply = await crewCall($)
    await $.session.start({ cwd: CWD, surface: 'desktop', isInteractive: false })
    await member($, reply, 'a', 1)
    expect(w.spawned).toEqual(['haiku'])
    expect(w.asked.length).toBe(1)
  })

  test('the card cannot be shown: every chosen model stays, the reply still carries the marks', async ($, on) => {
    const w = crewWorld(on)
    w.card = () => { throw new Error('dismissed') }
    await start($)
    const reply = await crewCall($)
    expect(reply.how).toBe('crew card not shown: yours kept')
    expect(reply.tasks!.map((t) => t.model)).toEqual(['opus', 'sonnet', 'haiku'])
    expect(reply.tasks![0].mark).toMatch(/^\[relai-crew /)
  })

  test('more than the card holds: the tool says why, judges nothing', async ($, on) => {
    const w = crewWorld(on)
    await start($)
    const many = Array.from({ length: 13 }, (_, i) => ({ id: `t${i}`, title: 'x' }))
    const reply = await crewCall($, many)
    expect(reply.error).toContain('at most 12')
    expect(w.judge.length).toBe(0)
  })

  test('the router switched off: a marked member runs on the model it was given', async ($, on) => {
    const w = crewWorld(on)
    w.card = () => CREW_ACCEPT
    await start($)
    const reply = await crewCall($)
    await $.command.run({ command: 'relai-model-router', args: 'off', origin: { kind: 'composer' } } as never)
    await spawn($, { prompt: `${reply.tasks![0].mark}\n${TASKS[0].task}`, model: 'opus', tool_use_id: 'toolu_o1' })
    expect(w.spawned).toEqual(['opus'])
  })

  test('a second crew card while one is open is refused at once, the first goes on', async ($, on) => {
    const w = crewWorld(on)
    let answerCard: (label: string) => void = () => undefined
    w.card = () => new Promise<string>((res) => { answerCard = res })
    await start($)
    const first = crewCall($)
    for (let i = 0; i < 500 && w.asked.length === 0; i++) await Promise.resolve()
    const second = await crewCall($)
    expect(second.error).toBe('another crew card is open')
    answerCard(CREW_ACCEPT)
    expect((await first).tasks![0].model).toBe('haiku')
  })

  test('the router asleep (BenAI twin on): the tool says so, 0 judge calls, spawns as before E6', async ($, on) => {
    const w = crewWorld(on, { twin: true })
    await start($)
    const reply = await crewCall($)
    expect(reply.asleep).toBeTruthy()
    expect(reply.tasks).toBe(undefined)
    expect(w.judge.length).toBe(0)
    await spawn($, { model: 'opus' })
    expect(w.spawned).toEqual(['opus'])
    expect(w.asked.length).toBe(0)
  })

  test('bad input says why and judges nothing', async ($, on) => {
    const w = crewWorld(on)
    await start($)
    const reply = await crewCall($, [{ id: 'a b', title: 'x' }])
    expect(reply.error).toContain('task id')
    expect(w.judge.length).toBe(0)
  })

  test('a reload keeps the decisions: a decided member still spawns with no second card', async ($, on) => {
    // "mine for all": alone, task a (opus, judge says fast) would get the E5 card — a lost decision shows
    const w = crewWorld(on)
    w.card = () => CREW_MINE
    await start($)
    const reply = await crewCall($)
    await $.session.start({ cwd: CWD, surface: 'desktop', isInteractive: false })
    await member($, reply, 'a', 1)
    expect(w.asked.length).toBe(1)
    expect(w.judge.length).toBe(2)
    expect(w.spawned).toEqual(['opus'])
  })

  test('the crew pane draws on the terminal and in 40 columns', async ($, on) => {
    const w = crewWorld(on)
    w.card = () => CREW_ACCEPT
    await start($)
    await crewCall($)
    for (const surface of ['terminal', 'desktop'] as const) {
      const ui = await $.ui.mount({ ...CREW_PANE, surface, viewport: { columns: 40, rows: 40 } } as never)
      expect(await ui.find({ type: 'Text', text: /Decided: the crew runs on these models/ })).toBeTruthy()
      expect(await ui.find({ type: 'Text', text: /a · Count files/ })).toBeTruthy()
      await ui.unmount()
    }
  })

  test('layout (live E6): stacked rows never get a zero-width words box — letters would fall one per line', async ($, on) => {
    const w = crewWorld(on)
    w.card = () => CREW_ACCEPT
    await start($)
    await $.tool.call({ tool: CREW, tasks: TASKS } as never)
    for (const [columns, width] of [[40, undefined], [47, undefined], [48, 0], [160, 0]] as const) {
      const ui = await $.ui.mount({ ...CREW_PANE, surface: 'desktop', viewport: { columns, rows: 40 } } as never)
      const words: any = await ui.find({ key: 'crew-a~w' } as never)
      expect([columns, words?.props?.width]).toEqual([columns, width])
      await ui.unmount()
    }
  })
})
