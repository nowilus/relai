# E8 — poprawka Sol 3

Autor: RelAI (gpt-6.1-sol w Codeksie) + Lukasz · 2026-11-13
Wynik: cztery znaleziska poprawione; E8 nadal W TOKU do przeglądu i bramki Claude.

## Znaleziska

- [x] HIGH — cytowane przypisania: scanContent skanuje surowe wartości, zagnieżdżone obiekty/tablice i rozpakowane JSON-y; użyty przed pomocnikiem, narzędziami i agentem oraz w agentResult i register. Sekret nie jest zapisywany jako kopia auto ani wysyłany do pomocnika; wynik z sekretem nie dociera do agenta Research. Oryginał dla głównego czatu pozostaje dosłowny zgodnie ze specyfikacją.
- [x] MEDIUM — toolText odrzuca isError i niesukces HTTP (code/status/statusCode), także wewnątrz result i przy obecności lustrzanego text. Regresja dowodzi fallbacku WebFetch → GET; bez udanego czytnika brak źródła verified.
- [x] MEDIUM — link bez date jest pobierany; okno czasu sprawdzane po odczycie daty publikacji strony. Rozpoznawane etykiety publikacji ISO, datePublished i meta article:published_time; bez dowodu daty, przy błędnej dacie lub poza oknem źródło odrzucone. Rok w tytule/treści nie zastępuje daty publikacji. Data poprawnego duplikatu z wyszukiwarki nie ginie za URL-em planera.
- [x] MEDIUM — usage wymaga liczników input_tokens i output_tokens; podane liczniki cache też muszą być poprawne. Pusty/częściowy obiekt, typ tekstowy, NaN i wartości ujemne oznaczają koszt nieznany i zerowy deklarowany zysk. Rzeczywiste zero pozostaje kosztem znanym.

## Testy: czerwony → zielony

Komenda silnika za każdym razem: `claude plugin test --file research/hooks/<plik>.test.ts research`.
Wynik odczytywany z results[].failure raportu JSON, nie z kodu wyjścia CLI.

| Poprawka | Plik testu | Przed: pass/total | Po: pass/total |
|---|---|---|---|
| Sekret przed agentem i jego narzędziem | runtime | 5/6 | 6/6 |
| Sekret przed pomocnikiem | workflow | 16/17 | 17/17 |
| Sekret w kopercie WebSearch | register | 26/27 | 27/27 |
| Status błędu czytnika | runtime | 6/7 | 7/7 |
| Błędny czytnik → fallback/brak verified | workflow | 17/18 | 18/18 |
| Data nieznana, w oknie, stara, błędna | workflow | 18/22 | 22/22 |
| Puste/częściowe/niepoprawne usage | workflow | 23/30 | 30/30 |

Wszystkie czerwienie z AssertionError, bez błędów importu. Dodano 17 testów: 16 odtwarza defekty, jeden chroni prawidłowe zero i cache.
Końcowy zestaw silnika: runtime 7/7 + workflow 30/30 + register 27/27 + ledger 2/2 = **66/66**; żaden z 49 zastanych testów nieusunięty ani nieosłabiony.
Node: `node --test research/hooks/*.test.mjs` — sandbox: cztery błędy uruchomienia plików `spawn EPERM`, nie czerwone asercje; ten sam zestaw po zgodzie poza sandboxem **6/6**.

## Mutacje

**12/12 zabitych asercjami**; każda osobno, źródło odtworzone w finally:
- Sekrety (6): usunięcie skanu promptu pomocnika, agentResult, agentToolAllowed, koperty w register; usunięcie dekodowania JSON; pominięcie rekurencji po wartościach.
- Czytniki (2): wyłączenie isError; wyłączenie kontroli kodów HTTP.
- Daty (2): przywrócenie odrzucania linku bez date przed pobraniem; usunięcie kontroli okna po pobraniu.
- Usage (2): dopuszczenie brakujących/niepoprawnych liczników głównych; pominięcie walidacji cache.

## Pliki i granice

Kod: research/hooks/workflow.mjs, runtime.ts, register.tsx. Testy: workflow.test.ts, runtime.test.ts, register.test.ts.
Dokumenty: dopisek do istniejącego wpisu E8 w docs/DZIENNIK.md, jedna linia docs/plany/MODY_OSZCZEDZANIA/STATUS.md oraz ten raport.
PRZEGLAD_SOL.md pozostawiony jako historyczny raport przed poprawkami. Bez zmian model-router/, rdzenia, promptów, manifestów, wersji i cudzych plików. Bez subagentów, instalacji, przełączeń pluginów i commitów.
Pełne zestawy pozostałych modów/rdzenia i pomiar live nie należą do tej poprawki; pozostają bramce Claude/E10. Brak STOP w zakresie czterech usterek.
