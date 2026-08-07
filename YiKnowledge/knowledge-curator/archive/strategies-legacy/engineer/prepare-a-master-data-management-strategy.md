---
title: I want to build a master data management strategy / Prepare a master data management strategy
aliases: [i-want-to-prepare-a-master-data-management-strategy, mdm-strategy, master-data-strategy]
tags: [journey, methodology, data, governance, planning]
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
  - "descriptive verb-phrase filename, hyphens only, underscores and digits forbidden"
  - "body contains user-story header + 7 fixed-order sections"
related:
  - ./prepare-a-data-governance-framework.md
  - ../../tech-lead/roadmap/prepare-a-data-architecture-strategy.md
  - ./prepare-a-data-quality-strategy.md
  - ./prepare-a-data-lineage-strategy.md
  - ./prepare-a-data-engineering-strategy.md
  - ./prepare-an-iam-strategy.md
  - ../../executive/strategy/handle-data-compliance.md
  - ../../oncall-sre/observability/set-up-observability.md
  - ../../knowledge-curator/templates/thinking/first-principles.md
  - ../../knowledge-curator/templates/thinking/inversion.md
  - ../../knowledge-curator/templates/thinking/second-order-thinking.md
  - ../../knowledge-curator/templates/thinking/ockhams-razor.md
tacit: master data not just tables; is contract. Identify + governance + distribution + sync + quality; business-value driven; not one-shot; measurable
---

# I want to build a master data management strategy

> **As an** engineer, **I want to** prepare a master data management, **so that** launch is safe. 

## Summary

- master data = contract; not just tables
- Identify + governance + distribution + sync + quality; no missing dimension
- Business-value driven; not by gut feel
- Cover customer + product + organization + location + asset multiple domains
- Linked with governance + arch + quality + lineage + engineering + IAM + compliance + observability
- publicly queryable; not hidden
- periodic review; evolution updates
- first principles / inversion / second-order / Occam

## Scenario

master data is contract; not just tables. This entry provides MDM full path, covering identify + governance + distribution + sync + quality, business-value driven not by gut feel, covering customer + product + organization + location + asset multiple domains, linked with prepare-a-data-governance-framework + prepare-a-data-architecture-strategy + prepare-a-data-quality-strategy + prepare-a-data-lineage-strategy + prepare-a-data-engineering-strategy + prepare-an-iam-strategy + handle-data-compliance + set-up-observability, publicly queryable, periodic review, and links to prepare-a-data-governance-framework / prepare-a-data-architecture-strategy / prepare-a-data-quality-strategy / prepare-a-data-lineage-strategy / prepare-a-data-engineering-strategy / prepare-an-iam-strategy / handle-data-compliance / set-up-observability and other leaves. 

## 2-hop reachability paths

| Hop count | Target | File |
|---|---|---|
| 1 hop | Entry overview | [README.md](./) |
| 1 hop | governance | [./prepare-a-data-governance-framework.md](./prepare-a-data-governance-framework.md) |
| 2 hops | arch | [../../tech-lead/roadmap/prepare-a-data-architecture-strategy.md](../../tech-lead/roadmap/prepare-a-data-architecture-strategy.md) |
| 2 hops | quality | [./prepare-a-data-quality-strategy.md](./prepare-a-data-quality-strategy.md) |
| 2 hops | lineage | [./prepare-a-data-lineage-strategy.md](./prepare-a-data-lineage-strategy.md) |
| 2 hops | engineering | [./prepare-a-data-engineering-strategy.md](./prepare-a-data-engineering-strategy.md) |
| 2 hops | IAM | [./prepare-an-iam-strategy.md](./prepare-an-iam-strategy.md) |
| 2 hops | first-principles | [../../knowledge-curator/templates/thinking/first-principles.md](../../knowledge-curator/templates/thinking/first-principles.md) |

## Action recommendations

1. **Five dimensions**: identify + governance + distribution + sync + quality; no missing dimension
2. **business-value driven**: prioritize by business scenario + data reuse + risk; not sloganeering
3. **identify Identify**: customer + product + organization + location + asset; do not omit
4. **governance Governance**: golden record + surviving source + dedup + merge; do not omit
5. **distribution Distribution**: registry + hub + hybrid three architectures chosen by scenario; do not omit
6. **sync Sync**: CDC + event + batch + real-time; do not omit
7. **quality Quality**: completeness + accuracy + consistency + timeliness + uniqueness; do not omit
8. **not one-shot**: progressive from single domain → golden record → multi-domain → full governance; no skipping
9. **not report-ized**: reports are only the start; not the end
10. **not sloganeering**: every principle must have landing evidence; not vague
11. **versioned**: strategy has versions; evolution is traceable
12. **Linked with governance**: MDM + governance co-built
13. **Linked with arch**: MDM + architecture co-built
14. **Linked with quality**: MDM + quality co-built
15. **Linked with lineage**: MDM + lineage co-built
16. **Linked with engineering**: MDM + engineering co-built
17. **Linked with IAM**: MDM + identity co-built
18. **Linked with compliance**: MDM + compliance co-built
19. **Toolchain**: Informatica MDM / Reltio / Profisee / Stibo Systems / Apache Atlas
20. **publicly queryable**: strategy everyone can look up; not hidden
21. **periodic review**: evolution updates; not one-shot
22. **first principles**: why must MDM; worst consequence of not doing it
23. **inversion thinking**: how much can be solved with single tables + manual merge; if solvable do not introduce heavy strategy
24. **second-order thinking**: second-order consequences after strategy (cost / complexity / consistency / business) 
25. **Occam**: MDM the simpler the better; cut redundant steps

## Related

- governance: [./prepare-a-data-governance-framework.md](./prepare-a-data-governance-framework.md) — governance co-built
- arch: [../../tech-lead/roadmap/prepare-a-data-architecture-strategy.md](../../tech-lead/roadmap/prepare-a-data-architecture-strategy.md) — architecture co-built
- quality: [./prepare-a-data-quality-strategy.md](./prepare-a-data-quality-strategy.md) — quality co-built
- lineage: [./prepare-a-data-lineage-strategy.md](./prepare-a-data-lineage-strategy.md) — lineage co-built
- engineering: [./prepare-a-data-engineering-strategy.md](./prepare-a-data-engineering-strategy.md) — engineering co-built
- IAM: [./prepare-an-iam-strategy.md](./prepare-an-iam-strategy.md) — identity co-built
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion](../../knowledge-curator/templates/thinking/inversion.md) + [second-order](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams](../../knowledge-curator/templates/thinking/ockhams-razor.md)
