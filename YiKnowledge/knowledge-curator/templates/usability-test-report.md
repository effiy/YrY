---
title: Usability test report template
aliases:
- usability-test-report-template
- usability-test-template
tags:
- template
- usability
- test-report
- ux
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
- ./user-research-interview.md
- ./prd.md
- ../../product-manager/discovery/ux/README.md
tacit: false
---

# Usability test report template

> **As a** knowledge curator, **I want to** usability test report, **so that** template reusable.

> Report template written after a usability test. Participants 5-8 people (Nielsen's rule of thumb: 5 people can uncover 80% of problems). Structure: goal → tasks → metrics → findings → improvements → comparison with design assumptions.

## Summary

- Before the test you must tag: research assumptions, key tasks, success criteria
- Key metrics: completion rate / average duration / error rate / satisfaction (1-7)
- Key findings must include: severity (1-5) + frequency (N/8) + recommended fix
- Improvement suggestions are sorted by P0/P1/P2, must include owner and due date
- After launch, instrument monitoring of key task completion rates; after improvements run a small-scale re-test (3-5 people)

## Template body

```markdown
# {Product/Feature} Usability Test Report

**Test date**: YYYY-MM-DD
**Test lead**: {name}
**Participants**: {N} people (profile: {industry / role / experience})
**Test version**: {version / prototype link}
**Test method**: remote / on-site; moderated / unmoderated

## 1. Test Goals

- Validate hypotheses: {list}
- Key tasks: {3-5 tasks}
- Success criteria: {acceptable completion rate / duration per task}

## 2. Task List

| # | Task | Expected path | Success criteria |
|---|---|---|---|
| 1 | {task description} | {expected steps} | 80% completion rate / < 2 minutes |
| 2 | ... | ... | ... |

## 3. Key Metrics

| Task | Completion rate | Avg duration | Error rate | Satisfaction (1-7) |
|---|---|---|---|---|
| 1 | X% | Y sec | Z% | M |
| 2 | ... | ... | ... | ... |

## 4. Key Findings

### Finding 1: {title}

- Observation: {what was observed}
- Impact: {on user / business}
- Severity: 1-5 (5 = blocker)
- Frequency: {N/8 participants hit it}
- Recommendation: {fix suggestion}

### Finding 2: ...

## 5. Breakdown by Participant

| Participant | Task 1 | Task 2 | ... | Notes |
|---|---|---|---|---|
| P1 | ✓ 1m | ✗ confused by button | ... | {quote} |
| P2 | ... | ... | ... | ... |

## 6. User Quotes

> "I thought this button was submit, but it took me away"
> "The whole flow was smooth, but here I hesitated for 10 seconds"
> — P1, Task 2

## 7. Improvement Suggestions (by priority)

| Priority | Suggestion | Owner | Due date |
|---|---|---|---|
| P0 | {fix blocking issue} | {name} | YYYY-MM-DD |
| P1 | {affects many people} | ... | ... |
| P2 | {polish experience} | ... | ... |

## 8. Comparison with Design Assumptions

| Assumption | Validation result | Notes |
|---|---|---|
| "Users will look at the left column first" | No, most look at the middle column first | {quote} |
| ... | ... | ... |

## 9. Follow-up

- After improvements, run a small re-test (3-5 people)
- After launch, instrument monitoring of key task completion rates

## Appendix: Raw Data

- Task screen recording links
- Notes
- Interview transcripts
```

## Field explanations

| Field | Required | Norm |
|---|---|---|
| Test goal | Yes | Measurable |
| Task list | Yes | 3-5 core tasks |
| Key metrics | Yes | Completion rate / duration / error rate / satisfaction |
| Key findings | Yes | Include severity + frequency |
| Improvement suggestions | Yes | Priority + owner + due date |
| User quotes | Recommended | Boosts persuasiveness |

### Severity grading

| Level | Meaning | Action |
|---|---|---|
| 5 | Blocks task completion | Fix immediately |
| 4 | Most users blocked | Fix this iteration |
| 3 | Some users blocked | Fix next iteration |
| 2 | Minor issue | Can defer |
| 1 | Cosmetic issue | Optional |

## Usage tips

- Before the test, publish an assumption checklist; after the test, verify each one
- Keep the task list to 3-5 core tasks; too many fatigues participants
- Always quote user verbatim; it boosts the persuasiveness of suggestions
- Improvement suggestions must include owner and due date, otherwise nothing gets fixed
- After launch you must instrument and compare; avoid "test looks good but no one watches in production"
- After improvements you must re-test (3-5 people suffice) to close the loop

## Anti-patterns

| Anti-patterns | Symptom | Fix |
|---|---|---|
| Lists problems but gives no suggestions | Report stops at findings | Must give improvement suggestions |
| No user quotes | Weak persuasiveness | Must quote verbatim |
| Completion rate looks good but instrumentation can't see it | No production monitoring | Add instrumentation comparison |
| Improvements not tracked | Quietly dropped | Must have owner and due date |
| One test decides everything | No re-test after improvements | Re-test after improvements |

## Related

- Interview outline: [user-research-interview-template.md](./user-research-interview.md)
- Heuristic evaluation: [../../product-manager/discovery/ux/nielsen-heuristics.md](../../product-manager/discovery/ux/nielsen-heuristics.md)
- PRD template: [prd.md](./prd.md)
