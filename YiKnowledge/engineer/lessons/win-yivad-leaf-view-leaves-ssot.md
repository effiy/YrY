---

title: YiVad leaf view layer 28 leaves SSOT technique
aliases: [yivad-leaf-view-leaves-ssot-win, leaves-ts-ssot, leaf-view-pattern]
tags: [methodology, YiVad, leaf, view-layer, SSOT, leaves-ts, staticRouter, knowledge-base]
category: engineer/lessons
created: 2026-08-03
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
status: draft
lifecycle: reference
review_cycle: quarterly
tacit: true
roles: [engineer, tech-lead]
benefit: "success is reproducible"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified
related:
---

> **Status (2026-08-07)**: This file documents a planned methodology/design. The implementation described here has NOT been completed in the actual codebase. Treat as reference architecture, not as a completion report.

# YiVad leaf view layer 28 leaves SSOT technique

> **As an** engineer, **I want to** yivad leaf view leaves ssot, **so that** success is reproducible.

> YiVad knowledge base leaf view layer uses `leaves.ts` as SSOT; 28 leaves x (index + detail) two items each wrapped by a single-line wrapper, all packaged as `KnowledgeLeafList` / `KnowledgeLeafDetail`; `staticRouter.ts` 56 literal routes are auto-derived from `leaves.ts`; to change a leaf item, only one place needs editing. This technique can be reused for all "multiple leaves / multiple types / multiple views" page architectures.

## Summary

- **SSOT = leaves.ts**: all leaf metadata (path / title / category / parent node) is centralized in `leaves.ts`; index.vue and detail.vue are all single-line wrapper packages; changing a leaf touches only one place.
- **Routing derived from SSOT**: `staticRouter.ts` 56 literal routes are auto-derived from `leaves.ts`; not hand-written.
- **Wrapper single line**: each leaf's index.vue and detail.vue are all single-line `<KnowledgeLeafList leaf="xxx" />` or `<KnowledgeLeafDetail leaf="xxx" />`; the generic component is the SSOT consumer.
- **Key success factors**: SSOT in front + generic component behind + derived routing + single-line wrapper + CI validation
- **Quantitative effect**: 28 leaves x 2 wrappers = 56 files, all single-line; changing a leaf only touches `leaves.ts`; routing 0 hand-written

## Core viewpoints

- **SSOT in front, generic component behind** — `leaves.ts` is metadata; `KnowledgeLeafList` / `KnowledgeLeafDetail` are generic components; wrappers are the connecting layer; to change leaf metadata, only touch SSOT; the generic component does not move.
- **Routing derived from SSOT > hand-written** — 56 literal routes derived from `leaves.ts`; not hand-written; no leakage; CI validation.
- **Single-line wrapper = thinnest connecting layer** — wrappers do not write business logic; they only pass `leaf="xxx"` to the generic component; the generic component consumes SSOT.
- **CI validates SSOT-routing consistency** — no drift allowed between `leaves.ts` and `staticRouter.ts`; CI validates consistency.
- **Change a leaf in only one place** — adding / deleting / modifying leaf metadata all only touch `leaves.ts`; wrapper + routing + generic component all stay unchanged.

## Key information

### Background

The YiVad knowledge base leaf view layer needs to cover 28 leaf items (subdirectories under 9 major YiKnowledge categories); each leaf item needs an index (list) + detail two views; pain points:

- Hand-writing 28 x 2 = 56 view files, copy-paste is error-prone
- Hand-writing 56 literal routes is leak-prone
- Adding / deleting a leaf requires changing N places
- Generic component and leaf metadata are coupled; one change breaks N places

### 4 stage split

| Stage | Content |
|---|---|
| 1 | `leaves.ts` SSOT: all leaf metadata centralized (path / title / category / parent node) |
| 2 | `KnowledgeLeafList` / `KnowledgeLeafDetail` generic component: consumes SSOT |
| 3 | 28 leaves x 2 wrappers: single-line `<KnowledgeLeafList leaf="xxx" />` or `<KnowledgeLeafDetail leaf="xxx" />` |
| 4 | `staticRouter.ts` 56 literal routes: auto-derived from `leaves.ts` |

### Key success factors

1. **SSOT in front**: all leaf metadata centralized in `leaves.ts`; no need to change generic component or wrapper
2. **Generic component behind**: `KnowledgeLeafList` / `KnowledgeLeafDetail` consume SSOT; do not hold leaf metadata
3. **Single-line wrapper**: thinnest connecting layer; only passes `leaf="xxx"` to the generic component
4. **Routing derived from SSOT**: 56 literal routes not hand-written; CI validates SSOT-routing consistency
5. **CI validates SSOT-routing consistency**: no drift between `leaves.ts` and `staticRouter.ts`; CI runs consistency check
6. **Change a leaf only in `leaves.ts`**: add / delete / modify leaf metadata only in SSOT; wrapper + routing + generic component all unchanged

### Quantitative effect

| Metric | Before launch | After launch | Change |
|---|---|---|---|
| leaf view file count | 56 (all hand-written) | 56 (all single-line wrappers) | structure zeroed |
| routing literal hand-written | 56 hand-written | 0 hand-written (derived from SSOT) | -56 |
| add-leaf change points | N places | 1 place (`leaves.ts`) | -(N-1) |
| CI validates SSOT-routing consistency | No | Yes | — |
| generic component reuse rate | — | 28 leaves x 2 views = 56 reuses | — |
| Post-launch P0 bugs | — | 0 | — |

### Reusable experience

- **SSOT decision model**: multiple leaves / multiple types / multiple views = SSOT in front + generic component behind + single-line wrapper + derived routing + CI validation
- **Single-line wrapper = thinnest connecting layer principle**: wrappers do not write business logic; only pass props to generic component
- **Routing derived from SSOT > hand-written**: hand-writing is leak-prone and hard to maintain; derived + CI validation keeps consistency
- **Change a leaf in only one place principle**: add / delete / modify leaf metadata only in SSOT; wrapper + routing + generic component all unchanged
- **CI validates SSOT-routing consistency**: no drift allowed between SSOT and derived output; CI validation is a hard constraint

### Follow-up evolution

- Extract generic component to npm private package: assess after stabilization (same cadence as [shared-client-design](../engineering/shared-client-design.md))
- Knowledge graph: `llama_index.graph` + `KnowledgeGraphIndex`; add "entity relation graph" to leaf view layer (aligned with [llama_index evolution](../../ai-engineer/platform/llama-index-evolution.md) §YiVad)
- "Ask RAG about this leaf" button: call `/rag` with `scope=category/leaf/` (aligned with [yiai-rag-hybrid-retrieval win](win-yiai-rag-hybrid-retrieval.md) §scope filter)
- Leaf metadata visualization: YiVad adds "leaf metadata dashboard" showing current SSOT status
- Vitest tests SSOT-routing consistency: co-build with [ADR Vitest](../../tech-lead/decisions/yivad--vitest-introduction.md); CI runs consistency tests

## Action recommendations

1. For multi-leaf / multi-type / multi-view architectures, first define SSOT (`leaves.ts` centralizing metadata), then write generic component, finally single-line wrapper.
2. Derive routing from SSOT, do not hand-write; CI validates SSOT-routing consistency.
3. Single-line wrapper = thinnest connecting layer; only passes props to generic component; do not write business logic.
4. Add / delete / modify leaf metadata only in SSOT; wrapper + routing + generic component all unchanged.
5. CI runs SSOT-routing consistency tests (co-build with [ADR Vitest](../../tech-lead/decisions/yivad--vitest-introduction.md)).
6. Stabilize generic component for 1 quarter before extracting to npm private package; do not extract too early.
7. When adding "ask RAG about this leaf" button, call `/rag` with `scope=category/leaf/` (aligned with [yiai-rag-hybrid-retrieval win](win-yiai-rag-hybrid-retrieval.md)).

## Anti-patterns

- **Hand-writing 56 view files individually** — copy-pasting view files for each leaf creates N places to change when a leaf is added, removed, or renamed. The single-line wrapper pattern (`<KnowledgeLeafList leaf="xxx" />`) means each view file is one line and never needs editing for metadata changes.

- **Hand-writing 56 literal routes** — manually maintaining route entries for every leaf is leak-prone and guarantees drift between the route table and the actual leaf metadata. Routes must be auto-derived from `leaves.ts` so that adding a leaf to the SSOT automatically creates its routes.

- **Putting business logic in the wrapper files** — the wrapper is the thinnest possible connecting layer; if it grows business logic, changing a leaf means changing the wrapper too. The wrapper must only pass `leaf="xxx"` to the generic component, with zero additional logic.

- **Embedding leaf metadata inside the generic component** — if `KnowledgeLeafList` or `KnowledgeLeafDetail` hardcodes leaf titles, paths, or categories, the component is no longer generic and must be modified for every leaf change. The generic component must consume metadata from `leaves.ts` exclusively.

- **Omitting CI validation of SSOT-routing consistency** — without a CI check that `leaves.ts` and `staticRouter.ts` are in sync, drift is inevitable. CI must assert that every leaf in the SSOT has a corresponding route and that no orphan routes exist.

## Related

- [./win-yivad-vitest-phase-four.md](./win-yivad-vitest-phase-four.md) — Vitest Phase 4 CI testing of SSOT-routing consistency
- [./win-yry-vite-to-rsbuild-migration.md](./win-yry-vite-to-rsbuild-migration.md) — YiVad Rsbuild migration that enabled the leaf view build pipeline
- [./win-yiai-rag-hybrid-retrieval.md](./win-yiai-rag-hybrid-retrieval.md) — RAG scope filter enabling per-leaf Q&A referenced in follow-up evolution
- [../../architecture-design/ssot-view-layer.md](../architecture-design/ssot-view-layer.md) — SSOT view layer pattern
- [../../tech-lead/decisions/yivad--vitest-introduction.md](../../tech-lead/decisions/yivad--vitest-introduction.md) — ADR for Vitest CI testing of SSOT-routing consistency
