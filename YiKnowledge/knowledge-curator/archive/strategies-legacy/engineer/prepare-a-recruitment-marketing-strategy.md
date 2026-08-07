---

title: I want to prepare a recruitment marketing strategy
aliases:
- i-want-to-prepare-a-recruitment-marketing-strategy
- recruitment-marketing-journey
- recruiting-marketing-journey
- recruitment-marketing-entry
tags:
- journeys
- recruitment-marketing
- recruiting-marketing
- talent-brand
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
- ./prepare-a-talent-acquisition-strategy.md
- ./prepare-an-employer-branding-strategy.md
- ./prepare-a-recruiting-strategy.md
- ./prepare-a-content-marketing-strategy.md
- ../../engineer/architecture-design/ssot-view-layer.md
- ../../knowledge-curator/diagrams/directory-blueprint.md
- ../../knowledge-curator/diagrams/user-journey.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a recruitment marketing strategy

> **As an** engineer, **I want to** prepare a recruitment marketing, **so that** launch is safe. 

> "Recruitment marketing + channel + content + governance + quarterly audit" reaches processes + thinking + case studies within 2 hops. 

## Summary

- Processes follow [code-review.md](../../engineer/processes/do-a-code-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- Thinking follows [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform follows [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [caching-pattern.md](../../engineer/patterns/caching.md) + [observability-pattern.md](../../engineer/patterns/observability.md)
- Case studies follow [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario

When preparing recruitment marketing / channel / content / governance / promotion freeze / quarterly audit / retrospective, TL + TA + marketing + HR + sponsor need to look up processes + thinking + case studies. This entry aggregates recruitment-marketing-related processes + thinking + case studies into a 2-hop path, avoiding "scattered channels / missed conversions / failure risk / messy closed loop / no quarterly audit". 

## 2-hop reachability paths

| Hop 1 (class/leaf)  | Hop 2 (specific file)  |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [caching-pattern.md](../../engineer/patterns/caching.md) · [observability-pattern.md](../../engineer/patterns/observability.md) · [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — recruitment marketing intent · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — inversion scatter · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/pm-frameworks/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [pirate-funnel-summary.md](../../engineer/strategies/prepare-a-pirate-funnel-strategy.md) · [growth-loops-summary.md](../../engineer/strategies/prepare-a-growth-experiment-strategy.md) |
| `methodology/ai-specific/` | recruitment-marketing · recruiting-marketing · talent-brand · sourcing |
| `product/strategy/` | [product-strategy-summary.md](../../product-manager/frameworks/prepare-a-product-strategy.md) · [data-strategy-summary.md](../../engineer/strategies/prepare-a-data-product-strategy.md) · [compliance-strategy-summary.md](../../engineer/strategies/prepare-an-audit-compliance-strategy.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) |
| `tech/ai-platform/` | recrut-runtime · channel-store · convert-engine · audit-log |
| `tech/ai-foundations/` | recrut-patterns · channel-suite · convert-baseline |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — recruitment marketing reporting |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — platform matrix |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — recruitment marketing failure archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [scenarios](../../brd/) · [reference](../../brd/) — recruitment marketing business |
| `projects/` | each project `architecture-summary.md` PM section + `adr-*` recruitment marketing section |
| `journeys/` | [./prepare-a-talent-acquisition-strategy.md](./prepare-a-talent-acquisition-strategy.md) · [./prepare-an-employer-branding-strategy.md](./prepare-an-employer-branding-strategy.md) · [./prepare-a-recruiting-strategy.md](./prepare-a-recruiting-strategy.md) · [./prepare-a-content-marketing-strategy.md](./prepare-a-content-marketing-strategy.md) · [./prepare-a-security-strategy.md](./prepare-a-security-strategy.md) |

## Action recommendations

1. **First principles**: first ask "what does recruitment marketing solve / what happens if not done / ROI / business impact"; do not market for the sake of marketing; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md). 
2. **Inversion**: first think "how recruitment marketing could go out of control (scattered channels / missed conversions / failure risk / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md). 
3. **Second-order effects**: one campaign -> behavior changes -> another campaign; follow [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md). 
4. **Occam**: the simplest recruitment marketing that satisfies the business wins; do not pile up channels; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md). 
5. **Channels**: must run channels / priority / content + no scatter. 
6. **Conversion**: must run conversion / application / trace + no missing. 
7. **Observable**: must run observability / trace / audit + no missing. 
8. **Closed loop**: must run closed loop / retrospective / archive + no missing. 
9. **Talent acquisition**: must run [i-want-to-prepare-a-talent-acquisition-strategy.md](./prepare-a-talent-acquisition-strategy.md) + no naked run. 
10. **Employer branding**: must run [i-want-to-prepare-an-employer-branding-strategy.md](./prepare-an-employer-branding-strategy.md) + no naked run. 
11. **Recruiting**: must run [i-want-to-prepare-a-recruiting-strategy.md](./prepare-a-recruiting-strategy.md) + no naked run. 
12. **Content marketing**: must run [i-want-to-prepare-a-content-marketing-strategy.md](./prepare-a-content-marketing-strategy.md) + no naked run. 
13. **Security**: must run [i-want-to-prepare-a-security-strategy.md](./prepare-a-security-strategy.md) + no naked run. 
14. **SSOT**: must run [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) channel library + no multi-source. 
15. **Contract test**: must run [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) + no naked run. 
16. **RACI**: must run [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); platform / TA / marketing / HR owners. 
17. **Freeze period**: during promotions follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) do not modify recruitment marketing. 
18. **Reporting**: must run [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) for internal and external reporting. 
19. **Monitoring**: must run [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) for recruitment marketing exception alerts. 
20. **Retrospective**: after a recruitment marketing failure must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive into [bugs/](../../engineer/lessons/failures/bugs). 
21. **Quarterly audit**: follow [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) to scan whether channels are still accurate / conversions are still reasonable. 
22. **ADR**: recruitment marketing decisions must land in ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md). 
23. **Flywheel**: recruitment marketing good -> hires rise -> trust rises -> more budget; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md). 

## Related

- Same-class journey: [./prepare-a-talent-acquisition-strategy.md](./prepare-a-talent-acquisition-strategy.md) — talent acquisition
- Same-class journey: [./prepare-an-employer-branding-strategy.md](./prepare-an-employer-branding-strategy.md) — employer branding
- Same-class journey: [./prepare-a-recruiting-strategy.md](./prepare-a-recruiting-strategy.md) — recruiting
- Same-class journey: [./prepare-a-content-marketing-strategy.md](./prepare-a-content-marketing-strategy.md) — content marketing
- Upstream: [../../executive/strategy/README.md](../../executive/strategy/README.md) — strategy leaf entry
