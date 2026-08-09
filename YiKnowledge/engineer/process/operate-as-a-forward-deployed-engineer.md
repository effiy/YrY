---
title: Operate as a forward deployed engineer
aliases: [i-want-to-operate-as-a-forward-deployed-engineer, fde-role, forward-deployed-engineer, the-delta]
tags: [journey, methodology, fde, forward-deployment, consulting, role, delta]
category: engineer/process
created: 2026-08-05
updated: 2026-08-05
last_verified: 2026-08-07
source: internal
type: summary
lifecycle: active
status: stable
review_cycle: quarterly
roles: [engineer]
benefit: "FDEs bridge engineering and customer environments, delivering solutions that work in real-world constraints"
acceptance_criteria:
  - "user story header defines who, what, and why"
  - "step-by-step guide is complete with prerequisites and expected outcome"
  - cross-references to related journeys and patterns are present
related:
  - ../infrastructure/write-a-statement-of-work.md
  - ./deploy-to-an-air-gapped-environment.md
  - ../../knowledge-curator/templates/thinking--first-principles.md
  - ../../knowledge-curator/templates/thinking--inversion.md
  - ../../knowledge-curator/templates/thinking--second-order-thinking.md
  - ../../knowledge-curator/templates/thinking--ockhams-razor.md
tacit: FDE does not write feature code; writes glue code. The Delta = the gap between product capability and the customer's mission; the goal is to make yourself redundant at the customer site; 50% integration + 50% strategy; not an SWE
---

# I want to operate as a forward deployed engineer

> **As an** engineer, **I want to** operate as a forward deployed engineer, **so that** launch is safe. 

## Summary

- FDE = technical special forces; between SWE / AI architect / strategy consultant
- The Delta = the gap between product out-of-the-box capability and the customer's mission; FDE writes glue code
- 50% integration / glue + 50% strategy; not 90% features
- User = high-risk stakeholder (CTO / general / CEO) ; not anonymous user
- Environment = hostile / legacy / air-gapped / hybrid; not controlled cloud
- Goal = speed to value + solve the problem; not scale stability
- Embedded: has customer credentials, joins customer Slack, submits directly to customer production environment
- Productized Consulting: solves customer-unique problems with code, ultimately abstracts back into the core product
- 80/20 value scoping: identify the 20% of features that solve 80% of pain points; avoid gold-plating
- Last-Mile Integration: stitches modern SaaS / AI into legacy messy reality
- Publicly queryable; periodic review
- First principles / inversion / second-order / Occam

## Scenario

FDE does not write feature code; writes glue code. This entry provides the FDE role full path, covering persona + Delta + embedded engineering + productized consulting + SWE vs FDE comparison + 80/20 value scoping + last-mile integration, linking with apply-consulting-frameworks + design-a-minimum-viable-architecture + run-a-site-survey + write-a-statement-of-work + plan-day-two-operations + deploy-to-an-air-gapped-environment + prepare-a-discovery-call-strategy, publicly queryable, periodic review, and links to consulting-frameworks / mva / site-survey / sow / day-two / air-gap / discovery-call and other leaves. 

## 2-hop reachability paths

| Hop | Goal | File |
|---|---|---|
| 1 hop | Entry overview | [README.md](./) |
| 1 hop | consulting-frameworks | [./apply-consulting-frameworks.md](../process/apply-consulting-frameworks.md) |
| 1 hop | mva | [./design-a-minimum-viable-architecture.md](../architecture-design/design-a-minimum-viable-architecture.md) |
| 2 hops | site-survey | [../processes/run-a-site-survey.md](../engineering/run-a-site-survey.md) |
| 2 hops | sow | [../processes/write-a-statement-of-work.md](../infrastructure/write-a-statement-of-work.md) |
| 2 hops | first-principles | [../../knowledge-curator/templates/thinking--first-principles.md](../../knowledge-curator/templates/thinking--first-principles.md) |

## Action recommendations

1. **Persona anchoring**: Technical special forces; not an SWE nor a pure consultant
2. **Delta identification**: Out-of-the-box capability vs customer mission gap; FDE writes the gap code
3. **Embedded**: Has customer credentials, joins customer Slack, directly submits to customer production; not "remote advice"
4. **Productized Consulting**: Solves customer-unique problems with code; ultimately abstracts back into the core product
5. **SWE vs FDE comparison**: User (millions of anonymous vs high-risk stakeholder) + environment (controlled cloud vs hostile legacy) + goal (scale stability vs speed to value) + code ratio (90% features vs 50/50 integration strategy) 
6. **80/20 value scoping**: 20% of features solve 80% of pain points; no gold-plating
7. **Last-Mile Integration**: Stitches SaaS / AI into legacy; does not rewrite the customer
8. **Goal = self redundancy**: System runs itself; FDE exits
9. **Not shipping for shipping's sake**: Each integration connects to a business measurement
10. **Not sloganeering**: Every principle must have landing evidence
11. **Versioned**: FDE implementation log has versions; evolution is traceable
12. **Link with consulting-frameworks**: FDE + Pyramid Principle / MECE / Trusted Advisor co-build
13. **Link with mva**: FDE + minimum viable architecture co-build
14. **Link with site-survey**: FDE + on-site discovery report co-build
15. **Link with sow**: FDE + statement of work co-build
16. **Link with day-two**: FDE + Day 2 operations co-build
17. **Link with air-gap**: FDE + offline deployment co-build
18. **Toolchain**: Python / Go / SQL / dbt / DuckDB / Terraform / Helm / Prometheus / Grafana / Loki
19. **Publicly queryable**: Role everyone can look up; not hidden
20. **Periodic review**: Evolution updates; not one-shot
21. **First principles**: Why must FDE; worst consequence of not doing it (product cannot ship into customer) 
22. **Inversion thinking**: How much can be solved by standard SRE / TSE; if solvable do not introduce FDE
23. **Second-order thinking**: Second-order consequences after FDE (customer renewal / product feedback / team reputation) 
24. **Occam**: The smaller the Delta the better; cut redundant integration

## Related

- consulting-frameworks: [./apply-consulting-frameworks.md](../process/apply-consulting-frameworks.md) — Consulting thinking co-build
- mva: [./design-a-minimum-viable-architecture.md](../architecture-design/design-a-minimum-viable-architecture.md) — Minimum viable architecture co-build
- site-survey: [../processes/run-a-site-survey.md](../engineering/run-a-site-survey.md) — On-site discovery co-build
- sow: [../processes/write-a-statement-of-work.md](../infrastructure/write-a-statement-of-work.md) — Statement of work co-build
- day-two: [../processes/plan-day-two-operations.md](../engineering/plan-day-two-operations.md) — Day 2 operations co-build
- air-gap: [./deploy-to-an-air-gapped-environment.md](./deploy-to-an-air-gapped-environment.md) — Offline deployment co-build
- discovery-call: [./prepare-a-discovery-call-strategy.md](../../knowledge-curator/archive/strategies-legacy/engineer/prepare-a-discovery-call-strategy.md) — Discovery call co-build
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking--first-principles.md) + [inversion](../../knowledge-curator/templates/thinking--inversion.md) + [second-order](../../knowledge-curator/templates/thinking--second-order-thinking.md) + [ockhams](../../knowledge-curator/templates/thinking--ockhams-razor.md)
