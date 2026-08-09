---
aliases:
- Requirement Review Process
title: requirementReviewProcess
tags:
- Process
- requirementReview
- product
- SOP
category: product-manager/delivery
created: 2026-07-30
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: yearly
roles:
- product-manager
- engineer
benefit: requirement review outcome clear
acceptance_criteria:
  - "steps are ordered and each has a clear owner or role"
  - "prerequisites and inputs are listed before the first step"
  - "outcome is measurable or verifiable"
related:
- ./design-review.md
- ./tech-review.md
- ../../engineer/process/cross-team-collaboration.md
tacit: false
---

# requirementReviewProcess

> **As a** product manager, **I want to** requirement review, **so that** requirement review outcome clear. 

## 1. Purpose and scope

Before entering development, ensure all parties (product, engineering, QA) are aligned on background, value, goals, process, and core features to avoid changes and rework during development.

Applies to: all new requirements entering iteration, requirement changes, defects converted to requirements.

## 2. Roles and responsibilities (RACI) 

| Role | Responsibility |
|---|---|
| Product Manager (R) | Produce PRD; convene review; record conclusions and action items |
| Iteration PM (A) | Control cadence; identify stakeholders; track action item closure |
| Tech Lead (C) | Assess feasibility, technical risk, related systems |
| QA Lead (C) | Identify acceptance points, boundaries, edge cases |
| Design Lead (C) | Identify interaction and visual complexity |
| Business Stakeholder (I) | Confirm requirement value and priority |

## 3. Step breakdown

```
Requirement internal review → Pre-scheduling → Pre-review communication → Formal review → Conclusion sync → Enter technical/design review
```

| Step | Owner | Key actions | Exit criteria |
|---|---|---|---|
| 1. Requirement internal review | Product | Send PRD 1 day ahead; product/business/design/tech owner attend; align on background/value/goals/process/core features | PRD completeness passes internal review |
| 2. Pre-scheduling | Iteration PM | Provide within 1 day after daily iteration alignment; disagreements escalate | Pre-schedule sent |
| 3. Pre-review communication | Product + Iteration PM | Determine tech/design members; identify stakeholders and links; set review time; key people must attend | Stakeholders identified and notified |
| 4. Formal review | Product + Iteration PM | Relevant people attend; designate recorder; record issues/conclusions/actions; confirm on-site whether passed; if passed, set tech solution and visual review time; align minutes before ending | Conclusion clear: passed / re-review / not passed |
| 5. Conclusion sync | Product | Minutes @stakeholders synced to project group; start recording requirement changes | Minutes sent, confirmed in group |

## 4. Inputs / outputs

- **Input**: PRD (incl. background, goals, process diagram, feature list, acceptance criteria) 
- **Output**: Review minutes, requirement change record, tech/design review time, action list

## 5. Measurement metrics

- Review first-time pass rate
- Post-review requirement change rate (Target ≤ 10%) 
- Cadence from review to QA handoff

## 6. Exception handling and escalation path

| Scenario | Handling |
|---|---|
| Key people absent | Reschedule review, no verbal relay |
| Requirement incomplete | Not passed, return to internal review |
| Stakeholders not identified | Pause review; supplement links after re-review |
| Disagreements cannot be aligned | Escalate to product director / iteration PM for arbitration |
| Many review issues | Re-review, entering tech review with defects forbidden |

## 7. Notes

- **Identifying and confirming stakeholders is critical** — delays often come from unclear ownership or no consensus
- Relevant people must attend the review, avoid verbal relay
- Conclusions must be aligned on-site and minutes sent after the meeting
- Start recording requirement changes; no changes unless necessary, disagreements escalate
