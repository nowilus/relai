# Applying fixes per ecosystem

Read the row for the ecosystem in the report's "File" column. `<pkg>` and `<ver>` come from the fix plan. Prefer the package manager's own command: it updates the manifest and the lockfile consistently.

| Ecosystem (file) | Direct dependency | Indirect dependency | Last resort for indirect |
|---|---|---|---|
| npm (`package-lock.json`) | `npm install <pkg>@<ver>` (dev dep: add `-D`) | `npm update <parent>`; or `npm install <parent>@<newer>` | `"overrides": { "<pkg>": "<ver>" }` in `package.json`, then `npm install` |
| pnpm (`pnpm-lock.yaml`) | `pnpm add <pkg>@<ver>` | `pnpm update <parent>` | `"pnpm": { "overrides": { "<pkg>": "<ver>" } }`, then `pnpm install` |
| Yarn (`yarn.lock`) | `yarn add <pkg>@<ver>` | `yarn up <parent>` (Berry) / `yarn upgrade <parent>` (v1) | `"resolutions": { "<pkg>": "<ver>" }`, then `yarn install` |
| Bun (`bun.lock`) | `bun add <pkg>@<ver>` | `bun update <parent>` | `"overrides"` in `package.json` |
| pip (`requirements*.txt`) | change the pin to `<pkg>==<ver>`, then `pip install -r <file>` in the project venv | add the pin to the requirements or a constraints file | — |
| pip-tools (`requirements.in` + `.txt`) | `pip-compile --upgrade-package <pkg>==<ver>` | same command for the indirect package | — |
| Poetry (`poetry.lock`) | `poetry add <pkg>@^<ver>` | `poetry update <pkg>` | add it as an explicit dependency with the minimum version |
| uv (`uv.lock`) | `uv add "<pkg>>=<ver>"` | `uv lock --upgrade-package <pkg>` | `constraint-dependencies` in `pyproject.toml` |
| Pipenv (`Pipfile.lock`) | `pipenv install "<pkg>>=<ver>"` | `pipenv update <pkg>` | — |
| Go (`go.mod`/`go.sum`) | `go get <module>@v<ver>` then `go mod tidy` | same (Go picks the minimum required version) | `replace` directive only if the module moved |
| Cargo (`Cargo.lock`) | raise the version in `Cargo.toml`, `cargo update -p <pkg>` | `cargo update -p <pkg> --precise <ver>` | `[patch.crates-io]` |
| Bundler (`Gemfile.lock`) | `bundle update <gem> --conservative` (raise the constraint in `Gemfile` if needed) | `bundle update <gem> --conservative` | add the gem to `Gemfile` with `>= <ver>` |
| Composer (`composer.lock`) | `composer require <vendor/pkg>:^<ver>` | `composer update <vendor/pkg> --with-dependencies` | — |
| Maven (`pom.xml`) | change `<version>` | `<dependencyManagement>` entry with the fixed version | — |
| Gradle (`gradle.lockfile`) | change the version in `build.gradle(.kts)`, `./gradlew dependencies --write-locks` | `constraints { implementation("<group:name:ver>") }` | — |
| NuGet (`packages.lock.json`) | `dotnet add package <pkg> --version <ver>` | add a direct `PackageReference` with the fixed version | — |

## Rules of thumb

- **Major bump**: read the package's changelog/migration notes for breaking changes before applying, and tell the user what you found. For `0.x` packages the minor version is the breaking part.
- **Fix only in a newer major of the parent**: say so; it becomes a separate decision for the user.
- **No fix available**: nothing to update; mention whether the package is direct (could be replaced) or indirect (wait for the parent).
- **Dev-only dependency** (`devDependencies`, test extras): still worth fixing, but lower urgency — say it when you rank.
- **Monorepo** (several lockfiles): fix each target separately; the report's "File" column says which lockfile owns the finding.
- **Verification**: tests first, then rescan. A finding that stays after the update usually means another parent still pins the old version — check `npm ls <pkg>`, `pnpm why <pkg>`, `yarn why <pkg>`, `pipdeptree -r -p <pkg>`, `go mod why -m <module>`, `cargo tree -i <pkg>`.
