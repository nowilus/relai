# WĄTEK — gitowy pre-commit: trzy defekty ze zgłoszenia zewnętrznego

Status: **ZAMKNIĘTA 2026-09-04** (wydanie 1.9.2)
Wywołanie: zgłoszenie z projektu zewnętrznego (widget Preact/TS, Node 24.13.1, Git Bash na Windows 11)
Plan nadrzędny: brak — wątek samodzielny, jak `_fixy` przy 1.9.1

## Cel

Naprawić trzy defekty gitowego pre-commita ze skanem sekretów, zgłoszone po instalacji RelAI 1.9.1
w cudzym projekcie, i wydać poprawkę. Guardrail jest jedyną gwarancją D-42 działającą **poza**
harnessem, więc jego awaria to trafienie w mitygację ryzyka P1 — a defekt pierwszy odbierał
projektowi możliwość commitowania czegokolwiek.

## Skąd się wzięła

Zgłaszający zainstalował pre-commit poleceniem z dokumentacji w projekcie z `package.json`
zawierającym `"type": "module"`. Pierwszy commit po instalacji — przy czystym indeksie, bez
sekretu — skończył się stack trace'em Node'a i kodem 1. Przy okazji sprawdzania obejść wyszły
dwa dalsze defekty: dziura w rozpoznawaniu nazw zmiennych i niemożność udokumentowania samego
guardraila.

## Zakres

- **Defekt 1 (blokujący).** Instalator kładł logikę jako bezrozszerzeniowy `.git/hooks/pre-commit`
  i `relai-secret-scan.js`. O systemie modułów rozstrzyga najbliższy `package.json` w górę drzewa,
  a dla `.git/hooks/` jest nim `package.json` **projektu** — w projekcie ESM Node parsował hooka
  jako moduł ESM i przewracał się na pierwszym `require`. Poprawka: shim `#!/bin/sh` w
  `.git/hooks/pre-commit`, logika w `relai-pre-commit.cjs` i `relai-secret-scan.cjs`.
- **Defekt 1a (z tego samego zgłoszenia).** Instalator nie weryfikował niczego poza skopiowaniem
  plików, a mimo to meldował sukces zdaniem o działającej blokadzie. Poprawka: **test dymny** —
  hook uruchomiony przy pustym indeksie (`GIT_INDEX_FILE` podstawiony, prawdziwy indeks nietknięty)
  musi zwrócić 0; inny wynik cofa instalację do stanu sprzed niej i kończy się kodem 2.
- **Defekt 2.** `ASSIGN_RE` zaczynał się od `\b` przed rdzeniem nazwy, a podkreślnik jest znakiem
  słownym — przez skan przechodziły najczęstsze realne nazwy (`AWS_SECRET_ACCESS_KEY=`,
  `GITHUB_TOKEN=`, `DB_PASSWORD=`). Poprawka: **druga reguła** dla nazw z przedrostkiem, wrażliwa
  na wielkość liter; stara reguła bez zmian.
- **Defekt 3.** Lista `PATTERNS` zwracała werdykt przed jakimkolwiek filtrem, więc dokumentacja
  z kanoniczną wartością przykładową (klucz AWS z dokumentacji producenta) nie dawała się zapisać.
  Poprawka: filtr `EXAMPLE_RE` na dopasowanym tokenie. **`PLACEHOLDER_RE` tu nie działa** — jest
  zakotwiczony `^`, a marker stoi w środku wartości; propozycja ze zgłoszenia była w tym punkcie
  nieskuteczna.
- **Defekt 4 (znaleziony przy okazji, w tej samej funkcji).** `scanText` sprawdzał wyłącznie
  **pierwsze** dopasowanie każdego wzorca, więc placeholder w pierwszej linii pliku wyciszał realny
  sekret w linii dalszej. Bez tej poprawki filtr z defektu 3 otwierałby nową dziurę tej samej
  natury. Poprawka: przegląd wszystkich dopasowań, werdyktem jest pierwsze, które przejdzie filtry.

## Poza zakresem

- **Systemowe fałszywe trafienia obecne już w 1.9.1** — 86 plików z 3705 w pięciu cudzych
  repozytoriach. Zmierzone, nieruszane: to nie jest skutek tej poprawki.
- **Poszerzenie `PLACEHOLDER_RE` o akcesory środowiska** inne niż `process.env` (`Deno.env.get`,
  `import.meta.env`, `os.environ`). Zmierzone jako nieopłacalne: ucisza **2** trafienia ze 113.
- **Linia w archiwum dziennika tego repozytorium** (`SECRET_TOKEN=` z wartością pozorowaną
  w dowodzie negatywnym do D-42) — archiwum jest kopią bajt w bajt i się go nie edytuje (D-18).

## Weryfikacja

- [x] **Defekt 1 odtworzony przed poprawką**: świeże repo w `%TEMP%` z `"type": "module"`,
      instalacja, `git commit` → `ReferenceError: require is not defined in ES module scope`
      w linii 17, kod 1.
- [x] **Regresja instalatora: 27 przypadków, 0 rozjazdów** — sześć scenariuszy, każdy we własnym
      repozytorium: projekt ESM (instalacja, commit czysty, commit z sekretem, brak sekretu
      w historii), projekt CommonJS (dokument z kluczem przykładowym przechodzi, ten sam wzorzec
      bez markera zatrzymany), deinstalacja, cudzy hook (dowód negatywny: treść nietknięta),
      **cofnięcie po nieudanym teście dymnym** (poprzedni hook wrócił bajt w bajt), aktualizacja
      instalacji sprzed 1.9.2 (stara kopia `.js` znika, hook jest shimem, końce linii LF).
- [x] **Tabela przypadków ze zgłoszenia: 14/14 zgodnych** — sześć nazw z przedrostkiem trafionych,
      cztery kontrole fałszywego alarmu ciche (`API_KEY=$MY_VAR`, `PASSWORD=changeme`,
      `TOKEN_TYPE=bearer`, `ACCESS_KEY_ID=` z wartością przykładową).
- [x] **Fałszywe trafienia zmierzone na cudzym materiale, obie wersje w jednym przebiegu**
      (stara wzięta z gita, nie przepisana z pamięci): 3705 plików z pięciu repozytoriów,
      86 → 113 plików z trafieniem, 27 różnic. Wariant pośredni z flagą `i` przy przedrostku dawał
      54 różnice — prawie wszystkie na polach kodu pisanych małymi literami (`access_token`,
      `client_secret`), i **dlatego** reguła przedrostkowa jest wrażliwa na wielkość liter.
- [x] **Własne repozytorium**: 188 plików, 0 → 1 trafienie (linia archiwum opisana wyżej).
- [x] Walidator spójności: kod 0, `3 zrodel, wartosc "1.9.2"`.
- [x] **Zapis dokumentu z kanonicznym kluczem przykładowym AWS przez hook żywej sesji** —
      zmierzone 2026-09-04 po aktualizacji pluginu i restarcie, **obie strony w jednym przebiegu**:
      dopisanie sprawdzenia z wartością `AKIAIOSFODNN7EXAMPLE` do `docs/PULAPKI.md` **przeszło**
      (do 1.9.1 było blokowane), a kontrola pozytywna — ten sam wzorzec bez markera przykładu,
      na tej samej ścieżce śledzonej — została odbita werdyktem `klucz AWS (AKIA...)` i **plik
      nie powstał**. Pierwsza próba kontroli była nieważna: postawiona w `.claude/relai/work/`,
      czyli na ścieżce objętej `.gitignore`, którą hook przepuszcza z założenia.
- [x] **Wydanie potwierdzone treścią plików z cache'u, nie komunikatem CLI** (P-005): katalog
      `1.9.2` w cache'u, `MANIFEST.json` z wersją `1.9.2`, `installed_plugins.json` wskazujący
      ścieżkę `...\1.9.2` i commit `ff3e6bc`. Pięć plików (trzy guardraile, manifest, SKILL)
      zgodnych sumą z repozytorium po normalizacji CRLF → LF, **5/5**, i różnych od 1.9.1.

## Wynik

**Wydanie 1.9.2.** Trzy zgłoszone defekty naprawione, czwarty znaleziony i naprawiony przy okazji.
Instalacja przestała być czynnością bez dowodu: kończy się testem dymnym z cofnięciem, więc układ,
który nie działa w danym projekcie, nie zostaje w `.git/hooks/` pod komunikatem o sukcesie.

**Do zrobienia przez człowieka:** projekty z hookiem sprzed 1.9.2 wymagają **ponownej instalacji** —
stary układ nadal przewraca się w projekcie ESM. Rozpoznanie: obecność `.git/hooks/relai-secret-scan.js`.
