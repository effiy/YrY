---
title: Business Model Canvas
aliases: [bmc, business-model]
tags: [strategy, canvas, business-model, validation]
category: executiver/strategy
created: 2026-08-18
updated: 2026-08-18
last_verified: 2026-08-18
source: internal
type: summary
lifecycle: reference
status: stable
review_cycle: quarterly
roles: [executiver, producter]
benefit: "Design, describe, and pivot business models using 9 building blocks that cover the full logic of how a company creates, delivers, and captures value"
related:
  - ./value-proposition-canvas.md
  - ./blue-ocean.md
  - ./second-curve.md
  - ./product-strategy-framework.md
  - ../README.md
  - ../INDEX.md
---

# Business Model Canvas

> **As a** strategist, **I want to** map how the business creates, delivers, and captures value, **so that** I can identify gaps, validate assumptions, and design business model improvements.

## Definition

The Business Model Canvas (BMC) is a visual framework with 9 building blocks:

```
┌──────────────────┬──────────────────┬──────────────────────┐
│  KEY PARTNERS    │  KEY ACTIVITIES   │  VALUE PROPOSITION   │
│                  │                  │                      │
│  Who helps us?   │  What do we do?  │  What value do we    │
│                  │                  │  deliver?            │
│                  ├──────────────────┤                      │
│                  │  KEY RESOURCES   │                      │
│                  │                  │                      │
│                  │  What assets do  │                      │
│                  │  we need?        │                      │
├──────────────────┴──────────────────┼──────────────────────┤
│       COST STRUCTURE                │    REVENUE STREAMS    │
│                                     │                      │
│  What are the major costs?          │  How do we make money?│
└──────────────────┬──────────────────┴──────────────────────┘
                   │
┌──────────────────┼──────────────────┐
│CUSTOMER RELATIONS│ CUSTOMER SEGMENTS│
│                  │                  │
│  How do we       │  Who are our     │
│  interact?       │  customers?      │
├──────────────────┼──────────────────┤
│    CHANNELS      │                  │
│                  │                  │
│  How do we       │                  │
│  reach them?     │                  │
└──────────────────┴──────────────────┘
```

## Applicable scenarios

- Designing a new business or product line
- Evaluating a business model pivot
- Understanding why a seemingly good product isn't commercially viable
- Aligning cross-functional teams on how the business works
- Investor pitch preparation: can you explain the business in one page?

## Design steps

### Step 1: Start with Customer Segments and Value Proposition

These are the core of the canvas. Use [Value Proposition Canvas](./value-proposition-canvas.md) to validate these two blocks before filling the rest.

**Customer Segments** — Who are you creating value for?
- Mass market, niche, segmented, diversified, multi-sided platform?
- List specific segments, not "everyone"

**Value Proposition** — What problem do you solve?
- Newness, performance, customization, design, price, brand, convenience?
- Be specific about the value delivered to each segment

### Step 2: Fill the customer-facing blocks

**Channels** — How do you reach each segment?
- Awareness → Evaluation → Purchase → Delivery → After-sales
- Owned vs. partner channels; direct vs. indirect

**Customer Relationships** — What type of relationship does each segment expect?
- Personal assistance, self-service, automated, communities, co-creation?
- Acquisition vs. retention vs. upsell focus

**Revenue Streams** — How does each segment pay?
- Asset sale, subscription, licensing, usage fee, advertising, freemium?
- One-time vs. recurring; fixed vs. dynamic pricing

### Step 3: Fill the infrastructure blocks

**Key Resources** — What assets are required?
- Physical, intellectual, human, financial?
- Cross-reference with [VRIO](./vrio-framework.md) to identify which resources are strategic

**Key Activities** — What must you do exceptionally well?
- Production, problem-solving, 平台/network management?
- These are the activities that make the business model work

**Key Partnerships** — Who do you rely on?
- Strategic alliances, coopetition, joint ventures, supplier relationships?
- Why partner? Optimization, risk reduction, resource acquisition?

### Step 4: Fill the financial blocks

**Cost Structure** — What drives costs?
- Cost-driven vs. value-driven?
- Fixed costs, variable costs, economies of scale/scope?

### Step 5: Validate assumptions

Every block is a hypothesis until validated. For each block, ask:

| Block | Validation question |
|---|---|
| Customer Segments | Have we talked to 10+ customers in this segment? |
| Value Proposition | Can customers articulate the value without prompting? |
| Channels | What's the CAC through each channel? |
| Revenue Streams | What's the willingness-to-pay evidence? |
| Key Resources | Are these resources actually VRIO? |
| Key Activities | Do we do these better than competitors? |
| Key Partnerships | What's the fallback if a partner fails? |
| Cost Structure | What's the unit economics at scale? |

### Step 6: Assess the business model

| Assessment | Question |
|---|---|
| **Coherence** | Do the blocks reinforce each other? (e.g., self-service channels + automated customer relationships + low cost structure) |
| **Differentiation** | Is the model different from competitors, or just better execution? |
| **Scalability** | Does the model improve with scale, or degrade? |
| **Defensibility** | What prevents competitors from copying this model? |

## Key outputs

- Filled 9-block canvas
- Assumption register with validation status per block
- Coherence/differentiation/scalability/defensibility assessment
- List of riskiest assumptions to test next

## Anti-patterns

| Anti-pattern | Why it fails | Fix |
|---|---|---|
| Filling the canvas in one sitting | Every block is a guess, not a hypothesis | Treat as a living document; fill over multiple sessions with evidence |
| "Everyone" as customer segment | Undifferentiated value proposition | Segment by distinct jobs, pains, or willingness to pay |
| Revenue without cost realism | Optimistic revenue, underestimated costs | Model unit economics bottom-up; stress-test assumptions |
| Ignoring the fit between blocks | Incoherent model (e.g., premium value prop + discount channel) | Check for internal consistency: every choice in one block affects others |
| BMC as strategy | The canvas describes a model, not a strategy | Use [product-strategy-framework.md](./product-strategy-framework.md) to synthesize BMC with other analyses |

## This product's landing instance

*To be filled in with the current BMC for your product. Include the date, the key assumptions being tested, and the validation status of the riskiest blocks.*