---
name: rui-tools-diagram
description: >
  Create polished dark-themed architecture diagrams as self-contained HTML+SVG files,
  and analyze codebases to produce interactive knowledge graphs for understanding
  architecture, components, and relationships. Trigger when the user asks to create
  architecture diagrams, analyze codebase structure, understand project architecture,
  generate knowledge graphs, or explore system design.
  Trigger words: architecture diagram, knowledge graph, codebase understanding,
  understand codebase, system architecture, component diagram, tech diagram,
  codebase analysis, dashboard, onboarding guide, diff analysis.
lifecycle: default-pipeline
user_invocable: true
---

# rui-tools-diagram

> Architecture diagrams and codebase understanding — create professional dark-themed system diagrams and analyze codebases to produce interactive knowledge graphs.

## Quick Start

```
/rui-tools-diagram create           → Create a polished architecture diagram (HTML+SVG)
/rui-tools-diagram understand       → Analyze a codebase, produce a knowledge graph
/rui-tools-diagram dashboard        → Launch the interactive knowledge graph dashboard
/rui-tools-diagram chat             → Answer questions about a codebase using its graph
/rui-tools-diagram diff             → Analyze git diffs against the knowledge graph
/rui-tools-diagram domain           → Extract business domain knowledge from a codebase
/rui-tools-diagram knowledge        → Analyze a Karpathy-pattern LLM wiki knowledge base
/rui-tools-diagram onboard          → Generate a comprehensive onboarding guide
/rui-tools-diagram explain          → Provide a deep explanation of a specific component
```

## What This Skill Does

- Generate self-contained dark-themed architecture diagrams with inline SVG, CSS animations, and built-in export (PNG, PDF, clipboard)
- Analyze codebases to produce structured knowledge graphs in `.understand-anything/knowledge-graph.json`
- Launch an interactive web dashboard for exploring project architecture, components, and relationships
- Answer natural-language questions about a codebase using the knowledge graph as context
- Analyze git diffs or pull requests to identify affected components and risk
- Extract business domain knowledge and generate interactive domain flow graphs
- Parse and analyze Karpathy-pattern LLM wiki knowledge bases
- Generate structured onboarding guides with project overview, architecture layers, and guided tours
- Provide deep, contextual explanations of specific code components

## What This Skill Does NOT Do

- Does NOT create UML, sequence, or class diagrams — this is for high-level architecture diagrams
- Does NOT modify the codebase being analyzed — all output goes to `.understand-anything/`
- Does NOT replace code review or testing — the diff analysis is structural, not semantic
- Does NOT guarantee perfect accuracy — knowledge graphs are LLM-generated approximations
- Does NOT require the codebase to be in any particular language or framework — but quality varies

## Workflow

```
Diagram:  Get Requirements → Build SVG Layout → Styled HTML Output
Graph:    Scan → Analyze (batched) → Review → Architecture → Tour → Validate → Save
```

Key principles:
1. Architecture diagrams produce a single self-contained `.html` file — no external dependencies except CDN for export
2. Codebase understanding runs in 7 phases (0–7), reporting progress at each transition
3. Full analysis only on `--full` flag or first run; incremental updates on subsequent runs
4. Batch analysis uses parallel subagents (up to 5 concurrent) for speed
5. A partial knowledge graph is always saved — better than no graph
6. Dashboard is launched as a local dev server; user gets a preview URL

## Borders

| Boundary | Permission |
|----------|-----------|
| `<skill-path>/**` (diagram skill) | read-only |
| `<project>/.understand-anything/**` | read + write |
| Source code under analysis | read-only |
| Dashboard packages (pnpm) | read + write (install/build) |

## Rules

| # | Rule | Rationale |
|---|------|-----------|
| 1 | Always produce a self-contained HTML file for diagrams — no external stylesheets | Ensures portability and offline viewing |
| 2 | Draw connection arrows early in the SVG (before component boxes) | SVGs paint in document order; arrows must render behind boxes |
| 3 | Use opaque background rects behind semi-transparent boxes | Prevents arrows from bleeding through transparent fills |
| 4 | Place legends outside all boundary boxes, expanding the viewBox if needed | Avoids visual clutter and overlap |
| 5 | Maintain minimum 40px vertical gap between components | Prevents crowding and ensures readable layouts |
| 6 | Always save partial knowledge graph results — never silently drop errors | A partial graph is better than no graph for the user |
| 7 | Retry failed subagent dispatches exactly once before continuing | Balances reliability with execution time |
| 8 | Use consistent node/edge ID conventions across all graph generation phases | Enables correct merging and incremental updates |
| 9 | Report progress at every phase transition during codebase analysis | Keeps the user informed during long-running operations |

## Commands

- [create.md](./commands/create.md) — Create a polished architecture diagram from requirements.
- [understand.md](./commands/understand.md) — Analyze a codebase and produce a knowledge graph.
- [dashboard.md](./commands/dashboard.md) — Launch the interactive knowledge graph dashboard.
- [chat.md](./commands/chat.md) — Answer questions about a codebase using its knowledge graph.
- [diff.md](./commands/diff.md) — Analyze git diffs against the knowledge graph.
- [domain.md](./commands/domain.md) — Extract business domain knowledge and generate domain flow graphs.
- [knowledge.md](./commands/knowledge.md) — Analyze a Karpathy-pattern LLM wiki knowledge base.
- [onboard.md](./commands/onboard.md) — Generate a comprehensive onboarding guide from the knowledge graph.
- [explain.md](./commands/explain.md) — Provide a deep, contextual explanation of a specific code component.

## Supporting Resources

- [resources/template.html](./resources/template.html) — Base HTML+SVG template for architecture diagrams with all design system elements.
- [references/knowledge-graph-schema.md](./references/knowledge-graph-schema.md) — Complete schema for nodes, edges, layers, and tours in knowledge-graph.json.
- [agents/](./agents/) — Subagent instructions for codebase analysis phases (project-scanner, file-analyzer, assemble-reviewer, architecture-analyzer, tour-builder, graph-reviewer, domain-analyzer, article-analyzer, knowledge-graph-guide).
- [scripts/](./scripts/) — Analysis and utility scripts (scanning, extraction, batching, fingerprinting, merging).
- [skills/](./skills/) — Sub-skill SKILL.md definitions and LLM prompt templates (language guides, framework addendums, locales).
- [core/](./core/) — Core parsing and analysis engine with language/framework support.
- [dashboard/](./dashboard/) — Interactive knowledge graph visualization dashboard.
- [hooks/](./hooks/) — Automation hooks for knowledge graph updates.

## Fallback

| Situation | Behavior |
|-----------|----------|
| No knowledge graph exists for chat/diff/onboard/explain commands | Run `/understand` first, then retry the command |
| Subagent dispatch fails during analysis | Retry once; if it fails again, skip and continue with remaining batches |
| Dashboard fails to build (pnpm install error) | Try without `--frozen-lockfile`; if still failing, direct user to package directory |
| User doesn't want the full analysis pipeline | Suggest `--full` to skip incremental logic, or accept partial results |
| No git repo detected for diff analysis | Fall back to raw `diff --name-only` output; provide best-effort analysis |
| Large codebase times out during analysis | Graphs are saved per-batch; user can resume with incremental update |
| Diagram dimensions overflow viewBox | Expand viewBox dynamically based on computed layout; never crop content |
