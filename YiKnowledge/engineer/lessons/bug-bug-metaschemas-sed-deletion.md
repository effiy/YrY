---
title: sed deletion accidentally removed metaColumns array declaration in meta-schemas.ts
aliases:
- bug_metaschemas_sed_deletion_20260801
- metaschemas-sed-deletion-bug
key: bug_metaschemas_sed_deletion_20260801
tags:
- sed
- syntax-error
- build
- meta-schemas
- indentation
- bug
category: engineer/lessons
created: 2026-08-01
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: yearly
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
roles:
- engineer
- tech-lead
- oncall-sre
benefit: failure does not repeat
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ./bug-topicdetail-meta-validation.md
- ../../gotchas/vite-to-rsbuild-migration.md
- ../incident-postmortem.md
tacit: false
---

# sed deletion accidentally removed metaColumns array declaration in meta-schemas.ts

> **As an** engineer, **I want to** bug metaschemas sed deletion, **so that** failure does not repeat.

> A chained sed operation did not validate intermediate state, causing the `metaColumns: [` array declaration line to be overwritten; SWC parse failure.

## Summary

- After deleting two metaColumns entries via sed in `meta-schemas.ts`, a subsequent sed comment-insert overwrote the `metaColumns: [` array declaration line.
- Array elements became orphan attributes inside an object literal; SWC reported `Unexpected token {`.
- Root cause: chained sed operations did not validate intermediate state via `git diff` step by step.
- Fix: restored the `metaColumns: [` line + split the joined line; `rsbuild dev` returned HTTP 200 on port 8849.

## Core viewpoints

- **Text transformation tools are not idempotent by default, and chaining amplifies errors exponentially**: Each sed operation assumes the output of the previous operation is correct; when three operations chain without validation, the error surface is not additive but multiplicative. The only defense is a `git diff` checkpoint after every single transformation, not just at the end of the chain.

- **The `a` (append) command in sed is a line-relative operation, not a content-aware insert**: `sed -i '' '217a\...'` inserts text after line 217 regardless of what that line contains. When the target line is a structural declaration like `metaColumns: [`, any accidental overwrite silently destroys the syntax tree. Structured code files demand content-aware tools, not line-number-based ones.

- **Build-time syntax errors are the cheapest failures you can catch, and the most expensive ones to ship**: SWC parse failures are caught at compile time with zero runtime cost. The fact that this error reached the build step rather than being caught by a pre-commit hook or a `git diff` review means the feedback loop was too long. A `tsc --noEmit` or `rsbuild dev` check after every batch edit would have caught this in seconds.

- **Indentation-sensitive languages (Python, YAML) and bracket-delimited languages (TS, JSON) share the same vulnerability to line-based editing**: The root cause is not sed-specific; any tool that operates on line numbers without understanding the syntax tree can corrupt the structure. The lesson generalizes: never use line-based tools on structured formats without a parse-verify cycle.

- **The fix for a sed-induced corruption is never another sed command without first restoring the baseline**: When the array declaration line is lost, the instinct to "just add another sed" to fix it compounds the original error. The correct sequence is: restore the original file from git, re-apply the intended edits one at a time with `git diff` between each, and only then commit.


- **Chained sed must validate step by step** — three sed segments accumulated misalignment; each segment looked right alone, but combined they swallowed the array declaration line.
- **The escape trap of `sed -i '' '217a\...'`** — comments containing escape characters mangle the original line; a plain `a` command is not equivalent to a pure insert.
- **Prefer the Edit tool for TS files** — exact string matching is safer than sed; sed suits plain-text batch processing.

## Key information

### Symptom

```
× Unexpected token `{`. Expected identifier, string literal, numeric literal or [ for the computed key
```

`swc-loader` (Rsbuild default bundler) parse failure: after `"brd-documents": {` directly followed `{ key: "version", ...`, missing the attribute key (such as `metaColumns:`).

### Steps to Reproduce

1. Edit `/YiVad/src/views/brd/meta-schemas.ts` — delete the `metaColumns: [` line inside the `"brd-documents"` object
2. Run `pnpm dev` or `rsbuild dev`
3. Observe the SWC error about a missing `metaColumns: [` before the first `{`

### Expected vs Actual

- **Expected**: build succeeds; the `metaColumns` array has fewer entries but still parses.
- **Actual**: `× Module build failed (from builtin:swc-loader)`; SWC cannot parse the malformed object literal.

### Root Cause

Chained sed operations did not validate intermediate state:

1. Delete two meta columns (lines 218-219) — ✅ correct
2. Insert a comment after line 217 — overwrote `metaColumns: [`, because `sed -i '' '217a\...'` with escape characters mangled the original line
3. Delete the duplicate comment line — further broke indentation

Cumulative effect: `metaColumns: [` was lost; remaining array elements became orphan attributes inside the object literal, with no attribute key.

## Action recommendations

1. For TS / structured code files, prefer the Edit tool (exact string matching) over sed.
2. When sed must be used, run `git diff` after each operation to validate intermediate state.
3. To fix, first restore the `metaColumns: [` declaration line (`sed -i '' '216a\...'`), then split `metaColumns: [      { key: "version"` onto two lines.
4. Verify: `rsbuild dev` starts successfully + HTTP 200 on port 8849.
5. Add `tsc --noEmit` as a CI gate to catch syntax errors earlier.



- **Chained sed without validating intermediate state** — each segment looks right, but combined they misalign; debug time >> time saved.
- **sed `a` command with escape characters** — `\` or quotes in comments mangle the original line; must use single quotes + heredoc or switch to Edit.
- **Deleting lines without review** — running the build to discover errors; instead, scan `git diff` after each deletion.

## Anti-patterns

- **Running a build only after every sed operation, not after every single one.** Three sed operations chained without intermediate `git diff` checkpoints accumulate misalignment silently. The cost of running `git diff` after each operation is seconds; the cost of debugging a multi-sed corruption is minutes to hours. Checkpointing after every transformation is not optional when chaining more than one sed command.
- **Using line-number-based sed on a file that is actively being edited by other branches or contributors.** The line numbers `217a` and `218-219d` are valid only at the moment the sed command is composed. If another commit adds or removes lines above the target range, the sed command silently operates on the wrong content. Line-number targeting is fragile by design; always prefer content-based matching (the Edit tool) for shared files.
- **Assuming that `sed -i ''` is atomic and leaves the file in a valid state on failure.** The `-i` flag modifies the file in place as each sed expression executes. If the second expression corrupts the file, the first expression's changes are already committed to disk. The original file is lost unless it was committed to git beforehand. Always `git stash` or commit before running destructive in-place sed.
- **Treating syntax errors as a debugging inconvenience rather than a CI gate failure.** The SWC parse error was caught at build time, but it could have been caught earlier with a pre-commit hook running `tsc --noEmit`. If the build step is the first syntax check, the feedback loop is the entire edit-build cycle. Shrink the loop: add a type-check hook that runs on every file save.
- **Treating sed as a general-purpose code editor for structured formats.** sed operates on lines, not syntax trees. TypeScript, JSON, YAML, and Python all have syntax that cannot be safely manipulated by line-based regex. The Edit tool uses exact string matching and is the correct tool for structured code. Reserve sed for plain-text batch operations on unstructured files (logs, CSVs, configuration dumps).

## Related

- Same class: [./bug-topicdetail-meta-validation.md](bug-bug-topicdetail-meta-validation.md) — same-period meta-schemas bug
- Upstream: [../../gotchas/vite-to-rsbuild-migration.md](gotcha-vite-to-rsbuild-migration.md) — Rsbuild/SWC parsing migration pitfalls
- Upstream: [../incident-postmortem.md](failure-incident-postmortem.md) — retrospective form (simplified version of this entry)
