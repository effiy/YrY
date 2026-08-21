---
title: Kano Model
tags: [framework, kano, prioritization, producter]
category: producter/frameworks
created: 2026-08-21
updated: 2026-08-21
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [producter]
benefit: "PMs use Kano to classify features by how they impact satisfaction, avoiding the trap of building features nobody cares about"
related:
  - ./README.md
  - ./rice-ice-prioritization.md
  - ./jobs-to-be-done-summary.md
---

# Kano Model

> **Kano classifies features into 5 categories based on how they affect customer satisfaction.** Not all features are equal — some delight, some are expected, and some users don't care about.

## The 5 categories

```
Satisfaction ↑
             │  ╱ Attractive (Delighters)
             │ ╱
             │╱
  ───────────┼───────────→ Functionality (how well implemented)
            ╱│
           ╱ │
          ╱  │ Must-Be (Basic expectations)
             │
             │  Indifferent
             │  Reverse (makes it worse)
```

| Category | Description | Satisfaction impact | Example |
|----------|------------|-------------------|---------|
| **Must-Be** | Basic expectations — users expect these and are unhappy if they're missing | No satisfaction gain if present; dissatisfaction if absent | BRD output is accurate |
| **Performance** | More is better — satisfaction scales linearly with implementation quality | Proportional to how well it's done | BRD generation speed |
| **Attractive** | Delighters — users don't expect these but love them when present | High satisfaction gain if present; no dissatisfaction if absent | BRD automatically cites source documents |
| **Indifferent** | Users don't care either way | No impact | Changing the BRD font |
| **Reverse** | Some users hate it, some love it | Divided | Forcing all BRDs into a specific template |

## Kano survey method

Ask two questions per feature:

1. **Functional**: "How would you feel if this feature WAS present?"
2. **Dysfunctional**: "How would you feel if this feature WAS NOT present?"

Answers: Like / Expect / Neutral / Tolerate / Dislike

### Evaluation matrix

| Functional ↓ / Dysfunctional → | Like | Expect | Neutral | Tolerate | Dislike |
|---|---|---|---|---|---|
| **Like** | Q | A | A | A | P |
| **Expect** | R | I | I | I | M |
| **Neutral** | R | I | I | I | M |
| **Tolerate** | R | I | I | I | M |
| **Dislike** | R | R | R | R | Q |

> A=Attractive, P=Performance, M=Must-Be, I=Indifferent, R=Reverse, Q=Questionable

## Kano over time

Categories degrade predictably:

```
Attractive → Performance → Must-Be
```

A feature that delights today (Attractive) becomes a competitive differentiator tomorrow (Performance) and a basic expectation next year (Must-Be). Auto-save in Google Docs was a delighter in 2010 — it's a basic expectation now.

## When to use

- **Feature discovery**: After generating ideas, classify them with Kano to find the delighters
- **MVP scoping**: Ship all Must-Be + top Performance features. One Attractive feature is worth ten Indifferent ones.
- **Competitive analysis**: Map competitor features on Kano categories to find undefended Attractive opportunities

## Anti-patterns

- **Building only Must-Be features.** You'll never lose customers but you'll never win them either. Must-Be is the price of entry, not a strategy.
- **Assuming you know what's Attractive.** Delighters are surprising by definition. Survey users — don't guess.
- **Over-investing in Indifferent features.** "Users asked for this" doesn't mean they'll be happier when it ships. Use the Kano survey to distinguish real demand from polite requests.