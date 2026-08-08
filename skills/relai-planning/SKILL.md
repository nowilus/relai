---
name: relai-planning
description: >
  MUST BE USED whenever the user asks for any plan, concept, approach, staging or breakdown of work
  in a project that has RelAI structure (docs/USTAWIENIA.md contains "Wersja RelAI" / "RelAI
  version") — invoke this skill BEFORE writing the plan, because RelAI plans have a required file
  layout that differs from a plain Markdown answer.
  Trigger phrases (Polish): "przygotuj plan", "zaplanuj", "zaplanujmy", "rozpisz to na etapy",
  "zrób plan", "plan wdrożenia", "plan projektu", "rozpisz plan", "jak to ugryźć", "od czego
  zacząć", "w jakiej kolejności". English: "make a plan", "plan this out", "break this into
  stages", "what's the approach". Also for a refactor, migration or rewrite request that spans more
  than one session, even when the word "plan" is absent.
  ALSO USE when a stage of an existing plan is being started or closed. Trigger phrases (Polish):
  "wykonaj etap", "zrób etap", "uruchom etap", "następny etap", "kolejny etap", "zamknij etap",
  "kończymy etap". English: "run the stage", "next stage", "close the stage".
  The skill decides between a full PLAN (docs/plany/<TOPIC>/PLAN.md + STATUS.md, one active-plan
  line in CLAUDE.md) and a MINIPLAN (a single journal entry), asks once about kind, format and the
  model executing the stages, freezes the plan after acceptance so changes go in as dated annexes,
  generates the self-contained stage prompts PROMPT_ETAP_N.md lazily, runs the end-of-stage ritual,
  and closes the plan when the last stage is done.
---

# relai-planning — plany, etapy i ich zamrażanie

Wersja E6 (RelAI 0.6.0). Zakres tej wersji: **wykrycie intencji planowania + rozróżnienie
PLAN/MINIPLAN + pytanie startowe + generacja planu w Markdown albo w HTML + `STATUS.md` +
zamrożenie z aneksami + prompty etapowe `PROMPT_ETAP_N` z lazy-generacją + rytuał „Na koniec" etapu
+ zamknięcie planu**. Etap uruchamia komenda `/relai-stage`. Od 0.6.0 działa interaktywny szablon
HTML planów głównych (`HTML_PLAN/`) razem z nadpisaniem lokalnym (D-62).

Specyfikacje (`SPEC_PLAN`, `SPEC_PLAN_HTML`, `SPEC_STATUS`, `SPEC_PROMPT_ETAPU`, `SPEC_DZIENNIK`)
czytaj z lokalnej kopii **`.claude/relai/templates/`** — utrzymuje ją hook `session-context`;
katalog pluginu jest dla sesji niedostępny (L-0012). Tą samą drogą dociera szablon HTML
(`.claude/relai/templates/HTML_PLAN/`). Brak kopii → powiedz o tym i poproś o `--add-dir` na katalog
pluginu, zamiast generować z pamięci.

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
   - **HTML** → `PLAN.html` wg `.claude/relai/templates/SPEC_PLAN_HTML.md`, procedurą z sekcji
     „Plan główny w HTML" niżej. Treść merytoryczna jest w obu przypadkach ta sama — dziesięć
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

W HTML powstaje **wyłącznie plan główny**. `STATUS.md`, prompty etapowe i MINIPLAN-y zostają
w Markdown — HTML jest dla ludzi, Markdown dla agentów.

### Skąd bierzesz szablon — kolejność jest wiążąca

1. **`docs/zasoby/HTML_PLAN/`** — lokalne nadpisanie projektu (D-62). Istnieje → używasz go
   i nie zaglądasz dalej. **Lokalne ma zawsze pierwszeństwo.**
2. **`.claude/relai/templates/HTML_PLAN/`** — kopia z pluginu, utrzymywana przez hook
   `session-context`.
3. Nie ma ani jednego → powiedz to wprost i poproś o uruchomienie sesji z `--add-dir` na katalog
   pluginu. **Nie improwizujesz własnego HTML-a** — plan ma wyglądać tak samo w każdym projekcie.

### Procedura — sześć kroków

Pełny opis: `.claude/relai/templates/SPEC_PLAN_HTML.md`. Przebieg wypisany tutaj, bo odesłanie
do pliku bywa pomijane (L-0011):

1. **Skopiuj** `szablon.html` do `docs/plany/<TEMAT>/PLAN.html`.
2. **Wypełnij znaczniki nagłówkowe:** `{{JEZYK}}`, `{{TYTUL}}`, `{{PODTYTUL}}`, `{{DATA}}`,
   `{{STATUS}}`, `{{LICZBA_ETAPOW}}`, `{{PRACOCHLONNOSC}}`, `{{MODEL_WYKONAWCZY}}`, `{{PODPIS}}`,
   `{{TEMAT_PLANU}}`.
3. **Wypełnij `{{SEKCJA_1}}`…`{{SEKCJA_10}}`** treścią wg `SPEC_PLAN.md`, składając ją z gotowych
   fragmentów z `komponenty.html`. `{{SZEPT_N}}` to półzdanie na marginesie nagłówka sekcji.
4. **Symulator** — tylko gdy plan zawiera wyliczenia. Gdy ich nie ma, znaczniki symulatora
   i tak wypełniasz wartościami pustymi (`[]`, `function(){}`, `24`, `[0]`, `''`); plik
   z niewypełnionym znacznikiem jest zepsuty.
5. **Uruchom builder:** `node <katalog szablonu>/zbuduj.js docs/plany/<TEMAT>/PLAN.html`. Osadza
   fonty i **wypisuje niewypełnione znaczniki, kończąc kodem 1** — to błąd, nie ostrzeżenie.
6. **Otwórz plik i sprawdź**, że symulator liczy, sekcje się zwijają i strona nie przewija się
   w poziomie. Bez tego kroku plan nie jest gotowy.

Zakazy nośnika (pełna lista w `SPEC_PLAN_HTML.md`): zero żądań sieciowych, zero fioletu i poświaty,
zero emoji, zero animacji ozdobnych — w szczególności **żadnej kropki wędrującej po diagramie**.
Obsługa `prefers-reduced-motion` jest w szablonie; nie usuwasz jej.

---

## Nadpisanie lokalne szablonu (D-62)

Projekt może mieć **własną wersję szablonu HTML**, która wygrywa z wersją z pluginu.

**Pytanie pada raz na projekt**, po pokazaniu **pierwszego** wygenerowanego planu HTML — wtedy,
gdy użytkownik ma plik przed oczami i wie, o czym decyduje. Zanim zapytasz, sprawdź w
`docs/USTAWIENIA.md` wiersz „Szablon planu HTML" i warstwę globalną; jest odpowiedź → **nie
pytasz** (L-0006). To pytanie **nie należy** do jednego wywołania z Kroku 3 i nie łamie zakazu
pytania po wygenerowaniu planu: tamten zakaz dotyczy pytań o rodzaj, format i model, bez których
planu nie da się napisać.

Odpowiedź „zostawiam domyślny" też zapisujesz — inaczej pytanie wróci przy następnym planie.

Zmiana stylu — kolejno:

1. **Skopiuj całe drzewo** `.claude/relai/templates/HTML_PLAN/` do `docs/zasoby/HTML_PLAN/`
   (szablon, komponenty, `zbuduj.js` i katalog `fonty/` — bez fontów builder nie ma czego osadzić).
2. **Zmień wygląd wyłącznie przez tokeny w `:root`** w `docs/zasoby/HTML_PLAN/szablon.html` —
   kolory, promienie, kroje. Nie dopisujesz reguł CSS pod konkretny plan; przy następnej zmianie
   szablonu nikt nie odgadnie, co było celowe.
3. **Dopisz wiersz do `docs/USTAWIENIA.md`** z dzisiejszą datą: czego dotyczy („Szablon planu
   HTML"), decyzja („nadpisanie lokalne w `docs/zasoby/HTML_PLAN/`, ma pierwszeństwo przed wersją
   z pluginu") — plus jednym półzdaniem, co zmieniono.
4. **Przegeneruj plan** z lokalnej kopii, żeby użytkownik zobaczył efekt w tej samej turze.

Od tej chwili **każdy** plan HTML w tym projekcie powstaje z `docs/zasoby/HTML_PLAN/`, także po
aktualizacji pluginu.

### Dlaczego `docs/zasoby/`, a nie `.claude/relai/`

`.claude/relai/` jest **cache'em pluginu**: hook `session-context` nadpisuje tam pliki przy każdym
starcie sesji, a `.gitignore` z `*` trzyma cały katalog poza repozytorium. Nadpisanie schowane
w cache'u przeżyłoby aktualizację pluginu (hook pisze tylko do `templates/`), ale zniknęłoby przy
klonowaniu repo, na drugiej maszynie i u współpracownika — a to jest świadoma decyzja projektu,
nie plik tymczasowy. `docs/zasoby/` jest w repo (D-11, D-24), wchodzi do backupu i jest widoczne
w diffie. Dlatego nadpisanie mieszka tam (mitygacja R6).

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
   Wykonawca: **<model ze STATUS.md>**`.
3. **Kontrola modelu** — blockquote „wykonuj wyłącznie na modelu X; inny model → zatrzymaj się".
4. **Co przeczytać na start** — tabela `Plik | Po co`, z dopiskiem „w tej kolejności, nic więcej".
5. **Decyzje już podjęte — NIE otwieraj ich ponownie** — lista z numerami `D-NN` / źródłami;
   ostatni punkt wyznacza granicę zakresu wobec etapów następnych.
6. **Stan wyjściowy** — realny stan repo: drzewko plików, akapit „Czego jeszcze NIE ma",
   przepisane w całości „Zasady aktywne" z rejestru lekcji.
7. **Zakres etapu** — numerowana lista, każdy punkt ze ścieżką pliku.
8. **Weryfikacja** — checkboxy, nagłówek „wszystkie punkty muszą przejść". Sekcja obowiązkowa
   zawsze (D-25).
9. **Na koniec** — `STATUS.md` → dziennik (+ lekcje, + ryzyka) → dokumenty → **generacja
   `PROMPT_ETAP_N+1`** → commit, z adnotacją „bez tego rytuału etap NIE jest ukończony".

Ta sama zasada dotyczy `STATUS.md`: generujesz go i aktualizujesz wg `SPEC_STATUS.md`, a nie wg
własnego układu tabeli. Kolumny są dokładnie `Etap | Nazwa | Status | Prompt | Uwagi`, a linia
metryczna jest **jedną** linią z elementami rozdzielonymi `·`.

## Rytuał „Na koniec" etapu

Wykonujesz go **sam, w tej samej turze**, w której etap został skończony — tak jak definicja
ukończenia z `relai-core`, tylko dla etapu planu. Kolejność jest wiążąca:

1. **`STATUS.md`** — etap N → `ZREALIZOWANY <data>`; etap N+1 → `GOTOWY DO STARTU`; linia
   w dzienniku wdrożenia (jedna, zwięzła); kolumna `Prompt` przy N+1 dostaje link zaraz po
   punkcie 3.
2. **`docs/DZIENNIK.md`** — wpis wg `SPEC_DZIENNIK.md` na końcu sekcji „Wpisy": Zrobione /
   Zweryfikowane — jak dokładnie / Świadomie odłożone / Do zrobienia przez człowieka. Przejrzyj
   tabelę „Stan otwartych ryzyk". Lekcje z etapu → `docs/LEKCJE.md` + odświeżony destylat „Zasady
   aktywne".
3. **`docs/STATE.md`** i pozostałe dokumenty projektu, których dotknął etap (`README.md` tylko przy
   zmianie sposobu uruchomienia).
4. **Wygeneruj `PROMPT_ETAP_N+1.md`** ze specyfikacji promptu etapowego — z sekcji `PLAN.md`
   opisującej etap N+1, z **realnego stanu repo po tym etapie** i z lekcji, które w tym etapie
   powstały. To jest punkt, który najłatwiej pominąć i który przesądza o ciągłości pracy:
   **etap bez wygenerowanego następnego promptu NIE jest ukończony** (D-34).
5. **Commit** — propozycja, conventional message. Jedyny punkt tego rytuału, o który pytasz.

Zamykany etap był **ostatnim** w planie → punkt 4 zastępujesz sekwencją „Zamknięcie planu" niżej.

Sesja przerwana w połowie rytuału zostawia etap w statusie `W TOKU`. Kolejne `/relai-stage` ma
wtedy dokończyć, nie zaczynać od zera — a siatka z `relai-core` wyłapie brakujący prompt na starcie
następnej sesji.

## Zamknięcie planu (D-36)

Gdy ostatni etap dostaje status ZREALIZOWANY, zamknięcie wykonujesz **sam, w tej samej turze**,
w tej kolejności:

1. **`docs/STATE.md`** — nadpisz: obszar planu przechodzi z „w toku" do stanu faktycznego.
2. **Wpis zamykający w `DZIENNIK.md`** — sekcja „Zrobione" mówi **dowiezione vs plan**: co miało
   powstać, co powstało, co przepadło. Bez tego porównania wpis jest niepełny.
3. **`STATUS.md`** — status planu → `ZREALIZOWANY <data>`, wszystkie etapy domknięte.
4. **Ryzyka** — przejrzyj tabelę „Stan otwartych ryzyk": ryzyka związane z planem zamknij z datą,
   nowe (jeśli praca je ujawniła) dopisz.
5. **Archiwum** — przenieś `docs/plany/<TEMAT>/` do `docs/archiwum/plany/<TEMAT>/`. Zawartość bez
   zmian; przeniesienie, nie kasowanie.
6. **`CLAUDE.md`** — linia aktywnego planu. **Warunek twardy: kiedy kończysz turę, linia wskazuje
   istniejący plik albo brzmi `Aktywny plan: brak`.** Link do przeniesionego folderu jest błędem —
   prowadzi donikąd, a jednocześnie mówi „tu trwa praca". Rozstrzygasz tak:

   - jest dokładnie jeden inny plan niezamknięty → wpisujesz go, bez pytania;
   - jest ich więcej albo nie masz pewności → wpisujesz `Aktywny plan: brak`, **a potem** pytasz
     jednym zdaniem, który ma być następny;
   - nie ma żadnego → `Aktywny plan: brak`.

   Pytanie o następcę jest dozwolone. Pytanie **zamiast** poprawienia linii — nie: to zostawia
   projekt z martwym linkiem i przerzuca sprzątanie po sobie na człowieka. `brak` jest zawsze
   poprawną wartością tymczasową; martwy link nie jest poprawny nigdy.
7. **Podsumowanie** — 3–5 zdań dla użytkownika: co dowieziono, czego nie i dlaczego, co czeka na
   człowieka.

Punkty 1–6 nie są przedmiotem pytania. Pytaniem może być wyłącznie commit.

**Kolejność: najpierw zmiana w repozytorium, potem zdanie, które ją opisuje.** Wpis dziennika
mówiący „folder przeniesiony do archiwum", napisany zanim folder został przeniesiony, jest fałszem
w dokumencie, któremu następna sesja zaufa bezwarunkowo. Dotyczy to każdego kroku tego rytuału
i rytuału „Na koniec" etapu.

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
- **Nie improwizujesz szablonu HTML z pamięci.** Brak `HTML_PLAN/` w obu lokalizacjach → mówisz
  o tym i prosisz o `--add-dir`; własnoręcznie napisany HTML nie jest planem RelAI.
- **Nie edytujesz szablonu w `.claude/relai/templates/`** — to cache nadpisywany przez hook przy
  starcie sesji. Zmiana wyglądu idzie wyłącznie przez nadpisanie lokalne w `docs/zasoby/HTML_PLAN/`.
- **Nie generujesz w HTML** `STATUS.md`, promptów etapowych ani MINIPLAN-ów (D-32).
- **Nie kasujesz** planu ani jego folderu; plan nieaktualny idzie do archiwum z adnotacją (D-18).
- **Nie wpisujesz do planu liczb bez etykiety** FAKT albo SZACUNEK (D-63).
