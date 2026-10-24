# Lockfile hook

`scripts/lockfile-hook.mjs` runs after every `Edit`, `Write`, `MultiEdit` and `Bash` tool call. It exits immediately unless the call touched a lockfile (`package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`, `poetry.lock`, `uv.lock`, `go.sum`, `Cargo.lock`, `Gemfile.lock`, `composer.lock`, `requirements*.txt`, …) or ran an install/update command of a package manager.

When triggered it:
1. skips if the same folder was scanned in the last 20 seconds (bursts cost one scan),
2. runs `scan.mjs --quick --json` on the session folder (no DB update when a DB exists, 100 s limit),
3. adds a `[trivy-scan]` note to Claude's context only for the first scan of a folder with CRITICAL/HIGH findings or for new CRITICAL/HIGH findings; otherwise stays silent.

It never blocks or fails the tool call: any error ends silently, except "trivy not found" / "DB not downloaded", which produce a one-line note.

## Registration

In the RelAI plugin the hook is registered as `lockfile-scan` in `adapters/claude-code/hooks/hooks.json`: one entry at the end of the `^(Write|Edit|MultiEdit)$` list and one at the end of the `^Bash$` list, each `node "${CLAUDE_PLUGIN_ROOT}/adapters/claude-code/hooks/lockfile-scan.js"` with `"timeout": 120`. `lockfile-scan.js` reads the payload, stays silent outside a RelAI project and in guest mode (the plugin's hook convention), and then calls `run(input)` exported by `lockfile-hook.mjs` — one process, one copy of the logic. To switch the hook off, disable the RelAI plugin; there is no separate switch.

Older setup, outside the plugin: a manual entry in `~/.claude/settings.json` that runs the script directly. Remove it once the plugin is installed — hooks from all scopes merge, so with both in place every lockfile change in a RelAI project is scanned twice. Such an entry looks like this:

```json
"PostToolUse": [
  {
    "matcher": "Edit|Write|MultiEdit|Bash",
    "hooks": [
      { "type": "command", "command": "node \"<skill-dir>/scripts/lockfile-hook.mjs\"", "timeout": 120 }
    ]
  }
]
```

To turn such an entry off, remove it. A project cannot switch off a user-scope hook by redefining `PostToolUse`; removing the entry is the way. Unlike the plugin hook, the manual entry has no RelAI-project gate and scans in every folder.

## Troubleshooting

- Test without Claude: `echo '{"tool_name":"Write","tool_input":{"file_path":"<dir>/package-lock.json"},"cwd":"<dir>"}' | node lockfile-hook.mjs` (the script, no project gate) or `| node <plugin>/adapters/claude-code/hooks/lockfile-scan.js` (the plugin hook; `<dir>` must be a RelAI project).
- Silent in a project that should be scanned: the plugin hook speaks only where `docs/` holds the `Wersja RelAI:` / `RelAI version:` marker and `.claude/relai.json` does not set guest mode.
- No note ever appears: the folder has no CRITICAL/HIGH findings, or the previous scan already knew them (see `<dir>/.security/trivy/REPORT.md`).
- The DB is updated by full scans (the skill, or `trivy fs` by hand); quick scans reuse it.
