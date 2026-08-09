---
title: ux health dashboard
aliases:
- UX dashboard
- user experience dashboard
- usability dashboard
- design system dashboard
tags:
- dashboard
- ux
- usability
- accessibility
- design-system
- user-research
category: product-manager/discovery/ux
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: monthly
roles:
- product-manager
- engineer
- tech-lead
benefit: user experience quality and design system health visible at a glance
acceptance_criteria:
  - "data source and refresh cadence are documented"
  - "key metrics are defined with thresholds or targets"
  - "visualization choices are explained and accessible"
related:
- ../metrics/dashboard-product-portfolio.md
- ../../delivery/dashboard-product-delivery.md
- ../../strategy/dashboard-product-strategy.md
- ../../../engineer/architecture-design/dashboard-architecture-health.md
tacit: false
---

# ux health dashboard

> **As a** product manager, **I want to** track user experience quality and design system health, **so that** UX degradation is detected before it impacts user satisfaction and retention.

> UX is not just how it looks — it's how it works. This dashboard tracks usability, accessibility, design system health, user research, and UX performance.

## Summary

- 5 UX dimensions: usability metrics, accessibility compliance, design system health, user research pipeline, UX performance
- Usability tracked via task success rate, time-on-task, error rate, and System Usability Scale (SUS)
- Accessibility measured against WCAG 2.2 AA standards with automated and manual audit results
- Design system health tracked by component adoption, consistency score, and token coverage
- Dashboard reviewed monthly; accessibility audit quarterly; usability benchmark biannually

## Core viewpoints

- Usability is measurable — task success rate, time-on-task, and error rate are objective UX metrics
- Accessibility is not optional — it's a legal requirement (WCAG, ADA, EAA) and a quality baseline
- Design system is infrastructure — inconsistent components create user confusion and engineering waste
- UX performance is part of UX — a beautiful page that takes 5 seconds to load is bad UX

## Key information

### 5-panel UX overview

```
┌──────────────────────────────────────────────────────────────────┐
│  USABILITY METRICS               │  ACCESSIBILITY COMPLIANCE       │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Task success: 87% ████ │   │  │  WCAG 2.2 AA: 82% ████ │   │
│  │  Time-on-task: 42s avg  │   │  │  Critical:    0 issues  │   │
│  │  Error rate:   4.2%     │   │  │  Serious:     5 issues  │   │
│  │  SUS score:    78/100   │   │  │  Moderate:   18 issues  │   │
│  │  Learnability: 85%      │   │  │  Minor:      32 issues  │   │
│  │  CSAT:         4.2/5    │   │  │  Auto-pass:   72%       │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  DESIGN SYSTEM HEALTH           │  USER RESEARCH PIPELINE         │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Components: 86 total    │   │  │  Studies:     8 this Q │   │
│  │  Adoption:   78% ███▌   │   │  │  Participants: 42       │   │
│  │  Consistency: 85% ████  │   │  │  Insights:    24        │   │
│  │  Token cov:  92% ████▌  │   │  │  Applied:     18 (75%) │   │
│  │  Figma sync: 88% ████   │   │  │  Repository:  85 docs  │   │
│  │  Coverage:   4/4 projects│  │  │  Cadence:     2/week   │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Usability metrics by key task

| Task | Success rate | Time-on-task | Error rate | SUS component | Target |
|---|---|---|---|---|---|
| Sign up and onboard | 78% | 2.5 min | 8.2% | 72 | 85% |
| Create first AI chat | 92% | 35s | 2.1% | 85 | 90% |
| Run AI code review | 85% | 1.8 min | 5.5% | 78 | 88% |
| Search knowledge base | 88% | 22s | 3.2% | 82 | 90% |
| Configure settings | 82% | 1.2 min | 6.8% | 75 | 85% |
| Export results | 75% | 2.2 min | 12.5% | 68 | 82% |
| Invite team member | 90% | 45s | 3.0% | 84 | 92% |
| **Overall** | **87%** | **42s** | **4.2%** | **78** | **90%** |

### Usability benchmarks (SUS by product area)

| Product area | SUS score | Percentile | Grade | Trend |
|---|---|---|---|---|
| AI Chat | 82 | 85th | A | ↑ +3 |
| AI Code Review | 78 | 75th | B | ↑ +5 |
| Smart Search | 80 | 80th | A | → |
| Knowledge Base | 76 | 70th | B | ↑ +2 |
| Settings/Admin | 72 | 60th | C | → |
| Onboarding | 74 | 65th | B | ↑ +4 |
| Mobile App | 68 | 50th | C | ↑ +2 |
| **Overall** | **78** | **75th** | **B** | **↑ +2** |

### Accessibility compliance (WCAG 2.2 AA)

| Principle | Total checks | Pass | Fail | Pass rate | Critical issues |
|---|---|---|---|---|---|
| **Perceivable** | 28 | 24 | 4 | 86% | 0 |
| — Text alternatives | 6 | 5 | 1 | 83% | 0 |
| — Color contrast | 8 | 6 | 2 | 75% | 0 |
| — Adaptable content | 8 | 7 | 1 | 88% | 0 |
| — Distinguishable | 6 | 6 | 0 | 100% | 0 |
| **Operable** | 24 | 19 | 5 | 79% | 0 |
| — Keyboard accessible | 8 | 5 | 3 | 63% | 0 |
| — Enough time | 4 | 4 | 0 | 100% | 0 |
| — Navigable | 8 | 7 | 1 | 88% | 0 |
| — Input modalities | 4 | 3 | 1 | 75% | 0 |
| **Understandable** | 18 | 15 | 3 | 83% | 0 |
| **Robust** | 12 | 10 | 2 | 83% | 0 |
| **Total** | **82** | **68** | **14** | **82%** | **0** |

### Accessibility issue backlog

| Severity | Count | Avg age | Oldest | SLA | Status |
|---|---|---|---|---|---|
| Critical (blocks usage) | 0 | — | — | Fix in 24h | Green |
| Serious (major difficulty) | 5 | 12 days | 28 days | Fix in 2 weeks | Yellow |
| Moderate (minor difficulty) | 18 | 35 days | 85 days | Fix in 2 months | Yellow |
| Minor (cosmetic) | 32 | 52 days | 120 days | Fix in 3 months | Yellow |

### Design system health

| Metric | Current | Target | Status |
|---|---|---|---|
| Total components | 86 | — | |
| Component adoption rate | 78% | > 85% | Yellow |
| Visual consistency score | 85% | > 90% | Yellow |
| Design token coverage | 92% | > 95% | Yellow |
| Figma-code sync accuracy | 88% | > 90% | Yellow |
| Projects using design system | 4/4 | 4/4 | Green |
| Component documentation | 82% | > 90% | Yellow |
| Avg component age (since last update) | 45 days | < 60 days | Green |

### Component adoption by project

| Project | Total components used | From design system | Custom/one-off | Adoption rate |
|---|---|---|---|---|
| YiVad | 72 | 58 | 14 | 81% |
| YiAi (admin UI) | 34 | 28 | 6 | 82% |
| YiPet | 45 | 32 | 13 | 71% |
| **Overall** | | | | **78%** |

### Top custom components (should be in design system)

| Component | Used in | Instances | Why custom | Priority |
|---|---|---|---|---|
| AI Chat Bubble | YiVad, YiPet | 2 projects | No design system equivalent | High |
| Code Diff Viewer | YiVad | 1 project | Specialized, but reusable | High |
| Knowledge Tree | YiVad | 1 project | Could be generalized | Medium |
| Multi-select with search | YiVad, YiPet | 2 projects | No design system equivalent | High |
| Status Badge (with animation) | YiVad, YiAi, YiPet | 3 projects | Used everywhere | High |

### User research pipeline

| Stage | Count | This quarter |
|---|---|---|
| Research questions submitted | 32 | 8 |
| Studies planned | 18 | 5 |
| Studies in progress | 4 | 2 |
| Studies completed | 45 | 8 |
| Insights generated | 142 | 24 |
| Insights applied (shipped) | 98 | 18 (75%) |
| Insights in backlog | 44 | 6 |

### Research methods used

| Method | This Q | Insights generated | Cost per insight | Effectiveness |
|---|---|---|---|---|
| Usability testing (moderated) | 3 | 8 | $450 | High |
| Usability testing (unmoderated) | 2 | 6 | $180 | Medium |
| User interviews | 4 | 10 | $380 | High |
| Surveys (NPS, CSAT, SUS) | 2 | 4 | $120 | Medium |
| Analytics/behavioral | Continuous | 6 | $50 | Medium |
| A/B testing | 3 | 4 | $250 | High |
| Heuristic evaluation | 1 | 3 | $80 | Medium |

### UX performance (perceived)

| Metric | Current | Target | Framework |
|---|---|---|---|
| LCP (Largest Contentful Paint) | 1.8s | < 2.5s | Core Web Vitals |
| INP (Interaction to Next Paint) | 120ms | < 200ms | Core Web Vitals |
| CLS (Cumulative Layout Shift) | 0.05 | < 0.1 | Core Web Vitals |
| FCP (First Contentful Paint) | 0.8s | < 1.8s | |
| TTFB (Time to First Byte) | 320ms | < 800ms | |
| Perceived load time (user survey) | 3.2/5 | > 4.0/5 | CSAT |

### UX debt inventory

| Debt type | Items | Impact | Remediation (days) |
|---|---|---|---|
| Inconsistent patterns | 12 | Medium — user confusion | 8 |
| Missing accessibility | 14 | High — legal risk | 12 |
| Design-code drift | 8 | Medium — implementation ≠ design | 6 |
| Unused components | 5 | Low — maintenance burden | 2 |
| Mobile responsiveness | 6 | High — 35% mobile users | 10 |
| **Total UX debt** | **45 items** | | **38 days** |

## Action recommendations

1. **Fix serious accessibility issues**: 5 serious issues, 12-day avg age; target all resolved within 2 weeks
2. **Improve keyboard accessibility**: 63% pass rate is the weakest area; add keyboard navigation to 3 failing components
3. **Promote top custom components**: 5 components used across projects should be in the design system; add this quarter
4. **Improve Export task usability**: 75% success rate, 12.5% error rate — worst-performing task; redesign workflow
5. **Mobile responsiveness**: 6 items, 35% mobile users; dedicate 1 sprint to mobile UX fixes
6. **Increase design system adoption**: 78% → 85%; YiPet at 71% is the main gap; reduce custom components
7. **Monthly UX review**: review usability scores, accessibility progress, and research insights applied
8. **Quarterly accessibility audit**: automated + manual audit; target 90% WCAG 2.2 AA compliance by Q4



- Design over function → beautiful UI that's hard to use; usability metrics are the truth, not designer opinion
- Accessibility as afterthought → "we'll fix accessibility later"; accessibility must be part of the definition of done
- Design system as suggestion → teams building custom components instead of using the system; design system is infrastructure
- UX theater → user research done but insights never applied; 75% application rate is the target, not just research volume
- Ignoring mobile → designing for desktop only; 35% mobile users deserve a first-class experience

## Related

- Same class: [dashboard-product-portfolio](../metrics/dashboard-product-portfolio.md) — product metrics
- Same class: [dashboard-product-delivery](../../delivery/dashboard-product-delivery.md) — delivery execution
- Same class: [dashboard-quality-metrics](../../../engineer/quality-security/dashboard-quality-metrics.md) — code quality
- References: Nielsen Norman Group — *Usability Heuristics*; WCAG 2.2 — *Web Content Accessibility Guidelines*; Google — *Core Web Vitals*; Brad Frost — *Atomic Design*