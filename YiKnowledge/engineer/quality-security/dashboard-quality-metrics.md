---
title: quality metrics dashboard
aliases:
- quality dashboard
- test metrics dashboard
- code quality dashboard
tags:
- dashboard
- quality
- testing
- coverage
- bugs
- code-quality
category: engineer/quality-security
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles:
- engineer
- tech-lead
- oncall-sre
benefit: code quality and test effectiveness visible at a glance
acceptance_criteria:
  - "data source and refresh cadence are documented"
  - "key metrics are defined with thresholds or targets"
  - "visualization choices are explained and accessible"
related:
- ../infrastructure/dashboard-dora-metrics.md
- ../engineering/set-up-testing-infrastructure.md
- ../../oncall-sre/observability/dashboard-system-health.md
- ../lessons/failure-incident-postmortem.md
tacit: false
---

# quality metrics dashboard

> **As a** tech lead, **I want to** track code quality and test effectiveness across all services, **so that** quality regressions are caught early and testing investments are data-driven.

> Quality is not just test coverage — it's a composite of coverage, bug density, test effectiveness, code health, and review quality. This dashboard aggregates all 5 dimensions.

## Summary

- 5 quality dimensions: test coverage, bug trends, test effectiveness, code health, review quality
- Each dimension has 2-4 key indicators with green/yellow/red thresholds
- Bug trends categorized by severity (P0-P4) and root cause (code, config, dependency, infra)
- Test effectiveness measured by mutation score and production bug escape rate
- Dashboard refreshes per-build; trend analysis weekly

## Core viewpoints

- Coverage is necessary but not sufficient — 80% coverage with poor assertions is worse than 60% with strong assertions
- Bug escape rate is the ultimate quality metric — how many bugs reach production vs. caught in pre-production
- Test effectiveness decays over time — tests that never fail are either perfect code or useless tests
- Code health is leading indicator; bug count is lagging indicator — invest in code health to prevent future bugs

## Key information

### 5-dimension quality overview

```
┌──────────────────────────────────────────────────────────────────┐
│  TEST COVERAGE                  │  BUG TRENDS                     │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Line:    82% ████▌     │   │  │  Open:  12 ↓ 3 WoW     │   │
│  │  Branch:  76% ███▌      │   │  │  P0:     0             │   │
│  │  Function: 88% ████▌    │   │  │  P1:     2             │   │
│  │  Trend: ↑ 2% MoM        │   │  │  Escape: 4% (Elite)    │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  TEST EFFECTIVENESS             │  CODE HEALTH                    │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Mutation: 68% ███▌     │   │  │  Duplication: 3.2%      │   │
│  │  Flaky rate: 1.2%       │   │  │  Complexity: 12 avg     │   │
│  │  Run time: 8 min        │   │  │  Tech debt: 4.2 days    │   │
│  │  Pass rate: 99.1%       │   │  │  Review: 92% thorough   │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Dimension 1: Test coverage thresholds

| Metric | Red | Yellow | Green | Current target |
|---|---|---|---|---|
| Line coverage | < 60% | 60-80% | > 80% | 85% |
| Branch coverage | < 50% | 50-70% | > 70% | 75% |
| Function coverage | < 60% | 60-80% | > 80% | 85% |
| Uncovered critical paths | > 5 | 2-5 | < 2 | 0 |

### Dimension 2: Bug trend categories

| Severity | Definition | SLA | Current count |
|---|---|---|---|
| P0 | Service down / data loss / security breach | Fix immediately, rollback | 0 |
| P1 | Core feature broken, no workaround | Fix within 4 hours | < 3 |
| P2 | Feature degraded, workaround exists | Fix within 24 hours | < 10 |
| P3 | Minor issue, cosmetic | Next sprint | < 20 |
| P4 | Suggestion / improvement | Backlog | Unbounded |

### Dimension 3: Bug root cause distribution

| Root cause | Target % | Action if exceeded |
|---|---|---|
| Code logic error | < 40% | Improve unit test assertion quality |
| Configuration error | < 15% | Add config validation in CI |
| Dependency issue | < 15% | Pin versions, add dependency update tests |
| Infrastructure | < 10% | IaC testing, staging parity |
| Integration / contract | < 10% | Add contract tests |
| Unknown / other | < 10% | Improve logging and observability |

### Dimension 4: Test effectiveness indicators

| Indicator | Measurement | Elite | Good | Poor |
|---|---|---|---|---|
| Mutation score | % mutants killed | > 80% | 60-80% | < 60% |
| Bug escape rate | % bugs found in production | < 5% | 5-10% | > 10% |
| Flaky test rate | % tests that fail non-deterministically | < 1% | 1-3% | > 3% |
| Test value ratio | Tests that caught ≥ 1 bug / total tests | > 15% | 5-15% | < 5% |

### Dimension 5: Code health indicators

| Indicator | Measurement | Green | Yellow | Red |
|---|---|---|---|---|
| Code duplication | % duplicated lines | < 3% | 3-8% | > 8% |
| Cyclomatic complexity | Avg per function | < 10 | 10-20 | > 20 |
| Technical debt ratio | Estimated remediation hours / total hours | < 5% | 5-10% | > 10% |
| Review thoroughness | Comments per PR / lines changed | > 5% | 2-5% | < 2% |
| Documentation coverage | % public APIs documented | > 90% | 70-90% | < 70% |

### Test pyramid health

```
     ┌──────┐
     │ E2E  │  5-10%  — Critical user journeys only
     │ 5%   │
    ┌┴──────┴┐
    │Integr. │  15-25% — API + DB + contract tests
    │ 20%    │
   ┌┴────────┴┐
   │  Unit     │  65-75% — Business logic + edge cases
   │  75%      │
   └───────────┘
```

| Layer | Current % | Target % | Health |
|---|---|---|---|
| Unit tests | 72% | 65-75% | Green |
| Integration tests | 18% | 15-25% | Green |
| E2E tests | 10% | 5-10% | Yellow (upper bound) |

### Coverage by service (example)

| Service | Line % | Branch % | Mutation % | Bug escape | Health |
|---|---|---|---|---|---|
| api-gateway | 88% | 82% | 72% | 2.1% | Green |
| user-service | 79% | 71% | 65% | 4.5% | Green |
| payment-service | 92% | 87% | 81% | 0.8% | Green |
| notification-service | 65% | 52% | 41% | 12.3% | Red |
| search-service | 74% | 68% | 58% | 7.2% | Yellow |

## Action recommendations

1. **Fix red services first**: notification-service coverage < 60% with > 10% bug escape rate needs immediate attention
2. **Kill flaky tests weekly**: any test failing > 3 times in a week gets quarantined and fixed within the sprint
3. **Mutation testing quarterly**: run full mutation suite quarterly; target > 80% mutation score for critical services
4. **Bug escape postmortem**: every P0/P1 production bug gets a postmortem with "why didn't tests catch this?"
5. **Review quality audit**: monthly review of PR review thoroughness; pair low-review teams with high-review mentors
6. **E2E test budget**: cap E2E tests at 10% of total; each E2E test must justify its existence with a unique failure mode
7. **Test value cleanup**: remove tests that haven't failed in 6 months (unless they cover critical security/regression)
8. **Complexity refactor**: any function with complexity > 20 gets a refactor ticket in the next sprint



- Coverage worship → chasing 100% coverage with weak assertions; measure mutation score instead
- Ice cream cone → too many E2E tests, too few unit tests; invert to pyramid
- Ignoring flaky tests → "re-run and it passes" culture; flaky tests erode trust in the entire suite
- Bug count as KPI → incentivizes not reporting bugs; measure bug escape rate and resolution time
- Zero-bug policy → closing bugs without fixing them; measure customer impact, not ticket count

## Related

- Same class: [dashboard-dora-metrics](../infrastructure/dashboard-dora-metrics.md) — delivery performance dashboard
- Same class: [dashboard-system-health](../../oncall-sre/observability/dashboard-system-health.md) — system health dashboard
- Downstream: [set-up-testing-infrastructure](../engineering/set-up-testing-infrastructure.md) — testing infrastructure setup
- Downstream: [chaos-engineering](chaos-engineering.md) — resilience testing
- References: Martin Fowler — *TestPyramid*; Google — *Software Engineering at Google* (Chapter 14: Testing); Gojko Adzic — *Specification by Example*