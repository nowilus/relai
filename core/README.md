# Rdzeń RelAI

Ten katalog jest **wspólną częścią RelAI** — tym, co nie należy do żadnego narzędzia. Adaptery
(dziś jeden: Claude Code) korzystają z tych samych plików, zamiast trzymać własne kopie.

Powstał w etapie E4 planu ROZWOJ_PO_WYDANIU, przed adapterami Cursora i Codexa — żeby granica
istniała, zanim po drugiej stronie pojawi się drugi konsument.

## Co tu jest

| Ścieżka | Co to jest |
|---|---|
| `templates/` | dwadzieścia specyfikacji dokumentów + szablon planu HTML z osadzonymi fontami. To **specyfikacje dla modelu**, nie gotowce do skopiowania: dokument powstaje w języku projektu i pod jego realia |
| `guardrails/secret-scan.js` | czysta logika „czy w tej treści jest sekret". Biblioteka i CLI naraz, bez wiedzy o protokole hooków |
| `guardrails/pre-commit.js` | hook gita: zatrzymuje commit z sekretem w indeksie. Jedyna gwarancja RelAI działająca **niezależnie od narzędzia** |
| `guardrails/install-precommit.js` | instaluje i odinstalowuje powyższy hook w `.git/hooks` wskazanego repozytorium |
| `process/session-signals.js` | rozpoznania startu sesji: marker projektu, tryb gościa, wersja projektu, luka promptu etapowego (D-34), rozjazd stanu, nieznany autor (D-27), ustawienia globalne, prowizjonowanie specyfikacji. Fakty na wyjściu, zero wiedzy o protokole hooków |
| `tools/validate-adapters.js` | sprawdza, czy adaptery nie odjechały od rdzenia: martwe odwołania (także te z **kodu** adapterów), rozjazd numerów wersji |
| `MANIFEST.json` | spis treści rdzenia i rejestr adapterów; czyta go walidator |

## Gdzie przebiega granica

**Do rdzenia należy to, co jest prawdą o RelAI** — jak wygląda dokument, jak przebiega proces,
co jest sekretem.

**Do adaptera należy to, co jest prawdą o narzędziu** — manifest pluginu, rejestracja hooków,
format pliku komendy, protokół `permissionDecision`, sposób zadania pytania człowiekowi.

Praktyczny test: gdyby jutro powstał adapter Cursora, czy ten plik trafiłby do niego bez zmian?
Tak → rdzeń. Nie → adapter.

Dzisiejszy adapter Claude Code mieszka w `adapters/claude-code/` (skille, komendy, hooki), a jego
manifest w `.claude-plugin/` — tam, gdzie wymaga tego Claude Code. Od 1.5.0 obok stoi
`adapters/cursor/`: reguły `.mdc`, dwa hooki i instalator, który kopiuje do projektu komendy
i skille **z adaptera Claude Code** — bo Cursor czyta ten sam format (zmierzone, `docs/PRZENOSNOSC.md`).

## Instalacja pre-commita

Jawna czynność człowieka. RelAI nie podkłada hooków gita sam: `.git/hooks/` jest przestrzenią
użytkownika, nie narzędzia.

```
node <RelAI>/core/guardrails/install-precommit.js <katalog-projektu>
```

Cofnięcie — jedno polecenie:

```
node <RelAI>/core/guardrails/install-precommit.js <katalog-projektu> --uninstall
```

Instalator kopiuje do `.git/hooks/` dwa pliki: sam hook i kopię skanera. Kopia zamiast odwołania
do katalogu pluginu jest świadoma — hook ma działać także po aktualizacji, przeniesieniu albo
odinstalowaniu pluginu. Cena: po zmianie reguł skanu instalację trzeba powtórzyć, i instalator
mówi o tym przy nadpisaniu.

**Bez Node.js w `PATH`** instalator odmawia i mówi o tym wprost. Warstwa dokumentowo-procesowa
RelAI działa wtedy w całości (to tekst), sam skan przy commicie — nie. Żadnej cichej degradacji.

**Cudzego hooka `pre-commit` instalator nie nadpisuje** — kończy się błędem i podpowiada, jak
dopiąć wywołanie do istniejącego hooka.

## Czego tu świadomie nie ma

**Logiki `config-protection`.** Rozdzielenie jej na rdzeń i warstwę hooka rozważono w E4
i odrzucono, z zapowiedzią powrotu w E5. **E5 rozstrzygnął: zostaje w adapterze Claude Code.**
Powód jest teraz zmierzony, nie przypuszczony: Cursor przyjmuje `permission: "ask"` w schemacie
odpowiedzi `preToolUse`, ale producent pisze wprost, że dla tego zdarzenia werdykt nie jest
egzekwowany (`docs/PRZENOSNOSC.md`, sekcja 1.3a). Drugiego konsumenta nadal więc nie ma — w Cursorze
ochronę plików konfiguracyjnych niesie **reguła** `relai-guardrails.mdc`, nie hook. Wyciągnięcie
samego rozpoznawania „czy ten plik jest chroniony" dałoby moduł bez odbiorcy (YAGNI) i rozbiłoby
bramkę, która dziś stoi w jednym pliku.

**Opisów procesu w osobnych plikach rdzenia.** Rozstrzygnięte w E5 na realnym adapterze:
**nie powstają**. Cursor czyta pliki komend (`.cursor/commands/*.md`) i skille
(`.cursor/skills/<nazwa>/SKILL.md`) w tym samym formacie co Claude Code — zmierzone — więc adapter
Cursora **kopiuje przy instalacji** pliki adaptera Claude Code zamiast czytać trzeci format.
Jedno źródło w repozytorium, kopia w projekcie, zero przepisywania procesu na nowy format.

Do rdzenia trafiło natomiast to, co oba adaptery robią **kodem**, a nie tekstem: rozpoznania
startu sesji (`process/session-signals.js`). Kryterium jest to samo co zawsze — hook Cursora
i hook Claude Code wołają dziś ten sam plik, więc nie ma gdzie się rozjechać.

**Rozpięcia pozostałych ośmiu hooków Claude Code na rdzeń.** Każdy z nich ma własną, dwunastolinijkową
kopię `isGuest`. Świadomie zostawione: te hooki nie mają bliźniaka w adapterze Cursora, więc
dryf nie ma się z czym rozjechać, a przepięcie dziesięciu plików zamiast dwóch rozdęłoby diff etapu
bez zysku. Wraca, gdy któryś z nich dostanie odpowiednik w drugim narzędziu.

## Walidacja przed wydaniem

```
node <RelAI>/core/tools/validate-adapters.js
```

Milczy wynikiem zerowym, gdy wszystko się zgadza; przy rozjeździe wypisuje listę problemów
i kończy się kodem 1. Uruchamiany ręcznie — mitygacja ryzyka P4 (dryf rdzenia i adapterów).
