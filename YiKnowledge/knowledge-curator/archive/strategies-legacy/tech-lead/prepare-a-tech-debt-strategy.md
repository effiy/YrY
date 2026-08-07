---
title: I want to build a tech debt strategy / Prepare a tech debt strategy
aliases: [i-want-to-prepare-a-tech-debt-strategy, tech-debt-strategy, debt-strategy]
tags: [journey, methodology, tech-debt, governance, planning, engineering]
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
  - ./manage-tech-debt.md
  - ./plan-tech-roadmap.md
  - ../../engineer/strategies/prepare-a-quarterly-review.md
  - ../../product-manager/frameworks/prioritize-a-backlog.md
  - ../../engineer/processes/do-a-code-archaeology.md
  - ./decommission-a-service.md
  - ./deprecate-a-feature.md
  - ../../engineer/strategies/prepare-a-risk-register.md
  - ../../knowledge-curator/templates/thinking/first-principles.md
  - ../../knowledge-curator/templates/thinking/inversion.md
  - ../../knowledge-curator/templates/thinking/second-order-thinking.md
  - ../../knowledge-curator/templates/thinking/ockhams-razor.md
tacit: A tech debt strategy is not just a list; it is a contract. Identify + classify + quantify + prioritize + repay + govern; business-value driven; not one-shot; measurable
---

# I want to build a tech debt strategy

> **As a** tech lead, **I want to** prepare a tech debt, **so that** launch is safe. 

## Summary

- Tech debt = contract; not just a list
- Identify + classify + quantify + prioritize + repay + govern; no missing dimension
- Business-value driven; not by gut feel
- Three classes: intentional + not-noted + unavoidable; governed by class
- Linked with manage-tech-debt + plan-tech-roadmap + quarterly-review + prioritize-backlog + code-archaeology + decommission + deprecate + risk-register
- Publicly queryable; not hidden
- Periodic review; evolution updates
- First principles / inversion / second-order / Occam

## Scenario

Tech debt is a contract; not just a list. This entry provides the full tech-debt path, covering identification + classification + quantification + prioritization + repayment + governance, business-value driven not by gut feel, three classes (intentional + not-noted + unavoidable) governed by class, linked with manage-tech-debt + plan-tech-roadmap + quarterly-review + prioritize-backlog + code-archaeology + decommission + deprecate + risk-register, publicly queryable, periodic review, and links to manage-tech-debt / plan-tech-roadmap / prepare-a-quarterly-review / prioritize-a-backlog / do-a-code-archaeology / decommission-a-service / deprecate-a-feature / prepare-a-risk-register and other leaves.

## 2-hop reachability paths

| Hop | Goal | File |
|---|---|---|
| 1 hop | entry overview | [README.md](./) |
| 1 hop | manage debt | [./manage-tech-debt.md](./manage-tech-debt.md) |
| 2 hops | tech roadmap | [./plan-tech-roadmap.md](./plan-tech-roadmap.md) |
| 2 hops | quarterly review | [../../engineer/strategies/prepare-a-quarterly-review.md](../../engineer/strategies/prepare-a-quarterly-review.md) |
| 2 hops | backlog | [../../product-manager/frameworks/prioritize-a-backlog.md](../../product-manager/frameworks/prioritize-a-backlog.md) |
| 2 hops | code archaeology | [../../engineer/processes/do-a-code-archaeology.md](../../engineer/processes/do-a-code-archaeology.md) |
| 2 hops | decommission | [./decommission-a-service.md](./decommission-a-service.md) |
| 2 hops | deprecate | [./deprecate-a-feature.md](./deprecate-a-feature.md) |
| 2 hops | risk register | [../../engineer/strategies/prepare-a-risk-register.md](../../engineer/strategies/prepare-a-risk-register.md) |
| 2 hops | first-principles | [../../knowledge-curator/templates/thinking/first-principles.md](../../knowledge-curator/templates/thinking/first-principles.md) |

## Action recommendations

1. **Six dimensions**: identify + classify + quantify + prioritize + repay + govern; no missing dimension
2. **Business-value driven**: prioritize by business value + risk; not sloganeering
3. **Identify**: code scanning + dependency audit + architecture review + oncall feedback + retrospective; do not omit
4. **Classify**: three classes — intentional + not-noted + unavoidable; do not conflate
5. **Quantify**: interest + impact scope + fix cost + risk level; not vague
6. **Prioritize**: RICE / risk × impact / cost-of-delay; not by gut feel
7. **Repay**: 20% capacity reserve + quarterly theme + co-build with new features; not one-shot
8. **Governance**: registry + owner + state + periodic review; do not omit
9. **Not one-shot**: progressive from identify → classify → quantify → prioritize → repay → govern; no skipping
10. **Not report-ized**: the list is only the start; not the end
11. **Not sloganeering**: each debt must tag owner + quantification + repayment plan; not vague
12. **Versioned**: strategy has versions; evolution is traceable
13. **Link with manage debt**: strategy + execution co-built
14. **Link with tech roadmap**: strategy + roadmap co-built
15. **Link with quarterly review**: strategy + quarterly co-built
16. **Link with backlog**: strategy + prioritization co-built
17. **Link with code archaeology**: strategy + archaeology co-built
18. **Link with decommission**: strategy + retirement co-built
19. **Link with deprecate**: strategy + deprecation co-built
20. **Link with risk register**: strategy + risk co-built
21. **Tooling**: SonarQube / Code Climate / dependency-track / self-built
22. **Publicly queryable**: anyone can query the debt list; not hidden
23. **Periodic review**: evolution updates; not one-shot
24. **First principles**: why a tech-debt strategy is necessary; worst consequence of not doing it
25. **Inversion thinking**: use a list + documentation to see how much can be solved; if solvable, do not introduce a strategy
26. **Second-order thinking**: second-order consequences after the strategy (business / cost / organization / innovation)
27. **Occam**: the simpler the strategy the better; cut redundant steps

## Related

- manage debt: [./manage-tech-debt.md](./manage-tech-debt.md) — execution co-build
- tech roadmap: [./plan-tech-roadmap.md](./plan-tech-roadmap.md) — roadmap co-build
- quarterly review: [../../engineer/strategies/prepare-a-quarterly-review.md](../../engineer/strategies/prepare-a-quarterly-review.md) — quarterly co-build
- backlog: [../../product-manager/frameworks/prioritize-a-backlog.md](../../product-manager/frameworks/prioritize-a-backlog.md) — prioritization co-build
- code archaeology: [../../engineer/processes/do-a-code-archaeology.md](../../engineer/processes/do-a-code-archaeology.md) — archaeology co-build
- decommission: [./decommission-a-service.md](./decommission-a-service.md) — retirement co-build
- deprecate: [./deprecate-a-feature.md](./deprecate-a-feature.md) — deprecation co-build
- risk register: [../../engineer/strategies/prepare-a-risk-register.md](../../engineer/strategies/prepare-a-risk-register.md) — risk co-build
- thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion](../../knowledge-curator/templates/thinking/inversion.md) + [second-order](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams](../../knowledge-curator/templates/thinking/ockhams-razor.md)
