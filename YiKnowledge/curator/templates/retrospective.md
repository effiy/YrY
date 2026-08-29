---
title: Retrospective Template
aliases: [retrospective-template, retro-template, sprint-retrospective]
tags: [template, retrospective, process, agile, engineer]
category: curator/templates
created: 2026-08-24
updated: 2026-08-24
source: internal
type: template
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer, leader, producter]
benefit: "Teams run consistent retrospectives that produce actionable improvements, not just complaint sessions"
acceptance_criteria:
  - "4 sections: What Went Well, What Didn't, Root Causes, Action Items"
  - "includes 5-Why prompt for root cause analysis"
  - "action items are assigned with due dates"
related:
  - ./README.md
  - ./knowledge-leaf.md
  - ./meeting-notes.md
  - ../../engineer/learn/lessons/
---

# Retrospective Template

> **When to use:** After every sprint, release, incident, or project milestone. A retrospective turns experience into process improvement.

## Context

- **Period:** {{sprint name, dates, or event}}
- **Team:** {{team name}}
- **Facilitator:** {{name}}
- **Participants:** {{names}}

## 1. What Went Well

> Celebrate wins. What should we keep doing?

- {{Win 1 — be specific, not "communication was good"}}
- {{Win 2}}
- {{Win 3}}

## 2. What Didn't Go Well

> Be honest, be blameless. What slowed us down or caused pain?

- {{Problem 1 — describe the impact, not the person}}
- {{Problem 2}}
- {{Problem 3}}

## 3. Root Cause Analysis

> For each significant problem, dig deeper. Use 5-Whys.

**Problem:** {{restate the problem}}

| Why # | Answer |
|---|---|
| 1. Why did this happen? | {{answer}} |
| 2. Why? | {{answer}} |
| 3. Why? | {{answer}} |
| 4. Why? | {{answer}} |
| 5. Why? | {{root cause}} |

**Root cause:** {{one sentence}}

## 4. Action Items

> Concrete, assigned, time-bound. No action item = no improvement.

| # | Action | Owner | Due date | Success criteria |
|---|---|---|---|---|
| 1 | {{Start with a verb}} | {{name}} | {{YYYY-MM-DD}} | {{How we know it's done}} |
| 2 | {{Start with a verb}} | {{name}} | {{YYYY-MM-DD}} | {{How we know it's done}} |
| 3 | {{Start with a verb}} | {{name}} | {{YYYY-MM-DD}} | {{How we know it's done}} |

## 5. Follow-up from Last Retrospective

> Did we complete last retro's action items?

| Last retro action | Status | Outcome |
|---|---|---|
| {{Action from last retro}} | Done / In progress / Dropped | {{What happened}} |

## Anti-patterns

| Anti-pattern | Why it fails | What to do instead |
|---|---|---|
| Action items with no owner | No one is accountable; nothing changes | Every action must have exactly one owner and a due date |
| Vague wins ("teamwork was great") | Not actionable; can't replicate | Be specific: "Daily standups under 10 min saved us 2h/week" |
| Blaming individuals | Destroys psychological safety; root cause stays hidden | Focus on process and systems; assume good intent |
| Too many action items | Team can't realistically complete 15 improvements in one sprint | Limit to 3 action items per retro |