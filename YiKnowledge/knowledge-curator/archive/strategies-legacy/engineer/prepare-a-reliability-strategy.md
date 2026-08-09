---
title: Prepare a Reliability strategy
aliases: [i-want-to-prepare-a-reliability-strategy, reliability-strategy]
tags: [journey, methodology, engineering, reliability, planning]
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
  - "Filename is descriptive verb-phrase, hyphens only, no underscores or digits"
  - "body contains user-story header + 7 fixed-order sections"
related:
  - ./prepare-a-performance-strategy.md
  - ./prepare-a-scalability-strategy.md
  - ./prepare-a-site-reliability-strategy.md
  - ./prepare-a-fault-tolerance-strategy.md
  - ./prepare-a-high-availability-strategy.md
  - ../../knowledge-curator/templates/thinking/first-principles.md
  - ../../knowledge-curator/templates/thinking/inversion.md
  - ../../knowledge-curator/templates/thinking/second-order-thinking.md
  - ../../knowledge-curator/templates/thinking/ockhams-razor.md
tacit: "Reliability is more than stability; it is a contract. Five dimensions: goals + monitoring + fault tolerance + governance + measurement; business-value driven; not one-shot; measurable"
status: deprecated
---

# Prepare a Reliability strategy

> **As an** engineer, **I want to** prepare a reliability, **so that** launch is safe.

## Summary

- Reliability = contract; more than stability
- Five dimensions: goals + monitoring + fault tolerance + governance + measurement; no missing dimension
- Business-value driven; not by gut feel
- Covers slo / error-budget / fault-tolerance / failover / mttr multiple types
- Links with performance + scalability + site-reliability + fault-tolerance + high-availability
- Publicly queryable; not hidden
- Periodic review; evolution updates
- First principles / inversion / second-order / Occam

## Scenario

Reliability is a contract; more than stability. This entry gives the full Reliability path, covering goals + monitoring + fault tolerance + governance + measurement, business-value driven rather than by gut feel, covering slo / error-budget / fault-tolerance / failover / mttr multiple types, linking with prepare-a-performance-strategy + prepare-a-scalability-strategy + prepare-a-site-reliability-strategy + prepare-a-fault-tolerance-strategy + prepare-a-high-availability-strategy, publicly queryable, periodic review, and links to Performance / Scalability / SRE / FaultTolerance / HA and other leaves.

## 2-hop reachability paths

| Hop count | Target | File |
|---|---|---|
| 1 hop | Entry overview | [README.md](./) |
| 1 hop | performance | [./prepare-a-performance-strategy.md](./prepare-a-performance-strategy.md) |
| 1 hop | scalability | [./prepare-a-scalability-strategy.md](./prepare-a-scalability-strategy.md) |
| 2 hops | site-reliability | [./prepare-a-site-reliability-strategy.md](./prepare-a-site-reliability-strategy.md) |
| 2 hops | fault-tolerance | [./prepare-a-fault-tolerance-strategy.md](./prepare-a-fault-tolerance-strategy.md) |
| 2 hops | first-principles | [../../knowledge-curator/templates/thinking/first-principles.md](../../knowledge-curator/templates/thinking/first-principles.md) |

## Action recommendations

1. **Five dimensions**: goals + monitoring + fault tolerance + governance + measurement; no missing dimension
2. **Business-value driven**: prioritize by efficiency + trust + speed + risk + cost; not sloganeering
3. **Goals**: slo / error budget / closed loop; do not omit
4. **Monitoring**: trace / metric / log / closed loop; do not omit
5. **Fault tolerance**: retry / closed loop / fallback / closed loop; do not omit
6. **Governance**: owner / cadence / review / documentation / drift; do not omit
7. **Measurement**: efficiency + trust + speed + risk + cost; do not omit
8. **Not one-shot**: progress gradually from goals → monitoring → fault tolerance → governance → measurement; no skipping
9. **Not report-ized**: reports are only the start; not the end
10. **Not sloganeering**: every principle must have landing evidence; not vague
11. **Versioned**: strategy has versions; evolution is traceable
12. **Link with performance**: Reliability + Performance co-built
13. **Link with scalability**: Reliability + Scalability co-built
14. **Link with site-reliability**: Reliability + SRE co-built
15. **Link with fault-tolerance**: Reliability + FaultTolerance co-built
16. **Link with high-availability**: Reliability + HA co-built
17. **Toolchain**: Prometheus / Grafana / Sloth / Pyrra / OpenSLO
18. **Publicly queryable**: strategy everyone can look up; not hidden
19. **Periodic review**: evolution updates; not one-shot
20. **First principles**: why Reliability is necessary; the worst consequence of not doing it
21. **Inversion thinking**: how much can be solved with "as long as it runs"; if solvable, do not introduce a heavy strategy
22. **Second-order thinking**: second-order consequences after the strategy (efficiency / trust / speed / risk)
23. **Occam**: the simpler Reliability is, the better; cut redundant alerts

## Related

- performance: [./prepare-a-performance-strategy.md](./prepare-a-performance-strategy.md) — Performance co-built
- scalability: [./prepare-a-scalability-strategy.md](./prepare-a-scalability-strategy.md) — Scalability co-built
- site-reliability: [./prepare-a-site-reliability-strategy.md](./prepare-a-site-reliability-strategy.md) — SRE co-built
- fault-tolerance: [./prepare-a-fault-tolerance-strategy.md](./prepare-a-fault-tolerance-strategy.md) — FaultTolerance co-built
- high-availability: [./prepare-a-high-availability-strategy.md](./prepare-a-high-availability-strategy.md) — HA co-built
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion](../../knowledge-curator/templates/thinking/inversion.md) + [second-order](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams](../../knowledge-curator/templates/thinking/ockhams-razor.md)
