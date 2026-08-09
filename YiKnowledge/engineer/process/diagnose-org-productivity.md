---
title: Diagnose org productivity
aliases:
- I want to diagnose org productivity
- org-productivity-journey
- engineering productivity diagnosis entry
- DORA / SPACE entry
tags:
- journeys
- org-productivity
- engineering-productivity
- DORA
- SPACE
- iteration-pm-handbook
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
benefit: outcome is traceable
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ./run-iteration-meetings.md
- ../../tech-lead/roadmap/plan-tech-roadmap.md
- ../../README.md
- ../../knowledge-curator/templates/thinking--second-order-thinking.md
review_cycle: quarterly
tacit: false
---

# I want to diagnose org productivity

> **As an** engineer, **I want to** diagnose org productivity, **so that** outcome is traceable.

> Reach DORA / SPACE + engineering-productivity-metrics + org-productivity-diagnosis + iteration-pm-handbook + Thinking frameworks within 2 hops for "how to diagnose org productivity + how to build engineering productivity metrics + how to tune iteration cadence".

## Summary

- Productivity metrics: go [engineering-productivity-metrics-summary.md](../process/engineering-productivity-metrics.md): DORA four pieces (deploy frequency / change lead time / change failure rate / service recovery time) + SPACE framework
- Diagnosis: go [org-productivity-diagnosis-summary.md](../process/org-productivity-diagnosis.md): bottleneck location (requirement / R&D / QA / release / feedback) + 5 whys root cause
- Iteration cadence: go [iteration-pm-handbook-summary.md](../process/iteration-pm-handbook.md): weekly / review / retrospective meetings + Keep/Drop/Try
- Thinking frameworks: go [second-order-thinking](../../knowledge-curator/templates/thinking--second-order-thinking.md) + [inversion](../../knowledge-curator/templates/thinking--inversion.md) + [ockhams-razor](../../knowledge-curator/templates/thinking--ockhams-razor.md)

## Core viewpoints

- **DORA metrics are a diagnostic instrument, not a performance scorecard -- using them to rank teams creates perverse incentives.** When deploy frequency becomes a target, teams optimize for micro-commits that add no value. When change failure rate becomes a target, teams avoid changes altogether. The four DORA metrics only work when they are used to ask "what is the bottleneck?" not "which team is best?"

- **The SPACE framework's most important dimension is Satisfaction, and it is the one most teams ignore.** Deploy frequency and lead time are easy to measure; developer satisfaction is hard. But satisfaction is the leading indicator -- when it drops, the other metrics follow months later. Measuring only the lagging indicators means you discover the problem after the key engineers have already started interviewing elsewhere.

- **Productivity diagnosis must distinguish between capacity problems and throughput problems.** A team that delivers slowly because it is understaffed (capacity) needs a fundamentally different intervention than a team that delivers slowly because its PR review cycle takes 5 days (throughput). Conflating the two leads to hiring when you should be fixing process, or optimizing process when you should be hiring.

- **The bottleneck is never where the symptoms appear.** Requirements piling up in the backlog is a symptom; the bottleneck might be a review meeting that never converges, a QA infrastructure gap, or a product manager who cannot say no. The 5-whys analysis works because it forces the investigator to walk upstream from the symptom to the structural cause.

- **Second-order thinking is mandatory for any process change in a productivity diagnosis.** Shortening the review meeting from 60 to 30 minutes seems efficient, but the second-order effect may be that decisions are rushed, leading to rework during development, which increases total cycle time. Every productivity intervention must be evaluated for its downstream consequences, not just its immediate time savings.

## Key info

- **DORA metrics framework (4 metrics with elite/medium/low benchmarks)**: (1) Deployment Frequency — elite: on-demand (multiple per day), medium: weekly to monthly, low: monthly to quarterly; (2) Lead Time for Changes — elite: < 1 hour, medium: 1 day to 1 week, low: 1-6 months; (3) Change Failure Rate — elite: 0-5%, medium: 6-15%, low: 16-30%; (4) Time to Restore Service — elite: < 1 hour, medium: 1 day, low: 1 week. The benchmarks are from the DORA 2024 Accelerate State of DevOps report. The Yi-family projects: all metrics are "not applicable" (no production deployment to external users); the metrics framework is in place for when production deployment begins.
- **SPACE framework dimensions (5 dimensions with measurement methods)**: (1) Satisfaction — developer satisfaction and well-being; measured by quarterly survey (eNPS or custom), 1-on-1 feedback; (2) Performance — the outcomes of work; measured by DORA metrics, feature delivery rate, incident count; (3) Activity — the volume of work; measured by PR count, commit count, review count (caution: these are easily gamed); (4) Communication — how information flows; measured by PR review time, meeting hours per week, async vs. sync ratio; (5) Efficiency — the ability to complete work with minimal friction; measured by CI pipeline time, local build time, onboarding time to first PR. The Yi-family projects: no formal SPACE measurement; the framework is documented for when the team grows beyond 5 engineers.
- **Productivity bottleneck location methodology (5 stages with diagnostic questions)**: (1) Requirements — are requirements clear and stable when they reach engineering? Symptom: PRDs change during development, stories are re-estimated; (2) Development — does the code get written efficiently? Symptom: stories take longer than estimated, high bug rate during development; (3) Code Review — do PRs get reviewed promptly? Symptom: PR open > 2 days, large PRs (> 400 lines) that are hard to review; (4) QA/Testing — are bugs caught before release? Symptom: high bug escape rate, flaky tests, manual testing bottleneck; (5) Release — does the release process work smoothly? Symptom: release takes > 1 hour, rollback is manual, release-related incidents. The bottleneck is located by measuring the cycle time at each stage and finding the longest stage. The Yi-family projects: the primary bottleneck is Stage 1 (requirements) and Stage 3 (code review, limited by team size).
- **Iteration cadence diagnosis (5 signals of unhealthy cadence)**: (1) Sprint scope creep > 30% — stories added mid-sprint exceed 30% of planned capacity; (2) Carryover > 30% — stories carried to the next sprint exceed 30% of planned capacity; (3) Retrospective action items with no owner — action items from the last retro have no owner or due date; (4) Standup duration > 15 minutes — standups are becoming status meetings instead of coordination; (5) No "Keep/Drop/Try" decisions — the team is not making explicit process changes based on retrospectives. The Yi-family projects: iteration cadence is documented in `iteration-pm-handbook.md`; the team size (1-2 per project) makes formal iteration cadence less critical.
- **Productivity intervention evaluation framework**: Every proposed intervention must answer: (1) What bottleneck does this address? (2) What is the expected improvement (quantified)? (3) What is the second-order effect (what might break)? (4) How will we measure success? (5) What is the rollback plan if it makes things worse? The intervention is run as an experiment with a timebox (2-4 weeks) and a go/no-go decision at the end. The Yi-family standard: process changes are treated as experiments with explicit success criteria and rollback plans.
- **Yi-family org productivity state (2026-08)**: Team size — 1-2 engineers per project (YiAi, YiVad, YiPet), total ~3-4 engineers. No formal productivity measurement (DORA metrics are not applicable at this scale). The primary productivity constraint is team size, not process inefficiency. The productivity frameworks (DORA, SPACE, bottleneck diagnosis) are documented for when the team grows beyond 5 engineers. The iteration PM handbook provides the current process baseline.

## Scenario description

When team productivity drops / requirements pile up / launch slows / quality slips / collaboration friction, tech owner + PM + architecture group need to quantify diagnosis + locate bottlenecks + improve iteration cadence. This entry aggregates DORA / SPACE metrics, org productivity diagnosis, iteration PM handbook, and Thinking frameworks into a 2-hop path, avoiding "tuning cadence by feel / grabbing requirements instead of bottlenecks / changing process without validation".

## 2-hop reachability path

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [engineering-productivity-metrics-summary.md](../process/engineering-productivity-metrics.md) · [org-productivity-diagnosis-summary.md](../process/org-productivity-diagnosis.md) · [iteration-pm-handbook-summary.md](../process/iteration-pm-handbook.md) · [tech-roadmap-review-summary.md](../process/tech-roadmap-review.md) · [quarterly-tech-debt-process.md](../quality-security/quarterly-tech-debt.md) · [capacity-planning-process.md](../infrastructure/capacity-planning.md) · [shared-client-vendor-rollout.md](../engineering/shared-client-vendor-rollout.md) |
| `methodology/thinking/` | [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) · [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md) · [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md) · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking--ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking--flywheel-effect.md) |
| `methodology/pm-frameworks/` | [agile-pm-summary.md](./../../product-manager/frameworks/agile-product-management.md) · [scrum-summary.md](../../knowledge-curator/archive/strategies-legacy/engineer/prepare-a-scrum-strategy.md) · [okr-summary.md](../../knowledge-curator/archive/strategies-legacy/product-manager/prepare-a-okr-strategy.md) |
| `work/meetings/` | [weekly-report-sample.md](../../product-manager/delivery/weekly-report.md) · [daily-report-sample.md](../../product-manager/delivery/daily-report.md) · [retrospective-sample.md](../../product-manager/delivery/retrospective.md) · [review-meeting-template.md](../../product-manager/delivery/review-meeting.md) |
| `product/metrics/` | [product-metrics-summary.md](../../product-manager/discovery/metrics--README.md) · [north-star-metric-summary.md](../../product-manager/discovery/metrics--north-star-metric.md) — product metrics and engineering metrics co-build |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) — capacity / tech debt impact on productivity |
| `lessons/failures/` | [ai-product-launch-lessons-summary.md](../lessons/failure-ai-product-launch-lessons.md) · [incident-postmortem-summary.md](../lessons/failure-incident-postmortem.md) — productivity drop causing incident reference |
| `projects/` | each project `project-management-summary.md` §iteration cadence + §risk |

## Action recommendations

1. **quantify first**: DORA four pieces (deploy frequency / change lead time / change failure rate / service recovery time) + SPACE framework (Satisfaction / Performance / Activity / Communication / Efficiency) — no improvement without quantification.
2. **bottleneck location**: go [org-productivity-diagnosis-summary](../process/org-productivity-diagnosis.md), locate bottlenecks by requirement / R&D / QA / release / feedback segments.
3. **5 whys root cause**: do not grab symptoms ("requirements piling up") — chase root cause ("review meeting does not converge / PR review slow / QA infrastructure missing").
4. **Second-order thinking**: before changing process ask "second-order effect" (shorten review meeting -> whether it causes insufficient decisions -> launch incidents?) — see [second-order-thinking](../../knowledge-curator/templates/thinking--second-order-thinking.md).
5. **Inversion**: use [inversion](../../knowledge-curator/templates/thinking--inversion.md) "how to make team productivity worse" to reverse-derive improvement items.
6. **iteration cadence**: go [iteration-pm-handbook](../process/iteration-pm-handbook.md), weekly / review / retrospective trio + Keep/Drop/Try continuous improvement.
7. **Quarterly audit**: scan [tech-roadmap-review-summary](../process/tech-roadmap-review.md) + [quarterly-tech-debt](../quality-security/quarterly-tech-debt.md) for quarterly high-interest debt.
8. **capacity / tech debt alignment**: productivity drops often stem from insufficient capacity / accumulated tech debt — go [capacity-and-cost](../../oncall-sre/observability/capacity-and-cost.md) + [tech-debt-inventory](../../oncall-sre/observability/tech-debt-inventory.md).

## Anti-patterns

- **Using DORA metrics as a team ranking system.** When deploy frequency and change failure rate are used to compare teams, teams optimize the metric rather than the outcome. One team deploys 50 trivial config changes per day to win the leaderboard; another stops deploying risky changes to avoid failure rate penalties. The metrics become detached from value delivery.

- **Starting a productivity diagnosis without baseline measurements.** "The team feels slow" is not a diagnosis; it is an anecdote. Before changing any process, measure the current state of all four DORA metrics and at least one SPACE dimension. Without baselines, you cannot distinguish between a real productivity decline and a perception shift caused by a single frustrating incident.

- **Applying the same productivity intervention to every team.** A team blocked by slow PR reviews needs a different fix than a team blocked by ambiguous requirements. The organization that mandates "daily standups for all teams" without diagnosing per-team bottlenecks is treating symptoms with a one-size-fits-all prescription that helps some teams and annoys others.

- **Focusing exclusively on engineering metrics while ignoring product and business metrics.** A team that ships faster but builds the wrong thing is not more productive -- it is more efficiently wasteful. Engineering productivity metrics must be triangulated with product metrics (are users getting value?) and business metrics (is revenue growing?) to distinguish between "moving fast" and "moving in the right direction."

- **Running a productivity diagnosis as a one-time project rather than a continuous feedback loop.** Productivity is a dynamic property -- it changes as team composition, codebase complexity, and business priorities shift. A diagnosis from Q1 is stale by Q3. The diagnosis must be embedded in the iteration cadence (quarterly review) with a lightweight check-in monthly, not treated as a special project that ends when the report is delivered.

## Related

- Related journey: [./run-iteration-meetings.md](./run-iteration-meetings.md) — iteration meeting
- Related journey: [../../tech-lead/roadmap/plan-tech-roadmap.md](../../tech-lead/roadmap/plan-tech-roadmap.md) — roadmap planning
- Related journey: [../../oncall-sre/incident-response/respond-to-an-incident.md](../../oncall-sre/incident-response/respond-to-an-incident.md) — productivity drop triggering incident
- Upstream: [../../knowledge-curator/governance/governance.md](../../knowledge-curator/governance/governance.md) — Quarterly audit cadence
