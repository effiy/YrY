---
title: RICE/ICE Prioritization Framework
tags: [framework, prioritization, rice, ice, producter]
category: producter/frameworks
created: 2026-08-21
updated: 2026-08-21
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [producter]
benefit: "PMs apply RICE and ICE prioritization to rank features objectively, avoiding HiPPO-driven (Highest Paid Person's Opinion) prioritization"
acceptance_criteria:
  - "RICE framework explained with formula and example"
  - "ICE framework explained with formula and example"
  - "When to use RICE vs ICE"
  - "Anti-patterns identified"
related:
  - ./README.md
  - ../discovery/prd/prd-template.md
  - ../../INDEX.md
---

# RICE/ICE Prioritization

> **RICE and ICE are scoring frameworks for ranking features objectively.** RICE is for detailed prioritization with data. ICE is for quick, intuition-driven prioritization when data is scarce.

## RICE Framework

RICE scores features on 4 dimensions:

### Formula

```
RICE Score = (Reach × Impact × Confidence) / Effort
```

### Dimensions

| Dimension | Scale | Definition | Example |
|---|---|---|---|
| **Reach** | Number of users/events per quarter | How many people will this affect? | "500 after-sales engineers will use BRD generation per quarter" |
| **Impact** | 0.25 (minimal) → 3 (massive) | How much will this improve their experience? | 3 = transformative (4h → 15min), 1 = noticeable, 0.25 = minimal |
| **Confidence** | 20% (wild guess) → 100% (proven) | How sure are you about the reach, impact, and effort estimates? | 80% = we have user data, 50% = we have anecdotes, 20% = pure speculation |
| **Effort** | Person-months | How much work will this take? | "2 person-months" = 1 engineer for 2 months, or 2 engineers for 1 month |

### Example

| Feature | Reach | Impact | Confidence | Effort | RICE Score |
|---|---|---|---|---|---|
| BRD auto-generation | 500 | 3 | 80% | 2 | (500×3×0.8)/2 = **600** |
| Multi-language BRD | 200 | 2 | 50% | 1 | (200×2×0.5)/1 = **200** |
| BRD approval workflow | 100 | 1.5 | 60% | 3 | (100×1.5×0.6)/3 = **30** |

**Result**: Build BRD auto-generation first (600), then multi-language (200), then approval workflow (30).

## ICE Framework

ICE is a simplified version for quick scoring when you don't have detailed data:

### Formula

```
ICE Score = Impact × Confidence × Ease
```

### Dimensions

| Dimension | Scale | Definition |
|---|---|---|
| **Impact** | 1-10 | How much value will this create? |
| **Confidence** | 1-10 | How sure are you? |
| **Ease** | 1-10 | How easy is this to build? (10 = trivial, 1 = extremely hard) |

### Example (quick scoring, 30 seconds per feature)

| Feature | Impact | Confidence | Ease | ICE Score |
|---|---|---|---|---|
| BRD auto-generation | 9 | 7 | 4 | 9×7×4 = **252** |
| Multi-language BRD | 6 | 5 | 7 | 6×5×7 = **210** |
| BRD approval workflow | 5 | 6 | 3 | 5×6×3 = **90** |

## When to use RICE vs ICE

| Situation | Use | Reason |
|---|---|---|
| Quarterly roadmap planning | RICE | Need detailed, defensible scores |
| Sprint planning with multiple stakeholders | RICE | Scores must withstand scrutiny |
| Quick triage of incoming requests | ICE | Speed matters more than precision |
| Early-stage feature brainstorming | ICE | Not enough data for RICE |
| One-person product team | ICE | RICE overhead not justified |

## Anti-patterns

- **Scoring without data.** "Reach: 1000" with 20% confidence is just guessing. If confidence is low, invest in data before scoring.
- **Treating RICE scores as exact.** A score of 600 vs 590 is a tie. RICE is for relative ordering, not precise ranking. Group features into tiers (top, middle, bottom) rather than arguing about 10-point differences.
- **Scoring effort without consulting engineering.** PMs consistently underestimate effort. Always ask an engineer for the effort estimate.
- **Using RICE to justify a decision you've already made.** If you're scoring features to make a pre-decided feature win, you're not prioritizing — you're rationalizing. Score first, then decide.