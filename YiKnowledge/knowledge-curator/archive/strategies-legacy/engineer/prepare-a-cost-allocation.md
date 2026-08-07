---
title: I want to prepare a cost allocation / Prepare a cost allocation
aliases: [i-want-to-prepare-a-cost-allocation, cost-allocation, showback, chargeback, finops]
tags: [journey, methodology, cost-allocation, finops, showback, chargeback, capacity-planning]
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
  - "Filename is descriptive verb-phrase, hyphens only, no underscores or digits"
  - "body contains user-story header + 7 fixed-order sections"
related:
  - ./prepare-a-budget.md
  - ../../oncall-sre/incident-response/handle-a-cost-overrun.md
  - ../../tech-lead/roadmap/do-a-capacity-plan.md
  - ../tools/reduce-cost.md
  - ./handle-multi-tenancy.md
  - ../../tech-lead/roadmap/plan-tech-roadmap.md
  - ../../knowledge-curator/templates/thinking/first-principles.md
  - ../../knowledge-curator/templates/thinking/inversion.md
  - ../../knowledge-curator/templates/thinking/second-order-thinking.md
  - ../../knowledge-curator/templates/thinking/ockhams-razor.md
tacit: Cost allocation is not billing; it is accountability + transparency + optimization. Split by tenant / service / team; showback before chargeback; shared costs must have allocation rules; tag SSOT; periodic review
---

# I want to prepare a cost allocation

> **As an** engineer, **I want to** prepare a cost allocation, **so that** launch is safe. 

## Summary

- Cost allocation = accountability + transparency + optimization; not billing
- Allocation dimensions: tenant / service / team / environment
- showback before chargeback; transparency first, then billing
- Shared costs must have allocation rules; not vague
- Tag SSOT: each resource must tag owner / team / env / cost-center
- Direct costs allocated directly; indirect costs by rules
- No shared burden: shared burden means no accountability
- Periodic review; not one-shot
- Links with budget + capacity planning
- FinOps three steps: inform → allocate → optimize
- LLM-specific: token cost / model cost / inference cost
- First principles / inversion / second-order / Occam

## Scenario

Cost allocation is the core of FinOps; not simple billing. This entry provides the full cost allocation path, covering accountability + transparency + optimization, allocation dimensions, showback before chargeback, shared cost allocation rules, tag SSOT, direct vs indirect, no shared burden, periodic review, links with budget + capacity planning, FinOps three steps, LLM-specific, and links to prepare-a-budget / handle-a-cost-overrun / do-a-capacity-plan / reduce-cost / handle-multi-tenancy / plan-tech-roadmap and other leaves. 

## 2-hop reachability paths

| Hop count | Target | File |
|---|---|---|
| 1 hop | Entry overview | [README.md](./) |
| 1 hop | budget | [./prepare-a-budget.md](./prepare-a-budget.md) |
| 2 hops | cost overrun | [../../oncall-sre/incident-response/handle-a-cost-overrun.md](../../oncall-sre/incident-response/handle-a-cost-overrun.md) |
| 2 hops | capacity planning | [../../tech-lead/roadmap/do-a-capacity-plan.md](../../tech-lead/roadmap/do-a-capacity-plan.md) |
| 2 hops | cost reduction | [../tools/reduce-cost.md](../tools/reduce-cost.md) |
| 2 hops | multi-tenancy | [./handle-multi-tenancy.md](./handle-multi-tenancy.md) |
| 2 hops | roadmap | [../../tech-lead/roadmap/plan-tech-roadmap.md](../../tech-lead/roadmap/plan-tech-roadmap.md) |
| 2 hops | first-principles | [../../knowledge-curator/templates/thinking/first-principles.md](../../knowledge-curator/templates/thinking/first-principles.md) |
| 2 hops | inversion | [../../knowledge-curator/templates/thinking/inversion.md](../../knowledge-curator/templates/thinking/inversion.md) |
| 2 hops | second-order | [../../knowledge-curator/templates/thinking/second-order-thinking.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) |
| 2 hops | ockhams | [../../knowledge-curator/templates/thinking/ockhams-razor.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) |

## Action recommendations

1. **Accountability + transparency + optimization**: the three essentials of cost allocation; not just billing
2. **Allocation dimensions**: tenant / service / team / environment; not vague
3. **showback before chargeback**: transparency first, then billing; don't chargeback directly
4. **Shared cost allocation rules**: by usage / by headcount / by ratio; must be explicit
5. **Tag SSOT**: each resource must tag owner / team / env / cost-center; do not omit tags
6. **Direct costs allocated directly**: single-tenant exclusive resources allocated directly; not shared
7. **Indirect costs by rules**: shared resources allocated by rules; not vague
8. **No shared burden**: shared burden means no accountability; must tag owner
9. **Periodic review**: monthly / quarterly review; not one-shot
10. **Link with budget**: allocation vs budget comparison; over-budget alerts
11. **Link with capacity planning**: allocation drives capacity planning; not isolated
12. **FinOps three steps**: inform → allocate → optimize; no skipping
13. **LLM-specific**: token cost / model cost / inference cost / embedding cost / vector DB cost
14. **Multi-tenant allocation**: by tenant_id SSOT; by usage; not split evenly
15. **Shared service allocation**: DB / cache / monitoring / network by usage; not even
16. **Environment allocation**: prod fully charged / staging by ratio / dev absorbed internally
17. **First principles**: why cost allocation is necessary; worst consequence of not doing it
18. **Inversion thinking**: how much can a unified bill solve; if solvable, don't introduce allocation
19. **Second-order thinking**: second-order consequences after allocation (accountability / optimization / hiring / roadmap) 
20. **Occam**: allocation rules the simpler the better; cut redundant dimensions

## Related

- budget: [./prepare-a-budget.md](./prepare-a-budget.md) — allocation vs budget comparison
- cost overrun: [../../oncall-sre/incident-response/handle-a-cost-overrun.md](../../oncall-sre/incident-response/handle-a-cost-overrun.md) — over-budget alerts
- capacity planning: [../../tech-lead/roadmap/do-a-capacity-plan.md](../../tech-lead/roadmap/do-a-capacity-plan.md) — allocation drives capacity
- cost reduction: [../tools/reduce-cost.md](../tools/reduce-cost.md) — allocation drives optimization
- multi-tenancy: [./handle-multi-tenancy.md](./handle-multi-tenancy.md) — tenant_id allocation SSOT
- roadmap: [../../tech-lead/roadmap/plan-tech-roadmap.md](../../tech-lead/roadmap/plan-tech-roadmap.md) — cost drives roadmap
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion](../../knowledge-curator/templates/thinking/inversion.md) + [second-order](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams](../../knowledge-curator/templates/thinking/ockhams-razor.md)
