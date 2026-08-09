---
title: Sunk Cost Fallacy
aliases:
- Sunk Cost Fallacy
- Escalation of Commitment
tags:
- thinking
- methodology
- decision-making
- psychology
- project-management
category: knowledge-curator/templates/thinking
created: 2026-08-07
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
roles:
- engineer
- product-manager
- tech-lead
- ai-engineer
- knowledge-curator
- executive
- oncall-sre
- new-hire
benefit: Recognize when past investment is driving future decisions — and learn to walk away
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- opportunity-cost.md
- first-principles.md
- inversion.md
- second-order-thinking.md
- ../../../product-manager/frameworks/product-discovery-framework.md
tacit: false
---

# Sunk Cost Fallacy

> **As a** tech lead or engineering manager, **I want to** recognize and counteract the sunk cost fallacy in technical decisions, **so that** my team can walk away from failing investments and redirect resources to higher-value work.

> The tendency to continue investing in a project, technology, or approach because of prior investment, even when the expected future value is negative. The past is gone — only future costs and future benefits matter.

## Summary

- The sunk cost fallacy is the cognitive bias that makes people continue a failing course of action because they have already invested time, money, or effort — even when the rational choice is to stop.
- In engineering, it manifests as: continuing to maintain a legacy system because "we built it," persisting with a failing architecture migration because "we are 80% done," or refusing to abandon a feature that users do not want because "we spent 3 months on it."
- The psychological drivers are loss aversion (pain of admitting failure), commitment bias (public commitment makes reversal harder), and the endowment effect (we overvalue what we own).
- The antidote is a decision framework that ignores sunk costs entirely: evaluate every decision based on future costs and future benefits only, as if starting from zero today.
- Organizations that normalize the "kill decision" as a success (learning was acquired, resources were freed) rather than a failure (project died) systematically outperform those that do not.

## Core viewpoints

### 1. The past is irrelevant to future decisions
Every architecture decision, every project commitment, and every technology choice should be evaluated on one question only: "from this point forward, will the future benefits exceed the future costs?" The 6 months already spent on the microservices migration, the $500K already invested in the internal platform, the 3 sprints already spent on the feature — none of it matters. The only thing that matters is: given where we are today, what is the best next step? This is intellectually simple and emotionally brutal.

### 2. Kill decisions are the hardest and most valuable decisions
The most important decision an engineering leader makes is not what to start, but what to stop. Every active project, system, and initiative consumes maintenance attention, cognitive load, and opportunity cost. A project that is 80% complete but has no path to value should be killed — the 80% sunk cost is irrelevant. The 20% remaining effort could be redirected to something with positive expected value. The best engineering organizations institutionalize "kill criteria" — pre-defined conditions under which a project will be stopped, decided before the project starts, when emotions are not involved.

### 3. The organizational psychology of sunk costs
Teams resist killing projects not because they believe the project will succeed, but because they fear the social and career consequences of admitting failure. Engineers fear being labeled as "the person who worked on the failed project." Managers fear looking indecisive. Organizations that punish failure create a powerful incentive to double down on failing projects. The fix is cultural: celebrate well-reasoned kill decisions. Publicly acknowledge that the team made the right call with the information available, and that stopping was the smart move.

### 4. Legacy systems are the ultimate sunk cost trap
"We have 2 million lines of code in this monolith — we cannot rewrite it." This is the sunk cost fallacy in its most expensive form. The 2 million lines are a sunk cost. The question is not "how much did we invest in this system?" but "what is the future cost of maintaining it vs. the future cost of replacing it?" The maintenance cost includes not just engineering hours, but the innovation drag, the hiring difficulty (nobody wants to work on legacy tech), and the competitive disadvantage. Many teams would be better off starting a parallel greenfield system and gradually migrating, rather than continuing to invest in the monolith.

### 5. The 0-based reset as a decision hygiene practice
Periodically (quarterly for active projects, annually for systems), force a 0-based re-evaluation: "if we did not have this project/system/feature today, would we start building it now?" If the answer is no, the project should be on a kill watchlist. This framework is used by Amazon for internal services (the "API as product" mentality forces services to justify their existence continuously) and by Netflix for microservices (services that cannot demonstrate active usage are deprecated).

## Key info

### Recognition patterns — is this sunk cost driving your decision?

Ask yourself these questions about any ongoing investment:

1. **"Would I start this project today if I were not already invested in it?"** — If no, sunk cost is at play.
2. **"Am I continuing because I believe the future value is positive, or because I do not want the past investment to be wasted?"** — If the latter, sunk cost.
3. **"What would I recommend if this were someone else's project?"** — Distance yourself and see if the answer changes.
4. **"Is the primary argument for continuing 'we have come too far to stop now'?"** — This is the textbook sunk cost argument.
5. **"Have the original assumptions that justified this project changed?"** — If yes, re-evaluate; the sunk cost is irrelevant.

### How to make kill decisions

1. **Pre-commit to kill criteria**: define specific, measurable conditions that will trigger a project stop — e.g., "if we do not have 100 active users by month 3," or "if the migration is not 50% complete by Q2."
2. **Separate the decision from the decider**: have a person or group not emotionally invested in the project make the kill decision. This is why investment committees exist in finance — the same principle applies to engineering portfolios.
3. **Frame the kill as a success**: the project delivered learnings. The team acquired skills. The resources can now be redirected to higher-value work. The kill decision itself was a display of good judgment.
4. **Sunset with dignity**: give the team a proper retrospective, extract and document the learnings, and celebrate the decision to stop. Do not let the project quietly fade — that erases the learning.
5. **Redirect immediately**: the team should have a clear next assignment before the kill decision is announced. This reduces the emotional sting and reinforces that the kill is about resource optimization, not punishment.

### Sunk cost in different engineering contexts

| Context | Sunk Cost Trap | Rational Response |
|---|---|---|
| Legacy system | "We built it, we maintain it" | Compare future maintenance cost vs. future replacement cost |
| Failed migration | "We are 80% done, just a bit more" | The 80% is gone; is the remaining 20% worth the expected benefit? |
| Unused feature | "We spent 3 months on it" | The 3 months are gone; the question is whether to spend more on adoption |
| Wrong technology choice | "We already trained the team" | Training cost is sunk; compare future productivity on old vs. new tech |
| Internal platform | "We invested $500K in building it" | The $500K is sunk; compare future cost of running it vs. alternatives |

## Action recommendations

1. For every active project, run a quarterly 0-based evaluation: "if we were not already doing this, would we start today?"
2. Define kill criteria before starting any project — specific, measurable conditions that trigger a hard stop, written when emotions are not involved.
3. Assign a "devil's advocate" role in project reviews whose explicit job is to argue for killing the project, forcing the team to confront sunk cost reasoning.
4. Celebrate kill decisions publicly — frame them as demonstrations of good judgment and resource discipline, not as failures.
5. When maintaining legacy systems, calculate the total cost of ownership including innovation drag, hiring difficulty, and competitive disadvantage — not just the engineering maintenance cost.
6. Build a "project graveyard" — a visible list of killed projects with the learnings extracted, normalizing the idea that stopping is a normal and valuable part of the process.

## Anti-patterns

- **Confusing persistence with sunk cost**: persistence is continuing because the future value is positive despite setbacks. Sunk cost is continuing because the past investment justifies it. The distinction is in the forward-looking rationale.
- **Killing too early**: the sunk cost fallacy is about ignoring past costs, not about ignoring future potential. A project that is struggling but has a clear path to value should not be killed just because it is hard.
- **Using sunk cost as a weapon**: "we should kill your project because of sunk cost" can be used politically to undermine. The analysis must be based on future value, not on discrediting past investment.
- **Ignoring the cost of killing**: killing a project has real costs — team morale, knowledge loss, stakeholder confidence. These are future costs, not sunk costs, and they should be factored into the decision.
- **Treating all past investment as sunk cost**: some past investment creates assets that have future value (a trained team, a reusable library, institutional knowledge). These are not sunk — they are assets. The fallacy is about costs that cannot be recovered, not about assets that retain value.

## Related

- Same class: [opportunity-cost.md](./opportunity-cost.md) (every hour spent on a sunk-cost-driven project is an hour not spent on the best alternative); [first-principles.md](./first-principles.md) (decompose to fundamentals to see whether the original rationale still holds); [inversion.md](./inversion.md) (invert the problem: what would make us kill this project?); [second-order-thinking.md](./second-order-thinking.md) (the second-order effect of not killing a failing project is compounding resource drain).
- Upstream: Daniel Kahneman and Amos Tversky — prospect theory and loss aversion; Richard Thaler — mental accounting.
- Downstream: [../../../product-manager/frameworks/product-discovery-framework.md](../../../product-manager/frameworks/product-discovery-framework.md) (discovery should validate before large sunk costs accumulate).

## References

- Daniel Kahneman — *Thinking, Fast and Slow* (loss aversion, prospect theory, and the sunk cost fallacy)
- Richard Thaler — *Misbehaving: The Making of Behavioral Economics* (mental accounting and sunk costs)
- Hal Arkes and Catherine Blumer — "The Psychology of Sunk Cost" (1985, the foundational paper)
- Annie Duke — *Quit: The Power of Knowing When to Walk Away*