# Adapter Cursor — instalacja i to, co zaczyna się dziać

RelAI w Cursorze to **te same dokumenty i ten sam proces** co w Claude Code, złożone z mechanizmów,
które Cursor naprawdę ma. Ten plik jest instrukcją dla człowieka; warstwa czytana przez model
(reguły `.mdc`) jest po angielsku — tak stanowi Aneks A planu ROZWOJ_PO_WYDANIU.

Wersja adaptera: **1.8.0**. Rozpoznanie, na którym stoi, jest w [docs/PRZENOSNOSC.md](../../docs/PRZENOSNOSC.md);
zmierzono je 2026-08-12 na Cursorze 3.7.12 i `cursor-agent` 2026.08.11-e8db854 (Windows 11).

## Czego potrzebujesz

| Rzecz | Po co | Bez tego |
|---|---|---|
| Cursor (aplikacja albo `cursor-agent`) | to jest to narzędzie | — |
| Node.js w `PATH` | hooki: skan sekretów, kontekst startu sesji | **czytaj niżej: „Zespół bez Node.js"** |
| git | pre-commit, historia, rozpoznanie autora | proces działa, siatka bezpieczeństwa historii znika |

## Instalacja

Z katalogu repozytorium RelAI:

```bash
node adapters/cursor/install.js <ścieżka-do-projektu>
```

Instalator kładzie w projekcie dokładnie pięć rzeczy i wypisuje, co zrobił:

1. `.cursor/rules/relai-*.mdc` — trzy reguły `alwaysApply: true`: rdzeń procesu, planowanie,
   guardraile. To jest **warstwa nośna** — wchodzi do każdej sesji bez wyzwalania czegokolwiek.
2. `.cursor/commands/relai-*.md` — dziesięć komend wywoływanych jako `/relai-stage`, `/relai-tour`…
   Pliki są kopiami z adaptera Claude Code: jedno źródło w repozytorium, kopia w projekcie.
3. `.cursor/skills/relai-core/`, `.cursor/skills/relai-planning/` — te same skille co w Claude Code;
   w Cursorze niosą procedurę, nigdy regułę.
4. `.claude/relai/templates/` — dwadzieścia specyfikacji dokumentów plus szablon planu HTML
   (razem trzydzieści plików).
   Katalog nazywa się tak samo jak w Claude Code **celowo**: komendy i skille mówią o jednej ścieżce,
   więc oba narzędzia widzą to samo.
5. Dwa wpisy w `.cursor/hooks.json` — `sessionStart` i `preToolUse`. Cudze wpisy zostają nietknięte;
   nasze są oznaczone opisem zaczynającym się od `RelAI:`.

Instalacja jest **idempotentna**: powtórzone uruchomienie nadpisuje własne pliki i nie mnoży wpisów
w `hooks.json`. Zapisuje też `.cursor/relai-install.json` — spis tego, co położyła.

### Odinstalowanie

```bash
node adapters/cursor/install.js <ścieżka-do-projektu> --uninstall
```

Usuwa dokładnie to, co jest w spisie instalacji, i czyści wyłącznie własne wpisy w `hooks.json`.
`docs/`, `CLAUDE.md` i cache specyfikacji zostają — dokumenty projektu należą do projektu.

### Ważne: adapter nie jest kopiowany do projektu

Hooki w `hooks.json` wskazują pliki **tego repozytorium** (ścieżka bezwzględna). Przeniesienie
katalogu RelAI w inne miejsce wymaga ponownej instalacji. Powód: rdzeń (`core/`) ma być jeden,
a nie po kopii w każdym projekcie — inaczej wraca ryzyko rozjazdu wersji.

## Co zaczyna się dziać

- **Nowa sesja czyta stan.** Hook `sessionStart` wstrzykuje datę dnia, wymuszenie rytuału startu,
  sygnał rozjazdu wersji projekt ↔ adapter, siatkę brakującego promptu etapowego (D-34), sygnał
  rozjazdu stanu i sygnał nieznanego autora (D-27) oraz treść ustawień globalnych z
  `~/.claude/relai/`. Zmierzone: treść realnie dociera do modelu.
- **Zapis sekretu do pliku śledzonego jest blokowany.** Hook `preToolUse` woła
  `core/guardrails/secret-scan.js` i zwraca `permission: deny`. Zmierzone na żywej sesji: plik
  z kluczem `AKIA…` nie powstał, ta sama próba bez sekretu przeszła bez słowa.
- **Reguły obowiązują bez wyzwalania.** `alwaysApply: true` znaczy „każda sesja czatu" — zmierzone
  na czystym projekcie.
- **Dokumenty aktualizują się w tej samej turze co zmiana** — definicja ukończenia (D-44) jest
  w regule, nie w skillu.

## Praca naprzemienna: Cursor i Claude Code w jednym projekcie

Oba narzędzia czytają i piszą **te same** `docs/`. Nie ma dwóch stanów projektu i nie ma migracji
między narzędziami. Trzy zasady:

1. Wersję struktury projektu podbija wyłącznie `/relai-update` (albo jego odpowiednik) — samo
   otwarcie projektu w drugim narzędziu **niczego nie zmienia**.
2. Ustawienia globalne użytkownika mieszkają w `~/.claude/relai/` niezależnie od narzędzia; wpis
   projektowy w `docs/USTAWIENIA.md` ma pierwszeństwo.
3. Tryb gościa zadeklarowany w jednym narzędziu (`.cursor/relai.json` albo `.claude/relai.json`)
   obowiązuje w obu — „nie chcę tu RelAI" mówi się raz.

## Zespół bez Node.js

Warstwa dokumentowo-procesowa działa **w całości**: reguły, komendy, skille i specyfikacje to pliki
tekstowe. Guardrail wymagający Node.js zachowuje się tak:

**Zmierzone zachowanie Cursora (2026-08-12):** hook, którego polecenia **nie da się uruchomić**,
jest ignorowany **bez słowa** — zapis przechodzi tak, jakby guardraila nigdy nie było. To jest cicha
degradacja i gdyby adapter wołał `node` wprost, projekt bez Node.js dostałby fałszywe poczucie
bezpieczeństwa.

Dlatego skan sekretów jest wołany przez **opakowanie powłoki** (`secret-scanner.cmd` na Windows,
`secret-scanner.sh` na macOS i Linuksie). Opakowanie uruchamia się zawsze — to zwykły skrypt
powłoki, nie Node — i gdy nie znajdzie interpretera, kończy się **kodem 2**, czyli blokadą zapisu
z komunikatem. Konsekwencja jest jawna i celowa: **bez Node.js agent nie zapisze żadnego pliku**,
zamiast zapisywać wszystko bez kontroli.

Zespół, który świadomie nie chce tego guardraila, instaluje adapter tak:

```bash
node adapters/cursor/install.js <ścieżka-do-projektu> --bez-skanu
```

Wtedy wpis `preToolUse` w ogóle nie powstaje, a instalator wypisuje wprost, że twardej blokady nie
ma. Zostaje reguła `relai-guardrails.mdc` (w pomiarze model sam odmówił zapisu klucza) oraz gitowy
pre-commit — on też potrzebuje Node.js, ale przy instalacji mówi o tym wprost i odmawia:

```bash
node core/guardrails/install-precommit.js <ścieżka-do-projektu>
```

Trzecia droga, gdy Node jest, ale nie w `PATH` sesji: zmienna `RELAI_NODE` wskazująca interpreter.

## Czego w Cursorze nie ma

Pełna tabela — co działa tak samo, co inaczej, czego nie ma — jest w
[docs/PRZENOSNOSC.md](../../docs/PRZENOSNOSC.md), sekcja 3. Dwie rzeczy warto znać od razu:

- **Brak ustrukturyzowanego pytania.** Cursor nie daje adapterowi odpowiednika `AskUserQuestion`,
  więc procedury pytają zwykłym tekstem: ponumerowane opcje, rekomendacja pierwsza, potem cisza
  i czekanie. Milczenie nie jest zgodą.
- **Brak twardej bramki „zapytaj człowieka" przy zapisie pliku.** Ochronę plików konfiguracyjnych
  (`CLAUDE.md`, reguły, `USTAWIENIA.md`, zamrożony plan) niesie reguła, nie hook.
