# Aneks A do odnogi AUDYT_MODOW — 2026-10-10 · Z10–Z12

Status: **ZAAKCEPTOWANY 2026-10-10** (Łukasz: „akceptuję aneks”).
Źródło: uwagi Łukasza po wydaniu Z8 (relai-panel 0.10.0, relai-progress 0.3.0,
relai-cache-keeper 0.4.0), cztery zrzuty z 2026-10-10. Decyzje z wywiadu tego dnia: wszystko
aneksem do tej odnogi; fokus sesji rozpoznawany automatycznie z ręczną zmianą; pasek „plan”
pokazuje fokus sesji i cicho wspomina aktywny plan; makiety paska cache robi świeża sesja
Fable 5.1; koszty tej sesji przepisane na AUDYT_MODOW; postęp odnogi z paczek karty; sesja bez
fokusu przy planie prowadzonym w innym narzędziu liczy się „poza etapem” i pyta o fokus.

## Trzy sprawy

| Paczka | Co | Typ |
|---|---|---|
| Z10 | Archiwum w drzewie Dokumentów nie rozwija się po kliknięciu | błąd wydanej pracy |
| Z11 | Układ paska „cache” — rozjechany, brzydki | przebudowa wizualna |
| Z12 | Praca sesji przypisywana do aktywnego planu, choć sesja robi coś innego | nowa funkcja |

## Z10 · Archiwum w drzewie

**Stan faktyczny.** Test na prawdziwej liście `docs/` (216 plików, 128 w archiwum) rozwija
archiwum poprawnie. Stan z kadru odtworzony w teście (rozwinięte fixy, plany, zasoby) waży
78,5 tys. znaków i 36 Svg; po rozwinięciu archiwum 85,3 tys. i 41 Svg. P-023 pkt 7 zna dotąd
dwa punkty: 53 tys. widoczne, 256 tys. znika. Hipoteza: desktop odrzuca rysunek ponad progiem
leżącym między 78,5 a 85 tys. i zostawia poprzedni obraz — stąd „klikam i nic”. Druga obserwacja:
Kafle z rozwiniętym archiwum ważą 130–178 tys., czyli też nad tym progiem; próg roboczy testu
(200 tys.) jest za wysoki.

**Eksperyment Łukasza (10 s), przed kodem:** zwinąć fixy, plany i zasoby, kliknąć archiwum.
Rozwinie się → waga (wariant A). Dalej nic → przyczyna w obsłudze kliknięcia (diagnoza od nowa,
ten aneks dostaje dopisek).

| Wariant | Plusy | Minusy | |
|---|---|---|---|
| A. Budżet wagi zamiast liczby wierszy: drzewo i kafle liczą przybliżoną wagę wiersza w trakcie budowy i kończą linią „… jeszcze N”, test wagi na prawdziwej liście z progiem roboczym 60 tys. | działa niezależnie od tego, które foldery są otwarte; mierzalne w teście | stały próg z marginesem, nie zmierzony co do znaku | **wybrany** |
| B. Lżejszy wiersz: ikona pliku jednym współdzielonym rysunkiem typu zamiast pełnego Svg na wiersz | więcej wierszy w tym samym budżecie | sama nie gwarantuje progu; zmienia wygląd skalibrowany 2026-10-09 | dołożony tylko, jeśli A obetnie drzewo poniżej 40 wierszy |
| C. Stronicowanie drzewa („Pokaż dalej” jak w diffie) | przewidywalne | drzewo stronicowane jest obce eksploratorowi („jak w VS Code”) | odrzucony: łamie kalibrację |

**Wynik (2026-10-10, dwie próby):** pierwsza poprawka (wiersze bez Svg, budżet w liczbie Svg)
była oparta na złej hipotezie — archiwum się rozwinęło, ale opór został, a ikony zniknęły; cofnięta.
Sonda `tree-probe` (pięć wariantów drzewa w prawdziwym panelu, log zdarzeń do pliku) pokazała
przyczynę: na desktopie drugi klik w link `Markdown` nie dociera do pluginu (dociera tylko ruch
fokusu), dopóki nie kliknie się w tło, a póki takie linki są narysowane, gubią się też kliki
w zakładki; `Button` dostaje każdy klik, przerysowanie ~3 ms. Waga rysunku nie była przyczyną.
Wdrożone: wiersz drzewa to ikona `Svg` (jak w kalibracji 2026-10-09) i nazwa jako `Button plain`
(folder z chevronem w tym samym przycisku); limity kafli, diffu i podglądu bez zmian (sprzed Z10).
Wariant A (budżet wagi) i B (lżejszy wiersz) odrzucone — nie dotyczyły przyczyny.

**Weryfikacja Z10:** test „drzewo i kafle z rozwiniętym archiwum mieszczą się w 60 tys. znaków
na prawdziwej liście 216 plików”; test, że rozwinięcie folderu przy wyczerpanym budżecie daje linię
„… jeszcze N”, a nie brak reakcji; zrzut Łukasza: archiwum rozwinięte przy otwartych fixy/plany/zasoby.
P-023 pkt 7 dostaje trzeci punkt pomiaru.

## Z11 · Pasek „cache”

**Co jest źle (zrzut 2026-10-10, 1640 px):** pierścienie zaczynają się ok. 400 px od lewej, gdy
treść pasków „plan” i „postęp” zaczyna się ok. 213 px — trzy paski nie mają wspólnej siatki;
„sesja ≈ $69.55” wisi między pierścieniami a prawą krawędzią; „~59 min” jest dwa razy (pierścień
i liczba po prawej); drugi wiersz (pigułka „nowa sesja zwróci się…”, „Przekaż (RelAI)”,
„Zostań”) nie trzyma się kolumn pierwszego; pomarańczowa pigułka wygląda jak ostrzeżenie, choć
jest informacją.

**Decyzja z wywiadu:** makiety robi świeża sesja **Fable 5.1** (zasada: propozycje UX/UI tylko od
Fable). Ta sesja przygotowuje brief i prompt; implementacja po akceptacji makiety.

| Wariant procesu | Plusy | Minusy | |
|---|---|---|---|
| A. Brief → Fable: jeden wariant kalibracyjny w prawdziwym nośniku (mod z przełącznikiem), potem seria | zgodne z zasadą „najpierw jeden wariant do kalibracji smaku”; nośnik prawdziwy, bez rozjazdów SVG | dwie sesje | **wybrany** |
| B. Makiety HTML od razu w tej sesji (Opus) | szybciej | sprzeczne z decyzją Łukasza o UX | odrzucony |

**Brief dla sesji Fable (powstaje po akceptacji aneksu jako `PROMPT_Z11_FABLE.md`):** kadr
z 2026-10-10; wspólna siatka trzech pasków (`BAR.labelColumn` 14 w `core/panel/theme.mjs` —
treść każdego paska zaczyna się w tej samej kolumnie); jedna informacja raz (czas cache albo
w pierścieniu, albo po prawej); koszt sesji w stałym miejscu siatki; drugi wiersz pod kolumną
treści, przyciski w tym samym wierszu (kalibracja: „przyciski nie w osobnym wierszu”); kolor
pigułki według wagi informacji, nie alarmu; ≤ 160 px wysokości przy 1400 px (Z1); szerokość
od 900 px do 1640 px bez rozjazdu; bez czterech odrzuconych kierunków (konsola monospace, panel administracyjny, blueprint, brutalizm); zakres zmian:
wyłącznie `cache-keeper/` i `core/panel/theme.mjs`.

**Weryfikacja Z11:** akceptacja jednego wariantu przez Łukasza po zrzucie z prawdziwego nośnika;
test siatki (treść trzech pasków od tej samej kolumny); test „czas cache narysowany raz”.

## Z12 · Fokus sesji

**Problem.** Pasek „plan”, pasek „postęp”, „Teraz” w panelu i podział kosztów „Etapy” czytają
aktywny plan z `CLAUDE.md`. Ten plik jest wspólny dla wszystkich sesji i narzędzi — gdy PANEL_CODEX
idzie w Codeksie, a sesja Claude robi AUDYT_MODOW, Claude pokazuje i liczy PANEL_CODEX
(w tej sesji: $32.35 jako „PANEL_CODEX · E1”, $35.64 „poza etapem”).

**Model.** Każda sesja ma **fokus**: plan i etap, odnogę i paczkę albo „poza planem”. Fokus to
własność sesji, nie projektu — dwie równoległe sesje mają dwa fokusy.

```
prompt.submit ──► ścieżka PROMPT_ETAP_N / PROMPT_ODNOGA / ODNOGA.md w treści? ──tak──► fokus (auto)
                                   │nie
panel „Ta sesja: … [Zmień]” ───────┴──────────────────────────────────────────────► fokus (ręczny)
                                   │
        .claude/relai/fokus/<id sesji>.json  ◄── jeden plik, czytany przez panel i postęp
                                   │
   pasek plan · pasek postęp · Teraz · znacznik etapu w pomiarach (Koszty → Etapy)
```

| Wariant | Plusy | Minusy | |
|---|---|---|---|
| A. Auto z treści promptu + ręczna zmiana w panelu | trafia w typowy start („Wykonaj … PROMPT_ODNOGA.md”); pomyłkę da się poprawić | dwa wejścia do utrzymania | **wybrany** (wywiad) |
| B. Tylko ręcznie | zero zgadywania | ktoś zapomina — historia znowu błędna, jak dziś | odrzucony |
| C. Tylko automatycznie | zero klików | błędne rozpoznanie zostaje do końca sesji | odrzucony |
| D. „Aktywny plan” osobno dla każdego narzędzia w `CLAUDE.md` | jedno źródło | dwie sesje Claude dalej się mylą; `CLAUDE.md` jest wspólny — to przyczyna problemu | odrzucony |
| E. Fokus w `$.state` każdego moda | bez pliku | stan moda nie jest współdzielony między pluginami — panel i postęp rozjadą się | odrzucony |

**Zachowanie (rozstrzygnięte w wywiadzie):**

- **Rozpoznanie:** `prompt.submit` szuka w treści ścieżki `docs/plany/<PLAN>/PROMPT_ETAP_<N>.md`
  (fokus: plan i etap EN), `docs/fixy/<X>/PROMPT_ODNOGA.md` albo `docs/fixy/<X>/ODNOGA.md`
  (fokus: odnoga X). Pierwsza pasująca ścieżka wygrywa. Fokus ręczny nie jest nadpisywany
  automatem do końca sesji.
- **Pasek „plan”:** fokus jako treść główna („AUDYT_MODOW · Z10 · odnoga”, „a/b paczek”), a gdy
  aktywny plan jest inny — cicha wzmianka „aktywny plan: PANEL_CODEX (Codex)”. Nazwa narzędzia
  z linii „model wykonawczy etapów” w `STATUS.md` planu.
- **Pasek „postęp” dla odnogi:** paczki Zn z sekcji „Zakres” karty jako segmenty; paczka zrobiona,
  gdy wszystkie jej checkboxy „Zn:” w „Weryfikacji” są odhaczone; pod spodem następna paczka.
  Karta bez paczek → jeden pasek a/b checkboxów.
- **Koszty:** znacznik w pomiarach `AUDYT_MODOW/Z10` (odnoga: pierwsza nieodhaczona paczka
  w chwili wywołania; plan: etap z fokusu, także przed zmianą statusu na W TOKU). Grupa
  w „Etapach” podpisana „AUDYT_MODOW · Z10 (odnoga)”.
- **Bez fokusu:** aktywny plan z wykonawcą w innym narzędziu → pomiary „poza etapem”, pasek
  „plan” ze wzmianką i przyciskiem „Ta sesja: wybierz”. Aktywny plan prowadzony w Claude (albo
  bez wskazanego narzędzia) → jak dziś.
- **„Teraz” w panelu:** wiersz „Ta sesja: AUDYT_MODOW · Z10 — rozpoznane z promptu [Zmień]”;
  „Zmień” otwiera listę: aktywny plan (etapy W TOKU / GOTOWY DO STARTU), otwarte odnogi
  (`docs/fixy/*/ODNOGA.md` ze statusem OTWARTA), „poza planem”. Akcja główna „Start etapu…”
  zostaje tylko, gdy fokusem jest plan.
- **Korekta historii (jednorazowo, ta sesja):** rekordy pomiarów tej sesji dostają znacznik
  AUDYT_MODOW i paczkę według czasu commitów paczek (rekord sprzed commita Zn należy do Zn);
  rekordy po ostatnim commicie → Z10. Najpierw raport „było → będzie” z sumami, zapis dopiero po
  „tak”; kopia pliku w katalogu roboczym. Koszty mówią „przypisanie poprawione ręcznie 2026-10-10”.

**Przypadki brzegowe:**

| Przypadek | Rozstrzygnięcie |
|---|---|
| `/clear` (nowe id sesji, P-020 pkt 4) | fokus przechodzi na nową sesję (`session.end` z `reason: 'clear'`) |
| przeładowanie modów (P-023 pkt 6) | fokus czytany z pliku, nie z pamięci modułu |
| subagent | dziedziczy fokus sesji głównej; pomiary z jej znacznikiem |
| dwie sesje Claude równolegle | dwa pliki, dwa fokusy |
| prompt tylko cytuje ścieżkę, żeby o niej rozmawiać | auto się myli; „Zmień” naprawia, źródło fokusu widać w „Teraz” |
| karta odnogi zamknięta albo przeniesiona do archiwum | fokus wygasa, wiersz „Ta sesja: odnoga X zamknięta — wybierz” |
| fokus na planie, którego etap przeszedł dalej (E1 → E2 w STATUS) | fokus zostaje na etapie z promptu do następnego promptu z innym etapem |
| sesja Codeksa | bez zmian — adapter Codeksa nietykalny; fokus dotyczy modów Claude Code |
| plik fokusu uszkodzony | sesja traktowana jak bez fokusu, słowo o tym w „Teraz” |

## Ryzyka

| Ryzyko | Poziom | Mitygacja |
|---|---|---|
| Prawdziwy próg wagi rysunku nieznany; 60 tys. może okazać się za wysoki | wysokie | eksperyment Łukasza przed kodem; test wagi na prawdziwej liście; po wydaniu zrzut z otwartymi czterema folderami; P-023 pkt 7 uzupełniony |
| Automat przypisze sesję do złego fokusu | średnie | tylko trzy ściśle opisane wzorce ścieżek; źródło widoczne w „Teraz”; ręczny wybór wygrywa |
| Panel i postęp rozjadą się w odczycie fokusu | średnie | jeden plik, jeden moduł `focus.ts` w obu pluginach, test równości jak dla `fmt.ts` (Z6) |
| Korekta historii uszkodzi plik pomiarów | średnie | raport „było → będzie” z sumą przed i po, kopia pliku, zapis po „tak”, test na kopii |
| Nowe odczyty plików wrócą do gorących ścieżek (obietnice Z4) | niskie | plik fokusu czytany po zmianie czasu (jak `planWatch`); test liczników z Z7 rozszerzony |
| Naruszenie kontraktu PANEL_CODEX | niskie | żadnej zmiany w `core/panel/*.mjs` poza `theme.mjs`; znacznik odnogi budowany w pluginie; kontrola `git diff` przed commitem |

## Etapy wdrożenia

| # | Co | Szacunek | Widoczny efekt |
|---|---|---|---|
| 1 | Z10: eksperyment Łukasza → budżet wagi, test na prawdziwej liście | 1–2 h | archiwum się rozwija |
| 2 | Z12a: rozpoznanie fokusu, plik, znacznik w pomiarach, pasek „plan” | 2–3 h | pasek pokazuje AUDYT_MODOW, koszty idą do odnogi |
| 3 | Z12b: postęp odnogi z paczek, wiersz „Ta sesja” w Teraz, lista „Zmień” | 2–3 h | pasek postępu z paczkami Z |
| 4 | Z12c: raport korekty historii tej sesji → „tak” → zapis | 1 h | Etapy w Kosztach bez PANEL_CODEX |
| 5 | Z11: brief i `PROMPT_Z11_FABLE.md` (ta sesja); makiety (sesja Fable); wdrożenie po akceptacji (Opus) | 0,5 h + sesja Fable + 2–3 h | nowy pasek cache |
| 6 | Z8b: wydanie relai-panel 0.11.0, relai-progress 0.4.0, relai-cache-keeper 0.5.0 | 1 h | po „tak” Łukasza |

Kolejność daje efekt wcześnie: błąd (1) i przypisanie (2) zanim przyjdzie wizualna przebudowa (5).
Każda paczka kończy się commitem i wpisem w „Dzienniku wdrożenia” karty.

## Do rozstrzygnięcia przez człowieka

1. **Akceptacja tego aneksu** (całość albo z poprawkami).
2. **Wynik eksperymentu z archiwum** (Z10, krok przed kodem).
3. **Wybór wariantu paska cache** po makietach sesji Fable (Z11).
4. **„Tak” dla korekty historii** po raporcie „było → będzie” (Z12c).
5. **Wydanie Z8b** — wersje i termin (publikacja tylko po „tak”).
