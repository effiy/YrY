---
title: Dashboard — Roadmap Progress
aliases: [roadmap-dashboard, progress-dashboard, roadmap-tracking]
tags: [roadmap, dashboard, tracking, leader]
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
benefit: "Track roadmap progress with a dashboard that shows capacity allocation, feature completion, tech debt trends, and SLO compliance at a glance"
related:
  - ./plan-tech-roadmap.md
  - ./manage-tech-debt.md
  - ./define-an-slo.md
  - ./do-a-capacity-plan.md
  - ../README.md
  - ../INDEX.md
---

# Dashboard — Roadmap Progress

> **As a** tech lead, **I want to** track roadmap progress at a glance, **so that** I can identify issues early, communicate status to stakeholders, and make data-driven adjustments.

## Dashboard layout

### Section 1: Capacity & allocation

| Metric | Current | Target | Status |
|---|---|---|---|
| Net capacity (person-weeks) | | | |
| % Product features | | 50–60% | |
| % Tech investment | | 20–30% | |
| % Operational | | 10–15% | |
| % Exploration | | 5–10% | |
| % Buffer consumed | | — | |

### Section 2: Feature delivery

| Feature | Status | Confidence | Planned | Remaining | Risk |
|---|---|---|---|---|---|
| | | | | | |
| | | | | | |
| | | | | | |

**Status key**: 🟢 On track &nbsp; 🟡 At risk &nbsp; 🔴 Blocked &nbsp; ✅ Done

### Section 3: Tech debt

| Metric | Previous Q | Current Q | Trend |
|---|---|---|---|
| Tech debt items in backlog | | | |
| Items resolved this quarter | | | |
| Average age of open items (days) | | | |
| Incidents caused by known debt | | | |

### Section 4: SLO compliance

| Service | SLI | SLO | Current | Budget remaining |
|---|---|---|---|---|
| | | | | |
| | | | | |

### Section 5: Key risks

| Risk | Likelihood | Impact | Mitigation | Owner |
|---|---|---|---|---|
| | | | | |
| | | | | |

## Update cadence

| Section | Update frequency | Owner |
|---|---|---|
| Capacity & allocation | Weekly | TL |
| Feature delivery | Weekly | TL |
| Tech debt | Monthly | TL |
| SLO compliance | Automated (dashboard) | Infra |
| Key risks | Weekly | TL |

## How to use this dashboard

### Weekly review (TL, 15 min)

1. Scan capacity: is buffer being consumed faster than expected?
2. Check feature status: any items turned yellow or red since last week?
3. Review risks: any new risks? Any risks that have materialized?

### Monthly review (TL + Product, 30 min)

1. Review feature delivery against plan: are we on track for the quarter?
2. Check capacity allocation: are we hitting the target % split?
3. Review tech debt trends: is the backlog growing or shrinking?

### Quarterly review (TL + Engineering leadership, 1 hour)

1. Full review of all sections
2. Compare planned vs. actual for the quarter
3. Feed findings into next quarter's [roadmap plan](./plan-tech-roadmap.md) and [capacity plan](./do-a-capacity-plan.md)

## This product's landing instance

*To be filled in with a link to the live dashboard and the current quarter's data. Update the sections above with actual metrics during the weekly review cadence.*