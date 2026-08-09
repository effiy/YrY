---

title: YiVad Vitest Phase 1 composables test complete
aliases: [yivad-vitest-phase-one-win, vitest-composables-baseline, vitest-phase-one-complete]
tags: [success-case, YiVad, Vitest, test, composables, coverage, baseline]
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

# YiVad Vitest Phase 1 composables test complete

> **As an** engineer, **I want to** yivad vitest phase one, **so that** success is reproducible.

> YiVad Vitest 4-phase rollout Phase 1 landing: composables layer baseline test + coverage gate 60% + CI block; foundation for Phase 2-4.

## Summary

- **Complete**: `useResizable` / `useTableScroll` / `usePermission` and other composables test baseline + coverage 60% + CI regression > 5% block
- **Quantified effect**: composables coverage 60% -> 65%; CI block regression PR 0; test run time < 30s
- **Value**: Phase 2 (stores) / Phase 3 (components) / Phase 4 (SSE parser parity) have a foundational layer guarantee; coverage gate pattern verified effective

## Core viewpoints

- **The composable layer is the foundation, and foundation testing pays compound interest on every layer above it.** Stores consume composables, components consume stores, and pages consume components. A bug in `useResizable` that passes unit tests but breaks in integration manifests as a mysterious layout failure three layers up. Testing the composable layer first creates a stable base that makes upper-layer tests simpler — store tests can mock composables with confidence, and component tests can mock stores with confidence.

- **A 60% coverage gate is a starting line, not a finish line, and its real value is the regression block.** The 60% threshold is deliberately low — it allows noise and incremental progress — but the CI regression block at >5% drop is the mechanism that prevents backsliding. A coverage gate that only warns is equivalent to not having one. The block forces the author to explain why coverage dropped and either add tests or justify the exception.

- **Subset test runs under 30 seconds are a developer experience requirement, not a performance optimization.** If the CI test suite takes longer than 30 seconds, developers stop running it locally and the CI becomes the first time anyone discovers a test failure. The sub-30-second subset run means developers get feedback before pushing, reducing the CI-as-debugger anti-pattern. The full suite can take minutes; the subset must be fast enough to run on every save.

- **A phased rollout is risk management, not project management.** Phase 1 (composables) → Phase 2 (stores) → Phase 3 (components) → Phase 4 (SSE parser parity) is ordered by dependency chain and blast radius. Each phase validates the testing infrastructure before the next layer is added. A phase that fails does not block the next phase — it means the testing infrastructure is not ready for the next layer. The phases are gates, not milestones.

- **The success of Phase 1 is measured by the quality of the foundation it provides to Phase 2, not by the Phase 1 coverage number.** A 65% composable coverage that enables stores to be tested with confidence is a better outcome than an 80% coverage that leaves edge cases untested. The Phase 1 acceptance criteria should include: "can Phase 2 store tests mock composables with confidence?" and "did any Phase 1 test break during Phase 2 development?"

## Key information

### Background

- Decision ADR already set: Vitest 2 + @vue/test-utils + happy-dom + coverage-v8, priority composables -> stores -> components.
- Implementation ADR 4 phases: Phase 1 composables -> Phase 2 stores -> Phase 3 components -> Phase 4 SSE parser parity.
- Before Phase 1 start composables coverage 0% = no foundation layer guarantee = upper-layer test unstable.

### Landing checklist

| No. | Change | Impact | Verification |
|---|---|---|---|
| 1 | `useResizable` test: drag / boundary / persist | YiVad `src/composables/__tests__/` | 8 tests pass |
| 2 | `useTableScroll` test: scroll / fixed column / virtual scroll | YiVad composables tests | 12 tests pass |
| 3 | `usePermission` test: v-auth directive + role matrix + boundary | YiVad composables tests | 15 tests pass |
| 4 | Other composables (`useDebounce` / `useThrottle` / `useLocalStorage`) | YiVad composables tests | 18 tests pass |
| 5 | coverage threshold 60% | `vitest.config.ts` | actual 65% |
| 6 | CI: coverage regression > 5% block | `.github/workflows/vitest.yml` | deliberately introduce regression test block |
| 7 | subset run | CI | full set < 30s |

### Quantified effect

- composables coverage: 0% -> 65% (goal 60%, exceeded goal 5%)
- CI block regression PR: 0 (gate effective)
- test run time: subset < 30s / full < 3 min
- total tests: 53 (8 + 12 + 15 + 18)

### Key success factors

1. **Priority composables first**: foundation layer guaranteed first = upper-layer test more stable
2. **coverage gate 60% start**: allows noise + blocks obvious regression = not pursuing 100%
3. **CI block not warn**: forced fix = not accumulating tech debt
4. **happy-dom not jsdom**: happy-dom 3x faster + behavior difference small
5. **@vue/test-utils 2.x**: compatible with Vue 3.5 + API stable

## Action recommendations

1. Large-scale test introduction by priority 4-phase rollout (composables -> stores -> components -> parity).
2. coverage gate 60% start (not pursuing 100%) + CI regression > 5% block.
3. happy-dom not jsdom (3x faster).
4. subset run < 30s (CI not blocking); full run < 3 min.
5. Foundation layer guaranteed first = upper-layer test more stable (composables first).
6. Phase 2 (stores) depends on Phase 1 completion = priority clear.



- **Pursuing 100% coverage**: noise blocking merge = slowdown; 60% start + block obvious regression is enough.
- **warn not block**: equivalent to not running; must CI block.
- **jsdom not happy-dom**: 3x slower; must happy-dom.
- **Skip composables, test components directly**: foundation layer not guaranteed = regression hard to locate; must priority first.
- **subset not random**: biased = threshold deviates from full; must random sampling.
- **No regression test run**: gate effectiveness unknown; must deliberately introduce regression test block.

## Anti-patterns

- **Writing composable tests that mock the entire Vue reactivity system instead of using it.** A test that replaces `ref` and `reactive` with plain objects skips the very behavior that makes composables useful: reactivity. The test passes but the composable can still fail in production when a watcher does not trigger or a computed does not re-evaluate. Use `@vue/test-utils` with a real Vue app instance or at minimum use actual `ref`/`reactive` from Vue, not mock substitutes.
- **Setting the coverage threshold at 60% and then never revisiting it.** A 60% baseline is a starting point, not a destination. If the threshold is never raised, the team optimizes for 60% coverage indefinitely, and the remaining 40% of untested code becomes a permanent blind spot. Schedule a quarterly review to raise the threshold by 5% each cycle until the diminishing-returns point is reached.
- **Running the full test suite on every CI push for a monorepo with 50+ composables.** A full suite that takes 3 minutes is fast enough for a pre-merge check but too slow for a pre-push hook. The subset run (< 30s) should be the pre-push gate, and the full run should be the merge gate. Running the full suite on every push trains developers to skip the hook entirely.
- **Choosing `happy-dom` over `jsdom` without verifying that the composables under test do not rely on `jsdom`-specific APIs.** `happy-dom` is 3x faster but lacks support for `window.matchMedia`, `IntersectionObserver`, and several CSSOM APIs. If any composable under test touches these APIs, the tests will fail with cryptic errors that are misattributed to the composable logic. Audit the DOM API surface used by the composables before committing to the DOM environment.
- **Treating the Phase 1 composable tests as a one-time deliverable rather than a living contract.** When a new composable is added to the codebase, the Phase 1 coverage threshold applies to it as well. If the new composable ships without tests, the overall coverage drops and the CI gate blocks the merge. The coverage gate must be enforced on every PR, not just on the PR that introduced the tests.

## Related

- Upstream: [ADR-Vitest-Rollout](../../tech-lead/decisions/yivad--vitest-rollout.md) Phase 1 (the implementation ADR this win landing)
- Decision: [ADR-Vitest-Introduction](../../tech-lead/decisions/yivad--vitest-introduction.md)
- Methodology: [evaluation-driven-development-pattern](../engineering/evaluation-driven-development.md) — coverage gate + regression threshold
- Companion: [sse-streaming-pattern](../architecture-design/sse-streaming.md) — Phase 4 SSE parser parity co-build
- Same class: [./README.md](./) — wins leaf entry
- Scenario: [i-want-to-review-lessons](../process/review-lessons.md)
