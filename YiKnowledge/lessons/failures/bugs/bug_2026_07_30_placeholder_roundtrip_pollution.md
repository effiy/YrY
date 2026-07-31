---
title: buildMarkdownBody placeholders were parsed back verbatim, polluting drawer
  on re-open
key: bug_2026_07_30_placeholder_roundtrip_pollution
tags:
- markdown
- round-trip
- parser
- bug-page
category: lessons/failures/bugs
created: '2026-07-30'
updated: '2026-07-30'
source: internal
type: bug
status: resolved
severity: minor
priority: p2
project: YiVad
module: api/modules/bug
iteration: ''
defectUrl: ''
assignee: claude
reporter: claude
environment: dev (localhost:8848)
affectedVersion: 1.0.0
fixedVersion: 1.0.0
frequency: always
---

## Description
src/api/modules/bug.ts::buildMarkdownBody writes italic placeholder text for every section when the field is empty — e.g. '_No description provided._', '_Not specified._', '_Root cause not yet recorded._', '_Solution not yet recorded._'. parseMarkdownBody read each section's body verbatim, so when a user saved a bug without filling Cause/Solution (the common case — those fields are only filled when status moves to resolved), the markdown body still had the placeholder strings. On re-open, readBugContent returned those placeholders as the actual causeProblem / solution content, so the drawer's Cause and Solution fields showed '_Root cause not yet recorded._' as if it were user input. If the user then saved again without clearing the placeholder, it got persisted as the actual root-cause text. Same shape applied to Description / Expected / Actual, but those are typically populated so it went unnoticed.

## Steps to Reproduce
1. Open /bug/list in YiVad, click Add Bug.
2. Fill title + project + severity etc. but leave Cause and Solution empty.
3. Save — markdown file is written with sections containing placeholder strings.
4. Re-open the same bug in Edit drawer.
5. Cause field shows '_Root cause not yet recorded._' and Solution field shows '_Solution not yet recorded._' as pre-filled text.

## Expected Result
Empty fields stay empty on re-open so the user can enter real content.

## Actual Result
Placeholder strings were parsed back as field content, polluting the drawer inputs and risking being saved as actual content.

## Cause
`buildMarkdownBody` writes italic placeholder text for every empty section (`_No description provided._`, `_Root cause not yet recorded._`, etc.) so the markdown file looks well-formed when read by a human or by YiKnowledge's scanner. `parseMarkdownBody` then read each section's body verbatim — no logic to recognize the placeholders and convert them back to empty strings. So `causeProblem` and `solution` (which are usually empty at bug creation time, since the resolution fields are filled only when status moves to resolved) came back as `_Root cause not yet recorded._` on re-open, pre-filling the drawer's Cause/Solution textareas with placeholder text. A subsequent save without clearing would persist the placeholder as the actual content.

## Solution
Introduced a `PLACEHOLDERS` set of known placeholder strings and a `stripPlaceholder()` helper. `parseMarkdownBody` now runs each parsed section through `stripPlaceholder()`, so known placeholders come back as empty strings — the drawer opens with empty Cause/Solution fields ready for real input. The placeholder strings still get written to disk by `buildMarkdownBody` (so the markdown file remains well-formed for readers), they just don't round-trip back as content.
