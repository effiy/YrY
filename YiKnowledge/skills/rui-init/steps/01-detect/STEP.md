---
description: "Step 01-detect: probe filesystem, emit profile fact baseline."
---
# 01-detect

> Input: `cwd` (filesystem).
> Output: `pipelineState.profile` (Profile).

## Role

You're a project detective. Your job is to look at the filesystem and report
facts — not opinions, not guesses. Every field you populate must be traceable
to a file on disk.

## Task

1. List the project root (`<cwd>`) — collect top-level files and directories.
2. Identify manifest files and map them to project types.
3. Scan for security-sensitive files (auth, secrets, env).
4. Detect the test framework from config files or directory patterns.
5. Detect the architecture pattern from directory structure.
6. Populate and return the `Profile` object.

## Profile Fields

### identity

| Field | How to detect |
|-------|---------------|
| `projectName` | `package.json` → `.name`, `pyproject.toml` → `[project].name`, `go.mod` → module path, `Cargo.toml` → `[package].name`, `pom.xml` → `<artifactId>`, `*.csproj` → `<AssemblyName>`, or fallback to directory name |
| `branchPrefix` | Check existing branches via `git branch -a` for common prefixes (`claude/`, `feature/`, `fix/`, `feat/`, `chore/`). Default to `claude/` if no pattern found |

### projectType

Detect by manifest presence. If multiple manifests exist, use the dominant one:

| Manifest | Type |
|----------|------|
| `package.json` | `node` |
| `deno.json` / `deno.jsonc` | `deno` |
| `bun.lock` / `bunfig.toml` | `bun` |
| `pyproject.toml` / `setup.py` / `setup.cfg` | `python` |
| `go.mod` | `go` |
| `Cargo.toml` | `rust` |
| `pom.xml` / `build.gradle` / `build.gradle.kts` | `java` |
| `*.csproj` / `*.sln` | `dotnet` |
| `mix.exs` | `elixir` |
| `build.zig` / `build.zig.zon` | `zig` |
| None of the above | `unknown` |

### inventory

| Field | How to detect |
|-------|---------------|
| `topLevelFiles` | List non-dotfiles in root. Use `ls -p | grep -v /` or Glob `*` |
| `topLevelDirs` | List directories in root. Exclude `.git`, `node_modules`, `__pycache__`, `target`, `dist`, `build`, `.venv`, `vendor` |
| `manifests` | For each manifest found, record `{ "package.json": "npm" }`, `{ "pyproject.toml": "python" }`, `{ "go.mod": "go" }`, etc. |

### securitySurface

| Field | How to detect |
|-------|---------------|
| `authFiles` | Grep root filenames for `auth`, `token`, `session`, `jwt`, `oauth`, `login`, `permission`, `rbac`. Also check non-dotfile content for these terms |
| `secretFiles` | Find `.env*`, `credentials*`, `secrets*`, `*.pem`, `*.key`, `*.cert`, `*.p12`, `*.pfx`, `service-account*.json` |
| `envFiles` | Find `.env`, `.env.*`, `env.*`, `.env.local`, `.env.development`, `.env.production` |

### testFramework

| Pattern | Framework |
|---------|-----------|
| `jest.config.*` | `jest` |
| `vitest.config.*` | `vitest` |
| `pytest.ini` / `conftest.py` / `pyproject.toml` with `[tool.pytest]` | `pytest` |
| `*_test.go` | `go test` |
| `*_test.rs` / `#[cfg(test)]` in source | `cargo test` |
| `src/**/*.test.ts` (no jest/vitest config) | `vitest` (default for Vite projects) |
| `src/**/*.spec.ts` | `jest` (default) |
| `tests/` directory (Python) | `pytest` or `unittest` |
| `src/test/` (Java) | `junit` |
| `*Test.cs` (dotnet) | `xunit` or `nunit` or `mstest` |
| None found | `null` |

### architecturePattern

| Pattern | Detection |
|---------|-----------|
| `monorepo` | `packages/` or `apps/` directory with multiple sub-projects, or `pnpm-workspace.yaml` / `lerna.json` / `turbo.json` / `nx.json` |
| `microservices` | `services/` directory with multiple independent services, each with its own manifest |
| `layered` | `src/` + `tests/` at root, no sub-project directories |
| `cli` | `bin/` or `cmd/` directory, `cli` in package name, or `console_scripts` in `setup.cfg` |
| `library` | No `src/` directory, `main` field in `package.json` pointing to `dist/` or `lib/`, or `[project.scripts]` absent from `pyproject.toml` |
| `null` | Can't determine |

## Pipeline Contract

- **Reads**: `<cwd>` filesystem
- **Writes**: `pipelineState.profile`
- **Must not**: read source file contents (that's 02-explore), modify any files