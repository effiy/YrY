---

title: I want to prepare a break glass strategy
aliases:
- i-want-to-prepare-a-break-glass-strategy
- break-glass-journey
- emergency-access-journey
- privileged-access-journey
- emergency access entry
tags:
- journeys
- break-glass
- emergency-access
- privileged-access
- just-in-time
- pam
category: engineer/strategies
created: 2026-08-03
updated: 2026-08-03
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
- ./prepare-an-iam-strategy.md
- ./prepare-a-secrets-management-strategy.md
- ../../oncall-sre/incident-response/prepare-an-incident-response-strategy.md
- ./prepare-a-security-strategy.md
- ../../engineer/architecture-design/ssot-view-layer.md
- ../../knowledge-curator/diagrams/directory-blueprint.md
- ../../knowledge-curator/diagrams/user-journey.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a break glass strategy

> **As an** engineer, **I want to** prepare a break glass, **so that** launch is safe.

> "Emergency access + JIT + audit + reporting + governance + quarterly review" reachable within 2 hops to process + thinking + cases.

## Summary

- Process via [code-review.md](../../engineer/processes/do-a-code-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- Thinking via [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform via [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [observability-pattern.md](../../engineer/patterns/observability.md) + [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md)
- Cases via [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario

When preparing emergency access / break glass / JIT / audit / reporting / governance / big-promo freeze / quarterly review / retrospective, TL + security + SRE + legal + sponsor need to look up process + thinking + cases. This entry aggregates break-glass-related process + thinking + cases into a 2-hop path, avoiding "abuse / missed audit / drift / trust collapse / no quarterly review".

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [observability-pattern.md](../../engineer/patterns/observability.md) · [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) · [caching-pattern.md](../../engineer/patterns/caching.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — break glass intent · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — invert for dispersion · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/pm-frameworks/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [pirate-funnel-summary.md](../../engineer/strategies/prepare-a-pirate-funnel-strategy.md) · [growth-loops-summary.md](../../engineer/strategies/prepare-a-growth-experiment-strategy.md) |
| `product/strategy/` | [security-strategy-summary.md](../../engineer/strategies/prepare-a-cybersecurity-strategy.md) · [compliance-strategy-summary.md](../../engineer/strategies/prepare-an-audit-compliance-strategy.md) · [product-strategy-summary.md](../../product-manager/frameworks/prepare-a-product-strategy.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — break glass reporting |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — security matrix |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — break glass incident archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [scenarios](../../brd/) · [reference](../../brd/) — break glass business |
| `projects/` | each project `architecture-summary.md` §PM + `adr-*` §break glass |
| `journeys/` | [./prepare-an-iam-strategy.md](./prepare-an-iam-strategy.md) · [./prepare-a-secrets-management-strategy.md](./prepare-a-secrets-management-strategy.md) · [../../oncall-sre/incident-response/prepare-an-incident-response-strategy.md](../../oncall-sre/incident-response/prepare-an-incident-response-strategy.md) · [./prepare-a-security-strategy.md](./prepare-a-security-strategy.md) · [./prepare-an-sre-strategy.md](./prepare-an-sre-strategy.md) |

## Action recommendations

1. **First principles**: first ask "what does break glass solve / what happens if not done / ROI / business impact"; do not open for the sake of opening; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
2. **Inversion**: first think "break glass could go out of control (abuse / missed audit / drift / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
3. **Second-order effects**: one open → behavior changes → another open; see [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md).
4. **Occam**: the simplest break glass that meets business needs wins; do not pile up roles; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md).
5. **Trigger conditions**: must run trigger conditions / severity levels + no gut calls.
6. **JIT**: must run JIT / time-boxed / auto-revoke + no always-on.
7. **Approval**: must run dual-person approval / review + no omissions.
8. **Audit**: must run audit / screen recording / logs + no omissions; via [i-want-to-prepare-an-iam-strategy.md](./prepare-an-iam-strategy.md).
9. **Secrets**: must run [i-want-to-prepare-a-secrets-management-strategy.md](./prepare-a-secrets-management-strategy.md) + no omissions.
10. **Incident**: must run [i-want-to-prepare-an-incident-response-strategy.md](../../oncall-sre/incident-response/prepare-an-incident-response-strategy.md) linkage + no bare run.
11. **Security**: must run [i-want-to-prepare-a-security-strategy.md](./prepare-a-security-strategy.md) + no bare run.
12. **SRE**: must run [i-want-to-prepare-an-sre-strategy.md](./prepare-an-sre-strategy.md) + no bare run.
13. **SSOT**: must run [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) audit library + no multi-source.
14. **Contract test**: must run [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) + no bare run.
15. **RACI**: must run [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); security / SRE / legal / TL owner.
16. **Freeze period**: big-promo via [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) — do not change break glass.
17. **Reporting**: must run [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) reporting internally and externally.
18. **Monitoring**: must run [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) abuse / exception alerts.
19. **Retrospective**: after break glass incidents must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive [bugs/](../../engineer/lessons/failures/bugs).
20. **Quarterly audit**: via [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) scan trigger conditions whether still accurate / audit whether still current.
21. **ADR**: break glass decision must land in ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md).
22. **Flywheel**: strict break glass → trust rises → risk falls → more budget; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md).

## Related

- Same-category journey: [./prepare-an-iam-strategy.md](./prepare-an-iam-strategy.md) — IAM
- Same-category journey: [./prepare-a-secrets-management-strategy.md](./prepare-a-secrets-management-strategy.md) — secrets
- Same-category journey: [../../oncall-sre/incident-response/prepare-an-incident-response-strategy.md](../../oncall-sre/incident-response/prepare-an-incident-response-strategy.md) — incident
- Same-category journey: [./prepare-a-security-strategy.md](./prepare-a-security-strategy.md) — security
- Upstream: [../../executive/strategy/README.md](../../executive/strategy/README.md) — strategy leaf entry
