---
title: I want to prepare an SRE strategy / Prepare a site reliability engineering strategy
aliases: [i-want-to-prepare-a-site-reliability-engineering-strategy, sre-strategy, sre, site-reliability-engineering]
tags: [journey, methodology, sre, reliability, slo, incident-response, governance, planning]
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
 - "filename is descriptive verb-phrase, hyphens only, no underscores or digits"
 - "body contains user story header + 7 fixed-order sections"
related:
 - ../../tech-lead/roadmap/define-an-slo.md
 - ../../oncall-sre/observability/set-up-observability.md
 - ../../oncall-sre/incident-response/respond-to-an-incident.md
 - ../../oncall-sre/incident-response/set-up-an-oncall-rotation.md
 - ../../oncall-sre/incident-response/prepare-an-incident-response-plan.md
 - ../../oncall-sre/incident-response/run-a-game-day.md
 - ../../knowledge-curator/templates/thinking/first-principles.md
 - ../../knowledge-curator/templates/thinking/inversion.md
 - ../../knowledge-curator/templates/thinking/second-order-thinking.md
 - ../../knowledge-curator/templates/thinking/ockhams-razor.md
tacit: SRE is not just firefighting; it is a contract. SLI/SLO + error budget + toil governance + capacity planning + incident retrospective + automation; engineering methods make reliability property-based, not people-based; measurable
---

# I want to prepare an SRE strategy

> **As an** engineer, **I want to** prepare a site reliability engineering, **so that** launch is safe. 

## Summary

- SRE = contract; not just firefighting
- SLI/SLO + error budget + toil governance + capacity planning + incident retrospective + automation; no missing dimension
- Engineering methods make reliability property-based; not people-based
- Error budget control + freeze release + no ambiguity
- Linked with SLO + observability + incident response + oncall + game day
- Publicly accessible; not hidden
- Regular review; Evolve and update
- First principles / inversion / second-order / Occam's razor

## Scenario description

SRE is a contract; not just firefighting. This entry provides the SRE full path, covering SLI/SLO + error budget + toil governance + capacity planning + incident retrospective + automation, engineering methods make reliability property-based not people-based, error budget control freezes release, linked with SLO + observability + incident response + oncall + game day, publicly accessible, regular review, and links to define-an-slo / set-up-observability / respond-to-an-incident / set-up-an-oncall-rotation / prepare-an-incident-response-plan / run-a-game-day and other leaves. 

## 2-hop reachability path

| Hops | Target | File |
|---|---|---|
| 1 hop | Entry overview | [README.md](./) |
| 1 hop | SLO | [../../tech-lead/roadmap/define-an-slo.md](../../tech-lead/roadmap/define-an-slo.md) |
| 2 hops | observability | [../../oncall-sre/observability/set-up-observability.md](../../oncall-sre/observability/set-up-observability.md) |
| 2 hops | incident | [../../oncall-sre/incident-response/respond-to-an-incident.md](../../oncall-sre/incident-response/respond-to-an-incident.md) |
| 2 hops | oncall | [../../oncall-sre/incident-response/set-up-an-oncall-rotation.md](../../oncall-sre/incident-response/set-up-an-oncall-rotation.md) |
| 2 hops | IR plan | [../../oncall-sre/incident-response/prepare-an-incident-response-plan.md](../../oncall-sre/incident-response/prepare-an-incident-response-plan.md) |
| 2 hops | game day | [../../oncall-sre/incident-response/run-a-game-day.md](../../oncall-sre/incident-response/run-a-game-day.md) |
| 2 hops | first-principles | [../../knowledge-curator/templates/thinking/first-principles.md](../../knowledge-curator/templates/thinking/first-principles.md) |
| 2 hops | inversion | [../../knowledge-curator/templates/thinking/inversion.md](../../knowledge-curator/templates/thinking/inversion.md) |
| 2 hops | second-order | [../../knowledge-curator/templates/thinking/second-order-thinking.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) |
| 2 hops | ockhams | [../../knowledge-curator/templates/thinking/ockhams-razor.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) |

## Action recommendations

1. **Six dimensions**: SLI/SLO + error budget + toil governance + capacity planning + incident retrospective + automation; no missing dimension
2. **SLI choice closest to users**: latency / error rate / saturation / availability; not CPU
3. **SLO by business criticality**: P0/P1/P2/P3 different targets; not one-size-fits-all
4. **Error budget**: 100% - SLO budget exhausted freezes release; no ambiguity
5. **Toil cap**: toil <= 50% engineering time; over cap automate
6. **Capacity planning**: based on SLO derive resources; not gut call
7. **Incident retrospective**: blameless + 5 why + action track to closed loop; not blame-shifting
8. **Automation**: repetitive work script-ize / Platform-ize; not people-based
9. **Runbook**: every alert has a runbook; no empty alerts
10. **Not firefighting-ized**: SRE != fire brigade; engineering methods make reliability property-based
11. **No ambiguity SLO**: SLO quantifiable and measurable; not slogans
12. **Not people-based**: people +100 won't solve problems; rely on automation
13. **Link with SLO**: strategy + SLO co-build
14. **Link with observability**: strategy + observe co-build
15. **Link with incident**: strategy + response co-build
16. **Link with oncall**: strategy + rotation co-build
17. **Link with game day**: strategy + drill co-build
18. **Toolchain**: Prometheus + Grafana + PagerDuty + runbook + chaos
19. **Publicly accessible**: SRE strategy accessible to everyone; not hidden
20. **Regular review**: Evolve and update; not one-shot
21. **First principles**: why must SRE; worst consequence of not doing it
22. **Inversion**: how much can ops + monitoring solve; if solvable, do not introduce SRE
23. **Second-order thinking**: second-order consequences after SRE (reliability / cost / hiring / organization) 
24. **Occam**: SRE the simpler the better; cut redundant steps

## Related

- SLO: [../../tech-lead/roadmap/define-an-slo.md](../../tech-lead/roadmap/define-an-slo.md) — SLO co-build
- observability: [../../oncall-sre/observability/set-up-observability.md](../../oncall-sre/observability/set-up-observability.md) — observe co-build
- incident: [../../oncall-sre/incident-response/respond-to-an-incident.md](../../oncall-sre/incident-response/respond-to-an-incident.md) — response co-build
- oncall: [../../oncall-sre/incident-response/set-up-an-oncall-rotation.md](../../oncall-sre/incident-response/set-up-an-oncall-rotation.md) — rotation co-build
- IR plan: [../../oncall-sre/incident-response/prepare-an-incident-response-plan.md](../../oncall-sre/incident-response/prepare-an-incident-response-plan.md) — IR co-build
- game day: [../../oncall-sre/incident-response/run-a-game-day.md](../../oncall-sre/incident-response/run-a-game-day.md) — drill co-build
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion](../../knowledge-curator/templates/thinking/inversion.md) + [second-order](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams](../../knowledge-curator/templates/thinking/ockhams-razor.md)
