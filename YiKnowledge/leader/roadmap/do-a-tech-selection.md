---
title: Do a Tech Selection
aliases: [tech-selection, technology-choice, tool-selection]
tags: [roadmap, technology, selection, decision, leader]
category: leader/roadmap
created: 2026-08-18
updated: 2026-08-18
last_verified: 2026-08-18
source: internal
type: summary
lifecycle: reference
status: stable
review_cycle: quarterly
roles: [leader]
benefit: "Evaluate and select technologies systematically using weighted criteria, PoC validation, and decision documentation"
related:
  - ./do-a-proof-of-concept.md
  - ./plan-tech-roadmap.md
  - ../架构/README.md
  - ../decisions/README.md
  - ../README.md
  - ../INDEX.md
---

# Do a Tech Selection

> **As a** tech lead, **I want to** evaluate and select technologies systematically, **so that** we choose the right tool for the job with documented rationale and stakeholder alignment.

## Definition

Tech selection is a structured process for evaluating technology options against defined criteria, validating the top candidate(s) through PoCs, and documenting the decision as an ADR.

## Trigger condition

- Starting a new project or service that needs a technology choice
- Current technology is reaching end-of-life or has untenable limitations
- Team proposes adopting a new tool, framework, or service
- Major version upgrade that requires significant migration (treat as a new selection)
- Build-vs-buy decision for a component

## Step-by-step walkthrough

### Step 1: Define the problem, not the solution

Start with the problem statement, not the technology. Bad: "Should we use PostgreSQL or MongoDB?" Good: "We need a data store that supports complex queries on semi-structured event data with <100ms p95 read latency at 10K writes/second."

| Attribute | Description |
|---|---|
| **Problem statement** | What problem are we solving? |
| **Must-have requirements** | Non-negotiable capabilities (3–5) |
| **Nice-to-have requirements** | Desirable but not mandatory (3–5) |
| **Constraints** | Budget, team expertise, compliance, hosting requirements |
| **Scale** | Expected volume, throughput, data size (now and 12 months out) |

### Step 2: Identify options

Generate a list of 3–5 candidates:

| Source | How to find options |
|---|---|
| **Team knowledge** | What has the team used before? |
| **Industry standard** | What do similar companies use? |
| **Community** | What's actively maintained and well-documented? |
| **Innovation** | Is there a new approach worth evaluating? |

Include at least one "do nothing / improve existing" option as a baseline.

### Step 3: Evaluate against weighted criteria

| Criterion | Weight | Option A | Option B | Option C |
|---|---|---|---|---|
| Functional fit | 25% | 4 | 3 | 4 |
| Team expertise | 20% | 3 | 4 | 2 |
| Community & ecosystem | 15% | 4 | 3 | 3 |
| Performance & scalability | 15% | 3 | 4 | 4 |
| Operational complexity | 10% | 3 | 3 | 2 |
| Cost | 10% | 4 | 3 | 2 |
| Compliance & security | 5% | 4 | 4 | 4 |
| **Weighted score** | **100%** | **3.55** | **3.40** | **2.95** |

Score each option 1–5 on each criterion. Multiply by weight. Sum for the weighted score.

### Step 4: Run a PoC on the top candidate(s)

If the top 2 options are close (within 0.2 points), run a PoC on both. Use [do-a-proof-of-concept.md](./do-a-proof-of-concept.md).

PoC must answer:
- Does it actually meet the must-have requirements?
- What's the developer experience like?
- Are there any hidden limitations or surprises?
- What's the operational burden?

### Step 5: Make the decision and document it

If the PoC validates the top candidate, write an ADR in [../decisions/](../decisions/):

```markdown
# ADR-XXX: Use [Technology] for [Purpose]

## Context
[Problem statement and constraints]

## Decision
We will use [Technology] for [Purpose].

## Alternatives considered
- [Option B]: Rejected because [reason]
- [Option C]: Rejected because [reason]

## Consequences
- Positive: [benefits]
- Negative: [risks and mitigations]
- Operational: [what changes]
```

## Decision points and branching

| Decision point | Options | Guidance |
|---|---|---|
| All options score poorly | Relax constraints / Build in-house / Reconsider problem | First check if the problem is well-defined; maybe no good solution exists |
| Top 2 options are tied | PoC both / Choose based on team preference | Team expertise is a valid tiebreaker; happy teams build better software |
| Best option is unfamiliar to the team | Invest in learning / Choose second-best that team knows | If the gap is large, invest in learning; if small, go with what you know |
| Build vs. buy | Build if core differentiator; buy if commodity | Never build what isn't your core business unless no good option exists |

## Key deliverables at each stage

| Stage | Deliverable |
|---|---|
| Problem definition | Requirements document with must-haves and constraints |
| Options | Candidate list with brief descriptions |
| Evaluation | Weighted scoring matrix |
| Validation | PoC results and recommendation |
| Decision | ADR in the decisions directory |

## Anti-patterns and common pitfalls

| Anti-pattern | Why it fails | Fix |
|---|---|---|
| Resume-driven selection | Choosing technology to pad resumes, not solve problems | Criteria must be weighted; "team wants to learn it" is not a valid primary criterion |
| Analysis paralysis | Evaluating 10 options for 3 months | Limit to 3–5 options; timebox the evaluation to 2 weeks |
| Defaulting to the familiar | Always choosing PostgreSQL because "we know it" | At least 2 options must be evaluated, including the default |
| Ignoring operational cost | Choosing a great technology nobody can operate | Operational complexity and team expertise must be weighted criteria |
| No PoC for high-impact decisions | Surprises discovered in production | PoC is mandatory if the decision affects architecture, performance, or cost significantly |

## This product's landing instance

*To be filled in with the most recent tech selection. Include a link to the ADR, the problem statement, the options evaluated, and the final decision.*