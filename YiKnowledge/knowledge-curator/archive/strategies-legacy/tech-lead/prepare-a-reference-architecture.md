---
title: I want to build a reference architecture / Prepare a reference architecture
aliases: [i-want-to-prepare-a-reference-architecture, reference-architecture, ra-doc]
tags: [journey, methodology, architecture, governance, strategy, planning]
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
  - ../../executive/strategy/prepare-a-technical-vision.md
  - ../architecture/design-architecture-decision.md
  - ../../engineer/strategies/prepare-an-rfc.md
  - ./prepare-an-architecture-review.md
  - ./do-a-tech-selection.md
  - ../../engineer/engineering/bootstrap-a-new-project.md
  - ../../knowledge-curator/templates/thinking/first-principles.md
  - ../../knowledge-curator/templates/thinking/inversion.md
  - ../../knowledge-curator/templates/thinking/second-order-thinking.md
  - ../../knowledge-curator/templates/thinking/ockhams-razor.md
tacit: reference architecture is not just diagrams; it is a contract. principles + components + relationships + patterns + standards; anchored on business capability; not sloganeering; landing-able
---

# I want to build a reference architecture

> **As a** tech lead, **I want to** prepare a reference architecture, **so that** launch is safe.

## Summary

- reference architecture = contract; not just diagrams
- principles + components + relationships + patterns + standards; no missing dimension
- anchored on business capability; not sloganeering
- landing reference-able; not paper talk
- link with technical vision + ADR + RFC + architecture review
- link with tech selection + bootstrap
- publicly queryable; not hidden
- periodic review; evolution updates
- first principles / inversion / second-order / Occam

## Scenario

reference architecture is a contract; not just diagrams. this entry provides reference architecture full path, covering principles + components + relationships + patterns + standards, anchored on business capability not sloganeering, landing reference-able, linking with technical vision + ADR + RFC + architecture review, linking with tech selection + bootstrap, publicly queryable, periodic review, and links to prepare-a-technical-vision / design-architecture-decision / prepare-an-rfc / prepare-an-architecture-review / do-a-tech-selection / bootstrap-a-new-project and other leaves.

## 2-hop reachability paths

| Hop count | goal | file |
|---|---|---|
| 1 hop | entry overview | [README.md](./) |
| 1 hop | technical vision | [../../executive/strategy/prepare-a-technical-vision.md](../../executive/strategy/prepare-a-technical-vision.md) |
| 2 hops | ADR | [../architecture/design-architecture-decision.md](../architecture/design-architecture-decision.md) |
| 2 hops | RFC | [../../engineer/strategies/prepare-an-rfc.md](../../engineer/strategies/prepare-an-rfc.md) |
| 2 hops | architecture review | [./prepare-an-architecture-review.md](./prepare-an-architecture-review.md) |
| 2 hops | tech selection | [./do-a-tech-selection.md](./do-a-tech-selection.md) |
| 2 hops | bootstrap | [../../engineer/engineering/bootstrap-a-new-project.md](../../engineer/engineering/bootstrap-a-new-project.md) |
| 2 hops | first-principles | [../../knowledge-curator/templates/thinking/first-principles.md](../../knowledge-curator/templates/thinking/first-principles.md) |
| 2 hops | inversion | [../../knowledge-curator/templates/thinking/inversion.md](../../knowledge-curator/templates/thinking/inversion.md) |
| 2 hops | second-order | [../../knowledge-curator/templates/thinking/second-order-thinking.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) |
| 2 hops | ockhams | [../../knowledge-curator/templates/thinking/ockhams-razor.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) |

## Action recommendations

1. **Five dimensions**: principles + components + relationships + patterns + standards; no missing dimension
2. **Business capability anchor**: map to business capability; not sloganeering
3. **Principles**: executable principles; not slogans
4. **components**: standard components + responsibilities + boundaries; do not omit
5. **relationships**: contracts between components + data flow + control flow; do not omit
6. **patterns**: reuse engineering-patterns; do not reinvent
7. **standards**: API / data / security / observability standards; do not omit
8. **landing reference-able**: reference implementation + project cases; not paper talk
9. **multiple views**: C4 context / container / component / code; not single
10. **not sloganeering**: every principle must have landing evidence; not vague
11. **not locked-down**: reference not mandatory; allow project tailoring
12. **versioned**: architecture has versions; evolution is traceable
13. **link with technical vision**: vision + reference co-build
14. **link with ADR**: reference + ADR co-build
15. **link with RFC**: reference + RFC co-build
16. **link with architecture review**: reference goes through review
17. **link with tech selection**: reference + selection co-build
18. **link with bootstrap**: reference + bootstrap co-build
19. **toolchain**: C4-model + Structurizr + ArchiMate + draw.io
20. **publicly queryable**: reference architecture everyone can query; not hidden
21. **periodic review**: evolution updates; not one-shot
22. **first principles**: why must reference architecture; worst consequence of not doing
23. **inversion thinking**: how much can ADR + documentation solve; if solvable don't introduce reference
24. **second-order thinking**: second-order consequences after reference (consistency / reuse / governance / extension)
25. **Occam**: reference the simpler the better; cut redundant steps

## Related

- technical vision: [../../executive/strategy/prepare-a-technical-vision.md](../../executive/strategy/prepare-a-technical-vision.md) — vision co-build
- ADR: [../architecture/design-architecture-decision.md](../architecture/design-architecture-decision.md) — decision co-build
- RFC: [../../engineer/strategies/prepare-an-rfc.md](../../engineer/strategies/prepare-an-rfc.md) — proposal co-build
- architecture review: [./prepare-an-architecture-review.md](./prepare-an-architecture-review.md) — review co-build
- tech selection: [./do-a-tech-selection.md](./do-a-tech-selection.md) — selection co-build
- bootstrap: [../../engineer/engineering/bootstrap-a-new-project.md](../../engineer/engineering/bootstrap-a-new-project.md) — bootstrap co-build
- thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion](../../knowledge-curator/templates/thinking/inversion.md) + [second-order](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams](../../knowledge-curator/templates/thinking/ockhams-razor.md)
