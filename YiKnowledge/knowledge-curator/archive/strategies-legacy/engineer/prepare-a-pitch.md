---

title: I want to prepare a pitch
aliases:
- I want to prepare pitch
- pitch-journey
- investment-pitch-journey
- proposal report entry
tags:
- journeys
- pitch
- proposal
- investment
- storytelling
- stakeholder
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
- ./prepare-an-rfc.md
- ../../product-manager/frameworks/prepare-a-go-to-market.md
- ./prepare-an-all-hands.md
- ../../knowledge-curator/templates/thinking/strong-opinions-loosely-held.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a pitch

> **As an** engineer, **I want to** prepare a pitch, **so that** launch is safe. 

> "Audience + story + data + ROI + Risk + comparison + Q&A + implementation + Retrospective" reach within 2 hops: Template + Thinking + Case study. 

## Summary

- Template via [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) + [prd-template.md](../../knowledge-curator/templates/prd.md) + [meeting-notes-template.md](../../knowledge-curator/templates/meeting-notes.md) + [tech-selection-evaluation-template.md](../../knowledge-curator/templates/tech-selection-evaluation.md)
- Thinking via [strong-opinions-loosely-held-summary.md](../../knowledge-curator/templates/thinking/strong-opinions-loosely-held.md) + [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md)
- Strategy via [product-strategy-summary.md](../../product-manager/frameworks/prepare-a-product-strategy.md) + [blue-ocean-strategy-summary.md](../../executive/strategy/blue-ocean.md) + [porter-five-forces-summary.md](../../executive/strategy/porter-five-forces.md) + [business-model-canvas-summary.md](../../executive/strategy/business-model-canvas.md)
- Case study via [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch-lessons-summary.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) + [yipet-stack-migration-win.md](../../engineer/lessons/wins/yipet-stack-migration.md)

## Scenario description

When preparing a pitch / proposal / internal investment report / project initiation report / strategy proposal / quarterly strategy review / new project / new direction exploration / sponsor pulling investment / cross-team pulling resources / executive report / board report, TL + PM + architects + sponsor need to look up Template + Thinking + Case study. This entry aggregates pitch-related Template + Thinking + Case study into a 2-hop path, avoiding "wrong audience / scattered story / fake data / ROI by gut call / missing Risk / empty comparison / cold Q&A / delayed implementation / missing Retrospective". 

## 2-hop reachability path

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [prd-template.md](../../knowledge-curator/templates/prd.md) · [meeting-notes-template.md](../../knowledge-curator/templates/meeting-notes.md) · [tech-selection-evaluation-template.md](../../knowledge-curator/templates/tech-selection-evaluation.md) · [one-on-one-template.md](../../knowledge-curator/templates/one-on-one.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) |
| `resources/prompts/` | [weekly-report-prompt.md](../../ai-engineer/methodology/prompts/weekly-report.md) · [brd-generation-prompt.md](../../ai-engineer/methodology/prompts/brd-generation.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) |
| `methodology/thinking/` | [strong-opinions-loosely-held-summary.md](../../knowledge-curator/templates/thinking/strong-opinions-loosely-held.md) — communication style · [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — pitch intent · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) — trust flywheel · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — inversion think rejection · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) |
| `methodology/pm-frameworks/` | [jobs-to-be-done-summary.md](../../product-manager/frameworks/jobs-to-be-done.md) · [kano-model-summary.md](../../product-manager/frameworks/kano-model.md) · [rice-ice-prioritization-summary.md](../../product-manager/frameworks/rice-ice-prioritization.md) · [okr-design-summary.md](../../product-manager/frameworks/okr-design.md) · [product-discovery-summary.md](../../product-manager/frameworks/prepare-a-product-discovery-strategy.md) |
| `product/strategy/` | [product-strategy-summary.md](../../product-manager/frameworks/prepare-a-product-strategy.md) · [blue-ocean-strategy-summary.md](../../executive/strategy/blue-ocean.md) · [porter-five-forces-summary.md](../../executive/strategy/porter-five-forces.md) · [business-model-canvas-summary.md](../../executive/strategy/business-model-canvas.md) · [now-next-later-roadmap-summary.md](../../executive/strategy/now-next-later-roadmap.md) · [second-curve-summary.md](../../executive/strategy/second-curve.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) |
| `industry/` | [ai-industry-report.md](../../executive/industry/reports/ai-industry-report.md) · [ai-market-trend-first-half.md](../../executive/industry/market-trends/ai-market-trend-first-half.md) · [llm-vendor-landscape-summary.md](../../executive/industry/competitors/llm-vendor-landscape.md) · [competitor-analysis-template.md](../../executive/industry/competitors/competitor-analysis.md) · [ai-after-sales-use-cases.md](../../product-manager/industry-cases) · [ai-customer-service-use-cases.md](../../product-manager/industry-cases) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — audience |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — team strength |
| `people/experts/` | [external-experts-roster.md](../../knowledge-curator/people/experts/external-experts-roster.md) — external endorsement |
| `work/meetings/` | [review-meeting-template.md](../../product-manager/meetings/review-meeting.md) · [weekly-meeting-template.md](../../product-manager/meetings/weekly-meeting.md) · [retrospective-sample.md](../../product-manager/delivery/retrospective.md) · [weekly-report-sample.md](../../product-manager/delivery/weekly-report.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [contract-negotiation-summary.md](./prepare-a-contract-strategy.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) |
| `work/processes/` | [tech-roadmap-review-process.md](../processes/tech-roadmap-review.md) · [requirement-review.md](../../product-manager/processes/requirement-review.md) · [design-review.md](../../product-manager/processes/design-review.md) · [tech-review.md](../../product-manager/processes/tech-review.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [capacity-planning-process.md](../../engineer/infrastructure/capacity-planning.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `tech/ai-platform/` | [llm-comparison-summary.md](../../ai-engineer/platform/llm-comparison.md) · [inference-engine-comparison-summary.md](../../ai-engineer/platform/inference-engine-comparison.md) · [vector-db-comparison-summary.md](../../ai-engineer/platform/vector-db-comparison.md) |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yipet-stack-migration-win.md](../../engineer/lessons/wins/yipet-stack-migration.md) · [yry-vite-to-rsbuild-migration-win.md](../../engineer/lessons/wins/yry-vite-to-rsbuild-migration.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) · [yiai-supply-chain-hardening-win.md](../../engineer/lessons/wins/yiai-supply-chain-hardening.md) |
| `lessons/failures/` | [ai-product-launch-lessons-summary.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [incident-postmortem-summary.md](../../engineer/lessons/failures/incident-postmortem.md) |
| `brd/` | [brd-documents](../../brd/) · [brd-objectives](../../brd/) · [brd-risks](../../brd/) · [brd-reference](../../brd/) |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) — pitch decision archive |
| `projects/` | each project `architecture-summary.md` + `project-management-summary.md` + `adr-*` |
| `journeys/` | [./prepare-an-rfc.md](./prepare-an-rfc.md) · [../../product-manager/frameworks/prepare-a-go-to-market.md](../../product-manager/frameworks/prepare-a-go-to-market.md) · [./prepare-an-all-hands.md](./prepare-an-all-hands.md) · [../../product-manager/discovery/write-a-prd.md](../../product-manager/discovery/write-a-prd.md) |

## Action recommendations

1. **First principles**: First ask "what question should the pitch answer / who is the audience / what happens if not approved / ROI"; do not pitch for the sake of pitching; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md). 
2. **Inversion**: First imagine "how the pitch could be rejected (wrong audience / scattered story / fake data / missing Risk / empty comparison / empty implementation) " then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md). 
3. **Strong opinions loosely held**: Must do [strong-opinions-loosely-held-summary.md](../../knowledge-curator/templates/thinking/strong-opinions-loosely-held.md); take a clear stance + leave room for dialogue. 
4. **Second-order effects**: Pitch approved → resources in place → expectations rise → unmet Risk; follow [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md). 
5. **Occam's razor**: The simplest narrative that meets audience requirements wins; do not pile up slides; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md). 
6. **Audience**: Must do [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md); classify sponsor / CFO / legal / engineering / business / customer narratives. 
7. **Story**: Must do [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md); Question → solution → value → implementation → flywheel; emotion first, then data. 
8. **Data**: Must do [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) + [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) + [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md); 3-5 core metrics + trend + benchmark. 
9. **Strategy**: Must do [product-strategy-summary.md](../../product-manager/frameworks/prepare-a-product-strategy.md) + [blue-ocean-strategy-summary.md](../../executive/strategy/blue-ocean.md) + [porter-five-forces-summary.md](../../executive/strategy/porter-five-forces.md) + [business-model-canvas-summary.md](../../executive/strategy/business-model-canvas.md). 
10. **JTBD**: Must do [jobs-to-be-done-summary.md](../../product-manager/frameworks/jobs-to-be-done.md) to understand user / customer / internal real needs. 
11. **ROI**: Must do [rice-ice-prioritization-summary.md](../../product-manager/frameworks/rice-ice-prioritization.md) + [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md); cost / benefit / Risk / time. 
12. **Risk**: Must list risks + must mitigate + must compare; follow [brd-risks](../../brd/). 
13. **Comparison**: Must do [competitor-analysis-template.md](../../executive/industry/competitors/competitor-analysis.md) + [llm-vendor-landscape-summary.md](../../executive/industry/competitors/llm-vendor-landscape.md); peer / same-class comparison. 
14. **Roadmap**: Must do [now-next-later-roadmap-summary.md](../../executive/strategy/now-next-later-roadmap.md); now / next / later three sections + milestones + due dates. 
15. **OKR**: Must do [okr-design-summary.md](../../product-manager/frameworks/okr-design.md); target + key results + quarterly alignment. 
16. **Q&A**: Must open + must pre-screen + must answer live + must follow up after; follow [meeting-notes-template.md](../../knowledge-curator/templates/meeting-notes.md). 
17. **Draft**: Use [brd-generation-prompt.md](../../ai-engineer/methodology/prompts/brd-generation.md) + [weekly-report-prompt.md](../../ai-engineer/methodology/prompts/weekly-report.md) to let AI draft + human edit. 
18. **Pre-read**: Send material in advance + must have sponsor pre-review + must recruit supporters; follow [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md). 
19. **RACI**: Must do [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); presenter / data / Risk / Q&A / implementation owner. 
20. **Implementation**: After pitch approved must land ADR + must OKR + must milestone + must Retrospective; follow [adr-template.md](../../knowledge-curator/templates/adr.md). 
21. **Retrospective**: After the pitch, must do [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective narrative + data + implementation; archive under [review-log.md](../../knowledge-curator/governance/review-log.md). 
22. **Flywheel**: Pitch approved → trust → more investment → bigger pitch; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md). 

## Related

- Related journey: [./prepare-an-rfc.md](./prepare-an-rfc.md) — RFC
- Related journey: [../../product-manager/frameworks/prepare-a-go-to-market.md](../../product-manager/frameworks/prepare-a-go-to-market.md) — GTM
- Related journey: [./prepare-an-all-hands.md](./prepare-an-all-hands.md) — all-hands
- Related journey: [../../product-manager/discovery/write-a-prd.md](../../product-manager/discovery/write-a-prd.md) — PRD
- Upstream: [../../knowledge-curator/templates/thinking/README.md](../../knowledge-curator/templates/thinking/README.md) — thinking leaf entry
