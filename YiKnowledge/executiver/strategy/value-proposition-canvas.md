---
title: Value Proposition Canvas
aliases: [vpc, value-prop, customer-value]
tags: [strategy, canvas, customer, product-market-fit]
category: executiver/strategy
created: 2026-08-18
updated: 2026-08-18
last_verified: 2026-08-18
source: internal
type: summary
lifecycle: reference
status: stable
review_cycle: quarterly
roles: [producter, executiver]
benefit: "Map customer jobs, pains, and gains to product features, pain relievers, and gain creators to achieve product-market fit"
related:
  - ./business-model-canvas.md
  - ./blue-ocean.md
  - ./product-strategy-framework.md
  - ../../producter/discovery/ux/README.md
  - ../README.md
  - ../INDEX.md
---

# Value Proposition Canvas

> **As a** producter, **I want to** map what customers are trying to achieve against what our product offers, **so that** I can validate product-market fit and prioritize features that create real value.

## Definition

The Value Proposition Canvas (VPC) has two sides:

```
┌──────────────────────────────┬──────────────────────────────┐
│       CUSTOMER PROFILE       │       VALUE PROPOSITION      │
│                              │                              │
│          Gains               │       Gain Creators          │
│            ▲                 │            ▲                 │
│            │                 │            │                 │
│    Customer Jobs  ◄────Fit────►  Products & Services        │
│            │                 │            │                 │
│            ▼                 │            ▼                 │
│          Pains               │       Pain Relievers         │
│                              │                              │
└──────────────────────────────┴──────────────────────────────┘
```

- **Customer Jobs**: What the customer is trying to get done (functional, social, emotional)
- **Pains**: Bad outcomes, risks, and obstacles related to customer jobs
- **Gains**: Outcomes and benefits customers want (required, expected, desired, unexpected)
- **Products & Services**: What you offer
- **Pain Relievers**: How your product alleviates specific customer pains
- **Gain Creators**: How your product creates specific customer gains

**Fit** happens when your pain relievers address real pains and gain creators deliver real gains.

## Applicable scenarios

- Defining a new product or feature
- Explaining why a feature that "should" work isn't getting adoption
- Prioritizing between competing feature requests
- Competitive positioning: where does your value proposition differ?
- Quarterly review: has customer value changed?

## Design steps

### Step 1: Fill the Customer Profile

Start with the customer, not the product. Use customer interviews, usage data, and support tickets.

#### Customer Jobs
Ask: "What is the customer trying to accomplish?"

| Job type | Example |
|---|---|
| **Functional** | "Send a monthly report to my manager" |
| **Social** | "Look competent in front of my team" |
| **Emotional** | "Feel confident the data is correct" |

#### Pains
Ask: "What annoys, frustrates, or worries the customer?"

| Pain type | Example |
|---|---|
| **Undesired outcomes** | "Report takes 2 hours to compile" |
| **Obstacles** | "Data is spread across 3 systems" |
| **Risks** | "Afraid of sending wrong numbers to the board" |

#### Gains
Ask: "What would make the customer happy or delighted?"

| Gain type | Example |
|---|---|
| **Required** | "Report must be accurate" |
| **Expected** | "Report should be easy to read" |
| **Desired** | "Report should auto-generate" |
| **Unexpected** | "Report should suggest actions based on trends" |

### Step 2: Fill the Value Proposition

Map your product against the customer profile.

#### Products & Services
List everything your product provides — not just features, but also services, integrations, support, documentation.

#### Pain Relievers
For each pain in the customer profile, describe how your product reduces or eliminates it. Be specific:
- ❌ "Saves time" → ✅ "Reduces report compilation from 2 hours to 5 minutes"

#### Gain Creators
For each gain in the customer profile, describe how your product enables or enhances it.

### Step 3: Assess fit

Rate each pain reliever and gain creator:

| Rating | Meaning |
|---|---|
| ✅ **Strong fit** | Directly addresses a top-priority pain/gain with measurable impact |
| 🔶 **Moderate fit** | Addresses a pain/gain but impact is unclear or secondary |
| ❌ **No fit** | Doesn't map to any customer pain or gain |

If you have products/services with no fit, they're candidates for removal.
If you have customer pains/gains with no coverage, they're opportunities.

### Step 4: Prioritize

Order by:
1. Pains that are **extreme** and **frequent**
2. Gains that are **essential** and **currently underserved**
3. Anything else

## Key outputs

- Completed Customer Profile (jobs, pains, gains — prioritized)
- Completed Value Proposition (products/services, pain relievers, gain creators)
- Fit assessment with strong/moderate/no fit ratings
- Gap analysis: uncovered pains/gains → feature opportunities
- Over-engineering analysis: products/services with no fit → candidates for removal

## Anti-patterns

| Anti-pattern | Why it fails | Fix |
|---|---|---|
| Starting with the product side | You'll retrofit customer needs to your existing features | Always fill the customer profile first |
| Vague pain relievers | "Better UX" is not a pain reliever | Be specific: "Reduce the 5-click workflow to 1 click" |
| Ignoring emotional/social jobs | B2B products have emotional buyers too | Interview for emotional context: "What keeps you up at night?" |
| Asking customers what they want | Customers describe problems, not solutions | Probe for jobs, pains, and gains; design the solution yourself |
| One-size-fits-all customer profile | Different segments have different jobs | Create a separate profile for each distinct customer segment |

## This product's landing instance

*To be filled in with the current VPC for your product. Include the customer segment, key jobs/pains/gains, and the fit assessment. Note the date and the source of customer insights (interviews, analytics, support tickets).*