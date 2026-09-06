# RelAI — adapter Codex

Adapter Codeksa jest natywnym pluginem od wersji 2.0.0 (wcześniej dostępny eksperymentalnie w 1.10.0). Źródłem prawdy jest repozytorium RelAI:
`.codex-plugin/plugin.json` opisuje pakiet, `.agents/plugins/marketplace.json` wystawia repozytorium,
a rootowy `skills/` powstaje deterministycznie z 13 komend adaptera Claude Code oraz dwóch skilli rdzeniowych.
Nie kopiuj `core/` do drugiego drzewa.

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

## Weryfikacja

```text
node adapters/codex/generate-skills.js --verify
node core/tools/validate-adapters.js
node --test adapters/codex/tests/*.test.js
```

Świeża sesja, praca naprzemienna i ograniczenia są raportowane w
`docs/archiwum/plany/ROZWOJ_PO_WYDANIU/E7-REPORT.md`.
