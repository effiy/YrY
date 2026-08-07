---

title: I want to prepare a SOC strategy
aliases:
- I want to prepare a SOC strategy
- soc-journey
- security-operations-center-journey
- SOC entry
tags:
- journeys
- soc
- security-operations-center
- 24-7
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
- ./prepare-a-siem-strategy.md
- ./prepare-a-soar-strategy.md
- ./prepare-a-detection-engineering-strategy.md
- ../../oncall-sre/incident-response/prepare-an-incident-response-strategy.md
- ../../engineer/architecture-design/ssot-view-layer.md
- ../../knowledge-curator/diagrams/directory-blueprint.md
- ../../knowledge-curator/diagrams/user-journey.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a SOC strategy

> **As an** engineer, **I want to** prepare a soc, **so that** launch is safe.

> "SOC + 24/7 + on-call schedule + governance + quarterly audit" reach within 2 hops of process + thinking + case study.

## Summary

- Process: go [code-review.md](../../engineer/processes/do-a-code-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- Thinking: go [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform: go [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [caching-pattern.md](../../engineer/patterns/caching.md) + [observability-pattern.md](../../engineer/patterns/observability.md)
- Case study: go [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario

When preparing SOC / 24/7 / on-call schedule / governance / big-promo freeze / quarterly audit / retrospective, TL + platform + algorithm + data + sponsor need to look up process + thinking + case study. This entry aggregates SOC-related process + thinking + case study into a 2-hop path, avoiding "SOC scattered / on-call missed / weak response / closed-loop chaos / no quarterly audit".

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [caching-pattern.md](../../engineer/patterns/caching.md) · [observability-pattern.md](../../engineer/patterns/observability.md) · [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — SOC intent · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — inversion imagine scattering · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/pm-frameworks/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [pirate-funnel-summary.md](../../engineer/strategies/prepare-a-pirate-funnel-strategy.md) · [growth-loops-summary.md](../../engineer/strategies/prepare-a-growth-experiment-strategy.md) |
| `methodology/ai-specific/` | soc · security-operations-center · 24-7 · tiered-response |
| `product/strategy/` | [product-strategy-summary.md](../../product-manager/frameworks/prepare-a-product-strategy.md) · [data-strategy-summary.md](../../engineer/strategies/prepare-a-data-product-strategy.md) · [compliance-strategy-summary.md](../../engineer/strategies/prepare-an-audit-compliance-strategy.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) |
| `tech/ai-platform/` | soc-runtime · shift-store · tier-engine · audit-log |
| `tech/ai-foundations/` | soc-patterns · shift-suite · tier-baseline |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — SOC reporting |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — platform matrix |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — SOC incident archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [scenarios](../../brd/) · [reference](../../brd/) — SOC business |
| `projects/` | each project `architecture-summary.md` §PM + `adr-*` §SOC |
| `journeys/` | [./prepare-a-siem-strategy.md](./prepare-a-siem-strategy.md) · [./prepare-a-soar-strategy.md](./prepare-a-soar-strategy.md) · [./prepare-a-detection-engineering-strategy.md](./prepare-a-detection-engineering-strategy.md) · [../../oncall-sre/incident-response/prepare-an-incident-response-strategy.md](../../oncall-sre/incident-response/prepare-an-incident-response-strategy.md) · [./prepare-a-follow-the-sun-strategy.md](./prepare-a-follow-the-sun-strategy.md) |

## Action recommendations

1. **First principles**: first ask "SOC what to solve / what happens if not done / ROI / business impact"; do not do S for the sake of S; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
2. **Inversion**: first imagine "SOC could go out of control (SOC scattered / on-call missed / weak response / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
3. **Second-order effects**: one S → behavior changes → another S; follow [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md).
4. **Occam**: the simplest SOC that satisfies business wins; do not pile up shifts; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md).
5. **On-call schedule**: must run schedule / shifts / rotation + no scattering.
6. **Tiering**: must run tiering / L1 / L2 / L3 + no omissions.
7. **Response**: must run response / SOP / escalation + no omissions.
8. **Closed loop**: must run closed loop / retrospective / archive + no omissions.
9. **SIEM**: must run [i-want-to-prepare-a-siem-strategy.md](./prepare-a-siem-strategy.md) + no naked run.
10. **SOAR**: must run [i-want-to-prepare-a-soar-strategy.md](./prepare-a-soar-strategy.md) + no naked run.
11. **Detection engineering**: must run [i-want-to-prepare-a-detection-engineering-strategy.md](./prepare-a-detection-engineering-strategy.md) + no naked run.
12. **Incident response**: must run [i-want-to-prepare-an-incident-response-strategy.md](../../oncall-sre/incident-response/prepare-an-incident-response-strategy.md) + no naked run.
13. **Follow the sun**: must run [i-want-to-prepare-a-follow-the-sun-strategy.md](./prepare-a-follow-the-sun-strategy.md) + no naked run.
14. **SSOT**: must run [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) SOC library + no multi-source.
15. **Contract test**: must run [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) + no naked run.
16. **RACI**: must follow [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); platform / algorithm / data / TL owner.
17. **Freeze period**: during big-promo follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) do not move SOC.
18. **Reporting**: must follow [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) to report internally and externally.
19. **Monitoring**: must run [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) SOC on-duty alerts.
20. **Retrospective**: after SOC incident must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive [bugs/](../../engineer/lessons/failures/bugs).
21. **Quarterly audit**: follow [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) scan SOC whether still accurate / on-call whether still reasonable.
22. **ADR**: SOC decisions must land ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md).
23. **Flywheel**: SOC good → fast response → trust rises → more budget; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md).

## Related

- similar journey: [./prepare-a-siem-strategy.md](./prepare-a-siem-strategy.md) — SIEM
- similar journey: [./prepare-a-soar-strategy.md](./prepare-a-soar-strategy.md) — SOAR
- similar journey: [./prepare-a-detection-engineering-strategy.md](./prepare-a-detection-engineering-strategy.md) — detection engineering
- similar journey: [../../oncall-sre/incident-response/prepare-an-incident-response-strategy.md](../../oncall-sre/incident-response/prepare-an-incident-response-strategy.md) — incident response
- Upstream: [../../executive/strategy/README.md](../../executive/strategy/README.md) - strategy leaf entry
