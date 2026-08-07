---
title: Anti-Corruption Layer
aliases: [anti-corruption-layer-pattern, acl-pattern, anti-corruption-layer]
tags: [pattern, engineering patterns, anti-corruption-layer, boundary, migration, DDD]
category: engineer/architecture-design
created: 2026-08-03
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
tacit: false
roles: [engineer, tech-lead, oncall-sre]
benefit: "Legacy and modern systems coexist without cross-contamination, enabling safe incremental migration"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified
related:
- ./strangler-fig.md
  - ./one-to-one-mapping-migration.md
  - ./staged-port-methodology.md
  - ./api-gateway.md
  - ./saga.md
  - ./decompose-a-monolith.md
---

# Anti-Corruption Layer

> **As an** engineer, **I want to** anti corruption layer, **so that** pattern applied consistently. 

## Summary

Place a layer of translators between subsystems and external dependencies so external concepts do not pollute the internal model. An ACL = boundary + translation + isolation + one-way dependency; suitable for integrating legacy systems, third-party APIs, cross-team interfaces; not suitable for internal modules whose models are already aligned. 

## Core viewpoints

**The ACL's primary job is not translation -- it is buying you time when the external system changes.** Translation is the mechanism; the value is that when the third-party API deprecates a field, you change one file instead of fifty. The ACL is an insurance policy whose premium is the translation layer and whose payout is the avoided cascade of changes.

**An ACL without tests is a facade that will rot silently.** External schemas drift. The only way to know the translation still works is to run contract tests against real external response fixtures. An untested ACL gives false confidence -- it looks like isolation but breaks the moment the external system changes a field name.

**One ACL per external system, not one ACL per use case.** If two internal domains both call Stripe, they should share one Stripe ACL, not each build their own. Multiple ACLs for the same external system diverge in their translation logic, creating the very inconsistency the pattern is supposed to prevent.

**The ACL boundary is a one-way door -- internal code never imports external types.** This is not a style preference; it is the mechanism that makes the ACL work. If `ExternalUser` appears anywhere in the domain layer, the isolation is already broken. The type system must enforce this: the ACL package has the only import of the external SDK.

**Over-translation is worse than no translation.** Wrapping an external DTO in an identical internal class with renamed fields that map 1:1 adds indirection without adding protection. An ACL is warranted only when the external model genuinely differs from the internal model in semantics, structure, or stability guarantees.

## Key info

- **ACL vs Facade vs Adapter**: a Facade simplifies a complex interface but does not translate concepts; an Adapter makes two interfaces compatible but does not isolate the domain model; an ACL translates semantics, enforces a one-way dependency, and isolates the domain from external model changes. The three are nested: an ACL is a Facade + Adapter + isolation boundary. Using the wrong term leads to the wrong implementation (e.g., a Facade that doesn't translate semantics breaks when the external API changes field names).
- **Translation layers**: the ACL typically has three sub-layers: (1) protocol translation (REST→internal, gRPC→internal), (2) model translation (ExternalUser→User, snake_case→camelCase), and (3) semantic translation (external `status: "P"` → internal `PaymentStatus.PENDING`). Semantic translation is the most valuable and the most frequently skipped -- skipping it means external semantics leak into the domain model.
- **Contract test fixture strategy**: store external API response fixtures in versioned directories (`fixtures/stripe/v2024-01/`, `fixtures/stripe/v2024-06/`). Run contract tests against all versions. When the external API upgrades, add a new version directory, not overwrite the old one. This catches breaking changes before production and serves as documentation of what the external API returned at each version.
- **Performance cost**: an ACL adds 1-5ms of latency per translation (object mapping, protocol conversion). For high-throughput paths (>1000 req/s), use code generation (e.g., OpenAPI generator → typed client) instead of runtime reflection. The ACL's isolation benefit is preserved; the latency cost is moved to build time.
- **ACL sunset criteria**: the ACL should be removed when (1) the external system is fully decommissioned, or (2) the internal model has evolved to match the external model and the translation is 1:1 identity. The second case is rare and usually means the external system is now the canonical model -- at which point the ACL is dead code and should be deleted rather than maintained.

## Problem

Directly calling external / legacy systems lets external concepts seep into the core domain: 
- Third-party field names (`user_nm` / `cust_id`) pollute the internal model
- External schema changes → core code changes along with it
- Legacy system semantic ambiguity → business rules scatter across callers
- Cross-team boundary without explicit translation → coupling implicit, regression risk high
- Quantified: without ACL, third-party schema upgrade triggers on average 3-5 core code modifications; with ACL, changed to 1 modification in translation layer

## Pattern

ACL four elements: 
1. **boundary**: explicit package/module/service boundary, independent namespace
2. **translation**: inbound / outbound translator, external DTO ↔ internal domain model
3. **isolation**: internal does not reference external types; external unaware of internal model
4. **one-way dependency**: internal domain → ACL → external; external never reverses to depend on internal

```python
class AntiCorruptionLayer:
    def __init__(self, external_client, translator):
        self.external = external_client
        self.translator = translator

    def get_user(self, external_id):
        external_dto = self.external.fetch_user(external_id)
        return self.translator.to_domain(external_dto)

class UserTranslator:
    def to_domain(self, dto):
        return User(
            id=UserId(dto["cust_id"]),
            name=PersonName(dto["user_nm"]),
            email=Email(dto["email_addr"]),
        )
```

Adapter pattern + Port pattern (Hexagonal) = modern form of ACL: internal defines Port, ACL implements Port and wraps external SDK. 

## Applicable

- Integrating legacy systems: old ERP / CRM / internal monolith
- Third-party SaaS API: Stripe / Salesforce / Slack
- Cross-team boundary interface: BFF calling downstream, platform calling business domain
- Model-misaligned integration: external uses `customer`, internal uses `tenant`
- Migration-period dual-write: strangler-fig traffic-split phase maintains both new and old models
- Microservice split early stage: monolith extracts data as service, ACL translates for old callers

## Not applicable

- Internal module models already aligned: pure internal calls introducing ACL = over-design
- One-off scripts / tools: temporary integration no long-term evolution pressure
- Performance extremely sensitive path: translation has overhead, hot path direct call better
- External API already stable and semantically fits business: direct use simpler

## Landing checklist

1. Naming independent package `acl/` or `adapters/{vendor}/`, parallel to `domain/` `infra/`
2. Ports defined in `domain/ports/`, ACL implements Port; internal only references Port not implementation
3. Inbound translation: external DTO → domain model; outbound translation: domain command → external API
4. Field renaming + type conversion + invariant validation all in translator
5. Unit test covers translator: external schema fixture → internal domain expectation
6. contract test baseline: snapshot aligned with external schema blocks external breaking changes
7. Feature flag wraps ACL switchover: strangler-fig traffic-split when new and old ACL dual-write
8. Monitoring ACL failure rate + translation latency + schema mismatch alerts
9. Document translation table: external field ↔ internal field ↔ invariants

## Action recommendations

1. **Create exactly one ACL per external system, shared across all internal consumers.** Two teams that independently build ACLs for the same Stripe API will produce two different translations of the same Stripe objects. The single ACL package is the only import point for the external SDK, enforced by the type system.

2. **Write contract tests against real external response fixtures for every ACL.** External schemas drift. An untested ACL gives false confidence -- it looks like isolation but breaks silently when the external system changes a field name. Snapshot fixtures aligned with the external schema block breaking changes at the CI level.

3. **Preserve enough error semantics for callers to respond appropriately.** Wrapping every external error in a generic `ExternalServiceException` destroys the caller's ability to distinguish a rate-limit error (429, retry) from an auth error (401, re-authenticate) from a validation error (422, surface to user). Map error types, not just error existence.

4. **Add a circuit breaker around every ACL that calls an external service.** If the external system is down, every call through the ACL fails. Without a circuit breaker, the failure cascades to every internal service that depends on the ACL. The circuit breaker stops the cascade and gives the external system time to recover.

5. **Document the ACL's planned retirement date when it exists to isolate a legacy system during migration.** An ACL that outlives the migration becomes technical debt. The ACL's lifecycle should be explicit: created for migration, retired when migration completes. Without a retirement date, the temporary bridge becomes permanent scaffolding.

## Anti-patterns

**ACL as a permanent fixture.** An ACL that exists to isolate a legacy system during migration should have a planned retirement date. If the migration completes and the ACL remains, it becomes technical debt that future developers must work around. The ACL's lifecycle should be documented: created for migration, retired when migration completes.

**ACL that mirrors the external model 1:1.** If every external field maps to an identically named internal field with no transformation, the ACL is adding indirection without adding protection. An ACL is warranted only when the external model differs from the internal model in semantics, structure, or stability.

**Multiple ACLs calling the same external system.** Two teams that independently build ACLs for the same Stripe API will produce two different translations of the same Stripe objects. This creates the inconsistency the ACL was supposed to prevent. There should be exactly one ACL per external system, shared across all internal consumers.

**ACL that hides the external system's failure modes.** Wrapping every external error in a generic `ExternalServiceException` destroys the caller's ability to respond appropriately. A rate-limit error (429) should be retried; an auth error (401) should trigger re-authentication; a validation error (422) should be surfaced to the user. The ACL must preserve enough error semantics for the caller to make the right decision.

**No circuit breaker around the ACL.** If the external system is down, every call through the ACL fails. Without a circuit breaker, the failure cascades to every internal service that depends on the ACL. The circuit breaker stops the cascade and gives the external system time to recover.



- **Directly reuse external DTO**: internal domain directly `import ExternalUser` → external upgrade forces internal change
- **ACL contains business rules**: ACL only translates not decide; rules scattered into ACL loses isolation meaning
- **Two-way dependency**: external reverses to reference internal domain → circular coupling
- **Multiple externals share one ACL**: boundary chaos; each external independent ACL
- **No translation tests**: schema drift without guard
- **ACL contains data storage**: ACL is not a cache layer; persistence in domain layer
- **Over-translation**: translate external model as-is into identical internal shape (pseudo-translation) = meaningless scaffolding

## Related

- [strangler-fig-pattern](./strangler-fig.md) — during strangle, ACL is the new/old system translation bridge
- [one-to-one-mapping-migration-pattern](./one-to-one-mapping-migration.md) — 1:1 mapping is the most plain ACL
- [dual-world-boundary-pattern](../engineering/dual-world-boundary.md) — MV3 dual-world boundary is ACL's frontend form
- [api-gateway-pattern](./api-gateway.md) — gateway is cross-protocol ACL
- [saga-pattern](./saga.md) — saga compensation actions across services need ACL wrapping
- [journeys/i-want-to-integrate-a-third-party-api](../engineering/integrate-a-third-party-api.md) — integrating third-party scenario entry
- [decompose-a-monolith](./decompose-a-monolith.md) — when splitting monolith, ACL isolates new/old callers
