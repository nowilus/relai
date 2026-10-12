// relai-panel: the answer to a confirmation card (E5, E6), moved out of register.tsx in Z6
// (AUDYT_MODOW) without a change of behavior. No `$` here (P-023 pkt 10): every effect — the card in
// $.state, the sent line, a step, the one network read — is a closure register.tsx made (actsOf).
// R4: nothing that changes state leaves the pane before "tak" on a card. The core builds the card
// and answers what may run (stepsToRun: nothing unless confirmed); the mod only draws and runs it.

import { PRICING_PAGE, pricingSecond } from './core/pricing.mjs'
import { answer, stepsToRun } from './core/decisions.mjs'
import type { Action, Card } from './core/decisions.mjs'
import { openedWords } from './launch'
import { bump } from './memo'
import { failure } from './pane-parts'
import { localDay } from './pane-io'
import type { PaneIo } from './pane-io'
import { pricingState } from './tab-data'

export type Acts = {
  io: PaneIo
  setCard: (card: Card | null) => Promise<unknown> // the card waiting in $.state, null for none
  say: (text: string) => Promise<void>
  mutePricing: () => Promise<void>
  fetchPricingPage: () => Promise<{ ok: boolean, status: number, text: string } | { error: string }>
  runStep: (a: Action, names: Record<string, string | null>) => Promise<unknown>
}

// The read after the first "Tak": the card's second step, or the reason in words and no card
async function readPricing(acts: Acts, card: Card) {
  // The card names the page; the panel reads only its own constant, whatever a card would say
  const response = card.fetch === PRICING_PAGE ? await acts.fetchPricingPage() : { error: 'karta wskazuje inną stronę' }
  const { prices, unpriced, measured } = await pricingState(acts.io)
  const now = await acts.io.now()
  const r = pricingSecond(card, response, { versions: prices.lists.slice(1), unpriced, measured, now, today: localDay(now) })
  if (r.kind === 'blocked') {
    await acts.setCard(null)
    await acts.say(failure('Spróbuj później przyciskiem w sekcji Cennik.', `Nie zaktualizowano cennika: ${r.reason}`))
    return
  }
  await acts.setCard(r.card)
}

// The answer to the card: "nie" sends nothing; "tak" moves to the second step or runs the steps
// in order and stops at the first that fails, saying which
export async function answerCard(acts: Acts, card: Card, said: 'tak' | 'nie', names: Record<string, string | null>) {
  const next = answer(card, said)
  // A card kept in $.state from before E6 has no `fetch` at all: it reads nothing, as it did then
  const isRead = typeof card.fetch === 'string'
  if (next.state === 'cancelled') {
    if (isRead) await acts.mutePricing()
    await acts.setCard(null)
    await acts.say(`Anulowano: ${card.title} — ${isRead ? 'cennik nietknięty, przypomnienie wyciszone do zmiany daty cennika' : 'nic nie wysłano'}`)
    return
  }
  // A card that reads a page: the first "Tak" shows "reading", then the step the read produced
  if (next.state === 'second' && card.state === 'open' && isRead) {
    await acts.setCard(next)
    await readPricing(acts, next)
    return
  }
  if (next.state !== 'confirmed') {
    await acts.setCard(next)
    return
  }
  await acts.setCard(null)
  let opened = '' // NOWA_SESJA: what the new session's step says, when the card had one
  for (const a of stepsToRun(next)) {
    try {
      const r = await acts.runStep(a, names)
      if (a.kind === 'newSession') opened = openedWords(`/${names[a.command] ?? a.command} ${a.args}`, r === 'app' ? 'app' : 'link')
    } catch (err) {
      await acts.say(failure(a.kind === 'newSession' ? 'Skopiuj prompt i otwórz nową sesję ręcznie albo wybierz czat „świeży”.' : 'Sprawdź stan projektu i przygotuj kartę ponownie.',
        `Nie wysłano (${card.title}, krok ${a.kind})`, err))
      return
    }
  }
  const writes = next.actions.filter((a) => a.kind === 'write')
  if (writes.length) bump() // a saved price list, a crew's tasks: the tabs read them again
  await acts.say(opened || (writes.length === next.actions.length ? `Zapisano: ${writes.map((a) => a.path).join(', ')}` : `Wysłano do czatu: ${card.title}`))
}
