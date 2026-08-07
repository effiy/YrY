---

title: I want to prepare a technical vision
aliases:
- I want to prepare a technical vision
- technical-vision-journey
- tech-strategy-journey
- technical-vision entry
tags:
- journeys
- technical-vision
- tech-strategy
- roadmap
- architecture
- second-curve
category: executive/strategy
created: 2026-08-03
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
roles:
- executive
benefit: launch is safe
acceptance_criteria:
- frontmatter roles + benefit + acceptance_criteria present
- Filename is descriptive verb-phrase, hyphens only, no underscores or digits
- body contains user-story header + 7 fixed-order sections
related:
- ../../engineer/strategies/prepare-a-pitch.md
- ../../engineer/strategies/prepare-an-rfc.md
- ../../engineer/processes/do-a-tech-stack-inventory.md
- ../../product-manager/frameworks/prepare-a-product-strategy.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a technical vision

> **As an** executive, **I want to** prepare a technical vision, **so that** launch is safe.

> "Current state + second curve + roadmap + investment + risk + comparison + landing + retrospective" — templates + thinking + cases reachable within 2 hops.

## Summary

- Templates via [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) + [adr-template.md](../../knowledge-curator/templates/adr.md) + [tech-selection-evaluation-template.md](../../knowledge-curator/templates/tech-selection-evaluation.md) + [meeting-notes-template.md](../../knowledge-curator/templates/meeting-notes.md)
- Thinking via [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [second-curve-summary.md](../../executive/strategy/second-curve.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md)
- Strategy via [product-strategy-summary.md](../../product-manager/frameworks/prepare-a-product-strategy.md) + [now-next-later-roadmap-summary.md](../../executive/strategy/now-next-later-roadmap.md) + [porter-five-forces-summary.md](../../executive/strategy/porter-five-forces.md)
- Cases via [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch-lessons-summary.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario

When preparing a technical vision / tech vision / 3-5 year tech strategy / quarterly tech-strategy review / annual tech planning / new-direction exploration / second curve / tech radar / tech-investment briefing / sponsor pitching for investment / architecture evolution roadmap, TL + architect + sponsor + PM need templates + thinking + cases. This entry aggregates tech-vision-related templates + thinking + cases into 2-hop paths to avoid "unclear current state / missed second curve / empty roadmap / gut-feel investment / missed risks / empty comparison / dragging landing / missing retrospective".

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `product/strategy/` | [product-strategy-summary.md](../../product-manager/frameworks/prepare-a-product-strategy.md) · [second-curve-summary.md](../../executive/strategy/second-curve.md) · [now-next-later-roadmap-summary.md](../../executive/strategy/now-next-later-roadmap.md) · [porter-five-forces-summary.md](../../executive/strategy/porter-five-forces.md) · [blue-ocean-strategy-summary.md](../../executive/strategy/blue-ocean.md) · [business-model-canvas-summary.md](../../executive/strategy/business-model-canvas.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — vision essence · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — invert to find failure modes · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain reactions · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [strong-opinions-loosely-held-summary.md](../../knowledge-curator/templates/thinking/strong-opinions-loosely-held.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [dual-world-boundary-pattern.md](../../engineer/engineering/dual-world-boundary.md) · [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) · [eval-driven](../../engineer/engineering/evaluation-driven-development.md) · [supply-chain-hardening-pattern.md](../../engineer/quality-security/harden-supply-chain.md) |
| `methodology/pm-frameworks/` | [okr-design-summary.md](../../product-manager/frameworks/okr-design.md) · [jobs-to-be-done-summary.md](../../product-manager/frameworks/jobs-to-be-done.md) · [rice-ice-prioritization-summary.md](../../product-manager/frameworks/rice-ice-prioritization.md) · [product-discovery-summary.md](../../product-manager/frameworks/prepare-a-product-discovery-strategy.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [tech-selection-evaluation-template.md](../../knowledge-curator/templates/tech-selection-evaluation.md) · [meeting-notes-template.md](../../knowledge-curator/templates/meeting-notes.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [brd-generation-prompt.md](../../ai-engineer/methodology/prompts/brd-generation.md) · [weekly-report-prompt.md](../../ai-engineer/methodology/prompts/weekly-report.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) |
| `work/processes/` | [tech-roadmap-review-process.md](../../engineer/processes/tech-roadmap-review.md) · [requirement-review.md](../../product-manager/processes/requirement-review.md) · [design-review.md](../../product-manager/processes/design-review.md) · [tech-review.md](../../product-manager/processes/tech-review.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [capacity-planning-process.md](../../engineer/infrastructure/capacity-planning.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `tech/ai-platform/` | [llm-comparison-summary.md](../../ai-engineer/platform/llm-comparison.md) · [inference-engine-comparison-summary.md](../../ai-engineer/platform/inference-engine-comparison.md) · [vector-db-comparison-summary.md](../../ai-engineer/platform/vector-db-comparison.md) · [embedding-model-selection-summary.md](../../ai-engineer/platform/embedding-model-selection.md) · [llm-observability-comparison-summary.md](../../ai-engineer/platform/llm-observability-comparison.md) |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [lakehouse-architecture-summary.md](../../ai-engineer/data/lakehouse-architecture.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) |
| `methodology/ai-specific/` | [rag-design-patterns-summary.md](../../ai-engineer/methodology/rag-design-patterns.md) · [hallucination-mitigation-summary.md](../../ai-engineer/methodology/hallucination-mitigation.md) · [llm-evaluation-summary.md](../../ai-engineer/methodology/llm-evaluation-methods.md) |
| `industry/` | [ai-industry-report.md](../../executive/industry/reports/ai-industry-report.md) · [ai-market-trend-first-half.md](../../executive/industry/market-trends/ai-market-trend-first-half.md) · [llm-vendor-landscape-summary.md](../../executive/industry/competitors/llm-vendor-landscape.md) · [competitor-analysis-template.md](../../executive/industry/competitors/competitor-analysis.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — audience |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — team capability |
| `work/meetings/` | [review-meeting-template.md](../../product-manager/meetings/review-meeting.md) · [weekly-meeting-template.md](../../product-manager/meetings/weekly-meeting.md) · [retrospective-sample.md](../../product-manager/delivery/retrospective.md) |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yipet-stack-migration-win.md](../../engineer/lessons/wins/yipet-stack-migration.md) · [yry-vite-to-rsbuild-migration-win.md](../../engineer/lessons/wins/yry-vite-to-rsbuild-migration.md) · [yivad-leaf-view-leaves-ssot-win.md](../../engineer/lessons/wins/yivad-leaf-view-leaves-ssot.md) |
| `lessons/failures/` | [ai-product-launch-lessons-summary.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [incident-postmortem-summary.md](../../engineer/lessons/failures/incident-postmortem.md) |
| `brd/` | [brd-documents](../../brd/) · [brd-objectives](../../brd/) · [brd-risks](../../brd/) · [brd-reference](../../brd/) |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) — vision archival |
| `projects/` | each project's `architecture-summary.md` + `adr-*` + `dev-standards-summary.md` |
| `journeys/` | [../../engineer/strategies/prepare-a-pitch.md](../../engineer/strategies/prepare-a-pitch.md) · [../../engineer/strategies/prepare-an-rfc.md](../../engineer/strategies/prepare-an-rfc.md) · [../../engineer/processes/do-a-tech-stack-inventory.md](../../engineer/processes/do-a-tech-stack-inventory.md) · [../../engineer/processes/do-a-code-archaeology.md](../../engineer/processes/do-a-code-archaeology.md) |

## Action recommendations

1. **First principles**: First ask "What question / user / business / not-doing / ROI must the vision answer?"; do not chase a vision for its own sake; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
2. **Second curve**: Must read [second-curve-summary.md](../../executive/strategy/second-curve.md); current business first curve + new business second curve + leap timing.
3. **Inversion**: First imagine "how the vision could fail (no investment / team doesn't buy in / landing drags / business shifts / tech shifts)", then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
4. **Strong opinions loosely held**: Must read [strong-opinions-loosely-held-summary.md](../../knowledge-curator/templates/thinking/strong-opinions-loosely-held.md); take a clear stance + leave room for dialogue.
5. **Second-order effects**: Vision lands → resources arrive → expectations rise → fall-short risk; see [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md).
6. **Occam**: The simplest tech stack that satisfies the strategy wins; do not stack tech; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md).
7. **Strategy**: Must read [product-strategy-summary.md](../../product-manager/frameworks/prepare-a-product-strategy.md) + [porter-five-forces-summary.md](../../executive/strategy/porter-five-forces.md) + [business-model-canvas-summary.md](../../executive/strategy/business-model-canvas.md); tech must serve the business.
8. **JTBD**: Must read [jobs-to-be-done-summary.md](../../product-manager/frameworks/jobs-to-be-done.md) to understand user / business real needs.
9. **Current state**: Must sweep tech stack + tech debt + cost + capacity + team; see [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) + [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md).
10. **Radar**: Must read [ai-industry-report.md](../../executive/industry/reports/ai-industry-report.md) + [llm-vendor-landscape-summary.md](../../executive/industry/competitors/llm-vendor-landscape.md) + [competitor-analysis-template.md](../../executive/industry/competitors/competitor-analysis.md) to scan peers and parallels.
11. **Roadmap**: Must read [now-next-later-roadmap-summary.md](../../executive/strategy/now-next-later-roadmap.md); now / next / later three sections + milestone + due.
12. **OKR**: Must read [okr-design-summary.md](../../product-manager/frameworks/okr-design.md); objectives + key results + quarterly alignment.
13. **ROI**: Must read [rice-ice-prioritization-summary.md](../../product-manager/frameworks/rice-ice-prioritization.md) + [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md); cost / benefit / risk / time.
14. **Risk**: Must list risks + must-mitigation + must-comparison; see [brd-risks](../../brd/).
15. **AI selection**: Must read [llm-comparison-summary.md](../../ai-engineer/platform/llm-comparison.md) + [inference-engine-comparison-summary.md](../../ai-engineer/platform/inference-engine-comparison.md) + [vector-db-comparison-summary.md](../../ai-engineer/platform/vector-db-comparison.md).
16. **Data**: Must read [data-governance-summary.md](../../ai-engineer/data/data-governance.md) + [lakehouse-architecture-summary.md](../../ai-engineer/data/lakehouse-architecture.md).
17. **RACI**: Must read [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); vision presenter / investor / landing / risk owner.
18. **Pre-read**: Distribute materials in advance + must sponsor pre-review; see [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md).
19. **Q&A**: Must be open + must pre-screen + must answer live + must follow-up after; see [meeting-notes-template.md](../../knowledge-curator/templates/meeting-notes.md).
20. **Landing**: Once vision passes, must land ADR + must OKR + must milestone + must retrospective; see [adr-template.md](../../knowledge-curator/templates/adr.md).
21. **Retrospective**: After the vision, must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) to retrospect narrative + landing; archive in [review-log.md](../../knowledge-curator/governance/review-log.md).
22. **Quarterly audit**: Read [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) to scan whether the vision still aligns with strategy + is still accurate.
23. **Flywheel**: Vision lands → trust grows → more investment → bigger vision; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md).

## Related

- Similar journey: [../../engineer/strategies/prepare-a-pitch.md](../../engineer/strategies/prepare-a-pitch.md) — pitch
- Similar journey: [../../engineer/strategies/prepare-an-rfc.md](../../engineer/strategies/prepare-an-rfc.md) — RFC
- Similar journey: [../../engineer/processes/do-a-tech-stack-inventory.md](../../engineer/processes/do-a-tech-stack-inventory.md) — tech-stack inventory
- Similar journey: [../../engineer/processes/do-a-code-archaeology.md](../../engineer/processes/do-a-code-archaeology.md) — code archaeology
- Upstream: [../../executive/strategy/README.md](../../executive/strategy/README.md) — strategy leaf entry
