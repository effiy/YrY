"""One-shot seed script: populate 1 representative entry per code-review topic.

For each topic in CR_TOPICS, writes a metadata doc in Mongo collection
``cr_<topic>`` with a realistic markdown body and structured meta fields.

Idempotent: if a collection already has >= 1 doc, that topic is skipped.

Run from YiAi/:
    python scripts/seed_cr_topics.py
"""
from __future__ import annotations

import asyncio
import sys
import time
import random
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "src"))

from data.database import db  # type: ignore


def _key(topic: str) -> str:
    stamp = int(time.time() * 1000)
    rand = random.randint(10_000, 99_999)
    return f"cr_{topic}_{stamp}{rand}"


def _now() -> int:
    return int(time.time() * 1000)


# (topic, title, meta, content_md)
TOPICS: list[tuple[str, str, dict, str]] = [
    (
        "summary",
        "YiAi model_runtime.py — File Summary",
        {"file_path": "YiAi/src/services/ai/model_runtime.py", "project": "yiai", "language": "Python"},
        """# File Summary

## File: YiAi/src/services/ai/model_runtime.py

## What it does
LLM provider abstraction layer — defines `ModelRuntime` ABC with `stream_chat` and `complete` async interfaces, plus `OllamaRuntime` and `RAGRuntime` implementations.

## Key Entry Points
- `OllamaRuntime.stream_chat()` — async generator yielding SSE-ready dicts from Ollama
- `OllamaRuntime.complete()` — non-streaming completion with retry + timeout
- `RAGRuntime.stream_chat()` — RAG-backed streaming with Ollama fallback
- `get_runtime(mode)` — factory function

## Dependencies
- `ollama` client library
- `domain.rag.engine` for RAG streaming
- `shared.config.settings` for Ollama URL/auth/timeout
"""
    ),
    (
        "explain",
        "YiVad TopicListPage — Logic Walkthrough",
        {"file_path": "YiVad/src/components/TopicListPage/index.vue", "project": "yivad", "language": "TypeScript/Vue"},
        """# Logic Walkthrough: TopicListPage

## File: YiVad/src/components/TopicListPage/index.vue

## Core Logic
The component is a generic list page for any topic (tech-leadership, code-review, BRD). It wraps ProTable with domain-specific meta columns and action buttons.

### Flow
1. **Props** define `tree`, `topic`, `metaColumns`, `actions`, and `templateContent`
2. **fetchList** calls `getTopicList(tree, topic, params)` → returns `{list, total}`
3. **Meta columns** are rendered from `row.meta` using `toColumnProps()` — supports tags, enums, and clickable links
4. **Actions** are resolved from `actions` prop (default: view/edit/delete/discuss/sessions)
5. **URL sync** — search params and page number are synced to route query for shareable links

### Non-obvious branches
- `detailRouteNameFor()` handles the BRD topic prefix stripping (`brd-` prefix removed before pascal-casing)
- Column settings are persisted per-tree+topic in localStorage
- Page size is also persisted separately
"""
    ),
    (
        "security",
        "YiAi RPC Endpoint — Security Review",
        {"file_path": "YiAi/src/server/routes/root.py", "project": "yiai", "language": "Python", "severity": "major", "category": "auth"},
        """# Security Review: YiAi RPC Endpoint

## File: YiAi/src/server/routes/root.py

## Findings

### Auth disabled by default
The X-Token header verification is optional (disabled by default). All RPC endpoints are publicly accessible when auth is off. This is a known configuration choice documented in CLAUDE.md.

### Dynamic module resolution
The root route handler resolves `module_name` to Python modules dynamically. A malicious `module_name` could potentially access unintended modules. Mitigation: only `services.*` modules are callable.

### Recommendations
1. **Enable auth for production** — Set `auth.enabled: true` in config.yaml
2. **Whitelist callable modules** — Restrict to known service modules
3. **Rate limit** — Add per-IP rate limiting for the RPC endpoint

### Severity: Major
"""
    ),
    (
        "dependency_risk",
        "YiVad npm Dependencies — Risk Assessment",
        {"file_path": "YiVad/package.json", "project": "yivad", "language": "JSON", "risk_level": "medium", "outdated_count": 12, "vulnerable_count": 0},
        """# Dependency Risk: YiVad npm Dependencies

## File: YiVad/package.json

## Risk Summary
- **Total dependencies:** 342 (direct + transitive)
- **Outdated (major):** 12 packages
- **Vulnerable:** 0 (npm audit clean)
- **Unmaintained:** 2 (svg-sprite-loader, node-sass — both being replaced)

## Key Risks
1. **element-plus 2.14 → 2.15**: Minor version gap, low risk. Breaking changes minimal.
2. **vue-router 5.0 → 5.1**: Patch-level, no breaking changes expected.
3. **svg-sprite-loader**: Unmaintained since 2022. Already replaced by custom Rsbuild plugin.

## Mitigation
- Monthly dependency audit via `npm audit` + `npx depcheck`
- Automated Renovate/Dependabot PRs for patch updates
- Manual review for major version bumps
"""
    ),
    (
        "access_review",
        "YiAi File Write Endpoint — Access Review",
        {"file_path": "YiAi/src/server/routes/files.py", "project": "yiai", "language": "Python", "caller_roles": "YiVad, YiPet", "privilege_boundary": "File system write"},
        """# Access Review: YiAi File Write Endpoint

## File: YiAi/src/server/routes/files.py

## Who can call this code path?
- **YiVad** — writes files via the dual-write endpoint (disk + MongoDB)
- **YiPet** — writes chat context files
- **No external consumers** — internal Yi family only

## Privilege boundary
Crosses from HTTP → filesystem write. The `target_file` parameter controls the write path.

## Risks
1. **Path traversal**: If `target_file` is not sanitised, could write outside the base directory
2. **No auth gate**: When auth is disabled, anyone on the network can write files
3. **Content validation**: No size limit or content type validation on writes

## Recommendations
1. Validate `target_file` against path traversal patterns
2. Add file size limit (e.g., 10MB)
3. Enable auth for production deployments
"""
    ),
    (
        "refactor",
        "YiAi data_service.py — Refactor Suggestions",
        {"file_path": "YiAi/src/services/database/data_service.py", "project": "yiai", "language": "Python", "effort": "m", "impact": "medium"},
        """# Refactor Suggestions: YiAi data_service.py

## File: YiAi/src/services/database/data_service.py

## Current state
The file is a single-line re-export: `from data.repository import *`. This is a pass-through with no added value.

## Suggested refactor
1. **Remove the pass-through** — Routes should import from `data.repository` directly, or the service layer should add actual business logic
2. **Extract query construction** — `_build_filter` is 100+ lines and handles too many cases. Split into composable filter builders
3. **Add type hints** — The `params: Dict[str, Any]` pattern makes it impossible to know what parameters are valid without reading the implementation

## Expected outcome
- Cleaner dependency graph (remove unnecessary indirection)
- More maintainable filter logic
- Better IDE support with typed parameters
"""
    ),
    (
        "perf",
        "YiAi RAG Engine — Performance Analysis",
        {"file_path": "YiAi/src/domain/rag/engine.py", "project": "yiai", "language": "Python", "hot_path": "rag_chat_stream", "bottleneck": "llama_index query + LLM inference"},
        """# Performance Analysis: YiAi RAG Engine

## File: YiAi/src/domain/rag/engine.py

## Hot paths
1. **`rag_chat_stream()`** — The main chat path. Spawns a worker thread, streams tokens via queue.
2. **`rag_query()`** — One-shot retrieval. Calls `index.as_retriever().retrieve()`.
3. **`rag_file_chat_stream()`** — Per-file variant. Builds index from single file, then streams.

## Bottlenecks
- **llama_index query engine**: Hybrid retrieval (vector + BM25) + optional LLM rerank = 2-5s before first token
- **LLM inference**: qwen3:14b on single GPU, ~50 tokens/s
- **No caching**: Each query rebuilds the chat engine context

## Recommendations
1. **Cache chat engine** per scope — avoid rebuilding for repeated queries
2. **Add first-token latency metric** — track time to first chunk
3. **Consider streaming retrieval** — start LLM generation while retrieval is still in progress
"""
    ),
    (
        "tests",
        "YiAi model_runtime.py — Test Cases",
        {"file_path": "YiAi/src/services/ai/model_runtime.py", "project": "yiai", "language": "Python", "coverage_target": "80%"},
        """# Test Cases: YiAi model_runtime.py

## File: YiAi/src/services/ai/model_runtime.py

## Happy Path Tests
1. **`test_ollama_complete_returns_success`** — Mock Ollama client, verify `complete()` returns `{success: True, message: ...}`
2. **`test_ollama_stream_chat_yields_chunks`** — Mock streaming response, verify generator yields SSE-ready dicts
3. **`test_rag_runtime_falls_back_on_error`** — Mock RAG engine failure, verify fallback to OllamaRuntime

## Edge Cases
4. **`test_complete_timeout`** — Mock hanging Ollama, verify `asyncio.wait_for` triggers timeout
5. **`test_stream_chat_timeout`** — Mock hanging stream, verify `queue.get()` timeout
6. **`test_empty_messages`** — Empty message list, verify graceful handling
7. **`test_retry_exhaustion`** — All retries fail, verify error response

## Test Framework
- pytest + pytest-asyncio
- Mock `ollama.Client` with `unittest.mock`
- Mock `domain.rag.engine` for RAG tests
"""
    ),
    (
        "style",
        "YiVad ProTable — Naming & Style Review",
        {"file_path": "YiVad/src/components/ProTable/index.vue", "project": "yivad", "language": "TypeScript/Vue"},
        """# Naming & Style Review: YiVad ProTable

## File: YiVad/src/components/ProTable/index.vue

## Conventions Followed
- PascalCase component name: `ProTable` ✓
- `<script setup lang="ts">` ✓
- Scoped SCSS styles ✓
- `defineProps<{...}>()` with type generics ✓
- `defineEmits<{...}>()` ✓

## Flagged Inconsistencies
1. **Mixed comment styles**: Some JSDoc, some inline `//`. Standardise on JSDoc for public API.
2. **`any` types in event handlers**: `(row: any)` in a few places. Replace with specific generics.
3. **Magic numbers**: `height: calc(100vh - 95px)` — the 95px offset appears in multiple components. Extract to a CSS variable.

## Recommendations
- Extract `--layout-offset: 95px` as a CSS custom property
- Add `interface RowData` generic constraint to replace `any`
"""
    ),
    (
        "api_contract",
        "YiAi data_service.query_documents — API Contract",
        {"file_path": "YiAi/src/data/repository.py", "project": "yiai", "language": "Python"},
        """# API Contract Check: data_service.query_documents

## Endpoint: POST / → services.database.data_service.query_documents

## Inputs
- `cname` | `collection_name`: string (required) — MongoDB collection name
- `filter`: dict (optional) — merged into query params via `_build_filter`
- `pageNum`: int (default 1), `pageSize`: int (default 10)
- `fields` | `select`: string (optional) — comma-separated field names
- `orderBy`: string (default varies by collection)
- `orderType`: "asc" | "desc" (default "asc")

## Outputs
```json
{
  "code": 0,
  "data": {
    "list": [...],
    "total": 123,
    "pageNum": 1,
    "pageSize": 10,
    "totalPages": 13
  }
}
```

## Error Cases
- Missing collection name → 400 "Collection name is required"
- Invalid pagination → 400 "Pagination parameters must be valid integers"
- Collection not found → MongoDB creates it on first insert (no error)

## Backward Compat
- `collection_name` and `cname` both accepted ✓
- `filter` parameter name is load-bearing — `query` is silently ignored
"""
    ),
    (
        "observability_gap",
        "YiAi Chat Service — Observability Gap",
        {"file_path": "YiAi/src/services/ai/chat_service.py", "project": "yiai", "language": "Python", "gaps": "No metrics, no tracing, basic logging only"},
        """# Observability Gap: YiAi Chat Service

## File: YiAi/src/services/ai/chat_service.py

## Current State
- **Logging**: Basic `logging.getLogger(__name__)` — log messages exist but no structured format
- **Metrics**: None — no request count, latency, error rate, or token usage tracking
- **Tracing**: None — no distributed tracing across chat → Ollama → RAG calls

## What Should Be Emitted
| Signal | Current | Should |
|--------|---------|--------|
| Request count | — | Counter by model, stream vs complete |
| Latency (p50/p95/p99) | — | Histogram: time to first token, total time |
| Error rate | — | Counter by error type (timeout, ollama_unavailable, etc.) |
| Token usage | — | Gauge: input tokens, output tokens |
| Queue depth | — | Gauge: concurrent stream count |

## Recommendations
1. Add `prometheus_client` for metrics
2. Structure logs as JSON with `python-json-logger`
3. Add OpenTelemetry spans for chat → Ollama → RAG call chain
"""
    ),
    (
        "concurrency",
        "YiAi model_runtime.py — Concurrency Review",
        {"file_path": "YiAi/src/services/ai/model_runtime.py", "project": "yiai", "language": "Python"},
        """# Concurrency Review: YiAi model_runtime.py

## File: YiAi/src/services/ai/model_runtime.py

## Findings

### Thread-safe queue usage ✓
`asyncio.Queue` is used correctly with `run_coroutine_threadsafe` for cross-thread communication.

### Potential race: task not tracked
```python
asyncio.create_task(asyncio.to_thread(_worker))
```
The task is not stored. If the consumer stops iterating, the worker continues running. Not a correctness issue but a resource leak.

### Timeout handling
`asyncio.wait_for` with `run_in_executor` — the thread is NOT interrupted on timeout. The `_call` function continues running in the background. This is a known Python limitation. The fix would be to use `threading.Event` for cooperative cancellation.

### No concurrency limit
Multiple concurrent `stream_chat` calls each spawn a thread. No limit on concurrent Ollama requests. Could exhaust GPU memory.

## Recommendations
1. Add a semaphore to limit concurrent Ollama streams (e.g., max 2)
2. Track worker tasks for cancellation on consumer disconnect
3. Document the thread-not-interrupted-on-timeout limitation
"""
    ),
    (
        "error_handling",
        "YiAi RAG Engine — Error Handling Review",
        {"file_path": "YiAi/src/domain/rag/engine.py", "project": "yiai", "language": "Python"},
        """# Error Handling Review: YiAi RAG Engine

## File: YiAi/src/domain/rag/engine.py

## Findings

### Silent swallows
```python
except Exception:
    logger.warning("Failed to record chat turn", exc_info=True)
```
The `record_chat_turn` failure is silently swallowed. If recording fails consistently, we'd never know from metrics.

### Generic catches
```python
except Exception as e:
    asyncio.run_coroutine_threadsafe(
        queue.put({"error": f"RAG chat failed: {e}"}), loop
    )
```
Leaks internal error details to the client. Should distinguish user-facing errors from internal ones.

### Unpropagated errors
```python
except Exception as e:
    logger.warning(f"RAG stream failed, falling back to Ollama: {e}")
```
The RAG → Ollama fallback silently hides RAG failures. Should emit a metric or structured log.

## Recommendations
1. Add error counters by category (retrieval_failed, llm_failed, recording_failed)
2. Sanitise user-facing error messages
3. Log RAG fallback events with full error context
"""
    ),
    (
        "dead_code",
        "YiVad useHandleData — Dead Code Review",
        {"file_path": "YiVad/src/hooks/useHandleData.ts", "project": "yivad", "language": "TypeScript"},
        """# Dead Code Review: YiVad useHandleData

## File: YiVad/src/hooks/useHandleData.ts

## Analysis
The hook is actively used by 10+ callers across TopicListPage, useTopicList, and multiple ProTable pages. No dead code detected.

## Unused exports
None — `useHandleData` is the only export and is widely used.

## Call pattern analysis
All callers use `await useHandleData(api, params, message)` but most don't check the return value. The recent fix adds `resolve(false)` on cancel — callers should check this to avoid proceeding after cancellation.

## Recommendation
- Update all callers to check return value: `const ok = await useHandleData(...); if (ok) { ... }`
"""
    ),
    (
        "backward_compat",
        "YiAi RPC Envelope — Backward Compat Review",
        {"file_path": "YiAi/src/server/routes/root.py", "project": "yiai", "language": "Python"},
        """# Backward Compat Review: YiAi RPC Envelope

## API: POST / RPC envelope

## Current contract
```json
{
  "module_name": "services.database.data_service",
  "method_name": "query_documents",
  "parameters": { "cname": "...", "filter": {...} }
}
```

## Breaking Change Risk
- **`filter` vs `query`**: `filter` is the correct parameter name. Using `query` silently returns all results. This is documented but still a footgun.
- **`cname` vs `collection_name`**: Both accepted. Backward compatible.
- **`target_file` vs `path`**: File endpoints require `target_file`. Using `path` returns 422. Breaking if callers used the old name.

## Migration Path
1. Add server-side validation that warns on `query` parameter usage
2. Add deprecation header when `path` is used instead of `target_file`
3. After 2 sprints, remove `path` support

## Rollback Plan
- Keep both parameter names accepted indefinitely for RPC
- Add warnings to CLAUDE.md documentation
"""
    ),
    (
        "i18n_a11y",
        "YiVad TopicListPage — i18n / a11y Review",
        {"file_path": "YiVad/src/components/TopicListPage/index.vue", "project": "yivad", "language": "TypeScript/Vue"},
        """# i18n / a11y Review: YiVad TopicListPage

## File: YiVad/src/components/TopicListPage/index.vue

## i18n
- **All user-facing strings use `$t()` or `t()`** ✓
- Translation keys are namespaced: `topicDetail.*`, `story.*`, `common.*` ✓
- `Intl.DateTimeFormat` uses `navigator.language` for locale-aware dates ✓
- **No hardcoded strings found** ✓

## a11y
- **aria-label on sections**: `aria-label="Breadcrumb"` ✓
- **Keyboard navigation**: `el-button` components are keyboard-focusable by default ✓
- **Missing**: No `aria-label` on the stats section or project chips
- **Missing**: No `role` attributes on custom interactive elements
- **Missing**: `el-table` column headers should have `scope="col"`

## Recommendations
1. Add `aria-label` to stats section and project chips
2. Add `role="navigation"` to breadcrumb nav
3. Verify colour contrast on tag colours (warning/primary/info)
"""
    ),
]


async def _collection_has_any(cname: str) -> bool:
    existing = await db.find_one(cname, {})
    return existing is not None


async def _seed_one(topic: str, title: str, meta: dict, content: str) -> str:
    # topicSlug: convert underscores to hyphens so the collection name
    # matches what YiVad's cnameFor produces (topic comes from the route,
    # which uses topicSlug). Without this, "dependency_risk" → cr_dependency_risk
    # but the frontend queries cr_dependency-risk.
    cname = f"cr_{topic.replace('_', '-')}"
    if await _collection_has_any(cname):
        return f"skip   {topic:<30} (already has entries)"

    key = _key(topic)
    now = _now()

    doc = {
        "key": key,
        "topic": topic,
        "title": title,
        "tags": ["seed", "reference", "code-review"],
        "meta": meta,
        "content": content,
        "createdAt": now,
        "updatedAt": now,
    }
    await db.insert_one(cname, doc)
    return f"wrote  {topic:<30} -> {cname} / {key}"


async def main() -> int:
    await db.initialize()
    written = 0
    skipped = 0
    failed = 0
    for topic, title, meta, content in TOPICS:
        try:
            msg = await _seed_one(topic, title, meta, content)
            print(msg)
            if msg.startswith("wrote"):
                written += 1
            else:
                skipped += 1
        except Exception as e:
            print(f"FAIL   {topic:<30} -> {e}")
            failed += 1
    print(f"\nDone. wrote={written} skip={skipped} fail={failed} total={len(TOPICS)}")
    await db.close()
    return 0 if failed == 0 else 1


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))