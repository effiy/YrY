---

title: I want to prepare a market research strategy
aliases:
- I want to prepare a market research strategy
- market-research-journey
- market-sizing-journey
- competitive-analysis-journey
- market research entry
tags:
- journeys
- market-research
- market-sizing
- competitive-analysis
- positioning
- voice-of-customer
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
- filename is a descriptive verb-phrase, hyphens only, no underscores or digits
- body contains user-story header + 7 fixed-order sections
related:
- ../../engineer/process/understand-competitors.md
- ../../product-manager/frameworks/prepare-a-product-strategy.md
- ../../product-manager/frameworks/prepare-a-go-to-market.md
- ../../product-manager/frameworks/jobs-to-be-done.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a market research strategy

> **As an** executive,**I want to** prepare a market research,**so that** launch is safe.

> "Sizing + segmentation + competitors + positioning + VoC + trends + information sources + quarterly audit" — reach process + thinking + cases within 2 hops.

## Summary

- Process: [requirement-review.md](../../product-manager/processes/requirement-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md)
- Thinking: [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform: [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [observability-pattern.md](../../engineer/patterns/observability.md)
- Cases: [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario description

When preparing market research strategy / market sizing / market segmentation / competitor analysis / positioning / information sources / VoC / trends / research communication / research freeze window / quarterly research audit / research retrospective, TL + PM + business + strategy + sponsor need to find process + thinking + cases. This entry aggregates market-research-related process + thinking + cases into 2-hop paths to avoid "gut feel / stale data / missed competitors / vague positioning / no quarterly audit".

## 2-hop reach paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [requirement-review.md](../../product-manager/processes/requirement-review.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) |
| `methodology/pm-frameworks/` | [jobs-to-be-done-summary.md](../../product-manager/frameworks/jobs-to-be-done.md) · [kano-model-summary.md](../../product-manager/frameworks/kano-model.md) · [rice-ice-prioritization-summary.md](../../product-manager/frameworks/rice-ice-prioritization.md) · [okr-summary.md](../../product-manager/frameworks/prepare-a-okr-strategy.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — research intent · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — reverse-think bias · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — cascades · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [observability-pattern.md](../../engineer/patterns/observability.md) · [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) |
| `product/strategy/` | [product-strategy-summary.md](../../product-manager/frameworks/prepare-a-product-strategy.md) · [blue-ocean-strategy-summary.md](../../executive/strategy/blue-ocean.md) · [business-model-canvas-summary.md](../../executive/strategy/business-model-canvas.md) · [now-next-later-roadmap-summary.md](../../executive/strategy/now-next-later-roadmap.md) · [second-curve-summary.md](../../executive/strategy/second-curve.md) |
| `industry/` | [competitor-analysis-template.md](../../executive/industry/competitors/competitor-analysis.md) · [ai-industry-report.md](../../executive/industry/reports/ai-industry-report.md) · [ai-market-trend-first-half.md](../../executive/industry/market-trends/ai-market-trend-first-half.md) · [use-cases.md](./../industry/README.md) |
| `resources/templates/` | [prd-template.md](../../knowledge-curator/templates/prd.md) · [meeting-notes-template.md](../../knowledge-curator/templates/meeting-notes.md) · [one-on-one-template.md](../../knowledge-curator/templates/one-on-one.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) |
| `resources/prompts/` | [brd-generation-prompt.md](../../ai-engineer/methodology/prompts/brd-generation.md) · [weekly-report-prompt.md](../../ai-engineer/methodology/prompts/weekly-report.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — research communication |
| `people/experts/` | [domain-experts.md](./../../knowledge-curator/people/README.md) — expert interviews |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — research failure archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [brd-objectives](../../brd/) · [scenarios](../../brd/) · [reference](../../brd/) — research basis |
| `projects/` | Each project's `architecture-summary.md` § market + `adr-*` § positioning |
| `journeys/` | [../../engineer/process/understand-competitors.md](../../engineer/process/understand-competitors.md) · [../../product-manager/frameworks/prepare-a-product-strategy.md](../../product-manager/frameworks/prepare-a-product-strategy.md) · [../../product-manager/frameworks/prepare-a-go-to-market.md](../../product-manager/frameworks/prepare-a-go-to-market.md) · [../../tech-lead/roadmap/prepare-a-product-roadmap.md](../../tech-lead/roadmap/prepare-a-product-roadmap.md) |

## Action recommendations

1. **First principles**: ask first "what does research solve / what happens if not done / ROI / business impact"; do not research for research's sake; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
2. **Inversion**: think first "how research could go out of control (biased / stale / missed / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
3. **Second-order effects**: one research → strategy changes → another adjustment; follow [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md).
4. **Occam**: the simplest research that meets business needs wins; do not stack methods; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md).
5. **Sizing**: must run TAM / SAM / SOM + avoid gut feel.
6. **Segmentation**: must segment (industry / size / region / use case) + avoid being too broad.
7. **Competitors**: must build a competitor matrix + avoid feature-only comparison; follow [i-want-to-understand-competitors.md](../../engineer/process/understand-competitors.md).
8. **Positioning**: must do positioning + avoid feature piling; follow [blue-ocean-strategy-summary.md](../../executive/strategy/blue-ocean.md).
9. **VoC**: must run VoC + must interview + avoid survey-only.
10. **Trends**: must look at trends + avoid only-current; follow [ai-market-trend-first-half.md](../../executive/industry/market-trends/ai-market-trend-first-half.md).
11. **Information sources**: must use multi-source (reports / interviews / databases / public data) + avoid single source.
12. **Methods**: must combine qualitative + quantitative + avoid single method.
13. **AI-assisted**: LLM must run auto-summarization + avoid all-manual; follow [hallucination-mitigation-summary.md](../../ai-engineer/methodology/hallucination-mitigation.md).
14. **RACI**: must follow [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); PM / strategy / business / sponsor owner.
15. **Freeze window**: during peak promotion follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md), do not change research framing.
16. **Communication**: must follow [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) to communicate internally and externally.
17. **Monitoring**: must follow [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) for data update alerts.
18. **Retrospective**: after research failure must follow [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) for retrospective + archive in [bugs/](../../engineer/lessons/failures/bugs).
19. **Quarterly audit**: follow [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) to scan whether data is still accurate + whether competitors are still complete.
20. **ADR**: research decisions must be captured in ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md).
21. **Flywheel**: good research → accurate strategy → fast decisions → more business; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md).

## Related

- Similar journey: [../../engineer/process/understand-competitors.md](../../engineer/process/understand-competitors.md) — competitors
- Similar journey: [../../product-manager/frameworks/prepare-a-product-strategy.md](../../product-manager/frameworks/prepare-a-product-strategy.md) — product strategy
- Similar journey: [../../product-manager/frameworks/prepare-a-go-to-market.md](../../product-manager/frameworks/prepare-a-go-to-market.md) — GTM
- Similar journey: [../../tech-lead/roadmap/prepare-a-product-roadmap.md](../../tech-lead/roadmap/prepare-a-product-roadmap.md) — roadmap
- Upstream: [../../executive/industry/README.md](../../executive/industry/README.md) — industry leaf entry
