---
name: relai-core
description: >
  Runs the RelAI session start ritual and keeps the project's memory current. Use it on the first
  prompt of a session in any folder: it checks whether the folder is a RelAI project
  (docs/USTAWIENIA.md contains "Wersja RelAI" / "RelAI version"), reads the project's state,
  journal, lessons and decisions when it is, and offers to set the structure up when it is not —
  without this check the session works without the project's memory, rules and open risks.
  Trigger phrases (Polish): "zacznijmy projekt", "nowy projekt", "zaczynam projekt", "zainicjuj
  projekt", "dodaj RelAI", "dołącz RelAI", "zaadoptuj projekt", "co to za projekt", "kończymy na
  dziś", "kontynuujemy pracę", "sprawdź status", "jak stoimy". English: "start project", "new
  project", "init project", "set up RelAI", "adopt this project", "wrapping up", "let's continue",
  "status check". Also covers guest mode, attach, the closing ritual with journal rotation, lessons
  after user corrections and profile rules. Plans: relai-planning.
---

# relai-core — struktura projektu, pamięć i rytuały sesji

Aktualny stan dystrybucyjny: RelAI 2.7.0. Historia zmian wersji: `history.md`.

Zakres tego skilla: **rozpoznanie stanu folderu + inicjalizacja + tryb
gościa + niedestrukcyjne dołączenie + rytuały sesji + rotacja dokumentów przy zamknięciu sesji +
siatka brakujących promptów etapowych + siatka rozjazdu stanu + rejestr decyzji po adopcji +
rejestry LEKCJE/DECYZJE + trzy frazy naturalne + warstwa ustawień globalnych + reguły warunkowe
profilu projektu + pliki lokalne i marker „zachowaj" (od 1.8.0)**. Od 0.5.0 działa też zestaw hooków (sekrety, ochrona konfiguracji, przypomnienia,
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

### Pliki doczytywane — kiedy który otworzyć

Procedury rzadkie leżą obok tego pliku, w tym samym katalogu skilla. Otwierasz plik dopiero wtedy,
gdy zachodzi jego wyzwalacz, i czytasz go w całości przed pierwszym krokiem procedury:

| Plik | Otwierasz go, gdy |
|---|---|
| `session-close.md` | użytkownik kończy sesję („kończymy na dziś", „wrapping up") albo sam domykasz większą porcję pracy |
| `document-rotation.md` | wykonujesz rotację: krok 2 rytuału zamknięcia albo rotacja zaproponowana na starcie sesji i przyjęta przez człowieka |
| `new-project.md` | Krok 0 rozpoznał stan PUSTY albo Z ZAWARTOŚCIĄ (propozycja niewyciszona) albo użytkownik prosi o RelAI w folderze bez markera |
| `profiles.md` | zachodzi zdarzenie profilu, człowiek zmienia profil albo inicjalizujesz projekt |
| `debugging.md` | coś nie działa: „nie działa", „błąd", „sypie się", „it's broken", „doesn't work", test albo komenda pada bez jasnej przyczyny |
| `done-check.md` | zaczynasz zadanie, które zmieni kod — kroki (testy projektu, przegląd diffu) wykonujesz **przed** zgłoszeniem „gotowe" |
| `first-deploy.md` | **przed** pierwszym wdrożeniem środowiska: „wdrażamy", „deploy", pierwsza konfiguracja wdrożeniowa |
| `waiting-migration.md` | dziennik projektu 1.6.0+ nie ma sekcji „Czeka na człowieka" i człowiek zgodził się ją założyć |
| `history.md` | pytanie dotyczy tego, co zmieniło się w konkretnej wersji pluginu |

Pliku nie ma obok `SKILL.md` (instalacja niepełna) → mówisz o tym jednym zdaniem i prosisz
o aktualizację pluginu; procedury nie odtwarzasz z pamięci.

---

## Krok 0 — rozpoznanie stanu folderu (zawsze pierwsze, bez pytania)

Sprawdź po kolei i po cichu — użytkownik widzi wynik, a samo sprawdzanie przechodzi bez komentarza.

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
4. **Wyciszenie globalne** (od 2.3.0) — wiersz `Propozycja RelAI poza projektem` = `nie proponuj`
   w `~/.claude/relai/USTAWIENIA.md`. Hook startu sesji mówi o nim jedną linią `[RelAI]`.
   Dotyczy **wyłącznie** stanów PUSTY i Z ZAWARTOŚCIĄ → w nich nic nie proponujesz i o nic nie
   pytasz. Stan PROJEKT RELAI działa bez zmian.

Dalej idź dokładnie jedną ścieżką.

---

## Stan GOŚĆ — nic nie proponuj

Użytkownik już raz odmówił w tym folderze (D-21). Pracuj jak zwykły Claude Code.

- Temat inicjalizacji jest zamknięty w tej sesji i w każdej następnej.
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

**Na starcie czytasz wyłącznie pliki z tabeli.** `docs/DECYZJE.md` i starsze wpisy dziennika
otwierasz dopiero wtedy, gdy temat konkretnie tego wymaga. Brakujący plik (np. `LEKCJE.md`
w projekcie sprzed 0.2.0) pomijasz po cichu — to zwykły stan starszego projektu.

### Siatka bezpieczeństwa: brakujący prompt etapowy (D-34)

Ostatni krok czytania, wykonywany **tylko wtedy**, gdy `CLAUDE.md` wskazuje aktywny plan. Sprawdź
w jego `STATUS.md`: czy etap ze statusem `GOTOWY DO STARTU` ma w kolumnie `Prompt` link do
istniejącego pliku.

- **Ma** → siatka milczy.
- **Nie ma** (kolumna pusta, `—`, albo link prowadzi do nieistniejącego pliku) → to ślad po sesji
  przerwanej w połowie rytuału „Na koniec". Powiedz o tym **jednym zdaniem** i zaproponuj
  wygenerowanie promptu. **Po zgodzie** generuje go skill `relai-planning`
  (specyfikacja: `.claude/relai/templates/SPEC_PROMPT_ETAPU.md`) i uzupełnia kolumnę `Prompt`.

Zasady siatki:

- Bez zgody **nie generujesz** — to jest zauważenie luki, nie automatyczna naprawa.
- Zauważenie idzie **przed** akapitem „gdzie jesteśmy", żeby użytkownik zobaczył je od razu.
- Odmowa zamyka temat do końca tej sesji.
- Brak aktywnego planu, plan `DO AKCEPTACJI`, brak etapu `GOTOWY DO STARTU` → siatka milczy.

Od 0.5.0 siatka ma **dwie warstwy**: ten krok rytuału oraz hook `session-context` (SessionStart),
który wstrzykuje lukę do kontekstu nawet wtedy, gdy skill się nie wyzwolił. Hook już zgłosił
lukę w kontekście sesji → przechodzisz od razu do propozycji dogenerowania; jego zgłoszenie wystarcza.

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
  prawdziwy. **Zgłoszenie hooka jest jedynym zgłoszeniem**, a jego porównanie — rozstrzygające.
- **Hook milczy** → milczysz też. Cisza hooka znaczy „sprawdzone i zgodne"; rytuał zostaje przy
  czytaniu, bo dwa detektory dają dwa komunikaty na jeden problem.
- **Hooka nie było w kontekście sesji w ogóle** (żadnego bloku `[RelAI session-context]`) → dopiero
  wtedy porównujesz sam: etap `W TOKU` w `STATUS.md` kontra linia „Aktywny plan" i kontra wzmianka
  o tym planie w `STATE.md`.

Trzy dokumenty prostujesz dopiero po odpowiedzi człowieka. Rozjazd nie mówi,
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

Brak któregokolwiek warunku → milczysz. Cisza hooka znaczy „sprawdzone i mieści się w budżecie"
(L-0036).

**Jak to robi się w praktyce:** zgłaszasz budżet jednym zdaniem przed akapitem „gdzie jesteśmy”
i w tym samym zdaniu proponujesz rotację. **Po zgodzie** wykonujesz **dokładnie tę samą**
procedurę, co w kroku 2 rytuału zamknięcia — **otwórz `document-rotation.md`** — dwie fazy, suma
kontrolna, linia-odsyłacz, ślad we wpisie dziennika tej sesji. Mechanizm jest
jeden.

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
stoją osobno, każda we własnym zdaniu.

Każda wymieniona pozycja niesie **nazwę procedury**, która ją odchudza (rotacja dziennika, rotacja
lekcji, rotacja ryzyk zamkniętych, przeniesienie zwiniętych lekcji, skrócenie `STATE.md`).
Twoja robota: zgłosić to użytkownikowi **jednym zdaniem przed akapitem „gdzie jesteśmy"**
i zaproponować wymienione procedury jako pierwszy krok. Wykonujesz je **dopiero po zgodzie** i
**dokładnie** tak, jak opisuje krok 2 rytuału zamknięcia (**`document-rotation.md`**) — mechanizm
jest jeden.

**Linia hooka jest jedynym komunikatem i niesie zmierzone wartości** — bierzesz je z niej, a rotujesz
dopiero po zgodzie. Linia wypisuje najwyżej trzy pozycje, a resztę jako liczbę: przekazujesz
skrót, a komplet zostaje w linii. **Cisza hooka znaczy „sprawdzone i wszystko poniżej progu"**
(L-0036).

### Przegląd spraw przeterminowanych (od 1.7.0)

Sprawa z sekcji „Czeka na człowieka" starsza niż **`N` dni** wymusza decyzję na starcie sesji.
`N` i wyłącznik stoją w wierszu `Przegląd spraw człowieka` w `docs/USTAWIENIA.md` (domyślnie
`włączony · 30 dni`, `SPEC_USTAWIENIA.md`). **Wyłącznik jest osobny od rotacji:** `Rotacja
dokumentów: wyłączona` nie wycisza tego przeglądu, a wyłączony przegląd nie wycisza rotacji.

**Wykrycie niesie hook `session-context`, nie ten skill** — ma działać przy każdym modelu i bez
wyzwalania czegokolwiek (L-0030, R2). Hook wypisuje blok `[RelAI przeglad spraw]` z listą spraw
przeterminowanych: treść, wiek w dniach, licznik odroczeń. **Lista hooka jest rozstrzygająca**, a rytuał
zostaje przy czytaniu. Cisza hooka znaczy „sprawdzone: nic przeterminowanego" albo „przegląd jest
wyłączony".

**Kiedy pytasz** — gdy spełnione są **wszystkie trzy** warunki:

1. hook wypisał blok `[RelAI przeglad spraw]` z listą spraw,
2. blok **nie** kończy się linią „Sesja nieinteraktywna",
3. sesja jest interaktywna.

**Jak pytasz.** Przed akapitem „gdzie jesteśmy", narzędziem `AskUserQuestion`, **partiami po
cztery sprawy**, aż do wyczerpania listy — cztery sprawy na jedno
pytanie. Każda sprawa ma **trzy realne wybory**:

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

- **Zawiera** albo dziennik nie ma jeszcze ani jednego podpisu → milczysz.
- **Nie zawiera żadnego** → to cudzy projekt. Powiedz **jednym zdaniem**, że wpisy w dzienniku
  podpisał kto inny, i zaproponuj wycieczkę: stan, mapa dokumentów, aktywne plany, ryzyka, od czego
  zacząć. **Czekasz na zgodę** — po niej wykonujesz procedurę komendy `/relai-tour`.
- Gita nie ma albo `user.name` nie jest ustawione → milczysz. Nie da się rozstrzygnąć, kto pracuje.

Zasady jak przy siatce promptów etapowych: propozycja **nigdy** nie zamienia się w automatyczne
odpalenie, odmowa zamyka temat na tę sesję, a propozycja idzie **przed** akapitem „gdzie jesteśmy".

Od 0.7.0 sygnał ma **dwie warstwy**: ten krok rytuału oraz hook `session-context` (SessionStart),
który to samo porównanie wykonuje niezależnie od tego, czy skill się wyzwolił (R2). Hook już zgłosił
nieznanego autora w kontekście sesji → przejdź od razu do propozycji; zgłoszenie hooka wystarcza.
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

Aktualizacja idzie bez pytania i od razu — w tej samej turze co zmiana, a nie „na koniec sesji";
zadanie zgłaszasz jako ukończone dopiero po niej. Zadanie z działającym kodem i nieaktualnym STATE
jest **w toku**.

Czego to **nie** dotyczy: pytań, analiz, czytania kodu, eksperymentów bez zapisu, poprawek
literówek w komentarzu.

---

## Reguły warunkowe profilu (D-50…D-53)

Profil projektu stoi w `docs/USTAWIENIA.md` w wierszu „Profil projektu" (lista zamknięta: `app`,
`agent-voice`, `flow`, `prompty`). Profil dokłada dokumenty warunkowe, które powstają **przy
zdarzeniu**, a regułę niesie sekcja `## Reguły profilu` w `CLAUDE.md` projektu.

**Otwórz `profiles.md`**, gdy zachodzi zdarzenie profilu (pierwszy plik źródłowy albo interfejsu
w `app`, pierwsze wdrożenie środowiska, zmiana konfiguracji produkcyjnej w `agent-voice` / `flow`,
pierwszy artefakt w `prompty`), gdy hook zgłosił takie zdarzenie, gdy człowiek zmienia profil
albo przy inicjalizacji. Tam są: tabela zdarzeń, jedno pytanie towarzyszące, snapshot jako
bramka, reguły w `CLAUDE.md` i zmiana profilu.

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
   jako L-0007.". Na tym kończysz — bez pytania o zgodę, przeprosin i rozwijania tematu.
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

Projekt z wersją 1.6.0 lub nowszą, którego dziennik nie ma sekcji „Czeka na człowieka", przechodzi
jednorazową procedurę sześciu kroków. Proponujesz ją jednym zdaniem, gdy zauważysz brak sekcji;
**po zgodzie** (albo na prośbę) **otwórz `waiting-migration.md`** i wykonaj ją stamtąd. Rotacja
idzie po niej, w osobnej turze.

---

## Zamknięcie sesji

Rytuał zamknięcia — sześć kroków z krokiem 2a (sync dokumentów z limitem „Zasad aktywnych",
rotacja, sprzątanie artefaktów roboczych, wpis do dziennika, ryzyka, commit, podsumowanie) oraz
reguła plików lokalnych z markerem `# relai: zachowaj` — mieszka w **`session-close.md`**.
Otwierasz go, gdy użytkownik kończy sesję (fraza niżej) albo gdy sam domykasz większą porcję
pracy. Krok 2 wykonujesz według **`document-rotation.md`** — to ten sam plik, który otwierasz przy
rotacji zaproponowanej na starcie sesji.

Gdy dopisujesz do `.gitignore` wzorzec dla lokalnej notatki albo materiału właściciela, reguła
markera `# relai: zachowaj` też jest w `session-close.md` (sekcja „Pliki lokalne, których nie
sprzątamy").

---

## Frazy naturalne (D-05)

Trzy frazy działają w tej wersji, w wariancie polskim i angielskim. Rozpoznajesz **intencję**, nie
dosłowne brzmienie: „kończymy", „na dziś wystarczy", „that's it for today" to ta sama fraza.

### „kończymy na dziś" / „wrapping up"

Otwórz **`session-close.md`** i wykonaj rytuał zamknięcia sesji, punkty 1–6 wraz z krokiem 2a, w tej
kolejności.
Zaczynasz od razu — użytkownik już zdecydował. Pytania, jakie mogą paść, są dwa: zgoda na
commit i zgoda na skasowanie grupy artefaktów w kroku 2a. Rotacja dokumentów (punkt 2) o zgodę nie
pyta i poniżej progu nie zostawia śladu; krok 2a bez zamkniętych etapów i poniżej progu milczy
tak samo.

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

Wszystkie trzy frazy są opisane w wygenerowanym `docs/KOMENDY.md`. Obsługujesz i zapowiadasz
wyłącznie frazy z tej listy.

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
  plik globalny. Znalazłeś odpowiedź → **używasz jej bez pytania** i wspominasz o tym pół zdaniem
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

## Stan PUSTY i Stan Z ZAWARTOŚCIĄ

Folder bez struktury RelAI, propozycja niewyciszona globalnie (Krok 0, punkt 4) → **otwórz
`new-project.md`** i idź jego ścieżką: w stanie PUSTY zgoda, pytanie o zasięg odmowy, paczka
dokładnie trzech pytań i generacja plików; w stanie Z ZAWARTOŚCIĄ cztery drogi do wyboru
użytkownika. Ten sam plik otwierasz, gdy użytkownik sam prosi o RelAI („dodaj RelAI",
„zainicjuj projekt") w folderze bez markera.

---

## Twarde zakazy tego skilla

- Nie kasujesz i nie nadpisujesz niczego, czego RelAI nie utworzył w tej sesji.
- Nie proponujesz inicjalizacji ani adopcji, gdy wiersz `Propozycja RelAI poza projektem` mówi
  `nie proponuj` — ani wprost, ani „przy okazji" innego tematu.
- Pytania startowe: najwyżej trzy, w jednym wywołaniu. Wywiady wielopytaniowe są poza zakresem (D-80).
- Lekcje i aktualizacje STATE/DZIENNIKA zapisujesz bez pytania — to część ukończenia zadania.
- Nie dopisujesz reguł do `CLAUDE.md` i nie zamrażasz decyzji bez zgody człowieka.
- Nie zapisujesz sekretów w plikach śledzonych — klucze wyłącznie w `.env` objętym `.gitignore`
  (D-42).
- Repo zakładasz wyłącznie poza innym repo (D-53).
- Dokument warunkowy profilu powstaje wyłącznie przy swoim zdarzeniu (D-10).
- Pytania profilu padają przy zdarzeniu, poza paczką startową (D-20, D-80).
- Nie zmieniasz produkcyjnej konfiguracji w profilu `agent-voice` / `flow` przed snapshotem (D-52).
- Profile są cztery i pozostają rozdzielne (D-50).
- Obiecujesz wyłącznie komendy i rytuały, które ta wersja pluginu ma — ich lista jest
  w wygenerowanym `docs/KOMENDY.md`.
