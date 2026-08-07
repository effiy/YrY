---
title: Product Metrics / Product Metrics
tags: [leaf, product, metrics]
category: product-manager/discovery/metrics
created: 2026-08-03
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: leaf-readme
lifecycle: reference
status: stable
review_cycle: quarterly
roles: [product-manager, executive]
benefit: "product decision clear"
acceptance_criteria:
  - "scope of the leaf directory is clearly bounded"
  - "file inventory table is complete with one-liner descriptions"
  - "cross-references to related leaves and parent INDEX are present
related:
  - ../../../engineer/lessons/learn-pm-frameworks.md
  - ../../../executive/strategy/README.md
  - ../../frameworks/heart-aarrr-metrics.md
---

# Product Metrics / Product Metrics

"> **As a** product manager, **I want to** discover user needs and validate product decisions, **so that** we build the right things for the right reasons.

Includes the product metric system, monitoring standards, and North-star metric. 

## Included scope

- North-star metric
- AI product specific metrics (hallucination rate, confidence, tool call success rate) 
- Retention and churn
- AARRR pirate metrics
- DORA engineering efficiency

## file type and naming

- `*-summary.md`: summary of a metric system
- `*-template.md`: metric definition template
- Naming uses English kebab-case

## Frontmatter Template

```yaml
---
title: A metric system
tags: [metric, monitoring]
created: YYYY-MM-DD
source: <link>
type: summary
lifecycle: reference
review_cycle: quarterly
related:
  - ./ai-product-metrics.md
  - ./dashboard-customer-health.md
  - ./dashboard-product-portfolio.md
  - ../README.md
  - ../INDEX.md
---
```

## Recommended writing structure

1. Metric definition (formula / computation logic) 
2. Collection method (instrumentation / log / lookup) 
3. Health threshold (green / yellow / red) 
4. Exception handling process
5. Related metrics (leading / lagging) 
6. Current value and target for this product

## Already included

- `north-star-metric-summary.md` — North-star metric
- `ai-product-metrics-summary.md` — AI product specific metrics (hallucination rate / confidence / tool call success rate) 
- `retention-and-churn-summary.md` — retention and churn metrics
- `aarrr-metrics.md` — AARRR pirate metrics: stage-by-stage metrics, AI product adaptations
- `dora-metrics.md` — DORA engineering efficiency metrics: four key metrics, Elite/High/Medium/Low benchmarks, capability drivers
- `nps-csat.md` — NPS and CSAT methodology: survey design, closing-the-loop process, AI product considerations
- `funnel-conversion.md` — Funnel conversion analysis: AIDA model, drop-off diagnosis, CRO experimentation framework

## Related leaf

- [../../../executive/strategy](../../../executive/strategy) — strategy alignment
- [../ux/](../ux/) — UX Measurement
- [../../frameworks](../../frameworks) — HEART / AARRR
- [../../../engineer/process/engineering-productivity-metrics.md](../../../engineer/process/engineering-productivity-metrics.md) — DORA
- [../../../engineer/lessons/learn-pm-frameworks.md](../../../engineer/lessons/learn-pm-frameworks.md) — scenario entry
