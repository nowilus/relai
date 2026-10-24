# RelAI — adapter Codex

Adapter Codeksa jest natywnym pluginem od wersji 2.0.0 (wcześniej dostępny eksperymentalnie w 1.10.0). Źródłem prawdy jest repozytorium RelAI:
`.codex-plugin/plugin.json` opisuje pakiet, `.agents/plugins/marketplace.json` wystawia repozytorium,
a `adapters/codex/skills/` powstaje deterministycznie z 16 komend adaptera Claude Code oraz czterech
skilli dołączonych: `relai-core`, `relai-planning`, `trivy-scan` (skan zależności Trivy, na którym stoi
`/relai-security`) i `security-audit` (pełny audyt kodu od Cloudflare dla `/relai-security --full`,
kopia 1:1 z notą licencji MIT). Lista mieszka w `core/process/bundled-skills.js`; generator kopiuje
każdy plik skilla z podkatalogami (skrypty, `references/`, `LICENSE`), pomija tylko `evals/` — materiał
testowy autora skilla. Nie kopiuj `core/` do drugiego drzewa.

**Katalog skilli nie może wrócić do korzenia** (P-010, naprawione w 2.1.1). Korzeń repozytorium jest
jednocześnie korzeniem pluginu Claude Code, a ta aplikacja skanuje `skills/` niezależnie od
`.claude-plugin/plugin.json` i przy kolizji nazw pomija **własne komendy** — a nazwy są identyczne,
bo jedne i drugie generują się z tych samych plików. Zmierzone 2026-09-06: Codex rejestruje
komplet 15 skilli ze ścieżki zagnieżdżonej (`codex debug prompt-input` w izolowanym `CODEX_HOME`),
więc przeniesienie niczego w nim nie kosztuje. Powrót do korzenia blokuje `validate-adapters.js`.

Od 2.1.0 wśród procedur jest `relai-crew` (załoga). W Codeksie orkiestrator deleguje zadania
natywnym subagentom (funkcja `multi_agent`, prompt roli z `node .claude/relai/tools/crew.js prompt`),
a do drugiego zalogowanego narzędzia — poleceniem `crew.js run` z powłoki. Odwrotny kierunek
(Claude Code albo Cursor delegujący do Codeksa) idzie przez `codex exec` i `codex review`
z sandboxem `read-only` albo `workspace-write`; flag omijających sandbox narzędzie nie składa.

## Instalacja

```text
codex plugin marketplace add <ścieżka-do-relai>
codex plugin add relai@relai
node <ścieżka-do-relai>/adapters/codex/install.js <projekt>
```

Instalator projektu zachowuje zastane `AGENTS.md` i `CLAUDE.md`: kopiuje je do
`.agents/relai/`, tworzy router `AGENTS.md`, a `CLAUDE.md` zamienia we wskaźnik. Deinstalacja
odtwarza pliki tylko wtedy, gdy router nie został zmieniony przez właściciela.

Hooki pluginu są w `hooks/hooks.json`: `SessionStart` konsumuje `core/process/session-signals.js`,
a `PreToolUse` konsumuje `core/guardrails/secret-scan.js`. Brak Node.js kończy skan odmową;
świadome pominięcie skanu nie jest domyślnie oferowane przez adapter Codex.
`PostToolUse` po `Bash` uruchamia hook `lockfile-scan` (`adapters/codex/hooks/lockfile-scan.js`,
z bramką `CLAUDECODE`): po komendzie instalacji menedżera paczek (`npm install`, `pip install`…)
w projekcie RelAI robi szybki skan Trivy i odzywa się tylko przy nowym CRITICAL albo HIGH.
Zmierzone 2026-10-24 na Codeksie 0.155.1: zdarzenie przychodzi po `Bash` i po `apply_patch`, ale
edycji pliku blokady przez `apply_patch` hook jeszcze nie rozpoznaje — tę drogę pokrywają
`/relai-security` i rytuały. Codex uruchamia hook dopiero po jego zaufaniu w przeglądzie hooków.

## Weryfikacja

```text
node adapters/codex/generate-skills.js --verify
node core/tools/validate-adapters.js
node --test adapters/codex/tests/*.test.js
```

Świeża sesja, praca naprzemienna i ograniczenia są raportowane w
`docs/archiwum/plany/ROZWOJ_PO_WYDANIU/E7-REPORT.md`.
