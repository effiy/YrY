---
title: Do a Proof of Concept
aliases: [poc, spike, proof-of-concept]
tags: [roadmap, poc, spike, experimentation, leader]
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
benefit: "Run structured proof-of-concept spikes to validate technical assumptions before committing to full implementation"
related:
  - ./do-a-tech-selection.md
  - ./plan-tech-roadmap.md
  - ../architecture/README.md
  - ../README.md
  - ../INDEX.md
---

# Do a Proof of Concept (PoC)

> **As a** tech lead, **I want to** run structured PoC spikes, **so that** we validate technical assumptions before committing significant engineering effort.

## Definition

A PoC (Proof of Concept) is a time-boxed technical spike designed to answer a specific question or validate a specific assumption. It is NOT a prototype or MVP — the code is meant to be thrown away.

```
PoC: "Can we do X?" → Yes/No + evidence
Prototype: "How should X work?" → Design exploration
MVP: "What's the minimum viable X?" → Ship to users
```

## Trigger condition

- Before committing to a technology choice (see [do-a-tech-selection.md](./do-a-tech-selection.md))
- When a project has a critical technical unknown ("Can we handle X req/s?" "Can we integrate with Y?")
- When an architectural decision depends on unvalidated assumptions
- When a team proposes a novel approach that hasn't been tried in this context

## Step-by-step walkthrough

### Step 1: Define the question

A PoC must answer one clear question. If you have multiple questions, run multiple PoCs.

| Bad PoC question | Good PoC question |
|---|---|
| "Can we use Kafka?" | "Can Kafka handle 100K messages/sec with <50ms end-to-end latency on our infrastructure?" |
| "Does this library work?" | "Can library X parse our specific 10GB log format in under 5 seconds?" |
| "Is this approach feasible?" | "Can we migrate 1M records from old schema to new schema with zero downtime?" |

### Step 2: Define success criteria

Before writing any code, define what "yes" looks like:

| Criterion | Target | Measurement method |
|---|---|---|
| Throughput | ≥ 100K msg/sec | Load test with production-like data |
| Latency | p99 < 50ms | Instrumented metrics |
| Integration | Successfully calls API, handles auth, parses response | Integration test |
| Developer experience | Team can set up in < 1 hour | Time the setup |

### Step 3: Time-box the PoC

| Complexity | Time box | Example |
|---|---|---|
| **Small** | 1–2 days | Library evaluation, API integration test |
| **Medium** | 3–5 days | Performance benchmark, data migration spike |
| **Large** | 1–2 weeks | New architecture pattern, multi-service integration |

**Hard stop at the time box**: If you haven't answered the question by the deadline, the answer is "not with acceptable effort" — not "let's spend another week."

### Step 4: Build the minimal thing

Rules for PoC code:
- **Throwaway code**: Write it fast, don't worry about production quality
- **Test the hardest part first**: Don't build scaffolding; go straight to the unknown
- **Production-like data and load**: Synthetic data that matches real-world characteristics
- **Document assumptions**: What are you NOT testing that might matter?

### Step 5: Write the PoC report

A one-page document with:

| Section | Content |
|---|---|
| **Question** | What we set out to answer |
| **Approach** | What we built and how we tested it |
| **Results** | Data, not opinions |
| **Answer** | Yes / No / Yes-but |
| **Surprises** | What we didn't expect |
| **Recommendation** | Proceed / Don't proceed / Proceed with changes |
| **Limitations** | What this PoC didn't test |

### Step 6: Decide and act

| PoC result | Action |
|---|---|
| **Clear yes** | Proceed to implementation; write the ADR ([do-a-tech-selection.md](./do-a-tech-selection.md)) |
| **Yes, but** | Proceed with the documented caveats; add mitigations to the plan |
| **No** | Document why; explore alternatives; don't proceed |
| **Inconclusive** | The question was too vague. Redefine and re-run a more focused PoC. |

## Decision points and branching

| Decision point | Options | Guidance |
|---|---|---|
| PoC is taking too long | Cut scope / Time's up / Extend | Extend only if the bottleneck is environmental (waiting for access, data); never extend for scope creep |
| PoC result contradicts initial assumption | Accept the data / Question the test / Re-run | If the result is surprising, verify the test before accepting it |
| PoC shows it works but the team hates it | Accept / Factor in developer experience | Developer experience is a valid concern; weigh it in the decision |
| PoC is too synthetic to be meaningful | Add realism / Accept the limitation | Be explicit about limitations in the report; don't overclaim |

## Key deliverables at each stage

| Stage | Deliverable |
|---|---|
| Definition | PoC question and success criteria |
| Execution | Working PoC code (throwaway) |
| Report | One-page PoC report |
| Decision | Go / No-go with rationale |

## Anti-patterns and common pitfalls

| Anti-pattern | Why it fails | Fix |
|---|---|---|
| PoC becomes the MVP | "This code is basically done, let's ship it" | PoC code is throwaway by design; rewriting it properly is faster than fixing it |
| Unbounded PoC | "Just one more thing to test" | Hard time-box; scope is the question, nothing more |
| PoC without success criteria | You can't tell if it passed or failed | Define criteria before writing code |
| Testing only the happy path | PoC passes but real-world edge cases kill it | Test with production-like data, error conditions, and failure modes |
| Over-engineering the PoC | Setting up CI/CD, linting, tests for throwaway code | PoC is a spike; use the simplest possible setup |

## This product's landing instance

*To be filled in with the most recent PoC. Include a link to the PoC report, the question, the result, and the decision made.*