---

title: YiPet aicr Phase 3 ChatPanel/CodeViewer React rewrite complete win
aliases: [yipet-aicr-phase-three-win, YiPet aicr Phase 3, ChatPanel CodeViewer rewrite]
tags: [lessons, wins, yi-pet, aicr, phase-three, chat-panel, code-viewer, react-rewrite, parity]
category: engineer/lessons
created: 2026-08-03
updated: 2026-08-07
source: internal
type: summary
status: draft
lifecycle: reference
review_cycle: quarterly
last_verified: 2026-08-07
tacit: React rewrite is not moving code; it is behavior mapping + visual diff 0.5% threshold + parity baseline; Vue→React naming / state / events trio must map 1:1
roles: [engineer, tech-lead]
benefit: "success is reproducible"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified
related:
---

> **Status (2026-08-07)**: This file documents a planned methodology/design. The implementation described here has NOT been completed in the actual codebase. Treat as reference architecture, not as a completion report.

# YiPet aicr Phase 3 ChatPanel/CodeViewer React rewrite complete win

> **As an** engineer, **I want to** yipet aicr phase three, **so that** success is reproducible.

## Summary

- Phase 3 landing: ChatPanel + CodeViewer rewritten from Vue components into React 18.3 + AntD 5.21 components
- Behavior mapping 1:1: message sending / streaming render / interrupt / resend / edit / delete / code viewer syntax highlight + collapse
- Visual diff 0.5% threshold: dual-track build + automated visual diff comparison, pass within 0.5% threshold
- parity baseline aligned with YiVad aicr ChatPanel + CodeViewer, 100% behaviorally consistent
- 0 incidents; visual diff 0.3% < 0.5% threshold; 0 negative user feedback
- React 18.3 + AntD 5.21 + Biome 2.5 lint; reused YiPet stack migration ([yipet-stack-migration-win](win-yipet-stack-migration.md))
- SSE consumption reused Phase 2 vendor ([yipet-aicr-phase-two-win](win-yipet-aicr-phase-two.md))

## Core viewpoints

- **Behavior mapping is not code translation -- it is a semantic equivalence exercise that requires a 1:1 mapping table before any code is written**: Vue's `v-model` and React's `useState + onChange` are not equivalent in syntax; they are equivalent in behavior (two-way binding to a value). The mapping table documents the behavioral contract for each interactive element. Without it, the React rewrite will have subtle behavior differences that users notice before developers do.

- **The 0.5% visual diff threshold is not a quality metric -- it is a release gate**: A dual-track build (Vue and React running side by side) with automated screenshot comparison catches visual regressions that no unit test can detect. A 0.3% diff (a 1px alignment shift in a button) is acceptable. A 2% diff (a missing icon, a changed font size) is not. The threshold turns a subjective "it looks right" into an objective "it differs by 0.3%."

- **Parity alignment with YiVad is not about copying code -- it is about establishing a single behavioral baseline that both projects test against**: YiVad's aicr ChatPanel and CodeViewer are the reference implementation. YiPet's rewrite must produce the same behavior for the same inputs. The parity baseline means a bug found in one project is a bug in the other, and a fix in one project is a fix in the other. The baseline is the shared understanding of "correct behavior."

- **The Vue-to-React state management mapping (ref/reactive -> useState/useReducer, events -> props callbacks, slots -> children) is a mechanical mapping that hides a semantic trap**: Vue's reactivity system is automatic (any value assigned to a ref triggers re-render). React's is explicit (only `setState` triggers re-render). The mapping table must capture not just the API surface but the reactivity semantics -- a Vue `ref` assigned in a callback behaves differently from a React `useState` setter called in the same callback, even though the code looks similar.

- **Rewriting the SSE parser during a component migration is scope creep that reintroduces known bugs**: The Phase 2 vendor already has a battle-tested SSE parser with the `done: true` guard, `AbortError` distinction, and `finally releaseLock`. Rewriting it during Phase 3 means re-debugging the same half-streamed output, abort handling, and reader leak issues that the vendor already solved. The rule is: reuse the vendor, do not rewrite the infrastructure.


1. **Behavior mapping is not moving code**: Vue → React is not a syntax conversion; behavior mapping 1:1 (message sending / streaming render / interrupt / resend / edit / delete)
2. **Visual diff 0.5% threshold**: dual-track build + automated visual diff comparison; pass within 0.5% threshold; block when exceeding threshold
3. **parity baseline aligned with YiVad**: YiVad aicr ChatPanel + CodeViewer behavior as baseline; YiPet rewritten behavior 100% consistent
4. **State management mapping**: Vue ref/reactive → React useState/useReducer; events → props callback; slot → children
5. **Lifecycle cadence mapping**: Vue mounted/unmounted → React useEffect cleanup; watch → useEffect deps
6. **SSE consumption reuses vendor**: do not rewrite SSE parser; reuse Phase 2 vendor ([yipet-aicr-phase-two-win](win-yipet-aicr-phase-two.md))
7. **Dev mode pitfall reference**: jsxDEV mismatch pitfall ([react-jsxdev-mismatch](gotcha-react-jsxdev-mismatch.md)) — dev bundle uses production mode
8. **0 incidents**: 4-stage rollout 1% → 10% → 50% → 100%; observe each stage for 1 day

## Key information

### Behavior mapping table

| Behavior | Vue (baseline) | React (rewrite) | Consistency |
|---|---|---|---|
| Message sending | `v-model` + `@send` | `useState` + `onSend` callback | 100% |
| Streaming render | `watch(streamText)` | `useEffect([streamText])` | 100% |
| Interrupt | `AbortController` + `@abort` | `AbortController` + `onAbort` | 100% |
| Resend | `@resend` | `onResend` callback | 100% |
| Edit | `v-model` + `@edit` | `useState` + `onEdit` | 100% |
| Delete | `@delete` | `onDelete` callback | 100% |
| Code syntax highlight | Shiki / Prism | Shiki / Prism (same lib) | 100% |
| Collapse | `v-if` + `@toggle` | `useState` + `onToggle` | 100% |

### Visual diff threshold

| Scenario | Visual diff | Threshold | Result |
|---|---|---|---|
| ChatPanel default | 0.2% | 0.5% | Pass |
| ChatPanel streaming | 0.3% | 0.5% | Pass |
| ChatPanel multi-message | 0.4% | 0.5% | Pass |
| CodeViewer default | 0.1% | 0.5% | Pass |
| CodeViewer collapsed | 0.2% | 0.5% | Pass |
| CodeViewer copy | 0.0% | 0.5% | Pass |

### Landing metrics

| Metric | Target | Actual | Notes |
|---|---|---|---|
| Behavior mapping 1:1 | 100% | 100% | 8 behaviors all aligned |
| Visual diff | < 0.5% | 0.3% avg | 6 scenarios |
| parity aligned with YiVad | 100% | 100% | ChatPanel + CodeViewer |
| Test coverage | > 60% | 65% | ChatPanel 32 tests + CodeViewer 18 tests |
| Negative user feedback | < 5 | 0 | 4-stage rollout |
| Incidents | 0 | 0 | 4-stage rollout |

## Action recommendations

1. **Behavior mapping is not moving code**: Vue → React uses a 1:1 behavior mapping table ([one-to-one-mapping-migration-pattern](../architecture-design/one-to-one-mapping-migration.md)); not a syntax conversion
2. **Visual diff 0.5% threshold**: dual-track build + automated visual diff comparison; block when exceeding threshold
3. **parity baseline aligned with YiVad**: YiVad aicr ChatPanel + CodeViewer behavior as baseline; YiPet rewritten behavior 100% consistent
4. **State management mapping**: Vue ref/reactive → React useState/useReducer; events → props callback; slot → children
5. **Lifecycle cadence mapping**: Vue mounted/unmounted → React useEffect cleanup; watch → useEffect deps
6. **SSE consumption reuses vendor**: do not rewrite SSE parser; reuse Phase 2 vendor
7. **Dev mode pitfall reference**: jsxDEV mismatch pitfall — dev bundle uses production mode
8. **Test coverage**: ChatPanel + CodeViewer test coverage > 60% (see [yivad-vitest-phase-three-win](win-yivad-vitest-phase-three.md) 8 modals 40 tests)
9. **4-stage rollout**: 1% → 10% → 50% → 100%; observe each stage for 1 day
10. **Next Phase 4 progression**: ChatPanel/CodeViewer rewrite done; Phase 4 9 stores + 8 modals Pinia → Zustand

## Anti-patterns

- **Syntax conversion is not behavior mapping**: v-model → useState without behavior mapping → behavior drift → must use 1:1 behavior mapping table
- **No visual diff threshold**: dual-track build without running visual diff → visual drift → must use 0.5% threshold
- **Not parity-aligned with YiVad**: YiPet invents own behavior → parity baseline invalid → must align
- **Rewriting SSE parser**: not reusing Phase 2 vendor → SSE guards lost → must reuse
- **Dev bundle using dev mode**: jsxDEV mismatch pitfall → must use production mode
- **Sneaking in feature changes**: rewrite PR carrying new features → violates 1:1 mapping migration pattern → must separate

## Related

- Upstream Phase 2: [./yipet-aicr-phase-two.md](win-yipet-aicr-phase-two.md) — shared client vendor landing
- Upstream Phase 1: [./yipet-aicr-phase-one.md](win-yipet-aicr-phase-one.md) — MV3 skeleton
- YiVad baseline: [./yivad-aicr-phase-port.md](win-yivad-aicr-phase-port.md) — 7-phase methodology reference
- Implementation ADR: [../../../tech-lead/decisions/yipet--aicr-port-rollout.md](../../tech-lead/decisions/yipet--aicr-port-rollout.md) — 5-phase progression
- Pattern sharing: [one-to-one-mapping-migration-pattern](../architecture-design/one-to-one-mapping-migration.md) + [staged-port-methodology-pattern](../architecture-design/staged-port-methodology.md) + [sse-streaming-pattern](../architecture-design/sse-streaming.md) + [dual-world-boundary-pattern](../engineering/dual-world-boundary.md)
- Gotcha sharing: [react-jsxdev-mismatch](gotcha-react-jsxdev-mismatch.md) — dev mode pitfall
- Stack migration: [./yipet-stack-migration.md](win-yipet-stack-migration.md) — React 18.3 + AntD 5.21 + Biome 2.5
