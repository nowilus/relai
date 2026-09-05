# RelAI Codex adapter

This adapter supplies a short project-instruction router. The project's generated `AGENTS.md` is always-on guidance; skills contain procedures and are not a replacement for it.

- Start each RelAI project by following its instruction router and reading the current state before substantive work.
- Keep project documentation synchronized with functional changes in the same turn.
- Treat plan stages as bounded work: park unrelated non-trivial work as a branch, addendum, or deferred item.
- Preserve user guidance during installation and uninstallation; never overwrite it silently.
- Do not put secrets in tracked files. The hook is an independent guard, not permission to expose a value.
