---
title: I want to build an SLI strategy / Prepare an SLI strategy
aliases: [i-want-to-prepare-an-sli-strategy, sli-strategy, service-level-indicator-strategy]
tags: [journey, methodology, sre, reliability, planning]
category: engineer/strategies
created: 2026-08-04
updated: 2026-08-04
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
  - ../../tech-lead/roadmap/prepare-an-slo-strategy.md
  - ./prepare-an-error-budget-strategy.md
  - ./prepare-a-metrics-strategy.md
  - ../../oncall-sre/incident-response/prepare-an-observability-strategy.md
  - ./prepare-a-site-reliability-engineering-strategy.md
  - ../../knowledge-curator/templates/thinking/first-principles.md
  - ../../knowledge-curator/templates/thinking/inversion.md
  - ../../knowledge-curator/templates/thinking/second-order-thinking.md
  - ../../knowledge-curator/templates/thinking/ockhams-razor.md
tacit: SLI is not just metrics; it is a contract. Definition + collection + threshold + governance + measurement five dimensions; business-value driven; not one-shot; measurable
status: deprecated
---

# I want to build an SLI strategy

> **As an** engineer, **I want to** prepare an sli, **so that** launch is safe.

## Summary

- SLI = contract; not just metrics
- Definition + collection + threshold + governance + measurement five dimensions; no missing dimension
- Business-value driven; not by gut feel
- Covers latency / error / availability / quality / saturation multiple types
- Links to slo + error-budget + metrics + observability + sre
- Publicly queryable; not hidden
- Periodic review; evolution updates
- First principles / inversion / second-order / Occam

## Scenario

SLI is a contract; not just metrics. This entry provides the SLI full path, covering definition + collection + threshold + governance + measurement, business-value driven (not by gut feel), covering latency / error / availability / quality / saturation multiple types, linking to prepare-an-slo-strategy + prepare-an-error-budget-strategy + prepare-a-metrics-strategy + prepare-an-observability-strategy + prepare-a-site-reliability-engineering-strategy, publicly queryable, periodic review, and links to SLO / ErrorBudget / Metrics / Observability / SRE and other leaves.

## 2-hop reachability paths

| Hops | Goal | File |
|---|---|---|
| 1 hop | Entry overview | [README.md](./) |
| 1 hop | slo | [../../tech-lead/roadmap/prepare-an-slo-strategy.md](../../tech-lead/roadmap/prepare-an-slo-strategy.md) |
| 1 hop | metrics | [./prepare-a-metrics-strategy.md](./prepare-a-metrics-strategy.md) |
| 2 hops | error-budget | [./prepare-an-error-budget-strategy.md](./prepare-an-error-budget-strategy.md) |
| 2 hops | sre | [./prepare-a-site-reliability-engineering-strategy.md](./prepare-a-site-reliability-engineering-strategy.md) |
| 2 hops | first-principles | [../../knowledge-curator/templates/thinking/first-principles.md](../../knowledge-curator/templates/thinking/first-principles.md) |

## Action recommendations

1. **Five dimensions**: definition + collection + threshold + governance + measurement; no missing dimension
2. **Business-value driven**: prioritize by efficiency + trust + speed + risk + cost; not sloganeering
3. **Define**: numerator / denominator / user journey / closed loop; do not omit
4. **Collect**: source / cadence / window / closed loop; do not omit
5. **Threshold**: good / bad / cut / closed loop; do not omit
6. **Governance**: owner / cadence / review / documentation / drift; do not omit
7. **Measure**: efficiency + trust + speed + risk + cost; do not omit
8. **Not one-shot**: progressive from definition → collection → threshold → governance → measurement; no skipping
9. **Not report-only**: reports are only the start; not the end
10. **Not sloganeering**: every principle must have landing evidence; not vague
11. **Versioned**: strategy has versions; evolution is traceable
12. **Links to slo**: SLI + SLO co-build
13. **Links to error-budget**: SLI + ErrorBudget co-build
14. **Links to metrics**: SLI + Metrics co-build
15. **Links to observability**: SLI + Observability co-build
16. **Links to sre**: SLI + SRE co-build
17. **Toolchain**: Prometheus / Sloth / OpenSlo / Nobl9 / Cortex
18. **Publicly queryable**: strategy everyone can look up; not hidden
19. **Periodic review**: evolution updates; not one-shot
20. **First principles**: why SLI is a must; worst consequence of not doing it
21. **Inversion thinking**: how much can monitoring solve; if solvable, don't introduce a heavy strategy
22. **Second-order thinking**: second-order consequences after the strategy (efficiency / trust / speed / risk)
23. **Occam**: SLI — the simpler the better; cut redundant dimensions

## Related

- slo: [../../tech-lead/roadmap/prepare-an-slo-strategy.md](../../tech-lead/roadmap/prepare-an-slo-strategy.md) — SLO co-build
- error-budget: [./prepare-an-error-budget-strategy.md](./prepare-an-error-budget-strategy.md) — ErrorBudget co-build
- metrics: [./prepare-a-metrics-strategy.md](./prepare-a-metrics-strategy.md) — Metrics co-build
- observability: [../../oncall-sre/incident-response/prepare-an-observability-strategy.md](../../oncall-sre/incident-response/prepare-an-observability-strategy.md) — Observability co-build
- sre: [./prepare-a-site-reliability-engineering-strategy.md](./prepare-a-site-reliability-engineering-strategy.md) — SRE co-build
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion](../../knowledge-curator/templates/thinking/inversion.md) + [second-order](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams](../../knowledge-curator/templates/thinking/ockhams-razor.md)
