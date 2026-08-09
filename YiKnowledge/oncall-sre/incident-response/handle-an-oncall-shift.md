---
title: Take an oncall shift
aliases: [i-want-to-handle-an-oncall-shift, oncall-shift, oncall-rotation]
tags: [journey, methodology, oncall, incident-response, runbook, alerting]
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
benefit: "Oncall engineers respond to incidents with clear runbooks, reducing MTTR and preventing burnout"
acceptance_criteria:
  - "user story header defines who, what, and why"
  - "step-by-step guide is complete with prerequisites and expected outcome"
  - "cross-references to related journeys and patterns are present
related:
  - ./respond-to-an-incident.md
  - ../../tech-lead/risk/write-a-postmortem.md
  - ../observability/set-up-observability.md
  - ../../tech-lead/roadmap/define-an-slo.md
  - ../../engineer/infrastructure/write-a-runbook.md
  - ../../knowledge-curator/templates/thinking--first-principles.md
  - ../../knowledge-curator/templates/thinking--inversion.md
  - ../../knowledge-curator/templates/thinking--second-order-thinking.md
  - ../../knowledge-curator/templates/thinking--ockhams-razor.md
tacit: oncall should not cause burnout; weekly rotation + primary/backup + handover + runbook; every alert must carry a runbook; only P0/P1 outside working hours; rest guaranteed
---

# I want to take an oncall shift

> **As a** oncall sre, **I want to** handle an oncall shift, **so that** incident is contained.

## Summary

- oncall weekly rotation + primary/backup; not solo
- handover ritual; explicit handover; not verbal
- alert response tiered P0/P1/P2/P3; only P0/P1 outside working hours
- every alert must carry a runbook; alerts without runbooks are cleaned up
- incident escalation path; must escalate when over time
- notification mechanism: phone / SMS / IM; do not omit
- rest guaranteed: make up time off after oncall; no consecutive shifts
- post-incident retrospective; actions landed

## Scenario

oncall is the first line of defense for incidents; oncall should not cause burnout or consecutive shifts. This entry provides the oncall full path, covering weekly rotation + primary/backup, handover ritual, tiered alert response, every alert must carry a runbook, incident escalation path, notification mechanism, rest guarantee, post-incident retrospective, and links to respond-to-an-incident / write-a-postmortem / set-up-observability / define-an-slo / write-a-runbook / prepare-a-disaster-recovery-plan and other leaves.

## 2-hop reachability paths

| Hops | goal | file |
|---|---|---|
| 1 hop | entry overview | [README.md](./) |
| 1 hop | incident response | [./respond-to-an-incident.md](./respond-to-an-incident.md) |
| 2 hops | incident retrospective | [../../tech-lead/risk/write-a-postmortem.md](../../tech-lead/risk/write-a-postmortem.md) |
| 2 hops | observability build-out | [../observability/set-up-observability.md](../observability/set-up-observability.md) |
| 2 hops | SLO definition | [../../tech-lead/roadmap/define-an-slo.md](../../tech-lead/roadmap/define-an-slo.md) |
| 2 hops | runbook | [../../engineer/infrastructure/write-a-runbook.md](../../engineer/infrastructure/write-a-runbook.md) |
| 2 hops | disaster recovery plan | [./prepare-a-disaster-recovery-plan.md](../../knowledge-curator/archive/strategies-legacy/oncall-sre/prepare-a-disaster-recovery-plan.md) |
| 2 hops | first-principles | [../../knowledge-curator/templates/thinking--first-principles.md](../../knowledge-curator/templates/thinking--first-principles.md) |
| 2 hops | inversion | [../../knowledge-curator/templates/thinking--inversion.md](../../knowledge-curator/templates/thinking--inversion.md) |
| 2 hops | second-order | [../../knowledge-curator/templates/thinking--second-order-thinking.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) |
| 2 hops | ockhams | [../../knowledge-curator/templates/thinking--ockhams-razor.md](../../knowledge-curator/templates/thinking--ockhams-razor.md) |

## Action recommendations

1. **weekly rotation + primary/backup**: weekly rotation; primary and backup dual oncall; not solo; not consecutive shifts
2. **handover ritual**: explicit handover on Monday; handover documentation; transfer of to-dos; not verbal
3. **tiered alert response**: P0 immediate response / P1 within 1h / P2 business day / P3 scheduled; only P0/P1 outside working hours
4. **every alert must carry a runbook**: each alert carries a runbook link; alerts without runbooks are cleaned up
5. **incident escalation path**: must escalate when over time; primary -> backup -> tech lead -> manager; do not soldier on alone
6. **notification mechanism**: phone / SMS / IM multi-channel; do not omit alerts; alert receipt confirmation
7. **rest guarantee**: make up time off after oncall; night alerts <= 2 times; consecutive oncall <= 2 weeks
8. **oncall runbook**: each alert carries a runbook; common failure handling process; do not rely on memory
9. **post-incident retrospective**: retrospective is required after each incident; postmortem; actions landed
10. **alert fatigue defense**: merge duplicate alerts; review thresholds; clean up noise
11. **rollback plan**: common incident rollback plans are prepared in advance; hotfix process smooth
12. **monitoring blind spots**: monitoring blind spots discovered during incidents must be filled
13. **cross-team escalation**: cross-team incidents must be notified; do not soldier on alone; RACI clear
14. **drills**: regular oncall drills; do not learn only during real incidents
15. **first principles**: why oncall is required; worst consequence of not having it
16. **inversion thinking**: how much can be solved with runbooks + automation; if solvable, do not page people
17. **second-order thinking**: second-order consequences of oncall (fatigue / culture / hiring / retention)
18. **Occam**: oncall process the simpler the better; cut redundant steps

## Related

- incident response: [./respond-to-an-incident.md](./respond-to-an-incident.md) — incident response
- incident retrospective: [../../tech-lead/risk/write-a-postmortem.md](../../tech-lead/risk/write-a-postmortem.md) — postmortem
- observability: [../observability/set-up-observability.md](../observability/set-up-observability.md) — alerts must be actionable
- SLO: [../../tech-lead/roadmap/define-an-slo.md](../../tech-lead/roadmap/define-an-slo.md) — burn-rate alerts
- runbook: [../../engineer/infrastructure/write-a-runbook.md](../../engineer/infrastructure/write-a-runbook.md) — handling runbook
- disaster recovery: [./prepare-a-disaster-recovery-plan.md](../../knowledge-curator/archive/strategies-legacy/oncall-sre/prepare-a-disaster-recovery-plan.md) — major incident plan
- thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking--first-principles.md) + [inversion](../../knowledge-curator/templates/thinking--inversion.md) + [second-order](../../knowledge-curator/templates/thinking--second-order-thinking.md) + [ockhams](../../knowledge-curator/templates/thinking--ockhams-razor.md)
