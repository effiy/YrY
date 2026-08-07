---

title: I want to prepare a QA strategy
aliases:
- I want to prepare a QA strategy
- qa-strategy-journey
- test-pyramid-journey
- Test strategy entry
tags:
- journeys
- qa-strategy
- test-pyramid
- integration-test
- e2e-test
- regression
- flaky
- coverage
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
benefit: launch is safe
acceptance_criteria:
- frontmatter roles + benefit + acceptance_criteria present
- descriptive verb-phrase filename, hyphens only, underscores and digits forbidden
- body contains user-story header + 7 fixed-order sections
related:
- ../tools/set-up-testing-infrastructure.md
- ./prepare-a-test-strategy.md
- ../processes/do-a-code-review.md
- ../../engineer/patterns/contract-test-baseline.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a QA strategy

> **As an** engineer, **I want to** prepare a qa, **so that** launch is safe.

> "Pyramid + integration + e2e + regression + flaky + coverage + monitoring + retrospective" — 2-hop reachability for process + thinking + cases.

## Summary

- Process path: [code-review.md](../../engineer/processes/do-a-code-review.md) + [requirement-review.md](../../product-manager/processes/requirement-review.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- Thinking path: [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform path: [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) + [eval-driven](../../engineer/engineering/evaluation-driven-development.md) + [dual-world-boundary-pattern.md](../../engineer/engineering/dual-world-boundary.md)
- Case path: [yiai-supply-chain-hardening-win.md](../../engineer/lessons/wins/yiai-supply-chain-hardening.md) + [incident-postmortem-summary.md](../../engineer/lessons/failures/incident-postmortem.md)

## Scenario

When preparing a QA strategy / test pyramid / integration test / e2e / regression strategy / flaky governance / smoke / coverage / shift-left / shift-right / quarterly quality audit / pre-promo QA prep / new project test system / test platform selection, TL + QA + architect + sponsor need to consult process + thinking + cases. This entry aggregates QA-strategy-related process + thinking + cases onto a 2-hop path, avoiding "pyramid chaos / missed integration / e2e drift / regression drag / flaky ignored / fake coverage / no monitoring / no retrospective".

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [requirement-review.md](../../product-manager/processes/requirement-review.md) · [design-review.md](../../product-manager/processes/design-review.md) · [tech-review.md](../../product-manager/processes/tech-review.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) |
| `methodology/engineering-patterns/` | [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) · [eval-driven](../../engineer/engineering/evaluation-driven-development.md) · [dual-world-boundary-pattern.md](../../engineer/engineering/dual-world-boundary.md) · [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [supply-chain-hardening-pattern.md](../../engineer/quality-security/harden-supply-chain.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — test essence · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — think backwards about missed tests · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain effects · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/ai-specific/` | [llm-evaluation-summary.md](../../ai-engineer/methodology/llm-evaluation-methods.md) · [rag-design-patterns-summary.md](../../ai-engineer/methodology/rag-design-patterns.md) · [hallucination-mitigation-summary.md](../../ai-engineer/methodology/hallucination-mitigation.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [meeting-notes-template.md](../../knowledge-curator/templates/meeting-notes.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) |
| `resources/prompts/` | [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [agent-tool-use-prompt.md](../../ai-engineer/methodology/prompts/agent-tool-use.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — quality reporting |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — QA matrix |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `tech/ai-platform/` | [llm-observability-comparison-summary.md](../../ai-engineer/platform/llm-observability-comparison.md) · [llm-comparison-summary.md](../../ai-engineer/platform/llm-comparison.md) |
| `lessons/wins/` | [yiai-supply-chain-hardening-win.md](../../engineer/lessons/wins/yiai-supply-chain-hardening.md) · [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yipet-stack-migration-win.md](../../engineer/lessons/wins/yipet-stack-migration.md) |
| `lessons/failures/` | [incident-postmortem-summary.md](../../engineer/lessons/failures/incident-postmortem.md) · [ai-product-launch-lessons-summary.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — missed-test archive |
| `lessons/gotchas/` | [macos-fsevents-silent-drop.md](./../lessons/gotchas/macos-fsevents-silent-drop.md) · [sse-ondone-guard.md](./../lessons/gotchas/sse-ondone-guard.md) · [react-jsxdev-mismatch.md](./../lessons/gotchas/react-jsxdev-mismatch.md) |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `projects/` | Each project's `dev-standards-summary.md` §test + `adr-*` §test |
| `journeys/` | [../tools/set-up-testing-infrastructure.md](../tools/set-up-testing-infrastructure.md) · [./prepare-a-test-strategy.md](./prepare-a-test-strategy.md) · [../processes/do-a-code-review.md](../processes/do-a-code-review.md) · [../processes/run-a-bug-bash.md](../processes/run-a-bug-bash.md) |

## Action recommendations

1. **First principles**: first ask "what does the QA strategy serve / what happens if not done / ROI / user impact"; do not test for the sake of testing; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
2. **Inversion**: first imagine "how QA could miss tests (inverted pyramid / missed integration / e2e drift / flaky ignored / fake coverage)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
3. **Second-order effects**: one missed test → production impact → trust collapse; see [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md).
4. **Occam**: the simplest tests that meet needs win; do not pile up tests; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md).
5. **Pyramid**: must run the pyramid (unit > integration > e2e) + ratio 70/20/10 + cost comparison.
6. **Contract**: cross-service must run [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) + schema validation + versioned.
7. **Eval-driven**: AI products must run [eval-driven](../../engineer/engineering/evaluation-driven-development.md) + golden set + LLM-as-judge + regression.
8. **Dual-world**: migration tests must run [dual-world-boundary-pattern.md](../../engineer/engineering/dual-world-boundary.md) + dual-run + diff.
9. **Regression**: must run regression suites + tiering (smoke / regression / full) + gates (PR / merge / release).
10. **Flaky**: must run flaky governance + isolation + retry caps + drive to zero; see [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md).
11. **Coverage**: must run coverage + key-path priority + diff coverage gate; do not chase 100%.
12. **Shift-left**: must run shift-left + PR-embedded + design-review test design.
13. **Shift-right**: must run shift-right + canary + monitoring + feature-flag fallback.
14. **AI evaluation**: LLMs must run [llm-evaluation-summary.md](../../ai-engineer/methodology/llm-evaluation-methods.md) + prompt / response / token / latency tests.
15. **RACI**: must run [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); QA / engineering / sponsor owner.
16. **Freeze period**: during promos, follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md); do not change test suites.
17. **Monitoring**: must run [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) dashboards + thresholds + alerts (success rate / flaky / coverage).
18. **Retrospective**: after a missed-test incident, must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive under [bugs/](../../engineer/lessons/failures/bugs).
19. **Quarterly audit**: run [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) to scan whether suites are still accurate + whether coverage is still reasonable.
20. **ADR**: QA decisions must be recorded as ADRs; see [adr-template.md](../../knowledge-curator/templates/adr.md).
21. **Flywheel**: good QA → quality rises → trust rises → more investment; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md).

## Related

- Same-class journey: [../tools/set-up-testing-infrastructure.md](../tools/set-up-testing-infrastructure.md) — test infrastructure
- Same-class journey: [./prepare-a-test-strategy.md](./prepare-a-test-strategy.md) — test strategy
- Same-class journey: [../processes/do-a-code-review.md](../processes/do-a-code-review.md) — code review
- Same-class journey: [../processes/run-a-bug-bash.md](../processes/run-a-bug-bash.md) — bug bash
- Upstream: [../../engineer/patterns/README.md](../../engineer/patterns/README.md) — patterns leaf entry
