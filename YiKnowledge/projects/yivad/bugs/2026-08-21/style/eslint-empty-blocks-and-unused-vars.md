---
title: 多个组件存在空代码块和未使用变量导致 ESLint 报错
tags: [bug, eslint, empty-block, unused-vars, lint]
category: bugs/style
created: 2026-08-21
updated: 2026-08-21
source: internal
type: bug
status: resolved
severity: trivial
priority: p3
project: YiVad
module: Multiple
assignee: ruiyi
reporter: ruiyi
environment: development
affectedVersion: 1.0.0
fixedVersion: 1.0.1
---

## Description

ESLint 扫描发现 10 个 error 级别的 lint 问题：
- 3 处空代码块（`no-empty`）：`Grid/index.vue`、`form/dynamicForm/index.vue`、`form/validateForm/index.vue`
- 2 处未使用变量（`no-unused-vars`）：`CategoryTree.vue`、`spreadsheet/index.vue`
- 1 处不可见空白字符（`no-irregular-whitespace`）：`useMarkdown.ts` 中零宽字符直接写在正则表达式里
- 1 处误导性字符类（`no-misleading-character-class`）：同上
- 1 处无效 eslint-disable 指令：`useKnowledgeBase.ts` 引用了不存在的规则

## Steps to Reproduce

1. 运行 `npx eslint src/ --ext .ts,.vue`
2. 观察 10 个 error

## Expected Result

ESLint 零错误。

## Actual Result

10 个 error 分布在 7 个文件中。

## Cause

1. **空代码块**: 表单验证回调中 `if (valid) {} else {}` 未处理任何逻辑，是开发过程中的占位代码
2. **未使用变量**: `v-for="(row, ri)"` 中 `ri` 未使用；`#default="{ node, data }"` 中 `node` 未使用
3. **零宽字符**: `useMarkdown.ts` 中清理 Unicode 零宽字符的正则表达式直接写了不可见字符，应使用 Unicode 转义序列
4. **无效 eslint-disable**: 引用了项目中不存在的 `@typescript-eslint/no-explicit-any` 规则

## Solution

1. 空代码块：补充有意义的处理逻辑（表单验证成功/失败消息）
2. 未使用变量：移除或用 `_` 前缀标记
3. 零宽字符：使用 `\u200B` 等 Unicode 转义序列替代不可见字面量
4. 无效指令：直接删除

## Review

**教训**: 占位代码在提交前应补充完整逻辑或添加注释说明意图。正则表达式中不应直接写不可见字符，应使用 Unicode 转义确保可读性。