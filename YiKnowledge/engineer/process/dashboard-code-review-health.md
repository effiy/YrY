---
title: code review health dashboard
aliases:
- code review quality dashboard
- code review velocity dashboard
- PR review dashboard
- review culture dashboard
tags:
- dashboard
- code-review
- pull-request
- review-quality
- collaboration
- developer-productivity
category: engineer/process
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
benefit: code review health and effectiveness visible at a glance
acceptance_criteria:
- frontmatter roles + benefit + acceptance_criteria present
- descriptive verb-phrase filename, hyphens only, no underscores or digits
- body contains user story header + 7 fixed-order sections
- review turnaround, review depth, reviewer load, review quality, and PR size distribution defined
related:
- ./dashboard-team-velocity.md
- ../quality-security/dashboard-quality-metrics.md
- ../engineering/dashboard-developer-experience.md
- ../engineering/dashboard-developer-productivity.md
- ../infrastructure/dashboard-dora-metrics.md
tacit: false
---

# code review health dashboard

> **As a** tech lead, **I want to** track code review health and effectiveness, **so that** every code change is reviewed thoroughly, efficiently, and without burning out reviewers.

> Code review is the last line of defense before code reaches production. This dashboard tracks review turnaround, review depth, reviewer load, review quality, and PR size distribution — turning code review from a bottleneck into a quality multiplier.

## Summary

- 5 code review dimensions: review turnaround, review depth, reviewer load, review quality, PR size distribution
- 680 PRs/month across 8 teams; 92% reviewed within SLA; average review turnaround: 4.2 hours
- 45 active reviewers; 8 reviewers carry > 30% of review load; 3 reviewers at risk of burnout
- Review quality measured by: defect escape rate, review comment density, re-review rate, and reviewer calibration
- Dashboard reviewed monthly; code review health retrospective quarterly with engineering leadership

## Core viewpoints

- Speed of review > thoroughness of review (within reason) — a 30-minute review that unblocks a developer is better than a 2-hour review that finds 3 more nits; optimize for flow
- Reviewer load is a shared resource — when 20% of reviewers do 60% of reviews, the system is fragile; review load must be distributed or the bottleneck will eventually break
- PR size is the single biggest lever — a 50-line PR gets a thorough review; a 500-line PR gets a rubber stamp; small PRs are the foundation of effective code review
- Review quality is multidimensional — it's not just about finding bugs; good reviews catch design issues, improve readability, share knowledge, and build team norms

## Key information

### 5-panel code review overview

```
┌──────────────────────────────────────────────────────────────────┐
│  REVIEW TURNAROUND                │  REVIEW DEPTH                     │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  PRs/month:   680       │   │  │  Comments/PR: 4.8 avg    │   │
│  │  Time to first: 2.1 hr  │   │  │  Substantive: 2.2 (46%)  │   │
│  │  Time to merge: 4.2 hr  │   │  │  Nitpick:     1.5 (31%)  │   │
│  │  < 1 hour:  28%         │   │  │  Question:    0.8 (17%)  │   │
│  │  1-4 hours: 42%         │   │  │  Blocking:    0.3 (6%)   │   │
│  │  4-24 hours: 22%        │   │  │  Praise:      0.2 (4%)   │   │
│  │  > 24 hours: 8%         │   │  │  Rework req:  18% of PRs │   │
│  │  SLA met:    92%        │   │  │  Rework cycles: 1.4 avg  │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  REVIEWER LOAD                    │  REVIEW QUALITY                   │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Reviewers: 45 active   │   │  │  Defect escape: 0.8/PR   │   │
│  │  Reviews/reviewer: 15/mo│   │  │  Post-merge bug: 1.2%    │   │
│  │  Top 20% do 58% of revs │   │  │  Review coverage: 88%    │   │
│  │  At risk: 3 reviewers   │   │  │  Style issues caught:92% │   │
│  │  Load imbalance: 0.42   │   │  │  Logic issues caught: 78%│   │
│  │  New reviewer ramp: 8wk │   │  │  Design issues caught:65%│   │
│  │  Review burnout: 18%    │   │  │  Security issues:   58%  │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Review turnaround by team

| Team | PRs/mo | Time to first review | Time to merge | < 1 hour | 1-4 hours | 4-24 hours | > 24 hours | SLA met |
|---|---|---|---|---|---|---|---|---|
| Platform | 95 | 1.8 hr | 3.5 hr | 35% | 45% | 15% | 5% | 95% |
| AI/ML | 85 | 2.5 hr | 5.2 hr | 28% | 40% | 22% | 10% | 90% |
| Web Frontend | 120 | 1.5 hr | 3.2 hr | 38% | 48% | 12% | 2% | 98% |
| Mobile | 75 | 2.2 hr | 4.8 hr | 30% | 42% | 20% | 8% | 92% |
| Data | 55 | 3.5 hr | 7.2 hr | 18% | 35% | 30% | 17% | 82% |
| SRE | 48 | 2.0 hr | 4.0 hr | 32% | 44% | 18% | 6% | 94% |
| Integrations | 52 | 2.8 hr | 5.5 hr | 25% | 38% | 25% | 12% | 88% |
| Design System | 90 | 1.2 hr | 2.5 hr | 42% | 50% | 7% | 1% | 99% |
| Other (4 teams) | 60 | 3.8 hr | 8.5 hr | 12% | 30% | 35% | 23% | 78% |
| **Overall** | **680** | **2.1 hr** | **4.2 hr** | **28%** | **42%** | **22%** | **8%** | **92%** |

### Review turnaround by PR size

| PR size (lines) | PRs/mo | % of total | Time to first review | Time to merge | Comments/PR | Rework rate | Merge rate |
|---|---|---|---|---|---|---|---|
| **< 25 lines** | 185 | 27% | 1.2 hr | 2.0 hr | 2.1 | 8% | 98% |
| **25-100 lines** | 245 | 36% | 1.8 hr | 3.5 hr | 4.2 | 15% | 95% |
| **100-300 lines** | 150 | 22% | 3.2 hr | 6.5 hr | 7.8 | 25% | 88% |
| **300-600 lines** | 65 | 10% | 8.5 hr | 18.2 hr | 12.5 | 38% | 72% |
| **> 600 lines** | 35 | 5% | 24.5 hr | 48.2 hr | 18.2 | 55% | 45% |
| **Overall** | **680** | | | | | | |

### Review depth metrics

| Team | Comments/PR | Substantive | Nitpick | Question | Blocking | Praise | Rework requests | Rework cycles |
|---|---|---|---|---|---|---|---|---|
| Platform | 5.8 | 2.8 (48%) | 1.8 (31%) | 0.8 (14%) | 0.4 (7%) | 0.2 (3%) | 18% | 1.3 |
| AI/ML | 4.5 | 2.0 (44%) | 1.2 (27%) | 0.9 (20%) | 0.4 (9%) | 0.3 (7%) | 22% | 1.5 |
| Web Frontend | 4.2 | 1.8 (43%) | 1.5 (36%) | 0.6 (14%) | 0.3 (7%) | 0.2 (5%) | 15% | 1.2 |
| Mobile | 3.8 | 1.5 (39%) | 1.4 (37%) | 0.7 (18%) | 0.2 (5%) | 0.2 (5%) | 18% | 1.4 |
| Data | 5.2 | 2.5 (48%) | 1.5 (29%) | 0.8 (15%) | 0.4 (8%) | 0.2 (4%) | 25% | 1.8 |
| SRE | 5.5 | 2.8 (51%) | 1.2 (22%) | 0.9 (16%) | 0.6 (11%) | 0.2 (4%) | 22% | 1.5 |
| Integrations | 3.5 | 1.5 (43%) | 1.2 (34%) | 0.6 (17%) | 0.2 (6%) | 0.1 (3%) | 18% | 1.3 |
| Design System | 3.8 | 1.5 (39%) | 1.4 (37%) | 0.7 (18%) | 0.2 (5%) | 0.2 (5%) | 12% | 1.1 |
| **Overall** | **4.8** | **2.2 (46%)** | **1.5 (31%)** | **0.8 (17%)** | **0.3 (6%)** | **0.2 (4%)** | **18%** | **1.4** |

### Reviewer load distribution

| Reviewer group | Reviewers | Reviews/mo (each) | % of total reviews | Load score | Risk |
|---|---|---|---|---|---|
| **Top 10% (heavy)** | 5 | 38 | 28% | 85/100 | **High — burnout risk** |
| **Top 10-30% (active)** | 9 | 22 | 29% | 55/100 | Medium |
| **Middle 30-70% (regular)** | 18 | 10 | 32% | 28/100 | Low |
| **Bottom 30% (light)** | 13 | 5 | 11% | 12/100 | Low |
| **Total** | **45** | **15 avg** | **100%** | | |

### Reviewer burnout indicators

| Reviewer | Team | Reviews/mo | Avg review time | Comment rate | After-hours % | Weekend % | Burnout score | Status |
|---|---|---|---|---|---|---|---|---|
| Reviewer A | Platform | 45 | 28 min | 6.2 | 18% | 12% | 82/100 | **Critical** |
| Reviewer B | AI/ML | 42 | 22 min | 5.8 | 15% | 8% | 78/100 | **At risk** |
| Reviewer C | SRE | 38 | 35 min | 6.5 | 22% | 15% | 85/100 | **Critical** |
| Reviewer D | Web Frontend | 35 | 18 min | 4.5 | 12% | 5% | 72/100 | **At risk** |
| Reviewer E | Data | 32 | 30 min | 5.2 | 10% | 8% | 68/100 | Monitor |
| **Top 5 avg** | | **38.4** | **26.6 min** | **5.6** | **15.4%** | **9.6%** | **77/100** | |

### Review quality — defect escape analysis

| Defect type | Escaped per 100 PRs | Caught in review | Escape rate | Impact | Prevention |
|---|---|---|---|---|---|
| **Logic/semantic bug** | 1.2 | 78% | 22% | High | Test coverage + review checklists |
| **Performance regression** | 0.8 | 65% | 35% | High | Performance gate in CI |
| **Security vulnerability** | 0.3 | 58% | 42% | Critical | Security review for auth/data changes |
| **Design/architecture issue** | 0.5 | 65% | 35% | Medium | Design review for new patterns |
| **Style/convention violation** | 2.5 | 92% | 8% | Low | Automated linting |
| **Configuration error** | 0.6 | 72% | 28% | High | Config validation in CI |
| **API contract break** | 0.4 | 75% | 25% | High | Contract testing |
| **Accessibility regression** | 0.3 | 62% | 38% | Medium | Automated a11y testing |
| **Overall** | **6.6** | **78%** | **22%** | | |

### Review comment taxonomy

| Comment type | % of total | Avg per PR | Example | Actionability |
|---|---|---|---|---|
| **Logic/Correctness** | 22% | 1.1 | "This will NPE if the list is empty" | High |
| **Design/Architecture** | 14% | 0.7 | "Should this be a separate service?" | High |
| **Readability/Clarity** | 18% | 0.9 | "Extract this into a named function" | Medium |
| **Performance** | 8% | 0.4 | "This is O(n²), consider a Map" | High |
| **Testing** | 10% | 0.5 | "Add a test for the empty state" | High |
| **Security** | 4% | 0.2 | "Sanitize this user input before rendering" | Critical |
| **Style/Formatting** | 12% | 0.6 | "Use camelCase here" | Low (auto-fixable) |
| **Documentation** | 6% | 0.3 | "Document this public API" | Medium |
| **Question/Clarification** | 8% | 0.4 | "Why did we choose this approach?" | Medium |
| **Praise/Encouragement** | 4% | 0.2 | "Nice solution!" | N/A |

### PR size distribution

| PR size range | % of PRs | Ideal % | Gap | Review thoroughness | Merge time | Rework rate |
|---|---|---|---|---|---|---|
| **< 25 lines** | 27% | 30% | -3% | 92% | 2.0 hr | 8% |
| **25-100 lines** | 36% | 40% | -4% | 85% | 3.5 hr | 15% |
| **100-300 lines** | 22% | 20% | +2% | 68% | 6.5 hr | 25% |
| **300-600 lines** | 10% | 7% | +3% | 45% | 18.2 hr | 38% |
| **> 600 lines** | 5% | 3% | +2% | 28% | 48.2 hr | 55% |
| **Average PR size** | **128 lines** | **< 100 lines** | **+28 lines** | | | |

### Review culture metrics

| Metric | Current | 3 months ago | 6 months ago | Target | Trend |
|---|---|---|---|---|---|
| PRs merged without review | 2.5% | 3.8% | 5.5% | < 1% | ↓ |
| Author response time to comments | 3.2 hr | 4.5 hr | 6.8 hr | < 2 hr | ↓ |
| Review ping rate (reminders) | 25% | 30% | 35% | < 15% | ↓ |
| "LGTM" rate (no comments) | 12% | 15% | 18% | < 10% | ↓ |
| Psychological safety score | 72/100 | 68/100 | 62/100 | > 80 | ↑ |
| Review satisfaction survey | 68/100 | 62/100 | 58/100 | > 80 | ↑ |
| New contributor review experience | 58/100 | 52/100 | 48/100 | > 75 | ↑ |

### Review automation

| Automation | Status | Coverage | Time saved | Issues |
|---|---|---|---|---|
| **Linting (ESLint, ruff, etc.)** | Active | 100% | 15 min/PR | None |
| **Formatting (Prettier, black)** | Active | 100% | 10 min/PR | None |
| **Type checking** | Active | 95% | 8 min/PR | 5% untyped code |
| **Automated testing (CI)** | Active | 100% | 20 min/PR | Flaky tests (1.8%) |
| **Code owners assignment** | Active | 100% | 5 min/PR | None |
| **PR size labeler** | Active | 100% | 2 min/PR | None |
| **Stale PR reminder** | Active | 100% | 3 min/PR | None |
| **AI code review (pilot)** | Pilot (Platform) | 25% | 12 min/PR | False positives (8%) |
| **Total time saved** | | | **~75 min/PR** | |

## Action recommendations

1. **Reviewer load rebalancing**: top 5 reviewers at 38 reviews/mo, 3 at critical burnout; implement review lottery/round-robin, cap at 25 reviews/reviewer/month
2. **PR size reduction**: 15% of PRs > 300 lines, 5% > 600 lines; enforce PR size guidelines, add CI warnings for > 400 lines, encourage stacked PRs
3. **After-hours review reduction**: 15.4% after-hours, 9.6% weekend for top reviewers; implement review SLA during business hours only, discourage after-hours review culture
4. **Security review gap**: 58% of security issues caught in review; require security review for auth/data/input changes, add security linting to CI
5. **Design review gap**: 65% of design issues caught; add architecture review for new patterns, design doc required for > 300 line changes
6. **"LGTM" culture reduction**: 12% of reviews have no comments; implement review checklist, encourage at least 1 substantive comment per review
7. **AI code review expansion**: 25% coverage, 8% false positive; expand pilot to all teams, tune false positive rate, focus on security and performance patterns
8. **New reviewer ramp**: 8-week ramp time; create reviewer mentorship program, pair new reviewers with experienced reviewers for first 20 reviews
9. **Psychological safety**: 72/100 score; train on constructive review language, celebrate good reviews, add praise as explicit review category
10. **Monthly review health review**: review turnaround, reviewer load, review quality, and defect escape with engineering leads



- Rubber-stamp reviews → "LGTM" with no substantive feedback; this is worse than no review because it creates a false sense of security
- Review as gatekeeping → using code review to enforce personal style preferences; automated linting should handle style, reviewers should focus on logic and design
- The "one reviewer" bottleneck → every PR goes through the same senior engineer; this creates a single point of failure and prevents knowledge distribution
- Review ping-pong → 5+ rounds of rework for minor issues; if a PR needs more than 3 rework rounds, switch to pair programming or a design discussion
- Review theater → reviewing code after it's already deployed; code review must happen before merge, not after

## Related

- Same class: [dashboard-team-velocity](dashboard-team-velocity.md) — team velocity and collaboration
- Same class: [dashboard-quality-metrics](../quality-security/dashboard-quality-metrics.md) — code quality and bugs
- Same class: [dashboard-developer-experience](../engineering/dashboard-developer-experience.md) — developer experience
- Same class: [dashboard-developer-productivity](../engineering/dashboard-developer-productivity.md) — developer productivity
- Same class: [dashboard-dora-metrics](../infrastructure/dashboard-dora-metrics.md) — DORA delivery metrics
- References: Google — *Code Review Developer Guide*; SmartBear — *Best Practices for Code Review*; Michaela Greiler — *Code Review: A Field Guide*; Palantir — *Code Review Practices*; Microsoft — *Code Review Research*