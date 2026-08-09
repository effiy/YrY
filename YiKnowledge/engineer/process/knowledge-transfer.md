---
aliases:
- Knowledge Transfer Process
title: Knowledge consolidation and transfer process
tags:
- process
- knowledge-management
- transfer
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
- ./knowledge-review.md
- ./knowledge-contributor-charter.md
- ./project-handover.md
- ./knowledge-deprecation-policy.md
tacit: false
---

# Knowledge consolidation and transfer process

> **As an** engineer, **I want to** knowledge transfer, **so that** process followed predictably. 

## 1. Purpose and applicable scope

Transform individual experience, project lessons, and technical decisions into reusable team assets, reducing knowledge loss caused by personnel turnover. 

Applicable to: project milestone nodes, personnel changes (onboarding / transfer / offboarding), after incident retrospective, after technical decisions. 

## 2. Roles and responsibilities

| role | responsibility |
|---|---|
| Knowledge owner (R)  | Draft and maintain documentation; periodic review |
| Iteration PM (A)  | Trigger consolidation actions; track to closure |
| Tech owner (C)  | Review technical accuracy |
| Team member (I)  | Read, feedback, reuse |

## 3. Trigger timing

| Trigger point | Consolidation action | Output location |
|---|---|---|
| Project launch | Project README, architecture diagram, technical proposal archive | `projects/<project>/` |
| Incident retrospective | postmortem; failure cases | `lessons/failures/` |
| Technical decision | ADR; tech selection evaluation | `resources/templates/adr-template.md` |
| Personal growth | Experience summary, pitfall notes | `lessons/gotchas/` |
| Personnel change | Handover documentation; knowledge transfer meeting | `projects/<project>/handover.md` |
| Quarterly retrospective | Roadmap review, tech debt inventory | `work/processes/` |

## 4. Step breakdown

```
Trigger -> Draft -> Review -> Archive -> Re-review -> Transfer
```

| step | owner | key actions | exit criteria |
|---|---|---|---|
| 1. Trigger | Iteration PM | Remind owner to consolidate at the above trigger points | Owner reached |
| 2. Draft | Knowledge owner | Draft per frontmatter and template; desensitize; reference related docs | Draft completed |
| 3. Review | Tech owner | Review technical accuracy; check for conflicts with existing knowledge | Review passed |
| 4. Archive | Knowledge owner | Place in corresponding leaf directory; update INDEX.md and leaf README | Included list updated |
| 5. Re-review | Knowledge owner | Quarterly review; mark or delete outdated content | Re-review record archived |
| 6. Transfer | Iteration PM | Guide reading during onboarding / transfer / project handover | Handover record archived |

## 5. Input / output artifacts

- **input**: PRD, technical proposal, meeting minutes, incident retrospective, personal notes
- **output**: archived documentation, INDEX update, handover checklist

## 6. Measurement metrics

- Documentation coverage (ratio of key modules with documentation) 
- Documentation activity (ratio reviewed in the past 90 days) 
- Reuse rate (number of times referenced by other docs / projects) 
- Handover completion rate (ratio completed during personnel changes) 

## 7. Exception handling and upgrade path

| scenario | handling |
|---|---|
| Owner delay | Iteration PM follows up; upgrade if necessary |
| Documentation mismatches current state | Mark "outdated"; assign owner to update |
| No one takes over | Upgrade to tech owner for assignment |
| Tight handover time | Prioritize core module consolidation; secondary modules listed in backlog |
| Knowledge conflict | Follow latest practice; archive or delete old documentation |

## 8. Notes

- Writing is better than not writing; 80 points is better than 0
- Documentation is not done once written — it needs review and transfer
- Reuse existing templates: ADR, postmortem, tech-design, tech-selection-evaluation
- In the first week of onboarding, have new hires read `projects/<project>/README.md` and key docs in `lessons/`
- Quarterly retrospective links with `tech-roadmap-review-template.md`, `tech-debt-inventory-template.md`
