---
title: Staged port methodology pattern
aliases: [staged-port-methodology-pattern, phase-port-pattern, large-migration-staged]
tags: [pattern, engineering patterns, port, staged, baseline, parity, decoupling, loop-regression]
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
benefit: "Complex page ports are broken into staged phases with verified checkpoints, reducing risk and enabling parallel work"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified
related:
- ./one-to-one-mapping-migration.md
  - ../../tech-lead/decisions/yivad--aicr-phase-port.md
  - ../lessons/win-yivad-aicr-phase-port.md
  - ../lessons/win-yivad-leaf-view-leaves-ssot.md
---

> **Status (2026-08-07)**: This pattern document is valid as a methodology reference. However, the YiVad aicr 7-phase port used as the primary case study was never landed on master (`src/views/aicr/` + `src/stores/modules/aicr/` absent). The pattern itself is sound; the case study metrics (7 phases executed, 9 stores, 8 modals) describe a planned approach, not a completed implementation. See BRD-2026-080 for the actual implementation plan.

# Staged port methodology pattern

> **As an** engineer, **I want to** staged port methodology, **so that** pattern applied consistently.

> Large port split into N phases + baseline alignment + parity test + large-module decoupling + /loop automated regression; prevent the "stuck at 80%" stall; each phase independently launchable and verifiable.

## Summary

- **Pattern**: N-phase split (skeleton first, details later, each phase independently launchable) + baseline alignment (reference implementation side-by-side) + parity test (compare gaps each phase) + large-module decoupling (store / modal / view don't block each other) + per-phase build verification + /loop automated regression
- **Cross-project applicability**: YiVad aicr 7-phase port (YiWeb → YiVad), reusable for any large port
- **Landing**: [YiVad aicr phase port ADR](../../tech-lead/decisions/yivad--aicr-phase-port.md) + [yivad-aicr-phase-port win](../lessons/win-yivad-aicr-phase-port.md)
- **Alternative**: big-bang one-shot (not applicable; reason in §Not applicable)

## Core viewpoints

**The phase split is not an estimate -- it is a commitment to ship independently.** Each phase must produce a buildable, testable, and demonstrable artifact. A phase that produces "30% of the store" is not a phase -- it is a progress report. The phase boundary is the point where you can say "this works, and the next phase adds to it without breaking it."

**Baseline alignment is not comparison -- it is the specification.** The reference implementation is the ground truth. The port is correct if and only if it behaves identically to the reference. Without a baseline running side-by-side, correctness is a matter of opinion. With a baseline, correctness is a matter of diff output.

**Large-module decoupling is not about code organization -- it is about unblocking parallel work.** When the store, modal, and view are coupled, one stuck module blocks the entire port. When they are decoupled, the modal team can continue while the store team is blocked. The decoupling is an investment in parallelism that pays off when the inevitable blocker appears.

**The 80% stall is not a motivation problem -- it is a planning failure.** Ports stall at 80% because the last 20% is the hardest 20%: edge cases, error handling, and cross-cutting concerns that were invisible during the initial estimate. The phase plan must reserve the final phase for these, and the phase count must include a buffer phase that is explicitly labeled "unknown unknowns."

**Automated regression is not CI -- it is a safety net that catches changes during the port.** While you are porting, the reference implementation may change, the shared dependencies may update, and other teams may modify the target codebase. A `/loop` that runs every 2 hours catches these external changes before they accumulate into a merge conflict that takes days to resolve.

## Key info

- **Phase sizing heuristic**: each phase should take 1-3 days of focused work. A phase estimated at 1 week is too large and should be split. The phase boundary should be a user-visible feature (a page, a modal, a data flow), not a technical layer (the store, the API layer, the UI). Technical-layer phases are not independently demonstrable and turn the phase review into a code review instead of a demo.
- **Phase count formula**: N = ceiling(total_stories / 3) + 2 buffer phases. For YiVad aicr: 9 stores + 8 modals + 5 views = 22 stories / 3 = 8 phases + 2 buffer = 10 phases planned (7 executed). The buffer phases are for: (1) cross-cutting concerns discovered during the port (global error handling, i18n, theme), and (2) unknown unknowns. A phase plan without buffer phases is a plan that assumes nothing will be discovered.
- **Parity test structure**: each phase ends with a parity test that compares the port against the reference on: (1) feature completeness (all user-visible elements present), (2) behavioral equivalence (same input → same output), (3) error handling (same error → same error message), and (4) performance (within 20% of reference latency). The parity test is the phase's exit criteria; it must pass before the next phase starts.
- **Reference implementation freeze**: during the port, the reference implementation must be frozen (no feature changes, only bug fixes). If the reference changes, the port must catch up, which is unbounded work. The freeze duration is the port duration. The most common failure mode: the reference team adds a feature during the port because "the port team doesn't own the code," and the port team discovers it weeks later.
- **YiVad aicr port metrics**: 7 phases executed, 9 Pinia stores, 8 modal components, cards/graph views, CodeViewer/ChatPanel parity. The `/loop` automated regression caught 3 external changes (reference implementation bug fixes, shared dependency version bump, target codebase route restructuring) that would have caused merge conflicts if discovered at the end of the port.

## Problem

Pain points without this pattern (quantified):

- **80% stall**: push everything at once without phases = the last 20% drags on for months = PR unreviewable
- **No baseline**: port by memory = parity unverifiable = behavior drift
- **Large-module coupling**: push store + modal + view together = one stuck blocks all = global stall
- **No build run**: tech debt piles up until launch-time discovery = rollback cost extremely high
- **No automated regression**: changes during port = regression unknown = launch fails

## Pattern

### 1. N-phase split (skeleton first, details later)

```markdown
## aicr 7 phases

1. Routes + main entry + main store (skeleton)
2. File tree + FileTree baseline alignment (skeleton)
3. Card view + graph view (core UI)
4. CodeViewer full migration (core UI)
5. ChatPanel aligned with reference (core UI)
6. 8 modals full migration (details)
7. Remaining stores + polish (wrap-up)
```

Split principles:
- **Skeleton first, details later**: route / store / entry before view / modal
- **Each phase independently launchable**: no big-bang accumulation
- **Each phase verifiable**: build passes + parity test

### 2. baseline alignment + parity test

```bash
# side-by-side run reference implementation vs port version
npm run dev:reference  # old version (reference)
npm run dev:port        # new version (port)

# visual / behavior parity
npx playwright test parity.spec.ts --reference-url=... --port-url=...
# diff > threshold = block
```

Compare gaps each phase, avoid "close enough".

### 3. large-module decoupling

```markdown
## store and modal decoupling
- store before modal, neither blocks the other
- store stuck doesn't drag modal progress
- modal stuck doesn't drag store progress
- single-phase stuck doesn't drag global progress
```

### 4. per-phase build verification

```bash
# end of each phase, run build
npm run build
npm run type-check
npm run lint
npm run test
```

No tech debt accumulation.

### 5. /loop automated regression

```bash
# every 2h auto check
claude /loop 2h "
  git status --short
  npm run build
  npm run test
  npx playwright test parity.spec.ts
"
```

Changed during port = auto-regression catches it = prevent regression.

## Applicable / Not applicable

### Applicable

- Large page / module port (reference implementation → target project)
- N ≥ 5 phase split is reasonable
- Reference implementation clear (baseline alignable)
- Long-term maintenance (may change during port)
- Parity 100% requirement high

### Not applicable

- Single page / small module port (just write it directly)
- No reference implementation (parity unverifiable)
- Rush launch (no time to phase)
- Behavior is supposed to change (port + behavior change mixed is reasonable)

## Landing checklist

| # | Change | impact scope | launch strategy |
|---|---|---|---|
| 1 | N-phase split (skeleton first, details later, each phase independently launchable)  | documentation + process | one-shot |
| 2 | baseline alignment (reference implementation side-by-side)  | test environment | one-shot |
| 3 | parity test (compare gaps each phase)  | CI | one-shot |
| 4 | large-module decoupling (store / modal / view don't block each other)  | progress strategy | progressive |
| 5 | per-phase build verification (build / type / lint / test)  | CI | per-phase |
| 6 | /loop automated regression (every 2h check)  | process | one-shot |
| 7 | post-launch sync iteration (new features in reference implementation added to both sides)  | long-term | cadence |

## Action recommendations

1. **Define each phase as a buildable, testable, and demonstrable artifact, not a progress percentage.** A phase that produces "30% of the store" is a progress report, not a phase. The phase boundary is the point where you can say "this works, and the next phase adds to it without breaking it." Each phase must pass build, type-check, lint, and test independently.

2. **Run the reference implementation side-by-side with the port during development and diff the outputs.** The reference implementation is the ground truth. Without a baseline running side-by-side, correctness is a matter of opinion. With a baseline, correctness is a matter of diff output. The diff threshold must be defined before the port starts and enforced by CI.

3. **Decouple large modules (store, modal, view) so one stuck module does not block the entire port.** When modules are coupled, one stuck module blocks all progress. Decoupling is an investment in parallelism that pays off when the inevitable blocker appears. Each module must own its state independently, or phases must be sequential.

4. **Reserve the final phase explicitly for "unknown unknowns" -- edge cases, error handling, and cross-cutting concerns.** Ports stall at 80% because the last 20% is the hardest 20%. The phase plan must include a buffer phase labeled "unknown unknowns" to account for the work that was invisible during the initial estimate.

5. **Set up a `/loop` automated regression that runs every 2 hours during the port.** While you are porting, the reference implementation may change, dependencies may update, and other teams may modify the target codebase. A periodic automated check catches these external changes before they accumulate into a merge conflict that takes days to resolve.

## Anti-patterns

**Phase plan that is a wish list, not a dependency graph.** A phase plan that says "Phase 1: routes, Phase 2: file tree, Phase 3: card view" without specifying which phases depend on which others is a list, not a plan. The plan must identify dependencies: Phase 3 cannot start until Phase 1 is complete because card view needs routes. Dependency chains determine the critical path.

**Parallel phases that share mutable state.** If Phase 2 (file tree) and Phase 3 (card view) both modify the same store, they will produce merge conflicts and race conditions. Each phase must own its state independently, or the phases must be sequential. Parallel phases with shared state are not parallel.

**Porting without understanding the reference implementation.** A developer who opens the reference code, copies it, and modifies it to fit the target without understanding why the reference code does what it does is producing a port that will diverge on edge cases. Each ported module must be understood before it is ported. The question is not "what does this code do" but "why does this code exist."

**"Close enough" parity.** A visual diff that shows 2% difference and the developer says "looks fine to me" is not parity. The diff threshold must be defined before the port starts (e.g., 0.5% pixel difference) and enforced by CI. "Close enough" is the first step toward "how did we miss this regression."

**No post-port sync plan.** The reference implementation will continue to evolve after the port is "complete." New features, bug fixes, and improvements in the reference must be ported to the target. Without a sync plan (e.g., monthly review of reference commits), the two implementations will diverge, and the port will become a fork.



- **Big-bang port**: push everything at once without phases = 80% stall guaranteed; must N-phase split.
- **No baseline**: port by memory = parity unverifiable; must side-by-side.
- **store and modal coupled**: one stuck blocks all; must decouple.
- **No build run**: tech debt piles up to launch-time discovery; must per-phase build verification.
- **No /loop regression**: changes during port unknown regression; must every 2h auto check.
- **Phase not independently launchable**: phase N depends on phase N-1 incomplete = blocked; must each phase independently launchable + retractable.
- **Parity tolerates "close enough"**: behavior drift by eyeball; must parity diff threshold block.
- **Skip reusing baseline**: FileTree baseline already aligned with other sidebar = later ports reuse it; skipping = duplicate effort.

## Related

- landing: [YiVad aicr phase port ADR](../../tech-lead/decisions/yivad--aicr-phase-port.md) — 7-phase methodology
- landing: [yivad-aicr-phase-port win](../lessons/win-yivad-aicr-phase-port.md) — 9 stores + 8 modals + parity 100%
- landing: [yivad-leaf-view-leaves-ssot-win](../lessons/win-yivad-leaf-view-leaves-ssot.md) — 28 leaves SSOT tips
- companion: [one-to-one-mapping-migration-pattern](./one-to-one-mapping-migration.md) — stack version alignment (complementary to staging)
- companion: [ssot-view-layer-pattern](./ssot-view-layer.md) — leaf view layer (post-port SSOT maintenance)
- upstream: [./README.md](./) — engineering-patterns leaf entry
