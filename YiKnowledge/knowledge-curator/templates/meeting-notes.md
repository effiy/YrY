---
title: Meeting notes template
aliases:
- meeting-notes-template
- meeting-template
tags:
- template
- meeting
- notes
- agile
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
- ./retrospective.md
- ./one-on-one.md
- ../../ai-engineer/methodology/prompts--weekly-report.md
- ../../product-manager/delivery/README.md
tacit: false
---

# Meeting notes template

> **As a** knowledge curator, **I want to** meeting notes, **so that** template reusable.

> General-purpose template for review, alignment, decision, and retrospective meetings. Follow the principle of "no agenda, no meeting; no notes, no closure." Send the agenda 24h before the meeting; circulate notes within 24h after.

## Summary

- Five-section structure: Agenda → Discussion points → Decisions → Action items → Unresolved items (Parking Lot)
- Decisions must tag the decision method (consensus / vote / chair call)
- Action items must include owner + due date + verification method
- Any single topic unresolved after 15 minutes moves offline
- Notes sent within 24h; Parking Lot retained permanently

## Template body

```markdown
# {Meeting topic}

**Date**: YYYY-MM-DD
**Time**: HH:MM - HH:MM (duration X minutes)
**Chair**: {name}
**Participants**: {name1, name2, ...}
**Absentees**: {name} (if applicable)
**Meeting type**: Review / Alignment / Decision / Retrospective / Brainstorm

## 1. Agenda

1. {Agenda item 1}
2. {Agenda item 2}
3. ...

## 2. Discussion points

### Agenda 1: {Title}

- {Point}
- {Divergence}
- {Data / evidence}

### Agenda 2: {Title}

- ...

## 3. Decisions

| # | Decision | Method | Owner | Due date |
|---|---|---|---|---|
| 1 | {decision} | Consensus / Vote / Chair call | {name} | YYYY-MM-DD |
| 2 | ... | ... | ... | ... |

## 4. Action items

| # | Action | Owner | Due date | Verification |
|---|---|---|---|---|
| 1 | {action} | {name} | YYYY-MM-DD | {metric / artifact} |
| 2 | ... | ... | ... | ... |

## 5. Unresolved items (Parking Lot)

- {Item} → defer to next meeting / handle async
- ...

## 6. Next meeting

- Time: YYYY-MM-DD HH:MM
- Agenda: {points}

## Appendix: Related materials

- {Links to PRD / design / data / previous meeting notes}
```

## Field explanations

| Field | Required | Standard |
|---|---|---|
| Agenda | Yes | Sent before meeting; not modified during |
| Decisions | Yes | Decision method must be tagged |
| Action items | Yes | Owner + due date + verification |
| Unresolved items | Recommended | Do not lose |
| Related materials | Recommended | Link |

## Usage tips

- **No agenda, no meeting**: Agenda sent 24h before the meeting
- **No notes, no closure**: Notes sent within 24h
- **15-minute rule**: Any single topic unresolved after 15 minutes moves offline
- **Action items must be executable**: Each item has a clear deliverable; not "discuss X"
- **Decisions traceable**: Record rationale and supporting evidence
- **Meeting type must be tagged**: Different types have different cadence (review meetings require reading materials beforehand; decision meetings require options ready beforehand)

## Anti-patterns

| anti-patterns | Symptom | Fix |
|---|---|---|
| Vague agenda | "Discuss the BRD" | Write specific topics and expected outputs |
| Vague decisions | "Reached consensus" | Write the specific decision |
| Action items without owner | "Team to follow up" | Owner is required |
| Delayed notes | > 24h | Send same day |
| Lost unresolved items | Nobody remembers next time | Parking Lot retained permanently |
| No verification method | Unknown whether completed | Metric / artifact required |

## Related

- Retrospective meeting template: [retrospective-template.md](./retrospective.md)
- 1on1 template: [one-on-one-template.md](./one-on-one.md)
- Companion prompt: [../../ai-engineer/methodology/prompts--weekly-report.md](../../ai-engineer/methodology/prompts--weekly-report.md)
- Instance archive: [../../product-manager/meetings](../../product-manager/delivery)
