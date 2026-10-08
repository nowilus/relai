// relai-panel: the RelAI band above the prompt. Active plan and stage from CLAUDE.md and the
// plan's STATUS.md, a prompt-cache timer, the session's hypothetical API cost. The /relai-panel
// command opens a side pane with the forms of the 14 RelAI commands, the cheat sheet and the
// session phrases, drawn in the RelAI motif (E8): cards with the command icons, Kalam headings,
// three recommended commands on top. A desktop draws the SVG; the terminal gets the same cards
// as text, in the same colors.
//
// The mod draws and calls; the core counts (plan PANEL_CLAUDE, section 5). Everything the band
// reckons with lives in ./core/*.mjs: a byte-identical copy of core/panel/ written by
// core/tools/sync-panel-core.js, because the engine refuses imports from outside the plugin.
//
// Silent outside a RelAI project. Never calls a model, never adds to the system prompt (R7),
// never reaches the network. When cache-keeper-pl runs in the session it owns the countdown,
// so the band hides its own timer (plan, section 8).

import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register, RenderChildren } from 'claude-code'
import { DEFAULT_WARN_MIN, MIN, UNMEASURED, applyVerdict, cacheState, dueWarning, effectiveTtl, judgeStep, msLeft, totalInput } from './core/cache-timer.mjs'
import type { TtlState, Usage } from './core/cache-timer.mjs'
import { planState } from './core/plan-state.mjs'
import type { PlanState } from './core/plan-state.mjs'
import { clip, join, minutes, tokens, usd } from './fmt'
import type { PanelView } from '../types'
import { FORMS, buildCommand, formOf, isShown, resolveName, valueOf } from './core/commands.mjs'
import type { Field, Form } from './core/commands.mjs'
import { buildPhrase, parseSheet, searchSheet } from './core/phrases.mjs'
import type { Phrase, Sheet } from './core/phrases.mjs'
import { FEATURED, GROUPS, NAMES, THEME, glyph, iconName } from './core/theme.mjs'
import { HEADING_ART } from './core/headings.mjs'
import { ICONS } from './core/icons.mjs'

type $T = EngineInterface

const TICK_MS = 30_000
const RELAI_MARKER = /Wersja RelAI|RelAI version/
const KEEPER_COMMANDS = ['cache', 'ckp-cache']
const WARN_MIN_TOKENS = 50_000 // below this a cache rewrite costs too little to interrupt anyone
const SNAP_MAX_AGE = 2 * 60 * MIN
const NARROW_COLUMNS = 100

type Session = {
  id: string
  cwd: string
  isRelai: boolean
  plan: PlanState
  hasKeeper: boolean
  lastActivity: number // last main-loop request that read or wrote the cache
  ttl: TtlState
  ctx: number
  costUsd: number | null
  justCompacted: boolean
  announcedFor: number // the lastActivity the announced warnings belong to
  announced: number[]
}

// The timer part is what survives a hot reload and a resume, through $.store
type Snap = Pick<Session, 'id' | 'lastActivity' | 'ttl' | 'ctx' | 'costUsd' | 'announcedFor' | 'announced'> & { savedAt: number }

const FRESH: Session = {
  id: '', cwd: '', isRelai: false, plan: { kind: 'none' }, hasKeeper: false, lastActivity: 0, ttl: UNMEASURED,
  ctx: 0, costUsd: null, justCompacted: false, announcedFor: 0, announced: [],
}

// Replaced, never mutated in place; a reload starts it over and session.start restores it
let S: Session = FRESH
let ticking = false

const set = (patch: Partial<Session>) => { S = { ...S, ...patch } }
const snapKey = () => 'snap:' + S.id

async function readText($: $T, path: string): Promise<string | null> {
  try {
    return (await $.fs.exists(path)) ? await $.fs.read(path) : null
  } catch {
    return null
  }
}

async function detectRelai($: $T, cwd: string): Promise<boolean> {
  const text = await readText($, join(cwd, 'docs/USTAWIENIA.md'))
  return text !== null && RELAI_MARKER.test(text)
}

async function readPlan($: $T): Promise<PlanState> {
  const claude = await readText($, join(S.cwd, 'CLAUDE.md'))
  return planState(claude, (rel) => readText($, join(S.cwd, rel)))
}

async function detectKeeper($: $T): Promise<boolean> {
  const list = await $.command.list().catch(() => [])
  return list.some((c) => KEEPER_COMMANDS.includes(c.name))
}

async function saveSnap($: $T, now: number) {
  if (!S.id) return
  const snap: Snap = { id: S.id, lastActivity: S.lastActivity, ttl: S.ttl, ctx: S.ctx, costUsd: S.costUsd, announcedFor: S.announcedFor, announced: S.announced, savedAt: now }
  await $.store.set(snapKey(), snap).catch(() => undefined)
}

async function restoreSnap($: $T, now: number) {
  const snap = (await $.store.get(snapKey()).catch(() => undefined)) as Snap | undefined
  if (!snap || snap.id !== S.id || now - snap.savedAt > SNAP_MAX_AGE) return
  const { savedAt: _saved, ...rest } = snap
  set(rest)
}

// Refresh what the band reads from the project and the session after each turn
async function refresh($: $T) {
  const [plan, hasKeeper, usage] = await Promise.all([readPlan($), detectKeeper($), $.session.usage().catch(() => null)])
  set({
    plan,
    hasKeeper,
    ctx: usage?.context?.tokens || S.ctx,
    costUsd: usage?.cost ? usage.cost.usd : S.costUsd,
  })
}

function warnStep($: $T, now: number) {
  if (S.hasKeeper || S.ctx < WARN_MIN_TOKENS) return
  const { ttlMin, isAssumed } = effectiveTtl(S.ttl)
  const left = msLeft(S.lastActivity, ttlMin, now)
  if (left === null) return
  const announced = S.announcedFor === S.lastActivity ? S.announced : []
  const due = dueWarning(left, DEFAULT_WARN_MIN, announced)
  if (due === null) return
  set({ announcedFor: S.lastActivity, announced: [...announced, ...DEFAULT_WARN_MIN.filter((m) => m >= due)] })
  $.ui.toast(`RelAI: cache ${tokens(S.ctx)} tokenów wygaśnie za ~${minutes(left)}${isAssumed ? ' (TTL założony, nie zmierzony)' : ''}. Koniec odliczania to prognoza, nie dowód utraty cache.`, { timeoutMs: 15_000 })
}

async function tick($: $T) {
  const now = await $.clock.now()
  warnStep($, now)
  $.ui.invalidate('ui.render')
}

// ---------- the band ----------
// Keys sit on Box: the engine keeps a Box's key and drops a Text's (seen in plugin test, 2.1.293)

function planText(isNarrow: boolean): string {
  const p = S.plan
  if (p.kind === 'none') return 'RelAI · brak aktywnego planu'
  if (p.kind === 'unknown') return `RelAI · plan nieznany: ${p.reason}`
  const progress = `${p.closed}/${p.stages}`
  if (!p.stage) return `RelAI · ${p.plan} · ${p.planStatus ?? 'status nieznany'} · ${progress}`
  const name = isNarrow ? '' : ` ${clip(p.stage.name, 40)}`
  return `RelAI · ${p.plan} · ${p.stage.id} ${p.stage.status}${name} · ${progress}`
}

function band($: $T, e: Parameters<$T['ui']['resolve']>[0], columns: number, now: number) {
  const { Box, Text } = $.ui.resolve(e)
  const isNarrow = columns < NARROW_COLUMNS
  const parts = [<Box key="plan"><Text bold>{planText(isNarrow)}</Text></Box>]
  if (!S.hasKeeper) {
    const { ttlMin, isAssumed } = effectiveTtl(S.ttl)
    const st = cacheState(S.lastActivity, ttlMin, now, DEFAULT_WARN_MIN)
    const tilde = isAssumed ? '~' : ''
    const timer =
      st.kind === 'warm' ? <Box key="timer"><Text color="green">{` │ ● cache ciepły ${tilde}${minutes(st.left)}`}</Text></Box>
      : st.kind === 'cooling' ? <Box key="timer"><Text color="yellow" bold>{` │ ◐ cache stygnie ${tilde}${minutes(st.left)}`}</Text></Box>
      : st.kind === 'cold' ? <Box key="timer"><Text dimColor>{` │ ○ cache prawdopodobnie zimny od ${tilde}${minutes(-st.left)}`}</Text></Box>
      : <Box key="timer"><Text dimColor>{' │ · cache nieznany'}</Text></Box>
    parts.push(timer)
  }
  if (!isNarrow) parts.push(<Box key="cost"><Text dimColor>{` │ sesja ≈ ${usd(S.costUsd)} wg cennika API`}</Text></Box>)
  return <Box key="relai-band" flexDirection="row" width="100%">{parts}</Box>
}

// ---------- the pane ----------
// The forms and the sheet are reckoned in ./core (commands.mjs, phrases.mjs); this file draws and
// calls. Nothing reaches the chat but on a press of "Wyślij" or of a phrase: a command through
// $.command.run, a phrase through $.prompt.submit as the person's own words (plan, section 5).
// Without the relai plugin in the session the pane says so and sends nothing (plan, section 8).
// One file with the hooks: the engine follows $ only into functions declared in this same file.

const PANE_ID = 'relai-panel'
const PANE_TITLE = 'RelAI'

const view = atom({ plugin: 'relai-panel', key: 'view' } as const, 'commands' as PanelView)
const selected = atom({ plugin: 'relai-panel', key: 'selected' } as const, '')
const values = atom({ plugin: 'relai-panel', key: 'values' } as const, {} as Record<string, string>)
const query = atom({ plugin: 'relai-panel', key: 'query' } as const, '')
const fills = atom({ plugin: 'relai-panel', key: 'fills' } as const, {} as Record<string, string>)
const sent = atom({ plugin: 'relai-panel', key: 'sent' } as const, '')
const pressed = atom({ plugin: 'relai-panel', key: 'pressed' } as const, '')

// How long a press answers: the card of the pressed control flashes, a send says "Wysłano"
const FLASH_MS = 900

function flash($: $T, key: string) {
  void update($, pressed, () => key)
  $.clock.after(FLASH_MS, () => { void update($, pressed, (k) => (k === key ? '' : k)) })
}

// The Select of a choice cannot hold an empty value: '' travels as this one
const NONE = '_'
const NO_RELAI = 'Plugin relai nie jest zainstalowany w tej sesji — panel pokazuje formularze, ale niczego nie wyśle.'
const NOT_RELAI = 'Ten folder nie jest projektem RelAI, więc panel nie ma czego pokazać — napisz „zacznijmy projekt”, żeby go zainicjować.'

type PaneData = {
  names: Record<string, string | null> // command -> the name the session runs it by
  descriptions: Record<string, string>
  hasRelai: boolean
  sheet: Sheet
}

// Read once per /relai-panel and after a reload: commands and KOMENDY.md change rarely mid-session
let data: PaneData | null = null

async function loadData($: $T, cwd: string): Promise<PaneData> {
  const list = await $.command.list().catch(() => [])
  const names: Record<string, string | null> = {}
  const descriptions: Record<string, string> = {}
  for (const f of FORMS) {
    const name = resolveName(f.command, list)
    names[f.command] = name
    descriptions[f.command] = list.find((c) => c.name === name)?.description ?? ''
  }
  let text: string | null = null
  try {
    const path = join(cwd, 'docs/KOMENDY.md')
    text = (await $.fs.exists(path)) ? await $.fs.read(path) : null
  } catch {
    text = null
  }
  data = { names, descriptions, hasRelai: Object.values(names).some((n) => n !== null), sheet: parseSheet(text) }
  return data
}

const fieldKey = (command: string, key: string) => `${command}:${key}`

function formValues(all: Record<string, string>, form: Form): Record<string, string> {
  const out: Record<string, string> = {}
  for (const f of form.fields) {
    const v = all[fieldKey(form.command, f.key)]
    if (v !== undefined) out[f.key] = v
  }
  return out
}

// What the recommended stage card says under its purpose: the plan and stage the band shows
function stageHint(plan: PlanState): string {
  if (plan.kind !== 'ok') return ''
  return plan.stage ? `${plan.plan} · ${plan.stage.id} ${plan.stage.name}` : `${plan.plan} · wszystkie etapy zamknięte`
}

async function sendCommand($: $T, name: string, args: string, text: string) {
  try {
    await $.command.run({ command: name, args })
    await update($, sent, () => `Wysłano do czatu: ${text}`)
  } catch (err) {
    await update($, sent, () => `Nie wysłano ${text}: ${err instanceof Error ? err.message : String(err)}`)
  }
}

async function sendPhrase($: $T, text: string) {
  try {
    await $.prompt.submit({ text, asUser: true })
    await update($, sent, () => `Wysłano do czatu: ${text}`)
  } catch (err) {
    await update($, sent, () => `Nie wysłano „${text}”: ${err instanceof Error ? err.message : String(err)}`)
  }
}

// ---------- hooks ----------

export const register: Register = (on) => {
  on('session.start', async ($, e, next) => {
    const cwd = await $.session.cwd()
    const isRelai = await detectRelai($, cwd)
    S = { ...FRESH, id: await $.session.id(), cwd, isRelai }
    // Registered everywhere, so outside RelAI the command can say so in one sentence (plan, section 8)
    await $.command.register({ name: 'relai-panel', description: 'Panel RelAI: formularze komend, ściąga i frazy sesji' }).catch(() => undefined)
    if (!isRelai) return next(e)
    await restoreSnap($, await $.clock.now())
    await refresh($)
    if (!ticking) {
      ticking = true
      $.clock.every(TICK_MS, () => { tick($).catch(() => {}) })
    }
    return next(e)
  })

  // /clear, /resume and /branch start from an unknown cache under a new session id
  on('classic.SessionStart', { source: ['clear', 'resume', 'fork'] }, async ($, e, next) => {
    if (!S.isRelai) return next(e)
    const id = await $.session.id().catch(() => S.id)
    S = { ...FRESH, id, cwd: S.cwd, isRelai: true, plan: S.plan, hasKeeper: S.hasKeeper }
    $.ui.invalidate('ui.render')
    return next(e)
  }).catch(($, e, next) => next(e))

  // The pane opens only from the command, the person's own act: it seats at any width and never
  // pops up by itself in a narrow terminal (plan, section 8)
  on('command.run', { command: 'relai-panel' }, async ($) => {
    if (!S.isRelai) return { text: NOT_RELAI }
    await loadData($, S.cwd)
    const opened = await $.ui.open({ id: PANE_ID, title: PANE_TITLE })
    return { text: opened.isPlaced ? 'Panel RelAI otwarty.' : `Panel RelAI czeka na miejsce: ${opened.reason}` }
  })

  on('ui.render', { component: 'Pane', requestId: PANE_ID }, async ($, e) => {
    const { isRelai, cwd } = S
    if (e.surface === 'mobile') {
      const { Text } = $.ui.resolve(e)
      return <Text>Formularze RelAI wymagają terminala albo aplikacji desktopowej.</Text>
    }
    const el = $.ui.resolve(e)
    const { Box, Text, Button, Input, Select } = el
    // A desktop draws SVG: icons and Kalam headings. The terminal gets text in the same colors.
    // Decided by the surface, not by `'Svg' in el`: the terminal's table carries the key at run
    // time and drops what it draws (2.1.293, measured by theme.test.ts in E8).
    const Svg = (e.surface === 'desktop' || e.surface === 'vscode') && 'Svg' in el ? el.Svg : null
    const isGui = Svg !== null
    if (!isRelai) return <Box key="not-relai"><Text>{NOT_RELAI}</Text></Box>
    const d = data ?? (await loadData($, cwd))
    const width = Math.max(30, e.props.bodyColumns)
    const [tab, picked, all, q, filled, last, flashed] = await Promise.all([
      read($, view), read($, selected), read($, values), read($, query), read($, fills), read($, sent), read($, pressed),
    ])
    const pick = (c: string) => { void update($, selected, (s) => (s === c ? '' : c)) }

    // ---------- the pane's parts: one look for every tab and every later section ----------
    const heading = (key: string, color: string = THEME.mark) => {
      const art = HEADING_ART[key]
      if (Svg && art) return <Svg key={`h-${key}`} source={art.svg} alt={art.text} width={art.width} height={art.height} />
      return <Text bold color={color}>{art?.text ?? key}</Text>
    }
    const icon = (c: string, px: number) => {
      const source = ICONS[iconName(c)]
      if (Svg && source) return <Svg key={`icon-${c}`} source={source} alt={NAMES[c]?.[0] ?? c} width={px} height={px} />
      return <Text color={THEME.accent}>●</Text>
    }
    const mark = (name: string, color: string, px: number, alt: string) => {
      const source = glyph(name, color, px)
      if (Svg && source) return <Svg key={`g-${name}-${px}`} source={source} alt={alt} width={px} height={px} />
      return <Text color={color}>●</Text>
    }
    // Every control is the surface's own button (calibration 2026-10-08): a `plain` button in a
    // painted box inverts under the pointer and that cannot be turned off, so the brand stays in
    // the cards and the press answers by itself: the control's card flashes and, where a press
    // sends something, the label says so for FLASH_MS.
    const isFlash = (key: string) => flashed === key
    const btn = (key: string, label: string, kind: 'primary' | 'secondary', onPress: () => void, doneLabel?: string) => (
      <Button key={key} variant={kind} onPress={() => { onPress(); flash($, key) }}>
        {doneLabel && isFlash(key) ? doneLabel : label}
      </Button>
    )
    const flashBorder = (key: string, rest: string) => (isFlash(key) ? THEME.pressed : rest)
    // A section: Kalam heading, one line saying what it is for, then its cards
    const section = (key: string, head: string, about: string, items: RenderChildren[]) => (
      <Box key={key} flexDirection="column" gap={isGui ? 1 : 0}>
        {heading(head)}
        {about ? [<Text key={`${key}-about`} color={THEME.body}>{about}</Text>] : []}
        {items}
      </Box>
    )
    // A card: rounded and filled on a desktop; on the terminal only the selected one is framed
    const frame = (isOn: boolean) => (isGui || isOn ? { borderStyle: 'round' } : {})
    // The exact text that goes to the chat, in a well of its own
    const well = (key: string, text: string, isOk: boolean) => (
      <Box key={key} paddingX={1} {...frame(false)} borderColor={THEME.line} backgroundColor={THEME.card}>
        <Text color={isOk ? THEME.title : THEME.accentText}>{isOk ? [<Text key={`${key}-l`} color={THEME.mark} bold>{'Do czatu pójdzie: '}</Text>, text] : text}</Text>
      </Box>
    )
    const sentLine = last
      ? <Box key="sent"><Text color={last.startsWith('Wysłano') ? THEME.ok : THEME.accentText}>{(last.startsWith('Wysłano') ? '✓ ' : '✗ ') + last}</Text></Box>
      : null

    const TABS = [['commands', 'Komendy'], ['sheet', 'Ściąga'], ['phrases', 'Frazy']] as const
    const tabs = (
      <Box key="tabs" flexDirection="row" flexWrap="wrap" gap={1}>
        {TABS.map(([v, label]) => btn(`tab-${v}`, label, v === tab ? 'primary' : 'secondary', () => { void update($, view, () => v) }))}
      </Box>
    )

    // ---------- commands ----------
    const fieldEl = (form: Form, f: Field, current: Record<string, string>) => {
      const k = fieldKey(form.command, f.key)
      if (f.kind === 'choice') {
        return (
          <Select key={`f-${f.key}`} label={f.label + ': '} value={valueOf(f, current) || NONE}
            options={f.options.map((o) => ({ value: o.value || NONE, label: o.label }))}
            onSelect={(v) => { void update($, values, (m) => ({ ...m, [k]: v === NONE ? '' : v })) }} />
        )
      }
      return (
        <Input key={`f-${f.key}`} label={f.label + ': '} value={current[f.key] ?? ''}
          placeholder={f.kind === 'path' ? 'ścieżka' : f.patternHint ?? ''}
          onInput={(v) => { void update($, values, (m) => ({ ...m, [k]: v })) }}
          onSubmit={(v) => { void update($, values, (m) => ({ ...m, [k]: v })) }} />
      )
    }

    // The open form of a card: options, the exact text, then "Wyślij" only when it can go out
    const drawer = (form: Form) => {
      const current = formValues(all, form)
      const name = d.names[form.command] ?? null
      const built = buildCommand(form, current, name ?? form.command)
      const fields = form.fields.filter((f) => isShown(f, current)).map((f) => fieldEl(form, f, current))
      const canSend = built.isOk && name !== null
      return (
        <Box key="form" flexDirection="column" gap={isGui ? 1 : 0} paddingX={isGui ? 2 : 1} paddingY={isGui ? 1 : 0}
          borderStyle="round" borderColor={flashBorder('send', THEME.accent)} backgroundColor={THEME.cardOn}>
          {heading(`name-${form.command}`, THEME.accentText)}
          {fields.length ? fields : [<Text key="no-options" color={THEME.body}>Ta komenda nie ma opcji — wystarczy ją wysłać.</Text>]}
          <Box key="preview" flexDirection="column">{well('preview-well', built.text, true)}</Box>
          {built.errors.length ? [<Box key="errors"><Text color={THEME.accentText}>{'⚠ ' + built.errors.join(' · ')}</Text></Box>] : []}
          {canSend
            ? <Box key="actions" flexDirection="row" flexWrap="wrap" gap={1}>
                {btn('send', 'Wyślij do czatu', 'primary', () => { void sendCommand($, name, built.args, built.text) }, '✓ Wysłano')}
                {btn('close', 'Zamknij', 'secondary', () => pick(form.command))}
              </Box>
            : <Box key="no-send"><Text color={THEME.body}>{name === null ? 'Komenda niedostępna w tej sesji — nic nie zostanie wysłane.' : 'Popraw opcje, żeby wysłać.'}</Text></Box>}
          {sentLine ? [sentLine] : []}
        </Box>
      )
    }

    const card = (c: string, isFeatured: boolean) => {
      const name = d.names[c] ?? null
      const isOn = c === picked
      const [title, purpose] = NAMES[c] ?? [c, '']
      const hint = isFeatured && c === 'relai-stage' ? stageHint(S.plan) : ''
      const border = isOn ? THEME.accent : name === null ? THEME.lineOff : isFeatured ? THEME.mark : THEME.line
      const form = isOn ? formOf(c) : undefined
      return (
        <Box key={`card-${c}`} flexDirection="column">
          <Box key={`row-${c}`} flexDirection="row" alignItems="center" gap={isGui ? 2 : 1}
            paddingX={isFeatured && isGui ? 2 : 1} paddingY={isGui ? 1 : 0} {...frame(isOn)} borderColor={flashBorder(`cmd-${c}`, border)}
            backgroundColor={isOn ? THEME.cardOn : isFeatured ? THEME.cardFeatured : THEME.card} hover={{ borderColor: THEME.accent }}>
            {icon(c, isFeatured ? 48 : 36)}
            <Box key={`text-${c}`} flexDirection="column" flexGrow={1} flexShrink={1}>
              <Text bold color={isFeatured ? THEME.mark : THEME.title} wrap="truncate">{title}</Text>
              <Text color={THEME.body} wrap="truncate">{name === null ? 'niedostępna w tej sesji' : purpose}</Text>
              {hint ? [<Text key={`hint-${c}`} color={THEME.accentText} wrap="truncate">{hint}</Text>] : []}
            </Box>
            {btn(`cmd-${c}`, '/' + c, isOn || isFeatured ? 'primary' : 'secondary', () => pick(c))}
          </Box>
          {form ? [drawer(form)] : []}
        </Box>
      )
    }

    const commandsView = () => [
      section('featured', 'featured', '', FEATURED.map((c) => card(c, true))),
      ...GROUPS.map((g) => section(`group-${g.id}`, `group-${g.id}`, '', g.commands.map((c) => card(c, false)))),
    ]

    // ---------- cheat sheet ----------
    const sheetView = () => {
      if (d.sheet.reason) return [<Box key="sheet-reason"><Text color={THEME.body}>{d.sheet.reason}</Text></Box>]
      const hit = searchSheet(d.sheet, q)
      const commands = hit.commands.map((r) => (
        <Box key={`sheet-${r.command}`} flexDirection="row" alignItems="center" gap={isGui ? 2 : 1}
          paddingX={1} paddingY={isGui ? 1 : 0} {...frame(false)} borderColor={THEME.line} backgroundColor={THEME.card} hover={{ borderColor: THEME.accent }}>
          {icon(r.command, 32)}
          <Box key={`sheet-text-${r.command}`} flexDirection="column" flexGrow={1} flexShrink={1}>
            <Text bold color={THEME.title}>{r.forms.join(' · ')}</Text>
            <Text color={THEME.body}>{clip(r.what, width * 2)}</Text>
          </Box>
          {btn(`open-${r.command}`, 'Formularz', 'secondary',
            () => { void update($, selected, () => r.command).then(() => update($, view, () => 'commands' as const)) })}
        </Box>
      ))
      const phrases = hit.phrases.map((p, i) => (
        <Box key={`sheet-ph-${i}`} flexDirection="row" alignItems="center" gap={isGui ? 2 : 1}
          paddingX={1} paddingY={isGui ? 1 : 0} {...frame(false)} borderColor={THEME.line} backgroundColor={THEME.card}>
          {mark('phrases', THEME.mark, 28, 'fraza')}
          <Box key={`sheet-ph-text-${i}`} flexDirection="column" flexGrow={1} flexShrink={1}>
            <Text bold color={THEME.mark}>{p.phrases.map((x) => `„${x}”`).join(' / ')}</Text>
            <Text color={THEME.body}>{clip(p.effect, width * 2)}</Text>
          </Box>
        </Box>
      ))
      const none = hit.commands.length + hit.phrases.length === 0 ? [<Box key="sheet-none"><Text color={THEME.body}>Nic nie pasuje.</Text></Box>] : []
      return [
        section('sheet', 'sheet', 'Komendy i frazy z docs/KOMENDY.md — wpisz słowo, żeby zawęzić.', [
          <Input key="search" label="Szukaj: " value={q} placeholder="np. backup"
            onInput={(v) => { void update($, query, () => v) }} onSubmit={(v) => { void update($, query, () => v) }} />,
          ...commands, ...phrases, ...none,
        ]),
      ]
    }

    // ---------- phrases ----------
    // One click: the phrase is the button; its effect under it, the bubble on the left
    const readyCard = (p: Phrase, i: number) => {
      const canSend = buildPhrase(p, '').isOk && d.hasRelai
      return (
        <Box key={`ph-${i}`} flexDirection="row" alignItems="center" gap={isGui ? 2 : 1} paddingX={isGui ? 2 : 1} paddingY={isGui ? 1 : 0}
          {...frame(false)} borderColor={flashBorder(`phrase-${i}`, THEME.line)} backgroundColor={THEME.card} hover={{ borderColor: THEME.accent }}>
          {mark('phrases', THEME.mark, 32, 'fraza')}
          <Box key={`ph-body-${i}`} flexDirection="column" gap={isGui ? 1 : 0} flexGrow={1} flexShrink={1} alignItems="flex-start">
            {canSend
              ? btn(`phrase-${i}`, p.phrase, 'primary', () => { void sendPhrase($, p.phrase) }, '✓ ' + p.phrase)
              : <Text key={`phrase-text-${i}`} bold color={THEME.title}>{`„${p.phrase}”`}</Text>}
            <Text color={THEME.body}>{clip(p.effect, width * 2)}</Text>
          </Box>
        </Box>
      )
    }
    // To complete: the same order as a command form — what it does, the field, the exact text, send
    const fillCard = (p: Phrase, i: number) => {
      const built = buildPhrase(p, filled[p.phrase] ?? '')
      const canSend = built.isOk && d.hasRelai
      return (
        <Box key={`ph-${i}`} flexDirection="column" gap={isGui ? 1 : 0} paddingX={isGui ? 2 : 1} paddingY={isGui ? 1 : 0}
          {...frame(false)} borderColor={flashBorder(`phrase-${i}`, THEME.line)} backgroundColor={THEME.card}>
          <Box key={`ph-head-${i}`} flexDirection="row" alignItems="center" gap={isGui ? 2 : 1}>
            {mark('fill', THEME.accentText, 32, 'fraza do uzupełnienia')}
            <Box key={`ph-title-${i}`} flexDirection="column" flexGrow={1} flexShrink={1}>
              <Text bold color={THEME.title}>{`„${p.phrase}”`}</Text>
              <Text color={THEME.body}>{clip(p.effect, width * 2)}</Text>
            </Box>
          </Box>
          <Input key={`fill-${i}`} label="Uzupełnij: " value={filled[p.phrase] ?? ''} placeholder="w miejsce „…”"
            onInput={(v) => { void update($, fills, (m) => ({ ...m, [p.phrase]: v })) }}
            onSubmit={(v) => { void update($, fills, (m) => ({ ...m, [p.phrase]: v })) }} />
          <Box key={`ph-prev-${i}`} flexDirection="column">{well(`ph-well-${i}`, built.isOk ? built.text : (built.error ?? ''), built.isOk)}</Box>
          {canSend ? [<Box key={`ph-act-${i}`} flexDirection="row">{btn(`phrase-${i}`, 'Wyślij do czatu', 'primary', () => { void sendPhrase($, built.text) }, '✓ Wysłano')}</Box>] : []}
        </Box>
      )
    }
    const phrasesView = () => {
      if (d.sheet.reason) return [<Box key="sheet-reason"><Text color={THEME.body}>{d.sheet.reason}</Text></Box>]
      const indexed = d.sheet.phrases.map((p, i) => [p, i] as const)
      const ready = indexed.filter(([p]) => !p.isTemplate).map(([p, i]) => readyCard(p, i))
      const toFill = indexed.filter(([p]) => p.isTemplate).map(([p, i]) => fillCard(p, i))
      return [
        heading('phrases'),
        ...(ready.length ? [section('phrases-ready', 'phrases-ready', 'Kliknij frazę — pójdzie do czatu tak, jakbyś ją napisał.', ready)] : []),
        ...(toFill.length ? [section('phrases-fill', 'phrases-fill', 'Wpisz brakującą część, sprawdź podgląd i wyślij.', toFill)] : []),
      ]
    }

    const body = tab === 'commands' ? commandsView() : tab === 'sheet' ? sheetView() : phrasesView()
    const isSentInDrawer = tab === 'commands' && picked !== '' && formOf(picked) !== undefined
    return (
      <Box key="relai-pane" flexDirection="column" gap={1} paddingX={isGui ? 1 : 0}>
        <Box key="hero" flexDirection="column">
          {heading('hero', THEME.accent)}
          <Text dimColor>{`${FORMS.length} komend RelAI · kliknij komendę, żeby otworzyć jej formularz`}</Text>
        </Box>
        {tabs}
        {d.hasRelai ? [] : [<Box key="no-relai"><Text color={THEME.mark}>{NO_RELAI}</Text></Box>]}
        <Box key="body" flexDirection="column" gap={isGui ? 2 : 1}>{body}</Box>
        {sentLine && !isSentInDrawer ? [sentLine] : []}
      </Box>
    )
  })

  on('session.end', async ($, e, next) => {
    if (S.isRelai && S.id) await $.store.delete(snapKey()).catch(() => undefined)
    return next(e)
  })

  // Each main-loop request: did it read the cache or write it again?
  on('turn.step', async function* ($, e, next) {
    const startedAt = await $.clock.now()
    const result = yield* next(e)
    if (!S.isRelai || e.agentId || !result || !result.usage) return result
    const now = await $.clock.now()
    const u = result.usage as Usage
    const gap = S.lastActivity ? startedAt - S.lastActivity : 0
    const verdict = judgeStep(u, gap, !!S.lastActivity, S.justCompacted, effectiveTtl(S.ttl).ttlMin)
    set({ ttl: applyVerdict(S.ttl, verdict), ctx: totalInput(u), lastActivity: now, justCompacted: false })
    return result
  })

  on('turn.complete', async ($, e, next) => {
    const r = await next(e)
    if (!S.isRelai || e.agentId) return r
    await refresh($)
    await saveSnap($, await $.clock.now())
    $.ui.invalidate('ui.render')
    return r
  })

  on('session.compact', async ($, e, next) => {
    const r = await next(e)
    if (S.isRelai) set({ justCompacted: true })
    return r
  }).catch(($, e, next) => next(e))

  on('session.measure', async ($, e, next) => {
    if (S.isRelai) {
      if (e.context?.tokens) set({ ctx: e.context.tokens })
      if (e.cost) set({ costUsd: e.cost.usd })
    }
    return next(e)
  })

  // One band instance for every plugin: draw ours above whatever the plugins beneath draw
  // (cache-keeper-pl's band among them), never instead of it
  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (!S.isRelai || e.props.hasSurvey) return next(e)
    const below = await next(e)
    const ours = band($, e, e.props.bodyColumns, await $.clock.now())
    if (!below) return ours
    const { Box } = $.ui.resolve(e)
    // No width here: the engine refuses its own node under a Box with "width" and draws its own
    // instead, which drops every band (live, desktop, 2.1.293; plugin test does not see it)
    return <Box key="relai-panel" flexDirection="column">{[ours, below]}</Box>
  })
}
