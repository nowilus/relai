---
name: relai-core
description: >
  MUST BE USED on the first prompt of a session in any folder, before answering anything else — to
  check whether the folder is a RelAI project (docs/USTAWIENIA.md contains "Wersja RelAI" / "RelAI
  version"), run the session start ritual when it is, and offer to set the structure up when it is
  not. Skipping this check means working without the project's memory, rules and open risks.
  Trigger phrases (Polish): "zacznijmy projekt", "nowy projekt", "zaczynam projekt", "zainicjuj
  projekt", "dodaj RelAI", "dołącz RelAI", "co to za projekt", "kończymy na dziś", "kontynuujemy
  pracę", "sprawdź status", "jak stoimy". English: "start project", "new project", "init project",
  "set up RelAI", "wrapping up", "let's continue", "status check".
  Covers: initialization (consent, then exactly three questions, then generation of CLAUDE.md,
  README.md and docs/ with STATE, DZIENNIK, LEKCJE, DECYZJE, USTAWIENIA, KOMENDY), guest mode,
  non-destructive attach, keeping STATE and the journal current in the same turn as any functional
  change, recording a lesson after every user correction, and proposing to freeze a recurring
  decision. Planning is a separate skill (relai-planning).
---

# relai-core — struktura projektu, pamięć i rytuały sesji

Wersja E3 (RelAI 0.3.0). Zakres tego skilla: **rozpoznanie stanu folderu + inicjalizacja + tryb
gościa + niedestrukcyjne dołączenie + rytuały sesji + rejestry LEKCJE/DECYZJE + trzy frazy
naturalne + warstwa ustawień globalnych**. Prompty etapowe, komendy `/relai-*`, hooki i pełna
adopcja zastanego projektu przychodzą w kolejnych wersjach — nie udawaj, że już działają.

**Planowanie należy do skilla `relai-planning`** (od 0.3.0): wykrycie prośby o plan, rozróżnienie
PLAN/MINIPLAN, generacja `docs/plany/<TEMAT>/`, zamrożenie i zamknięcie planu. Tutaj planów nie
opisujesz i nie tworzysz — tutaj plan pojawia się wyłącznie jako pozycja czytana w rytuale startu
i jako linia „Aktywny plan" w `CLAUDE.md`.

`${CLAUDE_PLUGIN_ROOT}` wskazuje katalog pluginu. Specyfikacje dokumentów leżą w
`${CLAUDE_PLUGIN_ROOT}/templates/`.

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
| 3 | `docs/DZIENNIK.md` | **wyłącznie** sekcja „Stan otwartych ryzyk" + ostatni wpis |
| 4 | `docs/LEKCJE.md` | **wyłącznie** sekcja „Zasady aktywne" (D-15) |
| 5 | `docs/USTAWIENIA.md` | tabela preferencji — zanim o cokolwiek zapytasz |
| 6 | aktywny plan (`docs/plany/<TEMAT>/STATUS.md`) | tylko jeśli `CLAUDE.md` go wskazuje |

**Zakaz pełnotekstowego skanowania repo na starcie.** Nie czytasz `docs/DECYZJE.md` w całości ani
starych wpisów dziennika — sięgasz po nie, gdy temat konkretnie tego wymaga. Pliku, którego nie ma
(np. `LEKCJE.md` w projekcie sprzed 0.2.0), po prostu nie czytasz; nie zgłaszaj tego jako błędu.

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

## Zamknięcie sesji

Rytuał zamknięcia wykonujesz, gdy użytkownik powie, że kończycie (patrz „Frazy naturalne"), albo
gdy sam kończysz większą porcję pracy. Kolejność:

1. **Sync dokumentów** — przejrzyj, co się w tej sesji zmieniło, i domknij: `STATE.md`,
   `USTAWIENIA.md` (jeśli padły nowe preferencje), `LEKCJE.md` / `DECYZJE.md` (jeśli coś zostało
   niezapisane), `README.md` (jeśli zmienił się sposób uruchomienia).
2. **Wpis do dziennika** — jeden wpis zbiorczy za sesję, na końcu sekcji „Wpisy". Sekcja
   „Zweryfikowane — jak dokładnie" musi mówić, czym i z jakim wynikiem sprawdzałeś; „nie
   weryfikowano" jest dopuszczalną treścią, brak sekcji nie jest.
3. **Ryzyka** — zaktualizuj tabelę „Stan otwartych ryzyk", jeśli któreś zamknięto, otwarto albo
   zmienił się jego poziom.
4. **Commit** — jeśli projekt ma gita i są niezacommitowane zmiany, zaproponuj commit
   z conventional message. Nie commituj bez zgody, poza commitem inicjalizacyjnym.
5. **Podsumowanie** — 3–5 zdań: co zrobione, co zweryfikowane, co czeka na człowieka, od czego
   zacząć następnym razem. Bez list zadań i bez obietnic terminów.

---

## Frazy naturalne (D-05)

Trzy frazy działają w tej wersji, w wariancie polskim i angielskim. Rozpoznajesz **intencję**, nie
dosłowne brzmienie: „kończymy", „na dziś wystarczy", „that's it for today" to ta sama fraza.

### „kończymy na dziś" / „wrapping up"

Wykonaj **rytuał zamknięcia sesji** (sekcja wyżej), punkty 1–5, w tej kolejności. Nie pytaj, czy na
pewno — użytkownik już powiedział. Jedyne pytanie, jakie może paść, to zgoda na commit.

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
| `package.json`, `pyproject.toml`, `src/`, pliki źródłowe | `app` |
| konfiguracje agentów głosowych (ElevenLabs, Vapi, Retell), knowledge base | `agent-voice` |
| eksporty workflow n8n / Make (JSON z węzłami) | `flow` |
| wyłącznie dokumenty i prompty | `prompty` |
| pusto — brak sygnałów | `app` jako default, ale zaznacz, że to zgadywanka |

**Git — konsekwencje do pokazania przy opcjach:**
- *repo lokalne + GitHub* — `git init` teraz, propozycja utworzenia repo zdalnego osobno (RelAI go
  nie zakłada za użytkownika).
- *tylko lokalnie* — `git init`, bez zdalnego.
- *bez gita* — dozwolone, ale powiedz wprost: znika siatka bezpieczeństwa historii zmian (D-53).

**Zawsze i bez wyjątku:** zagnieżdżone repo są zakazane (D-53). Jeśli folder nadrzędny jest już repo
gitem, nie rób `git init` — powiedz o tym i pracuj w repo nadrzędnym.

### 3. Generacja plików

Ze specyfikacji w `${CLAUDE_PLUGIN_ROOT}/templates/` wygeneruj komplet **w języku projektu**
(D-60 — specyfikacje to instrukcje dla Ciebie, nie pliki do skopiowania):

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
- `docs/USTAWIENIA.md` **musi** zawierać linię `Wersja RelAI: 0.3.0` — to marker, po którym RelAI
  rozpoznaje projekt i po którym przyszły `/relai-update` policzy różnicę wersji.
- `docs/LEKCJE.md` i `docs/DECYZJE.md` powstają **puste, ale kompletne strukturalnie**: nagłówek,
  zdanie o roli, sekcja „Zasady aktywne" (LEKCJE) z informacją, że jest jeszcze pusta, i pusta
  sekcja na wpisy. Pusty rejestr z gotową strukturą zapełnia się sam; brakujący plik nie.
- Do tabeli ustawień wpisz trzy odpowiedzi z paczki startowej, każda z dzisiejszą datą.
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

## Stan Z ZAWARTOŚCIĄ — propozycja niedestrukcyjna

Folder ma już swoje życie. **Niczego istniejącego nie ruszasz** — ani jednego pliku, ani jednej linii.

Przedstaw dokładnie trzy możliwości i zapytaj (AskUserQuestion, jedno pytanie):

1. **Dołączenie niedestrukcyjne (Rekomendowane)** — dokładasz wyłącznie brakujące pliki RelAI.
   Istniejące pliki o tych samych nazwach zostają nietknięte: nie nadpisujesz, nie scalasz, nie
   dopisujesz. Zamiast tego wymieniasz je w podsumowaniu jako pominięte i mówisz, co RelAI by tam
   trzymał. Jeśli istnieje `CLAUDE.md` — zostaje bez zmian; scalanie reguł jest częścią adopcji.
2. **Tryb gościa** — marker `.claude/relai.json` = `{"mode":"guest"}`, koniec tematu.
3. **Poczekać na adopcję** — użytkownik nie robi teraz nic.

Przy każdej rozmowie o tym stanie powiedz wprost, w jednym zdaniu: **pełna adopcja zastanego
projektu — z backupem, analizą kodu i historii, raportem zmian i przetestowaną ścieżką cofnięcia —
jeszcze nie istnieje; przyjdzie w kolejnej wersji pluginu jako `/relai-adopt`** (D-70). Nie
improwizuj namiastki adopcji.

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
- Nie obiecujesz komend i rytuałów, których ta wersja pluginu nie ma. Lista tego, co realnie działa,
  jest w wygenerowanym `docs/KOMENDY.md`.
