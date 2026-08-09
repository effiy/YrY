---
title: Prioritize a Backlog
aliases:
- i-want-to-prioritize-a-backlog
- prioritize-backlog
- backlog-grooming
tags:
- journey
- work
- pm
- backlog
- prioritization
- scoping
category: product-manager/frameworks
created: 2026-08-03
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: journey
lifecycle: active
status: stable
review_cycle: quarterly
roles:
- product-manager
benefit: plan is prioritized
acceptance_criteria:
  - "user story header defines who, what, and why"
  - "step-by-step guide is complete with prerequisites and expected outcome"
  - "cross-references to related journeys and patterns are present"
related:
- ./write-a-spec-or-prd.md
- ../../engineer/process/measure-product-metrics.md
- ../../engineer/process/run-iteration-meetings.md
- ../meetings/run-a-sprint.md
- ../../tech-lead/roadmap/manage-tech-debt.md
- ../../knowledge-curator/templates/prd.md
- ../../knowledge-curator/templates/thinking--first-principles.md
- ../../knowledge-curator/templates/thinking--inversion.md
- ../../knowledge-curator/templates/thinking--second-order-thinking.md
- ../../knowledge-curator/templates/thinking--ockhams-razor.md
- ../../product-manager/frameworks/kano-model.md
- ../../product-manager/frameworks/rice-ice-prioritization.md
- ../../product-manager/frameworks/jobs-to-be-done.md
- ../../engineer/engineering/evaluation-driven-development.md
tacit: Scheduling is not cramming everything into the sprint; it is first removing items that should not be done, then sorting by cost-of-delay / duration.
---

# Prioritize a Backlog

> **As a** product manager, **I want to** prioritize a backlog, **so that** plan is prioritized. 

## Summary

- Backlog cleaning four steps: remove -> categorize -> score -> sort
- Remove: items not related / already replaced / long-term stagnant with no one pushing them, quarterly audit archive
- Categorize: by JTBD / Kano split into basic / expected / excitement; RICE/ICE scoring; north-star alignment
- Sort: weighted shortest job first (cost-of-delay / duration); high-cost non-urgent items do not enter the table
- Acceptance: each backlog item must have a JTBD sentence + acceptance criteria + measurement metric; otherwise it cannot enter scheduling

## Scenario description

Iteration is approaching, PM needs to converge backlog into a sprint plan; items pile up, no one can clearly say whether a given item should be done; different stakeholders each push their own requirements; tight schedule, limited headcount, tech debt also competes for resources. This entry gives the convergence path from messy backlog to executable sprint list, covering the four steps of removal, categorize, scoring, sort, alignment, defense, and links to PRD / Measurement / Thinking frameworks / iteration PM handbook and other leaves.

## 2-hop reachability path

| Hop | Target | file |
|---|---|---|
| 1 hop | Entry overview | [README.md](./) |
| 1 hop | Scheduling template | [../resources/templates/sprint-planning-template.md](./../../knowledge-curator/templates/retrospective.md) |
| 2 hop | PRD Template | [../../knowledge-curator/templates/prd.md](../../knowledge-curator/templates/prd.md) |
| 2 hop | RICE/ICE | [../../product-manager/frameworks/rice-ice-prioritization.md](../../product-manager/frameworks/rice-ice-prioritization.md) |
| 2 hop | Kano | [../../product-manager/frameworks/kano-model.md](../../product-manager/frameworks/kano-model.md) |
| 2 hop | North-star + OKR | [../methodology/product/okr-north-star.md](./okr-design.md) |
| 2 hop | JTBD | [../../product-manager/frameworks/jobs-to-be-done.md](../../product-manager/frameworks/jobs-to-be-done.md) |
| 2 hop | first-principles | [../../knowledge-curator/templates/thinking--first-principles.md](../../knowledge-curator/templates/thinking--first-principles.md) |
| 2 hop | inversion | [../../knowledge-curator/templates/thinking--inversion.md](../../knowledge-curator/templates/thinking--inversion.md) |
| 2 hop | second-order | [../../knowledge-curator/templates/thinking--second-order-thinking.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) |
| 2 hop | iteration PM handbook | [../../engineer/process/iteration-pm-handbook.md](../../engineer/process/iteration-pm-handbook.md) |
| 2 hop | Measurement | [../../engineer/process/measure-product-metrics.md](../../engineer/process/measure-product-metrics.md) |
| 2 hop | tech debt | [../../tech-lead/roadmap/manage-tech-debt.md](../../tech-lead/roadmap/manage-tech-debt.md) |

## Action recommendations

1. **remove before sort**: items not related / already replaced / long-term stagnant with no one pushing them archive directly; quarterly audit per deprecation policy
2. **JTBD sentence anchor**: each backlog item must have "user in scenario X wants to complete Y, so that Z"; otherwise it cannot enter scheduling
3. **Kano three-class layered**: basic (not doing loses users) / expected (doing is not surprising) / excitement (doing is surprising, not doing is unnoticeable); basic priority over expected, excitement last
4. **RICE/ICE scoring**: reach x impact x confidence / effort; scoring is not the decision, it is the start of discussion
5. **North-star alignment**: each item must be able to explain its expected contribution to the North-star metric; items that cannot explain do not enter the table
6. **cost-of-delay / duration sort**: weighted shortest job first; high-cost non-urgent items do not enter the table
7. **tech debt also participates in sort**: tech debt quantified by interest x impact matrix; reference [i-want-to-manage-tech-debt](../../tech-lead/roadmap/manage-tech-debt.md)
8. **second-order thinking**: what are the second-order consequences after choosing A; do not just look at short-term output
9. **Inversion**: if you delete this item, what is the worst consequence; if you cannot delete it, explain explicitly why it is important
10. **defensive scheduling**: leave 20% capacity for surprises; do not commit more than 80% capacity
11. **Acceptance criteria + Measurement metric**: each item entering the sprint must have acceptance criteria + measurement metric; otherwise it cannot enter the sprint
12. **go to iteration PM handbook**: reference [iteration PM handbook](../../engineer/process/iteration-pm-handbook.md) for the full process

## Related

- PRD writing: [./write-a-spec-or-prd.md](./write-a-spec-or-prd.md) — deepen a single requirement
- Measurement: [../../engineer/process/measure-product-metrics.md](../../engineer/process/measure-product-metrics.md) — North-star + AARRR + HEART
- iteration meeting: [../../engineer/process/run-iteration-meetings.md](../../engineer/process/run-iteration-meetings.md) — scheduling meeting process
- sprint execution: [../meetings/run-a-sprint.md](../delivery/run-a-sprint.md) — execution after scheduling
- tech debt: [../../tech-lead/roadmap/manage-tech-debt.md](../../tech-lead/roadmap/manage-tech-debt.md) — debt also participates in sort
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking--first-principles.md) + [inversion](../../knowledge-curator/templates/thinking--inversion.md) + [second-order](../../knowledge-curator/templates/thinking--second-order-thinking.md) + [ockhams](../../knowledge-curator/templates/thinking--ockhams-razor.md)
- product methodology: [okr-north-star](./okr-design.md) + [kano](../../product-manager/frameworks/kano-model.md) + [rice-ice](../../product-manager/frameworks/rice-ice-prioritization.md) + [jtbd](../../product-manager/frameworks/jobs-to-be-done.md)
