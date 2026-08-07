---

title: I want to prepare a security awareness strategy
aliases:
- I want to prepare a security awareness strategy
- security-awareness-journey
- security-training-journey
- security awareness entry
tags:
- journeys
- security-awareness
- security-training
- phishing-simulation
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
- descriptive verb-phrase filename, hyphens only, underscores and digits forbidden
- body contains user story header + 7 fixed-order sections
related:
- ./prepare-a-phishing-simulation-strategy.md
- ./prepare-an-insider-threat-strategy.md
- ./prepare-a-security-strategy.md
- ./prepare-a-compliance-as-code-strategy.md
- ../../engineer/architecture-design/ssot-view-layer.md
- ../../knowledge-curator/diagrams/directory-blueprint.md
- ../../knowledge-curator/diagrams/user-journey.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a security awareness strategy

> **As an** engineer, **I want to** prepare a security awareness, **so that** launch is safe. 

> "Awareness + training + drill + governance + quarterly audit" reach within 2 hops process + thinking + case. 

## Summary

- Process walks [code-review.md](../../engineer/processes/do-a-code-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- Thinking walks [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform walks [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [caching-pattern.md](../../engineer/patterns/caching.md) + [observability-pattern.md](../../engineer/patterns/observability.md)
- Case walks [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario

When preparing awareness / training / drill / governance / promotion freeze / quarterly audit / retrospective, TL + platform + algorithm + data + sponsor need to look up process + thinking + case. This entry aggregates awareness-related process + thinking + case to 2-hop paths, avoiding "scattered awareness / missed training / weak coverage / chaotic closed loop / no quarterly audit". 

## 2-hop reachability paths

| Hop 1 (category/leaf)  | Hop 2 (specific file)  |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [caching-pattern.md](../../engineer/patterns/caching.md) · [observability-pattern.md](../../engineer/patterns/observability.md) · [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — intent of awareness · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — inversion on scatter · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/pm-frameworks/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [pirate-funnel-summary.md](../../engineer/strategies/prepare-a-pirate-funnel-strategy.md) · [growth-loops-summary.md](../../engineer/strategies/prepare-a-growth-experiment-strategy.md) |
| `methodology/ai-specific/` | security-awareness · security-training · phishing-simulation · gamification |
| `product/strategy/` | [product-strategy-summary.md](../../product-manager/frameworks/prepare-a-product-strategy.md) · [data-strategy-summary.md](../../engineer/strategies/prepare-a-data-product-strategy.md) · [compliance-strategy-summary.md](../../engineer/strategies/prepare-an-audit-compliance-strategy.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) |
| `tech/ai-platform/` | awareness-runtime · training-store · simulation-engine · audit-log |
| `tech/ai-foundations/` | awareness-patterns · training-suite · simulation-baseline |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — awareness comms |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — platform matrix |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — awareness incident archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [scenarios](../../brd/) · [reference](../../brd/) — awareness business |
| `projects/` | each project `architecture-summary.md` §PM + `adr-*` §awareness |
| `journeys/` | [./prepare-a-phishing-simulation-strategy.md](./prepare-a-phishing-simulation-strategy.md) · [./prepare-an-insider-threat-strategy.md](./prepare-an-insider-threat-strategy.md) · [./prepare-a-security-strategy.md](./prepare-a-security-strategy.md) · [./prepare-a-compliance-as-code-strategy.md](./prepare-a-compliance-as-code-strategy.md) · [../../oncall-sre/incident-response/prepare-an-incident-comms-strategy.md](../../oncall-sre/incident-response/prepare-an-incident-comms-strategy.md) |

## Action recommendations

1. **first principles**: first ask "what does awareness solve / what happens if not done / ROI / business impact"; do not be aware for awareness's sake; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md). 
2. **inversion**: first think "awareness could go out of control (scattered awareness / missed training / weak coverage / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md). 
3. **second-order effects**: one awareness round -> behavior changes -> another awareness round; see [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md). 
4. **Occam**: the simplest awareness that satisfies the business wins; do not pile up courses; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md). 
5. **Segmentation**: must run segmentation / role / risk + no scatter. 
6. **Course**: must run course / content / short video + no omissions. 
7. **Drill**: must run drill / phishing / retrospective + no omissions. 
8. **closed loop**: must run closed loop / measurement / archive + no omissions. 
9. **Phishing drill**: must run [i-want-to-prepare-a-phishing-simulation-strategy.md](./prepare-a-phishing-simulation-strategy.md) + no naked run. 
10. **Insider threat**: must run [i-want-to-prepare-an-insider-threat-strategy.md](./prepare-an-insider-threat-strategy.md) + no naked run. 
11. **Security**: must run [i-want-to-prepare-a-security-strategy.md](./prepare-a-security-strategy.md) + no naked run. 
12. **Compliance as code**: must run [i-want-to-prepare-a-compliance-as-code-strategy.md](./prepare-a-compliance-as-code-strategy.md) + no naked run. 
13. **Incident comms**: must run [i-want-to-prepare-an-incident-comms-strategy.md](../../oncall-sre/incident-response/prepare-an-incident-comms-strategy.md) + no naked run. 
14. **SSOT**: must run [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) awareness library + no multi-source. 
15. **contract test**: must run [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) + no naked run. 
16. **RACI**: must run [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); platform / algorithm / data / TL owner. 
17. **Freeze period**: during promotions use [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) do not change awareness. 
18. **Comms**: must run [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) communicate inside and outside. 
19. **monitoring**: must run [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) coverage rate alerts. 
20. **retrospective**: after awareness incidents must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive [bugs/](../../engineer/lessons/failures/bugs). 
21. **quarterly audit**: walk [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) scan whether awareness still accurate / whether courses still reasonable. 
22. **ADR**: awareness decisions must land in ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md). 
23. **Flywheel**: awareness done well -> risk drops -> trust rises -> more budget; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md). 

## Related

- Same-category journey: [./prepare-a-phishing-simulation-strategy.md](./prepare-a-phishing-simulation-strategy.md) — phishing drill
- Same-category journey: [./prepare-an-insider-threat-strategy.md](./prepare-an-insider-threat-strategy.md) — insider threat
- Same-category journey: [./prepare-a-security-strategy.md](./prepare-a-security-strategy.md) — security
- Same-category journey: [./prepare-a-compliance-as-code-strategy.md](./prepare-a-compliance-as-code-strategy.md) — compliance as code
- Upstream: [../../executive/strategy/README.md](../../executive/strategy/README.md) — strategy leaf entry
