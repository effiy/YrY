---
title: I want to build an Anti-Corruption Layer strategy / Prepare an Anti-Corruption Layer strategy
aliases:
- i-want-to-prepare-an-anti-corruption-layer-strategy
- anti-corruption-layer-strategy
- acl-strategy
tags:
- journey
- methodology
- architecture
- acl
- planning
category: engineer/strategies
created: 2026-08-04
updated: 2026-08-04
source: internal
type: journey
lifecycle: active
review_cycle: quarterly
roles:
- engineer
benefit: launch is safe
acceptance_criteria:
- frontmatter roles + benefit + acceptance_criteria present
- Filename is descriptive verb-phrase, hyphens only, no underscores or digits
- body contains user-story header + 7 fixed-order sections
related:
- ./prepare-a-bff-strategy.md
- ./prepare-a-strangler-fig-strategy.md
- ./prepare-a-micro-frontends-strategy.md
- ./prepare-an-api-gateway-strategy.md
- ../../knowledge-curator/templates/thinking/first-principles.md
- ../../knowledge-curator/templates/thinking/inversion.md
- ../../knowledge-curator/templates/thinking/second-order-thinking.md
- ../../knowledge-curator/templates/thinking/ockhams-razor.md
tacit: "ACL is not just an adapter layer; it is a contract. Five dimensions: isolation + translation + boundary + governance + measurement; business-value driven; not one-shot; measurable"
status: deprecated
---

# I want to build an Anti-Corruption Layer strategy

> **As an** engineer, **I want to** prepare an anti corruption layer, **so that** launch is safe.

## Summary

- ACL = contract; not just an adapter layer
- Five dimensions: isolation + translation + boundary + governance + measurement; no missing dimension
- Business-value driven; not by gut feel
- Covers adapter / translator / facade / proxy / anti-corruption multiple types
- Links with bff + strangler-fig + domain-driven-design + micro-frontends + api-gateway
- Publicly queryable; not hidden
- Periodic review; evolution updates
- First principles / inversion / second-order / Occam

## Scenario

ACL is a contract; not just an adapter layer. This entry gives the ACL full path, covering isolation + translation + boundary + governance + measurement, business-value driven not by gut feel, covering adapter / translator / facade / proxy / anti-corruption multiple types, linking with prepare-a-bff-strategy + prepare-a-strangler-fig-strategy + prepare-a-domain-driven-design-strategy + prepare-a-micro-frontends-strategy + prepare-an-api-gateway-strategy, publicly queryable, periodic review, and links to BFF / StranglerFig / DDD / MicroFrontends / APIGateway and other leaves.

## 2-hop reachability paths

| Hops | Target | File |
|---|---|---|
| 1 hop | Entry overview | [README.md](./) |
| 1 hop | bff | [./prepare-a-bff-strategy.md](./prepare-a-bff-strategy.md) |
| 1 hop | strangler-fig | [./prepare-a-strangler-fig-strategy.md](./prepare-a-strangler-fig-strategy.md) |
| 2 hops | domain-driven-design | [./i-want-to-prepare-a-domain-driven-design-strategy.md](../patterns/apply-domain-driven-design.md) |
| 2 hops | micro-frontends | [./prepare-a-micro-frontends-strategy.md](./prepare-a-micro-frontends-strategy.md) |
| 2 hops | first-principles | [../../knowledge-curator/templates/thinking/first-principles.md](../../knowledge-curator/templates/thinking/first-principles.md) |

## Action recommendations

1. **Five dimensions**: isolation + translation + boundary + governance + measurement; no missing dimension
2. **Business-value driven**: prioritize by efficiency + trust + speed + risk + cost; not sloganeering
3. **Isolation**: domain / legacy / closed loop; do not omit
4. **Translation**: adapter / translator / closed loop; do not omit
5. **Boundary**: facade / proxy / closed loop; do not omit
6. **Governance**: owner / cadence / review / documentation / drift; do not omit
7. **Measurement**: efficiency + trust + speed + risk + cost; do not omit
8. **Not one-shot**: progress from isolation → translation → boundary → governance → measurement; no skipping
9. **Not report-ized**: reports are only the start; not the end
10. **Not sloganeering**: every principle must have landing evidence; not vague
11. **Versioned**: strategy has versions; evolution is traceable
12. **Link with bff**: ACL + BFF co-built
13. **Link with strangler-fig**: ACL + StranglerFig co-built
14. **Link with domain-driven-design**: ACL + DDD co-built
15. **Link with micro-frontends**: ACL + MicroFrontends co-built
16. **Link with api-gateway**: ACL + APIGateway co-built
17. **Toolchain**: Apache Camel / MuleSoft / Kong / WSO2 / Spring Cloud Gateway
18. **Publicly queryable**: strategy everyone can look up; not hidden
19. **Periodic review**: evolution updates; not one-shot
20. **First principles**: why must ACL; the worst consequence of not doing it
21. **Inversion thinking**: how much can be solved by direct calls; if solvable do not introduce a heavy strategy
22. **Second-order thinking**: second-order consequences after strategy (efficiency / trust / speed / risk)
23. **Occam**: the simpler ACL is, the better; cut redundant adapters

## Related

- bff: [./prepare-a-bff-strategy.md](./prepare-a-bff-strategy.md) — BFF co-built
- strangler-fig: [./prepare-a-strangler-fig-strategy.md](./prepare-a-strangler-fig-strategy.md) — StranglerFig co-built
- domain-driven-design: [./i-want-to-prepare-a-domain-driven-design-strategy.md](../patterns/apply-domain-driven-design.md) — DDD co-built
- micro-frontends: [./prepare-a-micro-frontends-strategy.md](./prepare-a-micro-frontends-strategy.md) — MicroFrontends co-built
- api-gateway: [./prepare-an-api-gateway-strategy.md](./prepare-an-api-gateway-strategy.md) — APIGateway co-built
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion](../../knowledge-curator/templates/thinking/inversion.md) + [second-order](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams](../../knowledge-curator/templates/thinking/ockhams-razor.md)
