---
name: diagram-understand
description: >
  Analyze a codebase and produce an interactive knowledge graph —
  scan the project, analyze files in batches, build architecture
  layers, generate a guided tour, and save to .understand-anything/.
---

# Codebase Understanding — Analyze and Map a Codebase

Analyze the current codebase and produce a `knowledge-graph.json` file in `.understand-anything/`. This file powers the interactive dashboard for exploring the project's architecture.

## Available Tools

| Tool | Purpose |
|------|---------|
| `Task` (subagent) | Parallel dispatch for scanning, analysis, and review |
| `RunCommand` | Run merge scripts, check git, build plugin |
| `Read` / `Write` | File operations for graph data |

## Options

- `$ARGUMENTS` may contain:
  - `--full` — Force a full rebuild, ignoring any existing graph
  - `--auto-update` — Enable automatic graph updates on commit (writes `autoUpdate: true` to `.understand-anything/config.json`)
  - `--no-auto-update` — Disable automatic graph updates (writes `autoUpdate: false` to `.understand-anything/config.json`)
  - `--review` — Run full LLM graph-reviewer instead of inline deterministic validation
  - `--language <lang>` — Generate all textual content in the specified language. Accepts ISO 639-1 codes (`zh`, `ja`, `ko`, `en`, etc.) or friendly names. Defaults to `en`.
  - A directory path — Analyze the given directory instead of the current working directory

## Progress Reporting

Report progress at each phase transition and during batch processing:
- **Phase transitions:** `[Phase N/7] <phase name>...`
- **Batch progress:** `Analyzing batch X/N (files: foo.ts, bar.ts, ...)`
- **Phase completion:** `Phase N complete. <one-line summary>`

## Phase 0 — Pre-flight

Determine whether to run a full analysis or incremental update.

1. **Resolve PROJECT_ROOT** from `$ARGUMENTS` or current working directory. Handle git worktree redirect.
2. **Ensure the plugin is built** — run `pnpm install && pnpm --filter @understand-anything/core build` from the skill directory if needed.
3. Get the current git commit hash: `git rev-parse HEAD`
4. Create intermediate directories: `.understand-anything/intermediate/` and `.understand-anything/tmp/`
5. Check for subdomain knowledge graphs to merge.
6. Check if `knowledge-graph.json` and `meta.json` exist for incremental decision logic.

## Phase 1 — SCAN (Full analysis only)

Dispatch a subagent using the `project-scanner` agent definition (`agents/project-scanner.md`).

## Phase 2 — ANALYZE

Load `.understand-anything/intermediate/batches.json`. Iterate the `batches[]` array. Dispatch subagents using `file-analyzer` agent definition (`agents/file-analyzer.md`). Run up to 5 subagents concurrently.

After batches complete, merge:
```bash
python <SKILL_DIR>/scripts/merge-batch-graphs.py $PROJECT_ROOT
```

## Phase 3 — ASSEMBLE REVIEW

Dispatch subagent using `assemble-reviewer` agent definition (`agents/assemble-reviewer.md`).

## Phase 4 — ARCHITECTURE

Dispatch subagent using `architecture-analyzer` agent definition (`agents/architecture-analyzer.md`).

## Phase 5 — TOUR

Dispatch subagent using `tour-builder` agent definition (`agents/tour-builder.md`).

## Phase 6 — REVIEW

Validate the knowledge graph. Run inline validation or `--review` path with `graph-reviewer` agent (`agents/graph-reviewer.md`).

## Phase 7 — SAVE

1. Write final knowledge graph to `$PROJECT_ROOT/.understand-anything/knowledge-graph.json`
2. Generate structural fingerprints baseline
3. Write metadata to `$PROJECT_ROOT/.understand-anything/meta.json`
4. Clean up intermediate files (preserving `scan-result.json`)
5. Report summary to user

## Error Handling

- If any subagent dispatch fails, retry once
- Track all warnings in `$PHASE_WARNINGS`
- ALWAYS save partial results — a partial graph is better than no graph
- Never silently drop errors

## Node & Edge Types

See [../references/knowledge-graph-schema.md](../references/knowledge-graph-schema.md) for the complete schema of node types (13 types: file, function, class, module, concept, config, document, service, table, endpoint, pipeline, schema, resource) and edge types (26 types across structural, behavioral, data flow, dependencies, semantic, infrastructure, and schema/data categories).
