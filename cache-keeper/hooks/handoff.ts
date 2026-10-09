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
