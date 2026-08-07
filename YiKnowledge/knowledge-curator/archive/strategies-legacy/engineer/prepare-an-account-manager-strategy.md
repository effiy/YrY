---

title: I want to prepare an account manager strategy
aliases:
- I want to prepare an account manager strategy
- account-manager-journey
- am-journey
- AM entry
tags:
- journeys
- account-manager
- am
- expansion
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
- body contains user-story header + 7 fixed-order sections
related:
- ./prepare-an-account-executive-strategy.md
- ./prepare-a-customer-success-strategy.md
- ./prepare-a-customer-retention-strategy.md
- ./prepare-a-renewal-strategy.md
- ../../engineer/architecture-design/ssot-view-layer.md
- ../../knowledge-curator/diagrams/directory-blueprint.md
- ../../knowledge-curator/diagrams/user-journey.md
review_cycle: quarterly
tacit: false
---

# I want to prepare an account manager strategy

> **As an** engineer, **I want to** prepare an account manager, **so that** launch is safe. 

> Reach "AM + account manager + expansion + governance + quarterly audit" within 2 hops for processes + thinking + cases. 

## Summary

- Processes: [code-review.md](../../engineer/processes/do-a-code-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- Thinking: [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platforms: [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [caching-pattern.md](../../engineer/patterns/caching.md) + [observability-pattern.md](../../engineer/patterns/observability.md)
- Cases: [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario

When preparing AM / account manager / expansion / governance / big-promo freeze / quarterly audit / retrospective, TL + sales + CS + finance + sponsor need to look up processes + thinking + cases. This entry aggregates AM-related processes + thinking + cases into a 2-hop path, avoiding "scattered accounts / missed expansion / churn risk / chaotic closure / no quarterly audit". 

## 2-hop reachability paths

| Hop 1 (category/leaf)  | Hop 2 (specific file)  |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [caching-pattern.md](../../engineer/patterns/caching.md) · [observability-pattern.md](../../engineer/patterns/observability.md) · [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — AM intent · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — inversion imagine scatter · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain reactions · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/pm-frameworks/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [pirate-funnel-summary.md](../../engineer/strategies/prepare-a-pirate-funnel-strategy.md) · [growth-loops-summary.md](../../engineer/strategies/prepare-a-growth-experiment-strategy.md) |
| `methodology/ai-specific/` | account-manager · am · expansion · account-plan |
| `product/strategy/` | [product-strategy-summary.md](../../product-manager/frameworks/prepare-a-product-strategy.md) · [data-strategy-summary.md](../../engineer/strategies/prepare-a-data-product-strategy.md) · [compliance-strategy-summary.md](../../engineer/strategies/prepare-an-audit-compliance-strategy.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) |
| `tech/ai-platform/` | am-runtime · account-store · expand-engine · audit-log |
| `tech/ai-foundations/` | am-patterns · account-suite · expand-baseline |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — AM reporting |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — platform matrix |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — AM incident archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [scenarios](../../brd/) · [reference](../../brd/) — AM business |
| `projects/` | each project's `architecture-summary.md` §PM + `adr-*` §AM |
| `journeys/` | [./prepare-an-account-executive-strategy.md](./prepare-an-account-executive-strategy.md) · [./prepare-a-customer-success-strategy.md](./prepare-a-customer-success-strategy.md) · [./prepare-a-customer-retention-strategy.md](./prepare-a-customer-retention-strategy.md) · [./prepare-a-renewal-strategy.md](./prepare-a-renewal-strategy.md) · [./prepare-a-security-strategy.md](./prepare-a-security-strategy.md) |

## Action recommendations

1. **First principles**: first ask "what does AM solve / what happens if not done / ROI / business impact"; do not expand for the sake of expanding; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md). 
2. **Inversion**: first imagine "how AM could go out of control (scattered accounts / missed expansion / churn risk / trust collapse) " then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md). 
3. **Second-order effects**: one expansion -> behavior change -> another expansion; see [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md). 
4. **Occam**: the simplest AM approach that meets business wins; don't pile up stages; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md). 
5. **Accounts**: must run accounts / tiers / owners + avoid scatter. 
6. **Expansion**: must run expansion / renewal / upsell + avoid misses. 
7. **Observable**: must run observable / traceability / audit + avoid misses. 
8. **Closed loop**: must run closed loop / retrospective / archive + avoid misses. 
9. **AE**: must run [i-want-to-prepare-an-account-executive-strategy.md](./prepare-an-account-executive-strategy.md) + avoid running bare. 
10. **CS**: must run [i-want-to-prepare-a-customer-success-strategy.md](./prepare-a-customer-success-strategy.md) + avoid running bare. 
11. **Retention**: must run [i-want-to-prepare-a-customer-retention-strategy.md](./prepare-a-customer-retention-strategy.md) + avoid running bare. 
12. **Renewal**: must run [i-want-to-prepare-a-renewal-strategy.md](./prepare-a-renewal-strategy.md) + avoid running bare. 
13. **Security**: must run [i-want-to-prepare-a-security-strategy.md](./prepare-a-security-strategy.md) + avoid running bare. 
14. **SSOT**: must run [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) account library + avoid multi-source. 
15. **Contract test**: must run [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) + avoid running bare. 
16. **RACI**: must run [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); platform / sales / CS / finance owners. 
17. **Freeze period**: big promotions follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) and do not change account tiers. 
18. **Reporting**: must run [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) to report internally and externally. 
19. **Monitoring**: must run [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) for AM exception alerts. 
20. **Retrospective**: after an AM incident must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive to [bugs/](../../engineer/lessons/failures/bugs). 
21. **Quarterly audit**: follow [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) to scan whether account tiers are still accurate / expansion is still reasonable. 
22. **ADR**: AM decisions must be recorded as ADRs; see [adr-template.md](../../knowledge-curator/templates/adr.md). 
23. **Flywheel**: good AM -> rising renewals -> rising trust -> more budget; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md). 

## Related

- Same-category journey: [./prepare-an-account-executive-strategy.md](./prepare-an-account-executive-strategy.md) — AE
- Same-category journey: [./prepare-a-customer-success-strategy.md](./prepare-a-customer-success-strategy.md) — CS
- Same-category journey: [./prepare-a-customer-retention-strategy.md](./prepare-a-customer-retention-strategy.md) — retention
- Same-category journey: [./prepare-a-renewal-strategy.md](./prepare-a-renewal-strategy.md) — renewal
- Upstream: [../../executive/strategy/README.md](../../executive/strategy/README.md) — strategy leaf entry
