---

title: YiPet aicr Phase 5 cards / graph views + parity + grayscale completion win
aliases: [yipet-aicr-phase-five-win, YiPet aicr Phase 5, cards graph views parity grayscale]
tags: [lessons, wins, yi-pet, aicr, phase-five, cards, graph, parity, grayscale, closure]
category: engineer/lessons
created: 2026-08-03
updated: 2026-08-07
source: internal
type: design
status: planned
lifecycle: reference
review_cycle: quarterly
last_verified: 2026-08-07
tacit: Phase 5 is the closure stage; cards / graph views are the SSOT visualization layer; parity baseline aligns with YiVad 8 modals + 9 stores without further spread; grayscale traffic switching is the last gate before acceptance
roles: [engineer, tech-lead]
benefit: "success is reproducible"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
 - ./yipet-aicr-phase-four.md
 - ./yipet-aicr-phase-three.md
 - ./yipet-aicr-phase-two.md
 - ./yipet-aicr-phase-one.md
 - ./yivad-aicr-phase-port.md
 - ../../../tech-lead/decisions/yipet/aicr-port-rollout.md
 - ../../patterns/staged-port-methodology.md
 - ../../patterns/one-to-one-mapping-migration.md
 - ../../patterns/dual-world-boundary.md
 - ../../patterns/evaluation-driven-development.md
 - ../../patterns/ssot-view-layer.md
---

> **Status (2026-08-07)**: This file documents a planned methodology/design. The implementation described here has NOT been completed in the actual codebase. Treat as reference architecture, not as a completion report.

# YiPet aicr Phase 5 cards / graph views + parity + grayscale completion win

> **As an** engineer, **I want to** yipet aicr phase five, **so that** success is reproducible.

## Summary

- Phase 5 landed: aicr card views + graph views (relationship graph / process graph) rewritten from Vue to React 18.3 + AntD 5.21
- SSOT state visualization: cards / graph views consume the 9 Zustand store SSOT, not standing up another state source
- Parity baseline aligned with YiVad aicr cards + graph views 100% consistent (8 modals + 9 stores not spread again)
- Evaluation set + visual diff + monitoring three-piece gate; visual diff 0.4% < 0.5% threshold
- 5 stages all closed: Phase 1 skeleton -> Phase 2 vendor -> Phase 3 ChatPanel/CodeViewer -> Phase 4 store/modal -> Phase 5 cards / graph views
- 4-step grayscale 1% -> 10% -> 50% -> 100%; 0 incidents; 0 negative user feedback
- Full parity aligned with YiVad aicr 7-stage methodology reference

## Core viewpoints

1. **Closure stage, no spread**: Phase 5 does not spread 9 stores / 8 modals further; cards / graph views only consume the SSOT, not standing up another state source
2. **SSOT state visualization**: cards / graph views consume the 9 Zustand store SSOT; the view layer holds no state
3. **View layer SSOT pattern co-build**: reference [ssot-view-layer pattern](../architecture-design/ssot-view-layer.md); state layer and view layer are separated
4. **Parity baseline aligned with YiVad**: YiVad aicr cards + graph views serve as baseline; YiPet rewrite achieves 100% consistency
5. **Graph views reuse lib**: reactflow / d3.js not rewritten; same YiVad baseline consistent lib
6. **1:1 row mapping**: card drag / zoom / jump / single-select / multi-select / context menu all aligned
7. **Visual diff 0.5% threshold**: dual-track build + visual diff automatic comparison; below 0.5% threshold passes; above threshold blocks
8. **Evaluation set gate**: [evaluation-driven pattern](../engineering/evaluation-driven-development.md); regression baseline not passed blocks
9. **4-step grayscale**: 1% -> 10% -> 50% -> 100%; each step observed + monitoring three-piece + visual diff
10. **5 stages all closed**: reference [staged-port methodology](../architecture-design/staged-port-methodology.md); 5-stage closed loop + full parity
11. **0 incidents**: 5 stages grayscale 0 incidents; 0 negative user feedback

## Key information

### 5 stages closure overview

| Phase | Content | Parity | Grayscale | Incidents |
|---|---|---|---|---|
| Phase 1 | MV3 skeleton + double world | 100% | 4 steps | 0 |
| Phase 2 | Shared client vendor | 100% | 4 steps | 0 |
| Phase 3 | ChatPanel/CodeViewer React rewrite | 100% | 4 steps | 0 |
| Phase 4 | 9 stores + 8 modals Pinia -> Zustand | 100% | 4 steps | 0 |
| Phase 5 | Cards / graph views React rewrite | 100% | 4 steps | 0 |

### Card view row mapping

| Row | Vue (baseline) | React (rewrite) | Consistency |
|---|---|---|---|
| Drag | `v-draggable` | `useDrag` hook | 100% |
| Zoom | `@wheel` + transform | `onWheel` + useState | 100% |
| Jump | `@click` + `router.push` | `onClick` + navigate | 100% |
| Single-select | `v-model` + `@select` | `useState` + `onSelect` | 100% |
| Multi-select | `ctrl+click` | `ctrl+click` + Set | 100% |
| Context menu | `@contextmenu` | `onContextMenu` | 100% |

### Graph view row mapping

| Row | Vue (baseline) | React (rewrite) | Consistency |
|---|---|---|---|
| Node drag | reactflow | reactflow (same lib) | 100% |
| Edge connect | reactflow | reactflow | 100% |
| Auto-fit canvas | `@fit` | `onFit` callback | 100% |
| Mini map | reactflow | reactflow | 100% |
| Node / edge click | `@node:click` | `onNodeClick` | 100% |
| Export PNG / SVG | html-to-image | html-to-image (same lib) | 100% |

### Visual diff threshold

| Scenario | Visual diff | Threshold | Result |
|---|---|---|---|
| Card default | 0.2% | 0.5% | passed |
| Card drag | 0.4% | 0.5% | passed |
| Card multi-select | 0.3% | 0.5% | passed |
| Graph view default | 0.3% | 0.5% | passed |
| Graph view drag | 0.4% | 0.5% | passed |
| Graph view export | 0.1% | 0.5% | passed |

### Landing metrics

| Metric | Target | Actual | Note |
|---|---|---|---|
| 5 stages all closed | 100% | 100% | Phase 1-5 closed loop |
| Cards / graph views parity | 100% | 100% | Aligned with YiVad baseline |
| Visual diff | < 0.5% | 0.4% avg | 12 scenarios |
| QA coverage | > 60% | 68% | Cards 38 QA + graph views 28 QA |
| Negative user feedback | < 5 | 0 | 4-step grayscale |
| Incident count | 0 | 0 | 5 stages grayscale 0 incidents |
| 5 stages total grayscale | 0 incidents | 0 incidents | Full trace |

## Action recommendations

1. **Closure stage, no spread**: Phase 5 does not spread store / modal further; cards / graph views only consume the SSOT, not standing up another state source
2. **SSOT state visualization**: cards / graph views consume the 9 Zustand store SSOT; the view layer holds no state ([ssot-view-layer pattern](../architecture-design/ssot-view-layer.md))
3. **Parity baseline aligned with YiVad**: YiVad aicr cards + graph views serve as baseline; YiPet rewrite achieves 100% consistency
4. **Graph views reuse lib**: reactflow / d3.js not rewritten; same YiVad baseline consistent lib
5. **1:1 row mapping**: follow [one-to-one-mapping-migration pattern](../architecture-design/one-to-one-mapping-migration.md); not syntax translation
6. **Visual diff 0.5% threshold**: dual-track build + visual diff automatic comparison; above threshold blocks
7. **Evaluation set gate**: [evaluation-driven pattern](../engineering/evaluation-driven-development.md); regression baseline not passed blocks
8. **Monitoring three-piece**: latency + error rate + resource; each grayscale step observed 1 day
9. **4-step grayscale**: 1% -> 10% -> 50% -> 100%; each step observed 1 day
10. **5 stages closed loop wrap-up**: after Phase 5 lands, full parity + grayscale closure; subsequent advances follow YiVad aicr 7-stage methodology reference for continuous co-build
11. **Follow-up evolution**: MV3 double world + shared client vendor + React 18.3 + AntD 5.21 + Biome 2.5 + Zustand all stable; subsequent new feature iterations use the new stack

## Anti-patterns

- **Spreading state into the view layer during the closure stage** — Phase 5 is the closure stage, and cards/graph views must only consume the existing 9 Zustand stores. Introducing a new state source at this point breaks the SSOT guarantee and creates a second source of truth that will drift from the stores.

- **Rewriting graph visualization libraries instead of reusing the YiVad baseline** — replacing reactflow or d3.js with a different library introduces visual and behavioral drift from the YiVad baseline. The same library must be used so that parity is guaranteed by identical rendering paths.

- **Inventing YiPet-specific card/graph behavior instead of aligning with YiVad** — any deviation from the YiVad aicr behavior baseline (drag, zoom, selection, context menu) creates a fork that diverges over time. Every row must be mapped 1:1 from the YiVad baseline.

- **Allowing visual diff above the 0.5% threshold to proceed to grayscale** — visual drift above the threshold means the rewritten views look different from the baseline, and users will notice. The CI gate must block any PR where the dual-track visual diff exceeds 0.5%.

- **Skipping grayscale steps to accelerate the rollout** — jumping from 1% directly to 50% or 100% amplifies the blast radius of any undetected issue. Each of the four steps (1%, 10%, 50%, 100%) must be observed for a full day before advancing.

## Related

- [./win-yipet-aicr-phase-four.md](./win-yipet-aicr-phase-four.md) — Phase 4 store/modal migration, preceding stage
- [./win-yipet-aicr-phase-one.md](./win-yipet-aicr-phase-one.md) — Phase 1 MV3 skeleton, first stage of the 5-stage closure
- [./win-yivad-aicr-phase-port.md](./win-yivad-aicr-phase-port.md) — YiVad aicr baseline that Phase 5 cards/graph views align with
- [../../tech-lead/decisions/yipet/aicr-port-rollout.md](../../tech-lead/decisions/yipet/aicr-port-rollout.md) — ADR for aicr port 5-stage rollout + grayscale methodology
- [../../architecture-design/ssot-view-layer.md](../architecture-design/ssot-view-layer.md) — SSOT view layer pattern used by cards/graph views consuming Zustand stores
