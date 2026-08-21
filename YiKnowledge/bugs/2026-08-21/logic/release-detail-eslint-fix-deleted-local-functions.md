---
title: release/detail.vue ESLint 自动修复删除了本地函数定义导致类型错误
tags: [bug, eslint, auto-fix, vue-tsc, type-error, regression]
category: bugs/logic
created: 2026-08-21
updated: 2026-08-21
source: internal
type: bug
status: resolved
severity: major
priority: p1
project: YiVad
module: Release Detail
assignee: ruiyi
reporter: ruiyi
environment: development
affectedVersion: 1.0.0
fixedVersion: 1.0.1
---

## Description

`release/detail.vue` 中同时存在：
1. 从 `issueService` 导入的 `issueStatusLabel`、`issueStatusTag`、`typeLabel`、`issueTypeTag`
2. 本地同名函数定义（使用 `ISSUE_STATUS_MAP` 和 `ISSUE_TYPE_MAP`）

运行 `eslint --fix` 时，`no-redeclare` 规则将本地函数当作重复声明删除，只保留了导入。但导入的函数依赖 `ISSUE_STATUS_TAG_MAP` 和 `ISSUE_TYPE_TAG_MAP`（与本地函数使用的 `ISSUE_STATUS_MAP` 和 `ISSUE_TYPE_MAP` 不同），导致类型和运行时行为不一致。

随后手动移除导入时，本地函数已被删除，模板中使用的 `issueTypeTag`、`typeLabel`、`issueStatusTag`、`issueStatusLabel` 全部变为未定义。

## Steps to Reproduce

1. 运行 `npx eslint src/ --ext .ts,.vue --fix`
2. 运行 `pnpm type:check`
3. 观察 `release/detail.vue` 报 4 个 `TS2339` 错误

## Expected Result

ESLint 自动修复不应破坏类型检查。

## Actual Result

ESLint 删除了本地函数定义，导致模板引用的函数未定义，`vue-tsc` 报错。

## Cause

`release/detail.vue` 中从 `issueService` 导入了 `issueStatusLabel`、`issueStatusTag`、`typeLabel`、`issueTypeTag`，同时又定义了本地同名函数。ESLint `no-redeclare` 规则将本地函数识别为重复声明并删除。但导入版本和本地版本使用不同的底层常量（`ISSUE_STATUS_TAG_MAP` vs `ISSUE_STATUS_MAP`）。

## Solution

1. 移除从 `issueService` 导入的 `issueStatusLabel`、`issueStatusTag`、`typeLabel`、`issueTypeTag`
2. 添加 `ISSUE_STATUS_MAP` 和 `ISSUE_TYPE_MAP` 导入
3. 恢复本地函数定义

## Review

**教训**: ESLint 的 `--fix` 可能产生非预期的副作用。当 `no-redeclare` 删除函数时，导入版本和本地版本可能有不同的依赖，导致行为变化。导入和本地定义不应共存——应选择一种方式并保持一致。

**改进措施**: 在 CI 中同时运行 `eslint` 和 `vue-tsc`，确保 lint 修复后类型检查仍然通过。