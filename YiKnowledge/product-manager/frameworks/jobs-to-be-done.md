---
title: Jobs-to-Be-Done (JTBD)
aliases:
- Jobs to Be Done
- JTBD
- Outcome-Driven Innovation
tags:
- PM
- methodology
- user-research
- jtbd
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
- kano-model.md
- product-discovery-framework.md
- rice-ice-prioritization.md
- ../../executive/strategy/README.md
tacit: false
---

# Jobs-to-Be-Done (JTBD)

> **As a** product manager, **I want to** jobs to be done, **so that** framework applied.

> Users do not buy products, they hire products to complete a piece of task; competitors are not the same class of product, but all solutions that can complete the same Job.

## Summary
- Tony Ulwick (Outcome-Driven Innovation) + Clayton Christensen (<Competing Against Luck>) promoted it.
- Job Statement Template: "When [situation], I want to [action], so I can [expected outcome]".
- Six steps: find users → capture Job → separate primary/secondary → list Outcome → opportunity sort → product align.
- Opportunity Score = importance degree + max(importance degree − satisfaction degree, 0); high-priority outcomes fall into specific requirements.
- Apply: find product positioning, explore new markets, re-examine churn; not apply: short-term priority, detail optimization after PMF.

## Core viewpoints
- **Job has three dimensions** — functional + emotional + social; only looking at functional will miss experience.
- **Outcome must be quantifiable** — "minimize / maximize + metric" format; "want to use well" is not an outcome.
- **Competitors are not the same class of product** — users buy a drill not because they need a drill, but because they need a hole in the wall; competitors are all solutions that complete the same Job.
- **Interview ≥ 15 people** — 3 people to define Job types is insufficient; cover different details.
- **Half-year re-review** — Jobs from three years ago no longer apply; user Jobs evolve.

## Key information

### Framework source and authors

Tony Ulwick (Strategyn, late 1990s) proposed Outcome-Driven Innovation, Clayton Christensen promoted "Job to be done" in <The Innovator's Dilemma> and <Competing Against Luck>. Core proposition: **users do not buy products, they hire products to complete a piece of task**.

### Core concept

| concept | meaning |
|---|---|
| Job | the task users want to complete (functional + emotional + social) |
| Main Job | primary task ("hang a picture on the wall") |
| Related Job | related task ("decorate the room") |
| Job Statement | "When ___, I want to ___, so I can ___" |
| Outcome | the expected result after completing the task, quantifiable ("minimize time to find a doc") |
| Forces of Progress | push (current dissatisfaction), pull (new solution attraction), anxiety, habit |
| Competition | not the same class of product, but all solutions that complete the same Job |

Classic example: users buy a drill not because they need a drill, but because they need a hole in the wall; one layer up, they need to hang a picture, they need to decorate the room.

### Job Statement Template

```
When [situation],
I want to [action],
So I can [expected outcome].
```

Example:

> When I receive a customer after-sales request in a non-English market,
> I want to draft a BRD in their language within 10 minutes,
> So I can respond to the customer before they escalate.

### Implementation steps

1. **Find users**: interview 15-30 target users
2. **Capture Job**: ask "when do you use this product? why use? what happens if not used?"
3. **Separate primary/secondary**: separate main job and related job; separate functional / emotional / social
4. **List Outcome**: each Job lists 15-50 outcomes, each in "minimize / maximize + metric" format
5. **Opportunity sort**: research each outcome's importance degree + satisfaction degree, compute Opportunity Score = importance degree + max(importance degree − satisfaction degree, 0)
6. **Product align**: high-priority outcomes fall into specific requirements

### Input / output artifacts

- input: user interview records, existing feature usage data, customer complaints
- output: Job map, Outcome list, Opportunity score table

### Comparison with other frameworks

| framework | perspective | suitable for |
|---|---|---|
| Persona | who the user is | market entry and communication |
| JTBD | what the user wants to complete | product positioning and innovation |
| User Story | functional implementation | development task breakdown |
| Story Map | user experience flow | functional stitching |

Persona and JTBD are not mutually exclusive, but JTBD is closer to "why use" rather than "who uses".

### Apply scenario and boundary

**Apply**:

- find product positioning and differentiation
- explore new markets (not improving existing features)
- re-examine churn reasons (why users switch to alternative solutions)

**Not apply**:

- short-term feature priority sort (use RICE more directly)
- detail optimization of products that already have PMF (feature feedback is sufficient)

## Action recommendations
1. Interview 15-30 target users, ask "when to use / why use / what if not used".
2. Capture Job using "When X, I want to Y, so Z" template, don't describe solutions.
3. Separate main job and related job, separate functional / emotional / social three dimensions.
4. Each Job lists 15-50 outcomes, in "minimize / maximize + metric" format.
5. Research importance degree + satisfaction degree, compute Opportunity Score = importance degree + max(importance degree − satisfaction degree, 0).
6. High-priority outcomes fall into specific requirements, enter product planning.
7. Half-year re-review Job and Outcome, retire outdated hypotheses.

## Anti-patterns
- **Job description as solution** — "I want a BRD generator"; change to "When X, I want to Y, so Z".
- **Ignore emotional and social Job** — only look at functional, miss experience; three dimensions all listed.
- **Outcome not quantifiable** — "want to use well"; "minimize time to find feature".
- **Insufficient sample** — interview 3 people then define Job; ≥15 people, cover different details.
- **Not refreshed** — Jobs from three years ago still in use; half-year re-review.


- **Conflating Job with task** — "write a report" is a task; "communicate project status to stakeholders so they can make funding decisions" is the Job. Tasks change with technology; Jobs persist.
- **Interviewing only power users** — power users have different Jobs and expectations than new or casual users; the interview sample must cover the full adoption spectrum to capture all Jobs.
- **Treating the Opportunity Score as a definitive prioritization formula** — high importance + low satisfaction is a signal, not a decision; feasibility, strategic alignment, and competitive pressure still need separate evaluation.
- **Defining Outcomes without first measuring current satisfaction** — you cannot compute the opportunity gap without a baseline satisfaction score; both importance and satisfaction must come from the same user survey.
- **Skipping the Forces of Progress analysis** — push (dissatisfaction with current), pull (attraction of new), anxiety (fear of change), and habit (inertia) explain why users switch or stay; missing them means missing the adoption trigger.

## Related
- same class: [kano-model-summary.md](./kano-model.md) (Kano categorizes requirements, JTBD identifies Job); [product-discovery-framework-summary.md](./product-discovery-framework.md) (Discovery uses JTBD to identify opportunity); [rice-ice-prioritization-summary.md](./rice-ice-prioritization.md) (JTBD positioning, RICE sort)
- Upstream: [../../executive/strategy/README.md](../../executive/strategy/README.md)
- Downstream: product positioning, new market exploration, churn analysis

## Reference material
- Christensen etc — *Competing Against Luck* (2016)
- Tony Ulwick — *Jobs-to-Be-Done: From Theory to Practice*
- Bob Moesta — *Demand-Side Sales*
