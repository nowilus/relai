// relai-panel: the costs tab (E3, E4, E6). The session's measured requests, priced: a hypothetical
// API cost, never the subscription's bill (plan, section 3). A gap is said in words and the sum
// called partial, never a zero. Kept short (calibration 2026-10-08): figures first, one line of
// words where one is needed, the details of each call in the tooltips of the columns. Brief v2 §7
// (AUDYT_MODOW Z2, P3): the tiles stay; the sections under them are folded rows — a Kalam heading,
// one line with the section's key number, "▸ Rozwiń" — all folded by default, the fold kept in
// $.state (`unfolded`, "costs:<section>"); an unfolded section draws as before, in the Z3 bounds.
// The folded row is pane-parts.tsx's since Z14, the map's sections fold the same way.
//
// Split out of register.tsx in E7 without a change of behavior; no `$` here (P-023 pkt 10).

import type { RenderChildren } from 'claude-code'
import { pct, tokens, usd } from './fmt'
import { COST_COLORS, THEME } from './core/theme.mjs'
import { gapsInWords, plural } from './core/measure.mjs'
import type { Group, Report, TurnCost } from './core/measure.mjs'
import { PRICE_FILE, unpricedWords } from './core/pricing.mjs'
import { SOURCE_WORDS } from './core/limit-threshold.mjs'
import { RULER_HEIGHT, presetsFor, rulerSvg, usedWords, type LimitWindow } from './limit-ruler'
import type { cacheEffect } from './core/pricing.mjs'
import { MAX_COLUMNS, bucketRanges, hoverColumns, hoverHeight, niceStep, spark } from './core/charts.mjs'
import type { StageCosts } from './core/attribution.mjs'
import type { CallCost, CostData, ProjectSum } from './data'
import { CATS } from './pane-parts'
import type { Ctx, Parts } from './pane-parts'

const MIN = 60_000
const LATE_MS = 2 * MIN // a collector that began this much after the session missed part of it

// The bounds of one drawing (AUDYT_MODOW Z3, P-023 pkt 7: a tree too big vanishes from the desktop
// without a word). Agents, models and stages: the CARDS most expensive, in their own order, the
// rest in one line with its sum. Figures in Kalam: each carries its own copy of the font (an Svg
// is drawn apart from the others), so FIGURES a drawing — the sum and the tiles first, then the
// rows in their order — and every one past them as bold text in the same color. The calls'
// chart: a column per call up to MAX_COLUMNS calls, as before; past them CHART_COLUMNS at most
// (a column's hover card weighs ~1.4 k), neighbours sharing one.
const CARDS = 12
const FIGURES = 8
const CHART_COLUMNS = 40

// The n most expensive of a list, kept in the list's order, and the rest
function topOf<T>(items: readonly T[], usd: (x: T) => number | null, n = CARDS): { shown: T[], rest: T[] } {
  if (items.length <= n) return { shown: [...items], rest: [] }
  const kept = new Set([...items.keys()].sort((a, b) => (usd(items[b]!) ?? 0) - (usd(items[a]!) ?? 0)).slice(0, n))
  return { shown: items.filter((_, i) => kept.has(i)), rest: items.filter((_, i) => !kept.has(i)) }
}

// What the tab needs of the session beyond its data: the engine's counter and when the session and
// the collector began, the models muted on a price-list card's "Nie", and the press that makes it
export type CostsCtx = {
  session: { costUsd: number | null, startedAt: number, loadedAt: number }
  muted: Record<string, string>
  // NOWA_SESJA N3: how a card opens a new session here, from the session's look at its tools
  launchVia: 'link' | 'app' | null
  preparePricing: () => void
  limits: LimitRows | null // the plan-limit thresholds (LIMIT_CHECKPOINT E4); null when they cannot be read
  used: Readonly<Record<LimitWindow, number | null>> // what each window has used now, in whole percent; null: no data
  changeLimit: (window: LimitWindow, value?: number) => void // no value: the keeper asks the number
}

// The two thresholds as the panel core reads them (./core/limit-threshold.mjs)
export type { LimitWindow }
export type LimitRows = Readonly<Record<LimitWindow, { value: number, source: keyof typeof SOURCE_WORDS }>>
const LIMIT_LABEL: Readonly<Record<LimitWindow, string>> = { five: 'limit 5 h', week: 'limit tygodnia' }

export function costsView(c: Ctx, p: Parts, cd: CostData, s: CostsCtx) {
  const { el, Svg, isGui } = c
  const { Box, Text } = el
  const { section, frame, barCols, bar, costBox, line, money, nCalls, legend, btn } = p
  const S = s.session
  const mutedNow = s.muted
  let figuresLeft = FIGURES
  const figure = (key: string, text: string, size: number, color: string) => {
    if (figuresLeft <= 0) return <Text key={key} bold color={color}>{text}</Text>
    figuresLeft -= 1
    return p.figure(key, text, size, color)
  }
  // The line under a bounded list: how many more and what they cost together
  const restLine = (key: string, rest: { usd: number | null }[]) => {
    const sum = rest.reduce((acc, g) => acc + (g.usd ?? 0), 0)
    const isPartial = rest.some((g) => g.usd === null)
    return line(key, `… jeszcze ${rest.length} razem ${usd(sum)}${isPartial ? ' (częściowo)' : ''} — panel rysuje ${CARDS} najdroższych`)
  }

  // A section as a folded row (P3), the pane's shared part since Z14: "costs:<section>" in $.state
  const folded = (id: string, summary: string, content: () => RenderChildren[], isAlert = false) => p.folded('costs', id, summary, content, isAlert)

  const clock = (at: number) => { const d = new Date(at); return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}` }
  const day = (at: number) => { const d = new Date(at); return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}` }
  const nTurns = (n: number) => `${n} ${plural(n, 'tura', 'tury', 'tur')}`
  const who = (x: { agent: string | null, kind?: string }) => (x.kind === 'compact' ? 'kompakcja' : x.agent === null ? 'wątek główny' : `subagent ${x.agent.slice(0, 8)}`)

  // The sum: the figure, what it counts, its four categories as one bar and the legend
  const totalCard = (rep: Report, turnCount: number) => {
    const g = rep.total
    return costBox('cost-total', [
      <Box key="cost-total-head" flexDirection="row" flexWrap="wrap" alignItems="center" columnGap={2}>
        {figure('cost-total-fig', money(g.usd), 34, THEME.mark)}
        <Box key="cost-total-cap" flexDirection="column">
          {line('cost-total-t', `Suma sesji · ${nCalls(g.records)} · ${nTurns(turnCount)}`, THEME.title, true)}
          {line('cost-total-s', g.isPartial ? 'suma częściowa — braki na dole' : 'hipotetyczny koszt w cenach API, nie rachunek abonamentu', g.isPartial ? THEME.accentText : THEME.body)}
        </Box>
      </Box>,
      bar('cost-total-bar', CATS.map(([k, label, color]) => ({ value: g.parts[k], color, label })), 10),
      legend('legend', g),
    ], true)
  }

  // Three tiles in a row (stacked when the pane is narrow): the figure, what it is, one sentence
  const tile = (key: string, fig: string, color: string, label: string, note: string, noteColor: string = THEME.body) => (
    <Box key={key} flexDirection="column" gap={isGui ? 1 : 0} paddingX={isGui ? 2 : 1} paddingY={isGui ? 1 : 0}
      width="30%" flexGrow={1} minWidth={26} {...frame(false)} borderColor={THEME.line} backgroundColor={THEME.card}>
      <Box key={`${key}-head`} flexDirection="row" flexWrap="wrap" alignItems="center" columnGap={1}>
        {figure(`${key}-fig`, fig, 24, color)}
        {line(`${key}-l`, label, THEME.title, true)}
      </Box>
      {line(`${key}-n`, note, noteColor)}
    </Box>
  )
  const engineTile = (rep: Report, since: number | null) => {
    const engine = S.costUsd
    if (engine === null) return tile('cost-engine', '~', THEME.title, 'licznik Claude Code', 'Ta sesja nie ma licznika kosztu — zostaje pomiar kolektora.')
    if (rep.records === 0) return tile('cost-engine', usd(engine), THEME.title, 'licznik Claude Code', 'Cała sesja (jak /cost). Kolektor jeszcze nic nie zmierzył — kwota bez rozbicia.', THEME.accentText)
    const measured = rep.total.usd ?? 0
    const rest = Math.max(0, engine - measured)
    if (rest < Math.max(0.01, engine * 0.01)) return tile('cost-engine', usd(engine), THEME.title, 'licznik Claude Code', 'Cała sesja (jak /cost) — zgodna z pomiarem kolektora.', THEME.ok)
    // Late only when the collector really began after the session (a mod loaded mid-session):
    // a collector there from the start explains the rest by requests outside the conversation
    const isLate = S.startedAt > 0 && S.loadedAt - S.startedAt > LATE_MS && (since ?? S.loadedAt) - S.startedAt > LATE_MS
    return tile('cost-engine', usd(engine), THEME.title, 'licznik Claude Code', isLate
      ? `Cała sesja (jak /cost). Kolektor działa od ${clock(since ?? S.loadedAt)}; ${usd(rest)} to tury sprzed tej chwili — bez rozbicia.`
      : `Cała sesja (jak /cost). ${usd(rest)} to wywołania poza rozmową (tytuł sesji, inne pluginy) — bez rozbicia.`)
  }
  const cacheTile = (fx: ReturnType<typeof cacheEffect>) =>
    tile('cost-cache', pct(fx.fromCache, 1), COST_COLORS.cacheRead, 'wejścia z cache',
      `Zapłacone ${usd(fx.paidUsd)} zamiast ${usd(fx.noCacheUsd)} bez cache — oszczędność ${usd(Math.max(0, fx.noCacheUsd - fx.paidUsd))}.`)
  const projectTile = (pr: ProjectSum) => pr.sessions === 0
    ? tile('cost-project', '~', THEME.title, 'cały projekt', 'Brak pomiarów w tym projekcie.')
    : tile('cost-project', money(pr.usd), THEME.title, 'cały projekt',
      `${pr.sessions} ${plural(pr.sessions, 'sesja', 'sesje', 'sesji')} z pomiarem${pr.since ? ` od ${day(pr.since)}` : ''}; dziś ${money(pr.todayUsd)}.`)

  // The plan-limit thresholds (LIMIT_CHECKPOINT E4, Aneks B; Aneks E, Łukasz's choice 2026-10-11):
  // a row per window — its name and where the threshold came from, a ruler of what is used now
  // with the threshold as a notch (words on the terminal), and buttons of values, the current one
  // lit. A value runs relai-cache-keeper's /cache limit-warn[-week] N, whose card asks the scope;
  // "Inna…" runs it without a number. Nothing is written before the keeper's scope card.
  const limitCard = (t: LimitRows) => costBox('cost-limit', [
    line('cost-limit-h', 'Próg limitu', THEME.title, true),
    ...(['five', 'week'] as const).map((w) => {
      const current = t[w].value
      const used = s.used[w]
      const words = usedWords(used, current)
      return (
        <Box key={`cost-limit-${w}`} flexDirection="row" flexWrap="wrap" alignItems="center" columnGap={2}>
          <Box key={`cost-limit-${w}-name`} minWidth={15} flexShrink={0} flexDirection="column">
            <Text bold color={THEME.title} wrap="truncate">{LIMIT_LABEL[w]}</Text>
            <Text color={THEME.body} wrap="truncate">{`próg: ${SOURCE_WORDS[t[w].source]}`}</Text>
          </Box>
          <Box key={`cost-limit-${w}-gauge`} flexGrow={1} flexShrink={1} minWidth={20} flexDirection="column">
            {Svg
              ? <Svg key={`cost-limit-${w}-ruler`} isInteractive height={RULER_HEIGHT} alt={`${LIMIT_LABEL[w]}: próg ${current} %, ${words}`} source={rulerSvg(used, current)} />
              : <Text key={`cost-limit-${w}-words`} color={THEME.body}>{`próg ${current} % · ${words}`}</Text>}
          </Box>
          <Box key={`cost-limit-${w}-act`} flexDirection="row" flexWrap="wrap" columnGap={1} flexShrink={0}>
            {presetsFor(w, current).map((v) => btn(`limit-set-${w}-${v}`, `${v} %`, v === current ? 'primary' : 'secondary', () => s.changeLimit(w, v)))}
            {btn(`limit-change-${w}`, 'Inna…', 'secondary', () => s.changeLimit(w))}
          </Box>
        </Box>
      )
    }),
  ])

  // One column per model request, the scale in grid lines, a card of the call under the pointer
  const callsSection = (series: TurnCost[], calls: CallCost[]) => {
    const values = calls.map((x) => x.usd)
    const top = values.reduce<number>((best, v, i) => ((v ?? -1) > (values[best] ?? -1) ? i : best), 0)
    const peak = calls[top]
    // Past MAX_COLUMNS calls, neighbours share a column: its card sums them and says how many
    const ranges = bucketRanges(calls.length, calls.length <= MAX_COLUMNS ? MAX_COLUMNS : CHART_COLUMNS)
    const perColumn = ranges.length ? Math.max(...ranges.map(([a, b]) => b - a + 1)) : 1
    const points = ranges.map(([a, b]) => {
      const group = calls.slice(a, b + 1)
      const priced = group.filter((x) => x.usd !== null)
      const sum = (k: 'input' | 'cacheRead' | 'cacheWrite' | 'output') => group.reduce((acc, x) => acc + (x[k] ?? 0), 0)
      const sumUsd = (k: 'input' | 'cacheRead' | 'cacheWrite' | 'output') => group.reduce((acc, x) => acc + (x.parts ? x.parts[k] : 0), 0)
      const value = priced.length ? priced.reduce((acc, x) => acc + (x.usd ?? 0), 0) : null
      const first = group[0]!
      const last = group[group.length - 1]!
      return {
        value,
        head: group.length === 1 ? `${clock(first.at)} · ${who(first)}`
          : `${clock(first.at) === clock(last.at) ? clock(first.at) : `${clock(first.at)}–${clock(last.at)}`} · ${nCalls(group.length)}`,
        figure: money(value) + (priced.length < group.length && value !== null ? ' (częściowo)' : ''),
        rows: CATS.map(([k, label, color]) => ({ color, label, value: `${tokens(sum(k))} · ${priced.length ? usd(sumUsd(k)) : '—'}` })),
      }
    })
    const columnTop = points.reduce<number>((best, pt, i) => ((pt.value ?? -1) > (points[best]?.value ?? -1) ? i : best), 0)
    const step = niceStep(Math.max(0, ...points.map((pt) => pt.value ?? 0)))
    const chart = (
      <Box key="cost-turns-chart" flexDirection="column">
        {Svg
          ? <Svg key="cost-turns-svg" isInteractive height={hoverHeight(120)} alt={`${nCalls(calls.length)} w czasie; najwyższe ${peak ? money(peak.usd) : 'brak'}`}
              source={hoverColumns(points, { color: COST_COLORS.cacheWrite, markColor: THEME.mark, track: THEME.lineOff, grid: THEME.line, background: THEME.card, card: THEME.cardOn, line: THEME.line, text: THEME.title, muted: THEME.body, mark: columnTop, height: 120, step })} />
          : <Text key="cost-turns-spark" color={THEME.mark}>{spark(values.slice(-barCols))}</Text>}
        {Svg || !calls.length ? [] : [<Text key="cost-turns-axis" color={THEME.body}>{`${clock((calls[Math.max(0, calls.length - barCols)] ?? calls[0])!.at)} → ${clock(calls[calls.length - 1]!.at)} · najwyższy słupek ${money(peak?.usd ?? null)}`}</Text>]}
      </Box>
    )
    return costBox('cost-turns', [
      chart,
      line('cost-turns-peak', peak
        ? `Najwyższe ${money(peak.usd)} o ${clock(peak.at)} (${who(peak)})${Svg ? ' · najedź na słupek po szczegóły' : ''}`
        : 'Brak wywołań.'),
      line('cost-turns-last', `${nCalls(calls.length)} w ${series.length} ${plural(series.length, 'turze', 'turach', 'turach')}${Svg && perColumn > 1 ? ` · jeden słupek to do ${perColumn} kolejnych wywołań` : ''}.`),
    ])
  }

  // Agents or models: a smaller card each, the same set as the sum — figure, share, bar, legend
  const groupCards = (key: string, groups: Group[], total: number) => {
    const { shown, rest } = topOf(groups, (g) => g.usd)
    return [...shown.map((g) => groupCard(key, g, groups.indexOf(g), total)), ...(rest.length ? [restLine(`${key}-more`, rest)] : [])]
  }
  const groupCard = (key: string, g: Group, i: number, total: number) => costBox(`${key}-${i}`, [
    <Box key={`${key}-${i}-head`} flexDirection="row" flexWrap="wrap" alignItems="center" columnGap={2}>
      {figure(`${key}-${i}-fig`, money(g.usd), 22, g.isPartial ? THEME.accentText : THEME.mark)}
      {line(`${key}-${i}-l`, g.label, THEME.title, true)}
      {line(`${key}-${i}-v`, `${pct(g.usd ?? 0, total)} sesji · ${nCalls(g.records)}${g.isPartial ? ' · częściowo' : ''}`)}
    </Box>,
    bar(`${key}-${i}-bar`, CATS.map(([k, label, color]) => ({ value: g.parts[k], color, label })), 6),
    legend(`${key}-${i}-legend`, g),
  ])

  // The session by stage (E4): each row a figure, its share and its calls; the check that the rows
  // make the session to the cent stands under them in words, with its sign
  const stagesSection = (sc: StageCosts) => {
    const total = sc.total.usd ?? 0
    const rows = [
      ...sc.rows.map((r) => ({ key: r.tag, label: r.tag.replace('/', ' · '), g: r.group })),
      ...[sc.outside, sc.untagged].filter((b) => b.group.records > 0).map((b, i) => ({ key: `outside-${i}`, label: b.words, g: b.group })),
    ]
    const sum = rows.reduce((acc, r) => acc + (r.g.usd ?? 0), 0) // every row, the drawn and the rest
    const { shown, rest } = topOf(rows, (r) => r.g.usd)
    return costBox('cost-stages', [
      ...shown.map((r) => (
        <Box key={`cs-${r.key}`} flexDirection="row" flexWrap="wrap" alignItems="center" columnGap={2}>
          {figure(`cs-fig-${r.key}`, money(r.g.usd), 20, r.g.isPartial ? THEME.accentText : THEME.mark)}
          {line(`cs-l-${r.key}`, r.label, THEME.title, true)}
          {line(`cs-v-${r.key}`, `${pct(r.g.usd ?? 0, total)} sesji · ${nCalls(r.g.records)}${r.g.isPartial ? ' · częściowo' : ''}`)}
        </Box>
      )),
      ...(rest.length ? [restLine('cost-stages-more', rest.map((r) => r.g))] : []),
      line('cost-stages-check', sc.isWhole
        ? `✓ Etapy i „poza etapem” razem ${usd(sum)} = suma sesji ${usd(total)}`
        : `✗ Etapy i „poza etapem” razem ${usd(sum)} ≠ suma sesji ${usd(total)} — błąd przypisania`, sc.isWhole ? THEME.ok : THEME.accentText),
    ])
  }

  // The price list (E6, R6, Aneks D): its date and source; the warning of an old list and the
  // reminder of each model measured without a price, side by side; one button to the card. With
  // something to say it stands under the sum, otherwise at the foot of the tab.
  const pricingSection = (data: CostData) => {
    const pr = data.prices
    const shownModels = data.unpriced.filter((u) => mutedNow[u.model] !== pr.date)
    const quiet = data.unpriced.length - shownModels.length
    const needs = shownModels.length > 0 || pr.warning !== ''
    const node = costBox('cost-pricing', [
      line('pr-date', `Cennik z ${pr.date} · ${pr.source}`, THEME.title, true),
      line('pr-how', pr.saved
        ? `Każde wywołanie liczone cennikiem obowiązującym w chwili pomiaru (${pr.saved + 1} ${plural(pr.saved + 1, 'wersja', 'wersje', 'wersji')}); nowa stawka nie zmienia kwot policzonych wcześniej.`
        : `Cennik wbudowany w panel; aktualizacja zapisze datowaną wersję w ${PRICE_FILE}.`),
      ...(pr.error ? [line('pr-err', `⚠ ${pr.error} — liczę cennikiem wbudowanym`, THEME.accentText)] : []),
      ...(pr.warning ? [line('pr-old', '⚠ ' + pr.warning, THEME.accentText)] : []),
      ...shownModels.map((u, i) => line(`pr-u-${i}`, '⚠ ' + unpricedWords(u), THEME.accentText)),
      ...(quiet ? [line('pr-quiet', `${quiet} ${plural(quiet, 'model', 'modele', 'modeli')} bez ceny wyciszone do zmiany daty cennika`)] : []),
      // The measured models of the whole project, each with its figure: where a saved price shows
      // (live, 2026-10-09: the session alone did not hold the model's records)
      ...(data.models.length ? [
        line('pr-models-h', 'Modele w pomiarach projektu', THEME.mark, true),
        ...data.models.map((m, i) => (
          <Box key={`pr-m-${i}`} flexDirection="row" alignItems="center" columnGap={1}>
            <Box key={`pr-m-n-${i}`} flexDirection="column" flexGrow={1} flexShrink={1}>
              <Text color={THEME.title} wrap="truncate">{m.model}</Text>
              <Text color={THEME.body} wrap="truncate">{`${m.records} ${plural(m.records, 'rekord', 'rekordy', 'rekordów')}${m.isPartial && m.usd !== null ? ' · częściowo' : ''}`}</Text>
            </Box>
            <Box key={`pr-m-f-${i}`} flexShrink={0}><Text bold color={m.usd === null ? THEME.accentText : THEME.mark}>{money(m.usd)}</Text></Box>
          </Box>
        )),
      ] : []),
      <Box key="pr-act" flexDirection="row" flexWrap="wrap" gap={1}>
        {btn('pr-update', shownModels.length ? 'Zaktualizuj cennik' : 'Odśwież cennik', needs ? 'primary' : 'secondary', () => s.preparePricing())}
      </Box>,
      line('pr-net', 'Jedyny odczyt sieciowy panelu: strona cennika Anthropic, dopiero po „Tak” na karcie; zapis po drugim „Tak”.'),
    ], needs)
    // The folded row says what needs the person: the models without a price, an old list
    const summary = [`z ${pr.date} · ${pr.source}`, ...(shownModels.length ? [`⚠ ${shownModels.length} ${plural(shownModels.length, 'model', 'modele', 'modeli')} bez ceny`] : []), ...(pr.warning ? ['⚠ cennik stary'] : [])].join(' · ')
    return { node, needs, summary }
  }

  // The one line of each folded section: its key number (P3)
  const stagesSummary = (sc: StageCosts) => {
    const rows = [...sc.rows.map((r) => ({ label: r.tag.replace('/', ' · '), g: r.group })), ...[sc.outside, sc.untagged].filter((b) => b.group.records > 0).map((b) => ({ label: b.words, g: b.group }))]
    const top = topOf(rows, (r) => r.g.usd, 1).shown[0]
    const total = sc.total.usd ?? 0
    const head = top ? `${top.label} — ${money(top.g.usd)} (${pct(top.g.usd ?? 0, total)} sesji)` : 'brak etapów'
    return `${head}${rows.length > 1 ? ` · ${rows.length} pozycji` : ''} · ${sc.isWhole ? 'suma zgodna' : 'suma niezgodna'}`
  }
  const callsSummary = (series: TurnCost[], calls: CallCost[]) => {
    const peak = calls.reduce<CallCost | undefined>((best, x) => ((x.usd ?? -1) > (best?.usd ?? -1) ? x : best), undefined)
    return `${nCalls(calls.length)} w ${series.length} ${plural(series.length, 'turze', 'turach', 'turach')}${peak ? ` · najwyższe ${money(peak.usd)} o ${clock(peak.at)} (${who(peak)})` : ''}`
  }
  const groupsSummary = (groups: Group[], total: number) => {
    const top = topOf(groups, (g) => g.usd, 2).shown
    return [...top.map((g) => `${g.label} ${money(g.usd)} (${pct(g.usd ?? 0, total)})`), ...(groups.length > top.length ? [`+${groups.length - top.length}`] : [])].join(' · ')
  }

  const { report: rep, series, calls, effect, project } = cd
  const gaps = gapsInWords(rep)
  const total = rep.total.usd ?? 0
  const since = rep.records ? Math.min(...cd.records.map((r) => r.at)) : null
  const pricing = pricingSection(cd)
  return [
    section('costs', 'costs', '', [
      ...(rep.records ? [totalCard(rep, series.length)] : []),
      <Box key="cost-tiles" flexDirection="row" flexWrap="wrap" gap={1}>
        {[engineTile(rep, since), ...(rep.records ? [cacheTile(effect)] : []), projectTile(project)]}
      </Box>,
      ...(s.limits ? [limitCard(s.limits)] : []),
    ]),
    // Etapy, Wywołania w czasie, Agenci, Modele, Cennik (brief v2 §7), folded
    ...(rep.records ? [
      folded('stages', stagesSummary(cd.stages), () => [stagesSection(cd.stages)], !cd.stages.isWhole),
      folded('turns', callsSummary(series, calls), () => [callsSection(series, calls)]),
      folded('agents', groupsSummary(rep.byAgent, total), () => groupCards('cost-agents', rep.byAgent, total)),
      folded('models', groupsSummary(rep.byModel, total), () => groupCards('cost-models', rep.byModel, total)),
    ] : []),
    folded('pricing', pricing.summary, () => [pricing.node], pricing.needs),
    <Box key="cost-notes" flexDirection="column">
      {cd.writeError ? [<Box key="write-error"><Text color={THEME.accentText}>{`⚠ Nie zapisano pomiarów do ${cd.writeError} — kolejna próba przy następnym zapisie; kwoty tej sesji są w pamięci panelu`}</Text></Box>] : []}
      {gaps.map((w, i) => <Box key={`gap-${i}`}><Text color={THEME.accentText}>{'⚠ ' + w}</Text></Box>)}
      <Box key="cost-foot"><Text dimColor>{`Ceny API z ${cd.prices.date} (${cd.prices.source}).`}</Text></Box>
      {s.launchVia ? [<Box key="env-launch"><Text dimColor>{s.launchVia === 'app'
        ? 'Środowisko: nowa sesja z karty przez start_session aplikacji.'
        : 'Środowisko: nowa sesja z karty przez deep link — aplikacja nie udostępnia start_session.'}</Text></Box>] : []}
    </Box>,
  ]
}
