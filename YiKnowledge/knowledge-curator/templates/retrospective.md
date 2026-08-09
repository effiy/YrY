---
title: retrospectivetemplate
aliases:
- retrospective-template
- retro-template
tags:
- template
- retrospective
- 5-why
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
- ./meeting-notes.md
- ./one-on-one.md
- ../../ai-engineer/methodology/prompts--weekly-report.md
- ../../engineer/lessons/failures/incident-postmortem.md
- ../../product-manager/delivery/README.md
tacit: false
---

# retrospectivetemplate

> **As a** knowledge curator, **I want to** retrospective, **so that** template reusable. 

> At iteration end, project milestone, or post-incident, a general retrospective template. Blame-free, focused on process and system. Structure: expected vs actual -> Keep -> Problem -> 5-Why root cause -> Action -> commitment. 

## Summary

- General-purpose across three scenarios: iteration retrospective / project retrospective / incident retrospective
- Mandates writing "what went poorly" + 5-Why root cause to avoid praise-meeting style retrospectives
- Improvement actions must include owner, due date, and verification method
- At the start of the next iteration, must review completion of the previous iteration's improvements
- Companion prompt: [weekly-report-prompt.md](../../ai-engineer/methodology/prompts--weekly-report.md) retrospective variant

## Template body

```markdown
# {project/iteration/incident} retrospective

**Date**: YYYY-MM-DD
**Participants**: {list}
**Retrospective type**: iteration retrospective / project retrospective / incident retrospective
**Retrospective period**: YYYY-MM-DD ~ YYYY-MM-DD

## 1. Expected vs Actual

| Dimension | Plan | Actual | Delta |
|---|---|---|---|
| Goal | {OKR / key results} | {actual completion} | +X% / -X% |
| Schedule | {planned dates} | {actual dates} | +X days |
| Resources | {budgeted headcount} | {actual headcount} | +/- |

## 2. What went well (Keep) 

- {3-5 items, with data and reasons}
- Example: Day-one hallucination rate of 2% after BRD launch, due to dual safeguards of eval set + faithfulness post-processing
- ...

## 3. What went poorly (Problem) 

- {3-5 items, with impact and reasons}
- Example: Multi-language terminology drift rate of 15%, due to insufficient glossary coverage
- ...

## 4. Root cause analysis

For each "what went poorly" item, do 5-Why: 

### Problem 1: {description}

- Why 1: {reason}
- Why 2: {deeper reason}
- Why 3: {deeper reason}
- Why 4: {deeper reason}
- Why 5: {root cause}

**Root cause**: {one sentence}

## 5. Improvement actions (Action) 

| # | Improvement | Owner | Due date | Verification |
|---|---|---|---|---|
| 1 | {action} | {name} | YYYY-MM-DD | {metric / artifact} |
| 2 | ... | ... | ... | ... |

## 6. Next-cycle commitments

- {3-5 items, quantifiable}
- ...

## 7. Retrospective conclusion

- {1-2 sentence summary}

## Appendix: Data and evidence

- {links to metric dashboards, PR lists, user feedback}
```

## Field explanations

| Field | Required | Convention |
|---|---|---|
| Date | Yes | ISO format |
| Expected vs Actual | Yes | Quantified |
| Went well / poorly | Yes | 3-5 items each |
| Root cause analysis | Yes | At least 1 item with 5-Why |
| Improvement actions | Yes | Owner + due date + verification |
| Next-cycle commitments | Yes | 3-5 items |
| Data evidence | Recommended | Link |

## Usage tips

- Retrospective type must be tagged (iteration / project / incident); the three have different emphases
- "Went well / poorly" must include data to avoid vagueness
- Do at least one 5-Why to avoid stopping at the surface
- Improvement action owner is required; no owner = will not happen
- Verification method is required: metric or artifact, when to check
- At the start of the next iteration, must review completion of the previous iteration's actions; unfinished ones must give a reason
- Link data evidence to dashboards / PRs / user feedback; do not rely on memory

## Anti-patterns

| Anti-pattern | Symptom | Fix |
|---|---|---|
| Praise meeting | Only writing the good | Mandate writing shortcomings |
| No owner | Vague improvement actions | Require owner + due date |
| No follow-up | Actions quietly dropped | Mandatory review next iteration |
| Blaming individuals | Focusing on who was wrong | Focus on process and system |
| No root cause | Listing problems without digging | At least 1 item with 5-Why |
| No data | "Significant improvement" | Must include data |

## Related

- Companion prompt: [../../ai-engineer/methodology/prompts--weekly-report.md](../../ai-engineer/methodology/prompts--weekly-report.md) (retrospective variant) 
- Meeting notes: [meeting-notes-template.md](./meeting-notes.md)
- 1on1 follow-up: [one-on-one-template.md](./one-on-one.md)
- Incident retrospective: [../../engineer/lessons/failures/incident-postmortem.md](../../engineer/lessons/failure-incident-postmortem.md)
- Archive: [../../product-manager/meetings](../../product-manager/delivery)
