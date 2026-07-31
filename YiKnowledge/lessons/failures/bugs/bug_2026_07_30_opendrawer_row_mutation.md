---
title: openDrawer mutated scope.row to inject content fields, polluting ProTable row
  state
key: bug_2026_07_30_opendrawer_row_mutation
tags:
- state-mutation
- protable
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
module: views/bug
assignee: claude
reporter: claude
environment: dev (localhost:8848)
affectedVersion: 1.0.0
fixedVersion: 1.0.0
frequency: sometimes
---

## Description
In src/views/bug/index.vue, openDrawer('Edit', row) called readBugContent(row.contentPath) and then injected description / expectedResult / actualResult directly into scope.row via (row as any).description = c.description, etc. Those fields are not part of BugDocument — they live in the markdown body — so the injection polluted the ProTable row's data. Worse, if the same row was edited twice and the second readBugContent failed (network blip / file missing), the row still carried the stale injected description from the first successful fetch, so the drawer would show the wrong content. rowToDrawer also read those fields back via (row as any).description, making the mutation load-bearing.

## Steps to Reproduce
1. Open /bug/list in YiVad.
2. Click Edit on a bug whose markdown body has a description — drawer opens with the description populated (injection succeeds).
3. Close the drawer without saving.
4. Simulate readBugContent failing (e.g. rename the markdown file).
5. Click Edit on the same bug again — the drawer still shows the description from step 2, even though the file is now unreadable.

## Expected Result
Drawer fields reflect the current readBugContent result each time; ProTable row state is never mutated.

## Actual Result
Content fields were written into scope.row; on intermittent read failure the drawer showed stale data from a previous successful fetch.

## Cause
openDrawer(Edit, row) called readBugContent(row.contentPath) and then injected the returned description / expectedResult / actualResult directly into scope.row via (row as any).description = c.description, etc. These fields are not part of BugDocument — they belong to the markdown body — so the injection polluted ProTable row state. rowToDrawer also read those fields back from row via (row as any).description, making the mutation load-bearing: the drawer trusted row-attached content over a fresh readBugContent result, so a later failed fetch left the drawer showing stale content from an earlier successful fetch.

## Solution
rowToDrawer now accepts content as a separate parameter and never reads description / expectedResult / actualResult back from row. openDrawer fetches content via readBugContent and passes it through to rowToDrawer without mutating scope.row. On read failure the catch branch leaves content undefined, so rowToDrawer defaults the content fields to "" — the drawer shows blank fields instead of stale data.
