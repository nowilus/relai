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
  The skill decides between a full PLAN (docs/plany/<TOPIC>/PLAN.md + STATUS.md, one active-plan
  line in CLAUDE.md) and a MINIPLAN (a single journal entry), asks once about kind, format and the
  model executing the stages, freezes the plan after acceptance so changes go in as dated annexes,
  and closes the plan when the last stage is done.
---

# relai-planning — plany, etapy i ich zamrażanie

Wersja E3 (RelAI 0.3.0). Zakres tej wersji: **wykrycie intencji planowania + rozróżnienie
PLAN/MINIPLAN + pytanie startowe + generacja planu w Markdown + `STATUS.md` + zamrożenie z aneksami
+ zamknięcie planu**. Komenda `/relai-stage`, format `PROMPT_ETAP_N` i lazy-generacja promptów
dochodzą w wersji następnej; szablon HTML planów jeszcze później. Nie udawaj, że już działają.

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

Gdy nie zostało nic — bo próg rozstrzygnął rodzaj, a format i model są w ustawieniach — **nie
pytasz w ogóle**. Piszesz jedno zdanie o tym, co przyjąłeś i skąd („pełny plan, Markdown, model
z ustawień projektu") i generujesz. To jest typowa sytuacja przy drugim i każdym kolejnym planie
w tym samym projekcie: pytanie startowe pada raz na projekt, nie raz na plan.

| # | Pytanie | Opcje (pierwsza z dopiskiem „(Rekomendowane)") |
|---|---|---|
| 1 | Rodzaj | pełny PLAN z etapami / MINIPLAN w dzienniku — rekomendacja wynika z progu z Kroku 2, podaj ją wprost z uzasadnieniem w jednym zdaniu |
| 2 | Format | Markdown (Rekomendowane — jedyny działający w tej wersji) / HTML — zapiszę preferencję i użyję jej, gdy szablon HTML dojdzie w kolejnej wersji; teraz plan powstanie w Markdown |
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
3. **Wygeneruj `PLAN.md`** wg `${CLAUDE_PLUGIN_ROOT}/templates/SPEC_PLAN.md`.
4. **Wygeneruj `STATUS.md`** wg `${CLAUDE_PLUGIN_ROOT}/templates/SPEC_STATUS.md` — ze statusem planu
   `DO AKCEPTACJI` i modelem wykonawczym z Kroku 3.
5. **Dopisz linię aktywnego planu do `CLAUDE.md`** — dokładnie jedna linia z linkiem do `STATUS.md`
   planu (D-30). Jest już inna linia aktywnego planu → patrz „Więcej niż jeden plan" niżej.
6. **Zaktualizuj `docs/STATE.md`** (pojawił się nowy obszar prac) i dopisz wpis do `docs/DZIENNIK.md`
   — w tej samej turze, bez pytania. Utworzenie planu jest zmianą funkcjonalną w rozumieniu
   definicji ukończenia (D-44).
7. **Powiedz użytkownikowi, co dalej:** plan czeka na akceptację; do czasu akceptacji jest edytowalny
   normalnie, po akceptacji już nie.

Czego **nie** robisz na tym etapie: nie zaczynasz implementacji, nie tworzysz `PROMPT_ETAP_1.md`
(prompty etapowe to następna wersja — powiedz to wprost, jeśli użytkownik na nie liczy), nie
commitujesz bez zgody.

---

## Krok 5 — MINIPLAN

Miniplan **nie ma własnego pliku** (D-31). Jest wpisem w `docs/DZIENNIK.md`, w formacie opisanym
w `${CLAUDE_PLUGIN_ROOT}/templates/SPEC_DZIENNIK.md`, sekcja „Wpis typu MINIPLAN":

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

1. `STATUS.md`: status planu → `ZAAKCEPTOWANY <data>`.
2. Wpis w `DZIENNIK.md`: plan zaakceptowany, z czym (jeśli akceptacja przyszła z poprawkami — te
   poprawki są **Aneksem A**, patrz niżej).
3. Od tej chwili sekcje merytoryczne `PLAN.md` są nietykalne.

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
6. **`CLAUDE.md`** — linia aktywnego planu: nowy aktywny plan albo jawne „Aktywny plan: brak".
7. **Podsumowanie** — 3–5 zdań dla użytkownika: co dowieziono, czego nie i dlaczego, co czeka na
   człowieka.

Punkty 1–6 nie są przedmiotem pytania. Pytaniem może być wyłącznie commit.

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
- **Nie obiecujesz** promptów etapowych, `/relai-stage` ani szablonu HTML — w tej wersji ich nie ma.
- **Nie kasujesz** planu ani jego folderu; plan nieaktualny idzie do archiwum z adnotacją (D-18).
- **Nie wpisujesz do planu liczb bez etykiety** FAKT albo SZACUNEK (D-63).
