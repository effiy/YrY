---
title: I want to build an identity strategy / Prepare an identity strategy
aliases: [i-want-to-prepare-an-identity-strategy, identity-strategy]
tags: [journey, methodology, identity, security, strategy]
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
  - "Filename is descriptive verb-phrase, hyphens only, no underscores or digits"
  - "body contains user-story header + 7 fixed-order sections"
related:
  - ./prepare-a-zero-trust-strategy.md
  - ./prepare-a-security-strategy.md
  - ./prepare-an-it-strategy.md
  - ../../tech-lead/roadmap/prepare-an-enterprise-architecture-strategy.md
  - ./prepare-an-application-portfolio-strategy.md
  - ../../knowledge-curator/templates/thinking/first-principles.md
  - ../../knowledge-curator/templates/thinking/inversion.md
  - ../../knowledge-curator/templates/thinking/second-order-thinking.md
  - ../../knowledge-curator/templates/thinking/ockhams-razor.md
tacit: Identity is not just accounts; it is a contract. Identity + authentication + authorization + governance + measurement five dimensions; business-value driven; not one-shot; measurable
---

# I want to build an identity strategy

> **As an** engineer, **I want to** prepare an identity, **so that** launch is safe. 

## Summary

- Identity = contract; not just accounts
- Identity + authentication + authorization + governance + measurement five dimensions; no missing dimension
- Business-value driven; not by gut feel
- Covers human / non-human / federated / external multiple types
- Links with zero-trust + security + it-strategy + enterprise-architecture + application-portfolio
- Publicly queryable; not hidden
- Periodic review; evolution updates
- First principles / inversion / second-order / Occam

## Scenario

Identity is a contract; not just accounts. This entry provides the full identity path, covering identity + authentication + authorization + governance + measurement, business-value driven not by gut feel, covering human / non-human / federated / external multiple types, linking with prepare-a-zero-trust + prepare-a-security + prepare-an-it + prepare-an-enterprise-architecture + prepare-an-application-portfolio, publicly queryable, periodic review, and links to Identity / ZeroTrust / Security / ITStrategy / EnterpriseArchitecture / ApplicationPortfolio and other leaves. 

## 2-hop reachability paths

| Hop count | Target | File |
|---|---|---|
| 1 hop | Entry overview | [README.md](./) |
| 1 hop | zero-trust | [./prepare-a-zero-trust-strategy.md](./prepare-a-zero-trust-strategy.md) |
| 1 hop | security | [./prepare-a-security-strategy.md](./prepare-a-security-strategy.md) |
| 2 hop | it-strategy | [./prepare-an-it-strategy.md](./prepare-an-it-strategy.md) |
| 2 hop | enterprise-architecture | [../../tech-lead/roadmap/prepare-an-enterprise-architecture-strategy.md](../../tech-lead/roadmap/prepare-an-enterprise-architecture-strategy.md) |
| 2 hops | first-principles | [../../knowledge-curator/templates/thinking/first-principles.md](../../knowledge-curator/templates/thinking/first-principles.md) |

## Action recommendations

1. **Five dimensions**: identity + authentication + authorization + governance + measurement; no missing dimension
2. **Business-value driven**: set priority by efficiency + trust + speed + risk + compliance; not sloganeering
3. **Identity**: human / non-human / federated / external; do not omit
4. **AuthN**: password / MFA / passwordless / federated; do not omit
5. **AuthZ**: RBAC / ABAC / PBAC / relationship; do not omit
6. **Governance**: owner / cadence / review / documentation / drift; do not omit
7. **Measurement**: coverage + adoption + cost + risk + satisfaction; do not omit
8. **Not one-shot**: from identity -> authentication -> authorization -> governance -> measurement gradual; no skipping
9. **Not report-ized**: accounts are only the start; not the end
10. **Not sloganeering**: every principle must have landing evidence; not vague
11. **Versioned**: strategy has versions; evolution is traceable
12. **Link with zero-trust**: identity + zero trust co-built
13. **Link with security**: identity + security co-built
14. **Link with it-strategy**: identity + IT co-built
15. **Link with enterprise-architecture**: identity + architecture co-built
16. **Link with application-portfolio**: identity + applications co-built
17. **Toolchain**: Okta / Ping Identity / Microsoft Entra / Azure AD / SailPoint
18. **Publicly queryable**: strategy everyone can look up; not hidden
19. **Periodic review**: evolution updates; not one-shot
20. **First principles**: why must an identity strategy; worst consequence of not doing
21. **Inversion thinking**: how much can be solved by default; if solvable do not introduce a heavy strategy
22. **Second-order thinking**: second-order consequences after strategy (efficiency / trust / speed / risk)
23. **Occam**: identity, the simpler the better; cut redundant layers

## Related

- zero-trust: [./prepare-a-zero-trust-strategy.md](./prepare-a-zero-trust-strategy.md) — ZeroTrust co-built
- security: [./prepare-a-security-strategy.md](./prepare-a-security-strategy.md) — Security co-built
- it-strategy: [./prepare-an-it-strategy.md](./prepare-an-it-strategy.md) — ITStrategy co-built
- enterprise-architecture: [../../tech-lead/roadmap/prepare-an-enterprise-architecture-strategy.md](../../tech-lead/roadmap/prepare-an-enterprise-architecture-strategy.md) — EnterpriseArchitecture co-built
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion](../../knowledge-curator/templates/thinking/inversion.md) + [second-order](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams](../../knowledge-curator/templates/thinking/ockhams-razor.md)
