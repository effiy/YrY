---
title: Distributed tracing pattern
aliases: [distributed-tracing-pattern, otel-tracing, trace-context-propagation, open-telemetry]
tags: [methodology, engineering-patterns, observability, distributed-tracing, otel, trace-context, sampling]
category: engineer/engineering
created: 2026-08-03
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer, tech-lead, oncall-sre]
benefit: "Request flows are traced across service boundaries, enabling latency debugging and root cause analysis in distributed systems"
acceptance_criteria:
  - "pattern name, problem statement, and solution approach are all described"
  - "trade-offs and when-not-to-use-this-pattern are explicitly stated"
  - "at least one concrete example or code snippet is provided
related:
- ./observability.md
  - ./rate-limiting.md
  - ../../tech-lead/decisions/yiai--route-llm-traffic-across-providers.md
tacit: Tracing is not logging; it is the chain. Trace context propagates across services + span parent-child + sampling + linked logs/metrics; end-to-end visibility
---

# Distributed tracing pattern

> **As an** engineer, **I want to** distributed tracing, **so that** pattern applied consistently.

## Problem

In microservices / multi-service architecture, a user request spans multiple services; on failure, single-service logs cannot locate the bottleneck / error chain / cross-service dependency. Need end-to-end chain tracing, one trace through all services, to locate which hop is slow, which hop is wrong, and how the dependency chain looks.

## Pattern

- **Trace context propagation**: trace_id + span_id + parent_span_id propagate across services; do not lose context
- **W3C Trace Context**: standard `traceparent` + `tracestate` headers; no custom
- **OpenTelemetry standard**: not vendor-locked; SDK + Collector + Exporter
- **Span parent-child structure**: if service A calls service B, A's span is B's parent span; not isolated
- **Required span fields**: name / start_time / end_time / status / attributes / events / links
- **Sampling**:
  - head-based (entry sampling) — entry decides whether to sample; simple but misses tail errors
  - tail-based (tail sampling) — decides after the full trace; can capture errors but higher overhead
  - hybrid: head high-rate + tail error-priority
- **Three-piece link**: trace_id runs through logs + metrics + traces; not isolated
- **Propagation mechanism**: HTTP headers / RPC metadata / message headers / SSE chunk metadata
- **Async boundary**: message queues / outbox / saga must propagate trace context; do not lose
- **LLM trace**: multi-step workflow must trace; each step one span (prompt / model / token / latency / cost)
- **Adjustable sampling rate**: tune by traffic volume; not too high, not too low
- **Baggage**: propagate business fields across services (user_id / tenant_id / experiment_id); not just trace context

## Applicable

- Microservice architecture (multi-service cross-calls)
- LLM multi-step workflow (RAG → tool → post-process → DB)
- Async messaging systems (outbox / saga / event-driven)
- Multi-provider switching (trace primary/backup provider decision path)
- Failure triage (end-to-end slow / error chain)

## Not applicable

- Monolith (logs suffice)
- In-process internal calls (span overhead exceeds benefit)
- No related request stream (no cross-service)

## Landing checklist

- [ ] OTel SDK onboarding: each service must install the SDK; do not hand-write
- [ ] W3C Trace Context: use `traceparent` header; no custom
- [ ] trace_id through: logs + metrics + traces share trace_id; not isolated
- [ ] span parent-child: cross-service calls must pass parent span_id; do not lose
- [ ] Sampling strategy: head 5-10% + tail 100% error + 100% slow (above P99)
- [ ] Async boundary: message header / outbox event / SSE chunk must propagate trace context
- [ ] Baggage: pass user_id / tenant_id / experiment_id; business-related
- [ ] LLM trace: each step one span (prompt / model / token / latency / cost / provider)
- [ ] Multi-provider trace: primary/backup decision path must trace; observable switch path
- [ ] RAG trace: query → retrieve → rerank → generate must trace; each hop a span
- [ ] Agent trace: tool call → tool result → LLM must trace; agent loop one span tree
- [ ] Collector: OTel Collector unified collection; do not directly connect to backend
- [ ] Backend: Jaeger / Tempo / Honeycomb / Datadog; team choice
- [ ] Slow span alert: P99 span latency > threshold alert; do not rely on humans browsing
- [ ] Error span alert: error span rate > threshold alert
- [ ] Linked with logs: logs must carry trace_id; query logs by trace_id
- [ ] Linked with metrics: metric label carries trace_id (key metric); query metric by trace
- [ ] Linked with RUM: frontend RUM session linked to backend trace; end-to-end user view
- [ ] Trace retention: sampled traces retained 7-30 days; not too long, not too short
- [ ] Privacy: trace does not carry PII; if PII must carry, mask
- [ ] Drill: regularly locate failures by trace_id; verify end-to-end visibility

## Anti-patterns

- Not propagating trace context — cross-service broken chain
- Custom header instead of W3C — vendor lock-in + no interop
- No sampling, keep all — overhead explodes
- All head sampling — cannot capture tail errors
- All tail sampling — high overhead
- Trace not linked with log / metric — isolated trace cannot locate
- LLM not traced — multi-step workflow black box
- Multi-provider not traced — switch path not visible
- RAG not traced — retrieve / rerank / generate slow points unclear
- Agent not traced — agent loop black box
- Baggage carries PII — privacy leak
- Trace retention too short — trace gone during retrospective
- No drill, relying on real failure to verify — only real failure tells whether trace is complete
