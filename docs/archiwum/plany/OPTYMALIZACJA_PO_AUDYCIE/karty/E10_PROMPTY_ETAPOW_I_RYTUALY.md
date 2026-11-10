# E10 — Prompty etapów i rytuały

Konwencje wspólne: [00_KONWENCJE.md](00_KONWENCJE.md). Etap zmienia **tekst instrukcji pluginu**
(specyfikacje, skille, komendy, reguły Cursora) i dokłada plik testu pilnujący nowych brzmień.
Kodu wykonawczego nie zmienia. Bloki PRZED → PO stoją w kartach jako pary bloków kodu: pierwszy
to tekst dziś, drugi — docelowy; wcięcie bloku w karcie nie należy do tekstu pliku.

- **Karty w kolejności wykonania:** K-A1 → K-E1 → K-E7 → K-R10. K-A1 pierwsza: największy zysk
  (ok. 27 KB na prompt etapu) i zakłada plik testu, do którego dwie następne dopisują po przypadku;
  K-E1 i K-E7 zmieniają te same pliki w rozłącznych akapitach (sprzeczność przed ciężarem);
  K-R10 ostatnia, bo podbija wersje w `docs/ARTEFAKTY.md` raz na plik za cały etap.
- **Efekt widoczny:** następny wygenerowany `PROMPT_ETAP_N.md` (już w tym planie) nie niesie odpisu
  „Zasad aktywnych”, tylko numery zasad do doczytania; opis „kończymy na dziś” w szablonie zgadza
  się z `session-close.md`; ostatni etap planu kończy się jednym wpisem dziennika.
- **Szacunek:** SZACUNEK 1 sesja.
- **Świadomie poza kartami:** rotacja lekcji w `rotate.js` (kierunek E7 raportu) — nowy parser
  sekcji „Lekcje” z dolną granicą, odsyłaczem i testami plus trzy opisy to SZACUNEK ponad pół
  sesji; do wpisu dziennika jako „świadomie odłożone”.
- **Nie ruszasz (cały etap):** znalezisk niskiej wagi wyłączonych z planu — E10 raportu
  (`/relai-help`, `SPEC_KOMENDY.md`), E11 raportu (linia „Sesja nieinteraktywna”), C8; dokumentów
  repozytorium z etapu E1 (`CLAUDE.md`, `AGENTS.md`, pozycje dziennika); aneksu D-88 (etap E8);
  hooków (etapy E4, E5, E11).
- **Pułapki wspólne kart:** dokument z backtickiem zmieniasz wyłącznie narzędziem Edit/Write;
  `plan-closing.md` i `stage-closing.md` w obu adapterach mają w drzewie roboczym status `M` przy
  pustym `git diff` (różnica końców linii) — stan zastany, nie „naprawiasz” go; po edycji te pliki
  mają realny diff, a generator zapisuje kopię Codeksa z LF. W sesji działają hooki zainstalowanego
  3.7.0 — dowodem zmiany jest test, nie zachowanie sesji.
- **Warunki zatrzymania:** kotwica nie pasuje (sekcja 2 konwencji); test z „Test najpierw” jest
  zielony przed zmianą; `node core/tools/validate-adapters.js` zgłasza rozjazd rytuału „Na koniec”
  (lista kroków skilla musi zostać `[1,1a,2,3,4,5,6]`); plik testu `ritual-texts.test.js` już
  istnieje z inną treścią.
- **Weryfikacja etapu** (po K-R10):

  ```bash
  node adapters/codex/generate-skills.js --verify
  node core/tools/validate-adapters.js
  node --test "core/process/tests/*.test.*"
  node --test "adapters/codex/tests/*.test.js"
  node --test "adapters/cursor/tests/*.test.js"
  node core/tools/release-check.js --json --tylko artefakty
  ```

  Oczekiwane: generator i walidator kod 0, walidator wypisuje `rytual "Na koniec": 3 list, kroki
  [1,1a,2,3,4,5,6]`; `core/process` = liczba z wpisu dziennika E9 **+3** (K-A1 +1, K-E1 +1, K-E7 +1);
  `adapters/codex` i `adapters/cursor` bez zmiany liczby; w raporcie `artefakty` pusta lista `bledy`.
  Kontrola `readme-hooki` jest czerwona od etapu E5 do karty K-E9 w etapie E14 — to stan
  oczekiwany, nie naprawiasz go tutaj.

**Rytuał „Na koniec” tego etapu, krok 4 (`docs/STATE.md`):** w akapicie „Świadomie odłożone” planu
KONTEKST_STARTU (dziś linie 135-138) usuwasz ostatni człon — ten, który zaczyna się od słów
„zdanie Aneksu D w” i kończy na „Zasadami aktywnymi”.” — sprawę rozstrzyga karta K-A1; średnik
przed nim zamieniasz na kropkę. Reszty akapitu nie zmieniasz.

---

## K-A1 — prompt etapu wymienia numery zasad, nie przepisuje ich treści

- **Cel:** wzór promptu etapu (i promptu odnogi) każe wpisać **numery** zasad aktywnych do
  doczytania i numery ryzyk etapu, zakazuje dosłownego odpisu sekcji „Zasady aktywne”, a szablon
  `CLAUDE.md` niesie zdanie Aneksu D o porównaniu z wyzwalaczami indeksu (D-15, Aneks A).
- **Pliki:** `core/templates/SPEC_PROMPT_ETAPU.md`, `core/templates/SPEC_ODNOGA.md`,
  `core/templates/SPEC_CLAUDE_MD.md`, `adapters/claude-code/skills/relai-planning/stage-prompts.md`,
  `adapters/claude-code/skills/relai-planning/deviation-and-branches.md`,
  `adapters/claude-code/commands/relai-stage.md`, `adapters/claude-code/commands/relai-branch.md`,
  `adapters/cursor/rules/relai-planning.mdc`, nowy `core/process/tests/ritual-texts.test.js`;
  kopie Codeksa z generatora (krok 9).
- **Stan dziś:** `SPEC_PROMPT_ETAPU.md:91-92` i `:118-119` każą wpisać zasady do lektur i przepisać
  je w całości; przykład (`:260-261`) czyta sekcję ryzyk i „Zasady aktywne”, które niesie skrót startu
  (raport A1; FAKT: `PANEL_CODEX/PROMPT_ETAP_1.md` 44 569 B, z czego odpis zasad 27 503 B).
  `SPEC_ODNOGA.md`, `relai-branch.md` i `deviation-and-branches.md` powtarzają „przepisane w całości”
  dla promptu odnogi — zasada 1 każe poprawić całą rodzinę. Zdanie odłożone w `docs/STATE.md:138`
  ma dwie części: szablonowi `CLAUDE.md` brakuje zdania Aneksu D (stoi w `CLAUDE.md` tego repo),
  a `SPEC_PROMPT_ETAPU.md` każe przepisać zasady. Rozstrzygnięcie: obie wchodzą tutaj — zachowanie,
  które ma działać zawsze, mieszka w warstwie obecnej w każdej sesji (zasada 8; pomiar E4
  KONTEKST_STARTU: sesje bez skrótu pomijały indeks).
- **Zmiana** (każdy akapit: PRZED → PO; zamieniasz tylko cytowany fragment):
  1. `SPEC_PROMPT_ETAPU.md`, sekcja „4. Co przeczytać na start”. PRZED:

     ```
     - Zawsze obecne: `CLAUDE.md`, aktywne zasady z rejestru lekcji, `PLAN.md` (sekcje właściwe dla tego
       etapu), pliki, które etap będzie zmieniał.
     ```

     PO:

     ```
     - Zawsze obecne: `CLAUDE.md`, `PLAN.md` (sekcje właściwe dla tego etapu), pliki, które etap
       będzie zmieniał, oraz wiersz `docs/LEKCJE.md` z **numerami** zasad aktywnych do doczytania
       („pełne brzmienie zasad 1 i 3”). Sekcji „Zasady aktywne” i tabeli ryzyk nie wpisujesz jako
       lektury: indeks zasad i tabelę ryzyk niesie skrót startu (`start-digest.js`), który świeża
       sesja uruchamia w rytuale startu (D-15, Aneks A).
     ```

  2. Ta sama specyfikacja, sekcja „6. Stan wyjściowy”. PRZED:

     ```
     - **listę aktywnych zasad z rejestru lekcji**, przepisaną w całości (nie linkiem): świeża sesja
       czyta `LEKCJE.md`, ale zasada wpisana wprost w prompt działa nawet wtedy, gdy plik urośnie.
     ```

     PO:

     ```
     - **numery zasad aktywnych do doczytania i numery ryzyk etapu** — po jednej linii, bez treści:
       „Zasady do doczytania z `docs/LEKCJE.md` (pełne brzmienie): 1, 3.” i „Ryzyka etapu: R3, R5
       (wiersze w tabeli skrótu startu).” Zasadę wybierasz, gdy jej wyzwalacz z indeksu trafia
       w zakres etapu; żadna nie trafia → „Zasady do doczytania: brak”. Projekt bez indeksu liczy
       numery tak samo — skrót pokazuje wtedy całą sekcję. Odpisu sekcji „Zasady aktywne” nie
       wklejasz: indeks niesie skrót startu, a odpis rośnie razem z rejestrem (`FAKT`, audyt RelAI
       2026-11-09: prompt etapu 44 569 B, z czego odpis zasad 27 503 B).
     ```

  3. Sekcja „Zakazy” — **po** punkcie zaczynającym się od `- Nie zostawiasz w prompcie odsyłacza
     do pliku, którego nie ma` (ostatni punkt listy) dopisz punkt:

     ```
     - Nie wklejasz do promptu dosłownego odpisu sekcji „Zasady aktywne” ani tabeli ryzyk — prompt
       wymienia ich numery, a treść niesie skrót startu i `docs/LEKCJE.md` (D-15, Aneks A).
     ```

  4. Przykład, tabela lektur (dwa wiersze). PRZED:

     ```
     | `docs/DZIENNIK.md` | sekcja „Stan otwartych ryzyk" + wpis z 2026-08-14 o E1 (co powstało i czego nie zweryfikowano) |
     | `docs/LEKCJE.md` | wyłącznie sekcja „Zasady aktywne" |
     ```

     PO:

     ```
     | `docs/DZIENNIK.md` | wyłącznie wpis z 2026-08-14 o E1 (co powstało i czego nie zweryfikowano); tabelę ryzyk niesie skrót startu |
     | `docs/LEKCJE.md` | wyłącznie pełne brzmienie zasad 1, 2 i 3 z sekcji „Zasady aktywne” (indeks niesie skrót startu) |
     ```

  5. Przykład, sekcja „Stan wyjściowy”. PRZED — sześć linii, pierwsza i ostatnia:

     ```
     **Zasady aktywne z `docs/LEKCJE.md`, obowiązujące w tym etapie:**
     3. Migracji Prismy nie edytujesz po wygenerowaniu; poprawka to nowa migracja (L-0004).
     ```

     PO — dwie linie:

     ```
     **Zasady do doczytania z `docs/LEKCJE.md` (pełne brzmienie):** 1, 2, 3.
     **Ryzyka etapu:** R2 (webhook bez weryfikacji podpisu) — wiersz w tabeli skrótu startu.
     ```

  6. `stage-prompts.md`, punkty 4 i 6. PRZED:

     ```
     4. **Co przeczytać na start** — tabela `Plik | Po co`, z dopiskiem „w tej kolejności, nic więcej".
     ```
     ```
        przepisane w całości „Zasady aktywne" z rejestru lekcji.
     ```

     PO (pierwsza linia punktu 4 bez zmian, dochodzi kontynuacja; w punkcie 6 zmienia się tylko
     druga linia):

     ```
     4. **Co przeczytać na start** — tabela `Plik | Po co`, z dopiskiem „w tej kolejności, nic więcej".
        Bez sekcji ryzyk i bez sekcji „Zasady aktywne” — niesie je skrót startu; `docs/LEKCJE.md`
        wchodzi wierszem z numerami zasad do doczytania.
     ```
     ```
        numery zasad aktywnych do doczytania i numery ryzyk etapu — bez odpisu ich treści (D-15, Aneks A).
     ```
  7. `relai-stage.md`, Krok 3. PRZED:

     ```
       z **realnego stanu repozytorium** (sprawdzasz, nie zakładasz) i z sekcji „Zasady aktywne"
       rejestru lekcji.
     ```

     PO:

     ```
       z **realnego stanu repozytorium** (sprawdzasz, nie zakładasz) i z indeksu „Zasad aktywnych”
       (numery zasad do doczytania, bez odpisu ich treści).
     ```

  8. Rodzina promptu odnogi (zasada 1) — cztery miejsca, każde PRZED → PO.
     `SPEC_ODNOGA.md:146-147`:

     ```
     - **„Zasady aktywne" z `docs/LEKCJE.md` przepisane w całości** — tak samo jak w prompcie etapowym.
       Odnoga jest mniejsza, ale świeża sesja jest tak samo świeża.
     ```
     ```
     - **numery zasad aktywnych do doczytania** z `docs/LEKCJE.md` — tak samo jak w prompcie etapowym
       (`SPEC_PROMPT_ETAPU.md`, sekcja 6): jedna linia z numerami, bez odpisu treści. Odnoga jest
       mniejsza, ale świeża sesja jest tak samo świeża.
     ```

     `SPEC_ODNOGA.md:199`:

     ```
     - Nie zostawiasz karty bez sekcji „Weryfikacja" (D-25) ani promptu bez „Zasad aktywnych".
     ```
     ```
     - Nie zostawiasz karty bez sekcji „Weryfikacja" (D-25) ani promptu bez linii z numerami zasad
       do doczytania; odpisu „Zasad aktywnych” nie wklejasz.
     ```

     `SPEC_ODNOGA.md:293-296` (przykład) — cztery linie od pierwszej do `(L-0003).` zastępuje jedna:

     ```
     **Zasady aktywne z `docs/LEKCJE.md`, obowiązujące w tym wątku** (przepisane w całości):
     ```
     ```
     **Zasady do doczytania z `docs/LEKCJE.md` (pełne brzmienie):** 1, 2.
     ```

     `relai-branch.md:77-78` (koniec linii 77 i początek 78; dalsza linia `zamknięcia odnogi.` bez
     zmian):

     ```
        „Nie ruszasz planu głównego"), stan wyjściowy z **realnego stanu repozytorium** i z „Zasadami
        aktywnymi" przepisanymi w całości z `docs/LEKCJE.md`, zakres i weryfikacja z karty odnogi, rytuał
     ```
     ```
        „Nie ruszasz planu głównego"), stan wyjściowy z **realnego stanu repozytorium** i z numerami
        zasad aktywnych do doczytania z `docs/LEKCJE.md` (bez odpisu treści), zakres i weryfikacja
        z karty odnogi, rytuał
     ```

     `deviation-and-branches.md:47-48`:

     ```
        sesji, generowany tak jak prompty etapowe: **z realnego stanu repo** i z „Zasad aktywnych"
        przepisanych w całości.
     ```
     ```
        sesji, generowany tak jak prompty etapowe: **z realnego stanu repo** i z numerami „Zasad
        aktywnych” do doczytania, bez odpisu ich treści.
     ```

  9. `relai-planning.mdc`, punkt 4 sekcji 4 (trzecia linia punktu staje się dwiema):

     ```
        active lessons. A stage without the next prompt is not finished.
     ```
     ```
        index of "Zasady aktywne": the prompt names the numbers of the rules to read in full and
        never copies their wording. A stage without the next prompt is not finished.
     ```
  10. `SPEC_CLAUDE_MD.md` — zdanie Aneksu D, dwa miejsca. Struktura, punkt 2. PRZED:

      ```
         plik ładuje harness, więc go nie wymieniasz. Dopisz zdanie „plików, które skrót streszcza, nie
         otwierasz na starcie i nie skanujesz repo pełnotekstowo”.
      ```

      PO:

      ```
         plik ładuje harness, więc go nie wymieniasz. Dopisz zdanie „plików, które skrót streszcza, nie
         otwierasz na starcie i nie skanujesz repo pełnotekstowo” oraz zdanie „zanim pierwszy raz
         zmienisz plik, porównaj zadanie z wyzwalaczami indeksu »Zasad aktywnych«; trafienie →
         przeczytaj pełne brzmienie tej zasady z `docs/LEKCJE.md`, dopiero potem praca” (D-15,
         Aneks A — warstwa obecna w każdej sesji, także gdy skrót startu nie został uruchomiony).
      ```

      Przykład Parkly, akapit rytuału (w bloku kodu przykładu). PRZED → PO:

      ```
      startu. Plików, które skrót streszcza, nie otwierasz na starcie i nie skanujesz repo
      pełnotekstowo; pełne sekcje wskazują drogowskazy na końcu skrótu.
      ```
      ```
      startu. Plików, które skrót streszcza, nie otwierasz na starcie i nie skanujesz repo
      pełnotekstowo; pełne sekcje wskazują drogowskazy na końcu skrótu. Zanim pierwszy raz zmienisz
      plik, porównaj zadanie z wyzwalaczami indeksu „Zasad aktywnych”; trafienie → przeczytaj pełne
      brzmienie tej zasady z `docs/LEKCJE.md`, dopiero potem praca.
      ```
  11. `node adapters/codex/generate-skills.js` — zmienią się: `adapters/codex/skills/relai-planning/stage-prompts.md`,
      `adapters/codex/skills/relai-planning/deviation-and-branches.md`,
      `adapters/codex/skills/relai-stage/SKILL.md`, `adapters/codex/skills/relai-branch/SKILL.md`.
- **Test najpierw:** nowy plik `core/process/tests/ritual-texts.test.js` (wzór niżej; dwie następne
  karty dopisują do niego po jednym przypadku). Przypadek `stage prompt names rule numbers and never
  copies active rules`. Przed zmianą czerwony na pierwszej asercji „nieobecne” — fragmenty są
  przepisane z plików `main @ 5aeab39`, więc czerwień jest zarazem kontrolą pozytywną wzorca
  (zasada 3).

  ```js
  'use strict';
  // Brzmienia rytualow i promptow etapu (OPTYMALIZACJA_PO_AUDYCIE E10-E11) w zrodle i kopii
  // Codeksa. Fragmenty "nieobecne" sa doslownie z main @ 5aeab39 (czerwien przed = kontrola pozytywna).
  const assert = require('node:assert/strict');
  const test = require('node:test');
  const fs = require('node:fs');
  const path = require('node:path');

  const ROOT = path.resolve(__dirname, '..', '..', '..');
  // CRLF -> LF, a podzial linii z wcieciem i znacznikiem cytatu -> jedna spacja.
  function czytaj(rel) {
    return fs.readFileSync(path.join(ROOT, rel), 'utf8').replace(/\r\n/g, '\n').replace(/\n[>\s]*/g, ' ');
  }
  function sprawdz(rel, obecne, nieobecne) {
    const t = czytaj(rel);
    for (const s of nieobecne) assert.ok(!t.includes(s), rel + ': zostal stary tekst "' + s + '"');
    for (const s of obecne) assert.ok(t.includes(s), rel + ': brak nowego tekstu "' + s + '"');
  }
  const OBA = (rel) => [rel, rel.replace('adapters/claude-code/skills/', 'adapters/codex/skills/')];

  test('stage prompt names rule numbers and never copies active rules', () => {
    sprawdz('core/templates/SPEC_PROMPT_ETAPU.md',
      ['Nie wklejasz do promptu dosłownego odpisu sekcji „Zasady aktywne”',
        'Zasady do doczytania z `docs/LEKCJE.md` (pełne brzmienie)'],
      ['przepisaną w całości (nie linkiem)', 'aktywne zasady z rejestru lekcji',
        '| `docs/LEKCJE.md` | wyłącznie sekcja „Zasady aktywne" |']);
    for (const rel of OBA('adapters/claude-code/skills/relai-planning/stage-prompts.md')) {
      sprawdz(rel, ['numery zasad aktywnych do doczytania'], ['przepisane w całości „Zasady aktywne"']);
    }
    for (const rel of OBA('adapters/claude-code/skills/relai-planning/deviation-and-branches.md')) {
      sprawdz(rel, ['do doczytania, bez odpisu ich treści'], ['przepisanych w całości']);
    }
    for (const rel of ['adapters/claude-code/commands/relai-stage.md', 'adapters/codex/skills/relai-stage/SKILL.md']) {
      sprawdz(rel, ['z indeksu „Zasad aktywnych”'], ['i z sekcji „Zasady aktywne" rejestru lekcji']);
    }
    for (const rel of ['adapters/claude-code/commands/relai-branch.md', 'adapters/codex/skills/relai-branch/SKILL.md']) {
      sprawdz(rel, ['zasad aktywnych do doczytania'], ['przepisanymi w całości']);
    }
    sprawdz('core/templates/SPEC_ODNOGA.md', ['numery zasad aktywnych do doczytania'], ['przepisane w całości']);
    sprawdz('adapters/cursor/rules/relai-planning.mdc', ['never copies their wording'],
      ['(check, do not assume) and the active lessons']);
    const aneksD = czytaj('core/templates/SPEC_CLAUDE_MD.md').split('porównaj zadanie z wyzwalaczami indeksu').length - 1;
    assert.equal(aneksD, 2, 'SPEC_CLAUDE_MD: zdanie Aneksu D w strukturze i w przykladzie');
  });
  ```

- **Weryfikacja:**
  `node --test core/process/tests/ritual-texts.test.js` → 1 zielony;
  `grep -rn "przepisan[a-ząę]* w całości" core/templates adapters/claude-code/commands adapters/claude-code/skills/relai-planning`
  → brak trafień (kontrola rodziny, zasada 1);
  przed zmianą `grep -c "porównaj zadanie z wyzwalaczami indeksu" core/templates/SPEC_CLAUDE_MD.md`
  → `0` (obecność w obu miejscach po zmianie sprawdza test, odporny na łamanie linii);
  `node core/tools/validate-adapters.js` → kod 0 i `kroki [1,1a,2,3,4,5,6]`;
  `node --test core/process/tests/ritual-copies.test.js` → zielony (szablon `SPEC_CLAUDE_MD.md` nadal
  niesie polecenie skrótu i żadnego wzorca dawnej listy plików).
- **Nie ruszasz:** `docs/plany/PANEL_CODEX/PROMPT_ETAP_1.md` (plan wstrzymany; prompt nie jest
  przepisywany wstecz — pytanie do człowieka w podsumowaniu etapu); `CLAUDE.md` i `AGENTS.md` tego
  repo (już mają zdanie Aneksu D); `relai-handover.md` i `relai-tour.md` (czytają „Zasady aktywne”
  do raportu dla człowieka, nie do promptu świeżej sesji); `SPEC_LEKCJE.md`.
- **Pułapki:** cudzysłowy zamykające są mieszane (`„…"` prosty i `„…”`) — kopiuj fragment PRZED
  z pliku, nie z karty. W `SPEC_PROMPT_ETAPU.md` sekcja „9. Na koniec” liczy każdą linię
  zaczynającą się od „cyfra, kropka, spacja” jako krok — tej karty to nie dotyczy, ale nie łam
  wstawek tak, żeby linia zaczęła się od numeru. Grep po `adapters/` trafia też w ignorowaną kopię
  `adapters/claude-code/hooks/.claude/relai/templates/` — to nie plik repozytorium, nie edytujesz go.
- **Gotowe, gdy:** test zielony, grep rodziny pusty, walidator kod 0.

---

## K-E1 — opisy rytuałów zamknięcia zgodne z procedurami

- **Cel:** szablon `CLAUDE.md`, `relai-core/SKILL.md`, `stage-closing.md`, `plan-closing.md`,
  `/relai-stage` i `/relai-update` opisują te same kroki i te same pytania co procedury, które je
  wykonują.
- **Pliki:** `core/templates/SPEC_CLAUDE_MD.md`, `adapters/claude-code/skills/relai-core/SKILL.md`,
  `adapters/claude-code/skills/relai-planning/stage-closing.md`,
  `adapters/claude-code/skills/relai-planning/plan-closing.md`,
  `adapters/claude-code/commands/relai-stage.md`, `adapters/claude-code/commands/relai-update.md`,
  `core/process/tests/ritual-texts.test.js`; kopie Codeksa.
- **Stan dziś:** `session-close.md:12-52`: 1 sync, 2 rotacja, 2a sprzątanie, 3 wpis, 3a plik
  wznowienia, 4 ryzyka, 5 commit, 6 podsumowanie; pytania w 2a, 3a i 5. `SPEC_CLAUDE_MD.md:140-141`
  i `:264-265` stawiają wpis przed sprzątaniem; `relai-core/SKILL.md:196-199` — „Pytania są dwa”;
  `stage-closing.md:44` — „Jedyny punkt …, o który pytasz”, choć 1a pyta o skasowanie;
  `plan-closing.md:72-73` i `relai-stage.md:210-211` pomijają pytanie o następcę z
  `plan-closing.md:56-61`. `relai-update.md:59` nie poprawia kolejności w projektach już
  zainicjowanych. `/relai-adopt` i reguły Cursora kopii frazy nie mają (`relai-core.mdc:259` odsyła
  do listy sekcji 4, zgodnej z `session-close.md`).
- **Zmiana:**
  1. `SPEC_CLAUDE_MD.md`, sekcja „Linia fraz sesji”. PRZED:

     ```
     > dokumentacyjne; „kończymy na dziś" → sync dokumentów, wpis do dziennika, przegląd ryzyk,
     > sprzątanie artefaktów roboczych, propozycja commita.
     ```

     PO:

     ```
     > dokumentacyjne; „kończymy na dziś" → sync dokumentów, rotacja, sprzątanie artefaktów
     > roboczych, wpis do dziennika, przegląd ryzyk, propozycja commita.
     ```

     Przykład Parkly. PRZED: `sync dokumentów, wpis do dziennika, ryzyka, sprzątanie artefaktów
     roboczych, propozycja commita.` PO: `sync dokumentów, rotacja, sprzątanie artefaktów roboczych,
     wpis do dziennika, ryzyka, propozycja` + nowa linia `commita.`
  2. `relai-core/SKILL.md`, fraza „kończymy na dziś”. PRZED (cały akapit):

     ```
     Otwórz **`session-close.md`** i wykonaj rytuał zamknięcia sesji, punkty 1–6 wraz z krokiem 2a,
     w tej kolejności. Zaczynasz od razu — użytkownik już zdecydował. Pytania są dwa: zgoda na commit
     i zgoda na skasowanie grupy artefaktów w kroku 2a. Krok 2 wykonujesz według
     `document-rotation.md`; rotacja o zgodę nie pyta i poniżej progu nie zostawia śladu.
     ```

     PO:

     ```
     Otwórz **`session-close.md`** i wykonaj rytuał zamknięcia sesji, kroki 1, 2, 2a, 3, 3a, 4, 5
     i 6, w tej kolejności. Zaczynasz od razu — użytkownik już zdecydował. Pytasz tylko o trzy
     rzeczy: zgodę na skasowanie grupy artefaktów w kroku 2a (partiami po cztery grupy), skasowanie
     pliku wznowienia w kroku 3a (wyłącznie gdy plik istnieje) i zgodę na commit w kroku 5. Krok 2
     wykonujesz według `document-rotation.md`; rotacja o zgodę nie pyta i poniżej progu nie zostawia
     śladu.
     ```

  3. `stage-closing.md`, punkt 6. PRZED: `6. **Commit** — propozycja, conventional message. Jedyny
     punkt tego rytuału, o który pytasz.` PO: `6. **Commit** — propozycja, conventional message.
     Pytasz w tym rytuale tylko o dwie rzeczy:` + `   skasowanie grup katalogu roboczego (punkt 1a)
     i commit (ten punkt).`
  4. `plan-closing.md`, akapit pod listą. PRZED:

     ```
     Punkty 3–8 nie są przedmiotem pytania. Pytaniem może być wyłącznie commit oraz punkty 1 i 2 — gdy
     plan ma otwarte bramki manualne albo otwarte odnogi.
     ```

     PO:

     ```
     Pytaniem może być wyłącznie: punkty 1 i 2 — gdy plan ma otwarte bramki manualne albo otwarte
     odnogi; jedno pytanie o następcę planu w punkcie 8, zadane dopiero po wpisaniu poprawnej linii;
     commit. Pozostałe punkty wykonujesz bez pytania.
     ```

  5. `relai-stage.md`, Krok 6. PRZED:

     ```
     nie piszesz nigdzie, że plan jest zrealizowany. Pytaniem może być wyłącznie commit oraz te dwa
     punkty — pozycje „Do zrobienia przez człowieka" bez adnotacji o rozstrzygnięciu i odnogi `OTWARTA`.
     ```

     PO:

     ```
     nie piszesz nigdzie, że plan jest zrealizowany. Pytaniem może być wyłącznie commit, te dwa
     punkty — pozycje „Do zrobienia przez człowieka" bez adnotacji o rozstrzygnięciu i odnogi
     `OTWARTA` — oraz jedno pytanie o następcę planu, zadane po wpisaniu poprawnej linii „Aktywny plan”.
     ```

  6. `relai-update.md`, wiersz tabeli z linią fraz sesji (dziś linia 59), koniec trzeciej komórki.
     PRZED → PO (wiersz zostaje jedną linią; w bloku niżej łamany tylko dla czytelności):

     ```
     Linia **jest**, ale bez członu o sprzątaniu → dopisujesz sam człon, nie przepisujesz linii; nie ruszasz przy tym niczego innego w pliku |
     ```
     ```
     Linia **jest**, ale bez członu o sprzątaniu → dopisujesz sam człon, nie przepisujesz linii.
     Człon jest, ale wpis do dziennika stoi przed sprzątaniem → przestawiasz człony na kolejność
     „sync dokumentów, rotacja, sprzątanie artefaktów roboczych, wpis do dziennika, przegląd ryzyk,
     propozycja commita” (`session-close.md`). Nie ruszasz przy tym niczego innego w pliku |
     ```
  7. `node adapters/codex/generate-skills.js` — zmienią się: `adapters/codex/skills/relai-core/SKILL.md`,
     `adapters/codex/skills/relai-planning/stage-closing.md`,
     `adapters/codex/skills/relai-planning/plan-closing.md`, `adapters/codex/skills/relai-stage/SKILL.md`,
     `adapters/codex/skills/relai-update/SKILL.md`.
- **Test najpierw:** w `ritual-texts.test.js` przypadek `close rituals list the same steps and
  questions as their procedures`:

  ```js
  test('close rituals list the same steps and questions as their procedures', () => {
    const NOWA = 'sync dokumentów, rotacja, sprzątanie artefaktów roboczych, wpis do dziennika';
    const t = czytaj('core/templates/SPEC_CLAUDE_MD.md');
    assert.equal(t.split(NOWA).length - 1, 2, 'SPEC_CLAUDE_MD: kolejnosc frazy w obu miejscach');
    sprawdz('core/templates/SPEC_CLAUDE_MD.md', [], ['sync dokumentów, wpis do dziennika']);
    for (const rel of OBA('adapters/claude-code/skills/relai-core/SKILL.md')) {
      sprawdz(rel, ['kroki 1, 2, 2a, 3, 3a, 4, 5 i 6', 'skasowanie pliku wznowienia w kroku 3a'], ['Pytania są dwa']);
    }
    for (const rel of OBA('adapters/claude-code/skills/relai-planning/stage-closing.md')) {
      sprawdz(rel, ['Pytasz w tym rytuale tylko o dwie rzeczy'], ['Jedyny punkt tego rytuału, o który pytasz']);
    }
    for (const rel of OBA('adapters/claude-code/skills/relai-planning/plan-closing.md')) {
      sprawdz(rel, ['jedno pytanie o następcę planu w punkcie 8'], ['Punkty 3–8 nie są przedmiotem pytania']);
    }
    for (const rel of ['adapters/claude-code/commands/relai-stage.md', 'adapters/codex/skills/relai-stage/SKILL.md']) {
      sprawdz(rel, ['jedno pytanie o następcę planu'], ['Pytaniem może być wyłącznie commit oraz te dwa']);
    }
    for (const rel of ['adapters/claude-code/commands/relai-update.md', 'adapters/codex/skills/relai-update/SKILL.md']) {
      sprawdz(rel, ['wpis do dziennika stoi przed sprzątaniem → przestawiasz człony'], []);
    }
  });
  ```

  Przed zmianą czerwony na liczbie wystąpień (`0` zamiast `2`).
- **Weryfikacja:** `node --test core/process/tests/ritual-texts.test.js` → 2 zielone;
  `grep -c "Pytania są dwa" adapters/claude-code/skills/relai-core/SKILL.md adapters/codex/skills/relai-core/SKILL.md`
  → `0` w obu; `grep -c "Jedyny punkt tego rytuału" adapters/*/skills/relai-planning/stage-closing.md`
  → `0` w obu; `node core/tools/validate-adapters.js` → kod 0.
- **Nie ruszasz:** `CLAUDE.md` i `AGENTS.md` tego repo (karta K-E1r, etap E1); `session-close.md`
  (jest źródłem prawdy); `adapters/cursor/rules/relai-core.mdc` (lista kroków już zgodna);
  linii „Sesja nieinteraktywna” w szablonie (znalezisko E11 raportu, poza planem).
- **Pułapki:** wiersz tabeli w `relai-update.md` jest jedną linią — żadnych łamań i żadnego znaku
  `|` w treści komórki. Numeracja kroków `stage-closing.md` zostaje `1, 1a, 2…6` — walidator
  porównuje ją z `SPEC_PROMPT_ETAPU.md`.
- **Gotowe, gdy:** test zielony i trzy greps dają `0`.

---

## K-E7 — rytuały lżejsze: specyfikacja rotacji tylko na ścieżce ręcznej, ostatni etap raz

- **Cel:** (a) przy rotacji dziennika i ryzyk skryptem model nie czyta `SPEC_ARCHIWUM.md`
  (55 269 B); (b) na ostatnim etapie planu wpis dziennika i aktualizacja `STATE.md` powstają **raz**,
  a wpis zamykający plan niesie część etapową.
- **Pliki:** `adapters/claude-code/skills/relai-core/document-rotation.md`,
  `adapters/cursor/rules/relai-core.mdc`, `adapters/claude-code/skills/relai-planning/stage-closing.md`,
  `adapters/claude-code/skills/relai-planning/plan-closing.md`, `core/templates/SPEC_PROMPT_ETAPU.md`,
  `adapters/claude-code/commands/relai-stage.md`, `adapters/cursor/rules/relai-planning.mdc`,
  `core/process/tests/ritual-texts.test.js`; kopie Codeksa.
- **Stan dziś:** `document-rotation.md:13-15` każe czytać specyfikację „**przed** rotacją”, a `:55`
  — „uruchamiasz go, nie odtwarzasz jego kroków”; ścieżki ręczne odsyłają do specyfikacji osobno
  (`:72-73`, `:81-82`, `:86`). `relai-core.mdc:147-148` też każe ją czytać i nie zna `rotate.js`,
  choć hook Cursora kładzie go w projekcie (`provisionTemplates` → `provisionTools`, `NARZEDZIA`
  w `core/process/session-signals.js:183-198`). Ostatni etap: `stage-closing.md:46` zastępuje tylko
  punkt 5, więc po punktach 2 i 4 idą `plan-closing.md` 3 i 4 — dwa wpisy, dwie aktualizacje.
- **Zmiana:**
  1. `document-rotation.md`, sekcja „Kiedy i co”. PRZED:

     ```
     się sama i **nie pyta o zgodę** — bo niczego nie kasuje ani nie streszcza. Pełna specyfikacja:
     `SPEC_ARCHIWUM.md` (czytasz ją z `.claude/relai/templates/` **przed** rotacją, nie z pamięci);
     poniżej jest to, co obowiązuje zawsze.
     ```

     PO:

     ```
     się sama i **nie pyta o zgodę** — bo niczego nie kasuje ani nie streszcza. Dziennik i ryzyka
     rotuje skrypt (sekcja „Przebieg skryptem”) — przy nich specyfikacji nie czytasz. Pełną
     specyfikację `SPEC_ARCHIWUM.md` czytasz z `.claude/relai/templates/` **przed** rotacją ręczną:
     lekcji, komórek „Mitygacja”, ustawień, a także dziennika i ryzyk, gdy skrypt zakończył się
     kodem 2 albo nie ma `node`. Poniżej jest to, co obowiązuje zawsze.
     ```

  2. `relai-core.mdc`, krok 2 sekcji 4. PRZED (dalszy ciąg od `Condition:` do końca kroku bez
     zmian):

     ```
     2. **Document rotation** — before the journal entry. See `SPEC_ARCHIWUM.md`, read it from
        `.claude/relai/templates/`. Condition:
     ```

     PO:

     ```
     2. **Document rotation** — before the journal entry. The journal and closed risks are rotated by
        the script: `node .claude/relai/tools/rotate.js plan <ryzyka|dziennik> --prog <KB>`, then
        `wykonaj` with the same arguments, risks first; for them you do not read the specification.
        Lessons, "Mitygacja" cells and settings are rotated by hand, and so are the journal and risks
        when the script exits with code 2 or `node` is missing: then read `SPEC_ARCHIWUM.md` from
        `.claude/relai/templates/` first. Condition:
     ```

  3. `stage-closing.md`, linia pod listą. PRZED:

     ```
     Zamykany etap był **ostatnim** w planie → punkt 5 zastępujesz sekwencją z `plan-closing.md`.
     ```

     PO — akapit (żadna linia nie zaczyna się od „cyfra, kropka, spacja”):

     ```
     **Ostatni etap planu.** Zamykany etap był ostatnim w planie → z tej listy wykonujesz punkty 1
     i 1a, a w miejsce punktów 2–5 sekwencję z `plan-closing.md`; commit (punkt 6) proponujesz raz,
     na końcu całości. Wpis dziennika i `STATE.md` powstają **raz** — w punktach 3 i 4 zamknięcia
     planu. Wpis zamykający niesie wtedy część etapową: cztery sekcje szablonu dla ostatniego etapu,
     liczby z punktu 1a, lekcje z etapu i przegląd tabeli ryzyk. Pozycje „Do zrobienia przez
     człowieka” ostatniego etapu wymieniasz w punkcie 1 zamknięcia planu razem z otwartymi
     bramkami, zamiast zapisywać je najpierw jako bramki w `STATUS.md`.
     ```

  4. `plan-closing.md`, punkt 1, jedna linia. PRZED → PO:

     ```
        w `STATUS.md` (plan sprzed 1.3.0). Jest choć jedna → **wypisz je wszystkie i zapytaj o każdą**:
     ```
     ```
        w `STATUS.md` (plan sprzed 1.3.0). Ostatni etap zamykany w tej turze nie ma jeszcze wpisu —
        jego pozycje dla człowieka bierzesz z pracy tej tury. Jest choć jedna → **wypisz je wszystkie
        i zapytaj o każdą**:
     ```

     Punkty 3 i 4. PRZED:

     ```
     3. **`docs/STATE.md`** — nadpisz: obszar planu przechodzi z „w toku" do stanu faktycznego.
     4. **Wpis zamykający w `DZIENNIK.md`** — sekcja „Zrobione" mówi **dowiezione vs plan**: co miało
        powstać, co powstało, co przepadło. Bez tego porównania wpis jest niepełny.
     ```

     PO:

     ```
     3. **`docs/STATE.md`** — nadpisz: obszar planu przechodzi z „w toku" do stanu faktycznego. To
        jedyna aktualizacja `STATE.md` w tej turze, także za ostatni etap.
     4. **Wpis zamykający w `DZIENNIK.md`** — sekcja „Zrobione" mówi **dowiezione vs plan**: co miało
        powstać, co powstało, co przepadło. Bez tego porównania wpis jest niepełny. Zamknięcie idzie
        w tej samej turze co ostatni etap → to **jedyny** wpis tej tury: niesie część etapową
        (`stage-closing.md`, akapit „Ostatni etap planu”); osobnego wpisu za etap nie piszesz.
     ```

  5. `SPEC_PROMPT_ETAPU.md`, sekcja 9, dwie ostatnie linie akapitu „Punkt o generacji…”. PRZED:

     ```
     opisujące etap N+1, realny stan po tym etapie i lekcje z tego etapu. Przy ostatnim etapie planu ten
     punkt zastępujesz wskazaniem: **uruchom sekwencję zamknięcia planu** (D-36).
     ```

     PO:

     ```
     opisujące etap N+1, realny stan po tym etapie i lekcje z tego etapu. Przy ostatnim etapie planu
     numeracja listy zostaje, a punkty 2–5 dostają jedną treść: **wykonywane raz, w sekwencji
     zamknięcia planu** (D-36) — wpis dziennika i `STATE.md` powstają tam jeden raz, z częścią
     etapową we wpisie zamykającym (`stage-closing.md`, akapit „Ostatni etap planu”).
     ```

  6. `relai-stage.md`, Krok 6. PRZED:

     ```
     Zamykany etap był ostatnim (w tabeli nie ma już etapów `OCZEKUJE` ani `W TOKU`) → zamiast generacji
     `PROMPT_ETAP_N+1` uruchom **sekwencję zamknięcia planu** z **wczytanego** skilla `relai-planning`
     ```

     PO (dalszy ciąg akapitu bez zmian):

     ```
     Zamykany etap był ostatnim (w tabeli nie ma już etapów `OCZEKUJE` ani `W TOKU`) → po punktach 1
     i 1a rytuału „Na koniec” zamiast punktów 2–5 uruchom **sekwencję zamknięcia planu** — wpis
     dziennika i `STATE.md` powstają w niej raz — z **wczytanego** skilla `relai-planning`
     ```

  7. `relai-planning.mdc`, sekcja 4. Po zdaniu `are blocking: until they are resolved you do not
     write anywhere that the plan is done.` dopisz w tym samym akapicie:

     ```
     On the last stage do steps 1 and 1a above, then this sequence instead of steps 2–4: the journal
     entry and the `STATE.md` update are written **once**, and the closing entry carries the stage
     part (the four sections for the last stage, the numbers from step 1a, its lessons and the risk
     review); the stage's items for the human go to the first point together with the open gates.
     ```

     Fragmentu ``folder to `docs/archiwum/plany/` → update the "Aktywny plan" line`` **nie zmieniasz**
     — jest kotwicą karty K-E2 w etapie E11.
  8. `node adapters/codex/generate-skills.js` — zmienią się: `adapters/codex/skills/relai-core/document-rotation.md`,
     `adapters/codex/skills/relai-planning/stage-closing.md`,
     `adapters/codex/skills/relai-planning/plan-closing.md`, `adapters/codex/skills/relai-stage/SKILL.md`.
- **Test najpierw:** w `ritual-texts.test.js` przypadek `rotation spec only on manual paths, last
  stage writes the entry once`:

  ```js
  test('rotation spec only on manual paths, last stage writes the entry once', () => {
    for (const rel of OBA('adapters/claude-code/skills/relai-core/document-rotation.md')) {
      sprawdz(rel, ['przy nich specyfikacji nie czytasz'],
        ['(czytasz ją z `.claude/relai/templates/` **przed** rotacją, nie z pamięci)']);
    }
    sprawdz('adapters/cursor/rules/relai-core.mdc', ['for them you do not read the specification'],
      ['See `SPEC_ARCHIWUM.md`, read it from']);
    for (const rel of OBA('adapters/claude-code/skills/relai-planning/stage-closing.md')) {
      sprawdz(rel, ['**Ostatni etap planu.**', 'powstają **raz**'],
        ['→ punkt 5 zastępujesz sekwencją z `plan-closing.md`.']);
    }
    for (const rel of OBA('adapters/claude-code/skills/relai-planning/plan-closing.md')) {
      sprawdz(rel, ['osobnego wpisu za etap nie piszesz', 'jedyna aktualizacja `STATE.md` w tej turze'], []);
    }
    sprawdz('core/templates/SPEC_PROMPT_ETAPU.md', ['**wykonywane raz, w sekwencji zamknięcia planu**'],
      ['punkt zastępujesz wskazaniem']);
    sprawdz('adapters/cursor/rules/relai-planning.mdc', ['are written **once**'], []);
  });
  ```

- **Weryfikacja:** `node --test core/process/tests/ritual-texts.test.js` → 3 zielone;
  `node core/tools/validate-adapters.js` → kod 0, `kroki [1,1a,2,3,4,5,6]` (akapit z kroku 3 nie
  dołożył etykiety); `grep -c "nie z pamięci" adapters/claude-code/skills/relai-core/document-rotation.md`
  → `0`.
- **Nie ruszasz:** `rotate.js` i rotacji lekcji (świadomie poza kartami — nagłówek etapu);
  `SPEC_ARCHIWUM.md`; akapitu D-88 „Trzy wagi i cel” w `document-rotation.md` i w regule Cursora
  (aneks D-88 — etap E8, parytet — karta K-E4 w E11); numeracji list kroków.
- **Pułapki:** `krokiSekcji()` w `core/tools/skill-metadata.js` zalicza do kroków każdą linię
  sekcji zaczynającą się od `\d+[a-z]?\.\s` — w nowym akapicie `stage-closing.md` i w sekcji 9 SPEC
  pilnuj łamań (np. linia nie może zaczynać się od `1a. `). Akapit w `relai-planning.mdc` musi
  zostawić nietknięty fragment-kotwicę K-E2.
- **Gotowe, gdy:** test zielony, walidator kod 0, grep `0`.

---

## K-R10 — rejestr artefaktów za etap

- **Cel:** każdy plik-artefakt zmieniony w E10 ma w `docs/ARTEFAKTY.md` nową wersję z jednym
  wpisem „co się zmieniło” i „po co” (reguła profilu `prompty`); kontrola wydania `artefakty` nie
  ma błędów.
- **Pliki:** `docs/ARTEFAKTY.md`.
- **Stan dziś** (wersje na `main @ 5aeab39`; jeśli etapy E2–E9 podbiły któryś wiersz, bierzesz
  wersję z pliku): `SPEC_PROMPT_ETAPU.md` 11, `SPEC_CLAUDE_MD.md` 9, `SPEC_ODNOGA.md` 5,
  `stage-prompts.md` 1, `deviation-and-branches.md` 1, `stage-closing.md` 2, `plan-closing.md` 4,
  `relai-core/SKILL.md` 28, `document-rotation.md` 2, `relai-stage.md` 12, `relai-branch.md` 4,
  `relai-update.md` 26, `relai-core.mdc` 8, `relai-planning.mdc` 4 — 14 wierszy.
- **Zmiana:** w każdym z 14 wierszy: kolumna `Wersja` → obecna + 1; kolumna `Data` bez zmian (data
  pojawienia się pliku, „Punkt startowy” rejestru); na **początek** komórki „Co się zmieniło”
  wstaw wpis i spację przed dotychczasową treścią:

  ```
  <RRRR-MM-DD> (wersja <N>, plan OPTYMALIZACJA_PO_AUDYCIE E10, karty <K-A1, K-E1, K-E7 — te, które dotknęły pliku>): <co się zmieniło jednym zdaniem>. Powód: <po co jednym zdaniem>.
  ```

  Wpis zaczyna się od daty i `(wersja N` — ten kształt rozpoznaje skrypt skracający rejestr
  w karcie K-E6 (etap E11). Kolumny „Po co” nie zmieniasz. Wiersze kopii Codeksa nie istnieją
  i nie powstają (wersja kopii = wersja źródła). Nowy plik testu nie jest artefaktem (kod testu).
- **Test najpierw:** nie dotyczy. Kontrola przed zmianą: `node core/tools/release-check.js --json
  --tylko artefakty` — w `bledy` stoją zmienione pliki „bez nowego wpisu”.
- **Weryfikacja:** ta sama komenda → `"bledy":[]`; `git diff --stat docs/ARTEFAKTY.md` → 14 linii
  zmienionych.
- **Nie ruszasz:** skracania komórek (karta K-E6, etap E11); wierszy plików spoza etapu.
- **Pułapki:** wiersz tabeli to jedna linia, bez znaku `|` w treści (inaczej `\|`); edycja
  narzędziem Edit (backticki).
- **Gotowe, gdy:** raport `artefakty` bez błędów.
