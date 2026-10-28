'use strict';

// Skrot startu (KONTEKST_STARTU E2): jedno polecenie zamiast odczytu calych dokumentow.
// Fixtury w katalogu tymczasowym — projekt biezacego ksztaltu i projekt stary (ryzyko 7 planu:
// brak sekcji, stare naglowki, CRLF). Budzet startu liczy wyjscie skrotu, nie pliki.

const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const core = require('../session-signals.js');
const { startDigest, bezMitygacji, pierwszyPunkt } = require('../start-digest.js');

const NARZEDZIE = path.join(__dirname, '..', 'start-digest.js');
const DZISIAJ = '2026-10-28';

const USTAWIENIA = '# USTAWIENIA\n\nWersja RelAI: 3.6.0 · zainicjowano: 2026-08-07\n\nOpis rejestru.\n\n'
  + '| Data | Czego dotyczy | Decyzja |\n|---|---|---|\n'
  + '| 2026-09-01 | Przegląd spraw człowieka | włączony · 30 dni |\n'
  + '| 2026-10-28 | Budżet startu sesji | włączony · start 100 KB |\n\n'
  + '## Ustawienia wycofane\n\n| Data | Czego dotyczy | Decyzja | Zastąpione |\n|---|---|---|---|\n'
  + '| 2026-08-01 | Język | angielski | WYCOFANY-WIERSZ |\n';

const STATE = '# STATE — Fixtura\n\nStan na: 2026-10-28\n\n'
  + '## Gdzie jesteśmy\n\nProjekt GDZIE-TRESC działa.\n\n'
  + '## Co działa\n\n' + 'CO-DZIALA-DLUGIE '.repeat(500) + '\n\n'
  + '## Nad czym pracujemy teraz\n\n- **Plan X — E2** TERAZ-TRESC.\n\n'
  + '## Co dalej\n\n- PIERWSZY-PUNKT pierwszy\n  ciag dalszy pierwszego.\n- DRUGI-PUNKT drugi.\n\n'
  + '## Co blokuje\n\n- BLOKUJE-TRESC.\n\n---\n\n## Szczegóły techniczne\n\nSZCZEGOLY.\n';

function dziennik(dataSprawy) {
  return '# DZIENNIK\n\n## Stan otwartych ryzyk\n\n'
    + '| # | Ryzyko | Poziom | Status | Mitygacja |\n|---|---|---|---|---|\n'
    + '| R1 | Pierwsze ryzyko | Średni | OTWARTE | MIT-JEDEN |\n'
    + '| R2 | Drugie ryzyko z \\| pipe | Niski | OTWARTE | MIT-DWA |\n\n'
    + '| S1 | Trzecie po pustej linii | Wysoki | OTWARTE | MIT-TRZY |\n\n'
    + '## Czeka na człowieka\n\n- **SPRAWA-CZEKA do rozstrzygniecia** · ' + dataSprawy + ' · [wpis](x.md)\n\n'
    + '## Wpisy\n\n### 2026-10-01 — Starszy wpis\n\nSTARY-WPIS.\n\n'
    + '### 2026-10-27 — Najnowszy wpis\n\nNOWY-WPIS.\n\nAutor: X\n';
}

const LEKCJE = '# LEKCJE\n\n## Zasady aktywne\n\n1. **ZASADA-JEDEN** pelne brzmienie.\n\n## Lekcje\n\n'
  + '### L-0001 — LEKCJA-PELNA\n\ntresc.\n';

const STATUS = '# STATUS — plan PLAN_X\n\n| Etap | Nazwa | Status | Prompt | Uwagi |\n|---|---|---|---|---|\n'
  + '| E1 | Pierwszy | ZREALIZOWANY 2026-10-01 | — | STATUS-PLANU |\n';

function projektBiezacy(dataSprawy) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'relai-start-digest-'));
  fs.mkdirSync(path.join(dir, 'docs', 'plany', 'PLAN_X'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'CLAUDE.md'), '# Fixtura\n\n## Stan prac\n\n'
    + 'Aktywny plan: [PLAN_X](docs/plany/PLAN_X/STATUS.md) — w toku.\n');
  fs.writeFileSync(path.join(dir, 'docs', 'USTAWIENIA.md'), USTAWIENIA);
  fs.writeFileSync(path.join(dir, 'docs', 'STATE.md'), STATE);
  fs.writeFileSync(path.join(dir, 'docs', 'DZIENNIK.md'), dziennik(dataSprawy || '2026-10-20'));
  fs.writeFileSync(path.join(dir, 'docs', 'LEKCJE.md'), LEKCJE);
  fs.writeFileSync(path.join(dir, 'docs', 'DECYZJE.md'), '# DECYZJE\n');
  fs.writeFileSync(path.join(dir, 'docs', 'plany', 'PLAN_X', 'STATUS.md'), STATUS);
  return dir;
}

function wierszeTabeli(txt) {
  return txt.split('\n').filter((l) => /^\|\s*[A-Z]\d/.test(l)).length;
}

test('digest of a current project carries every section from the plan and nothing it replaces', () => {
  const dir = projektBiezacy();
  try {
    const w = startDigest(dir, { dzisiaj: DZISIAJ });
    const t = w.tekst;
    // Wszystkie pozycje skrotu.
    for (const znacznik of ['GDZIE-TRESC', 'TERAZ-TRESC', 'BLOKUJE-TRESC', 'PIERWSZY-PUNKT',
      'ciag dalszy pierwszego', 'NOWY-WPIS', 'ZASADA-JEDEN', 'STATUS-PLANU', 'Wersja RelAI: 3.6.0',
      'Przegląd spraw człowieka', '=== Drogowskazy']) {
      assert.ok(t.includes(znacznik), 'brak w skrocie: ' + znacznik);
    }
    // Dowody negatywne: tresci spoza skrotu.
    for (const znacznik of ['CO-DZIALA-DLUGIE', 'DRUGI-PUNKT', 'SZCZEGOLY', 'STARY-WPIS',
      'WYCOFANY-WIERSZ', 'LEKCJA-PELNA', 'SPRAWA-CZEKA', 'MIT-JEDEN', 'MIT-DWA', 'MIT-TRZY']) {
      assert.ok(!t.includes(znacznik), 'skrot niesie to, czego nie powinien: ' + znacznik);
    }
    // Naglowek kolumny nieobecny w zadnym wierszu tabeli (slowo zostaje tylko w drogowskazie).
    const tabela = t.split('\n').filter((l) => l.startsWith('|'));
    assert.ok(tabela.some((l) => /\| # \| Ryzyko \|/.test(l)), 'kontrola pozytywna: naglowek tabeli ryzyk');
    assert.ok(!tabela.some((l) => /Mitygacja/.test(l)), 'kolumna Mitygacja w tabeli');
    // Kontrola pozytywna tabeli ryzyk: tyle samo wierszy co w dzienniku, pipe z ucieczka nietkniety.
    const blokRyzyk = t.split('=== ').find((b) => b.includes('Stan otwartych ryzyk'));
    assert.equal(wierszeTabeli(blokRyzyk), 3);
    assert.equal(wierszeTabeli(blokRyzyk), wierszeTabeli(dziennik('2026-10-20')));
    assert.ok(t.includes('Drugie ryzyko z \\| pipe | Niski | OTWARTE |'));
    // Drogowskazy wskazuja pliki, ktorych skrot nie streszcza w calosci.
    assert.match(t, /- docs\/STATE\.md - dalsze punkty "Co dalej" i sekcje: Co działa, Szczegóły techniczne/);
    assert.match(t, /- docs\/DECYZJE\.md - rejestr decyzji/);
    assert.match(t, /- docs\/plany\/PLAN_X\/ - plan aktywny/);
    // Suma czesci = bajty wyjscia.
    assert.equal(w.czesci.reduce((s, c) => s + c.bajty, 0), Buffer.byteLength(t, 'utf8'));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('waiting-on-a-human section appears only when an item is overdue (one run, two dates)', () => {
  const stara = projektBiezacy('2026-08-01');
  const swieza = projektBiezacy('2026-10-20');
  try {
    const zStara = startDigest(stara, { dzisiaj: DZISIAJ }).tekst;
    const zeSwieza = startDigest(swieza, { dzisiaj: DZISIAJ }).tekst;
    assert.ok(zStara.includes('SPRAWA-CZEKA'), 'sprawa przeterminowana bez sekcji w skrocie');
    assert.match(zStara, /spraw przeterminowanych: 1, prog 30 dni/);
    assert.ok(!zeSwieza.includes('SPRAWA-CZEKA'), 'sekcja w skrocie bez sprawy przeterminowanej');
    // Drogowskaz do sekcji tylko wtedy, gdy jej nie ma w skrocie.
    assert.ok(zeSwieza.includes('sekcja "Czeka na czlowieka"'));
    assert.ok(!zStara.includes('sekcja "Czeka na czlowieka"'));
  } finally {
    for (const d of [stara, swieza]) fs.rmSync(d, { recursive: true, force: true });
  }
});

test('old project shape: missing sections, numbered and bold headings, CRLF, exit code 0', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'relai-start-digest-stary-'));
  try {
    fs.mkdirSync(path.join(dir, 'docs'));
    const crlf = (s) => s.replace(/\n/g, '\r\n');
    fs.writeFileSync(path.join(dir, 'docs', 'USTAWIENIA.md'), crlf('# USTAWIENIA\n\nWersja RelAI: 1.2.0\n\n'
      + '| Data | Czego dotyczy | Decyzja |\n|---|---|---|\n| 2026-01-01 | Język | polski |\n'));
    fs.writeFileSync(path.join(dir, 'docs', 'STATE.md'), crlf('# STATE\n\n## 2. Gdzie jesteśmy\n\nSTARY-GDZIE.\n\n'
      + '## **Co dalej**\n\n1. STARY-KROK.\n2. DRUGI.\n'));
    fs.writeFileSync(path.join(dir, 'docs', 'DZIENNIK.md'), crlf('# DZIENNIK\n\n### 2026-01-02 — Wpis\n\nSTARY-WPIS.\n'));
    fs.writeFileSync(path.join(dir, 'CLAUDE.md'), crlf('# Stary\n'));

    const r = spawnSync(process.execPath, [NARZEDZIE, dir], { encoding: 'utf8' });
    assert.equal(r.status, 0);
    const t = r.stdout;
    assert.ok(t.includes('STARY-GDZIE') && t.includes('STARY-KROK') && t.includes('STARY-WPIS'));
    assert.ok(!t.includes('DRUGI'), 'numerowana lista: tylko pierwszy punkt');
    assert.ok(!t.includes('\r'), 'CRLF przeszedl do wyjscia');
    for (const brak of ['brak sekcji "Nad czym pracujemy teraz"', 'brak sekcji "Co blokuje"',
      'brak sekcji "Stan otwartych ryzyk"', 'brak pliku docs/LEKCJE.md', 'brak aktywnego planu']) {
      assert.ok(t.includes(brak), 'brak linii: ' + brak);
    }
    // Kontrola pozytywna: sekcje obecne nie daja linii "brak sekcji".
    assert.ok(!t.includes('brak sekcji "Gdzie jestesmy"') && !t.includes('brak sekcji "Co dalej"'));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('outside a RelAI project the digest is one line and exit code 0', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'relai-start-digest-poza-'));
  try {
    assert.equal(startDigest(dir), null);
    const r = spawnSync(process.execPath, [NARZEDZIE, dir], { encoding: 'utf8' });
    assert.equal(r.status, 0);
    assert.match(r.stdout, /nie jest projektem RelAI/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('the project copy from provisionTemplates runs on its own and gives the same digest', () => {
  const dir = projektBiezacy();
  try {
    core.provisionTemplates(dir);
    const kopia = path.join(dir, '.claude', 'relai', 'tools', 'start-digest.js');
    assert.ok(fs.existsSync(kopia) && fs.existsSync(path.join(path.dirname(kopia), 'session-signals.js')));
    const r = spawnSync(process.execPath, [kopia], { cwd: dir, encoding: 'utf8' });
    assert.equal(r.status, 0, r.stderr);
    const zRdzenia = spawnSync(process.execPath, [NARZEDZIE, dir], { encoding: 'utf8' }).stdout;
    assert.equal(r.stdout, zRdzenia);
    assert.ok(r.stdout.includes('GDZIE-TRESC'));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('start budget counts the digest output, not the files it summarises', () => {
  const dir = projektBiezacy();
  try {
    const m = core.startCost(dir, { dzisiaj: DZISIAJ });
    const skrot = startDigest(dir, { dzisiaj: DZISIAJ });
    const claude = fs.statSync(path.join(dir, 'CLAUDE.md')).size;
    // Suma = CLAUDE.md (laduje go harness) + bajty wyjscia skrotu.
    assert.equal(m.suma, claude + Buffer.byteLength(skrot.tekst, 'utf8'));
    // Dlugie "Co dziala" (ok. 8,5 KB) nie wchodzi do pozycji STATE.
    const state = m.pozycje.find((p) => p.id === 'STATE');
    assert.ok(state.bajty < fs.statSync(path.join(dir, 'docs', 'STATE.md')).size / 4, 'STATE liczony jako caly plik');
    assert.deepEqual(m.pozycje.map((p) => p.id), ['CLAUDE', 'STATE', 'ryzyka', 'ustawienia', 'status', 'zasady', 'skrot']);
    assert.equal(m.pozycje.find((p) => p.id === 'status').sciezka, 'docs/plany/PLAN_X/STATUS.md');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('rotatable part counts closed risks as the digest shows them and no withdrawn settings', () => {
  const dir = projektBiezacy();
  try {
    const zamkniety = '| R9 | Zamkniete ryzyko | Niski | ZAMKNIĘTE 2026-10-01 | ' + 'M'.repeat(3000) + ' |';
    const dz = dziennik('2026-10-20').replace('| R2 |', zamkniety + '\n| R2 |');
    fs.writeFileSync(path.join(dir, 'docs', 'DZIENNIK.md'), dz);
    fs.writeFileSync(path.join(dir, 'docs', 'USTAWIENIA.md'), USTAWIENIA
      .replace('włączony · start 100 KB', 'włączony · start 1 KB · ryzyka 1 KB · ustawienia 1 KB')
      .replace('| 2026-10-28 | Budżet', '| 2026-10-28 | Rotacja dokumentów | włączona |\n| 2026-10-28 | Budżet')
      .replace('WYCOFANY-WIERSZ |', 'WYCOFANY-WIERSZ ' + 'W'.repeat(3000) + ' |'));
    const m = core.startCost(dir, { dzisiaj: DZISIAJ });
    const wiersz = '| R9 | Zamkniete ryzyko | Niski | ZAMKNIĘTE 2026-10-01 |';
    // Dokladnie wiersz bez "Mitygacji" plus znak nowej linii — tyle zdejmie rotacja ze skrotu.
    assert.equal(m.rotowalne.ryzyka, Buffer.byteLength(wiersz, 'utf8') + 1);
    assert.equal(m.rotowalneBajty, m.rotowalne.ryzyka);
    assert.ok(!('ustawienia' in m.rotowalne), 'ustawienia wycofane liczone jako rotowalne');
    // Kontrola: wiersz zamkniety naprawde stoi w skrocie, a wycofany nie.
    const t = startDigest(dir, { dzisiaj: DZISIAJ }).tekst;
    assert.ok(t.includes(wiersz) && !t.includes('WYCOFANY-WIERSZ'));
    assert.match(core.startCostReport(m).join('\n'), /zdejmie z warstwy startowej 0\.\d KB: ryzyka ZAMKNIETE/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('helpers: table without the mitigation column, first point of a list', () => {
  const tab = '| # | Ryzyko | Mitigation |\n|---|---|---|\n| R1 | A | M |\ntekst obok\n';
  assert.equal(bezMitygacji(tab), '| # | Ryzyko |\n|---|---|\n| R1 | A |\ntekst obok\n');
  // Tabela bez tej kolumny zostaje nietknieta.
  assert.equal(bezMitygacji('| a | b |\n|---|---|\n'), '| a | b |\n|---|---|\n');
  assert.equal(pierwszyPunkt('\n- jeden\n  dwa\n- trzy'), '- jeden\n  dwa');
  assert.equal(pierwszyPunkt('Akapit jeden.\nciag.\n\nAkapit dwa.'), 'Akapit jeden.\nciag.');
});
