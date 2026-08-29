---
title: Tech Selection Evaluation Template
aliases: [tech-selection-template, technology-evaluation-template]
tags: [template, tech-selection, evaluation, decision, leader]
category: curator/templates
created: 2026-08-24
updated: 2026-08-24
source: internal
type: template
status: stable
lifecycle: active
review_cycle: quarterly
roles: [leader, engineer]
benefit: "Leaders produce consistent, comparable technology evaluations that make tradeoffs visible"
acceptance_criteria:
  - "5 sections: Context, Candidates, Evaluation Matrix, Recommendation, Risk Assessment"
  - "evaluation criteria are weighted and scored"
  - "includes PoC results if applicable"
related:
  - ./README.md
  - ./adr.md
  - ./knowledge-leaf.md
  - ../../leader/roadmap/do-a-tech-selection.md
---

# Tech Selection Evaluation Template

> **When to use:** When choosing between multiple technologies (libraries, frameworks, databases, services). The output feeds into an ADR for the final decision.

## 1. Context

### Problem

{{What problem are we solving? What are the constraints (team skills, budget, timeline, existing stack)?}}

### Must-have Requirements

- {{Requirement 1}}
- {{Requirement 2}}
- {{Requirement 3}}

### Nice-to-have Requirements

- {{Requirement 1}}
- {{Requirement 2}}

## 2. Candidates

| Candidate | Version | License | Maturity | Description |
|---|---|---|---|---|
| {{Name}} | {{version}} | {{license}} | {{GA/Beta/Alpha}} | {{One-line summary}} |
| {{Name}} | {{version}} | {{license}} | {{GA/Beta/Alpha}} | {{One-line summary}} |
| {{Name}} | {{version}} | {{license}} | {{GA/Beta/Alpha}} | {{One-line summary}} |

## 3. Evaluation Matrix

> Rate each candidate 1-5 on each criterion. Weight by importance.

| Criterion | Weight | {{Candidate A}} | {{Candidate B}} | {{Candidate C}} |
|---|---|---|---|---|
| {{Criterion (e.g., performance)}} | {{0.x}} | {{1-5}} | {{1-5}} | {{1-5}} |
| {{Criterion (e.g., DX)}} | {{0.x}} | {{1-5}} | {{1-5}} | {{1-5}} |
| {{Criterion (e.g., community)}} | {{0.x}} | {{1-5}} | {{1-5}} | {{1-5}} |
| {{Criterion (e.g., cost)}} | {{0.x}} | {{1-5}} | {{1-5}} | {{1-5}} |
| **Weighted total** | **1.0** | **{{score}}** | **{{score}}** | **{{score}}** |

### Evaluation Criteria Guide

| Criterion | What to look for |
|---|---|
| Functional fit | Does it solve the problem? Feature completeness vs. our must-haves |
| Performance | Benchmarks, latency, throughput under expected load |
| Developer experience | Docs quality, API design, debugging tools, local dev setup |
| Community & ecosystem | GitHub stars, contributors, Stack Overflow activity, plugin ecosystem |
| Operational cost | Licensing, hosting, maintenance, learning curve |
| Team familiarity | Does the team already know this? What's the ramp-up time? |
| Security | CVE history, dependency count, maintainer responsiveness |

## 4. Proof of Concept Results

> If you ran a PoC, summarize the findings.

| Candidate | PoC outcome | Surprises | Verdict |
|---|---|---|---|
| {{Candidate A}} | {{What worked, what didn't}} | {{Unexpected findings}} | {{Viable / Not viable}} |

## 5. Recommendation

**Recommended:** {{candidate name}}

**Rationale:** {{2-3 sentences on why this is the best choice given the evaluation and context.}}

**Next step:** Write an ADR to formalize this decision.

## Anti-patterns

| Anti-pattern | Why it fails | What to do instead |
|---|---|---|
| Evaluation without weights | Criteria aren't equally important; unweighted scores are misleading | Weight each criterion by importance to the project |
| Resume-driven evaluation (picking the trendiest tech) | Team can't maintain it; overkill for the problem | Match technology to the problem, not your resume |
| No PoC for critical choices | Specs look good on paper but fail in practice | PoC the top 2 candidates for any decision with >6 months of lock-in |
| Ignoring team familiarity | Team spends 3 months learning instead of building | Weight team skills honestly; factor ramp-up time into the timeline |