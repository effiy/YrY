---
title: I want to build an SLO strategy / Prepare an SLO strategy
aliases: [i-want-to-prepare-an-slo-strategy, slo-strategy, service-level-objective-strategy]
tags: [journey, methodology, sre, reliability, planning]
category: tech-lead/roadmap
created: 2026-08-04
updated: 2026-08-04
source: internal
type: journey
lifecycle: active
review_cycle: quarterly
roles: [tech-lead, engineer]
benefit: "launch is safe"
acceptance_criteria:
  - "frontmatter roles + benefit + acceptance_criteria present"
  - "descriptive verb-phrase filename, hyphens only, underscores and digits forbidden"
  - "body contains user-story header + 7 fixed-order sections"
related:
  - ../../engineer/strategies/prepare-an-sli-strategy.md
  - ../../engineer/strategies/prepare-an-error-budget-strategy.md
  - ../../engineer/strategies/prepare-a-dashboard-strategy.md
  - ../../oncall-sre/incident-response/prepare-an-incident-response-strategy.md
  - ../../engineer/strategies/prepare-a-site-reliability-engineering-strategy.md
  - ../../knowledge-curator/templates/thinking/first-principles.md
  - ../../knowledge-curator/templates/thinking/inversion.md
  - ../../knowledge-curator/templates/thinking/second-order-thinking.md
  - ../../knowledge-curator/templates/thinking/ockhams-razor.md
tacit: "SLO is not only a goal; it is a contract. Five dimensions: goal + budget + action + governance + measurement; business-value driven; not one-shot; measurable"
status: deprecated
---

# I want to build an SLO strategy

> **As a** tech lead, **I want to** prepare an slo, **so that** launch is safe.

## Summary

- SLO = contract; not only a goal
- Five dimensions: goal + budget + action + governance + measurement; no missing dimension
- Business-value driven; not by gut feel
- Covers availability / latency / quality / correctness / coverage multiple types
- Links with sli + error-budget + dashboard + incident-response + sre
- publicly queryable; not hidden
- periodic review; evolution updates
- first principles / inversion / second-order / Occam

## Scenario

SLO is a contract; not only a goal. This entry provides the full SLO path, covering goal + budget + action + governance + measurement, business-value driven not by gut feel, covering availability / latency / quality / correctness / coverage multiple types, links with prepare-an-sli-strategy + prepare-an-error-budget-strategy + prepare-a-dashboard-strategy + prepare-an-incident-response-strategy + prepare-a-site-reliability-engineering-strategy, publicly queryable, periodic review, and links to SLI / ErrorBudget / Dashboard / IncidentResponse / SRE and other leaves.

## 2-hop reachability paths

| Hops | goal | file |
|---|---|---|
| 1 hop | Entry overview | [README.md](./) |
| 1 hop | sli | [../../engineer/strategies/prepare-an-sli-strategy.md](../../engineer/strategies/prepare-an-sli-strategy.md) |
| 1 hop | error-budget | [../../engineer/strategies/prepare-an-error-budget-strategy.md](../../engineer/strategies/prepare-an-error-budget-strategy.md) |
| 2 hops | dashboard | [../../engineer/strategies/prepare-a-dashboard-strategy.md](../../engineer/strategies/prepare-a-dashboard-strategy.md) |
| 2 hops | sre | [../../engineer/strategies/prepare-a-site-reliability-engineering-strategy.md](../../engineer/strategies/prepare-a-site-reliability-engineering-strategy.md) |
| 2 hops | first-principles | [../../knowledge-curator/templates/thinking/first-principles.md](../../knowledge-curator/templates/thinking/first-principles.md) |

## Action recommendations

1. **Five dimensions**: goal + budget + action + governance + measurement; no missing dimension
2. **Business-value driven**: prioritize by efficiency + trust + speed + risk + cost; not sloganeering
3. **Goal Objective**: availability / latency / quality / closed loop; do not omit
4. **Budget**: error-budget / burn / alert / closed loop; do not omit
5. **Action**: freeze / throttle / priority / closed loop; do not omit
6. **Governance**: owner / cadence / review / documentation / drift; do not omit
7. **Measurement**: efficiency + trust + speed + risk + cost; do not omit
8. **Not one-shot**: progress from goal → budget → action → governance → measurement; no skipping
9. **Not report-ized**: reports are only the start; not the end
10. **Not sloganeering**: every principle must have landing evidence; not vague
11. **Versioned**: strategy has versions; evolution is traceable
12. **Link with sli**: SLO + SLI co-build
13. **Link with error-budget**: SLO + ErrorBudget co-build
14. **Link with dashboard**: SLO + Dashboard co-build
15. **Link with incident-response**: SLO + IncidentResponse co-build
16. **Link with sre**: SLO + SRE co-build
17. **Toolchain**: Sloth / OpenSlo / Nobl9 / Cortex / Prometheus
18. **Publicly queryable**: strategy everyone can look up; not hidden
19. **Periodic review**: evolution updates; not one-shot
20. **First principles**: why must SLO; worst consequence of not doing
21. **Inversion thinking**: how much can be solved by relying on SLA; if solvable, do not introduce a heavy strategy
22. **Second-order thinking**: second-order consequences after strategy (efficiency / trust / speed / risk)
23. **Occam**: SLO — the simpler the better; cut redundant goals

## Related

- sli: [../../engineer/strategies/prepare-an-sli-strategy.md](../../engineer/strategies/prepare-an-sli-strategy.md) — SLI co-build
- error-budget: [../../engineer/strategies/prepare-an-error-budget-strategy.md](../../engineer/strategies/prepare-an-error-budget-strategy.md) — ErrorBudget co-build
- dashboard: [../../engineer/strategies/prepare-a-dashboard-strategy.md](../../engineer/strategies/prepare-a-dashboard-strategy.md) — Dashboard co-build
- incident-response: [../../oncall-sre/incident-response/prepare-an-incident-response-strategy.md](../../oncall-sre/incident-response/prepare-an-incident-response-strategy.md) — IncidentResponse co-build
- sre: [../../engineer/strategies/prepare-a-site-reliability-engineering-strategy.md](../../engineer/strategies/prepare-a-site-reliability-engineering-strategy.md) — SRE co-build
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion](../../knowledge-curator/templates/thinking/inversion.md) + [second-order](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams](../../knowledge-curator/templates/thinking/ockhams-razor.md)
