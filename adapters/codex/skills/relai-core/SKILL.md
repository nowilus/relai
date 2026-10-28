---
name: relai-core
description: >
  Runs the RelAI session start ritual and keeps the project's memory current. Use it on the first
  prompt of a session in any folder: it checks whether the folder is a RelAI project
  (docs/USTAWIENIA.md contains "Wersja RelAI" / "RelAI version"), reads state, journal, lessons
  and settings when it is, and offers the structure when it is not. Phrases (Polish): "zacznijmy
  projekt", "nowy projekt", "zainicjuj projekt", "dodaj RelAI", "co to za projekt", "kończymy na
  dziś", "kontynuujemy pracę", "sprawdź status", "jak stoimy", "zapisz pracę"; English: "start
  project", "new project", "set up RelAI", "wrapping up", "let's continue", "status check", "save
  my work". Also covers guest mode, the closing ritual, lessons after corrections and profile
  rules. Plans: relai-planning.
---

# relai-core — struktura projektu, pamięć i rytuały sesji

Ten skill rozpoznaje stan folderu, prowadzi rytuał startu i zamknięcia sesji, pilnuje definicji
ukończenia i rejestrów `LEKCJE` / `DECYZJE`. Plany, etapy i odnogi należą do `relai-planning`;
operacje rzadkie (kopia zapasowa, przegląd, adopcja, aktualizacja, sprzątanie) mają własne komendy;
sekretów i konfiguracji pilnują hooki.

Specyfikacje dokumentów czytaj z **lokalnej kopii `.claude/relai/templates/`** w bieżącym
folderze — utrzymuje ją hook `session-context` (katalog pluginu jest dla sesji niedostępny,
L-0012). Kopii nie ma → powiedz o tym jednym zdaniem i poproś o uruchomienie sesji z `--add-dir`
na katalog pluginu; dokumentów nie generujesz z pamięci.

## Pliki doczytywane — kiedy który otworzyć

Leżą obok tego pliku. Otwierasz plik dopiero wtedy, gdy zachodzi jego wyzwalacz, i czytasz go
w całości przed pierwszym krokiem procedury:

| Plik | Otwierasz go, gdy |
|---|---|
| `start-nets.md` | kontekst niesie zgłoszenie hooka startu (luka promptu, rozjazd stanu, budżet, progi dokumentów, nieznany autor) albo bloku `[RelAI session-context]` nie ma wcale |
| `overdue-review.md` | hook wypisał blok `[RelAI przeglad spraw]` |
| `session-close.md` | użytkownik kończy sesję („kończymy na dziś", „wrapping up"), sam domykasz większą porcję pracy albo dopisujesz do `.gitignore` wzorzec lokalnej notatki lub materiału właściciela (marker `# relai: zachowaj`) |
| `document-rotation.md` | wykonujesz rotację: krok 2 rytuału zamknięcia albo rotacja zaproponowana na starcie i przyjęta |
| `new-project.md` | Krok 0 rozpoznał stan PUSTY albo Z ZAWARTOŚCIĄ (propozycja niewyciszona) albo użytkownik prosi o RelAI w folderze bez markera |
| `profiles.md` | zachodzi zdarzenie profilu, człowiek zmienia profil albo inicjalizujesz projekt |
| `global-settings.md` | tworzysz albo zmieniasz `~/.claude/relai/USTAWIENIA.md`, inicjalizujesz projekt albo człowiek pyta, skąd preferencja |
| `adopted-registers.md` | `CLAUDE.md` ma sekcję „Zasady projektu (odziedziczone)", a zapisujesz decyzję, regułę albo lekcję |
| `waiting-migration.md` | dziennik nie ma sekcji „Czeka na człowieka" — proponujesz ją jednym zdaniem; plik otwierasz po zgodzie albo na prośbę, rotacja idzie w osobnej turze |
| `debugging.md` | coś nie działa: „nie działa", „błąd", „sypie się", „it's broken", „doesn't work", test albo komenda pada bez jasnej przyczyny |
| `done-check.md` | zaczynasz zadanie, które zmieni kod — kroki (testy projektu, przegląd diffu) wykonujesz **przed** zgłoszeniem „gotowe" |
| `limit-checkpoint.md` | prompt zaczyna się od „zapisz pracę" / „save my work" — z karty limitu albo wpisany ręcznie |
| `first-deploy.md` | **przed** pierwszym wdrożeniem środowiska: „wdrażamy", „deploy", pierwsza konfiguracja wdrożeniowa |
| `history.md` | pytanie dotyczy tego, co zmieniło się w konkretnej wersji pluginu |

Pliku nie ma (instalacja niepełna) → mówisz o tym jednym zdaniem i prosisz
o aktualizację pluginu; procedury nie odtwarzasz z pamięci.

---

## Krok 0 — rozpoznanie stanu folderu (zawsze pierwsze, bez pytania)

Sprawdź po kolei i po cichu — użytkownik widzi wynik, a samo sprawdzanie przechodzi bez komentarza.

1. **Marker trybu gościa** — plik `.claude/relai.json` zawierający `"mode": "guest"` → **GOŚĆ**.
2. **Marker struktury RelAI** — plik `docs/USTAWIENIA.md` (albo odpowiednik w języku projektu,
   np. `docs/SETTINGS.md`) zawierający tekst `Wersja RelAI` / `RelAI version` → **PROJEKT RELAI**.
3. W pozostałych przypadkach: folder, w którym poza metadanymi narzędzi (`.git/`, `.claude/`,
   `.vscode/`, `.idea/`, `.gitignore`, `.gitattributes`, `LICENSE`) nie ma nic → **PUSTY**;
   cokolwiek innego (kod, dokumenty, `package.json`, `README.md`) → **Z ZAWARTOŚCIĄ**.
4. **Wyciszenie globalne** — wiersz `Propozycja RelAI poza projektem` = `nie proponuj`
   w `~/.claude/relai/USTAWIENIA.md` (linia hooka `[RelAI]`). Dotyczy wyłącznie
   stanów PUSTY i Z ZAWARTOŚCIĄ → nic nie proponujesz i o nic nie pytasz.

Dalej idź dokładnie jedną ścieżką.

## Stan GOŚĆ — nic nie proponuj

Użytkownik już raz odmówił w tym folderze (D-21). Pracuj jak zwykły Claude Code; temat
inicjalizacji jest zamknięty w tej sesji i w każdej następnej. Jedyny wyjątek: użytkownik sam
prosi („dodaj RelAI", „dołącz strukturę", „add RelAI") — wtedy usuń marker i przejdź ścieżką
odpowiednią do zawartości folderu.

## Stan PUSTY i Stan Z ZAWARTOŚCIĄ

Propozycja niewyciszona → **otwórz `new-project.md`** i idź jego ścieżką (PUSTY: zgoda, zasięg
odmowy, trzy pytania, generacja; Z ZAWARTOŚCIĄ: cztery drogi). Ten sam plik otwierasz, gdy
użytkownik sam prosi o RelAI w folderze bez markera.

---

## Stan PROJEKT RELAI — rytuał startu sesji

Nie inicjalizuj niczego drugi raz. Wykonaj **rytuał startu** — raz na sesję, przed pierwszą merytoryczną odpowiedzią.

### Skrót startu (jedno polecenie, nic poza nim)

Uruchom `node .claude/relai/tools/start-digest.js` i przeczytaj jego wyjście. Skrót niesie
z `docs/STATE.md` sekcje „Gdzie jesteśmy”, „Nad czym pracujemy teraz”, „Co blokuje” i pierwszy
punkt „Co dalej”; tabelę ryzyk bez kolumny „Mitygacja”; ostatni wpis dziennika (sekcję „Czeka
na człowieka” tylko przy sprawie przeterminowanej); aktywne wiersze `docs/USTAWIENIA.md`;
`STATUS.md` aktywnego planu i „Zasady aktywne” (D-15). `CLAUDE.md` masz już w kontekście.

**Na starcie nie otwierasz plików, które skrót streszcza.** Pełne sekcje, `docs/DECYZJE.md`
i starsze wpisy dziennika wskazują drogowskazy na końcu skrótu — otwierasz je dopiero wtedy, gdy
temat tego wymaga. Linia „brak sekcji …” albo „brak pliku …” w skrócie to fakt o projekcie,
nie awaria. Brak samego narzędzia (projekt sprzed tej wersji) → wtedy czytasz `docs/STATE.md`,
sekcje ryzyk i „Zasady aktywne” sam i proponujesz `/relai-update`.

### Siatki startu — zasady każdej siatki

Hook `session-context` porównuje dokumenty mechanicznie i zgłasza luki w kontekście sesji
(L-0030, R2); procedury — `start-nets.md` i `overdue-review.md`. Każda siatka podlega tym samym
zasadom:

- Zgłoszenie idzie **jednym zdaniem przed** akapitem „gdzie jesteśmy".
- Zgłoszenie hooka jest **jedynym** zgłoszeniem; cisza hooka znaczy „sprawdzone i zgodne" — nie
  powtarzasz porównania sam (L-0036). Bloku `[RelAI session-context]` nie ma w ogóle → dopiero
  wtedy porównujesz sam, wg `start-nets.md`.
- Propozycja **nigdy** nie zamienia się w automatyczne odpalenie: zmiana w repo idzie po zgodzie.
- Odmowa zamyka temat do końca sesji.
- Sesja nieinteraktywna (`claude -p`, agent w tle, linia hooka „Sesja nieinteraktywna") → sam
  raport, bez pytań i bez zmian w repozytorium.

### Podsumowanie dla użytkownika

Po przeczytaniu skrótu napisz **jeden akapit** (3–5 zdań) „gdzie jesteśmy": co działa, nad czym
pracujemy, co blokuje, jaki jest najbliższy krok. Bez list, bez tabel, bez powtarzania nazw plików.
Potem zrób to, o co użytkownik prosił. Prompt samowystarczalny i drobny (jedno pytanie o kod) →
podsumowanie skróć do jednego zdania, ale skrót uruchom mimo to.

---

## Definicja ukończenia — zachowanie, nie deklaracja (D-44)

**Zmiana funkcjonalna oznacza obowiązek aktualizacji dokumentów w tej samej turze, bez proszenia
i bez pytania o zgodę.** Zmiana funkcjonalna to: coś zaczęło działać, coś przestało, powstał lub
zniknął moduł, zmienił się sposób uruchomienia, wystartował lub zamknął się plan, zmienił się
priorytet.

W tej samej turze, w której to zrobiłeś:

1. **`docs/STATE.md`** — nadpisz to, co się zmieniło (nie dopisuj akapitu — STATE nie ma historii).
2. **`docs/DZIENNIK.md`** — dopisz wpis na **końcu** sekcji „Wpisy", wg szablonu ze
   `SPEC_DZIENNIK.md`: Zrobione / Zweryfikowane — jak dokładnie / Świadomie odłożone / Do zrobienia
   przez człowieka. Nagłówek z datą z kontekstu sesji, linia autora `RelAI (<model>) + <git config>`.
3. **`README.md`** — tylko jeśli zmienił się sposób uruchomienia, doszła zmienna w `.env` albo nowy
   dokument w `docs/`.

Zadanie z działającym kodem i nieaktualnym STATE jest **w toku** — zgłaszasz je jako ukończone
dopiero po aktualizacji. Nie dotyczy: pytań, analiz, czytania kodu, eksperymentów bez zapisu,
literówek w komentarzu.

---

## Preferencje — najpierw zapis, potem pytanie (D-23)

Przed każdym pytaniem o preferencję sprawdź `docs/USTAWIENIA.md`, potem plik globalny
`~/.claude/relai/USTAWIENIA.md`. **Wpis projektowy ma pierwszeństwo.** Znalazłeś odpowiedź →
używasz jej bez pytania i wspominasz pół zdaniem, skąd ją masz. Tworzenie, format i dziedziczenie
pliku globalnego — `global-settings.md`.

## Reguły warunkowe profilu (D-50…D-53)

Profil projektu stoi w `docs/USTAWIENIA.md` w wierszu „Profil projektu" (lista zamknięta: `app`,
`agent-voice`, `flow`, `prompty`); dokumenty warunkowe powstają **przy zdarzeniu**, a regułę niesie
sekcja `## Reguły profilu` w `CLAUDE.md`. Zdarzenie profilu, zgłoszenie hooka, zmiana profilu albo
inicjalizacja → **otwórz `profiles.md`**: tabela zdarzeń, jedno pytanie towarzyszące, snapshot jako
bramka, reguły w `CLAUDE.md`.

## Reakcja na korektę użytkownika

Użytkownik poprawił sposób, w jaki coś zrobiłeś — nie treść zadania, tylko Twoje zachowanie.

1. **Zapisz lekcję bez pytania.** Wpis `L-NNNN` na końcu sekcji „Lekcje" w `docs/LEKCJE.md`, format
   wg `SPEC_LEKCJE.md` (trigger / przyczyna / zasada / źródło). Potwierdź jedną linią: „Zapisane
   jako L-0007.". Na tym kończysz — bez pytania o zgodę, przeprosin i rozwijania tematu.
2. **Zaktualizuj „Zasady aktywne"**, jeśli lekcja wnosi zasadę, której tam jeszcze nie ma.
3. **Sprawdź powtórzenie.** Ta sama sprawa była już zapisana → zamiast bliźniaczego wpisu dopisz
   lekcję z adnotacją „powtórzenie L-XXXX" i **zaproponuj graduację** do `CLAUDE.md` jednym
   zdaniem. Dopisujesz tam dopiero po zgodzie człowieka.
4. **Sprawdź powracający temat.** Wraca rozstrzygnięcie merytoryczne (nie zachowanie) →
   zaproponuj zamrożenie decyzji `D-NN` wg `SPEC_DECYZJE.md`. Zatwierdza człowiek.
5. **Frazy zamykające temat** („nie rób tego więcej", „ustalmy raz na zawsze", „koniec dyskusji
   o X") zapisujesz **bez pytania**: sposób pracy → `LEKCJE.md`, rozstrzygnięcie w projekcie →
   `DECYZJE.md`. Gdy zakres frazy jest niejasny, zapytaj o zakres — nie o to, czy zapisać.

Projekt po adopcji (sekcja „Zasady projektu (odziedziczone)" w `CLAUDE.md`) → zapis według
`adopted-registers.md`; do sekcji odziedziczonej nie dopisujesz.

---

## Frazy naturalne (D-05)

Cztery frazy, w wariancie polskim i angielskim. Rozpoznajesz **intencję**, nie dosłowne brzmienie:
„kończymy", „na dziś wystarczy", „that's it for today" to ta sama fraza.

### „kończymy na dziś" / „wrapping up"

Otwórz **`session-close.md`** i wykonaj rytuał zamknięcia sesji, punkty 1–6 wraz z krokiem 2a,
w tej kolejności. Zaczynasz od razu — użytkownik już zdecydował. Pytania są dwa: zgoda na commit
i zgoda na skasowanie grupy artefaktów w kroku 2a. Krok 2 wykonujesz według
`document-rotation.md`; rotacja o zgodę nie pyta i poniżej progu nie zostawia śladu.

### „kontynuujemy pracę" / „let's continue"

1. Wykonaj **rytuał startu sesji**, nawet jeśli sesja trwa już jakiś czas: uruchom skrót startu
   ponownie (jedno polecenie — całych plików nie czytasz drugi raz). **Plik wznowienia** —
   wskazany we frazie („kontynuujemy pracę — plik wznowienia: ścieżka”) albo zgłoszony zdaniem
   hooka startu — czytasz **jako pierwsze źródło** „gdzie jesteśmy”, przed skrótem startu.
2. Napisz akapit „gdzie jesteśmy". Hook podał commity od zapisu albo nieznany hash → powiedz,
   że lista „Co dalej” mogła się zestarzeć.
3. Dodaj **jedno zdanie z propozycją najbliższego kroku** — z pliku wznowienia: krok 1 jego listy
   „Co dalej”; bez pliku: z `STATE.md` („Nad czym pracujemy teraz") albo z aktywnego planu — i
   zapytaj, czy zaczynamy od tego.
4. Fraza niesie linię zgody na skasowanie pliku wznowienia (karta „Wznów pracę”) → po przeczytaniu
   skasuj ten jeden plik i powiedz to jednym zdaniem. Bez tej linii, przy istniejącym pliku,
   **zapytaj raz** po akapicie: „tak” → kasujesz, inna odpowiedź → zostaje (`SPEC_WZNOWIENIE.md`).

### „sprawdź status" / „status check" (także „jak stoimy")

Zwięzły raport, bez wykonywania pracy:

1. **Stan** — dwa zdania z `STATE.md`.
2. **Plany** — aktywny plan, etap zrealizowany ostatnio, etap następny (z `STATUS.md` planu);
   brak planu → jedno zdanie.
3. **Ryzyka** — otwarte pozycje z tabeli dziennika, każde w jednej linii.
4. **Zaległości dokumentacyjne** — czy `STATE.md` jest starszy niż ostatni wpis dziennika, czy są
   niezacommitowane zmiany, czy „Do zrobienia przez człowieka" z ostatnich wpisów zostało
   rozstrzygnięte.
5. Zakończ pytaniem o najbliższy krok — jednym zdaniem.

### „zapisz pracę" / „save my work"

Otwórz **`limit-checkpoint.md`** i wykonaj procedurę krok po kroku: testy, commit kodu, dokumenty,
plik wznowienia, znacznik `ZAPIS GOTOWY`. Fraza z karty limitu niesie zgodę na commit lokalny;
wpisana ręcznie — pytasz o commit raz.

---

## Granice tego skilla

- Kasujesz i nadpisujesz wyłącznie to, co RelAI utworzył w tej sesji.
- Wiersz `Propozycja RelAI poza projektem` = `nie proponuj` → żadnej propozycji inicjalizacji ani
  adopcji, także „przy okazji" innego tematu.
- Pytania startowe: najwyżej trzy, w jednym wywołaniu (D-80).
- Lekcje i aktualizacje STATE/DZIENNIKA zapisujesz bez pytania; reguły w `CLAUDE.md` i zamrożenie
  decyzji — dopiero po zgodzie człowieka.
- Sekrety wyłącznie w `.env` objętym `.gitignore`, nigdy w plikach śledzonych (D-42).
- Repo zakładasz wyłącznie poza innym repo (D-53).
- Dokument warunkowy profilu i pytanie profilu — wyłącznie przy jego zdarzeniu, poza paczką
  startową (D-10, D-20); produkcyjną konfigurację `agent-voice` / `flow` zmieniasz dopiero po
  snapshocie (D-52); profile są cztery i rozdzielne (D-50).
- Obiecujesz i obsługujesz wyłącznie komendy, frazy i rytuały z wygenerowanego `docs/KOMENDY.md`.
