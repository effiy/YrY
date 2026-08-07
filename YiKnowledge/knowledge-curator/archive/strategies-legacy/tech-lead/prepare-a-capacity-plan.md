---
title: I want to prepare a capacity plan / Prepare a capacity plan
aliases: [i-want-to-prepare-a-capacity-plan, capacity-plan, capacity-planning]
tags: [journey, methodology, engineering, capacity, finops, planning]
category: tech-lead/roadmap
created: 2026-08-03
updated: 2026-08-03
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
  - ../../engineer/strategies/prepare-an-sre-strategy.md
  - ../../oncall-sre/incident-response/prepare-a-finops-strategy.md
  - ../../oncall-sre/incident-response/prepare-an-observability-strategy.md
  - ./prepare-a-cloud-architecture-strategy.md
  - ../../engineer/strategies/prepare-a-platform-engineering-strategy.md
  - ../../engineer/strategies/prepare-a-resilience-engineering-strategy.md
  - ../../engineer/strategies/prepare-a-zero-downtime-deployment-strategy.md
  - ../../engineer/strategies/prepare-a-cost-optimization-strategy.md
  - ../../knowledge-curator/templates/thinking/first-principles.md
  - ../../knowledge-curator/templates/thinking/inversion.md
  - ../../knowledge-curator/templates/thinking/second-order-thinking.md
  - ../../knowledge-curator/templates/thinking/ockhams-razor.md
tacit: Capacity planning is more than scaling out; it is a contract. Baseline + forecast + threshold + scaling + drill are the five dimensions; business-value driven; not one-shot; measurable
---

# I want to prepare a capacity plan

> **As a** tech lead, **I want to** prepare a capacity plan, **so that** launch is safe.

## Summary

- Capacity planning = contract; not just scaling out
- Baseline + forecast + threshold + scaling + drill are the five dimensions; no missing dimension
- Business-value driven; not by gut feel
- Cover real-time / offline / burst / long-tail multiple scenarios
- Linked with sre + finops + observability + cloud-architecture + platform-engineering + resilience-engineering + zero-downtime + cost-optimization
- Publicly queryable; not hidden
- Periodic review; evolution updates
- First principles / inversion / second-order / Occam

## Scenario

Capacity planning is a contract; not just scaling out. This entry provides the full capacity planning path, covering baseline + forecast + threshold + scaling + drill, business-value driven rather than by gut feel, covering real-time / offline / burst / long-tail multiple scenarios, linked with prepare-an-sre-strategy + prepare-a-finops-strategy + prepare-an-observability-strategy + prepare-a-cloud-architecture-strategy + prepare-a-platform-engineering-strategy + prepare-a-resilience-engineering-strategy + prepare-a-zero-downtime-deployment-strategy + prepare-a-cost-optimization-strategy, publicly queryable, periodic review, and links to prepare-an-sre-strategy / prepare-a-finops-strategy / prepare-an-observability-strategy / prepare-a-cloud-architecture-strategy / prepare-a-platform-engineering-strategy / prepare-a-resilience-engineering-strategy / prepare-a-zero-downtime-deployment-strategy / prepare-a-cost-optimization-strategy and other leaves.

## 2-hop reachability paths

| Hops | Goal | File |
|---|---|---|
| 1 hop | Entry overview | [README.md](./) |
| 1 hop | sre | [../../engineer/strategies/prepare-an-sre-strategy.md](../../engineer/strategies/prepare-an-sre-strategy.md) |
| 1 hop | finops | [../../oncall-sre/incident-response/prepare-a-finops-strategy.md](../../oncall-sre/incident-response/prepare-a-finops-strategy.md) |
| 2 hops | observability | [../../oncall-sre/incident-response/prepare-an-observability-strategy.md](../../oncall-sre/incident-response/prepare-an-observability-strategy.md) |
| 2 hops | cloud-architecture | [./prepare-a-cloud-architecture-strategy.md](./prepare-a-cloud-architecture-strategy.md) |
| 2 hops | platform-engineering | [../../engineer/strategies/prepare-a-platform-engineering-strategy.md](../../engineer/strategies/prepare-a-platform-engineering-strategy.md) |
| 2 hops | resilience-engineering | [../../engineer/strategies/prepare-a-resilience-engineering-strategy.md](../../engineer/strategies/prepare-a-resilience-engineering-strategy.md) |
| 2 hops | first-principles | [../../knowledge-curator/templates/thinking/first-principles.md](../../knowledge-curator/templates/thinking/first-principles.md) |

## Action recommendations

1. **Five dimensions**: baseline + forecast + threshold + scaling + drill; no missing dimension
2. **Business-value driven**: prioritize by business peak + growth rate + key path + cost; not sloganeering
3. **Baseline**: current QPS + latency + resources + utilization + capacity ceiling; do not omit
4. **Forecast**: business growth + seasonality + promotions + burst + trend extrapolation; do not omit
5. **Threshold**: CPU + memory + IO + network + queue + error rate across multiple dimensions; do not omit
6. **Scaling**: HPA + VPA + Cluster Autoscaler + pre-scaling + Spot + Savings Plan; do not omit
7. **Drill**: load testing + chaos + burst simulation + capacity ceiling validation + failure rollback; do not omit
8. **Not one-shot**: progress from baseline → forecast → threshold → scaling → drill; no skipping
9. **Not report-ized**: reports are only the start; not the end
10. **Not sloganeering**: every principle must have landing evidence; not vague
11. **Versioned**: strategy has versions; evolution is traceable
12. **Linked with sre**: capacity + SRE co-built
13. **Linked with finops**: capacity + FinOps co-built
14. **Linked with observability**: capacity + observability co-built
15. **Linked with cloud-architecture**: capacity + cloud architecture co-built
16. **Linked with platform-engineering**: capacity + platform co-built
17. **Linked with resilience-engineering**: capacity + resilience co-built
18. **Toolchain**: Prometheus / Grafana / k6 / Locust / CloudWatch / Datadog / HPA / KEDA / Cluster Autoscaler
19. **Publicly queryable**: strategy everyone can look up; not hidden
20. **Periodic review**: evolution updates; not one-shot
21. **First principles**: why capacity planning is needed; worst consequence of not doing it
22. **Inversion thinking**: how much can be solved by on-demand scaling; if solvable, don't introduce a heavy strategy
23. **Second-order thinking**: second-order consequences after the strategy (cost / complexity / elasticity / business)
24. **Occam**: capacity planning, the simpler the better; cut redundant steps

## Related

- sre: [../../engineer/strategies/prepare-an-sre-strategy.md](../../engineer/strategies/prepare-an-sre-strategy.md) — SRE co-built
- finops: [../../oncall-sre/incident-response/prepare-a-finops-strategy.md](../../oncall-sre/incident-response/prepare-a-finops-strategy.md) — FinOps co-built
- observability: [../../oncall-sre/incident-response/prepare-an-observability-strategy.md](../../oncall-sre/incident-response/prepare-an-observability-strategy.md) — observability co-built
- cloud-architecture: [./prepare-a-cloud-architecture-strategy.md](./prepare-a-cloud-architecture-strategy.md) — cloud architecture co-built
- platform-engineering: [../../engineer/strategies/prepare-a-platform-engineering-strategy.md](../../engineer/strategies/prepare-a-platform-engineering-strategy.md) — platform co-built
- resilience-engineering: [../../engineer/strategies/prepare-a-resilience-engineering-strategy.md](../../engineer/strategies/prepare-a-resilience-engineering-strategy.md) — resilience co-built
- zero-downtime-deployment: [../../engineer/strategies/prepare-a-zero-downtime-deployment-strategy.md](../../engineer/strategies/prepare-a-zero-downtime-deployment-strategy.md) — zero downtime co-built
- cost-optimization: [../../engineer/strategies/prepare-a-cost-optimization-strategy.md](../../engineer/strategies/prepare-a-cost-optimization-strategy.md) — cost co-built
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion](../../knowledge-curator/templates/thinking/inversion.md) + [second-order](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams](../../knowledge-curator/templates/thinking/ockhams-razor.md)
