---
title: Handle multi-tenancy
aliases: [i-want-to-handle-multi-tenancy, handle-multi-tenancy, multi-tenant-architecture]
tags: [journey, methodology, multi-tenancy, architecture, isolation, shared]
category: engineer/architecture-design
created: 2026-08-03
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: summary
lifecycle: active
status: stable
review_cycle: quarterly
roles: [engineer]
benefit: "Multi-tenant systems isolate customer data and configuration, preventing cross-tenant leaks and noisy-neighbor problems"
acceptance_criteria:
  - "user story header defines who, what, and why"
  - "step-by-step guide is complete with prerequisites and expected outcome"
  - "cross-references to related journeys and patterns are present
related:
- ../../tech-lead/architecture/design-architecture-decision.md
  - ./decompose-a-monolith.md
  - ../infrastructure/migrate-a-database.md
  - ../engineering/scale-a-service.md
  - ../../oncall-sre/observability/set-up-observability.md
  - ../../executive/strategy/handle-data-compliance.md
  - ../../knowledge-curator/templates/thinking--first-principles.md
  - ../../knowledge-curator/templates/thinking--second-order-thinking.md
  - ../../knowledge-curator/templates/thinking--inversion.md
  - ../../knowledge-curator/templates/thinking--ockhams-razor.md
tacit: Multi-tenancy is not isolated by default; tier it by data sensitivity + cost + compliance; start with shared schema + tenant_id then upgrade
---

# Handle multi-tenancy

> **As an** engineer, **I want to** handle multi tenancy, **so that** incident is contained.

## Summary

- Three multi-tenant tiers: shared schema + tenant_id → shared database per tenant → dedicated per tenant
- Selection dimensions: data sensitivity / cost / compliance / performance / fault isolation / customization
- shared schema + tenant_id starter: lowest cost; weakest isolation
- shared database per tenant middle: medium isolation; medium cost
- dedicated per tenant high: strongest isolation; highest cost
- Tenant ID SSOT: tenant_id through the chain; RLS / row-level filter
- Fault isolation: shared multi-tenant one tenant fault impacts multiple tenants

## Scenario

Business multi-tenant-ization, SaaS transformation, new business models need tenant isolation. This entry provides the multi-tenant architecture selection path, covering three isolation tiers, selection dimensions, tenant ID SSOT, fault isolation, data compliance, and links to design-architecture-decision / decompose-a-monolith / migrate-a-database / scale-a-service / handle-secrets-and-config / set-up-observability / handle-data-compliance and other leaves.

## 2-hop reachability paths

| Hop count | Target | File |
|---|---|---|
| 1 hop | Entry overview | [README.md](./) |
| 1 hop | ADR | [../../tech-lead/architecture/design-architecture-decision.md](../../tech-lead/architecture/design-architecture-decision.md) |
| 2 hop | decompose monolith | [./decompose-a-monolith.md](./decompose-a-monolith.md) |
| 2 hop | database migration | [../processes/migrate-a-database.md](../infrastructure/migrate-a-database.md) |
| 2 hop | scale | [../tools/scale-a-service.md](../engineering/scale-a-service.md) |
| 2 hop | secrets & config | [./handle-secrets-and-config.md](../quality-security/handle-secrets-and-config.md) |
| 2 hop | observability | [../../oncall-sre/observability/set-up-observability.md](../../oncall-sre/observability/set-up-observability.md) |
| 2 hop | data compliance | [../../executive/strategy/handle-data-compliance.md](../../executive/strategy/handle-data-compliance.md) |
| 2 hops | first-principles | [../../knowledge-curator/templates/thinking--first-principles.md](../../knowledge-curator/templates/thinking--first-principles.md) |
| 2 hops | second-order | [../../knowledge-curator/templates/thinking--second-order-thinking.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) |
| 2 hops | inversion | [../../knowledge-curator/templates/thinking--inversion.md](../../knowledge-curator/templates/thinking--inversion.md) |
| 2 hops | ockhams | [../../knowledge-curator/templates/thinking--ockhams-razor.md](../../knowledge-curator/templates/thinking--ockhams-razor.md) |

## Action recommendations

1. **Three tiers**: shared schema + tenant_id / shared database per tenant / dedicated per tenant; not isolated by default
2. **Selection dimensions**: data sensitivity / cost / compliance / performance / fault isolation / customization; sort by dimensions
3. **shared schema + tenant_id starter**: lowest cost; weakest isolation; suits small tenants
4. **shared database per tenant middle**: medium isolation; medium cost; suits mid-size tenants
5. **dedicated per tenant high**: strongest isolation; highest cost; suits large customers + compliance
6. **Tenant ID SSOT**: tenant_id through the chain; RLS / row-level filter; do not omit any point
7. **Fault isolation**: shared multi-tenant one tenant fault impacts multiple tenants; isolate blast radius by tenant
8. **Resource quotas**: quota per tenant; prevent one tenant exhausting resources
9. **Data compliance**: high compliance requirements use dedicated per tenant; see [data-compliance](../../executive/strategy/handle-data-compliance.md)
10. **Observability per tenant**: monitoring / logs / traces per tenant; alert by tenant
11. **First principles**: why multi-tenant is needed; worst consequence of not being multi-tenant; multi-tenant cost ÷ benefit
12. **Inversion thinking**: how much single-tenant + multi-instance can solve; if solvable do not go multi-tenant
13. **Second-order thinking**: second-order consequences after multi-tenancy (isolation / migration / cost); not just short-term output
14. **Occam**: multi-tenant solution the simpler the better; cut redundant isolation

## Related

- ADR: [../../tech-lead/architecture/design-architecture-decision.md](../../tech-lead/architecture/design-architecture-decision.md) — multi-tenant decision
- decompose monolith: [./decompose-a-monolith.md](./decompose-a-monolith.md) — split monolith into services
- database migration: [../processes/migrate-a-database.md](../infrastructure/migrate-a-database.md) — schema multi-tenant-ization
- scale: [../tools/scale-a-service.md](../engineering/scale-a-service.md) — multi-tenant scaling
- secrets & config: [./handle-secrets-and-config.md](../quality-security/handle-secrets-and-config.md) — tenant secrets
- observability: [../../oncall-sre/observability/set-up-observability.md](../../oncall-sre/observability/set-up-observability.md) — per-tenant monitoring
- data compliance: [../../executive/strategy/handle-data-compliance.md](../../executive/strategy/handle-data-compliance.md) — compliance tiers
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking--first-principles.md) + [second-order](../../knowledge-curator/templates/thinking--second-order-thinking.md) + [inversion](../../knowledge-curator/templates/thinking--inversion.md) + [ockhams](../../knowledge-curator/templates/thinking--ockhams-razor.md)
