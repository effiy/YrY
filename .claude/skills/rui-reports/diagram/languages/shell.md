# Shell Language Prompt Snippet

## Key Concepts

- **Shebang Line**: `#!/bin/bash` or `#!/usr/bin/env bash` specifying the interpreter
- **Variables**: `VAR=value` assignment, `$VAR` or `${VAR}` expansion, no spaces around `=`
- **Functions**: `function name()` or `name()` for reusable command groups
- **Conditionals**: `if [[ condition ]]; then ... fi` with `[[ ]]` for extended tests
- **Loops**: `for item in list`, `while condition`, `until condition` iteration patterns
- **Pipes and Redirection**: `|` for chaining commands, `>` / `>>` / `2>&1` for output redirection
- **Exit Codes**: `$?` captures last command status; `set -e` exits on any failure
- **Strict Mode**: `set -euo pipefail` for robust error handling (exit on error, undefined vars, pipe failures)
- **Command Substitution**: `$(command)` captures command output as a string
- **Here Documents**: `<<EOF ... EOF` for multi-line string input to commands

## Notable File Patterns

- `*.sh` / `*.bash` — Shell script files
- `scripts/*.sh` — Project automation scripts (build, deploy, setup)
- `entrypoint.sh` — Docker container entry point script
- `install.sh` / `setup.sh` — Environment setup scripts
- `.bashrc` / `.bash_profile` / `.zshrc` — Shell configuration files

## Edge Detection Heuristics

**Script invocation chain** — `./deploy.sh` or `bash build.sh` → `triggers` edges from the calling script to the invoked script. `source script.sh` creates stronger coupling (shared environment) than `bash script.sh` (subshell).

**Binary/tool dependencies** — `jq '.version' package.json`, `kubectl apply -f`, `docker build -t app .` → the script `depends_on` the external tool. Missing tool → script fails at runtime. Note these as external dependencies.

**File processing pipeline** — `cat data.txt | grep ERROR | awk '{print $2}' | sort | uniq -c` → `transforms` edges between pipeline stages. Shell pipes are a classic data-flow pattern.

**Environment variable coupling** — `export DATABASE_URL=...` set by one script and read by another via `$DATABASE_URL` → implicit `configures` edge from the setter to the consumer. `.env` files formalize this contract.

**Signal trap handlers** — `trap 'cleanup' EXIT` or `trap 'handle_sigterm' SIGTERM` → `subscribes` edges from the signal to the handler function. Trap handlers are the shell equivalent of lifecycle hooks.

**Makefile target graph** — `.PHONY: build test deploy` + `deploy: build test` → `depends_on` edges from each target to its prerequisites. Make's DAG is a deterministic execution plan.

**Cron/timer scheduling** — Crontab entries or systemd timer units → `triggers` edges from the schedule to the script. Scheduled execution is time-triggered, not event-triggered.

**Exit code handling** — `set -e`, `set -o pipefail`, `|| true`, `if ! command; then` → error handling branches. Scripts that explicitly handle errors create conditional dependency paths.

## Summary Style

> "Build automation script compiling TypeScript, running tests, and packaging the release artifact."
> "Docker entry point script handling signal forwarding and graceful shutdown."
> "Environment setup script installing dependencies and configuring development tools."
