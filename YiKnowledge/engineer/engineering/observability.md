---
title: Observability pattern
aliases:
- observability-pattern
- o11y-pattern
- telemetry-pattern
tags:
- methodology
- engineering-patterns
- observability
- logging
- metrics
- tracing
- slo
- oncall
category: engineer/engineering
created: 2026-08-03
updated: 2026-08-03
source: internal
type: pattern
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-03
tacit: Observability is not just logs; it is the log+metric+trace three pillars + SLO + error budget + alerts must be actionable;
  alerts come with runbooks; LLM observability supplements four items: token/latency/cost/quality
roles:
- engineer
- tech-lead
- oncall-sre
benefit: pattern applied consistently
acceptance_criteria:
  - "pattern name, problem statement, and solution approach are all described"
  - "trade-offs and when-not-to-use-this-pattern are explicitly stated"
  - "at least one concrete example or code snippet is provided"
related:
- ./evaluation-driven-development.md
- ./contract-test-baseline.md
- ./feature-flag.md
- ./dual-world-boundary.md
- ./harden-supply-chain.md
- ../../tech-lead/roadmap/define-an-slo.md
- ../../oncall-sre/observability/set-up-observability.md
- ../../oncall-sre/incident-response/respond-to-an-incident.md
- ../../oncall-sre/incident-response/prepare-a-disaster-recovery-plan.md
- ../lessons/wins/yiai-llm-phase-five.md
- ../lessons/wins/yivad-vitest-phase-four.md
- ../lessons/wins/yipet-aicr-phase-five.md
---

# Observability pattern

> **As an** engineer, **I want to** observability, **so that** pattern applied consistently. 

## Summary

- Three pillars unified: log + metric + trace; do not neglect any
- SLI -> SLO -> error budget -> burn-rate alerts; goal-driven
- Alerts must be actionable: come with runbooks; non-actionable alerts cleaned up
- Observe four golden signals: latency / errors / traffic / saturation
- LLM observability supplements four items: token / latency / cost / quality
- Oncall rotation: weekly + handover + manual + no alert fatigue

## Applicable scenarios

Any online service; incident response; performance tuning; capacity planning; LLM application quality monitoring; SLO landing; oncall system construction; incident retrospective; release cadence driven by error budget. 

## Core points

### 1. Three pillars unified

log / metric / trace three pillars; do not neglect; do not confuse. 

- **log**: discrete events; structured JSON; severity tiered; sample high QPS
- **metric**: aggregate numbers; time series; low-cost low-latency; main alert source
- **trace**: request chain; cross-service; span / parent / child; sampled

Three pillars are related: trace_id runs through log + metric + trace; one-click jump. 

### 2. Golden signals

Four signals to observe service health. 

- **latency**: p50 / p90 / p99; not averages
- **errors**: error rate / normalized error codes
- **traffic**: QPS / request count
- **saturation**: CPU / memory / connections / queue length

### 3. SLI -> SLO -> error budget

Goal-driven; not piling up metrics. 

```
SLI (metric) -> SLO (target) -> error budget (budget) -> burn-rate alerts
```

- SLI chosen closest to user perception
- SLO goals tiered by business criticality
- error budget = 100% - SLO
- Budget exhausted freezes releases
- Burn-rate multi-window alerts 1h / 6h / 24h / 72h

See [define-an-slo](../../tech-lead/roadmap/define-an-slo.md). 

### 4. Alerts must be actionable

Non-actionable alerts cleaned up; alerts come with runbooks. 

- Alert = someone must act
- Each alert has a runbook link
- Alert tiers P0/P1/P2/P3
- Duplicate alerts merged
- Thresholds periodically reviewed
- No alert fatigue

### 5. Structured logs

Structured JSON; not string concatenation. 

- Structured JSON logs
- Must include trace_id / request_id / user_id
- Severity tiers DEBUG/INFO/WARN/ERROR
- High QPS sampling
- PII desensitization
- Centralized collection + retention cadence

### 6. Metric tiers

Business metrics / service metrics / resource metrics tiered. 

- Business metrics: orders / registrations / conversions
- Service metrics: QPS / latency / error rate
- Resource metrics: CPU / memory / disk / network
- Three tiers related; do not neglect any

### 7. Trace cross-service

trace_id runs through; cross-service chain. 

- trace_id injected into HTTP headers
- span / parent / child
- Sampling strategy (head / tail)
- Cross-service propagation
- Slow chain analysis

### 8. LLM observability supplements four items

LLM applications supplement four observation dimensions. 

- **token usage**: prompt / completion / total; by provider
- **latency**: first token latency + full latency; p50/p99
- **cost**: billed by token; by user / by scenario
- **quality**: eval set regression; faithfulness / relevancy / recall
- Don't only look at latency; quality is the baseline

### 9. Oncall system construction

Oncall without all-nighters; rotation + handover + manual. 

- Weekly rotation; primary and backup
- Handover ritual; explicit handover
- Oncall manual; every alert has a runbook
- Post-incident retrospective; actions landed
- No alert fatigue
- Off-hours alerts P0/P1 only

### 10. Incident retrospective drives improvement

Incident -> retrospective -> action -> landing; no blame. 

- Blameless retrospective
- Root cause 5 why
- Systemic improvements not aimed at individuals
- Actions tracked to closure
- Incident classification P0/P1/P2/P3
- Incident rollback plans in place beforehand

## Anti-patterns

- **Only piling up logs**: only write logs, no metrics -> slow queries and alert latency -> must have metrics + logs
- **Alert bombing**: alerts not tiered or merged -> fatigue -> must have actionable alerts + runbooks
- **SLO formalization**: SLO set but not reviewed -> does not drive release cadence -> must be error-budget driven
- **trace_id not running through**: trace_id not in logs -> hard to correlate -> must run trace_id through
- **LLM only watching latency**: LLM only watches latency not quality -> quality regression undetected -> supplement eval set
- **Oncall without manual**: oncall without runbook -> scrambling during incidents -> must have runbook + handover
- **PII in logs**: logs not desensitized -> compliance risk -> must desensitize PII
- **Metrics not tiered**: business / service / resource mixed -> can't grasp root cause -> must tier
- **Alert thresholds not reviewed**: thresholds set but not tuned -> drift invalidates them -> must periodically review

## Co-build

- journeys: [define-an-slo](../../tech-lead/roadmap/define-an-slo.md) + [set-up-observability](../../oncall-sre/observability/set-up-observability.md) + [respond-to-an-incident](../../oncall-sre/incident-response/respond-to-an-incident.md) + [prepare-a-disaster-recovery-plan](../../knowledge-curator/archive/strategies-legacy/oncall-sre/prepare-a-disaster-recovery-plan.md) + [handle-an-outage-communication](./../../oncall-sre/incident-response/handle-a-cache-invalidation.md)
- landing win: [yiai-llm-phase-five-win](../lessons/win-yiai-llm-phase-five.md) + [yivad-vitest-phase-four-win](../lessons/win-yivad-vitest-phase-four.md) + [yipet-aicr-phase-five-win](../lessons/win-yipet-aicr-phase-five.md)
- Companion patterns: [evaluation-driven-development-pattern](./evaluation-driven-development.md) + [contract-test-baseline-pattern](../quality-security/contract-test-baseline.md) + [feature-flag-pattern](../infrastructure/feature-flag.md) + [dual-world-boundary-pattern](./dual-world-boundary.md) + [supply-chain-hardening-pattern](../process/harden-supply-chain.md)
