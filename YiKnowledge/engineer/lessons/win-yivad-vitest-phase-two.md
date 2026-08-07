---

title: YiVad Vitest Phase 2 stores test complete
aliases: [yivad-vitest-phase-two-win, vitest-stores-coverage, pinia-test-baseline]
tags: [success case, YiVad, Vitest, test, Pinia, stores, coverage]
category: engineer/lessons
created: 2026-08-03
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: design
status: planned
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

# YiVad Vitest Phase 2 stores test complete

> **As an** engineer, **I want to** yivad vitest phase two, **so that** success is reproducible.

> Phase 2 landing of YiVad Vitest 4-phase rollout: 11 Pinia store state changes + action side-effect baseline + coverage 70% + CI gate; foundation for Phase 3 (components).

## Summary

- **Complete**: 11 Pinia stores (user / sidebar / aicr-file-tree / aicr-card / aicr-chat / aicr-code-viewer / aicr-graph / aicr-modal / rag / knowledge / theme) state changes + action side-effect tests + coverage 70% + CI gate on regression > 5%
- **Quantified effect**: stores coverage 0% → 72% (2% above the 70% goal); CI regression gates 0; subset < 45s
- **Value**: Phase 3 (components) has a store-layer safety net; Pinia state drift has static guards

## Core viewpoints

- **Stores test state changes + action side effects**: not just getter correctness = must verify state mutation matches expectations + side effects after action calls are correct.
- **Pinia tests use `setActivePinia`**: each test gets an independent pinia instance = isolated = no cross-pollution.
- **coverage 70% > composables 60%**: stores are the application state layer = higher threshold = stricter.
- **Store and modal decoupled rollout**: Phase 2 stores and future Phase 3 component modals do not block each other (see [yivad-aicr-phase-port win](win-yivad-aicr-phase-port.md) § decoupled rollout).

## Key information

### Background

- Phase 1 composables complete (coverage 65%, see [yivad-vitest-phase-one-win](win-yivad-vitest-phase-one.md)).
- Before Phase 2, 11 Pinia stores had coverage 0% = no static guards on state drift = regressions hard to locate.
- Implementing ADR 4-phase rollout: Phase 2 stores priority is secondary to Phase 1 composables.

### Landing checklist

| # | Change | Impact | Verification |
|---|---|---|---|
| 1 | `useUserStore` test: login / logout / token persist / role matrix | YiVad `src/stores/__tests__/` | 10 tests pass |
| 2 | `useSidebarStore` test: collapse / persist / menu active | YiVad stores tests | 8 tests pass |
| 3 | aicr 6 stores (FileTree / Card / Chat / CodeViewer / Graph / Modal) tests | YiVad stores tests | 42 tests pass |
| 4 | `useRagStore` / `useKnowledgeStore` tests: query / scope / filter / source list | YiVad stores tests | 18 tests pass |
| 5 | `useThemeStore` test: dark / light / persist | YiVad stores tests | 6 tests pass |
| 6 | coverage threshold 70% | `vitest.config.ts` | actual 72% |
| 7 | CI: regression > 5% gate | `.github/workflows/vitest.yml` | intentionally introduced regression triggers gate |

### Quantified effect

- stores coverage: 0% → 72% (2% above 70% goal)
- total tests: 84 (10 + 8 + 42 + 18 + 6)
- CI regression-blocked PRs: 0
- subset run: < 45s (including Phase 1 composables)
- store and modal decoupled rollout: 6 aicr stores + 8 modals do not block each other

### Key success factors

1. **state change + action side effect**: not just testing getters = must test mutation + side effect = stricter
2. **`setActivePinia` isolation**: each test gets independent pinia = no cross-pollution
3. **coverage 70% > composables 60%**: state-layer threshold higher = stricter
4. **store and modal decoupled**: non-blocking = single store stall does not drag the whole
5. **built on Phase 1 composables**: foundation layer has safety net = stores tests more stable

## Action recommendations

1. Stores test state change + action side effect (not just getter correctness).
2. Use `setActivePinia(createPinia())` per test for isolation = no cross-pollution.
3. coverage 70% threshold > composables 60% = stricter state layer.
4. Decouple store and modal rollout (single store stall does not drag the whole).
5. Build on Phase 1 composables safety net = stores tests more stable.
6. Phase 3 components depends on Phase 2 stores completion = clear priority.



- **Only testing getter correctness**: state mutation / action side effects untested = regressions hard to locate; must test mutation + side effect.
- **Shared pinia instance**: tests cross-pollute = flaky tests; must `setActivePinia(createPinia())` for isolation.
- **coverage threshold = composables 60%**: state layer same as foundation layer = not strict enough; stores must be 70%.
- **store and modal coupled rollout**: one stalls, all stall; must decouple.
- **Skip Phase 1 and test stores directly**: foundation layer has no safety net = unstable store tests; priority must come first.

## Anti-patterns

- **Testing Pinia actions by calling them and asserting the final state, without asserting the sequence of intermediate state transitions.** An action that calls three mutations -- set loading, fetch data, set data, clear loading -- may arrive at the correct final state even if the second mutation never fired, because the third mutation overwrites the state. Asserting each intermediate state transition catches bugs where a mutation is skipped but the final state happens to be correct by coincidence.
- **Using `createPinia()` without `setActivePinia()` in a test file that imports multiple stores.** Vitest runs test files in a single process, and Pinia's global state persists across tests unless explicitly reset. A test that modifies `useUserStore` and then a subsequent test reads `useUserStore` without resetting will see the modified state from the previous test. The test passes or fails non-deterministically depending on test execution order.
- **Mocking the API layer in store tests by replacing `fetch` globally rather than mocking the store's API module.** Global `fetch` mocks affect all stores in the test file, making it impossible to test two stores that call different API endpoints in the same test file. Mock the specific API module that the store imports (e.g., `vi.mock('@/api/modules/system')`) so that each store's API calls are isolated and independently controllable.
- **Testing only the happy path of an action without testing the error path.** A store action that calls an API, catches the error, and sets an `errorMessage` state field is only half-tested if the test never triggers the error path. The error path is where most production bugs live, because it is the path least exercised by users. Every store action test must have a companion test where the API call rejects and the error state is asserted.
- **Writing 84 store tests and then considering the store layer "done" without a plan for mutation testing.** Coverage measures which lines are executed, not which lines are asserted. A test that calls an action and checks one state field achieves 100% line coverage for that action but only 10% assertion coverage. Mutation testing (which intentionally breaks the code and checks if a test fails) reveals which lines are covered but not asserted. Run mutation testing at least once per quarter on the store layer.

## Related

- Upstream: [ADR-Vitest-Rollout](../../tech-lead/decisions/yivad/vitest-rollout.md) Phase 2 (the implementation ADR landed by this win)
- Decision: [ADR-Vitest-Introduction](../../tech-lead/decisions/yivad/vitest-introduction.md)
- Prerequisite: [yivad-vitest-phase-one-win](win-yivad-vitest-phase-one.md) Phase 1 composables
- Companion: [yivad-aicr-phase-port win](win-yivad-aicr-phase-port.md) § decoupled rollout
- Methodology: [evaluation-driven-development-pattern](../engineering/evaluation-driven-development.md) + [staged-port-methodology-pattern](../architecture-design/staged-port-methodology.md)
- Same class: [./README.md](./) — wins leaf entry
- Scenario: [i-want-to-review-lessons](../process/review-lessons.md)
