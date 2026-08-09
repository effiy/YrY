---
title: Thinking Models / Thinking Models
tags: [leaf, methodology, thinking]
category: knowledge-curator/templates/thinking
created: 2026-08-03
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
lifecycle: reference
status: stable
review_cycle: yearly
roles: [engineer, product-manager, tech-lead, ai-engineer, knowledge-curator, executive, oncall-sre, new-hire]
benefit: "Decision-makers apply thinking frameworks (first principles, inversion, Occam's razor) to make better judgments and avoid cognitive biases"
acceptance_criteria:
  - "scope of the leaf directory is clearly bounded"
  - "file inventory table is complete with one-liner descriptions"
  - "cross-references to related leaves and parent INDEX are present
related:
  - ../../../product-manager/frameworks/README.md
  - ../../../executive/strategy/README.md
---

# Thinking Models / Thinking Models

> **As a** knowledge curator, **I want to** find the right template quickly, **so that** I can create consistent, well-structured knowledge entries.

A collection of general thinking frameworks and decision models.

## Scope

- first principles / inversion thinking / second-order thinking
- Occam's razor / flywheel effect
- Strong Opinions, Loosely Held
- decision-making and judgment biases

## File types and naming

- `*-summary.md`: a summary of a given thinking model
- naming uses English kebab-case

## Frontmatter template

```yaml
---
title: Some Thinking Model
tags: [thinking-model, decision]
created: YYYY-MM-DD
source: <link>
type: summary
lifecycle: reference
review_cycle: yearly
related:
  - ./first-principles.md
  - ./flywheel-effect.md
  - ./inversion.md
  - ../README.md
  - ../INDEX.md
---
```

## Recommended structure

1. Model definition
2. applicable scenarios
3. usage steps
4. anti-patterns
5. case studies
6. combination with other models

## Included

- `first-principles-summary.md` — first principles thinking
- `inversion-summary.md` — inversion thinking (Inversion)
- `second-order-thinking-summary.md` — second-order thinking (Second-Order Thinking)
- `strong-opinions-loosely-held-summary.md` — Strong Opinions, Loosely Held
- `ockhams-razor-summary.md` — Occam's razor
- `flywheel-effect-summary.md` — flywheel effect
- `opportunity-cost.md` — opportunity cost: build vs. buy analysis, attention as resource, calculation steps
- `sunk-cost-fallacy.md` — sunk cost fallacy: organizational amplifiers, kill criteria, 0-based reset
- `systems-thinking.md` — systems thinking: feedback loops, Meadows' leverage points, archetypes, stocks and flows
- `marginal-utility.md` — marginal utility: 80/20 rule, optimal stopping point, team scaling, performance optimization
- `compound-interest.md` — compound interest: 1% rule, positive/negative compounders, Rule of 72, knowledge sharing

## Related leaves

- [../../../product-manager/frameworks](../../../product-manager/frameworks) — PM frameworks (applied thinking models)
- [../../../ai-engineer/methodology](../../../ai-engineer/methodology) — AI methodology
- [../../../executive/strategy](../../../executive/strategy) — strategic decisions
- [../../people/experts--](../../people/experts--) — academic authorities
