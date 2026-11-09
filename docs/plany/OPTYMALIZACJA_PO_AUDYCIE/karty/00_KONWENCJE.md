# Karty zmian — konwencje wspólne

Załącznik planu [OPTYMALIZACJA_PO_AUDYCIE](../PLAN.html), zamrożony razem z nim. Każdy etap ma
jeden plik kart (`E01_…md` – `E14_…md`); ten plik obowiązuje we wszystkich. Źródłem znalezisk jest
[raport audytu](../../../AUDYT_RELAI_2026-11-09.md) — karta `K-D1` realizuje znalezisko D1 raportu.

**Nazewnictwo:** `E1`…`E14` to **etapy planu**. Znaleziska raportu też mają litery (A–G), w tym
obszar „E — proces”. Żeby się nie myliły, znalezisko występuje w planie wyłącznie jako **karta**
z przedrostkiem `K-`: „karta K-E3” to znalezisko E3 raportu, „etap E5” to piąty etap planu.

## 1. Jak czytać kartę

Każda karta ma te same pola, w tej kolejności:

| Pole | Co zawiera |
|---|---|
| **Cel** | jedno zdanie: co ma być prawdą po zmianie |
| **Pliki** | pełna lista plików, które wolno zmienić albo utworzyć na tej karcie |
| **Stan dziś** | fragment obecnego kodu albo tekstu — **kotwica**, po której znajdujesz miejsce |
| **Zmiana** | kroki w kolejności wykonania, z kodem albo tekstem docelowym |
| **Test najpierw** | plik testu, nazwy przypadków, wejścia i oczekiwane wyniki — piszesz go przed zmianą |
| **Weryfikacja** | komendy i oczekiwane wyjście |
| **Nie ruszasz** | czego ta karta nie obejmuje, choć leży obok |
| **Pułapki** | znane miejsca, w których ta zmiana się wykłada |
| **Gotowe, gdy** | warunki binarne |

## 2. Kolejność pracy na karcie

1. Przeczytaj kartę w całości, zanim otworzysz pierwszy plik.
2. Znajdź kotwicę z pola „Stan dziś” narzędziem Grep. Numery linii w kartach są orientacyjne
   (stan `main @ 5aeab39`); obowiązuje **tekst** kotwicy.
3. **Kotwicy nie ma albo wygląda inaczej → zatrzymujesz się.** Piszesz, czego szukałeś i co
   zastałeś, i pytasz. Nie dopasowujesz zmiany „na oko” do innego miejsca.
4. Piszesz test z pola „Test najpierw” i uruchamiasz go — ma być **czerwony z właściwego powodu**
   (asercja, nie błąd składni ani brak modułu).
5. Wprowadzasz zmianę. Test zielony.
6. Uruchamiasz komendy z pola „Weryfikacja” i porównujesz z oczekiwanym wyjściem.
7. Dopiero potem następna karta. Kart etapu nie łączysz w jedną zmianę.

Kod docelowy w karcie jest wzorem, nie tekstem do wklejenia na ślepo: nazwy zmiennych i styl
dopasowujesz do pliku, w którym pracujesz. Zachowanie i przypadki testowe są wiążące.

## 3. Gałąź i commity

- Cały plan idzie na gałęzi **`optymalizacja/po-audycie`**. Pierwsza czynność każdej sesji etapu:
  `git branch --show-current`. Inna gałąź → zatrzymujesz się i pytasz.
- Jeden commit na etap, conventional, po angielsku, po zgodzie człowieka (rytuał „Na koniec”).
- **Bez `git push`** i bez tagów aż do etapu E14.
- Numerów wersji (`plugin.json`, `marketplace.json`, `core/MANIFEST.json`, manifesty modów)
  **nie zmieniasz** przed E14 — robi to sekwencja wydania.

## 4. Testy — komendy

Node 24 nie przyjmuje samego katalogu; zawsze glob w cudzysłowie:

```bash
node --test "core/guardrails/tests/*.test.js"
node --test "core/process/tests/*.test.*"
node --test "core/panel/tests/*.test.*"
node --test "adapters/codex/tests/*.test.js"
node --test "adapters/cursor/tests/*.test.js"
node core/tools/validate-adapters.js
```

Stan wyjściowy (FAKT, 2026-11-09): 19 + 357 + 225 + 24 + 4 = 629 testów zielonych,
`validate-adapters.js` kod 0 z jednym ostrzeżeniem o `security-audit/SKILL.md`. `core/process/tests`
trwa ok. 110 s, `adapters/codex/tests` ok. 40 s — uruchamiaj je w tle albo z limitem 10 minut.

Na koniec **każdego** etapu z kodem: wszystkie zestawy, których etap dotknął, plus
`validate-adapters.js`. Liczba testów nie może spaść.

**Liczby w kartach są liczone od stanu `main`** (629). Wcześniejsze etapy dokładają testy, więc
oczekiwana liczba w etapie N to: liczba zapisana we wpisie dziennika etapu N−1 **plus** testy
dodane przez karty etapu N. Karta podaje, ile testów dodaje; sumę liczysz od poprzedniego wpisu.
Rozjazd w dół → zatrzymujesz się.

Tabela narastająca (SZACUNEK policzony z kart; widełki biorą się z kart warunkowych — wiążący jest
wpis dziennika poprzedniego etapu):

| Zestaw | `main` | Zmiana w etapach |
|---|---|---|
| `core/guardrails` | 19 | po E3: 33 |
| `core/process` | 357 | po E4: 372 · po E5: 388–389 · po E6: 395–396 · po E7: 404–406 · po E8: 408–410 · po E9: 420–422 · po E10: 423–425 · po E11: 429–431 |
| `core/panel` | 225 | po E13: 227 |
| `adapters/codex` | 24 | po E6: 28 |
| `adapters/cursor` | 4 | po E6: 10 |
| mody (`mods` / `panel` / `progress` / `cache-keeper`) | 87 / 216 / 50 / 206 | po E12: 91 / 217 / 51 / 206 |

Kontrola `readme-hooki` w `node core/tools/release-check.js` jest czerwona od etapu E5 (nowy hook)
do karty K-E9 w etapie E14, która poprawia liczebniki. To stan oczekiwany — nie naprawiasz go
wcześniej.

Mody mają własne testy, uruchamiane binarką bieżącej sesji (nie `node --test`):

```bash
"$CLAUDE_CODE_EXECPATH" plugin test mods
"$CLAUDE_CODE_EXECPATH" plugin test panel
"$CLAUDE_CODE_EXECPATH" plugin test progress
"$CLAUDE_CODE_EXECPATH" plugin test cache-keeper
```

Stan wyjściowy (FAKT, 2026-11-09): 87 + 216 + 50 + 206 = 559 zielonych. Szczegóły i ograniczenia
silnika testów: [USTALENIA_ROBOCZE.md](USTALENIA_ROBOCZE.md), sekcja 1.

## 5. Kopie, które trzeba odświeżyć po zmianie źródła

| Zmieniłeś | Uruchom | Po co |
|---|---|---|
| plik w `adapters/claude-code/commands/` albo w skillach `relai-core`, `relai-planning`, `trivy-scan`, `security-audit` | `node adapters/codex/generate-skills.js` | kopia skilli Codeksa jest generowana; rozjazd blokuje wydanie |
| plik w `core/panel/*.mjs` | `node core/tools/sync-panel-core.js` | kopie w czterech modach; `--check` sprawdza je w teście |
| prompt, skill, komenda, specyfikacja albo szablon (profil „prompty”) | wiersz w `docs/ARTEFAKTY.md`: nowa wersja, co się zmieniło i po co | reguła profilu z `CLAUDE.md`; kontrola wydania porównuje rejestr z plikami |
| `CLAUDE.md` | ten sam tekst w `AGENTS.md` | dwie kopie instrukcji różnią się tylko nagłówkiem |

Kopii w `.claude/relai/` (narzędzia, szablony, prompt) **nie edytujesz** — hook startu nadpisuje je
z zainstalowanego pluginu.

## 6. Rzeczy, które zaskakują w tym repozytorium

- **W sesji działają hooki zainstalowanego pluginu 3.7.0, nie kod z gałęzi.** Zmiana hooka
  w repozytorium nie zmienia zachowania Twojej sesji aż do wydania. Dowodem zmiany jest test albo
  uruchomienie skryptu z repozytorium na fiksturze — nigdy obserwacja „hook w sesji zachował się
  inaczej”.
- **Hook `secret-scanner` zablokuje zapis pliku z literałem przypisania sekretu**, także testu
  i także pliku poza repozytorium. Wartości testowe składaj w czasie działania, jak w
  `core/guardrails/tests/secret-scan.test.js`:
  `const literal = ['m7Q', '9rV', '2zL', '8pN'].join('');` i nazwy przez `['DB', 'PASSWORD'].join('_')`.
  Opisy przypadków testowych też nie mogą zawierać gotowego przypisania.
- **Tekst z backslashem** (wyrażenie regularne, ścieżka Windows) piszesz narzędziem Write albo
  Edit, nigdy heredokiem ani `node -e`. Wzorzec sprawdzasz kontrolą pozytywną: na wejściu, które
  musi trafić.
- **Dokument z backtickiem** zmieniasz wyłącznie narzędziem Edit albo Write, nigdy `sed`.
- **Polecenie Bash nie zaczyna się od `cd`** — ścieżka w argumencie albo podpowłoka `( cd … && … )`.
- **Pliki tymczasowe dla Node** w katalogu scratchpad sesji albo `os.tmpdir()`, nie w `/tmp`.
- **Komunikaty hooków i narzędzi są w ASCII** (bez polskich znaków) — konsola Windows.
- **Końce linii:** repozytorium ma LF, kopie z pluginu CRLF. Porównanie plików zawsze po
  normalizacji; test czytający plik normalizuje `\r\n` do `\n`.
- **Fikstury testów** powstają w `os.tmpdir()` (wzór: `fs.mkdtempSync(path.join(os.tmpdir(), 'relai-…'))`)
  i są sprzątane w `finally` albo `t.after`. Test nie pisze do repozytorium.
- **Hook `config-protection` zapyta o zgodę** przy edycji `docs/USTAWIENIA.md` i sekcji
  niemutowalnej `CLAUDE.md`. To poprawne zachowanie — karta, która tego wymaga, mówi o tym wprost.

## 7. Granice

- Zmieniasz wyłącznie pliki wymienione w kartach etapu. Wątek spoza kart → zatrzymujesz się
  i pytasz: odnoga, aneks czy „świadomie odłożone”. Nigdy „przy okazji”.
- Poza zakresem całego planu: `site/`, `docs/archiwum/`, `docs/zasoby/`, znaleziska niskiej wagi
  raportu oraz wdrożenie wariantu dystrybucji (G1 — plan tylko mierzy).
- Trzy jawne wyjątki od zakazu znalezisk niskiej wagi, żadnych innych: karta **K-E9** (liczebniki —
  zgoda właściciela na aneks D-40); karta **K-D12** (dane w plikach śledzonych — karta zadaje
  właścicielowi pytanie i tylko po odpowiedzi „zastąpić” zmienia jedną linię w `docs/archiwum/`);
  granica powtórzeń w karcie **K-D1** (kierunek znaleziska D10 — konieczna, żeby nowe wzorce
  skanera działały w czasie liniowym).
- Decyzje zamrożone zmieniasz tylko tam, gdzie karta podaje gotowe brzmienie aneksu: D-14, D-40,
  D-88, D-93. Żadnej innej.
- Świeże sesje `claude -p` uruchamiasz tylko w etapach E2 i E14, w liczbie podanej w kartach.

## 8. Definicja ukończenia karty

- Test z karty istniał przed zmianą i był czerwony; po zmianie jest zielony.
- Komendy z pola „Weryfikacja” dają oczekiwane wyjście — wklejasz je do wpisu dziennika.
- `git status --short` pokazuje wyłącznie pliki z pola „Pliki” (i kopie z sekcji 5).
- Żaden istniejący test nie został osłabiony, pominięty ani usunięty. Test, który po zmianie
  słusznie zmienia oczekiwanie, jest wymieniony w karcie z nazwy — innych nie dotykasz.
