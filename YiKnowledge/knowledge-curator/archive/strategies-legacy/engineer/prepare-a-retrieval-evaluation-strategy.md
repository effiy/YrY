---

title: I want to prepare a retrieval evaluation strategy
aliases:
- I want to prepare a retrieval evaluation strategy
- retrieval-evaluation-journey
- retrieval-eval-journey
- retrieval evaluation entry
tags:
- journeys
- retrieval-evaluation
- retrieval-eval
- ndcg
- sre
category: engineer/strategies
created: 2026-08-04
updated: 2026-08-04
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
- Filename is descriptive verb-phrase, hyphens only, no underscores or digits
- body contains user-story header + 7 fixed-order sections
related:
- ../../ai-engineer/foundations/prepare-a-rag-evaluation-strategy.md
- ../../ai-engineer/foundations/prepare-a-vector-index-strategy.md
- ./prepare-an-embedding-strategy.md
- ../../ai-engineer/foundations/prepare-a-retrieval-augmented-generation-strategy.md
- ../../engineer/architecture-design/ssot-view-layer.md
- ../../knowledge-curator/diagrams/directory-blueprint.md
- ../../knowledge-curator/diagrams/user-journey.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a retrieval evaluation strategy

> **As an** engineer, **I want to** prepare a retrieval evaluation, **so that** launch is safe. 

> "Retrieval evaluation + NDCG + recall + governance + quarterly audit" reachable within 2 hops via process + thinking + case studies. 

## Summary

- Process follows [code-review.md](../../engineer/processes/do-a-code-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- Thinking follows [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform follows [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [caching-pattern.md](../../engineer/patterns/caching.md) + [observability-pattern.md](../../engineer/patterns/observability.md)
- Cases follow [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario

When preparing retrieval evaluation / NDCG / recall / governance / big-promotion freeze / quarterly audit / retrospective, TLs + platform + algorithm + data + sponsors need to look up process + thinking + cases. This entry aggregates retrieval evaluation related process + thinking + cases into a 2-hop path, avoiding "scattered metrics / missed baselines / regression risk / messy closed loop / no quarterly audit". 

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [caching-pattern.md](../../engineer/patterns/caching.md) · [observability-pattern.md](../../engineer/patterns/observability.md) · [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — intent of evaluation · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — inversion to find scatter · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain effect · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/pm-frameworks/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [pirate-funnel-summary.md](../../engineer/strategies/prepare-a-pirate-funnel-strategy.md) · [growth-loops-summary.md](../../engineer/strategies/prepare-a-growth-experiment-strategy.md) |
| `methodology/ai-specific/` | retrieval-evaluation · ndcg · recall · mrr |
| `product/strategy/` | [product-strategy-summary.md](../../product-manager/frameworks/prepare-a-product-strategy.md) · [data-strategy-summary.md](../../engineer/strategies/prepare-a-data-product-strategy.md) · [compliance-strategy-summary.md](../../engineer/strategies/prepare-an-audit-compliance-strategy.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) |
| `tech/ai-platform/` | eval-runtime · benchmark-store · score-engine · audit-log |
| `tech/ai-foundations/` | eval-patterns · benchmark-suite · score-baseline |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — evaluation reporting |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — platform matrix |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — evaluation wreck archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [scenarios](../../brd/) · [reference](../../brd/) — evaluation business |
| `projects/` | Each project's `architecture-summary.md` §PM + `adr-*` §evaluation |
| `journeys/` | [../../ai-engineer/foundations/prepare-a-rag-evaluation-strategy.md](../../ai-engineer/foundations/prepare-a-rag-evaluation-strategy.md) · [../../ai-engineer/foundations/prepare-a-vector-index-strategy.md](../../ai-engineer/foundations/prepare-a-vector-index-strategy.md) · [./prepare-an-embedding-strategy.md](./prepare-an-embedding-strategy.md) · [./i-want-to-prepare-a-retrieval-augmented-generation-strategy.md](../../ai-engineer/foundations/prepare-a-vector-index-strategy.md) · [./prepare-a-security-strategy.md](./prepare-a-security-strategy.md) |

## Action recommendations

1. **First principles**: first ask "what must retrieval evaluation solve / what happens if not done / ROI / business impact"; do not evaluate for evaluation's sake; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md). 
2. **Inversion**: first think "how evaluation could go out of control (scattered metrics / missed baselines / regression risk / collapsed trust)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md). 
3. **Second-order effects**: one evaluation → behavior change → another evaluation; see [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md). 
4. **Occam**: the simplest evaluation that meets business needs wins; do not pile up metrics; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md). 
5. **Metrics**: must run metrics / NDCG / recall + no scatter. 
6. **Baseline**: must run baseline / gold / regression + no gaps. 
7. **Observable**: must run observable / traceable / audit + no gaps. 
8. **Closed loop**: must run closed loop / retrospective / archive + no gaps. 
9. **RAG evaluation**: must run [i-want-to-prepare-a-rag-evaluation-strategy.md](../../ai-engineer/foundations/prepare-a-rag-evaluation-strategy.md) + no naked run. 
10. **Vector index**: must run [i-want-to-prepare-a-vector-index-strategy.md](../../ai-engineer/foundations/prepare-a-vector-index-strategy.md) + no naked run. 
11. **Embedding**: must run [i-want-to-prepare-an-embedding-strategy.md](./prepare-an-embedding-strategy.md) + no naked run. 
12. **RAG**: must run [i-want-to-prepare-a-retrieval-augmented-generation-strategy.md](../../ai-engineer/foundations/prepare-a-vector-index-strategy.md) + no naked run. 
13. **Security**: must run [i-want-to-prepare-a-security-strategy.md](./prepare-a-security-strategy.md) + no naked run. 
14. **SSOT**: must run [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) baseline library + no multi-source. 
15. **Contract test**: must run [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) + no naked run. 
16. **RACI**: must follow [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); platform / algorithm / data / TL owner.
17. **Freeze period**: during promotions follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) and do not touch baselines. 
18. **Reporting**: must follow [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) to report internally and externally.
19. **Monitoring**: must run [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) for evaluation exception alerts. 
20. **Retrospective**: after evaluation wrecks must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive in [bugs/](../../engineer/lessons/failures/bugs). 
21. **Quarterly audit**: follow [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) to scan whether metrics are still accurate / baselines still reasonable. 
22. **ADR**: evaluation decisions must land an ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md). 
23. **Flywheel**: good evaluation → accurate regression → trust rises → more budget; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md). 

## Related

- similar journey: [../../ai-engineer/foundations/prepare-a-rag-evaluation-strategy.md](../../ai-engineer/foundations/prepare-a-rag-evaluation-strategy.md) — RAG evaluation
- similar journey: [../../ai-engineer/foundations/prepare-a-vector-index-strategy.md](../../ai-engineer/foundations/prepare-a-vector-index-strategy.md) — vector index
- similar journey: [./prepare-an-embedding-strategy.md](./prepare-an-embedding-strategy.md) — embedding
- similar journey: [./i-want-to-prepare-a-retrieval-augmented-generation-strategy.md](../../ai-engineer/foundations/prepare-a-vector-index-strategy.md) — RAG
- Upstream: [../../executive/strategy/README.md](../../executive/strategy/README.md) - strategy leaf entry
