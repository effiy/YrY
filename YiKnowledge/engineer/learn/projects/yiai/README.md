---
title: YiAi project card
tags: [YiAi, project-card, backend, FastAPI]
category: engineer/learn/projects/yiai
created: 2026-08-03
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer]
benefit: "Engineers find YiAi architecture, dev standards, and functional modules with project-specific context"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - anti-patterns or when-not-to-use are identified
related:
  - ./architecture.md
  - ./functional-modules.md
  - ./dev-standards.md
  - ../../../producter/projects/yiai/project-management.md
  - ../../../leader/decisions/yiai/route-llm-traffic-across-providers.md
  - ../../../leader/decisions/yiai/llm-multi-provider-rollout.md
  - ../../../leader/decisions/yiai/pytest-introduction.md
  - ../../../leader/decisions/yiai/rag-evaluation-infra.md
  - ../../../leader/decisions/yiai/brd-agent-launch.md
  - ../../../leader/decisions/yiai/knowledge-watcher-deployment.md
  - ../../../run/onboarding/yiai/onboarding.md
  - ./engineering/claude.md
  - ./engineering/readme.md
  - ../INDEX.md
---

# YiAi

> **As a** engineer, **I want to** understand and apply yiai project card, **so that** I can I understand the context and decisions behind each codebase.

> AI + BRD agent. FastAPI backend, Yi family service side.

## Core viewpoints

**YiAi is the single source of truth for all Yi family data, and that centralization is both its strength and its fragility.** Every project (YiPet, YiVad) depends on YiAi for chat, file storage, sessions, and knowledge base access. This eliminates data duplication and keeps business logic in one place, but it means YiAi downtime takes down the entire Yi family. The degradation countermeasures (fail-fast on MongoDB unavailability, 503 on Ollama unavailability) are documented but not sufficient for production reliability.

**The RPC envelope pattern is more valuable than any individual feature.** The `{module_name, method_name, parameters}` envelope allows any client to invoke any backend method without per-endpoint routing. This is why YiPet and YiVad can share the same backend without duplicating API surface. The trade-off is that parameter name contracts must be enforced across three codebases, and a single mismatch (e.g., `query` vs `filter`) silently breaks functionality.

**The absence of test coverage is the project's largest technical debt item.** The architecture is cleanly layered (domain/services/server), but with zero tests, every refactor carries unknown regression risk. The pytest ADR exists but has not been implemented. The first production incident caused by a refactored domain function will make the case for tests more forcefully than any ADR ever could.

**The knowledge watcher's polling fallback is a lesson in platform-specific failure modes.** macOS FSEvents silently drops events on this machine, so the watcher uses apscheduler polling every 5 seconds. This is a reminder that platform-level APIs are not universally reliable, and every file-watching feature needs a polling fallback. The polling interval is a trade-off between responsiveness and CPU usage.

**MongoDB as the sole persistent store with no cache layer is a single point of failure.** When MongoDB is unreachable, every feature (chat, files, sessions, knowledge base) fails. There is no read cache, no write buffer, and no graceful degradation beyond returning errors. A read-through cache for frequently accessed knowledge files would be the highest-ROI reliability improvement.

## project card

| field | value |
|---|---|
| positioning | business AI assistant + BRD automation agent |
| main tech stack | see [architecture-summary.md](./architecture.md) / `engineering/claude.md` |
| current primary owner | see [project-management-summary.md](../../../producter/projects/yiai/project-management.md) section current primary owner |
| business domain | overseas service domain, after-sales business, BRD approval flow |

## subdirectory

- [architecture-summary.md](./architecture.md) — architecture overview (tech stack / module boundary / data flow / degradation / anti-pattern)
- [functional-modules-summary.md](./functional-modules.md) — functional modules list (10 domains / 7 services / 13 routings / data / shared / models)
- [dev-standards-summary.md](./dev-standards.md) — development standards (naming / layered / RPC field contract / SSE / config / commit / lint gap)
- [project-management-summary.md](../../../producter/projects/yiai/project-management.md) — project management (iteration cadence / deliverables / onboarding / handoff / weekly report daily report retrospective / cross-project links)
- [adr-multi-provider-llm-routing.md](../../../leader/decisions/yiai/route-llm-traffic-across-providers.md) — ADR: multi-provider LLM routing chooses `llama_index.llms.*`, does not introduce `pi-ai`
- [adr-llm-multi-provider-rollout.md](../../../leader/decisions/yiai/llm-multi-provider-rollout.md) — ADR (implementation): multi-provider 5-stage gradual rollout (supply-chain hardening prerequisite + router + config gradual rollout + RAG generation side + endpoint / frontend model selector)
- [adr-pytest-introduction.md](../../../leader/decisions/yiai/pytest-introduction.md) — ADR: introduce pytest + httpx + pytest-asyncio + coverage, directory `tests/{unit,integration,eval}`
- [adr-rag-evaluation-infra.md](../../../leader/decisions/yiai/rag-evaluation-infra.md) — ADR: RAG evaluation infrastructure built on llama-datasets + ragas 4 metrics + 50 documentation bilingual eval set + CI recall rollback > 5% block
- [adr-brd-agent-launch.md](../../../leader/decisions/yiai/brd-agent-launch.md) — ADR: BRD agent 5-stage launch methodology (structure contract first + RAG > long prompt + streaming + editable stream back + gradual rollout + feedback closed loop)
- [adr-knowledge-watcher-deployment.md](../../../leader/decisions/yiai/knowledge-watcher-deployment.md) — ADR (implementation): Knowledge Watcher implementation (apscheduler polling + incremental index + debounce + failure retry + monitoring; bypass macOS FSEvents event loss)
- [onboarding.md](../../../run/onboarding/yiai/onboarding.md) — newer onboarding
- [stories/](./stories/) — business requirement content (Story/Scene + BRD section)
  - [ai-chat-function/](./stories/ai-chat-function/) — AI chat function
    - [user-send-message/](./stories/ai-chat-function/user-send-message/) — user sends a message
    - [conversation-history-management/](./stories/ai-chat-function/conversation-history-management/) — conversation history management
  - [overseas-after-sales-ai-brd-agent/](./stories/overseas-after-sales-ai-brd-agent/) — AI BRD agent
    - [brd-draft-generation/](./stories/overseas-after-sales-ai-brd-agent/brd-draft-generation/) — BRD draft generation
    - [multilingual-brd/](./stories/overseas-after-sales-ai-brd-agent/multilingual-brd/) — multilingual BRD
    - [brd-approval-flow/](./stories/overseas-after-sales-ai-brd-agent/brd-approval-flow/) — BRD approval flow
- [engineering/](./engineering/) — project engineering documentation mirror
  - `claude.md` — project CLAUDE.md mirror
  - `readme.md` — project README.md mirror

## Anti-patterns

- **Relying on the RPC envelope for every cross-project call without documenting parameter contracts.** The envelope is universal, but the parameter names are not self-documenting. `filter` vs `query`, `target_file` vs `path`, `cname` vs `collection_name` -- each mismatch has caused real bugs. The contract table in `engineering/claude.md` must be consulted before every cross-project integration.

- **Deploying YiAi without health checks and monitoring for MongoDB connectivity.** MongoDB unavailability causes all features to fail. The `/health/observer` endpoint exists, but deploying without automated health checks and alerting means MongoDB outages will be discovered by users, not operators. The degradation countermeasures document failure modes but do not automate recovery.

- **Adding new domain logic directly to routes or services without creating a dedicated `domain/` sub-package.** The architecture direction is toward modularization. New features should land in `domain/<name>/` with a clear `__init__.py` public API, then be wrapped by `services/<name>/`. Scattering handlers across existing files creates the "god module" anti-pattern and makes the codebase progressively harder to navigate.

- **Skipping the `__init__.py` public API surface when creating new domain modules.** The `__init__.py` file in `domain/files/` and `domain/wework/` re-exports the public callable contract. Skipping this file forces callers to import from internal implementation files, creating tight coupling and making future refactors impossible. Every domain module must have an `__init__.py` that defines its public API.

- **Assuming the dual-write persistence model provides reliable backup.** The dual-write pattern (disk primary, MongoDB backup) is best-effort, not transactional. The MongoDB backup can lag behind or fail silently. For features requiring reliable persistence (e.g., session history), the dual-write model provides a fallback but not a guarantee. Critical data should have additional backup or replication mechanisms.

## Recent Changes

### 2026-08-08 — aiChat agent generic data tools + confirmation gate

- **`domain/ai/data_tools.py`** (new): Generic data tools — `db_list` (read-only), `db_schema` (returns collection schema as LLM context), `db_create`/`db_update`/`db_delete` (writes gated by `_WRITABLE_COLLECTIONS` + confirmation). Domain knowledge lives in `_COLLECTION_SCHEMAS`; the agent reasons over collections instead of hard-coded per-domain tools.
- **`domain/ai/agent.py`**: Confirmation gate — emits `confirmation_required`, pauses via `_wait_for_confirmation` (polls in-memory decision store, 120s timeout), executes only on `"approved"`. Confirmation ids made unique per turn (`t{turn_index}:{call.id}`) to prevent stale-decision collisions.
- **Native Ollama tool calling**: `OllamaRuntime.stream_chat` accepts `tools` and forwards structured `tool_calls`. The `<tool_call>` XML text parser remains as fallback for models that don't support native tool calling.
- **Tool-argument validation**: `_validate_arguments` checks tool call arguments against registered JSON schema before execution — missing required fields and type mismatches return model-readable errors so the model can self-correct.
- **Length-stop tool-call failure**: When a response hits the output token limit, any tool calls in it are failed with an error result instead of executing possibly-garbled args.
- **LLM retry with backoff**: Transient Ollama failures (connection reset, model loading) retry automatically with exponential backoff (max 2 retries). Only retries when nothing was streamed yet.
- **Schema rules + orphan guard**: `menus` schema carries `rules` block (menu catalog pitfalls). `db_delete` uses generic `parent_ref_field` to check for children before deleting — refuses when children exist, reports count + example key, suggests `force: true`.
- **Client disconnect abort**: `_watch_disconnect` runs alongside the SSE stream — polls the raw ASGI receive channel, sets an `abort` event checked between turns and tool calls. Closing the chat mid-turn stops the loop immediately.

### 2026-08-08 — Agent resilience (guards, escalation, memory, budget)

- **Narrate-and-stop guard**: When a model streams its plan as content and stops without invoking the tool, the no-tool-calls branch checks whether the text names any registered-but-unexecuted tool and injects a `[CONTINUE]` nudge. Bounded by `max_turns` + `_MAX_NUDGES = 2`.
- **No-tool task-completion nudge**: If zero tools were executed and the last user message is a concrete task, injects one `[TASK]` nudge before the normal loop break. Bounded to one per run.
- **Failure-based model escalation**: When the nudge guard is exhausted and the model still narrates without executing, the loop escalates to a stronger model (config `agent_model_fallback`, default `["qwen3-coder"]`). Emits `model_switch` event, injects `[MODEL SWITCH]` takeover. Bounded to one escalation per run.
- **Escalate when no-write nudge is ignored**: If the no-write nudge fires once but the model ignores it (recon-only stall), the loop escalates to the fallback model with a takeover naming the exact failure.
- **Tool-call XML parse-error fallback**: On `XML syntax error` from Ollama, retries without `tools` (plain text), then the existing `_parse_tool_calls_from_text` fallback extracts `<tool_call>` XML from the text stream. XML errors retry even after content was streamed.
- **Rejection memory**: `_session_rejections` stores canonical call signatures per session. Re-issuing an identical rejected call is auto-blocked with a "Blocked: identical call was previously rejected" error — no second confirmation prompt. Bounded to last 20 per session.
- **Auto-steer**: External steering messages append directly to `agent_messages` (immediate, no one-turn delay). `_steering_consumed` flag suppresses all task-completion checkpoints when set — human direction is the new ground truth.
- **Turn-budget awareness**: `_budget_warning` injects a `[BUDGET]` note when within 3 turns of `max_turns` — tells the model to compress non-essential steps. One-shot per run.
- **Repeated-observation spin guard**: Detects 3 consecutive identical tool-result observations and injects a `[TASK]` nudge to break the loop. Narration-only turns reset the chain; real progress (changed data) never false-fires.
- **Bound oversized tool results**: `_bound_tool_result` caps tool results at 6000 chars in LLM context only (persistence + UI keep full content). Keeps head (70%) + tail (22%) + explicit note so the model knows the rest exists and how to re-query.
- **Count-aware partial-completion detection**: `_parse_task_item_counts` associates explicit item counts with write verbs ("create 2 menus" → `(db_create, 2)`). Pre-break checkpoint compares `_write_counts` against needed counts and nudges on gaps.
- **Mission re-injection after compaction**: `_inject_mission_if_needed` re-injects the original task verbatim when compaction prunes it from context. Short runs (task still the last user message) are untouched.
- **Nudge hardening**: `_is_write_request` uses clause-boundary scanning for negation tokens (`don't`/`forbidden`/`do not`). `_write_executed` only tracks successful writes (no-error results); `_write_rejected` flag prevents re-arming declined writes. Completeness checkpoint names missing tools by name.

### 2026-08-08 — Resume-by-session + honest stop_reason

- **Resume-by-session**: `save_session_history`/`load_session_history` persist each run's full `agent_messages` (incl. `tool_result` messages) per `session_id`, in-memory with 1h TTL. `resume: true` restores the faithful trajectory — only the user's continuation travels in the request.
- **Mission-aware completion checks on resume**: When the last user message is a continuation (`continue`), checks run against the original `task_text` instead. Per-run tool tracking seeded from the restored trajectory's `tool_result`s.
- **Honest `agent_end` stop_reason**: `_natural_stop` flag distinguishes `"completed"` from `"max_turns_reached"`. The frontend surfaces the latter with a "Reply 'continue' to resume" prompt.
- **Surface skipped tool calls**: Rejected/timed-out/auto-blocked confirmation-gated calls now emit `tool_execution_start`+`tool_execution_end` with the error — visibility into why a write never ran.

### 2026-07-31 — RAG + Knowledge modules

- **`domain/rag/` + `services/rag/`**: RAG module built on `llama_index`. Hybrid retrieval (vector + BM25), optional `LLMRerank`, inline citation numbering. Per-file and folder-scoped chat/query variants. Persisted index at `./data/rag_store`.
- **`domain/knowledge/` + `services/knowledge/`**: Knowledge-base management. Scanner walks `../YiKnowledge` markdown tree with frontmatter parsing. Watcher polls via apscheduler (macOS FSEvents broken). Writer performs markdown write-back with metadata upsert to MongoDB `knowledge_files`.
