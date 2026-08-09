---
title: Evaluate a vendor SaaS
aliases: [i-want-to-evaluate-a-vendor-saas, vendor-evaluation, saas-evaluation]
tags: [journey, methodology, vendor, saas, due-diligence, exit-strategy]
category: engineer/engineering
created: 2026-08-03
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: summary
lifecycle: active
status: stable
review_cycle: quarterly
roles: [engineer]
benefit: "findings are actionable"
acceptance_criteria:
  - "user story header defines who, what, and why"
  - "step-by-step guide is complete with prerequisites and expected outcome"
  - "cross-references to related journeys and patterns are present
related:
  - ../../executive/strategy/handle-data-compliance.md
  - ../../oncall-sre/incident-response/handle-a-data-breach.md
  - ../../product-manager/frameworks/write-a-spec-or-prd.md
  - ../../knowledge-curator/templates/thinking--first-principles.md
  - ../../knowledge-curator/templates/thinking--inversion.md
  - ../../knowledge-curator/templates/thinking--second-order-thinking.md
  - ../../knowledge-curator/templates/thinking--ockhams-razor.md
tacit: Vendor assessment is not just about features; security / compliance / SLA / cost / integration / portability / exit strategy are a full package; do not get locked into a vendor
---

# I want to evaluate a vendor SaaS

> **As an** engineer, **I want to** evaluate a vendor saas, **so that** findings are actionable. 

## Summary

- Assessment dimensions: security / compliance / performance / SLA / cost / integration / portability / exit strategy
- Due diligence: SOC2 / ISO27001 / security audit look-up
- Integration: API / SSO / SCIM; not locked in
- Cost: TCO; not just license
- Exit strategy: data migration; not locked in
- Do not get locked into a vendor; replaceable
- Inversion / second-order / Occam's razor thinking

## Scenario description

Vendor SaaS assessment is a long-term decision; not just about features. This entry provides the full vendor assessment path, covering assessment dimensions, due diligence, security audit look-up, integration, cost TCO, exit strategy, no vendor lock-in, and links to adopt-a-new-dependency / harden-supply-chain / handle-secrets-and-config / handle-data-compliance / handle-a-data-breach / collaborate-across-teams / write-a-spec-or-prd and other leaves.

## 2-hop reachability path

| Hop | Target | file |
|---|---|---|
| 1 hop | Entry overview | [README.md](./) |
| 1 hop | Introduce dependency | [./i-want-to-adopt-a-new-dependency.md](../quality-security/adopt-a-new-dependency.md) |
| 2 hop | Supply-chain hardening | [./harden-supply-chain.md](../process/harden-supply-chain.md) |
| 2 hop | Key config | [./handle-secrets-and-config.md](../quality-security/handle-secrets-and-config.md) |
| 2 hop | Data compliance | [../../executive/strategy/handle-data-compliance.md](../../executive/strategy/handle-data-compliance.md) |
| 2 hop | Data breach | [../../oncall-sre/incident-response/handle-a-data-breach.md](../../oncall-sre/incident-response/handle-a-data-breach.md) |
| 2 hop | Cross-team collaboration | [./collaborate-across-teams.md](../process/collaborate-across-teams.md) |
| 2 hop | PRD | [../../product-manager/frameworks/write-a-spec-or-prd.md](../../product-manager/frameworks/write-a-spec-or-prd.md) |
| 2 hop | first-principles | [../../knowledge-curator/templates/thinking--first-principles.md](../../knowledge-curator/templates/thinking--first-principles.md) |
| 2 hop | inversion | [../../knowledge-curator/templates/thinking--inversion.md](../../knowledge-curator/templates/thinking--inversion.md) |
| 2 hop | second-order | [../../knowledge-curator/templates/thinking--second-order-thinking.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) |
| 2 hop | ockhams | [../../knowledge-curator/templates/thinking--ockhams-razor.md](../../knowledge-curator/templates/thinking--ockhams-razor.md) |

## Action recommendations

1. **Assessment dimensions**: security / compliance / performance / SLA / cost / integration / portability / exit strategy; do not neglect any
2. **Due diligence**: SOC2 / ISO27001 / security audit look-up; not verbal promises
3. **Security audit look-up**: data encryption / access control / audit log / penetration test report
4. **Compliance alignment**: GDPR / regional regulations; data residency
5. **Performance SLA**: availability 99.9%+ / latency / RPO / RTO; not verbal
6. **Cost TCO**: license + integration + migration + exit; not just license
7. **Integration**: API / SSO / SCIM; not locked in; standardized protocols
8. **Portability**: data export in standard formats; not locked in
9. **Exit strategy**: data migration contingency; exit cost assessment
10. **No vendor lock-in**: replaceable; not bound to a single vendor
11. **Replacement solutions ≥ 3**: trade-off each option; do not choose blindly
12. **POC validation**: POC on key scenarios; not verbal
13. **Contract terms**: SLA / data ownership / exit clauses; legal review
14. **Customer references**: contact existing customers; do not just take sales at their word
15. **First principles**: why a vendor is necessary; worst consequence of building in-house
16. **Inversion**: how much can be solved with in-house + open source; if solvable, do not introduce a vendor
17. **Second-order thinking**: second-order consequences after introducing a vendor (lock-in / cost rise / service stop / compliance) 
18. **Occam's razor**: simpler vendor solutions are better; cut redundant features

## Related

- Introduce dependency: [./i-want-to-adopt-a-new-dependency.md](../quality-security/adopt-a-new-dependency.md) — dependency assessment comparison
- Supply-chain hardening: [./harden-supply-chain.md](../process/harden-supply-chain.md) — vendor supply-chain audit look-up
- Key config: [./handle-secrets-and-config.md](../quality-security/handle-secrets-and-config.md) — key management alignment
- Data compliance: [../../executive/strategy/handle-data-compliance.md](../../executive/strategy/handle-data-compliance.md) — data residency / compliance
- Data breach: [../../oncall-sre/incident-response/handle-a-data-breach.md](../../oncall-sre/incident-response/handle-a-data-breach.md) — joint handling of a vendor breach
- Cross-team: [./collaborate-across-teams.md](../process/collaborate-across-teams.md) — legal / security / business collaboration
- PRD: [../../product-manager/frameworks/write-a-spec-or-prd.md](../../product-manager/frameworks/write-a-spec-or-prd.md) — requirement alignment
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking--first-principles.md) + [inversion](../../knowledge-curator/templates/thinking--inversion.md) + [second-order](../../knowledge-curator/templates/thinking--second-order-thinking.md) + [ockhams](../../knowledge-curator/templates/thinking--ockhams-razor.md)
