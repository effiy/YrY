---
title: YiAi Onboarding — Day 1 Quick Start
tags: [onboarding, yiai, setup, quick-start]
category: engineer/run/onboarding
created: 2026-08-21
updated: 2026-08-21
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer]
benefit: "New YiAi engineers set up their dev environment and understand the backend architecture within the first day"
acceptance_criteria:
  - "Setup steps verified working"
  - "Key architectural concepts explained"
  - "Common gotchas documented"
  - "Day-1 task checklist included"
related:
  - ./README.md
  - ./yivad-onboarding.md
  - ../../../../YiAi/CLAUDE.md
  - ../../learn/projects/yiai/README.md
---

# YiAi Onboarding — Day 1

> **Goal**: By end of day 1, you can run YiAi locally, understand the architecture, and trace a request from RPC envelope to MongoDB.

## Prerequisites

- Python 3.10+
- MongoDB (local or Docker)
- Ollama (for LLM inference)
- pip

## Setup (30 min)

```bash
cd YiAi
pip install -r requirements.txt
python main.py        # Starts uvicorn on http://localhost:10086
```

Verify:
```bash
curl http://localhost:10086/health/observer
# {"status": "ok", "mongodb": "connected", "ollama": "available"}
```

## Architecture overview

Start with the project [CLAUDE.md](../../../../YiAi/CLAUDE.md). Key concepts:

| Concept | What it is | Where |
|---|---|---|
| Domain layer | Business logic — each domain owns its logic | `src/domain/{ai,files,knowledge,rag,rss,state,wework,execution,auth}/` |
| Service layer | Wraps domain for routes — routes never call data/ directly | `src/services/{ai,database,execution,knowledge,rag,rss,storage}/` |
| Data layer | MongoDB singleton (Motor async) + repository | `src/data/database.py`, `src/data/repository.py` |
| RPC envelope | `{module_name, method_name, parameters}` — universal protocol | `src/app.py` root route handler |
| Knowledge watcher | apscheduler polling YiKnowledge tree → MongoDB + RAG index | `src/domain/knowledge/watcher.py` |
| RAG engine | llama_index hybrid retrieval (vector + BM25) | `src/domain/rag/engine.py` |
| Agent loop | Multi-turn tool-calling agent with confirmation gate | `src/domain/ai/agent.py` |

## Data flow (trace a request)

```
YiVad/YiPet POST /  body: {module_name, method_name, parameters}
  → FastAPI root route handler (src/app.py)
  → resolves module_name → Python module
  → resolves method_name → callable
  → service.<domain>.<service>.<method>(**parameters)
  → domain logic
  → data/repository.py → MongoDB (Motor async)
  → response: {code: 0, message: "ok", data: <any>}
```

## Module boundaries

Every caller outside a domain package depends only on the public API surface:

| Module | Public API | Internal (do not import) |
|---|---|---|
| `domain/ai/` | `chat.py`, `agent.py`, `data_tools.py`, `tools.py` | — |
| `domain/files/` | `__init__.py` re-exports `read_file`, `write_file`, etc. | `local.py`, `storage.py`, `paths.py` |
| `domain/knowledge/` | `scanner.py`, `watcher.py`, `writer.py` | — |
| `domain/rag/` | `engine.py`, `indexer.py`, `settings.py` | — |

## Common gotchas

1. **`_build_filter` reads `filter`, not `query`** — When callers send `query` in parameters, it's silently ignored. Always use `filter`.
2. **Pydantic models require `target_file`, not `path`** — `FileReadRequest` and `FileWriteRequest` use `target_file`. Sending `path` returns 422.
3. **macOS FSEvents silently drops events** — The knowledge watcher uses apscheduler polling (5s), not FSEvents. Don't replace it with watchdog.
4. **Domain → services → routes, never skip** — Routes never call `data/` directly. They go through `services/`. Domain packages never import `server/`.
5. **MongoDB is the single point of failure** — When MongoDB is unreachable, all features fail. No cache layer exists. The degradation countermeasures document this but don't automate recovery.

## Day-1 task checklist

- [ ] Run `python main.py` and verify `http://localhost:10086/health/observer`
- [ ] Read `YiAi/CLAUDE.md` (~30 min)
- [ ] Open `src/app.py` and trace the root route handler (RPC envelope resolution)
- [ ] Open `src/data/database.py` and understand the MongoDB singleton
- [ ] Open `src/domain/ai/agent.py` and read the agent loop structure
- [ ] Open `src/domain/knowledge/watcher.py` and understand the polling loop
- [ ] Make a small change: add a log line to a route handler, verify it appears
- [ ] Read the cross-project RPC protocol: `YiKnowledge/engineer/build/cross-project-rpc-protocol.md`

## Next steps

- [YiAi engineering README](../../learn/projects/yiai/README.md) — deeper architecture, anti-patterns, action recommendations
- [YiAi CLAUDE.md](../../../../YiAi/CLAUDE.md) — authoritative reference for module boundaries, constraints, recent changes
- [Cross-project RPC protocol](../../build/cross-project-rpc-protocol.md) — complete API contract