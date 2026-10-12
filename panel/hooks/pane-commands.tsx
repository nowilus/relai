// relai-panel: the commands tab (E2, E8, E5; brief v2 §6, AUDYT_MODOW Z2). The forms are reckoned
// in ./core/commands.mjs; this file draws. Nothing reaches the chat but on a press of "Wyślij", and
// register.tsx does the send (plan, section 5). "Pomoc" (the sheet and the phrases): pane-help.tsx.
//
// Split out of register.tsx in E7 without a change of behavior; no `$` here (P-023 pkt 10).

import { FEATURED, GROUPS, NAMES, THEME } from './core/theme.mjs'
import { buildCommand, formOf, isShown, valueOf } from './core/commands.mjs'
import type { Field, Form } from './core/commands.mjs'
import type { PlanState } from './core/plan-state.mjs'
import { copyText } from './core/decisions.mjs'
import type { CleanChoices } from './core/decisions.mjs'
import type { ChatMode } from './launch'
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

// What the tab needs beyond the parts: the session's commands, the active plan, the pane's state,
// and the presses that send or change it (register.tsx holds `$` and does each)
export type CommandsCtx = {
  data: PaneData
  plan: PlanState
  picked: string
  values: Record<string, string>
  chat: ChatMode
  canNew: boolean // a new session only where the desktop app draws the pane (NOWA_SESJA)
  clean: CleanChoices | null
  pick: (command: string) => void
  setValue: (key: string, v: string) => void
  setChat: (chat: ChatMode) => void
  prepareStage: (topic: string, stage: string, chat: ChatMode) => void
  copy: (text: string) => void
  prepareCommand: (command: 'relai-update' | 'relai-models') => void
  sendCommand: (name: string, args: string, text: string) => void
  loadClean: () => void
  toggleClean: (id: string) => void
  prepareClean: (list: CleanChoices) => void
}

export function commandTabs(c: Ctx, parts: Parts, s: CommandsCtx) {
  const { el, isGui } = c
  const { Box, Text, Input, Select } = el
  const { heading, icon, btn, flashBorder, section, frame, well, sentLine } = parts
  const { data: d, picked, values: all, chat, canNew, clean, pick } = s
  // UX accepted 2026-10-12: the new session first and the default on the desktop
  const chats: { value: ChatMode, label: string }[] = [
    ...(canNew ? [{ value: 'new' as const, label: 'nowa sesja — otwiera się obok, Enter tam startuje etap' }] : []),
    { value: 'fresh', label: 'świeży — /clear po „Tak”, potem etap' },
    { value: 'current', label: 'bieżący — etap w tej rozmowie' },
  ]

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
      ? [btn('prepare', 'Przygotuj start', 'primary', () => s.prepareStage(current.topic ?? '', current.stage ?? '', chat), undefined, true),
          btn('copy', 'Kopiuj prompt', 'secondary', () => s.copy(copyWhat), '✓ Skopiowano')]
      : isCarded
        ? [btn('prepare', 'Przygotuj', 'primary', () => s.prepareCommand(c as 'relai-update' | 'relai-models'), undefined, true)]
        : [btn('send', 'Wyślij do czatu', 'primary', () => s.sendCommand(name ?? c, built.args, built.text), '✓ Wysłano')]
    return (
      <Box key="form" flexDirection="column" gap={isGui ? 1 : 0} paddingX={isGui ? 2 : 1} paddingY={isGui ? 1 : 0}
        borderStyle="round" borderColor={flashBorder(isCarded ? 'prepare' : 'send', THEME.accent)} backgroundColor={THEME.cardOn}>
        {heading(`name-${c}`, THEME.accentText)}
        {fields.length ? fields : [<Text key="no-options" color={THEME.body}>{isCarded ? 'Ta komenda nie ma opcji — przygotuj kartę i potwierdź.' : 'Ta komenda nie ma opcji — wystarczy ją wysłać.'}</Text>]}
        {isStage ? [<Select key="f-chat" label="Czat: " value={chat} options={chats}
          onSelect={(v) => s.setChat(chats.find((o) => o.value === v)?.value ?? 'fresh')} />] : []}
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

  // P1 (brief v2 §6.3–6.5): the two recommended commands as cards with a 44 px icon; every other
  // command one row of one line — a 24 px icon, the Polish name in bold with the command beside it
  // and its purpose — and "Otwórz" on the right. A command the session lacks: dimmed, "—" (pressed,
  // its form still shows what it would send and why it cannot). The form opens under its row and
  // the row's button turns "Zamknij".
  const card = (c: string, isFeatured: boolean) => {
    const name = d.names[c] ?? null
    const isOn = c === picked
    const isOff = name === null
    const [title, purpose] = NAMES[c] ?? [c, '']
    const hint = isFeatured && c === 'relai-stage' ? stageHint(s.plan) : ''
    const border = isOn ? THEME.accent : isOff ? THEME.lineOff : isFeatured ? THEME.mark : THEME.line
    const form = isOn ? formOf(c) : undefined
    const what = isOff ? 'niedostępna w tej sesji' : purpose
    const command = <Text key={`cn-${c}`} color={THEME.body}>{' /' + c}</Text>
    const text = isFeatured
      ? <Box key={`text-${c}`} flexDirection="column" flexGrow={1} flexShrink={1}>
          <Text wrap="truncate" dimColor={isOff}>{[<Text key={`nm-${c}`} bold color={THEME.mark}>{title}</Text>, command]}</Text>
          <Text color={THEME.body} wrap="truncate">{what}</Text>
          {hint ? [<Text key={`hint-${c}`} color={THEME.accentText} wrap="truncate">{hint}</Text>] : []}
        </Box>
      : <Box key={`text-${c}`} flexGrow={1} flexShrink={1}>
          <Text wrap="truncate" dimColor={isOff}>{[<Text key={`nm-${c}`} bold color={THEME.title}>{title}</Text>, command, <Text key={`pu-${c}`} color={THEME.body}>{' · ' + what}</Text>]}</Text>
        </Box>
    return (
      <Box key={`card-${c}`} flexDirection="column">
        <Box key={`row-${c}`} flexDirection="row" alignItems="center" columnGap={isGui ? 2 : 1}
          paddingX={isFeatured && isGui ? 2 : 1} {...frame(isOn)} borderColor={flashBorder(`cmd-${c}`, border)}
          backgroundColor={isOn ? THEME.cardOn : isFeatured ? THEME.cardFeatured : THEME.card} hover={{ borderColor: THEME.accent }}>
          {icon(c, isFeatured ? 44 : 24)}
          {text}
          {btn(`cmd-${c}`, isOn ? 'Zamknij' : isOff ? '—' : 'Otwórz', 'secondary', () => pick(c))}
        </Box>
        {form ? [drawer(form)] : []}
      </Box>
    )
  }

  // Two recommended (brief v2 §6.3); the third of FEATURED, the tour, goes down to the first group
  const featured = FEATURED.slice(0, 2)
  const groups = GROUPS.map((g, i) => (i === 0 ? { ...g, commands: [...g.commands, ...FEATURED.slice(2)] } : g))
  const commandsView = () => [
    section('featured', 'featured', '', featured.map((c) => card(c, true))),
    ...groups.map((g) => (
      <Box key={`group-${g.id}`} flexDirection="column">
        {heading(`group-${g.id}`)}
        {g.commands.map((c) => card(c, false))}
      </Box>
    )),
  ]

  return { commandsView }
}
