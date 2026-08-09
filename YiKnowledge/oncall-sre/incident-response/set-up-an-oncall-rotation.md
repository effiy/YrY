---
title: Set up an oncall rotation
aliases: [i-want-to-set-up-an-oncall-rotation, oncall-rotation, oncall-schedule, pager-rotation]
tags: [journey, methodology, oncall, sre, incident-response, operations, governance]
category: oncall-sre/incident-response
created: 2026-08-03
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: journey
lifecycle: active
status: stable
review_cycle: quarterly
roles: [oncall-sre, engineer]
benefit: "Oncall rotations are fair and sustainable, balancing response coverage with engineer wellbeing"
acceptance_criteria:
  - "user story header defines who, what, and why"
  - "step-by-step guide is complete with prerequisites and expected outcome"
  - "cross-references to related journeys and patterns are present
related:
  - ./handle-an-oncall-shift.md
  - ./respond-to-an-incident.md
  - ../../engineer/infrastructure/write-a-runbook.md
  - ./run-a-war-room.md
  - ./run-a-game-day.md
  - ../../knowledge-curator/templates/thinking--first-principles.md
  - ../../knowledge-curator/templates/thinking--inversion.md
  - ../../knowledge-curator/templates/thinking--second-order-thinking.md
  - ../../knowledge-curator/templates/thinking--ockhams-razor.md
tacit: oncall is not just scheduling; it is a contract. Primary + backup + escalation + timezone + fairness + health; sustainable; not relying on heroes
---

# I want to set up an oncall rotation

> **As a** oncall sre, **I want to** set up an oncall rotation, **so that** baseline is reproducible.

## Summary

- oncall = contract; not just scheduling
- Primary + backup + escalation; no single point
- Timezone coverage; no gaps
- Fair rotation; no bias
- Health sustainable; not relying on heroes
- runbook required; not relying on memory
- Links with IR + war room + game day
- Escalation path clear; not vague
- Publicly queryable; not hidden
- Periodic review; architecture evolution updates
- First principles / inversion / second-order / Occam

## Scenario

oncall rotation is a contract; not just scheduling. This entry provides the oncall rotation full path, covering primary + backup + escalation, timezone coverage, fair rotation, health sustainable, runbook required, linked with IR + war room + game day, escalation path clear, publicly queryable, periodic review, and links to handle-an-oncall-shift / respond-to-an-incident / prepare-an-incident-response-plan / write-a-runbook / run-a-war-room / run-a-game-day and other leaves.

## 2-hop reachability paths

| Hops | Goal | File |
|---|---|---|
| 1 hop | Entry overview | [README.md](./) |
| 1 hop | Handle shift | [./handle-an-oncall-shift.md](./handle-an-oncall-shift.md) |
| 2 hops | Respond incident | [./respond-to-an-incident.md](./respond-to-an-incident.md) |
| 2 hops | IR plan | [./prepare-an-incident-response-plan.md](../../knowledge-curator/archive/strategies-legacy/oncall-sre/prepare-an-incident-response-plan.md) |
| 2 hops | runbook | [../../engineer/infrastructure/write-a-runbook.md](../../engineer/infrastructure/write-a-runbook.md) |
| 2 hops | war room | [./run-a-war-room.md](./run-a-war-room.md) |
| 2 hops | game day | [./run-a-game-day.md](./run-a-game-day.md) |
| 2 hops | first-principles | [../../knowledge-curator/templates/thinking--first-principles.md](../../knowledge-curator/templates/thinking--first-principles.md) |
| 2 hops | inversion | [../../knowledge-curator/templates/thinking--inversion.md](../../knowledge-curator/templates/thinking--inversion.md) |
| 2 hops | second-order | [../../knowledge-curator/templates/thinking--second-order-thinking.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) |
| 2 hops | ockhams | [../../knowledge-curator/templates/thinking--ockhams-razor.md](../../knowledge-curator/templates/thinking--ockhams-razor.md) |

## Action recommendations

1. **Primary + backup**: each shift must tag primary + backup; no single point
2. **Escalation path**: primary → backup → escalation; not vague
3. **Timezone coverage**: cross-timezone teams follow the sun; no gaps
4. **Fair rotation**: rotation not biased; assign by intensity
5. **Health sustainable**: no continuous multiple shifts; not relying on heroes
6. **Rotation cadence**: weekly / bi-weekly rotation; no longer than monthly
7. **runbook required**: every alert must have runbook; not relying on memory
8. **Alert tiering**: P0 / P1 / P2 / P3; respond by tier
9. **Quiet hours**: night + weekend quiet; only P0 wake-up
10. **Compensation**: oncall compensation / time off; not free
11. **Handoff**: shift handoff must handoff; not verbal
12. **Link with IR**: oncall is IR first responder
13. **Link with war room**: P0 triggers war room
14. **Link with game day**: regular drills validate rotation
15. **Link with runbook**: every alert must have runbook
16. **Toolchain**: PagerDuty / Opsgenie / self-built; not relying on phone
17. **publicly queryable**: everyone can look up who is oncall; not hidden
18. **periodic review**: architecture evolution updates; not one-shot
19. **first principles**: why must oncall; worst consequence of not doing
20. **inversion thinking**: how much can be solved by SLA + auto-alert; if solvable do not introduce people
21. **second-order thinking**: second-order consequences after oncall (health / retention / trust / response speed)
22. **Occam**: oncall the simpler the better; cut redundant rules

## Related

- Handle shift: [./handle-an-oncall-shift.md](./handle-an-oncall-shift.md) — execution
- Respond incident: [./respond-to-an-incident.md](./respond-to-an-incident.md) — response process
- IR plan: [./prepare-an-incident-response-plan.md](../../knowledge-curator/archive/strategies-legacy/oncall-sre/prepare-an-incident-response-plan.md) — plan
- runbook: [../../engineer/infrastructure/write-a-runbook.md](../../engineer/infrastructure/write-a-runbook.md) — alert must have
- war room: [./run-a-war-room.md](./run-a-war-room.md) — P0 escalation
- game day: [./run-a-game-day.md](./run-a-game-day.md) — drill validation
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking--first-principles.md) + [inversion](../../knowledge-curator/templates/thinking--inversion.md) + [second-order](../../knowledge-curator/templates/thinking--second-order-thinking.md) + [ockhams](../../knowledge-curator/templates/thinking--ockhams-razor.md)
