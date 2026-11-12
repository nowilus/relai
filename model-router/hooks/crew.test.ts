import { describe, expect, test } from 'claude-code/testing'
import { CREW_ACCEPT, CREW_MAX_TASKS, CREW_MINE, CREW_START, acceptAll, baseOf, crewAction, crewAnswerOf, crewOptions, crewQuestion, crewReply, crewTasksOf, decisionFor, decisionsOf, differs, isDecidedSpawn, keepRuns, mapLimit, markIn, markOf, mineAll, rowOf, runTokenOf, sessionAll, togglePick } from './crew'
import type { CrewRow, CrewTask } from './crew'
import { DEFAULT_TIERS } from './judge'

// The pure parts of the crew card (plan MODY_OSZCZEDZANIA, E6; spec, section 5, row /relai-crew).

const task = (o: Partial<CrewTask>): CrewTask => ({ id: 't1', title: 'Count files', task: '', model: 'opus', ...o })
const judged = (tier: 'fast' | 'balanced' | 'deep') => ({ kind: 'judged' as const, tier, rule: `rule ${tier}` })

/** Three rows: opus chosen, judge says fast (differs); sonnet chosen, judge agrees; haiku chosen, secret. */
const ROWS: CrewRow[] = [
  rowOf(task({ id: 'a', model: 'opus' }), 'opus', true, judged('fast'), DEFAULT_TIERS),
  rowOf(task({ id: 'b', model: 'sonnet' }), 'sonnet', true, judged('balanced'), DEFAULT_TIERS),
  rowOf(task({ id: 'c', model: 'haiku' }), 'haiku', true, { kind: 'secret', label: 'anthropic-key' }, DEFAULT_TIERS),
]

describe('crew: the orchestrator input', () => {
  test('a valid list becomes tasks; an empty model is no model', () => {
    const r = crewTasksOf({ tasks: [{ id: 'T-1', title: ' Count ', task: 'x', model: 'opus' }, { id: 'T.2', title: 'B', model: ' ' }] })
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.tasks[0]).toEqual({ id: 'T-1', title: 'Count', task: 'x', model: 'opus' })
    expect(r.tasks[1].model).toBe(null)
  })

  test('bad input says why: empty, too many, bad or repeated id, no title', () => {
    expect(crewTasksOf({ tasks: [] }).ok).toBe(false)
    expect(crewTasksOf(null).ok).toBe(false)
    const many = Array.from({ length: CREW_MAX_TASKS + 1 }, (_, i) => ({ id: `t${i}`, title: 'x' }))
    expect(crewTasksOf({ tasks: many }).ok).toBe(false)
    expect(crewTasksOf({ tasks: [{ id: 'a b', title: 'x' }] }).ok).toBe(false)
    expect(crewTasksOf({ tasks: [{ id: 'a', title: 'x' }, { id: 'a', title: 'y' }] }).ok).toBe(false)
    expect(crewTasksOf({ tasks: [{ id: 'a', title: '  ' }] }).ok).toBe(false)
  })
})

describe('crew: the base model of a task', () => {
  test('the interview model is someone\'s choice; then the subagent default (Annex B); then the session\'s, nobody\'s', () => {
    expect(baseOf(task({ model: 'haiku' }), 'claude-sonnet-5-5', 'claude-opus-5-5')).toEqual({ from: 'haiku', isExplicit: true })
    expect(baseOf(task({ model: null }), 'claude-sonnet-5-5', 'claude-opus-5-5')).toEqual({ from: 'claude-sonnet-5-5', isExplicit: true })
    expect(baseOf(task({ model: null }), null, 'claude-opus-5-5')).toEqual({ from: 'claude-opus-5-5', isExplicit: false })
  })
})

describe('crew: rows', () => {
  test('a chosen model differing from the suggestion waits for the person: no pick yet', () => {
    expect(ROWS[0]).toMatchObject({ mine: 'opus', suggestion: 'haiku', outcome: 'judged', pick: null })
    expect(differs(ROWS[0])).toBe(true)
    expect(differs(ROWS[1])).toBe(false)
  })

  test('a secret row has no suggestion and keeps the model (the judge never saw it)', () => {
    expect(ROWS[2]).toMatchObject({ suggestion: null, outcome: 'secret', pick: null })
    expect(ROWS[2].rule).toContain('secret scanner')
    expect(differs(ROWS[2])).toBe(false)
  })

  test('a model nobody chose takes the judge\'s tier at once, and needs no card', () => {
    const r = rowOf(task({ model: null }), 'opus', false, judged('fast'), DEFAULT_TIERS)
    expect(r.pick).toBe('haiku')
    expect(differs(r)).toBe(false)
    expect(crewAction([r], { pref: 'ask', hasHuman: true })).toBe('quiet')
  })

  test('a failed judge and a model outside the list leave the row as it was', () => {
    expect(rowOf(task({}), 'opus', true, { kind: 'failed', why: 'timeout' }, DEFAULT_TIERS)).toMatchObject({ outcome: 'failed', pick: null, suggestion: null })
    expect(rowOf(task({ model: 'gpt-6.1-sol' }), null, true, judged('fast'), DEFAULT_TIERS)).toMatchObject({ outcome: 'outside', pick: null })
  })
})

describe('crew: what the card does', () => {
  test('nothing differs → quiet; a person → ask; nobody → the suggestion applies; the session answer stands', () => {
    expect(crewAction([ROWS[1], ROWS[2]], { pref: 'ask', hasHuman: true })).toBe('quiet')
    expect(crewAction(ROWS, { pref: 'ask', hasHuman: true })).toBe('ask')
    expect(crewAction(ROWS, { pref: 'ask', hasHuman: false })).toBe('apply')
    expect(crewAction(ROWS, { pref: 'mine', hasHuman: true })).toBe('keep')
    expect(crewAction(ROWS, { pref: 'suggestion', hasHuman: true })).toBe('apply')
    expect(crewAction(ROWS, { pref: 'session', hasHuman: true })).toBe('session')
  })

  test('the pane button toggles one differing row between yours and the suggestion; other rows stay', () => {
    const once = togglePick(ROWS, 'a')
    expect(once[0].pick).toBe('haiku')
    expect(togglePick(once, 'a')[0].pick).toBe(null)
    expect(togglePick(ROWS, 'b')).toEqual(ROWS)
    expect(togglePick(ROWS, 'c')).toEqual(ROWS)
    expect(ROWS[0].pick).toBe(null) // no mutation
  })

  test('accept all applies every suggestion and nothing else; mine for all undoes the picks', () => {
    const all = acceptAll(ROWS)
    expect(all.map((r) => r.pick)).toEqual(['haiku', null, null])
    expect(mineAll(all).map((r) => r.pick)).toEqual([null, null, null])
    expect(ROWS[0].pick).toBe(null)
  })

  test('mine for all keeps a pinned tier of a model nobody chose', () => {
    const free = rowOf(task({ id: 'f', model: null }), 'opus', false, judged('fast'), DEFAULT_TIERS)
    expect(mineAll([free])[0].pick).toBe('haiku')
  })

  test('always the session\'s model puts it on every differing row', () => {
    expect(sessionAll(ROWS, 'sonnet').map((r) => r.pick)).toEqual(['sonnet', null, null])
    expect(sessionAll(ROWS, null)).toEqual(ROWS)
  })

  test('the card\'s answer: start keeps the pane\'s picks, accept all, mine, and anything else keeps yours', () => {
    const picked = togglePick(ROWS, 'a')
    expect(crewAnswerOf(CREW_START, picked, true).rows[0].pick).toBe('haiku')
    expect(crewAnswerOf(CREW_ACCEPT, ROWS, false).rows[0].pick).toBe('haiku')
    expect(crewAnswerOf(CREW_MINE, picked, true).rows[0].pick).toBe(null)
    expect(crewAnswerOf('something typed', picked, true)).toMatchObject({ word: 'no answer: mine kept, pane picks dropped (a)' })
    expect(crewAnswerOf('something typed', ROWS, true)).toMatchObject({ word: 'no answer: mine kept' })
    expect(crewAnswerOf('something typed', picked, true).rows[0].pick).toBe(null)
    expect(crewAnswerOf(CREW_START, picked, false).rows[0].pick).toBe(null) // no pane: start is not an option
  })

  test('options: three with the pane, two without; questions name the count and, without the pane, each task', () => {
    expect(crewOptions(true)).toEqual([CREW_START, CREW_ACCEPT, CREW_MINE])
    expect(crewOptions(false)).toEqual([CREW_ACCEPT, CREW_MINE])
    expect(crewQuestion(ROWS, true)).toContain('1 of 3')
    const q = crewQuestion(ROWS, false)
    expect(q).toContain('a: Count files — yours opus, suggestion haiku')
    expect(q).toContain('b: Count files — yours sonnet\n')
    expect(q.endsWith('?')).toBe(true)
  })
})

describe('crew: the mark that spares a second card', () => {
  test('a run token: the call id\'s tail and the call number; never a constant shared by two cards', () => {
    const run = runTokenOf('toolu_01AoerMfsvdRwnHkRunNt8h7', 1)
    expect(run).toBe('unNt8h71')
    expect(runTokenOf('', 1)).not.toBe(runTokenOf('', 2))
    expect(runTokenOf('toolu_same', 1)).not.toBe(runTokenOf('toolu_same', 2))
    expect(runTokenOf('x', 400000).length).toBeLessThanOrEqual(10)
  })

  test('a mark counts only alone on the first line; quoted further down it is no mark', () => {
    const run = runTokenOf('toolu_01AoerMfsvdRwnHkRunNt8h7', 1)
    expect(markIn(`${markOf(run, 'T-1')}\nDo the task`)).toEqual({ run, id: 'T-1' })
    expect(markIn(markOf(run, 'T-1'))).toEqual({ run, id: 'T-1' })
    expect(markIn(`Fix what the member did:\n${markOf(run, 'T-1')}\nDo the task`)).toBe(null)
    expect(markIn(`see ${markOf(run, 'T-1')}\nDo`)).toBe(null)
    expect(markIn('Do the task [relai-crew bad mark]')).toBe(null)
    expect(markIn('')).toBe(null)
  })

  test('a decided spawn asks for no model, the reply\'s or the interview\'s; any other model is a new choice', () => {
    const [d] = decisionsOf('R1', acceptAll(ROWS))
    expect(d).toMatchObject({ model: 'haiku', replied: 'haiku', given: 'opus' })
    expect(isDecidedSpawn(d, undefined)).toBe(true)
    expect(isDecidedSpawn(d, 'haiku')).toBe(true)
    expect(isDecidedSpawn(d, 'opus')).toBe(true)
    expect(isDecidedSpawn(d, 'sonnet')).toBe(false)
    expect(isDecidedSpawn(d, 'claude-opus-5-5')).toBe(false)
  })

  test('decisions are kept by whole runs, the newest first to stay', () => {
    const one = (run: string) => decisionsOf(run, ROWS)
    let kept: ReturnType<typeof one> = []
    for (const r of ['R1', 'R2', 'R3']) kept = keepRuns(kept, r, one(r), 2)
    expect([...new Set(kept.map((d) => d.run))]).toEqual(['R2', 'R3'])
    expect(kept.length).toBe(6)
    expect(keepRuns(kept, 'R3', one('R3').slice(0, 1), 2).filter((d) => d.run === 'R3').length).toBe(1) // a run replaced whole
  })

  test('a decided member finds its decision; another run or task finds none', () => {
    const list = decisionsOf('R1', acceptAll(ROWS))
    expect(decisionFor(list, { run: 'R1', id: 'a' })).toEqual({ run: 'R1', id: 'a', model: 'haiku', replied: 'haiku', given: 'opus', rowIndex: 0 })
    expect(decisionFor(list, { run: 'R1', id: 'b' })).toMatchObject({ model: null })
    expect(decisionFor(list, { run: 'R2', id: 'a' })).toBe(null)
    expect(decisionFor(list, { run: 'R1', id: 'z' })).toBe(null)
    expect(decisionFor(list, null)).toBe(null)
  })

  test('the reply gives each task its model (the chosen one when unchanged) and its mark', () => {
    const o = JSON.parse(crewReply('R1', acceptAll(ROWS), 'card: accept all'))
    expect(o.tasks[0]).toMatchObject({ id: 'a', model: 'haiku', changed: true, mark: '[relai-crew R1/a]' })
    expect(o.tasks[1]).toMatchObject({ id: 'b', model: 'sonnet', changed: false })
    expect(o.tasks[2]).toMatchObject({ id: 'c', model: 'haiku', changed: false })
  })

  test('unchanged, the reply passes the interview\'s model exactly as given: a full id, [1m], a model outside the list', () => {
    const rows = [
      rowOf(task({ id: 'x', model: 'opus[1m]' }), 'opus', true, judged('deep'), DEFAULT_TIERS),
      rowOf(task({ id: 'y', model: 'claude-opus-4-1' }), 'opus', true, judged('deep'), DEFAULT_TIERS),
      rowOf(task({ id: 'z', model: 'gpt-6.1-sol' }), null, true, judged('fast'), DEFAULT_TIERS),
      rowOf(task({ id: 'w', model: null }), 'sonnet', true, judged('balanced'), DEFAULT_TIERS),
    ]
    const o = JSON.parse(crewReply('R1', rows, 'quiet'))
    expect(o.tasks.map((t: { model: string | null }) => t.model)).toEqual(['opus[1m]', 'claude-opus-4-1', 'gpt-6.1-sol', null])
    expect(o.tasks.every((t: { changed: boolean }) => t.changed === false)).toBe(true)
  })

  test('a secret row keeps no title: not on the card, not in the pane', () => {
    const r = rowOf(task({ id: 's', title: 'Use sk-ant-xyz to call' }), 'opus', true, { kind: 'secret', label: 'anthropic-key' }, DEFAULT_TIERS)
    expect(r.title).toBe('(held back by the secret scanner)')
    expect(crewQuestion([r], false)).not.toContain('sk-ant')
  })

  test('the task text is cut as the judge reads it', () => {
    const r = crewTasksOf({ tasks: [{ id: 'a', title: 't', task: 'x'.repeat(50_000) }] })
    expect(r.ok && r.tasks[0].task.length).toBeLessThanOrEqual(12_000)
  })
})

describe('crew: judging with a limit', () => {
  test('at most the limit runs at once, and the order is kept', async () => {
    let now = 0
    let most = 0
    const out = await mapLimit([1, 2, 3, 4, 5], 2, async (x) => {
      now += 1
      most = Math.max(most, now)
      await Promise.resolve()
      await Promise.resolve()
      now -= 1
      return x * 10
    })
    expect(out).toEqual([10, 20, 30, 40, 50])
    expect(most).toBe(2)
  })
})
