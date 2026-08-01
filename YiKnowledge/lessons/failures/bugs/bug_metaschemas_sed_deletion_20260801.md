---
title: 'sed deletion accidentally removed metaColumns array declaration in meta-schemas.ts'
key: bug_metaschemas_sed_deletion_20260801
tags:
- sed
- syntax-error
- build
- meta-schemas
- indentation
category: lessons/failures/bugs
created: '2026-08-01'
updated: '2026-08-01'
source: internal
type: bug
status: resolved
severity: major
priority: p1
project: YiVad
module: src/views/brd/meta-schemas.ts
iteration: ''
defectUrl: ''
assignee: Claude
reporter: Claude
environment: macOS / zsh
affectedVersion: main (2026-08-01)
fixedVersion: main (post-fix 2026-08-01)
frequency: once
---

## Description

When using `sed` to remove two array elements (`document_id` and `title`) from `brd-documents.metaColumns` in `meta-schemas.ts`, subsequent `sed` operations that attempted to insert a comment overwrote the `metaColumns: [` array declaration line. This left the array elements directly inside the object literal without the `metaColumns` key, causing a SWC parser syntax error:

```
× Unexpected token `{`. Expected identifier, string literal, numeric literal or [ for the computed key
```

The `swc-loader` (Rsbuild's default bundler) failed to parse the file because the object `"brd-documents": {` was immediately followed by `{ key: "version", ...` without a property key — the parser expected a property key (like `metaColumns:`) before the opening `{`.

## Steps to Reproduce

1. Edit `/YiVad/src/views/brd/meta-schemas.ts` — remove `metaColumns: [` line from inside `"brd-documents"` object
2. Run `pnpm dev` or `rsbuild dev`
3. Observe SWC build error at the first `{` that should have been preceded by `metaColumns: [`

## Expected Result

Build succeeds — `metaColumns` array has fewer entries but the array declaration itself is intact.

## Actual Result

Build fails with `× Module build failed (from builtin:swc-loader)` — SWC cannot parse the malformed object literal.

## Cause

Root cause: **Chained `sed` operations without verifying intermediate state.**

The fix involved three `sed` operations:
1. Delete the two meta column entries (lines 218-219) — ✅ correct
2. Insert a code comment after line 217 — overwrote `metaColumns: [` because `sed -i '' '217a\...'` inserted AFTER line 217, but the comment contained escape characters that mangled the original line
3. Delete the remnant duplicate comment line — further mangled the indentation

The cumulative effect: `metaColumns: [` was lost, and the remaining array elements became orphaned inside the object literal with no property key.

## Solution

Restored the missing `metaColumns: [` line via `sed -i '' '216a\...'`, then split the concatenated `metaColumns: [      { key: "version"` onto two separate lines. Final verification: `rsbuild dev` starts successfully on port 8849 and returns HTTP 200.

**Prevention**: When editing TypeScript files with `sed`, prefer the `Edit` tool which does exact string matching, or use `git diff` to verify intermediate state between operations.
