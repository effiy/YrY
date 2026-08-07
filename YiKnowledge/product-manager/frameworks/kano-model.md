---
title: Kano Model for Feature Prioritization
aliases:
- Kano Model
- Kano Survey
tags:
- PM
- methodology
- requirements
- user-experience
category: product-manager/frameworks
created: 2026-07-31
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: yearly
last_verified: 2026-08-07
roles:
- product-manager
- executive
benefit: PMs can select and apply the right PM framework for their specific product challenge
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- rice-ice-prioritization.md
- jobs-to-be-done.md
- heart-aarrr-metrics.md
- ../product/ux/README.md
tacit: false
---

# Kano Model for Feature Prioritization

> **As a** product manager, **I want to** kano model, **so that** framework applied. 

> Not all requirements follow "the more, the better, the higher the satisfaction"; by the non-linear relationship between implementation degree and satisfaction degree, requirements are classified into five categories, with trade-offs per category. 

## Summary
- Proposed by Noriaki Kano in 1984; five categories: basic, expected, exciting, indifferent, reverse. 
- Identification relies on double questions (positive + negative), using a category matrix to map answers, and computing Better / Worse coefficients to plot quadrants. 
- Time evolution rule: Attractive -> One-dim -> Must; yesterday's surprise becomes today's expectation and tomorrow's baseline. 
- Apply: when features are many and need categorization trade-offs, users cannot articulate needs from data, distinguishing must-haves from surprises; Not apply: early B2B, brand-new market, tech-driven product. 
- Combined with RICE: Kano focuses on "what type", RICE focuses on "which first". 

## Core viewpoints
- **Not all requirements follow "the more, the better"** — basic category, once fully implemented, only stays neutral without adding points; exciting category, even when not fully implemented, still stays neutral. 
- **Double questions are mandatory** — only asking the positive will misjudge One-dim and Attractive. 
- **Sample size >= 100 real users** — a single team answering on behalf of users is self-delusion. 
- **Time decay** — Attractive -> One-dim -> Must; without continuously finding new Attractive features, the product will sooner or later be commoditized into Must-level parity. 
- **Annual re-audit** — what was Attractive three years ago may already be Must today. 

## Key information

### Framework source and author

Proposed by Noriaki Kano in 1984. Product attributes are classified into five categories by the non-linear relationship between "implementation degree" and "user satisfaction degree". Core idea: **not all requirements follow "the more, the better, the higher the satisfaction"**, different categories have different curves. 

### Five requirement categories

| Category | Meaning | Implementation insufficient | Implementation sufficient |
|---|---|---|---|
| Basic (Must-be / basic quality) | Users expect it by default | Extreme dissatisfaction | Neutral (no points added) |
| Expected (One-dimensional / one-dimensional quality) | The more, the better | Dissatisfied | Satisfied |
| Exciting (Attractive / charm quality) | Users do not expect it | Neutral (no points deducted) | Extreme satisfaction |
| Indifferent (Indifferent) | Users do not care | Neutral | Neutral |
| Reverse (Reverse) | Users do not want it | Satisfied | Dissatisfied |

### Identification method

**Questionnaire design**

Ask two questions for each attribute: 

1. **Positive question**: If this feature exists, how do you feel?
2. **Negative question**: If this feature does not exist, how do you feel?

Each question has 5 response options: like, take it for granted, neutral, reluctantly accept, dislike. 

**Category matrix**

Map "positive answer x negative answer" against the table below: 

| positive \ negative | like | take it for granted | neutral | reluctantly accept | dislike |
|---|---|---|---|---|---|
| like | Q | A | A | A | R |
| take it for granted | R | I | I | I | M |
| neutral | R | I | I | I | M |
| reluctantly accept | R | I | I | I | M |
| dislike | R | R | R | R | Q |

> M = Must, O = One-dim, A = Attractive, R = Reverse, I = Indifferent, Q = Questionable (data contradictory) 

### Implementation steps

1. **List attributes**: When planning, select features / properties (10-25 items) 
2. **Design double questions**: Two questions per attribute
3. **Distribute questionnaire**: 100-300 target users
4. **Compute Better / Worse coefficients**

 ```
 Better = (A + O) / (A + O + M + I)
 Worse = -(O + M) / (A + O + M + I)
 ```

5. **Plot Better-Worse quadrant chart**: horizontal Better, vertical Worse
6. **Prioritization**: Must satisfied first -> One-dim adds value -> Attractive creates surprise -> Indifferent cut

### Input / output artifacts

- Input: feature/property checklist + user questionnaire
- Output: category table + Better-Worse quadrant + prioritization suggestion

### Time evolution rule

Kano attributes shift over time: 

> Attractive -> One-dim -> Must

Yesterday's surprise feature becomes today's expectation and tomorrow's baseline. Example: e-commerce next-day delivery -> same-day delivery -> half-day delivery. 

**Implication**: Must continuously find new Attractive features, otherwise the product will sooner or later be commoditized into Must-level parity. 

### Comparison with other frameworks

| Framework | Perspective | Suitable for |
|---|---|---|
| Kano | User expectation and satisfaction curves | Feature categorization |
| RICE | Value x confidence / effort | Quantitative ranking |
| MoSCoW | Mandatory constraint classification | Resource-constrained projects |

Kano focuses on "what type", RICE focuses on "which first"; they can be used together. 

### Applicable scenarios and boundaries

**Apply**: 

- Many features/properties, need categorization trade-offs
- Users cannot articulate, need data support
- Distinguish "must-have" from "surprise"

**Not apply**: 

- Early B2B stage, few users, no way to survey
- Brand-new market (users have not seen the feature, expectations are inaccurate) 
- Tech-driven product

## Action recommendations
1. Select 10-25 features when planning, too few fails to cover and too many loses focus. 
2. Design double questions (positive + negative) per attribute, 5 response options. 
3. Distribute questionnaire to 100-300 target users; do not let a single team answer on behalf of users. 
4. Compute Better / Worse coefficients, plot quadrant chart. 
5. Prioritize: Must satisfied first -> One-dim adds value -> Attractive creates surprise -> Indifferent cut. 
6. Combine with RICE: category x RICE score cross-ranking. 
7. Annual re-audit: check whether Attractive has already shifted to One-dim / Must. 

## Anti-patterns
- **Skipping the reverse question** — only looking at positive misjudges One-dim and Attractive; double questions are mandatory. 
- **Sample too small** — single team answering on behalf of users; need >= 100 real users. 
- **One-shot classification forever** — what was Attractive three years ago is already Must today; time decay, annual re-audit. 
- **Ignore Indifferent** — piling on features users do not care about; cut to save resources. 
- **Not combining with RICE** — only looking at Kano does not know when to do; use category x RICE score cross-ranking. 


- **Surveying the internal team instead of real users** — team members have biased expectations shaped by implementation knowledge; only real users can reveal the true category membership of a feature.
- **Asking users to rate features they have never experienced** — users cannot accurately rate hypothetical features; use prototypes, concept descriptions, or competitive references to ground the evaluation.
- **Treating Kano categories as absolute across all user segments** — one segment's Attractive feature is another's Indifferent; segment results by user persona before aggregating.
- **Not accounting for competitive pressure in category assignment** — a feature may be Attractive in isolation but becomes Must (Basic) if competitors ship it; the competitive landscape shifts categories.
- **Using Kano survey results for pricing decisions** — Kano measures satisfaction, not willingness to pay; pricing requires separate conjoint analysis or Van Westendorp research.

## Related
- Same category: [rice-ice-prioritization-summary.md](./rice-ice-prioritization.md) (Kano categorization + RICE ranking) ; [jobs-to-be-done-summary.md](./jobs-to-be-done.md) (JTBD identifies Job, Kano categorizes requirement) ; [heart-aarrr-metrics-summary.md](./heart-aarrr-metrics.md) (Kano focuses on experience, HEART measures experience) 
- Upstream: [../product/ux/README.md](../discovery/ux/README.md)
- Downstream: feature planning, version scope control

## Reference material
- Kano, N. (1984) — *Attractive Quality and Must-Be Quality*
- Kano model questionnaire template: https://www.kanomodel.com
