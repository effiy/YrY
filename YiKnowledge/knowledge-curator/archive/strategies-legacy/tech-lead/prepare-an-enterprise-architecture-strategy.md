---
title: I want to build an enterprise architecture strategy / Prepare an enterprise-architecture strategy
aliases: [i-want-to-prepare-an-enterprise-architecture-strategy, enterprise-architecture-strategy]
tags: [journey, methodology, enterprise-architecture, strategy]
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
  - ./prepare-a-solution-architecture-strategy.md
  - ../../engineer/strategies/prepare-an-it-strategy.md
  - ../../engineer/strategies/prepare-an-application-portfolio-strategy.md
  - ../../engineer/strategies/prepare-a-technology-strategy.md
  - ../../engineer/strategies/prepare-a-data-strategy.md
  - ../../knowledge-curator/templates/thinking/first-principles.md
  - ../../knowledge-curator/templates/thinking/inversion.md
  - ../../knowledge-curator/templates/thinking/second-order-thinking.md
  - ../../knowledge-curator/templates/thinking/ockhams-razor.md
tacit: "Enterprise architecture is not just drawing; it is a contract. Five dimensions: business + data + application + technology + governance + measurement; business-value driven; not one-shot; measurable"
status: deprecated
---

# I want to build an enterprise architecture strategy

> **As a** tech lead, **I want to** prepare an enterprise architecture, **so that** launch is safe.

## Summary

- Enterprise architecture = contract; not just drawing
- Five dimensions: business + data + application + technology + governance + measurement; no missing dimension
- Business-value driven; not by gut feel
- Covers current / goal / gap / roadmap multiple types
- Links with solution-architecture + it-strategy + application-portfolio + technology + data-strategy
- publicly queryable; not hidden
- periodic review; evolution updates
- first principles / inversion / second-order / Occam

## Scenario

Enterprise architecture is a contract; not just drawing. This entry provides the enterprise architecture full path, covering business + data + application + technology + governance + measurement, business-value driven not by gut feel, covering current / goal / gap / roadmap multiple types, linking with prepare-a-solution-architecture + prepare-an-it + prepare-an-application-portfolio + prepare-a-technology + prepare-a-data, publicly queryable, periodic review, and links to EnterpriseArchitecture / SolutionArchitecture / ITStrategy / ApplicationPortfolio / Technology / DataStrategy and other leaves.

## 2-hop reachability paths

| Hop count | goal | file |
|---|---|---|
| 1 hop | Entry overview | [README.md](./) |
| 1 hop | solution-architecture | [./prepare-a-solution-architecture-strategy.md](./prepare-a-solution-architecture-strategy.md) |
| 1 hop | it-strategy | [../../engineer/strategies/prepare-an-it-strategy.md](../../engineer/strategies/prepare-an-it-strategy.md) |
| 2 hops | application-portfolio | [../../engineer/strategies/prepare-an-application-portfolio-strategy.md](../../engineer/strategies/prepare-an-application-portfolio-strategy.md) |
| 2 hops | technology | [../../engineer/strategies/prepare-a-technology-strategy.md](../../engineer/strategies/prepare-a-technology-strategy.md) |
| 2 hops | first-principles | [../../knowledge-curator/templates/thinking/first-principles.md](../../knowledge-curator/templates/thinking/first-principles.md) |

## Action recommendations

1. **Five dimensions**: business + data + application + technology + governance + measurement; no missing dimension
2. **business-value driven**: prioritize by efficiency + trust + speed + risk + cost; not sloganeering
3. **Business architecture**: capability / process / organisation / service; do not omit
4. **Data architecture**: domain / model / governance / flow; do not omit
5. **Application architecture**: portfolio / integration / service / evolution; do not omit
6. **Governance**: owner / cadence / review / documentation / drift; do not omit
7. **Measurement**: coverage + adoption + cost + risk + satisfaction; do not omit
8. **not one-shot**: progressive from business -> data -> application -> technology -> governance -> measurement; no skipping
9. **not report-ized**: drawing is only the start; not the end
10. **not sloganeering**: every principle must have landing evidence; not vague
11. **versioned**: strategy has versions; evolution is traceable
12. **Link with solution-architecture**: enterprise + solution co-built
13. **Link with it-strategy**: architecture + IT co-built
14. **Link with application-portfolio**: architecture + application portfolio co-built
15. **Link with technology**: architecture + technology co-built
16. **Link with data-strategy**: architecture + data co-built
17. **Toolchain**: TOGAF / ArchiMate / Sparx EA / Avolution ADOit / Planview LeanIX
18. **publicly queryable**: strategy everyone can look up; not hidden
19. **periodic review**: evolution updates; not one-shot
20. **first principles**: why must enterprise architecture strategy; worst consequence of not doing it
21. **inversion thinking**: rely on default how much can be solved; if solvable, do not introduce heavy strategy
22. **second-order thinking**: second-order consequences after strategy (efficiency / trust / speed / risk)
23. **Occam**: enterprise architecture the simpler the better; cut redundant layers

## Related

- solution-architecture: [./prepare-a-solution-architecture-strategy.md](./prepare-a-solution-architecture-strategy.md) — SolutionArchitecture co-built
- it-strategy: [../../engineer/strategies/prepare-an-it-strategy.md](../../engineer/strategies/prepare-an-it-strategy.md) — ITStrategy co-built
- application-portfolio: [../../engineer/strategies/prepare-an-application-portfolio-strategy.md](../../engineer/strategies/prepare-an-application-portfolio-strategy.md) — ApplicationPortfolio co-built
- technology: [../../engineer/strategies/prepare-a-technology-strategy.md](../../engineer/strategies/prepare-a-technology-strategy.md) — Technology co-built
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion](../../knowledge-curator/templates/thinking/inversion.md) + [second-order](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams](../../knowledge-curator/templates/thinking/ockhams-razor.md)
