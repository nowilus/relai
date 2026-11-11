// relai-panel: "Oszczędności" — what the enabled RelAI token-saving mods saved (plan
// MODY_OSZCZEDZANIA, E2; spec, section 4). A different measure from "Koszty": that tab prices the
// session's work at API prices, this one counts what the mods kept Claude from reading. Two
// columns, never mixed (R6): measured — the helpers' cost from their own usage; estimated — the
// tokens saved, priced once at the main model's input price, always labelled as an estimate.
// Sums in ./core/savings-view.mjs; register.tsx reads the ledger files. No `$` here (P-023 pkt 10).

import { THEME } from './core/theme.mjs'
import { FILTERS, savingsView } from './core/savings-view.mjs'
import { plural } from './core/measure.mjs'
import { usd } from './fmt'
import type { Ctx, Parts } from './pane-parts'

export type SavingsFilter = 'chat' | 'today' | 'all'

export type SavingsData = {
  records: object[]
  bad: number
  files: number
  error: string
  session: string
  mainModel: string | null
  lists: object[]
  isToday: (ts: string) => boolean
}

export type SavingsCtx = {
  filter: SavingsFilter
  setFilter: (f: SavingsFilter) => void
}

const FILTER_LABEL: Readonly<Record<SavingsFilter, string>> = { chat: 'Ten czat', today: 'Dziś', all: 'Wszystko' }
const FILTER_WORDS: Readonly<Record<SavingsFilter, string>> = { chat: 'w tym czacie', today: 'dziś, we wszystkich czatach', all: 'w całym rejestrze (14 dni)' }
const ACTION_WORDS: Readonly<Record<string, string>> = { shrink: 'zmniejszone obrazy', describe: 'obrazy opisane słowami' }

/** Every digit shown: the tab's sum is checked against the ledger to the token (R6). */
export const exact = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
const signed = (n: number) => (n < 0 ? `−${usd(-n)}` : usd(n))
const nTokens = (n: number) => `${exact(n)} ${plural(n, 'token', 'tokeny', 'tokenów')}`
const nRecords = (n: number) => `${n} ${plural(n, 'rekord', 'rekordy', 'rekordów')}`

export function savingsTab(c: Ctx, p: Parts, d: SavingsData, s: SavingsCtx) {
  const { el, isGui } = c
  const { Box } = el
  const { btn, section, ruled, line, figure, frame, isStacked } = p
  const v = savingsView(d.records, { filter: s.filter, session: d.session, isToday: d.isToday, mainModel: d.mainModel, lists: d.lists })

  // One value of a group is chosen: secondary with a dot (DESIGN §7); a choice never flashes
  const filters = (
    <Box key="sv-filters" flexDirection="row" flexWrap="wrap" columnGap={1} rowGap={1}>
      {(FILTERS as readonly SavingsFilter[]).map((f) => btn(`sv-f-${f}`, (f === s.filter ? '● ' : '') + FILTER_LABEL[f], 'secondary', () => s.setFilter(f)))}
    </Box>
  )

  // A tile: the figure, what it is, one sentence (as the costs tab's tiles)
  const tile = (key: string, fig: string, color: string, label: string, note: string) => (
    <Box key={key} flexDirection="column" gap={isGui ? 1 : 0} paddingX={1}
      width={isStacked ? undefined : '45%'} flexGrow={1} minWidth={26} {...frame(false)} borderColor={THEME.line}>
      <Box key={`${key}-head`} flexDirection="row" flexWrap="wrap" alignItems="center" columnGap={1}>
        {figure(`${key}-fig`, fig, 24, color)}
        {line(`${key}-l`, label, THEME.title, true)}
      </Box>
      {line(`${key}-n`, note)}
    </Box>
  )

  // never `h`: the engine's JSX factory has that name, a local `h` shadows it (P-064)
  const helper = v.helper
  const measured = tile('sv-measured', helper.calls === 0 ? usd(0) : helper.unpriced > 0 ? 'brak ceny' : usd(helper.usd), THEME.title, 'zmierzone',
    helper.calls === 0
      ? 'Koszt helperów: żaden mod nie wołał modelu pomocniczego.'
      : `Koszt helperów z usage: ${helper.calls} ${plural(helper.calls, 'wywołanie', 'wywołania', 'wywołań')}, ${nTokens(helper.in)} wejścia i ${nTokens(helper.out)} wyjścia${helper.unpriced > 0 ? ` — ${helper.unpriced} bez ceny w cenniku` : ''}.`)
  const estimated = tile('sv-estimated', v.estimatedUsd === null ? 'brak ceny' : `~${usd(v.estimatedUsd)}`, THEME.mark, 'szacowane',
    `SZACUNEK: ${nTokens(v.saved)}, których Claude nie przeczytał, × cena wejścia ${v.mainModel ?? 'modelu sesji'}, bez mnożnika cache.`)
  const net = line('sv-net', v.netUsd === null
    ? 'Bilans: brak — bez ceny któregoś modelu nie liczę, żeby nie zawyżyć.'
    : `Bilans (szacowane − zmierzone): ~${signed(v.netUsd)} ${FILTER_WORDS[s.filter]}.`, v.netUsd !== null && v.netUsd < 0 ? THEME.accentText : THEME.title, true)
  const rows = v.byMod.map((r, i) => line(`sv-row-${i}`, `${r.mod} · ${ACTION_WORDS[r.action] ?? r.action}: ${nRecords(r.count)}, ${nTokens(r.saved)} mniej (szacunek)`))
  const left = v.leftOut.count > 0
    ? [line('sv-left', `Odrzucone jako nieprawdopodobne (LEFT OUT): ${nRecords(v.leftOut.count)}, ${nTokens(v.leftOut.saved)} — poza sumą.`, THEME.accentText)]
    : []
  const notes = [
    ...(d.bad > 0 ? [line('sv-bad', `${d.bad} ${plural(d.bad, 'zła linia', 'złe linie', 'złych linii')} w rejestrze pominięte.`, THEME.accentText)] : []),
    ...(d.error ? [line('sv-err', d.error, THEME.accentText)] : []),
  ]
  const empty = v.records === 0 && v.leftOut.count === 0 && helper.calls === 0
    ? [line('sv-empty', d.files === 0 ? 'Rejestr jest pusty — żaden mod oszczędzania jeszcze nic nie zapisał.' : `Nic ${FILTER_WORDS[s.filter]}. Zmień filtr.`)]
    : []

  return ruled('savings', [
    section('savings', 'savings',
      'Ile zaoszczędziły włączone mody RelAI — inna miara niż „Koszty”. Zmierzone to koszt helperów z ich usage; szacowane to tokeny, których Claude nie musiał czytać.',
      [
        filters,
        <Box key="sv-tiles" flexDirection={isStacked ? 'column' : 'row'} flexWrap="wrap" columnGap={2} rowGap={1}>{[measured, estimated]}</Box>,
        net,
      ]),
    <Box key="sv-detail" flexDirection="column" gap={isGui ? 1 : 0}>
      {line('sv-count', `${nRecords(v.records)} w sumie, ${nTokens(v.saved)} mniej (szacunek) ${FILTER_WORDS[s.filter]}.`, THEME.title)}
      {[...rows, ...left, ...notes, ...empty]}
    </Box>,
  ])
}
