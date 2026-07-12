---
name: diagram-dashboard
description: >
  Launch the interactive web dashboard to visualize a codebase's
  knowledge graph — start the Vite dev server and provide a preview
  URL for exploring architecture, components, and relationships.
---

# Dashboard — Launch the Interactive Knowledge Graph Viewer

Launch the interactive web dashboard to visualize a codebase's knowledge graph.

## Available Tools

| Tool | Purpose |
|------|---------|
| `RunCommand` | Build and start the Vite dev server |
| `Read` | Check for knowledge-graph.json existence |
| `OpenPreview` | Open the dashboard URL in the browser |

## Prerequisites

- `.understand-anything/knowledge-graph.json` must exist in the project directory
- Node.js and pnpm must be available

## Process

1. Determine project directory from `$ARGUMENTS` or current working directory
2. Check that `.understand-anything/knowledge-graph.json` exists — if not, tell the user to run `/understand` first
3. The dashboard code lives at `<SKILL_DIR>/dashboard/`. Build and start:

   ```bash
   cd <SKILL_DIR> && (pnpm install --frozen-lockfile 2>/dev/null || pnpm install)
   cd <SKILL_DIR>/dashboard && GRAPH_DIR=<project-dir> npx vite --host 127.0.0.1
   ```

6. Report the preview URL to the user and open it with `OpenPreview`.

## What the User Sees

The dashboard provides:
- **Graph View** — Interactive node-and-edge visualization of the codebase
- **Layer View** — Architecture layers with component groupings
- **Search** — Find files, functions, classes by name
- **Path Finder** — Trace relationships between any two components
- **File Explorer** — Browse the codebase through the graph
- **Onboarding Tour** — Step-by-step walkthrough of the architecture
