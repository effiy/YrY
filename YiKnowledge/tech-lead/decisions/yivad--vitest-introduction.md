---
title: ADR — YiVad introduce Vitest testing infrastructure
aliases: [adr-vitest-introduction, yi-vad-vitest-adr, frontend-testing-adr]
tags: [adr, yi-vad, vitest, testing, vue, frontend, architecture-decision]
category: tech-lead/decisions/yivad
created: 2026-08-03
updated: 2026-08-03
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-03
tacit: false
roles: [tech-lead, engineer]
benefit: "YiVad Vitest adoption decision is documented with trade-offs, enabling consistent testing strategy"
acceptance_criteria:
  - "context, decision, and rationale are clearly documented"
  - "options considered with trade-offs are enumerated"
  - "consequences and reversal path are stated
related:
  - ../../../engineer/projects/yivad/architecture.md
  - ../../../engineer/projects/yivad/dev-standards.md
  - ../../../product-manager/projects/yivad--project-management.md
  - ../yiai/pytest-introduction.md
  - ../../../product-manager/delivery/retrospective.md
  - ../../../product-manager/delivery/weekly-report.md
  - ../../../knowledge-curator/templates/adr.md
  - ../../../knowledge-curator/templates/adr.md
---

# ADR — YiVad introduce Vitest testing infrastructure

> **As a** tech lead, **I want to** vitest introduction, **so that** decision documented and reversible. 

> Decision: YiVad introduce Vitest 2 + `@vue/test-utils` + `happy-dom` + `@vitest/coverage-v8`; priority composables → stores → components. Land the [retrospective Try item](../../../product-manager/delivery/retrospective.md)"Vitest introduction (composable + store priority) "and [YiVad project management §block](../../../product-manager/projects/yivad--project-management.md)"no Vitest → high regression risk"as a settled decision. 

## 1. Basic information

| field | content |
|---|---|
| ADR number | ADR-Vitest-Introduction |
| title | YiVad introduce Vitest testing infrastructure |
| status | Accepted |
| Date | 2026-08-03 |
| Decision maker | YiVad primary owner + Architecture team |
| Reviewer | CTO, QA |
| Related project | YiVad |
| Related PR/Issue | to be opened (YiVad `chore(test): vitest + @vue/test-utils + happy-dom scaffold`)  |
| Supersedes | — |
| Superseded by | — |
| Review trigger | quarterly review / signal: coverage < 50% / key composable missing test causing regression / Vitest and Rsbuild 1 compatibility breakage |

## 2. background (Context) 

- **Current state**: YiVad `src/` 0 tests; 20 views + 18 api modules + 11 stores + 28 leaf × (index+detail).vue all rely on manual clicking. 
- **Pain points quantitative**: 
  - 28 leaf × 2 wrapper each change to `KnowledgeLeafList` / `KnowledgeLeafDetail` requires manually running 28 pages = 1 person-hour per pass. 
  - `staticRouter.ts` 56 literal routes + `leaves.ts` SSOT validation relies on eyeballing, PR review easily misses ([YiVad functional modules](../../../engineer/projects/yivad/functional-modules.md)).
  - chat SSE onDone guard shares lineage with YiAi, but frontend has no test guard ([lessons/gotchas/sse-onDone-guard](../../../engineer/lessons/gotcha-sse-ondone-guard.md) shared across projects).
- **Trigger event**: Retrospective Try item + weekly report next-week plan YiVad item 2. 
- **External constraints**: Vitest 2 and Rsbuild 1 share Vite resolver; `@vue/test-utils` 2.x and Vue 3.5 compatible; `happy-dom` ~2x faster than `jsdom`. 

## 3. Decision (Decision) 

YiVad chooses Vitest 2 as test runner, `@vue/test-utils` to mount components, `happy-dom` as DOM environment, `@vitest/coverage-v8` for coverage. Priority: composables → stores → components → views. 

Implementation list: 

| No. | Change | impact scope | Launch strategy |
|---|---|---|---|
| 1 | `package.json` devDeps: `vitest` + `@vue/test-utils` + `happy-dom` + `@vitest/coverage-v8` + `@testing-library/vue` (optional)  | YiVad root | one-shot |
| 2 | `vitest.config.ts`: `environment: 'happy-dom'` + `setupFiles` + `coverage` config + Rsbuild alias reuse | YiVad root | one-shot |
| 3 | `src/test/setup.ts`: mock `Element.scrollTo` / `IntersectionObserver` / `ResizeObserver` + pinia activation helper | YiVad test | one-shot |
| 4 | `src/composables/__tests__/`: `useTable` / `useDialog` / `usePermission` / `useResizable` priority | priority P0 | progressive |
| 5 | `src/stores/__tests__/`: `useUserStore` / `usePermissionStore` / `useTagsViewStore` / `useKnowledgeStore` priority | priority P0 | follow #4 |
| 6 | `src/components/__tests__/`: ProTable / FileTree / ChatSidebar / ConversationSidebar | priority P1 | follow P0 |
| 7 | `src/api/modules/__tests__/`: ragService / knowledgeService / llmService (mock fetch)  | priority P1 | follow #6 |
| 8 | CI `vitest run --coverage` gate (first version 50%)  | GitHub Actions | follow #1 |
| 9 | CLAUDE.md "Test" section add "run `pnpm test`" + coverage report location | documentation | one-shot |

## 4. Alternative options (Options Considered) 

| Alternative | description | Pros | Cons | Conclusion |
|---|---|---|---|---|
| A. Vitest 2 + @vue/test-utils + happy-dom + coverage-v8 | Vite native test runner | shares resolver with Rsbuild 1; ESM native; fast | ecosystem slightly newer, documentation scattered | ✅ selected |
| B. Jest 29 + @vue/test-utils + jsdom | established test stack | documentation complete; mature | CJS origin, poor ESM compatibility; jsdom slow; resolver split with Rsbuild 1 | ❌ |
| C. Cypress component testing | browser-run | real DOM environment | slow; CI resource heavy; high startup cost | ❌ (keep as E2E)  |
| D. do not introduce | keep manual clicking | zero cost | 28 leaf × 2 wrapper manual test cost | ❌ |

## 5. assessment dimensions

| dimension | A. Vitest | B. Jest | C. Cypress CT | D. do not introduce |
|---|---|---|---|---|
| Rsbuild compatibility | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | — |
| Vue 3.5 compatibility | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | — |
| speed | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | — |
| ESM native | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | — |
| documentation maturity | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | — |
| startup cost | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |

## 6. Risk (Risks) 

| Risk | Probability | impact | Mitigation |
|---|---|---|---|
| `happy-dom` and `jsdom` behavior difference causing component false positive | Medium | Medium | P0 run composables/stores first; compare `happy-dom` vs `jsdom` key APIs before adding component tests |
| Pinia store test activation timing wrong | High | Medium | `setup.ts` `setActivePinia(createPinia())` global helper; each test `beforeEach` reset |
| `usePermission` mock incomplete causing `v-auth` false positive | Medium | High | `usePermissionStore` mock must fill `buttonPermissions` all fields; CI diff before/after |
| ProTable test depends on Element Plus full mount failing | Medium | Medium | shallow mount + `global.stubs`; do not test EP internals |
| Vitest and Rsbuild 1 resolver version inconsistent | Low | High | lockfile pin same minor; CI `pnpm audit` + Renovate tracking |
| coverage gate 50% too strict blocking PR | High | Low | first version 50%, quarterly review increase; P0 domains meet first |

## 7. Rollback plan (Rollback Plan) 

| Trigger condition | Rollback action | Responsible | estimated recovery time |
|---|---|---|---|
| CI `vitest run --coverage` blocks release | lower gate to 30% or remove | YiVad primary owner | 15 min |
| `happy-dom` false positive rampant | switch to `jsdom` environment + run regression | YiVad primary owner | 1 h |
| Vitest upgrade breaks Rsbuild compatibility | pin version + assess Jest fallback | Architecture team | 1 business day |
| Pinia test activation leak causing store state pollution | add `afterEach` reset + `setActivePinia` fix | YiVad primary owner | 30 min |

> Rollback must be executable within 1 h; testing infrastructure rollback does not impact production deployment. 

## 8. Implementation plan

| stage | content | Completion date | Responsible |
|---|---|---|---|
| Phase 1 | `package.json` + `vitest.config.ts` + `setup.ts` + CI gate (#1 #2 #3 #8)  | 2026-08-06 | YiVad primary owner |
| Phase 2 | composables P0: useTable / useDialog / usePermission / useResizable (#4)  | 2026-08-10 | YiVad primary owner |
| Phase 3 | stores P0: userStore / permissionStore / tagsViewStore / knowledgeStore (#5)  | 2026-08-13 | YiVad primary owner + QA |
| Phase 4 | components P1: ProTable / FileTree / ChatSidebar / ConversationSidebar (#6)  | 2026-08-17 | YiVad primary owner |
| Phase 5 | api modules P1: ragService / knowledgeService / llmService (#7)  | 2026-08-20 | YiVad primary owner |
| Phase 6 | coverage raised to 70% + quarterly review | 2026-09-01 | Architecture team |

## 9. Follow-up tracking metrics

| metric | Pre-launch | Target | Actual |
|---|---|---|---|
| test file count | 0 | ≥ 30 | — |
| coverage rate (composables + stores)  | 0% | ≥ 50% Phase 2 / ≥ 70% Phase 6 | — |
| 28 leaf manual test time | 1 person-hour per pass | ≤ 15 min per pass | — |
| `leaves.ts` SSOT validation automation | manual | CI auto-validation | — |
| `staticRouter.ts` 56 routing literal validation | manual | CI auto-validation | — |

## 10. References

- [YiVad Architecture overview](../../../engineer/projects/yivad/architecture.md) — testing infrastructure coverage surface across 20 views + 18 api + 11 stores
- [YiVad development standards](../../../engineer/projects/yivad/dev-standards.md) — §ProTable Pattern + §v-auth + §commitlint
- [YiAi pytest ADR](../yiai/pytest-introduction.md) — same cadence backend testing infrastructure
- [Retrospective instance](../../../product-manager/delivery/retrospective.md) — Try item trigger
- [ADR Template](../../../knowledge-curator/templates/adr.md) / [ADR Summary](../../../knowledge-curator/templates/adr.md)
