---
title: inversion thinking (Inversion)
aliases:
- Inversion
- Invert Always Invert
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
- first-principles.md
- second-order-thinking.md
- ockhams-razor.md
- strong-opinions-loosely-held.md
tacit: false
---

# inversion thinking (Inversion)

> **As a** knowledge curator, **I want to** apply inversion thinking, **so that** I can solve problems by working backwards from the desired outcome.

> Rather than asking "how to achieve the goal", ask "how to ensure failure", list what to avoid, and reverse-engineer action principles.

## Summary
- Originates from the Stoic school, popularized by Charlie Munger: "Tell me where I will die, and I won't go there."
- Five steps: clarify the goal → inversely ask how to fail → list failure paths → invert into action principles → design guardrails.
- Applicable when: the goal is vague or risk is high, the decision has strongly asymmetric losses, long-term projects to avoid chronic death, or the team is stuck in active discussion without action.
- Pre-mortem is an applied form of inversion thinking: assume failure has occurred, reverse-engineer root causes.
- Anti-patterns: only invert without forward thinking, list but never act, failure paths too vague, list once and never update.

## Core viewpoints

**Inversion is the thinking tool for asymmetric-loss decisions.** When the cost of being wrong is much larger than the benefit of being right, forward thinking ("how do we succeed?") is insufficient because it systematically underestimates failure modes. Inversion ("how do we fail?") surfaces the scenarios that forward thinking misses. This is why inversion is the standard pre-mortem tool for product launches, security audits, and regulatory compliance -- domains where a single failure can wipe out a hundred successes.

**The quality of an inversion exercise is determined by the specificity of the failure paths.** "The project could fail due to bad management" is not a failure path; it is a category. An actionable failure path is: "The project could fail because the frontend team's velocity drops 50% when the backend API changes its authentication scheme mid-sprint, and the frontend team lead is not in the API design review." The test: can you write a specific guardrail that prevents this exact failure?

**Inversion without forward thinking produces risk-averse paralysis.** A team that only lists failure modes and never defines what success looks like will optimize for not failing rather than for winning. The output is a list of things not to do, which is necessary but not sufficient. Inversion is the defense; forward thinking is the offense. Both are required for a complete strategy.

**Pre-mortem is the highest-ROI application of inversion because it bypasses the planning fallacy.** The planning fallacy (people underestimate how long things will take and overestimate how well they will go) is nearly impossible to correct through forward planning alone. A pre-mortem ("assume the project failed 6 months from now; write down why") bypasses the optimism bias by framing the failure as having already occurred. The psychological distance from "this might fail" to "this has failed" is the difference between acknowledging a risk and preventing it.


- **Inversion thinking finds risk more easily than forward thinking** — humans are good at imagining how to fail, not how to succeed.
- **The opposite of a failure path = action list** — don't just list risks, convert each into an executable action.
- **Pre-mortem is the standard application of inversion thinking** — assume failure 6 months later, each team member writes causes, sort by frequency and impact.
- **Complementary to first principles** — forward break down base facts + reverse avoid failure, two-way pincer.
- **Quarterly review** — new failure modes keep emerging; list once and never update equals ritual.

## Key information

### Model definition

Inversion thinking: rather than asking "how to achieve the goal", ask "how to ensure failure". List what to avoid, and reverse-engineer action principles.

Originates from the Stoic school (Seneca, Marcus Aurelius) and Stoic negative visualization, popularized by Charlie Munger: "Tell me where I will die, and I won't go there" — Jacobi's "always invert" (invert, always invert).

### Usage steps

1. **Clarify the goal**: what to achieve?
2. **Inversely ask**: how to make it fail?
3. **List failure paths**: exhaust failure possibilities (attention / resources / collaboration / time)
4. **Invert into action principles**: the opposite of a failure path = action list
5. **Design guardrails**: set failure paths as red lines, stop on contact

### Cases

**Project success**

- Reverse: possible project failures
  - Unclear requirements
  - Loss of key personnel
  - Over-optimistic schedule estimates
  - Upstream dependencies delayed
  - No acceptance criteria
- Action principles:
  - Develop only after requirement review passes
  - Backup key personnel
  - Add 1.5x buffer to schedule
  - Upstream contract with explicit SLA
  - Write acceptance criteria in PRD

**Personal growth**

- Reverse: how to ensure mediocrity 5 years from now
  - Don't read
  - Don't retrospect
  - Don't maintain network
  - Refuse new responsibilities
- Action principles: read daily, weekly retrospective, monthly contact old colleagues, quarterly proactively take work

**YiAi BRD launch**

- Reverse: possible failures of the BRD generation system launch
  - Hallucination rate above 20%, customer complaints
  - Multilingual terminology drift
  - Inference service timeout
  - Users don't know how to use it
- Action principles: faithfulness monitoring + terminology lock + inference service isolation + user guidance

### Pre-mortem process (an application of inversion thinking)

1. Assume the project has failed (6 months later)
2. Each team member writes failure causes (5 minutes)
3. Merge and aggregate, sort by frequency and impact
4. Prioritize top 3 risks
5. Quarterly review, update risk list

### Applicable scenarios

- Vague goal or high risk, no entry point for forward thinking
- Decision with strongly asymmetric losses (large loss if wrong)
- Long-term project, to avoid chronic death
- Team stuck in "active discussion" without action

## Action recommendations
1. Do a Pre-mortem before major decisions: assume failure 6 months later, each person writes causes for 5 minutes.
2. Merge failure paths, score by frequency × impact, handle top 3.
3. Invert each failure path into an executable action principle (not a risk list, an action list).
4. Set high-risk paths as red lines, stop on contact (e.g., hallucination rate > 20% immediately offline).
5. Combine forward and reverse: reverse avoid failure + forward define goal.
6. Quarterly review, update failure modes (new risks keep emerging).
7. Break failure paths down to observable actions, not vague "bad management".

## Anti-patterns

**Listing failure paths but never converting them into guardrails.** The inversion exercise produces a list of 20 ways the project could fail. The team nods, files the document, and proceeds exactly as before. The value of inversion is not in identifying risks -- it is in the guardrails that prevent them. Every failure path in the top 3 (by probability x impact) must have a corresponding guardrail that is: specific, observable, and assigned to an owner. Without guardrails, inversion is intellectual entertainment.

**Running a pre-mortem with the same group that did the forward planning.** The people who designed the plan are the least qualified to identify its failure modes because they are invested in the plan's success. A pre-mortem should include people from adjacent teams, people who will inherit the system in production, and people who have seen similar projects fail. The outsider perspective is the whole point.

**Treating the pre-mortem as a one-time ritual at project kickoff.** A pre-mortem at the start of a 12-month project captures the failure modes the team can imagine before any work has been done. It does not capture the failure modes that emerge from implementation surprises, personnel changes, or market shifts. The pre-mortem must be revisited quarterly, with each iteration adding newly discovered failure modes and retiring ones that are no longer relevant.

**Creating failure paths so vague that they cannot be actioned.** "Poor communication" is not a failure path. "The backend team changes the API contract without notifying the frontend team, and the change is discovered during integration testing 3 weeks later, causing a 2-week schedule slip" is a failure path. The specificity rule: if you cannot write a guardrail that prevents the failure, the failure path is too vague.

**Using inversion to justify pessimism and inaction.** Inversion is a risk-management tool, not a personality trait. A team that uses inversion to shoot down every proposal ("that could fail because...") without proposing mitigations is not practicing inversion thinking -- it is practicing learned helplessness. The correct response to a failure path is: "Given this risk, here is the guardrail, and here is why the expected value of proceeding is still positive."


- **Only invert without forward thinking** — know what not to do, not what to do; combine both.
- **List but never act** — inversion thinking becomes ritual; turn each failure into action.
- **Failure paths too vague** — "bad management"; break down to observable actions.
- **List once and never update** — new failure modes not discovered; quarterly review.

## Related
- Same class: [first-principles-summary.md](./first-principles.md) (forward break down base facts ↔ reverse avoid failure, complementary); [second-order-thinking-summary.md](./second-order-thinking.md) (reverse think long-term consequences); [ockhams-razor-summary.md](./ockhams-razor.md) (eliminate unnecessary assumptions); [strong-opinions-loosely-held-summary.md](./strong-opinions-loosely-held.md) (reverse-find counter-evidence when updating judgments)
- Upstream: Stoic philosophy (Seneca / Marcus Aurelius), Charlie Munger
- Downstream: project Pre-mortem, product launch risk assessment

## References
- Charlie Munger — *Poor Charlie's Almanack*
- Stoic Philosophy — Seneca *Letters from a Stoic*
- Gary Klein — *Performing a Project Premortem* (Harvard Business Review, 2007)
