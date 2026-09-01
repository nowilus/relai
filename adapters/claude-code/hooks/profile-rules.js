#!/usr/bin/env node
'use strict';
// RelAI hook: profile-rules — PostToolUse (Write/Edit/MultiEdit), OSTRZEGA (D-41).
// Wykrywa zdarzenie, przy ktorym profil projektu (D-50) dokłada dokument warunkowy:
//   profil app     — pierwszy plik zrodlowy  -> docs/ARCHITEKTURA.md + pytanie o testy (D-25)
//   profil app     — pierwszy plik interfejsu -> docs/DESIGN.md (jedno pytanie o kierunek)
//   profil app     — pierwsza konfiguracja wdrozeniowa -> docs/srodowiska/<NAZWA>.md
//   profil prompty — pierwszy artefakt -> docs/ARTEFAKTY.md; kolejny artefakt spoza rejestru
//                    -> przypomnienie o wpisie
// Profile agent-voice i flow maja wlasna regule (snapshot), ktora ZATRZYMUJE zmiane —
// mieszka w config-protection.js, bo D-41 pozwala blokowac tylko tamtemu hookowi.
//
// Ten hook nigdy nie tworzy dokumentow: narzedzie juz sie wykonalo, a hook wstrzykuje
// przypomnienie do kontekstu tej samej tury. Dokument warunkowy nie powstaje na zapas
// (D-10), wiec hook milczy, gdy dokument juz istnieje.
// Konwencja hook-guard: poza projektem RelAI wyjscie kodem 0 bez efektu.
// Komunikaty celowo bez polskich znakow diakrytycznych (L-0016).

const fs = require('fs');
const path = require('path');

function isGuest(cwd) {
  try {
    const p = path.join(cwd, '.claude', 'relai.json');
    if (!fs.existsSync(p)) return false;
    const j = JSON.parse(fs.readFileSync(p, 'utf8'));
    return !!j && j.mode === 'guest';
  } catch (_) {
    return true;
  }
}

function relaiMarkerFile(cwd) {
  try {
    if (!cwd || isGuest(cwd)) return null;
    const docsDir = path.join(cwd, 'docs');
    let entries = [];
    try { entries = fs.readdirSync(docsDir); } catch (_) { return null; }
    const candidates = [];
    for (const name of ['USTAWIENIA.md', 'SETTINGS.md']) {
      if (entries.includes(name)) candidates.push(name);
    }
    for (const f of entries) {
      if (/\.md$/i.test(f) && !candidates.includes(f)) candidates.push(f);
      if (candidates.length >= 40) break;
    }
    for (const f of candidates) {
      let head = '';
      try { head = fs.readFileSync(path.join(docsDir, f), 'utf8').slice(0, 4000); } catch (_) { continue; }
      if (/Wersja RelAI:|RelAI version:/i.test(head)) return path.join(docsDir, f);
    }
    return null;
  } catch (_) {
    return null;
  }
}

// Profil czytamy WYLACZNIE z pliku ustawien — to jedyne miejsce, ktore go trzyma.
// Wartosc musi STAC NA POCZATKU kolumny "Decyzja" (SPEC_USTAWIENIA.md); opis w nawiasie
// jest pomijany. Dopasowanie gdziekolwiek w linii trafialoby w proze ("odpowiednik profilu
// prompty/artefakty") i wlaczalo cudze reguly. Brak jednoznacznej wartosci = cisza.
function projectProfile(markerFile) {
  let txt = '';
  try { txt = fs.readFileSync(markerFile, 'utf8'); } catch (_) { return ''; }
  for (const line of txt.split('\n')) {
    if (!/Profil projektu|Project profile/i.test(line)) continue;
    const komorki = line.split('|').map((c) => c.trim()).filter(Boolean);
    const decyzja = komorki[komorki.length - 1] || '';
    const m = decyzja.match(/^\**\s*`?(agent-voice|flow|prompty|prompts|app)\b/i);
    if (m) return m[1].toLowerCase() === 'prompts' ? 'prompty' : m[1].toLowerCase();
  }
  return '';
}

function hasSetting(markerFile, re) {
  try { return re.test(fs.readFileSync(markerFile, 'utf8')); } catch (_) { return false; }
}

function existsAny(cwd, relPaths) {
  return relPaths.some((r) => fs.existsSync(path.join(cwd, r)));
}

function katalogMaPliki(cwd, relDir) {
  try {
    return fs.readdirSync(path.join(cwd, relDir)).some((f) => /\.md$/i.test(f));
  } catch (_) {
    return false;
  }
}

// Sciezka wzgledna projektu, zawsze z ukosnikami w przod (Windows).
function relPosix(cwd, filePath) {
  return path.relative(cwd, path.resolve(cwd, filePath)).split(path.sep).join('/');
}

const POZA_PROJEKTEM = /^(\.\.|docs\/|\.claude\/|\.git\/|node_modules\/|dist\/|build\/|out\/|coverage\/|vendor\/|target\/|\.next\/|\.venv\/)/i;

// Konfiguracje narzedzi deweloperskich nie sa "pierwszym kodem".
const KONFIG_NARZEDZI = /(^|\/)(\.[^/]+|[^/]*\.config\.(js|cjs|mjs|ts)|next\.config\.[^/]+|vite\.config\.[^/]+|webpack\.config\.[^/]+|rollup\.config\.[^/]+|jest\.config\.[^/]+|babel\.config\.[^/]+|tailwind\.config\.[^/]+|postcss\.config\.[^/]+)$/i;

const ZRODLOWE = /\.(js|jsx|ts|tsx|mjs|cjs|mts|cts|py|go|rs|java|kt|kts|cs|rb|php|swift|c|h|cc|cpp|hpp|m|mm|scala|ex|exs|dart|lua|sql|sh|ps1|vue|svelte)$/i;
// Ta sama lista co w design-quality-check — oba hooki musza rozumiec "plik interfejsu" tak samo.
const INTERFEJS = /\.(css|scss|sass|less|html|jsx|tsx|vue|svelte)$/i;

function jestKonfiguracjaWdrozeniowa(rel) {
  const nazwa = rel.split('/').pop() || '';
  if (/^Dockerfile(\..+)?$/i.test(nazwa)) return true;
  if (/^docker-compose.*\.(yml|yaml)$/i.test(nazwa)) return true;
  if (/^(vercel\.json|netlify\.toml|fly\.toml|railway\.json|render\.yaml|app\.yaml|Procfile|Jenkinsfile|azure-pipelines\.yml)$/i.test(nazwa)) return true;
  if (/\.(tf|tfvars)$/i.test(nazwa)) return true;
  if (/^\.github\/workflows\/.+\.(yml|yaml)$/i.test(rel)) return true;
  if (/^\.gitlab-ci\.yml$/i.test(rel) || /^\.circleci\/config\.(yml|yaml)$/i.test(rel)) return true;
  if (/^(k8s|kubernetes|deploy|deployment|charts|helm)\/.+\.(yml|yaml)$/i.test(rel)) return true;
  return false;
}

// Artefakt profilu prompty: tekst poza docs/, bez plikow rdzenia projektu.
// .mdc to regula adaptera Cursora — czytana przez model jak skill, wiec jest artefaktem.
// Bez niej trzy reguly Cursora nie wyzwalaly reguly profilu ani razu (pomiar 2026-09-01).
function jestArtefaktem(rel) {
  const nazwa = rel.split('/').pop() || '';
  if (/^(CLAUDE|README|LICENSE|CHANGELOG|CONTRIBUTING)\.md$/i.test(nazwa)) return false;
  return /\.(md|mdc|txt|prompt|tmpl|j2)$/i.test(rel);
}

function warn(text) {
  console.log(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PostToolUse',
      additionalContext: '[RelAI profile-rules — OSTRZEZENIE, operacja wykonana] ' + text,
    },
  }));
  process.exit(0);
}

const SPEC_SKAD = ' Specyfikacje sa w .claude/relai/templates/ (gdy ich tam nie ma, powiedz o tym ' +
  'jednym zdaniem i popros o sesje z --add-dir na katalog pluginu — nie generuj z pamieci).';

function regulyApp(cwd, markerFile, rel, komunikaty) {
  const jestZrodlo = ZRODLOWE.test(rel) && !KONFIG_NARZEDZI.test(rel);
  const jestUI = INTERFEJS.test(rel);

  if (jestZrodlo && !existsAny(cwd, ['docs/ARCHITEKTURA.md', 'docs/ARCHITECTURE.md'])) {
    let t = 'Profil app, zdarzenie "pierwszy kod": w projekcie pojawil sie plik zrodlowy "' + rel +
      '", a docs/ARCHITEKTURA.md nie istnieje. Utworz go w TEJ SAMEJ turze wedlug SPEC_ARCHITEKTURA.md ' +
      '— opisz to, co wlasnie powstalo, nie architekture docelowa.';
    if (!hasSetting(markerFile, /Podej[sś]cie do test|Testing approach|\|\s*Testy\s*\||\|\s*Tests\s*\|/i)) {
      t += ' Zadaj tez JEDNO pytanie o podejscie do testow (D-25) z rekomendacja: pelny TDD / testy ' +
        'krytycznych sciezek / bez testow — odpowiedz zapisz w pliku ustawien projektu.';
    }
    komunikaty.push(t);
  }

  if (jestUI && !fs.existsSync(path.join(cwd, 'docs', 'DESIGN.md'))) {
    komunikaty.push('Profil app, zdarzenie "pierwszy interfejs": plik "' + rel +
      '" dotyczy warstwy wizualnej, a docs/DESIGN.md nie istnieje. Zadaj JEDNO krotkie pytanie ' +
      'o kierunek wizualny (cechy pozytywne, nie lista zakazow) i utworz DESIGN.md wedlug SPEC_DESIGN.md ' +
      'w tej samej turze.');
  }

  if (jestKonfiguracjaWdrozeniowa(rel) &&
      !katalogMaPliki(cwd, 'docs/srodowiska') && !katalogMaPliki(cwd, 'docs/environments')) {
    komunikaty.push('Profil app, zdarzenie "pierwsze wdrozenie": pojawila sie konfiguracja wdrozeniowa "' +
      rel + '", a docs/srodowiska/ jest puste. Utworz docs/srodowiska/<NAZWA>.md wedlug SPEC_SRODOWISKA.md: ' +
      'adres, WSKAZANIE dostepow (nigdy wartosci — D-42), procedura wdrozenia i procedura cofniecia. ' +
      'Nazwe srodowiska ustal z uzytkownikiem, jesli nie wynika z pliku.');
  }
}

function regulyPrompty(cwd, rel, komunikaty) {
  if (!jestArtefaktem(rel)) return;
  const rejestr = ['docs/ARTEFAKTY.md', 'docs/ARTIFACTS.md'].find((r) => fs.existsSync(path.join(cwd, r)));

  if (!rejestr) {
    komunikaty.push('Profil prompty, zdarzenie "pierwszy artefakt": powstal artefakt "' + rel +
      '", a rejestru wersji nie ma. Utworz docs/ARTEFAKTY.md wedlug SPEC_PROFILE.md (sekcja "Profil prompty"): ' +
      'artefakt, plik, wersja, data, co sie zmienilo, po co.');
    return;
  }

  let tresc = '';
  try { tresc = fs.readFileSync(path.join(cwd, rejestr), 'utf8'); } catch (_) { return; }
  const nazwa = rel.split('/').pop() || '';
  if (tresc.indexOf(rel) === -1 && tresc.indexOf(nazwa) === -1) {
    komunikaty.push('Profil prompty: artefakt "' + rel + '" nie ma wpisu w ' + rejestr +
      '. Dopisz go (wersja 1) albo podbij wersje istniejacego wpisu — z jednym zdaniem "co sie zmienilo" ' +
      'i jednym "po co".');
  }
}

function main(input) {
  const cwd = input.cwd || process.cwd();
  const markerFile = relaiMarkerFile(cwd);
  if (!markerFile) return process.exit(0);

  const profil = projectProfile(markerFile);
  if (profil !== 'app' && profil !== 'prompty') return process.exit(0);

  const ti = input.tool_input || {};
  const filePath = String(ti.file_path || '');
  if (!filePath) return process.exit(0);

  const rel = relPosix(cwd, filePath);
  if (!rel || POZA_PROJEKTEM.test(rel)) return process.exit(0);

  const komunikaty = [];
  if (profil === 'app') regulyApp(cwd, markerFile, rel, komunikaty);
  else regulyPrompty(cwd, rel, komunikaty);

  if (!komunikaty.length) return process.exit(0);
  warn(komunikaty.join('\n---\n') + SPEC_SKAD);
}

let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (d) => { raw += d; });
process.stdin.on('error', () => process.exit(0));
process.stdin.on('end', () => {
  try { main(JSON.parse(raw || '{}')); } catch (_) { process.exit(0); }
});
