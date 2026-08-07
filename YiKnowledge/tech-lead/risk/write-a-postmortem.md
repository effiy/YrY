---
title: Write a postmortem
aliases: [i-want-to-write-a-postmortem, write-a-postmortem, incident-postmortem]
tags: [journey, methodology, postmortem, incident-response, blameless, root-cause]
category: tech-lead/risk
created: 2026-08-03
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: journey
lifecycle: active
status: stable
review_cycle: quarterly
roles: [tech-lead, engineer]
benefit: "knowledge is captured"
acceptance_criteria:
  - "user story header defines who, what, and why"
  - "step-by-step guide is complete with prerequisites and expected outcome"
  - "cross-references to related journeys and patterns are present
related:
  - ../../oncall-sre/incident-response/respond-to-an-incident.md
  - ../../engineer/process/run-a-retrospective.md
  - ../../oncall-sre/observability/set-up-observability.md
  - ../roadmap/define-an-slo.md
  - ./handle-an-outage-communication.md
  - ../../engineer/process/collaborate-across-teams.md
  - ../../knowledge-curator/templates/thinking/first-principles.md
  - ../../knowledge-curator/templates/thinking/inversion.md
  - ../../knowledge-curator/templates/thinking/second-order-thinking.md
  - ../../knowledge-curator/archive/strategies-legacy/engineer/prepare-a-five-whys-strategy.md
tacit: postmortem does not assign blame; blameless; first draft within 72h; public; minute-level timeline; actions tracked to closure
---

# I want to write an incident postmortem

> **As a** tech lead, **I want to** write a postmortem, **so that** knowledge is captured.

## Summary

- postmortem five sections: timeline + impact + root cause + actions + lessons
- blameless: not about individuals; about the system
- 5 whys to find root cause; do not stop at symptoms
- Timeline in minutes; UTC unified
- Impact quantified: user count / request count / revenue / SLO burn
- Actions tracked to closure; not landed = not written
- First draft within 72h; public within 1 week
- Public postmortem; do not hide landmines

## Scenario description

After an incident, a postmortem must be written; not writing means the same class of incident repeats. This entry gives the full postmortem path, covering the five-section structure, blameless culture, 5 whys root cause, minute-level timeline, quantified impact, action-tracking-to-closure, 72h first draft, public postmortem, and links to respond-to-an-incident / run-a-retrospective / set-up-observability / define-an-slo / handle-an-outage-communication / collaborate-across-teams leaves.

## 2-hop reachable paths

| Hops | Target | File |
|---|---|---|
| 1 hop | entry overview | [README.md](./) |
| 1 hop | incident response | [../../oncall-sre/incident-response/respond-to-an-incident.md](../../oncall-sre/incident-response/respond-to-an-incident.md) |
| 2 hops | retrospective meeting | [../../engineer/process/run-a-retrospective.md](../../engineer/process/run-a-retrospective.md) |
| 2 hops | observability setup | [../../oncall-sre/observability/set-up-observability.md](../../oncall-sre/observability/set-up-observability.md) |
| 2 hops | SLO definition | [../roadmap/define-an-slo.md](../roadmap/define-an-slo.md) |
| 2 hops | outage communication | [./i-want-to-handle-an-outage-communication.md](./handle-an-outage-communication.md) |
| 2 hops | cross-team collaboration | [../../engineer/process/collaborate-across-teams.md](../../engineer/process/collaborate-across-teams.md) |
| 2 hops | first-principles | [../../knowledge-curator/templates/thinking/first-principles.md](../../knowledge-curator/templates/thinking/first-principles.md) |
| 2 hops | inversion | [../../knowledge-curator/templates/thinking/inversion.md](../../knowledge-curator/templates/thinking/inversion.md) |
| 2 hops | second-order | [../../knowledge-curator/templates/thinking/second-order-thinking.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) |
| 2 hops | 5 whys | [../methodology/thinking-frameworks/five-whys.md](../../knowledge-curator/archive/strategies-legacy/engineer/prepare-a-five-whys-strategy.md) |

## Action recommendations

1. **Five-section structure**: timeline + impact + root cause + actions + lessons; no missing sections
2. **blameless**: not about individuals; about the system; no finger-pointing
3. **5 whys for root cause**: do not stop at symptoms; ask why 5 times
4. **Timeline in minutes**: UTC unified; minute-level; from first alert to recovery
5. **Quantified impact**: user count / request count / revenue / SLO burn; no ambiguity
6. **Actions tracked to closure**: owner + due date + status; not landed = not written
7. **First draft within 72h**: first draft within 72h of the incident; no delay
8. **Public within 1 week**: public postmortem; do not hide landmines; internal wiki + cross-team sharing
9. **Root cause not hidden**: honest root cause; do not hide landmines; scan for same-class vulnerabilities
10. **systemic improvements**: systemic patches; not about individuals; scan all same-class vulnerabilities
11. **Incident classification P0/P1/P2/P3**: classify by impact; P0 must have public postmortem
12. **Rollback plan**: every incident must have a rollback plan; no rollback = risk
13. **Alert sync**: did alert fire; trigger delay; missing alerts must be added
14. **Monitoring blind spots**: monitoring blind spots must be filled; next time discover earlier
15. **First principles**: why a postmortem must be written; worst consequence of not writing
16. **Inversion**: how much can be solved by retrospective; if solvable, do not convene big meeting
17. **Second-order thinking**: second-order consequences after postmortem (action landing / same-class vulnerabilities / culture)
18. **5 whys**: 5 whys to find root cause; do not stop at symptoms

## Related

- incident response: [../../oncall-sre/incident-response/respond-to-an-incident.md](../../oncall-sre/incident-response/respond-to-an-incident.md) — incident emergency
- retrospective meeting: [../../engineer/process/run-a-retrospective.md](../../engineer/process/run-a-retrospective.md) — sprint retro vs incident postmortem
- observability: [../../oncall-sre/observability/set-up-observability.md](../../oncall-sre/observability/set-up-observability.md) — monitoring blind-spot fill
- SLO: [../roadmap/define-an-slo.md](../roadmap/define-an-slo.md) — error budget burn
- outage communication: [./i-want-to-handle-an-outage-communication.md](./handle-an-outage-communication.md) — customer comms
- cross-team: [../../engineer/process/collaborate-across-teams.md](../../engineer/process/collaborate-across-teams.md) — cross-team impact
- thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion](../../knowledge-curator/templates/thinking/inversion.md) + [second-order](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [5 whys](../../knowledge-curator/archive/strategies-legacy/engineer/prepare-a-five-whys-strategy.md)
