---
aliases:
- Cross-Team Collaboration Process
title: Cross-team collaboration process
tags:
- process
- cross-team-collaboration
- collaboration
- SOP
category: engineer/process
created: 2026-07-30
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: yearly
roles:
- engineer
benefit: process followed predictably
acceptance_criteria:
  - "steps are ordered and each has a clear owner or role"
  - "prerequisites and inputs are listed before the first step"
  - "outcome is measurable or verifiable"
related:
- ../../product-manager/processes/requirement-review.md
- ./project-handover.md
- ../../oncall-sre/release/release.md
- ./incident-response.md
tacit: false
---

# Cross-team collaboration process

> **As an** engineer, **I want to** cross team collaboration, **so that** process followed predictably.

## 1. Purpose and scope

Standardize cross-team collaboration actions (different product lines, frontend/backend, product/dev/test, business owner vs product-dev); reduce communication loss and accountability gaps.

Applicable to: cross-team requirements, interface integration, joint releases, joint reviews.

Not applicable to: intra-team collaboration (managed by the team itself).

## 2. Roles and responsibilities

| Role | Responsibilities |
|---|---|
| Lead team PM (R) | Aligns collaborating parties; outputs the joint plan |
| Collaborating team PM (A) | Coordinates internally; commits to delivery |
| Technical owners of each party (C) | Interface contracts, dependency sorting, integration |
| Test owners of each party (C) | Joint test strategy |
| Business owner (I) | Business cadence and priority |

## 3. Step breakdown

```
Identify → Kickoff meeting → Interface contract → Joint plan → Integration → Joint test → Joint release
```

| Step | Key actions | Exit criteria |
|---|---|---|
| 1. Identify | Lead identifies related teams; engage early | Related parties notified |
| 2. Kickoff meeting | Align background/goal/scope/timeline; designate contacts | Joint brief sent |
| 3. Interface contract | Technical owners agree jointly; written down; no verbal changes | Contract documentation archived |
| 4. Joint plan | Split dependency paths; find the longest path; align milestones | Plan confirmed by all parties |
| 5. Integration | Integration environment ready; mock-to-real switchover cadence clear | Integration passes |
| 6. Joint test | Joint test cases; clarify bug ownership | Test passes |
| 7. Joint release | Unified release plan; clarify each party's actions and timing | Release success |

## 4. Input / output artifacts

- **Input**: PRD, technical proposals from each party, interface contract draft.
- **Output**: joint brief, interface contract documentation, joint milestones, release plan, retrospective notes.

## 5. Measurement metrics

- Cross-team requirement first-pass rate.
- Bug leakage rate during integration.
- Joint release delay rate.
- Number of cross-team complaints / blame-shifting incidents.

## 6. Exception handling and escalation path

| Scenario | Handling |
|---|---|
| Collaborating party not staffed | Lead PM escalates to the counterpart PM; to upper management if necessary |
| Interface contract changes | Must notify in writing; all parties assess impact before deciding |
| Milestones cannot align | Lead PM convenes to align; disagreements escalate |
| Release timing conflicts | Must have a written release plan; clarify dependency order |
| Blame-shifting | Pull people in on the spot; use the interface contract as the source of truth; retrospective afterwards |
| Joint incident | Lead organizes handling per [incident response process](./incident-response.md) |

## 7. Notes

- **Engage related parties early** — delays often come from failing to identify them clearly.
- The interface contract is the "law" of collaboration — verbal agreements do not count.
- Contacts must be specific people; do not use "our team".
- The joint plan must find the longest path; do not be misled by the shortest path.
- Joint releases must have a written timing; "just ship it casually" is forbidden.
- Retrospectives must be held jointly; do not write them separately.
- Complements [work/collaboration](.): this document focuses on process actions; collaboration focuses on day-to-day collaboration norms.
