---
title: Respond to an incident
aliases:
- I want to respond to an online incident
- incident-response-journey
- oncall-journey
- incident response entry
tags:
- journeys
- incident-response
- oncall
- postmortem
- hotfix
- rollback
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
- ../../engineer/process/check-engineering-gotchas.md
- ../../engineer/process/run-iteration-meetings.md
- ../../README.md
- ../../engineer/lessons/failures/README.md
review_cycle: quarterly
tacit: false
last_verified: 2026-08-07
---

# I want to respond to an incident

> **As a** oncall sre, **I want to** respond to an incident, **so that** incident is contained.

> "How to respond to online incidents / alerts / user feedback + how to do postmortem afterwards" reach incident response process + oncall rotation + hotfix process + rollback drill + incident postmortem template within 2 hops.

## Summary

- Response: [incident-response-process.md](../../engineer/process/incident-response.md): triage / stop-the-bleed / investigate / fix / postmortem
- Stop the bleed first: [hotfix-release-process.md](../../oncall-sre/release/hotfix-release.md) + [rollback-drill-process.md](../../oncall-sre/release/rollback-drill.md)
- Postmortem: [incident-postmortem-template.md](../../engineer/lessons/failure-incident-postmortem.md) + archive under [lessons/failures/bugs/](../../engineer/lessons)
- Rotation: [oncall-rotation-process.md](../../engineer/process/oncall-rotation.md) + monitoring: [monitoring-governance-process.md](../../engineer/process/monitoring-governance.md)

## Core viewpoints

**Stop the bleeding before finding the root cause.**
The most common failure mode in incident response is the engineer who tunnels into logs looking for the root cause while the outage continues to spread. The first 5 minutes of an incident are not for forensics; they are for restoring service. Rollback, degrade, feature-flag off, rate-limit. Every second spent investigating before stabilizing is a second of compounding user impact. The root cause will still be there after the bleeding stops, and you will have a calmer environment to find it.

**Incident severity is a communication contract, not a technical label.**
P0/P1/P2/P3 tiers should trigger specific notification scopes, response SLAs, and escalation paths, not just a tag in your ticketing system. P0 means "all hands on deck, notify executives in 5 minutes, war room in 10." P3 means "file a ticket, fix during business hours." Teams that treat severity as a label rather than a contract end up with P0-level noise on P3-level problems, desensitizing everyone to real emergencies.

**Postmortems must produce process changes, not confessions.**
A postmortem that concludes with "engineer will be more careful next time" is a failure of the process. Blameless postmortems are not about being nice; they are about being effective. The question is never "who caused this?" but "what allowed this to happen?" Every postmortem must produce at least one concrete process change: a new automated check, a runbook update, a change to the deployment pipeline, or a monitoring improvement. If the only outcome is a human pledge, the incident will recur.

**The oncall rotation is the single most underinvested piece of reliability infrastructure.**
Unclear handoff procedures, stale escalation paths, missing shadow rotations, and oncall burnout are the root causes of more incidents than any specific technology failure. An oncall who is not rested, not trained, and not empowered to make decisions during an incident is a liability. Rotate frequently, train everyone who goes on call, and ensure the oncall has the authority to page anyone in the organization, including executives.

## Key info

- **Incident severity tiers**: P0 (user-facing outage, data loss, security breach -- response within 5 minutes, war room within 10 minutes, executive notification within 15 minutes, all hands on deck), P1 (degraded service, major feature broken -- response within 15 minutes, designated responders, no executive notification unless >2 hours), P2 (minor feature broken, workaround available -- response within 4 hours, single responder, fix during business hours), P3 (cosmetic, non-blocking -- file a ticket, fix next sprint). The gap between P0 and P1 is the most important: P0 is "stop everything else," P1 is "prioritize over feature work."
- **First 5-minute checklist**: (1) acknowledge the alert (silence is interpreted as "no one is handling this"), (2) assess blast radius (what's affected, how many users, is data at risk), (3) decide rollback vs fix-forward (rollback if the last deploy was <30 minutes ago, fix-forward if the issue is known and the fix is trivial), (4) start the incident timer (for SLA tracking), (5) open the incident channel (Slack, Teams, whatever) and post the assessment. The most common mistake: skipping step 1 and going straight to investigation, causing duplicate pages and confusion.
- **Rollback decision criteria**: rollback if the issue started within 30 minutes of the last deploy, the rollback path is tested (you've done a rollback drill in the last quarter), and the rollback is faster than the fix. Fix-forward if the issue is clearly understood, the fix is a one-liner, and the fix can be deployed in under 10 minutes. The tiebreaker: if you're not sure, rollback. A rollback restores a known-good state; a fix-forward introduces a new unknown state.
- **War room protocol**: (1) designated incident commander (IC) who does NOT investigate -- the IC coordinates, communicates, and delegates; (2) scribe who documents every action and timestamp in the incident channel; (3) 15-minute checkpoints where the IC summarizes current state and next steps; (4) no more than 5 people actively investigating (more people = more noise); (5) the IC decides when the incident is resolved and transitions to postmortem. The most common war room failure: the most senior engineer tries to both investigate AND coordinate, and does both poorly.
- **Postmortem timeline**: draft within 24 hours (while memory is fresh), review within 48 hours (with stakeholders), publish within 72 hours (to the engineering org), action items assigned with due dates. The postmortem document should answer: what happened (timeline), what the impact was (duration, affected users, data loss), what caused it (root cause, not proximate cause), what allowed it (the process gap), and what will prevent it (the concrete action items). A postmortem without action items is a journal entry.

## Scenario

When an online alert / user-reported incident / service down / recall-rate drop / data exception occurs, oncall + main owner need to respond quickly + stop the bleed + investigate + fix + postmortem. This entry aggregates incident response process, hotfix process, rollback drill, incident postmortem template, and oncall rotation into a 2-hop path, avoiding "still looking for process docs while the incident spreads".

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [incident-response-process.md](../../engineer/process/incident-response.md) · [hotfix-release-process.md](../../oncall-sre/release/hotfix-release.md) · [rollback-drill-process.md](../../oncall-sre/release/rollback-drill.md) · [disaster-recovery-drill-process.md](../../engineer/infrastructure/disaster-recovery-drill.md) · [chaos-engineering-process.md](../../engineer/quality-security/chaos-engineering.md) · [oncall-rotation-process.md](../../engineer/process/oncall-rotation.md) · [monitoring-governance-process.md](../../engineer/process/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [data-migration-process.md](../../engineer/infrastructure/data-migration.md) |
| `lessons/failures/` | [incident-postmortem-summary.md](../../engineer/lessons/failure-incident-postmortem.md) · [incident-postmortem-template.md](../../engineer/lessons/failure-incident-postmortem.md) · [ai-product-launch-lessons-summary.md](../../engineer/lessons/failure-ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons) — historical incident archive |
| `lessons/gotchas/` | [macos-fsevents-silent-drop.md](../../engineer/lessons/gotcha-macos-fsevents-silent-drop.md) · [sse-ondone-guard.md](../../engineer/lessons/gotcha-sse-ondone-guard.md) · [react-jsxdev-mismatch.md](../../engineer/lessons/gotcha-react-jsxdev-mismatch.md) — common incident root causes |
| `work/meetings/` | [retrospective-sample.md](../../product-manager/delivery/retrospective.md) · [review-meeting-template.md](../../product-manager/delivery/review-meeting.md) — postmortem meetings |
| `resources/templates/` | [meeting-notes-template.md](../../knowledge-curator/templates/meeting-notes.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) — capacity and cost (incidents may involve capacity) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) — tech debt (incidents may be triggered by debt) |
| `projects/` | Each project `project-management-summary.md` §iteration cadence + §risk |

## Action recommendations

1. **Triage**: P0 (all users unavailable) / P1 (some users unavailable) / P2 (experience degraded) / P3 (latent risk) — determines response level + notification scope.
2. **Stop the bleed first**: rollback / gray rollout switch back / rate limit / degrade / feature flag off — do not investigate root cause first, stop the bleeding first.
3. **Investigate**: after stopping the bleed, check logs / monitoring / trace / user feedback / recent changes — do not investigate root cause before stopping the bleed.
4. **Fix**: hotfix follows [hotfix-release-process.md](../../oncall-sre/release/hotfix-release.md) (bypass normal release process but still go through review + test).
5. **Postmortem**: hold a retrospective meeting within 24h, follow [incident-postmortem-template.md](../../engineer/lessons/failure-incident-postmortem.md), archive under [lessons/failures/bugs/](../../engineer/lessons).
6. **Postmortem principles**: focus on the issue not the person / find root cause not the culprit / five-whys to root cause / improvements land in process not individuals.
7. **Drills**: quarterly runs of [rollback-drill-process.md](../../oncall-sre/release/rollback-drill.md) + [disaster-recovery-drill-process.md](../../engineer/infrastructure/disaster-recovery-drill.md) + [chaos-engineering-process.md](../../engineer/quality-security/chaos-engineering.md).
8. **Rotation**: follow [oncall-rotation-process.md](../../engineer/process/oncall-rotation.md); handoffs must transfer current open incidents.
9. **Monitoring**: follow [monitoring-governance-process.md](../../engineer/process/monitoring-governance.md); alerts must be actionable (no noise alerts).

## Anti-patterns

- **Investigating root cause before stopping the bleeding.** The urge to "figure out what happened" is strong, especially for curious engineers. But while you are reading log lines, the outage is still hurting users. The correct sequence is: stop the bleeding first, then investigate. If you find yourself 15 minutes into an incident and the service is still down, you have failed the first step.

- **Calling a war room for every P2 alert.** Not every alert requires a synchronous meeting. War rooms are expensive: they pull N engineers off their work, create context-switching costs, and generate anxiety. Reserve war rooms for P0 and high-P1 incidents where coordination across multiple teams is needed. For P2 incidents, use async communication channels with a clear owner and timeline.

- **Writing postmortems that blame the human.** Postmortems that conclude with "the engineer forgot to..." or "the oncall failed to..." are toxic and useless. The system allowed the mistake to happen. A proper postmortem asks: why was the manual step required? Why was the guardrail not automated? Why was the risk not visible? If the postmortem does not produce a system or process change, it was a waste of time.

- **Skipping postmortems for "small" incidents.** Teams often skip postmortems for incidents that resolved quickly or had limited impact. This is a lost learning opportunity. The incidents that resolve fastest are often the ones with the most interesting near-misses: a lucky rollback, a coincidental cache hit, a manual intervention that happened to be available. If you do not study why the incident was contained quickly, you cannot guarantee the same outcome next time.

- **Treating oncall as a secondary responsibility.** When oncall is treated as a side duty that engineers handle in addition to their full sprint workload, response times degrade, handoffs are sloppy, and burnout accelerates. Oncall during the rotation period must be the primary responsibility. The engineer's sprint capacity during their oncall week should be reduced to account for the cognitive load and interruption cost.

## Related

- Same-category journey: [../../engineer/process/check-engineering-gotchas.md](../../engineer/process/check-engineering-gotchas.md) — incident root cause vs gotcha
- Same-category journey: [../../engineer/process/run-iteration-meetings.md](../../engineer/process/run-iteration-meetings.md) — retrospective meetings
- Same-category journey: [../../engineer/process/review-lessons.md](../../engineer/process/review-lessons.md) — failure lessons capture
- Upstream: [../../knowledge-curator/governance/governance.md](../../knowledge-curator/governance/governance.md) — quarterly audit + drill cadence
