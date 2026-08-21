---
title: Define an SLO
aliases: [slo, sli, sla, service-level, reliability]
tags: [roadmap, slo, reliability, monitoring, leader]
category: leader/roadmap
created: 2026-08-18
updated: 2026-08-18
last_verified: 2026-08-18
source: internal
type: summary
lifecycle: reference
status: stable
review_cycle: quarterly
roles: [leader]
benefit: "Define Service Level Objectives (SLOs) with clear SLIs, targets, and error budgets to balance reliability against feature velocity"
related:
  - ./manage-tech-debt.md
  - ./plan-tech-roadmap.md
  - ../risk/README.md
  - ../README.md
  - ../INDEX.md
---

# Define an SLO

> **As a** tech lead, **I want to** define Service Level Objectives (SLOs) for my services, **so that** the team has a data-driven reliability target and can make informed trade-offs between reliability and feature velocity.

## Definition

| Term | Definition | Example |
|---|---|---|
| **SLI** (Service Level Indicator) | A measured metric of service behavior | "Request latency at p99" |
| **SLO** (Service Level Objective) | A target for an SLI over a time window | "p99 latency < 200ms over 28 days" |
| **SLA** (Service Level Agreement) | A contractual promise with consequences | "p99 latency < 200ms or 10% credit" |
| **Error Budget** | The amount of allowed unreliability | "99.9% availability = 43 minutes of allowed downtime per month" |

SLIs are what you measure. SLOs are what you target. SLAs are what you promise (and usually more lenient than SLOs).

## Trigger condition

- New service going to production
- Existing service without SLOs
- Customer-facing reliability issues or complaints
- Setting up a new on-call rotation
- Quarterly reliability review

## Step-by-step walkthrough

### Step 1: Identify what matters to users

Don't measure everything. Pick 2–4 SLIs that capture the user experience:

| SLI category | Example metric | Why it matters |
|---|---|---|
| **Availability** | Proportion of requests that succeed | Users can't use a service that's down |
| **Latency** | p95 or p99 request duration | Slow = frustrating; users leave |
| **Throughput** | Requests per second | Capacity planning |
| **Error rate** | Proportion of requests that fail | Direct measure of user-facing errors |
| **Freshness** | Data staleness (time since last update) | Matters for data pipelines and search |
| **Durability** | Proportion of data retained | Matters for storage services |

### Step 2: Define the SLI in detail

An SLI is a formula, not a name:

| Component | Example |
|---|---|
| **Metric** | HTTP request latency |
| **Filter** | For `/api/*` endpoints, excluding `/api/health` |
| **Aggregation** | p99 over a 1-minute window |
| **Measurement** | Server-side load balancer logs |

```
SLI = count of "good" events / count of all valid events
     = count(req.latency < 200ms) / count(all /api/* requests)
```

### Step 3: Set the SLO target

| Consideration | Guidance |
|---|---|
| **User expectations** | What latency do users notice? (<100ms = instant, <1s = fast, <10s = annoying) |
| **Current performance** | Is the target achievable? If current p99 is 500ms, don't set SLO at 100ms |
| **Dependencies** | If your service depends on another with 99.9% availability, you can't promise 99.99% |
| **Criticality** | Revenue-critical services get tighter SLOs than internal tools |

Example SLO:
```
SLO: 99.9% of /api/* requests complete in < 200ms over a 28-day rolling window
Error budget: 0.1% of requests = ~43 minutes of degraded service per 28 days
```

### Step 4: Choose the measurement window

| Window | Pros | Cons |
|---|---|---|
| **7 days** | Fast feedback; quick to burn/regain budget | Sensitive to short incidents |
| **28 days** | Smooths out weekly patterns; standard choice | Slower to recover budget |
| **90 days** | Very stable | Budget changes too slowly to be actionable |

Standard choice: 28-day rolling window.

### Step 5: Define the error budget policy

The error budget is your decision-making tool:

| Budget remaining | Action |
|---|---|
| **> 50%** | Normal operation. Ship features freely. |
| **25–50%** | Caution. Review recent changes. Increase testing rigor. |
| **10–25%** | Pause features. Focus on reliability improvements. |
| **< 10%** | Emergency. All hands on reliability. No feature work until budget recovers. |

### Step 6: Instrument and alert

| Alert type | Burn rate | Notification |
|---|---|---|
| **Slow burn** | Budget is draining steadily | Ticket to the team; review in next sprint planning |
| **Fast burn** | 2% of budget consumed in 1 hour | Page on-call; investigate immediately |
| **Budget exhausted** | Error budget is 0 | Escalate to leadership; reliability-only work |

Burn rate formula:
```
Burn rate = (error rate / error budget) × alert window
Fast burn alert: burn rate > 10 in a 1-hour window
Slow burn alert: burn rate > 1 in a 6-hour window
```

## Key outputs

- SLI definitions (2–4 per service)
- SLO targets with measurement windows
- Error budget calculation and policy
- Alerting rules (fast burn and slow burn)
- Dashboard showing SLO compliance and budget remaining

## Anti-patterns

| Anti-pattern | Why it fails | Fix |
|---|---|---|
| 100% availability SLO | Impossible to achieve; error budget is meaningless | Start with 99.9%; tighten only when consistently exceeding it |
| Too many SLIs | 10 SLIs means no SLI gets attention | 2–4 per service; pick the ones users care about |
| SLOs without error budgets | No mechanism to make reliability vs. velocity trade-offs | Define the error budget policy; enforce it |
| Alerting on SLO breaches instead of burn rate | By the time SLO is breached, it's too late | Alert on burn rate, not on SLO threshold crossing |
| SLOs that don't match user experience | Server-side latency is great, but client-side is terrible | Measure from the user's perspective whenever possible |

## This product's landing instance

*To be filled in with the current SLOs for each service. Include the SLI definitions, SLO targets, error budget policies, and links to the SLO dashboards.*