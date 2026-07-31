---
title: bug detail.vue left an <el-icon> tag unclosed before a sibling <div>, Vue compiler raised Element is missing end tag
key: bug_2026_07_30_detail_vue_unclosed_el_icon
tags:
- vue
- template
- unclosed-tag
- build-blocker
category: lessons/failures/bugs
created: '2026-07-30'
updated: '2026-07-30'
source: internal
type: bug
status: resolved
severity: major
priority: p1
project: YiVad
module: views/bug/detail
iteration: 2026-S1
defectUrl: ''
assignee: claude
reporter: claude
environment: dev (rsbuild build:dev)
affectedVersion: 1.0.0
fixedVersion: 1.0.0
frequency: always
---

## Description
`pnpm build:dev` failed with `VueCompilerError: Element is missing end tag.` at `src/views/bug/detail.vue:88:13`. The line in question rendered an `<el-icon>` containing three sibling icon components (`<CircleCheck />`, `<Loading />`, `<Warning />`), each conditionally rendered via `v-if` / `v-else-if` / `v-else` — but the closing `</el-icon>` tag was missing. The next non-whitespace sibling was a `<div>` on the following line, so the Vue compiler interpreted the `<div>` as a child of `<el-icon>`, then hit the end of the parent element without ever seeing `</el-icon>` and aborted.

## Steps to Reproduce
1. Open `src/views/bug/detail.vue`.
2. Locate the impact strip's lifecycle cell around line 87-93.
3. Observe line 88: `<el-icon><CircleCheck v-if="..." /><Loading v-else-if="..." /><Warning v-else />` — the `<el-icon>` opening tag has three self-closed icon children but no `</el-icon>` close before the `<div>` on line 89.
4. `pnpm build:dev` → `VueCompilerError: Element is missing end tag.` at `detail.vue:88:13`.

## Expected Result
Every opening element tag in a Vue SFC template has a matching close tag (or is self-closed via `/>`).

## Actual Result
The `<el-icon>` was opened, populated with self-closed icon children, and then never closed — the following `<div>` was unintentionally absorbed as a child of `<el-icon>` and the compiler aborted.

## Cause
Manual template authoring — when an `<el-icon>` has multiple self-closed children it's easy to read the trailing `/>` of the last icon as if it closes the parent. Vue's template compiler does not infer a missing close from context; it parses strictly. The bug survived a visual scan because the indentation of the `<div>` on the next line made it look like a sibling. There was no editor-time error because the SFC template was structurally "well-formed" in the XML sense (no overlapping tags), just unterminated.

## Solution
Applied — added the missing `</el-icon>` close at the end of line 88 in `src/views/bug/detail.vue`, so the three self-closed icons are children of `<el-icon>` and the `<div>` on line 89 is a true sibling. Build now proceeds past the bug-detail chunk. Process follow-up (not yet landed): enable `vue-eslint-plugin-vue/vue/no-parsing-error` and `vue/require-end-tags` in `eslint.config.js` so an unclosed element surfaces as a lint error in the editor, before the build runs.
