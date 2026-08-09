---
title: Write a spec or PRD
aliases:
- I want to write a spec or PRD
- spec-writing-journey
- PRD writing entry
- requirement spec entry
tags:
- journeys
- spec
- prd
- requirement
- writing
- jtbd
- user-story
category: product-manager/frameworks
created: 2026-08-03
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
roles:
- product-manager
benefit: PMs can capture product requirements in a structured format that engineering can act on
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ../../engineer/lessons/learn-pm-frameworks.md
- ./launch-an-ai-product.md
- ../../product-manager/discovery/prd--README.md
- ../../knowledge-curator/templates/README.md
review_cycle: quarterly
tacit: false
---

# I want to write a spec or PRD

> **As a** product manager, **I want to** write a spec or prd, **so that** knowledge is captured.

> "How to write requirement spec / PRD / user story / JTBD + how to run review + how to prioritize" within 2 hops reach PRD template + JTBD + RICE/ICE + Kano + user stories + review process.

## Summary

- PRD: [product/prd/](../discovery/prd): template + field constraints + review process
- Frameworks: [methodology/pm-frameworks](../../product-manager/frameworks): JTBD + RICE/ICE + Kano + HEART/AARRR + OKR
- Templates: [resources/templates](../../knowledge-curator/templates): PRD template + spec template + meeting notes
- Reviews: [work/processes](../../engineer/process/README.md): requirement-review + design-review + tech-review

## Core viewpoints

- **A PRD is not a specification — it is a decision document that explains why we are building this, for whom, and what success looks like.** The engineering team should receive the PRD and be able to answer: "what user problem does this solve?", "how will we know if it worked?", and "what is explicitly out of scope?" The PRD that reads like a feature list with screenshots has failed its primary purpose, which is to align the team on intent before they align on implementation.

- **The most important section of a PRD is the one most teams skip: the explicit non-goals.** Every feature has a gravitational pull toward scope creep. Without a clearly documented list of what is NOT in scope, the team will discover "obvious" additions during development and add them without re-evaluating priority. The non-goals section is not a rejection of those ideas — it is a commitment to evaluate them in a future iteration rather than silently absorbing them into the current one.

- **A PRD written without user research is a wish list, not a product document.** The difference between a feature request and a PRD is evidence. A PRD should cite specific user interviews, data points, or competitive analysis that support each major decision. Without this evidence layer, the PRD is the PM's opinion dressed in a template. The test: can an engineer reading the PRD trace every requirement back to a user need or a business constraint?

- **The PRD review is not a rubber stamp — it is the last chance to kill a bad idea before it consumes engineering weeks.** A PRD review where no requirements are challenged, no scope is cut, and no assumptions are questioned is a ceremony, not a review. The review should be uncomfortable: the engineering lead should push back on feasibility, the designer should question the user flow, and the PM should defend every requirement with evidence. If the review is comfortable, the PRD is not ambitious enough.

- **AI product PRDs require a new section: model behavior specification.** Traditional PRDs specify deterministic behavior: "when the user clicks X, Y happens." AI product PRDs must also specify probabilistic behavior: "when the model is uncertain, it should express uncertainty rather than fabricate an answer," "when the query is out of scope, the model should refuse gracefully." These behavioral specifications are as important as the functional ones and are the hardest to get right.

## Key info

- **PRD structure template (10 sections with field constraints)**: (1) Executive Summary — 1 paragraph, answers: what problem, for whom, why now; (2) User Problem — JTBD format: "When [situation], I want to [motivation], so I can [outcome]"; (3) Success Metrics — 2-3 measurable KPIs with baseline and target values; (4) User Stories — 3-8 stories in "As a [role], I want [action], so that [benefit]" format, prioritized with RICE scores; (5) Functional Requirements — numbered list of "the system must/should/may" statements, each traceable to a user story; (6) Non-Goals — explicit list of what is NOT in scope, with brief rationale for each; (7) Model Behavior Specification — AI-specific: expected behavior for uncertainty, out-of-scope, ambiguity, confidence thresholds; (8) Competitive Analysis — how users solve this problem today, how competitors solve it, key differentiators; (9) Risks and Mitigations — technical, market, adoption, compliance risks with specific mitigations; (10) Release Plan — phased rollout, canary strategy, success gates, rollback criteria. The Yi-family PRD template follows this structure; the BRD Agent can generate a PRD scaffold from an approved BRD.
- **User story quality checklist (INVEST criteria)**: Independent — the story can be developed independently of other stories; Negotiable — the story is a description of intent, not a detailed contract; Valuable — the story delivers value to the user or stakeholder; Estimable — the team can estimate the effort required; Small — the story fits within a single sprint (typically ≤ 5 story points); Testable — the story has clear acceptance criteria that can be verified. Each user story must pass all 6 INVEST criteria. The most common failure: stories that are not Independent (blocked by other stories) or not Small (epics disguised as stories).
- **PRD review stage gates (3 stages with decision outcomes)**: (1) Requirement Review — PM presents PRD to stakeholders (business, legal, compliance); outcome: approved, revise, or kill; gate criteria: business case is sound, user need is validated, success metrics are defined; (2) Design Review — Designer presents UX flows to PM and engineering; outcome: approved, revise, or kill; gate criteria: user flows are complete, edge cases are handled, accessibility is considered; (3) Tech Review — Tech lead presents technical approach to engineering team; outcome: approved, revise, or kill; gate criteria: architecture is feasible, effort is estimated, risks are identified, non-goals are clear. Each stage can result in "kill" — the PRD is not a foregone conclusion. The Yi-family review process follows this 3-stage model.
- **Acceptance criteria format (Given-When-Then template)**: Given [precondition], When [action], Then [expected outcome]. Example: "Given a user is logged in and has 3 items in their cart, When they click 'Checkout', Then they are redirected to the payment page and the cart is locked for 15 minutes." Each acceptance criterion must be independently testable. The number of acceptance criteria per user story: 3-8 for a typical story, 1-2 for a simple story, 8-15 for a complex story. Acceptance criteria that exceed 15 per story indicate the story is too large and should be split. The Yi-family PRDs use Given-When-Then format for all acceptance criteria.
- **PRD versioning and change management**: The PRD is versioned (v1.0, v1.1, v2.0) with a changelog. v1.0 is frozen at the start of development. Minor changes (clarifications, typo fixes) increment the patch version (v1.1) and do not require re-review. Major changes (new requirements, scope changes, removed features) increment the major version (v2.0) and require a formal change review with scope trade-off. The change review asks: "what drops from the current scope to accommodate this addition?" without a trade-off, the change is rejected. The Yi-family standard: PRD changes during development require a documented scope trade-off.
- **Yi-family PRD practices (2026-08)**: The YiAi BRD Agent generates PRD scaffolds from approved BRDs, using the BRD→PRD transition (BRD scenarios → PRD user stories, BRD success metrics → PRD acceptance criteria, BRD risk register → PRD technical constraints). Current PRD library: 3 PRDs in `product-manager/discovery/prd--` (brd-agent-prd, aichat-port-prd, aicr-file-tree-prd). The BRD Agent is the primary PRD creation tool; the PM's role is to validate the AI-generated scaffold against user research and business context. The gap: no project has conducted formal user research to validate PRD assumptions before development.

## Scenario description

When launching a new feature / changing requirements / writing a PRD / reviewing a spec, PM + engineer + architect need PRD template + JTBD breakdown + priority ranking + review process. This entry aggregates PRD template, JTBD / RICE / Kano frameworks, user stories, and review process into 2-hop paths, avoiding "PRD as stream-water ledger / priority by feel / reviews that don't converge."

## 2-hop reachable paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `product/prd/` | [README.md](../discovery/prd--README.md) — PRD leaf entry + template + review process |
| `product/strategy/` | [now-next-later-roadmap-summary.md](../../executive/strategy/now-next-later-roadmap.md) · [product-strategy-framework-summary.md](../../executive/strategy/product-strategy-framework.md) |
| `product/metrics/` | [north-star-metric-summary.md](../discovery/metrics--north-star-metric.md) · [ai-product-metrics-summary.md](../discovery/metrics--ai-product-metrics.md) — metric-driven PRD |
| `product/ux/` | UX research entry — user story + UX research co-build |
| `methodology/pm-frameworks/` | [jtbd-summary.md](./jobs-to-be-done.md) · [rice-ice-prioritization-summary.md](../../product-manager/frameworks/rice-ice-prioritization.md) · [kano-model-summary.md](../../product-manager/frameworks/kano-model.md) · [okr-summary.md](../../knowledge-curator/archive/strategies-legacy/product-manager/prepare-a-okr-strategy.md) · [heart-aarrr-summary.md](./heart-aarrr-metrics.md) · [dual-track-agile-summary.md](../../product-manager/frameworks/dual-track-agile.md) · [agile-product-management-summary.md](../../product-manager/frameworks/agile-product-management.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md) · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) · [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md) — priority thinking framework |
| `resources/templates/` | [meeting-notes-template.md](../../knowledge-curator/templates/meeting-notes.md) · [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) — review meeting + tech design + ADR |
| `work/processes/` | [requirement-review-process.md](../delivery/requirement-review.md) · [design-review-process.md](../delivery/design-review.md) · [tech-review-process.md](../delivery/tech-review.md) |
| `work/meetings/` | [weekly-report-sample.md](../delivery/weekly-report.md) · [review-meeting-template.md](../delivery/review-meeting.md) — review meeting |
| `industry/` | [use-cases/](../strategy) · [market-trends/](../../executive/industry/market-trends) — industry reference |

## Action recommendations

1. **JTBD breakdown**: first write "what task the user wants to complete" (Job to be Done), not "feature list" — see [jtbd-summary](./jobs-to-be-done.md).
2. **North-star metric alignment**: PRD must align with [north-star-metric](../discovery/metrics--north-star-metric.md); no metric-less PRD.
3. **Priority ranking**: use [RICE/ICE](../../product-manager/frameworks/rice-ice-prioritization.md) to quantify (Reach × Impact × Confidence / Effort); not by feel.
4. **Kano classification**: basic / expectation / excitement — see [kano-model](../../product-manager/frameworks/kano-model.md); different types, different acceptance criteria.
5. **Second-order thinking**: before PRD changes, ask second-order effects (see [second-order-thinking](../../knowledge-curator/templates/thinking--second-order-thinking.md)) — does it trigger new problems.
6. **Inversion**: use [inversion](../../knowledge-curator/templates/thinking--inversion.md) "how to make a PRD bad" to derive improvements.
7. **dual-track agile**: discovery + delivery dual tracks in parallel — see [dual-track-agile](../../product-manager/frameworks/dual-track-agile.md); PRD is not a one-shot waterfall.
8. **Review process**: requirement-review → design-review → tech-review three stages; each must converge (not stream-water ledger).
9. **Industry reference**: scan [use-cases](../strategy) + [market-trends](../../executive/industry/market-trends) to avoid reinventing.
10. **AI product specifics**: must use [yiai-brd-agent-launch](../../tech-lead/decisions/yiai--brd-agent-launch.md) 5-stage methodology + eval-set gate.

## Anti-patterns

- **The PRD as a novel: 40 pages that no engineer reads.** When a PRD exceeds 10 pages, it has crossed the line from decision document to exhaustive specification. Engineers will skim the first 3 pages, look at the mockups, and start coding based on their own mental model. The PRD should be concise enough that every team member can read it in under 15 minutes. Detailed technical specifications belong in the tech design document, not the PRD.

- **Requirements written as solutions: "Build a drag-and-drop interface" instead of "Users need to reorder items quickly."** When the PRD specifies the solution rather than the problem, it robs the engineering and design team of their expertise. The PM's job is to define the problem, the constraints, and the success criteria. The team's job is to find the best solution within those constraints. A PRD that specifies the solution down to the UI widget is micromanagement dressed as requirements.

- **The living PRD that never freezes.** When the PRD is continuously updated during development to reflect new discoveries, the team is chasing a moving target. The PRD should have a version freeze at the start of development. Discoveries during development go into a separate "future iterations" document, not into the current PRD. If a discovery is critical enough to change the current iteration, it requires a formal change review with scope trade-off.

- **Acceptance criteria that are not testable.** "The feature should be fast" is not an acceptance criterion. "The page should load in under 2 seconds for the 95th percentile of users" is. Every acceptance criterion must be specific enough that a QA engineer can write a test for it without asking the PM for clarification. Vague criteria are a signal that the PM has not thought through what "done" means.

- **The PRD that skips the competitive and alternative analysis.** Building a feature without understanding how competitors solve the same problem (or why users' current workarounds exist) is designing in a vacuum. The PRD should include a brief section on "how do users solve this problem today?" and "how do competitors solve it?" This context prevents the team from building a worse version of something that already exists.

## Related

- Same-kind journey: [../../engineer/lessons/learn-pm-frameworks.md](../../engineer/lessons/learn-pm-frameworks.md) — PM framework panorama
- Same-kind journey: [./launch-an-ai-product.md](./launch-an-ai-product.md) — AI product PRD
- Same-kind journey: [../../engineer/process/measure-product-metrics.md](../../engineer/process/measure-product-metrics.md) — metric-driven
- Upstream: [../../knowledge-curator/governance/governance.md](../../knowledge-curator/governance/governance.md) — quarterly audit of PRD value
