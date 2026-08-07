---
title: Write a PRD
aliases:
- I want to write a PRD
- prd-journey
- product-requirements-journey
- PRD entry
tags:
- journeys
- prd
- product
- requirements
- jtbd
- kano
category: product-manager/discovery
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
- ../../engineer/process/measure-product-metrics.md
- ../frameworks/launch-an-ai-product.md
- ../../product-manager/discovery/prd/README.md
review_cycle: quarterly
tacit: false
---

# I want to write a PRD

> **As a** product manager, **I want to** write a prd, **so that** knowledge is captured. 

> "PRD structure + JTBD + Kano + North Star + UX patterns + BRD handoff + review process" 2-hop reachable template + strategy + measurement + UX + PM frameworks. 

## Summary

- Template via [prd.md](../../knowledge-curator/templates/prd.md): background / goal / user / scenario / requirement / acceptance / risk / milestone
- Strategy alignment via [product-strategy-framework-summary.md](../../executive/strategy/product-strategy-framework.md) + [now-next-later-roadmap-summary.md](../../executive/strategy/now-next-later-roadmap.md)
- User need via [jobs-to-be-done-summary.md](../../product-manager/frameworks/jobs-to-be-done.md) + [kano-model-summary.md](../../product-manager/frameworks/kano-model.md)
- Measurement via [north-star-metric-summary.md](metrics/north-star-metric.md) + [ai-product-metrics-summary.md](metrics/ai-product-metrics.md)
- Review via [requirement-review-process.md](../delivery/requirement-review.md) + [design-review-process.md](../delivery/design-review.md)

## Core viewpoints

- **A PRD is a communication tool, not a documentation tool. Its value is measured by how many clarifying conversations it prevents, not by how comprehensive it is.** A PRD that is 50 pages and covers every edge case but is never read by the engineering team is a failure. A PRD that is 5 pages and prevents 10 Slack threads of "what should happen when X?" is a success. Write for the reader who will implement the feature, not for the archive.

- **The PRD's user segmentation section is the foundation upon which everything else rests.** When the PRD says "the user" without specifying which user, every subsequent decision is ambiguous. A feature designed for a power user looks very different from the same feature designed for a first-time user. The PRD must be explicit: "the primary user for this feature is the customer service agent who handles 50+ tickets per day, not the manager who reviews the weekly report." Every requirement should be traceable to a specific user segment.

- **The PRD-to-BRD handoff is a translation, not a reformatting.** The PRD describes what the product does (product perspective); the BRD describes why the business should invest (business perspective). Converting a PRD to a BRD is not about adding an executive summary — it is about changing the lens from "this is what we will build" to "this is the business outcome we will achieve, and here is the evidence." The same feature looks very different through these two lenses.

- **The acceptance criteria are the contract between PM and engineering. Ambiguity in the acceptance criteria is the PM's failure, not the engineer's.** When an engineer says "I built what the PRD asked for" and the PM says "that's not what I meant," the PRD was incomplete. Acceptance criteria must be written as if they will be tested by someone who has no context beyond the PRD. The test: give the acceptance criteria to a QA engineer who has not attended any meetings. Can they write a test plan?

- **The PRD's timeline section should be a confidence interval, not a date.** "We will ship on August 15" is a point estimate that is almost certainly wrong. "We estimate shipping between August 1 and August 30, with 80% confidence" is an honest forecast that allows stakeholders to plan. The width of the confidence interval is a signal of uncertainty: a 4-week range means there are significant unknowns; a 1-week range means the feature is well-understood.

## Key info

- **PRD structure (8 sections)**: (1) Background (why this, why now, what problem), (2) Goals (business objectives, success metrics, non-goals), (3) Users (primary/secondary personas, their context, their current workaround), (4) Scenarios (user stories, JTBD, happy path + error paths), (5) Requirements (functional, non-functional, constraints), (6) Acceptance criteria (testable, unambiguous, per-scenario), (7) Risks (technical, market, timeline, dependencies), (8) Milestones (phases, confidence intervals, dependencies). The most common missing section: Non-goals (what we are explicitly NOT building). Without non-goals, scope creeps because every stakeholder adds their pet feature.
- **JTBD (Jobs-to-be-Done) format**: "When [situation], I want to [motivation], so I can [expected outcome]." The situation clause is the most important and most often omitted: it anchors the job to a specific context. A job without a situation is too abstract: "I want to export data" is 10 different features depending on whether the situation is "during a quarterly audit" vs "during a customer call." The JTBD must be validated with at least 5 real users before being written into the PRD.
- **Kano model application**: features are classified into: Basic (must-have, absence = dissatisfaction, presence = neutral), Performance (more = better, linear satisfaction), Excitement (delighters, presence = high satisfaction, absence = neutral). The PRD should explicitly classify each feature and allocate effort accordingly: Basic (get it right, not fancy), Performance (invest proportionally to impact), Excitement (pick 1-2 per release, they decay to Performance within 6 months). The most common mistake: treating all features as Performance and investing equally.
- **PRD review checklist**: (1) Can a new engineer understand the user's problem without asking questions? (2) Can a QA engineer write a test plan from the acceptance criteria alone? (3) Are all ambiguous terms defined ("fast" = p99 < 200ms, "many" = >1000 items)? (4) Is the scope bounded by explicit non-goals? (5) Can the PM trace every requirement back to a specific user segment and JTBD? A PRD that passes all 5 checks is ready for review. A PRD that fails any check goes back to the PM for revision.
- **PRD vs BRD scope**: PRD (product perspective, what we build, for engineers and designers, 5-15 pages, 1-2 weeks to write), BRD (business perspective, why we invest, for executives and stakeholders, 3-5 pages, 3-5 days to write from a PRD). The PRD is the upstream document; the BRD is derived from it. A BRD without a PRD is a business case without a product plan -- it justifies investment but doesn't tell engineering what to build.

## Scenario

When writing a PRD / reviewing a PRD / aligning with design, algorithm, engineering / converting to BRD, PM + lead owner need to look up PRD structure + strategy alignment + user segmentation + acceptance measurement + review process. This entry aggregates PRD template + strategy + measurement + UX + PM frameworks to a 2-hop path, avoiding "PRD as a success checklist / missing user segmentation / missing acceptance measurement / review by gut feel". 

## 2-hop reachability paths

| Hop 1 (category / leaf)  | Hop 2 (specific file)  |
|---|---|
| `resources/templates/` | [prd.md](../../knowledge-curator/templates/prd.md) · [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [usability-test-report-template.md](../../knowledge-curator/templates/usability-test-report.md) · [user-research-interview-template.md](../../knowledge-curator/templates/user-research-interview.md) · [tech-selection-evaluation-template.md](../../knowledge-curator/templates/tech-selection-evaluation.md) |
| `product/strategy/` | [product-strategy-framework-summary.md](../../executive/strategy/product-strategy-framework.md) · [blue-ocean-strategy-summary.md](../../executive/strategy/blue-ocean.md) · [porter-five-forces-summary.md](../../executive/strategy/porter-five-forces.md) · [business-model-canvas-summary.md](../../executive/strategy/business-model-canvas.md) · [now-next-later-roadmap-summary.md](../../executive/strategy/now-next-later-roadmap.md) · [second-curve-summary.md](../../executive/strategy/second-curve.md) |
| `product/metrics/` | [north-star-metric-summary.md](metrics/north-star-metric.md) · [ai-product-metrics-summary.md](metrics/ai-product-metrics.md) · [retention-and-churn-summary.md](metrics/retention-and-churn.md) |
| `product/ux/` | [ai-product-ux-patterns-summary.md](ux/ai-product-ux-patterns.md) · [nielsen-heuristics-summary.md](ux/nielsen-heuristics.md) · [cross-cultural-ux-summary.md](ux/cross-cultural-ux.md) |
| `methodology/pm-frameworks/` | [jobs-to-be-done-summary.md](../../product-manager/frameworks/jobs-to-be-done.md) · [kano-model-summary.md](../../product-manager/frameworks/kano-model.md) · [okr-design-summary.md](../../product-manager/frameworks/okr-design.md) · [rice-ice-prioritization-summary.md](../../product-manager/frameworks/rice-ice-prioritization.md) · [dual-track-agile-summary.md](../../product-manager/frameworks/dual-track-agile.md) · [product-discovery-framework-summary.md](../../product-manager/frameworks/product-discovery-framework.md) · [heart-aarrr-metrics-summary.md](../../product-manager/frameworks/heart-aarrr-metrics.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) |
| `work/processes/` | [requirement-review-process.md](../delivery/requirement-review.md) · [design-review-process.md](../delivery/design-review.md) · [iteration-pm-handbook-summary.md](../../engineer/process/iteration-pm-handbook.md) |
| `brd/` | [../../executive/industry/README.md](../../executive/industry/README.md) — PRD → BRD (business requirement document) handoff point |
| `industry/use-cases/` | [ai-after-sales-cases.md](../strategy/ai-after-sales-cases.md) · [ai-customer-service-cases.md](../strategy/ai-customer-service-cases.md) · [case-study-template.md](../strategy/case-study.md) — industry cases as PRD reference |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — PRD review stakeholders |

## Action recommendations

1. **Background + why**: First write clearly why you are doing it (user pain + business goal + strategy alignment) ; do not jump straight into features; see [product-strategy-framework-summary.md](../../executive/strategy/product-strategy-framework.md). 
2. **User segmentation**: Use JTBD to segment users "what job are they hiring the product for"; see [jobs-to-be-done-summary.md](../../product-manager/frameworks/jobs-to-be-done.md). 
3. **Requirement layering**: Kano basic / expected / excitement; MVP only covers basic + core expected; see [kano-model-summary.md](../../product-manager/frameworks/kano-model.md). 
4. **Priority**: RICE (Reach × Impact × Confidence / Effort) ranks priority; see [rice-ice-prioritization-summary.md](../../product-manager/frameworks/rice-ice-prioritization.md). 
5. **Acceptance measurement**: North Star + 3 auxiliary + expected lift; must review after launch; see [north-star-metric-summary.md](metrics/north-star-metric.md). 
6. **AI product supplement**: Recall / faithfulness / latency / cost / user reuse rate required; see [ai-product-metrics-summary.md](metrics/ai-product-metrics.md). 
7. **UX patterns**: AI product UX (streaming / reference / feedback / degradation) must reference; see [ai-product-ux-patterns-summary.md](ux/ai-product-ux-patterns.md). 
8. **Risk + milestone**: Required tech risk / compliance risk / data risk + phase milestones (MVP / Beta / GA) . 
9. **Review**: Follow [requirement-review-process.md](../delivery/requirement-review.md), full stakeholder coverage (design / algorithm / engineering / legal / business) . 
10. **Convert to BRD**: After PRD passes, convert to BRD (business requirement document) on the business side; see [../../executive/industry/README.md](../../executive/industry/README.md). 

## Anti-patterns

- **The PRD written in isolation: the PM spends 2 weeks writing, then throws it over the wall to engineering.** This is waterfall in agile clothing. The PRD should be written collaboratively, with engineering and design providing input on feasibility and user experience during the drafting process. The review should be a formality because everyone already contributed, not a confrontation because engineering is seeing it for the first time.

- **The PRD that describes the "happy path" in excruciating detail and ignores error states entirely.** A PRD that spends 3 pages describing the ideal user flow and 0 pages on error handling is describing 80% of the user experience (the 20% of cases where things go wrong occupy 80% of the engineering effort). Every user action in the PRD should have a corresponding error state: what happens when the network fails, when the data is stale, when the user does not have permission.

- **The PRD as a feature grab-bag: "while we're at it, let's also add..."** The most dangerous phrase in product development. Every addition to scope should be justified against the PRD's stated goals. If the addition does not serve the primary user or the primary business goal, it belongs in a separate PRD for a future iteration. The PRD review should explicitly ask: "what did we remove from the first draft?"

- **The PRD with metrics that cannot be measured at launch.** "Increase user satisfaction by 20%" cannot be measured because you do not have a pre-launch satisfaction baseline for a feature that does not exist yet. Metrics in the PRD must be measurable from day one of launch. If the metric requires a survey that will be sent 3 months after launch, it is a post-launch evaluation plan, not a PRD metric. The PRD metric should be instrumented in the feature itself: "completion rate of the new workflow."

- **The PRD that skips the competitive audit because "we're building something unique."** Every product has competitors, even if they are indirect. The user's alternative to your feature might be a spreadsheet, a manual process, or simply doing nothing. The PRD should acknowledge the user's current alternatives and explain why the proposed feature is better. If the PM cannot articulate the user's current alternative, they do not understand the user's context well enough.

## Related

- Same-class journey: [../../engineer/lessons/learn-pm-frameworks.md](../../engineer/lessons/learn-pm-frameworks.md) — PM framework comparison
- Same-class journey: [../../engineer/process/measure-product-metrics.md](../../engineer/process/measure-product-metrics.md) — measurement deep dive
- Same-class journey: [../frameworks/launch-an-ai-product.md](../frameworks/launch-an-ai-product.md) — AI product landing
- Same-class journey: [../../engineer/engineering/find-templates-and-prompts.md](../../engineer/engineering/find-templates-and-prompts.md) — template entry
- Upstream: [../../product-manager/discovery/prd/README.md](prd/README.md) — prd leaf entry
