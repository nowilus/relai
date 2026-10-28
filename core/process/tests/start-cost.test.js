'use strict';

// Budzet startu (E2 planu PROWADZENIE_END_TO_END, pozycja A11): startCost() liczy takze skill
// wymuszany na pierwszym prompcie (sciezke podaje adapter) i pliki wymienione w rytuale startu
// CLAUDE.md projektu, ktorych szesc stalych pozycji jeszcze nie mierzy. Fixture w katalogu
// tymczasowym, zeby wynik nie zalezal od stanu tego repozytorium.

const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const core = require('../session-signals.js');

const USTAWIENIA = '# USTAWIENIA\n\nWersja RelAI: 2.3.1 · zainicjowano: 2026-09-24\n\n'
  + '| Data | Czego dotyczy | Decyzja |\n|---|---|---|\n'
  + '| 2026-09-24 | Budżet startu sesji | włączony · start 1 KB |\n';

const CLAUDE = '# Projekt\n\n## Rytuał startu sesji\n\n'
  + '1. Ten plik.\n'
  + '2. [docs/STATE.md](docs/STATE.md) — stan.\n'
  + '3. [docs/NOTATKI.md](docs/NOTATKI.md) — notatki projektu.\n'
  + '4. [docs/BRAK.md](docs/BRAK.md) — plik, ktorego nie ma.\n'
  + '5. [docs/USTAWIENIA.md](docs/USTAWIENIA.md) — preferencje.\n\n'
  + '**Frazy sesji:** pelna sciaga: [docs/KOMENDY.md](docs/KOMENDY.md).\n\n'
  + '## Reguly\n\n1. [docs/POZA.md](docs/POZA.md) — lista poza rytualem.\n';

function projekt() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'relai-start-cost-'));
  fs.mkdirSync(path.join(dir, 'docs'));
  fs.writeFileSync(path.join(dir, 'docs', 'USTAWIENIA.md'), USTAWIENIA);
  fs.writeFileSync(path.join(dir, 'CLAUDE.md'), CLAUDE);
  fs.writeFileSync(path.join(dir, 'docs', 'STATE.md'), 'stan\n');
  fs.writeFileSync(path.join(dir, 'docs', 'NOTATKI.md'), 'x'.repeat(700));
  fs.writeFileSync(path.join(dir, 'docs', 'KOMENDY.md'), 'k'.repeat(900));
  fs.writeFileSync(path.join(dir, 'docs', 'POZA.md'), 'p'.repeat(800));
  fs.mkdirSync(path.join(dir, 'skills', 'relai-core'), { recursive: true });
  const skill = path.join(dir, 'skills', 'relai-core', 'SKILL.md');
  fs.writeFileSync(skill, 's'.repeat(1234));
  return { dir, skill };
}

test('startCost counts the forced skill and the extra files of the start ritual', () => {
  const { dir, skill } = projekt();
  try {
    const m = core.startCost(dir, { skille: [skill] });
    const po = Object.fromEntries(m.pozycje.map((p) => [p.id, p]));

    // Kontrola pozytywna: szesc stalych pozycji dalej liczonych (tu: CLAUDE, STATE, ustawienia).
    assert.ok(po.CLAUDE && po.STATE && po.ustawienia, 'stale pozycje zniknely');
    // Skill: sciezka od adaptera, caly plik.
    assert.equal(po['skill relai-core'].bajty, 1234);
    // Rytual: tylko plik z numerowanej listy, ktorego stale pozycje nie mierza.
    assert.equal(po['rytual docs/NOTATKI.md'].bajty, 700);
    const ids = m.pozycje.map((p) => p.id);
    assert.ok(!ids.some((i) => /STATE\.md|USTAWIENIA\.md/.test(i)), 'plik liczony dwa razy');
    assert.ok(!ids.some((i) => /KOMENDY|POZA|BRAK/.test(i)), 'plik spoza listy rytualu albo nieistniejacy');
    // Suma = wszystkie pozycje.
    assert.equal(m.suma, m.pozycje.reduce((s, p) => s + p.bajty, 0));
    // Nowe pozycje nie maja progu czastkowego, wiec nie trafiaja do "ponad progiem".
    assert.ok(!m.ponadProgiem.includes('skill relai-core'));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('startCost without the skill option measures the same as before, plus ritual files', () => {
  const { dir, skill } = projekt();
  try {
    const bez = core.startCost(dir, {});
    const z = core.startCost(dir, { skille: [skill] });
    assert.equal(z.suma - bez.suma, 1234);
    // Sciezka nieistniejaca nie jest awaria i nie jest zerem w sumie.
    const zla = core.startCost(dir, { skille: [path.join(dir, 'nie-ma.md')] });
    assert.equal(zla.suma, bez.suma);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('startCostReport names what the sum is made of', () => {
  const { dir, skill } = projekt();
  try {
    const linie = core.startCostReport(core.startCost(dir, { skille: [skill] }));
    const skladniki = linie.find((l) => /^W sumie:/.test(l));
    assert.ok(skladniki, 'brak linii skladnikow sumy: ' + JSON.stringify(linie));
    assert.match(skladniki, /skill relai-core/);
    assert.match(skladniki, /rytual docs\/NOTATKI\.md/);
    // Pozycja bez progu czastkowego nie dostaje zmyslonego "prog 0 KB" w linii najgrubszych.
    assert.ok(!linie.some((l) => /prog 0 KB/.test(l)), 'zmyslony prog: ' + JSON.stringify(linie));
    assert.ok(!/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/.test(linie.join('\n')), 'raport ma byc w ASCII (L-0016)');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

// KONTEKST_STARTU E1: "Zaproponuj rotacje" pada tylko wtedy, gdy rotacja cos zdejmie z warstwy
// startowej. Ten sam projekt w dwoch wariantach: same ryzyka OTWARTE (czesc rotowalna 0)
// i jedno ryzyko ZAMKNIETE (czesc rotowalna > 0). Sekcja ryzyk ponad progiem w obu.
const USTAWIENIA_ROTACJA = '# USTAWIENIA\n\nWersja RelAI: 3.6.0 · zainicjowano: 2026-10-28\n\n'
  + '| Data | Czego dotyczy | Decyzja |\n|---|---|---|\n'
  + '| 2026-10-28 | Budżet startu sesji | włączony · start 1 KB · ryzyka 1 KB |\n'
  + '| 2026-10-28 | Rotacja dokumentów | włączona |\n';

function dziennikRyzyk(statusDrugiego) {
  const wiersz = (nr, status) => '| ' + nr + ' | ' + 'ryzyko '.repeat(40) + '| Niski | ' + status
    + ' | ' + 'mitygacja '.repeat(30) + '|\n';
  return '# DZIENNIK — Projekt\n\n## Stan otwartych ryzyk\n\n'
    + '| # | Ryzyko | Poziom | Status | Mitygacja |\n|---|---|---|---|---|\n'
    + wiersz('R1', 'OTWARTE') + wiersz('R2', statusDrugiego) + wiersz('R3', 'OTWARTE')
    + '\n## Wpisy\n\n### 2026-10-28 — Wpis\n\nTresc.\n';
}

function projektRotacji(statusDrugiego) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'relai-start-cost-rot-'));
  fs.mkdirSync(path.join(dir, 'docs'));
  fs.writeFileSync(path.join(dir, 'docs', 'USTAWIENIA.md'), USTAWIENIA_ROTACJA);
  fs.writeFileSync(path.join(dir, 'CLAUDE.md'), '# Projekt\n\nAktywny plan: brak\n');
  fs.writeFileSync(path.join(dir, 'docs', 'DZIENNIK.md'), dziennikRyzyk(statusDrugiego));
  return dir;
}

test('startCostReport proposes rotation only when rotation would remove something', () => {
  const zero = projektRotacji('OTWARTE');
  const wiecej = projektRotacji('ZAMKNIĘTE 2026-10-28');
  try {
    const mZero = core.startCost(zero, {});
    const mWiecej = core.startCost(wiecej, {});
    // Oba warianty przekraczaja budzet — roznica jest wylacznie w czesci rotowalnej.
    assert.ok(mZero.przekroczonaSuma && mWiecej.przekroczonaSuma, 'fixtura nie przekracza budzetu');
    assert.equal(mZero.rotowalneBajty, 0);
    assert.ok(mWiecej.rotowalne.ryzyka > 0, 'zamkniete ryzyko nie liczy sie jako rotowalne');

    const rZero = core.startCostReport(mZero).join('\n');
    const rWiecej = core.startCostReport(mWiecej).join('\n');
    // Dowod negatywny: przy czesci rotowalnej 0 nie ma propozycji, jest zdanie, ze nic nie zdejmie.
    assert.ok(!/Zaproponuj rotacj/.test(rZero), 'propozycja przy czesci rotowalnej 0: ' + rZero);
    assert.match(rZero, /Rotacja nic tu nie zdejmie/);
    // Kontrola pozytywna w tym samym przebiegu.
    assert.match(rWiecej, /Zaproponuj rotacje dziennika/);
    assert.match(rWiecej, /ryzyka ZAMKNIETE/);

    // Aneks A: linia progow dokumentow nie proponuje rotacji ryzyk, gdy zadne nie jest zamkniete.
    assert.match(rZero, /zamykanie ryzyk \(zadne nie jest ZAMKNIETE/);
    assert.ok(!/rotacja ryzyk ZAMKNIETYCH/.test(rZero), 'pusta rotacja ryzyk: ' + rZero);
    assert.match(rWiecej, /rotacja ryzyk ZAMKNIETYCH do archiwum/);
    assert.ok(!/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/.test(rZero + rWiecej), 'raport ma byc w ASCII (L-0016)');
  } finally {
    for (const d of [zero, wiecej]) fs.rmSync(d, { recursive: true, force: true });
  }
});

// KONTEKST_STARTU E5: progi domyslne stoja w SPEC_USTAWIENIA (jedyne zrodlo prawdy) i w kopii
// wykonawczej PROGI_DOMYSLNE. Projekt z samym "wlaczony" dostaje dokladnie wartosci ze specyfikacji.
test('default start budget thresholds equal the SPEC_USTAWIENIA row (start 55, zasady 5)', () => {
  const spec = fs.readFileSync(path.join(__dirname, '..', '..', 'templates', 'SPEC_USTAWIENIA.md'), 'utf8');
  const wiersz = spec.split(/\r?\n/).find((l) => /^włączony · start \d+ KB/.test(l));
  assert.ok(wiersz, 'brak wiersza wzorcowego w SPEC_USTAWIENIA');
  const zSpec = {};
  for (const m of wiersz.matchAll(/(\S+) (\d+) KB/g)) zSpec[m[1]] = Number(m[2]);
  assert.equal(Object.keys(zSpec).length, 7, 'kontrola pozytywna: siedem czlonow w wierszu');
  const { dir } = projekt();
  try {
    fs.writeFileSync(path.join(dir, 'docs', 'USTAWIENIA.md'), USTAWIENIA.replace('włączony · start 1 KB', 'włączony'));
    assert.deepEqual(core.startCost(dir, { dzisiaj: '2026-10-28' }).progi, zSpec);
    assert.equal(zSpec.start, 55);
    assert.equal(zSpec.zasady, 5);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
