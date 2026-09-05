# RelAI — adapter Codex

Adapter Codeksa jest natywnym pluginem od wersji 1.10.0. Źródłem prawdy jest repozytorium RelAI:
`.codex-plugin/plugin.json` opisuje pakiet, `.agents/plugins/marketplace.json` wystawia repozytorium,
a rootowy `skills/` powstaje deterministycznie z 12 komend adaptera Claude Code oraz dwóch skilli rdzeniowych.
Nie kopiuj `core/` do drugiego drzewa.

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
`docs/plany/ROZWOJ_PO_WYDANIU/E7-REPORT.md`.
