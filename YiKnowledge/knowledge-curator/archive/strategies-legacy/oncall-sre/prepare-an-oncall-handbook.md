---
title: I want to prepare an oncall handbook / Prepare an oncall handbook
aliases: [i-want-to-prepare-an-oncall-handbook, oncall-handbook, oncall-strategy]
tags: [journey, methodology, sre, oncall, incident, planning]
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
  - ../../engineer/strategies/prepare-an-sre-strategy.md
  - ./prepare-an-incident-response-strategy.md
  - ../../tech-lead/roadmap/prepare-an-incident-postmortem-strategy.md
  - ./prepare-an-observability-strategy.md
  - ../../engineer/strategies/prepare-a-resilience-engineering-strategy.md
  - ../../engineer/strategies/prepare-an-alerting-strategy.md
  - ../../engineer/strategies/prepare-a-developer-productivity-strategy.md
  - ./respond-to-an-incident.md
  - ../../knowledge-curator/templates/thinking/first-principles.md
  - ../../knowledge-curator/templates/thinking/inversion.md
  - ../../knowledge-curator/templates/thinking/second-order-thinking.md
  - ../../knowledge-curator/templates/thinking/ockhams-razor.md
tacit: Oncall is not just being on duty; it is a contract. Rotation + alerting + runbook + escalation + retrospective are five dimensions; business-value driven; not one-shot; measurable
status: deprecated
---

# I want to prepare an oncall handbook

> **As a** oncall sre, **I want to** prepare an oncall handbook, **so that** launch is safe. 

## Summary

- Oncall = contract; not just being on duty
- Rotation + alerting + runbook + escalation + retrospective are five dimensions; no missing dimension
- Business-value driven; not by gut feel
- Covers primary / secondary / manager / cross-team multiple roles
- Links with sre + incident-response + incident-postmortem + observability + resilience-engineering + alerting + developer-productivity + respond-to-incident
- Publicly queryable; not hidden
- Periodic review; evolution updates
- First principles / inversion / second-order / Occam

## Scenario

Oncall is a contract; not just being on duty. This entry provides the full oncall path, covering rotation + alerting + runbook + escalation + retrospective, business-value driven rather than by gut feel, covering primary / secondary / manager / cross-team multiple roles, linking with prepare-an-sre-strategy + prepare-an-incident-response-strategy + prepare-an-incident-postmortem-strategy + prepare-an-observability-strategy + prepare-a-resilience-engineering-strategy + prepare-an-alerting-strategy + prepare-a-developer-productivity-strategy + respond-to-an-incident, publicly queryable, periodic review, and links to prepare-an-sre-strategy / prepare-an-incident-response-strategy / prepare-an-incident-postmortem-strategy / prepare-an-observability-strategy / prepare-a-resilience-engineering-strategy / prepare-an-alerting-strategy / prepare-a-developer-productivity-strategy / respond-to-an-incident and other leaves.

## 2-hop reachability paths

| Hop count | Target | File |
|---|---|---|
| 1 hop | Entry overview | [README.md](./) |
| 1 hop | sre | [../../engineer/strategies/prepare-an-sre-strategy.md](../../engineer/strategies/prepare-an-sre-strategy.md) |
| 1 hop | incident-response | [./prepare-an-incident-response-strategy.md](./prepare-an-incident-response-strategy.md) |
| 2 hop | incident-postmortem | [../../tech-lead/roadmap/prepare-an-incident-postmortem-strategy.md](../../tech-lead/roadmap/prepare-an-incident-postmortem-strategy.md) |
| 2 hop | observability | [./prepare-an-observability-strategy.md](./prepare-an-observability-strategy.md) |
| 2 hop | resilience-engineering | [../../engineer/strategies/prepare-a-resilience-engineering-strategy.md](../../engineer/strategies/prepare-a-resilience-engineering-strategy.md) |
| 2 hop | alerting | [../../engineer/strategies/prepare-an-alerting-strategy.md](../../engineer/strategies/prepare-an-alerting-strategy.md) |
| 2 hops | first-principles | [../../knowledge-curator/templates/thinking/first-principles.md](../../knowledge-curator/templates/thinking/first-principles.md) |

## Action recommendations

1. **Five dimensions**: rotation + alerting + runbook + escalation + retrospective; no missing dimension
2. **Business-value driven**: prioritize by business impact + response latency + recurrence rate + workload; not sloganeering
3. **Rotation**: primary + secondary + manager + follow-the-sun + fairness + fatigue management; do not omit
4. **Alerting**: tiering + routing + suppression + silence + acknowledge + auto-recovery; do not omit
5. **Runbook**: every alert maps to a runbook + steps + verification + rollback + escalation; do not omit
6. **Escalation**: manager + IM + phone + cross-team + time window + decision tree; do not omit
7. **Retrospective**: every incident requires retrospective + action items + tracking + closure + culture building; do not omit
8. **Not one-shot**: from rotation table → alerting routing → runbook → escalation → retrospective progressive; no skipping
9. **Not report-ized**: reports are only the start; not the end
10. **Not sloganeering**: every principle must have landing evidence; not vague
11. **Versioned**: strategy has versions; evolution is traceable
12. **Link with sre**: oncall + SRE co-built
13. **Link with incident-response**: oncall + IR co-built
14. **Link with incident-postmortem**: oncall + retrospective co-built
15. **Link with observability**: oncall + observability co-built
16. **Link with resilience-engineering**: oncall + resilience co-built
17. **Link with alerting**: oncall + alerting co-built
18. **Toolchain**: PagerDuty / Opsgenie / VictorOps / FireHydrant / incident.io / Slack / on-call rotation
19. **Publicly queryable**: strategy everyone can look up; not hidden
20. **Periodic review**: evolution updates; not one-shot
21. **First principles**: why oncall is necessary; worst consequence of not doing it
22. **Inversion thinking**: how much can be solved with 24x7 full-staff rotation; if solvable, do not introduce a heavy strategy
23. **Second-order thinking**: second-order consequences after the strategy (cost / fatigue / culture / business)
24. **Occam**: simpler oncall is better; cut redundant steps

## Related

- sre: [../../engineer/strategies/prepare-an-sre-strategy.md](../../engineer/strategies/prepare-an-sre-strategy.md) — SRE co-built
- incident-response: [./prepare-an-incident-response-strategy.md](./prepare-an-incident-response-strategy.md) — IR co-built
- incident-postmortem: [../../tech-lead/roadmap/prepare-an-incident-postmortem-strategy.md](../../tech-lead/roadmap/prepare-an-incident-postmortem-strategy.md) — retrospective co-built
- observability: [./prepare-an-observability-strategy.md](./prepare-an-observability-strategy.md) — observability co-built
- resilience-engineering: [../../engineer/strategies/prepare-a-resilience-engineering-strategy.md](../../engineer/strategies/prepare-a-resilience-engineering-strategy.md) — resilience co-built
- alerting: [../../engineer/strategies/prepare-an-alerting-strategy.md](../../engineer/strategies/prepare-an-alerting-strategy.md) — alerting co-built
- developer-productivity: [../../engineer/strategies/prepare-a-developer-productivity-strategy.md](../../engineer/strategies/prepare-a-developer-productivity-strategy.md) — productivity co-built
- respond-to-incident: [./respond-to-an-incident.md](./respond-to-an-incident.md) — response co-built
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion](../../knowledge-curator/templates/thinking/inversion.md) + [second-order](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams](../../knowledge-curator/templates/thinking/ockhams-razor.md)
