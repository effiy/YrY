---

title: I want to prepare an incident commander strategy
aliases:
- I want to prepare an incident commander strategy
- incident-commander-journey
- ic-journey
- ic-strategy-journey
- Incident commander entry
tags:
- journeys
- incident-commander
- incident-response
- escalation
- war-room
- on-call
category: oncall-sre/incident-response
created: 2026-08-03
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
roles:
- oncall-sre
- engineer
benefit: launch is safe
acceptance_criteria:
- frontmatter roles + benefit + acceptance_criteria present
- descriptive verb-phrase filename, hyphens only, underscores and digits forbidden
- body contains user-story header + 7 fixed-order sections
related:
- ./prepare-an-incident-response-plan.md
- ./run-a-war-room.md
- ./handle-an-oncall-shift.md
- ../../engineer/patterns/observability.md
review_cycle: quarterly
tacit: false
---

# I want to prepare an incident commander strategy

> **As a** oncall sre, **I want to** prepare an incident commander, **so that** launch is safe. 

> "IC + advisor + escalation + reporting + triage + decision + monitoring + retrospective + quarterly audit" reach within 2 hops Process + Thinking + Case study. 

## Summary

- Process via [incident-response-process.md](../../engineer/processes/incident-response.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md)
- Thinking via [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform via [observability-pattern](../../engineer/patterns/observability.md) + [graceful-degradation-pattern.md](../../engineer/patterns/graceful-degradation.md) + [circuit-breaker-pattern.md](../../engineer/patterns/circuit-breaker.md)
- Case study via [incident-postmortem-summary.md](../../engineer/lessons/failures/incident-postmortem.md) + [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md)

## Scenario

When preparing incident commander strategy / IC / incident commander / advisor + escalation + reporting + triage + decision + monitoring + retrospective + quarterly audit / IC training / IC on-call / IC during promo freeze / quarterly IC audit / IC retrospective, TL + oncall + architect + sponsor + security need to look up Process + Thinking + Case study. This entry aggregates incident commander related Process + Thinking + Case study into 2-hop paths, avoiding "IC gap / slow escalation / messy reporting / slow triage / vague decision / no quarterly audit". 

## 2-hop reachability paths

| Hop 1 (category/leaf)  | Hop 2 (specific file)  |
|---|---|
| `work/processes/` | [incident-response-process.md](../../engineer/processes/incident-response.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [code-review.md](../../engineer/processes/do-a-code-review.md) |
| `methodology/engineering-patterns/` | [observability-pattern](../../engineer/patterns/observability.md) · [graceful-degradation-pattern.md](../../engineer/patterns/graceful-degradation.md) · [circuit-breaker-pattern.md](../../engineer/patterns/circuit-breaker.md) · [rate-limiting-pattern.md](../../engineer/patterns/rate-limiting.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — IC intent · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — inversion runaway · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `resources/templates/` | [runbook](../../engineer/processes/write-a-runbook.md) · [incident-postmortem-template.md](../../engineer/lessons/failures/incident-postmortem.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) · [meeting-notes-template.md](../../knowledge-curator/templates/meeting-notes.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) |
| `resources/prompts/` | [weekly-report-prompt.md](../../ai-engineer/methodology/prompts/weekly-report.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) |
| `tech/ai-platform/` | [llm-observability-comparison-summary.md](../../ai-engineer/platform/llm-observability-comparison.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `work/meetings/` | [review-meeting-template.md](../../product-manager/meetings/review-meeting.md) · [retrospective-sample.md](../../product-manager/delivery/retrospective.md) |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — IC matrix |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — IC reporting |
| `lessons/failures/` | [incident-postmortem-summary.md](../../engineer/lessons/failures/incident-postmortem.md) · [bugs/](../../engineer/lessons/failures/bugs) — IC incident archive |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/gotchas/` | [sse-ondone-guard.md](./../../engineer/lessons/gotchas/sse-ondone-guard.md) · [macos-fsevents-silent-drop.md](./../../engineer/lessons/gotchas/macos-fsevents-silent-drop.md) |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `projects/` | Each project `architecture-summary.md` §incident + `adr-*` §IC |
| `journeys/` | [./prepare-an-incident-response-plan.md](./prepare-an-incident-response-plan.md) · [./run-a-war-room.md](./run-a-war-room.md) · [./handle-an-oncall-shift.md](./handle-an-oncall-shift.md) · [../../engineer/strategies/prepare-an-alerting-strategy.md](../../engineer/strategies/prepare-an-alerting-strategy.md) |

## Action recommendations

1. **First principles**: First ask "IC what to solve / what happens if not done / ROI / user impact"; do not do IC for IC's sake; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md). 
2. **Inversion**: First think "IC could go out of control (gap / vague decision / trust collapse) " then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md). 
3. **Second-order effects**: One incident -> behavior change -> another adjustment; via [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md). 
4. **Occam**: The simplest command that meets business needs wins; do not pile up process; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md). 
5. **IC assignment**: Must run IC assignment + rotate + avoid ambiguity; via [i-want-to-handle-an-oncall-shift.md](./handle-an-oncall-shift.md). 
6. **Advisor**: Must run advisor (SRE / architect / security) + role + avoid single point. 
7. **Escalation**: Must run escalation path + sev grading + escalation policy + avoid all-on-human. 
8. **Reporting**: Must run [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) + internal and external + avoid silence. 
9. **Triage**: Must run triage + rollback in seconds + degrade + avoid root cause first; via [i-want-to-run-a-war-room.md](./run-a-war-room.md). 
10. **Decision**: Must run decision log + timestamp + avoid verbal. 
11. **War room**: Must run [i-want-to-run-a-war-room.md](./run-a-war-room.md) + centralized + avoid scattered. 
12. **Runbook**: Must run [runbook](../../engineer/processes/write-a-runbook.md) embedded + executable + avoid naked run. 
13. **Monitoring**: Must run [observability-pattern](../../engineer/patterns/observability.md) + avoid blind run. 
14. **AI incident**: LLM must run [llm-observability-comparison-summary.md](../../ai-engineer/platform/llm-observability-comparison.md) + must have hallucination / prompt incident plan. 
15. **RACI**: Must run [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); IC / TL / sponsor / security owner. 
16. **Cross-timezone**: Must run [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md); multi-timezone shift. 
17. **Freeze period**: During promos use [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) do not change IC. 
18. **Drill**: Must run [i-want-to-run-a-game-day.md](./run-a-game-day.md) + must have IC drill + avoid armchair strategy. 
19. **Retrospective**: After incident must run [incident-postmortem-template.md](../../engineer/lessons/failures/incident-postmortem.md) retrospective + archive [bugs/](../../engineer/lessons/failures/bugs). 
20. **Quarterly audit**: Via [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) scan IC whether still accurate + runbook whether still usable. 
21. **ADR**: IC decision must land ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md). 
22. **Flywheel**: IC good -> triage fast -> trust up -> more investment; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md). 

## Related

- Same category journey: [./prepare-an-incident-response-plan.md](./prepare-an-incident-response-plan.md) — Incident plan
- Same category journey: [./run-a-war-room.md](./run-a-war-room.md) — War room
- Same category journey: [./handle-an-oncall-shift.md](./handle-an-oncall-shift.md) — Oncall
- Same category journey: [../../engineer/strategies/prepare-an-alerting-strategy.md](../../engineer/strategies/prepare-an-alerting-strategy.md) — Alerting
- Upstream: [../../engineer/processes/README.md](../../engineer/processes/README.md) — processes leaf entry
