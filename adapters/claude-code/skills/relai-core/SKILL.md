---
name: relai-core
description: >
  MUST BE USED on the first prompt of a session in any folder, before answering anything else — to
  check whether the folder is a RelAI project (docs/USTAWIENIA.md contains "Wersja RelAI" / "RelAI
  version"), run the session start ritual when it is, and offer to set the structure up when it is
  not. Skipping this check means working without the project's memory, rules and open risks.
  Trigger phrases (Polish): "zacznijmy projekt", "nowy projekt", "zaczynam projekt", "zainicjuj
  projekt", "dodaj RelAI", "dołącz RelAI", "zaadoptuj projekt", "co to za projekt", "kończymy na
  dziś", "kontynuujemy pracę", "sprawdź status", "jak stoimy". English: "start project", "new
  project", "init project", "set up RelAI", "adopt this project", "wrapping up", "let's continue",
  "status check".
  Covers: initialization (consent, then exactly three questions, then generation of CLAUDE.md,
  README.md and docs/ with STATE, DZIENNIK, LEKCJE, DECYZJE, USTAWIENIA, KOMENDY), guest mode,
  non-destructive attach, full adoption of an existing project (explicit /relai-adopt only, D-70),
  keeping STATE and the journal current in the same turn as any functional
  change, automatic two-phase rotation of the journal and the lessons register into docs/archiwum/
  during the session-closing ritual (thresholds and an off switch live in USTAWIENIA; silence below
  the threshold), recording a lesson after every user correction, proposing to freeze a recurring decision,
  and the conditional rules of the project profile (app / agent-voice / flow / prompty): the
  document that appears at the first code, the first UI, the first deploy, the first artifact, and
  the snapshot that must precede any production config change. Planning is a separate skill
  (relai-planning).
---

# relai-core — struktura projektu, pamięć i rytuały sesji

Wersja 1.7.0 (plan HIGIENA_DOKUMENTOW — rotacja bez blokad, przegląd spraw przeterminowanych, progi z adresem w raporcie startu). Zakres tego skilla: **rozpoznanie stanu folderu + inicjalizacja + tryb
gościa + niedestrukcyjne dołączenie + rytuały sesji + rotacja dokumentów przy zamknięciu sesji +
siatka brakujących promptów etapowych + siatka rozjazdu stanu + rejestr decyzji po adopcji +
rejestry LEKCJE/DECYZJE + trzy frazy naturalne + warstwa ustawień globalnych + reguły warunkowe
profilu projektu**. Od 0.5.0 działa też zestaw hooków (sekrety, ochrona konfiguracji, przypomnienia,
kontekst sesji, a od 0.8.0 reguły profilu) — pilnują twardych granic niezależnie od tego skilla.
Od 0.9.0 działa **pełna adopcja zastanego projektu** — wyłącznie na jawne wywołanie `/relai-adopt`
(D-70); jej procedura mieszka w pliku komendy, nie tutaj.

**Planowanie należy do skilla `relai-planning`** (od 0.3.0): wykrycie prośby o plan, rozróżnienie
PLAN/MINIPLAN, generacja `docs/plany/<TEMAT>/`, prompty etapowe `PROMPT_ETAP_N`, rytuał „Na koniec"
etapu, zamrożenie i zamknięcie planu. Etap uruchamia komenda `/relai-stage` (od 0.4.0). Tutaj planów
nie opisujesz i nie tworzysz — tutaj plan pojawia się jako pozycja czytana w rytuale startu, jako
linia „Aktywny plan" w `CLAUDE.md` i jako siatka wyłapująca brakujący prompt etapowy.

**Operacje rzadkie mają własne komendy** (od 0.7.0): kopia zapasowa, przegląd porządków i zdrowia,
lista zmian z dziennika, pakiet przekazania, wycieczka po projekcie i ściąga komend; od 0.9.0
także adopcja zastanego projektu (`/relai-adopt`) i aktualizacja projektu do wersji pluginu
(`/relai-update`). Ich procedury mieszkają w plikach komend, nie tutaj — z tego skilla wychodzi
wyłącznie **propozycja** wycieczki dla nieznanego autora (sekcja niżej). Listę tego, co realnie
działa, użytkownik ma w wygenerowanym `docs/KOMENDY.md`.

Specyfikacje dokumentów czytaj z **lokalnej kopii `.claude/relai/templates/`** w bieżącym
folderze — utrzymuje ją hook `session-context` (katalog pluginu jest dla sesji niedostępny,
L-0012). Jeśli kopii nie ma (hook nie zadziałał), powiedz o tym jednym zdaniem i poproś
o uruchomienie sesji z `--add-dir` na katalog pluginu — nie generuj dokumentów z pamięci.

---

## Krok 0 — rozpoznanie stanu folderu (zawsze pierwsze, bez pytania)

Sprawdź po kolei, ciszej niż użytkownik zauważy. Nie komentuj samego sprawdzania.

1. **Marker trybu gościa** — plik `.claude/relai.json` zawierający `"mode": "guest"`.
   → Stan: **GOŚĆ**.
2. **Marker struktury RelAI** — plik `docs/USTAWIENIA.md` (albo jego odpowiednik w języku projektu,
   np. `docs/SETTINGS.md`) zawierający tekst `Wersja RelAI` / `RelAI version`.
   → Stan: **PROJEKT RELAI**.
3. W pozostałych przypadkach ustal, czy folder ma zastaną zawartość. Za **pusty** uznaj folder,
   w którym poza metadanymi narzędzi nie ma nic: `.git/`, `.claude/`, `.vscode/`, `.idea/`,
   `.gitignore`, `.gitattributes`, `LICENSE`. Cokolwiek innego (kod, dokumenty, `package.json`,
   `README.md`) → folder ma zawartość.
   → Stan: **PUSTY** albo **Z ZAWARTOŚCIĄ**.

Dalej idź dokładnie jedną ścieżką.

---

## Stan GOŚĆ — nic nie proponuj

Użytkownik już raz odmówił w tym folderze (D-21). Pracuj jak zwykły Claude Code.

- **Nie** pytaj ponownie o inicjalizację — ani w tej sesji, ani w żadnej następnej.
- Jedyny wyjątek: użytkownik sam prosi („dodaj RelAI", „dołącz strukturę", „add RelAI").
  Wtedy usuń marker i przejdź ścieżką odpowiednią do zawartości folderu.

---

## Stan PROJEKT RELAI — rytuał startu sesji

Struktura już jest. Nie inicjalizuj niczego drugi raz i nie nadpisuj istniejących dokumentów.
Zamiast tego wykonaj **rytuał startu** — raz na sesję, przed pierwszą merytoryczną odpowiedzią.

### Kolejność czytania (obowiązkowa, nic poza tym)

| # | Plik | Co z niego bierzesz |
|---|---|---|
| 1 | `CLAUDE.md` | reguły procesu, definicja ukończenia, wskazanie aktywnego planu |
| 2 | `docs/STATE.md` | stan na dziś — cały plik, jest krótki |
| 3 | `docs/DZIENNIK.md` | **wyłącznie** sekcja „Stan otwartych ryzyk", sekcja „Czeka na człowieka" (od 1.6.0) i ostatni wpis |
| 4 | `docs/LEKCJE.md` | **wyłącznie** sekcja „Zasady aktywne" (D-15) |
| 5 | `docs/USTAWIENIA.md` | tabela preferencji — zanim o cokolwiek zapytasz |
| 6 | aktywny plan (`docs/plany/<TEMAT>/STATUS.md`) | tylko jeśli `CLAUDE.md` go wskazuje |

**Zakaz pełnotekstowego skanowania repo na starcie.** Nie czytasz `docs/DECYZJE.md` w całości ani
starych wpisów dziennika — sięgasz po nie, gdy temat konkretnie tego wymaga. Pliku, którego nie ma
(np. `LEKCJE.md` w projekcie sprzed 0.2.0), po prostu nie czytasz; nie zgłaszaj tego jako błędu.

### Siatka bezpieczeństwa: brakujący prompt etapowy (D-34)

Ostatni krok czytania, wykonywany **tylko wtedy**, gdy `CLAUDE.md` wskazuje aktywny plan. Sprawdź
w jego `STATUS.md`: czy etap ze statusem `GOTOWY DO STARTU` ma w kolumnie `Prompt` link do
istniejącego pliku.

- **Ma** → nic nie robisz i nic nie komentujesz.
- **Nie ma** (kolumna pusta, `—`, albo link prowadzi do nieistniejącego pliku) → to ślad po sesji
  przerwanej w połowie rytuału „Na koniec". Powiedz o tym **jednym zdaniem** i zaproponuj
  wygenerowanie promptu. **Po zgodzie** generuje go skill `relai-planning`
  (specyfikacja: `.claude/relai/templates/SPEC_PROMPT_ETAPU.md`) i uzupełnia kolumnę `Prompt`.

Zasady siatki:

- Bez zgody **nie generujesz** — to jest zauważenie luki, nie automatyczna naprawa.
- Zauważenie idzie **przed** akapitem „gdzie jesteśmy", żeby użytkownik zobaczył je od razu.
- Odmowa zamyka temat na tę sesję; nie wracasz do niej przy kolejnych promptach.
- Brak aktywnego planu, plan `DO AKCEPTACJI`, brak etapu `GOTOWY DO STARTU` → siatka milczy.

Od 0.5.0 siatka ma **dwie warstwy**: ten krok rytuału oraz hook `session-context` (SessionStart),
który wstrzykuje lukę do kontekstu nawet wtedy, gdy skill się nie wyzwolił. Jeśli hook już zgłosił
lukę w kontekście sesji, nie zgłaszaj jej drugi raz — przejdź od razu do propozycji dogenerowania.

### Siatka bezpieczeństwa: rozjazd stanu (od 1.3.0)

Trzy dokumenty mówią o tym samym: `STATUS.md` planu (który etap trwa), linia „Aktywny plan"
w `CLAUDE.md` (który plan jest aktywny) i `docs/STATE.md` („nad czym pracujemy teraz"). Sesja
przerwana w połowie zostawia je rozjechane, a następna sesja wierzy temu, który przeczytała
pierwszy.

**Sygnał niesie hook `session-context`, nie ten skill.** Porównanie jest mechaniczne (statusy
w tabeli, nazwa folderu planu w treści STATE), więc ma działać bez wyzwolenia czegokolwiek
(L-0030, R2). Hook wypisuje surowe fakty w kontekście sesji i mówi, żeby zgłosić je **jednym
zdaniem** przed akapitem „gdzie jesteśmy".

Twoja rola w rytuale startu:

- **Hook zgłosił rozjazd** → zgłaszasz go użytkownikowi jednym zdaniem i pytasz, który zapis jest
  prawdziwy. **Nie powtarzasz sygnału drugi raz** i nie sprawdzasz porównania ponownie.
- **Hook milczy** → milczysz też. Cisza hooka znaczy „dokumenty są zgodne", a nie „nie sprawdzono";
  nie robisz z rytuału drugiego detektora, bo dwa detektory dają dwa komunikaty na jeden problem.
- **Hooka nie było w kontekście sesji w ogóle** (żadnego bloku `[RelAI session-context]`) → dopiero
  wtedy porównujesz sam: etap `W TOKU` w `STATUS.md` kontra linia „Aktywny plan" i kontra wzmianka
  o tym planie w `STATE.md`.

Czego **nie** robisz: nie prostujesz żadnego z trzech dokumentów samodzielnie. Rozjazd nie mówi,
który zapis jest prawdą — etap mógł trwać albo urwać się w połowie, a wybór między tymi wersjami
należy do człowieka. Po jego odpowiedzi aktualizujesz wszystkie trzy w tej samej turze (D-44).

### Rotacja na starcie sesji (od 1.6.0)

Rotacja ma od 1.6.0 **drugie wejście**: start sesji. Powód jest arytmetyczny — przy zamknięciu
sesji kontekst jest już wykupiony, a przy starcie rotacja jeszcze coś oszczędza.

**Kiedy proponujesz** — gdy spełnione są **wszystkie trzy** warunki:

1. hook `session-context` wypisał raport `[RelAI budzet startu]` z przekroczeniem budżetu,
2. w raporcie jest zdanie zaczynające się od **„Zaproponuj rotacje"** (to jest sygnał, że wiersz
   `Rotacja dokumentów` w `USTAWIENIA.md` jest włączony — nie sprawdzasz tego drugi raz),
3. sesja jest **interaktywna**.

Brak któregokolwiek warunku → nie proponujesz i nie komentujesz. Cisza hooka znaczy „mieści się
w budżecie", a nie „nie sprawdzono" (L-0036).

**Jak to robi się w praktyce:** zgłaszasz budżet jednym zdaniem przed akapitem „gdzie jesteśmy”
i w tym samym zdaniu proponujesz rotację. **Po zgodzie** wykonujesz **dokładnie tę samą**
procedurę, co w kroku 2 rytuału zamknięcia (sekcja „Rotacja dokumentów" niżej) — dwie fazy, suma
kontrolna, linia-odsyłacz, ślad we wpisie dziennika tej sesji. Drugiego mechanizmu nie ma i nie
piszesz go.

**Sesja nieinteraktywna** (`claude -p`, agent w tle, hook w CI) → rotacji na starcie **nie
uruchamiasz**: zmiana w repozytorium bez człowieka przy klawiaturze jest zakazana. Poznajesz ją po
linii raportu „Sesja nieinteraktywna: to jest sam raport…". **W Claude Code tej linii dziś nie
ma** — payload `SessionStart` nie niesie zmierzonego rozróżnienia wobec `claude -p` (L-0032), więc
adapter zachowuje się jak w sesji interaktywnej. Wniosek praktyczny: propozycja padnie także
w sesji nieinteraktywnej, ale **rotacja i tak nie ruszy bez zgody**, a zgody nie ma komu udzielić.
Zakaz zamiany propozycji w automatyczne odpalenie jest tu jedynym zabezpieczeniem — nie łam go.

Zasady jak przy pozostałych siatkach: propozycja **nigdy** nie zamienia się w automatyczne
odpalenie, odmowa zamyka temat na tę sesję, a zgłoszenie idzie **przed** akapitem „gdzie jesteśmy".

### Dokument ponad własnym progiem (od 1.7.0)

Hook startu wypisuje linię `[RelAI progi dokumentow]`, gdy dokument albo sekcja przekracza
**własny** próg rotacji — niezależnie od tego, czy suma warstwy startowej mieści się w budżecie.
To **drugi wyzwalacz tego samego raportu**, nie drugi raport: linia o budżecie i linia o dokumentach
stoją osobno i nie zlewają się w jedno zdanie.

Każda wymieniona pozycja niesie **nazwę procedury**, która ją odchudza (rotacja dziennika, rotacja
lekcji, rotacja ryzyk zamkniętych, przeniesienie zwiniętych lekcji, skrócenie `STATE.md`).
Twoja robota: zgłosić to użytkownikowi **jednym zdaniem przed akapitem „gdzie jesteśmy"**
i zaproponować wymienione procedury jako pierwszy krok. Wykonujesz je **dopiero po zgodzie** i
**dokładnie** tak, jak opisuje krok 2 rytuału zamknięcia — drugiego mechanizmu nie ma.

**Czego nie robisz:** nie liczysz progów drugi raz (linia niesie zmierzone wartości), nie dokładasz
własnego komunikatu obok tej linii i nie rotujesz nic bez zgody. Linia wypisuje najwyżej trzy
pozycje, a resztę jako liczbę — to nie jest komplet do przepisania użytkownikowi. **Cisza hooka
znaczy „wszystko poniżej progu"**, a nie „nie sprawdzono" (L-0036).

### Przegląd spraw przeterminowanych (od 1.7.0)

Sprawa z sekcji „Czeka na człowieka" starsza niż **`N` dni** wymusza decyzję na starcie sesji.
`N` i wyłącznik stoją w wierszu `Przegląd spraw człowieka` w `docs/USTAWIENIA.md` (domyślnie
`włączony · 30 dni`, `SPEC_USTAWIENIA.md`). **Wyłącznik jest osobny od rotacji:** `Rotacja
dokumentów: wyłączona` nie wycisza tego przeglądu, a wyłączony przegląd nie wycisza rotacji.

**Wykrycie niesie hook `session-context`, nie ten skill** — ma działać przy każdym modelu i bez
wyzwalania czegokolwiek (L-0030, R2). Hook wypisuje blok `[RelAI przeglad spraw]` z listą spraw
przeterminowanych: treść, wiek w dniach, licznik odroczeń. **Nie liczysz tego drugi raz** i nie
robisz z rytuału drugiego detektora. Cisza hooka znaczy „nic nie jest przeterminowane" albo
„przegląd jest wyłączony", a nie „nie sprawdzono".

**Kiedy pytasz** — gdy spełnione są **wszystkie trzy** warunki:

1. hook wypisał blok `[RelAI przeglad spraw]` z listą spraw,
2. blok **nie** kończy się linią „Sesja nieinteraktywna",
3. sesja jest interaktywna.

**Jak pytasz.** Przed akapitem „gdzie jesteśmy", narzędziem `AskUserQuestion`, **partiami po
cztery sprawy**, aż do wyczerpania listy — nie jedno wielkie pytanie o wszystko i nie osobne
pytanie na każdą sprawę. Każda sprawa ma **trzy realne wybory**:

| Wybór | Co robisz w tej samej turze |
|---|---|
| **Zamknąć** | pozycja **znika** z sekcji „Czeka na człowieka", a we wpisie źródłowym dostaje `*(rozstrzygnięte RRRR-MM-DD — <treść decyzji>)*`; decyzja idzie do wpisu dziennika tej sesji |
| **Odroczyć o kolejne `N` dni** | pozycja **zostaje**, a jej adnotacja odroczenia dostaje dzisiejszą datę i licznik podniesiony o jeden (`SPEC_DZIENNIK.md`) |
| **Rozstrzygnąć teraz** | wykonujesz to, co człowiek rozstrzygnął, i dopiero potem zamykasz pozycję jak wyżej |

**Trzecie i każde kolejne odroczenie** — w treści pytania podajesz wprost liczbę dni od pierwszego
wystąpienia i liczbę wcześniejszych odroczeń. Odroczenia **nie odmawiasz**: decyzja należy do
człowieka, zmienia się komunikat, nie prawo do odpowiedzi.

Zasady jak przy pozostałych siatkach: pytanie **nigdy** nie zamienia się w rozstrzygnięcie za
człowieka — sprawy nie zamykasz „bo widać, że nieaktualna" (L-0025). Odmowa odpowiedzi zamyka temat
na tę sesję. Sesja nieinteraktywna: **nie pytasz o nic**, raport hooka jest całością.

### Propozycja wycieczki po cudzym projekcie (D-27)

Drugi krok kontrolny rytuału startu, wykonywany po przeczytaniu dziennika. Sprawdź, czy **którykolwiek**
podpis pod wpisami (`Autor: RelAI (<model>) + <użytkownik>`) zawiera nazwę bieżącego użytkownika
z `git config user.name`.

- **Zawiera** albo dziennik nie ma jeszcze ani jednego podpisu → nic nie mówisz.
- **Nie zawiera żadnego** → to cudzy projekt. Powiedz **jednym zdaniem**, że wpisy w dzienniku
  podpisał kto inny, i zaproponuj wycieczkę: stan, mapa dokumentów, aktywne plany, ryzyka, od czego
  zacząć. **Czekasz na zgodę** — po niej wykonujesz procedurę komendy `/relai-tour`.
- Gita nie ma albo `user.name` nie jest ustawione → milczysz. Nie da się rozstrzygnąć, kto pracuje.

Zasady jak przy siatce promptów etapowych: propozycja **nigdy** nie zamienia się w automatyczne
odpalenie, odmowa zamyka temat na tę sesję, a propozycja idzie **przed** akapitem „gdzie jesteśmy".

Od 0.7.0 sygnał ma **dwie warstwy**: ten krok rytuału oraz hook `session-context` (SessionStart),
który to samo porównanie wykonuje niezależnie od tego, czy skill się wyzwolił (R2). Hook już zgłosił
nieznanego autora w kontekście sesji → nie powtarzaj zgłoszenia, przejdź od razu do propozycji.
Sygnał gaśnie sam, gdy nowa osoba dopisze pierwszy wpis do dziennika.

### Podsumowanie dla użytkownika

Po przeczytaniu napisz **jeden akapit** (3–5 zdań) „gdzie jesteśmy": co działa, nad czym pracujemy,
co blokuje, jaki jest najbliższy krok. Bez list, bez tabel, bez powtarzania nazw plików. Potem
zrób to, o co użytkownik prosił.

Jeśli prompt użytkownika jest samowystarczalny i drobny (jedno pytanie o kod), podsumowanie skróć
do jednego zdania — ale rytuał czytania wykonaj mimo to.

---

## Definicja ukończenia — zachowanie, nie deklaracja (D-44)

**Zmiana funkcjonalna oznacza obowiązek aktualizacji dokumentów w tej samej turze, bez proszenia
i bez pytania o zgodę.**

Zmiana funkcjonalna to: coś zaczęło działać, coś przestało, powstał lub zniknął moduł, zmienił się
sposób uruchomienia, wystartował lub zamknął się plan, zmienił się priorytet.

W tej samej turze, w której to zrobiłeś:

1. **`docs/STATE.md`** — nadpisz to, co się zmieniło (nie dopisuj akapitu — STATE nie ma historii).
2. **`docs/DZIENNIK.md`** — dopisz wpis na **końcu** sekcji „Wpisy", wg szablonu ze
   `SPEC_DZIENNIK.md`: Zrobione / Zweryfikowane — jak dokładnie / Świadomie odłożone / Do zrobienia
   przez człowieka. Nagłówek z datą z kontekstu sesji, linia autora `RelAI (<model>) + <git config>`.
3. **`README.md`** — tylko jeśli zmienił się sposób uruchomienia, doszła zmienna w `.env` albo nowy
   dokument w `docs/`.

Czego **nie** robisz: nie pytasz „czy zaktualizować dokumenty?", nie zostawiasz tego „na koniec
sesji", nie zgłaszasz zadania jako ukończonego, dopóki tego nie zrobisz. Zadanie z działającym
kodem i nieaktualnym STATE jest **w toku**, nie skończone.

Czego to **nie** dotyczy: pytań, analiz, czytania kodu, eksperymentów bez zapisu, poprawek
literówek w komentarzu.

---

## Reguły warunkowe profilu (D-50…D-53)

Profil projektu stoi w `docs/USTAWIENIA.md` w wierszu „Profil projektu" — to jedyne miejsce, z
którego go czytasz. Cztery wartości, lista zamknięta: `app`, `agent-voice`, `flow`, `prompty`.

Profil **nie zmienia rdzenia dokumentacyjnego**. Dokłada do niego dokumenty warunkowe, które
powstają **przy zdarzeniu**, oraz zachowania pilnowane tylko w tym typie projektu. Szczegóły
i przykłady: `.claude/relai/templates/SPEC_PROFILE.md`.

**Zasada nadrzędna: warunkowe znaczy warunkowe.** Dokument warunkowy nie powstaje przy
inicjalizacji ani „na zapas" (D-10). Pusty dokument z nagłówkami i zdaniem „do uzupełnienia" jest
**zakazany**. Świeżo zainicjowany projekt `app` ma dokładnie te same osiem dokumentów co projekt
`prompty` — różnica pojawia się dopiero przy pierwszym zdarzeniu.

### Co robi który profil

| Profil | Zdarzenie | Co powstaje | Specyfikacja |
|---|---|---|---|
| `app` | pierwszy plik źródłowy | `docs/ARCHITEKTURA.md` + jedno pytanie o testy | `SPEC_ARCHITEKTURA.md` |
| `app` | pierwszy plik interfejsu | `docs/DESIGN.md` + jedno pytanie o kierunek | `SPEC_DESIGN.md` |
| `app` | pierwsze wdrożenie środowiska | `docs/srodowiska/<NAZWA>.md` | `SPEC_SRODOWISKA.md` |
| `agent-voice`, `flow` | **przed** zmianą konfiguracji produkcyjnej | `docs/snapshoty/<data>/` | `SPEC_SNAPSHOT.md` |
| `prompty` | pierwszy artefakt | `docs/ARTEFAKTY.md` | `SPEC_PROFILE.md` |

Zdarzenie rozpoznajesz też z rozmowy, nie tylko z zapisu pliku: „wdrożyliśmy to na testowe" jest
pierwszym wdrożeniem tak samo jak pojawienie się `Dockerfile`.

### Jedno pytanie towarzyszące — jak brzmi

Profil dokłada najwyżej **jedno** pytanie na zdarzenie i tylko w profilu `app`. Nigdy w tej samej
turze co inicjalizacja: **limit trzech pytań startowych jest twardy** (D-20, D-80).

Zanim zapytasz, sprawdź `docs/USTAWIENIA.md`, potem warstwę globalną (L-0006). Odpowiedź już tam
jest → nie pytasz, tylko mówisz pół zdaniem, co przyjąłeś i skąd.

- **Testy (przy pierwszym kodzie, D-25):** trzy opcje — pełny TDD / testy krytycznych ścieżek /
  bez testów. Rekomendację (pierwsza opcja, dopisek „(Rekomendowane)") uzasadniasz jednym zdaniem
  wziętym z charakteru tego projektu, nie z ogólnej prawdy o testach. Odpowiedź → wiersz
  `Podejście do testów` w `USTAWIENIA.md`, z datą. Sekcja „Weryfikacja" w prompcie etapowym jest
  obowiązkowa **zawsze**, niezależnie od odpowiedzi.
- **Kierunek wizualny (przy pierwszym UI, D-51):** pytasz o **cechy pozytywne** — nastrój,
  skojarzenie, co użytkownik ma poczuć. Lista zakazów jest filtrem końcowym, nie briefem (L-0019).
  Odpowiedź → sekcja „Kierunek" w `DESIGN.md`, dosłownie.

### Snapshot jako bramka (`agent-voice`, `flow` — D-52)

Najpierw kopia, potem zmiana. To jedyna reguła profilu, która **zatrzymuje** operację, a nie
ostrzega — pilnuje jej hook `config-protection`, więc zadziała także wtedy, gdy ten skill się nie
wyzwolił.

Twoja część procedury, gdy zmieniasz konfigurację produkcyjną (eksport workflow, konfiguracja
agenta, baza wiedzy):

1. Skopiuj plik sprzed zmiany do `docs/snapshoty/<RRRR-MM-DD>/` pod nazwą
   `<nazwa>__przed-<co-zmieniamy>.<rozszerzenie>` — **bajt w bajt**, bez przeformatowania.
2. Dopisz `OPIS.md` w tym katalogu: co zmieniamy, dlaczego, który plik jest stanem sprzed zmiany.
3. Dopiero teraz zmieniaj — **skryptem migracyjnym z asercjami**, nie ręczną edycją JSON-a.
   Asercje przed zmianą (element istnieje i wygląda jak zakładasz) i po niej (zmiana weszła, nic
   poza nią się nie ruszyło, wynik daje się wczytać). Asercja, która nie przeszła, przerywa skrypt
   bez zapisu.
4. Wpis w dzienniku mówi, który snapshot jest stanem sprzed i co sprawdziły asercje.

Baza wiedzy profilu `agent-voice` ma dwie własne zasady: **numeracja sekcji jest nietykalna**
(numer to identyfikator routingu — sekcję wycofaną oznaczasz, numer zostaje, nowa bierze kolejny
wolny) oraz **split PL treść / EN routing** (treść w języku rozmowy, nazwy sekcji i tagi routingu
po angielsku).

### Reguły profilu w `CLAUDE.md` projektu

Przy inicjalizacji `CLAUDE.md` dostaje sekcję `## Reguły profilu (<nazwa>)` zaraz po „Regułach
procesu": 3–6 punktów w trybie rozkazującym, bez odsyłaczy do plików spoza projektu (L-0012).
Gotowe brzmienie dla każdego z czterech profili jest w `SPEC_PROFILE.md`, sekcja „Przykład".

To jest **warstwa nośna reguły**: `CLAUDE.md` siedzi w kontekście każdej sesji, więc reguła działa
bez wyzwalania czegokolwiek. Hook wykrywa zdarzenie, ten skill niesie procedurę, a `CLAUDE.md` —
samą regułę. Gdy hook zgłosił już zdarzenie w kontekście, nie powtarzaj zgłoszenia — od razu rób
to, co reguła nakazuje.

### Zmiana profilu

Wyłącznie na prośbę człowieka: nowy wiersz w `USTAWIENIA.md` (stary do „Ustawień wycofanych"),
podmiana sekcji w `CLAUDE.md`. **Dokumentów starego profilu nie kasujesz** — ten, który stracił
sens, dostaje adnotację „NIEAKTUALNE" i idzie do `docs/archiwum/` (D-18).

---

## Rejestry w projekcie po adopcji (D-15, od 1.3.0)

Projekt, który przeszedł przez `/relai-adopt`, ma w `CLAUDE.md` sekcję **„Zasady projektu
(odziedziczone)"** — dosłowną kopię zastanych reguł, często razem z ich własną tabelą decyzji.
Ta sekcja jest **zapisem stanu sprzed adopcji**: czytasz ją i respektujesz, ale **nie dopisujesz
do niej niczego nowego**.

Każde rozstrzygnięcie podjęte **po** adopcji idzie tam, gdzie idzie w każdym innym projekcie
RelAI: wpis `D-NN` w `docs/DECYZJE.md`, wg `SPEC_DECYZJE.md`. Dotyczy to także decyzji, która
tematycznie pasuje do odziedziczonej tabeli — pasowanie tematu nie jest powodem, żeby rosła
warstwa czytana w każdej sesji.

Powód jest mierzalny: JiraManager po adopcji ma `CLAUDE.md` na 639 linii przy limicie 60, bo osiem
decyzji podjętych po adopcji dopisało się do zastanej tabeli zamiast do pustego `DECYZJE.md`
(retrospektywa 2026-08-12, `FAKT`). `CLAUDE.md` płaci tokenami przy każdym prompcie, `DECYZJE.md`
czyta się wtedy, gdy temat tego wymaga.

Wyjątek jest jeden i wymaga zgody człowieka: reguła, która ma działać **zawsze** (bo bez niej
sesja zrobi szkodę), trafia do „Reguł procesu" `CLAUDE.md` — tak jak każda graduacja lekcji.
Nie do sekcji odziedziczonej.

## Reakcja na korektę użytkownika

Użytkownik poprawił sposób, w jaki coś zrobiłeś — nie treść zadania, tylko Twoje zachowanie.

1. **Zapisz lekcję bez pytania.** Wpis `L-NNNN` na końcu sekcji „Lekcje" w `docs/LEKCJE.md`, format
   wg `SPEC_LEKCJE.md` (trigger / przyczyna / zasada / źródło). Potwierdź jedną linią: „Zapisane
   jako L-0007.". Nie pytaj o zgodę, nie przepraszaj, nie rozwijaj tematu.
2. **Zaktualizuj „Zasady aktywne"**, jeśli lekcja wnosi zasadę, której tam jeszcze nie ma.
3. **Sprawdź powtórzenie.** Jeśli ta sama sprawa była już zapisana — zamiast bliźniaczego wpisu
   dopisz lekcję z adnotacją „powtórzenie L-XXXX" i **zaproponuj graduację** do `CLAUDE.md` jednym
   zdaniem. Dopisujesz tam dopiero po zgodzie człowieka.
4. **Sprawdź powracający temat.** Jeśli wraca rozstrzygnięcie merytoryczne (nie zachowanie),
   zaproponuj zamrożenie decyzji `D-NN` wg `SPEC_DECYZJE.md`. Zatwierdza człowiek.
5. **Frazy zamykające temat** („nie rób tego więcej", „ustalmy raz na zawsze", „koniec dyskusji
   o X") zapisujesz **bez pytania**: sposób pracy → `LEKCJE.md`, rozstrzygnięcie w projekcie →
   `DECYZJE.md`. Gdy zakres frazy jest niejasny, zapytaj o zakres — nie o to, czy zapisać.

---

## Wyprowadzenie spraw czekających na człowieka (jednorazowo, od 1.6.0)

Do 1.5.2 sprawy człowieka mieszkały w sekcjach „Do zrobienia przez człowieka" pojedynczych wpisów.
Skutek był odwrotny do zamierzonego: sprawa sprzed czterech miesięcy była niewidoczna dla sesji,
a jej wpis blokował rotację całego dziennika, bo zakres rotacji jest ciągły od najstarszej pozycji.
Od 1.6.0 sprawy mają jeden dom — sekcję **„Czeka na człowieka"** na górze dziennika
(`SPEC_DZIENNIK.md`).

Projekt, który tej sekcji jeszcze nie ma, przechodzi **jednorazową** procedurę. Wykonujesz ją na
prośbę użytkownika albo po jego zgodzie, gdy zauważysz brak sekcji w projekcie z wersją 1.6.0 lub
nowszą. Nigdy „przy okazji" rotacji.

**Krok 1 — inwentarz.** Przejrzyj **wszystkie** wpisy dziennika, także te już zarchiwizowane
(`docs/archiwum/dziennik/`), i wypisz każdą **otwartą** pozycję sekcji „Do zrobienia przez
człowieka". Otwarta znaczy: bez adnotacji rozstrzygnięcia z zamkniętej listy brzmień
(`SPEC_ARCHIWUM.md`). Liczenie robisz **skryptem**, nie okiem — plik ma zwykle setki linii.

**Krok 2 — deduplikacja do spraw.** Jednostką sekcji jest **sprawa**, nie linia. Ta sama sprawa
powtórzona w ośmiu wpisach („pozostałe bez zmian: …") to jedna pozycja. Wypisz listę spraw
z przypisaniem, które linie źródłowe do której sprawy należą — ta lista jest **materiałem
dowodowym**, idzie do wpisu dziennika tej sesji.

**Krok 3 — rozstrzygnięcia, które już zapadły.** Sprawa, której rozstrzygnięcie **jest faktem
w repozytorium** (etap zamknięty, decyzja w `DECYZJE.md`, lekcja w rejestrze), nie jest otwarta:
dostaje we wpisie adnotację `*(rozstrzygnięte RRRR-MM-DD — <dowód>)*` i **nie wchodzi** do sekcji.
Zapisujesz przy każdej, **co** jest dowodem. Rozstrzygnięcia, które **nie** są faktem, tylko Twoim
domysłem, nie robisz — pytasz człowieka (L-0025).

**Krok 4 — sekcja.** Załóż „Czeka na człowieka" tuż pod „Stanem otwartych ryzyk" i wpisz sprawy
otwarte w formacie ze specyfikacji: treść · data pierwszego wystąpienia · link do **najnowszego**
wystąpienia sprawy (od 1.7.0 — link do najstarszego zatykał rotację z definicji, bo zakres jest
ciągły od najstarszej pozycji; data przy pozycji nadal jest datą **pierwszego** wystąpienia). **Pozycja bez daty** (wpis po adopcji, nagłówek bez daty) dostaje datę
**wyprowadzenia** i jawny dopisek `(data pierwotna nieznana)` — nie zgadujesz jej i nie pomijasz
pozycji.

**Krok 5 — adnotacje w źródłach.** Każda linia źródłowa — także powtórzona i także ta w archiwum —
dostaje w miejscu `*(wyprowadzone RRRR-MM-DD → sekcja „Czeka na człowieka")*`. Brzmienie jest
zamknięte i czytane maszynowo (L-0035).

**Krok 6 — liczenie przed i po, skryptem, na obu stanach pliku.** Trzy liczby do wpisu dziennika:

| Miara | Przed | Po |
|---|---|---|
| otwarte linie źródłowe (bez adnotacji) | N | **0** |
| sprawy otwarte (po deduplikacji) | M | **M** — tyle samo pozycji w sekcji |
| sprawy rozstrzygnięte w tej turze | — | K, każda z dowodem |

**Liczby muszą się zgadzać: `M` przed = `M` po, a `N` po = 0.** Rozjazd znaczy, że sprawa zginęła
w przenosinach — wtedy **STOP** i pytanie do człowieka, nie „pewnie tak miało być".

**Czego nie robisz:** nie kasujesz linii źródłowych (D-18), nie streszczasz treści pozycji, nie
wpisujesz do sekcji rzeczy, które agent może zrobić sam, i nie rotujesz w tej samej turze —
rotacja czyta wynik wyprowadzenia, więc idzie po nim, nie razem z nim.

---

## Zamknięcie sesji

Rytuał zamknięcia wykonujesz, gdy użytkownik powie, że kończycie (patrz „Frazy naturalne"), albo
gdy sam kończysz większą porcję pracy. Kolejność:

1. **Sync dokumentów** — przejrzyj, co się w tej sesji zmieniło, i domknij: `STATE.md`,
   `USTAWIENIA.md` (jeśli padły nowe preferencje), `LEKCJE.md` / `DECYZJE.md` (jeśli coś zostało
   niezapisane), `README.md` (jeśli zmienił się sposób uruchomienia). Tu też **policz pozycje
   sekcji „Zasady aktywne"** — sekcja niżej.
2. **Rotacja dokumentów** (od 1.2.0) — sekcja niżej. Wykonujesz ją **przed** wpisem do dziennika,
   żeby wpis tej sesji opisał rotację i wylądował już w przyciętym pliku.
3. **Wpis do dziennika** — jeden wpis zbiorczy za sesję, na końcu sekcji „Wpisy". Sekcja
   „Zweryfikowane — jak dokładnie" musi mówić, czym i z jakim wynikiem sprawdzałeś; „nie
   weryfikowano" jest dopuszczalną treścią, brak sekcji nie jest.
4. **Ryzyka** — zaktualizuj tabelę „Stan otwartych ryzyk", jeśli któreś zamknięto, otwarto albo
   zmienił się jego poziom.
5. **Commit** — jeśli projekt ma gita i są niezacommitowane zmiany, zaproponuj commit
   z conventional message. Nie commituj bez zgody, poza commitem inicjalizacyjnym.
6. **Podsumowanie** — 3–5 zdań: co zrobione, co zweryfikowane, co czeka na człowieka, od czego
   zacząć następnym razem. Bez list zadań i bez obietnic terminów.

### Limit „Zasad aktywnych" — jedyny adres egzekwowania (krok 1, od 1.6.0)

Sekcja „Zasady aktywne" w `LEKCJE.md` ma twardy limit **15 pozycji** (`SPEC_LEKCJE.md`). Reguła
istniała od 0.2.0 i była łamana wszędzie, bo **nikt jej nie mierzył**: 46 pozycji tutaj, 930 linii
w projekcie po adopcji `FAKT` (2026-08-20). Ten krok jest jej **jedynym** adresem egzekwowania.

W kroku 1 rytuału zamknięcia policz pozycje **komendą, nie okiem** — sekcja bywa długa:

```
node -e "const s=require('fs').readFileSync('docs/LEKCJE.md','utf8').split(/^## /m).find(x=>/^Zasady aktywne|^Active rules/.test(x));console.log((s.match(/^\d+\.\s/gm)||[]).length)"
```

Wynik **powyżej limitu** → **jedno** zdanie w podsumowaniu sesji: ile pozycji, jaki limit i co z tym
zrobić (kompresja tematyczna albo graduacja do `CLAUDE.md` — obie za zgodą człowieka,
`SPEC_LEKCJE.md`). Wynik **w limicie** → **cisza**, ani jednego znaku.

**Drugiego adresu nie dokładasz** (L-0036, L-0049). W szczególności **nie** wchodzi to do raportu
budżetu startu sesji: raport odzywa się wyłącznie przy przekroczeniu **sumy** warstwy startowej,
więc projekt z 46 pozycjami mieszczący się w budżecie nie usłyszałby o limicie ani razu — a to jest
dokładnie ten przypadek, dla którego ten krok powstał. Jeden problem, jeden komunikat.

### Rotacja dokumentów (krok 2 rytuału zamknięcia, od 1.2.0)

Żywe dokumenty rosną, a każda sesja czyta je od nowa. Rotacja przenosi najstarszą historię do
`docs/archiwum/`, **bajt w bajt**, i zostawia po niej linię-odsyłacz. Dzieje się sama i **nie
pyta o zgodę** — bo niczego nie kasuje ani nie streszcza. Pełna specyfikacja:
`SPEC_ARCHIWUM.md` (czytasz ją z `.claude/relai/templates/` **przed** rotacją, nie z pamięci);
poniżej jest to, co obowiązuje zawsze.

**Warunek — wiersz `Rotacja dokumentów` w `docs/USTAWIENIA.md`.** Kotwica na początku komórki
`Decyzja`: `wyłączona` (EN `off`) → **kończysz ten krok natychmiast**, bez sprawdzania progów
i bez słowa. Wartość nierozpoznana albo brak wiersza w projekcie z wersją 1.2.0 lub nowszą → traktujesz jak
`wyłączona` i mówisz o tym jednym zdaniem. Progi domyślne, gdy wiersz ich nie podaje:

| Dokument | Próg | Działanie po przekroczeniu |
|---|---|---|
| `docs/DZIENNIK.md` | 150 KB | najstarsze wpisy → `docs/archiwum/dziennik/DZIENNIK_<data-od>_<data-do>.md` |
| `docs/LEKCJE.md` | 40 lekcji albo 50 KB | najstarsze pełne lekcje → `docs/archiwum/lekcje/LEKCJE_<numer-od>_<numer-do>.md` |
| sekcja „Stan otwartych ryzyk" | próg cząstkowy `ryzyka` z wiersza `Budżet startu sesji` (12 KB) | wiersze ryzyk `ZAMKNIĘTE` → `docs/archiwum/ryzyka/RYZYKA_<data>.md` |
| komórka „Mitygacja" ryzyka `ZMITYGOWANE` / `PRZYJĘTE ŚWIADOMIE` | 800 znaków, przy sekcji ryzyk ponad progiem | historia komórki → `docs/archiwum/ryzyka/MITYGACJE_<data>.md`; **wiersz zostaje w tabeli** |
| `docs/USTAWIENIA.md` | próg cząstkowy `ustawienia` z wiersza `Budżet startu sesji` (6 KB) | wiersze sekcji „Ustawienia wycofane" → `docs/archiwum/ustawienia/USTAWIENIA_<data>.md` |
| `docs/STATE.md` | 300 linii | **bez archiwum** — przepisujesz zwięźlej w kroku 1; fakt, który znika, a nie stoi nigdzie indziej, idzie do wpisu dziennika |

**Poniżej progu: cisza.** Zero komunikatów, zero pytań, katalog `docs/archiwum/dziennik/` nie
powstaje. Rotacja nie przypomina o swoim istnieniu.

**Czego nie ruszasz nigdy:** sekcji „Czeka na człowieka" w dzienniku, sekcji „Zasady aktywne"
w lekcjach, dziesięciu najnowszych wpisów ani dwudziestu najnowszych lekcji. Zakres jest ciągły:
pierwsza pozycja nietykalna kończy zakres, nie przeskakujesz jej. **Najstarsza i najnowsza pozycja
to daty w nagłówkach, nie miejsca w pliku** — kolejność wpisów jest własnością projektu i mechanizm
ją czyta, a nie narzuca (`SPEC_DZIENNIK.md`).

**Ryzyka (od 1.6.0) są jedynym wyjątkiem od ciągłości.** Sekcja „Stan otwartych ryzyk" nie jest
wpisem i do archiwum dziennika nie trafia nigdy — ma własny przebieg: schodzą z niej **wiersze
ryzyk `ZAMKNIĘTE`**, wszystkie naraz, bez względu na kolejność numerów. Bierzesz się za nie tylko
wtedy, gdy pozycja `ryzyka` przekracza swój próg cząstkowy **i** jest choć jedno ryzyko zamknięte;
status inny niż `ZAMKNIĘTE` (`ZMITYGOWANE`, `PRZYJĘTE ŚWIADOMIE`, `ZAWĘŻONE`) znaczy „zostaje"
i nie zgadujesz intencji. Nagłówek sekcji i wiersz nagłówkowy tabeli zostają zawsze, a pod tabelą
staje **jedna** linia-odsyłacz z numerami — po niej widać, że numer jest zajęty na zawsze.
To **nie jest** trzeci komunikat: rotacja ryzyk melduje się tylko we wpisie dziennika tej sesji,
tak jak pozostałe (L-0049).

**Kompresja komórki „Mitygacja" (od 1.7.0) — wiersz zostaje, historia schodzi.** Gdy sekcja ryzyk
jest ponad swoim progiem, komórka „Mitygacja" ma **ponad 800 znaków**, a status ryzyka niesie
rdzeń `zmitygowan` albo `przyj`/`zaakceptowan` **razem z** `świadom` — cała dzisiejsza treść
komórki idzie do `docs/archiwum/ryzyka/MITYGACJE_<data>.md` (tabela `| # | Mitygacja |`), a w żywej
komórce zostają **dwa człony**: **dosłowny cytat ostatniego zdania** sprzed `Zmierzone:` oraz
`Historia: [MITYGACJE_…](…)` i niezmieniony człon `Zmierzone:`. Trzy warunki są koniunkcją;
**wiek komórki warunkiem nie jest**. Zdanie napisane od siebie zamiast cytatu jest defektem.
Ryzyka `OTWARTE` nie ruszasz — jego komórka niesie powód, dla którego nie jest zamknięte.
Komórka po kompresji nadal ponad 800 znaków → **STOP** i pytanie do człowieka, żywa tabela
nietknięta. Pełna procedura: `SPEC_DZIENNIK.md`, sekcja „Kompresja komórki »Mitygacja«".

**Rotacja ustawień (od 1.7.0).** Gdy `docs/USTAWIENIA.md` przekracza swój próg cząstkowy
(`ustawienia`, 6 KB) **i** sekcja „Ustawienia wycofane" ma wiersze do wzięcia — schodzą **wszystkie
naraz** do `docs/archiwum/ustawienia/USTAWIENIA_<data>.md`, a pod tabelą sekcji staje jedna
linia-odsyłacz. **Nigdy nie schodzi pięć wierszy wypisanych z nazwy:** `Język projektu`,
`Profil projektu`, `Rotacja dokumentów`, `Budżet startu sesji`, `Przegląd spraw człowieka` — także
gdy stoją w „Ustawieniach wycofanych"; ich nieobecność wycisza mechanizmy, które je czytają.
Wierszy **żywej** tabeli nie ruszasz: niosą decyzję obowiązującą. Plik ponad progiem bez sekcji
„Ustawienia wycofane" → nie rotujesz; odchudza go zwięzłość komórki `Decyzja`.

Obie operacje idą **tą samą** procedurą dwufazową, każda z własną sumą kontrolną i własnym plikiem
archiwum, i **żadna nie dokłada własnego komunikatu** — meldują się we wpisie dziennika tej sesji,
jak rotacja ryzyk (L-0049).

**Blokada zmieniła adres w 1.6.0, a w 1.7.0 zniknęła.** Wpis z pozycją opatrzoną adnotacją
`*(wyprowadzone RRRR-MM-DD → sekcja „Czeka na człowieka")*` **jest przenoszalny**, mimo że jego
własna sekcja „Do zrobienia przez człowieka" wygląda na otwartą. **Wpis, do którego prowadzi link
z otwartej pozycji „Czeka na człowieka", też jest przenoszalny** — od 1.7.0 nie jest z tego powodu
nietykalny; zamiast blokady działa **przepięcie linku** na plik archiwum (opis w fazie 2 niżej).
Powód jest zmierzony: reguła linkowania do najstarszego wystąpienia w mechanizmie idącym od
najstarszego zatykała go z definicji — na dzienniku PolyFlow sprzed rotacji `FAKT` zakres wynosił
0 wpisów ze 127, a bez tej blokady wynosi 117. Projekt, który nie ma jeszcze sekcji „Czeka na
człowieka", działa po staremu — blokuje własna sekcja wpisu, dopóki nie przejdzie procedury
wyprowadzenia (sekcja wyżej).

**Przebieg jest dwufazowy** i kolejność jest tu całym zabezpieczeniem:

1. **Faza 1 — kopia i dowód.** Wyznacz ciągły zakres najstarszych pozycji (tyle, żeby żywy plik
   zszedł poniżej 60% progu). Policz sumę kontrolną tego fragmentu w żywym pliku. Zapisz plik
   archiwum. Odczytaj go **z dysku**, policz sumę treści spod separatora i porównaj. Suma:
   SHA-256 z treści znormalizowanej do LF (L-0033), pierwsze 16 znaków hex.
2. **Sumy różne → STOP.** Żywy plik zostaje nietknięty, mówisz o tym jednym zdaniem. Niczego nie
   naprawiasz po cichu.
3. **Faza 2 — przycięcie**, dopiero po zgodności sum: usuń fragment z żywego pliku, wstaw
   linię-odsyłacz na początku sekcji („Wpisy" / „Lekcje"), **przepnij linki pozycji „Czeka na
   człowieka" prowadzące do przeniesionych wpisów** (przed kotwicą staje ścieżka pliku archiwum;
   tekst linku, treść pozycji i data zostają nietknięte), zapisz. Przepięcie dotyczy wyłącznie
   rotacji dziennika i idzie **przed** zapisem. Policz przy tym pozycje z linkiem do nieistniejącej
   kotwicy — ma ich być **zero**.
4. **Ślad w dzienniku** — do wpisu tej sesji (krok 3 rytuału): co przeniesiono, dokąd, ile
   pozycji, suma kontrolna, rozmiar przed i po, ile linków przepięto.

**Próg liczony ponad nietykalnymi (od 1.7.0).** Dokument ma trzy wagi i podajesz je **zawsze razem
z progiem**, w tej kolejności: **waga całkowita** (cały plik, końce linii do LF) = **część
rotowalna** + **dolna granica osiągalna**. Dolna granica dziennika to sekcje, które nie rotują
nigdy („Stan otwartych ryzyk", „Czeka na człowieka", nagłówki, linie-odsyłacze), dziesięć
najnowszych wpisów i wpisy bez daty w nagłówku. **Wyzwalacz zostaje na wadze całkowitej** — poniżej
progu cisza. **Cel przenosi się na część rotowalną**: bierzesz najstarsze pozycje, aż **ona**
zejdzie poniżej 60% progu, bo cel postawiony na całym pliku bywa nieosiągalny z definicji.

**Powyżej progu, gdy rotacja nie zabrała wszystkiego, co mogła → komunikat zablokowanej rotacji**
w podsumowaniu sesji. Cztery części, zawsze w tej kolejności:

1. ile wpisów przechodzi z ilu rotowalnych, ile nie przechodzi i ile ważą;
2. cztery liczby: waga całkowita = część rotowalna + dolna granica; obok próg;
3. powód i pary **„pozycja → wpis"** — treść pozycji, nagłówek blokowanego wpisu, **wiek pozycji
   w dniach** i **ile wpisów przepuści jej zamknięcie**; najwyżej **pięć** blokerów po **dwie**
   pozycje, reszta jako „i N dalszych blokerów tej samej natury";
4. ile odblokowuje zamknięcie pierwszej pozycji, a ile zamknięcie wszystkich.

Pary wypisujesz **tylko** w projekcie **bez** sekcji „Czeka na człowieka" — tam blokuje własna
sekcja wpisu. Wpisu linkowanego z otwartej pozycji „Czeka na człowieka" **nie wymieniasz**: od
1.7.0 nie blokuje. Gdy blokerów nie ma, a **część rotowalna jest pusta** (mniej niż dziesięć
wpisów albo same świeże) — ten sam kształt bez punktu 3, ze zdaniem, że plik odchudza zwięzłość
wpisów, nie archiwum, a podniesienie progu jest decyzją człowieka. Tak samo, gdy sama **dolna
granica przekracza próg**: to nie jest porażka mechanizmu i nie nazywasz jej porażką.

Cisza obowiązuje **poniżej progu** i jest nienaruszalna; powyżej progu milczenie ukryłoby zatkany
mechanizm. Komunikat piszesz **ty**, w rytuale zamknięcia — hook startu go nie produkuje. To nadal
**jeden** komunikat: rotacja ryzyk nie dokłada własnego, a limit „Zasad aktywnych" zostaje przy
swoim adresie w kroku 1 (L-0036, L-0049).

**To jest krok 2 rytuału zamknięcia, czyli wejście pierwsze.** Wejście drugie — start sesji — jest
w sekcji „Rotacja na starcie sesji (od 1.6.0)" wyżej i uruchamia **dokładnie tę samą** procedurę.

---

## Frazy naturalne (D-05)

Trzy frazy działają w tej wersji, w wariancie polskim i angielskim. Rozpoznajesz **intencję**, nie
dosłowne brzmienie: „kończymy", „na dziś wystarczy", „that's it for today" to ta sama fraza.

### „kończymy na dziś" / „wrapping up"

Wykonaj **rytuał zamknięcia sesji** (sekcja wyżej), punkty 1–6, w tej kolejności. Nie pytaj, czy na
pewno — użytkownik już powiedział. Jedyne pytanie, jakie może paść, to zgoda na commit; rotacja
dokumentów (punkt 2) o zgodę nie pyta i poniżej progu nie zostawia śladu.

### „kontynuujemy pracę" / „let's continue"

1. Wykonaj **rytuał startu sesji** (kolejność czytania jak wyżej), nawet jeśli sesja trwa już
   jakiś czas — użytkownik prosi o odtworzenie kontekstu.
2. Napisz akapit „gdzie jesteśmy".
3. Dodaj **jedno zdanie z propozycją najbliższego kroku** wziętą z `STATE.md` („Nad czym pracujemy
   teraz") albo z aktywnego planu — i zapytaj, czy zaczynamy od tego.

### „sprawdź status" / „status check"

Zwięzły raport, bez wykonywania pracy. Kolejno:

1. **Stan** — dwa zdania z `STATE.md`.
2. **Plany** — aktywny plan, etap zrealizowany ostatnio, etap następny (z `STATUS.md` planu).
   Brak planu → jedno zdanie, że aktywnego planu nie ma.
3. **Ryzyka** — otwarte pozycje z tabeli dziennika, każde w jednej linii.
4. **Zaległości dokumentacyjne** — czy `STATE.md` jest starszy niż ostatni wpis dziennika, czy są
   niezacommitowane zmiany, czy „Do zrobienia przez człowieka" z ostatnich wpisów zostało
   rozstrzygnięte.
5. Zakończ pytaniem o najbliższy krok — jednym zdaniem.

Wszystkie trzy frazy są opisane w wygenerowanym `docs/KOMENDY.md`. Fraz, których nie ma na tej
liście, nie obsługujesz i nie zapowiadasz.

---

## Warstwa ustawień globalnych (D-23)

Preferencje dzielą się na dwie warstwy:

| Warstwa | Plik | Co tam trafia |
|---|---|---|
| Globalna (użytkownik) | `~/.claude/relai/USTAWIENIA.md` (lub `SETTINGS.md`) | preferencje niezależne od projektu: język pracy, format planów, model wykonawczy etapów, lokalizacja backupów, kierunek designu |
| Projektowa | `docs/USTAWIENIA.md` | wszystko powyższe **plus** rzeczy z natury projektowe: git remote, profil projektu, podejście do testów |

**Pierwszeństwo ma zawsze wpis projektowy.** Wartość globalna jest domyślną odpowiedzią, nie
nakazem — jeśli projekt mówi inaczej, obowiązuje projekt.

Zasady:

- **Odczyt:** przed każdym pytaniem o preferencję sprawdź najpierw `docs/USTAWIENIA.md`, potem
  plik globalny. Znalazłeś odpowiedź → **nie pytaj**, użyj jej i wspomnij o tym pół zdaniem
  („zgodnie z Twoim ustawieniem globalnym — polski").
- **Utworzenie:** plik globalny powstaje przy **pierwszej inicjalizacji projektu RelAI na tej
  maszynie**, zaraz po paczce trzech pytań. Trafiają do niego wyłącznie odpowiedzi
  ponadprojektowe (w paczce startowej: język). Nie zadajesz z tego powodu czwartego pytania —
  limit trzech jest twardy (D-80).
- **Poinformowanie:** w podsumowaniu inicjalizacji jedno zdanie, że preferencja została zapamiętana
  globalnie i odziedziczą ją kolejne projekty, a zmienić ją można w każdej chwili.
- **Dziedziczenie:** przy inicjalizacji kolejnego projektu wartości globalne stają się **pierwszą
  opcją z dopiskiem „(Rekomendowane)"** w paczce pytań. Użytkownik może je nadpisać — wtedy nowa
  wartość idzie wyłącznie do pliku projektowego, plik globalny zostaje bez zmian.
- **Format:** identyczny jak projektowy (`SPEC_USTAWIENIA.md`): nagłówek, tabela
  `Data | Czego dotyczy | Decyzja`. Plik globalny **nie zawiera** linii `Wersja RelAI:` — marker
  wersji jest cechą projektu, nie użytkownika.
- **Zakaz:** żadnych sekretów, ścieżek z danymi logowania ani niczego, co dotyczy jednego projektu.

---

## Stan PUSTY — zgoda, trzy pytania, generacja

### 1. Zgoda (D-20)

Zapytaj **zwykłym tekstem**, krótko: czym jest RelAI (framework dokumentacyjno-procesowy: projekt
pamięta ustalenia, decyzje i stan między sesjami), co konkretnie powstanie (`CLAUDE.md`, `README.md`
i `docs/` z sześcioma dokumentami) i że nic poza tym nie zostanie utworzone. Poproś o zgodę.

- **Zgoda** → punkt 2.
- **Odmowa** → utwórz `.claude/relai.json` o treści `{"mode":"guest"}`, potwierdź jednym zdaniem
  („Tryb gościa — nie wrócę do tego tematu w tym folderze; wystarczy powiedzieć »dodaj RelAI«,
  gdy zmienisz zdanie") i zamknij temat. Żadnych plików poza markerem.

### 2. Paczka dokładnie trzech pytań (D-20)

Jedno wywołanie **AskUserQuestion**, trzy pytania naraz. Wykryte wartości (a dla preferencji
ponadprojektowych — wartości z ustawień globalnych) idą jako **pierwsza opcja z dopiskiem
„(Rekomendowane)"**. Nie dokładaj czwartego pytania — limit jest twardy (D-80).

| Pytanie | Skąd default | Opcje |
|---|---|---|
| Język projektu | ustawienia globalne → język promptów użytkownika → język systemu | wykryty (Rekomendowane) / polski / English |
| Git | stan folderu (`.git/` obecne?) | repo lokalne + propozycja GitHub (Rekomendowane) / tylko lokalnie / bez gita |
| Profil projektu | auto-detekcja (niżej) | wykryty (Rekomendowane) + trzy pozostałe |

**Auto-detekcja profilu:**

| Sygnał w folderze | Profil |
|---|---|
| `package.json`, `pyproject.toml`, `go.mod`, `Cargo.toml`, `src/`, pliki źródłowe | `app` |
| konfiguracje agentów głosowych (ElevenLabs, Vapi, Retell), katalog bazy wiedzy (`kb/`, `knowledge/`, `baza-wiedzy/`) | `agent-voice` |
| eksporty workflow n8n / Make (JSON z tablicą `nodes` i obiektem `connections`), katalog `workflows/` | `flow` |
| wyłącznie dokumenty, prompty i szablony tekstowe | `prompty` |
| pusto — brak sygnałów | `app` jako default, ale zaznacz, że to zgadywanka |

Sygnały mogą się mieszać — wygrywa **najbardziej specyficzny**: eksport n8n przebija `package.json`,
konfiguracja agenta głosowego przebija oba. Wybrana wartość jest jedynym źródłem reguł warunkowych
(sekcja „Reguły warunkowe profilu"), więc trafia do `USTAWIENIA.md` dosłownie: `app`, `agent-voice`,
`flow` albo `prompty`.

**Git — konsekwencje do pokazania przy opcjach:**
- *repo lokalne + GitHub* — `git init` teraz, propozycja utworzenia repo zdalnego osobno (RelAI go
  nie zakłada za użytkownika).
- *tylko lokalnie* — `git init`, bez zdalnego.
- *bez gita* — dozwolone, ale powiedz wprost: znika siatka bezpieczeństwa historii zmian (D-53).

**Zawsze i bez wyjątku:** zagnieżdżone repo są zakazane (D-53). Jeśli folder nadrzędny jest już repo
gitem, nie rób `git init` — powiedz o tym i pracuj w repo nadrzędnym.

### 3. Generacja plików

Ze specyfikacji w `.claude/relai/templates/` (lokalna kopia; dostarcza ją hook `session-context`
przy wywołaniu tego skilla) wygeneruj komplet **w języku projektu** (D-60 — specyfikacje to
instrukcje dla Ciebie, nie pliki do skopiowania):

| Plik | Specyfikacja |
|---|---|
| `CLAUDE.md` | `SPEC_CLAUDE_MD.md` |
| `README.md` | `SPEC_README.md` |
| `docs/STATE.md` | `SPEC_STATE.md` |
| `docs/DZIENNIK.md` | `SPEC_DZIENNIK.md` |
| `docs/LEKCJE.md` | `SPEC_LEKCJE.md` |
| `docs/DECYZJE.md` | `SPEC_DECYZJE.md` |
| `docs/USTAWIENIA.md` | `SPEC_USTAWIENIA.md` |
| `docs/KOMENDY.md` | `SPEC_KOMENDY.md` |

Zasady generacji:

- **Nazwy plików podążają za językiem projektu** (D-12). Powyższa tabela pokazuje wariant polski.
  Dla projektu angielskiego: `docs/STATE.md`, `docs/JOURNAL.md`, `docs/LESSONS.md`,
  `docs/DECISIONS.md`, `docs/SETTINGS.md`, `docs/COMMANDS.md`. Konwencja stała: CAPS_SNAKE, bez dat
  i numerów wersji w nazwie.
- `docs/USTAWIENIA.md` **musi** zawierać linię `Wersja RelAI: 1.7.0` — to marker, po którym RelAI
  rozpoznaje projekt i po którym przyszły `/relai-update` policzy różnicę wersji.
- `CLAUDE.md` **musi** zawierać sekcję `## Reguły profilu (<wybrany profil>)` zaraz po „Regułach
  procesu" — 3–6 punktów wg `SPEC_PROFILE.md`. To jedyna warstwa reguł profilu działająca bez
  wyzwolenia skilla i bez zdarzenia, więc jej brak wycisza cały profil.
- `CLAUDE.md` **musi** zawierać **linię fraz sesji** zaraz pod listą rytuału startu, wg
  `SPEC_CLAUDE_MD.md` (sekcja „Linia fraz sesji"). Z tego samego powodu co wyżej: bez niej trzy
  frazy naturalne działają tylko wtedy, gdy skill się wyzwoli — a to jest zawodne (R2).
- `CLAUDE.md` **musi** zawierać w „Regułach procesu" **regułę sygnału odchylenia**, wg
  `SPEC_CLAUDE_MD.md` (sekcja „Reguła sygnału odchylenia"): wątek spoza zakresu etapu → zatrzymaj
  się i zapytaj — odnoga (`/relai-branch`), aneks do planu czy „świadomie odłożone" do dziennika;
  nigdy „przy okazji". Punkt wchodzi także do projektu, który nie ma jeszcze żadnego planu.
- **Żadnego dokumentu warunkowego przy inicjalizacji.** `ARCHITEKTURA.md`, `DESIGN.md`,
  `docs/srodowiska/`, `docs/snapshoty/` i `ARTEFAKTY.md` powstają przy zdarzeniu (D-10) — także
  wtedy, gdy profil jest już znany.
- `docs/LEKCJE.md` i `docs/DECYZJE.md` powstają **puste, ale kompletne strukturalnie**: nagłówek,
  zdanie o roli, sekcja „Zasady aktywne" (LEKCJE) z informacją, że jest jeszcze pusta, i pusta
  sekcja na wpisy. Pusty rejestr z gotową strukturą zapełnia się sam; brakujący plik nie.
- Do tabeli ustawień wpisz trzy odpowiedzi z paczki startowej, każda z dzisiejszą datą, oraz
  **czwarty wiersz `Rotacja dokumentów` z wartością `włączona`** — bez pytania o niego (limit trzech
  pytań jest twardy, D-80). Wiersz jest wyłącznikiem: użytkownik, któremu rotacja przeszkadza,
  wpisuje tam `wyłączona`.
- Zapisz ponadprojektowe odpowiedzi do warstwy globalnej (sekcja „Warstwa ustawień globalnych").
- Podfolderów `docs/plany/`, `docs/fixy/`, `docs/archiwum/`, `docs/zasoby/` **nie** twórz na zapas —
  powstają, gdy pojawia się pierwsza zawartość (D-11).
- Datę bierz z kontekstu sesji, nigdy z pamięci modelu.
- Po zapisie: gdy wybrano git, wykonaj `git init` (jeśli trzeba) i **jeden** commit
  `chore: initialize RelAI project structure`. Bez pytania o commit — to część inicjalizacji.

### 4. Podsumowanie dla użytkownika

Trzy–pięć zdań: co powstało, co robi każdy dokument, co się dzieje dalej („od teraz mówisz normalnie
— dokumenty aktualizują się w ramach pracy"), plus zdanie o zapamiętanej preferencji globalnej.
Bez ozdobników i bez listy komend, których jeszcze nie ma.

---

## Stan Z ZAWARTOŚCIĄ — cztery drogi, wybiera użytkownik

Folder ma już swoje życie. **Niczego istniejącego nie ruszasz** — ani jednego pliku, ani jednej linii.

Przedstaw dokładnie cztery możliwości i zapytaj (AskUserQuestion, jedno pytanie):

1. **Pełna adopcja (Rekomendowane)** — `/relai-adopt`: backup jako bramka, analiza kodu
   i historii, struktura wygenerowana z zastanego stanu, scalenie istniejącego `CLAUDE.md`
   z zachowaniem reguł, raport zmian z przetestowaną ścieżką pełnego cofnięcia. Po wyborze tej
   opcji wykonujesz procedurę komendy `/relai-adopt` (jej krok 0 masz już za sobą) — świadomy
   wybór użytkownika jest jawnym wywołaniem w rozumieniu D-70.
2. **Dołączenie niedestrukcyjne** — dokładasz wyłącznie brakujące pliki RelAI. Istniejące pliki
   o tych samych nazwach zostają nietknięte: nie nadpisujesz, nie scalasz, nie dopisujesz —
   wymieniasz je w podsumowaniu jako pominięte i mówisz, co RelAI by tam trzymał. Istniejący
   `CLAUDE.md` zostaje bez zmian; scalanie reguł to domena adopcji.
3. **Tryb gościa** — marker `.claude/relai.json` = `{"mode":"guest"}`, koniec tematu.
4. **Nic teraz** — użytkownik decyduje później; nie wracasz do tematu w tej sesji.

Po dołączeniu niedestrukcyjnym obowiązuje ta sama generacja co w stanie PUSTY (paczka trzech pytań
włącznie), z jedną różnicą: pliki już obecne w folderze są pomijane.

---

## Twarde zakazy tego skilla

- Nie kasujesz i nie nadpisujesz niczego, czego RelAI nie utworzył w tej sesji.
- Nie zadajesz więcej niż trzech pytań startowych. Wywiady wielopytaniowe są poza zakresem (D-80).
- Nie pytasz o zgodę na zapis lekcji ani na aktualizację STATE/DZIENNIKA — to część ukończenia
  zadania, nie osobna prośba.
- Nie dopisujesz reguł do `CLAUDE.md` i nie zamrażasz decyzji bez zgody człowieka.
- Nie zapisujesz sekretów w plikach śledzonych — klucze wyłącznie w `.env` objętym `.gitignore`
  (D-42).
- Nie tworzysz repo zagnieżdżonego w innym repo (D-53).
- Nie tworzysz dokumentu warunkowego profilu przy inicjalizacji ani „na przyszłość" (D-10).
- Nie dokładasz czwartego pytania startowego z powodu profilu — pytania profilu padają przy
  zdarzeniu, nie przy inicjalizacji (D-20, D-80).
- Nie zmieniasz produkcyjnej konfiguracji w profilu `agent-voice` / `flow` przed snapshotem (D-52).
- Nie tworzysz piątego profilu i nie łączysz czterech istniejących (D-50).
- Nie obiecujesz komend i rytuałów, których ta wersja pluginu nie ma. Lista tego, co realnie działa,
  jest w wygenerowanym `docs/KOMENDY.md`.
