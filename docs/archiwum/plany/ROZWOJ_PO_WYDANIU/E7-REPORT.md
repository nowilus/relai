# E7 — macierz dowodów (stan 2026-09-05)

Etap zamknięto decyzją użytkownika z Aneksu C: wszystkie kontrole dostępne w środowisku przeszły,
a niedostępne ścieżki są jawnie oznaczone `NOT TESTED` i nie są przedstawiane jako zaliczone.

| Obszar | Wynik | Dowód |
|---|---|---|
| Manifest `.codex-plugin/plugin.json` | PASS | `codex plugin add` zainstalował `relai` w wersji `1.10.0`. |
| Oficjalny validator plugin-creator | PASS | `validate_plugin.py` zaakceptował root pluginu po dodaniu `skills/` i `interface.defaultPrompt`. |
| Repo-marketplace | PASS | `codex plugin marketplace add` rozpoznał tymczasowe źródło `relai-e7-2`. |
| Generator 12 skilli | PASS | `node --test adapters/codex/tests/generate-skills.test.js`: deterministyczność i wykrywanie dryfu. |
| Instalator/deinstalator Codex D-86 | PASS | `node --test adapters/codex/tests/install.test.js`: 5 scenariuszy, zachowanie treści użytkownika. |
| Instalator Cursor D-86 | PASS | Izolowany projekt: istniejący `CLAUDE.md` odtworzony po deinstalacji. |
| Walidator trzech adapterów | PASS | `node core/tools/validate-adapters.js`: kod 0, trzy adaptery, 5 źródeł wersji `1.10.0`. |
| Testy guardraili i walidatora | PASS | 27 testów Node przechodzi; `git diff --check` kod 0. |
| Hook `SessionStart` w projekcie RelAI | PASS | Świeży cache pluginu zwrócił `hookSpecificOutput` z kontekstem RelAI i raportem progów. |
| Hook poza projektem RelAI | PASS | Kontrolny proces z katalogu tymczasowego zwrócił pusty stdout/stderr i kod 0. |
| Hook sekretów: `Bash`/`apply_patch`, brak Node.js | PASS częściowy | Runtime-built token w `apply_patch` dał `permissionDecision: deny`, czysty Bash przeszedł, wrapper Windows bez Node.js zwrócił kod 2; pełny protokół świeżej sesji pozostaje `NOT TESTED`. |
| Dziewięć kroków scenariusza akceptacyjnego | NOT TESTED | Świeży `codex exec` 0.153.4 załadował publiczny plugin i rozpoczął `SessionStart`, ale worker MCP zakończył się `AuthRequired` przed wykonaniem kroków; kontrolny projekt został usunięty bez pozostałości. |
| Ręczna kopia rdzenia na kopii repo | PASS | Test walidatora podłożył `manual-core-copy.js`; validator zakończył się kodem 1 i wskazał plik. |
| Praca naprzemienna Codex–Cursor–Claude | NOT TESTED | Nie wykonano pełnego przebiegu trzema narzędziami. |
| Cleanup konfiguracji i artefaktów | PASS | Plugin/marketplace usunięte, `config.toml` przywrócony sumą SHA-256; katalogi `relai-e7-*` poza repo usunięte. |

## Decyzja etapu

E7 jest `ZREALIZOWANY` na podstawie Aneksu C. `NOT TESTED` pozostaje ograniczeniem produktu i
materiałem do dalszego pomiaru; nie jest dowodem działania. Prompt E8 domyka wydanie 2.0.0 i dystrybucję.
