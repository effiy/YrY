---
title: I want to build an SRE strategy / Prepare an SRE strategy
aliases: [i-want-to-prepare-an-sre-strategy, sre-strategy, site-reliability-engineering-strategy]
tags: [journey, methodology, sre, reliability, observability, governance, planning]
category: engineer/strategies
created: 2026-08-03
updated: 2026-08-03
source: internal
type: journey
lifecycle: active
review_cycle: quarterly
roles: [engineer]
benefit: "launch is safe"
acceptance_criteria:
  - "frontmatter roles + benefit + acceptance_criteria present"
  - "descriptive verb-phrase filename, hyphens only, underscores and digits forbidden"
  - "body contains user-story header + 7 fixed-order sections"
related:
  - ../../tech-lead/roadmap/define-an-slo.md
  - ../../oncall-sre/observability/set-up-observability.md
  - ../../oncall-sre/incident-response/prepare-an-incident-response-plan.md
  - ../../tech-lead/risk/write-a-postmortem.md
  - ../../oncall-sre/incident-response/handle-an-oncall-shift.md
  - ../../oncall-sre/incident-response/run-a-game-day.md
  - ../../oncall-sre/incident-response/do-a-rollback-drill.md
  - ../../tech-lead/roadmap/prepare-a-capacity-plan.md
  - ../../knowledge-curator/templates/thinking/first-principles.md
  - ../../knowledge-curator/templates/thinking/inversion.md
  - ../../knowledge-curator/templates/thinking/second-order-thinking.md
  - ../../knowledge-curator/templates/thinking/ockhams-razor.md
tacit: SRE is not just on-call; it is a contract. SLI/SLO/error budget/burn rate/alerting/retrospective six dimensions; reliability driven; not one-shot; measurable
---

# I want to build an SRE strategy

> **As an** engineer, **I want to** prepare an sre, **so that** launch is safe. 

## Summary

- SRE = contract; not just on-call
- SLI/SLO/error budget/burn rate/alerting/retrospective six dimensions; no missing dimension
- Reliability driven; not by gut feel
- Cover toil automation + error budget + blameless culture + capacity planning + change management + incident response
- Link with define-an-slo + set-up-observability + incident-response + postmortem + oncall + game-day + rollback-drill + capacity-plan
- Publicly queryable; not hidden
- Periodic review; evolution updates
- First principles / inversion / second-order / Occam

## Scenario

SRE is a contract; not just on-call. This entry provides the full SRE path, covering SLI/SLO/error budget/burn rate/alerting/retrospective, reliability driven rather than by gut feel, covering toil automation + error budget + blameless culture + capacity planning + change management + incident response, linking with define-an-slo + set-up-observability + prepare-an-incident-response-plan + write-a-postmortem + handle-an-oncall-shift + run-a-game-day + do-a-rollback-drill + prepare-a-capacity-plan, publicly queryable, periodically reviewed, and links to define-an-slo / set-up-observability / write-a-postmortem / handle-an-oncall-shift / run-a-game-day / do-a-rollback-drill / prepare-a-capacity-plan and other leaves. 

## 2-hop reachability paths

| Hops | Goal | File |
|---|---|---|
| 1 hop | Entry overview | [README.md](./) |
| 1 hop | slo | [../../tech-lead/roadmap/define-an-slo.md](../../tech-lead/roadmap/define-an-slo.md) |
| 1 hop | observability | [../../oncall-sre/observability/set-up-observability.md](../../oncall-sre/observability/set-up-observability.md) |
| 2 hop | incident-response | [../../oncall-sre/incident-response/prepare-an-incident-response-plan.md](../../oncall-sre/incident-response/prepare-an-incident-response-plan.md) |
| 2 hop | postmortem | [../../tech-lead/risk/write-a-postmortem.md](../../tech-lead/risk/write-a-postmortem.md) |
| 2 hop | oncall | [../../oncall-sre/incident-response/handle-an-oncall-shift.md](../../oncall-sre/incident-response/handle-an-oncall-shift.md) |
| 2 hop | game-day | [../../oncall-sre/incident-response/run-a-game-day.md](../../oncall-sre/incident-response/run-a-game-day.md) |
| 2 hop | first-principles | [../../knowledge-curator/templates/thinking/first-principles.md](../../knowledge-curator/templates/thinking/first-principles.md) |

## Action recommendations

1. **Six dimensions**: SLI/SLO/error budget/burn rate/alerting/retrospective; no missing dimension
2. **Reliability driven**: prioritize by SLO + user impact + business loss; no sloganeering
3. **SLI**: service-level indicator + user path + measurement; do not omit
4. **SLO**: service-level objective + error budget + quarterly goal; do not omit
5. **Error budget**: 4× SLI error-rate budget + burn rate + budget-exhaustion freeze; do not omit
6. **Alerting**: based on burn rate + multi-window + multi-burn-rate + actionable; do not omit
7. **Retrospective**: blameless + 5 whys + timeline + action items + closed-loop tracking; do not omit
8. **Not one-shot**: gradual from on-call → observability → SLO → error budget → blameless → automation; no skipping
9. **Not report-ized**: reports are only the start; not the end
10. **Not sloganeering**: every principle must have landing evidence; not vague
11. **Versioned**: strategy has versions; evolution is traceable
12. **Link with define-an-slo**: SRE + SLO co-build
13. **Link with observability**: SRE + observability co-build
14. **Link with incident-response**: SRE + incident response co-build
15. **Link with postmortem**: SRE + retrospective co-build
16. **Link with oncall**: SRE + on-call co-build
17. **Link with game-day**: SRE + drill co-build
18. **Link with capacity-plan**: SRE + capacity co-build
19. **Toolchain**: Prometheus / Grafana / PagerDuty / OpsLevel / Slo.io / Nobl9
20. **Publicly queryable**: strategy is queryable by everyone; not hidden
21. **Periodic review**: evolution updates; not one-shot
22. **First principles**: why SRE is necessary; worst consequence of not doing it
23. **Inversion thinking**: how much can be solved by relying on on-call + manual inspection; if solvable, do not introduce a heavy strategy
24. **Second-order thinking**: second-order consequences after the strategy (cost / complexity / reliability / business) 
25. **Occam**: SRE simpler is better; cut redundant steps

## Related

- slo: [../../tech-lead/roadmap/define-an-slo.md](../../tech-lead/roadmap/define-an-slo.md) — SLO co-build
- observability: [../../oncall-sre/observability/set-up-observability.md](../../oncall-sre/observability/set-up-observability.md) — observability co-build
- incident-response: [../../oncall-sre/incident-response/prepare-an-incident-response-plan.md](../../oncall-sre/incident-response/prepare-an-incident-response-plan.md) — incident response co-build
- postmortem: [../../tech-lead/risk/write-a-postmortem.md](../../tech-lead/risk/write-a-postmortem.md) — retrospective co-build
- oncall: [../../oncall-sre/incident-response/handle-an-oncall-shift.md](../../oncall-sre/incident-response/handle-an-oncall-shift.md) — on-call co-build
- game-day: [../../oncall-sre/incident-response/run-a-game-day.md](../../oncall-sre/incident-response/run-a-game-day.md) — drill co-build
- capacity-plan: [../../tech-lead/roadmap/prepare-a-capacity-plan.md](../../tech-lead/roadmap/prepare-a-capacity-plan.md) — capacity co-build
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion](../../knowledge-curator/templates/thinking/inversion.md) + [second-order](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams](../../knowledge-curator/templates/thinking/ockhams-razor.md)
