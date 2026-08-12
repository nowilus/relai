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
| `tools/validate-adapters.js` | sprawdza, czy adaptery nie odjechały od rdzenia: martwe odwołania, rozjazd numerów wersji |
| `MANIFEST.json` | spis treści rdzenia i rejestr adapterów; czyta go walidator |

## Gdzie przebiega granica

**Do rdzenia należy to, co jest prawdą o RelAI** — jak wygląda dokument, jak przebiega proces,
co jest sekretem.

**Do adaptera należy to, co jest prawdą o narzędziu** — manifest pluginu, rejestracja hooków,
format pliku komendy, protokół `permissionDecision`, sposób zadania pytania człowiekowi.

Praktyczny test: gdyby jutro powstał adapter Cursora, czy ten plik trafiłby do niego bez zmian?
Tak → rdzeń. Nie → adapter.

Dzisiejszy adapter Claude Code mieszka w `adapters/claude-code/` (skille, komendy, hooki), a jego
manifest w `.claude-plugin/` — tam, gdzie wymaga tego Claude Code.

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

**Logiki `config-protection`.** Rozdzielenie jej na rdzeń i warstwę hooka rozważono w E4 i
odrzucono. Powód: sama reguła („plik ustawień i sekcja niemutowalna wymagają zgody; w profilach
`agent-voice` i `flow` zmiana konfiguracji produkcyjnej wymaga wcześniejszego snapshotu") jest
przenośna, ale jej **egzekwowanie** sprowadza się w całości do werdyktu `ask` w protokole hooków —
a to jest własność narzędzia, nie rdzenia. Wyciągnięcie samego rozpoznawania „czy ten plik jest
chroniony" dałoby moduł bez drugiego konsumenta (YAGNI) i rozbiłoby bramkę, która dziś stoi
w jednym pliku i w jednym miejscu blokuje. Wraca do rozważenia w E5, gdy będzie wiadomo z próby,
czy `preToolUse` Cursora potrafi odpowiedzieć „zapytaj człowieka" przy zapisie pliku
(`docs/PRZENOSNOSC.md`, sekcja 1.3).

**Opisów procesu w osobnych plikach.** Proces mieszka dziś w specyfikacjach z `templates/`
(to one mówią, jak wygląda dziennik, plan, status, rytuał) oraz w skillach adaptera. Przenoszenie
skilli do rdzenia „na zapas" oznaczałoby przepisanie ich na format, którego żaden adapter jeszcze
nie czyta — a dwie kopie procesu to dwa źródła prawdy. Rozstrzygnięcie zapada w E5, na realnym
adapterze.

## Walidacja przed wydaniem

```
node <RelAI>/core/tools/validate-adapters.js
```

Milczy wynikiem zerowym, gdy wszystko się zgadza; przy rozjeździe wypisuje listę problemów
i kończy się kodem 1. Uruchamiany ręcznie — mitygacja ryzyka P4 (dryf rdzenia i adapterów).
