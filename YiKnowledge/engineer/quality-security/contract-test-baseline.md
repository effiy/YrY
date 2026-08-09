---
title: Contract test baseline pattern
aliases: [contract-test-baseline-pattern, contract-test-pattern, bidirectional-contract-tests]
tags: [methodology, engineering-patterns, contract-tests, openapi, parity, ci-gate]
category: engineer/quality-security
created: 2026-08-03
updated: 2026-08-03
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-03
tacit: contract is a bidirectional baseline; OpenAPI derives types + CI diff blocks; contract SSOT in design spec mirror copy; contract changes go through RFC + ADR
roles: [engineer, tech-lead, oncall-sre]
benefit: "API contracts between services are verified through automated tests, catching breaking changes before deployment"
acceptance_criteria:
  - "pattern name, problem statement, and solution approach are all described"
  - "trade-offs and when-not-to-use-this-pattern are explicitly stated"
  - at least one concrete example or code snippet is provided
related:
  - ../lessons/win-yivad-shared-client-vendor.md
  - ../lessons/win-yivad-vitest-phase-four.md
  - ../lessons/win-yiai-pytest-phase-four.md
  - ../lessons/win-yipet-aicr-phase-two.md
---

# Contract test baseline pattern

> **As an** engineer, **I want to** contract test baseline, **so that** pattern applied consistently.

## Summary

- Contract test is a bidirectional baseline; not a one-sided contract; both directions must be 100% consistent to pass
- OpenAPI derives types: openapi.json → TS types; CI diff blocks; contract changes must sync
- Contract SSOT in design spec mirror copy: `shared-client-design-summary` design spec SSOT; contract changes go through RFC + ADR
- Field name hard constraint: filter / target_file / cname / module_name / method_name unchanged
- SSE stream follows contract baseline: 32 SSE parser tests + 20 contract cases bidirectional run
- Three projects synced: YiAi endpoint / YiVad vendor / YiPet vendor; contract changes must sync across all three projects
- Don't rewrite parser: reuse baseline; don't establish another contract source

## Applicable scenarios

Cross-project collaboration (e.g. YiAi endpoint ↔ YiVad vendor ↔ YiPet vendor); scenarios requiring contract stability; new projects connecting to existing contract infrastructure; contract changes requiring sync across multiple parties; any scenario requiring "the other party's contract changes don't impact me".

## Core points

### 1. Bidirectional contract

Contract test is not a one-sided contract; it's a bidirectional baseline.

- YiAi endpoint runs YiVad vendor's 20 contract cases
- YiVad vendor runs YiAi endpoint's 20 contract cases
- Both directions 100% consistent to pass; inconsistencies block

### 2. OpenAPI derives types

Contract SSOT is in FastAPI openapi.json; TS types derived from openapi.json; CI diff blocks.

- YiAi endpoint exposes openapi.json
- YiVad / YiPet vendors derive TS types from openapi.json
- OpenAPI changes must sync; otherwise → CI diff blocks

### 3. Contract SSOT in design spec mirror copy

Contract SSOT is not in endpoint code nor vendor code; it's in `shared-client-design-summary` design spec mirror copy.

- Design spec SSOT: contract source of truth
- Endpoint code mirrors design spec
- Vendor code mirrors design spec
- All three aligned to design spec

### 4. Field name hard constraint

Field name changes = breaking contract. Hard-constrained fields:

- `filter` (not `query`)
- `target_file` (not `path`)
- `cname`
- `module_name`
- `method_name`

### 5. SSE stream follows contract baseline

SSE stream doesn't rewrite parser; follows contract baseline.

- SSE parser 32 tests (YiVad Vitest Phase 4 baseline)
- SSE stream 20 contract cases bidirectional run
- Contract baseline 100% consistent

### 6. Three projects synced

Contract changes must sync across three projects.

- YiAi endpoint
- YiVad vendor
- YiPet vendor
- Three-project sync through RFC + ADR

### 7. CI 4-tier thresholds

| Tier | Threshold | Behavior |
|---|---|---|
| 1 | 0% < delta < 5% | Pass |
| 2 | -5% < delta < 0% | Warning |
| 3 | -10% < delta < -5% | Block + notify |
| 4 | delta < -10% | Block + notify + rollback |

## Anti-patterns

- **One-sided contract**: only one party runs contract → other party drifts → must be bidirectional
- **No OpenAPI-derived types**: hand-written types → drift → must derive + CI diff block
- **No three-project sync**: contract change only synced to one project → other projects drift → must sync all three
- **Quietly change field names**: change field names without notice → breaks contract → must go through RFC + ADR
- **Rewrite SSE parser**: don't reuse contract baseline → guards lost → must reuse
- **Contract SSOT scattered across projects**: contract SSOT not in design spec → high maintenance cost → must centralize in design spec
- **No CI diff block**: OpenAPI changes not blocked → types drift → must block
- **Contract changes bypass RFC**: quietly change contract → breaks baseline → must go through RFC + ADR

## Co-built

- YiAi pytest Phase 4 contract tests: [../lessons/wins/yiai-pytest-phase-four.md](../lessons/win-yiai-pytest-phase-four.md)
- YiVad shared client vendor: [../lessons/wins/yivad-shared-client-vendor.md](../lessons/win-yivad-shared-client-vendor.md)
- YiVad Vitest Phase 4 SSE parser: [../lessons/wins/yivad-vitest-phase-four.md](../lessons/win-yivad-vitest-phase-four.md)
- YiPet aicr Phase 2 shared client vendor: [../lessons/wins/yipet-aicr-phase-two.md](../lessons/win-yipet-aicr-phase-two.md)
- Design spec SSOT: [../processes/shared-client-design.md](../engineering/shared-client-design.md)
- Vendor landing tracking: [../processes/shared-client-vendor-rollout.md](../engineering/shared-client-vendor-rollout.md)
- Companion patterns: [evaluation-driven-development-pattern](../engineering/evaluation-driven-development.md) + [rpc-envelope-pattern](../architecture-design/rpc-envelope.md) + [sse-streaming-pattern](../architecture-design/sse-streaming.md) + [supply-chain-hardening-pattern](../process/harden-supply-chain.md) + [one-to-one-mapping-migration-pattern](../architecture-design/one-to-one-mapping-migration.md)
