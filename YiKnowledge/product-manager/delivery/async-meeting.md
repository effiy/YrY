---
title: Async Communication and Decision-Making
aliases:
  - Async communication
  - Async meetings
  - Async decisions
  - Written proposals
  - Async standups
tags:
  - meeting
  - async
  - communication
  - decision-making
  - remote-work
  - productivity
category: product-manager/delivery
created: 2026-08-07
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles:
  - product-manager
  - tech-lead
  - engineer
benefit: Teams can make high-quality decisions without synchronous meetings by adopting written proposals, async standups, and decision records that scale across time zones
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
  - meeting-efficiency.md
  - weekly-meeting.md
  - daily-report.md
  - weekly-report.md
  - ../../knowledge-curator/templates/meeting-notes.md
tacit: false
---

# Async Communication and Decision-Making

> **As a** product manager, **I want to** establish async communication and decision-making practices, **so that** the team makes high-quality decisions without synchronous meetings, enabling effective collaboration across time zones and protecting deep work.

> Async communication is the default mode for distributed teams. It is not about "sending more messages." It is about writing clearly, thinking before responding, and making decisions in a way that includes everyone regardless of time zone or schedule.

## Summary

- Async communication is the practice of communicating without requiring an immediate response. It is the foundation of effective remote and distributed teamwork. The core principle: write things down, give people time to process, and decide when the inputs are in, not when the meeting ends.
- The three pillars of async: written proposals (replace presentation meetings), async standups (replace daily standup meetings), and decision records (replace decision-making meetings).
- Async communication is inclusive by design. Synchronous meetings exclude people in different time zones, people who process information more slowly, people who are less comfortable speaking in groups, and people who are not in the room. Async communication includes everyone who has the document.
- The transition to async is primarily a cultural change, not a tool change. The best async tools (Google Docs, Notion, Slack, Loom) are useless if the culture still defaults to "let's jump on a call."
- Async does not mean "no synchronous communication." Some conversations genuinely require real-time back-and-forth. The rule is: async by default, sync when needed.

## Core viewpoints

- **Writing is thinking** -- the act of writing a proposal forces clarity. Vague ideas that sound good in conversation fall apart on the page. The written proposal is the quality filter for decisions. If you cannot write it clearly, you do not understand it well enough to decide.
- **Async is inclusive, sync is exclusive** -- a synchronous meeting at 10 AM Pacific excludes team members in Asia (it is 1 AM). A synchronous meeting where the loudest voice dominates excludes the quietest person who has the best idea. Async levels the playing field.
- **Speed of decision is not the same as quality of decision** -- a quick decision made in a meeting by the three people who happened to attend is fast but often wrong. An async decision that took 48 hours but included input from all stakeholders is slower but better. Optimize for decision quality, not decision speed.
- **The document is the meeting** -- in an async culture, the written proposal IS the meeting. The comments section IS the discussion. The decision record IS the outcome. Treat the document with the same care you would treat a presentation in a meeting.
- **Async requires explicit deadlines** -- a synchronous meeting has a built-in deadline (the meeting ends). An async discussion does not. Without explicit deadlines ("please review by Tuesday EOD"), async discussions drift indefinitely. Always include a deadline.

## Key information

### The three pillars of async

**1. Written proposals**

Replace presentation meetings with written documents. The proposal structure:

| Section | Content | Purpose |
|---|---|---|
| Title | What is this proposal about? | One sentence that captures the decision to be made |
| Context | What is the situation? Why now? | Bring everyone to the same level of understanding |
| Problem | What is the problem we are solving? | Define the problem, not the solution |
| Options | What are the possible approaches? | 2-4 options, each with pros/cons/costs/risks |
| Recommendation | Which option do you recommend? | One option with clear rationale |
| Open questions | What do you need input on? | Specific questions for reviewers |
| Decision deadline | When does the decision need to be made? | Date and time |

**2. Async standups**

Replace daily standup meetings with a written standup in a shared channel (Slack, Teams, Geekbot).

| Field | Content | Example |
|---|---|---|
| Yesterday | What did I complete? | "Merged PR #342: fix search pagination bug" |
| Today | What am I working on? | "Starting on the export feature; aiming for draft PR by EOD" |
| Blockers | What is blocking me? | "Waiting on design review for the export modal" |
| Help needed | What do I need help with? | "Anyone familiar with the CSV library? Having encoding issues" |

Benefits of async standups:
- Everyone can participate regardless of time zone
- Written record is searchable and referenceable
- No context-switching cost from stopping work to attend a meeting
- The standup channel becomes the team's daily log

**3. Decision records (ADRs)**

Replace decision-making meetings with Architecture Decision Records (ADRs) or general Decision Records.

| Section | Content |
|---|---|
| Title | "ADR-0042: Use PostgreSQL for the analytics database" |
| Status | Proposed / Accepted / Deprecated / Superseded |
| Context | What is the situation? What are the constraints? |
| Decision | What did we decide? |
| Rationale | Why did we choose this option over the alternatives? |
| Consequences | What becomes easier? What becomes harder? |
| Alternatives considered | What other options were evaluated and why were they rejected? |

### Async communication channels and their use

| Channel | Sync/Async | Best for | Response expectation |
|---|---|---|---|
| Written proposal (Google Doc, Notion) | Async | Major decisions, strategy, designs | 24-72 hours for review |
| Decision record (ADR) | Async | Technical decisions, architecture | 48 hours for review and approval |
| Slack/Teams message | Near-sync | Quick questions, coordination | Within 2-4 hours (not immediate) |
| Slack/Teams thread | Async | Discussions, async standups | Within 24 hours |
| Email | Async | External communication, formal announcements | Within 24 hours (business days) |
| Loom/recorded video | Async | Demos, walkthroughs, async presentations | Within 24-48 hours |
| Video call | Sync | Complex discussions, brainstorming, 1:1s | At the scheduled time |
| Emergency call | Sync | Production incidents | Immediately |

### Async standup template

```
# Daily Standup — [Date]

## @person1
- Yesterday: ...
- Today: ...
- Blockers: ...
- Help needed: ...

## @person2
...
```

Post in a dedicated `#team-standup` channel. Set a deadline (e.g., "by 10 AM in your time zone"). The PM or tech lead reads all standups and follows up on blockers async.

### When to go sync

Async is the default, but some situations genuinely require synchronous communication:

| Situation | Why sync is better | Format |
|---|---|---|
| Complex, high-stakes decisions with deep disagreement | Async threads can go in circles without resolution | 60-minute decision meeting with pre-read |
| Brainstorming and ideation | Real-time bouncing of ideas is more creative than async | 45-minute brainstorming session with a clear outcome |
| Sensitive feedback or conflict | Async text can be misinterpreted; tone matters | 30-minute video call |
| Celebrations and team bonding | Async is not relational | Team social events |
| Production incidents | Speed is critical | War room (video call) |

### Transitioning a team to async-first

**Phase 1: Audit (week 1-2)**
- List all recurring meetings. Classify each as "replaceable with async" or "requires sync."
- Identify the 2-3 most time-consuming status-update meetings.

**Phase 2: Replace (week 3-4)**
- Replace the identified status-update meetings with async alternatives.
- Start with one: "Our weekly sync is now a written status doc. Please add your update by Tuesday EOD. We will only meet if there are discussion items."
- Set explicit expectations for async response times: "Respond to Slack messages within 4 hours during your working hours."

**Phase 3: Establish (week 5-8)**
- Introduce written proposals for major decisions. Provide a template.
- Set up the async standup channel. Establish the daily deadline.
- Create a decision record repository. Document the first few decisions.

**Phase 4: Reinforce (ongoing)**
- When someone says "let's schedule a meeting," ask "can this be async first?"
- When a meeting is scheduled, require an agenda and pre-read.
- Celebrate examples of good async communication. Share them with the team.

### Async communication norms

| Norm | Why |
|---|---|
| Default to public channels, not DMs | DMs are invisible; public channels create shared knowledge |
| Use threads for discussions | Keeps the main channel clean and scannable |
| Write complete messages, not "hey" or "can I ask a question?" | "Hey" requires a round-trip; include the question in the first message |
| Set status to indicate availability | Deep work: Do Not Disturb. Lunch: Away. End of day: Offline. |
| Assume positive intent | Text lacks tone. If a message feels harsh, assume it was not intended to be. |
| Over-communicate context | What is obvious to you is not obvious to someone in a different time zone. |

## Action recommendations

1. Audit all recurring meetings. For each, ask: "Can this be replaced with async?" Start with the biggest time-wasters: status updates.
2. Replace the daily standup meeting with an async standup in a dedicated Slack channel. Set a daily deadline (e.g., 10 AM in the poster's time zone).
3. Create a written proposal template. For the next major decision, require a written proposal instead of a presentation meeting.
4. Start a decision record repository. Document the first 5 decisions. Include: context, decision, rationale, alternatives considered.
5. Establish async response time expectations: "Respond to Slack messages within 4 hours during your working hours."
6. Set up a "no internal meetings" day (e.g., Wednesday). Use it to establish the async-first habit.
7. When someone proposes a meeting, ask: "Can we try this async first?" If the async attempt fails, then schedule the meeting.

## Anti-patterns

- **Async as "no communication"** -- going silent and calling it "async." Async requires MORE written communication, not less. The document is the meeting. Write it.
- **Async without deadlines** -- "please review when you have time" is an invitation to never review. Always include a deadline: "Please review by Tuesday 5 PM Pacific."
- **Async as a replacement for all synchronous communication** -- some conversations require real-time back-and-forth. Async is the default, not the only option.
- **Async as an excuse for slow decision-making** -- "we are waiting for async feedback" while the decision drags on for weeks. Set a decision deadline. If the deadline passes without feedback, decide without it.
- **Async tools without culture change** -- buying Slack, Notion, and Loom without changing the expectation that people should be "always available" and respond immediately. Tools are the easy part; culture is the hard part.
- **Async standups that no one reads** -- 10 people post their standup, and no one reads anyone else's. The PM or tech lead must read, respond, and follow up on blockers. If no one reads it, it is not a standup; it is a diary.

## Related

- Same class: [meeting-efficiency.md](./meeting-efficiency.md) -- meeting efficiency principles; async is the primary strategy for reducing meeting load
- Same class: [weekly-meeting.md](./weekly-meeting.md) -- weekly meeting template; can be partially or fully replaced with async
- Same class: [daily-report.md](./daily-report.md) -- daily report format; complements async standups
- Same class: [weekly-report.md](./weekly-report.md) -- weekly report format; complements async weekly updates
- Cross-reference: [../../knowledge-curator/templates/meeting-notes.md](../../knowledge-curator/templates/meeting-notes.md) -- meeting notes template
- References: GitLab -- *The Remote Playbook*; Basecamp -- *Remote: Office Not Required*; 37signals -- *Shape Up* (async decision-making); Michael Nygard -- *Documenting Architecture Decisions*