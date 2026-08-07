---
title: Run a war room
aliases:
- i-want-to-run-a-war-room
- war-room-journey
- incident-commander-journey
- first-responder-journey
- war-room-entry
tags:
- journeys
- war-room
- incident-commander
- sev-triage
- first-responder
- hotfix
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
benefit: process is repeatable
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ./respond-to-an-incident.md
- ../../engineer/process/handle-outage-communication.md
- ../../tech-lead/risk/write-a-postmortem.md
- ../../engineer/process/incident-response.md
review_cycle: quarterly
tacit: false
last_verified: 2026-08-07
---

# I want to run a war room

> **As an** oncall sre, **I want to** run a war room, **so that** process is repeatable.

> "IC + chief of staff + communication + triage + decision + monitoring + retrospective + knowledge implementation" reachable within 2 hops across process + thinking + case study.

## Summary

- Process via [incident-response-process.md](../../engineer/process/incident-response.md) + [monitoring-governance-process.md](../../engineer/process/monitoring-governance.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- Thinking via [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Template via [incident-postmortem-template.md](../../engineer/lessons/failure-incident-postmortem.md) + [meeting-notes-template.md](../../knowledge-curator/templates/meeting-notes.md) + [runbook.md](../../engineer/infrastructure/write-a-runbook.md)
- Case study via [incident-postmortem-summary.md](../../engineer/lessons/failure-incident-postmortem.md) + [ai-product-launch-lessons-summary.md](../../engineer/lessons/failure-ai-product-launch-lessons.md)

## Core viewpoints

**The war room is not a meeting; it is a command-and-control structure.**
A war room fails when it becomes a passive status-update meeting where everyone reports what they are doing. The Incident Commander owns the timeline, assigns tasks, and enforces the 15-minute sync cadence. Every person in the room must have a specific role: IC, deputy, chief of staff, scribe, engineering lead, communications lead. Anyone without a role is a spectator and should leave. The war room is about making decisions under pressure, not about sharing information.

**The Incident Commander does not fix the incident.**
The IC's job is to orchestrate, not to type. An IC who opens a terminal and starts debugging has abdicated their command responsibility. The IC must maintain situational awareness, track the timeline, manage communication, and make the call on rollback vs. patch vs. degrade. When the IC starts fixing, the war room drifts: no one is updating stakeholders, no one is tracking parallel efforts, and the incident's blast radius expands unnoticed.

**Communication discipline is the difference between a contained incident and a PR disaster.**
Internal communication (15-minute syncs to the war room channel) and external communication (status page updates, customer notifications) must be managed by dedicated roles. The chief of staff or communications lead writes status updates, not the IC. Every external communication is a promise: if you say "next update in 30 minutes," you must deliver in 30 minutes even if there is nothing new to report. Silence erodes trust faster than bad news.

**The war room ends when the incident is contained, not when root cause is found.**
The war room should be stood down the moment the service is stable and monitoring confirms recovery. The root cause analysis, postmortem writing, and long-term fix planning move to async follow-up. Keeping the war room open for investigation burns out the team and creates a false sense of ongoing emergency. Containment is the exit criterion. Everything else is post-incident work.

## Scenario description

When opening a war room / major incident war / P0/P1 incident / sev1/sev2 assessment / incident commander / first responder / incident command / communication sync / triage decision / cross-team coordination / rollback decision / monitoring dashboard live / retrospective preparation / knowledge implementation, TL + oncall + architect + sponsor need to look up process + thinking + case study. This entry aggregates war-room-related process + thinking + case study into a 2-hop path, avoiding "IC missing / communication lag / triage chaos / decision gut call / monitoring missing / retrospective delay / knowledge not implemented".

## 2-hop reachability path

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [incident-response-process.md](../../engineer/process/incident-response.md) · [monitoring-governance-process.md](../../engineer/process/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) · [cross-team-collaboration-process.md](../../engineer/process/cross-team-collaboration.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — incident essence · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — reverse thinking on failure · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain effects · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/engineering-patterns/` | [dual-world-boundary-pattern.md](../../engineer/engineering/dual-world-boundary.md) · [contract-test-baseline-pattern.md](../../engineer/quality-security/contract-test-baseline.md) · [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [supply-chain-hardening-pattern.md](../../engineer/process/harden-supply-chain.md) |
| `resources/templates/` | [incident-postmortem-template.md](../../engineer/lessons/failure-incident-postmortem.md) · [meeting-notes-template.md](../../knowledge-curator/templates/meeting-notes.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) |
| `resources/prompts/` | [weekly-report-prompt.md](../../ai-engineer/methodology/prompts/weekly-report.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) |
| `tech/ai-platform/` | [llm-observability-comparison-summary.md](../../ai-engineer/platform/llm-observability-comparison.md) · [llm-comparison-summary.md](../../ai-engineer/platform/llm-comparison.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/process/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/process/cross-timezone-collaboration.md) |
| `work/meetings/` | [review-meeting-template.md](../../product-manager/delivery/review-meeting.md) · [retrospective-sample.md](../../product-manager/delivery/retrospective.md) · [weekly-report-sample.md](../../product-manager/delivery/weekly-report.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — communication |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — oncall matrix |
| `lessons/failures/` | [incident-postmortem-summary.md](../../engineer/lessons/failure-incident-postmortem.md) · [ai-product-launch-lessons-summary.md](../../engineer/lessons/failure-ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons) — incident archive |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/win-yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/win-yivad-aicr-phase-port.md) |
| `lessons/gotchas/` | [macos-fsevents-silent-drop.md](../../engineer/lessons/gotcha-macos-fsevents-silent-drop.md) · [sse-ondone-guard.md](../../engineer/lessons/gotcha-sse-ondone-guard.md) · [no-lockfile-supply-chain-risk.md](../../engineer/lessons/gotcha-no-lockfile-supply-chain-risk.md) |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `projects/` | each project's `architecture-summary.md` §oncall + `adr-*` §incident |
| `journeys/` | [./respond-to-an-incident.md](./respond-to-an-incident.md) · [../../engineer/process/handle-outage-communication.md](../../engineer/process/handle-outage-communication.md) · [../../tech-lead/risk/write-a-postmortem.md](../../tech-lead/risk/write-a-postmortem.md) · [./prepare-an-incident-response-plan.md](../../knowledge-curator/archive/strategies-legacy/oncall-sre/prepare-an-incident-response-plan.md) |

## Action recommendations

1. **First principles**: first ask "what does the war room solve / what happens without a meeting / ROI / user impact"; do not open a war room for the sake of opening one; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
2. **Inversion**: first imagine "how the war room can fail (IC missing / communication chaos / triage chaos / rollback misjudgment / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
3. **Second-order effects**: triage → introduces new bug → another war room; follow [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md).
4. **Occam's razor**: the simplest action that satisfies triage wins; do not pile up people; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md).
5. **SEV**: must do sev classification (P0/P1/P2) + must have communication threshold + must have escalation path; follow [incident-response-process.md](../../engineer/process/incident-response.md).
6. **IC**: must have single IC + must have deputy + must have chief of staff + must have scribe; follow [raci-matrix-summary.md](../../engineer/process/raci-matrix.md).
7. **first responder**: must have oncall matrix + must have 24h rotation + must have escalation path; follow [team-overview.md](../../knowledge-curator/people/team/team-overview.md).
8. **Communication**: must do [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) + must have 15min sync + must classify internal/external.
9. **Cross-timezone**: must do [cross-timezone-collaboration-summary.md](../../engineer/process/cross-timezone-collaboration.md); multi-timezone rotation.
10. **Monitoring**: must do [monitoring-governance-process.md](../../engineer/process/monitoring-governance.md) dashboard live + threshold + alert.
11. **Triage**: must do "stabilize before fixing" + must prioritize rollback + must cut feature flag + must rate-limit fallback; follow [dual-world-boundary-pattern.md](../../engineer/engineering/dual-world-boundary.md).
12. **Freeze period**: triage via [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) do not move other modules.
13. **AI incident**: LLM incident must do [llm-observability-comparison-summary.md](../../ai-engineer/platform/llm-observability-comparison.md) + must switch fallback + must degrade.
14. **RACI**: must do [raci-matrix-summary.md](../../engineer/process/raci-matrix.md); IC / engineering / sponsor / business / legal owner.
15. **Communication template**: must do [meeting-notes-template.md](../../knowledge-curator/templates/meeting-notes.md) sync internally and externally.
16. **Retrospective**: after triage, must do [incident-postmortem-template.md](../../engineer/lessons/failure-incident-postmortem.md) retrospective + archive under [bugs/](../../engineer/lessons).
17. **Knowledge implementation**: after retrospective must land [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) + must add runbook + must add ADR.
18. **Quarterly audit**: follow [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) scan whether IC rotation is still accurate + whether monitoring still covers.
19. **Flywheel**: war room smooth → triage fast → trust rises → more investment; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md).

## Anti-patterns

- **Opening a war room without declaring an Incident Commander.** When a war room starts without a clear IC, the first 10 minutes are wasted on "who is running this?" and "what is the severity?" The IC must be declared in the first message, and the deputy must be named immediately. If no one steps up, the most senior person in the room defaults to IC, but they must explicitly accept the role. A war room without an IC is a group of people panicking in parallel.

- **Letting the war room become a status meeting.** The natural gravity of a war room is toward "let me share what I found" monologues. The IC must actively cut this off. The format is: IC asks specific questions, assignees give 30-second answers, IC makes decisions. If a status update takes more than 2 minutes, the IC has lost control. Use a shared document for detailed findings; the verbal channel is for decisions only.

- **Failing to designate a scribe.** Without a scribe, the timeline of decisions, actions, and observations is lost. The scribe is not a junior role; it is a critical function that ensures the postmortem can reconstruct what happened and when. The scribe logs every decision, every command run, every observation, and every communication sent. If the scribe is not typing, the incident is not being documented.

- **Rotating the IC during the incident.** IC handoffs mid-incident create confusion about who made which decision and why. The IC role should remain with one person from war-room open to containment. If the IC must hand off due to fatigue or time zone, the handoff must include a full briefing of the timeline, open decisions, and current state, with the deputy shadowing for at least one sync cycle before taking over.

- **Skipping the post-war-room debrief while memory is fresh.** Within 24 hours of stand-down, the IC and key roles must do a hot wash: what worked, what did not, what surprised us. Delaying this debrief by even 48 hours causes significant memory loss. The formal postmortem can wait, but the hot wash must happen immediately while the emotional and factual memory is intact.

## Related

- Related journey: [./respond-to-an-incident.md](./respond-to-an-incident.md) — incident response
- Related journey: [../../engineer/process/handle-outage-communication.md](../../engineer/process/handle-outage-communication.md) — communication
- Related journey: [../../tech-lead/risk/write-a-postmortem.md](../../tech-lead/risk/write-a-postmortem.md) — retrospective
- Related journey: [./prepare-an-incident-response-plan.md](../../knowledge-curator/archive/strategies-legacy/oncall-sre/prepare-an-incident-response-plan.md) — incident contingency
- Upstream: [../../README.md](../../README.md) — processes leaf entry
