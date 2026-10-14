'use strict';

// Straznik faktow humanizacji (E1 planu HUMANIZACJA, ryzyko H1, przypadek b10).
//
// Material: piec par z fixtures/humanize/ — oryginaly to fragmenty plikow sledzonych repozytorium
// z 2026-10-14 (akapit "Gdzie jestesmy" z docs/STATE.md, wpis docs/DZIENNIK.md, akapit README.md,
// fragment docs/KOMENDY.md, akapity karty docs/fixy/PASKI_W_STOPCE/ODNOGA.md), wersje to ich
// humanizacja zrobiona w E1. Kazdy przebieg "bez roznic" ma obok siebie kontrole pozytywna na tym
// SAMYM materiale: podlozona zmieniona liczba, usuniety link, dopisana data, zmieniony kod
// (zasada 5 z LEKCJE.md).

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const test = require('node:test');

const straznik = require('../humanize-facts.js');

const FIXTURY = path.join(__dirname, 'fixtures', 'humanize');
const SKRYPT = path.join(__dirname, '..', 'humanize-facts.js');
const PARY = ['01-state', '02-dziennik', '03-readme', '04-komendy', '05-odnoga'];

const czytaj = (nazwa) => fs.readFileSync(path.join(FIXTURY, nazwa), 'utf8');
const para = (p) => ({ oryginal: czytaj(p + '.oryginal.md'), wersja: czytaj(p + '.wersja.md') });
const wartosci = (lista) => lista.map((f) => f.rodzaj + ':' + f.wartosc);

// Katalogi tymczasowe sprzatane po przebiegu — test nie zostawia sladu w %TEMP%.
const TMP = [];
test.after(() => { for (const d of TMP) fs.rmSync(d, { recursive: true, force: true }); });

test('five humanized pairs keep every fact: nothing lost, nothing added', () => {
  for (const p of PARY) {
    const { oryginal, wersja } = para(p);
    assert.notEqual(oryginal, wersja, p + ': the version must differ from the original');
    // "bez roznic" liczy sie tylko przy niepustym zbiorze faktow (kontrola instrumentu, zasada 5)
    const ile = [...straznik.extractFacts(oryginal).values()].reduce((n, z) => n + z.size, 0);
    assert.ok(ile >= 3, p + ': at least three facts extracted, got ' + ile);
    assert.deepEqual(straznik.compareFacts(oryginal, wersja), { zgubione: [], dopisane: [] }, p);
  }
});

test('positive control on the same material: changed number, removed link, added date, changed code', () => {
  // Kazdy defekt podlozony do wersji, ktora przed chwila przeszla bez roznic.
  const defekty = [
    { p: '01-state', z: '0.15.0', na: '0.16.0', zgubione: ['liczba:0.15.0'], dopisane: ['liczba:0.16.0'] },
    { p: '02-dziennik', z: '[PROMPT_ETAP_1.md](plany/HUMANIZACJA/PROMPT_ETAP_1.md)', na: 'PROMPT etapu', zgubione: ['link:plany/HUMANIZACJA/PROMPT_ETAP_1.md', 'sciezka:PROMPT_ETAP_1.md'], dopisane: [] },
    { p: '03-readme', z: 'Potem piszesz', na: 'Od 2026-11-01 piszesz', zgubione: [], dopisane: ['data:2026-11-01'] },
    { p: '04-komendy', z: '`claude plugin install relai-panel@relai`', na: '`claude plugin add relai-panel@relai`', zgubione: ['backtick:claude plugin install relai-panel@relai'], dopisane: ['backtick:claude plugin add relai-panel@relai'] },
    { p: '05-odnoga', z: 'P-040', na: 'P-041', zgubione: ['liczba:P-040'], dopisane: ['liczba:P-041'] },
  ];
  for (const d of defekty) {
    const { oryginal, wersja } = para(d.p);
    assert.ok(wersja.includes(d.z), d.p + ': the planted defect must hit text that exists');
    const wynik = straznik.compareFacts(oryginal, wersja.replace(d.z, d.na));
    assert.deepEqual(wartosci(wynik.zgubione), d.zgubione, d.p + ' lost');
    assert.deepEqual(wartosci(wynik.dopisane), d.dopisane, d.p + ' added');
  }
});

test('the already-good text compared with itself has no difference', () => {
  const t = czytaj('06-juz-dobry.oryginal.md');
  assert.deepEqual(straznik.compareFacts(t, t), { zgubione: [], dopisane: [] });
});

test('each kind of fact is extracted once and cut out before the next kind', () => {
  const t = [
    'Etap E1 z E5, 93,8 / 100 KB, 1 300 znaków, 40%, D-85 i L-0012, wersja 3.0.0, §8.',
    'Daty 2026-10-14, 14.10.2026 i 14 października 2026.',
    'Pliki docs/STATE.md, core/humanize/, ~/.claude/relai/STYL.md, a także i/lub oraz 3/5.',
    'Link [karta](docs/fixy/A/ODNOGA.md) i https://example.com/a?b=1.',
    'Kod `node --test` w linii.',
    '```js',
    'const a = 1;',
    '```',
  ].join('\n');
  const f = straznik.extractFacts(t);
  const lista = (r) => [...f.get(r)];
  assert.deepEqual(lista('kod'), ['js\nconst a = 1;']);
  assert.deepEqual(lista('backtick'), ['node --test']);
  assert.deepEqual(lista('url'), ['https://example.com/a?b=1']);
  assert.deepEqual(lista('link'), ['docs/fixy/A/ODNOGA.md']);
  assert.deepEqual(lista('sciezka'), ['docs/STATE.md', 'core/humanize/', '~/.claude/relai/STYL.md']);
  assert.deepEqual(lista('data'), ['2026-10-14', '14.10.2026', '14 października 2026']);
  assert.deepEqual(lista('liczba'), ['E1', 'E5', '93,8', '100', '1 300', '40%', 'D-85', 'L-0012', '3.0.0', '§8', '3', '5']);
});

test('a Windows path with backslashes is one path, not numbers or words', () => {
  const f = straznik.extractFacts('Odmowa dla C:\\Windows\\win.ini bez odczytu.');
  assert.deepEqual([...f.get('sciezka')], ['C:\\Windows\\win.ini']);
  assert.deepEqual([...f.get('liczba')], []);
});

// Poprawki po recenzji kodu E1 (2026-10-14): kazdy przypadek z wersja, ktora MUSI trafic.
test('fenced code (also indented in a list) is compared whole: a changed line without digits is a difference', () => {
  const blok = (linia) => 'Lista:\n\n- krok\n\n  ```js\n  const a = b;\n  ' + linia + '\n  ```\n';
  const r = straznik.compareFacts(blok('wywolaj(a);'), blok('wywolajInaczej(a);'));
  assert.equal(r.zgubione.length, 1);
  assert.equal(r.zgubione[0].rodzaj, 'kod');
  assert.match(r.zgubione[0].wartosc, /^js\n {2}const a = b;\n {2}wywolaj\(a\);$/);
  assert.deepEqual(straznik.compareFacts(blok('x();'), blok('x();')), { zgubione: [], dopisane: [] });
});

test('identifiers of any length and short hashes are whole tokens; a URL keeps its own parentheses', () => {
  const f = straznik.extractFacts('Na Windows11 z Python3, commit 9b1b899, strona (https://en.wikipedia.org/wiki/Foo_(bar)).');
  assert.deepEqual([...f.get('liczba')], ['Windows11', 'Python3', '9b1b899']);
  assert.deepEqual([...f.get('url')], ['https://en.wikipedia.org/wiki/Foo_(bar)']);
  assert.deepEqual(wartosci(straznik.compareFacts('commit 9b1b899', 'commit 9b1b89a').zgubione), ['liczba:9b1b899']);
});

test('a BOM does not count, and a failed stdin read is exit 2, never a difference', () => {
  const t = 'Wydanie 3.0.0.';
  assert.deepEqual(straznik.readInputs(['--stdin'], () => String.fromCharCode(0xfeff) + t + '\n' + straznik.SEPARATOR + '\n' + t).teksty, [t, t]);
  assert.match(straznik.readInputs(['--stdin'], () => { throw new Error('EISDIR'); }).blad, /stdin/);
  assert.equal(straznik.main(['--stdin'], () => { throw new Error('EISDIR'); }), 2);
});

test('cautious, not clever: "3" and "trzy", "1 300" and "1300" are differences', () => {
  assert.deepEqual(wartosci(straznik.compareFacts('Mamy 3 etapy.', 'Mamy trzy etapy.').zgubione), ['liczba:3']);
  const r = straznik.compareFacts('Limit 1 300 znaków.', 'Limit 1300 znaków.');
  assert.deepEqual([wartosci(r.zgubione), wartosci(r.dopisane)], [['liczba:1 300'], ['liczba:1300']]);
});

test('line endings do not count: CRLF and LF give the same facts', () => {
  const lf = czytaj('01-state.oryginal.md').replace(/\r\n/g, '\n');
  const crlf = lf.replace(/\n/g, '\r\n');
  assert.deepEqual(straznik.compareFacts(lf, crlf), { zgubione: [], dopisane: [] });
});

test('CLI: exit 0 and empty lists without difference, exit 1 with difference, exit 2 on misuse', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'relai-humanize-facts-'));
  TMP.push(dir);
  const a = path.join(dir, 'a.md');
  const b = path.join(dir, 'b.md');
  fs.writeFileSync(a, 'Wydanie 3.0.0 z 2026-10-13.');
  fs.writeFileSync(b, 'Wydanie 3.0.0 z 2026-10-13, opisane prościej.');
  const ok = spawnSync(process.execPath, [SKRYPT, a, b], { encoding: 'utf8' });
  assert.equal(ok.status, 0);
  assert.deepEqual(JSON.parse(ok.stdout), { zgubione: [], dopisane: [] });

  fs.writeFileSync(b, 'Wydanie 3.1.0 z 2026-10-13.');
  const roznica = spawnSync(process.execPath, [SKRYPT, a, b], { encoding: 'utf8' });
  assert.equal(roznica.status, 1);
  assert.deepEqual(JSON.parse(roznica.stdout), {
    zgubione: [{ rodzaj: 'liczba', wartosc: '3.0.0' }],
    dopisane: [{ rodzaj: 'liczba', wartosc: '3.1.0' }],
  });

  assert.equal(spawnSync(process.execPath, [SKRYPT, a], { encoding: 'utf8' }).status, 2);
  assert.equal(spawnSync(process.execPath, [SKRYPT, a, path.join(dir, 'brak.md')], { encoding: 'utf8' }).status, 2);
});

// Komenda nie pisze plikow tymczasowych (zapis do .claude/ odrzucony w sesji `claude -p`,
// 2026-10-14), wiec teksty ida na stdin: oba z separatorem albo jeden obok pliku.
test('CLI on stdin: both texts with the separator, or one text next to a file', (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'relai-humanize-stdin-'));
  TMP.push(dir);
  const { oryginal, wersja } = para('02-dziennik');
  const sep = straznik.SEPARATOR;
  const bez = spawnSync(process.execPath, [SKRYPT, '--stdin'], { encoding: 'utf8', input: oryginal + '\n' + sep + '\n' + wersja });
  assert.equal(bez.status, 0, bez.stderr);
  assert.deepEqual(JSON.parse(bez.stdout), { zgubione: [], dopisane: [] });

  // kontrola pozytywna w tym samym przebiegu: ta sama para z podlozonym zmienionym identyfikatorem
  const z = spawnSync(process.execPath, [SKRYPT, '--stdin'], { encoding: 'utf8', input: oryginal + '\r\n' + sep + '\r\n' + wersja.replace('E1,', 'E2,') });
  assert.equal(z.status, 1);
  assert.deepEqual(JSON.parse(z.stdout).dopisane, [{ rodzaj: 'liczba', wartosc: 'E2' }]);

  const plik = path.join(dir, 'o.md');
  fs.writeFileSync(plik, oryginal);
  const obok = spawnSync(process.execPath, [SKRYPT, plik, '-'], { encoding: 'utf8', input: wersja });
  assert.equal(obok.status, 0, obok.stderr);
  // "-" na pierwszym miejscu: stdin jest oryginalem; brak A6 w nim = A6 dopisane w pliku
  assert.ok(wersja.includes('A6: '));
  const odwrotnie = spawnSync(process.execPath, [SKRYPT, '-', plik], { encoding: 'utf8', input: wersja.replace('A6: ', '') });
  assert.equal(odwrotnie.status, 1);
  assert.deepEqual(JSON.parse(odwrotnie.stdout), { zgubione: [], dopisane: [{ rodzaj: 'liczba', wartosc: 'A6' }] });

  // bledy wywolania: brak separatora, separator dwa razy, dwa razy "-"
  assert.equal(spawnSync(process.execPath, [SKRYPT, '--stdin'], { encoding: 'utf8', input: oryginal }).status, 2);
  assert.equal(spawnSync(process.execPath, [SKRYPT, '--stdin'], { encoding: 'utf8', input: 'a\n' + sep + '\nb\n' + sep + '\nc' }).status, 2);
  assert.equal(spawnSync(process.execPath, [SKRYPT, '-', '-'], { encoding: 'utf8', input: 'x' }).status, 2);
});
