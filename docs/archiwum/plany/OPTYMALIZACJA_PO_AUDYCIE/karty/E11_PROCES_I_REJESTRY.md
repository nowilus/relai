# E11 — Proces i rejestry

Konwencje wspólne: [00_KONWENCJE.md](00_KONWENCJE.md). Etap skraca rejestr artefaktów, poprawia
dopasowanie wpisu w hooku `profile-rules.js`, dokłada fakt z repozytorium do przeglądu spraw
i przepięcie linków do zamknięcia planu, a regułę Cursora zrównuje z D-88.

- **Karty w kolejności wykonania:** K-E6 → K-C7 → K-E2 → K-E4 → K-R11. K-E6 jest pierwsza, bo
  podmienia cały `docs/ARTEFAKTY.md` wyjściem skryptu, a dowód („klucze przed = klucze po”) jest
  czysty tylko na rejestrze nietkniętym w tym etapie; wpisy wersji tego etapu (K-R11) mają powstać
  już w nowym kształcie komórki. K-C7 zmienia komórkę „Plik” jednego wiersza — po skróceniu.
  K-E4 zależy od aneksu D-88 z etapu E8, więc stoi na końcu kart treściowych: jej zatrzymanie nie
  blokuje pozostałych. K-R11 podbija wersje raz za cały etap.
- **Efekt widoczny:** rejestr ma ok. 79 KB zamiast 145 KB; hook ostrzega o pliku, którego ścieżki
  nie ma w kolumnie „Plik”, i milczy o fiksturach; pytanie o sprawę przeterminowaną niesie fakt
  z repozytorium; zamknięcie planu nie zostawia martwych linków.
- **Szacunek:** SZACUNEK 1 sesja.
- **Nie ruszasz (cały etap):** znalezisk niskiej wagi wyłączonych z planu — E10 raportu
  (`/relai-help`, `SPEC_KOMENDY.md`), E11 raportu (linia „Sesja nieinteraktywna”), C8; dokumentów
  repozytorium z etapu E1 (`CLAUDE.md`, `AGENTS.md`, pozycje dziennika); treści aneksu D-88 (etap
  E8 — tu tylko jego odbicie w regule Cursora); hooków poza `profile-rules.js` (etapy E4, E5).
- **Pułapki wspólne kart:** dokument z backtickiem zmieniasz wyłącznie narzędziem Edit/Write;
  `plan-closing.md` miał przed E10 status `M` przy pustym `git diff` (końce linii) — po E10 ma realny
  diff, a jeśli nadal widzisz sam `M` bez treści, to stan zastany; w sesji działają hooki
  zainstalowanego 3.7.0, więc zmiana `profile-rules.js` nie zmienia zachowania Twojej sesji.
- **Warunki zatrzymania:** `sprawdz-rejestr.js` zgłasza `BLAD`; w `docs/DECYZJE.md` nie ma aneksu
  D-88 z etapu E8 (zatrzymujesz **tylko** K-E4 i piszesz to w dzienniku); liczba ostrzeżeń hooka po
  K-C7 różni się od podanej w karcie; test z „Test najpierw” zielony przed zmianą.
- **Weryfikacja etapu** (po K-R11):

  ```bash
  node adapters/codex/generate-skills.js --verify
  node core/tools/validate-adapters.js
  node --test "core/process/tests/*.test.*"
  node --test "adapters/codex/tests/*.test.js"
  node --test "adapters/cursor/tests/*.test.js"
  node core/tools/release-check.js --json --tylko artefakty
  ```

  Oczekiwane: kod 0 generatora i walidatora; `core/process` = liczba z wpisu dziennika E10 **+6**
  (K-C7 +4 w nowym `profile-rules.test.js`, K-E2 +1 w `ritual-texts.test.js`, K-E4 +1
  w `ritual-copies.test.js`; K-E6 testów nie dokłada); pozostałe zestawy bez zmiany liczby;
  w raporcie `artefakty` pusta lista `bledy`. Kontrola `readme-hooki` jest czerwona od etapu E5 do
  karty K-E9 w etapie E14 — to stan oczekiwany, nie naprawiasz go tutaj.

Pliki pomocnicze (wyjście skryptu skracającego) zapisujesz w katalogu scratchpad swojej sesji —
w kartach oznaczonym `<TMP>` (sekcja 6 konwencji).

---

## K-E6 — `docs/ARTEFAKTY.md`: komórka „Co się zmieniło” niesie wpis bieżącej wersji

- **Cel:** rejestr traci kronikę wersji w komórkach (historia zostaje w gicie i w datowanej kopii),
  klucze `plik|wersja|data` czytane przez kontrolę wydania są identyczne przed i po, a specyfikacja
  rejestru mówi, jak prowadzić komórkę od teraz.
- **Pliki:** `docs/ARTEFAKTY.md`, nowy `docs/archiwum/artefakty/ARTEFAKTY_<RRRR-MM-DD>.md` (data
  dnia wykonania; jedyny plik w `docs/archiwum/` tworzony przez plan — wyjątek od sekcji 7 konwencji
  wymagany przez tę kartę), `core/templates/SPEC_PROFILE.md`.
- **Stan dziś** (FAKT, `main @ 5aeab39`): 145 240 B, 270 linii, 118 wierszy tabel z kolumną „Co się
  zmieniło”; najdłuższy wiersz 8 426 znaków. Katalogu `docs/archiwum/artefakty/` nie ma; nazwa idzie
  za konwencją archiwów (`DZIENNIK_<od>_<do>.md`, `RYZYKA_<data>.md`). Kontrola, która czyta rejestr:
  `artefakty` („ARTEFAKTY.md: zmieniony artefakt ma nowy wpis od bazy”, `kontrolaArtefakty()`
  w `core/tools/release-checks.js`, klucze z `wierszeRejestru()`); dziś
  `plikow rejestru 108, zmienionych od bazy 0, bez wpisu 0`. Hook startu czyta rejestr funkcją
  `wersjeRejestru()` (`core/process/session-signals.js:767`) — tylko kolumny „Plik” i „Wersja”.
  Wiersz ``Specyfikacja `USTAWIENIA.md` `` (dziś linia 52) ma w treści nieucieczkowany znak `|`
  (kotwica: `„Wiersz | Czyta go”`, jedno wystąpienie w pliku) i dzieli się na 9 części przy
  8 w nagłówku.
  **Korekta liczb z `USTALENIA_ROBOCZE.md` §2:** 85 010 B zmierzono bez naprawy tego wiersza —
  skrypt uciął wtedy tylko część komórki przed `|`, a 5,5 KB starej historii zostało w dziewiątej,
  osobnej komórce. Z naprawą **przed** skróceniem (zmierzone przy pisaniu karty): 145 241 B →
  **79 466 B**, 38 wierszy skróconych ze 118, 127 kluczy identycznych, 38 linii zmienionych,
  0 błędów; wiersz 52: 8 270 → 800 B.
- **Liczby w dniu wykonania będą inne** — etap E10 (karta K-R10) i wcześniejsze dopisały wpisy
  wersji na początku komórek. Wiążące są relacje: `bledow: 0`, liczba kluczy przed = po, liczba linii
  zmienionych = liczba skróconych, rozmiar po ≤ 85 000 B.
- **Zmiana:**
  1. Raport kontroli przed: `node core/tools/release-check.js --json --tylko artefakty > <TMP>/rc-przed.json`.
  2. Naprawa znaku `|`: w `docs/ARTEFAKTY.md` zamień `„Wiersz | Czyta go”` na `„Wiersz \| Czyta go”`
     (narzędzie Edit; nic poza tym znakiem).
  3. Kopia datowana (po naprawie, żeby tabela archiwum renderowała się poprawnie; od wersji w gicie
     różni się jednym dodanym znakiem — backslashem przed `|`):
     `mkdir -p docs/archiwum/artefakty && cp docs/ARTEFAKTY.md docs/archiwum/artefakty/ARTEFAKTY_<RRRR-MM-DD>.md`.
  4. Skrócenie i podmiana:

     ```bash
     Z=docs/plany/OPTYMALIZACJA_PO_AUDYCIE/karty/zalaczniki
     node $Z/skroc-rejestr.js docs/archiwum/artefakty/ARTEFAKTY_<RRRR-MM-DD>.md <TMP>/ARTEFAKTY.po.md ARTEFAKTY_<RRRR-MM-DD>.md
     cp <TMP>/ARTEFAKTY.po.md docs/ARTEFAKTY.md
     ```

     Skrypt wypisuje `wierszy tabel z kolumna: W, skroconych: S, bajty przed: B1, po: B2` — zapisz
     linię do wpisu dziennika.
  5. Dowód: `node $Z/sprawdz-rejestr.js docs/archiwum/artefakty/ARTEFAKTY_<RRRR-MM-DD>.md docs/ARTEFAKTY.md`
     → `kluczy: N, linii zmienionych: S, bledow: 0` (N — z tego samego polecenia uruchomionego
     wcześniej na kopii z samą sobą; na `main` 127).
  6. Kontrola wydania po: `node core/tools/release-check.js --json --tylko artefakty > <TMP>/rc-po.json`
     → obiekt kontroli `artefakty` identyczny jak w `rc-przed.json` (pola `licznik` i `bledy`).
  7. Reguła na przyszłość — `core/templates/SPEC_PROFILE.md`, tabela „Co zawiera wpis”. PRZED:
     `| Co się zmieniło | jedno zdanie o różnicy wobec poprzedniej wersji |`. PO:
     `| Co się zmieniło | wpis **bieżącej** wersji: data, numer wersji i jedno zdanie o różnicy wobec poprzedniej; przy podbiciu wersji poprzedni wpis znika z komórki i zostaje w historii gita |`.
     Pod akapitem zaczynającym się od `**Jak wygląda porównanie wersji:**` dopisz akapit:

     ```
     Komórka „Co się zmieniło” nie jest kroniką. Rejestr z historią wersji w komórkach urósł
     w repozytorium RelAI do 145 KB (`FAKT`, 2026-11-09) i był czytany przy każdej edycji artefaktu;
     dlatego przy podbiciu wersji wpis bieżący zastępuje poprzedni, a odsyłacz „Starsze wersje: […]”
     do datowanej kopii w `docs/archiwum/artefakty/`, jeśli komórka go ma, zostaje na jej końcu.
     ```

  8. To samo w `docs/ARTEFAKTY.md`, sekcja „Zasady prowadzenia” — po punkcie zaczynającym się od
     `- Wersja jest liczbą całkowitą rosnącą;` dopisz punkt (łam do 100 znaków, wcięcie dwóch spacji):

     ```
     - Komórka „Co się zmieniło” niesie wpis **bieżącej** wersji; przy podbiciu wersji poprzedni wpis
       znika z komórki (zostaje w gicie), a odsyłacz „Starsze wersje” zostaje na końcu komórki.
     ```

- **Przykład wiersza** (`SPEC_PROMPT_ETAPU.md`, dziś linia 43; 3 735 → 667 B; skróty „…” — moje):

  ```
  PRZED: | Specyfikacja promptu etapowego | `core/templates/SPEC_PROMPT_ETAPU.md` | 11 | 2026-08-07 | 2026-10-27 (wersja 11, miniplan „Tabela Stan prac w limicie”): krok 4 sekcji 9 — … i tabela rosła z każdym planem. 2026-10-24 (wersja 10, BEZPIECZENSTWO E3): akapit „Bezpieczeństwo” w sekcji 8 — … | Prompt etapowy jest całą pamięcią świeżej sesji; … |
  PO:    | Specyfikacja promptu etapowego | `core/templates/SPEC_PROMPT_ETAPU.md` | 11 | 2026-08-07 | 2026-10-27 (wersja 11, miniplan „Tabela Stan prac w limicie”): krok 4 sekcji 9 — … i tabela rosła z każdym planem. Starsze wersje: [ARTEFAKTY_2026-11-09.md](archiwum/artefakty/ARTEFAKTY_2026-11-09.md). | Prompt etapowy jest całą pamięcią świeżej sesji; … |
  ```
- **Test najpierw:** nie dotyczy (zmiana danych; dowodem są kroki 5 i 6). Kontrola przed zmianą:
  `grep -F '„Wiersz | Czyta go”' docs/ARTEFAKTY.md | awk -F'|' '{print NF}'` → `9`, a ten sam
  `awk` na linii nagłówka tabeli → `8` (awk nie zna ucieczki `\|`, więc po kroku 2 nadal pokaże `9`
  — to kontrola wyłącznie stanu przed).
- **Weryfikacja:** kroki 5 i 6; `wc -c docs/ARTEFAKTY.md` → ≤ 85 000;
  narzędziem Grep w trybie `count` (wzorców z backslashem nie przepuszczasz przez powłokę):
  wzorzec `Starsze wersje: .ARTEFAKTY_` w `docs/ARTEFAKTY.md` → `S`;
  wzorzec `Wiersz .. Czyta go` w `docs/ARTEFAKTY.md` → `0` (wiersz skrócony — fragment przeszedł do
  archiwum) i ten sam wzorzec w `docs/archiwum/artefakty/ARTEFAKTY_<RRRR-MM-DD>.md` → `1`;
  `node --test core/process/tests/release-check.test.js` → zielony.
- **Nie ruszasz:** kolumn „Plik”, „Wersja”, „Data”, „Po co”; sekcji „Poza rejestrem — świadomie”;
  `skroc-rejestr.js` i `sprawdz-rejestr.js` (załączniki zamrożone z planem).
- **Pułapki:** kolejność kroków 2 → 3 → 4 jest wiążąca — skrócenie przed naprawą zostawia osierocony
  fragment w dodatkowej komórce, a `sprawdz-rejestr.js` zgłosi wtedy `liczba komorek 9 -> 8`.
  Polecenia z backslashem nie składasz w `node -e` — piszesz je do pliku narzędziem Write
  (sekcja 6 konwencji). Skrypt zachowuje końce linii pliku wejściowego.
- **Gotowe, gdy:** `bledow: 0`, obiekty `artefakty` przed i po identyczne, plik ≤ 85 000 B.

---

## K-C7 — `profile-rules.js`: wpis w rejestrze dopasowany po pełnej ścieżce

- **Cel:** hook profilu `prompty` uznaje plik za wpisany tylko wtedy, gdy jego pełna ścieżka stoi
  w kolumnie „Plik” rejestru; materiał testowy, kopia generowana skilli Codeksa, `AGENTS.md`
  i `LICENCJE.md` nie są artefaktami; skill przyjęty z zewnątrz ma wpis zbiorczy z listą plików.
- **Pliki:** `adapters/claude-code/hooks/profile-rules.js`, nowy
  `core/process/tests/profile-rules.test.js`, `docs/ARTEFAKTY.md` (komórka „Plik” jednego wiersza).
- **Stan dziś:** `profile-rules.js:186-187`:

  ```js
    const nazwa = rel.split('/').pop() || '';
    if (tresc.indexOf(rel) === -1 && tresc.indexOf(nazwa) === -1) {
  ```

  Nazwa `SKILL.md` stoi w rejestrze, więc każdy `SKILL.md` uchodzi za wpisany. FAKT (pętla po hooku,
  polecenie z „Weryfikacji”, 2026-11-09): 232 artefakty wg reguły hooka, dziś ostrzeżenie dla 70.
  Po samym przejściu na pełną ścieżkę: 142 (`c7-count.js`). Rozkład 142 sprawdzony listą
  (koryguje `USTALENIA_ROBOCZE.md` §3): 59 `adapters/codex/skills/` (kopia generowana), 42
  `core/process/tests/fixtures/`, 21 `adapters/claude-code/skills/trivy-scan/evals/` (rejestr sam
  mówi: „materiał testowy … poza rejestrem jak fixtury testów”), 14 plików `.md` skilla
  `security-audit` (kopia Cloudflare; rejestr: „jeden wiersz na całą kopię”), 3
  `core/evals/fixtures/`, `AGENTS.md`, `site/fonty/LICENCJE.md`, `site/zasoby/LICENCJE.md`.
  `release-checks.js` obsługuje wpisy z gwiazdką (`globNaRegex`), ale wpis
  `security-audit/**` objąłby też pliki `RELAI-*` z własnymi wierszami — zmiana `RELAI-SYNC.md`
  wymagałaby wtedy nowej wersji dwóch wierszy (fałszywa czerwień). Dlatego wpis zbiorczy wymienia
  ścieżki, a nie wzorzec.
- **Rozstrzygnięcie reguły wyłączeń** (najprostsza, ogólna poza jednym przypadkiem): segment
  katalogu `fixtures/` albo `evals/` = materiał testowy (dowolny projekt); `adapters/codex/skills/`
  = kopia generowana repozytorium RelAI (w innym projekcie ścieżka nie występuje); `AGENTS.md`
  dołącza do nazw wyłączonych obok `CLAUDE.md`, `LICENCJE.md` obok `LICENSE`. Prototyp na
  repozytorium (kopia hooka z tą zmianą, ta sama pętla): **14** ostrzeżeń — dokładnie 14 plików
  `.md` skilla `security-audit`; po dopisaniu ich ścieżek do wiersza kopii (krok 3): **0** z 103
  artefaktów. Realnych braków wpisów (np. plików doczytywanych `relai-core`) **nie ma** — wszystkie
  są w rejestrze po pełnej ścieżce, więc karta nie dopisuje nowych wierszy i nie pyta człowieka.
- **Zmiana:**
  1. `jestArtefaktem()` (dziś linie 117-124) — wzór (komentarze nad funkcją zostają):

     ```js
     // K-C7: material testowy (katalogi fixtures/ i evals/) i kopia generowana skilli Codeksa nie sa
     // artefaktami prowadzonymi w rejestrze; AGENTS.md to blizniak CLAUDE.md, LICENCJE.md to nota.
     const MATERIAL_TESTOWY = /(^|\/)(fixtures|evals)\//i;
     const KOPIA_GENEROWANA = /^adapters\/codex\/skills\//;

     function jestArtefaktem(rel) {
       const nazwa = rel.split('/').pop() || '';
       if (/^(CLAUDE|AGENTS|README|LICENSE|LICENCJE|CHANGELOG|CONTRIBUTING)\.md$/i.test(nazwa)) return false;
       if (MATERIAL_TESTOWY.test(rel) || KOPIA_GENEROWANA.test(rel)) return false;
       return /\.(md|mdc|txt|prompt|tmpl|j2)$/i.test(rel);
     }

     // Sciezki z kolumny "Plik"/"File": naglowek po nazwie kolumny, komorki dzielone po "|" bez "\|",
     // komorka rozbita na slowa (backticki, link, goly tekst). Dopasowanie po pelnej sciezce.
     function sciezkiRejestru(tekst) {
       const zbior = new Set();
       let kolumna = -1;
       for (const wiersz of String(tekst).replace(/\r\n/g, '\n').split('\n')) {
         if (!wiersz.trim().startsWith('|')) { kolumna = -1; continue; }
         const komorki = wiersz.split(/(?<!\\)\|/).map((c) => c.trim());
         const i = komorki.findIndex((c) => /^(Plik|File)$/i.test(c));
         if (i > 0) { kolumna = i; continue; }
         if (kolumna < 0) continue;
         for (const slowo of (komorki[kolumna] || '').split(/[\s`()[\]<>,;+]+/)) {
           if (slowo) zbior.add(slowo.replace(/^\.\//, ''));
         }
       }
       return zbior;
     }
     ```

  2. `regulyPrompty()` — dwie linie ze „Stanu dziś” zastępujesz jedną:
     `  if (!sciezkiRejestru(tresc).has(rel)) {` (treść komunikatu bez zmian).
  3. `docs/ARTEFAKTY.md`, wiersz zaczynający się od ``| Skill `security-audit` (kopia Cloudflare) |``,
     komórka „Plik” (druga). PRZED:

     ```
     `adapters/claude-code/skills/security-audit/SKILL.md` + 20 plików kopii
     ```

     PO (w pliku jedna linia, tu łamana dla czytelności — łączysz pojedynczą spacją):

     ```
     `adapters/claude-code/skills/security-audit/SKILL.md`, `adapters/claude-code/skills/security-audit/AI-AND-LLM.md`,
     `adapters/claude-code/skills/security-audit/ATTACK-CLASSES.md`, `adapters/claude-code/skills/security-audit/CLIENT-SIDE.md`,
     `adapters/claude-code/skills/security-audit/CLOUD-AND-DEPLOYMENT.md`, `adapters/claude-code/skills/security-audit/DATA-ISOLATION-AND-LIFECYCLE.md`,
     `adapters/claude-code/skills/security-audit/DESKTOP-MOBILE-AND-LOCAL-IPC.md`, `adapters/claude-code/skills/security-audit/HUNTING.md`,
     `adapters/claude-code/skills/security-audit/MEMORY-SAFETY-AND-BINARY.md`, `adapters/claude-code/skills/security-audit/PROTOCOLS-RPC-AND-MESSAGING.md`,
     `adapters/claude-code/skills/security-audit/RECONNAISSANCE.md`, `adapters/claude-code/skills/security-audit/RESOURCE-EXHAUSTION-AND-AVAILABILITY.md`,
     `adapters/claude-code/skills/security-audit/SUPPLY-CHAIN-AND-RELEASE.md`, `adapters/claude-code/skills/security-audit/VALIDATION-AND-REPORTING.md`,
     `adapters/claude-code/skills/security-audit/WEB-PROTOCOL-AND-AUTH.md` + 6 plików bez tekstu instrukcji (`LICENSE`, `report-schema.json`, cztery `.cjs`)
     ```

     Wersji i daty wiersza nie zmieniasz — treść kopii się nie zmieniła, zmienia się opis jej
     zakresu. Kontrola: `git ls-files adapters/claude-code/skills/security-audit/ | grep -c "\.md$"`
     → `17` (15 plików kopii z listy i dwa pliki `RELAI-*` z własnymi wierszami).
- **Test najpierw:** nowy `core/process/tests/profile-rules.test.js`, wzór hooka testowanego
  `spawnSync` jak w `prompt-gate.test.js`. Uruchomiony na hooku sprzed zmiany: 3 czerwone na
  asercji, 1 zielony (sprawdzone przy pisaniu karty); po zmianie 4 zielone.

  ```js
  'use strict';
  // Hook profile-rules (K-C7): wpis w rejestrze artefaktow dopasowany po pelnej sciezce z kolumny
  // "Plik"; material testowy, kopia generowana Codeksa, AGENTS.md i LICENCJE.md nie sa artefaktami.
  const assert = require('node:assert/strict');
  const test = require('node:test');
  const fs = require('node:fs');
  const os = require('node:os');
  const path = require('node:path');
  const { spawnSync } = require('node:child_process');

  const HOOK = path.resolve(__dirname, '..', '..', '..', 'adapters', 'claude-code', 'hooks', 'profile-rules.js');

  function projekt(wiersze) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'relai-profile-rules-'));
    fs.mkdirSync(path.join(dir, 'docs'));
    fs.writeFileSync(path.join(dir, 'docs', 'USTAWIENIA.md'), '# USTAWIENIA\n\nWersja RelAI: 3.7.0\n\n'
      + '| Data | Ustawienie | Decyzja |\n|---|---|---|\n| 2026-11-09 | Profil projektu | prompty |\n');
    fs.writeFileSync(path.join(dir, 'docs', 'ARTEFAKTY.md'), '# ARTEFAKTY\n\n'
      + '| Artefakt | Plik | Wersja | Data | Co się zmieniło | Po co |\n|---|---|---|---|---|---|\n'
      + wiersze.join('\n') + '\n');
    return dir;
  }
  // Kontekst ostrzezenia albo '' przy ciszy.
  function edycja(dir, rel) {
    const r = spawnSync(process.execPath, [HOOK], {
      input: JSON.stringify({ cwd: dir, tool_name: 'Edit', tool_input: { file_path: path.join(dir, ...rel.split('/')) } }),
      encoding: 'utf8', timeout: 30000,
    });
    const out = (r.stdout || '').trim();
    return out ? JSON.parse(out).hookSpecificOutput.additionalContext : '';
  }
  const wpis = (plik) => '| Skill | ' + plik + ' | 1 | 2026-11-09 | nowy | test |';

  test('same file name in two directories: only the registered path is silent', (t) => {
    const dir = projekt([wpis('`skills/a/SKILL.md`')]);
    t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
    assert.equal(edycja(dir, 'skills/a/SKILL.md'), '');
    assert.match(edycja(dir, 'skills/b/SKILL.md'), /artefakt "skills\/b\/SKILL\.md" nie ma wpisu/);
  });

  test('test material and the generated Codex copy are not artifacts', (t) => {
    const dir = projekt([wpis('`skills/a/SKILL.md`')]);
    t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
    for (const rel of ['core/process/tests/fixtures/humanize/01-state.md', 'skills/t/evals/case/prompt.md',
      'adapters/codex/skills/relai-core/SKILL.md']) {
      assert.equal(edycja(dir, rel), '', rel);
    }
  });

  test('AGENTS.md and LICENCJE.md are not artifacts', (t) => {
    const dir = projekt([wpis('`skills/a/SKILL.md`')]);
    t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
    assert.equal(edycja(dir, 'AGENTS.md'), '');
    assert.equal(edycja(dir, 'site/fonty/LICENCJE.md'), '');
  });

  // Ochrona przed regresja parsera (zielony przed i po): wpis bez backtickow i cel linku.
  test('a bare path and a link target in the Plik column count as entries', (t) => {
    const dir = projekt([wpis('prompts/system.md'), wpis('[prompt użytkownika](prompts/user.md)')]);
    t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
    assert.equal(edycja(dir, 'prompts/system.md'), '');
    assert.equal(edycja(dir, 'prompts/user.md'), '');
    assert.match(edycja(dir, 'prompts/other.md'), /artefakt "prompts\/other\.md" nie ma wpisu/);
  });
  ```

- **Weryfikacja:** `node --test core/process/tests/profile-rules.test.js` → 4 zielone. Pętla po
  hooku z repozytorium (Git Bash, ok. 25 s, niczego nie zapisuje):

  ```bash
  R=$(cygpath -m "$PWD"); git ls-files | grep -E '\.(md|mdc|txt|prompt|tmpl|j2)$' | grep -vE '^(docs|\.claude)/' \
    | while read -r f; do printf '{"cwd":"%s","tool_input":{"file_path":"%s/%s"}}' "$R" "$R" "$f" \
    | node adapters/claude-code/hooks/profile-rules.js; echo; done | grep -c "nie ma wpisu"
  ```

  Przed zmianą `70`; po krokach 1–2 `14`; po kroku 3 `0`. Liczba »przed« może różnić się od 70,
  bo karta K-E6 wcześniej w tym etapie skraca rejestr, a stara reguła szuka nazwy pliku w całym
  tekście; wiążące są liczby po zmianie: 14 po wyłączeniach i 0 po dopisaniu ścieżek. Inna liczba po kroku 3 → wypisz ścieżki
  (zamień `grep -c "nie ma wpisu"` na `grep -o 'artefakt [^ ]*'`) i zatrzymaj się: plik spoza listy ze „Stanu
  dziś” to nowy artefakt bez wpisu — pytasz człowieka, czy dopisać wiersz (wzór:
  ``| <nazwa po ludzku> | `<ścieżka>` | 1 | <data pojawienia się z git log --diff-filter=A> | nowy (<skąd>): <co> | <po co> |``).
  `node core/tools/release-check.js --json --tylko artefakty` → licznik `plikow rejestru` większy
  o 14 niż po K-E6, `bledy` bez zmian.
- **Nie ruszasz:** reguł profilu `app`; `POZA_PROJEKTEM`; treści komunikatu; pamięci podręcznej
  rejestru (kierunek C7 „po czasie modyfikacji” — rejestr po K-E6 ma ok. 79 KB, zysk nie uzasadnia
  kodu); innych hooków (etapy E4, E5).
- **Pułapki:** wyrażenia regularne z backslashem wpisujesz narzędziem Edit, a wzorzec sprawdza test
  (kontrola pozytywna: fikstura `core/process/tests/fixtures/…` musi trafić w `MATERIAL_TESTOWY`).
  W sesji działa hook 3.7.0 z pluginu — jego zachowanie się nie zmieni; dowodem jest test i pętla po
  pliku z repozytorium. Wiersz rejestru zostaje jedną linią.
- **Gotowe, gdy:** 4 testy zielone i pętla daje `0`.

---

## K-E2 — przegląd spraw niesie fakt, zamknięcie planu przepina linki

- **Cel:** (a) pytanie o sprawę przeterminowaną podaje sprawdzony fakt z repozytorium jako
  podpowiedź, a decyzja zostaje u człowieka; (b) zamknięcie planu przepina linki do folderów
  przeniesionych do `docs/fixy/` i `docs/archiwum/plany/`.
- **Pliki:** `adapters/claude-code/skills/relai-core/overdue-review.md`,
  `adapters/cursor/rules/relai-core.mdc`, `adapters/claude-code/skills/relai-planning/plan-closing.md`,
  `adapters/claude-code/commands/relai-stage.md`, `adapters/cursor/rules/relai-planning.mdc`,
  `core/process/tests/ritual-texts.test.js`; kopie Codeksa.
- **Stan dziś:** `overdue-review.md:37-38` zakazuje zamykania „bo widać, że nieaktualna” (L-0025),
  więc sprawa „Rozjazd manifestu …”, załatwiona commitem `2c41a07`, wracała co 30 dni (raport E2).
  `plan-closing.md` punkt 2 przenosi odnogi do `docs/fixy/`, punkt 7 plan do `docs/archiwum/plany/`,
  i żaden nie przepina linków — dziennik prowadził do nieistniejącego
  `archiwum/plany/ROZWOJ_PO_WYDANIU/odnogi/OPIS_REPO/ODNOGA.md`. Fragmenty-kotwice w `relai-stage.md`
  i `relai-planning.mdc` zostały nietknięte przez etap E10 (karta K-E7 je oszczędziła).
- **Zmiana:**
  1. `overdue-review.md` — **przed** akapitem zaczynającym się od `Pytanie nie zamienia się
     w rozstrzygnięcie za człowieka` wstaw akapit (tamten akapit zostaje bez zmian):

     ```
     **Fakt z repozytorium jako podpowiedź.** Pozycja wskazuje plik, katalog albo wiersz ustawień
     (link, ścieżka w backtickach, nazwa wiersza `USTAWIENIA.md`) → zanim zapytasz, sprawdzasz ten
     fakt **jednym** poleceniem (`Read` albo `Grep`) i podajesz wynik w treści pytania jednym
     zdaniem z miejscem odczytu, np. „`.claude-plugin/plugin.json` ma dziś opis »… for Claude Code,
     Cursor and Codex«”. Link do pliku, którego nie ma, mówisz w tym samym zdaniu. Fakt pokazuje,
     że sprawa jest załatwiona → wybór „Zamknąć” stoi pierwszy jako rekomendowany. Pozycja bez
     pliku i bez ustawienia → pytanie bez podpowiedzi. Decyzję nadal podejmuje człowiek.
     ```

  2. `relai-core.mdc` — **przed** akapitem zaczynającym się od `On the **third and every later**
     deferral` wstaw akapit:

     ```
     **A fact from the repository as a hint.** When the item points to a file, a directory or a
     settings row (a link, a path in backticks, the name of a `USTAWIENIA.md` row), check that fact
     with **one** read or search before you ask, and put the result into the question in one
     sentence that says where you read it; a link to a missing file is said in the same sentence.
     When the fact shows the matter is settled, "Close it" comes first as the recommendation. An
     item without a file or a setting gets the question without a hint. The decision stays the
     human's.
     ```

  3. `plan-closing.md` — lista do odhaczania. PRZED:
     `                  [ ] 5 STATUS  [ ] 6 ryzyka  [ ] 7 archiwum  [ ] 8 CLAUDE.md  [ ] 9 podsumowanie`
     PO: `                  [ ] 5 STATUS  [ ] 6 ryzyka  [ ] 7 archiwum  [ ] 7a linki  [ ] 8 CLAUDE.md`
     + nowa linia `                  [ ] 9 podsumowanie`.
     Po punkcie 7 (`7. **Archiwum** — przenieś … przeniesienie, nie kasowanie.`) wstaw punkt:

     ```
     7a. **Linki do przeniesionych folderów** — zaraz po punkcie 7 przepinasz linki prowadzące do
        starych ścieżek w trzech miejscach: sekcja „Czeka na człowieka” w `docs/DZIENNIK.md`,
        `docs/STATE.md` oraz `CLAUDE.md` i `AGENTS.md` (jeśli istnieje). Zmienia się wyłącznie cel
        linku; tekst linku, treść pozycji i data zostają. Najpierw odnogi przeniesione w punkcie 2
        (`plany/<TEMAT>/odnogi/<NAZWA>/` → `fixy/<NAZWA>/`), potem plan (`plany/<TEMAT>/` →
        `archiwum/plany/<TEMAT>/`) — w `CLAUDE.md` i `AGENTS.md` z przedrostkiem `docs/`. Linię
        „Aktywny plan” zostawiasz punktowi 8. Miejsca znajdujesz poleceniami:
        `grep -nF -e "](plany/<TEMAT>/" -e "](docs/plany/<TEMAT>/" docs/STATE.md CLAUDE.md AGENTS.md`
        i `awk '/^## /{w=($0 ~ /Czeka na człowieka|Waiting for the human/)} w' docs/DZIENNIK.md | grep -nF "](plany/<TEMAT>/"`.
        Kontrola: te same polecenia po edycji nie zwracają nic poza linią „Aktywny plan”. Wpisów
        dziennika nie przepinasz — są zapisem przeszłości.
     ```

  4. `relai-stage.md`, Krok 6 — dwa fragmenty w jednym akapicie (po zmianie przełam akapit do
     100 znaków). PRZED → PO:

     ```
     przegląd ryzyk → przeniesienie folderu planu do `docs/archiwum/plany/` → linia „Aktywny plan"
     ```
     ```
     przegląd ryzyk → przeniesienie folderu planu do `docs/archiwum/plany/` → przepięcie linków
     do przeniesionych folderów → linia „Aktywny plan"
     ```

     Oraz `kroki 1–9 stamtąd.` → `kroki 1–9 (z 7a) stamtąd.`
  5. `relai-planning.mdc`, sekcja 4 (akapit łamiesz do 100 znaków). PRZED → PO:

     ```
     folder to `docs/archiwum/plany/` → update the "Aktywny plan" line
     ```
     ```
     folder to `docs/archiwum/plany/` → repoint links to the moved folders in "Czeka na człowieka",
     `STATE.md` and `CLAUDE.md` / `AGENTS.md` → update the "Aktywny plan" line
     ```
  6. `node adapters/codex/generate-skills.js` — zmienią się:
     `adapters/codex/skills/relai-core/overdue-review.md`,
     `adapters/codex/skills/relai-planning/plan-closing.md`, `adapters/codex/skills/relai-stage/SKILL.md`.
- **Test najpierw:** w `core/process/tests/ritual-texts.test.js` (plik z etapu E10, pomocniki
  `sprawdz` i `OBA`) przypadek:

  ```js
  test('overdue review carries a repository fact, plan closing repoints moved links', () => {
    for (const rel of OBA('adapters/claude-code/skills/relai-core/overdue-review.md')) {
      // nowy akapit obecny, zakaz zamykania za czlowieka nietkniety (dowod negatywny, zasada 3)
      sprawdz(rel, ['**Fakt z repozytorium jako podpowiedź.**', 'Decyzję nadal podejmuje człowiek',
        'sprawy nie zamykasz „bo widać, że nieaktualna" (L-0025)'], []);
    }
    sprawdz('adapters/cursor/rules/relai-core.mdc',
      ['**A fact from the repository as a hint.**', 'because it "looks stale" (L-0025)'], []);
    for (const rel of OBA('adapters/claude-code/skills/relai-planning/plan-closing.md')) {
      sprawdz(rel, ['7a. **Linki do przeniesionych folderów**', '[ ] 7a linki'], []);
    }
    for (const rel of ['adapters/claude-code/commands/relai-stage.md', 'adapters/codex/skills/relai-stage/SKILL.md']) {
      sprawdz(rel, ['przepięcie linków do przeniesionych folderów', 'kroki 1–9 (z 7a)'], []);
    }
    sprawdz('adapters/cursor/rules/relai-planning.mdc', ['repoint links to the moved folders'], []);
  });
  ```

- **Weryfikacja:** `node --test core/process/tests/ritual-texts.test.js` → 4 zielone (3 z E10 + 1);
  `node core/tools/validate-adapters.js` → kod 0;
  `grep -c "Pytanie nie zamienia się w rozstrzygnięcie za człowieka" adapters/claude-code/skills/relai-core/overdue-review.md`
  → `1` (akapit chroniony zostaje).
- **Nie ruszasz:** hooka przeglądu spraw (`session-signals.js`, blok `[RelAI przeglad spraw]`);
  tabeli trzech wyborów; linii „Sesja nieinteraktywna” (znalezisko E11 raportu, poza planem);
  pozycji w `docs/DZIENNIK.md` tego repo (karta K-E2r, etap E1); `rotate.js` (przepina linki
  przy rotacji samodzielnie).
- **Pułapki:** polecenia w punkcie 7a używają `grep -F` — bez backslashy, więc przechodzą przez
  powłokę bez ucieczek; nie zamieniaj ich na `-E`. Lista do odhaczania w `plan-closing.md` stoi
  w bloku kodu — wcięcie drugiej i trzeciej linii jak w pierwszej kontynuacji.
- **Gotowe, gdy:** test zielony, walidator kod 0, grep `1`.

---

## K-E4 — reguła Cursora zgodna z D-88 i test parytetu

- **Cel:** reguła `relai-core.mdc` (zawsze w kontekście Cursora) mówi o celu rotacji to samo co
  D-88 z aneksem z etapu E8 i `document-rotation.md`; test pilnuje obecności zdania zgodnego
  i nieobecności starego.
- **Pliki:** `adapters/cursor/rules/relai-core.mdc`, `core/process/tests/ritual-copies.test.js`.
- **Stan dziś:** `relai-core.mdc:189-191`:

  ```
     stays on the total weight** — below the threshold, silence. The **target moves to the rotatable
     part**: take the oldest items until **it** drops below 60% of the threshold, because a target set
     on the whole file can be unreachable by definition.
  ```

  D-88 (`docs/DECYZJE.md:29`): „Rotacja dokumentu zabiera najstarsze pozycje, aż waga całego żywego
  pliku zejdzie poniżej 60% jego progu — nie »część rotowalna poniżej 60%«”. Źródło skilla
  (`document-rotation.md:116-118`): „**Cel też (D-88)**: najstarsze pozycje schodzą, aż cały żywy
  plik zejdzie poniżej 60% progu; ciąg kończy się wcześniej tylko na pozycji nietykalnej albo po
  wyczerpaniu części rotowalnej.” `ritual-copies.test.js` sprawdza w regule tylko polecenie skrótu.
  Etap E8 (karta K-A3 w `E08_SKROT_PROGI_MODELE.md`) dopisał na końcu tabeli „Decyzje zmienione”
  w `docs/DECYZJE.md` wiersz zaczynający się od `| **D-88** → aneks | <data> |` z dwiema granicami
  reguły: (1) w `docs/LEKCJE.md` wyzwalacz i cel progu w KB liczą się od pliku bez sekcji „Zasady
  aktywne”; (2) sekcja „Stan otwartych ryzyk” ponad progiem bez ani jednego ryzyka `ZAMKNIĘTE` nie
  daje linii `[RelAI progi dokumentow]` na starcie ani komunikatu zablokowanej rotacji — mówi o niej
  jedno zdanie raportu frazy „sprawdź status”. W `document-rotation.md` etap E8 dopisał zdanie
  „W lekcjach trzy wagi i próg liczysz **bez sekcji „Zasady aktywne”** (D-88, aneks <data>).”
  i zdanie o sekcji ryzyk bez `ZAMKNIĘTE`; zdanie „aż cały żywy plik zejdzie poniżej 60% progu”
  zostało bez zmian. Reguły Cursora etap E8 nie zmieniał.
- **Zmiana:**
  1. `grep -n "D-88" docs/DECYZJE.md` — znajdź wiersz aneksu z etapu E8 (zaczyna się od
     `| **D-88** → aneks`) i odczytaj z niego datę aneksu. Brak wiersza → zatrzymaj tę kartę
     (warunek zatrzymania etapu).
  2. `grep -n "aż cały żywy plik zejdzie poniżej" adapters/claude-code/skills/relai-core/document-rotation.md`
     — oczekiwane jedno trafienie. Brak trafienia → zatrzymaj tę kartę i zapytaj człowieka (zdanie
     źródła zmienił ktoś spoza planu).
  3. Zastąp fragment od `The **target moves to the rotatable` do `unreachable by definition.`
     akapitem poniżej; `<RRRR-MM-DD>` zastąp datą aneksu z kroku 1:

     ```
     The **target stays on the total weight
        too (D-88)**: take the oldest items until the whole live file drops below 60% of the
        threshold (for `LEKCJE.md`: without "Zasady aktywne"); the run ends earlier only at an
        untouchable item or when the rotatable part is used up. In `docs/LEKCJE.md` the KB
        threshold and target count the file without the "Zasady aktywne" section; a risk section
        over its threshold with no `ZAMKNIĘTE` risk gives no start line and no blocked-rotation
        message, only one sentence in the "sprawdź status" report (D-88, annex <RRRR-MM-DD>).
     ```

     Łamanie dopasuj do sąsiednich linii (wcięcie trzech spacji, do 100 znaków).
- **Test najpierw:** w `core/process/tests/ritual-copies.test.js` dopisz na końcu przypadek
  (kontrola pozytywna i negatywna w jednym teście — zasada 3):

  ```js
  test('Cursor rule states the D-88 rotation target like document-rotation.md', () => {
    const norm = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8').replace(/\s+/g, ' ');
    const STARE = 'The **target moves to the rotatable part**';
    const NOWE = 'until the whole live file drops below 60% of the threshold (for `LEKCJE.md`: without "Zasady aktywne")';
    const ANEKS_LEKCJE = 'In `docs/LEKCJE.md` the KB threshold and target count the file without the "Zasady aktywne" section';
    const ANEKS_RYZYKA = 'a risk section over its threshold with no `ZAMKNIĘTE` risk gives no start line and no blocked-rotation message, only one sentence in the "sprawdź status" report (D-88, annex';
    // kontrola pozytywna: STARE trafia w brzmienie reguly z main @ 5aeab39
    const PRZED = 'The **target moves to the rotatable part**: take the oldest items until **it** drops below 60% of the threshold';
    assert.ok(PRZED.includes(STARE));
    const mdc = norm('adapters/cursor/rules/relai-core.mdc');
    assert.ok(!mdc.includes(STARE), 'regula Cursora: cel na czesci rotowalnej, sprzeczny z D-88');
    assert.ok(mdc.includes(NOWE), 'regula Cursora: brak celu D-88');
    assert.ok(mdc.includes(ANEKS_LEKCJE), 'regula Cursora: brak aneksu D-88 (lekcje bez Zasad aktywnych)');
    assert.ok(mdc.includes(ANEKS_RYZYKA), 'regula Cursora: brak aneksu D-88 (ryzyka bez ZAMKNIETE)');
    for (const rel of ['adapters/claude-code/skills/relai-core/document-rotation.md',
      'adapters/codex/skills/relai-core/document-rotation.md']) {
      assert.ok(norm(rel).includes('aż cały żywy plik zejdzie poniżej 60% progu'), rel + ': zrodlo D-88');
    }
  });
  ```

  Stałe `NOWE`, `ANEKS_LEKCJE` i `ANEKS_RYZYKA` zawierają spacje pojedyncze, bo `norm` skleja
  łamania linii reguły w jedną spację.
- **Weryfikacja:** `node --test core/process/tests/ritual-copies.test.js` → liczba z E10 + 1,
  wszystkie zielone; `grep -c "target moves to the rotatable" adapters/cursor/rules/relai-core.mdc`
  → `0`; `node --test "adapters/cursor/tests/*.test.js"` → zielony.
- **Nie ruszasz:** `docs/DECYZJE.md` (aneks D-88 należy do E8); `document-rotation.md` i
  `SPEC_ARCHIWUM.md`; reszty kroku 2 w regule (zmieniona w E10, karta K-E7).
- **Pułapki:** `.mdc` jest artefaktem — wersja w K-R11. Normalizacja `\s+` w teście skleja łamania
  linii; nie testuj fragmentów z gwiazdkami rozbitymi przez łamanie.
- **Gotowe, gdy:** test zielony, grep `0`.

---

## K-R11 — rejestr artefaktów za etap (nowy kształt komórki)

- **Cel:** pliki-artefakty zmienione w E11 mają nową wersję w `docs/ARTEFAKTY.md`, zapisaną już
  według reguły z K-E6.
- **Pliki:** `docs/ARTEFAKTY.md`.
- **Stan dziś:** wiersze `overdue-review.md`, `plan-closing.md`, `relai-stage.md`,
  `relai-core.mdc`, `relai-planning.mdc` i `SPEC_PROFILE.md` (6). Wersje bierzesz z pliku (po E10
  część jest już podbita).
- **Zmiana:** w każdym wierszu `Wersja` → obecna + 1, `Data` bez zmian; komórka „Co się zmieniło”
  = nowy wpis `<RRRR-MM-DD> (wersja <N>, plan OPTYMALIZACJA_PO_AUDYCIE E11, karty <…>): <co>. Powód:
  <po co>.` — zastępuje dotychczasowy wpis bieżący; odsyłacz `Starsze wersje: […](…)`, jeśli był,
  zostaje na końcu komórki. `relai-core.mdc` dostaje jeden wpis za K-E2 i K-E4 razem. Hook
  `profile-rules.js` i pliki testów nie są artefaktami (rejestr: „Hooki … kod wykonawczy”).
- **Test najpierw:** nie dotyczy.
- **Weryfikacja:** `node core/tools/release-check.js --json --tylko artefakty` → `"bledy":[]`;
  `git diff --stat docs/ARTEFAKTY.md` pokazuje zmiany z K-E6, K-C7 i tej karty.
- **Nie ruszasz:** wierszy plików spoza etapu.
- **Pułapki:** wpis zaczyna się od daty i `(wersja N` — inaczej przyszłe skracanie go nie rozpozna;
  wiersz tabeli to jedna linia bez nieucieczkowanego `|`.
- **Gotowe, gdy:** raport `artefakty` bez błędów.
