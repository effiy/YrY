---
title: Observability Triad — Logs, Metrics, Traces
aliases: [observability-triad, logs-metrics-traces, three-pillars]
tags: [sre, observability, logging, metrics, tracing, monitoring]
category: srer/observability
created: 2026-08-24
updated: 2026-08-24
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [srer, engineer]
benefit: "Engineers understand the three pillars of observability and know which to use for each diagnostic scenario"
acceptance_criteria:
  - "explains logs, metrics, and traces with concrete examples"
  - "provides a decision tree for which pillar to use"
  - "covers YiAi's current observability setup"
related:
  - ./set-up-observability.md
  - ./slo-sli-definition.md
  - ../incident-response/respond-to-an-incident.md
---

# Observability Triad — Logs, Metrics, Traces

> **When to use:** When setting up observability for a service or diagnosing a production issue. The triad gives you three lenses on system behavior — each answers a different question.

## The Three Pillars

| Pillar | Question it answers | Data shape | Cost |
|---|---|---|---|
| **Logs** | What happened? | Immutable, timestamped event records | High volume, high storage cost |
| **Metrics** | How much? How fast? | Numeric time-series data | Low per-data-point cost |
| **Traces** | Where did it spend time? | Directed acyclic graph of spans | Medium volume, medium cost |

### When to Use Each

```
What are you trying to do?
├─ Debug a specific error? ──→ Logs
│   "User 123 got a 500 error — what was the stack trace?"
│
├─ Check system health? ──→ Metrics
│   "Is the P99 latency above SLO? Is error rate spiking?"
│
├─ Find a performance bottleneck? ──→ Traces
│   "Why is this endpoint slow? Which service call is the bottleneck?"
│
└─ Investigate an unknown issue? ──→ Metrics → Logs → Traces
    Start with metrics (is there a problem?) →
    Drill into logs (what's happening?) →
    Follow traces (where is it happening?)
```

## Logs

### What to Log

| Level | What | Example |
|---|---|---|
| **ERROR** | Something failed; needs attention | `Database connection refused: connection pool exhausted` |
| **WARN** | Something is unusual but not failing | `Retry 3/5 for Ollama request; backoff 2s` |
| **INFO** | Key business events | `Session created: session_id=abc123, user=admin` |
| **DEBUG** | Detailed diagnostic info | `MongoDB query: find_one({key: "abc"}) took 12ms` |

### Log Structure

Every log line should be structured (JSON) and include:

```json
{
  "timestamp": "2026-08-24T10:00:00Z",
  "level": "INFO",
  "service": "yi-ai",
  "trace_id": "abc123",
  "message": "Chat request completed",
  "duration_ms": 1234,
  "user_id": "admin",
  "model": "qwen3.5"
}
```

### YiAi Logging Setup

YiAi uses Python's `logging` module. Key log sources:

| Source | What it logs | Where |
|---|---|---|
| `src/app.py` | Request lifecycle | stdout |
| `src/domain/ai/agent.py` | Agent loop: turns, tool calls, confirmations | stdout |
| `src/data/database.py` | MongoDB operations | stdout |
| `src/services/ai/chat_service.py` | Chat requests, Ollama calls | stdout |

## Metrics

### The Four Golden Signals

| Signal | Metric | YiAi example |
|---|---|---|
| **Latency** | Request duration (P50, P95, P99) | `chat_request_duration_ms` |
| **Traffic** | Requests per second | `chat_requests_total` |
| **Errors** | Error rate (5xx / total) | `http_requests_total{status=~"5.."}` |
| **Saturation** | How "full" the service is | `db_connection_pool_active`, `ollama_queue_depth` |

### Metric Types

| Type | Use case | Example |
|---|---|---|
| **Counter** | Only increases | `http_requests_total`, `chat_messages_total` |
| **Gauge** | Goes up and down | `db_connection_pool_active`, `memory_usage_bytes` |
| **Histogram** | Distribution of values | `request_duration_seconds` (P50/P95/P99) |
| **Summary** | Pre-computed quantiles | Client-side latency summary |

## Traces

### Span Structure

A trace is a tree of spans. Each span represents a unit of work:

```
Trace: Chat Request (500ms)
├─ Span: Parse request (2ms)
├─ Span: Load session from MongoDB (15ms)
│   └─ Span: find_one query (12ms)
├─ Span: Ollama chat (450ms)
│   └─ Span: Token generation (448ms)
└─ Span: Save session (8ms)
```

### What to Trace

- Every incoming HTTP request
- Every database query
- Every external API call (Ollama, RAG)
- Every significant internal operation (> 10ms)

## YiAi's Current Observability

YiAi's observability is currently minimal — logs to stdout, no structured metrics, no distributed tracing.

### Quick Wins (in priority order)

1. **Structured logging** — switch to JSON log format (30 min)
2. **Request duration metrics** — add middleware to track P50/P95/P99 (1 hour)
3. **Error rate alerting** — alert when 5xx rate > 1% for 5 min (2 hours)
4. **Distributed tracing** — add trace IDs to logs; propagate across services (1 day)

### Future State

```
YiAi (FastAPI)
  │ stdout → JSON logs → Grafana Loki
  │ metrics → Prometheus → Grafana dashboards
  │ traces → Grafana Tempo
  ▼
MongoDB Atlas → built-in metrics → Atlas dashboard
Ollama → custom metrics exporter → Prometheus
```

## Anti-patterns

| Anti-pattern | Why it fails | What to do instead |
|---|---|---|
| Logging everything at DEBUG | Storage cost explodes; signal is buried in noise | Log at INFO by default; DEBUG for development only |
| Metrics without alerts | Pretty dashboards that no one watches | Every metric should have an alert threshold |
| No trace IDs in logs | Can't correlate log lines across services during debugging | Include trace_id in every log line |
| Only one pillar | Each pillar answers different questions; one is not enough | Logs for debugging, metrics for alerting, traces for performance |