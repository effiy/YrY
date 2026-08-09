---
title: I want to build an IT service catalog strategy / Prepare an it-service-catalog strategy
aliases: [i-want-to-prepare-an-it-service-catalog-strategy, it-service-catalog-strategy]
tags: [journey, methodology, it, service-catalog, planning]
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
  - "filename is descriptive verb-phrase, hyphens only, no underscores or digits"
  - "body contains user-story header + 7 fixed-order sections"
related:
  - ./prepare-an-itil-strategy.md
  - ./prepare-an-it-service-management-strategy.md
  - ../../executive/strategy/prepare-a-cmdb-strategy.md
  - ./prepare-an-it-asset-management-strategy.md
  - ../../oncall-sre/incident-response/prepare-an-incident-management-strategy.md
  - ../../knowledge-curator/templates/thinking/first-principles.md
  - ../../knowledge-curator/templates/thinking/inversion.md
  - ../../knowledge-curator/templates/thinking/second-order-thinking.md
  - ../../knowledge-curator/templates/thinking/ockhams-razor.md
tacit: An IT service catalog is not just a list; it is a contract. service + request + approval + governance + measurement as five dimensions; business-value driven; not one-shot; measurable
status: deprecated
---

# I want to build an IT service catalog strategy

> **As an** engineer, **I want to** prepare an it service catalog, **so that** launch is safe. 

## Summary

- IT service catalog = contract; not just a list
- service + request + approval + governance + measurement as five dimensions; no missing dimension
- Business-value driven; not by gut feel
- Covers business / technology / self-service / standard / custom multiple types
- Links with itil + it-service-management + cmdb + it-asset-management + incident-management
- Publicly discoverable; not hidden
- Regular review; evolve and update
- First principles / inversion / second-order / Occam's razor

## Scenario description

An IT service catalog is a contract; not just a list. This entry gives the full path for an IT service catalog, covering service + request + approval + governance + measurement, business-value driven (not by gut feel), covering business / technology / self-service / standard / custom multiple types, and linking with prepare-an-itil + prepare-an-it-service-management + prepare-a-cmdb + prepare-an-it-asset-management + prepare-an-incident-management, publicly discoverable, regular review, and linking to ITServiceCatalog / ITIL / ITServiceManagement / CMDB / ITAssetManagement / IncidentManagement and other leaves.

## 2-hop reachability path

| Hop | Target | file |
|---|---|---|
| 1 hop | Entry overview | [README.md](./) |
| 1 hop | itil | [./prepare-an-itil-strategy.md](./prepare-an-itil-strategy.md) |
| 1 hop | it-service-management | [./prepare-an-it-service-management-strategy.md](./prepare-an-it-service-management-strategy.md) |
| 2 hops | cmdb | [../../executive/strategy/prepare-a-cmdb-strategy.md](../../executive/strategy/prepare-a-cmdb-strategy.md) |
| 2 hops | it-asset-management | [./prepare-an-it-asset-management-strategy.md](./prepare-an-it-asset-management-strategy.md) |
| 2 hops | first-principles | [../../knowledge-curator/templates/thinking/first-principles.md](../../knowledge-curator/templates/thinking/first-principles.md) |

## Action recommendations

1. **Five dimensions**: service + request + approval + governance + measurement; no missing dimension
2. **Business-value driven**: prioritize by efficiency + trust + speed + risk + cost; no empty slogans
3. **Service**: business / technology / self-service; no leakage
4. **Request**: catalog + form + template; no leakage
5. **Approval**: policy + routing + notification; no leakage
6. **Governance**: owner / cadence / review / documentation / drift; no leakage
7. **Measurement**: coverage + adoption + cost + risk + satisfaction; no leakage
8. **Not one-shot**: progress from service → request → approval → governance → measurement; no skipping levels
9. **No report-ism**: lists are only the start; not the end
10. **No empty slogans**: every principle must mark implementation evidence; no vagueness
11. **Versioned**: strategy is versioned; evolution is traceable
12. **Link with itil**: catalog + ITIL co-built
13. **Link with it-service-management**: catalog + ITSM co-built
14. **Link with cmdb**: catalog + CMDB co-built
15. **Link with it-asset-management**: catalog + asset co-built
16. **Link with incident-management**: catalog + incident co-built
17. **Toolchain**: ServiceNow / BMC Helix / Jira Service Management / Freshworks / Cherwell
18. **Publicly discoverable**: strategy is publicly discoverable; not hidden
19. **Regular review**: evolve and update; not one-shot
20. **First principles**: why an IT service catalog strategy is necessary; worst consequence of not doing it
21. **Inversion**: how much can be solved by relying on defaults; if solvable, do not introduce a heavy strategy
22. **Second-order thinking**: second-order consequence after the strategy (efficiency / trust / speed / risk) 
23. **Occam's razor**: IT service catalog: simpler is better; cut redundant layers

## Related

- itil: [./prepare-an-itil-strategy.md](./prepare-an-itil-strategy.md) — ITIL co-built
- it-service-management: [./prepare-an-it-service-management-strategy.md](./prepare-an-it-service-management-strategy.md) — ITServiceManagement co-built
- cmdb: [../../executive/strategy/prepare-a-cmdb-strategy.md](../../executive/strategy/prepare-a-cmdb-strategy.md) — CMDB co-built
- it-asset-management: [./prepare-an-it-asset-management-strategy.md](./prepare-an-it-asset-management-strategy.md) — ITAssetManagement co-built
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion](../../knowledge-curator/templates/thinking/inversion.md) + [second-order](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams](../../knowledge-curator/templates/thinking/ockhams-razor.md)
