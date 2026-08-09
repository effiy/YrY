---
title: First Principles Thinking
aliases:
- First Principles Thinking
tags:
- thinking
- methodology
- decision-making
category: knowledge-curator/templates/thinking
created: 2026-07-31
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
last_verified: 2026-08-07
review_cycle: yearly
roles:
- engineer
- product-manager
- tech-lead
- ai-engineer
- knowledge-curator
- executive
- oncall-sre
- new-hire
benefit: Knowledge curators can apply this thinking model to structure decisions and avoid cognitive biases
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- inversion.md
- second-order-thinking.md
- ockhams-razor.md
- ../../../product-manager/frameworks/product-discovery-framework.md
tacit: false
---

# First Principles Thinking

> **As a** knowledge curator, **I want to** apply first-principles thinking, **so that** I can break down complex problems into fundamental truths and rebuild from there.

> Decompose a problem into irreducible foundational facts, then reason upward from those facts rather than relying on analogy and existing practice.

## Summary
- Originated with Aristotle, popularized by Elon Musk through SpaceX / Tesla decisions.
- Five steps: identify assumptions → question them → decompose to the irreducible → rebuild from the foundation → compare against reality.
- Applicable to: long-term decisions, situations with strong inertia where the "why" is hard to explain, when differentiated judgment is needed, when diagnosing root causes in complex systems.
- Anti-patterns: treating convention as fact, decomposing too finely and wasting time, decomposing without landing, rejecting analogy (analogy is a starting point, not the end).

## Core viewpoints

**First principles thinking is the highest-leverage and most expensive thinking tool.** It produces breakthroughs that analogy cannot reach (SpaceX rockets, Tesla battery costs, YiAi API-first architecture), but it consumes enormous cognitive effort and domain expertise. The cost-benefit calculus is: use it for decisions with high irreversibility and high capital commitment; use analogy or heuristics for everything else. A team that applies first principles to every decision will produce brilliant analysis and zero output.

**The "irreducible" in "decompose to the irreducible" is the hardest judgment call.** Decompose too little and you are still reasoning from convention. Decompose too much and you hit physics-level truths that are useless for decision-making (yes, everything is made of atoms, but that does not help you choose a database). The right stopping point is the level where the remaining facts are directly actionable for the decision at hand. For a rocket cost decision, the irreducible fact is "aluminum costs $X/kg," not "aluminum is made of atoms."

**Domain expertise is the hidden prerequisite that makes first principles work.** Musk could decompose rocket costs because he understood aerospace engineering. Applying first principles to a domain you do not understand produces confident-sounding nonsense. The five-step method (identify assumptions, question them, decompose, rebuild, compare) assumes you can distinguish a fact from a convention from a misunderstanding. In an unfamiliar domain, you cannot.

**First principles and analogy are complementary, not opposing.** The popular framing ("first principles good, analogy bad") is wrong. Analogy is a fast, cheap, and often correct heuristic for decisions where the cost of being wrong is low. First principles is for decisions where the cost of being wrong is high. The skill is not in choosing one over the other but in knowing which decision requires which tool.


- **Reason upward from foundational facts rather than analogizing to existing practice** — analogy drives convergence; foundational reasoning produces differentiation.
- **"Taken for granted" is usually inertia** — question every assumption; distinguish facts, conventions, and inertia.
- **Effective only when decomposed to the irreducible** — incomplete decomposition leaves you in inertia; ask "why" more often.
- **After decomposition you must rebuild from the foundation and compare with reality** — without comparison it is pure speculation.
- **Not applicable to every decision** — small matters do not need first principles; the finer the decomposition, the greater the domain knowledge required.

## Key information

### Model definition

First principles thinking: decompose a problem into irreducible foundational facts (first principles), then reason upward from those facts instead of relying on analogy and existing practice.

Originated with Aristotle, popularized by Elon Musk through SpaceX and Tesla decisions. "I tend to start from first principles rather than analogy" — when Musk explained rocket costs, he did not ask "how much does a rocket on the market cost," but "how much are the raw materials that make up a rocket worth."

### Usage steps

1. **Identify current assumptions**: list every "taken for granted" the status quo rests on.
2. **Question each assumption**: is it a fact, a convention, or inertia?
3. **Decompose to the irreducible**: keep only true facts, extract the most foundational physical / economic / mathematical facts.
4. **Rebuild from the foundational facts**: if we started from zero today, how would we solve it?
5. **Compare**: foundational reasoning vs. analogy — where are the differences?

### Cases

**SpaceX rockets**

- Analogy: a market rocket launch costs $65M → reduce cost somewhat through reuse.
- First principles: rocket materials = aluminum / titanium / copper / carbon fiber; cost by weight = 2% of a launch cost → recoverable.
- Decision: build reusable rockets in-house.

**YiAi BRD (illustrative case)**

- Analogy: copy ChatGPT's conversational UI + template fill-in-the-blanks.
- First principles: the BRD core is structured business requirements + multilingual + approval-friendly; it can be done without conversation → CLI / API first.
- Decision: build the API and template library first; conversational UI is the second step.

### Applicable scenarios

- Long-term decisions (large capital commitment, expensive to pivot).
- Situations with strong inertia where the "why" cannot be explained.
- Analogy-driven convergence, where differentiated judgment is needed.
- Diagnosing root causes in complex systems.

### Notes

- Applicable scope is limited; small matters do not need first principles.
- The finer the decomposition, the greater the domain knowledge required; unfamiliar domains are easy to decompose incorrectly.
- After decomposition, verify whether the foundational facts are truly "foundational" to avoid unfounded reasoning.

## Action recommendations
1. List every "taken for granted" assumption in the status quo; distinguish facts / conventions / inertia.
2. Ask "why" five times to decompose to irreducible physical / economic / mathematical facts.
3. Rebuild a solution from the foundational facts: if we started from zero today, how would we solve it?
4. Compare the foundational plan vs. the analogy plan; where are the differences?
5. Use for big decisions (large capital, expensive pivot); skip for small matters.
6. In unfamiliar domains, build domain knowledge first; otherwise decomposition will likely be wrong.
7. After decomposition you must compare against reality and land; avoid unfounded reasoning.

## Anti-patterns

**Applying first principles to every decision regardless of stakes.** The cognitive overhead of decomposing a problem to its irreducible facts is justified for decisions with large capital commitment, high irreversibility, or strong inertia. It is not justified for choosing a meeting time, a code formatter, or a lunch venue. Teams that insist on "first principles everything" create analysis paralysis disguised as intellectual rigor.

**Decomposing without the domain expertise to know what is actually irreducible.** An engineer new to a domain who "decomposes" a problem to "irreducible facts" will produce a list of misconceptions dressed as fundamentals. The output looks rigorous (numbered steps, confident assertions) but is built on sand. First principles in an unfamiliar domain requires first building domain knowledge, not first decomposing.

**Confusing "questioning assumptions" with "rejecting all existing practice."** The goal is to distinguish facts from conventions, not to discard conventions. Some conventions exist for good reasons that survive first-principles scrutiny (use version control, write tests, encrypt PII). Rejecting a convention because it is "just a convention" without understanding why it became a convention is arrogance, not first principles thinking.

**Decomposing but never rebuilding.** The five-step method fails at step 4 when teams produce a beautiful decomposition of the problem and then... stop. The decomposition is the input to reasoning, not the output. If you have not proposed a concrete solution that is different from the conventional one and can explain why it is better, you have not done first principles thinking -- you have done philosophical navel-gazing.

**Treating first principles as a solo activity.** The person who decomposes the problem is the least qualified to check whether their decomposition is correct. First principles thinking requires a challenger: someone who asks "is that really irreducible?" and "what about this assumption you did not list?" Solo first principles produces internally consistent but externally unmoored reasoning.


- **Treating convention as fact** — incomplete decomposition leaves you in inertia; ask "why" more often.
- **Decomposing too finely and wasting time** — first principles is not for every decision; reserve it for big decisions.
- **Not comparing with reality** — decomposed but never landed; rebuild a plan from the foundational facts.
- **Rejecting analogy** — analogy is sometimes optimal; analogy is only the start, not the end.

## Related
- Same class: [inversion-summary.md](./inversion.md) (forward decomposition to fundamentals ↔ backward avoidance of failure; complementary); [second-order-thinking-summary.md](./second-order-thinking.md) (after decomposing to fundamentals, trace multi-step consequences); [ockhams-razor-summary.md](./ockhams-razor.md) (for the same phenomenon, prefer the explanation with the fewest assumptions).
- Upstream: Aristotelian physics, Tom Chi on innovation.
- Downstream: [../../../product-manager/frameworks/product-discovery-framework.md](../../../product-manager/frameworks/product-discovery-framework.md) (product discovery needs to decompose the essence of the problem).

## References
- Aristotle — *Physics* and *Metaphysics*
- Elon Musk interviews on SpaceX founding
- Tom Chi — *The Skill of Innovation* (TEDx)
