---
title: The three pillars of observability
aliases:
- observability-triad
- logs-metrics-traces
- three-pillars-observability
- observability-pillars
tags:
- observability
- logging
- metrics
- tracing
- monitoring
category: oncall-sre/observability
created: 2026-08-07
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
roles:
- oncall-sre
- engineer
- tech-lead
- ai-engineer
benefit: "teams understand how logs, metrics, and traces complement each other and can build a unified observability strategy"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ./docker-kubernetes.md
- ../set-up-observability.md
- ../../ai-engineer/platform/llm-observability-comparison.md
- ../../engineer/process/monitoring-governance.md
tacit: false
---

# The three pillars of observability

> **As an** oncall SRE, **I want to** understand how logs, metrics, and traces work together, **so that** I can build a coherent observability strategy that answers any operational question.

> Logs tell you what happened, metrics tell you how much, and traces tell you where it happened. Together, they form a complete picture of system behavior. None alone is sufficient.

## Summary

- Logs are immutable, timestamped records of discrete events. They are the most detailed but the most expensive to store and query at scale.
- Metrics are aggregated numerical measurements collected over time. They are cheap to store and query but lose individual event context.
- Traces are end-to-end records of a request's journey through distributed systems. They connect the dots between services but require instrumentation.
- The three pillars complement each other: metrics for alerting and trend analysis, logs for root cause investigation, traces for understanding distributed system behavior.
- OpenTelemetry has emerged as the unified standard for collecting and exporting all three signal types.

## Core viewpoints

### 1. Each pillar answers a different question

Metrics answer "is there a problem?" (alerting, dashboards, trends). Logs answer "what caused the problem?" (root cause analysis, debugging). Traces answer "where in the system is the problem?" (distributed debugging, bottleneck identification). Using only one pillar is like navigating with only one instrument. The three pillars must be correlated through common identifiers (trace ID, request ID, session ID).

### 2. Metrics-first, logs-on-demand, traces-for-complexity

Start with metrics for all services. Add structured logging for operational visibility. Add distributed tracing for services with > 3 downstream dependencies or where latency is critical. Do not instrument tracing for a simple CRUD service with a single database dependency -- the overhead outweighs the value. Reserve deep tracing investment for the 20% of services that handle 80% of complexity.

### 3. Cardinality is the key difference between metrics and logs

Metrics are pre-aggregated: you decide the dimensions (labels) at write time, and querying is fast because the data is already summarized. Logs are raw events: you can query any field at read time, but storage and query cost grow with volume. High-cardinality dimensions (user ID, request ID) belong in logs and traces, not in metrics. Putting high-cardinality labels in Prometheus metrics will cause a cardinality explosion that degrades performance.

### 4. The unified observability standard is OpenTelemetry

OpenTelemetry (OTel) provides a single SDK and collector for logs, metrics, and traces. It decouples instrumentation (SDK) from backend (exporter), so you can switch from Jaeger to Tempo or from Prometheus to VictoriaMetrics without changing application code. Adopting OTel is the single highest-leverage observability investment: it future-proofs your instrumentation and provides correlation out of the box.

## Key info

### Pillar comparison

| Dimension | Logs | Metrics | Traces |
|---|---|---|---|
| Data type | Immutable event records | Aggregated time series | Span trees with parent-child |
| Cost | High (storage + query) | Low (pre-aggregated) | Medium (sampling reduces cost) |
| Cardinality | High (any field) | Low (pre-defined labels) | Medium (trace ID + span attributes) |
| Query speed | Slow (full-text search) | Fast (pre-computed) | Medium (indexed by trace ID) |
| Primary use case | Root cause analysis | Alerting, dashboards | Distributed debugging |
| Retention | Days to weeks | Months to years | Days to weeks |
| Granularity | Per-event | Aggregated (1s-1m windows) | Per-request |

### Tooling comparison

| Signal | Open-source | SaaS | Storage format |
|---|---|---|---|
| Metrics | Prometheus, VictoriaMetrics | Grafana Cloud, Datadog | Time-series DB |
| Logs | Loki, Elasticsearch | Grafana Cloud, Datadog | Object store / inverted index |
| Traces | Jaeger, Tempo | Grafana Cloud, Datadog | Object store / columnar DB |
| Unified | OpenTelemetry Collector | Grafana Cloud, Datadog | OTLP protocol |

### The correlation problem

The three pillars are only useful when correlated. Common correlation strategies:

1. **Exemplars**: Attach a trace ID to a metric data point. When a latency spike is visible in metrics, click the exemplar to see the trace.
2. **Trace-log correlation**: Inject trace ID and span ID into structured log entries. When viewing a trace, see associated logs.
3. **Metric-log correlation**: Use log-derived metrics (e.g., error count from log patterns) to bridge the gap.

### Implementation patterns

**Level 1 -- Basic**: Metrics only (Prometheus + Grafana). Alert on RED metrics (Rate, Errors, Duration). Good for simple services.

**Level 2 -- Standard**: Metrics + Structured Logs. Add Loki + Fluent Bit. Logs tagged with request ID and service name. Good for most services.

**Level 3 -- Advanced**: Metrics + Logs + Traces. Add OpenTelemetry SDK + Tempo. Full correlation through trace ID. Required for distributed systems with > 3 services.

**Level 4 -- Mature**: All three + business observability. Add business metrics (conversion rate, task completion rate) alongside technical metrics. Full-stack visibility.

## Action recommendations

1. Adopt the RED method (Rate, Errors, Duration) as the baseline for all service metrics.
2. Standardize on structured logging (JSON) with a minimum set of fields: timestamp, level, service, trace_id, message.
3. Implement OpenTelemetry SDK for all new services; for existing services, start with auto-instrumentation.
4. Use exemplars to link metrics to traces: every latency histogram bucket should include an exemplar trace ID.
5. Inject trace ID and span ID into all structured log entries for correlation.
6. Set log retention to 7 days for operational logs, 30 days for audit logs, and 1 year for metrics.
7. For services with < 3 downstream dependencies, start with metrics + logs; add tracing only if debugging distributed issues becomes frequent.

## Anti-patterns

- **Metrics only, no logs** -- you know there is a problem but cannot investigate the root cause. Every alert should link to relevant logs.
- **High-cardinality metric labels** -- putting user ID, request ID, or session ID as a Prometheus label causes exponential cardinality growth. Use logs for these.
- **Tracing everything** -- tracing every request in a high-throughput system generates excessive data. Use head-based sampling (sample 1/N requests) or tail-based sampling (sample interesting traces).
- **Unstructured logs** -- grep-based debugging does not scale. Structured logging enables automated parsing, alerting, and correlation.
- **No log level discipline** -- DEBUG logs in production waste storage; INFO logs that are too sparse provide no value. Define clear log level standards per environment.
- **Separate tools for each pillar** -- using different vendors for metrics, logs, and traces without correlation defeats the purpose. Use a unified platform or build correlation yourself.

## Related

- Same category: [./docker-kubernetes.md](./docker-kubernetes.md) -- container observability
- Same category: [../set-up-observability.md](./set-up-observability.md) -- observability setup journey
- Upstream: [../../engineer/process/monitoring-governance.md](../../engineer/process/monitoring-governance.md) -- monitoring governance
- Downstream: [../../ai-engineer/platform/llm-observability-comparison.md](../../ai-engineer/platform/llm-observability-comparison.md) -- LLM-specific observability

## References

- Google SRE Book -- Monitoring Distributed Systems
- OpenTelemetry -- official documentation
- RED Method -- Tom Wilkie, Grafana Labs
- USE Method -- Brendan Gregg