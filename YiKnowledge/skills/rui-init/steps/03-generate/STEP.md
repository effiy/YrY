---
description: "Step 03-generate: emit CLAUDE.md + README.md from profile + exploration."
---
# 03-generate

> Input: `profile` + `exploration` from detect/explore steps.
> Output: `CLAUDE.md`, `README.md` on disk.

## Role

You're a senior expert software engineer with extensive experience in open source
projects. You write documentation that is appealing, informative, and easy to
read — every file you produce should make the project immediately understandable
to a newcomer.

## Task

1. Take a deep breath. Review the full `profile` and `exploration` pipeline
   state — understand the project's identity, architecture, conventions, and
   security surface before writing a single line.
2. Emit `CLAUDE.md` — the AI assistant's project profile. Follow the canonical
   structure and content guidelines below.
3. Emit `README.md` — the human-facing project entry point. Follow the README
   quality standards below.

## CLAUDE.md Structure

### Required sections

| # | Section | Content |
|---|---------|---------|
| 1 | **Title + one-liner** | `# CLAUDE.md — ProjectName` + one sentence describing the project and its role in the ecosystem |
| 2 | **Table of Contents** | Anchor links to all sections |
| 3 | **Foundational Beliefs** | See [Foundational Beliefs](#foundational-beliefs) below |
| 4 | **Iron Laws** | See [Iron Laws](#iron-laws) below |
| 5 | **Architecture Direction** | One sentence: the project's architectural axis (componentization, modularization, etc.) |
| 6 | **Project Profile** | Table: name, type, version, framework, build tool, key dependencies, architecture pattern |
| 7 | **Project Structure** | High-level directory tree with 1-line descriptions per directory |
| 8 | **Module Boundaries** | Each module: its responsibility, what it owns, what it must not do |
| 9 | **Data Flow** | How data moves through the system (request → handler → service → store → view) |
| 10 | **Project Constraints** | Non-negotiable baselines: type checks, lint rules, protocol rules, environment requirements |

### Conditional sections

| Section | When to include |
|---------|----------------|
| **Cross-Project Relationships** | If `architecturePattern === 'monorepo'` — RPC protocols, data flow between sub-projects, critical parameter contracts |
| **Degradation Countermeasures** | If the project calls external APIs — fallback behavior, timeout handling, circuit breakers |
| **Self-Constraints** | If the project has framework-specific rules (e.g. "no Options API" for Vue, "no axios in stores") |
| **Recent Changes** | If git log shows significant changes in the last 30 days |
| **Guidance** | Always — links to related projects, knowledge base, memory files |

### Foundational Beliefs

These are the core principles for AI assistants working on this project. Use
this canonical template, adapted to the project's language and ecosystem:

```
- **Trust the model.** Claude is capable of understanding this codebase at a
  deep level. Give it the context it needs and trust it to make the right calls.
- **Value attention.** Every line of code you write will be read many more
  times than it was written. Write for the reader, not the writer.
- **Verify reality.** Run the code. Read the results. Assertions beat
  confidence. The quickest way to be wrong is to skip verification.
- **Think before coding.** State assumptions explicitly; if multiple
  interpretations exist, present them; if a simpler approach exists, say so.
  If something is unclear, stop and ask rather than guessing.
```

### Iron Laws

These are non-negotiable rules. Use this canonical template:

```
- **Simplicity first.** No features beyond what was asked; no abstractions for
  single-use code; no error handling for impossible scenarios. If you write 200
  lines and it could be 50, rewrite it.
- **Surgical changes.** Don't "improve" adjacent code; match existing style;
  every changed line traces to the user's request. When your changes create
  orphans (unused imports, dead variables), clean them up — but don't remove
  pre-existing dead code unless asked.
- **Goal-driven execution.** Transform tasks into verifiable goals; for
  multi-step tasks, state a brief plan with verify checks per step. Strong
  success criteria let you loop independently; weak criteria require constant
  clarification.
```

### Style rules for CLAUDE.md

- **One sentence per line** in prose sections — makes diffs readable.
- **Tables** for structured data (profile, structure, boundaries, constraints).
- **Blockquotes** (`>`) for architecture direction summaries.
- **Code blocks** with language tags for commands and examples.
- **No emojis** — this is a technical reference for AI assistants, not a README.
- **Relative links** to referenced files within the project.
- **`---` horizontal rules** between major sections for visual separation.

## README Quality Standards

### Structure

| Section | Required | Notes |
|---------|:--------:|-------|
| Project name + one-line description | Yes | Clear enough that a stranger understands the project in 5 seconds |
| Features / capabilities | Yes | Bullet list, not paragraphs |
| Quick start / getting started | Yes | Copy-pasteable commands that work on a fresh clone |
| Architecture overview | If non-trivial | Diagram or directory tree, not prose |
| Configuration / environment | If applicable | Table of env vars with defaults |
| Development workflow | Yes | How to dev, build, test, deploy |
| API reference | If applicable | Link to external docs or inline examples |
| Project structure | Yes | High-level directory map |

### Style

- **Concise.** Every sentence earns its place. No filler, no marketing fluff.
- **No emoji overuse.** One or two in headers is fine; emoji bullets are not.
- **GFM formatting.** Use GitHub Flavored Markdown: tables, code blocks with
  language tags, task lists.
- **GitHub admonitions** where appropriate (`> [!NOTE]`, `> [!WARNING]`,
  `> [!TIP]`). See [GitHub admonition syntax](https://github.com/orgs/community/discussions/16925).
- **One sentence per line.** Makes diffs readable. Renders the same as paragraphs.

### Exclusion

Do not include standalone sections for things that have dedicated files:
`LICENSE`, `CONTRIBUTING`, `CHANGELOG`, `CODE_OF_CONDUCT`, `SECURITY`.

### Domain Language preservation

If a `README.md` already exists and contains a `## Domain Language` section,
preserve it verbatim. This is user-curated content that the pipeline must not
overwrite. All other sections are rebuilt from `profile` + `exploration`.

### Logo

If the project has a logo or icon at a discoverable path (e.g. `docs/logo.svg`,
`assets/icon.png`), include it in the README header:
```markdown
<img src="./docs/logo.svg" alt="Project Logo" width="120" align="right">
```

### Inspiration

Study these README files for structure, tone, and content patterns:
- https://raw.githubusercontent.com/Azure-Samples/serverless-chat-langchainjs/refs/heads/main/README.md
- https://raw.githubusercontent.com/Azure-Samples/serverless-recipes-javascript/refs/heads/main/README.md
- https://raw.githubusercontent.com/sinedied/run-on-output/refs/heads/main/README.md
- https://raw.githubusercontent.com/sinedied/smoke/refs/heads/main/README.md

## Output

| File | Source | Behavior |
|------|--------|----------|
| `CLAUDE.md` | Generated from `profile` + `exploration` | Full rewrite |
| `README.md` | Generated from `profile` + `exploration` | Full rewrite; `## Domain Language` preserved if exists |

## Pipeline Contract

- **Reads**: `pipelineState.profile`, `pipelineState.exploration`
- **Writes**: files on disk (no `pipelineState` fields)
- **Must not**: invoke other steps, read downstream state, modify user-curated content