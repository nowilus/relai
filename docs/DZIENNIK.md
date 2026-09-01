# DZIENNIK — budowa RelAI

## Stan otwartych ryzyk

| # | Ryzyko | Poziom | Status | Mitygacja |
|---|---|---|---|---|
| R2 | Auto-wyzwalanie skilli bywa zawodne (agent nie zastosuje zasad bez komendy) | **Niski przy Opusie, średni przy modelach słabszych** (2026-08-10 po E10) | **ZMIERZONE 2026-08-10, OTWARTE ŚWIADOMIE** | Warstwą nośną są hook `session-context` i `CLAUDE.md` projektu — działają przy każdym modelu, bez wyzwalania; skill dokłada wyłącznie procedurę (L-0030). Opus wyzwala skill sam i wykonuje procedurę w całości; Sonnet 4.6 i Haiku 4.5 nie wołają `Skill` ani razu, więc projekt nie traci pamięci, ale procedura bywa niepełna. Otwarte świadomie: to trwała własność modeli, nie usterka do naprawienia. Zakres ryzyka rósł od 1.1.0 bez pomiaru — dziesiąta komenda, sygnał odchylenia, rozjazd stanu i kontrola podpisu nie były mierzone w świeżej sesji, bo limit konta zatrzymał CLI (L-0032). **Odnoga `POMIAR_ODNOG` anulowana 2026-09-01** — ta część zakresu zostaje niezmierzona świadomie, karta zostaje w repo. Zmierzone: 2026-08-07 (E5), 2026-08-10 (E10), 2026-08-12 (E1), 2026-08-12 (E3) |
| R5 | Dokumenty puchną i zjadają kontekst | **Niski dla projektów na 1.7.0, średni dla niezmigrowanych** (2026-09-01 po E6; wcześniej średni) | **ZMIERZONE 2026-09-01, OTWARTE ŚWIADOMIE — zawężone do migracji JiraManagera** | Mechanizm jest kompletny **i zadziałał na cudzym projekcie w żywej sesji**, nie tylko w instrumentach: PolyFlow 1.6.1 → 1.7.0, rotacja dziennika **183,1 → 147,3 KB** (9 wpisów, suma `566dca8a4dd45ba7` odczytana z dysku przed przycięciem), rotacja ustawień **29,8 → 25,4 KB** (16 wierszy, 5 wierszy maszynowych nietkniętych), przepięcie linków z bilansem zero (60 przed, 65 po rotacji, 60 po przepięciu). Tutaj: dziennik **155,6 → 74,1 KB**, 18 wpisów do archiwum, raport startu z 2 linii na **0**. Zawężone, bo to, co zostało, nie jest już własnością mechanizmu: **JiraManager (386 KB startu) czeka na okno właściciela**, a warstwa startowa PolyFlow (157,3 KB przy budżecie 80 KB) jest gruba sekcją ryzyk, `CLAUDE.md` i `STATE.md` — odchudzają je decyzje człowieka, nie archiwum. Zmierzone: 2026-08-20, 2026-08-21, 2026-09-01 (E1–E6) |
| P1 | Adaptery Cursor/Codex nie egzekwują blokad harnessu — sekret albo zmiana konfiguracji przejdzie tam, gdzie w Claude Code stoi ściana (plan ROZWOJ_PO_WYDANIU) | **Średni** (2026-08-12 po E4; wcześniej wysoki) | **OTWARTE** | Część sekretowa jest zamknięta dowodem z aplikacji: w Cursorze zadziałały obie warstwy — reguła odmówiła pierwsza, a przy prośbie o próbę mimo reguły zapis klucza odbił hook `preToolUse` werdyktem `permission: deny`; niezależnie od narzędzia commit z sekretem zatrzymuje gitowy pre-commit. Otwarte z dwóch powodów: Cursor nie ma egzekwowanego `ask`, więc pliki konfiguracyjne chroni tam sama reguła zamiast bramki, a Codex pozostaje niezmierzony do odmrożenia E7 planu ROZWOJ_PO_WYDANIU. Zmierzone: 2026-08-12 (E4), 2026-08-12 (E5), 2026-08-17 (E6) |
| P2 | Odpowiednik R2 w Cursor/Codex: bez auto-wyzwalania skilli proces zależy od dyscypliny modelu (plan ROZWOJ_PO_WYDANIU) | **Niski dla Cursora, średni dla Codeksa** (2026-08-17 po E6; wcześniej średni) | **OTWARTE (już tylko Codex)** | Reguła zawsze-w-kontekście działa w Cursorze bez żadnego wyzwalacza: pilotaż przeszedł pełny cykl na trzech modelach, a cały etap poprowadził model spoza Anthropic (Grok 4.6) — rytuał startu, karta etapu z kontrolą modelu, granica zakresu, rytuał zamknięcia z promptem następnego etapu. Dyscyplina procesu nie zależy od dostawcy modelu. Otwarte już tylko dla Codeksa: warstwą nośną ma tam być `AGENTS.md` z twardym limitem 32 KiB, a skille wyzwalają się dopasowaniem opisu — tym samym mechanizmem, który przy R2 okazał się zależny od modelu. Zmierzone: 2026-08-12 (E4), 2026-08-12 (E5), 2026-08-17 (E6) |

> Ryzyka zamknięte R1, R3, R4, R6, R7, R8 (6 pozycji) są w
> [docs/archiwum/ryzyka/RYZYKA_2026-08-21.md](archiwum/ryzyka/RYZYKA_2026-08-21.md)
> — przeniesione 2026-08-21, suma kontrolna `4b370c3e2b31c6ba`.

## Czeka na człowieka

- **Zamknięta lista rdzeni rozstrzygnięcia nie zna słownika realnego projektu** — 7 z 32 pozycji
  „Czeka na człowieka" w PolyFlow wygląda dla człowieka na zamknięte, a mechanizm liczy je jako
  otwarte (`zaliczona` ×3, `dostarczony` ×1, trzy bez rdzenia z datą). Poszerzyć listę w rdzeniu
  czy przepisać adnotacje w cudzym projekcie? · 2026-09-01 ·
  [wpis 2026-09-01 — E6: wydanie 1.7.0](#2026-09-01--e6-wydanie-170-pomiar-po-restarcie-i-pierwsza-rotacja-z-przepięciem-linków)

- **Weryfikacja ośmiu rozstrzygnięć wpisanych w E2 — wypisane co do jednego 2026-09-01, czekają na
  potwierdzenie albo sprzeciw** · 2026-08-20 ·
  [wpis 2026-09-01 — Osiem bramek z listy zamkniętych](#2026-09-01--osiem-bramek-z-listy-zamkniętych-plan-rozwoj_po_wydaniu-zamrożony-formalnie)

- **Ikony README renderują się w 17–23 px zamiast 24 px, więc kreska schodzi poniżej piksela** —
  podbić grubość z 2.6 na 3.2 (zmiana proporcji rysunku) czy scalić kolumnę ikony z kolumną komendy
  w README (bez ruszania grafiki)? · 2026-09-01 ·
  [wpis 2026-09-01 — Ikony komend czytelne na obu motywach](#2026-09-01--ikony-komend-czytelne-na-obu-motywach-githuba)

## Wpisy

> Wpisy z okresu 2026-08-07 … 2026-08-09 (16 wpisów) są w
> [docs/archiwum/dziennik/DZIENNIK_2026-08-07_2026-08-09.md](archiwum/dziennik/DZIENNIK_2026-08-07_2026-08-09.md)
> — przeniesione 2026-08-17, suma kontrolna `c17de1981ceedb1c`.

> Wpisy z okresu 2026-08-10 … 2026-08-10 (2 wpisy) są w
> [docs/archiwum/dziennik/DZIENNIK_2026-08-10_2026-08-10.md](archiwum/dziennik/DZIENNIK_2026-08-10_2026-08-10.md)
> — przeniesione 2026-08-20, suma kontrolna `b7307c8678b9d6b9`.

> Wpisy z okresu 2026-08-10 … 2026-08-12 (4 wpisów) są w
> [docs/archiwum/dziennik/DZIENNIK_2026-08-10_2026-08-12.md](archiwum/dziennik/DZIENNIK_2026-08-10_2026-08-12.md)
> — przeniesione 2026-08-21, suma kontrolna `fa3e9fe384146138`.

> Wpisy z okresu 2026-08-12 … 2026-08-12 (3 wpisy) są w
> [docs/archiwum/dziennik/DZIENNIK_2026-08-12_2026-08-12.md](archiwum/dziennik/DZIENNIK_2026-08-12_2026-08-12.md)
> — przeniesione 2026-09-01, suma kontrolna `b4601365eee25163`.

> Wpisy z okresu 2026-08-12 … 2026-08-17 (3 wpisy) są w
> [docs/archiwum/dziennik/DZIENNIK_2026-08-12_2026-08-17.md](archiwum/dziennik/DZIENNIK_2026-08-12_2026-08-17.md)
> — przeniesione 2026-09-01, suma kontrolna `1690be9b08748504`.

> Wpisy z okresu 2026-08-17 … 2026-08-21 (18 wpisów) są w
> [docs/archiwum/dziennik/DZIENNIK_2026-08-17_2026-08-21.md](archiwum/dziennik/DZIENNIK_2026-08-17_2026-08-21.md)
> — przeniesione 2026-09-01, suma kontrolna `74a4d2a5fb9a3390`.

### 2026-09-01 — Zgłoszenie z PolyFlow: rotacja i progi nie bronią się same; plan HIGIENA_DOKUMENTOW

Autor: RelAI (Opus 5) + Lukasz

**Zrobione:**

- **Przyjęte zgłoszenie z sesji roboczej PolyFlow (2026-09-01)** — sześć defektów mechanizmu rotacji
  i progów, opisanych liczbami z pomiaru na tamtym projekcie: pozycja „Czeka na człowieka" bez terminu
  przydatności, niema blokada rotacji, nietykalność liczona w sztukach przy progu w kilobajtach, sekcja
  „Ustawienia wycofane" nieodchudzająca niczego, rotacja ryzyk bezsilna wobec statusów innych niż
  `ZAMKNIĘTE`, progi bez adresu egzekwowania.
- **Wywiad w czterech rundach** (12 pytań) — rozstrzygnięte: forma pracy (nowy plan, odnoga wchłonięta),
  właściciel sygnału progów (raport startu bierze progi dokumentów, limit „Zasad aktywnych" zostaje przy
  kroku 1 rytuału zamknięcia), sposób odchudzenia ryzyk (kompresja komórki „Mitygacja", wiersz zostaje
  widoczny), kryterium nietykalności (zostaje w sztukach, próg liczony ponad nietykalnymi), źródło daty
  przeglądu (domyślny wiek N dni z ustawień), tryb pytania (wymuszone `AskUserQuestion` partiami po cztery,
  aż do wyczerpania listy) i znaczenie odpowiedzi „zostawiam" (odroczenie o kolejne N dni z licznikiem).
- **`docs/plany/HIGIENA_DOKUMENTOW/PLAN.html`** — plan główny w HTML wg `SPEC_PLAN_HTML.md`: dziesięć
  sekcji, cztery warianty z jawnymi powodami odrzucenia, diagram przepływu startu sesji, wykres
  pracochłonności, sześć ryzyk, siedem przypadków brzegowych rozstrzygniętych, trzy sprawy dla człowieka
  oraz symulator na sześciu wejściach liczący zakres rotacji przed poprawką i po niej.
- **`docs/plany/HIGIENA_DOKUMENTOW/STATUS.md`** — sześć etapów, wszystkie `OCZEKUJE`, status planu
  `DO AKCEPTACJI`, model wykonawczy Opus (D-85).
- **`CLAUDE.md`** — wiersz planu w tabeli „Stan prac" i linia aktywnego planu (dotąd `brak`).
- **`docs/STATE.md`** — nowa pozycja w „Nad czym pracujemy teraz"; odnoga `BLOKADA_ROTACJI` przestaje być
  wątkiem samodzielnym i wchodzi jako E1 tego planu.

**Zweryfikowane — jak dokładnie:**

- **Zgłoszenie sprawdzone na tym repozytorium, nie przyjęte na słowo** `FAKT`: `docs/LEKCJE.md` ma
  **52 260 B przy progu 50 KB** i 38 lekcji przy progu 40 — próg objętościowy przekroczony, rotacja lekcji
  nie odpaliła nigdy. To potwierdza punkt 6 zgłoszenia w projekcie, w którym mechanizm powstał. Pozostałe
  pomiary warstwy startowej: `DZIENNIK.md` 140 068 B, `STATE.md` 11 425 B, `USTAWIENIA.md` 3 039 B,
  `CLAUDE.md` 3 920 B, „Zasady aktywne" 15 pozycji przy limicie 15.
- **Zakres odnogi `BLOKADA_ROTACJI` przeczytany przed wchłonięciem** — jej sekcja „Poza zakresem" stawiała
  progi rotacji i rotację ryzyk poza zasięgiem („progi są skalibrowane, problem nie jest w liczbach";
  „rotacja ryzyk zadziałała poprawnie w PolyFlow"). Pomiar z PolyFlow pokazał, że oba wyłączenia były
  przedwczesne — stąd plan zamiast rozszerzenia karty odnogi.
- **Builder planu HTML** — `node .claude/relai/templates/HTML_PLAN/zbuduj.js` zakończony kodem **0**:
  „Osadzono 6 regul @font-face. Plik ma 239 KB", **zero** niewypełnionych znaczników.
- **Plan sprawdzony w przeglądarce, nie tylko zbudowany** `FAKT`: symulator na wartościach startowych
  (stan PolyFlow) daje rotację dziś **1 wpis / ok. 7 KB**, po poprawce **117 wpisów / 750 KB schodzi**,
  żywy plik **113 KB** — zgodne z pomiarem z sesji PolyFlow (117 wpisów, 749,6 KB, 113,3 KB). Przypadek
  brzegowy „nietykalne przekraczają próg" wykryty poprawnie po podniesieniu wagi nietykalnych do 200 KB.
  Zwijanie bloków: `aria-expanded` przechodzi `false → true → false`, klasa `otw` dokłada się i schodzi.
  Poziome przewijanie: **0 px** przy 1200×900 i przy 375×812; jedyne elementy poza kadrem to linki
  w pasku nawigacji, który ma własne `overflow-x:auto`. Żądań sieciowych brak — dwa trafienia `http://`
  to przestrzeń nazw SVG w `createElementNS`, nie zasób.

**Świadomie odłożone:**

- **Nie ruszam sekcji „Czeka na człowieka" tego repozytorium**, mimo że 9 z 10 jej pozycji byłoby po
  zmianie przeterminowanych. Reguła wieku powstaje w E3; stosowanie jej przed napisaniem byłoby
  rozstrzyganiem spraw człowieka bez mechanizmu, który to rozstrzyganie definiuje.
- **Nie rotuję `LEKCJE.md`**, choć jest 2,3 KB nad progiem. Rotacja należy do rytuału zamknięcia sesji,
  a nie do tury, w której powstaje plan o rotacji.

**Do zrobienia przez człowieka:**

- **Akceptacja planu HIGIENA_DOKUMENTOW** — do czasu zgody plan jest edytowalny; po akceptacji zmiany
  wyłącznie datowanymi aneksami (D-33).
- **Wartość `N` — po ilu dniach sprawa człowieka jest przeterminowana** (propozycja: 90 dni) oraz
  rozstrzygnięcie, czy przegląd spraw ma działać w projekcie z wyłączoną rotacją. Blokuje start E3.

### 2026-09-01 — Plan HIGIENA_DOKUMENTOW zaakceptowany z Aneksem A, E1 gotowy do startu

Autor: RelAI (Opus 5) + Lukasz

**Zrobione:**

- **Plan zaakceptowany** — status w `STATUS.md` i w `PLAN.html`: `ZAAKCEPTOWANY 2026-09-01 (Aneks A)`.
  Sekcje 1–9 planu są od teraz zamrożone; zmiany wyłącznie datowanymi aneksami (D-33).
- **Aneks A (2026-09-01)** dopisany do sekcji 10 `PLAN.html` — obie sprawy z sekcji 9, które blokowały
  start E3, rozstrzygnięte przez człowieka wraz z akceptacją:
  **`N = 30 dni`** (propozycja planu brzmiała 90 dni — wybór jest trzykrotnie ostrzejszy i wiążący)
  oraz **przegląd spraw działa także przy wyłączonej rotacji dokumentów**, co przesądza, że wyłącznik
  przeglądu jest osobny od wiersza `Rotacja dokumentów`.
- **`PROMPT_ETAP_1.md`** wygenerowany wg `SPEC_PROMPT_ETAPU.md` — dziewięć elementów w stałej
  kolejności, dziewięć pozycji do przeczytania, osiem punktów zakresu, dziesięć punktów weryfikacji,
  wszystkie 15 „Zasad aktywnych" przepisanych w całości. Zakres pokrywa cztery punkty wchłoniętej
  odnogi `BLOKADA_ROTACJI` plus przeliczenie linków w tym repozytorium i przeniesienie zmiany do obu
  adapterów.
- **Warunek startu E1 zapisany w prompcie:** etap wymaga dziennika PolyFlow sprzed rotacji
  (`--add-dir` na katalog projektu albo kopia z `git show HEAD~1:docs/DZIENNIK.md`). Bez tego materiału
  pierwszy punkt weryfikacji jest niewykonalny — zapisane wprost, zamiast udawać, że punkt nie istnieje.
- **`STATUS.md`**: E1 → `GOTOWY DO STARTU` z linkiem do promptu, sekcja „Bramki manualne" z dwiema
  pozycjami rozstrzygniętymi tego samego dnia, dwie linie w dzienniku wdrożenia.
- **`CLAUDE.md`** i **`docs/STATE.md`** — status planu i wartości z Aneksu A; adnotacje rozstrzygnięcia
  przy obu pozycjach sekcji „Czeka na człowieka".

**Zweryfikowane — jak dokładnie:**

- **Plan po dopisaniu aneksu nadal się buduje i renderuje** — sekcja 10 zawiera Aneks A, znaczników
  `{{…}}` w pliku **zero**, status w pasku i w metce zgodny (`ZAAKCEPTOWANY`), fraza `DO AKCEPTACJI`
  nie występuje już nigdzie w pliku (`grep -c` → 0).
- **Kolumna `Prompt` wskazuje istniejący plik** — `PROMPT_ETAP_1.md` jest w folderze planu, więc
  siatka bezpieczeństwa D-34 nie ma czego zgłaszać. Pozostałe etapy mają `—`, zgodnie z lazy-generacją.
- **Materiał pomiarowy dla E1 istnieje** `FAKT`: `C:\Users\Lukasz\Desktop\PolyFlow\docs\DZIENNIK.md`
  waży dziś 123 628 B (po rotacji z sesji porządkowej), a stan sprzed rotacji jest dostępny w historii
  gita tamtego repozytorium. Sprawdzone odczytem katalogu, nie założeniem.
- **Nie weryfikowano** zachowania mechanizmu po zmianie reguły — to jest zakres E1, nie tej tury.

**Świadomie odłożone:**

- **Wiersza `Przegląd spraw człowieka` w `docs/USTAWIENIA.md` nie zakładam.** Wartość jest
  rozstrzygnięta, ale ustawienie bez mechanizmu, który je czyta, jest martwym wpisem — powstaje w E3
  razem z implementacją. Zapis decyzji żyje w Aneksie A i w prompcie E1 jako granica zakresu.
- **Sekcji „Czeka na człowieka" tego repozytorium nadal nie przeglądam wiekiem.** Przy `N = 30 dni`
  przeterminowanych byłoby 9 z 10 pozycji — ale reguła powstaje w E3.

**Do zrobienia przez człowieka:**

- **Uruchomić E1 w świeżej sesji Opusa**, z dostępem do dziennika PolyFlow sprzed rotacji.

### 2026-09-01 — Zamknięcie sesji: Aneks B, rotacja „Lekcji zwiniętych", przegląd ryzyk

Autor: RelAI (Opus 5) + Lukasz

**Zrobione:**

- **Rotacja sekcji „Lekcje zwinięte" do archiwum** — `L-0025 … L-0054`, **30 lekcji**, do
  [docs/archiwum/lekcje/LEKCJE_L-0025_L-0054.md](archiwum/lekcje/LEKCJE_L-0025_L-0054.md),
  suma kontrolna `d7c16fc38575773e`. Żywy `docs/LEKCJE.md`: **52 260 → 16 906 B** (próg 50 KB).
  Operacja wykonana **za zgodą** — to krok kompresji z `SPEC_LEKCJE.md`, a nie rotacja, więc nie
  wolno jej robić po cichu.
- **Aneks B do planu HIGIENA_DOKUMENTOW** — zakres E4 rozszerzony o **progi sekcji wewnątrz
  dokumentu** („Lekcje zwinięte" 30 KB, „Stan otwartych ryzyk" 12 KB) oraz o **jawny katalog progów**,
  jakie RelAI zna. Powód wyszedł z tej samej sesji: plan w brzmieniu z dnia akceptacji pilnował progów
  dokumentów, więc E4 nie złapałby żadnego z tych dwóch.
- **Ryzyko R5 przepisane** — z „do obserwacji po 1.0.0" na stan faktyczny: mechanizm jest kompletny,
  ale nie broni się sam; dowody z dwóch projektów, wskazanie planu jako odpowiedzi. Komórka
  „Mitygacja" skrócona do stanu bieżącego, zgodnie z regułą z 1.6.0.
- **Plan i STATUS** doprowadzone do zgodności: status `ZAAKCEPTOWANY 2026-09-01 (Aneksy A, B)`
  w obu plikach, uwaga przy E4, dwie linie w dzienniku wdrożenia.

**Zweryfikowane — jak dokładnie:**

- **Dowód negatywny dwufazowości** (zasada 3, L-0007) `FAKT`: przebieg zatrzymany po fazie 1 — plik
  archiwum powstał, a suma kontrolna **całego żywego** `LEKCJE.md` przed i po fazie 1 jest ta sama
  (`e42f6ccac40d4d93`), rozmiar niezmieniony (52 260 B). Przycięcie nastąpiło dopiero po
  potwierdzeniu zgodności sum.
- **Sumy fragmentu zgodne w obie strony** `FAKT`: suma fragmentu w żywym pliku `d7c16fc38575773e`
  = suma treści odczytanej **z dysku** spod separatora `---` w pliku archiwum. Fragment: 35 564 B,
  30 nagłówków `### L-`.
- **Dowód obecności, nie tylko braku strat** (zasada 14) `FAKT`: w archiwum jest **30** lekcji,
  w żywym pliku zostało **8** pełnych (L-0055…L-0062) — razem 38, czyli tyle, ile było. Sekcja
  „Zasady aktywne" nietknięta: **15 pozycji** przed i po, przy twardym limicie 15. Nagłówek sekcji
  „Lekcje zwinięte" został na miejscu z linią-odsyłaczem pod spodem; w pliku są teraz **dwa**
  odsyłacze (do `L-0001…L-0024` i do `L-0025…L-0054`).
- **Progi na koniec sesji** `FAKT`: `LEKCJE.md` **16 906 B** przy progu 51 200 B; `DZIENNIK.md`
  **152 819 B** przy progu 153 600 B po dopisaniu tego wpisu — **781 B poniżej progu**, czyli nadal
  cisza; sekcja „Stan otwartych ryzyk" 3 846 B / 12 288 B; `STATE.md` 172 linie / 300 i 12 264 B przy
  progu cząstkowym 12 288 B (24 B zapasu); `CLAUDE.md` 4 180 B / 10 KB.
- **Plan po dopisaniu Aneksu B**: znaczników `{{…}}` w `PLAN.html` **zero**, status w metce
  `ZAAKCEPTOWANY 2026-09-01 (Aneksy A, B)`.
- **Nie weryfikowano** zachowania mechanizmów po zmianach z planu — żaden etap nie był wykonywany.

**Świadomie odłożone:**

- **Rotacji dziennika nie uruchamiam w tej turze.** Przed dopisaniem tego wpisu plik miał 149 114 B,
  po nim ma 152 819 B — w obu momentach **poniżej** progu 153 600 B, więc rotacja poprawnie milczy.
  Zapas wynosi jednak **781 B**: pierwszy wpis następnej sesji przekroczy próg i rotacja odpali przy
  jej zamknięciu. Zakres będzie wtedy zależał od reguły linku, którą zmienia E1 — czyli od etapu,
  który jest gotowy do startu.
- **Sekcji „Czeka na człowieka" nadal nie przeglądam wiekiem** — przy `N = 30 dni` przeterminowanych
  byłoby 9 z 10 pozycji, ale reguła powstaje w E3.

**Do zrobienia przez człowieka:**

- **Uruchomić E1 w świeżej sesji Opusa**, z dostępem do dziennika PolyFlow sprzed rotacji.

### 2026-09-01 — E1: rotacja rusza — link do najnowszego wystąpienia, przepięcie zamiast blokady, kierunek dziennika z dat

Autor: RelAI (Opus) + Lukasz

**Zrobione:**

- **`core/templates/SPEC_DZIENNIK.md`** — pozycja sekcji „Czeka na człowieka" linkuje do
  **najnowszego** wystąpienia sprawy zamiast do najstarszego; powód i liczby wypisane w treści,
  format pozycji po przepięciu na archiwum podany dosłownie. Sekcja „Rotacja": wpis linkowany
  **przestał być nietykalny**, a kolejność wpisów w pliku jest własnością projektu — mechanizmy
  ustalają ją z dat w nagłówkach. Przykład na końcu pliku przepisany tak, żeby pokazywał obie
  reguły naraz (sprawa wracająca w nowszym wpisie i sprawa, której wpis wjechał do archiwum).
- **`core/templates/SPEC_ARCHIWUM.md`** — nietykalność wpisu linkowanego zdjęta, w jej miejsce
  **przepięcie linku** jako krok 7 fazy 2 (przed zapisem żywego pliku), z liczeniem pozycji
  z martwym linkiem. Trzy nowe przypadki brzegowe: wpis linkowany wjeżdża do archiwum, kilka
  pozycji na jednym wpisie, link już przepięty. Nagłówek sekcji o blokadzie zmieniony, bo mówił
  o mechanizmie, którego już nie ma.
- **`core/process/session-signals.js`** — `ostatniWpis` ustala kierunek dziennika z **dat**
  w nagłówkach zamiast brać ostatni nagłówek w pliku; brak dat → zachowanie dotychczasowe i cisza.
  Funkcja wyeksportowana, żeby dała się sprawdzić testem.
- **Oba adaptery** — `adapters/claude-code/skills/relai-core/SKILL.md` (reguła linku, zniesienie
  blokady, przepięcie w fazie 2, „najstarszy" liczony z dat) oraz
  `adapters/cursor/rules/relai-core.mdc` (ta sama treść po angielsku).
- **`docs/DZIENNIK.md`** — przeliczone linki sekcji „Czeka na człowieka": sześć z dziewięciu
  pozycji otwartych wskazuje teraz nowszy wpis. Dwie pozycje rozstrzygnięte 2026-09-01 usunięte
  z sekcji zgodnie ze specyfikacją (decyzja użytkownika w tej sesji) — sekcja ma 9 pozycji,
  wszystkie otwarte.
- **`docs/fixy/BLOKADA_ROTACJI/ODNOGA.md`** — status `PRZENIESIONA 2026-09-01 → wchłonięta przez
  E1`, sekcja „Wynik" wypełniona. Karta zostaje (D-18).
- **Odnoga `REJESTR_ARTEFAKTOW`** — sygnał odchylenia z tego etapu: hook `profile-rules` żąda
  `docs/ARTEFAKTY.md` przy każdej zmianie artefaktu. Karta i prompt świeżej sesji w
  `docs/plany/HIGIENA_DOKUMENTOW/odnogi/REJESTR_ARTEFAKTOW/`, linia w sekcji „Odnogi" `STATUS.md`.

**Zweryfikowane — jak dokładnie:**

- **Pomiar obiema regułami w jednym przebiegu, na realnym materiale** (instrument
  `zakres-rotacji.js`, poza repozytorium; obie wersje reguły zaimplementowane wiernie).
  Dziennik PolyFlow sprzed rotacji z 2026-09-01 (`6a330c1^`, 127 wpisów, 880 437 B): zakres
  rotacji **starą regułą 0 wpisów**, **nową 117** `FAKT`. Drugi przekrój, migracja z 2026-08-21
  (`396e243`, 92 wpisy): **6** wobec **82** `FAKT`. Próg odbioru z karty odnogi („co najmniej
  50 wpisów") przechodzi na obu. Liczba 117 zgadza się z tym, co realna rotacja w PolyFlow
  osiągnęła po ręcznym rozbrojeniu blokerów — niezależne potwierdzenie.
- **Kontrola instrumentu** (zasada 5): przy pierwszym przebiegu 29 z 46 pozycji nie znalazło pary
  treściowej, a na dzienniku RelAI **żaden** z 9 linków nie trafił w żaden wpis — oba wyniki
  okazały się defektem instrumentu, nie materiału (klucz sprawy wymagał wytłuszczenia; tekst linku
  w RelAI ma przedrostek „wpis"). Po poprawkach: 6 z 46 bez pary w PolyFlow, 0 nietrafionych
  linków w RelAI. Liczby PolyFlow po poprawce instrumentu bez zmian (0 → 117).
- **`ostatniWpis` — osiem punktów, jeden przebieg** (`test-ostatni-wpis.js`, kod wyjścia 0):
  dziennik rosnący w dół, malejący, oba warianty z CRLF, plik z wpisem dopisanym na końcu wbrew
  kierunkowi, nagłówki bez dat (zachowanie dotychczasowe, bez błędu), brak wpisów (`null`) oraz
  **kontrola negatywna** — stara implementacja na dzienniku malejącym bierze wpis najstarszy
  (`### 2026-08-16 — Najstarszy`), czyli test naprawdę mierzy zmianę.
- **Na realnych plikach:** PolyFlow sprzed rotacji — stara implementacja brała wpis z 2026-08-26,
  nowa bierze 2026-09-01; przekrój 2026-08-21 — stara brała 2026-08-10, nowa 2026-08-21. Dziennik
  RelAI: obie wersje zwracają ten sam wpis, więc zmiana nie ruszyła projektu, który był poprawny.
- **Dowód negatywny dla przepięcia linku** (zasada 3): próba rotacji na kopii dziennika RelAI
  zatrzymana po fazie 1 (`proba-rotacji.js`, przebieg A) — plik archiwum powstał, sumy fragmentu
  w żywym pliku i w archiwum zgodne (`c0eb3e45a56ec88b`), a **żywy dziennik jest bajt w bajt ten
  sam** (`be82dd80911fa366` przed i po). Sekcja „Czeka na człowieka" **razem z linkami** ma
  identyczną sumę `7778abe251ee614d` — link nie został przepięty przed potwierdzeniem sumy.
- **Dowód obecności, nie tylko braku strat** (zasada 14): pełny przebieg na kopii (przebieg B)
  przeniósł 17 wpisów, przepiął **6 linków** na plik archiwum, a walidator kotwic zgłosił
  **0 pozycji z martwym linkiem** — sprawdzając kotwice także **w pliku archiwum**, nie tylko
  w żywym dzienniku. Treść pozycji bez linków identyczna (`eca3a8f0064f651f`).
- **Sekcja „Czeka na człowieka" w repozytorium:** 11 pozycji przed, 9 po (usunięte dwie
  rozstrzygnięte), **0 martwych linków** przed i po; treść pozycji bez linków identyczna
  (`eca3a8f0064f651f` przed i po przeliczeniu linków).
- **Obie specyfikacje mówią to samo** — przeczytane w jednym przebiegu tej sesji; przy okazji
  poprawiono zdanie w `SPEC_DZIENNIK.md`, które opisywało starą nietykalność w czasie
  teraźniejszym.
- **Zmiana weszła do obu adapterów:** `git grep -c "1.7.0"` daje trafienia w
  `core/templates/SPEC_DZIENNIK.md` (2), `core/templates/SPEC_ARCHIWUM.md` (3),
  `adapters/claude-code/skills/relai-core/SKILL.md` (3), `adapters/cursor/rules/relai-core.mdc` (2).
- **`node core/tools/validate-adapters.js`** — kod wyjścia **0**.
- **`git status --short`** — wyłącznie pliki z zakresu etapu plus nieśledzony
  `docs/AUDYT_2026-08-22.html`, który leżał tam przed tą sesją. Instrumenty pomiarowe i kopie prób
  stoją poza repozytorium.
- **Nie sprawdzono:** zachowania rotacji w świeżej sesji na realnym projekcie — przepięcie linku
  jest dziś regułą w dokumentach i przetestowanym przebiegiem na kopii, ale żadna sesja nie
  wykonała go w rytuale zamknięcia. Nie sprawdzono też adaptera Cursora w aplikacji po tej zmianie.

**Świadomie odłożone:**

- **Punkt weryfikacji z karty odnogi „pozycja `ryzyka` maleje po poprawce" — nie potwierdził się
  jako sformułowany.** Poprawka sprawia, że pomiar bierze **właściwy** wpis, a nie mniejszy: na
  przekroju 2026-08-21 właściwy wpis waży 9062 B wobec 6745 B dotąd branych. Kierunek zmiany
  zależy od długości wpisów projektu, nie od poprawki. Zapisane jako **L-0063**.
- **Ponowne przeliczenie linków w PolyFlow** — poza zakresem etapu (prompt dopuszczał tam wyłącznie
  odczyt materiału pomiarowego). Wchodzi do E6 razem z pomiarem na realnych projektach.
- **Lista blokerów w komunikacie rotacji i próg liczony ponad nietykalnymi** — to E2. Wymuszone
  pytanie o sprawy przeterminowane — E3. Podbicie wersji do 1.7.0 — E6. W dokumentach nie ma
  o nich ani jednej obietnicy.
- **Rozjazd kopii specyfikacji w `.claude/relai/templates/`** — hook odświeża ją z cache'u pluginu
  (1.6.1), więc do wydania 1.7.0 lokalna kopia niesie starą regułę linku. To znany skutek
  sekwencji wydania (P-005), nie usterka tego etapu.

**Do zrobienia przez człowieka:**

- **Odnoga [REJESTR_ARTEFAKTOW](archiwum/plany/HIGIENA_DOKUMENTOW/odnogi/REJESTR_ARTEFAKTOW/ODNOGA.md)** —
  czeka na świeżą sesję Opusa; prompt jest gotowy.
- **Pozycja „Decyzja o formalnym zamrożeniu planu ROZWOJ_PO_WYDANIU" wygląda na rozstrzygniętą** —
  `STATUS.md` tamtego planu niesie `ZAMROŻONY 2026-08-21`. Zamknięcie pozycji jest decyzją
  człowieka, więc zostaje otwarta; jedno „tak" zdejmuje ją z sekcji.

### 2026-09-01 — E2: blokada mówi, a próg liczy się ponad nietykalnymi

Autor: RelAI (Opus) + Lukasz

**Zrobione:**

- **`core/templates/SPEC_ARCHIWUM.md`, nowa sekcja „Próg liczony ponad nietykalnymi"** — dokument
  ma trzy wagi podawane zawsze razem z progiem: **waga całkowita = część rotowalna + dolna granica
  osiągalna**. Wyzwalacz zostaje na wadze całkowitej (cisza poniżej progu nienaruszalna), a **cel
  przenosi się na część rotowalną**: bierzesz najstarsze pozycje, aż **ona** zejdzie poniżej 60%
  progu. Rozpisane dla dziennika, lekcji i ryzyk; tabela z trzema realnymi pomiarami.
- **`core/templates/SPEC_ARCHIWUM.md`, nowa sekcja „Komunikat zablokowanej rotacji"** — kształt
  czterech części w stałej kolejności (stan zakresu → cztery liczby → pary „pozycja → wpis"
  z wiekiem w dniach i liczbą wpisów przepuszczanych przez zamknięcie → ile odblokowuje pierwsza,
  ile wszystkie), limit pięciu blokerów po dwie pozycje, tabela realnych powodów blokady po 1.7.0
  i **dwa przykłady brzmienia wygenerowane z realnych plików**. Skąd wiek pozycji: z adnotacji,
  a gdy jej nie ma — z daty wpisu; brak obu znaczy pozycję bez wieku, nie pominiętą.
- **Trzy przypadki brzegowe zgrane z powyższym** — „cały zakres nietykalny", „mniej niż dziesięć
  wpisów" i „pozycja `ryzyka` ponad progiem bez zamkniętych ryzyk" mówią teraz **tym samym**
  językiem progu i dolnej granicy; dołożony czwarty: „rotacja wzięła wszystko, a dolna granica
  i tak przekracza próg". Sekcja „Zakazy" dostała trzy pozycje: zakaz milczenia powyżej progu,
  zakaz podawania progu bez pozostałych trzech liczb i zakaz wymieniania wpisu linkowanego wśród
  blokerów (od 1.7.0 nie blokuje).
- **Oba adaptery** — `adapters/claude-code/skills/relai-core/SKILL.md` (sekcja „Rotacja
  dokumentów") i `adapters/cursor/rules/relai-core.mdc` (punkt 2 „Session close ritual", po
  angielsku): sposób liczenia progu i kształt komunikatu wypisane w treści, bo procedura rotacji
  mieszka w treści skilla (L-0011).
- **Rozstrzygnięcie granicy wobec kodu (punkt zakresu, nie dowolność): `session-signals.js`
  zostaje bez zmian.** `startCost` i `startCostReport` liczą **budżet startu sesji** (sześć pozycji
  wobec 80 KB), a nie progi rotacji; komunikat blokady wymaga wyznaczonego zakresu, sparsowanych
  pozycji i ich wieku — czyli wyniku rotacji, którego hook startu nie ma. Komunikat pisze **model**
  w kroku 2 rytuału zamknięcia i tak jest zapisany w obu adapterach. Kodu na zapas nie dołożono.

**Zweryfikowane — jak dokładnie:**

- **Obie wersje komunikatu w jednym przebiegu, wygenerowane przez instrument** (`prog-i-blokada.js`,
  poza repozytorium; stara reguła 1.6.1 i nowa E2 zaimplementowane obok siebie). Sześć przypadków
  na realnych plikach `FAKT`:
  - dziennik PolyFlow sprzed migracji do 1.6.1 (`396e243^`, 97 wpisów, projekt sprzed 1.6.0):
    stary komunikat **0 znaków**, nowy wypisuje 34 blokery i liczby — rotacja bierze **2 z 87**
    wpisów rotowalnych, **85 stoi (453,8 KB)**. To jest dowód, po co ten etap był.
  - dziennik RelAI z 2026-08-17 (`50b3a45`, sprzed odblokowania rotacji): stary **0 znaków**,
    nowy — 13 blokerów, **3 z 19** wpisów przechodzi, 16 stoi (107,6 KB), pozycje otwarte od 25 dni.
  - dziennik PolyFlow po rotacji (10 wpisów) przy progu 100 KB: stary „nie ma czego przenieść",
    nowy — cztery liczby plus zdanie o dolnej granicy.
- **Cztery liczby na dwóch dokumentach** (próg 150 KB): `docs/DZIENNIK.md` tego repozytorium —
  całkowita **156,7 KB**, rotowalna **104,6 KB**, dolna granica **52,1 KB**, rotacja bierze 18 z 18;
  dziennik PolyFlow sprzed rotacji — **859,8 / 748,2 / 111,5 KB**, rotacja bierze 117 ze 117.
- **Przypadek „sama dolna granica przekracza próg" pokazany na danych:** dziennik PolyFlow po
  rotacji, 10 wpisów, waga całkowita **115,9 KB** = rotowalna **0 KB** + dolna granica **115,9 KB**
  przy progu 100 KB. Treść raportu wypisana i przepisana do specyfikacji jako drugi przykład.
- **Dowód negatywny ciszy poniżej progu** (zasada 3): **ten sam plik** przy progu 150 KB —
  `komunikatNowy().length === 0` i `komunikatStary().length === 0`, wypisane jako `""`, kod wyjścia
  **0**. Przy progu 100 KB ten sam plik daje 363 znaki, więc cisza jest funkcją progu, a nie
  martwej gałęzi.
- **Kontrola instrumentu** (zasada 5): rozkład pozycji „Do zrobienia przez człowieka" wypisany dla
  każdego pliku — RelAI 63 pozycje (13 rozstrzygniętych, 35 wyprowadzonych, 3 puste, 12 otwartych),
  PolyFlow sprzed rotacji 200 (21/29/0/150), PolyFlow sprzed migracji 123 (11/0/0/112). Zero
  trafień nie wystąpiło nigdzie, a projekt z sekcją „Czeka na człowieka" daje **0 blokerów** mimo
  otwartych pozycji — czyli instrument rozpoznaje regułę z E1, a nie tylko liczy myślniki.
- **Trzy dokumenty przeczytane w jednym przebiegu tej sesji** (`SPEC_ARCHIWUM.md`, `SKILL.md`,
  `relai-core.mdc`): ta sama kolejność czterech liczb, ten sam wyzwalacz, ten sam cel na części
  rotowalnej, te same cztery części komunikatu, ten sam warunek par „pozycja → wpis".
- **`git grep -c`** po frazach nowej reguły: „dolna granica osiągalna / lowest reachable floor" —
  `SPEC_ARCHIWUM.md` 8, `SKILL.md` 1, `relai-core.mdc` 1; „część rotowalna / rotatable part" —
  12 / 2 / 2; „pozycja → wpis / item → entry" — 2 / 1 / 1.
- **`node core/tools/validate-adapters.js`** — kod wyjścia **0** („spojne", wersja 1.6.1 z trzech
  źródeł).
- **`git status --short`** — wyłącznie pliki z zakresu etapu plus nieśledzony
  `docs/AUDYT_2026-08-22.html`, który leżał tam przed sesją. Instrument i kopie dzienników stoją
  poza repozytorium (`%TEMP%\relai-e2`).
- **Nie sprawdzono:** zachowania komunikatu w świeżej sesji realnego projektu — kształt jest dziś
  regułą w trzech dokumentach i wynikiem instrumentu, ale żadna sesja nie napisała go w rytuale
  zamknięcia. Wchodzi do E6 razem z pomiarem na realnych projektach. Nie sprawdzono też adaptera
  Cursora w aplikacji po tej zmianie.

**Świadomie odłożone:**

- **Rotacja dziennika tego repozytorium** — plik jest ponad progiem (156,7 KB przy 150 KB) i miałby
  18 wpisów do przeniesienia, ale rotacja należy do rytuału zamknięcia sesji, nie do zakresu etapu.
  Prompt wymieniał to wprost jako poza zakresem.
- **Liczba „160,4 KB" w `STATE.md`** była rozmiarem w bajtach podanym jako kilobajty; poprawiona
  przy okazji aktualizacji obszaru rotacji, bo ten sam akapit i tak był przepisywany.
- **Rejestr `docs/ARTEFAKTY.md`** — hook `profile-rules` upomniał się o niego przy każdej zmianie
  specyfikacji. To odnoga **REJESTR_ARTEFAKTOW** z E1, nadal `OTWARTA`; przy okazji etapu jej nie
  robimy.
- **Druga linia raportu startu, progi cząstkowe i katalog progów** — E4. Wymuszone pytanie o sprawy
  przeterminowane — E3. Rotacja ryzyk i ustawień — E5. Podbicie wersji do 1.7.0 — E6. W dokumentach
  nie ma o nich żadnej obietnicy.

**Do zrobienia przez człowieka:**

- **Odnoga [REJESTR_ARTEFAKTOW](archiwum/plany/HIGIENA_DOKUMENTOW/odnogi/REJESTR_ARTEFAKTOW/ODNOGA.md)** —
  nadal czeka na świeżą sesję Opusa; prompt gotowy od E1.
  *(rozstrzygnięte 2026-09-01 — odnoga wykonana i ZAMKNIĘTA, `docs/ARTEFAKTY.md` istnieje)*

### 2026-09-01 — Odnoga REJESTR_ARTEFAKTOW: rejestr, którego wymagał profil `prompty`

Autor: RelAI (Opus) + Lukasz

**Zrobione:**

- **Powstał [`docs/ARTEFAKTY.md`](ARTEFAKTY.md)** wg `SPEC_PROFILE.md`, sekcja „Profil prompty" —
  **38 pozycji** w pięciu tabelach: 22 specyfikacje z `core/templates/`, szablon planu HTML jako
  jeden artefakt złożony, 10 komend, 2 skille, 3 reguły Cursora. Sześć kolumn wymaganych przez
  specyfikację: artefakt · plik · wersja · data · co się zmieniło · po co. Hooki, guardraile
  i walidator do rejestru **nie wchodzą** — są nośnikiem, nie instrukcją czytaną przez model.
- **Rejestr liczy od 2026-09-01, co jest w nim napisane wprost.** Wszystkie pozycje mają wersję `1`;
  daty pochodzą z `git log --diff-filter=A --follow`, a kolumna „co się zmieniło" niesie datę
  ostatniej zmiany z gita, żeby było widać, które artefakty żyją. Historii wersji sprzed rejestru
  nie odtwarzano.
- **Rozbieżność liczb wypisana jawnie, nie ukryta.** Karta odnogi i hook `session-context` mówiły
  o **31 specyfikacjach**; na dysku plików `.md` w `core/templates/` jest **22** (21 × `SPEC_*`
  + `README`). 31 to liczba **plików** kopii w `.claude/relai/templates/` razem z dziewięcioma
  z `HTML_PLAN/` (22 + 9). Rejestr trzyma się stanu z dysku.
- **`ODNOGA.md` → ZAMKNIĘTA**, sekcja „Wynik" wypełniona; linia odnogi w
  [STATUS.md](archiwum/plany/HIGIENA_DOKUMENTOW/STATUS.md) planu HIGIENA_DOKUMENTOW zaktualizowana. Tabeli
  etapów i dziennika wdrożenia nie ruszano — plan jest zamrożony (D-33).

**Zweryfikowane — jak dokładnie:**

- **Hook `profile-rules`, obie wersje w jednym przebiegu** (zasada 4 z „Zasad aktywnych"). Hook
  wywołany na **39 ścieżkach artefaktów** przy dwóch katalogach roboczych różniących się wyłącznie
  obecnością rejestru: **bez `ARTEFAKTY.md` — 33 ostrzeżenia, z rejestrem — 0**. To jest dowód
  efektu, nie zdarzenia: ta sama lista, ta sama komenda, jedna różnica.
- **Cisza przy sześciu pozycjach w wariancie „bez" jest defektem hooka, nie zasługą rejestru.**
  `jestArtefaktem()` przepuszcza tylko `.md|.txt|.prompt|.tmpl|.j2` i wyklucza każdy `README.md`,
  więc trzy reguły Cursora (`.mdc`), dwa pliki `HTML_PLAN/*.html` i `core/templates/README.md` nie
  wyzwolą reguły profilu nigdy. Zero trafień przy niepustym zbiorze sprawdzone na instrumencie,
  zanim uznano je za wynik.
- **Inwentarz komendą, nie okiem:** `ls core/templates/*.md | wc -l` → 22,
  `find core/templates/HTML_PLAN -type f` → 9, komendy → 10, skille → 2, `.mdc` → 3. Liczby
  w rejestrze zgadzają się z tymi z dysku; przelicznik 38 = 22 + 1 + 10 + 2 + 3 stoi w dokumencie.
- **`node core/tools/validate-adapters.js` → kod 0**, komunikat „spojne", wersja `1.6.1` z trzech
  źródeł.
- **`git status --short`** pokazuje `docs/ARTEFAKTY.md` oraz `docs/AUDYT_2026-08-22.html` — ten
  drugi był nieśledzony **przed** tą sesją i nie został tknięty.

**Świadomie odłożone:**

- **Zmiana `jestArtefaktem()` w `profile-rules.js`**, żeby obejmowała `.mdc`, `.html` szablonu planu
  i `README` katalogu specyfikacji. Poza zakresem odnogi (zakres opisuje stan, nie poprawia
  narzędzi), a hook jest artefaktem-nośnikiem, którego zmiana wymaga własnego pomiaru.
- **Rozstrzygnięcie nazwy katalogu archiwum artefaktów.** `SPEC_PROFILE.md` **i `CLAUDE.md`** mówią
  `docs/archiwum/artefakty/`; `artefaktow/` stało wyłącznie w karcie i prompcie tej odnogi.
  *(sprostowanie 2026-09-01 — pierwsza wersja tego wpisu przypisała `artefaktow/` plikowi
  `CLAUDE.md`; sprawdzone grepem: linia 50 ma `artefakty`)*. Katalog nie istnieje (D-11), więc
  dziś nic się nie zepsuło. *(rozstrzygnięte 2026-09-01 — decyzja: `artefakty`)*
- **Progi i rotacja rejestru** — `ARTEFAKTY.md` nie wchodzi do warstwy startowej sesji ani do
  budżetu; katalog progów jest zakresem E4 planu HIGIENA_DOKUMENTOW (Aneks B).

**Do zrobienia przez człowieka:**

- **Wybrać nazwę katalogu archiwum artefaktów** — `artefakty` czy `artefaktow`. Wybór trzeba nanieść
  na przegraną stronę, zanim powstanie pierwsza datowana kopia artefaktu.
  *(rozstrzygnięte 2026-09-01 — `artefakty`; poprawione w karcie i prompcie odnogi)*
- **Zdecydować, czy `profile-rules` ma widzieć `.mdc` i `.html`.** Dziś sześć z 39 artefaktów jest
  poza zasięgiem reguły profilu; rejestr je zna, ale hook o ich zmianie nie przypomni.
  *(rozstrzygnięte 2026-09-01 — `.mdc` wchodzi do `jestArtefaktem()`; `.html` szablonu planu
  i `core/templates/README.md` zostają poza zasięgiem świadomie)*

### 2026-09-01 — Zamknięcie sesji: pierwsza rotacja regułą 1.7.0 na własnym dzienniku

Autor: RelAI (Opus) + Lukasz

**Zrobione:**

- **Rotacja dziennika, przebieg dwufazowy z sumą kontrolną.** Przeniesione **3 wpisy** z 2026-08-12
  do [DZIENNIK_2026-08-12_2026-08-12.md](archiwum/dziennik/DZIENNIK_2026-08-12_2026-08-12.md)
  (26,5 KB), suma kontrolna `b4601365eee25163`. Żywy dziennik: **168,0 → 142,2 KB**, 30 → 27 wpisów,
  cztery linie-odsyłacze zamiast trzech.
- **Rotacja poszła regułą 1.7.0 z `core/templates/SPEC_ARCHIWUM.md`, nie 1.6.1 z kopii
  w projekcie** — decyzja człowieka podjęta w tej sesji po pokazaniu obu wyników. Powód rozjazdu:
  `.claude/relai/templates/` niesie wersję z **zainstalowanego pluginu 1.6.1** (26,7 KB), a repo ma
  po E1/E2 wersję 1.7.0 (38,8 KB), która nie jest jeszcze wydana. To pierwsze realne użycie reguł
  z E1 i E2 w sesji, a nie na kopii pliku.

**Zweryfikowane — jak dokładnie:**

- **Trzy wagi policzone przed rotacją** wg sekcji „Próg liczony ponad nietykalnymi": waga całkowita
  **168,0 KB**, część rotowalna **115,8 KB**, dolna granica osiągalna **52,2 KB**, próg 150 KB,
  cel 60% = 90 KB. Po rotacji część rotowalna **89,7 KB** — cel osiągnięty przy **3** wpisach.
- **Cel na części rotowalnej zmienia wynik i to jest sedno E2.** Ta sama rotacja liczona po staremu
  (cel na całym pliku) brałaby 15 wpisów, a w wersji 1.6.1 z blokadą linku — 5 wpisów, kończąc na
  128,4 KB, czyli **nie osiągając celu w ogóle**. Reguła 1.7.0 wzięła **mniej** i skończyła
  z celem spełnionym; różnica jest w tym, do czego się porównuje, nie w tym, co jest chronione.
- **Faza 1 przed fazą 2, sumy porównane po odczycie z dysku:** suma fragmentu w żywym pliku
  `b4601365eee25163` = suma treści spod separatora w archiwum. Dopiero po zgodności ruszyło
  przycięcie.
- **Dowód obecności i nieobecności** (nie tylko „nic nie zginęło"): nowa linia-odsyłacz z sumą jest
  w pliku, a pierwsze 200 znaków przeniesionego fragmentu **nie występuje** już w żywym dzienniku.
- **Przepięcie linków nie było potrzebne w tym przebiegu** — pozycje sekcji „Czeka na człowieka"
  linkują do wpisów nr 6, 12, 16, 22 i 23, a zakres objął wpisy 1–3. Mechanizm przepinania z E1
  nadal czeka na przebieg, w którym coś realnie przepnie.
- **Instrument dopasowujący kotwice sprawdzony, zanim uwierzono w wynik.** Pierwsza wersja dała
  **0 dopasowań przy 9 kotwicach** — zwijała podwójne myślniki w kotwicy. Po naprawie: 9 kotwic,
  5 unikalnych, **5 dopasowanych, 0 bez pary**, plus przypadek kontrolny, który musiał trafić
  (trafił we wpis nr 12).
- **Progi, które milczą, sprawdzone i ciche:** sekcja ryzyk **3,8 KB** przy progu cząstkowym 12 KB
  i **zero** ryzyk `ZAMKNIĘTE` → nie rotuje. `LEKCJE.md` **20,6 KB / 11 lekcji** przy progach
  50 KB / 40 → nie rotuje. „Zasady aktywne" **15 pozycji przy limicie 15** → w limicie.
  `STATE.md` 197 linii przy progu 300.
- **`node core/tools/validate-adapters.js` → kod 0.**

**Świadomie odłożone:**

- **Wyrównanie `.claude/relai/templates/` do repo.** Kopia specyfikacji w projekcie zostaje na
  1.6.1, bo odświeża ją hook z cache'u pluginu; wyrówna ją dopiero wydanie 1.7.0 (E6, sekwencja
  P-005). Do tego czasu każda sesja czytająca specyfikacje z kopii dostanie stare reguły rotacji.

**Do zrobienia przez człowieka:**

- **Rozstrzygnąć, którą kopią specyfikacji ma się kierować sesja do czasu wydania 1.7.0.** Dziś
  rozjazd wykryło porównanie zrobione ręcznie; nic go nie zgłasza samo.

### 2026-09-01 — Dwie bramki z odnogi zamknięte: `.mdc` w regule profilu i nazwa `artefakty`

Autor: RelAI (Opus) + Lukasz

**Zrobione:**

- **`adapters/claude-code/hooks/profile-rules.js`, `jestArtefaktem()` widzi `.mdc`.** Reguła
  adaptera Cursora jest czytana przez model jak skill, więc jest artefaktem; do tej pory trzy
  reguły `.mdc` nie wyzwalały reguły profilu ani razu. Jedna pozycja we wzorcu rozszerzeń, komentarz
  z powodem i datą pomiaru.
- **Nazwa katalogu archiwum artefaktów rozstrzygnięta: `artefakty`.** `CLAUDE.md` i
  `SPEC_PROFILE.md` miały ją już poprawnie; `artefaktow/` stało wyłącznie w karcie i prompcie odnogi
  REJESTR_ARTEFAKTOW — poprawione w obu (3 wystąpienia).
- **Sprostowanie wpisu z tej samej sesji.** Wcześniejszy wpis przypisał wariant `artefaktow/`
  plikowi `CLAUDE.md`. To nieprawda: `CLAUDE.md:50` ma `artefakty`. Adnotacja sprostowania stoi przy
  pierwotnym zdaniu, treść nie została skasowana (D-18).

**Zweryfikowane — jak dokładnie:**

- **Hook przemierzony tym samym instrumentem co przed zmianą, obie wersje w jednym przebiegu:**
  39 ścieżek, dwa katalogi robocze różniące się wyłącznie obecnością rejestru. Bez rejestru
  **36 ostrzeżeń** (przed zmianą: 33 — przybyły dokładnie trzy `.mdc`), z rejestrem **0**.
- **Trzy pozycje nadal poza zasięgiem i to jest świadome:** `core/templates/HTML_PLAN/szablon.html`,
  `komponenty.html` oraz `core/templates/README.md` — decyzja dotyczyła `.mdc`, nie ich.
- **Stan nazw sprawdzony grepem po całym repozytorium**, nie okiem: po poprawce `artefaktow` nie
  występuje w żadnym pliku poza adnotacjami historycznymi w tym dzienniku.
- **`node core/tools/validate-adapters.js` → kod 0.**

**Świadomie odłożone:**

- **`.html` szablonu planu i `README` katalogu specyfikacji w regule profilu.** Oba są artefaktami
  w rejestrze, ale hook o ich zmianie nie przypomni; `README.md` jest dodatkowo wykluczony wprost,
  bo w zwykłym projekcie to plik rdzenia, a nie artefakt.

**Do zrobienia przez człowieka:**

- —

### 2026-09-01 — Osiem bramek z listy zamkniętych, plan ROZWOJ_PO_WYDANIU zamrożony formalnie

Autor: RelAI (Opus) + Lukasz

**Zrobione:**

- **Sekcja „Czeka na człowieka" zeszła z 10 pozycji do 3.** Zamknięte decyzją człowieka w tej
  turze, każda z brzmieniem z zamkniętej listy i adnotacją przy pozycji we wpisie źródłowym:
  - **`claude /login`** → *anulowane*. Razem z pozycją **anulowana odnoga `POMIAR_ODNOG`** —
    login był jej jedynym warunkiem startu.
  - **Okno na `/relai-update` dla JiraManagera i PolyFlow** → *rozstrzygnięte*: PolyFlow przeszedł
    2026-08-21, a JiraManager **przeszedł adopcję poza sesjami tego repozytorium**. Okno nie jest
    już potrzebne.
  - **Feedback od osoby spoza projektu** → *anulowane*; kryterium akceptacyjne planu zostaje
    niespełnione świadomie.
  - **Los `ProbaCursorE6`** → *rozstrzygnięte*: projekt idzie do kasacji. **Katalogu nie usuwam** —
    trwałe kasowanie danych należy do człowieka.
  - **Ścieżka B w `README.md` oczami cursorowca** → *anulowane*.
  - **Formalne zamrożenie planu ROZWOJ_PO_WYDANIU** → *zaakceptowane*. Stan „ZAMROŻONY 2026-08-21"
    stał w trzech dokumentach od 2026-08-21, ale jawnej zgody nie było; teraz jest, i stoi
    w nagłówku `STATUS.md` planu.
  - **Którą kopią specyfikacji kierować się do wydania 1.7.0** → *rozstrzygnięte*: `core/templates/`
    z repozytorium. Zamrożone jako **D-87**.
- **`docs/DECYZJE.md` — nowa decyzja D-87**: w repozytorium RelAI źródłem prawdy o specyfikacjach
  jest `core/templates/`, nie kopia `.claude/relai/templates/`. Decyzja dotyczy **wyłącznie tego
  repozytorium** — w projekcie użytkownika kopia zostaje jedynym źródłem (L-0012).
- **Osiem rozstrzygnięć z E2 wypisane co do jednego** — pozycja weryfikacyjna została w sekcji,
  ale ma już konkretną treść do potwierdzenia zamiast odsyłacza do „siedmiu adnotacji".

**Zweryfikowane — jak dokładnie:**

- **Liczba rozstrzygnięć z E2 policzona z diffa, nie z pamięci:** porównanie `ecd2f82` z rodzicem
  po adnotacjach z zamkniętej listy rdzeni daje **osiem** nowych, nie siedem. Wpis z 2026-08-20
  mówił „7 kolejnych" — ósma to zgoda udzielona w tej samej sesji (odchudzenie „Zasad aktywnych"),
  więc prawdopodobnie nie liczono jej razem z rozstrzygnięciami wziętymi z repozytorium.
- **Stan pre-commita sprawdzony, nie założony:** `.git/hooks/pre-commit` w tym repozytorium
  **nie istnieje**. Obie pozycje pre-commita zostają otwarte — instalacja tutaj i ponowna
  instalacja tam, gdzie hook stoi od wcześniej.
- **Kotwice sekcji po przycięciu:** 3 pozycje, 3 kotwice, **3 dopasowane, 0 bez pary**, przypadek
  kontrolny trafia.
- **Limit komórki „Mitygacja"** po dopisaniu anulowania do R2: sprawdzony komendą, wszystkie
  cztery ryzyka poniżej 800 znaków.
- **`node core/tools/validate-adapters.js` → kod 0.**

**Świadomie odłożone:**

- **Instalacja pre-commita w tym repozytorium.** Wyjaśniona co do komendy, ale nie wykonana —
  to jawna czynność człowieka i pozostaje jego decyzją, tak jak chce sam instalator.

**Do zrobienia przez człowieka:**

- **Usunąć katalog projektu `ProbaCursorE6`** — decyzja zapadła, kasowania nie wykonuję.
- **Potwierdzić albo cofnąć osiem rozstrzygnięć z E2** wypisanych w tej turze; sprzeciw przy
  którymkolwiek zawraca sprawę do sekcji „Czeka na człowieka".

### 2026-09-01 — Pre-commit zainstalowany w trzech repozytoriach i zmierzony w każdym

Autor: RelAI (Opus) + Lukasz

**Zrobione:**

- **Gitowy pre-commit ze skanem sekretów zainstalowany w trzech repozytoriach:** RelAI,
  JiraManager i PolyFlow. Do `.git/hooks/` każdego trafiły dwa pliki — `pre-commit` i własna kopia
  `relai-secret-scan.js`. Żaden projekt nie miał wcześniej **jakiegokolwiek** hooka `pre-commit`,
  więc instalator niczego nie nadpisał.
- **Guardrail działa teraz poza Claude i Cursorem** — commit z kluczem zatrzyma się także wtedy,
  gdy pójdzie z terminala albo z IDE. To była ostatnia warstwa, której w tych projektach brakowało.
- **Sprawa „ponowna instalacja tam, gdzie hook już stoi" okazała się bezprzedmiotowa** i została
  anulowana — patrz „Zweryfikowane".
- **Los `ProbaCursorE6` rozstrzygnięty faktem, nie decyzją:** katalog projektu już nie istnieje.
  Zostały wyłącznie metadane sesji poza repozytorium, wypisane użytkownikowi do samodzielnego
  usunięcia.

**Zweryfikowane — jak dokładnie:**

- **Każda instalacja zmierzona na dwóch wariantach indeksu w jednym przebiegu.** Indeks z próbką
  klucza `sk-ant-api03-…` → hook kończy się **kodem 1** i komunikatem „commit ZATRZYMANY", bez
  cytowania wartości; ten sam hook na indeksie bez sekretu → **kod 0**. Wynik identyczny w RelAI,
  JiraManagerze i PolyFlow.
- **Próbka składana w czasie wykonania** (L-0046) — w żadnym pliku repozytorium nie stoi ciąg
  wyglądający jak klucz. Plik próbny powstawał i znikał w tej samej komendzie.
- **Praca w toku nietknięta:** oba projekty miały **0 plików w indeksie** przed próbą i **0 po
  niej**; PolyFlow ma osiem zmodyfikowanych plików w katalogu roboczym, żadnego nie ruszono.
  Hook wołany wprost, a nie przez `git commit` — ten sam kod, zero ryzyka wpisu do historii.
- **Trzy kopie są identyczne, nie „podobne":** `sha256sum` na `pre-commit`
  (`d79908ef859d59e3…`) i `relai-secret-scan.js` (`066b5ed1ad484cf5…`) daje tę samą parę sum
  w trzech repozytoriach.
- **Sprawa ponownej instalacji zamknięta pomiarem, nie domysłem:** `find` po całym
  `C:\Users\Lukasz` (głębokość 5) za `relai-secret-scan.js` w katalogach hooków dał **jedno**
  trafienie — świeżo zainstalowane w RelAI. Starych instalacji, do których poprawka 1.5.1 miałaby
  nie dotrzeć, nie ma.
- **`ProbaCursorE6`:** katalogu nie ma ani na pulpicie, ani nigdzie w katalogu użytkownika do
  głębokości 4. Istnieją tylko `~/.claude/projects/C--Users-Lukasz-Desktop-ProbaCursorE6`,
  `~/.claude/session-data/2026-08-17-ProbaCursorE6-session.tmp` oraz
  `~/.cursor/projects/C-Users-Lukasz-Desktop-ProbaCursorE6`.

**Świadomie odłożone:**

- **Instalacja w pozostałych repozytoriach na pulpicie.** Jest ich kilkadziesiąt; decyzja dotyczyła
  trzech projektów prowadzonych przez RelAI.

**Do zrobienia przez człowieka:**

- **Usunąć metadane sesji `ProbaCursorE6`** — trzy ścieżki wypisane wyżej. Trwałego kasowania nie
  wykonuję.
- **Potwierdzić albo cofnąć osiem rozstrzygnięć z E2** — jedyna pozycja, jaka została w sekcji
  „Czeka na człowieka".

### 2026-09-01 — Zamknięcie dnia: druga rotacja i bilans sesji

Autor: RelAI (Opus) + Lukasz

**Zrobione:**

- **Druga rotacja dziennika tego samego dnia**, tym samym mechanizmem co pierwsza: 3 wpisy
  (2026-08-12 … 2026-08-17) do
  [DZIENNIK_2026-08-12_2026-08-17.md](archiwum/dziennik/DZIENNIK_2026-08-12_2026-08-17.md),
  23,7 KB, suma kontrolna `1690be9b08748504`. Żywy dziennik **153,7 → 130,6 KB**, 31 → 28 wpisów,
  piąta linia-odsyłacz w sekcji „Wpisy".
- **Bilans całej sesji:** rejestr artefaktów powstał, odnoga REJESTR_ARTEFAKTOW zamknięta,
  osiem bramek człowieka rozstrzygniętych, pre-commit zainstalowany w trzech repozytoriach,
  plan ROZWOJ_PO_WYDANIU zamrożony formalnie, odnoga POMIAR_ODNOG anulowana, decyzja D-87
  zamrożona. Sekcja „Czeka na człowieka": **10 → 1 pozycja**.

**Zweryfikowane — jak dokładnie:**

- **Trzy wagi przed rotacją:** waga całkowita **153,7 KB**, część rotowalna **105,0 KB**, dolna
  granica osiągalna **48,7 KB**, próg 150 KB, cel 60% = 90 KB. Po rotacji część rotowalna
  **81,7 KB** — cel osiągnięty przy trzech wpisach z 21 kandydatów.
- **Faza 1 przed fazą 2:** suma fragmentu w żywym pliku `1690be9b08748504` = suma treści spod
  separatora odczytanej **z dysku**. Przycięcie ruszyło dopiero po zgodności.
- **Przepięcie linków sprawdzone i niepotrzebne** — jedyna pozycja sekcji wskazuje wpis
  z 2026-09-01, a przenoszone były trzy wpisy z 12–17 sierpnia; kontrola dała **0 kolizji**.
  Mechanizm z E1 nadal czeka na przebieg, w którym coś realnie przepnie.
- **Dowód obecności i nieobecności:** nowa linia-odsyłacz z sumą jest w pliku, a pierwsze
  200 znaków przeniesionego fragmentu **nie występuje** już w żywym dzienniku.
- **Kotwica sekcji po przycięciu nadal trafia** — 1 kotwica, 1 dopasowanie, 0 bez pary, przypadek
  kontrolny trafia.
- **Progi, które milczą:** „Zasady aktywne" **15 / 15** — w limicie. `LEKCJE.md` 20,6 KB / 11 lekcji
  przy progach 50 KB / 40. Sekcja ryzyk **3,9 KB** przy progu cząstkowym 12 KB i **zero** ryzyk
  `ZAMKNIĘTE` → nie rotuje. `STATE.md` 208 linii przy progu 300.
- **`node core/tools/validate-adapters.js` → kod 0.**

**Świadomie odłożone:**

- **Push pięciu commitów tej sesji** — użytkownik prosił o commity, nie o wypchnięcie.
- **Wydanie 1.7.0** — reguły rotacji z E1 i E2 działają w repozytorium, ale zainstalowany plugin
  nadal niesie 1.6.1. Należy do E6 planu HIGIENA_DOKUMENTOW.

**Do zrobienia przez człowieka:**

- **Potwierdzić albo cofnąć osiem rozstrzygnięć z E2** — jedyna otwarta pozycja.
- **Usunąć metadane sesji `ProbaCursorE6`** — trzy ścieżki w poprzednim wpisie.

### 2026-09-01 — E3: sprawa przeterminowana wymusza decyzję

Autor: RelAI (Opus) + Lukasz

**Zrobione:**
- `core/templates/SPEC_USTAWIENIA.md` — czwarty wiersz czytany maszynowo: `Przegląd spraw
  człowieka`, format `włączony · 30 dni`, kotwica na początku komórki, zamknięta lista brzmień
  wyłącznika, wartość nierozpoznana → przegląd wyłączony plus jedno zdanie. Wiersz dopisany do
  tabeli „Wiersz | Czyta go", do listy wpisów tworzonych przy inicjalizacji i do przykładu.
  Napisane wprost, że wyłącznik jest **osobny od rotacji** (Aneks A).
- `core/process/session-signals.js` — `sprawyPrzeterminowane(cwd, opcje)` plus
  `sprawyPrzeterminowaneReport(miara, opcje)`; pomocniczo `przegladSprawCzlowieka`, `pozycjeCzeka`,
  `dniMiedzy`, `ascii`. Wiek liczony od daty pozycji, a po odroczeniu — od daty odroczenia;
  pozycja bez żadnej daty nie jest przeterminowana. Wyeksportowane cztery funkcje plus
  `przelacznikRotacji` (dowód niezależności wyłączników).
- Oba hooki `session-context` (Claude Code i Cursor) wołają raport. Cursor przekazuje
  `interaktywna` z `is_background_agent`; Claude Code, jak przy budżecie, nie zgaduje.
- `CLAUDE.md` tego repozytorium i `core/templates/SPEC_CLAUDE_MD.md` — nośnik zachowania jako
  osobna linia pod frazami sesji (L-0030): reguła ma działać przy każdym modelu.
- `core/templates/SPEC_DZIENNIK.md` — format adnotacji odroczenia `*(odroczone RRRR-MM-DD,
  odroczeń: N)*` (EN: `*(deferred …, deferrals: N)*`) z licznikiem, zachowaniem po trzecim
  odroczeniu i przykładem w sekcji „Czeka na człowieka".
- `core/templates/SPEC_ARCHIWUM.md` — rdzeń `odroczo` dopisany wprost do brzmień, które
  rozstrzygnięciem **nie są**.
- Procedura pytania partiami po cztery, z trzema wyborami, w `adapters/claude-code/skills/
  relai-core/SKILL.md` i w `adapters/cursor/rules/relai-core.mdc` (tam bez `AskUserQuestion`,
  wg sekcji 7 tamtego pliku).
- `docs/USTAWIENIA.md` tego projektu — wiersz `Przegląd spraw człowieka: włączony · 30 dni`.

**Zweryfikowane — jak dokładnie:**
- **Wykrycie na trzech plikach, w obu wariantach końca linii, w jednym przebiegu** — instrument
  `pomiar.js` poza repozytorium buduje sztuczne projekty RelAI w `%TEMP%` i woła realne funkcje
  rdzenia (dzień podstawiony: 2026-09-01). RelAI: 1 sprawa otwarta, 0 przeterminowanych przy N=30
  i przy N=90, 0 bez daty. PolyFlow (`6a330c1`): **25 otwartych, 47 rozstrzygniętych zostawionych
  w sekcji, 0 bez daty, 0 przeterminowanych przy N=30 i N=90**. Materiał kontrolny: 5 otwartych,
  1 bez daty, **3 przeterminowane przy N=30 i 1 przy N=90**. Liczby identyczne dla LF i CRLF.
- **Kontrola zera** (zasada 5: zero trafień to defekt instrumentu, dopóki nie udowodnisz inaczej) —
  najstarsza sprawa otwarta: RelAI 12 dni, PolyFlow **16 dni**, materiał 239 dni. Zero przy progu
  30 jest wynikiem, nie defektem. Ten sam plik PolyFlow przy dacie 2026-10-15: **25 z 25
  przeterminowanych** — mechanizm rusza, gdy jest na czym.
- **Dowód negatywny wyłącznika** — `Przegląd spraw człowieka: wyłączony` → zwrot `null`, raport
  `[]`, **zero znaków**. Wiersz nieobecny w pliku → to samo. Wypisane na wyjściu instrumentu.
- **Niezależność wyłączników** (Aneks A) — przy `Rotacja dokumentów: wyłączona` i `Przegląd spraw
  człowieka: włączony` w jednym pliku: `przelacznikRotacji` = `false`, `przegladSprawCzlowieka` =
  `{"wlaczony":true,"N":30}`, wykrycie zwraca 3 przeterminowane. Oba wywołania obok siebie.
- **Wartość nierozpoznana** — wiersz `może być · 30 dni` → `{nierozpoznany:true}`, brak wykrycia
  i jedno zdanie „Dozwolone wartosci: wlaczony / wylaczony", bez domysłu.
- **Przypadek, który musi trafić** (zasada 5) — pozycja z dopiskiem `(data pierwotna nieznana)`
  trafia do wyniku z wiekiem 48 dni liczonym od daty wyprowadzenia i jest przeterminowana; pozycja
  bez żadnej daty trafia do wyniku z `wiek=null` i **nie** jest przeterminowana. Obie sprawdzone
  osobną kontrolą, która wypisałaby „DEFEKT INSTRUMENTU" przy zerze.
- **Odroczenie przesuwa zegar** — sprawa odroczona 4 dni temu (licznik 3) nie jest przeterminowana
  mimo wieku 184 dni; sprawa odroczona 62 dni temu jest, a raport dokłada linię „Odkladane co
  najmniej trzy razy: 1 — najstarsza czeka 8 miesiecy od pierwszego wystapienia".
- **Realny hook, obie strony** — `session-context.js` uruchomiony na tym repozytorium wypisuje
  **0 linii** przeglądu; uruchomiony na projekcie kontrolnym wypisuje raport i zadanie „PARTIAMI
  PO CZTERY". Cisza i sygnał zmierzone w jednym przebiegu.
- **Sesja nieinteraktywna** — ten sam materiał z `interaktywna: false` kończy raport zdaniem
  „Sesja nieinteraktywna: to jest sam raport, bez pytan"; linii z zadaniem pytania nie ma.
- **Cztery dokumenty mówią to samo** — instrument sprawdził w jednym przebiegu obecność czterech
  faktów (N=30, wyłącznik osobny od rotacji, partie po cztery, trzy wybory) w `SPEC_USTAWIENIA.md`,
  `SPEC_DZIENNIK.md`, `SKILL.md` i `relai-core.mdc`: wszystkie TAK. Jedno „NIE" okazało się zbyt
  wąskim oknem wzorca (tabela w skillu ma 369 znaków między pierwszym a trzecim wyborem) —
  potwierdzone szerszym dopasowaniem, dokument bez zmian.
- `git grep -n "Przegląd spraw człowieka"` — trafienia w `core/templates/` (4 pliki),
  `core/process/`, `adapters/claude-code/` i `adapters/cursor/`.
- `node core/tools/validate-adapters.js` → **kod 0**.
- `git status --short` — 12 zmodyfikowanych plików śledzonych, zero plików tymczasowych; instrument
  i materiały pomiarowe mieszkają w `%TEMP%/e3/`.

**Świadomie odłożone:**
- **Rozjazd promptu E3 ze stanem repozytorium.** Prompt mówił o **9 pozycjach otwartych** w sekcji
  „Czeka na człowieka"; realnie została **1** — osiem zamknięto 2026-09-01, już po wygenerowaniu
  promptu. `PLAN.html` nietknięty (D-33), aneksu nie proponowano: „9 pozycji" było opisem materiału,
  nie kryterium. Materiał zastąpiony dziennikiem PolyFlow i plikiem kontrolnym; rozstrzygnięcie
  użytkownika padło przed startem etapu.
- **Filtrowanie pozycji rozstrzygniętych zostawionych w sekcji.** Weszło do zakresu, bo bez niego
  PolyFlow dawał 67 „spraw otwartych" zamiast 25 i mechanizm pytałby o rzeczy zamknięte tydzień
  wcześniej. Rdzenie czytane z tej samej zamkniętej listy co w `SPEC_ARCHIWUM.md`.
- Druga linia raportu startu i progi cząstkowe — **E4**. Rotacja ryzyk i ustawień — **E5**.
  Podbicie wersji do 1.7.0 i `/relai-update` — **E6**. Niczego z tych rzeczy nie obiecano
  w dokumentach.
- **Pomiar w świeżej sesji** — zachowanie „pytanie partiami po cztery" jest dziś opisane, ale
  niezmierzone: ten etap nie miał ani jednej sprawy przeterminowanej w żywym repozytorium.
  Pomiar wchodzi do E6 razem z resztą sekwencji wydania.

**Do zrobienia przez człowieka:**
- **Potwierdzić albo cofnąć osiem rozstrzygnięć z E2** — pozycja bez zmian, nadal otwarta.
- Nic nowego z tego etapu.

### 2026-09-01 — E4: raport startu jako adres progów

Autor: RelAI (Opus) + Lukasz

**Zrobione:**
- `core/process/session-signals.js` — `dokumentyPonadProgiem(cwd, txtUstawien, progRyzyk)` mierzy
  **całe dokumenty i sekcje** wobec ich własnych progów: `DZIENNIK.md` (150 KB), `LEKCJE.md`
  (50 KB albo 40 lekcji), `STATE.md` (300 linii), sekcja „Stan otwartych ryzyk" (próg cząstkowy
  `ryzyka`, 12 KB), sekcja „Lekcje zwinięte" (30 KB z `SPEC_LEKCJE.md`). Progi czytane z wiersza
  `Rotacja dokumentów` przez `progiRotacjiZKomorki` — kotwica na początku członu, zamknięta lista
  brzmień, człon nierozpoznany zostawia wartość domyślną. Wagi liczone po normalizacji CRLF → LF,
  tak jak sumy kontrolne rotacji.
- `startCostReport` ma **drugi wyzwalacz**: raport pada przy przekroczeniu sumy warstwy startowej
  **albo** gdy dokument czy sekcja przekracza własny próg. Linie są rozłączne — jedna o budżecie,
  jedna `[RelAI progi dokumentow]` o dokumentach; każda pozycja z **nazwą procedury**, która ją
  odchudza. Wypisywane są najwyżej trzy pozycje, reszta jako jawna liczba z poprawną odmianą.
  Linia budżetowa wymienia teraz **pozycje ponad progiem cząstkowym**, a nie trzy najgrubsze,
  gdy takie pozycje są.
- **Wyłączniki zostały rozdzielone do końca.** Część „dokumenty ponad progiem" ma wyłącznik
  **rotacji**: `wyłączona` albo wartość nierozpoznana wycisza ją w całości. Wyłączony budżet
  jej **nie** wycisza — `startCost` zwraca wtedy kształt `{ tylkoDokumenty: true, dokumenty }`,
  a gdy nic nie przekracza progu, nadal `null`, czyli cisza.
- `core/templates/SPEC_USTAWIENIA.md` — sekcja **„Katalog progów"** (Aneks B): 17 wierszy
  `Próg | Domyślnie | Gdzie mieszka wartość | Kto go czyta | Po przekroczeniu | Adres egzekwowania`.
  Katalog jest **rejestrem, nie drugim źródłem prawdy** — wartości zostają tam, gdzie były.
  Dwa progi mają wpisane wprost „brak automatu" (limit 800 znaków komórki „Mitygacja", propozycja
  kompresji lekcji), a osobny akapit mówi, czego katalog świadomie nie obejmuje: wielkości
  nietykalności (10 wpisów, 20 lekcji), liczb orientacyjnych i wartości historycznych.
- `core/templates/SPEC_LEKCJE.md` i `SPEC_ARCHIWUM.md` — po jednym akapicie: próg sekcji „Lekcje
  zwinięte" jest od 1.7.0 czytany maszynowo, progi rotacji mają adres także na starcie sesji,
  a raport **mówi, nie rotuje**. Oba odsyłają do katalogu.
- Oba adaptery — `adapters/claude-code/skills/relai-core/SKILL.md` (sekcja „Dokument ponad własnym
  progiem") i `adapters/cursor/rules/relai-core.mdc` (ten sam opis po angielsku): jak zareagować na
  nową linię, że to drugi wyzwalacz tego samego raportu, że procedury wykonuje się dopiero po
  zgodzie i że linia nie jest kompletem do przepisania. **Limitu „Zasad aktywnych" nie ruszono** —
  został w kroku 1 rytuału zamknięcia.

**Zweryfikowane — jak dokładnie:**
- **Dwa wyzwalacze obiema wersjami w jednym przebiegu** (zasada 4) — instrument `pomiar.js`
  w `%TEMP%/e4/` buduje sztuczne projekty RelAI i woła realne funkcje rdzenia. Projekt mieszczący
  się w budżecie (4,0 KB / 80 KB) z dziennikiem **154,5 KB przy progu 150 KB** → raport **2 linie**.
  Ten sam projekt z dziennikiem **31,2 KB** → **zero znaków**. Wypisane obok siebie.
- **Regresja ciszy** (ryzyko 3 planu) — realne uruchomienie obu hooków startu na tym repozytorium
  w stanie na dziś (start 47,1 KB / 80 KB, dziennik 140,2 / 150 KB, lekcje 23,5 / 50 KB, STATE
  224 / 300 linii): `adapters/claude-code/hooks/session-context.js` → **0 linii** raportu,
  `adapters/cursor/hooks/session-context.js` → **0 linii** przy 1275 B pozostałego kontekstu.
  Zmierzone uruchomieniem hooka, nie samą funkcją.
- **Przypadek z Aneksu B odtworzony z gita** — `git show ea33e1c:docs/LEKCJE.md` (**52 260 B**,
  sekcja „Lekcje zwinięte" **35 787 B**) → raport wymienia **plik i sekcję**, każde z nazwą
  procedury: „docs/LEKCJE.md 51 KB (prog 50 KB) — rotacja lekcji; sekcja »Lekcje zwiniete«
  34.9 KB (prog 30 KB) — przeniesienie zwinietych lekcji do archiwum". Liczby identyczne dla LF
  i CRLF (na dysku 52 928 B, po normalizacji 52 260 B) — zasada 11.
- **Limit sześciu linii nie pęka** — projekt z przekroczoną sumą budżetu (87,0 KB / 80 KB),
  **dwoma** progami cząstkowymi (CLAUDE, ryzyka), **trzema** progami dokumentów (dziennik, lekcje,
  STATE) i **dwoma** progami sekcji (ryzyka, zwinięte): **5 linii** raportu, sesja nieinteraktywna
  **4 linie**. Limit 6.
- **Próg nierozpoznany znaczy cisza** (zasada 7) — cztery warianty wiersza rotacji na tym samym
  materiale: `włączona` → 2 pozycje i linia progów; `być może` → **0 pozycji, linii progów brak**,
  raport budżetu **działa dalej** (4 linie); `wyłączona` → to samo; `włączona · dziennik sporo` →
  człon nierozpoznany, wartość domyślna 150 KB, mechanizm działa.
- **Niezależność wyłączników** — budżet `wyłączony` / bez wiersza / wartość nierozpoznana przy
  rotacji włączonej i dzienniku ponad progiem: linia progów pada we wszystkich trzech przypadkach.
  Kontrola ciszy: budżet wyłączony i dokumenty **poniżej** progu → `startCost` = `null`, raport
  **0 linii**.
- **Materiał z cudzego projektu** — dokumenty PolyFlow (`9fcf433`) wstawione do sztucznego projektu
  w `%TEMP%`: dziennik 167,2 KB / 150 KB, sekcja ryzyk 38,6 KB / 12 KB, lekcje 61,3 KB / 50 KB,
  STATE 301 / 300 linii — **cztery pozycje, z których przed E4 nie odezwałaby się ani jedna**;
  raport 5 linii.
- **Katalog progów kompletny** — instrument `s6-katalog.js` zbiera z `core/templates/` i
  `core/process/` linie niosące liczbę przy jednostce mechanizmu: **51 kandydatów, 0 bez
  odpowiednika w katalogu**. Dwie kontrole instrumentu, które **muszą** trafić (zasada 5): limit
  15 pozycji w `SPEC_LEKCJE.md` i limit 800 znaków w `SPEC_DZIENNIK.md` — obie TAK. Druga z nich
  wyszła dopiero po naprawie instrumentu: linia o limicie 800 znaków niesie datę kalibracji, więc
  filtr „to jest pomiar, nie próg" zjadał ją w ciszy.
- **Limit „Zasad aktywnych" nadal ma jeden adres** — `git grep` pokazuje go w kroku 1 rytuału
  zamknięcia w obu adapterach (`SKILL.md:502`, `relai-core.mdc:136`) i **nigdzie** w opisie raportu
  startu.
- `node core/tools/validate-adapters.js` → **kod 0**.
- `git status --short` — 7 zmodyfikowanych plików śledzonych, zero plików tymczasowych; instrument
  i materiały pomiarowe mieszkają w `%TEMP%/e4/`.

**Świadomie odłożone:**
- **Wykonanie rotacji i kompresji na tym repozytorium** — raport ma o nich mówić, a nie robić ich
  za człowieka. Dziennik po tym wpisie zbliża się do progu 150 KB; rotacja pójdzie własnym trybem
  w rytuale zamknięcia sesji.
- **Rotacja ryzyk i ustawień do archiwum oraz kompresja komórki „Mitygacja"** — E5. **Podbicie
  wersji do 1.7.0, `/relai-update` i pomiar na realnych projektach** — E6. Niczego z tych rzeczy
  nie obiecano w dokumentach.
- **Próg sekcji „Zasady aktywne" liczony w pozycjach** został przy swoim adresie (krok 1 rytuału
  zamknięcia) i **nie** wszedł do raportu startu — decyzja z promptu etapu, powtórzona w planie
  dwa razy.
- **Projekt sprzed 1.6.0 (bez wiersza budżetu) usłyszy nową linię**, jeśli ma włączoną rotację
  i dokument ponad progiem. To skutek rozdzielenia wyłączników, nie przeoczenie: zgodą jest tam
  wiersz rotacji, obecny od 1.2.0.

**Do zrobienia przez człowieka:**
- **Potwierdzić albo cofnąć osiem rozstrzygnięć z E2** — pozycja bez zmian, nadal otwarta.
- Nic nowego z tego etapu.

### 2026-09-01 — E5: ryzyka i ustawienia schodzą do archiwum

Autor: RelAI (Opus) + Lukasz

**Zrobione:**
- `core/templates/SPEC_DZIENNIK.md` — nowa sekcja „Kompresja komórki »Mitygacja«". Trzy warunki
  w koniunkcji: sekcja ryzyk ponad progiem cząstkowym `ryzyka`, komórka ponad **800 znaków**,
  status z **zamkniętej listy** (`zmitygowan`; `przyj`/`zaakceptowan` razem ze `świadom`). Rdzenia
  szukasz w **brzmieniu statusu** — od początku komórki do pierwszej cyfry, myślnika albo nawiasu.
  Wiek komórki warunkiem **nie jest**. W żywej komórce zostają dwa człony: **dosłowny cytat**
  ostatniego zdania sprzed `Zmierzone:` oraz `Historia: [MITYGACJE_…](…)` z niezmienionym członem
  `Zmierzone:`. Granica zdania rozstrzygnięta wprost (`.!?` + spacja + wielka litera albo `**`).
  Wynik ponad 800 znaków → STOP i pytanie do człowieka.
- `core/templates/SPEC_ARCHIWUM.md` — dwie nowe ścieżki
  (`docs/archiwum/ryzyka/MITYGACJE_<data>.md`, `docs/archiwum/ustawienia/USTAWIENIA_<data>.md`),
  dwa nowe wiersze tabeli progów, sekcje „Historia komórek »Mitygacja«" i „Wycofane wiersze
  ustawień", siedem nowych przypadków brzegowych, cztery nowe zakazy i dwa przykłady plików
  archiwum. Obie operacje to **te same dwa wejścia rotacji**, nie trzecie; każda ma własny przebieg
  i własną sumę kontrolną.
- `core/templates/SPEC_USTAWIENIA.md` — sekcja „Rotacja ustawień": schodzą wyłącznie wiersze sekcji
  „Ustawienia wycofane", wszystkie naraz, przy progu cząstkowym `ustawienia` (6 KB). **Pięć wierszy
  wypisanych z nazwy nie schodzi nigdy** — `Język projektu`, `Profil projektu`, `Rotacja
  dokumentów`, `Budżet startu sesji`, `Przegląd spraw człowieka` — także gdy stoją w sekcji
  wycofanych; `Budżet startu sesji` jest przypadkiem najostrzejszym, bo niesie próg uruchamiający
  tę właśnie rotację. Sekcja „Ustawienia wycofane" **zostaje** jako sposób na czytelność.
- Katalog progów: wiersz „komórka »Mitygacja«" przestał być **brak automatu** i dostał adres
  (krok 2 rytuału zamknięcia); wiersz `docs/USTAWIENIA.md` dostał drugiego czytelnika i drugą
  procedurę. Wierszy nadal **17**, z adresem **15**, bez automatu **1** (propozycja kompresji
  lekcji), „nie dotyczy" **1** (cel rotacji).
- `core/process/session-signals.js` — `dokumentyPonadProgiem` mierzy teraz także
  `docs/USTAWIENIA.md` (próg cząstkowy przychodzi parametrem, tak jak dla sekcji ryzyk) i wybiera
  **procedurę zgodną ze stanem pliku**: `rotacja ustawien do archiwum`, gdy sekcja „Ustawienia
  wycofane" ma wiersze, `zwiezlosc komorki Decyzja`, gdy jej nie ma. Pozycja bez procedury nadal
  nie wchodzi do listy.
- Oba adaptery — krok 2 rytuału zamknięcia w `SKILL.md` i `relai-core.mdc` opisuje obie operacje
  wraz z pięcioma nietykalnymi wierszami z nazwy. Limit „Zasad aktywnych" nietknięty.

**Zweryfikowane — jak dokładnie:**
- **Punkt 1 weryfikacji NIE PRZESZEDŁ i został zamieniony Aneksem C** (decyzja użytkownika
  z tej sesji). Materiał wskazany w prompcie — sekcja ryzyk PolyFlow `9fcf433` — jest
  arytmetycznie nie do zbicia poniżej 12 KB: **39 548 B, 62 ryzyka, 0 `ZAMKNIĘTYCH`, jedna
  komórka ponad 800 znaków (912) i ta o statusie `OTWARTE`**; cała kolumna „Mitygacja" waży
  22 032 B, więc jej wyzerowanie zostawia 17,5 KB. To jest przypadek już opisany
  w `SPEC_ARCHIWUM.md` („sekcja gruba przez ryzyka żywe — decyzja człowieka"), teraz dopisany
  tam z liczbami.
- **Obie wersje w jednym przebiegu** na realnym materiale z kroniką: dziennik PolyFlow sprzed
  migracji (`396e243^`). Sekcja ryzyk **57 136 → 49 137 B** (55,8 → 48,0 KB), **7 komórek
  skompresowanych z 15 ponad 800 znaków**, największa `R40: 1881 → 163` znaki. **Wierszy przed
  i po: 52 i 52**, zbiór numerów identyczny co do znaku — żadne ryzyko nie zniknęło z żywej
  tabeli.
- **Suma kontrolna:** `6c760e1b89d6d10b` policzona z fragmentu w żywym pliku i odczytana z pliku
  archiwum **z dysku** — zgodne. Wariant kontrolny z celowo uszkodzoną treścią archiwum:
  `6c760e1b89d6d10b` vs `a29ae5b08b3aa977`, **STOP**, żywy plik identyczny bajt w bajt,
  0 zmienionych wierszy. To samo dla ustawień: `99623158984a8313` vs `57c356387b3dcd7c`, plik
  nietknięty.
- **Cytat, nie parafraza:** 7 z 7 zdań stanu odnalezionych **dosłownie** w treści archiwum
  (`indexOf`, nie podobieństwo).
- **Dowody negatywne:** komórka `ZMITYGOWANE` poniżej limitu (R1, 574 znaki) — brzmienie
  pierwotne zachowane co do znaku; ryzyko `OTWARTE` z komórką **1866 znaków** (R43) — nietknięte.
- **Wiersz czytany maszynowo nie schodzi:** plik ustawień PolyFlow z **pięcioma** wierszami
  przeniesionymi do sekcji „Ustawienia wycofane" (brakujące dołożone wprost, żeby przypadek
  **musiał** trafić) — po rotacji **wszystkie pięć nadal w pliku**, przeniesionych 16 z 21,
  nietykalnych 5. `startCost` zwraca te same progi i przełączniki
  (`start 80 · CLAUDE 10 · STATE 12 · ryzyka 12 · zasady 30 · ustawienia 6 · status 10`,
  rotacja `true`), `sprawyPrzeterminowane` — `włączony, N=30, 28 pozycji, 0 przeterminowanych`.
  Suma warstwy startowej spadła o 4 516 B i **to jedyna liczba, która się zmieniła**.
- **Rotacja ustawień na realnym pliku:** PolyFlow **30 068 → 25 552 B**, 16 wierszy wycofanych
  przeniesionych, 16 z 16 odnalezionych w archiwum dosłownie, linia-odsyłacz w żywym pliku,
  sekcja „Ustawienia wycofane" nadal istnieje.
- **Cisza poniżej progu:** to repozytorium — sekcja ryzyk **3 978 B / 12 288 B**, ustawienia
  **3 106 B / 6 144 B**; obie procedury kończą się bez zmian w plikach, **katalog archiwum nie
  powstaje**. Hook `session-context` uruchomiony na tym repozytorium: **0 linii** raportu; ten sam
  hook na projekcie kontrolnym (dokumenty PolyFlow): **3 linie**, w tym po raz pierwszy
  `docs/USTAWIENIA.md 29.4 KB (prog 6 KB) — rotacja ustawien do archiwum`. Wariant tego samego
  pliku bez sekcji wycofanych: procedura zmienia się na `zwiezlosc komorki Decyzja`.
- **Oba warianty końca linii w jednym przebiegu:** LF i CRLF — identyczna sekcja przed i po
  (57 136 → 49 137 B), identyczna suma `6c760e1b89d6d10b`, koniec linii pliku zachowany w obu.
- **Kotwica statusu zmierzona na jedenastu brzmieniach**, w tym pięciu, które **muszą** trafić,
  i sześciu, które **nie mogą**: dopasowanie w całej komórce dawało **11 kandydatów**,
  w brzmieniu — **7**; różnicę stanowiły ryzyka `ZAMKNIĘTE` z rdzeniem „zmitygowane" w prozie za
  datą, które schodziłyby wtedy dwiema drogami naraz.
- `node core/tools/validate-adapters.js` → **kod 0** („spojne", 3 źródła wersji, wartość 1.6.1).
- `git grep` na limicie „Zasad aktywnych": dwa trafienia, po jednym w kroku 1 rytuału zamknięcia
  każdego adaptera — **ani jednego** w `session-signals.js` ani w raporcie startu.
- **Nie sprawdzono:** przebiegu obu procedur wykonanego **przez model w żywym rytuale zamknięcia**
  — mechanizm zmierzony instrumentem w `%TEMP%/e5/`, na kopiach poza repozytorium. Wchodzi do E6
  razem z sekwencją wydania.

**Świadomie odłożone:**
- **Wykonanie kompresji i rotacji na tym repozytorium** — obie pozycje są poniżej progu, więc nie
  ma czego robić; mechanizm ma być gotowy, użycie należy do rytuału zamknięcia.
- **Próg liczby wierszy tabeli ryzyk ani procedura dla ryzyk długo nieruszanych** — to był wariant
  B pytania o Aneks C i został odrzucony: nowy mechanizm poza sekcją 6 planu.
- **Wiek komórki jako warunek kompresji** — plan wymieniał „bez zmian od `N` dni", ale nie podał
  wartości `N`, a rozstrzygnięcie przypadku brzegowego z sekcji 8 planu definiuje wyzwalacz bez
  wieku. Wiek wymagałby przy tym dowodu spoza dokumentu (historia gita per komórka).
- Podbicie wersji do 1.7.0, `/relai-update` obu projektów i pomiar pełnego startu — **E6**.

**Do zrobienia przez człowieka:**
- **Potwierdzić albo cofnąć osiem rozstrzygnięć z E2** — pozycja bez zmian, nadal otwarta.
- Nic nowego z tego etapu; Aneks C rozstrzygnięty w tej sesji.

### 2026-09-01 — E6: wydanie 1.7.0, pomiar po restarcie i pierwsza rotacja z przepięciem linków

Autor: RelAI (Opus 5) + Lukasz

**Zrobione:**

- **Wydanie 1.7.0.** Numer w trzech źródłach liczonych przez walidator plus marker projektu.
  `git grep` po `1.6.1` rozstrzygnięty co do trafienia: **11 deklaracji stanu docelowego**
  podbitych (oba skille, oba README adapterów, tabela `/relai-update`, `SPEC_KOMENDY`,
  `SPEC_RAPORT_ADOPCJI`, `SPEC_USTAWIENIA`, `docs/KOMENDY.md`, `CLAUDE.md`) i **41 wzmianek
  historycznych** zostawionych nietkniętych (cztery specyfikacje, dziennik, archiwum, prompty
  etapowe).
- **`/relai-update` dostała dwa brakujące wiersze inwentaryzacji** — wiersz `Przegląd spraw
  człowieka` w `USTAWIENIA.md` i linię przeglądu w `CLAUDE.md`. Bez nich komenda „aktualizująca
  do 1.7.0" nie wnosiła tego, co 1.7.0 wniosło; drugi wiersz wyszedł dopiero przy inwentaryzacji
  PolyFlow, czyli na cudzym projekcie, a nie na tym.
- **Sekwencja P-005 wykonana w całości**, z restartem aplikacji przed jakimkolwiek pomiarem.
- **PolyFlow podniesiony z 1.6.1 na 1.7.0** komendą uruchomioną **z cache'u pluginu**, nie
  z repozytorium — i przeprowadzony przez pełny rytuał zamknięcia: rotacja dziennika, rotacja
  ustawień, kompresja komórek „Mitygacja".
- **Aneks D do planu**: poprawka wzorca `ASSIGN_RE` w `core/guardrails/secret-scan.js`. Guardrail
  zatrzymał commit wydania na zdaniu specyfikacji **opisującym ten sam guardrail**; zasada aktywna
  12 zabrania obejścia przez `--no-verify`, więc poprawka poszła do rdzenia z dowodem.
- **Rotacja tego dziennika** — 18 wpisów z okresu 2026-08-17…2026-08-21 do
  [archiwum](archiwum/dziennik/DZIENNIK_2026-08-17_2026-08-21.md).

**Zweryfikowane — jak dokładnie:**

- **`node core/tools/validate-adapters.js` → kod 0**, „numery wersji: 3 zrodel, wartosc 1.7.0".
- **Wersja realnie wykonywana potwierdzona treścią pliku**, nie komunikatem CLI: lokalna kopia
  `SPEC_ARCHIWUM.md` w projekcie ma po restarcie **53 057 B i 17 wystąpień „1.7.0"**, przed
  restartem **27 390 B i zero**. `session-signals.js` w cache'u 1.6.1 nie miał **ani jednego**
  wystąpienia `dokumentyPonadProgiem` i `sprawyPrzeterminowane`; w 1.7.0 ma 5 i 4.
- **Świeża sesja po restarcie na tym repozytorium:** hook wypisał `[RelAI progi dokumentow]`
  o dzienniku 155,6 KB przy progu 150 KB — **2 linie**. Ta sama sesja przed restartem, przy
  identycznym pliku, dostała **0 linii**, bo 1.6.1 tej funkcji nie miał. To jest defekt, który
  naprawiał E4, zmierzony na żywym starcie zamiast na kopii.
- **PolyFlow po `/relai-update`:** `Wersja RelAI: 1.7.0`, a **wszystkie pięć wierszy czytanych
  maszynowo** obecnych z brzmieniem — `przegladSprawCzlowieka` zwraca `wlaczony: true, N: 30`,
  `przelacznikRotacji` zwraca `true`, `startCost` — budżet 81 920 B. Dowód negatywny powtórzony
  **po** rotacji ustawień: 5 z 5.
- **Rotacja dziennika PolyFlow, procedura dwufazowa:** suma `566dca8a4dd45ba7` policzona z żywego
  pliku i odczytana **z dysku** z archiwum — zgodna przed przycięciem. 187 477 → 150 810 B,
  9 + 15 = 24 wpisy. Zakres to **cały najstarszy dzień**: pozostałych 5 kandydatów dzieli datę
  z wpisami, które zostają, a plik `DZIENNIK_2026-09-01_2026-09-01.md` już istnieje — rozcięcie
  dnia dałoby kolizję nazwy, którą specyfikacja rozstrzyga zatrzymaniem.
- **Przepięcie linków policzone w obie strony** — pierwszy realny przebieg tej operacji od E1:
  **60 martwych przed rotacją, 65 po niej, 60 po przepięciu**. Ta rotacja dołożyła 5 i przepięła 5,
  bilans zero. Pozostałe 60 pochodzi z rotacji sprzed 1.7.0, które kroku przepięcia nie miały.
- **Rotacja ustawień PolyFlow:** suma `99623158984a8313` zgodna, 30 472 → 25 961 B, 16 wierszy,
  **0 wierszy nietykalnych w zabranym zbiorze**; nagłówek sekcji i wiersz nagłówkowy tabeli zostały.
- **Kompresja komórek „Mitygacja" nie ruszyła — i to jest dowód negatywny.** Sekcja ryzyk PolyFlow
  jest ponad progiem (26,2 KB przy 12 KB), ale ani jedna komórka o statusie z zamkniętej listy nie
  przekracza 800 znaków. Sprawdzone na **dwóch** wersjach pliku: dzisiejszej i sprzed skrócenia
  tabeli przez właściciela (`8a37e84^`, sekcja 39,4 KB) — tam jedyna komórka ponad limitem (912
  znaków) ma status `OTWARTE`, a tych automat nie rusza.
- **Pytanie partiami po cztery, materiał spreparowany** (kopia dokumentów PolyFlow, próg obniżony
  z 30 na 5 dni; PolyFlow nietknięty): **13 spraw przeterminowanych z 32 otwartych, 4 partie —
  4 + 4 + 4 + 1**. Zadana partia pierwsza, trzy wybory na sprawę. Po zapisaniu dwóch adnotacji
  rozstrzygnięcia rdzeń przeliczył od razu: 32 → 30 otwartych, 13 → 11 przeterminowanych, 4 → 3
  partie.
- **Adnotacja odroczenia z licznikiem:** `*(odroczone 2026-09-01, odroczeń: 1)*` → licznik 1, potem
  2, potem 3. Zegar przesunięty, sprawa **nie zamknięta**: data pozycji została datą pierwszego
  wystąpienia (2026-08-18), `wiek` nadal 14 dni, `wiekOdOdroczenia` 0, `przeterminowana` false,
  a pozycja **nadal na liście otwartych**; przeterminowanych 11 → 10. Adnotacja bez licznika
  nie jest czytana — brzmienie jest zamknięte, zgodnie ze specyfikacją.
- **Zero regresji ciszy:** to repozytorium po wydaniu, po rotacji i po tym wpisie dostaje z obu
  hooków startu **0 znaków**. Projekt kontrolny — **5 linii przy limicie 6**.
- **Guardrail po poprawce, trzy warianty indeksu:** `PASSWORD=` z wartością → kod 1 i **commit nie
  powstaje**; czysty indeks → kod 0; zdanie dokumentacji o guardrailu → kod 0. Wzorzec stary myli
  się **1 raz na 9** przypadków, nowy **0 razy**.
- **Katalog progów zgadza się ze stanem po wydaniu:** 17 wierszy, 15 z adresem egzekwowania,
  1 „brak automatu" (propozycja kompresji lekcji), 1 „nie dotyczy" (cel rotacji).

**Świadomie odłożone:**

- **Rotacja lekcji i rotacja ryzyk `ZAMKNIĘTYCH` w PolyFlow** — obie należne, obie poza zakresem
  tego etapu. Raport startu tamtego projektu mówi o nich przy każdym uruchomieniu.
- **60 martwych linków w sekcji „Czeka na człowieka" PolyFlow** — pozostałość po rotacjach sprzed
  1.7.0. Naprawa to osobna operacja na cudzych pozycjach, nie skutek uboczny aktualizacji.
- **Trzy zamknięcia spraw z partii pierwszej** zostały w materiale spreparowanym. Decyzja
  właściciela: to była próba, PolyFlow zostaje bez zmian w sekcji spraw.

**Do zrobienia przez człowieka:**

- **Poszerzyć zamkniętą listę rdzeni rozstrzygnięcia albo przepisać adnotacje w PolyFlow.**
  Zmierzone: **7 z 32 pozycji** (22%) wygląda dla człowieka na zamknięte, a mechanizm liczy je jako
  otwarte — `zaliczona` ×3, `dostarczony` ×1, trzy bez rdzenia z datą. Poszerzenie listy jest
  decyzją projektową, nie poprawką: fałszywe rozpoznanie chowa sprawę człowieka w archiwum.

### 2026-09-01 — PLAN HIGIENA_DOKUMENTOW ZAMKNIĘTY: dowiezione vs plan

Autor: RelAI (Opus 5) + Lukasz

**Zrobione:**

**Co miało powstać.** Plan powstał ze zgłoszenia z sesji roboczej PolyFlow: mechanizm rotacji
i progów był kompletny, ale w projekcie prowadzonym cztery miesiące nie odezwał się **ani razu** —
dziennik doszedł do 862,7 KB przy progu 150 KB. Sześć etapów miało to naprawić w sześciu miejscach,
w których mechanizm nie bronił się sam.

**Co powstało — etap po etapie:**

- **E1 — rotacja rusza.** Wpis linkowany z otwartej sprawy człowieka przestał być nietykalny; jego
  link jest przepinany na plik archiwum w fazie 2, po zgodności sum. Zakres rotacji PolyFlow
  **0 → 117 wpisów ze 127**.
- **E2 — blokada mówi, próg nie kłamie.** Trzy wagi dokumentu (całkowita, część rotowalna, dolna
  granica osiągalna) podawane razem z progiem; komunikat zatkanej rotacji wypisuje pary
  „pozycja → wpis". Stary komunikat **milczał**, gdy rotacja brała 2 z 87 wpisów.
- **E3 — sprawa przeterminowana wymusza decyzję.** Wiersz `Przegląd spraw człowieka` z progiem
  30 dni i **własnym wyłącznikiem**, wykrycie w hooku startu, pytanie partiami po cztery.
- **E4 — każdy próg ma adres.** Drugi wyzwalacz raportu startu i sekcja „Katalog progów":
  17 progów, 15 z adresem egzekwowania. Wcześniej `LEKCJE.md` ważące 52 KB przy progu 50 KB nie
  odezwałoby się ani razu.
- **E5 — ryzyka i ustawienia schodzą do archiwum.** Kompresja komórki „Mitygacja" z dosłownym
  cytatem zamiast parafrazy i rotacja `USTAWIENIA.md` z pięcioma wierszami nietykalnymi z nazwy.
- **E6 — pomiar na realnych projektach i wydanie 1.7.0.** To, czego E1–E5 nie miały: pomiar **po
  wydaniu, w świeżej sesji, w zainstalowanym pluginie, na cudzym projekcie**.

**Co przepadło albo zmieniło kształt — trzy aneksy i jeden dołożony:**

- **Aneks A** — wartość `N = 30 dni` i wyłącznik przeglądu osobny od rotacji; rozstrzygnięcie
  człowieka przed startem E1.
- **Aneks B** — zakres E4 rozszerzony o progi sekcji i jawny katalog progów; powód wyszedł
  z rotacji `LEKCJE.md` w rytuale zamknięcia sesji.
- **Aneks C** — kryterium E5 „sekcja ryzyk PolyFlow schodzi pod 12 KB" **było arytmetycznie
  nieosiągalne** i zostało zamienione na dowód działania mechanizmu. Powód policzony przed
  implementacją: 62 ryzyka, **0 zamkniętych**, cała kolumna „Mitygacja" waży 22,0 KB, więc jej
  wyzerowanie zostawiłoby 17,5 KB. To nie kronika w komórkach, tylko liczba żywych ryzyk — a jej
  skrócenie jest decyzją człowieka, nie operacją automatu.
- **Aneks D** — poprawka guardraila, dołożona w trakcie E6, bo guardrail zatrzymał commit wydania
  na zdaniu specyfikacji opisującym jego samego.

**Zweryfikowane — jak dokładnie:**

- **Dowiezione 6 etapów z 6.** Wszystkie cztery bramki manualne planu rozstrzygnięte; obie odnogi
  domknięte — `BLOKADA_ROTACJI` wchłonięta przez E1, `REJESTR_ARTEFAKTOW` zamknięta rejestrem
  38 artefaktów.
- **Cel planu osiągnięty na dwóch projektach z trzech.** PolyFlow: dziennik **183,1 → 147,3 KB**,
  ustawienia **29,8 → 25,4 KB**, wersja struktury 1.7.0. RelAI: dziennik **155,6 → 74,1 KB**,
  warstwa startowa **55,3 KB / 80 KB**, raport startu **0 znaków**. JiraManager (386 KB startu)
  **nie został tknięty** — decyzja właściciela, projekt jest w ciągłym rozwoju.
- **Mechanizm zmierzony na cudzym materiale, nie na własnym.** Każdy z sześciu etapów kończył się
  liczbą z realnego projektu, nie z instrumentu na kopii — poza E6, który dołożył brakujący
  składnik: przebieg w żywej sesji po restarcie aplikacji.

**Świadomie odłożone:**

- **Zamknięcie sekcji ryzyk PolyFlow pod próg** — 62 ryzyka otwarte, 0 zamkniętych. Odchudza ją
  wyłącznie zamknięcie ryzyk albo podniesienie progu; obie rzeczy są decyzją człowieka (Aneks C).
- **Rotacja lekcji i rotacja ryzyk `ZAMKNIĘTYCH` w PolyFlow** — należne, poza zakresem E6.

**Do zrobienia przez człowieka:**

- **Zamknięta lista rdzeni rozstrzygnięcia nie zna słownika realnego projektu** — bramka
  **świadomie zostawiona otwarta** przy zamykaniu planu, przeniesiona do `STATE.md`, sekcja
  „Co dalej", żeby nie zginęła razem z folderem planu w archiwum.

### 2026-09-01 — IKONY KOMEND CZYTELNE NA OBU MOTYWACH GITHUBA

Autor: RelAI (Opus 5) + Lukasz

**Zrobione:**

Zgłoszenie ze zrzutu ekranu: dziesięć ikon w sekcji „Komendy" README jest na ciemnym motywie
przeglądarki nieczytelnych. Przyczyna zmierzona w plikach, nie zgadnięta: główny kształt każdej
ikony rysuje tusz `#312c25`, który wobec tła GitHub dark (`#0d1117`) daje kontrast **1,08:1** —
kreska fizycznie znika, zostaje sam pomarańcz.

Wybór między dwoma zestawami przełączanymi przez `<picture media="(prefers-color-scheme: dark)">`
a jednym zestawem uniwersalnym rozstrzygnął człowiek: **jeden zestaw**. Powód odrzucenia
`<picture>`: przełącznik czyta ustawienie systemu, a nie motyw GitHuba, więc użytkownik z ciemnym
GitHubem na jasnym systemie dostałby dokładnie dzisiejszy problem — plus dwa razy więcej plików do
utrzymania.

Zmiana jest chirurgiczna: **geometria, grubości kresek i kompozycja bez zmian**, ruszone wyłącznie
kolory i tryb rysowania.

- **Tusz `#312c25` → `#8a7f70`** we wszystkich dziesięciu plikach. Ciepła szarość z tej samej
  rodziny barwnej, dobrana tak, by mieścić się w oknie kontrastu ≥3:1 wobec **obu** teł naraz.
- **`opacity=".55"` na liniach pomocniczych zniknęła** — przezroczystość liczy się względem tła,
  więc na ciemnym schodziła do ~2,3:1. Hierarchię niesie teraz `stroke-width="2.2"` przy 2.6 linii
  głównej: ta sama różnica, ale niezależna od tła.
- **Kremowe wypełnienie lupy w `audit.svg` usunięte** (`fill="none"`) — na ciemnym tle była to
  jasna plama. Kremowy trójkąt w `stage.svg` **zostaje**: leży w całości na pomarańczowym dysku,
  więc tła strony nie dotyka.
- **Żółty `#d9a134` → `#b8862a`** w `changelog.svg` — jedyny kolor marki, który wypadał z okna
  (2,31:1 na jasnym tle).
- **Martwy element usunięty** z `adopt.svg`: `<path d="M20 39h5" opacity="0">` nie rysował nic.

Pomarańcz `#c4643c` i zieleń `#5f8a68` zostały bez zmian — pomiar pokazał, że obie już mieściły
się w oknie, więc nie było czego naprawiać.

**Zweryfikowane — jak dokładnie:**

- **Kontrast policzony skryptem** (WCAG, luminancja względna) dla każdego koloru występującego
  w plikach, wobec trzech teł: `#ffffff`, `#0d1117` (GitHub dark) i `#22272e` (GitHub dark dimmed).
  Wynik: `#8a7f70` **3,92 / 4,82 / 3,83**, `#c4643c` **4,01 / 4,72 / 3,75**, `#5f8a68`
  **3,95 / 4,80 / 3,81**, `#b8862a` **3,24 / 5,84 / 4,64** — wszystkie ≥3:1 na wszystkich trzech.
  `#fffdf7` wypada wobec bieli (1,02:1), ale występuje wyłącznie na pomarańczowym dysku, gdzie daje
  3,94:1.
- **Render obu motywów obok siebie** — headless Chrome, `--force-device-scale-factor=2`, wszystkie
  dziesięć ikon w rozmiarze 48 px i w realnym rozmiarze README (24 px), na `#ffffff` i `#0d1117`.
  Obejrzane: każda ikona czytelna w obu kolumnach, żadna nie gubi elementu.
- **Grep kontrolny po podmianie**: zero wystąpień `#312c25` i zero atrybutów `opacity` w katalogu
  ikon; `#fffdf7` wyłącznie w `stage.svg`, w jednej linii.
- Plik podglądu był tymczasowy i **został usunięty** — `git status` pokazuje wyłącznie dziesięć
  zmienionych SVG.
- **Sprawdzone na żywym GitHubie po wypchnięciu**, bo użytkownik zgłosił, że nadal widzi stary
  stan. Commit `c07197f` na `origin/main`, drzewo czyste. Pliki **pobrane z
  `raw.githubusercontent.com`** niosą nową paletę (`#8a7f70` ×19, `#c4643c` ×18, `#5f8a68` ×3,
  `#b8862a` ×1, zero `#312c25`). `git ls-files` zna dokładnie jeden komplet ikon — kopii nie ma.
  W DOM wyrenderowanego README dziesięć obrazów, wszystkie z `complete: true` i adresem
  `/nowilus/relai/raw/main/docs/zasoby/branding/ikony/…`. Render w warunkach GitHuba wykonany
  **na plikach pobranych z GitHuba**, nie na lokalnych.
- **Przyczyna zgłoszenia: cache przeglądarki.** GitHub podaje te SVG z `Cache-Control: max-age=300`.
  Po `Ctrl+Shift+F5` użytkownik potwierdził, że jest wyraźniej.

**Świadomie odłożone:**

- **Banner i diagram nietknięte** — świadomy wybór zakresu. Banner był ruszany poprzednim commitem,
  a obie grafiki mają osadzone fonty i budują się skryptem `zbuduj.js`, więc to inna robota niż
  dziesięć małych plików. Ich kontrast na ciemnym tle **nie był mierzony**.
- **Ikony nie wchodzą do `ARTEFAKTY.md`** — rejestr obejmuje instrukcje czytane przez model
  (specyfikacje, komendy, skille, reguły), a grafika brandingowa nią nie jest.
- **Grubość kreski nietknięta**, mimo że pomiar na żywym README pokazał drugą, niezależną od koloru
  przyczynę bladości: ikona nie ma tam 24 px. Zmierzone w DOM: **23 px przy szerokim oknie i 17 px
  przy węższym**, bo `max-width:100%` ściska ją do szerokości kolumny tabeli. Kreska 2,6 przy
  `viewBox` 48 daje wtedy 1,25 px i **0,92 px** — poniżej piksela, więc przeglądarka rozmywa ją
  antyaliasingiem. Zmiana proporcji rysunku wymaga zgody, więc czeka jako pozycja niżej.

**Do zrobienia przez człowieka:**

- **Zdecydować, czy podbić grubość kreski ikon z 2.6 na 3.2** (linie pomocnicze 2.2 → 2.8).
  Zysk: 1,53 px zamiast 1,25 px przy realnych 23 px renderowania. Koszt: zmiana proporcji rysunku,
  czyli ingerencja w stylistykę, której poprawka kontrastu świadomie nie ruszała. Alternatywa bez
  ruszania grafiki: scalić kolumnę ikony z kolumną komendy w README, żeby komórka przestała ściskać
  obraz do 17 px na węższym oknie.
