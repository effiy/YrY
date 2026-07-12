---
name: diagram-diff
description: >
  Analyze git diffs or pull requests against the knowledge graph —
  identify changed components, affected dependencies, and architectural
  risk from code changes.
---

# Diff Analysis — Analyze Changes Against the Knowledge Graph

Analyze git diffs or pull requests against the knowledge graph.

## Available Tools

| Tool | Purpose |
|------|---------|
| `RunCommand` | Run git diff commands |
| `Read` | Read knowledge-graph.json, changed files |
| `Grep` | Search graph for affected nodes |

## Prerequisites

- `.understand-anything/knowledge-graph.json` must exist in the project directory
- The project must be a git repository

## Process

1. Check that `.understand-anything/knowledge-graph.json` exists — if not, tell the user to run `/understand` first
2. Get the list of changed files:
   - Staged + unstaged: `git diff --name-only`
   - Staged only: `git diff --cached --name-only`
   - Against main: `git diff --name-only main...HEAD`
   - PR diff: `git diff --name-only origin/main...HEAD`
3. Find nodes in the knowledge graph corresponding to changed files
4. Find connected edges — 1-hop subgraph:
   - Upstream callers (who imports/calls/depends on changed files)
   - Downstream dependencies (what changed files import/call/depend on)
5. Identify affected architecture layers
6. Write structured analysis to `.understand-anything/diff-overlay.json`

## Output

Provide a structured analysis including:

1. **Changed Components** — Files modified and their roles (nodes from the graph)
2. **Affected Components** — Upstream and downstream nodes that may be impacted
3. **Affected Layers** — Architecture layers with modified nodes
4. **Risk Assessment** — Qualitative risk based on:
   - Number of downstream dependents
   - Whether changed components are high-complexity
   - Whether changed components span multiple layers
   - Whether critical infrastructure is affected

## Edge Cases

- If the project is not a git repo, fall back to raw diff analysis without the knowledge graph
- If changed files don't appear in the knowledge graph, note this and suggest re-running `/understand`
- If the graph is stale (commit hash mismatch), note the staleness
