---
title: 1on1 Template
aliases:
- 1on1-template
- one-on-one-template
tags:
- template
- 1on1
- management
- feedback
category: knowledge-curator/templates
created: 2026-07-31
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: template
status: stable
lifecycle: active
review_cycle: yearly
roles:
- knowledge-curator
- engineer
- product-manager
- tech-lead
- ai-engineer
- new-hire
benefit: template reusable
acceptance_criteria:
  - "all placeholders are annotated with expected content type"
  - "field descriptions include required-vs-optional and format constraints"
  - "usage guidance explains when to use this template and common mistakes"
related:
- ./meeting-notes.md
- ./retrospective.md
- ../people/README.md
- ../../product-manager/delivery/README.md
tacit: false
---

# 1on1 Template

> **As a** knowledge curator, **I want to** one on one, **so that** template reusable. 

> A recurring one-on-one communication template for managers and below. Popularized by Ben Horowitz; systematized by Camille Fournier in *Managers' Path*. The 1on1 is where employees grow and where feedback happens at the core scenario, not a status report. 

## Summary

- Employee-led: let the employee speak first, at least 10 minutes
- Two-way feedback: manager to employee + employee to manager
- Five segments: employee topic -> feedback -> growth and development -> action items -> next topic
- Be on time, do not cancel, not at the desk, keep it confidential
- Status goes in a separate doc; the 1on1 is about growth and feelings

## Template body

```markdown
# 1on1: {Employee Name} x {Manager Name}

**Date**: YYYY-MM-DD
**Cadence**: Weekly / Biweekly
**This week's focus**: {one-sentence theme}

## 1. Employee-led topic (10-15 minutes)

Let the employee speak first. Common guiding questions:
- What excited / frustrated you this week?
- Any blockers I can help with?
- Any feedback for me or the team?

Notes:
- {Point 1}
- {Point 2}

## 2. Feedback (5-10 minutes)

### Manager feedback to employee

- **Keep**: What went well this week (specific event + data + reason)
 - {item}
- **Improve**: What could be better (specific event + expectation + suggestion)
 - {item}

### Employee feedback to manager

- {item}

## 3. Growth and development (5-10 minutes)

- Short-term goals (this quarter): {1-2 items}
- Long-term direction (6-12 months): {1-2 items}
- Learning resources / mentor matching: {suggestions}

## 4. Action items

| # | Action | Owner | Due date |
|---|---|---|---|
| 1 | {action} | {name} | YYYY-MM-DD |
| 2 |... |... |... |

## 5. Next topic (schedule)

- {points}
```

## Field explanations

| Field | Required | Spec |
|---|---|---|
| Employee-led topic | Yes | Employee speaks first, at least 10 minutes |
| Feedback | Yes | Two-way, with specific events |
| Action items | Yes | Owner + due date |
| Growth and development | Recommended | At least once every two months |
| Next topic | Recommended | Schedule the next topic |

## Usage suggestions

1. **Employee-led**: 90% of the time the employee talks (ideal state); for new hires or during crisis periods the manager can speak more
2. **Not at the desk**: Change spaces, lower the pressure of hierarchy
3. **On time, do not cancel**: Treat it as non-urgent; if cancelled, reschedule same day
4. **Not a status report**: Status goes in a separate doc; the 1on1 is about growth and feelings
5. **Confidentiality**: Personal information shared by the employee must not be disclosed outside
6. **Follow up on action items**: Last cycle's action items must be reviewed
7. **Keep notes brief**: Not verbatim; record key points + actions

### Cadence

| Employee type | Frequency |
|---|---|
| New hire (before 3 months) | Weekly |
| Senior, stable | Biweekly |
| Highly self-driven independent contributor | Monthly (but can be booked anytime) |
| Crisis period / major change | Ad hoc |

### Relationship with IDP

- The 1on1 is about short-term growth and feedback
- The IDP (individual development plan) is about 6-12 month long-term
- The 1on1 is the execution cadence of the IDP

## Anti-patterns

| Anti-pattern | Symptom | Fix |
|---|---|---|
| Manager monologue | 1on1 turns into a report | Employee speaks first, manager speaks after |
| Status report | Rehashing project progress | Use a separate doc |
| Frequent cancellations | 1on1 priority is lowest | Bind strongly to the calendar; no arbitrary cancellation |
| Vague feedback | "Not bad" | Use specific events + data |
| No follow-up | Action items are left hanging | Must review last cycle's items |
| Personal privacy disclosed outside | Trust collapses | Strict confidentiality |

## Related

- Meeting minutes: [meeting-notes-template.md](./meeting-notes.md)
- Retrospective: [retrospective-template.md](./retrospective.md)
- People management: [../people](../people)
- Instance archive: [../../product-manager/meetings](../../product-manager/delivery)

## Reference materials

- Ben Horowitz — *The Hard Thing About Hard Things* (1on1 chapter)
- Camille Fournier — *The Manager's Path*
- Julie Zhuo — *The Making of a Manager*
