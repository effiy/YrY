---
title: technical debt dashboard
aliases:
- tech debt dashboard
- code debt dashboard
- architecture debt dashboard
- code quality debt dashboard
tags:
- dashboard
- technical-debt
- code-quality
- remediation
- architecture
- refactoring
- code-health
category: tech-lead/risk
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: dashboard
status: stable
lifecycle: active
review_cycle: monthly
roles:
- tech-lead
- engineer
- executive
benefit: technical debt inventory and remediation progress visible at a glance
acceptance_criteria:
  - "data source and refresh cadence are documented"
  - "key metrics are defined with thresholds or targets"
  - "visualization choices are explained and accessible"
related:
- ./dashboard-risk-management.md
- ../capacity/dashboard-engineering-capacity.md
- ../../engineer/architecture-design/dashboard-architecture-health.md
- ../../engineer/quality-security/dashboard-quality-metrics.md
tacit: false
---

# technical debt dashboard

> **As a** tech lead, **I want to** track technical debt inventory and remediation progress, **so that** debt is quantified, prioritized, and systematically reduced before it becomes a competitive disadvantage.

> Technical debt is not just messy code — it's a financial liability on the engineering balance sheet. Every piece of debt has a principal (the cost to fix), an interest rate (the ongoing productivity tax), and a maturity date (when it becomes critical). This dashboard tracks debt inventory, interest cost, remediation velocity, architectural debt, and debt governance.

## Summary

- 5 technical debt dimensions: debt inventory, interest cost, remediation velocity, architectural debt, debt governance
- Debt classified by type: code (42%), architecture (23%), testing (15%), dependency (12%), documentation (8%)
- $1.2M estimated total debt principal with $285K/year ongoing interest cost (productivity tax)
- Debt tracked per team, per service, with severity (Critical/High/Medium/Low) and age
- Dashboard reviewed monthly; debt review board quarterly with engineering leadership

## Core viewpoints

- Technical debt is a financial instrument — it has principal (cost to fix), interest rate (productivity drag), and a maturity date (when it becomes critical); manage it like a loan portfolio
- Not all debt is bad — strategic debt taken to capture a market window is different from reckless debt from sloppy engineering; the key is conscious decision-making
- Interest compounds — a 1-hour workaround today becomes a 10-hour refactor next year; the longer debt sits, the more interest it accrues
- Debt must be on the balance sheet — if you can't see it, you can't manage it; every team must track and report their debt

## Key information

### 5-panel technical debt overview

```
┌──────────────────────────────────────────────────────────────────┐
│  DEBT INVENTORY                   │  INTEREST COST                   │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Total items: 186       │   │  │  Interest:  $285K/yr     │   │
│  │  Critical:    12 (6%)   │   │  │  Hours lost: 1,900/yr    │   │
│  │  High:        48 (26%)  │   │  │  Velocity drag: 12%      │   │
│  │  Medium:      82 (44%)  │   │  │  Bug contribution: 18%   │   │
│  │  Low:         44 (24%)  │   │  │  Onboarding tax: 15%     │   │
│  │  Principal:   $1.2M     │   │  │  Incident risk: 8 items  │   │
│  │  Age > 1yr:   38 (20%)  │   │  │  Cost of delay: $340K/yr │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  REMEDIATION VELOCITY             │  ARCHITECTURAL DEBT              │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Resolved:  28/mo avg   │   │  │  Arch debt:   42 items   │   │
│  │  Created:   22/mo avg   │   │  │  Coupling:    15 (36%)   │   │
│  │  Net:       -6/mo       │   │  │  Monolith:     8 (19%)   │   │
│  │  Critical:  -2/mo       │   │  │  Wrong abstraction:7(17%)│   │
│  │  Budget:    20% of cap  │   │  │  Data model:   6 (14%)   │   │
│  │  Actual:    18% of cap  │   │  │  Missing API:  4 (10%)   │   │
│  │  Target:    25% of cap  │   │  │  Tech choice:  2 (5%)   │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Debt inventory by type

| Debt type | Count | Principal (est.) | Interest/year | Severity breakdown | Age (avg) | Trend |
|---|---|---|---|---|---|---|
| **Code debt** | 78 | $420K | $98K | C:5 H:18 M:35 L:20 | 8.2 months | ↑ 3/mo |
| — Duplicate code | 18 | $72K | $18K | H:4 M:10 L:4 | 6.5 months | → |
| — Complex functions (> 200 LOC) | 22 | $88K | $22K | C:2 H:5 M:10 L:5 | 9.1 months | ↑ |
| — Missing error handling | 15 | $95K | $25K | C:2 H:5 M:5 L:3 | 7.8 months | → |
| — God classes/components | 12 | $85K | $18K | C:1 H:3 M:5 L:3 | 11.2 months | ↑ |
| — Magic numbers/strings | 11 | $80K | $15K | H:1 M:5 L:5 | 5.5 months | → |
| **Architecture debt** | 42 | $380K | $95K | C:4 H:14 M:18 L:6 | 12.5 months | ↑ 2/mo |
| — Tight coupling | 15 | $120K | $32K | C:2 H:5 M:6 L:2 | 14.2 months | ↑ |
| — Monolith decomposition needed | 8 | $110K | $28K | C:1 H:4 M:3 L:0 | 18.5 months | ↑ |
| — Wrong abstraction | 7 | $65K | $15K | H:3 M:3 L:1 | 8.8 months | → |
| — Data model issues | 6 | $45K | $12K | C:1 H:1 M:3 L:1 | 10.2 months | → |
| — Missing API boundaries | 4 | $28K | $5K | H:1 M:2 L:1 | 7.5 months | → |
| — Technology choice regret | 2 | $12K | $3K | H:0 M:1 L:1 | 5.0 months | → |
| **Testing debt** | 28 | $185K | $42K | C:2 H:8 M:12 L:6 | 6.8 months | ↑ 1/mo |
| — Missing tests (critical paths) | 10 | $75K | $18K | C:2 H:4 M:3 L:1 | 5.5 months | → |
| — Flaky tests (not yet quarantined) | 8 | $48K | $12K | H:2 M:4 L:2 | 4.2 months | ↑ |
| — Test environment gaps | 6 | $35K | $7K | H:1 M:3 L:2 | 8.8 months | → |
| — Manual test gaps | 4 | $27K | $5K | H:1 M:2 L:1 | 10.5 months | → |
| **Dependency debt** | 22 | $130K | $30K | C:1 H:5 M:10 L:6 | 9.5 months | ↑ 1/mo |
| — Outdated libraries (> 2 major versions) | 8 | $45K | $10K | H:2 M:4 L:2 | 8.2 months | → |
| — Unmaintained dependencies | 5 | $38K | $8K | C:1 H:2 M:2 L:0 | 12.5 months | ↑ |
| — Custom fork of OSS | 4 | $28K | $7K | H:1 M:2 L:1 | 15.2 months | → |
| — Duplicate dependencies | 5 | $19K | $5K | H:0 M:2 L:3 | 4.8 months | → |
| **Documentation debt** | 16 | $85K | $20K | H:3 M:7 L:6 | 7.2 months | → |
| **Total** | **186** | **$1,200K** | **$285K** | | **8.8 months** | **↑ 6/mo net** |

### Debt by team

| Team | Total items | Principal | Interest/year | Critical | % of capacity on debt | Net change/mo | Health score |
|---|---|---|---|---|---|---|---|
| AI/ML | 28 | $195K | $48K | 2 | 22% | -2 | 72/100 |
| Web Frontend | 35 | $220K | $52K | 3 | 18% | +1 | 65/100 |
| Platform | 42 | $310K | $78K | 4 | 15% | +3 | 58/100 |
| Mobile | 25 | $155K | $35K | 1 | 20% | -1 | 75/100 |
| Data | 18 | $105K | $25K | 1 | 18% | 0 | 78/100 |
| SRE | 22 | $145K | $32K | 1 | 12% | +1 | 68/100 |
| Design | 8 | $35K | $8K | 0 | 10% | 0 | 88/100 |
| Security | 8 | $35K | $7K | 0 | 8% | 0 | 90/100 |
| **Total** | **186** | **$1,200K** | **$285K** | **12** | **18%** | **+6/mo** | **68/100** |

### Critical debt register (12 items)

| ID | Debt item | Type | Principal | Interest/yr | Age | Team | Risk | Remediation plan | Target |
|---|---|---|---|---|---|---|---|---|---|
| TD-001 | Chat service tight coupling to model provider | Architecture | $45K | $15K | 16 mo | AI/ML | Vendor lock-in | Provider abstraction layer | 2026-10 |
| TD-002 | Auth service no error handling for token expiry | Code | $35K | $12K | 10 mo | Platform | Security incident | Error handling refactor | 2026-09 |
| TD-003 | Monolith API gateway blocks independent deploy | Architecture | $55K | $18K | 22 mo | Platform | Deployment velocity | API gateway decomposition | 2026-12 |
| TD-004 | Missing tests for payment processing | Testing | $28K | $10K | 8 mo | Platform | Revenue loss | Payment test suite | 2026-09 |
| TD-005 | Unmaintained OSS library (jsonpath-plus) | Dependency | $22K | $8K | 14 mo | Web | Security vulnerability | Replace with maintained alt | 2026-09 |
| TD-006 | Complex function: search ranking (450 LOC) | Code | $18K | $6K | 12 mo | AI/ML | Feature velocity | Extract strategy pattern | 2026-10 |
| TD-007 | Data model: user profile denormalized | Architecture | $32K | $8K | 18 mo | Platform | Data consistency | Profile data model v2 | 2026-12 |
| TD-008 | No automated rollback for DB migrations | Testing | $25K | $7K | 6 mo | SRE | Data loss | Migration rollback automation | 2026-09 |
| TD-009 | God component: ConversationPanel (1,200 LOC) | Code | $28K | $8K | 15 mo | Web | Feature velocity | Component decomposition | 2026-11 |
| TD-010 | Duplicate auth logic across 5 services | Code | $22K | $7K | 9 mo | Platform | Security, consistency | Shared auth library | 2026-10 |
| TD-011 | Wrong abstraction: GenericDataProcessor | Architecture | $18K | $5K | 8 mo | Data | All new data pipelines | Replace with specific processors | 2026-11 |
| TD-012 | Outdated React Router (v5 → v7, 2 majors) | Dependency | $15K | $4K | 7 mo | Web | New features blocked | Migration to v7 | 2026-10 |

### Interest cost — productivity tax breakdown

| Interest category | Hours lost/year | Cost/year | % of total interest | Primary impact |
|---|---|---|---|---|
| **Slower feature development** | 850 | $128K | 45% | Code that's hard to change, tight coupling |
| **Debugging and bug fixes** | 380 | $57K | 20% | Missing error handling, complex code, missing tests |
| **Onboarding friction** | 220 | $33K | 12% | Undocumented code, magic numbers, god classes |
| **Incident response** | 180 | $27K | 9% | Missing tests, unmaintained dependencies |
| **Code review overhead** | 150 | $23K | 8% | Large PRs from complex refactors, duplicate code |
| **CI/CD delays** | 80 | $12K | 4% | Flaky tests, slow builds from monolith |
| **Context switching** | 40 | $6K | 2% | Working around debt instead of fixing it |
| **Total** | **1,900** | **$285K** | | |

### Remediation velocity

| Period | Debt resolved | Debt created | Net change | Critical resolved | Critical created | Budget utilization |
|---|---|---|---|---|---|---|
| 2026-07 | 32 | 24 | -8 | 3 | 1 | 20% |
| 2026-06 | 28 | 22 | -6 | 2 | 2 | 18% |
| 2026-05 | 25 | 28 | +3 | 1 | 3 | 15% |
| 2026-04 | 30 | 20 | -10 | 4 | 1 | 22% |
| 2026-03 | 22 | 26 | +4 | 1 | 2 | 14% |
| 2026-02 | 28 | 18 | -10 | 2 | 1 | 18% |
| **6-month avg** | **27.5** | **23.0** | **-4.5** | **2.2** | **1.7** | **17.8%** |

### Debt by age

| Age bucket | Count | % of total | Principal | Avg interest rate | Risk |
|---|---|---|---|---|---|
| < 3 months (fresh) | 42 | 23% | $210K | 15% | Low — conscious debt, should have plan |
| 3-6 months (aging) | 55 | 30% | $330K | 18% | Medium — interest accruing, needs attention |
| 6-12 months (mature) | 51 | 27% | $360K | 22% | High — compounding, harder to fix |
| 12-18 months (stale) | 22 | 12% | $180K | 28% | Critical — architectural impact, expensive |
| > 18 months (toxic) | 16 | 9% | $120K | 35% | Critical — likely requires rewrite |
| **Total** | **186** | | **$1,200K** | **22% avg** | |

### Debt governance

| Policy | Status | Compliance | Details |
|---|---|---|---|
| 20% capacity allocation for debt reduction | Active | 18% actual | 2% below target, Platform and SRE below allocation |
| All new debt must be registered within 1 sprint | Active | 72% | 28% of debt is discovered, not declared |
| Critical debt must have remediation plan within 2 weeks | Active | 92% | 11/12 critical items have plans |
| Debt older than 12 months escalated to VP Engineering | Active | 100% | 38 items escalated, all reviewed |
| Pre-merge debt check (no new Critical debt without approval) | Active | 85% | 15% bypass rate, improving |
| Quarterly debt review board | Active | 100% | Q2 review completed, Q3 scheduled |
| Debt SLA: Critical < 90 days, High < 180 days | Active | 68% | 32% of High items exceed SLA |
| Architecture decision records for all architectural debt | Proposed | 0% | Not yet implemented |

### Debt reduction initiatives

| Initiative | Debt items targeted | Principal reduction | Effort | Timeline | Owner | Status |
|---|---|---|---|---|---|---|
| API Gateway decomposition | 8 arch debt items | $110K | 12 weeks | Q4 2026 | Platform Lead | Scoping |
| Provider abstraction layer | 3 arch debt items | $45K | 6 weeks | Q3 2026 | AI Lead | In progress |
| Component decomposition sprint | 12 code debt items | $85K | 4 weeks | Q3 2026 | Web Lead | Planned |
| Test suite reliability | 8 testing debt items | $48K | 3 weeks | Q3 2026 | All teams | In progress |
| Dependency upgrade sprint | 8 dep debt items | $45K | 3 weeks | Q3 2026 | Platform Lead | Planned |
| Error handling standardization | 15 code debt items | $95K | 6 weeks | Q4 2026 | Platform Lead | Backlog |
| Shared auth library | 5 code debt items | $22K | 4 weeks | Q4 2026 | Platform Lead | Backlog |
| **Total** | **59 items** | **$450K (38%)** | | | | |

## Action recommendations

1. **Critical debt sprint**: 12 critical items, $310K principal; dedicate 2 engineers per team for 1 sprint each, clear all critical debt in 90 days
2. **Platform debt reduction**: 42 items, $310K principal, 15% capacity utilization; increase Platform debt allocation to 25%, target net -5/month
3. **Debt registration compliance**: 72% of debt is discovered, not declared; add debt declaration to sprint retro, make it a team norm
4. **Architecture debt prioritization**: 42 items, 12.5 months avg age, $95K/year interest; prioritize coupling and monolith decomposition in Q3-Q4
5. **Dependency upgrade sprint**: 8 outdated libraries, 5 unmaintained; upgrade all dependencies within 2 major versions, replace unmaintained libs
6. **Debt SLA enforcement**: 68% High SLA compliance; implement automated escalation for debt exceeding SLA, add to team dashboards
7. **ADR for architectural debt**: 0% compliance; require ADR for all new architectural debt, document trade-offs and sunset plan
8. **Budget utilization target**: 18% actual vs 25% target; protect debt reduction time, make it non-negotiable in sprint planning
9. **Interest cost tracking**: $285K/year productivity tax; add interest cost to engineering KPIs, make it visible to leadership
10. **Monthly debt review**: review inventory, net change, SLA compliance, and critical debt remediation progress with engineering leadership



- Debt denial → "we don't have technical debt" or "we'll fix it later"; every non-trivial codebase has debt, the question is whether you're managing it or it's managing you
- Big rewrite fantasy → planning to fix all debt in one big rewrite; rewrites are the riskiest way to address debt, incremental improvement is safer and faster
- Debt as a dumpster → labeling everything you don't like as "technical debt"; debt is a specific economic concept — it must have a measurable cost and a path to repayment
- 100% allocation to features → "we're too busy building features to fix debt"; this is like saying you're too busy driving to change the oil — eventually the engine seizes
- Debt without ownership → debt items with no owner, no plan, and no deadline; every debt item must have the same rigor as a feature: owner, estimate, and target date

## Related

- Same class: [dashboard-risk-management](dashboard-risk-management.md) — risk register and mitigation
- Same class: [dashboard-engineering-capacity](../capacity/dashboard-engineering-capacity.md) — team capacity and allocation
- Same class: [dashboard-architecture-health](../../engineer/architecture-design/dashboard-architecture-health.md) — architecture fitness and ADR compliance
- Same class: [dashboard-quality-metrics](../../engineer/quality-security/dashboard-quality-metrics.md) — code quality and bug metrics
- References: Ward Cunningham — *Technical Debt Metaphor*; Martin Fowler — *Technical Debt Quadrant*; Thoughtworks — *Tech Radar and Debt Management*; Philippe Kruchten — *Managing Technical Debt*; Google — *Software Engineering at Google (Chapter: Technical Debt)*