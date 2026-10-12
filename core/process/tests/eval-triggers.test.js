'use strict';

// Instrument ewaluacji wyzwalania (AUDYT_SKILLI S5): rozpoznanie wywolania skilla i odczytu jego
// plikow ze strumienia stream-json oraz werdykt. Strumien podlozony — kontrola pozytywna i negatywna
// na tym samym wejsciu (zasada 5), sciezki Windows w zapisie JSON.

const assert = require('node:assert/strict');
const test = require('node:test');

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { analizuj, werdykt, gitFixtury } = require('../../tools/eval-triggers.js');

const linie = (...obj) => obj.map((o) => JSON.stringify(o)).join('\n');
const init = { type: 'system', subtype: 'init', tools: ['Read', 'Skill', 'Bash'], plugins: [{ name: 'relai', path: 'C:\\RelAI' }] };
const narzedzie = (name, input) => ({ type: 'assistant', message: { content: [{ type: 'tool_use', name, input }] } });
const koniec = (subtype, result) => ({ type: 'result', subtype, result, num_turns: 2, total_cost_usd: 0.01 });

test('wywolanie skilla i odczyt pliku doczytywanego ze sciezka Windows', () => {
  const a = analizuj(linie(init,
    narzedzie('Skill', { skill: 'relai:relai-core' }),
    narzedzie('Read', { file_path: 'C:\\RelAI\\adapters\\claude-code\\skills\\relai-core\\session-close.md' }),
    koniec('success', 'Zamykam sesje.')), 'relai-core');
  assert.equal(a.wywolany, true);
  assert.deepEqual(a.odczyty, ['session-close.md']);
  assert.deepEqual(a.narzedzia, ['Skill', 'Read']);
  assert.equal(a.init.skill, true);
});

test('inny skill na tym samym wejsciu nie liczy sie jako wywolanie mierzonego', () => {
  const tekst = linie(init, narzedzie('Skill', { skill: 'relai:relai-core' }), koniec('success', 'ok'));
  assert.equal(analizuj(tekst, 'relai-planning').wywolany, false);
  assert.equal(analizuj(tekst, 'relai-core').wywolany, true);
});

test('werdykt: limit tur przed odpowiedzia to nie zmierzono, nie cisza', () => {
  const brak = analizuj(linie(init, narzedzie('Bash', { command: 'ls' }), koniec('error_max_turns', '')), 'relai-planning');
  assert.equal(werdykt({ expect: 'none' }, brak), 'nie zmierzono');
  assert.equal(werdykt({ expect: 'trigger' }, brak), 'nie zmierzono');
  const cisza = analizuj(linie(init, koniec('success', 'Hiszpanski: zacznij od wymowy.')), 'relai-planning');
  assert.equal(werdykt({ expect: 'none' }, cisza), 'ok');
  assert.equal(werdykt({ expect: 'trigger' }, cisza), 'blad');
});

test('wynik z is_error (logowanie, limit) to nie zmierzono, nawet z subtype success', () => {
  const blad = analizuj(linie(init, Object.assign(koniec('success', 'Failed to authenticate'), { is_error: true })), 'relai-planning');
  assert.equal(werdykt({ expect: 'none' }, blad), 'nie zmierzono');
  assert.equal(werdykt({ expect: 'none', miara: 'procedura' }, blad), 'nie zmierzono');
  assert.equal(werdykt({ expect: 'trigger' }, blad), 'nie zmierzono');
});

test('miara procedura: samo wywolanie dozwolone, plik doczytywany albo RelAI w odpowiedzi to blad', () => {
  const samo = analizuj(linie(init, narzedzie('Skill', { skill: 'relai-core' }), koniec('success', 'Status w realizacji znaczy...')), 'relai-core');
  assert.equal(werdykt({ expect: 'none', miara: 'procedura' }, samo), 'ok');
  const propozycja = analizuj(linie(init, narzedzie('Skill', { skill: 'relai-core' }), koniec('success', 'Moge zalozyc strukture RelAI.')), 'relai-core');
  assert.equal(werdykt({ expect: 'none', miara: 'procedura' }, propozycja), 'blad');
  const plik = analizuj(linie(init, narzedzie('Read', { file_path: '/x/skills/relai-core/new-project.md' }), koniec('success', 'ok')), 'relai-core');
  assert.equal(werdykt({ expect: 'none', miara: 'procedura' }, plik), 'blad');
});

test('kopia fixtury ma tozsamosc z podpisu dziennika: siatka D-27 hooka milczy', (t) => {
  const { unknownAuthor } = require('../session-signals.js');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'relai-eval-git-test-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  fs.mkdirSync(path.join(dir, 'docs'));
  fs.writeFileSync(path.join(dir, 'docs', 'DZIENNIK.md'), '## 2026-10-01\n\nAutor: obcy autor\n');
  // kontrola: bez repo fixtury i z podpisem kogos innego siatka odpowiada (gdy maszyna ma user.name)
  const przed = unknownAuthor(dir);
  fs.copyFileSync(path.join(__dirname, '..', '..', 'evals', 'fixtures', 'relai', 'docs', 'DZIENNIK.md'), path.join(dir, 'docs', 'DZIENNIK.md'));
  gitFixtury(dir);
  assert.equal(unknownAuthor(dir), null);
  fs.writeFileSync(path.join(dir, 'docs', 'DZIENNIK.md'), '## 2026-10-01\n\nAutor: obcy autor\n');
  assert.equal(unknownAuthor(dir).ja, 'tester');
  if (przed) assert.notEqual(przed.ja, 'tester');
});

test('odczyty: ogon z ucieczki cudzyslowu i sam katalog skilla nie sa nazwa pliku', () => {
  const polecenie = 'cat "C:\\x\\skills\\relai-core\\start-nets.md\\"; ls "C:/x/skills/relai-core/\\"';
  const a = analizuj(linie(init, narzedzie('Bash', { command: polecenie }), koniec('success', 'ok')), 'relai-core');
  assert.deepEqual(a.odczyty, ['start-nets.md']);
});
