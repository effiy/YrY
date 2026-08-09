---
aliases:
- Design Review Process
title: Design Review Process
tags:
- process
- design-review
- UX
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
benefit: design review outcome clear
acceptance_criteria:
  - "steps are ordered and each has a clear owner or role"
  - "prerequisites and inputs are listed before the first step"
  - "outcome is measurable or verifiable"
related:
- ./requirement-review.md
- ./tech-review.md
- ../../oncall-sre/release/release.md
tacit: false
---

# Design Review Process

> **As a** product manager, **I want to** design review, **so that** design review outcome clear.

## 1. Purpose and scope

Before development starts, ensure all parties reach consensus on interaction flows, visual specs, edge states, and exception states, to avoid rework or experience fragmentation during development.

Applies to: all requirements with UI interactions; pure backend/data requirements may be exempt.

## 2. Roles and responsibilities (RACI)

| Role | Responsibility |
|---|---|
| Designer (R) | Produce design deliverables (interaction flows, visual specs, edge states, exception states); convene the review |
| Product Manager (A) | Confirm design meets requirements and acceptance criteria |
| Iteration PM (C) | Control cadence; record conclusions |
| Frontend Lead (C) | Assess implementation feasibility, component reuse, performance |
| Backend Lead (C) | Assess impact of data structures on design |
| QA Lead (I) | Identify exception-path coverage |

## 3. Step breakdown

```
Design self-review → Design review → Conclusion sync → Design acceptance (milestone node)
```

| Step | Owner | Key actions | Exit criteria |
|---|---|---|---|
| 1. Design self-review | Designer | Design deliverables complete; edge states (empty/error/loading/permission/overflow text) complete; reuse existing components | Self-check list passes |
| 2. Design review | Designer + Iteration PM | Ensure schedule and attendance; control cadence; designate note-taker; confirm pass on site; align on minutes before ending | Conclusion clear: pass / re-review |
| 3. Conclusion sync | Designer | Minutes @mention stakeholders synced to project channel; action list with owner and due date | Minutes sent |
| 4. Design acceptance | Design Lead + Iteration PM | Acceptance at milestone node; issues recorded centrally for tracking | Acceptance report archived |

## 4. Input / output artifacts

- **Input**: PRD, design deliverables (Figma/Sketch), design self-check list
- **Output**: review minutes, design acceptance report, action list

## 5. Metrics

- Design first-pass rate
- Deviation rate from design to development completion
- Design acceptance first-pass rate

## 6. Exception handling and escalation paths

| Scenario | Handling |
|---|---|
| Design deliverables missing edge states | Return for completion, then re-review |
| Implementation feasibility in doubt | Frontend Lead assesses on site; complex items split into iterations |
| Conflict with PRD | Pause; PM confirms PRD trade-off, then re-review |
| Design acceptance not passed | Add to must-fix items; Iteration PM tracks to closure |

## 7. Notes

- Milestone nodes are set early; designers must reserve time in advance
- Acceptance issues are recorded centrally for tracking
- When frontend component library already has equivalents, prioritize reuse; do not introduce visual divergence
