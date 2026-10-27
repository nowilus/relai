// relai-mods: how the cockpit draws — no $ (P-017), the elements come in with the view. Plan
// RELAI_MODS, E3. Calibration round 1 (Łukasz 2026-10-23) drew four layouts in the real carrier —
// groups, tiles, a list, an accordion — and he chose the accordion with groups: one column, the
// sections Mody / Pluginy / Hooki under Kalam headings with their counts ("grupy muszą mieć większą
// ekspozycję"), the details unfolding under the picked row. Above them: the search with a label,
// the filters with their counts and the bar of changes.

import type { EngineInterface } from 'claude-code'
import { MOD_MODULE_WORD, STATE_WORD, eventsWord, headerOf, summaryOf } from './inventory'
import type { Inventory, Item, PluginItem } from './inventory'
import {
  FILTERS, SCOPE_KEY, STACK_BELOW, changeText, glyphOf, isQueued, itemKey, lockOf, pendingText, projectLabel, rowLockWord,
  scopeFacts, scopeStateWord, scopeWant, selfCommand, switchWord, visible,
} from './cockpit'
import type { Filter, Queue, ScopeRow } from './cockpit'
import { KEY, KIND_KEY, LOCK, RULE, SWITCH, lockAlt, lockSvg, switchAlt, switchSvg } from './look'
import { HEADING_ART } from './core/headings.mjs'
import { twoTone } from './core/theme.mjs'

export type El = ReturnType<EngineInterface['ui']['resolve']>
export type SvgTag = NonNullable<El extends { Svg: infer T } ? T : never> | null

export type View = {
  el: El
  Svg: SvgTag
  /** Drawings in the rows: the switch and the rule; past the budget the glyph and a gap (R7). */
  isFull: boolean
  /** The pane's bodyColumns: below STACK_BELOW every row puts its tail, switch and arrow under its name (E4). */
  width: number
  inv: Inventory
  shown: Item[]
  chosen: Item | undefined
  filter: Filter
  query: string
  queue: Queue
  errors: Record<string, string>
  pending: number
  note: string
  cli: string
  cliName: string
  cwd: string
  /** A switch's press with the state it asks for, true for on: what the person saw, not the disk at the press (E4). */
  onPress: (key: string, want: boolean) => void
  onPick: (key: string) => void
  onFilter: (f: Filter) => void
  onQuery: (q: string) => void
  onReload: () => void
  /** The row "RelAI w tym projekcie"; null in the home folder or with no plugin of the set (ZASIEG_PLUGINU E3). */
  scope: ScopeRow | null
  /** Its card waiting for "Tak": the state it asks for, '' for none. */
  ask: '' | 'on' | 'off'
  onAsk: (want: boolean) => void
  onDecide: (isYes: boolean, want: boolean) => void
}

export const titleOf = (i: Item): string => (i.kind === 'hook' ? i.script || i.command : i.id)
/** The name a person knows: the id before its marketplace, or the hook's script. */
const nameOf = (i: Item): string => (i.kind === 'hook' ? i.script || i.command : i.id.split('@')[0] ?? i.id)
const isOnRow = (i: Item) => i.kind === 'hook' || i.state === 'on'
const isChosen = (v: View, i: Item) => v.chosen !== undefined && itemKey(v.chosen) === itemKey(i)

// The short note at a row's right edge: the events, or the hook's event
function tailOf(i: Item): string {
  if (i.kind === 'hook') return i.event
  return i.events.length ? eventsWord(i.events.length) : ''
}

// ---------- shared parts ----------

// The switch of a row or of the details: the word that presses, then the drawing of its state (Annex C)
function control(v: View, i: Item, at: string) {
  const { Box, Text, Button } = v.el
  const { Svg } = v
  const k = itemKey(i)
  const lock = lockOf(i)
  // The details keep their drawings past the budget; only the rows give them up (R7)
  const isDrawn = Svg !== null && (v.isFull || at === 'detail')
  if (lock) {
    const word = at === 'detail' ? lock : rowLockWord(i)
    return (
      <Box key={`${at}-lock-${k}`} flexDirection="row" columnGap={1} flexShrink={0} alignItems="center">
        {Svg && isDrawn ? <Box key="mark" flexShrink={0}><Svg key="svg" source={lockSvg()} alt={lockAlt(lock)} width={LOCK.width} height={LOCK.height} /></Box> : null}
        <Text color={KEY.muted}>{Svg ? word : `[${word}]`}</Text>
      </Box>
    )
  }
  if (i.kind === 'hook') return null
  const isBusy = isQueued(v.queue, k)
  const word = isBusy ? '…' : switchWord(i.state)
  const want = i.state !== 'on'
  const onPress = () => { if (!isBusy) v.onPress(k, want) }
  // The terminal draws no Svg: the glyph in the key of its state, then the word (E4)
  const flip = Svg === null
    ? <Button key={`flip-${at}-${k}`} plain onPress={onPress}><Text color={i.state === 'on' ? KEY.done : KEY.muted}>{glyphOf(i.state)}</Text> {word}</Button>
    : <Button key={`flip-${at}-${k}`} plain label={isDrawn ? word : `${glyphOf(i.state)} ${word}`} onPress={onPress} />
  return (
    <Box key={`${at}-switch-${k}`} flexDirection="row" columnGap={1} flexShrink={0} alignItems="center">
      {flip}
      {/* the drawing last: the words differ in width ("Włącz", "Wyłącz"), the drawings stand in one column (live, E3) */}
      {Svg && isDrawn ? <Box key="mark" flexShrink={0}><Svg key="svg" source={switchSvg(i.state)} alt={switchAlt(i.state)} width={SWITCH.width} height={SWITCH.height} /></Box> : null}
    </Box>
  )
}

// The fading rule between rows (Łukasz's first direction for lists), or a gap past the budget
function rule(v: View, key: string) {
  const { Box } = v.el
  const { Svg } = v
  return Svg && v.isFull
    ? <Box key={key} flexDirection="column"><Svg key={`${key}-svg`} source={RULE.svg} alt={RULE.alt} height={RULE.height} /></Box>
    : <Box key={key} height={1} />
}

// A path or a command is one long word to a desktop, which never breaks a text below its longest
// word (P-043): a zero-width space after each separator gives it places to break in a narrow pane
// (E4). The terminal breaks a long word by itself and gets the text as it is
const ZWSP = String.fromCharCode(0x200b)
const breakable = (v: View, s: string) => (v.Svg === null ? s : s.replace(/([/\\])/g, `$1${ZWSP}`))

// One line of the details: the label muted, the value in text
function line(v: View, key: string, label: string, value: string) {
  const { Text } = v.el
  return <Text key={key}><Text color={KEY.muted}>{label}: </Text>{breakable(v, value)}</Text>
}

// The details in three groups split by the fading rule: what it is, what it holds, what a switch changes
function detailGroups(v: View, i: Item) {
  const { Box } = v.el
  if (i.kind === 'hook') {
    return [
      <Box key="d-what" flexDirection="column">
        {line(v, 'd-source', 'Źródło', '~/.claude/settings.json')}
        {line(v, 'd-event', 'Zdarzenie', i.event)}
        {line(v, 'd-matcher', 'Matcher', i.matcher || 'każdy')}
      </Box>,
      rule(v, 'd-rule-1'),
      <Box key="d-cmd" flexDirection="column">{line(v, 'd-command', 'Komenda', i.command)}</Box>,
    ]
  }
  const p = i as PluginItem
  const label = projectLabel(p, v.cwd)
  return [
    <Box key="d-what" flexDirection="column">
      {line(v, 'd-kind', 'Typ', p.kind === 'mod' ? 'mod (rysuje w oknie Claude Code)' : 'plugin')}
      {line(v, 'd-id', 'Id', p.id)}
      {line(v, 'd-version', 'Wersja', p.version || 'bez wersji')}
      {line(v, 'd-scope', 'Zakres', label ? `${p.scope} · ${label}` : p.scope)}
    </Box>,
    rule(v, 'd-rule-1'),
    <Box key="d-holds" flexDirection="column">
      {line(v, 'd-counts', 'Zawiera', summaryOf(p).split(' · zdarzenia:')[0] ?? '—')}
      {line(v, 'd-events', 'Odpala się na', p.events.length ? p.events.join(', ') : p.kind === 'mod' ? `zdarzenia modu — ${MOD_MODULE_WORD}` : 'nic — bez hooków')}
      {p.notes.map((t, n) => line(v, `d-note-${n}`, 'Dopisek', t))}
    </Box>,
    rule(v, 'd-rule-2'),
    <Box key="d-file" flexDirection="column">
      {line(v, 'd-state', 'Stan', `${STATE_WORD[p.state]} w ${p.stateFile}`)}
      {changeText(p, v.cwd).map((t, n) => line(v, `d-change-${n}`, n === 0 ? 'Przełącznik' : 'Uwaga', t))}
      {line(v, 'd-cli', 'CLI', `${v.cliName} z PATH · ${v.cli || 'sprawdzam wersję…'}`)}
    </Box>,
  ]
}

function details(v: View, i: Item | undefined, grow: number) {
  const { Box, Text } = v.el
  if (!i) return <Box key="details" flexDirection="column" width={0} flexGrow={grow}><Text color={KEY.muted}>Wybierz pozycję z listy.</Text></Box>
  const k = itemKey(i)
  const label = i.kind === 'hook' ? '' : projectLabel(i, v.cwd)
  return (
    <Box key="details" flexDirection="column" width={0} flexGrow={grow}>
      <Text key="d-title" bold color={KEY.text}><Text color={KIND_KEY[i.kind]}>{i.kind} </Text>{nameOf(i)}{label ? <Text color={KIND_KEY.project}> · {label}</Text> : null}</Text>
      {i.kind === 'hook' ? null : <Text key="d-desc" color={KEY.muted}>{i.description || '—'}</Text>}
      <Box key="d-control" flexDirection="row" marginTop={1}>{control(v, i, 'detail')}</Box>
      {i.kind !== 'hook' && i.isSelf ? <Text key="d-self" color={KEY.muted}>Wyłączysz go ręcznie: {selfCommand(i.id)}</Text> : null}
      {v.errors[k] ? <Text key="d-error" color={KEY.failed}>{v.errors[k]}</Text> : null}
      <Box key="d-groups" flexDirection="column" marginTop={1}>{detailGroups(v, i)}</Box>
    </Box>
  )
}

// The head: the count, the search with its label, the filters with counts
function head(v: View) {
  const { Box, Text, Button, Input } = v.el
  return (
    <Box key="head" flexDirection="column" rowGap={1}>
      <Text key="count" bold color={KEY.text}>{headerOf(v.inv)}</Text>
      {v.inv.problem ? <Text key="problem" color={KEY.failed}>{v.inv.problem}</Text> : null}
      <Input key="query" label="Szukaj" placeholder="nazwa, opis, zdarzenie" value={v.query} onInput={(q) => v.onQuery(q)} onSubmit={(q) => v.onQuery(q)} />
      <Box key="filters" flexDirection="row" flexWrap="wrap" columnGap={1} rowGap={1}>
        {FILTERS.map(([f, word]) => {
          const n = visible(v.inv.items, f, '').length
          return <Button key={`filter-${f}`} variant="secondary" label={`${f === v.filter ? '● ' : ''}${word} ${n}`} onPress={() => v.onFilter(f)} />
        })}
      </Box>
    </Box>
  )
}

function pendingBar(v: View) {
  const { Box, Text, Button } = v.el
  if (v.pending <= 0) return null
  return (
    <Box key="pending" flexDirection="column" marginTop={1}>
      <Box key="bar" flexDirection="row" columnGap={1} alignItems="center">
        <Box key="words" width={0} flexGrow={1}><Text color={KEY.running}>⟳ {pendingText(v.pending)}</Text></Box>
        <Button key="reload" variant="primary" label="Przeładuj" onPress={() => v.onReload()} />
      </Box>
      {v.note ? <Text key="note" color={KEY.text}>{v.note}</Text> : null}
    </Box>
  )
}

// The card of the row: a frame only for what waits on the person's decision (DESIGN.md §4.1),
// what a "Tak" changes in rows of facts, the question, "Tak" (primary) and "Nie"
function scopeCard(v: View, row: ScopeRow, want: boolean) {
  const { Box, Text, Button } = v.el
  const { facts, question } = scopeFacts(row, want)
  return (
    <Box key="scope-card" flexDirection="column" marginTop={1} paddingX={1} borderStyle="round" borderColor={KEY.accent}>
      {facts.map(([label, value], n) => (
        <Box key={`scope-fact-${n}`} flexDirection="row" flexWrap="wrap" columnGap={1}>
          <Box key="l" flexShrink={0} width={9}><Text color={KEY.muted}>{label}</Text></Box>
          <Box key="v" width={0} flexGrow={1}><Text color={KEY.text}>{breakable(v, value)}</Text></Box>
        </Box>
      ))}
      <Text key="scope-question" bold color={KEY.text}>{question}</Text>
      <Box key="scope-act" flexDirection="row" flexWrap="wrap" columnGap={1} rowGap={1}>
        <Button key="scope-yes" variant="primary" label="Tak" onPress={() => v.onDecide(true, want)} />
        <Button key="scope-no" variant="secondary" label="Nie" onPress={() => v.onDecide(false, want)} />
      </Box>
    </Box>
  )
}

// The row "RelAI w tym projekcie" above the list (ZASIEG_PLUGINU E3): the state in a word and a
// sign, one button that only opens the card, the CLI's error under it
function scopeSection(v: View) {
  const { Box, Text, Button } = v.el
  const row = v.scope
  if (!row) return null
  const want = scopeWant(row)
  const isBusy = isQueued(v.queue, SCOPE_KEY)
  const err = v.errors[SCOPE_KEY]
  return (
    <Box key="scope" flexDirection="column" marginTop={1}>
      <Box key="scope-row" flexDirection="row" flexWrap="wrap" columnGap={1} rowGap={1} alignItems="center">
        <Box key="scope-words" width={0} flexGrow={1}>
          <Text><Text bold color={KEY.text}>RelAI w tym projekcie </Text><Text color={row.isLocalOn ? KEY.done : KEY.muted}>{scopeStateWord(row)}</Text></Text>
        </Box>
        <Button key="scope-flip" variant="secondary" label={isBusy ? '…' : want ? 'Włącz' : 'Wyłącz'} onPress={() => { if (!isBusy && !v.ask) v.onAsk(want) }} />
      </Box>
      {v.ask ? scopeCard(v, row, v.ask === 'on') : null}
      {err ? <Text key="scope-err" color={KEY.failed}>{err}</Text> : null}
    </Box>
  )
}

// One line of a list: a mark of the chosen row, the kind (unless the group says it), the name, the tail, the switch, the pick
function listRow(v: View, i: Item, index: number, isKindShown: boolean, pickWords: readonly [string, string]) {
  const { Box, Text, Button } = v.el
  const k = itemKey(i)
  const chosen = isChosen(v, i)
  const label = i.kind === 'hook' ? '' : projectLabel(i, v.cwd)
  const err = v.errors[k]
  const title = (
    <Box key="title" width={0} flexGrow={1}>
      <Text bold={chosen} color={isOnRow(i) ? KEY.text : KEY.muted} wrap="truncate-end">
        {chosen ? <Text color={KEY.accent}>● </Text> : null}
        {isKindShown ? <Text color={KIND_KEY[i.kind]}>{i.kind} </Text> : null}
        {nameOf(i)}
        {label ? <Text color={KIND_KEY.project}> · {label}</Text> : null}
      </Text>
    </Box>
  )
  const acts = [
    tailOf(i) ? <Box key="tail" flexShrink={0}><Text color={KEY.muted}>{tailOf(i)}</Text></Box> : null,
    control(v, i, 'row'),
    <Button key={`pick-${k}`} plain label={chosen ? pickWords[1] : pickWords[0]} onPress={() => v.onPick(k)} />,
  ]
  // One decision for the pane, by its width (E4, as STACK_BELOW of relai-panel): below the
  // threshold every row has its name on a line of its own and the rest under it; the name keeps
  // a row of its own, as a zero-based box in a column gets no width (P-050)
  const top = v.width < STACK_BELOW
    ? (
      <Box key="top" flexDirection="column">
        <Box key="name" flexDirection="row">{title}</Box>
        {/* a hook's long event, its lock and the arrow may not fit one line of the narrowest pane: they wrap */}
        <Box key="acts" flexDirection="row" flexWrap="wrap" columnGap={1} alignItems="center">{acts}</Box>
      </Box>
    )
    : <Box key="top" flexDirection="row" columnGap={1} alignItems="center">{title}{acts}</Box>
  return (
    <Box key={`row-${k}`} flexDirection="column">
      {index > 0 ? rule(v, 'rule') : null}
      {top}
      {err ? <Text key="err" color={KEY.failed}>{err}</Text> : null}
    </Box>
  )
}

function none(v: View) {
  const { Text } = v.el
  return <Text key="none" color={KEY.muted}>Nic nie pasuje.</Text>
}

// ---------- the body: the accordion in groups ----------

const GROUPS = [['mod', 'Mody'], ['plugin', 'Pluginy'], ['hook', 'Hooki']] as const

// A group's heading: its word in Kalam (a drawing, as the pane's own section headings: Text has no
// size), then its count; the terminal reads the word in mustard
function groupHead(v: View, kind: string, word: string, count: string) {
  const { Box, Text } = v.el
  const { Svg } = v
  const art = HEADING_ART[`mods-${kind}`]
  return (
    <Box key="group-head" flexDirection="row" columnGap={2} alignItems="flex-end" marginBottom={1}>
      {Svg && art
        ? <Box key="art" flexShrink={0}><Svg key="art-svg" source={twoTone(art.svg)} alt={art.text} width={art.width} height={art.height} /></Box>
        : <Text key="word" bold color={KEY.running}>{word}</Text>}
      <Box key="count" flexShrink={0} paddingBottom={Svg && art ? 1 : 0}><Text color={KEY.muted}>{count}</Text></Box>
    </Box>
  )
}

function body(v: View) {
  const { Box } = v.el
  const parts = GROUPS.map(([kind, word], g) => {
    const rows = v.shown.filter((i) => i.kind === kind)
    if (!rows.length) return null
    const on = rows.filter(isOnRow).length
    const count = kind === 'hook' ? `${rows.length} · tylko podgląd` : `${on}/${rows.length} włączone`
    return (
      <Box key={`group-${kind}`} flexDirection="column" marginTop={g > 0 ? 2 : 0}>
        {groupHead(v, kind, word, count)}
        {rows.map((i, n) => (
          <Box key={`fold-${itemKey(i)}`} flexDirection="column">
            {listRow(v, i, n, false, ['▸', '▾'])}
            {/* a row, not a column: a zero-based box in a column gets no width and breaks its text letter by letter (P-050) */}
            {isChosen(v, i) ? <Box key="open" flexDirection="row" paddingLeft={2} marginTop={1} marginBottom={1}>{details(v, i, 1)}</Box> : null}
          </Box>
        ))}
      </Box>
    )
  })
  return <Box key="body" flexDirection="column" marginTop={1}>{v.shown.length ? parts : none(v)}</Box>
}

export function cockpit(v: View) {
  const { Box } = v.el
  return (
    <Box key="cockpit" flexDirection="column">
      {head(v)}
      {pendingBar(v)}
      {scopeSection(v)}
      {body(v)}
    </Box>
  )
}

/** The mobile surface: the list as text, no switches (plan, section 8). */
export function mobileList(el: El, inv: Inventory) {
  const { Box, Text } = el
  return (
    <Box key="mobile" flexDirection="column">
      <Text key="head" bold>{headerOf(inv)}</Text>
      {inv.items.map((i) => <Text key={`m-${itemKey(i)}`}>{i.kind} {titleOf(i)} · {i.kind === 'hook' ? i.event : STATE_WORD[i.state]}</Text>)}
    </Box>
  )
}
