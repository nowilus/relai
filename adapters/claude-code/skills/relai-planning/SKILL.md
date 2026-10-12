---
name: relai-planning
description: >
  Creates and runs RelAI plans (PLAN + STATUS in docs/plany/TOPIC/, or a one-entry MINIPLAN),
  frozen after acceptance and run stage by stage. Use it before writing a plan or a breakdown of
  work in a project with RelAI structure (docs/USTAWIENIA.md contains "Wersja
  RelAI" / "RelAI version"), because RelAI plans have a required file layout; also for a
  refactor, migration or rewrite of that project spanning more than one session. Phrases
  (Polish): "przygotuj plan", "zaplanuj", "rozpisz to na etapy", "zrób plan", "plan wdrożenia";
  English: "make a plan", "break this into stages". Also when a stage starts or closes ("wykonaj
  etap", "następny etap", "zamknij etap", "run the stage", "next stage") and when a side thread
  is parked ("odnoga", "boczny wątek", "odłóż to na potem", "branch this off").
---

# relai-planning — plany, etapy i ich zamrażanie

Ten skill wykrywa prośbę o plan, rozróżnia PLAN i MINIPLAN, generuje plan i `STATUS.md`, zamraża
plan po akceptacji i prowadzi etapy: prompty etapowe, rytuał „Na koniec", odnogi i zamknięcie
planu. Etap uruchamia komenda `/relai-stage`, odnogę — `/relai-branch`. Rytuał startu sesji,
definicja ukończenia, rejestry `LEKCJE` / `DECYZJE` i frazy sesji należą do `relai-core`.

Ten skill zakłada strukturę RelAI w folderze (marker `Wersja RelAI:` w `docs/USTAWIENIA.md`).
Nie ma struktury → najpierw inicjalizacja albo tryb gościa (`relai-core`); w trybie gościa nie
planujesz w plikach.

Specyfikacje (`SPEC_PLAN`, `SPEC_PLAN_HTML`, `SPEC_STATUS`, `SPEC_PROMPT_ETAPU`, `SPEC_ODNOGA`,
`SPEC_DZIENNIK`) i szablon `HTML_PLAN/` czytaj z lokalnej kopii **`.claude/relai/templates/`** —
utrzymuje ją hook `session-context`; katalog pluginu jest dla sesji niedostępny (L-0012). Brak
kopii → powiedz o tym i poproś o `--add-dir` na katalog pluginu, zamiast generować z pamięci.

## Pliki doczytywane — kiedy który otworzyć

Leżą obok tego pliku. Otwierasz plik dopiero przy jego wyzwalaczu i czytasz go w całości przed
pierwszym krokiem procedury:

| Plik | Otwierasz go, gdy |
|---|---|
| `html-plan.md` | plan główny powstaje w HTML albo człowiek zmienia styl planów HTML |
| `stage-prompts.md` | generujesz `PROMPT_ETAP_N.md`: akceptacja planu, krok 5 „Na koniec", dogenerowanie brakującego promptu |
| `stage-closing.md` | etap planu został skończony — rytuał „Na koniec" w tej samej turze |
| `plan-closing.md` | ostatni etap planu dostał status ZREALIZOWANY |
| `deviation-and-branches.md` | w trakcie etapu albo odnogi wypływa wątek spoza zakresu, człowiek prosi o odnogę albo zamykasz odnogę |
| `amendments.md` | człowiek prosi o zmianę zamrożonego planu albo zmienia się sam cel planu |

Pliku nie ma obok `SKILL.md` (instalacja niepełna) → mówisz o tym jednym zdaniem i prosisz
o aktualizację pluginu; procedury nie odtwarzasz z pamięci.

---

## Krok 1 — czy to w ogóle jest prośba o plan

Rozstrzygnij **zanim** cokolwiek napiszesz. Intencję wykrywasz z treści prompta, bez żadnej komendy
(D-22).

### To jest prośba o plan

Wystarczy jeden z tych sygnałów:

- pada słowo *plan*, *zaplanuj*, *rozpisz*, *etapy*, *koncepcja*, *podejście*, *strategia*,
  *roadmapa* — w odniesieniu do **tego projektu**;
- użytkownik pyta, jak ugryźć, od czego zacząć albo w jakiej kolejności zrobić pracę **w tym
  projekcie**;
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
| Gdzie mieszka | `docs/plany/TEMAT/PLAN.md` + `STATUS.md` | jeden wpis w `docs/DZIENNIK.md` |
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

**Niejasność rozstrzygasz pytaniem** — pytanie o rodzaj jest wtedy pierwszym pytaniem z Kroku 3.
Gdy próg rozstrzyga jednoznacznie (w którąkolwiek stronę), o rodzaj **nie pytasz**: mówisz jednym
zdaniem, co robisz i dlaczego („to jedna sesja i trzy kroki — piszę miniplan w dzienniku"), i
zostawiasz użytkownikowi możliwość poprawienia Cię.

---

## Krok 3 — jedno pytanie startowe (D-39, Aneks A)

Zanim zapytasz, **sprawdź zapisane preferencje**: `docs/USTAWIENIA.md` → plik globalny
`~/.claude/relai/USTAWIENIA.md`. Znalazłeś odpowiedź — **nie pytaj o nią ponownie**; wspomnij pół
zdaniem, skąd ją masz. Preferencje pokrywają zwykle format i model; rodzaj planu jest cechą
konkretnego zadania i utrwaleniu **nie podlega**.

Gdy zostało cokolwiek do zapytania — **dokładnie jedno wywołanie AskUserQuestion**, wszystkie
brakujące pytania naraz, nigdy pytanie po wygenerowaniu planu. Jedyny wyjątek: pytanie
o **nadpisanie lokalne szablonu HTML** (D-62) po pokazaniu pierwszego planu HTML (`html-plan.md`).
Gdy nie zostało nic, **nie pytasz w ogóle** — piszesz jedno zdanie o tym, co przyjąłeś i skąd,
i generujesz. Pytanie startowe pada raz na projekt, nie raz na plan.

| # | Pytanie | Opcje (pierwsza z dopiskiem „(Rekomendowane)") |
|---|---|---|
| 1 | Rodzaj | pełny PLAN z etapami / MINIPLAN w dzienniku — rekomendacja wynika z progu z Kroku 2, podaj ją wprost z uzasadnieniem w jednym zdaniu |
| 2 | Format planu głównego | interaktywny HTML (Rekomendowane — plan do czytania przez człowieka: zwijane sekcje, diagram, symulator; jeden samowystarczalny plik) / Markdown (lżejszy, czytelny w diffie) — cokolwiek padnie, `STATUS.md` i prompty etapowe zostają w Markdown (D-32) |
| 3 | Model wykonawczy etapów | rekomendacja RelAI (Rekomendowane): złożone etapy — model najsilniejszy, mechaniczne — najtańszy / jeden model do wszystkiego / opis własny |

**Nazwy zamiast klas, gdy sesja ma listę modeli.** Kontekst startu sesji mówi jednym zdaniem, która
lista obowiązuje (`.claude/relai/MODELE-<narzędzie>.md`) i z kiedy jest; drugiej listy nie
otwierasz. Gdy to zdanie padło: opcje pytania 3 wymieniają **nazwy modeli** z pozycji `strong`,
`balanced`, `cheap` tej listy, a treść pytania niesie **datę listy**. Pozycja
`<TO BE FILLED IN: …>` nie jest nazwą — mówisz, że listy dla tej klasy nie ma, i wskazujesz
`/relai-models`; nazw nie zgadujesz (L-0026). Zdania o liście nie było albo pliku nie ma → pytanie
zostaje takie jak w tabeli, samymi klasami, bez dodatkowego komunikatu.

- **Odpowiedź swobodna jest dopuszczalna i nadrzędna.** „Etapy 1–3 Opusem, resztę Haiku" trafia
  do `STATUS.md` dosłownie w takim brzmieniu.
- Po odpowiedzi **od razu** dopisz preferencje (format, model) do `docs/USTAWIENIA.md` — wiersz
  z dzisiejszą datą; ponadprojektowe także do warstwy globalnej. Rodzaju planu nie zapisujesz.
- Więcej niż trzy pytania: nie. Braki uzupełniasz rozsądnym domyślnym wyborem i piszesz, co
  przyjąłeś.

---

## Krok 4 — generacja PLAN-u

1. **Ustal `TEMAT`** — CAPS_SNAKE, po polsku (albo w języku projektu), bez dat i numerów wersji
   (D-12): `PLATNOSCI`, `MIGRACJA_BAZY`, `LOGOWANIE_OAUTH`. Temat nazywa obszar, nie czynność.
2. **Utwórz folder** `docs/plany/TEMAT/`. Folderu `docs/plany/` nie tworzysz na zapas — powstaje
   razem z pierwszym planem (D-11).
3. **Wygeneruj plan główny w formacie z ustawień** (Krok 3, domyślnie HTML): Markdown → `PLAN.md`
   wg `SPEC_PLAN.md`; HTML → `PLAN.html` wg `SPEC_PLAN_HTML.md`, procedurą z `html-plan.md`
   (wyłącznie plan główny; `STATUS.md`, prompty etapowe i MINIPLAN-y zostają w Markdown, D-32).
   Treść merytoryczna jest w obu przypadkach ta sama — dziesięć sekcji z `SPEC_PLAN.md`.
4. **Wygeneruj `STATUS.md`** wg `SPEC_STATUS.md` — ze statusem planu `DO AKCEPTACJI` i modelem
   wykonawczym z Kroku 3.
5. **Dopisz linię aktywnego planu do `CLAUDE.md`** — dokładnie jedna linia z linkiem do `STATUS.md`
   planu (D-30). Jest już inna linia aktywnego planu → „Więcej niż jeden plan" niżej.
6. **Zaktualizuj `docs/STATE.md`** i dopisz wpis do `docs/DZIENNIK.md` — w tej samej turze, bez
   pytania (D-44).
7. **Powiedz użytkownikowi, co dalej:** plan czeka na akceptację; do czasu akceptacji jest edytowalny
   normalnie, po akceptacji już nie.

Na tym etapie nie zaczynasz implementacji, **nie generujesz jeszcze `PROMPT_ETAP_1.md`** (powstaje
przy akceptacji — D-34) i nie commitujesz bez zgody.

---

## Krok 5 — MINIPLAN

Miniplan **nie ma własnego pliku** (D-31). Jest wpisem w `docs/DZIENNIK.md`, w formacie z
`SPEC_DZIENNIK.md`, sekcja „Wpis typu MINIPLAN": **Cel** (jedno zdanie: po czym poznamy, że
zrobione), **Kroki** (2–5 pozycji w kolejności), **Weryfikacja** (czym konkretnie sprawdzisz).

Wpis dopisujesz na końcu sekcji „Wpisy", **przed** rozpoczęciem pracy; po wykonaniu dopisujesz
zwykły wpis wynikowy — miniplanu nie edytujesz wstecz. Miniplan nie zakłada folderu planu, nie
trafia do `CLAUDE.md` i nie ma etapów. Zadanie przerosło próg z Kroku 2 → przerywasz, mówisz o tym
i proponujesz pełny plan.

---

## Akceptacja i zamrożenie (D-33)

Plan po akceptacji jest **ZAMROŻONY**. Akceptacją jest jednoznaczna zgoda użytkownika („akceptuję",
„zatwierdzam", „ruszamy") — nie milczenie i nie brak uwag. W momencie akceptacji:

1. `STATUS.md`: status planu → `ZAAKCEPTOWANY <data>`, pierwszy etap → `GOTOWY DO STARTU`.
2. **Wygeneruj `PROMPT_ETAP_1.md`** wg `stage-prompts.md` i wstaw link do kolumny `Prompt` przy E1
   (D-34). Kolejnych promptów nie generujesz.
3. Wpis w `DZIENNIK.md`: plan zaakceptowany, z czym (poprawki przy akceptacji są **Aneksem A**).
4. Od tej chwili sekcje merytoryczne `PLAN.md` są nietykalne — zmiana idzie aneksem
   (`amendments.md`).
5. Powiedz jednym zdaniem, jak ruszyć: świeża sesja i `/relai-stage`.

Etap skończony → rytuał z `stage-closing.md` w tej samej turze. Ostatni etap ZREALIZOWANY →
`plan-closing.md`: dziewięć kroków w podanej kolejności; dwa pierwsze są blokujące — otwarte bramki
manualne i otwarte odnogi rozstrzyga człowiek, zanim napiszesz, że plan jest zrealizowany. Linia
„Aktywny plan" w `CLAUDE.md` kończy turę, wskazując istniejący plik albo brzmiąc `Aktywny plan: brak`.

## Więcej niż jeden plan naraz

Dozwolone, ale `CLAUDE.md` ma **jedną** linię aktywnego planu (D-30). Gdy powstaje drugi plan, a
pierwszy nie jest zamknięty: zapytaj jednym zdaniem, który jest teraz aktywny; linia w `CLAUDE.md`
wskazuje ten wybrany; drugi plan istnieje w `docs/plany/` i jest wymieniony w `STATE.md`. Drugiej
linii aktywnego planu nie dopisujesz i nie robisz z niej listy.

---

## Granice tego skilla

- Plan to nie zgoda na kod: implementacja rusza po akceptacji (D-33), zamrożony plan zmienia się
  wyłącznie aneksem.
- Planujesz wyłącznie pracę w tym projekcie, większą niż dziesięć minut.
- Szablonu HTML nie improwizujesz z pamięci: brak `HTML_PLAN/` w obu lokalizacjach → mówisz
  o tym i prosisz o `--add-dir`. Wygląd zmieniasz przez `docs/zasoby/HTML_PLAN/`, nie przez cache
  `.claude/relai/templates/`, który hook nadpisuje przy starcie sesji.
- Planu ani jego folderu nie kasujesz; plan nieaktualny idzie do archiwum z adnotacją (D-18).
- Każda liczba w planie ma etykietę FAKT albo SZACUNEK (D-63).
