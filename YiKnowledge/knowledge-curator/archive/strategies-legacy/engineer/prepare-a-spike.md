---

title: I want to prepare a spike
aliases:
- I want to prepare a spike
- spike-journey
- investigation-journey
- tiger-team-journey
- investigation entry
tags:
- journeys
- spike
- investigation
- research
- tiger-team
- time-box
- feasibility
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
- ../../tech-lead/roadmap/do-a-proof-of-concept.md
- ../../tech-lead/roadmap/do-a-tech-selection.md
- ../processes/run-an-experiment.md
- ../../knowledge-curator/templates/thinking/first-principles.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a spike

> **As an** engineer, **I want to** prepare a spike, **so that** launch is safe.

> "Problem + hypothesis + time-box + investigation + validation + decision + communication + retrospective" reaches Template + Thinking + Case study within 2 hops.

## Summary

- Template goes to [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) + [adr-template.md](../../knowledge-curator/templates/adr.md) + [meeting-notes-template.md](../../knowledge-curator/templates/meeting-notes.md) + [retrospective-template.md](../../knowledge-curator/templates/retrospective.md)
- Thinking goes to [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform goes to [eval-driven](../../engineer/engineering/evaluation-driven-development.md) + [dual-world-boundary-pattern.md](../../engineer/engineering/dual-world-boundary.md) + [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md)
- Case study goes to [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [yry-vite-to-rsbuild-migration-win.md](../../engineer/lessons/wins/yry-vite-to-rsbuild-migration.md)

## Scenario description

When preparing a spike / investigation / feasibility / tech feasibility assessment / tiger team / time-boxed investigation / choose-type validation / short-term attack / new direction exploration / quarterly innovation week / explore properties backlog / spike review, TL + architects + PM + sponsor need to look up Template + Thinking + Case study. This entry aggregates spike-related Template + Thinking + Case study into a 2-hop path, avoiding "vague problem / scattered hypothesis / time-box drag / shallow investigation / missing validation / decision delay / lagging communication / missing retrospective".

## 2-hop reachability path

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [meeting-notes-template.md](../../knowledge-curator/templates/meeting-notes.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [tech-selection-evaluation-template.md](../../knowledge-curator/templates/tech-selection-evaluation.md) |
| `resources/prompts/` | [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [brd-generation-prompt.md](../../ai-engineer/methodology/prompts/brd-generation.md) · [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — spike intent · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — inversion for incidents · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [strong-opinions-loosely-held-summary.md](../../knowledge-curator/templates/thinking/strong-opinions-loosely-held.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/pm-frameworks/` | [jobs-to-be-done-summary.md](../../product-manager/frameworks/jobs-to-be-done.md) · [rice-ice-prioritization-summary.md](../../product-manager/frameworks/rice-ice-prioritization.md) · [product-discovery-summary.md](../../product-manager/frameworks/prepare-a-product-discovery-strategy.md) · [dual-track-agile-summary.md](../../product-manager/frameworks/dual-track-agile.md) |
| `methodology/engineering-patterns/` | [eval-driven](../../engineer/engineering/evaluation-driven-development.md) · [dual-world-boundary-pattern.md](../../engineer/engineering/dual-world-boundary.md) · [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) · [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) |
| `methodology/ai-specific/` | [rag-design-patterns-summary.md](../../ai-engineer/methodology/rag-design-patterns.md) · [llm-evaluation-summary.md](../../ai-engineer/methodology/llm-evaluation-methods.md) · [hallucination-mitigation-summary.md](../../ai-engineer/methodology/hallucination-mitigation.md) |
| `work/processes/` | [requirement-review.md](../../product-manager/processes/requirement-review.md) · [design-review.md](../../product-manager/processes/design-review.md) · [tech-review.md](../../product-manager/processes/tech-review.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) · [tech-roadmap-review-process.md](../processes/tech-roadmap-review.md) · [capacity-planning-process.md](../../engineer/infrastructure/capacity-planning.md) |
| `work/meetings/` | [review-meeting-template.md](../../product-manager/meetings/review-meeting.md) · [weekly-meeting-template.md](../../product-manager/meetings/weekly-meeting.md) · [retrospective-sample.md](../../product-manager/delivery/retrospective.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `product/strategy/` | [product-strategy-summary.md](../../product-manager/frameworks/prepare-a-product-strategy.md) · [now-next-later-roadmap-summary.md](../../executive/strategy/now-next-later-roadmap.md) · [second-curve-summary.md](../../executive/strategy/second-curve.md) · [blue-ocean-strategy-summary.md](../../executive/strategy/blue-ocean.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) |
| `tech/ai-platform/` | [llm-comparison-summary.md](../../ai-engineer/platform/llm-comparison.md) · [inference-engine-comparison-summary.md](../../ai-engineer/platform/inference-engine-comparison.md) · [vector-db-comparison-summary.md](../../ai-engineer/platform/vector-db-comparison.md) · [embedding-model-selection-summary.md](../../ai-engineer/platform/embedding-model-selection.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `industry/` | [ai-industry-report.md](../../executive/industry/reports/ai-industry-report.md) · [llm-vendor-landscape-summary.md](../../executive/industry/competitors/llm-vendor-landscape.md) · [competitor-analysis-template.md](../../executive/industry/competitors/competitor-analysis.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) |
| `people/experts/` | [external-experts-roster.md](../../knowledge-curator/people/experts/external-experts-roster.md) — external advisors |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yry-vite-to-rsbuild-migration-win.md](../../engineer/lessons/wins/yry-vite-to-rsbuild-migration.md) · [yipet-stack-migration-win.md](../../engineer/lessons/wins/yipet-stack-migration.md) |
| `lessons/failures/` | [ai-product-launch-lessons-summary.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [incident-postmortem-summary.md](../../engineer/lessons/failures/incident-postmortem.md) · [bugs/](../../engineer/lessons/failures/bugs) — spike incident archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [brd-objectives](../../brd/) · [brd-risks](../../brd/) |
| `projects/` | each project's `architecture-summary.md` + `adr-*` |
| `journeys/` | [../../tech-lead/roadmap/do-a-proof-of-concept.md](../../tech-lead/roadmap/do-a-proof-of-concept.md) · [../../tech-lead/roadmap/do-a-tech-selection.md](../../tech-lead/roadmap/do-a-tech-selection.md) · [../processes/run-an-experiment.md](../processes/run-an-experiment.md) · [./prepare-an-rfc.md](./prepare-an-rfc.md) |

## Action recommendations

1. **First principles**: first ask "what problem the spike needs to answer / what happens if not done / ROI / business impact"; do not spike just to spike; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
2. **Inversion**: first imagine "what kind of incident the spike will cause (vague problem / time-box drag / shallow investigation / decision delay / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
3. **Second-order effects**: spike passed → resources in place → expectations raised → not-met risk; see [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md).
4. **Occam**: the simplest investigation that satisfies the problem wins; do not pile on solutions; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md).
5. **Problem**: must run falsifiable problem + must clarify "answer X then decision Y" + must predict result set.
6. **Hypothesis**: must list hypotheses + must be falsifiable + must sort + must predict effect size.
7. **Time-box**: must run 1-2 week time-box + must have milestones + not extendable + must have sponsor approval.
8. **Investigation**: must run literature + same-row + vendors + prototypes + must leave traces; see [competitor-analysis-template.md](../../executive/industry/competitors/competitor-analysis.md).
9. **Validation**: must run prototype / POC + must be eval-driven + must have golden; see [eval-driven](../../engineer/engineering/evaluation-driven-development.md).
10. **Dual-world**: migration spike must run [dual-world-boundary-pattern.md](../../engineer/engineering/dual-world-boundary.md) + dual-run + diff.
11. **AI spike**: LLM spike must run [llm-evaluation-summary.md](../../ai-engineer/methodology/llm-evaluation-methods.md) + must have eval set + must have LLM-as-judge.
12. **RACI**: must run [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); investigation / engineering / sponsor owners.
13. **Cross-timezone**: must run [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md).
14. **Communication**: must run [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) to communicate with sponsor + business.
15. **Decision**: must run [adr-template.md](../../knowledge-curator/templates/adr.md) + must be go / no-go / change direction + must have sponsor approval.
16. **Retrospective**: after the spike must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive in [review-log.md](../../knowledge-curator/governance/review-log.md).
17. **Quarterly audit**: run [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) to scan whether spike decisions are still accurate + whether landed.
18. **Flywheel**: good spike → fast decision → trust rises → more investment; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md).

## Related

- Related journey: [../../tech-lead/roadmap/do-a-proof-of-concept.md](../../tech-lead/roadmap/do-a-proof-of-concept.md) — POC
- Related journey: [../../tech-lead/roadmap/do-a-tech-selection.md](../../tech-lead/roadmap/do-a-tech-selection.md) — selection
- Related journey: [../processes/run-an-experiment.md](../processes/run-an-experiment.md) — experiment
- Related journey: [./prepare-an-rfc.md](./prepare-an-rfc.md) — RFC
- Upstream: [../../knowledge-curator/templates/thinking/README.md](../../knowledge-curator/templates/thinking/README.md) — thinking leaf entry
