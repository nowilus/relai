// relai-panel: "Pomoc" — the cheat sheet and the session phrases in one tab (brief v2 §6.1,
// AUDYT_MODOW Z2, UX-10). One search over docs/KOMENDY.md narrows both: the phrases first, each
// sent by a click as the person's own words (a template completed first), then the commands with
// their aliases and what they do, each opening its form in the commands tab. Reckoned in
// ./core/phrases.mjs; register.tsx does the send. No `$` here (P-023 pkt 10).

import { clip } from './fmt'
import { THEME } from './core/theme.mjs'
import { buildPhrase, searchSheet } from './core/phrases.mjs'
import type { Phrase } from './core/phrases.mjs'
import type { PaneData } from './data'
import type { Ctx, Parts } from './pane-parts'

export type HelpCtx = {
  data: PaneData
  query: string
  fills: Record<string, string>
  setQuery: (q: string) => void
  sendPhrase: (text: string) => void
  setFill: (phrase: string, v: string) => void
  openForm: (command: string) => void
}

export function helpView(c: Ctx, parts: Parts, s: HelpCtx) {
  const { el, isGui, width } = c
  const { Box, Text, Input } = el
  const { icon, mark, btn, flashBorder, section, frame, well } = parts
  const { data: d, query: q, fills: filled } = s

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
  // A command of the sheet: its aliases, what it does, "Formularz" to its form
  const commandRow = (r: { command: string, forms: string[], what: string }) => (
    <Box key={`sheet-${r.command}`} flexDirection="row" alignItems="center" gap={isGui ? 2 : 1}
      paddingX={1} paddingY={isGui ? 1 : 0} {...frame(false)} borderColor={THEME.line} backgroundColor={THEME.card} hover={{ borderColor: THEME.accent }}>
      {icon(r.command, 32)}
      <Box key={`sheet-text-${r.command}`} flexDirection="column" flexGrow={1} flexShrink={1}>
        <Text bold color={THEME.title}>{r.forms.join(' · ')}</Text>
        <Text color={THEME.body}>{clip(r.what, width * 2)}</Text>
      </Box>
      {btn(`open-${r.command}`, 'Formularz', 'secondary', () => s.openForm(r.command))}
    </Box>
  )

  if (d.sheet.reason) return [<Box key="sheet-reason"><Text color={THEME.body}>{d.sheet.reason}</Text></Box>]
  const hit = searchSheet(d.sheet, q)
  // A phrase keeps its place in the sheet as its key, whatever the search leaves
  const indexed = hit.phrases.map((p) => [p, d.sheet.phrases.indexOf(p)] as const)
  const ready = indexed.filter(([p]) => !p.isTemplate).map(([p, i]) => readyCard(p, i))
  const toFill = indexed.filter(([p]) => p.isTemplate).map(([p, i]) => fillCard(p, i))
  const none = hit.commands.length + hit.phrases.length === 0 ? [<Box key="sheet-none"><Text color={THEME.body}>Nic nie pasuje.</Text></Box>] : []
  return [
    <Box key="help-search" flexDirection="column">
      <Input key="search" label="Szukaj: " value={q} placeholder="np. backup albo status"
        onInput={(v) => s.setQuery(v)} onSubmit={(v) => s.setQuery(v)} />
    </Box>,
    ...(ready.length ? [section('phrases-ready', 'phrases-ready', 'Kliknij frazę — pójdzie do czatu tak, jakbyś ją napisał.', ready)] : []),
    ...(toFill.length ? [section('phrases-fill', 'phrases-fill', 'Wpisz brakującą część, sprawdź podgląd i wyślij.', toFill)] : []),
    ...(hit.commands.length ? [section('sheet', 'sheet', 'Komendy z docs/KOMENDY.md — „Formularz” otwiera ją w zakładce Komendy.', hit.commands.map(commandRow))] : []),
    ...none,
  ]
}
