---
title: Occam's Razor
aliases:
- Occam's Razor
- Ockham's Razor
tags:
- thinking
- methodology
- simplicity
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
- strong-opinions-loosely-held.md
- inversion.md
tacit: false
---

# Occam's Razor

> **As a** knowledge curator, **I want to** apply Occam's Razor to problem-solving, **so that** I can favor simpler explanations over complex ones when evidence is equal.

> Entities should not be multiplied beyond necessity; the version with the fewest assumptions wins when explaining the same phenomenon.

## Summary
- Proposed by William of Ockham in the 14th century; the razor is a tool, not a law — an a priori preference, not a conclusion.
- Five steps: list candidate explanations → count assumptions → prefer the fewest assumptions → do not lock in → keep verifying.
- Applicable: when multiple assumptions can explain, debug root causes, A/B exception attribution, system design selection, prefer the simpler option in decisions.
- Engineering counterparts: KISS (Keep It Simple, Stupid) + YAGNI (You Aren't Gonna Need It).
- Anti-patterns: simplifying to the point of distortion, forcing simplification without examining evidence, anti-razor, treating it as a law.

## Core viewpoints

**Occam's Razor is a heuristic for investigation priority, not a criterion for truth.** The razor says: investigate the simplest explanation first. It does not say: the simplest explanation is correct. When evidence supports a complex explanation, the razor is retired and the complex explanation wins. The most common misuse of the razor is treating it as a stopping rule: "this is the simplest explanation, therefore it is true, case closed." The razor tells you where to start looking, not when to stop.

**In engineering, Occam's Razor manifests as the YAGNI principle, and YAGNI is the hardest principle to follow.** Developers are trained to anticipate future needs. YAGNI ("You Aren't Gonna Need It") demands that they resist this instinct and build only what is needed now. The tension is real: sometimes you do need it later, and the refactor is expensive. But the actuarial math favors YAGNI: the probability that a specific anticipated future need will materialize in exactly the form you predicted is low, and the cost of building the wrong abstraction is higher than the cost of refactoring later.

**The razor is most valuable in debugging, where complexity explodes combinatorially.** A production incident has 50 possible causes. Investigating each one exhaustively is impossible. The razor says: sort by number of assumptions, investigate the simplest first. This is not laziness -- it is the optimal search strategy when the cost of investigation is non-trivial and the base rate of simple causes (network blip, recent deploy, config change) is much higher than complex causes (race condition, cosmic ray, kernel bug).

**The razor does not apply to systems that are inherently complex.** Biological systems, distributed systems under partition, quantum systems, and social systems are complex not because we have not found the simple explanation, but because the system itself is complex. Applying the razor here produces false simplicity -- explanations that are satisfying but wrong. The skill is knowing when you are in a domain where simplicity is a reasonable prior and when you are in a domain where complexity is the ground truth.


- **The explanation with the fewest assumptions wins, but it is not a conclusion** — the razor is an a priori preference; when evidence overturns the simple assumption, the complex assumption wins.
- **When a simple assumption is falsified, upgrade** — do not ignore evidence for the sake of simplicity.
- **Complex truths cannot be forced into simplification** — quantum physics, biological systems are inherently complex; the razor does not apply.
- **In engineering this corresponds to KISS + YAGNI** — do not abstract prematurely, do not add configuration for hypothetical needs, do not add fallbacks for impossible scenarios.
- **When debugging, look at simple assumptions before complex ones** — network jitter > complex race conditions > cosmic rays; investigate by probability.

## Key information

### Model definition

Proposed by William of Ockham in the 14th century: **Entities should not be multiplied beyond necessity**.

In plain terms: when explaining the same phenomenon, the version with the fewest assumptions wins.

### Usage steps

1. **List all candidate explanations**
2. **Count the assumptions each explanation requires**
3. **Prefer the explanation with the fewest assumptions**
4. **Do not lock in**: the razor is a tool, not a law; when evidence overturns a simple assumption, the complex assumption wins.
5. **Keep verifying**: continuously adjust based on evidence.

### Cases

**Service exception attribution**

- Explanation A: network jitter
- Explanation B: upstream service deployment
- Explanation C: complex race condition in a distributed system
- Explanation D: cosmic ray bit flip

Occam's razor: look at A and B first (single assumption); only consider C after they are ruled out; jumping straight to D without evidence is irrational.

**Product data drop**

- Explanation A: new-version regression
- Explanation B: external holiday
- Explanation C: complex user behavior change
- Explanation D: algorithm black box

Per the razor, check A and B first; only move to C / D when evidence does not support them.

**System design**

- Simple option: one queue + worker
- Complex option: distributed scheduler + multi-level queue + priority
- Razor: use the simple option until the traffic volume hits a bottleneck.

### Counterexamples: when not to use it

- The phenomenon is inherently complex (quantum physics, biological systems).
- The simple assumption has already been falsified.
- The complex assumption is strongly supported by evidence.

### KISS / YAGNI in engineering

- KISS (Keep It Simple, Stupid): Occam reflected in engineering.
- YAGNI (You Aren't Gonna Need It): do not design for future needs that may never arise.

In engineering practice:

- Do not abstract prematurely (three similar lines beats early abstraction).
- Do not add configuration for hypothetical needs.
- Do not add fallbacks for impossible scenarios.

### Applicable scenarios

- When multiple assumptions can all explain the phenomenon.
- Debugging root causes, A/B exception attribution.
- System design selection (avoid over-engineering).
- Preferring the simpler option in decisions.
- Academic and everyday judgment.

### Landing points

- Decision records should note "why the simple option was chosen."
- Complex options require strong evidence.
- When debugging, look at simple assumptions before complex ones.
- Consciously avoid over-engineering in system design.

## Action recommendations
1. When debugging / attributing, list all candidate explanations and sort by number of assumptions.
2. Verify the explanation with the fewest assumptions first; only upgrade to a complex assumption when evidence is insufficient.
3. Choose the simplest option first in system design; upgrade when a bottleneck appears.
4. Do not abstract prematurely: three similar lines beats early abstraction.
5. Do not add configuration for hypothetical needs; do not add fallbacks for impossible scenarios (YAGNI).
6. When a simple assumption is falsified, upgrade immediately; do not ignore evidence for the sake of simplicity.
7. In decision records, write "why the simple option was chosen"; complex options require strong evidence.

## Anti-patterns

**Using the razor to dismiss valid complexity without investigation.** "That explanation is too complicated, let us go with the simple one" -- stated before any investigation has occurred. This is not the razor; it is intellectual laziness. The razor says investigate the simple explanation first, not accept it without investigation. The distinction is the difference between a heuristic and a prejudice.

**Abstracting prematurely because "it will be cleaner."** Three similar lines of code do not justify an abstraction. The rule of three is a guideline, not a law, but it exists because premature abstraction is the most common engineering mistake. An abstraction created before the pattern is fully understood will be wrong in ways that are expensive to fix. Wait until the pattern is clear, then abstract.

**Refusing to adopt a complex solution when the simple one has been falsified.** The team tries the simple approach (single queue, single worker). It does not scale. The team tries to optimize the simple approach. It still does not scale. The team tries a third optimization. The correct response is to accept that the simple approach has been falsified and adopt the complex approach. The anti-razor fallacy is: "the simple approach did not work, therefore the complex approach must be the answer." No -- the complex approach must also be supported by evidence.

**Building configuration for hypothetical needs.** "We might need to switch database providers" → add an abstraction layer. "We might need to support multiple authentication methods" → build a plugin system. Each anticipated need adds complexity that must be maintained, tested, and understood by every new team member. The YAGNI principle says: if the need is not on the roadmap for the next quarter, do not build for it. The cost of the wrong abstraction is always higher than the cost of adding it later.

**Treating simplicity as an end in itself rather than a means to reliability and maintainability.** The goal is not to have the simplest possible system. The goal is to have a system that is reliable, maintainable, and correct. Simplicity serves these goals because simple systems have fewer failure modes and are easier to understand. But when simplicity conflicts with correctness (a simple algorithm that is wrong vs. a complex one that is right), correctness wins.


- **Simplifying to distortion** — a complex truth gets simplified away; the razor is a tool, not a conclusion.
- **Forcing simplification without examining evidence** — "it should be simple"; assumptions must be verified.
- **Anti-razor** — "if the simple one is wrong, it must be complex"; complexity also requires evidence.
- **Treating it as a law** — rejecting complex truths; the razor is only an a priori preference.

## Related
- Same class: [first-principles-summary.md](./first-principles.md) (breaks down basic facts to avoid redundant assumptions); [second-order-thinking-summary.md](./second-order-thinking.md) (second-order consequences of complex problems); [strong-opinions-loosely-held-summary.md](./strong-opinions-loosely-held.md) (start from simple assumptions, swap when evidence overturns them); [inversion-summary.md](./inversion.md) (eliminate unnecessary failure paths)
- upstream: William of Ockham, Karl Popper
- downstream: engineering KISS / YAGNI, debugging attribution, system design

## References
- William of Ockham — *Summa Logicae*
- Karl Popper — *The Logic of Scientific Discovery* (philosophical discussion of the simplicity principle)
- KISS principle: US Navy 1960 design principles
- YAGNI: Extreme Programming principle
