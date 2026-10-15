// relai-panel: "Pomoc" — the cheat sheet and the session phrases in one tab (brief v2 §6.1,
// AUDYT_MODOW Z2, UX-10). One search over docs/KOMENDY.md narrows both: the phrases first, each
// sent by a click as the person's own words (a template completed first), then the commands with
// their aliases and what they do, each opening its form in the commands tab. Reckoned in
// ./core/phrases.mjs; register.tsx does the send. No `$` here (P-023 pkt 10).

import { THEME } from './core/theme.mjs'
import { buildPhrase, searchSheet } from './core/phrases.mjs'
import type { Phrase } from './core/phrases.mjs'
import type { PaneData } from './data'
import type { Ctx, Parts } from './pane-parts'
import { plural } from './core/measure.mjs'

const SHEET_WORDS = 160 // the most characters of a command's words in the sheet; the rest is in docs/KOMENDY.md

// The sheet's words come from Markdown: its marks ("**przed**", "`docs/plany/`") read as plain words
// (review 2026-10-15: they stood in the pane literally)
const plainText = (text: string) => text.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/`([^`]+)`/g, '$1')

// A word past the limit is cut with an ellipsis, never in its middle
const cut = (text: string, most: number) => (text.length <= most ? text : text.slice(0, text.lastIndexOf(' ', most)) + ' …')

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
  const { el, isGui } = c
  const { Box, Text, Input } = el
  const { icon, mark, btn, isStacked, textAndAct, flashBorder, section, ruled, frame, well } = parts
  const { data: d, query: q, fills: filled } = s

  // One click: the phrase is the button; its effect under it, the bubble at the top of the row
  // (WYGLAD_PANELU E3, review 2026-10-15: centred, the bubble floated between the button and the words)
  const readyCard = (p: Phrase, i: number) => {
    const canSend = buildPhrase(p, '').isOk && d.hasRelai
    return (
      <Box key={`ph-${i}`} flexDirection="row" alignItems="flex-start" gap={isGui && !isStacked ? 2 : 1} paddingX={1}
        {...frame(false)} borderColor={flashBorder(`phrase-${i}`, THEME.line)}>
        {mark('phrases', THEME.mark, 32, 'fraza')}
        <Box key={`ph-body-${i}`} flexDirection="column" gap={isGui ? 1 : 0} flexGrow={1} flexShrink={1} alignItems="flex-start">
          {canSend
            ? btn(`phrase-${i}`, p.phrase, 'secondary', () => s.sendPhrase(p.phrase), '✓ ' + p.phrase)
            : <Text key={`phrase-text-${i}`} bold color={THEME.title}>{`„${p.phrase}”`}</Text>}
          <Text color={THEME.body}>{plainText(p.effect)}</Text>
        </Box>
      </Box>
    )
  }
  // To complete: the same order as a command form — what it does, the field, the exact text, send;
  // the field and what goes out stand in the column of the words. Nothing is said in the accent of
  // an error before a word is typed (review 2026-10-15: "uzupełnij miejsce" at rest, three times)
  const fillCard = (p: Phrase, i: number) => {
    const value = filled[p.phrase] ?? ''
    const built = buildPhrase(p, value)
    const canSend = built.isOk && d.hasRelai
    return (
      <Box key={`ph-${i}`} flexDirection="row" alignItems="flex-start" gap={isGui && !isStacked ? 2 : 1} paddingX={1}
        {...frame(false)} borderColor={flashBorder(`phrase-${i}`, THEME.line)}>
        {mark('fill', THEME.accentText, 32, 'fraza do uzupełnienia')}
        <Box key={`ph-title-${i}`} flexDirection="column" gap={isGui ? 1 : 0} flexGrow={1} flexShrink={1}>
          <Box key={`ph-words-${i}`} flexDirection="column">
            <Text bold color={THEME.title}>{`„${p.phrase}”`}</Text>
            <Text color={THEME.body}>{plainText(p.effect)}</Text>
          </Box>
          <Input key={`fill-${i}`} label="Uzupełnij: " value={value} placeholder="w miejsce „…”"
            onInput={(v) => s.setFill(p.phrase, v)}
            onSubmit={(v) => s.setFill(p.phrase, v)} />
          {value ? [<Box key={`ph-prev-${i}`} flexDirection="column">{well(`ph-well-${i}`, built.isOk ? built.text : (built.error ?? ''), built.isOk)}</Box>] : []}
          {canSend ? [<Box key={`ph-act-${i}`} flexDirection="row">{btn(`phrase-${i}`, 'Wyślij do czatu', 'primary', () => s.sendPhrase(built.text), '✓ Wysłano')}</Box>] : []}
        </Box>
      </Box>
    )
  }
  // A command of the sheet: its first form bold, the other forms and what it does dimmer under it,
  // the words cut at SHEET_WORDS (review 2026-10-15: "te teksty się tak zlewają")
  const commandRow = (r: { command: string, forms: string[], what: string }) => (
    <Box key={`sheet-${r.command}`} flexDirection="row" alignItems="flex-start" gap={isGui ? 2 : 1}
      paddingX={1} {...frame(false)} borderColor={THEME.line}>
      {icon(r.command, 32)}
      {textAndAct(`sheet-main-${r.command}`,
        <Box key={`sheet-text-${r.command}`} flexDirection="column" flexGrow={1} flexShrink={1}>
          <Text bold color={THEME.title}>{r.forms[0] ?? r.command}</Text>
          {r.forms.length > 1 ? [<Text key={`sheet-forms-${r.command}`} color={THEME.body} dimColor>{'także: ' + r.forms.slice(1).join(' · ')}</Text>] : []}
          <Text color={THEME.body}>{cut(plainText(r.what), SHEET_WORDS)}</Text>
        </Box>,
        btn(`open-${r.command}`, 'Formularz', 'secondary', () => s.openForm(r.command)))}
    </Box>
  )

  if (d.sheet.reason) return [<Box key="sheet-reason"><Text color={THEME.body}>{d.sheet.reason}</Text></Box>]
  const hit = searchSheet(d.sheet, q)
  // A phrase keeps its place in the sheet as its key, whatever the search leaves
  const indexed = hit.phrases.map((p) => [p, d.sheet.phrases.indexOf(p)] as const)
  const ready = indexed.filter(([p]) => !p.isTemplate).map(([p, i]) => readyCard(p, i))
  const toFill = indexed.filter(([p]) => p.isTemplate).map(([p, i]) => fillCard(p, i))
  const none = hit.commands.length + hit.phrases.length === 0 ? [<Box key="sheet-none"><Text color={THEME.body}>Nic nie pasuje.</Text></Box>] : []
  // Sections of the tab's sheet with a rule between each two (variant 3, Aneks F)
  return ruled('help', [
    <Box key="help-search" flexDirection="column">
      <Input key="search" label="Szukaj: " value={q} placeholder="np. backup albo status"
        onInput={(v) => s.setQuery(v)} onSubmit={(v) => s.setQuery(v)} />
    </Box>,
    ...(ready.length ? [section('phrases-ready', 'phrases-ready', 'Kliknij frazę — pójdzie do czatu tak, jakbyś ją napisał.', ready)] : []),
    ...(toFill.length ? [section('phrases-fill', 'phrases-fill', 'Wpisz brakującą część, sprawdź podgląd i wyślij.', toFill)] : []),
    // The sheet folded by default (Łukasz 2026-10-15: "Zwinięta domyślnie"): the commands are the
    // commands tab's; a search unfolds it by itself
    ...(hit.commands.length ? [parts.folded('help', 'sheet', `${hit.commands.length} ${plural(hit.commands.length, 'komenda', 'komendy', 'komend')} z docs/KOMENDY.md — „Formularz” otwiera ją w zakładce Komendy`,
      () => [<Box key="sheet-rows" flexDirection="column" gap={isGui ? 1 : 0}>{hit.commands.map(commandRow)}</Box>], false, 'sheet', q !== '')] : []),
    ...none,
  ])
}
