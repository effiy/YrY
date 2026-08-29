---
title: mermaid
name: mermaid
description: >
  Mermaid diagram rendering — flowchart, sequence, class, ER, Gantt, state,
  pie, and gitgraph diagrams with 15+ built-in themes. Invoke when the user
  wants to create, edit, debug, or style Mermaid diagrams in markdown, or
  needs to configure Mermaid rendering in a project. Trigger words: "mermaid",
  "mermaid diagram", "mermaid flowchart", "mermaid sequence", "mermaid class",
  "mermaid ER", "mermaid Gantt", "mermaid state", "mermaid pie", "mermaid
  gitgraph", "mermaid theme", "mermaid config", "mermaid init", "graph TD",
  "graph LR", "sequenceDiagram", "classDiagram", "erDiagram", "gantt",
  "stateDiagram", "pie", "gitGraph", "journey", "quadrantChart", "mindmap",
  "timeline", "sankey", "xy chart", "block diagram", "zenuml".
  Do NOT trigger for: general diagram tools (draw.io, PlantUML, Excalidraw),
  image-based diagrams, or non-Mermaid markdown rendering.
lifecycle: active
user_invocable: true
status: stable
type: skill
source: internal
created: 2026-08-10
updated: 2026-08-10
category: aier/skills/mermaid
review_cycle: quarterly
roles:
  - aier
tags:
  - skill
  - mermaid
  - diagram
  - markdown
  - visualization
chip: ai
---
# Mermaid

Diagram rendering in markdown with Mermaid.js.

## Core Concepts

- **Flowchart** — `graph TD/LR` for process flows and decision trees
- **Sequence** — `sequenceDiagram` for API interactions and message flows
- **Class** — `classDiagram` for OOP class hierarchies
- **ER** — `erDiagram` for database entity relationships
- **Gantt** — `gantt` for project timelines and milestones
- **State** — `stateDiagram-v2` for state machines and lifecycle
- **Pie** — `pie` for simple data distribution charts
- **GitGraph** — `gitGraph` for branch/merge visualizations

## Key Rules

1. Use `class="mermaid"` on `<pre>` tags for browser rendering
2. Call `mermaid.run()` after DOM insertion for dynamic content
3. Choose the right diagram type — flowchart for processes, sequence for interactions
4. Keep diagrams focused — one concept per diagram
5. Use `mermaid.initialize()` once with theme config, not per diagram