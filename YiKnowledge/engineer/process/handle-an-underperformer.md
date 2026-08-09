---
title: Handle an underperformer
aliases:
- I want to handle low performance
- underperformer-journey
- pip-journey
- performance-improvement-journey
- low-performance entry
tags:
- journeys
- underperformer
- pip
- performance
- hr
- feedback
- 1-on-1
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
- ../strategies/prepare-a-1-on-1.md
- ./mentor-and-grow-engineers.md
- ../strategies/prepare-a-succession-plan.md
- ../../knowledge-curator/people/team--team-overview.md
review_cycle: quarterly
tacit: false
---

# I want to handle an underperformer

> **As an** engineer, **I want to** handle an underperformer, **so that** incident is contained.

> "data + feedback + root cause + PIP + Monitoring + Decision + Communication + Retrospective" reach within 2 hops Process + Thinking + Case study.

## Summary

- Process go [requirement-review.md](../../product-manager/delivery/requirement-review.md) + [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) + [monitoring-governance-process.md](monitoring-governance.md)
- Thinking go [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking--ockhams-razor.md)
- Template go [one-on-one-template.md](../../knowledge-curator/templates/one-on-one.md) + [meeting-notes-template.md](../../knowledge-curator/templates/meeting-notes.md) + [retrospective-template.md](../../knowledge-curator/templates/retrospective.md)
- Case study go [ai-product-launch-lessons-summary.md](../lessons/failure-ai-product-launch-lessons.md) + [yivad-aicr-phase-port.md](../lessons/win-yivad-aicr-phase-port.md)

## Core viewpoints

- **The most dangerous underperformance situation is not the obvious one -- it is the ambiguous one that drifts for quarters without resolution.** A clearly failing engineer triggers action. An engineer who is "almost there" for six months creates a slow drain on team morale, as other members absorb the gap and wonder why nothing is done. The cost of indecision is higher than the cost of a wrong decision, because indecision compounds across the entire team.

- **Data without context is gaslighting; context without data is hearsay.** Telling an engineer "your velocity is below average" without showing the specific tasks, their complexity, and the comparison baseline feels like an attack. Telling them "people have mentioned concerns" without specific examples feels like a rumor. The SBI framework (Situation / Behavior / Impact) works because it anchors feedback in observable reality that the recipient can verify.

- **The PIP is not a termination tool -- it is a structured experiment to determine whether the gap is fixable.** A PIP with clear 30/60/90-day targets, objective measurements, and explicit end conditions answers the question that vague feedback never can: "is this person capable of meeting the bar with the right support, or is this a fundamental mismatch?" The outcome is information, not just a decision.

- **The second-order effects of handling an underperformer ripple through team psychology in ways that are hard to predict.** Removing someone can improve team velocity but also trigger survivor's guilt, fear of being next, or loss of institutional knowledge. Not removing someone can signal that mediocrity is tolerated, driving away top performers. The decision must account for these second-order effects, not just the immediate performance gap.

- **The mentor relationship is the most underused lever in underperformance situations.** Before escalating to a formal PIP, pairing the struggling engineer with a strong mentor often reveals whether the issue is skill (fixable), motivation (sometimes fixable), or fit (rarely fixable). The mentor's observational report after 4-6 weeks of close collaboration is worth more than a quarter of solo performance data.

## Key info

- **SBI feedback framework (Situation/Behavior/Impact)**: (1) Situation — anchor to a specific time and place ("In Tuesday's PR review for the chat module..."); (2) Behavior — describe the observable action, not the inferred intent ("...you pushed a commit without addressing the 3 review comments from Monday..."); (3) Impact — state the concrete consequence ("...which meant the SSE parser fix was deployed without the `releaseLock` guard, and it caused a connection leak in production"). The SBI framework works because it is verifiable: the recipient can check the PR, the commit, and the incident timeline. Feedback that skips SBI ("your work is sloppy") is unverifiable and feels like a personal attack.
- **PIP structure (30/60/90-day targets)**: Day 0-30: specific, measurable improvements (e.g., "all PRs must have test coverage for new code, review turnaround <4 hours, zero P0/P1 bugs introduced"). Day 30-60: demonstrate sustained improvement (same metrics, no regression). Day 60-90: independent execution (no mentor oversight, self-directed work). At each checkpoint: (1) metrics reviewed against targets, (2) mentor report submitted, (3) go/no-go decision made. The PIP ends at 90 days with one of three outcomes: meets bar (PIP closed, normal performance management resumes), progress but not there (PIP extended 30 days, one-time only), does not meet bar (separation). The PIP must be documented in writing, signed by both the engineer and the manager, and reviewed by HR.
- **Performance gap root cause taxonomy**: (1) Skill gap — the engineer lacks the technical ability for the role; fixable with training, mentoring, or role adjustment; (2) Motivation gap — the engineer has the skill but is disengaged; fixable by addressing the root cause (burnout, misalignment, personal issues); (3) Fit gap — the engineer's working style or values are incompatible with the team; rarely fixable, typically requires role change or separation; (4) Clarity gap — the engineer doesn't understand what's expected; fixable with clear expectations and regular feedback; (5) Resource gap — the engineer lacks tools, access, or support; fixable by removing blockers. The mentor's primary job is to determine which gap type is the root cause; the PIP strategy depends on the gap type.
- **Second-order team effects of handling/not handling underperformance**: (1) Top performers leaving — the #1 reason top engineers leave is watching underperformers stay without consequences; (2) Survivor's guilt — when someone is let go, remaining team members may feel guilty or anxious about their own job security; (3) Knowledge loss — the departing engineer may hold tacit knowledge not captured in documentation; (4) Team velocity dip — the team absorbs the departed engineer's workload during the backfill period, typically 1-3 months; (5) Morale recovery — after a fair and transparent PIP process, team morale typically improves within 4-6 weeks as the team sees that standards are enforced. The manager must communicate the decision transparently (within confidentiality limits) to prevent rumor-driven anxiety.
- **Documentation requirements for legal defensibility**: (1) Written feedback — every feedback conversation must be documented within 24 hours, including date, specific examples (SBI), and agreed actions; (2) Performance data — velocity, bug count, PR reviews, on-call incident response, compared to team average; (3) Improvement plan — PIP document with specific metrics, signed by both parties; (4) Check-in notes — every PIP checkpoint meeting must be documented with metrics, mentor report, and decision; (5) HR involvement — HR must be involved from the first formal feedback conversation, not brought in at the termination stage. The documentation is not for building a case against the engineer; it is for ensuring the process is fair, transparent, and defensible if challenged.
- **Yi-family underperformance context**: The Yi-family projects are a small team (estimated 3-5 engineers across 3 projects). In small teams, underperformance has an outsized impact: one underperforming engineer in a 4-person team is 25% of capacity. The mentor relationship is the primary lever (no formal PIP process exists). The tacit knowledge risk is high — if a struggling engineer leaves, the knowledge gap affects a significant portion of the codebase. The Yi-family projects currently have no documented performance management process.

## Scenario description

Handling low performance / PIP / performance improvement / not meeting bar / dragging team down / firing / resignation handling / key person switching role and declining / quarterly performance review / half-year performance review / 360 feedback integration / low performance alert, when, TL + sponsor + HR need to look up Process + Thinking + Case study. This entry aggregates low performance handling related Process + Thinking + Case study into 2-hop path, avoid "data hollow / feedback delayed / root cause shallow / PIP drift / Monitoring absent / Decision gut call / Communication delayed / Retrospective absent".

## 2-hop reachability path

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [requirement-review.md](../../product-manager/delivery/requirement-review.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) · [iteration-pm-handbook-process.md](iteration-pm-handbook.md) · [monitoring-governance-process.md](monitoring-governance.md) · [quarterly-tech-debt-process.md](../quality-security/quarterly-tech-debt.md) |
| `resources/templates/` | [one-on-one-template.md](../../knowledge-curator/templates/one-on-one.md) · [meeting-notes-template.md](../../knowledge-curator/templates/meeting-notes.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) |
| `resources/prompts/` | [weekly-report-prompt.md](../../ai-engineer/methodology/prompts--weekly-report.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts--code-review.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md) — low performance essence · [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md) — Inversion imagine Incident · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) — chain · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking--ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking--flywheel-effect.md) · [strong-opinions-loosely-held-summary.md](../../knowledge-curator/templates/thinking--strong-opinions-loosely-held.md) |
| `methodology/pm-frameworks/` | [okr-design-summary.md](../../product-manager/frameworks/okr-design.md) · [jobs-to-be-done-summary.md](../../product-manager/frameworks/jobs-to-be-done.md) · [rice-ice-prioritization-summary.md](../../product-manager/frameworks/rice-ice-prioritization.md) |
| `work/collaboration/` | [raci-matrix-summary.md](raci-matrix.md) · [async-collaboration-principles-summary.md](async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](cross-timezone-collaboration.md) · [contract-negotiation-summary.md](../../knowledge-curator/archive/strategies-legacy/engineer/prepare-a-contract-strategy.md) |
| `work/meetings/` | [review-meeting-template.md](../../product-manager/delivery/review-meeting.md) · [weekly-meeting-template.md](../../product-manager/delivery/weekly-meeting.md) · [retrospective-sample.md](../../product-manager/delivery/retrospective.md) · [weekly-report-sample.md](../../product-manager/delivery/weekly-report.md) |
| `people/team--` | [team-overview.md](../../knowledge-curator/people/team--team-overview.md) · [roster.md](../../knowledge-curator/people/team--roster.md) — performance matrix |
| `people/stakeholders--` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders--stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders--communication-cadence.md) — Communication |
| `people/experts--` | [external-experts-roster.md](../../knowledge-curator/people/experts--external-experts-roster.md) — HR consultant |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics--north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics--ai-product-metrics.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../architecture-design/ssot-view-layer.md) · [eval-driven](../engineering/evaluation-driven-development.md) · [contract-test-baseline-pattern.md](../quality-security/contract-test-baseline.md) |
| `lessons/failures/` | [ai-product-launch-lessons-summary.md](../lessons/failure-ai-product-launch-lessons.md) · [incident-postmortem-summary.md](../lessons/failure-incident-postmortem.md) · [bugs/](../lessons) — performance Incident Archive |
| `lessons/wins/` | [yivad-aicr-phase-port.md](../lessons/win-yivad-aicr-phase-port.md) · [yiai-brd-agent-launch.md](../lessons/win-yiai-brd-agent-launch.md) |
| `lessons/gotchas/` | [macos-fsevents-silent-drop.md](../lessons/gotcha-macos-fsevents-silent-drop.md) · [sse-ondone-guard.md](../lessons/gotcha-sse-ondone-guard.md) |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `projects/` | each project `project-management-summary.md` §Role + `onboarding.md` §expects |
| `journeys/` | [../strategies/prepare-a-1-on-1.md](../../knowledge-curator/archive/strategies-legacy/engineer/prepare-a-1-on-1.md) · [./mentor-and-grow-engineers.md](./mentor-and-grow-engineers.md) · [../strategies/prepare-a-succession-plan.md](../../knowledge-curator/archive/strategies-legacy/engineer/prepare-a-succession-plan.md) · [../../oncall-sre/incident-response/handle-a-team-conflict.md](../../oncall-sre/incident-response/handle-a-team-conflict.md) |

## Action recommendations

1. **First principles**: first ask "does low performance really exist / is data sufficient / ROI / user impact / what happens if not handled"; do not fire and fire; see [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md).
2. **Inversion**: first imagine "how handling can fail (false accusation / trust collapse / key person leaves / arbitration / legal Risk)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md).
3. **Second-order effects**: fire one person → team atmosphere changes → backup matrix changes → another adjustment; follow [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md).
4. **Occam's razor**: simplest handling satisfying requirement wins; do not pile up Process; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking--ockhams-razor.md).
5. **data**: must do objective data (speed / quality / Collaboration / oncall / feedback) + must cross 2-3 sprints + must multi-person feedback; follow [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md).
6. **root cause**: must do 5 whys; common root causes: skill mismatch / unclear expects / people issues / Process issues / tool issues / team atmosphere.
7. **1:1**: must do [one-on-one-template.md](../../knowledge-curator/templates/one-on-one.md); listen before judge + must biweekly 1:1 + must monthly sponsor 1:1.
8. **feedback**: must do SBI (situation / behavior / impact) + must specific example + must actionable + must audit trail.
9. **PIP**: must do PIP + must 30/60/90 days + must explicit target + must explicit measurement + must explicit end condition.
10. **mentor**: must do [i-want-to-mentor-and-grow-engineers.md](./mentor-and-grow-engineers.md); must pair mentor + must land growth plan.
11. **OKR**: must do [okr-design-summary.md](../../product-manager/frameworks/okr-design.md) + must align + must quarterly check.
12. **RACI**: must do [raci-matrix-summary.md](raci-matrix.md); TL / sponsor / HR / mentor owner.
13. **strong opinions loosely held**: must do [strong-opinions-loosely-held-summary.md](../../knowledge-curator/templates/thinking--strong-opinions-loosely-held.md) when communicating with employee; clear stance + leave dialogue room.
14. **cross timezone**: must do [cross-timezone-collaboration-summary.md](cross-timezone-collaboration.md); remote handling needs double audit trail.
15. **HR**: must do HR pre-review + must external legal counsel review; follow [external-experts-roster.md](../../knowledge-curator/people/experts--external-experts-roster.md).
16. **Communication**: must do [communication-cadence.md](../../knowledge-curator/people/stakeholders--communication-cadence.md) Communication sponsor + HR + team (no smear).
17. **monitoring**: must do [monitoring-governance-process.md](monitoring-governance.md) Monitoring team health + turnover + atmosphere.
18. **Freeze period**: during big-promo follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) do not move personnel.
19. **Retrospective**: after handling, must do [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) Retrospective + Archive [bugs/](../lessons).
20. **Quarterly audit**: follow [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) scan performance matrix whether still accurate + whether still has low performance unhandled.
21. **ADR**: performance Decision must land ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md).
22. **Flywheel**: handle smooth → team align → business up → trust rises; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking--flywheel-effect.md).

## Anti-patterns

- **Delaying the first direct feedback conversation because "I want to gather more data."** Leaders often wait until they have a perfect evidence file before speaking to the underperformer, but during that waiting period, the behavior continues and the team's frustration grows. The first conversation should happen as soon as a pattern is observed, not when the case is airtight. Early, informal feedback is more effective and less adversarial than a delayed, fully-documented confrontation.

- **Using velocity or story points as the sole performance metric.** Story points measure estimation accuracy and delivery throughput, not code quality, collaboration, oncall responsiveness, or mentoring. An engineer who closes 20 trivial tickets per sprint looks great on velocity but may be avoiding complex work, leaving bugs for others, or ignoring oncall responsibilities. Performance data must be multi-dimensional.

- **Running a PIP as a checkbox exercise to justify a predetermined termination decision.** A PIP that sets unachievable targets, provides no support, and is designed to produce documentation for HR rather than improvement for the engineer is a dishonest process. It destroys trust with the individual and the team, and creates legal exposure. The PIP must be a genuine attempt at improvement, even if the outcome is uncertain.

- **Handling the underperformer in isolation without considering the team's information needs.** While the details of a PIP are confidential, the team knows something is happening and will fill the information vacuum with rumors. The leader must communicate what they can (without violating confidentiality): that the situation is being addressed, that the team's concerns have been heard, and that the process is fair and structured.

- **Failing to run a retrospective after the handling concludes, regardless of outcome.** Whether the engineer improves and stays, or leaves, the team and the leader should ask: what could we have done earlier? Was the role definition clear? Were there onboarding gaps? The retrospective is not about the individual -- it is about whether the system (hiring, onboarding, expectations-setting, feedback cadence) set them up to succeed or fail.

## Related

- Related journey: [../strategies/prepare-a-1-on-1.md](../../knowledge-curator/archive/strategies-legacy/engineer/prepare-a-1-on-1.md) — 1:1
- Related journey: [./mentor-and-grow-engineers.md](./mentor-and-grow-engineers.md) — mentor
- Related journey: [../strategies/prepare-a-succession-plan.md](../../knowledge-curator/archive/strategies-legacy/engineer/prepare-a-succession-plan.md) — successor
- Related journey: [../../oncall-sre/incident-response/handle-a-team-conflict.md](../../oncall-sre/incident-response/handle-a-team-conflict.md) — team conflict
- Upstream: [../../knowledge-curator/people/team--README.md](../../knowledge-curator/people/team--README.md) — team leaf entry
