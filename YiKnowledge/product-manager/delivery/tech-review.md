---
aliases:
- Tech Review Process
title: technologyReviewProcess
tags:
- Process
- technologyReview
- SOP
category: product-manager/delivery
created: 2026-07-30
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: process
status: stable
lifecycle: active
review_cycle: yearly
roles:
- product-manager
- engineer
benefit: tech review outcome clear
acceptance_criteria:
  - "steps are ordered and each has a clear owner or role"
  - "prerequisites and inputs are listed before the first step"
  - "outcome is measurable or verifiable"
related:
- ./requirement-review.md
- ./design-review.md
- ../../oncall-sre/release/release.md
tacit: false
---

# technologyReviewProcess

> **As a** product manager, **I want to** tech review, **so that** tech review outcome clear.

## 1. Purpose and applicable scope

Before development begins, ensure all parties reach consensus on technology solution, interface contract, risks, and milestones, and that the solution matches the PRD.

Applicable to: all requirements entering development; simple changes can use lightweight review.

## 2. Roles and responsibilities (RACI)

| Role | Responsibility |
|---|---|
| Solution author (R) | Outputs technology solution documentation; convenes review |
| Iteration PM (A) | Organizes internal review and formal review; controls cadence; tracks action items |
| Domain technology owner / TO (C) | Assesses architecture, performance, security, maintainability |
| Related developers (C) | Assess interface contract, dependencies, integration points |
| Test owner (C) | Assesses testability, test strategy |
| Product (C) | Confirms solution satisfies PRD; **must attend and take it seriously** |

## 3. Step breakdown

```
Internal tech solution review → Formal tech review → Determine milestones → Enter development
```

| Step | Owner | Key actions | Exit criteria |
|---|---|---|---|
| 1. Tech solution internal review | Iteration PM | Ensure related people attend; control cadence; designate note taker; sync minutes to group; remediation actions must close before entering formal review | Internal review actions all closed loop |
| 2. Formal tech review | Iteration PM | Ensure schedule and attendance; control cadence; designate note taker; confirm on-site whether approved; if too many questions, review again; once approved, set milestone timing; align minutes before closing; sync to group | Conclusion explicit: approved / re-review / not approved |
| 3. Determine milestone | Iteration PM | Confirm integration/test/launch times and keep communication records; split tasks and review reasonableness; confirm each person's investment and completion time; check longest path and shortest path; convene meeting to set milestone and recurring meeting cadence | Milestone synced to group and posted as group announcement |

## 4. Input / output artifacts

- **Input**: PRD, design drafts, existing architecture diagrams
- **Output**: technology solution documentation, interface contract, milestone plan, action list

## 5. Measurement metrics

- Tech solution first-pass approval rate
- Days of deviation from review to test submission
- Solution rework rate after test submission

## 6. Exception handling and escalation path

| Scenario | Handling |
|---|---|
| Internal review actions not closed loop | Do not enter formal review |
| Solution and PRD mismatch | Pause; product confirms trade-offs then re-review |
| Architecture dispute | Escalate to TO / domain technology owner for arbitration |
| Requirement change | Control changes, avoid unless necessary; escalate disputes; record propagation |
| Milestone cannot align | Escalate to iteration PM for arbitration; consider batched test submission / batched launch |

## 7. Notes

- Internal review purpose is to align solution internally before formal review, avoiding wasting product/test/design time
- Product must attend and take it seriously
- Development/test task granularity ≤ 4 hours
- Milestone determination ≤ 1 day from tech review approval
- Pay attention to investment ratio of non-100% invested teammates
- Identify risks early; scan them in regular meetings during development
