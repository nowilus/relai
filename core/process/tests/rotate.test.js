'use strict';

// rotate.js (AUDYT_SKILLI S4): rotacja ryzyk i dziennika jako skrypt dwufazowy. Fixture ryzyk to
// sekcja "Stan otwartych ryzyk" z gita przed i po rotacji C3/C9 z 2026-10-11 (commit 9e3ce1e)
// oraz plik archiwum z tego dnia — test odtwarza tamta rotacje. Porownania po CRLF -> LF (zasada 11).

const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const rotate = require('../../tools/rotate.js');

const FIX = path.join(__dirname, 'fixtures', 'rotate');
const lf = (t) => t.replace(/\r\n/g, '\n');

function projekt(t, dziennik) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'relai-rotate-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  fs.mkdirSync(path.join(dir, 'docs'));
  fs.writeFileSync(path.join(dir, 'docs', 'DZIENNIK.md'), dziennik);
  return dir;
}

const opcje = (dir, extra) => Object.assign({ plik: path.join(dir, 'docs', 'DZIENNIK.md'), korzen: dir, data: '2026-10-11' }, extra);

test('odtwarza rotacje ryzyk C3/C9 z 2026-10-11: archiwum i sekcja ryzyk jak w repozytorium', (t) => {
  const dir = projekt(t, fs.readFileSync(path.join(FIX, 'DZIENNIK-przed-2026-10-11.md'), 'utf8'));
  const wynik = rotate.wykonaj('ryzyka', opcje(dir));

  assert.equal(wynik.kod, 0, wynik.out.join('\n'));
  assert.equal(wynik.suma, '3d1c7384436e320c');
  const archiwum = path.join(dir, 'docs', 'archiwum', 'ryzyka', 'RYZYKA_2026-10-11.md');
  assert.equal(lf(fs.readFileSync(archiwum, 'utf8')), lf(fs.readFileSync(path.join(FIX, 'RYZYKA_2026-10-11.md'), 'utf8')));
  assert.equal(lf(fs.readFileSync(path.join(dir, 'docs', 'DZIENNIK.md'), 'utf8')),
    lf(fs.readFileSync(path.join(FIX, 'DZIENNIK-po-2026-10-11.md'), 'utf8')));
});

test('plik archiwum uszkodzony po zapisie: STOP przed faza 2, zywy plik nietkniety', (t) => {
  const przed = fs.readFileSync(path.join(FIX, 'DZIENNIK-przed-2026-10-11.md'), 'utf8');
  const dir = projekt(t, przed);
  const io = {
    read: (p) => fs.readFileSync(p, 'utf8'),
    exists: (p) => fs.existsSync(p),
    write: (p, tekst) => {
      fs.mkdirSync(path.dirname(p), { recursive: true });
      fs.writeFileSync(p, /RYZYKA_/.test(p) ? tekst.replace('| C9 |', '| C0 |') : tekst);
    },
  };
  const wynik = rotate.wykonaj('ryzyka', opcje(dir), io);

  assert.equal(wynik.kod, 3);
  assert.match(wynik.out.join('\n'), /STOP: suma fragmentu 3d1c7384436e320c, suma archiwum z dysku [0-9a-f]{16}/);
  assert.equal(fs.readFileSync(path.join(dir, 'docs', 'DZIENNIK.md'), 'utf8'), przed);
});

test('sprawdz porownuje sume fragmentu z suma archiwum i zglasza roznice', (t) => {
  const dir = projekt(t, fs.readFileSync(path.join(FIX, 'DZIENNIK-przed-2026-10-11.md'), 'utf8'));
  const archiwum = path.join(dir, 'RYZYKA.md');
  fs.writeFileSync(archiwum, fs.readFileSync(path.join(FIX, 'RYZYKA_2026-10-11.md'), 'utf8'));
  assert.equal(rotate.sprawdz('ryzyka', opcje(dir, { archiwum })).kod, 0);
  fs.appendFileSync(archiwum, '| C99 | dopisany | x | ZAMKNIĘTE | x |\n');
  const roznica = rotate.sprawdz('ryzyka', opcje(dir, { archiwum }));
  assert.equal(roznica.kod, 3);
  assert.match(roznica.out[0], /ROZNE/);
});

function dziennik(daty, { malejaco = false } = {}) {
  const wpisy = daty.map((d, i) => '### ' + d + ' — Wpis numer ' + (i + 1) + ', z przecinkiem\n\n' + 'Treść '.repeat(200) + '\n\nAutor: RelAI (Opus) + Lukasz\n');
  const kolejne = malejaco ? wpisy.slice().reverse() : wpisy;
  return '# DZIENNIK — test\n\n## Stan otwartych ryzyk\n\n| # | Ryzyko | Poziom | Status | Mitygacja |\n|---|---|---|---|---|\n'
    + '| R1 | x | Niski | OTWARTE | — |\n\n## Czeka na człowieka\n\n'
    + '- Sprawa z pierwszego wpisu · 2026-01-01 · [wpis](#2026-01-01--wpis-numer-1-z-przecinkiem)\n'
    + '- Sprawa z najnowszego · 2026-01-14 · [wpis](#2026-01-14--wpis-numer-14-z-przecinkiem)\n\n'
    + '## Wpisy\n\n> Wpisy z okresu 2025-12-01 … 2025-12-31 (3 wpisy) są w\n> [docs/archiwum/dziennik/X.md](archiwum/dziennik/X.md)\n'
    + '> — przeniesione 2026-01-01, suma kontrolna `0000000000000000`.\n\n' + kolejne.join('\n');
}

const DATY = Array.from({ length: 14 }, (_, i) => '2026-01-' + String(i + 1).padStart(2, '0'));

test('dziennik: zabiera najstarsze wpisy ponad dziesiecioma najnowszymi, przepina link i liczy martwe kotwice', (t) => {
  const dir = projekt(t, dziennik(DATY));
  const wynik = rotate.wykonaj('dziennik', opcje(dir, { prog: 5, data: '2026-02-01' }));

  assert.equal(wynik.kod, 0, wynik.out.join('\n'));
  const zywy = lf(fs.readFileSync(path.join(dir, 'docs', 'DZIENNIK.md'), 'utf8'));
  const archiwum = lf(fs.readFileSync(path.join(dir, 'docs', 'archiwum', 'dziennik', 'DZIENNIK_2026-01-01_2026-01-04.md'), 'utf8'));
  assert.equal((zywy.match(/^### /gm) || []).length, 10, 'dziesiec najnowszych zostaje');
  assert.equal((archiwum.match(/^### /gm) || []).length, 4);
  assert.equal(rotate.suma(rotate.trescArchiwum(archiwum)), wynik.suma);
  assert.match(zywy, /\[wpis\]\(archiwum\/dziennik\/DZIENNIK_2026-01-01_2026-01-04\.md#2026-01-01--wpis-numer-1-z-przecinkiem\)/);
  assert.match(zywy, /\[wpis\]\(#2026-01-14--wpis-numer-14-z-przecinkiem\)/, 'link do wpisu, ktory zostaje, nietkniety');
  // nowy odsylacz stoi POD starym, a pod nim jedna pusta linia przed pierwszym wpisem
  assert.match(zywy, /`0000000000000000`\.\n\n> Wpisy z okresu 2026-01-01 … 2026-01-04 \(4 wpisy\) są w\n.*\n> — przeniesione 2026-02-01, suma kontrolna `[0-9a-f]{16}`\.\n\n### 2026-01-05/);
  assert.match(wynik.out.join('\n'), /przepietych linkow 1, linki "Czeka na czlowieka": 2, martwe kotwice 0, do nieistniejacego pliku 0/);
});

test('dziennik w kolejnosci malejacej: zakres liczony od najstarszej daty, nie od gory pliku', (t) => {
  const dir = projekt(t, dziennik(DATY, { malejaco: true }));
  const wynik = rotate.wykonaj('dziennik', opcje(dir, { prog: 5, data: '2026-02-01' }));
  assert.equal(wynik.kod, 0, wynik.out.join('\n'));
  assert.ok(fs.existsSync(path.join(dir, 'docs', 'archiwum', 'dziennik', 'DZIENNIK_2026-01-01_2026-01-04.md')));
  const zywy = lf(fs.readFileSync(path.join(dir, 'docs', 'DZIENNIK.md'), 'utf8'));
  assert.doesNotMatch(zywy, /^### 2026-01-0[1-4]/m);
  assert.match(zywy, /^### 2026-01-14/m);
});

// Przeglad kodu S4: podwojna pusta linia poza przenoszonym zakresem zostaje (narzedzie bezstratne),
// link zewnetrzny z #fragmentem nie jest „linkiem do nieistniejacego pliku”, a `sprawdz` po
// zakonczonej rotacji mowi wprost, ze w zywym pliku nie ma juz czego porownac.
test('rotacja dziennika nie zmienia tresci poza zakresem; link zewnetrzny nie jest martwy', (t) => {
  const tekst = dziennik(DATY)
    .replace('Sprawa z najnowszego', 'Sprawa z [issue](https://github.com/o/r/issues/1#issuecomment-2) z najnowszego')
    .replace('### 2026-01-14 — Wpis numer 14, z przecinkiem\n\n', '### 2026-01-14 — Wpis numer 14, z przecinkiem\n\n```\nfoo\n\n\nbar\n```\n\n');
  const dir = projekt(t, tekst);
  const wynik = rotate.wykonaj('dziennik', opcje(dir, { prog: 5, data: '2026-02-01' }));
  assert.equal(wynik.kod, 0, wynik.out.join('\n'));
  assert.match(lf(fs.readFileSync(path.join(dir, 'docs', 'DZIENNIK.md'), 'utf8')), /foo\n\n\nbar/);
  assert.match(wynik.out.join('\n'), /linki "Czeka na czlowieka": 2, martwe kotwice 0, do nieistniejacego pliku 0/);
  assert.doesNotMatch(wynik.out.join('\n'), /UWAGA/);

  const po = rotate.sprawdz('dziennik', opcje(dir, { prog: 5, archiwum: path.join(dir, 'docs', 'archiwum', 'dziennik', 'DZIENNIK_2026-01-01_2026-01-04.md') }));
  assert.equal(po.kod, 2);
  assert.match(po.out[0], /nie ma juz fragmentu/);
});

test('ponizej progu i uklad spoza obslugi: nic nie zapisuje', (t) => {
  const dir = projekt(t, dziennik(DATY));
  const przed = fs.readFileSync(path.join(dir, 'docs', 'DZIENNIK.md'), 'utf8');
  assert.match(rotate.wykonaj('dziennik', opcje(dir, { prog: 500 })).out.join('\n'), /ponizej progu/);
  const mieszany = dziennik(['2026-01-02', '2026-01-01', '2026-01-03']);
  fs.writeFileSync(path.join(dir, 'docs', 'DZIENNIK.md'), mieszany);
  assert.equal(rotate.wykonaj('dziennik', opcje(dir, { prog: 1 })).kod, 2);
  const bezCzeka = przed.replace('## Czeka na człowieka', '## Inna sekcja');
  fs.writeFileSync(path.join(dir, 'docs', 'DZIENNIK.md'), bezCzeka);
  assert.equal(rotate.wykonaj('dziennik', opcje(dir, { prog: 1 })).kod, 2);
  assert.equal(fs.existsSync(path.join(dir, 'docs', 'archiwum')), false);
});
