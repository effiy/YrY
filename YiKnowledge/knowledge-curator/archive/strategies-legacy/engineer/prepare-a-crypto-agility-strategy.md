---

title: I want to prepare a crypto agility strategy
aliases:
- I want to prepare a crypto agility strategy
- crypto-agility-journey
- cipher-agility-journey
- crypto agility entry
tags:
- journeys
- crypto-agility
- cipher-agility
- post-quantum
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
- body contains user-story header + 7 fixed-order sections
related:
- ./prepare-a-pki-strategy.md
- ./prepare-a-data-encryption-strategy.md
- ./prepare-a-secrets-management-strategy.md
- ./prepare-a-key-management-strategy.md
- ../../engineer/architecture-design/ssot-view-layer.md
- ../../knowledge-curator/diagrams/directory-blueprint.md
- ../../knowledge-curator/diagrams/user-journey.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a crypto agility strategy

> **As an** engineer, **I want to** prepare a crypto agility, **so that** launch is safe.

> "Crypto agility + switch + post-quantum + Governance + Quarterly audit" reach Process + Thinking + Case study within 2 hops.

## Summary

- Process follows [code-review.md](../../engineer/processes/do-a-code-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- Thinking follows [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform follows [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [caching-pattern.md](../../engineer/patterns/caching.md) + [observability-pattern.md](../../engineer/patterns/observability.md)
- Case studies follow [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario description

When preparing crypto agility / switch / post-quantum / Governance / big-promo freeze / Quarterly audit / Retrospective, TL + Platform + algorithm + data + sponsor need to look up Process + Thinking + Case study. This entry aggregates crypto-agility-related Process + Thinking + Case study into a 2-hop path, avoiding "scattered algorithms / missed switch / post-quantum risk / messy closed loop / no quarterly audit".

## 2-hop reachability path

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [caching-pattern.md](../../engineer/patterns/caching.md) · [observability-pattern.md](../../engineer/patterns/observability.md) · [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — agility intent · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — inversion imagine scattering · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/pm-frameworks/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [pirate-funnel-summary.md](../../engineer/strategies/prepare-a-pirate-funnel-strategy.md) · [growth-loops-summary.md](../../engineer/strategies/prepare-a-growth-experiment-strategy.md) |
| `methodology/ai-specific/` | crypto-agility · cipher-agility · post-quantum · kyber |
| `product/strategy/` | [product-strategy-summary.md](../../product-manager/frameworks/prepare-a-product-strategy.md) · [data-strategy-summary.md](../../engineer/strategies/prepare-a-data-product-strategy.md) · [compliance-strategy-summary.md](../../engineer/strategies/prepare-an-audit-compliance-strategy.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) |
| `tech/ai-platform/` | crypto-runtime · algo-store · switch-engine · audit-log |
| `tech/ai-foundations/` | crypto-patterns · algo-suite · switch-baseline |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — crypto comms |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — platform matrix |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — crypto incident archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [scenarios](../../brd/) · [reference](../../brd/) — crypto business |
| `projects/` | each project's `architecture-summary.md` §PM + `adr-*` §crypto |
| `journeys/` | [./prepare-a-pki-strategy.md](./prepare-a-pki-strategy.md) · [./prepare-a-data-encryption-strategy.md](./prepare-a-data-encryption-strategy.md) · [./prepare-a-secrets-management-strategy.md](./prepare-a-secrets-management-strategy.md) · [./prepare-a-key-management-strategy.md](./prepare-a-key-management-strategy.md) · [./prepare-a-security-strategy.md](./prepare-a-security-strategy.md) |

## Action recommendations

1. **First principles**: first ask "what does crypto agility solve / what if not done / ROI / business impact"; do not do agility for its own sake; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
2. **Inversion**: first imagine "how agility can fail (scattered algorithms / missed switch / post-quantum risk / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
3. **Second-order effects**: one agility change -> behavior changes -> another agility change; follow [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md).
4. **Occam's razor**: the simplest agility that satisfies business wins; do not pile up algorithms; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md).
5. **Inventory**: must define inventory / algorithms / dependencies + no scattering.
6. **Switch**: must define switch / gradual rollout / rollback + no leakage.
7. **Post-quantum**: must define post-quantum / Kyber / hybrid + no leakage.
8. **Closed loop**: must define closed loop / retrospective / archive + no leakage.
9. **PKI**: must run [i-want-to-prepare-a-pki-strategy.md](./prepare-a-pki-strategy.md) + no naked run.
10. **Data encryption**: must run [i-want-to-prepare-a-data-encryption-strategy.md](./prepare-a-data-encryption-strategy.md) + no naked run.
11. **Secrets management**: must run [i-want-to-prepare-a-secrets-management-strategy.md](./prepare-a-secrets-management-strategy.md) + no naked run.
12. **Key management**: must run [i-want-to-prepare-a-key-management-strategy.md](./prepare-a-key-management-strategy.md) + no naked run.
13. **Security**: must run [i-want-to-prepare-a-security-strategy.md](./prepare-a-security-strategy.md) + no naked run.
14. **SSOT**: must run [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) as the algorithm repository + no multi-source.
15. **Contract test**: must run [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) + no naked run.
16. **RACI**: must run [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); platform / algorithm / data / TL owner.
17. **Freeze period**: during big promos follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md); do not change the algorithm inventory.
18. **Comms**: must run [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) to communicate internally and externally.
19. **Monitoring**: must run [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) for algorithm exception alerts.
20. **Retrospective**: after a crypto incident must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive under [bugs/](../../engineer/lessons/failures/bugs).
21. **Quarterly audit**: follow [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) to scan whether inventory is still accurate / whether algorithms are still reasonable.
22. **ADR**: crypto decisions must be captured as ADRs; see [adr-template.md](../../knowledge-curator/templates/adr.md).
23. **Flywheel**: good agility -> fast switch -> trust rises -> more budget; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md).

## Related

- Related journey: [./prepare-a-pki-strategy.md](./prepare-a-pki-strategy.md) — PKI
- Related journey: [./prepare-a-data-encryption-strategy.md](./prepare-a-data-encryption-strategy.md) — data encryption
- Related journey: [./prepare-a-secrets-management-strategy.md](./prepare-a-secrets-management-strategy.md) — secrets management
- Related journey: [./prepare-a-key-management-strategy.md](./prepare-a-key-management-strategy.md) — key management
- Upstream: [../../executive/strategy/README.md](../../executive/strategy/README.md) — strategy leaf entry
