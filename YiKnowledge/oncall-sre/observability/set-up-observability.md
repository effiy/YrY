---
title: Set up observability
aliases:
- I want to build observability
- observability-journey
- Monitoring alert entry
- logging/metrics/tracing entry
tags:
- journeys
- observability
- monitoring
- alerting
- logging
- metrics
- tracing
- SLO
category: oncall-sre/observability
created: 2026-08-03
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
roles:
- oncall-sre
- engineer
benefit: baseline is reproducible
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ../incident-response/respond-to-an-incident.md
- ../../tech-lead/roadmap/plan-tech-roadmap.md
- ../../engineer/process/monitoring-governance.md
- ../../ai-engineer/platform/llm-observability-comparison.md
review_cycle: quarterly
tacit: false
last_verified: 2026-08-07
---

# I want to set up observability

> **As a** oncall sre, **I want to** set up observability, **so that** baseline is reproducible. 

> "How to build Monitoring / alerts / logs / metrics / tracing / SLO + how to govern noisy alerts" reach within 2 hops: monitoring-governance + triad logging/metrics/tracing + SLO + LLM observability. 

## Summary

- Monitoring Governance via [monitoring-governance-process.md](../../engineer/process/monitoring-governance.md): alerts must be actionable + no noise
- Triad via logging / metrics / tracing co-build: logs to look up root cause + metrics to see trends + trace to reconstruct the chain
- SLO via error budget + burn rate alerts: user perspective rather than system perspective
- LLM observability via [llm-observability-comparison-summary.md](../../ai-engineer/platform/llm-observability-comparison.md): recall rate / faithfulness / error rate / latency

## Core viewpoints

**Observability is not about having more dashboards; it is about being able to answer questions you did not anticipate.**
A monitoring system that shows you CPU, memory, and QPS is a monitoring system. An observability system lets you ask: "why did this specific user's request fail?" without having pre-built a dashboard for that question. The difference is the richness of the telemetry data: structured logs, high-cardinality metrics, and distributed traces that capture the full request path. If you can only answer questions you thought of before the incident, you have monitoring, not observability.

**The three pillars (logs, metrics, traces) are not independent; they must be correlated.**
Logs without trace IDs are isolated events. Metrics without log context are numbers without stories. Traces without metrics are maps without traffic data. The value of observability comes from the correlation between the three pillars. Every log line should carry a trace ID. Every trace span should emit metrics. Every metric anomaly should be drillable into the logs and traces that produced it. If the pillars are siloed, the observability system is three separate monitoring systems.

**Alerts are the most expensive part of observability.**
Every alert has a cost: the cognitive load on the oncall, the context-switching cost of investigating, and the long-term cost of alert fatigue. An alert that fires and does not require action is not a wasted alert; it is a liability that erodes trust in the entire observability system. The alerting philosophy must be: every alert is actionable, every alert has a runbook, and every alert that proves to be non-actionable is removed or tuned within one sprint.

**Observability must be built in, not bolted on.**
Adding observability after a system is in production is like installing a fire alarm after the building is on fire. The instrumentation must be part of the development process: every new endpoint includes structured logging, every new service includes trace propagation, and every new feature includes SLO definitions. The question in code review is not "does this work?" but "can we observe this working?" If the answer is no, the feature is not ready for production.

## Key info

- **Observability triad**: Logs (timestamped, unstructured or structured, write-once, good for debugging specific requests), Metrics (numeric, aggregated, time-series, good for trends and alerting), Traces (directed acyclic graph of spans, good for understanding request paths across services). The cost hierarchy: metrics are cheapest (fixed size per time series), logs are medium (grow with traffic), traces are most expensive (grow with traffic × service depth). The sampling strategy: 100% of metrics, 100% of error logs, 1-10% of traces (adjust based on budget).
- **SLO math**: SLI (Service Level Indicator) = the measured value, e.g., `successful_requests / total_requests`. SLO (Service Level Objective) = the target, e.g., `99.9% over 30 days`. Error budget = `1 - SLO` = `0.1%` of requests can fail. Burn rate = how fast the error budget is being consumed. A burn rate of 10x means the 30-day error budget will be exhausted in 3 days. Alert when: burn rate > 14.4x (budget consumed in 1 hour, critical) or burn rate > 1x (budget consumed in 30 days, warning). The key insight: error budgets make risk measurable -- if you haven't exhausted the budget, you can deploy; if you have, you must freeze.
- **OpenTelemetry standard**: the CNCF standard for observability instrumentation. Three components: API (language-specific interfaces for traces/metrics/logs), SDK (language-specific implementations), Collector (vendor-neutral receiver/processor/exporter). The key benefit: instrument once with OTel, export to any backend (Jaeger, Grafana, Datadog, etc.). The Yi family currently has zero OTel instrumentation; adding it to YiAi's FastAPI routes would be the highest-ROI observability improvement (automatic trace propagation across RPC calls).
- **Alerting maturity model**: Level 1 (no alerts, users report issues), Level 2 (threshold alerts on CPU/memory/disk, high noise), Level 3 (SLO-based alerts with burn rate, actionable), Level 4 (predictive alerts, anomaly detection, auto-remediation). The Yi family is at Level 1-2. The jump to Level 3 requires: defined SLOs for each service, SLI measurement in the monitoring system, and burn rate alert configuration. This is a 2-week project for a single service.
- **Dashboard design principles**: (1) RED metrics for every service (Rate, Errors, Duration -- the "golden signals"), (2) USE metrics for every resource (Utilization, Saturation, Errors), (3) the "four golden signals" from Google SRE: latency, traffic, errors, saturation. A dashboard with 50 charts is not useful; a dashboard with 4 charts that tell you whether the service is healthy is. The first chart an oncall looks at during an incident is the one that matters; design from that chart backward.

## Scenario description

When launching a new system / Monitoring missing / alerts noisy / incidents frequent / LLM application observability missing, engineers + oncall + architects need to build logging + metrics + tracing + SLO + alert governance. This entry aggregates monitoring-governance, triad, SLO, LLM observability into a 2-hop path, avoiding "no Monitoring / noisy alerts / no logs to look up after incident / LLM black box". 

## 2-hop reachability path

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [monitoring-governance-process.md](../../engineer/process/monitoring-governance.md) · [incident-response-process.md](../../engineer/process/incident-response.md) · [oncall-rotation-process.md](../../engineer/process/oncall-rotation.md) · [chaos-engineering-process.md](../../engineer/quality-security/chaos-engineering.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) |
| `tech/ai-platform/` | [llm-observability-comparison-summary.md](../../ai-engineer/platform/llm-observability-comparison.md) — LLM-specific observability + [llm-comparison-summary.md](../../ai-engineer/platform/llm-comparison.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) — capacity / tech debt related |
| `methodology/engineering-patterns/` | [sse-streaming-pattern.md](../../engineer/architecture-design/sse-streaming.md) · [evaluation-driven-development-pattern.md](../../engineer/engineering/evaluation-driven-development.md) · [rpc-envelope-pattern.md](../../engineer/architecture-design/rpc-envelope.md) — streaming / evaluation / envelope co-build |
| `methodology/thinking/` | [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) — Monitoring decision thinking frameworks |
| `lessons/failures/` | [incident-postmortem-summary.md](../../engineer/lessons/failure-incident-postmortem.md) · [bugs/](../../engineer/lessons) — incident root cause reference |
| `lessons/gotchas/` | [macos-fsevents-silent-drop.md](../../engineer/lessons/gotcha-macos-fsevents-silent-drop.md) · [sse-ondone-guard.md](../../engineer/lessons/gotcha-sse-ondone-guard.md) — Monitoring pitfalls |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) — business metric alignment |
| `projects/` | each project `architecture-summary.md` §Monitoring + `dev-standards-summary.md` §log standard |
| `journeys/` | [../incident-response/respond-to-an-incident.md](../incident-response/respond-to-an-incident.md) — incident response + [../../tech-lead/roadmap/plan-tech-roadmap.md](../../tech-lead/roadmap/plan-tech-roadmap.md) — roadmap |

## Action recommendations

1. **Triad co-build**: logs (look up root cause) + metrics (see trend) + trace (reconstruct chain) ; do not build in isolation. 
2. **SLO rather than SLA**: SLO user perspective (success rate / latency P95 / availability) ; error budget burn rate alerts. 
3. **Alerts must be actionable**: each alert has a runbook + oncall knows how to handle; no noisy alerts — see [monitoring-governance-process](../../engineer/process/monitoring-governance.md). 
4. **Full trace on key chains**: RPC envelope + SSE streaming + RAG pipeline + LLM call trace fully sampled; no missing key nodes. 
5. **Metric classification**: business metric (North Star) → service metric (SLO) → resource metric (CPU / GPU / memory / storage / QPS) ; each level corresponds to different alert thresholds. 
6. **LLM observability**: Monitor recall rate / faithfulness / error rate / latency + user feedback closed loop — see [llm-observability-comparison](../../ai-engineer/platform/llm-observability-comparison.md). 
7. **Incident root cause reference**: scan [lessons/failures/bugs](../../engineer/lessons) + [incident-postmortem](../../engineer/lessons/failure-incident-postmortem.md) to avoid repeating mistakes. 
8. **Thinking frameworks**: [inversion](../../knowledge-curator/templates/thinking/inversion.md) "how to make Monitoring invalid" reverse-reasoning + [second-order-thinking](../../knowledge-curator/templates/thinking/second-order-thinking.md) (alert second-order effects) + [ockhams-razor](../../knowledge-curator/templates/thinking/ockhams-razor.md) (do not add alerts unnecessarily).
9. **Chaos engineering**: quarterly run [chaos-engineering-process](../../engineer/quality-security/chaos-engineering.md) to validate Monitoring effectiveness. 
10. **Oncall rotation**: follow [oncall-rotation-process](../../engineer/process/oncall-rotation.md); handoff shift must hand off current alert status. 

## Anti-patterns

- **Building dashboards before defining SLOs.** The most common observability mistake is building a Grafana dashboard with every metric the system emits before defining what "good" looks like from the user's perspective. The SLO must come first: what is the acceptable error rate, latency, and availability for the user? Then build dashboards that directly measure the SLO and the error budget burn rate. A dashboard that shows 50 metrics but does not tell you whether the user is having a good experience is a distraction.

- **Setting alerts on every metric without triaging by severity.** The default behavior of many teams is to set an alert on every metric that exceeds a threshold. This produces a flood of P3 alerts that nobody investigates. The alerting must be tiered: P0 alerts for SLO breach (wake someone up), P1 alerts for error budget burn rate approaching critical (investigate within 30 minutes), P2 alerts for anomalies (investigate within business hours). P3 alerts should be dashboards, not pages. If an alert does not require a human to act, it should not be an alert.

- **Treating logs as an afterthought.** "Just log everything and we will figure it out later" is a recipe for an unsearchable, expensive, and useless log store. Logs must be structured (JSON), must include a defined set of fields (trace ID, user ID, request ID, service name), and must have a retention policy that balances cost and utility. Logs that are not structured are not queryable. Logs that are queryable but have no retention policy will eventually cost more than the rest of the infrastructure combined.

- **Skipping distributed tracing because "it is too complex to set up."** Distributed tracing is the hardest part of observability to implement, which is why it is the most valuable. Without tracing, you cannot answer the most common incident question: "which service in the chain caused the failure?" The investment in tracing infrastructure pays for itself in the first incident where it reduces time-to-diagnosis from hours to minutes. Start with the critical paths and expand from there.

- **Measuring system health instead of user experience.** CPU is at 90% and the system is fine. CPU is at 30% and every user is seeing 5xx errors. System metrics are leading indicators at best. The gold standard is user-facing metrics: error rate, latency at the user's device, and availability as measured by a probe that mimics real user behavior. If the observability system only measures infrastructure health, it will miss the incidents that matter most to users.

## Related

- Related journey: [../incident-response/respond-to-an-incident.md](../incident-response/respond-to-an-incident.md) — incident response
- Related journey: [../../tech-lead/roadmap/plan-tech-roadmap.md](../../tech-lead/roadmap/plan-tech-roadmap.md) — roadmap + capacity planning
- Related journey: [../../engineer/process/diagnose-org-productivity.md](../../engineer/process/diagnose-org-productivity.md) — engineering productivity metrics
- Upstream: [../../knowledge-curator/governance/governance.md](../../knowledge-curator/governance/governance.md) — quarterly audit of Monitoring
