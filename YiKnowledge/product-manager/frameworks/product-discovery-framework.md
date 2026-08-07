---
title: Product Discovery Framework
aliases:
- Product Discovery Framework
- Continuous Discovery
tags:
- PM
- methodology
- discovery
- user-research
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
- dual-track-agile.md
- jobs-to-be-done.md
- rice-ice-prioritization.md
- kano-model.md
tacit: false
---

# Product Discovery Framework

> **As a** product manager, **I want to** product discovery framework, **so that** framework applied.

> "Discovery" before product launch is more important than "delivery" — avoid spending months of team time on a product nobody wants.

## Summary
- Teresa Torres (*Continuous Discovery Habits*) + Marty Cagan (*Inspired / Empowered*) popularized it.
- Double diamond: diverge Discover → converge Define → diverge Develop → converge Deliver; Discovery does the first two diamonds.
- Cagan's four risks: Value / Usability / Feasibility / Viability; Discovery reduces the four risks to acceptable before entering Delivery.
- Opportunity solution tree: business result → opportunity → solution → experiment; 1-2 user interviews per week + one assumption test per week.
- anti-patterns: treating Discovery as a stage, only PM does it, not interviewing real users, prototypes only test UI, deciding direction in one shot, not drawing opportunity tree, learning not entering Delivery.

## Core viewpoints

- **Discovery is not "figuring out what to build" — it is "eliminating what not to build."** The most valuable output of Discovery is a list of ideas that were killed before they consumed engineering weeks. A PM who only uses Discovery to validate their own ideas is using half the framework. The real ROI comes from saying "we are not going to build this" to the stakeholder who demanded it, backed by user evidence.

- **The opportunity solution tree is a decision journal, not a status report.** Its primary value is making the team's reasoning visible and auditable over time. When a feature fails 6 months later, the tree should answer: "why did we think this was a good idea?" Without it, the team repeats the same reasoning mistakes. Force every opportunity to link to specific interview quotes or data points, not just PM intuition.

- **User interviews are the single most leverageable activity a PM can do.** An engineer who shadows one user interview per week builds a mental model of the user that no PRD can replicate. The downstream effect is that engineers propose better solutions, push back on wrong requirements, and need less rework. This is a compounding investment that pays off over months, not days.

- **The four risks are not equal — Value risk deserves 60% of Discovery effort.** Most teams over-invest in Usability risk (making the wrong thing easy to use) and under-invest in Value risk (whether anyone wants the thing at all). A prototype that tests value (will users pay/switch/change behavior) should precede any usability testing. Usability of a valueless feature is wasted effort.

- **Discovery's exit criterion is "acceptable risk," not "zero risk."** The goal is not to eliminate uncertainty but to reduce it below the threshold where the cost of more Discovery exceeds the cost of building the wrong thing. For a low-risk internal tool, that threshold might be 2 days of Discovery. For a new revenue-driving product, it might be 6 weeks. Calibrate the Discovery investment to the downside of being wrong.


- **Discovery is continuous, not a stage** — finishing and entering Delivery without returning equals waterfall.
- **Weekly user interviews + weekly assumption test** — even after launch, keep interviewing; never stop.
- **Cross-functional participation** — PM + design + engineer rotate into interviews; if only PM does Discovery, engineers don't know why they build it.
- **Opportunity solution tree captures learning** — without drawing the tree, learning is lost; mandate drawing the tree + capturing.
- **Reduce four risks to acceptable before Delivery** — Value / Usability / Feasibility / Viability are the exit criteria of Discovery.

## Key information

### Framework origin

Teresa Torres (*Continuous Discovery Habits*) and Marty Cagan (*Inspired / Empowered*) popularized it. Core thesis: **"Discovery" before product launch is more important than "delivery" — avoid spending months of team time on a product nobody wants.**

### Double diamond model

```
Diverge (Discover) → Converge (Define) → Diverge (Develop) → Converge (Deliver)
```

The Discovery phase does the first two diamonds: explore the problem space, define the problem worth solving.

### Four risks (Cagan)

Each candidate opportunity is evaluated on four classes of risk:

1. **Value risk**: will users want it? will the business benefit?
2. **Usability risk**: can users figure out how to use it?
3. **Feasibility risk**: can we build it?
4. **Viability risk**: does it fit compliance / business model / brand?

Discovery's goal is **to reduce these four classes of risk to an acceptable level**, then enter Delivery.

### Opportunity Solution Tree

```
Opportunity (outcome) → Solution (feature) → Experiment (test) → Result (learning)
```

- Top layer: business result (e.g. "raise first-time success rate to 80%")
- Middle layer: user pain points / opportunities (from interviews)
- Lower layer: candidate solutions
- Leaves: experiments for each solution (prototype / AB / usability test)

### Key practices

**Weekly user interviews**

- PM + design + engineer rotate in
- At least 1-2 real user interviews per week
- Never stop: interview even after launch

**Prototype testing**

- Low fidelity: paper / Figma wireframe
- Medium fidelity: clickable prototype
- High fidelity: interactive, real data
- Engineers can write a spike to validate technical feasibility

**One-Piece-at-a-Time**

- Test one assumption per week, not monthly big tests
- Fail fast, learn fast
- Don't need to launch AB for every test

### Implementation steps

1. **Opportunity statement**: write down the most important business result of the quarter
2. **Opportunity collection**: find 5-15 opportunity points via user interviews
3. **Opportunity tree construction**: organize opportunities into a tree, layered
4. **Weekly assumption**: the assumption to validate this week (from the opportunity tree)
5. **Prototype + experiment**: one test per week
6. **Learning capture**: write each week's learning into the opportunity tree
7. **Enter Delivery**: only start Delivery when the four risks are reduced to acceptable

### Opportunity solution tree example

```
Business result: BRD user first-time acceptance rate raised from 30% to 50%
├ Opportunity 1: users don't know these sections are available
│ ├ Solution 1.1: section template preview
│ │ └ Experiment: prototype + 5-user interview → users prefer it
│ └ Solution 1.2: recommend section button
│   └ Experiment: AB test, acceptance rate +8%
├ Opportunity 2: inconsistent terminology causes many user edits
│ ├ Solution 2.1: glossary visualization
│ └ Solution 2.2: real-time term hint
└ Opportunity 3: users don't know where to edit
  └ Solution 3.1: diff view
```

### Input / output artifacts

- input: user interviews, data insights, business goals
- output: opportunity solution tree, weekly assumption list, prototypes, user test reports, opportunity assessment documentation

### Comparison with other frameworks

| Framework | Focus | Relation to Discovery |
|---|---|---|
| Dual-Track Agile | Discovery and Delivery in parallel | Discovery is one of the tracks |
| Lean Startup | assumption-driven + MVP | Discovery borrows its method |
| Design Thinking | empathy + ideation | Discovery's interview / ideation tools |
| JTBD | what users want to accomplish | Discovery's opportunity identification method |

Discovery is a comprehensive discovery methodology that can integrate the above methods.

### Applicable scenarios and boundaries

**Applicable**:

- Exploratory products / new business directions
- Product direction has real uncertainty
- Team has PM + design + engineering as independent functions

**Not applicable**:

- Contract-type B2B (requirements contract already fixed)
- Internal tool improvements (the user is yourself)
- Strong execution teams (no exploration room)

## Action recommendations
1. Write down the most important business result of the quarter as the opportunity statement.
2. Find 5-15 opportunity points via user interviews; PM + design + engineer rotate in.
3. Build an opportunity solution tree: business result → opportunity → solution → experiment.
4. One assumption test per week: prototype + 5-user interview or AB test; do not accumulate monthly big tests.
5. Write each week's learning into the opportunity tree; do not let learning get lost.
6. Evaluate the four risks (Value / Usability / Feasibility / Viability); only enter Delivery when reduced to acceptable.
7. Write Discovery conclusions into the PRD so learning enters Delivery.
8. Interview even after launch; never stop.

## Anti-patterns

- **Discovery theater: going through the motions without changing decisions.** Teams that run interviews, draw trees, and file reports — but ship whatever the HIPPO said anyway — are performing Discovery as a checkbox exercise. The test: can you point to a feature that was killed or significantly changed because of Discovery? If not, you are doing theater, not Discovery.

- **Over-indexing on the loudest user.** A single user who shouts the loudest (or pays the most) should not drive the roadmap. One interview is an anecdote; five interviews pointing to the same opportunity is a pattern. The opportunity tree must weight opportunities by frequency and business impact, not by decibel level of the user who reported them.

- **Confusing prototype validation with market validation.** A prototype test with 5 users tells you whether the solution is usable, not whether the market is large enough. Teams that see 5/5 users like a prototype and conclude "we have product-market fit" are confusing usability validation with demand validation. Market sizing requires separate quantitative research.

- **Discovery as a PM-only activity.** When Discovery is walled off from engineering, two things happen: engineers build the wrong thing because they never saw the user struggle, and the handoff from Discovery to Delivery becomes a telephone game where nuance is lost. Rotating engineers into interviews is not optional — it is the single most effective way to improve build quality.

- **Discovery paralysis: never exiting to Delivery.** The opposite of no Discovery is infinite Discovery. Teams that keep running "one more round of interviews" before committing are avoiding the hard decision of shipping. The four-risk framework provides the exit: when each risk is at an acceptable level (not zero), ship. The market will teach you what Discovery cannot.


- **Treating Discovery as a stage** — finish and enter Delivery without returning; Discovery is continuous.
- **Only PM does Discovery** — engineers don't know why they build it; cross-functional participation.
- **Not interviewing real users** — only asking internal sales / customer service; must reach real users.
- **Prototypes only test UI** — not testing value assumptions; test value first, then usability.
- **Deciding direction in one shot** — no continuous learning; weekly assumption + continuous learning.
- **Not drawing opportunity tree** — learning gets lost; mandate drawing the tree + capturing.
- **Learning not entering Delivery** — knowing what not to do; write Discovery conclusions into PRD.

## Related
- Same class: [dual-track-agile-summary.md](./dual-track-agile.md) (Discovery is one of the dual tracks); [jobs-to-be-done-summary.md](./jobs-to-be-done.md) (Discovery uses JTBD to identify opportunities); [rice-ice-prioritization-summary.md](./rice-ice-prioritization.md) (Discovery identifies opportunities, RICE sorts); [kano-model-summary.md](./kano-model.md) (Discovery validates demand types)
- Upstream: Teresa Torres, Marty Cagan, Lean Startup
- Downstream: YiAi BRD (1-2 user interviews per week + weekly assumption test + Miro/Notion opportunity tree)

## References
- Teresa Torres — *Continuous Discovery Habits* (2021)
- Marty Cagan — *Inspired* / *Empowered*
- leanstartup.co — *The Lean Startup*
