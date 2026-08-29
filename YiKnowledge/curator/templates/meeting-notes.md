---
title: Meeting Notes Template
aliases: [meeting-notes-template, meeting-minutes-template]
tags: [template, meeting, notes, collaboration]
category: curator/templates
created: 2026-08-24
updated: 2026-08-24
source: internal
type: template
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer, leader, producter, executiver]
benefit: "Meeting participants produce consistent, searchable notes with clear decisions and action items"
acceptance_criteria:
  - "4 sections: Agenda, Notes, Decisions, Action Items"
  - "decisions are recorded inline and summarized at the bottom"
  - "action items have owners and due dates"
related:
  - ./README.md
  - ./knowledge-leaf.md
  - ./retrospective.md
---

# Meeting Notes Template

> **When to use:** For any meeting that produces decisions or action items. If the meeting is purely informational, a summary in Slack/WeCom is sufficient.

## Metadata

- **Meeting:** {{title}}
- **Date:** {{YYYY-MM-DD}}
- **Time:** {{HH:MM}} — {{HH:MM}}
- **Attendees:** {{names}}
- **Absent:** {{names}}

## 1. Agenda

> What we planned to cover. Copy from the calendar invite.

1. {{Agenda item 1}}
2. {{Agenda item 2}}
3. {{Agenda item 3}}

## 2. Notes

> What was discussed. Use `[D]` to mark decisions inline.

### {{Agenda item 1}}

- {{Key point discussed}}
- **[D] Decision:** {{decision made}}
- {{Open question or follow-up}}

### {{Agenda item 2}}

- {{Key point discussed}}

## 3. Decisions

> All decisions extracted for easy scanning.

| # | Decision | Made by |
|---|---|---|
| 1 | {{Decision summary}} | {{person/group}} |
| 2 | {{Decision summary}} | {{person/group}} |

## 4. Action Items

| # | Action | Owner | Due date |
|---|---|---|---|
| 1 | {{Start with a verb}} | {{name}} | {{YYYY-MM-DD}} |
| 2 | {{Start with a verb}} | {{name}} | {{YYYY-MM-DD}} |

## 5. Next Meeting

- **Date:** {{YYYY-MM-DD}}
- **Agenda topics for next time:** {{topics}}

## Anti-patterns

| Anti-pattern | Why it fails | What to do instead |
|---|---|---|
| Notes as a transcript | No one reads a word-for-word transcript; decisions are buried | Capture decisions and action items; notes are supporting context |
| No action items | Meeting was a discussion club; nothing changes | Every meeting should produce at least one action item, or it should have been an email |
| Decisions not marked inline | Hard to find what was actually decided | Use `[D]` prefix to mark decisions as they happen |