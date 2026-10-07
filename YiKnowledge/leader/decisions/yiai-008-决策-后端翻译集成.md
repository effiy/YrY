---
title: "ADR-2026-09-23b: YiAi Backend Integration for Translation — Route AI Providers Through Unified Backend"
aliases: [adr-yiai-translation-integration]
tags: [adr, translation, architecture, yiai-integration, routing]
category: leader/decisions
created: 2026-09-23
updated: 2026-09-23
source: internal
type: decision
status: stable
lifecycle: active
review_cycle: quarterly
roles: [leader, engineer]
benefit: "Records the architectural decision to route AI/LLM translation providers through YiAi backend for memory cache and RAG context"
---

# ADR-2026-09-23b: YiAi Backend Integration for Translation

## Status

Accepted — implemented 2026-09-23.

## Context

The system supports 20+ translation engines. AI/LLM-based providers (OpenAI, Ollama, ChatGLM, Gemini) benefit from:
- Translation memory cache (avoid repeated API calls for identical text)
- RAG context enhancement (domain-specific terminology from YiKnowledge)
- Centralized API key management (keys stored in YiAi, not in desktop app)
- Usage analytics (translation records for dashboard)

Traditional providers (Google, Baidu, DeepL) don't benefit from these and should maintain direct API calls for lower latency.

## Decision

Route AI/LLM providers through YiAi RPC, traditional providers through direct API calls, with automatic fallback:

```
AI providers (openai/ollama/chatglm/geminipro):
  try YiAi RPC → translate_service.translate → memory cache + RAG context
  catch → fallback to direct API call (user-transparent)

Traditional providers (google/baidu/deepl/...):
  direct API call (unchanged)
```

### Provider Classification

| Category | Providers | Routing | Reason |
|----------|-----------|---------|--------|
| AI/LLM | openai, ollama, chatglm, geminipro | YiAi RPC → fallback direct | Memory cache + RAG benefit |
| Traditional | google, baidu, deepl, youdao, tencent, volcengine, microsoft, alibaba, caiyun, niutrans, yandex, bing, lingva, ecdict, transmart | Direct API | Lower latency, no cache benefit |

## Alternatives Considered

| Alternative | Reason Rejected |
|-------------|----------------|
| Route ALL providers through YiAi | Adds unnecessary latency for traditional providers (~50ms RPC overhead) |
| Route NONE through YiAi | Loses memory cache (~30% hit rate) and RAG context enhancement |
| Client-side caching (local SQLite) | Duplicates YiAi `translation_memory`; no RAG context access |

## Consequences

### Positive
- Memory cache hit rate ~30% reduces API costs and latency
- RAG context improves technical document translation accuracy
- API keys managed centrally in YiAi (security)
- Translation records feed YiVad analytics dashboard

### Negative
- Adds YiAi as a runtime dependency for AI translation
- ~50ms RPC overhead (acceptable given LLM API latency is 500ms+)
- Increased system complexity (dual routing logic in yiaiAdapter.ts)

## References

- Implementation: `YiAi: services/translation/translate_service.py`
- Related ADR: [Smart Provider Ranking](./ADR-2026-09-23-智能供应商推荐.md)