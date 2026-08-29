---
title: Usability Test Report Template
aliases: [usability-test-template, usability-report-template]
tags: [template, usability, testing, ux, producter]
category: curator/templates
created: 2026-08-24
updated: 2026-08-24
source: internal
type: template
status: stable
lifecycle: active
review_cycle: quarterly
roles: [producter, engineer]
benefit: "Producters produce consistent usability test reports with severity-rated findings and actionable fixes"
acceptance_criteria:
  - "5 sections: Test Plan, Participants, Findings, Severity Summary, Recommendations"
  - "findings rated by severity (critical/major/minor/cosmetic)"
  - "each finding includes observed behavior, expected behavior, and recommendation"
related:
  - ./README.md
  - ./knowledge-leaf.md
  - ./user-research-interview.md
---

# Usability Test Report Template

> **When to use:** After a usability testing session. Documents what was tested, what was observed, and what should change. Distinct from a user research interview (which explores needs) — this evaluates a specific design.

## 1. Test Plan

### What We Tested

- **Product/feature:** {{what was tested}}
- **Version:** {{build/version}}
- **Environment:** {{staging / production / prototype}}
- **Date:** {{YYYY-MM-DD}}

### Test Tasks

> What we asked participants to do.

| # | Task | Success criteria |
|---|---|---|
| 1 | {{Task description}} | {{What counts as success}} |
| 2 | {{Task description}} | {{What counts as success}} |
| 3 | {{Task description}} | {{What counts as success}} |

## 2. Participants

| # | Role | Experience level | Task completion |
|---|---|---|---|
| 1 | {{role}} | {{novice/intermediate/expert}} | 3/3 |
| 2 | {{role}} | {{novice/intermediate/expert}} | 2/3 |
| 3 | {{role}} | {{novice/intermediate/expert}} | 1/3 |

## 3. Findings

> Each finding rated by severity: **Critical** (can't complete task), **Major** (significant difficulty), **Minor** (annoyance), **Cosmetic** (visual only).

| # | Severity | Task | Observed Behavior | Expected Behavior | Recommendation |
|---|---|---|---|---|---|
| 1 | {{Critical/Major/Minor/Cosmetic}} | {{Task #}} | {{What the user did}} | {{What should have happened}} | {{How to fix}} |
| 2 | {{severity}} | {{Task #}} | {{What the user did}} | {{What should have happened}} | {{How to fix}} |

## 4. Severity Summary

| Severity | Count | Description |
|---|---|---|
| Critical | {{N}} | {{Tasks that couldn't be completed}} |
| Major | {{N}} | {{Tasks with significant difficulty}} |
| Minor | {{N}} | {{Annoyances that didn't block completion}} |
| Cosmetic | {{N}} | {{Visual issues}} |

### Task Completion Rates

| Task | Completion rate | Avg. time | Notes |
|---|---|---|---|
| {{Task 1}} | {{X/3}} | {{seconds}} | {{Observations}} |
| {{Task 2}} | {{X/3}} | {{seconds}} | {{Observations}} |

## 5. Recommendations

### Must Fix (Before Release)

1. {{Fix for critical finding}}
2. {{Fix for critical finding}}

### Should Fix (Next Sprint)

1. {{Fix for major finding}}
2. {{Fix for major finding}}

### Nice to Fix (Backlog)

1. {{Fix for minor/cosmetic finding}}

## Anti-patterns

| Anti-pattern | Why it fails | What to do instead |
|---|---|---|
| Reporting without severity ratings | Team can't prioritize; everything feels equally urgent | Rate every finding: Critical → Major → Minor → Cosmetic |
| Testing with team members | They know the product too well; can't simulate real users | Recruit participants who match the target user profile |
| No task completion data | Can't tell if the design actually works | Measure and report completion rate + time per task |
| Findings without recommendations | Dumps problems on the team without solutions | Every finding should include a concrete recommendation |