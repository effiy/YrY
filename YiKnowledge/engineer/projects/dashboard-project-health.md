---
title: project health dashboard
aliases:
- project dashboard
- cross-project dashboard
- project portfolio dashboard
- multi-project dashboard
tags:
- dashboard
- project
- cross-project
- portfolio
- yivad
- yiai
- yipet
category: engineer/projects
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: monthly
roles:
- engineer
- tech-lead
- product-manager
benefit: cross-project health and consistency visible at a glance
acceptance_criteria:
  - "data source and refresh cadence are documented"
  - "key metrics are defined with thresholds or targets"
  - "visualization choices are explained and accessible"
related:
- ./INDEX.md
- ../infrastructure/dashboard-dora-metrics.md
- ../quality-security/dashboard-quality-metrics.md
- ../../tech-lead/capacity/dashboard-engineering-capacity.md
tacit: false
---

# project health dashboard

> **As a** tech lead, **I want to** track health and consistency across all projects, **so that** cross-project drift is detected and best practices are shared systematically.

> Multiple projects naturally drift apart over time. This dashboard tracks project health, consistency, code quality, cross-project dependencies, and team distribution across YiVad, YiAi, and YiPet.

## Summary

- 5 project dimensions: project health scorecard, cross-project consistency, code quality comparison, cross-project dependencies, team distribution
- 3 projects tracked: YiVad (Web app), YiAi (API/backend), YiPet (Browser extension)
- Consistency measured across 12 dimensions: build tool, lint/formatter, test framework, CI, deployment, monitoring, etc.
- Cross-project dependencies tracked via contract tests, shared libraries, and API compatibility
- Dashboard reviewed monthly; cross-project alignment review quarterly

## Core viewpoints

- Projects drift apart naturally — without active alignment, each project evolves its own stack, patterns, and standards
- Consistency reduces cognitive load — an engineer moving between projects should feel familiar, not foreign
- Cross-project dependencies are fragile — a breaking change in a shared library cascades across all projects
- Project health is multi-dimensional — a project can be fast (DORA) but fragile (quality) or stable but stagnant

## Key information

### 5-panel project overview

```
┌──────────────────────────────────────────────────────────────────┐
│  PROJECT HEALTH SCORECARD        │  CROSS-PROJECT CONSISTENCY      │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  YiVad:  82/100 ████   │   │  │  Stack:     75% aligned │   │
│  │  YiAi:   78/100 ███▌    │   │  │  Patterns:  82% aligned │   │
│  │  YiPet:  72/100 ███▌    │   │  │  Process:   88% aligned │   │
│  │  Avg:    79/100         │   │  │  Standards: 85% aligned │   │
│  │  Trend:   ↑ 3 pts QoQ   │   │  │  Drift:     4 diverged  │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  CODE QUALITY COMPARISON         │  CROSS-PROJECT DEPENDENCIES    │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  YiVad: 88% cov, 2.1 bug│   │  │  Contract tests: 20     │   │
│  │  YiAi:  82% cov, 1.8 bug│   │  │  Shared libs:   4       │   │
│  │  YiPet: 75% cov, 3.2 bug│   │  │  API consumers: 3       │   │
│  │  Target: 85% coverage   │   │  │  Compat matrix: 100%    │   │
│  │  Gap:    YiPet -10%     │   │  │  Version skew: 2 libs   │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Project health scorecard

| Dimension | Weight | YiVad | YiAi | YiPet | Avg |
|---|---|---|---|---|---|
| DORA Performance | 20% | 85 | 78 | 72 | 81 |
| Code Quality | 20% | 82 | 80 | 70 | 81 |
| Security Posture | 15% | 80 | 78 | 75 | 80 |
| Architecture Health | 15% | 82 | 80 | 68 | 80 |
| Developer Experience | 15% | 85 | 75 | 72 | 79 |
| Documentation | 10% | 78 | 72 | 65 | 75 |
| Community/Adoption | 5% | 80 | 75 | 70 | 79 |
| **Weighted Score** | | **82** | **78** | **72** | **79** |

### Project profile

| Attribute | YiVad | YiAi | YiPet |
|---|---|---|---|
| **Type** | Web application | API backend | Browser extension |
| **Language** | TypeScript | Python | TypeScript |
| **Framework** | Vue 3 + Rsbuild | FastAPI + Uvicorn | React 18 + Webpack |
| **Database** | N/A | PostgreSQL + Redis | IndexedDB |
| **Team size** | 12 | 8 | 4 |
| **Age** | 2 years | 1.5 years | 2.5 years |
| **Users** | 12,400 | Internal (3 projects) | 8,500 |
| **Deploy frequency** | 5/week | 3/week | 1/week |
| **Build tool** | Rsbuild | N/A (Python) | Webpack |

### Cross-project consistency matrix

| Dimension | YiVad | YiAi | YiPet | Aligned? | Drift |
|---|---|---|---|---|---|
| Build tool (JS) | Rsbuild | N/A | Webpack | **No (2 of 3)** | YiPet on Webpack, needs migration |
| Lint/Format | Biome | Ruff | Biome | **87%** | YiAi uses Ruff (Python) |
| Test framework | Vitest | Pytest | Vitest | **75%** | YiAi uses Pytest (different lang) |
| CI/CD | GitHub Actions | GitHub Actions | GitHub Actions | **100%** | Aligned |
| Package manager | pnpm | pip | pnpm | **75%** | YiAi uses pip (different lang) |
| Monitoring | DataDog | DataDog | Sentry | **67%** | YiPet on Sentry |
| API style | REST + SSE | REST + SSE | Chrome API | **100%** | Aligned (JS projects) |
| Versioning | Semver | Semver | Semver | **100%** | Aligned |
| Branching | GitHub Flow | GitHub Flow | GitHub Flow | **100%** | Aligned |
| Code review | Required | Required | Required | **100%** | Aligned |
| Feature flags | LaunchDarkly | Custom | None | **50%** | YiPet no flags |
| Contract tests | 20 bidirectional | 20 bidirectional | 0 | **50%** | Only YiVad ↔ YiAi |

### Consistency score by category

| Category | Score | Trends |
|---|---|---|
| Stack (build, framework, package mgr) | 75% | YiPet migration to Rsbuild will improve to 100% |
| Patterns (API style, versioning, feature flags) | 82% | Feature flags not adopted by YiPet |
| Process (CI/CD, branching, code review) | 88% | Well-aligned across all projects |
| Tooling (lint, test, monitoring) | 68% | YiPet on Sentry, YiAi on Ruff/Pytest |
| Standards (versioning, semver) | 85% | Well-aligned |
| **Overall** | **80%** | **Target: > 85%** |

### Code quality comparison

| Metric | YiVad | YiAi | YiPet | Target |
|---|---|---|---|---|
| Line coverage | 88% | 82% | 75% | > 85% |
| Branch coverage | 82% | 76% | 68% | > 75% |
| Mutation score | 72% | 65% | 52% | > 70% |
| Bug escape rate | 2.1% | 1.8% | 3.2% | < 2% |
| Code duplication | 3.2% | 4.5% | 6.8% | < 3% |
| Complexity (avg) | 10.5 | 8.2 | 14.2 | < 10 |
| Tech debt (days) | 12 | 8 | 18 | < 10 |
| Documentation coverage | 78% | 72% | 65% | > 80% |

### Cross-project dependencies

| Dependency | From | To | Type | Version | Compat | Contract test |
|---|---|---|---|---|---|---|
| rpc-envelope | YiVad | YiAi | API contract | v2.1 | ✓ | 8 tests |
| rpc-envelope | YiAi | YiVad | API contract | v2.1 | ✓ | 8 tests |
| auth-session | YiVad | YiAi | Shared type | v1.5 | ✓ | 4 tests |
| auth-session | YiPet | YiAi | Shared type | v1.5 | ✓ | 0 tests |
| chat-protocol | YiVad | YiAi | API contract | v1.3 | ✓ | 4 tests |
| chat-protocol | YiPet | YiAi | API contract | v1.3 | ✓ | 0 tests |

### Version skew alerts

| Library | Projects | Versions | Max gap | Risk |
|---|---|---|---|---|
| ui-components | YiVad (v3.2), YiPet (v2.8) | 2 versions | 4 minor | YiPet missing 8 components |

### Team distribution

| Team | YiVad | YiAi | YiPet | Shared | Total |
|---|---|---|---|---|---|
| Web Frontend | 8 | 0 | 2 | 1 | 12 |
| AI/ML | 0 | 8 | 0 | 2 | 10 |
| Platform/SRE | 2 | 2 | 0 | 1 | 5 |
| Data | 0 | 3 | 0 | 1 | 4 |
| Security | 0 | 1 | 0 | 1 | 2 |
| Design | 2 | 0 | 1 | 0 | 3 |
| **Total** | **12** | **14** | **3** | **6** | **36** |

### Cross-project contribution

| Metric | Current | Target |
|---|---|---|
| Engineers contributing to 2+ projects | 28% | > 30% |
| Cross-project PRs (last 30 days) | 18 | > 20 |
| Shared library contributions | 12/month | > 15 |
| Cross-project knowledge sharing sessions | 2/month | > 4 |
| Cross-project code review | 22% of reviews | > 25% |

## Action recommendations

1. **YiPet quality improvement**: 72/100 health score, 75% coverage, 3.2% bug escape; prioritize Rsbuild migration and test coverage
2. **YiPet Webpack → Rsbuild migration**: only remaining project on Webpack; complete migration by Q3 end
3. **Fix ui-components version skew**: YiPet on v2.8 (4 minor versions behind); upgrade to v3.2
4. **Add contract tests for YiPet**: 0 contract tests with YiAi; add at least 4 bidirectional tests
5. **YiAi documentation**: 72% documentation coverage; improve API docs and onboarding guides
6. **Cross-project consistency**: 80% → 85%; align YiPet monitoring (Sentry → DataDog), add feature flags to YiPet
7. **Monthly cross-project review**: review health scores, consistency, and dependencies; share best practices
8. **Increase cross-project contributions**: 28% → 35% of engineers contributing to 2+ projects



- Project silos → each project evolves independently with no cross-pollination; shared libraries and contract tests prevent drift
- Blind consistency → forcing identical stacks where different needs exist; YiAi uses Python, that's a valid difference
- Version skew neglect → "we'll upgrade later" becomes "we're 12 versions behind"; version skew is technical debt
- Health score gaming → optimizing the score without improving the project; health score is a conversation starter, not a goal
- Ignoring small projects → small team ≠ low importance

## Related

- Same class: [dashboard-dora-metrics](../infrastructure/dashboard-dora-metrics.md) — DORA performance
- Same class: [dashboard-quality-metrics](../quality-security/dashboard-quality-metrics.md) — code quality
- Same class: [dashboard-architecture-health](../architecture-design/dashboard-architecture-health.md) — architecture health
- Downstream: per-project architecture summaries in [./yivad/](./yivad/), [./yiai/](./yiai/), [./yipet/](./yipet/)
- References: Team Topologies — Matthew Skelton & Manuel Pais; Google — *Software Engineering at Google* (Chapter 25: Cross-project)