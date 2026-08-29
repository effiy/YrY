---
title: story.ts 缺少 StoryStatus 类型导入导致编译错误
tags: [bug, type-import, story, typescript]
category: bugs/logic
created: 2026-08-21
updated: 2026-08-21
source: internal
type: bug
status: resolved
severity: minor
priority: p2
project: YiVad
module: Story Store
assignee: ruiyi
reporter: ruiyi
environment: development
affectedVersion: 1.0.0
fixedVersion: 1.0.1
---

## Description

`src/stores/modules/story.ts` 在第 287 行使用了 `StoryStatus` 类型作为 `Record` 的泛型参数，但该类型未从 `@/api/modules/story` 导入，导致 `vue-tsc --noEmit` 报错 `TS2304: Cannot find name 'StoryStatus'`。

## Steps to Reproduce

1. 运行 `pnpm type:check`
2. 观察 `src/stores/modules/story.ts(287,39)` 报错

## Expected Result

类型检查通过，无 StoryStatus 相关错误。

## Actual Result

`StoryStatus` 类型未导入，编译失败。

## Cause

`StoryStatus` 在 `@/api/modules/story.ts:12` 中已定义并导出，但在 `stores/modules/story.ts` 的导入列表中遗漏了该类型。

## Solution

在 `stores/modules/story.ts` 的导入列表中添加 `StoryStatus` 类型导入。

## Review

**教训**: 使用未导入的类型时，IDE 通常会有提示，但若类型仅在泛型参数中使用，IDE 提示可能不够明显。CI 中的 `vue-tsc --noEmit` 是最后一道防线。