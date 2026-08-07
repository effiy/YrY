---

title: I want to prepare a social engineering strategy
aliases:
- i-want-to-prepare-a-social-engineering-strategy
- social-engineering-journey
- social-eng-journey
- social-engineering-entry
tags:
- journeys
- social-engineering
- social-eng
- phishing
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
- ./prepare-a-phishing-simulation-strategy.md
- ./prepare-a-security-awareness-strategy.md
- ./prepare-a-soc-strategy.md
- ../../oncall-sre/incident-response/prepare-an-incident-response-strategy.md
- ../../engineer/architecture-design/ssot-view-layer.md
- ../../knowledge-curator/diagrams/directory-blueprint.md
- ../../knowledge-curator/diagrams/user-journey.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a social engineering strategy

> **As an** engineer, **I want to** prepare a social engineering, **so that** launch is safe. 

> "Social engineering + phishing + training + governance + quarterly audit" reaches Process + Thinking + Case study within 2 hops. 

## Summary

- Process follows [code-review.md](../../engineer/processes/do-a-code-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- Thinking follows [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform follows [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [caching-pattern.md](../../engineer/patterns/caching.md) + [observability-pattern.md](../../engineer/patterns/observability.md)
- Case study follows [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario description

When preparing social engineering / phishing / training / governance / big-promo freeze / quarterly audit / retrospective, TL + platform + algorithm + data + sponsor need to look up Process + Thinking + Case study. This entry aggregates social-engineering-related Process + Thinking + Case study into a 2-hop path, avoiding "phishing scattered / training missed / trust risk / closed loop chaos / no quarterly audit".

## 2-hop reachability path

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [caching-pattern.md](../../engineer/patterns/caching.md) · [observability-pattern.md](../../engineer/patterns/observability.md) · [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — social engineering intent · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — inversion imagined scattering · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/pm-frameworks/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [pirate-funnel-summary.md](../../engineer/strategies/prepare-a-pirate-funnel-strategy.md) · [growth-loops-summary.md](../../engineer/strategies/prepare-a-growth-experiment-strategy.md) |
| `methodology/ai-specific/` | social-engineering · phishing · pretext · vishing |
| `product/strategy/` | [product-strategy-summary.md](../../product-manager/frameworks/prepare-a-product-strategy.md) · [data-strategy-summary.md](../../engineer/strategies/prepare-a-data-product-strategy.md) · [compliance-strategy-summary.md](../../engineer/strategies/prepare-an-audit-compliance-strategy.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) |
| `tech/ai-platform/` | se-runtime · campaign-store · training-engine · audit-log |
| `tech/ai-foundations/` | se-patterns · campaign-suite · training-baseline |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — social engineering communication |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — platform matrix |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — social engineering incident archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [scenarios](../../brd/) · [reference](../../brd/) — social engineering business |
| `projects/` | Each project `architecture-summary.md` §PM + `adr-*` §social engineering |
| `journeys/` | [./prepare-a-phishing-simulation-strategy.md](./prepare-a-phishing-simulation-strategy.md) · [./prepare-a-security-awareness-strategy.md](./prepare-a-security-awareness-strategy.md) · [./prepare-a-soc-strategy.md](./prepare-a-soc-strategy.md) · [../../oncall-sre/incident-response/prepare-an-incident-response-strategy.md](../../oncall-sre/incident-response/prepare-an-incident-response-strategy.md) · [./prepare-a-security-strategy.md](./prepare-a-security-strategy.md) |

## Action recommendations

1. **First principles**: First ask "what does social engineering solve / what if not done / ROI / business impact"; do not phish for the sake of phishing; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md). 
2. **Inversion**: First imagine "how can social engineering fail (phishing scattered / training missed / trust risk / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md). 
3. **Second-order effects**: One phish → behavior changes → another phish; follow [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md). 
4. **Occam's razor**: The simplest social engineering that satisfies business wins; do not pile up scripts; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md). 
5. **Phishing**: Must do phishing / email / implementation + no scattering. 
6. **Training**: Must do training / drill / feedback + no leakage. 
7. **Reporting**: Must do reporting / escalation / vulnerability + no leakage. 
8. **Closed loop**: Must do closed loop / retrospective / archive + no leakage. 
9. **Phishing simulation**: Must do [i-want-to-prepare-a-phishing-simulation-strategy.md](./prepare-a-phishing-simulation-strategy.md) + no naked run. 
10. **Security awareness**: Must do [i-want-to-prepare-a-security-awareness-strategy.md](./prepare-a-security-awareness-strategy.md) + no naked run. 
11. **SOC**: Must do [i-want-to-prepare-a-soc-strategy.md](./prepare-a-soc-strategy.md) + no naked run. 
12. **Incident response**: Must do [i-want-to-prepare-an-incident-response-strategy.md](../../oncall-sre/incident-response/prepare-an-incident-response-strategy.md) + no naked run. 
13. **Security**: Must do [i-want-to-prepare-a-security-strategy.md](./prepare-a-security-strategy.md) + no naked run. 
14. **SSOT**: Must do [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) script library + no multi-source. 
15. **Contract test**: Must do [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) + no naked run. 
16. **RACI**: Must do [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); Platform / algorithm / data / TL owner. 
17. **Freeze period**: During big promos follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) do not move phishing. 
18. **Communication**: Must do [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) communicate internally and externally.
19. **Monitoring**: Must do [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) phishing exception alert. 
20. **Retrospective**: After social engineering incident, must do [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive [bugs/](../../engineer/lessons/failures/bugs). 
21. **Quarterly audit**: Follow [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) scan scripts whether still accurate / training whether still reasonable.
22. **ADR**: Social engineering decisions must land in ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md). 
23. **Flywheel**: Social engineering done well → victim rate drops → trust rises → more budget; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md). 

## Related

- Related journey: [./prepare-a-phishing-simulation-strategy.md](./prepare-a-phishing-simulation-strategy.md) — phishing simulation
- Related journey: [./prepare-a-security-awareness-strategy.md](./prepare-a-security-awareness-strategy.md) — security awareness
- Related journey: [./prepare-a-soc-strategy.md](./prepare-a-soc-strategy.md) — SOC
- Related journey: [../../oncall-sre/incident-response/prepare-an-incident-response-strategy.md](../../oncall-sre/incident-response/prepare-an-incident-response-strategy.md) — incident response
- Upstream: [../../executive/strategy/README.md](../../executive/strategy/README.md) — strategy leaf entry
