'use strict';

// Nakladki rodzin modeli i pole family w kopii listy (2.6.0, plan PROWADZENIE_END_TO_END E4).
// Dwa mechanizmy hooka startu: sygnal wieku nakladki (ryzyko K3) i uzupelnienie pola family
// w kopii listy, ktorej hook nigdy nie nadpisuje. Kazdy przebieg "cisza" ma obok siebie
// kontrole pozytywna na tym samym projekcie (zasada 5).

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const core = require('../session-signals.js');

const DZISIAJ = '2026-09-24';

// Katalogi tymczasowe sprzatane po przebiegu — test nie zostawia sladu w %TEMP%.
const TMP = [];
function tmp(prefiks) {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), prefiks));
  TMP.push(d);
  return d;
}
test.after(() => { for (const d of TMP) fs.rmSync(d, { recursive: true, force: true }); });

function projekt(wierszListy) {
  const cwd = tmp('relai-e4-overlay-');
  fs.mkdirSync(path.join(cwd, 'docs'));
  fs.writeFileSync(path.join(cwd, 'docs', 'USTAWIENIA.md'),
    '# USTAWIENIA\n\nWersja RelAI: 2.6.0 · zainicjowano: 2026-09-01\n\n' +
    '| Data | Czego dotyczy | Decyzja |\n|---|---|---|\n' +
    (wierszListy === null ? '' : '| 2026-09-01 | Lista modeli | ' + wierszListy + ' |\n'));
  fs.mkdirSync(path.join(cwd, '.claude', 'relai', 'prompt', 'rodziny'), { recursive: true });
  fs.writeFileSync(path.join(cwd, '.claude', 'relai', 'MODELE-test.md'),
    '```\nlist-date: 2026-09-20\ntool: test\n\nstrong: A | alias: a | id: a-1 | family: claude | source: x\n```\n');
  return cwd;
}

function nakladka(cwd, plik, data) {
  fs.writeFileSync(path.join(cwd, '.claude', 'relai', 'prompt', 'rodziny', plik),
    '# Nakladka\n\noverlay-date: ' + data + '\n\n- regula\n');
}

function raport(cwd) {
  return core.wiekListyModeliReport(core.wiekListyModeli(cwd, { nazwa: 'MODELE-test.md', dzisiaj: DZISIAJ }));
}

test('overlay age: an old overlay speaks, a fresh one stays silent — in one run', () => {
  const cwd = projekt('włączona · 7 dni');
  nakladka(cwd, 'claude.md', '2026-09-24');
  nakladka(cwd, 'openai.md', '2026-07-01');

  const miara = core.wiekNakladek(path.join(cwd, '.claude', 'relai'), DZISIAJ);
  assert.equal(miara.length, 2, 'both overlays measured');

  const linie = raport(cwd);
  const oNakladkach = linie.filter((l) => l.startsWith('[RelAI nakladki modeli]'));
  // Kontrola pozytywna: stara nakladka daje dokladnie jedna linie i nazywa siebie.
  assert.equal(oNakladkach.length, 1);
  assert.match(oNakladkach[0], /openai\.md z dnia 2026-07-01, 85 dni/);
  // Cisza: swieza nakladka nie pojawia sie w tej samej linii.
  assert.doesNotMatch(oNakladkach[0], /claude\.md/);
  // Lista ma 4 dni przy progu 7 — o niej zero znakow.
  assert.equal(linie.filter((l) => l.startsWith('[RelAI lista modeli]')).length, 0);
});

test('overlay age: silent below the threshold, silent when the list switch is off', () => {
  const swieze = projekt('włączona · 7 dni');
  nakladka(swieze, 'claude.md', '2026-09-01');
  assert.deepEqual(raport(swieze), [], '23 days < 30');

  const wylaczone = projekt('wyłączona');
  nakladka(wylaczone, 'openai.md', '2026-01-01');
  assert.deepEqual(raport(wylaczone), [], 'one switch silences both signals');
  // Ten sam projekt po wlaczeniu wiersza mowi — cisza wyzej byla wylacznikiem, nie awaria.
  fs.writeFileSync(path.join(wylaczone, 'docs', 'USTAWIENIA.md'),
    fs.readFileSync(path.join(wylaczone, 'docs', 'USTAWIENIA.md'), 'utf8').replace('wyłączona', 'włączona'));
  assert.equal(raport(wylaczone).length, 1);
});

test('overlay age: unreadable or future date is silence, not a guess', () => {
  const cwd = projekt('włączona');
  nakladka(cwd, 'claude.md', '2027-01-01');
  fs.writeFileSync(path.join(cwd, '.claude', 'relai', 'prompt', 'rodziny', 'openai.md'), '# bez daty\n');
  assert.deepEqual(core.wiekNakladek(path.join(cwd, '.claude', 'relai'), DZISIAJ), []);
});

function listaBezRodziny(eol) {
  return ['```', 'list-date: 2026-09-04', 'tool: test', '',
    'strong: Opus 5.5 | alias: opus | id: claude-opus-5-5 | source: page, read 2026-09-24',
    'balanced: Custom | alias: - | id: custom-1 | source: named by the human',
    'cheap: Haiku 4.5 | alias: haiku | id: claude-haiku-4-5 | family: claude | source: page', '```', ''].join(eol);
}

const ZRODLO = ['```', 'list-date: 2026-09-24', '',
  'strong: Opus 5.5 | alias: opus | id: claude-opus-5-5 | family: claude | source: page',
  'cheap: Haiku 4.5 | alias: haiku | id: claude-haiku-4-5 | family: claude | source: page', '```', ''].join('\n');

for (const [opis, eol] of [['LF', '\n'], ['CRLF', '\r\n']]) {
  test('family fill (' + opis + '): only the missing field, only for an id known to the plugin', () => {
    const dir = tmp('relai-e4-family-');
    const cel = path.join(dir, 'MODELE-test.md');
    const zrodlo = path.join(dir, 'zrodlo.md');
    fs.writeFileSync(cel, listaBezRodziny(eol));
    fs.writeFileSync(zrodlo, ZRODLO);

    assert.equal(core.uzupelnijRodzine(cel, zrodlo), 1);
    const po = fs.readFileSync(cel, 'utf8');
    assert.ok(po.includes('strong: Opus 5.5 | alias: opus | id: claude-opus-5-5 | family: claude | source: page, read 2026-09-24'));
    // Dowod negatywny: pozycja bez pary w pluginie zostaje nietknieta, data listy tez.
    assert.ok(po.includes('balanced: Custom | alias: - | id: custom-1 | source: named by the human'));
    assert.ok(po.includes('list-date: 2026-09-04'));
    // Pozycja z polem nie dostaje drugiego.
    assert.equal((po.match(/family:/g) || []).length, 2);
    // Konce linii zachowane.
    assert.equal(po.includes('\r\n'), eol === '\r\n');
    // Drugi przebieg nie ma czego uzupelniac.
    assert.equal(core.uzupelnijRodzine(cel, zrodlo), 0);
  });
}

test('provisionModelList fills family in an existing copy and never overwrites names', () => {
  const cwd = tmp('relai-e4-provision-');
  const zrodlo = path.join(cwd, 'zrodlo.md');
  fs.writeFileSync(zrodlo, ZRODLO);
  fs.mkdirSync(path.join(cwd, '.claude', 'relai'), { recursive: true });
  fs.writeFileSync(path.join(cwd, '.claude', 'relai', 'MODELE-test.md'), listaBezRodziny('\n'));

  const wynik = core.provisionModelList(cwd, { zrodlo, nazwa: 'MODELE-test.md' });
  assert.equal(wynik.skopiowany, false);
  assert.equal(wynik.uzupelnione, 1);
  assert.equal(wynik.data, '2026-09-04', 'the copy keeps its own date, not the plugin one');
});
