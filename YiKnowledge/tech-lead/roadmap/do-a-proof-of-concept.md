---
title: Do a proof of concept
aliases:
- I want to do a PoC
- poc-journey
- prototype-journey
- PoC entry
tags:
- journeys
- poc
- prototype
- dual-world
- eval-driven
- canary
category: tech-lead/roadmap
created: 2026-08-03
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
roles:
- tech-lead
- engineer
benefit: Tech leads can run structured proof-of-concept reviews with clear go/no-go criteria
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ./do-a-tech-selection.md
- ../../ai-engineer/platform/evaluate-an-llm-app.md
- ../../engineer/infrastructure/roll-out-a-migration.md
- ../../engineer/engineering/dual-world-boundary.md
review_cycle: quarterly
tacit: false
---

# I want to do a proof of concept

> **As a** tech lead, **I want to** do a proof of concept, **so that** review is structured. 

> "PoC design + evaluation + dual-world boundary + canary + decision — approve / kill / improve" reachable within 2 hops: thinking + evaluation patterns + review + cases. 

## Summary

- Thinking follows [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking--ockhams-razor.md)
- Evaluation follows [evaluation-driven-development-pattern.md](../../engineer/engineering/evaluation-driven-development.md) + [llm-evaluation-methods-summary.md](../../ai-engineer/methodology/llm-evaluation-methods.md)
- Dual-world follows [dual-world-boundary-pattern.md](../../engineer/engineering/dual-world-boundary.md)
- Review follows [design-review-process.md](../../product-manager/delivery/design-review.md) + [tech-review-process.md](../../product-manager/delivery/tech-review.md)
- Templates follow [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) + [tech-selection-evaluation-template.md](../../knowledge-curator/templates/tech-selection-evaluation.md)

## Core viewpoints

**A PoC's purpose is to kill bad ideas quickly, not to prove good ones.** The most valuable PoC is the one that fails in week one and saves three months of misguided development. Design the PoC to surface the riskiest assumptions first, and set a low bar for killing it. A PoC that succeeds too easily was not testing the right things.

**Pass/fail criteria must be written before the PoC starts, not after.** Without pre-defined thresholds, PoC results are inevitably interpreted to support whatever conclusion the team already wanted. Write the criteria first -- including specific, measurable thresholds -- then run the experiment. Do not change the criteria after seeing the results.

**A PoC that passes without finding any problems was a badly designed PoC.** If the PoC validates every assumption without uncovering any edge cases, failure modes, or unexpected behavior, the evaluation was not rigorous enough. A good PoC finds at least one thing that needs to be addressed before production.

**PoC code must die after the PoC.** The code written for a PoC is optimized for speed of validation, not for production quality -- it lacks error handling, security hardening, and maintainability. Reusing PoC code in production is the fastest path to technical debt. The correct pattern is: PoC validates the approach, then production code is written from scratch using proper engineering practices.

**Time-boxing is a feature, not a limitation.** The two-to-four-week time box forces the team to focus on the riskiest assumptions and prevents scope creep. A PoC that "needs just two more weeks" has already failed its time box and should be killed or converted to a formal project with proper planning, estimation, and resourcing.

## Key info

- **PoC timeboxing by category**: Library/framework evaluation — 1-2 weeks, test core API, performance at claimed limits, and integration with existing stack; Database/storage — 2-4 weeks, test data model fit, migration path, performance under projected load, backup/restore; Platform/architecture migration — 4-8 weeks, test the riskiest component first, validate the dual-world boundary pattern, measure migration cost; LLM/AI feature — 2-4 weeks, build eval set first (minimum 50 examples), test with real data, measure hallucination rate and latency. The Yi-family standard: timebox is set before the PoC starts and is not extended; if the PoC hits the timebox without clear results, the default decision is "kill."
- **PoC pass/fail criteria template (5 dimensions)**: (1) Functional — does it solve the specific problem? Threshold: ≥ 4/5 on requirements checklist; (2) Performance — does it meet latency/throughput targets under projected load? Threshold: P95 latency ≤ target, throughput ≥ target; (3) Integration — does it integrate with the existing stack without breaking changes? Threshold: ≤ 2 integration issues found; (4) Cost — is the TCO within budget? Threshold: ≤ projected budget × 1.2; (5) Team — can the team become productive with it? Threshold: ≤ 2 weeks to first production-quality code. Each dimension has a specific, measurable threshold written before the PoC starts. The overall decision is: pass (≥ 4 dimensions pass), improve (2-3 dimensions pass, specific issues identified), kill (≤ 1 dimension passes).
- **PoC environment requirements (4 levels of fidelity)**: (1) Synthetic — fully mocked data and dependencies, useful for API exploration and happy-path validation only; (2) Sampled — real de-identified data, mocked dependencies, minimum for meaningful evaluation; (3) Shadow — real data, real dependencies, read-only traffic mirroring, the gold standard for pre-production validation; (4) Canary — real data, real dependencies, real traffic (1% initially), the final validation before full rollout. The PoC should use at least level 2 (sampled); level 1 (synthetic) is acceptable only for the first week of exploration. The Yi-family standard: PoC uses level 2 or 3; level 4 (canary) is a separate phase after PoC passes.
- **PoC code disposal protocol (4 rules)**: (1) PoC code is in a separate repository or branch, never in the main branch; (2) PoC code is deleted after the PoC review (kept only in the archive for reference); (3) Production code is written from scratch, using the PoC's learnings but not its code; (4) The PoC's eval set, test cases, and configuration are preserved and reused for production validation. The dual-world boundary pattern ensures PoC code never leaks into production. The Yi-family projects follow this protocol: PoC code lives in a `poc/` directory or branch, is reviewed, then deleted.
- **PoC decision outcomes and follow-up actions**: (1) Pass — write an ADR documenting the decision, build the eval set into the CI pipeline, start production implementation with the dual-world boundary pattern, timebox the implementation to 2x the PoC duration; (2) Improve — document the specific issues found, propose a follow-up PoC to address them, set a new timebox (max 50% of original), if the second PoC also returns "improve," default to "kill"; (3) Kill — document the failure in a "lessons/gotchas" or "lessons/failures" file, archive the PoC code and data, celebrate the team for killing a bad idea early (saving 3-6 months of misguided development). The Yi-family projects archive PoC outcomes in `lessons/wins/` (for passed PoCs) or `lessons/failures/` (for killed PoCs).
- **Yi-family PoC history and outcomes**: YiAi RAG hybrid retrieval — PoC 2 weeks, tested vector-only vs. hybrid (vector + BM25), hybrid improved recall by 15%, passed; YiAi BRD Agent — PoC 3 weeks, tested LLM-as-judge evaluation, Claude evaluated BRD quality on completeness/actionability/risk coverage, passed; YiVad Rsbuild migration — PoC 1 week, tested build speed vs. Vite, Rsbuild 2x faster, passed; YiPet stack migration — PoC 2 weeks, tested React 18.3 + Ant Design 5.21 compatibility, passed; YiPet YiPett port — PoC 1 week, tested Esc-close + Ctrl+Shift+X toggle + role system prompt, passed. No PoCs have been killed yet in the Yi-family projects — a potential indicator that pass/fail criteria were not rigorous enough.

## Scenario

When validating technical feasibility / validating LLM feasibility / validating a new tool / validating a new process / validating a business assumption, architects + TLs + main owners need PoC design + evaluation + dual-world boundary + canary + decision. This entry aggregates PoC-related thinking + evaluation patterns + review + cases into a 2-hop path, avoiding "PoC turning into formal development / launching without evaluation / no dual-world separation / PoC conclusions not trustworthy". 

## 2-hop reachability paths

| Hop 1 (category/leaf)  | Hop 2 (specific file)  |
|---|---|
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md) · [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md) · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking--ockhams-razor.md) · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) · [strong-opinions-loosely-held-summary.md](../../knowledge-curator/templates/thinking--strong-opinions-loosely-held.md) |
| `methodology/engineering-patterns/` | [evaluation-driven-development-pattern.md](../../engineer/engineering/evaluation-driven-development.md) · [dual-world-boundary-pattern.md](../../engineer/engineering/dual-world-boundary.md) · [staged-port-methodology-pattern.md](../../engineer/architecture-design/staged-port-methodology.md) · [one-to-one-mapping-migration-pattern.md](../../engineer/architecture-design/one-to-one-mapping-migration.md) · [supply-chain-hardening-pattern.md](../../engineer/process/harden-supply-chain.md) · [inline-citation-rag-pattern.md](../../engineer/engineering/inline-citation-rag.md) |
| `methodology/ai-specific/` | [llm-evaluation-methods-summary.md](../../ai-engineer/methodology/llm-evaluation-methods.md) · [rag-design-patterns-summary.md](../../ai-engineer/methodology/rag-design-patterns.md) · [agent-architecture-patterns-summary.md](../../ai-engineer/methodology/agent-architecture-patterns.md) · [model-finetuning-decision-tree-summary.md](../../ai-engineer/methodology/model-finetuning-decision-tree.md) · [hallucination-mitigation-summary.md](../../ai-engineer/methodology/hallucination-mitigation.md) |
| `work/processes/` | [design-review-process.md](../../product-manager/delivery/design-review.md) · [tech-review-process.md](../../product-manager/delivery/tech-review.md) · [requirement-review-process.md](../../product-manager/delivery/requirement-review.md) · [canary-release-process.md](../../oncall-sre/release/canary-release.md) · [rollback-drill-process.md](../../oncall-sre/release/rollback-drill.md) · [data-migration-process.md](../../engineer/infrastructure/data-migration.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [tech-selection-evaluation-template.md](../../knowledge-curator/templates/tech-selection-evaluation.md) · [tech-selection-evaluation-summary.md](../../knowledge-curator/templates/tech-selection-evaluation.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [prd.md](../../knowledge-curator/templates/prd.md) |
| `tech/ai-platform/` | [llm-comparison-summary.md](../../ai-engineer/platform/llm-comparison.md) · [inference-engine-comparison-summary.md](../../ai-engineer/platform/inference-engine-comparison.md) · [vector-db-comparison-summary.md](../../ai-engineer/platform/vector-db-comparison.md) · [embedding-model-selection-summary.md](../../ai-engineer/platform/embedding-model-selection.md) · [llm-observability-comparison-summary.md](../../ai-engineer/platform/llm-observability-comparison.md) |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [lakehouse-architecture-summary.md](../../ai-engineer/data/lakehouse-architecture.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `industry/use-cases/` | [ai-after-sales-cases.md](../../product-manager/strategy/ai-after-sales-cases.md) · [ai-customer-service-cases.md](../../product-manager/strategy/ai-customer-service-cases.md) · [case-study-template.md](../../product-manager/strategy/case-study.md) — industry PoC reference |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/win-yiai-brd-agent-launch.md) · [yiai-rag-hybrid-retrieval-win.md](../../engineer/lessons/win-yiai-rag-hybrid-retrieval.md) · [yiai-llm-phase-{two,three,four,five}-win.md](../../engineer/lessons) · [yipet-stack-migration-win.md](../../engineer/lessons/win-yipet-stack-migration.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/win-yivad-aicr-phase-port.md) · [yry-vite-to-rsbuild-migration-win.md](../../engineer/lessons/win-yry-vite-to-rsbuild-migration.md) — PoC landing cases |
| `lessons/failures/` | [ai-product-launch-lessons-summary.md](../../engineer/lessons/failure-ai-product-launch-lessons.md) — PoC failure lessons |
| `lessons/gotchas/` | [sse-ondone-guard.md](../../engineer/lessons/gotcha-sse-ondone-guard.md) · [react-jsxdev-mismatch.md](../../engineer/lessons/gotcha-react-jsxdev-mismatch.md) · [vite-to-rsbuild-migration.md](../../engineer/lessons/gotcha-vite-to-rsbuild-migration.md) — PoC wrecks |
| `projects/` | Each project's `adr-*.md` — ADR landed after PoC passes |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts--rag-system.md) · [agent-tool-use-prompt.md](../../ai-engineer/methodology/prompts--agent-tool-use.md) · [brd-generation-prompt.md](../../ai-engineer/methodology/prompts--brd-generation.md) — prompts during PoC |

## Action recommendations

1. **First principles**: first ask "what question must the PoC answer / what is the risk / what are the pass conditions"; do not jump into action; see [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md). 
2. **Inversion**: first think "how will the PoC fail / how might it produce false conclusions / how might it be politicized" then design safeguards; see [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md). 
3. **Occam**: the smaller and simpler the PoC the better; the smallest scope that meets the validation need wins; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking--ockhams-razor.md). 
4. **Pass conditions**: write the thresholds for pass / fail / improve outcomes upfront; do not change thresholds after the fact. 
5. **Evaluation set**: must build an evaluation set (100-500 items) covering core scenarios + hard cases + edge cases; see [evaluation-driven-development-pattern.md](../../engineer/engineering/evaluation-driven-development.md). 
6. **Dual-world**: PoC code is physically isolated from production code + an abstraction layer; do not directly reuse PoC code in production; see [dual-world-boundary-pattern.md](../../engineer/engineering/dual-world-boundary.md). 
7. **Time box**: PoC 2-4 weeks; if exceeded must kill or convert to formal project; do not let PoC drag indefinitely. 
8. **Real data**: use real / de-identified data, do not fully mock; mocks make conclusions unreliable. 
9. **Canary**: after PoC passes follow [canary-release-process.md](../../oncall-sre/release/canary-release.md) for canary; do not go full rollout just because PoC passed. 
10. **Review**: after PoC completes follow [tech-review-process.md](../../product-manager/delivery/tech-review.md), with conclusions + data + decision + follow-up ADR; do not skip review after PoC. 
11. **Second-order**: how will PoC passing change the architecture / team / cost structure? see [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md). 
12. **Archive**: conclusions must be archived into [lessons/wins/](../../engineer/lessons) or [lessons/failures/](../../engineer/lessons), including data + decision rationale + follow-up actions. 

## Anti-patterns

- **PoC turning into production.** The PoC code gets shipped to production because "it already works." PoC code lacks error handling, security hardening, and maintainability. Production code must be written from scratch after the PoC validates the approach.

- **No pre-defined pass/fail criteria.** Running the PoC without clear thresholds, then retroactively deciding whether it "looks good." This turns the PoC into a confirmation exercise rather than a genuine evaluation. Write the criteria first.

- **Mocking everything.** Using fully mocked data and dependencies for the PoC. Mocked environments hide real-world edge cases -- network latency, data inconsistency, API rate limits -- that will surface in production. Use real or de-identified data whenever possible.

- **PoC scope creep.** The PoC starts as "validate the core assumption" and grows to "build a minimally viable version of the full feature." This defeats the time box and produces a half-finished product that is neither a good PoC nor a good production system.

- **Skipping the post-PoC review.** The PoC finishes, the team moves on to implementation, and no formal review is conducted. The conclusions, data, and decision rationale are lost, making it impossible to learn from the PoC or justify the decision to future team members.

## Related

- Same category journey: [./do-a-tech-selection.md](./do-a-tech-selection.md) — selection feeds PoC
- Same category journey: [../../ai-engineer/platform/evaluate-an-llm-app.md](../../ai-engineer/platform/evaluate-an-llm-app.md) — LLM PoC evaluation
- Same category journey: [../../engineer/infrastructure/roll-out-a-migration.md](../../engineer/infrastructure/roll-out-a-migration.md) — migration PoC
- Same category journey: [../../engineer/quality-security/run-an-experiment.md](../../engineer/quality-security/run-an-experiment.md) — assumption validation
- Upstream: [../../README.md](../../README.md) — engineering-patterns leaf entry
