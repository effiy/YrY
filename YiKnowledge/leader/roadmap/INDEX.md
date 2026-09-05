---
title: leader/roadmap/ MOC
aliases: [leader-roadmap-moc, roadmap-index]
tags: [index, roadmap, leader, planning, tech-debt]
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
benefit: "Navigate the tech lead roadmap directory — find the right document for any planning, tech debt, or lifecycle task"
acceptance_criteria:
  - "all entries in the index map to existing files"
  - "entries are grouped by logical category"
  - "cross-references to parent INDEX and related leaves are present"
  - "all 10 content files exist and are linked"
related:
  - ./README.md
  - ../INDEX.md
  - ../../executiver/roadmap/README.md
---

# leader/roadmap/ — Engineering Roadmap & Lifecycle

> **As a** tech lead, **I want to** navigate the roadmap directory, **so that** I can quickly find the right document for the engineering task at hand.

## Start here

| You want to... | Go to |
|---|---|
| Understand which document fits my need | [README.md → Quick start](./README.md#quick-start-which-document-when) |
| See how documents connect | [README.md → Document relationships](./README.md#document-relationships) |
| Plan the engineering roadmap | [plan-tech-roadmap.md](./plan-tech-roadmap.md) |
| Calculate team capacity | [do-a-capacity-plan.md](./do-a-capacity-plan.md) |
| Preview Q4 planning | [tl-roadmap-review-2026-q4-preview.md](./tl-roadmap-review-2026-q4-preview.md) |
| Evaluate a technology choice | [do-a-tech-selection.md](./do-a-tech-selection.md) |
| Run a proof of concept | [do-a-proof-of-concept.md](./do-a-proof-of-concept.md) |
| Manage technical debt | [manage-tech-debt.md](./manage-tech-debt.md) |
| Define service level objectives | [define-an-slo.md](./define-an-slo.md) |
| Deprecate a feature | [deprecate-a-feature.md](./deprecate-a-feature.md) |
| Decommission a service | [decommission-a-service.md](./decommission-a-service.md) |
| Track roadmap progress | [dashboard-roadmap-progress.md](./dashboard-roadmap-progress.md) |
| Avoid common mistakes | [README.md → Anti-patterns](./README.md#anti-patterns) |

## Directory map

```
roadmap/
├── INDEX.md                              ← you are here
├── README.md                             ← full overview, relationships, quick-start
├── plan-tech-roadmap.md                  ← engineering roadmap planning
├── tl-roadmap-review-2026-q4-preview.md  ← Q4 2026 preview template
├── do-a-capacity-plan.md                 ← capacity estimation
├── do-a-tech-selection.md                ← technology evaluation
├── do-a-proof-of-concept.md              ← PoC spike methodology
├── manage-tech-debt.md                   ← tech debt management
├── define-an-slo.md                      ← SLO definition
├── deprecate-a-feature.md                ← feature deprecation
├── decommission-a-service.md             ← service decommissioning
└── dashboard-roadmap-progress.md         ← progress dashboard
```

## Documents by category

### Roadmap & planning

| File | Key question | Type |
|---|---|---|
| [plan-tech-roadmap.md](./plan-tech-roadmap.md) | How do we plan the engineering roadmap? | process |
| [tl-roadmap-review-2026-q4-preview.md](./tl-roadmap-review-2026-q4-preview.md) | What's the Q4 planning preview? | template |
| [do-a-capacity-plan.md](./do-a-capacity-plan.md) | How much capacity do we have? | calculation |
| [do-a-tech-selection.md](./do-a-tech-selection.md) | Which technology should we choose? | evaluation |
| [do-a-proof-of-concept.md](./do-a-proof-of-concept.md) | How do we validate a technical assumption? | spike |

### Tech debt & lifecycle

| File | Key question | Type |
|---|---|---|
| [manage-tech-debt.md](./manage-tech-debt.md) | How do we track and reduce tech debt? | management |
| [define-an-slo.md](./define-an-slo.md) | How do we set reliability targets? | definition |
| [deprecate-a-feature.md](./deprecate-a-feature.md) | How do we safely remove a feature? | process |
| [decommission-a-service.md](./decommission-a-service.md) | How do we safely shut down a service? | process |

### Dashboard

| File | Key question | Type |
|---|---|---|
| [dashboard-roadmap-progress.md](./dashboard-roadmap-progress.md) | How is the roadmap tracking? | dashboard |

## Common navigation paths

### Path A: Quarterly planning

```
do-a-capacity-plan.md → plan-tech-roadmap.md
    → dashboard-roadmap-progress.md
```

### Path B: Technology decision

```
do-a-tech-selection.md → do-a-proof-of-concept.md
    → ../decisions/ (write ADR)
```

### Path C: Service lifecycle

```
manage-tech-debt.md → deprecate-a-feature.md
    → decommission-a-service.md
```

### Path D: Reliability improvement

```
define-an-slo.md → manage-tech-debt.md
    → plan-tech-roadmap.md
```

## Cross-references

### Within leader

| Target | Relevance |
|---|---|
| [../INDEX.md](../INDEX.md) | Parent role index — all leader subdirectories |
| [../README.md](../README.md) | Leader role overview |
| [../架构/](../架构/) | Architecture patterns — referenced in tech selection |
| [../decisions/](../decisions/) | ADRs — where tech selection decisions are documented |
| [../risk/](../risk/) | Risk management — incident postmortems feed into tech debt |

### Cross-role

| Target | Relevance |
|---|---|
| [../../executiver/roadmap/](../../executiver/roadmap/) | Executive planning — feeds into tech roadmap |
| [../../executiver/strategy/](../../executiver/strategy/) | Business strategy — informs product priorities |
| [../../producter/strategy/](../../producter/strategy/) | Product strategy — aligns with tech roadmap |