// relai-panel: the map tab (E4, E5). The parts of every tab, nothing new: Kalam headings, rounded
// cards, the surface's own buttons, figures in Kalam. A state reads in its sign and its word (FLOW),
// a stage's segment in the colors of the progress bar above the prompt (BAR), a cost as in the costs
// tab.
//
// Split out of register.tsx in E7 without a change of behavior; no `$` here (P-023 pkt 10).

import { clip } from './fmt'
import { BAR, FLOW, THEME } from './core/theme.mjs'
import { plural } from './core/measure.mjs'
import { hoverSegments, segmentText } from './core/charts.mjs'
import { assignPicked, mergePicked, splitGroup, splitStage } from './core/flow.mjs'
import type { Branch, CrewRun, MapStage, MapTask, Merges, PlanNode } from './core/flow.mjs'
import { ROLES, RUNTIMES, setTask } from './core/decisions.mjs'
import type { CrewDraft } from './core/decisions.mjs'
import type { MapData } from './data'
import { CATS, NONE } from './pane-parts'
import type { Ctx, Parts } from './pane-parts'

// What the tab needs beyond its data: the folds, the picked crew tasks, the crew drafts, and the
// presses that change them (register.tsx holds `$` and does each)
export type MapCtx = {
  isUnfolded: (key: string, byDefault: boolean) => boolean
  fold: (key: string, byDefault: boolean) => void
  chosen: string[]
  togglePick: (id: string) => void
  clearPicks: (run: string) => Promise<unknown>
  saveMerges: (m: Merges) => Promise<void>
  drafts: Record<string, CrewDraft>
  editCrew: (run: string) => void
  setDraft: (run: string, draft: CrewDraft) => void
  dropDraft: (run: string) => void
  confirmCrew: (draft: CrewDraft) => void
  say: (text: string) => void
}

export function mapView(c: Ctx, p: Parts, md: MapData, s: MapCtx) {
  const { el, Svg, isGui, width } = c
  const { Box, Text, Input, Select } = el
  const { btn, flashBorder, section, frame, figure, bar, costBox, line, money, nCalls, legend } = p
  const { isUnfolded, fold } = s
  const chosen = s.chosen
  const crewDrafts = s.drafts

  type Cost = { usd: number | null, isPartial: boolean, records: number }
  const stageLook = (status: string) => (FLOW.stage as Record<string, { mark: string, color: string, item: string }>)[status] ?? FLOW.unknown
  // No record is "bez pomiaru"; records without a price are "brak ceny" (L-0147): two words
  // A stage worked on before E4 was measured, only without a tag: "sprzed znacznika", its cost in
  // the "Poza etapem" section (calibration 2026-10-09); a stage nothing measured: "bez pomiaru"
  const costFig = (key: string, c: Cost | undefined, size: number, empty = 'bez pomiaru') => (c === undefined || c.records === 0
    ? <Text key={key} color={THEME.body}>{empty}</Text>
    : figure(key, money(c.usd), size, c.isPartial ? THEME.accentText : THEME.mark))
  // Only a stage closed on or after the first day of untagged measurements, or in progress: a stage
  // closed before the collector existed was never measured (live, 2026-10-09: PROWADZENIE_END_TO_END)
  const isPreTag = (md: MapData, s: MapStage) => md.untaggedSince !== null
    && (s.status === 'W TOKU' || (['ZREALIZOWANY', 'POMINIĘTY'].includes(s.status) && s.date !== null && s.date >= md.untaggedSince))
  const sumCost = (list: Cost[]): Cost | undefined => (list.length === 0 ? undefined : {
    usd: list.some((c) => c.usd !== null) ? list.reduce((s, c) => s + (c.usd ?? 0), 0) : null,
    isPartial: list.some((c) => c.isPartial), records: list.reduce((s, c) => s + c.records, 0),
  })
  const nTasks = (n: number) => `${n} ${plural(n, 'zadanie', 'zadania', 'zadań')}`

  // The stages of a plan as one bar of segments; hovering one shows its id, status and name
  const strip = (key: string, node: PlanNode, bg: string) => {
    const looks = node.stages.map((s) => stageLook(s.status))
    const colors = looks.map((l) => BAR.segment[l.item as keyof typeof BAR.segment])
    if (!colors.length) return null
    const now = node.stages.find((s) => s.status === 'W TOKU') ?? node.stages.find((s) => s.status === 'GOTOWY DO STARTU')
    const n = node.stages.length
    const idle = [now ? `Teraz: ${now.id} · ${now.name}` : `${n} ${plural(n, 'etap', 'etapy', 'etapów')}`, 'najedź na segment, żeby zobaczyć etap']
    const art = Svg ? hoverSegments(node.stages.map((s, i) => ({ color: colors[i] ?? BAR.segment.unknown, head: `${looks[i]?.mark ?? '?'} ${s.id} · ${s.status}`, detail: s.name })),
      { background: bg, text: THEME.title, muted: THEME.body, idle, chars: Math.floor(((width - 8) * 8) / 6.8) }) : null
    if (Svg && art) return <Svg key={key} isInteractive source={art.svg} alt={node.stages.map((s, i) => `${looks[i]?.mark ?? '?'} ${s.id} ${s.status}`).join(', ')} height={art.height} />
    const t = segmentText(colors, Math.max(6, width - 8))
    return (
      <Box key={key} flexDirection="row" flexWrap="wrap" columnGap={t.gap}>
        {t.runs.map((r, i) => <Box key={`${key}-${i}`}><Text color={r.color}>{r.text}</Text></Box>)}
      </Box>
    )
  }

  const branchLine = (key: string, b: Branch) => {
    const look = b.status ? FLOW.branch[b.status as keyof typeof FLOW.branch] : FLOW.unknown
    const words = b.statusWords ? clip(b.statusWords, 48) + (b.status ? '' : ' (status spoza listy)') : 'bez statusu'
    return (
      <Box key={key} flexDirection="column">
        <Text bold color={look.color} wrap="truncate">{`${look.mark} ${b.name} · ${words}`}</Text>
        {b.about ? [<Text key={`${key}-a`} color={THEME.body}>{clip(b.about, width * 2)}</Text>] : []}
      </Box>
    )
  }

  // A stage: its sign, id and name, what hangs on it, its cost; unfolded, where the cost went
  const stageRow = (md: MapData, node: PlanNode, s: MapStage) => {
    const tag = `${node.name}/${s.id}`
    const key = 'stage:' + tag
    const look = stageLook(s.status)
    const isNow = s.status === 'W TOKU'
    const isOpen = isUnfolded(key, false)
    const g = md.cost.rows.find((r) => r.tag === tag)?.group
    const branches = node.branches.filter((b) => b.source === s.id)
    const tasks = md.runs.flatMap((r) => r.waves.flatMap((w) => w.tasks.filter((t) => t.stage === tag).map((t) => ({ run: r.run, t }))))
    const facts = [s.status.toLowerCase(), branches.length ? `${branches.length} ${plural(branches.length, 'odnoga', 'odnogi', 'odnóg')}` : '', tasks.length ? `${nTasks(tasks.length)} załogi` : ''].filter(Boolean).join(' · ')
    const more = isOpen ? costBox(`st-more-${tag}`, [
      ...(g ? [
        line(`st-c-${tag}`, `Koszt etapu · ${nCalls(g.records)}${g.isPartial ? ' · częściowo — część wywołań bez ceny' : ''}`, THEME.title, true),
        bar(`st-bar-${tag}`, CATS.map(([k, label, color]) => ({ value: g.parts[k], color, label })), 6),
        legend(`st-leg-${tag}`, g),
      ] : [line(`st-c-${tag}`, isPreTag(md, s)
        ? `Sprzed znacznika: etap z okresu, gdy kolektor mierzył bez etapu w rekordzie (od ${md.untaggedSince ?? ''}) — jego wywołania, jeśli były mierzone, są w sekcji „Poza etapem”, bez rozbicia na etapy.`
        : 'Bez pomiaru: kolektor nie zapisał żadnego wywołania z tym etapem.')]),
      ...(branches.length ? [line(`st-b-${tag}`, 'Odnogi z tego etapu', THEME.mark, true), ...branches.map((b) => branchLine(`st-b-${tag}-${b.name}`, b))] : []),
      ...(tasks.length ? [line(`st-t-${tag}`, 'Zadania załogi przypisane do etapu', THEME.mark, true),
        ...tasks.map(({ run, t }) => line(`st-t-${tag}-${run}-${t.id}`, `${FLOW.task[t.status].mark} ${t.name} · przebieg ${run}`, FLOW.task[t.status].color))] : []),
    ]) : null
    return (
      <Box key={`st-${tag}`} flexDirection="column">
        <Box key={`st-row-${tag}`} flexDirection="row" alignItems="center" gap={isGui ? 2 : 1} paddingX={1}
          {...frame(isNow || isOpen)} borderColor={flashBorder(`fold-${key}`, isNow ? THEME.accent : THEME.line)}
          backgroundColor={isNow ? THEME.cardOn : THEME.card} hover={{ borderColor: THEME.accent }}>
          <Text bold color={look.color}>{look.mark}</Text>
          <Box key={`st-text-${tag}`} flexDirection="column" flexGrow={1} flexShrink={1}>
            <Text bold color={THEME.title} wrap="truncate">{`${s.id} · ${s.name}`}</Text>
            <Text color={look.color} wrap="truncate">{facts}</Text>
          </Box>
          {/* The cost never shrinks: the name truncates first (terminal, 2026-10-09: "$4.5" over "4") */}
          <Box key={`st-fig-${tag}`} flexShrink={0}>{costFig(`st-cost-${tag}`, g, 20, isPreTag(md, s) ? 'sprzed znacznika' : 'bez pomiaru')}</Box>
          {btn(`fold-${key}`, isOpen ? 'Zwiń' : 'Szczegóły', 'secondary', () => fold(key, false))}
        </Box>
        {more ? [more] : []}
      </Box>
    )
  }

  // A plan: name, status, how many stages are closed, its cost; the bar of its stages; unfolded,
  // a row per stage and the branches that came from no stage of it
  const planCard = (md: MapData, node: PlanNode) => {
    const isMain = node.place === 'active'
    const key = 'plan:' + node.name
    const isOpen = isUnfolded(key, isMain)
    const closed = node.stages.filter((s) => s.status === 'ZREALIZOWANY' || s.status === 'POMINIĘTY').length
    const c = sumCost(md.cost.rows.filter((r) => splitStage(r.tag)?.plan === node.name).map((r) => r.group))
    const bg = isMain ? THEME.cardFeatured : THEME.card
    const loose = node.branches.filter((b) => !node.stages.some((s) => s.id === b.source))
    const status = [node.planStatus ?? 'status nieznany', node.closedOn ?? ''].filter(Boolean).join(' ')
    return (
      <Box key={`plan-${node.name}`} flexDirection="column" gap={isGui ? 1 : 0} paddingX={isGui ? 2 : 1} paddingY={isGui ? 1 : 0}
        {...frame(isMain)} borderColor={flashBorder(`fold-${key}`, isMain ? THEME.mark : THEME.line)} backgroundColor={bg}>
        <Box key={`plan-head-${node.name}`} flexDirection="row" flexWrap="wrap" alignItems="center" columnGap={2}>
          <Box key={`plan-name-${node.name}`} flexDirection="column" flexGrow={1} flexShrink={1}>
            <Text bold color={isMain ? THEME.mark : THEME.title} wrap="truncate">{node.name}</Text>
            <Text color={THEME.body} wrap="truncate">{`${status} · zamknięte ${closed} z ${node.stages.length} etapów`}</Text>
          </Box>
          {c ? costFig(`plan-cost-${node.name}`, c, isMain ? 26 : 20) : []}
          {btn(`fold-${key}`, isOpen ? 'Zwiń' : 'Rozwiń', isMain ? 'primary' : 'secondary', () => fold(key, isMain))}
        </Box>
        {strip(`strip-${node.name}`, node, bg)}
        {isOpen ? [
          ...node.stages.map((s) => stageRow(md, node, s)),
          ...(loose.length ? [<Box key={`loose-${node.name}`} flexDirection="column">
            {line(`loose-h-${node.name}`, 'Odnogi spoza etapów tego planu', THEME.mark, true)}
            {loose.map((b) => branchLine(`loose-${node.name}-${b.name}`, b))}
          </Box>] : []),
        ] : []}
      </Box>
    )
  }

  // A crew task: its sign, name, id and state, what it waits for, its stage and cost; a merged
  // task lists the tasks it holds, each still readable
  const taskChip = (md: MapData, run: CrewRun, t: MapTask) => {
    const id = `${run.run}/${t.id}`
    const look = FLOW.task[t.status]
    const isPicked = chosen.includes(id)
    const cost = md.tasks.find((x) => x.run === run.run && x.id === t.id)?.group
    const stage = splitStage(t.stage)
    const facts = [`${t.id} · ${look.word}`, t.deps.length ? `po: ${t.deps.join(', ')}` : '', stage ? `etap ${stage.stage}` : ''].filter(Boolean).join(' · ')
    return (
      <Box key={`task-${id}`} flexDirection="column" width="48%" flexGrow={1} minWidth={26} paddingX={1}
        {...frame(isGui || isPicked)} borderColor={flashBorder(`pick-${id}`, isPicked ? THEME.accent : THEME.line)} backgroundColor={isPicked ? THEME.cardOn : THEME.card}>
        <Box key={`task-head-${id}`} flexDirection="row" alignItems="center" columnGap={1}>
          <Text bold color={look.color}>{look.mark}</Text>
          <Box key={`task-text-${id}`} flexDirection="column" flexGrow={1} flexShrink={1}>
            <Text bold color={THEME.title} wrap="truncate">{t.name}</Text>
            <Text color={THEME.body} wrap="truncate">{facts}</Text>
          </Box>
          {cost ? costFig(`task-cost-${id}`, cost, 18) : []}
        </Box>
        {t.members.length > 1 ? t.members.map((x) => <Text key={`task-m-${id}-${x.id}`} color={FLOW.task[x.status].color} wrap="truncate">{`  ↳ ${x.id} · ${x.name} ${FLOW.task[x.status].mark}`}</Text>) : []}
        <Box key={`task-act-${id}`} flexDirection="row" flexWrap="wrap" gap={1}>
          {btn(`pick-${id}`, isPicked ? 'Odznacz' : 'Zaznacz', isPicked ? 'primary' : 'secondary', () => s.togglePick(id))}
          {t.isGroup ? btn(`split-${id}`, t.members.length > 1 ? 'Rozdziel' : 'Usuń przypisanie', 'secondary', () => { void s.saveMerges(splitGroup(md.merges, t.id)) }) : []}
        </Box>
      </Box>
    )
  }

  // What the person can do with the tasks picked in a run: merge them, give them a stage
  const runActions = (md: MapData, run: CrewRun) => {
    const mine = chosen.filter((p) => p.startsWith(run.run + '/')).map((p) => p.slice(run.run.length + 1))
    if (!mine.length) return null
    const active = md.nodes.find((n) => n.place === 'active')
    const clear = () => s.clearPicks(run.run)
    const apply = (m: Merges) => { void s.saveMerges(m).then(clear) }
    return (
      <Box key={`run-act-${run.run}`} flexDirection="column" gap={isGui ? 1 : 0} paddingX={1} borderStyle="round" borderColor={THEME.accent} backgroundColor={THEME.cardOn}>
        <Text bold color={THEME.title} wrap="truncate">{`Zaznaczone: ${mine.join(', ')}`}</Text>
        <Box key={`run-btn-${run.run}`} flexDirection="row" flexWrap="wrap" gap={1}>
          {mine.length >= 2 ? btn(`merge-${run.run}`, 'Scal zaznaczone', 'primary', () => apply(mergePicked(md.merges, run.run, mine)), '✓ Scalono') : []}
          {btn(`unpick-${run.run}`, 'Wyczyść', 'secondary', () => { void clear() })}
        </Box>
        {active ? [<Select key={`assign-${run.run}`} label="Przypisz do etapu: " value={NONE}
          options={[{ value: NONE, label: '— wybierz —' }, { value: '-', label: 'bez etapu' }, ...active.stages.map((s) => ({ value: `${active.name}/${s.id}`, label: `${s.id} · ${clip(s.name, 40)}` }))]}
          onSelect={(v) => { if (v !== NONE) apply(assignPicked(md.merges, run.run, mine, v === '-' ? null : v)) }} />] : []}
        <Text color={THEME.body}>Scalenie i przypisanie zapisują się w pliku panelu; pliki przebiegu zostają nietknięte.</Text>
      </Box>
    )
  }

  const runCard = (md: MapData, run: CrewRun) => {
    const count = run.waves.reduce((s, w) => s + w.tasks.reduce((n, t) => n + Math.max(1, t.members.length), 0), 0)
    return costBox(`run-${run.run}`, [
      <Box key={`run-head-${run.run}`} flexDirection="row" flexWrap="wrap" alignItems="center" columnGap={2}>
        <Text bold color={THEME.title}>{`Przebieg ${run.run}`}</Text>
        <Text color={run.error ? THEME.accentText : THEME.body}>{run.error || `${nTasks(count)} · ${run.waves.length} ${plural(run.waves.length, 'fala', 'fale', 'fal')}`}</Text>
      </Box>,
      ...run.waves.map((w) => (
        <Box key={`wave-${run.run}-${w.n}`} flexDirection="column">
          <Text bold color={THEME.mark}>{`Fala ${w.n} · ${w.isParallel ? 'równolegle' : 'pojedynczo'}`}</Text>
          <Box key={`wave-tasks-${run.run}-${w.n}`} flexDirection="row" flexWrap="wrap" gap={1}>{w.tasks.map((t) => taskChip(md, run, t))}</Box>
        </Box>
      )),
      ...(run.conflicts.length ? [line(`run-conf-${run.run}`, `Wspólne pliki: ${run.conflicts.map((c) => `${c.second} czeka na ${c.first}`).join('; ')}`)] : []),
      ...[runActions(md, run)].filter((x) => x !== null),
      crewEditor(run.run),
    ])
  }

  // The crew before "zaczynamy" (E5, 1c): role, tool and model of each task, from closed lists;
  // the waves follow the draft. Only a run without manifest.json opens; "Zatwierdź" makes the card
  const crewEditor = (run: string) => {
    const draft = crewDrafts[run]
    if (!draft) return <Box key={`crew-edit-${run}`} flexDirection="row">{btn(`crew-open-${run}`, 'Edytuj skład', 'secondary', () => s.editCrew(run))}</Box>
    const change = (id: string, key: 'role' | 'runtime' | 'model', v: string) => {
      const r = setTask(draft, id, key, v)
      if (r.error) { s.say(`Nie zmieniono ${id}: ${r.error}`); return }
      s.setDraft(run, r.draft)
    }
    return (
      <Box key={`crew-edit-${run}`} flexDirection="column" gap={isGui ? 1 : 0} paddingX={1} borderStyle="round" borderColor={THEME.accent} backgroundColor={THEME.cardOn}>
        <Text bold color={THEME.title}>{`Skład przed startem · ${nTasks(draft.tasks.length)}`}</Text>
        {draft.tasks.map((t) => (
          <Box key={`crew-t-${run}-${t.id}`} flexDirection="column">
            <Text bold color={THEME.mark} wrap="truncate">{`${t.id} · ${t.title || 'bez tytułu'}`}</Text>
            <Select key={`crew-role-${run}-${t.id}`} label="rola: " value={t.role || NONE}
              options={[...(t.role ? [] : [{ value: NONE, label: '— wybierz —' }]), ...ROLES.map((x) => ({ value: x, label: x }))]}
              onSelect={(v) => { if (v !== NONE) change(t.id, 'role', v) }} />
            <Select key={`crew-rt-${run}-${t.id}`} label="narzędzie: " value={t.runtime || NONE}
              options={[...(t.runtime ? [] : [{ value: NONE, label: '— wybierz —' }]), ...RUNTIMES.map((x) => ({ value: x, label: x }))]}
              onSelect={(v) => { if (v !== NONE) change(t.id, 'runtime', v) }} />
            <Input key={`crew-model-${run}-${t.id}`} label="model: " value={t.model} placeholder="np. opus, puste = domyślny"
              onSubmit={(v) => change(t.id, 'model', v.trim())} />
          </Box>
        ))}
        <Box key={`crew-act-${run}`} flexDirection="row" flexWrap="wrap" gap={1}>
          {btn(`crew-ok-${run}`, 'Zatwierdź skład', 'primary', () => s.confirmCrew(draft))}
          {btn(`crew-drop-${run}`, 'Porzuć zmiany', 'secondary', () => s.dropDraft(run))}
        </Box>
        <Text color={THEME.body}>Plik zadania.json zapisze się dopiero po „Tak” na karcie.</Text>
      </Box>
    )
  }

  const draw = (md: MapData) => {
    const active = md.nodes.filter((n) => n.place === 'active')
    const others = md.nodes.filter((n) => n.place === 'open')
    const archive = md.nodes.filter((n) => n.place === 'archive')
    const outside = [md.cost.outside, md.cost.untagged].filter((b) => b.group.records > 0)
    return [
      section('map', 'map', `Plany, etapy i odnogi z plików STATUS.md; koszt etapu ze wszystkich zmierzonych sesji projektu (${nCalls(md.cost.total.records)}).`,
        active.length ? active.map((n) => planCard(md, n)) : [costBox('map-none', [line('map-none-t', 'Brak aktywnego planu — linia „Aktywny plan” w CLAUDE.md mówi „brak” albo jej nie ma.')])]),
      ...(others.length ? [section('map-open', 'map-open', '', others.map((n) => planCard(md, n)))] : []),
      section('map-crew', 'map-crew', md.runs.length ? 'Fale i zależności z zadania.json, stan z manifest.json. Zaznacz zadania, żeby je scalić albo przypisać do etapu.' : '',
        md.runs.length ? md.runs.map((r) => runCard(md, r)) : [costBox('crew-none', [line('crew-none-t', 'Brak przebiegów /relai-crew w tym projekcie — pojawią się tu z .claude/relai/work/CREW/.')])]),
      ...(outside.length ? [section('map-outside', 'map-outside', 'Każde wywołanie policzone; żadne nie trafia po cichu do najbliższego etapu.', outside.map((b, i) => costBox(`out-${i}`, [
        <Box key={`out-row-${i}`} flexDirection="row" flexWrap="wrap" alignItems="center" columnGap={2}>
          {costFig(`out-fig-${i}`, b.group, 22)}
          <Box key={`out-text-${i}`} flexDirection="column" flexShrink={1}>
            {line(`out-t-${i}`, b.words, THEME.title, true)}
            {line(`out-n-${i}`, `${nCalls(b.group.records)} · wszystkie sesje projektu`)}
          </Box>
        </Box>,
      ])))] : []),
      ...(archive.length ? [section('map-archive', 'map-archive', `${archive.length} ${plural(archive.length, 'plan zamknięty', 'plany zamknięte', 'planów zamkniętych')}, ostatnio zamknięty na górze.`, archive.map((n) => planCard(md, n)))] : []),
      <Box key="map-foot"><Text dimColor>{`Ceny API z ${md.prices.date} (${md.prices.source}). Pomiary sprzed E4 nie mają znacznika etapu.`}</Text></Box>,
    ]
  }

  return draw(md)
}
