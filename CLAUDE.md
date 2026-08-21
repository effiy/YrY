# CLAUDE.md — YrY Monorepo

> Monorepo with 3 applications + 1 knowledge base. **YiVad** (Vue 3.5 admin dashboard), **YiAi** (FastAPI backend), **YiPet** (Chrome MV3 extension), and **YiKnowledge** (markdown knowledge base). All apps share the YiAi backend via a unified RPC envelope.

---

## Table of Contents

- [Foundational Beliefs](#foundational-beliefs)
- [Iron Laws](#iron-laws)
- [Architecture Direction](#architecture-direction)
- [Monorepo Map](#monorepo-map)
- [Cross-Project Relationships](#cross-project-relationships)
- [Shared Conventions](#shared-conventions)
- [Development Workflow](#development-workflow)
- [Project Constraints](#project-constraints)
- [Guidance](#guidance)

---

## Foundational Beliefs

- **Trust the model.** Claude is capable of understanding this codebase at a deep level. Give it the context it needs and trust it to make the right calls.
- **Value attention.** Every line of code you write will be read many more times than it was written. Write for the reader, not the writer.
- **Verify reality.** Run the code. Read the results. Assertions beat confidence. The quickest way to be wrong is to skip verification.
- **Think before coding.** State assumptions explicitly; if multiple interpretations exist, present them; if a simpler approach exists, say so.

## Iron Laws

- **Simplicity first.** No features beyond what was asked; no abstractions for single-use code; no error handling for impossible scenes.
- **Surgical changes.** Don't "improve" adjacent code; match existing style; every changed line traces to the user's request.
- **Goal-driven execution.** Transform tasks into verifiable goals; for multi-step tasks, state a brief plan with verify checks per step.
- **Read project CLAUDE.md first.** Before touching any project, read its `CLAUDE.md` — it has the project-specific constraints, module boundaries, and recent changes.

## Architecture Direction

> **Monorepo with shared backend.**
>
> YrY is a monorepo where YiAi serves as the single backend for all frontend projects. The direction is toward **clear cross-project contracts**: the RPC envelope (`{module_name, method_name, parameters}`) is the universal protocol, and parameter name contracts (`filter` not `query`, `target_file` not `path`) must be enforced across all three codebases.
>
> Each project advances along its own axis: YiVad → **componentization**, YiAi → **modularization**, YiPet → **componentization + API layering**. YiKnowledge is the shared knowledge base that serves both humans and AI (RAG data source for YiAi's BRD Agent).

## Monorepo Map

```
YrY/
├── YiVad/          # Vue 3.5 admin dashboard (port 8848)
│   Frontend SPA — ProTable-driven, dynamic routing, button-level permissions.
│   Consumes YiAi for chat, data, files, knowledge, RAG.
│
├── YiAi/           # FastAPI backend (port 10086)
│   Python backend — AI chat (Ollama), file management, RAG, knowledge base,
│   RSS aggregation, WeCom messaging, agent loop. Single source of truth for all data.
│
├── YiPet/          # Chrome MV3 extension
│   Browser extension — injects interactive pet companion into any page.
│   Multi-role chat, knowledge grounding, cross-project bridge to YiVad.
│   Consumes YiAi for chat, sessions, data, knowledge, RAG.
│
└── YiKnowledge/    # Markdown knowledge base
    Shared knowledge — 7 role directories, 4 pipeline stages.
    Serves both humans (documentation) and AI (RAG data source for YiAi).
    YiAi's knowledge watcher scans this tree into MongoDB + vector index.
```

## Cross-Project Relationships

### RPC Protocol (universal)

Every call from YiVad or YiPet to YiAi uses this envelope:

```
POST /  body: {
  "module_name": "services.<domain>.<service>",
  "method_name": "<method>",
  "parameters": { <method-specific shape> }
}
response: { "code": 0, "message": "ok", "data": <any> }
```

### Critical parameter name contracts

| Correct | Wrong | Context |
|---------|-------|---------|
| `filter` | `query` | `data_service.query_documents` parameters |
| `target_file` | `path` | `/read-file`, `/write-file` endpoints |
| `cname` | `collection_name` | `data_service` collection parameter |

These mismatches have caused real bugs — the backend silently ignores `query` and returns 422 for `path`.

### Data flow between projects

```
YiPet (browser) ──fetch──→ YiAi (FastAPI :10086) ←──fetch── YiVad (SPA :8848)
     │                          │
     │ chrome.storage           │ MongoDB (Motor async)
     │                          │ Ollama (LLM inference)
     │                          │ llama_index (RAG)
     │                          │
     └── YiKnowledge ←──knowledge watcher (apscheduler poll)──┤
         (markdown tree)                                       │
         (RAG data source) ←──────────────────────────────────┘
```

### Cross-project bridges

| Bridge | From | To | Mechanism |
|--------|------|----|-----------|
| Chat | YiVad, YiPet | YiAi | SSE streaming via `services.ai.chat_service.chat` |
| Data CRUD | YiVad, YiPet | YiAi | RPC envelope → `data_service.query_documents` etc. |
| File read/write | YiVad, YiPet | YiAi | `POST /read-file`, `/write-file` with `target_file` |
| Knowledge scan | YiVad, YiPet | YiAi | `/knowledge/*` endpoints → YiKnowledge markdown tree |
| RAG query | YiVad, YiPet | YiAi | `/rag/*` endpoints → llama_index hybrid retrieval |
| YiPet → YiVad | YiPet | YiVad | `window.open` with session key → YiVad aiChat page |
| Bug reporting | YiPet | YiVad + YiKnowledge | MongoDB `bugs` + `YiKnowledge/lessons/failures/bugs/` |

## Shared Conventions

### Naming

| Convention | Applies to |
|------------|------------|
| kebab-case files | YiKnowledge (hyphens only, no underscores/digits) |
| snake_case files | YiAi (Python) |
| PascalCase components | YiVad (Vue), YiPet (React) |
| camelCase composables/hooks | YiVad, YiPet |
| Conventional Commits | All projects (commitlint + cz-git) |

### Cross-project type safety

- **YiVad ↔ YiAi**: No automated contract testing exists. Parameter name mismatches (`filter`/`query`, `target_file`/`path`) are the most common bug pattern. Always consult the project CLAUDE.md's cross-project protocol table before adding new API calls.
- **YiPet ↔ YiAi**: Same RPC envelope, same parameter name contracts. YiPet's `ApiClient` wraps the same fetch patterns as YiVad's `RequestHttp`.

### Environment

| Variable | Project | Default |
|----------|---------|---------|
| `RSBUILD_API_BASE` | YiPet, YiVad | `http://localhost:10086` |
| YiAi port | YiAi | `10086` (uvicorn) |
| YiVad dev port | YiVad | `8848` (Rsbuild dev server) |

## Development Workflow

### Starting the full stack

```bash
# 1. Start YiAi backend
cd YiAi && python main.py

# 2. Start YiVad frontend (separate terminal)
cd YiVad && pnpm dev

# 3. Build and load YiPet extension (separate terminal)
cd YiPet && npm run build
# Then load dist/ as unpacked extension in Chrome
```

### Making cross-project changes

1. **Read both project CLAUDE.md files** — each has its own module boundaries, constraints, and recent changes.
2. **Check the RPC contract** — verify parameter names against the cross-project protocol table.
3. **Test both sides** — a YiVad change that adds a new API call needs YiAi to be running.
4. **Update YiKnowledge** — if the change introduces a new pattern, gotcha, or lesson, add it to the appropriate YiKnowledge role directory.

### Knowledge base maintenance

- YiKnowledge is scanned by YiAi's knowledge watcher (apscheduler poll every 5s).
- Frontmatter is required: `title`, `tags`, `category`, `created`, `updated`, `source`, `type`, `status`.
- File naming: kebab-case, no underscores or digits.
- Max 3 directory levels: `role/problem-domain/file.md`.
- Run the [readiness checklist](YiKnowledge/curator/governance/readiness-checklist.md) before adding new content.

## Project Constraints

### Non-Negotiable Baselines

- **YiAi must be running** for YiVad and YiPet to function — it is the single source of truth for all data.
- **TypeScript strict mode** in YiVad and YiPet — `vue-tsc --noEmit` / `tsc --noEmit` must pass.
- **Conventional commits** enforced by commitlint in all projects.
- **RPC envelope** is the only protocol for cross-project calls — no direct MongoDB access from frontends.
- **YiKnowledge frontmatter** is required for all knowledge files — the RAG engine depends on it.

## Guidance

| Resource | Purpose |
|----------|---------|
| [YiVad/CLAUDE.md](YiVad/CLAUDE.md) | YiVad project profile, module boundaries, constraints, recent changes |
| [YiAi/CLAUDE.md](YiAi/CLAUDE.md) | YiAi project profile, module boundaries, constraints, recent changes |
| [YiPet/CLAUDE.md](YiPet/CLAUDE.md) | YiPet project profile, module boundaries, constraints, recent changes |
| [YiKnowledge/README.md](YiKnowledge/README.md) | Knowledge base pipeline overview, role directories, design principles |
| [YiKnowledge/INDEX.md](YiKnowledge/INDEX.md) | Knowledge base navigation index |
| [YiKnowledge/MEMORY.md](YiKnowledge/MEMORY.md) | Knowledge base rulebook and naming conventions |
| [YiKnowledge/curator/governance/](YiKnowledge/curator/governance/) | Knowledge governance, lifecycle, readiness checklist |
| Memory files | `~/.claude/projects/-Users-ruiyi-YrY/memory/` — user role, feedback, project references |