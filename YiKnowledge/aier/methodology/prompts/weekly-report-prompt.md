---
title: Weekly Report Generation Prompt
aliases: [weekly-report-prompt, weekly-summary-prompt, report-prompt]
tags: [prompt, weekly-report, report, generation, summary]
category: aier/methodology/prompts
created: 2026-08-24
updated: 2026-08-24
source: internal
type: prompt
status: stable
lifecycle: active
review_cycle: quarterly
roles: [aier, engineer, leader]
benefit: "AI generates structured weekly reports from git history, chat logs, and task tracking — saving 30+ minutes per person per week"
acceptance_criteria:
  - "covers 3 report types: individual, team, and project"
  - "includes data source integration (git, issues, sessions)"
  - "supports Chinese and English output"
related:
  - ./README.md
  - ./brd-generation-prompt.md
  - ../../../curator/templates/meeting-notes.md
---

# Weekly Report Generation Prompt

## System Prompt

```
You are a weekly report generator. Generate a structured weekly report from the provided data. Be specific, quantify accomplishments, and be honest about challenges.

## Rules
1. **Quantify** — "Fixed bugs" → "Fixed 3 bugs: #123, #456, #789"
2. **Be honest about blockers** — Don't sugarcoat; blockers are signals for help
3. **Use the data, not your memory** — Only report what's in the provided data
4. **Group by theme** — Cluster related work together
5. **Keep it concise** — Each bullet is one sentence

## Report Structure
### 本周完成 (This Week Done)
- {{bullet points of completed work}}

### 进行中 (In Progress)
- {{bullet points of work in progress, with % complete}}

### 下周计划 (Next Week Plan)
- {{bullet points of planned work}}

### 风险和阻碍 (Risks & Blockers)
- {{bullet points of blockers or risks}}

## Data Sources
{{data}}
```

### Variables

| Variable | Meaning | Example |
|---|---|---|
| `{{data}}` | Git commits, issue updates, session notes | `git log --since="1 week ago" --author="name"` |

## Variant 1: Individual Report

```
Generate a weekly report for {{name}} based on the following data:

## Git Commits
{{git_log}}

## Issues Updated
{{issue_updates}}

## Meeting Notes
{{meeting_notes}}

Output in {{language}}.
```

## Variant 2: Team Report

```
Generate a team weekly report aggregating the following individual reports:

{{individual_reports}}

## Additional Context
- Team size: {{team_size}}
- Sprint goal: {{sprint_goal}}
- Sprint progress: {{sprint_progress}}
```

## Variant 3: Project Report (YiVad)

```
Generate a project weekly report for {{project_name}} based on:

## Issues This Week
{{issues_this_week}}

## Cycle Status
{{cycle_status}}

## Release Status
{{release_status}}

Output a summary suitable for stakeholders.
```

## Data Source Integration

### Git Commits
```bash
git log --since="1 week ago" --author="{{name}}" \
  --pretty=format:"%h %s (%ad)" --date=short
```

### YiVad Issues
```python
# Query YiAi data_service for issue updates this week
issues = await data_service.query_documents(
    cname="issues",
    filter={
        "updated_at": {"$gte": week_ago},
        "assignee": username,
    }
)
```

## Usage Recommendations

| Parameter | Value | Why |
|---|---|---|
| Temperature | 0.1-0.3 | Factual report; creativity is harmful |
| Max tokens | 1000-2000 | Weekly report should be concise |

## Anti-patterns

| Anti-pattern | Why it fails | Fix |
|---|---|---|
| Generating from memory (no data) | AI hallucinates accomplishments | Always provide git log, issue updates, or notes |
| Vague bullets ("Worked on project X") | Report is useless; no one knows what was done | Require quantification: "Merged 3 PRs for X, fixed 2 bugs" |
| Hiding blockers | Problems fester; team can't help | Be explicit about blockers; they're the most important part |
| Report too long | No one reads a 5-page weekly report | Keep it to 10-15 bullets total |