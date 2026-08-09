---
title: Do user research
aliases:
- i-want-to-do-user-research
- user-research-journey
- usability-test-journey
- user-research-entry
tags:
- journeys
- user-research
- usability
- jtbd
- kano
- nielsen
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
benefit: outcome is traceable
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ../product/write-a-prd.md
- ../../engineer/lessons/learn-pm-frameworks.md
- ../../engineer/quality-security/run-an-experiment.md
- ../../product-manager/discovery/ux--README.md
review_cycle: quarterly
tacit: false
---

# I want to do user research

> **As a** product manager, **I want to** do user research, **so that** outcome is traceable. 

> "Interview design + usability test + JTBD + Kano + Nielsen heuristics + cross-cultural UX" reaches research templates + frameworks + UX patterns + industry cases within 2 hops. 

## Summary

- Interviews follow [user-research-interview-template.md](../../knowledge-curator/templates/user-research-interview.md) + [jobs-to-be-done-summary.md](../../product-manager/frameworks/jobs-to-be-done.md)
- Usability follows [usability-test-report-template.md](../../knowledge-curator/templates/usability-test-report.md) + [nielsen-heuristics-summary.md](../discovery/ux--nielsen-heuristics.md)
- Needs stratification follows [kano-model-summary.md](../../product-manager/frameworks/kano-model.md) + [rice-ice-prioritization-summary.md](../../product-manager/frameworks/rice-ice-prioritization.md)
- AI product UX follows [ai-product-ux-patterns-summary.md](../discovery/ux--ai-product-ux-patterns.md) + [cross-cultural-ux-summary.md](../discovery/ux--cross-cultural-ux.md)
- Industry cases follow [ai-after-sales-cases.md](../strategy/ai-after-sales-cases.md) + [ai-customer-service-cases.md](../strategy/ai-customer-service-cases.md)

## Core viewpoints

- **The goal of user research is not to ask users what they want — it is to observe what they do and understand why they struggle.** Users are notoriously bad at predicting their own future behavior and at articulating their underlying needs. When asked "would you use this feature?", most users say yes out of politeness or optimism. The only reliable signal is watching them attempt a real task with the current tool and noticing where they pause, backtrack, or express frustration.

- **The 5-user rule is not about sample size — it is about diminishing returns on insight per interview.** Nielsen's finding that 5 users uncover 85% of usability problems is often misinterpreted as "you only need 5 users." The correct interpretation: after 5 users, each additional interview reveals fewer new problems, so the marginal value of each interview drops. This means you should run multiple small studies (5 users each) on different aspects of the product, rather than one large study on everything.

- **User research without a decision at stake is an academic exercise.** Every research study should begin with the question: "what decision will this research inform?" If the answer is "we just want to understand our users better," the research will produce interesting insights that no one acts on. The discipline: write the decision statement before writing the interview guide. "We will decide whether to build feature X or feature Y based on this research."

- **The most valuable research insight is often the one that contradicts the team's assumptions.** Teams selectively hear evidence that confirms their existing beliefs (confirmation bias). A research report that says "users confirmed everything we thought" is a red flag — either the research was designed to confirm, or the findings were cherry-picked. The most valuable finding is the one that makes the team uncomfortable: "we were wrong about this."

- **Research findings degrade over time, and user behavior changes faster than most teams update their research.** A user persona created 18 months ago may describe users who no longer exist, especially in fast-moving markets. Research should have an expiration date. Any finding older than 12 months should be treated as a hypothesis to re-validate, not as established fact.

## Key info

- **User research method comparison (6 methods with cost/quality trade-offs)**: (1) In-depth interview — 45-60 minutes, 1-on-1, $50-200 per participant (incentive), best for understanding motivations and mental models; (2) Usability testing — 30-60 minutes, task-based observation, 5-8 participants per round, best for finding interaction problems; (3) Contextual inquiry — 2-4 hours, observing users in their natural environment, best for understanding workflow and environmental constraints; (4) Survey — 5-15 minutes, 100-1000+ respondents, $1-10 per response, best for quantifying known behaviors and preferences; (5) Diary study — 1-4 weeks, users self-report activities, best for understanding longitudinal behavior patterns; (6) Analytics/behavioral data — 0 cost after instrumentation, continuous, best for measuring actual (not self-reported) behavior. The Yi-family projects primarily use methods 1, 2, and 6; methods 3 and 5 are underutilized.
- **Nielsen's 10 usability heuristics with severity rating scale**: (1) Visibility of system status; (2) Match between system and real world; (3) User control and freedom; (4) Consistency and standards; (5) Error prevention; (6) Recognition rather than recall; (7) Flexibility and efficiency of use; (8) Aesthetic and minimalist design; (9) Help users recognize, diagnose, and recover from errors; (10) Help and documentation. Each violation is rated 0-4: 0 = not a problem, 1 = cosmetic, 2 = minor, 3 = major, 4 = catastrophic. A heuristic evaluation with 3-5 evaluators typically finds 75-90% of usability problems. The 5-user rule applies to usability testing (not heuristic evaluation): 5 users uncover ~85% of problems; after 5 users, each additional user reveals < 5 new problems.
- **Kano model category definitions and survey format**: (1) Must-be (Basic) — absent causes dissatisfaction, present is taken for granted; example: the app doesn't crash; (2) One-dimensional (Performance) — more is better, less is worse; example: faster response time; (3) Attractive (Excitement) — absent doesn't cause dissatisfaction, present causes delight; example: dark mode; (4) Indifferent — presence or absence doesn't affect satisfaction; (5) Reverse — presence causes dissatisfaction; example: excessive notifications. Kano survey uses a functional/dysfunctional question pair: "If the product had X, how would you feel?" and "If the product didn't have X, how would you feel?" with 5 response options each. The combination of answers classifies the feature into one of the 5 categories. Categories shift over time: excitement features become performance features, then must-be features (the Kano lifecycle, typically 1-3 years per stage).
- **JTBD (Jobs-to-be-Done) interview framework**: The core question is "what job is the user hiring the product to accomplish?" The JTBD interview structure: (1) Purchase trigger — what moment caused the user to start looking for a solution? (2) Considered alternatives — what else did they try or consider? (3) Switching forces — push (what drove them away from the old solution), pull (what attracted them to the new solution), anxiety (what worried them about switching), habit (what kept them with the old solution); (4) Success criteria — how did they know the new solution was working? (5) Job statement format: "When [situation], I want to [motivation], so I can [expected outcome]." The Yi-family BRD Agent uses JTBD to classify user requirements in generated BRDs.
- **Research output structure (5 deliverables)**: (1) User personas — 2-4 archetypes with demographics, goals, pain points, behaviors, and a representative quote; (2) Journey maps — 5-7 stages with user actions, thoughts, emotions (pain/delight), and touchpoints per stage; (3) Opportunity areas — ranked by RICE (Reach × Impact × Confidence / Effort); (4) Design principles — 3-5 actionable guidelines derived from research findings; (5) Research report — methodology, participants, key findings, recommendations, and a "what we got wrong" section for assumptions that were disproven. Each deliverable has an expiration date (max 12 months).
- **Yi-family user research practices (2026-08)**: YiAi aiChat — online metrics only (thumbs up/down, regeneration rate, session engagement), no formal user research conducted; YiVad — knowledge leaf view structure was designed based on internal team usage patterns, no external user research; YiPet — chat UI was ported from YiVad patterns, no independent user research. The BRD Agent generates user personas and scenarios as part of BRD output, but these are synthetic (AI-generated), not research-validated. The gap: no project has conducted formal user research with external users; the templates and frameworks are in place for when user-facing features are ready for evaluation.

## Scenario

When designing interviews / running usability tests / stratifying user needs / evaluating AI product UX / cross-cultural adaptation / feeding PRD input, UX researchers + PMs + designers need to look up research templates + PM frameworks + UX patterns + industry cases. This entry aggregates user-research-related 4 leaves + frameworks + templates into a 2-hop path, avoiding "designing interviews by gut feel / lacking stratification / no UX pattern reference / cross-cultural blind spots". 

## 2-hop reachability paths

| Hop 1 (class/leaf)  | Hop 2 (specific file)  |
|---|---|
| `resources/templates/` | [user-research-interview-template.md](../../knowledge-curator/templates/user-research-interview.md) · [usability-test-report-template.md](../../knowledge-curator/templates/usability-test-report.md) · [prd.md](../../knowledge-curator/templates/prd.md) · [meeting-notes-template.md](../../knowledge-curator/templates/meeting-notes.md) |
| `methodology/pm-frameworks/` | [jobs-to-be-done-summary.md](../../product-manager/frameworks/jobs-to-be-done.md) · [kano-model-summary.md](../../product-manager/frameworks/kano-model.md) · [product-discovery-framework-summary.md](../../product-manager/frameworks/product-discovery-framework.md) · [heart-aarrr-metrics-summary.md](../../product-manager/frameworks/heart-aarrr-metrics.md) · [rice-ice-prioritization-summary.md](../../product-manager/frameworks/rice-ice-prioritization.md) · [okr-design-summary.md](../../product-manager/frameworks/okr-design.md) |
| `product/ux/` | [ai-product-ux-patterns-summary.md](../discovery/ux--ai-product-ux-patterns.md) · [nielsen-heuristics-summary.md](../discovery/ux--nielsen-heuristics.md) · [cross-cultural-ux-summary.md](../discovery/ux--cross-cultural-ux.md) · [spritesheet-summary.md](../discovery/ux--spritesheet.md) · [after-sales-pad-visual-review-summary.md](../discovery/ux--after-sales-pad-visual-review.md) |
| `product/metrics/` | [north-star-metric-summary.md](../discovery/metrics--north-star-metric.md) · [retention-and-churn-summary.md](../discovery/metrics--retention-and-churn.md) — retention reflects user value |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md) · [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md) · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) · [strong-opinions-loosely-held-summary.md](../../knowledge-curator/templates/thinking--strong-opinions-loosely-held.md) — assumption generation |
| `product/strategy/` | [product-strategy-framework-summary.md](../../executive/strategy/product-strategy-framework.md) · [blue-ocean-strategy-summary.md](../../executive/strategy/blue-ocean.md) · [now-next-later-roadmap-summary.md](../../executive/strategy/now-next-later-roadmap.md) — strategy alignment |
| `industry/use-cases/` | [ai-after-sales-cases.md](../strategy/ai-after-sales-cases.md) · [ai-customer-service-cases.md](../strategy/ai-customer-service-cases.md) · [case-study-template.md](../strategy/case-study.md) |
| `people/stakeholders--` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders--stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders--communication-cadence.md) — stakeholder research |
| `people/experts--` | [external-experts-roster.md](../../knowledge-curator/people/experts--external-experts-roster.md) — external expert interviews |
| `lessons/failures/` | [ai-product-launch-lessons-summary.md](../../engineer/lessons/failure-ai-product-launch-lessons.md) — user-research gaps causing failures |
| `work/meetings/` | [review-meeting-template.md](../delivery/review-meeting.md) · [retrospective-sample.md](../delivery/retrospective.md) |

## Action recommendations

1. **JTBD framework**: first ask "what job is the user hiring the product to accomplish", not "what features does the user want"; see [jobs-to-be-done-summary.md](../../product-manager/frameworks/jobs-to-be-done.md). 
2. **Interview outline**: opening (background) / main questions (task stream) / probing (pain points) / closing (expectations); use [user-research-interview-template.md](../../knowledge-curator/templates/user-research-interview.md). 
3. **5-user rule**: usability testing with 5-8 people covers 80% of usability issues; do not draw conclusions from a single user. 
4. **Kano stratification**: basic (must-have) / performance (more is better) / excitement (delight); MVP only covers basic + core performance; see [kano-model-summary.md](../../product-manager/frameworks/kano-model.md). 
5. **Nielsen heuristics**: 10 usability heuristics; combine walkthrough + heuristics + user testing; see [nielsen-heuristics-summary.md](../discovery/ux--nielsen-heuristics.md). 
6. **AI product UX**: streaming / reference / feedback / cancel / retry / degrade; do not copy traditional UX; see [ai-product-ux-patterns-summary.md](../discovery/ux--ai-product-ux-patterns.md). 
7. **Cross-cultural**: copy / privacy / color / metaphor / gesture adapted by region; see [cross-cultural-ux-summary.md](../discovery/ux--cross-cultural-ux.md). 
8. **Quantitative + qualitative**: qualitative digs into causes + quantitative measures distribution; do not do only one side. 
9. **Visual testing**: use [after-sales-pad-visual-review-summary.md](../discovery/ux--after-sales-pad-visual-review.md) as a visual review template. 
10. **Conclusions**: must produce user personas + pain-point lists + opportunity points + priorities (RICE); archive into PRD; see [rice-ice-prioritization-summary.md](../../product-manager/frameworks/rice-ice-prioritization.md) + [prd.md](../../knowledge-curator/templates/prd.md). 
11. **Stakeholders**: high-impact high-attention users must be interviewed in depth; see [stakeholder-map.md](../../knowledge-curator/people/stakeholders--stakeholder-map.md). 
12. **External experts**: pull in external experts when industry / technical depth is insufficient; see [external-experts-roster.md](../../knowledge-curator/people/experts--external-experts-roster.md). 

## Anti-patterns

- **Interviewing stakeholders as a proxy for interviewing users.** When the PM interviews the sales team about what customers want, the signal passes through two layers of interpretation: the customer's incomplete articulation of their need, and the salesperson's translation of that need into a feature request. The result is a feature that solves the salesperson's problem (closing a deal) rather than the customer's problem. Internal stakeholders are a source of hypotheses, not a source of validated needs.

- **Leading questions that produce the answers the interviewer wants to hear.** "Would you find it helpful if the system automatically suggested templates?" is not a research question — it is a sales pitch disguised as research. The user will say yes to be agreeable. The correct question: "Walk me through the last time you created a document from scratch. What was frustrating about that process?" The user's unprompted mention of templates is worth 100x more than a prompted yes.

- **Usability testing without task scenarios.** Asking a user to "explore the interface and tell me what you think" produces random feedback about visual preferences, not actionable data about task completion. Every usability test must have a specific task scenario: "Your manager has asked you to create a monthly sales report. Using this tool, please do that now." The observer watches silently and notes where the user hesitates.

- **Research-as-validation: designing studies to prove the team is right.** When the research plan is written to confirm the product roadmap rather than to discover user needs, the study is a justification exercise. The test: before the research begins, write down "what would we need to see to change our minds about feature X?" If the team cannot answer this question, the research is designed to confirm, not to learn.

- **The research report that no one reads.** A 30-page research report with detailed personas, journey maps, and recommendations that sits in a shared drive is a waste of the research budget. The output of research is not a document — it is a change in team behavior. The researcher's job is only half done when the report is written; the other half is socializing the findings in Sprint Planning, design reviews, and roadmap discussions until the insights become shared team knowledge.

## Related

- Same-class journey: [../product/write-a-prd.md](../discovery/write-a-prd.md) — research output lands in PRD
- Same-class journey: [../../engineer/lessons/learn-pm-frameworks.md](../../engineer/lessons/learn-pm-frameworks.md) — PM framework comparison
- Same-class journey: [../../engineer/quality-security/run-an-experiment.md](../../engineer/quality-security/run-an-experiment.md) — assumption validation
- Same-class journey: [../../engineer/process/measure-product-metrics.md](../../engineer/process/measure-product-metrics.md) — quantification
- Upstream: [../../product-manager/discovery/ux--README.md](../discovery/ux--README.md) — ux leaf entry
