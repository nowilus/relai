# E5 — Hook poleceń powłoki i siatka Stop

Konwencje wspólne: [00_KONWENCJE.md](00_KONWENCJE.md). Etap zaczyna się na stanie po etapie E4
(hooki mają już funkcję `slad`, guardy `pytajPoAwarii`, `secret-scanner` ma `wKatalogu` i `stanGita`).
Zmienia hooki adaptera Claude Code, dodaje piętnasty hook `bash-guard.js` i cztery pliki testów.

**Rozstrzygnięcie względem zlecenia karty (do potwierdzenia przez człowieka, patrz niżej):** zlecenie
mówiło o `bash-guard.js`, który **blokuje** sekret w poleceniu. Zamrożona D-41 brzmi: „Blokują
wyłącznie secret-scanner i config-protection; pozostałe ostrzegają”, a konwencje planu pozwalają na
aneksy tylko do D-14, D-40, D-88 i D-93. Dlatego skan polecenia `Bash` dostaje **`secret-scanner.js`**
(ta sama funkcja `scanText`, ten sam werdykt `deny`, rejestracja także na `^Bash$`), a `bash-guard.js`
wyłącznie **ostrzega** (K-E3). Skutek dla użytkownika jest ten sam, D-41 zostaje nienaruszona.

- **Karty w kolejności wykonania:** K-D8 → K-E3 → K-C9. K-D8 jest pierwsza, bo zakłada grupę
  `PreToolUse` dla `Bash` w `hooks.json`, do której K-E3 dopina `bash-guard`; K-E3 dopisuje do
  `doc-sync-reminder` drugie przypomnienie, a K-C9 na końcu przenosi oba przypomnienia na kanał
  zależny od pomiaru — inaczej przenosiłaby kod, który K-E3 jeszcze zmienia.
- **Efekt widoczny:** na fiksturze polecenie `export` z sekretem dostaje `deny`, polecenie `cd x && y`
  dostaje ostrzeżenie w `additionalContext`, a hook Stop po commitach kodu bez wpisu dziennika mówi
  jedno zdanie. W sesji — dopiero po wydaniu.
- **Szacunek:** SZACUNEK 1–2 sesje.
- **Warunki zatrzymania:** kotwica nie pasuje (w tym: brak funkcji `slad` z etapu E4 → E4 nie jest
  zamknięty); w `docs/plany/OPTYMALIZACJA_PO_AUDYCIE/POMIARY.md` nie ma linii zaczynającej się od
  `C9:` albo jej wartość nie jest dokładnie `WIDZI` ani `NIE WIDZI` (K-C9); człowiek odrzuca
  rozstrzygnięcie z akapitu wyżej (wtedy kart K-D8 i K-E3 nie wykonujesz — potrzebna nowa decyzja
  zamiast aneksu); liczba testów spada.
- **Do rozstrzygnięcia przez człowieka na starcie etapu (jedno pytanie AskUserQuestion, dwie części):**
  (a) „Skan sekretu w poleceniu powłoki w `secret-scanner` (D-41 bez zmian), `bash-guard` tylko
  ostrzega?” — „Tak (Rekomendowane)” / „Nie — chcę decyzji zmieniającej D-41”; (b) tylko gdy
  `POMIARY.md` mówi `C9: NIE WIDZI`: „Przypomnienie hooka Stop przez `additionalContext` daje
  modelowi jedną dodatkową turę przy każdym zatrzymaniu z zaległością dokumentów — przenieść?” —
  „Przenieść (Rekomendowane)” / „Zostawić komunikat dla człowieka”. Odpowiedzi zapisz we wpisie
  dziennika etapu.
- **Weryfikacja etapu** (stan wyjściowy = stan końcowy E4: `core/process` 372, `core/guardrails` 33 (stan po E03);
  walidator: `wywolania z hooks.json: 18`, `odwolania z kodu adapterow do rdzenia: 26`):

  ```bash
  node --test "core/process/tests/*.test.*"      # 388 zielonych (C9: WIDZI) albo 389 (C9: NIE WIDZI)
  node --test "core/guardrails/tests/*.test.js"  # 33 (stan po E03)
  node core/tools/validate-adapters.js           # kod 0; "wywolania z hooks.json: 20"; "odwolania z kodu adapterow do rdzenia: 29"
  node core/tools/release-check.js --tylko readme-hooki   # oczekiwany JEDEN blad: proza mowi "czternascie" (14), hookow 15 — naprawia K-E9 w E14
  ```

  Kontrola `readme-hooki` jest czerwona od etapu E5 do karty K-E9 w etapie E14 — to stan
  oczekiwany, nie naprawiasz go tutaj.

  Delta testów: K-D8 +5, K-E3 +9, K-C9 +2 (+1 przy `NIE WIDZI`). Gdy E4 skończył się inną liczbą,
  licz od liczby zapisanej w dzienniku E4.

---

## K-D8 — sekret w poleceniu powłoki i sekret złożony z edycji

- **Cel:** `secret-scanner` blokuje polecenie `Bash` z sekretem w projekcie RelAI oraz edycję
  `Edit`/`MultiEdit`, po której **plik** zawiera sekret, którego przed edycją nie zawierał.
- **Pliki:** `adapters/claude-code/hooks/secret-scanner.js`, `adapters/claude-code/hooks/hooks.json`,
  `README.md`, `docs/PRZEWODNIK.md`, `core/process/tests/secret-scanner-d8.test.js` (nowy).
- **Stan dziś:** `hooks.json:3-11`:

  ```json
      "PreToolUse": [
        {
          "matcher": "^(Write|Edit|MultiEdit|NotebookEdit)$",
  ```

  `secret-scanner.js` (stan `main @ 5aeab39`; po E4 te linie są nietknięte):

  ```js
    const filePath = ti.file_path || ti.notebook_path || '';
    if (!filePath) return process.exit(0);
  ```

  ```js
    else if (tool === 'Edit') payload = String(ti.new_string || '');
    else if (tool === 'MultiEdit') payload = (ti.edits || []).map((e) => String(e.new_string || '')).join('\n');
  ```

  Polecenie `Bash` nie ma `file_path`, więc nawet gdyby trafiło do hooka, kończy się ciszą. FAKT
  (prototyp 2026-11-09): sekret złożony z treści pliku i `new_string`, z dwóch edycji `MultiEdit`
  albo przez `replace_all` → dziś cisza we wszystkich trzech przypadkach.
- **Rozstrzygnięcie (edycja pliku, który miał już sekret):** edycja jest blokowana, gdy sekret niesie
  sam `new_string` (jak dziś) **albo** gdy plik po zamianie ma sekret, a plik przed zamianą go nie
  miał. O werdykcie decyduje to, co edycja wnosi: plik z sekretem sprzed zmiany (np. stary wpis
  archiwum) da się dalej edytować w innym miejscu, a sekret w historii to sprawa pre-commita
  i człowieka, nie tej edycji. Świadome ograniczenie: drugi sekret złożony w pliku, który już miał
  pierwszy, przejdzie.
- **Zmiana:**
  1. `hooks.json`: po grupie `^(Write|Edit|MultiEdit|NotebookEdit)$` w `PreToolUse` dodaj grupę:

     ```json
           {
             "matcher": "^Bash$",
             "hooks": [
               { "type": "command", "command": "node \"${CLAUDE_PLUGIN_ROOT}/adapters/claude-code/hooks/secret-scanner.js\"" }
             ]
           }
     ```

  2. `secret-scanner.js`: do importu z `session-signals.js` dołóż `relaiMarkerFile`
     (`({ projektDlaPliku: projektDlaPlikuCore, relaiMarkerFile: relaiMarkerFileCore } = require(…))`,
     zmienna `let relaiMarkerFileCore;` obok `projektDlaPlikuCore`).
  3. Wydziel wypisanie werdyktu do `odmow(msg)` (to samo `console.log(JSON.stringify({ hookSpecificOutput:
     { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: msg } }))`
     i `process.exit(0)`) i dodaj:

     ```js
     // K-D8: polecenie powloki nie ma pliku docelowego; projekt liczy sie od katalogu sesji.
     function skanujPolecenie(cwd, ti) {
       const cmd = typeof ti.command === 'string' ? ti.command : '';
       if (!cmd.trim() || !relaiMarkerFileCore(cwd, ['.claude/relai.json'])) return process.exit(0);
       const finding = scanText(cmd);
       if (!finding) return process.exit(0);
       return odmow('RelAI secret-scanner: wykryto ' + finding + ' w poleceniu powloki. Polecenie nie zostalo ' +
         'uruchomione: sekret w poleceniu trafia do transkryptu i historii powloki, a przekierowanie zapisuje go ' +
         'do pliku (D-42). Wartosc trzymaj w .env objetym .gitignore i czytaj ze zmiennej srodowiskowej. ' +
         'Wartosc nie zostala zacytowana celowo.');
     }
     ```

     W `main` po odczycie `ti`, **przed** `const filePath = …`: `if (tool === 'Bash') return skanujPolecenie(cwd, ti);`.
  4. Dodaj funkcje treści po edycji:

     ```js
     // K-D8: tresc pliku PO zastosowaniu Edit/MultiEdit. Sekret zlozony z dwoch edycji nie stoi
     // w zadnym new_string z osobna; o werdykcie decyduje to, co edycja wnosi (plik przed vs po).
     const LIMIT_PELNEGO_SKANU = 512 * 1024; // B; wiekszy plik: skan samego new_string (koszt, D10)
     const bezCR = (s) => String(s).replace(/\r\n/g, '\n');

     function zastosuj(tekst, stary, nowy, wszystkie) {
       if (!stary) return null;
       const i = tekst.indexOf(stary);
       if (i === -1) return null; // narzedzie i tak odrzuci edycje; zostaje skan new_string
       if (wszystkie) return tekst.split(stary).join(nowy);
       return tekst.slice(0, i) + nowy + tekst.slice(i + stary.length);
     }

     function sekretZlozony(tool, ti, abs) {
       if (tool !== 'Edit' && tool !== 'MultiEdit') return null;
       let przed;
       try {
         if (fs.statSync(abs).size > LIMIT_PELNEGO_SKANU) return null;
         przed = bezCR(fs.readFileSync(abs, 'utf8'));
       } catch (_) {
         return null; // pliku nie ma: edycja sie nie uda, a new_string sprawdzono wyzej
       }
       const edycje = tool === 'Edit' ? [ti] : (Array.isArray(ti.edits) ? ti.edits : []);
       let po = przed;
       for (const e of edycje) {
         const nastepny = zastosuj(po, bezCR(e.old_string || ''), bezCR(e.new_string || ''), !!e.replace_all);
         if (nastepny === null) return null;
         po = nastepny;
       }
       const werdykt = scanText(po);
       if (!werdykt || scanText(przed)) return null;
       return werdykt + ' (zlozone z tresci pliku i tej edycji)';
     }
     ```

     i zamień `const finding = scanText(payload);` na
     `const finding = scanText(payload) || sekretZlozony(tool, ti, abs);`. Zamiana idzie przez
     `slice`, nie `String.prototype.replace` — `new_string` z `$&` albo `$1` byłby inaczej
     zinterpretowany jako wzorzec.
  5. Komentarz nagłówka `secret-scanner.js` (linia 3): `PreToolUse (Write/Edit/MultiEdit/NotebookEdit, Bash)`.
  6. `README.md`, wiersz kotwicy ``| `secret-scanner` | blokuje zapis klucza do pliku śledzonego przez gita | hook | hook |``:
     środkową komórkę zmień na `blokuje zapis klucza do pliku śledzonego przez gita i polecenie powłoki z kluczem`.
  7. `docs/PRZEWODNIK.md`, wiersz zaczynający się od `| **sekretów** |`: na końcu komórki „Co się
     stanie” dopisz `; polecenie powłoki z takim kluczem także zostaje **zablokowane**`.
- **Test najpierw** — `core/process/tests/secret-scanner-d8.test.js`, wzór `prompt-gate.test.js`
  (fikstura `relai-d8-` w `os.tmpdir()`, własny `home`, `cwd` procesu i `payload.cwd` = fikstura).
  Wartości składaj w czasie działania: `NAZWA = ['DB', 'PASSWORD'].join('_')`,
  `CZ1 = ['m7Q', '9'].join('')`, `CZ2 = ['rV2', 'zL8pN'].join('')`, `PELNA = CZ1 + CZ2`;
  dla polecenia `NAZWA_T = ['GITHUB', 'TOKEN'].join('_')`. Fikstura z `git init -q` i `.gitignore`
  zawierającym `lokalny.txt`.
  1. `secret-scanner: a secret in a Bash command is denied` — `tool_name: 'Bash'`, polecenie
     `'export ' + NAZWA_T + '=' + PELNA` → `deny`, powód zawiera `w poleceniu powloki`; polecenie
     `curl -H "Authorization: Bearer ` + klucz `'sk-' + ['abcd','EFGH','ijkl','MNOP','qrst'].join('')` → `deny`.
     Kontrole w tym samym teście: `'echo ' + NAZWA_T + '=$' + NAZWA_T` → cisza;
     `git commit -m "fix: secret scan"` → cisza; to samo polecenie z sekretem w katalogu bez markera
     → cisza; w projekcie z `.claude/relai.json` = `{"mode":"guest"}` → cisza.
  2. `hooks.json: secret-scanner is registered for Bash in PreToolUse` — grupa `PreToolUse`, której
     `matcher` pasuje do `'Bash'`, istnieje i jej polecenia zawierają `secret-scanner.js`; grupa
     pasująca do `'Write'` nie pasuje do `'Bash'`.
  3. `secret-scanner: an Edit composing a secret with the file text is denied` — plik
     `NAZWA + '=' + CZ1 + '\n'`, `old_string: CZ1`, `new_string: PELNA` → `deny`, powód zawiera
     `zlozone z tresci pliku`. Kontrole: plik z gotowym sekretem i linią `opis`, edycja `opis` → `opis 2`
     → cisza; ten sam plik, `new_string` z drugim sekretem (`['API','TOKEN'].join('_') + '=' + CZ2 + CZ1`)
     → `deny`; pliku nie ma → cisza; `old_string` nieobecny w pliku → cisza; `new_string` `"$&$'$1"` →
     cisza; `lokalny.txt` (ignorowany) złożony do sekretu → cisza.
  4. `secret-scanner: MultiEdit and replace_all composing a secret are denied` — `MultiEdit` na pliku
     `'A\nB\n'`: `[{ old_string: 'A', new_string: NAZWA + '=' + CZ1 }, { old_string: CZ1, new_string: PELNA }]`
     → `deny`; `Edit` z `replace_all: true` na pliku `NAZWA + '=' + CZ1 + 'ZZ\n'`, `old_string: 'ZZ'`,
     `new_string: CZ2` → `deny`.
  5. `secret-scanner: a CRLF file with a two-line LF old_string is composed after normalization` —
     plik `NAZWA + '=' + CZ1 + '\r\nend\r\n'`, `old_string: CZ1 + '\nend'`, `new_string: PELNA + '\nend'`
     → `deny`.

  FAKT z prototypu (13 przypadków na hooku z `main @ 5aeab39` i na wersji z tej karty): dziś czerwone
  1, 3 (przypadek główny), 4 i 5; po zmianie wszystkie zgodne z oczekiwaniem.
- **Weryfikacja:** `node --test core/process/tests/secret-scanner-d8.test.js` → 5 zielonych;
  `node core/tools/validate-adapters.js` → `wywolania z hooks.json: 19`.
- **Nie ruszasz:** reguł `core/guardrails/secret-scan.js` (etap E3); kosztu skanu długich ciągów
  (D10, niska waga — tu tylko limit `LIMIT_PELNEGO_SKANU`); `Write` (pełna treść pliku jest już
  w `content`); `NotebookEdit`; adapterów Cursora i Codeksa (Codex skanuje `Bash` od dawna);
  edycji usuwającej fragment (`new_string` pusty) — hook wychodzi na `if (!payload)`, świadomie.
- **Pułapki:**
  - Hook `secret-scanner` **Twojej sesji** (3.7.0) zablokuje zapis testu, w którym stoi gotowe
    przypisanie sekretu — także w nazwie przypadku. Składaj wartości w czasie działania.
  - Twoja sesja nie blokuje jeszcze poleceń `Bash` z sekretem; nie sprawdzaj karty „na żywo”
    wpisując sekret w powłokę — dowodem jest test.
  - `git init` w fiksturze potrzebuje gita w `PATH`; `git check-ignore` dla `lokalny.txt` wymaga
    repozytorium — bez niego kontrola „ignorowany” sprawdza gałąź `.env`, nie `.gitignore`.
- **Gotowe, gdy:** pięć testów zielonych; `hooks.json` ma grupę `^Bash$` w `PreToolUse`;
  walidator kod 0.

---

## K-E3 — `bash-guard`: cztery ostrzeżenia dla poleceń powłoki i D-44 po commicie

- **Cel:** (1) nowy hook `bash-guard.js` (PreToolUse, `^Bash$`) ostrzega — nie blokuje — przed
  gołym `cd`, `sed -i` na pliku `.md`, backslashem w heredoku albo w `node -e` / `python -c` oraz
  `/tmp/` w poleceniu z `node`; (2) hook Stop `doc-sync-reminder` przypomina jednym zdaniem, gdy od
  daty ostatniego wpisu dziennika są commity zmieniające kod, a żaden nie zmienia `docs/DZIENNIK.md`
  ani `docs/STATE.md`.
- **Pliki:** `adapters/claude-code/hooks/bash-guard.js` (nowy), `adapters/claude-code/hooks/hooks.json`,
  `adapters/claude-code/hooks/doc-sync-reminder.js`, `README.md`, `docs/PRZEWODNIK.md`,
  `core/process/tests/bash-guard.test.js` (nowy), `core/process/tests/doc-sync-reminder.test.js` (nowy).
- **Stan dziś:** reguły stoją wyłącznie w `CLAUDE.md` („W poleceniu Bash nigdy gołe `cd`”, „Tekst
  z backslashem … nie idzie przez powłokę”, „Tekst dokumentu z backtickiem zmieniasz wyłącznie
  narzędziem Edit/Write”), a lekcje-powtórki po ich awansie to L-0290, L-0293, L-0276 (raport, E3);
  `/tmp` dla Node — L-0265, L-0309. `doc-sync-reminder.js:64-71`:

  ```js
    const files = out.split('\n')
      .map((l) => l.slice(3).trim().replace(/^"|"$/g, ''))
      .filter(Boolean);
    if (!files.length) return process.exit(0);

    const codeChanged = files.filter((f) => !/\.md$/i.test(f) && !f.startsWith('.claude/'));
    const docsChanged = files.some((f) => /(^|\/)docs\/(STATE|DZIENNIK|JOURNAL)\.md$/i.test(f));
    if (!codeChanged.length || docsChanged) return process.exit(0);
  ```

  FAKT (raport E3): `git log --since=2026-10-29 -- docs/DZIENNIK.md docs/STATE.md` → 0 commitów
  przy 6 commitach bez merge w tym okresie — siatka patrzy tylko na drzewo robocze.
- **Kanał ostrzeżenia:** `hookSpecificOutput.additionalContext` z `hookEventName: 'PreToolUse'` —
  kształt jak w `humanize-continuous.js:41-47` (`wypisz`) i `quality-gate.js:51-58`. FAKT: schemat
  wyjścia hooków w binarce Claude Code 2.1.317 (sesja z 2026-11-09) ma dla `PreToolUse` pole
  `additionalContext:o().optional()` obok `permissionDecision`.
- **Rozstrzygnięcia:** reguła „gołe `cd`” patrzy wyłącznie na **początek** polecenia, jak w zleceniu —
  `cd` po `&&` zostawiamy (YAGNI); `bash-guard` jest hookiem ostrzegawczym, więc przy awarii zostawia
  ślad i kończy kodem 0, bez `ask` (D-41, K-C4); przypomnienie Stop liczy commity od **północy** dnia
  wpisu (`git log --since="<data> 00:00:00"`), bo `--since=<data>` bez godziny git uzupełnia bieżącą
  godziną; jedno wywołanie gita z limitem 5 s i `--max-count=200`.
- **Zmiana:**
  1. Utwórz `adapters/claude-code/hooks/bash-guard.js` (prototyp tej treści przeszedł tabelę niżej,
     36 z 36 przypadków):

     ```js
     #!/usr/bin/env node
     'use strict';
     // RelAI hook: bash-guard — PreToolUse (Bash), OSTRZEGA (D-41). Cztery nawyki powloki, ktore
     // wracaly w lekcjach mimo reguly w CLAUDE.md (audyt 2026-11-09, E3): gole cd, sed -i na pliku .md,
     // backslash w heredoku albo w node -e / python -c, /tmp/ w poleceniu z node. Ostrzezenie trafia
     // do modelu przed wykonaniem polecenia i go nie zatrzymuje (zasada 12). Sekret w poleceniu
     // blokuje secret-scanner (D-41: blokuja wylacznie secret-scanner i config-protection).
     // Konwencja hook-guard: poza projektem RelAI i w trybie goscia wyjscie kodem 0 bez efektu.
     // Blad wewnetrzny: jedna linia sladu na stderr, kod 0 (hook ostrzegawczy, K-C4). Komunikaty ASCII.

     const HOOK = 'bash-guard';
     function nazwaBledu(e) { return String((e && (e.code || e.name)) || 'nieznany').replace(/[^\x20-\x7e]/g, '?'); }
     function slad(e) { try { process.stderr.write('[RelAI ' + HOOK + '] blad: ' + nazwaBledu(e) + '\n'); } catch (_) { /* stderr zamkniety */ } }

     const path = require('path');

     let core;
     try {
       core = require(path.resolve(__dirname, '..', '..', '..', 'core', 'process', 'session-signals.js'));
     } catch (e) {
       slad(e);
       process.exit(0);
     }

     const MARKERY_GOSCIA = ['.claude/relai.json'];

     const GOLE_CD = /^\s*cd(?:\s|$)/;
     const SEGMENT = /\|\||&&|[;|\n]/;
     const SED_START = /^\s*\(?\s*sed\s/;
     const SED_W_MIEJSCU = /\s(?:-[A-Za-z]*i\S*|--in-place\S*)(?=\s|$)/;
     const PLIK_MD = /\.md(?=$|[\s"')])/;
     const HEREDOC = /(?<!<)<<(?!<)-?\s*['"]?[A-Za-z_][A-Za-z0-9_]*/;
     const INLINE_SKRYPT = /(?:^|[\s;&|(])(?:node(?:\.exe)?\s+(?:-e|--eval|-p|--print)|python[0-9.]*(?:\.exe)?\s+-c|py\s+-c)(?=[\s=]|$)/;
     const BACKSLASH = /\\/;
     const NODE = /(?:^|[\s;&|(/\\])node(?:\.exe)?(?=\s|$)/;
     const TMP = /(?:^|[\s'"=:(<>])\/tmp\//;

     function sedNaMd(cmd) {
       return cmd.split(SEGMENT).some((s) => SED_START.test(s) && SED_W_MIEJSCU.test(s) && PLIK_MD.test(s));
     }

     const NAWYKI = [
       { test: (c) => GOLE_CD.test(c),
         tekst: 'Polecenie zaczyna sie od golego cd: katalog sesji zostaje zmieniony dla nastepnych polecen. ' +
           'Podaj sciezke w argumencie albo uzyj podpowloki ( cd <katalog> && <polecenie> ) (L-0298, L-0302).' },
       { test: sedNaMd,
         tekst: 'sed -i zmienia plik .md: dokument z backtickiem albo cudzyslowem zmieniaj narzedziem Edit/Write, ' +
           'nie podmiana w powloce (L-0198, L-0207).' },
       { test: (c) => (HEREDOC.test(c) || INLINE_SKRYPT.test(c)) && BACKSLASH.test(c),
         tekst: 'Heredoc albo node -e / python -c z backslashem: powloka zmienia backslash, zanim dotrze do skryptu. ' +
           'Skrypt z wyrazeniem regularnym albo sciezka Windows zapisz narzedziem Write i uruchom z pliku (L-0116, L-0130).' },
       { test: (c) => NODE.test(c) && TMP.test(c),
         tekst: '/tmp/ w poleceniu z node: Node na Windows czyta /tmp jako C:\\tmp, a powloka pisze gdzie indziej. ' +
           'Uzyj katalogu scratchpad sesji albo os.tmpdir() (L-0265, L-0309).' },
     ];

     function main(input) {
       if (String(input.tool_name || '') !== 'Bash') return process.exit(0);
       const ti = input.tool_input || {};
       const cmd = typeof ti.command === 'string' ? ti.command : '';
       if (!cmd.trim()) return process.exit(0);
       const cwd = input.cwd || process.cwd();
       if (!core.relaiMarkerFile(cwd, MARKERY_GOSCIA)) return process.exit(0);

       const w = NAWYKI.filter((n) => n.test(cmd)).map((n) => n.tekst);
       if (!w.length) return process.exit(0);
       console.log(JSON.stringify({
         hookSpecificOutput: {
           hookEventName: 'PreToolUse',
           additionalContext: '[RelAI bash-guard - OSTRZEZENIE, polecenie nie zatrzymane] ' + w.join(' '),
         },
       }));
       process.exit(0);
     }

     let raw = '';
     process.stdin.setEncoding('utf8');
     process.stdin.on('data', (d) => { raw += d; });
     process.stdin.on('error', (e) => { slad(e); process.exit(0); });
     process.stdin.on('end', () => {
       const bom = String.fromCharCode(0xfeff);
       const text = raw.startsWith(bom) ? raw.slice(1) : raw;
       try { main(JSON.parse(text || '{}')); } catch (e) { slad(e); process.exit(0); }
     });
     ```

  2. `hooks.json`, grupa `^Bash$` w `PreToolUse` z karty K-D8: dopisz **po** `secret-scanner`
     `{ "type": "command", "command": "node \"${CLAUDE_PLUGIN_ROOT}/adapters/claude-code/hooks/bash-guard.js\"" }`.
  3. `doc-sync-reminder.js`: pod importem `spawnSync` dodaj (funkcja `slad` jest z etapu E4):

     ```js
     let ostatniWpis = () => null;
     try {
       ({ ostatniWpis } = require(path.resolve(__dirname, '..', '..', '..', 'core', 'process', 'session-signals.js')));
     } catch (e) {
       slad(e); // bez rdzenia zostaje sama siatka drzewa roboczego
     }
     const LIMIT_COMMITOW = 200;
     const jestKodem = (f) => !/\.md$/i.test(f) && !f.startsWith('.claude/');
     const jestDokumentemStanu = (f) => /(^|\/)docs\/(STATE|DZIENNIK|JOURNAL)\.md$/i.test(f);

     // K-E3 (D-44 po commicie): data najnowszego wpisu dziennika -> jedno wywolanie git log od tej daty.
     // Zwraca { data, liczba } albo null (brak dziennika, brak daty, brak gita, zgodnosc).
     function commityBezWpisu(cwd) {
       let txt = null;
       for (const n of ['DZIENNIK.md', 'JOURNAL.md']) {
         try { txt = fs.readFileSync(path.join(cwd, 'docs', n), 'utf8'); break; } catch (_) { /* nastepny */ }
       }
       if (txt === null) return null;
       const wpis = ostatniWpis(txt);
       const m = wpis && wpis.match(/^#{2,3}\s+(\d{4}-\d{2}-\d{2})\b/);
       if (!m) return null;
       const r = spawnSync('git', ['log', '--since=' + m[1] + ' 00:00:00', '--no-merges', '--max-count=' + LIMIT_COMMITOW,
         '--name-only', '--format=%x1e'], { cwd, timeout: 5000, encoding: 'utf8', windowsHide: true });
       if (r.error || r.status !== 0) return null;
       const commity = String(r.stdout || '').split('\x1e')
         .map((b) => b.split('\n').map((l) => l.trim()).filter(Boolean))
         .filter((pliki) => pliki.length);
       if (commity.some((pliki) => pliki.some(jestDokumentemStanu))) return null;
       const zKodem = commity.filter((pliki) => pliki.some(jestKodem)).length;
       return zKodem ? { data: m[1], liczba: zKodem } : null;
     }
     ```

     W `main` zastąp blok z kotwicy (od `const files` do `if (!codeChanged.length || docsChanged)`):

     ```js
       const files = out.split('\n')
         .map((l) => l.slice(3).trim().replace(/^"|"$/g, ''))
         .filter(Boolean);

       const codeChanged = files.filter(jestKodem);
       if (files.some(jestDokumentemStanu)) return process.exit(0);
       if (!codeChanged.length) {
         const zaleglosc = commityBezWpisu(cwd);
         if (!zaleglosc) return process.exit(0);
         console.log(JSON.stringify({
           systemMessage: '[RelAI doc-sync-reminder] Od ostatniego wpisu dziennika (' + zaleglosc.data + ') jest ' +
             zaleglosc.liczba + ' commitow zmieniajacych kod, a zaden nie zmienia docs/DZIENNIK.md ani docs/STATE.md ' +
             '(D-44): dopisz wpis albo powiedz uzytkownikowi, dlaczego go nie ma.',
         }));
         return process.exit(0);
       }
     ```

     Dalszy `console.log` z komunikatem „W drzewie roboczym sa zmiany w kodzie…” zostaje bez zmian
     (kanał zmienia ewentualnie K-C9). Komentarz nagłówka pliku uzupełnij o zdanie: „Od E5 planu
     OPTYMALIZACJA_PO_AUDYCIE takze commity od daty ostatniego wpisu dziennika (jedno wywolanie git log).”
  4. `README.md`: w tabeli pod `## Co pilnuje tylko Claude Code`, po wierszu `secret-scanner`, dodaj
     ``| `bash-guard` | ostrzega przed poleceniem powłoki, które łamie regułę projektu: gołe `cd`, `sed -i` na dokumencie, backslash w `node -e` albo heredoku, `/tmp/` z Node | brak | brak |``.
     Liczebnika w zdaniu nad tabelą **nie zmieniasz** (K-E9, etap E14).
  5. `docs/PRZEWODNIK.md`: w tabeli „Pilnuje | Co się stanie” po wierszu `| **śmieci diagnostycznych** |`
     dodaj `| **nawyków powłoki** | polecenie zaczynające się od gołego `cd`, `sed -i` na pliku `.md`, backslash w heredoku albo `node -e` i `/tmp/` w poleceniu z Node dostają **ostrzeżenie** przed wykonaniem; polecenie nie jest zatrzymywane |`.
- **Tabela przypadków `bash-guard`** (wszystkie uruchomione na prototypie 2026-11-09, fikstura
  z markerem, `cwd` = fikstura; „ostrzega: X” = `additionalContext` zawiera zdanie reguły X; „—” = stdout pusty):

  | # | Polecenie | Oczekiwane |
  |---|---|---|
  | 1 | `cd docs && ls` | ostrzega: cd |
  | 2 | `( cd docs && ls )` | — |
  | 3 | `git log --format=%cd -1` | — |
  | 4 | `cd` | ostrzega: cd |
  | 5 | `  cd ..` (dwie spacje na początku) | ostrzega: cd |
  | 6 | `cdk deploy` | — |
  | 7 | `echo cd x` | — |
  | 8 | `sed -i 's/a/b/' docs/STATE.md` | ostrzega: sed |
  | 9 | `sed -i s/a/b/ plik.js` | — |
  | 10 | `sed -n '1,5p' docs/STATE.md` | — |
  | 11 | `sed -i.bak 's/x/y/' README.md` | ostrzega: sed |
  | 12 | `sed --in-place 's/x/y/' a.md` | ostrzega: sed |
  | 13 | `sed -i 's/a.md/b/' x.js` | — |
  | 14 | `git status && sed -i 's/x/y/' CLAUDE.md` | ostrzega: sed |
  | 15 | `node -e "console.log('a` + backslash + `nb')"` | ostrzega: backslash |
  | 16 | `node -e "console.log(1)"` | — |
  | 17 | `python -c "print('` + backslash + `d')"` | ostrzega: backslash |
  | 18 | `cat <<'EOF' > x.js`, linia `const re = /` + backslash + `d+/;`, `EOF` | ostrzega: backslash |
  | 19 | `cat <<'EOF' > x.md`, linia `tekst bez ukosnika`, `EOF` | — |
  | 20 | `grep -n "a` + backslash + `sb" plik.txt` | — |
  | 21 | `node /tmp/x.js` | ostrzega: tmp |
  | 22 | `node skrypt.js > /tmp/out.txt` | ostrzega: tmp |
  | 23 | `ls /tmp/` | — |
  | 24 | `node C:/Users/a/AppData/Local/Temp/x.js` | — |
  | 25 | `npm run build -- --out /tmp/x` | — |
  | 26 | `cd /tmp/x && node a.js` | ostrzega: cd i tmp (jedno wyjście, dwa zdania) |

  Warunki ciszy (te same polecenia): fikstura bez markera → —; fikstura z `.claude/relai.json`
  `{"mode":"guest"}` → —; `tool_name: 'Write'` → —. Wejście `'{nie json'` → stdout pusty, kod 0,
  stderr `[RelAI bash-guard] blad: SyntaxError`. Payload poprzedzony BOM z poleceniem `cd x` → ostrzega: cd.
- **Test najpierw:**
  - `core/process/tests/bash-guard.test.js` — polecenia z backslashem buduj przez
    `const BS = String.fromCharCode(92)`, heredoc przez `'\n'` w łańcuchu. Pomocnik zwraca listę reguł
    rozpoznanych po zdaniach (`golego cd`, `sed -i zmienia plik .md`, `z backslashem`,
    `/tmp/ w poleceniu z node`).
    1. `bash-guard: bare cd warns, subshell and cd inside words do not` — przypadki 1–7.
    2. `bash-guard: sed -i on a .md file warns, other sed calls do not` — 8–14.
    3. `bash-guard: backslash in a heredoc, node -e or python -c warns` — 15–20.
    4. `bash-guard: /tmp/ in a command running node warns` — 21–26.
    5. `bash-guard: warnings never block, are ASCII and stay silent outside RelAI, in guest mode and for other tools` —
       wyjście przypadku 26 nie ma `permissionDecision`, `additionalContext` pasuje do `/^[\x20-\x7e]+$/`;
       trzy warunki ciszy z tabeli.
    6. `bash-guard: malformed stdin leaves one trace line and exit 0; a BOM is accepted`.
    7. `hooks.json: the PreToolUse Bash group runs secret-scanner, then bash-guard` — nazwy plików
       z poleceń grupy `PreToolUse` pasującej do `'Bash'` są dokładnie
       `['secret-scanner.js', 'bash-guard.js']` (wzór: `humanize-continuous.test.js:281-287`).
    Przed zmianą wszystkie siedem są czerwone (hooka nie ma — `spawnSync` daje kod 1 i asercja kodu 0
    nie przechodzi; to jedyny dopuszczalny „czerwony bez logiki” w tym etapie).
  - `core/process/tests/doc-sync-reminder.test.js` — fikstura z `git init -q`, `docs/USTAWIENIA.md`,
    `docs/DZIENNIK.md`; commity z datą przez `env` z `GIT_AUTHOR_DATE` i `GIT_COMMITTER_DATE`
    (oraz `GIT_AUTHOR_NAME`/`EMAIL`, `GIT_COMMITTER_NAME`/`EMAIL`); pomocnik czyta tekst z
    `systemMessage` **albo** z `hookSpecificOutput.additionalContext` — test przeżyje K-C9.
    Dziennik `D` = `'# DZIENNIK\n\n### 2026-11-01 — wpis\n\nAutor: x\n'`.
    1. `doc-sync-reminder: code commits since the last journal entry without a journal or state commit give one sentence` —
       commit `src/a.js` z datą `2026-11-03T10:00:00`, czyste drzewo → tekst zawiera `Od ostatniego wpisu
       dziennika (2026-11-01) jest 1 commitow`. Kontrole (każda na świeżej fiksturze) → stdout pusty:
       dodatkowy commit `docs/DZIENNIK.md`; commit `src/a.js` razem z `docs/STATE.md`; commit samego
       `README.md`; commit `src/a.js` z datą `2026-10-20`; commit kodu i `docs/DZIENNIK.md` zmieniony
       w drzewie; `stop_hook_active: true`; projekt bez `git init`; dziennik z nagłówkiem bez daty.
       Kontrola dotychczasowa: plik `b.js` niezacommitowany → tekst zawiera `W drzewie roboczym`.
    2. `doc-sync-reminder: a commit on the day of the newest entry counts, in a descending journal the newest date wins` —
       commit `src/a.js` z datą `2026-11-01T08:00:00` → tekst o commitach; dziennik malejący
       (`### 2026-11-01 — nowy` nad `### 2026-09-01 — stary`) z commitem kodu z `2026-10-15` → stdout pusty.
    FAKT z prototypu (12 przypadków): dziś czerwone są dokładnie przypadek główny testu 1 i przypadek
    główny testu 2; po zmianie 12 z 12 zgodnych.
- **Miejsca, które zmienia piętnasty hook** (sprawdzone grepem 2026-11-09):

  | Miejsce | Kotwica | Co robisz |
  |---|---|---|
  | `adapters/claude-code/hooks/hooks.json` | grupa `"matcher": "^Bash$"` w `PreToolUse` (z K-D8) | krok 2 |
  | `core/MANIFEST.json` | `"entry": "./../adapters/claude-code/hooks/hooks.json"` | nic — manifest nie wylicza hooków, a `session-signals.js` stoi już w `uses` adaptera |
  | `core/tools/validate-adapters.js` | `sprawdzone.push('wywolania z hooks.json: ' + odwolania.length);` | nic w kodzie; licznik w wyjściu 19 → 20, a `odwolania z kodu adapterow do rdzenia` rośnie o 1 (bash-guard) i o 1 (doc-sync) |
  | `core/tools/release-checks.js` | `function kontrolaReadmeHooki(ctx) {` | nic w kodzie; kontrola wymaga wiersza w tabeli README (krok 4) i liczebnika w prozie (E14) |
  | testy liczące hooki | `humanize-continuous.test.js:281-287` i `:364` (grupy `PostToolUse`), `release-check.test.js` i `release-pre-push.test.js` (fikstury), `mods/hooks/inventory.test.ts` (fikstury) | nic — żaden nie czyta grupy `PreToolUse` prawdziwego `hooks.json` |
  | `README.md` | wiersz tabeli zaczynający się od `` `secret-scanner` `` pod `## Co pilnuje tylko Claude Code` | krok 4 (wiersz tabeli) |
  | `docs/PRZEWODNIK.md` | wiersz tabeli zaczynający się od `**śmieci diagnostycznych**` | krok 5 |
  | `docs/STATE.md` | `czternastoma hookami` | nic tutaj — liczebnik, E14 |

- **Weryfikacja:** `node --test core/process/tests/bash-guard.test.js core/process/tests/doc-sync-reminder.test.js`
  → 9 zielonych; `node core/tools/validate-adapters.js` → `wywolania z hooks.json: 20`.
- **Nie ruszasz:** liczebników słownych o liczbie hooków — robi to karta K-E9 w etapie E14; lista
  miejsc dla E14: `README.md:194` („ma ich czternaście”), `docs/PRZEWODNIK.md:120` („Trzynaście
  hooków … Dwa blokują, siedem ostrzega, cztery pracują cicho”; po E5: piętnaście — dwa blokują,
  osiem ostrzega, pięć pracuje cicho), `docs/PRZEWODNIK.md:245` („rejestracja trzynastu hooków”),
  `docs/PRZEWODNIK.md:246` („czternaście hooków Node.js”), `docs/STATE.md:12` („czternastoma hookami
  … (czternasty: `session-title`)”), `docs/STATE.md:105` („czternasty hook”), `docs/STATE.md:227`
  („14 hooków”) oraz aneks D-40 w `docs/DECYZJE.md`. Poza tym: kanał `systemMessage` obu przypomnień
  (K-C9); kopie `isRelaiProject` i dispatcher (C5); parsery ustawień (C8); martwy kod (C11);
  sprzątanie stanu (C12); D10, D11; `core/guardrails` (E3); koszt startu C1–C3 (E7); tryb ciągły (E9).
- **Pułapki:**
  - Twoja sesja nie ma `bash-guard` — jego ostrzeżeń nie zobaczysz przy własnych poleceniach do
    wydania; dowodem jest test.
  - Wzorce z backslashem piszesz narzędziem Write/Edit; kontrolę pozytywną daje tabela (przypadki
    15, 17, 18 muszą trafić). Nie sprawdzaj wzorca `node -e` z powłoki.
  - Komunikaty `bash-guard` są ASCII: zwykły łącznik `-` w `[RelAI bash-guard - OSTRZEZENIE …]`,
    nie półpauza z innych hooków.
  - `git log --since` liczy datę **commitera** — fikstura ustawia obie daty.
  - `release-check.js` będzie czerwony na `readme-hooki` (proza „czternaście” przy 15 hookach) aż do
    E14 — to stan oczekiwany; bramka `pre-push` działa tylko na tagi, a tagów przed E14 nie ma.
- **Gotowe, gdy:** dziewięć testów zielonych; tabela przypadków zgodna w teście; `hooks.json` ma
  w grupie `^Bash$` dwa hooki w kolejności `secret-scanner`, `bash-guard`; README i PRZEWODNIK mają
  nowe wiersze.

---

## K-C9 — `journal-signature` bierze najnowszy wpis; kanał przypomnień po pomiarze (karta warunkowa)

- **Cel:** `journal-signature` sprawdza podpis **najnowszego** wpisu także w dzienniku rosnącym
  w górę; przy wyniku pomiaru `NIE WIDZI` oba hooki (`journal-signature`, `doc-sync-reminder`)
  mówią do modelu przez `additionalContext`.
- **Pliki:** `adapters/claude-code/hooks/journal-signature.js`,
  `adapters/claude-code/hooks/doc-sync-reminder.js` (tylko przy `NIE WIDZI`),
  `core/process/tests/journal-signature.test.js` (nowy).
- **Stan dziś:** `journal-signature.js:91-97`:

  ```js
  // Ostatni wpis = ostatni naglowek "### " w pliku. Zwraca { tytul, linie }.
  function ostatniWpis(txt) {
    const linie = txt.split('\n');
    let start = -1;
    for (let i = linie.length - 1; i >= 0; i--) {
      if (/^###\s+\S/.test(linie[i])) { start = i; break; }
    }
  ```

  Rdzeń ma `ostatniWpis` (`core/process/session-signals.js:1032`, eksport `:1881`), który wybiera
  wpis o najpóźniejszej dacie i zwraca **tekst** wpisu od linii nagłówka. Kanały: `journal-signature.js:126-129`
  i `:142-146` oraz `doc-sync-reminder.js` (`console.log(JSON.stringify({ systemMessage: …`).
  FAKT ze schematu binarki Claude Code 2.1.317: `systemMessage` ma opis „Warning message shown to the
  user”; `Stop` ma `hookSpecificOutput.additionalContext` z opisem „non-error feedback delivered to the
  model; the conversation continues so the model can act on it”. Przewidywanie wyniku E2: `NIE WIDZI`
  — ale karta wykonuje to, co zapisał pomiar.
- **Zmiana:**
  1. **Zawsze.** W `journal-signature.js` zastąp funkcję z kotwicy:

     ```js
     // Ostatni wpis = wpis NAJNOWSZY wedlug rdzenia (dziennik rosnacy w gore albo w dol).
     let ostatniWpisRdzenia;
     try {
       ({ ostatniWpis: ostatniWpisRdzenia } = require(path.resolve(__dirname, '..', '..', '..', 'core', 'process', 'session-signals.js')));
     } catch (e) {
       slad(e);
       process.exit(0);
     }
     function ostatniWpis(txt) {
       const wpis = ostatniWpisRdzenia(txt);
       if (!wpis) return null;
       const linie = wpis.split('\n');
       return {
         tytul: linie[0].replace(/^#{2,3}\s+/, '').trim(),
         // Podpis stoi tuz pod naglowkiem; szukamy w kilku pierwszych liniach wpisu.
         glowa: linie.slice(1, 8).join('\n'),
       };
     }
     ```

  2. **Odczyt pomiaru:** `grep -n "^C9:" docs/plany/OPTYMALIZACJA_PO_AUDYCIE/POMIARY.md`. Brak pliku,
     brak linii albo wartość inna niż `NIE WIDZI` / `WIDZI` → zatrzymujesz się (warunek etapu).
  3. **`C9: WIDZI`:** kanałów nie zmieniasz. Do wpisu dziennika etapu dopisz jedno zdanie:
     „K-C9: kanał `systemMessage` pominięty — pomiar E2 zapisał `C9: WIDZI`.”
  4. **`C9: NIE WIDZI`:**
     a) `journal-signature.js` — oba `console.log(JSON.stringify({ systemMessage: … }))` zamień na
        `console.log(JSON.stringify({ hookSpecificOutput: { hookEventName: 'PostToolUse', additionalContext: <ten sam tekst> } }))`;
     b) `doc-sync-reminder.js` — tylko gdy człowiek odpowiedział „Przenieść” na pytanie (b) etapu:
        oba komunikaty (drzewo robocze i commity) zamień na
        `console.log(JSON.stringify({ hookSpecificOutput: { hookEventName: 'Stop', additionalContext: <ten sam tekst> } }))`,
        a w tekście o drzewie roboczym `', …'` zamień na `', ...'` (ASCII). Warunek
        `if (input.stop_hook_active) return process.exit(0);` **zostaje** — to on ogranicza dodatkową
        turę do jednej na zatrzymanie. Odpowiedź „Zostawić”: `doc-sync-reminder.js` bez zmian,
        zdanie o tym w dzienniku.
- **Test najpierw** — `core/process/tests/journal-signature.test.js`. Fikstura: `docs/USTAWIENIA.md`
  z markerem, `.git/config` zapisany ręcznie (`'[user]\n\tname = Jan Testowy\n'`), `home` pusty
  (`HOME`, `USERPROFILE`), payload `PostToolUse`/`Edit` na `docs/DZIENNIK.md`. Pomocnik zwraca
  `'brak autora'`, `'bez czlonu'` albo `'cisza'`, czytając tekst z `systemMessage` albo
  `hookSpecificOutput.additionalContext`. `OK` = `'Autor: RelAI (Opus 5.5) + Jan Testowy'`.
  1. `journal-signature: in a descending journal the newest entry at the top is checked` —
     `### 2026-11-02 — b` z treścią bez autora nad `### 2026-11-01 — a` z `OK` → `brak autora`;
     wariant z `Autor: RelAI (Haiku)` w nowszym → `bez czlonu`. Kontrola: rosnący (`2026-11-01` z `OK`,
     niżej `2026-11-02` bez autora) → `brak autora`.
  2. `journal-signature: an older unsigned entry below the newest one is ignored` — malejący:
     `2026-11-02` z `OK` nad `2026-11-01` bez autora → `cisza`. Kontrola: rosnący z najnowszym `OK`
     na dole → `cisza`.
  3. **Tylko przy `NIE WIDZI`:** `C9: model-facing reminders use additionalContext` — wyjście
     `journal-signature` z przypadku `brak autora` ma `hookSpecificOutput.hookEventName === 'PostToolUse'`
     i nie ma klucza `systemMessage`; przy odpowiedzi „Przenieść” także wyjście `doc-sync-reminder`
     z przypadku głównego testu 1 K-E3 ma `hookSpecificOutput.hookEventName === 'Stop'`.
  FAKT z prototypu (5 przypadków): dziś czerwone trzy przypadki dziennika malejącego, po zmianie 5 z 5.
- **Weryfikacja:** `node --test core/process/tests/journal-signature.test.js` → 2 zielone (3 przy
  `NIE WIDZI`); `node --test core/process/tests/doc-sync-reminder.test.js` → 2 zielone (pomocnik czyta
  oba kanały).
- **Nie ruszasz:** pomiaru C9 (robi go etap E2 i zapisuje w `POMIARY.md`); formatu podpisu D-63;
  `gitUserName`; rozpoznania projektu w tym hooku (C5); kanałów innych hooków.
- **Pułapki:**
  - `additionalContext` w hooku `Stop` **wznawia rozmowę** (opis ze schematu 2.1.317) — bez
    `stop_hook_active` powstałaby pętla. Nie usuwaj tego warunku i nie przenoś go niżej.
  - Rdzeń zwraca wpis jako **tekst**, nie obiekt — adapter z kroku 1 musi go rozłożyć; nagłówek
    `## RRRR-MM-DD` (projekty zaadoptowane) też jest wpisem.
  - Twoja sesja ma `journal-signature` 3.7.0 — przy wpisie dziennika tego etapu hook sesji czyta
    ostatni nagłówek pliku; to nie jest dowód zmiany w żadną stronę.
- **Gotowe, gdy:** testy zielone w liczbie z „Weryfikacji”; wynik pomiaru i odpowiedź człowieka
  zapisane we wpisie dziennika etapu.
