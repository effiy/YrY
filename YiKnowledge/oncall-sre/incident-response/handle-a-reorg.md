---
title: Handle a reorg
aliases:
- I want to handle an org restructure
- reorg-journey
- org-change-journey
- org restructure entry
tags:
- journeys
- reorg
- org-change
- team-restructure
- communication
category: oncall-sre/incident-response
created: 2026-08-03
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
roles:
- oncall-sre
- engineer
benefit: incident is contained
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ../../knowledge-curator/archive/strategies-legacy/engineer/prepare-a-succession-plan.md
- ./handle-a-team-conflict.md
- ../../knowledge-curator/archive/strategies-legacy/engineer/prepare-an-all-hands.md
- ../../knowledge-curator/people/team/team-overview.md
review_cycle: quarterly
tacit: false
last_verified: 2026-08-07
---

# I want to handle a reorg

> **As a** oncall sre, **I want to** handle a reorg, **so that** incident is contained.

> "goal + scope + reporting + knowledge transfer + 1:1 + monitoring + retrospective + quarterly audit" process, thinking, and case studies reachable within 2 hops.

## Summary

- process: [knowledge-transfer-process.md](../../engineer/process/knowledge-transfer.md) + [project-handover-process.md](../../engineer/process/project-handover.md) + [iteration-pm-handbook-process.md](../../engineer/process/iteration-pm-handbook.md)
- thinking: [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md)
- reporting: [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) + [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) + [i-want-to-prepare-an-all-hands.md](../../knowledge-curator/archive/strategies-legacy/engineer/prepare-an-all-hands.md)
- case studies: [ai-product-launch-lessons-summary.md](../../engineer/lessons/failure-ai-product-launch-lessons.md) + [yiai-brd-agent-launch.md](../../engineer/lessons/win-yiai-brd-agent-launch.md) + [incident-postmortem-summary.md](../../engineer/lessons/failure-incident-postmortem.md)

## Core viewpoints

**A reorg is a product launch, not a management decision.**
The most common failure mode is treating a reorg as an announcement: "the new org chart is live as of Monday." A reorg is a change management project that must be designed, communicated, and supported with the same rigor as a product launch. The new org structure is the product; the team members are the users. If the users do not understand the new structure, do not agree with the rationale, and do not have the tools to succeed in it, the reorg has failed regardless of how elegant the org chart looks.

**The most important communication in a reorg is the "why."**
Teams can accept a reorg that changes their role, their manager, and their team if they understand and believe in the rationale. They cannot accept a reorg where the rationale is "leadership decided." The "why" must connect the reorg to business strategy, product goals, and team health. Every impacted person should be able to explain why the reorg is happening, even if they disagree with it. If the rationale is not clear enough to be repeated by the team, it is not clear enough to be announced.

**The knowledge transfer period is the single most underinvested part of a reorg.**
A 2-week handoff period is not enough for a role that took 2 years to build expertise in. The knowledge transfer must be structured: shadowing, documentation, pair work, and a formal assessment of readiness. The departing team member must be available for questions for at least 4 weeks after the transition. Cutting the knowledge transfer short to save time creates a knowledge gap that takes months to fill and causes incidents during that period.

**The reorg is not complete until the new team has operated through a full iteration cycle.**
The first week after a reorg feels productive because everyone is in learning mode. The real test comes in weeks 3-4, when the team faces its first real decision, its first conflict, and its first deadline under the new structure. The reorg must include a 30-60-90 day check-in plan with structured retrospectives at each milestone. If the team cannot operate effectively after one full iteration cycle, the reorg needs adjustment.

## Scenario

Handling an org restructure / reorg / team refactor / department merger / department split / key personnel transfer / business line adjustment / strategy adjustment / quarterly org retrospective / large-scale reorg, TL + business owner + sponsor + HR need to look up process + thinking + case studies. This entry aggregates reorg-related process + thinking + case studies into a 2-hop path, avoiding "unclear goals / messy scope / lagging reporting / knowledge gaps / missing 1:1s / monitoring gaps / missing retrospective / no quarterly audit".

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [knowledge-transfer-process.md](../../engineer/process/knowledge-transfer.md) · [project-handover-process.md](../../engineer/process/project-handover.md) · [iteration-pm-handbook-process.md](../../engineer/process/iteration-pm-handbook.md) · [cross-team-collaboration-process.md](../../engineer/process/cross-team-collaboration.md) · [requirement-review.md](../../product-manager/delivery/requirement-review.md) · [design-review.md](../../product-manager/delivery/design-review.md) · [tech-review.md](../../product-manager/delivery/tech-review.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — old and new org charts |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — reorg reporting |
| `people/experts/` | [external-experts-roster.md](../../knowledge-curator/people/experts/external-experts-roster.md) — external advisors |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — reorg intent · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — reverse-think loss of control · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain reaction · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) · [strong-opinions-loosely-held-summary.md](../../knowledge-curator/templates/thinking/strong-opinions-loosely-held.md) · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) |
| `methodology/pm-frameworks/` | [okr-design-summary.md](../../product-manager/frameworks/okr-design.md) · [jobs-to-be-done-summary.md](../../product-manager/frameworks/jobs-to-be-done.md) · [rice-ice-prioritization-summary.md](../../product-manager/frameworks/rice-ice-prioritization.md) · [product-discovery-summary.md](../../knowledge-curator/archive/strategies-legacy/product-manager/prepare-a-product-discovery-strategy.md) · [dual-track-agile-summary.md](../../product-manager/frameworks/dual-track-agile.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [eval-driven](../../engineer/engineering/evaluation-driven-development.md) · [dual-world-boundary-pattern.md](../../engineer/engineering/dual-world-boundary.md) · [contract-test-baseline-pattern.md](../../engineer/quality-security/contract-test-baseline.md) |
| `resources/templates/` | [meeting-notes-template.md](../../knowledge-curator/templates/meeting-notes.md) · [one-on-one-template.md](../../knowledge-curator/templates/one-on-one.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) |
| `resources/prompts/` | [weekly-report-prompt.md](../../ai-engineer/methodology/prompts/weekly-report.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) |
| `work/meetings/` | [review-meeting-template.md](../../product-manager/delivery/review-meeting.md) · [weekly-meeting-template.md](../../product-manager/delivery/weekly-meeting.md) · [retrospective-sample.md](../../product-manager/delivery/retrospective.md) · [weekly-report-sample.md](../../product-manager/delivery/weekly-report.md) · [daily-report-sample.md](../../product-manager/delivery/daily-report.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/process/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/process/cross-timezone-collaboration.md) · [contract-negotiation-summary.md](../../knowledge-curator/archive/strategies-legacy/engineer/prepare-a-contract-strategy.md) |
| `product/strategy/` | [product-strategy-summary.md](../../knowledge-curator/archive/strategies-legacy/product-manager/prepare-a-product-strategy.md) · [now-next-later-roadmap-summary.md](../../executive/strategy/now-next-later-roadmap.md) · [second-curve-summary.md](../../executive/strategy/second-curve.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/win-yiai-brd-agent-launch.md) · [yipet-stack-migration-win.md](../../engineer/lessons/win-yipet-stack-migration.md) · [yry-vite-to-rsbuild-migration-win.md](../../engineer/lessons/win-yry-vite-to-rsbuild-migration.md) · [yivad-leaf-view-leaves-ssot-win.md](../../engineer/lessons/win-yivad-leaf-view-leaves-ssot.md) |
| `lessons/failures/` | [ai-product-launch-lessons-summary.md](../../engineer/lessons/failure-ai-product-launch-lessons.md) · [incident-postmortem-summary.md](../../engineer/lessons/failure-incident-postmortem.md) · [bugs/](../../engineer/lessons) — reorg failure archive |
| `lessons/gotchas/` | [macos-fsevents-silent-drop.md](../../engineer/lessons/gotcha-macos-fsevents-silent-drop.md) · [sse-ondone-guard.md](../../engineer/lessons/gotcha-sse-ondone-guard.md) |
| `industry/` | [ai-industry-report.md](../../executive/industry/reports/ai-industry-report.md) · [ai-market-trend-first-half.md](../../executive/industry/market-trends/ai-market-trend-first-half.md) — strategy background |
| `projects/` | each project `project-management-summary.md` + `onboarding.md` + `architecture-summary.md` |
| `journeys/` | [../../knowledge-curator/archive/strategies-legacy/engineer/prepare-a-succession-plan.md](../../knowledge-curator/archive/strategies-legacy/engineer/prepare-a-succession-plan.md) · [./handle-a-team-conflict.md](./handle-a-team-conflict.md) · [../../knowledge-curator/archive/strategies-legacy/engineer/prepare-an-all-hands.md](../../knowledge-curator/archive/strategies-legacy/engineer/prepare-an-all-hands.md) · [../../engineer/process/mentor-and-grow-engineers.md](../../engineer/process/mentor-and-grow-engineers.md) |

## Action recommendations

1. **first principles**: first ask "what does reorg solve / what happens if not adjusted / ROI / user impact"; do not adjust for the sake of adjusting; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
2. **inversion**: first imagine "reorg could go out of control (project stalls / knowledge gaps / key people leave / user churn / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
3. **second-order effects**: one adjustment -> backup matrix changes -> cross-people re-familiarize -> another adjustment; see [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md).
4. **Occam**: the simplest adjustment that meets the strategy goal wins; do not over-shuffle; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md).
5. **strategy**: must run [product-strategy-summary.md](../../knowledge-curator/archive/strategies-legacy/product-manager/prepare-a-product-strategy.md) + [second-curve-summary.md](../../executive/strategy/second-curve.md); strategy adjustment drives org adjustment.
6. **goal**: must run OKR alignment + business metrics + quarterly milestones; see [okr-design-summary.md](../../product-manager/frameworks/okr-design.md) + [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md).
7. **scope**: must list impacted teams / projects / services / sponsors / customers / contracts; see [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md).
8. **RACI**: must run [raci-matrix-summary.md](../../engineer/process/raci-matrix.md); re-decide new org primary / backup / informed.
9. **knowledge transfer**: must run [knowledge-transfer-process.md](../../engineer/process/knowledge-transfer.md) + [project-handover-process.md](../../engineer/process/project-handover.md); 2-4 weeks shadow + assessment.
10. **1:1**: must run [one-on-one-template.md](../../knowledge-curator/templates/one-on-one.md); weekly 1:1 for each impacted member + monthly sponsor 1:1.
11. **reporting**: must run [i-want-to-prepare-an-all-hands.md](../../knowledge-curator/archive/strategies-legacy/engineer/prepare-an-all-hands.md) + [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md); do not hide + do not delay + no empty talk.
12. **strong opinions loosely held**: must run [strong-opinions-loosely-held-summary.md](../../knowledge-curator/templates/thinking/strong-opinions-loosely-held.md) when communicating with team; clear stance + leave room for dialogue.
13. **cross-timezone**: must run [cross-timezone-collaboration-summary.md](../../engineer/process/cross-timezone-collaboration.md); tiered multi-timezone reporting.
14. **freeze period**: during big promos follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) and do not reorg.
15. **monitoring**: must run [monitoring-governance-process.md](../../engineer/process/monitoring-governance.md); post-reorg production metrics + user feedback + team health.
16. **retrospective**: at 30 / 60 / 90 days after reorg must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive [bugs/](../../engineer/lessons).
17. **process improvement**: after retrospective must land process improvements + quarterly scan of same class.
18. **ADR**: reorg decisions must land ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md).
19. **quarterly audit**: follow [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) to scan whether the new org still aligns with strategy + whether the backup matrix is still accurate.
20. **flywheel**: reorg goes well -> team aligns -> business grows -> trust rises -> more investment; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md).

## Anti-patterns

- **Announcing the reorg before the details are finalized.** The worst possible scenario is: "we are reorganizing, details to follow next week." This creates a week of anxiety, rumor, and speculation. Every person in the organization will assume the worst about their own role. The reorg must be announced in a single communication that includes: the new structure, each person's role in it, the rationale, and the transition timeline. If the details are not ready, the announcement is not ready.

- **Reorganizing without talking to the people being reorganized.** A reorg designed in a closed room by senior leadership without input from the teams being reorganized is a reorg that will be resisted. The people doing the work know where the friction points are, where the handoffs break, and where the ownership is unclear. Their input must be solicited before the reorg is designed, not after it is announced. A reorg that surprises the team is a reorg that the team will undermine.

- **Using a reorg to solve a people problem.** If a team is underperforming because of one person, reorganizing the entire team is the most expensive way to address the problem. The reorg should address structural issues: misaligned teams, unclear ownership, or duplicated effort. If the problem is a person, address it directly through performance management. Reorganizing to avoid a difficult conversation creates a worse structure and a worse culture.

- **Assuming the reorg is complete when the new org chart is published.** The org chart is the beginning of the reorg, not the end. The real work is: knowledge transfer, new reporting relationships, new collaboration patterns, and new team rituals. The reorg must have a dedicated transition owner who is accountable for the 30-60-90 day milestones. If the reorg is announced and then everyone returns to business as usual, the reorg will fail silently.

- **Failing to monitor team health metrics after the reorg.** The post-reorg period must be monitored as closely as a production deployment. Track: team velocity (does it recover?), incident rate (does it spike?), attrition signals (are people updating their LinkedIn profiles?), and engagement survey scores. If these metrics are not being tracked, the organization has no way to know whether the reorg is working or failing.

## Related

- similar journey: [../../knowledge-curator/archive/strategies-legacy/engineer/prepare-a-succession-plan.md](../../knowledge-curator/archive/strategies-legacy/engineer/prepare-a-succession-plan.md) — succession planning
- similar journey: [./handle-a-team-conflict.md](./handle-a-team-conflict.md) — team conflict
- similar journey: [../../knowledge-curator/archive/strategies-legacy/engineer/prepare-an-all-hands.md](../../knowledge-curator/archive/strategies-legacy/engineer/prepare-an-all-hands.md) — all-hands meeting
- similar journey: [../../engineer/process/mentor-and-grow-engineers.md](../../engineer/process/mentor-and-grow-engineers.md) — mentoring
- upstream: [../../knowledge-curator/people/team/README.md](../../knowledge-curator/people/team/README.md) — team leaf entry
