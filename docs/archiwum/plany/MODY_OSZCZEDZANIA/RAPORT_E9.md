# E9 — kod i dokumenty do bramki Claude, 2026-11-13

## Report

Wykonawca: Terra → Sol, decyzja Łukasza po trzech przebiegach kończących bez realnej blokady (L-0336).
Kod i rytuał Codeksa gotowe. E9 W TOKU do pełnej bramki Claude; E10 nieuruchomiony.

### Zakres

- [x] 1. Generator rozdziela nagłówki odbiorców, cyfry i etykiety; barrel zachowuje cztery eksporty.
  Sync wyłącznie narzędziem, bez drugiego grafu i bez ręcznej edycji kopii.
- [x] 2. Cache Keeper: dziewięć opcji userConfig, checkpoint migracji per klucz, prefiksy komend
  `/relai-cache-keeper`, `-keepwarm`, `-handoff`; stare aliasy zachowane, konflikty aliasów opcjonalnych pomijane.
  Wariant A: migracja nie zmienia starego magazynu, późniejszy `/config` wygrywa także po przeładowaniu.
  Komendy nadal synchronizują stary magazyn dla zgodności; dane nowego formatu oznaczone jako zmigrowane.
- [x] 3. Nowe mody w kokpicie i scope. D-92: zestaw = rdzeń + osiem modów; kokpit globalny,
  nie dziewiąty przełączany mod. HOME: marker, brak markera, odmowa, lokalne false, nieznany mod.
- [x] 4. Input Router: kolumna bez width=0, sześć szerokości, najdłuższa dostępna nazwa narzędzia
  Google Drive (64 znaki), kopia od producenta, otwieranie Notes i Full result, mutant zabity.
- [x] 5. Release-map odwołuje się do dziewięciu celów; STATUS, STATE, CLAUDE/AGENTS, P-071,
  DZIENNIK i PROMPT_ETAP_10 przygotowane. ARTEFAKTY bez zmian: prompty etapowe wyłączone z rejestru.

### Testy i dowody

Dowody i instrumenty: `.claude/relai/work/MODY_OSZCZEDZANIA/E9/` (dalej: E9/).

- Baza przed: Claude `BAZA_PRZED.md`, plus czerwone asercje `cockpit-before.txt`, `input-before.txt`,
  `headings-before.txt`, `config-red.txt`; dwie poprawki przeglądu: `config-review-red2.txt`,
  `config-manifest-red.txt`. Pierwszy odczyt listy z obiektu testu był sondą API, nie dowodem regresji.
- Po: `claude plugin test --file <mod>/hooks/<plik> <mod>` osobno każdym plikiem; wyniki JSON
  czytane po `results[].failure` i `error`. Cache Keeper 211/212, panel 218/220, progress 50/51;
  mods 92/92, browser 28/28, input-router 80/80, model-router 103/103, effort 33/33, research 66/66.
  Config 6/6, kontrakt manifestu Node 1/1. `run-checks.ps1`, `final-summary.json` oraz wcześniejsze zestawy.
- Cztery porażki wyglądu odtworzone na kompletnych źródłach HEAD: panel band/costs,
  progress progress, cache-keeper terminal-grid. `baseline-summary.json`, katalogi `baseline-*`
  i odpowiadające raporty pozostają reproduktorami; testów migawkowych nie osłabiano.
- Node plikami: `node --test --test-isolation=none <plik>`; guardrails 23 pass / 10 fail,
  process 248/184, panel core 236/7, Codex 19/9, Cursor 0/10; Research Node 6/6.
  `environment-probe.cjs`: dokładnie `spawnSync node EPERM`, `spawnSync git EPERM`.
  Dokumenty padają też na `stdout.split`; nie jest to dodatnia pełna bramka.
- `mutations.ps1`: 11/11 mutantów zabitych asercjami, źródła odtwarzane w finally;
  migracja, jej jednokrotność, nietknięty stary klucz, odmowa, walidacja, wartość zapisana,
  scope, zamknięta lista, kokpit, width=0 i powrót ciężkiego barrel. `mutations-summary.json`.
- `verify-assets.cjs`: identyczne wszystkie eksporty, SVG i metryki oraz podzbiory odbiorców;
  stare dane w `headings-before.mjs`, stare widoki w `baseline-*`. Zachowano adnotacje typów.
- Pakiety: `package-bytes.json` — HEAD (bloby LF) vs bieżące śledzone + nowe nieignorowane pliki,
  bez ignorowanych typów SDK: 3 530 683 → 2 988 560 B, mniej o 542 123 B (15,35%).
  Obejmuje kod i nowe testy, nie samą liczbę plików. Osobno migawka lokalnych drzew przed/po
  w `bytes-before/after.json`; nie jest rozmiarem pobrania ani rozwiązaniem G1.

### Weryfikacja — wynik każdego punktu promptu

1. Baza/przebieg wszystkich modów i Node wykonane; pełne Node poza sandboxem: **Claude, OTWARTA**.
2. `validate-adapters.js` i `sync-panel-core.js --check` zgodne, dziewięć celów;
   `claude plugin validate` panel/progress/cache-keeper/mods/input-router passed with warnings.
   Zastane ostrzeżenia skilla/ikony; type-checker bez odpowiedzi. `tsc` niedostępny — brak deklaracji pełnego typechecku.
3. Bajty, odtworzony stary wariant i równoważność eksportów/widoków potwierdzone jak wyżej.
4. Zestaw, nazwy marketplace, pięć scenariuszy HOME sprawdzone. Nie uruchamiano prawdziwego apply/enable/install.
5. Props i kliknięcia przy 40/47/48/143/144/160 kolumnach; `input-long-final.txt` 38/38 i mutant width-zero zabity.
6. Zgodność wartości oraz dowody negatywne i mutacje: config 6/6, kontrakt 1/1, 11/11 mutacji.
7. Trivy pełny `trivy-final.json`: 0 CRITICAL / 42 HIGH / 62 MEDIUM / 14 LOW, bez nowych HIGH/CRITICAL;
   `trivy fs --scanners vuln --skip-db-update --format json --output <plik> .`, zakres z fixturami jak E8.
   Skan nowych/zmienionych testów BRAK; pozytywna próbka wykryta jako SEKRET. Brak nowych zależności.
8. Sonda i pomiar na żywo **przeniesione do E10 (Aneks C)**; formalna bramka i przegląd organizowane przez Claude.
   Pomocnicze przeglądy Sol: core APPROVE; TS dwa MEDIUM → naprawione testami najpierw czerwonymi, ponowny przegląd bez HIGH/MEDIUM.
9. Rytuał Codeksa 1–5 zapisany; statusy końcowe uzależnione od bramki, prompt E10 ma dziewięć elementów.
10. Raport `clean-work.raport` przez `clean-report.cjs` z zapisem przekierowanym wyłącznie do E9;
    `clean-raport-final.json` i `inventory.json`. Otwarty etap pominięty, dodatkowy inwentarz plików/bajtów.
    Sprzątanie po „tak” i commit zostają Claude. Codex niczego ręcznie nie usuwał ani nie commitował.

### Granice i przekazanie

- `release-check.js`: „NIE DA SIE SPRAWDZIC - git rev-parse --show-toplevel: kod null”; raport w E9.
- Zewnętrzne wyniki robocze niepowstające w E9: brak nowych pozostawionych katalogów `relai-*` w TEMP
  między migawkami; jeden zastany `relai-e7-validator-vOzuLs` zniknął w trakcie testów, bez ręcznego kasowania.
  Zastany `.claude/relai/clean-raport.json` nietknięty przez instrument końcowy; cudzy `.claude/launch.json` zachowany.
- **PYTANIE:** brak. **STOP dla bramki:** tylko udokumentowane EPERM/odczyt Git; E10 czeka na Claude.

## Poprawki po przeglądzie — 2026-11-13, Aneks C krok 6c

## Report

Autor: RelAI (gpt-6.1-sol w Codeksie, effort high) + Lukasz. Naprawione 5 × MEDIUM z WARN Sol.
Wariant A bez zmiany: stary magazyn przeżywa migrację; późniejszy jawny `/config` wygrywa.
Dowody poniżej w `.claude/relai/work/MODY_OSZCZEDZANIA/E9/`.

Polecenia: **C** = `claude plugin test --file cache-keeper/hooks/config.test.ts cache-keeper`;
**K** = `claude plugin test --file cache-keeper/hooks/commands.test.ts cache-keeper`.

| Znalezisko | Najpierw czerwone z asercji | Poprawka | Zielone po zmianie |
|---|---|---|---|
| 1. Zajęte aliasy | K: 1/19 czerwony | `command.list`, tylko wolne aliasy; cudze wywołania do `next`, własność zachowana po ponownym starcie | K: 19/19 |
| 2. Stara lista po migracji | C: 1 regresja czerwona, runtime TTL=0 | wynik z potwierdzonych `config.set.value`, bez ponownego nakładania listy; TTL=5 i downstream rewrite=60 | C: 11/11 |
| 3. Stara lista po komendzie | C: 1 regresja czerwona | `writeOptions` zwraca potwierdzony stan; runtime i magazyn zgodności dostają rzeczywistą wartość po rewrite | C: 11/11 |
| 4. Zarządzane pole | C: 3 regresje czerwone | bez zbędnych zapisów; odmowa zachowuje wartość zarządzaną i zamyka checkpoint pola; dalsze pola, komendy i timer działają | C: 11/11 |
| 5. Przestrzeń inline | C: 1 regresja czerwona | hook porównuje dokładne klucze rzeczywistych własnych wierszy, nie stałe `@relai`; obca przestrzeń nie zmienia runtime | C: 11/11 |

- Razem przed kodem: C 5/11 zielonych, 6 czerwonych; K 18/19 zielonych, 1 czerwony.
  `review-config-red-assertions.txt`, `review-commands-red-assertions.txt`: wyłącznie `AssertionError`.
  Wcześniejsze pliki `review-*-red.txt` pokazują także błędy atrap, nie są dowodem regresji.
- Mutacje: `review-mutations.ps1` → **13/13 zabitych asercjami**, `review-mutations-summary.json`.
  Kolizje, trzy ścieżki dispatch, ponowny start, stara lista, zbędne zapisy, odmowa/checkpoint,
  rewrite i obie granice przestrzeni. Odtwarzanie bajtów w `finally`, porównanie SHA-256.
- `claude plugin test cache-keeper` → kod 1, `EPERM` przy `uv_spawn` binarki Claude; `review-full.txt`.
  Bramka Claude powtarza pełny runner poza sandboxem. Zamiast deklaracji pełnej zieleni:
  `review-checks.ps1` uruchomił każdy plik osobno → **218/219**, bez błędów ładowania;
  `review-final-summary.json`. Jedyna porażka `terminal-grid` ma dokładnie te same oczekiwane
  i otrzymane hashe co zastany `baseline-summary.json`; migawki nietknięte.
- `node --test --test-isolation=none cache-keeper/hooks/config-contract.test.mjs` → **1/1**, kod 0.
- `node core/tools/sync-panel-core.js --check` → zgodne, dziewięć celów; `review-sync.txt`.
- `node core/guardrails/secret-scan.js <osiem zmienionych plików>` → **BRAK 8/8**, kod 0;
  `review-secret-scan.txt`. Przegląd własnego diffu bez nowych usterek; `git diff --check` czysty.
- Zmienione w tej poprawce: `cache-keeper/hooks/{config.ts,register.tsx,config.test.ts,config-fixture.ts,commands.test.ts}`,
  ten raport, jedna linia STATUS i dopisek do istniejącego wpisu E9 w DZIENNIKU.
  `config-contract.test.mjs` tylko uruchomiony, bez edycji; reszta zastanych zmian nietknięta.
- **PYTANIE:** brak. **STOP:** brak nowej blokady kodu; pełny runner wymaga bramki poza sandboxem.
  E9 nadal W TOKU, E10 OCZEKUJE. Bez commita, kasowania, instalacji i przełączania pluginów.
