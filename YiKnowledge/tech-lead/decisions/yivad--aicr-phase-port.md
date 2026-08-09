---
title: ADR — YiVad aicr 7-Phase Port Methodology
aliases: [adr-aicr-phase-port, yi-vad-aicr-port-adr, page-port-methodology-adr]
tags: [adr, yi-vad, aicr, port, parity, instance-adr, architecture-decision]
category: tech-lead/decisions/yivad
created: 2026-08-03
updated: 2026-08-03
source: internal
type: summary
status: draft
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-03
tacit: false
roles: [tech-lead, engineer]
benefit: "YiVad aicr 7-phase port methodology is documented so future page ports follow a proven, low-risk pattern"
acceptance_criteria:
  - "context, decision, and rationale are clearly documented"
  - "options considered with trade-offs are enumerated"
  - consequences and reversal path are stated
related:
  - ../../../engineer/projects/yivad/architecture.md
  - ../../../engineer/projects/yivad/functional-modules.md
  - ../../../engineer/projects/yivad/dev-standards.md
  - ./vitest-introduction.md
  - ../../../product-manager/projects/yivad--project-management.md
  - ../../../engineer/lessons/win-yivad-aicr-phase-port.md
  - ../../../engineer/lessons/win-yivad-leaf-view-leaves-ssot.md
  - ../../../knowledge-curator/templates/adr.md
---

# ADR — YiVad aicr 7-Phase Port Methodology

> **As a** tech lead, **I want to** aicr phase port, **so that** decision documented and reversible.

> Decision: porting aicr (AI Code Review) page from YiWeb to YiVad uses a 7-phase split + baseline alignment + parity test + store/modal decoupling + /loop auto-regression methodology. This document captures the "why split this way" and "why not split further" of the decision. Landing cases see [yivad-aicr-phase-port win](../../../engineer/lessons/win-yivad-aicr-phase-port.md).

## 1. Basic info

| Field | Content |
|---|---|
| ADR no. | ADR-Aicr-7-Phase-Port |
| Title | YiVad aicr 7-Phase Port Methodology |
| state | Accepted |
| Date | 2026-07-27 |
| Decision maker | YiVad lead owner + architecture team |
| Reviewers | CTO, frontend lead |
| Related project | YiVad |
| Related PR/Issue | Shipped (see [yivad-aicr-phase-port win](../../../engineer/lessons/win-yivad-aicr-phase-port.md)) |
| Supersedes | — |
| Superseded by | — |
| Re-review trigger | Quarterly review / signals: next large page port / methodology failure / 7-phase boundary too coarse or too fine |

## 2. Background (Context)

- **Status trigger**: YiWeb aicr page needs full port to YiVad; involves 9 Pinia stores + 8 modals + card views + chart views + CodeViewer + ChatPanel, ~3 person-weeks of work.
- **Pain points**:
  - Large ports easily "stall at 80%" — late-stage details jam PR review, single-PR size explodes.
  - No baseline reference = "porting by impression" = parity unverifiable.
  - Store and modal coupled progress = one stuck, all stuck.
  - No cadenced verification = tech debt accumulates and surfaces before launch.
- **Trigger event**: YiWeb aicr stable, YiVad needs capability alignment; YiVad Rsbuild 1 cut over and stack stable.
- **External constraints**: YiVad Vue 3.5 + Pinia 4 + Element Plus 2.14 + ECharts 6; YiWeb same stack; no stack diff in port, only engineering structure diff.

## 3. Decision (Decision)

YiVad aicr port uses 7-phase split + baseline alignment + parity test + store/modal decoupling + /loop auto-regression methodology. Each phase independently shippable + verifiable; stores before modals; build verification per phase + /loop regression every 2h.

Landing checklist:

| No. | Change | impact scope | Ship strategy |
|---|---|---|---|
| 1 | Phase 1: route + main entry + main store (aicr entry skeleton) | YiVad src/views/aicr/ | One-shot |
| 2 | Phase 2: FileTree + baseline alignment with YiWeb FileTree | YiVad aicr file tree | Follow #1 |
| 3 | Phase 3: card view + chart view (ECharts 6) | YiVad aicr view components | Follow #2 |
| 4 | Phase 4: CodeViewer full migration | YiVad aicr CodeViewer | Follow #3 |
| 5 | Phase 5: ChatPanel alignment with YiWeb (SSE streaming + onDone guard) | YiVad aicr ChatPanel | Follow #4 |
| 6 | Phase 6: 8 modals full migration | YiVad aicr 8 modals | Follow #5 (stores before modals) |
| 7 | Phase 7: remaining stores + polish (remaining 8 stores + visual details) | YiVad aicr all | Follow #6 |
| 8 | /loop auto-regression every 2h (build + key path smoke) | YiVad CI | One-shot, whole process |

## 4. Options Considered (Options Considered)

| Option | description | Pros | Cons | Conclusion |
|---|---|---|---|---|
| A. 7-phase split + baseline + parity + /loop | This proposal | Each phase shippable + verifiable; cadenced anti-regression | Split cost (1 day planning upfront) | ✅ Selected |
| B. Big-bang port (single PR) | One-shot full push | No phase coordination | 80% stall inevitable; PR unreviewable | ❌ |
| C. Module-based split (store / view / modal each a phase) | 3-phase coarse split | Few phases, simple coordination | Single phase still large; stuck blocks all | ❌ (too coarse) |
| D. File-based split (each file a phase) | ~30-phase fine split | Tiny PRs | Too many phases, coordination explodes; parity unverifiable | ❌ (too fine) |

## 5. Evaluation dimensions

| Dimension | A. 7-phase | B. Big-bang | C. 3-phase coarse | D. per-file fine |
|---|---|---|---|---|
| Phase verifiable | ⭐⭐⭐⭐⭐ | ⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| PR reviewable | ⭐⭐⭐⭐⭐ | ⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Parity verifiable | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| Anti-blocking | ⭐⭐⭐⭐⭐ | ⭐ | ⭐⭐ | ⭐⭐⭐⭐ |
| Anti-regression | ⭐⭐⭐⭐⭐ | ⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| Coordination cost | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |

## 6. Risks (Risks)

| Risk | Probability | impact | Mitigation |
|---|---|---|---|
| Phase boundary mis-sliced → rework | Medium | Medium | 1 day planning before split + phase depends-on graph + baseline reference fixed first |
| Parity test subjective bias | Medium | Medium | Side-by-side screenshot diff + key path scripted (co-build with [ADR Vitest](./vitest-introduction.md)) |
| /loop false-positive fatigue | Medium | Low | /loop only runs build + key path smoke; not full regression |
| Phase 6 (8 modals) stuck blocks phase 7 | Medium | Medium | Stores before modals; phase 6 internally sub-split by modal 1-8 |
| Baseline YiWeb self-drift | Low | Medium | YiWeb aicr frozen during port window; concurrent iteration starts after port complete |
| Phase 1 skeleton too thin to verify | Low | Low | Phase 1 must run "route → main store → entry render" closed loop |

## 7. Rollback Plan (Rollback Plan)

| Trigger | Rollback action | Owner | Estimated recovery time |
|---|---|---|---|
| Phase stuck > 3 days | Split into sub-phases + evaluate whether to roll back to previous phase branch | YiVad lead owner | 1 working day |
| Parity test finds severe deviation | Pause next phase + fix current phase + re-review baseline | YiVad lead owner | 1-2 working days |
| /loop false positives flooding | Turn off /loop + run manual regression + re-review /loop trigger conditions | YiVad lead owner | 30 min |
| Big-bang tendency (PR size explosion) | Force split into sub-PRs + phase boundary re-review | architecture team | 1 h |

> Rollback must be executable within 1 working day; port rollback does not impact production deploy.

## 8. Implementation plan

| Phase | Content | Completion date | Owner |
|---|---|---|---|
| Phase 1 | route + main entry + main store | 2026-07-20 done | YiVad lead owner |
| Phase 2 | FileTree + baseline alignment | 2026-07-21 done | YiVad lead owner |
| Phase 3 | card view + chart view | 2026-07-22 done | YiVad lead owner |
| Phase 4 | CodeViewer full migration | 2026-07-23 done | YiVad lead owner |
| Phase 5 | ChatPanel alignment (SSE + onDone guard) | 2026-07-24 done | YiVad lead owner |
| Phase 6 | 8 modals full migration | 2026-07-25 done | YiVad lead owner |
| Phase 7 | remaining stores + polish | 2026-07-27 done | YiVad lead owner |
| Phase 8 | /loop full-process regression + quarterly review | ongoing | architecture team |

## 9. Follow-up tracking metrics

| Metric | Pre-ship | Post-ship | goal |
|---|---|---|---|
| 9 store parity | 0% | 100% | 100% ✅ |
| 8 modal parity | 0% | 100% | 100% ✅ |
| card + chart view parity | 0% | 100% | 100% ✅ |
| CodeViewer + ChatPanel parity | 0% | 100% | 100% ✅ |
| Build passing | — | ✅ | ✅ ✅ |
| Post-ship P0 bug | — | 0 | 0 ✅ |
| /loop regression false-positive rate | — | < 5% | < 5% |

## 10. Methodology reusability

- **Phase split principle**: each phase independently shippable + verifiable; explicit depends-on graph between phases; no big-bang accumulation.
- **Baseline alignment principle**: baseline frozen during port window; parity test side-by-side screenshots + scripted.
- **Decoupling principle**: stores before modals; stores are data contracts, modals are UI; contract before presentation.
- **Cadence principle**: /loop auto-regression every 2h + build verification per phase; prevents tech debt accumulation.
- **Baseline reuse**: FileTree baseline already aligned across YiPet ChatSidebar / aiChat ConversationSidebar / aicr FileTree (three-way sidebar parity: favorites + batch + hover action row + inline rename); future ports reuse the same baseline.

## 11. Coupling with other ADRs / documentation

- **[ADR Vitest introduction](./vitest-introduction.md)**: parity test scripting co-built with Vitest; key path tests for phases 1-7 strengthened after Vitest landing.
- **[YiVad architecture overview](../../../engineer/projects/yivad/architecture.md)**: aicr positioning in YiVad view layer.
- **[YiVad functional modules](../../../engineer/projects/yivad/functional-modules.md)**: aicr position within the 20 views.
- **[yivad-aicr-phase-port win](../../../engineer/lessons/win-yivad-aicr-phase-port.md)**: landing cases for this ADR.
- **[yivad-leaf-view-leaves-ssot win](../../../engineer/lessons/win-yivad-leaf-view-leaves-ssot.md)**: same-origin 28 leaf view layer methodology.
- **[sse-ondone-guard gotcha](../../../engineer/lessons/gotcha-sse-ondone-guard.md)**: phase 5 ChatPanel SSE guard basis.

## 12. References

- [YiVad architecture overview](../../../engineer/projects/yivad/architecture.md)
- [YiVad dev standards](../../../engineer/projects/yivad/dev-standards.md)
- [yivad-aicr-phase-port win](../../../engineer/lessons/win-yivad-aicr-phase-port.md)
- [ADR Vitest introduction](./vitest-introduction.md)
- [ADR template](../../../knowledge-curator/templates/adr.md)
