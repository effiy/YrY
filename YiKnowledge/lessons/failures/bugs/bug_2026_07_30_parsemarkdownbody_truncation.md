---
title: parseMarkdownBody regex truncated multi-line description to first line
key: bug_2026_07_30_parsemarkdownbody_truncation
tags:
- parser
- regex
- markdown
category: lessons/failures/bugs
created: '2026-07-30'
updated: '2026-07-30'
source: internal
type: bug
status: resolved
severity: major
priority: p1
project: YiVad
module: api/modules/bug
assignee: claude
reporter: claude
environment: dev (localhost:8848)
affectedVersion: 1.0.0
fixedVersion: 1.0.0
frequency: always
---

## Description
`parseMarkdownBody` in `src/api/modules/bug.ts` used `body.split(/(?=^##\s+|$)/m)` to slice markdown into Description / Steps / Expected / Actual sections. The `m` flag makes `$` match end-of-any-line, so the lookahead `(?=^##\s+|$)` fired at every newline and truncated multi-line descriptions to just their first line. Long-form content written through BugDrawer was silently truncated when read back on the detail page.

## Steps to Reproduce
1. Open the bug drawer, type a multi-line description (two or more paragraphs).
2. Save → markdown body written to ~/YiKnowledge/lessons/failures/bugs/<key>.md.
3. Navigate to the bug detail page.
4. readBugContent → parseMarkdownBody → only the first line of description is returned.

## Expected Result
Full multi-line description preserved on the detail page.

## Actual Result
Only the first line of the description was rendered; the remainder was dropped silently.

## Cause
parseMarkdownBody used `body.split(/(?=^##\s+|$)/m)` to slice the body into Description / Steps / Expected / Actual sections. The `m` (multiline) flag makes `$` match the end of any line, not just the end of the whole string — so the `(?=^##\s+|$)` lookahead fired at every newline. Multi-line descriptions were split at each line boundary, and only the first fragment survived when sections[Description] was assigned.

## Solution
Replaced the regex split with a line-by-line state machine: iterate lines, match `^##\\s+(.+?)\\s*$` to detect section headers, switch `current` section on match, accumulate non-header lines into a per-section buffer. Joining the buffer at the end preserves every line of a multi-line description.
