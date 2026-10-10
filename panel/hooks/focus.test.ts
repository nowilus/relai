import { describe, expect, test } from 'claude-code/testing'
import { branchState, cardPackets, executorTool, focusOfPrompt, focusPath, parseFocus, serializeFocus, workOf } from './focus'
import type { Focus } from './focus'

// The session's focus (AUDYT_MODOW Z12, Aneks A): what the prompt names, what a card's packets are,
// and what the bars draw and the measurements say for each kind of work.

const CARD = [
  '# ODNOGA — mody',
  '',
  'Plan: brak · Status: **OTWARTA** ·',
  '',
  '1. **Z3 · Panel bez I/O w rysowaniu** — opis',
  '2. **Z4 · Paski bez pustych przerysowań** — opis',
  '> **Z10 · Archiwum w drzewie** — z aneksu',
  '',
  '## Weryfikacja',
  '',
  '- [x] Z3: test z licznikami',
  '- [x] Z4: w bezczynności',
  '- [ ] Z3: drzewo mieści się w budżecie',
  '- [ ] Z10: archiwum się rozwija',
  '- [ ] `git diff` nie dotyka rdzenia',
].join('\n')

const STATUS = [
  '# STATUS — plan PANEL_CODEX',
  '',
  '[PLAN.html](PLAN.html) · **ZAAKCEPTOWANY 2026-10-10** · model wykonawczy etapów: **gpt-6.1-sol w Codeksie**',
  '',
  '| Etap | Nazwa | Status | Prompt | Uwagi |',
  '|---|---|---|---|---|',
  '| E1 | Przejęcie rdzenia | GOTOWY DO STARTU | — | |',
  '| E2 | Pomiary | OCZEKUJE | — | |',
].join('\n')

const active = { kind: 'ok' as const, plan: 'PANEL_CODEX', statusPath: 'docs/plany/PANEL_CODEX/STATUS.md', planStatus: 'ZAAKCEPTOWANY', stage: { id: 'E1', name: 'Przejęcie rdzenia', status: 'W TOKU' }, stages: 7, closed: 0 }

describe('the session focus', () => {
  test('a prompt names its work by the first stage prompt or thread card in it, nothing else', () => {
    expect(focusOfPrompt('Wykonaj wątek samodzielny z pliku docs/fixy/AUDYT_MODOW/PROMPT_ODNOGA.md — zacznij od Z3')).toEqual({ kind: 'branch', card: 'AUDYT_MODOW' })
    expect(focusOfPrompt('karta docs\\fixy\\OPIS_REPO\\ODNOGA.md')).toEqual({ kind: 'branch', card: 'OPIS_REPO' })
    expect(focusOfPrompt('uruchom docs/plany/PANEL_CODEX/PROMPT_ETAP_3.md, potem docs/fixy/X/ODNOGA.md')).toEqual({ kind: 'plan', plan: 'PANEL_CODEX', stage: 'E3' })
    expect(focusOfPrompt('przeczytaj docs/plany/PANEL_CODEX/STATUS.md i docs/fixy/AUDYT_MODOW/ANEKS_A.md')).toBeNull()
    expect(focusOfPrompt('kontynuujemy pracę')).toBeNull()
  })

  test('a focus file reads back as written; a broken one is no focus', () => {
    const f: Focus = { kind: 'branch', card: 'AUDYT_MODOW', source: 'manual', at: 5 }
    expect(parseFocus(serializeFocus(f))).toEqual(f)
    expect(parseFocus('{"kind":"plan","plan":"X","stage":"etap"}')).toBeNull()
    expect(parseFocus('nie json')).toBeNull()
    expect(parseFocus(null)).toBeNull()
    expect(focusPath('a/b:c')).toBe('.claude/relai/fokus/a_b_c.json')
  })

  test('a card\'s packets come from its boxes in their order; one open box keeps a packet open', () => {
    expect(cardPackets(CARD)).toEqual([
      { id: 'Z3', name: 'Panel bez I/O w rysowaniu', isDone: false },
      { id: 'Z4', name: 'Paski bez pustych przerysowań', isDone: true },
      { id: 'Z10', name: 'Archiwum w drzewie', isDone: false },
    ])
    const s = branchState('AUDYT_MODOW', CARD)
    // In progress: the first open packet after the last closed one (Z3 waits for a check, not work)
    expect(s).toEqual({ kind: 'ok', plan: 'AUDYT_MODOW', statusPath: 'docs/fixy/AUDYT_MODOW/ODNOGA.md', planStatus: 'OTWARTA', stage: { id: 'Z10', name: 'Archiwum w drzewie', status: 'W TOKU' }, stages: 3, closed: 1 })
    expect(branchState('X', null).kind).toBe('unknown')
  })

  test('the tool a plan runs in comes from its STATUS head', () => {
    expect(executorTool(STATUS)).toBe('Codex')
    expect(executorTool(STATUS.replace('gpt-6.1-sol w Codeksie', 'Opus 5.5'))).toBeNull()
    expect(executorTool(null)).toBeNull()
  })

  test('a thread: drawn and tagged as the thread, the active plan only mentioned', () => {
    const w = workOf({ focus: { kind: 'branch', card: 'AUDYT_MODOW', source: 'auto', at: 1 }, active, activeTool: 'Codex', focusText: CARD })
    expect(w.tag).toBe('AUDYT_MODOW/Z10')
    expect(w.unit).toBe('paczek')
    expect(w.mention).toBe('aktywny plan: PANEL_CODEX (Codex)')
    expect(w.label).toBe('AUDYT_MODOW · Z10 (odnoga)')
    expect(w.plan.kind === 'ok' && w.plan.stage?.id).toBe('Z10')
  })

  test('a stage prompt: its stage, even before STATUS says W TOKU; no mention of the same plan', () => {
    const w = workOf({ focus: { kind: 'plan', plan: 'PANEL_CODEX', stage: 'E2', source: 'auto', at: 1 }, active, activeTool: 'Codex', focusText: STATUS })
    expect(w.tag).toBe('PANEL_CODEX/E2')
    expect(w.mention).toBeNull()
    expect(w.plan.kind === 'ok' && w.plan.stage).toEqual({ id: 'E2', name: 'Pomiary', status: 'OCZEKUJE' })
  })

  test('no focus: the active plan as before, unless it runs in another tool — then outside and asking', () => {
    const own = workOf({ focus: null, active, activeTool: null, focusText: null })
    expect(own.tag).toBe('PANEL_CODEX/E1')
    expect(own.plan).toBe(active)
    expect(own.isAsking).toBe(false)
    const elsewhere = workOf({ focus: null, active, activeTool: 'Codex', focusText: null })
    expect(elsewhere.tag).toBeNull()
    expect(elsewhere.isAsking).toBe(true)
    expect(elsewhere.mention).toBe('aktywny plan: PANEL_CODEX (Codex)')
    const outside = workOf({ focus: { kind: 'outside', source: 'manual', at: 1 }, active, activeTool: null, focusText: null })
    expect([outside.tag, outside.label, outside.isAsking]).toEqual([null, 'poza planem', false])
  })
})
