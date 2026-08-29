---
title: Porter's Five Forces
aliases: [p5f, porter-five-forces, industry-analysis]
tags: [strategy, analysis, industry, competition]
category: executiver/strategy
created: 2026-08-18
updated: 2026-08-18
last_verified: 2026-08-18
source: internal
type: summary
lifecycle: reference
status: stable
review_cycle: quarterly
roles: [executiver]
benefit: "Analyze industry structure to determine overall attractiveness and identify the most significant competitive pressures"
related:
  - ./swot-analysis.md
  - ./blue-ocean.md
  - ./product-strategy-framework.md
  - ../industry/competitors/README.md
  - ../README.md
  - ../INDEX.md
---

# Porter's Five Forces

> **As an** executiver, **I want to** understand the structural forces shaping my industry, **so that** I can position the company where forces are weakest and margins are highest.

## Definition

Porter's Five Forces is an industry structure analysis framework. It assesses five competitive forces that determine industry profitability:

```
                    Threat of
                    New Entry
                        │
                        ▼
    Supplier ──────► Rivalry ◄────── Buyer
      Power           Among         Power
                    Competitors
                        │
                        ▼
                    Threat of
                    Substitutes
```

Each force is rated from **Low** (favorable) to **High** (unfavorable). The overall industry attractiveness is the net effect of all five forces.

## Applicable scenarios

- Entering a new market or industry segment
- Evaluating whether to stay in or exit a declining segment
- Understanding why margins are under pressure
- M&A target screening: is this an attractive industry?
- Annual strategy refresh: has the industry structure changed?

## Design steps

### Step 1: Define the industry boundary

Be specific. "AI" is too broad. "Conversational AI platforms for enterprise customer support in Southeast Asia" is actionable.

### Step 2: Assess each force (Low / Medium / High)

#### 1. Threat of New Entry (higher = worse for incumbents)

| Factor | Low threat if... | High threat if... |
|---|---|---|
| Economies of scale | Large scale needed to compete | Small players can be profitable |
| Capital requirements | High upfront investment | Low startup costs |
| Switching costs | Customers locked in | Easy for customers to switch |
| Distribution access | Channels controlled by incumbents | Open platforms, self-serve |
| Regulation | Licenses, patents, compliance barriers | Light regulation |

#### 2. Supplier Power (higher = worse for you)

| Factor | Low power if... | High power if... |
|---|---|---|
| Supplier concentration | Many suppliers, commoditized | Few suppliers, differentiated |
| Switching cost | Easy to change suppliers | Hard/expensive to switch |
| Forward integration threat | Suppliers can't do what you do | Suppliers could become competitors |
| Your importance | You're a major customer | You're a small customer |

#### 3. Buyer Power (higher = worse for you)

| Factor | Low power if... | High power if... |
|---|---|---|
| Buyer concentration | Many small customers | Few large customers |
| Switching cost | High for customers to leave | Customers can easily switch |
| Price sensitivity | Your product is mission-critical | Your product is nice-to-have |
| Backward integration | Buyers can't make it themselves | Buyers could build their own |

#### 4. Threat of Substitutes (higher = worse for you)

Substitutes are **different products** that solve the same need — not direct competitors. For example, email is a substitute for Slack, not Teams.

| Factor | Low threat if... | High threat if... |
|---|---|---|
| Price-performance | Your solution is clearly better value | Substitute offers better value |
| Switching cost | High cost to switch to substitute | Low/none |
| Buyer willingness | Customers aren't looking for alternatives | Customers actively seeking alternatives |

#### 5. Rivalry Among Competitors (higher = worse for everyone)

| Factor | Low rivalry if... | High rivalry if... |
|---|---|---|
| Number of competitors | Few, stable | Many, or one aggressive disruptor |
| Industry growth | Fast-growing | Slow or declining |
| Exit barriers | Easy to exit | High fixed costs, specialized assets |
| Differentiation | Products are differentiated | Products are commoditized |

### Step 3: Synthesize

Rate each force Low / Medium / High and summarize:

```
Force                    Rating    Key driver
─────────────────────────────────────────────
Threat of New Entry       Low      High capital requirements + regulation
Supplier Power           Medium    Cloud providers have some leverage
Buyer Power               High     Top 3 customers = 60% of revenue
Threat of Substitutes     Low      No viable alternative to the problem
Rivalry                  Medium    Growing market, 4 major players
─────────────────────────────────────────────
Overall attractiveness:  Medium    Buyer power is the primary concern
```

### Step 4: Define strategic response

For each force rated High or Medium-High, define a specific action:

| Force | Action |
|---|---|
| Buyer power is high | Diversify customer base; increase switching costs through integration |
| Supplier power is high | Multi-source; build in-house alternatives; backward integrate |
| Rivalry is high | Differentiate on dimensions competitors can't easily copy |

## Key outputs

- Force-by-force assessment with evidence and ratings
- Overall industry attractiveness rating
- Strategic response plan for the 1–2 strongest forces
- Monitoring plan for forces that could change

## Anti-patterns

| Anti-pattern | Why it fails | Fix |
|---|---|---|
| Overly broad industry definition | Forces vary wildly across segments | Narrow to a specific segment you compete in |
| Static snapshot | Industry structure changes | Re-assess annually; monitor for triggers |
| Ignoring complements | Platforms and ecosystems change dynamics | Consider complementors as a 6th force if relevant |
| Ratings without evidence | "Medium" is a guess, not analysis | Every rating needs a specific fact or data point |
| P5F as the only analysis | Industry structure ≠ strategy | Combine with [VRIO](./vrio-framework.md) and [Blue Ocean](./blue-ocean.md) |

## This product's landing instance

*To be filled in with the most recent P5F analysis. Define the industry boundary, show the force ratings with key drivers, and note the date of assessment.*