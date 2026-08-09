---
title: YiAi Onboarding
aliases:
- YiAi Onboarding
tags:
- onboarding
- onboarding
- backend
- FastAPI
- Python
- YiAi
category: new-hire/onboarding/yiai
created: 2026-07-31
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles:
- new-hire
benefit: onboarded quickly
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ../../../engineer/projects/yiai/README.md
- ../../../engineer/projects/yiai/engineering/claude.md
- ../../../engineer/projects/yiai/engineering/readme.md
- ../../../engineer/projects/yiai/stories/ai-chat-function/story.md
- ../../../engineer/projects/yiai/stories/overseas-after-sales-ai-brd-agent/story.md
- ../../../engineer/projects/INDEX.md
tacit: false
---

# YiAi Onboarding

> **As a** new hire, **I want to** onboarding, **so that** onboarded quickly.

> FastAPI backend, the server side of the Yi family. AI chat, file dual-write, RSS, WeCom (Enterprise WeChat), RAG, and state storage all live here.

## Summary

- YiAi is the FastAPI backend service of the Yi family, running on port 10086, providing the frontend (YiVad, YiPet) with AI chat, file storage, RSS aggregation, WeCom push, RAG retrieval, and a generic RPC execution engine
- The RPC execution engine is the most important architectural concept — unlike a typical REST API, YiAi dispatches `module_name.method_name(parameters)` calls through a generic handler, which means adding a new service method requires no router changes
- Day-1 setup requires Python 3.10+, MongoDB 5+, and Ollama with qwen3.5 + nomic-embed-text models; the verification checklist confirms the health endpoint, Swagger docs, and RAG index status
- The pitfalls cheatsheet captures real incidents from previous new hires: `filter` not `query` for the RPC parameter, `target_file` not `path` for the file service, and the watcher debounce delay for RAG store edits
- The "What to read next" section provides a graduated path from operational competence (CLAUDE.md module boundaries) to architectural understanding (RAG domain layer, domain/service separation)

## 1. Project positioning

YiAi is the backend service of the Yi family (YiAi / YiVad / YiPet), running on port `10086`. It provides the frontend (YiVad admin console, YiPet browser extension) with AI chat, file storage, RSS aggregation, WeCom push, RAG retrieval-augmented generation, and a general RPC execution engine. Stack: Python 3.10+ / FastAPI / Motor (MongoDB async) / Ollama.

## 2. Day-1 setup (30 minutes to green)

### Prerequisites

- Python 3.10+
- MongoDB 5+ local or remote (default `mongodb://localhost:27017`)
- Ollama running locally (default `http://localhost:11434`), download `qwen3.5` + `nomic-embed-text` models
- (optional) Aliyun OSS bucket + credentials for object storage

### Steps

```bash
# 1. Clone (skip if already inside the YrY repo)
cd /path/to/YrY/YiAi

# 2. Install deps (venv recommended)
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# 3. Start MongoDB (pick one)
brew services start mongodb-community   # macOS
# or docker run -d -p 27017:27017 mongo:5

# 4. Start Ollama + pull models
ollama serve &
ollama pull qwen3.5
ollama pull nomic-embed-text

# 5. Start backend
python main.py          # dev mode, uvicorn --reload
# or production: uvicorn src.app:app --host 0.0.0.0 --port 10086
```

### Verification checklist

- [ ] `curl http://localhost:10086/health/observer` returns `{"code":0,...}`
- [ ] Browser opens `http://localhost:10086/docs` to see Swagger
- [ ] Logs show `Knowledge watcher started (poll every 5s)`
- [ ] Logs show `RAG index ... loaded` or first access to `/rag-status` triggers auto-build

## 3. Three high-frequency workflows

### Workflow A: Add an RPC endpoint (for frontend to call)

Example: add a `services/todo/list_todos` method.

1. Find/create the corresponding domain directory under `src/domain/` (e.g. `domain/todo/`), write `list_todos.py` business logic
2. Expose the `list_todos(params)` RPC entry in `src/services/todo/todo_service.py`
3. Frontend calls:
   ```json
   POST /
   { "module_name": "services.todo.todo_service",
     "method_name": "list_todos",
     "parameters": { "filter": {"done": false}, "pageNum": 1, "pageSize": 20 } }
   ```
4. No router change needed — the generic execution engine dispatches automatically

### Workflow B: Add a standalone REST route

E.g. `/myroute`. Create an `APIRouter` in `src/server/routes/myroute.py`, and in `src/app.py`'s `create_app()` add `app.include_router(myroute.router, tags=["MyRoute"])`. Refer to the flat POST style of `routes/rag.py`.

### Workflow C: Trigger a RAG rebuild

The knowledge base has changes, but you can't wait for the watcher to auto-run:
```bash
curl -X POST http://localhost:10086/rag-build
# watch /rag-status until built=true
```
Or click the Rebuild button on YiVad's `/rag` page.

## 4. Newbie pitfalls quick-reference

| Symptom | Cause | Fix |
|---|---|---|
| `query_documents` returns empty / everything | Parameter name used `query` instead of `filter` | Backend `_build_filter` only reads `filter`; fix the frontend call |
| `/read-file` / `/write-file` returns 422 | Field name used `path` instead of `target_file` | Pydantic schema enforced; change to `target_file` |
| `AttributeError: 'MongoDB' has no attribute 'find_many'` | Old code called an undefined wrapper | Fixed; confirm `data/database.py` has `find_many` / `delete_one` |
| RAG query timeout / empty results | Ollama not running / model not pulled / index not built | Check `/rag-status`; start Ollama + pull `nomic-embed-text` |
| Editing files under `data/rag_store` doesn't take effect | Watcher debounce 30s + old index doc_id unstable | Wait 30s after edits; or call `/rag-build` for a full rebuild (migrate to stable id_) |

## 5. What to read next

| Doc | What to look at |
|---|---|
| `YiAi/CLAUDE.md` (repo root) | Module boundaries, cross-project RPC protocol, hard rules |
| `YiKnowledge/engineer/projects/yiai/engineering/readme.md` | Architecture diagram, data flow, API design |
| `YiAi/config.yaml` | Single source for all config items |
| `YiAi/src/app.py` | FastAPI factory + lifespan (startup hooks) |
| `YiAi/src/server/routes/` | All routes live here |
| `YiAi/src/domain/rag/` | RAG domain (indexer / engine / settings / paths) |

## 6. Day-1 task list

- [ ] Run `python main.py` successfully; `/health/observer` returns 200
- [ ] Start MongoDB + Ollama; run `/rag-build` + `/rag-query`
- [ ] Read the module-boundaries section of `YiAi/CLAUDE.md`
- [ ] Use `curl` to call `services.database.data_service.query_documents` once (note: `filter` not `query`)
- [ ] Add a `/ping` endpoint under `src/server/routes/` returning `{"pong": true}`; submit a PR
- [ ] Do a 30-minute walk-through with a colleague; clarify what you didn't understand

## 7. Owners / contacts

| Role | Name | Contact |
|---|---|---|
| Project lead | TBD | TBD |
| Backend architecture | TBD | TBD |
| RAG / llama_index | TBD | TBD |
| MongoDB / ops | TBD | TBD |
| Code review | TBD | TBD |

> Placeholder fields; project lead please fill in then delete this line.

## 8. Common error quick-reference

| Error | Cause | Fix |
|---|---|---|
| `ModuleNotFoundError: No module named 'llama_index'` | venv not activated / deps not installed | `source .venv/bin/activate && pip install -r requirements.txt` |
| `ErrorCode.AI_UNAVAILABLE` | Ollama unreachable | `curl http://localhost:11434/api/tags` should return model list |
| `pymongo.errors.ServerSelectionTimeoutError` | MongoDB unreachable | Test connection with `mongosh`; check `config.yaml: mongodb.url` |
| `AttributeError: 'MongoDB' object has no attribute 'XXX'` | Used an undefined wrapper | Check `data/database.py`; only call defined ones; add if missing |
| `422 Unprocessable Entity` on `/read-file` | Field name `path` | Change to `target_file` |
| `/rag-query` returns empty sources | Index not built / scope too strict | Check `/rag-status` for built; loosen scope |
| `yaml.YAMLError` in watcher | Some md frontmatter is invalid | Find the file from logs; fix frontmatter |
| `RuntimeError: asyncio.run() cannot be called from a running event loop` | Called sync inside an async function | Wrap with `asyncio.to_thread` |

---

If in doubt, check §4 and §8 first; if no answer, ask the corresponding owner in §7.

## Core viewpoints

- **The fastest way to build trust in a new codebase is to ship a trivial change on day one.** The day-1 task checklist is designed to compress the time from "clone" to "PR merged" to under 4 hours. Adding a `/ping` endpoint that returns `{"pong": true}` is trivial, but it exercises the full development pipeline: create a route, register it in the app factory, restart the server, and verify with curl. The psychological barrier of a new codebase is broken by the act of shipping.

- **The RPC execution engine is the most important architectural concept to understand on day one.** Unlike a typical REST API where each endpoint has its own route, YiAi uses a generic execution engine that dispatches `module_name.method_name(parameters)` calls. Understanding this single concept explains why adding a new service method requires no router changes, why the frontend always calls the same POST endpoint, and why parameter naming conventions (`filter` not `query`) are enforced at the framework level.

- **The pitfalls cheatsheet is the highest-ROI section of onboarding documentation.** Every item in the cheatsheet represents a real incident where a previous new hire lost hours to a non-obvious convention. The iron rules (`filter` not `query`, `target_file` not `path`) are not arbitrary — they are the precise parameter names that the Pydantic schema and the backend query builder expect. Maintaining this cheatsheet is a continuous investment in reducing time-to-productivity.

- **Onboarding documentation rots faster than any other documentation because it describes the current state of the codebase.** When the watcher switches from watchfiles to apscheduler polling, the §4 cheatsheet must be updated. When the RAG index doc_id strategy changes, the verification checklist must be updated. Every infrastructure change must be accompanied by an onboarding doc update in the same PR.

- **The "What to read next" section provides the graduated path from operational competence to architectural understanding.** A new hire who completes the day-1 tasks can start a server and call an RPC method, but they don't understand why the domain layer is separated from the service layer, or how the RAG engine handles hybrid retrieval. The reading list provides the specific documents that answer the questions that naturally arise after the first week of development.

## Action recommendations

1. **Add a "Verify the RPC execution engine" exercise to the day-1 task list:** The current task list asks new hires to call `query_documents` via curl, but it does not ask them to create a new RPC method. Add a task: "Create a `/ping` endpoint that returns `{"pong": true}`, then create a `services/ping/ping_service.py` with a `ping()` method, and call it through the RPC execution engine via `curl -X POST / -d '{"module_name":"services.ping.ping_service","method_name":"ping","parameters":{}}'`." This exercises the most important architectural concept in YiAi -- the generic execution engine -- and ensures the new hire understands how every cross-project call works.

2. **Install Ruff and pytest before the next new hire joins:** The current project profile states "Test framework: None" and "Lint / format: None." This means the new hire's first code contribution will have no automated feedback on code quality or correctness. Install Ruff with a minimal configuration (the default ruleset is sufficient for a new project) and add `pytest` with `httpx` for integration testing. Run them in CI before the new hire's first PR. This is a 2-hour investment that prevents the new hire from learning bad habits that will need to be corrected later.

3. **Document the `config.yaml` override mechanism with a concrete example:** The current onboarding doc mentions that `config.yaml` is the single source of truth and that environment variables can override it, but it does not show how. Add a concrete example: "To change the Ollama host for local development, set `OLLAMA__HOST=http://my-ollama:11434` in your `.env` file. The double underscore maps to nested YAML keys." Without this example, new hires will edit `config.yaml` directly and risk committing local changes to version control.

4. **Add a "trace a request" exercise to the second-week reading path:** After the new hire has completed the day-1 tasks, guide them through tracing a single RPC call from the YiVad frontend through the FastAPI root handler, the execution engine, the service layer, the domain layer, and the MongoDB singleton. The exercise should end with the new hire explaining: "The frontend sends `{module_name, method_name, parameters}` to `POST /`. The execution engine resolves the module, calls the method with the parameters, and the method returns data that is wrapped in the unified response envelope." This trace is the single most important mental model for understanding how YiAi works.

5. **Schedule a quarterly knowledge base watcher reliability check:** The macOS FSEvents issue that forced the switch to apscheduler polling is a platform-specific gotcha. Add a quarterly task to: (1) verify that the watcher is still polling at the configured interval, (2) test that a file modification in YiKnowledge triggers a MongoDB update within the expected time window, (3) check the watcher log for any polling failures or stalls, and (4) re-evaluate whether the underlying macOS issue has been fixed in a newer OS version. This proactive check prevents the watcher from silently breaking and causing knowledge base drift.

## Anti-patterns

- **Treating onboarding documentation as a one-time write-and-forget artifact.** The §4 pitfalls cheatsheet reflects the current state of the codebase. When the watcher implementation changes from watchfiles to apscheduler, the cheatsheet must be updated in the same PR. An outdated cheatsheet is worse than no cheatsheet.

- **Writing onboarding docs that assume the reader understands the project's architectural philosophy.** "The RAG query returns empty results" is only meaningful to someone who already knows that the RAG engine uses dense + sparse hybrid retrieval. The cheatsheet pairs each symptom with its cause and fix because the new hire may not know which layer is responsible.

- **Omitting the "why" behind iron rules.** "Use `filter` not `query`" is a rule. "Because the backend `_build_filter` only reads the `filter` parameter" is the understanding that prevents the same mistake in a different context. Rules without reasons are cargo cults.

- **Expecting new hires to find the relevant documentation on their own.** The "What to read next" section exists because new hires don't know what they don't know. Without explicit guidance, they will read the README (accessible) rather than the CLAUDE.md module boundaries (critical).

- **Using the onboarding doc as a substitute for a 30-minute walkthrough with a colleague.** The onboarding doc can teach conventions, but it cannot answer "why is the domain layer separated from the service layer?" or "what was the context behind choosing Motor over PyMongo?" The walkthrough is where tacit knowledge transfers; the doc is the reference material.

---

## Related

- [../../../engineer/projects/yiai/README.md](../../../engineer/projects/yiai/README.md) — YiAi project README
- [../../../engineer/projects/yiai/engineering/readme.md](../../../engineer/projects/yiai/engineering/readme.md) — YiAi architecture and data flow
- [../../../engineer/projects/yiai/engineering/claude.md](../../../engineer/projects/yiai/engineering/claude.md) — YiAi CLAUDE.md module boundaries and iron rules
- [../../../engineer/projects/INDEX.md](../../../engineer/projects/INDEX.md) — Project index with all Yi-family projects
- [../../../engineer/lessons/win-yiai-rag-hybrid-retrieval.md](../../../engineer/lessons/win-yiai-rag-hybrid-retrieval.md) — YiAi RAG hybrid retrieval context for new hires
