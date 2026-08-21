---
title: YiAi Architecture
tags: [yiai, architecture, backend, fastapi]
category: engineer/learn/projects/yiai
created: 2026-08-21
updated: 2026-08-21
source: internal
type: reference
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer]
benefit: "Quick reference to YiAi architecture layers, data flow, and degradation strategy"
related:
  - ./README.md
  - ./functional-modules.md
  - ./dev-standards.md
---

# YiAi Architecture

> Full architecture details in [README.md](./README.md). This is a quick-reference extraction.

## Layer stack

```
server/   → FastAPI routes + middleware (HTTP layer)
services/ → Business logic orchestration
domain/   → Core business logic (ai, auth, files, knowledge, rag, rss, state, wework)
data/     → MongoDB access (Motor async singleton + repository)
shared/   → Cross-cutting (config, response, error_codes, logging, utils)
models/   → Pydantic schemas + collection name constants
```

## Key data flows

- **RPC**: `POST /` → `{module_name, method_name, parameters}` → service → domain → data → MongoDB
- **Chat SSE**: `POST /` → `chat_service.chat` → `StreamingResponse(text/event-stream)` → Ollama
- **File dual-write**: disk (primary) + MongoDB (best-effort backup)

## Degradation

| Failure | Behavior |
|---------|----------|
| MongoDB down | Writes fail fast; reads return empty |
| Ollama down | Chat returns `ErrorCode.AI_UNAVAILABLE` |
| OSS down | Falls back to local disk only |