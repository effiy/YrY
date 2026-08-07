---

title: I want to prepare a major incident response strategy
aliases:
- I want to prepare a major incident response strategy
- major-incident-journey
- sev1-journey
- major incident entry
tags:
- journeys
- major-incident
- sev1
- incident-response
- sre
category: oncall-sre/incident-response
created: 2026-08-04
updated: 2026-08-04
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
roles:
- oncall-sre
- engineer
benefit: launch is safe
acceptance_criteria:
- frontmatter roles + benefit + acceptance_criteria present
- descriptive verb-phrase filename, hyphens only, underscores and digits forbidden
- body contains user-story header + 7 fixed-order sections
related:
- ./prepare-an-incident-response-strategy.md
- ../../engineer/strategies/prepare-an-on-call-strategy.md
- ../../tech-lead/roadmap/prepare-a-blameless-postmortem-strategy.md
- ../../engineer/strategies/prepare-a-crisis-communications-strategy.md
- ../../engineer/architecture-design/ssot-view-layer.md
- ../../knowledge-curator/diagrams/directory-blueprint.md
- ../../knowledge-curator/diagrams/user-journey.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a major incident response strategy

> **As a** oncall sre, **I want to** prepare a major incident response, **so that** launch is safe. 

> "Major incident + Sev1 + escalation + governance + quarterly audit" reach within 2 hops to process + thinking + case studies. 

## Summary

- Process follows [code-review.md](../../engineer/processes/do-a-code-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- Thinking follows [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform follows [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [caching-pattern.md](../../engineer/patterns/caching.md) + [observability-pattern.md](../../engineer/patterns/observability.md)
- Case studies follow [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario

When preparing for major incident / Sev1 / escalation / governance / big-promo freeze / quarterly audit / retrospective, TL + platform + algorithm + data + sponsor need to look up process + thinking + case studies. This entry aggregates major-incident-related process + thinking + case studies into 2-hop paths, avoiding "escalation scattered / reporting missed / decision risky / closed-loop messy / no quarterly audit". 

## 2-hop reachability paths

| Hop 1 (category/leaf)  | Hop 2 (specific file)  |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [caching-pattern.md](../../engineer/patterns/caching.md) · [observability-pattern.md](../../engineer/patterns/observability.md) · [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — major intent · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — inversion imagining scatter · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/pm-frameworks/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [pirate-funnel-summary.md](../../engineer/strategies/prepare-a-pirate-funnel-strategy.md) · [growth-loops-summary.md](../../engineer/strategies/prepare-a-growth-experiment-strategy.md) |
| `methodology/ai-specific/` | major-incident · sev1 · incident-commander · escalation |
| `product/strategy/` | [product-strategy-summary.md](../../product-manager/frameworks/prepare-a-product-strategy.md) · [data-strategy-summary.md](../../engineer/strategies/prepare-a-data-product-strategy.md) · [compliance-strategy-summary.md](../../engineer/strategies/prepare-an-audit-compliance-strategy.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) |
| `tech/ai-platform/` | major-runtime · sev-store · escalate-engine · audit-log |
| `tech/ai-foundations/` | major-patterns · sev-suite · escalate-baseline |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — major incident reporting |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — platform matrix |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — major incident postmortem archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [scenarios](../../brd/) · [reference](../../brd/) — major business |
| `projects/` | each project `architecture-summary.md` §PM + `adr-*` §major |
| `journeys/` | [./prepare-an-incident-response-strategy.md](./prepare-an-incident-response-strategy.md) · [../../engineer/strategies/prepare-an-on-call-strategy.md](../../engineer/strategies/prepare-an-on-call-strategy.md) · [../../tech-lead/roadmap/prepare-a-blameless-postmortem-strategy.md](../../tech-lead/roadmap/prepare-a-blameless-postmortem-strategy.md) · [../../engineer/strategies/prepare-a-crisis-communications-strategy.md](../../engineer/strategies/prepare-a-crisis-communications-strategy.md) · [../../engineer/strategies/prepare-a-security-strategy.md](../../engineer/strategies/prepare-a-security-strategy.md) |

## Action recommendations

1. **first principles**: first ask "major incident what to solve / what happens if not done / ROI / business impact"; do not do major for major's sake; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md). 
2. **inversion**: first imagine "major could go out of control (escalation scattered / reporting missed / decision risky / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md). 
3. **second-order effects**: one major -> behavior changes -> another major; follow [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md). 
4. **Occam**: the simplest response that satisfies business wins; do not pile up roles; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md). 
5. **grading**: must run grading / Sev / severity + dispersion. 
6. **escalation**: must run escalation / reporting / decision + no leakage. 
7. **command**: must run command / role / IC + no leakage. 
8. **closed loop**: must run closed loop / retrospective / archive + no leakage. 
9. **incident response**: must run [i-want-to-prepare-an-incident-response-strategy.md](./prepare-an-incident-response-strategy.md) + no naked run. 
10. **on-call**: must run [i-want-to-prepare-an-on-call-strategy.md](../../engineer/strategies/prepare-an-on-call-strategy.md) + no naked run. 
11. **retrospective**: must run [i-want-to-prepare-a-blameless-postmortem-strategy.md](../../tech-lead/roadmap/prepare-a-blameless-postmortem-strategy.md) + no naked run. 
12. **crisis communications**: must run [i-want-to-prepare-a-crisis-communications-strategy.md](../../engineer/strategies/prepare-a-crisis-communications-strategy.md) + no naked run. 
13. **security**: must run [i-want-to-prepare-a-security-strategy.md](../../engineer/strategies/prepare-a-security-strategy.md) + no naked run. 
14. **SSOT**: must run [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) incident library + no multi-source. 
15. **contract test**: must run [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) + no naked run. 
16. **RACI**: must run [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); platform / algorithm / data / TL owner. 
17. **freeze period**: during big promos follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) do not move roles. 
18. **reporting**: must run [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) report internally and externally. 
19. **monitoring**: must run [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) incident exception alerts. 
20. **retrospective**: after major incident must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive [bugs/](../../engineer/lessons/failures/bugs). 
21. **quarterly audit**: follow [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) to scan whether roles are still accurate / thresholds are still reasonable. 
22. **ADR**: major decisions must land in ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md). 
23. **flywheel**: major response done well -> loss reduced -> trust rises -> more budget; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md). 

## Related

- same-category journey: [./prepare-an-incident-response-strategy.md](./prepare-an-incident-response-strategy.md) — incident response
- same-category journey: [../../engineer/strategies/prepare-an-on-call-strategy.md](../../engineer/strategies/prepare-an-on-call-strategy.md) — on-call
- same-category journey: [../../tech-lead/roadmap/prepare-a-blameless-postmortem-strategy.md](../../tech-lead/roadmap/prepare-a-blameless-postmortem-strategy.md) — blameless retrospective
- same-category journey: [../../engineer/strategies/prepare-a-crisis-communications-strategy.md](../../engineer/strategies/prepare-a-crisis-communications-strategy.md) — crisis communications
- upstream: [../../executive/strategy/README.md](../../executive/strategy/README.md) — strategy leaf entry
