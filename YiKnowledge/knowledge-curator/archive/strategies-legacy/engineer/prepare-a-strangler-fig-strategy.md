---
title: I want to build a Strangler Fig strategy / Prepare a Strangler Fig strategy
aliases:
- i-want-to-prepare-a-strangler-fig-strategy
- strangler-fig-strategy
tags:
- journey
- methodology
- architecture
- strangler
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
- ./prepare-an-anti-corruption-layer-strategy.md
- ./prepare-a-bff-strategy.md
- ./prepare-a-canary-deployment-strategy.md
- ./prepare-a-feature-flag-strategy.md
- ../../knowledge-curator/templates/thinking/first-principles.md
- ../../knowledge-curator/templates/thinking/inversion.md
- ../../knowledge-curator/templates/thinking/second-order-thinking.md
- ../../knowledge-curator/templates/thinking/ockhams-razor.md
tacit: Strangler Fig is not just migration; it is a contract. Cut-in + replace + rollback + governance + measurement five dimensions; business-value driven; not one-shot; measurable
status: deprecated
---

# I want to build a Strangler Fig strategy

> **As an** engineer, **I want to** prepare a strangler fig, **so that** launch is safe.

## Summary

- Strangler Fig = contract; not just migration
- Cut-in + replace + rollback + governance + measurement five dimensions; no missing dimension
- Business-value driven; not by gut feel
- Covers routing / migrate / shadow / cutover / decommission multiple types
- Links with anti-corruption-layer + bff + canary-deployment + domain-driven-design + feature-flag
- Publicly queryable; not hidden
- Periodic review; evolution updates
- First principles / inversion / second-order / Occam

## Scenario

Strangler Fig is a contract; not just migration. This entry provides the Strangler Fig full path, covering cut-in + replace + rollback + governance + measurement, business-value driven not by gut feel, covering routing / migrate / shadow / cutover / decommission multiple types, linking with prepare-an-anti-corruption-layer-strategy + prepare-a-bff-strategy + prepare-a-canary-deployment-strategy + prepare-a-domain-driven-design-strategy + prepare-a-feature-flag-strategy, publicly queryable, periodic review, and links to ACL / BFF / CanaryDeployment / DDD / FeatureFlag and other leaves.

## 2-hop reachability paths

| Hop count | Target | File |
|---|---|---|
| 1 hop | Entry overview | [README.md](./) |
| 1 hop | anti-corruption-layer | [./prepare-an-anti-corruption-layer-strategy.md](./prepare-an-anti-corruption-layer-strategy.md) |
| 1 hop | bff | [./prepare-a-bff-strategy.md](./prepare-a-bff-strategy.md) |
| 2 hops | canary-deployment | [./prepare-a-canary-deployment-strategy.md](./prepare-a-canary-deployment-strategy.md) |
| 2 hops | domain-driven-design | [./i-want-to-prepare-a-domain-driven-design-strategy.md](../patterns/apply-domain-driven-design.md) |
| 2 hops | first-principles | [../../knowledge-curator/templates/thinking/first-principles.md](../../knowledge-curator/templates/thinking/first-principles.md) |

## Action recommendations

1. **Five dimensions**: cut-in + replace + rollback + governance + measurement; no missing dimension
2. **Business-value driven**: prioritize by efficiency + trust + speed + risk + cost; not sloganeering
3. **Strangle**: routing / migrate / closed loop; do not omit
4. **Replace**: shadow / cutover / closed loop; do not omit
5. **Rollback**: flag / revert / closed loop; do not omit
6. **Governance**: owner / cadence / review / documentation / drift; do not omit
7. **Measurement**: efficiency + trust + speed + risk + cost; do not omit
8. **Not one-shot**: progress from cut-in -> replace -> rollback -> governance -> measurement; no skipping
9. **Not report-ized**: reports are only the start; not the end
10. **Not sloganeering**: every principle must have landing evidence; not vague
11. **Versioned**: strategy has versions; evolution is traceable
12. **Link with anti-corruption-layer**: StranglerFig + ACL co-built
13. **Link with bff**: StranglerFig + BFF co-built
14. **Link with canary-deployment**: StranglerFig + Canary co-built
15. **Link with domain-driven-design**: StranglerFig + DDD co-built
16. **Link with feature-flag**: StranglerFig + FeatureFlag co-built
17. **Toolchain**: Kong / NGINX / Envoy / HAProxy / AWS Route 53
18. **Publicly queryable**: strategy everyone can look up; not hidden
19. **Periodic review**: evolution updates; not one-shot
20. **First principles**: why StranglerFig is necessary; worst consequence of not doing it
21. **Inversion thinking**: how much can be solved by big-bang; if solvable, do not introduce a heavy strategy
22. **Second-order thinking**: second-order consequences after strategy (efficiency / trust / speed / risk)
23. **Occam**: the simpler StranglerFig is the better; cut redundant phases

## Related

- anti-corruption-layer: [./prepare-an-anti-corruption-layer-strategy.md](./prepare-an-anti-corruption-layer-strategy.md) — ACL co-built
- bff: [./prepare-a-bff-strategy.md](./prepare-a-bff-strategy.md) — BFF co-built
- canary-deployment: [./prepare-a-canary-deployment-strategy.md](./prepare-a-canary-deployment-strategy.md) — Canary co-built
- domain-driven-design: [./i-want-to-prepare-a-domain-driven-design-strategy.md](../patterns/apply-domain-driven-design.md) — DDD co-built
- feature-flag: [./prepare-a-feature-flag-strategy.md](./prepare-a-feature-flag-strategy.md) — FeatureFlag co-built
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion](../../knowledge-curator/templates/thinking/inversion.md) + [second-order](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams](../../knowledge-curator/templates/thinking/ockhams-razor.md)
