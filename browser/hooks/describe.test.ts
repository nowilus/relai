import { describe, expect, mock, test, type TestBody } from 'claude-code/testing'
import type { On, TurnStepResult } from 'claude-code'
import { DEFAULT_HELPER, MAX_WORDS, addUsage, capWords, describePrompt, describeRecord, describedResult, readMode, sourcePathOf, spawnAlias, textOf, textTokens } from './describe'

// Describe mode of relai-browser (plan MODY_OSZCZEDZANIA, E2): a saved screenshot in words from a
// hidden helper subagent; the secret scanner reads the result's text first (decision of Lukasz,
// E2) and a hit sends nothing — the picture is shrunk instead. Negative proof (rule 3): a key in
// the text beside the picture means 0 spawns; the same picture without it means exactly 1.

type Engine = Parameters<TestBody>[0]

const CWD = 'C:/proj'
const HOME = 'C:/Users/T'
const SHOT = 'C:\\Users\\T\\tool-results\\shot.jpg'
// A key assembled from pieces: the repository's own scanner refuses it written whole
const KEY = ['s', 'k-ant-api03-', 'AbCdEfGhIjKlMnOpQrStUvWxYz0123456789'].join('')
const browserResult = (tab: string) => [
  { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: 'J'.repeat(600) } },
  { type: 'text', text: `[Image: source: ${SHOT}]` },
  { type: 'text', text: 'Screenshot size: 799x609' },
  { type: 'text', text: `\n\nTab Context:\n- title: ${tab}` },
]
const ANSWER = 'A settings page titled Billing. Text: "Plan: Pro", "Save". Button Save at the bottom right, enabled.'

describe('describe: pure parts', () => {
  test('the mode defaults to shrink with the helper model, a stored model id is checked', () => {
    expect(readMode(undefined)).toEqual({ mode: 'shrink', model: DEFAULT_HELPER })
    expect(readMode({ mode: 'describe', model: 'claude-sonnet-5-5' })).toEqual({ mode: 'describe', model: 'claude-sonnet-5-5' })
    expect(readMode({ mode: 'describe', model: 'x; rm -rf' }).model).toBe(DEFAULT_HELPER)
  })

  test('the saved file of a screenshot, its text for the scanner, nothing for a Read picture', () => {
    expect(sourcePathOf(browserResult('Home'))).toBe(SHOT)
    expect(sourcePathOf({ type: 'image', file: { base64: 'P' } })).toBe(null)
    expect(textOf(browserResult('Home'))).toContain('title: Home')
    expect(describePrompt(SHOT)).toContain(SHOT)
    expect(describePrompt(SHOT)).toContain(`at most ${MAX_WORDS} words`)
  })

  test('the reply is cut to 250 words; the picture leaves the result, its words come in', () => {
    const long = Array.from({ length: 300 }, (_, i) => `w${i}`).join(' ')
    expect(capWords(long).split(' ').length).toBe(MAX_WORDS + 1) // 250 words and the ellipsis
    expect(textTokens('abcdefgh')).toBe(2)
    const out = describedResult(browserResult('Home'), ANSWER, 799, 609) as { type: string, text?: string }[]
    expect(out.some((b) => b.type === 'image')).toBe(false)
    expect(out[out.length - 1]?.text).toContain(ANSWER)
  })

  test('the spawn alias from a full id: the family, haiku when none is named', () => {
    expect(spawnAlias('claude-haiku-5-5')).toBe('haiku')
    expect(spawnAlias('claude-sonnet-5-5')).toBe('sonnet')
    expect(spawnAlias('Opus')).toBe('opus')
    expect(spawnAlias('x-1')).toBe('haiku')
  })

  test('usage of the steps summed; cache tokens counted as input, never cheaper (R6)', () => {
    const a = addUsage(null, { model: 'claude-haiku-5-5', input_tokens: 10, output_tokens: 5, cache_read_input_tokens: 100, cache_creation_input_tokens: 20 })
    expect(addUsage(a, { input_tokens: 3, output_tokens: 7 })).toEqual({ model: 'claude-haiku-5-5', in: 133, out: 12 })
  })
})

type World = { spawns: unknown[], resized: number, disk: Record<string, string>, logs: string[] }

function world(on: On, tab: string): World {
  const w: World = {
    spawns: [], resized: 0, logs: [],
    disk: {
      [`${CWD}/docs/USTAWIENIA.md`]: '# USTAWIENIA\n\nWersja RelAI: 3.8.0\n\n| Data | Czego dotyczy | Decyzja |\n|---|---|---|\n| 2026-11-11 | Mody oszczędzania | zgoda — test |\n',
    },
  }
  const key = (p: string) => p.replace(/\\/g, '/')
  mock.clock(on, { now: Date.UTC(2026, 10, 11, 12, 0) })
  mock.store(on, {})
  on('session.start', ($, e) => ({ cwd: e.cwd }))
  on('session.id', () => ({ value: 'sesja-d' }))
  on('fs.exists', ($, e) => ({ value: key(e.path) in w.disk }))
  on('fs.read', ($, e) => (key(e.path) in w.disk ? { value: w.disk[key(e.path)] ?? '' } : { deny: 'ENOENT ' + e.path }))
  on('fs.write', ($, e) => { w.disk[key(e.path)] = e.text; return { value: undefined } })
  on('process.run', ($, e) => {
    const argv = (e as unknown as { argv: string[] }).argv
    if (argv[0] === 'cmd.exe') return { value: { exitCode: 0, stdout: HOME, stderr: '' } } as never
    w.resized++
    return { value: { exitCode: 0, stdout: '799 609 512 390 U01BTEw=', stderr: '' } } as never
  })
  on('command.register', () => ({ value: undefined }) as never)
  on('agent.register', () => ({ value: { agent: 'relai-browser:describer' } }) as never)
  on('agent.spawn', ($, e) => { w.spawns.push(e); return { model: 'claude-haiku-5-5', agentId: 'agent-d1' } })
  on('turn.step', async function* ($, e) {
    const result: TurnStepResult = {
      turnId: e.turnId, index: e.index, answer: ANSWER, toolUses: [], stopReason: 'end_turn',
      usage: { input_tokens: 1500, output_tokens: 120, cache_read_input_tokens: 0, cache_creation_input_tokens: 0, model: 'claude-haiku-5-5' },
    }
    return result
  })
  on('ui.log', ($, e) => { w.logs.push(String((e as unknown as { text?: string, message?: string }).text ?? (e as unknown as { message?: string }).message ?? JSON.stringify(e))); return { value: undefined } as never })
  on('turn.complete', ($, e) => ({ text: (e as unknown as { answer: string }).answer }))
  on('tool.call', () => ({ result: browserResult(tab), text: '' }) as never)
  return w
}

async function shot($: Engine) {
  await $.session.start({ cwd: CWD, surface: 'desktop', isInteractive: false })
  await $.command.run({ command: 'relai-browser', args: 'describe', origin: { kind: 'composer' } } as never)
  // The describer's step and answer, as the engine sends them; they may precede spawn's resolve
  const s = $.turn.step({ turnId: 'd1', index: 0, model: 'claude-haiku-5-5', messageCount: 1, agentId: 'agent-d1' } as never)
  for await (const _c of s) { /* engine chunks */ }
  await s.result
  await $.turn.complete({ answer: ANSWER, durationMs: 900, isAborted: false, turnId: 'd1', reason: 'answer', agentId: 'agent-d1' } as never)
  return await $.tool.call({ tool: 'mcp__Claude_Browser__computer', action: 'screenshot', tool_use_id: 'toolu_d1' } as never) as { result: { type: string, text?: string }[] }
}

const ledger = (w: World) => Object.entries(w.disk).filter(([p]) => p.includes('/oszczednosci/rejestr/')).map(([, t]) => t).join('')

describe('describe: the secret scanner before the helper (rule 3)', () => {
  test('a key in the text beside the picture: 0 spawns, the picture shrunk', async ($, on) => {
    const w = world(on, `Console — ${KEY}`)
    const out = await shot($)
    expect(w.spawns.length).toBe(0)
    expect(w.resized).toBe(1)
    expect(out.result.some((b) => b.type === 'image')).toBe(true)
    expect(ledger(w)).toContain('"action":"shrink"')
    expect(ledger(w)).not.toContain('"action":"describe"')
  })

  // The test engine sets no agentId on a spawn a hook answers ("Set by core"): the subagent's
  // words come only live (POMIAR in the work folder); here the count and the fallback
  test('the same picture without the key: exactly 1 spawn of the hidden describer with the file path', async ($, on) => {
    const w = world(on, 'Billing — Settings')
    const out = await shot($)
    expect(w.spawns.length).toBe(1)
    const spawn = w.spawns[0] as { subagentType: string, model: string, prompt: string }
    // The engine's own input shape (tool "Agent"): the type and the model are named in it
    const seen = JSON.stringify(spawn)
    expect(seen).toContain('relai-browser:describer')
    expect((spawn as unknown as { model: string }).model).toBe('haiku') // the Agent tool takes an alias only (live E2)
    expect(spawn.prompt).toContain(SHOT)
    expect(w.logs.join('\n')).toContain('no agent started')
    expect(w.resized).toBe(1) // no answer: the picture is shrunk, never lost
    expect(out.result.some((b) => b.type === 'image')).toBe(true)
  })
})

describe('describe: the ledger record', () => {
  test('measured with the helper usage; before = picture tokens, after = words / 4 in both copies (hand-back, live E2)', () => {
    const rec = describeRecord({ toolUseId: 't1', tool: 'mcp__Claude_Browser__computer', w: 799, h: 609, before: 649, text: ANSWER, ms: 900, usage: { model: 'claude-haiku-5-5', in: 1500, out: 120 }, model: DEFAULT_HELPER })
    expect(rec.measured).toBe(true)
    expect(rec.helper).toEqual({ model: 'claude-haiku-5-5', in: 1500, out: 120 })
    expect(rec.before).toBe(649)
    expect(rec.after).toBe(2 * Math.ceil(ANSWER.length / 4)) // the result and the hand-back message
  })

  test('no usage seen: no saving claimed (R6)', () => {
    const rec = describeRecord({ toolUseId: 't1', tool: 'x', w: 799, h: 609, before: 649, text: ANSWER, ms: 900, usage: null, model: DEFAULT_HELPER })
    expect(rec.before).toBe(rec.after)
    expect(rec.measured).toBe(false)
    expect(rec.helper).toBe(undefined)
  })
})
