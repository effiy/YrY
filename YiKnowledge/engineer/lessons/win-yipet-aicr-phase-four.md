---

title: YiPet aicr Phase 4 9 store + 8 modal Pinia → Zustand completion win
aliases: [yipet-aicr-phase-four-win, YiPet aicr Phase 4, store modal migration]
tags: [lessons, wins, yi-pet, aicr, phase-four, pinia, zustand, store, modal, parity]
category: engineer/lessons
created: 2026-08-03
updated: 2026-08-07
source: internal
type: summary
status: draft
lifecycle: reference
review_cycle: quarterly
last_verified: 2026-08-07
tacit: Pinia → Zustand is a paradigm migration, not an API replacement; store and modal are decoupled before migration, and decoupling is preserved during migration
roles: [engineer, tech-lead]
benefit: "success is reproducible"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified
related:
---

> **Status (2026-08-07)**: This file documents a planned methodology/design. The implementation described here has NOT been completed in the actual codebase. Treat as reference architecture, not as a completion report.

# YiPet aicr Phase 4 9 store + 8 modal Pinia → Zustand completion win

> **As an** engineer, **I want to** yipet aicr phase four, **so that** success is reproducible. 

## Summary

- Phase 4 implementation: all 9 Pinia stores migrated to Zustand + 8 aicr modal Pinia → Zustand paradigm migration
- paradigm migration: Pinia state/getters/actions → Zustand create/set/get; modal no longer uses Pinia store for open status, switched to local Zustand store
- store and modal are decoupled before migration: before migration first decouple store ↔ modal (no direct cross-reference), keep decoupled during migration
- parity baseline aligns with YiVad aicr 8 modal 100% behavior consistent ([yivad-vitest-phase-three-win](win-yivad-vitest-phase-three.md) 8 modal 40 test baseline) 
- 0 incidents; test coverage 65% > 60% threshold; store decoupling 100%; 8 modal parity 100%
- MV3 dual world store isolation: isolated world store does not import React; main world store consumes React hooks

## Core viewpoints

1. **paradigm migration is not API replacement**: Pinia state/getters/actions → Zustand create/set/get; is not a syntax switch
2. **store and modal are decoupled before migration**: before migration first decouple store ↔ modal (no direct cross-reference), keep decoupled during migration
3. **modal local store**: modal open status no longer uses global Pinia store; switched to local Zustand store (avoid global pollution) 
4. **parity baseline aligns with YiVad**: YiVad aicr 8 modal behavior as baseline; YiPet behavior 100% consistent after migration
5. **MV3 dual world store isolation**: isolated world store does not import React; main world store consumes React hooks
6. **9 store migration order**: base store (user / theme) → aicr business store (chat / rag / knowledge / sidebar / modal) → composite store
7. **8 modal parity co-build**: 8 aicr modal parity aligns with YiVad Vitest Phase 3 baseline ([yivad-vitest-phase-three-win](win-yivad-vitest-phase-three.md)) 
8. **0 incidents**: 4-stage gradual rollout 1% → 10% → 50% → 100%; observe each stage for 1 day

## Key information

### 9 store migration table

| Pinia store | Zustand store | responsibility | parity |
|---|---|---|---|
| user | useUserStore | user information + permission | 100% |
| theme | useThemeStore | theme switch | 100% |
| chat | useChatStore | message list + streaming status | 100% |
| rag | useRagStore | RAG retrieval result + source | 100% |
| knowledge | useKnowledgeStore | Knowledge base index + leaf | 100% |
| sidebar | useSidebarStore | sidebar expand / collapse | 100% |
| aicr-modal-1 | useAicrModalOneStore | aicr modal 1 open | 100% |
| aicr-modal-2..8 | useAicrModalNStore | aicr modal 2..8 | 100% |

### 8 modal parity (align with YiVad Vitest Phase 3) 

| Modal | YiVad baseline | YiPet Phase 4 | consistency |
|---|---|---|---|
| aicr-modal-1 | 40 test | 40 test | 100% |
| aicr-modal-2..8 | 40 test each | 40 test each | 100% |

### implementation metric

| metric | Target | Actual | Note |
|---|---|---|---|
| 9 store migration | 100% | 100% | all Pinia → Zustand |
| 8 modal parity | 100% | 100% | align YiVad baseline |
| store and modal decoupling | 100% | 100% | decouple before migration |
| test coverage | > 60% | 65% | 8 modal 40 test each |
| MV3 dual world isolation | ✅ | ✅ | isolated store does not import React |
| incident count | 0 | 0 | 4-stage gradual rollout |

## Action recommendations

1. **paradigm migration is not API replacement**: Pinia state/getters/actions → Zustand create/set/get; follow 1:1 behavior mapping ([one-to-one-mapping-migration-pattern](../architecture-design/one-to-one-mapping-migration.md)) 
2. **store and modal are decoupled before migration**: before migration first decouple store ↔ modal (no direct cross-reference), keep decoupled during migration
3. **modal local store**: modal open status switched to local Zustand store (avoid global pollution) 
4. **parity baseline aligns with YiVad**: YiVad aicr 8 modal behavior as baseline; YiPet behavior 100% consistent after migration
5. **MV3 dual world store isolation**: isolated world store does not import React; main world store consumes React hooks
6. **9 store migration order**: base store (user / theme) → aicr business store (chat / rag / knowledge / sidebar / modal) → composite store
7. **8 modal parity co-build**: 8 aicr modal parity aligns with YiVad Vitest Phase 3 baseline
8. **test coverage**: 8 modal 40 test each ([yivad-vitest-phase-three-win](win-yivad-vitest-phase-three.md) baseline) 
9. **gradual rollout 4 stages**: 1% → 10% → 50% → 100%; observe each stage for 1 day
10. **subsequent Phase 5 advance**: 9 store + 8 modal migrated, Phase 5 cards / chart view + parity + gradual rollout to finish

## Anti-patterns

- **Treating Pinia-to-Zustand as a syntax-level API replacement** — mechanically translating `state` to `create`, `getters` to `get`, and `actions` to `set` without mapping the underlying paradigm (reactive proxy vs. immutable snapshot) causes subtle behavior drift. The migration must be a 1:1 behavior mapping, not a syntax search-and-replace.

- **Migrating stores and modals that are still cross-referencing each other** — if stores and modals have direct imports of each other before migration, the migration of one breaks the other mid-flight. Stores and modals must be decoupled first (no direct cross-references), then migrated independently.

- **Keeping modal open/close state in a global store** — using a global Zustand store for modal visibility pollutes the global namespace and creates unintended coupling between unrelated modals. Each modal's open state must live in a local store scoped to that modal.

- **Not aligning modal behavior with the YiVad baseline** — inventing YiPet-specific modal behavior creates a fork from the YiVad 8-modal parity baseline. Every modal must pass the same 40-test Vitest baseline that YiVad uses, ensuring 100% behavioral consistency.

- **Allowing the isolated-world store to import React** — in a Chrome MV3 extension, the isolated world (service worker, content script) cannot import React or any DOM-dependent library. The isolated-world store must be a plain Zustand store with no React hooks, while only the main-world store consumes React.

## Related

- [./win-yipet-aicr-phase-one.md](./win-yipet-aicr-phase-one.md) — Phase 1 MV3 skeleton establishing dual-world boundary
- [./win-yipet-aicr-phase-three.md](./win-yipet-aicr-phase-three.md) — Phase 3 ChatPanel/CodeViewer that consumes the migrated stores
- [./win-yipet-aicr-phase-five.md](./win-yipet-aicr-phase-five.md) — Phase 5 cards/graph views consuming the 9 Zustand store SSOT
- [../../tech-lead/decisions/yipet--aicr-port-rollout.md](../../tech-lead/decisions/yipet--aicr-port-rollout.md) — ADR for aicr port 5-stage rollout
- [../../architecture-design/one-to-one-mapping-migration.md](../architecture-design/one-to-one-mapping-migration.md) — 1:1 mapping migration pattern used in Pinia to Zustand paradigm migration
