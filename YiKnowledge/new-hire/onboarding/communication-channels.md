---
title: Communication Channels and Meeting Norms
aliases:
- communication-channels
- meeting-norms
- team-communication
- slack-email-meetings
tags:
- onboarding
- communication
- meetings
- collaboration
- remote-work
category: new-hire/onboarding
created: 2026-08-07
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
roles:
- new-hire
- engineer
benefit: "Team members communicate effectively across channels, respecting async-first norms and meeting hygiene"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ./first-week-checklist.md
- ./code-review-expectations.md
- ../../engineer/process/run-iteration-meetings.md
tacit: false
---

# Communication Channels and Meeting Norms

> **As a** new team member, **I want to** understand the team's communication channels and norms, **so that** I communicate effectively and respect the team's async-first culture.

> Communication norms are the invisible architecture of team productivity. Explicit norms prevent the two most common failures: important information lost in the wrong channel, and constant interruptions disguised as collaboration.

## Summary

- Primary channels: Slack (async, day-to-day), GitHub (code discussion), meetings (sync, decision-making), email (external, formal)
- Async-first culture: Default to written communication. Assume replies within 4 business hours, not immediate.
- Meeting hygiene: Every meeting has an agenda, a decision to make, and a designated note-taker. No agenda = no meeting.
- Key principle: The right channel depends on urgency and audience. "Urgent to you" is not the same as "urgent to the receiver."

## Core viewpoints

### 1. Async-first means written-first

Default to writing. A well-written Slack message, GitHub issue, or design doc is searchable, linkable, and reviewable by anyone at any time. A hallway conversation is ephemeral and excludes everyone not in the hallway. Write first, then talk if needed.

### 2. Channel choice is a skill

The right channel depends on: (1) Urgency — does this need attention within minutes, hours, or days? (2) Audience — is this for one person, the team, or the company? (3) Persistence — should this be searchable in 6 months? A DM is fast but lost. A GitHub issue is slow but permanent.

### 3. Meetings are for decisions, not updates

Status updates should be written (Slack, GitHub, email). Meeting time is for discussion that benefits from real-time interaction: decisions, design debates, brainstorming, retrospectives. If a meeting is just people reading slides to each other, cancel it and send the slides.

### 4. Over-communication during onboarding is expected

As a new hire, err on the side of over-communicating. Send daily updates in the team channel. Ask questions publicly (so others can learn from the answers). It's much easier to ask you to communicate less than to wonder what you're doing.

## Key info

### Channel guide

| Channel | Use For | Response Expectation | Don't Use For |
|---|---|---|---|
| **Slack #team-channel** | Daily updates, questions, announcements | Within 4 business hours | Confidential/private matters |
| **Slack DM** | 1:1 conversations, sensitive topics | Within 24 hours | Decisions that should be visible to the team |
| **GitHub Issues/PRs** | Code discussion, bug reports, feature requests | Within 48 hours | Urgent operational issues |
| **Email** | External communication, formal announcements | Within 24-48 hours | Day-to-day team communication |
| **Weekly team meeting** | Sprint planning, retrospectives, demos | N/A (scheduled) | Status updates (use Slack) |
| **1:1 with manager** | Career development, blockers, feedback | N/A (scheduled) | Task-level status (use Slack) |

### Meeting norms

**Before scheduling a meeting:**
- [ ] Can this be resolved with a written document instead?
- [ ] Is there a clear agenda with specific decisions to make?
- [ ] Are the right people invited (minimum necessary, maximum useful)?
- [ ] Is there a designated note-taker and decision-logger?

**During the meeting:**
- [ ] Start on time. End on time (or earlier).
- [ ] Follow the agenda. Table off-topic discussions for follow-up.
- [ ] Decisions are logged with owners and due dates.
- [ ] Action items are assigned before the meeting ends.

**After the meeting:**
- [ ] Notes and decisions are posted in the team channel within 24 hours.
- [ ] Action items are tracked (in GitHub issues or project management tool).

### Status update format (daily/weekly)

```markdown
**What I did:**
- Shipped PR #123: Fix authentication token refresh
- Reviewed PRs #124, #125
- Investigated performance issue in search (see #126)

**What I'm doing next:**
- Implement search indexing improvement (#126)
- Review PR #127

**Blockers:**
- Need design review on search UX (pinged @designer)

**Questions:**
- Should we add caching to the search endpoint? (see #128)
```

## Action recommendations

1. **Send a daily update in the team channel for your first 2 weeks**: It feels like over-communication but it's exactly what your team needs to know you're progressing.
2. **Default to public channels**: Ask questions in `#team-channel`, not DMs. Others benefit from the answers.
3. **Use threads for discussions**: Keep the main channel clean. Thread replies for back-and-forth.
4. **Set Slack notification boundaries**: Don't feel obligated to respond outside work hours. Async means async.
5. **Join all recurring team meetings**: Even if you're just observing. You'll absorb norms, context, and vocabulary.

## Anti-patterns

- **DM everything**: All communication in private messages. The team has no visibility into what's happening.
- **Meeting for status updates**: 30 minutes of people reading what they did this week. Send a written update instead.
- **No agenda meetings**: "Let's sync" with no agenda, no decisions, no notes. If you can't write an agenda, you don't need the meeting.
- **Immediate response expectation**: Expecting replies to Slack messages within minutes. Async means the receiver chooses when to respond.
- **Radio silence**: Going days without any communication. Your team assumes you're stuck or disengaged.

## Related

- [First Week Checklist](./first-week-checklist.md) — Day 2: send first team message
- [Code Review Expectations](./code-review-expectations.md) — GitHub communication norms
- [Run Iteration Meetings](../../engineer/process/run-iteration-meetings.md) — Meeting structure