---
title: RICE / ICE Prioritization Framework
aliases:
- RICE Prioritization
- ICE Score
tags:
- PM
- methodology
- prioritization
- decision-making
category: product-manager/frameworks
created: 2026-07-31
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: yearly
roles:
- product-manager
- executive
benefit: PMs can select and apply the right PM framework for their specific product challenge
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- kano-model.md
- jobs-to-be-done.md
- okr-design.md
- agile-product-management.md
- ../../executive/strategy/README.md
tacit: false
---

# RICE / ICE Prioritization Framework

> **As a** product manager, **I want to** rice ice prioritization, **so that** framework applied. 

> Use scoring to sort rather than gut call: RICE = Reach × Impact × Confidence / Effort; ICE is a lighter earlier version. 

## Summary
- RICE was proposed by Intercom (2014), ICE is Sean Ellis's earlier lighter version; both are "scoring sort" not "precise prediction". 
- RICE = Reach × Impact × Confidence / Effort; ICE = Impact × Confidence × Ease. 
- Six steps: list candidates → unify units → team scoring → sort by score → review boundary cases → pick top-N. 
- Applicable: candidates >10, multiple value dimensions, team has disagreement on priority; not applicable: strongly constrained projects, exploration phase, strategic must-do.
- Anti-patterns: all 100% Confidence, Effort estimated low, one-time scoring for life, strictly sort by score, Reach estimated inaccurately. 

## Core viewpoints

- **RICE reveals disagreement, not truth.** The primary value of a RICE scoring session is not the final sorted list — it is the conversation that happens when two people give wildly different scores to the same item. When the engineer rates Effort at 1 week and the PM rates Impact at 5, the gap reveals a misunderstanding that, if left unresolved, would produce the wrong feature. The score is a conversation starter, not a decision maker.

- **Confidence is the most important dimension because it exposes ignorance.** Features with low Confidence are where the real risk lives. A high-RICE item with 50% Confidence is a gamble dressed as a priority. The right move is not to build it; it is to invest one week in a spike that raises Confidence to 80% before committing. Most teams skip this step and pay for it in rework.

- **Reach is the most frequently gamed dimension.** "This will impact all 10,000 users" is almost always wrong. Most features impact a narrow segment. The discipline: define the specific user segment before estimating Reach, and validate the estimate against analytics data. If your Reach estimate for 5 different features is the same number, you are not estimating — you are copying.

- **Prioritization is not a one-time event but a continuous rebalancing act.** New information arrives daily: a competitor launches, a key customer churns, a technical constraint is discovered. Re-scoring only at the start of each iteration means the team operates on stale information for up to 2 weeks. Lightweight re-scoring should happen whenever a significant new input arrives.

- **ICE is not "RICE-lite" — it is a different tool for a different context.** ICE (Impact/Confidence/Ease) deliberately omits Reach because in early-stage products, you do not know your audience size yet. Using ICE is an admission that you are optimizing for learning speed, not for user impact. Switching from ICE to RICE is a signal that the product has found its audience and is now optimizing for scale.


- **Scoring is a structured discussion tool, not precise prediction** — scores align the team's understanding, not truth. 
- **Confidence is the anti-cheat valve** — all 100% equals no priority; force low-confidence items < 80%. 
- **Effort calibrated by historical data** — underestimating causes schedule overrun, multiply 1.5 buffer. 
- **Re-score every iteration** — not re-calculating after subsequent changes equals one-time for life. 
- **Strategic needs need human override** — strictly sorting by score will eliminate must-do; keep override + record reason. 

## Key information

### Framework origin

RICE was proposed by the Intercom team (2014) for relative sorting among multiple candidate needs. ICE is an earlier lighter version (Sean Ellis). Both are "scoring sort", not "precise prediction". 

### Core concepts

**RICE = Reach × Impact × Confidence / Effort**

| Dimension | Meaning | Unit |
|---|---|---|
| Reach | How many people/customers will be impacted | People / quarter |
| Impact | How much value each impacted person brings | 1 (low) -3 (medium) -5 (high)  |
| Confidence | Confidence in above estimates | 50% / 80% / 100% |
| Effort | Effort required to complete | Person-months or points |

Final score = `(R × I × C) / E`, higher score = higher priority. 

**ICE = Impact × Confidence × Ease**

Lighter, removes Reach, Ease is the inverse of Effort. Suitable for early exploration, insufficient data. 

### Implementation steps

1. **List candidate inventory**: List all doable items, avoid omission
2. **Unify estimation units**: Reach uses same time window (quarter), Effort uses same unit (person-weeks)
3. **Team scoring**: Key members each score, then discuss disagreement
4. **Calculate and sort**: Calculate RICE score, sort descending
5. **Review boundary cases**: For items with close scores, check Confidence; high-score low-confidence items need spike validation
6. **Pick top-N**: Take top N items into iteration planning

### Input / output artifacts

- Input: demand pool, user feedback, business goal, staffing budget
- Output: scoring table (a spreadsheet) + sorted list + selected/rejected reasons

### Comparison with other frameworks

| Framework | Dimensions | Suitable for |
|---|---|---|
| RICE | Reach + Impact + Confidence + Effort | Sufficient quantitative data |
| ICE | Impact + Confidence + Ease | Early phase, insufficient data |
| MoSCoW | Must / Should / Could / Won't | Strongly constrained projects |
| Kano | Basic / Performance / Excitement | Experience-oriented |
| Cost-Value | Two-dimensional quadrant | Candidates ≤ 8 |

### Applicable scenarios and boundaries

**Applicable**: 

- Many candidate needs (>10), resources insufficient to do all
- Multiple value dimensions (user volume, impact depth, cost) 
- Team has disagreement on priority, needs structured discussion

**Not applicable**: 

- Projects with strong external constraints (compliance, contracts, key customer commitments) 
- Exploration-phase needs, without enough data to estimate Reach and Impact
- Strategic must-do (must do regardless of low score) 

## Action recommendations
1. List all candidate needs, avoid omission; unify estimation units (Reach by quarter, Effort by person-week). 
2. Key members each score then discuss disagreement, don't let one person decide.
3. Calculate RICE score sort, force low-confidence items < 80% Confidence (anti-cheat). 
4. For close-score items check Confidence; high-score low-confidence items first do spike validation. 
5. Keep override: strategic must-do even with low score is kept, record reason. 
6. Re-score at start of every iteration, reflecting latest info. 
7. Calibrate Effort by historical data, multiply 1.5 buffer to prevent schedule overrun. 

## Anti-patterns

- **Prioritization by committee: averaging scores to avoid conflict.** When a team averages everyone's RICE scores to produce a clean list, they are suppressing disagreement, not resolving it. The highest-value conversations happen at the extremes. Instead of averaging, surface the disagreements: "Alice thinks this is Impact 5, Bob thinks it's Impact 1. Let's each explain our reasoning." The final score should reflect the team's best collective judgment, not a mathematical compromise.

- **The "everything is high priority" backlog.** When every item in the backlog is rated P0 or P1, the priority system has collapsed. This happens when teams are afraid to say "we will not do this" and instead label everything as urgent. The fix: enforce a quota — only 20% of backlog items can be in the top priority tier. Force trade-offs.

- **Using RICE to justify decisions already made.** The most insidious anti-pattern: a PM decides what to build, then reverse-engineers RICE scores to make it look data-driven. The test: if you cannot point to a case where RICE changed your mind about what to build, you are using it as a justification tool, not a decision tool.

- **Effort estimated by the person who wants to build it.** When the PM estimates Effort, it is systematically low because they are invested in the feature. When the engineer estimates Effort, it is also systematically low because they are excited to build it. The fix: Effort must be estimated by someone who will not be implementing the feature, or must be calibrated against historical actuals from similar work.

- **Prioritization without a strategy anchor.** RICE tells you which features deliver the most impact per effort, but it does not tell you whether those features serve the strategy. A feature that scores high on RICE but pulls the product away from its North Star should not be built. Strategy sets the boundary; RICE sorts within the boundary. Without strategy, RICE optimizes for local maxima.


- **All 100% Confidence** — scores distorted, no priority; force low-confidence items < 80%. 
- **Effort estimated low** — actual schedule overrun; calibrate by historical data, multiply 1.5 buffer. 
- **One-time scoring for life** — subsequent changes not re-calculated; re-score every iteration. 
- **Strictly sort by score** — strategic needs eliminated; override + record reason. 
- **Reach estimated inaccurately** — validated by quarter later; use historical data + user-volume baseline. 

## Related
- Same class: [kano-model-summary.md](./kano-model.md) (Kano focuses on "what type to do", RICE focuses on "which to do first", can stack) ; [jobs-to-be-done-summary.md](./jobs-to-be-done.md) (JTBD identifies opportunities, RICE sorts opportunities) ; [okr-design-summary.md](./okr-design.md) (OKR sets direction, RICE ranks needs) ; [agile-product-management-summary.md](./agile-product-management.md) (iteration planning uses RICE sort) 
- upstream: [../../executive/strategy/README.md](../../executive/strategy/README.md)
- downstream: iteration planning, demand pool management

## References
- Intercom — *A simple model for product prioritization* (RICE source) 
- Sean Ellis — *ICE score* (growth hacker early methodology) 
