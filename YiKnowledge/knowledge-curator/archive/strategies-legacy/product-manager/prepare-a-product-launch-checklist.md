---

title: I want to prepare a product launch checklist
aliases:
- I want to prepare a product launch checklist
- product-launch-checklist-journey
- launch-readiness-journey
- go-no-go-journey
- launch checklist entry
tags:
- journeys
- product-launch
- launch-readiness
- go-no-go
- soft-launch
- hard-launch
- checklist
category: product-manager/frameworks
created: 2026-08-03
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
roles:
- product-manager
benefit: launch is safe
acceptance_criteria:
- frontmatter roles + benefit + acceptance_criteria present
- descriptive verb-phrase filename, hyphens only, underscores and digits forbidden
- body contains user-story header + 7 fixed-order sections
related:
- ../../engineer/infrastructure/ship-a-release.md
- ./launch-an-ai-product.md
- ./prepare-a-go-to-market.md
- ../../knowledge-curator/governance/readiness-checklist.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a product launch checklist

> **As a** product manager, **I want to** prepare a product launch checklist, **so that** launch is safe. 

> "Readiness + communication + monitoring + fallback + traffic cut + go/no-go + retrospective" reach process + thinking + case study within 2 hops. 

## Summary

- Process follows [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [incident-response-process.md](../../engineer/processes/incident-response.md)
- Thinking follows [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Readiness follows [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) + [runbook](../../engineer/processes/write-a-runbook.md) + [retrospective-template.md](../../knowledge-curator/templates/retrospective.md)
- Case study follows [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch-lessons-summary.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario

When preparing a product launch checklist / launch readiness / go/no-go / soft launch / hard launch / gradual rollout / full rollout / big-promo launch / new feature launch / quarterly launch review / cross-team launch coordination / pre-launch review / post-launch monitoring, TL + PM + architect + sponsor need to look up process + thinking + case study. This entry aggregates product-launch-checklist-related process + thinking + case study into 2-hop paths, avoiding "hollow readiness / lagging communication / missing monitoring / fallback absent / chaotic traffic cut / gut-call go/no-go / retrospective missing". 

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [incident-response-process.md](../../engineer/processes/incident-response.md) · [requirement-review.md](../../product-manager/processes/requirement-review.md) · [design-review.md](../../product-manager/processes/design-review.md) · [tech-review.md](../../product-manager/processes/tech-review.md) · [cross-team-collaboration-process.md](../../engineer/process/cross-team-collaboration.md) · [capacity-planning-process.md](../../engineer/infrastructure/capacity-planning.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — launch essence · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — invert failure scenarios · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain effects · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) · [strong-opinions-loosely-held-summary.md](../../knowledge-curator/templates/thinking/strong-opinions-loosely-held.md) |
| `methodology/engineering-patterns/` | [feature-flag-pattern](../../engineer/patterns) · [dual-world-boundary-pattern.md](../../engineer/engineering/dual-world-boundary.md) · [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) · [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [supply-chain-hardening-pattern.md](../../engineer/quality-security/harden-supply-chain.md) |
| `methodology/pm-frameworks/` | [jobs-to-be-done-summary.md](../../product-manager/frameworks/jobs-to-be-done.md) · [kano-model-summary.md](../../product-manager/frameworks/kano-model.md) · [product-discovery-summary.md](../../product-manager/frameworks/prepare-a-product-discovery-strategy.md) · [rice-ice-prioritization-summary.md](../../product-manager/frameworks/rice-ice-prioritization.md) |
| `methodology/ai-specific/` | [rag-design-patterns-summary.md](../../ai-engineer/methodology/rag-design-patterns.md) · [hallucination-mitigation-summary.md](../../ai-engineer/methodology/hallucination-mitigation.md) · [llm-evaluation-summary.md](../../ai-engineer/methodology/llm-evaluation-methods.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [meeting-notes-template.md](../../knowledge-curator/templates/meeting-notes.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) |
| `resources/prompts/` | [weekly-report-prompt.md](../../ai-engineer/methodology/prompts/weekly-report.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [brd-generation-prompt.md](../../ai-engineer/methodology/prompts/brd-generation.md) |
| `lifecycle/` | [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `product/strategy/` | [product-strategy-summary.md](../../product-manager/frameworks/prepare-a-product-strategy.md) · [now-next-later-roadmap-summary.md](../../executive/strategy/now-next-later-roadmap.md) · [second-curve-summary.md](../../executive/strategy/second-curve.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) |
| `tech/ai-platform/` | [llm-comparison-summary.md](../../ai-engineer/platform/llm-comparison.md) · [llm-observability-comparison-summary.md](../../ai-engineer/platform/llm-observability-comparison.md) · [inference-engine-comparison-summary.md](../../ai-engineer/platform/inference-engine-comparison.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) · [contract-negotiation-summary.md](./../../engineer/strategies/prepare-a-contract-strategy.md) |
| `work/meetings/` | [review-meeting-template.md](../../product-manager/meetings/review-meeting.md) · [weekly-meeting-template.md](../../product-manager/meetings/weekly-meeting.md) · [retrospective-sample.md](../../product-manager/delivery/retrospective.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — launch communication |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — oncall matrix |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yipet-stack-migration-win.md](../../engineer/lessons/wins/yipet-stack-migration.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch-lessons-summary.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [incident-postmortem-summary.md](../../engineer/lessons/failures/incident-postmortem.md) · [bugs/](../../engineer/lessons/failures/bugs) — launch failure archive |
| `lessons/gotchas/` | [macos-fsevents-silent-drop.md](./../../engineer/lessons/gotchas/macos-fsevents-silent-drop.md) · [sse-ondone-guard.md](./../../engineer/lessons/gotchas/sse-ondone-guard.md) · [no-lockfile-supply-chain-risk.md](./../../engineer/lessons/gotchas/no-lockfile-supply-chain-risk.md) |
| `industry/` | [ai-industry-report.md](../../executive/industry/reports/ai-industry-report.md) · [ai-market-trend-first-half.md](../../executive/industry/market-trends/ai-market-trend-first-half.md) |
| `brd/` | [brd-documents](../../brd/) · [brd-objectives](../../brd/) · [brd-risks](../../brd/) · [scenarios](../../brd/) |
| `projects/` | each project `architecture-summary.md` + `project-management-summary.md` + `adr-*` |
| `journeys/` | [../../engineer/infrastructure/ship-a-release.md](../../engineer/infrastructure/ship-a-release.md) · [./launch-an-ai-product.md](./launch-an-ai-product.md) · [./prepare-a-go-to-market.md](./prepare-a-go-to-market.md) · [../../engineer/strategies/prepare-release-notes.md](../../engineer/strategies/prepare-release-notes.md) |

## Action recommendations

1. **First principles**: first ask "what question must launch answer / what if not launched / ROI / user impact"; do not launch for the sake of launching; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md). 
2. **Inversion**: first imagine "how launch could fail (hollow readiness / missing monitoring / fallback absent / chaotic traffic cut / lagging communication)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md). 
3. **Second-order effects**: launch → traffic surge → capacity burst → another expansion; see [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md). 
4. **Occam**: the simplest launch that satisfies business wins; do not pile up features; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md). 
5. **Readiness**: must run [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) + tier by product / technology / legal / business / market / customer success. 
6. **Monitoring**: must run [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + core metrics + thresholds + alerts. 
7. **Fallback**: must run feature flag + rollback + rate limiting + graceful degradation; see [dual-world-boundary-pattern.md](../../engineer/engineering/dual-world-boundary.md). 
8. **Traffic cut**: must run gradual rollout (1% → 10% → 50% → 100%) + monitoring + rollback capability. 
9. **Go/no-go**: must run [meeting-notes-template.md](../../knowledge-curator/templates/meeting-notes.md) + 5 dimensions (product / technology / business / legal / market) + dual sign-off. 
10. **Freeze period**: must run [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) leaving other modules untouched. 
11. **AI launch**: LLM must run [llm-evaluation-summary.md](../../ai-engineer/methodology/llm-evaluation-methods.md) + hallucination fallback + fallback switch. 
12. **Communication**: must run [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) communicating inside and outside + all-hands + Q&A. 
13. **RACI**: must run [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); PM / engineering / sponsor / legal / market owners. 
14. **Cross time zone**: must run [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md); tiered multi-timezone launch. 
15. **Contract**: third-party dependencies must run [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) + notify launch plan. 
16. **Runbook**: must run [runbook](../../engineer/processes/write-a-runbook.md) + oncall + SOP. 
17. **Retrospective**: after launch must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive in [bugs/](../../engineer/lessons/failures/bugs). 
18. **Quarterly audit**: follow [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) scanning whether the checklist is still accurate + whether monitoring still covers. 
19. **ADR**: launch decision must land in ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md). 
20. **Flywheel**: smooth launch → trust grows → more investment → larger business; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md). 

## Related

- Same-class journey: [../../engineer/infrastructure/ship-a-release.md](../../engineer/infrastructure/ship-a-release.md) — release
- Same-class journey: [./launch-an-ai-product.md](./launch-an-ai-product.md) — AI launch
- Same-class journey: [./prepare-a-go-to-market.md](./prepare-a-go-to-market.md) — GTM
- Same-class journey: [../../engineer/strategies/prepare-release-notes.md](../../engineer/strategies/prepare-release-notes.md) — release notes
- Upstream: [../../knowledge-curator/README.md](../../knowledge-curator/README.md) — lifecycle leaf entry
