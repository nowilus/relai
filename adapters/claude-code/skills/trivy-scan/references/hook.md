# Lockfile hook

`scripts/lockfile-hook.mjs` runs after every `Edit`, `Write`, `MultiEdit` and `Bash` tool call. It exits immediately unless the call touched a lockfile (`package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`, `poetry.lock`, `uv.lock`, `go.sum`, `Cargo.lock`, `Gemfile.lock`, `composer.lock`, `requirements*.txt`, …) or ran an install/update command of a package manager.

When triggered it:
1. skips if the same folder was scanned in the last 20 seconds (bursts cost one scan),
2. runs `scan.mjs --quick --json` on the session folder (no DB update when a DB exists, 100 s limit),
3. adds a `[trivy-scan]` note to Claude's context only for the first scan of a folder with CRITICAL/HIGH findings or for new CRITICAL/HIGH findings; otherwise stays silent.

It never blocks or fails the tool call: any error ends silently, except "trivy not found" / "DB not downloaded", which produce a one-line note.

## Registration

In the RelAI plugin this script is not registered yet: the plugin's own `hooks.json` takes it over in stage E2 of the BEZPIECZENSTWO plan, and until then nothing runs it automatically. A manual entry in a user's `~/.claude/settings.json` (an older setup, outside the plugin) looks like this:

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

To turn such an entry off, remove it. Hooks from all scopes merge, so a project cannot switch off a user-scope hook by redefining `PostToolUse`; removing the entry is the way. Once the plugin registers the hook, keep only one of the two, or every lockfile change is scanned twice.

## Troubleshooting

- Test without Claude: `echo '{"tool_name":"Write","tool_input":{"file_path":"<dir>/package-lock.json"},"cwd":"<dir>"}' | node lockfile-hook.mjs`
- No note ever appears: the folder has no CRITICAL/HIGH findings, or the previous scan already knew them (see `<dir>/.security/trivy/REPORT.md`).
- The DB is updated by full scans (the skill, or `trivy fs` by hand); quick scans reuse it.
