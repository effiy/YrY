---
title: ADR — YiPet aicr port implementation
aliases: [adr-aicr-port-rollout, yi-pet-aicr-port-adr, aicr-extension-rollout]
tags: [adr, yi-pet, aicr, implementation, rollout, chrome-extension, port, mv3]
category: tech-lead/decisions/yipet
created: 2026-08-03
updated: 2026-08-07
source: internal
type: summary
status: draft
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
tacit: false
roles: [tech-lead, engineer]
benefit: "YiPet aicr port rollout decision is documented with phased approach and rollback checkpoints"
acceptance_criteria:
  - "context, decision, and rationale are clearly documented"
  - "options considered with trade-offs are enumerated"
  - consequences and reversal path are stated
related:
  - ../../../engineer/projects/yipet/architecture.md
  - ../../../engineer/projects/yipet/functional-modules.md
  - ../../../engineer/projects/yipet/dev-standards.md
  - ../../../product-manager/projects/yipet--project-management.md
  - ./chrome-manifest-dual-world-boundary.md
  - ./biome-lint-format.md
  - ../yivad/aicr-phase-port.md
  - ../../../engineer/architecture-design/staged-port-methodology.md
  - ../../../engineer/engineering/dual-world-boundary.md
  - ../../../engineer/architecture-design/one-to-one-mapping-migration.md
  - ../../../engineer/architecture-design/sse-streaming.md
  - ../../../engineer/quality-security/harden-supply-chain.md
  - ../../../knowledge-curator/templates/adr.md
---

> **Status (2026-08-07)**: This ADR describes a planned YiPet aicr port that depends on the YiVad aicr port being complete first. As of 2026-08-07, the YiVad aicr port has NOT been landed (`src/views/aicr/` + `src/stores/modules/aicr/` absent from YiVad master). This ADR is a reference architecture for when the dependency is resolved. See BRD-2026-080 for the YiVad aicr implementation plan.

# ADR — YiPet aicr port implementation

> **As a** tech lead, **I want to** aicr port rollout, **so that** decision documented and reversible. 

> Port YiVad aicr to the YiPet browser extension: 5-phase rollout + MV3 dual world boundary + content script injection + background service worker + shared client base-layer reuse + supply chain hardening upfront. 

## 1. Basic info

| Field | Content |
|---|---|
| ADR number | ADR-YiPet-AICR-Port-Rollout |
| Title | YiPet aicr port implementation: 5 phases + MV3 dual world boundary |
| State | Proposed |
| Date | 2026-08-03 |
| Decision maker | YiPet lead |
| Reviewers | CTO, YiVad lead |
| Related projects | YiPet (direct) / YiVad (reference implementation baseline)  |
| Related PR | to be opened (`feat(aicr): phase-1 mv3 skeleton + background service worker`)  |
| Reference baseline | [YiVad aicr 7-phase port](../yivad/aicr-phase-port.md) (already 100% parity)  |
| Review triggers | End of each phase / parity diff > 0.5% / MV3 CSP violation / content script injection failure rate > 1% |

## 2. Background

- **Current state**: YiVad aicr has completed 7-phase port ([yivad-aicr-phase-port win](../../../engineer/lessons/win-yivad-aicr-phase-port.md)) , 9 stores + 8 modals + cards / chart views + CodeViewer + ChatPanel parity 100%. 
- **Need**: The YiPet browser extension must also support aicr (trigger AI code review via right-click / toolbar on any web page) . 
- **Pain points**: 
  - YiVad aicr is Vue 3.5 SFC, YiPet is React 18 + MV3, cannot be reused directly. 
  - MV3 dual world boundary (ISOLATED / MAIN) + content script injection + background service worker = large architecture divergence. 
  - Shared client base layer ([shared-client-design](../../../engineer/engineering/shared-client-design.md)) needs vendoring into YiPet. 
- **Trigger event**: After YiVad aicr port completed, users said "want to trigger on any web page" = YiPet extension landing. 
- **External constraints**: Strict MV3 CSP / cross-origin content script injection limits / short service worker lifecycle. 

## 3. Decision

5-phase rollout (skeleton first, details later; each phase independently launchable + parity test + supply chain hardening upfront) : 

| # | Change | Impact scope | Launch strategy |
|---|---|---|---|
| 1 | MV3 skeleton + background service worker + content script injection + dual world boundary | YiPet `src/background/` + `src/content/` + `src/shared/types/world.ts` | One-shot, hard prerequisite |
| 2 | Shared client base layer vendor: `rpcCall<T>` + `sseStream` + `YiAiError` + error normalization | YiPet `src/shared/api/` | One-shot, follows #1 |
| 3 | ChatPanel + CodeViewer component migration (React 18 rewrite, 1:1 behavior mapping with YiVad)  | YiPet `src/popup/aicr/` + `src/content/aicr/` | Gradual |
| 4 | 9 stores (Pinia -> Zustand) + 8 modal migration | YiPet `src/stores/aicr/` + `src/popup/aicr/modals/` | Follows #3 |
| 5 | Cards / chart views + parity test (YiVad side-by-side) + launch canary | YiPet `src/content/aicr/views/` + `tests/` | Follows #4 |

## 4. Alternatives

| Alternative | Description | Pros | Cons | Conclusion |
|---|---|---|---|---|
| A. 5 phases + MV3 dual world | Current plan | Phase gate; parity verifiable | Long cadence; React rewrite cost | ✅ Selected |
| B. iframe embedding YiVad | Extension pops iframe to load YiVad aicr | 0 rewrite | CSP limits; poor UX | ❌ Rejected |
| C. Wait for YiVad to extract React package | Shared component library | Reuse | Uncontrollable cadence; hard MV3 adaptation | ❌ Rejected |

## 5. Evaluation dimensions

| Dimension | Goal |
|---|---|
| Parity | Behavior diff vs YiVad aicr < 0.5% |
| MV3 boundary | Dual world type branding 100% + envelope-ized |
| Shared client | rpcCall + sseStream contract-consistent with YiVad / YiAi |
| Supply chain | lockfile + audit + min-release-age + allowlist all four |
| Performance | Content script injection < 500ms + service worker cold start < 1s |
| CSP | 0 violations |

## 6. Risks

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| MV3 service worker short lifecycle | High | High | Persist state to chrome.storage + rebuild on wake |
| Content script cross-origin injection failure | Medium | High | manifest `host_permissions` fully declared + retry + monitoring |
| Dual world boundary broken | Medium | High | Type branding + Biome lint forbids `as any` across worlds (see [dual-world-boundary-pattern](../../../engineer/engineering/dual-world-boundary.md))  |
| React 18 + jsxDEV mode mixed use | Medium | Medium | `--mode production` explicit (see [react-jsxdev gotcha](../../../engineer/lessons/gotcha-react-jsxdev-mismatch.md))  |
| Shared client contract drift | Medium | High | Contract test co-build (YiAi / YiVad / YiPet three ends)  |
| Supply chain CVE | Medium | High | Hardening upfront (see [supply-chain-hardening-pattern](../../../engineer/process/harden-supply-chain.md))  |

## 7. Rollback

Each phase rolls back independently: 
- Phase 1 failure: delete background / content skeleton + keep existing extension
- Phase 2 failure: delete shared client vendor + keep Phase 1
- Phase 3 failure: delete ChatPanel / CodeViewer + keep Phase 1-2
- Phase 4 failure: delete store / modal + keep Phase 1-3
- Phase 5 failure: delete cards / chart views + keep Phase 1-4 + parity test baseline retained for retry

## 8. Implementation plan

```
Phase 1 (MV3 skeleton + dual world boundary) ⏳ to be started
  - manifest.json + background service worker + content script
  - shared/types/world.ts type branding
  - shared/types/messages.ts envelope
  - Biome lint forbids as any across worlds
  - estimated 1 week

Phase 2 (shared client vendor) ⏳
  - shared/api/rpc.ts (rpcCall<T>) 
  - shared/api/sse.ts (sseStream + done frame guard + releaseLock) 
  - shared/api/error.ts (YiAiError + error normalization) 
  - contract tests (co-built with YiVad / YiAi) 

Phase 3 (ChatPanel + CodeViewer React rewrite) ⏳
  - 1:1 behavior mapping table (YiVad Vue -> YiPet React) 
  - dual-track verification (YiVad / YiPet side-by-side) 
  - parity diff < 0.5%

Phase 4 (9 stores + 8 modals migration) ⏳
  - Pinia -> Zustand (1:1 mapping) 
  - 8 modal React rewrite

Phase 5 (cards / chart views + parity tests + canary) ⏳
  - cards / chart views React rewrite
  - parity test baseline aligned with YiVad
  - canary 1% -> 10% -> 50% -> 100%
```

## 9. Follow-up tracking metrics

- Parity: behavior diff vs YiVad aicr (< 0.5%) 
- MV3: dual world type branding coverage + envelope-ization rate + CSP violation count
- Shared client: rpcCall / sseStream contract test pass rate
- Performance: content script injection time / service worker cold start time
- Supply chain: pip-audit / npm audit high CVE count = 0; min-release-age >= 7d
- Canary: stream-cut ratio + user feedback bad-case return rate

## 10. Methodology reusability

- 5 phases + parity baseline = staged port methodology (see [staged-port-methodology-pattern](../../../engineer/architecture-design/staged-port-methodology.md)) 
- MV3 dual world boundary = TS type branding + envelope (see [dual-world-boundary-pattern](../../../engineer/engineering/dual-world-boundary.md)) 
- Shared client vendor = per-project vendor + no monorepo (see [shared-client-design](../../../engineer/engineering/shared-client-design.md)) 
- 1:1 behavior mapping + dual-track verification = 1:1 mapping migration (see [one-to-one-mapping-migration-pattern](../../../engineer/architecture-design/one-to-one-mapping-migration.md)) 
- Supply chain hardening upfront = mandatory before introducing new dependencies (see [supply-chain-hardening-pattern](../../../engineer/process/harden-supply-chain.md)) 

## 11. Coupling with other ADRs

- Reference baseline: [YiVad AICR Phase Port ADR](../yivad/aicr-phase-port.md) + [yivad-aicr-phase-port win](../../../engineer/lessons/win-yivad-aicr-phase-port.md)
- Co-build: [ADR-Chrome-Manifest-Dual-World-Boundary](./chrome-manifest-dual-world-boundary.md) (MV3 dual world) + [ADR-Biome-Lint-Format](./biome-lint-format.md) (lint boundary) + [ADR-Vitest-Rollout](../yivad/vitest-rollout.md) (SSE parser contract test co-build) 
- Supply chain: [ADR-LLM-Multi-Provider-Rollout](../yiai/llm-multi-provider-rollout.md) Phase 1 (hardening upfront) + [no-lockfile gotcha](../../../engineer/lessons/gotcha-no-lockfile-supply-chain-risk.md)
- Pitfalls: [react-jsxdev-mismatch gotcha](../../../engineer/lessons/gotcha-react-jsxdev-mismatch.md) + [sse-ondone-guard gotcha](../../../engineer/lessons/gotcha-sse-ondone-guard.md)
- Contract: [shared-client-design-summary](../../../engineer/engineering/shared-client-design.md)

## 12. References

- [ADR template](../../../knowledge-curator/templates/adr.md)
- [YiPet architecture overview](../../../engineer/projects/yipet/architecture.md)
- [YiPet functional modules](../../../engineer/projects/yipet/functional-modules.md)
- [YiPet development standards](../../../engineer/projects/yipet/dev-standards.md)
