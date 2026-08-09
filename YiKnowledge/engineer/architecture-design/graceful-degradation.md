---
title: Graceful degradation pattern / Graceful degradation pattern
aliases: [graceful-degradation-pattern, degradation-pattern, fallback-strategy-pattern]
tags: [methodology, engineering-patterns, graceful-degradation, fallback, resilience, partial-availability]
category: engineer/architecture-design
created: 2026-08-03
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
tacit: Degradation is not abandoning features; it is partial availability + fallback + user experience first; preserve core + degrade edge; no blank pages; no silent failures
roles: [engineer, tech-lead, oncall-sre]
benefit: "Systems stay available during failures by degrading non-critical features instead of failing completely"
acceptance_criteria:
  - "pattern name, problem statement, and solution approach are all described"
  - "trade-offs and when-not-to-use-this-pattern are explicitly stated"
  - at least one concrete example or code snippet is provided
related:
- ./circuit-breaker.md
  - ../../oncall-sre/incident-response/respond-to-an-incident.md
  - ../../oncall-sre/observability/set-up-observability.md
  - ../../tech-lead/roadmap/define-an-slo.md
  - ../../oncall-sre/incident-response/do-a-rollback-drill.md
  - ../lessons/win-yiai-llm-phase-five.md
  - ../lessons/win-yiai-knowledge-watcher.md
---

# Graceful degradation pattern

> **As an** engineer, **I want to** graceful degradation, **so that** pattern applied consistently.

## Summary

- Degradation is partial availability; not abandoning features
- Core + edge tiering: preserve core / degrade edge
- Fallback responses: cache / default / partial response / async
- No blank pages; no silent failures
- Degradation triggers: error rate / latency / resources / dependency failure
- Degradation is reversible: auto-recovers on restoration
- Degradation is observable: trigger rate / fallback hit rate
- User experience first; not internal completeness

## Applicable scenarios

Downstream failure / resource strain / traffic spike / LLM unavailable / cache breakdown / third-party API rate limiting / incident response / any "they're down, I'm still usable" scenario; user experience first.

## Core points

### 1. Core + edge tiering

No tiering = all down; tiering = partial available.

- **Core features**: must preserve; cannot degrade
- **Edge features**: can degrade; not fatal
- **Critical path**: login / payment / core business
- **Non-critical path**: recommendations / personalization / decoration

### 2. Fallback responses

No blank pages; no silent failures; must fall back.

- **Cache fallback**: last successful result
- **Default response**: default value / default config
- **Partial response**: return what can be returned
- **Async queue**: write deferred
- **Static fallback**: static page / maintenance page

### 3. Degradation triggers

Not manual; auto-triggered.

- **Error rate**: error rate > threshold
- **Latency**: p99 > threshold
- **Resources**: CPU / memory / connection saturation
- **Dependency failure**: downstream circuit open / timeout
- **Rate limiting**: 429 triggers degradation

### 4. No blank pages

User experience first; no blank pages.

- Blank page = worst user experience
- Must return fallback; not empty
- Error page + retry entry
- Partial feature + tip
- No silent failures

### 5. Degradation is reversible

Auto-recovers on restoration; not permanently degraded.

- Trigger conditions disappear -> auto recover
- Half-open probe (linked with circuit breaker)
- No manual intervention
- Degradation + circuit breaker + recovery three-piece set

### 6. Degradation dimensions

Independent degradation per dimension; not mixed.

- **Feature dimension**: feature A degrades, B doesn't
- **User dimension**: paid users no degrade / free users degrade
- **Region dimension**: core regions no degrade
- **Device dimension**: PC no degrade / mobile degrade
- **Time dimension**: peak degrade / off-peak no degrade

### 7. Degradation levels

Tiered degradation; not one-size-fits-all.

| Level | Trigger | Action |
|---|---|---|
| L1 | Single-point failure | Cache fallback |
| L2 | Multi-point failure | Partial feature degrade |
| L3 | Resource saturation | Non-core off |
| L4 | Global failure | Static page + maintenance page |

### 8. Degradation plan upfront

Before publishing, must have a degradation plan; no plan = risk.

- Every feature must tag a degradation strategy
- Degradation plan in design phase
- Feature flag linked
- No after-the-fact remediation

### 9. Degradation + feature flag linkage

Feature flag guards; one line disables a feature.

- Degradation = turn off feature flag
- Feature flag controlled
- Kill switch for incidents
- No restart needed to adjust

### 10. Degradation + circuit breaker + rate limiting

Three-piece linkage; not isolated.

- **Circuit breaker**: downstream failure
- **Rate limiting**: traffic spike
- **Degradation**: fallback response
- All three linked; not partial

### 11. Observable

Degradation must be monitored; not blind.

- Degradation trigger rate
- Fallback hit rate
- Degradation duration
- Recovery time
- Degradation alerts (exception growth)
- User experience metrics (error rate / completion rate)

### 12. LLM degradation

LLM application degradation; special scenario.

- LLM unavailable: cache / simplified prompt / smaller model
- Partial output: stream continue; no blank
- Switch provider: multi-provider fallback
- Rate limiting: 429 goes to degradation
- Cost: degradation avoids overspend
- Quality: degradation also guards faithfulness baseline

## Anti-patterns

- **Blank page**: failure returns blank -> worst UX -> must fall back
- **Silent failure**: failure not notified -> user confused -> must tip
- **One-size-fits-all**: degrade everything -> collateral damage -> must tier
- **Irreversible**: degradation doesn't recover -> permanent degrade -> must be reversible
- **No plan**: after-the-fact remediation -> scrambling -> must be upfront
- **No monitoring**: degradation not monitored -> unknown triggers -> must be observable
- **Core also degrades**: core features degrading -> business stops -> must preserve core
- **LLM blank**: LLM failure returns blank -> user gets no response -> must cache + simplify + switch provider
- **Degradation not linked**: degradation not linked with circuit breaker/rate limiting -> each fights alone -> must be three-piece set

## Co-build

- journeys: [respond-to-an-incident](../../oncall-sre/incident-response/respond-to-an-incident.md) + [scale-a-service](../engineering/scale-a-service.md) + [set-up-observability](../../oncall-sre/observability/set-up-observability.md) + [define-an-slo](../../tech-lead/roadmap/define-an-slo.md) + [prepare-a-disaster-recovery-plan](../../knowledge-curator/archive/strategies-legacy/oncall-sre/prepare-a-disaster-recovery-plan.md) + [do-a-rollback-drill](../../oncall-sre/incident-response/do-a-rollback-drill.md)
- landing win: [yiai-llm-phase-five-win](../lessons/win-yiai-llm-phase-five.md) + [yiai-knowledge-watcher-win](../lessons/win-yiai-knowledge-watcher.md)
- companion pattern: [circuit-breaker-pattern](./circuit-breaker.md) + [rate-limiting-pattern](../engineering/rate-limiting.md) + [retry-with-backoff-pattern](../infrastructure/retry-with-backoff.md) + [observability-pattern](../engineering/observability.md) + [feature-flag-pattern](../infrastructure/feature-flag.md) + [idempotency-pattern](../infrastructure/idempotency.md)
