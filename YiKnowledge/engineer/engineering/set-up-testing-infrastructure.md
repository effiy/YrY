---
title: Set up testing infrastructure
aliases:
- i-want-to-set-up-testing-infrastructure
- testing-infra-journey
- QA infrastructure entry
tags:
- journeys
- testing
- vitest
- pytest
- coverage
- ci-gate
category: engineer/engineering
created: 2026-08-03
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
roles:
- engineer
benefit: baseline is reproducible
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
-../../tech-lead/architecture/design-architecture-decision.md
-../processes/roll-out-a-migration.md
-../../engineer/projects/INDEX.md
-../../README.md
review_cycle: quarterly
last_verified: 2026-08-07
tacit: false
---

# I want to set up testing infrastructure

> **As an** engineer, **I want to** set up testing infrastructure, **so that** baseline is reproducible.

> "Unit / integration / evaluation set + coverage gate + CI block how to set up" reachable within 2 hops to pytest / Vitest ADR + 4-stage rollout + evaluation-driven-development-pattern + milestone win.

## Summary

- Backend (Python) via [pytest ADR](../../tech-lead/decisions/yiai--pytest-introduction.md): pytest + httpx + pytest-asyncio + coverage, directory `tests/{unit,integration,eval}`
- Frontend (TS) via [Vitest ADR](../../tech-lead/decisions/yivad--vitest-introduction.md): Vitest 2 + @vue/test-utils + happy-dom + coverage-v8, priority composables → stores → components
- Eval set gate via [evaluation-driven-development-pattern](../engineering/evaluation-driven-development.md): ≥ 50 bilingual samples + ragas 4 metrics + baseline + fallback > 5% block
- Rollout cadence via [Vitest rollout ADR](../../tech-lead/decisions/yivad--vitest-rollout.md): 4 stages (composables → stores → components → SSE parser parity)

## Core viewpoints

**Coverage percentage is a floor, not a ceiling, and the floor starts at 60%.** Chasing 100% coverage from day one is the fastest way to ensure testing never gets adopted. The initial coverage gate of 60% gets the infrastructure in place and the habit formed. Raising the gate incrementally (quarterly) is more sustainable than setting an aspirational target that blocks every PR. The goal is to make testing normal, not perfect.

**The test pyramid is a priority order for investment, not a prescriptive ratio.** Composables, stores, and pure functions must be tested first because they are the foundation that components and integrations depend on. Testing components before the composables they use means tests break for the wrong reasons. The priority order (composables → stores → components → contract) is derived from the dependency graph, not from dogma.

**The eval set is the go/no-go gate for LLM systems, and it must be bilingual.** An LLM system without a pre-built evaluation set of at least 50 bilingual samples is untestable. The eval set defines what "correct" means. Without it, every behavior change is a judgment call. The ragas 4-metric framework (faithfulness, relevance, precision, recall) provides the objective measures that replace subjective "it looks right" assessments.

**The CI gate must block on regression, not on coverage.** A CI pipeline that blocks on coverage percentage but passes on test failures is measuring the wrong thing. The CI must block when the eval set falls below the baseline threshold (the system got worse). The CI must also block when coverage drops below the gate. But the regression gate is the one that prevents silent quality degradation.

**Cross-project contract testing is the infrastructure that prevents integration rot.** When three projects (YiAi, YiVad, YiPet) share an RPC envelope and SSE streaming protocol, a change in one project's implementation can break the other two projects without any test failure. The cross-project contract test suite (co-built by all three teams) is the only mechanism that catches these breakages before they reach production.

## Key info

- **Test framework comparison and selection**: pytest (Python) — async support via pytest-asyncio + httpx, fixture-based dependency injection, coverage via pytest-cov, plugin ecosystem (pytest-xdist for parallel, pytest-benchmark for performance). Vitest (TypeScript/Vue) — 3x faster than Jest via vite-native transforms, @vue/test-utils for component mounting, happy-dom for lightweight DOM (faster than jsdom), coverage-v8 for native V8 coverage (no instrumented source). The Yi-family stack: YiAi → pytest, YiVad → Vitest 2, YiPet → Vitest 2 (Chrome extension context).
- **Test directory structure and naming conventions**: `tests/unit/` — pure functions, composables, stores (no external dependencies, mock everything); `tests/integration/` — API endpoints, database queries, middleware chains (real dependencies, test databases); `tests/eval/` — LLM response quality, RAG retrieval accuracy, agent trajectory correctness (bilingual samples, rubric-based). File naming: `test_<module_name>.py` (Python) or `<ModuleName>.test.ts` (TypeScript). Test function naming: `test_<function>_<scenario>_<expected_result>` (e.g., `test_search_knowledge_empty_index_returns_empty_list`).
- **Coverage gate progression**: Phase 1 (month 1) — 60% line coverage, CI warns but does not block; Phase 2 (month 3) — 70% line coverage, CI blocks on drop below current baseline; Phase 3 (month 6) — 80% line coverage, CI blocks on drop below 80%; Phase 4 (month 12) — 85% line + 70% branch coverage, CI blocks on both. The quarterly coverage gate review adjusts targets based on project maturity. The Yi-family projects: YiAi at Phase 2 (70% target), YiVad at Phase 1 (60% target), YiPet at Phase 0 (no coverage gate).
- **Eval set requirements for LLM systems**: Minimum 50 bilingual samples (Chinese + English), covering: (1) happy path (expected inputs, correct outputs), (2) edge cases (empty input, very long input, special characters), (3) adversarial cases (intentionally misleading prompts, prompt injection attempts), (4) regression cases (previously failed examples). ragas 4-metric framework: faithfulness (are claims grounded in context), relevance (is the response on-topic), precision (are retrieved documents relevant), recall (are all relevant documents retrieved). The baseline score is the current system's performance; the eval CI blocks when any metric drops >5% from baseline.
- **Cross-project contract test suite design**: The contract test suite covers: (1) RPC envelope — `{module_name, method_name, parameters}` → `{code, message, data}`, verify `code=0` for success, non-zero throws `YiAiError`; (2) SSE frame format — `data: {JSON}\n\n`, verify `done: true` frame always emitted, verify `releaseLock` in `finally`, verify `AbortError` handling; (3) Field name conventions — verify `filter` (not `query`), `target_file` (not `path`), `cname` (not `name`); (4) Error normalization — verify all error responses conform to `YiAiError` shape. The suite is co-maintained by all three project teams; a PR that changes the contract must update the contract test suite.
- **Yi-family testing infrastructure status**: YiAi — pytest set up with `tests/{unit,integration,eval}`, Phase 1-4 rollout complete, 70% coverage, eval set 50+ samples, ragas CI gate active. YiVad — Vitest set up with composable tests first, Phase 1-2 rollout in progress, 60% coverage target, SSE parser contract tests complete. YiPet — Vitest set up but no coverage gate, dual-world (service worker + content script) testing is challenging due to Chrome MV3 boundary, contract tests for RPC envelope complete.

## Scenario description

When new projects or old projects need QA infrastructure, the main owner must decide: QA framework choice / directory structure / coverage threshold / CI gate / rollout priority / eval set (LLM scenario) / contract QA (cross-project). This entry aggregates QA ADR, 4-stage rollout, eval set gate, and cross-project contract QA into a 2-hop path, avoiding "only testing components / coverage 0% / CI does not block".

## 2-hop reachability path

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `methodology/engineering-patterns/` | [evaluation-driven-development-pattern.md](../engineering/evaluation-driven-development.md) · [sse-streaming-pattern.md](../architecture-design/sse-streaming.md) (§SSE parser testing) · [staged-port-methodology-pattern.md](../architecture-design/staged-port-methodology.md) (parity QA baseline) |
| `methodology/ai-specific/` | [llm-evaluation-methods-summary.md](../../ai-engineer/methodology/llm-evaluation-methods.md) · [hallucination-mitigation-summary.md](../../ai-engineer/methodology/hallucination-mitigation.md) |
| `projects/YiAi/` | [adr-pytest-introduction.md](../../tech-lead/decisions/yiai--pytest-introduction.md) · [adr-rag-evaluation-infra.md](../../tech-lead/decisions/yiai--rag-evaluation-infra.md) · [dev-standards-summary.md](../../engineer/projects/yiai/dev-standards.md) |
| `projects/YiVad/` | [adr-vitest-introduction.md](../../tech-lead/decisions/yivad--vitest-introduction.md) · [adr-vitest-rollout.md](../../tech-lead/decisions/yivad--vitest-rollout.md) · [adr-aicr-phase-port.md](../../tech-lead/decisions/yivad--aicr-phase-port.md) (parity QA) · [dev-standards-summary.md](../../engineer/projects/yivad/dev-standards.md) |
| `projects/YiPet/` | [adr-biome-lint-format.md](../../tech-lead/decisions/yipet--biome-lint-format.md) · [adr-chrome-manifest-dual-world-boundary.md](../../tech-lead/decisions/yipet--chrome-manifest-dual-world-boundary.md) (dual-world message testing) · [adr-aicr-port-rollout.md](../../tech-lead/decisions/yipet--aicr-port-rollout.md) |
| `lessons/wins/` | [yivad-vitest-phase-one-win.md](../lessons/win-yivad-vitest-phase-one.md) · [yivad-vitest-phase-two-win.md](../lessons/win-yivad-vitest-phase-two.md) · [yivad-aicr-phase-port.md](../lessons/win-yivad-aicr-phase-port.md) (parity QA baseline) |
| `lessons/gotchas/` | [sse-ondone-guard.md](../lessons/gotcha-sse-ondone-guard.md) (§SSE parser testing) · [react-jsxdev-mismatch.md](../lessons/gotcha-react-jsxdev-mismatch.md) (dev/prod pattern) |
| `work/processes/` | [shared-client-vendor-rollout.md](shared-client-vendor-rollout.md) (contract QA matrix) · [engineering-productivity-metrics-summary.md](../process/engineering-productivity-metrics.md) |
| `work/tools/` | [biome-eslint-prettier-summary.md](biome-eslint-prettier.md) · [claude-code-tips-summary.md](claude-code-tips.md) |

## Action recommendations

1. Backend choose pytest + httpx + pytest-asyncio + coverage; directory `tests/{unit,integration,eval}` three parts.
2. Frontend choose Vitest 2 + @vue/test-utils + happy-dom (3x faster) + coverage-v8.
3. Priority composables → stores → components → contract (foundation layer first).
4. Coverage gate 60% starting (do not pursue 100%) + CI fallback > 5% block (warning = equals not run).
5. LLM scenario build eval set ≥ 50 bilingual samples + ragas 4 metrics + baseline + fallback threshold block.
6. Cross-project contract QA co-build (rpcCall + sseStream three-end co-build).
7. Subset run < 30s (CI not blocking); full run < 3 min.
8. Intentionally introduce fallback QA block = validation gate effective.
9. Parity QA baseline aligned with reference implementation (aicr porting via side-by-side).

## Anti-patterns

- **Setting coverage targets before the testing infrastructure exists.** Announcing an 80% coverage requirement when the project has no test runner, no test directory structure, and no example tests is a recipe for frustration. The first milestone is getting the test runner working and writing the first 10 tests. Coverage targets are a second-order concern that only becomes meaningful after the infrastructure is in place.

- **Testing UI components before testing business logic.** Writing component tests that verify button labels and CSS classes while the composables and stores that contain the business logic are untested means that the tests are fragile and low-value. Component tests should verify integration (does the component call the right composable with the right arguments), not pixel-level rendering. The business logic tests must exist first.

- **Running the full test suite on every commit.** A test suite that takes 3 minutes to run on every commit is a test suite that developers will bypass. The CI must have a fast subset (< 30 seconds) that runs on every commit and a full suite that runs on PRs. The fast subset catches the most common regressions; the full suite catches the edge cases.

- **Skipping the intentional regression test.** The validation that the CI gate actually blocks when quality degrades (intentionally introducing a regression and verifying the pipeline fails) is the most important test. A CI gate that has never been tested with a real regression is a gate that may not be working. The intentional regression test is the meta-test of the testing infrastructure.

- **Treating the eval set as a one-time build.** An eval set that is not updated as the system evolves becomes stale and stops detecting real regressions. New features, new edge cases, and new failure modes must be added to the eval set. The eval set is a living artifact that grows with the system. A static eval set is a test suite that tests last year's system.

## Related

- Related journey: [../../tech-lead/architecture/design-architecture-decision.md](../../tech-lead/architecture/design-architecture-decision.md) — QA ADR Decision
- Related journey: [../processes/roll-out-a-migration.md](../infrastructure/roll-out-a-migration.md) — QA 4-stage rollout
- Related journey: [../strategies/check-engineering-gotchas.md](../process/check-engineering-gotchas.md) — QA gotchas reference
- Upstream: [../../ai-engineer/methodology/README.md](../../ai-engineer/methodology/README.md) — LLM assessment method
