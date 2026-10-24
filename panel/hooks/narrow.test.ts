import { describe, expect, mock, test, type TestBody } from 'claude-code/testing'
import type { On, RenderNode, TurnStepResult } from 'claude-code'
import { FORMS } from './core/commands.mjs'
import { PRICE_FILE, PRICING, PRICING_SOURCE, serializePriceFile } from './core/pricing.mjs'
import { visible } from './skin'
import { STACK_BELOW } from './pane-parts'

// The pane in a narrow split pane (branch PANEL_WASKI, 2026-10-14). Each tab is drawn on a desktop
// at the widths a split window gives it and laid out by a model of the surface's flex: a child's
// basis is its one-line width, a row that overflows shrinks its children by flexShrink (1 unless
// said) but never below what they hold at the least (minContent: the longest word, a button's
// label), a wrapping row breaks into lines by basis, and the leftover goes to flexGrow. Then four
// signs of a broken layout: a truncated text that does not fit, a row wider than its card (a
// button pushed past the edge, "Otwó" on the screenshots), a word wider than its card, two framed
// cards with no gap between them.

type Engine = Parameters<TestBody>[0]

const CWD = 'C:/proj'
const NOW = new Date(2026, 9, 14, 12, 0).getTime()
const CELL_PX = 8.2 // a desktop cell in CSS px (P-024 pkt 3): an Svg's width in cells

// The project as it stood on the screenshots: a plan with a long stage name, a branch, an archive
const STATUS = [
  '# STATUS — plan PANEL_CODEX', '',
  '[PLAN.html](PLAN.html) · **ZAAKCEPTOWANY 2026-10-10** · model wykonawczy: gpt-6.1-sol, w Codeksie', '',
  '| Etap | Nazwa | Status | Prompt | Uwagi |', '|---|---|---|---|---|',
  '| E1 | Natywny widok i mostek bieżącego czatu | W TOKU | [PROMPT_ETAP_1.md](PROMPT_ETAP_1.md) | |',
  '| E2 | Formularze komend w widoku Codeksa | OCZEKUJE | — | |',
  '| E3 | Wydanie i pomiar na żywo | OCZEKUJE | — | |', '',
  '## Odnogi', '',
  '- **PANEL_WASKI** — panel bez rozjazdów w wąskim panelu podziału okna · źródło: E1 · [karta](odnogi/PANEL_WASKI/ODNOGA.md) · **OTWARTA**', '',
].join('\n')
const ARCHIVED = [
  '# STATUS — plan PROWADZENIE_END_TO_END', '',
  'Plan: [PLAN.html](PLAN.html) · Status: **ZREALIZOWANY 2026-09-24** (7/7 etapów)', '',
  '| Etap | Nazwa | Status | Prompt | Uwagi |', '|---|---|---|---|---|',
  '| E1 | Szybkie poprawki i wydanie 2.3.1 | ZREALIZOWANY 2026-09-24 | — | |',
  '| E2 | Lżejszy start sesji | ZREALIZOWANY 2026-09-24 | — | |',
].join('\n')
const PROMPT = ['# PROMPT_ETAP_1', '', '## Weryfikacja', '', '- [x] Natywny widok w Codeksie', '- [ ] Pomiar po restarcie aplikacji z poprawką fontów', '- [ ] Świeży szkic układu'].join('\n')
const KOMENDY = [
  '## Komendy', '', '| Komenda | Co robi | Kiedy użyć |', '|---|---|---|',
  '| `/relai-backup` | pakuje cały projekt do jednego pliku ZIP | przed większą zmianą |', '',
  '## Frazy, które działają', '', '| Powiesz | Co się stanie |', '|---|---|',
  '| „kontynuujemy pracę" | RelAI odtwarza kontekst i proponuje najbliższy krok |', '| „sprawdź status" | krótki raport o stanie planów, ryzyk i zaległości |', '',
].join('\n')
const FILES: Record<string, string> = {
  // A price list read from the page, as the project holds one: its source carries the long word
  // "(platform.claude.com)," that pushed "Rozwiń" past the card's edge (live 2026-10-14)
  [`${CWD}/${PRICE_FILE}`]: serializePriceFile([], { date: '2026-10-09', source: `${PRICING_SOURCE}, odczyt 2026-10-09`, from: 0, models: PRICING.models }),
  [`${CWD}/docs/USTAWIENIA.md`]: '# USTAWIENIA\n\nWersja RelAI: 3.1.0\n',
  [`${CWD}/CLAUDE.md`]: '# CLAUDE\n\nAktywny plan: [PANEL_CODEX](docs/plany/PANEL_CODEX/STATUS.md) — w toku.\n',
  [`${CWD}/docs/plany/PANEL_CODEX/STATUS.md`]: STATUS,
  [`${CWD}/docs/plany/PANEL_CODEX/PROMPT_ETAP_1.md`]: PROMPT,
  [`${CWD}/docs/archiwum/plany/PROWADZENIE_END_TO_END/STATUS.md`]: ARCHIVED,
  [`${CWD}/docs/KOMENDY.md`]: KOMENDY,
  [`${CWD}/docs/STATE.md`]: '# STATE\n\nStan na dziś.\n',
  [`${CWD}/docs/DZIENNIK.md`]: '# DZIENNIK\n\nWpisy.\n',
}
const COMMANDS = FORMS.map((f) => 'relai:' + f.command)

function world(on: On) {
  const disk: Record<string, string> = { ...FILES }
  const key = (path: string) => path.replace(/\\/g, '/')
  mock.clock(on, { now: NOW })
  mock.store(on, {})
  on('session.start', ($, e) => ({ cwd: e.cwd }))
  on('session.cwd', () => ({ value: CWD }))
  on('session.id', () => ({ value: 'session-1' }))
  on('session.model', () => ({ value: 'claude-opus-5-5' }))
  on('fs.exists', ($, e) => ({ value: key(e.path) in disk || Object.keys(disk).some((p) => p.startsWith(key(e.path) + '/')) }))
  on('fs.read', ($, e) => (key(e.path) in disk ? { value: disk[key(e.path)] ?? '' } : { deny: 'ENOENT ' + e.path }))
  on('fs.write', ($, e) => { disk[key(e.path)] = e.text; return { value: undefined } })
  on('fs.stat', ($, e) => (key(e.path) in disk ? { value: { kind: 'file' as const, size: (disk[key(e.path)] ?? '').length, mtimeMs: NOW - 60_000, isLink: false } } : { deny: 'ENOENT ' + e.path }))
  on('fs.list', ($, e) => {
    const dir = key(e.path ?? '') + '/'
    const names = new Map<string, 'file' | 'dir'>()
    for (const p of Object.keys(disk).filter((x) => x.startsWith(dir))) {
      const rest = p.slice(dir.length)
      const cut = rest.indexOf('/')
      names.set(cut < 0 ? rest : rest.slice(0, cut), cut < 0 ? 'file' : 'dir')
    }
    return { value: [...names].map(([name, kind]) => ({ name, kind, size: 1, mtimeMs: NOW - 60_000, isLink: false })) }
  })
  on('process.run', () => ({ value: { exitCode: 0, stdout: '', stderr: '', isStdoutTruncated: false, isStderrTruncated: false } as never }))
  on('command.list', () => ({ value: COMMANDS.map((name) => ({ name, description: `opis ${name}`, source: 'plugin' as const })) }))
  on('session.usage', () => ({ value: { startedAt: NOW, context: { tokens: 1000 } as never, rateLimits: [], cost: { usd: 8.42 } } }))
  on('command.run', () => ({ text: 'ok' }))
  on('ui.open', () => ({ value: { isPlaced: true as const } }))
  on('agent.spawn', () => ({ model: 'claude-opus-5-5', agentId: 'agent-7' }))
  on('turn.step', async function* ($, e) {
    const result: TurnStepResult = {
      turnId: e.turnId, index: e.index, answer: 'x', toolUses: [], stopReason: 'end_turn',
      usage: { input_tokens: 2, cache_read_input_tokens: 180000, cache_creation_input_tokens: 4000, output_tokens: 2200, model: 'claude-opus-5-5' },
    }
    return result
  })
}

const pane = (columns: number) => ({
  component: 'Pane' as const, requestId: 'relai-panel',
  props: { title: 'RelAI', isFocused: true, bodyColumns: columns, placement: 'dock' as const, scroll: { offset: 0, bodyRows: 60 }, view: {} },
})

// A session with measured calls, so the costs and the map have figures to draw
async function open($: Engine, columns: number) {
  await $.session.start({ cwd: CWD, surface: 'terminal', isInteractive: true })
  for (const turnId of ['t1', 't2', 't3']) {
    const s = $.turn.step({ turnId, index: 0, model: 'claude-opus-5-5', messageCount: 1 })
    for await (const _chunk of s) { /* the engine's */ }
    await s.result
  }
  await $.command.run({ command: 'relai-panel' })
  return $.ui.mount({ plugin: 'relai-panel', surface: 'desktop', ...pane(columns) })
}

// ---------- the layout model ----------
type El = { type: string, props?: Record<string, unknown>, children?: RenderNode[], key?: string }
const asEl = (n: RenderNode): El | null => (n && typeof n !== 'string' ? n as unknown as El : null)
const P = (n: El) => (n.props ?? {}) as Record<string, unknown>
const kids = (n: El): RenderNode[] => (n.children ?? []).filter((k) => typeof k !== 'string' || k.trim() !== '')
const textOf = (n: RenderNode): string => typeof n === 'string' ? n : (asEl(n)?.children ?? []).map(textOf).join('')
// The text as a desktop breaks it: a space that opens a piece of a Text is kept unbreakable
// (live 2026-10-14: "przekazania /relai-handover" stood as one word, not broken even after its
// hyphen), so it is a no-break space here and the piece's hyphens are no-break hyphens
const NBSP = String.fromCharCode(160)
const NBHY = String.fromCharCode(0x2011)
const flowOf = (n: RenderNode): string => typeof n === 'string' ? n : (asEl(n)?.children ?? [])
  .map((k, i) => { const t = flowOf(k); return i > 0 && t.startsWith(' ') ? NBSP + t.slice(1).split('-').join(NBHY) : t }).join('')
const num = (v: unknown) => (typeof v === 'number' ? v : 0)
const padX = (p: Record<string, unknown>) => num(p.paddingLeft ?? p.paddingX ?? p.padding) + num(p.paddingRight ?? p.paddingX ?? p.padding)
const edge = (p: Record<string, unknown>) => padX(p) + (p.borderStyle ? 2 : 0)
const labelOf = (n: El) => String(P(n).label ?? textOf(n as unknown as RenderNode))
const isRow = (p: Record<string, unknown>) => p.flexDirection === undefined || p.flexDirection === 'row' || p.flexDirection === 'row-reverse'
const cells = (x: number) => Math.round(x * 10) / 10
// A desktop sets text in a proportional face: ~6.8 CSS px a character (the figure the plan strip's
// hover card is cut by, pane-map.tsx) in a cell of 8.2 px, so a character is less than a cell —
// calibrated live 2026-10-14: at 31 columns "kontynuujemy pracę" fits its card. A native button
// adds ~3 cells of its own padding to its label.
const CHAR = 6.8 / CELL_PX
const BUTTON_PAD = 3
const buttonWidth = (n: El) => labelOf(n).length * CHAR + BUTTON_PAD
const longest = (s: string) => Math.max(0, ...s.split(/[ \t\n]+/).flatMap((w) => w.split(/(?<=-)/)).map((w) => w.length * CHAR))
const lineWidth = (s: string) => Math.max(0, ...s.split('\n').map((l) => l.length * CHAR))

// The one-line width of a node: what it asks for before any shrinking
function natural(node: RenderNode): number {
  if (typeof node === 'string') return lineWidth(node)
  const n = asEl(node)
  if (!n) return 0
  const p = P(n)
  if (n.type === 'Text') return lineWidth(textOf(node))
  if (n.type === 'Button') return buttonWidth(n)
  if (n.type === 'Svg') return Math.ceil(num(p.width) / CELL_PX)
  if (n.type === 'Select' || n.type === 'Input') return String(p.label ?? '').length + 12
  if (n.type === 'Markdown') return lineWidth(String(p.text ?? ''))
  if (n.type !== 'Box') return 0
  if (typeof p.width === 'number') return p.width
  const ws = kids(n).map(natural)
  const gap = num(p.columnGap ?? p.gap)
  const inner = isRow(p) ? ws.reduce((a, b) => a + b, 0) + gap * Math.max(0, ws.length - 1) : Math.max(0, ...ws)
  return Math.max(inner + edge(p), num(p.minWidth))
}

export type Finding = { where: string, what: string }

const hasButton = (node: RenderNode): boolean => { const n = asEl(node); return n !== null && (n.type === 'Button' || kids(n).some(hasButton)) }

const nameOf = (n: El) => String(n.key ?? P(n).key ?? '')

// The basis of a child in a row of `inner` cells: its width, a share of the row, or its one line
function basisOf(k: RenderNode, inner: number): number {
  const n = asEl(k)
  const p = n ? P(n) : {}
  const w = n && n.type === 'Box' ? p.width : undefined
  const base = typeof w === 'number' ? w : typeof w === 'string' && w.endsWith('%') ? Math.floor(inner * Number(w.slice(0, -1)) / 100) : natural(k)
  return Math.max(base, num(p.minWidth))
}
const shrinkOf = (k: RenderNode) => { const n = asEl(k); return n && n.type === 'Box' && P(n).flexShrink !== undefined ? num(P(n).flexShrink) : 1 }
const growOf = (k: RenderNode) => { const n = asEl(k); return n && n.type === 'Box' ? num(P(n).flexGrow) : 0 }
// The least a node can be laid out in, as a desktop does it (CSS `min-width: auto`, live
// 2026-10-14: a row of icon, text and "Otwórz" pushed the button past the card's edge instead of
// narrowing the text below its longest word). A truncated text and a drawing take no room of their
// own; a word breaks after a hyphen ("/relai-" "changelog" on the screenshot); a button its label.
function minContent(node: RenderNode): number {
  if (typeof node === 'string') return longest(node)
  const n = asEl(node)
  if (!n) return 0
  const p = P(n)
  if (n.type === 'Text') return typeof p.wrap === 'string' && p.wrap.startsWith('truncate') ? 0 : longest(flowOf(node))
  if (n.type === 'Button') return buttonWidth(n)
  if (n.type !== 'Box') return 0
  if (typeof p.minWidth === 'number') return p.minWidth
  if (typeof p.width === 'number') return p.width
  const ms = kids(n).map(minContent)
  const gap = num(p.columnGap ?? p.gap)
  const inner = isRow(p) && p.flexWrap !== 'wrap' ? ms.reduce((a, b) => a + b, 0) + gap * Math.max(0, ms.length - 1) : Math.max(0, ...ms)
  return inner + edge(p)
}

// One line of a row: each child's width after the leftover is given out or the overflow taken
// back by flexShrink, never below the child's least (frozen there, the rest shrinks on)
function share(line: RenderNode[], inner: number, gap: number): number[] {
  const basis = line.map((k) => basisOf(k, inner))
  const free = inner - basis.reduce((a, b) => a + b, 0) - gap * Math.max(0, line.length - 1)
  if (free >= 0) {
    const grow = line.map(growOf)
    const sum = grow.reduce((a, b) => a + b, 0)
    return sum ? basis.map((b, i) => b + free * (grow[i] ?? 0) / sum) : basis
  }
  // A drawing keeps its width among its siblings and is only scaled to its parent's width (live
  // 2026-10-14: the Kalam heading "Przebiegi załogi" straight beside "Rozwiń" pushed the button
  // past the card; in a Box of its own, which gives way, it was drawn smaller)
  const least = line.map((k, i) => (asEl(k)?.type === 'Svg' ? Math.min(basis[i] ?? 0, inner) : Math.min(basis[i] ?? 0, minContent(k))))
  const out = [...basis]
  const frozen = line.map((k) => shrinkOf(k) === 0)
  for (let round = 0; round < line.length + 1; round++) {
    const over = out.reduce((a, b) => a + b, 0) + gap * Math.max(0, line.length - 1) - inner
    const weight = line.map((k, i) => (frozen[i] ? 0 : shrinkOf(k) * (basis[i] ?? 0)))
    const sum = weight.reduce((a, b) => a + b, 0)
    if (over <= 0 || !sum) break
    let isClamped = false
    out.forEach((w, i) => {
      if (frozen[i]) return
      const next = w - over * (weight[i] ?? 0) / sum
      if (next < (least[i] ?? 0)) { out[i] = least[i] ?? 0; frozen[i] = true; isClamped = true } else out[i] = next
    })
    if (!isClamped) break
  }
  return out
}

// A framed card at the top or the bottom of a node: the card itself, or the first/last of a column
function framedAt(node: RenderNode, end: 'first' | 'last'): boolean {
  const n = asEl(node)
  if (!n || n.type !== 'Box') return false
  if (P(n).borderStyle) return true
  const ks = kids(n)
  if (isRow(P(n)) || !ks.length) return false
  return framedAt(ks[end === 'first' ? 0 : ks.length - 1] as RenderNode, end)
}

export function layout(node: RenderNode, w: number, path: string, out: Finding[]): void {
  const n = asEl(node)
  if (!n) return
  const p = P(n)
  const here = nameOf(n) ? `${path}/${nameOf(n)}` : path
  if (n.type === 'Text') {
    const text = textOf(node)
    const full = lineWidth(text)
    const isCut = typeof p.wrap === 'string' && p.wrap.startsWith('truncate')
    // A path or a file name has no place to wrap: cut in the middle it keeps its head and its end,
    // the one cut the pane allows (the documents, the price file)
    if (isCut && p.wrap !== 'truncate-middle' && full > w + 0.5) out.push({ where: here, what: `tekst ucięty (${cells(w)} z ${cells(full)}): ${text.slice(0, 60)}` })
    const word = longest(flowOf(node))
    if (!isCut && word > w + 0.5) out.push({ where: here, what: `słowo szersze niż kafel (${cells(w)} < ${cells(word)}): ${text.slice(0, 60)}` })
    return
  }
  if (n.type === 'Button') {
    const need = buttonWidth(n)
    if (w + 0.5 < need) out.push({ where: here, what: `przycisk ucięty (${cells(w)} < ${cells(need)}): ${labelOf(n)}` })
    return
  }
  // A drawing wider than its room is scaled down by a desktop (live 2026-10-14: the Kalam heading
  // "Wywołania w czasie" drawn smaller in the narrow pane), so it is no sign of a broken layout
  if (n.type === 'Svg') return
  if (n.type !== 'Box') return
  const inner = w - edge(p)
  const ks = kids(n)
  if (!isRow(p)) {
    const gap = num(p.rowGap ?? p.gap)
    ks.forEach((k, i) => {
      const width = basisOf(k, inner)
      const kn = asEl(k)
      const explicit = kn !== null && kn.type === 'Box' && typeof P(kn).width === 'number'
      if (explicit && width > inner) out.push({ where: here, what: `kafel szerszy niż rodzic (${inner} < ${width})` })
      layout(k, explicit ? width : inner, here, out)
      const next = ks[i + 1]
      if (gap === 0 && next !== undefined && framedAt(k, 'last') && framedAt(next, 'first') && !num(asEl(next) && P(asEl(next) as El).marginTop)) {
        out.push({ where: here, what: `ramki bez odstępu: ${nameOf(asEl(k) as El) || '?'} | ${nameOf(asEl(next) as El) || '?'}` })
      }
    })
    return
  }
  const gap = num(p.columnGap ?? p.gap)
  const lines: RenderNode[][] = []
  if (p.flexWrap === 'wrap') {
    let line: RenderNode[] = []
    let used = 0
    for (const k of ks) {
      const b = basisOf(k, inner)
      if (line.length && used + gap + b > inner) { lines.push(line); line = []; used = 0 }
      used += (line.length ? gap : 0) + b
      line.push(k)
    }
    if (line.length) lines.push(line)
    // Buttons wrapped onto lines with no gap between them touch (live 2026-10-14, the threshold
    // presets "95 % 98 % 99 % Inna…" at 31 columns)
    const withButton = lines.filter((l) => l.some(hasButton)).length
    if (withButton > 1 && num(p.rowGap ?? p.gap) === 0) out.push({ where: here, what: `przyciski w liniach bez odstępu (${withButton} linie)` })
  } else lines.push(ks)
  for (const line of lines) {
    const widths = share(line, inner, gap)
    const total = widths.reduce((a, b) => a + b, 0) + gap * Math.max(0, line.length - 1)
    if (total > inner + 0.5) out.push({ where: here, what: `wiersz wychodzi poza kafel (${cells(inner)} < ${cells(total)})` })
    line.forEach((k, i) => layout(k, widths[i] ?? 0, here, out))
  }
}

// ---------- the measurement ----------
const TABS = ['commands', 'costs', 'docs', 'map', 'help'] as const
type Ui = Awaited<ReturnType<typeof open>>

function* walk(node: RenderNode): Generator<El> {
  const n = asEl(node)
  if (!n) return
  yield n
  for (const k of n.children ?? []) yield* walk(k)
}

// Every fold of the tab unfolded, a few rounds: an unfolded plan shows its stages' folds
async function unfoldAll(ui: Ui) {
  const done = new Set<string>()
  for (let round = 0; round < 4; round++) {
    const keys = [...walk(await ui.drawn())].filter((n) => n.type === 'Button').map(nameOf)
      .filter((k) => k.startsWith('fold-') && !k.endsWith('~u') && !done.has(k)) // never the sheet's hidden copy (P-044)
    if (!keys.length) return
    for (const k of keys) {
      const label = [...walk(await ui.drawn())].find((n) => n.type === 'Button' && nameOf(n) === k)
      done.add(k)
      if (label && /Rozwiń|Szczegóły|Pokaż/.test(labelOf(label))) await ui.press({ key: k })
    }
  }
}

async function measure($: Engine, tab: typeof TABS[number], width: number, isOpen: boolean): Promise<Finding[]> {
  const ui = await open($, width)
  await ui.press({ key: `tab-${tab}` })
  if (isOpen) await unfoldAll(ui)
  const out: Finding[] = []
  layout(await ui.drawn(), width, tab, out)
  await ui.unmount()
  return out
}

// The widths a tab must draw whole at: the ones measured live 2026-10-14 (31: the middle of three
// panes, 75 and 94: wider splits), both sides of STACK_BELOW (46, 48), the thresholds the old layout
// broke at (64: the folded summaries, 80: "Otwórz") and wide
const WIDTHS = [31, 34, 38, 46, 48, 56, 64, 75, 80, 94, 100]

describe('the layout model itself (positive control, L-0181)', () => {
  test('it sees the cut text, the button pushed past the edge, the glued frames; not the wrapped row', () => {
    const cut = { type: 'Box', props: { flexDirection: 'row' }, children: [
      { type: 'Box', props: { flexGrow: 1, flexShrink: 1 }, children: [{ type: 'Text', props: { wrap: 'truncate' }, children: ['Raport stanu dokumentacji projektu'] }] },
      { type: 'Button', props: { label: 'Otwórz' }, children: [] },
    ] } as unknown as RenderNode
    const out: Finding[] = []
    layout(cut, 24, 'x', out)
    expect(out.map((f) => f.what.split(' (')[0])).toEqual(['tekst ucięty'])
    // The row of the live screenshot 8 (2026-10-14): icon, text, "Otwórz" in one row that cannot wrap
    const icon = { type: 'Box', props: { flexShrink: 0 }, children: [{ type: 'Svg', props: { width: 24, alt: 'i' }, children: [] }] }
    const words = { type: 'Box', props: { flexGrow: 1, flexShrink: 1 }, children: [{ type: 'Text', props: {}, children: ['Humanizacja tekstu /relai-humanize · Usuń z tekstu nawyki pisarskie AI'] }] }
    const open = { type: 'Box', props: { flexShrink: 0 }, children: [{ type: 'Button', props: { label: 'Otwórz' }, children: [] }] }
    const pushed = { type: 'Box', props: { flexDirection: 'row', columnGap: 2 }, children: [icon, words, open] } as unknown as RenderNode
    const p: Finding[] = []
    layout(pushed, 22, 'x', p)
    expect(p.map((f) => f.what.split(' (')[0])).toEqual(['wiersz wychodzi poza kafel'])
    // The same row after PANEL_WASKI: the text and the button wrap in a part of their own
    const wrapped = { type: 'Box', props: { flexDirection: 'row', columnGap: 2 }, children: [icon,
      { type: 'Box', props: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 2, flexGrow: 1, flexShrink: 1 }, children: [words, open] }] } as unknown as RenderNode
    const none: Finding[] = []
    layout(wrapped, 22, 'x', none)
    expect(none).toEqual([])
    // The row of the live screenshot 20: a piece opening with a space glues to the word before it
    const pieces = (texts: string[]) => ({ type: 'Text', props: {}, children: texts.map((t) => ({ type: 'Text', props: {}, children: [t] })) }) as unknown as RenderNode
    const g1: Finding[] = []
    layout(pieces(['Pakiet przekazania', ' /relai-handover']), 18, 'x', g1)
    expect(g1.map((f) => f.what.split(' (')[0])).toEqual(['słowo szersze niż kafel'])
    const g2: Finding[] = []
    layout({ type: 'Box', props: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 1 }, children: [pieces(['Pakiet przekazania']), pieces(['/relai-handover'])] } as unknown as RenderNode, 18, 'x', g2)
    expect(g2).toEqual([])
    const glued = { type: 'Box', props: { flexDirection: 'column' }, children: [
      { type: 'Box', props: { borderStyle: 'round' }, children: [] }, { type: 'Box', props: { borderStyle: 'round' }, children: [] },
    ] } as unknown as RenderNode
    const g: Finding[] = []
    layout(glued, 40, 'x', g)
    expect(g.map((f) => f.what.split(':')[0])).toEqual(['ramki bez odstępu'])
  })
})

describe('one layout of the rows per pane (live 2026-10-14, 75 columns: some buttons jumped under their words, some not)', () => {
  test('commands: every row\'s button beside its words from STACK_BELOW, under them below it', async ($, on) => {
    world(on)
    for (const [width, direction] of [[31, 'column'], [STACK_BELOW - 1, 'column'], [STACK_BELOW, 'row'], [75, 'row'], [94, 'row']] as const) {
      const ui = await open($, width)
      const mains = [...walk(visible(await ui.drawn()) as RenderNode)].filter((n) => n.type === 'Box' && nameOf(n).startsWith('main-'))
      expect(mains.length).toBe(16) // 16 commands since BEZPIECZENSTWO E1 (relai-security)
      expect([...new Set(mains.map((n) => String(P(n).flexDirection)))]).toEqual([direction])
      expect(mains.some((n) => P(n).flexWrap === 'wrap')).toBe(false) // never decided row by row
      await ui.unmount()
    }
  })
})

describe('every tab drawn whole in a narrow split pane, folded and unfolded (desktop)', () => {
  for (const tab of TABS) {
    test(`${tab}`, async ($, on) => {
      world(on)
      const rows: string[] = []
      for (const isOpen of [false, true]) {
        for (const width of WIDTHS) {
          const found = await measure($, tab, width, isOpen)
          for (const f of found) rows.push(`${tab} | ${isOpen ? 'rozwinięte' : 'zwinięte'} | ${width} | ${f.what} | ${f.where}`)
        }
      }
      expect(rows).toEqual([])
    })
  }
})
