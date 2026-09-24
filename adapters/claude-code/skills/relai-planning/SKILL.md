---
name: relai-planning
description: >
  Creates and runs RelAI plans (PLAN + STATUS in docs/plany/<TOPIC>/, or a one-entry MINIPLAN),
  frozen after acceptance and run stage by stage. Use it before writing any plan, concept, staging or breakdown of
  work in a project with RelAI structure (docs/USTAWIENIA.md contains "Wersja RelAI" / "RelAI
  version"), because RelAI plans have a required file layout; also for a refactor, migration or
  rewrite spanning more than one session. Phrases (Polish): "przygotuj plan", "zaplanuj",
  "zaplanujmy", "rozpisz to na etapy", "zrób plan", "plan wdrożenia", "plan projektu", "jak to
  ugryźć", "od czego zacząć", "w jakiej kolejności"; English: "make a plan", "plan this out",
  "break this into stages", "what's the approach". Also when a stage starts or closes: "wykonaj
  etap", "uruchom etap", "następny etap", "zamknij etap", "run the stage", "next stage", "close
  the stage"; and when a side thread is parked: "odnoga", "boczny wątek", "to nie na teraz",
  "odłóż to na potem", "branch this off", "park this".
---

# relai-planning — plany, etapy i ich zamrażanie

Aktualny stan dystrybucyjny: RelAI 2.6.0; procedura tego skilla pochodzi z wersji 1.8.0, a akapit niżej opisuje jej zakres.

Wersja procedury 1.8.0 (plan SPRZATANIE_ARTEFAKTOW — katalog roboczy etapu nazwany z góry, krok 1a rytuału „Na koniec"). Zakres tej wersji: **wykrycie intencji planowania + rozróżnienie
PLAN/MINIPLAN + pytanie startowe + generacja planu w Markdown albo w HTML + `STATUS.md` +
zamrożenie z aneksami + prompty etapowe `PROMPT_ETAP_N` z lazy-generacją + rytuał „Na koniec" etapu
+ sygnał odchylenia i odnogi planu + **bramki manualne** + zamknięcie planu**. Etap uruchamia komenda `/relai-stage`,
odnogę — `/relai-branch`. Od 0.6.0 działa interaktywny szablon
HTML planów głównych (`HTML_PLAN/`) razem z nadpisaniem lokalnym (D-62).

Specyfikacje (`SPEC_PLAN`, `SPEC_PLAN_HTML`, `SPEC_STATUS`, `SPEC_PROMPT_ETAPU`, `SPEC_ODNOGA`,
`SPEC_DZIENNIK`)
czytaj z lokalnej kopii **`.claude/relai/templates/`** — utrzymuje ją hook `session-context`;
katalog pluginu jest dla sesji niedostępny (L-0012). Tą samą drogą dociera szablon HTML
(`.claude/relai/templates/HTML_PLAN/`). Brak kopii → powiedz o tym i poproś o `--add-dir` na katalog
pluginu, zamiast generować z pamięci.

Dwie procedury leżą obok tego pliku, w katalogu skilla, i otwierasz je dopiero przy wyzwalaczu:
`html-plan.md` — plan główny powstaje w HTML albo człowiek zmienia styl planów HTML;
`plan-closing.md` — ostatni etap planu dostał status ZREALIZOWANY. Pliku nie ma obok `SKILL.md`
(instalacja niepełna) → mówisz o tym jednym zdaniem i prosisz o aktualizację pluginu; procedury
nie odtwarzasz z pamięci.

Ten skill zakłada strukturę RelAI w folderze (marker `Wersja RelAI:` w `docs/USTAWIENIA.md`).
Nie ma struktury → to zadanie dla `relai-core`, nie dla tego skilla: najpierw inicjalizacja albo
tryb gościa. W trybie gościa nie planujesz w plikach — odpowiadasz zwykłym Claude Code.

Podziału ról pilnuj również w drugą stronę: rytuał startu sesji, definicja ukończenia, rejestry
`LEKCJE`/`DECYZJE` i frazy rytualne należą do `relai-core`. Tutaj są tylko plany.

---

## Krok 1 — czy to w ogóle jest prośba o plan

Rozstrzygnij **zanim** cokolwiek napiszesz. Intencję wykrywasz z treści prompta, bez żadnej komendy
(D-22).

### To jest prośba o plan

Wystarczy jeden z tych sygnałów:

- pada słowo *plan*, *zaplanuj*, *rozpisz*, *etapy*, *koncepcja*, *podejście*, *strategia*,
  *roadmapa* — w odniesieniu do **tego projektu**;
- użytkownik pyta „jak to ugryźć", „od czego zacząć", „w jakiej kolejności to zrobić";
- użytkownik sam przedstawia rozbudowany pomysł i pyta o zdanie, warianty albo kolejność;
- prośba dotyczy **przebudowy, migracji, refaktoru albo nowego dużego obszaru** — nawet jeśli słowo
  „plan" nie padło. „Przepisz autoryzację na OAuth" to prośba o plan, choć brzmi jak prośba o kod.

### To NIE jest prośba o plan

- **Temat spoza projektu.** „Zaplanuj mi spotkanie na jutro", „zaplanuj urlop", „ułóż plan dnia",
  „zaplanuj wyjazd" — RelAI planuje **pracę w tym repozytorium** i nic więcej. Odpowiadasz normalnie,
  jak zwykły asystent, i **nie tworzysz** żadnych plików w `docs/plany/`. Nie komentujesz też, że
  „to nie jest plan projektowy" — użytkownik nie prosił o wykład.
- **Zadanie wykonawcze o znanym kształcie.** „Popraw literówkę w README", „dodaj pole `email` do
  formularza", „zmień kolor przycisku" — robisz to od razu.
- **Pytanie o stan albo o kod.** „Co robi ta funkcja", „jak stoimy" — to nie planowanie
  („jak stoimy" obsługuje `relai-core`).
- **Realizacja etapu z istniejącego planu.** Plan już jest — wykonujesz, nie planujesz od nowa.

Kryterium rozstrzygające przy wątpliwości: **czy odpowiedzią ma być dokument, czy zmiana w repo.**
Dokument → plan. Zmiana → praca.

---

## Krok 2 — PLAN czy MINIPLAN

Dwa poziomy, nic pośredniego (D-31).

| | **PLAN** | **MINIPLAN** |
|---|---|---|
| Gdzie mieszka | `docs/plany/<TEMAT>/PLAN.md` + `STATUS.md` | jeden wpis w `docs/DZIENNIK.md` |
| Struktura | pełna (`SPEC_PLAN.md`) | cel / kroki / weryfikacja |
| Etapy | tak, z promptami etapowymi | nie |
| Zamrożenie i aneksy | tak | nie |
| Wskazanie w `CLAUDE.md` | tak, jedna linia | nie |

**Próg — wszystkie liczby to SZACUNEK,** nie twarde reguły. PLAN, gdy spełniony choć jeden warunek:

- praca nie zmieści się w jednej sesji (≥ 2 sesje robocze),
- da się ją sensownie podzielić na **3 lub więcej etapów**,
- dotknie **więcej niż 5 plików** albo wprowadzi nową zależność zewnętrzną,
- istnieją **co najmniej dwa realne warianty** rozwiązania i wybór jednego jest trudny do cofnięcia,
- praca dotyka pieniędzy, danych osobowych, autoryzacji, migracji danych albo produkcyjnego
  środowiska.

MINIPLAN, gdy **żaden** z powyższych warunków nie zachodzi, a zadanie i tak warto rozpisać: 2–5
kroków, jedna sesja, odwracalne.

**Niejasność rozstrzygasz pytaniem, nie zgadywaniem** — pytanie o rodzaj jest wtedy pierwszym
pytaniem z Kroku 3. Gdy próg rozstrzyga jednoznacznie, o rodzaj **nie pytasz**: mówisz jednym
zdaniem, co robisz i dlaczego („to jedna sesja i trzy kroki — piszę miniplan w dzienniku"), i
zostawiasz użytkownikowi możliwość poprawienia Cię. Dotyczy to obu kierunków — jednoznacznego
MINIPLAN-u i jednoznacznego PLAN-u.

---

## Krok 3 — jedno pytanie startowe (D-39, Aneks A)

Zanim zapytasz, **sprawdź zapisane preferencje** w tej kolejności: `docs/USTAWIENIA.md` → plik
globalny `~/.claude/relai/USTAWIENIA.md`. Znalazłeś odpowiedź na dane pytanie — **nie pytaj o nie
ponownie**; wspomnij pół zdaniem, skąd ją masz („format i model biorę z ustawień projektu —
Markdown, Opus"). Preferencje pokrywają zwykle format i model; rodzaj planu jest cechą konkretnego
zadania i utrwaleniu **nie podlega**.

Gdy zostało cokolwiek do zapytania — **dokładnie jedno wywołanie AskUserQuestion**, wszystkie
brakujące pytania naraz. Nigdy dwa wywołania pod rząd, nigdy pytanie po wygenerowaniu planu.
Jedyny wyjątek: pytanie o **nadpisanie lokalne szablonu HTML** (D-62) — pada raz na projekt, po
pokazaniu pierwszego planu HTML, bo wcześniej użytkownik nie ma czego oceniać.

Gdy nie zostało nic — bo próg rozstrzygnął rodzaj, a format i model są w ustawieniach — **nie
pytasz w ogóle**. Piszesz jedno zdanie o tym, co przyjąłeś i skąd („pełny plan, Markdown, model
z ustawień projektu") i generujesz. To jest typowa sytuacja przy drugim i każdym kolejnym planie
w tym samym projekcie: pytanie startowe pada raz na projekt, nie raz na plan.

| # | Pytanie | Opcje (pierwsza z dopiskiem „(Rekomendowane)") |
|---|---|---|
| 1 | Rodzaj | pełny PLAN z etapami / MINIPLAN w dzienniku — rekomendacja wynika z progu z Kroku 2, podaj ją wprost z uzasadnieniem w jednym zdaniu |
| 2 | Format planu głównego | interaktywny HTML (Rekomendowane — plan do czytania przez człowieka: zwijane sekcje, diagram, symulator; jeden samowystarczalny plik) / Markdown (lżejszy, czytelny w diffie) — cokolwiek padnie, `STATUS.md` i prompty etapowe zostają w Markdown (D-32) |
| 3 | Model wykonawczy etapów | rekomendacja RelAI (Rekomendowane): złożone etapy — model najsilniejszy, mechaniczne — najtańszy / jeden model do wszystkiego / opis własny |

**Nazwy zamiast klas, gdy sesja ma listę modeli.** Kontekst startu sesji mówi jednym zdaniem, która
lista obowiązuje (`.claude/relai/MODELE-<narzędzie>.md`) i z kiedy jest. Rozpoznanie narzędzia należy
do hooka — sam go nie prowadzisz i drugiej listy nie otwierasz. Gdy to zdanie padło:

- przeczytaj wskazany plik i weź z niego pozycje klas `strong`, `balanced`, `cheap`;
- opcje pytania 3 wymieniają **nazwy modeli** zamiast samych klas, a treść pytania niesie **datę
  listy** — żeby człowiek widział, jak świeże są nazwy, które mu pokazujesz;
- pozycja `<TO BE FILLED IN: …>` nie jest nazwą: mówisz wprost, że listy dla tej klasy nie ma,
  i wskazujesz `/relai-models`. Nazw nie zgadujesz i nie uzupełniasz z pamięci modelu (L-0026).

Zdania o liście nie było albo pliku nie ma → pytanie zostaje **dokładnie takie jak w tabeli**,
samymi klasami, bez ani jednego dodatkowego komunikatu. Cisza jest zachowaniem domyślnym.

Zasady tego pytania:

- **Odpowiedź swobodna jest dopuszczalna i nadrzędna.** „Etapy 1–3 Opusem, resztę Haiku" ma trafić
  do `STATUS.md` dosłownie w takim brzmieniu. Niczego nie normalizujesz na siłę.
- **Rekomendacja to opcja, nie nacisk.** Podajesz powód w jednym zdaniu i przechodzisz dalej.
- Po odpowiedzi **od razu** dopisz preferencje (format, model) do `docs/USTAWIENIA.md` — wiersz
  z dzisiejszą datą. Preferencje ponadprojektowe idą dodatkowo do warstwy globalnej. Zapis jest
  natychmiastowy, nie „na koniec sesji" — inaczej pytanie wróci przy następnym planie.
- Rodzaju planu do `USTAWIENIA.md` **nie** zapisujesz.
- Więcej niż trzy pytania: nie. Braki uzupełniasz rozsądnym domyślnym wyborem i piszesz, co
  przyjąłeś.

---

## Krok 4 — generacja PLAN-u

1. **Ustal `<TEMAT>`** — CAPS_SNAKE, po polsku (albo w języku projektu), bez dat i numerów wersji
   (D-12): `PLATNOSCI`, `MIGRACJA_BAZY`, `LOGOWANIE_OAUTH`. Temat nazywa obszar, nie czynność.
2. **Utwórz folder** `docs/plany/<TEMAT>/`. Folderu `docs/plany/` nie tworzysz na zapas — powstaje
   razem z pierwszym planem (D-11).
3. **Wygeneruj plan główny w formacie z ustawień** (Krok 3, domyślnie HTML):
   - **Markdown** → `PLAN.md` wg `.claude/relai/templates/SPEC_PLAN.md`;
   - **HTML** → `PLAN.html` wg `.claude/relai/templates/SPEC_PLAN_HTML.md`, procedurą z pliku
     `html-plan.md` (sekcja „Plan główny w HTML" niżej mówi, kiedy go otworzyć). Treść merytoryczna jest w obu przypadkach ta sama — dziesięć
     sekcji z `SPEC_PLAN.md`. Format zmienia nośnik, nie zawartość.
4. **Wygeneruj `STATUS.md`** wg `.claude/relai/templates/SPEC_STATUS.md` — ze statusem planu
   `DO AKCEPTACJI` i modelem wykonawczym z Kroku 3. `STATUS.md` jest w Markdown **zawsze**,
   niezależnie od formatu planu (D-32).
5. **Dopisz linię aktywnego planu do `CLAUDE.md`** — dokładnie jedna linia z linkiem do `STATUS.md`
   planu (D-30). Jest już inna linia aktywnego planu → patrz „Więcej niż jeden plan" niżej.
6. **Zaktualizuj `docs/STATE.md`** (pojawił się nowy obszar prac) i dopisz wpis do `docs/DZIENNIK.md`
   — w tej samej turze, bez pytania. Utworzenie planu jest zmianą funkcjonalną w rozumieniu
   definicji ukończenia (D-44).
7. **Powiedz użytkownikowi, co dalej:** plan czeka na akceptację; do czasu akceptacji jest edytowalny
   normalnie, po akceptacji już nie.

Czego **nie** robisz na tym etapie: nie zaczynasz implementacji, **nie generujesz jeszcze
`PROMPT_ETAP_1.md`** (powstaje dopiero przy akceptacji planu — D-34), nie commitujesz bez zgody.

---

## Plan główny w HTML (D-32)

W HTML powstaje **wyłącznie plan główny**; `STATUS.md`, prompty etapowe i MINIPLAN-y zostają
w Markdown. Plan główny w formacie HTML → **otwórz `html-plan.md`** przed skopiowaniem szablonu
i wykonaj z niego kolejność szablonów (lokalne `docs/zasoby/HTML_PLAN/` przed kopią z pluginu)
oraz procedurę sześciu kroków z builderem. Ten sam plik niesie pytanie o nadpisanie lokalne
szablonu (D-62) po pierwszym planie HTML i przebieg zmiany stylu.

---

## Krok 5 — MINIPLAN

Miniplan **nie ma własnego pliku** (D-31). Jest wpisem w `docs/DZIENNIK.md`, w formacie opisanym
w `.claude/relai/templates/SPEC_DZIENNIK.md`, sekcja „Wpis typu MINIPLAN":

- **Cel** — jedno zdanie: po czym poznamy, że zrobione.
- **Kroki** — 2–5 pozycji, w kolejności wykonania.
- **Weryfikacja** — czym sprawdzisz, że działa. Nie „przetestuję" — czym konkretnie.

Wpis dopisujesz na końcu sekcji „Wpisy", **przed** rozpoczęciem pracy. Po wykonaniu wracasz i
dopisujesz zwykły wpis wynikowy — miniplanu nie edytujesz wstecz (dziennik jest append-only).

Miniplan **nie** zakłada folderu planu, **nie** trafia do `CLAUDE.md` i **nie** ma etapów. Jeśli
w trakcie pracy okazuje się, że zadanie przerosło próg z Kroku 2 — przerywasz, mówisz o tym i
proponujesz pełny plan. Nie „rozbudowujesz" miniplanu po cichu.

---

## Akceptacja i zamrożenie (D-33)

Plan po akceptacji jest **ZAMROŻONY**. Akceptacją jest jednoznaczna zgoda użytkownika („akceptuję",
„zatwierdzam", „ruszamy") — nie milczenie i nie brak uwag.

W momencie akceptacji:

1. `STATUS.md`: status planu → `ZAAKCEPTOWANY <data>`, pierwszy etap → `GOTOWY DO STARTU`.
2. **Wygeneruj `PROMPT_ETAP_1.md`** wg `.claude/relai/templates/SPEC_PROMPT_ETAPU.md`
   i wstaw link do kolumny `Prompt` przy E1 (D-34). Kolejnych promptów **nie** generujesz.
3. Wpis w `DZIENNIK.md`: plan zaakceptowany, z czym (jeśli akceptacja przyszła z poprawkami — te
   poprawki są **Aneksem A**, patrz niżej).
4. Od tej chwili sekcje merytoryczne `PLAN.md` są nietykalne.
5. Powiedz jednym zdaniem, jak ruszyć: świeża sesja i `/relai-stage`.

### Aneksy

Każda zmiana zamrożonego planu to **datowany aneks** dopisywany do sekcji „Aneksy" na końcu
`PLAN.md`. Kolejno: A, B, C… Aneks zawiera datę, powód zmiany i treść zmiany — a nie „poprawiony"
tekst sekcji.

Gdy użytkownik prosi o zmianę w zaakceptowanym planie, **nie edytujesz sekcji**. Odpowiadasz
propozycją aneksu w jednym zdaniu i pokazujesz jego treść do zatwierdzenia:

> To zmiana w zamrożonym planie — proponuję **Aneks B (2026-08-14)**: rezygnacja z etapu E4 na rzecz
> gotowej biblioteki, powód: dwa dni pracy vs zależność, którą i tak mamy. Dopisać?

Sekcje 1–N planu zostają dokładnie takie, jakie były w dniu akceptacji. Czytający po pół roku ma
widzieć, co uzgodniono pierwotnie **i** co się potem zmieniło — nie wygładzoną wersję końcową.

### Odchylenie fundamentalne

Aneks obsługuje zmianę **wewnątrz** planu. Gdy zmienia się sam cel albo wybrany wariant przestaje
obowiązywać — to jest odchylenie fundamentalne, nie aneks. Sygnały: unieważniony cel z sekcji
„Cele", odrzucony wariant wraca jako wybrany, przepada więcej niż połowa nieukończonych etapów.

Wtedy:

1. `STATUS.md`: status planu → `CZĘŚCIOWO ZREALIZOWANY <data>` z jednym zdaniem powodu.
2. Wpis w `DZIENNIK.md`: co zostało dowiezione, co przepadło i dlaczego.
3. Nowy plan w nowym folderze, z **linkiem do starego** w streszczeniu.
4. Stary folder planu → `docs/archiwum/` (D-18: nigdy ciche kasowanie).
5. `CLAUDE.md`: linia aktywnego planu wskazuje nowy plan.

---

## Prompty etapowe (D-34)

Etap wykonuje się w **świeżej sesji**, która nie zna poprzedniej. Całą jej pamięcią jest
`PROMPT_ETAP_N.md` w folderze planu — dokument samowystarczalny, którego format opisuje
`.claude/relai/templates/SPEC_PROMPT_ETAPU.md`. Etap uruchamia komenda `/relai-stage`.

Generacja jest **lazy** — dokładnie trzy momenty, nigdy na zapas:

| Moment | Co powstaje |
|---|---|
| Akceptacja planu | `PROMPT_ETAP_1.md` |
| Rytuał „Na koniec" etapu N | `PROMPT_ETAP_N+1.md` |
| Start sesji, gdy etap `GOTOWY DO STARTU` nie ma promptu | brakujący prompt — siatka bezpieczeństwa w `relai-core` |

Powód: prompt opisuje **realny stan repozytorium** w chwili startu etapu. Prompt napisany dwa etapy
wcześniej opisywałby stan zmyślony.

### Zanim wygenerujesz prompt — przeczytaj specyfikację

**Otwórz `.claude/relai/templates/SPEC_PROMPT_ETAPU.md` i wygeneruj wg niej.** Prompt pisany
„z sensu", bez otwarcia specyfikacji, wychodzi merytorycznie poprawny i **strukturalnie inny** —
a układ jest tu funkcją, nie ozdobą: świeża sesja szuka konkretnych sekcji w konkretnej kolejności.

Układ jest **stały, dziewięć elementów, w tej kolejności** (szczegóły każdego — w specyfikacji):

1. Nagłówek `# PROMPT_ETAP_N — <tytuł etapu>`.
2. Linia metryczna: `Plan: <TEMAT> • Etap: **EN z EM** • Wygenerowano: <data> (autor: <model>) •
   Wykonawca: **<model ze STATUS.md>**`, a po nim zalecany poziom `/effort <poziom>` (z tabeli
   etapów planu; plan go nie podaje → `medium`).
3. **Kontrola modelu** — blockquote „wykonuj wyłącznie na modelu X; inny model → zatrzymaj się",
   zakończony zalecanym poziomem `/effort` z powodem w jednym zdaniu.
4. **Co przeczytać na start** — tabela `Plik | Po co`, z dopiskiem „w tej kolejności, nic więcej".
5. **Decyzje już podjęte — nie otwierasz ich ponownie** — lista z numerami `D-NN` / źródłami;
   ostatni punkt wyznacza granicę zakresu wobec etapów następnych.
6. **Stan wyjściowy** — realny stan repo: drzewko plików, akapit „Czego jeszcze nie ma",
   przepisane w całości „Zasady aktywne" z rejestru lekcji.
7. **Zakres etapu** — sekcja **otwiera się linią z katalogiem roboczym etapu**
   (`.claude/relai/work/<TEMAT>/E<N>/` — ścieżka podstawiona, nie opisana; artefakt spoza projektu
   idzie do wpisu dziennika z nazwy), dalej numerowana lista, każdy punkt ze ścieżką pliku.
8. **Weryfikacja** — checkboxy, nagłówek „wszystkie punkty muszą przejść". Sekcja obowiązkowa
   zawsze (D-25). Wśród ostatnich punktów stoi **zawsze** katalog roboczy etapu: przejrzany
   raportem, skasowany po „tak", liczby przed i po do wpisu; artefakty spoza niego wypisane
   z nazwy. Wyłączony wiersz `Artefakty robocze` tego punktu nie wycisza.
9. **Na koniec** — `STATUS.md` → dziennik (+ lekcje, + ryzyka) → dokumenty → **generacja
   `PROMPT_ETAP_N+1`** → commit, z adnotacją „bez tego rytuału etap nie jest ukończony".

Ta sama zasada dotyczy `STATUS.md`: generujesz go i aktualizujesz wg `SPEC_STATUS.md`, a nie wg
własnego układu tabeli. Kolumny są dokładnie `Etap | Nazwa | Status | Prompt | Uwagi`, a linia
metryczna jest **jedną** linią z elementami rozdzielonymi `·`.

## Sygnał odchylenia — wątek spoza zakresu etapu

W trakcie etapu regularnie wypływa coś, czego w zakresie nie ma: usterka obok, brakujący log,
pomysł, który akurat teraz wydaje się oczywisty. Domyślne zachowanie modelu — zrobić to od razu —
jest tu najgorsze z możliwych: rozdyma etap, miesza dwie rzeczy w jednym wpisie i psuje pomiar
tego, co etap miał dowieźć. Zmierzone (retrospektywa 2026-08-12): pięć wpisów poprawkowych w jednym
etapie JiraManagera, sześć aneksów do jednego etapu PolyFlow.

**Warunek wyzwolenia:** pracujesz nad etapem planu (albo nad odnogą) i pojawia się rzecz, która
(a) nie mieści się w sekcji „Zakres etapu" promptu, i (b) nie jest jednolinijkowym drobiazgiem,
który wykonasz szybciej, niż o nim napiszesz.

**Co robisz:** zatrzymujesz się i zadajesz **jedno ustrukturyzowane pytanie** (AskUserQuestion),
z trzema opcjami — w tej kolejności:

| Opcja | Kiedy jest właściwa | Co się dzieje |
|---|---|---|
| **Odnoga** (Rekomendowane, gdy wątek ma własny zakres i weryfikację) | osobna robota, 2–5 punktów, da się wykonać w jednej świeżej sesji | `/relai-branch`: karta + `PROMPT_ODNOGA.md`, linia w sekcji „Odnogi" `STATUS.md` |
| **Aneks do planu** | wątek zmienia **sam plan** — zakres etapu, cel, wybrany wariant | datowany aneks w `PLAN.md` / `PLAN.html`, po zatwierdzeniu treści |
| **Świadomie odłożone** | rzecz warta zapamiętania, ale nie warta osobnego wątku | punkt „Świadomie odłożone" we wpisie dziennika zamykającym etap |

Zasady tego pytania:

- **Pytasz raz na wątek**, nie raz na myśl. Trzy wątki w jednym etapie to trzy pytania rozłożone
  w czasie — ale nigdy dwa wywołania AskUserQuestion pod rząd.
- **Rekomendację podajesz z powodem w jednym zdaniu** i przechodzisz dalej. Odpowiedź swobodna jest
  nadrzędna.
- Po odpowiedzi **wracasz do zakresu etapu**. Odnogi utworzonej nie wykonujesz teraz — o to w niej
  właśnie chodzi.
- Regułę „zatrzymaj się i zapytaj" niesie `CLAUDE.md` projektu (wzorzec L-0030 — warstwa zawsze
  w kontekście); ten skill dokłada procedurę i rozstrzygnięcia. Nie licz na to, że sam się wyzwoli.

---

## Odnogi planu (`/relai-branch`)

Odnoga to **boczny wątek z etapu, który dostaje własne miejsce zamiast rozdymać etap albo zginąć**.
Pełną strukturę obu plików opisuje `.claude/relai/templates/SPEC_ODNOGA.md`; procedurę wykonuje
komenda `/relai-branch`. Tutaj są zasady, które muszą być znane także bez tej komendy (L-0011):

1. **Gdzie mieszka.** Jest plan → `docs/plany/<TEMAT>/odnogi/<NAZWA>/`. Nie ma żadnego planu
   niezamkniętego → `docs/fixy/<NAZWA>/`, wątek samodzielny. `<NAZWA>` w CAPS_SNAKE, konwencja
   `<TEMAT>` (D-12).
2. **Zawsze para plików.** `ODNOGA.md` — karta w formacie miniplanu: cel, skąd się wzięła, zakres,
   poza zakresem, weryfikacja, wynik. `PROMPT_ODNOGA.md` — samowystarczalny prompt świeżej sesji,
   generowany tak jak prompty etapowe: **z realnego stanu repo** i z „Zasad aktywnych" przepisanych
   w całości.
3. **Ślad w planie to jedna linia.** Sekcja „Odnogi" w `STATUS.md`, zaraz po tabeli etapów:
   nazwa, jedno zdanie, etap-źródło, link do karty, status `OTWARTA` / `ZAMKNIĘTA <data>` /
   `PRZENIESIONA <data> → docs/fixy/<NAZWA>/`. Tabela etapów i dziennik wdrożenia zostają nietknięte.
4. **Plan zamrożony zostaje zamrożony.** Odnoga nie jest aneksem: nie dotyka `PLAN.md` /
   `PLAN.html` (D-33) i nie zmienia zakresu żadnego etapu. Wątek, który zmienia sam plan, to aneks.
5. **Jedna głębokość.** Odnoga od odnogi jest zakazana — wątek z odnogi, który sam potrzebuje
   odnogi, jest sygnałem pełnego planu. Mówisz to wprost i proponujesz plan; żaden plik nie powstaje.
6. **Odnogę wykonuje świeża sesja** z gotowego promptu, na modelu z karty. Zamknięcie:
   status w karcie → wpis w dzienniku → linia w `STATUS.md`. Odnogi **nie generują** promptu
   następnej odnogi — łańcucha lazy-generacji tu nie ma.

## Rytuał „Na koniec" etapu

Wykonujesz go **sam, w tej samej turze**, w której etap został skończony — tak jak definicja
ukończenia z `relai-core`, tylko dla etapu planu. Kolejność jest wiążąca:

1. **`STATUS.md`** — etap N → `ZREALIZOWANY <data>`; etap N+1 → `GOTOWY DO STARTU`; linia
   w dzienniku wdrożenia (jedna, zwięzła); kolumna `Prompt` przy N+1 dostaje link zaraz po
   punkcie 5.
1a. **Katalog roboczy etapu** (`.claude/relai/work/<TEMAT>/E<N>/`) — zmierz
   (`node .claude/relai/tools/clean-work.js raport`), pokaż pozycje, skasuj po „tak"; artefakty,
   które musiały powstać poza tym katalogiem, wypisz z nazwy. **Obie liczby, przed i po, idą do
   wpisu z punktu 2** — dlatego krok stoi tutaj, a nie przy dokumentach. Numer z literą, bo
   numeracji punktów 1–6 nie zmieniamy. Weryfikacja etapu ma ten sam punkt: jeśli przeszedł, ten
   krok jest wyłącznie przeniesieniem liczb do wpisu.
2. **`docs/DZIENNIK.md`** — wpis wg `SPEC_DZIENNIK.md` na końcu sekcji „Wpisy": Zrobione /
   Zweryfikowane — jak dokładnie / Świadomie odłożone / Do zrobienia przez człowieka. Podpis
   w formacie `Autor: RelAI (<model>) + <git config user.name>` — bez członu użytkownika wpis nie
   jest kompletny (D-63). Przejrzyj tabelę „Stan otwartych ryzyk". Lekcje z etapu →
   `docs/LEKCJE.md` + odświeżony destylat „Zasady aktywne".
3. **Bramki manualne w `STATUS.md`** — wpis, który właśnie powstał, ma sekcję „Do zrobienia przez
   człowieka"; każda jej nierozstrzygnięta pozycja dostaje linię w sekcji „Bramki manualne"
   `STATUS.md` ze statusem `OTWARTA` (`SPEC_STATUS.md`). Pozycja rozstrzygnięta w tym etapie →
   status `ROZSTRZYGNIĘTA <data> — <jak>`, równolegle z adnotacją przy pozycji we wpisie. Sekcja
   „Do zrobienia przez człowieka" z treścią „—" nie tworzy niczego i nie zostawia śladu.
4. **`docs/STATE.md`** i pozostałe dokumenty projektu, których dotknął etap (`README.md` tylko przy
   zmianie sposobu uruchomienia).
5. **Wygeneruj `PROMPT_ETAP_N+1.md`** ze specyfikacji promptu etapowego — z sekcji `PLAN.md`
   opisującej etap N+1, z **realnego stanu repo po tym etapie** i z lekcji, które w tym etapie
   powstały. To jest punkt, który najłatwiej pominąć i który przesądza o ciągłości pracy:
   **etap bez wygenerowanego następnego promptu nie jest ukończony** (D-34).
6. **Commit** — propozycja, conventional message. Jedyny punkt tego rytuału, o który pytasz.

Zamykany etap był **ostatnim** w planie → punkt 5 zastępujesz sekwencją „Zamknięcie planu" z pliku `plan-closing.md`.

Sesja przerwana w połowie rytuału zostawia etap w statusie `W TOKU`. Kolejne `/relai-stage` ma
wtedy dokończyć, nie zaczynać od zera — a siatka z `relai-core` wyłapie brakujący prompt na starcie
następnej sesji.

## Zamknięcie planu (D-36)

Ostatni etap dostał status ZREALIZOWANY → **otwórz `plan-closing.md`** i wykonaj jego dziewięć
kroków w tej samej turze, w podanej kolejności. Dwa pierwsze są blokujące — otwarte bramki
manualne i otwarte odnogi rozstrzyga człowiek, zanim gdziekolwiek napiszesz, że plan jest
zrealizowany. Linia „Aktywny plan" w `CLAUDE.md` kończy turę, wskazując istniejący plik albo
brzmiąc `Aktywny plan: brak`.


---

## Więcej niż jeden plan naraz

Dozwolone, ale `CLAUDE.md` ma **jedną** linię aktywnego planu (D-30). Gdy powstaje drugi plan, a
pierwszy nie jest zamknięty:

- zapytaj jednym zdaniem, który jest teraz aktywny;
- linia w `CLAUDE.md` wskazuje ten wybrany;
- drugi plan istnieje w `docs/plany/` i jest wymieniony w `STATE.md` — nie ginie, tylko nie jest
  aktywny.

Nie dopisujesz drugiej linii aktywnego planu i nie robisz z niej listy.

---

## Twarde zakazy tego skilla

- **Nie zaczynasz implementacji na podstawie planu.** Plan to nie zgoda na kod (D-33: najpierw
  akceptacja).
- **Nie edytujesz zamrożonego planu** — wyłącznie aneksy.
- **Nie tworzysz planu dla tematu spoza projektu** ani dla zadania, które trwa dziesięć minut.
- **Nie zadajesz drugiego pytania** o format i model, gdy odpowiedź jest już w `USTAWIENIA.md`.
- **Nie generujesz promptów etapowych na zapas** — wyłącznie w trzech momentach z sekcji „Prompty
  etapowe"; prompt etapu już zrealizowanego zostaje bez zmian.
- **Nie robisz przy okazji rzeczy spoza zakresu etapu** — od tego jest sygnał odchylenia: odnoga,
  aneks albo „świadomie odłożone".
- **Nie tworzysz odnogi z wnętrza odnogi** i nie zamykasz planu z odnogą `OTWARTA` bez decyzji
  człowieka.
- **Nie improwizujesz szablonu HTML z pamięci.** Brak `HTML_PLAN/` w obu lokalizacjach → mówisz
  o tym i prosisz o `--add-dir`; własnoręcznie napisany HTML nie jest planem RelAI.
- **Nie edytujesz szablonu w `.claude/relai/templates/`** — to cache nadpisywany przez hook przy
  starcie sesji. Zmiana wyglądu idzie wyłącznie przez nadpisanie lokalne w `docs/zasoby/HTML_PLAN/`.
- **Nie generujesz w HTML** `STATUS.md`, promptów etapowych ani MINIPLAN-ów (D-32).
- **Nie kasujesz** planu ani jego folderu; plan nieaktualny idzie do archiwum z adnotacją (D-18).
- **Nie wpisujesz do planu liczb bez etykiety** FAKT albo SZACUNEK (D-63).
