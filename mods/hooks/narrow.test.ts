import { describe, expect, test } from 'claude-code/testing'
import type { TestBody } from 'claude-code/testing'
import type { RenderNode } from 'claude-code'
import { STACK_BELOW } from './cockpit'

// The cockpit in a narrow split pane and in the terminal (plan RELAI_MODS, E4). The pane is drawn at
// the widths a split window gives it and laid out by the model of the surface's flex that
// relai-panel measured live (panel/hooks/narrow.test.ts, branch PANEL_WASKI, P-043): a child's basis
// is its one-line width, a row that overflows shrinks its children by flexShrink but never below
// what they hold at the least (the longest word, a button's label), a wrapping row breaks into lines
// by basis. The model is copied, not imported: a mod reaches no other plugin's files (P-017).

type On = Parameters<TestBody>[1]
type Engine = Parameters<TestBody>[0]

const HOME = 'C:\\Users\\Lukasz'
const CWD = 'C:/Users/Lukasz/Desktop/RelAI'
const PARKLY = 'C:\\Users\\Lukasz\\Desktop\\Parkly'
const CELL_PX = 8.2

// The machine as it stood on 2026-10-23, the longest names first: ids, events, a project's plugin
// and hooks with long paths (L-0197: the try of a look starts on the longest real data)
const INSTALLS: Record<string, unknown[]> = {
  'filetree@claude-code-filetree': [{ scope: 'user', version: '0.2.24', installPath: 'C:\\x\\filetree' }],
  'security-guidance@claude-plugins-official': [{ scope: 'local', projectPath: PARKLY, version: '2.0.0', installPath: 'C:\\x\\sg' }],
  'relai@relai': [{ scope: 'user', version: '3.2.0', installPath: 'C:\\x\\relai' }],
  'relai-mods@relai': [{ scope: 'user', version: '0.0.1', installPath: 'C:\\x\\mods' }],
  'relai-cache-keeper@relai': [{ scope: 'user', version: '0.11.0', installPath: 'C:\\x\\keeper' }],
  'everything-claude-code@everything-claude-code': [{ scope: 'user', version: '1.9.0', installPath: 'C:\\x\\ecc' }],
  'superpowers@claude-plugins-official': [{ scope: 'user', version: '5.0.0', installPath: 'C:\\x\\sp' }],
}
const ENABLED = Object.fromEntries(Object.keys(INSTALLS).filter((id) => !id.startsWith('filetree') && !id.startsWith('security')).map((id) => [id, true]))
const HOOKS = {
  UserPromptSubmit: [{ hooks: [{ type: 'command', command: 'node "C:\\Users\\Lukasz\\.claude\\hooks\\relai-prompt-consent-gate.js"' }] }],
  PreToolUse: [{ matcher: 'Bash|Write|Edit|MultiEdit', hooks: [{ type: 'command', command: 'node "C:\\Users\\Lukasz\\.claude\\hooks\\gateguard-fact-force.js"' }] }],
  SessionStart: [{ hooks: [{ type: 'command', command: 'node "C:\\Users\\Lukasz\\.claude\\hooks\\caveman-session-start.js"' }] }],
}
const EVENTS = JSON.stringify({ hooks: { SessionStart: [], UserPromptSubmit: [], PreToolUse: [], PostToolUse: [], Stop: [], SessionEnd: [] } })

const key = (path: string) => path.replace(/\\/g, '/')

function world(on: On) {
  const disk: Record<string, string> = {
    [key(`${HOME}/.claude/plugins/installed_plugins.json`)]: JSON.stringify({ version: 2, plugins: INSTALLS }),
    [key(`${HOME}/.claude/settings.json`)]: JSON.stringify({ enabledPlugins: ENABLED, hooks: HOOKS }),
    'C:/x/filetree/hooks/hooks.json': JSON.stringify({ modules: ['./register.tsx'] }),
    'C:/x/mods/hooks/hooks.json': JSON.stringify({ modules: ['./register.tsx'] }),
    'C:/x/keeper/hooks/hooks.json': JSON.stringify({ modules: ['./register.tsx'] }),
    'C:/x/relai/.claude-plugin/plugin.json': JSON.stringify({ description: 'Twój projekt pamięta wszystko — dokumentacja i proces dla Claude Code', commands: ['./a/commands/'] }),
    'C:/x/relai/hooks/hooks.json': EVENTS,
    'C:/x/relai/a/commands/one.md': '#',
    'C:/x/ecc/.claude-plugin/plugin.json': JSON.stringify({ description: 'Agents, skills, hooks, commands and rules for everyday engineering work' }),
    'C:/x/ecc/hooks/hooks.json': EVENTS,
    'C:/x/sp/.claude-plugin/plugin.json': JSON.stringify({ description: 'Core skills library: TDD, debugging, collaboration patterns' }),
    'C:/x/sg/.claude-plugin/plugin.json': JSON.stringify({ description: 'Security reminders while editing files' }),
  }
  on('env.get', ($, e) => ({ value: e.name === 'USERPROFILE' ? HOME : '' }))
  on('settings.read', () => ({ value: {} }))
  on('fs.exists', ($, e) => ({ value: key(e.path) in disk || Object.keys(disk).some((p) => p.startsWith(`${key(e.path)}/`)) }))
  on('fs.read', ($, e) => (key(e.path) in disk ? { value: disk[key(e.path)] ?? '' } : { deny: `ENOENT ${e.path}` }))
  on('fs.list', ($, e) => {
    const dir = `${key(e.path)}/`
    const below = Object.keys(disk).filter((p) => p.startsWith(dir)).map((p) => p.slice(dir.length))
    const names = [...new Set(below.map((r) => r.split('/')[0] ?? ''))]
    return { value: names.map((n) => ({ name: n, kind: below.includes(n) ? 'file' as const : 'dir' as const, size: 1, mtimeMs: 0, isLink: false })) }
  })
  on('process.run', () => ({ value: { exitCode: 0, stdout: '2.1.304 (Claude Code)\n', stderr: '', isStdoutTruncated: false, isStderrTruncated: false } }))
  on('command.register', () => ({ value: { command: 'relai-mods' } }))
  on('ui.panes', () => ({ value: [] }))
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('session.cwd', () => ({ value: CWD }))
}

const pane = (columns: number) => ({
  plugin: 'relai-mods', component: 'Pane' as const, requestId: 'relai-mods',
  props: { title: 'RelAI Mods', isFocused: true, bodyColumns: columns, placement: 'dock' as const, scroll: { offset: 0, bodyRows: 60 }, view: {} },
})

async function open($: Engine, columns: number, surface: 'desktop' | 'terminal' = 'desktop') {
  await $.session.start({ cwd: CWD, surface, isInteractive: true })
  return $.ui.mount({ ...pane(columns), surface })
}

// ---------- the layout model (panel/hooks/narrow.test.ts, P-043) ----------
type El = { type: string, props?: Record<string, unknown>, children?: RenderNode[], key?: string }
const asEl = (n: RenderNode): El | null => (n && typeof n !== 'string' ? n as unknown as El : null)
const P = (n: El) => (n.props ?? {}) as Record<string, unknown>
const kids = (n: El): RenderNode[] => (n.children ?? []).filter((k) => typeof k !== 'string' || k.trim() !== '')
const textOf = (n: RenderNode): string => typeof n === 'string' ? n : (asEl(n)?.children ?? []).map(textOf).join('')
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
const CHAR = 6.8 / CELL_PX
const BUTTON_PAD = 3
const buttonWidth = (n: El) => labelOf(n).length * CHAR + BUTTON_PAD
// A zero-width space is a place to break (CSS line breaking), as views.tsx puts one after each path separator
const ZW = String.fromCharCode(0x200b)
const longest = (s: string) => Math.max(0, ...s.split(ZW).join(' ').split(/[ \t\n]+/).flatMap((w) => w.split(/(?<=-)/)).map((w) => w.length * CHAR))
const lineWidth = (s: string) => Math.max(0, ...s.split('\n').map((l) => l.length * CHAR))

function natural(node: RenderNode): number {
  if (typeof node === 'string') return lineWidth(node)
  const n = asEl(node)
  if (!n) return 0
  const p = P(n)
  if (n.type === 'Text') return lineWidth(textOf(node))
  if (n.type === 'Button') return buttonWidth(n)
  if (n.type === 'Svg') return Math.ceil(num(p.width) / CELL_PX)
  if (n.type === 'Select' || n.type === 'Input') return String(p.label ?? '').length + 12
  if (n.type !== 'Box') return 0
  if (typeof p.width === 'number') return p.width
  const ws = kids(n).map(natural)
  const gap = num(p.columnGap ?? p.gap)
  const inner = isRow(p) ? ws.reduce((a, b) => a + b, 0) + gap * Math.max(0, ws.length - 1) : Math.max(0, ...ws)
  return Math.max(inner + edge(p), num(p.minWidth))
}

type Finding = { where: string, what: string }
const nameOf = (n: El) => String(n.key ?? P(n).key ?? '')

function basisOf(k: RenderNode, inner: number): number {
  const n = asEl(k)
  const p = n ? P(n) : {}
  const w = n && n.type === 'Box' ? p.width : undefined
  const base = typeof w === 'number' ? w : typeof w === 'string' && w.endsWith('%') ? Math.floor(inner * Number(w.slice(0, -1)) / 100) : natural(k)
  return Math.max(base, num(p.minWidth))
}
const shrinkOf = (k: RenderNode) => { const n = asEl(k); return n && n.type === 'Box' && P(n).flexShrink !== undefined ? num(P(n).flexShrink) : 1 }
const growOf = (k: RenderNode) => { const n = asEl(k); return n && n.type === 'Box' ? num(P(n).flexGrow) : 0 }

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

function share(line: RenderNode[], inner: number, gap: number): number[] {
  const basis = line.map((k) => basisOf(k, inner))
  const free = inner - basis.reduce((a, b) => a + b, 0) - gap * Math.max(0, line.length - 1)
  if (free >= 0) {
    const grow = line.map(growOf)
    const sum = grow.reduce((a, b) => a + b, 0)
    return sum ? basis.map((b, i) => b + free * (grow[i] ?? 0) / sum) : basis
  }
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

function layout(node: RenderNode, w: number, path: string, out: Finding[]): void {
  const n = asEl(node)
  if (!n) return
  const p = P(n)
  const here = nameOf(n) ? `${path}/${nameOf(n)}` : path
  if (n.type === 'Text') {
    const text = textOf(node)
    const isCut = typeof p.wrap === 'string' && p.wrap.startsWith('truncate')
    // A row's name is cut at its end on purpose (the details carry it whole): no finding then
    const word = longest(flowOf(node))
    if (!isCut && word > w + 0.5) out.push({ where: here, what: `słowo szersze niż rodzic (${cells(w)} < ${cells(word)}): ${text.slice(0, 60)}` })
    return
  }
  if (n.type === 'Button') {
    const need = buttonWidth(n)
    if (w + 0.5 < need) out.push({ where: here, what: `przycisk ucięty (${cells(w)} < ${cells(need)}): ${labelOf(n)}` })
    return
  }
  if (n.type !== 'Box') return
  const inner = w - edge(p)
  const ks = kids(n)
  if (!isRow(p)) {
    ks.forEach((k) => {
      const width = basisOf(k, inner)
      const kn = asEl(k)
      // A zero-based box straight in a column gets no width on a desktop (P-050): measured at 0 here
      const explicit = kn !== null && kn.type === 'Box' && typeof P(kn).width === 'number'
      if (explicit && width > inner) out.push({ where: here, what: `pudełko szersze niż rodzic (${inner} < ${width})` })
      layout(k, explicit ? width : inner, here, out)
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
  } else lines.push(ks)
  for (const line of lines) {
    const widths = share(line, inner, gap)
    const total = widths.reduce((a, b) => a + b, 0) + gap * Math.max(0, line.length - 1)
    if (total > inner + 0.5) out.push({ where: here, what: `wiersz wychodzi poza rodzica (${cells(inner)} < ${cells(total)})` })
    line.forEach((k, i) => layout(k, widths[i] ?? 0, here, out))
  }
}

function* walk(node: RenderNode): Generator<El> {
  const n = asEl(node)
  if (!n) return
  yield n
  for (const k of n.children ?? []) yield* walk(k)
}

const WIDTHS = [31, STACK_BELOW - 1, STACK_BELOW, 80, 94]

// The pane folded, then every row unfolded one at a time (the accordion opens one)
async function measure($: Engine, width: number, surface: 'desktop' | 'terminal'): Promise<string[]> {
  const ui = await open($, width, surface)
  const rows: string[] = []
  const at = (label: string, found: Finding[]) => found.forEach((f) => rows.push(`${surface} | ${width} | ${label} | ${f.what} | ${f.where}`))
  const folded: Finding[] = []
  layout(await ui.drawn(), width, 'pane', folded)
  at('zwinięte', folded)
  const picks = [...walk(await ui.drawn())].filter((n) => n.type === 'Button' && nameOf(n).startsWith('pick-')).map(nameOf)
  expect(picks.length).toBe(INSTALLS_COUNT + HOOKS_COUNT)
  for (const k of picks) {
    await ui.press({ key: k })
    const found: Finding[] = []
    layout(await ui.drawn(), width, 'pane', found)
    at(k, found)
    await ui.press({ key: k })
  }
  await ui.unmount()
  return rows
}
const INSTALLS_COUNT = Object.keys(INSTALLS).length
const HOOKS_COUNT = Object.keys(HOOKS).length

describe('the layout model itself (positive control, L-0181)', () => {
  test('it sees a button pushed past the edge and a word wider than its parent; not the cut name', () => {
    const name = { type: 'Box', props: { width: 0, flexGrow: 1 }, children: [{ type: 'Text', props: { wrap: 'truncate-end' }, children: ['everything-claude-code · projekt Parkly'] }] }
    const fixed = { type: 'Box', props: { flexShrink: 0 }, children: [{ type: 'Text', props: {}, children: ['UserPromptSubmit'] }] }
    const pushed = { type: 'Box', props: { flexDirection: 'row', columnGap: 1 }, children: [name, fixed, { type: 'Button', props: { plain: true, label: 'Wyłącz' }, children: [] }] } as unknown as RenderNode
    const p: Finding[] = []
    layout(pushed, 20, 'x', p)
    expect(p.map((f) => f.what.split(' (')[0])).toEqual(['wiersz wychodzi poza rodzica'])
    const ok: Finding[] = []
    layout(pushed, 40, 'x', ok)
    expect(ok).toEqual([])
    const path = 'C:/Users/Lukasz/.claude/settings.json'
    const word: Finding[] = []
    layout({ type: 'Text', props: {}, children: [path] } as unknown as RenderNode, 20, 'x', word)
    expect(word.map((f) => f.what.split(' (')[0])).toEqual(['słowo szersze niż rodzic'])
    // the same path with the breaks views.tsx puts in: no finding
    const broken: Finding[] = []
    layout({ type: 'Text', props: {}, children: [path.split('/').join('/\u200b')] } as unknown as RenderNode, 20, 'x', broken)
    expect(broken).toEqual([])
  })
})

// How much a row's name gets beside its tail, switch and arrow at a width: the threshold is the
// narrowest width at which every row still gives its name NAME_ROOM cells (the rest is cut, E3)
const NAME_ROOM = 12
function nameRooms(tree: RenderNode, width: number): number[] {
  return [...walk(tree)].filter((n) => n.type === 'Box' && nameOf(n) === 'top' && isRow(P(n)))
    .map((n) => share(kids(n), width, num(P(n).columnGap))[0] ?? 0)
}

describe('one layout of the rows per pane (E4, as relai-panel\'s STACK_BELOW)', () => {
  test('every row\'s switch and arrow beside its name from STACK_BELOW, under it below', async ($, on) => {
    world(on)
    for (const [width, isStacked] of [[31, true], [STACK_BELOW - 1, true], [STACK_BELOW, false], [80, false], [94, false]] as const) {
      const ui = await open($, width)
      const tops = [...walk(await ui.drawn())].filter((n) => n.type === 'Box' && nameOf(n) === 'top')
      expect(tops.length).toBe(INSTALLS_COUNT + HOOKS_COUNT)
      expect([...new Set(tops.map((n) => String(P(n).flexDirection)))]).toEqual([isStacked ? 'column' : 'row'])
      await ui.unmount()
    }
  })

  test('the threshold: at STACK_BELOW every name keeps its room beside the rest of its row', async ($, on) => {
    world(on)
    const ui = await open($, STACK_BELOW)
    const rooms = nameRooms(await ui.drawn(), STACK_BELOW)
    expect(rooms.length).toBe(INSTALLS_COUNT + HOOKS_COUNT)
    expect(Math.min(...rooms)).toBeGreaterThanOrEqual(NAME_ROOM)
    // and one column less would leave a name short of it: the threshold is no lower than it must be
    expect(Math.min(...rooms) - 1).toBeLessThan(NAME_ROOM)
    await ui.unmount()
  })
})

// The CSS model is the desktop's (P-043); the terminal breaks a long word by itself and is measured
// live at 80 columns (E4)
describe('the cockpit drawn whole at every width, folded and with each row unfolded (desktop)', () => {
  test('desktop', async ($, on) => {
    world(on)
    const rows: string[] = []
    for (const width of WIDTHS) rows.push(...await measure($, width, 'desktop'))
    expect(rows).toEqual([])
  })
})
