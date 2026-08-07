---
title: communicationcadence / Communication Cadence
aliases:
- Communication Cadence
- communicationcadence
- communicationfrequency
tags:
- stakeholders
- communication
- cadence
- cross-timezone
category: knowledge-curator/people/stakeholders
created: 2026-08-03
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: yearly
last_verified: 2026-08-07
roles:
- knowledge-curator
benefit: people discoverable
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ./stakeholder-map.md
- ../../../engineer/process/cross-timezone-collaboration.md
- ../../../engineer/process/async-collaboration-principles.md
tacit: false
---

# communicationcadence / Communication Cadence

> **As a** knowledge curator, **I want to** communication cadence, **so that** people discoverable.

> A fixed communication cadence for each stakeholder group — frequency / channel / topic / output. Skeleton placeholder, to be fully filled in.

## Summary

- Communication cadence table coverage: EU HUB ITBP / RSC business / HQ counterpart / NSC ITBP / internal PM / engineering weekly meeting / monthly retrospective / quarterly review
- Each row has four fields: frequency / channel / topic / output
- Cross-timezone window reference [cross-timezone-collaboration-summary.md](../../../engineer/process/cross-timezone-collaboration.md)
- Quarterly review verifies whether the communication cadence is still effective

## Core viewpoints

- **A fixed cadence is a coordination technology, not a bureaucratic ritual.** When every cross-team decision requires a one-off meeting negotiation, coordination overhead scales quadratically with the number of stakeholders. The cadence table — frequency, channel, topic, output — eliminates the negotiation by pre-agreeing on the communication contract. The value is not the meeting itself; it is the elimination of "when should we discuss this?" as a recurring decision.

- **The cadence table is a living document that must evolve with organizational structure.** A reorg, a new product launch, or a change in timezone overlap all invalidate parts of the existing cadence. The quarterly review is not a checkbox — it is the mechanism that prevents the cadence from becoming a stale artifact that schedules meetings no one needs. The right question at review time is not "is this meeting still happening?" but "if we were designing the cadence from scratch today, would this meeting exist?"

- **Cross-timezone communication decays without explicit overlapping-window contracts.** When teams span UTC+8 and UTC+1, the overlapping work window is at most 2-3 hours. Without an explicit agreement on which hours are shared, which decisions can be made async, and which require synchronous presence, the default outcome is that the remote team is excluded from decisions. The overlapping-hours table is not a nice-to-have; it is the contract that prevents timezone from becoming a second-class-citizen filter.

- **Async-first is not a preference; it is a structural requirement for cross-timezone collaboration.** When synchronous meetings are the default, the team in the less convenient timezone consistently bears the cost of early-morning or late-night attendance. Async-first means: written proposals over verbal brainstorming, recorded demos over live presentations, and documented decisions over hallway conversations. Sync meetings are reserved for decisions that require real-time debate and cannot be resolved in writing within 24 hours.

- **The communication cadence is the organizational memory of who needs to know what.** When a stakeholder is omitted from the cadence table, they are structurally excluded from information flow. The table must answer: who needs to know about this decision, at what level of detail, through which channel, and on what schedule. A stakeholder who only learns about decisions through the grapevine is a stakeholder whose input was never solicited.

## Key information

### Concept breakdown: communication cadence table (to be fully filled in)

| Role | Frequency | Channel | Topic | Output |
|---|---|---|---|---|
| EU HUB ITBP | _to be filled_ | | | |
| RSC business | _to be filled_ | | | |
| HQ counterpart | _to be filled_ | | | |
| NSC ITBP | _to be filled_ | | | |
| internal PM sync | _to be filled_ | | | |
| engineering weekly meeting | _to be filled_ | | | |
| monthly retrospective | _to be filled_ | | | |
| quarterly review | _to be filled_ | | | |

### Key parameter: cross-timezone window

Reference [cross-timezone-collaboration-summary.md](../../../engineer/process/cross-timezone-collaboration.md). **To be filled**: per-region overlapping work hours table.

### Key parameter: async collaboration principle

Reference [async-collaboration-principles-summary.md](../../../engineer/process/async-collaboration-principles.md).

### Applicable scenarios

- New hire onboarding to understand the communication cadence
- Align cadence before cross-organization collaboration
- Quarterly review verifies whether still effective

## Action recommendations

1. **Fill in four fields per row**: frequency / channel / topic / output
2. **List overlapping hours in the cross-timezone window**: per-region overlapping work hours table
3. **Fix async collaboration principle**: default async, sync when necessary
4. **Quarterly review**: verify whether the communication cadence is still effective, adjust frequency and channel
5. **Update immediately on major changes**: e.g. a new stakeholder joins

## Anti-patterns

- **Adding meetings without removing or deprecating old ones.** Meeting bloat is the default outcome of any organizational change; every new recurring meeting must replace or deprecate an existing one.

- **Sending meeting invites without pre-reading materials attached.** Meetings become passive presentation sessions; participants must receive and read materials at least 24 hours before the meeting.

- **Using the same cadence for all stakeholder groups.** A weekly sync that works for engineering standups may be excessive for quarterly business reviews; match cadence to the decision velocity of each group.

- **Treating async communication as a fallback rather than the default.** Default to async (written updates, recorded demos); sync meetings are reserved for decisions that require real-time debate and cannot be resolved in writing.

- **Not defining escalation paths for cadence failures.** When a stakeholder repeatedly misses meetings or decisions stall, the escalation path (who to notify, within what timeframe) must be explicit and pre-agreed.

## Related

- Same category: [stakeholder-map.md](./stakeholder-map.md) — stakeholder map
- Upstream: [../../../engineer/process/cross-timezone-collaboration.md](../../../engineer/process/cross-timezone-collaboration.md) — cross-timezone collaboration
- Upstream: [../../../engineer/process/async-collaboration-principles.md](../../../engineer/process/async-collaboration-principles.md) — async collaboration principle
- Upstream: [./README.md](./) — stakeholders subdirectory description
