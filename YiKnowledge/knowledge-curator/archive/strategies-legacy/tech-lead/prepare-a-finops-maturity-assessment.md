---
title: I want to do a FinOps maturity assessment / Prepare a FinOps maturity assessment
aliases: [i-want-to-prepare-a-finops-maturity-assessment, finops-maturity, finops-assessment, cloud-finops-maturity]
tags: [journey, methodology, finops, cloud-cost, governance, planning, maturity]
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
  - ../../oncall-sre/incident-response/run-a-finops-review.md
  - ../../engineer/strategies/prepare-a-cost-allocation.md
  - ../../engineer/tools/reduce-cost.md
  - ../../oncall-sre/incident-response/handle-a-cost-overrun.md
  - ./do-a-capacity-plan.md
  - ../../engineer/strategies/prepare-a-budget.md
  - ../../knowledge-curator/templates/thinking/first-principles.md
  - ../../knowledge-curator/templates/thinking/inversion.md
  - ../../knowledge-curator/templates/thinking/second-order-thinking.md
  - ../../knowledge-curator/templates/thinking/ockhams-razor.md
tacit: FinOps maturity is not just cost reports; it is a contract. Crawl + Walk + Run + Fly; driven by maturity levels; not one-shot; measurable
status: deprecated
---

# I want to do a FinOps maturity assessment

> **As a** tech lead, **I want to** prepare a finops maturity assessment, **so that** launch is safe. 

## Summary

- FinOps maturity = contract; not just cost reports
- Crawl + Walk + Run + Fly; no missing dimension
- Driven by maturity levels; not one-shot
- Cover visibility + optimization + budget + governance + culture
- Linked with FinOps review + cost allocation + reduce cost + cost overrun + capacity + budget
- Publicly queryable; not hidden
- Periodic review; evolution updates
- First principles / inversion / second-order / Occam

## Scenario

FinOps maturity is a contract; not just cost reports. This entry provides the full path for maturity assessment, covering Crawl + Walk + Run + Fly, driven by maturity levels not one-shot, covering visibility + optimization + budget + governance + culture, linked with FinOps review + cost allocation + reduce cost + cost overrun + capacity + budget, publicly queryable, periodic review, and links to run-a-finops-review / prepare-a-cost-allocation / reduce-cost / handle-a-cost-overrun / do-a-capacity-plan / prepare-a-budget and other leaves. 

## 2-hop reachability paths

| Hops | Goal | file |
|---|---|---|
| 1 hop | Entry overview | [README.md](./) |
| 1 hop | FinOps review | [../../oncall-sre/incident-response/run-a-finops-review.md](../../oncall-sre/incident-response/run-a-finops-review.md) |
| 2 hops | cost allocation | [../../engineer/strategies/prepare-a-cost-allocation.md](../../engineer/strategies/prepare-a-cost-allocation.md) |
| 2 hops | reduce cost | [../../engineer/tools/reduce-cost.md](../../engineer/tools/reduce-cost.md) |
| 2 hops | cost overrun | [../../oncall-sre/incident-response/handle-a-cost-overrun.md](../../oncall-sre/incident-response/handle-a-cost-overrun.md) |
| 2 hops | capacity | [./do-a-capacity-plan.md](./do-a-capacity-plan.md) |
| 2 hops | budget | [../../engineer/strategies/prepare-a-budget.md](../../engineer/strategies/prepare-a-budget.md) |
| 2 hops | first-principles | [../../knowledge-curator/templates/thinking/first-principles.md](../../knowledge-curator/templates/thinking/first-principles.md) |
| 2 hops | inversion | [../../knowledge-curator/templates/thinking/inversion.md](../../knowledge-curator/templates/thinking/inversion.md) |
| 2 hops | second-order | [../../knowledge-curator/templates/thinking/second-order-thinking.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) |
| 2 hops | ockhams | [../../knowledge-curator/templates/thinking/ockhams-razor.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) |

## Action recommendations

1. **Four maturity levels**: Crawl + Walk + Run + Fly; no missing dimension
2. **Five capabilities**: visibility + optimization + budget + governance + culture; no missing dimension
3. **Crawl**: cost visible + monthly reports; not blind
4. **Walk**: cost attribution + department allocation + exception alerts; do not omit
5. **Run**: forecast + optimization + budget gating + trend analysis; do not omit
6. **Fly**: automation + intelligent scheduling + business value linkage; do not omit
7. **Visibility**: real-time dashboard + multi-dimension slicing + exception alerts; do not omit
8. **Optimization**: resource / instance / region / commitment optimization; do not omit
9. **Budget**: annual / quarterly / monthly + department / project + gating; do not omit
10. **Governance**: tag strategy + policy + approval + reimbursement; do not omit
11. **Culture**: cost awareness + responsible owner + cross-team collaboration; do not omit
12. **Not one-shot**: maturity improves progressively; no skipping
13. **Not report-ized**: reports are only the start; not the end
14. **Not by gut feel**: maturity rubric quantified; not vague
15. **Link with FinOps review**: assessment + review co-build
16. **Link with cost allocation**: assessment + allocation co-build
17. **Link with reduce cost**: assessment + optimization co-build
18. **Link with cost overrun**: assessment + emergency response co-build
19. **Link with capacity**: assessment + capacity co-build
20. **Link with budget**: assessment + budget co-build
21. **Toolchain**: FinOps platform + CloudHealth / Apptio / CAST AI + in-house
22. **Publicly queryable**: maturity assessment stakeholders can query; not hidden
23. **Periodic review**: evolution updates; not one-shot
24. **First principles**: why must maturity assessment; worst consequence of not doing
25. **Inversion thinking**: how much can be solved with reports + documentation; if solvable, don't introduce assessment
26. **Second-order thinking**: second-order consequences after assessment (governance / optimization / cost / organization) 
27. **Occam**: assessment the simpler the better; cut redundant steps

## Related

- FinOps review: [../../oncall-sre/incident-response/run-a-finops-review.md](../../oncall-sre/incident-response/run-a-finops-review.md) — review co-build
- cost allocation: [../../engineer/strategies/prepare-a-cost-allocation.md](../../engineer/strategies/prepare-a-cost-allocation.md) — allocation co-build
- reduce cost: [../../engineer/tools/reduce-cost.md](../../engineer/tools/reduce-cost.md) — optimization co-build
- cost overrun: [../../oncall-sre/incident-response/handle-a-cost-overrun.md](../../oncall-sre/incident-response/handle-a-cost-overrun.md) — emergency response co-build
- capacity: [./do-a-capacity-plan.md](./do-a-capacity-plan.md) — capacity co-build
- budget: [../../engineer/strategies/prepare-a-budget.md](../../engineer/strategies/prepare-a-budget.md) — budget co-build
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion](../../knowledge-curator/templates/thinking/inversion.md) + [second-order](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams](../../knowledge-curator/templates/thinking/ockhams-razor.md)
