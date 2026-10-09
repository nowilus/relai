// relai-panel: the commands, cheat sheet and phrases tabs (E2, E8, E5). The forms and the sheet are
// reckoned in ./core (commands.mjs, phrases.mjs); this file draws. Nothing reaches the chat but on a
// press of "Wyślij" or of a phrase, and register.tsx does the send (plan, section 5).
//
// Split out of register.tsx in E7 without a change of behavior; no `$` here (P-023 pkt 10).

import { clip } from './fmt'
import { FEATURED, GROUPS, NAMES, THEME } from './core/theme.mjs'
import { buildCommand, formOf, isShown, valueOf } from './core/commands.mjs'
import type { Field, Form } from './core/commands.mjs'
import { buildPhrase, searchSheet } from './core/phrases.mjs'
import type { Phrase } from './core/phrases.mjs'
import type { PlanState } from './core/plan-state.mjs'
import { copyText } from './core/decisions.mjs'
import type { CleanChoices } from './core/decisions.mjs'
import type { PaneData } from './data'
import { NONE } from './pane-parts'
import type { Ctx, Parts } from './pane-parts'

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

// What the three tabs need beyond the parts: the session's commands and sheet, the active plan, the
// pane's state, and the presses that send or change it (register.tsx holds `$` and does each)
export type CommandsCtx = {
  data: PaneData
  plan: PlanState
  picked: string
  values: Record<string, string>
  query: string
  fills: Record<string, string>
  isFresh: boolean
  clean: CleanChoices | null
  pick: (command: string) => void
  setValue: (key: string, v: string) => void
  setFresh: (isFresh: boolean) => void
  prepareStage: (topic: string, stage: string, isFresh: boolean) => void
  copy: (text: string) => void
  prepareCommand: (command: 'relai-update' | 'relai-models') => void
  sendCommand: (name: string, args: string, text: string) => void
  loadClean: () => void
  toggleClean: (id: string) => void
  prepareClean: (list: CleanChoices) => void
  openForm: (command: string) => void
  setQuery: (q: string) => void
  sendPhrase: (text: string) => void
  setFill: (phrase: string, v: string) => void
}

export function commandTabs(c: Ctx, parts: Parts, s: CommandsCtx) {
  const { el, isGui, width } = c
  const { Box, Text, Input, Select } = el
  const { heading, icon, mark, btn, flashBorder, section, frame, well, sentLine } = parts
  const { data: d, picked, values: all, query: q, fills: filled, isFresh, clean, pick } = s

  const fieldEl = (form: Form, f: Field, current: Record<string, string>) => {
    const k = fieldKey(form.command, f.key)
    if (f.kind === 'choice') {
      return (
        <Select key={`f-${f.key}`} label={f.label + ': '} value={valueOf(f, current) || NONE}
          options={f.options.map((o) => ({ value: o.value || NONE, label: o.label }))}
          onSelect={(v) => s.setValue(k, v === NONE ? '' : v)} />
      )
    }
    return (
      <Input key={`f-${f.key}`} label={f.label + ': '} value={current[f.key] ?? ''}
        placeholder={f.kind === 'path' ? 'ścieżka' : f.patternHint ?? ''}
        onInput={(v) => s.setValue(k, v)}
        onSubmit={(v) => s.setValue(k, v)} />
    )
  }

  // The open form of a card: options, the exact text, then "Wyślij" only when it can go out
  const drawer = (form: Form) => {
    const current = formValues(all, form)
    const name = d.names[form.command] ?? null
    const built = buildCommand(form, current, name ?? form.command)
    const fields = form.fields.filter((f) => isShown(f, current)).map((f) => fieldEl(form, f, current))
    const canSend = built.isOk && name !== null
    const c = form.command
    // E5: these commands start work or change the project, so the drawer prepares a card
    // instead of sending; /relai-clean keeps its report send and gains the list of groups
    const isStage = c === 'relai-stage'
    const isCarded = isStage || c === 'relai-update' || c === 'relai-models'
    const copyWhat = isStage && !current.topic && !current.stage && s.plan.kind === 'ok' && s.plan.stage ? copyText(s.plan.statusPath, s.plan.stage.id) : built.text
    const actions = isStage
      ? [btn('prepare', 'Przygotuj start', 'primary', () => s.prepareStage(current.topic ?? '', current.stage ?? '', isFresh)),
          btn('copy', 'Kopiuj prompt', 'secondary', () => s.copy(copyWhat), '✓ Skopiowano')]
      : isCarded
        ? [btn('prepare', 'Przygotuj', 'primary', () => s.prepareCommand(c as 'relai-update' | 'relai-models'))]
        : [btn('send', 'Wyślij do czatu', 'primary', () => s.sendCommand(name ?? c, built.args, built.text), '✓ Wysłano')]
    return (
      <Box key="form" flexDirection="column" gap={isGui ? 1 : 0} paddingX={isGui ? 2 : 1} paddingY={isGui ? 1 : 0}
        borderStyle="round" borderColor={flashBorder(isCarded ? 'prepare' : 'send', THEME.accent)} backgroundColor={THEME.cardOn}>
        {heading(`name-${c}`, THEME.accentText)}
        {fields.length ? fields : [<Text key="no-options" color={THEME.body}>{isCarded ? 'Ta komenda nie ma opcji — przygotuj kartę i potwierdź.' : 'Ta komenda nie ma opcji — wystarczy ją wysłać.'}</Text>]}
        {isStage ? [<Select key="f-chat" label="Czat: " value={isFresh ? 'fresh' : 'current'}
          options={[{ value: 'fresh', label: 'świeży — /clear po „Tak”, potem etap' }, { value: 'current', label: 'bieżący — etap w tej rozmowie' }]}
          onSelect={(v) => s.setFresh(v === 'fresh')} />] : []}
        <Box key="preview" flexDirection="column">{well('preview-well', isCarded ? `${built.text} — po „Tak” na karcie` : built.text, true)}</Box>
        {built.errors.length ? [<Box key="errors"><Text color={THEME.accentText}>{'⚠ ' + built.errors.join(' · ')}</Text></Box>] : []}
        {canSend
          ? <Box key="actions" flexDirection="row" flexWrap="wrap" gap={1}>
              {actions}
              {btn('close', 'Zamknij', 'secondary', () => pick(c))}
            </Box>
          : <Box key="no-send"><Text color={THEME.body}>{name === null ? 'Komenda niedostępna w tej sesji — nic nie zostanie wysłane.' : 'Popraw opcje, żeby wysłać.'}</Text></Box>}
        {c === 'relai-clean' && name !== null ? [cleanBlock()] : []}
        {sentLine ? [sentLine] : []}
      </Box>
    )
  }

  // /relai-clean's groups: loaded through the one fixed process, none picked at the start, the
  // protected ones apart with their reason; "Przygotuj sprzątanie" makes the card
  const cleanBlock = () => {
    if (clean === null) {
      return (
        <Box key="clean" flexDirection="column" gap={isGui ? 1 : 0}>
          <Text color={THEME.body}>Lista grup do wyboru: raport narzędzia sprzątania, bez kasowania.</Text>
          <Box key="clean-load" flexDirection="row">{btn('clean-load', 'Wczytaj listę', 'secondary', () => s.loadClean())}</Box>
        </Box>
      )
    }
    const nPicked = clean.groups.filter((g) => g.isPicked).length
    return (
      <Box key="clean" flexDirection="column" gap={isGui ? 1 : 0}>
        <Text bold color={THEME.title}>{clean.groups.length ? `Grupy do wyboru · zaznaczone ${nPicked} z ${clean.groups.length}` : 'Raport pusty — nie ma czego sprzątać.'}</Text>
        {clean.groups.map((g) => (
          <Box key={`clean-${g.id}`} flexDirection="row" alignItems="center" columnGap={1} paddingX={1}
            {...frame(g.isPicked)} borderColor={flashBorder(`clean-pick-${g.id}`, g.isPicked ? THEME.accent : THEME.line)} backgroundColor={g.isPicked ? THEME.cardOn : THEME.card}>
            <Text bold color={g.isPicked ? THEME.accentText : THEME.body}>{g.isPicked ? '☒' : '☐'}</Text>
            <Box key={`clean-t-${g.id}`} flexDirection="column" flexGrow={1} flexShrink={1}>
              <Text color={THEME.title} wrap="truncate">{g.name}</Text>
              <Text color={THEME.body} wrap="truncate">{`${g.count} poz. · ${(g.bytes / 1048576).toFixed(2).replace('.', ',')} MB`}</Text>
            </Box>
            {btn(`clean-pick-${g.id}`, g.isPicked ? 'Odznacz' : 'Zaznacz', g.isPicked ? 'primary' : 'secondary', () => s.toggleClean(g.id))}
          </Box>
        ))}
        {clean.kept.length ? [<Text key="clean-kept-h" bold color={THEME.mark}>Chronione — poza wyborem</Text>,
          ...clean.kept.map((k, i) => <Text key={`clean-kept-${i}`} color={THEME.body} wrap="truncate">{`🔒 ${k.path} · ${k.reason}`}</Text>)] : []}
        <Box key="clean-act" flexDirection="row" flexWrap="wrap" gap={1}>
          {nPicked ? btn('clean-prepare', 'Przygotuj sprzątanie', 'primary', () => s.prepareClean(clean)) : []}
          {btn('clean-reload', 'Wczytaj ponownie', 'secondary', () => s.loadClean())}
        </Box>
      </Box>
    )
  }

  const card = (c: string, isFeatured: boolean) => {
    const name = d.names[c] ?? null
    const isOn = c === picked
    const [title, purpose] = NAMES[c] ?? [c, '']
    const hint = isFeatured && c === 'relai-stage' ? stageHint(s.plan) : ''
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
          () => s.openForm(r.command))}
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
          onInput={(v) => s.setQuery(v)} onSubmit={(v) => s.setQuery(v)} />,
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
            ? btn(`phrase-${i}`, p.phrase, 'primary', () => s.sendPhrase(p.phrase), '✓ ' + p.phrase)
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
          onInput={(v) => s.setFill(p.phrase, v)}
          onSubmit={(v) => s.setFill(p.phrase, v)} />
        <Box key={`ph-prev-${i}`} flexDirection="column">{well(`ph-well-${i}`, built.isOk ? built.text : (built.error ?? ''), built.isOk)}</Box>
        {canSend ? [<Box key={`ph-act-${i}`} flexDirection="row">{btn(`phrase-${i}`, 'Wyślij do czatu', 'primary', () => s.sendPhrase(built.text), '✓ Wysłano')}</Box>] : []}
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

  return { commandsView, sheetView, phrasesView }
}
