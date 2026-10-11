// Handoff texts. In a RelAI project the project documents are the memory: the handoff
// syncs them and the fresh chat starts with the RelAI phrase "kontynuujemy pracę".
// Elsewhere Claude writes a handoff that is saved and sent as the fresh chat's first prompt.

export const RELAI_DONE = 'PRZEKAZANIE GOTOWE'
export const PLAIN_HEADING = '# Przekazanie sesji'
export const RELAI_CONTINUE = 'kontynuujemy pracę'

export const RELAI_HANDOFF_PROMPT = [
  'Przekazanie do świeżego czatu (relai-cache-keeper).',
  'Wykonaj z rytuału „kończymy na dziś” wyłącznie synchronizację dokumentów: docs/STATE.md,',
  'wpis w docs/DZIENNIK.md i STATUS aktywnego planu, jeśli istnieje — tak, żeby nowa sesja',
  'odtworzyła z nich bieżący wątek pracy, otwarte decyzje i następny krok.',
  'Bez commita, bez sprzątania artefaktów, bez pytań — rzeczy nierozstrzygnięte zapisz jako otwarte.',
  `Na końcu odpowiedzi napisz w osobnej linii dokładnie: ${RELAI_DONE}`,
].join('\n')

export const PLAIN_HANDOFF_PROMPT = [
  'Przekazanie do świeżego czatu (relai-cache-keeper).',
  `Napisz przekazanie tej sesji zaczynające się od nagłówka „${PLAIN_HEADING}”: cel, co zrobione,`,
  'stan plików i gałęzi, otwarte decyzje, pułapki, dokładny następny krok.',
  'Samowystarczalne — czytelnik nie zna tej rozmowy. Bez wstępu przed nagłówkiem.',
].join('\n')

// "Zapisz pracę teraz" on the limit card (LIMIT_CHECKPOINT E3). In a RelAI project it sends the
// phrase of relai-core's limit-checkpoint.md with the card's consent to a local commit; the
// answer's last line SAVE_DONE puts the bar into "czeka". The marker is the same string as in the
// procedure (adapters/claude-code/skills/relai-core/limit-checkpoint.md).
export const SAVE_DONE = 'ZAPIS GOTOWY'
export const SAVE_CONSENT = 'Zgoda na commit lokalny: tak (karta limitu „Zapisz pracę teraz”).'

export function relaiSavePrompt(resumePath: string): string {
  return [
    'zapisz pracę',
    '',
    'Zapis pracy przed wyczerpaniem limitu planu (relai-cache-keeper).',
    'Wykonaj procedurę z pliku limit-checkpoint.md skilla relai-core, krok po kroku, bez pytań poza commitem.',
    SAVE_CONSENT,
    `Plik wznowienia: ${resumePath}`,
    `Na końcu odpowiedzi napisz w osobnej linii dokładnie: ${SAVE_DONE}`,
  ].join('\n')
}

// "Wznów pracę" after the limit's reset (LIMIT_CHECKPOINT E4): the start ritual's phrase with the
// resume file (relai-core reads it first and proposes step 1 of its "Co dalej") and the card's
// consent to delete the file once the work is resumed — nothing deletes it on its own (plan, section 8)
export const RESUME_CONSENT = 'Zgoda na skasowanie pliku wznowienia po wznowieniu: tak (karta „Wznów pracę”).'

export function relaiResumePrompt(resumePath: string): string {
  return [`${RELAI_CONTINUE} — plik wznowienia: ${resumePath}`, RESUME_CONSENT].join('\n')
}

// "Odrzuć": the engine gives a mod no way to delete a file, so Claude deletes it (Łukasz 2026-10-11)
export function relaiDiscardPrompt(resumePath: string): string {
  return [
    `Skasuj plik wznowienia ${resumePath} (relai-cache-keeper, karta „Odrzuć”).`,
    'Bez wznawiania pracy, bez czytania go i bez innych zmian; potwierdź jednym zdaniem.',
  ].join('\n')
}

// The marker stands on a line of its own (bold or code marks around it allowed): a sentence that
// only mentions it, quoting the prompt, is no finished save
export function saveDone(answer: string): boolean {
  return String(answer || '').split('\n').some((line) => line.replace(/[*`_]/g, '').trim() === SAVE_DONE)
}

export function relaiDone(answer: string): boolean {
  return String(answer || '').includes(RELAI_DONE)
}

// The handoff without any preamble Claude put before its heading; '' when too short to be one
export function plainBody(answer: string): string {
  const text = String(answer || '').trim()
  const i = text.indexOf(PLAIN_HEADING)
  const body = i > 0 ? text.slice(i) : text
  return body.length >= 200 ? body : ''
}

export function continuePrompt(body: string, path: string): string {
  const where = path ? ` (zapisane w ${path})` : ''
  return `Przekazanie z poprzedniej sesji${where}:\n\n${body}`
}

// The cold-send guard's fresh start in a RelAI project: the typed prompt rides along
export function relaiFreshPrompt(typed: string): string {
  const rest = String(typed || '').trim()
  return rest ? `${RELAI_CONTINUE}\n\nPotem: ${rest}` : RELAI_CONTINUE
}
