---
title: Product Management Frameworks / PM Frameworks
tags: [leaf, methodology, pm-frameworks]
category: product-manager/frameworks
created: 2026-08-03
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
lifecycle: reference
status: stable
review_cycle: quarterly
roles: [product-manager, executive]
benefit: "PMs find the right prioritization and discovery framework for their context, avoiding cargo-cult methodology"
acceptance_criteria:
  - "scope of the leaf directory is clearly bounded"
  - "file inventory table is complete with one-liner descriptions"
  - "cross-references to related leaves and parent INDEX are present
related:
  - ../../engineer/lessons/learn-pm-frameworks.md
  - ../../executive/strategy/README.md
  - ../discovery/metrics--README.md
  - ../discovery/ux--README.md
---

# Product Management Frameworks / PM Frameworks

> **As a** product manager, **I want to** find the right PM framework for my situation, **so that** I can apply proven methodologies to product decisions.

Collects product management methodologies, process frameworks, and decision models.

## Scope

- Agile product management (Scrum / Kanban / SAFe)
- Product discovery and delivery (Dual-Track Agile, Discovery)
- Roadmap and prioritization (RICE, ICE, MoSCoW, Kano)
- User research methods (JTBD, persona, journey map)
- Measurement and retrospectives (OKR, NPS, HEART, AARRR)

## File types and naming

- `{framework-name}-summary.md`: framework summary
- `{framework-name}-template.md`: reusable template
- Naming uses English kebab-case

## Frontmatter template

```yaml
---
title: Some Framework
tags: [PM, framework, topic]
created: YYYY-MM-DD
updated: YYYY-MM-DD
last_verified: 2026-08-07
source: <link or internal>
type: summary
lifecycle: reference
review_cycle: quarterly
related:
  - ./agile-product-management.md
  - ./dashboard-pm-frameworks.md
  - ./do-user-research.md
  - ../README.md
  - ../INDEX.md
---
```

## Recommended structure

1. Framework origin and authors
2. Core concepts and principles
3. Implementation steps
4. Inputs / output artifacts
5. Applicable scenarios and boundaries
6. Comparison with other frameworks
7. This team's landing cases

## Included

- `agile-product-management-summary.md` — Agile product management summary
- `rice-ice-prioritization-summary.md` — RICE / ICE prioritization framework
- `jobs-to-be-done-summary.md` — Jobs-to-Be-Done (JTBD)
- `kano-model-summary.md` — Kano model
- `heart-aarrr-metrics-summary.md` — HEART / AARRR metrics framework
- `okr-design-summary.md` — OKR design guide
- `dual-track-agile-summary.md` — Dual-Track Agile
- `product-discovery-framework-summary.md` — Product Discovery framework
- `moscow-prioritization.md` — MoSCoW prioritization method
- `story-mapping.md` — User story mapping technique
- `lean-startup.md` — Lean Startup methodology
- `jtbd-kano.md` — JTBD + Kano model integration

## Related leaves

- [../../ai-engineer/methodology](../../ai-engineer/methodology) — AI methodology
- [../../knowledge-curator/templates/thinking](../../knowledge-curator/templates/thinking) — thinking models
- [../../executive/strategy](../../executive/strategy) — strategy
- [../product/metrics](../discovery/metrics) — metrics
- [../product/ux](../discovery/ux) — UX
- [../../knowledge-curator/templates](../../knowledge-curator/templates) — templates
- [../../engineer/lessons/learn-pm-frameworks.md](../../engineer/lessons/learn-pm-frameworks.md) — scenario entry
