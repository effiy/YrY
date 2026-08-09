---
title: Run a Sprint
aliases:
- i-want-to-run-a-sprint
- run-a-sprint
- sprint-execution
tags:
- journey
- work
- pm
- sprint
- execution
- agile
category: product-manager/delivery
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
benefit: process is repeatable
acceptance_criteria:
  - "user story header defines who, what, and why"
  - "step-by-step guide is complete with prerequisites and expected outcome"
  - "cross-references to related journeys and patterns are present"
related:
- ../frameworks/prioritize-a-backlog.md
- ../../engineer/process/run-iteration-meetings.md
- ../../engineer/process/run-a-retrospective.md
- ../../engineer/process/collaborate-across-teams.md
- ../../oncall-sre/incident-response/respond-to-an-incident.md
- ../../tech-lead/roadmap/manage-tech-debt.md
- ../../oncall-sre/observability/set-up-observability.md
- ../../engineer/process/iteration-pm-handbook.md
- ../../knowledge-curator/templates/thinking--first-principles.md
- ../../knowledge-curator/templates/thinking--second-order-thinking.md
- ../../knowledge-curator/templates/thinking--ockhams-razor.md
tacit: A sprint is not about finishing the work; it is about letting the team advance measurably toward a shared goal within a fixed time window, aligning daily, hiding no landmines
---

# Run a Sprint

> **As a** product manager, **I want to** run a sprint, **so that** process is repeatable.

## Summary

- Sprint four-piece set: planning meeting → daily standup → review meeting → retrospective meeting
- Planning meeting: backlog items sorted by cost-of-delay ÷ duration; leave 20% capacity for surprises
- Daily standup: three sentences (yesterday / today / blockers); no reporting, no deep dives; blockers resolved outside the meeting
- Review meeting: demo working software, against acceptance criteria; not demoable does not count as done
- Retrospective meeting: first retrospect yourself, then retrospect the process; action items ≤ 3 and assigned to a person

## Scenario

Iteration just started, PM needs to turn the schedule into an executable sprint; team aligns on progress daily, removes blockers; at sprint end demo and retrospect. This entry provides the execution path of the sprint four-piece set (planning / daily / review / retrospective), links to backlog prioritization, iteration PM handbook, retrospective template, cross-team collaboration, incident response and other leaves, covering typical PM scenarios.

## 2-hop reachability paths

| Hops | goal | file |
|---|---|---|
| 1 hop | Entry overview | [README.md](./) |
| 1 hop | Sprint planning template | [../resources/templates/sprint-planning-template.md](./../../knowledge-curator/templates/retrospective.md) |
| 1 hop | iteration PM handbook | [../../engineer/process/iteration-pm-handbook.md](../../engineer/process/iteration-pm-handbook.md) |
| 2 hops | backlog prioritization | [../frameworks/prioritize-a-backlog.md](../frameworks/prioritize-a-backlog.md) |
| 2 hops | retrospective template | [../../engineer/process/run-a-retrospective.md](../../engineer/process/run-a-retrospective.md) |
| 2 hops | cross-team collaboration | [../../engineer/process/collaborate-across-teams.md](../../engineer/process/collaborate-across-teams.md) |
| 2 hops | incident response | [../../oncall-sre/incident-response/respond-to-an-incident.md](../../oncall-sre/incident-response/respond-to-an-incident.md) |
| 2 hops | observable | [../../oncall-sre/observability/set-up-observability.md](../../oncall-sre/observability/set-up-observability.md) |
| 2 hops | tech debt | [../../tech-lead/roadmap/manage-tech-debt.md](../../tech-lead/roadmap/manage-tech-debt.md) |
| 2 hops | first-principles | [../../knowledge-curator/templates/thinking--first-principles.md](../../knowledge-curator/templates/thinking--first-principles.md) |
| 2 hops | second-order | [../../knowledge-curator/templates/thinking--second-order-thinking.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) |
| 2 hops | ockhams | [../../knowledge-curator/templates/thinking--ockhams-razor.md](../../knowledge-curator/templates/thinking--ockhams-razor.md) |

## Action recommendations

1. **Validate capacity at planning**: reference last sprint's actual completion rate; do not commit beyond 80% capacity; leave 20% for surprises
2. **Items must meet acceptance criteria + measurement metrics + JTBD**: see [backlog prioritization](../frameworks/prioritize-a-backlog.md)
3. **Split to sprint-completable**: single item > half sprint duration must be split; not split, not in sprint
4. **Daily standup three sentences**: yesterday / today / blockers; no reporting, no deep dives; blockers resolved outside
5. **Daily board update**: todo → doing → review → done; doing limits WIP
6. **Mid-sprint requirement changes**: priority changes go through PM process; no sneaking items in
7. **Not demoable does not count as done**: review meeting demos working software; not demoable reverts to backlog
8. **Retrospective first on self**: first ask "how did the team do this sprint" then ask "where can process improve"
9. **Action items ≤ 3**: assigned to a person + validated next sprint; too many = no convergence
10. **Second-order thinking**: today's rush costs tomorrow; tech debt not in sprint accrues interest
11. **Occam's razor**: the simpler the process the more sustainable; cut redundant ceremonies
12. **Incident priority**: sudden incidents interrupt the sprint; see [incident response](../../oncall-sre/incident-response/respond-to-an-incident.md)

## Related

- Prioritization: [../frameworks/prioritize-a-backlog.md](../frameworks/prioritize-a-backlog.md) — sprint prerequisite
- Iteration meetings: [../../engineer/process/run-iteration-meetings.md](../../engineer/process/run-iteration-meetings.md) — meeting process template
- Retrospective: [../../engineer/process/run-a-retrospective.md](../../engineer/process/run-a-retrospective.md) — sprint-end retrospective
- Cross-team collaboration: [../../engineer/process/collaborate-across-teams.md](../../engineer/process/collaborate-across-teams.md) — cross-team depends on
- Incident response: [../../oncall-sre/incident-response/respond-to-an-incident.md](../../oncall-sre/incident-response/respond-to-an-incident.md) — sudden interruption
- Observable: [../../oncall-sre/observability/set-up-observability.md](../../oncall-sre/observability/set-up-observability.md) — demo prerequisite
- Tech debt: [../../tech-lead/roadmap/manage-tech-debt.md](../../tech-lead/roadmap/manage-tech-debt.md) — debt also scheduled
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking--first-principles.md) + [second-order](../../knowledge-curator/templates/thinking--second-order-thinking.md) + [ockhams](../../knowledge-curator/templates/thinking--ockhams-razor.md)
