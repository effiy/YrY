---
name: diagram-onboard
description: >
  Generate a comprehensive onboarding guide from a project's knowledge
  graph — overview, architecture layers, key concepts, guided tour,
  file map, and complexity hotspots.
---

# Onboarding Guide — Generate an Onboarding Document

Generate a comprehensive onboarding guide from the project's knowledge graph.

## Available Tools

| Tool | Purpose |
|------|---------|
| `Read` | Read knowledge-graph.json |
| `Write` | Save the onboarding guide |

## Prerequisites

- `.understand-anything/knowledge-graph.json` must exist in the project directory

## Process

1. Check that `.understand-anything/knowledge-graph.json` exists — if not, tell the user to run `/understand` first
2. Read project metadata, layers, tour, and file-level structural nodes
3. Identify complexity hotspots — nodes with the highest complexity scores
4. Generate the guide with these sections:

### 1. Project Overview
- Name, description, languages, frameworks
- When the analysis was run (from metadata)

### 2. Architecture Layers
- For each layer: name, description, key components
- How layers relate to each other

### 3. Key Concepts
- Important classes, modules, and patterns
- Central data structures and their roles

### 4. Guided Tour
- Step-by-step walkthrough following the tour nodes
- Start with entry points, follow the dependency chain

### 5. File Map
- Key files organized by layer and purpose
- Brief descriptions of each file's role

### 6. Complexity Hotspots
- Files and functions with highest complexity
- Why they're complex and what to watch for

5. Format as clean markdown with clear headings and code references
6. Offer to save to `docs/ONBOARDING.md`

## Style

- Use the project's actual file paths as clickable references
- Keep explanations concise and actionable
- Focus on what a new developer actually needs to know
- Highlight patterns, not just file listings
