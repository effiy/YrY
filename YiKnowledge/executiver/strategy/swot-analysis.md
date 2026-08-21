---
title: SWOT Analysis
aliases: [swot, situational-analysis]
tags: [strategy, analysis, audit]
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
benefit: "Quickly assess internal strengths/weaknesses and external opportunities/threats to establish a strategic baseline"
related:
  - ./vrio-framework.md
  - ./porter-five-forces.md
  - ./product-strategy-framework.md
  - ../README.md
  - ../INDEX.md
---

# SWOT Analysis

> **As a** strategist, **I want to** audit the internal and external situation of a product or business unit, **so that** I have a clear baseline before making strategic decisions.

## Definition

SWOT is a 2×2 situational analysis framework:

```
                 Helpful              Harmful
            ┌─────────────────┬─────────────────┐
  Internal  │  Strengths (S)  │ Weaknesses (W)  │
            ├─────────────────┼─────────────────┤
  External  │Opportunities (O)│  Threats (T)     │
            └─────────────────┴─────────────────┘
```

- **Strengths**: Internal capabilities that give advantage
- **Weaknesses**: Internal limitations that put you at a disadvantage
- **Opportunities**: External factors you can exploit
- **Threats**: External factors that could harm you

## Applicable scenarios

- Starting a new strategy cycle and need a baseline
- Quarterly business review prep
- Team alignment workshop — SWOT is the most accessible framework for cross-functional groups
- Pre-mortem before a major launch or investment decision
- Onboarding new executives to the product context

## Design steps

### Step 1: Gather data

- **Internal**: product metrics, team capabilities, tech debt inventory, customer feedback, revenue data
- **External**: competitor landscape from [industry/competitors](../industry/competitors), market reports from [industry/reports](../industry/reports), regulatory environment

### Step 2: Brainstorm (divergent)

Run a 45-minute workshop with cross-functional stakeholders. Rules:
- One idea per sticky note
- No debate during brainstorming — capture everything
- Aim for 10+ items per quadrant

### Step 3: Prioritize (convergent)

Score each item on two dimensions:
- **Impact** (1–5): How much does this affect our strategic position?
- **Certainty** (1–5): How confident are we in this assessment?

Keep only items scoring ≥ 3 on both dimensions.

### Step 4: Generate actions

For each quadrant, define the strategic response:

| Quadrant | Strategic question | Action type |
|---|---|---|
| S-O | How do we use strengths to capture opportunities? | **Attack** — invest here |
| W-O | How do we overcome weaknesses to capture opportunities? | **Build** — acquire or develop |
| S-T | How do we use strengths to neutralize threats? | **Defend** — monitor and mitigate |
| W-T | How do we minimize weaknesses to avoid threats? | **Avoid** — exit or partner |

### Step 5: Cross-reference

Validate SWOT findings against:
- [VRIO](./vrio-framework.md) — are your "strengths" actually sustainable advantages?
- [Porter's Five Forces](./porter-five-forces.md) — do your "threats" match industry forces?

## Key outputs

- 2×2 matrix with prioritized items (max 5 per quadrant after prioritization)
- S-O / W-O / S-T / W-T action table with owners and deadlines
- Cross-reference validation notes

## Anti-patterns

| Anti-pattern | Why it fails | Fix |
|---|---|---|
| Laundry list SWOT | 40 items with no prioritization | Score and cut to top 5 per quadrant |
| No external data | Internal assumptions masquerading as facts | Require evidence for every O and T item |
| SWOT as the final output | Analysis without action | Every item must map to a strategic initiative |
| Vague items | "Good technology" is not actionable | Be specific: "Real-time inference pipeline at <100ms p95" |
| Only executives in the room | Blind spots from limited perspective | Include ICs from engineering, sales, support |

## This product's landing instance

*To be filled in with the most recent SWOT analysis for your product. Include the date, participants, and a link to the detailed output.*