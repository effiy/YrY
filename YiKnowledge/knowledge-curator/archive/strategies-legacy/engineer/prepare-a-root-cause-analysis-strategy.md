---

title: I want to prepare a root cause analysis strategy
aliases:
- I want to prepare a root cause analysis strategy
- root-cause-analysis-journey
- rca-journey
- 5-whys-journey
- Root cause analysis entry
tags:
- journeys
- root-cause-analysis
- rca
- 5-whys
- fishbone
- incident-learning
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
- filename is descriptive verb-phrase, hyphens only, no underscores or digits
- body contains user story header + 7 fixed-order sections
related:
- ../../tech-lead/roadmap/prepare-a-blameless-postmortem-strategy.md
- ../../tech-lead/roadmap/prepare-an-incident-postmortem-strategy.md
- ../../oncall-sre/incident-response/prepare-an-incident-response-strategy.md
- ../../oncall-sre/incident-response/prepare-an-incident-commander-strategy.md
- ../../engineer/architecture-design/ssot-view-layer.md
- ../../knowledge-curator/diagrams/directory-blueprint.md
- ../../knowledge-curator/diagrams/user-journey.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a root cause analysis strategy

> **As an** engineer, **I want to** prepare a root cause analysis, **so that** launch is safe. 

> "Root cause + 5 Whys + fishbone + governance + quarterly audit" reaches Process + Thinking + Case study within 2 hops.

## Summary

- Process follows [code-review.md](../../engineer/processes/do-a-code-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- Thinking follows [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform follows [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [caching-pattern.md](../../engineer/patterns/caching.md) + [observability-pattern.md](../../engineer/patterns/observability.md)
- Case study follows [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario description

When preparing root cause analysis / 5 Whys / fishbone / governance / promotion freeze / quarterly audit / retrospective, TL + platform + algorithm + data + sponsor need to look up Process + Thinking + Case study. This entry aggregates root-cause-related Process + Thinking + Case study into 2-hop paths, avoiding "scattered root causes / missing 5 Whys / drift / messy closed loops / no quarterly audit".

## 2-hop reachability path

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [caching-pattern.md](../../engineer/patterns/caching.md) · [observability-pattern.md](../../engineer/patterns/observability.md) · [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — essence of root cause · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — reverse-think scatter · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain effects · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/pm-frameworks/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [pirate-funnel-summary.md](../../engineer/strategies/prepare-a-pirate-funnel-strategy.md) · [growth-loops-summary.md](../../engineer/strategies/prepare-a-growth-experiment-strategy.md) |
| `methodology/ai-specific/` | root-cause-analysis · rca · 5-whys · fishbone |
| `product/strategy/` | [product-strategy-summary.md](../../product-manager/frameworks/prepare-a-product-strategy.md) · [data-strategy-summary.md](../../engineer/strategies/prepare-a-data-product-strategy.md) · [compliance-strategy-summary.md](../../engineer/strategies/prepare-an-audit-compliance-strategy.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) |
| `tech/ai-platform/` | rca-runtime · root-cause-store · 5whys-engine · audit-log |
| `tech/ai-foundations/` | rca-patterns · 5whys-suite · fishbone-baseline |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — root cause communication |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — platform matrix |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — root cause incident archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [scenarios](../../brd/) · [reference](../../brd/) — root cause business |
| `projects/` | Each project's `architecture-summary.md` §PM + `adr-*` §root cause |
| `journeys/` | [../../tech-lead/roadmap/prepare-a-blameless-postmortem-strategy.md](../../tech-lead/roadmap/prepare-a-blameless-postmortem-strategy.md) · [../../tech-lead/roadmap/prepare-an-incident-postmortem-strategy.md](../../tech-lead/roadmap/prepare-an-incident-postmortem-strategy.md) · [../../oncall-sre/incident-response/prepare-an-incident-response-strategy.md](../../oncall-sre/incident-response/prepare-an-incident-response-strategy.md) · [../../oncall-sre/incident-response/prepare-an-incident-commander-strategy.md](../../oncall-sre/incident-response/prepare-an-incident-commander-strategy.md) · [../../oncall-sre/incident-response/prepare-an-incident-drill-strategy.md](../../oncall-sre/incident-response/prepare-an-incident-drill-strategy.md) |

## Action recommendations

1. **First principles**: First ask "what does root cause solve / what happens if not done / ROI / business impact"; don't do root cause for its own sake; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md). 
2. **Inversion**: First think "how could root cause analysis go out of control (scattered causes / missing 5 Whys / drift / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md). 
3. **Second-order effects**: One root cause pass → behavior changes → another root cause pass; follow [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md). 
4. **Occam**: The simplest root cause method that satisfies the business wins; don't pile up methods; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md). 
5. **Root cause**: Must run root cause / deep dig / closed loop + no scatter. 
6. **5 Whys**: Must run 5 Whys / questioning / chain-style + no omissions. 
7. **Fishbone**: Must run fishbone / categorization / causality + no omissions. 
8. **Action items**: Must run action items / owners / closed loop + no omissions. 
9. **Blameless retrospective**: Must follow [i-want-to-prepare-a-blameless-postmortem-strategy.md](../../tech-lead/roadmap/prepare-a-blameless-postmortem-strategy.md) + no naked run. 
10. **Incident retrospective**: Must follow [i-want-to-prepare-an-incident-postmortem-strategy.md](../../tech-lead/roadmap/prepare-an-incident-postmortem-strategy.md) + no naked run. 
11. **Incident response**: Must follow [i-want-to-prepare-an-incident-response-strategy.md](../../oncall-sre/incident-response/prepare-an-incident-response-strategy.md) + no naked run. 
12. **Incident commander**: Must follow [i-want-to-prepare-an-incident-commander-strategy.md](../../oncall-sre/incident-response/prepare-an-incident-commander-strategy.md) + no naked run. 
13. **Drill**: Must follow [i-want-to-prepare-an-incident-drill-strategy.md](../../oncall-sre/incident-response/prepare-an-incident-drill-strategy.md) + no naked run. 
14. **SSOT**: Must follow [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) for the root cause library + no multi-source. 
15. **Contract QA**: Must follow [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) + no naked run. 
16. **RACI**: Must follow [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); platform / algorithm / data / TL owner. 
17. **Freeze period**: During promotions use [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) — don't change root cause definitions. 
18. **Communication**: Must follow [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) to communicate inside and outside. 
19. **Monitoring**: Must follow [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) for action-item alerts. 
20. **Retrospective**: After a root cause incident must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive in [bugs/](../../engineer/lessons/failures/bugs). 
21. **Quarterly audit**: Follow [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) to scan whether root cause definitions are still accurate / methods still reasonable. 
22. **ADR**: Root cause decisions must be captured in an ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md). 
23. **Flywheel**: Good root cause → faster learning → higher trust → more budget; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md). 

## Related

- Related journey: [../../tech-lead/roadmap/prepare-a-blameless-postmortem-strategy.md](../../tech-lead/roadmap/prepare-a-blameless-postmortem-strategy.md) — blameless retrospective
- Related journey: [../../tech-lead/roadmap/prepare-an-incident-postmortem-strategy.md](../../tech-lead/roadmap/prepare-an-incident-postmortem-strategy.md) — incident retrospective
- Related journey: [../../oncall-sre/incident-response/prepare-an-incident-response-strategy.md](../../oncall-sre/incident-response/prepare-an-incident-response-strategy.md) — incident response
- Related journey: [../../oncall-sre/incident-response/prepare-an-incident-commander-strategy.md](../../oncall-sre/incident-response/prepare-an-incident-commander-strategy.md) — incident commander
- Upstream: [../../executive/strategy/README.md](../../executive/strategy/README.md) — strategy leaf entry
