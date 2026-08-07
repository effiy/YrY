---
title: architecture health dashboard
aliases:
- architecture dashboard
- tech debt dashboard
- service architecture dashboard
- system design dashboard
tags:
- dashboard
- architecture
- tech-debt
- service-design
- coupling
- cohesion
category: engineer/architecture-design
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: dashboard
status: stable
lifecycle: active
review_cycle: quarterly
roles:
- engineer
- tech-lead
- architect
benefit: architecture health and technical debt visible at a glance
acceptance_criteria:
  - "data source and refresh cadence are documented"
  - "key metrics are defined with thresholds or targets"
  - "visualization choices are explained and accessible"
related:
- ../../tech-lead/architecture/architecture-review.md
- ../../tech-lead/decisions/
- ../infrastructure/dashboard-dora-metrics.md
- ../quality-security/dashboard-quality-metrics.md
tacit: false
---

# architecture health dashboard

> **As a** tech lead, **I want to** track architecture health and technical debt across all services, **so that** architectural erosion is detected before it becomes a rewrite-level problem.

> Architecture health is a leading indicator of long-term delivery speed. This dashboard tracks service coupling, cohesion, tech debt accumulation, ADR compliance, and modularity.

## Summary

- 5 architecture dimensions: service coupling and cohesion, technical debt, architecture decision compliance, modularity and boundaries, dependency health
- Coupling measured via import graphs, API fan-out, and shared-nothing violations
- Technical debt tracked as estimated remediation cost in engineering-days with interest rate calculations
- ADR compliance tracked per service; architecture decisions with sunset dates
- Dashboard reviewed quarterly at architecture review; tech debt trends monthly

## Core viewpoints

- Architecture is not what you draw — it's what the code actually does; measure runtime coupling, not diagram coupling
- Technical debt has an interest rate — the longer you wait, the more it costs to fix; quantify the interest
- Every service boundary is a bet — boundaries that are violated in practice are wrong boundaries
- ADRs without compliance checks are wishful thinking — measure whether the code follows the decision

## Key information

### 5-panel architecture overview

```
┌──────────────────────────────────────────────────────────────────┐
│  SERVICE COUPLING & COHESION     │  TECHNICAL DEBT                │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Afferent:   12 avg      │   │  │  Total:    42 days      │   │
│  │  Efferent:   8 avg       │   │  │  Critical: 8 days       │   │
│  │  Instability: 0.6        │   │  │  Interest:  2.1%/month  │   │
│  │  Cohesion:   0.72        │   │  │  Repayment: 12 days/Q   │   │
│  │  Cycle:      0 detected  │   │  │  Trend:     ↓ 5% QoQ    │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  ADR COMPLIANCE                 │  MODULARITY & BOUNDARIES        │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Total ADR:   48        │   │  │  Services:  24          │   │
│  │  Compliant:   85% ████  │   │  │  Bounded:   22/24       │   │
│  │  At-risk:     8% ▍      │   │  │  Boundary violations: 3 │   │
│  │  Violated:    4% ▏      │   │  │  Shared kernel: 5       │   │
│  │  Expired:     2% ▏      │   │  │  API versions: 3 active │   │
│  │  Review due:  3 ADRs    │   │  │  Breaking Δ: 0 this Q   │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Service coupling metrics

| Service | Afferent (Ca) | Efferent (Ce) | Instability (I) | Abstractness (A) | Distance | Health |
|---|---|---|---|---|---|---|
| api-gateway | 18 | 4 | 0.18 | 0.15 | 0.67 | Yellow |
| auth-service | 14 | 3 | 0.18 | 0.12 | 0.70 | Yellow |
| user-service | 10 | 6 | 0.38 | 0.35 | 0.27 | Green |
| payment-service | 8 | 4 | 0.33 | 0.40 | 0.27 | Green |
| search-service | 6 | 8 | 0.57 | 0.30 | 0.13 | Yellow |
| notification-svc | 12 | 3 | 0.20 | 0.10 | 0.70 | Yellow |
| analytics-svc | 4 | 10 | 0.71 | 0.20 | 0.09 | Red |
| rag-service | 5 | 7 | 0.58 | 0.45 | 0.13 | Green |

**Reading the table:**
- **Instability (I)**: I = Ce/(Ca+Ce). Higher = more dependent on others (fragile). Target: 0.3-0.7
- **Abstractness (A)**: ratio of abstract to concrete. Higher = more flexible. Target: complement of I
- **Distance**: |A+I-1|. Main sequence distance. Target: < 0.3. > 0.3 = zone of pain/uselessness

### Dependency graph — cycle detection

```
api-gateway ──→ auth-service ──→ user-service ──→ payment-service
     │               │                │                  │
     │               │                ├──→ search-svc    │
     │               │                │                  │
     │               ├──→ notification-svc ←─────────────┤
     │               │       │                           │
     │               │       └──→ email-provider (ext)   │
     │               │                                   │
     └──→ rag-service ──→ embedding-service ──→ llm-api (ext)
              │
              └──→ knowledge-storage
```

| Metric | Current | Target | Status |
|---|---|---|---|
| Circular dependencies | 0 | 0 | Green |
| Fan-in per service (avg) | 12 | < 15 | Green |
| Fan-out per service (avg) | 8 | < 10 | Green |
| Max dependency depth | 4 | < 5 | Green |
| External dependencies | 8 | Documented | Green |

### Technical debt inventory

| Debt category | Days | Interest rate | Monthly cost | Priority |
|---|---|---|---|---|
| Missing tests (critical paths) | 8 | 3% | 0.24 d/mo | Critical |
| Deprecated library versions | 6 | 2% | 0.12 d/mo | High |
| Code duplication | 5 | 1.5% | 0.08 d/mo | High |
| Missing documentation | 4 | 1% | 0.04 d/mo | Medium |
| God classes / large modules | 5 | 2% | 0.10 d/mo | High |
| Outdated ADR (not followed) | 3 | 1.5% | 0.05 d/mo | Medium |
| No circuit breaker | 4 | 3% | 0.12 d/mo | High |
| Hardcoded config | 3 | 1% | 0.03 d/mo | Medium |
| Missing API versioning | 2 | 2% | 0.04 d/mo | Medium |
| Legacy monolith remnants | 2 | 0.5% | 0.01 d/mo | Low |
| **Total** | **42** | | **0.83 d/mo** | |

### Technical debt trend

| Quarter | Total debt (days) | Repaid | New | Net change | Interest rate |
|---|---|---|---|---|---|
| 2025-Q4 | 58 | — | — | — | 2.5% |
| 2026-Q1 | 52 | 12 | 6 | -6 | 2.3% |
| 2026-Q2 | 48 | 10 | 6 | -4 | 2.2% |
| 2026-Q3 (current) | 42 | 8 | 2 | -6 | 2.1% |

### ADR compliance by service

| ADR | Decision | Services affected | Compliant | At-risk | Violated | Last review |
|---|---|---|---|---|---|---|
| ADR-001 | RESTful API design | 12 | 10 | 1 | 1 | 2026-Q2 |
| ADR-003 | Event-driven communication | 8 | 7 | 1 | 0 | 2026-Q1 |
| ADR-005 | Database per service | 6 | 5 | 0 | 1 | 2026-Q2 |
| ADR-008 | OAuth 2.0 / OIDC | 10 | 9 | 1 | 0 | 2026-Q2 |
| ADR-012 | Structured logging (JSON) | 14 | 12 | 1 | 1 | 2026-Q1 |
| ADR-015 | Contract testing required | 8 | 6 | 1 | 1 | 2026-Q2 |
| ADR-018 | Circuit breaker pattern | 6 | 4 | 2 | 0 | 2026-Q1 |
| ADR-022 | API versioning (semver URL) | 8 | 7 | 0 | 1 | 2026-Q2 |
| **Total** | | **72 checks** | **60 (83%)** | **7 (10%)** | **5 (7%)** | |

### Modularity and boundary fit

| Boundary pair | Expected coupling | Actual coupling | Gap | Assessment |
|---|---|---|---|---|
| user ↔ payment | Low (async only) | Low | ✓ | Healthy boundary |
| user ↔ notification | Low (async only) | Low | ✓ | Healthy boundary |
| search ↔ analytics | None (separate domains) | Medium (shared DB) | **Violation** | Analytics reads search DB directly |
| auth ↔ user | Medium (sync calls) | Medium | ✓ | Healthy boundary |
| rag ↔ embedding | High (tight integration) | High | ✓ | Expected, same bounded context |
| payment ↔ notification | Low (event-driven) | Low | ✓ | Healthy boundary |

### Architecture fitness functions

| Fitness function | Measurement | Threshold | Current | Status |
|---|---|---|---|---|
| No circular dependencies | Static analysis | 0 cycles | 0 | Green |
| Max dependency depth | Static analysis | ≤ 5 | 4 | Green |
| Service can be deployed independently | CI/CD check | All services | 22/24 | Yellow |
| API backward compatibility | Contract test | 0 breaking changes | 0 | Green |
| Database per service | Runtime check | 1 DB writer per service | 5/6 | Yellow |
| No synchronous cross-domain calls | Trace analysis | 0 cross-domain sync | 2 | Yellow |

## Action recommendations

1. **Fix boundary violations**: analytics reading search DB directly — add API or event stream; target 0 violations
2. **Address zone of pain services**: api-gateway and auth-service have distance > 0.5; refactor or add abstractions
3. **Repay critical tech debt first**: 8 days of missing tests + 4 days of no circuit breaker; both are incident-risk
4. **ADR review cadence**: every ADR gets a compliance check quarterly; violated ADRs get remediation tickets
5. **Reduce analytics-svc instability**: I=0.71 means it depends on too many services; consider consolidating dependencies
6. **Fitness function automation**: add fitness functions to CI; block merges that introduce circular dependencies
7. **Quarterly architecture review**: review coupling, debt, and ADR compliance with all tech leads; update debt inventory



- Diagram-driven architecture → architecture exists only in diagrams, not in code; measure runtime behavior
- Tech debt denial → "we'll fix it later" without tracking; untracked debt is debt that will never be repaid
- ADR as documentation → writing ADRs without compliance checks; an ADR without enforcement is a suggestion
- Microservice masochism → splitting services too finely; each service split should solve a concrete problem
- Ignoring the main sequence → services far from the main sequence (|A+I-1| > 0.3) are either too rigid or too useless

## Related

- Same class: [dashboard-dora-metrics](../infrastructure/dashboard-dora-metrics.md) — delivery performance
- Same class: [dashboard-quality-metrics](../quality-security/dashboard-quality-metrics.md) — code quality
- Upstream: [architecture-review](../../tech-lead/architecture/architecture-review.md) — architecture review process
- Upstream: [decision-log](../../tech-lead/decisions/) — ADR repository
- References: Robert C. Martin — *Clean Architecture*; Neal Ford et al. — *Building Evolutionary Architectures*; Michael Nygard — *Release It!*