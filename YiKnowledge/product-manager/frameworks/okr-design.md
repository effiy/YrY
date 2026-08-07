---
title: OKR Design Guide
aliases:
- OKR Design
- Objectives and Key Results
tags:
- PM
- methodology
- goal-setting
- okr
category: product-manager/frameworks
created: 2026-07-31
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: yearly
roles:
- product-manager
- executive
benefit: PMs can select and apply the right PM framework for their specific product challenge
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- heart-aarrr-metrics.md
- rice-ice-prioritization.md
- agile-product-management.md
- ../product/metrics/README.md
tacit: false
---

# OKR Design Guide

> **As a** product manager, **I want to** okr design, **so that** framework applied. 

> The objective (O) inspires, the key result (KR) is measurable; O is qualitative aspirational, KR is quantitative measurable. 

## Summary
- Andy Grove proposed it at Intel, John Doerr popularized it at Google (1999); O inspires + KR is measurable + limited count + transparent + not tied to compensation. 
- 3-5 O, each O with 3-5 KR; stretch goal 0.7 is excellent, long-term 0.9+ means goals are too conservative. 
- Quarterly cadence: 2 weeks before quarter company O drafted -> 1 week before quarter aligned -> start of quarter locked -> mid-quarter check -> end of quarter self-assessment -> after quarter retrospective. 
- KR is result not action; decoupled from bonuses; open to everyone; mid-quarter check is indispensable. 
- OKR and KPI are not mutually exclusive: OKR drives innovation and expansion, KPI drives baseline and compliance. 

## Core viewpoints

- **OKR is a learning system disguised as a goal-setting system.** The primary value of OKR is not achieving the O — it is discovering which KRs actually move the O and which do not. A team that achieves 100% of its KRs has learned nothing, because there was no gap between expectation and reality. The 0.7 target is designed to create a gap that generates learning. If you consistently hit 1.0, your targets are not ambitious enough, and you are depriving the team of the most valuable output of the OKR process: insight.

- **Decoupling OKR from compensation is the hardest and most important rule to follow.** The moment KRs affect bonuses, every KR becomes a negotiation about what is achievable rather than what is ambitious. Even a partial coupling (e.g., "OKR progress is one input to performance review") creates the same chilling effect. The only sustainable model is complete separation: OKR drives learning and alignment, a separate performance process drives compensation.

- **The mid-quarter check is the OKR process, not a checkpoint in it.** Most teams treat the mid-quarter check as a status update. The correct framing: it is the moment to kill KRs that are no longer relevant, add new ones that emerged, and reallocate resources. An OKR set that is unchanged at week 6 signals that the team is either ignoring new information or set goals that were too vague to be falsified.

- **KRs should measure outcomes the team can influence, not outcomes the team controls.** "Ship feature X" is a KR the team controls 100% — it is a task, not a result. "Increase customer first-time acceptance rate from 30% to 50%" is a KR the team influences but does not control — it requires the feature to be good, the onboarding to be clear, and the documentation to be accurate. This tension between influence and control is exactly what makes a KR stretch-worthy.

- **The cascade model (company → department → individual) is less effective than the alignment model.** When OKRs are cascaded top-down, each level waters down ambition to ensure achievability. The alignment model is superior: each team writes its own OKRs that align to the company's O, creating bottom-up ownership while maintaining top-down direction. The company O sets the "why," and teams determine the "how."


- **O inspires, KR is measurable** — O is not KPI, it should inspire the team; KR must have numbers that are verifiable. 
- **Stretch is core** — 0.7 completion is excellent; 100% completion means the goal was too conservative. 
- **Not tied to performance bonus** — Once tied to bonus, the team will not dare stretch, OKR loses its incentive. 
- **KR is result not action** — "Complete BRD project 100%" is action not result; "Customer first-time acceptance rate >= 70%" is. 
- **Mid-quarter check is indispensable** — Set at start of quarter then never reviewed becomes siloed; 4-6 week progress annotation. 

## Key information

### Framework origin

Objectives and Key Results, proposed by Andy Grove at Intel, popularized by John Doerr at Google (1999). Core proposition: **the objective (O) inspires, the key result (KR) is measurable. **

- O = qualitative, aspirational, time-bound
- KR = quantitative, measurable, verifiable

### Core principles

| Principle | Meaning |
|---|---|
| Inspire | O is not KPI, it should inspire the team |
| Measurable | KR must have numbers |
| Limited count | 3-5 O, each O with 3-5 KR |
| Transparent | Visible across the company, mutually viewable |
| Not tied to performance bonus | OKR non-completion does not impact salary, otherwise it loses incentive |
| Stretch | KR should be challenging, 70% completion is excellent |
| Two-way | Company -> department -> individual, top-down + bottom-up |

### Quarterly cadence

| Timing | Item |
|---|---|
| 2 weeks before quarter | Company O drafted |
| 1 week before quarter | Department / individual OKR alignment |
| Start of quarter | OKR locked and published |
| Mid-quarter (4-6 weeks)  | Mid-quarter check, progress 0-100% annotated |
| End of quarter | Self-assessment + peer review |
| After quarter | Retrospective, set next quarter direction |

### O writing guidelines

```
OK "Build the most trusted BRD generation capability in the industry"
OK "Let customers get a release-ready BRD in 10 minutes"
NG "Improve BRD quality" (no direction) 
NG "Complete BRD v2 project" (describes action, not goal) 
```

### KR writing guidelines

```
OK "BRD first-draft generation duration P50 <= 3 minutes"
OK "Customer first-time acceptance rate >= 70%"
OK "Multilingual terminology consistency (manual sampling) >= 95%"
NG "Significantly improve generation speed"
NG "BRD module completion 100%" (KR is result not action) 
```

### Self-assessment scoring

- 1.0 = fully achieved
- 0.7 = good (standard stretch goal) 
- 0.5 = partially achieved
- 0.3 = significantly lacking
- 0.0 = not started

Goal: average 0.6-0.7; long-term 0.9+ means goals too conservative. 

### Input / output artifacts

- Input: company strategy, previous quarter retrospective, user feedback
- Output: OKR documentation (one per team), publicly queryable
- Template: OKR template (to be added, [resources/templates/](../../knowledge-curator/templates)) 

### Comparison with other frameworks

| Framework | Nature | Suitable for |
|---|---|---|
| OKR | Stretch + autonomy | Mid-to-large, innovation |
| KPI | Must-hit + performance | Strong execution, compliance |
| North Star | Single focus | Company-wide alignment |
| SMART | Task-level | Individual goal setting |

OKR and KPI are not mutually exclusive: OKR drives innovation and expansion, KPI drives baseline and compliance. 

### Applicable scenarios and boundaries

**Applicable**: 

- Mid-to-large teams needing direction alignment
- Exploratory work (innovation, trial and error) 
- Long-term goals disconnected from near-term tasks

**Not applicable**: 

- Strong execution work (operations, ops) 
- Strong compliance requirements (medical, financial) KPI portions
- Early small teams (under 5 people, direct head-on alignment) 

## Action recommendations
1. 3-5 O, each O with 3-5 KR, more means loss of focus. 
2. Use qualitative aspirational phrasing for O, quantitative measurable phrasing for KR. 
3. KR is result not action: change "Complete X project 100%" to "Customer first-time acceptance rate >= 70%". 
4. Set stretch, average 0.6-0.7 is excellent; 100% completion means goals too conservative. 
5. Decouple from bonus, otherwise the team will not dare stretch. 
6. Publicly queryable across the company, cross-team alignment. 
7. Mid-quarter check (4-6 week progress annotation), end-of-quarter self-assessment + peer review, post-quarter retrospective to write next quarter direction. 

## Anti-patterns

- **OKR as a to-do list with bigger font.** When every KR starts with "Complete," "Launch," or "Deliver," the team has created a project plan, not OKRs. The test: if you can check off every KR without measuring anything, you have tasks, not results. Rewrite every action-verb KR as an outcome with a number and a direction.

- **Quarterly goal-setting without quarterly reflection.** The most common failure mode: teams spend 2 days setting OKRs at the start of the quarter, then never look at them again until the last week, when they scramble to justify progress. The mid-quarter check is not optional — it is the mechanism that transforms OKR from a paperwork exercise into a management practice. Skip it, and OKR becomes a quarterly ritual with no operational impact.

- **The "safe" KR: targets set at 100% achievable to ensure "success."** When every KR is set to a level the team is confident it can hit, the stretch is gone and so is the learning. A KR that the team is 90% confident of achieving is a KPI, not a KR. The discomfort of a 50%-confidence KR is the signal that it is ambitious enough.

- **OKR inflation: every team writes 5-7 Objectives because "everything is important."** When everything is important, nothing is. The 3-5 O limit is not a guideline — it is a forcing function. If a team cannot prioritize its work into 3-5 strategic objectives, the leadership team has not made hard enough choices. The excess Objectives are not stretch goals; they are an avoidance of prioritization.

- **OKR used as a reporting tool for leadership, not an alignment tool for the team.** When OKRs are written in a format optimized for executive review (PowerPoint-friendly, sanitized, risk-free), they lose their value to the team that is supposed to use them daily. The primary audience for OKRs is the team itself. If the team does not reference their OKRs in daily standups and Sprint Planning, the OKRs are decoration.


- **KR all action completion** — "Complete BRD project 100%"; change to result metrics. 
- **100% completion is the only success** — KR too conservative to dare stretch; set stretch, 0.7 is excellent. 
- **Tied to performance bonus** — Stretch spirit disappears; decouple from bonus. 
- **Not public** — Cross-team cannot align; everyone can query. 
- **Set at start of quarter then never reviewed** — Mid-quarter adjustment missing; Mid-quarter check. 
- **Too many KR** — 7-8 KR per O; 3-5 upper limit. 
- **Quarterly silo** — No retrospective, no iteration; end-of-quarter must retrospective, write next quarter direction. 

## Related
- Same category: [heart-aarrr-metrics-summary.md](./heart-aarrr-metrics.md) (OKR sets direction, HEART/AARRR measures progress) ; [rice-ice-prioritization-summary.md](./rice-ice-prioritization.md) (OKR sets direction, RICE prioritizes requirements) ; [agile-product-management-summary.md](./agile-product-management.md) (OKR works with iteration cadence) 
- Upstream: [../product/metrics/README.md](../discovery/metrics/README.md)
- Downstream: Team OKR documentation, quarterly retrospective

## References
- John Doerr — *Measure What Matters* (2018) 
- Christina Wodtke — *Radical Focus*
- re:Work Guide to OKRs: https://rework.withgoogle.com
