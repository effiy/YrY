---
name: diagram-explain
description: >
  Provide a thorough, in-depth explanation of a specific code component
  — analyze its role, internal structure, external connections, and
  data flow within the project architecture.
---

# Deep Explain — In-Depth Component Explanation

Provide a thorough, in-depth explanation of a specific code component.

## Available Tools

| Tool | Purpose |
|------|---------|
| `Read` | Read knowledge-graph.json and source files |
| `SearchCodebase` | Semantic search for related components |

## Prerequisites

- `.understand-anything/knowledge-graph.json` must exist in the project directory
- The target component (file, function, class) must be specified by the user

## Process

1. Check that `.understand-anything/knowledge-graph.json` exists — if not, tell the user to run `/understand` first
2. Find the target node by file path or function/class notation:
   - File: match by `filePath`
   - Function: match by `name` + `type: "function"`
   - Class: match by `name` + `type: "class"`
3. Find all connected edges — both incoming and outgoing
4. Read connected nodes — understand the component's neighborhood
5. Identify the architecture layer the component belongs to
6. Read the actual source file for full context
7. Provide a structured explanation:

### Explanation Structure

1. **Role in the System** — What this component does and why it exists
2. **Internal Structure** — Key functions, classes, data structures, and logic flow
3. **External Connections** — What calls this component and what it calls
   - Upstream dependencies (incoming edges)
   - Downstream dependents (outgoing edges)
4. **Data Flow** — How data enters, transforms, and exits this component
5. **Patterns & Conventions** — Any design patterns, coding conventions, or notable approaches
6. **Complexity & Risks** — Complexity metrics and potential issues

## Format

- Use the source file content and the knowledge graph together — graph provides high-level context, source provides detail
- Include actual code snippets where helpful
- Use file references for navigation
- Explain in plain language, not just regurgitating code
