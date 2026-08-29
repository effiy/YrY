---
title: Product Strategy Framework
aliases: [psf, strategy-synthesis, meta-framework]
tags: [strategy, meta-framework, synthesis]
category: executiver/strategy
created: 2026-08-18
updated: 2026-08-18
last_verified: 2026-08-18
source: internal
type: summary
lifecycle: reference
status: stable
review_cycle: quarterly
roles: [executiver, producter, leader]
benefit: "Synthesize multiple strategy framework outputs into a single coherent product strategy document"
related:
  - ./swot-analysis.md
  - ./vrio-framework.md
  - ./porter-five-forces.md
  - ./blue-ocean.md
  - ./value-proposition-canvas.md
  - ./business-model-canvas.md
  - ./second-curve.md
  - ./now-next-later-roadmap.md
  - ../README.md
  - ../INDEX.md
---

# Product Strategy Framework

> **As a** product strategist, **I want to** synthesize outputs from multiple analysis frameworks into a single coherent strategy, **so that** the organization has a unified direction with clear choices, trade-offs, and an execution plan.

## Definition

The Product Strategy Framework (PSF) is a **meta-framework** — it doesn't analyze anything itself. Instead, it provides the structure for combining outputs from SWOT, VRIO, Porter's Five Forces, Blue Ocean, Value Proposition Canvas, and Business Model Canvas into one coherent strategy document.

Think of individual frameworks as diagnostic tools and PSF as the treatment plan.

## Applicable scenarios

- You've run 2+ analysis frameworks and need to reconcile their findings
- Annual strategy refresh cycle
- Board/investor strategy presentation prep
- Post-acquisition or post-pivot strategy definition
- Aligning product, engineering, and business teams around one direction

## Design steps

### Phase 1: Gather inputs

Collect the outputs from each framework you've applied. At minimum you need:

| Input | Source | What to extract |
|---|---|---|
| Situation audit | [SWOT](./swot-analysis.md) | Top 3 strengths, weaknesses, opportunities, threats |
| Resource advantage | [VRIO](./vrio-framework.md) | Resources with sustained competitive advantage |
| Industry structure | [Porter's Five Forces](./porter-five-forces.md) | Overall attractiveness rating + key force |
| Market opportunity | [Blue Ocean](./blue-ocean.md) | Strategy canvas + ERRC actions |
| Customer value | [Value Proposition Canvas](./value-proposition-canvas.md) | Top customer jobs + product fit assessment |
| Business model | [Business Model Canvas](./business-model-canvas.md) | Key assumptions and validation status |
| Portfolio timing | [Second Curve](./second-curve.md) | Current curve position + transition timing |

### Phase 2: Identify patterns

Look across all inputs for:

- **Convergence**: Where do multiple frameworks point to the same conclusion? (High confidence)
- **Divergence**: Where do frameworks disagree? (Needs investigation)
- **Gaps**: What important question isn't answered by any framework? (Needs a new framework or primary research)
- **Constraints**: What compliance or resource limits bound the strategy?

### Phase 3: Make strategic choices

A strategy is defined by what you choose **not** to do. For each major decision area:

1. List the options considered
2. State the chosen path and why
3. Explicitly state what was rejected and why
4. Link back to the framework evidence that supports the choice

### Phase 4: Write the strategy document

Use the [strategy document template](../README.md#strategy-document-template) as your outline. Each section should reference the specific framework that produced the insight.

### Phase 5: Socialize and align

1. Share the draft with framework owners (see [roles](../README.md#roles--who-uses-what))
2. Run a strategy review session: present choices, not frameworks
3. Capture disagreements as risks in the assumptions log
4. Publish the final version with a review date

## Key outputs

- **Strategy document** (5–10 pages): The synthesis of all frameworks into one narrative
- **One-pager summary**: Executive summary for stakeholders who won't read the full document
- **Assumptions log**: Key bets and triggers for re-evaluation
- **Communication deck**: 5–10 slides for company-wide alignment

## Anti-patterns

| Anti-pattern | Why it fails | Fix |
|---|---|---|
| Framework dump as strategy | Listing SWOT items ≠ strategy | Synthesize into choices; every framework output must map to a decision |
| Consensus-by-committee | Averaging conflicting views produces bland strategy | Present evidence, make the call, document dissenting views as risks |
| Skipping the "what we won't do" | Without explicit rejections, teams will pursue everything | Every strategic choice must have an explicit rejection |
| Strategy as static document | Published once, never revisited | Set a review date in the document; follow the [cadence](../README.md#strategy-cadence) |
| Over-polishing before sharing | Perfectionism delays alignment | Share at 80% done; iterate based on feedback |

## This product's landing instance

*To be filled in with the current strategy instance for your product. Link to the latest strategy document, note the date it was last updated, and list which frameworks were used as inputs.*