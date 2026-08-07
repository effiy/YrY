---

title: I want to prepare a test strategy
aliases:
- I want to prepare a test strategy
- test-strategy-journey
- test-pyramid-journey
- test strategy entry
tags:
- journeys
- test-strategy
- test-pyramid
- unit
- integration
- e2e
- regression
category: engineer/strategies
created: 2026-08-03
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
roles:
- engineer
- tech-lead
benefit: launch is safe
acceptance_criteria:
- frontmatter roles + benefit + acceptance_criteria present
- descriptive verb-phrase filename, hyphens only, underscores and digits forbidden
- body contains user-story header + 7 fixed-order sections
related:
- ../tools/set-up-testing-infrastructure.md
- ../../ai-engineer/platform/evaluate-an-llm-app.md
- ../processes/ship-a-release.md
- ../../engineer/engineering/evaluation-driven-development.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a test strategy

> **As an** engineer, **I want to** prepare a test, **so that** launch is safe. 

> "Pyramid + coverage + eval set + regression + dual-world + monitoring + retrospective" 2-hop reachable patterns + process + thinking + cases. 

## Summary

- Patterns via [evaluation-driven-development-pattern.md](../../engineer/engineering/evaluation-driven-development.md) + [dual-world-boundary-pattern.md](../../engineer/engineering/dual-world-boundary.md) + [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) + [one-to-one-mapping-migration-pattern.md](../../engineer/architecture-design/one-to-one-mapping-migration.md)
- Process via [release-process.md](../../oncall-sre/release/release.md) + [canary-release-process.md](../../oncall-sre/release/canary-release.md) + [rollback-drill-process.md](../../oncall-sre/release/rollback-drill.md) + [code-review-process.md](../../ai-engineer/methodology/prompts/code-review.md)
- Thinking via [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Cases via [yivad-vitest-phase-{one,two,three,four}-win.md](../../engineer/lessons/wins) + [yipet-stack-migration-win.md](../../engineer/lessons/wins/yipet-stack-migration.md)

## Scenario

When doing test strategy / test pyramid / unit + integration + E2E + eval set / regression test set / contract test / performance test / coverage goal, TL + platform + engineer + QA need to look up patterns + process + thinking + cases. This entry aggregates test-strategy-related patterns + process + thinking to a 2-hop path, avoiding "inverted pyramid / inflated coverage / missing regression / contract leakage / fragile E2E / test debt explosion / no eval set". 

## 2-hop reachability paths

| Hop 1 (category / leaf)  | Hop 2 (specific file)  |
|---|---|
| `methodology/engineering-patterns/` | [evaluation-driven-development-pattern.md](../../engineer/engineering/evaluation-driven-development.md) · [dual-world-boundary-pattern.md](../../engineer/engineering/dual-world-boundary.md) · [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) · [one-to-one-mapping-migration-pattern.md](../../engineer/architecture-design/one-to-one-mapping-migration.md) · [staged-port-methodology-pattern.md](../../engineer/architecture-design/staged-port-methodology.md) · [supply-chain-hardening-pattern.md](../../engineer/quality-security/harden-supply-chain.md) · [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — test purpose · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — reverse-think missing coverage · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — test debt chain · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) — simplest test wins · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/ai-specific/` | [llm-evaluation-summary.md](../../ai-engineer/methodology/llm-evaluation-methods.md) · [hallucination-mitigation-summary.md](../../ai-engineer/methodology/hallucination-mitigation.md) · [prompt-injection-defense-summary.md](../../ai-engineer/methodology/prompt-injection-defense.md) · [rag-design-patterns-summary.md](../../ai-engineer/methodology/rag-design-patterns.md) — AI eval set |
| `work/processes/` | [release-process.md](../../oncall-sre/release/release.md) · [canary-release-process.md](../../oncall-sre/release/canary-release.md) · [rollback-drill-process.md](../../oncall-sre/release/rollback-drill.md) · [hotfix-release-process.md](../../oncall-sre/release/hotfix-release.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [code-review-process.md](../../ai-engineer/methodology/prompts/code-review.md) · [dependency-upgrade-process.md](../../engineer/processes/dependency-upgrade.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) |
| `resources/prompts/` | [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) — AI-assisted test case generation · [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [agent-tool-use-prompt.md](../../ai-engineer/methodology/prompts/agent-tool-use.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [meeting-notes-template.md](../../knowledge-curator/templates/meeting-notes.md) |
| `lessons/wins/` | [yivad-vitest-phase-{one,two,three,four}-win.md](../../engineer/lessons/wins) — test coverage phases · [yipet-stack-migration-win.md](../../engineer/lessons/wins/yipet-stack-migration.md) · [yry-vite-to-rsbuild-migration-win.md](../../engineer/lessons/wins/yry-vite-to-rsbuild-migration.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) · [yiai-rag-hybrid-retrieval-win.md](../../engineer/lessons/wins/yiai-rag-hybrid-retrieval.md) |
| `lessons/failures/` | [incident-postmortem-summary.md](../../engineer/lessons/failures/incident-postmortem.md) · [ai-product-launch-lessons-summary.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — missing-coverage archive |
| `lessons/gotchas/` | [sse-ondone-guard.md](./../lessons/gotchas/sse-ondone-guard.md) · [react-jsxdev-mismatch.md](./../lessons/gotchas/react-jsxdev-mismatch.md) · [vite-to-rsbuild-migration.md](./../lessons/gotchas/vite-to-rsbuild-migration.md) · [macos-fsevents-silent-drop.md](./../lessons/gotchas/macos-fsevents-silent-drop.md) |
| `tech/infra/` | [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) · [tech-debt-inventory-template.md](../../oncall-sre/observability/tech-debt-inventory.md) · [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) |
| `tech/ai-platform/` | [llm-observability-comparison-summary.md](../../ai-engineer/platform/llm-observability-comparison.md) — AI test monitoring · [inference-engine-comparison-summary.md](../../ai-engineer/platform/inference-engine-comparison.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) — test RACI · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `journeys/` | [../tools/set-up-testing-infrastructure.md](../tools/set-up-testing-infrastructure.md) · [../../ai-engineer/platform/evaluate-an-llm-app.md](../../ai-engineer/platform/evaluate-an-llm-app.md) · [../processes/ship-a-release.md](../processes/ship-a-release.md) · [../processes/do-a-code-review.md](../processes/do-a-code-review.md) |
| `projects/` | each project `adr-{pytest,vitest,biome,chrome-manifest}-*.md` + `dev-standards-summary.md` §test |

## Action recommendations

1. **First principles**: First ask "what does the test protect / user impact / what happens if not tested / ROI"; do not test for the sake of testing; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md). 
2. **Inversion**: First imagine "what happens if coverage is missing (production incident / rollback / user loss / trust collapse) " then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md). 
3. **Second-order effects**: test debt grows heavier the longer it drags; follow [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md). 
4. **Occam**: The simplest test that meets the protection need wins; do not pile up E2E; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md). 
5. **Pyramid**: Many unit (70%) + medium integration (20%) + few E2E (10%) ; do not invert. 
6. **Coverage**: Coverage is a floor not a ceiling; must run branch + boundary + exception paths; do not just look at the percentage. 
7. **Regression set**: Must build a regression set + must run + must update; follow [evaluation-driven-development-pattern.md](../../engineer/engineering/evaluation-driven-development.md). 
8. **Contract test**: Cross-service must run [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md); prevent schema drift. 
9. **Dual-world**: During migration follow [dual-world-boundary-pattern.md](../../engineer/engineering/dual-world-boundary.md) + [one-to-one-mapping-migration-pattern.md](../../engineer/architecture-design/one-to-one-mapping-migration.md) + behavior alignment. 
10. **Eval set**: AI applications must run [llm-evaluation-summary.md](../../ai-engineer/methodology/llm-evaluation-methods.md) + business metrics + human labeling. 
11. **E2E**: Must be stable + must have retry + must have screenshots + must be isolated; do not be fragile. 
12. **Performance test**: Must run [i-want-to-do-a-load-test.md](../processes/do-a-load-test.md) + [i-want-to-do-a-performance-audit.md](../processes/do-a-performance-audit.md). 
13. **Security test**: Must run SAST / DAST / penetration; follow [i-want-to-do-a-security-audit.md](../../oncall-sre/incident-response/do-a-security-audit.md). 
14. **CI**: Tests must enter [i-want-to-set-up-ci-cd.md](../tools/set-up-ci-cd.md); must run before PR + must be fast (<10min) . 
15. **Data**: Must mask + must be replayable + must be isolated; do not pollute production. 
16. **AI-assisted**: Use [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) to have AI generate test cases + scan for missing coverage. 
17. **Freeze period**: During big promos follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md); do not change the test baseline. 
18. **Monitoring**: After test launch follow [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) to monitor production error rate + missing-coverage metrics. 
19. **Retrospective**: After an incident follow [incident-postmortem-template.md](../../engineer/lessons/failures/incident-postmortem.md) to retrospective missing coverage + add test cases + archive under [bugs/](../../engineer/lessons/failures/bugs). 
20. **Quarterly audit**: Follow [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) to scan whether test coverage is still accurate. 
21. **Flywheel**: Tests done well → trust → faster release → more test investment; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md). 
22. **ADR**: Test strategy must land in ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md). 

## Related

- Same-class journey: [../tools/set-up-testing-infrastructure.md](../tools/set-up-testing-infrastructure.md) — test infrastructure
- Same-class journey: [../../ai-engineer/platform/evaluate-an-llm-app.md](../../ai-engineer/platform/evaluate-an-llm-app.md) — LLM evaluation
- Same-class journey: [../processes/ship-a-release.md](../processes/ship-a-release.md) — release
- Same-class journey: [../processes/do-a-code-review.md](../processes/do-a-code-review.md) — code review
- Upstream: [../../engineer/patterns/README.md](../../engineer/patterns/README.md) — engineering-patterns leaf entry
