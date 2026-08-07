---

title: I want to prepare an LLM jailbreak defense strategy
aliases:
- I want to prepare an LLM jailbreak defense strategy
- llm-jailbreak-defense-journey
- jailbreak-defense-journey
- LLM jailbreak defense entry
tags:
- journeys
- llm-jailbreak
- jailbreak-defense
- prompt-injection
- ai-safety
- system-prompt
category: ai-engineer/foundations
created: 2026-08-03
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
roles:
- ai-engineer
benefit: launch is safe
acceptance_criteria:
- frontmatter roles + benefit + acceptance_criteria present
- descriptive verb-phrase filename, hyphens only, underscores and digits forbidden
- body contains user-story header + 7 fixed-order sections
related:
- ./prepare-a-prompt-injection-defense-strategy.md
- ./prepare-an-ai-safety-strategy.md
- ../../engineer/strategies/prepare-an-ai-red-team-strategy.md
- ../../engineer/strategies/prepare-a-content-moderation-strategy.md
- ../../engineer/architecture-design/ssot-view-layer.md
- ../../knowledge-curator/diagrams/directory-blueprint.md
- ../../knowledge-curator/diagrams/user-journey.md
review_cycle: quarterly
tacit: false
---

# I want to prepare an LLM jailbreak defense strategy

> **As an** ai engineer, **I want to** prepare an llm jailbreak defense, **so that** launch is safe.

> "System prompt + input filter + output filter + monitoring + red team + quarterly audit" reach within 2 hops Process + Thinking + Case study.

## Summary

- Process goes via [code-review.md](../../engineer/processes/do-a-code-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- Thinking goes via [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform goes via [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [caching-pattern.md](../../engineer/patterns/caching.md) + [observability-pattern.md](../../engineer/patterns/observability.md)
- Case study goes via [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario

When preparing LLM jailbreak / system prompt / indirect injection / output filter / red team / big-promo freeze / quarterly audit / retrospective, TL + security + algorithm + platform + sponsor need to look up Process + Thinking + Case study. This entry aggregates LLM jailbreak defense related Process + Thinking + Case study into a 2-hop path, to avoid "scattered system / filter leakage / indirect / closed-loop chaos / no quarterly audit".

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [caching-pattern.md](../../engineer/patterns/caching.md) · [observability-pattern.md](../../engineer/patterns/observability.md) · [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — defense intent · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — inversion imagination · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/pm-frameworks/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [pirate-funnel-summary.md](../../engineer/strategies/prepare-a-pirate-funnel-strategy.md) · [growth-loops-summary.md](../../engineer/strategies/prepare-a-growth-experiment-strategy.md) |
| `methodology/ai-specific/` | llm-jailbreak · prompt-injection · system-prompt-leak · indirect-injection |
| `product/strategy/` | [product-strategy-summary.md](../../product-manager/frameworks/prepare-a-product-strategy.md) · [security-strategy-summary.md](../../engineer/strategies/prepare-a-cybersecurity-strategy.md) · [compliance-strategy-summary.md](../../engineer/strategies/prepare-an-audit-compliance-strategy.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) |
| `tech/ai-platform/` | guardrail-runtime · input-filter · output-filter · model-router |
| `tech/ai-foundations/` | jailbreak-patterns · defense-suite · indirect-injection-baseline |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — jailbreak reporting |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — security matrix |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — jailbreak incident archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [scenarios](../../brd/) · [reference](../../brd/) — jailbreak business |
| `projects/` | each project `architecture-summary.md` §PM + `adr-*` §jailbreak |
| `journeys/` | [./prepare-a-prompt-injection-defense-strategy.md](./prepare-a-prompt-injection-defense-strategy.md) · [./prepare-an-ai-safety-strategy.md](./prepare-an-ai-safety-strategy.md) · [../../engineer/strategies/prepare-an-ai-red-team-strategy.md](../../engineer/strategies/prepare-an-ai-red-team-strategy.md) · [../../engineer/strategies/prepare-a-content-moderation-strategy.md](../../engineer/strategies/prepare-a-content-moderation-strategy.md) · [../../engineer/strategies/prepare-an-ai-ethics-strategy.md](../../engineer/strategies/prepare-an-ai-ethics-strategy.md) |

## Action recommendations

1. **First principles**: first ask "what does jailbreak defense solve / what happens if not done / ROI / business impact"; do not defend for the sake of defending; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
2. **Inversion**: first imagine "jailbreak could go out of control (scattered system / filter leakage / indirect / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
3. **Second-order effects**: one defense → attack changes → another defense; follow [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md).
4. **Occam**: the simplest defense that satisfies business wins; do not pile up filters; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md).
5. **System prompt**: must run system prompt / isolation / no leakage + no scattering.
6. **Input filter**: must run pattern / keyword / encoding / length + no leakage.
7. **Output filter**: must run content / refuse-answer / template / sandbox + no leakage.
8. **Indirect injection**: must run tools / retrieval / multi-modal / trust boundary + no leakage.
9. **Prompt injection**: must run [i-want-to-prepare-a-prompt-injection-defense-strategy.md](./prepare-a-prompt-injection-defense-strategy.md) + no naked run.
10. **AI safety**: must run [i-want-to-prepare-an-ai-safety-strategy.md](./prepare-an-ai-safety-strategy.md) + no naked run.
11. **AI red team**: must run [i-want-to-prepare-an-ai-red-team-strategy.md](../../engineer/strategies/prepare-an-ai-red-team-strategy.md) + no naked run.
12. **Content moderation**: must run [i-want-to-prepare-a-content-moderation-strategy.md](../../engineer/strategies/prepare-a-content-moderation-strategy.md) + no naked run.
13. **AI ethics**: must run [i-want-to-prepare-an-ai-ethics-strategy.md](../../engineer/strategies/prepare-an-ai-ethics-strategy.md) + no naked run.
14. **SSOT**: must run [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) jailbreak library + no multi-source.
15. **Contract test**: must run [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) + no naked run.
16. **RACI**: must run [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); security / algorithm / platform / TL owner.
17. **Freeze period**: during big-promo follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) do not move guardrails.
18. **Reporting**: must run [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) report internally and externally.
19. **Monitoring**: must run [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) jailbreak alerts.
20. **Retrospective**: after jailbreak incident must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive [bugs/](../../engineer/lessons/failures/bugs).
21. **Quarterly audit**: follow [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) scan guardrails whether still accurate / filter whether still reasonable.
22. **ADR**: jailbreak decisions must land ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md).
23. **Flywheel**: defense good → trust rises → compliance rises → more budget; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md).

## Related

- Same-class journey: [./prepare-a-prompt-injection-defense-strategy.md](./prepare-a-prompt-injection-defense-strategy.md) — prompt injection defense
- Same-class journey: [./prepare-an-ai-safety-strategy.md](./prepare-an-ai-safety-strategy.md) — AI safety
- Same-class journey: [../../engineer/strategies/prepare-an-ai-red-team-strategy.md](../../engineer/strategies/prepare-an-ai-red-team-strategy.md) — AI red team
- Same-class journey: [../../engineer/strategies/prepare-a-content-moderation-strategy.md](../../engineer/strategies/prepare-a-content-moderation-strategy.md) — content moderation
- Upstream: [../../executive/strategy/README.md](../../executive/strategy/README.md) — strategy leaf entry
