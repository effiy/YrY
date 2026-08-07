---
title: Learn PM frameworks
aliases:
- I want to learn PM methodology
- PM methodology entry
tags:
- journeys
- PM
- product-management
- framework
- methodology
category: engineer/lessons
created: 2026-08-03
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
roles:
- engineer
benefit: context is reachable
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ../../product-manager/frameworks/README.md
- ../../executive/strategy/README.md
- ../../product-manager/discovery/metrics/README.md
- ../../product-manager/discovery/ux/README.md
- ../../product-manager/discovery/prd/README.md
- ../../README.md
review_cycle: quarterly
tacit: false
---

# I want to learn PM frameworks

> **As an** engineer, **I want to** learn pm frameworks, **so that** context is reachable.

> "How PMs build products" — reach frameworks, templates, and team processes within 2 hops.

## Summary
- PM frameworks (RICE/JTBD/Kano/HEART-AARRR/OKR/dual-track agile) + product strategy + metrics + UX + PRD — five graphs
- Thinking models (first principles / inversion / second-order thinking, etc.) round out decision support
- Team processes (iteration PM handbook / requirement review / design review / sprint retrospective) as landing references

## Scenario
When a new PM onboards, runs requirement reviews, does quarterly planning, or lands dual-track agile, they need to quickly pull up frameworks, templates, and the team's established processes. This entry aggregates PM-related leaves under `methodology/pm-frameworks/`, `product/{strategy,metrics,ux,prd}/`, `methodology/thinking/`, and `work/processes/` into a 2-hop path.

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `../../product-manager/frameworks` | [rice-ice-prioritization-summary.md](../../product-manager/frameworks/rice-ice-prioritization.md) · [jobs-to-be-done-summary.md](../../product-manager/frameworks/jobs-to-be-done.md) · [kano-model-summary.md](../../product-manager/frameworks/kano-model.md) · [heart-aarrr-metrics-summary.md](../../product-manager/frameworks/heart-aarrr-metrics.md) · [okr-design-summary.md](../../product-manager/frameworks/okr-design.md) · [dual-track-agile-summary.md](../../product-manager/frameworks/dual-track-agile.md) · [agile-product-management-summary.md](../../product-manager/frameworks/agile-product-management.md) · [product-discovery-framework-summary.md](../../product-manager/frameworks/product-discovery-framework.md) |
| `../../executive/strategy` | [product-strategy-framework-summary.md](../../executive/strategy/product-strategy-framework.md) · [business-model-canvas-summary.md](../../executive/strategy/business-model-canvas.md) · [porter-five-forces-summary.md](../../executive/strategy/porter-five-forces.md) · [blue-ocean-strategy-summary.md](../../executive/strategy/blue-ocean.md) · [second-curve-summary.md](../../executive/strategy/second-curve.md) · [now-next-later-roadmap-summary.md](../../executive/strategy/now-next-later-roadmap.md) |
| `../../product-manager/discovery/metrics` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) |
| `../../product-manager/discovery/ux` | [nielsen-heuristics-summary.md](../../product-manager/discovery/ux/nielsen-heuristics.md) · [ai-product-ux-patterns-summary.md](../../product-manager/discovery/ux/ai-product-ux-patterns.md) · [cross-cultural-ux-summary.md](../../product-manager/discovery/ux/cross-cultural-ux.md) |
| `../../product-manager/discovery/prd` + `../../knowledge-curator/templates/prd.md` | [prd.md](../../knowledge-curator/templates/prd.md) |
| `../../knowledge-curator/templates/thinking` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) · [strong-opinions-loosely-held-summary.md](../../knowledge-curator/templates/thinking/strong-opinions-loosely-held.md) · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `../../engineer/collaboration-process` | [iteration-pm-handbook-summary.md](../process/iteration-pm-handbook.md) · [requirement-review-process.md](../../product-manager/delivery/requirement-review.md) · [design-review-process.md](../../product-manager/delivery/design-review.md) · [sprint-retrospective-template.md](../process/sprint-retrospective.md) |

## Core viewpoints

- **PM frameworks are not interchangeable tools -- they are lenses that reveal different dimensions of the same product**: RICE tells you what to build first; JTBD tells you why users need it; Kano tells you what will delight vs. disappoint; HEART/AARRR tells you whether it worked. Using only one framework is like diagnosing a patient with only a thermometer. The frameworks are complementary, and the skill is knowing which lens to apply to which question.

- **The North Star metric is the single most important decision a PM makes, and it is also the most frequently wrong**: A North Star metric that measures engagement (DAU) when the business model depends on conversion (revenue per user) will optimize the team toward the wrong behavior. The metric must capture the value exchange: what the user gets and what the business gets, in one number. If it does not, the team will optimize a proxy and wonder why revenue is not following.

- **Dual-track agile is not "design alongside development" -- it is the organizational recognition that discovery and delivery have different cadences, different success criteria, and different failure modes**: Discovery asks "should we build this?" and succeeds when it kills bad ideas quickly. Delivery asks "did we build it right?" and succeeds when it ships reliably. Merging these two tracks into one backlog creates a queue where discovery work is perpetually deprioritized in favor of delivery commitments.

- **The PRD is not a specification document -- it is a coordination document**: The primary audience of a PRD is not the engineering team (they need technical specs) but the cross-functional stakeholders (marketing, sales, support, legal) who need to align on what is being built, why, and when. A PRD that reads like a technical spec has failed its primary purpose. A PRD that every stakeholder can read and say "yes, that is what we agreed to build" has succeeded.

- **Thinking models (first principles, inversion, second-order thinking) are not optional supplements to PM frameworks -- they are the decision-making engine that the frameworks feed**: A framework tells you what to analyze; a thinking model tells you how to decide. When the RICE score says option A and the JTBD interview says option B, the frameworks have done their job. Resolving the conflict requires first-principles reasoning (what is the fundamental user need?), inversion (what would guarantee failure?), and second-order thinking (what happens after we ship?).

## Key info

- **PM framework comparison matrix (7 frameworks with application context)**: (1) RICE — Reach × Impact × Confidence / Effort; best for prioritizing features within a known roadmap; output: ranked list; limitation: confidence scores are subjective; (2) ICE — Impact × Confidence × Ease; simpler, faster version of RICE; best for quick prioritization; limitation: no reach dimension; (3) JTBD — "When [situation], I want to [motivation], so I can [outcome]"; best for understanding user needs before building; output: job statements; limitation: does not tell you what to build first; (4) Kano — basic/performance/excitement classification; best for feature scoping and MVP definition; output: feature categories; limitation: categories shift over time; (5) HEART/AARRR — Happiness/Engagement/Adoption/Retention/Task-success or Acquisition/Activation/Retention/Revenue/Referral; best for measuring product success; output: metric dashboard; limitation: requires instrumentation; (6) OKR — Objectives and Key Results; best for aligning team goals; output: quarterly OKRs; limitation: cascading OKRs can become bureaucratic; (7) Dual-track Agile — discovery + delivery parallel tracks; best for teams that need to validate before building; output: validated backlog; limitation: requires dedicated discovery capacity. The Yi-family projects use RICE (prioritization), JTBD (BRD generation), and Kano (feature classification).
- **RICE scoring calibration guide**: Reach — number of users affected per month; 1 = < 10 users, 3 = 10-100, 5 = 100-1000, 7 = 1000-10000, 10 = > 10000; Impact — how much does this move the user's needle; 1 = minimal, 3 = noticeable, 5 = significant, 7 = major, 10 = transformative; Confidence — how sure are you about the estimates; 1 = wild guess, 3 = some data, 5 = user interview, 7 = quantitative data, 10 = A/B test result; Effort — person-weeks required; 1 = < 1 week, 3 = 1-2 weeks, 5 = 2-4 weeks, 7 = 1-2 months, 10 = > 2 months. The calibration is done by the team, not by the PM alone, to reduce individual bias. The Yi-family BRD Agent uses RICE scoring for feature prioritization in generated BRDs.
- **North Star metric design principles (3 criteria)**: (1) Captures the value exchange — the metric must reflect both user value (what the user gets) and business value (what the business gets); example: "weekly active users who complete at least 3 searches" captures user value (finding information) and business value (engagement driving retention); (2) Actionable within a sprint — the team must be able to connect their daily work to the metric's movement; if the metric moves quarterly, it needs a leading indicator that moves weekly; (3) Not gameable — the metric must be hard to manipulate without actually delivering value; "page views" is gameable (auto-refresh); "searches that result in a click on a result" is harder to game. The Yi-family projects: no North Star metric is defined (internal tools, no external users); the framework is in place for when products face external users.
- **Dual-track agile implementation mechanics**: Discovery track — 1-2 dedicated people (PM + designer), 2-week cycles, outputs: validated user stories, prototypes, PRDs; success metric: % of delivery stories that trace back to discovery findings. Delivery track — full engineering team, 2-week sprints, outputs: shipped features; success metric: sprint velocity and quality. The tracks meet at: Sprint Planning (discovery outputs become delivery inputs), Sprint Review (delivery outputs inform next discovery cycle). The most common failure: discovery track is under-resourced (0.5 people) and perpetually deprioritized. The Yi-family projects: no formal dual-track agile (team size is 1-2 engineers per project); the pattern is documented for when the team grows.
- **Kano model lifecycle and survey methodology**: Features move through the Kano lifecycle: Excitement (delighters) → Performance (more is better) → Basic (must-have). Timeline: typically 1-3 years per stage. A feature that was a delighter 2 years ago (e.g., dark mode) is now a basic expectation. The Kano survey uses a functional/dysfunctional question pair: "If the product had X, how would you feel?" (Like, Expect, Neutral, Tolerate, Dislike) and "If the product didn't have X, how would you feel?" (same 5 options). The combination classifies the feature: Like+Dislike = Excitement, Expect+Dislike = Performance, Expect+Neutral = Basic. The Yi-family BRD Agent uses Kano classification in generated BRDs.
- **Yi-family PM framework adoption (2026-08)**: The Yi-family projects are internal tools with 1-2 engineers per project; PM frameworks are used primarily for BRD generation (YiAi BRD Agent) and cross-project coordination. Adopted frameworks: RICE (BRD feature prioritization), JTBD (BRD user need classification), Kano (BRD feature categorization), OKR (quarterly planning). Not yet adopted: HEART/AARRR (no user-facing metrics), dual-track agile (team too small). The PM framework knowledge is documented in 8 framework summary files in `product-manager/frameworks/` and 4 strategy files in `executive/strategy/`.

## Action recommendations

1. Use RICE/ICE for prioritization; use JTBD to uncover user needs
2. Define the north-star metric — see `product/metrics/north-star-metric-summary.md`; AI products must read `ai-product-metrics-summary.md`
3. Map the product roadmap with `now-next-later-roadmap-summary.md`, paired with BMC and Porter's Five Forces for strategy comparison
4. Write PRDs directly from `resources/templates/prd.md`
5. Reference `dual-track-agile-summary.md` + team `iteration-pm-handbook-summary.md` for landing dual-track agile
6. When stuck on a decision, check the thinking models in `methodology/thinking/` for new perspectives

## Anti-patterns

- **Using RICE scores as a decision engine rather than a conversation starter**: Treating the RICE output as the final answer ("score says build X, so we build X") bypasses the most valuable part of the exercise -- the debate about what Reach, Impact, Confidence, and Effort actually mean for this specific product. RICE is a prioritization input, not a prioritization oracle. The scores should provoke discussion, not end it.

- **Applying JTBD without observing the switching moment**: The most valuable JTBD insight comes not from asking users what they need but from observing the moment they switch from one solution to another. The "switching moment" reveals the job that the old solution was failing at, which is the job the new solution must nail. Interviews alone miss this because users cannot articulate the moment they decided to abandon a tool.

- **Choosing a North Star metric that the team cannot influence within a sprint cycle**: If the North Star metric moves on a quarterly timescale (e.g., annual revenue, NPS), the team cannot connect their daily work to the metric's movement. The North Star must have a leading indicator that the team can move within a sprint -- otherwise, the metric becomes wallpaper that no one looks at.

- **Writing a PRD before the problem is defined, not after**: The PRD should be the last document written in the discovery phase, not the first. Writing a PRD to "get alignment" before the problem space is understood produces a document that describes a solution to an unverified problem. The sequence should be: problem definition -> user research -> solution exploration -> PRD. Skipping steps 1-3 produces a PRD that is internally consistent but externally irrelevant.

- **Running a sprint retrospective without action items that have owners and due dates**: A retrospective that produces "we should communicate better" is a therapy session, not a process improvement. Each retrospective action item must have a single owner, a due date within the next sprint, and a measurable acceptance criterion. Without these three elements, the same issues will appear in the next retrospective, and the team will stop believing the retrospective matters.

## Related

- similar journey: [../strategies/find-templates-and-prompts.md](../engineering/find-templates-and-prompts.md) — PRD / retrospective / 1on1 templates
- similar journey: [../processes/review-lessons.md](../process/review-lessons.md) — team retrospective cadence
- upstream: [../../knowledge-curator/diagrams/user-journey.md](../../knowledge-curator/diagrams/user-journey.md) — journey design basis
- downstream: [../../knowledge-curator/diagrams/knowledge-map.md](../../knowledge-curator/diagrams/knowledge-map.md) — knowledge map
