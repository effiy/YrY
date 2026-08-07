---

title: I want to prepare an adversary emulation strategy
aliases:
- i-want-to-prepare-an-adversary-emulation-strategy
- adversary-emulation-journey
- attack-simulation-journey
- adversary-emulation-entry
tags:
- journeys
- adversary-emulation
- attack-simulation
- mitre-attack
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
- ./prepare-a-red-team-strategy.md
- ./prepare-a-purple-team-strategy.md
- ./prepare-a-threat-intelligence-strategy.md
- ./prepare-a-detection-engineering-strategy.md
- ../../engineer/architecture-design/ssot-view-layer.md
- ../../knowledge-curator/diagrams/directory-blueprint.md
- ../../knowledge-curator/diagrams/user-journey.md
review_cycle: quarterly
tacit: false
---

# I want to prepare an adversary emulation strategy

> **As an** engineer, **I want to** prepare an adversary emulation, **so that** launch is safe. 

> "Red team + emulation + MITRE ATT&CK + governance + quarterly audit" reaches process + thinking + case study within 2 hops.

## Summary

- Process follows [code-review.md](../../engineer/processes/do-a-code-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- Thinking follows [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform follows [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [caching-pattern.md](../../engineer/patterns/caching.md) + [observability-pattern.md](../../engineer/patterns/observability.md)
- Case study follows [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario description

When preparing red team / emulation / MITRE ATT&CK / governance / promotion freeze / quarterly audit / retrospective, TL + platform + algorithm + data + sponsor need to look up process + thinking + case study. This entry aggregates adversary-emulation-related process + thinking + case study into a 2-hop path, avoiding "scattered emulation / missed coverage / false risk reporting / chaotic closed loop / no quarterly audit".

## 2-hop reachability path

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [caching-pattern.md](../../engineer/patterns/caching.md) · [observability-pattern.md](../../engineer/patterns/observability.md) · [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — red team intent · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — inversion on scattered emulation · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain reactions · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/pm-frameworks/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [pirate-funnel-summary.md](../../engineer/strategies/prepare-a-pirate-funnel-strategy.md) · [growth-loops-summary.md](../../engineer/strategies/prepare-a-growth-experiment-strategy.md) |
| `methodology/ai-specific/` | adversary-emulation · attack-simulation · mitre-attack · ttp |
| `product/strategy/` | [product-strategy-summary.md](../../product-manager/frameworks/prepare-a-product-strategy.md) · [data-strategy-summary.md](../../engineer/strategies/prepare-a-data-product-strategy.md) · [compliance-strategy-summary.md](../../engineer/strategies/prepare-an-audit-compliance-strategy.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) |
| `tech/ai-platform/` | emulation-runtime · playbook-store · detect-engine · audit-log |
| `tech/ai-foundations/` | emulation-patterns · playbook-suite · detect-baseline |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — emulation communication |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — platform matrix |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — emulation incident archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [scenarios](../../brd/) · [reference](../../brd/) — emulation business |
| `projects/` | Each project's `architecture-summary.md` §PM + `adr-*` §emulation |
| `journeys/` | [./prepare-a-red-team-strategy.md](./prepare-a-red-team-strategy.md) · [./prepare-a-purple-team-strategy.md](./prepare-a-purple-team-strategy.md) · [./prepare-a-threat-intelligence-strategy.md](./prepare-a-threat-intelligence-strategy.md) · [./prepare-a-detection-engineering-strategy.md](./prepare-a-detection-engineering-strategy.md) · [./prepare-a-security-strategy.md](./prepare-a-security-strategy.md) |

## Action recommendations

1. **First principles**: First ask "what does adversary emulation solve / what happens if not done / ROI / business impact"; do not emulate for emulation's sake; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
2. **Inversion**: First imagine "adversary emulation could go out of control (scattered emulation / missed coverage / false risk reporting / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
3. **Second-order effects**: One emulation → behavior change → another emulation; follow [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md).
4. **Occam**: The simplest emulation that satisfies business wins; do not pile up playbooks; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md).
5. **MITRE ATT&CK**: Must run MITRE ATT&CK / TTP / coverage + no scattering.
6. **Playbook**: Must run playbook / steps / automation + no misses.
7. **Detection**: Must run detection / coverage / gaps + no misses.
8. **Closed loop**: Must run closed loop / retrospective / archive + no misses.
9. **Red team**: Must run [i-want-to-prepare-a-red-team-strategy.md](./prepare-a-red-team-strategy.md) + no naked run.
10. **Purple team**: Must run [i-want-to-prepare-a-purple-team-strategy.md](./prepare-a-purple-team-strategy.md) + no naked run.
11. **Threat intelligence**: Must run [i-want-to-prepare-a-threat-intelligence-strategy.md](./prepare-a-threat-intelligence-strategy.md) + no naked run.
12. **Detection engineering**: Must run [i-want-to-prepare-a-detection-engineering-strategy.md](./prepare-a-detection-engineering-strategy.md) + no naked run.
13. **Security**: Must run [i-want-to-prepare-a-security-strategy.md](./prepare-a-security-strategy.md) + no naked run.
14. **SSOT**: Must run [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) emulation library + no multi-source.
15. **Contract QA**: Must run [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) + no naked run.
16. **RACI**: Must run [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); platform / algorithm / data / TL owners.
17. **Freeze period**: During promotions follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md); do not move emulations.
18. **Communication**: Must run [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) for internal and external communication.
19. **Monitoring**: Must run [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) for emulation anomaly alerts.
20. **Retrospective**: After emulation incidents, must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive in [bugs/](../../engineer/lessons/failures/bugs).
21. **Quarterly audit**: Follow [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) to scan whether coverage is still accurate / playbooks still reasonable.
22. **ADR**: Emulation decisions must land in ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md).
23. **Flywheel**: Good emulation → detection improves → trust rises → more budget; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md).

## Related

- Related journey: [./prepare-a-red-team-strategy.md](./prepare-a-red-team-strategy.md) — red team
- Related journey: [./prepare-a-purple-team-strategy.md](./prepare-a-purple-team-strategy.md) — purple team
- Related journey: [./prepare-a-threat-intelligence-strategy.md](./prepare-a-threat-intelligence-strategy.md) — threat intelligence
- Related journey: [./prepare-a-detection-engineering-strategy.md](./prepare-a-detection-engineering-strategy.md) — detection engineering
- Upstream: [../../executive/strategy/README.md](../../executive/strategy/README.md) — strategy leaf entry
