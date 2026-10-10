// relai-panel: the plan bar above the prompt (BAND, E9) in the shared grid of the RelAI bars.
//
// Split out of register.tsx in E7 without a change of behavior; no `$` here (P-023 pkt 10):
// register.tsx resolves the element table and passes the plan and, while one waits, the
// confirmation card with the answer that runs it (AUDYT_MODOW Z1, brief v2).

import type { Elements } from 'claude-code'
import type { Work } from './focus'
import type { Card } from './core/decisions.mjs'
import { BAND, BAR, CHIP } from './core/theme.mjs'
import { barCard } from './bar-card'

// Every surface's table carries Box, Text and Button, which is all a bar draws with
type AnyTable = Elements[keyof Elements]

// The card itself — label column, middle, figure, soft background — is the shared grid of the
// three bars (bar-card.tsx, the same file in relai-progress and relai-cache-keeper, Z6).

// The plan bar (brief v2 §2): one row — the plan and its stage, the stage's status, the stage's
// name truncated before the figure column — and on the right how many stages are closed. The
// session's cost is not here: it stands once, in the cache bar. No plan, or one that cannot be
// read, in words. A second row only while a confirmation card waits (brief v2 §1): the pane's own
// card (R4, D-35) — its title, "Tak", "Nie" — answered the same way as in the pane; it creates no
// consent of its own and goes when the card is answered.
export type Waiting = { card: Card, decide: (said: 'tak' | 'nie') => void }

// What it draws is the session's work (Z12, Aneks A): its focus — a stage of a plan, a packet of a
// thread card — else the active plan; when the active plan is another one, a quiet mention of it
// stands last, and a session the active plan does not count as its own (its stages run in another
// tool) says so instead of borrowing the plan.
export function band(el: AnyTable, isGui: boolean, columns: number, w: Work, waiting: Waiting | null = null) {
  const { Box, Text } = el
  const p = w.plan
  const second = waiting ? [cardRow(el, isGui, waiting)] : []
  const mention = w.mention ? [<Text key="mention" color={BAR.muted} wrap="truncate">{w.mention}</Text>] : []
  if (p.kind !== 'ok') {
    const words = w.isAsking ? 'ta sesja: praca nie wybrana — „Zmień” w panelu, Teraz'
      : w.focus?.kind === 'outside' ? 'ta sesja: poza planem'
        : p.kind === 'none' ? 'brak aktywnego planu' : `plan nieznany: ${p.reason}`
    return barCard(el, BAR, isGui, columns, 'relai-band-frame', BAND.panel, [<Box key="plan" flexDirection="row" columnGap={2}><Text bold color={BAR.text} wrap="truncate">{words}</Text>{mention}</Box>, ...second], null)
  }
  const isBranch = w.unit === 'paczek'
  const title = p.stage ? `${p.plan} · ${p.stage.id}` : p.plan
  const status = isBranch ? 'ODNOGA' : p.stage ? p.stage.status : (p.planStatus ?? 'status nieznany')
  const middle = [
    <Box key="plan" flexDirection="row" columnGap={2}>
      <Text bold color={BAR.text}>{title}</Text>
      <Text bold color={BAND.panel.color}>{status}</Text>
      {p.stage ? [<Text key="stage" color={BAR.muted} wrap="truncate">{p.stage.name}</Text>] : []}
      {mention}
    </Box>,
    ...second,
  ]
  return barCard(el, BAR, isGui, columns, 'relai-band-frame', BAND.panel, middle, [`${p.closed}/${p.stages}`, w.unit])
}

// The card's row: a chip with its title, "Tak" (primary) and "Nie", the one sentence of R4. It
// wraps rather than overflow a narrow bar; the native Button is taller than a line of text, so on
// the desktop the row keeps one cell off the row above (P-021 pkt 6).
function cardRow(el: AnyTable, isGui: boolean, w: Waiting) {
  const { Box, Text, Button } = el
  const hint = w.card.state === 'second' ? 'drugi krok — nic nie idzie dalej bez „Tak”' : 'nic nie idzie do czatu bez „Tak”'
  return (
    <Box key="band-confirm" flexDirection="row" flexWrap="wrap" alignItems="center" columnGap={2} {...(isGui ? { marginTop: 1 } : {})}>
      <Box key="band-chip" flexShrink={1} paddingX={1} backgroundColor={CHIP.warn.bg}>
        <Text color={CHIP.warn.color} wrap="truncate">{`Karta czeka: ${w.card.title}`}</Text>
      </Box>
      <Button key="band-yes" label="Tak" variant="primary" onPress={() => w.decide('tak')} />
      <Button key="band-no" label="Nie" variant="secondary" onPress={() => w.decide('nie')} />
      <Text color={BAR.muted} wrap="truncate">{hint}</Text>
    </Box>
  )
}
