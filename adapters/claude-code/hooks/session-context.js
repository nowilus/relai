#!/usr/bin/env node
'use strict';
// RelAI hook: session-context — CICHY (D-40). Dwa zdarzenia, jeden plik
// (wzorzec z planu 5.2, jak doc-sync-reminder: PostToolUse/Stop):
//
// 1) SessionStart — wlasciwa mitygacja ryzyka R2: w projekcie RelAI wstrzykuje
//    date dnia, kontrole wersji projekt vs plugin, wymuszenie rytualu startu,
//    siatke brakujacych promptow etapowych (D-34), sygnal rozjazdu stanu
//    (STATUS vs CLAUDE.md vs STATE.md — od 1.3.0), tresc ustawien globalnych
//    (~/.claude/relai/ — D-23, L-0010) oraz kopiuje specyfikacje dokumentow
//    do .claude/relai/templates/ w projekcie (R8, L-0012) — od 1.4.0 zrodlem jest
//    core/templates/ rdzenia, nie katalog adaptera.
// 2) PostToolUse na narzedziu Skill — gdy wywolany skill nalezy do RelAI
//    (relai-core / relai-planning), kopiuje specyfikacje i podaje ustawienia
//    globalne TAKZE w folderze, ktory nie jest jeszcze projektem RelAI —
//    bez tego inicjalizacja nie ma z czego generowac (R8). Guard dla tego
//    zdarzenia brzmi: "czy wywolano skill RelAI", bo samo wywolanie skilla
//    jest swiadomym uzyciem pluginu przez uzytkownika; w sesjach, ktore
//    RelAI nie uzywaja, hook milczy jak kazdy inny.
//
// "Cichy" znaczy: nie zagaduje uzytkownika; dostarcza kontekst agentowi.
// Komunikaty celowo bez polskich znakow diakrytycznych (bezpieczenstwo kodowania
// konsoli Windows) — to swiadoma decyzja, nie przeoczenie.
//
// Od 1.5.0 same ROZPOZNANIA (marker, tryb goscia, wersja projektu, luka promptu,
// rozjazd stanu, nieznany autor, ustawienia globalne, prowizjonowanie specyfikacji)
// mieszkaja w rdzeniu: core/process/session-signals.js. Tutaj zostaje wylacznie to,
// co jest wlasciwoscia Claude Code — protokol zdarzen i brzmienie komunikatow.

const fs = require('fs');
const path = require('path');

// Od 1.4.0 hooki mieszkaja w adapters/claude-code/hooks/, a specyfikacje w core/templates/
// (wydzielenie rdzenia, E4). PLUGIN_ROOT to korzen repozytorium/pluginu — trzy poziomy w gore.
const PLUGIN_ROOT = path.resolve(__dirname, '..', '..', '..');
const CORE_TEMPLATES = path.join(PLUGIN_ROOT, 'core', 'templates');

// Awaria require rdzenia jest traktowana jak awaria guarda: hook milknie.
let core;
try {
  core = require(path.join(PLUGIN_ROOT, 'core', 'process', 'session-signals.js'));
} catch (_) {
  process.exit(0);
}

// Marker trybu goscia w adapterze Claude Code to wylacznie .claude/relai.json.
const MARKERY_GOSCIA = ['.claude/relai.json'];
const isGuest = (cwd) => core.isGuest(cwd, MARKERY_GOSCIA);
const relaiMarkerFile = (cwd) => core.relaiMarkerFile(cwd, MARKERY_GOSCIA);
const provisionTemplates = (cwd) => core.provisionTemplates(cwd, {
  coreTemplates: CORE_TEMPLATES,
  destRel: '.claude/relai',
});

function pluginVersion() {
  try {
    const j = JSON.parse(fs.readFileSync(path.join(PLUGIN_ROOT, '.claude-plugin', 'plugin.json'), 'utf8'));
    return String(j.version || '');
  } catch (_) {
    return '';
  }
}

function onSessionStart(input) {
  const cwd = input.cwd || process.cwd();
  const markerFile = relaiMarkerFile(cwd);
  if (!markerFile) return process.exit(0);

  const out = [];
  out.push('[RelAI session-context]');
  out.push('Data dzisiejsza: ' + core.todayLocal() + '. Daty do wpisow bierz stad, nie z pamieci modelu.');

  const pv = core.projectVersion(markerFile);
  const gv = pluginVersion();
  if (pv && gv && pv !== gv) {
    out.push('Wersja RelAI projektu (' + pv + ') rozni sie od wersji pluginu (' + gv +
      '). Zglos to uzytkownikowi jednym zdaniem i wskaz komende /relai-update — pokaze roznice i zaktualizuje projekt za zgoda, szanujac lokalne nadpisania. Nie migruj projektu recznie.');
  }

  // Sygnaly wymagajace dzialania ida PRZED instrukcja rytualu. Zmierzone w E10:
  // sygnal umieszczony po niej byl przez slabsze modele czytany jako tlo — sesja
  // wykonywala rytual, a propozycji nie skladala wcale albo skladala inna.
  const gap = core.promptGap(cwd);
  if (gap) {
    out.push('ZADANIE PIERWSZE (siatka D-34). Etap ' + gap.stage + ' w ' + gap.statusFile +
      ' ma status GOTOWY DO STARTU, ale jego prompt etapowy nie istnieje. Pierwsze zdanie Twojej ' +
      'odpowiedzi — jeszcze PRZED akapitem "gdzie jestesmy" — mowi o tej luce i proponuje ' +
      'dogenerowanie promptu. Nie generuj go bez zgody (po zgodzie robi to relai-planning).');
  }

  const rozjazd = core.stateDrift(cwd);
  if (rozjazd) {
    out.push('ZADANIE PIERWSZE (rozjazd stanu). Dokumenty tego projektu mowia rozne rzeczy: ' +
      rozjazd.join('; ') + '. Zglos to uzytkownikowi JEDNYM zdaniem przed akapitem "gdzie jestesmy" ' +
      'i zapytaj, ktory zapis jest prawdziwy — nie prostuj zadnego dokumentu na wlasna reke, bo nie ' +
      'wiesz, czy etap trwa, czy sie urwal. To jedyne miejsce, w ktorym ten sygnal pada: nie powtarzaj ' +
      'go z rytualu startu.');
  }

  const obcy = core.unknownAuthor(cwd);
  if (obcy) {
    out.push('ZADANIE PIERWSZE (nieznany autor, D-27). git user.name to "' + obcy.ja + '", a zaden z ' +
      obcy.wpisow + ' podpisow w dzienniku go nie zawiera (ostatni: "' + obcy.ostatni + '") — to cudzy ' +
      'projekt. Pierwsze zdanie Twojej odpowiedzi — jeszcze PRZED akapitem "gdzie jestesmy" i przed ' +
      'odpowiedzia na pytanie uzytkownika — mowi, ze wpisy podpisal kto inny, i proponuje wycieczke ' +
      'po projekcie (stan, mapa dokumentow, plany, ryzyka, od czego zaczac). Potem CZEKASZ na zgode: ' +
      'wycieczki nie uruchamiasz sam i nie zastepujesz jej wlasnym pomyslem (przegladem kodu, ' +
      'analiza struktury). Po zgodzie wykonujesz procedure komendy /relai-tour. Odmowa zamyka temat ' +
      'na te sesje.');
  }

  // Budzet warstwy startowej (1.6.0). Ponizej progu funkcja zwraca pusta liste i w
  // kontekscie startu nie pojawia sie ani jeden znak — cisza jest zachowaniem domyslnym.
  // Claude Code nie daje w payloadzie SessionStart zadnego zmierzonego rozroznienia
  // sesji interaktywnej od `claude -p`, wiec opcji `interaktywna` tu nie podajemy:
  // zgadywanie byloby gorsze niz zdanie propozycji wypisane do sesji bez czlowieka.
  for (const linia of core.startCostReport(core.startCost(cwd, { markeryGoscia: MARKERY_GOSCIA }))) {
    out.push(linia);
  }

  // Przeglad spraw czekajacych na czlowieka (1.7.0). Nosnikiem jest hook, nie skill:
  // wykrycie ma dzialac przy kazdym modelu i bez wyzwalania czegokolwiek (L-0030, ryzyko R2).
  // Nic przeterminowanego = zero znakow. Wylacznik jest OSOBNY od rotacji (Aneks A).
  for (const linia of core.sprawyPrzeterminowaneReport(
    core.sprawyPrzeterminowane(cwd, { markeryGoscia: MARKERY_GOSCIA }))) {
    out.push(linia);
  }

  // Artefakty robocze (1.8.0). Stoja PO raportach wymagajacych dzialania i po sprawach
  // czekajacych na czlowieka: to propozycja, nie zadanie — kolejnosc idzie od zadan przez
  // raporty do propozycji. Ponizej progu i bez wiersza w ustawieniach = zero znakow.
  for (const linia of core.artefaktyRoboczeReport(
    core.artefaktyRobocze(cwd, { markeryGoscia: MARKERY_GOSCIA }))) {
    out.push(linia);
  }

  out.push('Ten folder to projekt RelAI. Zanim odpowiesz merytorycznie, wykonaj rytual startu sesji: ' +
    'przeczytaj CLAUDE.md, docs/STATE.md (jesli istnieje), docs/DZIENNIK.md (sekcja ryzyk + ostatni wpis), ' +
    'docs/LEKCJE.md (tylko "Zasady aktywne"), docs/USTAWIENIA.md oraz STATUS.md aktywnego planu; ' +
    'potem napisz akapit "gdzie jestesmy". Jesli dostepny jest skill relai-core, wywolaj go — ' +
    'ta instrukcja obowiazuje takze wtedy, gdy skill sie nie wyzwolil.');

  const copied = provisionTemplates(cwd);
  if (copied > 0) {
    out.push('Specyfikacje dokumentow RelAI sa skopiowane lokalnie do .claude/relai/templates/ (' + copied +
      ' plikow). Czytaj je stamtad — katalog pluginu jest poza zasiegiem sesji.');
  }

  const gs = core.globalSettingsText('.claude/relai');
  if (gs) {
    out.push('Ustawienia globalne uzytkownika (' + gs.file + '; wpis projektowy w docs/USTAWIENIA.md ma pierwszenstwo):\n' + gs.text);
  }

  process.stdout.write(out.join('\n'));
  process.exit(0);
}

function onSkillInvoked(input) {
  const ti = input.tool_input || {};
  const skillName = String(ti.skill || ti.name || '');
  if (!/(^|:)relai-(core|planning)\b/.test(skillName)) return process.exit(0);

  const cwd = input.cwd || process.cwd();
  if (isGuest(cwd)) return process.exit(0); // tryb goscia = jak brak struktury

  const parts = [];
  const copied = provisionTemplates(cwd);
  if (copied > 0) {
    parts.push('[RelAI session-context] Specyfikacje dokumentow RelAI sa skopiowane lokalnie do ' +
      '.claude/relai/templates/ (' + copied + ' plikow). Generuj dokumenty wedlug nich — katalog pluginu ' +
      'jest poza zasiegiem sesji, wiec nie probuj czytac go bezposrednio.');
  }
  const gs = core.globalSettingsText('.claude/relai');
  if (gs) {
    parts.push('Ustawienia globalne uzytkownika (' + gs.file + '; wpis projektowy ma pierwszenstwo):\n' + gs.text);
  }
  if (!parts.length) return process.exit(0);

  console.log(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PostToolUse',
      additionalContext: parts.join('\n'),
    },
  }));
  process.exit(0);
}

function main(input) {
  const event = String(input.hook_event_name || '');
  if (event === 'SessionStart') return onSessionStart(input);
  if (event === 'PostToolUse' && String(input.tool_name || '') === 'Skill') return onSkillInvoked(input);
  process.exit(0);
}

let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (d) => { raw += d; });
process.stdin.on('error', () => process.exit(0));
process.stdin.on('end', () => {
  try { main(JSON.parse(raw || '{}')); } catch (_) { process.exit(0); }
});
