---
title: test automation dashboard
aliases:
- test quality dashboard
- automated testing dashboard
- test pyramid dashboard
- test coverage dashboard
tags:
- dashboard
- testing
- automation
- test-pyramid
- quality
- flaky-tests
- ci-cd
category: engineer/quality-security
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: dashboard
status: stable
lifecycle: active
review_cycle: monthly
roles:
- engineer
- tech-lead
benefit: test automation health and effectiveness visible at a glance
acceptance_criteria:
  - "data source and refresh cadence are documented"
  - "key metrics are defined with thresholds or targets"
  - "visualization choices are explained and accessible"
related:
- ./dashboard-quality-metrics.md
- ../infrastructure/dashboard-dora-metrics.md
- ../engineering/dashboard-developer-experience.md
- ../process/dashboard-team-velocity.md
tacit: false
---

# test automation dashboard

> **As an** engineer, **I want to** track test automation health and effectiveness, **so that** the test suite is fast, reliable, and provides meaningful quality signals without slowing down delivery.

> Test automation is the foundation of continuous delivery — but only if tests are fast, reliable, and trustworthy. This dashboard tracks test pyramid health, flaky test management, execution speed, coverage effectiveness, and test debt.

## Summary

- 5 test automation dimensions: test pyramid distribution, flaky test management, execution speed, coverage effectiveness, test debt
- 12,850 tests across 8 test suites: unit (8,200), integration (2,400), contract (850), E2E (620), performance (180), visual (120), security (80), accessibility (400)
- Test pyramid ratio target: 70/20/5/5 (unit/integration/contract+E2E/specialty)
- Flaky test quarantine: tests that fail > 2% non-deterministically are automatically quarantined
- Dashboard reviewed monthly; test suite health retrospective quarterly

## Core viewpoints

- The test pyramid is a economic model — unit tests are cheap and fast; E2E tests are expensive and slow; invest where the ROI is highest
- A flaky test is worse than no test — it erodes trust in the entire suite and costs engineering time investigating false failures
- Test speed determines developer flow — if the test suite takes more than 5 minutes, developers context-switch and lose flow
- Coverage is a hygiene metric, not a quality metric — 100% coverage of the wrong tests is worthless; focus on risk-based coverage

## Key information

### 5-panel test automation overview

```
┌──────────────────────────────────────────────────────────────────┐
│  TEST PYRAMID                     │  FLAKY TEST MANAGEMENT           │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Unit:     8,200 (64%)  │   │  │  Flaky:     47 (0.4%)   │   │
│  │  Integ:    2,400 (19%)  │   │  │  Quarantined: 18 (38%)  │   │
│  │  Contract: 850 (7%)     │   │  │  Fixed:      12 (26%)   │   │
│  │  E2E:      620 (5%)     │   │  │  Open:       17 (36%)   │   │
│  │  Specialty: 780 (6%)    │   │  │  Flaky rate: 1.8%       │   │
│  │  Total:    12,850       │   │  │  Quarantine: auto @ 2%  │   │
│  │  Pyramid:  B- (too flat)│   │  │  MTTR-flaky: 3.2 days   │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  EXECUTION SPEED                  │  COVERAGE EFFECTIVENESS          │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Unit:      28s (∥)     │   │  │  Line:      78% ███▌    │   │
│  │  Integration: 95s (∥)   │   │  │  Branch:    65% ███     │   │
│  │  Contract:   42s (∥)    │   │  │  Function:  82% ████    │   │
│  │  E2E:        6m 30s (∥) │   │  │  Risk-based: 88% ████   │   │
│  │  Total CI:   4m 12s (∥) │   │  │  Mutation:   42% ██     │   │
│  │  Pre-merge:  2m 05s     │   │  │  Gap: API error paths   │   │
│  │  Post-merge: 8m 45s     │   │  │  Gap: Auth edge cases    │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Test pyramid distribution

| Test level | Count | Target % | Actual % | Gap | Run frequency | Avg duration | Parallelism |
|---|---|---|---|---|---|---|---|
| **Unit** | 8,200 | 70% | 64% | -770 tests | Per commit | 28s (∥ 16) | 16 workers |
| **Integration** | 2,400 | 20% | 19% | +130 tests | Per commit | 95s (∥ 8) | 8 workers |
| **Contract** | 850 | 5% | 7% | +250 tests | Per commit | 42s (∥ 4) | 4 workers |
| **E2E** | 620 | 3% | 5% | +250 tests | Per merge | 6m 30s (∥ 8) | 8 workers |
| **Performance** | 180 | 1% | 1.4% | +50 tests | Nightly | 22m (∥ 2) | 2 workers |
| **Visual regression** | 120 | 0.5% | 0.9% | +50 tests | Per merge | 4m 15s | 4 workers |
| **Security** | 80 | 0.3% | 0.6% | +40 tests | Weekly | 8m 30s | 2 workers |
| **Accessibility** | 400 | 0.2% | 3.1% | +380 tests | Per merge | 3m 45s | 4 workers |
| **Total** | **12,850** | | | | | | |

### Test pyramid by team

| Team | Unit | Integration | E2E | Unit % | Pyramid health | Gap |
|---|---|---|---|---|---|---|
| AI/ML | 1,850 | 520 | 85 | 75% | A (good) | Slightly too many integration |
| Web Frontend | 2,100 | 680 | 180 | 71% | B+ | E2E-heavy, migrate to component tests |
| Platform | 1,420 | 420 | 95 | 73% | B+ | Good shape |
| Mobile | 980 | 310 | 120 | 69% | B | Too many E2E, add unit coverage |
| Data | 1,050 | 280 | 55 | 76% | A (good) | Close to ideal |
| SRE | 420 | 120 | 45 | 72% | B | Add integration tests |
| Design System | 380 | 70 | 40 | 78% | A (good) | Visual tests dominate |
| **Overall** | **8,200** | **2,400** | **620** | **64%** | **B-** | |

### Flaky test inventory

| Test suite | Flaky count | Flaky rate | Quarantined | Open | Fixed (this month) | Top cause |
|---|---|---|---|---|---|---|
| Unit | 8 | 0.10% | 3 | 5 | 2 | Async timing, missing awaits |
| Integration | 15 | 0.63% | 6 | 6 | 3 | Test order dependency, shared state |
| Contract | 4 | 0.47% | 2 | 1 | 1 | API response timeouts |
| E2E | 18 | 2.90% | 6 | 5 | 7 | Element selectors, animation timing |
| Visual | 2 | 1.67% | 1 | 0 | 1 | Anti-aliasing differences |
| **Total** | **47** | **0.37%** | **18** | **17** | **14** | |

### Flaky test quarantine process

| Stage | Description | Automation | SLA |
|---|---|---|---|
| **Detect** | Test fails non-deterministically > 2% over 50 runs | Auto (CI pipeline) | Real-time |
| **Quarantine** | Move to quarantine suite, skip in CI, file issue | Auto (> 2% flake rate) | < 1 hour |
| **Triage** | Assign to team, label severity, estimate fix effort | Manual (TL rotation) | < 24 hours |
| **Fix** | Root cause analysis, fix, verify with 100 runs | Manual (engineer) | < 5 days (P2), < 2 days (P1) |
| **Verify** | Run 100× in quarantine, 0 failures → unquarantine | Auto (100-pass gate) | < 1 hour |
| **Re-admit** | Move back to main suite, monitor for 1 week | Auto (monitoring) | 7 days |

### Flaky test root cause analysis

| Root cause | Count | % of flaky | Difficulty | Prevention |
|---|---|---|---|---|
| Async/timing issues | 16 | 34% | Medium | `waitFor` patterns, stability timeouts |
| Shared state/order dependency | 10 | 21% | Hard | Test isolation, DB reset per test |
| Network/API flakiness | 8 | 17% | Easy | Mock at appropriate level, retry logic |
| DOM/selector instability | 7 | 15% | Easy | `data-testid`, resilient selectors |
| Environment inconsistency | 4 | 9% | Medium | Containerized test environments |
| Race conditions | 2 | 4% | Hard | Deterministic test design |

### Test execution speed

| Suite | Tests | Sequential | Parallel (current) | Target | % of CI time | Optimization |
|---|---|---|---|---|---|---|
| Unit | 8,200 | 7m 28s | 28s | < 30s | 11% | On target |
| Integration | 2,400 | 12m 40s | 95s | < 90s | 38% | Add 4 workers, test splitting |
| Contract | 850 | 2m 48s | 42s | < 30s | 17% | Parallelize by domain |
| E2E | 620 | 52m | 6m 30s | < 5m | 26% | Shard by feature, 12 workers |
| Pre-merge gate | 11,450 | — | 2m 05s | < 2m | — | On target |
| Post-merge gate | 12,850 | — | 8m 45s | < 7m | — | Optimize E2E sharding |
| Nightly full | 12,850 | — | 18m 30s | < 15m | — | Add performance test parallel |

### Coverage effectiveness

| Module | Line % | Branch % | Function % | Risk level | Risk-based % | Mutation score | Assessment |
|---|---|---|---|---|---|---|---|
| API Gateway | 82% | 71% | 88% | Critical | 92% | 48% | Good |
| Auth Service | 78% | 65% | 82% | Critical | 85% | 42% | Needs improvement |
| Chat Inference | 72% | 58% | 76% | Critical | 82% | 35% | Needs improvement |
| Knowledge Search | 80% | 68% | 84% | High | 88% | 45% | Good |
| Code Review | 74% | 60% | 78% | High | 80% | 38% | Needs improvement |
| Payment/Billing | 88% | 78% | 92% | Critical | 95% | 55% | Excellent |
| User Management | 76% | 62% | 80% | High | 84% | 40% | Adequate |
| Notification Service | 70% | 55% | 74% | Medium | 78% | 32% | Needs improvement |
| File Storage | 75% | 61% | 79% | High | 82% | 41% | Adequate |
| Admin Dashboard | 68% | 52% | 72% | Medium | 75% | 28% | Needs improvement |
| **Overall** | **78%** | **65%** | **82%** | | **88%** | **42%** | |

### Coverage gap analysis

| Gap category | Files uncovered | Risk | Effort to cover | Priority | Est. tests needed |
|---|---|---|---|---|---|
| API error handling paths | 45 | High | Low | P0 | 280 |
| Authentication edge cases | 32 | Critical | Medium | P0 | 180 |
| Database migration rollback | 18 | High | Medium | P1 | 120 |
| Concurrent request handling | 22 | High | High | P1 | 150 |
| Rate limiting behavior | 12 | Medium | Low | P2 | 80 |
| Webhook delivery retries | 15 | Medium | Medium | P2 | 95 |
| Feature flag toggles | 28 | Medium | Low | P2 | 140 |
| Dark mode/theme switching | 8 | Low | Low | P3 | 40 |
| **Total** | **180 files** | | | | **1,085 tests** |

### Test debt register

| Debt item | Impact | Effort | Tests affected | Priority | Owner | Target |
|---|---|---|---|---|---|---|
| E2E suite too large (5% vs 3% target) | CI speed, flakiness | 6 weeks | 250 tests to migrate | P0 | Web Lead | Q4 2026 |
| No contract tests for 3 internal APIs | Integration bugs | 3 weeks | 0 → 120 tests | P1 | Platform Lead | Q3 2026 |
| Mutation score < 40% in 4 modules | Bug escape risk | 8 weeks | Improve existing tests | P1 | AI Lead | Q4 2026 |
| Accessibility tests 7.8× target | CI speed | 2 weeks | Consolidate 400 → 200 | P2 | Design Lead | Q4 2026 |
| Performance tests not in CI | Perf regression | 4 weeks | Move 180 tests to post-merge | P1 | SRE Lead | Q3 2026 |
| No visual tests for Mobile | Visual regression | 3 weeks | 0 → 60 tests | P2 | Mobile Lead | Q4 2026 |
| Test data factories outdated | Test maintenance | 4 weeks | 800+ tests affected | P2 | Platform Lead | Q1 2027 |

### Test suite trust metrics

| Metric | Current | Target | Trend | Assessment |
|---|---|---|---|---|
| False positive rate (flaky fails) | 1.8% | < 1% | ↑ | Needs improvement |
| False negative rate (missed bugs in prod) | 12 bugs/quarter | < 8 | → | Adequate |
| Test suite pass rate (excluding flaky) | 99.2% | > 99.5% | → | Good |
| Mean time to detect regression | 4.2 hours | < 2 hours | ↓ | Improving |
| Developer trust survey ("I trust the test suite") | 68% | > 80% | → | Needs improvement |
| Tests skipped/disabled | 23 (0.18%) | < 0.1% | ↓ | Adequate |
| Test suite change frequency (tests added/modified/week) | 85 | 80-120 | → | Healthy |

## Action recommendations

1. **Flatten the E2E pyramid**: 620 E2E tests (5% vs 3% target); migrate 250 E2E → integration/contract tests, target 3% by Q4
2. **Flaky test sprint**: 47 flaky tests, 17 open; dedicate 2 engineers for 1 sprint, fix all open flaky tests, achieve < 1% flake rate
3. **Mutation testing adoption**: 42% mutation score; add mutation testing to critical modules (Auth, Payment, API Gateway), target > 60%
4. **Coverage gap closure (P0)**: 460 tests needed for API error paths + auth edge cases; prioritize in current sprint, integrate into definition of done
5. **Contract test expansion**: 0 contract tests for 3 internal APIs; add Pact contract tests for all internal service boundaries
6. **E2E sharding optimization**: 6m 30s E2E suite; increase sharding from 8→12 workers, target < 5 min
7. **Developer trust rebuild**: 68% trust score; publish test suite health report monthly, celebrate flaky test fixes, add test reliability to team OKRs
8. **Performance tests in CI**: move 180 performance tests from nightly to post-merge gate, add performance regression thresholds
9. **Test data factory refresh**: 800+ tests use outdated factories; modernize test data generation, add schema validation
10. **Monthly test health review**: review pyramid distribution, flaky test trends, coverage gaps, and execution speed



- Coverage as target → setting a line coverage target (e.g., "80%") without context; teams write meaningless tests that assert `true === true` to hit the number
- E2E as safety blanket → writing E2E tests for every scenario because "it tests the real thing"; E2E tests are the most expensive and least reliable, use them sparingly
- Ignoring flaky tests → "just re-run it, it'll pass" culture; every re-run normalizes flakiness and erodes trust, quarantine and fix immediately
- Ice cream cone anti-pattern → lots of E2E, few integration, few unit tests; the most expensive tests are the most numerous, which is the opposite of the pyramid
- Test suite as a gatekeeper → requiring 100% pass before merge when the suite has flaky tests; this incentivizes ignoring failures, not fixing them

## Related

- Same class: [dashboard-quality-metrics](dashboard-quality-metrics.md) — code quality and bug metrics
- Same class: [dashboard-dora-metrics](../infrastructure/dashboard-dora-metrics.md) — DORA delivery metrics
- Same class: [dashboard-developer-experience](../engineering/dashboard-developer-experience.md) — developer experience
- Same class: [dashboard-team-velocity](../process/dashboard-team-velocity.md) — team velocity
- References: Martin Fowler — *TestPyramid*; Google — *Testing on the Toilet*; Thoughtworks — *Testing Trophy*; Kent Beck — *Test-Driven Development*; Ham Vocke — *Practical Test Pyramid*