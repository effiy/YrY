---

title: I want to prepare a budget
aliases:
- I want to prepare a budget
- budget-journey
- financial-year-journey
- budget entry
tags:
- journeys
- budget
- finance
- capacity
- planning
- procurement
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
- filename is descriptive verb-phrase, hyphens only, no underscores or digits
- body contains user story header + 7 fixed-order sections
related:
- ../../tech-lead/roadmap/do-a-capacity-plan.md
- ../tools/reduce-cost.md
- ../../tech-lead/roadmap/plan-tech-roadmap.md
- ../../engineer/infrastructure/capacity-planning.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a budget

> **As an** engineer, **I want to** prepare a budget, **so that** launch is safe.

> "Requirement + history + prediction + cost + headcount + vendor + quarterly review + adjust" reaches Process + Template + Thinking + Case study within 2 hops.

## Summary

- Process goes to [capacity-planning-process.md](../../engineer/infrastructure/capacity-planning.md) + [tech-roadmap-review-summary.md](../../engineer/processes/tech-roadmap-review.md) + [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md)
- Template goes to [capacity-and-cost-template.md](../../oncall-sre/observability/capacity-and-cost.md) + [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md)
- Thinking goes to [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md)
- Vendor goes to [i-want-to-manage-a-vendor-relationship.md](../processes/manage-a-vendor-relationship.md) + [llm-vendor-landscape-summary.md](../../executive/industry/competitors/llm-vendor-landscape.md)

## Scenario description

When preparing the fiscal-year budget / quarterly budget / project budget / headcount + resource + vendor + infrastructure cost prediction / budget review + adjust, TL + primary owner + Platform + business owner need to look up Process + Template + Thinking + Case study. This entry aggregates budget-related Process + Template + Thinking into a 2-hop path, avoiding "gut call / no review / no elasticity buffer / passive on vendor price hikes / quarterly overrun with no contingency / budget and roadmap disjoint".

## 2-hop reachability path

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [capacity-planning-process.md](../../engineer/infrastructure/capacity-planning.md) · [tech-roadmap-review-summary.md](../../engineer/processes/tech-roadmap-review.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [iteration-pm-handbook-summary.md](../../engineer/process/iteration-pm-handbook.md) · [shared-client-vendor-rollout-process.md](../processes/shared-client-vendor-rollout.md) · [dependency-upgrade-process.md](../../engineer/processes/dependency-upgrade.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [capacity-and-cost-template.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) · [tech-debt-inventory-template.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) |
| `methodology/pm-frameworks/` | [okr-design-summary.md](../../product-manager/frameworks/okr-design.md) — budget and OKR align · [rice-ice-prioritization-summary.md](../../product-manager/frameworks/rice-ice-prioritization.md) · [now-next-later-summary.md](./../../executive/strategy/now-next-later-roadmap.md) |
| `methodology/engineering-patterns/` | [evaluation-driven-development-pattern.md](../../engineer/engineering/evaluation-driven-development.md) — budget tracking · [dual-world-boundary-pattern.md](../../engineer/engineering/dual-world-boundary.md) · [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) |
| `industry/competitors/` | [llm-vendor-landscape-summary.md](../../executive/industry/competitors/llm-vendor-landscape.md) · [competitor-analysis-template.md](../../executive/industry/competitors/competitor-analysis.md) — vendor negotiation |
| `industry/reports/` | [ai-industry-report.md](../../executive/industry/reports/ai-industry-report.md) · [market-trends/](../../executive/industry/market-trends) — industry cost baseline |
| `tech/ai-platform/` | [llm-comparison-summary.md](../../ai-engineer/platform/llm-comparison.md) · [inference-engine-comparison-summary.md](../../ai-engineer/platform/inference-engine-comparison.md) · [vector-db-comparison-summary.md](../../ai-engineer/platform/vector-db-comparison.md) · [embedding-model-selection-summary.md](../../ai-engineer/platform/embedding-model-selection.md) · [llm-observability-comparison-summary.md](../../ai-engineer/platform/llm-observability-comparison.md) — AI cost |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [lakehouse-architecture-summary.md](../../ai-engineer/data/lakehouse-architecture.md) · [mongodb-indexing-summary.md](../../ai-engineer/data/mongodb-indexing.md) — data layer cost |
| `work/tools/` | [vllm-ollama-deployment-summary.md](../../engineer/tools/vllm-ollama-deployment.md) · [pi-agent-harness-evolution-summary.md](../../engineer/tools/pi-agent-harness-evolution.md) · [claude-code-tips-summary.md](../../engineer/tools/claude-code-tips.md) |
| `lessons/wins/` | [yiai-supply-chain-hardening-win.md](../../engineer/lessons/wins/yiai-supply-chain-hardening.md) · [yiai-llm-phase-{two,three,four,five}-win.md](../../engineer/lessons/wins) — cost optimization case study · [yry-vite-to-rsbuild-migration-win.md](../../engineer/lessons/wins/yry-vite-to-rsbuild-migration.md) |
| `lessons/failures/` | [incident-postmortem-summary.md](../../engineer/lessons/failures/incident-postmortem.md) · [ai-product-launch-lessons-summary.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) |
| `lessons/gotchas/` | [no-lockfile-supply-chain-risk.md](./../lessons/gotchas/no-lockfile-supply-chain-risk.md) · [macos-fsevents-silent-drop.md](./../lessons/gotchas/macos-fsevents-silent-drop.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [meeting-notes-template.md](../../knowledge-curator/templates/meeting-notes.md) · [tech-selection-evaluation-template.md](../../knowledge-curator/templates/tech-selection-evaluation.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — budget approval |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [contract-negotiation-summary.md](./prepare-a-contract-strategy.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) — quarterly review |
| `projects/` | each project's `project-management-summary.md` §budget + `architecture-summary.md` §cost |

## Action recommendations

1. **First principles**: first ask "what the budget protects / business target / tolerance / ROI / exit cost"; do not pick numbers directly; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
2. **Inversion**: first imagine "how the budget will overrun (burst traffic / vendor price hike / API fee explosion / GPU shortage / incident)" then set a buffer; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
3. **Second-order effects**: tight budget → cut projects → team morale → harder recruiting; see [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md).
4. **Occam's razor**: the simplest budget that meets the target wins; do not pile on redundancy; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md).
5. **History review**: must pull the last 12 months of actuals + quarterly trend + exception events first; do not guess.
6. **Prediction**: business prediction + capacity prediction + cost prediction (linear + step); split into baseline + growth + buffer.
7. **Categories**: infrastructure + headcount + vendor + tools + incident reserve + innovation + tech debt repayment; each class independent.
8. **OKR align**: budget must align with [okr-design-summary.md](../../product-manager/frameworks/okr-design.md); target sets money; do not let money and target diverge.
9. **Priority**: must run [rice-ice-prioritization-summary.md](../../product-manager/frameworks/rice-ice-prioritization.md); with limited budget secure P0 first.
10. **AI cost**: must run [llm-comparison-summary.md](../../ai-engineer/platform/llm-comparison.md) + [inference-engine-comparison-summary.md](../../ai-engineer/platform/inference-engine-comparison.md); token API fees + GPU self-hosting + multi-provider routing.
11. **Cost template**: must run [capacity-and-cost-template.md](../../oncall-sre/observability/capacity-and-cost.md); three-year total + unit cost + monthly bill tracking.
12. **Vendor negotiation**: must run [contract-negotiation-summary.md](./prepare-a-contract-strategy.md) + [llm-vendor-landscape-summary.md](../../executive/industry/competitors/llm-vendor-landscape.md); multi-provider + prepay + committed volume.
13. **Buffer**: keep 10-20% buffer; surges + incidents + price hikes + API fee explosions.
14. **Quarterly review**: must run [tech-roadmap-review-summary.md](../../engineer/processes/tech-roadmap-review.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) quarterly audit; overruns must adjust + communicate.
15. **RACI**: approval goes to [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); sponsor / CFO / TL classification.
16. **Roadmap**: must align with [i-want-to-plan-tech-roadmap.md](../../tech-lead/roadmap/plan-tech-roadmap.md); budget = roadmap × unit price.
17. **Cost reduction**: must run [i-want-to-reduce-cost.md](../tools/reduce-cost.md) to scan optimizable items; scan once a quarter.
18. **Retrospective**: at fiscal year end run a retrospective + archive in [lessons/](../../engineer/lessons); prediction accuracy + adjust reasons + next year's improvements.
19. **Flywheel**: accurate prediction → trust → bolder investment → business outcomes; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md).
20. **ADR**: key budget decisions must land an ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md).

## Related

- Related journey: [../../tech-lead/roadmap/do-a-capacity-plan.md](../../tech-lead/roadmap/do-a-capacity-plan.md) — capacity planning
- Related journey: [../tools/reduce-cost.md](../tools/reduce-cost.md) — cost optimization
- Related journey: [../../tech-lead/roadmap/plan-tech-roadmap.md](../../tech-lead/roadmap/plan-tech-roadmap.md) — roadmap
- Related journey: [../processes/manage-a-vendor-relationship.md](../processes/manage-a-vendor-relationship.md) — vendor
- Upstream: [../../oncall-sre/observability/README.md](../../oncall-sre/observability/README.md) — infra leaf entry
