# ODNOGA — guard hooków rozpoznaje projekt po ścieżce edytowanego pliku

Plan: [ROZWOJ_PO_WYDANIU](../../STATUS.md) · Etap-źródło: E10 planu BUDOWA_RELAI (pozycja domknięta
w E6) · Utworzona: 2026-08-17 · Status: **OTWARTA** · Wykonawca: Opus

## Cel

Zapis do pliku należącego do projektu RelAI jest sprawdzany przez guardraile **niezależnie od tego,
w jakim katalogu uruchomiono sesję** — dziś marker projektu szukany jest wyłącznie od katalogu
roboczego sesji (`core/process/session-signals.js:48`), więc sesja otwarta gdzie indziej zapisze
sekret do cudzego projektu RelAI i zmieni jego `CLAUDE.md` bez jednego ostrzeżenia.

## Skąd się wzięła

Wykryte przy pracy nad E10 planu BUDOWA_RELAI (2026-08-10) i odłożone świadomie przed 1.0.0 —
guard jest wspólny dla dziewięciu hooków, a scenariusz wydawał się marginalny. Przestał być
marginalny: w pilotażu E6 (2026-08-17) sesja uruchomiona w repozytorium RelAI pisała pliki
w projekcie `ProbaCursorE6`, a adaptery Cursora i Codeksa czynią pracę międzyprojektową normą,
nie wyjątkiem. Pozycja blokowała rotację dziennika i została na tę okazję rozstrzygnięta:
naprawiamy, ale osobno.

## Zakres

1. `core/process/session-signals.js` — `relaiMarkerFile()` szuka markera **także od katalogu
   edytowanego pliku w górę** (do korzenia repozytorium albo do wyczerpania ścieżki), zachowując
   dzisiejsze sprawdzenie po katalogu sesji. Tryb gościa nadal wygrywa: marker gościa znaleziony
   po drodze wycisza guard.
2. `adapters/claude-code/hooks/secret-scanner.js` i `config-protection.js` — rozpoznanie projektu
   liczone od ścieżki pliku z `tool_input`, nie od `cwd`; to samo w
   `adapters/cursor/hooks/secret-scanner.js`.
3. Sprawdzenie `isGitIgnored()` — dziś woła `git check-ignore` z `cwd` sesji; ma być wołane
   z katalogu projektu, do którego należy plik, inaczej wynik dotyczy cudzego repozytorium.
4. Pozostałe hooki adaptera Claude Code (osiem z własną kopią `isGuest`) — przepięte na rdzeń albo
   świadomie zostawione, z powodem zapisanym w `core/README.md`.

## Poza zakresem

- Zmiana zestawu chronionych plików i zasad `config-protection` (co jest chronione, zostaje).
- Wzorce wykrywania sekretów — `secret-scan.js` bez zmian.
- Adapter Codeksa (E7) — jeśli powstanie wcześniej, dziedziczy poprawiony rdzeń bez własnej pracy.

## Weryfikacja

- [ ] Sesja z katalogiem roboczym **poza** projektem RelAI, zapisująca sekret do pliku śledzonego
      w projekcie RelAI, dostaje blokadę (dowód: plik nie powstał).
- [ ] Ta sama sesja przy zapisie czystej treści do tego samego pliku nie dostaje żadnego
      komunikatu (dowód, że test nie jest pusty).
- [ ] Plik w projekcie z markerem trybu gościa nadal nie jest pilnowany — z obu kierunków
      rozpoznania.
- [ ] `git check-ignore` liczony względem projektu pliku: sekret w `.env` projektu docelowego
      przechodzi, ten sam sekret w pliku śledzonym nie.
- [ ] Instrument porównawczy dwóch adapterów (L-0040) w jednym przebiegu: komplet zgodnych
      werdyktów przed zmianą i po niej dla materiału z katalogu sesji.
- [ ] `node core/tools/validate-adapters.js` → kod 0.

## Wynik

—
