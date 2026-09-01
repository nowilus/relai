#!/usr/bin/env node
'use strict';
// RelAI core / guardrail: secret-scan — czysta logika wykrywania sekretu w tresci.
//
// Ten plik nalezy do RDZENIA: nie wie nic o protokole hookow Claude Code, nie czyta
// stdin, nie zna pojecia "permissionDecision". Zna wylacznie tekst na wejsciu i werdykt
// na wyjsciu. Dzieki temu ta sama regula dziala w trzech miejscach:
//   1) hook PreToolUse adaptera Claude Code (adapters/claude-code/hooks/secret-scanner.js),
//   2) git pre-commit (core/guardrails/pre-commit.js) — niezaleznie od narzedzia,
//   3) wywolanie z reki: node core/guardrails/secret-scan.js <plik...>
//
// Zero zaleznosci npm (D-41 i konwencja repozytorium). Komunikaty CLI celowo bez polskich
// znakow diakrytycznych — ten sam powod co w hookach (L-0016): konsola Windows.

const PATTERNS = [
  { label: 'klucz API w formacie sk-...', re: /\bsk-[A-Za-z0-9_-]{16,}\b/ },
  { label: 'token GitHub (ghp...)', re: /\bghp[_-][A-Za-z0-9]{20,}\b/ },
  { label: 'klucz AWS (AKIA...)', re: /\bAKIA[0-9A-Z]{16}\b/ },
  { label: 'token JWT (eyJ..., trzy segmenty)', re: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/ },
  { label: 'klucz prywatny PEM', re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
];

// Backtick jest znakiem cudzyslowu, nigdy znakiem wartosci. Bez tego rozroznienia zdanie
// dokumentacji o samym guardrailu (`PASSWORD=` / `SECRET=` z wartoscia) wpadalo w ten wzorzec:
// po nazwie stoi backtick i ukosnik, a stara klasa wartosci backticka nie wykluczala, wiec
// znaki miedzy fragmentami kodu wygladaly jak haslo. To jest wyjatek dla linii mowiacej wprost
// o rzeczy sprawdzanej. Przy okazji domyka dziure w druga strone: template literal w JS zostaje
// zlapany, bo otwierajacy backtick konsumuje grupa cudzyslowu. Zmierzone w E6 (Aneks D,
// 2026-09-01) na dziewieciu przypadkach: stary wzorzec myli sie raz, nowy zero razy.
const ASSIGN_RE = /\b(PASSWORD|PASSWD|SECRET|TOKEN|API[_-]?KEY|ACCESS[_-]?KEY)\b\s*[:=]\s*["'`]?([^\s"',;`]{8,})/i;
const PLACEHOLDER_RE = /^(\$|%|<|\{|\*|x{3,}$|your[_-]?|change[_-]?me|placeholder|example|dummy|sample|test[_-]?|todo|tbd|none$|null$|undefined$|\.\.\.|process\.env)/i;

// Adnotacja typu, nie wartosc. Sygnatura funkcji haszujacej haslo — identyfikator, dwukropek,
// typ, nawias zamykajacy i typ zwracany — wpada w ASSIGN_RE, bo klasa wartosci dopuszcza nawias
// i dwukropek, wiec sam typ z domykajacym nawiasem ma osiem znakow. Granica \b na koncu tokenu
// jest tu istotna: typ zakonczony nawiasem pasuje, ale "string1234" (mozliwe haslo) juz nie.
// Zmierzone w pilotazu E6 (2026-08-17): bez tej reguly guardrail blokowal normalny kod
// uwierzytelniania w TypeScripcie, a agent obchodzil blokade, przemianowujac parametr.
const TYPE_TOKEN_RE = /^(string|number|boolean|bigint|symbol|object|any|unknown|never|void|Promise|Record|Array|Readonly|Partial|Buffer)\b/;

// Werdykt: null = brak sekretu, string = etykieta znaleziska.
// Wartosci NIGDY nie zwracamy i nie cytujemy — samo znalezisko wystarczy do decyzji,
// a zacytowany sekret wedrowalby dalej w logach i transkrypcie (D-42).
function scanText(payload) {
  const text = String(payload || '');
  if (!text) return null;
  for (const p of PATTERNS) {
    if (p.re.test(text)) return p.label;
  }
  const m = text.match(ASSIGN_RE);
  if (m && !PLACEHOLDER_RE.test(m[2]) && !TYPE_TOKEN_RE.test(m[2])) {
    return 'przypisanie ' + m[1].toUpperCase() + '= z niepusta wartoscia';
  }
  return null;
}

module.exports = { scanText, PATTERNS };

// --- CLI -------------------------------------------------------------------
// node secret-scan.js <plik...>   -> wypisuje werdykt dla kazdego pliku
// Kod wyjscia: 0 = zaden plik nie ma sekretu, 1 = przynajmniej jeden ma, 2 = blad uzycia.
if (require.main === module) {
  const fs = require('fs');
  const args = process.argv.slice(2);
  if (!args.length) {
    process.stderr.write('Uzycie: node secret-scan.js <plik...>\n');
    process.exit(2);
  }
  let znaleziono = false;
  for (const plik of args) {
    let tresc = '';
    try {
      tresc = fs.readFileSync(plik, 'utf8');
    } catch (e) {
      process.stderr.write('BLAD ODCZYTU  ' + plik + '\n');
      znaleziono = true;
      continue;
    }
    const wynik = scanText(tresc);
    if (wynik) {
      znaleziono = true;
      process.stdout.write('SEKRET  ' + plik + '  (' + wynik + ')\n');
    } else {
      process.stdout.write('BRAK    ' + plik + '\n');
    }
  }
  process.exit(znaleziono ? 1 : 0);
}
