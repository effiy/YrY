---
name: diagram-domain
description: >
  Extract business domain knowledge from a codebase and generate an
  interactive domain flow graph — from existing knowledge graph or
  via lightweight scan.
---

# Domain Analysis — Extract Business Domain Knowledge

Extract business domain knowledge and generate an interactive domain flow graph.

## Available Tools

| Tool | Purpose |
|------|---------|
| `Task` (subagent) | Dispatch domain-analyzer subagent |
| `RunCommand` | Run extraction script |
| `Read` | Read knowledge-graph.json |

## Prerequisites

- The target project directory must exist

## Process

1. Determine project directory from `$ARGUMENTS` or current working directory
2. Check if `.understand-anything/knowledge-graph.json` exists:
   - **If it exists**: Derive domain knowledge from the existing graph
   - **If not**: Perform a lightweight scan of the codebase
3. Use `--full` flag to force a fresh scan even if a graph exists
4. Extract domain context:
   ```bash
   python <SKILL_DIR>/scripts/extract-domain-context.py $PROJECT_ROOT
   ```
5. Dispatch `domain-analyzer` subagent (`agents/domain-analyzer.md`) to analyze the extracted context
6. Generate the domain flow graph
7. Save to `.understand-anything/domain-graph.json`

## Domain Graph Schema

The domain graph captures:
- **Domain concepts** — Business entities and their relationships
- **Domain flows** — How concepts interact in business processes
- **Domain boundaries** — Bounded contexts within the codebase
- **Concept sources** — Links back to code locations supporting each concept

## Output

The domain graph can be visualized in the dashboard alongside the architectural knowledge graph, providing a business-centric view of the codebase.
