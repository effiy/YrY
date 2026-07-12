---
name: diagram-knowledge
description: >
  Analyze a Karpathy-pattern LLM wiki knowledge base and generate an
  interactive knowledge graph — detect format, extract implicit knowledge,
  merge results, and launch the dashboard.
---

# Knowledge Base Analysis — Analyze LLM Wiki Knowledge Bases

Analyze a Karpathy-pattern LLM wiki knowledge base and generate an interactive knowledge graph.

## Available Tools

| Tool | Purpose |
|------|---------|
| `Task` (subagent) | Dispatch article-analyzer subagents |
| `RunCommand` | Run format detection and merge scripts |
| `Read` / `Write` | File operations |

## Prerequisites

- A Karpathy-pattern LLM wiki directory (markdown files with frontmatter)

## Process

1. Determine target directory from `$ARGUMENTS`
2. Run format detection script:
   ```bash
   python3 <SKILL_DIR>/scripts/parse-knowledge-base.py <TARGET_DIR>
   ```
3. Dispatch `article-analyzer` subagents (`agents/article-analyzer.md`) for implicit knowledge extraction:
   - Each article is analyzed for its topic, key claims, and relationships to other articles
   - Run subagents in parallel, up to 5 concurrent
4. Merge results:
   ```bash
   python3 <SKILL_DIR>/scripts/merge-knowledge-graph.py <TARGET_DIR>
   ```
5. Validate the merged graph against the knowledge graph schema
6. Save to `.understand-anything/knowledge-graph.json`
7. Auto-trigger the dashboard (`/dashboard`) to visualize the result

## What is a Karpathy-Pattern Wiki?

Named after Andrej Karpathy's approach, this format uses structured markdown files with:
- YAML frontmatter with metadata (title, tags, date, status)
- Hierarchical content with links between articles
- Explicit and implicit knowledge relationships

The analyzer extracts both explicit links and infers implicit relationships through LLM analysis of article content.
