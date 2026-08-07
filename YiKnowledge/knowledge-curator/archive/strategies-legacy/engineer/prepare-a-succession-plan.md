---

title: I want to prepare a succession plan
aliases:
- I want to prepare a succession plan
- succession-plan-journey
- key-person-risk-journey
- succession-plan entry
tags:
- journeys
- succession-plan
- key-person-risk
- mentor
- knowledge-transfer
- bus-factor
category: engineer/strategies
created: 2026-08-03
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
roles:
- engineer
benefit: launch is safe
acceptance_criteria:
- frontmatter roles + benefit + acceptance_criteria present
- descriptive verb-phrase filename, hyphens only, underscores and digits forbidden
- body contains user-story header + 7 fixed-order sections
related:
- ../processes/mentor-and-grow-engineers.md
- ../../new-hire/onboarding/handoff-project.md
- ../../new-hire/onboarding/onboard-as-a-new-engineer.md
- ../../knowledge-curator/people/team/team-overview.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a succession plan

> **As an** engineer, **I want to** prepare a succession plan, **so that** launch is safe.

> "Bus factor + key person + backup + knowledge transfer + evaluation + quarterly audit + retrospective" reachable within 2 hops: process + thinking + case.

## Summary

- Process follows [knowledge-transfer-process.md](../../engineer/processes/knowledge-transfer.md) + [project-handover-process.md](../../engineer/process/project-handover.md) + [onboarding-process.md](../../new-hire/onboarding)
- Thinking follows [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md)
- Templates follow [one-on-one-template.md](../../knowledge-curator/templates/one-on-one.md) + [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) + [meeting-notes-template.md](../../knowledge-curator/templates/meeting-notes.md)
- Cases follow [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) + [ai-product-launch-lessons-summary.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario

When preparing succession / key-person risk / bus factor / backup coverage / resignation response / promotion / transfer / key person on long leave / key person incident / quarterly succession review / key-role backup, TLs + business owners + sponsors + HR need to consult process + thinking + cases. This entry aggregates succession-related process + thinking + cases into a 2-hop path, avoiding "single-point key person / empty backup / knowledge gap / missing evaluation / no quarterly audit / resignation backfire".

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [knowledge-transfer-process.md](../../engineer/processes/knowledge-transfer.md) · [project-handover-process.md](../../engineer/process/project-handover.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) · [cross-team-collaboration-process.md](../../engineer/process/cross-team-collaboration.md) · [iteration-pm-handbook-process.md](../../engineer/process/iteration-pm-handbook.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) |
| `work/onboarding/` | [onboarding-template.md](../../new-hire/onboarding) · [onboarding-checklist.md](../../new-hire/onboarding) — backup takeover via onboarding |
| `resources/templates/` | [one-on-one-template.md](../../knowledge-curator/templates/one-on-one.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [meeting-notes-template.md](../../knowledge-curator/templates/meeting-notes.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) · [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) |
| `resources/prompts/` | [weekly-report-prompt.md](../../ai-engineer/methodology/prompts/weekly-report.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) |
| `methodology/thinking/` | [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — invert the departure · [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — essence of succession · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain reaction · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) |
| `methodology/pm-frameworks/` | [okr-design-summary.md](../../product-manager/frameworks/okr-design.md) · [jobs-to-be-done-summary.md](../../product-manager/frameworks/jobs-to-be-done.md) · [rice-ice-prioritization-summary.md](../../product-manager/frameworks/rice-ice-prioritization.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [eval-driven](../../engineer/engineering/evaluation-driven-development.md) · [dual-world-boundary-pattern.md](../../engineer/engineering/dual-world-boundary.md) · [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — backup matrix |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) |
| `people/experts/` | [external-experts-roster.md](../../knowledge-curator/people/experts/external-experts-roster.md) — external consultants |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `work/meetings/` | [review-meeting-template.md](../../product-manager/meetings/review-meeting.md) · [weekly-meeting-template.md](../../product-manager/meetings/weekly-meeting.md) · [retrospective-sample.md](../../product-manager/delivery/retrospective.md) · [weekly-report-sample.md](../../product-manager/delivery/weekly-report.md) |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) · [yipet-stack-migration-win.md](../../engineer/lessons/wins/yipet-stack-migration.md) · [yivad-leaf-view-leaves-ssot-win.md](../../engineer/lessons/wins/yivad-leaf-view-leaves-ssot.md) |
| `lessons/failures/` | [ai-product-launch-lessons-summary.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [incident-postmortem-summary.md](../../engineer/lessons/failures/incident-postmortem.md) · [bugs/](../../engineer/lessons/failures/bugs) — departure backfire archive |
| `lessons/gotchas/` | [macos-fsevents-silent-drop.md](./../lessons/gotchas/macos-fsevents-silent-drop.md) · [sse-ondone-guard.md](./../lessons/gotchas/sse-ondone-guard.md) · [react-jsxdev-mismatch.md](./../lessons/gotchas/react-jsxdev-mismatch.md) · [no-lockfile-supply-chain-risk.md](./../lessons/gotchas/no-lockfile-supply-chain-risk.md) |
| `lifecycle/` | [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) · [knowledge-map.md](../../knowledge-curator/diagrams/knowledge-map.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [governance.md](../../knowledge-curator/governance/governance.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) |
| `projects/` | Each project's `onboarding.md` + `architecture-summary.md` + `project-management-summary.md` + `adr-*` |
| `journeys/` | [../processes/mentor-and-grow-engineers.md](../processes/mentor-and-grow-engineers.md) · [../../new-hire/onboarding/handoff-project.md](../../new-hire/onboarding/handoff-project.md) · [../../new-hire/onboarding/onboard-as-a-new-engineer.md](../../new-hire/onboarding/onboard-as-a-new-engineer.md) · [../processes/do-a-knowledge-audit.md](../processes/do-a-knowledge-audit.md) |

## Action recommendations

1. **First principles**: first ask "what is the key role / what's the bus factor / what happens if not done / ROI"; do not do succession for its own sake; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
2. **Inversion**: first imagine "what happens if the key person leaves (project stalls / knowledge gap / lost user traffic / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
3. **Second-order effects**: one succession → backup's raise expectations → cross-person takeover → another succession; see [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md).
4. **Occam**: the simplest backup that meets the need wins; do not pile up people; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md).
5. **Bus factor**: must scan key roles + bus factor < 2 must backfill; see [team-overview.md](../../knowledge-curator/people/team/team-overview.md) + [roster.md](../../knowledge-curator/people/team/roster.md).
6. **RACI**: must run [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); every key role must tag primary + backup + informed.
7. **Knowledge transfer**: must run [knowledge-transfer-process.md](../../engineer/processes/knowledge-transfer.md) + [project-handover-process.md](../../engineer/process/project-handover.md); 30-min chat + 1:1 + shadow.
8. **Tacit knowledge made explicit**: must scan tacit + must land [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) + must write [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md).
9. **Evaluation**: backup must pass evaluation + must ship independently + must be able to do oncall independently; see [eval-driven](../../engineer/engineering/evaluation-driven-development.md) + [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md).
10. **Onboarding**: backup takeover must run [onboarding-process.md](../../new-hire/onboarding) + 2-4 weeks shadow + mandatory assessment.
11. **1:1**: must run [one-on-one-template.md](../../knowledge-curator/templates/one-on-one.md); key person + backup weekly 1:1 + monthly sponsor 1:1.
12. **Mentor**: must run [i-want-to-mentor-and-grow-engineers.md](../processes/mentor-and-grow-engineers.md); backup must have a mentor + must land a growth plan.
13. **Cross time zone**: must run [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md); cross-time-zone backups are most robust.
14. **OKR**: backup must land [okr-design-summary.md](../../product-manager/frameworks/okr-design.md) + must align quarterly.
15. **Sponsor**: must run [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) to notify sponsor + quarterly review.
16. **Drill**: must run [i-want-to-run-a-game-day.md](../../oncall-sre/incident-response/run-a-game-day.md) + simulate key-person absent; see [chaos-engineering-process.md](../../engineer/processes/chaos-engineering.md).
17. **Freeze period**: during big promotions follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md); do not move the backup matrix.
18. **Communication**: backup onboarding must run [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) to notify internal and external.
19. **Retrospective**: backup failure must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + patch process + archive [bugs/](../../engineer/lessons/failures/bugs).
20. **Quarterly audit**: run [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) to scan whether the backup matrix is still accurate + whether the key person is still key.
21. **ADR**: key-role decisions must land an ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md).
22. **Flywheel**: more backups → confidence rises → dare to expand team → larger business; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md).

## Related

- Same-category journey: [../processes/mentor-and-grow-engineers.md](../processes/mentor-and-grow-engineers.md) — mentor
- Same-category journey: [../../new-hire/onboarding/handoff-project.md](../../new-hire/onboarding/handoff-project.md) — project handoff
- Same-category journey: [../../new-hire/onboarding/onboard-as-a-new-engineer.md](../../new-hire/onboarding/onboard-as-a-new-engineer.md) — onboarding
- Same-category journey: [../processes/do-a-knowledge-audit.md](../processes/do-a-knowledge-audit.md) — knowledge audit
- Upstream: [../../knowledge-curator/people/team/README.md](../../knowledge-curator/people/team/README.md) — team leaf entry
