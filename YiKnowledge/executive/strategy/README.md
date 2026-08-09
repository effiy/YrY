---
title: Executive Strategy Directory
aliases: [product-strategy, strategy-frameworks, executive-strategy]
tags: [leaf, product, strategy]
category: executive/strategy
created: 2026-08-03
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
lifecycle: reference
status: stable
review_cycle: quarterly
roles: [executive, product-manager]
benefit: "strategy aligned"
acceptance_criteria:
  - "scope of the leaf directory is clearly bounded"
  - "file inventory table is complete with one-liner descriptions"
  - "cross-references to related leaves and parent INDEX are present
related:
  - ../../engineer/lessons/learn-pm-frameworks.md
  - ../../engineer/process/understand-competitors.md
  - ../../product-manager/discovery/metrics--README.md
  - ../../knowledge-curator/templates/thinking--README.md
---

# Executive Strategy Directory

> **As an** executive, **I want to** apply product strategy frameworks (positioning, business models, roadmaps), **so that** product direction aligns with market opportunities and business goals.

Covers product strategy frameworks, roadmap design, business models, and positioning methods.

## Scope

- Product vision and positioning
- Business Model Canvas
- Roadmap design (Now / Next / Later)
- Competitive strategy (Blue Ocean, differentiation)
- Second curve and product portfolio management

## File types and naming

- `{strategy-name}-summary.md`: strategy framework summary
- `{strategy-name}-strategy.md`: this product's strategy instance
- Naming uses English kebab-case

## Frontmatter template

```yaml
---
title: Some Strategy Framework
tags: [strategy, product, topic]
created: YYYY-MM-DD
updated: YYYY-MM-DD
last_verified: 2026-08-07
source: <link or internal>
type: summary
lifecycle: reference
review_cycle: quarterly
related:
  - ./blue-ocean.md
  - ./business-model-canvas.md
  - ./dashboard-executive-kpi.md
  - ../README.md
  - ../INDEX.md
---
```

## Recommended writing structure

1. Strategy framework definition
2. Applicable scenarios
3. Design steps
4. Key outputs
5. Anti-patterns
6. This product's landing instance

## Already indexed

- `product-strategy-framework.md` — Product Strategy Framework summary
- `business-model-canvas.md` — Business Model Canvas
- `now-next-later-roadmap.md` — Now / Next / Later roadmap
- `porter-five-forces.md` — Porter's Five Forces
- `blue-ocean.md` — Blue Ocean Strategy
- `second-curve.md` — Second Curve
- `swot-analysis.md` — SWOT Analysis framework (internal/external situation audit)
- `vrio-framework.md` — VRIO Framework (sustainable competitive advantage assessment)
- `value-proposition-canvas.md` — Value Proposition Canvas (customer jobs/pains/gains + product fit)
- `product-strategy-instance.md` — Product strategy instance for the AI after-sales platform

## Related leaves

- [../../product-manager/discovery/metrics](../../product-manager/discovery/metrics) — Strategy-aligned metrics
- [../../product-manager/discovery/ux](../../product-manager/discovery/ux) — User perspective
- [../../knowledge-curator/templates/thinking](../../knowledge-curator/templates/thinking) — Mental models
- [../industry/competitors](../industry/competitors) — Competitive benchmarking
- [../../engineer/lessons/learn-pm-frameworks.md](../../engineer/lessons/learn-pm-frameworks.md) — Scenario entry
- [../../engineer/process/understand-competitors.md](../../engineer/process/understand-competitors.md) — Scenario entry
