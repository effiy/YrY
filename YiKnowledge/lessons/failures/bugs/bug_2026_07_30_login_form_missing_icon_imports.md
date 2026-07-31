---
title: LoginForm used <user /> and <lock /> without importing User/Lock icons —
  Vue warned "Failed to resolve component: user/lock"
key: bug_2026_07_30_login_form_missing_icon_imports
tags:
- vue
- element-plus
- icons
- regression
category: lessons/failures/bugs
created: '2026-07-30'
updated: '2026-07-30'
source: internal
type: bug
status: resolved
severity: minor
priority: p2
project: YiVad
module: views/login/components/LoginForm
iteration: 2026-S1
defectUrl: ''
assignee: claude
reporter: user
environment: dev (browser runtime, http://localhost:8848/#/login)
affectedVersion: 1.0.0
fixedVersion: 1.0.0
frequency: always
---

## Description
`src/views/login/components/LoginForm.vue` used `<user />` and `<lock />` (lowercase) inside the `<el-icon>` prefix slots of its two `<el-input>` fields, but the `<script setup>` block only imported `CircleClose` and `UserFilled` from `@element-plus/icons-vue` — it never imported the `User` or `Lock` icon components. Vue treats lowercase tags as custom elements when no matching component is registered, so every render of the login form emitted two `Failed to resolve component: user` / `Failed to resolve component: lock` warnings to the browser console. The icon prefix on both input fields rendered as empty `<user />` / `<lock />` DOM nodes instead of the intended user/lock glyphs.

## Steps to Reproduce
1. Open `http://localhost:8848/#/login`.
2. Open DevTools console.
3. Observe two warnings on first paint: `[Vue warn]: Failed to resolve component: user` and `[Vue warn]: Failed to resolve component: lock`.
4. Inspect the username input's prefix slot — the rendered DOM shows empty `<user>` and `<lock>` elements (no SVG, no icon).

## Expected Result
The username input has a user-icon prefix and the password input has a lock-icon prefix, both rendered from `@element-plus/icons-vue` components. No Vue warnings in console.

## Actual Result
Console showed unresolved-component warnings on every login render. The icon prefix slots were empty.

## Cause
The login form had been written with kebab-case `<user />` / `<lock />` in the template (which Vue treats as a component reference, resolving case-insensitively to `User` / `Lock` if imported). The script block imported two other icons (`CircleClose`, `UserFilled`) for the buttons below, but `User` and `Lock` were forgotten. `unplugin-vue-components` with `ElementPlusResolver` only auto-imports `el-*` Element Plus components — it does NOT auto-import icons from `@element-plus/icons-vue`. Icon components must be imported explicitly by name. So Vue had no `User` or `Lock` in scope and emitted the unresolved-component warning.

## Solution
Added `User, Lock` to the existing `import { ... } from "@element-plus/icons-vue"` statement in `LoginForm.vue`, and changed the template tags from `<user />` / `<lock />` to `<User />` / `<Lock />` (PascalCase, which is the canonical form for imported component references). `vue-tsc --noEmit` passes. No other call sites of `<user />` or `<lock />` exist in the codebase.

Process follow-up: when adding icon components inside `<el-icon>` slots, always add the named import alongside the existing `@element-plus/icons-vue` imports — `unplugin-vue-components`'s `ElementPlusResolver` will not catch them for you. Lowercase `<kebab-case />` in templates should always be a smell check — it means either an imported component was referenced case-insensitively (works but easy to miss when the import is forgotten) or a genuinely unknown custom element.
