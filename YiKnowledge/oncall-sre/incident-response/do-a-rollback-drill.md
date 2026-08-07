---
title: Do a rollback drill
aliases: [i-want-to-do-a-rollback-drill, rollback-drill, rollback-rehearsal]
tags: [journey, methodology, rollback, drill, rehearsal, resilience, incident-response]
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
benefit: "SREs practice rollback procedures so that real rollbacks are fast, safe, and error-free"
acceptance_criteria:
  - "user story header defines who, what, and why"
  - "step-by-step guide is complete with prerequisites and expected outcome"
  - "cross-references to related journeys and patterns are present
related:
  - ./respond-to-an-incident.md
  - ../../engineer/infrastructure/ship-a-release.md
  - ../../tech-lead/risk/write-a-postmortem.md
  - ../../engineer/infrastructure/set-up-ci-cd.md
  - ../../tech-lead/roadmap/define-an-slo.md
  - ../../knowledge-curator/templates/thinking/first-principles.md
  - ../../knowledge-curator/templates/thinking/inversion.md
  - ../../knowledge-curator/templates/thinking/second-order-thinking.md
  - ../../knowledge-curator/templates/thinking/ockhams-razor.md
tacit: A rollback drill is not a formality; it is real rehearsal; quarterly; not drilling = cannot roll back; rollback precedes fix
---

# I want to do a rollback drill

> **As an** oncall sre, **I want to** do a rollback drill, **so that** outcome is traceable.

## Summary

- Drill quarterly; not a formality
- Real rehearsal: simulate real incidents; not verbal
- Drill four pieces: trigger → decision → execution → verification
- Rollback plan up front: rollback plan required before release
- Drill measurement: MTTR / rollback success rate / data consistency
- Not drilling = cannot roll back
- Rollback precedes fix
- Drill retrospective: gaps tracked to closure

## Scenario

Rollback is a key incident response skill; without drills, real incidents cause chaos. This entry provides the rollback drill full path, covering quarterly frequency, real rehearsal, four-piece process, rollback plan up front, measurement, not drilling = cannot, rollback precedes fix, drill retrospective, and links to prepare-a-disaster-recovery-plan / respond-to-an-incident / ship-a-release / write-a-postmortem / set-up-ci-cd / define-an-slo and other leaves.

## 2-hop reachability paths

| Hop count | Target | File |
|---|---|---|
| 1 hop | Entry overview | [README.md](./) |
| 1 hop | disaster recovery plan | [./prepare-a-disaster-recovery-plan.md](../../knowledge-curator/archive/strategies-legacy/oncall-sre/prepare-a-disaster-recovery-plan.md) |
| 2 hops | incident response | [./respond-to-an-incident.md](./respond-to-an-incident.md) |
| 2 hops | release launch | [../../engineer/infrastructure/ship-a-release.md](../../engineer/infrastructure/ship-a-release.md) |
| 2 hops | incident retrospective | [../../tech-lead/risk/write-a-postmortem.md](../../tech-lead/risk/write-a-postmortem.md) |
| 2 hops | CI/CD | [../../engineer/infrastructure/set-up-ci-cd.md](../../engineer/infrastructure/set-up-ci-cd.md) |
| 2 hops | SLO definition | [../../tech-lead/roadmap/define-an-slo.md](../../tech-lead/roadmap/define-an-slo.md) |
| 2 hops | first-principles | [../../knowledge-curator/templates/thinking/first-principles.md](../../knowledge-curator/templates/thinking/first-principles.md) |
| 2 hops | inversion | [../../knowledge-curator/templates/thinking/inversion.md](../../knowledge-curator/templates/thinking/inversion.md) |
| 2 hops | second-order | [../../knowledge-curator/templates/thinking/second-order-thinking.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) |
| 2 hops | ockhams | [../../knowledge-curator/templates/thinking/ockhams-razor.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) |

## Action recommendations

1. **Quarterly**: drill every quarter; not a formality
2. **Real rehearsal**: simulate real incidents; not verbal; not pre-rehearsed
3. **Four-piece process**: trigger → decision → execution → verification; no missing segment
4. **Rollback plan up front**: rollback plan required before release; no plan = risk
5. **Drill measurement**: MTTR / rollback success rate / data consistency / user perception
6. **Not drilling = cannot roll back**: drill is the only validation
7. **Rollback precedes fix**: first rollback to stabilize; then fix root cause
8. **Drill retrospective**: track gaps to closure; do not hide landmines
9. **Multi-scenario drill**: service rollback / database rollback / config rollback / DNS rollback
10. **Cross-team drill**: dev + ops + oncall + customer support
11. **Drill classification**: tabletop / semi-live / full-live
12. **Data rollback**: database rollback is hardest; backup + binlog + flash-back
13. **Config rollback**: config center versioned; second-level rollback
14. **DNS rollback**: short DNS TTL; fast rollback
15. **first principles**: why must drill; worst consequence of not drilling
16. **inversion thinking**: how much can automated rollback + CI gate solve; if solvable, do not do it manually
17. **second-order thinking**: second-order consequences after drill (MTTR / confidence / culture / hiring)
18. **Occam**: the simpler the drill plan, the better; cut redundant steps

## Related

- disaster recovery plan: [./prepare-a-disaster-recovery-plan.md](../../knowledge-curator/archive/strategies-legacy/oncall-sre/prepare-a-disaster-recovery-plan.md) — major incident plan
- incident response: [./respond-to-an-incident.md](./respond-to-an-incident.md) — incident response
- release launch: [../../engineer/infrastructure/ship-a-release.md](../../engineer/infrastructure/ship-a-release.md) — rollback plan before release
- incident retrospective: [../../tech-lead/risk/write-a-postmortem.md](../../tech-lead/risk/write-a-postmortem.md) — drill retrospective
- CI/CD: [../../engineer/infrastructure/set-up-ci-cd.md](../../engineer/infrastructure/set-up-ci-cd.md) — automated rollback
- SLO: [../../tech-lead/roadmap/define-an-slo.md](../../tech-lead/roadmap/define-an-slo.md) — error budget driven
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion](../../knowledge-curator/templates/thinking/inversion.md) + [second-order](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams](../../knowledge-curator/templates/thinking/ockhams-razor.md)
