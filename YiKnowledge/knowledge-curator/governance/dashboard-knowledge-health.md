---
title: knowledge health dashboard
aliases:
- knowledge base dashboard
- KB health dashboard
- knowledge management dashboard
- curation dashboard
tags:
- dashboard
- knowledge
- curation
- freshness
- coverage
- quality
category: knowledge-curator/governance
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: monthly
roles:
- knowledge-curator
- tech-lead
- engineer
benefit: knowledge base health and coverage visible at a glance
acceptance_criteria:
  - "data source and refresh cadence are documented"
  - "key metrics are defined with thresholds or targets"
  - "visualization choices are explained and accessible"
related:
- ./governance.md
- ./readiness-checklist.md
- ../diagrams/dashboard-index.md
- ../../INDEX.md
tacit: false
---

# knowledge health dashboard

> **As a** knowledge curator, **I want to** track the health and coverage of the knowledge base, **so that** knowledge gaps, stale content, and quality issues are identified and addressed systematically.

> A knowledge base is a living asset — it decays without maintenance. This dashboard tracks coverage, freshness, quality, tacitness, and retrieval effectiveness across the entire knowledge library.

## Summary

- 5 knowledge dimensions: coverage and completeness, freshness and staleness, content quality, tacit knowledge capture, retrieval effectiveness
- Coverage measured by role directory, problem domain, and project; gaps identified against target
- Freshness tracked by last-updated date; stale content (> 6 months without review) flagged
- Quality assessed via frontmatter completeness, acceptance criteria fulfillment, and link validity
- Tacit knowledge capture tracked via tacitness score and explicit-to-tacit ratio
- Dashboard reviewed monthly; content audit quarterly; full refresh biannually

## Core viewpoints

- Knowledge decays — every day, some knowledge becomes outdated; review cycles are the immune system
- Tacit knowledge is the most valuable and the most fragile — it lives in people's heads and leaves when they leave
- Coverage without quality is noise — a thousand shallow articles are worse than a hundred deep ones
- Retrieval is the ultimate test — if people can't find knowledge in 2 hops, it might as well not exist

## Key information

### 5-panel knowledge overview

```
┌──────────────────────────────────────────────────────────────────┐
│  COVERAGE & COMPLETENESS         │  FRESHNESS & STALENESS          │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Total files: 1,047     │   │  │  Fresh (< 3mo): 72%     │   │
│  │  Roles: 11/11 (100%)    │   │  │  Aging (3-6mo): 18%     │   │
│  │  Domains: 42/45 (93%)   │   │  │  Stale (6-12mo): 7%    │   │
│  │  Projects: 4/4 (100%)   │   │  │  Dead (> 12mo): 3%      │   │
│  │  Gaps: 8 identified     │   │  │  Review overdue: 42     │   │
│  │  Target: 95% coverage   │   │  │  Avg freshness: 48 days │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  CONTENT QUALITY                │  TACIT KNOWLEDGE CAPTURE        │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Frontmatter: 94% ✓     │   │  │  Tacitness: 32%          │   │
│  │  Acceptance:  88% ✓     │   │  │  Explicit:   68%         │   │
│  │  Links valid: 96%       │   │  │  Captured:   18 this Q   │   │
│  │  No dead links: 42      │   │  │  At risk:    12 people   │   │
│  │  Draft ratio: 8%        │   │  │  SPOF:       8 domains   │   │
│  │  Avg length: 2,850 words│   │  │  Interviews: 6 this Q    │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Coverage by role directory

| Role directory | Files | Target | Coverage | Gaps identified | Health |
|---|---|---|---|---|---|
| engineer/ | ~390 | 400 | 98% | 2 domains missing | Green |
| tech-lead/ | ~78 | 85 | 92% | 2 domains light | Yellow |
| product-manager/ | ~106 | 110 | 96% | 1 domain missing | Green |
| ai-engineer/ | ~80 | 85 | 94% | 1 domain light | Green |
| oncall-sre/ | ~67 | 70 | 96% | Complete | Green |
| executive/ | ~57 | 60 | 95% | 1 domain missing | Green |
| knowledge-curator/ | ~54 | 55 | 98% | Complete | Green |
| new-hire/ | ~9 | 12 | 75% | 3 projects light | Yellow |
| brd/ | ~241 | — | — | Seed data, not curated | Yellow |
| **Total** | **~1,047** | | | | |

### Coverage gaps (top 8)

| Gap | Role | Domain | Priority | Action |
|---|---|---|---|---|
| new-hire: YiPet onboarding | new-hire | onboarding | High | Complete YiPet onboarding guide |
| new-hire: YiVad onboarding | new-hire | onboarding | Medium | Add YiVad-specific onboarding |
| new-hire: YiAi onboarding | new-hire | onboarding | Medium | Add YiAi-specific onboarding |
| tech-lead: architecture patterns | tech-lead | architecture | Medium | Add architecture decision patterns |
| tech-lead: capacity planning | tech-lead | capacity | Low | Expand capacity planning guide |
| executive: reading-list | executive | reading-list | Low | Add curated reading lists |
| product-manager: frameworks | product-manager | frameworks | Low | Add PM framework comparisons |

### Freshness by role directory

| Role | Fresh (< 3mo) | Aging (3-6mo) | Stale (6-12mo) | Dead (> 12mo) | Review overdue |
|---|---|---|---|---|---|
| engineer/ | 75% | 15% | 7% | 3% | 18 |
| tech-lead/ | 78% | 12% | 6% | 4% | 8 |
| product-manager/ | 72% | 18% | 8% | 2% | 6 |
| ai-engineer/ | 80% | 14% | 4% | 2% | 3 |
| oncall-sre/ | 74% | 16% | 8% | 2% | 4 |
| executive/ | 68% | 22% | 8% | 2% | 2 |
| knowledge-curator/ | 70% | 20% | 8% | 2% | 1 |
| new-hire/ | 65% | 25% | 8% | 2% | 0 |
| **Overall** | **72%** | **18%** | **7%** | **3%** | **42** |

### Content quality metrics

| Quality dimension | Count | Total | % | Target | Status |
|---|---|---|---|---|---|
| Frontmatter complete (roles + benefit + acceptance) | 984 | 1,047 | 94% | > 95% | Yellow |
| Acceptance criteria fulfilled | 921 | 1,047 | 88% | > 90% | Yellow |
| Valid internal links | 4,582 | 4,624 | 99.1% | 100% | Yellow |
| Dead links (404) | 42 | 4,624 | 0.9% | 0% | Red |
| Draft ratio | 84 | 1,047 | 8% | < 5% | Yellow |
| Average word count | 2,850 | — | — | > 1,000 | Green |
| Files without user-story header | 63 | 1,047 | 6% | 0% | Yellow |
| Files without related links | 125 | 1,047 | 12% | < 10% | Yellow |

### Dead link report (top 5 files)

| File | Dead links | Target | Last known good |
|---|---|---|---|
| engineer/process/harden-supply-chain.md | 4 | Deleted strategies files | 2026-05 |
| ai-engineer/platform/llm-comparison.md | 3 | Renamed files | 2026-06 |
| engineer/lessons/INDEX.md | 3 | Moved files | 2026-04 |
| tech-lead/decisions/INDEX.md | 2 | Reorganized ADRs | 2026-05 |
| product-manager/INDEX.md | 2 | Moved metrics files | 2026-06 |

### Tacit knowledge capture

| Metric | Current | Target | Trend |
|---|---|---|---|
| Tacitness ratio (tacit:true / total) | 32% | < 25% | ↓ 3% |
| Explicit knowledge files | 712 | > 750 | ↑ 18 |
| Tacit knowledge files | 335 | < 300 | ↓ 15 |
| Knowledge captured this quarter | 18 | > 20 | On track |
| Expert interviews conducted | 6 | > 8 | Behind |
| SPOF domains (single expert) | 8 | 0 | ↓ 2 |
| People at risk (key knowledge holder) | 12 | < 5 | ↓ 3 |

### Tacitness by role

| Role | Tacit files | Explicit files | Tacitness | Risk |
|---|---|---|---|---|
| engineer/ | 110 | 280 | 28% | Medium |
| tech-lead/ | 35 | 43 | 45% | High |
| product-manager/ | 42 | 64 | 40% | High |
| ai-engineer/ | 28 | 52 | 35% | Medium |
| oncall-sre/ | 22 | 45 | 33% | Medium |
| executive/ | 20 | 37 | 35% | Medium |
| knowledge-curator/ | 15 | 39 | 28% | Low |
| new-hire/ | 3 | 6 | 33% | Medium |

### Retrieval effectiveness

| Metric | Current | Target | Status |
|---|---|---|---|
| 2-hop reachability | 88% | > 90% | Yellow |
| Average hops to leaf | 1.8 | < 1.5 | Yellow |
| INDEX.md coverage (role level) | 10/11 | 11/11 | Yellow |
| Cross-reference links per file | 4.4 | > 5 | Yellow |
| Search success rate (internal) | 82% | > 90% | Red |
| First-try retrieval rate | 68% | > 80% | Red |

### Content review cadence

| Review cycle | Files | Overdue | % On time | Health |
|---|---|---|---|---|
| Weekly | 15 | 0 | 100% | Green |
| Monthly | 85 | 5 | 94% | Yellow |
| Quarterly | 320 | 22 | 93% | Yellow |
| Yearly | 480 | 15 | 97% | Green |
| **Total** | **900** | **42** | **95%** | Yellow |

## Action recommendations

1. **Fix 42 dead links**: internal links generate 404s; fix or redirect within 2 weeks; add link checker to CI
2. **Review 42 overdue files**: files past their review_cycle date; assign to role owners for review
3. **Reduce tacitness in tech-lead and product-manager**: 45% and 40% tacitness is dangerously high; conduct expert interviews
4. **Improve retrieval**: 68% first-try retrieval rate is too low; improve INDEX.md files, add cross-references
5. **Complete new-hire onboarding**: 3 projects with incomplete onboarding; YiPet, YiVad, YiAi each need complete guides
6. **Reduce draft ratio**: 84 draft files (8%); either promote to stable or archive
7. **Monthly knowledge review**: review this dashboard monthly; assign action items to role owners



- Knowledge hoarding → experts keep knowledge tacit; incentivize sharing through recognition and review
- Write-only documentation → files created but never read; measure retrieval, not just coverage
- Stale acceptance → "stable" files that no longer meet acceptance criteria; re-validate on review
- Link rot → cross-references not maintained; dead links erode trust in the entire knowledge base
- Coverage for coverage's sake → adding shallow files to hit coverage targets; quality over quantity

## Related

- Same class: [dashboard-index](../diagrams/dashboard-index.md) — dashboard index
- Upstream: [../../INDEX.md](../../INDEX.md) — full library index
- Downstream: [governance](governance.md) — knowledge governance
- Downstream: [readiness-checklist](readiness-checklist.md) — launch readiness checklist
- References: Tiago Forte — *Building a Second Brain*; Stan Garfield — *Knowledge Management*; KM Institute — *Knowledge Health Assessment Framework*