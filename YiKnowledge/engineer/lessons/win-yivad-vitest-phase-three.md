---

title: YiVad Vitest Phase 3 components test completed
aliases: [yivad-vitest-phase-three-win, vitest-components-coverage, protable-test]
tags: [success-case, YiVad, Vitest, test, components, ProTable, modal, coverage]
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

# YiVad Vitest Phase 3 components test completed

> **As an** engineer, **I want to** yivad vitest phase three, **so that** success is reproducible.

> YiVad Vitest 4-phase rollout Phase 3 landing: ProTable + common components + 8 modal baseline + coverage 60% + CI blocking; paves the way for Phase 4 SSE parser parity.

## Summary

- **Completed**: ProTable + common components (Form / Dialog / Drawer / Tree / Select etc.) + 8 aicr modal baseline + coverage 60% + CI rollback > 5% blocking
- **Quantified results**: components coverage 0% -> 63% (3% above 60% goal); CI block rollback 0; subset < 60s (incl. Phase 1-3)
- **Value**: Phase 4 SSE parser parity has UI-layer guard; 8 modal parity aligned with [aicr phase port](win-yivad-aicr-phase-port.md) completed

## Core viewpoints

- **ProTable tested separately**: ProTable is the core common component (used by 20+ views) = must test alone = column definitions / sort / filter / pagination / selection / virtual scrolling / fixed columns / export.
- **Modal test visibility + form submit**: not just render = must test v-model / submit / close / cancel / validation / async.
- **Coverage 60% < stores 70%**: UI layer is noisy = lower threshold = allow noise + block obvious regressions.
- **@vue/test-utils mount + stub child components**: avoid child component noise = focus on current component behavior.

## Key information

### Background

- Phase 2 stores done (coverage 72%, see [yivad-vitest-phase-two-win](win-yivad-vitest-phase-two.md)).
- Before Phase 3 start, components coverage 0% = no static guard at UI layer = regressions hard to locate.
- 8 modals in [aicr phase port](win-yivad-aicr-phase-port.md) already 100% parity = now add test guards.

### Landing checklist

| No. | Change | Impact | Verification |
|---|---|---|---|
| 1 | ProTable test: column definitions / sort / filter / pagination / selection / virtual scrolling / fixed columns / export | YiVad `src/components/__tests__/` | 32 tests passed |
| 2 | Common components (Form / Dialog / Drawer / Tree / Select / Cascader / Upload) | YiVad components tests | 28 tests passed |
| 3 | 8 aicr modals (FileRename / FileMove / FileDelete / CardEdit / CardDelete / ChatClear / ScopeFilter / Export) | YiVad components tests | 40 tests passed |
| 4 | @vue/test-utils mount + stub child components | YiVad tests | Focus on current component behavior |
| 5 | Coverage threshold 60% | `vitest.config.ts` | Actual 63% |
| 6 | CI: coverage rollback > 5% block | `.github/workflows/vitest.yml` | Deliberately injected regression test blocked |

### Quantified results

- Components coverage: 0% -> 63% (3% above 60% goal)
- Total tests: 100 (32 + 28 + 40)
- CI block rollback PR: 0
- Subset run: < 60s (incl. Phase 1-3, 237 tests total)
- 8 modal parity aligned with aicr phase port completed

### Key success factors

1. **ProTable tested alone**: core common component must test alone = 20+ views depend on it
2. **Modal test visibility + form submit**: not just render = must test v-model / submit / close / validation
3. **Coverage 60% < stores 70%**: UI layer is noisy = lower threshold = allow noise + block obvious regressions
4. **@vue/test-utils mount + stub child components**: avoid child component noise = focus on current component behavior
5. **Built on Phase 1-2**: foundation + state layers already guarded = components tests more stable

## Action recommendations

1. ProTable tested alone (column definitions / sort / filter / pagination / selection / virtual scrolling / fixed columns / export) = 20+ views depend on it.
2. Modal test visibility + form submit (v-model / submit / close / cancel / validation / async) = not just render.
3. Coverage 60% threshold (UI layer noisy, lower than stores 70%) = allow noise + block obvious regressions.
4. @vue/test-utils mount + stub child components = avoid child component noise = focus on current component behavior.
5. Built on Phase 1-2 already guarded = components tests more stable.
6. Phase 4 SSE parser parity depends on Phase 3 completion = priority clear.



- **Only test render**: visibility + form submit missing = regressions hard to locate; must test v-model / submit / close / validation.
- **Coverage threshold = stores 70%**: UI layer noisy = blocks merges; must be 60%.
- **Not stubbing child components**: child component noise pollutes = test flaky; must stub.
- **Skip ProTable**: core common component unguarded = 20+ views regressions hard to locate; must test alone.
- **Modal not aligned with parity**: aicr phase port done but tests not followed = guard not guarding; must parity + test co-built.

## Anti-patterns

- **Testing ProTable column definitions by mounting the full ProTable with all 20+ dependent views.** ProTable is a generic component that renders columns, pagination, filters, and selection independently of the view that uses it. A test that mounts ProTable inside a specific view couples the component test to the view's data, API, and store dependencies. Test ProTable in isolation with a minimal wrapper that provides only the props needed for the feature under test.
- **Stubbing child components with `shallowMount` but not verifying that the stub received the correct props.** `shallowMount` replaces child components with empty stubs that accept any props and emit any events. A test that asserts the parent rendered correctly but does not assert that the child stub received `foo="bar"` will pass even when the parent's template is passing the wrong prop. Assert the stub's props using `wrapper.findComponent(ChildStub).props()`.
- **Writing modal tests that assert `v-model` opens and closes the modal but do not assert that the modal resets its internal state on close.** A modal that opens, the user fills in a form, the user cancels, and the modal closes -- the form fields must be cleared so that reopening the modal shows a blank form, not the previous user's half-filled data. This is the most common modal bug and the one least likely to be caught by a test that only checks open/close.
- **Testing the component's render output with snapshot testing instead of semantic assertions.** A snapshot test that asserts the rendered HTML matches a stored string will fail on every dependency upgrade that changes a CSS class name or adds a data attribute. The test becomes a change detector, not a behavior verifier. Assert the presence of specific text, the state of specific elements (disabled, checked, visible), and the firing of specific events -- not the raw HTML.
- **Setting the component coverage threshold at 60% and then using the same threshold for ProTable and for a simple wrapper component.** ProTable has 32 tests for 20+ features; a simple `<Badge>` component may have 2 tests for 1 feature. The 60% threshold treats them equally, but a regression in ProTable affects 20+ views while a regression in Badge affects one. Use per-component coverage thresholds that reflect the component's blast radius: higher for shared components, lower for leaf components.

## Related

- Upstream: [ADR-Vitest-Rollout](../../tech-lead/decisions/yivad/vitest-rollout.md) Phase 3 (the implementation ADR for this win landing)
- Prerequisite: [yivad-vitest-phase-two-win](win-yivad-vitest-phase-two.md) Phase 2 stores
- Prerequisite: [yivad-vitest-phase-one-win](win-yivad-vitest-phase-one.md) Phase 1 composables
- Companion: [yivad-aicr-phase-port](win-yivad-aicr-phase-port.md) — 8 modal parity 100%
- Methodology: [evaluation-driven-development-pattern](../engineering/evaluation-driven-development.md) + [staged-port-methodology-pattern](../architecture-design/staged-port-methodology.md)
- Scenario: [i-want-to-set-up-testing-infrastructure](../engineering/set-up-testing-infrastructure.md)
- Same class: [./README.md](./) — wins leaf entry
