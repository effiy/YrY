---

title: I want to prepare a market sizing strategy
aliases:
- I want to prepare a market scale estimation strategy
- market-sizing-journey
- tam-sam-som-journey
- market-potential-journey
- market-scale-entry
tags:
- journeys
- market-sizing
- tam
- sam
- som
- top-down
- bottom-up
- penetration
category: executive/strategy
created: 2026-08-03
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
roles:
- executive
benefit: launch is safe
acceptance_criteria:
- frontmatter roles + benefit + acceptance_criteria present
- filename is descriptive verb-phrase, hyphens only, no underscores or digits
- body contains user story header + 7 fixed-order sections
related:
- ../../engineer/strategies/prepare-a-tam-sam-som-strategy.md
- ./prepare-a-market-research-strategy.md
- ./business-model-canvas.md
- ../../engineer/strategies/prepare-a-competitive-intelligence-strategy.md
- ../../engineer/architecture-design/ssot-view-layer.md
- ../../knowledge-curator/diagrams/directory-blueprint.md
- ../../knowledge-curator/diagrams/user-journey.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a market sizing strategy

> **As an** executive, **I want to** prepare a market sizing, **so that** launch is safe.

> "TAM + SAM + SOM + bottom-up + top-down + penetration rate + Governance + Quarterly audit" reach within 2 hops Process + Thinking + Case study.

## Summary

- Process follows [code-review.md](../../engineer/processes/do-a-code-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- Thinking follows [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform follows [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [caching-pattern.md](../../engineer/patterns/caching.md) + [observability-pattern.md](../../engineer/patterns/observability.md)
- Case study follows [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario description

When preparing market scale / TAM / SAM / SOM / bottom-up / top-down / penetration rate / Governance / Communication / promotion freeze / Quarterly audit / Retrospective, TL + PM + strategy + finance + sponsor need to look up Process + Thinking + Case study. This entry aggregates market-scale-related Process + Thinking + Case study into a 2-hop path, avoiding "scattered definitions / hollow hypotheses / missing penetration rate / chaotic closed loop / no quarterly audit".

## 2-hop reachability path

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [caching-pattern.md](../../engineer/patterns/caching.md) · [observability-pattern.md](../../engineer/patterns/observability.md) · [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — intent of estimation · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — Inversion on hollow hypotheses · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/pm-frameworks/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [pirate-funnel-summary.md](../../engineer/strategies/prepare-a-pirate-funnel-strategy.md) · [growth-loops-summary.md](../../engineer/strategies/prepare-a-growth-experiment-strategy.md) |
| `product/strategy/` | [business-model-summary.md](../../executive/strategy/business-model-canvas.md) · [market-research-summary.md](../../executive/strategy/prepare-a-market-research-strategy.md) · [product-strategy-summary.md](../../product-manager/frameworks/prepare-a-product-strategy.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) |
| `industry/` | [reports/](../../executive/industry/reports) · [market-trends/](../../executive/industry/market-trends) · [use-cases/](../../product-manager/industry-cases) — market report archive |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — estimation Communication |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — strategy matrix |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — estimation Incident archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [scenarios](../../brd/) · [reference](../../brd/) — estimation business |
| `projects/` | each project `architecture-summary.md` § PM + `adr-*` § estimation |
| `journeys/` | [../../engineer/strategies/prepare-a-tam-sam-som-strategy.md](../../engineer/strategies/prepare-a-tam-sam-som-strategy.md) · [./prepare-a-market-research-strategy.md](./prepare-a-market-research-strategy.md) · [./business-model-canvas.md](./business-model-canvas.md) · [../../engineer/strategies/prepare-a-competitive-intelligence-strategy.md](../../engineer/strategies/prepare-a-competitive-intelligence-strategy.md) · [../../engineer/strategies/prepare-a-unit-economics-strategy.md](../../engineer/strategies/prepare-a-unit-economics-strategy.md) |

## Action recommendations

1. **First principles**: first ask "what does market scale solve / what happens if not done / ROI / business impact"; do not estimate for the sake of estimating; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
2. **Inversion**: first imagine "estimation could go out of control (scattered definitions / hollow hypotheses / missing penetration rate / chaotic closed loop / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
3. **Second-order effects**: one-shot estimation → row variation → and one-shot estimation; follow [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md).
4. **Occam**: satisfy business with the simplest estimation that wins; do not pile up dimensions; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md).
5. **TAM/SAM/SOM**: must run TAM / SAM / SOM layered + no gut call; follow [i-want-to-prepare-a-tam-sam-som-strategy.md](../../engineer/strategies/prepare-a-tam-sam-som-strategy.md).
6. **Bottom-up**: must run bottom-up estimation (customers x unit price) + no gut call.
7. **Top-down**: must run top-down estimation (total market x penetration rate) + no gut call.
8. **Penetration rate**: must run penetration rate hypothesis + no omission.
9. **Market research**: must run [i-want-to-prepare-a-market-research-strategy.md](./prepare-a-market-research-strategy.md) + no naked run.
10. **Competition**: must run [i-want-to-prepare-a-competitive-intelligence-strategy.md](../../engineer/strategies/prepare-a-competitive-intelligence-strategy.md) + no naked run.
11. **Business pattern**: must run [i-want-to-prepare-a-business-model-summary.md](./business-model-canvas.md) + no naked run.
12. **Unit economics**: must run [i-want-to-prepare-a-unit-economics-strategy.md](../../engineer/strategies/prepare-a-unit-economics-strategy.md) + no naked run.
13. **SSOT**: must run [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) estimation library + no multi-source.
14. **Contract QA**: must run [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) + no naked run.
15. **Cache**: must run [caching-pattern.md](../../engineer/patterns/caching.md) + no re-estimation.
16. **RACI**: must run [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); PM / strategy / finance / TL owner.
17. **Freeze period**: during promotions use [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) do not touch estimation.
18. **Communication**: must run [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) Communication inside and outside.
19. **Monitoring**: must run [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) hypothesis / practical deviation alert.
20. **Retrospective**: estimation Incident after must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) Retrospective + Archive [bugs/](../../engineer/lessons/failures/bugs).
21. **Quarterly audit**: follow [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) sweep hypothesis whether still accurate / penetration rate whether still reasonable.
22. **ADR**: estimation Decision must land ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md).
23. **Flywheel**: estimation good → investment accurate → resource sufficient → more business; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md).

## Related

- Related journey: [../../engineer/strategies/prepare-a-tam-sam-som-strategy.md](../../engineer/strategies/prepare-a-tam-sam-som-strategy.md) — TAM/SAM/SOM
- Related journey: [./prepare-a-market-research-strategy.md](./prepare-a-market-research-strategy.md) — market research
- Related journey: [./business-model-canvas.md](./business-model-canvas.md) — business pattern
- Related journey: [../../engineer/strategies/prepare-a-competitive-intelligence-strategy.md](../../engineer/strategies/prepare-a-competitive-intelligence-strategy.md) — competition
- Upstream: [../../executive/strategy/README.md](../../executive/strategy/README.md) — strategy leaf entry
