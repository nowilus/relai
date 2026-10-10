# ODNOGA — mody Claude Code po audycie: spokojne paski, szybki panel, zero błysków

Plan: brak (wątek samodzielny) · Etap-źródło: — · Utworzona: 2026-10-10 · Status: **OTWARTA** ·
Wykonawca: **Opus 5.5** (decyzja Łukasza 2026-10-10: Opus do zadań optymalizacyjnych i rozpoznawczych;
projekt UX/UI zamknięty przez Fable 5.1 w briefie v2)

> **Aneks A (zaakceptowany 2026-10-10):** [ANEKS_A.md](ANEKS_A.md) — Z10 archiwum w drzewie,
> Z11 pasek cache, Z12 fokus sesji.

## Cel

Trzy mody RelAI (`relai-panel`, `relai-progress`, `relai-cache-keeper`) rysują nad promptem
w spokoju trzy wiersze bez żadnego przycisku, a drugi wiersz tylko wtedy, gdy jest powód; panel
`/relai-panel` otwiera się i reaguje na klik bez powtarzania I/O (żadnego spawnu `git`, żadnego
parsowania pomiarów na błysk przycisku) i nigdy nie znika bez słowa; żaden pasek nie przerysowuje
się, gdy nic na nim się nie zmieniło; liczby o pieniądzach i cache pochodzą z jednego źródła
i jednego formatu. Po czym poznać: kryteria odbioru w [briefie v2](../../zasoby/PANEL_RELAI/STYL_PASKOW_CLAUDE.md#9-kryteria-odbioru-v2)
i sekcja „Weryfikacja” niżej.

## Skąd się wzięła

Po wydaniu 2.8.0 (plan PANEL_CLAUDE zamknięty 2026-10-10) Łukasz zgłosił, że paski zabierają
za dużo miejsca (22 % okna), migoczą i przeładowują się bez powodu, a panel „ma aż nadto
informacji — przeładowanie danych zabija jego cel”. Audyt w tej sesji (trzy soczewki równolegle:
best practices modów, wydajność/re-render, kod i logika UX; potem sceptycy na Opus) dał
**101 ustaleń** (94 po deduplikacji: 80 potwierdzonych, 11 prawdopodobnych, 3 obalone; pełna lista z werdyktami: [RAPORT.html](RAPORT.html)).
Projekt wizualny przeszedł cztery rundy kalibracji na makietach ([MAKIETY.html](MAKIETY.html))
i jest zamrożony w briefie v2. Plan PANEL_CODEX (E1 w toku w Codeksie) dzieli z tym wątkiem
rdzeń `core/panel/` — dlatego rdzeń poza `theme.mjs` jest tu nietykalny.

## Zakres

Osiem paczek; każda ma własne checkboxy w „Weryfikacji” i da się zamknąć w jednej sesji.
Kolejność: najpierw fundamenty (Z3–Z5), bo bez nich nowe paski będą migać tak samo.

1. **Z3 · Panel bez I/O w rysowaniu** — `panel/hooks/register.tsx` (hook `ui.render` Pane, loadery
   `costData`/`mapData`/`docsData`), `panel/hooks/pane-parts.tsx` (`btn`/`flash`): dane zakładki
   liczone na zdarzeniach (otwarcie zakładki, `turn.complete`, zapis karty) i trzymane w pamięci
   modułu z kluczem unieważnienia (id sesji, `turnId`, mtime z `$.fs.list`, data cennika); rysowanie
   czyta pamięć. Błysk `pressed` tylko dla kontrolek, które go pokazują (karty wysyłki), nigdy dla
   zakładek, zwijania i przełączników; drugi zapis po 900 ms nie uruchamia loaderów. Otwarty
   dokument liczy **albo** diff **albo** podgląd. Hook Pane z `.catch`, który rysuje zdanie zamiast
   zamykać panel. Limity i budżet rysunku: kafle dokumentów (jak drzewo: 40 na grupę + „… jeszcze N”),
   diff (200 wierszy + „pokaż dalej”), karty kosztów (agenci/modele/etapy po 12 + zwijanie), jedna
   kopia fontu Kalam na zakładkę zamiast osobnej w każdym Svg liczby — z testem sumującym rozmiar
   drzewa dla najgorszych danych (próg roboczy 200 tys. znaków, P-023 pkt 7).
2. **Z4 · Paski bez pustych przerysowań** — `cache-keeper/hooks/register.tsx`: tick liczy czas
   następnej zmiany napisu (pełna minuta, próg stygnięcia) i tylko wtedy woła `invalidate`;
   `saveSnap` po zmianie stanu, nie co 30 s. `progress/hooks/register.tsx`: `hasPanel` ustalane raz
   (w `session.start` i po `command.register`), nie przez `$.command.list()` w każdym rysowaniu;
   tick 10 s najpierw porównuje `mtimeMs` z `$.fs.list` katalogu planu i promptu, czyta pliki tylko
   po zmianie; atom `agents` zapisywany tylko, gdy zmieniło się coś rysowanego (status, kroki,
   kontekst zaokrąglony do 1k); `tool.call` nie blokuje zwrotu narzędzia (refresh przez
   `$.clock.after(0)`). `panel/hooks/register.tsx`: `turn.step` czyta plan tylko po zmianie
   mtime `STATUS.md`; znacznik „zmienione w tej turze” w atomie `$.state` (rysuje go tylko zakładka
   Dokumenty) zamiast `invalidate('ui.render')` dla wszystkich pasków; `$.session.usage()` w
   `turn.complete` zastąpione wartościami z `session.measure`; `readText` jako jedno `$.fs.read`
   z `catch`. Kolektor: rekordy w pamięci, zapis pliku na `turn.complete` i `session.compact`
   (nie na każdy krok), błąd zapisu słowami w panelu.
3. **Z5 · Poprawność** — `cache-keeper/hooks/register.tsx`: reset stanu po `/clear` przez
   `session.end` z `reason === 'clear'` i porównanie `$.session.id()` przy użyciu (P-020 pkt 4),
   `classic.SessionStart` usunięty; odrzucenie `ui.ask` (Esc) = „Anuluj”, nie „Wyślij mimo to”;
   nieudany `compact` **nie** wysyła wiadomości; hotkey cyfrowy `1` usunięty (litery zostają).
   `progress/hooks/register.tsx`: koszt agenta z zapisanej listy cen (`priceAt` z kopii
   `pricing.mjs` + `cennik.json`), ta sama kwota co w zakładce Koszty. `cache-keeper/hooks/pricing.ts`:
   stawki z kopii `relai/pricing.mjs` zamiast własnej tabeli.
4. **Z1 · Paski wg briefu v2** — `panel/hooks/band.tsx` (pasek planu: jeden wiersz, bez kosztu,
   etykieta `plan`, drugi wiersz karty decyzji), `progress/hooks/register.tsx` (segmenty + linia
   pod nimi w jednym Svg, chip agentów zamiast przycisku, bez „Panel RelAI”, drugi wiersz
   „odhaczony punkt” na 10 s), `cache-keeper/hooks/register.tsx` (cztery pierścienie z podpisem
   dwuliniowym, koszt sesji raz, drugi wiersz stygnięcia/przekazania), `core/panel/theme.mjs`
   (tokeny pierścieni i progów kolorów; etykieta 14 komórek). Odpowiednik terminalowy każdego
   elementu.
5. **Z2 · Panel wg briefu v2** — `panel/hooks/register.tsx` i `pane-parts.tsx` (nagłówek z
   zakładkami w jednym wierszu, bez zdania o 14 komendach, pasek „Teraz” z jedną akcją główną,
   zakładki `Komendy · Koszty · Dokumenty · Mapa · Pomoc`), `pane-commands.tsx` (dwie karty
   polecane, 12 wierszy z nazwą komendy, formularz pod wierszem), `pane-costs.tsx` (sekcje
   zwinięte z podsumowaniem, procenty bez setnych), linia `sent` wygasająca po 10 s i bez surowych
   błędów silnika.
6. **Z6 · Jedno źródło, jeden format** — trzy `fmt.ts` identyczne (test równości jak dla kopii
   rdzenia) albo jedna wersja w każdym modzie z `usd`/`tokens` o tym samym wyniku; jeden cennik
   dla trzech modów (kopia `pricing.mjs` + `cennik.json`); `barCard` w jednej postaci w `band.tsx`
   i cache-keeperze (ten sam kod, test równości). Martwy kod i nieaktualne komentarze z listy
   CODE-18/CODE-19 raportu.
7. **Z7 · Testy pilnujące obietnic** — test liczący rysowania i wywołania `$` na klik, znak
   i tick (atrapa `$` z licznikami) dla każdego modu; test budżetu drzewa dla najgorszych danych
   (archiwum 128 plików, diff 400 wierszy, sesja załogi z 12 agentami); testy hooków cache-keepera
   (strażnik, ping, przekazanie, `/clear`) na atrapie `$`; testy `fmt`.
8. **Z9 · Ekonomika przekazania: kontynuować czy nowa sesja** (prośba Łukasza 2026-10-10) —
   `cache-keeper/hooks/economics.ts` (czysta funkcja, testowana) + `register.tsx` (pasek, `/cache`):
   dla bieżącej sesji liczy **koszt następnej tury tu** (odczyt cache całego kontekstu `ctx` po
   stawce odczytu modelu; przy cache zimnym — ponowny zapis `ctx` po stawce zapisu; plus średnie
   wyjście tury z pomiarów sesji) i **koszt po przekazaniu** (jedna tura przekazania z obecnym
   kontekstem + zapis warstwy startu projektu `S` — rozmiar z raportu hooka startu albo z sumy
   plików rytuału — potem tury na kontekście `S`), stąd **liczbę tur, po których nowa sesja się
   zwraca**: `(koszt_przekazania + S·zapis) / ((ctx − S)·odczyt)`. Druga waluta: **zmierzone tempo
   limitu 5 h na turę** — różnice `rateLimits.percentUsed` z `session.measure` między kolejnymi
   `turn.complete`, średnia z ostatnich 5 tur, odniesiona do tokenów tury; prognoza po
   przekazaniu proporcjonalnie do `S/ctx`. Wynik słowami: „nowa sesja zwróci się po N turach
   (≈ $x/turę teraz vs ≈ $y po; 0,8 % limitu 5 h/turę vs 0,2 %)”. **Próg:** zdarzenie w drugim
   wierszu paska cache („nowa sesja zwróci się po N turach · Przekaż”), gdy N ≤ 5 **albo** cache
   zimny i `ctx > 2·S`; próg zmienny `/cache zwrot 5`. Pełny rachunek z założeniami (stawki, TTL
   założony/zmierzony, S) w odpowiedzi `/cache`. Brak którejkolwiek liczby — zdanie o braku,
   nie pozorna rekomendacja.
9. **Z8 · Wydanie** — `relai-panel` 0.10.0, `relai-progress` 0.3.0, `relai-cache-keeper` 0.4.0;
   `claude plugin validate` + `plugin test` ×3, `core/tools/validate-adapters.js`, sekwencja P-005
   (marketplace, tag, release, update, restart, pomiar na żywo zrzutem człowieka). **Publikacja
   wyłącznie po „tak” Łukasza.**

## Poza zakresem

- `core/panel/*.mjs` poza `theme.mjs` — kontrakt planu PANEL_CODEX (16 pól rekordu, eksporty).
  Ustalenia oznaczone w raporcie `outOfScope` (m.in. odchudzenie kopii rdzenia per plugin
  w `core/tools/sync-panel-core.js`, 254 KB `headings.mjs` w progress i cache-keeperze) czekają na
  osobną decyzję — są spisane, nie zrobione.
- Wariant B „jedna listwa” (zależności między pluginami) — kandydat na plan, nie na wątek.
- Przebudowa zakładek Mapa i Dokumenty poza limitami rozmiaru (UX-12, UX-13 raportu).
- `userConfig` dla ustawień cache-keepera (BP-09) i przedrostek `relai-` dla jego komend (CODE-20).
- Adapter Codeksa i panel natywny Codeksa.
- Rotacja dokumentów projektu (dziennik 273 KB, lekcje, ryzyka) — osobna czynność rytuału sesji.

## Weryfikacja

- [x] Z3: test z licznikami dowodzi, że klik przycisku zakładki Koszty wykonuje 0 wywołań
      `$.fs`/`$.process` (dane z pamięci), a otwarcie zakładki — jeden przebieg loadera.
      Dowód: `panel/hooks/redraw.test.ts` — „costs: opening the tab reads its data once…”
      (ponowne zamontowanie i koniec błysku: 0 wywołań; ponowny wybór zakładki: drugi przebieg)
      i „documents: a filter, a layout and a fold redraw from memory…” (0 `git`, 0 listowań;
      „Otwórz” = 1 `git diff` bez odczytu pliku, „Podgląd” = 1 odczyt bez `git`).
- [ ] Z3: drzewo panelu dla archiwum 128 plików, diffu 400 wierszy i 12 agentów mieści się
      w budżecie (test), a desktop pokazuje panel (zrzut).
      Test ✓ (`redraw.test.ts`, próg 200 000 znaków): Dokumenty z archiwum 128, wszystkimi
      grupami i diffem 400 wierszy — 189 903 znaków / 19 Svg (przed: 1 515 831 / 417); Koszty
      z 14 agentami, 14 etapami i 400 wywołaniami — 190 566 / 30 Svg (przed: 373 968 / 57).
      **Zrzut z desktopu czeka** na pomiar na żywo (podłożenie `--plugin-dir` albo wydanie Z8).
- [x] Z4: w bezczynności przez 5 minut licznik `invalidate` trzech modów = liczba pełnych minut
      zmiany napisu cache (test ticka z zegarem atrapy); `$.command.list()` nie jest wołane
      w rysowaniu (test).
      Dowód: `cache-keeper/hooks/tick.test.ts` — 5 minut bezczynności: 5 `invalidate` (~60 → ~55;
      przed zmianą zmierzone 10) i 0 zapisów `$.store`; 30 minut zimnego cache: 30 `invalidate`
      (przed: 60); 90 minut bezczynności: 3 zapisy stanu — tura i dwa ostrzeżenia. `progress/hooks/progress.test.ts` „five idle minutes…”: 0 odczytów plików
      (przed: 120), `command.list` poza rysowaniem; kontrola pozytywna w tym samym teście —
      odhaczony punkt czytany przy następnym ticku. Panel nie ma ticka; `redraw.test.ts` „twenty
      steps…”: 20 kroków tury z zapisem pliku — 0 `invalidate`, 0 odczytów `STATUS.md`, 0 zapisów
      pliku pomiarów do końca tury.
- [x] Z5: `/clear` zeruje stan cache-keepera (test `session.end` z `reason: 'clear'`); Esc
      w strażniku nic nie wysyła; koszt agenta w `/relai-agents` = kwota tej samej pozycji
      w zakładce Koszty (test na wspólnych danych).
      Dowód: `cache-keeper/hooks/correctness.test.ts` (7 testów: `/clear` przez `session.end`,
      zmiana id bez `session.end`, Esc = „Anuluj”, kompakcja zawetowana i rzucająca — nic nie
      wysłane, brak skrótu cyfrowego, model tylko w `cennik.json`, model spoza list) i
      `pricing.test.ts` (6, ta sama kwota co `priceAt` rdzenia); `progress.test.ts` „an agent on a
      model only cennik.json prices costs what the Costs tab counts…” ($1.82, policzone ręcznie
      w teście; przed zmianą „brak ceny”). Każdy nowy test padał na starym kodzie poza jednym
      oznaczonym kontrolnym. **Pomiar na żywo, że `session.end` z `reason: 'clear'` odpala — czeka.**
- [ ] Z1: trzy paski w spokoju bez przycisków, ≤ 160 px przy 1400 px (zrzut Łukasza); każdy
      stan z tabeli briefu otwiera drugi wiersz tylko pod swoim paskiem (testy); koszt sesji raz.
      Testy ✓: `panel/hooks/band.test.ts` (7: wiersz planu bez kosztu, drugi wiersz tylko przy
      karcie, „Nie”/„Tak” ścieżką `decide`), `progress.test.ts` (27: zero przycisków, chip agentów,
      linia pod segmentami, `a/b punktów`, drugi wiersz 10 s po odhaczeniu), `cache-keeper`
      `rings.test.ts` (14: cztery pierścienie z podpisami, progi 69/70/89/90 i 35/15 % TTL,
      „brak danych”, koszt sesji raz, wiersze stygnięcia/przekazania/Z9/podtrzymania tylko w swoim
      stanie), `core/panel/tests/theme.test.js` (progi kolorów). **Zrzut ≤ 160 px przy 1400 px
      czeka** na pomiar na żywo (Łukasz).
- [ ] Z2: 14 komend bez przewijania przy 900 px (zrzut), nazwa komendy obok polskiej, „Teraz”
      z jedną akcją główną, Koszty ze zwiniętymi sekcjami w `$.state`.
      Testy ✓: `panel/hooks/pane-v2.test.ts` (19: nagłówek z zakładkami w jednym wierszu, bez
      zdania o 14 komendach, „Teraz” z jedną akcją, wiersze z nazwą komendy, formularz pod wierszem,
      Koszty zwinięte w `unfolded`, `sent` wygasa po 10 s; szacunek wysokości Komend 865 px przy
      budżecie 900). **Zrzut przy 900 px czeka** na pomiar na żywo.
- [x] Z6: test równości trzech `fmt.ts` i dwóch `barCard`; `usd(11.73)` daje ten sam napis
      w trzech modach.
      Dowód: `core/panel/tests/mods-parity.test.js` (5: trzy `fmt.ts` i trzy `bar-card.tsx`
      równe po CRLF→LF, kontrola na podłożonej różnicy; przed zmianą 4 padały) i
      `cache-keeper/hooks/fmt-shared.test.ts` (9: `usd(11.73)` = `$11.73` wszędzie — pasek cache
      pokazywał `$12`; `tokens(999_999)` = `1.0M`, nie `1000k`).
- [x] Z7: `claude plugin test` ×3 zielone; nowe testy wymienione z nazwy we wpisie dziennika.
      `plugin test`: panel 107/107, progress 29/29, cache-keeper 84/84; nowe pliki
      `promises.test.ts` ×3 (nazwy w linii Z7 dziennika wdrożenia niżej).
- [x] Z9: test funkcji na trzech przypadkach z liczbami policzonymi ręcznie w teście (cache
      ciepły z małym kontekstem → „nie opłaca się”, cache ciepły 800k → N ≤ 5, cache zimny
      z `ctx > 2·S` → zdarzenie); drugi wiersz paska pojawia się tylko po przekroczeniu progu
      (test modu); `/cache` pokazuje rachunek z założeniami; brak danych słowami.
      Dowód: `cache-keeper/hooks/economics.test.ts` (8 testów; trzy przypadki karty z liczbami
      w teście: 100k ciepły → N = 22, „zostań”; 800k ciepły → N = 3, zdarzenie; 200k zimny przy
      S = 30k → zdarzenie z powodu „cache zimny”) i `handoff-economics.test.ts` (10: drugi wiersz
      tylko ponad progiem, `Zostań` do wzrostu kontekstu o 20 %, `/cache zwrot 2`, rachunek
      w `/cache`, brak S słowami, pomiar S po pierwszej turze, szacunek z plików rytuału).
- [ ] Z8: `plugin validate` ×3, walidator adapterów, pomiar po restarcie treścią plików z cache
      (P-005); publikacja po „tak”.
      ✓ „tak” Łukasza 2026-10-10; `plugin validate` ×3 i repo, walidator adapterów, testy
      107/29/84 i `node --test` 274/274; commit `52d0f70`, tag `relai-panel-v0.10.0`, release na
      GitHubie; `plugin marketplace update` + `plugin update` ×3 (0.9.0→0.10.0, 0.2.0→0.3.0,
      0.3.0→0.4.0); pliki w `~/.claude/plugins/cache/relai/<plugin>/<wersja>/` porównane sumą
      z repo — 0 rozjazdów. **Czeka: restart aplikacji i pomiar na żywo.**
- [x] `git diff` nie dotyka `core/panel/*.mjs` poza `theme.mjs` ani niczego w `adapters/codex/`.
      `git diff --stat ecb8282 HEAD -- core/panel adapters/codex docs/plany/PANEL_CODEX`: tylko
      `core/panel/theme.mjs` i dwa testy w `core/panel/tests/` (2026-10-10, po Z7).
- [ ] Katalog roboczy `.claude/relai/work/_fixy/AUDYT_MODOW/` przejrzany raportem
      (`node .claude/relai/tools/clean-work.js raport`) i skasowany po „tak”; liczby przed i po
      we wpisie dziennika; artefakty spoza katalogu z nazwy.

## Dziennik wdrożenia

Jedna linia na zamkniętą paczkę; pełny wpis do `docs/DZIENNIK.md` dopiero w rytuale zamknięcia.

- **2026-10-10 · Z3 zamknięta** (Opus 5.5) — dane zakładek Koszty/Mapa/Dokumenty w pamięci
  modułu z kluczem (id sesji, `epoch` podbijany na otwarciu zakładki, `/relai-panel`,
  `turn.complete`, nowych ścieżkach w `turn.step`, zapisie scaleń i karty z zapisem, kompakcji,
  zmianie planu w trakcie tury i pierwszym kroku nowej tury — trzy ostatnie po recenzji
  `typescript-reviewer`); Dokumenty: półka osobno, otwarty dokument liczy diff **albo** podgląd;
  błysk tylko z etykietą „✓…”, „Przygotuj” i „Tak”; `.catch` hooka Pane rysuje zakładki
  i zdanie; kafle 40/grupę i 60/zakładkę, diff stronami
  po 200 wierszy (atom `diffPage`), karty kosztów 12 najdroższych + wiersz reszty; `git` z limitem
  8 s (pod budżetem hooka 10 s). Testy: `plugin test panel` 75/75 (+5 w `redraw.test.ts`), `tsc`
  strict 0 błędów (kontrola pozytywna: podłożony błąd złapany), `node --test` 263/263.
  **Odstępstwa od karty, z powodem:** (1) „jedna kopia fontu Kalam na zakładkę” jest
  niewykonalna — każdy `Svg` rysuje się osobno (P-023 pkt 8: ramki izolowane), więc font nie
  przechodzi między nimi; zamiast tego budżet 8 liczb Kalamem na rysunek (suma i kafle pierwsze,
  dalsze pogrubionym tekstem w tym samym kolorze) — w zwykłej sesji wygląd bez zmian; (2) przy
  otwartym dokumencie kafli 16, nie 60 — strona diffu (~120 tys. znaków) i 60 kafli (~167 tys.)
  razem przekraczały próg; (3) wykres wywołań: kolumna na wywołanie do 60 wywołań jak dotąd,
  powyżej najwyżej 40 kolumn zamiast 60 (−26 tys. znaków; słupek łączy więcej wywołań, opis to
  mówi). Świadomie zostaje: liczby linii z `git` i `cennik.json` zmienione poza sesją (ręczny
  commit) odświeżają się dopiero wyborem zakładki albo po turze. Zrzut z desktopu dla budżetu
  drzewa czeka na pomiar na żywo.
- **2026-10-10 · Z4 zamknięta** (Opus 5.5) — cache-keeper: tick przerysowuje pasek tylko, gdy
  zmieniły się jego słowa (stempel: stan, liczba po prawej, kontekst, zapis, limity, koszt sesji,
  pingi, przekazanie), stan zapisuje tylko po zmianie i co najmniej raz na 60 min (strażnik 2 h
  w `restoreSnap`). progress: tick pyta o czasy (`$.fs.stat`) plików ostatniego odczytu i czyta je
  tylko po zmianie; przebieg załogi czytany ponownie co 5 min, żeby po swoim oknie zszedł z paska;
  `hasPanel` na starcie i raz po 2 s, nie w rysowaniu; `tool.call` oddaje wynik narzędzia od razu
  (`$.clock.after(0)`); atom `agents` tylko po zmianie rysowanego; plik pomiarów parsowany
  w panelu agentów tylko po zmianie. panel: `readText` jednym `$.fs.read`; plan w `turn.step`
  czytany tylko po zmianie czasu `CLAUDE.md`/`STATUS.md` (stempel brany przed odczytem);
  „zmienione w tej turze” w atomie `turnChanged` czytanym tylko przez zakładkę Dokumenty, bez
  `invalidate` pasków; koszt z `session.measure` (przerysowanie, gdy się zmienił), bez
  `$.session.usage()` po turze; kolektor w pamięci, plik zapisywany po turze (też subagenta —
  przed jej zwrotem), po kompakcji, przy otwarciu zakładki z pomiarami i 5 s po ostatnim rekordzie;
  sesja zostawiona przez `/clear` czeka na udany zapis; błąd zapisu słowami w Kosztach. Po recenzji
  `typescript-reviewer` poprawione 9 z 10 uwag (dziesiąta: nazwa testu). Testy: `plugin test`
  panel 78/78, progress 19/19, cache-keeper 21/21 (+ 8 testów Z9 jeszcze poza commitem), `tsc`
  0 błędów, `validate` ×3, `node --test` 263/263; kontrola pozytywna testu wygasania załogi —
  przy wyłączonym ponownym odczycie test pada. **Świadomie zostaje:** koszt działającego agenta
  w panelu agentów spóźnia się do 5 s; cache-keeper nadal pyta `$.session.usage()` po turze
  (karta wymieniała tylko panel).
- **2026-10-10 · Z5 zamknięta** (Opus 5.5 + dwóch subagentów Opus 5.5 równolegle: cache-keeper
  i progress) — cache-keeper: reset po `/clear` przez `session.end` (`reason: 'clear'`) i
  porównanie `$.session.id()` przy użyciu stanu, `classic.SessionStart` usunięty; Esc w strażniku =
  „Anuluj”; skrót `1` usunięty, teksty mówią „przycisk Podtrzymaj”; ceny z kopii `pricing.mjs`
  rdzenia + `cennik.json` projektu (własna tabela 16 modeli usunięta; `ratesFor` dla Z9).
  **Odstępstwo z powodu silnika:** 2.1.295 odrzuca `$.session.compact()` wewnątrz `prompt.submit`
  (stara ścieżka „compact, potem wyślij” nigdy nie działała — połykała odmowę i wysyłała z pełnym
  zapisem); teraz wiadomość jest wstrzymana, kompakcja idzie po hooku, wiadomość wraca po udanej,
  a przy nieudanej toast „nic nie wysłano” (załączniki pierwotnej wiadomości nie wracają).
  progress: koszt agenta `priceAt` + `cennik.json` (pamięć po czasie pliku), podpis z datą listy,
  błąd pliku słowami. Testy: panel 78/78, progress 22/22, cache-keeper 36/36 (+8 Z9 poza
  commitem), `tsc` 0, `validate` ×3, `sync-panel-core --check` zgodne, `node --test` 263/263.
  **Do decyzji człowieka:** poza projektem z zapisanym `cennik.json` cache-keeper wycenia tylko
  Opus 5.5 (wbudowany cennik rdzenia) — inne modele mają „cena nieznana” zamiast dawnych stawek
  z własnej tabeli. Import `pricing.mjs` ciągnie do cache-keepera `decisions.mjs`.
- **2026-10-10 · Z9 zamknięta** (dwóch subagentów Opus 5.5: czysta funkcja, potem podpięcie) —
  `economics.ts` liczy koszt następnej tury tu i po przekazaniu, liczbę tur zwrotu
  `(przekazanie + S·zapis) / ((ctx − S)·odczyt)`, tempo limitu 5 h (średnia 5 tur) i prognozę
  po przekazaniu; brak liczby = zdanie o braku. Podpięcie w `register.tsx`: średnie wyjście
  i tempo 5 h z ostatnich 5 tur; **S mierzone** — kontekst po pierwszej turze świeżej sesji
  (też po `/clear`), zapisany w `$.store` dla projektu z datą; zapas: pliki rytuału ÷ 4
  (dziennik — pierwsze 12 KB), opisany jako szacunek; poza RelAI bez pomiaru — brak S słowami.
  Drugi wiersz paska cache z `Przekaż` (przeniesiony, `h` raz) i `Zostań`; `/cache zwrot N`
  (1–50, domyślnie 5); pełny rachunek w `/cache`. Testy: cache-keeper 54/54, `tsc` 0, `validate`.
  **Odstępstwa:** tempo 5 h odniesione do kontekstu tury na jej końcu (daje wprost proporcję
  S/ctx z karty); źródło S „pomiar po pierwszej turze” dodane przed „plikami rytuału” — raport
  hooka startu nie jest dostępny dla modu. Wygląd wiersza — do przestylowania w Z1 (pierścienie).
- **2026-10-10 · Z1 zamknięta w kodzie** (trzech subagentów Opus 5.5: motyw + pasek planu,
  pasek postępu, pierścienie cache; commity `46aad69` i następny) — wg briefu v2: etykiety
  `plan`/`postęp`/`cache`, kolumna 14 komórek, `RING`, `usageColor`, `cacheColor`, `CHIP`
  w motywie; pasek planu jednym wierszem bez kosztu, drugi wiersz z kartą „Tak/Nie”; pasek postępu
  bez przycisków (chip agentów, linia pod segmentami w tym samym Svg, drugi wiersz po odhaczeniu
  w `$.state`); pasek cache jako cztery pierścienie z podpisem dwuliniowym, `sesja ≈ $` raz,
  jeden drugi wiersz naraz (priorytet: przekazanie gotowe > trwa > stygnie > zdarzenie Z9 >
  podtrzymanie). **Rozjazd briefu i karty rozstrzygnięty na rzecz karty:** brief §1 daje
  „Podtrzymaj (hotkey 1)”, karta Z5 każe usunąć skrót cyfrowy (połykał pierwszą cyfrę wiadomości)
  — skrótu cyfrowego nie ma. **Dodane poza briefem:** wiersz „przekazanie trwa” (sam chip, bez
  przycisków); format dat resetu (`reset HH:MM`, `jutro HH:MM`, `D.MM HH:MM`, `reset nieznany`).
  Testy: panel 85, progress 27, cache-keeper 68, core 170. Do Z6: `fmt.tokens(999_999)` daje
  `1000k`. **Czeka:** zrzut z desktopu (≤ 160 px przy 1400 px; czy Svg segmentów zajmuje całą
  kolumnę obok chipa — P-021 pkt 3).
- **2026-10-10 · Z2 zamknięta w kodzie** (subagent Opus 5.5) — nagłówek „Panel RelAI” z zakładkami
  `Komendy · Koszty · Dokumenty · Mapa · Pomoc` (Ściąga + Frazy jako Pomoc, stare nazwy w `$.state`
  otwierają Pomoc); „Teraz” (`pane-now.tsx`) z planu i przebiegu załogi przez kopię
  `progress.mjs`, pamięć `remember`, jedna akcja „Start etapu…”; Komendy: dwie karty polecane
  i 12 wierszy z nazwą komendy, formularz pod wierszem; Koszty: sekcje zwinięte z podsumowaniem,
  procenty całkowite (`<1 %` powyżej zera); linia `sent` wygasa po 10 s, czyszczona przy zmianie
  zakładki i formularza, błąd zaczyna się zdaniem „co zrobić”. Testy panel 103/103, `tsc` 0,
  `validate`. **Do Z6:** `register.tsx` ma 975 linii (> 800) — podział do zrobienia.
- **2026-10-10 · Z6 zamknięta** (dwóch subagentów Opus 5.5) — jeden `fmt.ts` i jeden
  `bar-card.tsx`, bajt w bajt w trzech pluginach (siatka paska bez `$`, `BAR` podawany z
  zewnątrz, bo motyw leży pod różnymi ścieżkami); `usd` zawsze z centami, `usd(null)` = „cena
  nieznana”, `tokens` z jedną jednostką po zaokrągleniu. Martwy kod usunięty: `percentText`,
  `bar` (progress/fmt), lokalne `barCard`/`Look`/typy w trzech modach. `panel/hooks/register.tsx`
  975 → 756 linii: `pane-io.ts`, `tab-data.ts`, `card-answer.ts`, `memo.ts` — `$` nie wychodzi
  z pliku (obiekty domknięć `ioOf($)`, `actsOf($)`); raport `plugin validate` przed i po
  identyczny. Atomów `$.state` nie da się wynieść — walidator przyjmuje `update` tylko na atomie
  z tego samego pliku. Testy: panel 107, progress 29, cache-keeper 84, `node --test` 274/274,
  `tsc` 0. `cache-keeper/hooks/register.tsx` ma równo 800 linii — na granicy reguły.
- **2026-10-10 · Z7 zamknięta** (subagent Opus 5.5) — trzy pliki `promises.test.ts`, każdy licznik
  z kontrolą pozytywną: panel — znak w polu formularza i w wyszukiwarce Pomocy bez I/O, „Wyślij do
  czatu” i koniec błysku bez odczytu, Mapa: jeden przebieg loadera, zwinięcie bez odczytu;
  progress — krok agenta nieznanego i wątku głównego nie pisze stanu, przerysowanie panelu agentów
  bez ponownego odczytu niezmienionego pliku; cache-keeper — ping tuż przed TTL (51:30 nie, 52:00
  tak), zatrzymanie na limicie 5 h (89/90/85 % przy progach 90/90/80), ping, który zapisał zamiast
  odczytać, przekazanie `/handoff` → znacznik → `/handoff dalej` (`/clear`, potem
  „kontynuujemy pracę”) i brak przekazania bez znacznika. Żaden test nie znalazł błędu.
- **2026-10-10 · Z8 wydana** — `relai-panel` 0.10.0, `relai-progress` 0.3.0, `relai-cache-keeper`
  0.4.0 (`relai` zostaje 2.8.0); opisy w manifestach i marketplace, README i KOMENDY wg nowego
  zachowania; tag `relai-panel-v0.10.0` i release; aktualizacja lokalna sprawdzona treścią plików
  w cache. Pomiar na żywo po restarcie — czeka na Łukasza.
- **2026-10-10 · Z10 zamknięta w repo (Aneks A)** — po wydaniu archiwum w drzewie nie rozwijało się,
  foldery rozwijały się opornie i nie chciały zwinąć. Pierwsza poprawka (`5d1f9c4`: wiersze bez Svg,
  budżet ≤ 32 Svg) oparta na złej hipotezie — opór został, ikony zniknęły; cofnięta. Sonda
  `tree-probe` (mod deweloperski: pięć wariantów drzewa, log kliknięć do pliku) dała przyczynę:
  na desktopie drugi klik w link `Markdown` nie dociera do pluginu, tylko ruch fokusu (P-023 pkt 7a);
  `Button` dostaje każdy klik. Wiersz drzewa: ikona Svg i nazwa jako `Button plain`; limity sprzed
  Z10. Nowy test na prawdziwej liście `docs/` z 2026-10-10 (każdy folder rozwinięty przyciskiem,
  archiwum zamyka się i otwiera). Testy: panel 108/108, `tsc` 0; podmiana lokalna w zainstalowanej
  kopii 0.10.0 za zgodą Łukasza (oryginały w katalogu roboczym).

## Wynik

—
