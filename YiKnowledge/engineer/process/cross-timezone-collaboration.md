---
title: Cross-timezone collaboration protocol
aliases:
- cross-timezone-collaboration
- remote-timezone-protocol
tags:
- collaboration
- cross-timezone
- remote
- sync-window
- handover
category: engineer/process
created: 2026-07-31
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: yearly
roles:
- engineer
- product-manager
benefit: process followed predictably
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ./async-collaboration-principles.md
- ./raci-matrix.md
- ../oncall-rotation.md
tacit: false
---

# Cross-timezone collaboration protocol

> **As an** engineer, **I want to** cross timezone collaboration, **so that** process followed predictably.

> Let each timezone work at reasonable hours; do not require one side to keep staying up late.

## Summary

- Core is "rotating shifts + async-first + 2-4h daily sync window + meeting recording archived + decisions must be written".
- Find overlapping timezones for a sync window (e.g. CN 14:00-18:00 / EU 09:00-13:00); cross-timezone meetings must be within the window.
- Time expressions unified to UTC + local timezone; deadlines use absolute dates; countdowns use hours (72h not "3 days").
- Response SLA tiered by urgency: P0 30 min / P1 4h / P2 24h / P3 72h; P0 triggers via phone + SMS.
- Important roles rotate + cross-timezone handover: before end of day, leave a state document for the next timezone.

## Core viewpoints

- **Timezone fairness is not a perk -- it is a retention strategy.** When one timezone consistently takes the 11 PM meetings while another works at 10 AM, the resentment accumulates silently until key engineers leave. Rotating shifts are not a scheduling convenience; they are a structural defense against the slow-burn attrition that fixed-timezone burden creates.

- **The sync window is the most precious resource in cross-timezone work, and every meeting placed outside it is a statement about whose time matters less.** A 4-hour overlap window means only 4 hours per day for synchronous collaboration. Using that window for status updates wastes the scarce resource; it should be reserved for decisions, brainstorming, and relationship-building that genuinely require real-time bandwidth.

- **Recording cross-timezone meetings is not optional -- it is the only way absentees can participate.** When a meeting is held at 2 AM for one timezone, the recording and minutes are the sole mechanism for those absentees to contribute. Without them, the meeting effectively excludes an entire timezone from decision-making, which is a governance failure, not a scheduling inconvenience.

- **Dual-label time expressions (UTC + local) eliminate a class of errors that cause missed deadlines and double-booked meetings.** "Friday" means different things in UTC+8 and UTC-5. "In 3 days" is ambiguous across date lines. The cost of adding a UTC label to every time expression is negligible; the cost of a misinterpreted deadline can be a missed launch window.

- **Cross-timezone handover is not a status update -- it is a state transfer.** The engineer ending their day must leave enough context for the next timezone to continue without re-deriving the problem. A handover that says "still investigating the memory leak" is useless; one that says "memory leak narrowed to the connection pool in module X, profiler output attached, next step is to check the keep-alive timeout" is a state transfer that enables continuous progress.


- Rotating shifts are fairer than fixed times — fixed times make one timezone's morning/evening accumulate resentment; rotating shifts let all sides share.
- Sync windows are scarce resources — cross-timezone meetings only happen within the window; everything outside is async.
- Cross-timezone meetings must be recorded + minutes — absentees can review within 24h, no forced late nights.
- UTC + local dual-label time expression eliminates ambiguity — relative times like "Friday" "in 3 days" have high miscalculation rates across timezones.

## Key information

### Sync window design

```
Timezone A: 09:00 - 18:00
Timezone B: 14:00 - 23:00
Overlap: A's 14:00-18:00 = B's local working hours → 4-hour sync window
```

- Within window: cross-timezone meetings, decision discussion, real-time collaboration
- Outside window: async communication, independent work, documentation feedback

### Meeting cadence

| Frequency | Type | Duration |
|---|---|---|
| Daily | Standup (async documentation version) | 15 min read |
| Weekly | Team sync | 30-60 min |
| Biweekly | Cross-team alignment | 60 min |
| Monthly | All-hands | 60 min |
| Quarterly | Strategy review | 2 hours |

### Timezone expression convention

- Documentation times uniformly use UTC + local timezone labels (e.g. `2026-07-31 14:00 UTC / 22:00 CN`)
- Deadlines use absolute dates, not "Friday"
- Countdowns uniformly use hours (`72h`) not "3 days"

### Response SLA

| Urgency | Response deadline |
|---|---|
| P0 urgent | within 30 min (phone / SMS) |
| P1 high | within 4 hours |
| P2 medium | within 24 hours |
| P3 low | within 72 hours |

> P0 trigger method: phone + SMS, not just Slack.

### Rotation mechanism

- Important roles (oncall, duty PM) rotate, each timezone has an owner
- Handover documentation: handover document at handover
- Cross-timezone handover: before end of day leave state for next timezone

### Tool stack

| Purpose | Tool |
|---|---|
| Async documentation | Notion / Confluence |
| Instant messaging | Slack / Lark |
| Video meetings | Zoom / Teams / Google Meet |
| Recording + minutes | Otter.ai etc. |
| Timezone coordination | World Time Buddy / Clockify |
| Task tracking | Linear / Jira (with timezone) |

### Applicable scenarios

- Team spans 2+ timezones
- Remote-first organization
- Need 7x24 coverage but a single timezone can't bear it
- Cross-cultural cross-region collaboration

## Action recommendations

1. Team agrees on a sync window (e.g. CN 14:00-18:00 / EU 09:00-13:00) and writes it into the wiki
2. All cross-timezone meetings must be recorded + minutes
3. Important decisions documented + synced to all
4. Holiday calendar shared (different holidays per region)
5. Any documentation time dual-labeled UTC + local
6. P0 trigger method: phone + SMS (not just Slack)
7. Each role rotates + handover document template standardized



- Fixed times make one side morning/evening — unfair, rotate shifts
- Cross-timezone meetings without recording — absentees miss, must record + minutes
- Expecting instant reply on IM — disrupts sleep, async semantics
- Timezone expression chaos — miscalculated time, UTC + local dual-label
- Decisions only verbal in meetings — information lost, must be written
- Not considering holidays — cultural offense, share holiday calendar

## Anti-patterns

- **Fixing the sync window to one timezone's convenience permanently.** When the overlap window is always set to favor the headquarters timezone, remote team members are forced to choose between attending meetings and maintaining a reasonable sleep schedule. The resentment this creates is invisible until the resignation letter arrives. Rotating the window quarterly, even if it means occasional discomfort for HQ, is an investment in retention.

- **Using "I'll send a message and they'll see it when they wake up" as a substitute for handover documentation.** A Slack message without structured context leaves the next timezone guessing about state, priority, and next steps. The handover must be a structured document -- what was done, what was found, what remains, what is blocked -- not a stream-of-consciousness chat message.

- **Treating P0 escalation as a technical decision rather than a social contract.** Calling someone at 3 AM their time is a significant intrusion. If the team has not explicitly agreed on what constitutes a P0 worthy of a phone call, the escalation mechanism will either be overused (crying wolf) or underused (real incidents missed). The P0 definition must be written, agreed upon, and reviewed quarterly.

- **Sharing only the holiday calendar of the dominant timezone.** When the team calendar marks Chinese New Year but not Diwali or Eid, it signals whose culture matters. A cross-timezone team must maintain a shared holiday calendar that includes every region's major holidays, and meeting scheduling must respect those dates for all participants.

- **Assuming that async communication eliminates the need for relationship-building.** Cross-timezone teams that never meet in person or on video develop thinner trust, which makes conflict resolution harder and collaboration more transactional. An annual offsite or quarterly in-person overlap is not a luxury -- it is the trust infrastructure that makes the async system resilient when things go wrong.

## Related

- Same class: [async collaboration principles](./async-collaboration-principles.md), [RACI matrix](./raci-matrix.md)
- Upstream: [async collaboration principles](./async-collaboration-principles.md) (cross-timezone is its subset)
- Downstream: [Oncall rotation process](oncall-rotation.md) (rotation and handover)
- Reference: GitLab *Remote-first culture*, Atlassian *Working Across Time Zones*
