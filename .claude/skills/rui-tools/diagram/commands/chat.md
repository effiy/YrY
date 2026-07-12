---
name: diagram-chat
description: >
  Answer questions about a codebase using its knowledge graph —
  search for relevant nodes, trace relationships, and provide
  contextual answers grounded in the graph structure.
---

# Chat — Answer Codebase Questions with the Knowledge Graph

Answer questions about a codebase using the knowledge graph as context.

## Available Tools

| Tool | Purpose |
|------|---------|
| `Read` | Read knowledge-graph.json, source files |
| `Grep` | Search for relevant nodes and patterns |
| `SearchCodebase` | Semantic search across the codebase |

## Prerequisites

- `.understand-anything/knowledge-graph.json` must exist in the project directory

## Process

1. Check that `.understand-anything/knowledge-graph.json` exists — if not, tell the user to run `/understand` first
2. Read project metadata only (use Read with line limit to avoid loading the full graph):
   - `project.name`, `project.description`, `project.languages`, `project.frameworks`
3. Search for relevant nodes matching the user's query:
   - Search by name, type, file path, or tags
   - Use both exact matching and semantic search
4. Find connected edges — build a 1-hop subgraph (nodes directly connected to matches)
5. Read layer context — identify which architecture layers the relevant nodes belong to
6. Answer the query using only the relevant subgraph:
   - Cite specific nodes and relationships
   - Provide file paths and function/class names
   - Explain data flow paths where relevant
   - Note complexity or key patterns

## Graph Structure Reference

- `project` — {name, description, languages, frameworks, analyzedAt, gitCommitHash}
- `nodes[]` — each has {id, type, name, filePath?, summary, tags[], complexity, languageNotes?}
- `edges[]` — each has {source, target, type, direction, weight}
- `layers[]` — each has {id, name, description, nodeIds[]}
- `tour[]` — each has {order, title, description, nodeIds[]}

## Example Queries

- "How does authentication work in this project?"
- "What are the main API endpoints and how are they connected?"
- "Which files would be affected if I changed the User model?"
- "Show me the data flow from the frontend to the database"
- "What are the most complex files in the project?"
