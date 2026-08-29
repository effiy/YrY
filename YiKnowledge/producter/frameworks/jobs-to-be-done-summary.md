---
title: Jobs-to-Be-Done (JTBD) Framework
tags: [framework, jtbd, producter, discovery]
category: producter/frameworks
created: 2026-08-21
updated: 2026-08-21
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [producter]
benefit: "PMs use JTBD to understand what users are really trying to accomplish, beyond surface-level feature requests"
related:
  - ./README.md
  - ./kano-model-summary.md
  - ../discovery/prd/prd-template.md
---

# Jobs-to-Be-Done (JTBD)

> **JTBD reframes product thinking from "what features do users want?" to "what job are users hiring this product to do?"**

## Core concept

People don't buy products — they "hire" them to get a job done. A job is the progress a person is trying to make in a particular circumstance.

### Job statement format

```
When [situation], I want to [motivation], so I can [expected outcome].
```

**Example**: "When I receive a new after-sales case, I want to quickly produce a BRD draft, so I can focus on reviewing content rather than formatting documents."

## The four forces of progress

```
                    ┌─────────────────┐
     PUSH ─────────→│                 │←───────── PULL
  (pain of current  │  SWITCH TO NEW  │  (attraction of
   solution)        │    SOLUTION     │   new solution)
                    └─────────────────┘
                            ↑
                            │
              ┌─────────────┴─────────────┐
              │                           │
         ANXIETY                      INERTIA
   (fear of new solution)      (habit of current solution)
```

| Force | Question |
|-------|----------|
| **Push** | What's wrong with how they do it today? |
| **Pull** | What makes the new solution compelling? |
| **Anxiety** | What worries them about switching? |
| **Inertia** | What keeps them using the current solution? |

## Functional vs emotional jobs

| Type | Question | Example |
|------|----------|---------|
| **Functional** | What task needs to be done? | "Generate a BRD draft" |
| **Emotional** | How does the user want to feel? | "Feel confident the BRD is complete and accurate" |
| **Social** | How does the user want to be perceived? | "Look professional to the BRD reviewer" |

## JTBD vs user stories

| JTBD | User Story |
|------|-----------|
| Technology-agnostic | Tied to a specific solution |
| "Produce a BRD draft" | "Click the Generate BRD button" |
| Stable over time | Changes as the product evolves |
| Discovers opportunities | Defines implementation |

## Anti-patterns

- **Confusing jobs with tasks.** "Click the generate button" is a task. "Produce a BRD draft" is a job. Jobs are solution-agnostic.
- **Only capturing functional jobs.** Emotional and social jobs are often the real drivers of adoption. "Feel confident" matters more than "save time."
- **Interviewing users about features.** JTBD interviews ask about the last time they did the job, not what features they want.