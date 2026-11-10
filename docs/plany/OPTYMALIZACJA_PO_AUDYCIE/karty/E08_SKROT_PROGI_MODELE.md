# E8 — Skrót startu, progi i lista modeli

Konwencje wspólne: [00_KONWENCJE.md](00_KONWENCJE.md). Ten etap zmienia skrót startu
(`core/process/start-digest.js`), raport progów dokumentów i `rotate.js`, ich kopie w skillach,
specyfikacjach i regule Cursora, dopisuje aneks do zamrożonej D-88 i poprawia jeden wiersz
ustawień tego repozytorium. Kod działa dopiero po wydaniu (E14); wiersz ustawień i aneks — od
razu.

- **Karty w kolejności wykonania:** K-A2 → K-A3 → K-A4.
  K-A2 daje największy widoczny zysk (7,5 KB z każdego startu) i nie zależy od decyzji. K-A3
  idzie druga, bo zmienia zamrożoną decyzję — aneks ma gotowe brzmienie i zgodę z 2026-11-09,
  ale dotyka sześciu kopii reguły. K-A4 jest ostatnia, bo kończy się pytaniem do człowieka i nie
  zmienia kodu.
- **Efekt widoczny:** skrót startu tego repozytorium ma 19 156 B zamiast 26 633 B (FAKT,
  prototyp 2026-11-09); linia `[RelAI progi dokumentow]` przestaje zgłaszać w każdej sesji
  sekcję ryzyk (zero zamkniętych) i `LEKCJE.md` (próg nieosiągalny); wiersz „Model optymalizatora”
  wskazuje model obecny na liście.
- **Szacunek:** SZACUNEK 1–2 sesje (K-A2 i K-A3 to głównie kopie zdań w dokumentach).
- **Warunki zatrzymania:** kotwica z karty nie pasuje do pliku; test „najpierw” czerwony
  z innego powodu niż asercja; po zmianie pada test spoza listy wymienionej w karcie;
  `node adapters/codex/generate-skills.js` zmienia pliki inne niż kopie zmienionych skilli;
  człowiek w K-A4 nie wybiera żadnej opcji.
- **Weryfikacja etapu:**

  ```bash
  node --test "core/process/tests/*.test.*"      # w tle albo z limitem 10 minut
  node --test "adapters/cursor/tests/*.test.js"
  node --test "adapters/codex/tests/*.test.js"   # w tle albo z limitem 10 minut
  node core/tools/validate-adapters.js
  node core/tools/rotate.js plan ryzyka --prog 12
  git status --short
  ```

  Testy dokładane w `core/process`: K-A2 **+2** (i jeden przepisany), K-A3 **+2** (i jeden ze
  zmienionym oczekiwaniem), K-A4 **0**. Od stanu `main` (357) przyrost etapu to **+4**; liczbę
  oczekiwaną liczysz od wpisu dziennika etapu E7 plus 4 (narastająco: 404–406 → **408–410**).
  Zestawy Cursora (10, stan po E06) i Codeksa (28, stan po E06) — bez zmian liczby. `rotate.js plan ryzyka` na tym repozytorium wypisuje linię
  `ponad progiem, ale zadne ryzyko nie jest ZAMKNIETE …` zamiast „komunikat zablokowanej rotacji”.

**Parytet adapterów.** `start-digest.js` i `session-signals.js` są wspólne dla trzech adapterów
(Claude Code, Cursor, Codex — hooki ładują je z `core/process/`, a projekt dostaje kopie
w `.claude/relai/tools/`). Testy parytetu do uruchomienia po każdej karcie z kodem:
`core/process/tests/ritual-copies.test.js` (hooki trzech adapterów i kopie rytuału),
`start-digest.test.js` (w tym kopia projektu dająca ten sam skrót), `start-cost.test.js`,
`esm-project.test.js`. Po zmianie skilla `relai-core`: `node adapters/codex/generate-skills.js`
i wiersz w `docs/ARTEFAKTY.md` (konwencje, sekcja 5) — w istniejącym wierszu artefaktu podbijasz
kolumnę „Wersja” o 1 i na **początku** kolumny „Co się zmieniło” dopisujesz
`<RRRR-MM-DD> (wersja N, plan OPTYMALIZACJA_PO_AUDYCIE E8, K-…): co. Powód: po co.`

---

## K-A2 — skrót startu bez odsyłaczy archiwum i bez sekcji spraw

- **Cel:** sekcja ryzyk skrótu nie niesie linii-odsyłaczy „> Ryzyka zamknięte … suma kontrolna”,
  tylko jedną linię z ich liczbą; skrót nie niesie sekcji „Czeka na człowieka”; sprawy
  przeterminowane mają jeden nośnik — hook startu, we wszystkich trzech adapterach.
- **Pliki:** `core/process/start-digest.js`, `adapters/codex/hooks/session-context.js`,
  `core/process/tests/start-digest.test.js`, `core/process/tests/ritual-copies.test.js`,
  `adapters/claude-code/skills/relai-core/SKILL.md`, `adapters/codex/skills/relai-core/SKILL.md`
  (generowany), `adapters/cursor/rules/relai-core.mdc`, `core/templates/SPEC_USTAWIENIA.md`,
  `docs/ARTEFAKTY.md`.
- **Stan dziś** (`core/process/start-digest.js`):

  ```js
        bezMitygacji(cialo(ryzyka)), linieSekcji(rel, txt, ryzyka)));

    // "Czeka na czlowieka" tylko przy sprawie przeterminowanej — ta sama miara co hook startu.
  ```

  Za tym komentarzem blok (linie 172–182) wkleja **całą** sekcję „Czeka na człowieka”, gdy choć
  jedna sprawa jest przeterminowana; zwrot `  return { bloki, rel, czeka: przeterminowane > 0, wpis: trescWpisu };`
  i drogowskaz
  `      (c.dziennik.czeka ? '' : ', sekcja "Czeka na czlowieka"') + ', starsze wpisy');`.
  Ten sam zestaw spraw zgłasza hook startu Claude Code i Cursora
  (`sprawyPrzeterminowaneReport`, 1 008 B w tym repozytorium) z nakazem „partiami po cztery”;
  hook Codeksa spraw nie zgłasza — kończy się na
  `  for (const line of core.startCostReport(core.startCost(cwd, { markeryGoscia: markers }))) lines.push(line);`.
  Sekcja ryzyk skrótu tego repozytorium: 6 711 B, z czego 11 bloków odsyłaczy = 2 184 B; sekcja
  „Czeka na człowieka” w skrócie: 5 448 B (FAKT, 2026-11-09).
- **Rozstrzygnięcie — nośnik:** zostaje **hook startu**. Powód: zasada 8 („zachowanie, które ma
  działać zawsze, mieszka w warstwie obecnej w każdej sesji — `CLAUDE.md` albo hook”) — hook
  działa także wtedy, gdy model nie uruchomi skrótu; niesie nakaz „pytaj partiami po cztery”
  w tym samym raporcie; w Cursorze tylko hook zna `is_background_agent` i daje agentowi w tle sam
  raport bez pytań. Codex dostaje ten sam raport w swoim hooku (dziś jedynym nośnikiem był tam
  skrót) — hooki pluginu Codeksa odpalają (P-054 dotyczy hooków projektu). Skrót traci sekcję
  w całości, a drogowskaz wskazuje ją zawsze.
- **Zmiana:**
  1. `start-digest.js`, nad funkcją `blok` dopisz (narzędziem Edit):

     ```js
     // Linie-odsylacze rotacji ryzyk (SPEC_ARCHIWUM.md: blok cytatu "> Ryzyka zamkniete ... suma
     // kontrolna") nie niosa decyzji, a rosna z kazda rotacja (audyt A2) — skrot zastepuje je jedna
     // linia z ich liczba. Blok cytatu bez sumy kontrolnej zostaje nietkniety.
     const ODSYLACZ_SUMA = /suma kontrolna|checksum/i;
     function bezOdsylaczy(tekst, rel) {
       const linie = tekst.split('\n');
       const wynik = [];
       let odsylaczy = 0;
       for (let i = 0; i < linie.length;) {
         if (!/^>/.test(linie[i])) { wynik.push(linie[i]); i++; continue; }
         let k = i;
         while (k < linie.length && /^>/.test(linie[k])) k++;
         const blokCytatu = linie.slice(i, k);
         if (ODSYLACZ_SUMA.test(blokCytatu.join(' '))) odsylaczy++;
         else wynik.push(...blokCytatu);
         i = k;
       }
       if (!odsylaczy) return tekst;
       const zwiniete = wynik.filter((l, i) => !(l.trim() === '' && (wynik[i - 1] || '').trim() === ''));
       while (zwiniete.length && !zwiniete[zwiniete.length - 1].trim()) zwiniete.pop();
       return zwiniete.join('\n') + '\n\n[odsylacze do archiwum ryzyk pominiete: ' + odsylaczy +
         '; pliki archiwum w ' + path.posix.dirname(rel) + '/archiwum/ryzyka/, odsylacze pod tabela w ' + rel + ']';
     }
     ```

  2. W `czescDziennika`: `bezMitygacji(cialo(ryzyka))` → `bezOdsylaczy(bezMitygacji(cialo(ryzyka)), rel)`;
     cały blok od komentarza „Czeka na czlowieka” tylko przy sprawie przeterminowanej” do
     zamykającego `}` (linie 172–182) zastąp komentarzem:

     ```js
       // "Czeka na czlowieka" nie wchodzi do skrotu (audyt A2): sprawy przeterminowane zglasza hook
       // startu (sprawyPrzeterminowaneReport) razem z nakazem pytania partiami po cztery, a pelna
       // sekcja jest w drogowskazach.
     ```

     Zwrot → `return { bloki, rel, wpis: trescWpisu };`. Drogowskaz →
     `    out.push('- ' + c.dziennik.rel + ' - kolumna "Mitygacja" tabeli ryzyk, sekcja "Czeka na czlowieka", starsze wpisy');`.
     Usuń nieużywaną stałą `NAGLOWEK_CZEKA` (linia 39). W komentarzu nagłówka (linie 8–9) zdanie
     „sekcje "Czeka na czlowieka" tylko przy sprawie przeterminowanej;” zastąp „tabele ryzyk bez
     linii-odsylaczy archiwum (jedna linia z ich liczba); bez sekcji "Czeka na czlowieka" (zglasza
     ja hook startu);”.
  3. `adapters/codex/hooks/session-context.js`, pod linią z kotwicy `startCostReport`:

     ```js
       // Overdue human items (audit A2): the start hook is the one carrier in all three adapters,
       // the digest no longer repeats the section.
       for (const line of core.sprawyPrzeterminowaneReport(
         core.sprawyPrzeterminowane(cwd, { markeryGoscia: markers }))) lines.push(line);
     ```

  4. Kopie zdania o zawartości skrótu:
     - `adapters/claude-code/skills/relai-core/SKILL.md` (linie 93–94): fragment
       `ostatni wpis dziennika (sekcję „Czeka` + nowa linia + `na człowieka” tylko przy sprawie przeterminowanej); aktywne wiersze`
       → `ostatni wpis dziennika (bez sekcji „Czeka` + nowa linia + `na człowieka” — sprawy przeterminowane zgłasza hook startu); aktywne wiersze`
       (żadna linia ponad 100 znaków; reszta akapitu bez zmian);
     - `adapters/cursor/rules/relai-core.mdc` (linia 25):
       `journal entry ("Czeka na człowieka" only when an item is overdue); the active rows of`
       → `journal entry (not "Czeka na człowieka": the start hook reports overdue items); the active rows of`;
     - `core/templates/SPEC_USTAWIENIA.md` (linie 188–189): fragment
       `sekcja „Czeka na człowieka”` + nowa linia + `tylko przy sprawie przeterminowanej, ostatni wpis dziennika`
       → `bez linii-odsyłaczy archiwum,` + nowa linia + `ostatni wpis dziennika`; w wierszu
       katalogu progów (linia 791) usuń człon `+ „Czeka na człowieka” (tylko przy sprawie przeterminowanej) `.
  5. `node adapters/codex/generate-skills.js`; trzy wiersze w `docs/ARTEFAKTY.md`: Skill
     `relai-core`, Reguła `relai-core` (Cursor), Specyfikacja `USTAWIENIA.md` — „skrót startu bez
     sekcji »Czeka na człowieka« i bez linii-odsyłaczy archiwum ryzyk. Powód: audyt A2 — 7,5 KB
     bez wartości decyzyjnej w każdym starcie, sprawy zgłaszane dwa razy”.
- **Bajty (FAKT, prototyp na tym repozytorium 2026-11-09):**

  | Część | Przed | Po |
  |---|---|---|
  | cały skrót startu | 26 633 B | 19 156 B |
  | sekcja ryzyk skrótu | 6 711 B (w tym 11 bloków odsyłaczy 2 184 B) | 4 653 B (jedna linia odsyłaczy 124 B) |
  | sekcja „Czeka na człowieka” w skrócie | 5 448 B | 0 B |
  | linia drogowskazu dziennika | 67 B przy sprawie przeterminowanej | 97 B zawsze |
  | raport spraw w hooku Claude Code / Cursora | 1 008 B | 1 008 B (bez zmian) |
  | raport spraw w hooku Codeksa | 0 B | 1 008 B (gdy jest sprawa przeterminowana) |

  Linia dla modelu dosłownie:
  `[odsylacze do archiwum ryzyk pominiete: 11; pliki archiwum w docs/archiwum/ryzyka/, odsylacze pod tabela w docs/DZIENNIK.md]`.
- **Test najpierw:**
  1. `start-digest.test.js` — test
     `waiting-on-a-human section appears only when an item is overdue (one run, two dates)`
     **przepisz** (zmienia oczekiwanie) na
     `the digest never carries the waiting-on-a-human section and always points to it (one run, two dates)`:
     dla obu fikstur (`2026-08-01` i `2026-10-20`) skrót **nie** zawiera `SPRAWA-CZEKA` ani
     `spraw przeterminowanych:`, a zawiera `sekcja "Czeka na czlowieka"` (drogowskaz).
  2. `start-digest.test.js`, nowy: `risk archive pointer blocks collapse into one line with their count` —
     dziennik fikstury z dwoma blokami `> Ryzyka zamknięte R7 (1 pozycja) są w` /
     `> [docs/archiwum/ryzyka/RYZYKA_2026-09-01.md](archiwum/ryzyka/RYZYKA_2026-09-01.md)` /
     `> — przeniesione 2026-09-01, suma kontrolna `0123456789abcdef`.` (drugi z inną datą) oraz
     blokiem `> UWAGA-CYTAT bez sumy` pod tabelą. Oczekiwane: skrót nie zawiera `suma kontrolna`,
     zawiera `[odsylacze do archiwum ryzyk pominiete: 2; pliki archiwum w docs/archiwum/ryzyka/`
     i `UWAGA-CYTAT`; tabela ma nadal 3 wiersze ryzyk. Kontrola pozytywna w tym samym przebiegu:
     fikstura bez bloków nie ma linii `pominiete`.
  3. `ritual-copies.test.js`, nowy: `overdue items: hooks of three adapters report them, the digest does not` —
     fikstura `projekt()` uzupełniona o wiersz `| 2026-09-01 | Przegląd spraw człowieka | włączony · 30 dni |`
     (tabela `| Data | Czego dotyczy | Decyzja |`) i `docs/DZIENNIK.md` z sekcją
     `## Czeka na człowieka` i pozycją `- **SPRAWA-STARA do decyzji** · 2026-01-01`. Hooki trzech
     adapterów jak w teście „session start hooks of three adapters” (Codex z `bezClaudeCode()`).
     Oczekiwane: każde wyjście zawiera `[RelAI przeglad spraw]` i `SPRAWA-STARA`;
     `require('../start-digest.js').startDigest(dir).tekst` nie zawiera `SPRAWA-STARA`. Sprzątanie
     znaczników jak w teście obok. Dziś czerwony: Codex milczy, a skrót niesie sprawę.
- **Weryfikacja:** `node --test "core/process/tests/start-digest.test.js"` → o jeden więcej,
  zielone; `node --test "core/process/tests/ritual-copies.test.js"` → o jeden więcej, zielone;
  `git diff --stat adapters/codex/skills/` → wyłącznie `relai-core/SKILL.md`.
- **Nie ruszasz:** akapitu „Sprawa przeterminowana” w `CLAUDE.md`, `AGENTS.md`
  i `SPEC_CLAUDE_MD.md` (reguła, nie dane — zostaje); brzmienia `sprawyPrzeterminowaneReport`;
  limitu 5 pozycji raportu; wiersza „Kierunek filmu” i innych długich wierszy ustawień w skrócie
  (A5, niska waga, poza planem); `overdue-review.md`.
- **Pułapki:** wzorzec odsyłacza sprawdzasz kontrolą pozytywną na prawdziwym bloku z
  `docs/DZIENNIK.md` (pierwszy blok zawiera `suma kontrolna`) — test 2 to robi na fiksturze.
  Skilla Codeksa nie edytujesz ręcznie — tylko generator. Edycje SKILL.md, reguły i specyfikacji
  narzędziem Edit (backticki, cudzysłowy mieszane). Komunikaty skrótu ASCII.
- **Gotowe, gdy:** trzy testy zielone; kopie zdań zmienione w trzech plikach i wygenerowanej
  kopii Codeksa; trzy wiersze rejestru podbite.

---

## K-A3 — progi, które rotacja może spełnić (aneks D-88)

- **Cel:** komunikat progu nie wraca w każdej sesji, gdy rotacja nie może progu spełnić:
  (a) próg `LEKCJE.md` w KB liczy plik bez sekcji „Zasady aktywne”; (b) sekcja ryzyk bez ani
  jednego ryzyka `ZAMKNIĘTE` nie trafia do linii progów na starcie ani do komunikatu
  zablokowanej rotacji — mówi o niej jedno zdanie raportu „sprawdź status”.
- **Pliki:** `docs/DECYZJE.md`, `core/process/session-signals.js`, `core/tools/rotate.js`,
  `core/process/tests/start-cost.test.js`, `core/process/tests/rotate.test.js`,
  `core/templates/SPEC_ARCHIWUM.md`, `core/templates/SPEC_LEKCJE.md`,
  `core/templates/SPEC_USTAWIENIA.md`, `adapters/claude-code/skills/relai-core/document-rotation.md`,
  `adapters/claude-code/skills/relai-core/SKILL.md`, kopie Codeksa obu plików skilla (generowane),
  `docs/ARTEFAKTY.md`.
- **Stan dziś:** D-88 (`docs/DECYZJE.md:29`): cel rotacji na wadze **całego** żywego pliku.
  `session-signals.js`, `dokumentyPonadProgiem`:

  ```js
              : 'zamykanie ryzyk (zadne nie jest ZAMKNIETE, wiec rotacja nic nie zdejmie)');
        const bajtow = bajtyLF(txt);
  ```

  `rotate.js`, `raportPlanu`:
  `  else if (!plan.zabrane.length) out.push('ponad progiem, ale nic nie przechodzi — komunikat zablokowanej rotacji (SPEC_ARCHIWUM.md)');`.
  FAKT (2026-11-09): `LEKCJE.md` 69 739 B, sekcja „Zasady aktywne” 35 174 B, dolna granica
  54 205 B przy progu 51 200 B (bez sekcji zasad: 19 031 B — cel 60% = 30 720 B osiągalny);
  `rotate.js plan ryzyka --prog 12` → 20 wierszy, zamkniętych 0, rotowalna 0,0 KB; linia startu
  dziś: `sekcja "Stan otwartych ryzyk" 17.5 KB (prog 12 KB) — zamykanie ryzyk (…); docs/LEKCJE.md 68.1 KB (prog 50 KB) — rotacja lekcji; docs/USTAWIENIA.md 6.4 KB (prog 6 KB) — rotacja ustawien do archiwum.`
- **Rozstrzygnięcie:** najprostsza reguła spójna z zasadą 6 („porównujesz do wielkości, którą
  mechanizm kontroluje”): w lekcjach z pomiaru wypada **jedna** sekcja, która ma własny limit
  (15 zasad, `count-rules.js`) i nigdy nie rotuje; dziennik i cel 60% zostają bez zmian. Ryzyka
  bez zamkniętych milkną na starcie i w zamknięciu sesji, bo jedyną drogą są decyzje człowieka —
  dla nich jest raport „sprawdź status”. Statusów „ZMITYGOWANE” i „OTWARTE ŚWIADOMIE” nie robimy
  rotowalnymi (kierunek audytu wymagałby decyzji o semantyce ryzyk — poza znaleziskiem).
- **Zmiana:**
  1. `docs/DECYZJE.md` — na **końcu** tabeli „Decyzje zmienione” dopisz jeden wiersz (treści D-88
     w linii 29 nie edytujesz; data dnia wykonania):

     ```
     | **D-88** → aneks | <RRRR-MM-DD> | Dwie granice reguły „cały żywy plik poniżej 60% progu”: (1) w `docs/LEKCJE.md` wyzwalacz i cel progu w KB liczą się od pliku **bez sekcji „Zasady aktywne”** — sekcja ma własny limit liczby zasad (`count-rules.js`) i nie rotuje; próg w sztukach (40 lekcji) bez zmian; (2) sekcja „Stan otwartych ryzyk” ponad progiem cząstkowym, w której żadne ryzyko nie jest `ZAMKNIĘTE` (część rotowalna 0), nie daje linii `[RelAI progi dokumentow]` na starcie ani komunikatu zablokowanej rotacji w zamknięciu sesji — mówi o niej jedno zdanie raportu frazy „sprawdź status”. Dziennik, cel 60% na wadze całkowitej i rotacja ryzyk zamkniętych — bez zmian. | Audyt 2026-11-09 (znalezisko A3): sekcja „Zasady aktywne” (35 174 B) z dwudziestoma najnowszymi lekcjami dawała dolną granicę 54 205 B przy progu 51 200 B, a sekcja ryzyk 17,5 KB przy progu 12 KB nie miała ani jednego ryzyka zamkniętego — oba progi były nieosiągalne rotacją i komunikat wracał w każdej sesji; zgoda Łukasza 2026-11-09. |
     ```

  2. `session-signals.js`, `dokumentyPonadProgiem` — ryzyka:

     ```js
           // D-88, aneks (audyt A3): bez ryzyka ZAMKNIETEGO rotacja nic nie zdejmie, a sekcje odchudza
           // wylacznie decyzja czlowieka — linia na starcie wracalaby w kazdej sesji. Mowi o tym raport
           // frazy "sprawdz status", nie start.
           const ryzyka = wytnijSekcje(txt, NAGLOWEK_RYZYK);
           if (ryzyka !== null && typeof progRyzyk === 'number' && rotowalneRyzyka(txt) > 0) {
             dodaj('sekcja "Stan otwartych ryzyk"', bajtyLF(ryzyka), progRyzyk, 'KB',
               'rotacja ryzyk ZAMKNIETYCH do archiwum');
           }
     ```

     i lekcje (zamiast `const bajtow = bajtyLF(txt);`):

     ```js
           // D-88, aneks (audyt A3): prog w KB liczy plik BEZ sekcji "Zasady aktywne" — ta ma wlasny
           // limit liczby zasad (count-rules.js) i sama z dwudziestoma najnowszymi lekcjami
           // przekraczala prog, wiec rotacja nie mogla go spelnic.
           const zasady = wytnijSekcje(txt, NAGLOWEK_ZASAD);
           const bajtow = bajtyLF(txt) - (zasady === null ? 0 : bajtyLF(zasady));
     ```

     Popraw komentarz nad blokiem ryzyk (linie 1217–1220): zdanie „Bez ani jednego ryzyka
     ZAMKNIETEGO … procedura to wtedy zamykanie ryzyk” → „Bez ani jednego ryzyka ZAMKNIETEGO
     pozycja nie wchodzi do listy (D-88, aneks).”
  3. `rotate.js`, `raportPlanu` — przed linią z kotwicy wstaw:

     ```js
       else if (!plan.zabrane.length && plan.rodzaj === 'ryzyka') {
         out.push('ponad progiem, ale zadne ryzyko nie jest ZAMKNIETE - rotacja nic nie zdejmie; bez komunikatu '
           + 'zablokowanej rotacji (D-88, aneks), jedno zdanie w raporcie "sprawdz status"');
       }
     ```

     (dziennik dalej dostaje dotychczasową linię). Stałej `CEL` i jej komentarza nie ruszasz.
  4. `core/templates/SPEC_ARCHIWUM.md` (data aneksu w miejsce `<RRRR-MM-DD>`):
     - tabela progów (linia 76): po `(co nastąpi wcześniej)` dopisz `; KB liczone bez sekcji „Zasady aktywne” (D-88, aneks <RRRR-MM-DD>)`;
     - na końcu akapitu zaczynającego się od `**Te progi mają adres także na starcie sesji.**`
       (kończy się „Katalog progów" w `SPEC_USTAWIENIA.md`.) dopisz zdanie: „Sekcja ryzyk, w której
       żadne ryzyko nie jest `ZAMKNIĘTE`, do tej linii nie wchodzi (D-88, aneks <RRRR-MM-DD>):
       rotacja nic z niej nie zdejmie, więc mówi o niej jedno zdanie raportu frazy „sprawdź
       status”, nie każdy start.”;
     - linie 124–125: `**Lekcje:** dolna granica to sekcja „Zasady aktywne", sekcja „Lekcje zwinięte" (ma własną drogę,`
       + `patrz `SPEC_LEKCJE.md`) i dwadzieścia najnowszych lekcji.` → „**Lekcje:** trzy wagi i próg
       w KB liczysz od pliku **bez sekcji „Zasady aktywne"** (D-88, aneks <RRRR-MM-DD>) — sekcja ma
       własny limit liczby zasad (`count-rules.js`) i nie rotuje; dolna granica to sekcja „Lekcje
       zwinięte" (ma własną drogę, patrz `SPEC_LEKCJE.md`) i dwadzieścia najnowszych lekcji.”;
     - linie 302–303: `aż **waga całkowita** żywego pliku zejdzie **poniżej` + `60% progu** (D-88)`
       → `aż waga żywego pliku **bez sekcji „Zasady aktywne”** zejdzie **poniżej` +
       `60% progu** (D-88 z aneksem <RRRR-MM-DD>)`;
     - wiersz przypadków brzegowych zaczynający się od
       `| Pozycja `ryzyka` ponad progiem, ale **żadne** ryzyko nie jest zamknięte |`: fragment od
       `Komunikat ma **ten sam kształt**` do końca komórki zastąp: „Nie rotujesz i **nie piszesz
       komunikatu** — ani na starcie, ani w podsumowaniu zamknięcia (D-88, aneks <RRRR-MM-DD>):
       sekcję odchudza wyłącznie zamknięcie ryzyk albo podniesienie progu, obie rzeczy są decyzją
       człowieka. Mówi o tym jedno zdanie raportu frazy „sprawdź status””;
     - wiersz `| Sekcja ryzyk ponad progiem, ryzyk `ZAMKNIĘTE` nie ma, a komórki mieszczą się w 800 znakach |`:
       zdanie `Komunikat ma ten sam kształt co przy dzienniku i mówi wprost, że sekcję odchudzi wyłącznie zamknięcie ryzyk albo podniesienie progu — obie rzeczy są decyzją człowieka.`
       → „Komunikatu nie piszesz (D-88, aneks <RRRR-MM-DD>) — zdanie, że sekcję odchudzi wyłącznie
       zamknięcie ryzyk albo podniesienie progu, pada w raporcie frazy „sprawdź status”.”;
     - w sekcji „Dawniej”, przed punktem `- **Sprawa człowieka a rotacja.**`, nowy punkt:
       „- **Próg lekcji bez „Zasad aktywnych” i cisza ryzyk bez zamkniętych (aneks D-88,
       <RRRR-MM-DD>).** Do 3.7.0 próg lekcji liczył cały plik: sekcja „Zasady aktywne” (35 174 B)
       z dwudziestoma najnowszymi lekcjami dawała dolną granicę 54 205 B przy progu 51 200 B
       `FAKT` (2026-11-09), a sekcja ryzyk 17,5 KB bez ani jednego ryzyka zamkniętego przy progu
       12 KB — oba komunikaty wracały w każdej sesji, a rotacja nie mogła ich uciszyć.”
  5. `core/templates/SPEC_LEKCJE.md`, po `co nastąpi wcześniej.` (linia 206): „Próg w KB liczy plik
     **bez sekcji „Zasady aktywne”** — ta ma własny limit liczby zasad (D-88, aneks <RRRR-MM-DD>).”
  6. `core/templates/SPEC_USTAWIENIA.md`, wiersz katalogu progów
     `| `docs/LEKCJE.md` — waga i liczba | 40 lekcji albo 50 KB |` → `| `docs/LEKCJE.md` — waga
     (bez sekcji „Zasady aktywne”, aneks D-88) i liczba | 40 lekcji albo 50 KB |` (reszta wiersza
     bez zmian).
  7. `document-rotation.md`: wiersz tabeli
     `| `docs/LEKCJE.md` | 40 lekcji albo 50 KB | …` → `| `docs/LEKCJE.md` | 40 lekcji albo 50 KB (KB bez sekcji „Zasady aktywne”) | …`;
     po zdaniu `` `rotate.js plan` wypisuje wszystkie cztery liczby.`` dopisz: „W lekcjach trzy
     wagi i próg liczysz **bez sekcji „Zasady aktywne”** (D-88, aneks <RRRR-MM-DD>).”; po
     `(L-0036, L-0049).` dopisz: „**Sekcja ryzyk bez ani jednego `ZAMKNIĘTE` nie dostaje
     komunikatu wcale** (D-88, aneks) — `rotate.js plan ryzyka` mówi to wprost, a jedno zdanie
     o niej pada w raporcie „sprawdź status”.”
  8. `SKILL.md` (`relai-core`), fraza „sprawdź status”, punkt 3: do zdania
     `3. **Ryzyka** — otwarte pozycje z tabeli dziennika, każde w jednej linii.` dopisz: „Sekcja
     ryzyk ponad progiem cząstkowym bez ani jednego ryzyka `ZAMKNIĘTE` → jedno zdanie z liczbami
     z `node .claude/relai/tools/rotate.js plan ryzyka --prog <KB z ustawień>`: rotacja nic nie
     zdejmie, sekcję odchudza zamknięcie ryzyk albo podniesienie progu — decyzja człowieka
     (D-88, aneks).” (łam linie do 100 znaków).
  9. `node adapters/codex/generate-skills.js`; wiersze w `docs/ARTEFAKTY.md`: Specyfikacja
     archiwum, Specyfikacja `LEKCJE.md`, Specyfikacja `USTAWIENIA.md`, `relai-core` — rotacja
     dokumentów, Skill `relai-core` — „aneks D-88: próg lekcji bez »Zasad aktywnych«, ryzyka bez
     zamkniętych bez komunikatu. Powód: audyt A3 — dwa progi nieosiągalne z konstrukcji, komunikat
     w każdej sesji”.
- **Wszystkie miejsca reguły D-88** (stan `main`): `core/templates/SPEC_ARCHIWUM.md` (76, 89–92,
  109–126, 295–306, 553, 557, 806–815), `core/templates/SPEC_LEKCJE.md:205`,
  `core/templates/SPEC_USTAWIENIA.md:796`, `adapters/claude-code/skills/relai-core/document-rotation.md`
  (25, 37–40, 111–118, 120–136), `SKILL.md` relai-core (status), `core/process/session-signals.js`
  (`dokumentyPonadProgiem`), `core/tools/rotate.js` (`CEL`, `raportPlanu`) i testy
  `start-cost.test.js`, `rotate.test.js`; kopie Codeksa obu plików skilla; reguła Cursora
  `adapters/cursor/rules/relai-core.mdc` (linie 151, 187–208) — patrz „Nie ruszasz”. Linie 37–40
  `document-rotation.md` („Czego nie ruszasz nigdy”) zostają: sekcja nadal nie rotuje.
- **Test najpierw:**
  1. `start-cost.test.js`, test `startCostReport proposes rotation only when rotation would remove something`
     — **zmiana oczekiwania**: trzy linie pod komentarzem
     `// Aneks A: linia progow dokumentow nie proponuje rotacji ryzyk, gdy zadne nie jest zamkniete.`
     zastąp: komentarz `// D-88, aneks (audyt A3): sekcja ryzyk bez zamknietych nie wchodzi do linii progow.`,
     `assert.ok(!/Stan otwartych ryzyk/.test(rZero), 'sekcja ryzyk bez zamknietych: ' + rZero);`
     i `assert.ok(!/zamykanie ryzyk/.test(rZero));`. Asercja dla `rWiecej`
     (`rotacja ryzyk ZAMKNIETYCH do archiwum`) zostaje.
  2. `start-cost.test.js`, nowy: `lessons threshold in KB counts the file without "Zasady aktywne" (D-88 annex)` —
     ustawienia z wierszem `| 2026-10-28 | Rotacja dokumentów | włączona · lekcje 40 wpisów albo 2 KB |`;
     `LEKCJE.md` = `# LEKCJE\n\n## Zasady aktywne\n\n` + 3 000 znaków + `\n\n## Lekcje\n\n### L-0001 — A\n\n`
     + 500 znaków. `core.dokumentyPonadProgiem(dir, txtUstawien)` → brak pozycji o etykiecie
     `docs/LEKCJE.md`. Kontrola pozytywna w tym samym przebiegu: lekcja 2 500 znaków → pozycja
     jest, a jej `wartosc` = bajty pliku minus bajty sekcji „Zasady aktywne”. Dziś czerwony
     (pozycja przy 3,5 KB).
  3. `rotate.test.js`, nowy: `plan ryzyk bez zamknietych: bez komunikatu zablokowanej rotacji (D-88, aneks)` —
     dziennik z sekcją ryzyk (trzy wiersze `OTWARTE`) i `## Wpisy`;
     `rotate.wykonaj('ryzyka', opcje(dir, { prog: 0.01 }))` → `kod 0`, wyjście zawiera
     `zadne ryzyko nie jest ZAMKNIETE` i nie zawiera `komunikat zablokowanej rotacji`; kontrola
     pozytywna: jeden wiersz `ZAMKNIĘTE 2026-10-01` → wyjście zawiera `archiwum:`.
- **Weryfikacja:** `node --test "core/process/tests/start-cost.test.js" "core/process/tests/rotate.test.js"`
  → zielone, o dwa więcej; `node core/tools/rotate.js plan ryzyka --prog 12` → linia
  `ponad progiem, ale zadne ryzyko nie jest ZAMKNIETE …`; `grep -c "D-88\*\* → aneks" docs/DECYZJE.md`
  → `1`; `git diff --stat docs/DECYZJE.md` → jedna linia dodana, zero usuniętych.
- **Nie ruszasz:** treści D-88 w linii 29; reguły Cursora `adapters/cursor/rules/relai-core.mdc` —
  jej zgodność z D-88 i z tym aneksem poprawia karta **K-E4 w etapie E11**; budżetu startu
  i zdania „Rotacja nic tu nie zdejmie” w `startCostReport` (budżet, nie próg dokumentu); progu
  i rotacji dziennika; parserów ustawień (C8, niska waga, poza planem); statusów ryzyk.
- **Pułapki:** próg jest liczbą, którą ktoś liczy (zasada 6) — po zmianie sprawdź na tym
  repozytorium, że linia startu nie zgłasza ani ryzyk, ani `LEKCJE.md`, a nadal zgłasza
  `docs/USTAWIENIA.md 6.4 KB` (wiersze wycofane są rotowalne — kontrola pozytywna). Wiersz tabeli
  decyzji jest jedną linią; pionowa kreska w treści komórki rozbija tabelę. Hook
  `config-protection` nie dotyczy `DECYZJE.md`; dotyczy specyfikacji tylko wtedy, gdy są
  w sekcji niemutowalnej — tu nie są.
- **Gotowe, gdy:** wiersz aneksu stoi w tabeli; dwa nowe testy i zmieniony test zielone; linia
  progów tego repozytorium (sprawdzona pomiarem `startCostReport(startCost(cwd))`) wymienia
  wyłącznie `docs/USTAWIENIA.md`.

---

## K-A4 — wiersz „Model optymalizatora” wskazuje model z listy

- **Cel:** wiersz-podpowiedź „Model optymalizatora” w `docs/USTAWIENIA.md` tego repozytorium
  wskazuje nazwę obecną na liście `MODELE-claude-code.md` (albo `model sesji`), wybraną przez
  człowieka.
- **Pliki:** `docs/USTAWIENIA.md`.
- **Stan dziś** (`docs/USTAWIENIA.md:30`):

  ```
  | 2026-09-14 | Model optymalizatora | Sonnet 5 · lista claude-code z dnia 2026-09-04 |
  ```

  Lista (`adapters/claude-code/MODELE.md`, `list-date: 2026-10-08`) ma `Opus 5.5`, `Fable 5.1`,
  `Sonnet 5.5`, `Haiku 5.5` — `Sonnet 5` na niej nie ma. Reguła zamrożona
  (`core/prompt/PRZYGOTOWANIE.md`, Krok 1b): model spoza list dostaje „sam rdzeń”, a rodziny
  **nie odgadujesz** z nazwy.
- **Zakres — co karta świadomie pomija:**
  1. Dwa zdania startu o tej samej liście (zdanie hooka „Lista modeli tego narzedzia …” i linia
     `[RelAI lista modeli] … ma 32 dni`) to znalezisko **A5** („wiek listy modeli w dwóch
     zdaniach 420 B”) — niska waga, poza planem. Kod startu bez zmian.
  2. Zdanie startu „model sesji nie stoi na liście modeli” **nie powstaje**: hook nie ma skąd
     znać modelu sesji. Żaden hook w repozytorium nie czyta pola modelu z payloadu SessionStart
     (`grep -rn "input.model" adapters core` → brak trafień), a `docs/PULAPKI.md` nie opisuje
     takiego pola. Zgadywanie modelu z innego źródła łamałoby zasadę 13 (cudze narzędzie
     poznajesz z próby) — to wymagałoby pomiaru w świeżej sesji, a budżet `claude -p` planu
     kończy się na E2.
- **Zmiana:**
  1. Zadaj człowiekowi **jedno** pytanie (AskUserQuestion): „Wiersz »Model optymalizatora«
     wskazuje Sonnet 5, którego nie ma na liście claude-code z dnia 2026-10-08. Jaki model ma
     podpowiadać ten wiersz?” — opcje (najwyżej cztery, reszta w polu „Other”):
     „Sonnet 5.5 (Rekomendowane) — ta sama klasa `balanced` co dotychczasowy wybór”,
     „Opus 5.5”, „Haiku 5.5”, „model sesji — praca bez delegacji”. Rekomendacja dotyczy klasy
     z listy, nie rodziny odgadniętej z nazwy.
  2. Zastąp cały wiersz z kotwicy jednym wierszem (data dnia wykonania etapu); wiersz zostaje
     **podpowiedzią** — bez członu `· nie pytaj` (ten dopisuje wyłącznie komenda `/relai-prompt`
     po wyborze zasięgu przez człowieka):
     - wybór z listy: `| <RRRR-MM-DD> | Model optymalizatora | <nazwa z listy> · lista claude-code z dnia 2026-10-08 |`
     - `model sesji`: `| <RRRR-MM-DD> | Model optymalizatora | model sesji |`
     Starego wiersza nie przenosisz do „Ustawień wycofanych” (jak w K-B1p etapu E1: plik jest
     ponad progiem 6 KB, zmianę niesie historia gita i wpis dziennika).
  3. Wybór „Other” z nazwą spoza listy → nie zapisujesz; mówisz jednym zdaniem, że nazwy spoza
     listy wiersz nie przyjmuje, i wskazujesz `/relai-models`; pytanie zadajesz drugi raz.
- **Test najpierw:** nie dotyczy (zmiana ustawienia). Kontrola przed zmianą:
  `grep -c "Model optymalizatora | Sonnet 5 · lista claude-code z dnia 2026-09-04" docs/USTAWIENIA.md` → `1`.
- **Weryfikacja:** `grep -c "Model optymalizatora" docs/USTAWIENIA.md` → `1`;
  `grep -cF "| Model optymalizatora | <wybór>" docs/USTAWIENIA.md` → `1`; dla nazwy z listy
  `grep -c "^[a-z]*: <wybór> |" .claude/relai/MODELE-claude-code.md` → `1`.
- **Nie ruszasz:** wiersza „Lista modeli” i jej wieku (odświeżenie to `/relai-models` z ruchem
  sieciowym — osobna decyzja człowieka); listy `MODELE.md` adapterów; reguły Kroku 1b
  w `PRZYGOTOWANIE.md` (zamrożona); `wiekListyModeliReport` i zdań hooka o liście (A5);
  wiersza „Tryb ciągły” (karta K-B1p, etap E1).
- **Pułapki:** komórka „Decyzja” jest czytana maszynowo — kotwica na początku komórki, człony
  rozdzielone `·`, zamknięta lista brzmień: nazwy z listy i `model sesji` (zasada 7); inny zapis
  (`sonnet 5.5`, `Sonnet-5.5`) nie zostanie rozpoznany. Hook `config-protection` zapyta o zgodę
  na edycję `docs/USTAWIENIA.md` — to poprawne; człowiek potwierdza. Edycja narzędziem Edit.
- **Gotowe, gdy:** wiersz ma wartość wybraną przez człowieka, a odpowiedź jest zapisana we
  wpisie dziennika etapu.
