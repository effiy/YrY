---
title: I want to prepare an incident response plan / Prepare an incident response plan
aliases: [i-want-to-prepare-an-incident-response-plan, incident-response-plan, ir-plan, incident-handling-plan]
tags: [journey, methodology, incident-response, ir-plan, sre, disaster-recovery, runbook, oncall]
category: oncall-sre/incident-response
created: 2026-08-03
updated: 2026-08-03
source: internal
type: journey
lifecycle: active
review_cycle: quarterly
roles: [oncall-sre, engineer]
benefit: "launch is safe"
acceptance_criteria:
  - "frontmatter roles + benefit + acceptance_criteria present"
  - "Filename is descriptive verb-phrase, hyphens only, no underscores or digits"
  - "body contains user-story header + 7 fixed-order sections"
related:
  - ./respond-to-an-incident.md
  - ../../tech-lead/risk/write-a-postmortem.md
  - ./handle-an-oncall-shift.md
  - ./prepare-a-disaster-recovery-plan.md
  - ../../engineer/strategies/prepare-a-business-continuity-plan.md
  - ./do-a-rollback-drill.md
  - ../../engineer/process/handle-outage-communication.md
  - ./run-a-game-day.md
  - ../../knowledge-curator/templates/thinking/first-principles.md
  - ../../knowledge-curator/templates/thinking/inversion.md
  - ../../knowledge-curator/templates/thinking/second-order-thinking.md
  - ../../knowledge-curator/templates/thinking/ockhams-razor.md
tacit: An incident response plan is not post-incident firefighting; it is a pre-incident plan. sev classification + role + process + upgrade + communication + runbook; rehearse before, not on the spot; write it down, don't rely on memory; periodic review
status: deprecated
---

# I want to prepare an incident response plan

> **As a** oncall sre, **I want to** prepare an incident response plan, **so that** launch is safe.

## Summary

- IR plan = pre-incident plan; not post-incident firefighting
- sev classification P0-P3; respond by level
- Three roles: incident commander + comms + ops
- process six steps: detect → triage → mitigate → resolve → communicate → postmortem
- upgrade path: automatic + manual
- runbook required; don't rely on memory
- regular drills; not on the spot
- linked with oncall + DR + BCP
- written in advance; not from memory
- periodic review; architecture evolution must update
- First principles / inversion / second-order / Occam

## Scenario

Incident response plan is core to SRE; not post-incident firefighting. This entry gives the IR plan full path, covering sev classification, three roles, six-step process, upgrade path, runbook required, regular drills, linked with oncall + DR + BCP, written in advance, periodic review, and links to respond-to-an-incident / write-a-postmortem / handle-an-oncall-shift / prepare-a-disaster-recovery-plan / prepare-a-business-continuity-plan / do-a-rollback-drill / handle-outage-communication / run-a-game-day and other leaves.

## 2-hop reachability paths

| Hop count | Target | File |
|---|---|---|
| 1 hop | Entry overview | [README.md](./) |
| 1 hop | incident response | [./respond-to-an-incident.md](./respond-to-an-incident.md) |
| 2 hops | postmortem | [../../tech-lead/risk/write-a-postmortem.md](../../tech-lead/risk/write-a-postmortem.md) |
| 2 hops | oncall | [./handle-an-oncall-shift.md](./handle-an-oncall-shift.md) |
| 2 hops | DR plan | [./prepare-a-disaster-recovery-plan.md](./prepare-a-disaster-recovery-plan.md) |
| 2 hops | BCP | [../../engineer/strategies/prepare-a-business-continuity-plan.md](../../engineer/strategies/prepare-a-business-continuity-plan.md) |
| 2 hops | rollback drill | [./do-a-rollback-drill.md](./do-a-rollback-drill.md) |
| 2 hops | outage communication | [../../engineer/process/handle-outage-communication.md](../../engineer/process/handle-outage-communication.md) |
| 2 hops | game day | [./run-a-game-day.md](./run-a-game-day.md) |
| 2 hops | first-principles | [../../knowledge-curator/templates/thinking/first-principles.md](../../knowledge-curator/templates/thinking/first-principles.md) |
| 2 hops | inversion | [../../knowledge-curator/templates/thinking/inversion.md](../../knowledge-curator/templates/thinking/inversion.md) |
| 2 hops | second-order | [../../knowledge-curator/templates/thinking/second-order-thinking.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) |
| 2 hops | ockhams | [../../knowledge-curator/templates/thinking/ockhams-razor.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) |

## Action recommendations

1. **sev classification**: P0 site-wide outage / P1 key features / P2 partial features / P3 edge features; respond by level
2. **Three roles**: incident commander leads + comms communicates + ops operates; don't mix
3. **six-step process**: detect → triage → mitigate → resolve → communicate → postmortem; no skipping
4. **upgrade path**: automatic alert + manual upgrade; don't under-report
5. **runbook required**: every alert has a runbook; don't rely on memory
6. **regular drills**: quarterly game day; not on the spot
7. **linked with oncall**: oncall is execution; IR plan is the playbook
8. **linked with DR**: P0 incident triggers DR
9. **linked with BCP**: long incident triggers BCP
10. **written in advance**: not from memory; document the playbook
11. **periodic review**: architecture evolution / quarterly update; not one-shot
12. **communication template**: internal / external / customer / media templates
13. **upgrade matrix**: sev × duration → who to escalate to
14. **post-incident retrospective**: every incident needs a postmortem; don't skip
15. **first principles**: why an IR plan is necessary; worst consequence of not writing one
16. **inversion thinking**: how much can oncall + process solve; if solvable, don't introduce an IR plan
17. **second-order thinking**: second-order consequences after the IR plan (response consistency / hiring / culture / trust)
18. **Occam**: the simpler the IR plan, the better; cut redundant process

## Related

- incident response: [./respond-to-an-incident.md](./respond-to-an-incident.md) — execution
- postmortem: [../../tech-lead/risk/write-a-postmortem.md](../../tech-lead/risk/write-a-postmortem.md) — post-incident retrospective
- oncall: [./handle-an-oncall-shift.md](./handle-an-oncall-shift.md) — shift execution
- DR plan: [./prepare-a-disaster-recovery-plan.md](./prepare-a-disaster-recovery-plan.md) — P0 trigger
- BCP: [../../engineer/strategies/prepare-a-business-continuity-plan.md](../../engineer/strategies/prepare-a-business-continuity-plan.md) — long incident trigger
- rollback drill: [./do-a-rollback-drill.md](./do-a-rollback-drill.md) — mitigation drill
- outage communication: [../../engineer/process/handle-outage-communication.md](../../engineer/process/handle-outage-communication.md) — communication template
- game day: [./run-a-game-day.md](./run-a-game-day.md) — drill
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion](../../knowledge-curator/templates/thinking/inversion.md) + [second-order](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams](../../knowledge-curator/templates/thinking/ockhams-razor.md)
