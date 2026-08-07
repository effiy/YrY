---

title: I want to prepare an eNPS strategy
aliases:
- I want to prepare an employee net promoter score strategy
- enps-journey
- employee-nps-journey
- eNPS-entry
tags:
- journeys
- enps
- employee-nps
- employee-advocacy
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
- filename is descriptive verb-phrase, hyphens only, no underscores or digits
- body contains user story header + 7 fixed-order sections
related:
- ./prepare-an-employee-engagement-strategy.md
- ./prepare-a-pulse-survey-strategy.md
- ./prepare-an-employer-branding-strategy.md
- ./prepare-a-360-feedback-strategy.md
- ../../engineer/architecture-design/ssot-view-layer.md
- ../../knowledge-curator/diagrams/directory-blueprint.md
- ../../knowledge-curator/diagrams/user-journey.md
review_cycle: quarterly
tacit: false
---

# I want to prepare an eNPS strategy

> **As an** engineer, **I want to** prepare an enps, **so that** launch is safe. 

> Reach "eNPS + employee net promoter score + traceability + governance + quarterly audit" within 2 hops via Process + Thinking + Case study. 

## Summary

- Process: [code-review.md](../../engineer/processes/do-a-code-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- Thinking: [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform: [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [caching-pattern.md](../../engineer/patterns/caching.md) + [observability-pattern.md](../../engineer/patterns/observability.md)
- Case study: [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario description

When preparing eNPS / employee net promoter score / traceability / governance / promotion freeze / quarterly audit / retrospective, TL + platform + HR + business + sponsor need to look up Process + Thinking + Case study. This entry aggregates eNPS-related Process + Thinking + Case study into a 2-hop path, avoiding "cadence scattered / groups missed / noise risk / closed loop chaotic / no quarterly audit". 

## 2-hop reachability path

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [caching-pattern.md](../../engineer/patterns/caching.md) · [observability-pattern.md](../../engineer/patterns/observability.md) · [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — eNPS intent · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — Inversion: imagine scattering · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/pm-frameworks/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [pirate-funnel-summary.md](../../engineer/strategies/prepare-a-pirate-funnel-strategy.md) · [growth-loops-summary.md](../../engineer/strategies/prepare-a-growth-experiment-strategy.md) |
| `methodology/ai-specific/` | enps · employee-nps · promoter · detractor |
| `product/strategy/` | [product-strategy-summary.md](../../product-manager/frameworks/prepare-a-product-strategy.md) · [data-strategy-summary.md](../../engineer/strategies/prepare-a-data-product-strategy.md) · [compliance-strategy-summary.md](../../engineer/strategies/prepare-an-audit-compliance-strategy.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) |
| `tech/ai-platform/` | enps-runtime · survey-store · score-engine · audit-log |
| `tech/ai-foundations/` | enps-patterns · survey-suite · score-baseline |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — eNPS communication |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — platform matrix |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — eNPS incident archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [scenarios](../../brd/) · [reference](../../brd/) — eNPS business |
| `projects/` | each project `architecture-summary.md` §PM + `adr-*` §eNPS |
| `journeys/` | [./prepare-an-employee-engagement-strategy.md](./prepare-an-employee-engagement-strategy.md) · [./prepare-a-pulse-survey-strategy.md](./prepare-a-pulse-survey-strategy.md) · [./prepare-an-employer-branding-strategy.md](./prepare-an-employer-branding-strategy.md) · [./prepare-a-360-feedback-strategy.md](./prepare-a-360-feedback-strategy.md) · [./prepare-a-security-strategy.md](./prepare-a-security-strategy.md) |

## Action recommendations

1. **First principles**: first ask "what does eNPS solve / what happens if not done / ROI / business impact"; do not ask for the sake of asking; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md). 
2. **Inversion**: first imagine "eNPS could go out of control (cadence scattered / groups missed / noise risk / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md). 
3. **Second-order effects**: one-shot survey -> behavior changes -> another one-shot survey; see [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md). 
4. **Occam**: the simplest eNPS that satisfies business wins; do not pile up questions; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md). 
5. **Cadence**: must run cadence / quarterly / high-frequency + no scattering. 
6. **Groups**: must run groups / departments / tenure + no missing. 
7. **Observable**: must run observable / traceability / audit + no missing. 
8. **Closed loop**: must run closed loop / retrospective / archive + no missing. 
9. **Employee engagement**: must run [i-want-to-prepare-an-employee-engagement-strategy.md](./prepare-an-employee-engagement-strategy.md) + no naked run. 
10. **Pulse survey**: must run [i-want-to-prepare-a-pulse-survey-strategy.md](./prepare-a-pulse-survey-strategy.md) + no naked run. 
11. **Employer branding**: must run [i-want-to-prepare-an-employer-branding-strategy.md](./prepare-an-employer-branding-strategy.md) + no naked run. 
12. **360 feedback**: must run [i-want-to-prepare-a-360-feedback-strategy.md](./prepare-a-360-feedback-strategy.md) + no naked run. 
13. **Security**: must run [i-want-to-prepare-a-security-strategy.md](./prepare-a-security-strategy.md) + no naked run. 
14. **SSOT**: must run [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) question library + no multi-source. 
15. **Contract test**: must run [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) + no naked run. 
16. **RACI**: must run [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); platform / HR / business / TL owner. 
17. **Freeze period**: during promotions use [release-freeze-process.md](../../oncall-sre/release/release-freeze.md); do not move cadence. 
18. **Communication**: must run [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) communicate internally and externally. 
19. **Monitoring**: must run [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) eNPS anomaly alerts. 
20. **Retrospective**: after eNPS incident must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive [bugs/](../../engineer/lessons/failures/bugs). 
21. **Quarterly audit**: follow [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) to scan whether cadence is still accurate / groups still reasonable. 
22. **ADR**: eNPS decisions must land ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md). 
23. **Flywheel**: good eNPS -> culture rises -> trust rises -> more budget; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md). 

## Related

- Related journey: [./prepare-an-employee-engagement-strategy.md](./prepare-an-employee-engagement-strategy.md) — employee engagement
- Related journey: [./prepare-a-pulse-survey-strategy.md](./prepare-a-pulse-survey-strategy.md) — pulse survey
- Related journey: [./prepare-an-employer-branding-strategy.md](./prepare-an-employer-branding-strategy.md) — employer branding
- Related journey: [./prepare-a-360-feedback-strategy.md](./prepare-a-360-feedback-strategy.md) — 360 feedback
- Upstream: [../../executive/strategy/README.md](../../executive/strategy/README.md) — strategy leaf entry
