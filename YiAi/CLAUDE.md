# CLAUDE.md — YiAi

> FastAPI backend server for the Yi family. Provides AI chat (Ollama), file management with dual-write persistence, RSS aggregation, WeCom messaging, generic module execution, and a state-store. Runs on uvicorn (ASGI), MongoDB via Motor (async).

---

## Table of Contents

- [Foundational Beliefs](#foundational-beliefs)
- [Iron Laws](#iron-laws)
- [Architecture Direction](#architecture-direction)
- [Project Profile](#project-profile)
- [Project Structure](#project-structure)
- [Module Boundaries](#module-boundaries)
- [Data Flow](#data-flow)
- [Project Constraints](#project-constraints)
- [Degradation Countermeasures](#degradation-countermeasures)
- [Self-Constraints](#self-constraints)
- [Recent Changes](#recent-changes)
- [Guidance](#guidance)

---

## Foundational Beliefs

- **Trust the model** — When the model produces a reasonable response, do not second-guess it with redundant validation unless the outcome is destructive.
- **Value attention** — Be aware of context-window economics. Prefer concise code and avoid verbose scaffolding. Every token spent on boilerplate is a token not spent on the problem.
- **Verify reality** — The code on disk is the only truth. Do not assume a module exists or behaves a certain way without reading it.
- **Think before coding** — Don't assume, surface tradeoffs. State assumptions explicitly; if multiple interpretations exist, present them; if a simpler approach exists, say so.

## Iron Laws

1. **Simplicity first** — Minimum code, nothing speculative. No features beyond what was asked; no abstractions for single-use code; no error handling for impossible scenes.
2. **Surgical changes** — Touch only what you must. Don't "improve" adjacent code; match existing style; every changed line traces to the user's request.
3. **Goal-driven execution** — Define success criteria, loop until verified. Transform tasks into verifiable goals; for multi-step tasks, state a brief plan with verify checks per step.
4. **No silent writes** — Read the file before editing it. Use existing conventions (snake_case, FastAPI patterns, dual-write model). Do not introduce new patterns without explicit reason.

## Architecture Direction

> **Modularization.**
>
> YiAi is a FastAPI backend server. The direction is toward tighter module boundaries: each domain sub-package (`domain/ai/`, `domain/files/`, `domain/rss/`, `domain/wework/`, `domain/execution/`, `domain/auth/`, `domain/state/`) owns its logic; the `services/` layer wraps them for routes. New features should land in named domain modules with a clear public API surface (an `__init__.py` exporting the callable contract), rather than scattering handlers across existing files.
>
> Reference: [../../rules/architecture-direction.md](../../rules/architecture-direction.md)

## Project Profile

| Dimension | Value |
|-----------|-------|
| Name | YiAi |
| Type | Backend |
| Version | 1.0.0 |
| Architecture | Single `src/` tree, no nested packages |
| Ecosystem | Python 3.10+ / FastAPI |
| Runtime | uvicorn (ASGI), port 10086 |
| Database | MongoDB via Motor (async) |
| Self-hosted | Ollama (LLM inference), OSS (object storage), llama_index (RAG) |
| Auth | bcrypt + PyJWT (optional X-Token header) |
| Config | `config.yaml` + pydantic-settings |
| Knowledge base | `../YiKnowledge` markdown tree, apscheduler watcher (poll fallback for macOS FSEvents) |
| Test framework | None (add `pytest` + `httpx` when coverage becomes a priority) |
| Lint / format | None (add `ruff` when code style drift becomes a problem) |

## Project Structure

```
src/
├── app.py              # FastAPI app factory + lifecycle
├── shared/             # Cross-cutting (config, response, error_codes, logging, utils)
├── data/               # MongoDB access (database singleton, repository, sessions, store)
├── models/             # Pydantic schemas + collection name constants
├── domain/             # Business logic — ai/ auth/ execution/ files/ knowledge/ rag/ rss/ state/ wework/
├── services/           # Service layer — ai/ database/ execution/ knowledge/ rag/ rss/ storage/
└── server/             # HTTP layer — middleware, errors, routes/
```

## Module Boundaries

Every caller outside a domain package depends only on that package's public API surface. Internal files stay private.

| Module | Public API | Internal (do not import directly) |
|---|---|---|
| `domain/ai/` | `chat.py` | — |
| `domain/auth/` | JWT + bcrypt helpers | — |
| `domain/execution/` | `executor.py` | — |
| `domain/files/` | `__init__.py` re-exports `read_file`, `write_file`, `delete_file`, `rename_file`, `delete_folder`, `rename_folder`, `upload_image` | `local.py`, `storage.py`, `paths.py` |
| `domain/knowledge/` | `scanner.py` (tree walk + frontmatter parse), `watcher.py` (apscheduler poll loop), `writer.py` (markdown write-back) | — |
| `domain/rag/` | `engine.py` (`rag_query`, `rag_chat_stream`, `rag_file_query`, `rag_file_chat_stream`), `indexer.py` (`get_kb_index`, `build_file_index`), `settings.py`, `paths.py` | — |
| `domain/rss/` | `feed.py`, `scheduler.py` | — |
| `domain/state/` | state-record CRUD helpers | — |
| `domain/wework/` | `__init__.py` re-exports `send_message` | `client.py` |
| `services/ai/` | `chat_service.py` | — |
| `services/database/` | `data_service.py` (`query_documents`, `create_document`, `update_document`, `delete_document`), `session_service.py` | — |
| `services/execution/` | `executor.py` | — |
| `services/knowledge/` | `knowledge_service.py` (scan / read / write / metadata CRUD) | — |
| `services/rag/` | `rag_service.py` (wraps `domain/rag/engine.py` for routes) | — |
| `services/rss/` | `feed_service.py`, `rss_scheduler.py` | — |
| `services/storage/` | `oss_client.py` | — |
| `data/` | `database.py` (MongoDB singleton: `find_one`, `find_many`, `insert_one`, `insert_many`, `update_one`, `delete_one`), `repository.py` (`query_documents`, `get_document_detail`, `create_document`, `update_document`, `delete_document`), `sessions.py`, `store.py` | — |

### Cross-project protocol

The "RPC envelope" used by both YiPet and YiVad:

```
POST /  body: {
  "module_name": "services.<domain>.<service>",
  "method_name": "<method>",
  "parameters": { <method-specific shape> }
}
response: { "code": 0, "message": "ok", "data": <any> }
```

| Method | Contract |
|---|---|
| `data_service.query_documents` | `parameters: { cname | collection_name, filter?: dict, pageNum?, pageSize?, limit?, fields?, excludeFields?, orderBy?, orderType? }`. The `filter` dict is merged into the Mongo query via `_build_filter`. **Do NOT use `query` — it is silently ignored.** |
| `data_service.create_document` | `parameters: { cname, data }` |
| `data_service.update_document` | `parameters: { cname, key, data }` |
| `data_service.delete_document` | `parameters: { cname, key }` |
| `/read-file`, `/write-file` | `target_file` (not `path`), `content`, optional `is_base64` |
| `/upload-image-to-oss` | `data_url`, `filename`, `directory` |

## Data Flow

### Generic RPC

```
YiPet / YiVad
   │ fetch() POST /  body: {module_name, method_name, parameters}
   ▼
FastAPI root route handler
   │ resolves module → Python module, method → callable, parameters → kwargs
   ▼
services.<domain>.<service>.<method>(**parameters)
   │ (if data_service.query_documents)
   │   pops `filter`, merges into query_params
   │   pops pageNum/pageSize/limit/page/fields/exclude/orderBy
   │   _build_filter(query_params) → Mongo filter dict
   │   collection.find(filter_dict, projection).sort().skip().limit()
   ▼
MongoDB (Motor async)
   ▼
{ list: [...], total, pageNum, pageSize, totalPages }
```

### Chat SSE

```
client  fetch POST /  body: {services.ai.chat_service.chat, stream:true}
   ▼
chat_service.chat()  →  StreamingResponse(text/event-stream)
   yields: data: {"data": {"message": "..."}}\n\n
   ends:   data: {"done": true}\n\n
   ▼
Ollama (http://localhost:11434/api/chat)
```

### Dual-write file persistence

```
POST /write-file {target_file, content}
   │ 1. write local disk (primary — returns failure if this fails)
   │ 2. best-effort upsert to MongoDB static_files (backup)
   ▼
success
```

## Project Constraints

### Non-Negotiable Baselines

| Entry point | `main.py` (dev) or `uvicorn src.app:app` (prod) |
|---|---|
| Configuration | `config.yaml` + pydantic-settings (flat YAML keys mapped via `YamlConfigSettingsSource`) |
| Language | Python 3.10+ (prefer async throughout — no sync/async mix) |
| File naming | snake_case |
| Auth model | Optional X-Token header verification (disabled by default) |
| File persistence | Dual-write: disk (primary) + MongoDB (backup, best-effort upsert) |
| Static files | Served at `/static`, base dir configurable via `static.base_dir` |
| API response | Unified envelope: `{ "code": int, "message": str, "data": any }` |
| Error handling | Typed `ErrorCode` enum in `src/shared/error_codes.py`; `BusinessException` raised from domain layer |
| SSE streaming | Chat and execution endpoints return `text/event-stream` with incremental `data:` frames |
| Retry policy | `tenacity` for transient failures (network, MongoDB, Ollama) |
| Degradation | MongoDB unavailable → writes fail; auth disabled → no gate; observer disabled → no runtime guard |

### Self-constraints

- **No test framework configured** — add `pytest` + `httpx` for integration testing when coverage becomes a priority.
- **No linting or formatting enforcement** — add `ruff` when code style drift becomes a problem.

## Degradation Countermeasures

| Condition | Behavior |
|-----------|----------|
| MongoDB unreachable | Writes fail fast; reads return empty results (no cache layer) |
| Ollama unreachable | Chat endpoints return `ErrorCode.AI_UNAVAILABLE`; image processing endpoints return 503 |
| OSS bucket unreachable | File storage falls back to local disk only (Dual Write degrades to single write) |
| Auth disabled (default) | No gate; all endpoints public |
| Observer disabled | No throttle / sampler / sandbox / reentrancy protection |

## Self-Constraints

- **Domain layer owns logic.** Routes never call `data/` directly — they go through `services/`. Domain packages never import `server/`.
- **Public API surface is `__init__.py`** for domain packages that have one (`domain/files/`, `domain/wework/`). Callers use the re-exports, not internal files.
- **`MongoDB` singleton wrappers only grow when callers need them.** Don't add `update_one` speculatively — only when a caller actually needs it (see 2026-07-28 fix where `find_many`/`delete_one` were added in response to `domain/files/storage.py` callers).
- **`_build_filter` parameter names are load-bearing.** `filter` (not `query`), `target_file` (not `path`), `cname`/`collection_name`. Past bugs have come from callers using the wrong name.

## Recent Changes

### 2026-08-08 — aiChat agent generic data tools + confirmation gate

- **`domain/ai/data_tools.py`** (new): Generic replacement for the removed per-menu tools — `db_list` (read-only, any collection), `db_schema` (returns the registered collection schema as LLM context), `db_create`/`db_update`/`db_delete` (writes gated by `_WRITABLE_COLLECTIONS`, currently `{"menus"}`, + confirmation). The domain knowledge (menus document shape, `meta` fields) lives in `_COLLECTION_SCHEMAS` returned by `db_schema`; the agent reasons over collections instead of hard-coded per-domain tools. Wired lazily in `domain/ai/tools.py:get_tool_registry`.
- **`domain/ai/tools.py:execute`**: Fixed `ToolResult.error` being silently dropped — result dicts carrying `{"error": ...}` now propagate the error into `ToolResult.error` (previously `menu_update` with a nonexistent key returned `error: None`).
- **`domain/ai/agent.py`**: Confirmation gate — the loop emits `confirmation_required`, pauses via `_wait_for_confirmation` (polls the in-memory decision store, 120s timeout), then executes only on `"approved"`. Added `confirmation_id` to `AgentEvent`. Tool execution now passes `on_event` to `registry.execute` so the loop emits `tool_execution_start` / `tool_execution_end` (Pi's live tool lifecycle); the `end` event carries the final `content` + `error`. **Confirmation ids made unique per turn** — Ollama resets native tool-call ids (`tool_0`, `tool_1`) on every generation, so `call.id` alone collided across turns and a stale decision from an earlier turn could auto-approve a *later, different* tool call. `_wait_for_confirmation` now takes an explicit `confirmation_id`; the preflight prefixes it with the turn index (`t{turn_index}:{call.id}`) while keeping the raw `call.id` for the `tool_result` message protocol. Verified deterministically: same raw `tool_0` in two turns no longer inherits the first turn's approval.
- **`server/routes/agent.py`**: `POST /agent/confirm {session_id, confirmation_id, approve}` writes the approve/reject decision to `_confirmation_store`; consumed once by `mark_confirmation_seen`. **Client disconnect abort (Pi: cancellation on disconnect)** — `_watch_disconnect` runs alongside the SSE stream and sets an `abort` event the agent loop checks between turns and tool calls, so closing the chat mid-turn stops the loop (instead of waiting out the 120s confirmation timeout or finishing long tool calls). It polls the raw ASGI receive channel (`await asyncio.wait_for(http_request._receive(), timeout=1.0)`) rather than `Request.is_disconnected()`: the route's body parameter is the Pydantic `AgentChatRequest` (not a Starlette `Request`), so `request.is_disconnected()`/`request._receive` would raise `AttributeError`; the real request is injected as `http_request: Request`. Starlette's `is_disconnected()` is also a non-blocking check that only fires on an already-queued `http.disconnect` (unreliable in uvicorn 0.40 mid-stream), whereas awaiting `_receive` returns `http.disconnect` as soon as uvicorn notices the transport close. Verified live: disconnect during a confirmation wait aborts the run and the stream ends the same second (no 120s hang); the pending `db_create` is rejected and never written.
- **Native Ollama tool calling**: `services/ai/model_runtime.py:OllamaRuntime.stream_chat` now accepts `tools` and forwards structured `tool_calls`; `agent.py:_stream_llm_response` converts SDK tool calls to the app `ToolCall` and passes the registry's function definitions. The `<tool_call>` XML text parser remains as a fallback. (Before this, small models like qwen3.5 rarely emitted valid `<tool_call>` XML, so the agent could not reliably complete tasks.)
- **Tool-argument validation (Pi: `validateToolArguments`)**: `domain/ai/tools.py:_validate_arguments` checks a tool call's `arguments` against the registered JSON schema inside `ToolRegistry.execute` — before emitting the start event or invoking `execute`. Missing required fields and type mismatches (string/object/array/boolean/integer/number) return a short model-readable error string; the tool is never called and the error is returned to the model so it can self-correct on the next turn. Previously malformed args flowed straight into the tool (e.g. `db_create` without `data`), producing opaque failures.
- **Length-stop tool-call failure (Pi: `failToolCallsFromTruncatedMessage`)**: when a response hits the model's output token limit, any tool calls in it may carry truncated arguments. `model_runtime.py` now forwards Ollama's final `done_reason` (`"length"`); `agent.py` captures it and, on `stop_reason == "length"`, fails every tool call in that turn with an error result (emits `tool_execution_start`/`tool_execution_end` + error `TURN_END`) instead of executing possibly-garbled args. Truncation now surfaces to the model as a readable error, prompting a corrected retry.
- **LLM retry with backoff (Pi: transient-failure retry)**: `_stream_llm_response` now wraps the `runtime.stream_chat` call in a retry loop (`AgentConfig.llm_max_retries`, default 2; exponential backoff via `llm_retry_backoff_base`). Transient Ollama failures — connection reset, model still loading into VRAM on first call, 5xx — retry automatically instead of killing the whole agent run, so a chat-driven task survives a mid-task Ollama hiccup. A retry is only attempted when nothing was streamed yet in that attempt: retrying after content was yielded would duplicate text the user already saw. Warnings are logged per retry.
- **Surface LLM stream errors (fix)**: the loop's LLM-stream branch previously ignored `{"error": ...}` chunks entirely, so a failed model call was silently dropped and the turn continued as if the model had said nothing. Now it emits an `error` event, ends the run with `agent_end stop_reason="error"`, and yields `{"error": ...}` + `{"done": true}` — the failure reaches the frontend instead of vanishing.
- **Schema rules + orphan guard (`domain/ai/data_tools.py`)**: the `menus` schema entry now carries a `rules` block — the menu catalog pitfalls (dead-link components, no cascade delete, never delete `home`, aiChat/RAG are static routes, sidebar sorts by `meta.title`, `name` is the cache/permission key) distilled into model-readable constraints that `db_schema` returns as context, so the agent respects them before writing instead of the code hard-coding menu logic. The schema also declares `parent_ref_field: "parent"`, which `db_delete` uses **generically** (no per-collection code): before deleting, it loads the target by `key`, queries for documents whose `parent` equals the target's `path`/`key` (via Mongo `$eq`, bypassing the repository's substring fuzzy search so `/system/settings` is not a child of `/system`), and refuses when children exist — reporting the child count + an example key and suggesting the model delete children first or re-run with `force: true`. `force` is a new `db_delete` parameter documented in its tool definition. Verified live against Mongo: parent-with-child refused, child-first delete sequence succeeds, exact-match guard does not over-refuse.
- **Confirmation gate verified end-to-end (this session)**: the earlier "Confirmation timed out — tool skipped" 120s failures in e2e runs were traced to the **test harness's `resp.read(4096)`** buffering SSE frames — it withheld the `confirmation_required` frame until the poll had already timed out, so the `/agent/confirm` POST was only sent afterward. The backend gate itself was correct. A line-based reader (processing each SSE frame as it arrives, matching the frontend's `reader.read()` loop) resolves an approval in ~1.5s (`WAIT-CHECK checks=1` → `ARRIVE`/`SET` same second → `WAIT-FOUND checks=2`), and `db_create` executes. Temporary `/tmp/confirm_debug.log` instrumentation used to prove this was removed.
- **Narrate-and-stop guard (`domain/ai/agent.py`)**: qwen3.5 (a reasoning model) sometimes streams its *plan* as content and stops without emitting the `tool_call` — a task like "create this menu" ends with the model having described `db_create` but never invoked it. The no-tool-calls branch now checks whether the assistant's text names any registered-but-unexecuted tool; if so it injects a `[CONTINUE]` user message ("you described calling X but did not actually invoke them — call them now") and continues the loop instead of breaking. Bounded by `max_turns` and a per-run cap (`_MAX_NUDGES = 2`) so a stubborn model cannot loop forever. Pure Q&A rarely names tools and past-tool narrations name only executed tools, so the guard stays quiet there. Verified live: e2e runs that previously ended at `narrate → stop` now complete `db_create` (approval resolved, document created).
- **Tool-call XML parse-error fallback (`domain/ai/agent.py:_stream_llm_response`)**: qwen3.5 intermittently emits malformed tool-call XML (`Ollama request failed: XML syntax error on line 5: element <function> closed by </parameter>`), which Ollama surfaces as a generic error frame. Retrying with the same `tools` def was futile — the broken frame tended to reappear across all `llm_max_retries` attempts, ending the run with `agent_end stop_reason="error"`. On an error containing `"XML syntax error"`, the retry now drops `tools` (`tool_defs = None`) so the model answers in plain text; the agent loop's existing `_parse_tool_calls_from_text` fallback then extracts any `<tool_call>` XML from the text stream. **XML errors retry even after content was streamed** (unlike non-XML transient errors, which only retry before content to avoid duplicating text): a reasoning model like qwen3.5 typically streams its *plan* and *then* botches the tool frame, so gating on `not yielded_content` alone left the run stranded at `stop=error` (observed: an escalation-enabled e2e run dying at 14s with the XML error + zero retry warnings in the log). Verified: (1) unit test monkeypatching `OllamaRuntime.stream_chat` — attempt 1 with tools → XML error, attempt 2 without → recovered (`RESULT: PASS`); (2) a 12-run live e2e loop completed `stop=completed` 11/12 with zero `stop=error`; (3) after the after-content fix, a 4-run escalation sample completed **4/4** with zero `[error]` frames.
- **Failure-based model escalation (`domain/ai/agent.py`)**: when the nudge guard is exhausted (2 nudges) and the model *still* narrates a tool call without executing it, the loop now escalates to a stronger model instead of ending the task incomplete. Config `agent_model_fallback` (default `["qwen3-coder"]`) supplies an ordered list; on a stall the loop pops the next model, emits a `model_switch` event (`message: {from, to}`), injects a `[MODEL SWITCH]` takeover message with the full conversation context, and continues. Bounded to one escalation per run (`_model_escalated`). `model_fallback` is threaded through `AgentChatRequest` → `/agent/chat` (`None` ⇒ server default, `[]` ⇒ disabled). Pi-inspired resilience: swap the stalling "thinker" for a capable "doer" rather than failing the run. Verified live: qwen3.5 stalled on the menu task (turns 1/3/5 narrate-and-stop), `model_switch` fired, qwen3-coder took over and completed `db_create` (`created=True`, `stop=completed`) — the same stall previously ended `created=False`. Frontend `KnowledgeChatPanel` surfaces the handoff (`> ⚙️ 模型自动切换：qwen3.5 → qwen3-coder`).
- **No-tool task-completion nudge (`domain/ai/agent.py`)**: the two guards above only fire when the model *names* a tool. If it rambles vaguely (names none) on a task-like request and never executes a tool, the run would silently end `stop_reason="completed"` with the task undone. Just before the normal loop `break`, if **zero tools were executed** this run (`not _executed_tool_names`) AND the last user message is a *concrete task* (`_is_task_request` — a zh/en task-verb substring heuristic: 创建/删除/更新/列出/查询/count/create/delete/…), the loop injects one `[TASK]` user message ("if the task requires a tool, call it now; if none is genuinely needed, say so and finish"), then continues. Bounded to one per run (`_task_nudged`), logged as "Agent task-completion nudge fired". Pure Q&A rarely contains task verbs (介绍/解释/what is/why are not markers), so it stays quiet there. Regression-checked live (2026-08-08): 3/3 create + 1/1 query unchanged — the guard cannot perturb successful runs because any run that executed a tool has a non-empty `_executed_tool_names`.

### 2026-08-08 (later) — Count-aware partial-completion detection

- **`domain/ai/agent.py`**: the named-tool checkpoint catches "tool named but never executed" but not "tool executed *fewer times than the task requires*" — a task like "创建 2 个菜单" where the model creates 1 and confidently stops was silently half-done (db_create DID run, so neither the named-tool checkpoint nor the no-write nudge could fire). New `_parse_task_item_counts(text)` associates each explicit item count with the nearest preceding write verb in the same clause (boundary + negation-aware): "创建 2 个菜单" → `(db_create, 2)`, "删除 2 个，创建 1 个" → `(db_delete, 2)`. The `_COUNT_RE` only treats a number as an item count when followed by an item noun (`菜单/记录/menu/…`) OR a bare measure word at a clause boundary — "2 个字段" / "2 小时后" / "2 个层级" are correctly ignored. The pre-break checkpoint now also tracks per-tool successful write counts (`_write_counts`) and, when `need ≥ 2` and `have < need`, injects one `[TASK]` nudge naming the exact gap and instructing the agent to verify with `db_list` first and NOT duplicate. Unit-tested: parser 17/17 + gap-decision 9/9 (`/tmp/test_counts.py`, `/tmp/test_count_gap.py`). Live no-regression: a "create 2 menus" task completes with exactly 2 `db_create` and zero count-aware fires; the single-item cycle still SUCCESS. Firing requires a genuine partial failure (rare — the model reliably completes), so like the no-write nudge this is a defensive safety net.

### 2026-08-08 (later) — Resume-by-session: faithful 继续 continuation (pi persistent loop)

- **Problem**: after `max_turns_reached`, the frontend's resume re-sent the history **text-only** (narration only — tool results live only in frontend metadata). The resume model had to guess state and re-ran completed writes — measured 3/3 resumed runs re-created a menu `db_create` had already made.
- **Session-history persistence (`domain/ai/agent.py`)**: `save_session_history`/`load_session_history` persist each run's full `agent_messages` (incl. `tool_result` messages, which render to the model as `[Tool result: <name>] …`) per `session_id`, in-memory with a 1h TTL. `agent_chat_stream` gains `resume: bool` (new `AgentChatRequest.resume`, threaded through the route); when set, the restored trajectory is prepended and only the user's continuation travels in the request. Message ingestion now preserves `name`/`tool_call_id` so restored `tool_result`s keep their tool name.
- **Explicit handoff**: the resume merge injects a `[RESUME]` system note naming the already-executed tools ("db_create/db_update/db_delete 请勿重复执行") — the faithful trajectory is enough for a capable model (qwen3-coder), the note defends a weaker one.
- **Mission-aware completion checks**: the end-of-loop no-write / named-tool / count-aware checkpoints previously gated on `_last_user_text`, which on a resume is just "继续" (not a write request) — so a resume could falsely "complete" with a step still pending. `_is_continuation` detects the bare continue directive; when the last user message is a continuation and the run's `task_text` (the ORIGINAL task, passed from `agent_chat_stream`) is a write request, the checks run against `task_text` instead. Per-run tool tracking is seeded from the restored trajectory's `tool_result`s (`_resume_names`), so the checks compare against the full task without demanding re-runs of already-done writes.
- **Verified live (`/tmp/e2e_resume.py`, qwen3-coder, auto-approve, strict end-state assertion)**: max_turns=2 and max_turns=3 scenarios, 8/8 PASS — resume completes the FULL lifecycle (all of db_create/db_update/db_delete across both runs), no duplicate `db_create`, and zero probe menus before cleanup. The completeness checkpoint recovered 2 resumed runs that stopped with `db_delete` still pending (log: "task named tool(s) db_delete that never executed"). Normal (non-resume) cycle SUCCESS and read-only query `mutated=False` unchanged. Known limitation: the weak default qwen3.5 can still redo a completed write on resume despite the trajectory + `[RESUME]` note (documented model flakiness); the mission-aware checkpoint then recovers the *missing* steps.

### 2026-08-08 (later) — Honest agent_end stop_reason: max_turns_reached vs completed

- **`domain/ai/agent.py`**: the final `AGENT_END` previously hardcoded `stop_reason="completed"` even when the loop exhausted `max_turns` mid-task (steps still pending) — the frontend showed "done" for an unfinished task. A `_natural_stop` flag is now set on the natural-completion `break`; when the `while turn_index < max_turns` loop exits instead, `stop_reason="max_turns_reached"` is emitted with a log line. Verified: a 3-step task with `max_turns=2` now reports `max_turns_reached` (was `completed`); a natural 3-step cycle still reports `completed`. This is the user's queue to reply "继续" — the loop resumes from the accumulated history on the next request.
- **YiVad frontend** surfaces it: `src/stores/modules/aiChat.ts` + `KnowledgeChatPanel.vue` append `> ⚠️ 已达到最大轮次，任务可能未完成。回复「继续」可接着完成。` on `agent_end` with `stop_reason=max_turns_reached`.

### 2026-08-08 (later) — Mission re-injection after compaction (pi transformContext)

- **`_inject_mission_if_needed` + wired `transform_context` hook (`domain/ai/agent.py`)**: compaction folds old messages into a summary and keeps only the last 4 verbatim, so a long multi-step task can lose its exact requirements (menu names, paths, item counts) mid-run — the model then "completes" with wrong details or drops items. `agent_chat_stream` now captures the first user message as the mission and wires the previously-unused `transform_context` hook to re-inject it verbatim before every LLM call, but **only when it is no longer verbatim in context** (compaction pruned it) and not already injected. Short runs (task still the last user message) are untouched — zero behavior change — which is why the cycle (9 turns) and query e2es pass identically. Unit-tested 9/9 (`/tmp/test_mission.py`): no-op-while-present, inject-after-compaction, idempotent, empty-list edge. Logs "Agent mission re-injected after context loss".

### 2026-08-08 (later) — Nudge hardening: negation-aware write detection + completeness checkpoint

- **Negation-aware `_is_write_request` (`domain/ai/agent.py`)**: the task heuristic (`_write_marker_count`) now scans each write-verb occurrence back to the previous **clause boundary** (not a fixed window) for negation tokens (`不要`/`禁止`/`请勿`/`do not`/`not `…). Fixed two real bugs: (1) a read-only query whose text said "只读，不要创建/更新/删除任何菜单" was misread as a write task and got a bogus nudge (cost ~40s of wasted escalation + retry turns per query; now `elapsed 64s→16s`); (2) a fixed 12-char window failed on "不要调用 db_create/db_update/db_delete" because the second/third tool names pushed the negation past the window. Clause-boundary scanning also keeps mixed cases right ("不要创建菜单，但把 X 的标题更新为 Y" → still a write task, count 1). Unit-tested 27/27 incl. negation + marker-count cases.
- **`_write_executed` tracks *successful* writes + new `_write_rejected` flag (`domain/ai/agent.py`)**: a **rejected** confirmation previously still populated `_write_executed` (the rejected tool's `ToolResult` with `error="Rejected by user"` went through the tool_results loop), so the completeness checkpoint fired spuriously on the reject path. `_write_executed` now only records `requires_confirmation` tools whose result has no error, and `_write_rejected` is set whenever a confirmation decision != `"approved"`. Both nudges check `not _write_rejected`, so **neither can ever re-arm a write the user declined**.
- **Completeness checkpoint (`domain/ai/agent.py`)**: a run can execute write(s) yet still be partially done — observed create+update completing, then the model stopping without the delete it planned (cycle ~2/5 before this). Neither the no-write nudge (`_write_executed` non-empty) nor the narrate-guard (the model *forgets* the tool rather than narrating it) fires. When the run is about to end, the loop computes the **write tools named in the task text but never executed** (`td.requires_confirmation and td.name in last_user and td.name not in _executed_tool_names`) and, if any, injects one `[TASK]` nudge naming the exact missing tool(s). Naming the concrete tool beats asking the model to self-assess — a generic "any remaining steps?" is declined when the model confidently believes it is done (the earlier heuristic variant fired on every multi-step completion, never recovered a failure, and cost a turn on natural completions). Gating on named-but-unexecuted tools means a fully-complete multi-step run pays **no** extra turn and a single-create task (names only `db_create`, which ran) is never checkpointed. Measured live 2026-08-08: menu cycle create→update→delete **8/8 SUCCESS** (2 of 8 — `cd`, `cg` — dropped the delete and were recovered by the checkpoint naming `db_delete`; the other 6 completed naturally with no checkpoint turn).
- **Escalation takeover is rejection-aware (`domain/ai/agent.py`)**: when a `[MODEL SWITCH]` takeover fires on a run where `_write_rejected` is set, the message appends "do NOT re-attempt that specific write — respect the rejection." Known edge (accepted): if the model re-attempts a just-rejected write anyway, it pops a *new* confirmation the user can reject again — data is always gated by the confirmation prompt, never forced.

### 2026-07-31 — RAG + Knowledge modules

- **`domain/rag/` + `services/rag/`**: New RAG (retrieval-augmented generation) module built on `llama_index`. `engine.py` exposes `rag_query`, `rag_chat_stream` (SSE), `rag_file_query`, `rag_file_chat_stream`. Hybrid retrieval (vector + BM25 via `QueryFusionRetriever`), optional `LLMRerank`, inline citation numbering via `_NumberSourcesPostprocessor`. Scope filtering by `file_path` substring. Persisted index at `./data/rag_store`. Configured under `rag:` section in `config.yaml` (embed/llm models, top_k, chunk_size, hybrid/retrieval toggles).
- **`domain/knowledge/` + `services/knowledge/`**: Knowledge-base management module. `scanner.py` walks `../YiKnowledge` markdown tree with frontmatter parsing, `watcher.py` polls via apscheduler (macOS FSEvents is broken — see `YiKnowledge/lessons/gotchas/macos-fsevents-silent-drop.md`), `writer.py` performs markdown write-back with metadata upsert to MongoDB `knowledge_files` collection.
- **`config.yaml`**: Added `knowledge` (base_dir, watcher_enabled, watcher_poll_seconds) and `rag` (models, top_k, chunk_size, hybrid/retrieval/rerank/citations toggles) sections.
- **`server/routes/`**: Added `knowledge.py` and `rag.py` route modules; registered in `src/app.py`.

### 2026-07-28 — Bug fixes (data layer)

- **`data/database.py`**: Added missing `find_many` and `delete_one` wrappers to the `MongoDB` singleton. Previously `domain/files/storage.py` (`delete_oss_file`, `delete_file_tags`, `get_all_tags`) called them but they were undefined → `AttributeError` at runtime.
- **`data/repository.py`**: Fixed `_handle_range_or_list_filter` so a 2-element list of strings no longer silently drops the filter. Previously, `tags: ["work", "personal"]` returned ALL docs because neither element parsed as a date/number and the function returned `True` without setting `filter_dict[key]`. Now falls through to `{'$in': value_list}`.

### 2026-07 — Cross-project protocol hygiene

- Documented the `filter` (not `query`) contract — YiPet's `SessionService.list/get` was sending `query:` and getting empty results. Fixed in YiPet.
- Documented the `target_file` (not `path`) contract — YiVad's `fileService.readFile/writeFile` was sending `path` and getting 422s. Fixed in YiVad.

## Guidance

| Resource | Location |
|----------|---------|
| Project README | `README.md` |
| Server config | `config.yaml` |
| Route definitions | `src/server/routes/` |
| Domain logic | `src/domain/` |
| Service layer | `src/services/` |
| Data access | `src/data/` |
| Shared utilities | `src/shared/` |
| Data models | `src/models/` |
| Error codes | `src/shared/error_codes.py` |
| Response wrapper | `src/shared/response.py` |
| App factory | `src/app.py` |
| Architecture-direction rule | `../../rules/architecture-direction.md` |
