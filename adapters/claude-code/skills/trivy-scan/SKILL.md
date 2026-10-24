---
name: trivy-scan
description: Scans a project's dependencies for known vulnerabilities (CVE/GHSA) with Trivy, saves a report with a fix plan, compares it with the previous scan and, after the user's yes, updates the vulnerable packages, runs the tests and rescans. Use it whenever the user wants to check, audit or update dependencies for security — "przeskanuj zależności", "sprawdź podatności", "czy moje biblioteki są bezpieczne", "zaktualizuj podatne paczki", "trivy", "scan my dependencies", "check for CVEs", "npm audit", "pip-audit", "is this package version safe" — before a release, after adding or bumping packages, and when a `[trivy-scan]` note from the lockfile hook appears in context. Covers npm/yarn/pnpm/bun, pip/poetry/uv, Go, Cargo, Bundler, Composer, Maven/Gradle, NuGet and more. Not for secret scanning, container images or code-level security review unless the user asks for those explicitly.
---

# Trivy dependency scan

Goal: the user says one sentence and gets (1) a clear picture of which dependencies are vulnerable and how badly, (2) a concrete update plan, and (3) on their yes, the updates applied and verified. They should never have to type a Trivy command themselves.

Talk to the user in their language. Keep the chat summary short; the full detail lives in the saved report.

## 1. Scan

Run the bundled script against the project root (the folder with the lockfiles, usually the session folder). `<skill-dir>` is this skill's own folder inside the RelAI plugin — the path from the "Base directory for this skill" line that opens it:

```bash
node "<skill-dir>/scripts/scan.mjs" --path <project-root>
```

What it does, so you don't have to:
- finds the `trivy` binary (PATH, winget, brew, scoop, common locations; or `TRIVY_BIN`),
- runs `trivy fs --scanners vuln` skipping `node_modules`, `.git`, `.claude/worktrees`, RelAI working folders (`.claude/relai/work`), this skill's own deliberately vulnerable `evals`, virtualenvs,
- writes to `<project>/.security/trivy/`: `REPORT.md` (fix plan + all findings), `latest-summary.json` (used for the next diff) and the last 10 raw Trivy reports; that folder carries its own `.gitignore`, so reports never land in a commit by accident,
- checks every target version against the same local DB (`trivy sbom` on package URLs, offline) and raises it while the target has advisories of its own — e.g. axios 0.21.0 → 0.33.0 closes the old CVEs but 0.33.0 has a new one fixed in 0.34.0, so the plan says 0.34.0 and notes "raised from 0.33.0",
- prints counts per severity, what changed since the previous scan, and one line per package to update: installed → target version, `[MAJOR]` when the fix crosses a major line (for `0.x`, the minor), `indirect via <direct dep>` for transitive packages, and a note when the target was raised, still has an advisory with no newer fix, or could not be verified.

The target check covers the package itself, not the dependencies a new version pulls in — that is what the rescan after updating (step 4) is for. Mention a "target still has …" or "target not verified" note to the user next to that package.

Options: `--json` (machine-readable summary), `--no-save` (nothing written), `--out <dir>`, `--quick` (skip the DB update if a DB exists; used by the hook).

The first scan on a machine downloads the vulnerability DB (a minute or so); later scans take seconds. Exit code 2 means the scan did not run: read the message.

**Trivy missing?** Tell the user and offer to install it; install only after their yes, and only from official sources (`winget install AquaSecurity.Trivy` on Windows, `brew install trivy` on macOS, the official apt/rpm repo or install script on Linux — https://trivy.dev/latest/getting-started/installation/). For a downloaded release archive, compare its SHA256 with the checksums file of the same release on GitHub before running it — Trivy's own supply chain has been attacked before. Until Trivy is there, the ecosystem's own audit command (`npm audit`, `pip-audit`, `cargo audit`, `govulncheck`, …) is the fallback.

**Nothing found by Trivy at all** (no lockfile): say which lockfile is missing for the ecosystem in use (e.g. `package.json` without `package-lock.json`) — Trivy needs lockfiles for exact versions.

## 2. Report to the user

Lead with the verdict, then the plan:

- one line: total and per-severity counts, plus "N new / M resolved since <date>" when there is a previous scan,
- a table of the fix plan, highest severity first: package, installed → fix version, severity, major bump yes/no, direct or "via X", number of advisories,
- one line on findings with no fix yet (they stay on the watch list; nothing to update),
- the path to `REPORT.md` for the full list.

If there is nothing to fix, say so in one sentence and stop.

## 3. Ask before changing anything

Lockfiles belong to the user, and a major bump can break their app, so propose and wait. Ask one question (with the question tool when available) offering:
- update everything without a major bump (recommended default),
- update everything including major bumps,
- pick packages,
- leave it as a report.

## 4. Apply, verify, rescan

After the yes, follow `references/fixing.md` for the ecosystem's exact commands. In short:
- direct dependency → install the fix version with the package manager (never hand-edit a lockfile),
- indirect dependency → first try updating the direct parent shown in "via"; use overrides/resolutions/constraints only when no parent release pulls the fix, and say so,
- one ecosystem at a time; group commits by ecosystem if the user wants commits.

Then:
1. run the project's tests (`npm test`, `pytest`, `go test ./...`, …); if there are none, say it plainly,
2. rerun the scan script and show before → after counts,
3. if a test fails after an update, stop, show the failure, and offer to revert that one package.

Things to avoid, and why:
- `npm audit fix --force` and similar "fix everything" switches — they jump majors silently, which defeats step 3,
- adding a `.trivyignore` entry or downgrading severity without the user's explicit decision — hiding a finding is a risk decision, not a technical one,
- installing anything globally to make the scan work.

## Lockfile hook (automatic scans)

`scripts/lockfile-hook.mjs` is a PostToolUse hook: after Claude edits a lockfile or runs an install command (`npm install`, `pip install`, `poetry add`, `go get`, `cargo update`, …) it runs a quick scan of the session folder. It stays silent unless it is the first scan of that folder with CRITICAL/HIGH findings, or a new CRITICAL/HIGH finding appeared. When it speaks, a `[trivy-scan]` note appears in context: finish the current step, tell the user in one or two sentences, and offer this skill's fix plan. Setup and troubleshooting: `references/hook.md`.

## Beyond dependencies

The default scope is dependencies only. When the user asks for more, run Trivy directly (same binary the script finds):
- secrets in the repo: `trivy fs --scanners secret <path>`
- IaC / Dockerfile / Kubernetes / GitHub Actions misconfiguration: `trivy config <path>`
- licenses: `trivy fs --scanners license --license-full <path>`
- SBOM: `trivy fs --format cyclonedx --output sbom.cdx.json <path>`
- container image: `trivy image <image:tag>`
