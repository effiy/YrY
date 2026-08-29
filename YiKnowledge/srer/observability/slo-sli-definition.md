---
title: SLO/SLI Definition Guide
aliases: [slo-guide, sli-definition, service-level-objectives]
tags: [sre, observability, slo, sli, error-budget, reliability]
category: srer/observability
created: 2026-08-24
updated: 2026-08-24
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [srer, engineer, leader]
benefit: "Teams define meaningful SLOs and SLIs that drive reliability decisions, not just vanity metrics"
acceptance_criteria:
  - "explains SLI, SLO, and SLA with clear examples"
  - "provides a step-by-step process for defining SLOs"
  - "covers error budget policy and burn rate alerts"
related:
  - ./set-up-observability.md
  - ./README.md
  - ../incident-response/respond-to-an-incident.md
---

# SLO/SLI Definition Guide

> **When to use:** When setting up observability for a new service or reviewing existing reliability targets. SLOs are the bridge between engineering work and user experience.

## Core Concepts

| Term | Definition | Example |
|---|---|---|
| **SLI** (Service Level Indicator) | A quantitative measure of some aspect of the service | Request latency, error rate, uptime |
| **SLO** (Service Level Objective) | A target value for an SLI over a time window | 99.9% of requests complete in < 300ms over 30 days |
| **SLA** (Service Level Agreement) | A contractual promise with consequences for violation | 99.95% uptime, or service credits issued |
| **Error Budget** | The amount of unreliability allowed by the SLO | 0.1% error budget = 43 min of downtime per 30 days |

## The SLI Menu

> Start with these four golden signals. Don't create custom SLIs until you've mastered these.

| SLI Category | What to measure | Good for |
|---|---|---|
| **Latency** | P50, P95, P99 of request duration | User-facing APIs, database queries |
| **Availability** | Fraction of requests that succeed (non-5xx) | Any HTTP service |
| **Throughput** | Requests per second | Capacity planning, autoscaling |
| **Error Rate** | Fraction of requests that fail (5xx) | Reliability tracking |

### Choosing the right latency percentile

| Percentile | Use case |
|---|---|
| P50 | Typical user experience |
| P95 | Most users, including slow ones |
| P99 | The worst reasonable experience — your SLO should target this |

## Step-by-step SLO definition

### 1. Identify the critical user journey

What is the one thing your service MUST do for users? Everything else is secondary.

**Example:** For YiAi chat service → "User sends a message and receives a streaming response."

### 2. Pick 1-3 SLIs for that journey

| SLI | Measurement | Why |
|---|---|---|
| Availability | `rate(5xx) / rate(all)` | Is the service up? |
| Latency | `histogram_quantile(0.99, request_duration_seconds)` | Is it fast enough? |

### 3. Set the SLO target

Start conservative, tighten over time. A good starting SLO:

- **Availability:** 99.9% (43 min downtime/month)
- **Latency P99:** < 500ms for API, < 2s for chat/streaming

### 4. Define the measurement window

| Window | Use case |
|---|---|
| 30 days | Standard rolling window for most services |
| 7 days | Fast-iteration services, early-stage products |
| 90 days | Mature, stable services with strict compliance |

### 5. Define the error budget policy

> What happens when the error budget is consumed?

| Error budget remaining | Action |
|---|---|
| > 50% | Normal operation — feature work continues |
| 50% — 20% | Caution — prioritize reliability over features |
| < 20% | Freeze feature launches until budget recovers |
| 0% (burned) | All hands on reliability; no feature work |

### 6. Set up burn rate alerts

| Burn rate | Alert after | Meaning |
|---|---|---|
| 14.4x | 1 hour | Critical: will burn entire budget in 1 hour |
| 6x | 6 hours | Warning: will burn entire budget in 6 hours |
| 1x | 3 days | Info: on track to exhaust budget by end of window |

## Example: YiAi Chat Service SLO

```yaml
service: yi-ai-chat
slos:
  - sli: availability
    target: 99.9%
    window: 30d
    measurement: rate(5xx) / rate(all_requests)
    
  - sli: latency_p99
    target: 2000ms
    window: 30d
    measurement: histogram_quantile(0.99, chat_request_duration_ms)
    
  - sli: sse_first_byte_p99
    target: 500ms
    window: 30d
    measurement: histogram_quantile(0.99, sse_first_byte_ms)

error_budget_policy:
  burn_rate_alerts:
    - rate: 14.4x
      severity: critical
      channel: "#on-call"
    - rate: 6x
      severity: warning
      channel: "#sre-alerts"
```

## Anti-patterns

| Anti-pattern | Why it fails | What to do instead |
|---|---|---|
| Too many SLIs (>5 per service) | Alert fatigue; team can't focus on what matters | 1-3 SLIs per service, focused on the critical user journey |
| 100% SLO target | Impossible to achieve; error budget is always zero | Start at 99.9%, tighten only when you consistently meet it |
| SLOs without error budget policy | SLO is just a dashboard number; no action is triggered | Define what happens at each error budget threshold |
| Copying SLOs from another service | Different services have different user expectations | Define SLOs based on YOUR critical user journey |