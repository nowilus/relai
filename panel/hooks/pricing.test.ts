import { describe, expect, mock, test, type TestBody } from 'claude-code/testing'
import type { On, RenderNode, TurnStepResult } from 'claude-code'
import { PRICE_FILE, PRICING_PAGE } from './core/pricing.mjs'

// The price list and the documents of the RelAI panel (plan PANEL_CLAUDE, E6, Aneks D): the
// reminder of a model without a price, the card that reads the pricing page only after "Tak" and
// writes only after a second "Tak", an old list's warning, the documents tab and its mark of a file
// the turn changed. Proof by effect: what reached the engine stubs beneath the plugin (the network,
// the disk), with a negative proof wherever "nothing" is the claim.

type Engine = Parameters<TestBody>[0]

const CWD = 'C:/proj'
const NOW = new Date(2026, 9, 9, 12, 0).getTime()
const DIR = `${CWD}/.claude/relai/pomiary`
const FILE = `${DIR}/2026-10-09-session-1.jsonl`
const PRICES = `${CWD}/${PRICE_FILE}`

// The page as the probe read it (2026-10-09), cut to its model table with two models: a cell
// writes its price as "$4<!-- --> <span>/ MTok</span>"
const cell = (usd: number) => `<td><div>$${usd}<!-- --> <span>/ MTok</span></div></td>`
const row = (name: string, ...p: number[]) => `<tr><td rowSpan="1"><div><a href="/docs/x">${name}</a><span>opis</span></div></td>${p.map(cell).join('')}</tr>`
const PAGE = '<html><h2>Model pricing</h2><table><thead>'
  + '<tr><th>Model</th><th>Base tokens</th><th>Prompt caching</th></tr>'
  + '<tr><th>Name</th><th>Input</th><th>Output</th><th>5m writes</th><th>1h writes</th><th>Hits and refreshes</th></tr>'
  + `</thead><tbody>${row('Claude Opus 5.5', 4, 20, 5, 8, 0.2)}${row('Claude Sonnet 5.5', 2, 10, 2.5, 4, 0.1)}</tbody></table></html>`

const rec = (turn: string, agent: string | null, model: string, output: number) => JSON.stringify({
  v: 1, tool: 'claude-code', session: 'session-1', turn, index: 0, agent, kind: 'step', model, at: NOW - 3_600_000,
  input: 0, cacheRead: 0, cacheWrite: 0, output, missing: null, stage: null, task: null,
})
// Two main-loop answers on Opus, four of a subagent on Sonnet: "claude-sonnet-5-5 — 4 rekordy bez ceny"
const RECORDS = [rec('t1', null, 'claude-opus-5-5', 50_000), rec('t2', null, 'claude-opus-5-5', 50_000),
  ...[1, 2, 3, 4].map((i) => rec('s' + i, 'agent-1', 'claude-sonnet-5-5', 100_000))].join('\n') + '\n'

const BASE: Record<string, string> = {
  [`${CWD}/docs/USTAWIENIA.md`]: '# USTAWIENIA\n\nWersja RelAI: 2.7.1\n',
  [`${CWD}/CLAUDE.md`]: '# CLAUDE\n\nAktywny plan: brak\n',
  [FILE]: RECORDS,
}

type Fetch = { url: string, init: unknown }
type Calls = { fetches: Fetch[], writes: Record<string, string>, disk: Record<string, string> }
type Net = { status: number, text: string } | { deny: string }
type Uses = Record<string, { name: string, input: unknown }[]>

function world(on: On, files: Record<string, string>, net: Net = { status: 200, text: PAGE }, now = NOW, uses: Uses = {}): Calls {
  const calls: Calls = { fetches: [], writes: {}, disk: { ...files } }
  const disk = calls.disk
  const key = (path: string) => path.replace(/\\/g, '/')
  mock.clock(on, { now })
  mock.store(on, {})
  on('session.start', ($, e) => ({ cwd: e.cwd }))
  on('session.cwd', () => ({ value: CWD }))
  on('session.id', () => ({ value: 'session-1' }))
  on('fs.exists', ($, e) => ({ value: key(e.path) in disk || Object.keys(disk).some((p) => p.startsWith(key(e.path) + '/')) }))
  on('fs.read', ($, e) => (key(e.path) in disk ? { value: disk[key(e.path)] ?? '' } : { deny: 'ENOENT ' + e.path }))
  on('fs.write', ($, e) => { disk[key(e.path)] = e.text; calls.writes[key(e.path)] = e.text; return { value: undefined } })
  on('fs.list', ($, e) => {
    const dir = key(e.path ?? '') + '/'
    const names = Object.keys(disk).filter((p) => p.startsWith(dir) && !p.slice(dir.length).includes('/'))
    return { value: names.map((p) => ({ name: p.slice(dir.length), kind: 'file' as const, size: 1, mtimeMs: 0, isLink: false })) }
  })
  on('http.fetch', ($, e) => {
    calls.fetches.push({ url: e.url, init: e.init })
    if ('deny' in net) return { deny: net.deny }
    return { value: { status: net.status, ok: net.status >= 200 && net.status < 300, headers: {}, text: net.text } }
  })
  on('command.list', () => ({ value: [] }))
  on('session.usage', () => ({ value: { startedAt: now, context: { tokens: 1000 } as never, rateLimits: [], cost: { usd: 0 } } }))
  on('ui.open', () => ({ value: { isPlaced: true as const } }))
  on('turn.step', async function* ($, e) {
    const result: TurnStepResult = {
      turnId: e.turnId, index: e.index, answer: '', toolUses: uses[`${e.turnId}:${e.index}:${e.agentId ?? 'main'}`] ?? [], stopReason: 'end_turn', usage: null,
    }
    return result
  })
  return calls
}

const pane = (columns: number) => ({
  component: 'Pane' as const, requestId: 'relai-panel',
  props: { title: 'RelAI', isFocused: true, bodyColumns: columns, placement: 'dock' as const, scroll: { offset: 0, bodyRows: 60 }, view: {} },
})

async function open($: Engine, tab: string, surface: 'terminal' | 'desktop' = 'desktop', columns = 100) {
  await $.session.start({ cwd: CWD, surface: 'terminal', isInteractive: true })
  await $.command.run({ command: 'relai-panel' })
  const ui = await $.ui.mount({ plugin: 'relai-panel', surface, ...pane(columns) })
  await ui.press({ key: 'tab-' + tab })
  // Brief v2 §7 (AUDYT_MODOW Z2): the price list is a folded section of the costs tab; these tests
  // read it, and the models whose figures it changes, unfolded (a press only where it is still
  // folded: the fold is kept in $.state across the mounts of one test)
  if (tab === 'costs') {
    for (const s of ['pricing', 'models']) {
      const b = await ui.find({ key: `fold-costs:${s}` })
      if (b && String((b.props as { label?: string }).label).startsWith('▸')) await ui.press({ key: `fold-costs:${s}` })
    }
  }
  return ui
}

async function step($: Engine, turnId: string, index: number, agentId?: string) {
  const s = $.turn.step({ turnId, index, model: 'claude-opus-5-5', messageCount: 1, ...(agentId ? { agentId } : {}) })
  for await (const _chunk of s) { /* the chunks are the engine's */ }
  await s.result
}

const textOf = (node: RenderNode | undefined): string => node === undefined ? '' : typeof node === 'string' ? node
  : ((node as { children?: RenderNode[] }).children ?? []).map(textOf).join('')

// The width instrument of theme.test.ts (E8), verbatim
function minWidth(node: RenderNode): number {
  if (typeof node === 'string') return Math.max(0, ...node.split(/\s+/).map((w) => w.length))
  const p = (node.props ?? {}) as Record<string, unknown>
  if (node.type === 'Button') return String(p.label ?? '').length + 4
  if (node.type === 'Text') return p.wrap && String(p.wrap).startsWith('truncate') ? 1 : minWidth(textOf(node))
  if (node.type !== 'Box') return 0
  const kids = ((node as { children?: RenderNode[] }).children ?? []).filter((k) => typeof k !== 'string' || k.trim())
  const widths = kids.map(minWidth)
  const isRow = p.flexDirection === 'row' && p.flexWrap !== 'wrap'
  const gap = Number(p.columnGap ?? p.gap ?? 0)
  const inner = isRow ? widths.reduce((a, b) => a + b, 0) + gap * Math.max(0, kids.length - 1) : Math.max(0, ...widths)
  const padX = Number(p.paddingLeft ?? p.paddingX ?? p.padding ?? 0) + Number(p.paddingRight ?? p.paddingX ?? p.padding ?? 0)
  return inner + padX + (p.borderStyle ? 2 : 0)
}

describe('the price list in the RelAI panel', () => {
  test('a model without a price: its name and records; nothing reaches the network or the disk before "Tak", nor after "Nie"', async ($, on) => {
    const calls = world(on, BASE)
    const ui = await open($, 'costs')
    const box = textOf(await ui.find({ key: 'cost-pricing' }))
    expect(box).toContain('claude-sonnet-5-5 — 4 rekordy bez ceny')
    expect(box).toContain('Cennik z 2026-10-08')
    await ui.press({ key: 'pr-update' })
    const card = textOf(await ui.find({ key: 'confirm-card' }))
    expect(card).toContain('Zaktualizować cennik?')
    expect(card).toContain('claude-sonnet-5-5 — 4 rekordy bez ceny')
    expect(calls.fetches).toEqual([])
    await ui.press({ key: 'confirm-no' })
    expect(await ui.find({ key: 'confirm-card' })).toBeUndefined()
    expect(calls.fetches).toEqual([])
    expect(PRICES in calls.writes).toBe(false)
    // "Nie" mutes the reminder until the list's date changes
    const after = textOf(await ui.find({ key: 'cost-pricing' }))
    expect(after).not.toContain('4 rekordy bez ceny')
    expect(after).toContain('1 model bez ceny wyciszone do zmiany daty cennika')
    await ui.unmount()
  })

  test('the first "Tak" reads the page once and writes nothing; the second writes the list; the model then has a price', async ($, on) => {
    const calls = world(on, BASE)
    const ui = await open($, 'costs')
    const before = textOf(await ui.find({ key: 'pr-m-0' }))
    expect(before).toContain('claude-sonnet-5-5')
    expect(before).toContain('brak ceny')
    await ui.press({ key: 'pr-update' })
    await ui.press({ key: 'confirm-yes' })
    expect(calls.fetches.length).toBe(1)
    expect(calls.fetches[0]?.url).toBe(PRICING_PAGE)
    // The request carries nothing of the project: no header, no body, no credential
    const init = (calls.fetches[0]?.init ?? {}) as Record<string, unknown>
    expect(init.body).toBeUndefined()
    expect(init.headers).toBeUndefined()
    expect(init.auth).toBeUndefined()
    const second = textOf(await ui.find({ key: 'confirm-card' }))
    expect(second).toContain('Zapisać cennik z 2026-10-09 (1 model zmieniony)?')
    expect(second).toContain('claude-sonnet-5-5: wejście $2.00, wyjście $10.00')
    expect(second).toContain('zostają przy stawkach, którymi je policzono')
    expect(PRICES in calls.writes).toBe(false)
    await ui.press({ key: 'confirm-yes' })
    // The session's footer words (PASKI_W_STOPCE) are its own file, written when the work is read
    expect(Object.keys(calls.writes).filter((p) => p !== FILE && !p.includes('/.claude/relai/stopka/'))).toEqual([PRICES])
    expect(calls.writes[PRICES]).toContain('"claude-sonnet-5-5"')
    expect(textOf(await ui.find({ key: 'sent' }))).toContain(`Zapisano: ${PRICE_FILE}`)
    expect(calls.fetches.length).toBe(1)
    // Measured before the save, without a price then: the first list that knows it prices it now
    const box = textOf(await ui.find({ key: 'cost-pricing' }))
    expect(box).not.toContain('bez ceny')
    expect(box).toContain('Cennik z 2026-10-09')
    expect(textOf(await ui.find({ key: 'cost-models-1' }))).toContain('$4.00') // 4 × 100k output at $10 per million
    // The project's list of models says it too, where the person looks after a save
    const after = textOf(await ui.find({ key: 'pr-m-0' }))
    expect(after).toContain('claude-sonnet-5-5')
    expect(after).toContain('4 rekordy')
    expect(after).toContain('$4.00')
    await ui.unmount()
  })

  // One read that fails: the card ends, the reason in words, nothing written
  const failing = (net: Net, words: string): Parameters<typeof test>[1] => async ($, on) => {
    const calls = world(on, BASE, net)
    const ui = await open($, 'costs')
    await ui.press({ key: 'pr-update' })
    await ui.press({ key: 'confirm-yes' })
    expect(calls.fetches.length).toBe(1)
    expect(await ui.find({ key: 'confirm-card' })).toBeUndefined()
    const said = textOf(await ui.find({ key: 'sent' }))
    expect(said).toContain(words)
    expect(said).toContain('cennik nietknięty')
    expect(PRICES in calls.writes).toBe(false)
    await ui.unmount()
  }
  test('no network: the card ends in words and nothing is written', failing({ deny: 'getaddrinfo ENOTFOUND platform.claude.com' }, 'brak odczytu strony cennika'))
  test('an error status: the card ends in words and nothing is written', failing({ status: 503, text: '' }, 'odpowiedziała 503'))
  test('a changed page: the card ends in words and nothing is written', failing({ status: 200, text: '<html><table><tr><th>Name</th><th>Price</th></tr></table></html>' }, 'na stronie nie ma tabeli cen modeli'))

  test('an old list is called old past the threshold in USTAWIENIA; younger, nothing is said', async ($, on) => {
    world(on, BASE, { status: 200, text: PAGE }, new Date(2026, 10, 20, 12, 0).getTime())
    const old = await open($, 'costs')
    expect(textOf(await old.find({ key: 'cost-pricing' }))).toContain('cennik z 2026-10-08 ma 43 dni (próg 30)')
    await old.unmount()
  })

  test('the threshold row of USTAWIENIA is read: 60 days keeps a 43-day list quiet', async ($, on) => {
    const settings = '# USTAWIENIA\n\nWersja RelAI: 2.7.1\n\n| Data | Czego dotyczy | Decyzja |\n|---|---|---|\n| 2026-10-09 | Cennik panelu | ostrzeżenie po 60 dni |\n'
    world(on, { ...BASE, [`${CWD}/docs/USTAWIENIA.md`]: settings }, { status: 200, text: PAGE }, new Date(2026, 10, 20, 12, 0).getTime())
    const ui = await open($, 'costs')
    expect(textOf(await ui.find({ key: 'cost-pricing' }))).not.toContain('ma 43 dni')
    await ui.unmount()
  })

  test('nothing new is wider than a 40-column pane: the price list, its card in both steps, the documents', async ($, on) => {
    world(on, BASE)
    for (const surface of ['terminal', 'desktop'] as const) {
      const ui = await open($, 'costs', surface, 40)
      expect(minWidth(await ui.drawn())).toBeLessThanOrEqual(40)
      await ui.press({ key: 'pr-update' })
      expect(minWidth(await ui.drawn())).toBeLessThanOrEqual(40)
      await ui.press({ key: 'confirm-yes' })
      expect(await ui.find({ key: 'confirm-card' })).toBeDefined()
      expect(minWidth(await ui.drawn())).toBeLessThanOrEqual(40)
      await ui.press({ key: 'confirm-no' })
      await ui.press({ key: 'tab-docs' })
      expect(minWidth(await ui.drawn())).toBeLessThanOrEqual(40)
      await ui.unmount()
    }
  })

  test('the width instrument catches an overflow (positive control on a planted defect)', async () => {
    const wide = { type: 'Box', props: { flexDirection: 'row' }, children: [{ type: 'Text', props: {}, children: ['x'.repeat(41)] }] } as unknown as RenderNode
    expect(minWidth(wide)).toBeGreaterThan(40)
  })
})
