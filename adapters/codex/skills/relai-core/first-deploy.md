# relai-core — pierwsze wdrożenie: lista przed i obserwacja po

Plik doczytywany skilla `relai-core`. Otwierasz go **przed** pierwszym wdrożeniem środowiska —
gdy człowiek mówi, że chce coś wystawić („wdrażamy", „wrzućmy to na serwer", „deploy", „let's ship
it"), gdy powstaje pierwsza konfiguracja wdrożeniowa (`Dockerfile`, `docker-compose.yml`, workflow
CI z krokiem wdrożenia, `vercel.json`, `fly.toml`, `Procfile`, manifest Kubernetes, Terraform),
a `docs/srodowiska/<NAZWA>.md` dla tego środowiska jeszcze nie ma. Dotyczy każdego profilu; w
profilu `app` zdarzenie jest opisane w `profiles.md`.

Kolejność jest sztywna: **lista przed wdrożeniem → wdrożenie → dokument środowiska z sekcją
obserwacji**. Dokument środowiska dalej powstaje dopiero po wdrożeniu (D-10) — lista przed nim nie
jest dokumentem, tylko sprawdzeniem.

## Lista kontrolna przed pierwszym wdrożeniem

Każdy punkt sprawdzasz w repozytorium albo pytasz o niego — nie zgadujesz. Każdy dostaje jeden
z trzech stanów: **OK** (z dowodem), **BRAK** (co konkretnie), **NIE DOTYCZY** (z powodem).

| # | Punkt | Jak sprawdzasz |
|---|---|---|
| 1 | **Zmienne i sekrety** — każda zmienna, której kod używa, ma źródło wartości w środowisku docelowym; żadna wartość nie leży w repozytorium | lista nazw z kodu (`process.env.`, `os.environ`, `getenv`, `.env.example`) porównana z tym, co człowiek ustawi w panelu; `.env` objęty `.gitignore` |
| 2 | **Kopia danych** — środowisko z danymi ma kopię sprzed pierwszej migracji; wiadomo, gdzie leży i jak ją odtworzyć | pytanie o dane i o kopie po stronie dostawcy; środowisko bez danych → NIE DOTYCZY z tym powodem |
| 3 | **Droga cofnięcia sprawdzona** — wiadomo, do jakiego stanu się cofa i jaką komendą albo kliknięciem; migracje bazy mają drogę powrotu | przy pierwszym wdrożeniu stanem cofnięcia jest „wyłączenie środowiska" — i to też trzeba umieć zrobić; migracja usuwająca albo zmieniająca kolumnę bez migracji cofającej → BRAK |
| 4 | **Kto ma dostęp** — konta w panelu hostingu, bazie i usługach; co najmniej dwie osoby albo zapisana droga odzyskania dostępu | pytanie; odpowiedź jako wskazanie (menedżer haseł, osoba), nigdy wartość (D-42) |
| 5 | **Zależności bez znanych podatności** — komenda audytu ekosystemu z plików projektu | `package.json` → `npm audit --omit=dev`; `requirements.txt` / `pyproject.toml` → `pip-audit`; `Gemfile.lock` → `bundle audit`; `go.mod` → `govulncheck ./...`; `Cargo.lock` → `cargo audit`; narzędzia brak → punkt opisany z warunkiem wykonalności, nie pominięty |
| 6 | **Sprawdzenie, że działa** — jedna konkretna czynność po wdrożeniu i jej oczekiwany wynik | adres, konto testowe albo zapytanie; „strona się ładuje" nie wystarcza, jeśli aplikacja zapisuje dane |

**BRAK w punktach 1–4 nie blokuje sam** — mówisz go wprost i pytasz człowieka, czy wdrażać mimo to.
Decyzja o wdrożeniu mimo braku należy do człowieka i idzie do wpisu w dzienniku razem z brakiem.

Wynik listy pokazujesz w rozmowie jako tabelę `# | Punkt | Stan | Dowód albo brak` i zapisujesz
we wpisie `docs/DZIENNIK.md` tej sesji. Pytania o brakujące fakty zbierasz w **jednym** wywołaniu
pytań, nie po jednym na punkt.

## Po wdrożeniu — dokument środowiska z sekcją obserwacji

Wdrożenie się udało → powstaje `docs/srodowiska/<NAZWA>.md` wg
`.claude/relai/templates/SPEC_SRODOWISKA.md`. Lista przed wdrożeniem jest dla niego materiałem:
zmienne z punktu 1 idą do tabeli zmiennych, droga z punktu 3 do „Jak cofnąć", czynność z punktu 6
jest ostatnim krokiem „Jak wdrożyć".

Sekcja **„Co obserwować po wdrożeniu"** to tabela o kształcie z `SPEC_SRODOWISKA.md` — trzy
wiersze, każdy z miejscem, progiem i odbiorcą:

| Co | Gdzie patrzysz | Kiedy to jest alarm | Kto dostaje alert |
|---|---|---|---|
| logi | panel hostingu, zakładka logów, filtr środowiska | pierwsza doba: przejrzyj raz ręcznie | osoba wdrażająca |
| błędy | odsetek odpowiedzi 5xx albo narzędzie do zbierania błędów | każdy nowy typ błędu po wdrożeniu | adres albo kanał — pytasz |
| koszty | panel rozliczeń dostawcy; limit albo alert budżetowy | kwota, którą człowiek uzna za granicę — pytasz o nią | adres albo kanał — pytasz |

Brak odbiorcy alertu to BRAK, nie domyślna wartość.

Niczego z tej sekcji nie ustawiasz za człowieka w panelach dostawców — wskazujesz, gdzie to zrobić,
a w dokumencie zapisujesz stan faktyczny albo znacznik `<DO UZUPEŁNIENIA: …>`.
