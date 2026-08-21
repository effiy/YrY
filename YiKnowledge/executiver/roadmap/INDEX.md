---
title: roadmap/ MOC
aliases: [roadmap-moc, roadmap-index]
tags: [index, roadmap, planning, okr, budget]
category: executiver/roadmap
created: 2026-08-18
updated: 2026-08-18
last_verified: 2026-08-18
source: internal
type: summary
lifecycle: reference
status: stable
review_cycle: quarterly
roles: [executiver, leader, producter]
benefit: "Navigate the executive roadmap and planning directory — find the right document for any planning need"
acceptance_criteria:
  - "all entries in the index map to existing files"
  - "entries are grouped by logical category"
  - "cross-references to parent INDEX and related leaves are present"
  - "all 4 planning documents exist and are linked"
related:
  - ./README.md
  - ../INDEX.md
  - ../strategy/README.md
---

# roadmap/ — Executive Planning & Roadmap

> **As an** executiver, **I want to** navigate the planning and roadmap directory, **so that** I can quickly find the right document for the planning task at hand.

## Start here

| You want to... | Go to |
|---|---|
| Understand which document fits my planning need | [README.md → Quick start](./README.md#quick-start-which-document-when) |
| See how planning documents connect across the year | [README.md → Planning cycle](./README.md#planning-cycle) |
| Run the annual planning process | [annual-strategic-planning.md](./annual-strategic-planning.md) |
| Run a quarterly business review | [quarterly-business-review.md](./quarterly-business-review.md) |
| Set up org-wide OKR tracking | [org-okr-tracking.md](./org-okr-tracking.md) |
| Allocate headcount and budget | [headcount-budget-planning.md](./headcount-budget-planning.md) |
| Know who owns which document | [README.md → Roles & who uses what](./README.md#roles--who-uses-what) |
| Avoid common planning mistakes | [README.md → Anti-patterns](./README.md#anti-patterns) |

## Directory map

```
roadmap/
├── INDEX.md                         ← you are here
├── README.md                        ← full overview, planning cycle, quick-start
├── annual-strategic-planning.md     ← 4-phase annual planning
├── quarterly-business-review.md     ← QBR framework + decision log
├── org-okr-tracking.md              ← OKR cascade + grading
└── headcount-budget-planning.md     ← resource allocation + scenarios
```

## Documents

| File | Key question | Cadence |
|---|---|---|
| [annual-strategic-planning.md](./annual-strategic-planning.md) | How do we set next year's strategy and plan? | Annual (Q3–Q4) |
| [quarterly-business-review.md](./quarterly-business-review.md) | How do we review progress and course-correct? | Quarterly |
| [org-okr-tracking.md](./org-okr-tracking.md) | How do we set and track company goals? | Annual (set) + Quarterly (grade) |
| [headcount-budget-planning.md](./headcount-budget-planning.md) | How do we allocate people and money? | Annual + mid-year re-forecast |

## Common navigation paths

### Path A: Annual planning cycle

```
../strategy/product-strategy-framework.md → annual-strategic-planning.md
    → headcount-budget-planning.md → org-okr-tracking.md
```

### Path B: Quarterly review cycle

```
quarterly-business-review.md → org-okr-tracking.md
    → (if needed) headcount-budget-planning.md
```

### Path C: Strategy pivot

```
../strategy/product-strategy-framework.md → annual-strategic-planning.md
    → headcount-budget-planning.md → org-okr-tracking.md
```

## Cross-references

### Within executiver

| Target | Relevance |
|---|---|
| [../INDEX.md](../INDEX.md) | Parent role index — all executiver subdirectories |
| [../README.md](../README.md) | Executiver role overview |
| [../strategy/](../strategy/) | Business strategy frameworks — feeds into annual planning |

### Cross-role

| Target | Relevance |
|---|---|
| [../../leader/roadmap/](../../leader/roadmap/) | Technical roadmap — execution layer for the org plan |
| [../../producter/strategy/](../../producter/strategy/) | Product strategy — aligns product direction with org priorities |
| [../../producter/discovery/metrics/](../../producter/discovery/metrics/) | Strategy-aligned metrics — connects OKRs to product metrics |