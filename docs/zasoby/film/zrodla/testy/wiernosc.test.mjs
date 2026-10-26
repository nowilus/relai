// "The interface in the film looks like the real panel" (plan FILM_PREZENTACYJNY, goal 4; E3).
// Scene 3 draws the panel's tabs from the dictionary and its commands from core/panel. This test
// holds both to the panel itself: the tabs to TABS of panel/hooks/pane-parts.tsx — read as the
// file's text, never imported (a .tsx of the plugin is not the film's code) — names and order; the
// commands of the scene to FORMS of core/panel/commands.mjs, and their layout to the rule the
// pane's own code states (two recommended, the rest in groups). Each check has its positive control.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PL, EN } from '../src/teksty.ts';
import { CYKL, POLECANE, ukladKomend, wszystkie } from '../src/komendy.ts';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { FEATURED, GROUPS, NAMES } from '../../../../../core/panel/theme.mjs';
import { FORMS } from '../../../../../core/panel/commands.mjs';
import { REPO, repoReader } from '../skrypty/dane.mjs';
import { sceny, atCommit, START } from '../skrypty/sceny.mjs';
import { stageCard } from '../../../../../core/panel/decisions.mjs';
import sc from '../src/dane/sceny.json' with { type: 'json' };

const SC = sc;

const PANE_PARTS = join(REPO, 'panel/hooks/pane-parts.tsx');
const PANE_COMMANDS = join(REPO, 'panel/hooks/pane-commands.tsx');

/** The tab labels of a pane-parts.tsx text, in order; an error when the line is not there. */
export function tabsOf(text) {
  const line = text.split('\n').find((l) => /^export const TABS = \[/.test(l));
  if (!line) throw new Error('pane-parts.tsx has no line "export const TABS = ["');
  const labels = [...line.matchAll(/\['[a-z]+', '([^']+)'\]/g)].map((m) => m[1]);
  if (labels.length === 0) throw new Error('TABS without a single [id, label] pair');
  return labels;
}

/** Fails when the film's tabs differ from the panel's in a name or in the order. */
const checkTabs = (text, tabs = PL.panel.zakladki) => assert.deepEqual([...tabs], tabsOf(text));

test('the tabs of scene 3 are TABS of pane-parts.tsx, names and order', (t) => {
  const text = readFileSync(PANE_PARTS, 'utf8');
  checkTabs(text);
  t.diagnostic(`tabs: ${tabsOf(text).join(' · ')}`);
});

test('positive control: a copy of pane-parts.tsx with another order fails the check', () => {
  const text = readFileSync(PANE_PARTS, 'utf8');
  const line = text.split('\n').find((l) => l.startsWith('export const TABS = ['));
  assert.ok(line, 'the copy is made from the real line');
  // the copy swaps the first two pairs: the same names, another order
  const swapped = line.replace("['commands', 'Komendy'], ['costs', 'Koszty']", "['costs', 'Koszty'], ['commands', 'Komendy']");
  assert.notEqual(swapped, line, 'the copy really differs');
  const copy = text.replace(line, swapped);
  assert.throws(() => checkTabs(copy));
  // and a copy with a renamed tab fails too
  assert.throws(() => checkTabs(text.replace("'Mapa'", "'Plan'")));
});

test('the commands of scene 3 are FORMS of core/panel: each once, none missing', (t) => {
  const shown = wszystkie(ukladKomend(FEATURED, GROUPS));
  const forms = FORMS.map((f) => f.command);
  assert.equal(new Set(shown).size, shown.length, 'no command twice');
  assert.deepEqual([...shown].sort(), [...forms].sort());
  for (const c of shown) assert.ok(NAMES[c], `${c} has a Polish name and purpose`);
  t.diagnostic(`commands: ${shown.length} of FORMS ${forms.length}`);
  // positive control: a group missing a command, and a group with one doubled, are caught
  const missing = GROUPS.map((g, i) => (i === 1 ? { ...g, commands: g.commands.slice(1) } : g));
  assert.notDeepEqual([...wszystkie(ukladKomend(FEATURED, missing))].sort(), [...forms].sort());
  const doubled = GROUPS.map((g, i) => (i === 2 ? { ...g, commands: [...g.commands, 'relai-stage'] } : g));
  const shownDoubled = wszystkie(ukladKomend(FEATURED, doubled));
  assert.notEqual(new Set(shownDoubled).size, shownDoubled.length);
});

test('the layout rule of the scene is the one pane-commands.tsx states', () => {
  const text = readFileSync(PANE_COMMANDS, 'utf8');
  assert.match(text, new RegExp(`const featured = FEATURED\\.slice\\(0, ${POLECANE}\\)`));
  assert.match(text, new RegExp(`\\.\\.\\.FEATURED\\.slice\\(${POLECANE}\\)`));
  // positive control: another number of recommended would not match the pane's line
  assert.doesNotMatch(text, new RegExp(`const featured = FEATURED\\.slice\\(0, ${POLECANE + 1}\\)`));
});

// ---------- scenes 4 and 5 (E4) ----------
// The card of scene 4 is stageCard()'s own output and the words of scene 5 are read from the
// plugins' files (skrypty/sceny.mjs); these checks hold the parts the film draws itself — the
// card's buttons — and the one change to the card's input, the label of the model.

test('the buttons of scene 4\'s card are those of the panel\'s confirmation card', () => {
  const text = readFileSync(PANE_PARTS, 'utf8');
  assert.ok(text.includes(`btn('confirm-yes', '${PL.nowaSesja.tak}'`), 'Tak');
  assert.ok(text.includes(`btn('confirm-no', '${PL.nowaSesja.nie}'`), 'Nie');
  // positive control: another word would not be found
  assert.ok(!text.includes("btn('confirm-yes', 'Dalej'"));
});

test('scene 4\'s card is the live card on the metric line as written, model row "match" (Aneks F)', (t) => {
  const statusAtStart = atCommit(START, 'docs/plany/FILM_PREZENTACYJNY/STATUS.md');
  const prompt = atCommit(START, 'docs/plany/FILM_PREZENTACYJNY/PROMPT_ETAP_4.md');
  const card = (statusMd) => stageCard({ id: 'film-kontrola', statusMd, statusPath: 'docs/plany/FILM_PREZENTACYJNY/STATUS.md', promptText: prompt, stage: 'E4', sessionModel: 'Opus 5.5', isFresh: false, isNew: true, via: 'link' });
  const model = (c) => c.card.facts.find((f) => f.label === 'Model');
  const shown = SC.nowaSesja.fakty.wartosc.find((f) => f.etykieta === 'Model');
  assert.equal(shown.ton, 'ok');
  assert.equal(shown.wartosc, 'Opus 5.5 — zgodny z planem (Opus 5.5)');
  // the metric line as written: before Aneks F the parser read no model here (screenshot 08 warned)
  const asWritten = model(card(statusAtStart));
  assert.equal(asWritten.value, shown.wartosc);
  t.diagnostic(`model row: film "${shown.wartosc}", live today "${asWritten.value}"`);
  // every row of the film's card is the live card's row, word for word
  const live = card(statusAtStart).card.facts.map((f) => f.value);
  assert.deepEqual(SC.nowaSesja.fakty.wartosc.map((f) => f.wartosc), live);
});

test('positive control: a plugin file without a word scene 5 reads stops the data script', () => {
  const read = repoReader();
  const statusAtStart = atCommit(START, 'docs/plany/FILM_PREZENTACYJNY/STATUS.md');
  const promptAtStart = atCommit(START, 'docs/plany/FILM_PREZENTACYJNY/PROMPT_ETAP_4.md');
  const without = (file, from, to) => (p) => (p === file ? String(read(p)).replace(from, to) : read(p));
  assert.throws(() => sceny({ readText: without('cache-keeper/hooks/limit.ts', "export const GO_ON = 'Pracuję dalej'", "export const GO_ON2 = 'x'"), statusAtStart, promptAtStart, repoRoot: REPO }), /GO_ON/);
  assert.throws(() => sceny({ readText: without('cache-keeper/hooks/register.tsx', 'label="Odrzuć"', 'label="Usuń"'), statusAtStart, promptAtStart, repoRoot: REPO }), /Odrzuć/);
  assert.throws(() => sceny({ readText: read, statusAtStart: statusAtStart.replace('· Opus 5.5 w Claude Code', '· Opus 6'), promptAtStart, repoRoot: REPO }), /metric line/);
});

// ---------- scene 4 "Komendy" (E5, Annex A) ----------
// Each command of the scene is held to the panel's own data (FORMS, NAMES, the icon files) and to
// the table Łukasz accepted in Annex A: order, Polish name, slogan word for word.

/** The table of Annex A (PROMPT_ETAP_5.md, "Decyzje już podjęte"): command, name, slogan. */
const ANEKS_A = Object.freeze([
  ['relai-adopt', 'Adopcja projektu', 'RelAI w projekcie, który już masz'],
  ['relai-prompt', 'Optymalizator promptu', 'Z luźnego zdania — precyzyjne polecenie'],
  ['relai-stage', 'Etap planu', 'Kolejny etap planu jednym kliknięciem'],
  ['relai-crew', 'Załoga agentów', 'Większe zadanie podzielone między agentów'],
  ['relai-branch', 'Odnoga planu', 'Poboczny pomysł czeka na swoją kolej'],
  // PIPELINE_WYDAN E4, accepted by Łukasz on the frame 2026-10-26
  ['relai-humanize', 'Humanizacja tekstu', 'Tekst bez nawyków AI, fakty na miejscu'],
  ['relai-audit', 'Przegląd projektu', 'Szybka kontrola stanu dokumentacji'],
  ['relai-clean', 'Sprzątanie', 'Usuwa zbędne pliki robocze'],
  ['relai-backup', 'Kopia zapasowa', 'Cały projekt w ZIP-ie, bez sekretów'],
  // PIPELINE_WYDAN E4, accepted by Łukasz on the frame 2026-10-26
  ['relai-security', 'Bezpieczeństwo zależności', 'Zależności sprawdzone, ryzyka w dzienniku'],
  ['relai-changelog', 'Lista zmian', 'Co się zmieniło — prosto z dziennika'],
  ['relai-update', 'Aktualizacja', 'Aktualizacja do najnowszej wersji RelAI'],
  ['relai-models', 'Lista modeli', 'Zawsze aktualna lista modeli'],
  ['relai-help', 'Ściąga projektu', 'Wszystkie komendy w jednym miejscu'],
  ['relai-tour', 'Wycieczka po projekcie', 'Szybkie wprowadzenie do projektu'],
  ['relai-handover', 'Pakiet przekazania', 'Cały projekt do przekazania w jednym pliku'],
]);

/**
 * The commands of FORMS the film shows. Until PIPELINE_WYDAN E4 the film stayed at the fourteen of
 * 3.0.0 (Łukasz, 2026-10-14); E4 added relai-humanize and relai-security ("the film changes when
 * what it shows changes", plan PIPELINE_WYDAN). Each name must still be a command of FORMS.
 */
const FORMS_FILMU = Object.freeze(['relai-stage', 'relai-prompt', 'relai-crew', 'relai-branch', 'relai-backup',
  'relai-audit', 'relai-changelog', 'relai-handover', 'relai-tour', 'relai-help', 'relai-adopt', 'relai-update',
  'relai-models', 'relai-clean', 'relai-humanize', 'relai-security']);

/** Fails unless the cycle holds each command the film shows once, in the order of Annex A. */
function checkCykl(cykl, forms = FORMS_FILMU) {
  const biezace = FORMS.map((f) => f.command);
  assert.deepEqual(forms.filter((c) => !biezace.includes(c)), [], 'each command of the film is still in FORMS');
  assert.equal(new Set(cykl).size, cykl.length, 'no command twice');
  assert.deepEqual([...cykl].sort(), [...forms].sort(), 'the commands the film shows, none missing');
  assert.deepEqual([...cykl], ANEKS_A.map(([c]) => c), 'the order of Annex A');
}

/**
 * The English names and slogans Łukasz accepted at the start of E6 (Annex D): command, name,
 * slogan. The handover slogan was shortened after the first render (it broke into two lines).
 */
const ANEKS_D = Object.freeze([
  ['relai-adopt', 'Project adoption', 'RelAI in the project you already have'],
  ['relai-prompt', 'Prompt optimizer', 'From a loose sentence to a precise prompt'],
  ['relai-stage', 'Plan stage', "The plan's next stage in one click"],
  ['relai-crew', 'Agent crew', 'A bigger task shared among agents'],
  ['relai-branch', 'Plan branch', 'A side idea waits for its turn'],
  ['relai-humanize', 'Text humanizer', 'Your text without AI habits, facts intact'], // E4, 2026-10-26
  ['relai-audit', 'Project review', 'A quick health check of your docs'],
  ['relai-clean', 'Cleanup', 'Clears away leftover working files'],
  ['relai-backup', 'Backup', 'The whole project in a ZIP, no secrets'],
  ['relai-security', 'Dependency security', 'Dependencies checked, risks in the journal'], // E4, 2026-10-26
  ['relai-changelog', 'Changelog', 'What changed — straight from the journal'],
  ['relai-update', 'Update', 'Up to the latest version of RelAI'],
  ['relai-models', 'Model list', 'An always up-to-date list of models'],
  ['relai-help', 'Project cheat sheet', 'Every command in one place'],
  ['relai-tour', 'Project tour', 'A quick introduction to the project'],
  ['relai-handover', 'Handover package', 'The whole project in one handover file'],
]);

/**
 * Fails unless each command's name and slogan in the dictionary are those of the accepted table —
 * Annex A for Polish, where the name is also NAMES[command][0] of core/panel; Annex D for English.
 */
function checkSlowa(slowa = PL, tabela = ANEKS_A, names = NAMES) {
  for (const [c, name, slogan] of tabela) {
    assert.equal(slowa.komendy.nazwy[c], name, `${c}: the name in the frame word for word`);
    if (tabela === ANEKS_A) assert.equal(names[c]?.[0], name, `${c}: the Polish name is NAMES[${c}][0]`);
    assert.equal(slowa.komendy.slogany[c], slogan, `${c}: the slogan word for word`);
  }
  const ids = tabela.map(([c]) => c).sort();
  assert.deepEqual(Object.keys(slowa.komendy.slogany).sort(), ids, 'no slogan of a command not in the scene');
  assert.deepEqual(Object.keys(slowa.komendy.nazwy).sort(), ids, 'no name of a command not in the scene');
}

test('scene 4: CYKL is each command the film shows once, in the order of Annex A', (t) => {
  checkCykl(CYKL);
  t.diagnostic(`cycle: ${CYKL.length} commands of the film ${FORMS_FILMU.length}, FORMS now ${FORMS.length}`);
  // positive controls: a cycle missing a command, with one doubled, or in another order,
  // and a 3.0.0 command that is gone from FORMS
  assert.throws(() => checkCykl(CYKL.slice(1)));
  assert.throws(() => checkCykl([...CYKL.slice(0, -1), 'relai-stage']));
  assert.throws(() => checkCykl([CYKL[1], CYKL[0], ...CYKL.slice(2)]));
  assert.throws(() => checkCykl(CYKL, [...FORMS_FILMU.slice(0, -1), 'relai-nieistnieje']));
  // and the cycle of 3.0.0 (fourteen, without the two of E4) fails against the film's commands
  assert.throws(() => checkCykl(CYKL.filter((c) => c !== 'relai-humanize' && c !== 'relai-security')));
});

test('scene 4: each name is NAMES[command][0] and each slogan is the accepted one, word for word', () => {
  checkSlowa();
  // positive controls: another slogan, and a renamed command in NAMES, fail the check
  const zSloganem = (s, c, v) => ({ ...s, komendy: { ...s.komendy, slogany: { ...s.komendy.slogany, [c]: v } } });
  assert.throws(() => checkSlowa(zSloganem(PL, 'relai-clean', 'Sprząta pliki robocze')));
  assert.throws(() => checkSlowa(PL, ANEKS_A, { ...NAMES, 'relai-help': ['Pomoc', ''] }));
});

test('scene 2 in English: each name and slogan is the one of Annex D, word for word', () => {
  checkSlowa(EN, ANEKS_D);
  // positive controls: the slogan before its shortening, and a name left in Polish, fail the check
  const zSloganem = (s, c, v) => ({ ...s, komendy: { ...s.komendy, slogany: { ...s.komendy.slogany, [c]: v } } });
  assert.throws(() => checkSlowa(zSloganem(EN, 'relai-handover', 'The whole project, ready to hand over, in one file'), ANEKS_D));
  const zNazwa = { ...EN, komendy: { ...EN.komendy, nazwy: { ...EN.komendy.nazwy, 'relai-backup': 'Kopia zapasowa' } } };
  assert.throws(() => checkSlowa(zNazwa, ANEKS_D));
});

test('the stamp on the stage card: the card\'s own "Tak" in Polish, "Yes" in English (Annex E)', () => {
  const stamp = (s) => s.komendy.pieczatka;
  assert.equal(stamp(PL), PL.nowaSesja.tak);
  assert.equal(stamp(EN), 'Yes');
  // positive control: a stamp that stayed Polish in the English film is not the accepted word
  assert.notEqual(stamp({ ...EN, komendy: { ...EN.komendy, pieczatka: PL.nowaSesja.tak } }), 'Yes');
});

test('scene 4: each command has its icon in public/znak/, byte for byte the branding file', () => {
  const sha = (p) => createHash('sha256').update(readFileSync(p)).digest('hex');
  const icon = (c) => c.replace(/^relai-/, '');
  const missing = (c) => !existsSync(join(REPO, 'docs/zasoby/film/zrodla/public/znak', `ikona-${icon(c)}.svg`));
  for (const c of CYKL) {
    assert.ok(!missing(c), `${c}: public/znak/ikona-${icon(c)}.svg (run npm run znak)`);
    assert.equal(sha(join(REPO, 'docs/zasoby/film/zrodla/public/znak', `ikona-${icon(c)}.svg`)), sha(join(REPO, 'docs/zasoby/branding/ikony', `${icon(c)}.svg`)), c);
  }
  // positive control: a command with no icon is caught
  assert.ok(missing('relai-nieistnieje'));
});

/** The words written on the props, each with the command file it quotes. */
const SLOWA_REKWIZYTOW = Object.freeze({
  zip: 'adapters/claude-code/commands/relai-backup.md',
  env: 'adapters/claude-code/commands/relai-backup.md',
  trivy: 'adapters/claude-code/commands/relai-security.md',
  high: 'adapters/claude-code/commands/relai-security.md',
});

test('scene 4: every word written on a prop is the product\'s word, quoted from its command file', () => {
  const R = PL.komendy.rekwizyty;
  assert.deepEqual(Object.keys(R).sort(), Object.keys(SLOWA_REKWIZYTOW).sort(), 'each word has its source');
  const quoted = (word, file) => readFileSync(join(REPO, file), 'utf8').includes(word);
  for (const [k, file] of Object.entries(SLOWA_REKWIZYTOW)) assert.ok(quoted(R[k], file), `${R[k]} in ${file}`);
  // positive control: a word the file does not hold is not found
  assert.ok(!quoted('.envrc-film', SLOWA_REKWIZYTOW.env));
});
