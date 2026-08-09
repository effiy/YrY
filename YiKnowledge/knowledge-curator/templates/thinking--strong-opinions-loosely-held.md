---
title: Strong Opinions, Loosely Held
aliases:
- Strong Opinions Loosely Held
- SOLH
tags:
- thinking
- methodology
- decision-making
- collaboration
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
- inversion.md
- ockhams-razor.md
- flywheel-effect.md
tacit: false
---

# Strong Opinions, Loosely Held

> **As a** knowledge curator, **I want to** practice strong opinions loosely held, **so that** I can make decisive judgments while remaining open to new evidence.

> Start with a strong opinion, but hold an open mind toward disconfirming evidence; it is neither timidity nor stubbornness — it is evidence-backed judgment + timely updating.

## Summary
- Proposed by Paul Saffo, popularized by Marc Andreessen and Ben Horowitz.
- Six steps: form a clear opinion → clarify assumptions and evidence → express publicly → actively seek disconfirmation → update when disconfirmation appears → do not feel embarrassed about changing your mind.
- Applicable to: high-uncertainty decisions, continuously evolving information, cross-team alignment, personal growth.
- ADR is the landing form of this pattern: current decision + assumptions + falsifiable signals + review checkpoint.
- Anti-patterns: strong opinions strongly held (stubbornness), weak opinions weakly held (no opinion), strong opinions without evidence (intuition), changing judgments without public disclosure, frequently changing judgments.

## Core viewpoints

**The "strong" in "strong opinions" refers to the quality of evidence, not the volume of conviction.** A strong opinion is one backed by clear logic, explicit assumptions, and falsifiable predictions. It is not "I feel strongly about this." The distinction matters because the former is updatable (the evidence changes, the opinion changes) while the latter is not (the feeling persists regardless of evidence). Conviction without evidence is not a strong opinion; it is a bias.

**The "loosely held" is the hard part that separates this from ordinary decision-making.** Anyone can form a strong opinion. The discipline is in specifying, in advance, what evidence would change your mind, and then actually changing your mind when that evidence appears. This is psychologically difficult because changing your mind feels like admitting you were wrong, which triggers ego defense. The organizations that practice SOLH effectively have cultures where changing your mind in response to evidence is celebrated, not penalized.

**ADR is the minimum viable structure for practicing SOLH in a team.** An ADR that records: (a) the decision, (b) the assumptions it rests on, (c) the alternatives considered, and (d) the falsifiable signals that would trigger reconsideration -- this is SOLH operationalized. Without the falsifiable signals, the ADR is just a strong opinion. Without the decision, it is just analysis. The ADR format forces both the "strong" and the "loosely held" components.

**The most dangerous quadrant is not "strong opinions, strongly held" -- it is "weak opinions, strongly held."** Stubbornness with a strong opinion is at least coherent and can be debated. Stubbornness with a weak opinion ("I do not really know why we use this framework, but I will fight to keep it") is immune to both evidence and logic because there is no reasoning to engage with. This is the most common failure mode in organizations with high tenure and low intellectual curiosity.


- **Strong opinion ≠ stubbornness** — A strong opinion must be backed by evidence and logic, not intuition.
- **Loosely held ≠ no opinion** — Loosely held means updating when disconfirming evidence appears, not being capricious.
- **Falsifiability is the core** — You must specify "what data appearing would flip my call", otherwise it is just stubbornness.
- **Changing judgment must be public** — Secretly changing direction leaves the team behind; explicitly state "previously based on X, new data is Y, new judgment is Z".
- **Quarterly retrospective on historical judgment accuracy** — calibrate confidence, avoid being consistently wrong or right without realizing it.

## Key information

### Model definition

Proposed by Paul Saffo (VC and forecaster), popularized by Marc Andreessen and Ben Horowitz. Core proposition:

> **Start with a strong opinion, but hold an open mind toward disconfirming evidence.**

It is neither the timidity of "I don't know either" nor the stubbornness of "this is just what I think", but rather:
- The current judgment must have clear logic and evidence, not vague
- When disconfirming evidence appears, change the judgment promptly
- Changing the judgment should not bring shame, but is updating based on better information

### Usage steps

1. **Form a clear opinion**: Support a judgment with evidence and logic
   - Example: "BRD multi-language generation should use the same prompt + a multilingual glossary, rather than per-language prompts"
2. **Clarify assumptions and evidence**: What assumptions am I based on? What evidence would overturn it?
3. **Express publicly**: Let the team know your judgment and reasoning
4. **Actively seek disconfirmation**: Track signals that might overturn the judgment
5. **Update promptly when disconfirmation appears**: Explicitly state "my previous judgment was based on X, new data is Y, new judgment is Z"
6. **Do not be embarrassed by changing judgment**: Updating is the ability to act on new information, not caprice

### Distinguishing related concepts

| Concept | Meaning | Distinction |
|---|---|---|
| Strong opinions, loosely held | Strong opinion + loose hold | decision pattern |
| Strong opinions, weakly held | Weak opinion + weak hold | = no opinion |
| Weak opinions, strongly held | Weak opinion + strong hold | = stubbornness (worst combo) |
| Strong opinions, strongly held | Strong opinion + strong hold | = hard to pivot, OK in startup phase, risky in growth phase |

### Practicing in a team

- **Decision records**: Write an ADR for each decision, including background, assumptions, decision, falsifiable signals
- **Falsifiable**: Explicitly state "what data appearing would flip it"
- **Retrospective**: Review historical judgment accuracy quarterly, calibrate confidence
- **Encourage opposition**: Welcome the team challenging the mainstream judgment, but require evidence

### Cases

**Tech selection**

- Current judgment: "Use vLLM to deploy the LLM, because the ecosystem is mature and easy to use"
- Assumption: Active community, fast stable-version iteration, low internal maintenance threshold
- Falsifiable: If vLLM repeatedly shows stability regressions / an alternative (SGLang) demonstrates significant advantages
- Tracking signals: version release notes, SLA monitoring, internal team feedback
- After half a year, if SGLang shows advantages → update judgment

**Team management**

- Current judgment: "Frontend chooses React 18 + Ant Design 5, because the ecosystem is mature"
- Assumption: Antd 5 long-term maintenance, React 18 compatibility stable
- Falsifiable: If Vue 3 + Element Plus shows significant advantages in our scenario

### Relation to ADR

ADR (Architecture Decision Records) is the landing form of this pattern:

- Current decision (strong opinion)
- Assumptions and constraints the decision is based on
- What change would overturn the decision (loosely held)
- Review checkpoint

### Applicable scenarios

- High-uncertainty decisions (new product direction, tech selection)
- Continuously evolving information (market changes, model iteration)
- Cross-team alignment (avoid being opinionless and avoid rigidity)
- Personal growth (avoid being trapped by past judgments)

## Action recommendations
1. Write an ADR for every important decision: background + assumptions + decision + falsifiable signals + review checkpoint.
2. Strong opinions must list evidence and assumptions; "intuition" is not accepted as an opinion.
3. Specify falsifiable signals: what data appearing would flip it.
4. Express judgment and reasoning publicly, so the team can challenge.
5. When disconfirmation appears, explicitly and publicly update: "previously based on X, new data Y, new judgment Z".
6. Limit update frequency (weekly / monthly) to avoid caprice.
7. Quarterly retrospective on historical judgment accuracy, calibrate confidence.

## Anti-patterns

**Using "strong opinions, loosely held" as a license for intellectual bullying.** "I have a strong opinion that we should rewrite the entire backend in Rust" -- stated loudly, with no evidence, and when challenged, the response is "I am loosely held, convince me otherwise." This shifts the burden of proof to the challenger while the opinion-holder contributes nothing. SOLH requires the opinion-holder to provide the evidence and logic; the "loosely held" means they must be open to counter-evidence, not that they are exempt from providing evidence in the first place.

**Changing opinions without publicly documenting the update.** The team aligned on decision X in March. In June, the lead unilaterally shifts to Y without explaining why. When asked, the response is "new information came in." This is not SOLH -- it is capricious leadership. The update must be explicit: "In March we decided X based on assumptions A, B, C. New data shows B is false. Therefore we are now deciding Y." The public update is what keeps the team aligned and builds trust in the decision-making process.

**Equating "loosely held" with "no opinion."** "I am loosely held" becomes an excuse for never forming a clear position. When asked for a recommendation, the response is "well, it depends, there are pros and cons on both sides." This is not SOLH -- it is decision avoidance. SOLH requires having a specific, evidence-backed recommendation. The "loosely held" is about what happens after the decision, not before it.

**Frequently changing opinions to the point where no decision is stable long enough to execute.** If the team's tech stack changes every month because the lead has a new "strong opinion" each time a blog post is published, the organization cannot ship anything. SOLH requires a minimum stability period for each decision. The update frequency should be on the order of months, not days, and major reversals should be rare events triggered by significant evidence, not minor data points.

**Retrospecting on judgment accuracy without calibrating future confidence.** The quarterly retrospective reveals that the team's predictions were 60% accurate. The team notes this and moves on. The missing step: if your accuracy is 60%, your confidence in future predictions should be calibrated to 60%. A team that is 60% accurate but expresses 90% confidence in every decision is not practicing SOLH -- it is practicing self-deception.


- **Strong opinion strongly held** — stubbornness, refuses disconfirmation; list signals that would change the judgment.
- **Weak opinion weakly held** — no opinion, follows the mainstream; force yourself to write "my judgment is...".
- **Strong opinion but no evidence** — it is intuition, not an opinion; list evidence and assumptions.
- **Changing judgment without disclosure** — secretly switching direction, the team cannot follow; publicly update with reasoning.
- **Frequently changing judgment** — caprice, no real judgment; limit update frequency (weekly / monthly).

## Related
- Same class: [first-principles-summary.md](./first-principles.md) (decompose to base facts to form a strong opinion); [inversion-summary.md](./inversion.md) (reverse-look for disconfirmation); [ockhams-razor-summary.md](./ockhams-razor.md) (simple assumptions as starting point, switch when evidence overturns); [flywheel-effect-summary.md](./flywheel-effect.md) (the flywheel of continuous updating)
- Upstream: Paul Saffo, Marc Andreessen, Ben Horowitz
- Downstream: team ADR, tech selection, quarterly retrospective mechanism

## References
- Paul Saffo — *Six Rules for Effective Forecasting* (HBR, 2007)
- Marc Andreessen — *The Pmarca Guide to Startups*
- Ben Horowitz — *The Hard Thing About Hard Things*
