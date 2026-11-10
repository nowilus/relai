# E4 — Guardy Claude Code: ciche awarie, zasięg projektu, końce linii

Konwencje wspólne: [00_KONWENCJE.md](00_KONWENCJE.md). Ten etap zmienia **hooki adaptera Claude Code**
(`adapters/claude-code/hooks/`), jedno zdanie skilla `relai-core` i dodaje trzy pliki testów
w `core/process/tests/`. Rdzenia (`core/guardrails/`, `core/process/*.js`) nie zmienia.

- **Karty w kolejności wykonania:** K-C10 → K-C4 → K-C6. K-C10 jest pierwsza, bo zaczyna się od
  testu, który rozstrzyga, czy w ogóle jest co naprawiać, i dotyka jednej funkcji; K-C4 przechodzi
  przez wszystkie czternaście hooków i ustala wzorzec śladu, którego używa K-C6; K-C6 zmienia
  komunikat i warunki w plikach już przerobionych przez K-C4.
- **Efekt widoczny:** na fiksturze hook ochronny z zepsutym wejściem odpowiada pytaniem `ask`
  i linią `[RelAI secret-scanner] blad: SyntaxError` na stderr zamiast cichego kodu 0; blok startu
  sesji przeżywa awarię jednego raportu; skrypt zapisany w `%TEMP%` nie dostaje ostrzeżeń projektu.
  W sesji zachowanie zmieni się dopiero po wydaniu (sekcja „Pułapki” każdej karty).
- **Szacunek:** SZACUNEK 1–2 sesje (K-C4 dotyka czternastu plików, ale każda zmiana jest mechaniczna).
- **Warunki zatrzymania:** kotwica z karty nie pasuje do pliku; test „najpierw” jest czerwony
  z innego powodu niż asercja (błąd składni, brak modułu); test K-C10 daje wynik inny niż opisany
  w ścieżce A albo B; liczba testów w którymkolwiek zestawie spada; `validate-adapters.js` kończy się
  kodem innym niż 0.
- **Weryfikacja etapu** (FAKT stanu wyjściowego: `core/process` 357, `core/guardrails` 33 (stan po E03),
  `adapters/codex/tests` 24, walidator kod 0 z jednym ostrzeżeniem i linią `wywolania z hooks.json: 18`):

  ```bash
  node --test "core/process/tests/*.test.*"      # 372 zielone (357 + 6 K-C4 + 6 K-C6 + 3 K-C10)
  node --test "core/guardrails/tests/*.test.js"  # 33 zielone (stan po E03), bez zmian
  node --test "adapters/codex/tests/*.test.js"   # 24 zielone (kopia skilla po generatorze)
  node core/tools/validate-adapters.js           # kod 0, jedno ostrzezenie (security-audit), "wywolania z hooks.json: 18"
  git status --short                             # wylacznie pliki z pol "Pliki" trzech kart
  ```

  `core/process/tests` trwa ok. 110 s — uruchamiaj w tle albo z limitem 10 minut.

---

## K-C10 — `CLAUDE.md` z końcami CRLF a sekcja niemutowalna

- **Cel:** edycja albo zapis sekcji niemutowalnej `CLAUDE.md` zapisanego z końcami CRLF wraca jako
  pytanie `ask` tak samo jak przy LF, a zapis całego pliku z niezmienioną sekcją nie pyta.
- **Pliki:** `core/process/tests/config-protection-crlf.test.js` (nowy),
  `adapters/claude-code/hooks/config-protection.js` (tylko w ścieżce A).
- **Stan dziś** (`config-protection.js`, linie 34–35, 133–137 i 172–173):

  ```js
  function immutableSection(text) {
    const lines = String(text).split('\n');
  ```

  ```js
  function editTouchesSection(current, sec, oldString, replaceAll) {
    if (!oldString) return false;
    let from = 0;
    while (true) {
      const idx = current.indexOf(oldString, from);
  ```

  ```js
      let current = '';
      try { current = fs.readFileSync(target, 'utf8'); } catch (_) { return process.exit(0); }
  ```

  Surowy tekst pliku z `\r\n` jest porównywany z `old_string`, który model wysyła z `\n`.
- **Przewidywanie (prototyp uruchomiony 2026-11-09 na fiksturze w katalogu tymczasowym, hook
  z `main @ 5aeab39`):** ścieżka **A**. Wyniki dziś: jedna linia w sekcji → `ask`; dwie linie
  w sekcji z LF → **cisza** (hipoteza potwierdzona); dwie linie z CRLF → `ask`; dwie linie poza
  sekcją → cisza; dodatkowo `Write` całego pliku w LF z **niezmienioną** sekcją → `ask` (fałszywe
  pytanie, ta sama przyczyna). Po normalizacji z kroku A wszystkie pięć przypadków dało wynik
  oczekiwany.
- **Zmiana:**
  - **Krok 0 (zawsze):** napisz test z pola „Test najpierw” i uruchom go na niezmienionym hooku.
  - **Ścieżka A — test czerwony z asercji** (przypadek LF w sekcji daje ciszę albo `Write` LF daje `ask`):
    1. Nad `immutableSection` dodaj funkcję:

       ```js
       // Konce linii CRLF -> LF. CLAUDE.md z core.autocrlf albo z kopii pluginu ma CRLF,
       // a old_string i content od modelu maja LF; porownanie surowe przepuszczalo edycje (C10).
       function bezCR(s) { return String(s).replace(/\r\n/g, '\n'); }
       ```

    2. W `immutableSection` zamień `const lines = String(text).split('\n');` na
       `const lines = bezCR(text).split('\n');` — normalizuje to obie strony porównania `Write`
       (sekcja z pliku i sekcja z `ti.content`).
    3. Odczyt pliku: `try { current = bezCR(fs.readFileSync(target, 'utf8')); } catch (_) { return process.exit(0); }`.
    4. Oba wywołania `editTouchesSection` (gałąź `Edit` i pętla `MultiEdit`) dostają
       `bezCR(ti.old_string || '')` oraz `bezCR(e.old_string || '')` zamiast `String(...)`.
    5. Test zielony.
  - **Ścieżka B — test zielony bez zmiany kodu:** hooka nie zmieniasz. Test zostaje jako regresyjny.
    Do wpisu dziennika etapu dopisz jedno zdanie: „K-C10 zamknięta jako niepotwierdzona: test
    `config-protection-crlf.test.js` zielony na hooku bez zmian (<RRRR-MM-DD>).”
- **Test najpierw** — `core/process/tests/config-protection-crlf.test.js`, wzór
  `prompt-gate.test.js`: fikstura w `fs.mkdtempSync(path.join(os.tmpdir(), 'relai-c10-'))`,
  sprzątana w `t.after`; `docs/USTAWIENIA.md` z linią `Wersja RelAI: 3.7.0`; `CLAUDE.md` złożony
  z linii `# Projekt`, `## Stan`, `opis`, `## Implementation guidelines (sekcja niemutowalna)`,
  `- **Think before coding**: nie zakladaj.`, `- **Simplicity first**: najprostsze rozwiazanie.`
  połączonych `'\r\n'`. Hook przez `spawnSync(process.execPath, [HOOK], { cwd: root, input, env:
  { ...process.env, HOME: home, USERPROFILE: home } })`, payload
  `{ hook_event_name: 'PreToolUse', cwd: root, tool_name, tool_input }`. Pomocnik zwraca
  `JSON.parse(stdout).hookSpecificOutput.permissionDecision` albo `'cisza'` dla pustego stdout.
  1. `CRLF CLAUDE.md: a two-line LF old_string inside the immutable section asks` — `Edit`
     z `old_string` = dwie linie listy połączone `'\n'` → `ask`. W tym samym teście kontrola
     pozytywna: jedna linia listy → `ask`; te same dwie linie połączone `'\r\n'` → `ask`.
  2. `CRLF CLAUDE.md: an LF Write with the section unchanged stays silent` — `Write` z `content`
     = te same linie połączone `'\n'`, `opis` zmieniony na `opis 2` → `cisza`. Kontrola pozytywna:
     `Write`, w którym linia `Simplicity first` jest usunięta → `ask`.
  3. `CRLF CLAUDE.md: a two-line edit outside the section stays silent` — `old_string`
     `'## Stan\nopis'` → `cisza`.
- **Weryfikacja:** `node --test core/process/tests/config-protection-crlf.test.js` → 3 zielone
  (w ścieżce A przed zmianą: przypadki 1 i 2 czerwone z asercji).
- **Nie ruszasz:** porównania ścieżek wielkością liter na Windows (znalezisko D11, niska waga, poza
  planem); bramki snapshotu D-52 (gałąź 3 hooka); pliku ustawień (gałąź 1).
- **Pułapki:** test pisze `CLAUDE.md` z `\r\n` jawnie w łańcuchu — nie licz na `core.autocrlf`.
  Hook `config-protection` **zainstalowanego** pluginu 3.7.0 nie pilnuje plików w `os.tmpdir()`
  poza projektem, więc fikstura nie wywoła pytania w Twojej sesji.
- **Gotowe, gdy:** test ma 3 zielone przypadki; w ścieżce A diff `config-protection.js` dotyczy
  wyłącznie `bezCR` i czterech miejsc z kroków 2–4; w ścieżce B zdanie stoi we wpisie dziennika.

---

## K-C4 — awaria hooka zostawia ślad, a guard przy błędzie pyta

- **Cel:** wyjątek w hooku Claude Code zostawia jedną linię ASCII `[RelAI <hook>] blad: <nazwa>`
  na stderr; hooki ochronne (`secret-scanner`, `config-protection`) przy błędzie wewnętrznym zwracają
  `ask` z komunikatem; awaria jednego raportu startu nie kasuje bloku `[RelAI session-context]`
  ani nakazu rytuału; zdanie skilla o ciszy hooka jest prawdziwe.
- **Pliki:** czternaście plików `adapters/claude-code/hooks/*.js` (tabela niżej),
  `adapters/claude-code/skills/relai-core/SKILL.md`, kopia generowana
  `adapters/codex/skills/relai-core/SKILL.md`, `docs/ARTEFAKTY.md`,
  `core/process/tests/hook-failures.test.js` (nowy).
- **Stan dziś:** każdy hook kończy `main` tak (np. `secret-scanner.js:99-101`):

  ```js
  process.stdin.on('error', () => process.exit(0));
  process.stdin.on('end', () => {
    try { main(JSON.parse(raw || '{}')); } catch (_) { process.exit(0); }
  ```

  Prototyp na `main @ 5aeab39` (FAKT): `secret-scanner` i `config-protection` z wejściem
  `{nie json` → kod 0, stdout pusty, stderr pusty; kopia `secret-scanner.js` bez katalogu `core/`
  → to samo; `session-context` z rdzeniem, w którym `stateDrift` rzuca `TypeError` → **0 bajtów**
  wyjścia (blok startu i nakaz rytuału znikają). `SKILL.md:112-114`:

  ```
  - Zgłoszenie hooka jest **jedynym** zgłoszeniem; cisza hooka znaczy „sprawdzone i zgodne" — nie
    powtarzasz porównania sam (L-0036). Bloku `[RelAI session-context]` nie ma w ogóle → dopiero
    wtedy porównujesz sam, wg `start-nets.md`.
  ```

- **Rozstrzygnięcia:**
  - Ślad to **trzy linie powtórzone w każdym hooku**, nie wspólny moduł — moduł byłby kolejnym
    `require`, który przy zepsutej instalacji zawodzi razem z rdzeniem, a ślad ma powstać właśnie wtedy.
  - Nazwa błędu to `e.code || e.name` (`MODULE_NOT_FOUND`, `SyntaxError`, `TypeError`), **nigdy**
    `e.message` — komunikat `JSON.parse` cytuje fragment wejścia, a wejście guarda bywa sekretem.
  - Guard przy awarii `require` rdzenia także zwraca `ask` (nie ciszę), w każdym folderze — bez rdzenia
    nie wie, czy stoi w projekcie RelAI, a zepsuta instalacja ma być widoczna (zasada 12: „`catch` bez
    odmowy to fałszywa zieleń”).
  - Guardy zdejmują BOM przed `JSON.parse` (zasada 13), jak `session-title.js:80-81` — bez tego payload
    z BOM, dotąd przepuszczany po cichu, dawałby `ask` przy każdym zapisie.
- **Kryterium dla każdego `catch`:** `catch` **świadomej ciszy** — brak pliku, katalogu albo wartości,
  który jest stanem normalnym (`readdirSync` docs, odczyt opcjonalnego pliku, zgadywanie `.env` bez
  gita, nieczytelny marker gościa) — **zostaje bez zmian**. `catch` **maskujący awarię** — `require`
  rdzenia, błąd `stdin`, `JSON.parse` + cała logika `main`, odrzucona obietnica, wyjątek procesu
  potomnego, zewnętrzny `try` obejmujący całą funkcję rozpoznania — dostaje ślad.
- **Zmiana:**
  1. W każdym z czternastu hooków, **przed** pierwszym `require`, wstaw (`<nazwa>` = nazwa pliku
     bez `.js`):

     ```js
     const HOOK = '<nazwa>';
     function nazwaBledu(e) { return String((e && (e.code || e.name)) || 'nieznany').replace(/[^\x20-\x7e]/g, '?'); }
     function slad(e) { try { process.stderr.write('[RelAI ' + HOOK + '] blad: ' + nazwaBledu(e) + '\n'); } catch (_) { /* stderr zamkniety */ } }
     ```

  2. W `secret-scanner.js` i `config-protection.js` pod tymi liniami dodaj funkcję pytania
     (komunikat `config-protection` w nawiasie):

     ```js
     function pytajPoAwarii(e) {
       slad(e);
       console.log(JSON.stringify({
         hookSpecificOutput: {
           hookEventName: 'PreToolUse',
           permissionDecision: 'ask',
           permissionDecisionReason: 'RelAI secret-scanner: blad wewnetrzny skanera (' + nazwaBledu(e) + '), zapis NIE zostal sprawdzony. ' +
             'Zatwierdz tylko, jesli wiesz, ze tresc nie zawiera sekretu; trwaly blad zglos i zainstaluj plugin ponownie.',
         },
       }));
       process.exit(0);
     }
     ```

     (`config-protection`: `'RelAI config-protection: blad wewnetrzny ochrony konfiguracji (' + nazwaBledu(e) +
     '), zmiana NIE zostala sprawdzona. Zatwierdz tylko, jesli zmiana nie dotyka pliku ustawien ani sekcji niemutowalnej CLAUDE.md.'`)
  3. Zastosuj tabelę. „S” = `} catch (e) { slad(e); <dotychczasowe wyjście bez zmian> }`;
     „A” = `} catch (e) { pytajPoAwarii(e); }` (dla `stdin.on('error')`: `(e) => pytajPoAwarii(e)`);
     „Z” = zostaje. Kotwica to tekst linii; numer jest orientacyjny.

     | Hook | Kotwica (linia) | Co wpisać |
     |---|---|---|
     | `secret-scanner` | `} catch (_) {` po `require` rdzenia (27) | A |
     | | `return path.basename(filePath).startsWith('.env');` w `catch` (49–50) | Z — zgadywanie `.env` bez gita |
     | | `process.stdin.on('error', () => process.exit(0));` (99) | A |
     | | `try { main(JSON.parse(raw \|\| '{}')); } catch (_) { process.exit(0); }` (101) | A; przed `JSON.parse` zdejmij BOM jak w `session-title.js:80-81` |
     | `config-protection` | `} catch (_) {` po `require` (29) | A |
     | | `catch (_)` w liniach 73, 100, 109, 120, 126, 173 | Z — brak pliku albo katalogu |
     | | `stdin.on('error'` (231), `main(JSON.parse` (233) | A; BOM jak wyżej |
     | `session-context` | `} catch (_) {` po `require` rdzenia (45) | S (`slad(e); process.exit(0);`) |
     | | `} catch (_) {` po `require` `resume.js` (53) | S — zaślepka zostaje, dochodzi ślad |
     | | `catch (_)` w `pluginVersion` (80), w `oznaczUstawieniaPodane` (280) | Z |
     | | `stdin.on('error'` (327), `main(JSON.parse` (329) | S |
     | `prompt-mode` | `require` (36), `stdin.on('error'` (88), `main(JSON.parse` (90) | S |
     | | `catch (_) { /* nastepny */ }` (46) | Z |
     | `humanize-continuous` | `require` (34), `stdin.on('error'` (97), `main(JSON.parse` (99) | S |
     | `session-title` | `require` (29), `stdin.on('error'` (78), `catch (_) { process.exit(0); }` po `JSON.parse` (83) | S |
     | | `main(input).then(() => process.exit(0), () => process.exit(0));` (84) | S w drugim argumencie: `(e) => { slad(e); process.exit(0); }` |
     | | `czytaj` — `catch (_) { return null; }` (38) | Z |
     | `lockfile-scan` | `require` (28), `JSON.parse(fs.readFileSync(0` (35) | S |
     | | `.catch(() => {` po `logika.run(input)` (44) | S: `.catch((e) => { slad(e); process.exitCode = 0; })` |
     | `quality-gate` | zewnętrzny `catch` w `isRelaiProject` (46) | S (`slad(e); return false;`) |
     | | `catch (_) { /* cisza — ostrzeganie nie moze wywracac sesji */ }` (82), `catch (_) { /* cisza */ }` (97) | S, bez wyjścia — komentarz zostaje |
     | | `isGuest` (21), `readdirSync` (31), odczyt nagłówka (42) | Z |
     | | `stdin.on('error'` (107), `main(JSON.parse` (109) | S |
     | `console-log-warn` | zewnętrzny `catch` w `isRelaiProject` (42) | S (`return false`) |
     | | `isGuest` (17), `readdirSync` (27), nagłówek (38), odczyt pliku (57) | Z |
     | | `stdin.on('error'` (88), `main(JSON.parse` (90) | S |
     | `design-quality-check` | zewnętrzny `catch` w `isRelaiProject` (44) | S (`return false`) |
     | | `isGuest` (19), `readdirSync` (29), nagłówek (40), `DESIGN.md` (67) | Z |
     | | `stdin.on('error'` (84), `main(JSON.parse` (86) | S |
     | `profile-rules` | zewnętrzny `catch` w `relaiMarkerFile` (53) | S (`return null`) |
     | | `isGuest` (28), `readdirSync` (38), nagłówek (49), 64, 76, 86, 185 | Z |
     | | `stdin.on('error'` (220), `main(JSON.parse` (222) | S |
     | `journal-signature` | zewnętrzny `catch` w `isRelaiProject` (55) | S (`return false`) |
     | | `isGuest` (30), 40, 51, 64, 82, 117 | Z |
     | | `stdin.on('error'` (154), `main(JSON.parse` (156) | S |
     | `doc-sync-reminder` | zewnętrzny `catch` w `isRelaiProject` (43), `catch` wokół `spawnSync('git'` (60) | S (`return false` / `return process.exit(0)`) |
     | | `isGuest` (18), 28, 39 | Z |
     | | `stdin.on('error'` (85), `main(JSON.parse` (87) | S |
     | `auto-format` | zewnętrzny `catch` w `isRelaiProject` (44), `catch` wokół `git status` (86), `catch (_) { /* cichy */ }` po Prettierze (102) | S |
     | | `isGuest` (19), 29, 40, `hasPrettierConfig` (57) | Z |
     | | `stdin.on('error'` (109), `main(JSON.parse` (111) | S |

  4. W `session-context.js` dodaj nad `onSessionStart` pomocnika i owiń nim **każdy** raport:

     ```js
     // K-C4: kazdy raport we wlasnym try. Wyjatek w jednym zostawia slad na stderr i jedna linie
     // w bloku startu; pozostale raporty i nakaz rytualu padaja dalej.
     function raport(out, nazwa, fn) {
       try {
         for (const linia of fn() || []) out.push(linia);
       } catch (e) {
         slad(e);
         out.push('Siatka "' + nazwa + '" nie zadzialala (blad: ' + nazwaBledu(e) + '). Te jedna siatke ' +
           'porownaj sam wedlug start-nets.md skilla relai-core; pozostale zgloszenia tego bloku sa wazne.');
       }
     }
     ```

     Raporty i nazwy (w kolejności z pliku): `wersja projektu` (porównanie `pv`/`gv`, linie 108–113),
     `prompt etapu (D-34)` (118–124), `rozjazd stanu` (126–133), `rytual Na koniec` (138–140),
     `nieznany autor` (142–152), `budzet startu` (162–164), `sprawy czekajace` (169–172),
     `artefakty robocze` (177–180), `tryb ciagly` (186–188), `wznowienie` (193–196),
     `kopie specyfikacji` (228–232), `lista modeli` (235–240), `wiek listy modeli` (246–249),
     `ustawienia globalne` (`const gs = …`, 251), `zgoda na tryb ciagly` (256–259). Raport, który
     dziś zwraca pojedynczą wartość, zwraca w `fn` tablicę z zero albo jedną linią. `gs` zadeklaruj
     przed pierwszym użyciem jako `let gs = null;` i przypisz wewnątrz raportu `ustawienia globalne`
     (`return [];`); blok `if (gs) { … oznaczUstawieniaPodane(…) }` zostaje poza `raport`.
     Poza `raport` zostają wyłącznie: nagłówek `[RelAI session-context]`, linia daty, linia nakazu
     rytuału albo przypomnienia po kompakcji (`input.source === 'compact'`), dwie linie stałe
     (usterka, „gotowe”) i `process.stdout.write`.
  5. W `SKILL.md` zastąp trzy linie z kotwicy tekstem (zachowaj wcięcie listy):

     ```
     - Zgłoszenie hooka jest **jedynym** zgłoszeniem; cisza hooka znaczy „sprawdzone i zgodne" — nie
       powtarzasz porównania sam (L-0036). Dwa wyjątki: bloku `[RelAI session-context]` nie ma
       w ogóle → porównujesz sam wszystkie siatki wg `start-nets.md`; blok ma linię
       „Siatka "<nazwa>" nie zadzialala” → porównujesz sam tylko tę siatkę.
     ```

  6. `node adapters/codex/generate-skills.js` (kopia Codeksa). W `docs/ARTEFAKTY.md`, w wierszu
     zaczynającym się od ``| Skill `relai-core` | `adapters/claude-code/skills/relai-core/SKILL.md` |``:
     kolumna „Wersja” +1 (dziś `28`), kolumna „Data” bez zmian, na **początek** komórki „Co się
     zmieniło” dopisz: `<RRRR-MM-DD> (wersja <N>, OPTYMALIZACJA_PO_AUDYCIE E4, K-C4): zdanie o ciszy
     hooka ma drugi wyjątek — linia „Siatka … nie zadzialala” każe porównać samemu tylko tę siatkę.
     Zmiana w obu adapterach (Codex — generator). Powód: hook startu ma osobny try na każdy raport
     (audyt C4). ` (spacja na końcu, potem dotychczasowa treść komórki).
- **Test najpierw** — `core/process/tests/hook-failures.test.js`. Fikstura projektu jak w
  `prompt-gate.test.js` (`relai-c4-` w `os.tmpdir()`, `docs/USTAWIENIA.md` z `Wersja RelAI: 3.7.0`,
  własny `home`). „Atrapa pluginu” = katalog w fiksturze z `adapters/claude-code/hooks/<hook>.js`
  skopiowanym z repozytorium i — gdy test tego wymaga — `core/process/<moduł>.js` w postaci jednej
  linii `module.exports = require(<pełna ścieżka modułu w repozytorium>);`.
  1. `secret-scanner: malformed stdin asks and leaves one trace line` — wejście `'{nie json'` →
     kod 0, `permissionDecision === 'ask'`, `permissionDecisionReason` zawiera `blad wewnetrzny`,
     `stderr.trim() === '[RelAI secret-scanner] blad: SyntaxError'`. Kontrola w tym samym teście:
     poprawny payload `Write` pliku `a.txt` w fiksturze **bez** markera RelAI → stdout i stderr puste;
     ten sam payload poprzedzony znakiem `String.fromCharCode(0xfeff)` → stdout i stderr puste.
  2. `config-protection: malformed stdin asks and leaves one trace line` — jak wyżej,
     `[RelAI config-protection] blad: SyntaxError`.
  3. `guards without the core ask and name MODULE_NOT_FOUND` — atrapa pluginu z samym plikiem hooka
     (bez `core/`), dla `secret-scanner` i `config-protection`: `ask`, stderr
     `[RelAI <hook>] blad: MODULE_NOT_FOUND`.
  4. `session-context: one failing report keeps the block, the ritual line and the other reports` —
     atrapa pluginu: kopia `session-context.js`; `core/process/prompt-mode.js` i `resume.js` jako
     re-eksport; `core/process/session-signals.js` jako
     `const real = require(<ścieżka>); module.exports = { ...real, stateDrift() { throw new TypeError('test'); } };`.
     Payload `SessionStart`. Oczekiwane: stdout zawiera `[RelAI session-context]`,
     `wykonaj rytual startu sesji` i `Siatka "rozjazd stanu" nie zadzialala (blad: TypeError)`;
     `stderr.trim() === '[RelAI session-context] blad: TypeError'`. Kontrola pozytywna: ta sama
     atrapa z `session-signals.js` jako czysty re-eksport → stdout z nakazem rytuału, bez słowa
     `nie zadzialala`, stderr pusty (FAKT z prototypu: 1151 B, stderr pusty). Posprzątaj
     `path.join(os.tmpdir(), 'relai-ustawienia-podane-' + sesja)` jak `ritual-copies.test.js:126-128`.
  5. `non-guard hooks: malformed stdin gives exit 0, empty stdout and one trace line` — pętla po
     dwunastu hookach (`session-context`, `prompt-mode`, `humanize-continuous`, `session-title`,
     `lockfile-scan`, `quality-gate`, `console-log-warn`, `design-quality-check`, `profile-rules`,
     `journal-signature`, `doc-sync-reminder`, `auto-format`): wejście `'{nie json'` → kod 0,
     `stdout === ''`, `stderr.trim() === '[RelAI ' + nazwa + '] blad: SyntaxError'`.
  6. `skill relai-core names the failed-net line as the second exception` — `SKILL.md` obu adapterów
     (odczyt z normalizacją `\r\n` → `\n`) zawiera `nie zadzialala” → porównujesz sam tylko tę siatkę`;
     kontrola pozytywna: zawiera też `nie ma\n  w ogóle`.
- **Weryfikacja:** `node --test core/process/tests/hook-failures.test.js` → 6 zielonych (przed
  zmianą: 1–6 czerwone z asercji); `node --test core/process/tests/humanize-continuous.test.js` →
  bez zmian liczby (przypadek `hook survives malformed events with exit 0 and zero bytes` sprawdza
  stdout, nie stderr); `grep -c "function slad" adapters/claude-code/hooks/*.js` → `1` w każdym
  z czternastu plików; `grep -n "catch (_) { process.exit(0); }" adapters/claude-code/hooks/*.js` →
  brak trafień.
- **Nie ruszasz:** `catch` w modułach rdzenia (`core/process/session-signals.js`,
  `core/process/prompt-mode.js` — audyt liczył je w 121 liniach, ale rdzeń to inne etapy); hooków
  Cursora i Codeksa (Codex przy błędzie już blokuje, `adapters/codex/hooks/secret-scanner.js:19`);
  wspólnego dispatchera i kopii `isRelaiProject` (C5, niska waga, poza planem); sprzątania znaczników
  `relai-ustawienia-podane-*` (C1/C12 — etap E7 i poza planem); kosztu startu (C1–C3, etap E7);
  zdania o „Sesji nieinteraktywnej” w tym samym bloku `SKILL.md` (znalezisko E11, inna karta).
- **Pułapki:**
  - W Twojej sesji działają hooki **zainstalowanego** pluginu 3.7.0 — awaria hooka w sesji dalej
    będzie cicha. Dowodem jest wyłącznie test.
  - Komunikaty i ślad **tylko ASCII**: nie kopiuj półpauzy `—` z istniejących komunikatów
    (`console-log-warn.js:77`, `quality-gate.js:101`) do nowych tekstów.
  - `slad` ma stać **przed** `require` rdzenia — inaczej przypadek 3 nie dostanie śladu.
  - `process.exit` wewnątrz `try` nie rzuca; nie zmieniaj kolejności „ślad, potem wyjście”.
  - Test 4 wymaga re-eksportu `resume.js` — bez niego stderr dostaje dodatkową linię
    `blad: MODULE_NOT_FOUND` (zmierzone w prototypie).
  - Hook `secret-scanner` sesji zablokuje zapis testu z literałem przypisania sekretu; ten test
    sekretów nie potrzebuje — nie dopisuj ich „dla pewności”.
- **Gotowe, gdy:** sześć testów zielonych; każdy z czternastu hooków ma `function slad`; dwa guardy
  mają `pytajPoAwarii`; `SKILL.md` w obu adapterach ma nowe brzmienie; wiersz rejestru ma podbitą
  wersję; `validate-adapters.js` kod 0.

---

## K-C6 — hooki nie pracują na plikach spoza projektu

- **Cel:** hooki ostrzegawcze `console-log-warn`, `quality-gate`, `design-quality-check`
  i `profile-rules` milczą dla pliku, którego ścieżka po `path.resolve` nie leży w katalogu
  projektu; `secret-scanner` nie skanuje pliku spoza katalogu projektu i nie nazywa pliku
  „śledzonym”, gdy git tego nie potwierdził.
- **Pliki:** `adapters/claude-code/hooks/console-log-warn.js`, `quality-gate.js`,
  `design-quality-check.js`, `profile-rules.js`, `secret-scanner.js`;
  `core/process/tests/hook-project-scope.test.js` (nowy).
- **Stan dziś:** hooki ostrzegawcze sprawdzają projekt po `cwd`, a plik biorą z payloadu bez
  sprawdzenia położenia (`console-log-warn.js:47-53`):

  ```js
  function main(input) {
    const cwd = input.cwd || process.cwd();
    if (!isRelaiProject(cwd)) return process.exit(0);

    const ti = input.tool_input || {};
    const filePath = String(ti.file_path || '');
  ```

  `profile-rules.js:96` ma `POZA_PROJEKTEM = /^(\.\.|docs\/|…` — łapie `..`, ale nie plik na innym
  dysku (`path.relative` zwraca wtedy ścieżkę bezwzględną). `secret-scanner.js:44-48` przy braku
  repozytorium (kod 128) albo ścieżce spoza repozytorium zwraca `false` („nieignorowany”), a
  `secret-scanner.js:82` pisze zawsze `w pliku sledzonym`. FAKT (2026-11-09): przy pisaniu tej karty
  hook sesji zgłosił `console-log-warn` dla skryptu w `%TEMP%`; prototyp na fiksturze — plik poza
  projektem: `console-log-warn` ostrzega, `secret-scanner` daje `deny … w pliku sledzonym`.
- **Rozstrzygnięcie:** `secret-scanner` **nie skanuje** pliku leżącego poza katalogiem projektu,
  do którego rozpoznanie go przypisało — D-42 chroni pliki trafiające do repozytorium projektu,
  a plik spoza jego katalogu nie ma drogi do tego repozytorium. Dotyczy to wyłącznie rozpoznania
  „od katalogu sesji” (`kierunek: 'sesja'`); plik w innym projekcie RelAI (`kierunek: 'plik'`)
  leży w swoim katalogu i jest skanowany jak dotąd. W projekcie bez gita skaner **dalej blokuje**
  (projekt może zostać repozytorium), ale mówi to wprost.
- **Zmiana:**
  1. W czterech hookach ostrzegawczych dodaj nad `main` (w `profile-rules` z `cwd` jak w `relPosix`):

     ```js
     // Plik spoza katalogu projektu (skrypt w %TEMP%, inny dysk) nie dostaje ostrzezen projektu (C6).
     function wKatalogu(cwd, filePath) {
       const rel = path.relative(path.resolve(cwd), path.resolve(cwd, filePath));
       return rel !== '' && rel !== '..' && !rel.startsWith('..' + path.sep) && !path.isAbsolute(rel);
     }
     ```

  2. Warunek po odczycie `filePath`, przed każdą inną pracą:
     `console-log-warn` i `quality-gate` — `if (!filePath || !wKatalogu(cwd, filePath)) return process.exit(0);`
     przed testem rozszerzenia; `design-quality-check` — ten sam warunek **przed** `fs.existsSync(designPath)`
     (przenieś odczyt `ti`/`filePath` nad sprawdzenie `DESIGN.md`); `profile-rules` — w `main` po
     `if (!filePath) return process.exit(0);` dopisz `if (!wKatalogu(cwd, filePath)) return process.exit(0);`.
  3. `secret-scanner.js`: dodaj tę samą funkcję w wariancie `wKatalogu(root, abs)`
     (`path.relative(path.resolve(root), abs)`) i po `if (!projekt) return process.exit(0);` dopisz
     `if (!wKatalogu(projekt.root, abs)) return process.exit(0); // C6: plik spoza katalogu projektu`.
  4. `secret-scanner.js`: zamień `isGitIgnored` na funkcję trójstanową i użyj jej w komunikacie:

     ```js
     // 'ignorowany' | 'nieignorowany' | 'bez-gita'. Plik .env* bez gita liczy sie jak ignorowany.
     function stanGita(cwd, filePath) {
       const env = path.basename(filePath).startsWith('.env');
       try {
         const r = spawnSync('git', ['check-ignore', '-q', '--', filePath], { cwd, timeout: 5000, windowsHide: true });
         if (!r.error && r.status === 0) return 'ignorowany';
         if (!r.error && r.status === 1) return 'nieignorowany';
         return env ? 'ignorowany' : 'bez-gita';
       } catch (_) {
         return env ? 'ignorowany' : 'bez-gita';
       }
     }
     ```

     W `main`: `const git = stanGita(projekt.root, abs); if (git === 'ignorowany') return process.exit(0);`
     (zamiast `if (isGitIgnored(projekt.root, abs)) return process.exit(0);`), a początek komunikatu
     z linii 82–83 (kotwica):

     ```js
       const msg = 'RelAI secret-scanner: wykryto ' + finding + ' w pliku sledzonym "' + rel +
         '". Sekrety trzymaj wylacznie w .env objetym .gitignore (D-42); do repozytorium moze trafic ' +
     ```

     zastąp:

     ```js
     const gdzie = git === 'nieignorowany'
       ? 'w pliku "' + rel + '", ktorego git nie ignoruje'
       : 'w pliku "' + rel + '" (projekt bez repozytorium gita albo git niedostepny)';
     const msg = 'RelAI secret-scanner: wykryto ' + finding + ' ' + gdzie +
       '. Sekrety trzymaj wylacznie w .env objetym .gitignore (D-42); …' // reszta zdania bez zmian
     ```

     Komentarz nagłówka pliku (linia 4, „Blokuje zapis sekretu do pliku sledzonego przez git”) popraw
     na „Blokuje zapis sekretu do pliku projektu, ktorego git nie ignoruje”.
- **Test najpierw** — `core/process/tests/hook-project-scope.test.js`. Fikstura: `projekt/` z markerem
  i `obcy/` obok, oba w jednym `mkdtemp`; sesja (`cwd`, `payload.cwd`) zawsze w `projekt/`. Sekret
  składaj w czasie działania (`['DB', 'PASSWORD'].join('_')` i `['m7Q', '9rV', '2zL', '8pN'].join('')`).
  1. `console-log-warn: a file outside the project gets no warning, the same file inside does` —
     `skrypt.js` z `console.log(1)` w `obcy/` → stdout pusty; ten sam plik w `projekt/` →
     `additionalContext` zawiera `console-log-warn`.
  2. `design-quality-check: outside file skipped, inside file warned` — `projekt/docs/DESIGN.md`
     z nagłówkiem `## Kolory`; `styl.css` w `obcy/` → pusty; w `projekt/` → zawiera `docs/DESIGN.md`.
  3. `quality-gate: outside file skipped, inside file warned` — w `projekt/` `tsconfig.json` (`{}`)
     i `node_modules/typescript/lib/tsc.js` z treścią
     `process.stdout.write('a.ts(1,1): error TS2322: x\n'); process.exit(1);`; `a.ts` w `obcy/` →
     pusty; w `projekt/` → zawiera `tsc --noEmit: 1`.
  4. `profile-rules: a file on another drive is skipped, inside file warned` — `USTAWIENIA.md`
     z wierszem `| 2026-11-09 | Profil projektu | app |`; `file_path` =
     `'Z:\\relai-nie-istnieje\\src\\a.js'` (plik nie musi istnieć) → pusty; `src/a.js` w `projekt/`
     → zawiera `pierwszy kod`; `src/a.js` w `obcy/` (ten sam dysk) → pusty. Opcja testu
     `{ skip: process.platform !== 'win32' }` — inny dysk istnieje tylko na Windows.
  5. `secret-scanner: a file outside the project directory passes, inside it is denied` — `Write`
     `cfg.txt` z sekretem w `obcy/` → stdout pusty; w `projekt/` → `deny`.
  6. `secret-scanner: the verdict does not call the file tracked unless git said so` — `projekt/`
     bez `git init` → `permissionDecisionReason` nie pasuje do `/sledzon/`, zawiera
     `bez repozytorium gita`; po `spawnSync('git', ['init', '-q'], { cwd: root })` → zawiera
     `ktorego git nie ignoruje`; plik dopisany do `.gitignore` → stdout pusty.
- **Weryfikacja:** `node --test core/process/tests/hook-project-scope.test.js` → 6 zielonych; przed
  zmianą wszystkie sześć czerwone z asercji (FAKT z prototypu: `quality-gate`, `design-quality-check`
  i `console-log-warn` ostrzegają dziś dla pliku w `obcy/`; `profile-rules` milczy dla `obcy/` na tym
  samym dysku dzięki `POZA_PROJEKTEM`, ale ostrzega dla `Z:\…` — dlatego przypadek 4 stoi na innym
  dysku); `grep -n "sledzonym" adapters/claude-code/hooks/secret-scanner.js` → brak trafień.
- **Nie ruszasz:** `journal-signature` (już sprawdza `..` w `isJournalPath`) i `doc-sync-reminder`
  (nie dostaje ścieżki pliku); `config-protection` (porównuje z konkretnymi plikami projektu, a
  bramka snapshotu odrzuca `..`); zmiany `secret-scanner` z karty K-D8 (etap E5: Bash i treść po
  edycji); parsera ustawień (C8, poza planem); wielkości liter ścieżek (D11, poza planem).
- **Pułapki:** `git init` w fiksturze wymaga gita w `PATH` — w razie braku test 6 sprawdza tylko
  wariant bez gita i mówi to w nazwie podtestu; nie pomijaj go po cichu. Plik testu nie może
  zawierać gotowego przypisania sekretu ani w kodzie, ani w nazwie przypadku. Hook sesji 3.7.0 dalej
  ostrzega przy Twoich skryptach w `%TEMP%` — to dowód problemu, nie wynik zmiany.
- **Gotowe, gdy:** sześć testów zielonych; `grep` z „Weryfikacji” bez trafień; zestaw `core/process`
  ma 372 testy.
