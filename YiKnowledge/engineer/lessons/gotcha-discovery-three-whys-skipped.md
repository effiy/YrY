---
title: Discovery skipping Three Whys leads to Delta misjudgment
aliases: [discovery-three-whys-skipped, delta-misjudgment, three-whys-gotcha, why-root-cause]
tags: [pitfall, discovery, three-whys, delta, root-cause, fde, consulting, site-survey]
category: engineer/lessons
created: 2026-08-05
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: yearly
tacit: true
roles: [engineer, tech-lead, product-manager]
benefit: "same mistake avoided"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified
related:
---

# Discovery skipping Three Whys leads to Delta misjudgment

> **As an** engineer, **I want to** discovery three whys skipped, **so that** same mistake avoided. 

> FDE skipping Three Whys (System of Record + Cost of Inaction + Day 2) during a discovery call -> misjudging Delta -> writing wrong glue code -> customer renewal deadlock. This gotcha is the basis for [ADR Delta-as-contract](../../tech-lead/decisions/fde/delta-as-a-contract.md) §risk #1, referencing [consulting frameworks](../process/apply-consulting-frameworks.md) §Three Whys. 

## Summary

- **Symptom**: Delta misjudgment -> wrong glue code written -> after launch customer says "this is not what I wanted" -> renewal deadlock
- **Root cause**: Discovery skipped Three Whys; trusted the customer's surface statement ("I want feature X") 
- **Fix**: Discovery must run Three Whys; System of Record + Cost of Inaction + Day 2 three questions; FDE Practice Lead samples recording audits
- **Reference**: McKinsey "Five Whys" + Trusted Advisor three questions

## Core viewpoints

- **The customer's surface statement is not a lie -- it is a symptom, and treating symptoms instead of root causes is the definition of consulting failure**: When a customer says "I want an LLM to auto-summarize reports," they are describing their imagined solution, not their actual problem. The FDE's job is to trace that statement back to the underlying need (reduce review time, improve consistency, surface anomalies) before writing a single line of code.

- **The System of Record question is the highest-leverage question in any Discovery call because it determines whether the project is even feasible**: If the ground truth data lives in Excel on someone's desktop, no amount of RAG engineering will produce accurate results. The System of Record question must be answered with a specific, verifiable source -- a database, an API, a document store -- not a vague assertion that "the data exists."

- **The Cost of Inaction is the only question that creates urgency, and without urgency, the project will be deprioritized into irrelevance**: If the customer cannot quantify what it costs to do nothing -- in dollars, hours, risk, or opportunity -- then the project has no champion and no budget. The Cost of Inaction is not a consulting exercise; it is the business case that keeps the project alive through organizational friction.

- **Delta candidates without business metrics are opinions, not deliverables**: A Delta candidate that says "build an LLM summarization pipeline" is a proposal. A Delta candidate that says "build an LLM summarization pipeline that reduces report review time from 4 hours to 30 minutes, measured by time-tracking data" is a deliverable. The metric makes the Delta falsifiable, which makes it accountable, which makes it defensible at renewal time.

- **Discovery call recording audits are not bureaucratic overhead -- they are the only feedback loop that catches process drift**: When the FDE Practice Lead samples 20% of Discovery recordings and finds that Three Whys was skipped, the SOW is not signed. This is not punishment; it is the only mechanism that prevents the same failure pattern from repeating across every engagement. Without audits, process compliance is a hope, not a requirement.


- **Customer says "I want X" ≠ customer needs X** — skipping Three Whys inevitably leads to Delta misjudgment
- **Three Whys questions**: System of Record (where is ground truth) + Cost of Inaction (cost of doing nothing) + Day 2 (who runs it after FDE leaves) 
- **Delta misjudgment = renewal deadlock** — customer pays for the wrong thing; FDE exits; project dies
- **Discovery Five Whys** — ask why 5 times to find root cause; not just Three Whys

## Key information

### Symptom

- Customer says "I want an LLM to auto-summarize reports" -> FDE writes LLM summarization glue -> after launch customer says "I want to reduce review time, not summarize" -> renewal deadlock
- Customer says "I want RAG" -> FDE writes RAG -> after launch discovers ground truth data is in Excel on desktop -> RAG recall 0
- Customer says "I want auto-classification" -> after launch customer IT says "we have no one to maintain it" -> Day 2 dead
- Delta candidate list all surface features; no business metric; no exit criteria

### Root cause

- **Skipped Three Whys**: trusted customer surface statement ("I want X"); did not ask System of Record / Cost of Inaction / Day 2
- **FDE eager to deliver**: skipped diagnosis -> went straight to coding; less diagnosis, more rework
- **Customer surface statement misleading**: customer also doesn't know root cause; FDE doesn't ask Five Whys -> joint misjudgment
- **Discovery SOP lacks audit**: FDE Practice Lead doesn't sample recordings -> skipping Three Whys goes unnoticed
- **Delta candidates no metric**: no business metric -> cannot falsify -> questioned at renewal
- **Delta candidates no exit criteria**: no exit criteria -> Day 2 dies

### Impact scope

- All customers in FDE Practice; especially first-deal customers
- SOW template Delta attachment section
- Site Survey Delta candidate list
- Renewal rate / customer word of mouth / team reputation

### Solution

**Discovery SOP enforces Three Whys** (every Delta candidate must answer) : 

| Why | Question | Consequence if skipped |
|---|---|---|
| Why 1 | What is the System of Record? | ground truth in Excel on desktop -> RAG recall 0 |
| Why 2 | What is the Cost of Inaction? | no urgency -> low project priority -> 6 months to act |
| Why 3 | What does Day 2 look like? | no internal owner -> project dies after FDE exits |
| Why 4 | Why 5 | ask why 5 times for root cause; don't stop at "I want X" |
| metric | What is the business metric? | no metric -> value questioned at renewal |
| exit | What are the exit criteria? | no exit -> Day 2 dies |

**Audit**: FDE Practice Lead quarterly samples 20% of Discovery recordings; Three Whys missed = SOW not signed. 

**Template**: SOW Delta attachment section 4 fields (proposal glue + business metric + exit criteria + owner) required. 

### Similar pitfalls

- Customer says "I want an AI assistant" actually wants "to reduce customer service headcount" -> skipping Why leads to wrong Delta
- Customer says "I want RAG" actually data on desktop -> skipping Why 1 leads to RAG recall 0
- Customer says "I want automation" actually no one to maintain -> skipping Why 3 leads to Day 2 dead
- Customer says "I want a large model" actually wants "a marketing story" -> skipping Why leads to over-specced LLM
- Customer says "I want monitoring" actually no alerting runbook -> skipping Why 3 leads to bare alerts

## Action recommendations

1. **Discovery SOP enforces Three Whys**: every Delta candidate must answer three questions + metric + exit ([ADR Delta-as-contract](../../tech-lead/decisions/fde/delta-as-a-contract.md) §decision #3) 
2. **FDE Practice Lead quarterly samples 20% recordings**: Three Whys missed = SOW not signed
3. **SOW template Delta attachment section 4 fields required**: proposal glue + business metric + exit criteria + owner
4. **Discovery Five Whys training**: mandatory for FDE onboarding; retrospective every 3 months
5. **Customer surface statement flagged**: when customer says "I want X" FDE must note "surface statement -> to be validated by Five Whys"
6. **System of Record must be checked**: Excel on someone's desktop = project already high risk; SOW must flag explicitly
7. **Cost of Inaction must be quantified**: cost of doing nothing (money / time / risk) ; drives urgency
8. **Day 2 owner must be identified**: no internal owner = project will die; find one by Week 1



- **Trusting customer surface statement** — "I want X" ≠ "I need X"; must run Five Whys
- **Skipping Three Whys** — Delta misjudgment -> renewal deadlock
- **Delta candidates without metric** — value questioned at renewal; customer pays for wrong thing
- **Delta candidates without exit criteria** — Day 2 dies
- **No recording audit** — FDE skipping Three Whys goes unnoticed
- **System of Record not checked** — ground truth on desktop -> RAG recall 0
- **Day 2 owner not identified** — project dies after FDE exits

## Anti-patterns

- **Asking the Three Whys questions but accepting the customer's first answer without probing.** A customer who answers "What is the System of Record?" with "our ERP system" has not identified the System of Record -- they have named a system that may or may not contain the ground truth data. The FDE must follow up with "Can we see a sample export?" and "When was the last time this data was validated?" until the answer is a specific, verifiable source.
- **Running the Three Whys during the Discovery call but not writing the answers into the SOW as contractual commitments.** The customer agrees verbally that the System of Record is the ERP database, but the SOW does not mention this. When the FDE discovers three months later that the ERP data is incomplete, the customer says "we never said the ERP had all the data." The Three Whys answers must be written into the SOW as explicit assumptions that both parties sign.
- **Identifying the Day 2 owner but not verifying that the owner has the authority to allocate budget for ongoing operations.** The customer designates a mid-level engineer as the Day 2 owner, but that engineer cannot approve the cloud infrastructure budget, cannot hire additional staff, and cannot prioritize the system over competing projects. The Day 2 owner must be someone with budget authority, not just someone with technical knowledge.
- **Quantifying the Cost of Inaction as a single number without breaking it down by time horizon.** "The cost of doing nothing is $500K per year" is not actionable because it does not create urgency for the next 90 days. The Cost of Inaction must be broken down: "Month 1: $20K in manual review time. Quarter 1: $60K + 2 missed SLAs. Year 1: $500K + regulatory penalty risk." The short-term number drives the project kickoff; the long-term number drives the renewal.
- **Treating the Five Whys as a linear chain that always terminates at the fifth question.** The Five Whys is a guideline, not a formula. Some root causes require three whys; others require seven. Stopping at five because the template says five, when the fifth answer is still a symptom rather than a systemic cause, produces a root cause analysis that is incomplete. Continue asking "why" until the answer is a process gap, a missing tool, or an absent defense-in-depth layer -- not a person's action.

## Related

- Same category: [./no-lockfile-supply-chain-risk.md](gotcha-no-lockfile-supply-chain-risk.md) — skipped process pitfall
- Design basis: [ADR Delta-as-contract](../../tech-lead/decisions/fde/delta-as-a-contract.md) §decision #3 + §risk #1
- Contract source: [consulting frameworks](../process/apply-consulting-frameworks.md) §Three Whys
- Landing: [Site Survey](../engineering/run-a-site-survey.md) §Delta + [Discovery Call](../../knowledge-curator/archive/strategies-legacy/engineer/prepare-a-discovery-call-strategy.md)
- upstream: [journeys/i-want-to-check-engineering-gotchas](../process/check-engineering-gotchas.md) — scenario entry
