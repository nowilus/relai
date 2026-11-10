'use strict';
// Brzmienia rytualow i promptow etapu (OPTYMALIZACJA_PO_AUDYCIE E10-E11) w zrodle i kopii
// Codeksa. Fragmenty "nieobecne" sa doslownie z main @ 5aeab39 (czerwien przed = kontrola pozytywna).
const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..', '..');
// CRLF -> LF, a podzial linii z wcieciem i znacznikiem cytatu -> jedna spacja.
function czytaj(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8').replace(/\r\n/g, '\n').replace(/\n[>\s]*/g, ' ');
}
function sprawdz(rel, obecne, nieobecne) {
  const t = czytaj(rel);
  for (const s of nieobecne) assert.ok(!t.includes(s), rel + ': zostal stary tekst "' + s + '"');
  for (const s of obecne) assert.ok(t.includes(s), rel + ': brak nowego tekstu "' + s + '"');
}
const OBA = (rel) => [rel, rel.replace('adapters/claude-code/skills/', 'adapters/codex/skills/')];

test('stage prompt names rule numbers and never copies active rules', () => {
  sprawdz('core/templates/SPEC_PROMPT_ETAPU.md',
    ['Nie wklejasz do promptu dosłownego odpisu sekcji „Zasady aktywne”',
      'Zasady do doczytania z `docs/LEKCJE.md` (pełne brzmienie)'],
    ['przepisaną w całości (nie linkiem)', 'aktywne zasady z rejestru lekcji',
      '| `docs/LEKCJE.md` | wyłącznie sekcja „Zasady aktywne" |']);
  for (const rel of OBA('adapters/claude-code/skills/relai-planning/stage-prompts.md')) {
    sprawdz(rel, ['numery zasad aktywnych do doczytania'], ['przepisane w całości „Zasady aktywne"']);
  }
  for (const rel of OBA('adapters/claude-code/skills/relai-planning/deviation-and-branches.md')) {
    sprawdz(rel, ['do doczytania, bez odpisu ich treści'], ['przepisanych w całości']);
  }
  for (const rel of ['adapters/claude-code/commands/relai-stage.md', 'adapters/codex/skills/relai-stage/SKILL.md']) {
    sprawdz(rel, ['z indeksu „Zasad aktywnych”'], ['i z sekcji „Zasady aktywne" rejestru lekcji']);
  }
  for (const rel of ['adapters/claude-code/commands/relai-branch.md', 'adapters/codex/skills/relai-branch/SKILL.md']) {
    sprawdz(rel, ['zasad aktywnych do doczytania'], ['przepisanymi w całości']);
  }
  sprawdz('core/templates/SPEC_ODNOGA.md', ['numery zasad aktywnych do doczytania'], ['przepisane w całości']);
  sprawdz('adapters/cursor/rules/relai-planning.mdc', ['never copies their wording'],
    ['(check, do not assume) and the active lessons']);
  const aneksD = czytaj('core/templates/SPEC_CLAUDE_MD.md').split('porównaj zadanie z wyzwalaczami indeksu').length - 1;
  assert.equal(aneksD, 2, 'SPEC_CLAUDE_MD: zdanie Aneksu D w strukturze i w przykladzie');
});

test('close rituals list the same steps and questions as their procedures', () => {
  const NOWA = 'sync dokumentów, rotacja, sprzątanie artefaktów roboczych, wpis do dziennika';
  const t = czytaj('core/templates/SPEC_CLAUDE_MD.md');
  assert.equal(t.split(NOWA).length - 1, 2, 'SPEC_CLAUDE_MD: kolejnosc frazy w obu miejscach');
  sprawdz('core/templates/SPEC_CLAUDE_MD.md', [], ['sync dokumentów, wpis do dziennika']);
  for (const rel of OBA('adapters/claude-code/skills/relai-core/SKILL.md')) {
    sprawdz(rel, ['kroki 1, 2, 2a, 3, 3a, 4, 5 i 6', 'skasowanie pliku wznowienia w kroku 3a'], ['Pytania są dwa']);
  }
  for (const rel of OBA('adapters/claude-code/skills/relai-planning/stage-closing.md')) {
    sprawdz(rel, ['Pytasz w tym rytuale tylko o dwie rzeczy'], ['Jedyny punkt tego rytuału, o który pytasz']);
  }
  for (const rel of OBA('adapters/claude-code/skills/relai-planning/plan-closing.md')) {
    sprawdz(rel, ['jedno pytanie o następcę planu w punkcie 8'], ['Punkty 3–8 nie są przedmiotem pytania']);
  }
  for (const rel of ['adapters/claude-code/commands/relai-stage.md', 'adapters/codex/skills/relai-stage/SKILL.md']) {
    sprawdz(rel, ['jedno pytanie o następcę planu'], ['Pytaniem może być wyłącznie commit oraz te dwa']);
  }
  for (const rel of ['adapters/claude-code/commands/relai-update.md', 'adapters/codex/skills/relai-update/SKILL.md']) {
    sprawdz(rel, ['wpis do dziennika stoi przed sprzątaniem → przestawiasz człony'], []);
  }
});

test('rotation spec only on manual paths, last stage writes the entry once', () => {
  for (const rel of OBA('adapters/claude-code/skills/relai-core/document-rotation.md')) {
    sprawdz(rel, ['przy nich specyfikacji nie czytasz'],
      ['(czytasz ją z `.claude/relai/templates/` **przed** rotacją, nie z pamięci)']);
  }
  sprawdz('adapters/cursor/rules/relai-core.mdc', ['for them you do not read the specification'],
    ['See `SPEC_ARCHIWUM.md`, read it from']);
  for (const rel of OBA('adapters/claude-code/skills/relai-planning/stage-closing.md')) {
    sprawdz(rel, ['**Ostatni etap planu.**', 'powstają **raz**'],
      ['→ punkt 5 zastępujesz sekwencją z `plan-closing.md`.']);
  }
  for (const rel of OBA('adapters/claude-code/skills/relai-planning/plan-closing.md')) {
    sprawdz(rel, ['osobnego wpisu za etap nie piszesz', 'jedyna aktualizacja `STATE.md` w tej turze'], []);
  }
  sprawdz('core/templates/SPEC_PROMPT_ETAPU.md', ['**wykonywane raz, w sekwencji zamknięcia planu**'],
    ['punkt zastępujesz wskazaniem']);
  sprawdz('adapters/cursor/rules/relai-planning.mdc', ['are written **once**'], []);
});
