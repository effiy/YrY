---

title: I want to prepare a red team strategy
aliases:
- I want to prepare a red team strategy
- red-team-journey
- offensive-security-journey
- red team entry
tags:
- journeys
- red-team
- offensive-security
- adversary-simulation
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
- ./prepare-an-ai-red-team-strategy.md
- ./prepare-a-pen-test-strategy.md
- ../../oncall-sre/incident-response/prepare-a-vulnerability-management-strategy.md
- ./prepare-a-threat-hunting-strategy.md
- ../../engineer/architecture-design/ssot-view-layer.md
- ../../knowledge-curator/diagrams/directory-blueprint.md
- ../../knowledge-curator/diagrams/user-journey.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a red team strategy

> **As an** engineer, **I want to** prepare a red team, **so that** launch is safe.

> "Red team + attack simulation + detection + Governance + quarterly audit" reach Process + Thinking + Case study within 2 hops.

## Summary

- Process follows [code-review.md](../../engineer/processes/do-a-code-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- Thinking follows [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform follows [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [caching-pattern.md](../../engineer/patterns/caching.md) + [observability-pattern.md](../../engineer/patterns/observability.md)
- Case study follows [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario description

When preparing red team / attack simulation / detection / Governance / promotion freeze / quarterly audit / retrospective, TL + Platform + algorithm + data + sponsor need to look up Process + Thinking + Case study. This entry aggregates red-team-related Process + Thinking + Case study into a 2-hop path, avoiding "red team scattered / attack leaks / detection weak / closed loop chaos / no quarterly audit".

## 2-hop reachability path

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [caching-pattern.md](../../engineer/patterns/caching.md) · [observability-pattern.md](../../engineer/patterns/observability.md) · [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — red team intent · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — inversion scatter · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/pm-frameworks/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [pirate-funnel-summary.md](../../engineer/strategies/prepare-a-pirate-funnel-strategy.md) · [growth-loops-summary.md](../../engineer/strategies/prepare-a-growth-experiment-strategy.md) |
| `methodology/ai-specific/` | red-team · offensive-security · adversary-simulation · attack-emulation |
| `product/strategy/` | [product-strategy-summary.md](../../product-manager/frameworks/prepare-a-product-strategy.md) · [data-strategy-summary.md](../../engineer/strategies/prepare-a-data-product-strategy.md) · [compliance-strategy-summary.md](../../engineer/strategies/prepare-an-audit-compliance-strategy.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) |
| `tech/ai-platform/` | redteam-runtime · attack-store · detection-engine · audit-log |
| `tech/ai-foundations/` | redteam-patterns · attack-suite · detection-baseline |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — red team Communication |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — Platform matrix |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — red team incident archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [scenarios](../../brd/) · [reference](../../brd/) — red team business |
| `projects/` | each project `architecture-summary.md` §PM + `adr-*` §red team |
| `journeys/` | [./prepare-an-ai-red-team-strategy.md](./prepare-an-ai-red-team-strategy.md) · [./prepare-a-pen-test-strategy.md](./prepare-a-pen-test-strategy.md) · [../../oncall-sre/incident-response/prepare-a-vulnerability-management-strategy.md](../../oncall-sre/incident-response/prepare-a-vulnerability-management-strategy.md) · [./prepare-a-threat-hunting-strategy.md](./prepare-a-threat-hunting-strategy.md) · [./prepare-a-threat-intelligence-strategy.md](./prepare-a-threat-intelligence-strategy.md) |

## Action recommendations

1. **First principles**: first ask "what does red team solve / what happens if not done / ROI / business impact"; don't red-team for red-teaming's sake; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
2. **Inversion**: first imagine "red team could go out of control (red team scattered / attack leaks / detection weak / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
3. **Second-order effects**: one red team → behavior changes → another red team; follow [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md).
4. **Occam**: the simplest red team that meets business wins; don't pile up TTPs; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md).
5. **Target**: must run target / scope / hypothesis + no scatter.
6. **Attack**: must run attack / TTP / simulation + no leakage.
7. **Detection**: must run detection / blue team / gap + no leakage.
8. **Closed loop**: must run closed loop / report / fix + no leakage.
9. **AI red team**: must run [i-want-to-prepare-an-ai-red-team-strategy.md](./prepare-an-ai-red-team-strategy.md) + no naked run.
10. **Pen test**: must run [i-want-to-prepare-a-pen-test-strategy.md](./prepare-a-pen-test-strategy.md) + no naked run.
11. **Vulnerability management**: must run [i-want-to-prepare-a-vulnerability-management-strategy.md](../../oncall-sre/incident-response/prepare-a-vulnerability-management-strategy.md) + no naked run.
12. **Threat hunting**: must run [i-want-to-prepare-a-threat-hunting-strategy.md](./prepare-a-threat-hunting-strategy.md) + no naked run.
13. **Threat intelligence**: must run [i-want-to-prepare-a-threat-intelligence-strategy.md](./prepare-a-threat-intelligence-strategy.md) + no naked run.
14. **SSOT**: must run [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) red team library + no multi-source.
15. **Contract QA**: must run [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) + no naked run.
16. **RACI**: must run [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); Platform / algorithm / data / TL owner.
17. **Freeze period**: during promotions use [release-freeze-process.md](../../oncall-sre/release/release-freeze.md); do not move red team.
18. **Communication**: must run [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) inside and outside.
19. **Monitoring**: must run [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) detection coverage alert.
20. **Retrospective**: after red team incident must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive [bugs/](../../engineer/lessons/failures/bugs).
21. **Quarterly audit**: follow [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) to scan whether red team is still accurate / TTP still reasonable.
22. **ADR**: red team decisions must land ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md).
23. **Flywheel**: red team good → detection rises → trust rises → more budget; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md).

## Related

- Related journey: [./prepare-an-ai-red-team-strategy.md](./prepare-an-ai-red-team-strategy.md) — AI red team
- Related journey: [./prepare-a-pen-test-strategy.md](./prepare-a-pen-test-strategy.md) — pen test
- Related journey: [../../oncall-sre/incident-response/prepare-a-vulnerability-management-strategy.md](../../oncall-sre/incident-response/prepare-a-vulnerability-management-strategy.md) — vulnerability management
- Related journey: [./prepare-a-threat-hunting-strategy.md](./prepare-a-threat-hunting-strategy.md) — threat hunting
- Upstream: [../../executive/strategy/README.md](../../executive/strategy/README.md) — strategy leaf entry
