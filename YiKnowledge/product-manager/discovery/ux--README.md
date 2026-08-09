---
title: user experience / UX
tags: [leaf, product, ux]
category: product-manager/discovery/ux
created: 2026-08-03
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
lifecycle: reference
status: stable
review_cycle: quarterly
roles: [product-manager]
benefit: "product decision clear"
acceptance_criteria:
  - "scope of the leaf directory is clearly bounded"
  - "file inventory table is complete with one-liner descriptions"
  - "cross-references to related leaves and parent INDEX are present"
related:
 - ../../../engineer/lessons/learn-pm-frameworks.md
 - ../metrics/README.md
 - ../../frameworks/README.md
---

# user experience / UX

> **As a** product manager, **I want to** discover user needs and validate product decisions, **so that** we build the right things for the right reasons.

Collects UX research, design principles, usability QA results.

## Collection scope

- UX research summary
- design principles (Nielsen 10 heuristics etc)
- usability QA report
- AI product UX patterns
- cross-cultural UX
- visual walkthrough records

## File type and naming

- `*-summary.md`: UX research summary
- `*-test.md`: usability QA report
- `*-review.md`: visual walkthrough
- naming uses English kebab-case

## Frontmatter Template

```yaml
---
title: some UX research
tags: [UX, usability]
created: YYYY-MM-DD
source: <link or internal>
type: summary
lifecycle: active
review_cycle: quarterly
related:
  - ./after-sales-pad-visual-review.md
  - ./ai-product-ux-patterns.md
  - ./cross-cultural-ux.md
  - ../README.md
  - ../INDEX.md
---
```

## Writing recommended structure

1. research target
2. method (interview / usability QA / data analysis)
3. key discovery
4. design suggestion
5. follow-up tracking
6. related metrics

## Already collected

- `spritesheet-summary.md` — Snowgraph summary
- `after-sales-pad-visual-review-summary.md` — after-sales PAD visual walkthrough table (7.21)
- `ai-product-ux-patterns-summary.md` — AI product UX patterns (stream output / thinking display / tool call transparency)
- `nielsen-heuristics-summary.md` — Nielsen 10 heuristics assessment
- `cross-cultural-ux-summary.md` — cross-cultural UX design
- `mobile-usability.md` — Mobile usability best practices
- `accessibility.md` — Web accessibility standards
- `information-architecture.md` — Information architecture design
- `micro-interaction.md` — Micro-interaction design

## Related leaf

- [../metrics/](../metrics/) — UX Measurement (CSAT / task completion rate)
- [../../../executive/strategy](../../../executive/strategy) — strategy alignment
- [../../frameworks](../../frameworks) — PM framework
- [../../../knowledge-curator/templates/usability-test-report.md](../../../knowledge-curator/templates/usability-test-report.md) — usability QA template
- [../../../engineer/lessons/learn-pm-frameworks.md](../../../engineer/lessons/learn-pm-frameworks.md) — scenario entry
