---
title: "Translation Analytics API — OpenAPI 3.0 Specification"
aliases: [translation-api-spec, openapi-translation]
tags: [api, openapi, translation, analytics, specification]
category: projects/yiai/workflows
created: 2026-09-23
updated: 2026-09-23
source: internal
type: spec
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer, sre]
benefit: "Formal OpenAPI specification for all translation analytics RPC methods"
---

# Translation Analytics API — OpenAPI 3.0 Specification

> All endpoints use the YiAi RPC envelope: `POST /` with `{module_name, method_name, parameters}`.
> Module: `services.translation.translate_service`

## Methods Overview

| Method | Type | Latency Target | Cache |
|--------|------|---------------|-------|
| `provider_health` | Analytics | <50ms | None |
| `hourly_trend` | Analytics | <80ms | None |
| `provider_breakdown` | Analytics | <100ms | None |
| `top_language_pairs` | Analytics | <50ms | None |
| `provider_recommend` | Recommendation | <50ms | None |
| `translation_analytics` | Analytics | <100ms | None |
| `translation_memory_stats` | Analytics | <30ms | None |
| `translation_feedback` | Write | <10ms | None |

## Method Specifications

### provider_health

```
POST /
{
  "module_name": "services.translation.translate_service",
  "method_name": "provider_health",
  "parameters": {
    "hours": 24          // int, default 24, range 1-720
  }
}

Response 200:
{
  "code": 0,
  "data": {
    "period_hours": 24,
    "providers": {
      "openai": {
        "total": 150, "success": 148, "failed": 2,
        "success_rate": 0.9867,
        "status": "healthy",         // "healthy" | "degraded" | "down"
        "total_chars": 28500
      }
    },
    "memory_entries": 1200,
    "feedback": {"good": 45, "bad": 3}
  }
}

Error (MongoDB unreachable):
{"code": 0, "data": {"providers": {}, "memory_entries": 0, "feedback": {"good": 0, "bad": 0}}}
// Returns empty results, never throws — graceful degradation
```

### provider_recommend

```
POST /
{
  "module_name": "services.translation.translate_service",
  "method_name": "provider_recommend",
  "parameters": {
    "from_lang": "auto",  // string, default "auto"
    "to_lang": "zh"       // string, default "zh"
  }
}

Response 200:
{
  "code": 0,
  "data": {
    "from_lang": "auto",
    "to_lang": "zh",
    "recommended": "openai",        // string | null
    "providers": [
      {"name": "openai", "success_rate": 0.9867, "status": "healthy", "total": 150, "failed": 2},
      {"name": "google", "success_rate": 0.9200, "status": "degraded", "total": 120, "failed": 10},
      {"name": "baidu", "success_rate": 0.6500, "status": "down", "total": 80, "failed": 28}
    ],
    "healthy_count": 1,
    "degraded_count": 1,
    "down_count": 1
  }
}
```

### hourly_trend

```
POST /
{
  "module_name": "services.translation.translate_service",
  "method_name": "hourly_trend",
  "parameters": {"days": 7}  // int, default 7, range 1-90
}

Response 200:
{"code": 0, "data": [{"hour": "2026-09-23T14", "count": 42, "chars": 8400}, ...]}
// Sorted by hour ascending. Returns [] if no data.
```

### provider_breakdown

```
POST /
{
  "module_name": "services.translation.translate_service",
  "method_name": "provider_breakdown",
  "parameters": {"days": 30}  // int, default 30
}

Response 200:
{"code": 0, "data": [{"provider": "openai", "count": 1200, "success": 1180}, ...]}
```

### translation_feedback

```
POST /
{
  "module_name": "services.translation.translate_service",
  "method_name": "translation_feedback",
  "parameters": {
    "source": "Hello world",
    "target": "你好世界",
    "rating": "good",       // "good" | "bad"
    "provider": "openai",
    "from_lang": "en",
    "to_lang": "zh"
  }
}

Response 200:
{"code": 0, "data": {"success": true}}
```

## Error Handling Strategy

All analytics methods follow **graceful degradation**: MongoDB unavailable → return empty results (never throw). Client displays "No data yet" or fallback UI.

| Scenario | Behavior |
|----------|----------|
| MongoDB unreachable | Empty `{}` or `[]`, HTTP 200 |
| Invalid parameters | `{"code": 1001, "message": "..."}` |
| Provider internal error | `{"code": 9999, "message": "..."}` |

## Consumers

| Client | Methods Used | Purpose |
|--------|-------------|---------|
| YiVad TranslationAnalytics | provider_health, hourly_trend, provider_breakdown, translation_analytics, provider_recommend | Dashboard visualization |
| YiPot TargetArea | translation_feedback | Quality rating 👍/👎 |
| YiPot yiaiAdapter | provider_recommend | Smart engine selection |
| YiPet TranslationService | translate, translation_feedback, provider_recommend | Quick translate + feedback |