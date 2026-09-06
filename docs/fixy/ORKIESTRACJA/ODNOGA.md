# WĄTEK — załoga: orkiestracja wielu agentów i przegląd krzyżowy (`/relai-crew`)

Status: **ZAMKNIĘTA 2026-09-06** (2.1.0 w repozytorium; wydanie czeka na człowieka)
Wywołanie: dyrektywa użytkownika z 2026-09-06 (`/goal`): zaprojektować i wdrożyć adytywnie komendę
orkiestracji multi-agentowej z delegacją między Claude Code, Codeksem i Cursorem, w jednej sesji,
bez subagentów i bez workflowów
Plan nadrzędny: brak — wątek samodzielny, jak `PRECOMMIT_ESM` i `CURSOR_1_9_1`

## Cel

Jedna komenda w trzech adapterach, po której sesja staje się orkiestratorem celu: wywiad o role,
liczbę subagentów, tryb pracy i zakres modeli; plan fal, w których dwa zadania nigdy nie piszą
naraz do tego samego pliku; delegacja do subagentów gospodarza (tryb basic) albo do drugiego
zalogowanego narzędzia (tryb full); przegląd krzyżowy z werdyktem; rytuał zamknięcia (D-44).
Do tego natywne odpowiedniki funkcji pluginu Codex (`rescue`, `review`, `setup`, `status`) — bez
zależności od cudzego pluginu (D-04).

## Nazwa

`/relai-crew` — „załoga". Konwencja komend to jeden angielski rzeczownik po `relai-` (`stage`,
`branch`, `tour`, `clean`, `models`); „crew" mówi o zespole wykonawców, a cel jest argumentem.
Odrzucone: `/relai-goal` (nazywa tryb, nie mechanizm; kolizja z `/goal` harnessu),
`/relai-orchestrate` (czasownik, jedyny taki w zestawie), `/relai-relay` (dubluje nazwę produktu).

## Warianty rozważone

| Wariant | Plusy | Minusy | Decyzja |
|---|---|---|---|
| **A. Narzędzie rdzenia `crew.js` (CLI) + jedna komenda + agenci pluginu** | jedna treść komendy we wszystkich adapterach (jak `clean-work.js`); fakty liczone kodem, decyzje u człowieka; testowalne bez sieci (`exec` podstawiany) | narzędzie woła CLI trzech dostawców, których flagi się zmieniają | **wybrany** |
| B. Broker app-server jak w pluginie Codex (wątki wznawiane, status, cancel) | pełniejsza kontrola biegnących zadań | ~1000 linii zależnych od protokołu jednego dostawcy; nie przenosi się na Cursora i Claude Code | odrzucony — YAGNI, D-04 |
| C. Sama procedura w komendzie, bez narzędzia | zero kodu | rozpoznanie logowania, konflikty plików i cytowanie argumentów na Windows liczone „okiem" przez model — dokładnie to, czego L-0032 zabrania | odrzucony |
| D. Osobne komendy `rescue`, `review`, `setup`, `status` (jak plugin Codex) | znajome nazwy | cztery pozycje w tabeli komend zamiast jednej; wszystkie i tak potrzebują kroków 0–2 | odrzucony — argumenty jednej komendy |

## Zakres (zrealizowany)

- `core/process/crew.js` — samowystarczalne narzędzie rdzenia: `detect`/`setup` (CLI, logowanie,
  subagenci natywni, tryb basic/full), `plan` (fale, konflikty plików, cykle), `prompt` (preambuła
  roli), `run` (jedno zadanie w jednym narzędziu, read-only albo `--write`), `review` (przegląd
  krzyżowy, `codex review` dla Codeksa), `status`. Zamknięta lista flag zakazanych.
- `core/process/tests/crew.test.js` — 9 testów z podstawionym wykonawcą.
- `adapters/claude-code/commands/relai-crew.md` — procedura (dziewięć kroków, pięć trybów
  argumentu, tabela dróg delegacji per gospodarz, dwanaście zakazów).
- `adapters/claude-code/agents/relai-{coder,tester,reviewer}.md` + `"agents"` w `plugin.json`.
- Adapter Cursora: instalator przepisuje agentów do `.cursor/agents/` (frontmatter Cursora,
  recenzent tylko-do-odczytu), deinstalacja sprząta; tryb **basic** Cursora obowiązkowy — jest.
- Prowizjonowanie `crew.js` do `.claude/relai/tools/` (jeden wpis w liście `NARZEDZIA`),
  `MANIFEST.json`, walidator (ścieżka `agents` z `plugin.json`), generator skilli Codeksa na 13.
- Dokumenty: `KOMENDY.md`, `SPEC_KOMENDY.md` (v4), `README.md`, README adapterów, `relai-update`
  (v7), skill `relai-core` (v9), `PRZENOSNOSC.md` sekcja 4, `ARTEFAKTY.md`, `STATE.md`, wersja
  2.1.0 w pięciu źródłach i markerze projektu.

## Poza zakresem — świadomie

- **Własne role `.toml` dla Codeksa** — Codex ma subagentów natywnych bez konfiguracji; prompt roli
  daje `crew.js prompt`. Dokładanie `[agents.*]` do cudzego `config.toml` to scalanie TOML-a.
- **Anulowanie biegnącego zadania i wznawianie wątków między sesjami** — wymagałoby brokera
  (wariant B).
- **Zapamiętywanie odpowiedzi wywiadu w `USTAWIENIA.md`** — skład załogi zależy od celu i kosztu
  przebiegu; wywiad pada za każdym razem, jak zgoda na sieć w `/relai-models` (D-18).
- **Pomiar z Codeksem i Cursorem jako gospodarzem** oraz zapis przez Cursora — odnoga pomiarowa,
  nie blokada wydania (jak przy 2.0.0).

## Ryzyka

| Ryzyko | Poziom | Mitygacja |
|---|---|---|
| Flagi CLI trzech dostawców zmienią się szybciej niż wydania RelAI (`--permission-mode plan`, `codex exec -s`, `agent -p --mode ask`) | średni | flagi stoją w jednym miejscu (`buildCommand`), test pilnuje trybu read-only i listy zakazanej; porażka `run` kończy się `failed` z `stderr` w pliku, nigdy ciszą |
| Subagent zmieni plik spoza listy zadania | średni | krok 7 komendy: `git status`/`git diff --stat` po każdej fali, STOP i pytanie; preambuła roli zakazuje; zadanie bez listy plików nie wchodzi do planu |
| Cudzy hook w narzędziu docelowym blokuje zadanie, a exit jest 0 | niski | zmierzone (Cursor, 4.4 w PRZENOSNOSC): dowodem jest `## Report` i stan plików, nie kod wyjścia |
| W tym repozytorium `/relai-crew` nie ma `crew.js` do wydania 2.1.0 | niski | jak każda funkcja między wydaniami (D-87, P-005); komenda kończy się na kroku 1 jasnym zdaniem |

## Weryfikacja

- [x] `node --test` — **36/36** (guardraile 19, adapter Codex 8, załoga 9).
- [x] `node core/tools/validate-adapters.js` — kod 0, 5 źródeł wersji `2.1.0`, 4 ścieżki z `plugin.json`.
- [x] `node adapters/codex/generate-skills.js --verify` — 13 procedur + 2 skille, spójne.
- [x] `git diff --check` — czysto.
- [x] `crew.js detect` na tej maszynie: gospodarz Claude Code, trzy narzędzia zalogowane, tryb `full`.
- [x] Delegacja z Claude Code w projekcie kontrolnym `%TEMP%`: Codex read-only (`PONG`, 9 s),
      Codex write (`hello.txt` z żądaną treścią, raport CODER), Cursor read-only (`PONG`, stdin),
      zagnieżdżony Claude Code read-only (`PONG`); `status` pokazał 4 zadania `done`.
- [x] Instalator Cursora w `%TEMP%`: 13 komend, 3 agentów (recenzent `tools: ["Read","Glob","Grep","Bash"]`,
      koder bez pola `tools`), `crew.js` w `.claude/relai/tools/`; deinstalacja usunęła 22 pliki
      i katalog `.cursor/agents`.
- [ ] Sesja z Codeksem albo Cursorem jako gospodarzem — NOT TESTED.
- [ ] Wywołanie agenta `relai:relai-reviewer` przez `Agent` w świeżej sesji z wydanego pluginu — NOT TESTED.

## Wynik

Komplet w repozytorium, adytywnie: żaden istniejący hook, komenda ani skill nie zmienił zachowania;
zmienione liczniki (12→13) i wersje są deklaracjami stanu, nie logiką. Wydanie 2.1.0 to sekwencja
P-005 wykonywana przez człowieka.
