---
title: Handle customer feedback
aliases:
- I want to handle customer feedback
- feedback-loop-journey
- customer-feedback-journey
- customer feedback entry
tags:
- journeys
- customer-feedback
- voice-of-customer
- retention
- iteration
category: engineer/process
created: 2026-08-03
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
roles:
- engineer
benefit: incident is contained
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ../../product-manager/frameworks/do-user-research.md
- ./run-iteration-meetings.md
- ../processes/measure-product-metrics.md
- ../../product-manager/discovery/metrics--README.md
review_cycle: quarterly
tacit: false
---

# I want to handle customer feedback

> **As an** engineer, **I want to** handle customer feedback, **so that** incident is contained.

> "feedback collection + classification + priority + enter iteration + follow-up + closed loop" — reach Measurement + UX research + iteration cadence + stakeholders + industry cases within 2 hops.

## Summary

- Measurement: see [retention-and-churn-summary.md](../../product-manager/discovery/metrics--retention-and-churn.md) + [north-star-metric-summary.md](../../product-manager/discovery/metrics--north-star-metric.md) + [ai-product-metrics-summary.md](../../product-manager/discovery/metrics--ai-product-metrics.md)
- Research: see [user-research-interview-template.md](../../knowledge-curator/templates/user-research-interview.md) + [usability-test-report-template.md](../../knowledge-curator/templates/usability-test-report.md) + [jobs-to-be-done-summary.md](../../product-manager/frameworks/jobs-to-be-done.md)
- Iteration: see [iteration-pm-handbook-summary.md](iteration-pm-handbook.md) + [requirement-review-process.md](../../product-manager/delivery/requirement-review.md) + [rice-ice-prioritization-summary.md](../../product-manager/frameworks/rice-ice-prioritization.md)
- Stakeholders: see [stakeholder-map.md](../../knowledge-curator/people/stakeholders--stakeholder-map.md) + [communication-cadence.md](../../knowledge-curator/people/stakeholders--communication-cadence.md)
- Industry cases: see [ai-after-sales-cases.md](../../product-manager/strategy/ai-after-sales-cases.md) + [ai-customer-service-cases.md](../../product-manager/strategy/ai-customer-service-cases.md)

## Core viewpoints

- **The cost of unhandled feedback is not the missed feature -- it is the slow erosion of the feedback channel itself.** Every time a customer submits feedback and receives no response, the probability that they will submit feedback again drops. After enough silence, customers stop reporting issues entirely, and the team loses its most valuable early-warning system. The closed loop (acknowledge, decide, communicate the decision) is not customer service -- it is channel preservation.

- **Feedback volume is not a prioritization signal; the loudest customers are rarely the most representative.** A single enterprise customer generating 50 tickets may represent 1% of the user base. The RICE framework (Reach x Impact x Confidence / Effort) exists precisely to prevent the squeaky-wheel dynamic from dominating the roadmap. Prioritization without a framework is just reacting to whoever shouts loudest.

- **JTBD (Jobs to Be Done) classification is the only reliable way to separate signal from noise in feedback.** When a customer says "add a dark mode," the functional request is a theme toggle, but the Job to Be Done might be "reduce eye strain during late-night work." The JTBD lens reveals that dark mode, blue-light filtering, and scheduled breaks are competing solutions to the same job, and the team should solve the job, not the surface request.

- **Churn attribution is the most honest feedback mechanism because it measures revealed preference, not stated preference.** Customers say they want feature X, but they leave because of pricing or poor onboarding. Surveys capture what people say; churn data captures what people do. Any feedback system that does not cross-reference churn attribution with feature requests is optimizing for the wrong signal.

- **The Kano model's most important insight is that delighters become basics over time.** A feature that delighted users in 2024 is a basic expectation by 2026. Feedback that was once classified as "excitement" must be re-evaluated each cycle, because yesterday's differentiator is today's table stakes. Teams that do not reclassify Kano categories over time end up investing in features that no longer move the needle.

## Key info

- **Feedback classification taxonomy (5 tiers)**: (1) Bug report — something is broken, requires immediate triage (P0-P3 severity); (2) Performance issue — too slow, crashes, consumes too much resource; (3) Missing feature — user needs functionality that doesn't exist; (4) UX friction — functionality exists but is hard to use, discover, or understand; (5) Delight request — functionality exists and works, but user wants it to be better. Each tier has a different response SLA and routing: bugs → engineering (P0 <4 hours), performance → engineering + platform, missing features → PM backlog, UX friction → design + PM, delight → PM backlog (lowest priority). The Yi-family projects use this taxonomy for feedback classification.
- **RICE prioritization formula applied to feedback**: Score = (Reach × Impact × Confidence) / Effort. Reach — how many users will this affect in a quarter (estimate: 1-1000+); Impact — how much will this move the user's experience (1=minimal, 2=moderate, 3=significant, 4=transformative); Confidence — how sure are we about the reach/impact/effort estimates (20%=gut feel, 50%=user interview data, 80%=quantitative data, 100%=A/B test result); Effort — total person-weeks to implement. A feedback item with RICE score <10 is deprioritized; score >50 is a top candidate. The RICE framework prevents the squeaky-wheel dynamic where the loudest customer dominates the roadmap.
- **JTBD (Jobs to Be Done) classification for feedback**: When a customer requests a feature, ask: "What job were you trying to get done when you needed this feature?" The job is the stable unit of analysis; the feature request is one possible solution. Example: "Add dark mode" → JTBD: "Reduce eye strain during late-night work" → alternative solutions: blue-light filter, scheduled break reminders, screen brightness adjustment. The JTBD lens reveals that the team should solve the job, not the surface request. The Yi-family projects use JTBD for feature prioritization in BRD creation.
- **Kano model categories and re-evaluation cadence**: (1) Basic (must-have) — absence causes dissatisfaction, presence is expected; re-evaluate annually as market expectations evolve; (2) Performance (more-is-better) — satisfaction is linear with performance; re-evaluate quarterly against competitive benchmarks; (3) Delighter (unexpected joy) — absence is neutral, presence causes delight; re-evaluate every 6 months as delighters migrate to performance and then to basic; (4) Indifferent — users don't care either way; remove or stop investing. The re-evaluation cadence is the critical process: a feature that was a delighter 2 years ago is now a basic expectation, and continuing to invest in it as a delighter is wasted effort.
- **Churn attribution as feedback signal**: When a user churns, determine: (1) Was the churn due to a missing feature? (if yes, which one, and does it appear in the feedback backlog); (2) Was the churn due to a broken feature? (if yes, was it reported as a bug before churn); (3) Was the churn due to pricing/value perception? (if yes, is the pricing aligned with the value delivered); (4) Was the churn due to onboarding friction? (if yes, at what step did the user drop off). Churn attribution that reveals a feature gap that was reported 6 months ago but never prioritized is a feedback loop failure. The Yi-family projects currently have no formal churn attribution process.
- **Feedback closed-loop SLA by tier**: (1) Bug report — acknowledge within 4 hours, triage within 24 hours, fix or communicate timeline within 72 hours; (2) Performance issue — acknowledge within 24 hours, investigate within 1 week; (3) Missing feature — acknowledge within 1 week, add to backlog with RICE score, communicate decision (will-do/won't-do/maybe-later) within 2 weeks; (4) UX friction — acknowledge within 1 week, UX review within 2 weeks, communicate decision within 3 weeks; (5) Delight request — acknowledge within 2 weeks, communicate decision within 4 weeks. The "won't-do" communication is as important as the "will-do": it closes the loop and preserves the feedback channel. The Yi-family projects currently have no formal closed-loop SLA.

## Scenario description

When collecting customer feedback / tickets / NPS / customer service records / sales follow-up / user interviews / comments, PM + customer success + customer service need to look up feedback channels + classification + priority + enter iteration + follow-up closed loop. This entry aggregates customer-feedback-related Measurement + UX research + iteration cadence into a 2-hop path, avoiding "feedback scattered everywhere / no classification / never enters iteration / no follow-up / closed loop missing".

## 2-hop reachability path

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `product/metrics/` | [retention-and-churn-summary.md](../../product-manager/discovery/metrics--retention-and-churn.md) · [north-star-metric-summary.md](../../product-manager/discovery/metrics--north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics--ai-product-metrics.md) |
| `methodology/pm-frameworks/` | [jobs-to-be-done-summary.md](../../product-manager/frameworks/jobs-to-be-done.md) · [kano-model-summary.md](../../product-manager/frameworks/kano-model.md) · [rice-ice-prioritization-summary.md](../../product-manager/frameworks/rice-ice-prioritization.md) · [okr-design-summary.md](../../product-manager/frameworks/okr-design.md) · [heart-aarrr-metrics-summary.md](../../product-manager/frameworks/heart-aarrr-metrics.md) · [product-discovery-framework-summary.md](../../product-manager/frameworks/product-discovery-framework.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md) · [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md) · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking--flywheel-effect.md) |
| `product/ux/` | [ai-product-ux-patterns-summary.md](../../product-manager/discovery/ux--ai-product-ux-patterns.md) · [nielsen-heuristics-summary.md](../../product-manager/discovery/ux--nielsen-heuristics.md) · [cross-cultural-ux-summary.md](../../product-manager/discovery/ux--cross-cultural-ux.md) · [spritesheet-summary.md](../../product-manager/discovery/ux--spritesheet.md) · [after-sales-pad-visual-review-summary.md](../../product-manager/discovery/ux--after-sales-pad-visual-review.md) |
| `product/strategy/` | [product-strategy-framework-summary.md](../../executive/strategy/product-strategy-framework.md) · [now-next-later-roadmap-summary.md](../../executive/strategy/now-next-later-roadmap.md) — feedback-driven planning |
| `resources/templates/` | [user-research-interview-template.md](../../knowledge-curator/templates/user-research-interview.md) · [usability-test-report-template.md](../../knowledge-curator/templates/usability-test-report.md) · [meeting-notes-template.md](../../knowledge-curator/templates/meeting-notes.md) · [one-on-one-template.md](../../knowledge-curator/templates/one-on-one.md) · [prd.md](../../knowledge-curator/templates/prd.md) |
| `work/processes/` | [iteration-pm-handbook-summary.md](iteration-pm-handbook.md) · [requirement-review-process.md](../../product-manager/delivery/requirement-review.md) · [design-review-process.md](../../product-manager/delivery/design-review.md) · [knowledge-transfer-process.md](knowledge-transfer.md) · [project-handover-process.md](project-handover.md) |
| `work/meetings/` | [weekly-meeting-template.md](../../product-manager/delivery/weekly-meeting.md) · [review-meeting-template.md](../../product-manager/delivery/review-meeting.md) · [retrospective-sample.md](../../product-manager/delivery/retrospective.md) · [weekly-report-sample.md](../../product-manager/delivery/weekly-report.md) |
| `work/collaboration/` | [async-collaboration-principles-summary.md](async-collaboration-principles.md) · [raci-matrix-summary.md](raci-matrix.md) — feedback handling RACI |
| `people/stakeholders--` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders--stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders--communication-cadence.md) — customer tiering |
| `people/experts--` | [external-experts-roster.md](../../knowledge-curator/people/experts--external-experts-roster.md) — external expert feedback |
| `industry/use-cases/` | [ai-after-sales-cases.md](../../product-manager/strategy/ai-after-sales-cases.md) · [ai-customer-service-cases.md](../../product-manager/strategy/ai-customer-service-cases.md) · [case-study-template.md](../../product-manager/strategy/case-study.md) |
| `lessons/failures/` | [ai-product-launch-lessons-summary.md](../lessons/failure-ai-product-launch-lessons.md) — feedback missing Incident |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../lessons/win-yiai-brd-agent-launch.md) — BRD Agent feedback closed loop · [yiai-rag-hybrid-retrieval-win.md](../lessons/win-yiai-rag-hybrid-retrieval.md) |
| `projects/` | each project `project-management-summary.md` §customer feedback + §iteration cadence |

## Action recommendations

1. **feedback channel**: tickets + NPS + customer service records + sales follow-up + user interviews + comments + community + internal QA; must aggregate to one place, don't scatter.
2. **JTBD classification**: classify by "what job users hire the product to complete", not by functional module; see [jobs-to-be-done-summary.md](../../product-manager/frameworks/jobs-to-be-done.md).
3. **Kano layering**: basic / expectation / delight; MVP feedback priority basic > expectation > delight; see [kano-model-summary.md](../../product-manager/frameworks/kano-model.md).
4. **RICE priority**: Reach × Impact × Confidence / Effort; don't rank by noise volume; see [rice-ice-prioritization-summary.md](../../product-manager/frameworks/rice-ice-prioritization.md).
5. **quantify + qualitative**: NPS / churn quantify + interviews qualitative to dig reasons; don't only look at one side.
6. **churn attribution**: churned users must be followed up + attributed (product / experience / price / season / alternative); see [retention-and-churn-summary.md](../../product-manager/discovery/metrics--retention-and-churn.md).
7. **enter iteration**: feedback must enter iteration planning + stakeholder review + owner + due date; see [iteration-pm-handbook-summary.md](iteration-pm-handbook.md) + [requirement-review-process.md](../../product-manager/delivery/requirement-review.md).
8. **follow-up closed loop**: every feedback item must give the submitter feedback (adopted / not adopted / scheduled / already launched); don't let it sink without trace.
9. **stakeholder tiering**: strategic / key customer feedback priority higher; see [stakeholder-map.md](../../knowledge-curator/people/stakeholders--stakeholder-map.md).
10. **Inversion**: first imagine "what happens if this feedback is ignored" then prioritize; see [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md).
11. **Second-order**: satisfying this feedback could trigger dissatisfaction in other users? see [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md).
12. **Flywheel**: feedback → improve → experience rises → more feedback → Flywheel; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking--flywheel-effect.md).
13. **AI auxiliary**: use [brd-generation-prompt.md](../../ai-engineer/methodology/prompts--brd-generation.md) to convert feedback to BRD drafts; use [code-review-prompt.md](../../ai-engineer/methodology/prompts--code-review.md) to assist analysis.
14. **Retrospective**: end-of-iteration retro must review feedback closed-loop rate + post-launch effect; see [retrospective-sample.md](../../product-manager/delivery/retrospective.md).

## Anti-patterns

- **Collecting feedback into a black hole.** When feedback is collected through NPS surveys, customer service tickets, and user interviews but never aggregated into a single triage system, it is effectively lost. Each channel has its own backlog, and no one can answer the question "what are our top 10 customer pain points right now?" The first step is aggregation; without it, prioritization is impossible.

- **Prioritizing feedback by the seniority of the person who reported it.** A bug reported by a VP gets immediate attention while the same bug reported by a junior user languishes for months. This creates a two-tier system where internal advocates get service and actual users get silence. RICE prioritization (Reach x Impact x Confidence / Effort) exists to replace organizational hierarchy with objective criteria.

- **Classifying all feedback as feature requests.** When a customer says "your app is too slow," the response should not be "we'll add a performance ticket to the backlog." First, quantify the problem (is it actual latency or perceived latency?), then diagnose the root cause (network, rendering, backend, data volume?), then classify the feedback (bug? performance? UX?). Treating every piece of feedback as a feature request bypasses the diagnostic step.

- **Closing the loop with "we have added this to our backlog" without a timeline or priority.** "In the backlog" is indistinguishable from "ignored" from the customer's perspective. The closed loop must include: the decision (adopted / not adopted / scheduled), the rationale, the expected timeline if scheduled, and a way for the customer to track progress. Without specificity, the loop is not closed -- it is deferred.

- **Reviewing feedback closed-loop rates without reviewing the quality of the decisions.** A team that closes 100% of feedback loops by rejecting everything with a boilerplate response is technically compliant but substantively failing. The retrospective must sample the quality of decisions, not just the quantity of closures: were the right things adopted? Were rejections well-reasoned? Did adopted feedback actually improve the metrics it was supposed to improve?

## Related

- Related journey: [../../product-manager/frameworks/do-user-research.md](../../product-manager/frameworks/do-user-research.md) — user research
- Related journey: [./run-iteration-meetings.md](./run-iteration-meetings.md) — iteration meeting
- Related journey: [../processes/measure-product-metrics.md](measure-product-metrics.md) — Measurement system
- Related journey: [../../product-manager/discovery/write-a-prd.md](../../product-manager/discovery/write-a-prd.md) — feedback to PRD
- Upstream: [../../product-manager/discovery/metrics--README.md](../../product-manager/discovery/metrics--README.md) — metrics leaf entry
