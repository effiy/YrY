---

title: I want to prepare a lead generation strategy
aliases:
- I want to prepare a lead generation strategy
- lead-gen-journey
- lead-generation-journey
- mql-sql-journey
- lead generation entry
tags:
- journeys
- lead-generation
- mql
- sql
- lead-scoring
- nurturing
- lead-magnet
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
- filename is descriptive verb-phrase, hyphens only, no underscores or digits
- body contains user story header + 7 fixed-order sections
related:
- ./prepare-a-content-strategy.md
- ./prepare-a-growth-strategy.md
- ./prepare-a-revenue-ops-strategy.md
- ../../engineer/strategies/prepare-a-pirate-funnel-strategy.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a lead generation strategy

> **As an** engineer, **I want to** prepare a lead generation, **so that** launch is safe.

> "Source + magnet + scoring + nurturing + MQL/SQL + handoff + Governance + Quarterly audit" reach process + thinking + case within 2 hops.

## Summary

- Process: [code-review.md](../../engineer/processes/do-a-code-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- Thinking: [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform: [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [caching-pattern.md](../../engineer/patterns/caching.md) + [feature-flag-pattern.md](../../engineer/patterns/feature-flag.md)
- Case studies: [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario description

When preparing lead generation / MQL / SQL / scoring / nurturing / source / handoff / Governance / communication / promotion freeze / quarterly audit / retrospective, TL + marketing + sales + sponsor need to look up process + thinking + case. This entry aggregates lead-generation-related process + thinking + case into a 2-hop path, avoiding "scattered source / hollow scoring / missing nurturing / no quarterly audit".

## 2-hop reachability path

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [caching-pattern.md](../../engineer/patterns/caching.md) · [feature-flag-pattern.md](../../engineer/patterns/feature-flag.md) · [observability-pattern.md](../../engineer/patterns/observability.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — lead intent · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — invert gaps · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — cascade · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/pm-frameworks/` | [pirate-funnel-summary.md](../../engineer/strategies/prepare-a-pirate-funnel-strategy.md) · [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [growth-loops-summary.md](../../engineer/strategies/prepare-a-growth-experiment-strategy.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) |
| `product/strategy/` | [growth-strategy-summary.md](./prepare-a-growth-strategy.md) · [content-strategy-summary.md](./prepare-a-content-strategy.md) · [go-to-market-summary.md](../../product-manager/frameworks/prepare-a-go-to-market.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — lead communication |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — marketing matrix |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — lead incident archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [scenarios](../../brd/) · [reference](../../brd/) — lead business |
| `projects/` | Each project `architecture-summary.md` §growth + `adr-*` §lead |
| `journeys/` | [./prepare-a-content-strategy.md](./prepare-a-content-strategy.md) · [./prepare-a-growth-strategy.md](./prepare-a-growth-strategy.md) · [./prepare-a-revenue-ops-strategy.md](./prepare-a-revenue-ops-strategy.md) · [../../product-manager/frameworks/prepare-a-product-marketing-strategy.md](../../product-manager/frameworks/prepare-a-product-marketing-strategy.md) |

## Action recommendations

1. **First principles**: ask first "what does lead generation solve / what if not done / ROI / business impact"; do not generate leads for their own sake; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
2. **Inversion**: imagine "lead generation could go out of control (scattered source / hollow scoring / missing nurturing / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
3. **Second-order effects**: one tuning → row behavior changes → another tuning; see [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md).
4. **Occam**: the simplest source that meets business wins; do not pile up channels; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md).
5. **Source**: must run multi-channel (paid / organic / referral / event) + avoid single source.
6. **Magnet**: must run lead magnet (white paper / trial / demo) + no naked run.
7. **Scoring**: must run lead scoring + no gut call.
8. **Nurturing**: must run lead nurturing + no naked run; see [i-want-to-prepare-a-content-strategy.md](./prepare-a-content-strategy.md).
9. **MQL/SQL**: must run MQL → SQL handoff + no gut call.
10. **SLA**: must run sales follow-up SLA + not absent; see [i-want-to-define-an-slo.md](../../tech-lead/roadmap/define-an-slo.md).
11. **A/B**: must run [i-want-to-run-an-a-b-test.md](../processes/run-an-a-b-test.md) + no gut instinct.
12. **Personalization**: must run [i-want-to-prepare-a-personalization-strategy.md](./prepare-a-personalization-strategy.md) + no one-size-fits-all.
13. **SSOT**: must run [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) lead library + no multi-source.
14. **Feature flag**: must run [feature-flag-pattern.md](../../engineer/patterns/feature-flag.md) gray magnet.
15. **Cache**: must run [caching-pattern.md](../../engineer/patterns/caching.md) + no recompute.
16. **RACI**: must run [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); marketing / sales / TL / sponsor owners.
17. **Freeze period**: during promotions follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md); do not touch scoring.
18. **Communication**: must run [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) internally and externally.
19. **Monitoring**: must run [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) source / MQL / conversion alerts.
20. **Retrospective**: after lead incident must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive under [bugs/](../../engineer/lessons/failures/bugs).
21. **Quarterly audit**: follow [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md); scan whether sources still accurate + scoring still reasonable.
22. **ADR**: lead decisions must land in an ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md).
23. **Flywheel**: good leads → conversion up → revenue up → more budget; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md).

## Related

- Related journey: [./prepare-a-content-strategy.md](./prepare-a-content-strategy.md) — content
- Related journey: [./prepare-a-growth-strategy.md](./prepare-a-growth-strategy.md) — growth
- Related journey: [./prepare-a-revenue-ops-strategy.md](./prepare-a-revenue-ops-strategy.md) — RevOps
- Related journey: [../../product-manager/frameworks/prepare-a-product-marketing-strategy.md](../../product-manager/frameworks/prepare-a-product-marketing-strategy.md) — PMM
- Upstream: [../../product-manager/frameworks/README.md](../../product-manager/frameworks/README.md) — pm-frameworks leaf entry
